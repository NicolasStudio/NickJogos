function validar() {
    let senha = document.getElementById('input').value;
    const mensagem = document.querySelector(".boxSenha p");
    const senhaMinuscula = senha.toLowerCase();

    // Sistema de regras organizado
    const regras = [
        {
            condicao: () => senha.length < 5,
            mensagem: "Senha muito curta!"
        },
        {
            condicao: () => !/[A-Z]/.test(senha),
            mensagem: "A senha precisa conter uma letra maiúscula!"
        },
        {
            condicao: () => !/[a-z]/.test(senha),
            mensagem: "A senha precisa conter uma letra minúscula!"
        },
        {
            condicao: () => !/[0-9]/.test(senha),
            mensagem: "A senha precisa conter um número!"
        },
        {
            condicao: () => !/[!@#$%^&*(),.?":{}|<>]/.test(senha),
            mensagem: "A senha precisa conter um caractere especial!"
        },
        {
            condicao: () => {
                const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
                return !meses.some(mes => senhaMinuscula.includes(mes));
            },
            mensagem: "A senha precisa conter o nome de um mês!"
        },
        {
            condicao: () => !/XXX/.test(senha),
            mensagem: "A senha precisa conter a soma de 17 + 13 em algarismos romanos!",
        },
        {
            condicao: () => {
                const anosBissextos = [];
                for (let ano = 1900; ano <= 2024; ano++) {
                    if ((ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0)) {
                        anosBissextos.push(ano.toString());
                    }
                }
                return !anosBissextos.some(ano => senha.includes(ano));
            },
            mensagem: "A senha precisa conter um ano bissexto entre 1900 e 2024!"
        },
        {
            condicao: () => {
                const elementos = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"];
                return !elementos.some(elemento => senha.includes(elemento));
            },
            mensagem: "A senha precisa conter um elemento da tabela periódica!"
        },
        {
            condicao: () => !/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/.test(senha),
            mensagem: "A senha precisa conter uma cor em hexadecimal!"
        },
        {
            condicao: () => {
                const primos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
                const primosEncontrados = primos.filter(primo => {
                    const primoStr = primo.toString();
                    let index = senha.indexOf(primoStr);
                    while (index !== -1) {
                        const antes = index > 0 ? senha[index - 1] : '';
                        const depois = index + primoStr.length < senha.length ? senha[index + primoStr.length] : '';
                        if (!/\d/.test(antes) && !/\d/.test(depois)) return true;
                        index = senha.indexOf(primoStr, index + 1);
                    }
                    return false;
                });
                return primosEncontrados.length === 0;
            },
            mensagem: "Sua senha não tem um número primo entre 1 e 100!"
        },
        {
            condicao: () => {
                const somaNumeros = senha.split('').reduce((soma, char) => {
                    const num = parseInt(char);
                    return !isNaN(num) ? soma + num : soma;
                }, 0);
                return somaNumeros % 2 !== 0;
            },
            mensagem: "A soma de todos os números da sua senha não é um número par!"
        },
        {
            condicao: () => !senha.includes("França"),
            mensagem: "Sua senha não tem o nome de um time que ganhou a copa do mundo em 1998!"
        },
        {
            condicao: () => {
                const formasGeometricas = ["dodecágono", "dodecaedro"];
                return !formasGeometricas.some(forma => senhaMinuscula.includes(forma));
            },
            mensagem: "Sua senha não tem o nome de uma forma geométrica de 12 lados!"
        },
        {
            condicao: () => !senhaMinuscula.includes("arara-azul"),
            mensagem: "Sua senha não tem o nome de um animal cujo o nome científico é Anodorhynchus hyacinthinus!"
        },
        {
            condicao: () => !senha.includes("Verne"),
            mensagem: "Sua senha não tem o sobrenome do autor de 'Viagem ao Centro da Terra'!"
        },
        {
            condicao: () => !senha.includes("Tetris"),
            mensagem: "Sua senha não tem o nome do jogo de puzzle mais vendido do mundo!"
        },
        {
            condicao: () => {
                const alimentosPalindromos = ["ovo", "osso", "ata", "ama"];
                return !alimentosPalindromos.some(alimento => senhaMinuscula.includes(alimento));
            },
            mensagem: "Sua senha não tem o nome de um alimento Palíndromo!"
        },
        {
            condicao: () => !senhaMinuscula.includes("charizard"),
            mensagem: "Sua senha não tem o nome do Pokémon número 6 da Pokédex!"
        },
        {
            condicao: () => (senha.split("@").length - 1) < 2,
            mensagem: 'Sua senha precisa conter 2 caracteres "@"!'
        },
        {
            condicao: () => {
                const input = document.getElementById('input');
                const corInput = input.style.color;
                return !document.querySelector(".esqueciSenha").classList.contains("hidden") && 
                    (corInput === "rgb(255, 255, 255)" || corInput === "#ffffff" || corInput === "");
            },
            mensagem: "Não faça nada!",
            acao: () => aparecerLembrarSenha(),
        },
        {
            // Senha precisa ter ao todo menos que 30 vogais
            condicao: () => {
                const vogais = senha.match(/[aeiouAEIOU]/g);
                return vogais ? vogais.length > 30 : false;
            },
            mensagem: "Sua senha tem mais de 30 vogais!"
        },
    ];

    // Verificar cada regra
    for (let regra of regras) {
        if (regra.condicao()) {
            // Se for a regra do aparecerLembrarSenha, não mostra mensagem de erro
            if (regra.acao === aparecerLembrarSenha) {
                regra.acao(); // Aplica os estilos
                continue; // ← CONTINUA para a próxima regra, não para aqui
            }
            
            // Para todas as outras regras, mostra erro e para
            mensagem.innerHTML = `
                <img src="../Img/ImagensJogoSenha/erro.svg" 
                    alt="Erro" 
                    style="width:20px; vertical-align:middle; margin-right:5px; margin-bottom:3px;">
                ${regra.mensagem}
            `;
            mensagem.style.display = "block";
            mensagem.style.color = "#FF4146";
            
            if (regra.acao) {
                regra.acao();
            }
            
            return; // ← Para a execução para outras regras
        }
    }   

    mensagem.textContent = "Senha perfeita! Você completou todos os requisitos!";
    mensagem.style.color = "lightgreen";
    mensagem.style.display = "block";

    setTimeout(() => {
        const parabens = document.querySelector(".boxParabens");
        if (parabens) {
            document.querySelector(".titulo-glitch").style.display = "none";
            document.querySelector(".container-2").style.display = "none";
            parabens.style.display = "block";
        }
    }, 1500);
}

function aparecerLembrarSenha(){
    const input = document.getElementById('input');
    const mensagem = document.querySelector(".boxSenha p");
    document.querySelector(".esqueciSenha").style.display = "block";
    input.style.color = "transparent"; // ← Só aqui fica transparente
    mensagem.style.color = "transparent"; // ← Só aqui fica transparente
}

function esconderLembrarSenha(){
    const input = document.getElementById('input');
    document.querySelector(".esqueciSenha").style.display = "none";
    mensagem.style.color = "#FF4146"; 
    input.style.color = ""; // ← Volta para cor padrão do CSS
}

function esqueciSenha() {
    const input = document.getElementById('input');
    const mensagem = document.querySelector(".boxSenha p");

    input.value = '';
    document.querySelector(".esqueciSenha").style.display = "none";
    mensagem.style.color = "#FF4146"; 
    mensagem.textContent = "Se você não sabe a SUA senha, eu não vou saber!!!";
    
    setTimeout(() => {
        mensagem.style.display = "none";
    }, 3000);


    input.style.color = ""; // ← Volta para cor padrão do CSS
}