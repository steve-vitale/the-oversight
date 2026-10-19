#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('starvation-callers');
(async () => {
  const saves = new Map();
  globalThis.localStorage = { getItem: k => saves.get(k) ?? null, setItem: (k,v) => saves.set(k,String(v)), removeItem: k => saves.delete(k), key: i => [...saves.keys()][i] ?? null, get length(){ return saves.size; } };
  // Install before eval: game modules capture Math.random. Forced draws only
  // isolate actual food callers; ordinary setup still uses the seeded harness.
  let forced = null, live = Math.random;
  const random = () => forced == null ? live() : forced;
  const descriptor = Object.getOwnPropertyDescriptor(Math, 'random');
  Object.defineProperty(Math, 'random', { configurable:true, get:()=>random, set:fn=>{ live=fn; } });
  let G;
  try { G = await K.load({ seed:Number(process.env.SEED || 7) }); }
  finally { Object.defineProperty(Math, 'random', { ...descriptor, value:random }); }
  let s,v,id,p;
  function fresh(abilities = [], count = 1) {
    G.tbfight=null; G.over=false; G.won=false; K.newRun(G);
    s=G.state.scholar; v=G.state.village; s.day=85; s.kcal=3000;
    s.abilities=[]; s.backgroundAbilities=[]; G.state.systemArrived=true;
    const ids=v.roster.filter(x=>x!==G.villagerId && G.npcAge(x)>=18).slice(0,count);
    if(ids.length!==count) throw Error('Prepared run needs enough actual adult residents');
    v.roster=[G.villagerId,...ids]; v.party=[]; v.followers=[]; v.pantry=[];
    v.health={}; v.npcAbilities={}; v.npcSynergies={}; v.sharedKnowledge={};
    for(const who of ids) {
      const person=G.getPerson(who); person.items=[]; person.equipped={}; person.backgroundAbilities=[];
      person.personality.temperament='steady';
      v.health[who]=1; v.npcAbilities[who]=abilities.slice(); G.npcNeeds(who).hunger=95;
    }
    id=ids[0]; p=G.getPerson(id); return ids;
  }
  function meal() { forced=0; try { return G.villagerMealDay(id,p,v,{cookId:null}); } finally { forced=null; } }
  function day() { forced=0; try { return G.villageEats(); } finally { forced=null; } }
  function fastAll() { for(const who of v.roster.filter(x=>x!==G.villagerId)) { G.getPerson(who).personality.temperament='bold'; G.npcNeeds(who).hunger=0; } }
  const deaths=[], register=G.registerDeath;
  G.registerDeath=function(rec) { deaths.push(rec); return register.apply(this,arguments); };
  const countDeaths=who=>deaths.filter(x=>x.kind==='villager' && x.villagerId===who).length;

  fresh(['second_wind']); fastAll(); let ate;
  const original=G.villagerMealDay;
  G.villagerMealDay=function(){ return ate=original.apply(this,arguments); };
  try { day(); } finally { G.villagerMealDay=original; }
  T.ok('actual fasting skips the meal hit while the bare pantry still takes famine damage',ate.fasting && v.pantry.length===0 && v.godpathSurvival?.[id]?.secondWindUses===1);
  T.ok('actual famine preserves the personal refusal and resident body',v.health[id]===1 && !p.dead && v.roster.includes(id));
  T.ok('actual famine records the real personal deed',v.godpathDeeds?.[id]?.death_refused?.ability==='second_wind');

  fresh(['second_wind']); meal();
  T.ok('actual meal shortfall invokes an available personal refusal',v.health[id]===1 && !p.dead && v.roster.includes(id));
  T.ok('food shortfall cannot manufacture the violent spite ration',G.npcNeeds(id).hunger>95);
  G.save(); const key=G.state.runKey, loaded=G.load(key); s=G.state.scholar; v=G.state.village; p=G.getPerson(id);
  T.ok('Save and Continue retain food refusal health and daily budget',loaded && v.health[id]===1 && v.godpathSurvival?.[id]?.secondWindUses===1);
  const beforeDeath=countDeaths(id); meal();
  T.ok('a second shortfall cannot refresh the spent use',p.dead && !v.roster.includes(id) && countDeaths(id)===beforeDeath+1);
  const fallen=(v.fallen||[]).length, once=countDeaths(id);
  G.hurtFromStarvation(id,4);
  T.ok('a later famine cannot register that meal death twice',countDeaths(id)===once && (v.fallen||[]).length===fallen && !Object.hasOwn(v.health,id));

  fresh([]); v.health[id]=20; meal();
  T.ok('the actual partial meal price stays exactly eight HP',v.health[id]===12 && !p.dead);
  fresh([]); fastAll(); v.health[id]=20; day();
  T.ok('the actual fasting famine price stays exactly four HP',v.health[id]===16 && !p.dead);
  fresh([]); p.items=['phase_shawl']; p.equipped={accessory:{itemId:'phase_shawl'}}; v.health[id]=20;
  let avoidedCalls=0; const worn=G.wornDamage;
  G.wornDamage=function(){ avoidedCalls++; return 0; };
  try { meal(); } finally { G.wornDamage=worn; }
  T.ok('unmitigated food damage has no armor or Phase Shawl avoidance call',v.health[id]===12 && avoidedCalls===0);

  let ids=fresh([],2); fastAll(); const start=deaths.length; day();
  T.ok('famine processes adjacent residents despite roster removal',ids.every(who=>G.getPerson(who).dead && !v.roster.includes(who)) && deaths.length===start+2);
  T.ok('famine records each actual death exactly once and cleans health mirrors',ids.every(who=>deaths.slice(start).filter(x=>x.villagerId===who).length===1 && !Object.hasOwn(v.health,who)));
  ids=fresh([],2); const mealStart=deaths.length; day();
  T.ok('meal deaths cannot skip the next resident or be repeated by famine',ids.every(who=>G.getPerson(who).dead && !v.roster.includes(who)) && deaths.length===mealStart+2);

  fresh(['second_wind']); day();
  T.ok('meal then famine are two real hits: one use can save the meal but not both',p.dead && !v.roster.includes(id) && v.godpathSurvival?.[id]?.secondWindUses===1);
  fresh([]); const said=[], say=G.say, home=G.playerAtHaven;
  G.say=function(message){ said.push(message); return say.apply(this,arguments); }; G.playerAtHaven=()=>true;
  try { meal(); } finally { G.say=say; G.playerAtHaven=home; }
  T.ok('a meal death is announced without a later living hungry-night message',said.filter(x=>x.includes('starved. Slowly.')).length===1 && !said.some(x=>x.includes('went to sleep hungry')));
  fresh(['molt']); p.items=['hunting_spear','hunting_spear','hide_armor']; p.equipped={melee:{itemId:'hunting_spear'},torso:{itemId:'hide_armor'}}; meal();
  T.ok('actual hungry Molt restores health and charges only physically worn units',v.health[id]===100 && p.items.filter(x=>x==='hunting_spear').length===1 && !p.items.includes('hide_armor') && !Object.keys(p.equipped).length);
  T.ok('hungry Molt does not add food',G.npcNeeds(id).hunger>95 && v.pantry.length===0);

  fresh([]); s.awayNews=[]; const atHaven=G.playerAtHaven;
  G.playerAtHaven=()=>false;
  try { meal(); } finally { G.playerAtHaven=atHaven; }
  T.ok('away meal death queues one name-gated starvation announcement',s.awayNews.length===1 && s.awayNews[0].includes(G.displayName(id)) && s.awayNews[0].includes('starved'));
  G.hurtFromStarvation(id,4);
  T.ok('dead bodies cannot repeat the away announcement',s.awayNews.length===1);
  fresh([]); const hp=s.health;
  T.ok('the NPC helper cannot damage the current bearer, unknown bodies or invalid damage',G.hurtFromStarvation(G.villagerId,4)===false && G.hurtFromStarvation('not-a-person',4)===false && G.hurtFromStarvation(id,NaN)===false && s.health===hp && v.health[id]===1);
  fresh(['second_wind']); fastAll(); v._granaryFedDay=s.day; day();
  T.ok('granary-fed day preserves the existing three-HP recovery without spending a use',v.health[id]===4 && !p.dead && !v.godpathSurvival?.[id]);
  fresh([]); s.awayNews=Array(8).fill('prior news'); G.playerAtHaven=()=>false;
  try { meal(); } finally { G.playerAtHaven=atHaven; }
  T.ok('away news retains its existing eight-entry cap even on a new death',p.dead && s.awayNews.length===8 && s.awayNews.every(x=>x==='prior news'));
  T.done();
})().catch(e=>{ console.error(e.stack); process.exitCode=1; });
