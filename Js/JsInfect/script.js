/* ===========================================================================
   INFECCAO: PACIENTE ZERO - logica do jogo (HTML/JS puro, offline).
   Organizado em: (1) DADOS/BALANCEAMENTO  (2) ENGINE puro deterministico
   (3) RENDER do mapa (D3)  (4) UI  (5) LOOP de tempo  (6) PERSISTENCIA.
   A logica de simulacao (ENGINE) e separada da UI: o engine so recebe e
   devolve estado; os componentes apenas leem o estado e desenham.
   Acessos (voo/mar) de cada pais vem de Js/JsInfect/acessos.js.
   =========================================================================== */
(() => {
'use strict';

// =================== (1) DADOS / BALANCEAMENTO ===================
const ACCESS = typeof ACESSOS_PAISES !== 'undefined' ? ACESSOS_PAISES : {};

const BALANCE = {
  growthMul: 0.6,               // taxa logistica interna: contagio*growthMul ~ pico/dia
  minSusceptible: 0.25,          // piso da fracao suscetivel (varre os ultimos saudaveis)
  deathMul: 0.12,                // fracao da letalidade aplicada por dia
  deathMinSaturated: 5,          // mortes minimas/dia em pais sem saudaveis (com letalidade > 0)
  stage: { first: 0.00005, growing: 0.02, high: 0.2, critical: 0.5 },
  // rotas: chance diaria base de exportar casos (escala com o % infectado da origem)
  exportMinInfected: 100,
  landBase: 0.07, airBase: 0.07, seaBase: 0.05,
  // deteccao do surto e fechamento de aeroporto/porto/fronteira
  detectBase: 0.02,              // fracao afetada para detectar com gravidade 0
  closeBase: 0.004,              // chance/dia de fechar cada acesso apos detectar
  closeSevMul: 0.04,             // + chance por ponto de gravidade
  // pontos de evolucao
  startPoints: 6,
  pointsPerCountry: 1,           // por pais infectado pela primeira vez
  pointsLogMul: 0.1,             // pontos/dia = mul * log10(infectados no mundo)
  // cura
  cureBaseDaily: 0.08,           // % de cura/dia com 1 pais pesquisando e gravidade 0
  cureSlowCap: 0.8,              // teto do atraso da cura (Remedios 1-3 somam 60%)
  // ninguem se recupera sozinho: so a cura (apos chegar a 100%) salva infectados
  cureDeployRate: 0.15,          // fracao dos infectados curada/dia durante a distribuicao
  cureDeployMin: 20,             // minimo de curados/dia por pais (os ultimos casos somem rapido)
  curingSpreadMul: 0.3,          // contagio (interno e por rotas) durante a distribuicao
  idleDays: 10,                  // dias sem nenhum contagio novo = surto isolado
  idleCureMul: 5,                // com o surto isolado a pesquisa acelera (evita partida parada)
};

// Cada classe tem um contagio-base ESCONDIDO (sem ele o paciente zero nunca
// passaria a doenca adiante). Os indicadores visiveis comecam em 0.
// lines: linhas de transmissao que a classe pode evoluir (null = todas).
// pointsMul: multiplica os pontos ganhos. coldPenalty/heatPenalty: quanto o clima
// frio/quente atrapalha o contagio sem resistencia (0,5 = normal).
// heatResistCap/coldResistCap: teto da adaptacao ao clima (1 = adapta por completo).
// Sem teto a fraqueza da classe some: o fungo, por exemplo, ganha heatResist de
// graca na linha de mosquitos (a unica que ele pode evoluir) e zerava a penalidade.
const CLASSES = {
  virus:    { label:'Vírus',    desc:'O mais fácil. Evoluções 20% mais baratas, mas a cura avança 20% mais rápido.',
              baseSpread:.30, costMul:.8, cureMul:1.2, landMul:1, airMul:1, pointsMul:1, lines:null, coldPenalty:.5, heatPenalty:.5 },
  bacteria: { label:'Bactéria', desc:'Só evolui contato físico. 10% menos pontos, evoluções 20% mais caras, fraca no frio. A cura avança 20% mais devagar.',
              baseSpread:.36, costMul:1.2, cureMul:.8, landMul:1, airMul:1, pointsMul:.9, lines:['cont'], lineBoost:2.5, coldPenalty:.8, heatPenalty:.5 },
  fungus:   { label:'Fungo',    desc:'Só evolui ratos e insetos. 15% menos pontos, evoluções 15% mais caras. Nunca se adapta de todo ao calor: países quentes sempre travam o contágio. Forte por terra, fraco em voos.',
              baseSpread:.33, costMul:1.15, cureMul:1, landMul:1.3, airMul:.6, pointsMul:.85, lines:['rato','mosq'], lineBoost:1.6, coldPenalty:.5, heatPenalty:.9, heatResistCap:.5 },
  // Parasita (dificil): liberado ao vencer com as 3 outras classes (unlock).
  // climateLock: nao se reproduz em pais quente sem Calor 2 nem em pais frio sem Frio 2.
  // startWith: nos ja comprados no inicio. lateHalfPointsMul: pontos apos metade do mundo contaminado.
  parasite: { label:'Parasita', desc:'Difícil. Só evolui Ratos e já começa com Confusão mental. 15% menos pontos, evoluções 35% mais caras. Não se reproduz em países quentes sem Calor 2 nem em frios sem Frio 2. Com metade do mundo contaminado, ganha 30% menos pontos.',
              baseSpread:.30, costMul:1.35, cureMul:1, landMul:1, airMul:1, pointsMul:.85, lines:['rato'], lineBoost:1.3, coldPenalty:.5, heatPenalty:.5,
              climateLock:true, startWith:['confu'], lateHalfPointsMul:.7, unlock:['virus','bacteria','fungus'] },
};
const LINE_NAMES = { aer:'Ar', cont:'Contato', agua:'Água', rato:'Ratos', mosq:'Mosquitos' };

// Linha de transmissao de um no ("aer", "cont"...) ou null para nos fora das 5 linhas.
// (pelo id: os nos da lista EVOLUTIONS nao tem o campo "tree", so as copias em EVO_BY_ID)
function transLine(e){ const m = /^(aer|cont|agua|rato|mosq)\d$/.exec(e.id); return m ? m[1] : null; }
// Clima do pais para o Parasita: quente (|lat| <= 24) ou frio (|lat| >= 45).
function climateKind(co){ return co.clim.heat>=0.6 ? 'hot' : co.clim.cold>=0.75 ? 'cold' : 'mild'; }
function climateBlocked(co, state){
  const k = climateKind(co);
  return (k==='hot' && !state.purchased.includes('calor2')) || (k==='cold' && !state.purchased.includes('frio2'));
}
// A classe da doenca pode evoluir este no?
function allowedFor(e, diseaseClass){
  const lines = CLASSES[diseaseClass].lines, line = transLine(e);
  return !line || !lines || lines.includes(line);
}

// Arvores de evolucao. col/row = posicao na colmeia; req = precisa de PELO MENOS
// UM dos nos listados (vizinho ja comprado).
const EVOLUTIONS = {
  transmission: [
    // 5 linhas de transmissao (Ar, Contato, Agua, Ratos, Mosquitos), cada uma com
    // 3 niveis que SOMAM: +15% (3 pts), +30% (10 pts), +55% (18 pts) = 100% na rota.
    // Depois vem os nos avancados que juntam as linhas.
    { id:'aer1',  name:'Ar 1',         icon:'fa-wind',          col:0,row:0, cost:3,  eff:{infectivity:.02, air:.15},
      desc:'Partículas no ar de ambientes fechados. Favorece rotas aéreas.' },
    { id:'cont1', name:'Contato 1',    icon:'fa-handshake',     col:0,row:1, cost:3,  eff:{infectivity:.02, land:.15},
      desc:'Passa pelo toque e por superfícies. Favorece fronteiras terrestres.' },
    { id:'agua1', name:'Água 1',       icon:'fa-droplet',       col:0,row:2, cost:3,  eff:{infectivity:.02, sea:.15},
      desc:'Sobrevive na água. Favorece rotas marítimas.' },
    { id:'rato1', name:'Ratos 1',      icon:'svg:rato-p',        col:0,row:3, cost:3,  eff:{infectivity:.02, land:.10, sea:.10},
      desc:'Roedores levam o patógeno pelas cidades e pelos porões dos navios.' },
    { id:'mosq1', name:'Mosquitos 1',  icon:'fa-mosquito',      col:0,row:4, cost:3,  eff:{infectivity:.02, heatResist:.10},
      desc:'Picadas espalham a doença. Mosquitos se criam na água parada e gostam de calor.' },
    { id:'aer2',  name:'Ar 2',         icon:'fa-plane',         col:1,row:0, cost:10, req:['aer1'], eff:{infectivity:.04, air:.30},
      desc:'Resiste à filtragem de ar de aviões.' },
    { id:'cont2', name:'Contato 2',    icon:'fa-hands',         col:1,row:1, cost:10, req:['cont1'], eff:{infectivity:.04, land:.30},
      desc:'Contágio por contato muito mais eficiente.' },
    { id:'agua2', name:'Água 2',       icon:'fa-ship',          col:1,row:2, cost:10, req:['agua1'], eff:{infectivity:.04, sea:.30},
      desc:'Contamina reservatórios e a água de navios.' },
    { id:'rato2', name:'Ratos 2',      icon:'svg:rato-m',        col:1,row:3, cost:10, req:['rato1'], eff:{infectivity:.04, land:.20, sea:.20},
      desc:'Infestações de ratos em portos espalham a doença por navios e fronteiras.' },
    { id:'mosq2', name:'Mosquitos 2',  icon:'fa-mosquito-net',  col:1,row:4, cost:10, req:['mosq1'], eff:{infectivity:.04, heatResist:.15, land:.05},
      desc:'Mosquitos resistentes a repelentes se espalham em países quentes.' },
    { id:'aer3',  name:'Ar 3',         icon:'fa-plane-departure',col:2,row:0, cost:18, req:['aer2'], eff:{infectivity:.07, air:.55},
      desc:'Sobrevive horas suspenso no ar: cada voo vira um foco.' },
    { id:'cont3', name:'Contato 3',    icon:'fa-people-group',  col:2,row:1, cost:18, req:['cont2'], eff:{infectivity:.07, land:.55},
      desc:'Um aperto de mão basta. Fronteiras terrestres viram peneiras.' },
    { id:'agua3', name:'Água 3',       icon:'fa-water',         col:2,row:2, cost:18, req:['agua2'], eff:{infectivity:.07, sea:.55},
      desc:'Resiste ao tratamento da água. Portos espalham a doença pelo mundo.' },
    { id:'rato3', name:'Ratos 3',      icon:'svg:rato-g',        col:2,row:3, cost:18, req:['rato2'], eff:{infectivity:.07, land:.30, sea:.30},
      desc:'Ratos se tornam portadores perfeitos, sem adoecer.' },
    { id:'mosq3', name:'Mosquitos 3',  icon:'fa-bugs',          col:2,row:4, cost:18, req:['mosq2'], eff:{infectivity:.08, heatResist:.25, land:.15},
      desc:'Enxames atravessam fronteiras e sobrevivem até em climas amenos.' },
    { id:'disp',  name:'Dispersão',    icon:'fa-tornado',       col:3,row:0, cost:28, req:['aer3'], eff:{infectivity:.06, air:.5},
      desc:'Se espalha por longas distâncias pelo ar.' },
    { id:'fluid', name:'Fluidos',      icon:'fa-syringe',       col:3,row:1, cost:24, req:['cont3','agua3'], eff:{infectivity:.07},
      desc:'Transmissão por fluidos corporais.' },
    { id:'hiper', name:'Hipercontágio',icon:'fa-virus',         col:4,row:2, cost:45, req:['disp','fluid','rato3','mosq3'], eff:{infectivity:.15, air:.3, sea:.3, land:.3},
      desc:'Transmissão extrema por todas as vias.' },
  ],
  symptoms: [
    { id:'tosse',  name:'Tosse',            icon:'fa-head-side-cough', col:0,row:0, cost:4,  eff:{infectivity:.04, severity:.02},
      desc:'Espalha gotículas. Pouco notada.' },
    { id:'nausea', name:'Náusea',           icon:'fa-face-dizzy',      col:0,row:1, cost:3,  eff:{severity:.03},
      desc:'Desconforto leve. Pouco notada.' },
    { id:'erup',   name:'Erupção',          icon:'fa-hand-dots',       col:0,row:2, cost:4,  eff:{infectivity:.03, severity:.02},
      desc:'Manchas na pele que facilitam o contato.' },
    { id:'insonia',name:'Insônia',          icon:'fa-moon',            col:0,row:3, cost:4,  eff:{severity:.04},
      desc:'Noites sem dormir enfraquecem os infectados. Pouco notada.' },
    { id:'espirro',name:'Espirros',         icon:'fa-head-side-mask',  col:1,row:0, cost:6,  req:['tosse'], eff:{infectivity:.06, severity:.02},
      desc:'Lança o patógeno no ar.' },
    { id:'febre',  name:'Febre',            icon:'fa-temperature-high',col:1,row:1, cost:6,  req:['tosse','nausea'], eff:{severity:.08, lethality:.01},
      desc:'Sintoma clássico: chama atenção dos médicos.' },
    { id:'vomito', name:'Vômito',           icon:'fa-face-grimace',    col:1,row:2, cost:6,  req:['nausea'], eff:{infectivity:.05, severity:.04},
      desc:'Espalha o patógeno no ambiente.' },
    { id:'lesao',  name:'Lesões',           icon:'fa-bandage',         col:1,row:3, cost:7,  req:['erup','insonia'], eff:{infectivity:.05, severity:.04},
      desc:'Feridas abertas aumentam o contágio.' },
    { id:'pneu',   name:'Pneumonia',        icon:'fa-lungs',           col:2,row:0, cost:10, req:['espirro','febre'], eff:{infectivity:.05, severity:.08, lethality:.04},
      desc:'Ataca os pulmões. Grave.' },
    { id:'confu',  name:'Confusão mental',  icon:'fa-brain',           col:2,row:1, cost:8,  req:['febre','insonia'], eff:{severity:.10},
      desc:'Desorientação. Muito visível.' },
    { id:'diarreia',name:'Diarreia',        icon:'fa-toilet',          col:2,row:2, cost:9,  req:['vomito'], eff:{infectivity:.07, severity:.05, lethality:.02},
      desc:'Contamina a água e o esgoto. Desidrata os infectados.' },
    { id:'cegueira',name:'Cegueira',        icon:'fa-eye-slash',       col:2,row:3, cost:9,  req:['lesao'], eff:{severity:.10},
      desc:'Perda da visão. Muito visível.' },
    // 4o grau: so vale a pena depois de um surto grande (os pontos vem do mundo infectado)
    { id:'falen',  name:'Falência orgânica',icon:'fa-heart-crack',     col:3,row:0, cost:30, req:['pneu'], eff:{severity:.15, lethality:.15},
      desc:'Órgãos param de funcionar.' },
    { id:'convul', name:'Convulsões',       icon:'fa-bolt',            col:3,row:1, cost:22, req:['confu'], eff:{severity:.12, lethality:.05},
      desc:'Crises violentas e imprevisíveis.' },
    { id:'hemo',   name:'Hemorragia',       icon:'fa-droplet-slash',   col:3,row:2, cost:26, req:['diarreia','cegueira'], eff:{infectivity:.05, severity:.10, lethality:.08},
      desc:'Sangramentos internos. Muito letal.' },
    // 5o grau: os sintomas mais letais do jogo, um degrau acima do 4o grau
    { id:'coma',   name:'Coma',             icon:'fa-bed',             col:4,row:0, cost:38, req:['falen','convul'], eff:{severity:.20, lethality:.20},
      desc:'Pacientes não acordam mais.' },
    { id:'paral',  name:'Paralisia',        icon:'fa-wheelchair',      col:4,row:1, cost:28, req:['convul'], eff:{severity:.15, lethality:.08},
      desc:'O sistema nervoso para de responder.' },
    { id:'necro',  name:'Necrose',          icon:'fa-skull',           col:4,row:2, cost:40, req:['hemo'], eff:{infectivity:.06, severity:.15, lethality:.20},
      desc:'Destruição de tecidos. Letalidade máxima.' },
  ],
  abilities: [
    { id:'frio1',  name:'Frio 1',           icon:'fa-snowflake',       col:0,row:0, cost:7,  eff:{coldResist:.5},
      desc:'Sobrevive melhor em países frios.' },
    { id:'calor1', name:'Calor 1',          icon:'fa-sun',             col:0,row:1, cost:7,  eff:{heatResist:.5},
      desc:'Sobrevive melhor em países quentes.' },
    { id:'droga1', name:'Remédios 1',       icon:'fa-pills',           col:0,row:2, cost:10, eff:{cureSlow:.10},
      desc:'Resiste a tratamentos comuns: atrasa a cura.' },
    { id:'frio2',  name:'Frio 2',           icon:'fa-icicles',         col:1,row:0, cost:20, req:['frio1'], eff:{coldResist:.5},
      desc:'Imune ao frio extremo.' },
    { id:'calor2', name:'Calor 2',          icon:'fa-fire',            col:1,row:1, cost:20, req:['calor1'], eff:{heatResist:.5},
      desc:'Imune ao calor extremo.' },
    { id:'droga2', name:'Remédios 2',       icon:'fa-capsules',        col:1,row:2, cost:24, req:['droga1'], eff:{cureSlow:.20},
      desc:'Resiste a antivirais e antibióticos.' },
    { id:'droga3', name:'Remédios 3',       icon:'fa-prescription-bottle-medical', col:2,row:2, cost:36, req:['droga2'], eff:{cureSlow:.30},
      desc:'Resiste até aos tratamentos experimentais: atrasa muito a cura.' },
    // cureCut: efeito unico na compra (tira pontos percentuais da cura); so com a pesquisa em andamento
    { id:'droga4', name:'Remédios 4',       icon:'fa-syringe',         col:3,row:2, cost:50, req:['droga3'], eff:{}, cureCut:10,
      desc:'Mutação de emergência: as amostras dos laboratórios ficam inúteis e a cura perde 10% do progresso.' },
    { id:'gen1',   name:'Blindagem genética 1', icon:'fa-dna',         col:2,row:1, cost:32, req:['frio2','calor2','droga2'], eff:{cureSlow:.15},
      desc:'Código genético instável dificulta a pesquisa.' },
    { id:'gen2',   name:'Blindagem genética 2', icon:'fa-shield-virus',col:3,row:1, cost:45, req:['gen1'], eff:{cureSlow:.15},
      desc:'A cura fica muito mais difícil.' },
  ],
};
const ALL_EVOS = Object.entries(EVOLUTIONS).flatMap(([tree,list]) => list.map(e => ({ ...e, tree })));
const EVO_BY_ID = Object.fromEntries(ALL_EVOS.map(e => [e.id, e]));

const STAGE_COLORS = { none:'#293746', first:'#4D8FD0', growing:'#E4B44E', high:'#e08a3c', critical:'#D94848', saturated:'#6b2d2d' };
const STAGE_LABELS = { none:'Sem registros', first:'Primeiros registros', growing:'Contaminacao em crescimento',
  high:'Contaminacao elevada', critical:'Situacao critica', saturated:'Sem populacao suscetivel' };

// Populacao ficticia por pais (valores de gameplay, nao oficiais).
const POP = { CHN:1412000000,IND:1428000000,USA:334000000,IDN:277000000,PAK:240000000,NGA:223000000,BRA:203000000,
  BGD:173000000,RUS:144000000,MEX:129000000,JPN:123000000,ETH:126000000,PHL:117000000,EGY:112000000,COD:102000000,
  VNM:98000000,IRN:89000000,TUR:85000000,DEU:84000000,THA:72000000,GBR:68000000,FRA:68000000,ITA:59000000,ZAF:60000000,
  KOR:52000000,COL:52000000,ESP:48000000,ARG:46000000,UKR:38000000,CAN:40000000,POL:38000000,SAU:37000000,AUS:26000000,
  ATA:5000,ATF:200,FLK:3500,GRL:56000,ISL:380000,BHS:400000,BRN:450000,LUX:650000,CYP:1200000,TTO:1500000,FJI:900000,
  BLZ:400000,SUR:600000,GUY:800000,DJI:1100000,BTN:780000,MNE:620000,ESH:600000,TLS:1300000,GNQ:1700000,LSO:2300000,
  SWZ:1200000,GMB:2700000,GNB:2100000 };
const DEF_POP = 9000000;

// Clima ficticio aproximado por latitude (preenchido no init a partir do centro).
function climateFor(lat){
  const abs = Math.abs(lat);
  return { heat: Math.max(0, 1 - abs/60), cold: Math.max(0, abs/60) };
}

// =================== (2) ENGINE PURO DETERMINISTICO ===================
function seedToState(seed){ return (seed|0) || 1; }
function nextRandom(s){ let a=s|0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a);
  t=(t+Math.imul(t^(t>>>7),61|t))^t; return [((t^(t>>>14))>>>0)/4294967296, a]; }

// Indicadores da doenca: TUDO comeca em 0 e so sobe com evolucoes compradas.
function diseaseStats(state){
  const s={ infectivity:0, severity:0, lethality:0, air:0, sea:0, land:0, heatResist:0, coldResist:0, cureSlow:0 };
  for(const id of state.purchased){
    const e = EVO_BY_ID[id]; if(!e || !allowedFor(e, state.diseaseClass)) continue;
    // classes restritas a poucas linhas tiram mais proveito delas (lineBoost)
    const mul = transLine(e) ? (CLASSES[state.diseaseClass].lineBoost||1) : 1;
    for(const k in e.eff) s[k]+=e.eff[k]*mul;
  }
  return s;
}

function costOf(e, state){ return Math.max(1, Math.round(e.cost * CLASSES[state.diseaseClass].costMul)); }
function reqOk(e, state){ return !e.req || e.req.some(r => state.purchased.includes(r)); }
// nos de efeito unico na cura so valem com a pesquisa em andamento (nem parada, nem concluida)
function cutReady(e, state){ return !e.cureCut || (state.cure>0 && state.cure<100); }

function deriveStage(co){
  if(co.infected<=0 && co.dead<=0 && co.recovered<=0) return 'none';
  if(co.healthy<=0 && co.infected>0) return 'saturated';
  const aff=(co.infected+co.dead)/Math.max(1,co.total);
  const t=BALANCE.stage;
  if(aff>=t.critical) return 'critical';
  if(aff>=t.high) return 'high';
  if(aff>=t.growing) return 'growing';
  if(aff>=t.first || co.infected>0) return 'first';
  return 'none';
}

const MODE_LABEL = { land:'pela fronteira', air:'por voo', sea:'por navio' };

// UM ciclo (dia). Funcao PURA: muta uma copia e retorna {state, events}.
// Ordem: dinamica interna -> deteccao/fechamentos -> rotas -> estagios
//  -> pontos -> cura -> fim -> historico
function tick(prev){
  const state = cloneState(prev);
  const events = [];
  state.day += 1;
  const cls = CLASSES[state.diseaseClass];
  const d = diseaseStats(state);
  let rng = state.rngState;
  const rnd = () => { const [v,n]=nextRandom(rng); rng=n; return v; };

  const list = Object.values(state.countries);
  const detectThr = BALANCE.detectBase * (1 - Math.min(0.9, d.severity));
  const closeChance = BALANCE.closeBase + d.severity * BALANCE.closeSevMul;
  const curing = state.cure>=100;
  const deployRate = BALANCE.cureDeployRate * (1 - Math.min(BALANCE.cureSlowCap, d.cureSlow)*0.5);
  let worldPop=0, worldDead=0, detectedCount=0, newCases=0;

  // dinamica interna de cada pais
  for(const co of list){
    worldPop += co.total;
    if(co.infected>0){
      // clima vs habilidades
      let climMul = 1;
      const coldR = Math.min(cls.coldResistCap ?? 1, d.coldResist);
      const heatR = Math.min(cls.heatResistCap ?? 1, d.heatResist);
      climMul *= 1 - co.clim.cold*(1-coldR)*cls.coldPenalty;
      climMul *= 1 - co.clim.heat*(1-heatR)*cls.heatPenalty;
      // Parasita: sem Calor 2 / Frio 2 nao se reproduz em pais quente / frio
      if(cls.climateLock && climateBlocked(co, state)) climMul = 0;
      // com a cura em distribuicao, os tratados quase nao transmitem mais
      const pressure = (cls.baseSpread + d.infectivity) * climMul * (curing ? BALANCE.curingSpreadMul : 1);
      // crescimento LOGISTICO: taxa diaria * suscetiveis restantes. O piso evita
      // que os ultimos saudaveis do pais fiquem para sempre fora do alcance
      // (desligado durante a cura, senao os ultimos casos nunca acabam).
      const frac = co.healthy / Math.max(1, co.total);
      const susceptible = co.healthy>0 ? (curing ? frac : Math.max(BALANCE.minSusceptible, frac)) : 0;
      // acumulador fracionario: infeccoes <1/dia nao se perdem no arredondamento,
      // entao o surto cresce suave desde 1 pessoa (sem travar nem explodir).
      co._acc = (co._acc||0) + co.infected * pressure * BALANCE.growthMul * susceptible;
      let newInf = Math.floor(co._acc);
      co._acc -= newInf;
      newInf = Math.min(co.healthy, Math.max(0, newInf));
      // mortes e curas tambem usam acumulador: sem isso, poucos infectados
      // arredondam para 0 mortes/curas por dia e o pais fica travado para sempre
      // sem saudaveis no pais, os ultimos infectados morrem num ritmo minimo (senao
      // letalidade baixa deixaria a partida esperando centenas de dias pelo fim)
      const deadMin = d.lethality>0 && co.healthy===0 ? BALANCE.deathMinSaturated : 0;
      co._accDead = (co._accDead||0) + Math.max(deadMin, co.infected * d.lethality * BALANCE.deathMul);
      const dead = Math.min(co.infected, Math.floor(co._accDead));
      co._accDead -= dead;
      let rec = 0;
      if(curing){  // cura distribuida, com um minimo diario para os ultimos casos sumirem
        co._accRec = (co._accRec||0) + Math.max(BALANCE.cureDeployMin, co.infected * deployRate);
        rec = Math.min(co.infected - dead, Math.floor(co._accRec));
        co._accRec -= rec;
      }
      co.healthy -= newInf;
      newCases += newInf;
      co.infected += newInf - rec - dead;
      if(co.infected<0) co.infected=0;
      co.recovered += rec;
      co.dead += dead;
      state.totalInfected += newInf;
      // deteccao: quanto mais grave, mais cedo o pais percebe o surto
      if(!co.detected && (co.infected+co.dead)/co.total > detectThr){ co.detected=true;
        events.push(mkEvent(state.day,'Surto detectado',`${co.name} confirmou um surto.`,'outbreak','high',co.iso3)); }
      fixInvariant(co);
    }
    // pais que detectou o surto vai fechando aeroporto, porto e fronteiras
    if(co.detected){
      detectedCount++;
      if(co.hasAir && co.airOpen && rnd()<closeChance){ co.airOpen=false;
        events.push(mkEvent(state.day,'Aeroporto fechado',`${co.name} suspendeu os voos internacionais.`,'closure','medium',co.iso3)); }
      if(co.hasSea && co.seaOpen && rnd()<closeChance){ co.seaOpen=false;
        events.push(mkEvent(state.day,'Porto fechado',`${co.name} fechou seus portos.`,'closure','medium',co.iso3)); }
      if(co.borders.length && co.landOpen && rnd()<closeChance){ co.landOpen=false;
        events.push(mkEvent(state.day,'Fronteiras restritas',`${co.name} restringiu as fronteiras terrestres.`,'closure','low',co.iso3)); }
    }
  }

  // rotas internacionais: terra (vizinhos), voo (aeroporto->aeroporto), mar (porto->porto)
  const flashes = [];           // movimentos REAIS processados neste ciclo (para animar)
  const reachable = c => c.infected===0 && c.healthy>0;
  const exportTo = (src, dst, mode) => {
    const seed0 = Math.min(dst.healthy, 5);  // chega pouca gente numa viagem
    dst.healthy -= seed0; dst.infected += seed0;
    state.totalInfected += seed0; newCases += seed0;
    flashes.push({ from:src.iso3, to:dst.iso3, mode });
    if(!dst.everInfected){ dst.everInfected=true; state._ptAcc = (state._ptAcc||0) + BALANCE.pointsPerCountry*cls.pointsMul;
      events.push(mkEvent(state.day,'Nova fronteira',`${src.name} exportou casos ${MODE_LABEL[mode]} para ${dst.name}.`,'route','medium',dst.iso3)); }
    else events.push(mkEvent(state.day,'Reinfeccao',`${dst.name} voltou a ter casos, vindos de ${src.name} ${MODE_LABEL[mode]}.`,'route','low',dst.iso3));
  };
  const airports = list.filter(c=>c.hasAir), ports = list.filter(c=>c.hasSea);
  const sources = list.filter(c=>c.infected>=BALANCE.exportMinInfected);
  for(const src of sources){
    const reach = Math.min(1, (src.infected/src.total)*20) * (curing ? BALANCE.curingSpreadMul : 1);
    for(const iso of src.borders){
      const dst = state.countries[iso];
      if(!dst || !reachable(dst)) continue;
      const closedMul = src.landOpen && dst.landOpen ? 1 : 0.25;  // fronteira restrita ainda vaza
      if(rnd() < BALANCE.landBase*reach*(1+d.land)*cls.landMul*closedMul) exportTo(src, dst, 'land');
    }
    if(src.hasAir && src.airOpen && rnd() < BALANCE.airBase*reach*(1+d.air)*cls.airMul){
      const opts = airports.filter(c=>c!==src && c.airOpen && reachable(c));
      if(opts.length) exportTo(src, opts[Math.floor(rnd()*opts.length)], 'air');
    }
    if(src.hasSea && src.seaOpen && rnd() < BALANCE.seaBase*reach*(1+d.sea)){
      const opts = ports.filter(c=>c!==src && c.seaOpen && reachable(c));
      if(opts.length) exportTo(src, opts[Math.floor(rnd()*opts.length)], 'sea');
    }
  }
  state._flashes = flashes;

  // estagios + totais
  let worldInfected=0, anyHealthy=false, worldAlive=0;
  for(const co of list){
    co.stage = deriveStage(co);
    worldInfected += co.infected; worldDead += co.dead;
    worldAlive += co.healthy + co.infected + co.recovered;
    if(co.healthy>0) anyHealthy=true;
  }
  // marco: todo mundo infectado (ainda falta eliminar os infectados para vencer)
  if(!anyHealthy && !state._allInfected){ state._allInfected=true;
    events.push(mkEvent(state.day,'Mundo infectado', d.lethality>0
      ? 'Não há mais ninguém saudável. Agora só falta não restar nenhum sobrevivente.'
      : 'Não há mais ninguém saudável, mas sem letalidade ninguém morre. Evolua sintomas letais para vencer.','milestone','high')); }

  // pontos de evolucao: renda diaria que cresce com a escala da epidemia
  // Parasita: com metade do mundo contaminado (infectados + mortos), ganha menos pontos
  let ptMul = cls.pointsMul;
  if(cls.lateHalfPointsMul && (worldInfected+worldDead)/Math.max(1,worldPop) >= 0.5){
    ptMul *= cls.lateHalfPointsMul;
    if(!state._halfWorld){ state._halfWorld=true;
      events.push(mkEvent(state.day,'Parasita enfraquecido','Metade do mundo foi contaminada. A partir de agora você ganha 30% menos pontos.','milestone','high')); }
  }
  state._ptAcc = (state._ptAcc||0) + BALANCE.pointsLogMul*Math.log10(1+worldInfected)*ptMul;
  const earned = Math.floor(state._ptAcc);
  if(earned>0){ state.points += earned; state._ptAcc -= earned; }

  // surto isolado: varios dias seguidos sem contagio relevante. Com a pesquisa em
  // andamento, poucos casos por dia (menos de 1 por milhao de vivos) tambem contam,
  // senao um punhado de casos no fim da partida a deixaria parada por centenas de dias.
  const stagnant = newCases===0 || (state.cure>0 && newCases < worldAlive*1e-6);
  state._idle = stagnant ? (state._idle||0) + 1 : 0;
  const isolated = state._idle >= BALANCE.idleDays;
  if(state._idle === BALANCE.idleDays && !curing)
    events.push(mkEvent(state.day,'Surto isolado','O patógeno parou de se espalhar. A pesquisa da cura acelerou.','research','high'));

  // cura: comeca quando algum pais detecta o surto
  // (Parasita: surto isolado tambem dispara a pesquisa, senao um paciente zero travado pelo clima nunca terminaria a partida)
  if(!curing && (detectedCount>0 || state.cure>0 || (isolated && cls.climateLock))){
    const deadPct = worldDead/Math.max(1,worldPop);
    const gain = BALANCE.cureBaseDaily * cls.cureMul
      * (1 - Math.min(BALANCE.cureSlowCap, d.cureSlow))
      * (1 + d.severity)                   // doenca grave assusta e acelera a pesquisa
      * (1 + detectedCount/30)             // mais paises pesquisando
      * (1 - Math.min(0.9, deadPct*3))     // mortes em massa desmontam os laboratorios
      * (isolated ? BALANCE.idleCureMul : 1);
    const before=state.cure;
    state.cure = Math.min(100, state.cure + gain);
    if(before===0) events.push(mkEvent(state.day,'Pesquisa iniciada','Laboratórios começaram a estudar o patógeno.','research','medium'));
    if(before<25 && state.cure>=25) events.push(mkEvent(state.day,'Mobilização internacional','Laboratórios uniram forças pela cura.','mobilization','medium'));
    if(before<60 && state.cure>=60) events.push(mkEvent(state.day,'Avanço na pesquisa','A cura atingiu 60%.','research','high'));
    if(state.cure>=100) events.push(mkEvent(state.day,'Cura concluída','A cura começou a ser distribuída. Os infectados serão curados aos poucos.','milestone','high'));
  }

  // condicoes de fim. Vitoria: ninguem vivo (nem saudavel, nem infectado, nem curado).
  // Derrota: acabaram os infectados e ainda ha sobreviventes. A cura pronta NAO encerra.
  if(worldAlive===0){ state.status='won';
    events.push(mkEvent(state.day,'Humanidade extinta','Não restou nenhum sobrevivente. Você venceu!','milestone','high')); }
  else if(worldInfected===0){ state.status='lost';
    events.push(curing
      ? mkEvent(state.day,'Patógeno erradicado','A cura salvou os últimos infectados. Você perdeu.','milestone','high')
      : mkEvent(state.day,'Patógeno extinto','Sem infectados restantes. Você perdeu.','milestone','high')); }

  // historico
  state.history.push({ day:state.day, infected:worldInfected, dead:worldDead, cure:state.cure });
  if(state.history.length>400) state.history.shift();

  state.rngState = rng;
  state.worldInfected = worldInfected;
  state.worldDead = worldDead;
  return { state, events };
}

function fixInvariant(co){
  co.healthy=Math.max(0,co.healthy); co.infected=Math.max(0,co.infected);
  co.recovered=Math.max(0,co.recovered); co.dead=Math.max(0,co.dead);
  const sum=co.healthy+co.infected+co.recovered+co.dead;
  const diff=co.total-sum;
  if(diff!==0) co.healthy=Math.max(0,co.healthy+diff); // reconcilia no grupo saudavel
}

function mkEvent(day,title,desc,cat,prio,iso){ return { id:`${day}-${title}-${iso||''}`, day, title, desc, cat, prio, iso:iso||null, read:false }; }

function cloneState(s){
  const cs={}; for(const k in s.countries){ cs[k]={...s.countries[k] }; }
  return { ...s, countries:cs, purchased:[...s.purchased], history:[...s.history] };
}

// Cria o estado inicial (puro em relacao a geografia passada).
function createGame({ name, diseaseClass, origin, seed, geo }){
  const countries={};
  for(const f of geo){
    const iso=f.iso3;
    const acc=ACCESS[iso]||{ voo:false, mar:false };
    const total=POP[iso]||DEF_POP;
    countries[iso]={ iso3:iso, name:f.name, total, healthy:total, infected:0, recovered:0, dead:0,
      detected:false, everInfected:false, stage:'none',
      hasAir:!!acc.voo, hasSea:!!acc.mar, airOpen:true, seaOpen:true, landOpen:true,
      clim:climateFor(f.centroid[1]), borders:f.borders };
  }
  const o=countries[origin]||countries[geo[0].iso3];
  const seed0=1; o.infected=seed0; o.healthy-=seed0; o.stage='first'; o.everInfected=true;   // paciente zero = 1 pessoa
  return {
    schema:2, seed, rngState:seedToState(seed), day:0, speed:0, status:'running',
    diseaseName:name||'Patogeno-X', diseaseClass,
    countries, purchased:[...(CLASSES[diseaseClass].startWith||[])], points:BALANCE.startPoints, totalInfected:seed0,
    cure:0, history:[], worldInfected:seed0, worldDead:0,
  };
}

// =================== (3) RENDER DO MAPA (D3) ===================
let GEO=null, projection=null, pathGen=null, svgSel=null, gSel=null;
let routeLayer=null, vehicleLayer=null, markerLayer=null, projCentroid={};

async function loadGeo(){
  const res = await fetch('Js/JsInfect/world.geojson');
  const gj = await res.json();
  const feats = gj.features.map(f=>{
    const c = d3.geoCentroid(f);
    // mantem um Feature GeoJSON VALIDO (type + geometry) para o d3.geoPath,
    // anexando os campos extras do jogo.
    return { type:'Feature', properties:f.properties, geometry:f.geometry,
      iso3:f.properties.iso3, name:ACCESS[f.properties.iso3]?.nome || f.properties.name, centroid:c };
  });
  const borders = computeBorders(feats);
  for(const f of feats) f.borders = [...(borders[f.iso3]||[])];
  return feats;
}

// Fronteiras terrestres REAIS: dois paises sao vizinhos se dividem vertices
// no geojson (as divisas do Natural Earth usam os mesmos pontos dos dois lados).
function computeBorders(feats){
  const byPoint = new Map();
  for(const f of feats){
    const polys = f.geometry.type==='Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for(const poly of polys) for(const ring of poly) for(const p of ring){
      const k = p[0].toFixed(3)+','+p[1].toFixed(3);
      if(!byPoint.has(k)) byPoint.set(k, new Set());
      byPoint.get(k).add(f.iso3);
    }
  }
  const adj = {};
  for(const set of byPoint.values()){
    if(set.size<2) continue;
    for(const a of set) for(const b of set) if(a!==b) (adj[a] ??= new Set()).add(b);
  }
  return adj;
}

