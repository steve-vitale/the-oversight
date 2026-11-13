// voicejoins-probe-20261113.js — CHECK-FIRST probe for arm sim-voicejoins-b.
//
// Question: on current master, when a wanderer joins the village in the
// wild (seed 190392, d78-81 per finding #2290), does ANY line announce
// the arrival? The finding's evidence is the vetphantom corpus, whose
// vetSays capture is filtered by SAY_RE (veteran/kill words only) — it
// physically cannot contain an arrival line. This probe captures EVERY
// Game.say line and tracks the roster daily, so the check is decisive.
//
// Usage:
//   SEEDS=190392 DAYS=150 node scripts/voicejoins-probe-20261113.js
// Output: <scratch>/voicejoins-probe-s<seed>.json (path via OUTDIR env,
//   default ~/workspace/scratch-loopb-1430)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [190392]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const OUTDIR = process.env.OUTDIR || path.join(process.env.HOME || '~', 'workspace', 'scratch-loopb-1430');
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function rosterOf(Game) {
  try {
    const r = ((Game.state || {}).village || {}).roster || [];
    return r.map(function (id) {
      let name = id;
      try { name = Game.displayName ? Game.displayName(id) : id; } catch (e) {}
      return { vid: id, name: String(name) };
    });
  } catch (e) { return []; }
}

const JOIN_RE = /walks in|word came|fire makes room|didn't wait|taken in|joins|arrived|newcomer|grows by one|Haven's now/i;

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-voicejoins-probe', fullTelemetry: false });
  const allSays = [];
  const joinLines = [];
  const rosterEvents = [];
  let sayCount = 0;
  const errors = [];
  let prevRoster = new Set();
  let prevDay = -1;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const d = gday(Game);
          allSays.push({ day: d, line: String(arg).slice(0, 600) });
          if (JOIN_RE.test(arg)) joinLines.push({ day: d, line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== prevDay) {
            prevDay = d;
            const ros = rosterOf(Game);
            const ids = new Set(ros.map(function (r) { return r.vid; }));
            if (prevRoster.size) {
              ros.forEach(function (r) {
                if (!prevRoster.has(r.vid)) rosterEvents.push({ day: d, vid: r.vid, name: r.name, roster: ros.length });
              });
            }
            prevRoster = ids;
          }
        } catch (e) { errors.push('roster-track: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}

  return {
    seed: seed, arm: 'voicejoins-probe', anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    sayCount: sayCount, rosterEvents: rosterEvents, joinLines: joinLines,
    allSays: allSays, instrumentErrors: errors,
  };
}

(async function () {
  if (!SEEDS.length) { console.error('VOICEJOINS-PROBE STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(OUTDIR, 'voicejoins-probe-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, scaleRank: out.scaleRank, standing: out.standing,
      sayCount: out.sayCount, rosterEvents: out.rosterEvents.length,
      joinLines: out.joinLines.length, file: file,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
