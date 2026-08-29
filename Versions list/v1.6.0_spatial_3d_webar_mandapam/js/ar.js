(function () {
  const video = document.getElementById("cameraFeed");
  const mandapamRig = document.getElementById("mandapamRig");
  const floorBase = document.getElementById("floorBase");
  const promptOverlay = document.getElementById("arPromptOverlay");
  const startArBtn = document.getElementById("startArBtn");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const recenterBtn = document.getElementById("recenterBtn");
  const hangingBell = document.getElementById("hangingBell");
  const invitationFrame = document.getElementById("invitationFrame");
  const petalCanvas = document.getElementById("petalCanvas");
  const gestureHint = document.getElementById("gestureHint");
  const surfaceBtns = document.querySelectorAll(".ar-surface-btn");

  let currentMode = "floor"; // "floor" | "orbit" | "wall"
  let isSoundActive = false;

  // Spatial Transformation State
  let rotX = 18;
  let rotY = 0;
  let scale = 1.0;
  let posX = 0;
  let posY = 0;

  // Gyroscope tracking
  let initialBeta = null;
  let initialGamma = null;
  let gyroRotX = 0;
  let gyroRotY = 0;

  // Touch Gesture tracking
  let isDragging = false;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let initialPinchDist = null;
  let initialScale = 1.0;

  const bellAudio = new Audio("audio/temple-bell.mp3");

  // ==========================================
  // 1. Camera Passthrough Initialization
  // ==========================================
  async function initCamera() {
    try {
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

      if (promptOverlay) {
        promptOverlay.hidden = true;
      }

      requestGyro();
    } catch (err) {
      console.warn("Camera permission not granted:", err);
      if (promptOverlay) {
        promptOverlay.hidden = false;
        const pTitle = document.getElementById("promptTitle");
        const pDesc = document.getElementById("promptDesc");
        if (pTitle) pTitle.textContent = "Camera Permission Required";
        if (pDesc) pDesc.textContent = "Please allow camera access to view the temple mandapam in 3D AR, or open the website directly.";
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

    gyroRotY = Math.max(-20, Math.min(20, (e.gamma - initialGamma) * 0.4));
    gyroRotX = Math.max(-20, Math.min(20, (e.beta - initialBeta) * 0.4));

    applyTransform();
  }

  // ==========================================
  // 3. Surface Projection & 3D Spatial Rig
  // ==========================================
  function setSurfaceMode(mode) {
    currentMode = mode;

    surfaceBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.mode === mode);
    });

    if (mode === "floor") {
      rotX = 22;
      rotY = 0;
      scale = 0.95;
      posY = 35;
      posX = 0;
      if (floorBase) floorBase.style.opacity = "1";
      if (gestureHint) gestureHint.textContent = "🪔 Tabletop Mandapam • 👆 Drag to Rotate • 🤏 Pinch to Zoom";
    } else if (mode === "orbit") {
      rotX = 6;
      rotY = 0;
      scale = 1.0;
      posY = 0;
      posX = 0;
      if (floorBase) floorBase.style.opacity = "0.4";
      if (gestureHint) gestureHint.textContent = "🏛️ 360° Free Orbit • 👆 Rotate Any Angle • 🤏 Resize";
    } else if (mode === "wall") {
      rotX = 0;
      rotY = 0;
      scale = 1.05;
      posY = -10;
      posX = 0;
      if (floorBase) floorBase.style.opacity = "0";
      if (gestureHint) gestureHint.textContent = "🖼️ Wall Shrine • Anchored to Vertical Surface";
    }

    applyTransform();
  }

  function applyTransform() {
    if (!mandapamRig) return;
    const finalRotX = rotX - gyroRotX;
    const finalRotY = rotY + gyroRotY;
    mandapamRig.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function recenter() {
    initialBeta = null;
    initialGamma = null;
    gyroRotX = 0;
    gyroRotY = 0;
    setSurfaceMode(currentMode);
  }

  // ==========================================
  // 4. Touch & Gesture Controller
  // ==========================================
  function setupGestures() {
    const stage = document.getElementById("arWorld");
    if (!stage) return;

    stage.addEventListener("pointerdown", (e) => {
      // Don't intercept UI buttons
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".ar-surface-selector")) return;
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
      rotX = Math.max(-45, Math.min(65, rotX - dy * 0.35));
      applyTransform();
    });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    });

    window.addEventListener("pointercancel", () => {
      isDragging = false;
    });

    // Touch pinch-to-zoom & two-finger pan
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialScale = scale;
      }
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && initialPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = currentDist / initialPinchDist;
        scale = Math.max(0.45, Math.min(2.5, initialScale * factor));
        applyTransform();
      }
    }, { passive: true });

    stage.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) {
        initialPinchDist = null;
      }
    }, { passive: true });
  }

  // ==========================================
  // 5. 3D Marigold Petal Physics System
  // ==========================================
  const petals = [];
  const petalColors = [
    { fill: "#ff9900", stroke: "#e67300" }, // Marigold Orange
    { fill: "#ffcc00", stroke: "#e6b800" }, // Marigold Yellow
    { fill: "#e63946", stroke: "#b5172b" }, // Sacred Rose Red
    { fill: "#ffd166", stroke: "#d4a338" }  // Golden Sparkle
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
        speedY: (Math.random() * 1.4 + 0.8) * window.devicePixelRatio,
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
  // 6. Interactive Temple Bell & Audio
  // ==========================================
  function ringBell(e) {
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

  function toggleAudio() {
    isSoundActive = !isSoundActive;
    if (soundToggleBtn) {
      soundToggleBtn.textContent = isSoundActive ? "🔊" : "🔇";
    }
    if (invitationFrame && invitationFrame.contentWindow) {
      invitationFrame.contentWindow.postMessage({ action: isSoundActive ? "playMusic" : "stopAutoplay" }, "*");
    }
  }

  // ==========================================
  // 7. Event Binding & Start
  // ==========================================
  function bind() {
    if (startArBtn) {
      startArBtn.addEventListener("click", initCamera);
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener("click", toggleAudio);
    }

    if (recenterBtn) {
      recenterBtn.addEventListener("click", recenter);
    }

    if (hangingBell) {
      hangingBell.addEventListener("click", ringBell);
    }

    surfaceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setSurfaceMode(btn.dataset.mode);
      });
    });

    setupGestures();
    initPetals();

    // Auto-unmute sound & trigger first burst on first interaction
    window.addEventListener("pointerdown", () => {
      if (!isSoundActive) {
        toggleAudio();
      }
    }, { once: true });
  }

  bind();
  setSurfaceMode("floor");

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    initCamera();
  }
})();