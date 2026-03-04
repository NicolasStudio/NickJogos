// ===== CONFIGURAÇÕES DOS ACHIEVEMENTS =====
const achievements = [
    {
        id: 'first-catch',
        name: 'Primeira Captura',
        description: 'Capture seu primeiro Pokémon.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 1
    },
    {
        id: 'catch-comum-10',
        name: 'Colecionador Comum',
        description: 'Capture 10 Pokémon de raridade Comum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'comum').length >= 10 
    },
    {
        id: 'catch-comum-25',
        name: 'Mestre dos Comuns',
        description: 'Capture 25 Pokémon de raridade Comum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'comum').length >= 25
    },
    {
        id: 'catch-comum-50',
        name: 'Lenda dos Comuns',
        description: 'Capture 50 Pokémon de raridade Comum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'comum').length >= 50
    },
    {
        id: 'catch-incomum-10',
        name: 'Colecionador Incomum',
        description: 'Capture 10 Pokémon de raridade Incomum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'incomum').length >= 10
    },
    {
        id: 'catch-incomum-20',
        name: 'Mestre dos Incomuns',
        description: 'Capture 20 Pokémon de raridade Incomum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'incomum').length >= 20
    },
    {
        id: 'catch-incomum-35',
        name: 'Lenda dos Incomuns',
        description: 'Capture 35 Pokémon de raridade Incomum.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'incomum').length >= 35
    },
    {
        id: 'catch-raro-5',
        name: 'Caçador de Raros',
        description: 'Capture 5 Pokémon de raridade Raro.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'raro').length >= 5
    },
    {
        id: 'catch-raro-10',
        name: 'Mestre dos Raros',
        description: 'Capture 10 Pokémon de raridade Raro.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'raro').length >= 10
    },
    {
        id: 'catch-raro-15',
        name: 'Lenda dos Raros',
        description: 'Capture 15 Pokémon de raridade Raro.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'raro').length >= 15
    },
    {
        id: 'catch-mistico-1',
        name: 'Encontro Místico',
        description: 'Capture 1 Pokémon de raridade Místico.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'mistico').length >= 1
    },
    {
        id: 'catch-lendario-1',
        name: 'Primeiro Lendário',
        description: 'Capture seu primeiro Pokémon Lendário.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'lendario').length >= 1
    },
    {
        id: 'catch-lendario-3',
        name: 'Colecionador de Lendas',
        description: 'Capture 3 Pokémon Lendários.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'lendario').length >= 3
    },
    {
        id: 'catch-lendario-5',
        name: 'Mestre das Lendas',
        description: 'Capture todos os 5 Pokémon Lendários.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.filter(p => p.rarity === 'lendario').length >= 5
    },
    {
        id: 'pokedex-25',
        name: 'Pokédex Novato',
        description: 'Capture 25 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 25
    },
    {
        id: 'pokedex-50',
        name: 'Pokédex Iniciante',
        description: 'Capture 50 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 50
    },
    {
        id: 'pokedex-75',
        name: 'Pokédex Colecionador',
        description: 'Capture 75 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 75
    },
    {
        id: 'pokedex-100',
        name: 'Pokédex Avançada',
        description: 'Capture 100 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 100
    },
    {
        id: 'pokedex-125',
        name: 'Pokédex Especialista',
        description: 'Capture 125 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 125
    },
    {
        id: 'pokedex-150',
        name: 'Pokédex Quase Completa',
        description: 'Capture 150 Pokémon diferentes.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 150
    },
    {
        id: 'pokedex-complete',
        name: 'Mestre Pokédex',
        description: 'Capture todos os 151 Pokémon.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/champion.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => gameState.capturedPokemon.length >= 151
    }
];

