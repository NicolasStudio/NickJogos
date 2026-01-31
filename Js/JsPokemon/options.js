// ===== SISTEMA DE EXPORTAÇÃO/IMPORTAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar display do último salvamento
    updateLastSaveDisplay();
    
    // Configurar botões
    document.getElementById('exportar').addEventListener('click', exportarProgresso);
    document.getElementById('importar').addEventListener('click', function() {
        document.getElementById('fileImportInput').click();
    });
    document.getElementById('atualizar').addEventListener('click', atualizarProgressoLocal); // Alterado aqui
    
    // Configurar input de arquivo
    document.getElementById('fileImportInput').addEventListener('change', handleFileImport);
});

// ===== FUNÇÃO ATUALIZADA =====
// Atualizar progresso no localStorage SEM baixar arquivo
function atualizarProgressoLocal() {
    try {
        // Simplesmente atualizar o timestamp do último salvamento
        localStorage.setItem('lastExport', new Date().toISOString());
        
        // Atualizar a interface
        updateLastSaveDisplay();
        
        // Mostrar mensagem de sucesso
        showSaveMessage('✅ Progresso salvo localmente!', 'success');
        
        // Atualizar tooltip
        const tooltip = document.getElementById('updateInfo');
        if (tooltip) {
            tooltip.textContent = `Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`;
            tooltip.style.color = '#FF9800';
        }
        
        console.log('Progresso atualizado no localStorage');
        
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        showSaveMessage('❌ Erro ao atualizar progresso', 'error');
    }
}

// ===== FUNÇÃO DE EXPORTAÇÃO (mantém download) =====
function exportarProgresso() {
    try {
        // 1. Coletar todos os dados importantes
        const saveData = {
            // Dados principais
            capturados: JSON.parse(localStorage.getItem('capturados') || '{}'),
            pokedex: JSON.parse(localStorage.getItem('pokedex') || '{}'),
            dinheiro: parseInt(localStorage.getItem('dinheiro') || '0'),
            
            // Metadados
            metadata: {
                version: "1.0",
                exportDate: new Date().toISOString(),
                totalPokemons: Object.keys(JSON.parse(localStorage.getItem('capturados') || '{}')).length,
                pokedexCount: Object.keys(JSON.parse(localStorage.getItem('pokedex') || '{}')).length,
                money: parseInt(localStorage.getItem('dinheiro') || '0')
            }
        };
        
        // 2. Coletar outras keys do localStorage (exceto as principais)
        const allKeys = Object.keys(localStorage);
        saveData.otherData = {};
        
        allKeys.forEach(key => {
            if (!['capturados', 'pokedex', 'dinheiro', 'lastExport'].includes(key)) {
                try {
                    saveData.otherData[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    saveData.otherData[key] = localStorage.getItem(key);
                }
            }
        });
        
        // 3. Criar conteúdo formatado para TXT
        const exportContent = criarConteudoTXT(saveData);
        
        // 4. Criar e baixar arquivo
        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const timestamp = new Date().toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '');
        
        a.href = url;
        a.download = `pokemon-backup-${timestamp}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 5. Salvar data do último export
        localStorage.setItem('lastExport', new Date().toISOString());
        
        // 6. Atualizar interface
        updateLastSaveDisplay();
        showSaveMessage('💾 Backup criado com sucesso!', 'success');
        
        // 7. Atualizar tooltip
        const tooltip = document.getElementById('exportInfo');
        if (tooltip) {
            tooltip.textContent = `Baixado: ${new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
            tooltip.style.color = '#4CAF50';
        }
        
        console.log('Exportação realizada:', saveData.metadata);
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showSaveMessage('❌ Erro ao exportar progresso', 'error');
    }
}

