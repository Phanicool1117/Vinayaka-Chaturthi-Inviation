(function () {
  var video = document.getElementById("cameraFeed");
  var tablet = document.getElementById("floatingTablet");
  var promptOverlay = document.getElementById("arPromptOverlay");
  var startArBtn = document.getElementById("startArBtn");
  var soundToggleBtn = document.getElementById("soundToggleBtn");
  var recenterBtn = document.getElementById("recenterBtn");
  var iframe = document.getElementById("invitationFrame");

  var initialBeta = null;
  var initialGamma = null;
  var isSoundActive = false;

  async function initCamera() {
    try {
      var constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      var stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await video.play();

      var track = stream.getVideoTracks()[0];
      var settings = track.getSettings ? track.getSettings() : {};
      if (settings.facingMode === "environment" || !settings.facingMode) {
        video.classList.add("is-environment");
      }

      if (promptOverlay) {
        promptOverlay.hidden = true;
      }

      requestOrientationPermission();
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      if (promptOverlay) {
        promptOverlay.hidden = false;
        var pTitle = document.getElementById("promptTitle");
        var pDesc = document.getElementById("promptDesc");
        if (pTitle) pTitle.textContent = "Camera Permission Required";
        if (pDesc) pDesc.textContent = "Enable camera access to view the temple in Augmented Reality, or open the website directly.";
      }
    }
  }

  function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(function (state) {
          if (state === "granted") {
            window.addEventListener("deviceorientation", onOrientation, true);
          }
        })
        .catch(function () {});
    } else {
      window.addEventListener("deviceorientation", onOrientation, true);
    }
  }

  function onOrientation(e) {
    if (e.beta === null || e.gamma === null) return;

    if (initialBeta === null) {
      initialBeta = e.beta;
      initialGamma = e.gamma;
    }

    var deltaX = Math.max(-25, Math.min(25, (e.gamma - initialGamma) * 0.45));
    var deltaY = Math.max(-25, Math.min(25, (e.beta - initialBeta) * 0.45));

    if (tablet) {
      tablet.style.transform = "rotateY(" + deltaX.toFixed(2) + "deg) rotateX(" + (-deltaY).toFixed(2) + "deg) translateZ(10px)";
    }
  }

  function recenter() {
    initialBeta = null;
    initialGamma = null;
    if (tablet) {
      tablet.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0px)";
    }
  }

  function toggleSound() {
    isSoundActive = !isSoundActive;
    if (soundToggleBtn) {
      soundToggleBtn.textContent = isSoundActive ? "🔊" : "🔇";
    }
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ action: "playMusic" }, "*");
    }
  }

  function bind() {
    if (startArBtn) {
      startArBtn.addEventListener("click", function () {
        initCamera();
      });
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener("click", toggleSound);
    }

    if (recenterBtn) {
      recenterBtn.addEventListener("click", recenter);
    }

    window.addEventListener("pointerdown", function () {
      if (!isSoundActive) {
        toggleSound();
      }
    }, { once: true });
  }

  bind();

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    initCamera();
  }
})();