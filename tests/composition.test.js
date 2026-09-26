import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { compose, MOODS, stepDuration, sanitizeMix } from '../src/experiments/study/composition.js';

test('saved seeds reproduce phrases, and new seeds create variations',()=>{
  assert.deepEqual(compose('warm',47),compose('warm',47));
  assert.notDeepEqual(compose('warm',47),compose('warm',48));
});
test('all generated pitched voices belong to the current chord',()=>{
  for(const [mood,preset] of Object.entries(MOODS))for(const seed of [1,42,13579]){
    const phrase=compose(mood,seed);assert.equal(phrase.length,128);
    phrase.forEach((events,step)=>{
      const chord=preset.chords[Math.floor(step/16)%4].map(n=>(n+preset.root)%12);
      for(const event of events)for(const note of event.notes||[]){assert.ok(chord.includes(note%12));assert.ok(note>=24&&note<=96);}
    });
  }
});
test('swing preserves exact bar length across supported tempos',()=>{
  for(const bpm of [55,76,95])for(const swing of [0,.15,.35]){
    const total=Array.from({length:16},(_,step)=>stepDuration(bpm,swing,step)).reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(total-4*60/bpm)<1e-10);
  }
});
test('stored mixer settings cannot escape safe control ranges',()=>{
  const mix=sanitizeMix({mood:'invalid',bpm:999,volume:-1,space:Infinity,keys:'bad',guitar:5,sax:-2});
  assert.equal(mix.mood,'warm');assert.equal(mix.bpm,95);assert.equal(mix.volume,0);assert.equal(mix.space,.35);assert.equal(mix.keys,.65);assert.equal(mix.guitar,1);assert.equal(mix.sax,0);assert.equal(mix.rhodes,.32);
});
test('optimized GLBs retain valid buffers and embedded textures',async()=>{
  const dir='src/experiments/study/assets',files=(await readdir(dir)).filter(f=>f.endsWith('.glb'));assert.equal(files.length,8);
  for(const name of files){const data=await readFile(`${dir}/${name}`);assert.equal(data.readUInt32LE(0),0x46546c67);assert.equal(data.readUInt32LE(8),data.length);const jsonLength=data.readUInt32LE(12),json=JSON.parse(data.subarray(20,20+jsonLength));const binaryLength=data.readUInt32LE(20+jsonLength);for(const view of json.bufferViews){assert.equal(view.byteOffset%4,0);assert.ok(view.byteOffset+view.byteLength<=binaryLength);}for(const image of json.images){assert.ok(json.bufferViews[image.bufferView]);assert.equal(image.uri,undefined);}}
});
