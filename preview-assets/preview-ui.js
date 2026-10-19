/* Preview-only: colour + label the Day 5 book cards by level (Korean order: Basic = green, then Int 3 = blue, then Int 2 = red / hardest).
   Only display text/classes on the card links; hrefs, ids and app logic unchanged. */
(function () {
  "use strict";
  var app = document.getElementById("app") || document.body;
  function lvl(id) { return /^int2/.test(id) ? "red" : /^int3/.test(id) ? "blue" : "green"; }
  function tag() {
    var cards = app.querySelectorAll("a.bigbtn.book:not([data-pv])");
    Array.prototype.forEach.call(cards, function (a) {
      var id = (a.getAttribute("href") || "").replace(/^.*#\//, "");
      var m = id.match(/^int(\d)([abc])$/i);
      a.setAttribute("data-pv", lvl(id));
      a.classList.add("pv-" + lvl(id));
      if (m) {
        a.textContent = "";
        a.appendChild(document.createTextNode("Intermediate " + m[1]));
        var s = document.createElement("small"); s.className = "pv-code"; s.textContent = m[1] + m[2].toUpperCase();
        a.appendChild(s);
        if (m[1] === "2") { var h = document.createElement("span"); h.className = "pv-hard"; h.textContent = "🔥 hardest"; a.appendChild(h); }
      }
    });
    /* Display order: Int 3 (A-C) before Int 2 (A-C). Moves only existing links. */
    var all = app.querySelectorAll("a.bigbtn.book");
    var groups = [];
    Array.prototype.forEach.call(all, function (a) { if (groups.indexOf(a.parentNode) < 0) groups.push(a.parentNode); });
    groups.forEach(function (g) {
      var kids = Array.prototype.filter.call(g.children, function (a) { return a.matches("a.bigbtn.book"); });
      function rank(a) { var id = (a.getAttribute("href") || "").replace(/^.*#\//, ""); var m = id.match(/^int([23])([abc])$/i); return m ? (m[1] === "3" ? 10 : 20) + "abc".indexOf(m[2].toLowerCase()) : 0; }
      var sorted = kids.slice().sort(function (x, y) { return rank(x) - rank(y); });
      if (sorted.some(function (a, i) { return a !== kids[i]; })) {
        var anchor = kids[0].previousSibling;
        sorted.forEach(function (a) { g.insertBefore(a, anchor ? anchor.nextSibling : g.firstChild); anchor = a; });
      }
    });
    var other = app.querySelector("a.link:not([data-pv])");
    if (other && /intermediate/i.test(other.getAttribute("href") || "")) { other.setAttribute("data-pv", "1"); other.classList.add("pv-next-level"); other.textContent = "💎 Intermediate 3 · 🔥 Intermediate 2 →"; }
  }
  new MutationObserver(tag).observe(app, { childList: true, subtree: true });
  tag();
})();
