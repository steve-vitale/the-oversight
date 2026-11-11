// godpathfirst-driver-20261111.js — godpath / godhood first-numbers pilot driver
// (arm sim-godpathfirst-a, run fleshout-20261111T1115Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190361–190368.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   GODPATHFIRST_MODE=control -> instrument ON (the judged leg)
//   GODPATHFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-godpathfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190361,190362 RUN=godpathfirst-pilot GODPATHFIRST_MODE=control node scripts/godpathfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const GP = require(path.join(REPO, 'scripts', 'godpathfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'godpathfirst-pilot';
const MODE = (process.env.GODPATHFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-godpathfirst-a');

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
// cap can exhaust early — narrowed to godpath / class / ascension /
// deed / synergy / level-up language so generic flavor does not eat it).
const SAY_RE = /god|GOD|class|CLASS|ascen|ASCEN|capstone|CAPSTONE|deed|DEED|synergy|SYNERGY|LEVEL UP|level up|level-up|LEVEL-UP|ability|ABILITY|◈|mythic|MYTHIC|Berserker|Shepherd|Between|All-Seeing|Living Garden|Apex|Market God|Undying Ward|Voice of the Relay|Unkillable|One-Person Army|seek knowledge|seek.*knowledge|build.*moved|word for what you are|not a god/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-godpathfirst', fullTelemetry: false });
  const godpathSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && godpathSays.length < 200) godpathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let gp = null;
  if (INST_ON) gp = GP.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (gp && d !== lastSnapDay) { lastSnapDay = d; gp.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (gp) gp.snapshot(); } catch (e) {}
  try { if (gp) gp.uninstall(); } catch (e) { errors.push('uninstall-gp: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'godpathfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    godpathSays: godpathSays, sayCount: sayCount,
    instrumentErrors: (gp ? gp.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (gp) {
    out.sheetEvents = gp.t.sheetEvents;
    out.pickEvents = gp.t.pickEvents;
    out.villagerPickEvents = gp.t.villagerPickEvents;
    out.learnEvents = gp.t.learnEvents;
    out.recognitionEvents = gp.t.recognitionEvents;
    out.ascensionEvents = gp.t.ascensionEvents;
    out.ceremonyEvents = gp.t.ceremonyEvents;
    out.capstoneGiftEvents = gp.t.capstoneGiftEvents;
    out.verbUseEvents = gp.t.verbUseEvents;
    out.villagerCastEvents = gp.t.villagerCastEvents;
    out.capstoneVerbEvents = gp.t.capstoneVerbEvents;
    out.teleEvents = gp.t.teleEvents;
    out.daily = gp.t.daily;
    out.wrapLive = gp.t.wrapLive;
    out.wrapCounts = gp.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('GODPATHFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('GODPATHFIRST STOP: GODPATHFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'godpathfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('GODPATHFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'godpathfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      sheets: out.sheetEvents ? out.sheetEvents.length : null,
      picks: out.pickEvents ? out.pickEvents.length : null,
      villagerPicks: out.villagerPickEvents ? out.villagerPickEvents.length : null,
      learns: out.learnEvents ? out.learnEvents.length : null,
      recognitions: out.recognitionEvents ? out.recognitionEvents.length : null,
      ascensions: out.ascensionEvents ? out.ascensionEvents.length : null,
      ceremonies: out.ceremonyEvents ? out.ceremonyEvents.length : null,
      capstoneGifts: out.capstoneGiftEvents ? out.capstoneGiftEvents.length : null,
      verbUses: out.verbUseEvents ? out.verbUseEvents.length : null,
      villagerCasts: out.villagerCastEvents ? out.villagerCastEvents.length : null,
      capstoneVerbs: out.capstoneVerbEvents ? out.capstoneVerbEvents.length : null,
      tele: out.teleEvents ? out.teleEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      godpathSays: out.godpathSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
