// ==================== INTERFACE E EVENTOS ====================

let menuAberto = false;

function refreshUI() {
    console.log("Atualizando UI...");
    
    const aminoacidosValue = document.getElementById('aminoacidosValue');
    const nucleotideosValue = document.getElementById('nucleotideosValue');
    const lipidiosValue = document.getElementById('lipidiosValue');
    const moleculasValue = document.getElementById('moleculasValue');
    const rnaValue = document.getElementById('rnaValue');
    const membranaValue = document.getElementById('membranaValue');
    const dnaValue = document.getElementById('dnaValue');
    const metabolismoValue = document.getElementById('metabolismoValue');
    const primeiraCelulaValue = document.getElementById('primeiraCelulaValue');
    
    if (aminoacidosValue) aminoacidosValue.innerText = GameData.aminoacidos;
    if (nucleotideosValue) nucleotideosValue.innerText = GameData.nucleotideos;
    if (lipidiosValue) lipidiosValue.innerText = GameData.lipidios;
    if (moleculasValue) moleculasValue.innerText = GameData.moleculas;
    if (rnaValue) rnaValue.innerText = GameData.rna;
    if (membranaValue) membranaValue.innerText = GameData.membrana;
    if (dnaValue) dnaValue.innerText = GameData.dna;
    if (metabolismoValue) metabolismoValue.innerText = GameData.metabolismo;
    if (primeiraCelulaValue) primeiraCelulaValue.innerText = GameData.primeiraCelula;
    
    const limiteAtual = GameLogic.getLimiteAtual();
    const aminoacidosMax = document.getElementById('aminoacidosMax');
    const nucleotideosMax = document.getElementById('nucleotideosMax');
    const lipidiosMax = document.getElementById('lipidiosMax');
    const dnaMax = document.getElementById('dnaMax');
    const metabolismoMax = document.getElementById('metabolismoMax');
    
    if (aminoacidosMax) aminoacidosMax.innerText = limiteAtual;
    if (nucleotideosMax) nucleotideosMax.innerText = limiteAtual;
    if (lipidiosMax) lipidiosMax.innerText = limiteAtual;
    if (dnaMax) dnaMax.innerText = GameData.maxDNA;
    if (metabolismoMax) metabolismoMax.innerText = GameData.maxMetabolismo;
    
    // Verifica visibilidade das linhas
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
        GameLogic.updateDNAMaxDisplay();
    }
    if (GameData.botaoMetabolismoVisivel) {
        const row = document.getElementById('rowMetabolismo');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('metabolismoButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
    }
    if (GameData.botaoPrimeiraCelulaVisivel && !GameData.primeiraFaseConcluida) {
        const row = document.getElementById('rowPrimeiraCelula');
        if (row && row.style.display !== 'grid') row.style.display = 'grid';
        const btnRow = document.getElementById('primeiraCelulaButtonRow');
        if (btnRow && btnRow.style.display !== 'flex') btnRow.style.display = 'flex';
        const btn = document.getElementById('btnFormarPrimeiraCelula');
        if (btn && GameData.metabolismo >= 1000) btn.disabled = false;
    }
    
    GameLogic.updateBotoesEstado();
}

function mostrarMensagem(mensagem, duracao = 2000) {
    let msgDiv = document.getElementById('floatingMessage');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'floatingMessage';
        document.body.appendChild(msgDiv);
    }
    msgDiv.innerHTML = mensagem;
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
    setTimeout(() => { if (msgDiv) msgDiv.style.display = 'none'; }, duracao + 500);
}

// ==================== EVENTOS DOS BOTÕES ====================

