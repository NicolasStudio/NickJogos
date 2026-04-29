// ==================== LÓGICA DO JOGO ====================

const GameLogic = {
    // ==================== FUNÇÕES BÁSICAS DE ADIÇÃO ====================
    
    // Adicionar Aminoácidos
    addAminoacidos() {
        if (GameData.gameFinished) return false;
        const limite = this.getLimiteAtual();
        if (GameData.aminoacidos < limite) {
            GameData.aminoacidos++;
            this.checkBotaoMoleculas();
            return true;
        }
        return false;
    },
    
    // Adicionar Nucleotídeos
    addNucleotideos() {
        if (GameData.gameFinished) return false;
        const limite = this.getLimiteAtual();
        if (GameData.nucleotideos < limite) {
            GameData.nucleotideos++;
            this.checkBotaoMoleculas();
            return true;
        }
        return false;
    },
    
    // Adicionar Lipídios
    addLipidios() {
        if (GameData.gameFinished) return false;
        const limite = this.getLimiteAtual();
        if (GameData.lipidios < limite) {
            GameData.lipidios++;
            this.checkBotaoMoleculas();
            return true;
        }
        return false;
    },
    
    // ==================== GERAÇÃO AUTOMÁTICA ====================
    
    // Geração automática de recursos básicos (Aminoácidos, Nucleotídeos, Lipídios)
    gerarAutomatico() {
        if (GameData.gameFinished) return;
        const limite = this.getLimiteAtual();
        
        if (GameData.aminoacidos < limite) GameData.aminoacidos++;
        if (GameData.nucleotideos < limite) GameData.nucleotideos++;
        if (GameData.lipidios < limite) GameData.lipidios++;
        
        this.checkBotaoMoleculas();
        if (window.UIRefresh) window.UIRefresh();
    },
    
    // Geração automática de Moléculas orgânicas
    gerarMoleculaAutomatico() {
        if (GameData.gameFinished) return;
        if (GameData.moleculas < GameData.maxMoleculas) {
            GameData.moleculas++;
            this.checkBotaoRNA();
            if (window.UIRefresh) window.UIRefresh();
        }
    },
    
    // Geração automática de Membrana
    gerarMembranaAutomatico() {
        if (GameData.gameFinished) return;
        if (GameData.membrana < GameData.maxMembrana) {
            GameData.membrana++;
            if (window.UIRefresh) window.UIRefresh();
        }
    },
    
    // ==================== FUNÇÕES DE RETORNO DE LIMITES E UPGRADES ====================
    
    // Retorna o limite atual baseado no nível do upgrade de capacidade
    getLimiteAtual() {
        if (GameData.upgradeNivel === 0) return 15;
        return GameData.upgradeTabela[GameData.upgradeNivel - 1].novoLimite;
    },
    
    // Retorna o próximo upgrade de capacidade
    getProximoUpgradeCapacidade() {
        if (GameData.upgradeNivel >= GameData.upgradeTabela.length) return null;
        return GameData.upgradeTabela[GameData.upgradeNivel];
    },
    
    // Retorna o próximo upgrade de automação (básicos)
    getProximoUpgradeAuto() {
        if (GameData.autoNivel >= GameData.autoTabela.length) return null;
        return GameData.autoTabela[GameData.autoNivel];
    },
    
    // Retorna o próximo upgrade de automação de moléculas
    getProximoUpgradeAutoMolecula() {
        if (GameData.autoMoleculaNivel >= GameData.autoMoleculaTabela.length) return null;
        return GameData.autoMoleculaTabela[GameData.autoMoleculaNivel];
    },
    
    // Retorna o próximo upgrade de expansão de DNA
    getProximoUpgradeExpansaoDNA() {
        if (GameData.expansaoDNANivel >= GameData.expansaoDNATabela.length) return null;
        return GameData.expansaoDNATabela[GameData.expansaoDNANivel];
    },
    
    // Retorna o próximo upgrade de automação de membrana
    getProximoUpgradeAutoMembrana() {
        if (GameData.autoMembranaNivel >= GameData.autoMembranaTabela.length) return null;
        return GameData.autoMembranaTabela[GameData.autoMembranaNivel];
    },
    
    // Retorna o próximo upgrade de clonagem
    getProximoUpgradeClonagem() {
        if (GameData.clonagemNivel >= GameData.clonagemTabela.length) return null;
        return GameData.clonagemTabela[GameData.clonagemNivel];
    },
    
    // ==================== CHECAGEM DE DESBLOQUEIO DE BOTÕES ====================
    
    // Verifica desbloqueio do botão de moléculas
    checkBotaoMoleculas() {
        if (!GameData.botaoMoleculasVisivel && 
            GameData.aminoacidos >= 10 && 
            GameData.nucleotideos >= 10 && 
            GameData.lipidios >= 10) {
            
            GameData.botaoMoleculasVisivel = true;
            const btnRow = document.getElementById('moleculaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowMoleculas');
            if (row) row.style.display = 'grid';
        }
    },
    
    // Verifica desbloqueio do botão de RNA
    checkBotaoRNA() {
        if (!GameData.botaoRNAVisivel && GameData.moleculas >= 20) {
            GameData.botaoRNAVisivel = true;
            const btnRow = document.getElementById('rnaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowRNA');
            if (row) row.style.display = 'grid';
        }
    },
    
    // Verifica desbloqueio do botão de Membrana
    checkBotaoMembrana() {
        if (!GameData.botaoMembranaVisivel && GameData.rna >= 10) {
            GameData.botaoMembranaVisivel = true;
            const btnRow = document.getElementById('membranaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowMembrana');
            if (row) row.style.display = 'grid';
        }
    },
    
    // Verifica desbloqueio do botão de DNA
    checkBotaoDNA() {
        if (!GameData.botaoDNAVisivel && GameData.membrana >= 4) {
            GameData.botaoDNAVisivel = true;
            const btnRow = document.getElementById('dnaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowDNA');
            if (row) row.style.display = 'grid';
        }
    },
    
    // Verifica desbloqueio do botão de Metabolismo
    checkBotaoMetabolismo() {
        if (!GameData.botaoMetabolismoVisivel && GameData.dna >= 100) {
            GameData.botaoMetabolismoVisivel = true;
            const btnRow = document.getElementById('metabolismoButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowMetabolismo');
            if (row) row.style.display = 'grid';
        }
    },
    
    // ==================== VERIFICAÇÃO DE CLONAGEM ====================
    
    // Verifica chance de clonagem e gera DNA extra
    verificarClonagemDNA() {
        if (GameData.clonagemNivel > 0 && GameData.dna < GameData.maxDNA) {
            const nivelAtual = GameData.clonagemNivel - 1;
            const chance = GameData.clonagemTabela[nivelAtual].chance;
            const random = Math.random() * 100;
            
            if (random <= chance) {
                // Clonagem bem-sucedida!
                if (GameData.dna < GameData.maxDNA) {
                    GameData.dna++;
                    // Mostra mensagem de clonagem
                    if (window.mostrarMensagem) {
                        window.mostrarMensagem(`🧬 CLONAGEM! +1 DNA extra! (${chance}% de chance)`, 2000);
                    }
                }
            }
        }
    },
    
    // ==================== ATUALIZAÇÃO DE BOTÕES ====================
    
    // Atualiza todos os botões da interface
    updateBotoesEstado() {
        // Botão gerar molécula
        const btnMolecula = document.getElementById('btnGerarMoleculas');
        if (btnMolecula) {
            const podeGerar = (GameData.aminoacidos >= 10 && 
                               GameData.nucleotideos >= 10 && 
                               GameData.lipidios >= 10 &&
                               GameData.moleculas < GameData.maxMoleculas &&
                               !GameData.gameFinished);
            btnMolecula.disabled = !podeGerar;
        }
        
        // Botão comprar RNA
        const btnRNA = document.getElementById('btnComprarRNA');
        if (btnRNA) {
            const podeComprar = (GameData.moleculas >= 20 && 
                                 GameData.rna < GameData.maxRNA &&
                                 !GameData.gameFinished);
            btnRNA.disabled = !podeComprar;
        }
        
        // Botão comprar Membrana
        const btnMembrana = document.getElementById('btnComprarMembrana');
        if (btnMembrana) {
            const podeComprar = (GameData.rna >= 10 && 
                                 GameData.membrana < GameData.maxMembrana &&
                                 !GameData.gameFinished);
            btnMembrana.disabled = !podeComprar;
        }
        
        // Botão comprar DNA
        const btnDNA = document.getElementById('btnComprarDNA');
        if (btnDNA) {
            const podeComprar = (GameData.membrana >= 4 && 
                                 GameData.dna < GameData.maxDNA &&
                                 !GameData.gameFinished);
            btnDNA.disabled = !podeComprar;
        }
        
        // Botão comprar Metabolismo
        const btnMetabolismo = document.getElementById('btnComprarMetabolismo');
        if (btnMetabolismo) {
            const podeComprar = (GameData.dna >= 100 && 
                                 GameData.metabolismo < GameData.maxMetabolismo &&
                                 !GameData.gameFinished);
            btnMetabolismo.disabled = !podeComprar;
        }
        
        // Atualiza todos os upgrades
        this.updateUpgradeCapacidadeButton();
        this.updateUpgradeAutoButton();
        this.updateUpgradeAutoMoleculaButton();
        this.updateUpgradeExpansaoDNAButton();
        this.updateUpgradeAutoMembranaButton();
        this.updateUpgradeClonagemButton();
    },
    
    // ==================== UPGRADE: CAPACIDADE ====================
    
    updateUpgradeCapacidadeButton() {
        const btnUpgrade = document.getElementById('btnUpgradeCapacidade');
        const upgradeCard = document.getElementById('upgradeCapacidadeCard');
        const upgradeCostSpan = document.getElementById('upgradeCost');
        const upgradeTooltip = document.getElementById('upgradeTooltip');
        const upgradeDesc = document.getElementById('upgradeDesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeCapacidade();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custo = proximoUpgrade.custo;
        const novoLimite = proximoUpgrade.novoLimite;
        
        if (upgradeCostSpan) {
            upgradeCostSpan.innerHTML = `Custo: ${custo} 🧪 Moléculas`;
        }
        if (upgradeTooltip) {
            upgradeTooltip.innerHTML = `🔴 Custo: ${custo} moléculas orgânicas`;
        }
        if (upgradeDesc) {
            upgradeDesc.innerHTML = `Aumenta capacidade máxima para ${novoLimite} (Nível ${GameData.upgradeNivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.moleculas >= custo && !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeCapacidade() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeCapacidade();
        if (proximoUpgrade === null) return false;
        
        const custo = proximoUpgrade.custo;
        if (GameData.moleculas >= custo) {
            GameData.moleculas -= custo;
            GameData.upgradeNivel++;
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== UPGRADE: AUTOMAÇÃO METABÓLICA ====================
    
    updateUpgradeAutoButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAuto');
        const upgradeCard = document.getElementById('upgradeAutoCard');
        const autoCostSpan = document.getElementById('autoCost');
        const autoTooltip = document.getElementById('autoTooltip');
        const autoDesc = document.getElementById('autoDesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeAuto();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoGeneration();
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custo = proximoUpgrade.custo;
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        
        if (autoCostSpan) {
            autoCostSpan.innerHTML = `Custo: ${custo} 🧬 RNA`;
        }
        if (autoTooltip) {
            autoTooltip.innerHTML = `🔴 Custo: ${custo} RNA`;
        }
        if (autoDesc) {
            autoDesc.innerHTML = `Gera 1 de cada recurso a cada ${tempoStr} (Nível ${GameData.autoNivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.rna >= custo && !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeAuto() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAuto();
        if (proximoUpgrade === null) return false;
        
        const custo = proximoUpgrade.custo;
        if (GameData.rna >= custo) {
            GameData.rna -= custo;
            GameData.autoNivel++;
            this.restartAutoGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== UPGRADE: AUTOMAÇÃO MOLECULAR ====================
    
    updateUpgradeAutoMoleculaButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAutoMolecula');
        const upgradeCard = document.getElementById('upgradeAutoMoleculaCard');
        const autoMoleculaCostSpan = document.getElementById('autoMoleculaCost');
        const autoMoleculaTooltip = document.getElementById('autoMoleculaTooltip');
        const autoMoleculaDesc = document.getElementById('autoMoleculaDesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeAutoMolecula();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoMoleculaGeneration();
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custoAA = proximoUpgrade.custoAA;
        const custoNUC = proximoUpgrade.custoNUC;
        const custoLIP = proximoUpgrade.custoLIP;
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        
        if (autoMoleculaCostSpan) {
            autoMoleculaCostSpan.innerHTML = `Custo: ${custoAA} 🧪 + ${custoNUC} 🧬 + ${custoLIP} 🫧`;
        }
        if (autoMoleculaTooltip) {
            autoMoleculaTooltip.innerHTML = `🔴 Custo: ${custoAA} Aminoácidos, ${custoNUC} Nucleotídeos, ${custoLIP} Lipídios`;
        }
        if (autoMoleculaDesc) {
            autoMoleculaDesc.innerHTML = `Gera 1 Molécula orgânica a cada ${tempoStr} (Nível ${GameData.autoMoleculaNivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.aminoacidos >= custoAA && 
                             GameData.nucleotideos >= custoNUC && 
                             GameData.lipidios >= custoLIP && 
                             !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeAutoMolecula() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAutoMolecula();
        if (proximoUpgrade === null) return false;
        
        const custoAA = proximoUpgrade.custoAA;
        const custoNUC = proximoUpgrade.custoNUC;
        const custoLIP = proximoUpgrade.custoLIP;
        
        if (GameData.aminoacidos >= custoAA && 
            GameData.nucleotideos >= custoNUC && 
            GameData.lipidios >= custoLIP) {
            
            GameData.aminoacidos -= custoAA;
            GameData.nucleotideos -= custoNUC;
            GameData.lipidios -= custoLIP;
            GameData.autoMoleculaNivel++;
            this.restartAutoMoleculaGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== UPGRADE: EXPANSÃO DO DNA ====================
    
    updateUpgradeExpansaoDNAButton() {
        const btnUpgrade = document.getElementById('btnUpgradeExpansaoDNA');
        const upgradeCard = document.getElementById('upgradeExpansaoDNACard');
        const upgradeCostSpan = document.getElementById('expansaoDNACost');
        const upgradeTooltip = document.getElementById('expansaoDNATooltip');
        const upgradeDesc = document.getElementById('expansaoDNADesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeExpansaoDNA();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custo = proximoUpgrade.custo;
        const novoLimite = proximoUpgrade.novoLimite;
        
        if (upgradeCostSpan) {
            upgradeCostSpan.innerHTML = `Custo: ${custo} 🫧 Membrana`;
        }
        if (upgradeTooltip) {
            upgradeTooltip.innerHTML = `🔴 Custo: ${custo} Membrana (protocélula)`;
        }
        if (upgradeDesc) {
            upgradeDesc.innerHTML = `Aumenta limite máximo de DNA para ${novoLimite} (Nível ${GameData.expansaoDNANivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.membrana >= custo && !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeExpansaoDNA() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeExpansaoDNA();
        if (proximoUpgrade === null) return false;
        
        const custo = proximoUpgrade.custo;
        if (GameData.membrana >= custo) {
            GameData.membrana -= custo;
            GameData.expansaoDNANivel++;
            GameData.maxDNA = proximoUpgrade.novoLimite;
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== UPGRADE: AUTOMAÇÃO DE MEMBRANA ====================
    
    updateUpgradeAutoMembranaButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAutoMembrana');
        const upgradeCard = document.getElementById('upgradeAutoMembranaCard');
        const autoMembranaCostSpan = document.getElementById('autoMembranaCost');
        const autoMembranaTooltip = document.getElementById('autoMembranaTooltip');
        const autoMembranaDesc = document.getElementById('autoMembranaDesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeAutoMembrana();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoMembranaGeneration();
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custoMoleculas = proximoUpgrade.custoMoleculas;
        const custoRNA = proximoUpgrade.custoRNA;
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        
        if (autoMembranaCostSpan) {
            autoMembranaCostSpan.innerHTML = `Custo: ${custoMoleculas} 🧪 + ${custoRNA} 🧬 RNA`;
        }
        if (autoMembranaTooltip) {
            autoMembranaTooltip.innerHTML = `🔴 Custo: ${custoMoleculas} Moléculas, ${custoRNA} RNA`;
        }
        if (autoMembranaDesc) {
            autoMembranaDesc.innerHTML = `Gera 1 Membrana a cada ${tempoStr} (Nível ${GameData.autoMembranaNivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.moleculas >= custoMoleculas && 
                             GameData.rna >= custoRNA && 
                             !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeAutoMembrana() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAutoMembrana();
        if (proximoUpgrade === null) return false;
        
        const custoMoleculas = proximoUpgrade.custoMoleculas;
        const custoRNA = proximoUpgrade.custoRNA;
        
        if (GameData.moleculas >= custoMoleculas && GameData.rna >= custoRNA) {
            GameData.moleculas -= custoMoleculas;
            GameData.rna -= custoRNA;
            GameData.autoMembranaNivel++;
            this.restartAutoMembranaGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== UPGRADE: DNA GÊMEO (CLONAGEM) ====================
    
    updateUpgradeClonagemButton() {
        const btnUpgrade = document.getElementById('btnUpgradeClonagem');
        const upgradeCard = document.getElementById('upgradeClonagemCard');
        const clonagemCostSpan = document.getElementById('clonagemCost');
        const clonagemTooltip = document.getElementById('clonagemTooltip');
        const clonagemDesc = document.getElementById('clonagemDesc');
        
        if (!btnUpgrade) return;
        
        const proximoUpgrade = this.getProximoUpgradeClonagem();
        
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        
        if (upgradeCard) upgradeCard.style.display = 'block';
        
        const custo = proximoUpgrade.custo;
        const chance = proximoUpgrade.chance;
        
        if (clonagemCostSpan) {
            clonagemCostSpan.innerHTML = `Custo: ${custo} 🧬 DNA`;
        }
        if (clonagemTooltip) {
            clonagemTooltip.innerHTML = `🔴 Custo: ${custo} DNA`;
        }
        if (clonagemDesc) {
            clonagemDesc.innerHTML = `Chance de clonagem: ${chance}% ao sintetizar DNA (Nível ${GameData.clonagemNivel + 1}/6)`;
        }
        
        const podeComprar = (GameData.dna >= custo && !GameData.gameFinished);
        btnUpgrade.disabled = !podeComprar;
    },
    
    comprarUpgradeClonagem() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeClonagem();
        if (proximoUpgrade === null) return false;
        
        const custo = proximoUpgrade.custo;
        if (GameData.dna >= custo) {
            GameData.dna -= custo;
            GameData.clonagemNivel++;
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== AÇÕES PRINCIPAIS ====================
    
    // Gerar molécula orgânica
    gerarMolecula() {
        if (GameData.gameFinished) return false;
        if (GameData.aminoacidos >= 10 && 
            GameData.nucleotideos >= 10 && 
            GameData.lipidios >= 10 &&
            GameData.moleculas < GameData.maxMoleculas) {
            
            GameData.aminoacidos -= 10;
            GameData.nucleotideos -= 10;
            GameData.lipidios -= 10;
            GameData.moleculas++;
            
            this.checkBotaoRNA();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // Comprar RNA
    comprarRNA() {
        if (GameData.gameFinished) return false;
        if (GameData.moleculas >= 20 && GameData.rna < GameData.maxRNA) {
            GameData.moleculas -= 20;
            GameData.rna++;
            this.checkBotaoMembrana();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // Comprar Membrana
    comprarMembrana() {
        if (GameData.gameFinished) return false;
        if (GameData.rna >= 10 && GameData.membrana < GameData.maxMembrana) {
            GameData.rna -= 10;
            GameData.membrana++;
            this.checkBotaoDNA();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // Comprar DNA (COM CHANCE DE CLONAGEM)
    comprarDNA() {
        if (GameData.gameFinished) return false;
        if (GameData.membrana >= 4 && GameData.dna < GameData.maxDNA) {
            GameData.membrana -= 4;
            GameData.dna++;
            
            // VERIFICA CHANCE DE CLONAGEM
            this.verificarClonagemDNA();
            
            this.checkBotaoMetabolismo();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // Comprar Metabolismo (VITÓRIA)
    comprarMetabolismo() {
        if (GameData.gameFinished) return false;
        if (GameData.dna >= 100 && GameData.metabolismo < GameData.maxMetabolismo) {
            GameData.dna -= 100;
            GameData.metabolismo = 1;
            GameData.gameFinished = true;
            this.stopAutoGeneration();
            this.stopAutoMoleculaGeneration();
            this.stopAutoMembranaGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    // ==================== GERENCIAMENTO DE INTERVALOS ====================
    
    // Gerenciamento da Automação Metabólica (básicos)
    startAutoGeneration() {
        this.stopAutoGeneration();
        if (GameData.autoNivel === 0 || GameData.gameFinished) return;
        
        const nivelAtual = GameData.autoNivel - 1;
        const intervalo = GameData.autoTabela[nivelAtual].intervalo;
        const intervalMs = intervalo * 1000;
        
        GameData.autoInterval = setInterval(() => {
            this.gerarAutomatico();
        }, intervalMs);
    },
    
    restartAutoGeneration() {
        this.startAutoGeneration();
    },
    
    stopAutoGeneration() {
        if (GameData.autoInterval) {
            clearInterval(GameData.autoInterval);
            GameData.autoInterval = null;
        }
    },
    
    // Gerenciamento da Automação Molecular (moléculas)
    startAutoMoleculaGeneration() {
        this.stopAutoMoleculaGeneration();
        if (GameData.autoMoleculaNivel === 0 || GameData.gameFinished) return;
        
        const nivelAtual = GameData.autoMoleculaNivel - 1;
        const intervalo = GameData.autoMoleculaTabela[nivelAtual].intervalo;
        const intervalMs = intervalo * 1000;
        
        GameData.autoMoleculaInterval = setInterval(() => {
            this.gerarMoleculaAutomatico();
        }, intervalMs);
    },
    
    restartAutoMoleculaGeneration() {
        this.startAutoMoleculaGeneration();
    },
    
    stopAutoMoleculaGeneration() {
        if (GameData.autoMoleculaInterval) {
            clearInterval(GameData.autoMoleculaInterval);
            GameData.autoMoleculaInterval = null;
        }
    },
    
    // Gerenciamento da Automação de Membrana
    startAutoMembranaGeneration() {
        this.stopAutoMembranaGeneration();
        if (GameData.autoMembranaNivel === 0 || GameData.gameFinished) return;
        
        const nivelAtual = GameData.autoMembranaNivel - 1;
        const intervalo = GameData.autoMembranaTabela[nivelAtual].intervalo;
        const intervalMs = intervalo * 1000;
        
        GameData.autoMembranaInterval = setInterval(() => {
            this.gerarMembranaAutomatico();
        }, intervalMs);
    },
    
    restartAutoMembranaGeneration() {
        this.startAutoMembranaGeneration();
    },
    
    stopAutoMembranaGeneration() {
        if (GameData.autoMembranaInterval) {
            clearInterval(GameData.autoMembranaInterval);
            GameData.autoMembranaInterval = null;
        }
    }
};