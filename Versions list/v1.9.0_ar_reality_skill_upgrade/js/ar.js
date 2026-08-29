(function () {
  const video = document.getElementById("cameraFeed");
  const mandapamRig = document.getElementById("mandapamRig");
  const promptOverlay = document.getElementById("arPromptOverlay");
  const startArBtn = document.getElementById("startArBtn");
  const scannerOverlay = document.getElementById("arScannerOverlay");
  const scanStatusText = document.getElementById("scanStatusText");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const autoplayArBtn = document.getElementById("autoplayArBtn");
  const recenterBtn = document.getElementById("recenterBtn");
  const hangingBell = document.getElementById("hangingBell");
  const invitationFrame = document.getElementById("invitationFrame");
  const petalCanvas = document.getElementById("petalCanvas");
  const gesturePlane = document.getElementById("gesturePlane");

  // Modals & Hotspots
  const scheduleModal = document.getElementById("arScheduleModal");
  const donateModal = document.getElementById("arDonateModal");
  const closeScheduleBtn = document.getElementById("closeScheduleBtn");
  const closeDonateBtn = document.getElementById("closeDonateBtn");
  const hotspotSchedule = document.getElementById("hotspotSchedule");
  const hotspotDonate = document.getElementById("hotspotDonate");
  const copyUpiBtn = document.getElementById("arCopyUpiBtn");
  const copyPhoneBtn = document.getElementById("arCopyPhoneBtn");

  const UPI_ID = "Q178007075@ybl";
  const PHONE_NO = "8977237075";

  let isSoundActive = false;
  let isAutoplayActive = true;

  // Spatial Transformation State (Realistic Room Distance)
  const baseRotX = 18;
  const baseRotY = 0;
  const baseScale = 0.78;
  const basePosZ = -140;
  const basePosX = 0;
  const basePosY = 20;

  let rotX = baseRotX;
  let rotY = baseRotY;
  let scale = baseScale;
  let posX = basePosX;
  let posY = basePosY;

  // Gyroscope tracking
  let initialBeta = null;
  let initialGamma = null;
  let gyroRotX = 0;
  let gyroRotY = 0;

  // Gesture state
  let isDragging = false;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let initialPinchDist = null;
  let initialScale = baseScale;
  let initialPanX = 0;
  let initialPanY = 0;
  let initialTouchMidX = 0;
  let initialTouchMidY = 0;

  const bellAudio = new Audio("audio/temple-bell.mp3");

  // ==========================================
  // 1. Camera & AR Scanner Lifecycle
  // ==========================================
  async function launchArExperience() {
    try {
      if (promptOverlay) promptOverlay.hidden = true;
      if (scannerOverlay) scannerOverlay.classList.remove("is-hidden");
      if (scanStatusText) scanStatusText.textContent = "🔍 Preparing 3D Camera View...";

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings ? track.getSettings() : {};
      if (settings.facingMode === "environment" || !settings.facingMode) {
        video.classList.add("is-environment");
      }

      requestGyro();

      // Scanner animation sequence
      window.setTimeout(() => {
        if (scanStatusText) scanStatusText.textContent = "✨ Ready!";
      }, 1200);

      window.setTimeout(() => {
        if (scannerOverlay) scannerOverlay.classList.add("is-hidden");
        if (mandapamRig) {
          mandapamRig.classList.remove("is-materializing");
          void mandapamRig.offsetWidth;
          mandapamRig.classList.add("is-materializing");
        }
        ringBell();
        setSound(true);
      }, 1800);

    } catch (err) {
      console.warn("Camera permission not granted:", err);
      if (scannerOverlay) scannerOverlay.classList.add("is-hidden");
      if (promptOverlay) {
        promptOverlay.hidden = false;
        const pDesc = document.getElementById("promptDesc");
        if (pDesc) {
          pDesc.textContent = "Camera access was not enabled. You can click 'View AR Experience' again to allow camera, or continue directly to the website.";
        }
      }
    }
  }

  // ==========================================
  // 2. Gyroscope Spatial Perspective
  // ==========================================
  function requestGyro() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", onGyro, true);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener("deviceorientation", onGyro, true);
    }
  }

  function onGyro(e) {
    if (e.beta === null || e.gamma === null) return;

    if (initialBeta === null) {
      initialBeta = e.beta;
      initialGamma = e.gamma;
    }

    gyroRotY = Math.max(-18, Math.min(18, (e.gamma - initialGamma) * 0.35));
    gyroRotX = Math.max(-18, Math.min(18, (e.beta - initialBeta) * 0.35));

    applyTransform();
  }

  // ==========================================
  // 3. Unified 3D Spatial Rig Transform
  // ==========================================
  function applyTransform() {
    if (!mandapamRig) return;
    const finalRotX = rotX - gyroRotX;
    const finalRotY = rotY + gyroRotY;
    mandapamRig.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, ${basePosZ}px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function recenter() {
    initialBeta = null;
    initialGamma = null;
    gyroRotX = 0;
    gyroRotY = 0;
    rotX = baseRotX;
    rotY = baseRotY;
    scale = baseScale;
    posX = basePosX;
    posY = basePosY;
    applyTransform();
  }

  // ==========================================
  // 4. Reliable 3D Touch & Gesture Controller
  // ==========================================
  function setupGestures() {
    const target = gesturePlane || window;

    // Mouse / Desktop pointer events
    target.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".ar-prompt-card") || e.target.closest(".ar-modal-card")) return;
      isDragging = true;
      lastTouchX = e.clientX;
      lastTouchY = e.clientY;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastTouchX;
      const dy = e.clientY - lastTouchY;
      lastTouchX = e.clientX;
      lastTouchY = e.clientY;

      rotY += dx * 0.45;
      rotX = Math.max(-40, Math.min(60, rotX - dy * 0.35));
      applyTransform();
    });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    });

    window.addEventListener("pointercancel", () => {
      isDragging = false;
    });

    // Touch events for Mobile Devices
    target.addEventListener("touchstart", (e) => {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".ar-prompt-card") || e.target.closest(".ar-modal-card")) return;

      if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialScale = scale;

        initialTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        initialTouchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        initialPanX = posX;
        initialPanY = posY;
      }
    }, { passive: true });

    target.addEventListener("touchmove", (e) => {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".ar-prompt-card") || e.target.closest(".ar-modal-card")) return;

      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;

        rotY += dx * 0.45;
        rotX = Math.max(-40, Math.min(60, rotX - dy * 0.35));
        applyTransform();
      } else if (e.touches.length === 2 && initialPinchDist) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = currentDist / initialPinchDist;
        scale = Math.max(0.35, Math.min(2.5, initialScale * factor));

        // Two-finger pan
        const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        posX = initialPanX + (currentMidX - initialTouchMidX) * 0.8;
        posY = initialPanY + (currentMidY - initialTouchMidY) * 0.8;

        applyTransform();
      }
    }, { passive: true });

    target.addEventListener("touchend", (e) => {
      if (e.touches.length === 0) {
        isDragging = false;
        initialPinchDist = null;
      } else if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        initialPinchDist = null;
      }
    }, { passive: true });

    // Wheel zoom on desktop
    target.addEventListener("wheel", (e) => {
      if (e.target.closest(".ar-prompt-card") || e.target.closest(".ar-modal-card")) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.06 : -0.06;
      scale = Math.max(0.35, Math.min(2.5, scale + delta));
      applyTransform();
    }, { passive: false });
  }

  // ==========================================
  // 5. 3D Marigold Petal Physics Engine
  // ==========================================
  const petals = [];
  const petalColors = [
    { fill: "#ff9900", stroke: "#e67300" },
    { fill: "#ffcc00", stroke: "#e6b800" },
    { fill: "#e63946", stroke: "#b5172b" },
    { fill: "#ffd166", stroke: "#d4a338" }
  ];

  function initPetals() {
    if (!petalCanvas) return;
    const ctx = petalCanvas.getContext("2d");
    const count = 35;

    function resize() {
      petalCanvas.width = window.innerWidth * window.devicePixelRatio;
      petalCanvas.height = window.innerHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      petals.push(createPetal(true));
    }

    function createPetal(randomY) {
      return {
        x: Math.random() * petalCanvas.width,
        y: randomY ? Math.random() * petalCanvas.height : -30,
        size: (Math.random() * 8 + 7) * window.devicePixelRatio,
        speedY: (Math.random() * 1.3 + 0.8) * window.devicePixelRatio,
        speedX: (Math.random() * 0.8 - 0.4) * window.devicePixelRatio,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.04 - 0.02),
        osc: Math.random() * Math.PI * 2,
        oscSpeed: Math.random() * 0.03 + 0.01,
        color: petalColors[Math.floor(Math.random() * petalColors.length)]
      };
    }

    function spawnBurst(originX, originY) {
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.2;
        const spd = (Math.random() * 4 + 2) * window.devicePixelRatio;
        petals.push({
          x: originX * window.devicePixelRatio,
          y: originY * window.devicePixelRatio,
          size: (Math.random() * 9 + 8) * window.devicePixelRatio,
          speedY: Math.sin(angle) * spd,
          speedX: Math.cos(angle) * spd,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.08 - 0.04),
          osc: 0,
          oscSpeed: 0.03,
          color: petalColors[Math.floor(Math.random() * petalColors.length)]
        });
      }
    }

    window._spawnArFlowerBurst = spawnBurst;

    function render() {
      ctx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.osc += p.oscSpeed;
        p.x += p.speedX + Math.sin(p.osc) * 0.8 * window.devicePixelRatio;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color.fill;
        ctx.strokeStyle = p.color.stroke;
        ctx.lineWidth = 1 * window.devicePixelRatio;

        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (p.y > petalCanvas.height + 40 || p.x < -40 || p.x > petalCanvas.width + 40) {
          if (petals.length > 35) {
            petals.splice(i, 1);
            i--;
          } else {
            petals[i] = createPetal(false);
          }
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // ==========================================
  // 6. Interactive 3D Hotspots & Modals
  // ==========================================
  function ringBell() {
    if (hangingBell) {
      hangingBell.classList.remove("is-ringing");
      void hangingBell.offsetWidth;
      hangingBell.classList.add("is-ringing");
    }

    try {
      bellAudio.currentTime = 0;
      bellAudio.play().catch(() => {});
    } catch (_) {}

    if (window._spawnArFlowerBurst) {
      const rect = hangingBell ? hangingBell.getBoundingClientRect() : { left: window.innerWidth / 2, top: 120 };
      window._spawnArFlowerBurst(rect.left + 15, rect.top + 20);
    }
  }

  function openSchedule() {
    if (scheduleModal) scheduleModal.hidden = false;
  }

  function closeSchedule() {
    if (scheduleModal) scheduleModal.hidden = true;
  }

  function openDonate() {
    if (donateModal) donateModal.hidden = false;
  }

  function closeDonate() {
    if (donateModal) donateModal.hidden = true;
  }

  function copyText(text, btn, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = successMsg;
        window.setTimeout(() => { btn.textContent = original; }, 1800);
      }).catch(() => {});
    }
  }

  function setSound(play) {
    isSoundActive = play;
    if (soundToggleBtn) {
      soundToggleBtn.innerHTML = isSoundActive ? "<span>🔊</span> Sound" : "<span>🔇</span> Mute";
    }
    if (invitationFrame && invitationFrame.contentWindow) {
      invitationFrame.contentWindow.postMessage({ action: isSoundActive ? "startMusic" : "pauseMusic" }, "*");
    }
  }

  function toggleSound() {
    setSound(!isSoundActive);
  }

  function toggleAutoplay() {
    isAutoplayActive = !isAutoplayActive;
    if (autoplayArBtn) {
      autoplayArBtn.innerHTML = isAutoplayActive ? "<span>⏸</span> Pause" : "<span>▶</span> Play";
    }
    if (invitationFrame && invitationFrame.contentWindow) {
      invitationFrame.contentWindow.postMessage({ action: isAutoplayActive ? "startAutoplay" : "stopAutoplay" }, "*");
    }
  }

  // ==========================================
  // 7. Event Binding & Initialization
  // ==========================================
  function bind() {
    if (startArBtn) {
      startArBtn.addEventListener("click", launchArExperience);
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener("click", toggleSound);
    }

    if (autoplayArBtn) {
      autoplayArBtn.addEventListener("click", toggleAutoplay);
    }

    if (recenterBtn) {
      recenterBtn.addEventListener("click", recenter);
    }

    if (hangingBell) {
      hangingBell.addEventListener("click", ringBell);
    }

    if (hotspotSchedule) {
      hotspotSchedule.addEventListener("click", openSchedule);
    }

    if (hotspotDonate) {
      hotspotDonate.addEventListener("click", openDonate);
    }

    if (closeScheduleBtn) {
      closeScheduleBtn.addEventListener("click", closeSchedule);
    }

    if (closeDonateBtn) {
      closeDonateBtn.addEventListener("click", closeDonate);
    }

    if (copyUpiBtn) {
      copyUpiBtn.addEventListener("click", () => copyText(UPI_ID, copyUpiBtn, "Copied UPI!"));
    }

    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener("click", () => copyText(PHONE_NO, copyPhoneBtn, "Copied No.!"));
    }

    setupGestures();
    initPetals();
  }

  bind();
  applyTransform();
})();