// ===== POKÉDEX =====
// Registro permanente de capturas

function updatePokedex() {
  const dexDiv = document.getElementById("pokedexList");
  dexDiv.innerHTML = "";

  pokemons.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("pokemon-entry");

    if (pokedex[p.name]) {
      div.innerHTML = `<img src="${p.img}" alt="${p.name}"><span>#${p.id} - ${p.name}</span>`;
    } else {
      div.innerHTML = `<img src="Img/unknown.png" alt="Desconhecido"><span>#${p.id} - ???</span>`;
    }

    dexDiv.appendChild(div);
  });
}
