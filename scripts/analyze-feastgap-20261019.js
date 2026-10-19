#!/usr/bin/env node
// analyze-feastgap-20261019.js — lead-vs-belong deferral-5 divergence pinning
// for the sim-feastgap diagnostic.
//
// Reads evidence/2026-10-19/perseed-feastgap/<policy>/s<seed>.json (16 runs:
// 8 paired seeds x {leadfeast, belongfeast}) and, per seed-pair, pins the
// DIVERGENCE DAY (first day the two policies' def5 trajectories separate for
// good) and prints the paired day-exact numbers the mechanism is read from:
// capped-standing trajectories ±7d, war/diplomacy/plenty split, pantry,
// cumulative flows (tribute/tend paid, feasts), readiness legs, w4 kills,
// deaths-to-date.
//
// Pre-registered divergence definition (see evidence header):
//   door(p) = first day with deferral(5) true (windowsurvive-identical).
//   capT5(p) = first day with capped standing >= t5 (the bar hit, readiness
//   met or not). def4(p) = first deferral(4) day.
//   - exactly one reaches the door: divergenceDay = door day of the reacher;
//   - both reach: divergenceDay = door day of the FIRST reacher (the gap is
//     the other policy's lateness); mechanism = why the second is late;
//   - neither reaches: divergenceDay = null; mechanism from cap trajectories
//     (survival gap vs standing stall, with day-exact numbers).
//
// Writes: evidence/2026-10-19/feastgap-corpus-summary.json
// Usage: node scripts/analyze-feastgap-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-feastgap');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(policyId, seed) {
  const p = path.join(EVID, policyId, `s${seed}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function flowSum(flows, kind, upToDay) {
  let t = 0, n = 0;
  for (const f of (flows || [])) {
    if (f.kind !== kind) continue;
    if (upToDay != null && f.day > upToDay) continue;
    t += (f.paid | 0) || 0; n++;
  }
  return { kcal: t, n };
}
function feastDays(flows) {
  const ds = [];
  for (const f of (flows || [])) if (f.kind === 'feast' && f.paid > 0) ds.push(f.day);
  return ds;
}

function analyzeRun(r) {
  const recs = r.recs || [];
  const byDay = new Map(recs.map(x => [x.d, x]));
  let firstDef5 = null, firstDef4 = null, firstCapT5 = null, maxCap = -1, maxRaw = -1;
  let minPantry = Infinity, starvDeaths = 0, raidDeaths = 0, scholarDeaths = 0, otherDeaths = 0;
  for (const rec of recs) {
    const st = rec.st || {};
    if (st.def5 && firstDef5 == null) firstDef5 = rec.d;
    if (st.def4 && firstDef4 == null) firstDef4 = rec.d;
    if ((st.cap | 0) >= ((st.t5 | 0) || 200) && firstCapT5 == null) firstCapT5 = rec.d;
    if ((st.cap | 0) > maxCap) maxCap = st.cap | 0;
    if ((st.raw | 0) > maxRaw) maxRaw = st.raw | 0;
    if (st.pantry >= 0 && st.pantry < minPantry) minPantry = st.pantry;
  }
  const deaths = ((r.deathsAttributed || {}).deaths) || [];
  for (const d of deaths) {
    if (d.player) scholarDeaths++;
    else if (d.cause === 'starvation') starvDeaths++;
    else if (d.channel === 'raid') raidDeaths++;
    else otherDeaths++;
  }
  const flows = r.flows || [];
  const trib = flowSum(flows, 'tribute'), tend = flowSum(flows, 'tend');
  const fds = feastDays(flows);
  return {
    seed: r.seed, policyId: r.policyId, substrate: r.substrate,
    endDay: r.gameDays, endReason: r.endReason, won: !!r.won,
    national: !!r.national, nationalDay: r.nationalDay, table: !!r.table, exiled: !!r.exiled,
    maxWave: r.maxWave, wave4Day: r.wave4Day, wave5Day: r.wave5Day,
    def5ever: firstDef5 != null, firstDef5Day: firstDef5,
    firstDef4Day: firstDef4, firstCapT5Day: firstCapT5, maxCap, maxRaw, minPantry: minPantry === Infinity ? null : minPantry,
    successions: r.successions | 0, scholarDeaths, starvDeaths, raidDeaths, otherDeaths,
    tributePaid: trib.kcal, tributeCalls: trib.n, tendPaid: tend.kcal, tendCalls: tend.n,
    feasts: fds.length, feastFirstDay: fds.length ? fds[0] : null,
    kdW4kills: (r.kdAgg || {}).w4kills | 0,
    instrumentErrors: r.instrumentErrors | 0,
    recs, byDay,
  };
}

// Paired day-exact numbers at (and around) the divergence day.
function pairSeries(a, b, d) {
  const rows = [];
  for (let day = d - 7; day <= d + 7; day++) {
    if (day < 1) continue;
    const ra = a.byDay.get(day), rb = b.byDay.get(day);
    if (!ra && !rb) continue;
    const sa = ra ? ra.st : {}, sb = rb ? rb.st : {};
    rows.push({
      d: day,
      capA: sa.cap == null ? null : sa.cap, capB: sb.cap == null ? null : sb.cap,
      warA: sa.war, warB: sb.war, dipA: sa.dip, dipB: sb.dip, plentyA: sa.plenty, plentyB: sb.plenty,
      panA: sa.pantry, panB: sb.pantry,
      def5A: !!sa.def5, def5B: !!sb.def5, def4A: !!sa.def4, def4B: !!sb.def4,
      r5A: sa.short ? sa.short.join('+') : '?', r5B: sb.short ? sb.short.join('+') : '?',
      rosterA: sa.roster, rosterB: sb.roster,
      linksOursA: sa.links ? sa.links.ours : null, linksOursB: sb.links ? sb.links.ours : null,
      linksTheirsA: sa.links ? sa.links.theirs : null, linksTheirsB: sb.links ? sb.links.theirs : null,
      arrB: sb.links ? sb.links.theirsArrears : null,
    });
  }
  return rows;
}

function analyzePair(seed) {
  const L = load('leadfeast', seed), B = load('belongfeast', seed);
  if (!L || !B) return { seed, bad: true };
  const a = analyzeRun(L), b = analyzeRun(B);
  // Divergence day (pre-registered definition).
  let divergenceDay = null, divergenceKind = '';
  if (a.def5ever && !b.def5ever) { divergenceDay = a.firstDef5Day; divergenceKind = 'lead-door-only'; }
  else if (!a.def5ever && b.def5ever) { divergenceDay = b.firstDef5Day; divergenceKind = 'belong-door-only'; }
  else if (a.def5ever && b.def5ever) { divergenceDay = Math.min(a.firstDef5Day, b.firstDef5Day); divergenceKind = 'both-door'; }
  else { divergenceDay = null; divergenceKind = 'neither-door'; }
  const series = divergenceDay != null ? pairSeries(a, b, divergenceDay) : [];
  return { seed, a, b, divergenceDay, divergenceKind, series };
}

function main() {
  const pairs = SEEDS.map(analyzePair);
  const bad = pairs.filter(p => p.bad);
  const runs = pairs.flatMap(p => p.bad ? [] : [p.a, p.b]);
  // Wall numbers (scale-onramp, pre-registered measurement frame).
  const nat = runs.filter(r => r.national).length;
  const tab = runs.filter(r => r.table).length;
  const won = runs.filter(r => r.won).length;
  const w4 = runs.filter(r => r.maxWave >= 4).length;
  const w5 = runs.filter(r => r.maxWave >= 5).length;
  const surv = runs.map(r => r.endDay).sort((x, y) => x - y);
  const medSurv = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const doorL = runs.filter(r => r.policyId === 'leadfeast' && r.def5ever).length;
  const doorB = runs.filter(r => r.policyId === 'belongfeast' && r.def5ever).length;

  const summary = {
    substrate: 'pre-seat-winside-novetrel', seeds: SEEDS, policies: POLICIES,
    runCount: runs.length, badFiles: bad.length,
    wall: { national: nat, table: tab, wins: won, wave4: w4, wave5: w5, medianSurvival: medSurv, maxSurvival: surv.length ? surv[surv.length - 1] : 0 },
    door: { lead: doorL, belong: doorB },
    pairs: pairs.map(p => p.bad ? { seed: p.seed, bad: true } : {
      seed: p.seed,
      divergenceDay: p.divergenceDay, divergenceKind: p.divergenceKind,
      lead: { endDay: p.a.endDay, endReason: p.a.endReason, def5day: p.a.firstDef5Day, capT5day: p.a.firstCapT5Day, def4day: p.a.firstDef4Day, maxCap: p.a.maxCap, maxRaw: p.a.maxRaw, minPantry: p.a.minPantry, scholarDeaths: p.a.scholarDeaths, raidDeaths: p.a.raidDeaths, starvDeaths: p.a.starvDeaths, tributePaid: p.a.tributePaid, tendPaid: p.a.tendPaid, feasts: p.a.feasts, feastsFirstDay: p.a.feastFirstDay, w4kills: p.a.kdW4kills, wave4Day: p.a.wave4Day, national: p.a.national, nationalDay: p.a.nationalDay, table: p.a.table },
      belong: { endDay: p.b.endDay, endReason: p.b.endReason, def5day: p.b.firstDef5Day, capT5day: p.b.firstCapT5Day, def4day: p.b.firstDef4Day, maxCap: p.b.maxCap, maxRaw: p.b.maxRaw, minPantry: p.b.minPantry, scholarDeaths: p.b.scholarDeaths, raidDeaths: p.b.raidDeaths, starvDeaths: p.b.starvDeaths, tributePaid: p.b.tributePaid, tendPaid: p.b.tendPaid, feasts: p.b.feasts, feastsFirstDay: p.b.feastFirstDay, w4kills: p.b.kdW4kills, wave4Day: p.b.wave4Day, national: p.b.national, nationalDay: p.b.nationalDay, table: p.b.table },
      series: p.series,
    }),
    runs: pairs.flatMap(p => p.bad ? [] : [{
      policy: p.a.policyId, seed: p.a.seed, endDay: p.a.endDay, endReason: p.a.endReason,
      won: p.a.won, national: p.a.national, table: p.a.table, maxWave: p.a.maxWave, wave4Day: p.a.wave4Day,
      def5day: p.a.firstDef5Day, capT5day: p.a.firstCapT5Day, maxCap: p.a.maxCap, minPantry: p.a.minPantry,
      successions: p.a.successions, scholarDeaths: p.a.scholarDeaths, raidDeaths: p.a.raidDeaths, starvDeaths: p.a.starvDeaths,
      tributePaid: p.a.tributePaid, tendPaid: p.a.tendPaid, feasts: p.a.feasts, ierr: p.a.instrumentErrors,
    }, {
      policy: p.b.policyId, seed: p.b.seed, endDay: p.b.endDay, endReason: p.b.endReason,
      won: p.b.won, national: p.b.national, table: p.b.table, maxWave: p.b.maxWave, wave4Day: p.b.wave4Day,
      def5day: p.b.firstDef5Day, capT5day: p.b.firstCapT5Day, maxCap: p.b.maxCap, minPantry: p.b.minPantry,
      successions: p.b.successions, scholarDeaths: p.b.scholarDeaths, raidDeaths: p.b.raidDeaths, starvDeaths: p.b.starvDeaths,
      tributePaid: p.b.tributePaid, tendPaid: p.b.tendPaid, feasts: p.b.feasts, ierr: p.b.instrumentErrors,
    }]),
  };
  fs.writeFileSync(path.join(OUTD, 'feastgap-corpus-summary.json'), JSON.stringify(summary, null, 1));

  // Console: the per-pair divergence table (day-exact numbers for mechanism naming).
  console.log(`FEASTGAP: ${summary.runCount} runs (${bad.length} bad), door lead ${doorL}/8 belong ${doorB}/8, wall nat ${nat}/16 table ${tab}/16 wins ${won}/16 w4 ${w4}/16 w5 ${w5}/16 medSurv ${medSurv}d`);
  for (const p of summary.pairs) {
    if (p.bad) { console.log(`  s${p.seed}: BAD FILE`); continue; }
    const L = p.lead, B = p.belong;
    console.log(`  s${p.seed} div=${p.divergenceDay == null ? '—' : 'd' + p.divergenceDay}(${p.divergenceKind})` +
      ` lead[def5d=${L.def5day == null ? '—' : L.def5day} capT5=${L.capT5day == null ? '—' : L.capT5day} maxCap=${L.maxCap} end=${L.endDay}/${L.endReason} nat=${L.national ? 'd' + L.nationalDay : '—'} trib=${L.tributePaid} tend=${L.tendPaid} feast=${L.feasts}${L.feastsFirstDay != null ? '@d' + L.feastsFirstDay : ''} schD=${L.scholarDeaths} raidD=${L.raidDeaths} starvD=${L.starvDeaths} w4k=${L.w4kills}]` +
      ` belong[def5d=${B.def5day == null ? '—' : B.def5day} capT5=${B.capT5day == null ? '—' : B.capT5day} maxCap=${B.maxCap} end=${B.endDay}/${B.endReason} nat=${B.national ? 'd' + B.nationalDay : '—'} trib=${B.tributePaid} tend=${B.tendPaid} feast=${B.feasts}${B.feastsFirstDay != null ? '@d' + B.feastsFirstDay : ''} schD=${B.scholarDeaths} raidD=${B.raidDeaths} starvD=${B.starvDeaths} w4k=${B.w4kills}]`);
  }
}

module.exports = { analyzePair, analyzeRun, SEEDS, POLICIES };
if (require.main === module) main();
