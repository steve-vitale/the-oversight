#!/usr/bin/env node
// scripts/scalerank-driver-a.js — sim-scalerank-a scale-rank inputs driver
// (Loop A run fleshout-20261128T0315Z, axis scale-onramp).
// DIAGNOSTIC ONLY — zero src/js changes. It HARVESTS what scaleRank()
// needs for national; it does not pull any lever.
//
// Substrate: competent verbatim, 150d DEATH-AWARE horizon, seeds
// 113301-113308 (fresh — see the prereg §4 for why 113201-113208 was
// rejected). NO substrate flags — the plain road, so the mechanism is
// measured on the same road the census walked.
// Corpus under evidence/2026-11-28/perseed-scalerank-a-arm/.
//
// What is harvested per seed (read-only wraps, no RNG, no inputs):
//   - A DAILY snapshot of the scale-rank input block: day, rank,
//     rank flags (networkLive, networkLiveDay, nationalLive,
//     nationalFirstDay, nationalShape, globalLive), the pending
//     national beat (shape/day/villages/led/primary, days pending),
//     scaleRefused, _natDefer shapes, exiled, the rung gate
//     (day - networkLiveDay), per-shape polity candidates (LEAD
//     seasoned subs vs 3, BELONG good-standing + realm size vs 4,
//     COVENANT seasoned peer links vs 3, TRADE seasoned peer links
//     vs 3, _havenPolity() winner or null), the FULL link list
//     (kind, other village, day formed, age, trust, status,
//     seasoned?, conquered, arrears), and the standing breakdown
//     (villageStanding(): total/war/diplomacy/plenty/warPts/links/
//     feasts) plus the gated villageStandingTotal() — PLUS the
//     census-compatible fields (arc, tableWaiting/Done/Announced,
//     stage, pop, pantry, deed-gate breakdown, priced seat, ladder
//     peak, capstone, overtime) so the wall numbers still compute.
//   - Deaths, via the proven deathcensus instrument
//     (scripts/deathcensus-instrument-20261110.js): the memorial
//     roll + telemetry death hook, drained daily, final drain after
//     runDays, roster books (joins / leavers / booksClose).
//   - EVERY fireside line (unfiltered) and EVERY system table line
//     (/table|pale light/i, non-fireside) and every system scale line
//     (/court|council|charter|binding|national|realm/i, non-fireside).
// Row fields for the wall: days, gameDays, endReason, won,
// maxRank, finalRank, table (everWaiting), entered (everDone),
// arcMax, finalSeat, mechanism stage, death-cause shares.
//
// Modes:
//   --one <seed> : run one seed, write its row.
//   --summary   : build summary.json from rows on disk, print the
//                 band table. Exit 1 only if the corpus is
//                 incomplete or any row errored.
// Env: SEEDS (csv), DAYS (default 150), OUTDIR (default the
// evidence corpus dir — overridable for the determinism proof).
// Exit 1 in --one mode if the run throws.
// Per-seed JSONs carry no wall-clock fields, so a rerun of one
// seed must be byte-identical (the summary's `generated` stamp
// lives in summary.json only, never in a per-seed row). No
// process-position-dependent sequence is used anywhere.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-scalerank-a-arm');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const DC = require('./deathcensus-instrument-20261110');

const SEEDS = (process.env.SEEDS || '113301,113302,113303,113304,113305,113306,113307,113308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const FIRE_RX = /^🗣️ (.+?) to (.+?), by the fire: (.*)$/s;
const TABLE_RX = /table|pale light/i;
const SCALE_RX = /court|council|charter|binding|national|realm/i;

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}

function pantryOf(Game) {
  try {
    if (typeof Game.pantryKcalLive === 'function' && Game.state && Game.state.village) {
      const v = Game.pantryKcalLive(Game.state.village);
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcalLive' };
    }
  } catch (e) {}
  try {
    if (typeof Game.pantryKcal === 'function') {
      const v = Game.pantryKcal();
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcal' };
    }
  } catch (e) {}
  try {
    const v = Game.state && Game.state.village && Game.state.village.pantryKcal;
    if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'state.village.pantryKcal' };
  } catch (e) {}
  return { kcal: null, src: 'none' };
}

