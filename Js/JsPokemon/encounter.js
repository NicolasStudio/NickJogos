// ===== ENCONTRO =====
// Limpa a tela de encontro
function clearEncounter() {
    const encounterDiv = document.getElementById("encounter");
    const captureBtn = document.getElementById("capture-btn");
    
    if (encounterDiv) {
        encounterDiv.innerHTML = "";
    }
    
    if (captureBtn) {
        captureBtn.style.display = "none";
        captureBtn.onclick = null;
    }
}

// Verifica se deve ocorrer um encontro
function checkEncounter() {
    // Verifica se está em grama (colisão "g")
    if (collisionMap && playerPos && collisionMap[playerPos.y] && collisionMap[playerPos.y][playerPos.x] === "g") {
        if (Math.random() < 0.2) { // 20% de chance
            const pokemon = getRandomPokemon();
            if (pokemon) {
                showEncounter(pokemon);
            }
        }
    }
}

// Pega um Pokémon aleatório baseado no mapa atual
function getRandomPokemon() {
    const lista = pokemonsPorMapa[mapaAtual] || [];
    if (lista.length === 0) return null;

    const totalChance = lista.reduce((sum, p) => sum + p.chance, 0);
    const roll = Math.random() * totalChance;
    let cumulative = 0;

    for (const p of lista) {
        cumulative += p.chance;
        if (roll <= cumulative) return p;
    }
    return lista[0];
}

// Torna as funções globais
window.clearEncounter = clearEncounter;
window.checkEncounter = checkEncounter;
window.getRandomPokemon = getRandomPokemon;