// ===== FUNÇÕES AUXILIARES (mantidas) =====
// Atualizar display do último salvamento
function updateLastSaveDisplay() {
    const lastSaveElement = document.getElementById('lastSave');
    const statusElement = document.getElementById('saveStatus');
    
    const lastSave = localStorage.getItem('lastExport');
    
    if (lastSave) {
        // Formatar data
        const date = new Date(lastSave);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + 
                             date.toLocaleTimeString('pt-BR', { 
                                 hour: '2-digit', 
                                 minute: '2-digit' 
                             });
        
        lastSaveElement.textContent = formattedDate;
        lastSaveElement.style.color = '#4CAF50';
        
        // Calcular há quanto tempo foi salvo
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) {
            statusElement.textContent = '🟢 Salvo recentemente';
            statusElement.style.color = '#4CAF50';
        } else if (diffHours < 24) {
            const hoursText = diffHours === 1 ? '1 hora atrás' : `${diffHours} horas atrás`;
            statusElement.textContent = `🟡 ${hoursText}`;
            statusElement.style.color = '#FF9800';
        } else {
            const diffDays = Math.floor(diffHours / 24);
            const daysText = diffDays === 1 ? '1 dia atrás' : `${diffDays} dias atrás`;
            statusElement.textContent = `🔴 ${daysText}`;
            statusElement.style.color = '#f44336';
        }
    } else {
        lastSaveElement.textContent = 'Nenhum';
        lastSaveElement.style.color = '#666';
        statusElement.textContent = '🔴 Offline';
        statusElement.style.color = '#666';
    }
}

// Criar conteúdo formatado para TXT
function criarConteudoTXT(data) {
    const metadata = data.metadata;
    const exportDate = new Date(metadata.exportDate);
    
    let txt = '';
    
    // Cabeçalho
    txt += '='.repeat(50) + '\n';
    txt += 'BACKUP DO JOGO POKÉMON\n';
    txt += '='.repeat(50) + '\n\n';
    
    // Informações gerais
    txt += `Data do Backup: ${exportDate.toLocaleString('pt-BR')}\n`;
    txt += `Pokémons Capturados: ${metadata.totalPokemons}\n`;
    txt += `Pokédex Registrados: ${metadata.pokedexCount}\n`;
    txt += `Dinheiro: ¥${metadata.money}\n\n`;
    
    // Lista de Pokémons Capturados
    txt += '-' .repeat(25) + '\n';
    txt += 'POKÉMONS CAPTURADOS:\n';
    txt += '-' .repeat(25) + '\n';
    
    if (metadata.totalPokemons > 0) {
        Object.values(data.capturados).forEach((pokemon, index) => {
            txt += `${index + 1}. ${pokemon.name} (${pokemon.rarity})\n`;
        });
    } else {
        txt += 'Nenhum Pokémon capturado\n';
    }
    
    txt += '\n';
    
    // Lista da Pokédex
    txt += '-' .repeat(25) + '\n';
    txt += 'POKÉDEX:\n';
    txt += '-' .repeat(25) + '\n';
    
    const pokedexList = Object.keys(data.pokedex).filter(name => data.pokedex[name]);
    if (pokedexList.length > 0) {
        txt += `Total: ${pokedexList.length}\n`;
        txt += `Lista: ${pokedexList.join(', ')}\n`;
    } else {
        txt += 'Pokédex vazia\n';
    }
    
    txt += '\n';
    
    // Dados em formato JSON (para importação)
    txt += '='.repeat(50) + '\n';
    txt += 'DADOS PARA IMPORTAR (JSON):\n';
    txt += '='.repeat(50) + '\n\n';
    
    // Criar objeto simplificado para exportação
    const exportObj = {
        capturados: data.capturados,
        pokedex: data.pokedex,
        dinheiro: data.dinheiro,
        otherData: data.otherData,
        metadata: metadata
    };
    
    txt += JSON.stringify(exportObj, null, 2);
    
    return txt;
}

// Manipular importação de arquivo
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        importarProgresso(e.target.result, file.name);
    };
    
    reader.onerror = function() {
        showSaveMessage('❌ Erro ao ler arquivo', 'error');
    };
    
    reader.readAsText(file);
    
    // Resetar input
    event.target.value = '';
}

