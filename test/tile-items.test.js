'use strict';

var assert = require('assert');
var test = require('node:test');
var path = require('path');

var validate = require('../scripts/validate-tile-items.mjs');

test('all v2 tile items (t=4, t=7) are completable', function () {
  var errors = validate.validateAllV2Books();
  assert.deepStrictEqual(errors, []);
});

test('tileAnswerOk matches engine', function () {
  var chosen = [{ w: 'm', i: 0 }, { w: 'o', i: 1 }];
  assert.strictEqual(validate.tileAnswerOk(chosen, ['m', 'o']), true);
  assert.strictEqual(validate.tileAnswerOk(chosen, ['m', 'n']), false);
});

test('renderTiles hides tray tiles by object reference (duplicate letters safe)', function () {
  var fs = require('fs');
  var src = fs.readFileSync(path.join(__dirname, '..', 'assets/js/app.js'), 'utf8');
  assert.match(src, /chosen\.indexOf\(t\)/);
  assert.doesNotMatch(src, /chosen\.some\(function \(c\) \{ return c\.w === t\.w/);
});

test('money spell item passes validation', function () {
  var fs = require('fs');
  var book = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/v2/int2c.json'), 'utf8'));
  var it = book.units.unit03.items.filter(function (x) { return x.id === 'int2c-unit03-t7-02'; })[0];
  assert.ok(it);
  var errors = validate.validateItem(it, { book: 'int2c', unit: 'unit03' });
  assert.deepStrictEqual(errors, []);
});
