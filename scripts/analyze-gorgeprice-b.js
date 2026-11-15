// analyze-gorgeprice-b.js — gorge-pricing analyzer for sim-gorgeprice-b.
// Extends analyze-cascade-b.js (identical P1 / gap / same-instance
// definitions — the cascade analyzer's output fields are preserved
// verbatim) with the gorge price and the revised rate-based cost bar
// (see evidence/2026-11-15/sim-gorgeprice-b-prereg.md):
//   - voiced gorge nights + kcal, parsed from the nightly siege lines
//     in linkLines (the line is only SAID when the scholar is at Haven
//     — GORGE GATE — so these are a LOWER BOUND on the true gorge);
//   - zero-kcal "circles the treeline" nights counted separately;
//   - per-siege grouping (consecutive-day voiced gorge lines naming
//     the same monster);
//   - starvation per 100 lived-days + pooled tripwire + survival ratio
//     (computeBars: the frozen bar computation, exported for the proof
//     test).
// Read-only; prints JSON to stdout when run as a script.
// Usage: node scripts/analyze-gorgeprice-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// parseGorgeLines(linkLines) — the gorge price, from the voiced siege
// lines the driver captures in linkLines. A voiced gorge night is a
// line "The lingering <name> gorges at the treeline — <N> kcal gone
// from the stores." (N comma-formatted; "0 kcal" counts as a voiced
// gorge night, distinct from a circle night). A circle night is "The
// lingering <name> circles the treeline, sniffing at empty stores"
// (0 kcal taken, siege continued). A siege is a maximal run of
// consecutive-day voiced gorge lines naming the same monster.
// Returns { nights, kcal, circleNights, sieges: [{name, days, nights,
// kcal}], kcalPerSiege, nightsPerSiege, meanKcalPerNight }.
var GORGE_RE = /The lingering (.+?) gorges at the treeline — ([\d,]+) kcal gone/;
var CIRCLE_RE = /The lingering (.+?) circles the treeline, sniffing at empty stores/;
function parseGorgeLines(linkLines) {
  const rows = (linkLines || []).slice().sort(function (a, b) { return a.day - b.day; });
  let nights = 0, kcal = 0, circleNights = 0;
  const sieges = [];
  let cur = null;
  function closeSiege() { if (cur) { sieges.push(cur); cur = null; } }
  for (const row of rows) {
    const line = String((row && row.line) || '');
    const gm = GORGE_RE.exec(line);
    if (gm) {
      const name = gm[1];
      const k = parseInt(gm[2].replace(/,/g, ''), 10) || 0;
      nights += 1; kcal += k;
      if (!cur || cur.name !== name || row.day !== cur.lastDay + 1) {
        closeSiege();
        cur = { name: name, days: [], nights: 0, kcal: 0, lastDay: row.day };
      }
      cur.days.push(row.day); cur.nights += 1; cur.kcal += k; cur.lastDay = row.day;
      continue;
    }
    if (CIRCLE_RE.test(line)) circleNights += 1;
  }
  closeSiege();
  for (const s of sieges) delete s.lastDay;
  return {
    nights: nights, kcal: kcal, circleNights: circleNights, sieges: sieges,
    kcalPerSiege: sieges.length ? +(kcal / sieges.length).toFixed(1) : null,
    nightsPerSiege: sieges.length ? +(nights / sieges.length).toFixed(2) : null,
    meanKcalPerNight: nights ? +(kcal / nights).toFixed(1) : null,
  };
}

