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
      body.appendChild(el('h2', 'd5-teacher-panel-h', 'Teacher unlocks'));
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
    } else {
      body.appendChild(el('p', 'd5-teacher-panel-note', 'No teacher unlocks saved for this student yet.'));
    }

    var ctx = appHooks.routeContext ? appHooks.routeContext() : {};
    if (ctx.bookId && appHooks.listTests) {
      body.appendChild(el('h2', 'd5-teacher-panel-h', ctx.bookLabel || ctx.bookId));
      var openAll = el('button', 'd5-teacher-btn d5-teacher-btn-wide', 'Open all tests in this book');
      openAll.type = 'button';
      openAll.addEventListener('click', function () {
        if (appHooks.openBook) appHooks.openBook(ctx.bookId);
        renderPanelBody();
      });
      body.appendChild(openAll);
      var tests = appHooks.listTests(ctx.bookId) || [];
      var list = el('div', 'd5-teacher-test-list');
      tests.forEach(function (t) {
        var row = el('div', 'd5-teacher-test-row');
        row.appendChild(el('span', 'd5-teacher-test-title', t.title));
        var start = el('button', 'd5-teacher-btn', 'Start from here');
        start.type = 'button';
        start.addEventListener('click', function () {
          if (appHooks.startFrom) appHooks.startFrom(ctx.bookId, t.id);
          renderPanelBody();
        });
        row.appendChild(start);
        list.appendChild(row);
      });
      body.appendChild(list);
    } else {
      body.appendChild(el('p', 'd5-teacher-panel-note', 'Open a book to pick a unit test, or use Start from here on the test list.'));
    }
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
