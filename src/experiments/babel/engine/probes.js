import frequencies from '../data/english-ngrams.json' with { type: 'json' };
import { coordinateBadgeForSeed } from './coordinates.js';
import { searchText } from './library.js';
import { PAGE_SIZE } from './radix.js';

function own(index, key) {
  return Object.hasOwn(index, key) ? index[key] : [];
}

// Frequency order is retained in each prefix bucket. Work per keystroke is bounded.
const prefixes = new Map();
for (const word of frequencies.words) {
  for (let length = 1; length < word.length; length++) {
    const prefix = word.slice(0, length);
    if (!prefixes.has(prefix)) prefixes.set(prefix, []);
    const matches = prefixes.get(prefix);
    if (matches.length < 5) matches.push(word);
  }
}

export function suggestWords(input) {
  if (!input.trim() || Array.from(input).length >= PAGE_SIZE) return [];
  const unfinished = input.match(/[a-z]+$/i)?.[0] ?? '';
  // A whitespace boundary requests a next word. Other punctuation has no known context.
  if (!unfinished && !/\s$/.test(input)) return [];
  const before = unfinished ? input.slice(0, -unfinished.length) : input;
  const context = before.toLowerCase().match(/(?:^|[^a-z])([a-z]+)(?:\s+([a-z]+))?\s*$/);
  const previous = context?.[2] ?? context?.[1];
  const prefix = unfinished.toLowerCase();
  const matches = words => words.filter(word => word.startsWith(prefix) && word !== prefix);
  const twoWords = context?.[2] ? context[1] + ' ' + context[2] : '';
  const commonPhrases = matches(own(frequencies.phrases, twoWords).length
    ? own(frequencies.phrases, twoWords) : own(frequencies.phrases, previous));
  const trigram = context?.[2] ? matches(own(frequencies.trigrams, context[1] + ' ' + context[2])) : [];
  const bigram = matches(own(frequencies.bigrams, previous));
  const contextual = commonPhrases.length ? commonPhrases : trigram.length ? trigram : bigram;
  const candidates = new Set(contextual.length || !prefix ? contextual : [
    ...(prefix.length >= 3 ? matches(frequencies.common) : []),
    ...(prefixes.get(prefix) ?? []),
  ]);
  if (!candidates.size && prefix && (frequencies.common.includes(prefix) || Object.hasOwn(frequencies.bigrams, prefix))) {
    return suggestWords(input + ' ');
  }
  return [...candidates].slice(0, 5).map(word => {
    const remainder = word.slice(unfinished.length);
    const completed = unfinished + (unfinished === unfinished.toUpperCase() && unfinished.length > 1
      ? remainder.toUpperCase() : remainder);
    return { word: completed, phrase: before + completed, kind: prefix ? 'completion' : 'next' };
  }).filter(({ phrase }) => Array.from(phrase).length <= PAGE_SIZE);
}

export function probeSuggestions(input, mode, exact = false) {
  return suggestWords(input).map(candidate => {
    const target = searchText(candidate.phrase, mode, exact);
    return { ...candidate, ...target, badge: coordinateBadgeForSeed(target.seed) };
  });
}
