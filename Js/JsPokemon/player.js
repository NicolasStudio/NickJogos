// ===== CONFIGURAÇÃO DO PLAYER =====
PLAYER_TILE_SIZE = 16;
const PLAYER_SIZE = 24;
const moveDelay = 200;

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

document.addEventListener("keydown", handleMovement);

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
    clearEncounter();

    // ===== TELEPORTE =====
    const tile = collisionMap[newY][newX];
    if (tile === "tp") {
      trocarMapa("Praia.png");
    } else if (tile === "tf") {
      trocarMapa("RotaFloresta.png");
    }

    canMove = false;
    checkEncounter();
    setTimeout(() => { canMove = true; }, moveDelay);
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
