// ==================== SISTEMA DE CONQUISTAS (ATUALIZADO) ====================

const Achievements = {
    // Lista de conquistas
    lista: [
        {
            id: 1,
            titulo: "🧬 Primeiro DNA",
            descricao: "Sintetizar o primeiro DNA",
            icone: "🧬",
            verificar: () => GameData.dna >= 1
        },
        {
            id: 2,
            titulo: "🔬 Primeira Molécula",
            descricao: "Gerar a primeira molécula orgânica",
            icone: "🔬",
            verificar: () => GameData.moleculas >= 1
        },
        {
            id: 3,
            titulo: "⚡ Metabolismo",
            descricao: "Desenvolver o metabolismo (VITÓRIA!)",
            icone: "⚡",
            verificar: () => GameData.metabolismo >= 1
        },
        {
            id: 4,
            titulo: "📦 Mestre da Expansão",
            descricao: "Atingir o nível máximo de Expansão do Protoplasma",
            icone: "📦",
            verificar: () => GameData.upgradeNivel >= 6
        },
        {
            id: 5,
            titulo: "⚙️ Automação Total",
            descricao: "Atingir nível máximo em todas as automações",
            icone: "⚙️",
            verificar: () => GameData.autoNivel >= 6 && 
                           GameData.autoMoleculaNivel >= 6 && 
                           GameData.autoMembranaNivel >= 6
        },
        {
            id: 6,
            titulo: "🧬 DNA Gêmeo",
            descricao: "Ativar o upgrade de clonagem de DNA",
            icone: "🧬",
            verificar: () => GameData.clonagemNivel >= 1
        },
        {
            id: 7,
            titulo: "💎 Colecionador",
            descricao: "Acumular 100 DNA",
            icone: "💎",
            verificar: () => GameData.dna >= 100
        },
        {
            id: 8,
            titulo: "🚀 Expansão Máxima",
            descricao: "Expandir o limite de DNA para 100",
            icone: "🚀",
            verificar: () => GameData.maxDNA >= 100
        },
        // ==================== NOVAS CONQUISTAS ====================
        {
            id: 9,
            titulo: "🔬 Primeira Célula",
            descricao: "Formar a primeira célula e dar início à vida",
            icone: "🔬",
            verificar: () => GameData.primeiraCelula >= 1
        },
        {
            id: 10,
            titulo: "🐑 Dolly",
            descricao: "Alcançar 20% de chance de clonagem (Nível máximo de DNA Gêmeo)",
            icone: "🐑",
            verificar: () => GameData.clonagemNivel >= 6
        }
        // ==================== FIM DAS NOVAS CONQUISTAS ====================
    ],
    
    // Conquistas desbloqueadas
    desbloqueadas: [],
    
    // Inicializar conquistas salvas
    init() {
        const salvo = localStorage.getItem('achievements_unlocked');
        if (salvo) {
            this.desbloqueadas = JSON.parse(salvo);
        }
    },
    
    // Verificar todas as conquistas
    verificarTodas() {
        let novas = false;
        this.lista.forEach(conquista => {
            if (!this.desbloqueadas.includes(conquista.id) && conquista.verificar()) {
                this.desbloqueadas.push(conquista.id);
                novas = true;
                this.mostrarNotificacao(conquista);
            }
        });
        
        if (novas) {
            this.salvar();
        }
    },
    
    // Mostrar notificação de conquista
    mostrarNotificacao(conquista) {
        const notif = document.createElement('div');
        notif.className = 'achievement-notification';
        notif.innerHTML = `
            <div class="achievement-notif-icon">${conquista.icone}</div>
            <div class="achievement-notif-info">
                <div class="achievement-notif-title">🏆 CONQUISTA DESBLOQUEADA!</div>
                <div class="achievement-notif-name">${conquista.titulo}</div>
                <div class="achievement-notif-desc">${conquista.descricao}</div>
            </div>
        `;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #ffd700;
            border-radius: 12px;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 3000;
            animation: slideIn 0.3s ease, fadeOut 0.5s ease 3s forwards;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            min-width: 250px;
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            if (notif && notif.parentNode) notif.remove();
        }, 3500);
    },
    
    // Renderizar grid de conquistas
    renderizar() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        grid.innerHTML = '<div class="achievements-grid"></div>';
        const gridContainer = grid.querySelector('.achievements-grid');
        
        this.lista.forEach(conquista => {
            const desbloqueada = this.desbloqueadas.includes(conquista.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${!desbloqueada ? 'locked' : ''}`;
            card.innerHTML = `
                <div class="achievement-icon">${conquista.icone}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${conquista.titulo}</div>
                    <div class="achievement-desc">${conquista.descricao}</div>
                </div>
                <div class="achievement-status">${desbloqueada ? '✅' : '🔒'}</div>
            `;
            gridContainer.appendChild(card);
        });
    },
    
    // Salvar conquistas
    salvar() {
        localStorage.setItem('achievements_unlocked', JSON.stringify(this.desbloqueadas));
    },
    
    // Resetar conquistas (opcional)
    resetar() {
        this.desbloqueadas = [];
        this.salvar();
        this.renderizar();
    }
};

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            visibility: hidden;
        }
    }
    
    .achievement-notification {
        animation: slideIn 0.3s ease, fadeOut 0.5s ease 3s forwards;
    }
    
    .achievement-notif-icon {
        font-size: 32px;
    }
    
    .achievement-notif-title {
        font-size: 12px;
        color: #ffd700;
        font-weight: bold;
    }
    
    .achievement-notif-name {
        font-size: 14px;
        color: #fff;
        font-weight: bold;
    }
    
    .achievement-notif-desc {
        font-size: 11px;
        color: #aaa;
        margin-top: 4px;
    }
`;
document.head.appendChild(style);