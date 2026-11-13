// silentvanish-band.js — root-cause probe for finding #2308 (VOICED JOIN,
// SILENT VANISHING). Runs the 190391-190398 band (150d, competent) with:
//  - call-site join tracking: visitorInteract / arrivalTick /
//    _vaAdmitPetitioners wrapped with roster diffs, so joins are caught
//    even when the joiner dies before the next daily snapshot (a same-day
//    join+leave arc is invisible to snapshot tracking — the Grace case).
//  - daily roster snapshots (adds AND removals, with day).
//  - removeVillager wrapped: logs day + vid + how + hydrated name +
//    call-site stack. Direct roster-filter sites wrapped too:
//    tbVillagerFalls, _cxKillContestant.
//  - full say capture, retained for event-adjacent days (join/removal ±1)
//    plus every join-type line, so any exit can be checked for voice.
//
// A join-then-vanish-within-a-day case = a vid whose removal day minus its
// call-site join day is <= 1. Each removal is classified voiced/silent by
// whether a retained say line on removal-day-1..+1 names the leaver (first
// name) or carries a killed/died line for them.
//
// Usage:
//   SEEDS=190392 DAYS=141 node scripts/silentvanish-band.js
//   SEEDS=190391,190392,190393,190394,190395,190396,190397,190398 DAYS=150 node scripts/silentvanish-band.js
// Output: evidence/2026-11-13/perseed-silentvanish-b/silentvanish-s<seed>.json
//   (path via OUTDIR env)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [190392]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-13', 'perseed-silentvanish-b');
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function rosterIds(Game) {
  try { return (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { return []; }
}
function displayName(Game, id) {
  try { return String(Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
function rosterOf(Game) {
  try {
    return rosterIds(Game).map(function (id) { return { vid: id, name: displayName(Game, id) }; });
  } catch (e) { return []; }
}

const JOIN_RE = /walks in|word came|fire makes room|didn't wait|taken in|grows by one|Haven's now/i;

function stackSite() {
  try {
    const st = new Error('trace').stack || '';
    return st.split('\n').slice(2, 6).map(function (l) { return l.trim(); })
      .filter(function (l) { return /src\/js\//.test(l); }).slice(0, 3);
  } catch (e) { return []; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-silentvanish-probe', fullTelemetry: false });
  const sayByDay = {};         // day -> [lines] (full, in memory only)
  const joinLines = [];
  const rosterEvents = [];     // snapshot joins/leaves {day, kind, vid, name, roster}
  const joins = [];            // call-site joins {day, vid, name, via}
  const removals = [];         // instrumented removals {day, vid, name, how, site, via}
  const joinDay = {};          // vid -> first-seen day (call-site preferred)
  const joinName = {};         // vid -> display name at join
  const errors = [];
  let sayCount = 0;
  let prevRoster = null;       // Map vid->name
  let prevDay = -1;

  // --- say capture ---
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const d = gday(Game);
          const line = String(arg).slice(0, 400);
          (sayByDay[d] = sayByDay[d] || []).push(line);
          if (JOIN_RE.test(arg)) joinLines.push({ day: d, line: line });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // --- call-site join wraps (roster diff around the call) ---
  function wrapJoin(fnName, via) {
    try {
      const orig = Game[fnName];
      if (typeof orig !== 'function') { errors.push('wrap-missing: ' + fnName); return; }
      Game[fnName] = function () {
        const before = rosterIds(Game);
        const r = orig.apply(this, arguments);
        try {
          const after = rosterIds(Game);
          after.forEach(function (id) {
            if (before.indexOf(id) < 0) {
              const d = gday(Game);
              const nm = displayName(Game, id);
              joins.push({ day: d, vid: id, name: nm, via: via });
              if (joinDay[id] == null) { joinDay[id] = d; joinName[id] = nm; }
            }
          });
        } catch (e) {}
        return r;
      };
    } catch (e) { errors.push('wrap-install ' + fnName + ': ' + String(e.message).slice(0, 80)); }
  }
  wrapJoin('visitorInteract', 'visitorInteract');
  wrapJoin('arrivalTick', 'arrivalTick');
  wrapJoin('_vaAdmitPetitioners', '_vaAdmitPetitioners');

  // --- removal call-site wraps ---
  function wrapRemoval(fnName, via) {
    try {
      const orig = Game[fnName];
      if (typeof orig !== 'function') { errors.push('wrap-missing: ' + fnName); return; }
      Game[fnName] = function (vid, how) {
        try {
          if (typeof vid === 'string') {
            removals.push({ day: gday(Game), vid: vid, name: displayName(Game, vid), how: (how == null ? null : String(how)), site: stackSite(), via: via });
          }
        } catch (e) {}
        return orig.apply(this, arguments);
      };
    } catch (e) { errors.push('wrap-install ' + fnName + ': ' + String(e.message).slice(0, 80)); }
  }
  wrapRemoval('removeVillager', 'removeVillager');
  wrapRemoval('tbVillagerFalls', 'tbVillagerFalls');
  wrapRemoval('_cxKillContestant', '_cxKillContestant');

  await setupGame(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== prevDay) {
            prevDay = d;
            const ros = rosterOf(Game);
            const ids = new Map(ros.map(function (r) { return [r.vid, r.name]; }));
            if (prevRoster) {
              ros.forEach(function (r) {
                if (!prevRoster.has(r.vid)) {
                  rosterEvents.push({ day: d, kind: 'join', vid: r.vid, name: r.name, roster: ros.length });
                  if (joinDay[r.vid] == null) { joinDay[r.vid] = d; joinName[r.vid] = r.name; }
                }
              });
              prevRoster.forEach(function (name, vid) {
                if (!ids.has(vid)) rosterEvents.push({ day: d, kind: 'leave', vid: vid, name: name, roster: ros.length });
              });
            } else {
              ros.forEach(function (r) { if (joinDay[r.vid] == null) { joinDay[r.vid] = 0; joinName[r.vid] = r.name; } });
            }
            prevRoster = ids;
          }
        } catch (e) { errors.push('roster-track: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  // --- retain say lines for event-adjacent days ---
  const eventDays = new Set();
  function markDays(d) { for (let dd = d - 1; dd <= d + 1; dd++) if (dd >= 0) eventDays.add(dd); }
  rosterEvents.forEach(function (ev) { markDays(ev.day); });
  joins.forEach(function (j) { markDays(j.day); });
  removals.forEach(function (r) { markDays(r.day); });
  const eventDaysSay = [];
  eventDays.forEach(function (d) {
    (sayByDay[d] || []).forEach(function (line) { eventDaysSay.push({ day: d, line: line }); });
  });
  eventDaysSay.sort(function (a, b) { return a.day - b.day; });

  // --- classify removals: vanish-within-a-day? voiced? ---
  const leaves = removals.filter(function (r) { return r.via === 'removeVillager'; }).map(function (r) {
    const jd = joinDay[r.vid];
    const window = [];
    for (let dd = r.day - 1; dd <= r.day + 1; dd++) (sayByDay[dd] || []).forEach(function (line) { window.push({ day: dd, line: line }); });
    const first = (r.name || '').split(' ')[0];
    const named = window.filter(function (w) {
      return (first && w.line.indexOf(first) >= 0) || /wanderer|visjoin|newcomer/i.test(w.line);
    });
    return {
      vid: r.vid, name: r.name, joinDay: (jd == null ? null : jd), leaveDay: r.day,
      withinOneDay: (jd != null && (r.day - jd) <= 1),
      removalPath: { via: r.via, how: r.how, site: r.site },
      namedLines: named,
      voiced: named.length > 0,
    };
  });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let fallen = null, exiles = null;
  try { fallen = ((st.village || {}).fallen || []).slice(-30); } catch (e) {}
  try { exiles = ((st.village || {}).exiles || []).slice(-30); } catch (e) {}

  return {
    seed: seed, arm: 'silentvanish-band', anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    sayCount: sayCount, rosterEvents: rosterEvents, joins: joins, joinLines: joinLines,
    removals: removals, leaves: leaves, eventDaysSay: eventDaysSay,
    fallen: fallen, exiles: exiles,
    instrumentErrors: errors,
  };
}

(async function () {
  if (!SEEDS.length) { console.error('SILENTVANISH-BAND STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(OUTDIR, 'silentvanish-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const van1 = out.leaves.filter(function (l) { return l.withinOneDay; });
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, scaleRank: out.scaleRank, standing: out.standing,
      joins: out.joins.length,
      leaves: out.leaves.length,
      vanishWithin1d: van1.length,
      vanishWithin1dSilent: van1.filter(function (l) { return !l.voiced; }).length,
      silentLeaves: out.leaves.filter(function (l) { return !l.voiced; }).length,
      removalsLogged: out.removals.length,
      file: file,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
