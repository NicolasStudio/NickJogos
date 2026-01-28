// ===== CONFIGURAÇÃO =====
const TILE_SIZE = 32;
const mapElement = document.getElementById("map");
const moveDelay = 200;
let playerPos = { x: 1, y: 1 };
let canMove = true;

// ===== ESTADOS GLOBAIS =====
let pokedex = JSON.parse(localStorage.getItem("pokedex")) || {};
let capturados = JSON.parse(localStorage.getItem("capturados")) || {};
let dinheiro = JSON.parse(localStorage.getItem("dinheiro")) || 0;

// ===== MATRIZ DE COLISÃO =====
const collisionMap = [
  ["x","x","x","x","x","x","x","x","x","x"],
  ["p","p","p","p","p","p","p","p","p","p"],
  ["x","x","x","x","x","x","x","p","p","p"],
  ["p","p","p","x","g","g","g","g","g","g"],
  ["p","p","p","x","g","g","g","g","g","g"],
  ["x","x","x","x","g","g","g","g","g","g"],
  ["p","p","p","p","p","p","p","g","g","g"],
  ["x","x","x","x","x","x","x","g","g","g"],
  ["p","p","p","p","p","p","p","g","g","g"],
  ["p","p","p","p","p","p","p","p","p","p"],
  ["x","p","x","p","x","x","x","x","x","x"],
  ["p","p","p","p","p","p","p","p","p","p"],
  ["x","x","x","x","x","g","g","g","p","p"],
  ["p","p","p","p","p","g","g","g","x","x"],
  ["p","p","p","p","p","g","g","g","p","p"],
  ["x","x","p","p","x","x","x","x","x","x"],
  ["p","g","g","g","g","p","p","p","g","g"],
  ["g","g","g","g","p","g","g","g","g","p"],
  ["x","x","x","x","x","p","x","x","x","x"],
  ["x","x","x","x","x","p","x","x","x","x"]
];

// ===== MAPA =====
function renderMap() {
  mapElement.style.backgroundImage = 'url("/NickJogos/Img/ImagemPokemon/RotaFloresta.png")';
  mapElement.style.backgroundSize = 'cover';
  mapElement.style.backgroundPosition = 'center';
  mapElement.style.position = 'relative';
  mapElement.style.width = `${collisionMap[0].length * TILE_SIZE}px`;
  mapElement.style.height = `${collisionMap.length * TILE_SIZE}px`;
}
renderMap();

// ===== PERSONAGEM =====
function renderPlayer() {
  let player = document.getElementById("player");
  if (!player) {
    player = document.createElement("img");
    player.id = "player";
    player.src = "/NickJogos/Img/ImagemPokemon/Player1.png";
    player.classList.add("player-sprite");
    mapElement.appendChild(player);
  }
  player.style.position = "absolute";
  player.style.width = `${TILE_SIZE}px`;
  player.style.height = `${TILE_SIZE}px`;
  player.style.left = `${playerPos.x * TILE_SIZE}px`;
  player.style.top = `${playerPos.y * TILE_SIZE}px`;
  player.style.zIndex = "10";
}
renderPlayer();

// ===== MOVIMENTO =====
document.addEventListener("keydown", handleMovement);

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

  const newX = playerPos.x + dir.x;
  const newY = playerPos.y + dir.y;

  if (isWalkable(newX, newY)) {
    playerPos = { x: newX, y: newY };
    renderPlayer();
    clearEncounter();

    canMove = false;
    checkEncounter();
    setTimeout(() => { canMove = true; }, moveDelay);
  }
}

document.addEventListener("keydown", function(e) {
  const keysToPrevent = ["ArrowUp", "ArrowDown"];
  if (keysToPrevent.includes(e.key)) {
    e.preventDefault();
  }
});


function isWalkable(x, y) {
  return (
    x >= 0 &&
    y >= 0 &&
    y < collisionMap.length &&
    x < collisionMap[0].length &&
    collisionMap[y][x] !== "x"
  );
}

