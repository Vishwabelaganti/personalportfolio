export const COLUMNS = 80;
export const ROWS = 40;
export const PAGE_SIZE = COLUMNS * ROWS;

// Group digits in exact Number-sized blocks to avoid a BigInt division per cell.
const BLOCK = 2 ** 48;
const SPACE = ' ';

function alphabet(symbols) {
  const digits = new Map(Array.from(symbols, (char, index) => [char, index]));
  return { size: symbols.length, digit: char => digits.get(char) ?? -1, char: index => symbols[index] };
}

export const CLASSIC_SYMBOLS = ' abcdefghijklmnopqrstuvwxyz,.';
const classic = alphabet(CLASSIC_SYMBOLS);
const template = ['bcdfghjklmnpqrstvwxyz', 'aeiou', 'bcdfghjklmnpqrstvwxyz', 'aeiou', ' ,.'].map(alphabet);

const asciiOther = alphabet(Array.from({ length: 128 }, (_, i) => String.fromCodePoint(i))
  .filter(char => classic.digit(char) < 0).join(''));
const otherUnicode = {
  size: 0x110000 - 0x800 - classic.size,
  digit(char) {
    const code = char.codePointAt(0);
    if (code < 128) return asciiOther.digit(char);
    if (code >= 0xd800 && code < 0xe000) return -1;
    return code - classic.size - (code >= 0xe000 ? 0x800 : 0);
  },
  char(index) {
    if (index < asciiOther.size) return asciiOther.char(index);
    const code = index + classic.size;
    return String.fromCodePoint(code >= 0xd800 ? code + 0x800 : code);
  },
};
const unicode = {
  size: classic.size + otherUnicode.size,
  digit(char) {
    const digit = classic.digit(char);
    if (digit >= 0) return digit;
    const other = otherUnicode.digit(char);
    return other < 0 ? -1 : classic.size + other;
  },
  char: index => index < classic.size ? classic.char(index) : otherUnicode.char(index - classic.size),
};

function pack(chars, start, end, slots) {
  let value = 0n, chunk = 0, factor = 1;
  for (let i = start; i < end; i++) {
    const slot = slots[i % slots.length];
    if (factor * slot.size > BLOCK) {
      value = value * BigInt(factor) + BigInt(chunk);
      chunk = 0;
      factor = 1;
    }
    chunk = chunk * slot.size + slot.digit(chars[i] ?? SPACE);
    factor *= slot.size;
  }
  return value * BigInt(factor) + BigInt(chunk);
}

function unpack(value, out, start, end, slots) {
  for (let i = end - 1; i >= start;) {
    const last = i;
    let factor = 1;
    while (i >= start) {
      const next = factor * slots[i % slots.length].size;
      if (next > BLOCK) break;
      factor = next;
      i--;
    }
    const radix = BigInt(factor);
    let chunk = Number(value % radix);
    value /= radix;
    for (let j = last; j > i; j--) {
      const slot = slots[j % slots.length];
      out[j] = slot.char(chunk % slot.size);
      chunk = Math.floor(chunk / slot.size);
    }
  }
}

function makePartition(primary, full, extras) {
  const patternLength = primary.length;
  const group = primary.reduce((product, slot) => product * BigInt(slot.size), 1n);
  const prefix = [1n];
  for (const slot of primary) prefix.push(prefix.at(-1) * BigInt(slot.size));
  const primarySize = length => group ** BigInt(Math.floor(length / patternLength)) * prefix[length % patternLength];
  const radix = BigInt(full.size);
  const powers = new Map([[0, 1n]]);
  function power(length) {
    if (powers.has(length)) return powers.get(length);
    const value = radix ** BigInt(length);
    if (powers.size >= 128) powers.delete(powers.keys().next().value);
    powers.set(length, value);
    return value;
  }
  const fullSlots = [full];
  const preferredSize = primarySize(PAGE_SIZE);
  const size = power(PAGE_SIZE);

  // Pages outside the pattern are grouped by their first mismatched slot.
  // bound(i) counts pages whose first i slots match, so bucket i is [bound(i+1), bound(i)).
  const bound = i => primarySize(i) * power(PAGE_SIZE - i);

  return {
    size,
    preferredSize,
    rank(chars) {
      const matchLength = patternLength === 1 ? chars.length : PAGE_SIZE;
      for (let i = 0; i < matchLength; i++) {
        const slotIndex = i % patternLength;
        const char = chars[i] ?? SPACE;
        if (primary[slotIndex].digit(char) >= 0) continue;
        const extra = extras[slotIndex];
        const remaining = power(PAGE_SIZE - i - 1);
        const padding = power(PAGE_SIZE - Math.max(i + 1, chars.length));
        const before = pack(chars, 0, i, primary);
        const after = pack(chars, i + 1, chars.length, fullSlots) * padding;
        return (primarySize(i + 1) + before * BigInt(extra.size) + BigInt(extra.digit(char))) * remaining + after;
      }
      if (patternLength === 1) return pack(chars, 0, chars.length, primary) * (BigInt(primary[0].size) ** BigInt(PAGE_SIZE - chars.length));
      return pack(chars, 0, PAGE_SIZE, primary);
    },
    unrank(rank) {
      const out = new Array(PAGE_SIZE);
      if (rank < preferredSize) {
        unpack(rank, out, 0, PAGE_SIZE, primary);
      } else {
        let low = 0, high = PAGE_SIZE - 1;
        while (low < high) {
          const middle = Math.floor((low + high) / 2);
          if (rank < bound(middle + 1)) low = middle + 1;
          else high = middle;
        }
        const i = low;
        const extra = extras[i % patternLength];
        const remaining = power(PAGE_SIZE - i - 1);
        const relative = rank - bound(i + 1);
        const front = relative / remaining;
        unpack(front / BigInt(extra.size), out, 0, i, primary);
        out[i] = extra.char(Number(front % BigInt(extra.size)));
        unpack(relative % remaining, out, i + 1, PAGE_SIZE, fullSlots);
      }
      return out.join('');
    },
  };
}

export const orderedCodec = makePartition(template, classic,
  template.map(slot => alphabet(Array.from(CLASSIC_SYMBOLS).filter(char => slot.digit(char) < 0).join(''))));
export const rawCodec = makePartition([classic], unicode, [otherUnicode]);

export const isClassic = chars => chars.every(char => classic.digit(char) >= 0);
export const isUnicode = chars => chars.every(char => unicode.digit(char) >= 0);