function gateOf(Game) {
  try {
    if (typeof Game.deedGateReady !== 'function') return { error: 'no-deedGateReady' };
    const d = Game.deedGateReady();
    if (!d || typeof d !== 'object') return { error: 'deedGateReady-null' };
    return {
      ok: !!d.ok, waves: !!d.waves, contests: !!d.contests, crises: !!d.crises,
      scale: !!d.scale, stageOk: !!d.stageOk, foodDeeds: !!d.foodDeeds,
      stage: (d.stage | 0) || 0, w1: (d.w1 | 0) || 0, w2: (d.w2 | 0) || 0,
      w3: (d.w3 | 0) || 0, w4: (d.w4 | 0) || 0, w5: (d.w5 | 0) || 0,
      contestsN: (d.contestsN | 0) || 0, crisesN: (d.crisesN | 0) || 0,
      rank: d.rank || null,
    };
  } catch (e) { return { error: 'deedGateReady-threw:' + String((e && e.message) || e).slice(0, 80) }; }
}

function seatOf(Game) {
  try {
    const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    const seat = (s && s.seat) || 'none';
    const det = (s && s.detail) || {};
    return {
      seat,
      ladderPeak: (typeof det.ladderPeakStage === 'number') ? det.ladderPeakStage : null,
      capstone: det.ladderCapstone || null,
      w1: (typeof det.w1 === 'number') ? det.w1 : null,
      w2: (typeof det.w2 === 'number') ? det.w2 : null,
      w3: (typeof det.w3 === 'number') ? det.w3 : null,
    };
  } catch (e) { return { seat: 'error', ladderPeak: null, capstone: null, w1: null, w2: null, w3: null }; }
}

function ladderPeakOf(Game) {
  try { return (typeof Game.ladderPeakStage === 'function') ? (Game.ladderPeakStage() | 0) : null; } catch (e) { return null; }
}

