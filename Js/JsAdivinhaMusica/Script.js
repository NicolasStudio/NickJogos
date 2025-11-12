// Constantes e configurações
const GAME_CONFIG = {
  totalMusicas: 10,
  pontosPorAcerto: 10,
  tentativasIniciais: 3,
  mensagensResultado: [
    { texto: 'Você pelo visto nunca jogou nada', img: 0 },
    { texto: 'Você pelo visto jogou poucos jogos ou tem pouca memória', img: 1 },
    { texto: 'Você pelo visto é um jogador casual, nem pouco, nem muito, o suficiente', img: 2 },
    { texto: 'Você pelo visto é um jogador acima da média, meus parabéns', img: 3 },
    { texto: 'Você pelo visto é um gamer fantástico, conhece tudo. Meus parabéns!!!', img: 4 }
  ],
  faixasPontuacao: [0, 10, 50, 70, 100]
};

// Dados do jogo
const musicas = [
  { title: 'Green Hill Zone',         jogo: 'Sonic',           src: '/NickJogos/Music/Sonic%20The%20Hedgehog%20-%20Green%20Hill%20Zone.mp3'
, numero: '1' },
  { title: 'Theme Super Mario Bros.', jogo: 'Super Mario',     src: '/NickJogos/Music/Super Mario Bros. - Theme.mp3',            numero: '2' },
  { title: 'Riders on the Storm',     jogo: 'Need for speed',  src: '/NickJogos/Music/Riders on the Storm.mp3',                  numero: '3' },
  { title: 'Top Gear - Theme',        jogo: 'Top Gear',        src: '/NickJogos/Music/Top Gear - Theme.mp3',                     numero: '4' },
  { title: 'Bully - Theme',           jogo: 'Bully',           src: '/NickJogos/Music/Bully - Theme.mp3',                        numero: '5' },
  { title: 'The Last of Us',          jogo: 'The last of us',  src: '/NickJogos/Music/The Last of Us.mp3',                       numero: '6' },
  { title: 'Crash Bandicoot',         jogo: 'Crash',           src: '/NickJogos/Music/Crash Bandicoot.mp3',                      numero: '7' },
  { title: 'Gta San Andreas',         jogo: 'Gta San Andreas', src: '/NickJogos/Music/Gta San Andreas.mp3',                      numero: '8' },
  { title: 'Aerokid - Habbo',         jogo: 'Habbo',           src: '/NickJogos/Music/Aerokid - Habbo.mp3',                      numero: '9' },
  { title: 'Super Bomberman',         jogo: 'Super Bomberman', src: '/NickJogos/Music/Super Bomberman.mp3',                      numero: '10' }
];

// Estado do jogo - CORREÇÃO: ÚNICA declaração
let gameState = {
  indexMusica: 0,
  pontos: 0,
  tentativas: GAME_CONFIG.tentativasIniciais,
  respostaCorreta: '',
  volume: 0.7,
  isMuted: false,
  musicaElement: null,
  elementosUI: {
    duracaoMusica: null,
    numeroMusica: null,
    barraProgresso: null,
    tempoAtual: null,
    inputResposta: null
  }
};

// Inicialização do jogo
function initGame() {
  console.log('Inicializando jogo...');
  
  // Inicializar elementos DOM
  gameState.musicaElement = document.querySelector('.audio');
  gameState.elementosUI.duracaoMusica = document.querySelector('.fim');
  gameState.elementosUI.numeroMusica = document.querySelector('.numMusica');
  gameState.elementosUI.barraProgresso = document.querySelector('progress');
  gameState.elementosUI.tempoAtual = document.querySelector('.inicio');
  gameState.elementosUI.inputResposta = document.querySelector('.texto');

  // Verificar se todos os elementos essenciais existem
  if (!gameState.musicaElement) {
    console.error('Elemento de áudio não encontrado!');
    return;
  }

  // ✅ Captura Enter no campo de texto
  if (gameState.elementosUI.inputResposta) {
    gameState.elementosUI.inputResposta.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        verificarResposta(e);
      }
    });
  }

  setupEventListeners();
  setupVolumeControl();
  renderizarMusica(gameState.indexMusica);
}

// Configura listeners CORRIGIDOS
function setupEventListeners() {
  // Usar querySelector mais específicos para evitar conflitos
  const playBtn = document.querySelector('.boxPlay');
  const pauseBtn = document.querySelector('.boxPause');
  const stopBtn = document.querySelector('.boxStop');
  const skipBtn = document.querySelector('.pular');
  const confirmBtn = document.querySelector('.confirmar');

  if (playBtn) playBtn.addEventListener('click', tocarMusica);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseMusica);
  if (stopBtn) stopBtn.addEventListener('click', pararMusica);
  if (skipBtn) skipBtn.addEventListener('click', pularMusica);
  if (confirmBtn) confirmBtn.addEventListener('click', verificarResposta);
  
  if (gameState.musicaElement) {
    gameState.musicaElement.addEventListener('timeupdate', atualizarBarra);
    gameState.musicaElement.addEventListener('error', function(e) {
      console.error('Erro no áudio:', e);
      console.log('Src atual:', gameState.musicaElement.src);
    });
  }
}

