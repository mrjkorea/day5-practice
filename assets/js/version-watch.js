(function (root) {
  "use strict";
  // Asks open tabs to reload when a new version of Day 5 is pushed.
  // Jay 2026-11-06: the old confirm() came back again and again and Reload kept
  // the same cached page. Now it is a small bar with Later and Reload:
  //   Later hides it for 6 hours; Reload adds ?_v=<build> so the page is fetched fresh.
  // It still never interrupts a student in the middle of a test.
  var LOCAL_BUILD = root.D5_BUILD_ID || "";
  var CHECK_MS = 3 * 60 * 1000;
  var PROMPT_GAP_MS = 10 * 60 * 1000;
  var SNOOZE_MS = 6 * 60 * 60 * 1000;
  var SNOOZE_KEY = "mrj.updbar.snooze";
  var GAP_KEY = "mrj.updbar.last";
  var here = (document.currentScript && document.currentScript.src) || location.href;
  var URL_V = new URL("../../version.json", here).href;
  var timer = null;

  function rd(k) { try { return root.localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function wr(k, v) { try { root.localStorage.setItem(k, v); } catch (e) {} }
  function inTest() { return !!document.querySelector("#app .qtop"); }
  function snoozed() { return Date.now() < +(rd(SNOOZE_KEY).split(":")[0] || 0); }
  function gapOk() {
    var last = +(rd(GAP_KEY) || 0);
    if (last && Date.now() - last < PROMPT_GAP_MS) return false;
    wr(GAP_KEY, String(Date.now()));
    return true;
  }

  function reloadNow(remote) {
    try {
      var u = new URL(root.location.href);
      u.searchParams.set("_v", remote || String(Date.now()));
      root.location.replace(u.toString());
    } catch (e) {
      try { root.location.reload(); } catch (e2) {}
    }
  }

  function showBar(remote) {
    var doc = root.document;
    if (!doc || !doc.body || doc.getElementById("mrj-update-bar")) return;
    var bar = doc.createElement("div");
    bar.id = "mrj-update-bar";
    bar.setAttribute("role", "status");
    bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;align-items:center;" +
      "gap:10px;justify-content:space-between;padding:10px 12px;background:#fff8ec;border-top:3px solid #f0b27f;" +
      "color:#1f2a44;font:600 15px/1.35 system-ui,-apple-system,'Apple SD Gothic Neo',sans-serif;" +
      "box-shadow:0 -6px 18px rgba(0,0,0,.14)";
    var txt = doc.createElement("span");
    txt.textContent = "New version ready. Reload so your work saves.";
    txt.style.cssText = "flex:1;min-width:0";
    var later = doc.createElement("button");
    later.type = "button";
    later.textContent = "Later";
    later.style.cssText = "flex:0 0 auto;min-height:44px;padding:8px 14px;border-radius:12px;border:2px solid #e0752d;" +
      "background:#fff;color:#c25b12;font:800 15px system-ui,sans-serif";
    later.onclick = function () {
      wr(SNOOZE_KEY, String(Date.now() + SNOOZE_MS) + ":" + (remote || ""));
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    };
    var go = doc.createElement("button");
    go.type = "button";
    go.textContent = "Reload";
    go.style.cssText = "flex:0 0 auto;min-height:44px;padding:8px 16px;border-radius:12px;border:0;" +
      "background:#2f7cf6;color:#fff;font:800 15px system-ui,sans-serif";
    go.onclick = function () { reloadNow(remote); };
    bar.appendChild(txt);
    bar.appendChild(later);
    bar.appendChild(go);
    doc.body.appendChild(bar);
  }

  function check() {
    if (!LOCAL_BUILD || inTest() || snoozed()) return;
    fetch(URL_V + "?_=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var remote = d && d.build ? String(d.build) : "";
        if (!remote || remote === LOCAL_BUILD || inTest()) return;
        if (!gapOk()) return;
        showBar(remote);
      })
      .catch(function () {});
  }

  function arm() {
    if (timer) return;
    timer = setInterval(check, CHECK_MS);
    root.addEventListener("focus", check);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
    root.addEventListener("hashchange", function () { setTimeout(check, 500); });
    setTimeout(check, 15000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arm); else arm();
})(window);
