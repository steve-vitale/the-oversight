#!/usr/bin/env node
// scripts/succdeath-20261016.js — SUCCESSOR FAST-DEATH CENSUS
// (loop B sim-succdeath-b, 2026-10-16, food-economy axis; classifies
// sim-findings #390: of 119 successions in the sim-rearmlat-b census, 17
// bearers died or left office within 2 days of taking the mantle — before
// the bowls could re-arm the trust bar.)
//
// READ-ONLY diagnostic instrument — zero src/js changes, zero policy
// behavior changes. For each succession: record mantle day + bearer; if
// the bearer dies or exits within <=2 days, attribute the cause and record
// the ledger state at death (cumulative net, voluntary net trailing-7d,
// mealShare, whether the bar re-armed before death).
//
// MECHANICS (read from src/js as-is, cited; no food-distribution canon doc
// exists — stated per the canon rule):
//   - ledger.js:835-844 (mantleBecome): succession zeroes v.takes/v.gives
//     and empties takeHist/giveHist — a fresh book per bearer.
//   - ledger.js:622 playerDeath(cause) -> registerDeath({..., player:true})
//     (ledger.js:701): the death tele carries player:true + the cause.
//     Observed player causes: 'the arena', 'combat', 'the hunt',
//     'injuries', 'the expedition', 'the trembles', 'lockjaw',
//     'your own pit trap', phoenix-link variants, and the honest causes
//     from resolveDay (starvation, dehydration, wounds, sickness).
//   - Exile does NOT pass the mantle (justice.js:186: stage 3 is "exiled
//     but still here" — the exiled player remains the bearer). Office
//     exits are death-driven; the vid-change fallback is kept for honesty
//     and should never fire.
//   - game.js:14575-14579 (takeFromPantry): the trust-drop bar is
//     net = v.gives - v.takes < -5000 (lifetime cumulative gross); the
//     communal bowl (villageMeal, game.js:26632) writes v.takes WITHOUT a
//     takeHist entry — mealTakes = cumTakes - datedVolTakes names the
//     undated component exactly.
//
// METHOD: hooks playerDeath (call-through) records each successor's
// mantleDay at the reset moment (mirror of ledger.js:835-844); a
// registerDeath hook (call-through) records every death with day, cause,
// and the player flag. Per-dawn ledger rows (cumulative book + dated-
// voluntary reconstruction) give the ledger state at death. Day stamps
// are the engine's scholar.day throughout (method finding: runDays' day
// counter can drift ~2d behind).
//
// ATTRIBUTION (pre-registered, §14-binding): a fast succession is a bearer
// whose exitDay - mantleDay <= 2. It counts ATTRIBUTED when (1) the exit
// record has a day, (2) the cause maps to one of the 8 classes (a death
// with a raw cause string always maps — unmapped strings are 'other';
// office-exits without death map to 'exile' only when the fiction says
// exile, else 'other'), and (3) ledger state is present: a dawn row for
// the bearer inside [mantleDay, exitDay], or the analytic fresh book
// (mantleBecome zeroes the book — a bearer who dies before the next dawn
// still has an empty book by construction; recorded as
// stateSource 'fresh-book').
// PRIMARY GO: >= 95% of fast successions attributed.
// Reported (not scored): median days-in-mantle; fast-death cause shares
// (combat vs hunger vs other + the full 8-class table); share of fast
// deaths whose bar re-armed before death.
//
// GATE: SUCCDEATH=1 (default off). Gate off -> install returns a stub that
// wraps NOTHING (byte-identical by construction). All wraps are pure
// call-through; trajectory-neutrality is proven by the det-gate in
// scripts/test-succdeath-20261016.js PART B.
//
// Driver contract: after loadGame+setupGame, call installSuccDeath(Game),
// then call track.dawn(Game) at the START of the policy.daily wrapper (pure
// reads; builds rows for completed nights). After runDays, call
// track.dawn(Game) once more (the day loop's final sleep has no subsequent
// daily), then track.finalize(), then track.uninstall().
'use strict';

