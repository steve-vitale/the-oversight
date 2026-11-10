// raiserseat-driver-20261110.js — raiser-seat arm pilot driver
// (arm sim-raiserseat-a, run fleshout-20261110T1415Z). Competent policy
// verbatim + the RAISER_SEAT gate in talkScore, 150d death-aware
// horizon, identical seeds 150201–150208, COMPETENT_TALK=1 on BOTH
// legs (the talkturn-a substrate). Two legs on the same seeds; the ONLY
// difference is the env flag:
//   RAISERSEAT_MODE=armed    -> RAISER_SEAT=1 (pending-raise signal on)
//   RAISERSEAT_MODE=control  -> flag unset (talkturn-a policy verbatim)
// The driver sets/deletes the flags explicitly per leg so ambient env
// cannot leak across legs. Both legs run the secondlink-a recorder
// unchanged (daily snapshots + method wraps + lazy tele capture) PLUS
// the talkturn-a talk recorder (talkTo/convoTurn wraps) PLUS a daily
// pending-raise census (pending raises at day start with each raiser's
// commLevel — answerable vs unanswerable) and the harness live-death
// capture (result.samples.deaths: day/kind/who/cause/player).
// Per-seed JSON goes to evidence/2026-11-10/perseed-raiserseat-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=150201,150202 RUN=raiserseat-pilot RAISERSEAT_MODE=armed node scripts/raiserseat-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));
const TDRV = require(path.join(REPO, 'scripts', 'talkturn-driver-20261110'));

let SEEDS = [];
let DAYS = 150;
let RUN = 'raiserseat-pilot';
let MODE = 'armed';
let ANCHOR = 'unknown';
let outDir = null;

// Both legs hold conversations (the talkturn-a substrate). Only the
// raiser-seat signal differs, set explicitly per leg.
function setRaiserFlags(mode) {
  process.env.COMPETENT_TALK = '1';
  if (mode === 'armed') process.env.RAISER_SEAT = '1';
  else delete process.env.RAISER_SEAT;
}

if (require.main === module) {
  SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  RUN = process.env.RUN || 'raiserseat-pilot';
  MODE = (process.env.RAISERSEAT_MODE || 'armed').toLowerCase();
  if (!SEEDS.length) { console.error('RAISERSEAT STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'armed' && MODE !== 'control') { console.error('RAISERSEAT STOP: RAISERSEAT_MODE must be armed|control.'); process.exit(2); }
  setRaiserFlags(MODE);
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-raiserseat-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'raiserseat-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('RAISERSEAT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Daily pending-raise census at day start (what the day's seating faced):
// each pending raise with the raiser's commLevel (answerable or not).
// Pure reads only — never alters state, never consumes RNG.
function raiseCensus(Game, errors) {
  try {
    const lr = ((Game.state || {}).village || {}).linkRaises || {};
    const ids = Object.keys(lr);
    if (!ids.length) return null;
    return {
      day: gday(Game),
      pending: ids.map(function (vid) {
        const p = lr[vid] || {};
        let comm = null;
        try { const c = Game.commLevel ? Game.commLevel(vid) : null; comm = c ? (c.level || null) : null; } catch (e) { comm = null; }
        return { vid: vid, villageId: p.villageId || null, comm: comm };
      }),
    };
  } catch (e) { if (errors) errors.push('raiseCensus: ' + String(e.message).slice(0, 80)); return null; }
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-raiserseat', fullTelemetry: false });
  const linkSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/link|bond|raise|polity|realm|season|tribute|trust|standing/i.test(arg) && linkSays.length < 200) linkSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const rec = TDRV.createTalkRecorder(Game);
  rec.install();
  const raiseDays = [];
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try {
        const c = raiseCensus(Game, errors);
        if (c) raiseDays.push(c);
      } catch (e) { errors.push('raiseCensus-day: ' + String(e.message).slice(0, 80)); }
      try { return policy.daily(Gm, ctx); } finally {
        try {
          inst.installTeleLazy();
          rec.snapshotDay();
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall-inst: ' + String(e.message).slice(0, 80)); }
  try { rec.uninstall(); } catch (e) { errors.push('uninstall-rec: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'raiserseat', run: RUN, mode: MODE,
    talkFlag: '1', seatFlag: MODE === 'armed' ? '1' : null, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    linkTotal: linkTotal,
    linkSays: linkSays, sayCount: sayCount,
    instrumentErrors: inst.t.instrumentErrors.concat(rec.t.errors).concat(errors),
    daily: inst.t.daily,
    bondEvents: inst.t.bondEvents,
    stageCalls: inst.t.stageCalls,
    acceptCalls: inst.t.acceptCalls,
    declineCalls: inst.t.declineCalls,
    proposeCalls: inst.t.proposeCalls,
    linkTickCalls: inst.t.linkTickCalls,
    raiseDays: raiseDays,
    talk: {
      talks: rec.t.talks, turns: rec.t.turns, linkPicks: rec.t.linkPicks, bondPicks: rec.t.bondPicks,
      talksWithRaiserPending: rec.t.talksWithRaiserPending,
      deepConvos: (lastCtx && lastCtx.deepConvos) || 0,
      deepTurns: (lastCtx && lastCtx.deepTurns) || 0,
      talkEvents: rec.t.talkEvents, turnEvents: rec.t.turnEvents,
    },
    deaths: deaths,
  };
  return out;
}

if (require.main === module) {
  (async function () {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const out = await oneRun(seed);
      const file = path.join(outDir, 'raiserseat-s' + seed + '-' + RUN + '-' + MODE + '.json');
      fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
      const last = (out.daily && out.daily[out.daily.length - 1]) || {};
      console.log(JSON.stringify({
        seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
        maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
        links: out.linkTotal != null ? out.linkTotal : null,
        bondEvents: out.bondEvents ? out.bondEvents.length : null,
        stageCalls: out.stageCalls ? out.stageCalls.length : null,
        snapshots: out.daily ? out.daily.length : null,
        raiseDays: out.raiseDays ? out.raiseDays.length : null,
        talks: out.talk.talks, turns: out.talk.turns, linkPicks: out.talk.linkPicks,
        raiserPending: out.talk.talksWithRaiserPending,
        deepTurns: out.talk.deepTurns, deaths: out.deaths.length,
        errors: out.instrumentErrors.length,
        ms: Date.now() - t0,
        file: path.relative(REPO, file),
      }));
    }
  })().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { setRaiserFlags: setRaiserFlags, raiseCensus: raiseCensus };
