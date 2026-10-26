'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var test = require('node:test');

var ROOT = path.join(__dirname, '..');

test('review questions.json packs are 24 items with 80% pass meta', function () {
  var courses = ['basic_review', 'int2_review', 'int3_review'];
  courses.forEach(function (course) {
    ['u1', 'u2', 'u3', 'u4'].forEach(function (rid) {
      var p = path.join(ROOT, course, rid, 'questions.json');
      var pack = JSON.parse(fs.readFileSync(p, 'utf8'));
      assert.strictEqual(pack.meta.count, 24);
      assert.strictEqual(pack.meta.pass_percent, 80);
      assert.strictEqual(pack.questions.length, 24);
      var books = {};
      pack.questions.forEach(function (q) {
        var k = q.merge_source_book + ':' + q.merge_source_unit;
        books[k] = (books[k] || 0) + 1;
      });
      assert.strictEqual(Object.keys(books).length, 6);
      Object.keys(books).forEach(function (k) {
        assert.strictEqual(books[k], 4);
      });
    });
  });
});

test('v2 review books expose fixed-item tests u1–u4', function () {
  ['basic_review', 'int2_review', 'int3_review'].forEach(function (id) {
    var book = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/v2', id + '.json'), 'utf8'));
    assert.strictEqual(book.tests.length, 4);
    book.tests.forEach(function (t) {
      assert.ok(/^u[1-4]$/.test(t.id));
      assert.strictEqual(t.items.length, 24);
      assert.ok(t.bp.pass >= Math.round(24 * 0.8));
    });
  });
});
