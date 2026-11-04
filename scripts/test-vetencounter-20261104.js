// test-vetencounter-20261104.js — proof for the vetencounter diag instrument
// (arm sim-vetencounter-b). Fixture chain-classification tests + verdict
// tests + live harness smoke + off/on neutrality leg (driver subprocesses
// into /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-vetencounter-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'vetencounter-analyze-20261104'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function snap(day, opts) {
  const s = { day: day, gated: 0, raw: 0, unlockedWave: 1, readiness5: { veterans: 0 }, worldCap: 5, px: 4, py: 4, world: [], w4facedTypes: 0 };
  return Object.assign(s, opts || {});
}
function row(seed, opts) {
  const r = {
    seed: seed, days: 100, gameDays: 100, endReason: 'horizon', won: false,
    spawns: [], removals: [], casts: [], fights: [], daily: [snap(1)],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function spawn(seq, day, id, source, tx, ty, px, py) {
  return { seq: seq, day: day, id: id, wave: 4, tx: tx, ty: ty, px: px, py: py,
    dist: Math.abs(tx - px) + Math.abs(ty - py), onPlayerTile: (tx === px && ty === py),
    source: source, stackFn: 'checkEncounter', veteran: false };
}
function fight(day, channel, mid) { return { day: day, channel: channel, fighter: null, mid: mid, wave: 4, optsKeys: [], outcome: null }; }
function wentry(seq, id, tx, ty, px, py, npcCount) {
  return { seq: seq, id: id, wave: 4, tx: tx, ty: ty,
    dist: Math.abs(tx - px) + Math.abs(ty - py), onPlayerTile: (tx === px && ty === py), npcCount: npcCount || 0 };
}

// 1. Never unlocked -> UNLOCK.
check('break-unlock', AN.analyzeSeed(row(99107, {
  daily: [snap(1), snap(72, { unlockedWave: 3 })],
})).breakStep === 'UNLOCK');
// 2. Unlocked, zero wave-4 spawns -> SPAWN.
check('break-spawn', AN.analyzeSeed(row(99102, {
  daily: [snap(1), snap(50, { unlockedWave: 4 }), snap(116, { unlockedWave: 4 })],
})).breakStep === 'SPAWN');
// 3. Spawned (background, far), never on player/villager tile, no fight -> REACH.
check('break-reach', AN.analyzeSeed(row(99106, {
  daily: [snap(1), snap(50, { unlockedWave: 4 }),
    snap(55, { unlockedWave: 4, world: [wentry(1, 'the_eater', 7, 7, 4, 4, 0)] }),
    snap(59, { unlockedWave: 4, world: [wentry(1, 'the_eater', 6, 7, 4, 4, 0)] })],
  spawns: [spawn(1, 52, 'the_eater', 'background', 7, 7, 4, 4)],
})).breakStep === 'REACH');
// 4. Spawned on player tile, no fight -> TRIGGER.
check('break-trigger', AN.analyzeSeed(row(99102, {
  daily: [snap(1), snap(50, { unlockedWave: 4 }),
    snap(52, { unlockedWave: 4, world: [wentry(1, 'the_strike', 4, 4, 4, 4, 0)] })],
  spawns: [spawn(1, 51, 'the_strike', 'checkEncounter', 4, 4, 4, 4)],
})).breakStep === 'TRIGGER');
// 5. Faced, spawn-scarce: unlock->spawn gap dominates -> binding SPAWN.
(function () {
  const c = AN.analyzeSeed(row(99101, {
    daily: [snap(1), snap(10, { unlockedWave: 4 }),
      snap(40, { unlockedWave: 4, world: [wentry(1, 'the_eater', 4, 4, 4, 4, 0)] })],
    spawns: [spawn(1, 40, 'the_eater', 'checkEncounter', 4, 4, 4, 4)],
    fights: [fight(42, 'player-tb', 'the_eater')],
    wavesFaced: { the_eater: 4 },
  }));
  check('binding-spawn', c.breakStep === 'FACED' && c.bindingStep === 'SPAWN' && c.gaps.unlockToSpawn === 30, JSON.stringify(c.gaps));
})();
// 6. Faced, reach-scarce: spawn->reach gap dominates -> binding REACH.
(function () {
  const c = AN.analyzeSeed(row(99103, {
    daily: [snap(1), snap(10, { unlockedWave: 4 }),
      snap(11, { unlockedWave: 4, world: [wentry(1, 'the_eater', 7, 7, 4, 4, 0)] }),
      snap(40, { unlockedWave: 4, world: [wentry(1, 'the_eater', 4, 4, 4, 4, 0)] })],
    spawns: [spawn(1, 11, 'the_eater', 'background', 7, 7, 4, 4)],
    fights: [fight(41, 'player-tb', 'the_eater')],
    wavesFaced: { the_eater: 4 },
  }));
  check('binding-reach', c.breakStep === 'FACED' && c.bindingStep === 'REACH' && c.gaps.spawnToReach === 29, JSON.stringify(c.gaps));
})();
// 7. Faced, trigger-scarce: reach->fight gap dominates -> binding TRIGGER.
(function () {
  const c = AN.analyzeSeed(row(99104, {
    daily: [snap(1), snap(10, { unlockedWave: 4 }),
      snap(11, { unlockedWave: 4, world: [wentry(1, 'the_eater', 4, 4, 4, 4, 0)] })],
    spawns: [spawn(1, 11, 'the_eater', 'checkEncounter', 4, 4, 4, 4)],
    fights: [fight(40, 'player-tb', 'the_eater')],
    wavesFaced: { the_eater: 4 },
  }));
  check('binding-trigger', c.breakStep === 'FACED' && c.bindingStep === 'TRIGGER' && c.gaps.reachToFight === 29, JSON.stringify(c.gaps));
})();
// 8. Pre-unlock wave-4 spawn flagged as anomaly.
(function () {
  const c = AN.analyzeSeed(row(99102, {
    daily: [snap(1), snap(50, { unlockedWave: 4 })],
    spawns: [spawn(1, 20, 'the_eater', 'background', 7, 7, 4, 4)],
  }));
  check('pre-unlock-anomaly', c.spawnsPreAnomaly === true && c.spawnsPre === 1, 'pre=' + c.spawnsPre);
})();
// 9. Villager-tile reach counts as reach (no player-tile contact, no fight -> TRIGGER, not REACH).
(function () {
  const c = AN.analyzeSeed(row(99106, {
    daily: [snap(1), snap(50, { unlockedWave: 4 }),
      snap(55, { unlockedWave: 4, world: [wentry(1, 'the_eater', 7, 7, 4, 4, 2)] })],
    spawns: [spawn(1, 52, 'the_eater', 'background', 7, 7, 4, 4)],
  }));
  check('villager-reach-is-reach', c.breakStep === 'TRIGGER' && c.reachedVillagerInstances === 1, c.breakStep);
})();
// 10. Verdict: 6 SPAWN bindings incl. both targets, zero errors, patterns match -> DIAG-GO.
// (Summaries fabricated at the computeVerdict level; pattern flags on.)
(function () {
  const mk = function (seed, binding, brk) { return { seed: seed, bindingStep: binding, breakStep: brk, instrumentErrors: 0, unlocked: true, patternMatch: true }; };
  const seeds = [
    mk(99101, 'SPAWN', 'FACED'), mk(99102, 'SPAWN', 'SPAWN'), mk(99103, 'SPAWN', 'FACED'),
    mk(99104, 'SPAWN', 'FACED'), mk(99105, 'SPAWN', 'FACED'), mk(99106, 'SPAWN', 'SPAWN'),
    { seed: 99107, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
    { seed: 99108, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
  ];
  const v = AN.computeVerdict(seeds);
  check('verdict-diag-go', v.verdict === 'DIAG-GO' && v.dominant === 'SPAWN' && v.dominantCount === 6, JSON.stringify(v));
})();
// 11. Verdict: targets split across steps -> DIAG-NO-CANDIDATE, never re-scored.
(function () {
  const mk = function (seed, binding, brk) { return { seed: seed, bindingStep: binding, breakStep: brk, instrumentErrors: 0, unlocked: true, patternMatch: true }; };
  const seeds = [
    mk(99101, 'SPAWN', 'FACED'), mk(99102, 'SPAWN', 'SPAWN'), mk(99103, 'REACH', 'FACED'),
    mk(99104, 'TRIGGER', 'FACED'), mk(99105, 'SPAWN', 'FACED'), mk(99106, 'REACH', 'REACH'),
    { seed: 99107, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
    { seed: 99108, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
  ];
  const v = AN.computeVerdict(seeds);
  check('verdict-split-no-candidate', v.verdict === 'DIAG-NO-CANDIDATE', JSON.stringify(v));
})();
// 12. Verdict: aggregate sanity with flipped per-seed patterns must NOT pass.
(function () {
  const mk = function (seed, binding, brk, pm) { return { seed: seed, bindingStep: binding, breakStep: brk, instrumentErrors: 0, unlocked: true, patternMatch: pm }; };
  const seeds = [
    mk(99101, 'SPAWN', 'FACED', false), mk(99102, 'SPAWN', 'SPAWN', true), mk(99103, 'SPAWN', 'FACED', true),
    mk(99104, 'SPAWN', 'FACED', true), mk(99105, 'SPAWN', 'FACED', true), mk(99106, 'SPAWN', 'SPAWN', true),
    { seed: 99107, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
    { seed: 99108, bindingStep: 'UNLOCK', breakStep: 'UNLOCK', instrumentErrors: 0, unlocked: false, patternMatch: true },
  ];
  const v = AN.computeVerdict(seeds);
  check('verdict-pattern-flip-blocks', v.verdict === 'DIAG-NO-CANDIDATE', JSON.stringify(v));
})();
// 13. Determinism: identical input -> identical classification.
(function () {
  const r = row(99102, { daily: [snap(1), snap(50, { unlockedWave: 4 })] });
  const a = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  const b = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
})();

async function liveLegs() {
  // Live harness smoke: 5 days, instrument on, snapshots + world list + no errors.
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'vetencounter-instrument-20261104'));
  const { Game } = await loadGame({ seed: 99108, mode: 'competent-vetencounter-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  const snap0 = inst.t.daily[0] || {};
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 &&
    Array.isArray(fin.waveKillLog) && Array.isArray(snap0.world) && snap0.unlockedWave != null,
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  // Neutrality leg: driver off vs on, 10 days, seed 99108, into /tmp.
  const tmp = '/tmp/vetencounter-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99108', OUTDIR: tmp });
  execSync('node scripts/vetencounter-driver-20261104.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', VETENC_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/vetencounter-driver-20261104.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'vetencounter-s99108-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'vetencounter-s99108-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