// ===== POKÉMON =====
const pokemons = [
  { id: 1, name: "Bulbasaur",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"},
  { id: 2, name: "Ivysaur",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"},
  { id: 3, name: "Venusaur",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"},
  { id: 4, name: "Charmander",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"},
  { id: 5, name: "Charmeleon",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png"},
  { id: 6, name: "Charizard",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"},
  { id: 7, name: "Squirtle",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"},
  { id: 8, name: "Wartortle",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"},
  { id: 9, name: "Blastoise",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"},
  { id: 10, name: "Cartepie",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"},
  { id: 11, name: "Metapod",    rarity: "comum",    chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"},
  { id: 12, name: "Butterfree", rarity: "incomum",  chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"},
  { id: 13, name: "Weedle",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png"},
  { id: 14, name: "Kakuna",     rarity: "comum",    chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"},
  { id: 15, name: "Beedrill",   rarity: "incomum",  chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"},
  { id: 16, name: "Pidgey",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"},
  { id: 17, name: "Pidgeotto",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"},
  { id: 18, name: "Pidgeot",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"},
  { id: 19, name: "Rattata",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png"},
  { id: 20, name: "Raticate",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"},
  { id: 21, name: "Spearow",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png"},
  { id: 22, name: "Fearow",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png"},
  { id: 23, name: "Ekans",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png"},
  { id: 24, name: "Arbok",      rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png"},
  { id: 25, name: "Pikachu",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
  { id: 26, name: "Raichu",     rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png"},
  { id: 27, name: "Sandshrew",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png"},
  { id: 28, name: "Sandslash",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png"},
  { id: 29, name: "Nidoran♀",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png"},
  { id: 30, name : "Nidorina",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png"},
  { id: 31, name : "Nidoqueen", rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png"},
  { id: 32, name : "Nidoran♂",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png"},
  { id: 33, name : "Nidorino",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png"},
  { id: 34, name : "Nidoking",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png"},
  { id: 35, name: "Clefairy",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png"},
  { id: 36, name: "Clefable",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png"},
  { id: 37, name: "Vulpix",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"},
  { id: 38, name: "Ninetales",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png"},
  { id: 39, name: "Jigglypuff", rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"},
  { id: 40, name: "Wigglytuff", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png"},
  { id: 41, name: "Zubat",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png"},
  { id: 42, name: "Golbat",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png"},
  { id: 43, name: "Oddish",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"},
  { id: 44, name: "Gloom",      rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png"},
  { id: 45, name: "Vileplume",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png"},
  { id: 46, name: "Paras",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png"},
  { id: 47, name: "Parasect",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png"},
  { id: 48, name: "Venonat",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png"},
  { id: 49, name: "Venomoth",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png"},
  { id: 50, name: "Diglett",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png"},
  { id: 51, name: "Dugtrio",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"},
  { id: 52, name: "Meowth",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png"},
  { id: 53, name: "Persian",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png"},
  { id: 54, name: "Psyduck",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png"},
  { id: 55, name: "Golduck",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png"},
  { id: 56, name: "Mankey",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png"},
  { id: 57, name: "Primeape",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png"},
  { id: 58, name: "Growlithe",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png"},
  { id: 59, name: "Arcanine",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png"},
  { id: 60, name: "Poliwag",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png"},
  { id: 61, name: "Poliwhirl",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/61.png"},
  { id: 62, name: "Poliwrath",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png"},
  { id: 63, name: "Abra",       rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png"},
  { id: 64, name: "Kadabra",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png"},
  { id: 65, name: "Alakazam",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png"},
  { id: 66, name: "Machop",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"},
  { id: 67, name: "Machoke",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png"},
  { id: 68, name: "Machamp",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"},
  { id: 69, name: "Bellsprout", rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png"},
  { id: 70, name: "Weepinbell", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png"},
  { id: 71, name: "Victreebel", rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png"},
  { id: 72, name: "Tentacool",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png"},
  { id: 73, name: "Tentacruel", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/73.png"},
  { id: 74, name: "Geodude",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"},
  { id: 75, name: "Graveler",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"},
  { id: 76, name: "Golem",      rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png"},
  { id: 77, name: "Ponyta",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png"},
  { id: 78, name: "Rapidash",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png"},
  { id: 79, name: "Slowpoke",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png"},
  { id: 80, name: "Slowbro",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png"},
  { id: 81, name: "Magnemite",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png"},
  { id: 82, name: "Magneton",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png"},
  { id: 83, name: "Farfetch'd", rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png"},
  { id: 84, name: "Doduo",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png"},
  { id: 85, name: "Dodrio",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/85.png"},
  { id: 86, name: "Seel",       rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png"},
  { id: 87, name: "Dewgong",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/87.png"},
  { id: 88, name: "Grimer",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png"},
  { id: 89, name: "Muk",        rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/89.png"},
  { id: 90, name: "Shellder",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png"},
  { id: 91, name: "Cloyster",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png"},
  { id: 92, name: "Gastly",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png"},
  { id: 93, name: "Haunter",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png"},
  { id: 94, name: "Gengar",     rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"},
  { id: 95, name: "Onix",       rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"},
  { id: 96, name: "Drowzee",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/96.png"},
  { id: 97, name: "Hypno",      rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/97.png"},
  { id: 98, name: "Krabby",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png"},
  { id: 99, name: "Kingler",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png"},
  { id: 100, name: "Voltorb",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png"},
  { id: 101, name: "Electrode", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png"},
  { id: 102, name: "Exeggcute", rarity: "comum",    chance: 50, img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"},
  { id: 103, name: "Exeggutor", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png"},
  { id: 104, name: "Cubone",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png"},
  { id: 105, name: "Marowak",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/105.png"},
  { id: 106, name: "Hitmonlee", rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png"},
  { id: 107, name: "Hitmonchan",rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png"},
  { id: 108, name: "Lickitung", rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png"},
  { id: 109, name: "Koffing",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png"},
  { id: 110, name: "Weezing",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png"},
  { id: 111, name: "Rhyhorn",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png"},
  { id: 112, name: "Rhydon",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"},
  { id: 113, name: "Chansey",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png"},
  { id: 114, name: "Tangela",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png"},
  { id: 115, name: "kangaskhan",rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/115.png"},
  { id: 116, name: "Horsea",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png"},
  { id: 117, name: "Seadra",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png"},
  { id: 118, name: "Goldeen",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png"},
  { id: 119, name: "Seaking",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/119.png"},
  { id: 120, name: "Staryu",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"},
  { id: 121, name: "Starmie",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"},
  { id: 122, name: "Mr. Mime",  rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/122.png"},
  { id: 123, name: "Scyther",   rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png"},
  { id: 124, name: "Jynx",      rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/124.png"},
  { id: 125, name: "Electabuzz",rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/125.png"},
  { id: 126, name: "Magmar",    rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/126.png"},
  { id: 127, name: "Pinsir",    rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png"},
  { id: 128, name: "Tauros",    rarity: "raro",     chance: 15, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/128.png"},
  { id: 129, name: "Magikarp",  rarity: "comum",    chance: 60, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"},
  { id: 130, name: "Gyarados",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"},
  { id: 131, name: "Lapras",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"},
  { id: 132, name: "Ditto",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"},
  { id: 133, name: "Eevee",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"},
  { id: 134, name: "Vaporeon",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png"},
  { id: 135, name: "Jolteon",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png"},
  { id: 136, name: "Flareon",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png"},
  { id: 137, name: "Porygon",   rarity: "incomum",  chance: 20, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png"},
  { id: 138, name: "Omanyte",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png"},
  { id: 139, name: "Omastar",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/139.png"},
  { id: 140, name: "Kabuto",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/140.png"},
  { id: 141, name: "Kabutops",  rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/141.png"},
  { id: 142, name: "Aerodactyl",rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png"},
  { id: 143, name: "Snorlax",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png"},
  { id: 144, name: "Articuno",  rarity: "lendario", chance: 5,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"},
  { id: 145, name: "Zapdos",    rarity: "lendario", chance: 5,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"},
  { id: 146, name: "Moltres",   rarity: "lendario", chance: 5,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"},
  { id: 147, name: "Dratini",   rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png"},
  { id: 148, name: "Dragonair", rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png"},
  { id: 149, name: "Dragonite", rarity: "raro",     chance: 8,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"},
  { id: 150, name: "Mewtwo",    rarity: "lendario", chance: 3,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"},
  { id: 151, name: "Mew",       rarity: "mistico", chance: 3,  img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png"},
];

// ===== ENCONTRO =====
function checkEncounter() {
  if (collisionMap[playerPos.y][playerPos.x] === "g" && Math.random() < 0.2) {
    const pokemon = getRandomPokemon();
    showEncounter(pokemon);
  }
}

function getRandomPokemon() {
  const totalChance = pokemons.reduce((sum, p) => sum + p.chance, 0);
  const roll = Math.random() * totalChance;
  let cumulative = 0;
  for (const p of pokemons) {
    cumulative += p.chance;
    if (roll <= cumulative) return p;
  }
  return pokemons[0];
}

function showEncounter(pokemon) {
  const encounterDiv = document.getElementById("encounter");
  const btn = document.getElementById("capture-btn");

    encounterDiv.innerHTML = `
      <p>
        Você encontrou ${pokemon.name} 
        (<span class="rarity-${pokemon.rarity}">${pokemon.rarity}</span>)!
      </p>
      <img src="${pokemon.img}" alt="${pokemon.name}">
    `;

  if (pokedex[pokemon.name]) {
    btn.style.display = "none";
    encounterDiv.innerHTML += `<p>Você já pegou esse Pokémon</p>`;
  } else {
    btn.style.display = "block";
    btn.onclick = () => capturePokemon(pokemon);
  }
}

function clearEncounter() {
  document.getElementById("encounter").innerHTML = "";
  document.getElementById("capture-btn").style.display = "none";
}

// ===== CAPTURA =====
function capturePokemon(pokemon) {
  pokedex[pokemon.name] = true;
  localStorage.setItem("pokedex", JSON.stringify(pokedex));

  capturados[pokemon.name] = {
    name: pokemon.name,
    img: pokemon.img,
    rarity: pokemon.rarity
  };
  localStorage.setItem("capturados", JSON.stringify(capturados));

  clearEncounter();
  if (typeof updatePokedex === "function") updatePokedex();
  if (typeof updateCaptured === "function") updateCaptured();
}

// ===== MENU =====
function openTab(tabName) {
  const sidebarContent = document.getElementById("sidebarContent");
  const tabContent = document.getElementById(tabName + "TabContent");
  const tabLink = document.getElementById(tabName + "Tab");
  const sidebarTabs = document.getElementById("sidebarTabs");

  const isVisible = tabContent.style.display === "block";

  if (isVisible) {
    tabContent.style.display = "none";
    tabLink.classList.remove("selected", "opened");
    sidebarContent.style.display = "none";
    sidebarTabs.classList.remove("opened"); // remove arredondamento invertido
    return;
  }

  // Fecha todas as abas
  document.querySelectorAll(".tabContent").forEach(div => div.style.display = "none");
  document.querySelectorAll("#sidebarTabs a").forEach(a => a.classList.remove("selected", "opened"));

  // Abre a aba escolhida
  sidebarContent.style.display = "block";
  tabContent.style.display = "block";
  tabLink.classList.add("selected", "opened");
  sidebarTabs.classList.add("opened"); // aplica arredondamento invertido

  // Atualiza conteúdo específico
  if (tabName === "pokedex" && typeof updatePokedex === "function") updatePokedex();
  if (tabName === "captured" && typeof updateCaptured === "function") updateCaptured();
  if (tabName === "store" && typeof updateStore === "function") updateStore();
}