// Taxa base de captura por raridade
const TAXA_BASE_CAPTURA = {
    "comum": 0.6,       // 60% base
    "incomum": 0.30,    // 30% base  
    "raro": 0.1,        // 10% base
    "mistico": 0.03,    // 5% base
    "lendário": 0.01    // 1% base
};

// Função principal de captura
function calcularChanceCaptura(pokemonRaridade, pokebolaTaxa) {
    // 1. Pega a taxa base pela raridade
    const taxaBase = TAXA_BASE_CAPTURA[pokemonRaridade] || 0.1;
    
    // 2. Multiplica pela taxa da pokébola (1.0x, 1.5x, 2.0x)
    const chanceComPokebola = taxaBase * pokebolaTaxa;
    
    // 3. Limita entre 0.01% e 95% (nunca 0% ou 100%)
    const chanceFinal = Math.max(0.01, Math.min(0.95, chanceComPokebola));
    
    return chanceFinal;
}

// Função para tentar capturar
function tentarCapturarPokemon(pokemon, tipoPokebola, taxaPokebola) {
    const chance = calcularChanceCaptura(pokemon.rarity, taxaPokebola);
    const sucesso = Math.random() < chance;
    return {
        sucesso: sucesso,
        chance: chance,
        mensagem: sucesso ? 
            `🎉 ${pokemon.name} capturado com sucesso!` :
            `😞 ${pokemon.name} escapou! Chance: ${(chance * 100).toFixed(1)}%`,
            
    };
    
}

