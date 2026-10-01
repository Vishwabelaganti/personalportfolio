import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';

async function generate(name, seed) {
  const source = await readFile(new URL(`../public/ink/vendor/${name}-worker.js`, import.meta.url), 'utf8');
  const worker = new Worker(`const {parentPort} = require('node:worker_threads'); globalThis.postMessage = value => parentPort.postMessage(value); ${source}\nonmessage({data:{seed:${seed}}});`, { eval: true });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('Generator timed out')); }, 30000);
    worker.once('message', value => { clearTimeout(timer); worker.terminate(); value.error ? reject(new Error(value.error)) : resolve(value); });
    worker.once('error', error => { clearTimeout(timer); worker.terminate(); reject(error); });
  });
}

test('landscape produces finite SVG geometry in an isolated worker', async () => {
  const { svg } = await generate('landscape', 5131185);
  assert.match(svg, /^<svg/);
  assert.match(svg, /polyline/);
  assert.ok(svg.length > 10000);
  assert.doesNotMatch(svg, /NaN|Infinity|<script/);
});

test('unlabelled fish have finite geometry and different seeds create different specimens', async () => {
  const a = await generate('fish', 12345);
  const b = await generate('fish', 98765);
  for (const { lines } of [a,b]) {
    assert.ok(lines.length > 50);
    for (const line of lines) for (const point of line) {
      assert.equal(point.length, 2);
      assert.ok(point.every(Number.isFinite));
      assert.ok(point[0] >= 0 && point[0] <= 500 && point[1] >= 0 && point[1] <= 300);
    }
  }
  assert.notDeepEqual(a.lines, b.lines);
});
