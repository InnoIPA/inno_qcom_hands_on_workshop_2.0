/* ============================================================
   iQ-Studio — interactions (vanilla)
   ============================================================ */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- site root prefix: pages inside "iQ-Studio Site/" sit one
     folder below the workshop pages, but this file is shared by both, so
     any hardcoded root-relative path (assets/, uploads/, sidecar files)
     needs this prefix to still resolve once the page has moved down a
     level. ---------- */
  var ROOT = /\/iQ-Studio(%20| )Site\//.test(location.pathname) ? "../" : "";
  window.iqsRoot = ROOT;

  /* ---------- header scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav drawer: .nav-drawer (nav-links + nav-tools) is
     off-canvas below 980px, so this button is the only way to reach
     Home/Get Started/Docs/etc. — and search/theme/palette/GitHub/Discord —
     on a phone or narrow tablet. Same open/close shape as the docs sidebar
     drawer, just a second instance with its own elements. ---------- */
  (function () {
    var btn = document.getElementById("navMenuBtn");
    var drawer = document.getElementById("navDrawer");
    var backdrop = document.getElementById("navBackdrop");
    if (!btn || !drawer) return;
    /* .nav-drawer lives inside <nav> in the markup so it lays out inline on
       desktop, but .site-header's backdrop-filter creates a new containing
       block for position:fixed — so below 980px, where the drawer becomes a
       full-height off-canvas panel, it has to be relocated to a direct child
       of <body> for that fixed positioning to be viewport-relative. Move it
       back inside <nav> above 980px so the desktop inline layout is intact. */
    var navHome = drawer.parentNode;
    var mq = window.matchMedia("(max-width: 980px)");
    function relocate() {
      if (mq.matches) {
        if (drawer.parentNode !== document.body) document.body.appendChild(drawer);
      } else if (drawer.parentNode !== navHome) {
        navHome.appendChild(drawer);
      }
    }
    relocate();
    if (mq.addEventListener) mq.addEventListener("change", relocate);
    else mq.addListener(relocate);
    function close() {
      drawer.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      drawer.classList.add("open");
      if (backdrop) backdrop.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
    function toggle() {
      if (drawer.classList.contains("open")) close();
      else open();
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });
    if (backdrop) backdrop.addEventListener("click", close);
    drawer.querySelector(".nav-links").addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) close();
    });
  })();

  /* ---------- hero cube: per-palette render ---------- */
  (function () {
    var units = document.querySelectorAll(".hc-unit");
    if (!units.length) return;
    // palettes without a dedicated render fall back to white
    var HAS = { blue: 1, ltblue: 1, orange: 1, yellow: 1, magenta: 1, pink: 1, green: 1 };
    function paint() {
      var p = document.documentElement.getAttribute("data-palette") || "blue";
      var src = ROOT + "assets/cube-" + (HAS[p] ? p : "white") + ".png";
      units.forEach(function (u) { u.setAttribute("href", src); });
    }
    paint();
    window.addEventListener("iqs-palette-change", paint);
  })();

  /* ---------- tabset: [role=tab] switches [role=tabpanel] ---------- */
  document.querySelectorAll(".tabset").forEach(function (set) {
    var tabs = set.querySelectorAll(".tablist [role=tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  /* ---------- hero cube: pointer parallax ---------- */
  (function () {
    var art = document.getElementById("cubeArt");
    if (!art || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var stage = art.closest(".hero-cubes");
    // track against the stage, not the window: the tilt should answer the
    // pointer's position over the artwork, not its absolute screen position
    window.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      art.style.setProperty("--tx", ((e.clientX - (r.left + r.width / 2)) / r.width).toFixed(3));
      art.style.setProperty("--ty", ((e.clientY - (r.top + r.height / 2)) / r.height).toFixed(3));
    }, { passive: true });
  })();

  /* ---------- hero animation switch ---------- */
  (function () {
    var stage = document.getElementById("heroStage");
    if (!stage) return;
    var tabs = stage.querySelectorAll(".stage-switch button");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  })();

  /* ---------- palette picker (header) ---------- */
  (function () {
    var KEY = "iqs-palette";
    var pickers = document.querySelectorAll(".pal-picker");
    if (!pickers.length) return;
    function current() { return document.documentElement.getAttribute("data-palette") || "blue"; }
    function sync() {
      var p = current();
      document.querySelectorAll(".pal-menu button[data-p]").forEach(function (b) {
        b.setAttribute("aria-current", b.getAttribute("data-p") === p ? "true" : "false");
      });
      document.querySelectorAll(".pal-switch button[data-p]").forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-p") === p);
      });
    }
    window.iqSetPalette = function (p) {
      document.documentElement.setAttribute("data-palette", p);
      try { localStorage.setItem(KEY, p); } catch (e) {}
      sync();
      // let the Tweaks panel mirror the choice instead of drifting apart
      window.dispatchEvent(new CustomEvent("iqs-palette-change", { detail: p }));
    };
    pickers.forEach(function (pk) {
      var trig = pk.querySelector(".pal-trigger");
      trig.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = pk.classList.toggle("open");
        trig.setAttribute("aria-expanded", open ? "true" : "false");
      });
      pk.querySelectorAll(".pal-menu button[data-p]").forEach(function (b) {
        b.addEventListener("click", function () {
          window.iqSetPalette(b.getAttribute("data-p"));
          pk.classList.remove("open");
          trig.setAttribute("aria-expanded", "false");
        });
      });
    });
    document.addEventListener("click", function () {
      pickers.forEach(function (pk) {
        pk.classList.remove("open");
        pk.querySelector(".pal-trigger").setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") pickers.forEach(function (pk) { pk.classList.remove("open"); });
    });
    sync();
  })();

  /* ---------- theme toggle ---------- */
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("iqs-theme", next); } catch (e) {}
      // let the tweaks panel know if it's listening
      window.dispatchEvent(new CustomEvent("iqs-theme-change", { detail: next }));
    });
  }

  /* ---------- headline swap (used by Tweaks) ---------- */
  window.iqSetHeadline = function (variant) {
    var el = document.getElementById("heroHeadline");
    if (!el) return;
    if (variant === "two-commands") {
      el.innerHTML = 'From Hardware to AI<br /><span class="hl">Demo in Two Commands</span>';
    } else if (variant === "30s") {
      el.innerHTML = 'Edge AI,<br /><span class="hl">Running in 30 Seconds</span>';
    } else {
      el.innerHTML = 'Show Performance,<br /><span class="hl">Spark Imagination.</span>';
    }
  };

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (n) { n.classList.add("in"); });
    fillBars();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          if (en.target.querySelector && en.target.querySelector(".bar-fill")) fillBars();
          if (en.target.classList.contains("bench-chart")) fillBars();
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (n, i) {
      n.style.animationDelay = ((i % 3) * 0.07) + "s";
      io.observe(n);
    });
    // Deterministic fallback: reveal anything already in the initial viewport
    // right away so above-the-fold content never flashes blank.
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) n.classList.add("in");
      });
    });
  }
  function fillBars() {
    document.querySelectorAll(".bar-fill").forEach(function (b) {
      b.style.width = b.getAttribute("data-w");
    });
  }

  /* ---------- copy buttons ---------- */
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

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var txt = btn.getAttribute("data-copy");
      var done = function () {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Copied';
        setTimeout(function () { btn.classList.remove("copied"); btn.innerHTML = orig; }, 1600);
      };
      iqsCopyText(txt).then(done, done);
    });
  });

  /* ---------- camera demo: bbox stagger + VLM caption typing ---------- */
  var boxes = ["bb1", "bb2", "bb3"].map(function (id) { return document.getElementById(id); });
  var captionEl = document.getElementById("camCaption");
  var fpsEl = document.getElementById("camFps");
  var captions = [
    "Operator at station 1 handling a tray of components. No safety violation detected.",
    "3 objects tracked. Tray partially filled — 2 of 6 slots populated.",
    "Scene nominal. Component orientation correct on inspected unit."
  ];
  var capIdx = 0;

  function typeCaption(text, cb) {
    if (reduce) { if (captionEl) captionEl.textContent = text; if (cb) setTimeout(cb, 2600); return; }
    var i = 0;
    if (captionEl) captionEl.textContent = "";
    (function step() {
      if (!captionEl) return;
      captionEl.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) setTimeout(step, 22 + Math.random() * 26);
      else if (cb) setTimeout(cb, 2400);
    })();
  }

  function showBoxes(cb) {
    boxes.forEach(function (b) { if (b) b.classList.remove("on"); });
    var d = 0;
    boxes.forEach(function (b) {
      if (!b) return;
      setTimeout(function () { b.classList.add("on"); }, d);
      d += 420;
    });
    if (cb) setTimeout(cb, d + 200);
  }

  function camLoop() {
    showBoxes(function () {
      typeCaption(captions[capIdx % captions.length], function () {
        capIdx++;
        boxes.forEach(function (b) { if (b) b.classList.remove("on"); });
        setTimeout(camLoop, 700);
      });
    });
  }
  if (captionEl) {
    if (reduce) { boxes.forEach(function (b) { if (b) b.classList.add("on"); }); captionEl.textContent = captions[0]; }
    else camLoop();
  }
  // gentle fps flicker
  if (fpsEl && !reduce) {
    setInterval(function () {
      var v = 45 + Math.floor(Math.random() * 5);
      fpsEl.textContent = v + " FPS · INT8";
    }, 1400);
  }

  /* ---------- terminal typing ---------- */
  var termBody = document.getElementById("termBody");
  var termScripts = {
    online: [
      { t: "prompt", c: "edge@innodisk", p: "~", cmd: "iqs-launcher --autotag iqs-ogenie" },
      { t: "out", c: "→ resolving tag iqs-ogenie … matched board profile" },
      { t: "out", c: "→ pulling model bundle  [████████████] 100%" },
      { t: "ok", c: "✓ orchestrator ready  ·  http://localhost:7860" },
      { t: "gap" },
      { t: "prompt", c: "edge@innodisk", p: "~", cmd: "iqs-launcher --autotag iqs-vlm-demo" },
      { t: "out", c: "→ loading runtime (TensorRT, INT8) …" },
      { t: "out", c: "→ warming camera pipeline · 1280×960 @ 30fps" },
      { t: "ok", c: "✓ live VLM demo running  ·  47 FPS" }
    ],
    offline: [
      { t: "prompt", c: "edge@innodisk", p: "~", cmd: "iqs-launcher --offline --autotag iqs-ogenie" },
      { t: "out", c: "→ using local registry  /opt/iqs/cache" },
      { t: "out", c: "→ verifying cached bundle … checksum ok" },
      { t: "ok", c: "✓ orchestrator ready  ·  no network used" },
      { t: "gap" },
      { t: "prompt", c: "edge@innodisk", p: "~", cmd: "iqs-launcher --offline --autotag iqs-vlm-demo" },
      { t: "out", c: "→ loading runtime from cache (TensorRT, INT8) …" },
      { t: "out", c: "→ air-gapped mode · telemetry disabled" },
      { t: "ok", c: "✓ live VLM demo running  ·  fully offline" }
    ]
  };
  var termTimer = null, currentTab = "online";

  function renderPrompt(step) {
    return '<span class="term-prompt">' + step.c + '</span><span class="term-path"> ' + step.p + ' </span><span class="term-prompt">$</span> ';
  }

  function runTerminal(tab) {
    currentTab = tab;
    if (termTimer) { clearTimeout(termTimer); termTimer = null; }
    if (!termBody) return;
    termBody.innerHTML = "";
    var script = termScripts[tab];
    var li = 0;

    function nextLine() {
      if (li >= script.length) {
        // hold, then restart
        termTimer = setTimeout(function () { runTerminal(currentTab); }, 4200);
        return;
      }
      var step = script[li];
      var line = document.createElement("div");
      line.className = "ln";
      termBody.appendChild(line);

      if (step.t === "gap") { line.innerHTML = "&nbsp;"; li++; termTimer = setTimeout(nextLine, 220); return; }
      if (step.t === "prompt") {
        line.innerHTML = renderPrompt(step) + '<span class="term-cmd"></span><span class="term-cursor"></span>';
        var cmdEl = line.querySelector(".term-cmd");
        var cur = line.querySelector(".term-cursor");
        if (reduce) { cmdEl.textContent = step.cmd; if (cur) cur.remove(); li++; termTimer = setTimeout(nextLine, 300); return; }
        var i = 0;
        (function typ() {
          cmdEl.textContent = step.cmd.slice(0, i); i++;
          if (i <= step.cmd.length) termTimer = setTimeout(typ, 34 + Math.random() * 30);
          else { if (cur) cur.remove(); li++; termTimer = setTimeout(nextLine, 360); }
        })();
        return;
      }
      // output / ok
      line.className = "ln " + (step.t === "ok" ? "term-ok" : "term-out");
      line.textContent = step.c;
      li++;
      termTimer = setTimeout(nextLine, step.t === "ok" ? 520 : 360);
    }
    nextLine();
  }

  document.querySelectorAll(".term-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".term-tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      runTerminal(tab.getAttribute("data-tab"));
    });
  });
  if (termBody) runTerminal("online");

  /* ---------- architecture stack ---------- */
  var layers = [
    { ix: "04", name: "User Space · iQS-App", tags: "QLI Downstream", desc: "At the very top sits the iQS-App layer, alongside 3rd-party LLM SDKs, device management and inno AVL — all driven by iqs-launcher.", items: ["iQS-App: VLM · Streampipe · YOLO · OGenie", "3rd-party LLM SDKs supported", "Device management (iCAP) + inno AVL", "iqs-launcher resolves images online or offline"] },
    { ix: "03", name: "Kernel Space · Qualcomm Linux", tags: "QLI Upstream", desc: "Powered by Qualcomm Linux, integrated with our custom inno DTB / drivers and Yocto environments.", items: ["Multimedia, Graphics, ML acceleration", "Wi-Fi, Modem, Bluetooth, Security", "Custom inno DTB & validated drivers", "Tracks the QLI roadmap (Kirkstone → Wrynose)"] },
    { ix: "02", name: "Non-HLOS · Firmware", tags: "firmware", desc: "Low-level firmware bridging the SoC and the operating system, validated against each board.", items: ["Board-validated low-level firmware", "Reproducible via meta-iQ__manifest", "Stable upstream-to-downstream pipeline"] },
    { ix: "01", name: "Hardware · Dragonwing SoC", tags: "QCS9075", desc: "The foundation: the Qualcomm Dragonwing QCS9075 SoC on Innodisk industrial edge hardware.", items: ["Qualcomm Dragonwing QCS9075 SoC", "Innodisk industrial-grade modules", "Vision-ready I/O for edge AI workloads"], hw: true }
  ];
  var stackEl = document.getElementById("stack");
  var detailEl = document.getElementById("archDetail");
  function renderDetail(l) {
    if (!detailEl) return;
    detailEl.innerHTML =
      '<span class="ad-ix">LAYER ' + l.ix + '</span>' +
      "<h3>" + l.name + "</h3>" +
      "<p>" + l.desc + "</p>" +
      '<ul class="ad-list">' + l.items.map(function (it) { return "<li>" + it + "</li>"; }).join("") + "</ul>";
  }
  if (stackEl && detailEl) {
    layers.forEach(function (l, i) {
      var b = document.createElement("button");
      b.className = "layer" + (l.hw ? " hw" : "") + (i === 0 ? " active" : "");
      b.innerHTML = '<span class="lyr-ix">' + l.ix + '</span><span class="lyr-name">' + l.name + '</span><span class="lyr-tags">' + l.tags + "</span>";
      b.addEventListener("mouseenter", function () { select(b, l); });
      b.addEventListener("click", function () { select(b, l); });
      b.addEventListener("focus", function () { select(b, l); });
      stackEl.appendChild(b);
    });
    function select(btn, l) {
      stackEl.querySelectorAll(".layer").forEach(function (x) { x.classList.remove("active"); });
      btn.classList.add("active");
      renderDetail(l);
    }
    renderDetail(layers[0]);
  }

  /* ---------- search overlay ---------- */
  var overlay = document.getElementById("searchOverlay");
  var searchBtn = document.getElementById("searchBtn");
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var INDEX = [
    { s: "Get Started", t: "Get Started — guided setup", h: "Get%20Started.html", g: "Get Started" },
    { s: "Get Started", t: "30-Second Demo · live UVC camera feed", h: "30-Second%20Demo.html", g: "Get Started" },
    { s: "Get Started", t: "How to Use iqs-launcher", h: "Docs.html", g: "Get Started" },
    { s: "Starting Guides", t: "Starting Guides Overview", h: "Starting%20Guides%20Overview.html", g: "Starting Guides" },
    { s: "Starting Guides", t: "Q911 Quick Start Guide", h: "Q911%20Quick%20Start%20Guide.html", g: "Starting Guides" },
    { s: "Starting Guides", t: "Q911 Image Flashing Guide", h: "Q911%20Image%20Flashing%20Guide.html", g: "Starting Guides" },
    { s: "Starting Guides", t: "Flashing from a Windows Host", h: "Windows%20Flashing%20Guide.html", g: "Starting Guides" },
    { s: "Starting Guides", t: "Qualcomm OTA Guide", h: "Qualcomm%20OTA%20Guide.html", g: "Starting Guides" },
    { s: "AVL", t: "Approved Vendor List", h: "AVL%20-%20Approved%20Vendor%20List.html", g: "AVL" },
    { s: "AVL", t: "GMSL Camera", h: "AVL%20-%20GMSL%20Camera.html", g: "AVL" },
    { s: "AVL", t: "MIPI Camera", h: "AVL%20-%20MIPI%20Camera.html", g: "AVL" },
    { s: "Applications", t: "Applications Overview", h: "Applications%20Overview.html", g: "Applications" },
    { s: "Applications", t: "iQS-VLM · vision-language demo", h: "iQS-VLM.html", g: "Applications" },
    { s: "Applications", t: "iQS-Streampipe · multi-stream pipeline", h: "iQS-Streampipe.html", g: "Applications" },
    { s: "Applications", t: "YOLOv10n INT8 Inference on GPU and NPU", h: "YOLOv10n%20INT8%20Inference.html", g: "Applications" },
    { s: "Model Deploy", t: "Model Deploy Overview", h: "Model%20Deploy%20Overview.html", g: "Model Deploy" },
    { s: "Model Deploy", t: "Convert, Optimize & Infer with YOLO26", h: "Model%20Deploy%20-%20YOLO26.html", g: "Model Deploy" },
    { s: "SDKs", t: "SDKs Overview", h: "SDKs%20Overview.html", g: "SDKs" },
    { s: "SDKs", t: "iQS-VLM · Open WebUI", h: "SDK%20-%20iQS-VLM%20Open%20WebUI.html", g: "SDKs" },
    { s: "SDKs", t: "iQS-Streampipe · Custom Model & Source", h: "SDK%20-%20iQS-Streampipe.html", g: "SDKs" },
    { s: "SDKs", t: "iQS-OGenie · Run Your Own Demo", h: "SDK%20-%20iQS-OGenie.html", g: "SDKs" },
    { s: "Benchmarks", t: "Benchmarks Overview", h: "Benchmarks%20Overview.html", g: "Benchmarks" },
    { s: "Benchmarks", t: "InnoPPE Benchmark (Jetson AGX vs QCS9075)", h: "Benchmark%20-%20InnoPPE.html", g: "Benchmarks" },
    { s: "Benchmarks", t: "Multi-stream inference status", h: "Benchmark%20-%20Multi-stream.html", g: "Benchmarks" },
    { s: "Benchmarks", t: "Perception AI benchmark (QCS9075 vs AGX Orin)", h: "Benchmark%20-%20Perception.html", g: "Benchmarks" },
    { s: "Benchmarks", t: "Interactive benchmark explorer", h: "Benchmarks.html", g: "Benchmarks" },
    { s: "Architecture", t: "Core Software Stack (interactive)", h: "Architecture.html", g: "Architecture" }
  ];
  var selIdx = 0, filtered = INDEX.slice();

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  }
  function iqsHighlight(text, q) {
    var safe = (text || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    if (!q) return safe;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }
  function renderResults() {
    if (!searchResults) return;
    if (!filtered.length) { searchResults.innerHTML = '<div class="search-section">No matches</div>'; return; }
    var q = searchInput ? searchInput.value.trim() : "";
    var html = "", lastG = null;
    filtered.forEach(function (r, i) {
      if (r.g !== lastG) { html += '<div class="search-section">' + r.g + "</div>"; lastG = r.g; }
      html += '<a class="search-item' + (i === selIdx ? " sel" : "") + '" href="' + r.h + '" data-i="' + i + '">' +
        '<span class="si-ic">' + searchIcon() + "</span>" +
        "<span><div>" + iqsHighlight(r.t, q) + '</div><div class="si-sub">' + iqsHighlight(r.s, q) + "</div></span></a>";
    });
    searchResults.innerHTML = html;
  }
  function openSearch() {
    if (!overlay) return;
    overlay.classList.add("open");
    filtered = INDEX.slice(); selIdx = 0; renderResults();
    if (searchInput) { searchInput.value = ""; setTimeout(function () { searchInput.focus(); }, 30); }
  }
  function closeSearch() { if (overlay) overlay.classList.remove("open"); }
  function go() {
    var r = filtered[selIdx];
    if (!r) return;
    if (r.h.charAt(0) === "#") { location.hash = r.h; closeSearch(); }
    else { window.location.href = r.h; }
  }
  if (searchBtn) searchBtn.addEventListener("click", openSearch);
  // let any page open the palette (Get Started's direct-access bar uses this)
  window.iqsOpenSearch = openSearch;
  if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.toLowerCase().trim();
      filtered = INDEX.filter(function (r) { return !q || (r.t + " " + r.s + " " + r.g).toLowerCase().indexOf(q) >= 0; });
      selIdx = 0; renderResults();
    });
  }
  if (searchResults) {
    searchResults.addEventListener("click", function (e) {
      var a = e.target.closest(".search-item");
      if (a) { e.preventDefault(); selIdx = +a.getAttribute("data-i"); go(); }
    });
  }
  function scrollSelIntoView() {
    if (!searchResults) return;
    var sel = searchResults.querySelector(".search-item.sel");
    if (!sel) return;
    var cTop = searchResults.scrollTop, cBottom = cTop + searchResults.clientHeight;
    var iTop = sel.offsetTop, iBottom = iTop + sel.offsetHeight;
    if (iTop < cTop) searchResults.scrollTop = iTop - 8;
    else if (iBottom > cBottom) searchResults.scrollTop = iBottom - searchResults.clientHeight + 8;
  }
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); return; }
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeSearch();
    else if (e.key === "ArrowDown") { e.preventDefault(); selIdx = (selIdx + 1) % filtered.length; renderResults(); scrollSelIntoView(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); selIdx = (selIdx - 1 + filtered.length) % filtered.length; renderResults(); scrollSelIntoView(); }
    else if (e.key === "Enter") { e.preventDefault(); go(); }
  });
})();
