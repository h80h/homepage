window.addEventListener("DOMContentLoaded", () => {
  new PagefindUI({
    element: "#search",
    showSubResults: true,
    placeholder: "",
    processResult: (result) => {
      // Only suppress the page-level excerpt when there are genuine heading
      // sub-results (i.e. sub-results with a real #anchor in their URL).
      // Results without heading anchors keep their excerpt untouched.
      if (result.sub_results) {
        const hasHeadingSubResult = result.sub_results.some(
          (sub) => sub.url && sub.url.includes("#"),
        );
        if (hasHeadingSubResult) {
          result.excerpt = "";
        }
      }
      return result;
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
