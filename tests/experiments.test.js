import test from 'node:test';
import assert from 'node:assert/strict';
import { SnakeGame, NumberGame, WordGame } from '../src/experiments/arcade/engines.js';
import { FocusTimer } from '../src/experiments/study/timer.js';
test('snake rejects instant reverse and prevents multiple turns in one tick',()=>{const g=new SnakeGame(20,()=>.5);g.turn(-1,0);g.step();assert.equal(g.snake[0].x,9);g.turn(0,-1);g.turn(-1,0);g.step();assert.deepEqual(g.snake[0],{x:9,y:9});});
test('snake may move into its vacating tail but collides with walls',()=>{const g=new SnakeGame();g.snake=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}];g.direction=g.next={x:-1,y:0};g.step();assert.equal(g.over,false);g.step();g.step();assert.equal(g.over,true);});
test('number guesses validate input and stop after winning',()=>{const g=new NumberGame(42);g.guess(NaN);g.guess(101);assert.equal(g.attempts,0);assert.match(g.guess(30),/higher/);assert.match(g.guess(42),/found/);g.guess(80);assert.equal(g.attempts,2);});
test('word game counts unique misses and stops at the limit',()=>{const g=new WordGame('code');for(const l of 'aaabfghj')g.guess(l);assert.equal(g.misses,6);g.guess('c');assert.equal(g.guesses.has('c'),false);});
test('focus timer uses elapsed wall time, pauses, and finishes once',()=>{const t=new FocusTimer(1);t.start(1000);t.tick(11500);assert.equal(t.label,'00:50');t.pause(12000);assert.equal(t.remaining,49000);t.tick(90000);assert.equal(t.remaining,49000);t.start(100000);assert.equal(t.tick(149001),true);assert.equal(t.tick(150000),false);assert.equal(t.label,'00:00');});