// Controle de Volume
function setupVolumeControl() {
  const volumeSlider = document.querySelector('.volume-slider');
  const volumeBtn = document.querySelector('.volume-btn');
  const volumeIcon = document.querySelector('.volume-icon');
  
  // Se os elementos de volume não existirem, sair silenciosamente
  if (!volumeSlider || !volumeBtn || !volumeIcon) {
    console.log('Elementos de volume não encontrados - continuando sem controle de volume');
    return;
  }
  
  // Configurar volume inicial
  volumeSlider.value = gameState.volume;
  if (gameState.musicaElement) {
    gameState.musicaElement.volume = gameState.volume;
  }
  
  // Event listener para o slider de volume
  volumeSlider.addEventListener('input', function() {
    const newVolume = parseFloat(this.value);
    gameState.volume = newVolume;
    gameState.isMuted = false;
    
    if (gameState.musicaElement) {
      gameState.musicaElement.volume = newVolume;
    }
    
    updateVolumeIcon(newVolume, volumeIcon);
    console.log('Volume alterado para:', newVolume);
  });
  
  // Event listener para o botão de mute
  volumeBtn.addEventListener('click', function() {
    toggleMute(volumeIcon, volumeSlider);
  });
}

function toggleMute(volumeIcon, volumeSlider) {
  if (gameState.musicaElement) {
    gameState.isMuted = !gameState.isMuted;
    
    if (gameState.isMuted) {
      gameState.musicaElement.volume = 0;
      if (volumeSlider) volumeSlider.value = 0;
      updateVolumeIcon(0, volumeIcon);
    } else {
      gameState.musicaElement.volume = gameState.volume;
      if (volumeSlider) volumeSlider.value = gameState.volume;
      updateVolumeIcon(gameState.volume, volumeIcon);
    }
    
    console.log('Mute:', gameState.isMuted);
  }
}

function updateVolumeIcon(volume, volumeIcon) {
  if (!volumeIcon) return;
  
  let pathData = '';
  
  if (volume === 0 || gameState.isMuted) {
    pathData = '<path d="M6.717 3.55A.5.5 0 0 1 7.43 4.084L5.64 5.872 3.824 4.054a.5.5 0 1 1 .708-.708L6.168 5.2l1.747-1.746a.5.5 0 1 1 .708.708L6.88 5.92l1.747 1.747a.5.5 0 1 1-.708.708L6.168 6.628 4.532 8.264a.5.5 0 0 1-.708-.708L5.64 5.872 3.824 4.054a.5.5 0 0 1 0-.708l.353-.353a.5.5 0 0 1 .54-.11z"/>';
  } else if (volume < 0.3) {
    pathData = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11z"/>';
  } else if (volume < 0.7) {
    pathData = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11z"/>';
  } else {
    pathData = '<path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7.43 4.084L5.64 5.872 3.824 4.054a.5.5 0 1 1 .708-.708L6.168 5.2l1.747-1.746a.5.5 0 1 1 .708.708L6.88 5.92l1.747 1.747a.5.5 0 1 1-.708.708L6.168 6.628 4.532 8.264a.5.5 0 0 1-.708-.708L5.64 5.872 3.824 4.054a.5.5 0 0 1 0-.708l.353-.353a.5.5 0 0 1 .54-.11z"/>';
  }
  
  volumeIcon.innerHTML = pathData;
}

// Funções do player de música
function tocarMusica() {
  console.log('Tentando tocar música...');
  
  if (gameState.musicaElement && gameState.musicaElement.src) {
    gameState.musicaElement.play()
      .then(() => {
        console.log('Música tocando com sucesso!');
      })
      .catch(e => {
        console.error("Erro ao reproduzir música:", e);
      });
  } else {
    console.error('Elemento de áudio não encontrado ou sem src!');
  }
}

function pauseMusica() {
  if (gameState.musicaElement) {
    gameState.musicaElement.pause();
    console.log('Música pausada');
  }
}

function pararMusica() {
  if (gameState.musicaElement) {
    gameState.musicaElement.pause();
    gameState.musicaElement.currentTime = 0;
    console.log('Música parada');
  }
}

function pularMusica() {
  pararMusica();
  setTimeout(() => {
    gameState.indexMusica++;
    resetarTentativas();
    renderizarMusica(gameState.indexMusica);
    if (gameState.elementosUI.inputResposta) {
      gameState.elementosUI.inputResposta.value = '';
    }
    verificarFimDoJogo();
  }, 200);
}

