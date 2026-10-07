/* MRJ Day 5 unit tests — one engine for Basic and Intermediate (v2, listening-first). */
/* build: 20261007-progress-2 */
(function () {
  'use strict';
  var html = document.documentElement;
  var ROOT = html.dataset.siteRoot || '';
  var MANIFEST = html.dataset.manifest || 'data/v2/manifest-basic.json';
  var app = document.getElementById('app');
  var SAY = {
    1: 'Listen to the question. Tap the best answer.',
    2: 'Look and listen. Tap the best answer.',
    3: 'Listen. Tap the right picture.',
    4: 'Listen. Tap the words in order.',
    5: 'Listen. Tap the right word.',
    6: 'Listen. Tap the missing word.',
    7: 'Listen. Spell the word.',
    8: 'Listen to the talk. Then answer.',
    9: 'Listen to the answer. What was the question?',
    10: 'Look and listen. Is it right?'
  };
  var MAX_REPLAYS = 2;
  var manifest = null, books = {}, st = null, player = null, playToken = 0;
  var PROGRAM = 'day5-practice';
  var progressApi = window.D5_AUTH_PROGRESS || {};
  var storageApi = window.D5_STORAGE || {};
  var studentKey = '';
  var authRetryScheduled = false;

  function url(p) { return ROOT + p; }
  function $(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function load(p) { return fetch(url(p), { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); }); }
  function idKey(id) {
    if (progressApi.idKey) return progressApi.idKey(id);
    return String(id == null ? '' : id).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function key(b, t) {
    if (studentKey && storageApi.studentScoreKey) return storageApi.studentScoreKey(studentKey, b, t);
    return studentKey ? ('d5v2-' + studentKey + '-' + b + '-' + t) : ('d5v2-' + b + '-' + t);
  }
  function legacyKey(b, t) {
    return storageApi.legacyScoreKey ? storageApi.legacyScoreKey(b, t) : ('d5v2-' + b + '-' + t);
  }
  function lockKey(b) {
    if (studentKey && storageApi.studentLockKey) return storageApi.studentLockKey(studentKey, b);
    return studentKey ? ('d5v2-lock-' + studentKey + '-' + b) : ('d5v2-lock-' + b);
  }

  function best(b, t) {
    var v = localStorage.getItem(key(b, t));
    if (v == null && studentKey && !legacyMigrated()) v = localStorage.getItem(legacyKey(b, t));
    return v == null ? null : +v;
  }

  function legacyMigrated() {
    if (!studentKey || !storageApi.migrateMarkerKey) return false;
    return localStorage.getItem(storageApi.migrateMarkerKey(studentKey)) != null;
  }

  function lockOf(b) {
    if (storageApi.readLock) return storageApi.readLock(localStorage, studentKey, b);
    return localStorage.getItem(lockKey(b));
  }

  function setLock(b, t) {
    if (storageApi.writeLock) {
      storageApi.writeLock(localStorage, studentKey, b, t);
      return;
    }
    if (t) localStorage.setItem(lockKey(b), t);
    else localStorage.removeItem(lockKey(b));
  }

  function migrateLegacyReadOnly() {
    if (!studentKey) return;
    if (storageApi.migrateLegacyReadOnly) storageApi.migrateLegacyReadOnly(localStorage, studentKey);
  }

  function setStudentFromAuth(id) {
    studentKey = idKey(id);
    if (studentKey) migrateLegacyReadOnly();
  }

  // ---------- audio ----------
  function stop() { playToken++; if (player) { try { player.pause(); } catch (e) {} player = null; } }
  function playList(list, done) {
    stop();
    var tok = playToken, i = 0;
    list = list || [];
    function next() {
      if (tok !== playToken) return;
      if (i >= list.length) { if (done) done(true); return; }
      player = new Audio(url(list[i++]));
      player.onended = function () { setTimeout(next, 350); };
      player.onerror = function () { setTimeout(next, 50); };
      var p = player.play();
      if (p && p.catch) p.catch(function () { if (tok === playToken && done) done(false); tok = -1; });
    }
    next();
  }

  // ---------- data ----------
  function getBook(id) {
    var b = manifest.books.filter(function (x) { return x.id === id; })[0];
    if (!b) return Promise.resolve(null);
    if (b.legacy) { location.replace(url(b.legacy)); return new Promise(function () {}); }
    if (books[id]) return Promise.resolve(books[id]);
    return load(b.file).then(function (d) { d.id = id; books[id] = d; return d; });
  }

  // Draw one attempt: per-type counts from the pool, spread over units, then shuffle everything.
  function draw(book, test) {
    var bp = test.bp, picked = [];
    Object.keys(bp.types).forEach(function (t) {
      var need = bp.types[t];
      var byUnit = test.units.map(function (u) {
        return shuffle(book.units[u].items.filter(function (it) { return String(it.t) === t; }));
      });
      var order = shuffle(byUnit.map(function (_, i) { return i; }));
      var got = [], guard = 0;
      while (got.length < need && guard++ < 1000) {
        var progress = false;
        order.forEach(function (ui) { if (got.length < need && byUnit[ui].length) { got.push(byUnit[ui].shift()); progress = true; } });
        if (!progress) break;
      }
      picked = picked.concat(got);
    });
    return shuffle(picked).map(prepare);
  }
  // Shuffle choices / tiles for this attempt, remembering where the answer went.
  function prepare(it) {
    var q = { src: it, t: it.t };
    if (it.ch) {
      var idx = shuffle(it.ch.map(function (_, i) { return i; }));
      if (it.t === 10) idx = [0, 1]; // ✓ always left, ✗ always right; the answer itself varies per item
      q.ch = idx.map(function (i) { return it.ch[i]; });
      q.k = idx.indexOf(it.k);
    }
    if (it.tiles) {
      var all = it.tiles.map(function (w, i) { return { w: w, i: i }; }).concat((it.xt || []).map(function (w) { return { w: w, i: -1 }; }));
      var s, tries = 0;
      do { s = shuffle(all); tries++; } while (tries < 20 && s.slice(0, it.tiles.length).every(function (x, i) { return x.i === i; }));
      q.pool = s;
    }
    return q;
  }
  function isGate(t) { return t === 1 || t === 2 || t === 8; }

  // ---------- views ----------
  function header(back, backText) {
    var h = $('div', 'top');
    if (back) { var a = $('a', 'back', backText || '← Back'); a.href = back; h.appendChild(a); }
    var brand = $('div', 'brand', 'MRJ Day 5');
    h.appendChild(brand);
    return h;
  }

  function renderHome() {
    stop();
    app.innerHTML = '';
    app.appendChild(header(null));
    app.appendChild($('h1', null, manifest.title));
    app.appendChild($('p', 'lead', 'Listen and tap. You need 80% to pass.'));
    var g = $('div', 'grid');
    manifest.books.forEach(function (b) {
      var a = $('a', 'bigbtn book', b.label); a.href = b.legacy ? url(b.legacy) : '#/' + b.id; g.appendChild(a);
    });
    app.appendChild(g);
    if (manifest.other) { var o = $('a', 'link', manifest.other.label); o.href = url(manifest.other.href); app.appendChild(o); }
  }

  function renderBook(book) {
    stop();
    app.innerHTML = '';
    app.appendChild(header('#/', '← Books'));
    app.appendChild($('h1', null, book.label));
    var lock = lockOf(book.id);
    if (lock) app.appendChild($('p', 'note', 'Finish your test first. Pass it to open the others.'));
    var list = $('div', 'list');
    book.tests.forEach(function (t) {
      var b = best(book.id, t.id);
      var a = $('a', 'row' + (b != null && b >= 80 ? ' done' : '') + (lock && lock !== t.id ? ' locked' : ''));
      a.appendChild($('span', 'rt', t.title));
      a.appendChild($('span', 'rs', b != null && b >= 80 ? '⭐ Passed' : (lock === t.id ? '▶ Try again' : '')));
      if (!lock || lock === t.id) a.href = '#/' + book.id + '/' + t.id;
      else a.setAttribute('aria-disabled', 'true');
      list.appendChild(a);
    });
    app.appendChild(list);
  }

  function renderStart(book, test) {
    stop();
    app.innerHTML = '';
    var lock = lockOf(book.id);
    app.appendChild(header(lock === test.id ? null : '#/' + book.id, '← Tests'));
    app.appendChild($('h1', null, test.title));
    var bp = test.bp;
    app.appendChild($('p', 'lead', bp.n + ' questions. Pass: ' + bp.pass + ' right, and ' + bp.gateNeed + ' of the ' + bp.gateN + ' talk questions (💬).'));
    var go = $('button', 'bigbtn go', '▶ Start');
    go.onclick = function () { startQuiz(book, test); };
    app.appendChild(go);
  }

  function startQuiz(book, test) {
    st = { book: book, test: test, qs: draw(book, test), i: 0, right: 0, gateRight: 0, gateN: 0, answered: false };
    renderQ();
  }

  function renderQ() {
    var q = st.qs[st.i], it = q.src;
    st.answered = false;
    app.innerHTML = '';
    var top = $('div', 'qtop');
    top.appendChild($('span', 'count', (st.i + 1) + ' / ' + st.qs.length));
    if (isGate(q.t)) top.appendChild($('span', 'talk', '💬'));
    var bar = $('div', 'bar'); var fill = $('span'); fill.style.width = (100 * st.i / st.qs.length) + '%'; bar.appendChild(fill);
    top.appendChild(bar);
    app.appendChild(top);

    var card = $('section', 'card q t' + q.t);
    card.appendChild($('p', 'say', it.say || SAY[q.t]));
    var replays = MAX_REPLAYS;
    var hear = $('button', 'hear', '🔊');
    var left = $('span', 'left', '');
    function upd() { left.textContent = replays > 0 ? '×' + replays : ''; hear.disabled = replays <= 0; }
    hear.onclick = function () { if (replays <= 0) return; replays--; upd(); playList(it.a); };
    var hw = $('div', 'hearwrap'); hw.appendChild(hear); hw.appendChild(left); card.appendChild(hw);
    if (it.pic) { var im = $('img', 'qpic'); im.src = url(it.pic); im.alt = 'picture'; card.appendChild(im); }
    if (it.fr) card.appendChild($('p', 'frame', it.fr));
    var body = $('div', 'body');
    card.appendChild(body);
    app.appendChild(card);
    if (q.ch) renderChoices(q, body); else renderTiles(q, body);
    upd();
    playList(it.a, function (ok) { if (!ok) { replays = MAX_REPLAYS + 1; upd(); } });
  }

  function renderChoices(q, body) {
    var pics = q.ch.every(function (c) { return c.i; });
    var wrap = $('div', 'choices' + (pics ? ' pics n' + q.ch.length : '') + (q.t === 10 ? ' tf' : ''));
    q.ch.forEach(function (c, idx) {
      var b = $('button', 'choice');
      b.type = 'button';
      if (c.i) { var im = $('img'); im.src = url(c.i); im.alt = 'choice ' + (idx + 1); b.appendChild(im); }
      if (c.x) b.appendChild($('span', 'ctext', c.x));
      if (c.a) {
        var s = $('span', 'cspk', '🔊');
        s.setAttribute('role', 'button');
        s.onclick = function (ev) { ev.stopPropagation(); playList([c.a]); };
        b.insertBefore(s, b.firstChild);
      }
      b.onclick = function () { answer(idx === q.k, b, wrap, q.k); };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }

  function renderTiles(q, body) {
    var it = q.src, n = it.tiles.length, letters = q.t === 7;
    var line = $('div', 'line' + (letters ? ' letters' : ''));
    var tray = $('div', 'tray' + (letters ? ' letters' : ''));
    var chosen = [];
    var check = $('button', 'bigbtn check', '✔ Check');
    check.disabled = true;
    function draw() {
      line.innerHTML = ''; tray.innerHTML = '';
      for (var s = 0; s < n; s++) {
        var slot = $('button', 'tile slot' + (chosen[s] ? ' full' : ''), chosen[s] ? chosen[s].w : (letters ? '_' : ' '));
        (function (s) { slot.onclick = function () { if (chosen[s] && !st.answered) { chosen.splice(s, 1); draw(); } }; })(s);
        line.appendChild(slot);
      }
      q.pool.forEach(function (t) {
        if (chosen.indexOf(t) >= 0) return;
        var b = $('button', 'tile', t.w);
        b.onclick = function () { if (chosen.length < n && !st.answered) { chosen.push(t); draw(); } };
        tray.appendChild(b);
      });
      check.disabled = chosen.length !== n;
    }
    check.onclick = function () {
      var ok = chosen.every(function (t, i) { return t.w === it.tiles[i]; });
      answer(ok, line, null, -1);
    };
    draw();
    body.appendChild(line); body.appendChild(tray); body.appendChild(check);
  }

  function answer(ok, el, wrap, k) {
    if (st.answered) return;
    st.answered = true;
    var q = st.qs[st.i];
    if (st.i === 0) setLock(st.book.id, st.test.id); // once started, this test must be passed
    if (ok) st.right++;
    if (isGate(q.t)) { st.gateN++; if (ok) st.gateRight++; }
    el.classList.add(ok ? 'ok' : 'bad');
    if (wrap) [].forEach.call(wrap.children, function (c, i) { c.disabled = true; if (i === k) c.classList.add('ok'); });
    document.querySelectorAll('.tile,.check').forEach(function (b) { b.disabled = true; });
    stop();
    setTimeout(function () { st.i++; if (st.i >= st.qs.length) finish(); else renderQ(); }, ok ? 700 : 1300);
  }

  function pctFromProgress(row) {
    if (progressApi.pctFromProgress) return progressApi.pctFromProgress(row);
    if (!row) return null;
    if (typeof row.scorePct === 'number' && isFinite(row.scorePct)) return Math.round(row.scorePct);
    return null;
  }

  function restoreProgress(rows) {
    if (!rows || !rows.length) return;
    var bestPct = progressApi.bestPctFromRows
      ? progressApi.bestPctFromRows(rows, PROGRAM)
      : {};
    if (!Object.keys(bestPct).length) return;
    var wrote = false;
    Object.keys(bestPct).forEach(function (id) {
      var cut = id.indexOf(':');
      var bookId = id.slice(0, cut), testId = id.slice(cut + 1);
      var prev = best(bookId, testId);
      if (prev == null || bestPct[id] > prev) {
        localStorage.setItem(key(bookId, testId), bestPct[id]);
        wrote = true;
      }
    });
    if (wrote && manifest && !st) route();
  }

  function postFinished(bk, tid, pct, pass) {
    if (!window.MRJ_SCORES || typeof window.MRJ_SCORES.post !== 'function') return;
    var student = '';
    try { student = window.MRJ_AUTH && typeof window.MRJ_AUTH.student === 'function' ? window.MRJ_AUTH.student() : ''; } catch (e) {}
    window.MRJ_SCORES.post({
      student: student,
      program: 'day5-practice',
      appName: 'MRJ Day 5',
      source: 'day5-practice',
      bookTitle: bk,
      unitTitle: tid,
      itemId: bk + ':' + tid,
      itemType: 'unit_test',
      scoreValue: pct,
      scoreMax: 100,
      scorePct: pct,
      correctness: pass ? 'correct' : 'incorrect'
    });
  }

  function finish() {
    stop();
    var bp = st.test.bp, pass = st.right >= bp.pass && st.gateRight >= bp.gateNeed;
    var pct = Math.round(100 * st.right / st.qs.length);
    var bk = st.book.id, tid = st.test.id;
    if (pass) { setLock(bk, null); var b = best(bk, tid); if (b == null || pct > b) localStorage.setItem(key(bk, tid), pct); }
    postFinished(bk, tid, pct, pass);
    app.innerHTML = '';
    var card = $('section', 'card result ' + (pass ? 'pass' : 'fail'));
    card.appendChild($('div', 'emoji', pass ? '🎉' : '💪'));
    card.appendChild($('h1', null, pass ? 'You passed!' : 'Not yet. Try again!'));
    card.appendChild($('p', 'score', st.right + ' / ' + st.qs.length));
    card.appendChild($('p', 'meta', '💬 Talk questions: ' + st.gateRight + ' / ' + st.gateN + ' (need ' + bp.gateNeed + ')  ·  Need ' + bp.pass + ' / ' + bp.n));
    var btn;
    if (pass) { btn = $('a', 'bigbtn go', 'OK ⭐'); btn.href = '#/' + bk; }
    else { btn = $('button', 'bigbtn go', '🔁 Try again'); btn.onclick = function () { startQuiz(st.book, st.test); }; }
    card.appendChild(btn);
    app.appendChild(card);
    st = null;
    window.__d5done = pass ? 'pass' : 'fail';
  }

  // ---------- router ----------
  function route() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return renderHome();
    getBook(parts[0]).then(function (book) {
      if (!book) { location.hash = '#/'; return; }
      var lock = lockOf(book.id);
      var tid = parts[1];
      if (tid && !book.tests.some(function (t) { return t.id === tid; })) tid = null;
      if (lock && tid && tid !== lock) { location.replace('#/' + book.id + '/' + lock); return; }
      if (!tid) {
        if (st && st.book.id === book.id) { location.replace('#/' + book.id + '/' + st.test.id); return; }
        return renderBook(book);
      }
      if (st && st.test.id === tid && st.book.id === book.id) return; // in the middle of a test: stay
      renderStart(book, book.tests.filter(function (t) { return t.id === tid; })[0]);
    }).catch(fail);
  }
  function fail(e) { app.innerHTML = ''; app.appendChild($('p', 'note', 'Could not load. Please refresh. (' + e + ')')); }
  window.addEventListener('hashchange', function () {
    // Back button in the middle of a test keeps you in the test.
    if (st) { var want = '#/' + st.book.id + '/' + st.test.id; if (location.hash !== want) { history.pushState(null, '', want); return; } }
    route();
  });
  function authProgressError() {
    var err = '';
    try {
      if (window.MRJ_AUTH && typeof window.MRJ_AUTH.progressError === 'function') {
        err = String(window.MRJ_AUTH.progressError() || '').trim();
      }
    } catch (e) {}
    return err;
  }

  function applyAuthProgressRows(rows) {
    var filtered = progressApi.filterProgramRows
      ? progressApi.filterProgramRows(rows, PROGRAM)
      : (rows || []);
    restoreProgress(filtered);
  }

  var lastAuthProgressRows = [];

  function scheduleAuthProgressRetry() {
    if (authRetryScheduled) return;
    authRetryScheduled = true;
    setTimeout(function () {
      fetchFullProgressThenApply(lastAuthProgressRows, true);
    }, 17000);
  }

  function authProgressErrorFromDetail(detail) {
    var err = detail && detail.progressError != null ? String(detail.progressError).trim() : '';
    if (err) return err;
    return authProgressError();
  }

  function fetchFullProgressThenApply(initialRows, isRetry) {
    var auth = window.MRJ_AUTH;
    var base = initialRows || [];
    if (!auth || typeof auth.loadProgressForApp !== 'function') return;
    auth.loadProgressForApp(PROGRAM).then(function (result) {
      if (result && result.ok && result.progress && result.progress.length) {
        var merged = progressApi.mergeProgressRowLists
          ? progressApi.mergeProgressRowLists(base, result.progress, PROGRAM)
          : result.progress;
        applyAuthProgressRows(merged);
      } else if (!result || !result.ok) {
        if (!isRetry) scheduleAuthProgressRetry();
      }
    }).catch(function () {
      if (!isRetry) scheduleAuthProgressRetry();
    });
  }

  window.addEventListener('mrj-auth-ready', function (ev) {
    var detail = (ev && ev.detail) || {};
    setStudentFromAuth(detail.id);
    lastAuthProgressRows = detail.progress != null ? detail.progress : [];
    applyAuthProgressRows(lastAuthProgressRows);
    if (authProgressErrorFromDetail(detail)) {
      scheduleAuthProgressRetry();
      return;
    }
    fetchFullProgressThenApply(lastAuthProgressRows, false);
  });
  load(MANIFEST).then(function (m) { manifest = m; route(); }).catch(fail);
  // test hooks (used by the automated checks only)
  window.__d5 = { draw: draw, getBook: getBook, lockOf: lockOf, state: function () { return st; } };
})();