// computeBars(control, armed, opts) — the FROZEN bar computation from the
// gorgeprice prereg. Inputs are leg summaries:
//   { pooledP1, starvationPooled, starvationRate (per 100 lived-days),
//     medianSurvivalDays }.
// Bars: P1 armed <= 0.6x control; starvation rate armed <= 1.25x
// control rate; pooled tripwire armed <= control + 2; median survival
// armed >= 0.8x control. Control-rate-zero edge: 0/0 passes (no
// starvation either side); armed > 0 against control 0 fails the rate
// bar (any positive rate is infinitely above zero). The pooled
// tripwire is judged independently of the rate.
// opts.rateFloor (gorgeprice2-b, CORRECTED bar): when given, the rate
// leg judges the armed rate against 1.25x max(control rate, rateFloor)
// instead of 1.25x control rate — the floor stops the bar degenerating
// to zero-tolerance on a zero-starvation control band (1055Z metric
// review: METRIC-BROKEN). Without opts.rateFloor the old unfloored
// form is preserved exactly (including the zero-control edge).
// Returns the ratios, each sub-bar, costPass (all three cost legs),
// and verdict GO (P1 + cost) / NO-GO.
function computeBars(control, armed, opts) {
  const p1Ratio = (control.pooledP1 !== null && control.pooledP1 !== undefined && control.pooledP1 > 0)
    ? +(armed.pooledP1 / control.pooledP1).toFixed(3) : null;
  const p1Pass = p1Ratio !== null && p1Ratio <= 0.6;
  let starvRateRatio = null, starvRatePass = false;
  const floor = (opts && typeof opts.rateFloor === 'number') ? opts.rateFloor : null;
  if (floor !== null) {
    const effControl = Math.max(control.starvationRate || 0, floor);
    starvRateRatio = effControl > 0 ? +(armed.starvationRate / effControl).toFixed(3) : (armed.starvationRate === 0 ? 0 : Infinity);
    starvRatePass = starvRateRatio !== null && starvRateRatio <= 1.25;
  } else if (control.starvationRate === 0) {
    starvRatePass = armed.starvationRate === 0;
    starvRateRatio = armed.starvationRate === 0 ? 0 : Infinity;
  } else if (control.starvationRate) {
    starvRateRatio = +(armed.starvationRate / control.starvationRate).toFixed(3);
    starvRatePass = starvRateRatio <= 1.25;
  }
  const tripwirePass = armed.starvationPooled <= control.starvationPooled + 2;
  const survivalRatio = control.medianSurvivalDays
    ? +(armed.medianSurvivalDays / control.medianSurvivalDays).toFixed(3) : null;
  const survivalPass = survivalRatio !== null && survivalRatio >= 0.8;
  const costPass = starvRatePass && tripwirePass && survivalPass;
  return {
    p1Ratio: p1Ratio, p1Pass: p1Pass,
    starvRateRatio: starvRateRatio, starvRatePass: starvRatePass,
    tripwirePass: tripwirePass,
    survivalRatio: survivalRatio, survivalPass: survivalPass,
    costPass: costPass,
    verdict: (p1Pass && costPass) ? 'GO' : 'NO-GO',
  };
}
const isMain = require.main === module;
const dir = isMain ? process.argv[2] : null;
if (isMain && !dir) { console.error('usage: node scripts/analyze-gorgeprice-b.js <corpus-dir>'); process.exit(2); }
const files = isMain ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];

let totWildNat = 0, totNatDaysLive = 0, totStarv = 0, totDeaths = 0;
let totDiss = 0, totReclimb = 0;
let totGorgeNights = 0, totGorgeKcal = 0, totCircleNights = 0, totSieges = 0;
let totVillagerCombatDeaths = 0, totLivedDays = 0;
let gapAll = { 0: 0, 1: 0, 2: 0, '3+': 0 };
let gapNat = { 0: 0, 1: 0, 2: 0, '3+': 0 };
const classCounts = { A: 0, B: 0, C: 0, other: 0 };
const classCountsNat = { A: 0, B: 0, C: 0, other: 0 };
const provCounts = {};
const followers = [];
const sameInstancePairs = [];
const perSeed = [];
let sessionsWithTwoPlayerDeaths = 0;
let nullInstanceFatal = 0;

