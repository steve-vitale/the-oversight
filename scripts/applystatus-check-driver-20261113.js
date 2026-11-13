// applystatus-check-driver-20261113.js — applyStatus freeze-line
// current-master CHECK (arm sim-applystatus-a, run fleshout-20261113T1115Z).
// Step 1 only: reproduce the count on current master.
// Competent policy verbatim, 150d death-aware, seeds 190391-190398
// (matched band) + 190407 (targeted: the freezeline-a band already
// contains the exact observation seed 190396, d89 Big Loud / d130
// Congregation, ~10x per fight).
// Wraps Game.say and captures every line matching the applyStatus
// freeze regex with its game day, plus the freezeline-a line as a
// control (must stay at its after-leg values) and War Cry bellow
// lines + veteran-kill lines as sense context. Per-seed JSON to
// evidence/2026-11-13/perseed-applystatus-a-check/ (writeRobust,
// flap-proof, refuse-overwrite). Refuses to run unless HEAD is
// exactly the prereg commit e7188607b (= 42024a8de + prereg md only,
// zero src changes), so a check on any other base can never be
// mislabeled as a current-master check.
// Usage:
//   SEEDS=190391,190392 DAYS=150 RUN=applystatus-check node scripts/applystatus-check-driver-20261113.js
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
const RUN = process.env.RUN || 'applystatus-check';
// Anchor override for the AFTER leg: the after leg runs on the fix
// commit, not the prereg commit — pass EXPECTED_ANCHOR=<fix-sha>.
// The guard still refuses any other HEAD; the per-seed JSON records
// the anchor it actually ran on, so a mislabeled leg is impossible.
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || 'e7188607b3b7cc6a2202e857b82013add24de5a4';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (ANCHOR !== EXPECTED_ANCHOR) {
    console.error('APPLYSTATUS STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the expected anchor ' + EXPECTED_ANCHOR.slice(0, 12) + ' — check out that commit first (see prereg).');
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

// The applyStatus stun-application line: "{name} is frozen — {source}.
// (stunned: no movement)" (statusEffects.json stun.applyText).
const APPLY_RE = /is frozen \u2014 .*\(stunned: no movement\)/i;
// Control: the freezeline-a line (tbMonsterTurn skipped turn) — its
// after-leg total across this band was 21; it must not move.
const FREEZELINE_RE = /still frozen from your scream/i;
// Sense context: War Cry bellow lines (the per-round fresh-stun
// announcement) and veteran-kill announcements.
const BELLOW_RE = /BELLOWS? — raw, wordless/i;
const VETKILL_RE = /veteran kill|REMEMBER the name|put down.*on CAMERA/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function countByDay(list) {
  const by = {};
  for (const e of list) by[e.day] = (by[e.day] || 0) + 1;
  return by;
}

// Largest identical-text group on one seed-day: the repeat metric.
function maxGroup(lines) {
  const groups = {};
  for (const e of lines) {
    const k = e.day + '|' + e.line;
    groups[k] = (groups[k] || 0) + 1;
  }
  let best = { size: 0, day: null, line: null };
  for (const k of Object.keys(groups)) {
    if (groups[k] > best.size) {
      const bar = k.indexOf('|');
      best = { size: groups[k], day: parseInt(k.slice(0, bar), 10), line: k.slice(bar + 1) };
    }
  }
  return best;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-applystatus', fullTelemetry: false });
  const applyLines = [];
  const freezelineLines = [];
  const bellowLines = [];
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
          if (APPLY_RE.test(line)) applyLines.push({ day: gday(Game), line: line.slice(0, 600) });
          else if (FREEZELINE_RE.test(line)) freezelineLines.push({ day: gday(Game), line: line.slice(0, 600) });
          else if (BELLOW_RE.test(line) && bellowLines.length < 1000) bellowLines.push({ day: gday(Game), line: line.slice(0, 600) });
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
  const applyByDay = countByDay(applyLines);
  let maxPerDay = 0, maxDay = null;
  for (const k of Object.keys(applyByDay)) { if (applyByDay[k] > maxPerDay) { maxPerDay = applyByDay[k]; maxDay = parseInt(k, 10); } }
  const mg = maxGroup(applyLines);

  return {
    seed: seed, arm: 'applystatus-check', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA, fixPresent: FIX_PRESENT,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    applyCount: applyLines.length, applyByDay: applyByDay,
    maxPerDay: maxPerDay, maxPerDayDay: maxDay,
    maxGroup: mg,
    applyLines: applyLines,
    freezelineCount: freezelineLines.length, freezelineLines: freezelineLines,
    bellowCount: bellowLines.length, bellowLines: bellowLines,
    vetkillCount: vetkillLines.length, vetkillLines: vetkillLines,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-applystatus-a-check');
const seText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'statusEffects.js'), 'utf8'); } catch (e) { return ''; } })();
const FIX_PRESENT = seText.indexOf('_seApplyAnnounced') !== -1;

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('APPLYSTATUS STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'applystatus-check-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('APPLYSTATUS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'applystatus-check-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      applyCount: out.applyCount, maxPerDay: out.maxPerDay, maxPerDayDay: out.maxPerDayDay,
      maxGroup: out.maxGroup, freezelineCount: out.freezelineCount,
      bellowCount: out.bellowCount, vetkillCount: out.vetkillCount,
      deaths: out.deaths.length, errors: out.instrumentErrors.length,
      fixPresent: out.fixPresent,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, APPLY_RE: APPLY_RE, FREEZELINE_RE: FREEZELINE_RE, BELLOW_RE: BELLOW_RE, VETKILL_RE: VETKILL_RE, countByDay: countByDay, maxGroup: maxGroup, EXPECTED_ANCHOR: EXPECTED_ANCHOR };
