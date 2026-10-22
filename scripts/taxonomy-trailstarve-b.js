// taxonomy-trailstarve-b.js — EXTENDED starvation-channel taxonomy classifier (OFFLINE).
//
// Backlog #815: the sim-deathcause-b census named 233/233 deaths but the
// starvation CHANNEL taxonomy failed (5/13 named, bar >=95%). The miss was a
// TAXONOMY miss, not an instrument failure: the pre-registered channel list
// had no name for the corpus's dominant pattern — trail-starvation (away +
// production cliff + pack buffer, 6/13) — and no name for wound-compounded
// starvation (the last-hit amplifier). This module develops the extended
// taxonomy OFFLINE (zero new sims) against the existing meal-row corpus at
// evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs + _summary.json).
//
// Extended taxonomy (each starvation death gets {channel, channelFlags};
// flags = every channel whose boolean holds, primary by precedence):
//   1. rot                    — trailing rot-lost >= 20% of trailing inflow AND pantry < 5000
//   2. trail-starvation       — away-majority window + expedition production CLIFF + pack draws,
//                               pantry AMPLE at death (the food was at the fire; the villager was on the trail)
//   3. distribution           — deceased's coverage < 0.6 while village mean >= 0.9 OR pantry >= 15000
//   4. homecoming-timing      — scholar away >= 10/14d AND (homecoming deposit >= 5000 within 3d after death
//                               OR scholar kept >= 4000 while village hungry)
//   5. scholar-from-haul      — scholar away >= 7/14d AND scholar ate/need >= 1.0 while deceased < 0.6
//   6. inflow-failure (net)   — pantry crashed AND village inflow <= 1.05 x need over the window
//                               (covers BOTH the famine shape: inflow ~0.7-0.8x need, and the thin-pool
//                               shape: inflow ~1.0x need but the pool drains under fixed costs)
//   7. wound-compounded       — wound/hurting beat naming the deceased within 3d of death; ALWAYS
//                               attached as a flag when present (the cross-cutting amplifier), primary only
//                               when no other channel holds
//   8. unattributed           — honest miss
//
// Precedence: rot > trail-starvation > distribution > homecoming-timing >
//             scholar-from-haul > inflow-failure > wound-compounded > unattributed.
//
// The taxonomy is an INSTRUMENT, not canon: it measures the engine's food
// flows (villageEats -> villagerMealDay per-person draws, pantryDraw,
// depositPantryPieces homecoming split, hurtFromStarvation) as the code
// implements them. No canon doc covers village-death attribution; the
// channel names are measurement vocabulary, not design claims.
//
// Pure data processing: no game code, no RNG, no sims. Deterministic —
// identical input yields byte-identical output.

'use strict';

function mean(a) {
  if (!a.length) return null;
  var t = 0;
  for (var i = 0; i < a.length; i++) t += a[i];
  return t / a.length;
}
function sum(a) { var t = 0; for (var i = 0; i < a.length; i++) t += a[i]; return t; }

// Pantry at death: NEAREST dawn <= death day (metric review #5 of
// sim-deathcause-b: the dawn series has gap days; exact-day join left
// gap-day deaths at panAtDeath=null). Also returns the dawn trail.
function pantrySeries(daily, d0, d1) {
  var trail = [];
  var rows = (daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.day >= d0 && r.day <= d1 && r.pantryKcal !== null && r.pantryKcal !== undefined) {
      trail.push({ d: r.day, kcal: r.pantryKcal });
    }
  }
  return trail;
}

// The deceased's own trailing meal rows ("who ate what").
function ownRows(K, vid, d0, d1) {
  var out = [];
  var meals = (K && K.meals) || [];
  for (var i = 0; i < meals.length; i++) {
    var m = meals[i];
    if (String(m.vid) === vid && m.d >= d0 && m.d <= d1) out.push(m);
  }
  out.sort(function (a, b) { return a.d - b.d; });
  return out;
}

// Wound beat naming the deceased within [d-3, d] in the retained say lines.
// NOTE (corpus limitation): the corpus keeps death-day and loss-day say
// lines only, so this detector's recall is limited to wound beats voiced on
// those days. A wound known from a live transcript read but voiced on a
// non-retained day will NOT be flagged here — documented per-case, not hidden.
function woundBeatNearDeath(corpus, who, d) {
  var name = String(who || '').split(' ')[0].toLowerCase();
  if (!name) return { hit: false, lines: [] };
  var woundRe = /mauled|hurting|wound|healer|\bHP\b|bleed|injured|bandage|fracture/i;
  var lines = corpus.deathDayLines || [];
  var hits = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    if (l.d < d - 3 || l.d > d) continue;
    var text = String(l.line || '');
    if (text.toLowerCase().indexOf(name) >= 0 && woundRe.test(text)) hits.push({ d: l.d, line: text });
  }
  return { hit: hits.length > 0, lines: hits };
}

