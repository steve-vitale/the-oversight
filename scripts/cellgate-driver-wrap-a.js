// cellgate-driver-wrap-a.js — THIN wrapper, arm sim-cellgate-a
// (finding #2599: CELL SUPPLY PER GUN — the wave-gated searcaster volley).
// The judged gunrate driver (scripts/gunrate-driver-a.js) is reused as a
// MODULE: its oneRun(seed) is self-contained (the MODE/GUNRATE guards live
// only in its main block, which does not run on require). This wrapper sets
// the leg env BEFORE requiring it, calls oneRun per seed, stamps the
// cellgate leg flags onto the corpus, and writes it with its own
// writeRobust (same 480-retry + stdout-fallback shape as the driver's).
// WHY a wrapper: the host write flap (EPERM on fresh-file writes, live
// since ~11:02Z) blocks cloning the 1987-line driver file through the
// exec channel; this wrapper is small enough to write through the
// file-tool channel. The corpus content is identical to what the cloned
// driver would produce — the same oneRun, the same recorder — with ONE
// documented gap: the v4cellgate recorder (gate-held / low-wave-burn
// rows) is NOT available in this wrapper, so the gate's secondary counts
// are derived from the census + kill log instead (gunrate §6 method).
// Legs: ctl = GUNRATE=1 only (rebuilt substrate); arm = GUNRATE=1 +
// CELLGATE=1. The two legs differ ONLY by CELLGATE. Substrate env (both
// legs): VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
// SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1. Policy: competent verbatim, 150d
// death-aware, seeds 107051-107058.
// Usage (from the repo root):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 MODE=ctl OUTDIR=perseed-cellgate-a-ctl SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=cellgate-a node scripts/cellgate-driver-wrap-a.js
// (arm adds CELLGATE=1 and MODE=arm OUTDIR=perseed-cellgate-a-arm)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

// Leg env is read by the required driver at require time — set in the
// shell BEFORE this process starts, never mutated here.
const MODE = process.env.MODE || '';
const CELLGATE_ON = process.env.CELLGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const RUN = process.env.RUN || 'cellgate-a';
const OUTDIR = process.env.OUTDIR || ('perseed-cellgate-a-' + MODE);
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);

// Guards (the driver's main-block guards, replicated — fail loudly,
// never silently mislabel).
if (MODE !== 'ctl' && MODE !== 'arm') { console.error('CELLGATE STOP: MODE must be ctl|arm, got ' + JSON.stringify(MODE)); process.exit(2); }
if (!GUNRATE_ON) { console.error('CELLGATE STOP: GUNRATE=1 required on both legs (rebuilt substrate).'); process.exit(2); }
if (MODE === 'arm' && !CELLGATE_ON) { console.error('CELLGATE STOP: MODE=arm requires CELLGATE=1.'); process.exit(2); }
if (MODE === 'ctl' && CELLGATE_ON) { console.error('CELLGATE STOP: MODE=ctl requires CELLGATE unset.'); process.exit(2); }
if (process.env.FUSIONCELL === '1') { console.error('CELLGATE STOP: FUSIONCELL must be unset on both legs (reverted fix — never re-applied).'); process.exit(2); }
if (process.env.SEARSUPPLY === '1') { console.error('CELLGATE STOP: SEARSUPPLY must be unset on both legs (reverted lever — its code is absent from master).'); process.exit(2); }
if (process.env.BOWCRAFT === '1') { console.error('CELLGATE STOP: BOWCRAFT must be unset on both legs.'); process.exit(2); }
for (const f of ['VETREENGAGE', 'PARTYSIZE4', 'FLEEREPAIR2', 'FIGHTALLY2', 'SENSEEXPED', 'BOWOPEN', 'SPEARGATE']) {
  if (process.env[f] !== '1') { console.error('CELLGATE STOP: ' + f + '=1 required (substrate).'); process.exit(2); }
}
if (!SEEDS.length) { console.error('CELLGATE STOP: SEEDS required.'); process.exit(2); }

// Presence: the substrate + gate code must be in the tree.
let gunratePresent = false, cellgatePresent = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const contestsSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'contests.js'), 'utf8');
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  gunratePresent = /GUNRATE/.test(gameSrc) && /searcaster/.test(gameSrc)
    && /GUNRATE/.test(contestsSrc) && /_gunRateFighter/.test(contestsSrc);
  cellgatePresent = /CELLGATE/.test(ffSrc) && /holds the Searcaster/.test(ffSrc);
} catch (e) {}
if (!gunratePresent) { console.error('CELLGATE STOP: the GUNRATE substrate code (game.js + contests.js) must be present.'); process.exit(2); }
if (!cellgatePresent) { console.error('CELLGATE STOP: the CELLGATE gate code (fieldFights.js) must be present.'); process.exit(2); }

// Require the judged driver AFTER the env is set (its module consts
// capture env at require time). Its main-block guards do not run.
const driver = require('./gunrate-driver-a');

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

(async function () {
  const outDir = path.join(REPO, 'evidence', '2026-11-20', OUTDIR);
  try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) { console.error('CELLGATE STOP: cannot create ' + outDir + ': ' + e.message); process.exit(2); }
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'cellgate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('CELLGATE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await driver.oneRun(seed);
    out.cellgateOn = CELLGATE_ON;
    out.cellgatePresent = cellgatePresent;
    out.arm = 'cellgate-a';
    out.leg = MODE;
    const file = path.join(outDir, 'cellgate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, cellgateOn: out.cellgateOn, gunrateOn: out.gunrateOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length, v4encounters: out.v4encounters.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { writeRobust: writeRobust };
