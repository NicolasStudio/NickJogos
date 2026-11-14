// ==================== AGUARDA DOM CARREGAR ====================
document.addEventListener('DOMContentLoaded', () => {

    // ==================== ELEMENTOS DO DOM ====================
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highscoreElement = document.getElementById('highscore');
    const restartBtn = document.getElementById('restartBtn');
    const gameOverMsg = document.getElementById('gameOverMsg');

    // ==================== CONFIGURAÇÕES ====================
    // Coordenadas logicas fixas (800x400); o canvas real e multiplicado pelo
    // devicePixelRatio para nao ficar borrado em telas de alta resolucao.
    const WIDTH = 800;
    const HEIGHT = 400;
    const GROUND_Y = 320;
    const FLOOR_Y = GROUND_Y + 40;   // linha da neve: os pes do Noel e a base dos obstaculos
    const PLAYER_X = 100;
    const PLAYER_HEIGHT = 62;        // altura do Noel andando (os outros quadros usam a mesma escala)
    const OBSTACLE_HEIGHTS = [62, 66, 60, 70];   // boneco de neve, verde, bengala, arvore
    const STEP = 1000 / 60;          // fisica a 60 passos/s, independente da taxa do monitor

    // Escala de desenho: pixels reais por unidade logica. Acompanha o tamanho do canvas
    // na tela (CSS) e o devicePixelRatio, para o jogo ampliado continuar nitido.
    let RES = 1;
    function computeRes() {
        const shown = canvas.clientWidth || WIDTH;
        return Math.min(3, Math.max(1, shown * (window.devicePixelRatio || 1) / WIDTH));
    }
    function applyRes() {
        RES = computeRes();
        canvas.width = Math.round(WIDTH * RES);
        canvas.height = Math.round(HEIGHT * RES);
    }
    applyRes();

    // ==================== ESTADO DO JOGO ====================
    let gameRunning = true;
    let score = 0;
    let highscore = localStorage.getItem('runnerHighscore') || 0;
    let animationId = null;

    // Jogador
    let player = {
        y: 0,             // deslocamento vertical do pulo (0 = no chao, negativo = no ar)
        prevY: 0,
        yVelocity: 0,
        isJumping: false,
        jumpTicks: 0,
        landTicks: 0,
        walkDistance: 0,
        currentFrame: 0
    };

    // Obstáculos
    let obstacles = [];

    // Configurações de velocidade
    let spawnCounter = 0;
    let spawnDelay = 120;
    let gameSpeed = 2.5;
    let baseSpeed = 2.5;

    // ==================== IMAGENS ====================
    // Caminhos relativos: funcionam no GitHub Pages e no servidor local.
    const SPRITE_PATHS = {
        walking: [1, 2, 3, 4].map(i => `Img/ImagemRunNoel/assets/walking/w${i}.png`),
        jumping: [1, 2, 3, 5, 6].map(i => `Img/ImagemRunNoel/assets/jump/j${i}.png`),   // j4 era copia da j3
        obstacles: [1, 2, 3, 4].map(i => `Img/ImagemRunNoel/objets/o${i}.png`),
        moon: ['Img/ImagemRunNoel/cenary/c1.png']
    };

    // Sprites prontos para desenhar: { canvas, w, h } ja limpos, recortados e na escala final
    const sprites = {
        walking: [],
        jumping: [],
        obstacles: [],
        moon: null
    };

    // Imagens ja limpas e recortadas, em tamanho original (reescaladas quando a janela muda)
    const cleaned = { walking: [], jumping: [], obstacles: [], moon: null };

    let imagesLoaded = false;
    let backgroundLayer = null;
    let snowParticles = [];

    // Atualiza highscore na tela
    highscoreElement.textContent = highscore;

    // ==================== CARREGAMENTO DAS IMAGENS ====================
    function loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Imagem não encontrada: ${src}`);
                resolve(null);
            };
            img.src = src;
        });
    }

    function makeCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w));
        c.height = Math.max(1, Math.round(h));
        return c;
    }

    // Limpa a imagem original: tira o halo branco que sobrou do fundo removido
    // e os pontinhos soltos perto da borda, depois recorta ao conteudo real.
    function cleanImage(img, minPart) {
        const W = img.width, H = img.height;
        const c = makeCanvas(W, H);
        const cx = c.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0);
        const data = cx.getImageData(0, 0, W, H);
        const d = data.data;
        const alpha = i => d[i * 4 + 3];

        // 1) halo: pixels claros e sem cor encostados na transparencia (ate 3px)
        for (let pass = 0; pass < 3; pass++) {
            const remove = [];
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const i = y * W + x;
                    if (!alpha(i)) continue;
                    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
                    const light = r > 170 && g > 170 && b > 170 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
                    if (!light) continue;
                    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1 ||
                        !alpha(i - 1) || !alpha(i + 1) || !alpha(i - W) || !alpha(i + W);
                    if (edge) remove.push(i);
                }
            }
            if (!remove.length) break;
            for (const i of remove) d[i * 4 + 3] = 0;
        }

        // 2) pontinhos soltos: mantem so as partes grandes (componentes conectados)
        const label = new Int32Array(W * H);
        const parts = [];
        const stack = [];
        for (let start = 0; start < W * H; start++) {
            if (!alpha(start) || label[start]) continue;
            const id = parts.length + 1;
            let size = 0;
            label[start] = id;
            stack.push(start);
            while (stack.length) {
                const i = stack.pop();
                size++;
                const x = i % W, y = (i - x) / W;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                        const n = ny * W + nx;
                        if (alpha(n) && !label[n]) { label[n] = id; stack.push(n); }
                    }
                }
            }
            parts.push(size);
        }
        const biggest = Math.max(0, ...parts);
        const keep = Math.max(minPart, biggest * 0.015);

        // 3) recorte ao conteudo que sobrou
        let x0 = W, y0 = H, x1 = -1, y1 = -1;
        for (let i = 0; i < W * H; i++) {
            if (!alpha(i)) continue;
            if (parts[label[i] - 1] < keep) { d[i * 4 + 3] = 0; continue; }
            const x = i % W, y = (i - x) / W;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
        }
        cx.putImageData(data, 0, 0);
        if (x1 < 0) return { canvas: c, w: W, h: H };

        const out = makeCanvas(x1 - x0 + 1, y1 - y0 + 1);
        out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
        return { canvas: out, w: out.width, h: out.height };
    }

    // Reduz uma vez so para o tamanho final (em vez de reduzir a imagem grande a cada quadro)
    function scaleSprite(clean, scale) {
        const w = clean.w * scale, h = clean.h * scale;
        const c = makeCanvas(w * RES, h * RES);
        const cx = c.getContext('2d');
        cx.imageSmoothingQuality = 'high';
        cx.drawImage(clean.canvas, 0, 0, c.width, c.height);
        return { canvas: c, w, h };
    }

    async function loadSprites() {
        const [walking, jumping, obstacleImgs, moonImgs] = await Promise.all(
            ['walking', 'jumping', 'obstacles', 'moon'].map(key => Promise.all(SPRITE_PATHS[key].map(loadImage)))
        );

        cleaned.walking = walking.map(img => img && cleanImage(img, 30));
        cleaned.jumping = jumping.map(img => img && cleanImage(img, 30));
        cleaned.obstacles = obstacleImgs.map(img => img && cleanImage(img, 30));
        cleaned.moon = moonImgs[0] && cleanImage(moonImgs[0], 4);
        scaleSprites();
    }

    function scaleSprites() {
        // Noel: todos os quadros na MESMA escala (a do primeiro quadro andando), para ele nao
        // mudar de tamanho entre a corrida e o pulo
        const ref = cleaned.walking.find(Boolean);
        if (ref) {
            const scale = PLAYER_HEIGHT / ref.h;
            sprites.walking = cleaned.walking.map(c => c && scaleSprite(c, scale));
            sprites.jumping = cleaned.jumping.map(c => c && scaleSprite(c, scale));
        }

        // Obstaculos: altura propria para cada um, largura pela proporcao da imagem
        sprites.obstacles = cleaned.obstacles.map((c, i) => c && scaleSprite(c, OBSTACLE_HEIGHTS[i] / c.h));
        for (const obs of obstacles) obs.sprite = sprites.obstacles[obs.kind] || null;

        if (cleaned.moon) sprites.moon = scaleSprite(cleaned.moon, 60 / cleaned.moon.h);
    }

    // ==================== FUNÇÕES DO JOGO ====================
    function jump() {
        if (!imagesLoaded) return;
        if (!gameRunning) {
            restartGame();
            return;
        }

        if (!player.isJumping) {
            player.isJumping = true;
            player.yVelocity = -6;
            player.jumpTicks = 0;
            player.landTicks = 0;
        }
    }

    function restartGame() {
        gameRunning = true;
        score = 0;
        gameSpeed = 2.5;
        baseSpeed = 2.5;
        spawnDelay = 130;
        scoreElement.textContent = score;
        obstacles = [];
        player.y = 0;
        player.prevY = 0;
        player.yVelocity = 0;
        player.isJumping = false;
        player.jumpTicks = 0;
        player.landTicks = 0;
        player.walkDistance = 0;
        player.currentFrame = 0;
        spawnCounter = 0;
        gameOverMsg.style.display = 'none';
    }

    function gameOver() {
        gameRunning = false;
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('runnerHighscore', highscore);
            highscoreElement.textContent = highscore;
        }
        gameOverMsg.style.display = 'flex';
    }

    function updateScore() {
        score++;
        scoreElement.textContent = score;

        // Aumenta dificuldade de forma GRADUAL e SUAVE
        if (score < 1000) {
            // Velocidade aumenta muito lentamente: máximo 5.5 aos 1000 pontos
            gameSpeed = baseSpeed + (score / 333);
            // Limita velocidade máxima
            if (gameSpeed > 5.5) gameSpeed = 5.5;

            // Frequência de obstáculos: começa em 120, mínimo 70
            spawnDelay = Math.max(70, 120 - Math.floor(score / 25));
        }
    }

    // Física do pulo
    function updatePhysics() {
        player.prevY = player.y;
        if (player.isJumping) {
            player.jumpTicks++;
            player.yVelocity += 0.14;
            player.y += player.yVelocity;

            if (player.y >= 0) {
                player.y = 0;
                player.isJumping = false;
                player.yVelocity = 0;
                player.landTicks = 8;   // mostra o quadro de aterrissagem por um instante
            }
        } else if (player.landTicks > 0) {
            player.landTicks--;
        }
    }

    // Animação dos sprites
    function updateAnimations() {
        if (player.isJumping) {
            // quadro escolhido pela fase do pulo: impulso, subida, no ar, descida
            const v = player.yVelocity;
            if (player.jumpTicks < 5) player.currentFrame = 0;
            else if (v < -2.5) player.currentFrame = 1;
            else if (v < 2.5) player.currentFrame = 2;
            else player.currentFrame = 3;
        } else if (player.landTicks > 0) {
            player.currentFrame = 4;
        } else {
            // os passos acompanham a velocidade do cenario
            player.walkDistance += gameSpeed;
            if (player.walkDistance >= 22) {
                player.walkDistance -= 22;
                player.currentFrame = (player.currentFrame + 1) % Math.max(1, sprites.walking.length);
            }
            player.currentFrame %= Math.max(1, sprites.walking.length);
        }
    }

    // Geração de obstáculos
    function updateObstacles() {
        if (!gameRunning) return;

        spawnCounter++;
        if (spawnCounter >= spawnDelay) {
            spawnCounter = 0;

            const index = Math.floor(Math.random() * OBSTACLE_HEIGHTS.length);
            const sprite = sprites.obstacles[index];
            const height = OBSTACLE_HEIGHTS[index];
            const width = sprite ? sprite.w : 38;

            obstacles.push({
                x: WIDTH,
                prevX: WIDTH,
                y: FLOOR_Y - height,
                width,
                height,
                kind: index,
                sprite
            });
        }

        // Move obstáculos
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].prevX = obstacles[i].x;
            obstacles[i].x -= gameSpeed;

            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                i--;
                updateScore();
            }
        }
    }

    // Caixa do Noel no chao (a mesma em todos os quadros, para a colisao ser justa)
    function playerBox() {
        const ref = sprites.walking[0];
        const w = ref ? ref.w : 45;
        const h = PLAYER_HEIGHT;
        const bottom = FLOOR_Y + player.y;
        return { left: PLAYER_X + w * 0.22, right: PLAYER_X + w * 0.78, top: bottom - h * 0.88, bottom: bottom - 2 };
    }

    // Colisão: caixas um pouco menores que o desenho, para nao matar por um pixel de chapeu
    function checkCollision() {
        const p = playerBox();

        for (let obs of obstacles) {
            const obsLeft = obs.x + obs.width * 0.2;
            const obsRight = obs.x + obs.width * 0.8;
            const obsTop = obs.y + obs.height * 0.12;
            const obsBottom = obs.y + obs.height;

            if (p.right > obsLeft &&
                p.left < obsRight &&
                p.bottom > obsTop &&
                p.top < obsBottom) {
                gameOver();
                return true;
            }
        }
        return false;
    }

    // ==================== DESENHO ====================
    // Ceu, estrelas, lua e chao nao mudam: desenhados uma vez numa camada separada
    function buildBackground() {
        backgroundLayer = makeCanvas(canvas.width, canvas.height);
        const bg = backgroundLayer.getContext('2d');
        bg.scale(RES, RES);

        // Céu gradiente
        const gradient = bg.createLinearGradient(0, 0, 0, GROUND_Y);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        bg.fillStyle = gradient;
        bg.fillRect(0, 0, WIDTH, GROUND_Y);
        bg.fillStyle = '#0f3460';
        bg.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

        // Estrelas fixas
        bg.fillStyle = '#ffffff';
        bg.beginPath();
        for (let i = 0; i < 50; i++) {
            const starX = (i * 37) % WIDTH;
            const starY = (i * 13) % (GROUND_Y - 50);
            bg.moveTo(starX + 1.5, starY);
            bg.arc(starX, starY, 1.5, 0, Math.PI * 2);
        }
        bg.fill();

        // Lua (c1.png) ou uma lua simples se a imagem faltar
        if (sprites.moon) {
            bg.drawImage(sprites.moon.canvas, 730 - sprites.moon.w, 30, sprites.moon.w, sprites.moon.h);
        } else {
            bg.fillStyle = '#f5e6b8';
            bg.beginPath();
            bg.arc(700, 60, 30, 0, Math.PI * 2);
            bg.fill();
            bg.fillStyle = '#1a1a2e';
            bg.beginPath();
            bg.arc(710, 55, 28, 0, Math.PI * 2);
            bg.fill();
        }

        // Chão
        bg.fillStyle = '#2c2c3e';
        bg.fillRect(0, GROUND_Y + 40, WIDTH, 8);
        bg.fillStyle = '#e8e8f0';
        bg.fillRect(0, GROUND_Y + 38, WIDTH, 4);

        // Neve acumulada
        bg.fillStyle = '#ffffff';
        bg.fillRect(0, GROUND_Y + 42, WIDTH, 3);

        // Linha de corrida
        bg.strokeStyle = '#ff6b6b';
        bg.lineWidth = 2;
        bg.setLineDash([25, 35]);
        bg.beginPath();
        bg.moveTo(0, GROUND_Y + 46);
        bg.lineTo(WIDTH, GROUND_Y + 46);
        bg.stroke();
        bg.setLineDash([]);
    }

    function drawPlayer(alpha) {
        const list = player.isJumping || player.landTicks > 0 ? sprites.jumping : sprites.walking;
        const sprite = list[player.currentFrame];
        const offset = player.prevY + (player.y - player.prevY) * alpha;
        const bottom = FLOOR_Y + offset;

        if (sprite) {
            // ancorado pelos pes, centralizado na mesma coluna em todos os quadros
            const ref = sprites.walking[0] || sprite;
            const x = PLAYER_X + ref.w / 2 - sprite.w / 2;
            ctx.drawImage(sprite.canvas, x, bottom - sprite.h, sprite.w, sprite.h);
        } else {
            // Fallback visual
            const y = bottom - 55;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(PLAYER_X, y, 45, 55);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(PLAYER_X + 10, y + 10, 25, 25);
            ctx.fillStyle = '#000000';
            ctx.fillRect(PLAYER_X + 15, y + 20, 5, 5);
            ctx.fillRect(PLAYER_X + 25, y + 20, 5, 5);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(PLAYER_X + 12, y - 5, 21, 10);
        }
    }

    function drawObstacles(alpha) {
        for (let obs of obstacles) {
            const x = obs.prevX + (obs.x - obs.prevX) * alpha;
            if (obs.sprite) {
                ctx.drawImage(obs.sprite.canvas, x, obs.y, obs.width, obs.height);
            } else {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, obs.y, obs.width, obs.height);
            }
        }
    }

    // Efeito de neve suave
    function initSnow() {
        snowParticles = [];
        for (let i = 0; i < 40; i++) {
            snowParticles.push({
                x: Math.random() * WIDTH,
                y: Math.random() * GROUND_Y,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.8 + 0.3
            });
        }
    }

    function updateSnow() {
        for (const snow of snowParticles) {
            snow.y += snow.speed;
            if (snow.y > GROUND_Y) {
                snow.y = 0;
                snow.x = Math.random() * WIDTH;
            }
        }
    }

    // todos os flocos num unico caminho: um fill so por quadro
    function drawSnowEffect() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        for (const snow of snowParticles) {
            ctx.moveTo(snow.x + snow.radius, snow.y);
            ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    function draw(alpha) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (backgroundLayer) ctx.drawImage(backgroundLayer, 0, 0);
        else {
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.setTransform(RES, 0, 0, RES, 0, 0);

        if (!imagesLoaded) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Carregando...', WIDTH / 2, HEIGHT / 2);
            return;
        }

        drawObstacles(alpha);
        drawPlayer(alpha);
        drawSnowEffect();

        // Tela de GAME OVER
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 36px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('💀 GAME OVER 💀', WIDTH / 2, HEIGHT / 2 - 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText('Pressione ESPAÇO ou clique para reiniciar', WIDTH / 2, HEIGHT / 2 + 30);
        }
    }

    // ==================== LOOP PRINCIPAL ====================
    // Passo fixo: a fisica roda sempre a 60 passos/s (em 60, 120 ou 144 Hz o jogo tem a
    // mesma velocidade); o desenho interpola entre o passo anterior e o atual.
    let lastTime = 0;
    let accumulator = 0;

    function update() {
        if (gameRunning) {
            updatePhysics();
            updateAnimations();
            updateObstacles();
            checkCollision();
        }
        updateSnow();
    }

    function gameLoop(now) {
        // aba em segundo plano ou travada: nao tenta recuperar segundos de atraso de uma vez
        const elapsed = Math.min(now - lastTime, 100);
        lastTime = now;
        accumulator += elapsed;
        while (accumulator >= STEP) {
            update();
            accumulator -= STEP;
        }

        draw(gameRunning ? accumulator / STEP : 1);
        animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (animationId) cancelAnimationFrame(animationId);
        lastTime = performance.now();
        accumulator = 0;
        animationId = requestAnimationFrame(gameLoop);
    }

    // ==================== EVENTOS ====================
    // teclas que o navegador usa para rolar a pagina: bloqueadas enquanto o jogo esta aberto
    // (confere e.key e e.code: as setas do teclado numerico chegam com code 'Numpad2' etc.)
    const SCROLL_KEYS = [' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'Up', 'Down', 'PageUp', 'PageDown', 'Home', 'End'];
    const SCROLL_CODES = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];

    function handleKey(e) {
        const typing = e.target.closest && e.target.closest('input, textarea, select');
        if ((SCROLL_KEYS.includes(e.key) || SCROLL_CODES.includes(e.code)) && !typing) e.preventDefault();
        if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === ' ') {
            if (!e.repeat) jump();
        }
    }

    // fase de captura: bloqueia a rolagem antes de qualquer outro elemento tratar a tecla
    window.addEventListener('keydown', handleKey, { capture: true, passive: false });
    // pointerdown responde na hora no celular (o click tem atraso)
    canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        jump();
    });

    // Botão reiniciar
    restartBtn.addEventListener('click', () => {
        restartGame();
    });

    // Janela redimensionada: refaz canvas, sprites e fundo na nova resolucao
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (Math.abs(computeRes() - RES) < 0.05) return;
            applyRes();
            scaleSprites();
            buildBackground();
        }, 150);
    });

    // ==================== INICIO ====================
    initSnow();
    buildBackground();
    startGame();

    loadSprites()
        .catch(err => console.warn('Falha ao preparar as imagens:', err))
        .finally(() => {
            buildBackground();   // refaz a camada de fundo ja com a lua
            imagesLoaded = true;
            console.log('Run Noel - Jogo inicializado!');
        });
});
