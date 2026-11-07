// gauntlet-sweep-20261107.js — synthetic Gauntlet sweep for sim-gauntlet-pack-b (DIAG only, zero src/js).
//
// Measures real Gauntlet chains at unlockedWave 4, played to win, with a
// 4-person party (scholar + 3 allies at Haven) — the Sari shape. The draw
// is the REAL _contestArena draw (uniform from monsterWavePool, hot +1 on
// waves 2-3); fights are REAL turn-based fights, played with the arena-b
// fight-driving pattern (strike the first LIVE monster each player turn,
// tbAdvance otherwise); no HP is nerfed anywhere.
//
// FIXTURE STAGING (documented, test-process only — the code under test is
// untouched): the unlock gate is bypassed so the sweep runs at wave 4
// without playing a whole village up to standing 100 + readiness first.
// Game.unlockedWave is overridden to return 4 on the test-process Game
// object only. The sweep FAILS LOUDLY (exit 2) unless the LIVE pool is
// exactly the real wave-4 pool (58 monsters — 59 in monsters.json minus
// the Herald, which titans.js excludes from monsterWavePool: "titans
// never wander, they arrive by omen only" — plus the finale-campaign
// campaignOnly filter; measured live, see evidence file) and contains
// the Reunion, so a wrong bypass can never silently measure the wrong
// pool. The draw, the pack spawn, the wave chain and the fights are the
// real code; only the gate is staged. (First attempt used cfg overrides:
// waveLedgerCfg bars 0 + standingCfg t4 0 — both defeated by `||`
// fallbacks in the gate code (`(bar[2]|0)||5`, `(sc.t4|0)||100`) and by
// the readiness deferral; the direct override stages LESS game state,
// not more, and is stated here instead of hidden behind three
// half-working overrides.)
// The staged scholar is FRESH (100 HP, no gear, no wave-4 kill) — the
// sweep measures wave-3 lethality for a 4-person party at wave 4, NOT
// replay lethality for a geared killer; the killer-concentration half of
// Q2 comes from the full-sim replay legs (killerTrack) + corpus cases,
// per the prereg. Say so in the evidence file.
//
// Per chain records: waves drawn (ids), per-wave outcome/rounds/
// scholar-HP-frac-after/monster-HP-frac-left/pack counts, partyN,
// deaths (scholar id, cause, waveIdx). Corpus JSON goes to
// evidence/2026-11-07/perseed-gauntlet-pack-b/sweep-gauntlet-pack-b.json
// (sims write once, on purpose; refuses to overwrite).
// Usage: CHAINS=16 SEED=51004 node scripts/gauntlet-sweep-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const K = require(path.join(REPO, 'scripts', 'godpath', 'lib'));
const STAGE = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(REPO, 'scripts', 'arena-capture-20261107'));

const N = parseInt(process.env.CHAINS || '16', 10) || 16;
const SEED = parseInt(process.env.SEED || '51004', 10) || 51004;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outFile = process.env.OUT || path.join(REPO, 'evidence', '2026-11-07', 'perseed-gauntlet-pack-b', 'sweep-gauntlet-pack-b.json');
if (fs.existsSync(outFile)) { console.error('SWEEP STOP: refusing to overwrite ' + outFile); process.exit(3); }

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
function liveMonsterKey(Game) {
  try {
    const ms = (Game.tbfight.fighters || []).filter(function (x) { return x && x.kind === 'monster' && x.alive !== false && !x.fled; });
    return ms.length ? (ms[0].key || 'm_0') : null;
  } catch (e) { return null; }
}
function packCounts(Game) {
  const out = {};
  try {
    for (const x of (Game.tbfight.fighters || [])) {
      if (!x || x.kind !== 'monster') continue;
      const id = (x.mdef && x.mdef.id) || x.monsterId || x.id || '?';
      out[id] = (out[id] || 0) + 1;
    }
  } catch (e) {}
  return out;
}
function partyNOf(Game) {
  try {
    return (Game.tbfight.fighters || []).filter(function (x) {
      return x && (x.kind === 'player' || x.kind === 'villager') && x.alive !== false && !x.fled;
    }).length;
  } catch (e) { return -1; }
}
function hpFrac(f) {
  try {
    if (!f || f.maxHp == null || !f.maxHp) return null;
    return Math.round((f.hp / f.maxHp) * 1000) / 1000;
  } catch (e) { return null; }
}

