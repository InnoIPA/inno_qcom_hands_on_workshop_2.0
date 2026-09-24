/* ============================================================
   iQ-Studio — docs page behavior
   (TOC scrollspy, code tabs, mobile sidebar, code copy)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- mobile sidebar drawer ---------- */
  var side = document.getElementById("docsSide");
  var backdrop = document.getElementById("sideBackdrop");
  var menuBtn = document.getElementById("docsMenuBtn");
  function openSide() { if (side) side.classList.add("open"); if (backdrop) backdrop.classList.add("open"); }
  function closeSide() { if (side) side.classList.remove("open"); if (backdrop) backdrop.classList.remove("open"); }
  if (menuBtn) menuBtn.addEventListener("click", openSide);
  if (backdrop) backdrop.addEventListener("click", closeSide);
  if (side) side.addEventListener("click", function (e) { if (e.target.closest("a")) closeSide(); });

  /* ---------- side "Search" button → open overlay ---------- */
  var sideSearch = document.getElementById("sideSearch");
  if (sideSearch) sideSearch.addEventListener("click", function () {
    var b = document.getElementById("searchBtn");
    if (b) b.click();
  });

  /* ---------- code tabs (online / offline) ---------- */
  document.querySelectorAll("[data-codetabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".ct-tab");
    var panels = group.querySelectorAll(".ct-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-ct");
        tabs.forEach(function (t) { t.classList.toggle("active", t === tab); });
        panels.forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-ct") === key); });
      });
    });
  });

  /* ---------- code copy buttons ---------- */
  function iqsCopyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(txt).catch(function () { return iqsLegacyCopy(txt); });
    }
    return Promise.resolve(iqsLegacyCopy(txt));
  }
  function iqsLegacyCopy(txt) {
    try {
      var ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {}
    return true;
  }

  document.querySelectorAll(".code-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var txt = (btn.getAttribute("data-copy") || "").replace(/&#10;/g, "\n");
      var done = function () {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Copied';
        setTimeout(function () { btn.classList.remove("copied"); btn.innerHTML = orig; }, 1600);
      };
      iqsCopyText(txt).then(done, done);
    });
  });

  /* ---------- build "On this page" TOC + scrollspy + reading progress ---------- */
  var prose = document.getElementById("prose");
  var tocLinks = document.getElementById("tocLinks");
  if (prose && tocLinks) {
    var heads = prose.querySelectorAll("h2[id], h3[id]");
    var map = [];

    // progress fill + playhead on the rail, and a ring gauge in the header
    var fill = document.createElement("span");
    fill.className = "toc-fill";
    tocLinks.appendChild(fill);
    var head = document.createElement("span");
    head.className = "toc-head";
    tocLinks.appendChild(head);
    var pct = null, ring = null;
    var toc = document.getElementById("docsToc");
    var h6 = toc && toc.querySelector("h6");
    if (h6) {
      var gauge = document.createElement("span");
      gauge.className = "toc-gauge";
      ring = document.createElement("span");
      ring.className = "toc-ring";
      pct = document.createElement("span");
      pct.className = "toc-pct";
      pct.textContent = "0%";
      gauge.appendChild(ring);
      gauge.appendChild(pct);
      h6.appendChild(gauge);
    }

    heads.forEach(function (h) {
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      if (h.tagName === "H3") a.className = "sub";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var y = h.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
        history.replaceState(null, "", "#" + h.id);
      });
      tocLinks.appendChild(a);
      map.push({ h: h, a: a });
    });

    function spy() {
      var pos = window.scrollY + 110;
      var current = map[0];
      for (var i = 0; i < map.length; i++) {
        if (map[i].h.offsetTop <= pos) current = map[i];
      }
      var ci = map.indexOf(current);
      map.forEach(function (m, i) {
        m.a.classList.toggle("active", m === current);
        var wasDone = m.a.classList.contains("done");
        var nowDone = i < ci;
        // one-shot pop + spark burst the moment a node becomes “passed”
        if (nowDone && !wasDone) {
          m.a.classList.add("lit");
          var spark = document.createElement("span");
          spark.className = "toc-spark";
          spark.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";
          m.a.appendChild(spark);
          (function (a, s) {
            setTimeout(function () { a.classList.remove("lit"); s.remove(); }, 560);
          })(m.a, spark);
        }
        m.a.classList.toggle("done", nowDone);
      });

      // reading progress through the article body, mapped to the rail height
      var top = prose.offsetTop;
      var span = prose.offsetHeight - window.innerHeight * 0.5;
      var p = span > 0 ? (window.scrollY + window.innerHeight * 0.3 - top) / span : 1;
      p = Math.max(0, Math.min(1, p));
      // bottom of the page always reads as complete
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) p = 1;
      fill.style.height = (p * 100) + "%";
      head.style.top = (p * 100) + "%";
      var whole = Math.round(p * 100);
      if (pct) pct.textContent = whole + "%";
      if (ring) ring.style.setProperty("--p", whole);
      // celebrate the first time the reader hits the end
      if (whole >= 100 && !spy.done) {
        spy.done = true;
        head.classList.add("cheer");
        var g = toc && toc.querySelector(".toc-gauge");
        if (g) g.classList.add("cheer");
        setTimeout(function () {
          head.classList.remove("cheer");
          if (g) g.classList.remove("cheer");
        }, 750);
      } else if (whole < 100) {
        spy.done = false;
      }
    }
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", spy, { passive: true });
    spy();
  }
})();