function drawMap(onSelect){
  svgSel=d3.select('#map');
  // Coordenadas internas FIXAS: o viewBox nao depende do tamanho em pixels do
  // container (que pode ser 0 no instante em que a tela aparece). O CSS escala.
  const W=960, H=500;
  svgSel.attr('viewBox',`0 0 ${W} ${H}`).attr('preserveAspectRatio','xMidYMid meet');
  projection=d3.geoNaturalEarth1().fitSize([W,H],{type:'FeatureCollection',features:GEO});
  pathGen=d3.geoPath(projection);
  svgSel.selectAll('*').remove();
  gSel=svgSel.append('g');

  gSel.selectAll('path').data(GEO).enter().append('path')
    .attr('d', d=>pathGen(d))
    .attr('class','country')
    .attr('data-iso3', d=>d.iso3)
    .attr('fill', STAGE_COLORS.none)
    .on('click',(e,d)=>onSelect(d.iso3))
    .on('mousemove',(e,d)=>showTip(e,d.name))
    .on('mouseleave',hideTip);

  // cache dos centroides PROJETADOS (x,y) por iso3
  projCentroid = {};
  for(const f of GEO){ projCentroid[f.iso3] = projection(f.centroid); }

  // marcadores de aeroporto/porto, rotas e veiculos por cima dos paises
  markerLayer = gSel.append('g').attr('class','markers');
  for(const f of GEO){
    const acc=ACCESS[f.iso3]; const p=projCentroid[f.iso3];
    if(!acc || !p) continue;
    if(acc.voo) markerLayer.append('text').attr('class','marker marker-air').attr('data-iso3',f.iso3)
      .attr('x',p[0]-(acc.mar?4:0)).attr('y',p[1]).text('✈');
    if(acc.mar) markerLayer.append('text').attr('class','marker marker-sea').attr('data-iso3',f.iso3)
      .attr('x',p[0]+(acc.voo?4:0)).attr('y',p[1]).text('⚓');
  }
  routeLayer = gSel.append('g').attr('class','routes');
  vehicleLayer = gSel.append('g').attr('class','vehicles');

  const zoom=d3.zoom().scaleExtent([1,8]).on('zoom',ev=>gSel.attr('transform',ev.transform));
  svgSel.call(zoom);
}

