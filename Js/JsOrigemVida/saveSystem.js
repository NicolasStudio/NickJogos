// ==================== SISTEMA DE SALVAMENTO ATUALIZADO ====================

const SaveSystem = {
    // Salvar jogo como arquivo .txt
    salvar() {
        // Coletar todos os dados do jogo
        const saveData = {
            // Metadados
            version: "2.0",
            savedAt: new Date().toLocaleString('pt-BR'),
            
            // Recursos e quantidades (COMPLETO)
            resources: {
                aminoacidos: GameData.aminoacidos,
                nucleotideos: GameData.nucleotideos,
                lipidios: GameData.lipidios,
                moleculas: GameData.moleculas,
                rna: GameData.rna,
                membrana: GameData.membrana,
                dna: GameData.dna,
                metabolismo: GameData.metabolismo,
                primeiraCelula: GameData.primeiraCelula
            },
            
            // Limites máximos
            limits: {
                maxMoleculas: GameData.maxMoleculas,
                maxRNA: GameData.maxRNA,
                maxMembrana: GameData.maxMembrana,
                maxDNA: GameData.maxDNA,
                maxMetabolismo: GameData.maxMetabolismo,
                maxBase: GameData.maxBase,
                limiteBaseAtual: GameLogic.getLimiteAtual()
            },
            
            // Upgrade 1: Expansão do Protoplasma
            upgrades: {
                expansaoProtoplasma: {
                    nivel: GameData.upgradeNivel,
                    maxNivel: GameData.upgradeTabela.length,
                    limiteAtual: GameLogic.getLimiteAtual(),
                    proximoLimite: GameData.upgradeNivel < GameData.upgradeTabela.length ? 
                        GameData.upgradeTabela[GameData.upgradeNivel].novoLimite : null,
                    proximoCusto: GameData.upgradeNivel < GameData.upgradeTabela.length ? 
                        GameData.upgradeTabela[GameData.upgradeNivel].custo : null
                },
                
                // Upgrade 2: Automação Metabólica
                automacaoMetabolica: {
                    nivel: GameData.autoNivel,
                    maxNivel: GameData.autoTabela.length,
                    intervaloAtual: GameData.autoNivel > 0 ? 
                        GameData.autoTabela[GameData.autoNivel - 1].intervalo : null,
                    proximoIntervalo: GameData.autoNivel < GameData.autoTabela.length ? 
                        GameData.autoTabela[GameData.autoNivel].intervalo : null,
                    proximoCusto: GameData.autoNivel < GameData.autoTabela.length ? 
                        GameData.autoTabela[GameData.autoNivel].custo : null
                },
                
                // Upgrade 3: Automação Molecular
                automacaoMolecular: {
                    nivel: GameData.autoMoleculaNivel,
                    maxNivel: GameData.autoMoleculaTabela.length,
                    intervaloAtual: GameData.autoMoleculaNivel > 0 ? 
                        GameData.autoMoleculaTabela[GameData.autoMoleculaNivel - 1].intervalo : null,
                    proximoIntervalo: GameData.autoMoleculaNivel < GameData.autoMoleculaTabela.length ? 
                        GameData.autoMoleculaTabela[GameData.autoMoleculaNivel].intervalo : null,
                    custoAA: GameData.autoMoleculaNivel < GameData.autoMoleculaTabela.length ? 
                        GameData.autoMoleculaTabela[GameData.autoMoleculaNivel].custoAA : null,
                    custoNUC: GameData.autoMoleculaNivel < GameData.autoMoleculaTabela.length ? 
                        GameData.autoMoleculaTabela[GameData.autoMoleculaNivel].custoNUC : null,
                    custoLIP: GameData.autoMoleculaNivel < GameData.autoMoleculaTabela.length ? 
                        GameData.autoMoleculaTabela[GameData.autoMoleculaNivel].custoLIP : null
                },
                
                // Upgrade 4: Expansão do DNA
                expansaoDNA: {
                    nivel: GameData.expansaoDNANivel,
                    maxNivel: GameData.expansaoDNATabela.length,
                    limiteDNAAtual: GameData.maxDNA,
                    proximoLimite: GameData.expansaoDNANivel < GameData.expansaoDNATabela.length ? 
                        GameData.expansaoDNATabela[GameData.expansaoDNANivel].novoLimite : null,
                    custo: GameData.expansaoDNANivel < GameData.expansaoDNATabela.length ? 
                        GameData.expansaoDNATabela[GameData.expansaoDNANivel].custo : null
                },
                
                // Upgrade 5: Automação de Membrana
                automacaoMembrana: {
                    nivel: GameData.autoMembranaNivel,
                    maxNivel: GameData.autoMembranaTabela.length,
                    intervaloAtual: GameData.autoMembranaNivel > 0 ? 
                        GameData.autoMembranaTabela[GameData.autoMembranaNivel - 1].intervalo : null,
                    proximoIntervalo: GameData.autoMembranaNivel < GameData.autoMembranaTabela.length ? 
                        GameData.autoMembranaTabela[GameData.autoMembranaNivel].intervalo : null,
                    custoMoleculas: GameData.autoMembranaNivel < GameData.autoMembranaTabela.length ? 
                        GameData.autoMembranaTabela[GameData.autoMembranaNivel].custoMoleculas : null,
                    custoRNA: GameData.autoMembranaNivel < GameData.autoMembranaTabela.length ? 
                        GameData.autoMembranaTabela[GameData.autoMembranaNivel].custoRNA : null
                },
                
                // Upgrade 6: Clonagem de DNA
                clonagemDNA: {
                    nivel: GameData.clonagemNivel,
                    maxNivel: GameData.clonagemTabela.length,
                    chanceAtual: GameData.clonagemNivel > 0 ? 
                        GameData.clonagemTabela[GameData.clonagemNivel - 1].chance : 0,
                    proximaChance: GameData.clonagemNivel < GameData.clonagemTabela.length ? 
                        GameData.clonagemTabela[GameData.clonagemNivel].chance : null,
                    proximoCusto: GameData.clonagemNivel < GameData.clonagemTabela.length ? 
                        GameData.clonagemTabela[GameData.clonagemNivel].custo : null
                }
            },
            
            // Botões desbloqueados (COMPLETO)
            unlockedButtons: {
                moleculasVisivel: GameData.botaoMoleculasVisivel,
                rnaVisivel: GameData.botaoRNAVisivel,
                membranaVisivel: GameData.botaoMembranaVisivel,
                dnaVisivel: GameData.botaoDNAVisivel,
                metabolismoVisivel: GameData.botaoMetabolismoVisivel,
                primeiraCelulaVisivel: GameData.botaoPrimeiraCelulaVisivel
            },
            
            // Estado do jogo (COMPLETO)
            gameState: {
                gameFinished: GameData.gameFinished,
                primeiraFaseConcluida: GameData.primeiraFaseConcluida,
                evolucaoEscolhida: GameData.evolucaoEscolhida,
                vitoria: GameData.metabolismo >= 1
            },
            
            // Conquistas desbloqueadas
            achievements: {
                desbloqueadas: Achievements ? Achievements.desbloqueadas : [],
                total: Achievements ? Achievements.lista.length : 0,
                listaCompleta: Achievements ? Achievements.lista.map(a => ({
                    id: a.id,
                    titulo: a.titulo,
                    descricao: a.descricao,
                    desbloqueada: Achievements.desbloqueadas.includes(a.id)
                })) : []
            },
            
            // Resumo do progresso
            resumo: {
                totalRecursos: GameData.aminoacidos + GameData.nucleotideos + GameData.lipidios + 
                               GameData.moleculas + GameData.rna + GameData.membrana + 
                               GameData.dna + GameData.metabolismo + GameData.primeiraCelula,
                upgradesComprados: (GameData.upgradeNivel > 0 ? 1 : 0) +
                                  (GameData.autoNivel > 0 ? 1 : 0) +
                                  (GameData.autoMoleculaNivel > 0 ? 1 : 0) +
                                  (GameData.expansaoDNANivel > 0 ? 1 : 0) +
                                  (GameData.autoMembranaNivel > 0 ? 1 : 0) +
                                  (GameData.clonagemNivel > 0 ? 1 : 0),
                conquistasDesbloqueadas: Achievements ? Achievements.desbloqueadas.length : 0,
                faseAtual: GameData.primeiraFaseConcluida ? "Pós-Primeira Célula" : "Origem da Vida",
                evolucao: GameData.evolucaoEscolhida || "Não escolhida"
            }
        };
        
        // Converter para string formatada
        const saveString = this.formatSaveData(saveData);
        
        // Criar blob e download
        const blob = new Blob([saveString], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `evolucao_celular_save_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.mostrarMensagem('✅ Jogo salvo como arquivo .txt!', '#00ff00');
        return true;
    },
    
    // Formatar dados de forma legível (ATUALIZADO)
    formatSaveData(data) {
        let text = '='.repeat(60) + '\n';
        text += '         EVOLUÇÃO CELULAR - SAVE GAME\n';
        text += '='.repeat(60) + '\n\n';
        
        text += `📅 DATA DO SAVE: ${data.savedAt}\n`;
        text += `🔧 VERSÃO: ${data.version}\n\n`;
        
        text += '-'.repeat(60) + '\n';
        text += '📊 RECURSOS E QUANTIDADES\n';
        text += '-'.repeat(60) + '\n';
        text += `🧪 Aminoácidos: ${data.resources.aminoacidos}\n`;
        text += `🧬 Nucleotídeos: ${data.resources.nucleotideos}\n`;
        text += `🫧 Lipídios: ${data.resources.lipidios}\n`;
        text += `🧪 Moléculas orgânicas: ${data.resources.moleculas} / ${data.limits.maxMoleculas}\n`;
        text += `🧬 RNA: ${data.resources.rna} / ${data.limits.maxRNA}\n`;
        text += `🫧 Membrana: ${data.resources.membrana} / ${data.limits.maxMembrana}\n`;
        text += `🧬 DNA: ${data.resources.dna} / ${data.limits.maxDNA}\n`;
        text += `⚡ Metabolismo: ${data.resources.metabolismo} / ${data.limits.maxMetabolismo}\n`;
        text += `🔬 Primeira Célula: ${data.resources.primeiraCelula} / 1\n\n`;
        
        text += '-'.repeat(60) + '\n';
        text += '🎮 ESTADO DO JOGO\n';
        text += '-'.repeat(60) + '\n';
        text += `Fase atual: ${data.resumo.faseAtual}\n`;
        text += `Evolução escolhida: ${data.resumo.evolucao}\n`;
        text += `Jogo finalizado: ${data.gameState.gameFinished ? 'SIM' : 'NÃO'}\n`;
        text += `Primeira fase concluída: ${data.gameState.primeiraFaseConcluida ? 'SIM' : 'NÃO'}\n`;
        text += `Vitória alcançada: ${data.gameState.vitoria ? 'SIM 🎉' : 'NÃO'}\n\n`;
        
        text += '-'.repeat(60) + '\n';
        text += '📈 MELHORIAS (UPGRADES)\n';
        text += '-'.repeat(60) + '\n\n';
        
        // Expansão do Protoplasma
        text += `1️⃣ EXPANSÃO DO PROTOPLASMA\n`;
        text += `   Nível: ${data.upgrades.expansaoProtoplasma.nivel}/${data.upgrades.expansaoProtoplasma.maxNivel}\n`;
        text += `   Limite atual dos recursos básicos: ${data.upgrades.expansaoProtoplasma.limiteAtual}\n`;
        if (data.upgrades.expansaoProtoplasma.proximoLimite) {
            text += `   Próximo limite: ${data.upgrades.expansaoProtoplasma.proximoLimite}\n`;
            text += `   Custo próx. nível: ${data.upgrades.expansaoProtoplasma.proximoCusto} moléculas\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        // Automação Metabólica
        text += `2️⃣ AUTOMAÇÃO METABÓLICA\n`;
        text += `   Nível: ${data.upgrades.automacaoMetabolica.nivel}/${data.upgrades.automacaoMetabolica.maxNivel}\n`;
        if (data.upgrades.automacaoMetabolica.intervaloAtual) {
            text += `   Intervalo atual: ${data.upgrades.automacaoMetabolica.intervaloAtual} segundos\n`;
        }
        if (data.upgrades.automacaoMetabolica.proximoIntervalo) {
            text += `   Próx. intervalo: ${data.upgrades.automacaoMetabolica.proximoIntervalo} segundos\n`;
            text += `   Custo próx. nível: ${data.upgrades.automacaoMetabolica.proximoCusto} RNA\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        // Automação Molecular
        text += `3️⃣ AUTOMAÇÃO MOLECULAR\n`;
        text += `   Nível: ${data.upgrades.automacaoMolecular.nivel}/${data.upgrades.automacaoMolecular.maxNivel}\n`;
        if (data.upgrades.automacaoMolecular.intervaloAtual) {
            text += `   Intervalo atual: ${data.upgrades.automacaoMolecular.intervaloAtual} segundos\n`;
        }
        if (data.upgrades.automacaoMolecular.proximoIntervalo) {
            text += `   Próx. intervalo: ${data.upgrades.automacaoMolecular.proximoIntervalo} segundos\n`;
            text += `   Custo próx. nível: ${data.upgrades.automacaoMolecular.custoAA} Aminoácidos + `;
            text += `${data.upgrades.automacaoMolecular.custoNUC} Nucleotídeos + ${data.upgrades.automacaoMolecular.custoLIP} Lipídios\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        // Expansão do DNA
        text += `4️⃣ EXPANSÃO DO DNA\n`;
        text += `   Nível: ${data.upgrades.expansaoDNA.nivel}/${data.upgrades.expansaoDNA.maxNivel}\n`;
        text += `   Limite atual do DNA: ${data.upgrades.expansaoDNA.limiteDNAAtual}\n`;
        if (data.upgrades.expansaoDNA.proximoLimite) {
            text += `   Próximo limite: ${data.upgrades.expansaoDNA.proximoLimite}\n`;
            text += `   Custo próx. nível: ${data.upgrades.expansaoDNA.custo} Membrana\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        // Automação de Membrana
        text += `5️⃣ AUTOMAÇÃO DE MEMBRANA\n`;
        text += `   Nível: ${data.upgrades.automacaoMembrana.nivel}/${data.upgrades.automacaoMembrana.maxNivel}\n`;
        if (data.upgrades.automacaoMembrana.intervaloAtual) {
            text += `   Intervalo atual: ${data.upgrades.automacaoMembrana.intervaloAtual} segundos\n`;
        }
        if (data.upgrades.automacaoMembrana.proximoIntervalo) {
            text += `   Próx. intervalo: ${data.upgrades.automacaoMembrana.proximoIntervalo} segundos\n`;
            text += `   Custo próx. nível: ${data.upgrades.automacaoMembrana.custoMoleculas} Moléculas + `;
            text += `${data.upgrades.automacaoMembrana.custoRNA} RNA\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        // Clonagem de DNA
        text += `6️⃣ CLONAGEM DE DNA (DNA GÊMEO)\n`;
        text += `   Nível: ${data.upgrades.clonagemDNA.nivel}/${data.upgrades.clonagemDNA.maxNivel}\n`;
        if (data.upgrades.clonagemDNA.chanceAtual > 0) {
            text += `   Chance atual de clonagem: ${data.upgrades.clonagemDNA.chanceAtual}%\n`;
        }
        if (data.upgrades.clonagemDNA.proximaChance) {
            text += `   Próxima chance: ${data.upgrades.clonagemDNA.proximaChance}%\n`;
            text += `   Custo próx. nível: ${data.upgrades.clonagemDNA.proximoCusto} DNA\n`;
        } else {
            text += `   ✅ MÁXIMO ATINGIDO!\n`;
        }
        text += `\n`;
        
        text += '-'.repeat(60) + '\n';
        text += '🏆 CONQUISTAS\n';
        text += '-'.repeat(60) + '\n';
        text += `Total: ${data.achievements.desbloqueadas.length}/${data.achievements.total}\n\n`;
        
        if (data.achievements.listaCompleta) {
            data.achievements.listaCompleta.forEach(ach => {
                const status = ach.desbloqueada ? '✅' : '🔒';
                text += `${status} ${ach.titulo}\n`;
                text += `   ${ach.descricao}\n`;
            });
        }
        text += `\n`;
        
        text += '-'.repeat(60) + '\n';
        text += '📊 RESUMO DO PROGRESSO\n';
        text += '-'.repeat(60) + '\n';
        text += `Total de recursos acumulados: ${data.resumo.totalRecursos}\n`;
        text += `Upgrades comprados: ${data.resumo.upgradesComprados}/6\n`;
        text += `Conquistas desbloqueadas: ${data.resumo.conquistasDesbloqueadas}/${data.achievements.total}\n`;
        text += `Fase atual: ${data.resumo.faseAtual}\n`;
        text += `Evolução: ${data.resumo.evolucao}\n\n`;
        
        text += '='.repeat(60) + '\n';
        text += '         FIM DO SAVE - Evolução Celular\n';
        text += '='.repeat(60);
        
        return text;
    },
    
    // Carregar jogo a partir de arquivo .txt (ATUALIZADO)
    carregarArquivo(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const saveData = this.parseSaveFile(content);
                
                if (saveData) {
                    this.restaurarSave(saveData);
                    this.mostrarMensagem('✅ Jogo carregado com sucesso!', '#00ff00');
                    if (window.UIRefresh) window.UIRefresh();
                } else {
                    this.mostrarMensagem('❌ Arquivo inválido ou corrompido!', '#ff4444');
                }
            } catch (error) {
                console.error('Erro ao carregar:', error);
                this.mostrarMensagem('❌ Erro ao processar o arquivo!', '#ff4444');
            }
        };
        
        reader.onerror = () => {
            this.mostrarMensagem('❌ Erro ao ler o arquivo!', '#ff4444');
        };
        
        reader.readAsText(file, 'UTF-8');
    },
    
    // Abrir seletor de arquivo para carregar
    carregar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                this.carregarArquivo(e.target.files[0]);
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    },
    
    // Parse do arquivo de save para extrair dados (ATUALIZADO)
    parseSaveFile(content) {
        const saveData = {};
        
        // Extrair recursos
        const aminoMatch = content.match(/Aminoácidos:\s*(\d+)/);
        const nucleoMatch = content.match(/Nucleotídeos:\s*(\d+)/);
        const lipiMatch = content.match(/Lipídios:\s*(\d+)/);
        const molecMatch = content.match(/Moléculas orgânicas:\s*(\d+)/);
        const rnaMatch = content.match(/RNA:\s*(\d+)/);
        const membMatch = content.match(/Membrana:\s*(\d+)/);
        const dnaMatch = content.match(/DNA:\s*(\d+)/);
        const metaMatch = content.match(/Metabolismo:\s*(\d+)/);
        const primeiraCelulaMatch = content.match(/Primeira Célula:\s*(\d+)/);
        
        saveData.resources = {
            aminoacidos: aminoMatch ? parseInt(aminoMatch[1]) : 0,
            nucleotideos: nucleoMatch ? parseInt(nucleoMatch[1]) : 0,
            lipidios: lipiMatch ? parseInt(lipiMatch[1]) : 0,
            moleculas: molecMatch ? parseInt(molecMatch[1]) : 0,
            rna: rnaMatch ? parseInt(rnaMatch[1]) : 0,
            membrana: membMatch ? parseInt(membMatch[1]) : 0,
            dna: dnaMatch ? parseInt(dnaMatch[1]) : 0,
            metabolismo: metaMatch ? parseInt(metaMatch[1]) : 0,
            primeiraCelula: primeiraCelulaMatch ? parseInt(primeiraCelulaMatch[1]) : 0
        };
        
        // Extrair limites
        const dnaLimitMatch = content.match(/DNA:\s*\d+\s*\/\s*(\d+)/);
        saveData.maxDNA = dnaLimitMatch ? parseInt(dnaLimitMatch[1]) : 40;
        
        // Extrair estado do jogo
        const faseAtualMatch = content.match(/Fase atual:\s*(.+)/);
        const evolucaoMatch = content.match(/Evolução escolhida:\s*(.+)/);
        const primeiraFaseConcluidaMatch = content.match(/Primeira fase concluída:\s*(SIM|NÃO)/);
        const gameFinishedMatch = content.match(/Jogo finalizado:\s*(SIM|NÃO)/);
        
        saveData.gameState = {
            faseAtual: faseAtualMatch ? faseAtualMatch[1] : "Origem da Vida",
            evolucaoEscolhida: evolucaoMatch ? (evolucaoMatch[1] === "Não escolhida" ? null : evolucaoMatch[1].toLowerCase()) : null,
            primeiraFaseConcluida: primeiraFaseConcluidaMatch ? primeiraFaseConcluidaMatch[1] === 'SIM' : false,
            gameFinished: gameFinishedMatch ? gameFinishedMatch[1] === 'SIM' : false
        };
        
        // Extrair níveis dos upgrades
        const expansaoNivelMatch = content.match(/EXPANSÃO DO PROTOPLASMA[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        const autoMetaNivelMatch = content.match(/AUTOMAÇÃO METABÓLICA[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        const autoMolecNivelMatch = content.match(/AUTOMAÇÃO MOLECULAR[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        const expansaoDNANivelMatch = content.match(/EXPANSÃO DO DNA[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        const autoMembNivelMatch = content.match(/AUTOMAÇÃO DE MEMBRANA[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        const clonagemNivelMatch = content.match(/CLONAGEM DE DNA[\s\S]*?Nível:\s*(\d+)\/(\d+)/);
        
        saveData.upgrades = {
            expansaoProtoplasma: expansaoNivelMatch ? parseInt(expansaoNivelMatch[1]) : 0,
            automacaoMetabolica: autoMetaNivelMatch ? parseInt(autoMetaNivelMatch[1]) : 0,
            automacaoMolecular: autoMolecNivelMatch ? parseInt(autoMolecNivelMatch[1]) : 0,
            expansaoDNA: expansaoDNANivelMatch ? parseInt(expansaoDNANivelMatch[1]) : 0,
            automacaoMembrana: autoMembNivelMatch ? parseInt(autoMembNivelMatch[1]) : 0,
            clonagemDNA: clonagemNivelMatch ? parseInt(clonagemNivelMatch[1]) : 0
        };
        
        // Extrair conquistas
        const conquistas = [];
        const conquistaLines = content.match(/[✅🔒] .+/g);
        if (conquistaLines) {
            conquistaLines.forEach(line => {
                const match = line.match(/[✅🔒] (.+)/);
                if (match && line.startsWith('✅')) {
                    if (Achievements) {
                        const conquista = Achievements.lista.find(a => a.titulo === match[1]);
                        if (conquista) conquistas.push(conquista.id);
                    }
                }
            });
        }
        saveData.conquistas = conquistas;
        
        return saveData;
    },
    
    // Restaurar o jogo a partir dos dados parseados (ATUALIZADO)
    restaurarSave(saveData) {
        // Restaurar recursos
        GameData.aminoacidos = saveData.resources.aminoacidos;
        GameData.nucleotideos = saveData.resources.nucleotideos;
        GameData.lipidios = saveData.resources.lipidios;
        GameData.moleculas = saveData.resources.moleculas;
        GameData.rna = saveData.resources.rna;
        GameData.membrana = saveData.resources.membrana;
        GameData.dna = saveData.resources.dna;
        GameData.metabolismo = saveData.resources.metabolismo;
        GameData.primeiraCelula = saveData.resources.primeiraCelula;
        
        // Restaurar limites
        GameData.maxDNA = saveData.maxDNA;
        
        // Restaurar níveis dos upgrades
        GameData.upgradeNivel = saveData.upgrades.expansaoProtoplasma;
        GameData.autoNivel = saveData.upgrades.automacaoMetabolica;
        GameData.autoMoleculaNivel = saveData.upgrades.automacaoMolecular;
        GameData.expansaoDNANivel = saveData.upgrades.expansaoDNA;
        GameData.autoMembranaNivel = saveData.upgrades.automacaoMembrana;
        GameData.clonagemNivel = saveData.upgrades.clonagemDNA;
        
        // Ajustar limites baseados nos níveis
        if (GameData.expansaoDNANivel > 0) {
            const nivelIndex = GameData.expansaoDNANivel - 1;
            GameData.maxDNA = GameData.expansaoDNATabela[nivelIndex].novoLimite;
        }
        
        // Restaurar estado do jogo
        if (saveData.gameState) {
            GameData.gameFinished = saveData.gameState.gameFinished;
            GameData.primeiraFaseConcluida = saveData.gameState.primeiraFaseConcluida;
            GameData.evolucaoEscolhida = saveData.gameState.evolucaoEscolhida;
        }
        
        // Restaurar conquistas
        if (Achievements && saveData.conquistas) {
            Achievements.desbloqueadas = saveData.conquistas;
            Achievements.salvar();
        }
        
        // Recalcular desbloqueios de botões baseado nos recursos atuais
        GameData.botaoMoleculasVisivel = GameData.aminoacidos >= 10 && 
                                         GameData.nucleotideos >= 10 && 
                                         GameData.lipidios >= 10;
        GameData.botaoRNAVisivel = GameData.moleculas >= 20;
        GameData.botaoMembranaVisivel = GameData.rna >= 10;
        GameData.botaoDNAVisivel = GameData.membrana >= 4;
        GameData.botaoMetabolismoVisivel = GameData.dna >= 100;
        GameData.botaoPrimeiraCelulaVisivel = GameData.metabolismo >= 1000;
        
        // Se a primeira fase já foi concluída, restaurar interface especial
        if (GameData.primeiraFaseConcluida && window.limparInterfaceAposPrimeiraCelula) {
            window.limparInterfaceAposPrimeiraCelula();
        }
        
        // Reiniciar automações
        if (GameLogic) {
            GameLogic.stopAutoGeneration();
            GameLogic.stopAutoMoleculaGeneration();
            GameLogic.stopAutoMembranaGeneration();
            GameLogic.startAutoGeneration();
            GameLogic.startAutoMoleculaGeneration();
            GameLogic.startAutoMembranaGeneration();
        }
        
        // Verificar conquistas novamente
        if (Achievements && Achievements.verificarTodas) {
            Achievements.verificarTodas();
        }
    },
    
    // Mostrar mensagem temporária
    mostrarMensagem(texto, cor) {
        const msg = document.createElement('div');
        msg.textContent = texto;
        msg.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${cor};
            color: ${cor};
            padding: 10px 20px;
            border-radius: 10px;
            font-family: monospace;
            font-weight: bold;
            z-index: 3000;
            animation: fadeOut 0.5s ease 2s forwards;
        `;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            if (msg && msg.parentNode) msg.remove();
        }, 2500);
    },
    
    // Verificar se existe save no localStorage (para compatibilidade)
    hasSave() {
        return localStorage.getItem('evolution_game_save') !== null;
    },
    
    // Carregar save antigo do localStorage (opcional)
    carregarLocalStorage() {
        const saveData = localStorage.getItem('evolution_game_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.restaurarSave({
                    resources: {
                        aminoacidos: data.aminoacidos,
                        nucleotideos: data.nucleotideos,
                        lipidios: data.lipidios,
                        moleculas: data.moleculas,
                        rna: data.rna,
                        membrana: data.membrana,
                        dna: data.dna,
                        metabolismo: data.metabolismo,
                        primeiraCelula: data.primeiraCelula || 0
                    },
                    maxDNA: data.maxDNA || 40,
                    upgrades: {
                        expansaoProtoplasma: data.upgradeNivel || 0,
                        automacaoMetabolica: data.autoNivel || 0,
                        automacaoMolecular: data.autoMoleculaNivel || 0,
                        expansaoDNA: data.expansaoDNANivel || 0,
                        automacaoMembrana: data.autoMembranaNivel || 0,
                        clonagemDNA: data.clonagemNivel || 0
                    },
                    conquistas: Achievements ? Achievements.desbloqueadas : [],
                    gameState: {
                        gameFinished: data.gameFinished || false,
                        primeiraFaseConcluida: data.primeiraFaseConcluida || false,
                        evolucaoEscolhida: data.evolucaoEscolhida || null
                    }
                });
                this.mostrarMensagem('✅ Jogo carregado do localStorage!', '#00ff00');
                if (window.UIRefresh) window.UIRefresh();
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }
};