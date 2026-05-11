window.addEventListener("DOMContentLoaded", () => {
  // Sync dynamic footer height to a CSS variable
  const syncFooterHeight = () => {
    const footer = document.querySelector("footer");
    if (footer) {
      document.documentElement.style.setProperty(
        "--footer-height",
        footer.offsetHeight + "px",
      );
    }
  };
  syncFooterHeight();
  window.addEventListener("resize", syncFooterHeight);

  // Falling leaves
  const leafSymbols = ["🍁"];
  const main = document.querySelector("main");
  if (main) {
    let stackCount = 0;
    const MAX_STACK = 66;
    const SHOW_SWEEP_AT = 6;

    const sweepBtn = document.getElementById("sweep-btn");
    const updateSweepBtn = () => {
      if (!sweepBtn) return;
      sweepBtn.hidden = stackCount < SHOW_SWEEP_AT;
    };
    if (sweepBtn) {
      sweepBtn.addEventListener("click", () => {
        main.querySelectorAll(".leaf-resting").forEach((el) => el.remove());
        stackCount = 0;
        updateSweepBtn();
      });
    }

    const spawnLeaf = () => {
      const footer = document.querySelector("footer");
      const floorPadding = footer ? footer.offsetHeight : 130;

      const el = document.createElement("span");
      el.className = "leaf";
      el.textContent =
        leafSymbols[Math.floor(Math.random() * leafSymbols.length)];
      const leftPct = Math.random() * 96;
      el.style.left = leftPct + "%";
      el.style.fontSize = 12 + Math.random() * 8 + "px";

      // Travel to just above the 150px padding floor
      const distance = main.scrollHeight - floorPadding;
      const speed = 10 + Math.random() * 30;
      const duration = distance / speed;

      const swayPx = 15 + Math.random() * 25;
      const swayPeriod = 2 + Math.random() * 2;

      el.style.setProperty("--leaf-duration", duration + "s");
      el.style.setProperty("--leaf-sway-period", swayPeriod + "s");
      el.style.setProperty("--leaf-travel", distance + "px");
      el.style.setProperty("--leaf-sway", swayPx + "px");

      const rotationSpeed = 4 + Math.random() * 4;
      el.style.setProperty(
        "--leaf-rotation",
        (duration / rotationSpeed) * 360 + "deg",
      );

      main.appendChild(el);

      el.addEventListener("animationend", (e) => {
        if (e.animationName !== "leaf-fall") return;
        // Read the actual rendered position at the moment of landing, before removing
        const rect = el.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        const landedLeft = rect.left - mainRect.left;
        const finalRotation = el.style.getPropertyValue("--leaf-rotation");

        el.remove();
        if (stackCount >= MAX_STACK) return;

        const resting = document.createElement("span");
        resting.className = "leaf-resting";
        resting.textContent = el.textContent;
        resting.style.fontSize = el.style.fontSize;
        resting.style.left = landedLeft + "px";

        resting.style.transform = `rotate(${finalRotation})`;
        // All leaves land at the floor, tiny random vertical nudge (±2px) for natural scatter
        resting.style.bottom = floorPadding  + "px";
        main.appendChild(resting);
        stackCount++;
        updateSweepBtn();
      });
    };

    // for (let i = 0; i < 6; i++) setTimeout(spawnLeaf, Math.random() * 8000);
    setInterval(spawnLeaf, 10000);
  }

  // Make markdown task-list checkboxes interactive
  document
    .querySelectorAll('.task-list-item input[type="checkbox"]')
    .forEach((cb) => {
      cb.removeAttribute("disabled");
    });

  // Restore image src from data-src (src was blanked at build time to hide URLs from Pagefind)
  document.querySelectorAll("img[data-src]").forEach((img) => {
    img.src = img.dataset.src;
  });

  new PagefindUI({
    element: "#search",
    showSubResults: true,
    placeholder: "",
    processTerm: (term) => {
      if (!term) return term;
      if (term.includes('"')) return term;

      const words = term.split(/\s+/).filter(Boolean);

      // Single word: let Pagefind stem it naturally
      if (words.length === 1) return term;

      // Multiple words: quote each to force exact matching per word
      return words.map((word) => `"${word}"`).join(" ");
    },
  });

  // Force override after Pagefind finishes rendering its input
  setTimeout(() => {
    const input = document.querySelector(".pagefind-ui__search-input");
    if (input) {
      input.placeholder = "";
      input.removeAttribute("placeholder");
    }
  }, 0);

  document
    .getElementById("light-theme-symbol")
    ?.addEventListener("click", function () {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    });
  document
    .getElementById("dark-theme-symbol")
    ?.addEventListener("click", function () {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    });

  const normalize = (p) => p.replace(/\/$/, "");

  document
    .querySelector(".post-title-nav")
    ?.addEventListener("click", function (e) {
      if (
        normalize(new URL(this.href).pathname) === normalize(location.pathname)
      ) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

  document.querySelectorAll(".info-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const datePara = this.closest(".edited-date")?.nextElementSibling;
      if (datePara && datePara.classList.contains("date")) {
        datePara.hidden = !datePara.hidden;
      }
    });
  });

  document
    .querySelector(".nav-current")
    ?.addEventListener("click", function (e) {
      if (
        normalize(new URL(this.href).pathname) === normalize(location.pathname)
      ) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

  // NPC dialogue on favicon click
  const dialogues = [
    "don't forget to drink water!",
    "i hope you're having a cozy day",
    "click current page on breadcrumb nav will scroll to top",
  ];

  let dialogueTimer = null;
  let currentIndex = Math.floor(Math.random() * dialogues.length);

  const favi = document.getElementById("h80h-favi");
  const dialogue = document.getElementById("h80h-dialogue");
  const clover = document.getElementById("clover");

  if (favi && dialogue && clover) {
    // Hide the dialogue text content initially; clover stays visible
    const showDialogue = () => {
      const idx = currentIndex;
      currentIndex = (currentIndex + 1) % dialogues.length;

      dialogue.innerHTML = `<div id="clover">☘︎</div>${dialogues[idx]}<div id="clover">☘︎</div>`;

      dialogue.classList.remove("dialogue-hide");
      dialogue.classList.add("dialogue-show");

      const duration = Math.max(2500, dialogues[idx].length * 60);
      clearTimeout(dialogueTimer);
      dialogueTimer = setTimeout(() => {
        dialogue.classList.remove("dialogue-show");
        dialogue.classList.add("dialogue-hide");
      }, duration);
    };

    // Auto-show dialogue when idle, counting time across page navigations
    const IDLE_INTERVAL = 30 * 1000;
    let idleTimer = null;

    const scheduleNext = (delay = IDLE_INTERVAL) => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!dialogue.classList.contains("dialogue-show")) {
          sessionStorage.setItem("npcLastShown", Date.now());
          showDialogue();
        }
        scheduleNext();
      }, delay);
    };

    favi.addEventListener("click", () => {
      sessionStorage.setItem("npcLastShown", Date.now());
      showDialogue();
      scheduleNext();
    });

    const last = parseInt(sessionStorage.getItem("npcLastShown") || "0", 10);
    const elapsed = Date.now() - last;
    scheduleNext(
      elapsed >= IDLE_INTERVAL ? IDLE_INTERVAL : IDLE_INTERVAL - elapsed,
    );
  }
});

document.addEventListener("mousedown", function (e) {
  if (!e.target.closest(".pagefind-ui")) {
    document.querySelector(".pagefind-ui__search-input")?.blur();
    document
      .querySelector(".pagefind-ui__drawer")
      ?.classList.add("pagefind-ui__hidden");
  }
});

document.addEventListener("click", function (e) {
  if (e.target.closest(".pagefind-ui__search-input")) {
    const drawer = document.querySelector(".pagefind-ui__drawer");
    if (
      drawer &&
      document.querySelector(".pagefind-ui__search-input").value.trim() !== ""
    ) {
      drawer.classList.remove("pagefind-ui__hidden");
    }
  }
});
