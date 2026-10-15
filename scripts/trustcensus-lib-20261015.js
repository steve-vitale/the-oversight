#!/usr/bin/env node
// scripts/trustcensus-lib-20261015.js — TRUST-LEDGER TRAJECTORY CENSUS
// (loop B ARM 2, 2026-10-15, food-economy axis; sibling diagnostic for ARM 1
// sim-trustguard, sim-findings #329's lever).
//
// INSTRUMENT ONLY — zero src/js changes. Read-only harness-side census over
// leadcourt/belongseek that answers whether the guard's firing window EXISTS
// on courtship roads: when the scholar's ledger crosses the -5000 bar, what
// the takes/gives composition was, what precedes it, and whether the village
// recovers.
//
// MECHANICS (read from src/js as-is, cited — NO food-distribution canon doc
// exists, stated per the canon rule):
//   - game.js:14575-14579 (takeFromPantry, single take): net = v.gives[vid] -
//     v.takes[vid] (CUMULATIVE lifetime gross); if (net < -5000) trust -2.
//     THE trust-drop bar. THEY NOTICE: "Taking without giving lowers trust."
//   - game.js:14478-14482 (takeFromPantryBulk): same net vs
//     -Math.min(5000, pantryKcalLive) — a dynamic bar, min 1000.
//   - justice.js:101-106 (justiceHeat): same cumulative net; net < -15000 ->
//     heat +25, net < -5000 -> heat +10 (moot/confrontation ladder fuel).
//   - game.js:27094-27155 (freeloaderTick): trailing-7d NET RATE
//     (takeRate7 - giveRate7, kcal/day) vs fairShare — the EXILE clock, not
//     the trust bar. Different system, different window; the census records
//     both so the guard window is not conflated.
//   - game.js:14171-14230 (takeHist/giveHist + recordTakeHist/recordGiveHist):
//     DATED voluntary-take/give histories, 7-day window, pruned on write.
//     The communal evening meal (game.js:26622, capdraw2) writes v.takes[vid]
//     WITHOUT a takeHist entry (r8: "the village feeds you, then the ledger
//     reads its own feeding as your hoarding" — deliberate). So the census
//     decomposes cumulative takes into VOLUNTARY (dated) vs MEAL (undated).
//   - game.js:26641 (villageMeal): trust < 30 -> "(Half ration — they don't
//     trust you yet.)" — the half-ration beat the census flags.
//   - ledger.js:838-844 (mantleBecome): succession zeroes v.takes/v.gives and
//     resets takeHist/giveHist for the new bearer — fresh book per bearer.
//   - game.js:28823 (sleep): villageMeal() runs the scholar's bowl; the
//     overnight calories.resolveDay emits the STARVING warning (the
//     distrhalf instrument's scholar-hunger signal, reused here).
//
// ROWS: one per completed game-day (built at the next dawn from the night +
// meal records, which carry the day label at wrap time). Each row:
//   {day, vid, trust, meanTrust, cumTakes, cumGives, cumNet,
//    tr7Takes, tr7Gives, tr7Net, volTakes, volGives, mealTakes, undatedGives,
//    nTakeDays, maxDayTake, nGiveDays, hunger, halfRation, mealTaken,
//    hasDatedHist, succession}
// CROSSINGS (first day in row order):
//   CUM: cumNet < -5000  (the actual trust-drop bar, game.js:14579)
//   TR7: tr7Net < -5000  (the brief's stated window, dated voluntary flows)
//   JUSTICE: cumNet < -15000 (heat +25 tier, justice.js:104)
// Attribution (the binding PRIMARY): a crossing is ATTRIBUTED when its
// composition is fully named from the same ledger — voluntary takes (dated),
// meal takes (cumulative minus dated), gives (dated). UNATTRIBUTED when the
// dated histories are missing while the cumulative book is non-zero
// (mystery takes — the r7 blank), when a row is missing, or on NaN.
//
// GATE: TRUSTCENSUS=1 (default off). Gate off -> install returns a stub that
// wraps NOTHING (byte-identical by construction). The wraps are call-through
// (villageMeal say-capture restored in finally, resolveDay + say pure
// pass-through); trajectory-neutrality with the gate ON is proven by the
// det-gate in scripts/test-trustcensus-20261015.js PART B.
//
// Driver contract: after loadGame+setupGame, call installTrustCensus(Game),
// then call track.dawn(Game) at the START of the policy.daily wrapper (pure
// reads; builds rows for completed nights). Call track.finalize() after
// runDays, then track.uninstall().
'use strict';

