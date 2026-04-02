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
    const GROUND_Y = 320;
    const PLAYER_X = 100;

    // ==================== ESTADO DO JOGO ====================
    let gameRunning = true;
    let score = 0;
    let highscore = localStorage.getItem('runnerHighscore') || 0;
    let frame = 0;
    let animationId = null;

    // Jogador=
    let player = {
        y: GROUND_Y - 15,  // Ajustado: antes era GROUND_Y (ficava enterrado)
        yVelocity: 0,
        width: 45,
        height: 55,
        isJumping: false,
        currentFrame: 0,
        frameCounter: 0
    };

    // Obstáculos
    let obstacles = [];

    // Configurações de velocidade
    let spawnCounter = 0;
    let spawnDelay = 120;
    let gameSpeed = 2.5;
    let baseSpeed = 2.5;
    let moonImage = null;  // 👈 Guardar a imagem da lua

    // ==================== IMAGENS ====================
    const images = {
        walking: [],
        jumping: [],
        obstacles: []
    };

    let imagesLoaded = false;
    let loadedCount = 0;
    let totalImages = 0;

    // Atualiza highscore na tela
    highscoreElement.textContent = highscore;

    // ==================== CARREGAMENTO DAS IMAGENS ====================
    // Walking (w1 a w4)
    for (let i = 1; i <= 4; i++) {
        totalImages++;
        const img = new Image();
        img.src = `/NickJogos/Img/ImagemRunNoel/assets/walking/w${i}.png`;
        img.onload = () => checkImageLoaded();
        img.onerror = () => {
            console.warn(`Imagem não encontrada: /NickJogos/Img/ImagemRunNoel/assets/walking/w${i}.png`);
            checkImageLoaded();
        };
        images.walking.push(img);
    }

    // Jump (j1 a j6)
    for (let i = 1; i <= 6; i++) {
        totalImages++;
        const img = new Image();
        img.src = `/NickJogos/Img/ImagemRunNoel/assets/jump/j${i}.png`;
        img.onload = () => checkImageLoaded();
        img.onerror = () => {
            console.warn(`Imagem não encontrada: /NickJogos/Img/ImagemRunNoel/assets/jump/j${i}.png`);
            checkImageLoaded();
        };
        images.jumping.push(img);
    }

    // Obstacles (o1 a o4)
    for (let i = 1; i <= 4; i++) {
        totalImages++;
        const img = new Image();
        img.src = `/NickJogos/Img/ImagemRunNoel/objets/o${i}.png`;
        img.onload = () => checkImageLoaded();
        img.onerror = () => {
            console.warn(`Imagem não encontrada: Img/ImagemRunNoel/objets/o${i}.png`);
            checkImageLoaded();
        };
        images.obstacles.push(img);
    }

    // 👈 Carregar imagem da lua (c1.png)
    totalImages++;
    moonImage = new Image();
    moonImage.src = "/NickJogos/Img/ImagemRunNoel/cenary/c1.png";
    moonImage.onload = () => checkImageLoaded();
    moonImage.onerror = () => {
        console.warn(`Imagem não encontrada: /NickJogos/Img/ImagemRunNoel/cenary/c1.png`);
        checkImageLoaded();
    };

    function checkImageLoaded() {
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            console.log('Todas as imagens carregadas!');
            startGame();
        }
    }

    // Fallback: se demorar muito, inicia mesmo assim
    setTimeout(() => {
        if (!imagesLoaded) {
            console.warn('Timeout: iniciando jogo sem imagens (modo fallback)');
            imagesLoaded = true;
            startGame();
        }
    }, 3000);

    // ==================== FUNÇÕES DO JOGO ====================
    function jump() {
        if (!gameRunning) {
            restartGame();
            return;
        }
        
        if (!player.isJumping) {
            player.isJumping = true;
            player.yVelocity = -6;   // sobe mais devagar (antes era -9)
            player.currentFrame = 0;
            player.frameCounter = 0;
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
        player.y = GROUND_Y - 15;  // Ajustado
        player.yVelocity = 0;
        player.isJumping = false;
        player.currentFrame = 0;
        player.frameCounter = 0;
        spawnCounter = 0;
        frame = 0;
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

    // Física do pulo CORRIGIDA
    function updatePhysics() {
        if (player.isJumping) {
            player.yVelocity += 0.14; // gravidade mais fraca (antes era 0.28)
            player.y += player.yVelocity;
            
            if (player.y >= GROUND_Y - 15) {
                player.y = GROUND_Y - 15;
                player.isJumping = false;
                player.yVelocity = 0;
                player.currentFrame = 0;
                player.frameCounter = 0;
            }
        }
    }

    // Animação dos sprites
    function updateAnimations() {
        player.frameCounter++;
        
        if (!player.isJumping) {
            if (player.frameCounter >= 25 ) {
                player.frameCounter = 0;
                player.currentFrame = (player.currentFrame + 1) % images.walking.length;
            }
        } else {
            if (player.frameCounter >= 50 && player.currentFrame < images.jumping.length - 1) {
                player.frameCounter = 0;
                player.currentFrame++;
            }
            if (player.currentFrame >= images.jumping.length) {
                player.currentFrame = images.jumping.length - 1;
            }
        }
    }

    // Geração de obstáculos
    function updateObstacles() {
        if (!gameRunning) return;
        
        spawnCounter++;
        if (spawnCounter >= spawnDelay) {
            spawnCounter = 0;
            
            const randomIndex = Math.floor(Math.random() * images.obstacles.length);
            const obstacleImg = images.obstacles[randomIndex];
            
            obstacles.push({
                x: canvas.width,
                y: GROUND_Y - 10,  // Ajustado: antes era GROUND_Y + 8
                width: 38,
                height: 60,
                img: obstacleImg
            });
        }
        
        // Move obstáculos
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].x -= gameSpeed;
            
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                i--;
                updateScore();
            }
        }
    }

    // Colisão (HITBOX mais precisa)
    function checkCollision() {
        const playerLeft = PLAYER_X + 10;
        const playerRight = PLAYER_X + player.width - 10;
        const playerTop = player.y + 10;
        const playerBottom = player.y + player.height - 10;
        
        for (let obs of obstacles) {
            const obsLeft = obs.x + 10;
            const obsRight = obs.x + obs.width - 10;
            const obsTop = obs.y + 10;
            const obsBottom = obs.y + obs.height - 10;
            
            if (playerRight > obsLeft && 
                playerLeft < obsRight && 
                playerBottom > obsTop && 
                playerTop < obsBottom) {
                gameOver();
                return true;
            }
        }
        return false;
    }

    function drawBackground() {
        // Céu gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, GROUND_Y);
        
        // Estrelas fixas
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const starX = (i * 37) % canvas.width;
            const starY = (i * 13) % (GROUND_Y - 50);
            ctx.beginPath();
            ctx.arc(starX, starY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // ========== LUA (usando imagem c1.png) ==========
        if (moonImage && moonImage.complete && moonImage.naturalWidth > 0) {
            ctx.drawImage(moonImage, 670, 30, 60, 60);
        } else {
            // Fallback: desenha uma lua simples caso a imagem não tenha carregado
            ctx.fillStyle = '#f5e6b8';
            ctx.beginPath();
            ctx.arc(700, 60, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(710, 55, 28, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function drawGround() {
        // Chão
        ctx.fillStyle = '#2c2c3e';
        ctx.fillRect(0, GROUND_Y + 40, canvas.width, 8);
        
        ctx.fillStyle = '#e8e8f0';
        ctx.fillRect(0, GROUND_Y + 38, canvas.width, 4);
        
        // Neve acumulada
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, GROUND_Y + 42, canvas.width, 3);
        
        // Linha de corrida
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.setLineDash([25, 35]);
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 46);
        ctx.lineTo(canvas.width, GROUND_Y + 46);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawPlayer() {
        let currentImg = null;
        
        if (!player.isJumping) {
            currentImg = images.walking[player.currentFrame];
        } else {
            currentImg = images.jumping[player.currentFrame];
        }
        
        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.drawImage(currentImg, PLAYER_X, player.y, player.width, player.height);
        } else {
            // Fallback visual
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(PLAYER_X, player.y, player.width, player.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(PLAYER_X + 10, player.y + 10, 25, 25);
            ctx.fillStyle = '#000000';
            ctx.fillRect(PLAYER_X + 15, player.y + 20, 5, 5);
            ctx.fillRect(PLAYER_X + 25, player.y + 20, 5, 5);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(PLAYER_X + 12, player.y - 5, 21, 10);
        }
    }

    function drawObstacles() {
        for (let obs of obstacles) {
            if (obs.img && obs.img.complete && obs.img.naturalWidth > 0) {
                ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);
            } else {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        }
    }

    // Efeito de neve suave
    let snowParticles = [];
    
    // Inicializa partículas de neve
    for (let i = 0; i < 40; i++) {
        snowParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * GROUND_Y,
            radius: Math.random() * 2 + 1,
            speed: Math.random() * 0.8 + 0.3
        });
    }
    
    function drawSnowEffect() {
        for (let i = 0; i < snowParticles.length; i++) {
            const snow = snowParticles[i];
            ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
            ctx.beginPath();
            ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Move a neve para baixo
            snow.y += snow.speed;
            
            // Reset se sair da tela
            if (snow.y > GROUND_Y) {
                snow.y = 0;
                snow.x = Math.random() * canvas.width;
            }
        }
    }

    function draw() {
        if (!ctx) return;
        
        // LIMPEZA TOTAL DO CANVAS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        drawGround();
        drawObstacles();
        drawPlayer();
        drawSnowEffect();
        
        // Tela de GAME OVER (sem duplicação)
        if (!gameRunning && imagesLoaded) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 36px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('💀 GAME OVER 💀', canvas.width/2, canvas.height/2 - 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText('Pressione ESPAÇO ou clique para reiniciar', canvas.width/2, canvas.height/2 + 30);
        }
    }

    // ==================== LOOP PRINCIPAL ====================
    function gameLoop() {
        if (gameRunning && imagesLoaded) {
            updatePhysics();
            updateAnimations();
            updateObstacles();
            checkCollision();
        }
        
        draw();
        frame++;
        
        animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (animationId) cancelAnimationFrame(animationId);
        gameLoop();
    }

    // ==================== EVENTOS ====================
    function handleJump(e) {
        if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === ' ') {
            e.preventDefault();
            jump();
        }
    }

    window.addEventListener('keydown', handleJump);
    canvas.addEventListener('click', () => jump());
    
    // Previne scroll da página
    window.addEventListener('keydown', function(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
        }
    });

    // Botão reiniciar
    restartBtn.addEventListener('click', () => {
        restartGame();
    });

    console.log('Runner Noel - Jogo inicializado!');
});