// Apaga os marcadores de aeroportos/portos que ja fecharam.
function paintMarkers(state){
  if(!markerLayer) return;
  markerLayer.selectAll('.marker-air').classed('closed', function(){ return !state.countries[this.dataset.iso3]?.airOpen; });
  markerLayer.selectAll('.marker-sea').classed('closed', function(){ return !state.countries[this.dataset.iso3]?.seaOpen; });
}

// Caminho em arco (quadratico) entre dois pontos projetados, com curvatura
// proporcional a distancia (da sensacao de rota sobre o globo).
function arcPath(a,b){
  if(!a||!b) return '';
  const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
  const dx=b[0]-a[0], dy=b[1]-a[1];
  const dist=Math.hypot(dx,dy)||1;
  // ponto de controle deslocado perpendicularmente
  const nx=-dy/dist, ny=dx/dist;
  const lift=Math.min(60, dist*0.25);
  return `M${a[0]},${a[1]} Q${mx+nx*lift},${my+ny*lift} ${b[0]},${b[1]}`;
}

// Anima um veiculo (aviao/navio/ponto) ao longo da rota de cada export REAL.
function animateFlashes(flashes){
  if(!vehicleLayer || !flashes || !flashes.length) return;
  for(const fl of flashes){
    const a=projCentroid[fl.from], b=projCentroid[fl.to];
    if(!a||!b) continue;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', arcPath(a,b));
    path.setAttribute('class','route route-'+fl.mode+' route-live');
    routeLayer.node().appendChild(path);
    const len=path.getTotalLength();

    const dot=document.createElementNS('http://www.w3.org/2000/svg','text');
    dot.setAttribute('class','vehicle');
    dot.textContent = fl.mode==='air' ? '✈' : fl.mode==='sea' ? '⛴' : '●'; // aviao / navio / terra
    vehicleLayer.node().appendChild(dot);

    const dur=1600, t0=performance.now();
    function step(now){
      const t=Math.min(1,(now-t0)/dur);
      const pt=path.getPointAtLength(t*len);
      dot.setAttribute('x', pt.x); dot.setAttribute('y', pt.y);
      dot.setAttribute('opacity', (1 - Math.abs(t-0.5)*1.2).toFixed(2));
      if(t<1){ requestAnimationFrame(step); }
      else { dot.remove(); path.remove(); }
    }
    requestAnimationFrame(step);
  }
}

