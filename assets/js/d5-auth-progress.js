/* day5-practice — auth progress merge helpers (browser + Node tests). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.D5_AUTH_PROGRESS = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PROGRAM = 'day5-practice';

  function idKey(id) {
    return String(id == null ? '' : id)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function pctFromProgress(row) {
    if (!row) return null;
    if (typeof row.scorePct === 'number' && isFinite(row.scorePct)) return Math.round(row.scorePct);
    var raw = row.score == null ? '' : String(row.score).trim();
    var frac = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (frac) {
      var max = +frac[2];
      if (max > 0) return Math.round((+frac[1] / max) * 100);
    }
    var plain = raw.match(/^(\d+(?:\.\d+)?)\s*%?$/);
    if (plain) return Math.round(+plain[1]);
    return null;
  }

  function itemIdFromRow(row, program) {
    if (!row || row.program !== program) return '';
    var item = String(row.item || row.itemId || '');
    var cut = item.indexOf(':');
    if (cut < 1 || cut >= item.length - 1) return '';
    return item.slice(0, cut) + ':' + item.slice(cut + 1);
  }

  function bestPctFromRows(rows, program) {
    program = program || PROGRAM;
    var bestPct = {};
    if (!rows || !rows.length) return bestPct;
    rows.forEach(function (row) {
      var id = itemIdFromRow(row, program);
      if (!id) return;
      var pct = pctFromProgress(row);
      if (pct == null) return;
      if (bestPct[id] == null || pct > bestPct[id]) bestPct[id] = pct;
    });
    return bestPct;
  }

  function mergeBestPctMaps(a, b) {
    var out = {};
    Object.keys(a || {}).forEach(function (k) { out[k] = a[k]; });
    Object.keys(b || {}).forEach(function (k) {
      if (out[k] == null || b[k] > out[k]) out[k] = b[k];
    });
    return out;
  }

  function mergeProgressRowLists(rowsA, rowsB, program) {
    program = program || PROGRAM;
    var merged = bestPctFromRows(rowsA, program);
    var fromB = bestPctFromRows(rowsB, program);
    var best = mergeBestPctMaps(merged, fromB);
    return Object.keys(best).map(function (id) {
      return {
        program: program,
        item: id,
        scorePct: best[id]
      };
    });
  }

  function filterProgramRows(rows, program) {
    program = program || PROGRAM;
    if (!rows || !rows.length) return [];
    return rows.filter(function (row) {
      return row && row.program === program;
    });
  }

  var PASS_PCT = 80;

  var BOOK_CHAINS = {
    basic: ['basic_a', 'basic_b', 'basic_c'],
    int2: ['int2a', 'int2b', 'int2c'],
    int3: ['int3a', 'int3b', 'int3c']
  };

  var REVIEW_FINALS = {
    basic_review: ['basic_a:final', 'basic_b:final', 'basic_c:final'],
    int2_review: ['int2a:final', 'int2b:final', 'int2c:final'],
    int3_review: ['int3a:final', 'int3b:final', 'int3c:final']
  };

  var INT3_BRIDGE_FINAL = 'int2c:final';

  function splitItemId(itemId) {
    var cut = String(itemId || '').indexOf(':');
    if (cut < 1) return { book: '', test: '' };
    return { book: itemId.slice(0, cut), test: itemId.slice(cut + 1) };
  }

  function passedItem(bestFn, itemId, passPct) {
    passPct = passPct == null ? PASS_PCT : passPct;
    if (!bestFn || !itemId) return false;
    var parts = splitItemId(itemId);
    if (!parts.book || !parts.test) return false;
    var v = bestFn(parts.book, parts.test);
    return v != null && v >= passPct;
  }

  function bookChainKey(bookId) {
    if (/^basic_/.test(bookId) && bookId !== 'basic_review') return 'basic';
    if (/^int2/.test(bookId) && bookId !== 'int2_review') return 'int2';
    if (/^int3/.test(bookId) && bookId !== 'int3_review') return 'int3';
    return '';
  }

  function bookPathBlock(bookId, bestFn, passPct) {
    var finals = REVIEW_FINALS[bookId];
    if (finals) {
      for (var i = 0; i < finals.length; i++) {
        if (!passedItem(bestFn, finals[i], passPct)) {
          return { reason: 'review_prereq', need: finals[i] };
        }
      }
      return null;
    }
    if (bookId === 'int3a' && !passedItem(bestFn, INT3_BRIDGE_FINAL, passPct)) {
      return { reason: 'bridge', need: INT3_BRIDGE_FINAL };
    }
    var chainKey = bookChainKey(bookId);
    if (!chainKey) return null;
    var chain = BOOK_CHAINS[chainKey];
    var idx = chain.indexOf(bookId);
    if (idx <= 0) return null;
    var needFinal = chain[idx - 1] + ':final';
    if (!passedItem(bestFn, needFinal, passPct)) {
      return { reason: 'book_chain', need: needFinal };
    }
    return null;
  }

  function testPathBlock(bookId, testId, bestFn, passPct) {
    if (!/_review$/.test(bookId)) return null;
    var m = String(testId || '').match(/^u(\d+)$/i);
    if (!m) return null;
    var n = parseInt(m[1], 10);
    if (!isFinite(n) || n <= 1) return null;
    var need = bookId + ':u' + (n - 1);
    if (!passedItem(bestFn, need, passPct)) {
      return { reason: 'review_step', need: need };
    }
    return null;
  }

  /** Returns null when open; otherwise { reason, need } with need as bookId:testId. */
  function pathBlocked(opts) {
    opts = opts || {};
    if (opts.isTeacher) return null;
    var bookId = opts.bookId;
    var testId = opts.testId;
    var bestFn = opts.bestFn;
    var passPct = opts.passPct;
    var bookBlock = bookPathBlock(bookId, bestFn, passPct);
    if (bookBlock) return bookBlock;
    if (testId) {
      var testBlock = testPathBlock(bookId, testId, bestFn, passPct);
      if (testBlock) return testBlock;
    }
    return null;
  }

  return {
    PROGRAM: PROGRAM,
    PASS_PCT: PASS_PCT,
    idKey: idKey,
    pctFromProgress: pctFromProgress,
    itemIdFromRow: itemIdFromRow,
    bestPctFromRows: bestPctFromRows,
    mergeBestPctMaps: mergeBestPctMaps,
    mergeProgressRowLists: mergeProgressRowLists,
    filterProgramRows: filterProgramRows,
    passedItem: passedItem,
    bookPathBlock: bookPathBlock,
    testPathBlock: testPathBlock,
    pathBlocked: pathBlocked
  };
});
