// mirrorcap-panel-20261107.js — matched before/after panel for sim-mirrorcap.
//
// One forced-Reunion Gauntlet chain per process. Fixture copied from the
// gauntlet-pack-b sweep (scripts/gauntlet-sweep-20261107.js) so the numbers
// are comparable: unlockedWave -> 4 (gate bypassed in-test only; live pool
// asserted 58 incl. Reunion, excl. Herald — FAILS LOUDLY otherwise),
// staged scholar fresh 100 HP, no gear, partyN 4 (scholar + 3 allies at
// Haven centre, roster trimmed to those 3), Gauntlet spec {waves: 3},
// fights played to win with the arena-b driver (strike the first live
// monster each player turn, tbAdvance otherwise); no HP is nerfed
// anywhere.
//
// The wave list is FORCED to ['buffering','sunback','reunion'] — the exact
// list from the gauntlet-pack-b unit pins (Sari's d115 list). The random
// draw is out of scope (proven uniform by sim-gauntlet-pack-b, untouched
// by this change; at ~1.6% per draw a natural-draw panel would need
// hundreds of chains to see a Reunion). The wave list is set on
// state.arenaContest before the chain starts (the gauntlet test's leg-1a
// pattern); the spawn, the wave chain and the fights are real code.
//
// Arms: run the SAME script with REPO pointing at the pristine baseline
// extraction (no cap code) vs this worktree (cap live). One process per
// seed so both arms start from identical RNG state; the ONLY difference
// is the cap. Seeds 91002-91017 (preregged band; freshness check in the
// prereg).
//
// Usage:
//   SEED=91002 ARM=armed REPO=/path/to/tree OUT=evidence/2026-11-07/perseed-mirrorcap/armed-s91002.json \
//     node scripts/mirrorcap-panel-20261107.js
// Refuses to overwrite OUT. Exit 2 = fixture failure (wrong pool/party).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const K = require(path.join(REPO, 'scripts', 'godpath', 'lib'));
const STAGE = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(REPO, 'scripts', 'arena-capture-20261107'));

