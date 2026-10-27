(function (root) {
  'use strict';

  function isMrjTeacher() {
    try {
      if (root.document && root.document.body && root.document.body.classList.contains('mrj-teacher')) {
        return true;
      }
      var api = root.MRJSignin || root.MRJ_AUTH;
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
    var api = root.MRJSignin || root.MRJ_AUTH;
    if (!api) return;
    if (typeof api.openTeacherUnlock === 'function') {
      api.openTeacherUnlock();
      return;
    }
    if (typeof api.promptTeacherUnlock === 'function') {
      api.promptTeacherUnlock();
    }
  }

  root.MRJTeacherUnlock = {
    isMrjTeacher: isMrjTeacher,
    installRefresh: installRefresh,
    promptTeacherUnlock: promptTeacherUnlock
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
