// test-reunion-arena-balance-20261114.js — proof for sim-reunion-balance.
//
// The change (prereg evidence/2026-11-14/sim-reunion-balance-prereg.md,
// sweep pick H=0.4 D=0.5, Steve-ordered 2026-11-14):
//   REUNION_ARENA_HP_SCALE = 0.4, REUNION_ARENA_DMG_SCALE = 0.5.
//   In ARENA fights the Reunion spawns from a per-fight CLONE of its def:
//   HP 1200–1400 -> 480–560, Your Move 60–80 -> 30–40, Family Photo
//   48–68 -> 24–34. Plus One has no damage field, so the rally turn is
//   unchanged. The mirror cap (1) is unchanged.
//   Field fights keep the full def — the wild Reunion shares the same
//   monsters.json entry, so the clone is the scope: the shared def is
//   never mutated.
//
// Code under test:
//   - partyTactics.js tbArenaReunionMdef(mdef): returns the scaled clone
//     for the Reunion, the same object for anything else.
//   - game.js startCombat: applies the clone when mdef.id is 'reunion'
//     AND state.arenaContest was live at entry (_raidContestAtEntry).
//
// Leg 0 — unit pins on the scaler + the preregged constants.
// Leg 1 — arena fight: spawned fighter is scaled AND capped at 1; the
//   shared def is unmutated after the arena spawn.
// Leg 2 — field fight in the same process: full HP/damage, 3 mirrors
//   with a party (the scale did NOT leak into the wild).
// Leg 3 — the chained arena path (the real Gauntlet route to wave 3):
//   waves ['buffering','sunback','reunion'] — the wave-3 Reunion is
//   scaled and capped.
// The full-chain panel (scripts/mirrorcap-panel3-geared-20261113.js on
// band 86102–86117, baseline vs armed) is the behavioral judge; this
// test pins the mechanism it measures.
//
// Usage: node scripts/test-reunion-arena-balance-20261114.js
'use strict';
const K = require('./godpath/lib');
const STAGE = require('./stageally-instrument-20261106');
const CAP = require('./arena-capture-20261107');
const T = K.reporter('test-reunion-arena-balance-20261114');

function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function midOf(f) {
  const m = monsterOf(f);
  return m ? ((m.mdef && m.mdef.id) || m.monsterId || m.id || null) : null;
}
function countMonsters(Game, id) {
  try {
    return (Game.tbfight.fighters || []).filter(function (x) {
      return x && x.kind === 'monster' && ((x.mdef && x.mdef.id) || x.monsterId || x.id) === id;
    }).length;
  } catch (e) { return -1; }
}
function partyNOf(Game) {
  try {
    return (Game.tbfight.fighters || []).filter(function (x) {
      return x && (x.kind === 'player' || x.kind === 'villager') && x.alive !== false && !x.fled;
    }).length;
  } catch (e) { return -1; }
}
function photoOf(mdef) {
  try {
    return (mdef.attacks || []).find(function (a) { return a && a.name === 'Family Photo'; }) || null;
  } catch (e) { return null; }
}
function playWave(Game, cap, deathsBefore, mid, mode) {
  let guard = 0;
  while (guard++ < 600) {
    if (cap.t.deaths.length > deathsBefore) return 'died';
    const f = Game.tbfight;
    if (!f || f.over) return 'ended';
    if (midOf(f) !== mid) return 'chained';
    if (mode === 'lose') {
      const p = Game.tbFighter ? Game.tbFighter('p') : null;
      if (p && (p.hp || 0) > 1) { try { p.hp = 1; } catch (e) {} }
    }
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      if (mode === 'win') Game.tbPlayerStrike('m_0');
      else Game.tbPlayerWait();
      if (Game.tbfight && !Game.tbfight.over && midOf(Game.tbfight) === mid &&
          Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { return 'stuck'; }
    }
  }
  return 'guard';
}

