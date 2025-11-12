const grid = document.querySelector('.grid');

let primeiraCard = '';
let vida = 5;
let pontos = 0;
let pontosTotais = 0;


const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
};

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.disabled-card');

    if (disabledCards.length === 66 || pontosTotais === 2745 || vida === 0) {
        setTimeout(() => {
            if (vida === 0) {
                alert('Suas vidas acabaram...');
            } else if (pontosTotais === 2745 || disabledCards.length === 66) {
                alert('Parabéns, você venceu!');
            }
            alert('O seu total de pontos é: ' + pontosTotais);

            setTimeout(() => {
                location.reload();
            }, 800); // Aguarda 0.4s antes de recarregar

            
        }, 700);
    }
};

const checkCards = () => {
    const tipo = primeiraCard.getAttribute('data-personagens');

    const pontuacoes = {
        'Submarino': 180,
        'Rebocador': 130,
        'Cruzador': 90,
        'Encouraçado': 70,
        'PortaAviões': 35,
    };

    if (tipo === 'Bomba') {
        // Só subtrai se ainda tiver vida
        if (vida > 0) {
            vida--;
        }
    } else {
        for (const chave in pontuacoes) {
            if (tipo.includes(chave)) {
                pontos += pontuacoes[chave];
                break;
            }
        }
    }

    pontosTotais = pontos;

    // Atualiza o HUD
    document.getElementById("pontos").innerHTML = "Pontos: " + pontosTotais;
    document.getElementById("vida").innerHTML = "Vidas: " + vida;

    checkEndGame();
};

const revealCard = ({ target }) => {
    if (target.parentNode.className.includes('reveal-card') || vida <= 0) return;

    if (primeiraCard === '') {
        target.parentNode.classList.add('reveal-card');
        primeiraCard = target.parentNode;
        checkCards();
        setTimeout(() => { primeiraCard = ''; }, 200);
    }
};

const createCard = (nome) => {
    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');

    front.style.backgroundImage = `url('Img/ImagensBatalha/${nome}.jpg')`;

    card.appendChild(front);
    card.appendChild(back);
    card.setAttribute('data-personagens', nome);
    card.addEventListener('click', revealCard);

    return card;
};

const loadGame = () => {
    const grid = document.querySelector('.grid');
    grid.innerHTML = "";

    const blocos = [];

    // Função auxiliar para adicionar blocos com largura
    const adicionarBlocos = (quantidade, nomes, largura) => {
        for (let i = 0; i < quantidade; i++) {
            blocos.push({ nomes, largura });
        }
    };

    // Adiciona os blocos
    adicionarBlocos(7, ['Agua'], 1);
    adicionarBlocos(17, ['Bomba'], 1);
    adicionarBlocos(5, ['Submarino'], 1);
    adicionarBlocos(3, ['Rebocador(1)', 'Rebocador(2)'], 2);
    adicionarBlocos(2, ['Cruzador(1)', 'Cruzador(2)', 'Cruzador(3)'], 3);
    adicionarBlocos(1, ['Encouraçado(1)', 'Encouraçado(2)', 'Encouraçado(3)', 'Encouraçado(4)'], 4);
    adicionarBlocos(1, ['PortaAviões(1)', 'PortaAviões(2)', 'PortaAviões(3)', 'PortaAviões(4)', 'PortaAviões(5)'], 5);

    const totalColunas = 10;
    let linhaAtual = [];
    let colunasDisponiveis = totalColunas;

    // Embaralhar blocos
    const blocosEmbaralhados = blocos.sort(() => Math.random() - 0.5);

    // Enquanto houver blocos a posicionar
    while (blocosEmbaralhados.length > 0) {
        let index = blocosEmbaralhados.findIndex(bloco => bloco.largura <= colunasDisponiveis);

        if (index === -1) {
            // Nenhum bloco cabe na linha atual, imprime a linha e reinicia
            linhaAtual.forEach(nome => {
                const card = createCard(nome);
                grid.appendChild(card);
            });
            linhaAtual = [];
            colunasDisponiveis = totalColunas;
            continue;
        }

        const bloco = blocosEmbaralhados.splice(index, 1)[0];
        linhaAtual.push(...bloco.nomes);
        colunasDisponiveis -= bloco.largura;
    }

    // Adiciona a última linha restante
    linhaAtual.forEach(nome => {
        const card = createCard(nome);
        grid.appendChild(card);
    });
};

loadGame();