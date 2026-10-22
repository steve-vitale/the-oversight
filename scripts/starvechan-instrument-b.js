#!/usr/bin/env node
// starvechan-instrument-b.js — starvation-channel instrument for
// sim-deathcause-b (flesh-out loop B, run fleshout-loop-b-20261022T1530Z).
//
// DIAGNOSTIC ONLY. Pure reads + call-through wraps, zero game-state writes,
// zero RNG draws, zero src/js changes, zero policy changes. Answers the
// arm's second named question: the feast verb is exonerated as the
// starvation channel (sim-fragilityfeast-b KILLED-AT-PILOT) — so WHERE does
// the hunger come from? This instrument captures, per run:
//
//   1. MEAL ROWS — one JSON object per villagerMealDay call, captured
//      post-call: {d, vid, ate, drawn, gave, fasting, away, produced,
//      expected, need}. produced/expected are the engine's own
//      v.contribLog[vid] written by the same call; ate/drawn/gave/fasting
//      are the call's return value; need is person.kcalPerDay (2000
//      default). From these: days-below-60% per deceased, ownEat ≈
//      ate - drawn (self-caught/produced first, pantry/pack second), and
//      "who ate what" for every starved villager.
//   2. ROT SCANS — at dawn (Game.sleep wrap, AFTER the engine's call, same
//      phase as the deathcensus dawn sensor): spoiled kcal sitting in the
//      pantry (rotStock) + first-sight tallies (rotLost — a lower bound:
//      fingerprints may collide on identical pieces; reported as a floor)
//      + spoiled kcal EATEN in desperation (drawSpoiled wrap — "rot
//      collected honestly", not lost).
//   3. DEPOSITS — depositPantryPieces wrap, tagged by a returnToVillage
//      window flag: {d, src: 'homecoming'|'other', kcal}. 'other' covers
//      donations, tribute-in, and surplus stocking (honest: not separated).
//   4. HOMECOMINGS — returnToVillage window: {d, pantryBefore/After,
//      givenKcal (via deposit tags in-window), invKcalBefore/After (the
//      scholar's kept-for-the-road food), awayBefore}.
//   5. SCHOLAR MEALS — villageMeal wrap: {d, meal (v.lastPlayerMeal), atHaven}
//      + per-dawn at-haven flag.
//
// finalize(Game, K, KDC) enriches every pclass==='starvation' death row from
// the deathcensus finalize with: trailing-14d meal history of the deceased
// (days below 60% need, fasting days, ownEat vs pantry-drawn split),
// pantry kcal at death (dawn), realm state (nationalLive), trailing
// village inflow/outflow ledger, and the CHANNEL classification per the
// pre-registered taxonomy in evidence/2026-10-22/sim-deathcause-b.md:
//   rot | distribution | homecoming-timing | scholar-from-haul |
//   inflow-failure | unattributed
//
// DET-GATE: all wraps are call-through with pure reads in the gaps — the
// instrumented trajectory must be byte-identical to pristine (proven by
// scripts/test-deathcause-b.js). NEVER consumes Math.random (instrument
// code contains no random call — grep-verified by the proof).
//
// Usage (same env as the sweep):
//   const SC = require('./starvechan-instrument-b');
//   const { K, uninstall } = SC.install(Game);
//   ... runDays ...
//   const out = SC.finalize(Game, K, KDCfin); uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pushErr(K, msg) { try { K.errors.push(String(msg).slice(0, 200)); } catch (e) {} }

function rotFp(it) {
  return String(it.name || '') + '|' + (it.kcalEach || 0) + '|' +
    (it.spoilDay === undefined ? 'x' : it.spoilDay) + '|' + String(it.foodState || '');
}

function rotPreserved(it) {
  var fs = String(it.foodState || '');
  return fs === 'preserved' || fs === 'rendered' || String(it.foodKind || '') === 'pemmican';
}