function bindEvents() {
    const btnAminoacidos = document.getElementById('btnAminoacidos');
    const btnNucleotideos = document.getElementById('btnNucleotideos');
    const btnLipidios = document.getElementById('btnLipidios');
    const btnGerarMoleculas = document.getElementById('btnGerarMoleculas');
    const btnComprarRNA = document.getElementById('btnComprarRNA');
    const btnComprarMembrana = document.getElementById('btnComprarMembrana');
    const btnComprarDNA = document.getElementById('btnComprarDNA');
    const btnComprarMetabolismo = document.getElementById('btnComprarMetabolismo');
    const btnFormarPrimeiraCelula = document.getElementById('btnFormarPrimeiraCelula');
    
    if (btnAminoacidos) btnAminoacidos.addEventListener('click', () => { GameLogic.addAminoacidos(); refreshUI(); });
    if (btnNucleotideos) btnNucleotideos.addEventListener('click', () => { GameLogic.addNucleotideos(); refreshUI(); });
    if (btnLipidios) btnLipidios.addEventListener('click', () => { GameLogic.addLipidios(); refreshUI(); });
    if (btnGerarMoleculas) btnGerarMoleculas.addEventListener('click', () => { GameLogic.gerarMolecula(); refreshUI(); });
    if (btnComprarRNA) btnComprarRNA.addEventListener('click', () => { GameLogic.comprarRNA(); refreshUI(); });
    if (btnComprarMembrana) btnComprarMembrana.addEventListener('click', () => { GameLogic.comprarMembrana(); refreshUI(); });
    if (btnComprarDNA) btnComprarDNA.addEventListener('click', () => { GameLogic.comprarDNA(); refreshUI(); });
    if (btnComprarMetabolismo) btnComprarMetabolismo.addEventListener('click', () => { GameLogic.comprarMetabolismo(); refreshUI(); });
    if (btnFormarPrimeiraCelula) btnFormarPrimeiraCelula.addEventListener('click', () => { GameLogic.formarPrimeiraCelula(); refreshUI(); });
    
    const btnUpgradeCapacidade = document.getElementById('btnUpgradeCapacidade');
    const btnUpgradeAuto = document.getElementById('btnUpgradeAuto');
    const btnUpgradeAutoMolecula = document.getElementById('btnUpgradeAutoMolecula');
    const btnUpgradeExpansaoDNA = document.getElementById('btnUpgradeExpansaoDNA');
    const btnUpgradeAutoMembrana = document.getElementById('btnUpgradeAutoMembrana');
    const btnUpgradeClonagem = document.getElementById('btnUpgradeClonagem');
    
    if (btnUpgradeCapacidade) btnUpgradeCapacidade.addEventListener('click', () => { if (GameLogic.comprarUpgradeCapacidade()) refreshUI(); });
    if (btnUpgradeAuto) btnUpgradeAuto.addEventListener('click', () => { if (GameLogic.comprarUpgradeAuto()) refreshUI(); });
    if (btnUpgradeAutoMolecula) btnUpgradeAutoMolecula.addEventListener('click', () => { if (GameLogic.comprarUpgradeAutoMolecula()) refreshUI(); });
    if (btnUpgradeExpansaoDNA) btnUpgradeExpansaoDNA.addEventListener('click', () => { if (GameLogic.comprarUpgradeExpansaoDNA()) refreshUI(); });
    if (btnUpgradeAutoMembrana) btnUpgradeAutoMembrana.addEventListener('click', () => { if (GameLogic.comprarUpgradeAutoMembrana()) refreshUI(); });
    if (btnUpgradeClonagem) btnUpgradeClonagem.addEventListener('click', () => { if (GameLogic.comprarUpgradeClonagem()) refreshUI(); });
}

