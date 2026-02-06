// ===== CONFIGURAÇÃO DO PLAYER =====
PLAYER_TILE_SIZE = 16;
const PLAYER_SIZE = 24;
const moveDelay = 20;

let playerPos = { x: 24, y: 23 }; // posição inicial
let canMove = true;

// ===== RENDERIZAÇÃO DO PLAYER =====
function renderPlayer() {
  const mapElement = document.getElementById("map");
  let player = document.getElementById("player");

  if (!player) {
    player = document.createElement("img");
    player.id = "player";
    player.src = "/NickJogos/Img/ImagemPokemon/Player1.png";
    player.classList.add("player-sprite");
    mapElement.appendChild(player);
  }

  player.style.position = "absolute";
  player.style.width = `${PLAYER_SIZE}px`;
  player.style.height = `${PLAYER_SIZE}px`;
  player.style.left = `${playerPos.x * PLAYER_TILE_SIZE  + (PLAYER_TILE_SIZE  - PLAYER_SIZE)/2}px`;
  player.style.top  = `${playerPos.y * PLAYER_TILE_SIZE  + (PLAYER_TILE_SIZE  - PLAYER_SIZE)/2}px`;
  player.style.zIndex = "10";
}

// ===== MOVIMENTO PELO TECLADO =====
function handleMovement(e) {
  if (!canMove) return;

  const directions = {
    ArrowUp:    { x: 0, y: -1 },
    ArrowDown:  { x: 0, y: 1 },
    ArrowLeft:  { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  const dir = directions[e.key];
  if (!dir) return;

  e.preventDefault(); // bloqueia scroll da página
  movePlayer(dir);
}

function moverPlayer(direcao) {
    
    // Implementação básica - ajuste conforme seu jogo
    const player = document.getElementById('player');
    if (!player) return;
    
    const velocidade = 10; // pixels por movimento
    let x = parseInt(player.style.left || 0);
    let y = parseInt(player.style.top || 0);
    
    switch(direcao.toLowerCase()) {
        case 'cima':
        case 'up':
            y -= velocidade;
            break;
        case 'baixo':
        case 'down':
            y += velocidade;
            break;
        case 'esquerda':
        case 'left':
            x -= velocidade;
            break;
        case 'direita':
        case 'right':
            x += velocidade;
            break;
    }
    
    // Limita os movimentos dentro da tela/jogo
    x = Math.max(0, Math.min(x, window.innerWidth - 50));
    y = Math.max(0, Math.min(y, window.innerHeight - 50));
    
    player.style.left = x + 'px';
    player.style.top = y + 'px';
    
}

document.addEventListener("keydown", handleMovement);

window.addEventListener("keydown", function(e) {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault(); // bloqueia scroll
    moverPlayer(e.key); // sua função de movimento
  }
});

// ===== MOVIMENTO PELOS BOTÕES =====
document.getElementById("move-up-btn").addEventListener("click", () => movePlayer({ x: 0, y: -1 }));
document.getElementById("move-down-btn").addEventListener("click", () => movePlayer({ x: 0, y: 1 }));
document.getElementById("move-left-btn").addEventListener("click", () => movePlayer({ x: -1, y: 0 }));
document.getElementById("move-right-btn").addEventListener("click", () => movePlayer({ x: 1, y: 0 }));

// ===== FUNÇÃO DE MOVIMENTO =====
function movePlayer(dir) {
  const newX = playerPos.x + dir.x;
  const newY = playerPos.y + dir.y;

  if (isWalkable(newX, newY)) {
    playerPos.x = newX;
    playerPos.y = newY;
    renderPlayer();
    
    // Limpa encontro usando a função global
    if (typeof clearEncounter === 'function') {
        clearEncounter();
    }

    // ===== TELEPORTE =====
    const tile = collisionMap[newY][newX];
    if (tile === "tp") {
      trocarMapa("Praia.png", 15, 30); // Teleporte da Floresta para Praia
    } else if (tile === "tf") {
      trocarMapa("RotaFloresta.png", 15, 1); // Teleporte da Praia para Floresta
    } else if (tile === "tc") {
      trocarMapa("Caverna.png", 16, 28);    // Teleporte da Praia para Caverna
    } else if (tile === "tp2") {
      trocarMapa("Praia.png", 16, 6);       // Teleporte da Caverna para praia
    } else if (tile === "rb") {
      trocarMapa("RotaBosque.png", 1, 13);  // Teleporte da Caverna para Rota Bosque
    } else if (tile === "tc2") {
      trocarMapa("Caverna.png", 30, 13);    // Teleporte da Rota bosque para Caverna
    } else if (tile === "rb4") {
      trocarMapa("RotaBosque.png", 26, 13); // Teleporte da Cemitério para Rota bosque
    } else if (tile === "c") {
      trocarMapa("Cemiterio.png", 15, 29);  // Teleporte da Rota bosque para Cemitério
    } else if (tile === "rb2") {
      trocarMapa("RotaBosque.png", 9, 10); // Teleporte da Casa dos eletricos para Rota bosque
    } else if (tile === "e") {
      trocarMapa("CasadosEletricos.png", 3, 29);  // Teleporte da Rota bosque para Casa dos eletricos
    } else if (tile === "rb3") {
      trocarMapa("RotaBosque.png", 3, 6); // Teleporte da Casa dos eletricos para Rota bosque
    } else if (tile === "e2") {
      trocarMapa("CasadosEletricos.png", 2, 13);  // Teleporte da Rota bosque para Casa dos eletricos
    } else if (tile === "rb5") {
      trocarMapa("RotaBosque.png", 20, 5);  // Teleporte da Rota 003 para Rota Bosque 
    } else if (tile === "r03") {
      trocarMapa("Rota003.png", 15, 28);  // Teleporte da Rota bosque para Rota 003 
    } else if (tile === "r04") {
      trocarMapa("Rota004.png", 27, 28);  // Teleporte da Rota 003 para Rota 004 - Sentido vulcão
    } else if (tile === "r03.2") {
      trocarMapa("Rota003.png", 5, 5);  // Teleporte da Rota 004 para Rota 003 - Voltado do vulcão
    } else if (tile === "f") {
      trocarMapa("CavernaFogo.png", 16, 29);  // Teleporte da Rota 004 para o Vulcão
    } else if (tile === "r04.2") {
      trocarMapa("Rota004.png", 16 , 3);  // Teleporte do Vulcão para Rota 004
    } else if (tile === "r05") {
      trocarMapa("Rota005.png", 5, 5);  // Teleporte da Rota 003 para o Rota005
    } else if (tile === "r03.3") {
      trocarMapa("Rota003.png", 26 , 5);  // Teleporte da Rota005 para Rota 003
    } else if (tile === "ge") {
      trocarMapa("CavernaGelo.png", 14 , 6);  // Teleporte do Rota 005 para Caverna Gelo
    } else if (tile === "r05.2") {
      trocarMapa("Rota005.png", 15 , 11);  // Teleporte da Caverna Gelo para Rota 005  
    } else if (tile === "r06") {
      trocarMapa("Rota006.png", 29 , 5);  // Teleporte da Caverna para Rota 006
    } else if (tile === "tc3") {
      trocarMapa("Caverna.png", 1 , 13);  // Teleporte da Rota 006 para Caverna
    } else if (tile === "ts") {
      trocarMapa("Safari.png", 26 , 3);  // Teleporte da Rota 006 para Safari
    } else if (tile === "r06.2") {
      trocarMapa("Rota006.png", 5, 5);  // Teleporte do Safari rota Rota 006 
    } else if (tile === "r07") {
      trocarMapa("Rota007.png", 30, 3);  // Teleporte do Safari rota Rota 007 
    } else if (tile === "ts2") {
      trocarMapa("Safari.png", 1, 3);  // Teleporte do Rota 007 rota Safari superior
    } else if (tile === "ts3") {
      trocarMapa("Safari.png", 3, 20);  // Teleporte da Rota 007 para Safari
    } else if (tile === "r07.2") {
      trocarMapa("Rota007.png", 28, 20);// Teleporte do Safari rota  007
    } else if (tile === "tms") {
      trocarMapa("MapaSecreto.png", 15, 17); // Teleporte do mapa secreto
    } else if (tile === "tce") {
      trocarMapa("Cemiterio.png", 17, 14); // Teleporte do mapa secreto
    }

    // ===== MASTER BALL =====
    if (tile === "master") {
        const inventario = JSON.parse(localStorage.getItem("pokemonInventory")) || {};
        const masterBallColetada = localStorage.getItem("masterBallColetada") === "true";
        
        // Verifica se já pegou a Master Ball alguma vez
        if (masterBallColetada) {
            // Já pegou antes, não faz nada
            return;
        }
        
        // Marca que pegou a Master Ball
        localStorage.setItem("masterBallColetada", "true");
        
        // Adiciona ao inventário
        inventario.masterball = { count: 1, catchRate: 100 };
        localStorage.setItem("pokemonInventory", JSON.stringify(inventario));
        
        // Mostra mensagem
        if (dialogBox && dialogText) {
            dialogBox.style.display = "block";
            dialogContinue.style.display = "none";

            typeWriter("Você ganhou 1 MASTER BALL!", () => {
                setTimeout(() => {
                    if (dialogContinue) dialogContinue.style.display = "block";
                    setTimeout(() => {
                        clearDialog();
                    }, 3000);
                }, 500);
            });
        }
        
        // Muda o tile para não permitir pegar novamente
        setTimeout(() => {
            if (collisionMapCemiterio && collisionMapCemiterio[19]) {
                collisionMapCemiterio[19][15] = "g"; 
                trocarMapa("Cemiterio2.png"); 
            }
        }, 3000);
    }
          
        checkMission(tile);
        canMove = false;
        
        setTimeout(() => {
            // Verifica encontro usando a função global
            if (typeof checkEncounter === 'function') {
                checkEncounter();
            }
            
            canMove = true;
        }, moveDelay);
      }
    }


// ===== CHECAGEM DE COLISÃO =====
function isWalkable(x, y) {
  return (
    x >= 0 &&
    y >= 0 &&
    y < collisionMap.length &&
    x < collisionMap[0].length &&
    collisionMap[y][x] !== "x"
  );
}

// ===== Missões =====
const dialogBox = document.querySelector('.dialog-box');
const dialogText = document.getElementById('dialogTxt');
const dialogContinue = document.querySelector('.dialog-continue');

// Estado das travas (sem localStorage)
let travasDesbloqueadas = 0;
const totalTravas = 2;
let missionStatus = false;
let typingInterval = null;

// Array para controlar quais travas já foram desbloqueadas
const travas = {
    leste: false,
    oeste: false
};

function checkMission(tile) {
    // Verifica se é uma tile de trava válida
    const travaValida = tile === "pt1" || tile === "pt2";
    if (!travaValida) return;
    
    // Determina qual trava é esta
    const nomeTrava = tile === "pt1" ? "Leste" : "Oeste";
    const chaveTrava = tile === "pt1" ? "leste" : "oeste";
    
    // Verifica se já tem Pokémon suficientes
    const pokedexMission = JSON.parse(localStorage.getItem("pokedex")) || {};
    const quantidadeTrue = Object.values(pokedexMission).filter(v => v === true).length;
    
    if (quantidadeTrue >= 60) {
        // Se a missão já foi completada, não faz nada
        if (missionStatus) return;
        
        // Verifica se esta trava específica já foi desbloqueada
        if (!travas[chaveTrava]) {
            // Desbloqueia esta trava
            travas[chaveTrava] = true;
            travasDesbloqueadas++;
            
            // Para qualquer digitação em andamento
            if (typingInterval) clearInterval(typingInterval);
            
            dialogBox.style.display = "block";
            dialogContinue.style.display = "none";
            
            // Determina se é a primeira ou segunda trava
            let mensagem = "";
            if (travasDesbloqueadas === 1) {
                mensagem = `Primeira trava (${nomeTrava}) desbloqueada!`;
            } else if (travasDesbloqueadas === 2) {
                mensagem = `Segunda trava (${nomeTrava}) desbloqueada!\nTodas as travas foram liberadas!`;
            }
            
            // Efeito de máquina de escrever
            typeWriter(mensagem, () => {
                // Após terminar de digitar, mostra o indicador
                setTimeout(() => {
                    if (dialogContinue) dialogContinue.style.display = "block";
                }, 500);
                
                // Esconde tudo após 5 segundos
                setTimeout(() => {
                    clearDialog();
                }, 5000);
            });
            
            // Verifica se ambas as travas foram desbloqueadas
            if (travasDesbloqueadas === totalTravas && !missionStatus) {
                missionStatus = true;
                
                // Altera o mapa após um delay
                setTimeout(() => {
                    if (collisionMapCemiterio && collisionMapCemiterio[19]) {
                        collisionMapCemiterio[19][15] = "master"; 
                        console.log("Evento liberado no cemitério!");
                        
                        // Mostra mensagem final após 1 segundo
                        setTimeout(() => {
                            if (typingInterval) clearInterval(typingInterval);
                            
                            dialogBox.style.display = "block";
                            dialogContinue.style.display = "none";
                            
                            typeWriter("Algo misterioso aconteceu no cemitério...\nUma passagem secreta foi revelada!", () => {
                                setTimeout(() => {
                                    if (dialogContinue) dialogContinue.style.display = "block";
                                }, 500);
                                
                                setTimeout(() => {
                                    clearDialog();
                                }, 5000);
                            });
                            
                        }, 1000);
                    }
                }, 2000);
            }
            
        } else {
            // Esta trava já estava desbloqueada
            if (typingInterval) clearInterval(typingInterval);
            
            dialogBox.style.display = "block";
            dialogContinue.style.display = "none";
            
            typeWriter(`Trava ${nomeTrava} já estava desbloqueada.`, () => {
                setTimeout(() => {
                    if (dialogContinue) dialogContinue.style.display = "block";
                }, 500);
                
                setTimeout(() => {
                    clearDialog();
                }, 3000);
            });
        }
        
    } else {
        // Não tem pokémons suficientes
        if (typingInterval) clearInterval(typingInterval);
        
        dialogBox.style.display = "block";
        dialogContinue.style.display = "none";
        
        const faltam = 60 - quantidadeTrue;
        typeWriter(`Você precisa capturar mais ${faltam} Pokémon(s)\npara desbloquear as travas. (${quantidadeTrue}/60)`, () => {
            setTimeout(() => {
                if (dialogContinue) dialogContinue.display = "block";
            }, 500);
            
            setTimeout(() => {
                clearDialog();
            }, 5000);
        });
    }
}

// Função para verificar estado das travas
function getTravaStatus() {
    const pokedexMission = JSON.parse(localStorage.getItem("pokedex")) || {};
    const quantidadeTrue = Object.values(pokedexMission).filter(v => v === true).length;
    
    return {
        travas: {
            leste: travas.leste,
            oeste: travas.oeste
        },
        travasDesbloqueadas: travasDesbloqueadas,
        totalTravas: totalTravas,
        missionStatus: missionStatus,
        pokemonNecessarios: 45,
        pokemonAtuais: quantidadeTrue
    };
}

// Função para resetar as travas (para debug ou novo jogo)
function resetTravas() {
    travas.leste = false;
    travas.oeste = false;
    travasDesbloqueadas = 0;
    missionStatus = false;
    console.log("Travas resetadas!");
    
    // Também reseta a posição no mapa se necessário
    if (collisionMapCemiterio && collisionMapCemiterio[19]) {
        collisionMapCemiterio[19][15] = "x"; // ou o valor original
    }
}

// Funções auxiliares (mantém as mesmas)
function typeWriter(text, onComplete = null, speed = 50) {
    let i = 0;
    dialogText.textContent = "";
    
    typingInterval = setInterval(() => {
        if (i < text.length) {
            dialogText.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
        }
    }, speed);
}

function clearDialog() {
    if (dialogBox && dialogText) {
        if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
        }
        
        dialogText.textContent = "";
        dialogBox.style.display = "none";
        
        if (dialogContinue) {
            dialogContinue.style.display = "block";
        }
    }
}

// Função para debug (opcional)
function debugTravas() {
    const status = getTravaStatus();
    console.log("=== STATUS TRAVAS ===");
    console.log(`Pokémon: ${status.pokemonAtuais}/45`);
    console.log(`Trava Leste: ${status.travas.leste ? '✅' : '❌'}`);
    console.log(`Trava Oeste: ${status.travas.oeste ? '✅' : '❌'}`);
    console.log(`Travas desbloqueadas: ${status.travasDesbloqueadas}/2`);
    console.log(`Missão completa: ${status.missionStatus ? '✅' : '❌'}`);
}