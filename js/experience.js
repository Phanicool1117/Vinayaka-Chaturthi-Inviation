(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doorsChapter = document.getElementById("doors");
  let doorsOpen = false;
  let magicOpened = false;
  let lenis;

  function preload() {
    return Promise.all(
      [
        "assets/frame-01-temple-exterior.jpeg",
        "assets/frame-02-temple-entrance.jpeg",
        "assets/frame-03-doors-closed.jpeg",
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
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.05 });
      return;
    }
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  function openDoors() {
    TempleAudio.playBell();
    if (doorsOpen) return;
    doorsOpen = true;
    doorsChapter.classList.add("is-open");
    document.getElementById("doorPair").setAttribute("aria-expanded", "true");
    const hint = document.getElementById("doorHint");
    if (hint) hint.hidden = true;
    TempleAudio.startMusic();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    window.setTimeout(() => goTo("invitation"), 850);
  }

  function openMagic() {
    TempleAudio.playBell();
    if (magicOpened) return;
    magicOpened = true;
    document.getElementById("countdown").classList.add("is-magic");
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    window.setTimeout(() => goTo("blessing"), 180);
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
      entrance.style.opacity = "1";
      return;
    }

    pinFrame("#approach", "+=45%")
      .fromTo(wide, { scale: 1 }, { scale: 1.18, ease: "none" }, 0)
      .to(entrance, { opacity: 1, duration: 0.28 }, 0.4)
      .fromTo(entrance, { scale: 1.02 }, { scale: 1.1, ease: "none" }, 0.4);

    ScrollTrigger.create({
      trigger: "#doors",
      start: "top top",
      end: () => (doorsOpen ? "+=8%" : "+=40%"),
      pin: true,
      anticipatePin: 1,
    });

    pinFrame("#invitation", "+=70%").fromTo(
      "#bookletPage",
      { rotateY: 0 },
      { rotateY: -180, ease: "none" },
      0
    );

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
    document.getElementById("doorLeft").addEventListener("click", openDoors);
    document.getElementById("doorRight").addEventListener("click", openDoors);
    document.getElementById("magicBtn").addEventListener("click", openMagic);
    document.getElementById("musicToggle").addEventListener("click", () => TempleAudio.toggleMusic());
    document.getElementById("exitBtn").addEventListener("click", () => {
      window.location.href = window.location.pathname.split("?")[0] + "?replay=" + Date.now();
    });
  }

  Promise.all([preload()]).then(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      const gate = document.getElementById("deviceGate");
      gate.hidden = false;
      gate.removeAttribute("hidden");
      document.body.classList.add("is-desktop");
      document.getElementById("loader").classList.add("is-gone");
      return;
    }
    TempleAudio.init();
    TempleCountdown.start();
    document.getElementById("loader").classList.add("is-gone");
    bind();
    setupScroll();
  });
})();