function paintMap(state){
  if(!gSel) return;
  gSel.selectAll('path.country').attr('fill', d=>STAGE_COLORS[state.countries[d.iso3]?.stage||'none']);
  paintMarkers(state);
}

let tipEl=null;
function showTip(e,name){ if(!tipEl){tipEl=document.createElement('div');tipEl.className='map-tip';document.body.appendChild(tipEl);}
  tipEl.textContent=name; tipEl.style.left=(e.clientX+12)+'px'; tipEl.style.top=(e.clientY+12)+'px'; tipEl.style.display='block'; }
function hideTip(){ if(tipEl) tipEl.style.display='none'; }

// =================== (4) UI ===================
const fmt=n=>new Intl.NumberFormat('pt-BR').format(Math.round(n));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let GAME=null, selectedIso=null, chosenClass='virus', loopTimer=null;

function el(id){ return document.getElementById(id); }

// ---------- vitorias por classe (liberam o Parasita) ----------
const WINS_KEY='pacienteZeroVitorias';
function loadWins(){ try{ return JSON.parse(localStorage.getItem(WINS_KEY))||{}; }catch(e){ return {}; } }
function isUnlocked(key){ const need=CLASSES[key].unlock; if(!need) return true; const w=loadWins(); return need.every(k=>w[k]); }
// Registra a vitoria; devolve as classes que ficaram liberadas por causa dela.
function recordWin(key){
  const lockedBefore=Object.keys(CLASSES).filter(k=>!isUnlocked(k));
  const w=loadWins(); w[key]=true;
  try{ localStorage.setItem(WINS_KEY, JSON.stringify(w)); }catch(e){}
  return lockedBefore.filter(k=>isUnlocked(k));
}

