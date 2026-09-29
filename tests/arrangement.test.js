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

test('new guitar recipes ring out, strum across time, and include sustained strings',()=>{
 for(const tune of ['fingerpick','strum','comping','swell']){const events=makeBar('warm',2,tune,0).flat();assert.ok(events.some(e=>e.voice==='strings'&&e.duration===4));assert.ok(events.filter(e=>e.voice==='guitar').every(e=>e.duration>=1.8));}
 assert.ok(makeBar('warm',2,'strum',0).flat().some(e=>e.strum>0));assert.ok(makeBar('warm',2,'swell',0).flat().some(e=>e.swell));
});
test('note resizing uses step boundaries and preserves pitch and velocity',async()=>{
 const {resizeNote}=await import('../src/experiments/study/arrangement.js');const event={voice:'guitar',notes:[60],duration:.7,velocity:.5};resizeNote(event,4,12);assert.equal(event.duration,2);resizeNote(event,4,40);assert.equal(event.duration,3);resizeNote(event,4,1);assert.equal(event.duration,.25);assert.deepEqual(event.notes,[60]);assert.equal(event.velocity,.5);
});
