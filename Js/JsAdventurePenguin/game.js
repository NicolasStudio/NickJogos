// =====================================================================
// Adventure Penguin - jogo de plataforma (Phaser 3)
// Mundo em 480x270 (pixel art ampliada), tiles de 16px.
// O HUD, os menus e os botoes de toque sao HTML por cima do canvas.
// =====================================================================
(() => {
    'use strict';

    const TILE = 16;
    const VIEW_W = 480;
    const VIEW_H = 270;
    // O mundo continua em 480x270 (tiles de 16px), mas o canvas e desenhado 4x maior com a
    // camera em zoom 4: a pixel art fica igual e o pinguim (quadros 96x96) aparece com detalhe.
    const RES = 4;
    // objetos fixos na tela (scrollFactor 0) sofrem o zoom a partir do centro da camera:
    // este deslocamento os coloca no canto superior esquerdo
    const FIX_X = (VIEW_W * RES / 2) * (1 - 1 / RES);
    const FIX_Y = (VIEW_H * RES / 2) * (1 - 1 / RES);
    const T = ART.TILE_INDEX;
    const SOLID = [T.SNOW, T.DIRT, T.BRICK, T.GIFT, T.USED, T.ICE, T.SNOW_L, T.SNOW_R, T.ICE_TOP, T.DIRT_L, T.DIRT_R,
        T.DECK, T.DECK_L, T.DECK_M, T.DECK_R, T.CRATE, T.ROAD];
    const PLATS = [T.PLAT, T.PLAT_L, T.PLAT_M, T.PLAT_R, T.WOOD, T.WOOD_L, T.WOOD_M, T.WOOD_R, T.CLOUD, T.CLOUD_L, T.CLOUD_M, T.CLOUD_R];   // so colidem por cima
    const FONT = '"Press Start 2P", monospace';
    const RECORD_KEY = 'adventurePenguinRecorde';

    // Fisica do pinguim (px/s e px/s²)
    const PHYS = {
        gravity: 900,
        maxSpeed: 115,
        accel: 750,
        decel: 950,
        airAccel: 520,
        jump: 360,          // ~4,5 tiles de altura
        jumpCut: 0.45,      // soltar o pulo cedo corta a subida (pulo curto)
        coyote: 90,         // ms: ainda pode pular logo depois de sair da beirada
        buffer: 120,        // ms: pulo apertado um pouco antes de tocar o chao vale
        stomp: 230,
        stompHeld: 330,
        slideSpeed: 200,
        slideTime: 700,
        slideHoldSpeed: 90,  // segurando para baixo, o escorregao continua com pelo menos esta velocidade
    };

    const SCORE = { coin: 10, stomp: 100, knock: 200, brick: 50, fish: 1000, timeBonus: 10, coinsForLife: 100, reindeer: 500, pinecone: 300, bear: 600, seal: 400, owl: 400, bat: 450, ox: 600, moose: 600, rat: 400, beaver: 700, narwhal: 500, bearguard: 900, sealguard: 700, royalowl: 600, royalmoose: 700, bigsnow: 800, bigsnowHit: 100 };

    // ---------------------------------------------------------------
    // Arvore de talentos. Toda moeda pega tambem vai para um cofre salvo no navegador
    // (nao zera ao perder); os talentos sao comprados com ele e valem em todas as partidas.
    // apply(p, nivel) recebe uma copia da fisica base e aplica o bonus do nivel.
    const TALENT_KEY = 'adventurePenguinTalentos';
    const TALENT_COSTS = [60, 100, 140];             // preco do nivel 1, 2 e 3
    // talento especial: so aparece com os 3 talentos no nivel 3; o pinguim comeca com o cachecol dourado
    const GOLD_TALENT = { id: 'gold', name: 'CACHECOL DOURADO', icon: 'fa-crown', cost: 400 };
    const BASE_PHYS = { ...PHYS };
    const fmt1 = n => n.toFixed(1).replace('.', ',');
    const TALENTS = [
        {
            id: 'slide', name: 'DESLIZAR MAIS', icon: 'fa-wind',
            apply: (p, n) => { p.slideTime += 200 * n; p.slideSpeed += 20 * n; },
            info: p => fmt1(p.slideTime / 1000) + 's de escorregão',
        },
        {
            id: 'jump', name: 'PULAR MAIS ALTO', icon: 'fa-angles-up',
            apply: (p, n) => { p.jump += 18 * n; },
            info: p => fmt1(p.jump * p.jump / (2 * p.gravity) / TILE) + ' blocos de pulo',
        },
        {
            id: 'speed', name: 'VELOCIDADE', icon: 'fa-bolt',
            apply: (p, n) => { p.maxSpeed += 12 * n; p.accel += 60 * n; },
            info: p => '+' + Math.round((p.maxSpeed / BASE_PHYS.maxSpeed - 1) * 100) + '% de velocidade',
        },
    ];
    // ?zerar=1 no endereco: apaga tudo que o jogo salvou no navegador (moedas, talentos, recorde, trofeu)
    // e recarrega sem o parametro
    if (new URLSearchParams(location.search).has('zerar')) {
        try { Object.keys(localStorage).filter(k => k.startsWith('adventurePenguin')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* sem armazenamento */ }
        const u = new URL(location.href);
        u.searchParams.delete('zerar');
        history.replaceState(null, '', u);
    }
    const talents = loadTalents();

    function loadTalents() {
        const t = { bank: 0, lv: { slide: 0, jump: 0, speed: 0 }, gold: false };
        try {
            const saved = JSON.parse(localStorage.getItem(TALENT_KEY));
            if (saved) {
                t.bank = Math.max(0, +saved.bank || 0);
                t.gold = !!saved.gold;
                for (const k of Object.keys(t.lv)) t.lv[k] = Math.min(TALENT_COSTS.length, Math.max(0, +(saved.lv && saved.lv[k]) || 0));
            }
        } catch (e) { /* sem armazenamento: comeca do zero */ }
        return t;
    }
    function saveTalents() {
        try { localStorage.setItem(TALENT_KEY, JSON.stringify(talents)); } catch (e) { /* sem armazenamento */ }
    }
    // fisica com os talentos de certos niveis (sem argumento: os niveis comprados)
    function physWith(lv = talents.lv) {
        const p = { ...BASE_PHYS };
        for (const t of TALENTS) t.apply(p, lv[t.id] || 0);
        return p;
    }
    function applyTalents() { Object.assign(PHYS, physWith()); }
    applyTalents();

    // ---------------------------------------------------------------
    // Sprites definitivos do pinguim: PNGs com fundo transparente, um por
    // quadro, em Img/ImagemAdventurePenguin/pinguim/<animacao>/<animacao>_01.webp ...
    // Se parado_01.webp nao existir, o jogo usa a arte provisoria de art.js.
    // ---------------------------------------------------------------
    const PLAYER_SPRITES = {
        pasta: 'Img/ImagemAdventurePenguin/pinguim/',
        tamanho: 24,        // quadro no mundo (24px = 96x96 de arte com RES 4; o tile tem 16)
        alturaParado: 19,   // altura do pinguim parado no mundo (~1,2 tile)
        anims: {
            idle:  { arquivo: 'parado',     quadros: 4, fps: 6,  repetir: true },
            run:   { arquivo: 'correr',     quadros: 7, fps: 14, repetir: true },
            jump:  { arquivo: 'pular',      quadros: 7, fps: 16, repetir: false },
            fall:  { arquivo: 'queda',      quadros: 4, fps: 10, repetir: true },
            // usar: so estes quadros na animacao (escorregar_02 e _03 vieram com o bico cortado no recorte)
            slide: { arquivo: 'escorregar', quadros: 4, fps: 6, repetir: false, usar: [1, 4] },
            hurt:  { arquivo: 'dano',       quadros: 3, fps: 10, repetir: false },
            die:   { arquivo: 'morrer',     quadros: 5, fps: 8,  repetir: false },
        },
    };
    const spritePath = (a, i) => `${PLAYER_SPRITES.pasta}${a.arquivo}/${a.arquivo}_${String(i).padStart(2, '0')}.webp`;

    // Inimigos com arte em alta resolucao (mesmo esquema do pinguim). A chave e o tipo
    // usado nas fases: 'snow' = 'e' (bola de neve), 'urchin' = 'u' (ourico), 'reindeer' = 'r' (rena).
    // olhaDireita: a arte original olha para a direita (as outras olham para a esquerda).
    // semSombra: tira a sombra roxa desenhada embaixo dos pes.
    // extras: animacoes montadas com parte dos quadros de outra animacao.
    // Sem os arquivos, o inimigo usa a arte provisoria de art.js.
    const ENEMY_ART = {
        // bola de neve malvada: morre pisada ou com o escorregao
        snow: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/evil-snowball/',
            tamanho: 24,    // quadro no mundo (96x96 de arte com RES 4)
            altura: 14,     // altura rolando no mundo (~1 tile)
            anims: {
                walk: { arquivo: 'rolar',  quadros: 6, fps: 10, repetir: true },
                die:  { arquivo: 'morrer', quadros: 5, fps: 12, repetir: false },
            },
        },
        // ourico de gelo: so morre com o escorregao pela frente; pular nele machuca
        urchin: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/ice-hedgehog/',
            tamanho: 24,
            altura: 15,
            anims: {
                walk: { arquivo: 'andar',  quadros: 6, fps: 8,  repetir: true },
                die:  { arquivo: 'morrer', quadros: 4, fps: 10, repetir: false },
            },
        },
        // ourico da guarda: o ourico com armadura (maior); so morre com o escorregao pela frente
        urchinguard: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/ice_guard-hedgehog/',
            tamanho: 36,
            altura: 20,
            olhaDireita: true,
            semFranja: true,
            sombraRoxa: true,
            anims: {
                walk: { arquivo: 'walk',   quadros: 6, fps: 8,  repetir: true },
                idle: { arquivo: 'idle',   quadros: 4, fps: 5,  repetir: true },
                die:  { arquivo: 'defeat', quadros: 6, fps: 10, repetir: false },
            },
        },
        // alce real (montaria da guarda): mecanica do alce/rena
        royalmoose: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/royal-moose/',
            tamanho: 60,
            altura: 36,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',          quadros: 6, fps: 8,  repetir: true },
                idle:   { arquivo: 'idle',          quadros: 4, fps: 5,  repetir: true },
                attack: { arquivo: 'attack_antler', quadros: 6, fps: 14, repetir: false },
                charge: { arquivo: 'attack_charge', quadros: 6, fps: 14, repetir: true },
                hurt:   { arquivo: 'hurt',          quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat',        quadros: 6, fps: 10, repetir: false },
            },
        },
        // urso polar: anda devagar, patada de perto; 2 pisoes derrubam; escorregao empurra de volta
        bear: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/polar-bear/',
            tamanho: 56,
            altura: 28,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:  { arquivo: 'walk',        quadros: 6, fps: 7,  repetir: true },
                idle:  { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                claw:  { arquivo: 'attack_claw', quadros: 6, fps: 12, repetir: false },
                hurt:  { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:   { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // chefe da 5-5: mamute (mesmos ataques do yeti: golpe de tromba e investida)
        mammothboss: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/boss/mammoth/',
            sombraRoxa: true,   // a folha tem sombra roxa embaixo dos pes
            tamanho: 88,
            altura: 52,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',              quadros: 6, fps: 7,  repetir: true },
                idle:   { arquivo: 'idle',              quadros: 4, fps: 5,  repetir: true },
                slam:   { arquivo: 'attack_trunk_slam', quadros: 6, fps: 10, repetir: false },
                charge: { arquivo: 'attack_charge',     quadros: 6, fps: 12, repetir: true },
                hurt:   { arquivo: 'hurt',              quadros: 3, fps: 10, repetir: false },
                die:    { arquivo: 'defeat',            quadros: 6, fps: 7,  repetir: false },
            },
        },
        // chefe da 4-5: yeti abominavel (pancada no chao e investida)
        yetiboss: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/boss/abominable-yeti/',
            tamanho: 80,
            altura: 52,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',        quadros: 6, fps: 8,  repetir: true },
                idle:   { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                slam:   { arquivo: 'attack_slam', quadros: 6, fps: 10, repetir: false },
                charge: { arquivo: 'charge_run',  quadros: 6, fps: 14, repetir: true },
                hurt:   { arquivo: 'hurt',        quadros: 3, fps: 10, repetir: false },
                die:    { arquivo: 'defeat',      quadros: 6, fps: 7,  repetir: false },
            },
        },
        // chefe da 3-5: floco de neve (flutua; lancas de gelo e explosao de cristais)
        flakeboss: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/boss/evil-snowflake/',
            tamanho: 72,
            altura: 36,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:    { arquivo: 'float',                 quadros: 6, fps: 8,  repetir: true },
                idle:    { arquivo: 'idle',                  quadros: 4, fps: 6,  repetir: true },
                lances:  { arquivo: 'attack_ice_lances',     quadros: 6, fps: 10, repetir: false },
                explode: { arquivo: 'special_ice_explosion', quadros: 6, fps: 6,  repetir: false },
                hurt:    { arquivo: 'hurt',                  quadros: 3, fps: 10, repetir: false },
                die:     { arquivo: 'defeat',                quadros: 6, fps: 7,  repetir: false },
            },
        },
        // chefe da 2-5: o mesmo boneco de neve, bem maior
        snowboss: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/boss/evil-snowman/',
            tamanho: 72,
            altura: 46,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:  { arquivo: 'walk',           quadros: 6, fps: 8,  repetir: true },
                idle:  { arquivo: 'idle',           quadros: 4, fps: 6,  repetir: true },
                slash: { arquivo: 'attack_slash',   quadros: 6, fps: 12, repetir: false },
                throw: { arquivo: 'throw_snowball', quadros: 6, fps: 14, repetir: false },
                hurt:  { arquivo: 'hurt',           quadros: 3, fps: 12, repetir: false },
                die:   { arquivo: 'defeat',         quadros: 6, fps: 8,  repetir: false },
            },
        },
        // alce: mesma mecanica da rena (ve o pinguim na frente e investe; so morre por tras)
        moose: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/moose/',
            tamanho: 56,
            altura: 34,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',          quadros: 6, fps: 8,  repetir: true },
                idle:   { arquivo: 'idle',          quadros: 4, fps: 5,  repetir: true },
                attack: { arquivo: 'attack_antler', quadros: 6, fps: 14, repetir: false },
                charge: { arquivo: 'attack_charge', quadros: 6, fps: 14, repetir: true },
                hurt:   { arquivo: 'hurt',          quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat',        quadros: 6, fps: 10, repetir: false },
            },
        },
        // boi-almiscarado: mesma mecanica da rena (ve o pinguim na frente e investe; so morre por tras)
        ox: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/musk-ox/',
            tamanho: 56,
            altura: 26,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',        quadros: 6, fps: 8,  repetir: true },
                idle:   { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                attack: { arquivo: 'attack_gore', quadros: 6, fps: 14, repetir: false },
                charge: { arquivo: 'charge_run',  quadros: 6, fps: 14, repetir: true },
                hurt:   { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // narval: mecanica do urso (golpe de chifre de perto; 2 pisoes; escorregao empurra)
        narwhal: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/narwhal/',
            tamanho: 56,
            altura: 22,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk: { arquivo: 'swim',               quadros: 6, fps: 9,  repetir: true },
                idle: { arquivo: 'idle',               quadros: 4, fps: 5,  repetir: true },
                claw: { arquivo: 'attack_horn_strike', quadros: 6, fps: 14, repetir: false },
                hurt: { arquivo: 'hurt',               quadros: 3, fps: 12, repetir: false },
                die:  { arquivo: 'defeat',             quadros: 6, fps: 10, repetir: false },
            },
        },
        // guardas do castelo: mecanica do urso + investida quando ve o pinguim de longe
        bearguard: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/royal-bear-guard/',
            tamanho: 60,
            altura: 30,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk', quadros: 6, fps: 7, repetir: true },
                idle:   { arquivo: 'idle', quadros: 4, fps: 5, repetir: true },
                claw:   { arquivo: 'attack_paw', quadros: 6, fps: 12, repetir: false },
                charge: { arquivo: 'attack_charge', quadros: 6, fps: 12, repetir: true },
                hurt:   { arquivo: 'hurt', quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat', quadros: 6, fps: 10, repetir: false },
            },
        },
        sealguard: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/seal-guard/',
            tamanho: 54,
            altura: 22,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk', quadros: 6, fps: 7, repetir: true },
                idle:   { arquivo: 'idle', quadros: 4, fps: 5, repetir: true },
                claw:   { arquivo: 'attack_flipper', quadros: 6, fps: 12, repetir: false },
                charge: { arquivo: 'attack_charge', quadros: 6, fps: 12, repetir: true },
                hurt:   { arquivo: 'hurt', quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat', quadros: 6, fps: 10, repetir: false },
            },
        },
        // coruja mensageira real: mecanica da coruja, aguenta 2 pisoes
        royalowl: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/royal-messenger-owl/',
            tamanho: 54,
            altura: 20,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'fly', quadros: 6, fps: 10, repetir: true },
                idle:   { arquivo: 'idle', quadros: 4, fps: 5, repetir: true },
                claw:   { arquivo: 'attack_claw', quadros: 6, fps: 14, repetir: false },
                dive: { arquivo: 'attack_charge', quadros: 6, fps: 12, repetir: true },
                hurt:   { arquivo: 'hurt', quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat', quadros: 6, fps: 10, repetir: false },
            },
        },
        // castor: mecanica do urso, mas com 3 de vida
        beaver: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/beaver/',
            tamanho: 52,
            altura: 20,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk: { arquivo: 'walk',        quadros: 6, fps: 10, repetir: true },
                idle: { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                claw: { arquivo: 'attack_bite', quadros: 6, fps: 14, repetir: false },
                hurt: { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:  { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // rato das neves: mesma mecanica do urso (2 pisoes, mordida de perto, escorregao empurra)
        rat: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/snow-rat/',
            tamanho: 52,
            altura: 18,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk: { arquivo: 'walk',        quadros: 6, fps: 10, repetir: true },
                idle: { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                claw: { arquivo: 'attack_bite', quadros: 6, fps: 14, repetir: false },
                hurt: { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:  { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // morcego: como a coruja (voa e mergulha; pular nele derruba), so que mais rapido
        bat: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/evil-bat/',
            tamanho: 48,
            altura: 18,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk: { arquivo: 'fly',                 quadros: 6, fps: 14, repetir: true },
                idle: { arquivo: 'idle',                quadros: 4, fps: 10, repetir: true },
                claw: { arquivo: 'attack_shadow_blade', quadros: 6, fps: 14, repetir: false },
                dive: { arquivo: 'dive_charge',         quadros: 6, fps: 14, repetir: true },
                hurt: { arquivo: 'hurt',                quadros: 3, fps: 12, repetir: false },
                die:  { arquivo: 'defeat',              quadros: 6, fps: 10, repetir: false },
            },
        },
        // coruja: voa patrulhando no alto e mergulha no pinguim; pular nela derruba
        owl: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/snowy-owl/',
            tamanho: 52,
            altura: 20,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk: { arquivo: 'fly',         quadros: 6, fps: 10, repetir: true },
                idle: { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                claw: { arquivo: 'attack_claw', quadros: 6, fps: 14, repetir: false },
                dive: { arquivo: 'dive_charge', quadros: 6, fps: 12, repetir: true },
                hurt: { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:  { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // foca: mesma mecanica do urso (2 pisoes, mordida de perto, escorregao empurra de volta)
        seal: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/seal/',
            tamanho: 52,
            altura: 20,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:  { arquivo: 'walk',        quadros: 6, fps: 8,  repetir: true },
                idle:  { arquivo: 'idle',        quadros: 4, fps: 5,  repetir: true },
                claw:  { arquivo: 'attack_bite', quadros: 6, fps: 12, repetir: false },
                hurt:  { arquivo: 'hurt',        quadros: 3, fps: 12, repetir: false },
                die:   { arquivo: 'defeat',      quadros: 6, fps: 10, repetir: false },
            },
        },
        // bola de neve gigante: 3 acertos (pisao ou escorregao); ve o pinguim na frente e investe rolando
        bigsnow: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/bigBallSnow/',
            tamanho: 44,
            altura: 28,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'roll_move',     quadros: 6, fps: 10, repetir: true },
                idle:   { arquivo: 'idle',          quadros: 4, fps: 6,  repetir: true },
                attack: { arquivo: 'attack_charge', quadros: 6, fps: 12, repetir: true },
                hurt:   { arquivo: 'hurt',          quadros: 3, fps: 12, repetir: false },
                die:    { arquivo: 'defeat',        quadros: 6, fps: 10, repetir: false },
            },
            // preparar = quadros 1 a 3 do ataque; investida = 4 a 6
            extras: { windup: { de: 'attack', quadros: [1, 2, 3], fps: 8 }, charge: { de: 'attack', quadros: [4, 5, 6], fps: 12 } },
        },
        // pinha explosiva: chegou perto, ela treme e explode; pisar em cima desarma
        pinecone: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/explosive-pinecone/',
            tamanho: 32,
            altura: 15,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:    { arquivo: 'walk',          quadros: 6, fps: 10, repetir: true },
                idle:    { arquivo: 'idle',          quadros: 4, fps: 6,  repetir: true },
                alert:   { arquivo: 'alert_prepare', quadros: 4, fps: 6,  repetir: false },
                explode: { arquivo: 'explode',       quadros: 6, fps: 12, repetir: false },
                hurt:    { arquivo: 'hurt',          quadros: 3, fps: 12, repetir: false },
                die:     { arquivo: 'defeat',        quadros: 4, fps: 8,  repetir: false },
            },
        },
        // Rei do Gelo (chefao). Nao aparece no mapa: e criado pela arena.
        // semFranja: so escurece a borda rosada (sem tirar sombra - a capa roxa encosta no chao)
        king: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/boss/ice-king/',
            tamanho: 104,
            altura: 50,
            olhaDireita: true,
            semFranja: true,
            anims: {
                walk:   { arquivo: 'walk',         quadros: 6, fps: 8,  repetir: true },
                idle:   { arquivo: 'idle',         quadros: 4, fps: 6,  repetir: true },
                slam:   { arquivo: 'scepter_slam', quadros: 6, fps: 10, repetir: false },
                charge: { arquivo: 'charge_run',   quadros: 6, fps: 14, repetir: true },
                summon: { arquivo: 'summon',       quadros: 4, fps: 8,  repetir: false },
                laugh:  { arquivo: 'laugh_taunt',  quadros: 4, fps: 8,  repetir: true },
                hurt:   { arquivo: 'hurt',         quadros: 3, fps: 10, repetir: false },
                die:    { arquivo: 'defeat',       quadros: 6, fps: 7,  repetir: false },
            },
        },
        // rena: so morre por tras; se ve o pinguim na frente, abaixa a cabeca e investe;
        // pular em cima dela machuca
        reindeer: {
            pasta: 'Img/ImagemAdventurePenguin/inimigos/reindeer/',
            tamanho: 36,
            altura: 26,
            olhaDireita: true,
            semSombra: true,
            anims: {
                walk:   { arquivo: 'andar',   quadros: 8, fps: 10, repetir: true },
                // na folha original a pose parada foi desenhada ~13% maior: escala iguala ao andar
                idle:   { arquivo: 'idle',    quadros: 4, fps: 6,  repetir: true, escala: 0.885 },
                attack: { arquivo: 'ataque',  quadros: 6, fps: 14, repetir: false },
                hurt:   { arquivo: 'dano',    quadros: 4, fps: 12, repetir: false },
                die:    { arquivo: 'derrota', quadros: 6, fps: 10, repetir: false },
                charge: { arquivo: 'correr',  quadros: 8, fps: 16, repetir: true },   // investida
            },
        },
    };

    // Rei do Gelo. Feito para ser quase impossivel: so morre por tras, fica mais rapido a cada
    // terco de vida e se recupera quando acerta o pinguim (com o poder do peixe dourado).
    // Morrer recomeca a luta do zero.
    const KING = {
        hp: 15,
        heal: 3,                       // vida que recupera quando acerta o pinguim (e ele sobrevive)
        walkSpeed: 45,
        chargeSpeed: 230,
        shockSpeed: 150,
        think: 900,                    // pausa entre ataques (ms) na fase 1
        speed: [1, 1.2, 1.45],         // velocidade por fase (vida > 2/3, > 1/3, resto)
        pace: [1, 0.8, 0.6],           // duracao das pausas por fase
        icicles: [4, 6, 8],
    };
    // Revanche (6-5): o mesmo Rei, mas possivel de vencer: menos vida, nao se cura,
    // mais lento e fica mais tempo parado (de costas) depois de cada ataque.
    const KING2 = {
        ...KING,
        hp: 10,
        heal: 0,
        walkSpeed: 40,
        chargeSpeed: 200,
        shockSpeed: 130,
        think: 1100,
        speed: [0.9, 1.05, 1.2],
        pace: [1.2, 1.05, 0.9],
        icicles: [3, 4, 6],
    };
    // Chefe Boneco de Neve (2-5): pode ser vencido. So toma dano por tras; arremessa bolas de neve
    // (1, 2 ou 3 seguidas conforme perde vida) e da garradas de perto. Depois de atacar fica parado.
    const SNOWBOSS = {
        hp: 5,                  // 5 golpes por tras (20% cada)
        walkSpeed: 40,
        shotSpeed: 150,
        slashRange: 44,
        think: 900,
        speed: [1, 1.2, 1.4],
        pace: [1, 0.8, 0.6],
        shots: [1, 2, 3],
        rest: 2000,             // tempo extra parado depois de cada ataque (janela para pegar ele por tras)
    };
    // Chefe Floco de Neve (3-5): flutua alto (fora de alcance). Lancas de gelo em leque e explosao
    // de cristais; depois da explosao fica tonto embaixo - hora de pular nele. 5 pisoes vencem.
    const FLAKE = {
        hp: 5,
        high: 86,              // altura em que flutua (px acima do chao)
        low: 12,               // altura quando desce para explodir (perto do tronco: da para pular nele)
        follow: 30,            // velocidade com que acompanha o pinguim la em cima
        lanceSpeed: 150,
        shardSpeed: 130,
        dizzy: 2600,           // tempo tonto embaixo (janela para pular nele)
        think: 1300,
        pace: [1, 0.8, 0.6],
        volleys: [1, 1, 2],    // rajadas de lancas por ataque (por fase)
    };
    // Chefe Yeti (4-5): pancada solta ondas de gelo (pular); investida bate na parede e ele fica
    // atordoado de cara na parede - hora de pisar na cabeca dele. 6 pisoes vencem.
    const YETI = {
        type: 'yeti', art: 'yetiboss', name: 'YETI', say: 'GRRRAAAH!', title: 'YETI DERROTADO!',
        shockSize: 1,          // tamanho da onda de gelo
        hp: 6,
        walkSpeed: 38,
        chargeSpeed: 210,
        shockSpeed: 140,
        stun: 2400,
        think: 1000,
        speed: [1, 1.15, 1.3],
        pace: [1, 0.85, 0.7],
    };
    // Chefe Mamute (5-5): a luta do yeti, mais resistente (7 pisoes) e mais pesado
    const MAMMOTH = {
        ...YETI,
        type: 'mammoth', art: 'mammothboss', name: 'MAMUTE', say: 'HRRROOOOM!', title: 'MAMUTE DERROTADO!',
        hp: 7,
        shockSize: 1.6,        // onda bem maior que a do yeti (mais alta: pulo mais caprichado)
        walkSpeed: 32,
        chargeSpeed: 190,
        shockSpeed: 130,
        stun: 2400,
    };
    const TROPHY_KEY = 'adventurePenguinTrofeuRei';
    const BANISH_KEY = 'adventurePenguinBanido';

    // coruja (px do mundo, ms)
    const OWL_BASE = {
        patrol: 56,          // distancia que voa para cada lado do ponto de partida
        flySpeed: 40,
        sight: 120,          // ve o pinguim abaixo ate essa distancia (horizontal)
        diveSpeed: 170,
        diveTime: 900,
        climbSpeed: 70,
        rest: 1200,          // espera depois de voltar ao alto
    };

    // morcego: a mecanica da coruja, mais rapido
    const BAT = { ...OWL_BASE, patrol: 70, flySpeed: 62, sight: 130, diveSpeed: 220, diveTime: 750, climbSpeed: 95, rest: 700 };

    // coruja mensageira real: a coruja, mais esperta (2 pisoes)
    const ROYALOWL = { ...OWL_BASE, patrol: 64, flySpeed: 50, sight: 140, diveSpeed: 200, diveTime: 850, climbSpeed: 85, rest: 900, hp: 2 };

    // guardas do castelo: o urso + investida (ve o pinguim de longe, prepara, corre e descansa)
    const GUARDS = {
        bearguard: { hp: 3, sight: 120, windup: 500, chargeSpeed: 150, chargeTime: 1000, rest: 1100, cooldown: 1500 },
        sealguard: { hp: 2, sight: 130, windup: 380, chargeSpeed: 180, chargeTime: 850, rest: 900, cooldown: 1200 },
    };

    // urso polar (px do mundo, ms)
    const BEAR = {
        hp: 2,
        walkSpeed: 18,
        clawRange: 36,        // pinguim mais perto que isso na frente: patada
        sightY: 22,
        invuln: 500,
    };

    // bola de neve arremessada (usada pelo chefe Boneco de Neve)
    const SNOWMAN = { shotRange: 240 };

    // bola de neve gigante (px do mundo, ms)
    const BIGSNOW = {
        hp: 3,
        walkSpeed: 22,
        sight: 120,
        sightY: 22,
        windup: 600,
        chargeSpeed: 140,
        chargeTime: 1200,
        rest: 900,
        invuln: 500,          // depois de um acerto: nao leva outro nem causa dano
        push: 200,            // forca do empurrao no pinguim (escorregao que nao derruba)
    };

    // pinha explosiva (px do mundo, ms)
    const PINECONE = {
        walkSpeed: 26,
        trigger: 40,         // distancia do pinguim que faz ela se preparar
        triggerY: 24,
        fuse: 800,           // tempo tremendo antes de explodir
        radius: 30,          // alcance da explosao (machuca o pinguim e os outros inimigos)
    };

    // comportamento da rena (px do mundo, ms)
    const REINDEER = {
        walkSpeed: 24,
        sight: 110,          // distancia que enxerga na frente
        sightY: 22,          // diferenca de altura aceita
        windup: 450,         // abaixa a cabeca antes de investir
        chargeSpeed: 165,
        chargeTime: 1100,
        rest: 1000,          // parada depois da investida (hora de pegar por tras)
    };
    const enemyFile = (cfg, a, i) => `${cfg.pasta}${a.arquivo}/${a.arquivo}_${String(i).padStart(2, '0')}.webp`;
    // caixa de colisao de cada inimigo (em pixels do quadro HD), definida no Boot
    const enemyBoxes = {};
    const MAX_TEX = 4096;     // largura maxima das folhas montadas no jogo (limite seguro de placa de video)

    // Limpa a arte que veio de fundo magenta:
    // 1) sombra roxa (meio-tom) embaixo dos pes - so na faixa de baixo da figura, para nao
    //    apagar contornos arroxeados do corpo (isso soltava rabo e chifres do resto);
    // 2) borda rosada (mistura com o fundo): vira contorno escuro em vez de sumir.
    function removeShadow(src, shadow = true, strong = false) {
        const W = src.width, H = src.height;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(src, 0, 0);
        const img = ctx.getImageData(0, 0, W, H), d = img.data;
        let bottom = 0;
        for (let p = 0; p < W * H; p++) if (d[p * 4 + 3] >= 128) bottom = (p / W) | 0;
        const shadowTop = bottom - Math.round(H * 0.1);
        const purple = i => d[i + 2] >= d[i + 1] + 15 && d[i] >= d[i + 1] + 10;
        for (let p = 0; p < W * H; p++) {
            const i = p * 4;
            if (shadow && (p / W | 0) >= shadowTop && d[i + 1] >= 50 && purple(i)) d[i + 3] = 0;
            // forte: tambem a sombra roxa escura (o contorno quase preto fica)
            else if (strong && (p / W | 0) >= shadowTop && Math.max(d[i], d[i + 2]) > 60 && d[i + 2] > d[i + 1] + 25 && d[i] > d[i + 1] + 15) d[i + 3] = 0;
            // forte: no resto da figura, o roxo que sobrou (borda misturada com o fundo) perde a cor
            else if (strong && d[i + 3] && Math.max(d[i], d[i + 2]) > 60 && d[i + 2] > d[i + 1] + 25 && d[i] > d[i + 1] + 15) {
                const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
                d[i] = v * 0.9; d[i + 1] = v * 0.95; d[i + 2] = Math.min(255, v * 1.08);   // cinza-azulado (neve/sombra)
            }
        }
        for (let pass = 0; pass < 2; pass++) {
            const fix = [];
            for (let p = 0; p < W * H; p++) {
                const i = p * 4;
                if (d[i + 3] < 128 || !(d[i + 2] > d[i + 1] + 25 && d[i] > d[i + 1] + 25)) continue;
                const x = p % W, y = (p - x) / W;
                const edge = !x || !y || x === W - 1 || y === H - 1 ||
                    d[i - 4 + 3] < 128 || d[i + 4 + 3] < 128 || d[i - W * 4 + 3] < 128 || d[i + W * 4 + 3] < 128;
                if (edge) fix.push(i);
            }
            for (const i of fix) { d[i] = 34; d[i + 1] = 18; d[i + 2] = 22; }
        }
        ctx.putImageData(img, 0, 0);
        return c;
    }

    // Cenario em camadas (parallax), de Img/ImagemAdventurePenguin/cenario/.
    // altura: altura da camada no mundo; base: onde fica a borda de baixo (y na tela);
    // fator: quanto a camada acompanha a camera (0 = parada, 1 = junto com o chao).
    // As imagens ja vem preparadas para repetir lado a lado (originais em cenario/originais/).
    // Sem os arquivos, o jogo usa o cenario desenhado em art.js.
    // Cada fase escolhe um conjunto pelo campo "cenario" em levels.js (sem ele: 'floresta').
    const BG_SETS = {
        floresta: [
            { key: 'fundo', file: 'cenario/fundo', altura: VIEW_H, base: VIEW_H, fator: 0.1 },   // ceu, montanhas, castelo
            { key: 'meio',  file: 'cenario/meio',  altura: 84,     base: VIEW_H - 36, fator: 0.4 },   // pinheiros
        ],
        lago: [
            { key: 'lago', file: 'cenario/fundo-lago', altura: VIEW_H, base: VIEW_H, fator: 0.15 },  // lago congelado
        ],
        castelo: [
            { key: 'castelo', file: 'cenario/fundo-castelo', altura: VIEW_H, base: VIEW_H, fator: 0.15 },  // chegada ao castelo
        ],
        // portao do castelo: imagem simetrica do tamanho da tela, fica parada (o castelo sempre a frente)
        // encaixe: estica a largura para fechar exatamente a tela (sem repetir a borda)
        // Mundo 6: corredor do castelo (parado; leva a sala do chefe final)
        corredorcastelo: [
            { key: 'corredorcastelo', file: 'cenario/fundo-corredor-castelo', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 6: entrada do castelo (parado; o piso de pedra da imagem e o chao)
        entradacastelo: [
            { key: 'entradacastelo', file: 'cenario/fundo-entrada-castelo', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 6: patio interno do castelo (parado)
        patiocastelo: [
            { key: 'patiocastelo', file: 'cenario/fundo-patio-castelo', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 6: os fundos do castelo do rei (parado; a neve da imagem e o chao)
        fundoscastelo: [
            { key: 'fundoscastelo', file: 'cenario/fundo-fundos-castelo', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // chefe da 5-5: saida da caverna (parado; o chao de pedra da imagem e o chao)
        saidacaverna: [
            { key: 'saidacaverna', file: 'cenario/fundo-saida-caverna', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // chefe da 4-5: vale da montanha a noite (parado, do tamanho da tela)
        valenoite: [
            { key: 'valenoite', file: 'cenario/fundo-vale-noite', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // chefe da 3-5: cascata com o tronco (parada, do tamanho da tela; o tronco e o chao)
        cascatachefe: [
            { key: 'cascatachefe', file: 'cenario/fundo-cascata-chefe', altura: VIEW_H + 28, base: VIEW_H, fator: 0, encaixe: true },   // um pouco maior: o tronco fica nos pes do pinguim
        ],
        // chefe da 2-5: cabana na floresta (parada, do tamanho da tela)
        cabana: [
            { key: 'cabana', file: 'cenario/fundo-cabana', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 4: estrada nevada entre colinas (a estrada e o chao)
        estrada: [
            { key: 'estrada', file: 'cenario/fundo-estrada', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 5: abismo da caverna (parado; sem chao na imagem: o piso e de blocos de gelo)
        abismo: [
            { key: 'abismo', file: 'cenario/fundo-abismo', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 5: caverna com duas cascatas (parado; o piso escuro da imagem e o chao)
        caverna3: [
            { key: 'caverna3', file: 'cenario/fundo-caverna-3', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 5: caverna de gelo com cascata (parado; o piso escuro da imagem e o chao)
        caverna2: [
            { key: 'caverna2', file: 'cenario/fundo-caverna-2', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 5: dentro da caverna de gelo (parado; o piso escuro da imagem e o chao)
        caverna: [
            { key: 'caverna', file: 'cenario/fundo-caverna', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        // Mundo 4: noite na montanha (parado: a lua e a cascata nao se repetem; ceu extra no topo)
        montanhanoite: [
            { key: 'montanhanoite', file: 'cenario/fundo-montanha-noite', altura: Math.round(1051 * VIEW_W / 1671), base: Math.round(1051 * VIEW_W / 1671), fator: 0, encaixe: true },
        ],
        // Mundo 4: o castelo do rei no alto da montanha (parado: um castelo so, sempre a frente)
        montanhacastelo: [
            // a imagem ganhou uma faixa de ceu no topo: na proporcao certa ela passa da base, e o castelo fica abaixo do placar
            { key: 'montanhacastelo', file: 'cenario/fundo-montanha-castelo', altura: Math.round(1051 * VIEW_W / 1671), base: Math.round(1051 * VIEW_W / 1671), fator: 0, encaixe: true },
        ],
        // Mundo 4: estrada ao pe da montanha (pinheiros nas bordas: imagem espelhada)
        estrada2: [
            { key: 'estrada2', file: 'cenario/fundo-estrada-2', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 3: canion com a cascata
        cascata: [
            { key: 'cascata', file: 'cenario/fundo-cascata', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 3: a mesma ponte, a noite
        pontenoite: [
            { key: 'pontenoite', file: 'cenario/fundo-ponte-noite', altura: VIEW_H + 30, base: VIEW_H + 30, fator: 0.15 },
        ],
        // Mundo 3: em cima da ponte sobre o vao (o piso e desenhado pelo jogo)
        ponte: [
            { key: 'ponte', file: 'cenario/fundo-ponte', altura: VIEW_H + 30, base: VIEW_H + 30, fator: 0.15 },   // um pouco maior: o pe do corrimao encosta no piso
        ],
        // Mundo 3: rio com ponte entre pinheiros
        rio: [
            { key: 'rio', file: 'cenario/fundo-rio', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 2: clareira entre pinheiros
        clareira: [
            { key: 'clareira', file: 'cenario/fundo-clareira', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 2: pinhal ao pe das montanhas
        pinhal: [
            { key: 'pinhal', file: 'cenario/fundo-pinhal', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // Mundo 2: montanhas com neblina e a mesma fileira de pinheiros da 1-1 na frente
        pinheiros: [
            { key: 'montanhas', file: 'cenario/fundo-montanhas', altura: VIEW_H, base: VIEW_H, fator: 0.1 },
            { key: 'meio',      file: 'cenario/meio',            altura: 84,     base: VIEW_H - 36, fator: 0.4 },
        ],
        // Mundo 2: planicie nevada com neblina
        planicie: [
            { key: 'planicie', file: 'cenario/fundo-planicie', altura: VIEW_H, base: VIEW_H, fator: 0.15 },
        ],
        // sala do trono (luta com o chefao): parada, do tamanho da tela
        arena: [
            { key: 'arena', file: 'cenario/arena-rei', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
        portao: [
            { key: 'portao', file: 'cenario/fundo-portao', altura: VIEW_H, base: VIEW_H, fator: 0, encaixe: true },
        ],
    };
    const BG_LAYERS = [...new Map([].concat(...Object.values(BG_SETS)).map(l => [l.key, l])).values()];

    // Itens que saem dos presentes (4 quadros cada, olhando para a esquerda, 64px de largura).
    // fish = peixe dourado (poder do cachecol dourado); life = peixe verde (+1 vida).
    const ITEM_ART = {
        fish: { pasta: 'Img/ImagemAdventurePenguin/itens/peixe-dourado/', quadros: 4, fps: 8 },
        life: { pasta: 'Img/ImagemAdventurePenguin/itens/peixe-verde/',   quadros: 4, fps: 8 },
    };

    // ---------------------------------------------------------------
    // Blocos: pecas de Img/ImagemAdventurePenguin/blocos/ montadas num tileset
    // em alta resolucao (TILE_HD px de arte por tile de 16px do mundo).
    // Cada tile recorta um pedaco da peca: [arquivo, escala da peca, x, y] do
    // recorte 64x64 (em px da peca ja escalada). 'src': [x, y] onde comeca a parte
    // usada da peca original. Sem 'crop' = peca inteira encaixada. 'solid': preenche os cantos
    // transparentes com a cor do contorno, para blocos vizinhos ficarem colados (sem fresta).
    // Tiles sem peca (agua, estalagmite) usam a arte de art.js ampliada.
    // ---------------------------------------------------------------
    const TILE_HD = TILE * RES;
    const BLOCK_DIR = 'Img/ImagemAdventurePenguin/blocos/';
    const BLOCK_ART = {
        // chao: peca de terra com neve com 2 tiles de largura (bordas + meio repetivel)
        [T.SNOW_L]: { file: 'terreno/terra-neve-alto', width: 128, crop: [0, 0] },
        [T.SNOW]:   { file: 'terreno/terra-neve-alto', width: 128, crop: [32, 0] },
        [T.SNOW_R]: { file: 'terreno/terra-neve-alto', width: 128, crop: [64, 0] },
        [T.DIRT_L]: { file: 'terreno/terra-neve-alto', width: 128, crop: [0, 64] },
        [T.DIRT]:   { file: 'terreno/terra-neve-alto', width: 128, crop: [32, 64] },
        [T.DIRT_R]: { file: 'terreno/terra-neve-alto', width: 128, crop: [64, 64] },
        [T.BRICK]:   { file: 'blocos/tijolo-laranja' },
        [T.GIFT]:    { file: 'blocos/presente-neve' },
        [T.USED]:    { file: 'blocos/metal' },
        [T.ICE]:     { file: 'blocos/gelo-vidro', solid: true },
        [T.ICE_TOP]: { file: 'blocos/gelo-vidro', solid: true },   // pilar uniforme (a peca com neve tem outro estilo)
        // plataforma de gelo: pontas e meio de uma peca larga; sozinha usa a peca pequena
        [T.PLAT_L]: { file: 'plataformas/gelo-larga', height: 64, crop: [0, 0] },
        [T.PLAT_M]: { file: 'plataformas/gelo-larga', height: 64, crop: [22, 0] },
        [T.PLAT_R]: { file: 'plataformas/gelo-larga', height: 64, crop: [44, 0] },
        [T.PLAT]:   { file: 'plataformas/gelo', fit: true },
        // plataforma de madeira ('w'): sobre a agua, na altura do chao, vira ponte
        // (mesma tabua com neve da ponte, para combinar com o Mundo 3)
        [T.WOOD_L]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [0, 0] },
        [T.WOOD_M]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [126, 0] },
        [T.WOOD_R]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [251, 0] },
        [T.WOOD]:   { file: 'madeira-neve/ponte-tabua', height: 64, crop: [126, 0] },
        // ponte ('D'): tabua com neve, solida; embaixo nao ha nada (buraco = queda no vao)
        [T.DECK_L]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [0, 0] },
        [T.DECK_M]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [126, 0] },
        [T.DECK_R]: { file: 'madeira-neve/ponte-tabua', height: 64, crop: [251, 0] },
        [T.DECK]:   { file: 'madeira-neve/ponte-tabua', height: 64, crop: [126, 0] },
        // nuvem ('c'): pisa em cima e atravessa por baixo
        // tamanho original (256 px = 4 tiles): pontas arredondadas inteiras e ondulacao que emenda a cada tile
        [T.CLOUD_L]: { file: 'nuvem/nuvem', width: 256, crop: [0, 0] },
        [T.CLOUD_M]: { file: 'nuvem/nuvem', width: 256, crop: [64, 0] },
        [T.CLOUD_R]: { file: 'nuvem/nuvem', width: 256, crop: [192, 0] },
        [T.CLOUD]:   { file: 'nuvem/nuvem', width: 256, crop: [64, 0] },
        // caixote ('X'): bloco solido
        [T.CRATE]:  { file: 'madeira-neve/caixote-x', fit: true },
        [T.SPIKE]:  { file: 'armadilhas/espinhos', width: 128, crop: [32, 0], bottom: true },   // 2 espinhos por tile
    };

    // caixa de colisao do pinguim dentro do quadro (definida no Boot conforme a arte)
    // (em pixels do quadro; playerScale converte para o mundo)
    let playerBox = { frameW: 16, frameH: 20, x: 3, w: 10, bottom: 20, h: 18, slideH: 9 };
    let playerScale = 1;

    // ==================== ESTADO DA PARTIDA ====================
    // checkpoint: { level, x, y } do ultimo ponto de controle tocado (recomeco depois de morrer)
    // taken: o que ja foi pego nesta tentativa da fase (chaves "x,y" do mapa). Morrer nao devolve;
    // so zera em fase nova, "reiniciar fase" ou jogo novo.
    // story: mostrar a historia na proxima vez que a fase comecar (so no jogo novo)
    const START_LIVES = 5;       // vidas ao comecar o jogo
    const BANISH_LIVES = 5;      // vidas ao voltar no Mundo 2 depois de perder para o rei
    const CONTINUES = 3;         // continues por partida (game over -> recomeca a fase com 5 vidas)
    const S = { story: false, level: 0, lives: START_LIVES, coins: 0, score: 0, time: 0, powered: false, playing: false, checkpoint: null, taken: null, continues: 3 };
    const newTaken = () => ({ coins: new Set(), gifts: new Set(), bricks: new Set() });

    function resetRun() {
        Object.assign(S, { level: 0, lives: START_LIVES, coins: 0, score: 0, time: 0, powered: false, checkpoint: null, taken: null, continues: CONTINUES });
    }

    function loadRecord() {
        try { return +localStorage.getItem(RECORD_KEY) || 0; } catch (e) { return 0; }
    }
    function saveRecord() {
        try { if (S.score > loadRecord()) localStorage.setItem(RECORD_KEY, S.score); } catch (e) { /* sem armazenamento */ }
    }

    // ==================== HUD / TELAS (HTML) ====================
    const $ = id => document.getElementById(id);
    const pad = (n, len) => String(Math.max(0, n)).padStart(len, '0');
    const hudCache = {};

    function setText(id, value) {
        if (hudCache[id] === value) return;
        hudCache[id] = value;
        $(id).textContent = value;
    }

    function refreshHud() {
        setText('apLives', '× ' + pad(S.lives, 2));
        setText('apCoins', '× ' + pad(S.coins, 3));
        setText('apLevel', LEVELS[S.level].boss ? 'CHEFE' : 'FASE ' + LEVELS[S.level].name);
        setText('apScore', pad(S.score, 6));
        setText('apTime', pad(Math.ceil(S.time), 3));
        $('apTimeBox').classList.toggle('low', S.time <= 60);
    }

    function showScreen(id) {
        document.querySelectorAll('.ap-screen').forEach(el => el.classList.toggle('hidden', el.id !== id));
        $('apStage').classList.toggle('in-menu', !!id);
        const primary = id && $(id).querySelector('[data-primary]');
        if (primary) primary.focus({ preventScroll: true });
    }

    // ==================== MOEDA (arte em alta resolucao) ====================
    // Desenhada no canvas em 4x (48x56 por quadro = 12x14 do mundo). Os quadros sao a moeda
    // girando: COIN_TURN e a largura aparente (1 = de frente, perto de 0 = de lado).
    const COIN_W = 48, COIN_H = 56;
    const COIN_TURN = [1, 0.72, 0.38, 0.12];

    function makeCoinHD(scene) {
        const tex = scene.textures.createCanvas('coinHD', COIN_W * COIN_TURN.length, COIN_H);
        const ctx = tex.getContext();
        const ell = (cx, cy, rx, ry) => { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(rx, 0.5), ry, 0, 0, Math.PI * 2); };
        COIN_TURN.forEach((k, i) => {
            const cx = i * COIN_W + COIN_W / 2, cy = COIN_H / 2, ry = 24, rx = 20 * k;
            const depth = 5 * (1 - k);                       // espessura da borda que aparece ao girar
            // contorno escuro e borda lateral
            ctx.fillStyle = '#5a3500'; ell(cx + depth / 2, cy, rx + depth / 2 + 3, ry + 3); ctx.fill();
            ctx.fillStyle = '#b86e05'; ell(cx + depth, cy, rx, ry); ctx.fill();
            ctx.fillRect(cx, cy - ry, depth, ry * 2);
            // face
            const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
            g.addColorStop(0, '#fff3a6'); g.addColorStop(0.45, '#ffc928'); g.addColorStop(1, '#e08a08');
            ctx.fillStyle = g; ell(cx, cy, rx, ry); ctx.fill();
            if (k > 0.3) {
                // aro interno
                ctx.lineWidth = 3; ctx.strokeStyle = '#c47a06'; ell(cx, cy, rx * 0.72, ry * 0.74); ctx.stroke();
                ctx.lineWidth = 1.5; ctx.strokeStyle = '#ffe58a'; ell(cx - 1, cy - 1, rx * 0.72, ry * 0.74); ctx.stroke();
                // estrela em relevo
                ctx.save(); ctx.translate(cx, cy + 1); ctx.scale(k, 1);
                ctx.beginPath();
                for (let p = 0; p < 10; p++) {
                    const r = p % 2 ? 4.5 : 10.5, a = -Math.PI / 2 + p * Math.PI / 5;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fillStyle = '#d98608'; ctx.fill();
                ctx.lineWidth = 1.5; ctx.strokeStyle = '#a86304'; ctx.stroke();
                ctx.restore();
            }
            // brilho
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ell(cx - rx * 0.45, cy - ry * 0.5, Math.max(1.5, rx * 0.16), 5); ctx.fill();
            tex.add('c' + i, 0, i * COIN_W, 0, COIN_W, COIN_H);
        });
        tex.refresh();
    }

    // ==================== EFEITOS DO CHEFAO ====================
    function makeBossFx(scene) {
        const make = (key, w, h, draw) => {
            const t = scene.textures.createCanvas(key, w, h);
            draw(t.getContext(), w, h);
            t.refresh();
        };
        // onda de gelo que corre pelo chao (pular)
        make('shock', 64, 56, (c, w, h) => {
            c.fillStyle = '#1d3f7a';
            c.beginPath(); c.moveTo(0, h);
            [[8, 22], [16, 30], [24, 4], [34, 26], [42, 12], [52, 30], [64, h]].forEach(([x, y]) => c.lineTo(x, y));
            c.lineTo(0, h); c.fill();
            const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#9fe3ff'); g.addColorStop(1, '#3d8fe0');
            c.fillStyle = g;
            c.beginPath(); c.moveTo(4, h);
            [[10, 26], [17, 33], [24, 10], [33, 30], [42, 17], [50, 33], [60, h]].forEach(([x, y]) => c.lineTo(x, y));
            c.lineTo(4, h); c.fill();
        });
        // estalactite caindo
        make('icicle', 28, 72, (c, w, h) => {
            c.fillStyle = '#1d3f7a';
            c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w / 2, h); c.fill();
            const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#a8e6ff'); g.addColorStop(1, '#4f9de6');
            c.fillStyle = g;
            c.beginPath(); c.moveTo(4, 2); c.lineTo(w - 4, 2); c.lineTo(w / 2, h - 6); c.fill();
        });
        // sombra no chao avisando onde a estalactite vai cair
        // bola de neve arremessada pelo boneco de neve
        make('snowshot', 28, 28, (c, w, h) => {
            c.fillStyle = '#1d3f7a'; c.beginPath(); c.arc(w / 2, h / 2, 13, 0, Math.PI * 2); c.fill();
            const g = c.createRadialGradient(10, 9, 2, 14, 14, 13); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#dcefff'); g.addColorStop(1, '#8fbbe6');
            c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, 11, 0, Math.PI * 2); c.fill();
        });
        make('warn', 48, 12, (c, w, h) => {
            c.fillStyle = 'rgba(10,20,50,0.55)';
            c.beginPath(); c.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill();
        });
    }

    // ==================== HISTORIA (abertura) ====================
    // quem: 'king' (Rei do Gelo), 'penguin' (o heroi) ou '' (narrador, sem imagem)
    const STORY = [
        { quem: '', texto: 'Há muito tempo, o Reino Gelado vivia em paz. Os pinguins pescavam juntos nos lagos congelados e nunca faltava peixe para ninguém.' },
        { quem: 'king', texto: 'Até que o Rei do Gelo, uma morsa gananciosa, decidiu que todos os peixes do mundo deveriam ser só dele.' },
        { quem: 'king', texto: 'Ele congelou os lagos, trancou os peixes no seu castelo e espalhou criaturas pelo caminho. Agora o reino inteiro passa frio e fome.' },
        { quem: 'penguin', texto: 'Mas um pinguim de cachecol vermelho não vai aceitar isso! Atravesse o reino, chegue ao castelo e devolva os peixes a todos!' },
    ];
    // depois de banido pelo rei (inicio do Mundo 2)
    const STORY_BANISH = [
        { quem: 'king', texto: 'E não volte nunca mais! Os peixes são MEUS!' },
        { quem: '', texto: 'Expulso para as Planícies Nevadas, longe do castelo, o pinguim precisa ficar mais forte...' },
        { quem: 'penguin', texto: '...e um dia voltar para a revanche! O reino ainda conta com você.' },
    ];
    // revanche (6-5): o pinguim volta para a sala do trono
    const STORY_REMATCH = [
        { quem: '', texto: 'Planícies, florestas, cavernas, muralhas e corredores... Depois de atravessar o reino inteiro, o pinguim empurra as portas da sala do trono.' },
        { quem: 'king', quadro: 'hurt1', texto: 'O QUÊ?! Como conseguiu retornar? Eu te expulsei para o fim do mundo!' },
        { quem: 'penguin', texto: 'Eu não vou deixar você acabar com os peixes!' },
        { quem: 'king', quadro: 'idle1', texto: 'Meus ursos de armadura... minhas focas, minhas corujas, o Yeti, até o Mamute! Como um pinguim desse tamanho passou por todos eles?' },
        { quem: 'penguin', texto: 'Cada pulo, cada escorregão e cada moeda me deixaram mais forte. E dessa vez eu sei que você não gosta de ser pego pelas costas.' },
        { quem: 'king', quadro: 'laugh2', texto: 'HA HA HA! Eu sou o Rei do Gelo! Cada peixe, cada lago e cada floco de neve deste reino são MEUS!' },
        { quem: 'penguin', texto: 'Lá fora tem filhote passando frio e fome enquanto você guarda mais peixe do que consegue comer em mil invernos.' },
        { quem: 'king', quadro: 'summon2', texto: 'Silêncio! Da última vez você não durou nem um minuto. Hoje vou te transformar numa estátua de gelo para enfeitar o meu salão!' },
        { quem: 'penguin', texto: 'Então vem, Majestade. O reino inteiro está torcendo por mim.' },
        { quem: '', texto: 'O Rei ergue o cetro, as paredes tremem e o gelo estala no teto. Começa a batalha final pelo Reino Gelado!' },
    ];
    // depois de vencer a revanche
    const STORY_VICTORY = [
        { quem: 'king', quadro: 'hurt2', texto: 'Não... não pode ser... derrotado por um pinguim de cachecol...' },
        { quem: 'penguin', texto: 'Acabou, Majestade. Os peixes voltam para os lagos de todo mundo.' },
        { quem: 'king', quadro: 'idle1', texto: 'Eu... eu só tinha medo de passar fome de novo. Por isso guardei tudo só para mim.' },
        { quem: 'penguin', texto: 'Ninguém passa fome quando a gente divide. Tem peixe para você também... é só pescar com a gente.' },
        { quem: '', texto: 'Os lagos descongelaram, os peixes voltaram a nadar e o Reino Gelado fez o maior banquete da sua história... com uma morsa de coroa sentada à mesa.' },
    ];
    let storyLast = 'COMEÇAR!';
    let storyPage = 0, storyTimer = null, storyTyping = false, storyDone = null, storyPages = STORY;

    function openStory(onDone, pages = STORY, last = 'COMEÇAR!') {
        storyPages = pages;
        storyLast = last;
        storyDone = onDone;
        storyPage = 0;
        showScreen('apStory');
        showStoryPage();
    }

    function showStoryPage() {
        const page = storyPages[storyPage];
        const img = $('apStoryImg');
        const scene = game.scene.getScene('Boot');
        const portrait = page.quem === 'king' && game.textures.exists('enemy_king') ? ['enemy_king', page.quadro || 'laugh2']
            : page.quem === 'penguin' ? [game.textures.exists('penguin') ? 'penguin' : null, game.textures.get('penguin').has('idle1') ? 'idle1' : 'idle'] : null;
        if (portrait && portrait[0]) { img.src = ART.frameToDataURL(scene, portrait[0], portrait[1], 1); img.hidden = false; }
        else img.hidden = true;
        $('apStoryCount').textContent = (storyPage + 1) + '/' + storyPages.length;
        $('apStoryNext').textContent = storyPage < storyPages.length - 1 ? 'CONTINUAR' : storyLast;
        // texto aparecendo letra por letra
        const el = $('apStoryText'), full = page.texto;
        let n = 0;
        clearInterval(storyTimer);
        storyTyping = true;
        el.textContent = '';
        storyTimer = setInterval(() => {
            n += 2;
            el.textContent = full.slice(0, n);
            if (n >= full.length) { clearInterval(storyTimer); storyTyping = false; }
        }, 30);
    }

    function nextStory() {
        if (storyTyping) {                       // primeiro clique: mostra o texto todo
            clearInterval(storyTimer);
            storyTyping = false;
            $('apStoryText').textContent = storyPages[storyPage].texto;
            return;
        }
        if (++storyPage < storyPages.length) return showStoryPage();
        closeStory();
    }

    function closeStory() {
        clearInterval(storyTimer);
        storyTyping = false;
        const done = storyDone;
        storyDone = null;
        if (done) done();
    }

    // ==================== CHEFAO (telas) ====================
    function setBossBar(hp, max) {
        $('apBossFill').style.width = Math.max(0, hp / (max || KING.hp) * 100) + '%';
    }

    function showBanish() {
        try { localStorage.setItem(BANISH_KEY, '1'); } catch (e) { /* sem armazenamento */ }
        if (game.textures.exists('enemy_king')) $('apBanishKing').src = ART.frameToDataURL(game.scene.getScene('Level'), 'enemy_king', 'laugh2', 1);
        $('apBanishScore').textContent = pad(S.score, 6);
        showScreen('apBanish');
    }

    // ==================== TALENTOS (tela) ====================
    let coinIconURL = '';
    let talentsBack = 'apMenu';      // tela para onde o VOLTAR retorna

    function openTalents(from) {
        talentsBack = from;
        renderTalents();
        showScreen('apTalents');
    }

    function renderTalents() {
        const coin = coinIconURL ? `<img class="ap-coin-mini" src="${coinIconURL}" alt="moedas">` : '';
        $('apBank').innerHTML = coin + pad(talents.bank, 3);
        $('apTalentList').innerHTML = TALENTS.map(t => {
            const n = talents.lv[t.id], max = n >= TALENT_COSTS.length;
            const now = t.info(physWith());
            const next = max ? '' : t.info(physWith({ ...talents.lv, [t.id]: n + 1 }));
            const cost = TALENT_COSTS[n];
            const pips = TALENT_COSTS.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
            const btn = max
                ? '<button class="ap-btn ap-talent-buy" disabled>MÁXIMO</button>'
                : `<button class="ap-btn ap-talent-buy" data-talent="${t.id}" ${talents.bank < cost ? 'disabled' : ''}>${coin}${cost}</button>`;
            return `<div class="ap-talent${max ? ' max' : ''}">
                <i class="fas ${t.icon} ap-talent-icon"></i>
                <b class="ap-talent-name">${t.name}</b>
                <span class="ap-talent-pips">${pips}</span>
                <span class="ap-talent-info">${now}${max ? '' : '<br><em>&gt; ' + next + '</em>'}</span>
                ${btn}
            </div>`;
        }).join('');
        // especial: aparece quando os 3 estao no maximo (ou se ja foi comprado)
        const allMax = TALENTS.every(t => talents.lv[t.id] >= TALENT_COSTS.length);
        if (allMax || talents.gold) {
            const g = GOLD_TALENT, own = talents.gold;
            const btn = own
                ? '<button class="ap-btn ap-talent-buy" disabled>COMPRADO</button>'
                : `<button class="ap-btn ap-talent-buy" data-talent="${g.id}" ${talents.bank < g.cost ? 'disabled' : ''}>${coin}${g.cost}</button>`;
            $('apTalentList').insertAdjacentHTML('beforeend', `<div class="ap-talent special${own ? ' max' : ''}">
                <i class="fas ${g.icon} ap-talent-icon"></i>
                <b class="ap-talent-name">${g.name}</b>
                <span class="ap-talent-info">Começa cada vida com o cachecol dourado</span>
                ${btn}
            </div>`);
        }
        const spent = talents.gold || TALENTS.some(t => talents.lv[t.id] > 0);
        $('apRefundBtn').disabled = !spent;
    }

    function buyTalent(id) {
        if (id === GOLD_TALENT.id) {
            if (talents.gold || talents.bank < GOLD_TALENT.cost) return;
            talents.bank -= GOLD_TALENT.cost;
            talents.gold = true;
            saveTalents();
            renderTalents();
            $('apTalentBack').focus({ preventScroll: true });
            return;
        }
        const n = talents.lv[id], cost = TALENT_COSTS[n];
        if (cost === undefined || talents.bank < cost) return;
        talents.bank -= cost;
        talents.lv[id] = n + 1;
        saveTalents();
        applyTalents();
        renderTalents();
        const b = $('apTalentList').querySelector(`[data-talent="${id}"]`) || $('apTalentBack');
        b.focus({ preventScroll: true });
    }

    // devolve todas as moedas gastas (para experimentar outra combinacao)
    function refundTalents() {
        if (talents.gold) { talents.bank += GOLD_TALENT.cost; talents.gold = false; }
        for (const t of TALENTS) {
            for (let i = 0; i < talents.lv[t.id]; i++) talents.bank += TALENT_COSTS[i];
            talents.lv[t.id] = 0;
        }
        saveTalents();
        applyTalents();
        renderTalents();
        $('apTalentBack').focus({ preventScroll: true });
    }

    // ==================== CONTROLES DE TOQUE ====================
    const touch = { left: false, right: false, jump: false, down: false };

    function bindTouch(id, key) {
        const el = $(id);
        const on = e => { e.preventDefault(); touch[key] = true; el.classList.add('down'); };
        const off = e => { e.preventDefault(); touch[key] = false; el.classList.remove('down'); };
        el.addEventListener('pointerdown', on);
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => el.addEventListener(ev, off));
        el.addEventListener('contextmenu', e => e.preventDefault());
    }

    // ==================== BOOT: arte e animacoes ====================
    class BootScene extends Phaser.Scene {
        constructor() { super('Boot'); }

        preload() {
            this.load.on('loaderror', () => { /* sprites definitivos ainda nao existem */ });
            // o botao JOGAR so libera quando tudo estiver pronto (jogar antes abria a fase sem as artes)
            this.load.on('progress', v => { $('apPlayBtn').textContent = 'CARREGANDO ' + Math.round(v * 100) + '%'; });
            this.load.image('pz_probe', spritePath(PLAYER_SPRITES.anims.idle, 1));
            for (const file of new Set(Object.values(BLOCK_ART).map(b => b.file))) this.load.image('blk_' + file, BLOCK_DIR + file + '.webp');
            for (const l of BG_LAYERS) this.load.image('bg_' + l.key, 'Img/ImagemAdventurePenguin/' + l.file + '.webp');
            for (const [id, it] of Object.entries(ITEM_ART)) {
                for (let i = 1; i <= it.quadros; i++) this.load.image(`it_${id}${i}`, `${it.pasta}peixe_0${i}.webp`);
            }
            for (const [id, cfg] of Object.entries(ENEMY_ART)) {
                for (const a of Object.values(cfg.anims)) {
                    for (let i = 1; i <= a.quadros; i++) this.load.image(`en_${id}_${a.arquivo}${i}`, enemyFile(cfg, a, i));
                }
            }
        }

        create() {
            ART.build(this, VIEW_W, VIEW_H);
            makeCoinHD(this);
            makeBossFx(this);
            this.buildBlockTiles();
            // cenario em alta resolucao reduzido/ampliado: filtro suave evita serrilhado ao rolar
            for (const l of BG_LAYERS) {
                if (this.textures.exists('bg_' + l.key)) this.textures.get('bg_' + l.key).setFilter(Phaser.Textures.FilterMode.LINEAR);
            }
            for (const [id, cfg] of Object.entries(ENEMY_ART)) this.buildEnemy(id, cfg);
            if (this.textures.exists('pz_probe')) this.loadCustomPlayer();
            else this.finish(false);
        }

        // Monta o tileset 'tilesHD': cada tile com a peca correspondente (ou a arte provisoria ampliada)
        buildBlockTiles() {
            const base = this.textures.get('tiles');
            const count = base.getFrameNames().filter(n => /^t\d+$/.test(n)).length;
            const cols = 8, rows = Math.ceil(count / cols), S = TILE_HD;
            const canvas = document.createElement('canvas');
            canvas.width = cols * S; canvas.height = rows * S;
            const ctx = canvas.getContext('2d');
            for (let i = 0; i < count; i++) {
                const dx = (i % cols) * S, dy = Math.floor(i / cols) * S;
                const art = BLOCK_ART[i];
                const key = art && 'blk_' + art.file;
                if (art && this.textures.exists(key)) {
                    const img = this.textures.get(key).getSourceImage();
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    if (art.crop) {
                        const sc = art.width ? art.width / img.width : art.height / img.height;
                        const [cx, cy] = art.crop;
                        const sw = Math.min(S / sc, img.width - cx / sc), sh = Math.min(S / sc, img.height - cy / sc);
                        ctx.drawImage(img, cx / sc, cy / sc, sw, sh, dx, art.bottom ? dy + S - sh * sc : dy, sw * sc, sh * sc);
                    } else if (art.fit) {
                        const sc = Math.min(S / img.width, S / img.height);
                        const top = art.bottom ? dy + S - img.height * sc : dy;   // apoiada no chao ou no topo do tile
                        ctx.drawImage(img, dx + (S - img.width * sc) / 2, top, img.width * sc, img.height * sc);
                    } else {
                        const [sx, sy] = art.src || [0, 0];
                        if (art.solid) {
                            // cor do contorno: primeiro pixel opaco no meio da borda de cima da peca
                            const probe = document.createElement('canvas'); probe.width = 1; probe.height = img.height;
                            const pc = probe.getContext('2d'); pc.drawImage(img, img.width >> 1, 0, 1, img.height, 0, 0, 1, img.height);
                            const col = pc.getImageData(0, 0, 1, img.height).data;
                            let y = 0; while (y < img.height - 1 && col[y * 4 + 3] < 200) y++;
                            ctx.fillStyle = `rgb(${col[y * 4]},${col[y * 4 + 1]},${col[y * 4 + 2]})`;
                            ctx.fillRect(dx, dy, S, S);
                        }
                        ctx.drawImage(img, sx, sy, img.width - sx, img.height - sy, dx, dy, S, S);
                    }
                } else {
                    const fr = base.get('t' + i);
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, dx, dy, S, S);
                }
            }
            // alfa binario: bordas nitidas, sem halo entre tiles
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height), d = img.data;
            for (let p = 3; p < d.length; p += 4) d[p] = d[p] >= 100 ? 255 : 0;
            ctx.putImageData(img, 0, 0);
            const tex = this.textures.addCanvas('tilesHD', canvas);
            for (let i = 0; i < count; i++) tex.add('t' + i, 0, (i % cols) * S, Math.floor(i / cols) * S, S, S);
        }

        // Folha de um inimigo: todos os quadros na mesma escala (vieram com o mesmo tamanho),
        // centralizados e apoiados pela base; a caixa de colisao sai do primeiro quadro andando.
        // Gera a textura 'enemy_<id>' e as animacoes 'en-<id>-walk' / 'en-<id>-die'.
        buildEnemy(id, cfg) {
            const size = cfg.tamanho * RES;
            const list = [];
            for (const [anim, a] of Object.entries(cfg.anims)) {
                for (let i = 1; i <= a.quadros; i++) {
                    const key = `en_${id}_${a.arquivo}${i}`;
                    if (!this.textures.exists(key)) continue;
                    let src = this.textures.get(key).getSourceImage();
                    if (cfg.semSombra || cfg.semFranja) src = removeShadow(src, !cfg.semFranja || !!cfg.sombraRoxa, !!cfg.sombraRoxa);
                    list.push({ name: anim + i, anim, m: this.measureFrame(src, false) });
                }
            }
            const ref = list.find(f => f.anim === 'walk');
            if (!ref) return;
            const sc = cfg.altura * RES / ref.m.h;
            // quadros em grade de no maximo 4096 px de largura: muitas placas de video nao aceitam
            // texturas mais largas que isso (passando, a textura falha e aparece o quadrado verde)
            const cols = Math.max(1, Math.min(list.length, Math.floor(MAX_TEX / size)));
            const cell = i => [(i % cols) * size, Math.floor(i / cols) * size];
            const sheet = document.createElement('canvas');
            sheet.width = size * cols;
            sheet.height = size * Math.ceil(list.length / cols);
            const ctx = sheet.getContext('2d', { willReadFrequently: true });
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            list.forEach((f, i) => {
                const m = f.m, k = Math.min(sc * (cfg.anims[f.anim].escala || 1), (size - 2) / m.w, (size - 1) / m.h);
                const w = m.w * k, h = m.h * k, [ox, oy] = cell(i);
                ctx.drawImage(m.canvas, m.x0, m.y0, m.w, m.h, ox + Math.round((size - w) / 2), oy + Math.round(size - 1 - h), Math.round(w), Math.round(h));
            });
            const img = ctx.getImageData(0, 0, sheet.width, sheet.height), d = img.data;
            for (let p = 3; p < d.length; p += 4) d[p] = d[p] >= 110 ? 255 : 0;
            ctx.putImageData(img, 0, 0);

            const bw = Math.round(ref.m.w * sc * 0.7), bh = Math.round(ref.m.h * sc * 0.7);
            enemyBoxes[id] = { x: Math.round(size / 2 - bw / 2), y: size - 1 - bh, w: bw, h: bh };

            const texKey = 'enemy_' + id;
            const tex = this.textures.addCanvas(texKey, sheet);
            list.forEach((f, i) => { const [ox, oy] = cell(i); tex.add(f.name, 0, ox, oy, size, size); });
            for (const [anim, a] of Object.entries(cfg.anims)) {
                const frames = list.filter(f => f.anim === anim).map(f => ({ key: texKey, frame: f.name }));
                if (frames.length) this.anims.create({ key: `en-${id}-${anim}`, frames, frameRate: a.fps, repeat: a.repetir ? -1 : 0 });
            }
            for (const [anim, x] of Object.entries(cfg.extras || {})) {
                const frames = x.quadros.map(n => x.de + n).filter(n => list.some(f => f.name === n)).map(frame => ({ key: texKey, frame }));
                if (frames.length) this.anims.create({ key: `en-${id}-${anim}`, frames, frameRate: x.fps, repeat: -1 });
            }
        }

        loadCustomPlayer() {
            for (const a of Object.values(PLAYER_SPRITES.anims)) {
                for (let i = 1; i <= a.quadros; i++) this.load.image(`pz_${a.arquivo}${i}`, spritePath(a, i));
            }
            this.load.once('complete', () => this.finish(this.buildCustomPlayer()));
            this.load.start();
        }

        // Analisa um quadro original: remove fiapos soltos (restos do recorte da folha)
        // e mede a figura (caixa e quantidade de pixels)
        measureFrame(src, despill = true) {
            const W = src.width, H = src.height;
            const c = document.createElement('canvas');
            c.width = W; c.height = H;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(src, 0, 0);
            const img = ctx.getImageData(0, 0, W, H), d = img.data;
            // sobra do fundo verde (o pinguim nao tem verde): na borda o pixel sai,
            // por dentro so perde o tom verde. Repete para limpar bordas de 2-3px.
            for (let pass = 0; pass < (despill ? 4 : 0); pass++) {
                const clear = [];
                for (let p = 0; p < W * H; p++) {
                    if (d[p * 4 + 3] < 128) continue;
                    const r = d[p * 4], g = d[p * 4 + 1], b = d[p * 4 + 2];
                    const green = g > Math.max(r, b) + 3;          // inclui os verdes bem escuros
                    const teal = g > r + 30 && g >= b * 0.8;        // verde-azulado (o azul-marinho tem bem mais azul)
                    if (!green && !teal) continue;
                    const x = p % W, y = (p - x) / W;
                    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1 ||
                        d[(p - 1) * 4 + 3] < 128 || d[(p + 1) * 4 + 3] < 128 || d[(p - W) * 4 + 3] < 128 || d[(p + W) * 4 + 3] < 128;
                    if (edge) clear.push(p);
                    else if (green) d[p * 4 + 1] = Math.max(r, b);
                }
                if (!clear.length) break;
                for (const p of clear) d[p * 4 + 3] = 0;
            }
            const label = new Int32Array(W * H), sizes = [0], minX = [0], maxX = [0], stack = [];
            for (let p = 0; p < W * H; p++) {
                if (d[p * 4 + 3] < 128 || label[p]) continue;
                const id = sizes.length;
                let n = 0, lo = W, hi = 0;
                label[p] = id; stack.push(p);
                while (stack.length) {
                    const q = stack.pop(); n++;
                    const x = q % W, y = (q - x) / W;
                    if (x < lo) lo = x;
                    if (x > hi) hi = x;
                    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                        const r = ny * W + nx;
                        if (d[r * 4 + 3] >= 128 && !label[r]) { label[r] = id; stack.push(r); }
                    }
                }
                sizes.push(n); minX.push(lo); maxX.push(hi);
            }
            // fora: pedacos minusculos e pedacos pequenos encostados na borda lateral do recorte
            // (restos dos quadros vizinhos na folha original)
            const big = Math.max(...sizes);
            const left = Math.min(...minX.slice(1)), right = Math.max(...maxX.slice(1));
            const drop = sizes.map((n, id) => id > 0 && (n < big * 0.02 ||
                (n < big * 0.15 && (minX[id] <= left + 1 || maxX[id] >= right - 1))));
            let x0 = W, y0 = H, x1 = -1, y1 = -1, count = 0;
            for (let p = 0; p < W * H; p++) {
                if (!label[p] || drop[label[p]]) { d[p * 4 + 3] = 0; continue; }
                d[p * 4 + 3] = 255;
                const x = p % W, y = (p - x) / W;
                count++;
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
            }
            ctx.putImageData(img, 0, 0);
            return { canvas: c, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1, count };
        }

        // Monta uma folha unica com todos os quadros no tamanho do jogo (mais a versao com
        // cachecol dourado). Os quadros vieram ajustados um a um para caber na tela de origem,
        // entao os mais largos ficaram menores: a escala de cada um e corrigida pela area da
        // figura, para o pinguim ter o mesmo tamanho em todas as poses.
        buildCustomPlayer() {
            const size = PLAYER_SPRITES.tamanho * RES;
            const list = [];
            for (const [anim, a] of Object.entries(PLAYER_SPRITES.anims)) {
                for (let i = 1; i <= a.quadros; i++) {
                    const key = `pz_${a.arquivo}${i}`;
                    if (this.textures.exists(key)) list.push({ name: anim + i, anim, m: this.measureFrame(this.textures.get(key).getSourceImage()) });
                }
            }
            const idle = list.filter(f => f.anim === 'idle');
            if (!idle.length) return false;
            const refCount = idle.reduce((t, f) => t + f.m.count, 0) / idle.length;
            const refH = idle.reduce((t, f) => t + f.m.h, 0) / idle.length;
            const base = PLAYER_SPRITES.alturaParado * RES / refH;

            const sheet = document.createElement('canvas');
            sheet.width = size * list.length;
            sheet.height = size;
            const ctx = sheet.getContext('2d', { willReadFrequently: true });
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            list.forEach((f, i) => {
                const m = f.m;
                const fix = Phaser.Math.Clamp(Math.sqrt(refCount / m.count), 0.85, 1.7);
                const sc = Math.min(base * fix, (size - 2) / m.w, (size - 1) / m.h);   // nunca sai do quadro
                const w = m.w * sc, h = m.h * sc;
                // centralizado, apoiado pelos pes na base do quadro
                ctx.drawImage(m.canvas, m.x0, m.y0, m.w, m.h,
                    i * size + Math.round((size - w) / 2), Math.round(size - 1 - h), Math.round(w), Math.round(h));
            });
            // alfa binario: contorno nitido, sem borda semitransparente
            const img = ctx.getImageData(0, 0, sheet.width, size), d = img.data;
            for (let p = 3; p < d.length; p += 4) d[p] = d[p] >= 110 ? 255 : 0;
            // a reducao mistura cores: tira de novo qualquer pixel esverdeado que tenha surgido
            for (let p = 0; p < d.length; p += 4) {
                const r = d[p], g = d[p + 1], b = d[p + 2];
                if (d[p + 3] && (g > Math.max(r, b) + 3 || (g > r + 30 && g >= b * 0.8))) {
                    d[p + 1] = Math.min(g, Math.max(r, b));
                    if (g > r + 30 && g >= b * 0.8) d[p + 3] = 0;
                }
            }
            ctx.putImageData(img, 0, 0);

            // caixa de colisao a partir dos quadros parados
            let x0 = size, x1 = 0, y0 = size, y1 = 0;
            list.forEach((f, i) => {
                if (f.anim !== 'idle') return;
                for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
                    if (d[(y * sheet.width + i * size + x) * 4 + 3]) {
                        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
                    }
                }
            });
            const w = Math.round((x1 - x0 + 1) * 0.55), h = Math.round((y1 - y0 + 1) * 0.9);
            playerBox = { frameW: size, frameH: size, x: Math.round(size / 2 - w / 2), w, bottom: y1 + 1, h, slideH: Math.round(h * 0.5) };

            const addSheet = (key, canvas) => {
                if (this.textures.exists(key)) this.textures.remove(key);   // substitui a arte provisoria
                const tex = this.textures.addCanvas(key, canvas);
                list.forEach((f, i) => tex.add(f.name, 0, i * size, 0, size, size));
            };
            addSheet('penguin', sheet);

            // cachecol dourado: troca os vermelhos fortes por dourado
            const gold = document.createElement('canvas');
            gold.width = sheet.width; gold.height = size;
            const gimg = ctx.getImageData(0, 0, sheet.width, size), g = gimg.data;
            for (let p = 0; p < g.length; p += 4) {
                const r = g[p], gr = g[p + 1], b = g[p + 2];
                if (g[p + 3] && r > 120 && r > gr * 1.8 && r > b * 1.8) {
                    g[p + 1] = Math.min(255, r * 0.82); g[p + 2] = Math.round(b * 0.4);
                }
            }
            gold.getContext('2d').putImageData(gimg, 0, 0);
            addSheet('penguinGold', gold);
            playerScale = 1 / RES;
            return true;
        }

        finish(custom) {
            // arte provisoria: quadros nomeados dentro das texturas 'penguin' e 'penguinGold' (art.js)
            const placeholder = {
                idle: [['idle'], 4, true], run: [['walk1', 'walk3', 'walk2', 'walk3'], 10, true],
                jump: [['jump'], 1, false], fall: [['fall'], 1, true], slide: [['slide'], 1, false],
                hurt: [['hurt'], 1, false], die: [['hurt'], 1, false],
            };
            for (const [skin, key] of [['n', 'penguin'], ['g', 'penguinGold']]) {
                for (const [anim, a] of Object.entries(PLAYER_SPRITES.anims)) {
                    const frames = custom
                        ? (a.usar || Array.from({ length: a.quadros }, (_, i) => i + 1)).map(n => ({ key, frame: anim + n })).filter(f => this.textures.get(key).has(f.frame))
                        : placeholder[anim][0].map(frame => ({ key, frame }));
                    this.anims.create({
                        key: `${skin}-${anim}`, frames,
                        frameRate: custom ? a.fps : placeholder[anim][1],
                        repeat: (custom ? a.repetir : placeholder[anim][2]) ? -1 : 0,
                    });
                }
            }
            for (const [id, it] of Object.entries(ITEM_ART)) {
                const frames = [];
                for (let i = 1; i <= it.quadros; i++) if (this.textures.exists(`it_${id}${i}`)) frames.push({ key: `it_${id}${i}` });
                if (frames.length) this.anims.create({ key: 'item-' + id, frames, frameRate: it.fps, repeat: -1 });
            }
            this.anims.create({ key: 'coin-spin', frames: ['c0', 'c1', 'c2', 'c3', 'c2', 'c1'].map(frame => ({ key: 'coinHD', frame })), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'snow-walk', frames: [{ key: 'snowball', frame: 's0' }, { key: 'snowball', frame: 's1' }], frameRate: 5, repeat: -1 });
            this.anims.create({ key: 'urchin-walk', frames: [{ key: 'urchin', frame: 'u0' }, { key: 'urchin', frame: 'u1' }], frameRate: 4, repeat: -1 });

            // icones do HUD
            const idleFrame = custom ? 'idle1' : 'idle';
            $('apLifeIcon').src = ART.frameToDataURL(this, 'penguin', idleFrame, custom ? 1 : 3);
            $('apCoinIcon').src = ART.frameToDataURL(this, 'coinHD', 'c0', 1);
            coinIconURL = $('apCoinIcon').src;
            renderTalents();
            $('apMenuPenguin').src = ART.frameToDataURL(this, 'penguin', idleFrame, custom ? 2 : 8);
            $('apRecord').textContent = pad(loadRecord(), 6);
            gameReady = true;
            $('apPlayBtn').disabled = false;
            $('apPlayBtn').textContent = 'JOGAR';
            showScreen('apMenu');
        }
    }

    // ==================== FASE ====================
    class LevelScene extends Phaser.Scene {
        constructor() { super('Level'); }

        create() {
            const level = LEVELS[S.level];
            // a cena e reaproveitada entre fases: limpa o que pode ter sobrado da fase anterior
            this.boss = null; this.hazards = null; this.flagZone = null; this.cpZone = null; this.cpFlag = null;
            S.time = level.time;
            S.playing = true;
            this.state = { dead: false, won: false, invulnUntil: 0, hurtUntil: 0, lastGround: 0, bufferUntil: 0,
                jumpHeldPrev: false, jumpCut: false, headLatch: false, sliding: false, slideUntil: 0, downPrev: false, facing: 1 };

            this.parseLevel(level.map);
            this.createBackground();
            this.createMap();
            this.createObjects();
            this.createPlayer();
            this.createInput();

            this.physics.add.collider(this.player, this.layer);
            this.physics.add.collider(this.enemies, this.layer, null, (e) => (e.kind !== 'owl' && e.kind !== 'bat' && e.kind !== 'royalowl') || e.dead, this);
            this.physics.add.collider(this.enemies, this.enemies, (a, b) => {
                a.dir *= -1; b.dir *= -1;
                for (const r of [a, b]) if ((r.kind === 'reindeer' || r.kind === 'ox' || r.kind === 'moose' || r.kind === 'royalmoose' || GUARDS[r.kind]) && r.mode === 'charge') r.modeUntil = 0;
            });
            this.physics.add.collider(this.items, this.layer);
            this.physics.add.overlap(this.player, this.enemies, this.onEnemy, null, this);
            this.shots = this.physics.add.group({ allowGravity: false });
            this.physics.add.collider(this.shots, this.layer, (shot) => { this.puff(shot.x, shot.y); shot.destroy(); });
            this.physics.add.overlap(this.player, this.shots, (p, shot) => {
                if (this.state.dead || this.state.won) return;
                this.puff(shot.x, shot.y);
                shot.destroy();
                this.hurt();
            });
            this.physics.add.overlap(this.player, this.coins, this.onCoin, null, this);
            this.physics.add.overlap(this.player, this.items, this.onItem, null, this);
            if (this.flagZone) this.physics.add.overlap(this.player, this.flagZone, this.onFlag, null, this);
            if (level.boss) this.createBoss();
            if (this.cpZone) this.physics.add.overlap(this.player, this.cpZone, this.onCheckpoint, null, this);

            const cam = this.cameras.main;
            cam.setZoom(RES);
            cam.setBounds(0, 0, this.mapW, this.mapH);
            cam.startFollow(this.player, true, 0.15, 0.15, 0, 20);
            cam.setDeadzone(40, 60);
            cam.fadeIn(250, 10, 20, 40);

            this.timer = this.time.addEvent({
                delay: 1000, loop: true, callback: () => {
                    if (this.state.dead || this.state.won || this.state.story) return;
                    S.time--;
                    if (S.time <= 0) { S.time = 0; this.die(); }
                },
            });

            showScreen(null);
            refreshHud();
            if (S.story) {
                // o pinguim aparece na fase e tudo fica parado enquanto a historia e contada
                S.story = false;
                this.state.story = true;
                this.physics.pause();
                const pages = S.storyPages || STORY;
                const lastLabel = pages === STORY_REMATCH ? 'LUTAR!' : 'COMEÇAR!';
                S.storyPages = null;
                this.time.delayedCall(450, () => openStory(() => {
                    this.state.story = false;
                    this.physics.resume();
                    showScreen(null);
                }, pages, lastLabel));
            }
        }

        // ---------- leitura do mapa em texto ----------
        parseLevel(rows) {
            const H = rows.length, W = Math.max(...rows.map(r => r.length));
            const at = (x, y) => (y >= 0 && y < H && x >= 0 && x < W ? (rows[y][x] || ' ') : ' ');
            this.mapW = W * TILE;
            this.mapH = H * TILE;
            this.data = [];
            this.gifts = new Map();
            this.spawns = { coins: [], enemies: [], signs: [], flag: null, start: { x: 2 * TILE, y: 13 * TILE } };

            for (let y = 0; y < H; y++) {
                const line = [];
                for (let x = 0; x < W; x++) {
                    const c = at(x, y);
                    let t = -1;
                    if (c === 'G') {
                        if (at(x, y - 1) !== 'G') t = at(x - 1, y) !== 'G' && x > 0 ? T.SNOW_L : at(x + 1, y) !== 'G' && x < W - 1 ? T.SNOW_R : T.SNOW;
                        else t = at(x - 1, y) !== 'G' && x > 0 ? T.DIRT_L : at(x + 1, y) !== 'G' && x < W - 1 ? T.DIRT_R : T.DIRT;
                    } else if (c === 'I') t = at(x, y - 1) === 'I' ? T.ICE : T.ICE_TOP;
                    else if (c === 'B') t = T.BRICK;
                    else if (c === '$' || c === 'F' || c === 'V') { t = T.GIFT; this.gifts.set(x + ',' + y, c === 'F' ? 'fish' : c === 'V' ? 'life' : 'coin'); }
                    else if (c === '=') {
                        const l = at(x - 1, y) === '=', r = at(x + 1, y) === '=';
                        t = l && r ? T.PLAT_M : r ? T.PLAT_L : l ? T.PLAT_R : T.PLAT;
                    }
                    else if (c === 'D') {
                        const l = at(x - 1, y) === 'D', r = at(x + 1, y) === 'D';
                        t = l && r ? T.DECK_M : r ? T.DECK_L : l ? T.DECK_R : T.DECK;
                    }
                    else if (c === 'X') t = T.CRATE;
                    else if (c === '_') t = T.ROAD;          // chao invisivel: o desenho e a estrada do fundo
                    else if (c === 'c') {
                        const l = at(x - 1, y) === 'c', r = at(x + 1, y) === 'c';
                        t = l && r ? T.CLOUD_M : r ? T.CLOUD_L : l ? T.CLOUD_R : T.CLOUD;
                    }
                    else if (c === 'w') {
                        const l = at(x - 1, y) === 'w', r = at(x + 1, y) === 'w';
                        t = l && r ? T.WOOD_M : r ? T.WOOD_L : l ? T.WOOD_R : T.WOOD;
                    }
                    else if (c === '^') t = T.SPIKE;
                    else if (c === '~') t = at(x, y - 1) === '~' ? T.WATER : T.WATER_TOP;
                    else if (c === 'o') this.spawns.coins.push({ x, y });
                    else if ('eurpnyfabmkvlhjgqtx'.includes(c)) this.spawns.enemies.push({ x, y, kind: { e: 'snow', u: 'urchin', r: 'reindeer', p: 'pinecone', n: 'bigsnow', y: 'bear', f: 'seal', a: 'owl', b: 'ox', m: 'rat', k: 'beaver', v: 'bat', l: 'moose', h: 'narwhal', j: 'bearguard', g: 'sealguard', q: 'royalowl', t: 'urchinguard', x: 'royalmoose' }[c] });
                    else if (c === 'P') this.spawns.start = { x: x * TILE + 8, y: (y + 1) * TILE };
                    else if (c === '>') this.spawns.signs.push({ x, y });
                    else if (c === '|') this.spawns.flag = { x, y };
                    else if (c === 'K') this.spawns.checkpoint = { x: x * TILE + 8, y: (y + 1) * TILE };
                    line.push(t);
                }
                this.data.push(line);
            }
        }

        createBackground() {
            // cada item: [tileSprite, fator do parallax, escala da textura, deriva por ms]
            this.parallax = [];
            const layers = BG_SETS[LEVELS[S.level].cenario] || BG_SETS.floresta;
            if (layers.every(l => this.textures.exists('bg_' + l.key))) {
                for (const l of layers) {
                    const img = this.textures.get('bg_' + l.key).getSourceImage();
                    const ts = l.altura / img.height;
                    const t = this.add.tileSprite(FIX_X, FIX_Y + l.base - l.altura, VIEW_W, l.altura, 'bg_' + l.key)
                        .setOrigin(0).setScrollFactor(0).setTileScale(l.encaixe ? VIEW_W / img.width : ts, ts);
                    this.parallax.push([t, l.fator, ts, 0]);
                }
            } else {
                this.add.image(FIX_X, FIX_Y, 'bgSky').setOrigin(0).setScrollFactor(0);
                const layer = (y, h, key, fator, drift) => this.parallax.push([
                    this.add.tileSprite(FIX_X, FIX_Y + y, VIEW_W, h, key).setOrigin(0).setScrollFactor(0), fator, 1, drift]);
                layer(8, 110, 'bgClouds', 0.08, 0.004);
                layer(VIEW_H - 40 - 170, 170, 'bgFar', 0.22, 0);
                layer(VIEW_H - 30 - 90, 90, 'bgTrees', 0.45, 0);
            }
            if (LEVELS[S.level].boss === 'king' || LEVELS[S.level].boss === 'king2' || /^caverna|abismo|saidacaverna/.test(LEVELS[S.level].cenario || '')) return;      // dentro do castelo e da caverna nao neva
            this.add.particles(0, 0, 'flake', {
                x: { min: FIX_X, max: FIX_X + VIEW_W }, y: FIX_Y - 4, lifespan: 9000,
                speedY: { min: 12, max: 28 }, speedX: { min: -8, max: 8 },
                frequency: 220, alpha: { start: 0.9, end: 0.5 }, scale: { min: 0.6, max: 1 },
            }).setScrollFactor(0).setDepth(30);
        }

        createMap() {
            this.map = this.make.tilemap({ data: this.data, tileWidth: TILE_HD, tileHeight: TILE_HD });
            const tiles = this.map.addTilesetImage('tilesHD');
            this.layer = this.map.createLayer(0, tiles, 0, 0).setDepth(10).setScale(1 / RES);
            if (!S.taken) S.taken = newTaken();
            for (const k of S.taken.gifts) {
                const [x, y] = k.split(',').map(Number);
                this.layer.putTileAt(T.USED, x, y);
                this.gifts.delete(k);
            }
            for (const k of S.taken.bricks) {
                const [x, y] = k.split(',').map(Number);
                this.layer.removeTileAt(x, y);
            }
            this.layer.setCollision(SOLID);
            // plataformas de gelo: so colidem por cima (da para atravessar pulando por baixo)
            this.layer.forEachTile(t => { if (PLATS.includes(t.index)) t.setCollision(false, false, true, false); });

            if (LEVELS[S.level].boss) this.layer.setVisible(false);
            this.physics.world.setBounds(0, 0, this.mapW, this.mapH + 200);
            this.physics.world.setBoundsCollision(true, true, false, false);
        }

        createObjects() {
            this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
            for (const c of this.spawns.coins) {
                const key = c.x + ',' + c.y;
                if (S.taken.coins.has(key)) continue;
                // caixa 10x12 do mundo (a arte esta em 4x)
                const coin = this.coins.create(c.x * TILE + 8, c.y * TILE + 8, 'coinHD', 'c0').setScale(1 / RES).play('coin-spin').setDepth(12);
                coin.body.setSize(10 * RES, 12 * RES);
                coin.mapKey = key;
            }

            this.items = this.physics.add.group();

            this.enemies = this.physics.add.group();
            for (const e of this.spawns.enemies) this.spawnEnemy(e.kind, e.x * TILE + 8, (e.y + 1) * TILE);
            this.createSigns();
        }

        spawnEnemy(kind, px, bottom, awake = false) {
            {
                const e = { kind };
                const snow = e.kind === 'snow';
                const box = enemyBoxes[e.kind];
                const s = box
                    ? this.enemies.create(px, bottom, 'enemy_' + e.kind, 'walk1')
                    : this.enemies.create(px, bottom, snow ? 'snowball' : 'urchin', snow ? 's0' : 'u0');
                s.setOrigin(0.5, 1).setDepth(14).play(box ? `en-${e.kind}-walk` : snow ? 'snow-walk' : 'urchin-walk');
                s.custom = !!box;
                s.kind = e.kind;
                s.dir = -1;
                s.speed = snow ? 32 : (e.kind === 'reindeer' || e.kind === 'ox' || e.kind === 'moose' || e.kind === 'royalmoose' || e.kind === 'moose' || e.kind === 'royalmoose') ? REINDEER.walkSpeed : e.kind === 'pinecone' ? PINECONE.walkSpeed : 22;
                s.facesRight = !!(ENEMY_ART[e.kind] && ENEMY_ART[e.kind].olhaDireita && box);
                s.mode = 'walk';          // rena/gigante: walk | windup | charge | rest (| hurt)
                s.guard = GUARDS[e.kind] || null;
                s.hp = e.kind === 'bigsnow' ? BIGSNOW.hp : e.kind === 'beaver' ? 3 : GUARDS[e.kind] ? GUARDS[e.kind].hp : e.kind === 'royalowl' ? ROYALOWL.hp : (e.kind === 'bear' || e.kind === 'seal' || e.kind === 'rat' || e.kind === 'beaver' || e.kind === 'narwhal' || e.kind === 'bearguard' || e.kind === 'sealguard') ? BEAR.hp : 1;
                s.nextThrow = 0;
                s.invulnUntil = 0;
                s.modeUntil = 0;
                s.awake = false;
                if (box) {
                    s.setScale(1 / RES);
                    s.body.setSize(box.w, box.h).setOffset(box.x, box.y);
                } else if (snow) s.body.setSize(12, 12).setOffset(2, 4);
                else s.body.setSize(12, 9).setOffset(2, 4);
                s.body.enable = false;  // acorda quando aparece na tela
                if (e.kind === 'owl' || e.kind === 'bat' || e.kind === 'royalowl') {
                    // voa: sem gravidade e sem colidir com o cenario
                    s.body.setAllowGravity(false);
                    s.homeX = px; s.homeY = bottom; s.mode = 'patrol'; s.dir = -1;
                }
                if (awake) { s.awake = true; s.body.enable = true; }
                return s;
            }
        }

        createSigns() {

            for (const sg of this.spawns.signs) this.add.image(sg.x * TILE + 8, (sg.y + 1) * TILE, 'sign').setOrigin(0.5, 1).setDepth(9);

            const cp = this.spawns.checkpoint;
            if (cp) {
                const active = S.checkpoint && S.checkpoint.level === S.level;
                this.add.image(cp.x, cp.y, 'pole').setOrigin(0.5, 1).setScale(0.8, 0.22).setDepth(11);
                this.cpFlag = this.add.image(cp.x + 1, cp.y - 32, 'flag').setOrigin(0, 0).setScale(0.7).setDepth(11)
                    .setTint(active ? 0xffffff : 0x8a96a8);
                this.cpZone = this.add.zone(cp.x, cp.y - 16, 10, 32);
                this.physics.add.existing(this.cpZone, true);
            }

            if (LEVELS[S.level].boss) return;
            const f = this.spawns.flag || { x: this.data[0].length - 6, y: 13 };
            const px = f.x * TILE + 8, ground = (f.y + 1) * TILE;
            this.add.image(px, ground, 'poleBase').setOrigin(0.5, 1).setDepth(11);
            this.pole = this.add.image(px, ground - 12, 'pole').setOrigin(0.5, 1).setDepth(11);
            this.flag = this.add.image(px + 1, ground - 12 - 140, 'flag').setOrigin(0, 0).setDepth(11);
            this.flagInfo = { x: px, top: ground - 12 - 142, ground: ground - 12 };
            this.flagZone = this.add.zone(px, ground - 80, 6, 160);
            this.physics.add.existing(this.flagZone, true);
        }

        createPlayer() {
            const st = S.checkpoint && S.checkpoint.level === S.level ? S.checkpoint : this.spawns.start;
            if (talents.gold) S.powered = true;          // talento: comeca com o cachecol dourado
            this.skin = S.powered ? 'g' : 'n';
            this.player = this.physics.add.sprite(st.x, st.y, S.powered ? 'penguinGold' : 'penguin');
            this.player.setOrigin(0.5, 1).setDepth(20).setCollideWorldBounds(true).setScale(playerScale);
            this.player.body.setMaxVelocityY(520);
            this.setPlayerBody(false);
            this.player.play(this.skin + '-idle');
        }

        // caixa de colisao: normal ou baixa (escorregando), espelhada conforme o lado
        setPlayerBody(low) {
            const b = playerBox, body = this.player.body;
            const h = low ? b.slideH : b.h;
            const x = this.state.facing < 0 ? b.frameW - b.x - b.w : b.x;
            body.setSize(b.w, h, false);
            body.setOffset(x, b.bottom - h);
            this.lowBody = low;
        }

        createInput() {
            this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,A,D,W,S,Z,X');
        }

        readInput() {
            const k = this.keys;
            return {
                left: k.LEFT.isDown || k.A.isDown || touch.left,
                right: k.RIGHT.isDown || k.D.isDown || touch.right,
                jump: k.SPACE.isDown || k.UP.isDown || k.W.isDown || k.Z.isDown || touch.jump,
                down: k.DOWN.isDown || k.S.isDown || k.X.isDown || touch.down,
            };
        }

        // ---------- loop ----------
        update(time, delta) {
            const cam = this.cameras.main;
            const viewX = cam.worldView.x;
            // tilePosition fica em pixels da textura: divide pela escala para andar em px do mundo
            for (const [t, fator, ts, drift] of this.parallax) t.tilePositionX = (viewX * fator + time * drift) / ts;

            if (this.state.story) return;      // historia na tela: tudo parado
            this.updateEnemies();
            if (this.shots) for (const shot of this.shots.getChildren()) {
                if (Math.abs(shot.x - shot.startX) > (shot.range || SNOWMAN.shotRange)) { this.puff(shot.x, shot.y); shot.destroy(); }
            }
            if (this.boss) this.updateBoss(time);
            refreshHud();
            if (this.state.dead || this.state.won) return;

            this.updatePlayer(time, delta / 1000);
            this.checkHead();
            this.checkHazards();
        }

        updatePlayer(now, dt) {
            const p = this.player, body = p.body, st = this.state, input = this.readInput();
            const onGround = body.blocked.down;
            if (onGround) { st.lastGround = now; st.jumpCut = false; }

            const jumpPressed = input.jump && !st.jumpHeldPrev;
            st.jumpHeldPrev = input.jump;
            if (jumpPressed) st.bufferUntil = now + PHYS.buffer;
            // JustDown usa o evento da tecla: um toque rapido (apertou e soltou no mesmo quadro) tambem conta
            const JD = Phaser.Input.Keyboard.JustDown, k = this.keys;
            const downPressed = JD(k.DOWN) || JD(k.S) || JD(k.X) || (touch.down && !st.downPrev);
            st.downPrev = touch.down;

            // escorregao: para baixo enquanto corre no chao
            if (!st.sliding && downPressed && onGround && Math.abs(body.velocity.x) > 50) {
                st.sliding = true;
                st.slideUntil = now + PHYS.slideTime;
                body.setVelocityX(st.facing * PHYS.slideSpeed);
                this.setPlayerBody(true);
                this.puff(p.x - st.facing * 6, p.y);
            }
            if (st.sliding) {
                // segurar para baixo prolonga o escorregao (bom para atravessar tuneis)
                const ended = (now > st.slideUntil && !input.down) || Math.abs(body.velocity.x) < 30 || jumpPressed;
                if (ended && this.roomToStand()) {
                    st.sliding = false;
                    this.setPlayerBody(false);
                } else {
                    // perde velocidade aos poucos (sem passar de um minimo enquanto nao cabe em pe)
                    const v = body.velocity.x * Math.pow(0.35, dt);
                    const min = input.down ? PHYS.slideHoldSpeed : this.roomToStand() ? 0 : 60;
                    body.setVelocityX(Math.abs(v) < min ? st.facing * min : v);
                }
            }

            // andar
            if (!st.sliding) {
                const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
                if (dir) st.facing = dir;
                const target = dir * PHYS.maxSpeed;
                const rate = dir ? (onGround ? PHYS.accel : PHYS.airAccel) : (onGround ? PHYS.decel : PHYS.airAccel * 0.4);
                const vx = body.velocity.x;
                body.setVelocityX(vx < target ? Math.min(target, vx + rate * dt) : Math.max(target, vx - rate * dt));
            }

            // pulo com "coyote time" e pulo antecipado
            const canJump = now - st.lastGround < PHYS.coyote;
            if (now < st.bufferUntil && canJump && !st.sliding) {
                body.setVelocityY(-PHYS.jump);
                st.bufferUntil = 0;
                st.lastGround = 0;
                st.jumpCut = false;
                p.play(this.skin + '-jump', true);
            }
            if (!input.jump && body.velocity.y < 0 && !st.jumpCut) {
                body.setVelocityY(body.velocity.y * PHYS.jumpCut);
                st.jumpCut = true;
            }

            if (p.flipX !== (st.facing < 0)) {
                p.setFlipX(st.facing < 0);
                this.setPlayerBody(this.lowBody);
            }

            // animacao
            let anim;
            if (now < st.hurtUntil) anim = 'hurt';
            else if (st.sliding) anim = 'slide';
            else if (!onGround) anim = body.velocity.y < 0 ? 'jump' : 'fall';
            else anim = Math.abs(body.velocity.x) > 12 ? 'run' : 'idle';
            const key = this.skin + '-' + anim;
            if (p.anims.currentAnim?.key !== key) p.play(key, true);
            if (anim === 'run') p.anims.timeScale = 0.6 + Math.abs(body.velocity.x) / PHYS.maxSpeed * 0.6;
            else p.anims.timeScale = 1;

            if (now < st.invulnUntil) p.setAlpha(Math.floor(now / 80) % 2 ? 0.35 : 1);
            else p.setAlpha(1);
        }

        roomToStand() {
            const b = this.player.body;
            const top = b.bottom - playerBox.h * playerScale;
            for (const x of [b.left + 1, b.right - 1]) {
                const t = this.layer.getTileAtWorldXY(x, top + 1);
                if (t && t.collides && !PLATS.includes(t.index)) return false;
            }
            return true;
        }

        // ---------- blocos atingidos de baixo ----------
        checkHead() {
            const body = this.player.body;
            const up = body.blocked.up;
            if (up && !this.state.headLatch) {
                let best = null, bestDist = Infinity;
                for (const x of [body.left + 1, body.center.x, body.right - 1]) {
                    const t = this.layer.getTileAtWorldXY(x, body.top - 2);
                    if (!t || !t.collides) continue;
                    const d = Math.abs(t.getCenterX() - body.center.x);
                    if (d < bestDist) { best = t; bestDist = d; }
                }
                if (best) this.hitBlock(best);
            }
            this.state.headLatch = up;
        }

        // true se cair nessa coluna (a partir de y) leva para fora do mapa ou para a agua
        pitBelow(x, y) {
            const tx = this.layer.worldToTileX(x);
            for (let ty = this.layer.worldToTileY(y); ty < this.layer.layer.height; ty++) {
                const t = this.layer.getTileAt(tx, ty);
                if (!t) continue;
                if (t.index === T.WATER || t.index === T.WATER_TOP) return true;
                if (t.collides) return false;
            }
            return true;
        }

        hitBlock(tile) {
            const cx = tile.getCenterX(), top = tile.getTop();
            if (tile.index === T.GIFT) {
                const content = this.gifts.get(tile.x + ',' + tile.y) || 'coin';
                S.taken.gifts.add(tile.x + ',' + tile.y);
                this.layer.putTileAt(T.USED, tile.x, tile.y);
                this.bumpTile(this.layer.getTileAt(tile.x, tile.y));
                if (content === 'fish' || content === 'life') this.spawnFish(cx, top, content);
                else this.popCoin(cx, top);
            } else if (tile.index === T.BRICK) {
                if (S.powered) this.breakBrick(tile);
                else this.bumpTile(tile);
            } else return;
            this.knockEnemiesOn(tile);
        }

        bumpTile(tile) {
            tile.setAlpha(0);
            const spr = this.add.image(tile.getCenterX(), tile.getCenterY(), 'tilesHD', 't' + tile.index).setDepth(11).setScale(1 / RES);
            this.tweens.add({ targets: spr, y: spr.y - 5, duration: 70, yoyo: true, onComplete: () => { spr.destroy(); tile.setAlpha(1); } });
        }

        breakBrick(tile) {
            const cx = tile.getCenterX(), cy = tile.getCenterY();
            S.taken.bricks.add(tile.x + ',' + tile.y);
            this.layer.removeTileAt(tile.x, tile.y);
            for (const [vx, vy] of [[-60, -220], [60, -220], [-40, -150], [40, -150]]) {
                const d = this.physics.add.image(cx, cy, 'debris').setDepth(25);
                d.body.setVelocity(vx, vy).setAngularVelocity(vx * 6);
                this.time.delayedCall(1200, () => d.destroy());
            }
            this.addScore(SCORE.brick, cx, cy - 8);
        }

        popCoin(x, top) {
            const c = this.add.sprite(x, top - 8, 'coinHD').setScale(1 / RES).play('coin-spin').setDepth(12);
            this.tweens.add({ targets: c, y: top - 36, duration: 260, yoyo: true, ease: 'Quad.easeOut', onComplete: () => c.destroy() });
            this.collectCoin(x, top - 20);
        }

        spawnFish(x, top, kind = 'fish') {
            const art = this.anims.exists('item-' + kind);
            const f = art
                ? this.items.create(x, top + 8, `it_${kind}1`).play('item-' + kind).setScale(1 / RES)
                : this.items.create(x, top + 8, 'fish').setTint(kind === 'life' ? 0x7dff8a : 0xffffff);
            f.kind = kind;
            f.art = art;
            f.body.enable = false;
            this.tweens.add({
                targets: f, y: top - 4, duration: 450,
                onComplete: () => {
                    f.setDepth(15);
                    f.body.enable = true;
                    // caixa ~12x8 px do mundo (a arte nova esta em 4x)
                    if (art) f.body.setSize(12 * RES, 8 * RES).setOffset((f.width - 12 * RES) / 2, f.height - 8 * RES);
                    else f.body.setSize(12, 8);
                    f.body.setBounce(0, 0);
                    f.dir = 1;
                    f.setVelocityX(55);
                },
            });
        }

        knockEnemiesOn(tile) {
            for (const e of this.enemies.getChildren()) {
                if (e.dead || !e.body.enable || e.kind === 'reindeer' || e.kind === 'ox' || e.kind === 'moose' || e.kind === 'royalmoose' || e.kind === 'bear' || e.kind === 'seal' || e.kind === 'rat' || e.kind === 'beaver' || e.kind === 'narwhal' || e.kind === 'bearguard' || e.kind === 'sealguard') continue;
                if (e.kind === 'bigsnow') {
                    if (Math.abs(e.x - tile.getCenterX()) < 18 && Math.abs(e.body.bottom - tile.getTop()) < 4) this.hitBigSnow(e);
                    continue;
                }
                if (Math.abs(e.x - tile.getCenterX()) < 14 && Math.abs(e.body.bottom - tile.getTop()) < 4) this.knockEnemy(e, Math.sign(e.x - tile.getCenterX()) || 1);
            }
        }

        // ---------- perigos ----------
        checkHazards() {
            const p = this.player, b = p.body;
            if (p.y > this.mapH + 24) return this.die();
            const tiles = this.layer.getTilesWithinWorldXY(b.x, b.y, b.width, b.height);
            for (const t of tiles) {
                const tTop = t.getTop(), tLeft = t.getLeft();
                if ((t.index === T.WATER || t.index === T.WATER_TOP) && b.bottom > tTop + 6) {
                    this.splash(p.x, tTop + 2);
                    return this.die(true);
                }
                if (t.index === T.SPIKE && b.bottom > tTop + 8 && b.right > tLeft + 2 && b.left < tLeft + 14) this.hurt();
            }
        }

        // ---------- inimigos ----------
        updateEnemies() {
            const cam = this.cameras.main;
            for (const e of this.enemies.getChildren()) {
                if (e.dead) {
                    if (e.y > this.mapH + 60) e.destroy();
                    continue;
                }
                if (!e.awake) {
                    if (e.x < cam.worldView.x + VIEW_W + 24) { e.awake = true; e.body.enable = true; }
                    else continue;
                }
                if (e.y > this.mapH + 40) { e.destroy(); continue; }
                const b = e.body;
                if (e.kind === 'reindeer' || e.kind === 'ox' || e.kind === 'moose' || e.kind === 'royalmoose' || e.kind === 'moose' || e.kind === 'royalmoose') { this.updateReindeer(e); continue; }
                if (e.kind === 'bigsnow') { this.updateBigSnow(e); continue; }
                if (e.kind === 'bear' || e.kind === 'seal' || e.kind === 'rat' || e.kind === 'beaver' || e.kind === 'narwhal' || e.kind === 'bearguard' || e.kind === 'sealguard') { this.updateBear(e); continue; }
                if (e.kind === 'owl' || e.kind === 'bat' || e.kind === 'royalowl') { this.updateOwl(e); continue; }
                if (e.kind === 'pinecone' && e.mode !== 'walk') { this.updatePinecone(e); continue; }
                if (e.kind === 'pinecone') this.updatePinecone(e);
                if (b.blocked.left) e.dir = 1;
                else if (b.blocked.right) e.dir = -1;
                else if (b.blocked.down) {
                    // vira na beirada em vez de cair
                    const ahead = this.layer.getTileAtWorldXY(e.x + e.dir * 8, b.bottom + 4);
                    if (!ahead || !ahead.collides) e.dir *= -1;
                }
                b.setVelocityX(e.dir * e.speed);
                e.setFlipX(e.facesRight ? e.dir < 0 : e.dir > 0);
            }
            for (const f of this.items.getChildren()) {
                if (!f.body.enable) continue;
                if (f.body.blocked.left) f.dir = 1;
                if (f.body.blocked.right) f.dir = -1;
                // na beirada: se embaixo for buraco ou agua, da meia-volta (o peixe nao se perde)
                if (f.body.blocked.down) {
                    const ax = f.x + f.dir * 7, ahead = this.layer.getTileAtWorldXY(ax, f.body.bottom + 4);
                    if ((!ahead || !ahead.collides) && this.pitBelow(ax, f.body.bottom + 4)) f.dir *= -1;
                }
                f.setVelocityX(f.dir * 55);
                f.setFlipX(f.art ? f.dir > 0 : f.dir < 0);   // a arte nova olha para a esquerda
                if (f.y > this.mapH + 40) f.destroy();
            }
        }

        // ==================== CHEFE: YETI (4-5) ====================
        // a mesma luta para o Yeti (4-5) e o Mamute (5-5): muda arte, nome e numeros
        createYetiBoss() {
            const C = LEVELS[S.level].boss === 'mammoth' ? MAMMOTH : YETI;
            const box = enemyBoxes[C.art];
            this.floorY = this.spawns.start.y;
            const k = box
                ? this.physics.add.sprite(this.mapW - 110, this.floorY, 'enemy_' + C.art, 'walk1').setScale(1 / RES)
                : this.physics.add.sprite(this.mapW - 110, this.floorY, 'snowball', 's0').setScale(3);
            k.setOrigin(0.5, 1).setDepth(13);
            if (box) k.body.setSize(box.w, box.h).setOffset(box.x, box.y);
            k.setCollideWorldBounds(true);
            k.custom = !!box;
            Object.assign(k, { cfg: C, type: 'yeti', art: C.art, hp: C.hp, dir: -1, mode: 'intro', until: this.time.now + 2000, dead: false, invulnUntil: 0, last: '' });
            this.boss = k;
            this.bossPlay('idle');
            this.physics.add.collider(k, this.layer);
            this.physics.add.overlap(this.player, k, this.onYetiBoss, null, this);
            this.hazards = this.physics.add.group({ allowGravity: false });
            this.physics.add.overlap(this.player, this.hazards, () => this.hurt(), null, this);
            this.time.delayedCall(300, () => this.bossSay(C.say));
            $('apBossName').textContent = C.name;
            $('apStage').classList.add('boss-mode');
            setBossBar(k.hp, C.hp);
            this.events.once('shutdown', () => $('apStage').classList.remove('boss-mode'));
        }

        yetiShock(spd) {
            const k = this.boss, C = k.cfg;
            for (const dir of [-1, 1]) {
                const w = this.hazards.create(k.x + dir * 30 * C.shockSize, this.floorY, 'shock').setOrigin(0.5, 1).setScale(1.1 * C.shockSize / RES).setDepth(15);
                w.setFlipX(dir < 0);
                w.body.setSize(40, 32).setOffset(12, 24);
                w.body.setVelocityX(dir * C.shockSpeed * spd);
            }
        }

        updateYetiBoss(now) {
            const k = this.boss, b = k.body, p = this.player, C = k.cfg;
            for (const h of this.hazards.getChildren()) if (h.x < -30 || h.x > this.mapW + 30) h.destroy();
            if (k.dead) return;
            const ph = k.hp > C.hp * 2 / 3 ? 0 : k.hp > C.hp / 3 ? 1 : 2;
            const spd = C.speed[ph], pace = C.pace[ph];
            const face = () => { if (Math.abs(p.x - k.x) > 6) k.dir = Math.sign(p.x - k.x); };
            const go = (mode, ms) => { k.mode = mode; k.until = now + ms; };
            if (this.state.dead) { b.setVelocityX(0); this.bossPlay('idle'); return; }

            switch (k.mode) {
                case 'intro':
                    b.setVelocityX(0); face();
                    if (now >= k.until) go('think', C.think * pace);
                    break;
                case 'think':
                    b.setVelocityX(0); face(); this.bossPlay('idle');
                    if (now >= k.until) {
                        const pick = k.last === 'charge' ? 'slam' : k.last === 'slam' ? 'charge' : (Math.random() < 0.5 ? 'slam' : 'charge');
                        k.last = pick;
                        if (pick === 'slam') go('walk', 1400);
                        else { go('windup', 700 * pace); this.floatText('!', k.x, k.y - 60, '#ff5a5a'); }
                    }
                    break;
                case 'walk':                       // chega perto e bate no chao
                    face();
                    b.setVelocityX(k.dir * C.walkSpeed * spd);
                    this.bossPlay('walk');
                    if (Math.abs(p.x - k.x) < 80 || now >= k.until) { b.setVelocityX(0); this.bossPlay('slam', true); go('slam', 520 * pace); }
                    break;
                case 'slam':
                    b.setVelocityX(0);
                    if (now >= k.until) {
                        this.yetiShock(spd);
                        if (ph === 2) this.time.delayedCall(480, () => { if (!k.dead && !this.state.dead) this.yetiShock(spd); });
                        this.cameras.main.flash(90, 200, 230, 255);
                        go('recover', 900 * pace);
                    }
                    break;
                case 'recover':
                    b.setVelocityX(0);
                    if (now >= k.until) { this.bossPlay('idle'); go('think', C.think * pace); }
                    break;
                case 'windup':                     // mira e ruge
                    b.setVelocityX(0); face(); this.bossPlay('idle');
                    if (now >= k.until) { go('charge', 4000); this.bossPlay('charge', true); }
                    break;
                case 'charge':
                    b.setVelocityX(k.dir * C.chargeSpeed * spd);
                    if (b.blocked.left || b.blocked.right || now >= k.until) {
                        b.setVelocityX(0);
                        this.cameras.main.flash(140, 255, 255, 255);
                        this.puff(k.x + k.dir * 20, k.y - 30);
                        this.bossPlay('hurt', true);
                        go('stun', C.stun * (ph === 2 ? 0.85 : 1));
                    }
                    break;
                case 'stun':                       // atordoado na parede: pise na cabeca
                    b.setVelocityX(0);
                    if (now >= k.until) { this.bossPlay('idle'); go('think', C.think * pace * 0.6); }
                    break;
                case 'hurt':
                    b.setVelocityX(0);
                    if (now >= k.until) { this.bossPlay('idle'); go('think', 500); }
                    break;
            }
            k.setFlipX(k.dir < 0);
        }

        onYetiBoss(player, k) {
            const C = k.cfg;
            const st = this.state;
            if (st.dead || st.won || k.dead || k.mode === 'intro') return;
            const pb = player.body, kb = k.body;
            const now = this.time.now;
            const stomp = pb.velocity.y > 20 && pb.bottom - kb.top < 14;
            if (stomp && k.mode === 'stun') {
                k.graceUntil = now + 500;          // o pinguim ainda encosta enquanto quica: nao machuca
                pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp) * 1.15);
                st.jumpCut = false;
                if (this.time.now < k.invulnUntil) return;
                k.hp--;
                k.invulnUntil = this.time.now + 900;
                setBossBar(k.hp, C.hp);
                this.addScore(300, k.x, k.y - 60);
                this.puff(k.x, k.y - 40);
                if (k.hp <= 0) return this.defeatYetiBoss();
                k.mode = 'hurt'; k.until = this.time.now + 700;
                this.bossPlay('hurt', true);
                k.setTintFill(0xffffff);
                this.time.delayedCall(90, () => k.clearTint());
                return;
            }
            if (stomp) {                           // pisar fora da hora: so quica (sem dano)
                pb.setVelocity(-k.dir * 160, -260);
                st.jumpCut = false;
                k.graceUntil = now + 500;
                return;
            }
            if (now < (k.graceUntil || 0)) return;
            // atordoado ou levando o golpe: encostar so afasta (ele nao ataca)
            if (k.mode === 'stun' || k.mode === 'hurt') {
                pb.setVelocityX(Math.sign(player.x - k.x || 1) * 160);
                return;
            }
            this.hurt();
        }

        defeatYetiBoss() {
            const k = this.boss, st = this.state;
            k.dead = true;
            st.won = true;
            k.body.setVelocity(0, 0);
            this.bossPlay('die', true);
            this.hazards.clear(true, true);
            this.cameras.main.flash(300, 255, 255, 255);
            this.player.body.setVelocityX(0);
            S.score += 5000;
            this.floatText('+5000', k.x, k.y - 70, '#ffd23f');
            this.time.delayedCall(2600, () => {
                S.playing = false;
                const last = S.level >= LEVELS.length - 1;
                $('apClearTitle').textContent = k.cfg.title;
                $('apClearHeightLabel').textContent = 'CHEFE DERROTADO';
                $('apClearHeight').textContent = '+5000';
                $('apClearTimeLabel').textContent = 'VIDAS';
                $('apClearTime').textContent = pad(S.lives, 2);
                $('apClearScore').textContent = pad(S.score, 6);
                $('apNextBtn').textContent = last ? 'JOGAR DE NOVO' : 'PRÓXIMA FASE';
                $('apNextBtn').dataset.last = last ? '1' : '';
                $('apNextBtn').dataset.gate = '';
                if (last) saveRecord();
                refreshHud();
                showScreen('apClear');
            });
        }

        // ==================== CHEFE: FLOCO DE NEVE (3-5) ====================
        createFlakeBoss() {
            const box = enemyBoxes.flakeboss;
            this.floorY = this.spawns.start.y;
            const k = box
                ? this.physics.add.sprite(this.mapW - 120, -40, 'enemy_flakeboss', 'walk1').setScale(1 / RES)
                : this.physics.add.sprite(this.mapW - 120, -40, 'snowball', 's0').setScale(3);
            k.setOrigin(0.5, 1).setDepth(13);
            if (box) k.body.setSize(box.w, box.h).setOffset(box.x, box.y);
            k.body.setAllowGravity(false);
            k.custom = !!box;
            Object.assign(k, { type: 'snowflake', art: 'flakeboss', hp: FLAKE.hp, dir: -1, mode: 'intro', until: this.time.now + 2200, dead: false, invulnUntil: 0, last: '' });
            this.boss = k;
            this.bossPlay('walk');
            this.physics.add.overlap(this.player, k, this.onFlakeBoss, null, this);
            this.hazards = this.physics.add.group({ allowGravity: false });
            this.physics.add.overlap(this.player, this.hazards, (p, h) => { h.destroy(); this.hurt(); }, null, this);
            this.time.delayedCall(700, () => this.bossSay('Você vai virar gelo, pinguim!'));
            $('apBossName').textContent = 'FLOCO DE NEVE';
            $('apStage').classList.add('boss-mode');
            setBossBar(k.hp, FLAKE.hp);
            this.events.once('shutdown', () => $('apStage').classList.remove('boss-mode'));
        }

        // dispara um caco/lanca de gelo na direcao (vx, vy)
        flakeShot(x, y, vx, vy, scale = 1) {
            const h = this.hazards.create(x, y, 'icicle').setScale(scale / RES).setDepth(15);
            h.rotation = Math.atan2(vy, vx) - Math.PI / 2;      // a estalactite aponta para baixo
            h.body.setSize(16, 16).setOffset(6, 48);
            h.body.setVelocity(vx, vy);
            h.kind = 'shot';
            return h;
        }

        updateFlakeBoss(now) {
            const k = this.boss, b = k.body, p = this.player;
            // projeteis: somem fora da tela ou no chao
            for (const h of this.hazards.getChildren()) {
                if (h.x < -30 || h.x > this.mapW + 30 || h.y < -40 || h.y > this.floorY + 4) { if (h.y > this.floorY) this.puff(h.x, this.floorY - 2); h.destroy(); }
            }
            if (k.dead) return;
            const ph = k.hp > FLAKE.hp * 2 / 3 ? 0 : k.hp > FLAKE.hp / 3 ? 1 : 2, pace = FLAKE.pace[ph];
            const highY = this.floorY - FLAKE.high, lowY = this.floorY - FLAKE.low;
            const go = (mode, ms) => { k.mode = mode; k.until = now + ms; };
            const bob = Math.sin(now / 260) * 10;
            const face = () => { k.dir = Math.sign(p.x - k.x) || k.dir; };
            if (this.state.dead) { b.setVelocity(0, 0); return; }

            switch (k.mode) {
                case 'intro':            // desce do ceu ate a altura de voo
                    b.setVelocity(0, Math.max(-40, Math.min(90, (highY - k.y) * 3)));
                    if (now >= k.until) go('think', FLAKE.think * pace);
                    break;
                case 'think':            // la no alto, segue o pinguim devagar
                    face();
                    b.setVelocity(Math.sign(p.x - k.x) * Math.min(FLAKE.follow, Math.abs(p.x - k.x)), (highY - k.y) * 3 + bob);
                    this.bossPlay('walk');
                    if (now >= k.until) {
                        const pick = k.last === 'explode' ? 'lances' : (ph === 0 && k.last !== 'lances' ? 'lances' : (Math.random() < 0.55 ? 'explode' : 'lances'));
                        k.last = pick;
                        if (pick === 'lances') { k.volleys = FLAKE.volleys[ph]; go('lances', 99999); k.nextVolley = now + 300; this.bossPlay('lances', true); }
                        else { k.targetX = Phaser.Math.Clamp(p.x, 40, this.mapW - 40); go('descend', 1600); this.bossPlay('walk'); }
                    }
                    break;
                case 'lances':           // mira e dispara 3 lancas em leque
                    b.setVelocity(0, (highY - k.y) * 3);
                    face();
                    if (now >= k.nextVolley) {
                        const sx = k.x + k.dir * 14, sy = k.y - 18;
                        const base = Math.atan2(p.y - 8 - sy, p.x - sx);
                        for (const off of [-0.22, 0, 0.22]) this.flakeShot(sx, sy, Math.cos(base + off) * FLAKE.lanceSpeed, Math.sin(base + off) * FLAKE.lanceSpeed, 0.8);
                        if (--k.volleys > 0) { k.nextVolley = now + 650; this.time.delayedCall(250, () => { if (!k.dead && k.mode === 'lances') this.bossPlay('lances', true); }); }
                        else go('think', FLAKE.think * pace);
                    }
                    break;
                case 'descend':          // desce perto do tronco, em cima de onde o pinguim estava
                    b.setVelocity((k.targetX - k.x) * 2, (lowY - k.y) * 3);
                    if (Math.abs(lowY - k.y) < 3 || now >= k.until) { b.setVelocity(0, 0); go('charge', 900 * pace); this.bossPlay('explode', true); k.setTint(0xbfe8ff); }
                    break;
                case 'charge':           // carregando (brilha)
                    b.setVelocity(0, 0);
                    if (now >= k.until) {
                        k.clearTint();
                        const n = ph === 2 ? 12 : 8, sx = k.x, sy = k.y - 18;
                        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; this.flakeShot(sx, sy, Math.cos(a) * FLAKE.shardSpeed, Math.sin(a) * FLAKE.shardSpeed, 0.6); }
                        this.cameras.main.flash(120, 200, 235, 255);
                        go('dizzy', FLAKE.dizzy * (ph === 2 ? 0.8 : 1));
                    }
                    break;
                case 'dizzy':            // tonto embaixo: hora de pular nele
                    b.setVelocity(0, (lowY - k.y) * 3 + bob * 0.5);
                    this.bossPlay('idle');
                    if (now >= k.until) go('rise', 1200);
                    break;
                case 'rise':
                case 'hurt':
                    b.setVelocity(0, (highY - k.y) * 3);
                    if (now >= k.until || Math.abs(highY - k.y) < 3) go('think', FLAKE.think * pace * 0.7);
                    break;
            }
            k.setFlipX(k.dir < 0);
        }

        onFlakeBoss(player, k) {
            const st = this.state;
            if (st.dead || st.won || k.dead || k.mode === 'intro') return;
            const pb = player.body, kb = k.body;
            if (pb.velocity.y > 20 && pb.bottom - kb.top < 14) {
                pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp) * 1.15);
                st.jumpCut = false;
                if (this.time.now < k.invulnUntil) return;
                k.hp--;
                k.invulnUntil = this.time.now + 1000;
                setBossBar(k.hp, FLAKE.hp);
                this.addScore(300, k.x, k.y - 50);
                this.puff(k.x, k.y - 20);
                if (k.hp <= 0) return this.defeatFlakeBoss();
                k.mode = 'hurt'; k.until = this.time.now + 900;
                this.bossPlay('hurt', true);
                k.setTintFill(0xffffff);
                this.time.delayedCall(90, () => k.clearTint());
                return;
            }
            if (this.time.now < k.invulnUntil) return;
            this.hurt();
        }

        defeatFlakeBoss() {
            const k = this.boss, st = this.state;
            k.dead = true;
            st.won = true;
            k.body.setVelocity(0, 0);
            k.clearTint();
            this.bossPlay('die', true);
            this.hazards.clear(true, true);
            this.cameras.main.flash(300, 255, 255, 255);
            this.player.body.setVelocityX(0);
            S.score += 5000;
            this.floatText('+5000', k.x, k.y - 70, '#ffd23f');
            this.time.delayedCall(2600, () => {
                S.playing = false;
                const last = S.level >= LEVELS.length - 1;
                $('apClearTitle').textContent = 'FLOCO DE NEVE DERROTADO!';
                $('apClearHeightLabel').textContent = 'CHEFE DERROTADO';
                $('apClearHeight').textContent = '+5000';
                $('apClearTimeLabel').textContent = 'VIDAS';
                $('apClearTime').textContent = pad(S.lives, 2);
                $('apClearScore').textContent = pad(S.score, 6);
                $('apNextBtn').textContent = last ? 'JOGAR DE NOVO' : 'PRÓXIMA FASE';
                $('apNextBtn').dataset.last = last ? '1' : '';
                $('apNextBtn').dataset.gate = '';
                if (last) saveRecord();
                refreshHud();
                showScreen('apClear');
            });
        }

        // ==================== CHEFE: BONECO DE NEVE (2-5) ====================
        createSnowBoss() {
            const box = enemyBoxes.snowboss;
            this.floorY = this.spawns.start.y;
            const k = box
                ? this.physics.add.sprite(this.mapW - 110, this.floorY, 'enemy_snowboss', 'walk1').setScale(1 / RES)
                : this.physics.add.sprite(this.mapW - 110, this.floorY, 'snowball', 's0').setScale(3);
            k.setOrigin(0.5, 1).setDepth(13);
            if (box) k.body.setSize(box.w, box.h).setOffset(box.x, box.y);
            k.setCollideWorldBounds(true);
            k.custom = !!box;
            Object.assign(k, { type: 'snowman', art: 'snowboss', hp: SNOWBOSS.hp, dir: -1, mode: 'intro', until: this.time.now + 2000, dead: false, invulnUntil: 0 });
            this.boss = k;
            this.bossPlay('idle');
            this.physics.add.collider(k, this.layer);
            this.physics.add.overlap(this.player, k, this.onSnowBoss, null, this);
            this.time.delayedCall(300, () => this.bossSay('Daqui você não passa, pinguim!'));
            $('apBossName').textContent = 'BONECO DE NEVE';
            $('apStage').classList.add('boss-mode');
            setBossBar(k.hp, SNOWBOSS.hp);
            this.events.once('shutdown', () => $('apStage').classList.remove('boss-mode'));
        }

        updateSnowBoss(now) {
            const k = this.boss, b = k.body, p = this.player;
            if (k.dead) return;
            const ph = k.hp > SNOWBOSS.hp * 2 / 3 ? 0 : k.hp > SNOWBOSS.hp / 3 ? 1 : 2;
            const spd = SNOWBOSS.speed[ph], pace = SNOWBOSS.pace[ph];
            const face = () => { if (Math.abs(p.x - k.x) > 6) k.dir = Math.sign(p.x - k.x); };
            const go = (mode, ms) => { k.mode = mode; k.until = now + ms; };
            const near = () => Math.abs(p.x - k.x) < SNOWBOSS.slashRange && Math.abs(p.body.bottom - b.bottom) < 24;
            const slash = () => { face(); b.setVelocityX(0); this.bossPlay('slash', true); go('slash', 520); k.hitFrom = now + 230; k.hitTo = now + 420; k.hitDone = false; };
            const throwing = () => { face(); b.setVelocityX(0); k.shotsLeft = SNOWBOSS.shots[ph]; k.nextShot = now + 300; this.bossPlay('throw', true); go('throw', 99999); };
            if (this.state.dead) { b.setVelocityX(0); this.bossPlay('idle'); return; }

            switch (k.mode) {
                case 'intro':
                    b.setVelocityX(0); face();
                    if (now >= k.until) go('think', SNOWBOSS.think * pace);
                    break;
                case 'think':
                    b.setVelocityX(0); face(); this.bossPlay('idle');
                    if (now >= k.until) {
                        if (near()) slash();
                        else if (Math.random() < 0.35) go('walk', 1300);
                        else throwing();
                    }
                    break;
                case 'walk':
                    face();
                    b.setVelocityX(k.dir * SNOWBOSS.walkSpeed * spd);
                    this.bossPlay('walk');
                    if (near()) slash();
                    else if (now >= k.until) throwing();
                    break;
                case 'slash':
                    b.setVelocityX(0);
                    if (!k.hitDone && now >= k.hitFrom && now <= k.hitTo) {
                        const ahead = (p.x - k.x) * k.dir;
                        if (ahead > -6 && ahead < SNOWBOSS.slashRange + 6 && Math.abs(p.body.bottom - b.bottom) < 24) { k.hitDone = true; this.hurt(); }
                    }
                    if (now >= k.until) { this.bossPlay('idle'); go('recover', 800 * pace + SNOWBOSS.rest); }
                    break;
                case 'throw':
                    b.setVelocityX(0);
                    if (now >= k.nextShot) {
                        const shot = this.shots.create(k.x + k.dir * 22, this.floorY - 12, 'snowshot').setScale(1.3 / RES).setDepth(15);
                        shot.body.setSize(20, 20).setOffset(4, 4);
                        shot.body.setVelocityX(k.dir * SNOWBOSS.shotSpeed * spd);
                        shot.startX = shot.x;
                        shot.range = this.mapW + 40;
                        if (--k.shotsLeft > 0) { k.nextShot = now + 420; this.time.delayedCall(120, () => { if (!k.dead && k.mode === 'throw') this.bossPlay('throw', true); }); }
                        else { this.time.delayedCall(250, () => { if (!k.dead) this.bossPlay('idle'); }); go('recover', 900 * pace + SNOWBOSS.rest); }
                    }
                    break;
                case 'recover':                    // parado e sem virar: hora de ir para as costas dele
                    b.setVelocityX(0);
                    if (now >= k.until) go('think', SNOWBOSS.think * pace * 0.5);
                    break;
                case 'hurt':
                    b.setVelocityX(0);
                    if (now >= k.until) throwing();   // revida logo com bolas de neve
                    break;
            }
            k.setFlipX(k.dir < 0);
        }

        onSnowBoss(player, k) {
            const st = this.state;
            if (st.dead || st.won || k.dead || k.mode === 'intro') return;
            const pb = player.body, kb = k.body;
            const above = pb.bottom - kb.top < 10 && pb.velocity.y >= 0;
            const behind = Math.sign(player.x - k.x) === -k.dir;
            if (!above && behind) {
                if (this.time.now < k.invulnUntil) return;
                k.hp--;
                k.invulnUntil = this.time.now + 900;
                setBossBar(k.hp, SNOWBOSS.hp);
                this.addScore(300, k.x, k.y - 60);
                this.puff(player.x, player.y - 6);
                pb.setVelocity(-k.dir * 200, -230);
                if (k.hp <= 0) return this.defeatSnowBoss();
                k.dir = -k.dir;
                k.mode = 'hurt'; k.until = this.time.now + 550;
                this.bossPlay('hurt', true);
                k.setTintFill(0xffffff);
                this.time.delayedCall(90, () => k.clearTint());
                return;
            }
            this.hurt();
        }

        defeatSnowBoss() {
            const k = this.boss, st = this.state;
            k.dead = true;
            st.won = true;
            k.body.setVelocity(0, 0);
            this.bossPlay('die', true);
            this.shots.clear(true, true);
            this.cameras.main.flash(300, 255, 255, 255);
            this.player.body.setVelocityX(0);
            S.score += 5000;
            this.floatText('+5000', k.x, k.y - 70, '#ffd23f');
            this.time.delayedCall(2600, () => {
                S.playing = false;
                const last = S.level >= LEVELS.length - 1;
                $('apClearTitle').textContent = 'BONECO DE NEVE DERROTADO!';
                $('apClearHeightLabel').textContent = 'CHEFE DERROTADO';
                $('apClearHeight').textContent = '+5000';
                $('apClearTimeLabel').textContent = 'VIDAS';
                $('apClearTime').textContent = pad(S.lives, 2);
                $('apClearScore').textContent = pad(S.score, 6);
                $('apNextBtn').textContent = last ? 'JOGAR DE NOVO' : 'PRÓXIMA FASE';
                $('apNextBtn').dataset.last = last ? '1' : '';
                $('apNextBtn').dataset.gate = '';
                if (last) saveRecord();
                refreshHud();
                showScreen('apClear');
            });
        }

        // ==================== CHEFAO: REI DO GELO ====================
        createBoss() {
            if (LEVELS[S.level].boss === 'snowman') return this.createSnowBoss();
            if (LEVELS[S.level].boss === 'snowflake') return this.createFlakeBoss();
            if (LEVELS[S.level].boss === 'yeti' || LEVELS[S.level].boss === 'mammoth') return this.createYetiBoss();
            const box = enemyBoxes.king;
            const C = LEVELS[S.level].boss === 'king2' ? KING2 : KING;
            this.floorY = this.spawns.start.y;          // altura do piso (pes do pinguim)
            const k = box
                ? this.physics.add.sprite(this.mapW - 110, this.floorY, 'enemy_king', 'walk1').setScale(1 / RES)
                : this.physics.add.sprite(this.mapW - 110, this.floorY, 'snowball', 's0').setScale(3);
            k.setOrigin(0.5, 1).setDepth(13);
            if (box) k.body.setSize(box.w, box.h).setOffset(box.x, box.y);
            k.setCollideWorldBounds(true);
            k.custom = !!box;
            Object.assign(k, { cfg: C, hp: C.hp, dir: -1, mode: 'intro', until: this.time.now + 2400, dead: false, invulnUntil: 0, last: '' });
            this.boss = k;
            this.bossPlay('laugh');
            this.physics.add.collider(k, this.layer);
            this.physics.add.overlap(this.player, k, this.onBoss, null, this);
            this.hazards = this.physics.add.group({ allowGravity: false });
            this.physics.add.overlap(this.player, this.hazards, () => this.hurt(), null, this);
            this.time.delayedCall(300, () => this.bossSay(C === KING2 ? 'Dessa vez você não escapa!' : 'HA HA HA! Ninguém entra no meu castelo!'));
            $('apBossName').textContent = 'REI DO GELO';
            $('apStage').classList.add('boss-mode');
            setBossBar(k.hp, k.cfg.hp);
            this.events.once('shutdown', () => $('apStage').classList.remove('boss-mode'));
        }

        bossPlay(anim, force = false) {
            const k = this.boss;
            if (k.custom) k.play('en-' + (k.art || 'king') + '-' + anim, !force);
        }

        bossSay(text) {
            const k = this.boss;
            const t = this.add.text(k.x, Math.max(k.y - 54, 78), text, { fontFamily: FONT, fontSize: '7px', color: '#ffffff', stroke: '#1b2a4a', strokeThickness: 3, align: 'center', wordWrap: { width: 170 } })
                .setOrigin(0.5, 1).setDepth(40).setResolution(4);
            this.tweens.add({ targets: t, alpha: 0, delay: 1700, duration: 400, onComplete: () => t.destroy() });
        }

        bossPhase() {
            const k = this.boss;
            return k.hp > this.boss.cfg.hp * 2 / 3 ? 0 : k.hp > this.boss.cfg.hp / 3 ? 1 : 2;
        }

        healBoss(n) {
            const k = this.boss;
            k.hp = Math.min(this.boss.cfg.hp, k.hp + n);
            setBossBar(k.hp, k.cfg.hp);
            this.floatText('+' + n, k.x, k.y - 50, '#7dff8a');
        }

        updateBoss(now) {
            if (this.boss.type === 'snowman') return this.updateSnowBoss(now);
            if (this.boss.type === 'snowflake') return this.updateFlakeBoss(now);
            if (this.boss.type === 'yeti') return this.updateYetiBoss(now);
            const k = this.boss, b = k.body, p = this.player;
            // estalactites: caem ate o chao e se quebram
            for (const h of this.hazards.getChildren()) {
                if (h.kind === 'icicle' && h.y >= this.floorY - 2) { this.puff(h.x, this.floorY - 2); h.destroy(); }
                else if (h.kind === 'shock' && (h.x < -20 || h.x > this.mapW + 20)) h.destroy();
            }
            if (k.dead) return;
            const ph = this.bossPhase(), spd = this.boss.cfg.speed[ph], pace = this.boss.cfg.pace[ph];
            const face = () => { if (Math.abs(p.x - k.x) > 6) k.dir = Math.sign(p.x - k.x); };
            const go = (mode, ms) => { k.mode = mode; k.until = now + ms; };
            if (this.state.dead) { b.setVelocityX(0); if (k.mode !== 'gloat') { k.mode = 'gloat'; this.bossPlay('laugh'); } k.setFlipX(k.dir < 0); return; }

            switch (k.mode) {
                case 'intro':
                    b.setVelocityX(0);
                    face();
                    if (now >= k.until) { go('think', this.boss.cfg.think * pace); this.bossPlay('idle'); }
                    break;
                case 'think':
                    b.setVelocityX(0);
                    face();
                    this.bossPlay('idle');
                    if (now >= k.until) this.bossChoose(now, ph);
                    break;
                case 'walk':                     // aproxima para a pancada
                    face();
                    b.setVelocityX(k.dir * this.boss.cfg.walkSpeed * spd);
                    this.bossPlay('walk');
                    if (Math.abs(p.x - k.x) < 70 || now >= k.until) {
                        b.setVelocityX(0);
                        this.bossPlay('slam', true);
                        go('slam', 480 * pace);
                    }
                    break;
                case 'slam':                     // levantou o cetro: bate e solta as ondas
                    b.setVelocityX(0);
                    if (now >= k.until) {
                        this.bossShock(spd);
                        if (ph === 2) this.time.delayedCall(450, () => { if (!k.dead && !this.state.dead) this.bossShock(spd); });
                        this.cameras.main.flash(90, 180, 220, 255);
                        go('recover', 1100 * pace);
                    }
                    break;
                case 'recover':                  // depois da pancada: parado, de costas e vulneravel
                    b.setVelocityX(0);
                    if (now >= k.until) go('think', this.boss.cfg.think * pace);
                    break;
                case 'chargeWind':               // mira e avisa
                    b.setVelocityX(0);
                    face();
                    if (now >= k.until) { go('charge', 4000); this.bossPlay('charge', true); }
                    break;
                case 'charge':
                    b.setVelocityX(k.dir * this.boss.cfg.chargeSpeed * spd);
                    if (b.blocked.left || b.blocked.right || now >= k.until) {
                        b.setVelocityX(0);
                        this.cameras.main.flash(110, 180, 220, 255);
                        this.bossPlay('hurt', true);
                        if (ph >= 1) this.bossIcicles(3, false);
                        go('stun', 1300 * pace);     // bateu na parede: tonto e de costas para o meio
                    }
                    break;
                case 'stun':
                    b.setVelocityX(0);
                    if (now >= k.until) go('think', this.boss.cfg.think * pace * 0.6);
                    break;
                case 'icicles':
                case 'summon':
                    b.setVelocityX(0);
                    if (now >= k.until) go('think', this.boss.cfg.think * pace);
                    break;
                case 'hurt':
                    b.setVelocityX(0);
                    if (now >= k.until) go('think', 350);
                    break;
            }
            k.setFlipX(k.dir < 0);
        }

        // escolhe o proximo ataque (nunca o mesmo duas vezes seguidas)
        bossChoose(now, ph) {
            const k = this.boss;
            const opts = ['slam', 'charge', 'icicles'];
            if (ph >= 1 && this.enemies.countActive() < 2) opts.push('summon');
            const pick = Phaser.Utils.Array.GetRandom(opts.filter(o => o !== k.last));
            k.last = pick;
            if (pick === 'slam') { k.mode = 'walk'; k.until = now + 1200; }
            else if (pick === 'charge') {
                k.mode = 'chargeWind'; k.until = now + 650 * this.boss.cfg.pace[ph];
                this.bossPlay('idle');
                this.floatText('!', k.x, k.y - 52, '#ff5a5a');
            } else if (pick === 'icicles') {
                k.mode = 'icicles'; k.until = now + 1500;
                this.bossPlay('summon', true);
                this.time.delayedCall(350, () => { if (!k.dead && !this.state.dead) this.bossIcicles(this.boss.cfg.icicles[ph], true); });
            } else {
                k.mode = 'summon'; k.until = now + 1200;
                this.bossPlay('summon', true);
                this.time.delayedCall(400, () => {
                    if (k.dead || this.state.dead) return;
                    this.spawnEnemy('snow', 24, this.floorY, true).dir = 1;
                    this.spawnEnemy('snow', this.mapW - 24, this.floorY, true).dir = -1;
                });
            }
        }

        bossShock(spd) {
            const k = this.boss;
            for (const dir of [-1, 1]) {
                const w = this.hazards.create(k.x + dir * 22, this.floorY, 'shock').setOrigin(0.5, 1).setScale(1 / RES).setDepth(15);
                w.kind = 'shock';
                w.setFlipX(dir < 0);
                w.body.setSize(40, 32).setOffset(12, 24);
                w.body.setVelocityX(dir * this.boss.cfg.shockSpeed * spd);
            }
        }

        // estalactites: sombra no chao avisa, depois cai. aimed = uma cai em cima do pinguim
        bossIcicles(n, aimed) {
            const xs = [];
            if (aimed) xs.push(this.player.x);
            while (xs.length < n) {
                const x = Phaser.Math.Between(20, this.mapW - 20);
                if (xs.every(o => Math.abs(o - x) > 26)) xs.push(x);
            }
            xs.forEach((x, i) => {
                const warn = this.add.image(x, this.floorY, 'warn').setScale(1 / RES * 1.2).setDepth(12).setAlpha(0.3);
                this.tweens.add({ targets: warn, alpha: 0.9, duration: 220, yoyo: true, repeat: 2 });
                this.time.delayedCall(700 + i * 90, () => {
                    warn.destroy();
                    if (this.state.dead) return;
                    const ic = this.hazards.create(x, -10, 'icicle').setScale(1 / RES).setDepth(15);
                    ic.kind = 'icicle';
                    ic.body.setAllowGravity(true);
                    ic.body.setSize(16, 56).setOffset(6, 8);
                });
            });
        }

        onBoss(player, k) {
            const st = this.state;
            if (st.dead || st.won || k.dead || k.mode === 'intro') return;
            const pb = player.body, kb = k.body;
            const above = pb.bottom - kb.top < 10 && pb.velocity.y >= 0;
            const behind = Math.sign(player.x - k.x) === -k.dir;
            if (!above && behind && k.mode !== 'charge') {
                if (this.time.now < k.invulnUntil) return;
                k.hp--;
                k.invulnUntil = this.time.now + 900;
                setBossBar(k.hp, k.cfg.hp);
                this.addScore(500, k.x, k.y - 50);
                this.puff(player.x, player.y - 6);
                pb.setVelocity(-k.dir * 200, -230);      // empurra o pinguim para longe
                if (k.hp <= 0) return this.defeatBoss();
                k.dir = -k.dir;                           // vira para quem bateu
                k.mode = 'hurt'; k.until = this.time.now + 600;
                this.bossPlay('hurt', true);
                k.setTintFill(0xffffff);
                this.time.delayedCall(90, () => k.clearTint());
                return;
            }
            this.hurt();
        }

        defeatBoss() {
            const k = this.boss, st = this.state;
            k.dead = true;
            st.won = true;
            k.body.setVelocity(0, 0);
            this.bossPlay('die', true);
            this.hazards.clear(true, true);
            for (const e of this.enemies.getChildren()) if (!e.dead) this.knockEnemy(e, 1);
            this.cameras.main.flash(300, 255, 255, 255);
            this.player.body.setVelocityX(0);
            S.score += 10000;
            this.floatText('+10000', k.x, k.y - 60, '#ffd23f');
            try { localStorage.setItem(TROPHY_KEY, '1'); } catch (e) { /* sem armazenamento */ }
            this.time.delayedCall(2800, () => {
                S.playing = false;
                saveRecord();
                $('apWinScore').textContent = pad(S.score, 6);
                refreshHud();
                const rematch = k.cfg === KING2;
                $('apWinNote').textContent = rematch ? 'OS PEIXES VOLTARAM PARA TODO O REINO GELADO!' : 'FINAL SECRETO: SO QUEM NAO ERRA NADA CHEGA AQUI.';
                $('apWin').classList.toggle('ap-final', rematch);     // final: os pinguins comemorando
                if (rematch) openStory(() => showScreen('apWin'), STORY_VICTORY, 'FIM');
                else showScreen('apWin');
            });
        }

        // rena: patrulha; se ve o pinguim na frente, abaixa a cabeca (windup), investe (charge)
        // e depois descansa (rest) - e a hora de pegar ela por tras
        updateReindeer(e) {
            const b = e.body, now = this.time.now, p = this.player;
            const custom = e.custom;
            const play = (anim) => { if (custom) e.play(`en-${e.kind}-${anim}`, true); };
            const edgeAhead = () => {
                if (b.blocked.left || b.blocked.right) return true;
                if (!b.blocked.down) return false;
                const ahead = this.layer.getTileAtWorldXY(e.x + e.dir * 12, b.bottom + 4);
                return !ahead || !ahead.collides;
            };
            if (e.mode === 'walk') {
                if (b.blocked.left) e.dir = 1;
                else if (b.blocked.right) e.dir = -1;
                else if (edgeAhead()) e.dir *= -1;
                b.setVelocityX(e.dir * REINDEER.walkSpeed);
                play('walk');
                const dx = p.x - e.x;
                const sees = !this.state.dead && Math.sign(dx) === e.dir && Math.abs(dx) < REINDEER.sight &&
                    Math.abs(p.body.bottom - b.bottom) < REINDEER.sightY && b.blocked.down;
                if (sees) {
                    e.mode = 'windup'; e.modeUntil = now + REINDEER.windup;
                    b.setVelocityX(0);
                    play('attack');
                    this.floatText('!', e.x, e.y - 30, '#ff5a5a');
                }
            } else if (e.mode === 'windup') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) { e.mode = 'charge'; e.modeUntil = now + REINDEER.chargeTime; play('charge'); }
            } else if (e.mode === 'charge') {
                if (edgeAhead() || now >= e.modeUntil) {
                    e.mode = 'rest'; e.modeUntil = now + REINDEER.rest;
                    b.setVelocityX(0);
                    play('idle');
                } else b.setVelocityX(e.dir * REINDEER.chargeSpeed);
            } else if (e.mode === 'rest') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) e.mode = 'walk';
            }
            e.setFlipX(e.facesRight ? e.dir < 0 : e.dir > 0);
        }

        // coruja: patrulha no alto; pinguim embaixo e perto -> mergulha nele; depois sobe de volta
        updateOwl(e) {
            const b = e.body, now = this.time.now, p = this.player;
            const OWL = e.kind === 'bat' ? BAT : e.kind === 'royalowl' ? ROYALOWL : OWL_BASE;
            const play = (anim) => { if (e.custom) e.play(`en-${e.kind}-${anim}`, true); };
            e.homeY = e.homeY || e.y;
            if (e.mode === 'patrol') {
                if (e.x < e.homeX - OWL.patrol) e.dir = 1;
                else if (e.x > e.homeX + OWL.patrol) e.dir = -1;
                b.setVelocity(e.dir * OWL.flySpeed, Math.sin(now / 300) * 12);
                play('walk');
                const dx = p.x - e.x, dy = p.y - e.y;
                if (!this.state.dead && now >= (e.modeUntil || 0) && Math.abs(dx) < OWL.sight && dy > 10 && dy < 170) {
                    // mira no pinguim
                    const len = Math.hypot(dx, dy) || 1;
                    e.dir = Math.sign(dx) || e.dir;
                    e.mode = 'dive'; e.modeUntil = now + OWL.diveTime;
                    b.setVelocity(dx / len * OWL.diveSpeed, dy / len * OWL.diveSpeed);
                    play('dive');
                }
            } else if (e.mode === 'dive') {
                const lowest = this.mapH - 40;
                if (now >= e.modeUntil || e.y > lowest) { e.mode = 'climb'; play('walk'); }
            } else if (e.mode === 'climb') {
                const dy = e.homeY - e.y, dx = e.homeX - e.x;
                if (Math.abs(dy) < 4) { e.mode = 'patrol'; e.modeUntil = now + OWL.rest; b.setVelocity(0, 0); }
                else b.setVelocity(Math.sign(dx) * Math.min(Math.abs(dx) * 2, OWL.climbSpeed * 0.6), Math.sign(dy) * OWL.climbSpeed);
                if (Math.abs(dx) > 4) e.dir = Math.sign(dx);
            }
            e.setFlipX(e.facesRight ? e.dir < 0 : e.dir > 0);
        }

        defeatOwl(e) {
            if (e.dead) return;
            const now = this.time.now;
            if (now < (e.invulnUntil || 0)) return;
            if (e.hp > 1) {
                e.hp--;
                e.invulnUntil = now + 700;
                e.mode = 'climb';
                e.body.setVelocity(0, -40);
                if (e.custom) { e.play(`en-${e.kind}-hurt`); e.once('animationcomplete', () => { if (!e.dead) e.play(`en-${e.kind}-walk`); }); }
                e.setTintFill(0xffffff);
                this.time.delayedCall(80, () => e.clearTint());
                this.puff(e.x, e.y - 8);
                return;
            }
            e.dead = true;
            e.body.setAllowGravity(true);
            e.body.setVelocity(0, -60);
            if (e.custom) {
                e.play(`en-${e.kind}-hurt`);
                e.once('animationcomplete', () => e.play(`en-${e.kind}-die`));
            }
            this.puff(e.x, e.y - 8);
            this.addScore(SCORE[e.kind] || SCORE.owl, e.x, e.y - 30);
            this.tweens.add({ targets: e, alpha: 0, delay: 1200, duration: 300, onComplete: () => e.destroy() });
        }

        // urso: anda devagar; pinguim perto na frente -> patada
        updateBear(e) {
            const b = e.body, now = this.time.now, p = this.player;
            const play = (anim) => { if (e.custom) e.play(`en-${e.kind}-${anim}`, true); };
            if (e.mode === 'walk') {
                if (b.blocked.left) e.dir = 1;
                else if (b.blocked.right) e.dir = -1;
                else if (b.blocked.down) {
                    const ahead = this.layer.getTileAtWorldXY(e.x + e.dir * 18, b.bottom + 4);
                    if (!ahead || !ahead.collides) e.dir *= -1;
                }
                b.setVelocityX(e.dir * BEAR.walkSpeed);
                play('walk');
                const ahead = (p.x - e.x) * e.dir;
                if (!this.state.dead && ahead > 0 && ahead < BEAR.clawRange && Math.abs(p.body.bottom - b.bottom) < BEAR.sightY && b.blocked.down) {
                    e.mode = 'claw'; e.modeUntil = now + 520; e.hitFrom = now + 230; e.hitTo = now + 420; e.hitDone = false;
                    b.setVelocityX(0);
                    play('claw');
                } else if (e.guard && !this.state.dead && now >= (e.chargeReady || 0) && ahead >= BEAR.clawRange && ahead < e.guard.sight &&
                    Math.abs(p.body.bottom - b.bottom) < BEAR.sightY && b.blocked.down) {
                    e.mode = 'windup'; e.modeUntil = now + e.guard.windup;
                    b.setVelocityX(0);
                    play('idle');
                    this.floatText('!', e.x, e.y - 30, '#ff5a5a');
                }
            } else if (e.mode === 'claw') {
                b.setVelocityX(0);
                if (!e.hitDone && now >= e.hitFrom && now <= e.hitTo) {
                    const ahead = (p.x - e.x) * e.dir;
                    if (ahead > -4 && ahead < BEAR.clawRange + 4 && Math.abs(p.body.bottom - b.bottom) < BEAR.sightY) { e.hitDone = true; this.hurt(); }
                }
                if (now >= e.modeUntil) { e.mode = 'rest'; e.modeUntil = now + 500; play('idle'); }
            } else if (e.mode === 'windup') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) { e.mode = 'charge'; e.modeUntil = now + e.guard.chargeTime; play('charge'); }
            } else if (e.mode === 'charge') {
                const tile = b.blocked.down && this.layer.getTileAtWorldXY(e.x + e.dir * 18, b.bottom + 4);
                if (b.blocked.left || b.blocked.right || (b.blocked.down && (!tile || !tile.collides)) || now >= e.modeUntil) {
                    e.mode = 'rest'; e.modeUntil = now + e.guard.rest; e.chargeReady = now + e.guard.rest + e.guard.cooldown;
                    b.setVelocityX(0);
                    play('idle');
                } else b.setVelocityX(e.dir * e.guard.chargeSpeed);
            } else if (e.mode === 'rest' || e.mode === 'hurt') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) e.mode = 'walk';
            }
            e.setFlipX(e.facesRight ? e.dir < 0 : e.dir > 0);
        }

        hitBear(e) {
            const now = this.time.now;
            if (e.dead || now < e.invulnUntil) return;
            e.hp--;
            e.invulnUntil = now + BEAR.invuln;
            this.puff(e.x, e.y - 14);
            if (e.hp <= 0) {
                e.dead = true;
                e.body.setVelocity(0, 0);
                e.body.enable = false;
                if (e.custom) e.play(`en-${e.kind}-die`);
                this.addScore(SCORE[e.kind] || SCORE.bear, e.x, e.y - 34);
                this.tweens.add({ targets: e, alpha: 0, delay: 1000, duration: 300, onComplete: () => e.destroy() });
                return;
            }
            e.mode = 'hurt';
            e.modeUntil = now + 450;
            e.body.setVelocityX(0);
            if (e.custom) e.play(`en-${e.kind}-hurt`, false);
            e.setTintFill(0xffffff);
            this.time.delayedCall(80, () => e.clearTint());
        }

        // bola gigante: rola devagar; com o pinguim na frente, prepara (windup), investe (charge) e descansa
        updateBigSnow(e) {
            const b = e.body, now = this.time.now, p = this.player;
            const play = (anim) => { if (e.custom) e.play(`en-bigsnow-${anim}`, true); };
            const edgeAhead = () => {
                if (b.blocked.left || b.blocked.right) return true;
                if (!b.blocked.down) return false;
                const ahead = this.layer.getTileAtWorldXY(e.x + e.dir * 16, b.bottom + 4);
                return !ahead || !ahead.collides;
            };
            if (e.mode === 'walk') {
                if (b.blocked.left) e.dir = 1;
                else if (b.blocked.right) e.dir = -1;
                else if (edgeAhead()) e.dir *= -1;
                b.setVelocityX(e.dir * BIGSNOW.walkSpeed);
                play('walk');
                const dx = p.x - e.x;
                if (!this.state.dead && Math.sign(dx) === e.dir && Math.abs(dx) < BIGSNOW.sight &&
                    Math.abs(p.body.bottom - b.bottom) < BIGSNOW.sightY && b.blocked.down) {
                    e.mode = 'windup'; e.modeUntil = now + BIGSNOW.windup;
                    b.setVelocityX(0);
                    play('windup');
                }
            } else if (e.mode === 'windup') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) { e.mode = 'charge'; e.modeUntil = now + BIGSNOW.chargeTime; play('charge'); }
            } else if (e.mode === 'charge') {
                if (edgeAhead() || now >= e.modeUntil) { e.mode = 'rest'; e.modeUntil = now + BIGSNOW.rest; b.setVelocityX(0); play('idle'); }
                else b.setVelocityX(e.dir * BIGSNOW.chargeSpeed);
            } else if (e.mode === 'rest' || e.mode === 'hurt') {
                b.setVelocityX(0);
                if (now >= e.modeUntil) e.mode = 'walk';
            }
            e.setFlipX(e.facesRight ? e.dir < 0 : e.dir > 0);
        }

        hitBigSnow(e) {
            const now = this.time.now;
            if (e.dead || now < e.invulnUntil) return;
            e.hp--;
            e.invulnUntil = now + BIGSNOW.invuln;
            this.puff(e.x, e.y - 14);
            if (e.hp <= 0) {
                e.dead = true;
                e.body.setVelocity(0, 0);
                e.body.enable = false;
                if (e.custom) e.play('en-bigsnow-die');
                this.addScore(SCORE.bigsnow, e.x, e.y - 34);
                this.tweens.add({ targets: e, alpha: 0, delay: 900, duration: 300, onComplete: () => e.destroy() });
                return;
            }
            this.addScore(SCORE.bigsnowHit, e.x, e.y - 34);
            e.mode = 'hurt';
            e.modeUntil = now + 450;
            e.body.setVelocityX(0);
            if (e.custom) e.play('en-bigsnow-hurt', false);
            e.setTintFill(0xffffff);
            this.time.delayedCall(80, () => e.clearTint());
        }

        // empurra o pinguim para longe (escorregao que nao atravessou), como quando acerta o rei
        pushBack(dir) {
            const st = this.state, b = this.player.body;
            if (st.sliding && this.roomToStand()) { st.sliding = false; this.setPlayerBody(false); }
            b.setVelocity(dir * BIGSNOW.push, -200);
            st.jumpCut = false;
        }

        // pinha: anda; com o pinguim perto, para e treme (alerta) e depois explode
        updatePinecone(e) {
            const b = e.body, now = this.time.now, p = this.player;
            if (e.mode === 'walk') {
                const dx = p.x - e.x, dy = p.body.bottom - b.bottom;
                if (!this.state.dead && Math.abs(dx) < PINECONE.trigger && Math.abs(dy) < PINECONE.triggerY) {
                    e.mode = 'alert';
                    e.modeUntil = now + PINECONE.fuse;
                    b.setVelocityX(0);
                    if (e.custom) e.play('en-pinecone-alert');
                    this.tweens.add({ targets: e, x: e.x + 0.6, duration: 40, yoyo: true, repeat: Math.floor(PINECONE.fuse / 80) });
                }
                return;          // o resto do andar e o mesmo da bola de neve
            }
            b.setVelocityX(0);
            if (e.mode === 'alert' && now >= e.modeUntil) this.explodePinecone(e);
        }

        explodePinecone(e) {
            if (e.dead) return;
            e.dead = true;
            e.mode = 'boom';
            e.body.setVelocity(0, 0);
            e.body.enable = false;
            this.tweens.killTweensOf(e);
            if (e.custom) e.play('en-pinecone-explode');
            this.cameras.main.flash(80, 255, 220, 160);
            // estrago em volta: pinguim e outros inimigos
            const cx = e.x, cy = e.y - 7, r = PINECONE.radius;
            const p = this.player;
            if (!this.state.dead && Phaser.Math.Distance.Between(cx, cy, p.x, p.y - 8) < r + 6) this.hurt();
            for (const o of this.enemies.getChildren()) {
                if (o === e || o.dead || !o.body.enable) continue;
                if (Phaser.Math.Distance.Between(cx, cy, o.x, o.y - 6) > r + 4) continue;
                if (o.kind === 'pinecone') this.time.delayedCall(120, () => this.explodePinecone(o));   // explode em cadeia
                else if (o.kind === 'reindeer' || o.kind === 'ox' || o.kind === 'moose' || o.kind === 'royalmoose') this.defeatReindeer(o);
                else if (o.kind === 'bigsnow') this.hitBigSnow(o);
                else if (o.kind === 'bear' || o.kind === 'seal' || o.kind === 'rat' || o.kind === 'beaver' || o.kind === 'narwhal' || o.kind === 'bearguard' || o.kind === 'sealguard') this.hitBear(o);
                else if (o.kind === 'owl' || o.kind === 'bat' || o.kind === 'royalowl') this.defeatOwl(o);
                else this.knockEnemy(o, Math.sign(o.x - cx) || 1);
            }
            this.time.delayedCall(600, () => e.destroy());
        }

        defusePinecone(e) {
            if (e.dead) return;
            e.dead = true;
            e.body.setVelocity(0, 0);
            e.body.enable = false;
            this.tweens.killTweensOf(e);
            if (e.custom) {
                e.play('en-pinecone-hurt');
                e.once('animationcomplete', () => e.play('en-pinecone-die'));
            }
            this.puff(e.x, e.y);
            this.addScore(SCORE.pinecone, e.x, e.y - 18);
            this.tweens.add({ targets: e, alpha: 0, delay: 900, duration: 300, onComplete: () => e.destroy() });
        }

        // rena derrubada por tras: leva o susto (dano) e cai (derrota)
        defeatReindeer(e) {
            e.dead = true;
            e.body.setVelocity(0, 0);
            e.body.checkCollision.none = true;
            e.body.allowGravity = false;
            e.body.enable = false;
            if (e.custom) {
                e.play(`en-${e.kind}-hurt`);
                e.once('animationcomplete', () => e.play(`en-${e.kind}-die`));
            }
            this.tweens.add({ targets: e, alpha: 0, delay: 1300, duration: 400, onComplete: () => e.destroy() });
            this.puff(e.x, e.y - 4);
            this.addScore(SCORE[e.kind] || SCORE.reindeer, e.x, e.y - 30);
        }

        onEnemy(player, e) {
            const st = this.state;
            if (st.dead || st.won || e.dead) return;
            const pb = player.body, eb = e.body;
            if (e.kind === 'owl' || e.kind === 'bat' || e.kind === 'royalowl') {
                // pular em cima derruba; encostar de outro jeito machuca
                if (pb.velocity.y > 20 && pb.bottom - eb.top < 12) {
                    this.defeatOwl(e);
                    pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp));
                    st.jumpCut = false;
                    return;
                }
                if (this.time.now < (e.invulnUntil || 0)) return;      // acabou de levar um pisao
                return this.hurt();
            }
            if (e.kind === 'bear' || e.kind === 'seal' || e.kind === 'rat' || e.kind === 'beaver' || e.kind === 'narwhal' || e.kind === 'bearguard' || e.kind === 'sealguard') {
                const stomp = pb.velocity.y > 30 && pb.bottom - eb.top < 10;
                const away = Math.sign(player.x - e.x) || -st.facing;
                if (stomp) {
                    this.hitBear(e);
                    pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp));
                    st.jumpCut = false;
                    return;
                }
                if (st.sliding || this.time.now < e.invulnUntil) return this.pushBack(away);   // escorregao nao machuca: volta
                return this.hurt();
            }
            if (e.kind === 'bigsnow') {
                const stomp = pb.velocity.y > 30 && pb.bottom - eb.top < 10;
                const away = Math.sign(player.x - e.x) || -st.facing;     // lado de onde o pinguim veio
                if (stomp) {
                    this.hitBigSnow(e);
                    pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp));
                    st.jumpCut = false;
                    return;
                }
                if (st.sliding) {
                    this.hitBigSnow(e);
                    if (!e.dead) this.pushBack(away);                     // nao atravessou: volta
                    return;
                }
                if (this.time.now < e.invulnUntil) return this.pushBack(away);   // acabou de apanhar: so afasta
                return this.hurt();
            }
            if (e.kind === 'pinecone') {
                // pisar em cima desarma (ate durante o alerta); encostar de lado ou escorregar faz explodir
                const stomp = pb.velocity.y > 30 && pb.bottom - eb.top < 9;
                if (stomp) {
                    this.defusePinecone(e);
                    pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp));
                    st.jumpCut = false;
                    return;
                }
                return this.explodePinecone(e);
            }
            if (e.kind === 'reindeer' || e.kind === 'ox' || e.kind === 'moose' || e.kind === 'royalmoose' || e.kind === 'moose' || e.kind === 'royalmoose') {
                // em cima machuca; por tras (lado oposto ao que ela olha) derruba; pela frente machuca
                const above = pb.bottom - eb.top < 9 && pb.velocity.y >= 0;
                if (!above && Math.sign(player.x - e.x) === -e.dir) return this.defeatReindeer(e);
                return this.hurt();
            }
            if (st.sliding && e.kind === 'snow') return this.knockEnemy(e, st.facing);
            // ourico: so morre com o escorregao pela frente dele (o lado para onde anda);
            // escorregar por tras ou pular em cima machuca
            if (st.sliding && (e.kind === 'urchin' || e.kind === 'urchinguard') && Math.sign(player.x - e.x) === e.dir) return this.knockEnemy(e, st.facing);
            const falling = pb.velocity.y > 30 && pb.bottom - eb.top < 9;
            if (falling && e.kind === 'snow') {
                e.dead = true;
                eb.enable = false;
                if (e.custom) {
                    // se despedaca no lugar (animacao de morte) e some
                    e.play(`en-${e.kind}-die`);
                    this.time.delayedCall(800, () => e.destroy());
                } else {
                    e.anims.stop();
                    e.setFrame('sq');
                    this.time.delayedCall(450, () => e.destroy());
                }
                pb.setVelocityY(-(this.readInput().jump ? PHYS.stompHeld : PHYS.stomp));
                st.jumpCut = false;
                this.puff(e.x, e.y);
                this.addScore(SCORE.stomp, e.x, e.y - 18);
                return;
            }
            this.hurt();
        }

        knockEnemy(e, dir) {
            if (e.dead) return;
            e.dead = true;
            if (e.custom && this.anims.exists(`en-${e.kind}-die`)) e.play(`en-${e.kind}-die`);
            else { e.anims.stop(); e.setFlipY(true); }
            e.body.checkCollision.none = true;
            e.body.setVelocity(dir * 70, -200);
            this.addScore(SCORE.knock, e.x, e.y - 18);
        }

        // ---------- itens ----------
        onCoin(player, coin) {
            S.taken.coins.add(coin.mapKey);
            coin.destroy();
            this.collectCoin(coin.x, coin.y);
        }

        collectCoin(x, y) {
            S.coins++;
            talents.bank++;
            saveTalents();
            this.addScore(SCORE.coin);
            if (S.coins % SCORE.coinsForLife === 0) {      // a cada 100 moedas: +1 vida (o contador continua somando)
                S.lives++;
                this.floatText('1UP', x, y - 10, '#7dff8a');
            }
        }

        onItem(player, item) {
            item.destroy();
            if (item.kind === 'life') {
                S.lives++;
                this.floatText('1UP', item.x, item.y - 10, '#7dff8a');
                return;
            }
            this.addScore(SCORE.fish, item.x, item.y - 10);
            if (!S.powered) {
                S.powered = true;
                this.setSkin('g');
            }
        }

        setSkin(skin) {
            this.skin = skin;
            const anim = this.player.anims.currentAnim?.key.split('-')[1] || 'idle';
            this.player.play(skin + '-' + anim);
        }

        addScore(points, x, y) {
            S.score += points;
            if (x !== undefined) this.floatText(String(points), x, y);
        }

        floatText(text, x, y, color = '#ffffff') {
            const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '8px', color, stroke: '#1b2a4a', strokeThickness: 3 })
                .setOrigin(0.5).setDepth(40).setResolution(4);
            this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 700, onComplete: () => t.destroy() });
        }

        puff(x, y) {
            for (let i = 0; i < 6; i++) {
                const s = this.add.image(x, y - 2, 'flake').setDepth(25);
                this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-10, 10), y: y - Phaser.Math.Between(2, 10), alpha: 0, duration: 350, onComplete: () => s.destroy() });
            }
        }

        splash(x, y) {
            for (let i = 0; i < 8; i++) {
                const s = this.physics.add.image(x, y, 'splash').setDepth(25);
                s.body.setVelocity(Phaser.Math.Between(-60, 60), Phaser.Math.Between(-220, -120));
                this.time.delayedCall(800, () => s.destroy());
            }
        }

        // ---------- dano, morte e fim de fase ----------
        hurt() {
            const st = this.state, now = this.time.now;
            if (st.dead || st.won || now < st.invulnUntil) return;
            if (S.powered) {
                S.powered = false;
                this.setSkin('n');
                if (this.boss && !this.boss.dead && !this.boss.type && this.boss.cfg.heal) this.healBoss(this.boss.cfg.heal);   // so o Rei se cura
                st.invulnUntil = now + 1500;
                st.hurtUntil = now + 300;
                this.player.body.setVelocity(-st.facing * 120, -160);
                return;
            }
            this.die();
        }

        die(drowned = false) {
            const st = this.state;
            if (st.dead || st.won) return;
            st.dead = true;
            S.powered = false;
            const p = this.player;
            p.setAlpha(1);
            p.play(this.skin + '-die', true);
            this.cameras.main.stopFollow();
            p.setCollideWorldBounds(false);
            p.body.checkCollision.none = true;
            p.body.setAcceleration(0, 0);
            p.body.setVelocity(0, drowned ? 0 : -300);
            if (drowned) p.body.setAllowGravity(false).setVelocityY(40);

            this.time.delayedCall(1700, () => {
                S.lives--;
                if (S.lives <= 0 && LEVELS[S.level].boss === 'king') {
                    S.playing = false;
                    saveRecord();
                    showBanish();
                } else if (S.lives <= 0) {
                    S.playing = false;
                    saveRecord();
                    $('apOverScore').textContent = pad(S.score, 6);
                    $('apOverRecord').textContent = pad(loadRecord(), 6);
                    // continue: so aparece enquanto sobrar; o botao principal (Enter) muda junto
                    const canGo = S.continues > 0;
                    $('apContinueBtn').hidden = !canGo;
                    $('apContinueBtn').textContent = 'CONTINUAR (' + S.continues + ')';
                    $('apContinueBtn').toggleAttribute('data-primary', canGo);
                    $('apAgainBtn').toggleAttribute('data-primary', !canGo);
                    $('apAgainBtn').classList.toggle('ap-btn-ghost', canGo);
                    $('apAgainBtn').textContent = canGo ? 'JOGAR DO INICIO' : 'JOGAR DE NOVO';
                    $('apOverNote').textContent = canGo ? 'CONTINUAR: VOLTA PARA O COMEÇO DA FASE ' + LEVELS[S.level].name + ' COM ' + START_LIVES + ' VIDAS (OS PONTOS ZERAM)' : 'SEM CONTINUES: A AVENTURA RECOMEÇA DA FASE 1-1';
                    showScreen('apOver');
                } else {
                    this.scene.restart();
                }
            });
        }

        onCheckpoint() {
            if (this.state.dead || (S.checkpoint && S.checkpoint.level === S.level)) return;
            const cp = this.spawns.checkpoint;
            S.checkpoint = { level: S.level, x: cp.x, y: cp.y };
            this.cpFlag.clearTint();
            this.tweens.add({ targets: this.cpFlag, scaleY: 0.85, duration: 120, yoyo: true });
            this.floatText('CHECKPOINT', cp.x, cp.y - 44, '#ffd23f');
        }

        onFlag() {
            const st = this.state;
            if (st.won || st.dead) return;
            st.won = true;
            st.sliding = false;
            this.setPlayerBody(false);
            const p = this.player, info = this.flagInfo;
            const ratio = Phaser.Math.Clamp((info.ground - p.y) / (info.ground - info.top), 0, 1);
            const heightBonus = Math.max(100, Math.floor(ratio * 20) * 100);
            this.addScore(heightBonus, p.x, p.y - 30);

            p.body.setVelocity(0, 0).setAllowGravity(false);
            p.setX(info.x - 6);
            p.setFlipX(false);
            p.play(this.skin + '-fall', true);
            const slide = Math.max(200, (info.ground - p.y) * 5);
            this.tweens.add({ targets: p, y: info.ground, duration: slide });
            this.tweens.add({ targets: this.flag, y: info.ground - 16, duration: slide });

            this.time.delayedCall(slide + 250, () => {
                p.body.setAllowGravity(true);
                p.play(this.skin + '-run', true);
                p.body.setVelocityX(70);
                this.tweens.add({ targets: p, alpha: 0, delay: 900, duration: 300 });
            });

            this.time.delayedCall(slide + 1500, () => {
                const timeBonus = S.time * SCORE.timeBonus;
                S.score += timeBonus;
                S.playing = false;
                const last = S.level >= LEVELS.length - 1;
                $('apClearTitle').textContent = 'FASE ' + LEVELS[S.level].name + ' COMPLETA!';
                $('apClearHeightLabel').textContent = 'ALTURA NA BANDEIRA';
                $('apClearTimeLabel').textContent = 'TEMPO RESTANTE';
                $('apClearHeight').textContent = '+' + heightBonus;
                $('apClearTime').textContent = S.time + ' × ' + SCORE.timeBonus + ' = +' + timeBonus;
                $('apClearScore').textContent = pad(S.score, 6);
                const nextBoss = !last && LEVELS[S.level + 1].boss;
                const toBoss = nextBoss === 'king' || nextBoss === 'king2';
                $('apNextBtn').textContent = last ? 'JOGAR DE NOVO' : nextBoss === 'king2' ? 'ENTRAR NA SALA DO TRONO' : toBoss ? 'ENTRAR NO CASTELO' : 'PRÓXIMA FASE';
                $('apNextBtn').dataset.last = last ? '1' : '';
                $('apNextBtn').dataset.gate = toBoss ? '1' : '';
                if (last) saveRecord();
                refreshHud();
                showScreen('apClear');
            });
        }
    }

    // ==================== JOGO ====================
    let game = null;
    let gameReady = false;     // texturas e animacoes montadas (fim do BootScene)

    function startLevel(index) {
        S.level = index;
        S.checkpoint = null;
        S.taken = newTaken();
        const scenes = game.scene;
        if (scenes.isActive('Level') || scenes.isPaused('Level')) scenes.stop('Level');
        scenes.start('Level');
    }

    // Para testes: jogoAdventurePenguin.html?fase=3 comeca direto na fase 3 (sem o parametro, na 1)
    const START_LEVEL = (() => {
        const n = parseInt(new URLSearchParams(location.search).get('fase'), 10);
        return n >= 1 && n <= LEVELS.length ? n - 1 : 0;
    })();

    const WORLD2 = LEVELS.findIndex(l => l.name === '2-1');

    // banido pelo rei: a partida continua no Mundo 2 (pontos e moedas ficam, vidas voltam a 5)
    function goWorld2(withStory) {
        Object.assign(S, { lives: BANISH_LIVES, powered: false, checkpoint: null });
        S.story = withStory;
        S.storyPages = withStory ? STORY_BANISH : null;
        startLevel(WORLD2);
    }

    function newGame() {
        if (!gameReady) return;      // ainda carregando
        resetRun();
        S.story = START_LEVEL === 0;
        startLevel(START_LEVEL);
    }

    function togglePause(force) {
        if (!game || !S.playing || !$('apStory').classList.contains('hidden')) return;
        const paused = game.scene.isPaused('Level');
        const want = force === undefined ? !paused : force;
        if (want && !paused) { game.scene.pause('Level'); showScreen('apPause'); }
        else if (!want && paused) { game.scene.resume('Level'); showScreen(null); }
    }

    function boot() {
        game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'apGame',
            width: VIEW_W * RES,
            height: VIEW_H * RES,
            pixelArt: true,
            roundPixels: true,
            backgroundColor: '#2f6fd6',
            physics: { default: 'arcade', arcade: { gravity: { y: PHYS.gravity }, debug: false } },
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
            input: { keyboard: { capture: [] } },
            scene: [BootScene, LevelScene],
        });

        ['apLeft', 'apRight', 'apJump', 'apSlide'].forEach((id, i) => bindTouch(id, ['left', 'right', 'jump', 'down'][i]));
        $('apPlayBtn').onclick = newGame;
        $('apPauseBtn').onclick = () => togglePause();
        $('apResumeBtn').onclick = () => togglePause(false);
        $('apRestartBtn').onclick = () => { showScreen(null); startLevel(S.level); };
        $('apAgainBtn').onclick = newGame;
        $('apContinueBtn').onclick = () => {
            if (!(S.continues > 0)) return;
            S.continues--;
            Object.assign(S, { lives: START_LIVES, score: 0, powered: false });
            startLevel(S.level);
        };
        $('apTalentsClearBtn').onclick = () => openTalents('apClear');
        $('apTalentsOverBtn').onclick = () => openTalents('apOver');
        $('apTalentsPauseBtn').onclick = () => openTalents('apPause');
        $('apTalentBack').onclick = () => {
            if (talentsBack === 'apMenu') $('apRecord').textContent = pad(loadRecord(), 6);
            showScreen(talentsBack);
        };
        $('apRefundBtn').onclick = refundTalents;
        $('apTalentList').addEventListener('click', e => {
            const b = e.target.closest('[data-talent]');
            if (b && !b.disabled) buyTalent(b.dataset.talent);
        });
        $('apGateBtn').onclick = () => {
            if (LEVELS[S.level + 1].boss === 'king2') { S.story = true; S.storyPages = STORY_REMATCH; }   // revanche: dialogo antes da luta
            startLevel(S.level + 1);
        };
        $('apStoryNext').onclick = nextStory;
        $('apStorySkip').onclick = closeStory;
        $('apBanishGoBtn').onclick = () => goWorld2(true);   // o Mundo 2 so abre depois de perder para o rei
        $('apBanishTalentsBtn').onclick = () => openTalents('apBanish');
        $('apWinAgainBtn').onclick = newGame;
        $('apNextBtn').onclick = () => {
            if ($('apNextBtn').dataset.gate) {
                const rematch = LEVELS[S.level + 1].boss === 'king2';
                $('apGateTitle').innerHTML = rematch ? 'A SALA DO TRONO<br>ESTA LOGO ALI...' : 'O REI DO GELO<br>TE ESPERA...';
                $('apGateBtn').textContent = rematch ? 'ENFRENTAR O REI DE NOVO' : 'ENFRENTAR O REI';
                showScreen('apGate'); return;
            }
            if ($('apNextBtn').dataset.last) newGame();
            else startLevel(S.level + 1);
        };

        // teclado: pausa, Enter nos menus e bloqueio da rolagem da pagina.
        // Com a fase rodando, setas e espaco ficam com o Phaser (ele mesmo impede a rolagem;
        // e ignora teclas ja canceladas, entao aqui so cancela as que ele nao usa).
        const GAME_KEYS = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const SCROLL_KEYS = [...GAME_KEYS, 'PageUp', 'PageDown', 'Home', 'End'];
        window.addEventListener('keydown', e => {
            if (e.target.closest && e.target.closest('input, textarea, select')) return;
            const running = game.scene.isActive('Level');
            if (SCROLL_KEYS.includes(e.key) && !(running && GAME_KEYS.includes(e.key))) e.preventDefault();
            const onTalents = !$('apTalents').classList.contains('hidden');
            if (!$('apStory').classList.contains('hidden')) {
                if (e.key === 'Escape') closeStory();
                return;
            }
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (onTalents) $('apTalentBack').click();      // fecha os talentos (volta para a tela anterior)
                else togglePause();
            }
            // T: pausa (se estiver jogando) e abre os talentos; de novo fecha
            if (e.key === 't' || e.key === 'T') {
                if (onTalents) $('apTalentBack').click();
                else if (S.playing && game.scene.isActive('Level')) { togglePause(true); openTalents('apPause'); }
            }
            if (e.key === 'Enter') {
                const open = document.querySelector('.ap-screen:not(.hidden) [data-primary]');
                if (open) { e.preventDefault(); open.click(); }
            }
        }, { capture: true });

        document.addEventListener('visibilitychange', () => { if (document.hidden) togglePause(true); });

        // acesso pelo console do navegador para testes (ex.: AdventurePenguin.S.lives = 9)
        window.AdventurePenguin = { game, S, startLevel, talents, PHYS, renderTalents };
    }

    // a fonte do HUD/pontos precisa estar carregada antes do primeiro texto no canvas
    const fontReady = document.fonts && document.fonts.load ? document.fonts.load('8px "Press Start 2P"').catch(() => {}) : Promise.resolve();
    window.addEventListener('DOMContentLoaded', () => fontReady.then(boot));
})();
