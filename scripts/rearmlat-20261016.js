#!/usr/bin/env node
// scripts/rearmlat-20261016.js — SUCCESSOR TRUST-LEDGER RE-ARM LATENCY CENSUS
// (loop B sim-rearmlat-b, 2026-10-16, food-economy axis; instruments
// sim-findings #385/#386 from sim-ledgerdiag-b)
//
// READ-ONLY diagnostic instrument — zero src/js changes, zero policy
// behavior changes. Measures on identical seeds the successor re-arm
// phenomenon: every successor re-arms the cumulative -5000 trust bar within
// 2-6 days of taking the mantle (fresh book -> bowls -> armed) while their
// dated-voluntary ledger never arms, and census whether the cold-shoulder
// fiction's blame agrees with the dated-voluntary ledger.
//
// MECHANICS (read from src/js as-is, cited; no food-distribution canon doc
// exists — stated per the canon rule):
//   - game.js:14575-14579 (takeFromPantry, single take): net = v.gives[vid] -
//     v.takes[vid] (LIFETIME-cumulative gross); if (net < -5000) trust -2 per
//     take. THE trust-drop bar.
//   - justice.js:104-106 (justiceHeat): the SAME cumulative net;
//     net < -15000 -> heat +25, net < -5000 -> heat +10 (moot ladder fuel).
//   - justice.js:134-139: stage 0->1 cold shoulder at heat >= 25:
//     say('Something has shifted. Conversations stop when you approach the
//     fire. Nobody meets your eyes for long.') +
//     journalNote('village','mood','The village has gone quiet around me.
//     I know why.'). Heat >= 25 can ALSO come from ambient distrust
//     (justice.js:107-112: avg roster trust < 5 -> +25) — the stage is
//     village-level (v.justice) and does NOT reset on succession.
//   - game.js:26632 (villageMeal): the communal bowl writes v.takes WITHOUT
//     a takeHist entry (r8: "the village feeding you is not evidence against
//     you" — deliberate). Meal takes are undated: cumTakes - datedVolTakes
//     names them exactly.
//   - ledger.js:841-844 (mantleBecome): succession zeroes v.takes/v.gives
//     and empties takeHist/giveHist — a fresh book per bearer.
//
// METHOD: hooks recordTakeHist/recordGiveHist (call-through) build the EXACT
// full dated-voluntary event log per vid (the engine prunes >7d on write;
// the instrument keeps everything). Per-dawn snapshots of the cumulative
// book give the engine side. playerDeath hook records each successor's
// mantleDay at the reset moment (mirror of ledger.js:841-844); dawn has a
// fallback for non-death transitions (exile etc.).
//
// RE-ARM EVENT (per successor; bearer = initial vid): the first dawn row with
// day > mantleDay[vid] and cumNet < -5000 (strict <, the engine's
// comparison). Each event is attributed with:
//   (1) latency = armDay - mantleDay (days from mantle-take to re-arm)
//   (2) dated-voluntary arm status at re-arm: volArmDay (first day
//       voluntaryNet < -5000) or null; driver = 'meal' if
//       voluntaryNet(armDay) >= -5000 (the voluntary side alone would NOT
//       have armed the bar — the undated bowls pushed it over),
//       'voluntary' if voluntaryNet(armDay) < -5000
//   (3) mealShare = (cumTakes - volTakesCum)/cumTakes at arm day
//   (4) cold-shoulder agreement: the bearer's first stage 0->1 firing while
//       in office agrees with the dated ledger iff voluntaryNet7 < 0
//       (the freeloader-clock reading; the cumulative-dated form
//       voluntaryNet < 0 is reported alongside, not scored)
// An event counts ATTRIBUTED when (1)-(3) are present and (4) is present or
// explicitly null (bearer had no cold-shoulder firing while in office).
//
// GATE: REARMLAT=1 (default off). Gate off -> install returns a stub that
// wraps NOTHING (byte-identical by construction). All wraps are pure
// call-through; trajectory-neutrality is proven by the det-gate in
// scripts/test-rearmlat-20261016.js PART B.
//
// Driver contract: after loadGame+setupGame, call installRearmLat(Game),
// then call track.dawn(Game) at the START of the policy.daily wrapper (pure
// reads; builds rows for completed nights). After runDays, call
// track.dawn(Game) once more (the day loop's final sleep has no subsequent
// daily), then track.finalize(), then track.uninstall().
'use strict';