function classifyExtended(death, corpus) {
  var errors = [];
  function err(msg) { errors.push(msg); }
  var d = death.day, vid = String(death.vid || ''), who = death.who || '';
  var d0 = Math.max(0, d - 14), d1 = d;
  var K = (corpus && corpus.starvechan) || {};

  // --- the deceased's own window ---
  var own = ownRows(K, vid, d0, d1);
  var mealN = own.length;
  var awayN = 0, below60 = 0, fastN = 0;
  var ownEatSum = 0, drawnSum = 0, needSum = 0;
  for (var j = 0; j < own.length; j++) {
    var om = own[j];
    if (om.away) awayN++;
    if (om.fasting) fastN++;
    else if ((om.ate || 0) < (om.need || 2000) * 0.6) below60++;
    ownEatSum += Math.max(0, (om.ate || 0) - (om.drawn || 0));
    drawnSum += (om.drawn || 0);
    needSum += (om.need || 2000);
  }
  var decCov = needSum > 0 ? (ownEatSum + drawnSum) / needSum : null;

  // Production cliff: compare the pre-collapse base (rows before the last 3)
  // against the last 2-3 days. An 80-95% overnight collapse on the trail is
  // the trail-starvation signature (Theo 4640->293, Zinaida 2756->769,
  // Irving 2085->382, Juan 2130->453).
  var preRows = mealN > 3 ? own.slice(0, mealN - 3) : own.slice(0, Math.max(1, Math.floor(mealN / 2)));
  var lateRows = own.slice(-Math.min(3, mealN));
  var preMean = mean(preRows.map(function (m) { return m.produced || 0; }));
  var late2Mean = mean(own.slice(-Math.min(2, mealN)).map(function (m) { return m.produced || 0; }));
  var late3Mean = mean(lateRows.map(function (m) { return m.produced || 0; }));
  var cliffRatio = (preMean && preMean > 0 && late2Mean !== null && late3Mean !== null)
    ? Math.min(late2Mean, late3Mean) / preMean : null;
  var cliff = cliffRatio !== null && preMean >= 1000 && cliffRatio <= 0.35;

  // Pack draws: away rows' drawn in the last 3 days are pack-buffer draws
  // (away villagers draw from pack, not pantry — metric review #6).
  var last3Away = lateRows.filter(function (m) { return m.away; });
  var last3AwayDrawnMean = mean(last3Away.map(function (m) { return m.drawn || 0; }));
  var packDraws = last3Away.length > 0 && last3AwayDrawnMean !== null && last3AwayDrawnMean >= 500;

  // --- pantry at death (nearest-dawn join) + trail ---
  var trail = pantrySeries((corpus && corpus.daily) || [], d0, d1);
  var panAtDeath = null;
  for (var t = 0; t < trail.length; t++) {
    if (trail[t].d <= d) panAtDeath = trail[t].kcal;
  }
  var panAmple = panAtDeath !== null && panAtDeath >= 8000;
  var firstPan = trail.length ? trail[0].kcal : null;
  var lastPan = trail.length ? trail[trail.length - 1].kcal : null;
  var panTrailDecline = firstPan !== null && lastPan !== null && firstPan >= 3000 && lastPan < 0.5 * firstPan;
  var panCrashed = (panAtDeath !== null && panAtDeath < 5000) || panTrailDecline;

  // --- village window ledger ---
  var meals = K.meals || [];
  var vProd = 0, vNeed = 0, vAte = 0, vAteSum = 0, vAteN = 0;
  for (var v = 0; v < meals.length; v++) {
    var m = meals[v];
    if (m.d < d0 || m.d > d1) continue;
    vProd += (m.produced || 0);
    vNeed += (m.need || 2000);
    vAte += (m.ate || 0);
    if (!m.fasting) { vAteSum += (m.ate || 0) / Math.max(1, (m.need || 2000)); vAteN++; }
  }
  var deposits = K.deposits || [];
  var depKcal = 0;
  for (var dp = 0; dp < deposits.length; dp++) {
    if (deposits[dp].d >= d0 && deposits[dp].d <= d1) depKcal += (deposits[dp].kcal || 0);
  }
  var villageInflow = vProd + depKcal;
  var villageNeed = vNeed;
  var villageCoverage = vAteN ? vAteSum / vAteN : null;

  // Rot: the sweepSpoiled-phase sensor bug (sim-deathcause-b metric review #4)
  // means the corpus rot series reads ~0 while the game narrates rot. The
  // boolean is honest to the instrument: it fires when the sensor SAW rot.
  var rotStockFresh = 0;
  var rotDays = K.rotDays || [];
  for (var rd = 0; rd < rotDays.length; rd++) {
    if (rotDays[rd].d >= d0 && rotDays[rd].d <= d1) rotStockFresh += (rotDays[rd].rotStockFresh || 0);
  }

  // Scholar window (homecoming-timing / scholar-from-haul inputs).
  var hv = K.havenDays || [];
  var scholarAway = 0, scholarHavenN = 0;
  for (var hvI = 0; hvI < hv.length; hvI++) {
    if (hv[hvI].d < d0 || hv[hvI].d > d1) continue;
    scholarHavenN++;
    if (!hv[hvI].atHaven) scholarAway++;
  }
  var schMeals = K.scholarMeals || [];
  var schAte = 0, schN = 0;
  for (var sm = 0; sm < schMeals.length; sm++) {
    if (schMeals[sm].d < d0 || schMeals[sm].d > d1) continue;
    schAte += (schMeals[sm].meal || 0); schN++;
  }
  var scholarAteNeed = schN ? (schAte / schN) / 2000 : null;
  var hcs = K.homecomings || [];
  var hcAfter = 0, hcKept = 0;
  for (var hc = 0; hc < hcs.length; hc++) {
    if (hcs[hc].d >= d1 && hcs[hc].d <= d1 + 3) hcAfter += (hcs[hc].givenKcal || 0);
    if (hcs[hc].d >= d0 && hcs[hc].d <= d1) hcKept += Math.max(0, (hcs[hc].invAfter || 0));
  }

  var wb = woundBeatNearDeath(corpus, who, d);

  // --- channel booleans ---
  var flags = [];
  var diag = {
    mealDays: mealN, awayDaysOwn: awayN, fastingDays: fastN, daysBelow60: below60,
    deceasedCoverage: decCov === null ? null : Math.round(decCov * 1000) / 1000,
    villageCoverage: villageCoverage === null ? null : Math.round(villageCoverage * 1000) / 1000,
    preCollapseProdMean: preMean === null ? null : Math.round(preMean),
    lateProdMean: late3Mean === null ? null : Math.round(late3Mean),
    cliffRatio: cliffRatio === null ? null : Math.round(cliffRatio * 1000) / 1000,
    cliff: cliff,
    last3AwayRows: last3Away.length,
    last3AwayDrawnMean: last3AwayDrawnMean === null ? null : Math.round(last3AwayDrawnMean),
    packDraws: packDraws,
    pantryAtDeath: panAtDeath, panAmple: panAmple, panCrashed: panCrashed,
    panTrailFirst: firstPan, panTrailLast: lastPan, panTrailDecline: panTrailDecline,
    villageInflow: Math.round(villageInflow), villageNeed: Math.round(villageNeed),
    villageAte: Math.round(vAte),
    inflowNeedRatio: villageNeed > 0 ? Math.round((villageInflow / villageNeed) * 1000) / 1000 : null,
    rotStockFresh: Math.round(rotStockFresh),
    scholarAway: scholarAway, scholarAteNeed: scholarAteNeed === null ? null : Math.round(scholarAteNeed * 1000) / 1000,
    hcAfter3d: Math.round(hcAfter), hcKeptInWindow: Math.round(hcKept),
    woundBeat: wb.hit, woundLines: wb.lines,
  };

  if (villageInflow > 0 && rotStockFresh >= 0.2 * villageInflow && panAtDeath !== null && panAtDeath < 5000) flags.push('rot');
  if (mealN >= 4 && awayN / mealN >= 0.5 && cliff && packDraws && panAmple && below60 >= 1) flags.push('trail-starvation');
  if (decCov !== null && decCov < 0.6 &&
      ((villageCoverage !== null && villageCoverage >= 0.9) || (panAtDeath !== null && panAtDeath >= 15000))) flags.push('distribution');
  if (scholarAway >= 10 && (hcAfter >= 5000 || hcKept >= 4000)) flags.push('homecoming-timing');
  if (scholarAway >= 7 && scholarAteNeed !== null && scholarAteNeed >= 1.0 && decCov !== null && decCov < 0.6) flags.push('scholar-from-haul');
  if (panCrashed && villageNeed > 0 && villageInflow <= 1.05 * villageNeed) flags.push('inflow-failure');
  if (wb.hit) flags.push('wound-compounded');

  // Precedence: rot > trail-starvation > distribution > homecoming-timing >
  //             scholar-from-haul > inflow-failure > wound-compounded > unattributed.
  // wound-compounded is the cross-cutting amplifier: it rides as a flag on
  // any primary, and is primary only when it is the whole story.
  var order = ['rot', 'trail-starvation', 'distribution', 'homecoming-timing',
               'scholar-from-haul', 'inflow-failure', 'wound-compounded'];
  var primary = 'unattributed';
  for (var p = 0; p < order.length; p++) {
    if (flags.indexOf(order[p]) >= 0) { primary = order[p]; break; }
  }

  return {
    day: d, who: who, vid: vid,
    channel: primary,
    channelFlags: flags,
    diagnostics: diag,
    instrumentErrors: errors,
  };
}

module.exports = {
  classifyExtended: classifyExtended,
  woundBeatNearDeath: woundBeatNearDeath,
  pantrySeries: pantrySeries,
};