function playWave(Game, cap, deathsBefore, mid) {
  // Play to WIN: strike the first live monster each player turn.
  // Returns {res, steps} with res in chained|ended|died|guard|stuck.
  let steps = 0;
  while (steps++ < 600) {
    if (cap.t.deaths.length > deathsBefore) return { res: 'died', steps: steps };
    const f = Game.tbfight;
    if (!f || f.over) return { res: 'ended', steps: steps };
    if (midOf(f) !== mid) return { res: 'chained', steps: steps };
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      const key = liveMonsterKey(Game);
      if (key) { try { Game.tbPlayerStrike(key); } catch (e) {} }
      else { try { Game.tbPlayerWait(); } catch (e) {} }
      if (Game.tbfight && !Game.tbfight.over && midOf(Game.tbfight) === mid &&
          Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { return { res: 'stuck', steps: steps }; }
    }
  }
  return { res: 'guard', steps: steps };
}

(async function () {
  const Game = await K.load({ seed: SEED, narration: true });

  // --- Fixture: bypass ONLY the unlock gate (see header). ---
  Game.unlockedWave = function () { return 4; };
  const mdefs = {};
  try { for (const m of (Game.data.monsters || [])) mdefs[m.id] = m; } catch (e) {}

  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  function stageChain() {
    K.newRun(Game);
    try { Game.state.scholar.day = 30; } catch (e) {}
    // Scholar at Haven centre (4,4, inside — the door filter in
    // ensureVillagerPositions keeps inside villagers' positions there;
    // at the (0,0) corner it dropped one placed ally, partyN came out 3
    // in sweep v2). Exactly 3 allies adjacent; the ROSTER is trimmed to
    // those 3 for the fixture, so no 4th villager can join (from (4,4)
    // no tile is more than 4 away, so "move the rest far away" cannot
    // work — v1's bug). K.newRun rebuilds the roster each chain.
    try {
      const s = Game.state.scholar;
      s.mx = 4; s.my = 4;
      if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
      const roster = ((Game.state.village || {}).roster || []).slice();
      const vpos = (Game.state.village || {}).positions || {};
      const spots = [{ mx: 3, my: 4 }, { mx: 5, my: 4 }, { mx: 4, my: 3 }];
      // The roster CONTAINS the scholar's own id (startCombat skips it);
      // choosing slice(0,3) blindly can include the scholar and yield only
      // 2 allies — the v2/v3 bug. Exclude the scholar first.
      const chosen = roster.filter(function (rid) { return rid !== Game.villagerId; }).slice(0, 3);
      chosen.forEach(function (rid, i) { vpos[rid] = spots[i]; });
      Game.state.village.roster = chosen;
    } catch (e) {}
    const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : -1;
    return uw;
  }

  const uw0 = stageChain();
  let pool0 = [];
  try { pool0 = Game.monsterWavePool ? Game.monsterWavePool() : []; } catch (e) {}
  const poolOk = uw0 === 4 && pool0.length === 58 &&
    pool0.some(function (m) { return m.id === 'reunion'; }) &&
    !pool0.some(function (m) { return m.id === 'herald'; });
  if (!poolOk) {
    console.error('SWEEP STOP: fixture failed — unlockedWave()=' + uw0 + ' poolSize=' + pool0.length +
      ' hasReunion=' + pool0.some(function (m) { return m.id === 'reunion'; }) +
      ' hasHerald=' + pool0.some(function (m) { return m.id === 'herald'; }) +
      ' (expected 4 / 58 / true / false). Not measuring the wrong pool.');
    process.exit(2);
  }
  let poolSize = pool0.length;

  const chains = [];
  for (let c = 0; c < N; c++) {
    if (c > 0) {
      const uw = stageChain();
      if (uw !== 4) { console.error('SWEEP STOP: fixture failed on chain ' + c + ' — unlockedWave()=' + uw); process.exit(2); }
    }
    const chain = { chain: c, waves: null, partyN: null, perWave: [], outcome: null, deaths: [] };
    const deathsBefore = cap.t.deaths.length;
    const tbEndsBefore = cap.t.tbEnds.length;
    const rowsBefore = t.tbFights.length;
    try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
    let res = null;
    try { res = Game._contestArena({ contestId: 'gauntlet' }, { waves: 3 }, []); } catch (e) { chain.drawError = String(e && e.message || e).slice(0, 120); }
    const arc = (Game.state || {}).arenaContest;
    chain.waves = (arc && arc.waves) ? arc.waves.slice() : null;
    chain.waveDefs = (chain.waves || []).map(function (id) { return { id: id, wave: (mdefs[id] || {}).wave || null, hp: (mdefs[id] || {}).hp || null }; });
    if (!res || !res.arena || !chain.waves || chain.waves.length !== 3 || !Game.tbfight) {
      chain.outcome = 'no-arena';
      chains.push(chain);
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
      try { Game.state.arenaContest = null; } catch (e) {}
      try { Game.state.activeContest = null; } catch (e) {}
      console.log('sweep chain ' + c + ': NO-ARENA waves=' + JSON.stringify(chain.waves));
      continue;
    }
    chain.partyN = partyNOf(Game);
    if (c === 0 && chain.partyN !== 4) {
      console.error('SWEEP STOP: fixture failed — chain 0 partyN=' + chain.partyN + ', expected 4 (scholar + 3 allies). Not measuring the wrong party.');
      process.exit(2);
    }
    for (let w = 0; w < 3; w++) {
      const mid = chain.waves[w];
      const waveRec = { waveIdx: w, mid: mid, packAtStart: packCounts(Game),
        alliesAtStart: (function () { try {
          return (Game.tbfight.fighters || []).filter(function (x) { return x && x.kind === 'villager'; }).map(function (x) { return x.key; });
        } catch (e) { return []; } })(),
        scholarHpAtStart: hpFrac(pFighter(Game)), partyN: partyNOf(Game) };
      if (!Game.tbfight || Game.tbfight.over || midOf(Game.tbfight) !== mid) {
        waveRec.outcome = 'not-live';
        chain.perWave.push(waveRec);
        break;
      }
      const played = playWave(Game, cap, deathsBefore, mid);
      waveRec.outcome = played.res;
      waveRec.steps = played.steps;
      // End-of-wave numbers from the capture's tbEnd entry for this wave.
      const ends = cap.t.tbEnds.slice(tbEndsBefore);
      const endRec = ends.filter(function (e2) { return e2 && e2.arenaContest && e2.arenaContest.waveIdx === w; }).pop();
      if (endRec) {
        const pf = (endRec.fighters || []).find(function (x) { return x && x.key === 'p'; });
        waveRec.scholarHpAtEnd = hpFrac(pf);
        const mons = (endRec.fighters || []).filter(function (x) { return x && x.kind === 'monster'; });
        waveRec.monstersAtEnd = mons.map(function (x) { return { id: x.monsterId, hpFrac: hpFrac(x), alive: x.alive }; });
        waveRec.tbEndResult = endRec.result;
      }
      const rows = t.tbFights.slice(rowsBefore).filter(function (r) { return r && r.mid === mid; });
      if (rows.length) { waveRec.rowOutcome = rows[rows.length - 1].outcome; waveRec.rowRounds = rows[rows.length - 1].rounds; }
      chain.perWave.push(waveRec);
      if (played.res === 'died' || played.res === 'ended' || played.res === 'guard' || played.res === 'stuck') break;
    }
    const newDeaths = cap.t.deaths.slice(deathsBefore);
    chain.deaths = newDeaths.map(function (d) {
      return { scholarId: d.scholarId, causeArg: d.causeArg, waveIdx: (d.arenaContest || {}).waveIdx, day: d.day };
    });
    chain.outcome = chain.deaths.length ? 'died' :
      (chain.perWave.length === 3 && chain.perWave[2].outcome === 'chained' ? 'won' :
      (chain.perWave.length === 3 && chain.perWave[2].outcome === 'ended' && chain.perWave[2].tbEndResult === 'won' ? 'won' :
      (chain.perWave.some(function (x) { return x.outcome === 'ended' && x.tbEndResult === 'routed'; }) ? 'routed' :
      'other:' + JSON.stringify(chain.perWave.map(function (x) { return x.outcome + '/' + (x.tbEndResult || '?'); })))));
    // A won chain ends via _contestEnd inside the tbEnd hook; a lost one via the death branch.
    // Clean any leftover fight/contest state before the next chain.
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
    try { Game.state.arenaContest = null; } catch (e) {}
    try { Game.state.activeContest = null; } catch (e) {}
    chains.push(chain);
    console.log('sweep chain ' + c + ': waves=' + JSON.stringify(chain.waves) +
      ' outcome=' + chain.outcome + ' partyN=' + chain.partyN +
      ' perWave=' + JSON.stringify(chain.perWave.map(function (x) { return x.mid + ':' + x.outcome + '/hp' + x.scholarHpAtEnd; })));
  }

  const out = { seed: SEED, arm: 'gauntlet-pack-b', run: 'sweep', anchorCommit: ANCHOR,
    chains: N, unlockedWave: 4, poolSizeAtWave4: poolSize,
    fixture: 'unlock gate bypassed in-test only (Game.unlockedWave -> 4 on the test-process object; live pool asserted 58 incl reunion, excl herald); draw/spawn/chain/fights are real code; staged scholar fresh 100HP no gear, partyN 4 (scholar + 3 allies)',
    chainsData: chains,
    instrumentErrors: (t.instrumentErrors || []).concat(cap.t.instrumentErrors || []) };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  const wins = chains.filter(function (ch) { return ch.outcome === 'won'; }).length;
  const died = chains.filter(function (ch) { return ch.outcome === 'died'; }).length;
  const routed = chains.filter(function (ch) { return ch.outcome === 'routed'; }).length;
  console.log('SWEEP DONE: chains=' + chains.length + ' won=' + wins + ' died=' + died + ' routed=' + routed +
    ' instrumentErrors=' + out.instrumentErrors.length + ' -> ' + outFile);
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