function install(Game) {
  var K = {
    meals: [],        // per villagerMealDay call
    rotDays: [],       // per dawn: {d, rotStock, rotStockFresh, rotStockPres}
    rotLostByDay: {},  // d -> kcal first-sighted spoiled (floor)
    rotLostFresh: 0, rotLostPres: 0,
    rotEaten: 0,       // spoiled kcal eaten via drawSpoiled (not lost)
    deposits: [],      // {d, src, kcal}
    homecomings: [],   // {d, pantryBefore, pantryAfter, givenKcal, invBefore, invAfter, awayBefore}
    scholarMeals: [],  // {d, meal, atHaven}
    havenDays: [],     // {d, atHaven}
    errors: [],
    _rotSeen: {},
    _dawnSeen: {},
    _inHomecoming: false,
  };
  var wrapped = [];
  function wrap(name, fn) {
    try {
      var o = Game[name];
      if (typeof o !== 'function') return;
      var bound = o.bind(Game);
      Game[name] = fn(bound);
      wrapped.push([name, o, bound]);
    } catch (e) { pushErr(K, 'install:' + name + ': ' + String((e && e.message) || e)); }
  }

  // 1. Meal rows — AFTER the engine's villagerMealDay (its writes to
  //    v.contribLog / v.takes / v.gives have landed; all reads are pure).
  wrap('villagerMealDay', function (oMeal) {
    return function (vid) {
      var r = oMeal.apply(this, arguments);
      try {
        var v = Game.state && Game.state.village;
        var d = dayOf(Game);
        var cl = (v && v.contribLog && v.contribLog[vid]) || {};
        var person = null;
        try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
        var need = (person && person.kcalPerDay) || 2000;
        var away = !!(v && v.away && v.away[vid]);
        K.meals.push({
          d: d, vid: String(vid),
          ate: Math.round((r && r.ate) || 0),
          drawn: Math.round((r && r.drawn) || 0),
          gave: Math.round((r && r.gave) || 0),
          fasting: !!((r && r.fasting)),
          away: away,
          produced: Math.round(cl.produced || 0),
          expected: Math.round(cl.expected || 0),
          need: Math.round(need),
        });
      } catch (e) { pushErr(K, 'meal: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 2. Dawn sensor — AFTER the engine's sleep (same phase as the
  //    deathcensus dawn sensor; double-wrap of a call-through is safe).
  //    Rot scan + scholar at-haven. Dedupe: sleep may fire twice per day.
  wrap('sleep', function (oSleep) {
    return function () {
      var r, threw = null;
      try { r = oSleep.apply(this, arguments); }
      catch (e) { threw = e; }
      try {
        var d = dayOf(Game);
        if (!K._dawnSeen[d]) {
          K._dawnSeen[d] = true;
          var atHaven = false;
          try { atHaven = Game.playerAtHaven ? !!Game.playerAtHaven() : false; } catch (e) {}
          K.havenDays.push({ d: d, atHaven: atHaven });
          var stock = 0, stockF = 0, stockP = 0;
          try {
            var pantry = ((Game.state || {}).village || {}).pantry || [];
            for (var i = 0; i < pantry.length; i++) {
              var it = pantry[i];
              if (!it) continue;
              var spoiled = false;
              try { spoiled = Game.isSpoiled ? !!Game.isSpoiled(it) : false; } catch (e) {}
              if (!spoiled) continue;
              var k = (it.kcalEach || 0) * (it.units || 1);
              stock += k;
              if (rotPreserved(it)) stockP += k; else stockF += k;
              var fp = rotFp(it);
              if (!K._rotSeen[fp]) {
                K._rotSeen[fp] = true;
                K.rotLostByDay[d] = (K.rotLostByDay[d] || 0) + k;
                if (rotPreserved(it)) K.rotLostPres += k; else K.rotLostFresh += k;
              }
            }
          } catch (e) { pushErr(K, 'rotscan: ' + String((e && e.message) || e)); }
          K.rotDays.push({ d: d, rotStock: Math.round(stock),
            rotStockFresh: Math.round(stockF), rotStockPres: Math.round(stockP) });
        }
      } catch (e) { pushErr(K, 'dawn: ' + String((e && e.message) || e)); }
      if (threw) throw threw;
      return r;
    };
  });

  // 2b. Spoiled-eaten — drawSpoiled returns kcal added to the pile.
  wrap('drawSpoiled', function (oDS) {
    return function () {
      var r = oDS.apply(this, arguments);
      try {
        var k = Number(r);
        if (k > 0) K.rotEaten += k;
      } catch (e) { pushErr(K, 'drawspoiled: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 3. Deposits — tag homecoming via the window flag.
  wrap('depositPantryPieces', function (oDPP) {
    return function (v, src) {
      var r = oDPP.apply(this, arguments);
      try {
        var k = ((src && src.kcalEach) || 0) * ((src && src.units) || 1);
        if (k > 0) K.deposits.push({ d: dayOf(Game), src: K._inHomecoming ? 'homecoming' : 'other', kcal: Math.round(k) });
      } catch (e) { pushErr(K, 'deposit: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 4. Homecoming window — flag around the whole call; capture
  //    before/after pantry + scholar pack (pure reads).
  wrap('returnToVillage', function (oRTV) {
    return function () {
      var pantryBefore = 0, invBefore = 0, awayBefore = false, d = dayOf(Game);
      try {
        var vv = (Game.state || {}).village || {};
        pantryBefore = (vv.pantry || []).reduce(function (t, i) { return t + ((i && i.kcalEach) || 0) * ((i && i.units) || 1); }, 0);
        var s = (Game.state || {}).scholar || {};
        invBefore = (s.inventory || []).reduce(function (t, i) { return t + ((i && i.kcalEach) || 0) * ((i && i.units) || 1); }, 0);
        awayBefore = Game.playerAtHaven ? !Game.playerAtHaven() : false;
      } catch (e) {}
      K._inHomecoming = true;
      var r, threw = null;
      try { r = oRTV.apply(this, arguments); }
      catch (e) { threw = e; }
      K._inHomecoming = false;
      try {
        var vv2 = (Game.state || {}).village || {};
        var pantryAfter = (vv2.pantry || []).reduce(function (t, i) { return t + ((i && i.kcalEach) || 0) * ((i && i.units) || 1); }, 0);
        var s2 = (Game.state || {}).scholar || {};
        var invAfter = (s2.inventory || []).reduce(function (t, i) { return t + ((i && i.kcalEach) || 0) * ((i && i.units) || 1); }, 0);
        var given = 0;
        for (var i = 0; i < K.deposits.length; i++) {
          var dp = K.deposits[i];
          if (dp.src === 'homecoming' && dp.d === d && !dp._hcCounted) { dp._hcCounted = true; given += dp.kcal; }
        }
        K.homecomings.push({ d: d, pantryBefore: Math.round(pantryBefore), pantryAfter: Math.round(pantryAfter),
          givenKcal: Math.round(given), invBefore: Math.round(invBefore), invAfter: Math.round(invAfter),
          awayBefore: awayBefore });
      } catch (e) { pushErr(K, 'homecoming: ' + String((e && e.message) || e)); }
      if (threw) throw threw;
      return r;
    };
  });

  // 5. Scholar meals — the pantry draw the parity comment says is NOT in
  //    the collective loop (villageEats adds v.lastPlayerMeal to the burn).
  wrap('villageMeal', function (oVM) {
    return function () {
      var r = oVM.apply(this, arguments);
      try {
        var v = (Game.state || {}).village || {};
        K.scholarMeals.push({ d: dayOf(Game), meal: Math.round(v.lastPlayerMeal || 0),
          atHaven: Game.playerAtHaven ? !!Game.playerAtHaven() : false });
      } catch (e) { pushErr(K, 'scholarmeal: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  function uninstall() {
    for (var i = wrapped.length - 1; i >= 0; i--) {
      try { Game[wrapped[i][0]] = wrapped[i][1]; } catch (e) {}
    }
    wrapped.length = 0;
  }  return { K: K, uninstall: uninstall };
}

// ---------- channel classification ----------

// Inflow window helper: trailing [d0, d1] village food ledger.
function windowLedger(K, d0, d1) {
  var produced = 0, need = 0, ateSum = 0, ateN = 0, gaveSum = 0;
  var meals = K.meals || [];
  for (var i = 0; i < meals.length; i++) {
    var m = meals[i];
    if (m.d < d0 || m.d > d1) continue;
    produced += (m.produced || 0);
    need += (m.need || 2000);
    gaveSum += (m.gave || 0);
    if (!m.fasting) { ateSum += (m.ate / Math.max(1, m.need)); ateN++; }
  }
  var homeDep = 0, otherDep = 0;
  var deps = K.deposits || [];
  for (var j = 0; j < deps.length; j++) {
    var dp = deps[j];
    if (dp.d < d0 || dp.d > d1) continue;
    if (dp.src === 'homecoming') homeDep += dp.kcal; else otherDep += dp.kcal;
  }
  var rotLost = 0;
  for (var dd = d0; dd <= d1; dd++) rotLost += (K.rotLostByDay[dd] || 0);
  var awayN = 0, havenN = 0;
  var hv = K.havenDays || [];
  for (var k = 0; k < hv.length; k++) {
    if (hv[k].d < d0 || hv[k].d > d1) continue;
    havenN++;
    if (!hv[k].atHaven) awayN++;
  }
  var schMeals = K.scholarMeals || [];
  var schAte = 0, schN = 0;
  for (var q = 0; q < schMeals.length; q++) {
    if (schMeals[q].d < d0 || schMeals[q].d > d1) continue;
    schAte += schMeals[q].meal; schN++;
  }
  var hcAfter = 0, hcKept = 0;
  var hcs = K.homecomings || [];
  for (var w = 0; w < hcs.length; w++) {
    if (hcs[w].d >= d1 && hcs[w].d <= d1 + 3) hcAfter += (hcs[w].givenKcal || 0);
    if (hcs[w].d >= d0 && hcs[w].d <= d1) hcKept += Math.max(0, (hcs[w].invAfter || 0));
  }
  return {
    produced: produced, need: need,
    inflow: produced + homeDep + otherDep,
    ateNeedMean: ateN ? ateSum / ateN : null,
    gave: gaveSum,
    homeDep: homeDep, otherDep: otherDep,
    rotLost: rotLost,
    scholarAway: awayN, scholarHavenN: havenN,
    scholarAteNeed: schN ? (schAte / schN) / 2000 : null,
    hcAfter: hcAfter, hcKept: hcKept,
  };
}

function classifyStarvation(row, K, KDCfin) {
  var d = row.day, vid = String(row.vid || '');
  var d0 = Math.max(0, d - 14), d1 = d;
  // The deceased's own trailing meals ("who ate what").
  var own = [];
  var meals = K.meals || [];
  for (var i = 0; i < meals.length; i++) {
    var m = meals[i];
    if (String(m.vid) === vid && m.d >= d0 && m.d <= d1) own.push(m);
  }
  var below60 = 0, fastN = 0, awayOwn = 0, ownEatSum = 0, drawnSum = 0, prodSum = 0;
  for (var j = 0; j < own.length; j++) {
    var om = own[j];
    if (!om.fasting && om.ate < om.need * 0.6) below60++;
    if (om.fasting) fastN++;
    if (om.away) awayOwn++;
    ownEatSum += Math.max(0, om.ate - om.drawn);
    drawnSum += om.drawn;
    prodSum += om.produced;
  }
  var ownCoverage = own.length ? (ownEatSum + drawnSum) / (own.length * 2000) : null;
  // Pantry at death (dawn of death day) + realm.
  var panAtDeath = null, nationalLive = null, panTrail = [];
  var daily = (KDCfin && KDCfin.daily) || [];
  for (var k = 0; k < daily.length; k++) {
    var dr = daily[k];
    if (dr.day >= d0 && dr.day <= d1) panTrail.push({ d: dr.day, kcal: dr.pantryKcal });
    if (dr.day === d) { panAtDeath = dr.pantryKcal; nationalLive = dr.nationalLive; }
  }
  var led = windowLedger(K, d0, d1);
  // Pre-registered channel booleans.
  var flags = [];
  if (led.inflow > 0 && led.rotLost >= 0.2 * led.inflow && panAtDeath !== null && panAtDeath < 5000) flags.push('rot');
  var decCov = own.length ? (ownEatSum + drawnSum) / own.reduce(function (t, o) { return t + (o.need || 2000); }, 0) : null;
  if (decCov !== null && decCov < 0.6 && (led.ateNeedMean !== null && led.ateNeedMean >= 0.9 || (panAtDeath !== null && panAtDeath >= 15000))) flags.push('distribution');
  if (led.scholarAway >= 10 && (led.hcAfter >= 5000 || led.hcKept >= 4000)) flags.push('homecoming-timing');
  if (led.scholarAway >= 7 && led.scholarAteNeed !== null && led.scholarAteNeed >= 1.0 && decCov !== null && decCov < 0.6) flags.push('scholar-from-haul');
  if (led.need > 0 && led.inflow < 0.9 * led.need && panAtDeath !== null && panAtDeath < 5000) flags.push('inflow-failure');
  // Precedence: rot > distribution > homecoming-timing > scholar-from-haul > inflow-failure.
  var order = ['rot', 'distribution', 'homecoming-timing', 'scholar-from-haul', 'inflow-failure'];
  var primary = 'unattributed';
  for (var p = 0; p < order.length; p++) {
    if (flags.indexOf(order[p]) >= 0) { primary = order[p]; break; }
  }
  return {
    channel: primary,
    channelFlags: flags,
    daysBelow60: below60,
    fastingDays: fastN,
    awayDaysOwn: awayOwn,
    mealDays: own.length,
    ownEatMean: own.length ? Math.round(ownEatSum / own.length) : null,
    pantryDrawnMean: own.length ? Math.round(drawnSum / own.length) : null,
    producedMean: own.length ? Math.round(prodSum / own.length) : null,
    deceasedCoverage: decCov === null ? null : Math.round(decCov * 100) / 100,
    villageCoverage: led.ateNeedMean === null ? null : Math.round(led.ateNeedMean * 100) / 100,
    pantryAtDeath: panAtDeath,
    nationalLive: nationalLive,
    pantryTrail: panTrail,
    trailing: {
      inflow: Math.round(led.inflow), need: Math.round(led.need),
      produced: Math.round(led.produced), homeDep: Math.round(led.homeDep),
      otherDep: Math.round(led.otherDep), gave: Math.round(led.gave),
      rotLost: Math.round(led.rotLost), rotEatenRun: Math.round(K.rotEaten || 0),
      scholarAway: led.scholarAway, scholarHavenDays: led.scholarHavenN,
      scholarAteNeed: led.scholarAteNeed === null ? null : Math.round(led.scholarAteNeed * 100) / 100,
      hcAfter3d: Math.round(led.hcAfter), hcKeptInWindow: Math.round(led.hcKept),
    },
  };
}

function finalize(Game, K, KDCfin) {
  var out = {
    errors: K.errors || [],
    rotLostFresh: Math.round(K.rotLostFresh || 0),
    rotLostPres: Math.round(K.rotLostPres || 0),
    rotEaten: Math.round(K.rotEaten || 0),
    mealRowCount: (K.meals || []).length,
    depositCount: (K.deposits || []).length,
    homecomingCount: (K.homecomings || []).length,
    scholarMealCount: (K.scholarMeals || []).length,
    starv: [],
    // lean aggregates (full rows would bloat the JSON ×16)
    deposits: K.deposits || [],
    homecomings: K.homecomings || [],
    scholarMeals: K.scholarMeals || [],
    havenDays: K.havenDays || [],
    rotDays: K.rotDays || [],
    meals: K.meals || [],
  };
  var deaths = (KDCfin && KDCfin.deaths) || [];
  for (var i = 0; i < deaths.length; i++) {
    var r = deaths[i];
    if (r.pclass !== 'starvation') continue;
    if (r.kind !== 'person' && r.kind !== 'villager') continue;
    var en = classifyStarvation(r, K, KDCfin);
    en.day = r.day; en.who = r.who; en.vid = r.vid; en.cause = r.cause;
    out.starv.push(en);
  }
  return out;
}

module.exports = {
  install: install,
  finalize: finalize,
  classifyStarvation: classifyStarvation,
  windowLedger: windowLedger,
};