function limparInterfaceAposPrimeiraCelula() {
    // ==================== LIMPA APENAS O CONTEÚDO DA TABELA (MANTÉM CABEÇALHO) ====================
    const evolutionTable = document.querySelector('.evolution-table');
    if (evolutionTable) {
        const header = evolutionTable.querySelector('.table-header');
        const allRows = evolutionTable.querySelectorAll('.table-row');
        allRows.forEach(row => row.remove());
        
        if (header) evolutionTable.appendChild(header);
        
        const emptyRow = document.createElement('div');
        emptyRow.className = 'table-row';
        emptyRow.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr; text-align: center; padding: 30px;';
        emptyRow.innerHTML = '<span style="grid-column: span 3; color: #ffd700;">✨ Evolução concluída! Escolha seu caminho ✨</span>';
        evolutionTable.appendChild(emptyRow);
    }
    
    // ==================== LIMPA ÁREA DE CRIAÇÃO E ADICIONA 3 BOTÕES ====================
    const creationArea = document.querySelector('.creation-area');
    if (creationArea) {
        const h3 = creationArea.querySelector('h3');
        const allButtonsRows = creationArea.querySelectorAll('.buttons-row');
        allButtonsRows.forEach(row => row.remove());
        
        if (h3) creationArea.appendChild(h3);
        
        const evolucaoRow = document.createElement('div');
        evolucaoRow.className = 'buttons-row';
        evolucaoRow.style.cssText = 'display: flex; justify-content: center; gap: 20px; margin-top: 20px;';
        evolucaoRow.innerHTML = `
            <button class="creation-btn" id="btnEvoluirPlanta" style="min-width: 120px;">🌿 PLANTA</button>
            <button class="creation-btn" id="btnEvoluirFungo" style="min-width: 120px;">🍄 FUNGO</button>
            <button class="creation-btn" id="btnEvoluirAnimal" style="min-width: 120px;">🦁 ANIMAL</button>
        `;
        creationArea.appendChild(evolucaoRow);
        
        document.getElementById('btnEvoluirPlanta')?.addEventListener('click', () => iniciarEvolucao('planta'));
        document.getElementById('btnEvoluirFungo')?.addEventListener('click', () => iniciarEvolucao('fungo'));
        document.getElementById('btnEvoluirAnimal')?.addEventListener('click', () => iniciarEvolucao('animal'));
    }
    
    // ==================== ÁREA DE MELHORIAS: MANTÉM O TÍTULO, REMOVE OS CARDS ====================
    const upgradesArea = document.querySelector('.upgrades-area');
    if (upgradesArea) {
        // Mantém o título h3
        const h3 = upgradesArea.querySelector('h3');
        
        // Remove todos os upgrade-cards (os cards de melhoria)
        const allUpgradeCards = upgradesArea.querySelectorAll('.upgrade-card');
        allUpgradeCards.forEach(card => card.remove());
        
        // Garante que o título permaneça
        if (h3 && !upgradesArea.contains(h3)) {
            upgradesArea.innerHTML = '';
            upgradesArea.appendChild(h3);
        }
        
        // Adiciona uma mensagem informativa
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = 'text-align: center; padding: 20px; color: #888; font-style: italic;';
        msgDiv.innerHTML = '🔒 Melhorias desbloqueáveis na próxima fase';
        upgradesArea.appendChild(msgDiv);
        
        // Garante que a área continue visível
        upgradesArea.style.display = 'block';
    }
    
    // ==================== ESCONDE OS BOTÕES DE SÍNTESE ====================
    const moleculaButtonRow = document.getElementById('moleculaButtonRow');
    const rnaButtonRow = document.getElementById('rnaButtonRow');
    const membranaButtonRow = document.getElementById('membranaButtonRow');
    const dnaButtonRow = document.getElementById('dnaButtonRow');
    const metabolismoButtonRow = document.getElementById('metabolismoButtonRow');
    const primeiraCelulaButtonRow = document.getElementById('primeiraCelulaButtonRow');
    
    if (moleculaButtonRow) moleculaButtonRow.style.display = 'none';
    if (rnaButtonRow) rnaButtonRow.style.display = 'none';
    if (membranaButtonRow) membranaButtonRow.style.display = 'none';
    if (dnaButtonRow) dnaButtonRow.style.display = 'none';
    if (metabolismoButtonRow) metabolismoButtonRow.style.display = 'none';
    if (primeiraCelulaButtonRow) primeiraCelulaButtonRow.style.display = 'none';
    
    // ==================== REMOVE MENSAGENS ====================
    const victoryMsg = document.getElementById('victoryMessage');
    if (victoryMsg) victoryMsg.remove();
    
    console.log("Interface limpa. Botões de evolução adicionados.");
}

