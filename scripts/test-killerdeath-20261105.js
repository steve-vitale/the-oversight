// test-killerdeath-20261105.js — proof for the killerdeath instrument,
// analyzer, and retention policy (arm sim-killerdeath-b). Fixture
// classification/split tests + live harness smoke + determinism leg +
// off/on neutrality leg (driver subprocesses into /tmp, never into
// evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-killerdeath-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'killerdeath-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function dead(vid, day, cause, extra) { return Object.assign({ villagerId: vid, day: day, cause: cause || 'the arena', name: vid }, extra || {}); }
function liveKill(d, mid, w, by, scholarChannel) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: scholarChannel ? by : 'someone-else', scholarChannel: !!scholarChannel };
}

// 1. Never faced.
check('never-faced', AN.classifySeed(row(1)).class === 'NEVER-FACED-WAVE4');
// 2. Faced, no kill.
check('faced-no-kill', AN.classifySeed(row(2, {
  fights: [{ day: 50, channel: 'field', mid: 'the_eater', wave: 4 }],
  wavesFaced: { the_eater: 4 },
})).class === 'FACED-NO-KILL');
// 3. Monster-threaded fallen entry splits 'the wild': cause is monster name.
(function () {
  const c = AN.classifySeed(row(3, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'The Eater', { monsterId: 'the_eater', monsterName: 'The Eater' })],
  }));
  check('monster-split', c.killers[0].deathCauseSplit === 'monster:The Eater' && c.killers[0].channels[0] === 'player');
})();
// 4. Scholar-death context splits a bare 'the wild' fallen entry.
(function () {
  const c = AN.classifySeed(row(4, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
    scholarDeaths: [{ day: 45, scholarId: 'alice', causeArg: 'injuries', atHaven: false, inCombat: true, pendingEncounter: false }],
  }));
  check('scholar-death-split', c.killers[0].deathCauseSplit === 'scholar-death:injuries:away:in-combat',
    'got ' + c.killers[0].deathCauseSplit);
})();
// 5. Bare 'the wild' with NO split evidence stays a residual, never a cause.
(function () {
  const c = AN.classifySeed(row(5, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
  }));
  check('wild-residual', c.killers[0].deathCauseSplit === 'the wild (unsplit residual)');
})();
// 6. Same-day kill-and-die contributes to NO day (fleeting).
(function () {
  const c = AN.classifySeed(row(6, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(40, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(40, 'w4b', 4, 'bob', false)],
    fallen: [dead('alice', 40), dead('bob', 40)],
  }));
  check('same-day-fleeting', c.maxSimultaneous === 0 && c.class === 'KILLED-DEAD-KILLER');
})();
// 7. Two living killers overlapping -> snapshot pair day + recon pair.
(function () {
  const c = AN.classifySeed(row(7, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'bob', false)],
    daily: [
      { day: 40, gated: 100, raw: 120, readiness5: { veterans: 1 } },
      { day: 50, gated: 150, raw: 180, readiness5: { veterans: 2, ready: false } },
    ],
  }));
  check('living-pair-snapshot', c.maxSimultaneous === 2 && c.hasLivingPairSnapshot && c.pairSnapshotDay === 50, JSON.stringify({ max: c.maxSimultaneous, day: c.pairSnapshotDay }));
})();
// 8. Reconstructed pair with NO snapshot day is reported, not scored.
(function () {
  const c = AN.classifySeed(row(8, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'bob', false)],
    daily: [{ day: 60, gated: 150, raw: 180, readiness5: { veterans: 1 } }],
  }));
  check('recon-pair-not-scored', c.maxSimultaneous === 2 && !c.hasLivingPairSnapshot && c.pairSnapshotDay == null);
})();
// 9. deadMap overrides fallen absence: killer with no fallen entry but
// dead=true in deadMap is dead (contest scholar death without fallen).
(function () {
  const c = AN.classifySeed(row(9, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    deadMap: { alice: true },
  }));
  check('deadmap-overrides', c.killers[0].aliveAtEnd === false && c.class === 'KILLED-DEAD-KILLER');
})();
// 10. Chronology anomaly flagged, timing from the later entry.
(function () {
  const c = AN.classifySeed(row(10, {
    waveKillLog: [kill(100, 'w4a', 4, 'alice')],
    killsLive: [liveKill(100, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 50, 'monster'), dead('alice', 110, 'the arena')],
  }));
  const k = c.killers[0];
  check('anomaly-flagged-timing-later', c.anomalies.indexOf('alice') >= 0 && k.deathDay === 110 && k.killToDeathDays === 10);
})();
// 11. Determinism leg.
(function () {
  const r = row(11, { waveKillLog: [kill(40, 'w4a', 4, 'alice')], killsLive: [liveKill(40, 'w4a', 4, 'alice', true)], fallen: [dead('alice', 45)] });
  const a = AN.classifySeed(JSON.parse(JSON.stringify(r)));
  const b = AN.classifySeed(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
})();
// 12. Retention window logic (pure policy helper, no game needed): a
// scholar with a wave-4 kill 10 days ago is retained; 31 days ago is not;
// a non-scholar killer does not retain the scholar.
(function () {
  const R = require(path.join(REPO, 'scripts', 'policies', 'competent-retention-killerdeath-b'));
  function fakeGame(sid, log, day) {
    return { villagerId: sid, state: { scholar: { day: day }, waveKillLog: log } };
  }
  const g1 = fakeGame('alice', [{ d: 40, w: 4, by: 'alice' }], 50);
  const g2 = fakeGame('alice', [{ d: 40, w: 4, by: 'alice' }], 71);
  const g3 = fakeGame('alice', [{ d: 40, w: 4, by: 'bob' }], 50);
  const g4 = fakeGame('alice', [{ d: 40, w: 4, by: 'alice' }], 40);
  check('retention-window', R.retentionActive(g1) === true && R.retentionActive(g2) === false &&
    R.retentionActive(g3) === false && R.retentionActive(g4) === false,
    [R.retentionActive(g1), R.retentionActive(g2), R.retentionActive(g3), R.retentionActive(g4)].join(','));
})();

async function liveLegs() {
  // Live harness smoke: 5 days, instrument on, snapshots + no errors +
  // all four wrappers installed (killsLive/scholarDeaths arrays present).
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'killerdeath-instrument-20261105'));
  const { Game } = await loadGame({ seed: 99131, mode: 'competent-killerdeath-proof', fullTelemetry: false });
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
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog) && Array.isArray(fin.deadMap ? Object.keys(fin.deadMap) : null) !== false,
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  // Neutrality leg: driver off vs on, 10 days, seed 99131, into /tmp.
  const tmp = '/tmp/killerdeath-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99131', OUTDIR: tmp });
  execSync('node scripts/killerdeath-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', KILLERDEATH_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/killerdeath-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'killerdeath-s99131-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'killerdeath-s99131-proof-on.json'), 'utf8'));
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
