'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var test = require('node:test');

var progressApi = require('../assets/js/d5-auth-progress.js');
var BUILD = require('../version.json').build;
var TEST_STUDENT = 'zz_test_mrjmetrics';

function loadMrjScores(root) {
  root.window = root;
  var src = fs.readFileSync(path.join(__dirname, '../mrj-scores.js'), 'utf8');
  vm.runInNewContext(src, root, { filename: 'mrj-scores.js' });
  return root.MRJ_SCORES;
}

function finishPostOpts(bk, tid, st, pass) {
  var bp = st.test.bp;
  var scoreMax = st.qs.length;
  var scoreValue = st.right;
  return {
    program: 'day5-practice',
    appName: 'MRJ Day 5',
    source: 'day5-practice',
    bookTitle: bk,
    unitTitle: tid,
    itemId: bk + ':' + tid,
    itemType: 'unit_test',
    scoreValue: scoreValue,
    scoreMax: scoreMax,
    scorePct: Math.round(100 * scoreValue / scoreMax),
    correctness: pass ? 'correct' : 'incorrect',
    metadata: {
      gate_right: st.gateRight,
      gate_total: st.gateN,
      pass_need: bp.pass,
      gate_need: bp.gateNeed,
      passed: pass
    }
  };
}

function mockScoresRoot(student) {
  var noteCalls = [];
  var fetchBodies = [];
  var root = {
    fetch: function (_url, init) {
      fetchBodies.push(JSON.parse(init.body));
      return Promise.resolve({
        ok: true,
        json: function () {
          return Promise.resolve({ status: 'ok' });
        }
      });
    },
    MRJ_AUTH: {
      student: function () {
        return student;
      },
      noteScore: function (opts) {
        noteCalls.push(opts);
      }
    },
    addEventListener: function () {},
    localStorage: {
      getItem: function () {
        return '[]';
      },
      setItem: function () {}
    }
  };
  loadMrjScores(root);
  return { root: root, noteCalls: noteCalls, fetchBodies: fetchBodies };
}

test('finish flow 17/20 posts raw score and noteScore with localDate', function () {
  var env = mockScoresRoot(TEST_STUDENT);
  var st = {
    right: 17,
    qs: { length: 20 },
    gateRight: 3,
    gateN: 4,
    test: { bp: { pass: 15, gateNeed: 2, n: 20 } }
  };
  var opts = finishPostOpts('basic_c', 'unit04', st, true);
  return env.root.MRJ_SCORES.post(opts).then(function () {
    assert.strictEqual(env.fetchBodies.length, 1);
    var ev = env.fetchBodies[0].events[0];
    assert.strictEqual(ev.score_value, 17);
    assert.strictEqual(ev.score_max, 20);
    assert.strictEqual(ev.score_pct, 85);
    assert.strictEqual(ev.item_id, 'basic_c:unit04');
    assert.strictEqual(env.fetchBodies[0].student_email, TEST_STUDENT);
    assert.strictEqual(env.noteCalls.length, 1);
    assert.deepStrictEqual(
      {
        program: env.noteCalls[0].program,
        itemId: env.noteCalls[0].itemId,
        scoreValue: env.noteCalls[0].scoreValue,
        scoreMax: env.noteCalls[0].scoreMax,
        scorePct: env.noteCalls[0].scorePct
      },
      {
        program: 'day5-practice',
        itemId: 'basic_c:unit04',
        scoreValue: 17,
        scoreMax: 20,
        scorePct: 85
      }
    );
    assert.match(String(env.noteCalls[0].localDate), /^\d{4}-\d{2}-\d{2}$/);
  });
});

test('progress reader treats 17/20 as 85%', function () {
  assert.strictEqual(progressApi.pctFromProgress({ score: '17/20' }), 85);
});

test('signed out sends nothing', function () {
  var env = mockScoresRoot('');
  return env.root.MRJ_SCORES.post({
    program: 'day5-practice',
    itemId: 'basic_c:unit04',
    scoreValue: 17,
    scoreMax: 20
  }).then(function (res) {
    assert.strictEqual(res.status, 'skipped');
    assert.strictEqual(env.fetchBodies.length, 0);
    assert.strictEqual(env.noteCalls.length, 0);
  });
});

test('postFinished in app.js uses raw right/total not percent-of-100', function () {
  var src = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
  assert.match(src, /scoreValue:\s*scoreValue/);
  assert.match(src, /scoreMax:\s*scoreMax/);
  assert.doesNotMatch(src, /scoreMax:\s*100/);
  assert.match(src, /postFinished\(bk,\s*tid,\s*st,\s*pass\)/);
});

test('index.html cache ?v= stamps match version.json build', function () {
  var html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(html, new RegExp('mrj-scores\\.js\\?v=' + BUILD));
  assert.match(html, new RegExp('app\\.js\\?v=' + BUILD));
  assert.match(html, new RegExp('content="' + BUILD + '"'));
});
