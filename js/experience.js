(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doorsChapter = document.getElementById("doors");
  let doorsOpen = false;
  let lenis;

  function preload() {
    return Promise.all(
      [
        "assets/frame-01-temple-exterior.jpeg",
        "assets/frame-02-temple-entrance.jpeg",
        "assets/frame-03-doors-closed.jpeg",
        "assets/frame-05-blue-temple-title.jpeg",
        "assets/frame-09-counting-days.jpeg",
      ].map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = src;
          })
      )
    );
  }

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.05 });
      return;
    }
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  function openDoors() {
    if (!doorsOpen) {
      doorsOpen = true;
      TempleAudio.playBell();
      TempleAudio.startMusic();
      if (doorsChapter) doorsChapter.classList.add("is-open");
      const pair = document.getElementById("doorPair");
      if (pair) pair.setAttribute("aria-expanded", "true");
      const hint = document.getElementById("doorHint");
      if (hint) hint.hidden = true;
    }
    goTo("invitation");
  }

  function openMagic() {
    TempleAudio.playBell();
    const countdown = document.getElementById("countdown");
    if (countdown) countdown.classList.add("is-magic");
    goTo("blessing");
  }

  function handleUpiClick() {
    const toast = document.getElementById("upiToast");
    if (toast) {
      toast.classList.add("is-visible");
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 2800);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText("9849590408").catch(() => {});
    }
  }

  function pinFrame(trigger, end, vars) {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        ...vars,
      },
    });
  }

  function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis && !reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const wide = document.querySelector("#approach .is-wide");
    const entrance = document.querySelector("#approach .is-entrance");

    if (reduced) {
      if (entrance) entrance.style.opacity = "1";
      return;
    }

    // Approach
    pinFrame("#approach", "+=50%")
      .fromTo(wide, { scale: 1 }, { scale: 1.18, ease: "none" }, 0)
      .to(entrance, { opacity: 1, duration: 0.28 }, 0.4)
      .fromTo(entrance, { scale: 1.02 }, { scale: 1.1, ease: "none" }, 0.4);

    // Temple Doors - smooth scrub opening on scroll
    const left = document.getElementById("doorLeft");
    const right = document.getElementById("doorRight");
    const beyond = document.querySelector(".door-beyond");
    const pair = document.getElementById("doorPair");

    if (left && right) {
      gsap.set(left, { transformOrigin: "left center", transformPerspective: 1600 });
      gsap.set(right, { transformOrigin: "right center", transformPerspective: 1600 });

      pinFrame("#doors", "+=80%", {
        onEnter: () => {
          if (!doorsOpen) {
            TempleAudio.startMusic();
          }
        },
      })
        .to(beyond, { filter: "brightness(1)", ease: "power1.out" }, 0)
        .to(left, { rotateY: -118, ease: "power2.inOut" }, 0)
        .to(right, { rotateY: 118, ease: "power2.inOut" }, 0)
        .to(pair, { opacity: 0.08, ease: "power1.out" }, 0.6)
        .to("#doorHint", { opacity: 0, duration: 0.2 }, 0);
    }

    // Booklet 3D flip
    pinFrame("#invitation", "+=70%").fromTo(
      "#bookletPage",
      { rotateY: 0 },
      { rotateY: -180, ease: "none" },
      0
    );

    // Divine blessing
    pinFrame("#blessing", "+=110%")
      .fromTo(".is-logo", { scale: 0.92 }, { scale: 1.04, ease: "none" }, 0)
      .to(".is-glow", { opacity: 1 }, 0.22)
      .to(".is-gold", { opacity: 1 }, 0.48)
      .to(".is-rays", { opacity: 1 }, 0.72)
      .to(".is-logo", { opacity: 0 }, 0.76)
      .to(".is-glow", { opacity: 0 }, 0.84)
      .to(".is-gold", { opacity: 0 }, 0.9);
  }

  function bind() {
    const doorLeft = document.getElementById("doorLeft");
    const doorRight = document.getElementById("doorRight");
    const doorPair = document.getElementById("doorPair");
    const doorHint = document.getElementById("doorHint");
    const magicBtn = document.getElementById("magicBtn");
    const musicToggle = document.getElementById("musicToggle");
    const exitBtn = document.getElementById("exitBtn");
    const qrHotspot = document.getElementById("qrHotspot");
    const phoneHotspot = document.getElementById("phoneHotspot");

    if (doorLeft) doorLeft.addEventListener("click", openDoors);
    if (doorRight) doorRight.addEventListener("click", openDoors);
    if (doorPair) doorPair.addEventListener("click", openDoors);
    if (doorHint) doorHint.addEventListener("click", openDoors);
    if (magicBtn) magicBtn.addEventListener("click", openMagic);
    if (musicToggle) musicToggle.addEventListener("click", () => TempleAudio.toggleMusic());
    if (qrHotspot) qrHotspot.addEventListener("click", handleUpiClick);
    if (phoneHotspot) phoneHotspot.addEventListener("click", handleUpiClick);

    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        const next = new URLSearchParams(window.location.search);
        next.set("replay", String(Date.now()));
        window.location.href = window.location.pathname + "?" + next.toString();
      });
    }
  }

  Promise.all([preload()]).then(() => {
    const params = new URLSearchParams(window.location.search);
    const isEmbed = params.has("embed");
    const isWide = window.matchMedia("(min-width: 768px)").matches;

    if (isWide && !isEmbed) {
      const wrap = document.getElementById("phonePreviewWrap");
      const frame = document.getElementById("phonePreview");
      const next = new URLSearchParams();
      next.set("embed", "1");
      if (params.get("replay")) next.set("replay", params.get("replay"));
      frame.src = window.location.pathname + "?" + next.toString();
      wrap.hidden = false;
      wrap.removeAttribute("hidden");
      document.body.classList.add("is-desktop-preview");
      document.getElementById("loader").classList.add("is-gone");

      window.addEventListener("wheel", (e) => {
        try {
          if (frame && frame.contentWindow) {
            frame.contentWindow.scrollBy({ top: e.deltaY, behavior: "auto" });
          }
        } catch (_) {}
      }, { passive: true });

      return;
    }

    TempleAudio.init();
    TempleCountdown.start();
    document.getElementById("loader").classList.add("is-gone");
    bind();
    setupScroll();
  });
})();
