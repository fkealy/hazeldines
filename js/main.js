/* Hazeldines — interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";

  /* ---------- preloader (always clears, even if GSAP fails) ---------- */
  var preloader = document.querySelector(".preloader");
  function killPreloader() {
    if (!preloader) return;
    if (hasGsap && !prefersReduced) {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: function () { preloader.remove(); }
      });
    } else {
      preloader.remove();
    }
  }

  // hard safety net: rAF can be throttled in background tabs, which would
  // stall the GSAP exit tween — never leave the curtain up past 4s.
  setTimeout(function () {
    var p = document.querySelector(".preloader");
    if (p) p.remove();
  }, 4000);

  if (!hasGsap) {
    // CDN failed: page stays fully usable, no animations.
    killPreloader();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !prefersReduced) {
    lenis = new Lenis({ lerp: 0.11 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- nav ---------- */
  var nav = document.querySelector(".nav");
  ScrollTrigger.create({
    start: 60,
    onUpdate: function (self) {
      nav.classList.toggle("is-scrolled", self.scroll() > 60);
    }
  });

  var burger = document.querySelector(".nav__burger");
  var mmenu = document.querySelector(".mmenu");
  function closeMenu() {
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mmenu.classList.remove("is-open");
    mmenu.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
  }
  burger.addEventListener("click", function () {
    var open = !mmenu.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    mmenu.classList.toggle("is-open", open);
    mmenu.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* anchor links -> lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (mmenu.classList.contains("is-open")) closeMenu();
      scrollToTarget(target);
    });
  });

  /* ---------- custom cursor ---------- */
  var cursor = document.querySelector(".cursor");
  var fineCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursor && fineCursor && !prefersReduced) {
    var xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    var yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("pointermove", function (e) {
      cursor.classList.add("is-active");
      xTo(e.clientX);
      yTo(e.clientY);
    });
    document.querySelectorAll("[data-cursor], a, button").forEach(function (el) {
      el.addEventListener("pointerenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("pointerleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  /* ---------- intro timeline ---------- */
  function runIntro() {
    if (prefersReduced) { killPreloader(); return; }

    var tl = gsap.timeline();
    var word = new SplitText(".preloader__word", { type: "chars" });

    tl.from(".preloader__mark", { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(1.6)" })
      .from(word.chars, { yPercent: 110, opacity: 0, stagger: 0.04, duration: 0.55, ease: "power3.out" }, "-=0.35")
      .to(".preloader__inner", { opacity: 0, duration: 0.4, delay: 0.35 })
      .add(killPreloader);

    /* hero */
    var heroTitle = new SplitText(".hero__title", { type: "chars" });
    tl.from(".hero__ornament", { scale: 0, rotate: -14, duration: 0.9, ease: "back.out(1.7)" }, "-=0.15")
      .from(heroTitle.chars, {
        yPercent: 120,
        rotate: function () { return gsap.utils.random(-9, 9); },
        opacity: 0,
        stagger: 0.045,
        duration: 0.9,
        ease: "power4.out"
      }, "-=0.5")
      .from(".hero__sub", { y: 28, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.45")
      .from(".hero__ctas .btn", { y: 22, opacity: 0, stagger: 0.1, duration: 0.55, ease: "power3.out" }, "-=0.4")
      .from(".hero__cup", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
      .from(".hero__scrollhint", { opacity: 0, duration: 0.6 }, "-=0.2");

    /* steam loop */
    gsap.to(".steam__line", {
      opacity: 0.7,
      y: -8,
      duration: 1.6,
      stagger: 0.35,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  if (document.fonts && document.fonts.ready) {
    var fontsDone = false;
    document.fonts.ready.then(function () {
      if (!fontsDone) { fontsDone = true; runIntro(); }
    });
    // hard cap: never hold the curtain longer than 2.5s
    setTimeout(function () {
      if (!fontsDone) { fontsDone = true; runIntro(); }
    }, 2500);
  } else {
    runIntro();
  }

  /* ---------- scroll reveals ---------- */
  if (!prefersReduced) {
    gsap.utils.toArray(".reveal").forEach(function (el) {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });

    /* marquee scrub-ish drift */
    var track = document.querySelector(".marquee__track");
    var half = track.scrollWidth / 2;
    gsap.to(track, { x: -half, duration: 28, ease: "none", repeat: -1 });

    /* truck drives across on scroll */
    var road = document.querySelector(".road");
    var truck = document.querySelector(".truck");
    var wheels = document.querySelectorAll("[data-wheel]");
    gsap.fromTo(truck,
      { x: function () { return -truck.getBoundingClientRect().width - 40; } },
      {
        x: function () { return road.offsetWidth + 40; },
        ease: "none",
        scrollTrigger: {
          trigger: road,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var spin = self.progress * 1080;
            wheels.forEach(function (w) { w.style.transform = "rotate(" + spin + "deg)"; });
          }
        }
      });

    /* footer big word parallax */
    gsap.from(".footer__big", {
      yPercent: 40,
      ease: "none",
      scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true
      }
    });

    /* find-us title chars */
    var findTitle = new SplitText(".find__title", { type: "words" });
    gsap.from(findTitle.words, {
      yPercent: 60,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".find__inner", start: "top 80%" }
    });
  }

  /* refresh after everything (fonts can change layout) */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