function buildSetup(){
  // cards de classe
  const wins=loadWins();
  if(!isUnlocked(chosenClass)) chosenClass='virus';
  const grid=el('classGrid'); grid.innerHTML='';
  for(const [key,c] of Object.entries(CLASSES)){
    const locked=!isUnlocked(key);
    const card=document.createElement('button');
    card.type='button';
    card.className='class-card'+(locked?' locked':'')+(key===chosenClass?' sel':'');
    const badge = locked ? '<span class="lock-badge"><i class="fas fa-lock"></i> Bloqueado</span>'
      : wins[key] ? '<span class="win-badge"><i class="fas fa-trophy"></i> Vencido</span>' : '';
    const desc = locked
      ? `Vença com ${c.unlock.map(k=>CLASSES[k].label).join(', ')} para liberar (${c.unlock.filter(k=>wins[k]).length}/${c.unlock.length}).`
      : c.desc;
    card.innerHTML=`<h5>${c.label}${badge}</h5><p>${desc}</p>`;
    if(!locked) card.onclick=()=>{ chosenClass=key; buildSetup(); };
    grid.appendChild(card);
  }
  // paises de origem
  if(GEO){
    const sel=el('originSelect');
    if(sel.options.length===0){
      const sorted=[...GEO].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
      for(const f of sorted){ const op=document.createElement('option'); op.value=f.iso3; op.textContent=f.name;
        op.dataset.name=f.name; op.dataset.climate=climateKind({ clim:climateFor(f.centroid[1]) });
        if(f.iso3==='BRA') op.selected=true; sel.appendChild(op); }
    }
    // Parasita so pode comecar em pais temperado (em quente/frio o paciente zero nao se reproduz)
    const onlyMild=!!CLASSES[chosenClass].climateLock;
    for(const op of sel.options){
      const bad = onlyMild && op.dataset.climate!=='mild';
      op.disabled=bad;
      op.textContent = op.dataset.name + (bad ? ` (${CLIMATE_LABEL[op.dataset.climate].toLowerCase()})` : '');
    }
    if(sel.selectedOptions[0]?.disabled) sel.value = [...sel.options].find(o=>o.value==='USA'&&!o.disabled)?.value || [...sel.options].find(o=>!o.disabled).value;
    el('originHint').classList.toggle('hidden',!onlyMild);
  }
}

function startGame(){
  const name=el('diseaseName').value.trim()||'Patogeno-X';
  const origin=el('originSelect').value;
  const seed=(Date.now()&0xffffffff)||1;
  GAME=createGame({ name, diseaseClass:chosenClass, origin, seed, geo:GEO });
  enterGame(1);
}

// Monta a tela de jogo a partir do GAME atual (novo ou carregado).
function enterGame(startSpeed){
  el('setup').classList.add('hidden');
  el('game').classList.remove('hidden');
  window.scrollTo(0,0);  // a tela inicial rola; o jogo comeca sempre no topo
  el('hudDisease').textContent=`${GAME.diseaseName} - ${CLASSES[GAME.diseaseClass].label}`;
  buildLegend();
  // o mapa so desenha agora que o container tem tamanho
  drawMap(selectCountry);
  paintMap(GAME);
  refreshHud();
  renderSide();   // sem pais selecionado, o painel abre na visao global
  updateEvBadge();
  if(GAME.status!=='running'){ setSpeed(0); showGameOver(); }
  else setSpeed(startSpeed ?? 0);
  save();
}