(async function () {
  const Game = await K.load({ seed: 51003, narration: true });
  K.newRun(Game);
  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  const mdefs = {};
  try {
    for (const m of (Game.data.monsters || [])) mdefs[m.id] = m;
  } catch (e) {}

  // ================= Leg 0 — unit pins =================
  T.section('leg 0: scaler pins + the preregged constants');
  T.ok('HP scale constant is the preregged number (0.4)', Game.REUNION_ARENA_HP_SCALE === 0.4,
    'got=' + Game.REUNION_ARENA_HP_SCALE);
  T.ok('damage scale constant is the preregged number (0.5)', Game.REUNION_ARENA_DMG_SCALE === 0.5,
    'got=' + Game.REUNION_ARENA_DMG_SCALE);
  T.ok('mirror cap constant is still 1 (unchanged)', Game.REUNION_ARENA_MIRROR_CAP === 1,
    'got=' + Game.REUNION_ARENA_MIRROR_CAP);
  const scaled = Game.tbArenaReunionMdef(mdefs.reunion);
  T.ok('scaler returns a clone, not the shared def', scaled !== mdefs.reunion);
  T.ok('scaled HP is [480,560]', JSON.stringify(scaled.hp) === '[480,560]', 'got=' + JSON.stringify(scaled.hp));
  T.ok('scaled Your Move is [30,40]', JSON.stringify((scaled.attack || {}).damage) === '[30,40]',
    'got=' + JSON.stringify((scaled.attack || {}).damage));
  T.ok('scaled Family Photo is [24,34]', JSON.stringify((photoOf(scaled) || {}).damage) === '[24,34]',
    'got=' + JSON.stringify((photoOf(scaled) || {}).damage));
  T.ok('Plus One is unchanged (no damage field)', (scaled.attacks || []).find(function (a) { return a && a.name === 'Plus One'; }) &&
    !((scaled.attacks || []).find(function (a) { return a && a.name === 'Plus One'; }) || {}).damage);
  T.ok('scaled clone keeps id/size/speed/tactics', scaled.id === 'reunion' && scaled.size === 2 && scaled.speed === 3 &&
    !!((scaled.tactics || {}).packSpawn || {}).mirror,
    'id=' + scaled.id + ' size=' + scaled.size + ' speed=' + scaled.speed);
  T.ok('shared def is unmutated after scaling', JSON.stringify(mdefs.reunion.hp) === '[1200,1400]' &&
    JSON.stringify((mdefs.reunion.attack || {}).damage) === '[60,80]' &&
    JSON.stringify((photoOf(mdefs.reunion) || {}).damage) === '[48,68]',
    'hp=' + JSON.stringify(mdefs.reunion.hp));
  T.ok('non-Reunion def passes through as the same object',
    Game.tbArenaReunionMdef(mdefs.bulldozer) === mdefs.bulldozer &&
    Game.tbArenaReunionMdef(mdefs.hushwolf) === mdefs.hushwolf);
  T.ok('null/undefined def passes through', Game.tbArenaReunionMdef(null) === null &&
    Game.tbArenaReunionMdef(undefined) === undefined);

  // ================= Leg 1 — arena fight is scaled =================
  T.section('leg 1: arena Reunion spawns scaled, capped at 1, shared def untouched');
  K.newRun(Game);
  const deathsA0 = cap.t.deaths.length;
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['reunion'], waveIdx: 0 };
  K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('arena reunion bout started', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  const partyA = partyNOf(Game);
  T.ok('party fields 3+ fighters', partyA >= 3, 'partyN=' + partyA);
  const mA = monsterOf(Game.tbfight);
  T.ok('arena Reunion count is 1 (cap still holds)', countMonsters(Game, 'reunion') === 1,
    'reunions=' + countMonsters(Game, 'reunion'));
  T.ok('arena Reunion HP is scaled [480,560]', mA && mA.maxHp >= 480 && mA.maxHp <= 560,
    'maxHp=' + (mA && mA.maxHp));
  T.ok('arena Reunion mdef is the scaled clone', mA && mA.mdef !== mdefs.reunion &&
    JSON.stringify((mA.mdef || {}).hp) === '[480,560]',
    'mdef.hp=' + JSON.stringify((mA.mdef || {}).hp));
  T.ok('arena Reunion Your Move is [30,40]', mA && JSON.stringify(((mA.mdef || {}).attack || {}).damage) === '[30,40]',
    'got=' + JSON.stringify(((mA.mdef || {}).attack || {}).damage));
  T.ok('arena Reunion Family Photo is [24,34]', mA && JSON.stringify((photoOf(mA.mdef) || {}).damage) === '[24,34]',
    'got=' + JSON.stringify((photoOf(mA.mdef) || {}).damage));
  T.ok('shared def still full after the arena spawn', JSON.stringify(mdefs.reunion.hp) === '[1200,1400]' &&
    JSON.stringify((mdefs.reunion.attack || {}).damage) === '[60,80]',
    'hp=' + JSON.stringify(mdefs.reunion.hp));
  try { Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  T.ok('no deaths in the arena leg (count-and-flee)', cap.t.deaths.length === deathsA0);

  // ================= Leg 2 — field fight is full =================
  T.section('leg 2: field Reunion after an arena fight is still full strength');
  K.newRun(Game);
  const deathsB0 = cap.t.deaths.length;
  K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('field reunion bout started (no arenaContest live)', !!Game.tbfight && midOf(Game.tbfight) === 'reunion' &&
    !((Game.state || {}).arenaContest));
  const partyB = partyNOf(Game);
  T.ok('party fields 3+ fighters', partyB >= 3, 'partyN=' + partyB);
  const mB = monsterOf(Game.tbfight);
  T.ok('field pack is 3 (the scale did NOT leak into the wild)', countMonsters(Game, 'reunion') === 3,
    'reunions=' + countMonsters(Game, 'reunion') + ' partyN=' + partyB);
  T.ok('field Reunion HP is full [1200,1400]', mB && mB.maxHp >= 1200 && mB.maxHp <= 1400,
    'maxHp=' + (mB && mB.maxHp));
  T.ok('field Reunion mdef IS the shared def', mB && mB.mdef === mdefs.reunion);
  T.ok('field Reunion Your Move is [60,80]', mB && JSON.stringify(((mB.mdef || {}).attack || {}).damage) === '[60,80]',
    'got=' + JSON.stringify(((mB.mdef || {}).attack || {}).damage));
  T.ok('field Reunion Family Photo is [48,68]', mB && JSON.stringify((photoOf(mB.mdef) || {}).damage) === '[48,68]',
    'got=' + JSON.stringify((photoOf(mB.mdef) || {}).damage));
  try { Game.tbEnd('fled'); } catch (e) {}
  T.ok('no deaths in the field leg (count-and-flee)', cap.t.deaths.length === deathsB0);

  // ================= Leg 3 — chained arena path =================
  T.section('leg 3: chained arena — wave-3 Reunion is scaled and capped');
  K.newRun(Game);
  const deathsC0 = cap.t.deaths.length;
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 };
  const mfC = K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('buffering bout started', !!Game.tbfight && midOf(Game.tbfight) === 'buffering');
  if (mfC) mfC.hp = 100;
  T.ok('wave 1 won (chained)', playWave(Game, cap, deathsC0, 'buffering', 'win') === 'chained');
  const sunC = monsterOf(Game.tbfight || {});
  if (sunC) sunC.hp = 100;
  T.ok('wave 2 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'sunback');
  T.ok('wave 2 won (chained)', playWave(Game, cap, deathsC0, 'sunback', 'win') === 'chained');
  T.ok('wave 3 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  const mC = monsterOf(Game.tbfight);
  T.ok('chained wave-3 pack is exactly 1 Reunion', countMonsters(Game, 'reunion') === 1,
    'reunions=' + countMonsters(Game, 'reunion'));
  T.ok('chained wave-3 Reunion HP is scaled [480,560]', mC && mC.maxHp >= 480 && mC.maxHp <= 560,
    'maxHp=' + (mC && mC.maxHp));
  T.ok('chained wave-3 Reunion Your Move is [30,40]',
    mC && JSON.stringify(((mC.mdef || {}).attack || {}).damage) === '[30,40]',
    'got=' + JSON.stringify(((mC.mdef || {}).attack || {}).damage));
  try { Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  T.ok('no deaths in the chained leg (count-and-flee)', cap.t.deaths.length === deathsC0);

  T.ok('no instrument errors', (t.instrumentErrors || []).length === 0 && (cap.t.instrumentErrors || []).length === 0,
    JSON.stringify((t.instrumentErrors || []).concat(cap.t.instrumentErrors || [])));
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