function gateOn() { return process.env.TRUSTCENSUS === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarVid(Game) {
  try {
    const s = Game.state.scholar || {};
    return s.villagerId || Game.villagerId || null;
  } catch (e) { return null; }
}

// tr7Sums(hist, day) — pure. Trailing-7-day sums over the engine's exact
// window (game.js takeRate7/giveRate7: e.day >= day-6). Returns
// {sum, nDays, maxDay} — the binge-vs-drip composition.
function tr7Sums(hist, day) {
  let sum = 0; const byDay = {};
  for (const e of (hist || [])) {
    if (!e || typeof e.kcal !== 'number' || !isFinite(e.kcal)) continue;
    const d = e.day | 0;
    if (d < day - 6 || d > day) continue;
    sum += e.kcal; byDay[d] = (byDay[d] || 0) + e.kcal;
  }
  const ds = Object.keys(byDay);
  let maxDay = 0;
  for (const d of ds) if (byDay[d] > maxDay) maxDay = byDay[d];
  return { sum, nDays: ds.length, maxDay };
}

// detectCrossings(rows) — pure. rows in day order. Strict < on every bar
// (the engine's comparisons are strict: `net < -5000`).
function detectCrossings(rows) {
  let cum = null, tr7 = null, justice = null;
  for (const r of rows) {
    if (!cum && typeof r.cumNet === 'number' && r.cumNet < -5000) cum = r;
    if (!tr7 && typeof r.tr7Net === 'number' && r.tr7Net < -5000) tr7 = r;
    if (!justice && typeof r.cumNet === 'number' && r.cumNet < -15000) justice = r;
    if (cum && tr7 && justice) break;
  }
  return { cum, tr7, justice };
}

function isBadNum(x) { return typeof x !== 'number' || !isFinite(x); }

function installTrustCensus(Game) {
  if (!gateOn()) {
    return {
      on: false, rows: [], nights: [], meals: {}, sayLog: [],
      dawn() {}, finalize() { return { on: false, rows: 0 }; }, uninstall() {},
    };
  }
  const track = {
    on: true, rows: [], rowed: {}, nights: [], meals: {}, sayLog: [],
    volTakes: {}, volGives: {}, adds: {},
    prevVid: null, successions: 0, nDupNights: 0, nightsRowed: 0,
    instrErrors: [],
    oVillageMeal: Game.villageMeal, oSay: Game.say,
    calObj: null, oResolveDay: null,
  };
  const err = (where, e) => {
    try { track.instrErrors.push(where + ': ' + (e && e.message)); } catch (e2) {}
  };

  // ---- scholar's evening meal (the trust-throttled bowl) ----
  // Call-through; captures the half-ration beat with a temporary say capture
  // restored in finally (the distrhalf-lib pattern). Composes with betrayal.js's
  // villageMeal wrap: we wrap whatever is installed at install time.
  if (typeof track.oVillageMeal === 'function') {
    Game.villageMeal = function () {
      const v = this.state.village || {}, scholar = this.state.scholar || {};
      const day = scholar.day || 0;
      let trust = 10;
      try {
        const sid = scholar.villagerId || this.villagerId;
        trust = (v.trust && v.trust[sid] !== undefined) ? v.trust[sid] : 10;
      } catch (e) {}
      const beats = [];
      const oSay = this.say;
      this.say = function (t) {
        try { beats.push(String(t)); } catch (e) {}
        return oSay.apply(this, arguments);
      };
      let out;
      try { out = track.oVillageMeal.apply(this, arguments); }
      catch (e) { err('villageMeal', e); throw e; }
      finally { this.say = oSay; }
      try {
        const text = beats.join('\n');
        track.meals[day] = {
          day, trust,
          halfRation: /Half ration/.test(text),
          taken: (v.lastPlayerMeal || 0),
          beats: text.slice(0, 1200),
        };
      } catch (e) { err('meal-record', e); }
      return out;
    };
  }

  // ---- overnight scholar body (the STARVING signal) ----
  try {
    const calObj = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).calories || null;
    if (calObj && typeof calObj.resolveDay === 'function') {
      track.calObj = calObj;
      track.oResolveDay = calObj.resolveDay;
      calObj.resolveDay = function (scholar, village, opts) {
        const day = (scholar && scholar.day) || 0;
        let res;
        try { res = track.oResolveDay.apply(this, arguments); }
        catch (e) { err('resolveDay', e); throw e; }
        try {
          const starving = (res.warnings || []).some(w => String(w).indexOf('STARVING') === 0);
          track.nights.push({ day, starving });
        } catch (e) { err('night-record', e); }
        return res;
      };
    }
  } catch (e) { err('resolveDay-install', e); }

  // ---- say log (sense-testing excerpts around crossings; capped) ----
  try {
    const oSay = Game.say;
    if (typeof oSay === 'function') {
      Game.say = function (t) {
        try {
          if (track.sayLog.length < 300) track.sayLog.push({ day: gday(Game), text: String(t).slice(0, 300) });
        } catch (e) {}
        return oSay.apply(this, arguments);
      };
    }
  } catch (e) { err('say-install', e); }

  function buildRow(G, day) {
    const v = (G.state && G.state.village) || {};
    const vid = scholarVid(G);
    if (vid == null) { err('row', new Error('no scholar vid on day ' + day)); return; }
    if (track.prevVid !== null && track.prevVid !== vid) {
      // Succession: the engine zeroed the new bearer's book (ledger.js:841-844).
      track.successions++;
    }
    track.prevVid = vid;
    const trust = (v.trust && v.trust[vid] !== undefined) ? v.trust[vid] : 10;
    let meanTrust = null;
    try {
      const ts = Object.values(v.trust || {}).filter(x => typeof x === 'number');
      if (ts.length) meanTrust = ts.reduce((a, b) => a + b, 0) / ts.length;
    } catch (e) {}
    const cumTakes = ((v.takes || {})[vid]) || 0;
    const cumGives = ((v.gives || {})[vid]) || 0;
    const takeHist = (v.takeHist || {})[vid];
    const giveHist = (v.giveHist || {})[vid];
    const t7 = tr7Sums(takeHist, day);
    const g7 = tr7Sums(giveHist, day);
    // Instrument-side lifetime voluntary totals: accumulate the dated entries
    // for THIS day (rows build in day order; entries carry their day label).
    // Communal meals bypass recordTakeHist (game.js:26622 + r8 comment), so
    // mealTakes = cumulative - dated-voluntary names the meal component.
    // DUPLICATE NIGHTS (frozen day: two sleeps, one day label): the row is
    // REBUILT in place with the later ledger state — strictly more complete.
    // The previous accumulation is subtracted first (tracked per vid in
    // track.adds), so the totals never double-count.
    const prevAdd = track.adds[day];
    if (prevAdd) {
      track.nDupNights++;
      track.volTakes[prevAdd.vid] = (track.volTakes[prevAdd.vid] || 0) - (prevAdd.t || 0);
      track.volGives[prevAdd.vid] = (track.volGives[prevAdd.vid] || 0) - (prevAdd.g || 0);
    }
    let vt = track.volTakes[vid] || 0, vg = track.volGives[vid] || 0;
    let addT = 0, addG = 0;
    try {
      for (const e of (takeHist || [])) if (e && (e.day | 0) === (day | 0) && typeof e.kcal === 'number') { vt += e.kcal; addT += e.kcal; }
      for (const e of (giveHist || [])) if (e && (e.day | 0) === (day | 0) && typeof e.kcal === 'number') { vg += e.kcal; addG += e.kcal; }
    } catch (e) { err('vol-accum', e); }
    track.volTakes[vid] = vt; track.volGives[vid] = vg;
    track.adds[day] = { vid, t: addT, g: addG };
    const mealTakes = cumTakes - vt;
    // Undated gives: haven-role work credits (game.js:6498/6672) write
    // v.gives WITHOUT a giveHist entry. For the scholar this should be ~0
    // (assignments are villager-side) — the census measures it, not assumes.
    const undatedGives = cumGives - vg;
    const night = track.nights.filter(n => n.day === day).pop();
    const meal = track.meals[day] || null;
    // hunger ORs across duplicate nights: starving on either night of a
    // frozen day is a hunger-day.
    const prevRow = track.rowed[day] != null ? track.rows[track.rowed[day]] : null;
    const hunger = !!(night && night.starving) || !!(prevRow && prevRow.hunger);
    const row = {
      day, vid: String(vid),
      trust, meanTrust: meanTrust == null ? null : +meanTrust.toFixed(1),
      cumTakes, cumGives, cumNet: cumGives - cumTakes,
      tr7Takes: t7.sum, tr7Gives: g7.sum, tr7Net: g7.sum - t7.sum,
      volTakes: vt, volGives: vg, mealTakes, undatedGives,
      nTakeDays: t7.nDays, maxDayTake: t7.maxDay, nGiveDays: g7.nDays,
      hunger,
      halfRation: !!(meal && meal.halfRation),
      mealTaken: meal ? meal.taken : null,
      hasDatedHist: Array.isArray(takeHist),
      succession: track.successions > 0 && track.rows.length > 0 &&
        track.rows[track.rows.length - 1].vid !== String(vid),
    };
    if (track.rowed[day] != null) track.rows[track.rowed[day]] = row;
    else { track.rowed[day] = track.rows.length; track.rows.push(row); }
  }

  // dawn(Game) — called by the DRIVER at the START of the policy.daily
  // wrapper (pure reads). Builds one row per recorded night, in order; a
  // duplicate night (frozen day) REBUILDS its day's row in place with the
  // later ledger state (see buildRow). nightsRowed ensures each night is
  // consumed exactly once — rebuilds never touch already-pruned history.
  track.dawn = function (G) {
    if (!track.on) return;
    try {
      for (let i = track.nightsRowed || 0; i < track.nights.length; i++) {
        buildRow(G, track.nights[i].day);
      }
      track.nightsRowed = track.nights.length;
    } catch (e) { err('dawn', e); }
  };

  function attributeCrossing(row, kind) {
    // The binding PRIMARY: >=90% of -5000 crossings attributed to a
    // takes/gives composition on the same ledger (no silent crossings).
    if (!row) return { crossed: false };
    const silent =
      isBadNum(row.cumTakes) || isBadNum(row.cumGives) ||
      isBadNum(row.tr7Takes) || isBadNum(row.tr7Gives) ||
      isBadNum(row.mealTakes) || isBadNum(row.undatedGives) ||
      (!row.hasDatedHist && (row.cumTakes > 0 || row.cumGives > 0)) ||
      (row.cumTakes > 0 && row.volTakes === 0 && row.mealTakes === 0);
    return {
      crossed: true, kind,
      day: row.day, vid: row.vid, trust: row.trust,
      cumTakes: row.cumTakes, cumGives: row.cumGives, cumNet: row.cumNet,
      volTakes: row.volTakes, mealTakes: row.mealTakes,
      volGives: row.volGives, undatedGives: row.undatedGives,
      tr7Takes: row.tr7Takes, tr7Gives: row.tr7Gives, tr7Net: row.tr7Net,
      nTakeDays: row.nTakeDays, maxDayTake: row.maxDayTake,
      mealShare: row.cumTakes > 0 ? +(row.mealTakes / row.cumTakes).toFixed(3) : null,
      attributed: !silent, silentReason: silent ? 'mystery-takes/no-dated-history/NaN' : null,
    };
  }

  track.finalize = function () {
    const rows = track.rows.slice().sort((a, b) => a.day - b.day);
    const x = detectCrossings(rows);
    const aCum = attributeCrossing(x.cum, 'CUM');
    const aTr7 = attributeCrossing(x.tr7, 'TR7');
    const aJus = attributeCrossing(x.justice, 'JUSTICE');
    const out = {
      on: true, nRows: rows.length, nNights: track.nights.length,
      nDupNights: track.nDupNights,
      successions: track.successions,
      instrErrors: track.instrErrors.slice(),
      crossings: { cum: aCum, tr7: aTr7, justice: aJus },
      rows,
    };
    // Post-crossing trajectory (recovery + hunger before/after), anchored on
    // the CUM crossing — the bar that actually drops trust.
    if (aCum.crossed) {
      const cd = aCum.day, t0 = aCum.trust;
      const after = rows.filter(r => r.day > cd);
      const before = rows.filter(r => r.day < cd);
      out.post = {
        crossDay: cd, trustAtCross: t0,
        halfRationDaysAfter: after.filter(r => r.halfRation).length,
        hungerDaysBefore: before.filter(r => r.hunger).length,
        hungerDaysAfter: after.filter(r => r.hunger).length,
        trustRecovered: after.some(r => r.trust > t0),
        maxTrustAfter: after.length ? Math.max.apply(null, after.map(r => r.trust)) : null,
        // Recovery "how": dated gives after the crossing (donations are the
        // scholar's only give channel — trustdelta found them ~absent).
        // volGives is the instrument-side lifetime total, so the after-crossing
        // give kcal is the delta between consecutive rows (vid changes reset
        // the book; a drop is clamped, never negative).
        giveKcalAfter: after.reduce((t, r, i) => {
          const prev = i === 0 ? rows[rows.indexOf(after[0]) - 1] : after[i - 1];
          const base = prev ? (prev.volGives || 0) : 0;
          return t + Math.max(0, (r.volGives || 0) - base);
        }, 0),
        nDaysAfter: after.length,
      };
    }
    // Sense-testing: say beats on the crossing day ±3 (capped).
    if (aCum.crossed) {
      const cd = aCum.day;
      out.crossingBeats = track.sayLog
        .filter(b => b.day >= cd - 3 && b.day <= cd + 3)
        .slice(-60).map(b => `[d${b.day}] ${b.text}`);
    } else {
      out.crossingBeats = [];
    }
    return out;
  };

  track.uninstall = function () {
    try { if (track.oVillageMeal && Game.villageMeal !== track.oVillageMeal) Game.villageMeal = track.oVillageMeal; } catch (e) {}
    try { if (track.oSay && Game.say !== track.oSay) Game.say = track.oSay; } catch (e) {}
    try { if (track.calObj && track.oResolveDay && track.calObj.resolveDay !== track.oResolveDay) track.calObj.resolveDay = track.oResolveDay; } catch (e) {}
  };

  return track;
}

module.exports = { installTrustCensus, tr7Sums, detectCrossings, gateOn };