const SEED = parseInt(process.env.SEED || '91002', 10) || 91002;
const ARM = process.env.ARM || 'armed';
const WAVES = ['buffering', 'sunback', 'reunion'];
const outFile = process.env.OUT || path.join(REPO, 'evidence', '2026-11-07', 'perseed-mirrorcap', ARM + '-s' + SEED + '.json');
if (fs.existsSync(outFile)) { console.error('PANEL STOP: refusing to overwrite ' + outFile); process.exit(3); }

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

  // --- Fixture: bypass ONLY the unlock gate (gauntlet-sweep pattern). ---
  Game.unlockedWave = function () { return 4; };
  const mdefs = {};
  try { for (const m of (Game.data.monsters || [])) mdefs[m.id] = m; } catch (e) {}

  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  // Stage the chain: fresh run, scholar at Haven centre, exactly 3 allies
  // adjacent, roster trimmed to those 3 (gauntlet-sweep stageChain).
  K.newRun(Game);
  try { Game.state.scholar.day = 30; } catch (e) {}
  try {
    const s = Game.state.scholar;
    s.mx = 4; s.my = 4;
    if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
    const roster = ((Game.state.village || {}).roster || []).slice();
    const vpos = (Game.state.village || {}).positions || {};
    const spots = [{ mx: 3, my: 4 }, { mx: 5, my: 4 }, { mx: 4, my: 3 }];
    const chosen = roster.filter(function (rid) { return rid !== Game.villagerId; }).slice(0, 3);
    chosen.forEach(function (rid, i) { vpos[rid] = spots[i]; });
    Game.state.village.roster = chosen;
  } catch (e) {}

  const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : -1;
  let pool0 = [];
  try { pool0 = Game.monsterWavePool ? Game.monsterWavePool() : []; } catch (e) {}
  const poolOk = uw === 4 && pool0.length === 58 &&
    pool0.some(function (m) { return m.id === 'reunion'; }) &&
    !pool0.some(function (m) { return m.id === 'herald'; });
  if (!poolOk) {
    console.error('PANEL STOP: fixture failed — unlockedWave()=' + uw + ' poolSize=' + pool0.length +
      ' hasReunion=' + pool0.some(function (m) { return m.id === 'reunion'; }) +
      ' hasHerald=' + pool0.some(function (m) { return m.id === 'herald'; }) +
      ' (expected 4 / 58 / true / false). Not measuring the wrong pool.');
    process.exit(2);
  }

  const deathsBefore = cap.t.deaths.length;
  const tbEndsBefore = cap.t.tbEnds.length;
  const rowsBefore = t.tbFights.length;
  const chain = { seed: SEED, arm: ARM, waves: WAVES.slice(), partyN: null, perWave: [], outcome: null, deaths: [],
    capConstant: (typeof Game.REUNION_ARENA_MIRROR_CAP === 'number') ? Game.REUNION_ARENA_MIRROR_CAP : null };

  try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
  try { Game.state.arenaContest = { contestId: 'gauntlet', waves: WAVES.slice(), waveIdx: 0 }; } catch (e) {}
  // Wave 1 starts through the real startCombat (K.fight); the chain to
  // waves 2-3 runs through the real tbEnd -> _contestArenaAfter hook.
  // No HP is nerfed anywhere — real fights, played to win.
  K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, party: true });
  chain.partyN = partyNOf(Game);
  if (chain.partyN !== 4) {
    console.error('PANEL STOP: fixture failed — partyN=' + chain.partyN + ', expected 4 (scholar + 3 allies). Not measuring the wrong party.');
    process.exit(2);
  }
  if (!Game.tbfight || midOf(Game.tbfight) !== 'buffering') {
    chain.outcome = 'no-arena';
  } else {
    for (let w = 0; w < 3; w++) {
      const mid = WAVES[w];
      const waveRec = { waveIdx: w, mid: mid, packAtStart: packCounts(Game),
        reunionCountAtStart: (packCounts(Game).reunion || 0),
        partyN: partyNOf(Game),
        scholarHpAtStart: hpFrac(pFighter(Game)) };
      if (!Game.tbfight || Game.tbfight.over || midOf(Game.tbfight) !== mid) {
        waveRec.outcome = 'not-live';
        chain.perWave.push(waveRec);
        break;
      }
      const played = playWave(Game, cap, deathsBefore, mid);
      waveRec.outcome = played.res;
      waveRec.steps = played.steps;
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
    const w2 = chain.perWave[2];
    chain.outcome = chain.deaths.length ? 'died' :
      (w2 && (w2.outcome === 'chained' || (w2.outcome === 'ended' && w2.tbEndResult === 'won')) ? 'won' :
      (chain.perWave.some(function (x) { return x.outcome === 'ended' && x.tbEndResult === 'routed'; }) ? 'routed' :
      'other:' + JSON.stringify(chain.perWave.map(function (x) { return x.outcome + '/' + (x.tbEndResult || '?'); }))));
    chain.reunionWave = w2 ? { reached: w2.outcome !== 'not-live', outcome: w2.outcome,
      reunionCount: w2.reunionCountAtStart, partyN: w2.partyN,
      scholarHpAtStart: w2.scholarHpAtStart, scholarHpAtEnd: w2.scholarHpAtEnd || null,
      tbEndResult: w2.tbEndResult || null } : { reached: false };
  }
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  chain.instrumentErrors = (t.instrumentErrors || []).concat(cap.t.instrumentErrors || []);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(chain, null, 2));
  console.log('PANEL CHAIN seed=' + SEED + ' arm=' + ARM + ' outcome=' + chain.outcome +
    ' reunionWave=' + JSON.stringify(chain.reunionWave) +
    ' instrumentErrors=' + chain.instrumentErrors.length + ' -> ' + outFile);
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
