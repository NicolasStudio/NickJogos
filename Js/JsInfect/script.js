/* ===========================================================================
   GLOBAL OUTBREAK - logica do jogo (HTML/JS puro, offline).
   Organizado em: (1) DADOS/BALANCEAMENTO  (2) ENGINE puro deterministico
   (3) RENDER do mapa (D3)  (4) UI  (5) LOOP de tempo  (6) PERSISTENCIA.
   A logica de simulacao (ENGINE) e separada da UI: o engine so recebe e
   devolve estado; os componentes apenas leem o estado e desenham.
   =========================================================================== */
(() => {
'use strict';

// =================== (1) DADOS / BALANCEAMENTO ===================
const BALANCE = {
  recoveryRate: 0.03,            // fracao de infectados que recupera/dia (base)
  pointsPerInfections: 60000,    // 1 ponto a cada N novas infeccoes
  cureBaseDaily: 0.04,           // avanco % da cura/dia quando mobilizada
  cureStartInfectedPct: 0.006,   // mundo comeca a pesquisar a partir dessa fracao
  stage: { first: 0.00005, growing: 0.02, high: 0.2, critical: 0.5 },
  growthMul: 0.6,                // taxa logistica interna: infectividade*growthMul ~ pico/dia
  crossBase: 0.005,              // chance base de exportar p/ pais conectado/dia
  deathMul: 0.06,                // fracao da letalidade aplicada por dia (mortes mais lentas)
};

const CLASSES = {
  virus:    { label:'Virus',    desc:'Muta facil; expansao mais cara.',          infectivity:.42, severity:.10, lethality:.045, mutationMul:.8 },
  bacteria: { label:'Bacteria', desc:'Propaga facil; evolui com dificuldade.',   infectivity:.50, severity:.12, lethality:.055, mutationMul:1.3 },
  fungus:   { label:'Fungo',    desc:'Ruim em distancias longas e clima adverso.',infectivity:.32, severity:.10, lethality:.045, mutationMul:1.0 },
  parasite: { label:'Parasita', desc:'Bloqueado nesta versao.',                  infectivity:.40, severity:.15, lethality:.08,  mutationMul:1.1, locked:true },
};

// Arvores de evolucao (nos gerados por dados, nao estaticos no HTML).
const EVOLUTIONS = {
  transmission: [
    { id:'air1',  name:'Transmissao aerea 1', desc:'+ espalhamento por rotas aereas.', cost:2, eff:{cross:.01, infectivity:.04} },
    { id:'air2',  name:'Transmissao aerea 2', desc:'Mais exportacao internacional.',   cost:4, req:['air1'], eff:{cross:.02, infectivity:.03} },
    { id:'sea1',  name:'Transmissao maritima',desc:'+ espalhamento por navios.',        cost:3, eff:{cross:.012} },
    { id:'cont',  name:'Contato direto',      desc:'+ infectividade local.',            cost:2, eff:{infectivity:.06} },
    { id:'water', name:'Agua contaminada',    desc:'Forte em paises pobres.',           cost:4, req:['cont'], eff:{infectivity:.07} },
  ],
  symptoms: [
    { id:'cough', name:'Tosse',       desc:'+ infectividade.',              cost:2, eff:{infectivity:.05} },
    { id:'fever', name:'Febre',       desc:'+ gravidade e deteccao.',       cost:2, eff:{severity:.06} },
    { id:'pneu',  name:'Pneumonia',   desc:'+ letalidade.',                 cost:4, req:['fever'], eff:{lethality:.03} },
    { id:'hemo',  name:'Hemorragia',  desc:'Alta letalidade.',              cost:6, req:['pneu'], eff:{lethality:.06, severity:.05} },
    { id:'coma',  name:'Coma total',  desc:'Letalidade extrema.',           cost:9, req:['hemo'], eff:{lethality:.1} },
  ],
  abilities: [
    { id:'cold',  name:'Resistencia ao frio', desc:'Vantagem em paises frios.', cost:3, eff:{coldResist:1} },
    { id:'heat',  name:'Resistencia ao calor',desc:'Vantagem em paises quentes.',cost:3, eff:{heatResist:1} },
    { id:'drug1', name:'Resistencia a drogas 1', desc:'Desacelera a cura.',     cost:4, eff:{cureSlow:.3} },
    { id:'drug2', name:'Resistencia a drogas 2', desc:'Desacelera mais a cura.',cost:7, req:['drug1'], eff:{cureSlow:.4} },
  ],
};
const ALL_EVOS = [...EVOLUTIONS.transmission, ...EVOLUTIONS.symptoms, ...EVOLUTIONS.abilities];
const EVO_BY_ID = Object.fromEntries(ALL_EVOS.map(e => [e.id, e]));

const STAGE_COLORS = { none:'#293746', first:'#4D8FD0', growing:'#E4B44E', high:'#e08a3c', critical:'#D94848', saturated:'#6b2d2d' };
const STAGE_LABELS = { none:'Sem registros', first:'Primeiros registros', growing:'Contaminacao em crescimento',
  high:'Contaminacao elevada', critical:'Situacao critica', saturated:'Sem populacao suscetivel' };

// Populacao ficticia por pais (fallback por area; valores de gameplay, nao oficiais).
const POP = { CHN:1412000000,IND:1428000000,USA:334000000,IDN:277000000,PAK:240000000,NGA:223000000,BRA:203000000,
  BGD:173000000,RUS:144000000,MEX:129000000,JPN:123000000,ETH:126000000,PHL:117000000,EGY:112000000,COD:102000000,
  VNM:98000000,IRN:89000000,TUR:85000000,DEU:84000000,THA:72000000,GBR:68000000,FRA:68000000,ITA:59000000,ZAF:60000000,
  KOR:52000000,COL:52000000,ESP:48000000,ARG:46000000,UKR:38000000,CAN:40000000,POL:38000000,SAU:37000000,AUS:26000000 };
const DEF_POP = 9000000;

// Clima ficticio aproximado por latitude (preenchido no init a partir do centro).
function climateFor(lat){
  const abs = Math.abs(lat);
  return { heat: Math.max(0, 1 - abs/60), cold: Math.max(0, abs/60) };
}

// Paises SEM litoral (landlocked): so transmitem/recebem por via aerea.
const LANDLOCKED = new Set([
  'AFG','ARM','AUT','AZE','BDI','BOL','BWA','BFA','BTN','BLR','CAF','CHE','CZE',
  'ETH','HUN','KAZ','KGZ','LAO','LSO','LUX','MKD','MLI','MNG','MWI','NER','NPL',
  'PRY','RWA','SRB','SSD','SVK','SWZ','TCD','TJK','TKM','UGA','UZB','ZMB','ZWE',
  'MDA','KOS','LIE','AND','SMR','VAT',
]);

// =================== (2) ENGINE PURO DETERMINISTICO ===================
function seedToState(seed){ return (seed|0) || 1; }
function nextRandom(s){ let a=s|0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a);
  t=(t+Math.imul(t^(t>>>7),61|t))^t; return [((t^(t>>>14))>>>0)/4294967296, a]; }

// Deriva indicadores da doenca a partir das evolucoes compradas.
function diseaseStats(state){
  const c = CLASSES[state.diseaseClass];
  let inf=c.infectivity, sev=c.severity, let_=c.lethality, cross=BALANCE.crossBase;
  let heatResist=0, coldResist=0, cureSlow=0;
  for(const id of state.purchased){
    const e = EVO_BY_ID[id]; if(!e) continue;
    const ef=e.eff||{};
    inf+=ef.infectivity||0; sev+=ef.severity||0; let_+=ef.lethality||0; cross+=ef.cross||0;
    heatResist+=ef.heatResist||0; coldResist+=ef.coldResist||0; cureSlow+=ef.cureSlow||0;
  }
  return { infectivity:inf, severity:sev, lethality:let_, cross, heatResist, coldResist, cureSlow };
}

// Decide a modalidade de uma rota entre dois paises (ou null se nao houver).
// - Pais sem litoral so usa AR.
// - Dois paises costeiros: preferem MAR (navios cruzam oceanos); AR se o mar
//   de algum deles estiver fechado.
function routeMode(src, dst){
  const bothCoastal = src.coastal && dst.coastal;
  if(bothCoastal && src.seaOpen && dst.seaOpen) return 'sea';
  if(src.airOpen && dst.airOpen) return 'air';
  return null;
}

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

// UM ciclo (dia). Funcao PURA: muta uma copia e retorna {state, events}.
// Ordem: 1 novo ciclo -> 2 condicoes -> 4 populacao -> 5 infeccoes -> 6 recupera
//  -> 7 mortes -> 8 indicadores -> 9 pontos -> 10 cura -> 11 rotas -> 12 fim -> 13/14 estado+historico
function tick(prev){
  const state = cloneState(prev);
  const events = [];
  state.day += 1;
  const d = diseaseStats(state);
  let rng = state.rngState;
  const rnd = () => { const [v,n]=nextRandom(rng); rng=n; return v; };

  const list = Object.values(state.countries);
  let worldInfected=0, worldPop=0, worldDead=0;

  // 5-7: dinamica interna de cada pais
  for(const co of list){
    worldPop += co.total;
    if(co.infected>0){
      // clima vs habilidades
      let climMul = 1;
      climMul *= 1 - co.clim.cold*(1-Math.min(1,d.coldResist))*0.5;
      climMul *= 1 - co.clim.heat*(1-Math.min(1,d.heatResist))*0.5;
      if(CLASSES[state.diseaseClass].mutationMul && state.diseaseClass==='fungus') climMul*=0.85;
      const pressure = d.infectivity * climMul;
      // crescimento LOGISTICO: taxa diaria * suscetiveis restantes.
      const susceptible = co.healthy / Math.max(1, co.total);
      // acumulador fracionario: infeccoes <1/dia nao se perdem no arredondamento,
      // entao o surto cresce suave desde 1 pessoa (sem travar nem explodir).
      co._acc = (co._acc||0) + co.infected * pressure * BALANCE.growthMul * susceptible;
      let newInf = Math.floor(co._acc);
      co._acc -= newInf;
      newInf = Math.min(co.healthy, Math.max(0, newInf));
      // doencas mais graves/letais tendem a recuperar menos (mantem infectados vivos por mais tempo)
      const rec = Math.floor(co.infected * BALANCE.recoveryRate * (1 - Math.min(0.6, d.severity)));
      const dead = Math.floor(co.infected * d.lethality * BALANCE.deathMul);
      co.healthy -= newInf;
      co.infected += newInf - rec - dead;
      if(co.infected<0) co.infected=0;
      co.recovered += rec;
      co.dead += dead;
      state.totalInfected += newInf;
      // deteccao
      if(!co.detected && (co.infected+co.dead)/co.total > 0.01){ co.detected=true;
        events.push(mkEvent(state.day,'Surto detectado',`${co.name} confirmou um surto.`,'outbreak','high',co.iso3)); }
      // invariante populacional (clamp defensivo)
      fixInvariant(co);
    }
    worldInfected += co.infected;
    worldDead += co.dead;
  }

  // 11: rotas internacionais -> exporta para paises conectados
  const infectedCountries = list.filter(c=>c.infected>500 && !c.allClosed);
  const flashes = [];           // movimentos REAIS processados neste ciclo (para animar)
  for(const src of infectedCountries){
    for(const dstIso of src.links){
      const dst = state.countries[dstIso];
      if(!dst || dst.infected>0) continue;
      const mode = routeMode(src, dst);        // 'air' | 'sea' | null (sem rota viavel)
      if(!mode) continue;
      // maritimo e mais lento/raro que aereo
      const modeMul = mode==='sea' ? 0.5 : 1;
      const chance = d.cross * (src.infected/Math.max(1,src.total)) * 20 * modeMul;
      if(rnd() < chance){
        const seed0 = Math.min(dst.healthy, 5);  // chega pouca gente numa viagem
        dst.healthy -= seed0; dst.infected += seed0; dst.detected=false;
        state.totalInfected += seed0;
        flashes.push({ from:src.iso3, to:dst.iso3, mode });
        events.push(mkEvent(state.day,'Nova fronteira',`${src.name} exportou casos para ${dst.name}.`,'route','medium',dst.iso3));
      }
    }
  }
  state._flashes = flashes;

  // 8/13: estagios
  for(const co of list) co.stage = deriveStage(co);

  // 9: pontos de evolucao
  const earned = Math.floor(state.totalInfected / BALANCE.pointsPerInfections) - state.pointsSpentMark;
  if(earned>0){ state.points += earned; state.pointsSpentMark += earned; }

  // 10: cura (mobiliza quando o mundo passa do limiar)
  const worldInfPct = worldInfected/Math.max(1,worldPop);
  if(worldInfPct > BALANCE.cureStartInfectedPct || state.cure>0){
    const gain = BALANCE.cureBaseDaily * (1 - Math.min(0.9,d.cureSlow)) * (1 + worldInfPct*8);
    const before=state.cure;
    state.cure = Math.min(100, state.cure + gain);
    if(before<25 && state.cure>=25) events.push(mkEvent(state.day,'Mobilizacao internacional','Laboratorios uniram forcas pela cura.','mobilization','medium'));
    if(before<60 && state.cure>=60) events.push(mkEvent(state.day,'Avanco na pesquisa','A cura atingiu 60%.','research','medium'));
  }

  // 12: condicoes de fim
  const anyInfected = worldInfected>0;
  const anyHealthy = list.some(c=>c.healthy>0);
  if(state.cure>=100){ state.status='lost';
    events.push(mkEvent(state.day,'Cura distribuida','A humanidade erradicou o patogeno. Voce perdeu.','milestone','high')); }
  else if(!anyHealthy && !anyInfected){ /* todos resolvidos */ }
  else if(!anyInfected && state.totalInfected>0){ state.status='lost';
    events.push(mkEvent(state.day,'Patogeno extinto','Sem infectados restantes. Voce perdeu.','milestone','high')); }
  else if(!anyHealthy){ state.status='won';
    events.push(mkEvent(state.day,'Mundo saturado','Nao ha mais populacao suscetivel. Voce venceu!','milestone','high')); }

  // 14: historico
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
  const cs={}; for(const k in s.countries){ cs[k]={...s.countries[k], links:s.countries[k].links }; }
  return { ...s, countries:cs, purchased:[...s.purchased], history:[...s.history] };
}

// Cria o estado inicial (puro em relacao a geografia passada).
function createGame({ name, diseaseClass, origin, seed, geo }){
  const countries={};
  for(const f of geo){
    const iso=f.iso3;
    const lat=f.centroid[1];
    const total=POP[iso]||DEF_POP;
    const coastal=!LANDLOCKED.has(iso);
    countries[iso]={ iso3:iso, name:f.name, total, healthy:total, infected:0, recovered:0, dead:0,
      detected:false, stage:'none', coastal,
      airOpen:true, seaOpen:coastal, allClosed:false,
      clim:climateFor(lat), links:f.links };
  }
  const o=countries[origin]||countries[geo[0].iso3];
  const seed0=1; o.infected=seed0; o.healthy-=seed0; o.stage='first';   // paciente zero = 1 pessoa
  return {
    schema:1, seed, rngState:seedToState(seed), day:0, speed:0, status:'running',
    diseaseName:name||'Patogeno-X', diseaseClass,
    countries, purchased:[], points:6, pointsSpentMark:0, totalInfected:seed0,
    cure:0, history:[], worldInfected:seed0, worldDead:0,
  };
}

// =================== (3) RENDER DO MAPA (D3) ===================
let GEO=null, projection=null, pathGen=null, svgSel=null, gSel=null;
let routeLayer=null, vehicleLayer=null, projCentroid={};

async function loadGeo(){
  const res = await fetch('Js/JsInfect/world.geojson');
  const gj = await res.json();
  // centroide + vizinhos por proximidade (grafo de rotas ficticio)
  const feats = gj.features.map(f=>{
    const c = d3.geoCentroid(f);
    // mantem um Feature GeoJSON VALIDO (type + geometry) para o d3.geoPath,
    // anexando os campos extras do jogo.
    return { type:'Feature', properties:f.properties, geometry:f.geometry,
      iso3:f.properties.iso3, name:f.properties.name, centroid:c };
  });
  // links: 4 paises mais proximos (rotas aereas/maritimas ficticias)
  for(const f of feats){
    const dists = feats.filter(o=>o!==f).map(o=>({iso:o.iso3, d:geoDist(f.centroid,o.centroid)}));
    dists.sort((a,b)=>a.d-b.d);
    f.links = dists.slice(0,4).map(x=>x.iso);
  }
  return feats;
}
function geoDist(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1]; return dx*dx+dy*dy; }

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

  // camadas de rotas e veiculos, por cima dos paises
  routeLayer = gSel.append('g').attr('class','routes');
  vehicleLayer = gSel.append('g').attr('class','vehicles');

  // cache dos centroides PROJETADOS (x,y) por iso3
  projCentroid = {};
  for(const f of GEO){ projCentroid[f.iso3] = projection(f.centroid); }

  const zoom=d3.zoom().scaleExtent([1,8]).on('zoom',ev=>gSel.attr('transform',ev.transform));
  svgSel.call(zoom);
}