// ===== MODAL DE INVENTÁRIO PARA CAPTURA =====
function mostrarModalInventarioCaptura(pokemon) {
    // Fecha encontro atual
    clearEncounter();

    // Remove modal anterior se existir
    const modalAntigo = document.getElementById('modalInventarioCaptura');
    if (modalAntigo) modalAntigo.remove();
    
    // Cores do seu sistema
    const cores = {
        fundoEscuro: '#111',      // Fundo escuro
        textoClaro: '#fff',       // Texto claro
        primaria: '#c00',         // Cor primária (vermelho)
        secundaria: '#c0392b',    // Cor secundária (vermelho escuro)
        success: '#27ae60',       // Verde para sucesso
        warning: '#f39c12',       // Laranja para aviso
        cardBg: '#1a1a1a'         // Fundo dos cards
    };
    
    // Cria modal do inventário
    const modalHTML = `
        <div id="modalInventarioCaptura" style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); /* escuro semi-transparente */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Oxanium', sans-serif;
        ">
            <div style="
                background: ${cores.cardBg};
                border-radius: 12px;
                padding: 25px;
                width: 420px;
                max-width: 90%;
                color: ${cores.textoClaro};
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                position: relative;
                border: 2px solid ${cores.primaria};
                animation: fadeIn 0.3s ease;
            ">
                <!-- Botão de fechar (X) no canto superior direito -->
                <button id="btnFecharInventario" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: ${cores.primaria};
                    color: ${cores.textoClaro};
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 1.4rem;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 1;
                    font-family: 'Oxanium', sans-serif;
                ">
                    ×
                </button>
                
                <!-- Cabeçalho do modal -->
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid ${cores.primaria}40;">
                    <h2 style="
                        margin: 0 0 10px 0; 
                        font-size: 1.8rem;
                        color: ${cores.primaria};
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-weight: 800;
                    ">
                        🎒 INVENTÁRIO
                    </h2>
                    <div style="
                        background: ${cores.primaria}20;
                        padding: 12px;
                        border-radius: 8px;
                        margin: 10px 0;
                        border: 1px solid ${cores.primaria}40;
                    ">
                        <div style="font-size: 1rem; margin-bottom: 8px; color: ${cores.textoClaro}cc;">
                            Pokémon encontrado:
                        </div>
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 15px;
                        ">
                            <img src="${pokemon.img}" alt="${pokemon.name}" 
                                 style="
                                    width: 60px; 
                                    height: 60px; 
                                    object-fit: contain;
                                    border-radius: 8px;
                                    background: ${cores.fundoEscuro};
                                    padding: 5px;
                                 ">
                            <div>
                                <div style="
                                    font-weight: 700; 
                                    font-size: 1.3rem;
                                    color: ${cores.primaria};
                                    text-transform: uppercase;
                                ">
                                    ${pokemon.name}
                                </div>
                                <div style="
                                    background: ${getCorRaridade(pokemon.rarity)};
                                    color: ${cores.textoClaro};
                                    padding: 4px 12px;
                                    border-radius: 12px;
                                    font-size: 0.85rem;
                                    margin-top: 5px;
                                    display: inline-block;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">
                                    ${pokemon.rarity}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Instrução -->
                <div style="
                    text-align: center;
                    padding: 12px;
                    background: ${cores.primaria}15;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: ${cores.textoClaro}cc;
                    border: 1px solid ${cores.primaria}30;
                    font-weight: 500;
                ">
                    ⚡ Escolha uma pokébola para tentar capturar
                </div>
                
                <!-- Lista de pokébolas -->
                <div id="listaPokebolas" style="
                    max-height: 350px;
                    margin-top: 20;
                    overflow-y: auto;
                    padding-right: 5px;
                ">
                    <!-- As pokébolas serão adicionadas aqui por JavaScript -->
                </div>
                
                <!-- Mensagem se não tiver pokébolas -->
                <div id="semPokebolas" style="
                    text-align: center;
                    padding: 30px 20px;
                    background: ${cores.primaria}10;
                    border-radius: 10px;
                    display: none;
                    border: 2px dashed ${cores.primaria}40;
                ">
                    <div style="font-size: 3rem; margin-bottom: 15px; color: ${cores.primaria}80;">🎒</div>
                    <div style="font-size: 1.1rem; margin-bottom: 10px; color: ${cores.textoClaro};">
                        Você não tem pokébolas!
                    </div>
                    <div style="font-size: 0.9rem; color: ${cores.textoClaro}99;">
                        Vá até a loja para comprar pokébolas.
                    </div>
                    <button onclick="fecharModalEIrParaLoja()" style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        background: ${cores.primaria};
                        color: ${cores.textoClaro};
                        border: none;
                        border-radius: 6px;
                        font-family: 'Oxanium', sans-serif;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                        Ir para Loja
                    </button>
                </div>
                
                <!-- Botão de cancelar -->
                <button id="btnCancelarCaptura" style="
                    width: 100%;
                    padding: 12px;
                    background: #c00;
                    color: ${cores.textoClaro};
                    border: 2px solid #9e0303;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 15px;
                    font-family: 'Oxanium', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                ">
                    Cancelar Captura
                </button>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            #btnFecharInventario:hover {
                background: ${cores.secundaria} !important;
                transform: rotate(90deg) scale(1.1);
            }
            
            #btnCancelarCaptura:hover {
                background: #c0392b !important;
                transform: translateY(-2px);
            }
            
            /* Estilização da barra de rolagem */
            #listaPokebolas::-webkit-scrollbar {
                width: 8px;
            }
            #listaPokebolas::-webkit-scrollbar-track {
                background: ${cores.primaria}20;
                border-radius: 4px;
            }
            #listaPokebolas::-webkit-scrollbar-thumb {
                background: ${cores.primaria};
                border-radius: 4px;
            }
            #listaPokebolas::-webkit-scrollbar-thumb:hover {
                background: ${cores.secundaria};
            }
        </style>
    `;
    
    // Adiciona novo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Carrega as pokébolas do inventário
    carregarPokebolasInventario(pokemon);
    
    // Configura botões
    const modal = document.getElementById('modalInventarioCaptura');
    const btnFechar = document.getElementById('btnFecharInventario');
    const btnCancelar = document.getElementById('btnCancelarCaptura');
    
    // Fecha modal
    const fecharModal = () => {
        modal.remove();
        showEncounter(pokemon);
    };
    
    btnFechar.addEventListener('click', fecharModal);
    btnCancelar.addEventListener('click', fecharModal);
    
    // Fecha ao clicar fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
}