function gateOn() { return process.env.REARMLAT === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarVid(Game) {
  try {
    const s = Game.state.scholar || {};
    return s.villagerId || Game.villagerId || null;
  } catch (e) { return null; }
}
function isBadNum(x) { return typeof x !== 'number' || !isFinite(x); }

// tr7Sums/sumEvents/classifyBeat are pure helpers proven in the ledgerdiag
// lib (scripts/test-ledgerdiag-20261016.js PART A + SMOKE); requiring that
// module is side-effect-free (pure function defs only).
const { tr7Sums, sumEvents, classifyBeat } = require('./ledgerdiag-lib-20261016');

// attribRearm — pure. Classifies a re-arm event's driver and completeness.
// Input fields are all plain numbers/null. Pre-registered attribution rule.
function attribRearm(arm) {
  const out = { attributed: false, driver: null, notes: [] };
  if (!arm || typeof arm !== 'object') { out.notes.push('no-arm'); return out; }
  const have123 = typeof arm.armDay === 'number' && typeof arm.latency === 'number' &&
    typeof arm.voluntaryNet === 'number' && typeof arm.mealShare === 'number';
  if (!have123) { out.notes.push('missing-core-fields'); return out; }
  // (4) cold-shoulder agreement: present (bool) or explicitly null (no
  // firing while in office) both count as recorded.
  const have4 = arm.coldAgreement === true || arm.coldAgreement === false || arm.coldAgreement === null;
  if (!have4) { out.notes.push('missing-cold-agreement'); return out; }
  // Driver: would the dated-voluntary side alone have armed the bar?
  out.driver = arm.voluntaryNet < -5000 ? 'voluntary' : 'meal';
  out.attributed = true;
  return out;
}

function installRearmLat(Game) {
  const track = {
    on: gateOn(), errors: [],
    volEvents: [], giveEvents: [],           // full dated-voluntary logs (unpruned)
    rows: [], rowed: {},                     // per-dawn rows (day -> row)
    stageEvents: [],                         // justice stage transitions (day, vid, from->to, nets, heat)
    beats: [],                               // cold-shoulder-classified fiction beats (sense-test material)
    mantleDay: {},                           // vid -> day they took the mantle
    initialVid: null, prevVid: null, prevStage: {},
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
  try { track.mantleDay[track.initialVid] = gday(Game); } catch (e) {}

  // ---- dated-voluntary event log (call-through) ----
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

  // ---- succession mirror (ledger.js:841-844) + mantleDay ----
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

  // ---- cold-shoulder fiction capture (say + journalNote hooks) ----
  try {
    if (typeof Game.say === 'function') {
      track.oSay = Game.say;
      const orig = track.oSay;
      Game.say = function (text) {
        try {
          const c = classifyBeat(String(text == null ? '' : text));
          if (c === 'COLD_SHOULDER_SAY') {
            track.beats.push({ kind: 'say', day: gday(this), vid: scholarVid(this) != null ? String(scholarVid(this)) : null, text: String(text) });
          }
        } catch (e) { err('say-classify', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('say-install', e); }
  try {
    if (typeof Game.journalNote === 'function') {
      track.oJournal = Game.journalNote;
      const orig = track.oJournal;
      Game.journalNote = function (a, b, text) {
        try {
          const t = String(text == null ? '' : text);
          if (/has gone quiet around me/i.test(t)) {
            track.beats.push({ kind: 'journal', day: gday(this), vid: scholarVid(this) != null ? String(scholarVid(this)) : null, text: t });
          }
        } catch (e) { err('journal-classify', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('journal-install', e); }

  function buildRow(G, day) {
    let v, vid;
    try {
      v = (G.state && G.state.village) || {};
      vid = scholarVid(G);
    } catch (e) { err('row-read', e); return; }
    if (vid == null) { err('row', new Error('no scholar vid on day ' + day)); return; }
    vid = String(vid);
    if (track.prevVid !== null && track.prevVid !== vid) track.successions++;
    // Fallback mantle-day for non-death transitions (exile, etc.).
    if (track.mantleDay[vid] === undefined) track.mantleDay[vid] = day;
    track.prevVid = vid;
    let trust = 10;
    try { trust = (v.trust && v.trust[vid] !== undefined) ? v.trust[vid] : 10; } catch (e) {}
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
    let stage = 0, heat = 0;
    try { stage = ((v.justice || {}).stage) || 0; } catch (e) {}
    try { heat = (typeof G.justiceHeat === 'function') ? G.justiceHeat() : 0; } catch (e) { err('row-heat', e); }
    if (track.prevStage[vid] === undefined) track.prevStage[vid] = stage;
    if (stage !== track.prevStage[vid]) {
      track.stageEvents.push({
        day, vid, from: track.prevStage[vid], to: stage, heat,
        cumNet, voluntaryNet, voluntaryNet7,
        mealShare: cumTakes > 0 ? +(mealTakes / cumTakes).toFixed(3) : null,
        agreed7: typeof voluntaryNet7 === 'number' ? voluntaryNet7 < 0 : null,
        agreedCum: typeof voluntaryNet === 'number' ? voluntaryNet < 0 : null,
      });
      track.prevStage[vid] = stage;
    }
    if (mealTakes < -0.5) err('neg-meal', new Error(`day ${day} vid ${vid}: mealTakes=${mealTakes}`));
    const row = {
      day, vid, trust, cumTakes, cumGives, cumNet,
      volTakesCum, volGivesCum, mealTakes,
      mealShare: cumTakes > 0 ? +(mealTakes / cumTakes).toFixed(3) : null,
      voluntaryNet, voluntaryNet7,
      stage, heat,
    };
    if (track.rowed[day] != null) track.rows[track.rowed[day]] = row; // frozen-day rebuild
    else { track.rowed[day] = track.rows.length; track.rows.push(row); }
  }

  track.dawn = function (G) {
    if (!track.on) return;
    try {
      const day = gday(G);
      buildRow(G, day);
    } catch (e) { err('dawn', e); }
  };

  track.finalize = function () {
    if (!track.on) return { on: false, errors: track.errors };
    // ---- per-successor re-arm events ----
    const rowsByVid = {};
    for (const r of track.rows) {
      (rowsByVid[r.vid] = rowsByVid[r.vid] || []).push(r);
    }
    for (const k of Object.keys(rowsByVid)) rowsByVid[k].sort((a, b) => a.day - b.day);
    const rearms = [];
    for (const vid of Object.keys(rowsByVid)) {
      if (vid === String(track.initialVid)) continue;         // successors only
      const mDay = track.mantleDay[vid];
      if (mDay === undefined || isBadNum(mDay)) { err('rearm', new Error('no mantleDay for successor ' + vid)); continue; }
      const rs = rowsByVid[vid];
      let armRow = null, volArmDay = null;
      for (const r of rs) {
        if (volArmDay === null && r.day > mDay && r.voluntaryNet < -5000) volArmDay = r.day;
        if (armRow === null && r.day > mDay && r.cumNet < -5000) { armRow = r; break; }
      }
      if (armRow === null) {
        rearms.push({ vid, mantleDay: mDay, armDay: null, rearmed: false,
          daysInOffice: rs.length ? rs[rs.length - 1].day - mDay : 0, volArmDay });
        continue;
      }
      // Cold-shoulder agreement: the bearer's first 0->1 firing while in
      // office (matched to the bearer's record at firing day).
      const firings = track.stageEvents.filter(e => e.from === 0 && e.to === 1);
      const dayVid = (d) => {
        // bearer's record at day d: last row with day <= d
        let bvid = null;
        for (const r of track.rows) { if (r.day <= d) bvid = r.vid; }
        return bvid;
      };
      let coldAgreement = null, coldFiringDay = null, coldVn7 = null, coldVn = null;
      for (const f of firings) {
        if (dayVid(f.day) === vid && f.day > mDay) {
          coldAgreement = f.agreed7 === true || f.agreed7 === false ? f.agreed7 : null;
          coldFiringDay = f.day; coldVn7 = f.voluntaryNet7; coldVn = f.voluntaryNet;
          break;
        }
      }
      const arm = {
        vid, mantleDay: mDay, armDay: armRow.day, rearmed: true,
        latency: armRow.day - mDay,
        cumNet: armRow.cumNet, voluntaryNet: armRow.voluntaryNet,
        voluntaryNet7: armRow.voluntaryNet7, volArmDay,
        mealKcal: armRow.mealTakes, volTakeKcal: armRow.volTakesCum,
        mealShare: armRow.mealShare,
        coldAgreement, coldFiringDay, coldVn7, coldVn,
      };
      const a = attribRearm(arm);
      arm.driver = a.driver; arm.attributed = a.attributed; arm.attribNotes = a.notes;
      rearms.push(arm);
    }
    // ---- cold-shoulder firings (run level) ----
    const firings = track.stageEvents.filter(e => e.from === 0 && e.to === 1);
    const nAgreed7 = firings.filter(f => f.agreed7 === true).length;
    const nDisagreed7 = firings.filter(f => f.agreed7 === false).length;
    // ---- aggregates ----
    const armed = rearms.filter(r => r.rearmed);
    const mealDriven = armed.filter(r => r.driver === 'meal');
    const volDriven = armed.filter(r => r.driver === 'voluntary');
    const attributed = armed.filter(r => r.attributed);
    const lat = armed.map(r => r.latency).sort((a, b) => a - b);
    return {
      on: true, errors: track.errors,
      successions: track.successions,
      nSuccessors: Object.keys(rowsByVid).filter(v => v !== String(track.initialVid)).length,
      rearms,
      coldShoulder: {
        nFirings: firings.length,
        firings: firings.map(f => ({ day: f.day, vid: f.vid, heat: f.heat, cumNet: f.cumNet,
          voluntaryNet: f.voluntaryNet, voluntaryNet7: f.voluntaryNet7,
          mealShare: f.mealShare, agreed7: f.agreed7, agreedCum: f.agreedCum })),
        nAgreed7, nDisagreed7,
        agreementRate7: firings.length ? nAgreed7 / firings.length : null,
      },
      beats: track.beats.slice(0, 60),
      aggregate: {
        nRearmEvents: armed.length,
        nAttributed: attributed.length,
        attributionRate: armed.length ? attributed.length / armed.length : null,
        nMealDriven: mealDriven.length, nVolDriven: volDriven.length,
        mealDrivenShare: armed.length ? mealDriven.length / armed.length : null,
        latency: {
          min: lat.length ? lat[0] : null, max: lat.length ? lat[lat.length - 1] : null,
          median: lat.length ? lat[Math.floor(lat.length / 2)] : null,
          hist: lat,
        },
        neverVolArm: armed.filter(r => r.volArmDay === null).length,
      },
    };
  };

  track.uninstall = function () {
    try { if (track.oRecordTake && Game.recordTakeHist !== track.oRecordTake) Game.recordTakeHist = track.oRecordTake; } catch (e) {}
    try { if (track.oRecordGive && Game.recordGiveHist !== track.oRecordGive) Game.recordGiveHist = track.oRecordGive; } catch (e) {}
    try { if (track.oSay && Game.say !== track.oSay) Game.say = track.oSay; } catch (e) {}
    try { if (track.oJournal && Game.journalNote !== track.oJournal) Game.journalNote = track.oJournal; } catch (e) {}
    try { if (track.oPlayerDeath && Game.playerDeath !== track.oPlayerDeath) Game.playerDeath = track.oPlayerDeath; } catch (e) {}
  };

  return track;
}

module.exports = { installRearmLat, attribRearm, gateOn };