// Caminho em arco (quadratico) entre dois pontos projetados, com curvatura
// proporcional a distancia (da sensacao de rota sobre o globo).
function arcPath(a,b){
  if(!a||!b) return '';
  const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
  const dx=b[0]-a[0], dy=b[1]-a[1];
  const dist=Math.hypot(dx,dy);
  // ponto de controle deslocado perpendicularmente
  const nx=-dy/dist, ny=dx/dist;
  const lift=Math.min(60, dist*0.25);
  return `M${a[0]},${a[1]} Q${mx+nx*lift},${my+ny*lift} ${b[0]},${b[1]}`;
}

// Desenha as rotas ATIVAS: de cada pais infectado para seus vizinhos ainda sadios.
// Reflete o grafo de transmissao real do motor (nao sao rotas decorativas).
function drawRoutes(state){
  if(!routeLayer) return;
  const active=[];
  for(const co of Object.values(state.countries)){
    if(co.infected>500 && !co.allClosed){
      for(const to of co.links){
        const dst=state.countries[to];
        if(!dst) continue;
        const mode=routeMode(co, dst);
        if(!mode) continue;
        active.push({ id:co.iso3+'-'+to, from:co.iso3, to, mode });
      }
    }
  }
  const sel=routeLayer.selectAll('path.route-managed').data(active, d=>d.id);
  sel.exit().remove();
  sel.enter().append('path')
    .attr('class',d=>'route route-managed route-'+d.mode)
    .merge(sel)
    .attr('d',d=>arcPath(projCentroid[d.from], projCentroid[d.to]));
}

