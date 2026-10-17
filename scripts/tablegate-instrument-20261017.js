#!/usr/bin/env node
// tablegate-instrument-20261017.js — the sim-tablegate arrival-path
// attribution instrument (flesh-out loop, axis scale-onramp, 2026-10-17).
// DIAGNOSTIC ONLY: read-only attach to the engine (wrappers call through
// and record; none touches RNG, logic, or save state). Shared by the sweep
// (scripts/sweep-tablegate-20261017.js), the analyzer
// (scripts/analyze-tablegate-20261017.js), and the proof test
// (scripts/test-tablegate-20261017.js). No top-level side effects — safe to
// require from any process. No game dependency (pure + wrappers).
//
// THE ARRIVAL PATH (canon docs/TABLE.md; engine src/js/table.js,
// src/js/progression.js, src/js/ledger.js):
//   tableSeat() -> 'lesser'|'full'|'none'   (deed bar, recomputed live)
//   checkArc() -> want=4 on lesser/full      (Arc IV)
//   pg.tableWaiting = true                   (invitation staged)
//   ledger endDay -> tableAnnounce()         (day>=90: "THE TABLE IS SET")
//   player/policy calls Game.tableTakeSeat() (Haven action; base courtship
//     has NO seat-taking verb — only capable.js tableRoad and the
//     seatdrive layer drive it)
//   tableTakeSeat -> tableScene()            (the seat locks; the modal plays)
//
// classifyGate() attributes a national-without-table run to the SINGLE
// first gate in that chain that never fired. A row is UNATTRIBUTED if the
// chain is internally inconsistent (e.g. seated but gate says blocked) —
// the diagnostic PRIMARY demands >=90% attribution, i.e. >=14/16 runs get
// a named single blocking gate.
'use strict';

const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const TABLE_BEAT = /THE TABLE IS SET|table is being set|TABLE — it is not a table|THE AUDIT|THE TABLE RETURNS|YOUR CASE IS NOT COMPLETE|table is withdrawn|Ninety dawns|a lesser seat|seven doors|◈ ARC IV|reached national|national standing|National standing|tablePreview|tableTakeSeat|took your seat|the seat is|Take your seat/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const safe = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };

