#!/usr/bin/env node
// rosterreturn-driver-20261102.js — dead-villager roster-return instrument
// for sim-rosterreturn-a (Loop A 20261102, axis scale-onramp).
// DIAGNOSIS ONLY: driver-side reads + method wrappers that log state.
// Zero src/js changes, zero policy-decision changes: the policy stack is
// the bearerorder closecommit stack verbatim (titanroute + musterclose +
// mustergap commit-own), so the known 97330 chain reproduces under
// identical play. One process per seed; never two harnesses in one
// process. Prints one JSON summary line per seed to stdout and writes one
// per-seed JSON file into evidence/2026-11-02/perseed-rosterreturn-a/.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97330 RUN=r1 node scripts/rosterreturn-driver-20261102.js
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
  if (process.env[k] !== '1') { console.error(`ROSTERRETURN STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
const TARGET = process.env.TARGET || 'nora_wilson';
if (!SEEDS.length) { console.error('ROSTERRETURN STOP: SEEDS required.'); process.exit(2); }
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
function stackTop(n) {
  try { return (new Error().stack || '').split('\n').slice(2, 2 + (n || 6)).map(function (l) { return l.trim().slice(0, 200); }); } catch (e) { return []; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const trapLog = [];
  const sayKept = [];
  const dailySnap = [];
  const deaths = [];
  const errors = [];
  let inPlayerDeath = false;

  function noraState() {
    try {
      const v = Game.state.village || {};
      const roster = v.roster || [];
      const vp = safe(function () { return Game.vpOf ? Game.vpOf(TARGET) : null; }, null);
      return {
        onRoster: roster.indexOf(TARGET) >= 0,
        rosterIndex: roster.indexOf(TARGET),
        trust: (v.trust || {})[TARGET] == null ? null : v.trust[TARGET],
        vpDead: vp ? !!vp.dead : null,
        isMember: safe(function () { return Game.isMember ? !!Game.isMember(TARGET) : null; }, null),
      };
    } catch (e) { return { error: String(e.message).slice(0, 80) }; }
  }
  function mshipSnap() {
    try {
      const m = Game.mshipState ? Game.mshipState() : null;
      if (!m) return null;
      return {
        applications: (m.applications || []).map(function (a) { return { id: a.id, charId: a.charId || null, name: a.name, arriveDay: a.arriveDay || null }; }),
        arrivals: (m.arrivals || []).map(function (a) { return { id: a.id, charId: a.charId || null, name: a.name, arriveDay: a.arriveDay || null }; }),
      };
    } catch (e) { return { error: String(e.message).slice(0, 80) }; }
  }

  // Say capture: keep every line in the d100-d130 window plus every
  // Nora/application/arrival/walks line on any day (the sense check).
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          const d = gday(Game);
          if ((d >= 100 && d <= 130) || /nora|walks in|Word came|didn't wait|Accepted|application|arrival|Haven grows/i.test(arg)) {
            sayKept.push({ day: d, line: String(arg).slice(0, 500) });
          }
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Roster trap: intercept every roster ASSIGNMENT (setter) and every
  // in-place push on any roster array instance. Logs only when the
  // target id enters the roster (absent -> present), with a stack.
  function installRosterTrap() {
    try {
      const v = Game.state.village || {};
      let current = v.roster || [];
      const wrapPush = function (arr) {
        if (!arr || arr.__rrWrapped) return;
        const orig = arr.push;
        arr.push = function () {
          const before = arr.indexOf(TARGET) >= 0;
          const r = orig.apply(this, arguments);
          try {
            const items = Array.prototype.slice.call(arguments);
            if (!before && arr.indexOf(TARGET) >= 0) {
              trapLog.push({ day: gday(Game), kind: 'push', pushed: items.map(function (x) { return (x && x.id) || x; }), stack: stackTop(8), nora: noraState() });
            }
          } catch (e) {}
          return r;
        };
        try { Object.defineProperty(arr, '__rrWrapped', { value: true, enumerable: false }); } catch (e) {}
      };
      wrapPush(current);
      Object.defineProperty(v, 'roster', {
        configurable: true, enumerable: true,
        get: function () { return current; },
        set: function (nv) {
          const before = current.indexOf(TARGET) >= 0;
          current = nv || [];
          wrapPush(current);
          try {
            if (!before && current.indexOf(TARGET) >= 0) {
              trapLog.push({ day: gday(Game), kind: 'assign', stack: stackTop(8), nora: noraState() });
            }
          } catch (e) {}
        },
      });
    } catch (e) { errors.push('roster-trap: ' + String(e.message).slice(0, 120)); }
  }

  // Method wrappers: log roster diffs + target-relevant args around the
  // candidate re-add paths (arrival, application, auto-recruit, removal).
  function wrapMethod(name, argNote) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function' || orig.__rrWrapped) return;
      const w = function () {
        const before = noraState();
        const r = orig.apply(this, arguments);
        try {
          const after = noraState();
          if (before.onRoster !== after.onRoster || (argNote && argNote(arguments, r))) {
            trapLog.push({ day: gday(Game), kind: 'method:' + name, before: before, after: after, note: argNote ? argNote(arguments, r) : null, stack: stackTop(4) });
          }
        } catch (e) {}
        return r;
      };
      w.__rrWrapped = true;
      Game[name] = w;
    } catch (e) { errors.push('wrap-' + name + ': ' + String(e.message).slice(0, 80)); }
  }
  wrapMethod('removeVillager', function (args) {
    return (args[0] === TARGET) ? { vid: args[0], how: args[1] } : null;
  });
  wrapMethod('arrivalTick', function () {
    const m = mshipSnap();
    const hit = m && (m.arrivals || []).filter(function (a) { return a.charId === TARGET || a.id === TARGET; });
    return (hit && hit.length) ? { arrivalsForTarget: hit } : null;
  });
  wrapMethod('acceptApplication', function (args) {
    return { appId: args[0] };
  });
  wrapMethod('villageAutoRecruit', null);
  wrapMethod('genApplicant', function (args, r) {
    return (r && (r.charId === TARGET || r.id === TARGET)) ? { app: { id: r.id, charId: r.charId || null, name: r.name } } : null;
  });

  // playerDeath wrapper: roster + target state before/after each death.
  try {
    const origPD = Game.playerDeath;
    if (typeof origPD === 'function' && !origPD.__rrWrapped) {
      const wrapped = function (cause) {
        const day = gday(Game);
        const oldId = Game.villagerId;
        const pre = noraState();
        const preRoster = ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [];
        inPlayerDeath = true;
        let result, thrown = null;
        try { result = origPD.apply(this, arguments); } catch (e) { thrown = e; }
        inPlayerDeath = false;
        try {
          deaths.push({ day: day, oldBearer: oldId, oldName: safe(function () { return Game.displayName ? Game.displayName(oldId) : null; }, null),
            chosen: Game.villagerId || null, chosenName: Game.villagerId ? safe(function () { return Game.displayName ? Game.displayName(Game.villagerId) : null; }, null) : null,
            noraBefore: pre, noraAfter: noraState(),
            rosterBefore: preRoster, rosterAfter: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
            error: thrown ? String(thrown.message).slice(0, 120) : null });
        } catch (e) { errors.push('death-snap: ' + String(e.message).slice(0, 80)); }
        if (thrown) throw thrown;
        return result;
      };
      wrapped.__rrWrapped = true;
      Game.playerDeath = wrapped;
    }
  } catch (e) { errors.push('playerDeath-wrap: ' + String(e.message).slice(0, 120)); }

  function dailySnapFn() {
    try {
      dailySnap.push({ day: gday(Game), bearer: Game.villagerId || null,
        roster: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
        nora: noraState(), mship: mshipSnap() });
    } catch (e) { errors.push('daily-snap: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { dailySnapFn(); }
    },
  });

  await setupGame(Game);
  installRosterTrap();
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  const out = { seed, arm: 'rosterreturn', run: RUN, anchorCommit: ANCHOR, target: TARGET,
    gameDays: (st.scholar && st.scholar.day) || 0,
    days: result.days, endReason: result.endReason,
    deaths: deaths, dailySnap: dailySnap, trapLog: trapLog, sayKept: sayKept, errors: errors };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-rosterreturn-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `rr-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const noraDays = rec.dailySnap.filter(function (s) { return s.nora && s.nora.onRoster; }).map(function (s) { return s.day; });
    console.log(JSON.stringify({ seed: rec.seed, run: rec.run, gameDays: rec.gameDays, endReason: rec.endReason,
      deathCount: rec.deaths.length,
      deaths: rec.deaths.map(function (d) { return { day: d.day, old: d.oldName, chosen: d.chosenName }; }),
      trapKinds: rec.trapLog.map(function (t) { return t.day + ':' + t.kind; }),
      noraOnRosterDays: noraDays.slice(0, 40), file: path.relative(REPO, file) }));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
