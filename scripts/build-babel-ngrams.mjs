import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('../src/experiments/babel/data/english-ngrams.json', import.meta.url);
const [flag, ...files] = process.argv.slice(2);
if (!['--corpus', '--bigrams'].includes(flag) || !files.length || (flag === '--bigrams' && files.length !== 1)) {
  throw new Error('Use --corpus book1.txt book2.txt … or --bigrams count_2w.txt.');
}

const unigrams = new Map();
const bigrams = new Map();
const trigrams = new Map();
const count = (map, key, amount = 1) => map.set(key, (map.get(key) ?? 0) + amount);
const ranked = (map, limit) => [...map].sort(([a, n], [b, m]) => m - n || (a < b ? -1 : a > b ? 1 : 0)).slice(0, limit);

if (flag === '--corpus') {
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    const body = text.match(/^\*{3} START OF THE PROJECT GUTENBERG EBOOK[^\r\n]*\r?\n([\s\S]*?)^\*{3} END OF THE PROJECT GUTENBERG EBOOK/m)?.[1] ?? text;
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
const json = JSON.stringify({
  fallback: ranked(unigrams, 12).map(([word]) => word),
  bigrams: index(bigrams, 5000),
  trigrams: index(trigrams, 3000),
}) + '\n';
const bytes = Buffer.byteLength(json);
if (bytes >= 150_000) throw new Error('The lookup exceeds the 150 KB budget.');
await writeFile(output, json);
console.log('Wrote ' + bytes + ' bytes to ' + output.pathname);
