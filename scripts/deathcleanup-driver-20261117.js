// deathcleanup-driver-20261117.js — JUDGED driver, arm sim-deathcleanup-b
// (BUILD: death cleanup in win-plan.js). A thin wrapper over
// scripts/deadplan-driver-20261117.js (reused verbatim, NOT modified):
// it calls the deadplan driver's oneRun per seed with the recorder ON
// on BOTH legs — the game change is the lever here, not the recorder —
// and writes per-seed JSON to evidence/2026-11-17/perseed-deathcleanup-b-{control,armed}/.
// The control leg runs from the worktree BEFORE the fix commit; the
// armed leg from the worktree AFTER it. Same seeds, same policy, same
// horizon, same recorder — the only difference between legs is the fix.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. VETREENGAGE off (env unset).
// Usage (from the repo root; RUN and OUTDIR are required so a leg can
// never silently land in the wrong directory):
//   RUN=deathcleanup-b-control OUTDIR=perseed-deathcleanup-b-control SEEDS=103231,103232 node scripts/deathcleanup-driver-20261117.js
//   RUN=deathcleanup-b-armed OUTDIR=perseed-deathcleanup-b-armed SEEDS=103231,103232 node scripts/deathcleanup-driver-20261117.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || '';
const OUTDIR = process.env.OUTDIR || '';
if (!SEEDS.length) { console.error('DEATHCLEANUP STOP: SEEDS required.'); process.exit(2); }
if (!RUN) { console.error('DEATHCLEANUP STOP: RUN required (deathcleanup-b-control | deathcleanup-b-armed).'); process.exit(2); }
if (!OUTDIR) { console.error('DEATHCLEANUP STOP: OUTDIR required (perseed-deathcleanup-b-control | perseed-deathcleanup-b-armed).'); process.exit(2); }
if (RUN !== 'deathcleanup-b-control' && RUN !== 'deathcleanup-b-armed') {
  console.error('DEATHCLEANUP STOP: RUN must be deathcleanup-b-control|deathcleanup-b-armed, got ' + JSON.stringify(RUN));
  process.exit(2);
}

// The deadplan driver reads SEEDS/DAYS/RUN/MODE at require time, so the
// env must be set BEFORE requiring it. MODE=on always: the recorder is
// ON on both legs (the game change, not the recorder, is the lever).
process.env.MODE = 'on';
process.env.DAYS = String(DAYS);
process.env.SEEDS = SEEDS.join(',');
process.env.RUN = RUN;
delete process.env.DEADPLAN_RECORDER;
const DRIVER = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust: same contract as the deadplan driver's (atomic tmp +
// rename for new files, in-place + readback for existing ones, stdout
// fallback after 480 retries) — copied, not imported (module-internal).
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
  const outDir = path.join(REPO, 'evidence', '2026-11-17', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'deathcleanup-b-s' + seed + '-' + RUN + '-on.json');
    if (fs.existsSync(file)) { console.error('DEATHCLEANUP STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await DRIVER.oneRun(seed);
    // Re-label the arm: the corpus is deathcleanup's, the recorder is
    // deadplan's. Everything else (arrays, anchors, policy sha) is the
    // deadplan driver's own record, untouched.
    out.arm = 'deathcleanup-b';
    out.leg = RUN;
    const file = path.join(outDir, 'deathcleanup-b-s' + seed + '-' + RUN + '-on.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, leg: RUN, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      v4creates: out.v4creates.length, planCensus: out.planCensus.length,
      deadTouches: out.deadTouches.length, dawnScored: out.dawnScored.length,
      deathCleanups: (out.winPlanStats && out.winPlanStats.deathCleanups) || 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { writeRobust: writeRobust };