function overtimeOf(Game) {
  try { return (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : null; } catch (e) { return null; }
}

// linkOther: the far end of a link from Haven's side, whatever its kind.
// Mirrors hierarchy.js _linkOther (primary/subordinate/a/b) — read-only.
function linkOther(l) {
  if (!l) return null;
  if (l.primary === 'haven') return l.subordinate || null;
  if (l.subordinate === 'haven') return l.primary || null;
  if (l.a === 'haven') return l.b || null;
  if (l.b === 'haven') return l.a || null;
  return null;
}

// seasonedOf: the _linkSeasoned bar (30+ days, trust 40+; conquered:
// the season, not the trust), recomputed from the link's own fields
// so the snapshot is self-contained. The Game's own _linkSeasoned is
// read alongside it where available; disagreement is an error, never
// silently resolved.
function seasonedOf(link, day) {
  if (!link || link.status !== 'active') return false;
  const age = day - (link.day || 0);
  if (age < 30) return false;
  if (link.conquered) return true;
  return (link.trust || 0) >= 40;
}

function scaleOf(Game, day) {
  // The scale-rank input block. Every field is a read; every failure
  // is recorded as null/error, never filled. The link list is the
  // ground truth the analyzer recomputes from.
  const out = {
    rank: 'village', networkLive: null, networkLiveDay: null,
    nationalLive: null, nationalFirstDay: null, nationalShape: null,
    globalLive: null, pendingNational: null, pendingDays: 0,
    scaleRefused: null, natDefer: null, exiled: null, rungGateDays: null,
    havenPolity: null, lead: null, belong: null, covenant: null, trade: null,
    foreign: null, links: [], linkErrors: [],
    standing: null, standingError: null, gatedStanding: null,
  };
  const st = (Game.state || {});
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { out.linkErrors.push('scaleRank:' + String((e && e.message) || e).slice(0, 60)); }
  try { out.networkLive = !!st.networkLive; } catch (e) {}
  try { out.networkLiveDay = (typeof st.networkLiveDay === 'number') ? st.networkLiveDay : null; } catch (e) {}
  try { out.nationalLive = !!st.nationalLive; } catch (e) {}
  try { out.nationalFirstDay = (typeof st.nationalFirstDay === 'number') ? st.nationalFirstDay : null; } catch (e) {}
  try { out.nationalShape = st.nationalShape || null; } catch (e) {}
  try { out.globalLive = !!st.globalLive; } catch (e) {}
  try {
    const pn = st.pendingNational || null;
    out.pendingNational = pn ? {
      shape: pn.shape || null, day: (pn.day | 0) || 0,
      villages: Array.isArray(pn.villages) ? pn.villages.slice() : [],
      led: !!pn.led, primary: pn.primary || null,
    } : null;
  } catch (e) { out.linkErrors.push('pendingNational:' + String((e && e.message) || e).slice(0, 60)); }
  try { out.scaleRefused = !!st.scaleRefused; } catch (e) {}
  try {
    const def = st._natDefer || null;
    out.natDefer = def ? Object.keys(def).sort() : [];
  } catch (e) {}
  try { out.exiled = !!((st.scholar || {}).exiled); } catch (e) {}
  if (out.networkLive && typeof out.networkLiveDay === 'number') {
    out.rungGateDays = Math.max(0, 30 - (day - out.networkLiveDay));
  } else out.rungGateDays = null;
  // Foreign polities roll (for the BELONG realm-size recompute — the
  // analyzer reads this, never live state).
  try {
    const fps = Array.isArray(st.foreignPolities) ? st.foreignPolities : [];
    out.foreign = fps.map(f => ({ primary: (f && f.primary) || null, subs: Array.isArray(f && f.subs) ? f.subs.slice() : [] }));
  } catch (e) { out.foreign = null; }
  // Links + per-shape counts. _havenPolity() is the authoritative
  // winner read; the per-shape counts are recomputed from the link
  // rows by the analyzer (stored-vs-recomputed reconciliation).
  let links = [];
  try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { out.linkErrors.push('hierarchyState:' + String((e && e.message) || e).slice(0, 60)); }
  try {
    const hp = (typeof Game._havenPolity === 'function') ? Game._havenPolity() : null;
    out.havenPolity = hp ? { shape: hp.shape || null, primary: hp.primary || null, villages: Array.isArray(hp.villages) ? hp.villages.slice() : [], size: hp.size || 0, led: !!hp.led } : null;
  } catch (e) { out.linkErrors.push('_havenPolity:' + String((e && e.message) || e).slice(0, 60)); }
  const rows = [];
  for (const l of links) {
    try {
      const age = day - (l.day || 0);
      const seasoned = seasonedOf(l, day);
      let gameSeasoned = null;
      try { gameSeasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered, true) : null; } catch (e) { gameSeasoned = null; }
      if (gameSeasoned !== null && gameSeasoned !== seasoned) {
        out.linkErrors.push(`seasoned-disagree:${l.id || linkOther(l)}:mine=${seasoned}:game=${gameSeasoned}`);
      }
      rows.push({
        id: l.id || null, kind: l.kind || null, other: linkOther(l),
        primary: l.primary || null, subordinate: l.subordinate || null,
        a: l.a || null, b: l.b || null,
        day: (l.day | 0) || 0, age: age, trust: (l.trust | 0) || 0,
        status: l.status || null, seasoned, conquered: !!l.conquered,
        arrears: (l.arrears | 0) || 0,
      });
    } catch (e) { out.linkErrors.push('link-row:' + String((e && e.message) || e).slice(0, 60)); }
  }
  out.links = rows;
  // Per-shape counts, computed from the rows (the analyzer recomputes
  // these independently from the same rows — reconciliation).
  const active = rows.filter(r => r.status === 'active');
  const leadSeasoned = active.filter(r => r.primary === 'haven' && r.seasoned);
  out.lead = { seasonedSubs: leadSeasoned.length, subs: leadSeasoned.map(r => r.other), activeSubs: active.filter(r => r.primary === 'haven').length, need: 3 };
  // BELONG: good standing = trust >= 50, no arrears, link >= 14 days.
  let belongBest = null;
  try {
    const fps = Array.isArray(st.foreignPolities) ? st.foreignPolities : [];
    for (const r of active) {
      if (r.subordinate !== 'haven' || !r.primary) continue;
      const good = r.trust >= 50 && r.arrears === 0 && r.age >= 14;
      let realmSize = 0;
      const fp = fps.find(f => f && f.primary === r.primary);
      realmSize = 2 + (fp && Array.isArray(fp.subs) ? fp.subs.length : 0);
      const cand = { primary: r.primary, good, realmSize, needRealm: 4, trust: r.trust, arrears: r.arrears, age: r.age };
      if (!belongBest || cand.realmSize > belongBest.realmSize) belongBest = cand;
    }
  } catch (e) { out.linkErrors.push('belong:' + String((e && e.message) || e).slice(0, 60)); }
  out.belong = belongBest;
  const covSeasoned = active.filter(r => r.kind === 'covenant' && r.seasoned);
  const trSeasoned = active.filter(r => r.kind === 'trade' && r.seasoned);
  out.covenant = { seasoned: covSeasoned.length, others: covSeasoned.map(r => r.other), active: active.filter(r => r.kind === 'covenant').length, need: 3 };
  out.trade = { seasoned: trSeasoned.length, others: trSeasoned.map(r => r.other), active: active.filter(r => r.kind === 'trade').length, need: 3 };
  // Standing breakdown + gated total.
  try {
    if (typeof Game.villageStanding === 'function') {
      const s = Game.villageStanding();
      out.standing = s ? {
        total: (s.total | 0) || 0, war: (s.war | 0) || 0, diplomacy: (s.diplomacy | 0) || 0,
        plenty: (s.plenty | 0) || 0, warPts: (s.warPts | 0) || 0,
        links: (s.links | 0) || 0, feasts: (s.feasts | 0) || 0,
      } : null;
    }
  } catch (e) { out.standingError = 'villageStanding:' + String((e && e.message) || e).slice(0, 80); }
  try {
    if (typeof Game.villageStandingTotal === 'function') out.gatedStanding = (Game.villageStandingTotal() | 0) || 0;
  } catch (e) { if (!out.standingError) out.standingError = 'villageStandingTotal:' + String((e && e.message) || e).slice(0, 80); }
  return out;
}

