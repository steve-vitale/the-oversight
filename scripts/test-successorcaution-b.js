#!/usr/bin/env node
// scripts/test-successorcaution-b.js — sim-successorcaution-b proof: the
// successor-caution policy variant (scripts/policies/
// competent-successorcaution-b.js).
//
// THE LEVER (see evidence/2026-11-15/sim-successorcaution-b-prereg.md):
// after a succession (Game.villagerId changes across daily() calls) the
// new scholar stays at/near Haven for their first N=2 days instead of
// starting a solo forage trip. Caution days run a haven day (court
// answer + scale climb + keepPromises/sortHaul/competentEat/talkRound/
// gearUp + walk home if away + one voiced line); the wrapped daily is
// NOT called, so no solo trip, stoneRun, counterPlay, or trapline.
// upkeep (eat/drink) and fight are inherited unchanged.
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process). The 'all' runner spawns one child
// process per case and aggregates; exit 1 if any case fails. Each case
// prints one JSON line.
//   static        no Math.random in the new policy file; CAUTION_DAYS is
//                 2; competent.js + competent-answercourt-b.js unmodified
//                 vs HEAD; no src/js file modified by this branch; the
//                 fight hook is inherited unchanged.
//   unit-caution  fake-Game dispatch: first daily runs the wrapped daily;
//                 a vid change opens a 2-day caution window (wrapped
//                 daily NOT called, trip suppressed when needTrip is
//                 true, one voiced line names the successor); normal play
//                 resumes on day 3 after the succession; a second
//                 succession re-opens the window.
//   sim-caution   real harness, seed 100208, 60 days (first scholar
//                 death day 23 in the corpus): at least one succession
//                 fires; on every caution day the wrapped daily is NOT
//                 called, forageTrips does not increase, and the scholar
//                 stays at Haven; the successor's first daily after a
//                 succession finds them at Haven; stats record the
//                 successions, caution days, and at least one suppressed
//                 trip.
//   determinism   the armed driver oneRun twice on seed 100208, 60 days:
//                 deaths, days, endReason, series length, and the
//                 successorcaution stats are identical.
// Usage: node scripts/test-successorcaution-b.js [seed] [case]
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100208');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }
function fail(k, detail, extra) { out(Object.assign({ case: k, pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(k, extra) { out(Object.assign({ case: k, pass: true }, extra || {})); process.exit(0); }

if (kase === 'all') {
  const cases = ['static', 'unit-caution', 'sim-caution', 'determinism'];
  let allOk = true;
  for (const c of cases) {
    try {
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-successorcaution-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 600000 });
      const lines = r.trim().split('\n').filter(Boolean);
      for (const l of lines) { try { const j = JSON.parse(l); if (j.pass === false) allOk = false; console.log(l); } catch (e) { console.log(l); } }
    } catch (e) {
      allOk = false;
      console.log(JSON.stringify({ case: c, pass: false, detail: 'child failed: ' + String((e.stdout || '') + (e.stderr || '') + e.message).slice(0, 500) }));
    }
  }
  process.exit(allOk ? 0 : 1);
}

if (kase === 'static') {
  const polPath = path.join(repo, 'scripts', 'policies', 'competent-successorcaution-b.js');
  const srcRaw = fs.readFileSync(polPath, 'utf8');
  // Strip comments first: the header documents "no Math.random" in
  // prose, and prose must not trip the code check.
  const src = srcRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  if (/Math\.random/.test(src)) fail('static', 'policy file uses Math.random in code');
  const mod = require(polPath);
  if (mod.CAUTION_DAYS !== 2) fail('static', 'CAUTION_DAYS is not 2: ' + mod.CAUTION_DAYS);
  let changed = [];
  try { changed = execSync('git diff HEAD --name-only', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  if (changed.indexOf('scripts/policies/competent.js') >= 0) fail('static', 'competent.js modified');
  if (changed.indexOf('scripts/policies/competent-answercourt-b.js') >= 0) fail('static', 'competent-answercourt-b.js modified');
  const srcChanged = changed.filter(function (f) { return f.indexOf('src/') === 0; });
  if (srcChanged.length) fail('static', 'src/js changed: ' + srcChanged.join(','));
  const ac = require(path.join(repo, 'scripts', 'policies', 'competent-answercourt-b'));
  if (mod.successorcautionPolicy.fight !== ac.answercourtPolicy.fight) fail('static', 'fight hook is not inherited unchanged');
  if (mod.successorcautionPolicy.upkeep !== ac.answercourtPolicy.upkeep) fail('static', 'upkeep hook is not inherited unchanged');
  if (mod.successorcautionPolicy.id !== 'competent-successorcaution-b') fail('static', 'wrong policy id: ' + mod.successorcautionPolicy.id);
  pass('static', { cautionDays: mod.CAUTION_DAYS, changedTracked: changed.length });
}

if (kase === 'unit-caution') {
  const mod = require(path.join(repo, 'scripts', 'policies', 'competent-successorcaution-b'));
  const ac = require(path.join(repo, 'scripts', 'policies', 'competent-answercourt-b'));
  // --- pure decision function on a fake Game ---
  const fake = { villagerId: 'v1', state: { scholar: { day: 1 }, village: { px: 4, py: 4, pantry: [] }, pendingNational: null }, data: { villagers: [{ id: 'v1', name: 'Ann Test' }, { id: 'v2', name: 'Bo Test' }] } };
  let ctx = {};
  let st = mod.cautionState(fake, ctx);
  if (st.caution) fail('unit-caution', 'first daily should not be caution');
  fake.state.scholar.day = 2;
  st = mod.cautionState(fake, ctx);
  if (st.caution) fail('unit-caution', 'same bearer day 2 should not be caution');
  fake.villagerId = 'v2'; fake.state.scholar.day = 3;
  st = mod.cautionState(fake, ctx);
  if (!st.caution || st.daysLeft !== 2) fail('unit-caution', 'succession day should open a 2-day window: ' + JSON.stringify(st));
  fake.state.scholar.day = 4;
  st = mod.cautionState(fake, ctx);
  if (!st.caution || st.daysLeft !== 1) fail('unit-caution', 'second caution day should have 1 day left: ' + JSON.stringify(st));
  fake.state.scholar.day = 5;
  st = mod.cautionState(fake, ctx);
  if (st.caution) fail('unit-caution', 'day 5 (after N=2) should resume normal play');
  // --- dispatch: patch the wrapped daily with a counting stub ---
  let innerCalls = 0;
  const origDaily = ac.answercourtPolicy.daily;
  ac.answercourtPolicy.daily = function () { innerCalls += 1; };
  const said = [];
  const g2 = { villagerId: 'v1',
    state: { scholar: { day: 1, kcal: 1500, insideHaven: true }, village: { px: 4, py: 4, pantry: [], roster: ['v1', 'v2'] }, pendingNational: null, otherVillages: [] },
    data: { villagers: [{ id: 'v1', name: 'Ann Test' }, { id: 'v2', name: 'Bo Test' }] },
    say: function (s) { said.push(String(s)); },
    playerAtHaven: function () { return true; },
    map: { px: 4, py: 4 } };
  // needTrip reads Game.kcalCap + state; give it a stub so the
  // suppression count is honest (pantry 0 < 25000 -> trip needed).
  g2.kcalCap = function () { return 2000; };
  mod.resetSuccessorcautionStats();
  const ctx2 = {};
  let threw = null;
  try {
    mod.successorcautionPolicy.daily(g2, ctx2); // day 1, v1: normal
    if (innerCalls !== 1) fail('unit-caution', 'day 1 should call the wrapped daily once, got ' + innerCalls);
    g2.villagerId = 'v2'; g2.state.scholar.day = 2;
    mod.successorcautionPolicy.daily(g2, ctx2); // succession: caution 1
    if (innerCalls !== 1) fail('unit-caution', 'caution day 1 must NOT call the wrapped daily, got ' + innerCalls);
    g2.state.scholar.day = 3;
    mod.successorcautionPolicy.daily(g2, ctx2); // caution 2
    if (innerCalls !== 1) fail('unit-caution', 'caution day 2 must NOT call the wrapped daily, got ' + innerCalls);
    g2.state.scholar.day = 4;
    mod.successorcautionPolicy.daily(g2, ctx2); // resumed: normal
    if (innerCalls !== 2) fail('unit-caution', 'day 4 should resume the wrapped daily, got ' + innerCalls);
    // Second succession re-opens the window.
    g2.villagerId = 'v1'; g2.state.scholar.day = 5;
    mod.successorcautionPolicy.daily(g2, ctx2);
    if (innerCalls !== 2) fail('unit-caution', 'second succession must re-open caution, got ' + innerCalls);
  } catch (e) { threw = e; }
  ac.answercourtPolicy.daily = origDaily;
  if (threw) fail('unit-caution', 'daily threw: ' + (threw && threw.stack || threw));
  const stats = mod.successorcautionStats();
  if (stats.successionsDetected !== 2) fail('unit-caution', 'successionsDetected should be 2, got ' + stats.successionsDetected);
  if (stats.cautionDays !== 3) fail('unit-caution', 'cautionDays should be 3, got ' + stats.cautionDays);
  if (stats.tripsSuppressed < 3) fail('unit-caution', 'tripsSuppressed should be >= 3 (pantry empty), got ' + stats.tripsSuppressed);
  if (stats.sayLines !== 2) fail('unit-caution', 'sayLines should be 2 (one per succession), got ' + stats.sayLines);
  const line = said.find(function (s) { return /stays by the fire/.test(s); });
  if (!line || !/Bo/.test(line)) fail('unit-caution', 'voiced line should name the successor Bo: ' + JSON.stringify(said));
  pass('unit-caution', { stats: stats });
}

if (kase === 'sim-caution' || kase === 'determinism') (async function () {
  if (kase === 'sim-caution') {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(repo, 'scripts', 'sim-harness'));
    const mod = require(path.join(repo, 'scripts', 'policies', 'competent-successorcaution-b'));
    const ac = require(path.join(repo, 'scripts', 'policies', 'competent-answercourt-b'));
    mod.resetSuccessorcautionStats();
    ac.resetAnswercourtStats();
    const { Game } = await loadGame({ seed: seed, mode: 'successorcaution-test-sim', fullTelemetry: false });
    // Count wrapped-daily calls (property lookup at call time, so the
    // patch intercepts the policy's inner call).
    let innerCalls = 0;
    const origDaily = ac.answercourtPolicy.daily;
    ac.answercourtPolicy.daily = function (G, c) { innerCalls += 1; return origDaily.call(this, G, c); };
    const log = [];
    const recPolicy = Object.assign({}, mod.successorcautionPolicy, {
      daily: function (G, ctx) {
        const before = { day: ((G.state || {}).scholar || {}).day || 0, vid: G.villagerId, px: G.map.px, py: G.map.py, trips: ctx.forageTrips || 0, inner: innerCalls };
        const r = mod.successorcautionPolicy.daily(G, ctx);
        const after = { day: ((G.state || {}).scholar || {}).day || 0, vid: G.villagerId, px: G.map.px, py: G.map.py, trips: ctx.forageTrips || 0, inner: innerCalls };
        log.push({ before: before, after: after });
        return r;
      },
    });
    await setupGame(Game);
    let result = null;
    await quietLog(async function () {
      result = await runDays(Game, recPolicy, { days: 60, manifest: undefined, sampleEvery: 1 });
    });
    ac.answercourtPolicy.daily = origDaily;
    const stats = mod.successorcautionStats();
    if (stats.successionsDetected < 1) fail('sim-caution', 'no succession fired in 60 days on seed ' + seed + ': ' + JSON.stringify(stats));
    if (stats.cautionDays < 2) fail('sim-caution', 'cautionDays < 2: ' + JSON.stringify(stats));
    if (stats.tripsSuppressed < 1) fail('sim-caution', 'no trip was ever suppressed: ' + JSON.stringify(stats));
    // Per-day checks: on caution days the inner daily must not run,
    // forageTrips must not rise, and the scholar must stay at Haven.
    // A caution day is a log row whose before.vid differs from the
    // previous row's after.vid (succession) or that falls inside the
    // window: recompute from the stats events instead — the policy
    // records one 'caution-day' event per caution day.
    const cautionEvents = (stats.events || []).filter(function (e) { return e.kind === 'caution-day'; });
    if (cautionEvents.length !== stats.cautionDays) fail('sim-caution', 'caution-day events ' + cautionEvents.length + ' != cautionDays ' + stats.cautionDays);
    for (const row of log) {
      const ev = cautionEvents.find(function (e) { return e.day === row.before.day; });
      if (ev) {
        if (row.after.inner !== row.before.inner) fail('sim-caution', 'wrapped daily ran on caution day ' + row.before.day);
        if (row.after.trips !== row.before.trips) fail('sim-caution', 'forageTrips rose on caution day ' + row.before.day + ' (' + row.before.trips + ' -> ' + row.after.trips + ')');
        if (row.after.px !== 4 || row.after.py !== 4) fail('sim-caution', 'scholar left Haven on caution day ' + row.before.day + ' -> (' + row.after.px + ',' + row.after.py + ')');
      }
    }
    // The successor's first daily after a succession finds them at Haven.
    const succEvents = (stats.events || []).filter(function (e) { return e.kind === 'succession'; });
    for (const se of succEvents) {
      const row = log.find(function (r) { return r.before.day === se.day; });
      if (!row) fail('sim-caution', 'no daily log row for succession day ' + se.day);
      if (row.before.px !== 4 || row.before.py !== 4) fail('sim-caution', 'successor did not wake at Haven on day ' + se.day + ' (at ' + row.before.px + ',' + row.before.py + ')');
    }
    pass('sim-caution', { stats: stats, logDays: log.length, days: result.days, deaths: (result.samples.deaths || []).length });
  } else {
    process.env.DAYS = '60';
    const driver = require(path.join(repo, 'scripts', 'successorcaution-driver-20261115'));
    const a = await driver.oneRun(seed, 'competent-successorcaution-b');
    const b = await driver.oneRun(seed, 'competent-successorcaution-b');
    const digest = function (r) {
      return JSON.stringify({ deaths: r.deaths, days: r.days, endReason: r.endReason,
        seriesLen: r.series.length,
        sc: (r.capSummary || {}).successorcaution || null });
    };
    if (digest(a) !== digest(b)) fail('determinism', 'two identical runs diverged', { a: digest(a), b: digest(b) });
    pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length,
      successions: ((a.capSummary || {}).successorcaution || {}).successionsDetected });
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
