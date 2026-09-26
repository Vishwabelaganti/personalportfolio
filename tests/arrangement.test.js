import test from 'node:test';
import assert from 'node:assert/strict';
import { newArrangement, makeBar, validArrangement, TUNES } from '../src/experiments/study/arrangement.js';
test('arrangements reproduce seeds and vary harmony and rhythm across seeds',()=>{
 const a=newArrangement('warm',12),b=newArrangement('warm',13);
 assert.deepEqual(a,newArrangement('warm',12));assert.notDeepEqual(a,b);assert.equal(a.length,128);assert.ok(validArrangement(a));
 assert.notDeepEqual(a.map(events=>events.filter(e=>e.voice==='keys'||e.voice==='kick')),b.map(events=>events.filter(e=>e.voice==='keys'||e.voice==='kick')));
});
test('all tune recipes fit one bar and contain playable events',()=>{for(const tune of Object.keys(TUNES)){const bar=makeBar('night',17,tune,3);assert.equal(bar.length,16);assert.ok(validArrangement(Array.from({length:8},()=>bar).flat()));}});
test('character recipes create their named instrument voices',()=>{
 assert.ok(makeBar('warm',2,'jazz',0).flat().some(e=>e.voice==='sax'));
 assert.ok(makeBar('warm',2,'guitar',0).flat().some(e=>e.voice==='guitar'));
 assert.ok(makeBar('warm',2,'rhodes',0).flat().some(e=>e.voice==='rhodes'));
 assert.ok(makeBar('warm',2,'sax',0).flat().some(e=>e.voice==='sax'));
});
test('saved arrangement validation rejects malformed or unsafe note values',()=>{assert.equal(validArrangement([]),false);const pattern=newArrangement('rain',1);pattern[0].push({voice:'keys',notes:[Infinity],duration:1,velocity:.5});assert.equal(validArrangement(pattern),false);assert.ok(validArrangement(Array.from({length:128},()=>[])));});