// Função de importação
function importarProgresso(fileContent, fileName) {
    // Pedir confirmação
    if (!confirm('⚠️ ATENÇÃO!\n\nImportar dados irá SOBRESCREVER seu progresso atual.\nDeseja continuar?')) {
        return;
    }
    
    try {
        // Tentar extrair JSON do arquivo
        let jsonData;
        
        // Verificar se o arquivo é um JSON direto
        try {
            jsonData = JSON.parse(fileContent);
        } catch {
            // Tentar encontrar JSON dentro do texto
            const jsonMatch = fileContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Arquivo inválido: não contém dados JSON');
            }
            jsonData = JSON.parse(jsonMatch[0]);
        }
        
        // Validar dados mínimo
        if (!jsonData.capturados || !jsonData.pokedex || !jsonData.metadata) {
            throw new Error('Arquivo de backup inválido ou incompleto');
        }
        
        // 1. Limpar dados atuais
        localStorage.removeItem('capturados');
        localStorage.removeItem('pokedex');
        localStorage.removeItem('dinheiro');
        
        // 2. Salvar novos dados
        localStorage.setItem('capturados', JSON.stringify(jsonData.capturados));
        localStorage.setItem('pokedex', JSON.stringify(jsonData.pokedex));
        localStorage.setItem('dinheiro', jsonData.dinheiro.toString());
        
        // 3. Salvar outras dados
        if (jsonData.otherData) {
            Object.keys(jsonData.otherData).forEach(key => {
                const value = jsonData.otherData[key];
                localStorage.setItem(key, 
                    typeof value === 'object' ? JSON.stringify(value) : value
                );
            });
        }
        
        // 4. Atualizar data do backup
        localStorage.setItem('lastExport', jsonData.metadata.exportDate);
        
        // 5. Atualizar variáveis globais (se existirem)
        if (typeof capturados !== 'undefined') {
            capturados = jsonData.capturados;
        }
        if (typeof pokedex !== 'undefined') {
            pokedex = jsonData.pokedex;
        }
        if (typeof dinheiro !== 'undefined') {
            dinheiro = jsonData.dinheiro;
        }
        
        // 6. Atualizar interface
        updateLastSaveDisplay();
        
        if (typeof updateCaptured === 'function') {
            updateCaptured();
        }
        if (typeof updatePokedex === 'function') {
            updatePokedex();
        }
        if (typeof updateStore === 'function') {
            updateStore();
        }
        
        // 7. Mostrar mensagem de sucesso
        const importDate = new Date(jsonData.metadata.exportDate).toLocaleDateString('pt-BR');
        showSaveMessage(`✅ Progresso importado! (Backup: ${importDate})`, 'success');
        
        // 8. Atualizar tooltip
        const tooltip = document.getElementById('importInfo');
        tooltip.textContent = `Importado: ${new Date().toLocaleTimeString('pt-BR')}`;
        tooltip.style.color = '#2196F3';
        
        console.log('Importação realizada:', jsonData.metadata);
        
    } catch (error) {
        console.error('Erro na importação:', error);
        showSaveMessage(`❌ Erro: ${error.message}`, 'error');
    }
}

