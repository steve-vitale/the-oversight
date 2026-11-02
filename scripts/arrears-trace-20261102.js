#!/usr/bin/env node
// arrears-trace-20261102.js — sim-arrears-a diagnosis trace (Loop A
// 20261102T0605Z, axis scale-onramp). POLICY-SIDE ONLY, zero src/js.
// DIAG ONLY: no muster verb is ever called by this script — the trace
// is a pure no-call timeline under the frozen quotatrigger/sumtrigger/
// sumconfirm stack, so "does arrears clear unprompted" is measured
// without a sounding perturbing trust (-8 per refusal) or the timeline.
//
// What it records per seed, daily, from the policy daily hook:
//   every link (active AND broken, so breaks/relinks are visible):
//   direction, trust, opinion, arrears, tribute/week, subordinate
//   pantry kcal (the pantryKcal scalar linkTick itself reads), link
//   age days, status, kind.
// It NEVER calls Game.titanCallReadiness or any roster generator
// mid-run: readiness is recomputed from link fields by the exact
// soundTitanCall rule (trust < 25, opinion < -10, arrears > 0), and
// free-adult counts are deliberately NOT taken (they need roster
// generation, which consumes seeded RNG and moves tails — the 0445Z
// lesson). First failure = first muster-diag refusal snapshot day on
// which >= 1 active link carries arrears > 0 (fallback, flagged: the
// first census day with arrears > 0 on an active link, if no such
// snapshot exists).
//
// STDOUT-RUNNER PATTERN: prints ONE JSON line per seed
// (`{"seed": N, "out": {...}}`) to stdout, writes NOTHING itself.
// Usage (same env as the sumconfirm stack):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=180 SEEDS=95447,95464,95478,95512,95448,95453 node scripts/arrears-trace-20261102.js \
//   > evidence/2026-11-02/perseed-arrears-a/trace.stdout 2> evidence/2026-11-02/perseed-arrears-a/trace.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`ARREARS STOP: ${k}=1 is required (frozen stack).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('ARREARS STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('ARREARS STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('ARREARS STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('ARREARS STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!HI.instrumentOn()) { console.error('ARREARS STOP: HERALD instrument off despite HERALD=1.'); process.exit(2); }
if (!MD.layerOn()) { console.error('ARREARS STOP: MUSTER diag off despite MUSTER=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const TRACE_DAYS = 30;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

const SAY_RE = /arrears|tribute|waiv|debts|old books|REFUSES|books burn/i;

function linkRow(Game, link, day) {
  let other = null;
  try { other = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { other = null; }
  let ov = null;
  try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(other) : null; } catch (e) { ov = null; }
  const isPeer = (link.kind === 'covenant' || link.kind === 'trade');
  let direction = null;
  let subId = null;
  if (isPeer) { direction = 'peer:' + link.kind; }
  else if (link.primary === 'haven') { direction = 'Haven-primary'; subId = link.subordinate; }
  else if (link.subordinate === 'haven') { direction = 'Haven-subordinate'; subId = 'haven'; }
  else { direction = 'other'; }
  let subPantry = null;
  try {
    if (subId === 'haven') {
      const v = (Game.state || {}).village || {};
      subPantry = (typeof Game.pantryKcalLive === 'function') ? Game.pantryKcalLive(v) : (v.pantryKcal || 0);
      if (subPantry == null || subPantry === 0) subPantry = v.pantryKcal || 0;
    } else if (subId) {
      const sov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(subId) : null;
      subPantry = (sov && sov.pantryKcal) || 0;
    }
  } catch (e) { subPantry = null; }
  const trust = link.trust || 0;
  const opinion = (ov && ov.opinion) || 0;
  const arrears = link.arrears || 0;
  const reasons = [];
  if (trust < 25) reasons.push('trust<25');
  if (opinion < -10) reasons.push('opinion<-10');
  if (arrears > 0) reasons.push('arrears>0');
  return {
    linkId: link.id || null, pair: (link.primary || '') + '>' + (link.subordinate || '') + (link.kind ? ':' + link.kind : ''),
    villageId: other, name: (ov && ov.name) || null, direction: direction, kind: link.kind || 'tribute',
    trust: trust, opinion: opinion, arrears: arrears, tributeKcalPerWeek: link.tributeKcalPerWeek || 0,
    subordinatePantryKcal: subPantry, subordinateId: subId,
    linkDay: (link.day == null ? null : link.day), linkAgeDays: day - (link.day || 0),
    status: link.status || null, wouldRefuse: reasons.length > 0, refusalReasons: reasons,
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  const census = {}; // day -> [linkRow]
  const sayLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && SAY_RE.test(arg)) {
          if (sayLines.length < 3000) sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, line: String(arg).slice(0, 500) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      const r = policy.daily(Gm, ctx);
      try {
        const day = ((Gm.state || {}).scholar || {}).day || 0;
        let links = [];
        try { links = (typeof Gm.hierarchyState === 'function') ? Gm.hierarchyState() : []; } catch (e) { links = []; }
        census[day] = (links || []).map(function (l) { return linkRow(Gm, l, day); });
      } catch (e) {}
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return r;
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let endScaleRank = null;
  try { endScaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  let maxWave = 1;
  try { maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  let endReason = null;
  try { endReason = result.endReason || null; } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  // Final link histories (capped 40 entries in-engine) + final links.
  let finalLinks = [];
  try {
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    finalLinks = (links || []).map(function (l) {
      return { linkId: l.id || null, pair: (l.primary || '') + '>' + (l.subordinate || '') + (l.kind ? ':' + l.kind : ''),
        status: l.status || null, trust: l.trust || 0, arrears: l.arrears || 0,
        history: ((l.history || []).map(function (h) { return { day: h.day, kind: h.kind, note: h.note }; })) };
    });
  } catch (e) {}

  // First failure: first muster-diag refusal snapshot with arrears > 0.
  const snaps = (mstore.refusals || []).map(function (s) {
    return { day: s.day, callYield: s.callYield, omenStage: s.omenStage,
      links: (s.links || []).map(function (l) { return { villageId: l.villageId, name: l.name, trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota, facesFree: l.facesFree, wouldYield: l.wouldYield, wouldRefuse: l.wouldRefuse }; }) };
  });
  let firstFailure = null, firstFailureSource = null;
  for (let i = 0; i < snaps.length; i++) {
    if ((snaps[i].links || []).some(function (l) { return (l.arrears || 0) > 0; })) { firstFailure = snaps[i]; firstFailureSource = 'muster-diag-snapshot'; break; }
  }
  // Contrast seeds carry no arrears link, so no arrears snapshot exists:
  // their first-failure moment is the first refusal snapshot of any kind
  // (the moment a muster would be judged), flagged by its source.
  if (!firstFailure && snaps.length) { firstFailure = snaps[0]; firstFailureSource = 'muster-diag-first-refusal-no-arrears'; }
  if (!firstFailure) {
    const days = Object.keys(census).map(Number).sort((a, b) => a - b);
    for (const d of days) {
      if ((census[d] || []).some(function (l) { return l.status === 'active' && (l.arrears || 0) > 0; })) {
        firstFailure = { day: d, callYield: null, omenStage: null, links: null };
        firstFailureSource = 'census-fallback';
        break;
      }
    }
  }

  // First-failure full link table (from the daily census on that day).
  let firstFailureLinks = null;
  if (firstFailure) {
    const rows = census[firstFailure.day] || [];
    firstFailureLinks = rows.filter(function (l) { return l.status === 'active'; });
  }

  // 30-day traces for every link carrying arrears at first failure.
  const traces = {};
  if (firstFailure && firstFailureLinks) {
    const blocked = firstFailureLinks.filter(function (l) { return (l.arrears || 0) > 0; });
    const days = Object.keys(census).map(Number).sort((a, b) => a - b);
    blocked.forEach(function (bl) {
      const series = [];
      let prev = null;
      const changes = [];
      let statusChanges = [];
      days.forEach(function (d) {
        if (d < firstFailure.day || d > firstFailure.day + TRACE_DAYS) return;
        const rows = census[d] || [];
        // Same link id first, else same pair (relink keeps the pair).
        let row = rows.find(function (r) { return r.linkId === bl.linkId; }) ||
                  rows.find(function (r) { return r.pair === bl.pair; }) || null;
        if (!row) { series.push({ day: d, missing: true }); return; }
        series.push({ day: d, linkId: row.linkId, status: row.status, trust: row.trust, opinion: row.opinion,
          arrears: row.arrears, tributeKcalPerWeek: row.tributeKcalPerWeek,
          subordinatePantryKcal: row.subordinatePantryKcal, linkAgeDays: row.linkAgeDays, direction: row.direction });
        if (prev && prev.arrears !== row.arrears) changes.push({ day: d, from: prev.arrears, to: row.arrears, delta: row.arrears - prev.arrears, trust: row.trust, status: row.status });
        if (prev && prev.status !== row.status) statusChanges.push({ day: d, from: prev.status, to: row.status });
        if (prev && prev.linkId !== row.linkId) statusChanges.push({ day: d, from: 'relink', to: row.linkId, note: 'link id changed, same pair' });
        prev = row;
      });
      const last = series.filter(function (s) { return !s.missing; }).slice(-1)[0] || null;
      traces[bl.villageId + ':' + (bl.name || '')] = {
        firstFailure: { day: firstFailure.day, arrears: bl.arrears, trust: bl.trust, opinion: bl.opinion, direction: bl.direction, tributeKcalPerWeek: bl.tributeKcalPerWeek, subordinatePantryKcal: bl.subordinatePantryKcal, linkAgeDays: bl.linkAgeDays },
        series: series, changes: changes, statusChanges: statusChanges,
        endState: last, clearedDay: (function () { const c = series.find(function (s) { return !s.missing && s.arrears === 0; }); return c ? c.day : null; })(),
      };
    });
  }

  // Say lines inside each blocked link's trace window (village-name match).
  const traceSay = {};
  if (firstFailure && firstFailureLinks) {
    firstFailureLinks.filter(function (l) { return (l.arrears || 0) > 0; }).forEach(function (bl) {
      const nm = bl.name || '';
      traceSay[bl.villageId] = sayLines.filter(function (s) {
        return s.day >= firstFailure.day && s.day <= firstFailure.day + TRACE_DAYS &&
          (!nm || s.line.indexOf(nm) >= 0 || /arrears|tribute|waiv|debts|old books/i.test(s.line));
      }).slice(0, 120);
    });
  }

  let musterExists = false;
  try { musterExists = !!((st.titans || {}).musters && (st.titans.musters || {}).herald); } catch (e) {}
  const heraldAttempts = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; }).map(function (a) { return { day: a.day, cls: a.cls }; });

  const out = {
    seed: seed, anchorCommit: ANCHOR, days: DAYS,
    firstFailure: firstFailure, firstFailureSource: firstFailureSource,
    firstFailureLinks: firstFailureLinks,
    traces: traces, traceSay: traceSay,
    refusalSnapshots: snaps, refusalSnapshotCount: snaps.length,
    sayLines: sayLines.slice(0, 400),
    finalLinks: finalLinks,
    censusDays: Object.keys(census).length,
    soundTotals: (mstore.callTotals || {}), musterExistsAtEnd: musterExists,
    heraldAttempts: heraldAttempts,
    instrumentErrors: (t.instrumentErrors || []).length, musterErrs: (mstore.errs || 0),
    wall: { national: national, table: table, won: won, maxWave: maxWave, gameDays: gameDays, endScaleRank: endScaleRank, endReason: endReason },
    deaths: deaths,
  };
  console.log(JSON.stringify({ seed: seed, out: out }));
}

(async function () {
  for (const seed of SEEDS) { await oneRun(seed); }
})().catch(function (e) { console.error('ARREARS FATAL: ' + String((e && e.stack) || e)); process.exit(1); });
