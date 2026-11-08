// test-mirror-cap-20261107.js — proof for sim-mirrorcap (Build 2).
//
// The cap (prereg evidence/2026-11-07/sim-mirrorcap-prereg.md, frozen):
//   REUNION_ARENA_MIRROR_CAP = 1 — in ARENA fights the Reunion spawns at
//   most one mirror, whatever the party size. Non-arena Reunion fights
//   keep min(3, partyN).
//
// Code under test (read before writing; line numbers drift, grep by name):
//   - partyTactics.js tbPackSpawnCount(mdef, partyN, opts): opts.arena
//     caps a mirror pack at G.REUNION_ARENA_MIRROR_CAP (1).
//   - game.js startCombat: passes { arena: _raidContestAtEntry } — true
//     exactly when state.arenaContest was live at entry, which
//     _contestArena sets before startCombat (and re-sets per chained
//     wave). Field fights keep the old behavior.
//   - The Reunion's mid-fight "Plus One" rally buffs allies; it spawns
//     nothing, so the spawn cap bounds the total mirrors in the fight.
//
// Leg 0 — unit pins on the interpreter (incl. the preregged constant).
// Leg 1 — arena chain: fixed wave list ['buffering','sunback','reunion']
//   with a party — wave 3 spawns exactly 1 Reunion (uncapped it was 3).
// Leg 2 — non-arena control: same party, field fight — still 3 mirrors;
//   solo still 1.
// Leg 3 — the real _contestArena path: the flag the cap reads is set by
//   the real draw, and the spawned count equals the capped prediction
//   for whatever beast was drawn.
// The 16-chain before/after panel is scripts/mirrorcap-panel-20261107.js
// (separate sim driver; it writes the corpus). This test pins the
// mechanism the panel measures.
//
// Usage: node scripts/test-mirror-cap-20261107.js
'use strict';
const K = require('./godpath/lib');
const STAGE = require('./stageally-instrument-20261106');
const CAP = require('./arena-capture-20261107');
const T = K.reporter('test-mirror-cap-20261107');

