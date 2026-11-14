// =====================================================================
// Adventure Penguin - arte em pixel art gerada no codigo (placeholder)
// Cada textura e desenhada num canvas e registrada no Phaser. Quando os
// sprites definitivos chegarem, basta trocar a textura correspondente.
// =====================================================================
const ART = (() => {
    'use strict';

    // Desenha um padrao de texto (1 caractere = 1 pixel). '.' = transparente.
    function pix(ctx, rows, pal, ox = 0, oy = 0, flip = false) {
        const w = Math.max(...rows.map(r => r.length));
        rows.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                const ch = row[x];
                if (ch === '.' || ch === ' ' || !pal[ch]) continue;
                ctx.fillStyle = pal[ch];
                ctx.fillRect(ox + (flip ? w - 1 - x : x), oy + y, 1, 1);
            }
        });
    }

    function rect(ctx, color, x, y, w, h) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    // Elipse preenchida pixel a pixel (sem anti-alias, para manter o pixel art nitido)
    function ellipse(ctx, color, cx, cy, rx, ry) {
        ctx.fillStyle = color;
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Cria uma textura de canvas e registra quadros nomeados (name, x, y, w, h)
    function canvasTexture(scene, key, w, h, draw, frames = []) {
        const tex = scene.textures.createCanvas(key, w, h);
        const ctx = tex.getContext();
        ctx.imageSmoothingEnabled = false;
        draw(ctx);
        frames.forEach(([name, x, y, fw, fh]) => tex.add(name, 0, x, y, fw, fh));
        tex.refresh();
        return tex;
    }

    // ==================== PINGUIM ====================
    const PENGUIN_PAL = {
        K: '#141833', B: '#2b3358', b: '#46528a', W: '#f6f8ff', w: '#cfd8ee',
        O: '#ff9a1f', o: '#c96a0a', R: '#e33b3b', r: '#a52424', E: '#141833'
    };
    // mesmo pinguim com o cachecol dourado (poder do peixe dourado)
    const PENGUIN_GOLD = { ...PENGUIN_PAL, R: '#ffd23f', r: '#d29a12' };

    const P_HEAD = [
        '.....KKKKK......',
        '....KBBBBBKK....',
        '...KBbBBBBBBK...',
        '...KBBBBWWWBK...',
        '..KBBBBWWKWBK...',
        '..KBBBBWWWWOOO..',
        '..KBBBBBWWOOoK..',
        '..KRRRRRRRRRK...',
        'RRKrRRRRRRRrK...',
        '.RRrBBWWWWWBK...',
    ];
    const P_BODY_IDLE = [
        '..KBBWWWWWWWBK..',
        '.KBBBWWWWWWWBK..',
        '.KBbBWWWWWWWBK..',
        '..KBBWWWWWWwBK..',
        '..KBBWWWWWWwBK..',
        '..KBBBWWWWwBBK..',
        '...KBBBwwwBBK...',
        '....KKKKKKKK....',
    ];
    const P_BODY_JUMP = [
        'KBKBBWWWWWWWBK..',
        'KBBBBWWWWWWWBK..',
        '.KKBBWWWWWWWBK..',
        '..KBBWWWWWWwBK..',
        '..KBBWWWWWWwBK..',
        '..KBBBWWWWwBBK..',
        '...KBBBwwwBBK...',
        '....KKKKKKKK....',
    ];
    const P_BODY_FALL = [
        '..KBBWWWWWWWBKK.',
        '.KBBBWWWWWWWBBBK',
        'KBBKBWWWWWWWBK..',
        'KK.KBWWWWWWwBK..',
        '..KBBWWWWWWwBK..',
        '..KBBBWWWWwBBK..',
        '...KBBBwwwBBK...',
        '....KKKKKKKK....',
    ];
    const FEET = {
        idle:  ['...OOO..OOO.....', '..ooo..ooo......'],
        walk1: ['..OOO.....OOO...', '.ooo.....ooo....'],
        walk2: ['....OOO.OOO.....', '...ooo.ooo......'],
        walk3: ['...OOO..OOO.....', '..ooo...ooo.....'],
        jump:  ['....OOOOOO......', '................'],
        fall:  ['..OOO....OOO....', '................'],
    };
    const HURT_HEAD = P_HEAD.map((r, i) => i === 3 ? '...KBBBBWKWBK...' : i === 4 ? '..KBBBBWKWKBK...' : i === 5 ? '..KBBBBWWKWOOO..' : r);

    // escorregando de barriga (ocupa so a parte de baixo do quadro)
    const P_SLIDE = [
        ...Array(10).fill('................'),
        '.......KKKKK....',
        '.RR..KKBBBBBKK..',
        'RRRRKBBBBBWWWKK.',
        '.RRKBBBBBBWWKWOO',
        '..KBBBBBBBWWWWOK',
        '.KBBBRRRRRRRRRK.',
        'KBBWWWWWWWWWWWK.',
        '.KKWWWWWWWWWKK..',
        '...KKKKKKKKK....',
        '................',
    ];

    // quadros 16x20: idle, walk1-3, jump, fall, hurt, slide
    function penguinFrames(head, body, feet) { return [...head, ...body, ...feet]; }
    const PENGUIN_FRAMES = [
        ['idle',  penguinFrames(P_HEAD, P_BODY_IDLE, FEET.idle)],
        ['walk1', penguinFrames(P_HEAD, P_BODY_IDLE, FEET.walk1)],
        ['walk2', penguinFrames(P_HEAD, P_BODY_IDLE, FEET.walk2)],
        ['walk3', penguinFrames(P_HEAD, P_BODY_IDLE, FEET.walk3)],
        ['jump',  penguinFrames(P_HEAD, P_BODY_JUMP, FEET.jump)],
        ['fall',  penguinFrames(P_HEAD, P_BODY_FALL, FEET.fall)],
        ['hurt',  penguinFrames(HURT_HEAD, P_BODY_FALL, FEET.fall)],
        ['slide', P_SLIDE],
    ];

    function makePenguin(scene, key, pal) {
        canvasTexture(scene, key, 16 * PENGUIN_FRAMES.length, 20, ctx => {
            PENGUIN_FRAMES.forEach(([, rows], i) => pix(ctx, rows, pal, i * 16, 0));
        }, PENGUIN_FRAMES.map(([name], i) => [name, i * 16, 0, 16, 20]));
    }

    // ==================== INIMIGOS ====================
    const SNOW_PAL = { K: '#22314d', W: '#ffffff', S: '#d3e8f7', D: '#9cc1de', E: '#141833', N: '#7a4a2a' };
    const SNOWBALL = [
        '.....KKKKKK.....',
        '...KKWWWWWWKK...',
        '..KWWWWWWWWWSK..',
        '.KWWWWWWWWWWWSK.',
        '.KWKKWWWWWKKWSK.',
        'KWWWKKWWWKKWWWSK',
        'KWWWEEWWWWEEWWSK',
        'KWWWEEWWWWEEWWSK',
        'KWWWWWWWWWWWWSSK',
        'KWWWWKKKKKKWWSSK',
        'KSWWKWWWWWWKWSSK',
        '.KSWWWWWWWWWSSK.',
        '.KSSWWWWWWSSSDK.',
        '..KSSSSSSSSSDK..',
        '...KKDDDDDDKK...',
    ];
    const SNOW_FEET = [['..NNN.....NNN...'], ['....NNN.NNN.....']];
    const SNOW_SQUASH = [
        '..KKKKKKKKKKKK..',
        '.KWWWWWWWWWWWSK.',
        'KWWKKWWWWKKWWWSK',
        'KWWWWWWWWWWWWSSK',
        'KSWWWWWWWWWWSSDK',
        '.KKKKKKKKKKKKKK.',
    ];

    const URCHIN_PAL = { K: '#1d1433', P: '#6d51bd', p: '#4a3590', L: '#a48ce8', S: '#d9d2f7', W: '#ffffff', E: '#141833' };
    const URCHIN_A = [
        '...K....K....K..',
        '..KSK..KSK..KSK.',
        '..KPPKKPPPKKPPK.',
        '.KPLPPPPPPPPPPPK',
        'KSPLPKKPPPKKPPPK',
        'KPPPWWEPPPWWEPSK',
        '.KPPWWEPPPWWEPK.',
        'KSPPPPPPPPPPPPPK',
        'KPPpPPKKKKPPpPPK',
        '.KPppPPPPPPppPK.',
        '..KpppppppppppK.',
        '...KKKKKKKKKKK..',
    ];
    const URCHIN_FEET = [['...KK......KK...'], ['.....KK..KK.....']];

    // ==================== TILES (16x16) ====================
    // Ordem dos quadros no tileset (o indice e usado pelo mapa)
    const TILE_INDEX = {
        SNOW: 0, DIRT: 1, BRICK: 2, GIFT: 3, USED: 4, ICE: 5, PLAT: 6, SPIKE: 7,
        WATER_TOP: 8, WATER: 9, SNOW_L: 10, SNOW_R: 11, ICE_TOP: 12,
        DIRT_L: 13, DIRT_R: 14, PLAT_L: 15, PLAT_M: 16, PLAT_R: 17,
        WOOD: 18, WOOD_L: 19, WOOD_M: 20, WOOD_R: 21,
        DECK: 22, DECK_L: 23, DECK_M: 24, DECK_R: 25, CRATE: 26,
        CLOUD: 27, CLOUD_L: 28, CLOUD_M: 29, CLOUD_R: 30,
        ROAD: 31
    };

    function dirt(ctx, x, y) {
        rect(ctx, '#8a4b2a', x, y, 16, 16);
        const stones = [[1, 2, 5, 3], [8, 1, 6, 3], [3, 7, 4, 3], [10, 6, 5, 4], [1, 12, 6, 3], [9, 12, 5, 3]];
        for (const [sx, sy, sw, sh] of stones) {
            rect(ctx, '#6c381f', x + sx, y + sy, sw, sh);
            rect(ctx, '#a8653d', x + sx, y + sy, sw - 1, 1);
        }
    }

    function snowCap(ctx, x, y, left, right) {
        rect(ctx, '#f4faff', x, y, 16, 5);
        rect(ctx, '#ffffff', x, y, 16, 1);
        // gotas de neve escorrendo
        for (const [dx, h] of [[1, 2], [5, 3], [6, 2], [11, 2], [12, 3]]) rect(ctx, '#f4faff', x + dx, y + 5, 1, h);
        rect(ctx, '#bfe0f5', x, y + 4, 16, 1);
        if (left) { rect(ctx, '#f4faff', x, y, 2, 10); rect(ctx, '#bfe0f5', x + 1, y + 4, 1, 6); }
        if (right) { rect(ctx, '#f4faff', x + 14, y, 2, 10); rect(ctx, '#bfe0f5', x + 14, y + 4, 1, 6); }
    }

    function brick(ctx, x, y) {
        rect(ctx, '#5a2612', x, y, 16, 16);
        const rows = [[0, [0, 8]], [4, [4, 12]], [8, [0, 8]], [12, [4, 12]]];
        for (const [ry, starts] of rows) {
            for (let bx = -8; bx < 16; bx += 8) {
                const sx = bx + (starts[0] === 4 ? 4 : 0);
                const x0 = Math.max(0, sx), x1 = Math.min(16, sx + 7);
                if (x1 <= x0) continue;
                rect(ctx, '#b5562c', x + x0, y + ry, x1 - x0, 3);
                rect(ctx, '#d9784a', x + x0, y + ry, x1 - x0, 1);
            }
        }
    }

    // bloco de presente: caixa vermelha com fita dourada e floco de neve
    function gift(ctx, x, y) {
        rect(ctx, '#3b1010', x, y, 16, 16);
        rect(ctx, '#d93a3a', x + 1, y + 1, 14, 14);
        rect(ctx, '#ef6060', x + 1, y + 1, 14, 1);
        rect(ctx, '#9c2222', x + 1, y + 14, 14, 1);
        rect(ctx, '#ffd34a', x + 7, y + 1, 2, 14);
        rect(ctx, '#ffd34a', x + 1, y + 7, 14, 2);
        rect(ctx, '#d49a16', x + 8, y + 1, 1, 14);
        // floco de neve nos quadrantes
        for (const [cx, cy] of [[4, 4], [11, 11]]) {
            rect(ctx, '#ffffff', x + cx - 1, y + cy, 3, 1);
            rect(ctx, '#ffffff', x + cx, y + cy - 1, 1, 3);
        }
    }

    function usedBlock(ctx, x, y) {
        rect(ctx, '#3b2a20', x, y, 16, 16);
        rect(ctx, '#8c6a55', x + 1, y + 1, 14, 14);
        rect(ctx, '#a6836c', x + 1, y + 1, 14, 1);
        rect(ctx, '#5e4535', x + 1, y + 14, 14, 1);
        for (const [cx, cy] of [[3, 3], [12, 3], [3, 12], [12, 12]]) rect(ctx, '#5e4535', x + cx, y + cy, 1, 1);
    }

    function ice(ctx, x, y, cap) {
        rect(ctx, '#3a7fb0', x, y, 16, 16);
        rect(ctx, '#9fe3ff', x + 1, y + 1, 14, 14);
        rect(ctx, '#e6f8ff', x + 2, y + 2, 5, 1);
        rect(ctx, '#e6f8ff', x + 2, y + 2, 1, 4);
        rect(ctx, '#6cc4ec', x + 9, y + 9, 4, 4);
        rect(ctx, '#5fb3dd', x + 1, y + 14, 14, 1);
        if (cap) {
            rect(ctx, '#f4faff', x, y, 16, 4);
            rect(ctx, '#ffffff', x, y, 16, 1);
            rect(ctx, '#bfe0f5', x, y + 3, 16, 1);
            rect(ctx, '#f4faff', x + 3, y + 4, 1, 2);
            rect(ctx, '#f4faff', x + 11, y + 4, 2, 2);
        }
    }

    function platform(ctx, x, y) {
        rect(ctx, '#3a7fb0', x, y, 16, 7);
        rect(ctx, '#bdeeff', x, y + 1, 16, 5);
        rect(ctx, '#ffffff', x, y + 1, 16, 1);
        rect(ctx, '#7fcdf0', x, y + 5, 16, 1);
        rect(ctx, '#bdeeff', x + 3, y + 7, 1, 2);
        rect(ctx, '#bdeeff', x + 10, y + 7, 1, 3);
    }

    // estalagmites de gelo apontadas para cima
    function spikes(ctx, x, y) {
        for (let i = 0; i < 4; i++) {
            const bx = x + i * 4;
            for (let h = 0; h < 9; h++) {
                const half = Math.floor((h + 1) / 4.5) + (h > 6 ? 1 : 0);
                rect(ctx, '#3a7fb0', bx + 2 - half - (h ? 0 : 0), y + 16 - 9 + h, half * 2, 1);
            }
            rect(ctx, '#3a7fb0', bx, y + 15, 4, 1);
            rect(ctx, '#d8f4ff', bx + 1, y + 9, 1, 6);
            rect(ctx, '#ffffff', bx + 1, y + 8, 1, 1);
        }
    }

    function water(ctx, x, y, top) {
        rect(ctx, '#1f7fd6', x, y, 16, 16);
        rect(ctx, '#1868b4', x, y + 10, 16, 6);
        if (top) {
            rect(ctx, '#8fd6ff', x, y + 2, 16, 2);
            rect(ctx, '#ffffff', x + 2, y + 1, 4, 1);
            rect(ctx, '#ffffff', x + 10, y + 1, 4, 1);
            rect(ctx, '#3c9ee8', x, y + 4, 16, 2);
        } else {
            rect(ctx, '#3c9ee8', x + 3, y + 5, 4, 1);
            rect(ctx, '#3c9ee8', x + 10, y + 11, 3, 1);
        }
    }

    function makeTiles(scene) {
        const order = [
            (c, x, y) => { dirt(c, x, y); snowCap(c, x, y); },
            dirt, brick, gift, usedBlock,
            (c, x, y) => ice(c, x, y, false),
            platform, spikes,
            (c, x, y) => water(c, x, y, true),
            (c, x, y) => water(c, x, y, false),
            (c, x, y) => { dirt(c, x, y); snowCap(c, x, y, true, false); },
            (c, x, y) => { dirt(c, x, y); snowCap(c, x, y, false, true); },
            (c, x, y) => ice(c, x, y, true),
            dirt, dirt, platform, platform, platform,   // bordas da terra e partes da plataforma
            platform, platform, platform, platform,     // plataforma de madeira (arte provisoria)
            usedBlock, usedBlock, usedBlock, usedBlock, brick,   // piso da ponte e caixote (arte provisoria)
            platform, platform, platform, platform,             // nuvem (arte provisoria)
            () => {},                                           // estrada: chao invisivel (o desenho e o do fundo)
        ];
        const cols = 8, rows = Math.ceil(order.length / cols);
        canvasTexture(scene, 'tiles', cols * 16, rows * 16, ctx => {
            order.forEach((fn, i) => fn(ctx, (i % cols) * 16, Math.floor(i / cols) * 16));
        }, order.map((_, i) => ['t' + i, (i % cols) * 16, Math.floor(i / cols) * 16, 16, 16]));
    }

    // ==================== ITENS E DECORACAO ====================
    function makeCoin(scene) {
        const widths = [5, 3.5, 1.2, 3.5];
        canvasTexture(scene, 'coin', 12 * 4, 14, ctx => {
            widths.forEach((rx, i) => {
                const cx = i * 12 + 6;
                ellipse(ctx, '#9a6408', cx, 7, rx + 1, 7);
                ellipse(ctx, '#ffc62e', cx, 7, rx, 6);
                if (rx > 2) {
                    ellipse(ctx, '#e59e10', cx, 7, rx - 2, 4);
                    rect(ctx, '#ffe58a', cx - 1, 3, 1, 8);
                } else {
                    rect(ctx, '#ffe58a', cx - 0.5, 2, 1, 10);
                }
            });
        }, widths.map((_, i) => ['c' + i, i * 12, 0, 12, 14]));
    }

    function makeFish(scene) {
        const FISH = [
            '....KKKKK.....',
            '..KKYYYYYKK.KK',
            '.KYYYYYYYYYKYK',
            'KYWKYYYYOYYYYK',
            'KYYYYYYOYYYKYK',
            '.KYYYYYYYYKK.K',
            '..KKYYYYYKK...',
            '....KKKKK.....',
        ];
        canvasTexture(scene, 'fish', 14, 8, ctx => pix(ctx, FISH, { K: '#7a4a00', Y: '#ffc928', O: '#ff8a1f', W: '#ffffff' }));
    }

    function makeEnemies(scene) {
        canvasTexture(scene, 'snowball', 16 * 3, 16, ctx => {
            pix(ctx, SNOWBALL, SNOW_PAL, 0, 0); pix(ctx, SNOW_FEET[0], SNOW_PAL, 0, 15);
            pix(ctx, SNOWBALL, SNOW_PAL, 16, 0); pix(ctx, SNOW_FEET[1], SNOW_PAL, 16, 15);
            pix(ctx, SNOW_SQUASH, SNOW_PAL, 32, 10);
        }, [['s0', 0, 0, 16, 16], ['s1', 16, 0, 16, 16], ['sq', 32, 0, 16, 16]]);

        canvasTexture(scene, 'urchin', 16 * 2, 14, ctx => {
            pix(ctx, URCHIN_A, URCHIN_PAL, 0, 0); pix(ctx, URCHIN_FEET[0], URCHIN_PAL, 0, 12);
            pix(ctx, URCHIN_A, URCHIN_PAL, 16, 0); pix(ctx, URCHIN_FEET[1], URCHIN_PAL, 16, 12);
        }, [['u0', 0, 0, 16, 14], ['u1', 16, 0, 16, 14]]);
    }

    function makeFlag(scene) {
        // mastro: 9 tiles de altura com bola dourada no topo
        canvasTexture(scene, 'pole', 8, 150, ctx => {
            ellipse(ctx, '#9a6408', 4, 4, 4, 4);
            ellipse(ctx, '#ffc62e', 4, 4, 3, 3);
            rect(ctx, '#fff1a8', 2, 2, 1, 2);
            rect(ctx, '#6b7a8c', 3, 8, 2, 142);
            rect(ctx, '#d8e2ec', 3, 8, 1, 142);
        });
        canvasTexture(scene, 'poleBase', 16, 12, ctx => {
            rect(ctx, '#3d4654', 0, 0, 16, 12);
            rect(ctx, '#8d99a8', 1, 1, 14, 10);
            rect(ctx, '#b8c3cf', 1, 1, 14, 2);
            rect(ctx, '#6b7686', 1, 9, 14, 2);
        });
        // bandeira vermelha com pata branca
        const PAW = [
            '.W.W.',
            'W.W.W',
            '.....',
            '.WWW.',
            'WWWWW',
            '.WWW.',
        ];
        canvasTexture(scene, 'flag', 22, 15, ctx => {
            for (let y = 0; y < 15; y++) {
                const w = Math.round(22 * (1 - Math.abs(y - 7) / 8));
                rect(ctx, '#a81e1e', 0, y, w, 1);
                if (w > 2) rect(ctx, '#e8352f', 0, y, w - 1, 1);
            }
            pix(ctx, PAW, { W: '#ffffff' }, 4, 4);
        });
    }

    function makeSign(scene) {
        canvasTexture(scene, 'sign', 20, 20, ctx => {
            rect(ctx, '#4a2a14', 8, 9, 4, 11);
            rect(ctx, '#8b5a2b', 9, 9, 2, 11);
            // placa em forma de seta
            rect(ctx, '#4a2a14', 0, 1, 16, 9);
            for (let i = 0; i < 5; i++) rect(ctx, '#4a2a14', 16 + i, 1 + i, 1, 9 - i * 2);
            rect(ctx, '#b07a43', 1, 2, 15, 7);
            for (let i = 0; i < 4; i++) rect(ctx, '#b07a43', 16 + i, 2 + i, 1, 7 - i * 2);
            rect(ctx, '#d39b5c', 1, 2, 15, 1);
            // seta desenhada na placa
            rect(ctx, '#f6e2b8', 4, 5, 8, 1);
            rect(ctx, '#f6e2b8', 10, 4, 1, 3);
            rect(ctx, '#f6e2b8', 11, 5, 1, 1);
        });
    }

    function makeParticles(scene) {
        canvasTexture(scene, 'flake', 3, 3, ctx => {
            rect(ctx, '#ffffff', 1, 0, 1, 3);
            rect(ctx, '#ffffff', 0, 1, 3, 1);
        });
        canvasTexture(scene, 'debris', 6, 6, ctx => {
            rect(ctx, '#5a2612', 0, 0, 6, 6);
            rect(ctx, '#b5562c', 1, 1, 4, 4);
            rect(ctx, '#d9784a', 1, 1, 4, 1);
        });
        canvasTexture(scene, 'splash', 4, 4, ctx => {
            rect(ctx, '#8fd6ff', 0, 0, 4, 4);
            rect(ctx, '#ffffff', 1, 1, 2, 2);
        });
    }

    // ==================== CENARIO (parallax) ====================
    function makeBackground(scene, W, H) {
        // ceu em faixas (degrade "pixelado")
        canvasTexture(scene, 'bgSky', W, H, ctx => {
            const bands = ['#2f6fd6', '#3a7ddc', '#478be2', '#5699e8', '#66a8ee', '#78b7f2', '#8bc6f6', '#a0d4fa'];
            const bh = Math.ceil(H / bands.length);
            bands.forEach((c, i) => rect(ctx, c, 0, i * bh, W, bh));
        });

        canvasTexture(scene, 'bgClouds', W, 110, ctx => {
            const clouds = [[40, 30, 1], [190, 60, 0.8], [300, 20, 1.2], [420, 70, 0.9]];
            for (const [cx, cy, s] of clouds) {
                ellipse(ctx, '#d9ecfb', cx, cy + 3, 26 * s, 9 * s);
                ellipse(ctx, '#ffffff', cx - 10 * s, cy, 12 * s, 9 * s);
                ellipse(ctx, '#ffffff', cx + 6 * s, cy - 4 * s, 14 * s, 11 * s);
                ellipse(ctx, '#ffffff', cx + 20 * s, cy + 1, 10 * s, 7 * s);
                rect(ctx, '#d9ecfb', Math.round(cx - 24 * s), Math.round(cy + 6 * s), Math.round(48 * s), 2);
            }
        });

        // montanhas + castelo com cachoeira (largura dupla: o castelo aparece uma vez por ciclo)
        canvasTexture(scene, 'bgFar', W * 2, 170, ctx => {
            const peaks = [[60, 120], [170, 150], [290, 110], [400, 160], [520, 125], [640, 140], [760, 115], [880, 150]];
            for (const [px, ph] of peaks) {
                for (let y = 0; y < ph; y++) {
                    const half = Math.round(y * 0.95);
                    const top = 170 - ph + y;
                    rect(ctx, '#6f8fd8', px - half, top, half, 1);
                    rect(ctx, '#5674c4', px, top, half, 1);
                    if (y < ph * 0.22) {
                        rect(ctx, '#ffffff', px - half, top, half, 1);
                        rect(ctx, '#dbe8fb', px, top, half, 1);
                    }
                }
            }
            // castelo azul ao fundo
            const cx = 640, base = 150;
            rect(ctx, '#3f5aa8', cx - 50, base - 50, 100, 50);
            for (const [tx, tw, th] of [[-56, 14, 74], [-20, 18, 92], [16, 14, 70], [42, 14, 60]]) {
                rect(ctx, '#3f5aa8', cx + tx, base - th, tw, th);
                for (let i = 0; i < tw / 2 + 2; i++) rect(ctx, '#33498f', cx + tx + tw / 2 - i, base - th - (tw / 2 + 2) + i, i * 2, 1);
                rect(ctx, '#ffcf6a', cx + tx + tw / 2 - 1, base - th + 10, 3, 5);
            }
            for (let wx = -40; wx < 44; wx += 12) rect(ctx, '#ffcf6a', cx + wx, base - 34, 3, 5);
            // cachoeira
            rect(ctx, '#7fc8f5', cx + 54, base - 30, 12, 50);
            rect(ctx, '#d5f0ff', cx + 57, base - 30, 2, 50);
            rect(ctx, '#d5f0ff', cx + 62, base - 30, 1, 50);
        });

        canvasTexture(scene, 'bgTrees', W, 90, ctx => {
            for (let i = 0; i < 16; i++) {
                const tx = i * 31 + (i % 3) * 7, th = 50 + ((i * 37) % 30);
                rect(ctx, '#5b3a22', tx - 2, 90 - 10, 4, 10);
                for (let y = 0; y < th; y++) {
                    const half = Math.round((y % 14) * 0.9 + y * 0.25) + 1;
                    const top = 90 - 10 - th + y;
                    rect(ctx, y % 14 < 3 ? '#e9f5ff' : (i % 2 ? '#2f7d5b' : '#276b4e'), tx - half, top, half * 2, 1);
                }
            }
        });
    }

    // Converte um quadro para imagem (usado no HUD em HTML)
    function frameToDataURL(scene, key, frame, scale = 2) {
        const f = scene.textures.getFrame(key, frame);
        const c = document.createElement('canvas');
        c.width = f.cutWidth * scale;
        c.height = f.cutHeight * scale;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, c.width, c.height);
        return c.toDataURL();
    }

    function build(scene, W, H) {
        makeTiles(scene);
        makePenguin(scene, 'penguin', PENGUIN_PAL);
        makePenguin(scene, 'penguinGold', PENGUIN_GOLD);
        makeEnemies(scene);
        makeCoin(scene);
        makeFish(scene);
        makeFlag(scene);
        makeSign(scene);
        makeParticles(scene);
        makeBackground(scene, W, H);
    }

    return { build, frameToDataURL, TILE_INDEX };
})();
