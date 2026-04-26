window.addEventListener("DOMContentLoaded", () => {
  new PagefindUI({ element: "#search", showSubResults: true, placeholder: "" });

  // Force override after Pagefind finishes rendering its input
  setTimeout(() => {
    const input = document.querySelector(".pagefind-ui__search-input");
    if (input) {
      input.placeholder = "";
      input.removeAttribute("placeholder");
    }
  }, 0);
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
