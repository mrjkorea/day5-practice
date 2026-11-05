/**
 * Day 5 teacher unlock UI — uses mrj-auth Teacher chip for PIN; this module is the
 * control panel + per-section "Start from here" helpers (no duplicate PIN UI).
 */
(function (root) {
  'use strict';

  var panelOpen = false;
  var panelEl = null;
  var backdropEl = null;
  var appHooks = null;

  function auth() {
    return root.MRJ_AUTH || root.MRJSignin || null;
  }

  function isMrjTeacher() {
    try {
      if (root.document && root.document.body && root.document.body.classList.contains('mrj-teacher')) {
        return true;
      }
      var api = auth();
      return !!(api && typeof api.isTeacher === 'function' && api.isTeacher());
    } catch (e) {
      return false;
    }
  }

  function installRefresh(onRefresh) {
    if (!root.document || typeof onRefresh !== 'function') return;
    root.document.addEventListener('mrj-teacher', function () {
      try {
        onRefresh();
      } catch (e) {}
    });
  }

  function promptTeacherUnlock() {
    var api = auth();
    if (!api) return;
    if (typeof api.openTeacherUnlock === 'function') {
      api.openTeacherUnlock();
      return;
    }
    if (typeof api.promptTeacherUnlock === 'function') {
      api.promptTeacherUnlock();
    }
  }

  function el(tag, cls, text) {
    var node = root.document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function closePanel() {
    panelOpen = false;
    if (backdropEl && backdropEl.parentNode) backdropEl.parentNode.removeChild(backdropEl);
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    backdropEl = null;
    panelEl = null;
    if (root.document && root.document.body) {
      root.document.body.classList.remove('d5-teacher-panel-open');
    }
  }

  function grantLabel(grant, bookLabel, testsById) {
    if (!grant) return '';
    if (grant.mode === 'open') return bookLabel + ': all tests open';
    if (grant.mode === 'start' && grant.testId) {
      var t = testsById && testsById[grant.testId];
      return bookLabel + ': start at ' + (t ? t.title : grant.testId);
    }
    return bookLabel;
  }

  function bookGroup(book) {
    var group = el('section', 'd5-tch-group');
    var head = el('div', 'd5-tch-group-head');
    head.appendChild(el('span', 'd5-tch-group-name', book.label || book.id));
    var open = el('button', 'd5-teacher-btn d5-teacher-btn-undo', 'Open book');
    open.type = 'button';
    open.addEventListener('click', function () {
      if (appHooks.openBook) appHooks.openBook(book.id);
    });
    head.appendChild(open);
    group.appendChild(head);

    var tests = book.tests || [];
    if (!tests.length) {
      group.appendChild(el('p', 'd5-teacher-panel-note', book.loaded === false ? 'Loading activities…' : 'No activities yet.'));
      return group;
    }
    var list = el('div', 'd5-tch-acts');
    tests.forEach(function (t) {
      var row = el('button', 'd5-tch-act');
      row.type = 'button';
      row.setAttribute('aria-label', 'Start ' + (t.title || t.id));
      row.appendChild(el('span', 'd5-tch-act-name', t.title || t.id));
      var bits = [];
      if (t.best != null) bits.push(t.best + '%');
      if (t.tries > 1) bits.push(t.tries + ' tries');
      row.appendChild(el('span', 'd5-tch-act-meta', bits.join(' · ')));
      row.appendChild(el('span', 'd5-tch-act-go', '▶ Start'));
      row.addEventListener('click', function () {
        if (appHooks.startFrom) appHooks.startFrom(book.id, t.id);
      });
      list.appendChild(row);
    });
    group.appendChild(list);
    return group;
  }

  function paintChart(body) {
    var books = appHooks.listBooks ? appHooks.listBooks() : [];
    body.appendChild(el('h2', 'd5-teacher-panel-h', 'Start a student from any activity'));
    if (!books.length) {
      body.appendChild(el('p', 'd5-teacher-panel-note', 'Loading the activity list…'));
      return;
    }
    books.forEach(function (b) { body.appendChild(bookGroup(b)); });
    var busy = books.some(function (b) { return !b.loaded || !(b.tests && b.tests.length); });
    if (busy && appHooks.loadBooks) {
      appHooks.loadBooks().then(function () {
        body.innerHTML = '';
        paintChart(body);
      });
    }
  }

  function renderPanelBody() {
    if (!panelEl || !appHooks) return;
    var body = panelEl.querySelector('.d5-teacher-panel-body');
    if (!body) return;
    body.innerHTML = '';
    var studentLabel = appHooks.studentLabel ? appHooks.studentLabel() : '';
    if (!studentLabel) {
      body.appendChild(el('p', 'd5-teacher-panel-note', 'Sign in as a student first, then use Teacher PIN.'));
      return;
    }
    body.appendChild(el('p', 'd5-teacher-panel-lead', 'Student: ' + studentLabel));

    var grants = appHooks.listGrants ? appHooks.listGrants() : [];
    if (grants.length) {
      var ul = el('ul', 'd5-teacher-grant-list');
      grants.forEach(function (row) {
        var li = el('li', 'd5-teacher-grant-item');
        var label = grantLabel(row.grant, row.bookLabel || row.book, row.testsById);
        li.appendChild(el('span', 'd5-teacher-grant-text', label));
        var undo = el('button', 'd5-teacher-btn d5-teacher-btn-undo', 'Undo');
        undo.type = 'button';
        undo.addEventListener('click', function () {
          if (appHooks.undoGrant) appHooks.undoGrant(row.book);
          renderPanelBody();
        });
        li.appendChild(undo);
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    paintChart(body);
  }

  function openPanel() {
    if (!root.document || !isMrjTeacher()) return;
    if (panelOpen) {
      renderPanelBody();
      return;
    }
    if (!appHooks) return;
    panelOpen = true;
    root.document.body.classList.add('d5-teacher-panel-open');
    backdropEl = el('div', 'd5-teacher-panel-backdrop');
    backdropEl.addEventListener('click', closePanel);
    panelEl = el('div', 'd5-teacher-panel');
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Teacher unlock');
    var head = el('div', 'd5-teacher-panel-head');
    head.appendChild(el('h1', null, 'Teacher unlock'));
    var closeBtn = el('button', 'd5-teacher-panel-close', '✕');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', closePanel);
    head.appendChild(closeBtn);
    panelEl.appendChild(head);
    panelEl.appendChild(el('div', 'd5-teacher-panel-body'));
    root.document.body.appendChild(backdropEl);
    root.document.body.appendChild(panelEl);
    renderPanelBody();
  }

  function togglePanel() {
    if (panelOpen) closePanel();
    else openPanel();
  }

  function wireTopbarUnlockBtn() {
    if (!root.document) return;
    var controls = root.document.querySelector('.topbar-controls');
    if (!controls) return;
    var btn = root.document.getElementById('d5-teacher-panel-btn');
    if (!btn) {
      btn = el('button', 'd5-teacher-panel-btn');
      btn.type = 'button';
      btn.id = 'd5-teacher-panel-btn';
      btn.textContent = 'Unlock';
      btn.hidden = true;
      btn.setAttribute('aria-label', 'Teacher unlock panel');
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        togglePanel();
      });
      controls.insertBefore(btn, controls.firstChild);
    }
    btn.hidden = !isMrjTeacher();
  }

  function onTeacherChrome() {
    wireTopbarUnlockBtn();
    if (isMrjTeacher()) openPanel();
    else closePanel();
  }

  function configure(hooks) {
    appHooks = hooks || null;
    if (panelOpen) renderPanelBody();
  }

  root.MRJTeacherUnlock = {
    isMrjTeacher: isMrjTeacher,
    installRefresh: installRefresh,
    promptTeacherUnlock: promptTeacherUnlock,
    configure: configure,
    openPanel: openPanel,
    closePanel: closePanel,
    togglePanel: togglePanel,
    onTeacherChrome: onTeacherChrome
  };

  if (root.document) {
    root.document.addEventListener('mrj-teacher', onTeacherChrome);
    root.document.addEventListener('mrj-auth-ready', function () {
      setTimeout(wireTopbarUnlockBtn, 80);
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