for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const series = r.series || [];
  const natByDayLive = {};
  for (const s of series) natByDayLive[s.d] = !!s.nationalLive;
  const natDaysLive = series.filter(function (s) { return s.nationalLive; }).length;
  const natHeld = series.filter(function (s) { return s.scale === 'national' || s.scale === 'global'; }).length;
  const firstNat = series.find(function (s) { return s.scale === 'national' || s.scale === 'global'; });
  let wildNat = 0, wildAll = 0, starv = 0;
  for (const d of (r.deaths || [])) {
    if (/starv|hunger/i.test(String((d.cause || '') + ' ' + (d.kind || '')))) starv += 1;
    if (d.player && d.cause === 'the wild') {
      wildAll += 1;
      if (natByDayLive[d.day]) wildNat += 1;
    }
  }
  const diss = [], recl = [];
  let wasNat = false;
  for (const s of series) {
    const nat = !!s.nationalLive;
    if (wasNat && !nat) diss.push(s.d);
    if (!wasNat && nat && diss.length > recl.length) recl.push(s.d);
    wasNat = nat;
  }
  totWildNat += wildNat; totNatDaysLive += natDaysLive;
  totStarv += starv; totDeaths += (r.deaths || []).length;
  totDiss += diss.length; totReclimb += recl.length;

  // ---- cascade decomposition ----
  const cas = r.cascade || {};
  const sessions = cas.sessions || [];
  const ends = cas.ends || [];
  const cdeaths = cas.deaths || [];
  const byId = {};
  for (const s of sessions) byId[s.id] = s;
  const endById = {};
  for (const e of ends) endById[e.id] = e;
  // scholar `the wild` deaths, in day order, joined to cascade death rows.
  // The harness deaths array is authoritative for the death list; the
  // cascade rows carry the session/provenance context. Match by
  // (day, who, cause, player) — one cascade row per harness row.
  const scholarWild = (r.deaths || []).filter(function (d) { return d.player && d.cause === 'the wild'; })
    .sort(function (a, b) { return a.day - b.day; });
  const usedC = new Set();
  const joined = [];
  for (const d of scholarWild) {
    let cj = null;
    for (let i = 0; i < cdeaths.length; i++) {
      if (usedC.has(i)) continue;
      const c = cdeaths[i];
      if (c.day === d.day && c.who === d.who && c.cause === d.cause && c.player === true) { cj = c; usedC.add(i); break; }
    }
    joined.push({ harness: d, cascade: cj });
  }
  // Gap buckets (all + while-national), aligned with the
  // successorcaution definition: gap in days to the previous scholar
  // death of ANY cause (the succession day); the first scholar death
  // counts as gap 3+. A death with gap 0 happened the same day as the
  // previous succession — inside the death day's own daily() call.
  const playerDeaths = (r.deaths || []).filter(function (d) { return d.player; })
    .sort(function (a, b) { return a.day - b.day; });
  const prevPlayerDayByWild = {};
  let prevDayAny = null;
  for (const d of playerDeaths) {
    if (d.cause === 'the wild') prevPlayerDayByWild[d.day + '|' + d.who] = prevDayAny;
    prevDayAny = d.day;
  }
  let prevDay = null;
  const gaps = [];
  for (const j of joined) {
    const prevAny = prevPlayerDayByWild[j.harness.day + '|' + j.harness.who];
    const g = prevAny === null || prevAny === undefined ? null : j.harness.day - prevAny;
    gaps.push(g);
    if (g === null) { gapAll['3+'] += 1; if (natByDayLive[j.harness.day]) gapNat['3+'] += 1; }
    else {
      const k = g <= 0 ? '0' : g === 1 ? '1' : g === 2 ? '2' : '3+';
      gapAll[k] += 1;
      if (natByDayLive[j.harness.day]) gapNat[k] += 1;
    }
    prevDay = j.harness.day;
  }
  // Per-session player-death counts (A detector: 2 deaths, one session).
  const deathsBySession = {};
  for (const j of joined) {
    const sid = j.cascade ? j.cascade.sessionId : null;
    if (sid !== null && sid !== undefined) {
      deathsBySession[sid] = (deathsBySession[sid] || 0) + 1;
    }
  }
  for (const sid of Object.keys(deathsBySession)) {
    if (deathsBySession[sid] >= 2) sessionsWithTwoPlayerDeaths += 1;
  }
  // Gap-0 follower classification.
  let prevJ = null;
  for (let i = 0; i < joined.length; i++) {
    const j = joined[i];
    if (gaps[i] !== 0 || !prevJ) { prevJ = j; continue; }
    const cs = j.cascade ? byId[j.cascade.sessionId] : null;
    const prevCs = prevJ.cascade ? byId[prevJ.cascade.sessionId] : null;
    let cls = 'other';
    let why = '';
    if (j.cascade && prevJ.cascade && j.cascade.sessionId !== null && j.cascade.sessionId !== undefined &&
        j.cascade.sessionId === prevJ.cascade.sessionId) {
      cls = 'A'; why = 'same session ' + j.cascade.sessionId;
    } else if (cs && (cs.provenance === 'treeline' || cs.provenance === 'door-reengage' || cs.provenance === 'breach')) {
      cls = 'B'; why = cs.provenance + ' session ' + cs.id;
    } else if (cs && cs.provenance === 'wild' && !cs.insideHaven) {
      cls = 'C'; why = 'wild session ' + cs.id + ' at (' + cs.mapPx + ',' + cs.mapPy + ')';
    } else if (cs) {
      why = 'prov=' + cs.provenance + ' insideHaven=' + cs.insideHaven + ' session ' + cs.id;
    } else {
      why = 'no cascade row for death';
    }
    classCounts[cls] += 1;
    if (natByDayLive[j.harness.day]) classCountsNat[cls] += 1;
    followers.push({ seed: r.seed, day: j.harness.day, who: j.harness.who,
      cls: cls, why: why,
      sessionId: j.cascade ? j.cascade.sessionId : null,
      prevSessionId: prevJ.cascade ? prevJ.cascade.sessionId : null,
      prov: cs ? cs.provenance : null,
      instance: cs ? cs.worldMonsterInstance : null,
      prevInstance: prevCs ? prevCs.worldMonsterInstance : null,
      insideHaven: cs ? cs.insideHaven : null,
      dailyCall: j.cascade ? j.cascade.dailyCall : null,
      prevDailyCall: prevJ.cascade ? prevJ.cascade.dailyCall : null,
      sameDailyCall: !!(j.cascade && prevJ.cascade && j.cascade.dailyCall === prevJ.cascade.dailyCall),
      travelSeq: j.cascade ? j.cascade.travelSeq : null,
      verbSeq: j.cascade ? j.cascade.verbSeq : null,
      currentVerb: j.cascade ? j.cascade.currentVerb : null,
      daysSinceSuccession: j.cascade ? j.cascade.daysSinceSuccession : null,
      consumedStash: cs ? cs.consumedStash : null });
    prevJ = j;
  }
  // Provenance of ALL scholar wild deaths.
  for (const j of joined) {
    const cs = j.cascade ? byId[j.cascade.sessionId] : null;
    const p = cs ? cs.provenance : 'unjoined';
    provCounts[p] = (provCounts[p] || 0) + 1;
    if (cs && (cs.worldMonsterInstance === null || cs.worldMonsterInstance === undefined)) nullInstanceFatal += 1;
  }
  // Same-instance pairs across CONSECUTIVE scholar wild deaths.
  for (let i = 1; i < joined.length; i++) {
    const a = joined[i - 1].cascade ? byId[joined[i - 1].cascade.sessionId] : null;
    const b = joined[i].cascade ? byId[joined[i].cascade.sessionId] : null;
    if (a && b && a.worldMonsterInstance !== null && a.worldMonsterInstance !== undefined &&
        a.worldMonsterInstance === b.worldMonsterInstance) {
      sameInstancePairs.push({ seed: r.seed, days: [joined[i - 1].harness.day, joined[i].harness.day],
        instance: a.worldMonsterInstance, species: [a.vs, b.vs], prov: [a.provenance, b.provenance] });
    }
  }
  // Stash-linkage check for (B) fatal sessions: each consumed entry must
  // have appeared in an earlier stash snapshot (any session/death row).
  const stashSeen = new Set();
  for (const s of sessions) for (const e of (s.stash || [])) stashSeen.add(e.id + '|' + e.hp + '|' + e.bearer);
  for (const c of cdeaths) for (const e of (c.stash || [])) stashSeen.add(e.id + '|' + e.hp + '|' + e.bearer);
  let stashLinked = 0, stashUnlinked = 0;
  for (const s of sessions) {
    if (s.provenance === 'treeline' || s.provenance === 'door-reengage') {
      for (const e of (s.consumedStash || [])) {
        if (stashSeen.has(e.id + '|' + e.hp + '|' + e.bearer)) stashLinked += 1; else stashUnlinked += 1;
      }
    }
  }
  const gorge = parseGorgeLines(r.linkLines || []);
  totGorgeNights += gorge.nights; totGorgeKcal += gorge.kcal;
  totCircleNights += gorge.circleNights; totSieges += gorge.sieges.length;
  totVillagerCombatDeaths += (r.villagerCombatDeaths || 0);
  totLivedDays += (r.days || 0);
  perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason,
    won: !!r.won, maxWave: r.maxWave, scaleRank: r.scaleRank,
    natDay: firstNat ? firstNat.d : null, natDaysLive: natDaysLive,
    nationalHeldDays: natHeld, dissolutions: diss, reclimbs: recl,
    wildScholar: wildAll, wildScholarNat: wildNat,
    p1: natDaysLive ? +(wildNat / natDaysLive).toFixed(3) : null,
    starv: starv, deaths: (r.deaths || []).length,
    villagerCombatDeaths: (r.villagerCombatDeaths || 0),
    gorgeNights: gorge.nights, gorgeKcal: gorge.kcal,
    gorgeCircleNights: gorge.circleNights, gorgeSieges: gorge.sieges.length,
    gorgeKcalPerSiege: gorge.kcalPerSiege,
    gorgeMeanKcalPerNight: gorge.meanKcalPerNight,
    cascadeSessions: sessions.length, cascadeDeaths: cdeaths.length,
    scholarWildJoined: joined.filter(function (j) { return j.cascade; }).length,
    stashLinked: stashLinked, stashUnlinked: stashUnlinked });
}
const heldList = perSeed.map(function (s) { return s.nationalHeldDays; });
const daysList = perSeed.map(function (s) { return s.days; });
const totFollowers = classCounts.A + classCounts.B + classCounts.C + classCounts.other;
const dominant = Object.keys(classCounts).sort(function (a, b) { return classCounts[b] - classCounts[a]; })[0];
const starvationRate = totLivedDays ? +(100 * totStarv / totLivedDays).toFixed(3) : null;
const gorgeKcalPer100LivedDays = totLivedDays ? +(100 * totGorgeKcal / totLivedDays).toFixed(1) : null;
const gorgeNightsPer100LivedDays = totLivedDays ? +(100 * totGorgeNights / totLivedDays).toFixed(2) : null;
const villagerCombatDeathsPer100LivedDays = totLivedDays ? +(100 * totVillagerCombatDeaths / totLivedDays).toFixed(2) : null;
const out = {
  corpus: dir, seeds: files.length,
  nationalEver: perSeed.filter(function (s) { return s.natDay !== null; }).length,
  endNational: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  wins: perSeed.filter(function (s) { return s.won; }).length,
  wave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  wave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  medianNationalHeldDays: med(heldList),
  medianSurvivalDays: med(daysList),
  dissolutions: totDiss, reclimbs: totReclimb,
  starvationPooled: totStarv, totalDeaths: totDeaths,
  livedDays: totLivedDays,
  starvationRate: starvationRate,
  villagerCombatDeaths: totVillagerCombatDeaths,
  villagerCombatDeathsPer100LivedDays: villagerCombatDeathsPer100LivedDays,
  gorgeNights: totGorgeNights, gorgeKcal: totGorgeKcal,
  gorgeCircleNights: totCircleNights, gorgeSieges: totSieges,
  gorgeKcalPerSiege: totSieges ? +(totGorgeKcal / totSieges).toFixed(1) : null,
  gorgeNightsPerSiege: totSieges ? +(totGorgeNights / totSieges).toFixed(2) : null,
  gorgeMeanKcalPerNight: totGorgeNights ? +(totGorgeKcal / totGorgeNights).toFixed(1) : null,
  gorgeKcalPer100LivedDays: gorgeKcalPer100LivedDays,
  gorgeNightsPer100LivedDays: gorgeNightsPer100LivedDays,
  wildScholarNat: totWildNat, natDaysLive: totNatDaysLive,
  pooledP1: totNatDaysLive ? +(totWildNat / totNatDaysLive).toFixed(4) : null,
  gapAll: gapAll, gapNat: gapNat,
  gap0Followers: totFollowers,
  classCounts: classCounts, classCountsNat: classCountsNat,
  dominant: dominant,
  dominantShare: totFollowers ? +(classCounts[dominant] / totFollowers).toFixed(3) : null,
  provenanceAllScholarWild: provCounts,
  sessionsWithTwoPlayerDeaths: sessionsWithTwoPlayerDeaths,
  sameInstancePairs: sameInstancePairs,
  nullInstanceFatalSessions: nullInstanceFatal,
  followers: followers,
  perSeed: perSeed,
};
if (isMain) console.log(JSON.stringify(out, null, 2));
module.exports = { parseGorgeLines: parseGorgeLines, computeBars: computeBars };
