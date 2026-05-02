// ==================== LÓGICA DO JOGO ====================
const GameLogic = {
    // ==================== FUNÇÕES BÁSICAS DE ADIÇÃO ====================
    
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
    
    gerarAutomatico() {
        if (GameData.gameFinished) return;
        const limite = this.getLimiteAtual();
        if (GameData.aminoacidos < limite) GameData.aminoacidos++;
        if (GameData.nucleotideos < limite) GameData.nucleotideos++;
        if (GameData.lipidios < limite) GameData.lipidios++;
        this.checkBotaoMoleculas();
        if (window.UIRefresh) window.UIRefresh();
    },
    
    gerarMoleculaAutomatico() {
        if (GameData.gameFinished) return;
        if (GameData.moleculas < GameData.maxMoleculas) {
            GameData.moleculas++;
            this.checkBotaoRNA();
            if (window.UIRefresh) window.UIRefresh();
        }
    },
    
    gerarMembranaAutomatico() {
        if (GameData.gameFinished) return;
        if (GameData.membrana < GameData.maxMembrana) {
            GameData.membrana++;
            this.checkBotaoDNA();
            if (window.UIRefresh) window.UIRefresh();
        }
    },
    
    // ==================== FUNÇÕES DE RETORNO ====================
    
    getLimiteAtual() {
        if (GameData.upgradeNivel === 0) return 15;
        return GameData.upgradeTabela[GameData.upgradeNivel - 1].novoLimite;
    },
    
    getProximoUpgradeCapacidade() {
        if (GameData.upgradeNivel >= GameData.upgradeTabela.length) return null;
        return GameData.upgradeTabela[GameData.upgradeNivel];
    },
    
    getProximoUpgradeAuto() {
        if (GameData.autoNivel >= GameData.autoTabela.length) return null;
        return GameData.autoTabela[GameData.autoNivel];
    },
    
    getProximoUpgradeAutoMolecula() {
        if (GameData.autoMoleculaNivel >= GameData.autoMoleculaTabela.length) return null;
        return GameData.autoMoleculaTabela[GameData.autoMoleculaNivel];
    },
    
    getProximoUpgradeExpansaoDNA() {
        if (GameData.expansaoDNANivel >= GameData.expansaoDNATabela.length) return null;
        return GameData.expansaoDNATabela[GameData.expansaoDNANivel];
    },
    
    getProximoUpgradeAutoMembrana() {
        if (GameData.autoMembranaNivel >= GameData.autoMembranaTabela.length) return null;
        return GameData.autoMembranaTabela[GameData.autoMembranaNivel];
    },
    
    getProximoUpgradeClonagem() {
        if (GameData.clonagemNivel >= GameData.clonagemTabela.length) return null;
        return GameData.clonagemTabela[GameData.clonagemNivel];
    },
    
    // ==================== CHECAGEM DE DESBLOQUEIO ====================
    
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
    
    checkBotaoRNA() {
        if (!GameData.botaoRNAVisivel && GameData.moleculas >= 20) {
            GameData.botaoRNAVisivel = true;
            const btnRow = document.getElementById('rnaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowRNA');
            if (row) row.style.display = 'grid';
        }
    },
    
    checkBotaoMembrana() {
        if (!GameData.botaoMembranaVisivel && GameData.rna >= 10) {
            GameData.botaoMembranaVisivel = true;
            const btnRow = document.getElementById('membranaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowMembrana');
            if (row) row.style.display = 'grid';
        }
    },
    
    checkBotaoDNA() {
        if (!GameData.botaoDNAVisivel && GameData.membrana >= 4) {
            GameData.botaoDNAVisivel = true;
            const btnRow = document.getElementById('dnaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowDNA');
            if (row) row.style.display = 'grid';
            this.updateDNAMaxDisplay();
        }
    },
    
    checkBotaoMetabolismo() {
        if (!GameData.botaoMetabolismoVisivel && GameData.dna >= 100) {
            GameData.botaoMetabolismoVisivel = true;
            const btnRow = document.getElementById('metabolismoButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowMetabolismo');
            if (row) row.style.display = 'grid';
        }
    },
    
    checkBotaoPrimeiraCelula() {
        if (!GameData.botaoPrimeiraCelulaVisivel && GameData.metabolismo >= 1000) {
            GameData.botaoPrimeiraCelulaVisivel = true;
            const btnRow = document.getElementById('primeiraCelulaButtonRow');
            if (btnRow) btnRow.style.display = 'flex';
            const row = document.getElementById('rowPrimeiraCelula');
            if (row) row.style.display = 'grid';
            const btn = document.getElementById('btnFormarPrimeiraCelula');
            if (btn) btn.disabled = false;
        }
    },
    
    // ==================== VERIFICAÇÃO DE CLONAGEM ====================
    
    verificarClonagemDNA() {
        if (GameData.clonagemNivel > 0 && GameData.dna < GameData.maxDNA) {
            const nivelAtual = GameData.clonagemNivel - 1;
            const chance = GameData.clonagemTabela[nivelAtual].chance;
            const random = Math.random() * 100;
            if (random <= chance && GameData.dna < GameData.maxDNA) {
                GameData.dna++;
                if (window.mostrarMensagem) {
                    window.mostrarMensagem(`🧬 CLONAGEM! +1 DNA extra! (${chance}% de chance)`, 2000);
                }
            }
        }
    },
    
    // ==================== ATUALIZAÇÃO DE BOTÕES ====================
    
    updateBotoesEstado() {
        const btnMolecula = document.getElementById('btnGerarMoleculas');
        if (btnMolecula) {
            btnMolecula.disabled = !(GameData.aminoacidos >= 10 && GameData.nucleotideos >= 10 && GameData.lipidios >= 10 && GameData.moleculas < GameData.maxMoleculas && !GameData.gameFinished);
        }
        
        const btnRNA = document.getElementById('btnComprarRNA');
        if (btnRNA) {
            btnRNA.disabled = !(GameData.moleculas >= 20 && GameData.rna < GameData.maxRNA && !GameData.gameFinished);
        }
        
        const btnMembrana = document.getElementById('btnComprarMembrana');
        if (btnMembrana) {
            btnMembrana.disabled = !(GameData.rna >= 10 && GameData.membrana < GameData.maxMembrana && !GameData.gameFinished);
        }
        
        const btnDNA = document.getElementById('btnComprarDNA');
        if (btnDNA) {
            btnDNA.disabled = !(GameData.membrana >= 4 && GameData.dna < GameData.maxDNA && !GameData.gameFinished);
        }
        
        const btnMetabolismo = document.getElementById('btnComprarMetabolismo');
        if (btnMetabolismo) {
            btnMetabolismo.disabled = !(GameData.dna >= 100 && GameData.metabolismo < GameData.maxMetabolismo && !GameData.gameFinished);
        }
        
        const btnPrimeiraCelula = document.getElementById('btnFormarPrimeiraCelula');
        if (btnPrimeiraCelula) {
            btnPrimeiraCelula.disabled = !(GameData.metabolismo >= 1000 && GameData.primeiraCelula < GameData.maxPrimeiraCelula && !GameData.primeiraFaseConcluida);
        }
        
        this.updateUpgradeCapacidadeButton();
        this.updateUpgradeAutoButton();
        this.updateUpgradeAutoMoleculaButton();
        this.updateUpgradeExpansaoDNAButton();
        this.updateUpgradeAutoMembranaButton();
        this.updateUpgradeClonagemButton();
    },
    
    updateDNAMaxDisplay() {
        const dnaMaxSpan = document.getElementById('dnaMax');
        if (dnaMaxSpan) {
            dnaMaxSpan.innerText = GameData.maxDNA;
        }
        const dnaMaxDisplay = document.querySelector('#rowDNA .max');
        if (dnaMaxDisplay) {
            dnaMaxDisplay.innerText = `/ ${GameData.maxDNA}`;
        }
    },
    
    // ==================== UPGRADES ====================
    
    updateUpgradeCapacidadeButton() {
        const btnUpgrade = document.getElementById('btnUpgradeCapacidade');
        const upgradeCard = document.getElementById('upgradeCapacidadeCard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeCapacidade();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const upgradeDesc = document.getElementById('upgradeDesc');
        if (upgradeDesc) upgradeDesc.innerHTML = `Aumenta capacidade máxima para ${proximoUpgrade.novoLimite} (Nível ${GameData.upgradeNivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.moleculas >= proximoUpgrade.custo && !GameData.gameFinished);
    },
    
    comprarUpgradeCapacidade() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeCapacidade();
        if (!proximoUpgrade) return false;
        if (GameData.moleculas >= proximoUpgrade.custo) {
            GameData.moleculas -= proximoUpgrade.custo;
            GameData.upgradeNivel++;
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    updateUpgradeAutoButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAuto');
        const upgradeCard = document.getElementById('upgradeAutoCard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeAuto();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoGeneration();
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const autoDesc = document.getElementById('autoDesc');
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        if (autoDesc) autoDesc.innerHTML = `Gera 1 de cada recurso a cada ${tempoStr} (Nível ${GameData.autoNivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.rna >= proximoUpgrade.custo && !GameData.gameFinished);
    },
    
    comprarUpgradeAuto() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAuto();
        if (!proximoUpgrade) return false;
        if (GameData.rna >= proximoUpgrade.custo) {
            GameData.rna -= proximoUpgrade.custo;
            GameData.autoNivel++;
            this.restartAutoGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    updateUpgradeAutoMoleculaButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAutoMolecula');
        const upgradeCard = document.getElementById('upgradeAutoMoleculaCard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeAutoMolecula();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoMoleculaGeneration();
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const autoMoleculaDesc = document.getElementById('autoMoleculaDesc');
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        if (autoMoleculaDesc) autoMoleculaDesc.innerHTML = `Gera 1 Molécula orgânica a cada ${tempoStr} (Nível ${GameData.autoMoleculaNivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.aminoacidos >= proximoUpgrade.custoAA && GameData.nucleotideos >= proximoUpgrade.custoNUC && GameData.lipidios >= proximoUpgrade.custoLIP && !GameData.gameFinished);
    },
    
    comprarUpgradeAutoMolecula() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAutoMolecula();
        if (!proximoUpgrade) return false;
        if (GameData.aminoacidos >= proximoUpgrade.custoAA && GameData.nucleotideos >= proximoUpgrade.custoNUC && GameData.lipidios >= proximoUpgrade.custoLIP) {
            GameData.aminoacidos -= proximoUpgrade.custoAA;
            GameData.nucleotideos -= proximoUpgrade.custoNUC;
            GameData.lipidios -= proximoUpgrade.custoLIP;
            GameData.autoMoleculaNivel++;
            this.restartAutoMoleculaGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    updateUpgradeExpansaoDNAButton() {
        const btnUpgrade = document.getElementById('btnUpgradeExpansaoDNA');
        const upgradeCard = document.getElementById('upgradeExpansaoDNACard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeExpansaoDNA();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const expansaoDNADesc = document.getElementById('expansaoDNADesc');
        if (expansaoDNADesc) expansaoDNADesc.innerHTML = `Aumenta limite máximo de DNA para ${proximoUpgrade.novoLimite} (Nível ${GameData.expansaoDNANivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.membrana >= proximoUpgrade.custo && !GameData.gameFinished);
        this.updateDNAMaxDisplay();
    },
    
    comprarUpgradeExpansaoDNA() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeExpansaoDNA();
        if (!proximoUpgrade) return false;
        if (GameData.membrana >= proximoUpgrade.custo) {
            GameData.membrana -= proximoUpgrade.custo;
            GameData.expansaoDNANivel++;
            GameData.maxDNA = proximoUpgrade.novoLimite;
            this.updateDNAMaxDisplay();
            this.updateBotoesEstado();
            if (window.mostrarMensagem) {
                window.mostrarMensagem(`🧬 Limite de DNA aumentado para ${GameData.maxDNA}!`, 1500);
            }
            return true;
        }
        return false;
    },
    
    updateUpgradeAutoMembranaButton() {
        const btnUpgrade = document.getElementById('btnUpgradeAutoMembrana');
        const upgradeCard = document.getElementById('upgradeAutoMembranaCard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeAutoMembrana();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            this.stopAutoMembranaGeneration();
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const autoMembranaDesc = document.getElementById('autoMembranaDesc');
        const intervalo = proximoUpgrade.intervalo;
        const minutos = Math.floor(intervalo / 60);
        const segundos = intervalo % 60;
        const tempoStr = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;
        if (autoMembranaDesc) autoMembranaDesc.innerHTML = `Gera 1 Membrana a cada ${tempoStr} (Nível ${GameData.autoMembranaNivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.moleculas >= proximoUpgrade.custoMoleculas && GameData.rna >= proximoUpgrade.custoRNA && !GameData.gameFinished);
    },
    
    comprarUpgradeAutoMembrana() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeAutoMembrana();
        if (!proximoUpgrade) return false;
        if (GameData.moleculas >= proximoUpgrade.custoMoleculas && GameData.rna >= proximoUpgrade.custoRNA) {
            GameData.moleculas -= proximoUpgrade.custoMoleculas;
            GameData.rna -= proximoUpgrade.custoRNA;
            GameData.autoMembranaNivel++;
            this.restartAutoMembranaGeneration();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    updateUpgradeClonagemButton() {
        const btnUpgrade = document.getElementById('btnUpgradeClonagem');
        const upgradeCard = document.getElementById('upgradeClonagemCard');
        if (!btnUpgrade) return;
        const proximoUpgrade = this.getProximoUpgradeClonagem();
        if (proximoUpgrade === null) {
            if (upgradeCard) upgradeCard.style.display = 'none';
            return;
        }
        if (upgradeCard) upgradeCard.style.display = 'block';
        const clonagemDesc = document.getElementById('clonagemDesc');
        if (clonagemDesc) clonagemDesc.innerHTML = `Chance de clonagem: ${proximoUpgrade.chance}% ao sintetizar DNA (Nível ${GameData.clonagemNivel + 1}/6)`;
        btnUpgrade.disabled = !(GameData.dna >= proximoUpgrade.custo && !GameData.gameFinished);
    },
    
    comprarUpgradeClonagem() {
        if (GameData.gameFinished) return false;
        const proximoUpgrade = this.getProximoUpgradeClonagem();
        if (!proximoUpgrade) return false;
        if (GameData.dna >= proximoUpgrade.custo) {
            GameData.dna -= proximoUpgrade.custo;
            GameData.clonagemNivel++;
            this.updateBotoesEstado();
            
            // 🔥 VERIFICAR CONQUISTAS (DOLLY - NÍVEL 6)
            if (window.Achievements && Achievements.verificarTodas) {
                Achievements.verificarTodas();
            }
            
            return true;
        }
        return false;
    },
    
    // ==================== AÇÕES PRINCIPAIS ====================
    
    gerarMolecula() {
        if (GameData.gameFinished) return false;
        if (GameData.aminoacidos >= 10 && GameData.nucleotideos >= 10 && GameData.lipidios >= 10 && GameData.moleculas < GameData.maxMoleculas) {
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
    
    comprarDNA() {
        if (GameData.gameFinished) return false;
        if (GameData.membrana >= 4 && GameData.dna < GameData.maxDNA) {
            GameData.membrana -= 4;
            GameData.dna++;
            this.verificarClonagemDNA();
            this.checkBotaoMetabolismo();
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    comprarMetabolismo() {
        if (GameData.gameFinished) return false;
        if (GameData.dna >= 100 && GameData.metabolismo < GameData.maxMetabolismo) {
            GameData.dna -= 100;
            GameData.metabolismo++;
            if (GameData.metabolismo >= 1000) {
                this.checkBotaoPrimeiraCelula();
            }
            this.updateBotoesEstado();
            return true;
        }
        return false;
    },
    
    formarPrimeiraCelula() {
        if (GameData.primeiraFaseConcluida) return false;
        if (GameData.metabolismo >= 1000 && GameData.primeiraCelula < GameData.maxPrimeiraCelula) {
            GameData.metabolismo -= 1000;
            GameData.primeiraCelula = 1;
            GameData.primeiraFaseConcluida = true;
            GameData.gameFinished = true;
            
            this.stopAutoGeneration();
            this.stopAutoMoleculaGeneration();
            this.stopAutoMembranaGeneration();
            this.updateBotoesEstado();
            
            // 🔥 VERIFICAR CONQUISTAS (PRIMEIRA CÉLULA)
            if (window.Achievements && Achievements.verificarTodas) {
                Achievements.verificarTodas();
            }
            
            if (window.limparInterfaceAposPrimeiraCelula) {
                window.limparInterfaceAposPrimeiraCelula();
            }
            
            if (window.mostrarMensagem) {
                window.mostrarMensagem(`🔬 Primeira Célula Formada! Escolha seu caminho evolutivo!`, 3000);
            }
            return true;
        }
        return false;
    },
    
    // ==================== GERENCIAMENTO DE INTERVALOS ====================
    
    startAutoGeneration() {
        this.stopAutoGeneration();
        if (GameData.autoNivel === 0 || GameData.gameFinished) return;
        const nivelAtual = GameData.autoNivel - 1;
        const intervalo = GameData.autoTabela[nivelAtual].intervalo;
        GameData.autoInterval = setInterval(() => { this.gerarAutomatico(); }, intervalo * 1000);
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
    
    startAutoMoleculaGeneration() {
        this.stopAutoMoleculaGeneration();
        if (GameData.autoMoleculaNivel === 0 || GameData.gameFinished) return;
        const nivelAtual = GameData.autoMoleculaNivel - 1;
        const intervalo = GameData.autoMoleculaTabela[nivelAtual].intervalo;
        GameData.autoMoleculaInterval = setInterval(() => { this.gerarMoleculaAutomatico(); }, intervalo * 1000);
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
    
    startAutoMembranaGeneration() {
        this.stopAutoMembranaGeneration();
        if (GameData.autoMembranaNivel === 0 || GameData.gameFinished) return;
        const nivelAtual = GameData.autoMembranaNivel - 1;
        const intervalo = GameData.autoMembranaTabela[nivelAtual].intervalo;
        GameData.autoMembranaInterval = setInterval(() => { this.gerarMembranaAutomatico(); }, intervalo * 1000);
    },
    
    restartAutoMembranaGeneration() {
        this.startAutoMembranaGeneration();
    },
    
    stopAutoMembranaGeneration() {
        if (GameData.autoMembranaInterval) {
            clearInterval(GameData.autoMembranaInterval);
            GameData.autoMembranaInterval = null;
        }
    },

       // ==================== VITÓRIA PRIMEIRA FASE ====================
    
    verificarVitoriaPrimeiraFase() {
        if (!GameData.primeiraFaseConcluida && GameData.metabolismo >= 1000) {
            // Não faz nada aqui, apenas retorna true
            return true;
        }
        return false;
    },
    
    resetParaProximaFase() {
        const escolha = GameData.evolucaoEscolhida;
        
        GameData.aminoacidos = 0;
        GameData.nucleotideos = 0;
        GameData.lipidios = 0;
        GameData.moleculas = 0;
        GameData.rna = 0;
        GameData.membrana = 0;
        GameData.dna = 0;
        GameData.metabolismo = 0;
        GameData.primeiraCelula = 0;
        
        GameData.botaoMoleculasVisivel = false;
        GameData.botaoRNAVisivel = false;
        GameData.botaoMembranaVisivel = false;
        GameData.botaoDNAVisivel = false;
        GameData.botaoMetabolismoVisivel = false;
        GameData.botaoPrimeiraCelulaVisivel = false;
        
        GameData.upgradeNivel = 0;
        GameData.autoNivel = 0;
        GameData.autoMoleculaNivel = 0;
        GameData.expansaoDNANivel = 0;
        GameData.autoMembranaNivel = 0;
        GameData.clonagemNivel = 0;
        GameData.maxDNA = 40;
        
        GameData.primeiraFaseConcluida = false;
        GameData.gameFinished = false;
        
        if (window.UIRefresh) window.UIRefresh();
        
        const event = new CustomEvent('evolucaoEscolhida', { detail: { tipo: escolha } });
        window.dispatchEvent(event);
    }
};