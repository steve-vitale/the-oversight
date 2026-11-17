// poolshape-driver-20261117.js — DIAG recorder, arm sim-poolshape-a.
// Decomposes the empty companion pool on the launchfunnel band
// (seeds 103411-103418, 150d, competent policy).
//
// DESIGN: this driver does NOT re-implement the dawn-scoring hook. It
// requires scripts/launchfunnel-driver-20261117.js as a module and calls
// its oneRun(seed) per seed per leg, writing poolshape-named corpora.
// The vbrainScorePick wrap, the poolReplica (with the members extension),
// and the companionPool row shape are therefore the launchfunnel
// instrument verbatim — the recorder scores the SAME dawns by
// construction, and the replication check in the analyzer (87 pool rows,
// 81 empty, per-seed split 0/0/25/0/37/25/0/0 on the vre leg) proves it.
// Zero src/js changes; wraps are pure reads + driver-local writes.
//
// Legs (env MODE = poolshape leg; the underlying launchfunnel MODE is
// mapped so trajectories match the launchfunnel legs exactly):
//   off : VETREENGAGE unset, recorder ON  (underlying MODE off)
//   vre : VETREENGAGE=1,    recorder ON  (underlying MODE vre) — judged
//   rec : VETREENGAGE=1,    recorder OFF (underlying MODE rec) — D2
//   rec0: VETREENGAGE unset, recorder OFF (underlying MODE off) — pure
//         master recorder-off leg, the balanced-panel "before".
// Usage:
//   MODE=vre OUTDIR=perseed-poolshape-a-vre SEEDS=103411,103412,... RUN=poolshape-a node scripts/poolshape-driver-20261117.js
//   VETREENGAGE=1 MODE=vre ... (same as launchfunnel usage)
//   VETREENGAGE=1 LAUNCHFUNNEL_RECORDER=off MODE=rec ... (rec leg)
//   LAUNCHFUNNEL_RECORDER=off MODE=rec0 ... (rec0 leg; VETREENGAGE unset)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');

const LEG = process.env.MODE || 'vre';
const LEGS = { off: 'off', vre: 'vre', rec: 'rec', rec0: 'off' };
if (!Object.prototype.hasOwnProperty.call(LEGS, LEG)) {
  console.error('POOLSHAPE STOP: MODE must be off|vre|rec|rec0, got ' + JSON.stringify(LEG));
  process.exit(2);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
// NOTE: no top-level SEEDS exit here — this module is also required by
// the proof test / analyzer children, which call oneRun directly.
const RUN = process.env.RUN || 'poolshape-a';
const OUTDIR = process.env.OUTDIR || ('perseed-poolshape-a-' + LEG);
const RECORDER_WANT = (LEG === 'rec' || LEG === 'rec0') ? 'off' : 'on';
if (RECORDER_WANT === 'off') process.env.LAUNCHFUNNEL_RECORDER = 'off';
// When the leg wants the recorder ON, leave LAUNCHFUNNEL_RECORDER
// untouched: an explicit 'off' from the caller (D2 leg) must survive.
// Underlying launchfunnel MODE (label only — RNG is seeded by seed, but
// keep the label identical to the launchfunnel leg for comparability).
process.env.MODE = LEGS[LEG];
process.env.RUN = RUN;

const LF = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117'));

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('POOLSHAPE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-17', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'poolshape-a-s' + seed + '-' + RUN + '-' + LEG + '.json');
    if (fs.existsSync(file)) { console.error('POOLSHAPE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await LF.oneRun(seed);
    // Stamp poolshape identity; keep the underlying mode + anchor for
    // traceability. Everything else is the launchfunnel output verbatim.
    out.arm = 'poolshape-a';
    out.leg = LEG;
    out.underlyingMode = LEGS[LEG];
    const file = path.join(outDir, 'poolshape-a-s' + seed + '-' + RUN + '-' + LEG + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, leg: LEG, underlyingMode: LEGS[LEG],
      anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      v4seeds: out.v4seeds.length, dawnbidScores: out.dawnbidScores.length,
      companionPool: out.companionPool.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { LEG: LEG };
