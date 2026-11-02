#!/usr/bin/env node
// deadid-driver-20261102.js — dead-id exclusion sweep instrument for
// sim-deadid-a (Loop A 20261102, axis scale-onramp). Modelled on the
// rosterreturn driver (closecommit stack verbatim); generalizes the
// target from Nora alone to ANY dead id, and records applicant flow
// (draws, accepts, arrivals + outcomes) for the det-gate.
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON
// file into evidence/2026-11-02/perseed-deadid-a/.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97330 RUN=baseline node scripts/deadid-driver-20261102.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`DEADID STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'baseline';
if (!SEEDS.length) { console.error('DEADID STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const deadIds = {}; // id -> {day, how}
  const draws = [];   // {day, id, charId, name, deadAtDraw}
  const accepts = []; // {day, appId, name}
  const arrivals = []; // {day, id, charId, name, outcome}
  const deaths = [];
  const dailySnap = [];
  const sayKept = [];
  const errors = [];

  function isDeadTriple(id) {
    try {
      const vrec = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (vrec && vrec.dead) return true;
      const brec = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
      if (brec && brec.dead) return true;
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp && vp.dead) return true;
    } catch (e) {}
    return false;
  }
  function mshipSnap() {
    try {
      const m = Game.mshipState ? Game.mshipState() : null;
      if (!m) return null;
      return {
        applications: (m.applications || []).map(function (a) { return { id: a.id, charId: a.charId || null, name: a.name }; }),
        arrivals: (m.arrivals || []).map(function (a) { return { id: a.id, charId: a.charId || null, name: a.name, arriveDay: a.arriveDay || null }; }),
      };
    } catch (e) { return null; }
  }

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && /walks in|Word came|never made it|Accepted|wants to join|Haven grows/i.test(arg)) {
          sayKept.push({ day: gday(Game), line: String(arg).slice(0, 500) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 120)); }

  function wrapMethod(name, handler) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function' || orig.__ddWrapped) return;
      const w = function () {
        const pre = handler ? handler.before.apply(null, arguments) : null;
        const r = orig.apply(this, arguments);
        try { if (handler) handler.after.call(null, pre, r, arguments); } catch (e) {}
        return r;
      };
      w.__ddWrapped = true;
      Game[name] = w;
    } catch (e) { errors.push('wrap-' + name + ': ' + String(e.message).slice(0, 80)); }
  }
  wrapMethod('removeVillager', {
    before: function () { return null; },
    after: function (pre, r, args) {
      if ((args[1] === 'killed' || args[1] === 'ambushed') && args[0]) deadIds[args[0]] = { day: gday(Game), how: args[1] };
    },
  });
  wrapMethod('genApplicant', {
    before: function () { return null; },
    after: function (pre, r) {
      if (r) draws.push({ day: gday(Game), id: r.id, charId: r.charId || null, name: r.name, deadAtDraw: isDeadTriple(r.charId || r.id) });
    },
  });
  wrapMethod('acceptApplication', {
    before: function (appId) {
      const m = mshipSnap();
      const hit = m && (m.applications || []).find(function (a) { return a.id === appId; });
      return hit || { id: appId };
    },
    after: function (pre) { accepts.push({ day: gday(Game), appId: pre.id, charId: pre.charId || null, name: pre.name || null }); },
  });
  wrapMethod('villageAutoRecruit', {
    before: function () { return mshipSnap(); },
    after: function (pre) {
      // Auto-recruit moves applications -> arrivals; record newly arrived queue entries.
      try {
        const post = mshipSnap();
        const preIds = {};
        (pre && pre.arrivals || []).forEach(function (a) { preIds[a.id] = 1; });
        (post && post.arrivals || []).forEach(function (a) {
          if (!preIds[a.id]) accepts.push({ day: gday(Game), appId: a.id, charId: a.charId || null, name: a.name, via: 'auto-recruit' });
        });
      } catch (e) {}
    },
  });
  wrapMethod('arrivalTick', {
    before: function () {
      const m = mshipSnap();
      const roster = ((Game.state || {}).village || {}).roster || [];
      return { arrivals: (m && m.arrivals || []).slice(), roster: roster.slice() };
    },
    after: function (pre) {
      try {
        const m = mshipSnap();
        const roster = ((Game.state || {}).village || {}).roster || [];
        const still = {};
        (m && m.arrivals || []).forEach(function (a) { still[a.id] = 1; });
        (pre.arrivals || []).forEach(function (a) {
          if (still[a.id]) return; // still queued (arriveDay in future) — not processed
          const nid = a.charId || a.id;
          const outcome = roster.indexOf(nid) >= 0 ? 'walked' : 'refused';
          arrivals.push({ day: gday(Game), id: a.id, charId: a.charId || null, name: a.name, outcome: outcome, deadAtArrival: !!deadIds[nid] });
        });
      } catch (e) { errors.push('arrivalTick-after: ' + String(e.message).slice(0, 80)); }
    },
  });

  try {
    const origPD = Game.playerDeath;
    if (typeof origPD === 'function' && !origPD.__ddWrapped) {
      const wrapped = function (cause) {
        const day = gday(Game);
        const oldId = Game.villagerId;
        const preRoster = ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [];
        let result, thrown = null;
        try { result = origPD.apply(this, arguments); } catch (e) { thrown = e; }
        try {
          deaths.push({ day: day, oldBearer: oldId, oldName: safe(function () { return Game.displayName ? Game.displayName(oldId) : null; }, null),
            chosen: Game.villagerId || null, chosenName: Game.villagerId ? safe(function () { return Game.displayName ? Game.displayName(Game.villagerId) : null; }, null) : null,
            rosterBefore: preRoster, rosterAfter: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
            error: thrown ? String(thrown.message).slice(0, 120) : null });
        } catch (e) { errors.push('death-snap: ' + String(e.message).slice(0, 80)); }
        if (thrown) throw thrown;
        return result;
      };
      wrapped.__ddWrapped = true;
      Game.playerDeath = wrapped;
    }
  } catch (e) { errors.push('playerDeath-wrap: ' + String(e.message).slice(0, 120)); }

  function dailySnapFn() {
    try {
      dailySnap.push({ day: gday(Game), bearer: Game.villagerId || null,
        roster: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
        appsCount: (mshipSnap() && mshipSnap().applications || []).length,
        arrivalsCount: (mshipSnap() && mshipSnap().arrivals || []).length });
    } catch (e) { errors.push('daily-snap: ' + String(e.message).slice(0, 80)); }
  }
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { dailySnapFn(); }
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  // End-of-run analysis: reappearances + bearer-after-death from daily snaps.
  const reappearances = [];
  const bearerAfterDeath = [];
  Object.keys(deadIds).forEach(function (id) {
    const dd = deadIds[id].day;
    const returnDays = dailySnap.filter(function (s) { return s.day > dd && (s.roster || []).indexOf(id) >= 0; }).map(function (s) { return s.day; });
    if (returnDays.length) reappearances.push({ id: id, deathDay: dd, returnDays: returnDays });
    const bearerDays = dailySnap.filter(function (s) { return s.day > dd && s.bearer === id; }).map(function (s) { return s.day; });
    if (bearerDays.length) bearerAfterDeath.push({ id: id, deathDay: dd, bearerDays: bearerDays });
  });
  const deadDraws = draws.filter(function (d) { return d.deadAtDraw; });
  const deadWalked = arrivals.filter(function (a) { return a.outcome === 'walked' && a.deadAtArrival; });
  const refused = arrivals.filter(function (a) { return a.outcome === 'refused'; });

  const st = Game.state || {};
  return { seed, arm: 'deadid', run: RUN, anchorCommit: ANCHOR,
    gameDays: (st.scholar && st.scholar.day) || 0,
    days: result.days, endReason: result.endReason,
    deaths: deaths, deathCount: deaths.length,
    draws: draws, applicationsTotal: draws.length,
    accepts: accepts, arrivals: arrivals,
    arrivalsWalked: arrivals.filter(function (a) { return a.outcome === 'walked'; }).length,
    arrivalsRefused: refused.length,
    deadIds: deadIds, deadDraws: deadDraws, deadWalked: deadWalked, refused: refused,
    reappearances: reappearances, bearerAfterDeath: bearerAfterDeath,
    dailySnap: dailySnap, sayKept: sayKept, errors: errors };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-deadid-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `dd-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    console.log(JSON.stringify({ seed: rec.seed, run: rec.run, gameDays: rec.gameDays, endReason: rec.endReason,
      deathCount: rec.deathCount,
      deaths: rec.deaths.map(function (d) { return { day: d.day, old: d.oldName, chosen: d.chosenName }; }),
      applicationsTotal: rec.applicationsTotal, arrivalsWalked: rec.arrivalsWalked, arrivalsRefused: rec.arrivalsRefused,
      deadDraws: rec.deadDraws.map(function (d) { return d.day + ':' + (d.charId || d.id); }),
      deadWalked: rec.deadWalked.map(function (a) { return a.day + ':' + (a.charId || a.id); }),
      reappearances: rec.reappearances.map(function (r) { return r.id + '@d' + r.deathDay + '->' + r.returnDays.slice(0, 3).join(','); }),
      bearerAfterDeath: rec.bearerAfterDeath.map(function (b) { return b.id + '@d' + b.deathDay; }),
      file: path.relative(REPO, file) }));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
