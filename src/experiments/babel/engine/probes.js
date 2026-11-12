import frequencies from '../data/english-ngrams.json' with { type: 'json' };
import { coordinateBadgeForSeed } from './coordinates.js';
import { lookupText } from './library.js';
import { PAGE_SIZE } from './radix.js';

function own(index, key) {
  return Object.hasOwn(index, key) ? index[key] : [];
}

export function probeNextWords(input, mode) {
  if (!input.trim() || Array.from(input).length >= PAGE_SIZE) return [];
  const context = input.match(/([a-z]+)(?:\s+([a-z]+))?[\s,]*$/i);
  if (!context) return [];
  const first = context[1].toLowerCase();
  const last = context[2]?.toLowerCase();
  const candidates = new Set([
    ...(last ? own(frequencies.trigrams, first + ' ' + last) : []),
    ...own(frequencies.bigrams, last ?? first),
    ...frequencies.fallback,
  ]);
  const prefix = input + (/\s$/.test(input) ? '' : ' ');
  const results = [];
  for (const word of candidates) {
    const phrase = prefix + word;
    try {
      const { mode: targetMode, seed } = lookupText(phrase, mode);
      results.push({ word, phrase, mode: targetMode, seed, badge: coordinateBadgeForSeed(seed) });
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
    if (results.length === 5) break;
  }
  return results;
}