// Renderização melhorada
function renderizarMusica(index) {
  if (index >= 0 && index < musicas.length) {
    const musicaAtual = musicas[index];
    console.log('Carregando música:', musicaAtual.title, musicaAtual.src);
    
    if (gameState.musicaElement) {
      // Remover listeners antigos para evitar acumulação
      gameState.musicaElement.removeEventListener('loadeddata', handleMusicaCarregada);
      
      // Configurar nova música
      gameState.musicaElement.src = musicaAtual.src;
      gameState.respostaCorreta = musicaAtual.jogo;
      
      // Adicionar novo listener
      gameState.musicaElement.addEventListener('loadeddata', handleMusicaCarregada);
      
      function handleMusicaCarregada() {
        console.log('Música carregada:', musicaAtual.title);
        if (gameState.elementosUI.numeroMusica) {
          gameState.elementosUI.numeroMusica.textContent = musicaAtual.numero;
        }
        if (gameState.elementosUI.duracaoMusica) {
          const duration = Math.floor(gameState.musicaElement.duration) || 0;
          gameState.elementosUI.duracaoMusica.textContent = segundosParaMinutos(duration);
        }
      }
      
      gameState.musicaElement.addEventListener('error', (e) => {
        console.error('Erro ao carregar música:', musicaAtual.src, e);
        alert(`Erro ao carregar a música: ${musicaAtual.title}. Verifique o caminho do arquivo.`);
      });
      
      // Pré-carregar a música
      gameState.musicaElement.load();
    }
  } else {
    console.log('Índice de música inválido:', index);
  }
}

function verificarResposta(e) {
  if (e) e.preventDefault();
  
  if (!gameState.elementosUI.inputResposta) {
    console.error('Campo de resposta não encontrado');
    return;
  }
  
  const respostaUsuario = gameState.elementosUI.inputResposta.value.trim().toLowerCase();
  
  if (!respostaUsuario) {
    alert('Por favor, digite uma resposta!');
    return;
  }
  
  const respostaCorreta = gameState.respostaCorreta.trim().toLowerCase();
  
  if (respostaUsuario === respostaCorreta) {
    handleAcerto();
  } else {
    handleErro();
  }
}

function handleAcerto() {
  alert('Você acertou!!! Ganhou 10 Pontos!');
  gameState.pontos += GAME_CONFIG.pontosPorAcerto;
  pararMusica();
  
  setTimeout(() => {
    gameState.indexMusica++;
    resetarTentativas();
    if (gameState.indexMusica < musicas.length) {
      renderizarMusica(gameState.indexMusica);
    }
    if (gameState.elementosUI.inputResposta) {
      gameState.elementosUI.inputResposta.value = '';
    }
    verificarFimDoJogo();
  }, 500);
}

function handleErro() {
  gameState.tentativas--;
  alert('Errou!!! Suas tentativas restantes: ' + gameState.tentativas);
  
  if (gameState.tentativas === 0) {
    setTimeout(() => {
      alert('Você errou e gastou suas tentativas para essa música');
      gameState.indexMusica++;
      resetarTentativas();
      if (gameState.indexMusica < musicas.length) {
        renderizarMusica(gameState.indexMusica);
      }
      if (gameState.elementosUI.inputResposta) {
        gameState.elementosUI.inputResposta.value = '';
      }
      verificarFimDoJogo();
    }, 300);
  }
}

function resetarTentativas() {
  gameState.tentativas = GAME_CONFIG.tentativasIniciais;
}

function atualizarBarra() {
  if (gameState.musicaElement && gameState.elementosUI.barraProgresso && gameState.elementosUI.tempoAtual) {
    const progresso = (gameState.musicaElement.currentTime / gameState.musicaElement.duration) * 100;
    gameState.elementosUI.barraProgresso.style.width = `${Math.floor(progresso)}%`;
    gameState.elementosUI.tempoAtual.textContent = 
      segundosParaMinutos(Math.floor(gameState.musicaElement.currentTime));
  }
}

function segundosParaMinutos(segundos) {
  if (isNaN(segundos)) return '0:00';
  
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
}

function verificarFimDoJogo() {
  if (gameState.indexMusica >= musicas.length) {
    console.log('Fim do jogo! Pontuação:', gameState.pontos);
    salvarResultado();
    window.location.assign('resultadoAdivinhaMusica.html');
  }
}

function salvarResultado() {
  const { mensagem, imgIndex } = determinarMensagemResultado();
  window.localStorage.setItem('acertos', gameState.pontos);
  window.localStorage.setItem('mensagem', mensagem);
  window.localStorage.setItem('num', imgIndex);
}

function determinarMensagemResultado() {
  const { mensagensResultado, faixasPontuacao } = GAME_CONFIG;
  const pontuacao = gameState.pontos;
  
  for (let i = faixasPontuacao.length - 1; i >= 0; i--) {
    if (pontuacao >= faixasPontuacao[i]) {
      return {
        mensagem: mensagensResultado[i].texto,
        imgIndex: mensagensResultado[i].img
      };
    }
  }
  
  return {
    mensagem: mensagensResultado[0].texto,
    imgIndex: mensagensResultado[0].img
  };
}

// Inicia o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado - Iniciando jogo...');
  initGame();
});