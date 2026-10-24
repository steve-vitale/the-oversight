#!/usr/bin/env node
// test-arena-cotaken-succession-20261015.js — a bearer who dies in a Blood
// arena must not hand the mantle to a co-taken contestant whose own fate is
// still unresolved (evidence/2026-10-15/diagnosis-deaths.md).
//
// The bug: tbEnd('lost') in the arena ran playerDeath first; the mantle
// passed (sometimes to a villager taken into the same contest); THEN
// _contestArenaAfter resolved the co-taken fates through the villager
// engine, which killed the brand-new bearer in the same beat (hurtVillager
// -> playerDeath('contest')). Two bearer deaths in one tick; the successor
// never got a turn. Seen 1-2x per 16 seeds (seed 1 d41, seed 5 d58).
// The fix: resolve the co-taken fates before the mantle passes.
'use strict';
const K = require('./lib');

const T = K.reporter('test-arena-cotaken-succession-20261015');

(async () => {
  const memory = new Map();
  globalThis.localStorage = {getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
  const Game = await K.load({ seed: Number(process.env.SEED || 7) });
  K.newRun(Game);
  const v = Game.state.village;
  const bearer = Game.villagerId;
  const co = (v.roster || []).find(id => id !== bearer);
  T.ok('fixture: a second villager exists', !!co, JSON.stringify(v.roster));
  v.roster = [bearer, co]; // the co-taken contestant is the only possible successor

  // the co-taken contestant's off-screen arena goes badly (fixture: died)
  const realResolve = Game.contestResolveVillager;
  // (as contestEngine's blood fight does: real wounds through hurtVillager)
  Game.contestResolveVillager = function (pid) { this.hurtVillager(pid, 500, 'contest'); return { outcome: 'died', detail: 'the beast', log: [] }; };
  const deaths = [];
  const realDeath = Game.playerDeath;
  Game.playerDeath = function (cause) { deaths.push({ cause, bearer: Game.villagerId }); return realDeath.apply(this, arguments); };

  try {
    K.fight(Game, 'hushwolf', { px: 4, py: 4, mx: 5, my: 4, hp: 100, party: true });
    Game.state.activeContest = { contestId: 'gauntlet', participant: 'player', others: [co], phase: 'live', phaseIdx: 2, phases: [], arenaSuspended: true };
    Game.state.arenaContest = { contestId: 'gauntlet', waves: ['hushwolf'], waveIdx: 0 };
    const p = Game.tbFighter('p'); p.hp = 0; p.alive = false;
    Game.tbEnd('lost');
  } finally {
    Game.contestResolveVillager = realResolve;
    Game.playerDeath = realDeath;
  }
  // Arena-loss cause is 'the arena', not generic 'combat' (gap #107,
  // proven by scripts/test-gap-w4narr-engine.js). The 2026-10-15 expectation
  // pinned the old generic cause; the mechanism under test (one death, right
  // bearer, co-taken never bearer) is unchanged. Fixed 2026-10-24 (r42).
  T.ok('the bearer died once in the arena', deaths.length >= 1 && deaths[0].cause === 'the arena' && deaths[0].bearer === bearer, JSON.stringify(deaths));
  T.ok('the co-taken contestant did not die AS the new bearer', !deaths.some(d => d.bearer === co), JSON.stringify(deaths));
  T.ok('exactly one bearer death in the beat', deaths.length === 1, JSON.stringify(deaths));
  T.ok('the co-taken fate still resolved (they are gone)', (v.roster || []).indexOf(co) < 0, JSON.stringify(v.roster));
  // A second independent fixture uses the real seeded co-taken field fight
  // and leaves a third living adult to inherit and Continue.
  K.newRun(Game);
  const village = Game.state.village, first = Game.villagerId;
  const adults = village.roster.filter(id=>id!==first && Game.npcAge(id)>=18);
  const taken = adults[0], heir = adults[1];
  if (!taken || !heir) throw Error('Three-adult prepared succession fixture unavailable');
  village.roster = [first,taken,heir];
  village.health = village.health || {}; village.health[taken] = 1;
  const person = Game.getPerson(taken); person.items=[]; person.equipped={}; person.stashed=[];
  const fates=[], fatal=[], field=[];
  const resolve = Game.contestResolveVillager, fight = Game.fieldFight, death = Game.playerDeath;
  Game.contestResolveVillager = function(pid){const r=resolve.apply(this,arguments);fates.push({pid,outcome:r.outcome});return r;};
  Game.fieldFight = function(){const r=fight.apply(this,arguments);field.push(r);return r;};
  Game.playerDeath = function(cause){fatal.push({cause,bearer:this.villagerId});return death.apply(this,arguments);};
  let contest;
  try {
    K.fight(Game,'hushwolf',{party:true});
    contest = Game.state.activeContest = {contestId:'gauntlet',participant:'player',others:[taken],phase:'live',phaseIdx:2,phases:[],arenaSuspended:true};
    Game.state.arenaContest = {contestId:'gauntlet',waves:['hushwolf'],waveIdx:0};
    const p = Game.tbFighter('p');p.hp=0;p.alive=false;
    Game.tbEnd('lost');
    Game._contestResolveOthers(contest);
  } finally {Game.contestResolveVillager=resolve;Game.fieldFight=fight;Game.playerDeath=death;}
  T.ok('real co-taken arena ran a field fight to its fatal conclusion', field.some(r=>r.rounds>0 && r.outcome==='vDie') && fates.length===1 && fates[0].outcome==='died',JSON.stringify(fates));
  T.ok('co-taken settlement is idempotent and leaves the safe adult as the single successor', fatal.length===1 && fatal[0].bearer===first && Game.villagerId===heir && !Game.isMember(taken),JSON.stringify(fatal));
  const runKey=Game.state.runKey;Game.save();
  T.ok('real Continue preserves that living successor and cleared arena', Game.load(runKey) && Game.villagerId===heir && Game.state.scholar.health>0 && !Game.state.activeContest && !Game.state.arenaContest);
  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
