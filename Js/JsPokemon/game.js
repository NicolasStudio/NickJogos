// ===== CONFIGURAÇÃO =====
const MAP_TILE_SIZE = 16;     // tamanho do grid
const mapElement = document.getElementById("map");
let mapaAtual = "RotaFloresta.png"; // começa na floresta
let collisionMap = collisionMapFloresta; // definido em maps.js

// ===== ESTADOS GLOBAIS =====
let pokedex = JSON.parse(localStorage.getItem("pokedex")) || {};
try {
    const savedMoney = localStorage.getItem("pokemonMoney");
    if (savedMoney && savedMoney.trim() !== "") {
        pokemonMoney = JSON.parse(savedMoney);
    }
} catch (error) {
    console.error("Erro ao carregar pokemonMoney:", error);
    pokemonMoney = 0;
    // Opcional: limpar o valor inválido
    localStorage.removeItem("pokemonMoney");
}

// ===== TROCA DE MAPA =====
function trocarMapa(novoMapa, respawnX, respawnY) {
  mapaAtual = novoMapa;

  if (mapaAtual === "RotaFloresta.png") {
    collisionMap = collisionMapFloresta;
  } else if (mapaAtual === "Praia.png") {
    collisionMap = collisionMapPraia;
  } else if (mapaAtual === "Caverna.png") {
    collisionMap = collisionMapCaverna;
  }

  // se coordenadas foram passadas, usa elas
  if (respawnX !== undefined && respawnY !== undefined) {
    playerPos.x = respawnX;
    playerPos.y = respawnY;
  }

  renderMap();
  renderPlayer();
}

// ===== MAPA =====
function renderMap() {
  mapElement.style.backgroundImage = `url("/NickJogos/Img/ImagemPokemon/${mapaAtual}")`;
  mapElement.style.backgroundSize = `${collisionMap[0].length * MAP_TILE_SIZE}px ${collisionMap.length * MAP_TILE_SIZE}px`;
  mapElement.style.width = `${collisionMap[0].length * MAP_TILE_SIZE}px`;
  mapElement.style.height = `${collisionMap.length * MAP_TILE_SIZE}px`;
}
renderMap();

// Render inicial do player
renderPlayer();

// ===== POKÉMON =====
const pokemonsPorMapa  = {
  "RotaFloresta.png": [ 
    { id: 1,   name: "Bulbasaur",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"},
    { id: 2,   name: "Ivysaur",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"},
    { id: 10,  name: "Caterpie",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"},
    { id: 11,  name: "Metapod",    rarity: "comum",    chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"},
    { id: 13,  name: "Weedle",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png"},
    { id: 14,  name: "Kakuna",     rarity: "comum",    chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"},
    { id: 16,  name: "Pidgey",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"},
    { id: 19,  name: "Rattata",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png"},
    { id: 21,  name: "Spearow",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png"},
    { id: 23,  name: "Ekans",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png"},
    { id: 24,  name: "Arbok",      rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png"},
    { id: 25,  name: "Pikachu",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
    { id: 39,  name: "Jigglypuff", rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"},
    { id: 43,  name: "Oddish",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"},
    { id: 46,  name: "Paras",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png"},
    { id: 48,  name: "Venonat",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png"},
    { id: 52,  name: "Meowth",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png"},
    { id: 53,  name: "Persian",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png"},
    { id: 69,  name: "Bellsprout", rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png"},
    { id: 84,  name: "Doduo",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png"},
  ],
  "Praia.png": [
    { id: 7,   name: "Squirtle",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"},
    { id: 8,   name: "Wartortle",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"},
    { id: 17,  name: "Pidgeotto",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"},
    { id: 29,  name: "Nidoran♀",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png"},
    { id: 32,  name: "Nidoran♂",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png"},
    { id: 54,  name: "Psyduck",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png"},
    { id: 60,  name: "Poliwag",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png"},
    { id: 72,  name: "Tentacool",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png"},
    { id: 79,  name: "Slowpoke",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png"},
    { id: 90,  name: "Shellder",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png"},
    { id: 98,  name: "Krabby",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png"},
    { id: 99,  name: "Kingler",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png"},
    { id: 108, name: "Lickitung",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png"},
    { id: 116, name: "Horsea",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png"},
    { id: 117, name: "Seadra",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png"},
    { id: 118, name: "Goldeen",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png"},
    { id: 119, name: "Seaking",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/119.png"},
    { id: 120, name: "Staryu",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"},
    { id: 121, name: "Starmie",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"},
    { id: 129, name: "Magikarp",   rarity: "comum",    chance: 60, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"},
  ],
    "Caverna.png": [
    { id: 27,  name: "Sandshrew",  rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png"},
    { id: 28,  name: "Sandslash",  rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png"},
    { id: 29,  name: "Nidoran♀",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png"},
    { id: 32,  name: "Nidoran♂",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png"},
    { id: 35,  name: "Clefairy",   rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png"},
    { id: 36,  name: "Clefable",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png"},
    { id: 41,  name: "Zubat",      rarity: "comum",    chance: 60, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png"},
    { id: 42,  name: "Golbat",     rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png"},
    { id: 46,  name: "Paras",      rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png"},
    { id: 47,  name: "Parasect",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png"},
    { id: 50,  name: "Diglett",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png"},
    { id: 51,  name: "Dugtrio",    rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"},
    { id: 66,  name: "Machop",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"},
    { id: 74,  name: "Geodude",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"},
    { id: 75,  name: "Graveler",   rarity: "incomum",  chance: 30, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"},
    { id: 95,  name: "Onix",       rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"},
    { id: 104, name: "Cubone",     rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png"},
    { id: 111, name: "Rhyhorn",    rarity: "comum",    chance: 50, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png"},
    { id: 138, name: "Omanyte",    rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png"},
    { id: 140, name: "Kabuto",     rarity: "raro",     chance: 10, img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/140.png"},
  ],
};