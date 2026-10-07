'use strict';

var assert = require('assert');
var test = require('node:test');
var api = require('../assets/js/d5-auth-progress.js');

var PROGRAM = api.PROGRAM;

test('ignores rows from other programs', function () {
  var rows = [
    { program: 'leap-frog', item: 'bk:t1', scorePct: 99 },
    { program: PROGRAM, item: 'basic_a:u1', scorePct: 80 }
  ];
  var best = api.bestPctFromRows(rows, PROGRAM);
  assert.deepStrictEqual(best, { 'basic_a:u1': 80 });
});

test('union merge keeps max score per item across lists', function () {
  var a = [
    { program: PROGRAM, item: 'basic_a:u1', scorePct: 70 },
    { program: PROGRAM, item: 'basic_a:u2', scorePct: 90 }
  ];
  var b = [
    { program: PROGRAM, item: 'basic_a:u1', scorePct: 85 },
    { program: 'day6-talk', item: 'x:y', scorePct: 100 }
  ];
  var merged = api.mergeProgressRowLists(a, b, PROGRAM);
  var best = api.bestPctFromRows(merged, PROGRAM);
  assert.strictEqual(best['basic_a:u1'], 85);
  assert.strictEqual(best['basic_a:u2'], 90);
  assert.strictEqual(best['x:y'], undefined);
});

test('handles more than twenty mixed rows like old server payload', function () {
  var rows = [];
  for (var i = 0; i < 25; i++) {
    rows.push({
      program: i % 3 === 0 ? 'other-app' : PROGRAM,
      item: 'int2a:t' + i,
      scorePct: 50 + (i % 40)
    });
  }
  rows.push({ program: PROGRAM, item: 'int2a:t1', scorePct: 95 });
  var best = api.bestPctFromRows(rows, PROGRAM);
  assert.ok(Object.keys(best).length >= 15);
  assert.strictEqual(best['int2a:t1'], 95);
});

test('idKey normalizes student ids for storage', function () {
  assert.strictEqual(api.idKey('  Jay.Student  '), 'jay.student');
});

test('parses score strings and itemId aliases', function () {
  assert.strictEqual(api.pctFromProgress({ score: '8 / 10' }), 80);
  assert.strictEqual(api.itemIdFromRow({ program: PROGRAM, itemId: 'basic_b:mid' }, PROGRAM), 'basic_b:mid');
});
