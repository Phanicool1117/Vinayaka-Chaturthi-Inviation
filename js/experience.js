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
    if (doorsOpen) return;
    scrollLocked = true;
    document.documentElement.classList.add("is-door-locked");
    holdAtDoors();
    if (lenis) lenis.stop();
  }

  function unlockDoorScroll() {
    scrollLocked = false;
    document.documentElement.classList.remove("is-door-locked");
    if (lenis) lenis.start();
  }

  function holdAtDoors() {
    if (doorsOpen || !doorsTrigger) return;
    const top = doorsTrigger.start;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    window.scrollTo(0, top);
    if (doorsTrigger.scroll) doorsTrigger.scroll(top);
  }

  function blockBypass(event) {
    if (doorsOpen || !doorsTrigger) return;
    const currentScroll = lenis ? lenis.scroll : window.scrollY;
    if (currentScroll >= doorsTrigger.start - 10) {
      if (event.type === "wheel" && event.deltaY > 0) {
        event.preventDefault();
        holdAtDoors();
        return;
      }
      if (event.type === "touchmove") {
        event.preventDefault();
        holdAtDoors();
        return;
      }
      if (event.type === "keydown") {
        const key = event.key;
        const scrollDownKey =
          key === " " ||
          key === "Spacebar" ||
          key === "ArrowDown" ||
          key === "PageDown" ||
          key === "End";
        if (scrollDownKey) {
          event.preventDefault();
          holdAtDoors();
          return;
        }
      }
    }
  }

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

    const left = document.getElementById("doorLeft");
    const right = document.getElementById("doorRight");
    const beyond = document.querySelector(".door-beyond");
    const pair = document.getElementById("doorPair");

    gsap.set(left, { transformOrigin: "left center", transformPerspective: 1600 });
    gsap.set(right, { transformOrigin: "right center", transformPerspective: 1600 });

    const finish = () => {
      unlockDoorScroll();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      window.setTimeout(() => goTo("invitation"), 650);
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

  function spawnFlowerBurst(e) {
    TempleAudio.playBell();
    const posterFit = document.querySelector("#countdown .poster-fit");
    if (!posterFit) return;
    const rect = posterFit.getBoundingClientRect();

    let originX = rect.width * 0.5;
    let originY = rect.height * 0.54;

    if (e && typeof e.clientX === "number" && typeof e.clientY === "number" && (e.clientX !== 0 || e.clientY !== 0)) {
      originX = e.clientX - rect.left;
      originY = e.clientY - rect.top;
    }

    const flowerCount = 28;
    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement("img");
      flower.src = "assets/Marigold-1.png";
      flower.className = "marigold-petal";
      flower.alt = "";
      posterFit.appendChild(flower);

      const angle = (Math.PI * 2 * i) / flowerCount + (Math.random() - 0.5) * 0.6;
      const distance = 90 + Math.random() * 280;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - (40 + Math.random() * 70);
      const gravityY = destY + 90 + Math.random() * 130;
      const scale = 0.35 + Math.random() * 0.6;
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
        x: originX - 25 + destX + (Math.random() - 0.5) * 50,
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
    }
  }

  function pinFrame(trigger, end, vars) {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end,
        scrub: 0.7,
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
        lerp: 0.07,
        smoothWheel: true,
        wheelMultiplier: 0.65,
        touchMultiplier: 0.85,
        duration: 1.2,
      });
      lenis.on("scroll", (e) => {
        if (!doorsOpen && doorsTrigger && e.scroll > doorsTrigger.start) {
          holdAtDoors();
        }
        ScrollTrigger.update();
      });
      gsap.ticker.add((time) => {
        if (lenis) {
          if (!doorsOpen && doorsTrigger && lenis.scroll > doorsTrigger.start) {
            holdAtDoors();
          }
          lenis.raf(time * 1000);
        }
      });
      gsap.ticker.lagSmoothing(0);
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!doorsOpen && doorsTrigger && window.scrollY > doorsTrigger.start + 1) {
          holdAtDoors();
        }
      },
      { passive: false }
    );

    const wide = document.querySelector("#approach .is-wide");
    const entrance = document.querySelector("#approach .is-entrance");

    if (reduced) {
      entrance.style.opacity = "1";
      return;
    }

    pinFrame("#approach", "+=40%")
      .to(entrance, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0);

    doorsTrigger = ScrollTrigger.create({
      trigger: "#doors",
      start: "top top",
      end: () => (doorsOpen ? "+=0%" : "+=999999px"),
      pin: true,
      anticipatePin: 1,
      onEnter: lockDoorScroll,
      onEnterBack: lockDoorScroll,
      onUpdate: (self) => {
        if (!doorsOpen && self.scroll() > self.start) {
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

    pinFrame("#story", "+=50%");

    pinFrame("#countdown", "+=60%");

    let hasAutoAdvancedToDonation = false;
    pinFrame("#blessing", "+=60%", {
      onUpdate: (self) => {
        if (self.progress >= 0.85 && !hasAutoAdvancedToDonation) {
          hasAutoAdvancedToDonation = true;
          window.setTimeout(() => {
            goTo("donation");
          }, 600);
        } else if (self.progress < 0.3) {
          hasAutoAdvancedToDonation = false;
        }
      },
    })
      .to(".is-glow", { opacity: 1, ease: "power1.inOut", duration: 0.5 }, 0)
      .to(".is-logo", { opacity: 0, ease: "power1.inOut", duration: 0.5 }, 0)
      .to(".is-rays", { opacity: 1, ease: "power1.inOut", duration: 0.5 }, 0.5)
      .to(".is-glow", { opacity: 0, ease: "power1.inOut", duration: 0.5 }, 0.5);

    const chapters = gsap.utils.toArray(".chapter");
    ScrollTrigger.create({
      snap: {
        snapTo: (value) => {
          const max = ScrollTrigger.maxScroll(window);
          if (!max || chapters.length === 0) return value;
          const targetPx = value * max;
          let closestPx = targetPx;
          let minDistance = Infinity;

          chapters.forEach((ch) => {
            const top = ch.offsetTop;
            const dist = Math.abs(targetPx - top);
            if (dist < minDistance) {
              minDistance = dist;
              closestPx = top;
            }
          });

          ScrollTrigger.getAll().forEach((st) => {
            if (st.pin && st.start !== undefined) {
              const dStart = Math.abs(targetPx - st.start);
              if (dStart < minDistance) {
                minDistance = dStart;
                closestPx = st.start;
              }
              if (st.end !== undefined && st.end < 900000) {
                const dEnd = Math.abs(targetPx - st.end);
                if (dEnd < minDistance) {
                  minDistance = dEnd;
                  closestPx = st.end;
                }
              }
            }
          });

          return closestPx / max;
        },
        duration: { min: 0.25, max: 0.55 },
        delay: 0.12,
        ease: "power1.inOut",
      },
    });
  }

  function handleUpiClick(e) {
    const isNumber = e && e.currentTarget && e.currentTarget.id === "upiNumberBtn";
    const textToCopy = isNumber ? "9849590408" : "9849590408-1@okbizaxis";
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    const toast = document.getElementById("upiToast");
    if (toast) {
      toast.textContent = isNumber ? "✅ Copied Phone: 9849590408" : "✅ Copied UPI ID: 9849590408-1@okbizaxis";
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
    document.getElementById("doors").addEventListener("click", openDoors);
    document.getElementById("magicBtn").addEventListener("click", openMagic);
    document.getElementById("musicToggle").addEventListener("click", () => TempleAudio.toggleMusic());
    
    const upiQrBtn = document.getElementById("upiQrBtn");
    const upiNumberBtn = document.getElementById("upiNumberBtn");
    if (upiQrBtn) upiQrBtn.addEventListener("click", handleUpiClick);
    if (upiNumberBtn) upiNumberBtn.addEventListener("click", handleUpiClick);

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
