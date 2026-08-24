(function () {
  const DEBOUNCE_MS = 280;
  const FADE_MS = 700;
  let lastBell = 0;
  let fadeTimer = null;

  function fade(audio, to, ms) {
    window.clearInterval(fadeTimer);
    const from = audio.volume;
    const steps = 18;
    let i = 0;
    fadeTimer = window.setInterval(() => {
      i += 1;
      audio.volume = Math.min(1, Math.max(0, from + ((to - from) * i) / steps));
      if (i >= steps) {
        window.clearInterval(fadeTimer);
        audio.volume = to;
        if (to === 0) audio.pause();
      }
    }, ms / steps);
  }

  function setToggle(on) {
    const toggle = document.getElementById("musicToggle");
    const label = toggle.querySelector(".music-label");
    const glyph = toggle.querySelector(".music-glyph");
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute("aria-label", on ? "Pause music" : "Play music");
    label.textContent = on ? "Pause music" : "Play music";
    glyph.textContent = on ? "Ⅱ" : "♪";
  }

  window.TempleAudio = {
    init() {
      document.getElementById("bgm").volume = 0;
      document.getElementById("bell").volume = 0.72;
    },

    playBell() {
      const now = Date.now();
      if (now - lastBell < DEBOUNCE_MS) return;
      lastBell = now;
      const bell = document.getElementById("bell");
      bell.pause();
      bell.currentTime = 0;
      const play = bell.play();
      if (play && play.catch) play.catch(() => {});
    },

    startMusic() {
      const bgm = document.getElementById("bgm");
      if (!bgm.paused && bgm.volume > 0) return;
      bgm.volume = 0;
      const play = bgm.play();
      if (play && play.then) {
        play
          .then(() => {
            fade(bgm, 0.42, FADE_MS);
            setToggle(true);
          })
          .catch(() => {});
      }
    },

    toggleMusic() {
      const bgm = document.getElementById("bgm");
      if (bgm.paused) {
        this.startMusic();
        return;
      }
      fade(bgm, 0, FADE_MS);
      setToggle(false);
    },
  };
})();
