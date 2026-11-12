import { MAX_SEED, modeForSeed, ORDERED } from './library.js';
import { orderedCodec } from './radix.js';

export const FIELDS = [
  { key: 'wall', label: 'Wall', limit: 4 },
  { key: 'shelf', label: 'Shelf', limit: 5 },
  { key: 'volume', label: 'Volume', limit: 32 },
  { key: 'page', label: 'Page', limit: 410 },
];
const PER_HEX = FIELDS.reduce((total, { limit }) => total * BigInt(limit), 1n);
export const MAX_HEX_LENGTH = (MAX_SEED / PER_HEX).toString(36).length;
const REVERSE_FIELDS = [...FIELDS].reverse();
const BADGE_TAIL = 36n ** 4n;
const SIX_DIGITS = 36n ** 6n;
const FIVE_DIGITS = 36n ** 5n;
const badgeScales = new Map();

function parseBase36(text) {
  let value = 0n;
  for (let i = 0; i < text.length; i += 9) {
    const block = text.slice(i, i + 9);
    value = value * 36n ** BigInt(block.length) + BigInt(Number.parseInt(block, 36));
  }
  return value;
}

function coordinates(seed, displayHex) {
  const result = { hexagon: displayHex(seed / PER_HEX) };
  let index = seed % PER_HEX;
  for (const { key, limit } of REVERSE_FIELDS) {
    result[key] = Number(index % BigInt(limit)) + 1;
    index /= BigInt(limit);
  }
  return result;
}

export const coordinateForSeed = seed => coordinates(seed, hex => hex.toString(36));

export function coordinateBadgeForSeed(seed) {
  return coordinates(seed, hex => {
    if (hex < 36n ** 12n) return hex.toString(36);
    // Base-16 formatting is cheap. Estimate the base-36 length, then verify it with exact division.
    const digits = hex.toString(16);
    const leading = Number.parseInt(digits.slice(0, 7), 16);
    const shift = Math.floor(((digits.length - 7) * Math.log(16) + Math.log(leading)) / Math.log(36)) - 5;
    let scale = badgeScales.get(shift);
    if (scale === undefined) {
      scale = 36n ** BigInt(shift);
      if (badgeScales.size < 128) badgeScales.set(shift, scale);
    }
    let prefix = hex / scale;
    if (prefix < FIVE_DIGITS) prefix = hex / (scale / 36n);
    else if (prefix >= SIX_DIGITS) prefix /= 36n;
    return prefix.toString(36) + '…' + (hex % BADGE_TAIL).toString(36).padStart(4, '0');
  });
}

export function seedForCoordinate(coordinate) {
  const hex = String(coordinate.hexagon).trim().toLowerCase();
  if (!hex || hex.length > MAX_HEX_LENGTH || !/^[0-9a-z]+$/.test(hex)) {
    throw new RangeError('Enter a valid base-36 hexagon (letters a–z and digits 0–9).');
  }
  let seed = parseBase36(hex);
  for (const { key, label, limit } of FIELDS) {
    const value = String(coordinate[key]);
    if (!/^\d{1,3}$/.test(value) || Number(value) < 1 || Number(value) > limit) {
      throw new RangeError(`${label} must be between 1 and ${limit}.`);
    }
    seed = seed * BigInt(limit) + BigInt(Number(value) - 1);
  }
  if (seed > MAX_SEED || (modeForSeed(seed) === ORDERED && seed / 2n >= orderedCodec.size)) {
    throw new RangeError('That coordinate is outside the library.');
  }
  return seed;
}

export function formatCoordinate(coordinate) {
  return [coordinate.hexagon, ...FIELDS.map(({ key }) => coordinate[key])].join(':');
}

export function parseCoordinate(text) {
  const parts = text.trim().split(':');
  if (parts.length !== 5) throw new RangeError('Use hexagon:wall:shelf:volume:page.');
  return seedForCoordinate(Object.fromEntries(['hexagon', ...FIELDS.map(({ key }) => key)]
    .map((key, index) => [key, parts[index]])));
}

export const COORDINATE_HASH = '#b1=';