// Anima um veiculo (aviao/navio) ao longo de uma rota para cada export REAL.
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
    dot.textContent = fl.mode==='air' ? '\u2708' : '\u26F4'; // aviao / navio
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
}

let tipEl=null;
function showTip(e,name){ if(!tipEl){tipEl=document.createElement('div');tipEl.className='map-tip';document.body.appendChild(tipEl);}
  tipEl.textContent=name; tipEl.style.left=(e.clientX+12)+'px'; tipEl.style.top=(e.clientY+12)+'px'; tipEl.style.display='block'; }
function hideTip(){ if(tipEl) tipEl.style.display='none'; }

// =================== (4) UI ===================
const fmt=n=>new Intl.NumberFormat('pt-BR').format(Math.round(n));
let GAME=null, selectedIso=null, chosenClass='virus', loopTimer=null;

function el(id){ return document.getElementById(id); }

function buildSetup(){
  // cards de classe
  const grid=el('classGrid'); grid.innerHTML='';
  for(const [key,c] of Object.entries(CLASSES)){
    const card=document.createElement('button');
    card.type='button';
    card.className='class-card'+(c.locked?' locked':'')+(key===chosenClass?' sel':'');
    card.innerHTML=`<h5>${c.label}${c.locked?'<span class="lock-badge">Bloqueado</span>':''}</h5><p>${c.desc}</p>`;
    if(!c.locked) card.onclick=()=>{ chosenClass=key; buildSetup(); };
    grid.appendChild(card);
  }
  // paises de origem
  if(GEO){
    const sel=el('originSelect');
    if(sel.options.length===0){
      const sorted=[...GEO].sort((a,b)=>a.name.localeCompare(b.name));
      for(const f of sorted){ const op=document.createElement('option'); op.value=f.iso3; op.textContent=f.name;
        if(f.iso3==='BRA') op.selected=true; sel.appendChild(op); }
    }
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
  el('hudDisease').textContent=`${GAME.diseaseName} - ${CLASSES[GAME.diseaseClass].label}`;
  buildLegend();
  // o mapa so desenha agora que o container tem tamanho
  drawMap(selectCountry);
  paintMap(GAME);
  drawRoutes(GAME);
  refreshHud();
  updateEvBadge();
  if(GAME.status!=='running'){ setSpeed(0); showGameOver(); }
  else setSpeed(startSpeed ?? 0);
  save();
}

// Carrega a partida salva (localStorage) e entra no jogo, pausado.
function continueGame(){
  const data=load();
  if(!data || !data.g){ return; }
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

function renderSide(){
  const co=selectedIso?GAME.countries[selectedIso]:null;
  el('sideEmpty').classList.toggle('hidden',!!co);
  el('sideContent').classList.toggle('hidden',!co);
  if(!co) return;
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
  el('cDetected').textContent=co.detected?'Sim':'Nao';
  el('cAccess').textContent = co.coastal ? 'Aereo + Maritimo' : 'Somente aereo (sem litoral)';
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
  for(const ev of events){ GAME._events.unshift(ev); toast(ev); }
  if(GAME._events.length>200) GAME._events.length=200;
  paintMap(GAME);
  drawRoutes(GAME);
  animateFlashes(GAME._flashes);
  refreshHud();
  if(selectedIso) renderSide();
  updateEvBadge();
  if(openPanel) renderPanel(openPanel); // mantem o painel aberto vivo
  if(GAME.status!=='running'){ setSpeed(0); showGameOver(); }
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
  t.innerHTML=`<b>${ev.title}</b><div style="color:var(--text2);font-size:.76rem">${ev.desc}</div>`;
  wrap.appendChild(t);
  // limita a 4 toasts simultaneos (evita flood em velocidade alta)
  while(wrap.children.length>4) wrap.removeChild(wrap.firstChild);
  setTimeout(()=>t.remove(), 4200);
}

// =================== PAINEIS (bottom nav) ===================
let openPanel=null;
function openModal(panel){ openPanel=panel; el('modal').classList.remove('hidden'); renderPanel(panel); }
function closeModal(){ openPanel=null; el('modal').classList.add('hidden'); }

function renderPanel(panel){
  const body=el('modalBody'); const title=el('modalTitle');
  if(panel==='disease'){ title.textContent='Doenca';
    const d=diseaseStats(GAME);
    body.innerHTML=
      statBar('Infectividade',d.infectivity)+
      statBar('Gravidade',d.severity)+
      statBar('Letalidade',d.lethality)+
      `<div class="row"><span>Infectados (mundo)</span><b>${fmt(GAME.worldInfected)}</b></div>`+
      `<div class="row"><span>Mortos (mundo)</span><b>${fmt(GAME.worldDead)}</b></div>`+
      `<div class="row"><span>Paises atingidos</span><b>${Object.values(GAME.countries).filter(c=>c.infected>0||c.dead>0).length}</b></div>`;
  } else if(panel==='cure'){ title.textContent='Cura';
    body.innerHTML=statBar('Progresso da cura',GAME.cure/100)+
      `<p class="empty-note">A pesquisa acelera conforme o mundo e infectado. Resistencia a drogas (Habilidades) desacelera a cura.</p>`+
      renderEvos('abilities');
  } else if(panel==='events'){ title.textContent='Eventos';
    (GAME._events||[]).forEach(e=>e.read=true); updateEvBadge();
    const evs=GAME._events||[];
    body.innerHTML = evs.length? evs.map(e=>
      `<div class="event-item ${e.prio}"><div class="eday">Dia ${e.day}</div><div class="et">${e.title}</div><div class="ed">${e.desc}</div></div>`
    ).join('') : '<p class="empty-note">Nenhum evento ainda.</p>';
  } else { // transmission / symptoms
    title.textContent = panel==='transmission'?'Transmissao':'Sintomas';
    body.innerHTML = `<div class="row"><span>Pontos disponiveis</span><b>${GAME.points}</b></div>`+renderEvos(panel);
  }
}

function statBar(label,val){
  const pct=Math.min(100,Math.max(0,val*100));
  return `<div class="stat-line"><div class="lab"><span>${label}</span><span>${pct.toFixed(0)}%</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
}

function renderEvos(tree){
  return EVOLUTIONS[tree].map(e=>{
    const bought=GAME.purchased.includes(e.id);
    const reqOk=!e.req || e.req.every(r=>GAME.purchased.includes(r));
    const canBuy=!bought && reqOk && GAME.points>=e.cost;
    const reqTxt=e.req&&!reqOk?`<p style="color:var(--yellow)">Requer: ${e.req.map(r=>EVO_BY_ID[r].name).join(', ')}</p>`:'';
    return `<div class="evo ${bought?'bought':''}"><div class="evo-info"><h5>${e.name}</h5><p>${e.desc}</p>${reqTxt}</div>`+
      (bought?`<span class="owned">Adquirido</span>`:`<button data-evo="${e.id}" ${canBuy?'':'disabled'}>${e.cost} pts</button>`)+`</div>`;
  }).join('');
}

function buyEvo(id){
  const e=EVO_BY_ID[id]; if(!e) return;
  if(GAME.purchased.includes(id)) return;
  if(e.req && !e.req.every(r=>GAME.purchased.includes(r))) return;
  if(GAME.points<e.cost) return;
  GAME.points-=e.cost;
  GAME.purchased.push(id);
  refreshHud();
  if(openPanel) renderPanel(openPanel);
  save();
}

// =================== FIM DE JOGO ===================
function showGameOver(){
  const won=GAME.status==='won';
  el('overTitle').textContent=won?'Vitoria':'Derrota';
  el('overText').textContent=won
    ? `Seu patogeno "${GAME.diseaseName}" dominou o mundo em ${GAME.day} dias. Mortos: ${fmt(GAME.worldDead)}.`
    : `A humanidade conteve "${GAME.diseaseName}" apos ${GAME.day} dias.`;
  el('overModal').classList.remove('hidden');
}

// =================== (6) PERSISTENCIA (localStorage) ===================
const SAVE_KEY='globalOutbreakSave';
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({ g:GAME, sel:selectedIso })); }catch(e){} }
function load(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(!raw) return null; return JSON.parse(raw); }catch(e){ return null; } }
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

// Exporta a partida atual (ou o save) para um arquivo .txt (JSON legivel).
function exportTxt(){
  const payload = GAME ? { g:GAME, sel:selectedIso } : load();
  if(!payload){ alert('Nao ha partida para exportar.'); return; }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = (payload.g?.diseaseName||'partida').replace(/[^\w-]+/g,'_');
  a.href = url; a.download = `global-outbreak-${safe}-dia${payload.g?.day||0}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Importa um .txt exportado, valida o minimo e entra no jogo.
function importTxt(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(String(reader.result));
      if(!data || !data.g || !data.g.countries || !data.g.diseaseClass) throw new Error('formato');
      // validacao minima do invariante em um pais
      const any = Object.values(data.g.countries)[0];
      if(!any || typeof any.total!=='number') throw new Error('estado');
      GAME = data.g;
      if(!GAME._events) GAME._events=[];
      selectedIso = data.sel || null;
      localStorage.setItem(SAVE_KEY, JSON.stringify({ g:GAME, sel:selectedIso }));
      enterGame(0);
      if(selectedIso) selectCountry(selectedIso);
    }catch(e){
      alert('Arquivo invalido ou corrompido.');
    }
  };
  reader.readAsText(file);
}

// =================== BOOT / EVENTOS DOM ===================
async function boot(){
  try{ GEO = await loadGeo(); }
  catch(e){ el('setup').innerHTML='<div class="setup-card"><p>Falha ao carregar o mapa (world.geojson). Rode via servidor local ou GitHub Pages.</p><a class="btn btn-ghost" href="index.html">Voltar</a></div>'; return; }
  buildSetup();

  el('startBtn').onclick=startGame;
  el('closeSide').onclick=()=>{ selectedIso=null; gSel.selectAll('path.country').classed('sel',false); renderSide(); };
  el('closeModal').onclick=closeModal;
  el('overRestart').onclick=()=>{ clearSave(); location.reload(); };

  // Continuar / Exportar / Importar
  const hasSave = !!load();
  if(hasSave){ el('continueBtn').classList.remove('hidden'); el('exportBtn').classList.remove('hidden'); }
  el('continueBtn').onclick=continueGame;
  el('exportBtn').onclick=exportTxt;
  el('importBtn').onclick=()=>el('importFile').click();
  el('importFile').onchange=(e)=>{ const f=e.target.files&&e.target.files[0]; if(f) importTxt(f); e.target.value=''; };

  document.querySelectorAll('.speed-btn').forEach(b=> b.onclick=()=>setSpeed(+b.dataset.speed));
  document.querySelectorAll('.tab').forEach(t=> t.onclick=()=>openModal(t.dataset.panel));

  // delegacao: compra de evolucao
  el('modalBody').addEventListener('click',ev=>{ const btn=ev.target.closest('[data-evo]'); if(btn) buyEvo(btn.dataset.evo); });
}

document.addEventListener('DOMContentLoaded', boot);
})();