// ===== LISTA DE POKÉBOLAS =====
function carregarPokebolasInventario(pokemon) {
    const listaDiv = document.getElementById('listaPokebolas');
    const semPokebolasDiv = document.getElementById('semPokebolas');
    if (!listaDiv) return;

    listaDiv.innerHTML = '';

    // Paleta de cores do sistema
    const cores = {
        fundoEscuro: '#111',
        textoClaro: '#fff',
        primaria: '#c00',
        secundaria: '#c0392b'
    };

    // Tipos de pokébolas com hover e descrição
    const tiposPokebolas = [
        { 
            id: 'pokeball', 
            nome: 'POKÉBOLA', 
            cor: '#c00', 
            corHover: '#ff4444',
            taxa: 1.0, 
            imagem: 'Img/ImagemPokemon/Pokebola/pokeball.png',
            descricao: 'Taxa básica de captura'
        },
        { 
            id: 'greatball', 
            nome: 'GREAT BALL', 
            cor: '#2196F3', 
            corHover: '#64b5f6',
            taxa: 1.5, 
            imagem: 'Img/ImagemPokemon/Pokebola/superball.png',
            descricao: 'Taxa de captura melhorada'
        },
        { 
            id: 'ultraball', 
            nome: 'ULTRA BALL', 
            cor: '#FF9800', 
            corHover: '#ffb74d',
            taxa: 2.0, 
            imagem: 'Img/ImagemPokemon/Pokebola/ultraball.png',
            descricao: 'Alta taxa de captura'
        }
    ];

    const inventario = JSON.parse(localStorage.getItem('pokemonInventory')) || {};
    let temPokebolas = false;

    tiposPokebolas.forEach(tipo => {
        const quantidade = inventario[tipo.id] ? inventario[tipo.id].count : 0;

        if (quantidade > 0) {
            temPokebolas = true;

            const itemHTML = `
                <div class="item-pokebola" style="
                    background: ${cores.fundoEscuro};
                    border-radius: 10px;
                    padding: 15px;
                    margin-top: 6px;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border: 2px solid ${tipo.cor};
                    position: relative;
                    overflow: hidden;
                    font-family: 'Oxanium', sans-serif;
                " 
                onmouseover="this.style.transform='translateY(-3px)'; 
                             this.style.borderColor='${tipo.corHover}'; 
                             this.style.boxShadow='0 5px 15px ${tipo.cor}80';"
                onmouseout="this.style.transform='translateY(0)'; 
                            this.style.borderColor='${tipo.cor}'; 
                            this.style.boxShadow='none';"
                onclick="usarPokebolaParaCapturar('${tipo.id}', '${pokemon.name}', ${tipo.taxa})">
                    
                    <!-- Efeito de brilho -->
                    <div style="
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, ${tipo.cor}20, transparent);
                        transition: left 0.5s;
                    " 
                    onmouseover="this.style.left='100%';"
                    onmouseout="this.style.left='-100%';"></div>
                    
                    <!-- Ícone -->
                    <div style="
                        width: 60px;
                        height: 60px;
                        min-width: 60px;
                        background: ${tipo.cor};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 3px solid ${cores.textoClaro};
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        overflow: hidden;
                        transition: all 0.2s ease;
                    " 
                    onmouseover="this.style.transform='scale(1.05)'; 
                                 this.style.background='${tipo.corHover}';"
                    onmouseout="this.style.transform='scale(1)'; 
                                this.style.background='${tipo.cor}';">
                        <img src="${tipo.imagem}" alt="${tipo.nome}" 
                             style="width: 70%; height: 70%; object-fit: contain; transition: transform 0.2s;"
                             onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='🎯';"
                             onmouseover="this.style.transform='scale(1.1)';"
                             onmouseout="this.style.transform='scale(1)';">
                    </div>
                    
                    <!-- Informações -->
                    <div style="flex: 1;">
                        <div style="
                            font-weight: 700;
                            font-size: 1.1rem;
                            margin-bottom: 4px;
                            color: ${tipo.cor};
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            transition: color 0.2s;
                        " 
                        onmouseover="this.style.color='${tipo.corHover}';"
                        onmouseout="this.style.color='${tipo.cor}';">
                            ${tipo.nome}
                        </div>
                        <div style="font-size: 0.85rem; color: ${cores.textoClaro}99; margin-bottom: 6px;">
                            ${tipo.descricao}
                        </div>
                        <div style="font-size: 0.9rem; color: ${cores.textoClaro}cc; font-weight: 600;">
                            Taxa: <span style="color: ${tipo.cor}; transition: color 0.2s;"
                                onmouseover="this.style.color='${tipo.corHover}';"
                                onmouseout="this.style.color='${tipo.cor}';">
                                ${tipo.taxa}x
                            </span>
                        </div>
                    </div>
                    
                    <!-- Quantidade -->
                    <div style="
                        background: ${tipo.cor};
                        color: ${cores.textoClaro};
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        min-width: 50px;
                        text-align: center;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                        transition: all 0.2s ease;
                    " 
                    onmouseover="this.style.background='${tipo.corHover}'; 
                                 this.style.transform='scale(1.05)'; 
                                 this.style.boxShadow='0 5px 12px ${tipo.cor}80';"
                    onmouseout="this.style.background='${tipo.cor}'; 
                                this.style.transform='scale(1)'; 
                                this.style.boxShadow='0 3px 6px rgba(0,0,0,0.2)';">
                        ${quantidade}
                    </div>
                </div>
            `;

            listaDiv.insertAdjacentHTML('beforeend', itemHTML);
        }
    });

    listaDiv.style.display = temPokebolas ? 'block' : 'none';
    semPokebolasDiv.style.display = temPokebolas ? 'none' : 'block';
}


