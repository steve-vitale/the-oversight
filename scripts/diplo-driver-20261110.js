// diplo-driver-20261110.js — diplomacy first-numbers pilot driver
// (arm sim-diplo-a, run fleshout-20261110T1815Z). Competent policy verbatim,
// 150d death-aware horizon, fresh band 170201–170208.
//
// Three legs on the same seeds; the ONLY differences are the env flag and
// whether the instruments are installed:
//   DIPLO_MODE=control -> COMPETENT_TALK unset (plain competent)
//   DIPLO_MODE=armed   -> COMPETENT_TALK=1 (held conversations)
//   DIPLO_MODE=neutral -> control policy, instruments OFF (no wraps, no
//     snapshots; end-of-run wall numbers only) — the neutrality leg.
// The driver sets/deletes the flag explicitly per leg so ambient env cannot
// leak across legs. Both instrumented legs run the secondlink-a recorder
// unchanged (daily snapshots + link-raise wraps + lazy tele capture) PLUS
// the talkturn talk recorder (talkTo/convoTurn wraps) PLUS the diplo
// instrument (formation provenance + diplomacy verb calls + daily diplo
// snapshot). Per-seed JSON goes to evidence/2026-11-10/perseed-diplo-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=170201,170202 RUN=diplo-pilot DIPLO_MODE=armed node scripts/diplo-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));
const DI = require(path.join(REPO, 'scripts', 'diplo-instrument-20261110'));
const TT = require(path.join(REPO, 'scripts', 'talkturn-driver-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'diplo-pilot';
const MODE = (process.env.DIPLO_MODE || 'control').toLowerCase();
// The neutrality leg is the control policy with instruments off.
const TALK_MODE = MODE === 'armed' ? 'armed' : 'control';
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-diplo-a');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-diplo', fullTelemetry: false });
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
          if (/link|bond|raise|polity|realm|season|tribute|trust|standing|covenant|trade|raid|primacy|court|oath/i.test(arg) && linkSays.length < 200) linkSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null, di = null, rec = null;
  if (INST_ON) {
    inst = INST.install(Game);
    di = DI.install(Game);
    rec = TT.createTalkRecorder(Game);
    rec.install();
  }
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          if (inst) inst.installTeleLazy();
          if (rec) rec.snapshotDay();
          const d = gday(Game);
          if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); if (di) di.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (inst) inst.snapshot(); } catch (e) {}
  try { if (di) di.snapshot(); } catch (e) {}
  try { if (inst) inst.uninstall(); } catch (e) { errors.push('uninstall-inst: ' + String(e.message).slice(0, 80)); }
  try { if (di) di.uninstall(); } catch (e) { errors.push('uninstall-di: ' + String(e.message).slice(0, 80)); }
  try { if (rec) rec.uninstall(); } catch (e) { errors.push('uninstall-rec: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'diplo', run: RUN, mode: MODE,
    talkFlag: TALK_MODE === 'armed' ? '1' : null, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    linkTotal: linkTotal,
    linkSays: linkSays, sayCount: sayCount,
    instrumentErrors: (inst ? inst.t.instrumentErrors : []).concat(di ? di.t.instrumentErrors : []).concat(rec ? rec.t.errors : []).concat(errors),
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
  }
  if (di) {
    out.formLinkCalls = di.t.formLinkCalls;
    out.formPeerLinkCalls = di.t.formPeerLinkCalls;
    out.verbCalls = di.t.verbCalls;
    out.diploDaily = di.t.diploDaily;
    out.wrapLive = di.t.wrapLive;
  }
  if (rec) {
    out.talk = {
      talks: rec.t.talks, turns: rec.t.turns, linkPicks: rec.t.linkPicks, bondPicks: rec.t.bondPicks,
      talksWithRaiserPending: rec.t.talksWithRaiserPending,
      deepConvos: (lastCtx && lastCtx.deepConvos) || 0,
      deepTurns: (lastCtx && lastCtx.deepTurns) || 0,
      talkEvents: rec.t.talkEvents, turnEvents: rec.t.turnEvents,
    };
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('DIPLO STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'armed' && MODE !== 'neutral') { console.error('DIPLO STOP: DIPLO_MODE must be control|armed|neutral.'); process.exit(2); }
  TT.setTalkFlag(TALK_MODE);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'diplo-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('DIPLO STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'diplo-s' + seed + '-' + RUN + '-' + MODE + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = (out.daily && out.daily[out.daily.length - 1]) || {};
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      links: out.linkTotal != null ? out.linkTotal : null,
      bondEvents: out.bondEvents ? out.bondEvents.length : null,
      formLinks: out.formLinkCalls ? out.formLinkCalls.length : null,
      formPeers: out.formPeerLinkCalls ? out.formPeerLinkCalls.length : null,
      verbCalls: out.verbCalls ? out.verbCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      talks: out.talk ? out.talk.talks : null, turns: out.talk ? out.talk.turns : null,
      linkPicks: out.talk ? out.talk.linkPicks : null,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
