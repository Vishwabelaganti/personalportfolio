import { makePermutation } from './lcg.js';
import { isClassic, isUnicode, orderedCodec, PAGE_SIZE, rawCodec } from './radix.js';

export const ORDERED = 'ordered';
export const RAW = 'raw';

function space(codec, parity) {
  const preferred = makePermutation(codec.preferredSize);
  const literal = makePermutation(codec.size - codec.preferredSize);
  return {
    ...codec,
    seed(index) { return index * 2n + parity; },
    scramble: index => index < codec.preferredSize ? preferred.scramble(index)
      : codec.preferredSize + literal.scramble(index - codec.preferredSize),
    unscramble: rank => rank < codec.preferredSize ? preferred.unscramble(rank)
      : codec.preferredSize + literal.unscramble(rank - codec.preferredSize),
    browse: preferred.scramble,
  };
}

const spaces = { [ORDERED]: space(orderedCodec, 0n), [RAW]: space(rawCodec, 1n) };
export const MAX_SEED = rawCodec.size * 2n - 1n;
export const modeForSeed = seed => seed % 2n === 0n ? ORDERED : RAW;

function getSpace(seed) {
  const mode = modeForSeed(seed);
  const domain = spaces[mode];
  if (seed < 0n || seed / 2n >= domain.size) throw new RangeError('That coordinate is outside the library.');
  return domain;
}

export function pageForSeed(seed) {
  const domain = getSpace(seed);
  return domain.unrank(domain.scramble(seed / 2n));
}

export function lookupText(text, preferredMode = ORDERED) {
  const chars = Array.from(text);
  if (!chars.length) throw new RangeError('Enter text to look up.');
  if (chars.length > PAGE_SIZE) throw new RangeError('A page holds at most 3,200 characters.');
  if (!isUnicode(chars)) throw new RangeError('The text contains an invalid Unicode character.');
  const mode = preferredMode === ORDERED && isClassic(chars) ? ORDERED : RAW;
  const domain = spaces[mode];
  return { mode, seed: domain.seed(domain.unscramble(domain.rank(chars))) };
}

export function nextBrowseSeed(seed, mode = modeForSeed(seed)) {
  const domain = spaces[mode];
  // Each click derives its next address solely from the current address and mode.
  let index = (seed / 2n) % domain.preferredSize;
  for (let i = 0; i < 257; i++) index = domain.browse(index);
  const next = domain.seed(index);
  return next === seed ? domain.seed((index + 1n) % domain.preferredSize) : next;
}

export function searchText(text, mode = ORDERED, exact = false) {
  const result = lookupText(text, mode);
  const length = Array.from(text).length;
  if (exact || length === PAGE_SIZE) return result;
  const separator = /\s$/.test(text) ? '' : ' ';
  const context = pageForSeed(nextBrowseSeed(result.seed, result.mode));
  const fullPage = text + separator + context.slice(0, PAGE_SIZE - length - separator.length);
  return lookupText(fullPage, result.mode);
}