function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function midOf(f) {
  const m = monsterOf(f);
  return m ? ((m.mdef && m.mdef.id) || m.monsterId || m.id || null) : null;
}
function pFighter(Game) {
  try { return Game.tbFighter ? Game.tbFighter('p') : null; } catch (e) { return null; }
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

function playWave(Game, cap, deathsBefore, mid, mode) {
  // Arena-b fight-driving pattern (test-gauntlet-pack-20261107):
  // strike m_0 to win, wait to lose; advance explicitly while the SAME
  // bout is live — never once it has chained. Returns
  // 'chained' | 'ended' | 'died' | 'guard' | 'stuck'.
  let guard = 0;
  while (guard++ < 600) {
    if (cap.t.deaths.length > deathsBefore) return 'died';
    const f = Game.tbfight;
    if (!f || f.over) return 'ended';
    if (midOf(f) !== mid) return 'chained';
    if (mode === 'lose') {
      const p = pFighter(Game);
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
  T.section('leg 0: tbPackSpawnCount pins + the preregged constant');
  T.ok('cap constant is the preregged number (1)', Game.REUNION_ARENA_MIRROR_CAP === 1,
    'got=' + Game.REUNION_ARENA_MIRROR_CAP);
  T.ok('reunion def still carries mirror:true max:3 (field behavior untouched)',
    !!(((mdefs.reunion || {}).tactics || {}).packSpawn || {}).mirror &&
    (((mdefs.reunion || {}).tactics || {}).packSpawn || {}).max === 3,
    JSON.stringify((mdefs.reunion || {}).tactics));
  T.ok('reunion is the ONLY mirror pack-spawner', Object.keys(mdefs).filter(function (id) {
    return ((mdefs[id].tactics || {}).packSpawn || {}).mirror;
  }).join(',') === 'reunion');
  T.ok('field: reunion mirrors 1/2/3/3 at partyN 1/2/4/6 (no opts)',
    Game.tbPackSpawnCount(mdefs.reunion, 1) === 1 &&
    Game.tbPackSpawnCount(mdefs.reunion, 2) === 2 &&
    Game.tbPackSpawnCount(mdefs.reunion, 4) === 3 &&
    Game.tbPackSpawnCount(mdefs.reunion, 6) === 3,
    'got=' + [1, 2, 4, 6].map(function (n) { return Game.tbPackSpawnCount(mdefs.reunion, n); }).join('/'));
  T.ok('field: reunion mirrors 1/2/3/3 at partyN 1/2/4/6 (arena:false)',
    Game.tbPackSpawnCount(mdefs.reunion, 1, { arena: false }) === 1 &&
    Game.tbPackSpawnCount(mdefs.reunion, 2, { arena: false }) === 2 &&
    Game.tbPackSpawnCount(mdefs.reunion, 4, { arena: false }) === 3 &&
    Game.tbPackSpawnCount(mdefs.reunion, 6, { arena: false }) === 3,
    'got=' + [1, 2, 4, 6].map(function (n) { return Game.tbPackSpawnCount(mdefs.reunion, n, { arena: false }); }).join('/'));
  T.ok('arena: reunion mirrors 1/1/1/1 at partyN 1/2/4/6 (arena:true)',
    Game.tbPackSpawnCount(mdefs.reunion, 1, { arena: true }) === 1 &&
    Game.tbPackSpawnCount(mdefs.reunion, 2, { arena: true }) === 1 &&
    Game.tbPackSpawnCount(mdefs.reunion, 4, { arena: true }) === 1 &&
    Game.tbPackSpawnCount(mdefs.reunion, 6, { arena: true }) === 1,
    'got=' + [1, 2, 4, 6].map(function (n) { return Game.tbPackSpawnCount(mdefs.reunion, n, { arena: true }); }).join('/'));
  T.ok('arena cap touches mirrors only: hushwolf 4 / heckler 3 at partyN 4 even with arena:true',
    Game.tbPackSpawnCount(mdefs.hushwolf, 4, { arena: true }) === 4 &&
    Game.tbPackSpawnCount(mdefs.heckler, 4, { arena: true }) === 3,
    'got=' + Game.tbPackSpawnCount(mdefs.hushwolf, 4, { arena: true }) + '/' +
    Game.tbPackSpawnCount(mdefs.heckler, 4, { arena: true }));

  // ================= Leg 1 — arena chain spawns 1 =================
  T.section('leg 1: arena chain WITH a party — wave 3 spawns exactly 1 Reunion');
  K.newRun(Game);
  const deathsA0 = cap.t.deaths.length;
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 };
  const mfA = K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('buffering bout started', !!Game.tbfight && midOf(Game.tbfight) === 'buffering');
  const partyA = partyNOf(Game);
  T.ok('party fields 3+ fighters (uncapped this would be 3 mirrors)', partyA >= 3, 'partyN=' + partyA);
  if (mfA) mfA.hp = 100; // fast bout; the chain is HP-independent (arena-b pattern)
  T.ok('wave 1 won (chained)', playWave(Game, cap, deathsA0, 'buffering', 'win') === 'chained');
  const sunA = monsterOf(Game.tbfight || {});
  if (sunA) sunA.hp = 100;
  T.ok('wave 2 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'sunback');
  T.ok('wave 2 won (chained)', playWave(Game, cap, deathsA0, 'sunback', 'win') === 'chained');
  T.ok('wave 3 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  const packA = countMonsters(Game, 'reunion');
  T.ok('wave-3 arena pack is exactly 1 Reunion (the cap)', packA === 1, 'reunions=' + packA + ' partyN=' + partyNOf(Game));
  T.ok('wave-3 arena pack is capped, not mirrored (would be min(3, partyN) = ' + Math.min(3, partyA) + ')',
    packA === 1 && Math.min(3, partyA) === 3, 'reunions=' + packA);
  try { Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  T.ok('no deaths in the arena-cap leg (count-and-flee)', cap.t.deaths.length === deathsA0);

  // ================= Leg 2 — non-arena control =================
  T.section('leg 2: field (non-arena) Reunion still mirrors — no regression');
  K.newRun(Game);
  const deathsB0 = cap.t.deaths.length;
  const mfB = K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('field reunion bout started (no arenaContest live)', !!Game.tbfight && midOf(Game.tbfight) === 'reunion' &&
    !((Game.state || {}).arenaContest), 'arenaContest=' + JSON.stringify((Game.state || {}).arenaContest));
  const partyB = partyNOf(Game);
  T.ok('party fields 3+ fighters', partyB >= 3, 'partyN=' + partyB);
  const packB = countMonsters(Game, 'reunion');
  T.ok('field pack is min(3, partyN) = 3 with a party', packB === Math.min(3, partyB), 'reunions=' + packB + ' partyN=' + partyB);
  T.ok('field pack is 3 (the cap did NOT leak into the wild)', packB === 3, 'reunions=' + packB);
  try { Game.tbEnd('fled'); } catch (e) {}
  T.ok('no deaths in the field-control leg (count-and-flee)', cap.t.deaths.length === deathsB0);
  // Solo field fight still mirrors 1.
  K.newRun(Game);
  const deathsC0 = cap.t.deaths.length;
  K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, hp: 1000 });
  T.ok('solo field bout started', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  T.ok('solo scholar fights alone (partyN 1)', partyNOf(Game) === 1, 'partyN=' + partyNOf(Game));
  T.ok('solo field pack is 1', countMonsters(Game, 'reunion') === 1, 'reunions=' + countMonsters(Game, 'reunion'));
  try { Game.tbEnd('fled'); } catch (e) {}
  T.ok('no deaths in the solo leg', cap.t.deaths.length === deathsC0);

  // ================= Leg 3 — the real _contestArena path =================
  T.section('leg 3: real _contestArena sets the flag the cap reads');
  K.newRun(Game);
  const deathsD0 = cap.t.deaths.length;
  let realDraws = 0, realMatches = 0;
  for (let d = 0; d < 3; d++) {
    try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
    let res = null;
    try { res = Game._contestArena({ contestId: 'gauntlet' }, { waves: 3 }, []); } catch (e) {}
    const arc = (Game.state || {}).arenaContest;
    const waves = (arc && arc.waves) ? arc.waves.slice() : null;
    if (res && res.arena && waves && waves.length === 3 && Game.tbfight) {
      realDraws++;
      const mid = midOf(Game.tbfight);
      const got = countMonsters(Game, mid);
      const want = Game.tbPackSpawnCount(mdefs[mid], partyNOf(Game), { arena: true });
      if (got === want) realMatches++;
      else T.ok('real arena draw ' + d + ': spawned count equals the capped prediction', false,
        'id=' + mid + ' got=' + got + ' want=' + want + ' partyN=' + partyNOf(Game));
    }
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
    try { Game.state.arenaContest = null; } catch (e) {}
    try { Game.state.activeContest = null; } catch (e) {}
  }
  T.ok('3 real _contestArena draws started live fights', realDraws === 3, 'draws=' + realDraws);
  T.ok('spawned count matched the capped prediction on all 3 real draws', realMatches === 3, 'matches=' + realMatches);
  T.ok('no deaths in the real-draw leg', cap.t.deaths.length === deathsD0);

  T.ok('no instrument errors', (t.instrumentErrors || []).length === 0 && (cap.t.instrumentErrors || []).length === 0,
    JSON.stringify((t.instrumentErrors || []).concat(cap.t.instrumentErrors || [])));
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
