const dialog = document.querySelector("dialog");
const h80h_thumbnail = document.querySelector("#h80h_thumbnail");

h80h_thumbnail.addEventListener('click', function(event) {
  dialog.addEventListener("click", e => {
    const dialogDimensions = dialog.getBoundingClientRect()
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialog.close();
    }});

    dialog.showModal();
});