// Carrega a partida salva (localStorage) e entra no jogo, pausado.
function continueGame(){
  const data=load();
  if(!isValidSave(data)){ clearSave(); el('continueBtn').classList.add('hidden'); return; }
  GAME=data.g;
  if(!GAME._events) GAME._events=[];
  selectedIso=data.sel||null;
  enterGame(0);
  if(selectedIso) selectCountry(selectedIso);
}

function buildLegend(){
  const l=el('legend'); l.innerHTML='';
  for(const [k,label] of Object.entries(STAGE_LABELS)){
    const d=document.createElement('div');
    d.innerHTML=`<i style="background:${STAGE_COLORS[k]}"></i>${label}`;
    l.appendChild(d);
  }
}

function selectCountry(iso){
  selectedIso=iso;
  gSel.selectAll('path.country').classed('sel',d=>d.iso3===iso);
  renderSide();
}

function accessText(has, open){ return !has ? 'Não possui' : open ? 'Aberto' : 'Fechado'; }

// Resumo do mundo mostrado quando nenhum pais esta selecionado.
function renderWorldSide(){
  const list=Object.values(GAME.countries);
  const acc={ total:0, healthy:0, infected:0, recovered:0, dead:0 };
  let infectedCountries=0, airClosed=0, airTotal=0, seaClosed=0, seaTotal=0, landClosed=0, landTotal=0;
  for(const co of list){
    acc.total+=co.total; acc.healthy+=co.healthy; acc.infected+=co.infected;
    acc.recovered+=co.recovered; acc.dead+=co.dead;
    if(co.infected>0) infectedCountries++;
    if(co.hasAir){ airTotal++; if(!co.airOpen) airClosed++; }
    if(co.hasSea){ seaTotal++; if(!co.seaOpen) seaClosed++; }
    if(co.borders.length){ landTotal++; if(!co.landOpen) landClosed++; }
  }
  const stage=deriveStage({ ...acc, infected:acc.infected });
  el('cName').textContent='Visão global';
  el('cSub').textContent=`${list.length} países`;
  const sit=el('cSituation');
  sit.innerHTML=`<span class="dot" style="background:${STAGE_COLORS[stage]}"></span>${STAGE_LABELS[stage]}`;
  sit.style.borderColor=STAGE_COLORS[stage];
  el('cTotal').textContent=fmt(acc.total);
  el('cHealthy').textContent=fmt(acc.healthy);
  el('cInfected').textContent=fmt(acc.infected);
  el('cRecovered').textContent=fmt(acc.recovered);
  el('cDead').textContent=fmt(acc.dead);
  el('cAffected').textContent=(((acc.infected+acc.dead)/Math.max(1,acc.total))*100).toFixed(2)+'%';
  el('cDetectedLbl').textContent='Países com casos';
  el('cDetected').textContent=`${infectedCountries} de ${list.length}`;
  el('cAirLbl').textContent='Aeroportos fechados';
  el('cAir').textContent=`${airClosed} de ${airTotal}`;
  el('cSeaLbl').textContent='Portos fechados';
  el('cSea').textContent=`${seaClosed} de ${seaTotal}`;
  el('cLandLbl').textContent='Fronteiras restritas';
  el('cLand').textContent=`${landClosed} de ${landTotal}`;
  el('cClimateRow').classList.add('hidden');
}

const CLIMATE_LABEL={ hot:'Quente', cold:'Frio', mild:'Temperado' };

function renderSide(){
  const co=selectedIso?GAME.countries[selectedIso]:null;
  // o X so aparece quando ha um pais selecionado (ele volta para a visao global)
  el('closeSide').classList.toggle('hidden',!co);
  if(!co){ renderWorldSide(); return; }
  el('cDetectedLbl').textContent='Detectado';
  el('cAirLbl').textContent='Aeroporto';
  el('cSeaLbl').textContent='Porto';
  el('cLandLbl').textContent='Fronteiras';
  el('cName').textContent=co.name;
  el('cSub').textContent=co.iso3;
  const sit=el('cSituation');
  sit.innerHTML=`<span class="dot" style="background:${STAGE_COLORS[co.stage]}"></span>${STAGE_LABELS[co.stage]}`;
  sit.style.borderColor=STAGE_COLORS[co.stage];
  el('cTotal').textContent=fmt(co.total);
  el('cHealthy').textContent=fmt(co.healthy);
  el('cInfected').textContent=fmt(co.infected);
  el('cRecovered').textContent=fmt(co.recovered);
  el('cDead').textContent=fmt(co.dead);
  el('cAffected').textContent=(((co.infected+co.dead)/co.total)*100).toFixed(2)+'%';
  el('cDetected').textContent=co.detected?'Sim':'Não';
  el('cClimateRow').classList.remove('hidden');
  const blockedHere = CLASSES[GAME.diseaseClass].climateLock && climateBlocked(co, GAME);
  el('cClimate').textContent = CLIMATE_LABEL[climateKind(co)] + (blockedHere
    ? ` · requer ${climateKind(co)==='hot'?'Calor 2':'Frio 2'}` : '');
  el('cClimate').style.color = blockedHere ? 'var(--yellow)' : '';
  el('cAir').textContent=accessText(co.hasAir, co.airOpen);
  el('cSea').textContent=accessText(co.hasSea, co.seaOpen);
  el('cLand').textContent=co.borders.length
    ? `${co.borders.length} ${co.borders.length>1?'países':'país'} (${co.landOpen?'abertas':'restritas'})`
    : 'Nenhuma';
}

function refreshHud(){
  el('mDay').textContent=GAME.day;
  el('mInfected').textContent=fmt(GAME.worldInfected);
  el('mDead').textContent=fmt(GAME.worldDead);
  el('mCure').textContent=GAME.cure.toFixed(1)+'%';
  el('mPoints').textContent=GAME.points;
}

// =================== (5) LOOP DE TEMPO (fixed timestep, nao depende de FPS) ===================
const SPEED_MS={1:2500,2:1500,3:900,5:500};
function setSpeed(sp){
  GAME.speed=sp;
  document.querySelectorAll('.speed-btn').forEach(b=>b.classList.toggle('active',+b.dataset.speed===sp));
  if(loopTimer){ clearInterval(loopTimer); loopTimer=null; }
  if(sp>0){ loopTimer=setInterval(stepDay, SPEED_MS[sp]); }
}

function stepDay(){
  if(!GAME || GAME.status!=='running') return;
  const { state, events } = tick(GAME);
  GAME = state;
  if(!GAME._events) GAME._events=[];
  for(const ev of events){ GAME._events.unshift(ev); if(ev.prio!=='low') toast(ev); }
  if(GAME._events.length>200) GAME._events.length=200;
  paintMap(GAME);
  animateFlashes(GAME._flashes);
  refreshHud();
  renderSide();   // atualiza o pais selecionado ou o resumo global
  updateEvBadge();
  if(openPanel) renderPanel(openPanel); // mantem o painel aberto vivo
  if(GAME.status!=='running'){
    // a vitoria so conta quando acontece jogando (importar um save vencido nao libera nada)
    const unlocked = GAME.status==='won' ? recordWin(GAME.diseaseClass) : [];
    setSpeed(0); showGameOver(unlocked);
  }
  save();
}

function updateEvBadge(){
  const n=(GAME._events||[]).filter(e=>!e.read).length;
  const b=el('evBadge'); b.textContent=n; b.classList.toggle('hidden',n===0);
}

function toast(ev){
  const wrap=el('toasts');
  const t=document.createElement('div');
  t.className='toast '+ev.prio;
  t.innerHTML=`<b>${esc(ev.title)}</b><div style="color:var(--text2);font-size:.76rem">${esc(ev.desc)}</div>`;
  wrap.appendChild(t);
  // limita a 4 toasts simultaneos (evita flood em velocidade alta)
  while(wrap.children.length>4) wrap.removeChild(wrap.firstChild);
  setTimeout(()=>t.remove(), 4200);
}

// =================== PAINEIS (bottom nav) ===================
// Doenca/Transmissao/Sintomas/Habilidades dividem a mesma janela com abas,
// a colmeia de evolucoes, o quadro de detalhes e o rodape com os indicadores.
const EVO_TABS=[['disease','Doença'],['transmission','Transmissão'],['symptoms','Sintomas'],['abilities','Habilidades']];
const TREE_INFO={
  transmission:{ title:'Transmissão', text:'Use pontos para abrir novas vias de contágio. Cada via também favorece um tipo de rota: aérea, marítima ou terrestre.' },
  symptoms:    { title:'Sintomas',    text:'Sintomas aumentam o contágio, a gravidade e a letalidade. Quanto mais grave, mais cedo os países detectam o surto e fecham aeroportos e portos.' },
  abilities:   { title:'Habilidades', text:'Adapte o patógeno ao clima e atrase a cura. Comece pelos nós da esquerda.' },
};
const EFF_LABELS={ infectivity:'Infectividade', severity:'Gravidade', lethality:'Letalidade', air:'Rotas aéreas',
  sea:'Rotas marítimas', land:'Fronteiras terrestres', coldResist:'Resistência ao frio', heatResist:'Resistência ao calor',
  cureSlow:'Atraso da cura' };
// geometria da colmeia (hexagonos com topo plano; colunas impares descem meia linha)
const HEX={ w:70, h:61, dx:76, dy:72 };

let openPanel=null, selectedEvo=null;
function openModal(panel){ openPanel=panel; selectedEvo=null; el('modal').classList.remove('hidden'); renderPanel(panel); }
function closeModal(){ openPanel=null; el('modal').classList.add('hidden'); }

// So troca o HTML quando ele muda de verdade. O painel e redesenhado a cada dia;
// recriar os botoes sem necessidade fazia cliques se perderem em velocidade alta.
function setHTML(node, html){
  if(node._html===html) return;
  node.innerHTML=html; node._html=html;
}

