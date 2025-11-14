class PuppetSoccer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Carregar imagens (jogadores, bola e traves)
        this.ballImage = new Image();
        this.ballImage.src = 'Img/ImagemHeadSoccer/bola.jpg';
        this.ballLoaded = false;
        this.ballImage.onload = () => {
            this.ballLoaded = true;
        };
        
        this.player1Image = new Image();
        this.player1Image.src = 'Img/ImagemHeadSoccer/jogador1.png';
        this.player1Loaded = false;
        this.player1Image.onload = () => {
            this.player1Loaded = true;
        };
        
        this.player2Image = new Image();
        this.player2Image.src = 'Img/ImagemHeadSoccer/jogador2.png';
        this.player2Loaded = false;
        this.player2Image.onload = () => {
            this.player2Loaded = true;
        };
        
        // Carregar imagem das traves
        this.goalImage = new Image();
        this.goalImage.src = 'Img/ImagemHeadSoccer/Trave.png';
        this.goalLoaded = false;
        this.goalImage.onload = () => {
            this.goalLoaded = true;
        };
        
        // Configurações do jogo (serão ajustadas no setCanvasSize)
        this.groundY = 400;
        this.gravity = 0.4;
        this.jumpPower = 12;
        
        // Controlador de FPS
        this.fps = 60;
        this.deltaTime = 0;
        this.lastTime = 0;
        
        // Jogadores (valores base, serão ajustados)
        this.players = [
            { 
                x: 150, 
                y: this.groundY - 25,
                width: 60,
                height: 60,
                color: '#e74c3c', 
                speed: 3.5,
                velY: 0,
                isJumping: false,
                footAngle: 0,
                isKicking: false,
                kickProgress: 0,
                direction: 1,
                image: this.player1Image,
                loaded: false,
                keys: { 
                    up: 'KeyW', 
                    left: 'KeyA', 
                    right: 'KeyD',
                    kick: 'Space'
                }
            },
            { 
                x: 750, 
                y: this.groundY - 25,
                width: 60,
                height: 60,
                color: '#3498db', 
                speed: 3.5,
                velY: 0,
                isJumping: false,
                footAngle: 0,
                isKicking: false,
                kickProgress: 0,
                direction: -1,
                image: this.player2Image,
                loaded: false,
                keys: { 
                    up: 'ArrowUp', 
                    left: 'ArrowLeft', 
                    right: 'ArrowRight',
                    kick: 'Numpad0'
                }
            }
        ];
        
        // Bola (valores base, serão ajustados)
        this.ball = { 
            x: 450, 
            y: this.groundY - 25,
            radius: 25,
            speedX: 0, 
            speedY: 0,
            friction: 0.96,
            lastCollision: null
        };
        
        // Gols (valores base, serão ajustados)
        this.goals = [
            { x: 0, y: 280, width: 80, height: 140 },
            { x: 820, y: 280, width: 80, height: 140 }
        ];
        
        this.score = [0, 0];
        this.keys = {};
        
        // Configurações base para referência (tela 900x500)
        this.baseWidth = 900;
        this.baseHeight = 500;
        
        // Configurar canvas responsivo
        this.setCanvasSize();
        window.addEventListener('resize', () => this.setCanvasSize());
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setCanvasSize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Calcular fatores de escala
        const scaleX = this.canvas.width / this.baseWidth;
        const scaleY = this.canvas.height / this.baseHeight;
        this.scale = Math.min(scaleX, scaleY); // Manter proporção
        
        // Aplicar escala a todas as propriedades do jogo
        
        // Chão
        this.groundY = this.canvas.height * 0.8;
        
        // Jogadores
        const playerSize = 60 * this.scale;
        this.players[0].width = playerSize;
        this.players[0].height = playerSize;
        this.players[1].width = playerSize;
        this.players[1].height = playerSize;
        
        this.players[0].x = this.canvas.width * 0.15;
        this.players[1].x = this.canvas.width * 0.85;
        this.players[0].y = this.groundY - playerSize/2;
        this.players[1].y = this.groundY - playerSize/2;
        
        // Velocidades proporcionais
        this.players[0].speed = 3.5 * this.scale;
        this.players[1].speed = 3.5 * this.scale;
        this.jumpPower = 12 * this.scale;
        this.gravity = 0.4 * this.scale;
        
        // Gols
        const goalWidth = 80 * this.scale;
        const goalHeight = 140 * this.scale;
        
        this.goals[0].x = 0;
        this.goals[0].y = this.canvas.height * 0.580;
        this.goals[0].width = goalWidth;
        this.goals[0].height = goalHeight;
        
        this.goals[1].x = this.canvas.width - goalWidth;
        this.goals[1].y = this.canvas.height * 0.580;
        this.goals[1].width = goalWidth;
        this.goals[1].height = goalHeight;
        
        // Bola
        this.ball.radius = 25 * this.scale;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.groundY - this.ball.radius;
        
        // Ajustar força do chute para ser proporcional
        this.ball.friction = 0.96; // Manter o mesmo
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            this.players.forEach((player) => {
                if (e.code === player.keys.up && !player.isJumping && player.y >= this.groundY - player.height / 2) {
                    player.velY = -this.jumpPower;
                    player.isJumping = true;
                }
                
                if (e.code === player.keys.kick && !player.isKicking) {
                    player.isKicking = true;
                    player.kickProgress = 0;
                }
            });
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    updatePlayers() {
        this.players.forEach(player => {
            if (this.keys[player.keys.left] && player.x - player.width / 2 > 0) {
                player.x -= player.speed * (this.deltaTime / 16);
                player.direction = -1;
            }
            if (this.keys[player.keys.right] && player.x + player.width / 2 < this.canvas.width) {
                player.x += player.speed * (this.deltaTime / 16);
                player.direction = 1;
            }
            
            if (player.isKicking) {
                player.kickProgress++;
                
                const kickDuration = 15;
                const progress = player.kickProgress / kickDuration;
                
                if (progress <= 0.4) {
                    player.footAngle = -Math.PI/4 * progress * 2.5;
                } else if (progress <= 0.7) {
                    player.footAngle = Math.PI/2 * (progress - 0.4) * 3.3;
                } else {
                    player.footAngle = Math.PI/2 * (1 - (progress - 0.7) * 3.3);
                }
                
                if (progress > 0.4 && progress < 0.6) {
                    this.checkKickCollision(player);
                }
                
                if (player.kickProgress > kickDuration) {
                    player.isKicking = false;
                    player.footAngle = 0;
                }
            }
            
            player.y += player.velY * (this.deltaTime / 16);
            player.velY += this.gravity * (this.deltaTime / 16);
            
            if (player.y > this.groundY - player.height / 2) {
                player.y = this.groundY - player.height / 2;
                player.velY = 0;
                player.isJumping = false;
            }
        });
    }
    
    checkKickCollision(player) {
        const footPoints = this.calculateFootPoints(player);
        
        // Criar uma área maior de detecção ao redor do triângulo
        for (let point of footPoints) {
            const dx = point.x - this.ball.x;
            const dy = point.y - this.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // AUMENTAR a área de colisão
            if (distance < this.ball.radius + (10 * this.scale)) { // Aumentado de 3 para 10
                const kickStrength = 15 * this.scale;
                const kickPower = kickStrength * (1 + Math.random() * 0.2);
                
                this.ball.speedX = Math.abs(kickPower) * player.direction;
                this.ball.speedY = -kickPower * 0.3;
                
                this.ball.lastCollision = Date.now();
                break;
            }
        }
    }
    
    calculateFootPoints(player) {
        // Base do pé (grudada na parte de baixo da cabeça)
        const baseX = player.x;
        const baseY = player.y + player.height / 2 - (2 * this.scale);
        
        // Comprimentos do triângulo escaleno (MAIORES para melhor alcance)
        const length1 = 45 * this.scale;  // Aumentado de 35 para 45
        const length2 = 70 * this.scale;  // Aumentado de 55 para 70
        
        // Pontos do triângulo escaleno
        const kickDirection = player.direction;
        
        const pointA = { x: baseX, y: baseY };
        
        const pointB = {
            x: baseX + Math.cos(player.footAngle) * length2 * kickDirection,
            y: baseY + Math.sin(player.footAngle) * length2
        };
        
        const pointC = {
            x: baseX + Math.cos(player.footAngle - Math.PI/4) * length1 * kickDirection, // Aumentado o ângulo
            y: baseY + Math.sin(player.footAngle - Math.PI/4) * length1
        };
        
        return [pointA, pointB, pointC];
    }
    
    checkBallCollisions() {
        // Colisão com jogadores (cabeça)
        this.players.forEach(player => {
            const dx = this.ball.x - player.x;
            const dy = this.ball.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const collisionRadius = this.ball.radius + (player.width / 2);
            
            const timeSinceLastCollision = Date.now() - this.ball.lastCollision;
            
            if (distance < collisionRadius && timeSinceLastCollision > 100) {
                const angle = Math.atan2(dy, dx);
                const overlap = collisionRadius - distance;
                
                this.ball.x += Math.cos(angle) * overlap * 1.1;
                this.ball.y += Math.sin(angle) * overlap * 1.1;
                
                const playerSpeed = Math.sqrt(player.velY * player.velY);
                const impactForce = (1.2 + playerSpeed * 0.5) * this.scale;
                
                this.ball.speedX += Math.cos(angle) * impactForce;
                this.ball.speedY += Math.sin(angle) * impactForce;
                
                this.ball.lastCollision = Date.now();
            }
        });
        
        // Colisão com gols
        this.goals.forEach((goal, index) => {
            if (this.ball.x - this.ball.radius < goal.x + goal.width &&
                this.ball.x + this.ball.radius > goal.x &&
                this.ball.y - this.ball.radius < goal.y + goal.height &&
                this.ball.y + this.ball.radius > goal.y) {
                
                this.score[index]++;
                this.updateScore();
                this.resetBall();
            }
        });
        
        // Colisão com paredes laterais E PAREDES ACIMA DOS GOLS
        if ((this.ball.x - this.ball.radius < 0 && 
            (this.ball.y < this.goals[0].y || this.ball.y > this.goals[0].y + this.goals[0].height)) ||
            (this.ball.x + this.ball.radius > this.canvas.width &&
            (this.ball.y < this.goals[1].y || this.ball.y > this.goals[1].y + this.goals[1].height))) {
            this.ball.speedX *= -0.7;
            this.ball.lastCollision = Date.now();
        }
        
        // NOVO: Colisão com parede invisível acima do gol ESQUERDO
        if (this.ball.x - this.ball.radius < this.goals[0].x + this.goals[0].width &&
            this.ball.x + this.ball.radius > this.goals[0].x &&
            this.ball.y < this.goals[0].y) {
            // Se a bola está na área horizontal do gol esquerdo mas ACIMA do gol
            this.ball.speedX *= -0.7;
            this.ball.x = this.goals[0].x + this.goals[0].width + this.ball.radius;
            this.ball.lastCollision = Date.now();
        }
        
        // NOVO: Colisão com parede invisível acima do gol DIREITO
        if (this.ball.x - this.ball.radius < this.goals[1].x + this.goals[1].width &&
            this.ball.x + this.ball.radius > this.goals[1].x &&
            this.ball.y < this.goals[1].y) {
            // Se a bola está na área horizontal do gol direito mas ACIMA do gol
            this.ball.speedX *= -0.7;
            this.ball.x = this.goals[1].x - this.ball.radius;
            this.ball.lastCollision = Date.now();
        }
        
        // Colisão com teto
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.speedY *= -0.7;
            this.ball.y = this.ball.radius;
            this.ball.lastCollision = Date.now();
        }
        
        // Colisão com chão
        if (this.ball.y + this.ball.radius > this.groundY) {
            this.ball.speedY *= -0.7;
            this.ball.y = this.groundY - this.ball.radius;
            this.ball.speedX *= 0.9;
            this.ball.lastCollision = Date.now();
        }
        
        const maxSpeed = 25 * this.scale;
        this.ball.speedX = Math.max(Math.min(this.ball.speedX, maxSpeed), -maxSpeed);
        this.ball.speedY = Math.max(Math.min(this.ball.speedY, maxSpeed), -maxSpeed);
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.groundY - this.ball.radius;
        this.ball.speedX = 0;
        this.ball.speedY = 0;
        this.ball.lastCollision = Date.now();
    }
    
    updateScore() {
        document.getElementById('score1').textContent = this.score[0];
        document.getElementById('score2').textContent = this.score[1];
    }
    
    drawField() {
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3 * this.scale;
        this.ctx.setLineDash([10 * this.scale, 10 * this.scale]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 70 * this.scale, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#145a32';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Desenhar traves com imagem
        this.drawGoals();
    }
    
    drawGoals() {
        if (this.goalLoaded) {
            // Trave esquerda
            this.ctx.drawImage(
                this.goalImage,
                this.goals[0].x,
                this.goals[0].y,
                this.goals[0].width,
                this.goals[0].height
            );
            
            // Trave direita (espelhada)
            this.ctx.save();
            this.ctx.translate(this.goals[1].x + this.goals[1].width, this.goals[1].y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                this.goalImage,
                0,
                0,
                this.goals[1].width,
                this.goals[1].height
            );
            this.ctx.restore();
        } else {
            // Fallback: desenhar retângulos brancos
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.goals[0].x, this.goals[0].y, this.goals[0].width, this.goals[0].height);
            this.ctx.fillRect(this.goals[1].x, this.goals[1].y, this.goals[1].width, this.goals[1].height);
        }
    }
    
    drawPlayer(player) {
        // CABEÇA (imagem)
        if ((player === this.players[0] && this.player1Loaded) || 
            (player === this.players[1] && this.player2Loaded)) {
            
            this.ctx.save();
            
            // CORREÇÃO: Espelhar apenas quando direction = 1 (direita)
            if (player.direction === 1) {
                this.ctx.translate(player.x, 0);
                this.ctx.scale(-1, 1);
                this.ctx.translate(-player.x, 0);
            }
            
            this.ctx.drawImage(
                player.image,
                player.x - player.width / 2,
                player.y - player.height / 2,
                player.width,
                player.height
            );
            
            this.ctx.restore();
        } else {
            // Fallback: desenhar círculo colorido
            this.ctx.fillStyle = player.color;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, player.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // PÉ (triângulo escaleno)
        const footPoints = this.calculateFootPoints(player);
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.moveTo(footPoints[0].x, footPoints[0].y);
        this.ctx.lineTo(footPoints[1].x, footPoints[1].y);
        this.ctx.lineTo(footPoints[2].x, footPoints[2].y);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2 * this.scale;
        this.ctx.stroke();
    }
    
    drawBall() {
        if (this.ballLoaded) {
            const diameter = this.ball.radius * 2.5;
            this.ctx.drawImage(
                this.ballImage, 
                this.ball.x - this.ball.radius * 1.25,
                this.ball.y - this.ball.radius * 1.25,
                diameter, 
                diameter
            );
        } else {
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2 * this.scale;
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawField();
        
        // Desenhar jogadores (com triângulo escaleno)
        this.players.forEach(player => {
            this.drawPlayer(player);
        });
        
        // Desenhar bola
        this.drawBall();
    }
    
    updateBall() {
        this.ball.x += this.ball.speedX * (this.deltaTime / 16);
        this.ball.y += this.ball.speedY * (this.deltaTime / 16);
        this.ball.speedX *= this.ball.friction;
        this.ball.speedY *= this.ball.friction;
        this.ball.speedY += 0.15 * this.scale;
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.updatePlayers();
        this.updateBall();
        this.checkBallCollisions();
        this.draw();
        
        setTimeout(() => {
            requestAnimationFrame((time) => this.gameLoop(time));
        }, 1000 / this.fps);
    }
}

window.addEventListener('load', () => {
    new PuppetSoccer();
});

window.addEventListener('keydown', function(e) {
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);