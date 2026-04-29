// ==================== INTERFACE E EVENTOS ====================

// Variável para controlar se o menu está aberto
let menuAberto = false;

function refreshUI() {
    // Atualiza valores na tabela
    document.getElementById('aminoacidosValue').innerText = GameData.aminoacidos;
    document.getElementById('nucleotideosValue').innerText = GameData.nucleotideos;
    document.getElementById('lipidiosValue').innerText = GameData.lipidios;
    document.getElementById('moleculasValue').innerText = GameData.moleculas;
    document.getElementById('rnaValue').innerText = GameData.rna;
    document.getElementById('membranaValue').innerText = GameData.membrana;
    document.getElementById('dnaValue').innerText = GameData.dna;
    document.getElementById('metabolismoValue').innerText = GameData.metabolismo;
    
    // Atualiza os limites máximos na tabela
    const limiteAtual = GameLogic.getLimiteAtual();
    document.getElementById('aminoacidosMax').innerText = limiteAtual;
    document.getElementById('nucleotideosMax').innerText = limiteAtual;
    document.getElementById('lipidiosMax').innerText = limiteAtual;
    
    // Garante visibilidade das linhas desbloqueadas
    if (GameData.botaoMoleculasVisivel) {
        const row = document.getElementById('rowMoleculas');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('moleculaButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    
    if (GameData.botaoRNAVisivel) {
        const row = document.getElementById('rowRNA');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('rnaButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    
    if (GameData.botaoMembranaVisivel) {
        const row = document.getElementById('rowMembrana');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('membranaButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    
    if (GameData.botaoDNAVisivel) {
        const row = document.getElementById('rowDNA');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('dnaButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    
    if (GameData.botaoMetabolismoVisivel) {
        const row = document.getElementById('rowMetabolismo');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('metabolismoButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    
    // Mensagem de vitória
    let victoryMsg = document.getElementById('victoryMessage');
    if (GameData.gameFinished) {
        if (!victoryMsg) {
            const msg = document.createElement('div');
            msg.id = 'victoryMessage';
            msg.className = 'victory-message';
            msg.innerHTML = '🎉 VIDA SURGIU! METABOLISMO DESENVOLVIDO! 🎉';
            document.querySelector('.game-container').appendChild(msg);
        } else {
            victoryMsg.style.display = 'block';
        }
    } else if (victoryMsg) {
        victoryMsg.style.display = 'none';
    }
    
    // Atualiza estado dos botões
    GameLogic.updateBotoesEstado();
}

// Função para mostrar mensagens temporárias
function mostrarMensagem(mensagem, duracao = 2000) {
    let msgDiv = document.getElementById('floatingMessage');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'floatingMessage';
        document.body.appendChild(msgDiv);
    }
    msgDiv.innerHTML = mensagem;
    msgDiv.style.display = 'block';
    msgDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        border: 2px solid #00ff00;
        color: #00ff00;
        padding: 10px 20px;
        border-radius: 10px;
        font-family: monospace;
        font-weight: bold;
        z-index: 3000;
        animation: fadeOut 0.5s ease-out forwards;
        animation-delay: ${duracao / 1000}s;
    `;
    
    setTimeout(() => {
        if (msgDiv) msgDiv.style.display = 'none';
    }, duracao + 500);
}

// Registrar eventos principais
function bindEvents() {
    // Botões básicos
    const btnAminoacidos = document.getElementById('btnAminoacidos');
    const btnNucleotideos = document.getElementById('btnNucleotideos');
    const btnLipidios = document.getElementById('btnLipidios');
    const btnGerarMoleculas = document.getElementById('btnGerarMoleculas');
    const btnComprarRNA = document.getElementById('btnComprarRNA');
    const btnComprarMembrana = document.getElementById('btnComprarMembrana');
    const btnComprarDNA = document.getElementById('btnComprarDNA');
    const btnComprarMetabolismo = document.getElementById('btnComprarMetabolismo');
    
    if (btnAminoacidos) {
        btnAminoacidos.addEventListener('click', () => {
            GameLogic.addAminoacidos();
            refreshUI();
        });
    }
    
    if (btnNucleotideos) {
        btnNucleotideos.addEventListener('click', () => {
            GameLogic.addNucleotideos();
            refreshUI();
        });
    }
    
    if (btnLipidios) {
        btnLipidios.addEventListener('click', () => {
            GameLogic.addLipidios();
            refreshUI();
        });
    }
    
    if (btnGerarMoleculas) {
        btnGerarMoleculas.addEventListener('click', () => {
            GameLogic.gerarMolecula();
            refreshUI();
        });
    }
    
    if (btnComprarRNA) {
        btnComprarRNA.addEventListener('click', () => {
            GameLogic.comprarRNA();
            refreshUI();
        });
    }
    
    if (btnComprarMembrana) {
        btnComprarMembrana.addEventListener('click', () => {
            GameLogic.comprarMembrana();
            refreshUI();
        });
    }
    
    if (btnComprarDNA) {
        btnComprarDNA.addEventListener('click', () => {
            GameLogic.comprarDNA();
            refreshUI();
        });
    }
    
    if (btnComprarMetabolismo) {
        btnComprarMetabolismo.addEventListener('click', () => {
            if (GameLogic.comprarMetabolismo()) {
                refreshUI();
                GameLogic.stopAutoGeneration();
                GameLogic.stopAutoMoleculaGeneration();
                GameLogic.stopAutoMembranaGeneration();
            }
        });
    }
    
    // Botões de upgrade
    const btnUpgradeCapacidade = document.getElementById('btnUpgradeCapacidade');
    const btnUpgradeAuto = document.getElementById('btnUpgradeAuto');
    const btnUpgradeAutoMolecula = document.getElementById('btnUpgradeAutoMolecula');
    const btnUpgradeExpansaoDNA = document.getElementById('btnUpgradeExpansaoDNA');
    const btnUpgradeAutoMembrana = document.getElementById('btnUpgradeAutoMembrana');
    const btnUpgradeClonagem = document.getElementById('btnUpgradeClonagem');
    
    if (btnUpgradeCapacidade) {
        btnUpgradeCapacidade.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeCapacidade()) refreshUI();
        });
    }
    
    if (btnUpgradeAuto) {
        btnUpgradeAuto.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeAuto()) refreshUI();
        });
    }
    
    if (btnUpgradeAutoMolecula) {
        btnUpgradeAutoMolecula.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeAutoMolecula()) refreshUI();
        });
    }
    
    if (btnUpgradeExpansaoDNA) {
        btnUpgradeExpansaoDNA.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeExpansaoDNA()) refreshUI();
        });
    }
    
    if (btnUpgradeAutoMembrana) {
        btnUpgradeAutoMembrana.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeAutoMembrana()) refreshUI();
        });
    }
    
    if (btnUpgradeClonagem) {
        btnUpgradeClonagem.addEventListener('click', () => {
            if (GameLogic.comprarUpgradeClonagem()) refreshUI();
        });
    }
}

// ==================== MENU LATERAL E POP-UPS ====================

function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuContent = document.getElementById('menuContent');
    const menuClose = document.getElementById('menuClose');
    
    // Função para fechar menu
    function fecharMenu() {
        menuContent.classList.remove('open');
        menuToggle.classList.remove('hidden');
        menuAberto = false;
    }
    
    // Função para abrir menu
    function abrirMenu() {
        menuContent.classList.add('open');
        menuToggle.classList.add('hidden');
        menuAberto = true;
    }
    
    // Abrir menu
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirMenu();
        });
    }
    
    // Fechar com botão X
    if (menuClose) {
        menuClose.addEventListener('click', () => {
            fecharMenu();
        });
    }
    
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (menuAberto && menuContent && !menuContent.contains(e.target)) {
            fecharMenu();
        }
    });
    
    // Botão Conquistas
    const menuAchievements = document.getElementById('menuAchievements');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    
    if (menuAchievements) {
        menuAchievements.addEventListener('click', () => {
            fecharMenu();
            if (Achievements && Achievements.renderizar) {
                Achievements.renderizar();
                Achievements.verificarTodas();
            }
            if (popupOverlay) popupOverlay.classList.add('open');
        });
    }
    
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            if (popupOverlay) popupOverlay.classList.remove('open');
        });
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                popupOverlay.classList.remove('open');
            }
        });
    }
    
    // Botão Salvar
    const menuSave = document.getElementById('menuSave');
    if (menuSave) {
        menuSave.addEventListener('click', () => {
            fecharMenu();
            if (SaveSystem && SaveSystem.salvar) SaveSystem.salvar();
        });
    }
    
    // Botão Carregar (agora lê arquivo .txt)
    const menuLoad = document.getElementById('menuLoad');
    if (menuLoad) {
        menuLoad.addEventListener('click', () => {
            fecharMenu();
            if (SaveSystem && SaveSystem.carregar) SaveSystem.carregar();
        });
    }
}

// ==================== INICIALIZAÇÃO ====================

function init() {
    console.log('Inicializando jogo...');
    bindEvents();
    refreshUI();
    
    // Expor funções globalmente
    window.UIRefresh = refreshUI;
    window.mostrarMensagem = mostrarMensagem;
    
    // Inicializar sistemas
    if (typeof Achievements !== 'undefined' && Achievements.init) {
        Achievements.init();
    }
    
    if (typeof SaveSystem !== 'undefined') {
        // SaveSystem não precisa de init, mas verificar se existe
    }
    
    // Iniciar automações
    if (GameLogic.startAutoGeneration) GameLogic.startAutoGeneration();
    if (GameLogic.startAutoMoleculaGeneration) GameLogic.startAutoMoleculaGeneration();
    if (GameLogic.startAutoMembranaGeneration) GameLogic.startAutoMembranaGeneration();
    
    // Inicializar menu
    initMenu();
    
    console.log('Jogo inicializado com sucesso!');
}

// Garantir que o DOM está carregado antes de iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}