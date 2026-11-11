// corruptfirst-driver-20261111.js — corruption / cannibalism first-numbers
// pilot driver (arm sim-corruptfirst-a, run fleshout-20261111T1408Z).
// Competent policy verbatim, 150d death-aware horizon, fresh band
// 190381–190388.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   CORRUPTFIRST_MODE=control -> instrument ON (the judged leg)
//   CORRUPTFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-corruptfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190381,190382 RUN=corruptfirst-pilot CORRUPTFIRST_MODE=control node scripts/corruptfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const CF = require(path.join(REPO, 'scripts', 'corruptfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'corruptfirst-pilot';
const MODE = (process.env.CORRUPTFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-corruptfirst-a');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
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
      if (i === 59) {
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

// Prereg regex (same early-game-only caveat as the siblings: the 200-line
// cap can exhaust early — narrowed to corruption/cannibalism/fear/dark
// language so generic flavor does not eat it).
const SAY_RE = /corrupt|cannibal|human meat|butcher the body|desecrat|fear|dread|psycho|trembles|exile|moot|dark fans|gnawing|hunger has a voice|shared secret|offered.*meat|wrapped parcel|care package|INNER VOICE|FLASHBACK|Someone is watching|Nobody saw|threatened|intimidat|watched you eat|the quickest source of power/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-corruptfirst', fullTelemetry: false });
  const corruptSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && corruptSays.length < 200) corruptSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let cf = null;
  if (INST_ON) cf = CF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (cf && d !== lastSnapDay) { lastSnapDay = d; cf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (cf) cf.snapshot(); } catch (e) {}
  try { if (cf) cf.uninstall(); } catch (e) { errors.push('uninstall-cf: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'corruptfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    corruptSays: corruptSays, sayCount: sayCount,
    instrumentErrors: (cf ? cf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (cf) {
    out.corrEvents = cf.t.corrEvents;
    out.slopeEvents = cf.t.slopeEvents;
    out.diseaseEvents = cf.t.diseaseEvents;
    out.crimeEvents = cf.t.crimeEvents;
    out.thresholdEvents = cf.t.thresholdEvents;
    out.tickEvents = cf.t.tickEvents;
    out.psychoEvents = cf.t.psychoEvents;
    out.discoveryEvents = cf.t.discoveryEvents;
    out.fearEvents = cf.t.fearEvents;
    out.foilEvents = cf.t.foilEvents;
    out.heatEvents = cf.t.heatEvents;
    out.showEvents = cf.t.showEvents;
    out.memoryEvents = cf.t.memoryEvents;
    out.daily = cf.t.daily;
    out.wrapLive = cf.t.wrapLive;
    out.wrapCounts = cf.t.wrapCounts;
    out.trustGainCalls = cf.t.trustGainCalls;
    out.corruptionTickCalls = cf.t.corruptionTickCalls;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('CORRUPTFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('CORRUPTFIRST STOP: CORRUPTFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'corruptfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('CORRUPTFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'corruptfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      corrEvents: out.corrEvents ? out.corrEvents.length : null,
      slopeEvents: out.slopeEvents ? out.slopeEvents.length : null,
      diseaseEvents: out.diseaseEvents ? out.diseaseEvents.length : null,
      crimeEvents: out.crimeEvents ? out.crimeEvents.length : null,
      thresholdEvents: out.thresholdEvents ? out.thresholdEvents.length : null,
      tickEvents: out.tickEvents ? out.tickEvents.length : null,
      psychoEvents: out.psychoEvents ? out.psychoEvents.length : null,
      discoveryEvents: out.discoveryEvents ? out.discoveryEvents.length : null,
      fearEvents: out.fearEvents ? out.fearEvents.length : null,
      foilEvents: out.foilEvents ? out.foilEvents.length : null,
      heatEvents: out.heatEvents ? out.heatEvents.length : null,
      showEvents: out.showEvents ? out.showEvents.length : null,
      memoryEvents: out.memoryEvents ? out.memoryEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      corruptSays: out.corruptSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