// ===== FUNÇÃO AUXILIAR - FECHAR MODAL E IR PARA LOJA =====
function fecharModalEIrParaLoja() {
    const modal = document.getElementById('modalInventarioCaptura');
    if (modal) modal.remove();
    
    // Abre a aba da loja
    if (typeof openTab === 'function') {
        openTab('store');
    } else if (typeof showTab === 'function') {
        showTab('store');
    } else {
        alert('Vá até a aba "Loja" para comprar pokébolas!');
    }
}

// ===== FUNÇÕES AUXILIARES =====
function getPokemonByName(nome) {
    // Procura o Pokémon em todos os mapas
    for (const mapa in pokemonsPorMapa) {
        const lista = pokemonsPorMapa[mapa];
        const encontrado = lista.find(p => p.name === nome);
        if (encontrado) return encontrado;
    }
    return null;
}

function getCorRaridade(raridade) {
    const cores = {
        "comum": "#808080",
        "incomum": "#4CAF50", 
        "raro": "#2196F3",
        "mistico": "#9C27B0",
        "lendário": "#FF9800"
    };
    return cores[raridade] || "#808080";
}

function getNomePokebola(id) {
    const nomes = {
        'pokeball': 'Pokébola',
        'greatball': 'Great Ball', 
        'ultraball': 'Ultra Ball'
    };
    return nomes[id] || 'Pokébola';
}

// ===== ATUALIZA A FUNÇÃO capturePokemon =====
function capturePokemon(pokemon) {
    // Fecha o modal se estiver aberto
    const modal = document.getElementById('modalInventarioCaptura');
    if (modal) modal.remove();
    
    // Captura o Pokémon (código original)
    pokedex[pokemon.name] = true;
    localStorage.setItem("pokedex", JSON.stringify(pokedex));

    capturados[pokemon.name] = {
        name: pokemon.name,
        img: pokemon.img,
        rarity: pokemon.rarity
    };
    localStorage.setItem("capturados", JSON.stringify(capturados));

    clearEncounter();
    if (typeof updatePokedex === "function") updatePokedex();
    if (typeof updateCaptured === "function") updateCaptured();
}

// ===== MOSTRA ENCONTRO =====
function showEncounter(pokemon) {
    const encounterDiv = document.getElementById("encounter");
    const btn = document.getElementById("capture-btn");

    // HTML do Pokémon encontrado
    encounterDiv.innerHTML = `
        <p>
            Você encontrou ${pokemon.name} 
            (<span class="rarity-${pokemon.rarity}">${pokemon.rarity}</span>)!
        </p>
        <img src="${pokemon.img}" alt="${pokemon.name}" style="width: 100px; height: 100px;">
    `;

    // VERIFICA SE JÁ TEM CAPTURADO (não se viu, mas se TEM)
    // Carrega capturados do localStorage para ter certeza
    let capturadosAtuais = {};
    try {
        const saved = localStorage.getItem("capturados");
        capturadosAtuais = saved ? JSON.parse(saved) : {};
    } catch (error) {
        capturadosAtuais = {};
        console.error("Erro ao carregar capturados:", error);
    }

    // Verifica se o Pokémon está na lista de CAPTURADOS (não na pokedex)
    if (capturadosAtuais[pokemon.name]) {
        // JÁ TEM CAPTURADO - mostra mensagem e esconde botão
        btn.style.display = "none";
        encounterDiv.innerHTML += `<p style="color: #4CAF50; font-weight: bold;">✨ Você já pegou esse Pokémon!</p>`;
    } else {
        // NÃO TEM CAPTURADO - mostra botão de capturar
        btn.style.display = "block";
        // Altera para abrir o modal de inventário
        btn.onclick = () => mostrarModalInventarioCaptura(pokemon);
        
    }
}