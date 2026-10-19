// Prepared native encounter beats through the shared runtime; no natural-incidence claim.
'use strict';
const K=require('./godpath/lib');
const T=K.reporter('prey-beats-play');
function withRandom(value,fn) { const real=Math.random;Math.random=()=>value;try{return fn();}finally{Math.random=real;} }
(async()=>{
  const G=await K.load({seed:Number(process.env.SEED||20261017),narration:true});
  K.newRun(G);
  const s=G.state.scholar;
  if(s.insideHaven)G.exitBuilding();
  // Explicit open meadow arena on this real node, instead of assuming a
  // fixed global map coordinate has woodland and the right local stock.
  const tile=G.playerTile();tile.type='meadow';tile.detail=Array.from({length:9},()=>Array(9).fill('grass'));
  tile.wildlife={};s.inventory=[];
  T.ok('prepared open meadow outside combat', !G.inCombat()&&!G.over&&G.genDetail(G.map.px,G.map.py)===tile.detail);
  const fired=[],originalAudio=G.audioEvent;
  G.audioEvent=function(name,...args){fired.push(name);return originalAudio.call(this,name,...args);};
  const had=name=>fired.includes(name);
  try{
  // ============ ACT 1: the deer ============
  // spawn a white-tail mid-grid, walk the player into its notice range
  s.mx = 4; s.my = 0; s.kcal = 2400; s.health = G.maxHealth();
  s.animal = { id: 'white_tailed_deer', mx: 4, my: 3, aware: 0, stamina: 3, pstate: 'graze', edgeTurns: 0 };
  const seen = new Set(), badges = [];
  let guard = 0;
  while (guard++ < 40) {
    const a = s.animal;
    if (!a) break;
    seen.add(a.pstate);
    badges.push(`${a.pstate}:${G.encPreyPhaseBadge(a)}`);
    // player walks toward the deer, one tile per turn (the chase is real)
    if (s.my < a.my) s.my++; else if (s.my > a.my) s.my--;
    else if (s.mx < a.mx) s.mx++; else if (s.mx > a.mx) s.mx--;
    G.animalTurn();
    s.kcal = 2400;
    if (s.animal) seen.add(s.animal.pstate); // windup→action→recovery, as the grid shows it
    if (a.pstate === 'winded') break;
  }
  const story = badges.join(' → ');
  console.log('  deer hunt:', story);
  T.ok('deer: graze → wary → bolt → winded observed',
    seen.has('graze') && seen.has('wary') && seen.has('bolt') && seen.has('winded'));
  T.ok('deer: alarm snort fired on the white-tail bolt', had('animalSnort'));
  T.ok('deer: scamper fired with the bolt', had('animalBolt'));
  T.ok('deer: pant fired when winded (sides heaving)', had('animalPant'));
  T.ok('deer: badge reads "😮‍💨 winded" at recovery',
    G.encPreyPhaseBadge({ pstate: 'winded' }) === '😮‍💨 winded');
  T.ok('deer: hunt ended winded, not vanished (player can strike)',
    s.animal && s.animal.pstate === 'winded');

  // ============ ACT 2: the turtle ============
  fired.length = 0;
  s.mx = 4; s.my = 4; s.kcal = 2400;
  s.animal = { id: 'snapping_turtle', mx: 4, my: 5, aware: 0, stamina: 2, pstate: 'graze', edgeTurns: 0 };
  G.animalTurn();
  console.log('  turtle badge:', G.encPreyPhaseBadge(s.animal));
  T.ok('turtle: hiss fired on lunge warning', had('animalHiss'));
  T.ok('turtle: does not flee (aggressive, holds ground)', s.animal && s.animal.pstate !== 'bolt');

  // Spawn from authored biome compatibility and a controlled local census.
  fired.length=0;s.animal=null;s.mx=7;s.my=7;s.kcal=2400;
  const rabbit=G.data.animals.find(a=>a.id==='cottontail_rabbit');
  T.ok('rabbit supports the prepared meadow', !!rabbit&&rabbit.biomes.includes(tile.type));
  tile.wildlife={cottontail_rabbit:1};
  withRandom(0.300001,()=>G.checkAnimals());
  T.ok('above spawn threshold leaves animal and census alone', !s.animal&&tile.wildlife.cottontail_rabbit===1&&!had('animalRustle'));
  withRandom(0.3,()=>G.checkAnimals());
  const spawned=s.animal;
  T.ok('inclusive spawn threshold creates actual local rabbit', !!spawned&&spawned.id==='cottontail_rabbit'&&spawned.wild===true);
  T.ok('spawn is interior and away from scholar', !!spawned&&spawned.mx>=1&&spawned.mx<=7&&spawned.my>=1&&spawned.my<=7&&Math.max(Math.abs(spawned.mx-s.mx),Math.abs(spawned.my-s.my))>=3);
  T.ok('spawn notice fires rustle', had('animalRustle'));
  T.ok('spawn debits exactly one local animal', tile.wildlife.cottontail_rabbit===0);
  s.animal=null;fired.length=0;
  withRandom(0,()=>G.checkAnimals());
  T.ok('depleted population produces no phantom animal or rustle', !s.animal&&!had('animalRustle')&&tile.wildlife.cottontail_rabbit===0);

  // The spawned rabbit is now prepared winded and adjacent for the kill beat.
  // No reinjected retry animals or repeated lucky rolls stand in for a kill.
  s.animal=spawned;spawned.mx=4;spawned.my=4;spawned.aware=1;spawned.stamina=0;spawned.pstate='winded';spawned.edgeTurns=0;
  s.mx=4;s.my=5;s.kcal=2400;s.health=G.maxHealth();
  const meatCount=()=>s.inventory.filter(i=>i&&i.foodKind==='meat').reduce((n,i)=>n+(i.units||1),0);
  const meatBefore=meatCount();fired.length=0;
  const missKcal=s.kcal,missAt=G.log.length;
  withRandom(0,()=>G.huntAnimal());
  T.ok('failed hand strike leaves this animal alive with no meat or kill thud', s.animal===spawned&&meatCount()===meatBefore&&!had('animalKill'));
  T.ok('failed hand strike still spends its food effort', s.kcal<=missKcal-100);
  T.ok('failed hand strike emits fumble feedback', G.log.slice(missAt).some(l=>String(typeof l==='string'?l:l.text).includes('wriggles free')));
  fired.length=0;
  const logStart=G.log.length;
  const killResult=withRandom(0.3,()=>G.huntAnimal());
  console.log('KILL_RECEIPT '+JSON.stringify({result:killResult,animal:s.animal,weapon:G.equippedWeapon().name,lines:G.log.slice(logStart).map(l=>typeof l==='string'?l:l.text)}));
  T.ok('real rabbit kill puts meat in pack', meatCount()>meatBefore);
  T.ok('kill thud fires on actual kill', had('animalKill'));
  T.ok('killed rabbit leaves the grid', s.animal===null);
  T.ok('kill cannot debit the local census twice', tile.wildlife.cottontail_rabbit===0);
  }finally{G.audioEvent=originalAudio;}
  T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
