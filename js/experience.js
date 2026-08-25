(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doorsChapter = document.getElementById("doors");
  let doorsOpen = false;
  let magicOpened = false;
  let lenis;
  let doorsTrigger;

  function preload() {
    return Promise.all(
      [
        "assets/frame-01-temple-exterior.jpeg",
        "assets/frame-02-temple-entrance.jpeg",
        "assets/frame-03-doors-closed.jpeg",
        "assets/frame-05-blue-temple-title.jpeg",
        "assets/frame-06-english-invitation.jpeg",
        "assets/frame-07-telugu-invitation.jpeg",
        "assets/frame-08-more-than-celebration.jpeg",
        "assets/frame-09-counting-days.jpeg",
        "assets/frame-10-logo-reveal.jpeg",
        "assets/frame-11-illuminated-ganapati.jpeg",
        "assets/frame-13-golden-rays.jpeg",
        "assets/frame-14-donation-qr.jpeg",
        "assets/Marigold-1.png",
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
      lenis.scrollTo(el, { duration: 1.1 });
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

    const left = document.getElementById("doorLeft");
    const right = document.getElementById("doorRight");
    const beyond = document.querySelector(".door-beyond");
    const pair = document.getElementById("doorPair");

    gsap.set(left, { transformOrigin: "left center", transformPerspective: 1600 });
    gsap.set(right, { transformOrigin: "right center", transformPerspective: 1600 });

    const finish = () => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      window.setTimeout(() => goTo("invitation"), 500);
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
      .to(left, { rotateY: -118, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(right, { rotateY: 118, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(pair, { opacity: 0.12, duration: 0.45, ease: "power1.out" }, 1.05);
  }

  function spawnFlowerBurst(e) {
    TempleAudio.playBell();
    const posterFit = document.querySelector("#countdown .poster-fit");
    if (!posterFit) return;
    const rect = posterFit.getBoundingClientRect();

    let originX = rect.width * 0.5;
    let originY = rect.height * 0.54;

    const clientX = e && e.touches && e.touches[0] ? e.touches[0].clientX : (e ? e.clientX : null);
    const clientY = e && e.touches && e.touches[0] ? e.touches[0].clientY : (e ? e.clientY : null);

    if (typeof clientX === "number" && typeof clientY === "number" && (clientX !== 0 || clientY !== 0)) {
      originX = clientX - rect.left;
      originY = clientY - rect.top;
    }

    const flowerCount = 26;
    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement("img");
      flower.src = "assets/Marigold-1.png";
      flower.className = "marigold-petal";
      flower.alt = "";
      posterFit.appendChild(flower);

      const angle = (Math.PI * 2 * i) / flowerCount + (Math.random() - 0.5) * 0.6;
      const distance = 90 + Math.random() * 260;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - (40 + Math.random() * 70);
      const gravityY = destY + 90 + Math.random() * 120;
      const scale = 0.35 + Math.random() * 0.55;
      const rot = -360 + Math.random() * 720;
      const duration = 1.4 + Math.random() * 0.8;

      gsap.set(flower, {
        x: originX - 25,
        y: originY - 25,
        scale: 0.1,
        rotation: Math.random() * 180,
        opacity: 1
      });

      gsap.timeline({
        onComplete: () => {
          flower.remove();
        }
      })
      .to(flower, {
        x: originX - 25 + destX,
        y: originY - 25 + destY,
        scale: scale,
        rotation: rot * 0.5,
        duration: duration * 0.45,
        ease: "power2.out"
      }, 0)
      .to(flower, {
        x: originX - 25 + destX + (Math.random() - 0.5) * 40,
        y: originY - 25 + gravityY,
        rotation: rot,
        opacity: 0,
        duration: duration * 0.55,
        ease: "power1.in"
      }, duration * 0.45);
    }
  }

  function openMagic(e) {
    spawnFlowerBurst(e);
    if (!magicOpened) {
      magicOpened = true;
      document.getElementById("countdown").classList.add("is-magic");
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  }

  function pinFrame(trigger, end, vars) {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        ...vars,
      },
    });
  }

  function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis && !reduced) {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
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

    pinFrame("#approach", "+=35%")
      .to(entrance, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0);

    doorsTrigger = ScrollTrigger.create({
      trigger: "#doors",
      start: "top top",
      end: () => (doorsOpen ? "+=0%" : "+=80%"),
      pin: true,
      anticipatePin: 1,
    });

    pinFrame("#invitation", "+=60%").fromTo(
      "#bookletPage",
      { rotateY: 0 },
      { rotateY: -180, ease: "none" },
      0
    );

    pinFrame("#blessing", "+=80%")
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
    document.getElementById("doorHint").addEventListener("click", openDoors);
    document.getElementById("magicBtn").addEventListener("click", openMagic);
    document.getElementById("musicToggle").addEventListener("click", () => TempleAudio.toggleMusic());
    const upiQrBtn = document.getElementById("upiQrBtn");
    const upiNumberBtn = document.getElementById("upiNumberBtn");
    if (upiQrBtn) upiQrBtn.addEventListener("click", handleUpiClick);
    if (upiNumberBtn) upiNumberBtn.addEventListener("click", handleUpiClick);
    document.getElementById("exitBtn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  Promise.all([preload()]).then(() => {
    TempleAudio.init();
    TempleCountdown.start();
    document.getElementById("loader").classList.add("is-gone");
    bind();
    setupScroll();
  });
})();
