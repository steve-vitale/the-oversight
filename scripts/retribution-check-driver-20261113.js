// retribution-check-driver-20261113.js — retribution narrated after its
// kill (arm sim-retribution-b, run fleshout-loop-b-20261113T2230Z).
// Competent policy verbatim, 150d death-aware, seeds from SEEDS (Stage 0
// probe: the steeple band 190391-190398; the prereg names the band the
// probe justifies). Wraps Game.say and records lines of interest with day
// + global sequence + live-fight id, plus a live-fight fighter snapshot:
// monster falls lines, RETRIBUTION unleash lines (BA.unleash, said BEFORE
// the shockwave damage), RETRIBUTION summary lines (said AFTER the
// tbDamage loop), "stored" announcements and "finds no one adjacent"
// lines. The analyzer judges the inversion: a falls line whose seq falls
// strictly between an unleash line and the following summary line in the
// same fight — the kill announced before the blow that caused it.
// Per-seed JSON to evidence/2026-11-13/<OUTDIR>/ (writeRobust,
// flap-proof, refuse-overwrite). EXPECTED_ANCHOR env pins the leg: the
// guard refuses any other HEAD, so a check on any other base can never
// be mislabeled. The after leg passes EXPECTED_ANCHOR=<fix-sha>.
// Usage:
//   EXPECTED_ANCHOR=<sha> SEEDS=190391,190392 DAYS=150 RUN=retribution-check node scripts/retribution-check-driver-20261113.js
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
const RUN = process.env.RUN || 'retribution-check';
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || '';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (EXPECTED_ANCHOR && ANCHOR !== EXPECTED_ANCHOR) {
    console.error('RETRIBUTION STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the expected anchor ' + EXPECTED_ANCHOR.slice(0, 12) + ' — check out that commit first (see prereg).');
    process.exit(2);
  }
  if (!EXPECTED_ANCHOR) {
    console.error('RETRIBUTION STOP: EXPECTED_ANCHOR required — pass the prereg/fix commit SHA.');
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

// Monster falls: "<subject> falls." — villager/ally falls carry a ☠
// prefix ("☠ name falls.") and are a different line; the player fall is
// "You go down." Keep all three kinds tagged, judge only monster falls.
const FALLS_RE = / falls\.$/;
// BA.unleash's own line, said BEFORE the tbDamage loop:
// "RETRIBUTION: 40 erupts outward — and 10 stays with you." or
// "RETRIBUTION: 40 erupts outward!"
const RETRIB_UNLEASH_RE = /^RETRIBUTION: \d+ erupts outward/;
// The shockwave summary, said AFTER the tbDamage loop:
// "RETRIBUTION: 40 damage erupts outward — 2 enemies caught in it."
const RETRIB_SUMMARY_RE = /^RETRIBUTION: \d+ damage erupts outward \u2014 \d+ enem/;
// Battery announcements (contact signal: the ability is held + charging).
const RETRIB_STORED_RE = /^RETRIBUTION: \d+ stored\. Unleash it\./;
const RETRIB_NOADJ_RE = /The shockwave finds no one adjacent/;
// Controls (must not move on the after leg).
const FREEZELINE_RE = /still frozen from your scream/i;
const APPLY_RE = /is frozen \u2014 .*\(stunned: no movement\)/i;
const BELLOW_RE = /BELLOWS? \u2014 raw, wordless/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Fight identity: one incrementing id per live tbfight object (WeakMap,
// so a new fight gets a fresh id). Null outside combat.
let fightSeq = 0;
const fightIds = new WeakMap();
function fightId(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return null;
    let id = fightIds.get(f);
    if (id == null) { fightSeq += 1; id = fightSeq; fightIds.set(f, id); }
    return id;
  } catch (e) { return null; }
}

function fighterSnap(Game) {
  try {
    const f = Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return null;
    return f.fighters.map(function (o) {
      return {
        key: o.key || null, kind: o.kind || null,
        monsterId: (o.mdef && o.mdef.id) || o.monsterId || null,
        name: o.name || null, alive: !!o.alive, fled: !!o.fled,
      };
    });
  } catch (e) { return null; }
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-retribution', fullTelemetry: false });
  const fallsLines = [];
  const retribSummaryLines = [];
  const retribUnleashLines = [];
  const retribStoredLines = [];
  const retribNoAdjLines = [];
  const freezelineLines = [];
  const applyLines = [];
  const bellowLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const seq = sayCount;
          const line = String(arg);
          const day = gday(Game);
          const fid = fightId(Game);
          if (FALLS_RE.test(line)) {
            fallsLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), person: line.indexOf('☠') === 0, fighters: fighterSnap(Game) });
          } else if (RETRIB_SUMMARY_RE.test(line)) {
            retribSummaryLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
          } else if (RETRIB_UNLEASH_RE.test(line)) {
            retribUnleashLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
          } else if (RETRIB_STORED_RE.test(line)) {
            retribStoredLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600) });
          } else if (RETRIB_NOADJ_RE.test(line)) {
            retribNoAdjLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
          }
          if (FREEZELINE_RE.test(line)) freezelineLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600) });
          else if (APPLY_RE.test(line)) applyLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600) });
          else if (BELLOW_RE.test(line) && bellowLines.length < 1000) bellowLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600) });
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

  return {
    seed: seed, arm: 'retribution-check', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    fallsCount: fallsLines.length, fallsLines: fallsLines,
    retribSummaryCount: retribSummaryLines.length, retribSummaryLines: retribSummaryLines,
    retribUnleashCount: retribUnleashLines.length, retribUnleashLines: retribUnleashLines,
    retribStoredCount: retribStoredLines.length, retribStoredLines: retribStoredLines,
    retribNoAdjCount: retribNoAdjLines.length, retribNoAdjLines: retribNoAdjLines,
    freezelineCount: freezelineLines.length, freezelineLines: freezelineLines,
    applyCount: applyLines.length, applyLines: applyLines,
    bellowCount: bellowLines.length, bellowLines: bellowLines,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-retribution-b-check');

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('RETRIBUTION STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'retribution-check-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('RETRIBUTION STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'retribution-check-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      fallsCount: out.fallsCount,
      retribSummary: out.retribSummaryCount, retribUnleash: out.retribUnleashCount,
      retribStored: out.retribStoredCount, retribNoAdj: out.retribNoAdjCount,
      freezelineCount: out.freezelineCount, applyCount: out.applyCount,
      bellowCount: out.bellowCount, deaths: out.deaths.length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = {
  oneRun: oneRun, FALLS_RE: FALLS_RE,
  RETRIB_SUMMARY_RE: RETRIB_SUMMARY_RE, RETRIB_UNLEASH_RE: RETRIB_UNLEASH_RE,
  RETRIB_STORED_RE: RETRIB_STORED_RE, RETRIB_NOADJ_RE: RETRIB_NOADJ_RE,
  FREEZELINE_RE: FREEZELINE_RE, APPLY_RE: APPLY_RE, BELLOW_RE: BELLOW_RE,
};
