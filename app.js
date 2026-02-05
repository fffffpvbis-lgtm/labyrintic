const menuItems = document.querySelectorAll(".menu__item");
const panels = document.querySelectorAll(".panel");

const setActivePanel = (panelId) => {
  panels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.id === `panel-${panelId}`);
  });

  menuItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.panel === panelId);
  });
};

menuItems.forEach((item) => {
  item.addEventListener("click", () => setActivePanel(item.dataset.panel));
});

setActivePanel("overview");
