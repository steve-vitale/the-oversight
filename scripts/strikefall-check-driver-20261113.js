// strikefall-check-driver-20261113.js — strike-after-fall (#2303) + square
// screams twice (#2304) current-master CHECK (arm sim-strikefall-a, run
// fleshout-20261113T1615Z). Competent policy verbatim, 150d death-aware,
// seeds 190391-190398 (matched band — the observation seed 190396 is
// inside it). Wraps Game.say and records EVERY line's day + global
// sequence number + live-fight id; lines of interest (monster falls,
// "You STRIKE", Static Kite DIP, controls) are kept with a snapshot of
// the live fight's fighters (key, monsterId, name, alive) so the analyzer
// can tell two kites in one fight from one kite resolving twice, and can
// judge falls->STRIKE adjacency exactly (strike.seq === falls.seq + 1).
// Per-seed JSON to evidence/2026-11-13/perseed-strikefall-a-check/
// (writeRobust, flap-proof, refuse-overwrite). EXPECTED_ANCHOR env pins
// the leg: the guard refuses any other HEAD, so a check on any other base
// can never be mislabeled. The after leg passes EXPECTED_ANCHOR=<fix-sha>.
// Usage:
//   EXPECTED_ANCHOR=<sha> SEEDS=190391,190392 DAYS=150 RUN=strikefall-check node scripts/strikefall-check-driver-20261113.js
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
const RUN = process.env.RUN || 'strikefall-check';
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || '';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (EXPECTED_ANCHOR && ANCHOR !== EXPECTED_ANCHOR) {
    console.error('STRIKEFALL STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the expected anchor ' + EXPECTED_ANCHOR.slice(0, 12) + ' — check out that commit first (see prereg).');
    process.exit(2);
  }
  if (!EXPECTED_ANCHOR) {
    console.error('STRIKEFALL STOP: EXPECTED_ANCHOR required — pass the prereg/fix commit SHA.');
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
const STRIKE_RE = /^You STRIKE the .* for \d+/;
const DIP_RE = /The square SCREAMS \u2014 static made solid\. And the kite DIPS/;
const DIP_SHORT_RE = /The square SCREAMS \u2014 static made solid/;
// Controls (must not move on the after leg).
const FREEZELINE_RE = /still frozen from your scream/i;
const APPLY_RE = /is frozen \u2014 .*\(stunned: no movement\)/i;
const BELLOW_RE = /BELLOWS? \u2014 raw, wordless/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Fight identity: one incrementing id per live tbfight object (WeakMap,
// so a new fight gets a fresh id and distinct texts stay audible within
// a fight). Null outside combat.
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

// Live-fight fighter snapshot at a line of interest: which monsters are
// in this fight, which are kites, which just died. The kite-dip question
// (two kites vs one kite twice) is decided from these snapshots.
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
  const { Game } = await loadGame({ seed: seed, mode: 'competent-strikefall', fullTelemetry: false });
  const fallsLines = [];
  const strikeLines = [];
  const dipLines = [];
  const dipShortLines = [];
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
          } else if (STRIKE_RE.test(line)) {
            strikeLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
          } else if (DIP_RE.test(line)) {
            dipLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
          } else if (DIP_SHORT_RE.test(line)) {
            dipShortLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), fighters: fighterSnap(Game) });
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
    seed: seed, arm: 'strikefall-check', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    fallsCount: fallsLines.length, fallsLines: fallsLines,
    strikeCount: strikeLines.length, strikeLines: strikeLines,
    dipCount: dipLines.length, dipLines: dipLines,
    dipShortCount: dipShortLines.length, dipShortLines: dipShortLines,
    freezelineCount: freezelineLines.length, freezelineLines: freezelineLines,
    applyCount: applyLines.length, applyLines: applyLines,
    bellowCount: bellowLines.length, bellowLines: bellowLines,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-strikefall-a-check');

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('STRIKEFALL STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'strikefall-check-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('STRIKEFALL STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'strikefall-check-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      fallsCount: out.fallsCount, strikeCount: out.strikeCount,
      dipCount: out.dipCount, dipShortCount: out.dipShortCount,
      freezelineCount: out.freezelineCount, applyCount: out.applyCount,
      bellowCount: out.bellowCount, deaths: out.deaths.length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = {
  oneRun: oneRun, FALLS_RE: FALLS_RE, STRIKE_RE: STRIKE_RE, DIP_RE: DIP_RE,
  DIP_SHORT_RE: DIP_SHORT_RE, FREEZELINE_RE: FREEZELINE_RE, APPLY_RE: APPLY_RE,
  BELLOW_RE: BELLOW_RE,
};
