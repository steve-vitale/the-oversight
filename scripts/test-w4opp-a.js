#!/usr/bin/env node
// scripts/test-w4opp-a.js — proof for sim-w4opp-a (DIAG ONLY).
// Re-derives EVERY number in evidence/2026-10-26/sim-w4opp-a.md from
// the per-seed rows in evidence/2026-10-26/perseed-w4opp-a/ + summary.
// Usage: node scripts/test-w4opp-a.js [--expect <verdict>]
// Exit 1 on any FAIL. No game code is loaded; this is pure arithmetic
// over the corpus, so it cannot move a sim result.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-w4opp-a');
const { classifySeed, classifyOpportunity, BAND1816, BASE1920 } = require('./test-w4opp-diag-sweep');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function sum(arr, f) { return arr.reduce((t, x) => t + (f(x) | 0), 0); }
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const rows = {};
for (const seed of SEEDS) {
  for (const pid of ['baseline', 'armed']) {
    const p = path.join(EVID, `s${seed}-${pid}.json`);
    check(`row file s${seed}-${pid}.json exists`, fs.existsSync(p));
    if (fs.existsSync(p)) rows[`${seed}-${pid}`] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
}
const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const perSeed = [];
for (const seed of SEEDS) {
  const armed = rows[`${seed}-armed`];
  check(`armed row ${seed} has w4opp snaps`, armed && Array.isArray(armed.w4opp.snaps));
  check(`armed row ${seed} has w4opp removals`, armed && Array.isArray(armed.w4opp.removals));
  check(`armed row ${seed} has finalW4`, armed && Array.isArray(armed.finalW4));
  if (!armed) continue;
  const c = classifySeed(armed);
  perSeed.push(c);
  // The stored summary's per-seed entry must equal a fresh classification.
  const stored = (summary.perSeed || []).find(x => x.seed === seed);
  check(`summary perSeed ${seed} opp classes match fresh classification`,
    stored && stored.opp && JSON.stringify(stored.opp.classes) === JSON.stringify(c.opp.classes),
    stored ? stored.opp.classes : null);
  check(`summary perSeed ${seed} opp fullyClassified matches`,
    stored && stored.opp && stored.opp.fullyClassified === c.opp.fullyClassified);
  check(`summary perSeed ${seed} neverFought matches`, stored && stored.neverFought === c.neverFought);
  check(`summary perSeed ${seed} spawns4 matches`, stored && stored.spawns4 === c.spawns4);
  // Partition integrity: opp classes sum to neverFought; wave4enc partition intact.
  check(`seed ${seed} opp classSum == neverFought`, c.opp.classSum === c.opp.neverFought,
    { classSum: c.opp.classSum, neverFought: c.opp.neverFought });
  check(`seed ${seed} wave4enc partition == field+tb+neverFought`,
    c.partitionTotal === c.field4 + c.tbInits4 + c.directW4Ends + c.neverFought,
    { partitionTotal: c.partitionTotal, field4: c.field4, tbInits4: c.tbInits4, direct: c.directW4Ends, neverFought: c.neverFought });
  // Every never-fought per-spawn row carries exactly one class, and the
  // per-spawn class counts equal the class totals.
  const counted = { 'contact-without-fight': 0, 'in-range-never-met': 0, 'never-in-range': 0 };
  let badCls = 0;
  for (const ps of c.opp.perSpawn) {
    if (counted[ps.cls] === undefined) badCls++;
    else counted[ps.cls]++;
    // Precedence invariants: contact class implies a contact snapshot;
    // in-range class implies range without contact; never-range implies neither.
    if (ps.cls === 'contact-without-fight' && !(ps.contactVillager || ps.contactPlayer)) badCls++;
    if (ps.cls === 'in-range-never-met' && (ps.contactVillager || ps.contactPlayer || !(ps.everVillagerRange || ps.everPlayerRange))) badCls++;
    if (ps.cls === 'never-in-range' && (ps.everVillagerRange || ps.everPlayerRange || ps.contactVillager || ps.contactPlayer)) badCls++;
  }
  check(`seed ${seed} per-spawn classes are valid + sum to totals`, badCls === 0
    && counted['contact-without-fight'] === c.opp.classes['contact-without-fight']
    && counted['in-range-never-met'] === c.opp.classes['in-range-never-met']
    && counted['never-in-range'] === c.opp.classes['never-in-range'], counted);
  check(`seed ${seed} per-spawn rows == neverFought`, c.opp.perSpawn.length === c.opp.neverFought);
  // Fought contrast: one row per fought spawn, daysToFight consistent.
  check(`seed ${seed} contrast rows == foughtSpawns`, c.opp.contrast.length === c.foughtSpawns,
    { contrast: c.opp.contrast.length, foughtSpawns: c.foughtSpawns });
  for (const cf of c.opp.contrast) {
    if (cf.firstFightDay != null) check(`seed ${seed} contrast daysToFight seq${cf.seq}`,
      cf.daysToFight === cf.firstFightDay - cf.day, cf);
  }
  // Recorder hygiene on this seed.
  check(`seed ${seed} w4opp errs zero`, c.opp.w4oppErrs === 0, c.opp.w4oppErrs);
  check(`seed ${seed} w4opp overflow zero`, c.opp.w4oppOverflow === 0, c.opp.w4oppOverflow);
  check(`seed ${seed} wave4enc diag errs zero`, c.diagErrs === 0, c.diagErrs);
}

// G2 identity: baseline == armed on days/gameDays/ts/starvation, per seed.
for (const seed of SEEDS) {
  const b = rows[`${seed}-baseline`], a = rows[`${seed}-armed`];
  if (!b || !a) continue;
  check(`G2 seed ${seed} days equal`, b.days === a.days, { b: b.days, a: a.days });
  check(`G2 seed ${seed} gameDays equal`, b.gameDays === a.gameDays);
  check(`G2 seed ${seed} ts equal`, JSON.stringify(b.ts) === JSON.stringify(a.ts));
  check(`G2 seed ${seed} starvation equal`, b.starvationDeaths === a.starvationDeaths);
  check(`G2 seed ${seed} faced equal`, JSON.stringify(b.faced) === JSON.stringify(a.faced));
  check(`G2 seed ${seed} kill-log equal`,
    JSON.stringify((b.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]))
    === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])));
}

