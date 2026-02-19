// Estado do pet
let pet = {
    idade: 1,
    fome: 100,
    higiene: 100,
    saude: 100,
    felicidade: 100,
    fase: 'filhote',
    estado: 'Feliz'
};

// Fatores de degradação por fase
const fatoresFase = {
    filhote: {
        degradacaoFome: 3,
        degradacaoHigiene: 2.5,
        degradacaoSaude: 0.5,
        ganhoFelicidadeBrincar: 40,
        custoFomeBrincar: 15,
        custoHigieneBrincar: 8,
        limiteFomeCritico: 40,
        limiteHigieneCritico: 40,
        recuperacaoMedicamento: 30
    },
    jovem: {
        degradacaoFome: 2,
        degradacaoHigiene: 2,
        degradacaoSaude: 1,
        ganhoFelicidadeBrincar: 35,
        custoFomeBrincar: 12,
        custoHigieneBrincar: 6,
        limiteFomeCritico: 35,
        limiteHigieneCritico: 35,
        recuperacaoMedicamento: 40
    },
    adulto: {
        degradacaoFome: 2,
        degradacaoHigiene: 2,
        degradacaoSaude: 1.5,
        ganhoFelicidadeBrincar: 20,
        custoFomeBrincar: 8,
        custoHigieneBrincar: 4,
        limiteFomeCritico: 30,
        limiteHigieneCritico: 30,
        recuperacaoMedicamento: 45
    },
    velho: {
        degradacaoFome: 1,
        degradacaoHigiene: 3,
        degradacaoSaude: 2.5,
        ganhoFelicidadeBrincar: 10,
        custoFomeBrincar: 5,
        custoHigieneBrincar: 2,
        limiteFomeCritico: 25,
        limiteHigieneCritico: 45,
        recuperacaoMedicamento: 25
    }
};

// Função para determinar a fase baseada na idade
function determinarFase() {
    if (pet.idade <= 8) return 'filhote';
    else if (pet.idade <= 18) return 'jovem';
    else if (pet.idade <= 69) return 'adulto';
    else return 'velho';
}

// Função para obter os fatores da fase atual
function getFatoresAtuais() {
    return fatoresFase[pet.fase];
}

// Função para determinar o estado do pet
function determinarEstado() {
    const fatores = getFatoresAtuais();
    
    if (pet.saude < 50) return 'Doente';
    else if (pet.fome < fatores.limiteFomeCritico) return 'Fome';
    else if (pet.higiene < fatores.limiteHigieneCritico) return 'Sujo';
    else return 'Feliz';
}

// Função para atualizar a imagem
function atualizarImagem() {
    // Verifica se todos os elementos existem
    const petImage = document.getElementById('petImage');
    const fomeBar = document.getElementById('fomeBar');
    const higieneBar = document.getElementById('higieneBar');
    const saudeBar = document.getElementById('saudeBar');
    const felicidadeBar = document.getElementById('felicidadeBar');
    const idadeValor = document.getElementById('idadeValor');
    const faseAtual = document.getElementById('faseAtual');

    if (!petImage || !fomeBar || !higieneBar || !saudeBar || !felicidadeBar || !idadeValor || !faseAtual) {
        console.error('Elementos não encontrados');
        return;
    }

    pet.fase = determinarFase();
    pet.estado = determinarEstado();
    
    // Tudo para minúsculo
    const faseLower = pet.fase.toLowerCase();
    let estadoLower = pet.estado.toLowerCase();
    
    // Corrigindo possíveis erros de digitação
    if (estadoLower === "feiiz") {
        estadoLower = "feliz";
    }
    
    // Monta o nome do arquivo
    const imagemNome = `${faseLower}${estadoLower}.jpg`;
    const caminhoCompleto = `Img/ImageTamagotchi/dog/${imagemNome}`;
    
    // Só atualiza se for diferente da imagem atual (evita loops desnecessários)
    if (!petImage.src.endsWith(imagemNome)) {
        console.log('Mudando imagem para:', caminhoCompleto);
        petImage.src = caminhoCompleto;
    }
    
    // Atualiza as barras de status
    fomeBar.style.width = pet.fome + '%';
    higieneBar.style.width = pet.higiene + '%';
    saudeBar.style.width = pet.saude + '%';
    felicidadeBar.style.width = pet.felicidade + '%';
    
    // Atualiza o mostrador de idade
    idadeValor.textContent = pet.idade;
    
    let faseDisplay = {
        'filhote': 'Filhote',
        'jovem': 'Jovem',
        'adulto': 'Adulto',
        'velho': 'Velho'
    };
    faseAtual.textContent = faseDisplay[pet.fase];
}

