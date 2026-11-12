import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import test from 'node:test';
import { coordinateBadgeForSeed, coordinateForSeed, formatCoordinate, parseCoordinate, seedForCoordinate } from '../src/experiments/babel/engine/coordinates.js';
import { makePermutation } from '../src/experiments/babel/engine/lcg.js';
import { lookupText, MAX_SEED, nextBrowseSeed, ORDERED, pageForSeed, RAW, searchText } from '../src/experiments/babel/engine/library.js';
import { probeSuggestions, suggestWords } from '../src/experiments/babel/engine/probes.js';
import { orderedCodec, PAGE_SIZE, rawCodec } from '../src/experiments/babel/engine/radix.js';

test('the adapted inverse covers the whole domain, including output zero', () => {
  for (const modulus of [25n, orderedCodec.preferredSize, rawCodec.preferredSize, rawCodec.size - rawCodec.preferredSize]) {
    const { scramble, unscramble } = makePermutation(modulus);
    for (const value of [0n, 1n, 2n, modulus / 2n, modulus - 1n]) {
      assert.equal(unscramble(scramble(value)), value);
      assert.equal(scramble(unscramble(value)), value);
    }
  }
});

test('exact lookup preserves the input at cell one and pads with spaces', () => {
  const samples = [
    [' in the library. ', ORDERED, ORDERED],
    [' in the library. ', RAW, RAW],
    ['baba '.repeat(640), ORDERED, ORDERED],
    ['baba '.repeat(639) + 'baba!', ORDERED, RAW],
    ['\u0000\u007f\u0080\ud7ff\ue000\u{10ffff}A café 中 🪷\n', ORDERED, RAW],
    ['🪷'.repeat(PAGE_SIZE), RAW, RAW],
    [' '.repeat(PAGE_SIZE), ORDERED, ORDERED],
  ];
  for (const [text, preference, space] of samples) {
    const match = lookupText(text, preference);
    assert.equal(match.mode, space);
    assert.equal(match.seed % 2n, space === ORDERED ? 0n : 1n);
    assert.equal(lookupText(text, preference).seed, match.seed);
    const address = formatCoordinate(coordinateForSeed(match.seed));
    assert.equal(parseCoordinate(address), match.seed);
    assert.equal(pageForSeed(parseCoordinate(address)), text + ' '.repeat(PAGE_SIZE - Array.from(text).length));
  }
  assert.throws(() => lookupText('a'.repeat(PAGE_SIZE + 1)), /3,200/);
  assert.throws(() => lookupText('\ud800'), /Unicode/);
});

test('both page spaces are bijective across their preferred and exact-text ranges', () => {
  for (const [mode, codec, parity] of [[ORDERED, orderedCodec, 0n], [RAW, rawCodec, 1n]]) {
    const indexes = [0n, 1n, codec.preferredSize - 1n, codec.preferredSize, codec.size / 2n, codec.size - 1n];
    for (const index of indexes) {
      const seed = index * 2n + parity;
      const page = pageForSeed(seed);
      assert.equal(Array.from(page).length, PAGE_SIZE);
      assert.equal(lookupText(page, mode).seed, seed);
    }
  }
});

test('browse derives the next address from the current one and uses the selected browse alphabet', () => {
  const orderedPattern = /^(?:[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][ ,.]){640}$/;
  const rawPattern = /^[a-z ,.]{3200}$/;
  for (const [mode, pattern] of [[ORDERED, orderedPattern], [RAW, rawPattern]]) {
    let seed = 0n;
    for (let i = 0; i < 3; i++) {
      const next = nextBrowseSeed(seed, mode);
      assert.notEqual(next, seed);
      assert.equal(nextBrowseSeed(seed, mode), next);
      assert.match(pageForSeed(next), pattern);
      seed = next;
    }
  }
});

test('coordinate parsing enforces field bounds and abbreviated hexagons match the exact coordinate', () => {
  for (const seed of [0n, 1n, 409n, 410n, 262399n, 262400n, MAX_SEED, lookupText('rain').seed]) {
    const coordinate = coordinateForSeed(seed);
    const { hexagon } = coordinate;
    const expected = hexagon.length > 12 ? hexagon.slice(0, 6) + '…' + hexagon.slice(-4) : hexagon;
    assert.deepEqual(coordinateBadgeForSeed(seed), { ...coordinate, hexagon: expected });
    assert.equal(seedForCoordinate(coordinate), seed);
  }
  const base = coordinateForSeed(0n);
  for (const [key, value] of [['hexagon', '?'], ['wall', 5], ['shelf', 6], ['volume', 33], ['page', 411]]) {
    assert.throws(() => seedForCoordinate({ ...base, [key]: value }), RangeError);
  }
  assert.throws(() => parseCoordinate(formatCoordinate(coordinateForSeed(MAX_SEED - 1n))), /outside/);
});

test('autocomplete completes the current word and uses preceding context', () => {
  assert.equal(suggestWords('hel')[0].phrase, 'hello');
  assert.equal(suggestWords('comp')[0].phrase, 'computer');
  assert.equal(suggestWords('in the m')[0].phrase, 'in the morning');
  assert.equal(suggestWords('Hel')[0].phrase, 'Hello');
  assert.equal(suggestWords('hello')[0].phrase, 'hello world');
  assert.equal(suggestWords('hello ')[0].phrase, 'hello world');
  assert.deepEqual(suggestWords('I wan').map(result => result.phrase), ['I want', 'I wanted']);
  assert.deepEqual(suggestWords('qzxv '), []);
  assert.deepEqual(suggestWords(''), []);
  assert.deepEqual(suggestWords('a'.repeat(PAGE_SIZE)), []);
});

test('search opens a full deterministic page while exact mode preserves old addresses', () => {
  for (const input of ['hello world', '世界 🪷', 'a'.repeat(PAGE_SIZE), 'x'.repeat(PAGE_SIZE - 1)]) {
    const target = searchText(input, ORDERED);
    const page = pageForSeed(target.seed);
    assert.equal(Array.from(page).length, PAGE_SIZE);
    assert.ok(page.startsWith(input));
    assert.equal(searchText(input, ORDERED).seed, target.seed);
    assert.equal(lookupText(page, target.mode).seed, target.seed);
    assert.equal(searchText(input, ORDERED, true).seed, lookupText(input, ORDERED).seed);
    if (input.length < 100) assert.ok(page.slice(input.length).trim().length > 2500);
  }
});

test('suggestions resolve to the same filled or exact page as a direct search', () => {
  const file = new URL('../src/experiments/babel/data/english-ngrams.json', import.meta.url);
  assert.ok(statSync(file).size < 150_000);
  for (const exact of [false, true]) {
    for (const input of ['hel', 'in the m', 'in the ', 'In the ']) {
      const results = probeSuggestions(input, ORDERED, exact);
      assert.ok(results.length > 0 && results.length <= 5);
      assert.deepEqual(probeSuggestions(input, ORDERED, exact), results);
      assert.equal(new Set(results.map(result => result.phrase)).size, results.length);
      for (const { phrase, seed, badge } of results) {
        assert.ok(phrase.startsWith(input));
        assert.equal(searchText(phrase, ORDERED, exact).seed, seed);
        assert.ok(pageForSeed(seed).startsWith(phrase));
        assert.deepEqual(coordinateBadgeForSeed(seed), badge);
      }
    }
  }
});
