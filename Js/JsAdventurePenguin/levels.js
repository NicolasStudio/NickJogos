// =====================================================================
// Adventure Penguin - fases
// Cada fase e montada juntando "trechos" lado a lado. Cada trecho e uma
// lista de linhas (de cima para baixo) alinhadas pelo chao: o trecho pode
// ter menos linhas que a fase, as que faltam no topo ficam vazias.
//
// Legenda:
//   G chao com neve      B tijolo           $ presente com moeda
//   F presente c/ peixe dourado (poder)   V presente c/ peixe verde (+1 vida)
//                        I bloco de gelo    = plataforma de gelo (atravessa por baixo)
//   ^ estalagmite        ~ agua             o moeda
//   e bola de neve       u ourico (nao pode pisar)
//   r rena (so morre por tras; pela frente investe; em cima machuca)
//   p pinha explosiva (pise para desarmar; chegar perto ou encostar faz explodir)
//   n bola de neve gigante (3 pisoes ou escorregoes; escorregao que nao derruba empurra de volta)
//   y urso polar (2 pisoes; patada de perto; escorregar nele empurra de volta)
//   f foca (mesma mecanica do urso)
//   w plataforma de madeira (atravessa por baixo; na altura do chao, sobre a agua, vira ponte)
//   D piso da ponte (tabua com neve; embaixo nao ha nada)    X caixote (bloco solido)
//   c nuvem (pisa em cima e atravessa por baixo)            a coruja (voa e mergulha; pular nela derruba)
//   b boi-almiscarado (como a rena)                         m rato das neves (como o urso)
//   k castor (como o urso, mas 3 de vida)                   _ chao invisivel (a estrada desenhada no fundo)
//   K ponto de controle (recomeca aqui depois de tocar)
//   P inicio do pinguim  > placa            | bandeira (fim da fase)
// =====================================================================
const LEVEL_ROWS = 17;

function joinSegments(...segments) {
    const rows = Array.from({ length: LEVEL_ROWS }, () => '');
    for (const seg of segments) {
        const width = Math.max(...seg.map(r => r.length));
        const pad = LEVEL_ROWS - seg.length;
        for (let y = 0; y < LEVEL_ROWS; y++) {
            const line = y < pad ? '' : seg[y - pad];
            rows[y] += line.padEnd(width, ' ');
        }
    }
    return rows;
}

const GROUND = 'GGGGGGGGGGGGGGGGGGGGGGGG';
const ground = w => [GROUND.slice(0, w), GROUND.slice(0, w), GROUND.slice(0, w)];