// ===== GERENCIADOR DE ACHIEVEMENTS =====
const AchievementManager = {
    // Estado dos achievements (desbloqueados)
    unlockedAchievements: [],
    
    // Flag para controlar notificações já mostradas nesta sessão
    notifiedAchievements: [],
    
    // Inicializar o sistema
    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.checkAllAchievements();
        
        // Configurar listener para mudanças no volume
        window.addEventListener('storage', (e) => {
            if (e.key === 'masterVolume') {
                console.log('Volume global atualizado:', e.newValue);
            }
        });
    },
    
    // Tocar som de achievement
    playAchievementSound() {
        try {
            // Pega o volume global do localStorage (definido nas opções)
            const savedVolume = localStorage.getItem('masterVolume');
            const masterVolume = savedVolume ? parseInt(savedVolume) : 70;
            const volume = Math.min(100, Math.max(0, masterVolume)) / 100; // Garante entre 0-1
            
            // Só toca se o volume não for 0
            if (volume > 0) {
                const audio = new Audio('/NickJogos/Music/MusicPokemon/Achievements.mp3');
                audio.volume = volume;
                audio.play().catch(e => {
                    // Ignora erro de autoplay (pode ser que o navegador bloqueie)
                    console.log('Áudio de achievement não pôde ser reproduzido:', e);
                });
            }
        } catch (e) {
            console.error('Erro ao tocar som de achievement:', e);
        }
    },
    
    // Carregar progresso do localStorage
    loadProgress() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            try {
                this.unlockedAchievements = JSON.parse(saved);
                this.notifiedAchievements = [...this.unlockedAchievements];
            } catch (e) {
                console.error('Erro ao carregar achievements:', e);
                this.unlockedAchievements = [];
                this.notifiedAchievements = [];
            }
        } else {
            this.unlockedAchievements = [];
            this.notifiedAchievements = [];
        }
    },
    
    // Salvar progresso no localStorage
    saveProgress() {
        localStorage.setItem('achievements', JSON.stringify(this.unlockedAchievements));
    },
    
    // Verificar se um achievement específico está desbloqueado
    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    },
    
    // Verificar se já notificou este achievement nesta sessão
    wasNotified(achievementId) {
        return this.notifiedAchievements.includes(achievementId);
    },
    
    // Desbloquear um achievement
    unlockAchievement(achievementId) {
        if (!this.isUnlocked(achievementId)) {
            const achievement = achievements.find(a => a.id === achievementId);
            if (achievement) {
                this.unlockedAchievements.push(achievementId);
                this.saveProgress();
                
                // Só mostra notificação se ainda não foi notificado nesta sessão
                if (!this.wasNotified(achievementId)) {
                    this.notifiedAchievements.push(achievementId);
                    this.showAchievementNotification(achievement);
                }
                
                // Verificar achievements de colecionador após desbloquear
                this.checkCollectorAchievements();
                
                // Disparar evento de achievement desbloqueado
                document.dispatchEvent(new CustomEvent('achievementUnlocked', {
                    detail: { achievement: achievement }
                }));
                
                return true;
            }
        }
        return false;
    },
    
    // Mostrar notificação de achievement desbloqueado
    showAchievementNotification(achievement) {
        // Remove notificação anterior se existir
        const oldNotif = document.getElementById('achievement-notification');
        if (oldNotif) oldNotif.remove();
        
        // Tocar som de achievement
        this.playAchievementSound();
        
        // Cria container da notificação
        const notification = document.createElement('div');
        notification.id = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.5s ease, fadeOut 0.5s ease 4.5s forwards;
            font-family: 'Oxanium', sans-serif;
            border-left: 5px solid #fff;
        `;
        
        notification.innerHTML = `
            <img src="${achievement.icon}" alt="Achievement" style="width: 50px; height: 50px; object-fit: contain;">
            <div>
                <div style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">🏆 Conquista Desbloqueada!</div>
                <div style="font-weight: 700; font-size: 1.2rem;">${achievement.name}</div>
                <div style="font-size: 0.9rem;">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },
    
    // Verificar todos os achievements
    checkAllAchievements() {
        const gameState = this.getGameState();
        
        achievements.forEach(achievement => {
            if (!this.isUnlocked(achievement.id)) {
                if (achievement.condition(gameState)) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
        
        if (document.getElementById('achievements-grid')) {
            this.renderAchievements();
        }
    },
    
    // Obter estado atual do jogo
    getGameState() {
        const capturados = JSON.parse(localStorage.getItem('capturados')) || {};
        const capturedPokemon = Object.keys(capturados).map(name => {
            const pokemon = TodosPokemons.find(p => p.name === name);
            return pokemon || { name, rarity: 'comum' };
        });
        
        return {
            capturedPokemon: capturedPokemon,
            capturados: capturados
        };
    },
    
    // Verificar achievements de colecionador
    checkCollectorAchievements() {
        const unlockedCount = this.unlockedAchievements.length;
        
        if (unlockedCount >= 5 && !this.isUnlocked('collector-bronze')) {
            this.unlockAchievement('collector-bronze');
        }
        if (unlockedCount >= 10 && !this.isUnlocked('collector-silver')) {
            this.unlockAchievement('collector-silver');
        }
        if (unlockedCount >= 15 && !this.isUnlocked('collector-gold')) {
            this.unlockAchievement('collector-gold');
        }
        if (unlockedCount >= 20 && !this.isUnlocked('collector-platinum')) {
            this.unlockAchievement('collector-platinum');
        }
    },
    
    // Renderizar achievements na interface
    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;
        
        const gameState = this.getGameState();
        
        container.innerHTML = '';
        
        achievements.forEach(achievement => {
            const unlocked = this.isUnlocked(achievement.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
            card.style.cssText = `
                background: ${unlocked ? 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' : '#1a1a1a'};
                border: 2px solid ${unlocked ? '#FFD700' : '#333'};
                border-radius: 10px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 10px;
                transition: all 0.3s ease;
                cursor: pointer;
                opacity: ${unlocked ? 1 : 0.6};
            `;
            
            card.innerHTML = `
                <img src="${unlocked ? achievement.icon : achievement.iconLocked}" 
                     alt="${achievement.name}"
                     style="width: 64px; height: 64px; object-fit: contain;">
                <h3 style="color: ${unlocked ? '#FFD700' : '#888'}; margin: 0; font-size: 1rem;">
                    ${achievement.name}
                </h3>
                <p style="color: #aaa; margin: 0; font-size: 0.85rem;">
                    ${achievement.description}
                </p>
                ${unlocked ? '<span style="color: #FFD700; font-size: 0.8rem;">✓ DESBLOQUEADO</span>' : ''}
            `;
            
            container.appendChild(card);
        });
        
        this.updateProgressCounters();
    },
    
    // Atualizar contadores de progresso
    updateProgressCounters() {
        const progressCount = document.getElementById('progress-count');
        const progressBar = document.getElementById('progress-bar');
        const totalCount = document.getElementById('total-count');
        
        if (progressCount) {
            progressCount.textContent = this.unlockedAchievements.length;
        }
        
        if (progressBar) {
            const percentage = (this.unlockedAchievements.length / achievements.length) * 100;
            progressBar.style.width = percentage + '%';
        }
        
        if (totalCount) {
            totalCount.textContent = achievements.length;
        }
    },
    
    // Configurar event listeners
    setupEventListeners() {
        document.addEventListener('pokemonCaptured', () => {
            this.checkAllAchievements();
        });
        
        document.addEventListener('pokemonSold', () => {
            this.checkAllAchievements();
        });
        
        // Verificação periódica como fallback
        setInterval(() => {
            this.checkAllAchievements();
        }, 3000);
    },
    
    // Estatísticas dos achievements
    getStats() {
        const total = achievements.length;
        const unlocked = this.unlockedAchievements.length;
        const percentage = (unlocked / total * 100).toFixed(1);
        
        return {
            total,
            unlocked,
            percentage
        };
    }
};

// ===== ACHIEVEMENTS DE COLECIONADOR (adicionar após o array principal) =====
const collectorAchievements = [
    {
        id: 'collector-bronze',
        name: 'Colecionador Bronze',
        description: 'Desbloqueie 5 achievements.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/bronze.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => AchievementManager.unlockedAchievements.length >= 5
    },
    {
        id: 'collector-silver',
        name: 'Colecionador Prata',
        description: 'Desbloqueie 10 achievements.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/prata.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => AchievementManager.unlockedAchievements.length >= 10
    },
    {
        id: 'collector-gold',
        name: 'Colecionador Ouro',
        description: 'Desbloqueie 15 achievements.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/ouro.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => AchievementManager.unlockedAchievements.length >= 15
    },
    {
        id: 'collector-platinum',
        name: 'Colecionador Platina',
        description: 'Desbloqueie 20 achievements.',
        icon: '/NickJogos/Img/ImagemPokemon/Trofeus/platina.png',
        iconLocked: '/NickJogos/Img/ImagemPokemon/Trofeus/bloqueado.png',
        condition: (gameState) => AchievementManager.unlockedAchievements.length >= 20
    }
];

// Adicionar achievements de colecionador ao array principal
achievements.push(...collectorAchievements);

// ===== FUNÇÕES DE INTERFACE =====
function abrirModalAchievements() {
    // Fechar modal existente se houver
    const modalExistente = document.getElementById('modal-achievements');
    if (modalExistente) modalExistente.remove();
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-achievements';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Oxanium', sans-serif;
        animation: fadeIn 0.3s ease;
    `;
    
    const stats = AchievementManager.getStats();
    
    // Conteúdo do modal
    modal.innerHTML = `
        <div style="
            background: #1a1a1a;
            border-radius: 15px;
            padding: 30px;
            width: 900px;
            max-width: 95%;
            max-height: 85vh;
            overflow-y: auto;
            color: #fff;
            border: 3px solid #FFD700;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #FFD700; margin: 0;">🏆 CONQUISTAS</h2>
                <button id="fechar-achievements" style="
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0 10px;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 20px; text-align: center;">
                <div style="font-size: 1.2rem; margin-bottom: 10px;">
                    Progresso: <span id="progress-count">${stats.unlocked}</span>/<span id="total-count">${stats.total}</span> (${stats.percentage}%)
                </div>
                <div style="
                    width: 100%;
                    height: 25px;
                    background: #333;
                    border-radius: 12px;
                    margin-top: 10px;
                    overflow: hidden;
                    position: relative;
                ">
                    <div id="progress-bar" style="
                        height: 100%;
                        background: linear-gradient(90deg, #FFD700, #FFA500);
                        width: ${stats.percentage}%;
                        transition: width 0.3s ease;
                    "></div>
                </div>
            </div>
            
            <div id="achievements-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 15px;
                padding: 10px 0;
            "></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Renderizar achievements
    AchievementManager.renderAchievements();
    
    // Fechar modal
    document.getElementById('fechar-achievements').onclick = () => {
        modal.remove();
    };
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// ===== ANIMAÇÕES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Scrollbar personalizada */
    #modal-achievements ::-webkit-scrollbar {
        width: 8px;
    }
    
    #modal-achievements ::-webkit-scrollbar-track {
        background: #333;
        border-radius: 4px;
    }
    
    #modal-achievements ::-webkit-scrollbar-thumb {
        background: #FFD700;
        border-radius: 4px;
    }
    
    #modal-achievements ::-webkit-scrollbar-thumb:hover {
        background: #FFA500;
    }
`;
document.head.appendChild(style);

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    AchievementManager.init();
});