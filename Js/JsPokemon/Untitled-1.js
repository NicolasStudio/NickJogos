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
            background: ${cores.fundoEscuro}e6; /* e6 = 90% opacity */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Oxanium', sans-serif;
            backdrop-filter: blur(3px);
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
                    margin-bottom: 20px;
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

// ===== CARREGA POKÉBOLAS DO INVENTÁRIO =====
function carregarPokebolasInventario(pokemon) {
    const listaDiv = document.getElementById('listaPokebolas');
    const semPokebolasDiv = document.getElementById('semPokebolas');
    
    if (!listaDiv) return;
    
    // Limpa a lista
    listaDiv.innerHTML = '';
    
    // Cores do sistema
    const cores = {
        fundoEscuro: '#111',
        textoClaro: '#fff',
        primaria: '#c00',
        secundaria: '#c0392b'
    };
    
    // Obtém inventário da loja ou localStorage
    let inventario = {};
    
    if (window.pokemonStore && window.pokemonStore.inventory) {
        inventario = window.pokemonStore.inventory;
    } else {
        try {
            const saved = localStorage.getItem('pokemonInventory');
            inventario = saved ? JSON.parse(saved) : {};
        } catch {
            inventario = {};
        }
    }
    
    // Tipos de pokébolas disponíveis
    const tiposPokebolas = [
        { 
            id: 'pokeball', 
            nome: 'POKÉBOLA', 
            cor: '#c00', 
            corHover: '#ff4444',  // Vermelho mais claro para hover
            taxa: 1.0, 
            imagem: 'Img/ImagemPokemon/Pokebola/pokeball.png',
            descricao: 'Taxa básica de captura'
        },
        { 
            id: 'greatball', 
            nome: 'GREAT BALL', 
            cor: '#2196F3', 
            corHover: '#64b5f6',  // Azul mais claro para hover
            taxa: 1.5, 
            imagem: 'Img/ImagemPokemon/Pokebola/superball.png',
            descricao: 'Taxa de captura melhorada'
        },
        { 
            id: 'ultraball', 
            nome: 'ULTRA BALL', 
            cor: '#FF9800', 
            corHover: '#ffb74d',  // Laranja mais claro para hover
            taxa: 2.0, 
            imagem: 'Img/ImagemPokemon/Pokebola/ultraball.png',
            descricao: 'Alta taxa de captura'
        }
    ];
    
    let temPokebolas = false;
    
    // Adiciona cada tipo de pokébola que o jogador tem
    tiposPokebolas.forEach(tipo => {
        const quantidade = inventario[tipo.id] ? inventario[tipo.id].count : 0;
        
        if (quantidade > 0) {
            temPokebolas = true;
            
            const itemHTML = `
                <div class="item-pokebola" style="
                    background: ${cores.fundoEscuro};
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border: 2px solid ${tipo.cor};  /* ← BORDA VISÍVEL SEM OPACIDADE */
                    position: relative;
                    overflow: hidden;
                    font-family: 'Oxanium', sans-serif;
                " 
                onmouseover="this.style.transform='translateY(-3px)'; 
                             this.style.borderColor='${tipo.corHover || tipo.cor}'; 
                             this.style.boxShadow='0 5px 15px ${tipo.cor}80';"
                onmouseout="this.style.transform='translateY(0)'; 
                            this.style.borderColor='${tipo.cor}'; 
                            this.style.boxShadow='none';"
                onclick="usarPokebolaParaCapturar('${tipo.id}', '${pokemon.name}', ${tipo.taxa})">
                    
                    <!-- Efeito de brilho no hover -->
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
                    
                    <!-- Ícone da pokébola -->
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
                                 this.style.background='${tipo.corHover || tipo.cor}';"
                    onmouseout="this.style.transform='scale(1)'; 
                                this.style.background='${tipo.cor}';">
                        <img src="${tipo.imagem}" alt="${tipo.nome}" 
                             style="width: 70%; height: 70%; object-fit: contain; transition: transform 0.2s;"
                             onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='🎯';"
                             onmouseover="this.style.transform='scale(1.1)';"
                             onmouseout="this.style.transform='scale(1)';">
                    </div>
                    
                    <!-- Informações da pokébola -->
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
                        onmouseover="this.style.color='${tipo.corHover || tipo.cor}';"
                        onmouseout="this.style.color='${tipo.cor}';">
                            ${tipo.nome}
                        </div>
                        <div style="
                            font-size: 0.85rem;
                            color: ${cores.textoClaro}99;
                            margin-bottom: 6px;
                        ">
                            ${tipo.descricao}
                        </div>
                        <div style="
                            font-size: 0.9rem;
                            color: ${cores.textoClaro}cc;
                            font-weight: 600;
                        ">
                            Taxa: <span style="
                                color: ${tipo.cor};
                                transition: color 0.2s;
                            " 
                            onmouseover="this.style.color='${tipo.corHover || tipo.cor}';"
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
                    onmouseover="this.style.background='${tipo.corHover || tipo.cor}'; 
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
    
    // Mostra mensagem se não tiver pokébolas
    if (!temPokebolas) {
        listaDiv.style.display = 'none';
        semPokebolasDiv.style.display = 'block';
    } else {
        listaDiv.style.display = 'block';
        semPokebolasDiv.style.display = 'none';
    }
}