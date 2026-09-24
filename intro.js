/* =============================================================================
   Site intro controller
   Plays the cover once per session, then hands over to the site. Ported from
   the source DC component's timing (auto-enter 6s; click or Enter button skips;
   flash at 0.43s; overlay removed 1.65s after enter). Honours reduced-motion by
   never auto-playing. Exposes window.iqsReplayIntro() for a manual replay — it
   is defined on EVERY load, including repeat visits, so a Replay control always
   works.
   ========================================================================== */
(function () {
  var intro = document.getElementById("intro");
  if (!intro) return;

  // pages inside "iQ-Studio Site/" sit one folder below the workshop pages
  // that also load this file, so the hardcoded "assets/" path below needs
  // this prefix to still resolve once the page has moved down a level.
  var ROOT = /\/iQ-Studio(%20| )Site\//.test(location.pathname) ? "../" : "";

  // the intro re-plays on every visit, so the page underneath must always
  // start at the top — without this, a reload's restored scroll position
  // sits hidden behind the cover and is revealed unchanged when it lifts
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  window.scrollTo(0, 0);

  var SEEN = "iqs-intro-seen";
  var AUTO_MS = 6000;
  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entered = false;

  // the intro cube matches the site's active palette; palettes with no dedicated
  // render (mono, or anything unmapped) fall back to the neutral white cube on
  // a dark theme, or its dark counterpart on a light theme — same achromatic
  // swap the hero motes use, just via JS since this is an <image href>, not a
  // CSS background-image. ltgreen has no render of its own, reuses green.
  function syncCube() {
    var CUBES = { blue: 1, ltblue: 1, orange: 1, yellow: 1, magenta: 1, pink: 1, green: 1, violet: 1 };
    var ALIAS = { ltgreen: "green" };
    var pal = "";
    try { pal = localStorage.getItem("iqs-palette") || ""; } catch (e) {}
    var key = ALIAS[pal] || pal;
    var theme = document.documentElement.getAttribute("data-theme");
    var fallback = theme === "light" ? ROOT + "assets/cube-dark.png" : ROOT + "assets/cube-white.png";
    var src = CUBES[key] ? ROOT + "assets/cube-" + key + ".png" : fallback;
    intro.querySelectorAll(".intro-svg image").forEach(function (im) {
      im.setAttributeNS("http://www.w3.org/1999/xlink", "href", src);
      im.setAttribute("href", src);
    });
    return src;
  }

  function finish() {
    intro.classList.add("done");
    document.body.style.overflow = "";
  }

  function enter() {
    if (entered) return;
    entered = true;
    clearTimers();
    timers.push(setTimeout(function () { intro.classList.add("flash"); }, 430));
    intro.classList.add("entering");
    timers.push(setTimeout(finish, 1650));
  }

  function play() {
    clearTimers();
    entered = false;
    var src = syncCube();
    intro.classList.remove("entering", "flash", "done", "bar-done");
    // force the shard/settle animations to restart from frame 0
    void intro.offsetWidth;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    // the bar/walker/percentage's own CSS animation (0.2s delay + 3.4s run,
    // see intro.css) finishes at 3.6s — this is the single, authoritative
    // trigger for swapping it out for the headline in the same slot. Doing
    // that swap here, instead of matching the same "3.6s" as a second,
    // independent animation-delay on the headline, is what guarantees the
    // two can never both be visible (or half-visible mid-crossfade) at
    // once — a hard, JS-driven cut instead of two clocks that have to be
    // kept in sync by hand.
    timers.push(setTimeout(function () { intro.classList.add("bar-done"); }, 3600));
    timers.push(setTimeout(enter, AUTO_MS));
    intro.addEventListener("click", enter);
    document.addEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (!entered && (e.key === "Escape" || e.key === "Enter")) enter();
  }

  // manual replay is ALWAYS available
  window.iqsReplayIntro = play;

  // the intro lives only on the home page, so it plays on every visit; only
  // reduced motion suppresses the auto-play (the site is shown immediately)
  if (reduce) { intro.classList.add("done"); return; }
  // Decode the cube render and let the browser rasterise the blur filters for
  // one frame BEFORE the timeline starts. Without this the first cycle stalls
  // while the large feGaussianBlur regions are built for the first time.
  (function warmUp() {
    var src = syncCube();
    // the image callback and the timeout can BOTH fire; without this guard the
    // timeline starts twice and the first pass is visibly cut off mid-sweep
    var started = false;
    var done = function () {
      if (started) return;
      started = true;
      requestAnimationFrame(function () { requestAnimationFrame(play); });
    };
    var img = new Image();
    img.onload = img.onerror = done;
    img.src = src;
    // never let a slow image hold the cover hostage
    setTimeout(done, 300);
  })();
})();
