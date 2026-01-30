// ===== MENU =====
function openTab(tabName) {
  const sidebarContent = document.getElementById("sidebarContent");
  const tabContent = document.getElementById(tabName + "TabContent");
  const tabLink = document.getElementById(tabName + "Tab");
  const sidebarTabs = document.getElementById("sidebarTabs");
  const overlay = document.getElementById("overlay");

  const isVisible = tabContent.style.display === "block";

  if (isVisible) {
    tabContent.style.display = "none";
    tabLink.classList.remove("selected", "opened");
    sidebarContent.style.display = "none";
    sidebarTabs.classList.remove("opened");
    overlay.style.display = "none"; // esconde overlay
    return;
  }

  // Fecha todas as abas
  document.querySelectorAll(".tabContent").forEach(div => div.style.display = "none");
  document.querySelectorAll("#sidebarTabs a").forEach(a => a.classList.remove("selected", "opened"));

  // Abre a aba escolhida
  sidebarContent.style.display = "block";
  tabContent.style.display = "block";
  tabLink.classList.add("selected", "opened");
  sidebarTabs.classList.add("opened");
  overlay.style.display = "block"; // mostra overlay

  // Atualiza conteúdo específico
  if (tabName === "pokedex" && typeof updatePokedex === "function") updatePokedex();
  if (tabName === "captured" && typeof updateCaptured === "function") updateCaptured();
  if (tabName === "store" && typeof updateStore === "function") updateStore();
}

document.getElementById("overlay").addEventListener("click", () => {
  // Fecha tudo
  document.querySelectorAll(".tabContent").forEach(div => div.style.display = "none");
  document.querySelectorAll("#sidebarTabs a").forEach(a => a.classList.remove("selected", "opened"));
  document.getElementById("sidebarContent").style.display = "none";
  document.getElementById("sidebarTabs").classList.remove("opened");
  document.getElementById("overlay").style.display = "none";
});