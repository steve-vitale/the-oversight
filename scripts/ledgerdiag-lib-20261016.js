#!/usr/bin/env node
// scripts/ledgerdiag-lib-20261016.js — LEDGER COUNTERFACTUAL DIAGNOSTIC
// (loop B sim-ledgerdiag-b, 2026-10-16, food-economy axis; #340 evidence-
// sharpener for the steve-call: should the trust/justice bars read the
// dated voluntary ledger (like the freeloader clock) instead of the
// meal-inflated cumulative?)
//
// INSTRUMENT ONLY — zero src/js changes, zero policy changes. Read-only
// harness-side reconstruction of BOTH ledgers per run, and the
// counterfactual the steve-call needs: when WOULD the -5000 bar have armed
// on the dated-voluntary take side?
//
// MECHANICS (read from src/js as-is, cited — no food-distribution canon doc
// exists; stated per the canon rule):
//   - game.js:14575-14579 (takeFromPantry, single take): net = v.gives[vid] -
//     v.takes[vid] (LIFETIME-cumulative gross); if (net < -5000) trust -2 per
//     take. THE trust-drop bar. takeFromPantryBulk (game.js:14487-14507)
//     uses the same net vs -Math.min(5000, pantryKcalLive).
//   - justice.js:104-106 (justiceHeat): the SAME cumulative net;
//     net < -15000 -> heat +25, net < -5000 -> heat +10 (moot ladder fuel).
//     Stage 0->1 (cold shoulder) fires at heat >= 25 (justice.js:135-139):
//     say 'Something has shifted. Conversations stop when you approach the
//     fire. Nobody meets your eyes for long.' + journalNote('village',
//     'mood', 'The village has gone quiet around me. I know why.').
//   - game.js:14188-14241 (recordTakeHist/recordGiveHist + takeRate7/
//     giveRate7): the DATED VOLUNTARY ledger — {day, kcal} per voluntary
//     pantry take/give, 7-day window, pruned on write. The communal bowl
//     (villageMeal, game.js:26632) writes v.takes WITHOUT a takeHist entry
//     (r8: "the village feeding you is not evidence against you" —
//     deliberate); the player is never in the villagerMealDay pot
//     (game.js:27996-27999, parity 2026-10-08), so the player's takeHist is
//     voluntary-pantry-takes ONLY. Read by the freeloader clock as the
//     trailing-7d net RATE (takeRate7 - giveRate7, game.js:27148) and by the
//     theft-confrontation rate check (takeRate7 >= 3000, game.js:14263).
//   - ledger.js:841-844 (mantleBecome): succession zeroes v.takes/v.gives
//     and resets takeHist/giveHist — a fresh book per bearer.
//   - game.js:28823 (sleep): villageMeal() runs the scholar's bowl; the
//     overnight calories.resolveDay emits the STARVING warning.
//
// METHOD: hooks recordTakeHist/recordGiveHist (call-through) to build the
// EXACT full dated-voluntary event log per vid (the engine prunes entries
// older than 7 days on write; the instrument keeps everything — that is the
// counterfactual's raw material). Per-dawn snapshots of the cumulative book
// (v.takes/v.gives) give the engine side. mealTakes = cumTakes - datedVolTakes
// names the undated (bowl) component exactly; undatedGives = cumGives -
// datedVolGives names the undated give side (haven-role work credits,
// ~0 for the scholar).
//
// COUNTERFACTUAL NETS (per vid, per day):
//   voluntaryNet   = cumGives - volTakesCum   (take side swapped to dated
//                    voluntary; give side kept as the engine reads it —
//                    the steve-call is about the meal-inflated TAKE side)
//   voluntaryNetD  = volGivesCum - volTakesCum (fully dated variant)
//   voluntaryNet7  = tr7VolGives - tr7VolTakes (the freeloader-clock
//                    reading: trailing-7d dated flows, engine window
//                    e.day >= day-6)
//
// ARM DAYS (strict <, the engine's comparisons):
//   engineArm[vid] = first day cumNet < -5000      (the bar that fires)
//   volArm[vid]    = first day voluntaryNet < -5000 (the counterfactual)
//   PRIMARY (pre-registered): on the run's arming bearer (earliest
//   engineArm), volArm - engineArm >= 14 days, or volArm === null (never).
//
// COLD-SHOULDER FIRINGS: justice stage 0->1 transitions (the engine event),
// each enriched with the fiction beats captured that day (say + journalNote
// hooks, classified), the voluntary nets, and the meal share. CO-PRIMARY
// (pre-registered): a firing counts when voluntaryNet7 >= 0 — the dated-
// voluntary ledger as the freeloader clock reads it ("like the freeloader
// clock" is the steve-call's own comparator). The cumulative-dated form
// (voluntaryNet >= 0) is reported alongside, not scored.
//
// JUSTICE TIERS: first day cumNet < -5000 (heat+10) and < -15000 (heat+25)
// per vid, with the meal-inflated share of the cumulative at landing, plus
// the counterfactual tier landings on voluntaryNet (expected: never).
//
// GATE: LEDGERDIAG=1 (default off). Gate off -> install returns a stub that
// wraps NOTHING (byte-identical by construction). All wraps are pure
// call-through; trajectory-neutrality with the gate ON is proven by the
// det-gate in scripts/test-ledgerdiag-20261016.js PART B.
//
// Driver contract: after loadGame+setupGame, call installLedgerDiag(Game),
// then call track.dawn(Game) at the START of the policy.daily wrapper (pure
// reads; builds rows for completed nights). After runDays, call
// track.dawn(Game) once more (the day loop's final sleep has no subsequent
// daily — trustcensus A8-fix), then track.finalize(), then
// track.uninstall().
'use strict';

