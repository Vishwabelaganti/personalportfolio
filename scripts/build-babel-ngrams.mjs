import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('../src/experiments/babel/data/english-ngrams.json', import.meta.url);
const [flag, ...files] = process.argv.slice(2);
if (!['--corpus', '--bigrams'].includes(flag) || !files.length || (flag === '--bigrams' && files.length !== 1)) {
  throw new Error('Use --corpus book1.txt book2.txt … or --bigrams count_2w.txt.');
}

const unigrams = new Map();
const lowercaseWords = new Map();
const bigrams = new Map();
const trigrams = new Map();
const count = (map, key, amount = 1) => map.set(key, (map.get(key) ?? 0) + amount);
const ranked = (map, limit) => [...map].sort(([a, n], [b, m]) => m - n || (a < b ? -1 : a > b ? 1 : 0)).slice(0, limit);

if (flag === '--corpus') {
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    const body = text.match(/^\*{3} START OF THE PROJECT GUTENBERG EBOOK[^\r\n]*\r?\n([\s\S]*?)^\*{3} END OF THE PROJECT GUTENBERG EBOOK/m)?.[1] ?? text;
    for (const word of body.match(/\b[a-z]+\b/g) ?? []) count(lowercaseWords, word);
    for (const segment of body.toLowerCase().split(/[.!?;:]+|\r?\n\s*\r?\n/)) {
      const words = segment.match(/[a-z]+/g) ?? [];
      for (let i = 0; i < words.length; i++) {
        count(unigrams, words[i]);
        if (i > 0) count(bigrams, words.slice(i - 1, i + 1).join(' '));
        if (i > 1) count(trigrams, words.slice(i - 2, i + 1).join(' '));
      }
    }
  }
} else {
  const text = await readFile(files[0], 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = /^([a-z]+) ([a-z]+)\t([0-9]+)$/.exec(line);
    if (!match) continue;
    const [, first, second, frequency] = match;
    count(bigrams, first + ' ' + second, Number(frequency));
    count(unigrams, second, Number(frequency));
  }
}

function index(map, limit) {
  const contexts = Object.create(null);
  for (const [phrase] of ranked(map, limit)) {
    const split = phrase.lastIndexOf(' ');
    const context = phrase.slice(0, split);
    (contexts[context] ??= []).push(phrase.slice(split + 1));
  }
  return contexts;
}

if (!bigrams.size) throw new Error('The source contained no usable English bigrams.');
const vocabulary = new Map([...unigrams].filter(([word, frequency]) =>
  (word.length > 1 || word === 'a' || word === 'i') &&
  (flag !== '--corpus' || (lowercaseWords.get(word) ?? 0) >= frequency * .2 || word === 'i')));
const json = JSON.stringify({
  words: ranked(vocabulary, 6000).map(([word]) => word),
  common: 'hello help helpful helping world welcome library libraries book books computer computers code coding program programming search searching science scientist scientific technology information internet website software hardware design development developer learning language languages music morning beautiful because people please thanks thank together tomorrow today understand understanding function functionality'.split(' '),
  phrases: { hello: ['world', 'there'], thank: ['you'], 'thank you': ['for'], good: ['morning', 'afternoon', 'evening', 'night'], machine: ['learning'], artificial: ['intelligence'], 'how are': ['you'] },
  bigrams: index(bigrams, 5000),
  trigrams: index(trigrams, 3000),
}) + '\n';
const bytes = Buffer.byteLength(json);
if (bytes >= 150_000) throw new Error('The lookup exceeds the 150 KB budget.');
await writeFile(output, json);
console.log('Wrote ' + bytes + ' bytes to ' + output.pathname);
