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

  return {
    PROGRAM: PROGRAM,
    idKey: idKey,
    pctFromProgress: pctFromProgress,
    itemIdFromRow: itemIdFromRow,
    bestPctFromRows: bestPctFromRows,
    mergeBestPctMaps: mergeBestPctMaps,
    mergeProgressRowLists: mergeProgressRowLists,
    filterProgramRows: filterProgramRows
  };
});
