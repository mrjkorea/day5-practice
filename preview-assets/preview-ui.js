/* Preview-only: colour + label the Day 5 book cards by level (Basic = green, Int 2 = blue, Int 3 = red / hardest).
   Only display text/classes on the card links; hrefs, ids and app logic unchanged. */
(function () {
  "use strict";
  var app = document.getElementById("app") || document.body;
  function lvl(id) { return /^int3/.test(id) ? "red" : /^int2/.test(id) ? "blue" : "green"; }
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
        if (m[1] === "3") { var h = document.createElement("span"); h.className = "pv-hard"; h.textContent = "🔥 hardest"; a.appendChild(h); }
      }
    });
    var other = app.querySelector("a.link:not([data-pv])");
    if (other && /intermediate/i.test(other.getAttribute("href") || "")) { other.setAttribute("data-pv", "1"); other.classList.add("pv-next-level"); other.textContent = "💎 Intermediate 2 · 🔥 Intermediate 3 →"; }
  }
  new MutationObserver(tag).observe(app, { childList: true, subtree: true });
  tag();
})();
