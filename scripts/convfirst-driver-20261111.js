// convfirst-driver-20261111.js — conversations first-numbers pilot driver
// (arm sim-convfirst-a, run fleshout-20261111T0815Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190201–190208.
// Two legs on the same seeds; the ONLY difference is the instrument:
//   CONVFIRST_MODE=control -> instrument ON (the judged leg)
//   CONVFIRST_MODE=neutral -> instrument OFF (wall numbers + days +
//     end pantry kcal + deaths only; must match control exactly on
//     days + end pantry kcal + death count, 8/8)
// COMPETENT_TALK is explicitly UNSET for both legs so ambient env
// cannot leak held conversations in — this arm measures DEFAULT play.
// Per-seed JSON goes to evidence/2026-11-11/perseed-convfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=190201,190202 RUN=convfirst-pilot CONVFIRST_MODE=control node scripts/convfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'convfirst-instrument-20261111'));

let SEEDS = [];
let DAYS = 150;
let RUN = 'convfirst-pilot';
let MODE = 'control';
let ANCHOR = 'unknown';
let outDir = null;

// Default play means the flag is OFF: delete it explicitly per leg so
// ambient env cannot leak held conversations into either leg.
function setFlagOff() { delete process.env.COMPETENT_TALK; }

// writeJsonRetry: flap-hardened per-seed write (EPERM flap 2026-11-11:
// a direct writeFileSync created a 0-byte corpus file and threw,
// losing seed 190201's control result in memory). Write to a
// unique sibling temp file, verify its byte size, then rename into
// place; retry the whole attempt on EPERM (up to 40 x 5s — the flap
// clears in windows). A failed attempt unlinks its temp file so no
// 0-byte leftover can poison the next run. Never overwrites an
// existing target (the driver's startup check still refuses).
function writeJsonRetry(file, text) {
  const tmp = file + '.tmp-' + process.pid + '-' + Date.now();
  let lastErr = null;
  for (let attempt = 1; attempt <= 40; attempt++) {
    try {
      fs.writeFileSync(tmp, text);
      const got = fs.statSync(tmp).size;
      if (got !== Buffer.byteLength(text)) throw new Error('short write: ' + got + ' of ' + Buffer.byteLength(text) + ' bytes');
      fs.renameSync(tmp, file);
      return;
    } catch (e) {
      lastErr = e;
      try { fs.unlinkSync(tmp); } catch (e2) {}
      if (attempt < 40) {
        try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000); } catch (e3) {}
      }
    }
  }
  throw lastErr;
}

if (require.main === module) {
  SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  RUN = process.env.RUN || 'convfirst-pilot';
  MODE = (process.env.CONVFIRST_MODE || 'control').toLowerCase();
  if (!SEEDS.length) { console.error('CONVFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('CONVFIRST STOP: CONVFIRST_MODE must be control|neutral.'); process.exit(2); }
  setFlagOff();
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-convfirst-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'convfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('CONVFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}

// Conversation-regex say corpus for the sense test (200 lines/seed
// cap — same early-game-only caveat as the sibling arms; narrowed
// regex so combat lines do not eat the cap).
const CONV_SAY_RE = /talk|convers|gossip|rumor|secret|confess|teach|lesson|hawker|compare maps|Can we talk|wants to talk|overheard|from before/i;

async function oneRun(seed, mode, days) {
  setFlagOff();
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-convfirst', fullTelemetry: false });
  const convSays = [];
  let sayCount = 0;
  const errors = [];
  if (mode === 'control') {
    try {
      const origSay = Game.say;
      Game.say = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string') {
            sayCount++;
            if (CONV_SAY_RE.test(arg) && convSays.length < 200) convSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          }
        } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
        return origSay.apply(this, arguments);
      };
    } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  await setupGame(Game);
  const inst = (mode === 'control') ? INST.install(Game) : null;
  let lastSnapDay = -1;

  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        if (inst) {
          try {
            inst.installTeleLazy();
            const d = gday(Game);
            if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
          } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
        }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  if (inst) {
    try { inst.snapshot(); } catch (e) {}
    try { inst.uninstall(); } catch (e) { errors.push('uninstall-inst: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let linkTotal = null;
  try { linkTotal = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState().length : null; } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'convfirst', run: RUN, mode: mode,
    talkFlag: null, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    linkTotal: linkTotal,
    endPantryKcal: pantryKcal(Game),
    convSays: convSays, sayCount: sayCount,
    instrumentErrors: (inst ? inst.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (inst) {
    out.daily = inst.t.daily;
    out.bondEvents = inst.t.bondEvents;
    out.stageCalls = inst.t.stageCalls;
    out.acceptCalls = inst.t.acceptCalls;
    out.declineCalls = inst.t.declineCalls;
    out.proposeCalls = inst.t.proposeCalls;
    out.linkTickCalls = inst.t.linkTickCalls;
    out.bondTickCalls = inst.t.bondTickCalls;
    out.stageBondCalls = inst.t.stageBondCalls;
    out.acceptBondCalls = inst.t.acceptBondCalls;
    out.declineBondCalls = inst.t.declineBondCalls;
    out.talk = {
      talkToCalls: inst.t.talkToCalls,
      convoTurnCalls: inst.t.convoTurnCalls,
      endConvoCalls: inst.t.endConvoCalls,
      initiativeCalls: inst.t.initiativeCalls,
      expireCalls: inst.t.expireCalls,
      talkOpens: inst.t.talkOpens,
      turnEvents: inst.t.turnEvents,
      endEvents: inst.t.endEvents,
      expireEvents: inst.t.expireEvents,
      initiativeEvents: inst.t.initiativeEvents,
      supersedeEvents: inst.t.supersedeEvents,
      purgeEvents: inst.t.purgeEvents,
      playerDeathCalls: inst.t.playerDeathCalls,
      hawkerOffers: inst.t.hawkerOffers,
      hawkerBuys: inst.t.hawkerBuys,
      compareMapsCalls: inst.t.compareMapsCalls,
    };
  }
  return out;
}

if (require.main === module) {
  (async function () {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const out = await oneRun(seed, MODE, DAYS);
      const file = path.join(outDir, 'convfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
      writeJsonRetry(file, JSON.stringify(out, null, 2) + '\n');
      const last = (out.daily && out.daily[out.daily.length - 1]) || {};
      console.log(JSON.stringify({
        seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
        maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
        links: out.linkTotal != null ? out.linkTotal : null,
        endPantryKcal: out.endPantryKcal,
        snapshots: out.daily ? out.daily.length : null,
        talkTo: out.talk ? out.talk.talkToCalls : null,
        turns: out.talk ? out.talk.convoTurnCalls : null,
        requestsStaged: out.talk ? out.talk.initiativeEvents.length : null,
        requestsExpired: out.talk ? out.talk.expireEvents.length : null,
        deaths: out.deaths.length,
        errors: out.instrumentErrors.length,
        ms: Date.now() - t0,
        file: path.relative(REPO, file),
      }));
    }
  })().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { setFlagOff: setFlagOff, oneRun: oneRun, CONV_SAY_RE: CONV_SAY_RE, classifyChoice: INST.classifyChoice };