const LEVELS = [
    {
        name: '1-1',
        time: 400,
        // fase de aprendizado: cada novidade aparece primeiro sozinha e em lugar seguro
        map: joinSegments(
            // 1. comeco tranquilo: placa, presentes e moedas, sem inimigos
            [
                '      $   B$B$B     ',
                '                    ',
                '                    ',
                ' P  >     ooo       ',
                ...ground(20),
            ],
            // 2. primeira bola de neve, sozinha no plano (aprender a pisar)
            [
                '      ooo           ',
                '                    ',
                '                    ',
                '          e         ',
                ...ground(20),
            ],
            // 3. pilares baixos
            [
                '          o         ',
                '    o     I         ',
                '    I     I     e   ',
                ...ground(20),
            ],
            // 4. primeiro buraco (2 blocos)
            [
                '       ooo          ',
                '                    ',
                '                    ',
                'GGGGGGG  GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
            ],
            // 5. peixe dourado (poder) logo cedo
            [
                '     B$BFB          ',
                '                    ',
                '                    ',
                '               e    ',
                ...ground(20),
            ],
            [
                '   ooo       ooo    ',
                '                    ',
                '                    ',
                '    e           e   ',
                ...ground(20),
            ],
            // 6. escadinha
            [
                '           o        ',
                '           I        ',
                '          III       ',
                '         IIIII      ',
                ...ground(20),
            ],
            // 7. buraco de 3 blocos
            [
                '                    ',
                '       ooo          ',
                '                    ',
                '                    ',
                'GGGGGG   GGGGGGGGGGG',
                'GGGGGG~~~GGGGGGGGGGG',
                'GGGGGG~~~GGGGGGGGGGG',
            ],
            // 8. plataforma baixa com moedas
            [
                '      oooo          ',
                '                    ',
                '     ======         ',
                '                    ',
                '               e    ',
                ...ground(20),
            ],
            // 9. ponto de controle
            [
                '                    ',
                '                    ',
                '                    ',
                '         K          ',
                ...ground(20),
            ],
            // 10. primeiro ourico, sozinho (aprender o escorregao, ou pular por cima)
            [
                '     ooo            ',
                '                    ',
                '                    ',
                '            u       ',
                ...ground(20),
            ],
            // 11. tunel opcional: escorregando por baixo ou pulando por cima
            [
                '   oooooooooo       ',
                '  BBBBBBBBBBBB      ',
                '                    ',
                ...ground(20),
            ],
            [
                '                    ',
                '        ooo         ',
                '                    ',
                '                    ',
                'GGGGGGG   GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
            ],
            [
                '    B$B             ',
                '                    ',
                '                    ',
                '   e        e       ',
                ...ground(20),
            ],
            // 12. espinhos (so 2)
            [
                '        oooo        ',
                '                    ',
                '         ^^         ',
                ...ground(20),
            ],
            // 13. peixe verde (+1 vida)
            [
                '      B$BVB         ',
                '                    ',
                '                    ',
                '                e   ',
                ...ground(20),
            ],
            // 14. colina suave
            [
                '          ooo       ',
                '                    ',
                '        GGGGGG      ',
                '      GGGGGGGGGG    ',
                '    GGGGGGGGGGGGGG  ',
                ...ground(20),
            ],
            // 15. buraco de 4 blocos com plataforma de apoio
            [
                '        ooo         ',
                '       ====         ',
                '                    ',
                '                    ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            [
                '   ooo     ooo      ',
                '                    ',
                '                    ',
                '     u         e    ',
                ...ground(20),
            ],
            [
                '    B$B$B           ',
                '                    ',
                '                    ',
                '                    ',
                ...ground(20),
            ],
            [
                '  oo  oo  oo  oo    ',
                '                    ',
                '                    ',
                '       e            ',
                ...ground(20),
            ],
            [
                '      ooo           ',
                '                    ',
                '                    ',
                '     oooo           ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        name: '1-2',
        time: 350,
        cenario: 'lago',
        // um pouco mais dificil que a 1-1: buracos com agua de ate 5 blocos, ilha, mais inimigos
        map: joinSegments(
            // 1. comeco: presentes e uma bola de neve
            [
                '                    ',
                '   B$$B      $      ',
                '                    ',
                ' P  >  ooo   e      ',
                ...ground(20),
            ],
            // 2. buraco de 3 com moedas
            [
                '                    ',
                '       ooo          ',
                '                    ',
                '                    ',
                '               e    ',
                'GGGGGGG   GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
            ],
            // 3. peixe dourado e dupla de bolas
            [
                '            F       ',
                '     BB$BB          ',
                '        ooooo       ',
                '         e   e      ',
                ...ground(20),
            ],
            // 4. buraco de 5 com plataforma no meio
            [
                '      ooo           ',
                '     ====           ',
                '                    ',
                '                    ',
                'GGGGG     GGGGGGGGGG',
                'GGGGG~~~~~GGGGGGGGGG',
                'GGGGG~~~~~GGGGGGGGGG',
            ],
            // 5. bolas presas entre pilares
            [
                '    oo      oo      ',
                '    II      II      ',
                '    II  e e II      ',
                ...ground(20),
            ],
            // 6. ilha no meio do lago
            [
                '   oo     oo        ',
                '                    ',
                '                    ',
                '                    ',
                '      ooo       e   ',
                'GGG   GGG   GGGGGGGG',
                'GGG~~~GGG~~~GGGGGGGG',
                'GGG~~~GGG~~~GGGGGGGG',
            ],
            // 7. ourico sozinho
            [
                '  BBB$              ',
                '                    ',
                '                    ',
                '        u           ',
                ...ground(20),
            ],
            // 8. lago largo com duas plataformas
            [
                '   ooo  ooo         ',
                '   ===  ===         ',
                '                    ',
                '                    ',
                'GG          GGGGGGGG',
                'GG~~~~~~~~~~GGGGGGGG',
                'GG~~~~~~~~~~GGGGGGGG',
            ],
            // 9. ponto de controle
            [
                '                    ',
                '                    ',
                '      oooooo        ',
                '    K        e      ',
                ...ground(20),
            ],
            // 10. espinhos e bola de neve
            [
                '       ooo          ',
                '                    ',
                '                    ',
                '      ^^^      e    ',
                ...ground(20),
            ],
            // 11. tunel com bola de neve dentro (escorregar ou passar por cima)
            [
                '   oooooooooo       ',
                '  BBBBBBBBBBBB      ',
                '       e            ',
                ...ground(20),
            ],
            // 12. peixe verde (+1 vida), bola e ourico
            [
                '          V         ',
                '      B$B           ',
                '       ooo          ',
                '   e        u       ',
                ...ground(20),
            ],
            // 13. pulo entre duas escadinhas
            [
                '       oo           ',
                '      o  o          ',
                '                    ',
                '                    ',
                '                    ',
                '     I    I         ',
                '    II    II        ',
                '   III    III       ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // 14. ourico com bolas de neve
            [
                '   ooo     ooo      ',
                '                    ',
                '                    ',
                '    u    e  e       ',
                ...ground(20),
            ],
            // 15. plataforma alta com moedas
            [
                '     oooo           ',
                '    ======          ',
                '                    ',
                '                    ',
                '           e        ',
                ...ground(20),
            ],
            // 16. buraco de 4
            [
                '                    ',
                '      oo            ',
                '                    ',
                '                    ',
                '               e    ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // 17. respiro antes do fim
            [
                '         $BB        ',
                '   B$B              ',
                '                    ',
                '          ooo       ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '  e IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        name: '1-3',
        time: 350,
        cenario: 'castelo',
        // chegada ao castelo: a rena vira inimigo padrao (so morre por tras)
        map: joinSegments(
            // 1. comeco: presentes e moedas
            [
                '         $          ',
                '     $       $      ',
                '                    ',
                ' P  >      ooo      ',
                ...ground(20),
            ],
            // 2. primeira rena: suba na plataforma, deixe ela passar por baixo e desca atras dela
            [
                '        ooo         ',
                '       =====        ',
                '                    ',
                '                r   ',
                ...ground(20),
            ],
            // 3. buraco de 3 e bola de neve
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '                    ',
                '               e    ',
                'GGGGGGG   GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
                'GGGGGGG~~~GGGGGGGGGG',
            ],
            // 4. peixe dourado e dupla de bolas
            [
                '    B$B             ',
                '         F          ',
                '                    ',
                '         e   e      ',
                ...ground(20),
            ],
            // 5. rena presa entre pilares (de cima ela nao enxerga)
            [
                '    o          o    ',
                '   II         II    ',
                '   II     r   II    ',
                ...ground(20),
            ],
            // 6. ilha no meio do lago
            [
                '   oo     oo        ',
                '                    ',
                '                    ',
                '                    ',
                '      ooo       e   ',
                'GGG   GGG   GGGGGGGG',
                'GGG~~~GGG~~~GGGGGGGG',
                'GGG~~~GGG~~~GGGGGGGG',
            ],
            // 7. ourico e bola de neve
            [
                '   ooo              ',
                '                    ',
                '                    ',
                '   e      u         ',
                ...ground(20),
            ],
            // 8. lago largo com tres plataformas
            [
                '  ooo  ooo  ooo     ',
                '  ===  ===  ===     ',
                '                    ',
                '                    ',
                'G              GGGGG',
                'G~~~~~~~~~~~~~~GGGGG',
                'G~~~~~~~~~~~~~~GGGGG',
            ],
            // 9. ponto de controle
            [
                '                    ',
                '                    ',
                '        ooo         ',
                '    K               ',
                ...ground(20),
            ],
            // 10. espinhos e bola de neve
            [
                '       oooo         ',
                '                    ',
                '                    ',
                '      ^^^^     e    ',
                ...ground(20),
            ],
            // 11. duas renas embaixo de uma plataforma comprida
            [
                '   oooooooooooo     ',
                '  ==============    ',
                '                    ',
                '      r      r      ',
                ...ground(20),
            ],
            // 12. peixe verde (+1 vida) e bola de neve
            [
                '   V      B$B       ',
                '                    ',
                '                    ',
                '   e                ',
                ...ground(20),
            ],
            // 13. pulo entre duas escadinhas
            [
                '       oo           ',
                '      o  o          ',
                '                    ',
                '                    ',
                '                    ',
                '     I    I         ',
                '    II    II        ',
                '   III    III       ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // 14. tunel com duas bolas de neve (escorregar ou passar por cima)
            [
                '   oooooooooo       ',
                '  BBBBBBBBBBBB      ',
                '     e    e         ',
                ...ground(20),
            ],
            // 15. ourico na frente de uma rena
            [
                '    ooo     ooo     ',
                '                    ',
                '                    ',
                '  u         r       ',
                ...ground(20),
            ],
            // 16. buraco largo com duas plataformas
            [
                '     oo  oo         ',
                '    ===  ===        ',
                '                    ',
                '                    ',
                'GGG        GGGGGGGGG',
                'GGG~~~~~~~~GGGGGGGGG',
                'GGG~~~~~~~~GGGGGGGGG',
            ],
            // 17. ultima rena antes da escadaria
            [
                '      $BBB          ',
                '  $                 ',
                '                    ',
                '               r    ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        name: '1-4',
        time: 400,
        cenario: 'portao',
        // portao do castelo: a fase mais dificil, mistura todos os inimigos
        map: joinSegments(
            // 1. comeco: presentes e moedas
            [
                '            $       ',
                '  $    B$B          ',
                '                    ',
                ' P  >      ooo      ',
                ...ground(20),
            ],
            // 2. bola de neve e rena (plataforma para passar por cima)
            [
                '        ooo         ',
                '       =====        ',
                '                    ',
                '   e            r   ',
                ...ground(20),
            ],
            // 3. buraco de 4 com plataforma
            [
                '      oo            ',
                '     ====           ',
                '                    ',
                '                    ',
                '               e    ',
                'GGGGG    GGGGGGGGGGG',
                'GGGGG~~~~GGGGGGGGGGG',
                'GGGGG~~~~GGGGGGGGGGG',
            ],
            // 4. peixe dourado, ourico e bolas de neve
            [
                '  BFB    B$B        ',
                '                    ',
                '                    ',
                '   u      e   e     ',
                ...ground(20),
            ],
            // 5. rena entre pilares altos
            [
                '    o          o    ',
                '   II         II    ',
                '   II         II    ',
                '   II    r    II    ',
                ...ground(20),
            ],
            // 6. duas ilhas, uma com bola de neve
            [
                '  oo    oo    oo    ',
                '                    ',
                '                    ',
                '                    ',
                '     ooo   e        ',
                'GG   GGG   GGG   GGG',
                'GG~~~GGG~~~GGG~~~GGG',
                'GG~~~GGG~~~GGG~~~GGG',
            ],
            // 7. espinhos e rena logo depois
            [
                '  oooo              ',
                '                    ',
                '                    ',
                '  ^^^^       r      ',
                ...ground(20),
            ],
            // 8. lago largo: tres plataformas, bola de neve na do meio
            [
                '  ooo  ooo  ooo     ',
                '        e           ',
                '  ===  ===  ===     ',
                '                    ',
                '                    ',
                'G              GGGGG',
                'G~~~~~~~~~~~~~~GGGGG',
                'G~~~~~~~~~~~~~~GGGGG',
            ],
            // 9. ponto de controle
            [
                '                    ',
                '                    ',
                '        ooo         ',
                '    K               ',
                ...ground(20),
            ],
            // 10. tunel com ourico (escorregue de frente para ele)
            [
                '   oooooooooo       ',
                '  BBBBBBBBBBBB      ',
                '        u           ',
                ...ground(20),
            ],
            // 11. duas renas embaixo, bola de neve em cima da plataforma
            [
                '   oooooooooooo     ',
                '        e           ',
                '  ==============    ',
                '                    ',
                '     r      r       ',
                ...ground(20),
            ],
            // 12. peixe verde (+1 vida) e buraco de 3
            [
                '  B$B     BVB       ',
                '                    ',
                '                    ',
                '                    ',
                'GGGGGGGGGGGG   GGGGG',
                'GGGGGGGGGGGG~~~GGGGG',
                'GGGGGGGGGGGG~~~GGGGG',
            ],
            // 13. pulo entre escadinhas, bola de neve na chegada
            [
                '       oo           ',
                '      o  o          ',
                '                    ',
                '                    ',
                '                    ',
                '     I    I         ',
                '    II    II        ',
                '   III    III   e   ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // 14. duas renas separadas por um pilar
            [
                '       oo           ',
                '      II            ',
                '  r   II      r     ',
                ...ground(20),
            ],
            // 15. buraco largo com duas plataformas
            [
                '     oo  oo         ',
                '    ===  ===        ',
                '                    ',
                '                    ',
                '               e    ',
                'GGG        GGGGGGGGG',
                'GGG~~~~~~~~GGGGGGGGG',
                'GGG~~~~~~~~GGGGGGGGG',
            ],
            // 16. ouricos e espinhos
            [
                '   ooo    ooo       ',
                '                    ',
                '                    ',
                '  u   ^^   u        ',
                ...ground(20),
            ],
            // 17. duas renas guardando a escadaria
            [
                '   $ BBB $          ',
                '                    ',
                '                    ',
                '         r     r    ',
                ...ground(20),
            ],
            // escadaria final e bandeira, na porta do castelo
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // sala do trono: luta com o Rei do Gelo (arena de uma tela; o chao e o piso da imagem)
        name: 'REI',
        boss: 'king',
        time: 999,
        cenario: 'arena',
        map: [
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '    P                         ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // Mundo 2 (depois de banido pelo rei): planicie nevada, sem buracos
        name: '2-1',
        time: 400,
        cenario: 'planicie',
        map: joinSegments(
            // 1. comeco: presentes baixos e moedas
            [
                '                    ',
                '    o   o   o       ',
                '   B$B    $         ',
                '                    ',
                ' P  >      oo       ',
                ...ground(20),
            ],
            // 2. primeira bola de neve, plataforma com moedas
            [
                '       oo           ',
                '                    ',
                '      =====         ',
                '                    ',
                '   oo         e     ',
                ...ground(20),
            ],
            // 3. colina de gelo
            [
                '         o          ',
                '        III         ',
                '       IIIII        ',
                '      IIIIIII       ',
                '  oo IIIIIIIII  e   ',
                ...ground(20),
            ],
            // 4. peixe dourado e ourico
            [
                '     B$F$B          ',
                '                    ',
                '                    ',
                '  o  o  o  o        ',
                '             u      ',
                ...ground(20),
            ],
            // 5. primeira bola gigante (3 pisoes ou 3 escorregoes)
            [
                '                    ',
                '  oo         oo     ',
                '                    ',
                '      ===           ',
                '               n    ',
                ...ground(20),
            ],
            // 6. escadinha de tijolos
            [
                '           $        ',
                '        B$B         ',
                '     BBB            ',
                '                    ',
                '   oo       oo      ',
                ...ground(20),
            ],
            // 7. tres bolas de neve
            [
                '   o   o   o        ',
                '                    ',
                '                    ',
                '                    ',
                '     e     e     e  ',
                ...ground(20),
            ],
            // 8. plataformas em degrau
            [
                '             oo     ',
                '            ====    ',
                '       ooo          ',
                '      ====          ',
                ' o         e        ',
                ...ground(20),
            ],
            // 9. ponto de controle
            [
                '                    ',
                '   o o o            ',
                '                    ',
                '                    ',
                '    K         u     ',
                ...ground(20),
            ],
            // 10. pilares de gelo
            [
                '                    ',
                '    o     o     o   ',
                '    I     I     I   ',
                '    I     I     I   ',
                '    I  e  I  e  I   ',
                ...ground(20),
            ],
            // 11. peixe verde (+1 vida) e bola gigante
            [
                '      B$BV          ',
                '                    ',
                '   oo     oo        ',
                '                    ',
                '                n   ',
                ...ground(20),
            ],
            // 12. tunel de tijolos com bolas de neve (escorregar ou passar por cima)
            [
                '     oooo           ',
                '  BBBBBBBBBBBB      ',
                '     e    e         ',
                ...ground(20),
            ],
            // 13. bola gigante embaixo de uma plataforma
            [
                '                    ',
                '       ooo          ',
                '      =======       ',
                '                    ',
                '  oo            n   ',
                ...ground(20),
            ],
            // 14. presentes em zigue-zague
            [
                '  $     $     oo    ',
                '                    ',
                '      $     $       ',
                '                    ',
                '   e        e   o   ',
                ...ground(20),
            ],
            // 15. colina suave com ourico
            [
                '           oo       ',
                '                    ',
                '         GGGGG      ',
                '       GGGGGGGGG    ',
                '  u  GGGGGGGGGGGGG  ',
                ...ground(20),
            ],
            // 16. duas bolas gigantes separadas por um pilar
            [
                '  oo    o     oo    ',
                '       III          ',
                '       III          ',
                '  n    III     n    ',
                ...ground(20),
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '   $ B$B $          ',
                '                    ',
                '                    ',
                '  o o o o           ',
                '            e       ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // Mundo 2: montanhas com neblina e pinheiros (rena, ourico e bola gigante)
        name: '2-2',
        time: 400,
        cenario: 'pinheiros',
        map: joinSegments(
            // 1. comeco
            [
                '                    ',
                '  o  o  o  o        ',
                '        $B$         ',
                '                    ',
                ' P  >   oo          ',
                ...ground(20),
            ],
            // 2. primeira rena: suba na plataforma e desca atras dela
            [
                '                    ',
                '       ooo          ',
                '      =====         ',
                '                    ',
                '   oo          r    ',
                ...ground(20),
            ],
            // 3. buraco pequeno (2) e ourico
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '                    ',
                '              u     ',
                'GGGGGGG  GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
            ],
            // 4. peixe dourado entre tijolos soltos
            [
                '   B   F   B        ',
                '                    ',
                '   o  o  o          ',
                '                    ',
                '            u       ',
                ...ground(20),
            ],
            // 5. bola gigante entre pilares (pise nela de cima do pilar)
            [
                '    o         o     ',
                '   II        II     ',
                '   II   n    II     ',
                ...ground(20),
            ],
            // 6. buraco de 3 com plataforma e rena depois
            [
                '                    ',
                '     oo             ',
                '    ====            ',
                '                    ',
                '               r    ',
                'GGGGG   GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
            ],
            // 7. duas renas separadas por um bloco alto
            [
                '  oo       oo       ',
                '       o            ',
                '      III           ',
                '      III           ',
                '  r   III     r     ',
                ...ground(20),
            ],
            // 8. peixe verde (+1 vida) entre presentes
            [
                '      $V$           ',
                '                    ',
                '  ooo     ooo       ',
                '                    ',
                '              u     ',
                ...ground(20),
            ],
            // 9. ponto de controle
            [
                '                    ',
                '   o o o o          ',
                '                    ',
                '                    ',
                '    K               ',
                ...ground(20),
            ],
            // 10. tunel com ourico (escorregue de frente para ele)
            [
                '    oooooo          ',
                '  BBBBBBBBBBBB      ',
                '        u           ',
                ...ground(20),
            ],
            // 11. bola gigante embaixo de uma plataforma
            [
                '                    ',
                '       ooo          ',
                '     =======        ',
                '                    ',
                '  oo            n   ',
                ...ground(20),
            ],
            // 12. buraco pequeno (2) e rena
            [
                '                    ',
                '       ooo          ',
                '                    ',
                '                    ',
                '              r     ',
                'GGGGGGGGG  GGGGGGGGG',
                'GGGGGGGGG~~GGGGGGGGG',
                'GGGGGGGGG~~GGGGGGGGG',
            ],
            // 13. colina de gelo e ourico
            [
                '          o         ',
                '         III        ',
                '        IIIII       ',
                '   oo  IIIIIII      ',
                '      IIIIIIIII   u ',
                ...ground(20),
            ],
            // 14. plataformas em degrau e bola gigante
            [
                '            oo      ',
                '           ===      ',
                '      oo            ',
                '     ===            ',
                '  o        n        ',
                ...ground(20),
            ],
            // 15. presentes em alturas diferentes e rena
            [
                '  $   $     oo      ',
                '                    ',
                '      B$B           ',
                '                    ',
                '    r      oo       ',
                ...ground(20),
            ],
            // 16. ourico e bola gigante
            [
                '   oo      oo       ',
                '                    ',
                '                    ',
                '                    ',
                '   u       n        ',
                ...ground(20),
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '    $BB$            ',
                '                    ',
                '                    ',
                '  o o o o o         ',
                '             r      ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // Mundo 2: pinhal (bola de neve, rena e a estreia da pinha explosiva)
        name: '2-3',
        time: 400,
        cenario: 'pinhal',
        map: joinSegments(
            // 1. comeco
            [
                '                    ',
                '   o  o  o          ',
                '  $  B$B            ',
                '                    ',
                ' P  >     oo        ',
                ...ground(20),
            ],
            // 2. primeira pinha explosiva, sozinha (pise nela antes que exploda)
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '                    ',
                '   oo         p     ',
                ...ground(20),
            ],
            // 3. duas bolas de neve embaixo de uma plataforma
            [
                '        ooo         ',
                '       ======       ',
                '                    ',
                '                    ',
                '  e        e        ',
                ...ground(20),
            ],
            // 4. peixe dourado; pinha entre duas bolas (a explosao leva as bolas junto)
            [
                '    $F$             ',
                '                    ',
                '  o o o o           ',
                '                    ',
                '         e p e      ',
                ...ground(20),
            ],
            // 5. buraco pequeno (2) e rena depois
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '                    ',
                '               r    ',
                'GGGGGGG  GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
            ],
            // 6. rena embaixo de duas plataformas
            [
                '                    ',
                '    oo    oo        ',
                '   ===    ===       ',
                '                    ',
                '  o        r        ',
                ...ground(20),
            ],
            // 7. pinhas em cima dos pilares
            [
                '    p       p       ',
                '   III     III      ',
                '   III  o  III      ',
                '   III ooo III      ',
                ...ground(20),
            ],
            // 8. peixe verde (+1 vida)
            [
                '   V     $          ',
                '                    ',
                '  ooo  ooo          ',
                '                    ',
                '            e       ',
                ...ground(20),
            ],
            // 9. ponto de controle
            [
                '                    ',
                '  o o o o           ',
                '                    ',
                '                    ',
                '    K        p      ',
                ...ground(20),
            ],
            // 10. tunel com bolas de neve (escorregar ou passar por cima)
            [
                '       oo   oo      ',
                '  BBBBBBBBBBBB      ',
                '     e    e         ',
                ...ground(20),
            ],
            // 11. buraco de 3 com plataforma
            [
                '                    ',
                '     oo             ',
                '    ====            ',
                '                    ',
                '            oo      ',
                'GGGGG   GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
            ],
            // 12. pinha e rena
            [
                '                    ',
                '   oo      oo       ',
                '                    ',
                '                    ',
                '   p          r     ',
                ...ground(20),
            ],
            // 13. colina de gelo com pinha no topo
            [
                '   o      p    o    ',
                '         III        ',
                '        IIIII       ',
                '   oo  IIIIIII      ',
                '      IIIIIIIII   e ',
                ...ground(20),
            ],
            // 14. tres bolas de neve e presentes
            [
                '  $   B   $         ',
                '                    ',
                '                    ',
                '  o  o  o  o        ',
                '    e   e   e       ',
                ...ground(20),
            ],
            // 15. tres pinhas juntas (explodem em cadeia)
            [
                '                    ',
                '  oo     oo         ',
                '                    ',
                '                    ',
                '     p  p  p        ',
                ...ground(20),
            ],
            // 16. duas renas embaixo de uma plataforma comprida
            [
                '    oooo            ',
                '  ============      ',
                '                    ',
                '     r     r        ',
                ...ground(20),
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '   B$ $B            ',
                '                    ',
                '                    ',
                '  o o o o           ',
                '            p       ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // Mundo 2: clareira entre pinheiros (bola gigante, pinha explosiva e urso polar)
        name: '2-4',
        time: 400,
        cenario: 'clareira',
        map: joinSegments(
            // 1. comeco
            [
                '                    ',
                '  o o o o           ',
                '     $ B$           ',
                '                    ',
                ' P  >    oo         ',
                ...ground(20),
            ],
            // 2. primeiro urso: pise nele duas vezes (da plataforma fica facil)
            [
                '                    ',
                '       ooo          ',
                '      =====         ',
                '                    ',
                '  oo           y    ',
                ...ground(20),
            ],
            // 3. pinha perto de uma bola gigante (a explosao tira 1 de vida dela)
            [
                '   oo     oo        ',
                '                    ',
                '                    ',
                '                    ',
                '   p       n        ',
                ...ground(20),
            ],
            // 4. peixe dourado entre tijolos e urso
            [
                '  B F B             ',
                '                    ',
                '  o     o     o     ',
                '                    ',
                '           y        ',
                ...ground(20),
            ],
            // 5. buraco pequeno (2) e pinha depois
            [
                '                    ',
                '      oo            ',
                '                    ',
                '                    ',
                '               p    ',
                'GGGGGGG  GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
                'GGGGGGG~~GGGGGGGGGGG',
            ],
            // 6. urso entre pilares altos (pise nele de cima do pilar)
            [
                '   o          o     ',
                '  II         II     ',
                '  II         II     ',
                '  II    y    II     ',
                ...ground(20),
            ],
            // 7. pinhas em plataformas baixas
            [
                '     p     p        ',
                '    ===   ===       ',
                '                    ',
                '  ooo   ooo         ',
                ...ground(20),
            ],
            // 8. peixe verde (+1 vida) e bola gigante
            [
                '     $V$            ',
                '                    ',
                '  oo     oo         ',
                '                    ',
                '              n     ',
                ...ground(20),
            ],
            // 9. ponto de controle
            [
                '                    ',
                '  o o o o           ',
                '                    ',
                '                    ',
                '    K               ',
                ...ground(20),
            ],
            // 10. urso e bola gigante
            [
                '  oo       oo       ',
                '                    ',
                '                    ',
                '                    ',
                '   y       n        ',
                ...ground(20),
            ],
            // 11. buraco de 3 com plataforma
            [
                '                    ',
                '     oo             ',
                '    ====            ',
                '                    ',
                '            oo      ',
                'GGGGG   GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
                'GGGGG~~~GGGGGGGGGGGG',
            ],
            // 12. teto de tijolos com urso embaixo
            [
                '   oooooo           ',
                '  BBBBBBBBBB        ',
                '                    ',
                '      y             ',
                ...ground(20),
            ],
            // 13. colina de gelo com pinha no topo e urso depois
            [
                '   o      p    o    ',
                '         III        ',
                '        IIIII       ',
                '   oo  IIIIIII      ',
                '      IIIIIIIII   y ',
                ...ground(20),
            ],
            // 14. presentes em alturas diferentes e pinhas
            [
                '  $     $     oo    ',
                '                    ',
                '      B$B           ',
                '                    ',
                '   p       p   oo   ',
                ...ground(20),
            ],
            // 15. duas bolas gigantes separadas por um pilar
            [
                '  oo   o    oo      ',
                '       III          ',
                '       III          ',
                '  n    III     n    ',
                ...ground(20),
            ],
            // 16. dois ursos embaixo de uma plataforma comprida
            [
                '    oooo            ',
                '  ============      ',
                '                    ',
                '     y     y        ',
                ...ground(20),
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '    B $ B           ',
                '                    ',
                '                    ',
                '  o o o o o         ',
                '            n       ',
                ...ground(20),
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // chefe do Mundo 2: Boneco de Neve, na cabana (arena de uma tela; o chao e o da imagem)
        name: '2-5',
        boss: 'snowman',
        time: 999,
        cenario: 'cabana',
        map: [
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '    P                         ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // Mundo 3: rio com ponte (cerca de 30% agua, 60% terra e 10% madeira; foca, bola de neve e urso)
        name: '3-1',
        time: 400,
        cenario: 'rio',
        map: joinSegments(
            // 1. comeco
            [
                '                    ',
                '  o     o           ',
                '   B$B   $          ',
                '                    ',
                ' P  >     oo        ',
                ...ground(20),
            ],
            // 2. rio com uma ilhota no meio
            [
                '                    ',
                '  oo     oo         ',
                '                    ',
                '                    ',
                '      oo        e   ',
                'G    GGG    GGGGGGGG',
                'G~~~~GGG~~~~GGGGGGGG',
                'G~~~~GGG~~~~GGGGGGGG',
            ],
            // 3. peixe dourado e buraco de 4
            [
                '    B$BF            ',
                '                    ',
                '                    ',
                '                    ',
                ' o o              e ',
                'GGGGGGGGG    GGGGGGG',
                'GGGGGGGGG~~~~GGGGGGG',
                'GGGGGGGGG~~~~GGGGGGG',
            ],
            // 4. rio largo com duas plataformas de madeira
            [
                '   ooo  ooo         ',
                '   www  www         ',
                '                    ',
                '                    ',
                '                    ',
                'G            GGGGGGG',
                'G~~~~~~~~~~~~GGGGGGG',
                'G~~~~~~~~~~~~GGGGGGG',
            ],
            // 5. foca embaixo de uma plataforma de gelo
            [
                '                    ',
                '       oo           ',
                '      =====         ',
                '                    ',
                '   oo          f    ',
                ...ground(20),
            ],
            // 6. ponte de madeira com urso em cima
            [
                '                    ',
                '    o o o o         ',
                '                    ',
                '                    ',
                '        y           ',
                'GGGwwwwwwwwwwGGGGGGG',
                'GGG~~~~~~~~~~GGGGGGG',
                'GGG~~~~~~~~~~GGGGGGG',
            ],
            // 7. presentes, bolas de neve e buraco de 4
            [
                '  $   $             ',
                '                    ',
                '                    ',
                '  oo                ',
                '            e  e    ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // 8. rio com pedrinhas de madeira e ilhota
            [
                '                    ',
                '  oo    oo          ',
                '                    ',
                '                    ',
                '              f     ',
                'G  ww GG  ww GGGGGGG',
                'G~~~~~GG~~~~~GGGGGGG',
                'G~~~~~GG~~~~~GGGGGGG',
            ],
            // 9. ponto de controle e buraco de 4
            [
                '                    ',
                '  o o o o           ',
                '                    ',
                '                    ',
                '    K               ',
                'GGGGGGGGGGGG    GGGG',
                'GGGGGGGGGGGG~~~~GGGG',
                'GGGGGGGGGGGG~~~~GGGG',
            ],
            // 10. ponte quebrada (pule o vao)
            [
                '                    ',
                '   oooo  oooo       ',
                '                    ',
                '                    ',
                '                    ',
                'GGwwww  wwwwGGGGGGGG',
                'GG~~~~~~~~~~GGGGGGGG',
                'GG~~~~~~~~~~GGGGGGGG',
            ],
            // 11. peixe verde (+1 vida), urso e buraco de 4
            [
                '     $V$            ',
                '                    ',
                '  oo     oo         ',
                '                    ',
                '               y    ',
                'GGGGGGGGGG    GGGGGG',
                'GGGGGGGGGG~~~~GGGGGG',
                'GGGGGGGGGG~~~~GGGGGG',
            ],
            // 12. tabuas soltas sobre o rio
            [
                '                    ',
                '    o    o          ',
                '                    ',
                '                    ',
                '                    ',
                'GG  ww   ww  GGGGGGG',
                'GG~~~~~~~~~~~GGGGGGG',
                'GG~~~~~~~~~~~GGGGGGG',
            ],
            // 13. duas focas separadas por um bloco de gelo
            [
                '  o        o        ',
                '       o            ',
                '      III           ',
                '      III           ',
                '  f   III     f     ',
                ...ground(20),
            ],
            // 14. rio com duas plataformas de madeira altas
            [
                '                    ',
                '     oo  oo         ',
                '     ww  ww         ',
                '                    ',
                '                    ',
                'GGG          GGGGGGG',
                'GGG~~~~~~~~~~GGGGGGG',
                'GGG~~~~~~~~~~GGGGGGG',
            ],
            // 15. tres bolas de neve, presentes e buraco de 4
            [
                '  $  B  $           ',
                '                    ',
                '                    ',
                '  o o o             ',
                '    e   e   e       ',
                'GGGGGGGGGGGGGGG    G',
                'GGGGGGGGGGGGGGG~~~~G',
                'GGGGGGGGGGGGGGG~~~~G',
            ],
            // 16. rio com uma ilhota no meio
            [
                '                    ',
                '   oo    oo         ',
                '                    ',
                '                    ',
                '       oo           ',
                'GG    GGG    GGGGGGG',
                'GG~~~~GGG~~~~GGGGGGG',
                'GG~~~~GGG~~~~GGGGGGG',
            ],
            // 17. ultimo trecho: buraco de 4 e urso
            [
                '    B $ B           ',
                '                    ',
                '                    ',
                '  o o o o           ',
                '               y    ',
                'GGGGGG    GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
                'GGGGGG~~~~GGGGGGGGGG',
            ],
            // escadaria final e bandeira
            [
                '           I            ',
                '          II            ',
                '         III            ',
                '        IIII            ',
                '       IIIII            ',
                '      IIIIII            ',
                '     IIIIIII            ',
                '    IIIIIIII      |     ',
                ...ground(24),
            ],
            [
                '                ',
                ...ground(16),
            ],
        ),
    },
    {
        // Mundo 3: em cima da ponte (piso de tabuas; buraco = queda no vao; foca, bola de neve e urso)
        name: '3-2',
        time: 400,
        cenario: 'ponte',
        map: joinSegments(
            // 1. comeco
            [
                '                    ',
                '  o  o  o           ',
                '   B$B   $          ',
                '                    ',
                ' P  >     oo        ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 2. primeiro buraco na ponte (3)
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '                    ',
                '  oo          e     ',
                'DDDDDD   DDDDDDDDDDD',
                '',
            ],
            // 3. peixe dourado e caixotes
            [
                '    B$BF            ',
                '                    ',
                '                    ',
                '         X          ',
                ' o o     X    e     ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 4. buraco de 4 com plataforma de madeira
            [
                '                    ',
                '    ooo             ',
                '   www              ',
                '                    ',
                '                    ',
                'DD    DDDDDDDDDDDDDD',
                '',
            ],
            // 5. focas dos dois lados de uma pilha de caixotes
            [
                '                    ',
                '  oo                ',
                '         XX         ',
                '         XX         ',
                '   f     XX    f    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 6. ponte quebrada: sobrou uma tabua solta no meio
            [
                '                    ',
                '  oo  oo  oo        ',
                '                    ',
                '                    ',
                '                    ',
                'DDD  ww  DDDDDDDDDDD',
                '',
            ],
            // 7. urso embaixo de uma fileira de caixotes
            [
                '                    ',
                '   ooo              ',
                '  XXXXX             ',
                '                    ',
                '               y    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 8. peixe verde (+1 vida) e buraco de 3
            [
                '     $V$            ',
                '                    ',
                '  oo     oo         ',
                '                    ',
                '              e     ',
                'DDDDDDDDDD   DDDDDDD',
                '',
            ],
            // 9. ponto de controle
            [
                '                    ',
                '  o o o o o         ',
                '                    ',
                '                    ',
                '    K               ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 10. tabuas faltando em sequencia
            [
                '                    ',
                '  oo   oo   oo      ',
                '                    ',
                '                    ',
                '              f     ',
                'DD  DDD  DDD  DDDDDD',
                '',
            ],
            // 11. duas focas separadas por caixotes
            [
                '  oo       oo       ',
                '       o            ',
                '      XX            ',
                '      XX            ',
                '  f   XX      f     ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 12. buraco grande com plataforma de madeira
            [
                '                    ',
                '    ooo             ',
                '   www              ',
                '                    ',
                '            ooo     ',
                'DD        DDDDDDDDDD',
                '',
            ],
            // 13. tres bolas de neve e presentes
            [
                '  $  B  $           ',
                '                    ',
                '                    ',
                '  o o o             ',
                '    e   e   e       ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 14. urso depois de um buraco de 4
            [
                '                    ',
                '   oo               ',
                '                    ',
                '                    ',
                '            y       ',
                'DDDDDD    DDDDDDDDDD',
                '',
            ],
            // 15. escadinhas de caixotes com buraco no meio
            [
                '       oo           ',
                '      o  o          ',
                '                    ',
                '     X    X         ',
                '    XX    XX        ',
                '   XXX    XXX       ',
                'DDDDDD    DDDDDDDDDD',
                '',
            ],
            // 16. foca e urso
            [
                '   ooo     ooo      ',
                '                    ',
                '                    ',
                '                    ',
                '   f       y        ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '    B $ B           ',
                '                    ',
                '                    ',
                '  o o o o o         ',
                '            e       ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // escadaria de caixotes e bandeira
            [
                '           X            ',
                '          XX            ',
                '         XXX            ',
                '        XXXX            ',
                '       XXXXX            ',
                '      XXXXXX            ',
                '     XXXXXXX            ',
                '    XXXXXXXX      |     ',
                'DDDDDDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            [
                '                ',
                'DDDDDDDDDDDDDDDD',
                '',
            ],
        ),
    },
    {
        // Mundo 3: a ponte a noite (piso: ~60% madeira, ~30% nuvem, ~10% outros blocos; foca, pinha e coruja)
        name: '3-3',
        time: 400,
        cenario: 'pontenoite',
        map: joinSegments(
            // 1. comeco: presentes soltos em alturas diferentes
            [
                '                    ',
                '                    ',
                '     $     B        ',
                '                    ',
                '  oo     oo         ',
                ' P  >               ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 2. ponte de nuvem e primeira foca
            [
                '                    ',
                '   o  o  o  o       ',
                '                    ',
                '                    ',
                '                    ',
                '               f    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 3. torre de caixotes e pinha
            [
                '                    ',
                '      oo            ',
                '                    ',
                '      XX      o     ',
                '      XX            ',
                '  p   XX            ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 4. primeira coruja, voando alto sobre a nuvem
            [
                '            a       ',
                '                    ',
                '  ooo  ooo          ',
                '                    ',
                '                    ',
                '                    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 5. peixe dourado entre presentes e buraco pequeno
            [
                '                    ',
                '    $F$             ',
                '                    ',
                '                    ',
                '  o      o  o       ',
                '              f     ',
                'DDDDDDDDDD  DDDDDDDD',
                '',
            ],
            // 6. nuvens em degraus subindo (altura!)
            [
                '  ooo        a      ',
                '  ccc               ',
                '        ooo         ',
                '        ccc         ',
                '                    ',
                '                    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 7. escada de caixotes, pinha e foca
            [
                '                    ',
                '        oo          ',
                '        XX          ',
                '       XXX          ',
                '      XXXX          ',
                '  p  XXXXX    f     ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 8. nuvens com um vao e coruja
            [
                '                    ',
                '   oo  oo  oo       ',
                '                    ',
                '          a         ',
                '                    ',
                '                    ',
                'DDDDDDDD  DDDDDDDDDD',
                '',
            ],
            // 9. ponto de controle
            [
                '                    ',
                '                    ',
                '  o o o o           ',
                '                    ',
                '                    ',
                '    K        p      ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 10. peixe verde (+1 vida) embaixo de uma nuvem
            [
                '           ccc      ',
                '     $V$    oo      ',
                '                    ',
                '  oo   oo           ',
                '                    ',
                '              f     ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 11. torres de caixotes de alturas diferentes
            [
                '                    ',
                '   oo     o         ',
                '   XX     X         ',
                '   XX  X  X         ',
                '   XX  X  X         ',
                '  fXX  X  X         ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 12. buraco com nuvem no meio e coruja
            [
                '                    ',
                '      ooo           ',
                '                    ',
                '        a           ',
                '                    ',
                '                    ',
                'DDDDD   DDD   DDDDDD',
                '',
            ],
            // 13. caminho alto de nuvens
            [
                '                    ',
                '   ooo    ooo       ',
                '   ccc    ccc       ',
                '                    ',
                '                    ',
                '               p    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 14. presentes e foca sobre caixotes
            [
                '                    ',
                '                    ',
                '  $  B  $           ',
                '                    ',
                '  o   o   o         ',
                '        f           ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 15. coruja, pinha e foca
            [
                '            a       ',
                '                    ',
                '   oo  oo           ',
                '                    ',
                '                    ',
                '   p       f        ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 16. nuvenzinhas altas com moedas
            [
                '                    ',
                '  oo    oo          ',
                '  cc    cc          ',
                '                    ',
                '                    ',
                '                    ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // 17. ultimo trecho antes da escadaria
            [
                '                    ',
                '   $ B $            ',
                '                    ',
                '  o o o o           ',
                '                    ',
                '              f     ',
                'DDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            // escadaria de caixotes e bandeira
            [
                '           X            ',
                '          XX            ',
                '         XXX            ',
                '        XXXX            ',
                '       XXXXX            ',
                '      XXXXXX            ',
                '     XXXXXXX            ',
                '    XXXXXXXX      |     ',
                'DDDDDDDDDDDDDDDDDDDDDDDD',
                '',
            ],
            [
                '                ',
                'DDDDDDDDDDDDDDDD',
                '',
            ],
        ),
    },
    {
        // Mundo 3: canion com a cascata. Madeira (ratos) > nuvens (corujas) > madeira (bois) > nuvens (corujas) > madeira (bois)
        name: '3-4',
        time: 400,
        cenario: 'cascata',
        map: [
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                      a                                                                                                                                             a                                                                                       ',
            '                                                                                                                                a                                               a                                                                                           a                                                                                                               ',
            '                                                                                                                                       o o                                                                                                                                                oo                                                                         X                      ',
            '                                                                                     ooo                                      o o                                                                                                                                                oo                                                                                 XX                      ',
            '                                                                                                                                      ccccccccc    o o              o o                                                                                                  oo             cccccc     oo                                                              XXX                      ',
            '                                                                           ooo      wwwwwww                          o o     ccccccc                                         o o                                       ooooo                                                   cccccc                                                                             XXXX                      ',
            '         $              F                    ooooo          $                                             B                                       ccccc    o o     cccccc              o o              V                           $                           oo     cccccc                    cccccc     oo                $              B$                  XXXXX                      ',
            '                                         ooo                              wwwwwww                                   cccccc                                                  ccccccc                                   wwwwwww                                                                                                                                   XXXXXX                      ',
            '             oooo            ooo            wwwwwww                                                                                                       cccccc                      cccccccc                                                                cccccc                                      cccccc                                  ooo          XXXXXXX                      ',
            '  P  >            m               m                      oo      m                               oooo       m                                                                                     K   ooo      b                        ooo      b   ooo                                                              ooo            b                  b     XXXXXXXX      |               ',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD             DDDDDDDDDDDDDDDDD                       DDDDDDDDDDDDDDDDDDDD                                                                             DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD                                                        DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
        ],
    },
    {
        // chefe do Mundo 3: Floco de Neve, na cascata (o chao e o tronco da imagem)
        name: '3-5',
        boss: 'snowflake',
        time: 999,
        cenario: 'cascatachefe',
        map: [
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '    P                         ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
        ],
    },
    {
        // Mundo 4: estrada nevada (a estrada do fundo e o chao); bola gigante, urso e castor
        name: '4-1',
        time: 400,
        cenario: 'estrada',
        map: [
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                     X                      ',
            '                                                                                                                                                                                                                                                                             oooooo                                                                                 XX                      ',
            '                                                       ooooo                                                                            ooo                    o o o o                                                                                                                                                                                             XXX                      ',
            '                                                                                                                                                                                                                                          ooooo                             GGGGGGGG                       oooo                                                   XXXX                      ',
            '            $         F                         $     GGGGGGG                                           B$B     GGGGG                 o                       GGGGGGGGGG                              V                 $   $                                                                     B$                        GGGGGG                $              XXXXX                      ',
            '                                                                            o o o o  oo                                               X                                                                                             oo              oo                                                    GGGGGG                                                XXXXXX                      ',
            '        ooo     ooo                     oo                     oooo                  XX                       oooo                   XX                                   ooo            ooo              ooo                       XX              XX      oooo                                                            ooo                       ooo      XXXXXXX                      ',
            '  P  >                        n         XX                            y              XX         k                       n           XXX               k                             y         K                   k                 XX      n       XX              k                     y                           k                   n                   XXXXXXXX      |               ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // Mundo 4: estrada ao pe da montanha; boi-almiscarado, rato das neves e coruja
        name: '4-2',
        time: 400,
        cenario: 'estrada2',
        map: [
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                a                                                                                                                                                             a                                                                                             ',
            '                                                    a                                                                                                                                                                           a                                                                                                                                                           ',
            '                                                                                                                          oooo                                                                                                                                                                                                                                       X                      ',
            '                                                                                                                                                                                                                                                       ooooo                                                                                                        XX                      ',
            '                                           ooooo                             oooo                                         GGGG                                                                 oooo                  oooo                                                                                                                                          XXX                      ',
            '                                                                                                                                            oooo                                                                                                      GGGGGGG                                     ooooo     oooo                                                  XXXX                      ',
            '               $    F                     GGGGGGG                ooooo      GGGGGG                      $            GGG                                        V               $   $         GGGGGG                GGGGGG                 ooooo                                                                        $                           $            XXXXX                      ',
            '                                                                                                                                            GGGG                                                                                                                                                  GGGGG     GGGG                                                XXXXXX                      ',
            '         ooo            ooo                                                                       ooo           GGG                                       ooo                           ooo                                                                             oooo                                                ooo               ooo              XXXXXXX                      ',
            '  P  >                            m                     m                                   b                                     m                   K                   m                                 b                                                     m                     b                                             b                       XXXXXXXX      |               ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // Mundo 4: o castelo do rei no alto da montanha (fundo parado); ourico, castor e rato das neves
        name: '4-3',
        time: 400,
        cenario: 'montanhacastelo',
        map: [
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                     X                      ',
            '                                                                     ooooo                                                                                                   oooo                                                                                                                                                                                   XX                      ',
            '                                                                                                                                                                                                                                 ooooo                                                                                                                             XXX                      ',
            '                  F                                                 GGGGGGG                                                     oooo                                        GGGGGG                                                                                                            oooo                                                                XXXX                      ',
            '                                         ooooo           ooooo                          $              oo                                           V                                         $   $                  ooooo      GGGGGGG               $                                                                   $                       $              XXXXX                      ',
            '              $                                                                                        GG                       GGGG                                    G                                                                                           ooo     oooo              GGGG                                                              XXXXXX                      ',
            '         ooo          ooo               GGGGGGG                                   ooo                  GG           ooo                       ooo                      GG                             ooo                                                 ooo                                           ooo                   ooo                              XXXXXXX                      ',
            '  P  >                          u       GGGGGGG     m                   k                       u      GG     u                           K                   m       GGG             k                     u     m                           k                   u       m       u                               k                       m                   XXXXXXXX      |               ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // Mundo 4: noite na montanha (fundo parado); rato, boi, pinha e coruja; muitas plataformas subindo
        name: '4-4',
        time: 400,
        cenario: 'montanhanoite',
        map: [
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                                a                                                                                                                                                                                                                                                                           ',
            '                                                      a                                                                                                                                              a                                                                                                                                                                                      ',
            '                                                                                                           ooo                                                                                ooo                                     a                                                                                                                                                     ',
            '                                                                                                                                                                                                                                                                                                                                                                                            ',
            '                                                                                                      oo   GGGG                                                                           oo  GGGG                                                                  ooo                                                                                              X                      ',
            '                                         oo                                                                                                                                                                                                                                                                                                                         XX                      ',
            '                                   oo                                            ooo             oo   GGG                                                                       ooo       GGG                                                    ooo            oo  GGGG oo                                                ooo                                     XXX                      ',
            '                                                p              oo                                                                            oo                                                                                oo                                                                        oo                                                       XXXX                      ',
            '               $   F                       GGGGGGGG                             GGGGGG           GGG                    $       p               G                 V            GGGGG          GGG             $   $                             GGGGGG          GGG      GGG              $                 G             GGGGG                   $              XXXXX                      ',
            '                                        GGGGGGGGGGG            GGG                                                            GGGGG          GG                                                                                GGG                                                                       GG                                                     XXXXXX                      ',
            '         ooo                         GGGGGGGGGGGGGG    oooo                           ooo   GGG                                       ooo                   ooo                           GGG                                                       oooo    GGG              GGG                  oooo                        oooo        ooo                  XXXXXXX                      ',
            '  P  >                      m     GGGGGGGGGGGGGGGGG                       b                                       m                                     K                 b                             m               p                   b                                       m           p                     b             m                         XXXXXXXX      |               ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG      GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
    {
        // chefe do Mundo 4: Yeti, no vale da montanha a noite (arena de uma tela; o chao e o da imagem)
        name: '4-5',
        boss: 'yeti',
        time: 999,
        cenario: 'valenoite',
        map: [
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '                              ',
            '    P                         ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        ],
    },
];
