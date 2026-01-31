// Store.js - COM TRATAMENTO DE ERROS
class PokemonStore {
    constructor() {
        // Produtos disponíveis
        this.products = [
            {
                id: 'pokeball',
                name: 'Pokébola',
                description: 'Bola básica para captura',
                price: 200,
                catchRate: 1.0,
                image: '/NickJogos/Img/ImagemPokemon/Pokebola/pokeball.png'
            },
            {
                id: 'greatball',
                name: 'Great Ball',
                description: 'Taxa de captura melhorada',
                price: 600,
                catchRate: 1.5,
                image: '/NickJogos/Img/ImagemPokemon/Pokebola/superball.png'
            },
            {
                id: 'ultraball',
                name: 'Ultra Ball',
                description: 'Maior taxa de captura',
                price: 1200,
                catchRate: 2.0,
                image: '/NickJogos/Img/ImagemPokemon/Pokebola/ultraball.png'
            },
            {
                id: 'coming_soon_1',
                name: 'Em Breve!',
                description: 'Novas pokébolas',
                price: 0,
                catchRate: 0,
                image: '',
                comingSoon: true
            },
            {
                id: 'coming_soon_2',
                name: 'Em Breve!',
                description: 'Novas pokébolas',
                price: 0,
                catchRate: 0,
                image: '',
                comingSoon: true
            }
        ];

        // Carrega dados com tratamento de erros
        this.money = this.loadMoney();
        this.inventory = this.loadInventory();
        
        // Inicializa quantidades
        this.quantities = {};
        this.initQuantities();
    }

    // ============================================
    // MÉTODOS DE INICIALIZAÇÃO COM TRATAMENTO DE ERROS
    // ============================================

    loadMoney() {
        try {
            const savedMoney = localStorage.getItem('pokemonMoney');
            if (!savedMoney) {
                return 5000; // Valor padrão
            }
            
            const money = parseInt(savedMoney);
            if (isNaN(money)) {
                console.warn('Valor de dinheiro inválido, usando padrão');
                return 5000;
            }
            
            return Math.max(0, money);
        } catch (error) {
            console.error('Erro ao carregar dinheiro:', error);
            return 5000;
        }
    }

    loadInventory() {
        try {
            const savedInventory = localStorage.getItem('pokemonInventory');
            if (!savedInventory || savedInventory.trim() === '') {
                return this.getDefaultInventory();
            }
            
            const inventory = JSON.parse(savedInventory);
            
            // Valida a estrutura do inventário
            if (typeof inventory !== 'object' || inventory === null) {
                console.warn('Inventário inválido, usando padrão');
                return this.getDefaultInventory();
            }
            
            return inventory;
        } catch (error) {
            console.error('Erro ao carregar inventário:', error);
            return this.getDefaultInventory();
        }
    }

    getDefaultInventory() {
        return {
            pokeball: { count: 5, catchRate: 1.0 },
            greatball: { count: 0, catchRate: 1.5 },
            ultraball: { count: 0, catchRate: 2.0 }
        };
    }

    initQuantities() {
        this.products.forEach(product => {
            if (!product.comingSoon) {
                this.quantities[product.id] = 0;
            }
        });
    }

    // ============================================
    // MÉTODOS DE PERSISTÊNCIA
    // ============================================

    saveMoney() {
        try {
            localStorage.setItem('pokemonMoney', this.money.toString());
        } catch (error) {
            console.error('Erro ao salvar dinheiro:', error);
        }
    }

    saveInventory() {
        try {
            const inventoryToSave = JSON.stringify(this.inventory);
            localStorage.setItem('pokemonInventory', inventoryToSave);
        } catch (error) {
            console.error('Erro ao salvar inventário:', error);
        }
    }

    // ============================================
    // MÉTODOS DE NEGÓCIO
    // ============================================

    increaseQuantity(productId) {
        if (this.quantities.hasOwnProperty(productId)) {
            this.quantities[productId]++;
            this.updateStore();
        }
    }

    decreaseQuantity(productId) {
        if (this.quantities.hasOwnProperty(productId) && this.quantities[productId] > 0) {
            this.quantities[productId]--;
            this.updateStore();
        }
    }

    clearQuantity(productId) {
        if (this.quantities.hasOwnProperty(productId)) {
            this.quantities[productId] = 0;
            this.updateStore();
        }
    }