function gateOn() { return process.env.SUCCDEATH === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarVid(Game) {
  try {
    const s = Game.state.scholar || {};
    return s.villagerId || Game.villagerId || null;
  } catch (e) { return null; }
}
function isBadNum(x) { return typeof x !== 'number' || !isFinite(x); }

// tr7Sums/sumEvents are pure helpers proven in the ledgerdiag lib
// (scripts/test-ledgerdiag-20261016.js PART A + SMOKE); requiring that
// module is side-effect-free (pure function defs only).
const { tr7Sums, sumEvents } = require('./ledgerdiag-lib-20261016');

// CAUSE_CLASSES — pre-registered cause attribution. Order is the match
// order: 'villager-combat' must precede 'combat' (it contains the word).
// Observed player-death causes in src/js: 'the arena', 'combat', 'the hunt',
// 'injuries', 'the expedition', 'the trembles', 'lockjaw',
// 'your own pit trap', phoenix-link variants, and resolveDay's honest
// causes (starvation, dehydration, wounds, sickness). Field-fight causes
// that can reach the bearer through split-fights/raids: 'raid',
// 'raid-defense', 'patrol combat', 'ambush', 'split-fight', 'villager
// combat', 'alien', 'alien_beam', 'aid-runner', 'a wound that wouldn...'.
const CAUSE_CLASSES = [
  ['villager-combat', /villager[\s-]?combat/i],
  ['combat', /combat|the arena|the hunt|raid|patrol|ambush|expedition|split-fight|pit trap/i],
  ['monster', /alien/i],
  ['starvation', /starvat|dehydrat|thirst/i],
  ['wound', /wound|injur|bleed/i],
  ['disease', /trembles|lockjaw|sick/i],
];
function classifyCause(raw) {
  const s = String(raw == null ? '' : raw);
  if (!s.trim()) return null;
  for (const [cls, re] of CAUSE_CLASSES) {
    if (re.test(s)) return cls;
  }
  return 'other';
}

// attribFast — pure. Pre-registered attribution rule for one fast
// succession. Input fields are plain numbers/strings/null.
function attribFast(ev) {
  const out = { attributed: false, notes: [] };
  if (!ev || typeof ev !== 'object') { out.notes.push('no-event'); return out; }
  if (typeof ev.exitDay !== 'number' || !isFinite(ev.exitDay)) { out.notes.push('no-exit-day'); return out; }
  if (ev.causeClass == null) { out.notes.push('cause-unmapped'); return out; }
  if (ev.state == null) { out.notes.push('no-ledger-state'); return out; }
  out.attributed = true;
  return out;
}

function installSuccDeath(Game) {
  const track = {
    on: gateOn(), errors: [],
    volEvents: [], giveEvents: [],           // full dated-voluntary logs (unpruned)
    deaths: [],                              // registerDeath records {vid, day, cause, player, kind, name}
    rows: [], rowed: {},                     // per-dawn rows (day -> row)
    mantleDay: {},                           // vid -> day they took the mantle
    initialVid: null, prevVid: null,
    successions: 0,
  };
  function err(where, e) {
    track.errors.push(where + ': ' + (e && e.message ? e.message : String(e)));
  }

  // Gate off: install NOTHING. Byte-identical by construction.
  if (!track.on) {
    track.dawn = function () {};
    track.finalize = function () { return { on: false, errors: track.errors }; };
    track.uninstall = function () {};
    return track;
  }

  try { track.initialVid = scholarVid(Game) != null ? String(scholarVid(Game)) : null; } catch (e) {}
  try { if (track.initialVid != null) track.mantleDay[track.initialVid] = gday(Game); } catch (e) {}

  // ---- dated-voluntary event log (call-through; ledgerdiag pattern) ----
  try {
    if (typeof Game.recordTakeHist === 'function') {
      track.oRecordTake = Game.recordTakeHist;
      const orig = track.oRecordTake;
      Game.recordTakeHist = function (vid, kcal, day) {
        let r;
        try { r = orig.apply(this, arguments); } catch (e) { err('recordTake', e); throw e; }
        try {
          track.volEvents.push({ vid: String(vid), day: (day == null ? gday(this) : day) | 0, kcal: +kcal });
        } catch (e) { err('recordTake-log', e); }
        return r;
      };
    }
  } catch (e) { err('recordTake-install', e); }
  try {
    if (typeof Game.recordGiveHist === 'function') {
      track.oRecordGive = Game.recordGiveHist;
      const orig = track.oRecordGive;
      Game.recordGiveHist = function (vid, kcal, day) {
        let r;
        try { r = orig.apply(this, arguments); } catch (e) { err('recordGive', e); throw e; }
        try {
          track.giveEvents.push({ vid: String(vid), day: (day == null ? gday(this) : day) | 0, kcal: +kcal });
        } catch (e) { err('recordGive-log', e); }
        return r;
      };
    }
  } catch (e) { err('recordGive-install', e); }

  // ---- death capture (call-through). Inside playerDeath this fires while
  // the OLD bearer is still the scholar: vid/day/cause belong to the
  // dying bearer, not the successor. ----
  try {
    if (typeof Game.registerDeath === 'function') {
      track.oRegisterDeath = Game.registerDeath;
      const orig = track.oRegisterDeath;
      Game.registerDeath = function (opts) {
        let r;
        try { r = orig.apply(this, arguments); } catch (e) { err('registerDeath', e); throw e; }
        try {
          const o = opts || {};
          track.deaths.push({
            vid: o.villagerId != null ? String(o.villagerId) : null,
            day: gday(this) | 0,
            cause: o.cause != null ? String(o.cause) : null,
            player: !!o.player,
            kind: o.kind != null ? String(o.kind) : null,
            name: o.name != null ? String(o.name) : null,
          });
        } catch (e) { err('registerDeath-log', e); }
        return r;
      };
    }
  } catch (e) { err('registerDeath-install', e); }

  // ---- succession mirror (ledger.js:835-844) + mantleDay ----
  try {
    if (typeof Game.playerDeath === 'function') {
      track.oPlayerDeath = Game.playerDeath;
      const orig = track.oPlayerDeath;
      Game.playerDeath = function () {
        let oldId = null;
        try { oldId = scholarVid(this); } catch (e) {}
        let r;
        try { r = orig.apply(this, arguments); }
        catch (e) { err('playerDeath', e); throw e; }
        try {
          const newId = scholarVid(this);
          if (newId != null && oldId != null && String(newId) !== String(oldId)) {
            const nid = String(newId);
            // Mirror the book-reset: NPC-era events for the new vid are
            // pre-reset (wiped by mantleBecome) — filter them here, not at
            // dawn (same-day post-reset takes must survive).
            track.volEvents = track.volEvents.filter(e => e.vid !== nid);
            track.giveEvents = track.giveEvents.filter(e => e.vid !== nid);
            if (track.mantleDay[nid] === undefined) track.mantleDay[nid] = gday(this);
          }
        } catch (e) { err('playerDeath-mirror', e); }
        return r;
      };
    }
  } catch (e) { err('playerDeath-install', e); }

  function buildRow(G, day) {
    let v, vid;
    try {
      v = (G.state && G.state.village) || {};
      vid = scholarVid(G);
    } catch (e) { err('row-read', e); return; }
    if (vid == null) { err('row', new Error('no scholar vid on day ' + day)); return; }
    vid = String(vid);
    if (track.prevVid !== null && track.prevVid !== vid) track.successions++;
    // Fallback mantle-day for non-death transitions (exile etc. — exile
    // does not pass the mantle per justice.js:186, so this should never
    // fire; kept for honesty).
    if (track.mantleDay[vid] === undefined) track.mantleDay[vid] = day;
    track.prevVid = vid;
    let cumTakes = 0, cumGives = 0;
    try {
      cumTakes = ((v.takes || {})[vid]) || 0;
      cumGives = ((v.gives || {})[vid]) || 0;
    } catch (e) { err('row-cum', e); }
    const volTakesCum = sumEvents(track.volEvents, vid, day);
    const volGivesCum = sumEvents(track.giveEvents, vid, day);
    const mealTakes = cumTakes - volTakesCum;
    const cumNet = cumGives - cumTakes;
    const voluntaryNet = cumGives - volTakesCum;
    const dayEv = (evs) => (evs || []).filter(e => e && e.vid === vid).map(e => ({ day: e.day, kcal: e.kcal }));
    const tr7VolTakes = tr7Sums(dayEv(track.volEvents), day);
    const tr7VolGives = tr7Sums(dayEv(track.giveEvents), day);
    const voluntaryNet7 = tr7VolGives - tr7VolTakes;
    if (mealTakes < -0.5) err('neg-meal', new Error(`day ${day} vid ${vid}: mealTakes=${mealTakes}`));
    const row = {
      day, vid,
      cumTakes, cumGives, cumNet,
      volTakesCum, volGivesCum, mealTakes,
      mealShare: cumTakes > 0 ? +(mealTakes / cumTakes).toFixed(3) : null,
      voluntaryNet, voluntaryNet7,
    };
    if (track.rowed[day] != null) track.rows[track.rowed[day]] = row; // frozen-day rebuild
    else { track.rowed[day] = track.rows.length; track.rows.push(row); }
  }

  track.dawn = function (G) {
    if (!track.on) return;
    try { buildRow(G, gday(G)); } catch (e) { err('dawn', e); }
  };

  track.finalize = function () {
    if (!track.on) return { on: false, errors: track.errors };
    const rows = track.rows.slice().sort((a, b) => a.day - b.day);
    const rowsByVid = {};
    for (const r of rows) { (rowsByVid[r.vid] = rowsByVid[r.vid] || []).push(r); }
    // Player deaths, in order (the mantle's exits).
    const playerDeaths = track.deaths.filter(d => d.player && d.vid != null)
      .sort((a, b) => a.day - b.day);
    const vname = (vid) => {
      try {
        const rec = (Game.data && Game.data.villagers || []).find(x => String(x.id) === String(vid));
        if (rec && rec.name) return String(rec.name).split(' ')[0];
      } catch (e) {}
      return null;
    };
    const successions = [];
    const vids = Object.keys(track.mantleDay);
    for (const vid of vids) {
      const mDay = track.mantleDay[vid];
      if (mDay === undefined || isBadNum(mDay)) { err('finalize', new Error('no mantleDay for ' + vid)); continue; }
      const isInitial = String(vid) === String(track.initialVid);
      // Exit: the bearer's own player-death record (first one at/after the
      // mantle — the double-death guard makes repeats no-ops in-engine,
      // but the hook records each call; take the first).
      const death = playerDeaths.find(d => d.vid === vid && d.day >= mDay);
      let exitDay = null, exitType = null, cause = null, causeClass = null;
      if (death) {
        exitDay = death.day; exitType = 'death'; cause = death.cause;
        causeClass = classifyCause(death.cause);
      } else {
        // Non-death office exit fallback: a vid change with no death
        // record. Exile does not pass the mantle (justice.js:186), so this
        // should never fire.
        const rs = rowsByVid[vid] || [];
        const lastDay = rs.length ? rs[rs.length - 1].day : null;
        const nextVidRow = rows.find(r => r.day > (lastDay == null ? -1 : lastDay) &&
          String(r.vid) !== String(vid) && (track.mantleDay[r.vid] || 0) > mDay);
        if (nextVidRow) {
          exitDay = nextVidRow.day; exitType = 'office-exit';
          cause = 'office-exit'; causeClass = 'other';
        }
      }
      const rs = (rowsByVid[vid] || []).filter(r => r.day >= mDay);
      const lastRowDay = rs.length ? rs[rs.length - 1].day : null;
      const daysInOffice = exitDay != null ? exitDay - mDay
        : (lastRowDay != null ? lastRowDay - mDay : 0);
      const fast = exitDay != null && (exitDay - mDay) <= 2;
      // Ledger state at death: last row for this bearer inside
      // [mantleDay, exitDay], else the analytic fresh book.
      let state = null, stateSource = null, reArmedBeforeDeath = null;
      if (fast || exitDay != null) {
        const cand = rs.filter(r => r.day <= exitDay);
        reArmedBeforeDeath = cand.some(r => r.day > mDay && r.cumNet < -5000);
        const last = cand.length ? cand[cand.length - 1] : null;
        if (last) {
          stateSource = 'row';
          state = {
            day: last.day, cumNet: last.cumNet,
            voluntaryNet: last.voluntaryNet, voluntaryNet7: last.voluntaryNet7,
            mealShare: last.mealShare, mealKcal: last.mealTakes,
            volTakeKcal: last.volTakesCum, cumTakes: last.cumTakes,
          };
        } else {
          // No post-mantle row: the bearer died before the next dawn.
          // mantleBecome (ledger.js:835-844) zeroes the book, so the
          // state is the empty book by construction.
          stateSource = 'fresh-book';
          state = {
            day: exitDay, cumNet: 0, voluntaryNet: 0, voluntaryNet7: 0,
            mealShare: null, mealKcal: 0, volTakeKcal: 0, cumTakes: 0,
          };
        }
      }
      const ev = {
        vid, name: vname(vid), initial: isInitial,
        mantleDay: mDay, exitDay, exitType, cause, causeClass,
        daysInOffice, fast,
        reArmedBeforeDeath, stateSource, state,
      };
      if (fast) {
        const a = attribFast(ev);
        ev.attributed = a.attributed; ev.attribNotes = a.notes;
      }
      successions.push(ev);
    }
    successions.sort((a, b) => a.mantleDay - b.mantleDay);
    const fastEv = successions.filter(e => e.fast);
    const attributed = fastEv.filter(e => e.attributed);
    const exited = successions.filter(e => e.exitDay != null);
    const dioms = exited.map(e => e.daysInOffice).sort((a, b) => a - b);
    const classCounts = {};
    for (const e of fastEv) classCounts[e.causeClass || 'unattributed'] =
      (classCounts[e.causeClass || 'unattributed'] || 0) + 1;
    const inCombat = (c) => c === 'combat' || c === 'villager-combat' || c === 'monster';
    const fastShares = fastEv.length ? {
      combat: fastEv.filter(e => inCombat(e.causeClass)).length / fastEv.length,
      hunger: fastEv.filter(e => e.causeClass === 'starvation').length / fastEv.length,
      other: fastEv.filter(e => !inCombat(e.causeClass) && e.causeClass !== 'starvation').length / fastEv.length,
    } : null;
    return {
      on: true, errors: track.errors,
      successions,
      aggregate: {
        nSuccessions: successions.length,
        nExited: exited.length,
        nCensored: successions.length - exited.length,
        daysInMantleMedian: dioms.length ? dioms[Math.floor(dioms.length / 2)] : null,
        daysInMantleMin: dioms.length ? dioms[0] : null,
        daysInMantleMax: dioms.length ? dioms[dioms.length - 1] : null,
        nFast: fastEv.length,
        nFastAttributed: attributed.length,
        attributionRate: fastEv.length ? attributed.length / fastEv.length : null,
        // PRIMARY GO (pre-registered): attributionRate >= 0.95
        go: fastEv.length > 0 && attributed.length / fastEv.length >= 0.95,
        causeClasses: classCounts,
        fastShares,
        fastReArmedBeforeDeath: fastEv.filter(e => e.reArmedBeforeDeath === true).length,
        fastFreshBook: fastEv.filter(e => e.stateSource === 'fresh-book').length,
        officeExits: successions.filter(e => e.exitType === 'office-exit').length,
      },
    };
  };

  track.uninstall = function () {
    try { if (track.oRecordTake && Game.recordTakeHist !== track.oRecordTake) Game.recordTakeHist = track.oRecordTake; } catch (e) {}
    try { if (track.oRecordGive && Game.recordGiveHist !== track.oRecordGive) Game.recordGiveHist = track.oRecordGive; } catch (e) {}
    try { if (track.oRegisterDeath && Game.registerDeath !== track.oRegisterDeath) Game.registerDeath = track.oRegisterDeath; } catch (e) {}
    try { if (track.oPlayerDeath && Game.playerDeath !== track.oPlayerDeath) Game.playerDeath = track.oPlayerDeath; } catch (e) {}
  };

  return track;
}

module.exports = { installSuccDeath, attribFast, classifyCause, CAUSE_CLASSES, gateOn };