function snap(Game, waitingSoFar, pendingSeenDay) {
  const out = { day: 0, rank: 'village', arc: 1, tableWaiting: false, tableDone: false, tableAnnounced: false, stage: null, pop: null, pantry: null, pantrySrc: 'none', waitingDays: waitingSoFar, gate: null, gateError: null, seat: 'none', ladderPeak: null, capstone: null, overtime: null, scale: null, scaleError: null };
  try { out.day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableDone = !!pg.tableDone; out.tableAnnounced = !!pg.tableAnnounced;
  } catch (e) {}
  try { out.stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  try {
    const r = Game.state && Game.state.village && Game.state.village.roster;
    out.pop = Array.isArray(r) ? r.length : null;
  } catch (e) {}
  const p = pantryOf(Game);
  out.pantry = p.kcal; out.pantrySrc = p.src;
  const g = gateOf(Game);
  if (g.error) { out.gate = null; out.gateError = g.error; } else out.gate = g;
  const s = seatOf(Game);
  out.seat = s.seat; out.capstone = s.capstone;
  out.ladderPeak = ladderPeakOf(Game);
  if (out.ladderPeak == null && typeof s.ladderPeak === 'number') out.ladderPeak = s.ladderPeak;
  out.overtime = overtimeOf(Game);
  try {
    const sc = scaleOf(Game, out.day);
    if (sc.pendingNational) sc.pendingDays = (pendingSeenDay != null) ? (out.day - pendingSeenDay + 1) : 1;
    out.scale = sc;
    if (sc.rank) out.rank = sc.rank;
  } catch (e) { out.scale = null; out.scaleError = 'scaleOf-threw:' + String((e && e.message) || e).slice(0, 80); }
  return out;
}

function makeSnapshotPolicy(dc) {
  // The daily snapshot wrap — exported so the proof test installs the
  // exact wrap code runOne runs. Returns { policy, days, errors }.
  const days = [];
  let waitingSoFar = 0;
  let pendingSeenDay = null;
  const errors = [];
  const policy = Object.assign({}, competent, {
    daily(G, ctx) {
      try {
        const s = snap(G, waitingSoFar, pendingSeenDay);
        if (s.tableWaiting) waitingSoFar++;
        s.waitingDays = waitingSoFar;
        if (s.scale && s.scale.pendingNational) {
          if (pendingSeenDay == null) pendingSeenDay = s.day;
          s.scale.pendingDays = s.day - pendingSeenDay + 1;
        } else pendingSeenDay = null;
        days.push(s);
      } catch (e) { errors.push('snap: ' + String((e && e.message) || e).slice(0, 80)); }
      try { if (dc) dc.snapshot(ctx); } catch (e) { errors.push('deathcensus: ' + String((e && e.message) || e).slice(0, 80)); }
      return competent.daily(G, ctx);
    },
  });
  return { policy, days, errors, waiting: () => waitingSoFar };
}

async function runOne(seed) {
  const { Game } = await loadGame({ seed, mode: 'scalerank-a', fullTelemetry: false });
  await setupGame(Game);
  const dc = DC.install(Game);
  const capture = [];
  const gdayOf = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  const snapWrap = makeSnapshotPolicy(dc);
  const days = snapWrap.days;
  const errors = snapWrap.errors;
  const result = await runDays(Game, snapWrap.policy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  // Closing snapshot: the latest read, appended to the series so the
  // end-of-run mechanism table IS the last snapshot (the daily wrap
  // reads at the top of each day; state can still move during the
  // final day's settlement — same object, one read).
  const end = snap(Game, snapWrap.waiting(), null);
  if (end.tableWaiting) end.waitingDays = snapWrap.waiting() + 1;
  days.push(end);
  // Final death drain: deaths in the last endDay land here (after the
  // last snapshot). Idempotent; no daily row.
  try { dc.drain(); } catch (e) { errors.push('deathcensus-drain: ' + String((e && e.message) || e).slice(0, 80)); }
  let deaths = null;
  try { deaths = dc.finalize(); } catch (e) { errors.push('deathcensus-finalize: ' + String((e && e.message) || e).slice(0, 80)); }

  // Harvest: fireside lines unfiltered; system table lines by regex;
  // system scale lines by regex (court/council/charter/binding/
  // national/realm — the national beat's voice).
  const fireside = [];
  const tableLines = [];
  const scaleLines = [];
  for (const c of capture) {
    const m = FIRE_RX.exec(c.line);
    if (m) { fireside.push({ day: c.day, speaker: m[1], listener: m[2], text: m[3] }); continue; }
    if (TABLE_RX.test(c.line)) tableLines.push({ day: c.day, line: c.line.slice(0, 400) });
    if (SCALE_RX.test(c.line)) scaleLines.push({ day: c.day, line: c.line.slice(0, 400) });
  }
  const firstDayWhere = (pred) => { const d = days.find(pred); return d ? d.day : null; };
  const markerDay = (rx) => { const c = capture.find(x => rx.test(x.line)); return c ? c.day : null; };
  const ranksSeen = [...new Set(days.map(d => d.rank))];
  const seatsSeen = [...new Set(days.map(d => d.seat))];
  const maxRank = days.reduce((m, d) => (RANK_ORDER[d.rank] || 0) > (RANK_ORDER[m] || 0) ? d.rank : m, 'village');
  const firstWaitingDay = firstDayWhere(d => d.tableWaiting);
  const firstEnteredDay = firstDayWhere(d => d.tableDone);
  const gateErrors = days.filter(d => d.gateError).length;
  const scaleErrors = days.filter(d => d.scaleError || (d.scale && d.scale.standingError)).length;
  const linkErrors = days.reduce((n, d) => n + ((d.scale && d.scale.linkErrors) ? d.scale.linkErrors.length : 0), 0);
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxRank, finalRank: end.rank,
    table: days.some(d => d.tableWaiting) || end.tableWaiting,
    entered: days.some(d => d.tableDone) || end.tableDone,
    arcMax: Math.max(1, ...days.map(d => d.arc || 1)),
    ranksSeen, seatsSeen, firstWaitingDay, firstEnteredDay,
    waitingDays: days.filter(d => d.tableWaiting).length,
    gateErrors, scaleErrors, linkErrors, errors,
    markers: {
      announceDay: markerDay(/◈ THE TABLE IS SET/),
      pelletDay: markerDay(/never be hungry again/i),
      nationProdDay: markerDay(/FINALES need a NATION/i),
      arcIVDay: markerDay(/ARC IV/),
      firstRegionalDay: firstDayWhere(d => (RANK_ORDER[d.rank] || 0) >= 1),
      firstNationalDay: firstDayWhere(d => (RANK_ORDER[d.rank] || 0) >= 2),
      firstPolityDay: firstDayWhere(d => d.scale && d.scale.havenPolity),
      firstBeatDay: firstDayWhere(d => d.scale && d.scale.pendingNational),
      firstLesserDay: firstDayWhere(d => d.seat === 'lesser' || d.seat === 'full'),
      firstFullDay: firstDayWhere(d => d.seat === 'full'),
      firstOvertimeDay: firstDayWhere(d => (d.overtime | 0) >= 1),
    },
    end: { rank: end.rank, pop: end.pop, pantry: end.pantry, pantrySrc: end.pantrySrc, stage: end.stage, gate: end.gate, seat: end.seat, ladderPeak: end.ladderPeak, capstone: end.capstone, overtime: end.overtime, scale: end.scale },
    pantrySrcs: [...new Set(days.map(d => d.pantrySrc))],
    snapshots: days,
    deaths,
    fireside, firesideCount: fireside.length,
    tableLines, tableLinesCount: tableLines.length,
    scaleLines, scaleLinesCount: scaleLines.length,
    captureCount: capture.length,
    error: null,
  };
  writeFileRetry(path.join(OUTDIR, `s${seed}.json`), JSON.stringify(row, null, 1) + '\n');
  console.log(JSON.stringify({
    seed, days: row.days, endReason: row.endReason, won: row.won,
    maxRank, finalRank: row.finalRank, table: row.table, entered: row.entered,
    firstWaitingDay, waitingDays: row.waitingDays, finalSeat: end.seat,
    finalGateOk: end.gate ? !!end.gate.ok : null, gateErrors, scaleErrors, linkErrors,
    firstPolityDay: row.markers.firstPolityDay, firstBeatDay: row.markers.firstBeatDay,
    firstNationalDay: row.markers.firstNationalDay,
    deaths: deaths ? deaths.summary.deaths : null,
    firesideCount: row.firesideCount, tableLinesCount: row.tableLinesCount,
    scaleLinesCount: row.scaleLinesCount,
    markers: row.markers, pantrySrcs: row.pantrySrcs,
  }, null, 1));
  return row;
}

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function summary() {
  const rows = [];
  const missing = [];
  for (const seed of SEEDS) {
    const p = path.join(OUTDIR, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const fails = [];
  if (missing.length) fails.push(`missing rows: ${missing.join(',')}`);
  for (const r of rows) if (r.error) fails.push(`seed ${r.seed} errored: ${r.error}`);
  const band = rows.length ? {
    seeds: rows.length, wins: rows.filter(r => r.won).length,
    table: rows.filter(r => r.table).length, entered: rows.filter(r => r.entered).length,
    nationalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 2).length,
    regionalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 1).length,
    seated: rows.filter(r => r.entered).length,
    finalSeats: rows.map(r => (r.end && r.end.seat) || 'none'),
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    totalFireside: rows.reduce((a, r) => a + r.firesideCount, 0),
    totalTableLines: rows.reduce((a, r) => a + r.tableLinesCount, 0),
    totalScaleLines: rows.reduce((a, r) => a + r.scaleLinesCount, 0),
    waitingSeeds: rows.filter(r => r.table).map(r => r.seed),
    gateErrors: rows.reduce((a, r) => a + (r.gateErrors || 0), 0),
    scaleErrors: rows.reduce((a, r) => a + (r.scaleErrors || 0), 0),
    linkErrors: rows.reduce((a, r) => a + (r.linkErrors || 0), 0),
  } : null;
  const sum = { generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, band, rows: rows.map(r => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
    finalRank: r.finalRank, table: r.table, entered: r.entered, arcMax: r.arcMax,
    firstWaitingDay: r.firstWaitingDay, waitingDays: r.waitingDays,
    finalSeat: (r.end && r.end.seat) || 'none', finalGateOk: (r.end && r.end.gate) ? !!r.end.gate.ok : null,
    gateErrors: r.gateErrors || 0, scaleErrors: r.scaleErrors || 0, linkErrors: r.linkErrors || 0,
    firesideCount: r.firesideCount, tableLinesCount: r.tableLinesCount, scaleLinesCount: r.scaleLinesCount,
    markers: r.markers,
  })) };
  writeFileRetry(path.join(OUTDIR, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
  console.log(JSON.stringify(sum, null, 1));
  if (fails.length) { console.error('SCALERANK CORPUS FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log(`SCALERANK CORPUS PASS: ${rows.length}/${SEEDS.length} seeds, no row errors.`);
}

async function main() {
  const mode = process.argv[2];
  if (mode === '--one') {
    const seed = parseInt(process.argv[3], 10);
    if (!Number.isFinite(seed)) { console.error('usage: --one <seed>'); process.exit(1); }
    await runOne(seed);
  } else if (mode === '--summary') {
    summary();
  } else {
    console.error('usage: scalerank-driver-a.js --one <seed> | --summary');
    process.exit(1);
  }
}
if (require.main === module) main().catch(e => { console.error('SCALERANK DRIVER FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { snap, gateOf, seatOf, ladderPeakOf, overtimeOf, scaleOf, seasonedOf, linkOther, makeSnapshotPolicy, runOne, FIRE_RX, TABLE_RX, SCALE_RX };
