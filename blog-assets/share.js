window.addEventListener("DOMContentLoaded", () => {
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