function iniciarEvolucao(tipo) {
    console.log(`Evoluindo para: ${tipo}`);
    GameData.evolucaoEscolhida = tipo;
    mostrarMensagem(`🌱 Evoluindo para ${tipo.toUpperCase()}...`, 2000);
    const event = new CustomEvent('evolucaoEscolhida', { detail: { tipo: tipo } });
    window.dispatchEvent(event);
}

// ==================== MENU LATERAL ====================

function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuContent = document.getElementById('menuContent');
    const menuClose = document.getElementById('menuClose');
    
    function fecharMenu() {
        if (menuContent) menuContent.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('hidden');
        menuAberto = false;
    }
    
    function abrirMenu() {
        if (menuContent) menuContent.classList.add('open');
        if (menuToggle) menuToggle.classList.add('hidden');
        menuAberto = true;
    }
    
    if (menuToggle) menuToggle.addEventListener('click', (e) => { e.stopPropagation(); abrirMenu(); });
    if (menuClose) menuClose.addEventListener('click', () => fecharMenu());
    
    document.addEventListener('click', (e) => {
        if (menuAberto && menuContent && !menuContent.contains(e.target)) fecharMenu();
    });
    
    const menuAchievements = document.getElementById('menuAchievements');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    
    if (menuAchievements) menuAchievements.addEventListener('click', () => {
        fecharMenu();
        if (Achievements && Achievements.renderizar) Achievements.renderizar();
        if (popupOverlay) popupOverlay.classList.add('open');
    });
    if (popupClose) popupClose.addEventListener('click', () => popupOverlay?.classList.remove('open'));
    if (popupOverlay) popupOverlay.addEventListener('click', (e) => { if (e.target === popupOverlay) popupOverlay.classList.remove('open'); });
    
    const menuSave = document.getElementById('menuSave');
    const menuLoad = document.getElementById('menuLoad');
    if (menuSave) menuSave.addEventListener('click', () => { fecharMenu(); if (SaveSystem?.salvar) SaveSystem.salvar(); });
    if (menuLoad) menuLoad.addEventListener('click', () => { fecharMenu(); if (SaveSystem?.carregar) SaveSystem.carregar(); });
}

// ==================== VERIFICAÇÕES INICIAIS ====================

function verificarDesbloqueiosIniciais() {
    if (GameData.aminoacidos >= 10 && GameData.nucleotideos >= 10 && GameData.lipidios >= 10) GameData.botaoMoleculasVisivel = true;
    if (GameData.moleculas >= 20) GameData.botaoRNAVisivel = true;
    if (GameData.rna >= 10) GameData.botaoMembranaVisivel = true;
    if (GameData.membrana >= 4) GameData.botaoDNAVisivel = true;
    if (GameData.dna >= 100) GameData.botaoMetabolismoVisivel = true;
    if (GameData.metabolismo >= 1000) GameData.botaoPrimeiraCelulaVisivel = true;
}

// ==================== INICIALIZAÇÃO ====================

function init() {
    console.log("Inicializando jogo...");
    verificarDesbloqueiosIniciais();
    bindEvents();
    refreshUI();
    
    window.UIRefresh = refreshUI;
    window.mostrarMensagem = mostrarMensagem;
    window.limparInterfaceAposPrimeiraCelula = limparInterfaceAposPrimeiraCelula;
    
    if (typeof Achievements !== 'undefined' && Achievements.init) Achievements.init();
    
    if (GameLogic.startAutoGeneration) GameLogic.startAutoGeneration();
    if (GameLogic.startAutoMoleculaGeneration) GameLogic.startAutoMoleculaGeneration();
    if (GameLogic.startAutoMembranaGeneration) GameLogic.startAutoMembranaGeneration();
    
    initMenu();
    console.log("Jogo inicializado com sucesso!");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}