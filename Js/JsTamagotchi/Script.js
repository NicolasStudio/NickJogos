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
        degradacaoFome: 3,      // Sente mais fome
        degradacaoHigiene: 2.5,  // Precisa mais banho
        degradacaoSaude: 0.5,    // Saúde boa, não fica doente fácil
        ganhoFelicidadeBrincar: 40, // Adora brincar
        custoFomeBrincar: 15,    // Gasta mais energia brincando
        custoHigieneBrincar: 8,   // Fica mais sujo brincando
        limiteFomeCritico: 40,    // Fica doente se fome < 40
        limiteHigieneCritico: 40,  // Fica doente se higiene < 40
        recuperacaoMedicamento: 30 // Medicamento é menos eficaz?
    },
    jovem: {
        degradacaoFome: 2,        // Fome moderada
        degradacaoHigiene: 2,      // Higiene moderada
        degradacaoSaude: 1,        // Saúde começa a oscilar
        ganhoFelicidadeBrincar: 35, // Ainda gosta de brincar
        custoFomeBrincar: 12,
        custoHigieneBrincar: 6,
        limiteFomeCritico: 35,
        limiteHigieneCritico: 35,
        recuperacaoMedicamento: 40
    },
    adulto: {
        degradacaoFome: 2,         // Estável
        degradacaoHigiene: 2,       // Estável
        degradacaoSaude: 1.5,       // Precisa mais cuidado
        ganhoFelicidadeBrincar: 20,  // Não brinca tanto
        custoFomeBrincar: 8,
        custoHigieneBrincar: 4,
        limiteFomeCritico: 30,
        limiteHigieneCritico: 30,
        recuperacaoMedicamento: 45
    },
    velho: {
        degradacaoFome: 1,          // Come pouco
        degradacaoHigiene: 3,        // Precisa mais higiene
        degradacaoSaude: 2.5,        // Fica doente fácil
        ganhoFelicidadeBrincar: 10,   // Quase não brinca
        custoFomeBrincar: 5,
        custoHigieneBrincar: 2,
        limiteFomeCritico: 25,        // Mais resistente à fome
        limiteHigieneCritico: 45,      // Muito sensível à sujeira
        recuperacaoMedicamento: 25     // Medicamento é menos eficaz
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
    
    // CORREÇÃO: Converter TUDO para minúsculo
    const faseLower = pet.fase.toLowerCase();
    let estadoLower = pet.estado.toLowerCase();
    
    // Corrigindo possíveis erros de digitação nos nomes dos arquivos
    if (estadoLower === "feiiz") {  // caso tenha esse erro nos arquivos
        estadoLower = "feliz";
    }
    
    // Monta o nome do arquivo TUDO EM MINÚSCULO
    const imagemNome = `${faseLower}${estadoLower}.jpg`;
    
    // Caminho correto (sem "NickJogos/" no início)
    const caminhoCompleto = `Img/ImageTamagotchi/dog/${imagemNome}`;
    
    console.log('Tentando carregar:', caminhoCompleto); // Para debug
    
    petImage.src = caminhoCompleto;
    
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
    const fatores = getFatoresAtuais();
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
    atualizarImagem();
    
    // Sistema de envelhecimento e degradação
    setInterval(() => {
        // Atualiza a fase antes de aplicar degradação
        const faseAntiga = pet.fase;
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
        
        // Envelhece a cada 30 segundos
        pet.idade++;
        
        // Pega os fatores da fase atual
        const fatores = getFatoresAtuais();
        
        // Degrada os status baseado na fase
        pet.fome = Math.max(0, pet.fome - fatores.degradacaoFome);
        pet.higiene = Math.max(0, pet.higiene - fatores.degradacaoHigiene);
        
        // Se estiver com fome ou sujo (baseado nos limites da fase), afeta a saúde
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
        
        atualizarImagem();
    }, 30000); // 30 segundos

    // Atualização rápida dos status visuais a cada segundo
    setInterval(atualizarImagem, 1000);
});

// Tornando as funções globais para os botões
window.alimentar = alimentar;
window.medicar = medicar;
window.banho = banho;
window.brincar = brincar;