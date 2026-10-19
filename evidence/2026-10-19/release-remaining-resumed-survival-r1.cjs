#!/usr/bin/env node
// Steve's last correction in session_01QPzbuApDmn3auifxsV7pNN:
// human gear stays vulnerable; advanced armor stops beams; current-wave raids.
'use strict';
const K = require('../../scripts/godpath/lib');
const T = K.reporter('resumed-survival');
const fixed = (n, fn) => { const r = Math.random; Math.random = () => n; try { return fn(); } finally { Math.random = r; } };
(async () => {
  const G = await K.load({ seed: 7 });
  K.newRun(G); G.state.systemArrived = true;
  const s = G.state.scholar, v = G.state.village;
  const mf = K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 7, my: 4 });
  const f = G.tbfight, p = G.tbFighter('p');
  s.abilities = []; s.equipped = {}; s.godhood = { active: [] };
  const resetHP = (n = 100) => { p.hp = p.maxHp = s.health = n; p.alive = true; };
  resetHP();
  let n = fixed(0.999, () => G.apBeamHit('player', 0, 'test', { sourceKey: mf.key }));
  T.ok('human-class maximum beam leaves a healthy bearer alive', n === 85 && p.hp === 15, `${n} / ${p.hp}`);
  resetHP(240);
  n = fixed(0, () => G.apBeamHit('player', 0, 'test', { sourceKey: mf.key }));
  T.ok('beam reads the actual fighter max HP (not stale scholar.maxHp)', n === 156 && p.hp === 84, n);
  s.equipped = { torso: { itemId: 'riot_gear' } };
  T.ok('human full-body armor supplies no beam resistance', G.apBeamResistPieces().length === 0);
  s.equipped = { torso: { itemId: 'worldroot_plate' }, hands: { itemId: 'alien_gauntlets' } };
  T.ok('advanced full-body armor covers four slots, plus hands', G.apBeamResistPieces().length === 5);
  resetHP(); n = fixed(0.999, () => G.apBeamHit('p', 0, 'test', { sourceKey: mf.key }));
  T.ok('sufficient gear makes the same beam survivable repeatedly', n === 14 && p.hp === 86, n);
  // An unworn prize and a keepsake cannot shield a body.
  s.equipped = {}; s.inventory.push({ itemId: 'worldroot_plate' });
  T.ok('inventory armor supplies no resistance', G.apBeamResistPieces().length === 0);
  resetHP();
  const alien = G.apBuildFighter('vex_marlowe');
  f.fighters.push(alien);
  let startHP = p.hp;
  T.ok('alien spends a turn aiming', fixed(0, () => G.apMaybeBeamAttack(alien)) === true);
  T.ok('wind-up deals no damage and records the aimed tile', p.hp === startHP && alien._beamAim && alien._beamAim.x === p.mx);
  p.mx++;
  fixed(0, () => G.apMaybeBeamAttack(alien));
  T.ok('moving off the aimed tile dodges the discharge', p.hp === startHP && !alien._beamAim);
  for (let i = 0; i < 3; i++) fixed(0, () => G.apMaybeBeamAttack(alien));
  fixed(0, () => G.apMaybeBeamAttack(alien));
  fixed(0, () => G.apMaybeBeamAttack(alien));
  T.ok('staying on the aimed tile takes the next shot', p.hp < startHP);
  G.tbfight = null;

  // Keep raids deterministic while letting the actual raid, crisis and dawn
  // code run. No defender, so the raid survives for a second dawn.
  K.newRun(G); G.state.systemArrived = true;
  const vv = G.state.village;
  G.state.scholar.day = 20; vv.lastRaidDay = -100; vv.roster = [];
  G.pantryKcalLive = () => 25000; G.playerAtHaven = () => false;
  G.unlockedWave = () => 3; G.tableActive = () => false;
  G.seedGossip = () => {}; G.raidPillage = () => 0;
  const defs = G.data.monsters;
  const ids = w => defs.filter(m => m.wave === w && !m.campaignOnly).slice(0, 5);
  const mon = (d, i) => ({ id: d.id, tx: i, ty: 0, hp: 100, maxHp: 100 });
  const ms = ids(1).slice(0, 2).concat(ids(3), ids(5).slice(0, 2)).map(mon);
  G.worldMonsters = () => ms;
  let fired = false; for (let i = 0; i < 200 && !fired; i++) fired = G.havenRaidTick();
  T.ok('a current-wave raid fires', fired === true);
  const raiders = ms.filter(m => m.raidPost);
  T.ok('only current-wave monsters join (neither older nor future waves)', raiders.length >= 3 && raiders.every(m => defs.find(d => d.id === m.id).wave === 3));
  T.ok('every raider has its own world tile', new Set(raiders.map(m => `${m.tx},${m.ty}`)).size === raiders.length);
  const posts = raiders.map(m => `${m.tx},${m.ty}`);
  G.havenGrowthDaily();
  T.ok('dawn preserves separate treeline posts', raiders.every((m, i) => `${m.tx},${m.ty}` === posts[i]));
  let crisis = G.aidCrisis();
  T.ok('crisis carries the real current wave', crisis && crisis.wave === 3);
  // Leave only an adjacent post: the Haven tile alone cannot decide whether
  // the siege is over.
  const off = raiders.find(m => m.tx !== 4 || m.ty !== 4);
  ms.splice(0, ms.length, off); crisis.ageParts = 3;
  G.commsTick();
  T.ok('a raider on an adjacent post keeps the aid crisis open', G.aidCrisis() === crisis);
  ms.length = 0; G.commsTick();
  T.ok('clearing the last post resolves the siege', !G.aidCrisis());
  // Protection follows a relocated Haven, not a hardcoded world coordinate.
  K.newRun(G); G.state.village.px = 3; G.state.village.py = 3;
  G.state.village.havenTier = 2; G.map.px = 3; G.map.py = 3;
  G._sleeping = { quality: 'bed' };
  const originalMonster = G.playerMonster; let turns = 0;
  G.playerMonster = () => { turns++; return null; };
  G.monsterTurn(); G.playerMonster = originalMonster; G._sleeping = null;
  T.ok('sleep protection follows the actual Haven location', turns === 0);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