// Função para mostrar resultado animado
function mostrarResultadoCaptura(pokemon, resultado, tipoPokebola) {
  // Fecha modal de inventário se existir
  const modal = document.getElementById('modalInventarioCaptura');
  if (modal) modal.remove();

  // Define cores e textos
  const corResultado = resultado.sucesso ? '#27ae60' : '#e74c3c';
  const emojiResultado = resultado.sucesso ? '🎉' : '😞';
  const tituloResultado = resultado.sucesso ? 'CAPTURA BEM SUCEDIDA!' : 'CAPTURA FALHOU';

  // Cria container principal
  const wrapper = document.createElement("div");
  wrapper.id = "modalResultadoCaptura";
  wrapper.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7); /* escuro semi-transparente */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    font-family: 'Oxanium', sans-serif;
    animation: fadeIn 0.3s ease;
  `;

  // Conteúdo interno (sem botão ainda)
  wrapper.innerHTML = `
    <div style="
      background: #1a1a1a;
      border-radius: 15px;
      padding: 30px;
      width: 400px;
      max-width: 90%;
      color: #fff;
      text-align: center;
      border: 3px solid ${corResultado};
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    ">
      <div style="font-size: 4rem; margin-bottom: 20px;">${emojiResultado}</div>
      <h2 style="
        color: ${corResultado};
        margin: 0 0 20px 0;
        font-size: 1.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      ">
        ${tituloResultado}
      </h2>

      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin: 25px 0;
        padding: 20px;
        background: #222;
        border-radius: 10px;
      ">
        <img src="${pokemon.img}" alt="${pokemon.name}" 
             style="width: 80px; height: 80px; object-fit: contain;">
        <div style="text-align: left;">
          <div style="font-weight: 700; font-size: 1.4rem; color: ${corResultado};">
            ${pokemon.name}
          </div>
          <div style="
            background: ${getCorRaridade(pokemon.rarity)};
            color: #fff;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.9rem;
            margin-top: 5px;
            display: inline-block;
          ">
            ${pokemon.rarity}
          </div>
        </div>
      </div>

      <div style="
        background: #222;
        padding: 15px;
        border-radius: 10px;
        margin: 20px 0;
        font-size: 1.1rem;
      ">
        <div style="color: #ccc; margin-bottom: 8px;">Pokébola usada:</div>
        <div style="
          background: ${tipoPokebola.cor};
          color: #fff;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 700;
          display: inline-block;
        ">
          ${tipoPokebola.nome} (${tipoPokebola.taxa}x)
        </div>
      </div>

      <div style="
        background: ${corResultado}20;
        padding: 15px;
        border-radius: 10px;
        margin: 20px 0;
        border: 1px solid ${corResultado}40;
      ">
        <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 5px;">
          ${(resultado.chance * 100).toFixed(1)}% de chance
        </div>
        <div style="color: #ccc; font-size: 0.9rem;">
          ${resultado.mensagem}
        </div>
      </div>

      <div style="
        width: 100%;
        height: 20px;
        background: #222;
        border-radius: 10px;
        margin: 20px 0;
        overflow: hidden;
        position: relative;
      ">
        <div style="
          width: ${resultado.chance * 100}%;
          height: 100%;
          background: linear-gradient(90deg, ${corResultado}, ${corResultado}cc);
          border-radius: 10px;
          transition: width 1s ease;
        "></div>
        <div style="
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          color: #fff;
        ">
          ${(resultado.chance * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  `;

  // Cria botão dinamicamente
  const btn = document.createElement("button");
  btn.textContent = resultado.sucesso ? "CONTINUAR" : "TENTAR NOVAMENTE";
  btn.style.cssText = `
    width: 100%;
    padding: 15px;
    background: ${corResultado};
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Oxanium', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.2s ease;
  `;

  // Evento de clique SEMPRE chama fecharResultadoCaptura
  btn.addEventListener("click", () => {
    fecharResultadoCaptura(resultado.sucesso, pokemon.name);
  });

  // Adiciona botão ao modal
  wrapper.querySelector("div").appendChild(btn);

  // Adiciona modal ao body
  document.body.appendChild(wrapper);
}

// Função para fechar resultado
function fecharResultadoCaptura(sucesso, nomePokemon) {
  const modal = document.getElementById('modalResultadoCaptura');
  if (modal) modal.remove();

  const pokemon = getPokemonByName(nomePokemon);

  if (sucesso) {
    if (pokemon) capturePokemon(pokemon); // continua fluxo de captura
  } else {
    if (pokemon) mostrarModalInventarioCaptura(pokemon); // abre inventário
    // ou showEncounter(pokemon), se preferir voltar ao encontro
  }
}

// ===== USAR POKÉBOLA =====
function usarPokebolaParaCapturar(tipoPokebolaId, nomePokemon, taxaPokebola) {
    const pokemon = getPokemonByName(nomePokemon);
    if (!pokemon) {
        alert('Pokémon não encontrado!');
        return;
    }
    window.pokemonAtual = pokemon;

    const inventario = JSON.parse(localStorage.getItem('pokemonInventory')) || {};
    if (!inventario[tipoPokebolaId] || inventario[tipoPokebolaId].count <= 0) {
        alert('Você não tem mais ' + tipoPokebolaId + '!');
        return;
    }

    const tiposPokebolas = {
        'pokeball': { nome: 'POKÉBOLA', cor: '#c00' },
        'greatball': { nome: 'GREAT BALL', cor: '#2196F3' },
        'ultraball': { nome: 'ULTRA BALL', cor: '#FF9800' }
    };
    const tipoPokebola = tiposPokebolas[tipoPokebolaId] || { nome: 'Pokébola', cor: '#c00' };

    // Gasta SEMPRE
    removerPokebolaDoInventario(tipoPokebolaId);

    // Atualiza visual
    carregarPokebolasInventario(pokemon);

    // Tenta captura
    const resultado = tentarCapturarPokemon(pokemon, tipoPokebola, taxaPokebola);

    // Mostra resultado
    mostrarResultadoCaptura(pokemon, resultado, { ...tipoPokebola, taxa: taxaPokebola });
}

// ===== REMOVER POKÉBOLA =====
function removerPokebolaDoInventario(tipoPokebolaId) {
    const inventario = JSON.parse(localStorage.getItem('pokemonInventory')) || {};
    if (inventario[tipoPokebolaId] && inventario[tipoPokebolaId].count > 0) {
        inventario[tipoPokebolaId].count--;
        localStorage.setItem('pokemonInventory', JSON.stringify(inventario));
    }
}
