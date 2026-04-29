// ==================== DADOS DO JOGO ====================

const GameData = {
    // Matérias-primas
    aminoacidos: 0,
    nucleotideos: 0,
    lipidios: 0,
    
    // Recursos evolutivos
    moleculas: 0,
    rna: 0,
    membrana: 0,
    dna: 0,
    metabolismo: 0,
    
    // Limites
    maxMoleculas: 20,
    maxRNA: 12,
    maxMembrana: 4,
    maxDNA: 40,
    maxMetabolismo: 1,
    maxBase: 15,
    
    // Upgrade 1: Expansão do Protoplasma
    upgradeNivel: 0,
    upgradeTabela: [
        { custo: 10, novoLimite: 20 },
        { custo: 12, novoLimite: 25 },
        { custo: 14, novoLimite: 30 },
        { custo: 16, novoLimite: 35 },
        { custo: 18, novoLimite: 40 },
        { custo: 20, novoLimite: 50 }
    ],
    
    // Upgrade 2: Automação Metabólica
    autoNivel: 0,
    autoTabela: [
        { custo: 2, intervalo: 60 },
        { custo: 4, intervalo: 50 },
        { custo: 6, intervalo: 40 },
        { custo: 8, intervalo: 30 },
        { custo: 10, intervalo: 20 },
        { custo: 12, intervalo: 10 }
    ],
    autoInterval: null,
    
    // Upgrade 3: Automação Molecular
    autoMoleculaNivel: 0,
    autoMoleculaTabela: [
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 120 },
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 110 },
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 100 },
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 90 },
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 80 },
        { custoAA: 50, custoNUC: 50, custoLIP: 50, intervalo: 70 }
    ],
    autoMoleculaInterval: null,
    
    // Upgrade 4: Expansão do DNA
    expansaoDNANivel: 0,
    expansaoDNATabela: [
        { custo: 1, novoLimite: 50 },
        { custo: 1, novoLimite: 60 },
        { custo: 1, novoLimite: 70 },
        { custo: 1, novoLimite: 80 },
        { custo: 1, novoLimite: 90 },
        { custo: 1, novoLimite: 100 }
    ],
    
    // Upgrade 5: Automação de Membrana
    autoMembranaNivel: 0,
    autoMembranaTabela: [
        { custoMoleculas: 10, custoRNA: 5, intervalo: 300 },
        { custoMoleculas: 10, custoRNA: 5, intervalo: 270 },
        { custoMoleculas: 10, custoRNA: 5, intervalo: 240 },
        { custoMoleculas: 10, custoRNA: 5, intervalo: 210 },
        { custoMoleculas: 10, custoRNA: 5, intervalo: 180 },
        { custoMoleculas: 10, custoRNA: 5, intervalo: 150 }
    ],
    autoMembranaInterval: null,
    
    // Upgrade 6: Clonagem de DNA
    clonagemNivel: 0,
    clonagemTabela: [
        { custo: 10, chance: 3 },
        { custo: 20, chance: 6 },
        { custo: 30, chance: 9 },
        { custo: 40, chance: 12 },
        { custo: 50, chance: 15 },
        { custo: 60, chance: 20 }
    ],
    
    // Controle de desbloqueio
    botaoMoleculasVisivel: false,
    botaoRNAVisivel: false,
    botaoMembranaVisivel: false,
    botaoDNAVisivel: false,
    botaoMetabolismoVisivel: false,
    
    // Flag de vitória
    gameFinished: false
};