function gateOn() { return process.env.LEDGERDIAG === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarVid(Game) {
  try {
    const s = Game.state.scholar || {};
    return s.villagerId || Game.villagerId || null;
  } catch (e) { return null; }
}
function isBadNum(x) { return typeof x !== 'number' || !isFinite(x); }

// tr7Sums(hist, day) — pure. Trailing-7-day sums over the engine's exact
// window (game.js takeRate7/giveRate7: e.day >= day-6, e.day <= day).
function tr7Sums(hist, day) {
  let sum = 0;
  for (const e of (hist || [])) {
    if (!e || typeof e.kcal !== 'number' || !isFinite(e.kcal)) continue;
    const d = e.day | 0;
    if (d < day - 6 || d > day) continue;
    sum += e.kcal;
  }
  return sum;
}

// sumEvents(events, vid, day) — pure. Lifetime dated-voluntary total for vid
// through `day` (the counterfactual's raw material; the engine prunes, we
// don't).
function sumEvents(events, vid, day) {
  let sum = 0;
  for (const e of (events || [])) {
    if (!e || e.vid !== vid) continue;
    if ((e.day | 0) > (day | 0)) continue;
    if (typeof e.kcal !== 'number' || !isFinite(e.kcal)) continue;
    sum += e.kcal;
  }
  return sum;
}

// armDay(rows, key, bar) — pure. First row (day order) with rows[key] < bar.
// Strict < : the engine's comparisons never arm on exact equality.
function armDay(rows, key, bar) {
  for (const r of rows) {
    const v = r[key];
    if (typeof v === 'number' && isFinite(v) && v < bar) return r.day;
  }
  return null;
}

// Cold-shoulder fiction beat classification (justice.js:135-139).
function classifyBeat(text) {
  const t = String(text || '');
  if (/gone quiet around me/.test(t)) return 'COLD_SHOULDER_JOURNAL';
  if (/Something has shifted\. Conversations stop when you approach the fire/.test(t)) return 'COLD_SHOULDER_SAY';
  if (/Someone watches you load up/.test(t)) return 'TRUST_TAKE_STING';
  return null;
}

function installLedgerDiag(Game) {
  if (!gateOn()) {
    return {
      on: false, rows: [], volEvents: [], giveEvents: [], beats: [],
      stageEvents: [], nights: [], meals: {},
      dawn() {}, finalize() { return { on: false }; }, uninstall() {},
    };
  }
  const track = {
    on: true, rows: [], rowed: {}, nights: [], meals: {},
    volEvents: [], giveEvents: [], beats: [], stageEvents: [],
    prevVid: null, prevStage: {}, successions: 0,
    nDupNights: 0, nightsRowed: 0, instrErrors: [],
    oRecordTake: null, oRecordGive: null, oSay: null, oJournal: null,
    oVillageMeal: null, oPlayerDeath: null, calObj: null, oResolveDay: null,
  };
  const err = (where, e) => {
    try { track.instrErrors.push(where + ': ' + (e && e.message)); } catch (e2) {}
  };

  // ---- dated voluntary ledger: exact event capture (call-through) ----
  try {
    if (typeof Game.recordTakeHist === 'function') {
      track.oRecordTake = Game.recordTakeHist;
      const orig = track.oRecordTake;
      Game.recordTakeHist = function (vid, kcal) {
        try {
          track.volEvents.push({ vid: String(vid), day: gday(this), kcal: Math.round(kcal) || 0 });
        } catch (e) { err('take-event', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('take-install', e); }
  try {
    if (typeof Game.recordGiveHist === 'function') {
      track.oRecordGive = Game.recordGiveHist;
      const orig = track.oRecordGive;
      Game.recordGiveHist = function (vid, kcal) {
        try {
          track.giveEvents.push({ vid: String(vid), day: gday(this), kcal: Math.round(kcal) || 0 });
        } catch (e) { err('give-event', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('give-install', e); }

  // ---- fiction beats: say + journalNote capture (call-through) ----
  try {
    if (typeof Game.say === 'function') {
      track.oSay = Game.say;
      const orig = track.oSay;
      Game.say = function (t) {
        try {
          const cls = classifyBeat(t);
          if (cls) track.beats.push({ day: gday(this), vid: String(scholarVid(this)), cls, text: String(t).slice(0, 400) });
        } catch (e) { err('say-beat', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('say-install', e); }
  try {
    if (typeof Game.journalNote === 'function') {
      track.oJournal = Game.journalNote;
      const orig = track.oJournal;
      Game.journalNote = function (cat, key, text) {
        try {
          const cls = classifyBeat(text);
          if (cls) track.beats.push({ day: gday(this), vid: String(scholarVid(this)), cls, text: String(text).slice(0, 400), jclass: [cat, key].join('/') });
        } catch (e) { err('journal-beat', e); }
        return orig.apply(this, arguments);
      };
    }
  } catch (e) { err('journal-install', e); }

  // ---- succession book-reset mirror (ledger.js:841-844) ----
  // playerDeath zeroes the NEW bearer's v.takes/v.gives and empties their
  // takeHist/giveHist. Mirror it in the event log at the exact moment: when
  // playerDeath returns with a changed scholar vid, every event logged for
  // the new vid so far is pre-reset (NPC-era flows, or entries the reset
  // wiped) — the new bearer cannot have acted yet inside playerDeath after
  // the reset. Filtering at dawn (instead of here) is WRONG: same-day
  // post-reset takes would be dropped (SMOKE caught it: a successor's
  // day-13 takes vanished because the dawn filter ran after them).
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
            track.volEvents = track.volEvents.filter(e => e.vid !== nid);
            track.giveEvents = track.giveEvents.filter(e => e.vid !== nid);
          }
        } catch (e) { err('playerDeath-filter', e); }
        return r;
      };
    }
  } catch (e) { err('playerDeath-install', e); }

  // ---- the communal bowl (meal-taken + half-ration beat; trustcensus pattern) ----
  try {
    if (typeof Game.villageMeal === 'function') {
      track.oVillageMeal = Game.villageMeal;
      const orig = track.oVillageMeal;
      Game.villageMeal = function () {
        const v = this.state.village || {}, scholar = this.state.scholar || {};
        const day = scholar.day || 0;
        const beats = [];
        const oSay = this.say;
        this.say = function (t) {
          try { beats.push(String(t)); } catch (e) {}
          return oSay.apply(this, arguments);
        };
        let out;
        try { out = orig.apply(this, arguments); }
        catch (e) { err('villageMeal', e); throw e; }
        finally { this.say = oSay; }
        try {
          const text = beats.join('\n');
          track.meals[day] = {
            day,
            halfRation: /Half ration/.test(text),
            taken: (v.lastPlayerMeal || 0),
          };
        } catch (e) { err('meal-record', e); }
        return out;
      };
    }
  } catch (e) { err('meal-install', e); }

  // ---- overnight scholar body (STARVING signal; trustcensus pattern) ----
  try {
    const calObj = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).calories || null;
    if (calObj && typeof calObj.resolveDay === 'function') {
      track.calObj = calObj;
      track.oResolveDay = calObj.resolveDay;
      const orig = track.oResolveDay;
      calObj.resolveDay = function (scholar, village, opts) {
        const day = (scholar && scholar.day) || 0;
        let res;
        try { res = orig.apply(this, arguments); }
        catch (e) { err('resolveDay', e); throw e; }
        try {
          const starving = (res.warnings || []).some(w => String(w).indexOf('STARVING') === 0);
          track.nights.push({ day, starving });
        } catch (e) { err('night-record', e); }
        return res;
      };
    }
  } catch (e) { err('resolveDay-install', e); }

  function buildRow(G, day) {
    let v, vid;
    try {
      v = (G.state && G.state.village) || {};
      vid = scholarVid(G);
    } catch (e) { err('row-read', e); return; }
    if (vid == null) { err('row', new Error('no scholar vid on day ' + day)); return; }
    vid = String(vid);
    if (track.prevVid !== null && track.prevVid !== vid) track.successions++;
    track.prevVid = vid;
    let trust = 10;
    try { trust = (v.trust && v.trust[vid] !== undefined) ? v.trust[vid] : 10; } catch (e) {}
    let cumTakes = 0, cumGives = 0;
    try {
      cumTakes = ((v.takes || {})[vid]) || 0;
      cumGives = ((v.gives || {})[vid]) || 0;
    } catch (e) { err('row-cum', e); }
    // The counterfactual's raw material: exact dated-voluntary totals.
    const volTakesCum = sumEvents(track.volEvents, vid, day);
    const volGivesCum = sumEvents(track.giveEvents, vid, day);
    const mealTakes = cumTakes - volTakesCum;
    const undatedGives = cumGives - volGivesCum;
    const cumNet = cumGives - cumTakes;
    const voluntaryNet = cumGives - volTakesCum;      // PRIMARY counterfactual
    const voluntaryNetD = volGivesCum - volTakesCum;  // fully-dated variant
    // Freeloader-clock reading over the exact event log (engine window).
    const dayEv = (evs) => (evs || []).filter(e => e && e.vid === vid).map(e => ({ day: e.day, kcal: e.kcal }));
    const tr7VolTakes = tr7Sums(dayEv(track.volEvents), day);
    const tr7VolGives = tr7Sums(dayEv(track.giveEvents), day);
    const voluntaryNet7 = tr7VolGives - tr7VolTakes;
    // Justice state (pure reads; justiceHeat may create the default justice
    // object — the engine's own justiceTick does the same every tick, and
    // the det-gate arbitrates trajectory-neutrality).
    let stage = 0, heat = 0;
    try { stage = ((v.justice || {}).stage) || 0; } catch (e) {}
    try { heat = (typeof G.justiceHeat === 'function') ? G.justiceHeat() : 0; } catch (e) { err('row-heat', e); }
    if (track.prevStage[vid] === undefined) track.prevStage[vid] = stage;
    if (stage !== track.prevStage[vid]) {
      track.stageEvents.push({
        day, vid, from: track.prevStage[vid], to: stage, heat,
        cumNet, voluntaryNet, voluntaryNet7,
        mealShare: cumTakes > 0 ? +(mealTakes / cumTakes).toFixed(3) : null,
      });
      track.prevStage[vid] = stage;
    }
    const night = track.nights.filter(n => n.day === day).pop();
    const meal = track.meals[day] || null;
    // Duplicate nights (frozen day): rebuild the row in place with the later
    // state — strictly more complete. The event log is append-only and
    // per-vid, so rebuilds can never double-count (trustcensus A8 pattern,
    // but exact here by construction).
    const prevRow = track.rowed[day] != null ? track.rows[track.rowed[day]] : null;
    if (prevRow) track.nDupNights++;
    const hunger = !!(night && night.starving) || !!(prevRow && prevRow.hunger);
    if (mealTakes < -0.5) err('neg-meal', new Error(`day ${day} vid ${vid}: mealTakes=${mealTakes} (cum=${cumTakes} vol=${volTakesCum})`));
    const row = {
      day, vid, trust,
      cumTakes, cumGives, cumNet,
      volTakesCum, volGivesCum, mealTakes, undatedGives,
      mealShare: cumTakes > 0 ? +(mealTakes / cumTakes).toFixed(3) : null,
      voluntaryNet, voluntaryNetD, voluntaryNet7,
      tr7VolTakes, tr7VolGives,
      stage, heat,
      hunger, halfRation: !!(meal && meal.halfRation), mealTaken: meal ? meal.taken : null,
      succession: track.successions > 0 && track.rows.length > 0 &&
        track.rows[track.rows.length - 1].vid !== vid,
    };
    if (track.rowed[day] != null) track.rows[track.rowed[day]] = row;
    else { track.rowed[day] = track.rows.length; track.rows.push(row); }
  }

  // dawn(G) — called by the DRIVER at the START of the policy.daily wrapper
  // (pure reads). Builds one row per recorded night, in order; a duplicate
  // night (frozen day) REBUILDS its day's row in place. nightsRowed ensures
  // each night is consumed exactly once.
  track.dawn = function (G) {
    if (!track.on) return;
    try {
      for (let i = track.nightsRowed || 0; i < track.nights.length; i++) {
        buildRow(G, track.nights[i].day);
      }
      track.nightsRowed = track.nights.length;
    } catch (e) { err('dawn', e); }
  };

  track.finalize = function () {
    const rows = track.rows.slice().sort((a, b) => a.day - b.day);
    const byVid = {};
    for (const r of rows) { (byVid[r.vid] = byVid[r.vid] || []).push(r); }
    const vids = Object.keys(byVid);
    const perVid = {};
    for (const vid of vids) {
      const vr = byVid[vid];
      perVid[vid] = {
        nRows: vr.length,
        daySpan: vr.length ? [vr[0].day, vr[vr.length - 1].day] : null,
        engineArm: armDay(vr, 'cumNet', -5000),       // the bar that fires
        volArm: armDay(vr, 'voluntaryNet', -5000),     // the counterfactual
        volArmD: armDay(vr, 'voluntaryNetD', -5000),   // fully-dated variant
        tier10: armDay(vr, 'cumNet', -5000),           // justice heat+10
        tier25: armDay(vr, 'cumNet', -15000),          // justice heat+25
        volTier10: armDay(vr, 'voluntaryNet', -5000),
        volTier25: armDay(vr, 'voluntaryNet', -15000),
      };
      // Tier-landing composition: the meal-inflated share at landing time.
      for (const tk of ['tier10', 'tier25']) {
        const d = perVid[vid][tk];
        const row = d == null ? null : vr.find(r => r.day === d);
        perVid[vid][tk + 'At'] = row ? {
          day: row.day, cumNet: row.cumNet,
          cumTakes: row.cumTakes, volTakesCum: row.volTakesCum,
          mealTakes: row.mealTakes, mealShare: row.mealShare,
          heat: row.heat, stage: row.stage,
        } : null;
      }
    }
    // The run's arming bearer: earliest engineArm across vids.
    let armingVid = null, armingDay = null;
    for (const vid of vids) {
      const d = perVid[vid].engineArm;
      if (d != null && (armingDay == null || d < armingDay)) { armingDay = d; armingVid = vid; }
    }
    const pv = armingVid ? perVid[armingVid] : null;
    const primaryDelta = pv
      ? (pv.volArm == null ? 'never' : pv.volArm - pv.engineArm)
      : null;
    // Cold-shoulder firings: stage 0->1 transitions, enriched with the
    // fiction beats captured that day and both voluntary-net forms.
    const firings = track.stageEvents
      .filter(e => e.from === 0 && e.to === 1)
      .map(e => ({
        day: e.day, vid: e.vid, heat: e.heat,
        cumNet: e.cumNet, voluntaryNet: e.voluntaryNet, voluntaryNet7: e.voluntaryNet7,
        mealShare: e.mealShare,
        // The fiction fires in justiceTick; the stage transition is detected
        // at a dawn whose day label can be off by one from the beat's
        // scholar.day label (empirically: beats land on stageEvent.day + 1).
        // Match within ±1 day so the sense-test quotes attach to their
        // firing; the firing's ledger context stays the stageEvent day's
        // row (the transition's day).
        beats: track.beats
          .filter(b => Math.abs(b.day - e.day) <= 1 &&
            (b.cls === 'COLD_SHOULDER_SAY' || b.cls === 'COLD_SHOULDER_JOURNAL'))
          .map(b => ({ cls: b.cls, jclass: b.jclass || null, beatDay: b.day, text: b.text })),
      }));
    const trustStings = track.beats.filter(b => b.cls === 'TRUST_TAKE_STING').length;
    // Reconciliation: event-log tr7 vs the engine's own takeRate7/giveRate7
    // (exact match expected), negative mealTakes scan, rows-vs-nights
    // completeness. SAME-POINT-IN-TIME: the event-log tr7 is recomputed
    // from the CURRENT log at finalize (not the stored row values, which
    // were built at dawn and miss takes from a final partial day), over the
    // engine window ending at the last row's day — the same window the
    // live histories are read with. A run that ends mid-day (village-lost
    // before the last night) leaves day-final takes in the live hist that
    // no dawn row covers; comparing stored row values would false-positive
    // on exactly those runs.
    const recon = { tr7Mismatch: 0, tr7Checked: 0, negMealRows: 0 };
    try {
      for (const r of rows) if (r.mealTakes < -0.5) recon.negMealRows++;
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        const v = (Game.state && Game.state.village) || {};
        const day = lastRow.day, vid = lastRow.vid;
        const logT = tr7Sums((track.volEvents || []).filter(e => e && e.vid === vid)
          .map(e => ({ day: e.day, kcal: e.kcal })), day);
        const logG = tr7Sums((track.giveEvents || []).filter(e => e && e.vid === vid)
          .map(e => ({ day: e.day, kcal: e.kcal })), day);
        const liveT = tr7Sums((v.takeHist || {})[vid], day);
        const liveG = tr7Sums((v.giveHist || {})[vid], day);
        let erT = null, erG = null;
        try {
          if (typeof Game.takeRate7 === 'function') erT = Game.takeRate7(vid) * 7;
          if (typeof Game.giveRate7 === 'function') erG = Game.giveRate7(vid) * 7;
        } catch (e) {}
        // log-vs-live must agree (same window, same moment). The engine's
        // own rate functions are only comparable when the last row's day IS
        // the current scholar day — takeRate7/giveRate7 read scholar.day
        // internally, so on a run that ends mid-day they window a day the
        // last dawn row doesn't cover (SMOKE covers the rate functions at
        // the same point in time).
        if (Math.abs(logT - liveT) > 0.51) recon.tr7Mismatch++;
        if (Math.abs(logG - liveG) > 0.51) recon.tr7Mismatch++;
        if (day === gday(Game)) {
          if (erT != null && Math.abs(erT - liveT) > 0.51) recon.tr7Mismatch++;
          if (erG != null && Math.abs(erG - liveG) > 0.51) recon.tr7Mismatch++;
        }
        recon.tr7Checked++;
      }
    } catch (e) { err('recon', e); }
    return {
      on: true,
      nRows: rows.length, nNights: track.nights.length,
      nDupNights: track.nDupNights, successions: track.successions,
      instrErrors: track.instrErrors.slice(),
      nVolEvents: track.volEvents.length, nGiveEvents: track.giveEvents.length,
      perVid, armingVid, armingDay,
      primary: {
        engineArm: pv ? pv.engineArm : null,
        volArm: pv ? pv.volArm : null,
        volArmD: pv ? pv.volArmD : null,
        delta: primaryDelta,   // number, or 'never'
        // GO (pre-registered): delta === 'never' || delta >= 14
        go: primaryDelta === 'never' || (typeof primaryDelta === 'number' && primaryDelta >= 14),
      },
      coldShoulder: {
        nFirings: firings.length,
        firings,
        // CO-PRIMARY (pre-registered): >= 1 firing with voluntaryNet7 >= 0
        go: firings.some(f => typeof f.voluntaryNet7 === 'number' && f.voluntaryNet7 >= 0),
        nVoluntaryNet7Nonneg: firings.filter(f => typeof f.voluntaryNet7 === 'number' && f.voluntaryNet7 >= 0).length,
        nVoluntaryNetNonneg: firings.filter(f => typeof f.voluntaryNet === 'number' && f.voluntaryNet >= 0).length,
      },
      trustStings,
      recon,
      rows,
    };
  };

  track.uninstall = function () {
    try { if (track.oRecordTake && Game.recordTakeHist !== track.oRecordTake) Game.recordTakeHist = track.oRecordTake; } catch (e) {}
    try { if (track.oRecordGive && Game.recordGiveHist !== track.oRecordGive) Game.recordGiveHist = track.oRecordGive; } catch (e) {}
    try { if (track.oSay && Game.say !== track.oSay) Game.say = track.oSay; } catch (e) {}
    try { if (track.oJournal && Game.journalNote !== track.oJournal) Game.journalNote = track.oJournal; } catch (e) {}
    try { if (track.oVillageMeal && Game.villageMeal !== track.oVillageMeal) Game.villageMeal = track.oVillageMeal; } catch (e) {}
    try { if (track.oPlayerDeath && Game.playerDeath !== track.oPlayerDeath) Game.playerDeath = track.oPlayerDeath; } catch (e) {}
    try { if (track.calObj && track.oResolveDay && track.calObj.resolveDay !== track.oResolveDay) track.calObj.resolveDay = track.oResolveDay; } catch (e) {}
  };

  return track;
}

module.exports = { installLedgerDiag, tr7Sums, sumEvents, armDay, classifyBeat, gateOn };
