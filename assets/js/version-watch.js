(function (root) {
  "use strict";
  // Asks open tabs to reload when a new version of Day 5 is pushed.
  // Never interrupts a student in the middle of a test.
  var LOCAL_BUILD = root.D5_BUILD_ID || "";
  var CHECK_MS = 3 * 60 * 1000;
  var here = (document.currentScript && document.currentScript.src) || location.href;
  var URL_V = new URL("../../version.json", here).href;
  var asked = false, timer = null;
  function inTest() { return !!document.querySelector("#app .qtop"); }
  function check() {
    if (!LOCAL_BUILD || asked || inTest()) return;
    fetch(URL_V + "?_=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var remote = d && d.build ? String(d.build) : "";
        if (!remote || remote === LOCAL_BUILD || inTest()) return;
        asked = true;
        if (root.confirm && root.confirm("Day 5 has an update. Reload now?")) root.location.reload();
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
