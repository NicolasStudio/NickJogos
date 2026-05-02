// ==================== SISTEMA SOBRE / TUTORIAL ====================

const Sobre = {
    // Versão do jogo
    versao: "2.0.0",
    
    // Informações do desenvolvedor
    desenvolvedor: {
        nome: "Nicolas de Almeida Sousa",
        projeto: "Projeto acadêmico sem fins lucrativos",
        ano: 2026
    },
    
    // Conteúdo do tutorial (será exibido em abas)
    tutorial: {
        introducao: {
            titulo: "🧬 O que é Evolução Celular?",
            conteudo: `
                <p><strong>Evolução Celular</strong> é um jogo incremental onde você simula a origem da vida desde moléculas simples até o desenvolvimento do metabolismo da primeira célula.</p>
                <p>Comece clicando em <strong>Aminoácidos</strong>, <strong>Nucleotídeos</strong> e <strong>Lipídios</strong> - os blocos fundamentais da vida. Combine-os para formar moléculas orgânicas, evolua para RNA, forme membranas, sintetize DNA e finalmente desenvolva o <strong>Metabolismo</strong>!</p>
            `
        },
        
        estagios: {
            titulo: "📊 Estágios Evolutivos",
            conteudo: `
                <div class="sobre-estagio">🧪 <strong>1. Moléculas orgânicas</strong><br>Combine 10 Aminoácidos, 10 Nucleotídeos e 10 Lipídios</div>
                <div class="sobre-estagio">🧬 <strong>2. RNA</strong><br>Gaste 20 moléculas orgânicas para sintetizar 1 RNA</div>
                <div class="sobre-estagio">🫧 <strong>3. Membrana (Protocélula)</strong><br>Gaste 10 RNA para formar 1 Membrana</div>
                <div class="sobre-estagio">🧬 <strong>4. DNA</strong><br>Gaste 4 Membranas para sintetizar 1 DNA</div>
                <div class="sobre-estagio">⚡ <strong>5. Metabolismo</strong><br>Gaste 100 DNA para desenvolver Metabolismo</div>
                <div class="sobre-estagio">🔬 <strong>6. Primeira Célula</strong><br>Gaste 1000 Metabolismo para formar a primeira célula!</div>
            `
        },
        
        upgrades: {
            titulo: "📈 Upgrades Disponíveis",
            conteudo: `
                <div class="sobre-upgrade">📦 <strong>Expansão do Protoplasma</strong><br>Aumenta a capacidade máxima dos recursos básicos (Aminoácidos, Nucleotídeos, Lipídios)</div>
                <div class="sobre-upgrade">⚡ <strong>Automação Metabólica</strong><br>Gera automaticamente 1 de cada recurso básico em intervalos regulares</div>
                <div class="sobre-upgrade">🔬 <strong>Automação Molecular</strong><br>Gera automaticamente Moléculas orgânicas</div>
                <div class="sobre-upgrade">🧬 <strong>Expansão do DNA</strong><br>Aumenta o limite máximo de DNA (até 100)</div>
                <div class="sobre-upgrade">🫧 <strong>Automação de Membrana</strong><br>Gera automaticamente Membranas (protocélulas)</div>
                <div class="sobre-upgrade">🐑 <strong>DNA Gêmeo (Clonagem)</strong><br>Chance de ganhar DNA extra ao sintetizar (até 20%)</div>
            `
        },
        
        dicas: {
            titulo: "💡 Dicas e Estratégias",
            conteudo: `
                <ul>
                    <li>🔰 <strong>Comece devagar</strong> - Clique nos 3 botões básicos até acumular recursos</li>
                    <li>⚡ <strong>Invista em automação</strong> - Os upgrades automáticos aceleram muito o progresso</li>
                    <li>📦 <strong>Expansão primeiro</strong> - Aumentar a capacidade máxima permite acumular mais recursos</li>
                    <li>🐑 <strong>Clonagem é poderosa</strong> - O upgrade DNA Gêmeo dobra sua produção de DNA</li>
                    <li>💾 <strong>Salve seu progresso</strong> - Use o menu para salvar o jogo em arquivo .txt</li>
                    <li>🏆 <strong>Conquistas</strong> - Desbloqueie todas as 10 conquistas!</li>
                </ul>
            `
        },
        
        conquistas: {
            titulo: "🏆 Lista de Conquistas",
            conteudo: `
                <div class="sobre-conquista">🧬 <strong>Primeiro DNA</strong> - Sintetizar o primeiro DNA</div>
                <div class="sobre-conquista">🔬 <strong>Primeira Molécula</strong> - Gerar a primeira molécula orgânica</div>
                <div class="sobre-conquista">⚡ <strong>Metabolismo</strong> - Desenvolver o metabolismo</div>
                <div class="sobre-conquista">📦 <strong>Mestre da Expansão</strong> - Nível máximo de Expansão do Protoplasma</div>
                <div class="sobre-conquista">⚙️ <strong>Automação Total</strong> - Nível máximo em todas as automações</div>
                <div class="sobre-conquista">🧬 <strong>DNA Gêmeo</strong> - Ativar o upgrade de clonagem</div>
                <div class="sobre-conquista">💎 <strong>Colecionador</strong> - Acumular 100 DNA</div>
                <div class="sobre-conquista">🚀 <strong>Expansão Máxima</strong> - Expandir o limite de DNA para 100</div>
                <div class="sobre-conquista">🔬 <strong>Primeira Célula</strong> - Formar a primeira célula</div>
                <div class="sobre-conquista">🐑 <strong>Dolly</strong> - 20% de chance de clonagem (Nível máximo)</div>
            `
        },
        
        creditos: {
            titulo: "👨‍💻 Créditos",
            conteudo: function() {
                return `
                    <p><strong>Desenvolvedor:</strong> Nicolas de Almeida Sousa</p>
                    <p><strong>Projeto:</strong> Acadêmico sem fins lucrativos</p>
                    <p><strong>Ano:</strong> 2026</p>
                    <p><strong>Versão:</strong> ${Sobre.versao}</p>
                    <hr>
                    <p><em>"A vida não é um mistério a ser resolvido, mas uma realidade a ser experimentada." - Alan Watts</em></p>
                `;
            }
        }
    },
    
    // Criar estrutura do pop-up (chamado na inicialização)
    criarPopup() {
        // Verificar se já existe
        if (document.getElementById('popupSobreOverlay')) return;
        
        const popupHTML = `
            <div class="popup-overlay" id="popupSobreOverlay">
                <div class="popup-container sobre-container">
                    <div class="popup-header">
                        <h2>ℹ️ SOBRE / TUTORIAL</h2>
                        <button class="popup-close" id="popupSobreClose">✕</button>
                    </div>
                    <div class="sobre-tabs">
                        <button class="sobre-tab-btn active" data-tab="introducao">📖 Introdução</button>
                        <button class="sobre-tab-btn" data-tab="estagios">📊 Estágios</button>
                        <button class="sobre-tab-btn" data-tab="upgrades">📈 Upgrades</button>
                        <button class="sobre-tab-btn" data-tab="dicas">💡 Dicas</button>
                        <button class="sobre-tab-btn" data-tab="conquistas">🏆 Conquistas</button>
                        <button class="sobre-tab-btn" data-tab="creditos">👨‍💻 Créditos</button>
                    </div>
                    <div class="popup-content sobre-content" id="sobreContent">
                        <!-- Conteúdo dinâmico -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Adicionar estilos CSS
        this.adicionarEstilos();
        
        // Configurar eventos
        const overlay = document.getElementById('popupSobreOverlay');
        const closeBtn = document.getElementById('popupSobreClose');
        const tabBtns = document.querySelectorAll('.sobre-tab-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('open');
            });
        }
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                this.mostrarTab(tabId);
            });
        });
        
        // Mostrar aba inicial
        this.mostrarTab('introducao');
    },
    
    // Renderizar pop-up sobre (apenas abre)
    renderizar() {
        const overlay = document.getElementById('popupSobreOverlay');
        if (overlay) {
            overlay.classList.add('open');
        }
    },
    
    // Mostrar aba específica
    mostrarTab(tabId) {
        const content = document.getElementById('sobreContent');
        if (!content) return;
        
        const tab = this.tutorial[tabId];
        if (tab) {
            let conteudoHtml = typeof tab.conteudo === 'function' ? tab.conteudo() : tab.conteudo;
            
            content.innerHTML = `
                <h3 class="sobre-tab-titulo">${tab.titulo}</h3>
                <div class="sobre-tab-conteudo">${conteudoHtml}</div>
            `;
        }
    },
    
    // Adicionar estilos CSS específicos (SEM VERDE NO HOVER)
    adicionarEstilos() {
        if (document.getElementById('sobre-estilos')) return;
        
        const style = document.createElement('style');
        style.id = 'sobre-estilos';
        style.textContent = `
            /* Abas */
            .sobre-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 15px 20px 0 20px;
                background: rgba(0, 20, 40, 0.95);
                border-bottom: 1px solid #0088ff;
            }
            
            .sobre-tab-btn {
                background: rgba(0, 30, 50, 0.8);
                border: 1px solid #0088ff;
                color: #00ccff;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-family: monospace;
                font-weight: bold;
                transition: all 0.2s;
            }
            
            .sobre-tab-btn:hover {
                background: #0088ff;
                color: #fff;
                transform: translateY(-2px);
            }
            
            .sobre-tab-btn.active {
                background: #00ccff;
                color: #000;
                border-color: #00ccff;
                box-shadow: 0 0 10px rgba(0, 136, 255, 0.5);
            }
            
            /* Conteúdo */
            .sobre-content {
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .sobre-tab-titulo {
                color: #ffd700;
                font-size: 1.3rem;
                margin-bottom: 15px;
                border-left: 4px solid #0088ff;
                padding-left: 12px;
            }
            
            .sobre-tab-conteudo {
                color: #ccc;
                line-height: 1.6;
            }
            
            .sobre-tab-conteudo p {
                margin-bottom: 12px;
            }
            
            .sobre-tab-conteudo ul {
                margin: 10px 0;
                padding-left: 25px;
            }
            
            .sobre-tab-conteudo li {
                margin: 8px 0;
            }
            
            /* Estágios, upgrades e conquistas */
            .sobre-estagio, .sobre-upgrade, .sobre-conquista {
                background: rgba(0, 30, 50, 0.6);
                border-left: 3px solid #0088ff;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 8px;
            }
            
            .sobre-estagio strong, .sobre-upgrade strong, .sobre-conquista strong {
                color: #00ccff;
            }
            
            hr {
                border-color: #0088ff;
                margin: 15px 0;
            }
            
            /* Scrollbar personalizada */
            .sobre-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .sobre-content::-webkit-scrollbar-track {
                background: rgba(0, 20, 40, 0.8);
                border-radius: 4px;
            }
            
            .sobre-content::-webkit-scrollbar-thumb {
                background: #0088ff;
                border-radius: 4px;
            }
            
            .sobre-content::-webkit-scrollbar-thumb:hover {
                background: #00ccff;
            }
            
            /* Container maior para o sobre */
            .sobre-container {
                width: 600px;
                max-width: 90vw;
            }
            
            /* Responsividade */
            @media (max-width: 768px) {
                .sobre-tabs {
                    justify-content: center;
                }
                .sobre-tab-btn {
                    padding: 6px 12px;
                    font-size: 12px;
                }
                .sobre-content {
                    max-height: 400px;
                }
            }
        `;
        
        document.head.appendChild(style);
    },
    
    // Inicializar (criar pop-up antecipadamente)
    init() {
        this.criarPopup();
    }
};

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Criar pop-up antecipadamente (resolve problema do clique duplo)
    Sobre.init();
    
    // Configurar evento do botão
    const menuSobre = document.getElementById('menusobre');
    if (menuSobre) {
        menuSobre.addEventListener('click', () => {
            Sobre.renderizar();
        });
    }
});