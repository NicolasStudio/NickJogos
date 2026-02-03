// ===== CONFIGURAÇÃO DO PLAYER =====
PLAYER_TILE_SIZE = 16;
const PLAYER_SIZE = 24;
const moveDelay = 10;

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
    }


// horizontal - Vertical
    
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