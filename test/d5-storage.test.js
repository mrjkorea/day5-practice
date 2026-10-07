'use strict';

var assert = require('assert');
var test = require('node:test');
var storage = require('../assets/js/d5-storage.js');

function mockStorage() {
  var map = Object.create(null);
  return {
    get length() { return Object.keys(map).length; },
    key: function (i) { return Object.keys(map)[i] || null; },
    getItem: function (k) { return map[k] == null ? null : map[k]; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; },
    _keys: function () { return Object.keys(map); }
  };
}

function seedLegacyPack(store, n) {
  for (var i = 0; i < n - 1; i++) {
    store.setItem(storage.legacyScoreKey('basic_a', 't' + i), String(70 + i));
  }
  store.setItem(storage.legacyLockKey('basic_a'), 't0');
}

test('isLegacyScoreKey rejects student-prefixed score keys', function () {
  assert.strictEqual(storage.isLegacyScoreKey('d5v2-basic_a-u1'), true);
  assert.strictEqual(storage.isLegacyScoreKey('d5v2-alice.basic-basic_a-u1'), false);
  assert.strictEqual(storage.isLegacyLockKey('d5v2-lock-basic_a'), true);
  assert.strictEqual(storage.isLegacyLockKey('d5v2-lock-alice.basic-basic_a'), false);
});

test('migrateLegacyReadOnly runs once per student and ignores prefixed keys', function () {
  var store = mockStorage();
  seedLegacyPack(store, 21);
  store.setItem(storage.studentScoreKey('alice.basic', 'basic_a', 't0'), '99');

  storage.migrateLegacyReadOnly(store, 'alice.basic');
  storage.migrateLegacyReadOnly(store, 'alice.basic');

  var aliceScore = storage.studentScoreKey('alice.basic', 'basic_a', 't1');
  assert.strictEqual(store.getItem(aliceScore), '71');
  assert.strictEqual(store.getItem(storage.studentScoreKey('alice.basic', 'basic_a', 't0')), '99');
  assert.strictEqual(store.getItem(storage.migrateMarkerKey('alice.basic')), '1');
});

test('twelve students on a shared device keep key count bounded', function () {
  var store = mockStorage();
  seedLegacyPack(store, 21);

  for (var s = 0; s < 12; s++) {
    var student = 'student.' + s;
    storage.migrateLegacyReadOnly(store, student);
    for (var i = 0; i < 5; i++) {
      store.setItem(storage.studentScoreKey(student, 'int2a', 'x' + i), String(80 + i));
    }
  }

  var count = store.length;
  assert.ok(count < 500, 'expected bounded keys, got ' + count);
  assert.ok(count < 400, 'expected well under exponential growth, got ' + count);
});

test('pass keeps book unlocked when legacy lock remains', function () {
  var store = mockStorage();
  store.setItem(storage.legacyLockKey('basic_a'), 't0');
  var student = 'jay.student';

  assert.strictEqual(storage.readLock(store, student, 'basic_a'), null);

  storage.writeLock(store, student, 'basic_a', 't0');
  assert.strictEqual(storage.readLock(store, student, 'basic_a'), 't0');

  storage.clearLock(store, student, 'basic_a');
  assert.strictEqual(storage.readLock(store, student, 'basic_a'), null);
  assert.strictEqual(store.getItem(storage.legacyLockKey('basic_a')), 't0');

  storage.clearLock(store, student, 'basic_a');
  assert.strictEqual(storage.readLock(store, student, 'basic_a'), null);
});
