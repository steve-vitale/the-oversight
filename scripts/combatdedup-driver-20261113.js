// combatdedup-driver-20261113.js — combat-line repetition CHECK / AFTER
// (arm sim-combatdedup-b, run fleshout-loop-b-20261113T0830Z).
// Competent policy verbatim, 150d death-aware, seeds 190391-190398
// (matched band, same as tendshift + freezeline). Wraps Game.say and
// captures EVERY line in four combat classes with its game day AND a
// fight index (a running counter incremented whenever Game.tbfight
// changes identity, so repeats can be attributed to one fight vs many
// fights in a day). Classes: STRIKE (villager strike/harry,
// game.js:41135), FALLS (monster "… falls.", game.js:40064), SNAPS
// (ambush "… SNAPS!", game.js:46126 + turtle :46118), FREEZE (control
// only — the freeze line, Loop A arm sim-freezeline-a; this arm
// reports it, never fixes it). Per-seed JSON to
// evidence/2026-11-13/perseed-combatdedup-b-<leg>/ (writeRobust,
// flap-proof, refuse-overwrite). Refuses to run unless HEAD is
// exactly 85f9cbff6 (baseline) — see prereg; the AFTER leg runs on
// the fix commit and refuses the baseline anchor instead (see
// EXPECTED_ANCHOR_AFTER below).
// Usage:
//   SEEDS=190391,190392 DAYS=150 RUN=combatdedup-check OUTDIR=perseed-combatdedup-b-check node scripts/combatdedup-driver-20261113.js
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
const RUN = process.env.RUN || 'combatdedup-check';
const BASE_ANCHOR_SHORT = '85f9cbff6';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  // Baseline leg: HEAD must carry NO game-code change vs the preregistered
  // base 85f9cbff6 and no fix marker. An exact-hash guard is unworkable
  // for a driver that lives in the repo (each tooling commit moves HEAD,
  // including the commit that would record the hash); what the guard must
  // prove is "current-master game code, fix absent", and the src/js diff
  // proves exactly that. After leg: HEAD must carry the fix marker.
  const gameText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) { return ''; } })();
  const fixPresent = gameText.indexOf('COMBATDEDUP') !== -1;
  if (RUN.indexOf('after') !== -1) {
    if (!fixPresent) {
      console.error('COMBATDEDUP STOP: AFTER leg needs the COMBATDEDUP fix marker in src/js/game.js — HEAD ' + ANCHOR.slice(0, 12) + ' has none.');
      process.exit(2);
    }
    return;
  }
  if (fixPresent) {
    console.error('COMBATDEDUP STOP: CHECK leg needs the fix absent — HEAD ' + ANCHOR.slice(0, 12) + ' carries the COMBATDEDUP marker.');
    process.exit(2);
  }
  let isDesc = false, jsDiff = null;
  try { execSync('git merge-base --is-ancestor ' + BASE_ANCHOR_SHORT + ' HEAD', { cwd: REPO, stdio: 'ignore' }); isDesc = true; } catch (e) { isDesc = false; }
  try { jsDiff = execSync('git diff ' + BASE_ANCHOR_SHORT + '..HEAD -- src/js', { cwd: REPO }).toString(); } catch (e) { jsDiff = null; }
  if (!isDesc || jsDiff == null || jsDiff.trim() !== '') {
    console.error('COMBATDEDUP STOP: CHECK leg needs HEAD descended from ' + BASE_ANCHOR_SHORT + ' with zero src/js diff — got HEAD ' + ANCHOR.slice(0, 12) + (isDesc ? '' : ' (not a descendant)') + (jsDiff && jsDiff.trim() !== '' ? ' (src/js differs)' : ''));
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

const STRIKE_RE = /strikes the|harries the/;
const FALLS_RE = /^(☠ |The |A |An ).* falls\.$/;
const SNAPS_RE = /SNAPS!/;
const FREEZE_RE = /still frozen from your scream/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function groupStats(list) {
  // list: [{day, fight, line}] -> {total, maxPerDay, maxPerDayDay,
  // maxPerFight, maxPerFightKey, repeatLines, groups: [{day,line,count,fights}]}
  const byDayLine = {};
  const byFightLine = {};
  for (const e of list) {
    const dk = e.day + '||' + e.line;
    byDayLine[dk] = (byDayLine[dk] || 0) + 1;
    const fk = e.fight + '||' + e.line;
    byFightLine[fk] = (byFightLine[fk] || 0) + 1;
  }
  let maxPerDay = 0, maxPerDayDay = null, maxPerDayLine = null;
  let maxPerFight = 0, maxPerFightKey = null;
  let repeatLines = 0;
  const groups = [];
  for (const k of Object.keys(byDayLine)) {
    const n = byDayLine[k];
    if (n >= 2) {
      const idx = k.indexOf('||');
      const day = parseInt(k.slice(0, idx), 10);
      const line = k.slice(idx + 2);
      const fights = new Set(list.filter(function (e) { return e.day === day && e.line === line; }).map(function (e) { return e.fight; })).size;
      groups.push({ day: day, line: line, count: n, fights: fights });
      repeatLines += (n - 1);
      if (n > maxPerDay) { maxPerDay = n; maxPerDayDay = day; maxPerDayLine = line; }
    }
  }
  for (const k of Object.keys(byFightLine)) {
    if (byFightLine[k] > maxPerFight) { maxPerFight = byFightLine[k]; maxPerFightKey = k; }
  }
  groups.sort(function (a, b) { return b.count - a.count; });
  return { total: list.length, distinct: new Set(list.map(function (e) { return e.line; })).size, maxPerDay: maxPerDay, maxPerDayDay: maxPerDayDay, maxPerDayLine: maxPerDayLine, maxPerFight: maxPerFight, maxPerFightKey: maxPerFightKey, repeatLines: repeatLines, groups: groups.slice(0, 12) };
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-combatdedup', fullTelemetry: false });
  const captured = { strike: [], falls: [], snaps: [], freeze: [] };
  let sayCount = 0;
  const errors = [];
  let lastFight = null, fightIdx = 0;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const line = String(arg);
          let cls = null;
          if (STRIKE_RE.test(line)) cls = 'strike';
          else if (FALLS_RE.test(line)) cls = 'falls';
          else if (SNAPS_RE.test(line)) cls = 'snaps';
          else if (FREEZE_RE.test(line)) cls = 'freeze';
          if (cls) {
            const f = this.tbfight;
            if (!f) lastFight = null;
            else if (f !== lastFight) { fightIdx++; lastFight = f; }
            const arr = captured[cls];
            if (arr.length < 20000) arr.push({ day: gday(Game), fight: f ? fightIdx : null, line: line.slice(0, 600) });
          }
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
  const gameText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) { return ''; } })();
  const fixPresent = gameText.indexOf('COMBATDEDUP') !== -1;

  return {
    seed: seed, arm: 'combatdedup', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA, fixPresent: fixPresent,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    stats: {
      strike: groupStats(captured.strike),
      falls: groupStats(captured.falls),
      snaps: groupStats(captured.snaps),
      freeze: groupStats(captured.freeze),
    },
    strikeLines: captured.strike, fallsLines: captured.falls,
    snapsLines: captured.snaps, freezeLines: captured.freeze,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-combatdedup-b-check');

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('COMBATDEDUP STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'combatdedup-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('COMBATDEDUP STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'combatdedup-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      strike: out.stats.strike.maxPerDay, strikeTotal: out.stats.strike.total,
      falls: out.stats.falls.maxPerDay, fallsTotal: out.stats.falls.total,
      snaps: out.stats.snaps.maxPerDay, snapsTotal: out.stats.snaps.total,
      freeze: out.stats.freeze.maxPerDay, freezeTotal: out.stats.freeze.total,
      deaths: out.deaths.length, errors: out.instrumentErrors.length,
      fixPresent: out.fixPresent,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, STRIKE_RE: STRIKE_RE, FALLS_RE: FALLS_RE, SNAPS_RE: SNAPS_RE, FREEZE_RE: FREEZE_RE, groupStats: groupStats };
