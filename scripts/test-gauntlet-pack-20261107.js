// test-gauntlet-pack-20261107.js — proof for sim-gauntlet-pack-b (DIAG only, zero src/js).
//
// Q1: is the Gauntlet wave-3 pack party-mirrored or a fixed pack?
// Q3: the deciding observation (prereg): for a FIXED drawn wave list,
//   the Reunion count on wave 3 equals min(3, partyN) — 1 solo, 3 with a
//   4-person party — while the drawn beast ids do not depend on party size.
//   Fixed pack = same count regardless of partyN.
//
// Code under test (read before writing; line numbers drift, grep by name):
//   - contests.js _contestArena: waves fixed by the phase spec
//     ({waves: 3} Gauntlet, contests.js:3040); beast ids drawn uniformly
//     from monsterWavePool() filtered wave <= unlockedWave()+hot.
//   - game.js startCombat + partyTactics.js tbPackSpawnCount: Reunion is
//     the ONLY monster with packSpawn {mirror:true, max:3} (monsters.json).
//   - The mirror therefore lives in the MONSTER def, applied at spawn —
//     not in the contest. The Gauntlet draws; the Reunion mirrors.
//
// Leg 1 — mirror contrast: identical wave list ['buffering','sunback',
//   'reunion'] with a party (partyN>=3) vs solo (partyN 1); count the
//   Reunions spawned on wave 3. Plus unit pins on tbPackSpawnCount.
// Leg 2 — draw rule live: 12 real _contestArena calls (Gauntlet spec);
//   every draw has 3 waves, every beast within wave <= unlockedWave()+1,
//   draws vary (not a fixed list). Pit spec {waves:1} draws 1 wave.
// The wave-4 lethality sweep is scripts/gauntlet-sweep-20261107.js
// (separate sim driver; it writes the corpus). This test pins the
// mechanism the sweep measures.
//
// Usage: node scripts/test-gauntlet-pack-20261107.js
'use strict';
const K = require('./godpath/lib');
const STAGE = require('./stageally-instrument-20261106');
const CAP = require('./arena-capture-20261107');
const T = K.reporter('test-gauntlet-pack-20261107');

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
  // Same fight-driving pattern as test-arena-20261107 (arena-b):
  // strike m_0 to win, wait to lose; advance explicitly while the SAME
  // bout is live — never once it has chained, or the new bout's opening
  // player turn is skipped. Returns 'chained' | 'ended' | 'died' | 'guard' | 'stuck'.
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

  // ================= Leg 0 — unit pins on the interpreter =================
  T.section('leg 0: tbPackSpawnCount pins (partyTactics.js)');
  T.ok('reunion def carries mirror:true max:3', !!(((mdefs.reunion || {}).tactics || {}).packSpawn || {}).mirror &&
    (((mdefs.reunion || {}).tactics || {}).packSpawn || {}).max === 3,
    JSON.stringify((mdefs.reunion || {}).tactics));
  T.ok('reunion is the ONLY mirror pack-spawner', Object.keys(mdefs).filter(function (id) {
    return ((mdefs[id].tactics || {}).packSpawn || {}).mirror;
  }).join(',') === 'reunion');
  T.ok('reunion mirrors 1 at partyN 1', Game.tbPackSpawnCount(mdefs.reunion, 1) === 1, 'got=' + Game.tbPackSpawnCount(mdefs.reunion, 1));
  T.ok('reunion mirrors 2 at partyN 2', Game.tbPackSpawnCount(mdefs.reunion, 2) === 2, 'got=' + Game.tbPackSpawnCount(mdefs.reunion, 2));
  T.ok('reunion mirrors 3 at partyN 4', Game.tbPackSpawnCount(mdefs.reunion, 4) === 3, 'got=' + Game.tbPackSpawnCount(mdefs.reunion, 4));
  T.ok('reunion mirrors 3 at partyN 6 (capped)', Game.tbPackSpawnCount(mdefs.reunion, 6) === 3, 'got=' + Game.tbPackSpawnCount(mdefs.reunion, 6));
  T.ok('hushwolf party 4 / solo 1', Game.tbPackSpawnCount(mdefs.hushwolf, 4) === 4 && Game.tbPackSpawnCount(mdefs.hushwolf, 1) === 1);
  T.ok('heckler party 3 / solo 1', Game.tbPackSpawnCount(mdefs.heckler, 4) === 3 && Game.tbPackSpawnCount(mdefs.heckler, 1) === 1);

  // ================= Leg 1a — party mirror (partyN>=3 -> 3) =================
  T.section('leg 1a: same wave list WITH a party — wave 3 spawns 3 Reunions');
  K.newRun(Game);
  const deathsA0 = cap.t.deaths.length;
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 };
  const mfA = K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('buffering bout started', !!Game.tbfight && midOf(Game.tbfight) === 'buffering');
  const partyA = partyNOf(Game);
  T.ok('party fields 3+ fighters (scholar + allies)', partyA >= 3, 'partyN=' + partyA);
  if (mfA) mfA.hp = 100; // fast bout; the chain is HP-independent (arena-b pattern)
  T.ok('wave 1 won (chained)', playWave(Game, cap, deathsA0, 'buffering', 'win') === 'chained');
  const sunA = monsterOf(Game.tbfight || {});
  if (sunA) sunA.hp = 100;
  T.ok('wave 2 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'sunback');
  T.ok('wave 2 won (chained)', playWave(Game, cap, deathsA0, 'sunback', 'win') === 'chained');
  T.ok('wave 3 live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  const packA = countMonsters(Game, 'reunion');
  T.ok('wave-3 pack is min(3, partyN) with a party', packA === Math.min(3, partyA), 'reunions=' + packA + ' partyN=' + partyA);
  T.ok('wave-3 pack is 3 (the Sari shape)', packA === 3, 'reunions=' + packA);
  // Count at spawn, then flee to close the contest cleanly.
  try { Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  T.ok('no deaths in the party mirror leg (count-and-flee)', cap.t.deaths.length === deathsA0);

  // ================= Leg 1b — solo contrast (partyN 1 -> 1) =================
  T.section('leg 1b: SAME wave list SOLO — wave 3 spawns 1 Reunion');
  K.newRun(Game);
  const deathsB0 = cap.t.deaths.length;
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 };
  const mfB = K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, hp: 1000 });
  T.ok('buffering bout started (solo)', !!Game.tbfight && midOf(Game.tbfight) === 'buffering');
  const partyB = partyNOf(Game);
  T.ok('solo scholar fights alone (partyN 1)', partyB === 1, 'partyN=' + partyB);
  if (mfB) mfB.hp = 100;
  T.ok('wave 1 won solo (chained)', playWave(Game, cap, deathsB0, 'buffering', 'win') === 'chained');
  const sunB = monsterOf(Game.tbfight || {});
  if (sunB) sunB.hp = 100;
  T.ok('wave 2 live after chain (solo)', !!Game.tbfight && midOf(Game.tbfight) === 'sunback');
  T.ok('wave 2 won solo (chained)', playWave(Game, cap, deathsB0, 'sunback', 'win') === 'chained');
  T.ok('wave 3 live after chain (solo)', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  const packB = countMonsters(Game, 'reunion');
  T.ok('wave-3 pack is min(3, partyN) solo', packB === Math.min(3, partyB), 'reunions=' + packB + ' partyN=' + partyB);
  T.ok('wave-3 pack is 1 solo (not 3 — the mirror moves with party size)', packB === 1, 'reunions=' + packB);
  T.ok('the contrast is the deciding observation (3 partied vs 1 solo)', packA === 3 && packB === 1, 'party=' + packA + ' solo=' + packB);
  try { Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  T.ok('no deaths in the solo mirror leg (count-and-flee)', cap.t.deaths.length === deathsB0);

  // ================= Leg 2 — the draw rule, live =================
  T.section('leg 2: _contestArena draws the waves (not a fixed list)');
  K.newRun(Game);
  const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
  T.ok('fresh run is at unlockedWave 1 (draw pool is wave<=2)', uw === 1, 'uw=' + uw);
  const draws = [];
  const seenIds = {};
  let drawErrors = 0;
  for (let d = 0; d < 12; d++) {
    try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
    let res = null;
    try { res = Game._contestArena({ contestId: 'gauntlet' }, { waves: 3 }, []); } catch (e) { drawErrors++; }
    const arc = (Game.state || {}).arenaContest;
    const waves = (arc && arc.waves) ? arc.waves.slice() : null;
    T.ok('draw ' + d + ' returned an arena with 3 waves', !!(res && res.arena) && Array.isArray(waves) && waves.length === 3, 'waves=' + JSON.stringify(waves));
    if (waves) {
      draws.push(waves.join('+'));
      for (const id of waves) {
        seenIds[id] = (seenIds[id] || 0) + 1;
        const wv = ((mdefs[id] || {}).wave || 1);
        if (wv > uw + 1) T.ok('drawn beast within wave<=unlocked+1 (hot rule)', false, 'id=' + id + ' wave=' + wv + ' uw=' + uw);
      }
    }
    // End the bout (fled) so the next draw starts clean.
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { drawErrors++; }
    try { Game.state.arenaContest = null; } catch (e) {}
    try { Game.state.activeContest = null; } catch (e) {}
  }
  T.ok('all drawn beasts within wave<=unlockedWave+1', true); // per-beast assertions above would have failed loudly
  const distinctLists = new Set(draws).size;
  const distinctIds = Object.keys(seenIds).length;
  T.ok('draws vary (not a fixed wave list)', distinctLists >= 6, 'distinctLists=' + distinctLists + ' of 12: ' + draws.join(' | '));
  T.ok('many distinct beasts drawn (uniform pool, not one script)', distinctIds >= 10, 'distinctIds=' + distinctIds);
  T.ok('no draw errors', drawErrors === 0, 'errors=' + drawErrors);
  // Pit spec draws exactly 1 wave.
  try { Game.state.activeContest = { contestId: 'pit' }; } catch (e) {}
  const pitRes = Game._contestArena({ contestId: 'pit' }, { waves: 1 }, []);
  const pitWaves = ((Game.state || {}).arenaContest || {}).waves;
  T.ok('pit spec draws 1 wave', !!(pitRes && pitRes.arena) && Array.isArray(pitWaves) && pitWaves.length === 1, 'waves=' + JSON.stringify(pitWaves));
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}

  T.ok('no instrument errors', (t.instrumentErrors || []).length === 0 && (cap.t.instrumentErrors || []).length === 0,
    JSON.stringify((t.instrumentErrors || []).concat(cap.t.instrumentErrors || [])));
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