// Icone de no: classe do Font Awesome ("fa-...") ou emoji.
// Rato desenhado em SVG (o Font Awesome gratuito nao tem rato). Usa currentColor,
// entao muda de cor junto com os outros icones em cada estado do no.
const RAT_SVG='<svg viewBox="0 0 32 24" aria-hidden="true"><ellipse cx="13.5" cy="14.5" rx="9" ry="6"/>'+
  '<path d="M18.5 9.5Q24 8.5 29.5 13.6Q29.6 15.3 27.5 15.8L20.5 19Z"/><circle cx="21" cy="8.8" r="2.7"/>'+
  '<path d="M5.5 15.5Q0.8 16.5 1.8 20.3Q3 23.3 8.5 22.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'+
  '<path d="M8.5 19h2.4v3h-2.4zM16 19h2.4v3H16z"/></svg>';

// Icone de no: classe do Font Awesome ("fa-..."), ou "svg:rato-p|m|g" (rato pequeno/medio/grande).
function iconHTML(icon){
  if(icon.startsWith('svg:')) return `<span class="svg-icon ${icon.slice(4)}">${RAT_SVG}</span>`;
  return `<i class="fas ${icon}"></i>`;
}

function renderPanel(panel){
  const body=el('modalBody'), title=el('modalTitle');
  const tabbed=EVO_TABS.some(([k])=>k===panel);
  el('modalTabs').classList.toggle('hidden',!tabbed);
  el('modalFoot').classList.toggle('hidden',!tabbed);
  el('modal').querySelector('.modal-box').classList.toggle('wide',tabbed);
  if(tabbed){
    setHTML(el('modalTabs'), EVO_TABS.map(([k,l])=>`<button class="mtab${k===panel?' active':''}" data-tab="${k}">${l}</button>`).join(''));
    setHTML(el('modalFoot'), statsFooter());
  }
  if(panel==='disease'){ title.textContent='Doença';
    const d=diseaseStats(GAME), cls=CLASSES[GAME.diseaseClass];
    const cos=Object.values(GAME.countries);
    setHTML(body,
      `<div class="row"><span>Classe</span><b>${cls.label}</b></div>`+
      `<p class="empty-note" style="padding:4px 0;text-align:left">${cls.desc}</p>`+
      `<div class="row"><span>Infectados (mundo)</span><b>${fmt(GAME.worldInfected)}</b></div>`+
      `<div class="row"><span>Mortos (mundo)</span><b>${fmt(GAME.worldDead)}</b></div>`+
      `<div class="row"><span>Países atingidos</span><b>${cos.filter(c=>c.everInfected).length} / ${cos.length}</b></div>`+
      `<div class="row"><span>Aeroportos fechados</span><b>${cos.filter(c=>c.hasAir&&!c.airOpen).length} / ${cos.filter(c=>c.hasAir).length}</b></div>`+
      `<div class="row"><span>Portos fechados</span><b>${cos.filter(c=>c.hasSea&&!c.seaOpen).length} / ${cos.filter(c=>c.hasSea).length}</b></div>`+
      statBar('Rotas aéreas (bônus)',d.air/2)+statBar('Rotas marítimas (bônus)',d.sea/2)+statBar('Fronteiras terrestres (bônus)',d.land/2)+
      climBar('Adaptação ao frio',d.coldResist,cls.coldResistCap)+climBar('Adaptação ao calor',d.heatResist,cls.heatResistCap));
  } else if(panel==='cure'){ title.textContent='Cura';
    const cos=Object.values(GAME.countries);
    const cured=cos.reduce((a,c)=>a+c.recovered,0);
    setHTML(body, statBar(GAME.cure>=100?'Cura concluída - em distribuição':'Progresso da cura',GAME.cure/100)+
      `<div class="row"><span>Países pesquisando</span><b>${cos.filter(c=>c.detected).length}</b></div>`+
      `<div class="row"><span>Curados (mundo)</span><b>${fmt(cured)}</b></div>`+
      `<p class="empty-note">Ninguém se recupera sozinho. A pesquisa começa quando algum país detecta o surto e acelera com a gravidade, com o número de países pesquisando e quando o patógeno para de se espalhar. Ao chegar a 100%, a cura é distribuída e salva os infectados aos poucos: se todos forem curados, você perde. As habilidades "Remédios" e "Blindagem genética" atrasam a pesquisa e a distribuição.</p>`);
  } else if(panel==='events'){ title.textContent='Eventos';
    (GAME._events||[]).forEach(e=>e.read=true); updateEvBadge();
    const evs=GAME._events||[];
    setHTML(body, evs.length? evs.map(e=>
      `<div class="event-item ${esc(e.prio)}"><div class="eday">Dia ${esc(e.day)}</div><div class="et">${esc(e.title)}</div><div class="ed">${esc(e.desc)}</div></div>`
    ).join('') : '<p class="empty-note">Nenhum evento ainda.</p>');
  } else { // arvores: transmission / symptoms / abilities
    title.textContent='Evolução';
    // colmeia e detalhe em caixas separadas: mudar o botao nao recria os hexagonos
    setHTML(body, `<div class="evo-wrap" data-tree="${panel}"><div class="tree-box" id="evoTree"></div><div class="detail-box" id="evoDetail"></div></div>`);
    setHTML(el('evoTree'), renderTree(panel));
    setHTML(el('evoDetail'), renderEvoDetail(panel));
  }
}

function statBar(label,val){
  const pct=Math.min(100,Math.max(0,val*100));
  return `<div class="stat-line"><div class="lab"><span>${label}</span><span>${pct.toFixed(0)}%</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
}

// Barra de adaptacao ao clima: mostra o valor EFETIVO (limitado pelo teto da
// classe) e avisa quando a classe nunca chega aos 100%.
function climBar(label,val,cap){
  const max = cap ?? 1;
  const eff = Math.min(max, val);
  return statBar(max<1 ? `${label} (máx. ${(max*100).toFixed(0)}%)` : label, eff);
}

function statsFooter(){
  const d=diseaseStats(GAME);
  const mini=(label,val,cls)=>{ const pct=Math.min(100,val*100);
    return `<div class="foot-stat"><span>${label}</span><div class="bar ${cls}"><i style="width:${pct}%"></i></div></div>`; };
  return `<div class="foot-pts"><i class="fas fa-dna"></i><span>Pontos</span><b>${GAME.points}</b></div>`+
    mini('Infectividade',d.infectivity,'bar-inf')+mini('Gravidade',d.severity,'bar-sev')+mini('Letalidade',d.lethality,'bar-let');
}

function evoState(e){
  if(!allowedFor(e, GAME.diseaseClass)) return 'blocked';
  if(GAME.purchased.includes(e.id)) return 'bought';
  if(!reqOk(e,GAME) || !cutReady(e,GAME)) return 'locked';
  return GAME.points>=costOf(e,GAME) ? 'avail' : 'poor';
}

function hexPos(e){ return { x:e.col*HEX.dx, y:e.row*HEX.dy + (e.col%2 ? HEX.dy/2 : 0) }; }

function renderTree(tree){
  const nodes=EVOLUTIONS[tree];
  const W=Math.max(...nodes.map(e=>hexPos(e).x))+HEX.w, H=Math.max(...nodes.map(e=>hexPos(e).y))+HEX.h;
  const center=e=>{ const p=hexPos(e); return [p.x+HEX.w/2, p.y+HEX.h/2]; };
  let lines='';
  for(const e of nodes) for(const r of e.req||[]){
    const a=center(EVO_BY_ID[r]), b=center(e);
    const on=GAME.purchased.includes(r);
    lines+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${on?'on':''}"/>`;
  }
  const hexes=nodes.map(e=>{ const p=hexPos(e);
    return `<button class="hex st-${evoState(e)}${e.id===selectedEvo?' sel':''}" data-pick="${e.id}" title="${e.name}"
      style="left:${p.x}px;top:${p.y}px"><span class="hex-in">${iconHTML(e.icon)}</span></button>`; }).join('');
  return `<div class="tree" style="width:${W}px;height:${H}px"><svg class="tree-lines" width="${W}" height="${H}">${lines}</svg>${hexes}</div>`;
}

function renderEvoDetail(tree){
  const e=selectedEvo && EVO_BY_ID[selectedEvo]?.tree===tree ? EVO_BY_ID[selectedEvo] : null;
  if(!e){ const info=TREE_INFO[tree];
    return `<div class="evo-detail"><h4>${info.title}</h4><p>${info.text}</p><p class="hint">Toque em um hexágono para ver os detalhes.</p></div>`; }
  const st=evoState(e), cost=costOf(e,GAME);
  const effs=Object.entries(e.eff).map(([k,v])=>`<li>${EFF_LABELS[k]} <b>+${Math.round(v*100)}%</b></li>`).join('')
    + (e.cureCut ? `<li>Progresso da cura <b>−${e.cureCut}%</b> (uma vez)</li>` : '');
  const req=(e.req ? `<p class="req ${st==='locked'&&!reqOk(e,GAME)?'bad':''}">Requer um destes: ${e.req.map(r=>EVO_BY_ID[r].name).join(', ')}</p>` : '')
    + (e.cureCut && !cutReady(e,GAME) ? `<p class="req bad">${GAME.cure>=100?'A cura já foi concluída.':'Só pode ser usado com a pesquisa da cura em andamento.'}</p>` : '');
  const cls=CLASSES[GAME.diseaseClass];
  const action = st==='blocked'
    ? `<p class="req bad"><i class="fas fa-lock"></i> Indisponível para ${cls.label}: só evolui ${cls.lines.map(l=>LINE_NAMES[l]).join(' e ')}.</p>`
    : st==='bought' ? `<span class="owned">Adquirido</span>`
    : `<button class="btn btn-primary" data-evo="${e.id}" ${st==='avail'?'':'disabled'}>Evoluir · ${cost} pts</button>`;
  return `<div class="evo-detail"><h4>${iconHTML(e.icon)} ${e.name}</h4><p>${e.desc}</p><ul>${effs}</ul>${req}${action}</div>`;
}