// Funções de ação
function alimentar() {
    pet.fome = Math.min(100, pet.fome + 30);
    pet.saude = Math.min(100, pet.saude + 5);
    pet.felicidade = Math.min(100, pet.felicidade + 5);
    atualizarImagem();
}

function medicar() {
    const fatores = getFatoresAtuais();
    pet.saude = Math.min(100, pet.saude + fatores.recuperacaoMedicamento);
    pet.felicidade = Math.max(0, pet.felicidade - 5);
    atualizarImagem();
}

function banho() {
    pet.higiene = Math.min(100, pet.higiene + 50);
    pet.felicidade = Math.min(100, pet.felicidade + 10);
    atualizarImagem();
}

function brincar() {
    const fatores = getFatoresAtuais();
    pet.felicidade = Math.min(100, pet.felicidade + fatores.ganhoFelicidadeBrincar);
    pet.fome = Math.max(0, pet.fome - fatores.custoFomeBrincar);
    pet.higiene = Math.max(0, pet.higiene - fatores.custoHigieneBrincar);
    atualizarImagem();
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Atualiza uma vez no início
    atualizarImagem();
    
    // Sistema de envelhecimento e degradação - ÚNICO INTERVALO
    setInterval(() => {
        // Atualiza a fase antes de aplicar degradação
        const faseAntiga = pet.fase;
        
        // Envelhece
        pet.idade++;
        
        // Atualiza a fase
        pet.fase = determinarFase();
        
        // Se mudou de fase, avisa o jogador
        if (faseAntiga !== pet.fase) {
            const fases = {
                'filhote': 'Filhote',
                'jovem': 'Jovem',
                'adulto': 'Adulto',
                'velho': 'Velho'
            };
            alert(`🎉 Parabéns! Seu pet cresceu e agora é ${fases[pet.fase]}!`);
        }
        
        // Pega os fatores da fase atual
        const fatores = getFatoresAtuais();
        
        // Degrada os status baseado na fase
        pet.fome = Math.max(0, pet.fome - fatores.degradacaoFome);
        pet.higiene = Math.max(0, pet.higiene - fatores.degradacaoHigiene);
        
        // Se estiver com fome ou sujo, afeta a saúde mais rapidamente
        if (pet.fome < fatores.limiteFomeCritico || pet.higiene < fatores.limiteHigieneCritico) {
            pet.saude = Math.max(0, pet.saude - fatores.degradacaoSaude * 2);
        } else {
            // Degradação normal da saúde
            pet.saude = Math.max(0, pet.saude - fatores.degradacaoSaude);
        }
        
        // Se estiver doente, afeta a felicidade
        if (pet.saude < 50) {
            pet.felicidade = Math.max(0, pet.felicidade - 2);
        }
        
        // Se estiver muito feliz, recupera um pouco de saúde
        if (pet.felicidade > 80) {
            pet.saude = Math.min(100, pet.saude + 1);
        }
        
        // Atualiza a tela
        atualizarImagem();
    }, 3000); // ← Mudei para 3 segundos para testes (depois volte para 30000)
    
    // REMOVIDO: setInterval(atualizarImagem, 1000); <-- ISSO CAUSAVA O PROBLEMA!
});

// Tornando as funções globais para os botões
window.alimentar = alimentar;
window.medicar = medicar;
window.banho = banho;
window.brincar = brincar;