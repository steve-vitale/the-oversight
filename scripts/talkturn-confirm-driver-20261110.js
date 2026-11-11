// talkturn-confirm-driver-20261110.js — talk-turn arm CONFIRM driver
// (arm sim-talkturn-confirm-b, run fleshout-loop-b-20261111T0330Z).
// Copy of the talkturn-a pilot driver with ONLY these changes:
// RUN default 'talkturn-confirm', output directory
// perseed-talkturn-confirm-b, fresh band 150233–150248, file prefix
// 'talkturn-confirm-s', arm string 'talkturn-confirm'. The recorder,
// the talk-turn wraps, the say-wrap, the snapshot cadence, the
// harness calls, and the legs (COMPETENT_TALK=1 vs flag unset) are
// UNCHANGED from the pilot — the confirm measures the same thing
// the same way. Competent policy verbatim, 150d death-aware horizon.
// Two legs on the same seeds; the ONLY difference is the env flag:
//   TALKTURN_MODE=armed    -> COMPETENT_TALK=1 (held conversations)
//   TALKTURN_MODE=control  -> flag unset (plain competent)
// The driver sets/deletes the flag explicitly per leg so ambient env
// cannot leak across legs. Both legs run the secondlink-a recorder
// unchanged (daily snapshots + method wraps + lazy tele capture)
// PLUS a talk-turn recorder (talkTo/convoTurn wraps: talks held,
// turns taken, link:/bond: choice picks, talks with a raiser while
// a raise was pending) and the harness live-death capture
// (result.samples.deaths: day/kind/who/cause/player).
// Per-seed JSON goes to evidence/2026-11-10/perseed-talkturn-confirm-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=150233,150234 RUN=talkturn-confirm TALKTURN_MODE=armed node scripts/talkturn-confirm-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));

let SEEDS = [];
let DAYS = 150;
let RUN = 'talkturn-confirm';
let MODE = 'armed';
let ANCHOR = 'unknown';
let outDir = null;

// Set/delete the COMPETENT_TALK flag explicitly for this leg.
function setTalkFlag(mode) {
  if (mode === 'armed') process.env.COMPETENT_TALK = '1';
  else delete process.env.COMPETENT_TALK;
}

// Talk-turn recorder: wraps talkTo / convoTurn. Record-only — calls
// the original, returns its value unchanged, never throws into the
// game, never consumes RNG.
function createTalkRecorder(Game) {
  const t = { talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, talksWithRaiserPending: 0, talkEvents: [], turnEvents: [], errors: [] };
  let lastDay = -1;
  const wrapped = {};
  function dayOf() { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.errors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { t.errors.push(name + '-pre: ' + String(e.message).slice(0, 80)); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try { if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre); } catch (e) { t.errors.push(name + '-post: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { t.errors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
  }
  function install() {
    wrapMethod('talkTo', {
      pre: function (args) {
        let pending = null;
        try { pending = (typeof Game.pendingLinkRaise === 'function') ? !!Game.pendingLinkRaise(args[0]) : null; } catch (e) { pending = null; }
        return { vid: args[0] || null, pendingRaise: pending };
      },
      post: function (args, r, threw, pre) {
        if (threw) return;
        t.talks++;
        if (pre && pre.pendingRaise) t.talksWithRaiserPending++;
        if (t.talkEvents.length < 200) t.talkEvents.push({ day: dayOf(), vid: (pre && pre.vid) || null, pendingRaise: !!(pre && pre.pendingRaise) });
      },
    });
    wrapMethod('convoTurn', {
      pre: function (args) { return { vid: args[0] || null, choiceId: args[1] || null }; },
      post: function (args, r, threw, pre) {
        if (threw) return;
        t.turns++;
        const cid = (pre && pre.choiceId) || '';
        if (String(cid).indexOf('link:') === 0) t.linkPicks++;
        if (String(cid).indexOf('bond:') === 0) t.bondPicks++;
        if (t.turnEvents.length < 200) t.turnEvents.push({ day: dayOf(), vid: (pre && pre.vid) || null, choiceId: String(cid).slice(0, 60) });
      },
    });
  }
  function snapshotDay() { try { lastDay = dayOf(); } catch (e) {} return lastDay; }
  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { t.errors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
    });
  }
  return { t: t, install: install, snapshotDay: snapshotDay, uninstall: uninstall };
}

if (require.main === module) {
  SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  RUN = process.env.RUN || 'talkturn-pilot';
  MODE = (process.env.TALKTURN_MODE || 'armed').toLowerCase();
  if (!SEEDS.length) { console.error('TALKTURN STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'armed' && MODE !== 'control') { console.error('TALKTURN STOP: TALKTURN_MODE must be armed|control.'); process.exit(2); }
  setTalkFlag(MODE);
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-talkturn-confirm-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'talkturn-confirm-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TALKTURN STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-talkturn', fullTelemetry: false });
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
  const rec = createTalkRecorder(Game);
  rec.install();
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
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
    seed: seed, arm: 'talkturn-confirm', run: RUN, mode: MODE,
    talkFlag: MODE === 'armed' ? '1' : null, anchorCommit: ANCHOR,
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
      const file = path.join(outDir, 'talkturn-confirm-s' + seed + '-' + RUN + '-' + MODE + '.json');
      fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
      const last = (out.daily && out.daily[out.daily.length - 1]) || {};
      console.log(JSON.stringify({
        seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
        maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
        links: out.linkTotal != null ? out.linkTotal : null,
        bondEvents: out.bondEvents ? out.bondEvents.length : null,
        stageCalls: out.stageCalls ? out.stageCalls.length : null,
        snapshots: out.daily ? out.daily.length : null,
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

module.exports = { setTalkFlag: setTalkFlag, createTalkRecorder: createTalkRecorder };