// Mostrar mensagens temporárias
function showSaveMessage(message, type) {
    // Remover mensagens antigas
    const oldMessages = document.querySelectorAll('.save-notification');
    oldMessages.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const notification = document.createElement('div');
    notification.className = `save-notification save-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
        <span class="notification-text">${message}</span>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
    }
    
    // Adicionar animação CSS
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-icon { font-size: 18px; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Configurar botão de limpar progresso
document.getElementById('limparProgresso').addEventListener('click', function() {
    limparProgresso();
});

// Função para limpar progresso
function limparProgresso() {
    // Confirmar ação (com mensagem mais alarmante)
    if (!confirm('⚠️⚠️⚠️ ALERTA CRÍTICO! ⚠️⚠️⚠️\n\n' +
                 'Isso irá APAGAR PERMANENTEMENTE:\n' +
                 '• Todos os Pokémons capturados\n' +
                 '• Todo o progresso da Pokédex\n' +
                 '• Todo o dinheiro acumulado\n' +
                 '• Todas as datas de salvamento\n\n' +
                 'Esta ação NÃO pode ser desfeita!')) {
        return;
    }
    
    // Pedir confirmação extra com palavra-chave
    const userInput = prompt('Para confirmar a exclusão total, digite APAGAR:');
    
    if (userInput !== 'APAGAR') {
        showSaveMessage('❌ Limpeza cancelada', 'error');
        return;
    }
    
    try {
        // Lista de dados a serem mantidos (opcional)
        const dadosParaManter = [];
        
        // Coletar todas as keys do localStorage
        const todasKeys = Object.keys(localStorage);
        
        // Criar backup antes de limpar (opcional)
        const backupData = {};
        todasKeys.forEach(key => {
            try {
                backupData[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                backupData[key] = localStorage.getItem(key);
            }
        });
        
        // Salvar backup temporário (opcional, por segurança)
        sessionStorage.setItem('backupAntesDeLimpar', JSON.stringify(backupData));
        
        // Limpar dados específicos
        localStorage.removeItem('capturados');
        localStorage.removeItem('pokedex');
        localStorage.removeItem('dinheiro');
        localStorage.removeItem('lastExport');
        localStorage.removeItem('lastImport');
        
        // Resetar variáveis globais (se existirem)
        if (typeof capturados !== 'undefined') {
            capturados = {};
        }
        if (typeof pokedex !== 'undefined') {
            pokedex = {};
        }
        if (typeof dinheiro !== 'undefined') {
            dinheiro = 0;
        }
        
        // Atualizar interface
        updateLastSaveDisplay();
        
        if (typeof updateCaptured === 'function') {
            updateCaptured();
        }
        if (typeof updatePokedex === 'function') {
            updatePokedex();
        }
        if (typeof updateStore === 'function') {
            updateStore();
        }
        if (typeof atualizarDinheiro === 'function') {
            atualizarDinheiro();
        }
        
        // Mostrar mensagem de sucesso
        showSaveMessage('✅ Progresso limpo com sucesso!', 'success');
        
        // Atualizar tooltip
        const tooltip = document.getElementById('clearInfo');
        tooltip.textContent = `Limpo: ${new Date().toLocaleTimeString('pt-BR')}`;
        tooltip.style.color = '#f44336';
        
    } catch (error) {
        console.error('Erro ao limpar progresso:', error);
        showSaveMessage('❌ Erro ao limpar progresso', 'error');
    }
}

// Adicionar ao evento DOMContentLoaded (se já tiver um)
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar confirmação extra no hover
    const clearBtn = document.getElementById('limparProgresso');
    if (clearBtn) {
        clearBtn.addEventListener('mouseenter', function() {
            const tooltip = document.getElementById('clearInfo');
            if (tooltip) {
                tooltip.style.color = '#f44336';
                tooltip.style.fontWeight = 'bold';
                tooltip.textContent = '⚠️ CUIDADO! Remove todos os dados';
            }
        });
        
        clearBtn.addEventListener('mouseleave', function() {
            const tooltip = document.getElementById('clearInfo');
            if (tooltip) {
                tooltip.style.fontWeight = 'normal';
                tooltip.textContent = 'Limpa todos os dados salvos';
            }
        });
    }
});

// ============================================
//                    Áudio
// ============================================
// ===== CONTROLE SIMPLES DE MÚSICA =====
// 1. Criar elemento de áudio
const musica = new Audio('/NickJogos/Music/MusicPokemon/Pallet Town.mp3');
musica.loop = true; // Tocar em loop
musica.volume = 0.07; // Volume inicial 7%

// 2. Configurar controles
document.addEventListener('DOMContentLoaded', function() {
    const volumeSlider = document.getElementById('musicVolume');
    const volumeDisplay = document.getElementById('musicValue');
    
    if (volumeSlider && volumeDisplay) {
        // Volume fixo em 7%
        volumeSlider.value = 7;
        volumeDisplay.textContent = '7%';
        
        // Evento para alterar volume (apenas na sessão atual)
        volumeSlider.addEventListener('input', function() {
            const novoVolume = parseInt(this.value);
            musica.volume = novoVolume / 100;
            volumeDisplay.textContent = novoVolume + '%';
            // NÃO salva no localStorage
        });
    }
    
    // Iniciar música com delay
    setTimeout(() => {
        musica.play().catch(error => {
        });
    }, 500);
});

// 3. Iniciar música ao clicar em qualquer lugar
document.addEventListener('click', function iniciarMusica() {
    if (musica.paused) {
        musica.play();
    }
    // Remover após primeira interação
    document.removeEventListener('click', iniciarMusica);
}, { once: true });

// ============================================
//                    Gráficos
// ============================================
// ===== ZOOM SIMPLES COM 3 ESTÁGIOS =====
const zoomNiveis = [
    { scale: 0.8, status: 'Reduzido --' },
    { scale: 0.9, status: 'Reduzido -' },
    { scale: 1, status: 'Normal' },
    { scale: 1.1, status: 'Aumentado +' },
    { scale: 1.2, status: 'Aumentado ++' }
];

let zoomAtual = 2; // Começa no Normal

function aumentarZoom() {
    if (zoomAtual < zoomNiveis.length - 1) {
        zoomAtual++;
        aplicarZoomAtual();
    }
}

function diminuirZoom() {
    if (zoomAtual > 0) {
        zoomAtual--;
        aplicarZoomAtual();
    }
}

function aplicarZoomAtual() {
    const gameContainer = document.querySelector('#game-container');
    const nivel = zoomNiveis[zoomAtual];
    
    if (!gameContainer) return;
    
    gameContainer.style.transform = `scale(${nivel.scale})`;
    gameContainer.style.transformOrigin = 'center center';
    gameContainer.style.transition = 'transform 0.3s ease';
    
    const zoomStatus = document.getElementById('zoomStatus');
    if (zoomStatus) zoomStatus.textContent = nivel.status;
    
    // Atualizar estado dos botões
    const btnMais = document.getElementById('btnZoomMais');
    const btnMenos = document.getElementById('btnZoomMenos');
    
    if (btnMais) btnMais.disabled = zoomAtual === zoomNiveis.length - 1;
    if (btnMenos) btnMenos.disabled = zoomAtual === 0;
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    aplicarZoomAtual();
});
// Função para tela cheia (mantida simples)
function alternarTelaCheia() {
    const btn = document.getElementById('btnTelaCheia');
    const status = document.getElementById('fullscreenStatus');
    
    if (!document.fullscreenElement) {
        // Entrar em tela cheia
        document.documentElement.requestFullscreen()
            .then(() => {
                if (btn) btn.textContent = 'Sair Tela Cheia';
                if (status) {
                    status.textContent = 'Ativo';
                    status.style.color = '#4CAF50';
                }
            });
    } else {
        // Sair da tela cheia
        document.exitFullscreen()
            .then(() => {
                if (btn) btn.textContent = 'Tela Cheia';
                if (status) {
                    status.textContent = 'Normal';
                    status.style.color = '#666';
                }
            });
    }
}

// Se quiser uma versão ainda mais simples e direta:
function autoSelecionarPlataformaSimples() {
    const select = document.getElementById('tipoPlataforma');
    if (!select) return;
    
    // Lógica direta: se a largura for menor que 450px OU altura menor que 750px
    if (window.innerWidth < 450 || window.innerHeight < 750) {
        select.value = 'mobile';
    } else {
        select.value = 'desktop';
    }
    
    // Dispara evento
    const event = new Event('change');
    select.dispatchEvent(event);
}

// Versão alternativa usando matchMedia (recomendada)
function autoSelecionarPlataformaMediaQuery() {
    const select = document.getElementById('tipoPlataforma');
    if (!select) return;
    
    // Media query para dispositivos móveis
    const mediaQuery = window.matchMedia('(max-width: 450px), (max-height: 750px)');
    
    // Verifica se a media query corresponde
    if (mediaQuery.matches) {
        select.value = 'mobile';
    } else {
        select.value = 'desktop';
    }
    
    // Dispara evento
    const event = new Event('change');
    select.dispatchEvent(event);
    
    // Escuta mudanças na media query (se o usuário redimensionar)
    mediaQuery.addEventListener('change', function(e) {
        if (e.matches) {
            select.value = 'mobile';
        } else {
            select.value = 'desktop';
        }
        const event = new Event('change');
        select.dispatchEvent(event);
    });
}

// Alternar entre desktop e mobile
const boxControls = document.getElementById('boxControls');

document.getElementById('tipoPlataforma').addEventListener('change', function() {
    const isMobile = this.value === 'mobile';
    const gameContainer = document.getElementById('game-container');
    
    // Remove todas as classes de layout primeiro
    gameContainer.classList.remove('desktop-layout', 'mobile-layout');
    
    // Adiciona a classe correspondente
    if (isMobile) {
        gameContainer.classList.add('mobile-layout');
    } else {
        gameContainer.classList.add('desktop-layout');
        boxControls.style.display = '';       // volta ao normal
    }
});