function buyEvo(id){
  const e=EVO_BY_ID[id]; if(!e) return;
  if(evoState(e)!=='avail') return;
  GAME.points-=costOf(e,GAME);
  GAME.purchased.push(id);
  if(e.cureCut) GAME.cure=Math.max(0, GAME.cure-e.cureCut);
  refreshHud();
  if(openPanel) renderPanel(openPanel);
  save();
}

// =================== FIM DE JOGO ===================
// Classificacao da vitoria pela rapidez (vitorias simuladas terminam entre ~480 e ~700 dias).
const WIN_RANKS=[ [500,'Lendária','Poucos patógenos acabam com a humanidade tão rápido.'],
  [575,'Devastadora','O mundo mal teve tempo de reagir.'],
  [650,'Implacável','A humanidade resistiu, mas não o bastante.'],
  [Infinity,'Persistente','Lenta, mas inevitável.'] ];

function showGameOver(unlocked=[]){
  closeModal();   // fecha Evolucao/Cura/Eventos: a tela de fim nao fica empilhada sobre outro painel
  const won=GAME.status==='won';
  const cos=Object.values(GAME.countries);
  const pop=cos.reduce((a,c)=>a+c.total,0);
  const cured=cos.reduce((a,c)=>a+c.recovered,0);
  const deadPct=GAME.worldDead/Math.max(1,pop);
  const name=`"${esc(GAME.diseaseName)}"`, cls=CLASSES[GAME.diseaseClass].label;
  const box=el('overBox');
  box.classList.toggle('won',won); box.classList.toggle('lost',!won);

  if(won){
    const rank=WIN_RANKS.find(r=>GAME.day<=r[0]);
    el('overIcon').innerHTML='<i class="fas fa-biohazard"></i>';
    el('overKicker').textContent='PANDEMIA COMPLETA';
    el('overTitle').textContent='Vitória!';
    el('overText').innerHTML =
      `${name} (${cls}) varreu a humanidade em <b>${GAME.day} dias</b>. Não restou nenhum sobrevivente.`;
    el('overRank').innerHTML=`<span>Classificação</span><b>${rank[1]}</b><small>${rank[2]}</small>`;
    if(unlocked.length) el('overText').innerHTML += `<span class="over-unlock"><i class="fas fa-unlock"></i> ${unlocked.map(k=>CLASSES[k].label).join(', ')} desbloqueado! Escolha na tela inicial.</span>`;
  } else {
    const byCure=GAME.cure>=100;
    el('overIcon').innerHTML=`<i class="fas ${byCure?'fa-syringe':'fa-skull-crossbones'}"></i>`;
    el('overKicker').textContent=byCure?'PATÓGENO ERRADICADO':'PATÓGENO EXTINTO';
    el('overTitle').textContent='Derrota';
    el('overText').innerHTML = byCure
      ? `A cura salvou o último infectado. A humanidade venceu ${name} (${cls}) após <b>${GAME.day} dias</b>.`
      : `${name} (${cls}) ficou sem hospedeiros e desapareceu após <b>${GAME.day} dias</b>.`;
  }
  el('overRank').classList.toggle('hidden',!won);

  const stat=(label,val)=>`<div><span>${label}</span><b>${val}</b></div>`;
  const alive=cos.reduce((s,c)=>s+c.healthy+c.infected+c.recovered,0), worldPop=Math.max(1,alive+GAME.worldDead);
  el('overStats').innerHTML=
    stat('Dias',GAME.day)+
    stat('Sobreviventes',`${fmt(alive)} <small>(${(alive/worldPop*100).toFixed(1)}%)</small>`)+
    stat('Mortos',`${fmt(GAME.worldDead)} <small>(${(deadPct*100).toFixed(1)}%)</small>`)+
    stat('Países atingidos',`${cos.filter(c=>c.everInfected).length} / ${cos.length}`)+
    stat(won?'Cura ao final':'Curados', won?`${GAME.cure.toFixed(1)}%`:fmt(cured))+
    stat('Evoluções',GAME.purchased.length);
  el('overModal').classList.remove('hidden');
}

// =================== (6) PERSISTENCIA (localStorage) ===================
const SAVE_KEY='globalOutbreakSave';   // nome antigo do jogo, mantido para nao perder saves
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({ g:GAME, sel:selectedIso })); }catch(e){} }
function load(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(!raw) return null; return JSON.parse(raw); }catch(e){ return null; } }
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

// Botao do disco: salva na hora e confirma (o jogo tambem salva sozinho a cada dia).
function saveNow(){
  if(!GAME) return;
  save();
  const ok=load()?.g?.day===GAME.day;
  toast(ok ? { title:'Jogo salvo', desc:`Dia ${GAME.day} salvo neste navegador. Use "Continuar partida salva" para voltar.`, prio:'medium' }
           : { title:'Não foi possível salvar', desc:'O navegador bloqueou o armazenamento (aba anônima?).', prio:'high' });
  const b=el('saveBtn'); b.classList.toggle('saved',ok);
  setTimeout(()=>b.classList.remove('saved'), 1500);
}

// Valida o formato de uma partida salva/importada (saves da versao antiga sao recusados).
function isValidSave(data){
  const g=data && data.g;
  if(!g || g.schema!==2 || !CLASSES[g.diseaseClass]) return false;
  if(!Array.isArray(g.purchased) || !Array.isArray(g.history) || typeof g.points!=='number') return false;
  const cos=g.countries && Object.values(g.countries);
  return !!cos && cos.length>0 && cos.every(c=>typeof c.total==='number' && Array.isArray(c.borders));
}

// Exporta a partida atual (ou o save) para um arquivo .txt (JSON legivel).
function exportTxt(){
  const payload = GAME ? { g:GAME, sel:selectedIso } : load();
  if(!payload){ alert('Nao ha partida para exportar.'); return; }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = (payload.g?.diseaseName||'partida').replace(/[^\w-]+/g,'_');
  a.href = url; a.download = `paciente-zero-${safe}-dia${payload.g?.day||0}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Importa um .txt exportado, valida e entra no jogo.
function importTxt(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(String(reader.result));
      if(!isValidSave(data)) throw new Error('formato');
      GAME = data.g;
      if(!GAME._events) GAME._events=[];
      selectedIso = GAME.countries[data.sel] ? data.sel : null;
      save();
      enterGame(0);
      if(selectedIso) selectCountry(selectedIso);
    }catch(e){
      alert('Arquivo invalido, corrompido ou de uma versao antiga do jogo.');
    }
  };
  reader.readAsText(file);
}

// =================== BOOT / EVENTOS DOM ===================
// Altura real do header do site (muda no celular): o jogo ocupa o resto da tela.
function syncHeaderHeight(){
  const h=document.querySelector('body>header');
  if(h) document.documentElement.style.setProperty('--header-h', h.offsetHeight+'px');
}

// Maximizar: esconde header/footer do site; --header-h vira 0 e o jogo ocupa a tela toda.
function toggleMaximize(){
  const on=document.body.classList.toggle('maximized'), b=el('fullBtn');
  b.innerHTML=`<i class="fas ${on?'fa-compress':'fa-expand'}"></i>`;
  b.title=on?'Minimizar':'Maximizar'; b.setAttribute('aria-label',b.title); b.setAttribute('aria-pressed',on);
  syncHeaderHeight(); window.scrollTo(0,0);
}

async function boot(){
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);
  try{ GEO = await loadGeo(); }
  catch(e){ el('setup').innerHTML='<div class="setup-card"><p>Falha ao carregar o mapa (world.geojson). Rode via servidor local ou GitHub Pages.</p><a class="btn btn-ghost" href="index.html">Voltar</a></div>'; return; }
  buildSetup();

  el('startBtn').onclick=startGame;
  el('closeSide').onclick=()=>{ selectedIso=null; gSel.selectAll('path.country').classed('sel',false); renderSide(); };
  el('closeModal').onclick=closeModal;
  el('overRestart').onclick=()=>{ clearSave(); location.reload(); };

  // Continuar / Exportar / Importar
  const hasSave = isValidSave(load());
  if(hasSave){ el('continueBtn').classList.remove('hidden'); el('exportBtn').classList.remove('hidden'); }
  el('continueBtn').onclick=continueGame;
  el('exportBtn').onclick=exportTxt;
  el('importBtn').onclick=()=>el('importFile').click();
  el('importFile').onchange=(e)=>{ const f=e.target.files&&e.target.files[0]; if(f) importTxt(f); e.target.value=''; };

  document.querySelectorAll('.speed-btn').forEach(b=> b.onclick=()=>setSpeed(+b.dataset.speed));
  el('saveBtn').onclick=saveNow;
  el('fullBtn').onclick=toggleMaximize;
  document.querySelectorAll('.tab').forEach(t=> t.onclick=()=>openModal(t.dataset.panel));

  // delegacao: abas, selecao de no e compra de evolucao
  el('modalTabs').addEventListener('click',ev=>{ const b=ev.target.closest('[data-tab]'); if(b){ openPanel=b.dataset.tab; selectedEvo=null; renderPanel(openPanel); } });
  el('modalBody').addEventListener('click',ev=>{
    const pick=ev.target.closest('[data-pick]');
    if(pick){ selectedEvo=pick.dataset.pick; renderPanel(openPanel); return; }
    const btn=ev.target.closest('[data-evo]'); if(btn) buyEvo(btn.dataset.evo);
  });
}

if(typeof document!=='undefined') document.addEventListener('DOMContentLoaded', boot);
if(typeof module!=='undefined') module.exports={ tick, createGame, computeBorders, EVOLUTIONS, EVO_BY_ID, BALANCE, costOf, reqOk, cutReady, allowedFor };
})();
