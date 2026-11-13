// freezeline-check-driver-20261113.js — pack-leader freeze-line
// current-master CHECK (arm sim-freezeline-a, run fleshout-20261113T0715Z).
// Step 1 only: reproduce the count on current master tip f7352f946.
// Competent policy verbatim, 150d death-aware, seeds 190391-190398
// (matched band) + 190407 (targeted: the exact seed of the old-base
// observation — 64 freeze lines on d72, one Focus Group fight).
// Wraps Game.say and captures every line matching the freeze regex
// with its game day, plus sibling stun-family lines and veteran-kill
// announcement lines as sense context. Per-seed JSON to
// evidence/2026-11-13/perseed-freezeline-a-check/ (writeRobust,
// flap-proof, refuse-overwrite). Refuses to run unless HEAD is
// exactly f7352f946, so a check on any other base can never be
// mislabeled as a current-master check.
// Usage:
//   SEEDS=190391,190392 DAYS=150 RUN=freezeline-check node scripts/freezeline-check-driver-20261113.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'freezeline-check';
const EXPECTED_ANCHOR = 'f7352f9465becad7f14a08847aa6582401fddad2';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (ANCHOR !== EXPECTED_ANCHOR) {
    console.error('FREEZELINE STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the preregistered current-master tip f7352f946 — check out that tip first (see prereg).');
    process.exit(2);
  }
}

// FLAP SHAPE (measured 2026-11-12 04:19–04:23Z): clear windows last
// ~1–2s and recur every ~2–3 min. Sample every 250ms for up to 120s.
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

const FREEZE_RE = /still frozen from your scream/i;
// Sibling stun-family lines (same tbMonsterTurn status-tick class):
// Freeze Tag rooted, Bind strains, tag/bound worn-off lines.
const SIBLING_RE = /Freeze Tag|strains against the (tag|rope)|shakes off the tag|works a claw under the rope|hesitates — still seeing you/i;
// Veteran-kill announcement family (sense note: double announcement).
const VETKILL_RE = /veteran kill|REMEMBER the name|put down.*on CAMERA/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function countByDay(list) {
  const by = {};
  for (const e of list) by[e.day] = (by[e.day] || 0) + 1;
  return by;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-freezeline', fullTelemetry: false });
  const freezeLines = [];
  const siblingLines = [];
  const vetkillLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const line = String(arg);
          if (FREEZE_RE.test(line)) freezeLines.push({ day: gday(Game), line: line.slice(0, 600) });
          else if (SIBLING_RE.test(line) && siblingLines.length < 500) siblingLines.push({ day: gday(Game), line: line.slice(0, 600) });
          else if (VETKILL_RE.test(line) && vetkillLines.length < 200) vetkillLines.push({ day: gday(Game), line: line.slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try { pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  const freezeByDay = countByDay(freezeLines);
  let maxPerDay = 0, maxDay = null;
  for (const k of Object.keys(freezeByDay)) { if (freezeByDay[k] > maxPerDay) { maxPerDay = freezeByDay[k]; maxDay = parseInt(k, 10); } }

  return {
    seed: seed, arm: 'freezeline-check', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA, fixPresent: FIX_PRESENT,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    freezeCount: freezeLines.length, freezeByDay: freezeByDay,
    maxPerDay: maxPerDay, maxPerDayDay: maxDay,
    freezeLines: freezeLines,
    siblingCount: siblingLines.length, siblingLines: siblingLines,
    vetkillCount: vetkillLines.length, vetkillLines: vetkillLines,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-freezeline-a-check');
const gameText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) { return ''; } })();
const FIX_PRESENT = gameText.indexOf('_stunAnnounced') !== -1;

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('FREEZELINE STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'freezeline-check-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('FREEZELINE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'freezeline-check-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      freezeCount: out.freezeCount, maxPerDay: out.maxPerDay, maxPerDayDay: out.maxPerDayDay,
      siblingCount: out.siblingCount, vetkillCount: out.vetkillCount,
      deaths: out.deaths.length, errors: out.instrumentErrors.length,
      fixPresent: out.fixPresent,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, FREEZE_RE: FREEZE_RE, SIBLING_RE: SIBLING_RE, VETKILL_RE: VETKILL_RE, countByDay: countByDay, EXPECTED_ANCHOR: EXPECTED_ANCHOR };
