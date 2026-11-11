// trustfirst-driver-20261111.js — trust + gossip first-numbers pilot driver
// (arm sim-trustfirst-a, run fleshout-20261111T0815Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190211–190218.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   TRUSTFIRST_MODE=control -> instrument ON (the judged leg)
//   TRUSTFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-trustfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190211,190212 RUN=trustfirst-pilot TRUSTFIRST_MODE=control node scripts/trustfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const TF = require(path.join(REPO, 'scripts', 'trustfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'trustfirst-pilot';
const MODE = (process.env.TRUSTFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-trustfirst-a');

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
// cap can exhaust early — narrowed so combat "trusted hands" flavor and
// generic "trust your gut" lines do not eat it).
const SAY_RE = /trust|gossip|rumor|rumour|rep word|they trust|village trust|word gets around|fragments by the fire|people are saying|moot|cold shoulder|exile|reputation/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-trustfirst', fullTelemetry: false });
  const trustSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && trustSays.length < 200) trustSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let tf = null;
  if (INST_ON) tf = TF.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (tf && d !== lastSnapDay) { lastSnapDay = d; tf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (tf) tf.snapshot(); } catch (e) {}
  try { if (tf) tf.uninstall(); } catch (e) { errors.push('uninstall-tf: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'trustfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    trustSays: trustSays, sayCount: sayCount,
    instrumentErrors: (tf ? tf.t.instrumentErrors.concat(tf.tgT ? tf.tgT.instrumentErrors : []) : []).concat(errors),
    deaths: deaths,
  };
  if (tf) {
    out.bumpTrust = tf.t.bumpTrust;
    out.evTrustAll = tf.t.evTrustAll;
    out.trustGains = tf.t.trustGains;
    out.applyRep = tf.t.applyRep;
    out.observe = tf.t.observe;
    out.seedGossip = tf.t.seedGossip;
    out.spreadGossip = tf.t.spreadGossip;
    out.spreadRumor = tf.t.spreadRumor;
    out.gossipDims = tf.t.gossipDims;
    out.talkOpens = tf.t.talkOpens;
    out.endConvo = tf.t.endConvo;
    out.moot = tf.t.moot;
    out.tendLink = tf.t.tendLink;
    out.trustWrites = tf.t.trustWrites;
    out.bondEvents = tf.t.bondEvents;
    out.teleBond = tf.t.teleBond;
    out.opinionVerbs = tf.t.opinionVerbs;
    out.river = tf.t.river;
    out.teleTrust = tf.t.teleTrust;
    out.daily = tf.t.daily;
    out.wrapLive = tf.t.wrapLive;
    out.wrapCounts = tf.t.wrapCounts;
    out.tgDaily = tf.tgT ? tf.tgT.daily : null;
    out.tgEvents = tf.tgT ? tf.tgT.events : null;
    out.tgGains = tf.tgT ? tf.tgT.gains : null;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('TRUSTFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('TRUSTFIRST STOP: TRUSTFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'trustfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TRUSTFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'trustfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      bumpTrust: out.bumpTrust ? out.bumpTrust.length : null,
      evTrustAll: out.evTrustAll ? out.evTrustAll.length : null,
      applyRep: out.applyRep ? out.applyRep.length : null,
      observe: out.observe ? out.observe.length : null,
      seedGossip: out.seedGossip ? out.seedGossip.length : null,
      spreadGossip: out.spreadGossip ? out.spreadGossip.length : null,
      spreadRumor: out.spreadRumor ? out.spreadRumor.length : null,
      talkOpens: out.talkOpens ? out.talkOpens.length : null,
      endConvo: out.endConvo ? out.endConvo.length : null,
      moot: out.moot ? out.moot.length : null,
      tendLink: out.tendLink ? out.tendLink.length : null,
      trustWrites: out.trustWrites ? out.trustWrites.length : null,
      bondEvents: out.bondEvents ? out.bondEvents.length : null,
      opinionVerbs: out.opinionVerbs ? out.opinionVerbs.length : null,
      river: out.river ? out.river.length : null,
      snapshots: out.daily ? out.daily.length : null,
      trustSays: out.trustSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
