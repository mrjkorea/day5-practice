/* day5-practice — localStorage key helpers and legacy migration (browser + Node). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.D5_STORAGE = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PREFIX = 'd5v2-';
  var LOCK_PREFIX = 'd5v2-lock-';
  var TEACHER_PREFIX = 'd5v2-teacher-';
  var MIGRATE_MARKER_PREFIX = 'd5v2-migrated-legacy-';
  var UNLOCKED = '';

  function legacyScoreKey(book, test) {
    return PREFIX + book + '-' + test;
  }

  function legacyLockKey(book) {
    return LOCK_PREFIX + book;
  }

  function studentScoreKey(studentKey, book, test) {
    return PREFIX + studentKey + '-' + book + '-' + test;
  }

  function studentLockKey(studentKey, book) {
    return LOCK_PREFIX + studentKey + '-' + book;
  }

  function migrateMarkerKey(studentKey) {
    return MIGRATE_MARKER_PREFIX + studentKey;
  }

  /** True only for d5v2-<book>-<test> with no student segment (one dash in the tail). */
  function isLegacyScoreKey(k) {
    if (!k || k.indexOf(PREFIX) !== 0) return false;
    if (k.indexOf(LOCK_PREFIX) === 0) return false;
    var rest = k.slice(PREFIX.length);
    if (!rest) return false;
    var dash = rest.indexOf('-');
    if (dash < 1) return false;
    return dash === rest.lastIndexOf('-');
  }

  /** True only for d5v2-lock-<book> with no student segment. */
  function isLegacyLockKey(k) {
    if (!k || k.indexOf(LOCK_PREFIX) !== 0) return false;
    var rest = k.slice(LOCK_PREFIX.length);
    return rest.length > 0 && rest.indexOf('-') < 0;
  }

  function parseLegacyScoreKey(k) {
    if (!isLegacyScoreKey(k)) return null;
    var rest = k.slice(PREFIX.length);
    var dash = rest.indexOf('-');
    return { book: rest.slice(0, dash), test: rest.slice(dash + 1) };
  }

  function listStorageKeys(storage) {
    var keys = [];
    for (var i = 0; i < storage.length; i++) {
      var k = storage.key(i);
      if (k) keys.push(k);
    }
    return keys;
  }

  /**
   * Copy legacy score/lock keys into this student once. Never copies prefixed keys.
   */
  function migrateLegacyReadOnly(storage, studentKey) {
    if (!storage || !studentKey) return;
    var marker = migrateMarkerKey(studentKey);
    if (storage.getItem(marker)) return;

    listStorageKeys(storage).forEach(function (k) {
      if (isLegacyScoreKey(k)) {
        var parts = parseLegacyScoreKey(k);
        if (!parts) return;
        var dest = studentScoreKey(studentKey, parts.book, parts.test);
        if (storage.getItem(dest) == null) {
          var v = storage.getItem(k);
          if (v != null) storage.setItem(dest, v);
        }
        return;
      }
      if (isLegacyLockKey(k)) {
        var book = k.slice(LOCK_PREFIX.length);
        var dest = studentLockKey(studentKey, book);
        if (storage.getItem(dest) == null) {
          var lv = storage.getItem(k);
          if (lv != null) storage.setItem(dest, lv);
        }
      }
    });

    storage.setItem(marker, '1');
  }

  function readLock(storage, studentKey, book) {
    if (!book) return null;
    if (!studentKey) return storage.getItem(legacyLockKey(book));
    var v = storage.getItem(studentLockKey(studentKey, book));
    if (v === UNLOCKED) return null;
    return v;
  }

  function writeLock(storage, studentKey, book, testId) {
    if (!book) return;
    var k = studentKey ? studentLockKey(studentKey, book) : legacyLockKey(book);
    if (testId) storage.setItem(k, testId);
    else storage.setItem(k, UNLOCKED);
  }

  function clearLock(storage, studentKey, book) {
    writeLock(storage, studentKey, book, null);
  }

  function teacherGrantStorageKey(studentKey) {
    return studentKey ? TEACHER_PREFIX + studentKey : TEACHER_PREFIX + 'legacy';
  }

  function readTeacherGrantMap(storage, studentKey) {
    if (!storage || !studentKey) return {};
    var raw = storage.getItem(teacherGrantStorageKey(studentKey));
    if (!raw) return {};
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeTeacherGrantMap(storage, studentKey, map) {
    if (!storage || !studentKey) return;
    var k = teacherGrantStorageKey(studentKey);
    if (!map || !Object.keys(map).length) {
      storage.removeItem(k);
      return;
    }
    storage.setItem(k, JSON.stringify(map));
  }

  /** @returns {{mode:string, testId?:string}|null} */
  function readTeacherGrant(storage, studentKey, book) {
    if (!book || !studentKey) return null;
    var map = readTeacherGrantMap(storage, studentKey);
    var g = map[book];
    if (!g || typeof g !== 'object') return null;
    if (g.mode === 'open') return { mode: 'open' };
    if (g.mode === 'start' && g.testId) return { mode: 'start', testId: String(g.testId) };
    return null;
  }

  function setTeacherGrant(storage, studentKey, book, grant) {
    if (!storage || !studentKey || !book) return;
    var map = readTeacherGrantMap(storage, studentKey);
    if (!grant) {
      delete map[book];
    } else if (grant.mode === 'open') {
      map[book] = { mode: 'open' };
    } else if (grant.mode === 'start' && grant.testId) {
      map[book] = { mode: 'start', testId: String(grant.testId) };
    } else {
      return;
    }
    writeTeacherGrantMap(storage, studentKey, map);
  }

  function clearTeacherGrant(storage, studentKey, book) {
    if (!storage || !studentKey || !book) return;
    var map = readTeacherGrantMap(storage, studentKey);
    if (!map[book]) return;
    delete map[book];
    writeTeacherGrantMap(storage, studentKey, map);
  }

  function listTeacherGrants(storage, studentKey) {
    var map = readTeacherGrantMap(storage, studentKey);
    return Object.keys(map).map(function (book) {
      return { book: book, grant: readTeacherGrant(storage, studentKey, book) };
    }).filter(function (row) { return row.grant; });
  }

  return {
    PREFIX: PREFIX,
    LOCK_PREFIX: LOCK_PREFIX,
    UNLOCKED: UNLOCKED,
    legacyScoreKey: legacyScoreKey,
    legacyLockKey: legacyLockKey,
    studentScoreKey: studentScoreKey,
    studentLockKey: studentLockKey,
    migrateMarkerKey: migrateMarkerKey,
    isLegacyScoreKey: isLegacyScoreKey,
    isLegacyLockKey: isLegacyLockKey,
    parseLegacyScoreKey: parseLegacyScoreKey,
    migrateLegacyReadOnly: migrateLegacyReadOnly,
    readLock: readLock,
    writeLock: writeLock,
    clearLock: clearLock,
    listStorageKeys: listStorageKeys,
    TEACHER_PREFIX: TEACHER_PREFIX,
    teacherGrantStorageKey: teacherGrantStorageKey,
    readTeacherGrant: readTeacherGrant,
    setTeacherGrant: setTeacherGrant,
    clearTeacherGrant: clearTeacherGrant,
    listTeacherGrants: listTeacherGrants
  };
});
