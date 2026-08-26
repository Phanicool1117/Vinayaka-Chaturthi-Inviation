(function () {
  function kolkataNow() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  }

  function targetFrom(now) {
    const year = now.getFullYear();
    let end = new Date(year, 8, 14, 0, 0, 0);
    if (now >= end) end = new Date(year + 1, 8, 14, 0, 0, 0);
    return end;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  window.TempleCountdown = {
    start() {
      const root = document.getElementById("timer");
      let done = false;

      function tick() {
        if (done) return;
        const now = kolkataNow();
        let diff = Math.max(0, targetFrom(now).getTime() - now.getTime());
        const total = Math.floor(diff / 1000);
        root.querySelector('[data-unit="days"]').textContent = pad(Math.floor(total / 86400));
        root.querySelector('[data-unit="hours"]').textContent = pad(Math.floor((total % 86400) / 3600));
        root.querySelector('[data-unit="minutes"]').textContent = pad(Math.floor((total % 3600) / 60));
        root.querySelector('[data-unit="seconds"]').textContent = pad(total % 60);

        if (total === 0) {
          done = true;
        }
      }

      tick();
      window.setInterval(tick, 1000);
    },
  };
})();
