(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doorsChapter = document.getElementById("doors");
  let doorsOpen = false;
  let magicOpened = false;
  let lenis;
  let doorsTrigger;
  let scrollLocked = false;

  function atClosedDoors() {
    return !doorsOpen && doorsTrigger && doorsTrigger.isActive;
  }

  function lockDoorScroll() {
    if (scrollLocked || doorsOpen) return;
    scrollLocked = true;
    document.documentElement.classList.add("is-door-locked");
    if (lenis) lenis.stop();
  }

  function unlockDoorScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.documentElement.classList.remove("is-door-locked");
    if (lenis) lenis.start();
  }

  function holdAtDoors() {
    if (doorsOpen || !doorsTrigger) return;
    const top = doorsTrigger.start;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
    doorsTrigger.scroll(top);
  }

  function blockBypass(event) {
    if (!scrollLocked || doorsOpen) return;
    const key = event.key;
    const scrollKey =
      event.type === "keydown" &&
      (key === " " ||
        key === "Spacebar" ||
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "PageDown" ||
        key === "PageUp" ||
        key === "Home" ||
        key === "End");
    if (event.type === "keydown" && !scrollKey) return;
    event.preventDefault();
    holdAtDoors();
  }

  function preload() {
    return Promise.all(
      [
        "assets/frame-01-temple-exterior.jpeg",
        "assets/frame-02-temple-entrance.jpeg",
        "assets/frame-03-doors-closed.jpeg",
        "assets/frame-06-english-invitation.jpeg",
        "assets/frame-07-telugu-invitation.jpeg",
        "assets/frame-08-more-than-celebration.jpeg",
        "assets/frame-09-counting-days.jpeg",
        "assets/frame-10-logo-reveal.jpeg",
        "assets/frame-11-illuminated-ganapati.jpeg",
        "assets/frame-13-golden-rays.jpeg",
        "assets/frame-14-donation-qr.jpeg",
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
    if (doorsOpen) return;
    doorsOpen = true;
    TempleAudio.playBell();
    TempleAudio.startMusic();
    doorsChapter.classList.add("is-open");
    document.getElementById("doorPair").setAttribute("aria-expanded", "true");
    const hint = document.getElementById("doorHint");
    if (hint) hint.hidden = true;

    const video = document.getElementById("blueTempleVideo");
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    const left = document.getElementById("doorLeft");
    const right = document.getElementById("doorRight");
    const beyond = document.querySelector(".door-beyond");
    const pair = document.getElementById("doorPair");

    gsap.set(left, { transformOrigin: "left center", transformPerspective: 1600 });
    gsap.set(right, { transformOrigin: "right center", transformPerspective: 1600 });

    const finish = () => {
      unlockDoorScroll();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      window.setTimeout(() => goTo("invitation"), 1000);
    };

    if (reduced) {
      gsap.set(left, { rotateY: -105 });
      gsap.set(right, { rotateY: 105 });
      gsap.set(beyond, { filter: "brightness(1)" });
      finish();
      return;
    }

    gsap
      .timeline({ onComplete: finish })
      .to(beyond, { filter: "brightness(1)", duration: 0.9, ease: "power1.out" }, 0)
      .to(left, { rotateY: -118, duration: 1.7, ease: "power2.inOut" }, 0)
      .to(right, { rotateY: 118, duration: 1.7, ease: "power2.inOut" }, 0)
      .to(pair, { opacity: 0.12, duration: 0.45, ease: "power1.out" }, 1.15);
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

    doorsTrigger = ScrollTrigger.create({
      trigger: "#doors",
      start: "top top",
      end: () => (doorsOpen ? "+=18%" : "+=120%"),
      pin: true,
      anticipatePin: 1,
      onEnter: lockDoorScroll,
      onEnterBack: lockDoorScroll,
      onUpdate: (self) => {
        if (!doorsOpen && self.scroll() > self.start + 2) {
          holdAtDoors();
        }
      },
      onLeave: () => {
        if (!doorsOpen) holdAtDoors();
      },
    });

    pinFrame("#invitation", "+=70%").fromTo(
      "#bookletPage",
      { rotateY: 0 },
      { rotateY: -180, ease: "none" },
      0
    );

    pinFrame("#blessing", "+=100%")
      .to(".is-glow", { opacity: 1, ease: "power1.inOut", duration: 0.5 }, 0)
      .to(".is-logo", { opacity: 0, ease: "power1.inOut", duration: 0.5 }, 0)
      .to(".is-rays", { opacity: 1, ease: "power1.inOut", duration: 0.5 }, 0.5)
      .to(".is-glow", { opacity: 0, ease: "power1.inOut", duration: 0.5 }, 0.5);
  }

  function handleUpiClick(e) {
    const upiUri = "upi://pay?pa=9849590408-1@okbizaxis&pn=BHIMAVARAPU%20PHANEENDRA%20REDDY&mc=5812&aid=uGICAgICd_a2yOQ&ver=01&mode=01&tr=BCR2DN6TUXLY7HAC";
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText("9849590408-1@okbizaxis").catch(() => {});
    }

    const toast = document.getElementById("upiToast");
    if (toast) {
      toast.textContent = "Opening UPI App / Copied UPI ID";
      toast.hidden = false;
      toast.classList.add("is-visible");
      window.clearTimeout(window._upiToastTimer);
      window._upiToastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => { toast.hidden = true; }, 300);
      }, 3000);
    }
  }

  function bind() {
    document.getElementById("doorLeft").addEventListener("click", openDoors);
    document.getElementById("doorRight").addEventListener("click", openDoors);
    document.getElementById("doorPair").addEventListener("click", openDoors);
    document.getElementById("magicBtn").addEventListener("click", openMagic);
    document.getElementById("musicToggle").addEventListener("click", () => TempleAudio.toggleMusic());
    const upiQrBtn = document.getElementById("upiQrBtn");
    const upiNumberBtn = document.getElementById("upiNumberBtn");
    if (upiQrBtn) upiQrBtn.addEventListener("click", handleUpiClick);
    if (upiNumberBtn) upiNumberBtn.addEventListener("click", handleUpiClick);
    const video = document.getElementById("blueTempleVideo");
    if (video) {
      video.addEventListener("ended", () => {
        video.pause();
      });
    }
    document.getElementById("exitBtn").addEventListener("click", () => {
      const next = new URLSearchParams(window.location.search);
      next.set("replay", String(Date.now()));
      window.location.href = window.location.pathname + "?" + next.toString();
    });
    window.addEventListener("wheel", blockBypass, { passive: false, capture: true });
    window.addEventListener("touchmove", blockBypass, { passive: false, capture: true });
    window.addEventListener("keydown", blockBypass, { capture: true });
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
      return;
    }
    TempleAudio.init();
    TempleCountdown.start();
    document.getElementById("loader").classList.add("is-gone");
    bind();
    setupScroll();
  });
})();
