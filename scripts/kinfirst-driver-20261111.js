// kinfirst-driver-20261111.js — kin / naming / childbirth / keepsakes
// first-numbers pilot driver (arm sim-kinfirst-b, run fleshout-loop-b-20261111T1131Z).
// Competent policy verbatim, 150d death-aware horizon, fresh band 190341–190348.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   KINFIRST_MODE=control -> instrument ON (the judged leg)
//   KINFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-kinfirst-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190341,190342 RUN=kinfirst-pilot KINFIRST_MODE=control node scripts/kinfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const KF = require(path.join(REPO, 'scripts', 'kinfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'kinfirst-pilot';
const MODE = (process.env.KINFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-kinfirst-b');

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
// cap can exhaust early — narrowed to kin/naming/birth/keepsake/mantle
// language so generic flavor does not eat it).
const SAY_RE = /keepsake|💛|🧵|THREAD HOME|baby|👶|born|birth|named|naming|use-name|calledName|mantle|🕯️|is dead|lineage|successor|buried|flashback|FLASHBACK|Taken|stasis|thread home|taken kin|memoryOf|carries|carried/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-kinfirst', fullTelemetry: false });
  const kinSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && kinSays.length < 200) kinSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let kf = null;
  if (INST_ON) kf = KF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (kf && d !== lastSnapDay) { lastSnapDay = d; kf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (kf) kf.snapshot(); } catch (e) {}
  try { if (kf) kf.uninstall(); } catch (e) { errors.push('uninstall-kf: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'kinfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    kinSays: kinSays, sayCount: sayCount,
    instrumentErrors: (kf ? kf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (kf) {
    out.nameBabyEvents = kf.t.nameBabyEvents;
    out.useNameEvents = kf.t.useNameEvents;
    out.autoNameEvents = kf.t.autoNameEvents;
    out.pendingEvents = kf.t.pendingEvents;
    out.growEvents = kf.t.growEvents;
    out.levelBeatEvents = kf.t.levelBeatEvents;
    out.threadEvents = kf.t.threadEvents;
    out.trailEvents = kf.t.trailEvents;
    out.maybeOfferEvents = kf.t.maybeOfferEvents;
    out.relicOfferEvents = kf.t.relicOfferEvents;
    out.bondCallEvents = kf.t.bondCallEvents;
    out.luckyEvents = kf.t.luckyEvents;
    out.holdEvents = kf.t.holdEvents;
    out.anchorEvents = kf.t.anchorEvents;
    out.traumaEvents = kf.t.traumaEvents;
    out.useKsEvents = kf.t.useKsEvents;
    out.equipEvents = kf.t.equipEvents;
    out.migrateEvents = kf.t.migrateEvents;
    out.flashbackEvents = kf.t.flashbackEvents;
    out.deathInFamilyEvents = kf.t.deathInFamilyEvents;
    out.playerDeathEvents = kf.t.playerDeathEvents;
    out.mantleEvents = kf.t.mantleEvents;
    out.teleEvents = kf.t.teleEvents;
    out.daily = kf.t.daily;
    out.wrapLive = kf.t.wrapLive;
    out.wrapCounts = kf.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('KINFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('KINFIRST STOP: KINFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'kinfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('KINFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'kinfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      nameBaby: out.nameBabyEvents ? out.nameBabyEvents.length : null,
      useNames: out.useNameEvents ? out.useNameEvents.length : null,
      autoNames: out.autoNameEvents ? out.autoNameEvents.length : null,
      pending: out.pendingEvents ? out.pendingEvents.length : null,
      grows: out.growEvents ? out.growEvents.length : null,
      levelBeats: out.levelBeatEvents ? out.levelBeatEvents.length : null,
      threads: out.threadEvents ? out.threadEvents.length : null,
      trails: out.trailEvents ? out.trailEvents.length : null,
      maybeOffers: out.maybeOfferEvents ? out.maybeOfferEvents.length : null,
      relicOffers: out.relicOfferEvents ? out.relicOfferEvents.length : null,
      bondCalls: out.bondCallEvents ? out.bondCallEvents.length : null,
      lucky: out.luckyEvents ? out.luckyEvents.length : null,
      holds: out.holdEvents ? out.holdEvents.length : null,
      anchors: out.anchorEvents ? out.anchorEvents.length : null,
      trauma: out.traumaEvents ? out.traumaEvents.length : null,
      ksUses: out.useKsEvents ? out.useKsEvents.length : null,
      equips: out.equipEvents ? out.equipEvents.length : null,
      migrates: out.migrateEvents ? out.migrateEvents.length : null,
      flashbacks: out.flashbackEvents ? out.flashbackEvents.length : null,
      deathInFamily: out.deathInFamilyEvents ? out.deathInFamilyEvents.length : null,
      playerDeaths: out.playerDeathEvents ? out.playerDeathEvents.length : null,
      mantles: out.mantleEvents ? out.mantleEvents.length : null,
      tele: out.teleEvents ? out.teleEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      kinSays: out.kinSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
