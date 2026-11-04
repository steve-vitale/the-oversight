// test-vetprod-20261104.js — proof for the vetprod diag instrument
// (arm sim-vetprod-b). Fixture classification tests + live harness
// smoke + determinism leg + off/on neutrality leg (driver subprocesses
// into /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-vetprod-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'vetprod-analyze-20261104'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function row(seed, opts) {
  const r = {
    seed: seed, days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'wild', trick: null }; }
function dead(vid, day, cause) { return { villagerId: vid, day: day, cause: cause || 'the arena', name: vid }; }

// 1. Never faced.
check('never-faced', AN.classifySeed(row(1)).class === 'NEVER-FACED-WAVE4');
// 2. Faced, no kill (fight event + deed feed agree).
check('faced-no-kill', AN.classifySeed(row(2, {
  fights: [{ day: 50, channel: 'field', mid: 'the_eater', wave: 4 }],
  wavesFaced: { the_eater: 4 },
})).class === 'FACED-NO-KILL');
// 3. Monster-veteran base-wave kill does NOT count as a wave-4 kill:
// wave-4 faced, but the only kill in the log is base wave 3.
check('base-wave-kill-not-w4', AN.classifySeed(row(3, {
  fights: [{ day: 50, channel: 'field', mid: 'the_eater', wave: 4 }],
  waveKillLog: [kill(50, 'some_w3', 3, 'alice')],
  wavesFaced: { the_eater: 4 },
})).class === 'FACED-NO-KILL');
// 4. Kills, all killers dead.
check('killed-dead', AN.classifySeed(row(4, {
  waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(60, 'w4b', 4, 'bob')],
  fallen: [dead('alice', 45), dead('bob', 70)],
})).class === 'KILLED-DEAD-KILLER');
// 5. One living killer, max simultaneous 1 (killers never overlap alive:
// alice dies before bob's kill; bob lives to the end).
(function () {
  const c = AN.classifySeed(row(5, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(60, 'w4b', 4, 'bob')],
    fallen: [dead('alice', 50)],
  }));
  check('killed-living-short', c.class === 'KILLED-LIVING-SHORT' && c.maxSimultaneous === 1 && c.livingAtEnd === 1);
})();
// 6. Precedence: 1 living + 1 dead, max sim 1 -> LIVING-SHORT, not DEAD.
check('living-short-precedence', AN.classifySeed(row(6, {
  waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(60, 'w4b', 4, 'bob')],
  fallen: [dead('alice', 50)],
})).class === 'KILLED-LIVING-SHORT');
// 7. Same-day kill-and-die contributes to NO day (both killers fleeting).
(function () {
  const c = AN.classifySeed(row(7, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(40, 'w4b', 4, 'bob')],
    fallen: [dead('alice', 40), dead('bob', 40)],
  }));
  check('same-day-fleeting', c.maxSimultaneous === 0 && c.class === 'KILLED-DEAD-KILLER');
})();
// 8. Two living killers overlapping -> max sim 2; with peak vet bar short -> OTHER.
(function () {
  const c = AN.classifySeed(row(8, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    daily: [{ day: 60, gated: 199, raw: 210, readiness5: { veterans: 1 } }],
  }));
  check('peak-timing-other', c.class === 'OTHER' && c.maxSimultaneous === 2 && !!c.otherCause);
})();
// 9. Chronology anomaly flagged, timing from the later entry.
(function () {
  const c = AN.classifySeed(row(9, {
    waveKillLog: [kill(100, 'w4a', 4, 'alice')],
    fallen: [dead('alice', 50, 'monster'), dead('alice', 110, 'the arena')],
  }));
  const k = c.killers[0];
  check('anomaly-flagged-timing-later', c.anomalies.indexOf('alice') >= 0 && k.deathDay === 110 && k.killToDeathDays === 10);
})();
// 10. Wave-5 kill counts as wave-4+; contest via counts.
(function () {
  const c = AN.classifySeed(row(10, {
    waveKillLog: [kill(80, 'w5a', 5, 'alice', 'contest')],
    fallen: [dead('alice', 90)],
  }));
  check('w5-and-contest-count', c.w4kills === 1 && c.w4killsByVia.contest === 1 && c.class === 'KILLED-DEAD-KILLER');
})();
// 11. Determinism leg: identical input -> identical classification.
(function () {
  const r = row(11, { waveKillLog: [kill(40, 'w4a', 4, 'alice')], fallen: [dead('alice', 45)] });
  const a = AN.classifySeed(JSON.parse(JSON.stringify(r)));
  const b = AN.classifySeed(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
})();

async function liveLegs() {
  // Live harness smoke: 5 days, instrument on, snapshots + no errors.
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'vetprod-instrument-20261104'));
  const { Game } = await loadGame({ seed: 99108, mode: 'competent-vetprod-proof', fullTelemetry: false });
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
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  // Neutrality leg: driver off vs on, 10 days, seed 99108, into /tmp.
  const tmp = '/tmp/vetprod-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99108', OUTDIR: tmp });
  execSync('node scripts/vetprod-driver-20261104.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', VETPROD_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/vetprod-driver-20261104.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'vetprod-s99108-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'vetprod-s99108-proof-on.json'), 'utf8'));
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
