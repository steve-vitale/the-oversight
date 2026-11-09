// sitstep-instrument-20261107.js — the sit-step seat-gate recorder
// (arm sim-sitstep-b, run fleshout-loop-b-20261107T0530Z). Scripts only,
// zero src/js. DIAG: replay the frozen staged policy and record, EVERY
// day, the full sit chain as live state — seat, preview, entry block,
// and whether the policy ever attempts the sit.
//
// This module REUSES the stageally instrument verbatim (require, not a
// copy — which itself reuses the killerdeath instrument) and adds:
//   (1) seat-gate fields on every daily snapshot: tableSeat() seat +
//       detail, deedGateReady() full-seat detail, food-deed split
//       (sentimentTaught / feastSurgeUsed), arc, tableWaiting /
//       tableAnnounced / tableDone / holding flags, tablePreview()
//       (seat/doors/ready/why/overtime), tableEntryBlock(),
//       winDayFloorOk(), scale rank, readiness-5 bars (already on the
//       base snapshot), living veterans + ids (distinct living wave-4+
//       killers from waveKillLog), pair-day flag, scholar identity,
//       seat-taker options count + best ascension score, tableChoices
//       surfaced.
//   (2) counting wraps on Game.tableTakeSeat / tableOfferSeatTaker /
//       tableChooseSeatTaker / chooseTableOption: every call recorded
//       with day + result. The wraps return the original result
//       untouched and never throw into game code.
//   (3) classifyGate(row): the pure per-day classifier — the FIRST
//       failing link in the sit chain (seat → preview → entry →
//       action → sit), with the missing bars named. Exported so the
//       proof and the analyzer use the same rule.
//
// Pure reads + counting wraps only; zero game-state writes, zero RNG
// draws. A recording failure is counted in instrumentErrors and the
// original call's result is returned untouched.
// Usage: const INST = require('./sitstep-instrument-20261107');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const STAGE = require('./stageally-instrument-20261106');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// classifyGate(row): first failing link in the sit chain. Row fields:
//   tableDone, seat ('full'|'lesser'|'none'), seatDetail {w1..w5,
//   contestsN, crisesN, rank, stage, foodDeeds}, sentimentTaught,
//   feastSurgeUsed, tableWaiting, winDayFloorOk, preview (null or
//   {ready, why}). Returns { gate, missing[] } with gate in:
//   'sat' | 'no-seat' | 'no-preview' | 'entry-blocked' |
//   'offer-not-taken'.
function classifyGate(row) {
  row = row || {};
  if (row.tableDone) return { gate: 'sat', missing: [] };
  if (!row.seat || row.seat === 'none') {
    const d = row.seatDetail || {};
    const missing = [];
    if (((d.w1 | 0)) < 4) missing.push('wave-1 faced ' + (d.w1 | 0) + '/4');
    if (((d.w2 | 0)) < 4) missing.push('wave-2 faced ' + (d.w2 | 0) + '/4');
    if (((d.w3 | 0)) < 3) missing.push('wave-3 faced ' + (d.w3 | 0) + '/3');
    if (((d.contestsN | 0)) < 2) missing.push('contests survived ' + (d.contestsN | 0) + '/2');
    if (((d.crisesN | 0)) < 2) missing.push('crises weathered ' + (d.crisesN | 0) + '/2');
    const rk = d.rank || 'village';
    if (rk !== 'regional' && rk !== 'national' && rk !== 'global') missing.push('scale ' + rk + ' (needs regional+)');
    if (((d.stage | 0)) < 2) missing.push('integration stage ' + (d.stage | 0) + '/2');
    if (!d.foodDeeds) {
      if (row.sentimentTaught === false) missing.push('food deed: sentiment not taught');
      else if (row.feastSurgeUsed === false) missing.push('food deed: feast surge never spent');
      else missing.push('food-thesis deeds unfinished');
    }
    return { gate: 'no-seat', missing: missing };
  }
  if (!row.preview) {
    const missing = [];
    if (!row.tableWaiting) missing.push('tableWaiting false (Arc IV never fired)');
    if (!row.winDayFloorOk) missing.push('day ' + (row.day | 0) + ' < 90');
    if (!missing.length) missing.push('preview null for unknown reason');
    return { gate: 'no-preview', missing: missing };
  }
  if (!row.preview.ready) return { gate: 'entry-blocked', missing: [String(row.preview.why || 'unknown block')] };
  return { gate: 'offer-not-taken', missing: ['preview ready; policy never called tableTakeSeat'] };
}

