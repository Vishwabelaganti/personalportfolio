import test from 'node:test';
import assert from 'node:assert/strict';
import { LofiEngine } from '../src/experiments/study/lofi.js';
import { sanitizeMix, INSTRUMENTS } from '../src/experiments/study/composition.js';
function scheduler(){const engine=new LofiEngine();engine.context={currentTime:0};engine.running=true;engine.step=15;engine.nextTime=0;engine.pattern=Array.from({length:128},()=>[]);return engine;}
test('loop audition repeats selected bar and consumes edits only at next boundary',()=>{
 const engine=scheduler(),pattern=Array.from({length:128},()=>[]);pattern[48]=[{voice:'guitar',notes:[60],duration:2,velocity:.5}];engine.setLoop(3);engine.setArrangement(pattern,3);engine.schedule();assert.equal(engine.step,48);assert.notEqual(engine.pattern[48].length,1);
 engine.context.currentTime=engine.nextTime;engine.tone=()=>{};engine.schedule();assert.equal(engine.pattern[48][0].voice,'guitar');assert.equal(engine.pending,null);assert.equal(engine.step,49);
 engine.step=63;engine.nextTime=engine.context.currentTime;engine.schedule();assert.equal(engine.step,48);engine.setLoop(null);engine.step=63;engine.nextTime=engine.context.currentTime;engine.schedule();assert.equal(engine.step,64);
});
test('instrument controls survive mix edits and sanitize old or invalid saved values',()=>{
 const engine=new LofiEngine();engine.configure({instruments:{guitar:{sustain:.8,tone:.3,reverb:.4}}});engine.configure({bpm:82});assert.equal(engine.settings.instruments.guitar.sustain,.8);
 const mix=sanitizeMix({instruments:{strings:{sustain:20,tone:-1,reverb:Infinity}}});assert.equal(mix.instruments.strings.sustain,1);assert.equal(mix.instruments.strings.tone,0);assert.equal(mix.instruments.strings.reverb,.3);for(const name of INSTRUMENTS)assert.ok(mix.instruments[name]);
});