    buyProduct(productId) {
        try {
            const quantity = this.quantities[productId] || 0;
            
            if (quantity <= 0) {
                this.showMessage('Selecione uma quantidade!', 'info');
                return false;
            }

            const product = this.getProduct(productId);
            if (!product) {
                this.showMessage('Produto não encontrado!', 'error');
                return false;
            }

            const totalCost = product.price * quantity;

            if (this.money < totalCost) {
                this.showMessage('Dinheiro insuficiente!', 'error');
                return false;
            }

            // Processa a compra
            this.money -= totalCost;
            
            // Garante que o inventário existe para este produto
            if (!this.inventory[productId]) {
                this.inventory[productId] = { 
                    count: 0, 
                    catchRate: product.catchRate 
                };
            }
            
            this.inventory[productId].count += quantity;
            
            // Salva os dados
            this.saveMoney();
            this.saveInventory();
            
            // Zera a quantidade
            this.quantities[productId] = 0;
            
            this.showMessage(`Comprou ${quantity}x ${product.name}!`, 'success');
            this.updateStore();
            return true;
            
        } catch (error) {
            console.error('Erro ao processar compra:', error);
            this.showMessage('Erro ao processar compra!', 'error');
            return false;
        }
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    getProduct(productId) {
        return this.products.find(p => p.id === productId) || null;
    }

    getTotalCost() {
        let total = 0;
        for (const [productId, quantity] of Object.entries(this.quantities)) {
            if (quantity > 0) {
                const product = this.getProduct(productId);
                if (product) {
                    total += product.price * quantity;
                }
            }
        }
        return total;
    }

    showMessage(text, type = 'info') {
        try {
            // Remove mensagem anterior
            const existingMessage = document.querySelector('.store-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Cria nova mensagem
            const message = document.createElement('div');
            message.className = `store-message message-${type}`;
            message.textContent = text;
            
            document.body.appendChild(message);
            
            // Remove após 3 segundos
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        } catch (error) {
            console.error('Erro ao mostrar mensagem:', error);
        }
    }

    // ============================================
    // RENDERIZAÇÃO
    // ============================================

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        if (product.comingSoon) {
            card.classList.add('coming-soon-card');
            card.innerHTML = `
                <div class="coming-soon-icon">🔒</div>
                <div class="product-name">${product.name}</div>
                <div class="coming-soon-label">${product.description}</div>
                <div style="color: #e74c3c; font-weight: bold; margin-top: 3px;">---</div>
            `;
        } else {
            const quantity = this.quantities[product.id] || 0;
            const canBuy = quantity > 0 && this.money >= (product.price * quantity);
            const hasQuantity = quantity > 0;
            const totalPrice = product.price * quantity;
            
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='🎯';">
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="catch-rate">${product.catchRate}x</div>
                <div class="product-price">$${product.price}</div>
                
                <div class="quantity-controls">
                    <button class="qty-btn minus" 
                            onclick="window.pokemonStore.decreaseQuantity('${product.id}')"
                            ${quantity === 0 ? 'disabled' : ''}>
                        -
                    </button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="qty-btn plus" 
                            onclick="window.pokemonStore.increaseQuantity('${product.id}')">
                        +
                    </button>
                </div>
                
                <div class="product-actions">
                    <button class="action-btn buy-btn" 
                            onclick="window.pokemonStore.buyProduct('${product.id}')"
                            ${!canBuy ? 'disabled' : ''}>
                        Comprar
                    </button>
                    <button class="action-btn clear-btn" 
                            onclick="window.pokemonStore.clearQuantity('${product.id}')"
                            ${!hasQuantity ? 'disabled' : ''}>
                        Limpar
                    </button>
                </div>
                
                ${quantity > 0 ? 
                    `<div style="font-size: 0.75rem; color: #666; margin-top: 4px;">
                        Total: $${totalPrice}
                    </div>` 
                    : ''
                }
            `;
        }
        
        return card;
    }

    updateStore() {
        try {
            const storeDiv = document.getElementById('storeTabContent');
            if (!storeDiv) {
                console.warn('Elemento storeTabContent não encontrado');
                return;
            }

            storeDiv.innerHTML = '';

            const container = document.createElement('div');
            container.className = 'store-container';
            
            // Cabeçalho
            const header = document.createElement('div');
            header.className = 'store-header';
            header.innerHTML = `
                <div class="store-title"> <h2> 🏪 Loja de Pokébolas </h2> </div>
                <div class="money-display">
                    Dinheiro: <span>$${this.money.toLocaleString()}</span>
                </div>
            `;
            container.appendChild(header);

            // Produtos
            const productsGrid = document.createElement('div');
            productsGrid.className = 'products-grid';
            
            this.products.forEach(product => {
                productsGrid.appendChild(this.createProductCard(product));
            });
            
            container.appendChild(productsGrid);

            // Total da compra
            const totalCost = this.getTotalCost();
            if (totalCost > 0) {
                const totalDiv = document.createElement('div');
                totalDiv.className = 'purchase-total';
                totalDiv.innerHTML = `
                    <span class="total-label">Total da compra:</span>
                    <span class="total-amount">$${totalCost}</span>
                `;
                container.appendChild(totalDiv);
            }
            
            storeDiv.appendChild(container);
            
        } catch (error) {
            console.error('Erro ao atualizar loja:', error);
            this.showMessage('Erro ao carregar loja!', 'error');
        }
    }

    // ============================================
    // MÉTODOS PARA O JOGO
    // ============================================

    usePokeball(type = 'pokeball') {
        try {
            if (this.inventory[type] && this.inventory[type].count > 0) {
                this.inventory[type].count--;
                this.saveInventory();
                return this.inventory[type].catchRate;
            }
            return 0;
        } catch (error) {
            console.error('Erro ao usar pokébola:', error);
            return 0;
        }
    }

    getPokeballCount(type = 'pokeball') {
        return this.inventory[type] ? this.inventory[type].count : 0;
    }

    addMoney(amount) {
        try {
            if (amount > 0) {
                this.money += amount;
                this.saveMoney();
                this.showMessage(`+$${amount}`, 'success');
                this.updateStore();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao adicionar dinheiro:', error);
            return false;
        }
    }

    // ============================================
    //                INICIALIZAÇÃO
    // ============================================

    init() {
        console.log('🏪 Loja Pokémon inicializada!');
        console.log('💰 Dinheiro:', this.money);
        console.log('📦 Inventário:', this.inventory);
        
        this.updateStore();
        
        // Configura listener para a aba da loja
        this.setupTabListener();
    }

setupTabListener() {
    // Método mais seguro: usa um intervalo para verificar quando a aba é clicada
    const checkAndSetupStore = () => {
        // Verifica se estamos na aba da loja
        const storeTabContent = document.getElementById('storeTabContent');
        if (storeTabContent && storeTabContent.style.display !== 'none') {
            this.updateStore();
        }
    };
    
    // Configura um MutationObserver para detectar mudanças nas tabs
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                mutation.target.id === 'storeTabContent') {
                if (mutation.target.style.display !== 'none') {
                    this.updateStore();
                }
            }
        });
    });
    
    // Observa mudanças no elemento da loja
    const storeTabContent = document.getElementById('storeTabContent');
    if (storeTabContent) {
        observer.observe(storeTabContent, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Também adiciona listeners para elementos que possam ser tabs
    const possibleTabElements = document.querySelectorAll(
        'button, a, [role="tab"], .tab, .tab-btn, .nav-link, [data-tab]'
    );
    
    possibleTabElements.forEach(element => {
        // Verifica pelo texto ou atributos
        const text = (element.textContent || element.innerText || '').toLowerCase();
        const hasStoreText = text.includes('loja') || text.includes('store');
        const hasStoreAttr = element.getAttribute('onclick')?.includes('store') || 
                           element.getAttribute('data-tab')?.includes('store');
        
        if (hasStoreText || hasStoreAttr) {
            element.addEventListener('click', () => {
                setTimeout(() => {
                    this.updateStore();
                }, 200);
            });
        }
    });
    
    // Método alternativo: verifica a cada segundo se a loja está visível
    setInterval(() => {
        if (storeTabContent && storeTabContent.style.display !== 'none') {
            this.updateStore();
        }
    }, 1000);
}
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

let pokemonStore = null;

function initStore() {
    try {
        pokemonStore = new PokemonStore();
        pokemonStore.init();
        
        // Torna disponível globalmente
        window.pokemonStore = pokemonStore;
        
        // Funções auxiliares
        window.addMoney = function(amount) {
            return pokemonStore.addMoney(amount);
        };
        
        window.usePokeball = function(type) {
            return pokemonStore.usePokeball(type);
        };
        
        window.getPokeballCount = function(type) {
            return pokemonStore.getPokeballCount(type);
        };
        
        console.log('✅ Loja carregada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar loja:', error);
        alert('Erro ao carregar a loja. Por favor, recarregue a página.');
    }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
} else {
    initStore();
}

// Funções de debug (remova em produção)
window.debugStore = function() {
    console.log('=== DEBUG STORE ===');
    console.log('Dinheiro:', pokemonStore?.money);
    console.log('Inventário:', pokemonStore?.inventory);
    console.log('Quantidades:', pokemonStore?.quantities);
    
    // Limpa localStorage problemático
    localStorage.removeItem('pokemonInventory');
    localStorage.removeItem('pokemonMoney');
    
    alert('LocalStorage limpo. Recarregue a página.');
};