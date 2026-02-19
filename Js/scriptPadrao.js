// Funções de redirecionamento (já existentes)
function home(){
    window.location.href = "index.html";
}

function abrirBatalhaNaval(){
    window.location.href = "jogoBatalhaNaval.html";
}

function abrirJogoMemoria(){
    window.location.href = "jogoMemoria.html";
}

function abrirJogoMusica(){
    window.location.href = "jogoAdivinhaMusica.html";
}

function abrirJogoSenha(){
    window.location.href = "jogoSenha.html";
}

function abrirJogoHeadSoccer(){
    window.location.href = "jogoHeadSoccer.html";
}

function abrirJogoPokemon(){
    window.location.href = "jogoPokemon.html";
}

function abrirJogoTamagotchi(){
    window.location.href = "jogoTamagotchi.html";
}

// Funcionalidade das categorias
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove a classe active de todos os botões
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adiciona a classe active ao botão clicado
                this.classList.add('active');
                
                // Pega a categoria selecionada
                const categoriaSelecionada = this.textContent.trim();
                
                // Filtra os jogos
                filtrarJogosPorCategoria(categoriaSelecionada);
            });
        });
    }
});

// Versão simplificada da função de filtro
function filtrarJogosPorCategoria(categoria) {
    const todosJogos = document.querySelectorAll('.game-card');
    let jogosEncontrados = 0;
    
    todosJogos.forEach(jogo => {
        const categoriaSpan = jogo.querySelector('.game-info span').textContent;
        const titulo = jogo.querySelector('.game-title').textContent;
        
        let pertenceACategoria = false;
        
        if (categoria === 'Todos') {
            pertenceACategoria = true;
        } else {
            // Regras especiais
            if (titulo === 'Head Soccer') {
                // Head Soccer pertence a Esportes E Multiplayer
                pertenceACategoria = (categoria === 'Esportes' || categoria === 'Multiplayer');
            } else {
                // Para os outros jogos, compara normalmente
                pertenceACategoria = (categoriaSpan === categoria);
            }
        }
        
        if (pertenceACategoria) {
            jogo.style.display = 'block';
            jogosEncontrados++;
        } else {
            jogo.style.display = 'none';
        }
    });
    
    console.log('Jogos encontrados:', jogosEncontrados); // Para debug
    
    // Mostra/esconde os títulos das seções baseado nos jogos visíveis
    const secoes = document.querySelectorAll('.section-title');
    secoes.forEach(secao => {
        // Pega a próxima games-grid após o título
        let nextElement = secao.nextElementSibling;
        
        // Procura pela games-grid (pode ter texto ou espaços entre eles)
        while (nextElement && !nextElement.classList.contains('games-grid')) {
            nextElement = nextElement.nextElementSibling;
        }
        
        if (nextElement && nextElement.classList.contains('games-grid')) {
            const gamesGrid = nextElement;
            const jogosNaGrid = gamesGrid.querySelectorAll('.game-card');
            let temJogoVisivel = false;
            
            // Verifica se algum jogo nesta grid está visível
            jogosNaGrid.forEach(jogo => {
                if (jogo.style.display !== 'none') {
                    temJogoVisivel = true;
                }
            });
            
            // Mostra ou esconde o título e a grid
            if (temJogoVisivel || categoria === 'Todos') {
                secao.style.display = 'block';
                gamesGrid.style.display = 'grid';
            } else {
                secao.style.display = 'none';
                gamesGrid.style.display = 'none';
            }
        }
    });
    
    // Se não encontrou nenhum jogo, mostra uma mensagem (opcional)
    if (jogosEncontrados === 0 && categoria !== 'Todos') {
        // Verifica se já existe uma mensagem de "nenhum jogo encontrado"
        let mensagemNaoEncontrado = document.querySelector('.no-games-message');
        
        if (!mensagemNaoEncontrado) {
            mensagemNaoEncontrado = document.createElement('div');
            mensagemNaoEncontrado.className = 'no-games-message';
            mensagemNaoEncontrado.style.textAlign = 'center';
            mensagemNaoEncontrado.style.padding = '40px';
            mensagemNaoEncontrado.style.fontSize = '18px';
            mensagemNaoEncontrado.style.color = '#666';
            mensagemNaoEncontrado.innerHTML = `Nenhum jogo encontrado na categoria "${categoria}"`;
            
            // Adiciona após a última seção
            const gamesSection = document.querySelector('.games-section .container');
            gamesSection.appendChild(mensagemNaoEncontrado);
        }
    } else {
        // Remove a mensagem se existir
        const mensagemNaoEncontrado = document.querySelector('.no-games-message');
        if (mensagemNaoEncontrado) {
            mensagemNaoEncontrado.remove();
        }
    }
}

// Inicializa mostrando todos os jogos
document.addEventListener('DOMContentLoaded', function() {
    // Garante que todos os jogos estão visíveis ao carregar a página
    filtrarJogosPorCategoria('Todos');
});