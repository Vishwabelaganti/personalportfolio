import test from 'node:test';
import assert from 'node:assert/strict';
import { readTasks, saveTasks } from '../src/experiments/study/todos.js';

test('study tasks retain text and completion across reloads', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.deepEqual(readTasks(storage), []);
  const tasks = [{ text: 'Read chapter 1', done: true }, { text: '<b>Practice</b>', done: false }];
  saveTasks(storage, tasks);
  assert.deepEqual(readTasks(storage), tasks);
  saveTasks(storage, tasks.filter(task => !task.done));
  assert.deepEqual(readTasks(storage), [tasks[1]]);
});

test('invalid saved tasks are filtered and corrupt or unavailable storage is reported', () => {
  assert.deepEqual(readTasks({ getItem: () => JSON.stringify([null, { text: ' ' }, { text: ' Read ', done: 'false' }]) }), [{ text: 'Read', done: false }]);
  assert.throws(() => readTasks({ getItem: () => '{broken' }));
  assert.throws(() => readTasks({ getItem: () => '{}' }));
  assert.throws(() => saveTasks({ setItem() { throw new Error('Storage disabled'); } }, []));
});
