'use strict';

var assert = require('assert');
var test = require('node:test');
var storage = require('../assets/js/d5-storage.js');

test('teacher start grant maps to the same lock key as student progress', function () {
  var map = Object.create(null);
  var store = {
    getItem: function (k) { return map[k] == null ? null : map[k]; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; }
  };
  var student = 'alice.basic';
  storage.setTeacherGrant(store, student, 'basic_a', { mode: 'start', testId: 'unit02' });
  storage.writeLock(store, student, 'basic_a', 'unit02');
  assert.strictEqual(storage.readTeacherGrant(store, student, 'basic_a').testId, 'unit02');
  assert.strictEqual(storage.readLock(store, student, 'basic_a'), 'unit02');
});

test('open-book teacher grant clears lock sentinel', function () {
  var map = Object.create(null);
  var store = {
    getItem: function (k) { return map[k] == null ? null : map[k]; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; }
  };
  var student = 'bob.basic';
  storage.writeLock(store, student, 'int2a', 'unit01');
  storage.setTeacherGrant(store, student, 'int2a', { mode: 'open' });
  storage.clearLock(store, student, 'int2a');
  assert.deepStrictEqual(storage.readTeacherGrant(store, student, 'int2a'), { mode: 'open' });
  assert.strictEqual(storage.readLock(store, student, 'int2a'), null);
});
