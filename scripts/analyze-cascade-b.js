// analyze-cascade-b.js — DIAG analyzer for sim-cascade-b Stage 1.
// Reads one per-seed corpus dir (cascade driver output) and prints:
//   - the judged wall numbers (same definitions as
//     analyze-successorcaution-b.js: P1, held-days, dissolutions,
//     starvation, survival),
//   - the gap decomposition of scholar `the wild` deaths,
//   - the A/B/C classification of every gap-0 follower (FROZEN rules,
//     see sim-cascade-b-prereg.md),
//   - same-instance checks (shared worldMonsterInstance ids; stash
//     linkage for treeline/door-reengage kills).
// Read-only; prints JSON to stdout.
// Usage: node scripts/analyze-cascade-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-cascade-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();

let totWildNat = 0, totNatDaysLive = 0, totStarv = 0, totDeaths = 0;
let totDiss = 0, totReclimb = 0;
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
  perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason,
    won: !!r.won, maxWave: r.maxWave, scaleRank: r.scaleRank,
    natDay: firstNat ? firstNat.d : null, natDaysLive: natDaysLive,
    nationalHeldDays: natHeld, dissolutions: diss, reclimbs: recl,
    wildScholar: wildAll, wildScholarNat: wildNat,
    p1: natDaysLive ? +(wildNat / natDaysLive).toFixed(3) : null,
    starv: starv, deaths: (r.deaths || []).length,
    cascadeSessions: sessions.length, cascadeDeaths: cdeaths.length,
    scholarWildJoined: joined.filter(function (j) { return j.cascade; }).length,
    stashLinked: stashLinked, stashUnlinked: stashUnlinked });
}
const heldList = perSeed.map(function (s) { return s.nationalHeldDays; });
const daysList = perSeed.map(function (s) { return s.days; });
const totFollowers = classCounts.A + classCounts.B + classCounts.C + classCounts.other;
const dominant = Object.keys(classCounts).sort(function (a, b) { return classCounts[b] - classCounts[a]; })[0];
console.log(JSON.stringify({
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
}, null, 2));
