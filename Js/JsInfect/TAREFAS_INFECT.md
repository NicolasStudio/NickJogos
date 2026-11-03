# Global Outbreak (jogoInfect) - Tarefas

Jogo de estrategia/simulacao epidemiologica FICTICIA, HTML/CSS/JS puro, offline,
no padrao NickJogos. Abre pelo card -> `jogoInfect.html`. Sem build, sem servidor
de app (so precisa ser servido por HTTP: GitHub Pages, Live Server, etc.).

Arquivos:
- `jogoInfect.html` - pagina do jogo
- `Css/StylesInfect/style.css` - tema centro de monitoramento (paleta da spec)
- `Js/JsInfect/script.js` - engine deterministico + mapa D3 + UI + save
- `Js/JsInfect/d3.v7.min.js` - D3 v7 LOCAL (offline)
- `Js/JsInfect/world.geojson` - 169 paises (Natural Earth, dominio publico)
- `Img/ImagemCapa/globalOutbreak.svg` - capa do card (local)

Legenda: [x] feito - [ ] pendente

## Nucleo
- [x] Criacao da doenca (nome + classe; parasita bloqueado) + pais de origem
- [x] Mapa-mundi geografico real (D3-Geo), 169 paises selecionaveis, zoom/pan, hover
- [x] Cor dinamica por estagio (6 estados) + legenda
- [x] Engine deterministico (PRNG por seed), ciclo diario ordenado, invariante populacional
- [x] GameClock: pausa + 1x/2x/3x/5x (nao depende de FPS)
- [x] Painel lateral do pais (populacao S/I/R/D, indicadores)
- [x] Paineis: Doenca (indicadores+barras), Transmissao, Sintomas, Cura
- [x] Arvores de evolucao por dados (compra por pontos, requisitos, estados)
- [x] Cura (mobilizacao conforme infeccao mundial)
- [x] Eventos dinamicos (surtos, novas fronteiras) + toasts + historico + badge
- [x] Rotas aereas/maritimas no mapa + veiculos animados (movimentos reais)
- [x] Condicoes de vitoria/derrota + tela de fim
- [x] Persistencia: localStorage (auto-save) + Continuar partida salva
- [x] Exportar / Importar partida em .txt (JSON), com validacao minima
- [x] Balanceamento ajustado (espalhamento mais lento e progressivo)
- [x] Card do portfolio: "Global Outbreak" com capa SVG local
- [x] Verificado ao vivo (Playwright): mapa 169 paises, rotas, invariante OK,
      continuar e export/import .txt - 0 erros de console

## Possiveis melhorias futuras
- [ ] Fechar rotas manualmente (medida de contencao jogavel)
- [ ] Graficos de linha no painel Doenca com a serie historica
- [ ] Mais eventos e marcos; dificuldade por classe mais distinta