function seatDetail(Game) {
  // Mirrors tableSeat()'s lesser-bar shape; the engine's own call stays
  // authoritative (t.seat comes from Game.tableSeat()).
  const d = safe(() => Game.deedState(), {});
  const faced = (d && d.wavesFaced) || {};
  let w1 = 0, w2 = 0, w3 = 0;
  for (const mid of Object.keys(faced)) {
    const w = faced[mid] | 0;
    if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
  }
  const pg = safe(() => Game.progState(), {});
  const contestsN = (d && d.contestsSurvived) | 0;
  const crisesN = Object.keys((pg && pg.crises) || {}).length;
  const rank = safe(() => (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village') || 'village', 'village');
  const stage = safe(() => (typeof Game.integrationStage === 'function' ? Game.integrationStage() : 0), 0);
  const s = (Game.state || {}).scholar || {};
  const foodDeeds = !!(pg.sentimentTaught && s.prog && s.prog.feastSurgeUsed);
  return { w1, w2, w3, contestsN, crisesN, rank, stage, foodDeeds };
}

function missingBars(det) {
  const m = [];
  if (det.w1 < 4) m.push('w1<4');
  if (det.w2 < 4) m.push('w2<4');
  if (det.w3 < 3) m.push('w3<3');
  if (det.contestsN < 2) m.push('contests<2');
  if (det.crisesN < 2) m.push('crises<2');
  if (!(det.rank === 'regional' || det.rank === 'national' || det.rank === 'global')) m.push('scale<' + det.rank + '>');
  if (det.stage < 2) m.push('stage<2');
  if (!det.foodDeeds) m.push('foodDeeds');
  return m;
}

function realmState(Game) {
  // Realm-negotiation state: the live hierarchy, subordinate census, links.
  let links = [];
  try { links = Game.hierarchyState() || []; } catch (e) {}
  let active = 0, subs = 0, subNames = [];
  for (const l of links) {
    if (!l) continue;
    if (l.status === 'active') active++;
    if (l.subordinate && l.status === 'active') { subs++; subNames.push(String(l.subordinate)); }
  }
  const rank = safe(() => (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village') || 'village', 'village');
  return { activeLinks: active, subordinates: subs, subNames: subNames.slice(0, 8), rank };
}

// classifyGate(t): the SINGLE first blocking gate in the arrival chain.
// t = the per-run capture built by sample() + takeSeatCalls.
// Returns { gate, sub, note } — gate one of:
//   seat-never-earned | arc-never-iv | invitation-never-fired |
//   never-announced | no-driver | take-seat-failed | sat | unattributed
function classifyGate(t) {
  const unr = (note) => ({ gate: 'unattributed', sub: null, note: note });
  if (!t || typeof t !== 'object') return unr('no capture');
  const callN = Array.isArray(t.takeSeatCalls) ? t.takeSeatCalls.length
    : ((t.takeSeatCallN | 0) || (t.takeSeatCalls | 0));
  const okN = Array.isArray(t.takeSeatCalls) ? t.takeSeatCalls.filter(c => c && c.ok).length
    : (t.takeSeatOkN | 0);
  if (t.seatEver === 'full' || t.seatEver === 'lesser') {
    if (t.arc4Day == null) return { gate: 'arc-never-iv', sub: null, note: 'arcMax=' + (t.arcMax | 0) + ' stage=' + (t.stageEnd | 0) + ' breadth=' + (t.breadthEnd | 0) + ' crises=' + (t.crisesEnd | 0) };
    if (t.waitingDay == null) return { gate: 'invitation-never-fired', sub: null, note: 'seat ' + t.seatEver + ' but tableWaiting never set' };
    if (t.announcedDay == null) return { gate: 'never-announced', sub: null, note: 'waiting d' + t.waitingDay + ', floorOk=' + (t.floorOkDay != null ? 'd' + t.floorOkDay : 'never') + ', systemArrived=' + !!t.systemArrivedEver };
    if (callN === 0) return { gate: 'no-driver', sub: null, note: 'announced d' + t.announcedDay + ', seat verb never invoked (base courtship has no seat-taking verb)' };
    if (!t.seated) return { gate: 'take-seat-failed', sub: null, note: 'calls=' + callN + ' ok=' + okN };
    return { gate: 'sat', sub: null, note: 'seated d' + (t.seatDay != null ? t.seatDay : '?') };
  }
  if (t.seated) return unr('seat==none but seated=true (chain inconsistent)');
  const miss = missingBars(t.bestDetail || seatDetailNoGame());
  return { gate: 'seat-never-earned', sub: miss, note: 'best day: ' + JSON.stringify(t.bestDetail || {}) };
}

function seatDetailNoGame() { return { w1: 0, w2: 0, w3: 0, contestsN: 0, crisesN: 0, rank: 'village', stage: 0, foodDeeds: false }; }

// attachTablegateCapture(Game): read-only attach. Method wrappers call
// through and record. sample() is called once per sim-day by the sweep's
// policy-daily wrapper. Defensive: every engine read is guarded;
// restore() is exact.
function attachTablegateCapture(Game) {
  const t = {
    errors: 0,
    takeSeatCalls: [],   // {day, ok}
    beats: [],
    days: [],            // daily trace (capped: every day, small)
    seatEver: 'none', seatEverDay: null,
    bestDetail: null, bestScore: -1,
    arcMax: 0, arc4Day: null, waitingDay: null, announcedDay: null,
    floorOkDay: null, systemArrivedEver: false,
    seated: false, seatDay: null,
    nationalDay: null, nationalRank: null,
    endDetail: null, realmEnd: null, standingEnd: null,
    breadthEnd: null, stageEnd: null, crisesEnd: null,
  };
  const err = (where) => { t.errors++; if (process.env.VERBOSE_ERR) console.error('tablegate instrument error:', where); };
  const pushBeat = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, BEAT_LEN);
      if (TABLE_BEAT.test(s) && t.beats.length < BEAT_CAP) t.beats.push({ day: gday(Game), text: s });
    } catch (e) { err('beat'); }
  };

  // Raw originals for exact restore; bound copies for call-through.
  const _sayRaw = Game.say, _sysRaw = Game.sysSay, _ttsRaw = Game.tableTakeSeat;
  const _say = Game.say ? Game.say.bind(Game) : null;
  const _sys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  try {
    Game.say = function (msg) { pushBeat(msg); return _say ? _say(msg) : msg; };
    if (_sys) Game.sysSay = function (msg) { pushBeat(msg); return _sys(msg); };
  } catch (e) { err('say-wrap'); }

  // tableTakeSeat: the seat verb. Read-only wrap — records the call and
  // the engine's own return, never alters it.
  const _tts = (typeof Game.tableTakeSeat === 'function') ? Game.tableTakeSeat.bind(Game) : null;
  try {
    if (_tts) {
      Game.tableTakeSeat = function () {
        let r = null;
        try { r = _tts(); } catch (e) { err('tts-call'); }
        try {
          const ok = !!(r && r.ok);
          t.takeSeatCalls.push({ day: gday(Game), ok: ok });
          if (ok && !t.seated) { t.seated = true; t.seatDay = gday(Game); }
        } catch (e) { err('tts-log'); }
        return r;
      };
    }
  } catch (e) { err('tts-wrap'); }

  function sample() {
    // Called once per sim-day AFTER the policy daily (mirrors the census
    // pattern). All reads pure; nothing written.
    const day = gday(Game);
    let row = { day: day };
    try {
      const seat = safe(() => (typeof Game.tableSeat === 'function' ? Game.tableSeat() : null), null);
      row.seat = (seat && seat.seat) || 'none';
      row.detail = seatDetail(Game);
      if (row.seat === 'full' || row.seat === 'lesser') {
        if (t.seatEver === 'none') { t.seatEver = row.seat; t.seatEverDay = day; }
        if (row.seat === 'full') t.seatEver = 'full';
      }
      const miss = missingBars(row.detail);
      const score = 8 - miss.length;
      if (score > t.bestScore) { t.bestScore = score; t.bestDetail = row.detail; t.bestDay = day; }
      const pg = safe(() => Game.progState(), {});
      row.arc = pg.arc | 0; row.waiting = !!pg.tableWaiting; row.done = !!pg.tableDone;
      row.announced = !!pg.tableAnnounced; row.sittingId = pg.tableSittingId | 0;
      if ((pg.arc | 0) > t.arcMax) t.arcMax = pg.arc | 0;
      if ((pg.arc | 0) >= 4 && t.arc4Day == null) t.arc4Day = day;
      if (pg.tableWaiting && t.waitingDay == null) t.waitingDay = day;
      if (pg.tableAnnounced && t.announcedDay == null) t.announcedDay = day;
      if (safe(() => Game.winDayFloorOk(), false) && t.floorOkDay == null) t.floorOkDay = day;
      if (Game.state && Game.state.systemArrived) t.systemArrivedEver = true;
      row.rank = safe(() => (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village') || 'village', 'village');
      if ((row.rank === 'national' || row.rank === 'global') && t.nationalDay == null) { t.nationalDay = day; t.nationalRank = row.rank; }
      row.breadth = safe(() => Game.codexBreadth(), null);
      row.stage = safe(() => (typeof Game.integrationStage === 'function' ? Game.integrationStage() : 0), 0);
      row.standing = safe(() => Game.villageStandingTotal(), null);
      // Realm-negotiation state: live link count (cheap; hierarchyState is a
      // cached read in the engine's daily rhythm).
      const rm = realmState(Game);
      row.activeLinks = rm.activeLinks; row.subs = rm.subordinates;
      if (t.days.length < 200) t.days.push(row);
    } catch (e) { err('sample'); t.errors++; }
    return row;
  }

  function finish() {
    try {
      t.endDetail = seatDetail(Game);
      t.realmEnd = realmState(Game);
      t.standingEnd = safe(() => Game.villageStandingTotal(), null);
      t.breadthEnd = safe(() => Game.codexBreadth(), null);
      t.stageEnd = safe(() => (typeof Game.integrationStage === 'function' ? Game.integrationStage() : 0), 0);
      const pg = safe(() => Game.progState(), {});
      t.crisesEnd = Object.keys((pg && pg.crises) || {}).length;
    } catch (e) { err('finish'); }
    return t;
  }

  function restore() {
    try { Game.say = _sayRaw; } catch (e) {}
    try { Game.sysSay = _sysRaw; } catch (e) {}
    try { Game.tableTakeSeat = _ttsRaw; } catch (e) {}
  }

  return { capture: t, sample: sample, finish: finish, restore: restore,
           classifyGate: classifyGate, missingBars: missingBars, seatDetail: seatDetail };
}

module.exports = { attachTablegateCapture, classifyGate, missingBars, seatDetail, TABLE_BEAT };