function livingVeteranIds(Game) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const fallen = (((Game.state || {}).village || {}).fallen) || [];
    const deadIds = {};
    fallen.forEach(function (f) { if (f && f.villagerId) deadIds[f.villagerId] = true; });
    ((Game.data || {}).villagers || []).forEach(function (p) { if (p && p.id && p.dead) deadIds[p.id] = true; });
    const seen = {};
    log.forEach(function (e) {
      if (e && e.by && ((e.w | 0)) >= 4 && !deadIds[e.by]) seen[e.by] = true;
    });
    return Object.keys(seen).sort();
  } catch (e) { return null; }
}

function install(Game) {
  const bk = STAGE.install(Game);
  const t = bk.t;
  t.sitAttempts = [];
  t._sitSeq = 0;

  function recordSit(call, result) {
    try {
      t._sitSeq += 1;
      let ok = null;
      try { ok = !!(result && result.ok); } catch (e) { ok = null; }
      t.sitAttempts.push({ seq: t._sitSeq, day: dayOf(Game), call: call, ok: ok });
    } catch (e) { t.instrumentErrors.push('sit-record: ' + String(e.message).slice(0, 80)); }
  }

  // --- (2) counting wraps: record the call, return the original result.
  const wrapNames = ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'];
  const origFns = {};
  wrapNames.forEach(function (name) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push('sitwrap-missing-' + name); return; }
      origFns[name] = orig;
      Game[name] = function () {
        let ret;
        try { ret = orig.apply(this, arguments); }
        catch (e) { throw e; }
        try { recordSit(name, ret); } catch (e2) { t.instrumentErrors.push('sitwrap-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { t.instrumentErrors.push('sitwrap-install-' + name + ': ' + String(e.message).slice(0, 80)); }
  });

  // --- (1) snapshot wrap: seat-gate fields on every daily row.
  const origSnapshot = bk.snapshot;
  bk.snapshot = function () {
    const snap = origSnapshot();
    try {
      let seat = null;
      try { seat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; } catch (e) { seat = null; t.instrumentErrors.push('seat: ' + String(e.message).slice(0, 80)); }
      snap.seat = (seat && seat.seat) || 'none';
      snap.seatDetail = (seat && seat.detail) || null;
      let full = null;
      try { full = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null; } catch (e) { full = null; }
      snap.fullSeat = full;
      try {
        const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
        snap.arc = (pg && pg.arc != null) ? pg.arc : null;
        snap.tableWaiting = !!(pg && pg.tableWaiting);
        snap.tableAnnounced = !!(pg && pg.tableAnnounced);
        snap.tableDone = !!(pg && pg.tableDone);
        snap.tableHoldingTold = !!(pg && pg.tableHoldingTold);
        snap.seatWaitingTold = !!(pg && pg.seatWaitingTold);
        snap.reactorSeatTold = !!(pg && pg.reactorSeatTold);
        snap.sentimentTaught = !!(pg && pg.sentimentTaught);
      } catch (e) { snap.arc = null; }
      try {
        const spr = ((Game.state || {}).scholar || {}).prog || null;
        snap.feastSurgeUsed = !!(spr && spr.feastSurgeUsed);
      } catch (e) { snap.feastSurgeUsed = null; }
      try { snap.scaleRankSnap = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) { snap.scaleRankSnap = null; }
      try { snap.winDayFloorOk = (typeof Game.winDayFloorOk === 'function') ? !!Game.winDayFloorOk() : null; } catch (e) { snap.winDayFloorOk = null; }
      let pv = null;
      try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) { pv = null; t.instrumentErrors.push('preview: ' + String(e.message).slice(0, 80)); }
      snap.preview = pv ? { seat: pv.seat || null, doors: (pv.doors || []).slice(), ready: !!pv.ready, why: pv.why || '', overtime: (pv.overtime | 0), fullReady: !!pv.fullReady } : null;
      try { snap.entryBlock = (typeof Game.tableEntryBlock === 'function') ? String(Game.tableEntryBlock() || '') : null; } catch (e) { snap.entryBlock = null; }
      const lv = livingVeteranIds(Game);
      snap.livingVeterans = lv ? lv.length : null;
      snap.livingVeteranIds = lv;
      snap.pairDay = (lv && lv.length >= 2);
      try {
        const tc = ((Game.state || {}).scholar || {}).tableChoices;
        snap.tableChoicesSurfaced = !!(tc && tc.options && tc.options.length);
      } catch (e) { snap.tableChoicesSurfaced = null; }
      try {
        const opts = (typeof Game.tableSeatTakerOptions === 'function') ? (Game.tableSeatTakerOptions() || []) : [];
        snap.seatTakerOptions = opts.length;
        let best = null;
        opts.forEach(function (o) { if (o && !o.self && o.score != null && (best == null || o.score > best)) best = o.score; });
        snap.bestSeatTakerScore = best;
      } catch (e) { snap.seatTakerOptions = null; snap.bestSeatTakerScore = null; }
      try { snap.gate = classifyGate(snap).gate; } catch (e) { snap.gate = null; }
    } catch (e) { t.instrumentErrors.push('snapshot-seatgate: ' + String(e.message).slice(0, 80)); }
    return snap;
  };

  const origFinalize = bk.finalize;
  bk.finalize = function () {
    const out = origFinalize();
    try {
      const seat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
      // SEAT-TAKEN ALIGNMENT (sim-sitmetric-b, 2026-11-08): finalSeat
      // used to carry the PRICED seat whether or not it was taken —
      // seed 53004 priced "lesser" with takeseatStats.seatTaken 0, and
      // every analyzer counting `finalSeat !== 'none'` as a sit re-read
      // it as taken. The reported finalSeat is now the seat TAKEN: the
      // priced seat only when a sit actually happened in this run
      // (tableDone ever set on a daily snapshot, a successful recorded
      // tableTakeSeat call, or tableDone at finalize — the three
      // instrument-owned signals, so no policy-module dependency and
      // no src/js change). Otherwise 'none'. The priced seat stays
      // visible as finalSeatPriced and the verdict as seatTaken, so
      // the priced-vs-taken divergence stays auditable, not hidden.
      // finalFullShortfall still prices the PRICED seat: it describes
      // the bar, not the sitting.
      out.finalSeatPriced = seat;
      let taken = false;
      try {
        const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
        if (pg && pg.tableDone) taken = true;
      } catch (e) {}
      if (!taken) {
        try { if ((t.daily || []).some(function (d) { return d && d.tableDone; })) taken = true; } catch (e) {}
      }
      if (!taken) {
        try { if ((t.sitAttempts || []).some(function (a) { return a && a.ok; })) taken = true; } catch (e) {}
      }
      out.seatTaken = taken;
      out.finalSeat = taken ? seat : { seat: 'none', detail: (seat && seat.detail) || null };
      try { out.finalFullShortfall = (typeof Game.fullSeatShortfall === 'function') ? Game.fullSeatShortfall(seat) : null; } catch (e) { out.finalFullShortfall = null; }
    } catch (e) { out.finalSeat = null; }
    try { out.sitAttempts = t.sitAttempts.slice(); } catch (e) { out.sitAttempts = null; }
    return out;
  };

  const origUninstall = bk.uninstall;
  bk.uninstall = function () {
    try {
      wrapNames.forEach(function (name) { if (origFns[name]) Game[name] = origFns[name]; });
    } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return bk;
}

module.exports = { install: install, classifyGate: classifyGate, livingVeteranIds: livingVeteranIds };
