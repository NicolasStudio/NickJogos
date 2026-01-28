// ===== CAPTURADOS =====
// Lista atual de pokémons que o jogador possui
function updateCaptured() {
  const capturedDiv = document.getElementById("capturedTabContent");
  capturedDiv.innerHTML = "<h2>Pokémons Capturados</h2>";

  // Se não houver nenhum capturado
  if (Object.keys(capturados).length === 0) {
    capturedDiv.innerHTML += "<p>Nenhum Pokémon capturado no momento.</p>";
    return;
  }

  for (const nome in capturados) {
    const p = capturados[nome];
    const div = document.createElement("div");
    div.classList.add("pokemon-entry");

    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <span>${p.name} (<span class="rarity-${p.rarity}">${p.rarity}</span>)</span>
      <button class="vender-btn" onclick="venderPokemon('${p.name}')">Vender</button>
    `;

    capturedDiv.appendChild(div);
  }
}

function venderPokemon(nome) {
  const confirmacao = confirm(`Deseja realmente vender ${nome}?`);
  if (confirmacao) {
    const p = capturados[nome];
    let valorVenda = 100;
    if (p.rarity === "incomum") valorVenda = 200;
    if (p.rarity === "raro") valorVenda = 500;

    dinheiro += valorVenda;
    delete capturados[nome];

    localStorage.setItem("capturados", JSON.stringify(capturados));
    localStorage.setItem("dinheiro", JSON.stringify(dinheiro));

    updateCaptured();
    if (typeof updateStore === "function") updateStore();
  }
}