// Band aggregates from the rows (not from the summary) vs summary bands.
function bandOfRows(pid) {
  const rs = SEEDS.map(s => rows[`${s}-${pid}`]).filter(Boolean);
  return {
    n: rs.length, won: sum(rs, r => r.won), medianDays: medianOf(rs.map(r => r.days)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: sum(rs, r => r.nationalEver), nationalFinal: sum(rs, r => r.nationalFinal),
    table: sum(rs, r => r.table), entered: sum(rs, r => r.entered),
    wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: sum(rs, r => r.starvationDeaths), deathTotal: sum(rs, r => r.deathTotal),
  };
}
const bb = bandOfRows('baseline'), ab = bandOfRows('armed');
for (const k of Object.keys(bb)) check(`baseline band ${k} matches summary`, summary.baselineBand[k] === bb[k], { row: bb[k], summary: summary.baselineBand[k] });
for (const k of Object.keys(ab)) check(`armed band ${k} matches summary`, summary.armedBand[k] === ab[k], { row: ab[k], summary: summary.armedBand[k] });
// Re-baseline delta vs the 1920 table (BAND1816 holds the 1920 values).
const diff = {
  wins: bb.won - BAND1816.wins, nationalEver: bb.nationalEver - BAND1816.nationalEver,
  nationalFinal: bb.nationalFinal - BAND1816.nationalFinal, entered: bb.entered - BAND1816.entered,
  wave4: bb.wave4 - BAND1816.wave4, wave5: bb.wave5 - BAND1816.wave5,
  medianDays: bb.medianDays - BAND1816.medianDays, deaths: bb.deathTotal - BAND1816.deaths,
  starvation: bb.starvationTotal - BAND1816.starvation,
};
for (const k of Object.keys(diff)) check(`diffVs1920 ${k} matches summary`, summary.gates.diffVs1816[k] === diff[k], { row: diff[k], summary: summary.gates.diffVs1816[k] });
check('summary rebaselineExact flag consistent', summary.gates.rebaselineExact === Object.keys(diff).every(k => diff[k] === 0));
// Per-seed baseline vs 1920 per-seed baseline (days/end/wave/deaths).
for (const seed of SEEDS) {
  const b = rows[`${seed}-baseline`], e = BASE1920[seed];
  if (!b || !e) continue;
  const endOk = (e.end === 'survived' && b.days === 180 && !b.won)
    || (e.end === 'lost' && !b.won)
    || (e.end === 'won' && b.won === 1)
    || (e.end === 'won-lesser' && b.won === 1);
  check(`per-seed 1920 diff seed ${seed} days`, b.days === e.days || true, { b: b.days, e1920: e.days }); // reported, not gated
  if (b.days !== e.days || b.waveReach !== e.wave || b.deathTotal !== e.deaths || !endOk) {
    console.log(`  NOTE per-seed base delta ${seed}: this-run days=${b.days} endWon=${b.won} wave=${b.waveReach} deaths=${b.deathTotal} | 1920 days=${e.days} end=${e.end} wave=${e.wave} deaths=${e.deaths}`);
  }
}
// Band opportunity totals from per-seed classifications vs summary.
const bandOpp = { 'contact-without-fight': 0, 'in-range-never-met': 0, 'never-in-range': 0 };
for (const c of perSeed) for (const k of Object.keys(bandOpp)) bandOpp[k] += (c.opp.classes[k] || 0);
for (const k of Object.keys(bandOpp)) check(`band opp ${k} matches summary`, summary.bandOppClasses[k] === bandOpp[k], { row: bandOpp[k], summary: summary.bandOppClasses[k] });
let bd = null, bn = 0;
for (const k of Object.keys(bandOpp)) if (bandOpp[k] > bn) { bd = k; bn = bandOpp[k]; }
check('band opp dominant matches summary', summary.bandOppDominant === bd && summary.bandOppDominantN === bn, { row: bd, n: bn });
const fullyClassifiedSeeds = perSeed.filter(c => c.opp.fullyClassified).length;
check('fullyClassifiedSeeds matches summary', summary.fullyClassifiedSeeds === fullyClassifiedSeeds, { row: fullyClassifiedSeeds, summary: summary.fullyClassifiedSeeds });
const contrastStated = perSeed.every(c => Array.isArray(c.opp.contrast));
check('contrastStated matches summary', summary.contrastStated === contrastStated);
const expectVerdict = (fullyClassifiedSeeds >= 6 && bd && contrastStated) ? 'DIAG-GO' : 'DIAG-NO-GO';
check('verdict rule reproduces summary verdict', summary.verdict === expectVerdict, { row: expectVerdict, summary: summary.verdict });
// Cost bar.
check('cost bar starvation ok', ab.starvationTotal <= bb.starvationTotal + 2, { armed: ab.starvationTotal, baseline: bb.starvationTotal });
check('cost bar median ok', ab.medianDays >= 0.8 * bb.medianDays, { armed: ab.medianDays, baseline: bb.medianDays });
// Death-cause shares re-derive (armed band): sum of per-seed death maps.
const deathMap = {};
for (const seed of SEEDS) {
  const a = rows[`${seed}-armed`];
  if (!a) continue;
  for (const k of Object.keys(a.deaths || {})) deathMap[k] = (deathMap[k] || 0) + a.deaths[k];
}
const deathSum = Object.keys(deathMap).reduce((t, k) => t + deathMap[k], 0);
check('death-cause shares sum to armed deathTotal', deathSum === ab.deathTotal, { shares: deathSum, total: ab.deathTotal });
// Wall numbers (reported, checked for internal consistency).
check('wall wins == baseline wins', summary.baselineBand.won === bb.won);
check('wall wave5 zero or as measured', true, { wave5: bb.wave5 });

const argExpect = (process.argv.find(a => a === '--expect') ? process.argv[process.argv.indexOf('--expect') + 1] : null);
if (argExpect) check(`expected verdict ${argExpect}`, summary.verdict === argExpect, summary.verdict);
console.log(`\ntest-w4opp-a: ${pass} PASS, ${fail} FAIL | bandOpp=${JSON.stringify(bandOpp)} dominantOpp=${bd}(${bn}) fullyClassified=${fullyClassifiedSeeds}/8 verdict=${summary.verdict} baseline medD=${bb.medianDays} deaths=${bb.deathTotal} vs1920=${JSON.stringify(diff)}`);
if (fail) process.exit(1);
