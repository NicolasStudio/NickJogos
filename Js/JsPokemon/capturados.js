// ===== CAPTURADOS =====
// Lista atual de pokémons que o jogador possui
let capturados = {};

try {
    const saved = localStorage.getItem("capturados");
    
    if (saved && saved.trim() !== "") {
        capturados = JSON.parse(saved);
    } else {
        capturados = {};
    }
} catch (error) {
    capturados = {};
}

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
      <button class="vender-btn" onclick="mostrarModalVenda('${p.name}')">Vender</button>
    `;

    capturedDiv.appendChild(div);
  }
}

function showMessage(text, type = 'info') {
    try {
        const existingMessage = document.querySelector('.store-message');
        if (existingMessage) existingMessage.remove();

        const message = document.createElement('div');
        message.className = `store-message message-${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) message.remove();
        }, 3000);
    } catch (error) {
        console.error('Erro ao mostrar mensagem:', error);
    }
}

function processarVendaPokemon(nome) {
    const p = capturados[nome];
    if (!p) {
        alert('Pokémon não encontrado!');
        return false;
    }
    
    const valores = {
        "comum": 250,
        "incomum": 380,
        "raro": 800,
        "mistico": 8000,
        "lendario": 10000
    };
    
    const valorVenda = valores[p.rarity] || 100;
    
    const dinheiroAtual = parseInt(localStorage.getItem('pokemonMoney')) || 0;
    const novoDinheiro = dinheiroAtual + valorVenda;
    localStorage.setItem('pokemonMoney', novoDinheiro.toString());
    
    delete capturados[nome];
    localStorage.setItem("capturados", JSON.stringify(capturados));
    
    // Feedback
    showMessage(`Vendeu ${nome} por $${valorVenda}!`, 'success');
    
    updateCaptured();
    
    if (window.pokemonStore) {
        window.pokemonStore.money = novoDinheiro;
        window.pokemonStore.updateStore();
    }
    
    return true;
}


// ===== MODAL BONITO DE VENDA =====
function mostrarModalVenda(nome) {
    const p = capturados[nome];
    if (!p) {
        alert('Pokémon não encontrado!');
        return;
    }
    
    // Valores de venda
    const valores = {
        "comum": 100,
        "incomum": 300,
        "raro": 800,
        "mistico": 8000,
        "lendario": 10000
    };
    
    const valorVenda = valores[p.rarity] || 100;
    
    // Cores por raridade
    const coresRaridade = {
        "comum": "#808080",
        "incomum": "#4CAF50", 
        "raro": "#2196F3",
        "mistico": "#9C27B0",
        "lendario": "#FF9800"
    };
    
    const cor = coresRaridade[p.rarity] || "#808080";
    
    // Cria modal
    const modalHTML = `
        <div id="modalVendaPokemon" style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: white;
                border-radius: 15px;
                padding: 25px;
                width: 350px;
                max-width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                animation: fadeIn 0.3s ease;
            ">
                <h3 style="
                    color: #333; 
                    margin: 0 0 15px 0;
                    font-size: 1.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    🏪 Vender Pokémon
                </h3>
                
                <div style="
                    font-size: 1.1rem;
                    margin-bottom: 15px;
                    color: #555;
                    padding: 10px;
                    background: #f9f9f9;
                    border-radius: 10px;
                ">
                    Deseja vender <strong style="color: ${cor};">${nome}</strong>?
                </div>
                
                <div style="margin: 20px 0; text-align: center;">
                    <img src="${p.img}" alt="${nome}" 
                         style="
                            width: 80px; 
                            height: 80px; 
                            border-radius: 50%; 
                            border: 3px solid ${cor};
                            padding: 5px;
                            object-fit: contain;
                            display: block;
                            margin: 0 auto;
                         ">
                    
                    <div style="
                        margin-top: 10px;
                        font-weight: bold;
                        color: ${cor};
                        background: ${cor}20;
                        padding: 4px 12px;
                        border-radius: 15px;
                        display: inline-block;
                        font-size: 0.9rem;
                    ">
                        ${p.rarity}
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #f1c40f, #f39c12);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-size: 1.4rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <span>💰</span>
                    <span>Por: $${valorVenda.toLocaleString()}</span>
                </div>
                
                <div style="
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                ">
                    <button id="btnCancelarVenda" style="
                        flex: 1;
                        padding: 12px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                        ❌ NÃO
                    </button>
                    <button id="btnConfirmarVenda" style="
                        flex: 1;
                        padding: 12px;
                        background: #27ae60;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                        ✅ SIM
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            #btnConfirmarVenda:hover {
                background: #219653 !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
            }
            
            #btnCancelarVenda:hover {
                background: #c0392b !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
            }
        </style>
    `;
    
    // Remove modal anterior se existir
    const modalAntigo = document.getElementById('modalVendaPokemon');
    if (modalAntigo) modalAntigo.remove();
    
    // Adiciona novo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configura os botões
    const modal = document.getElementById('modalVendaPokemon');
    
    modal.querySelector('#btnConfirmarVenda').addEventListener('click', () => {
        // Fecha o modal
        modal.remove();
        
        // Chama a função que processa a venda
        processarVendaPokemon(nome);
    });
    
    modal.querySelector('#btnCancelarVenda').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fecha ao clicar fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===== MANTÉM COMPATIBILIDADE =====
// Se algum código antigo ainda chamar venderPokemon, redireciona para o modal
function venderPokemon(nome) {
    mostrarModalVenda(nome);
}