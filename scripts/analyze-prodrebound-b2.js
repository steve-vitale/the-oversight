#!/usr/bin/env node
// analyze-prodrebound-b2.js — sim-prodrebound-b2 decision-level diagnostic aggregator.
//
// Answers sim-findings #570: "why does the village over-produce into gluts it
// cannot eat?" — WHO decided to produce, WHAT pantry sensor they read (or
// failed to read), WHEN (pantry fresh-days at decision time).
//
// Usage: node scripts/analyze-prodrebound-b2.js --dir <sweep-outdir> [--out <path>]
//
// The pre-registered DIAG-GO bar is encoded here, written BEFORE the sweep:
//   DIAG-GO requires ALL of:
//   (a) instrument consistency: sum(decEvents.kcal) === chokeTotal on every run;
//   (b) >=95% of MARGINAL-GLUT kcal attributed to a NAMED decision point
//       (marginal-glut kcal = decEvent kcal whose decision-time pantry framing
//       sensor.freshDays >= 7; named = dp !== 'unexplained');
//   (c) instrumentErrors === 0 on every run.
// DIAG-NO-GO: any clause fails — documented honestly.
//
// Output: JSON analysis + printed verdict.
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i += 2) opt[args[i].replace(/^--/, '')] = args[i + 1];
if (!opt.dir) { console.error('FATAL: --dir <sweep-outdir> required'); process.exit(2); }

const GLUT_FD = 7;   // marginal-glut regime: decision-time framing >= 7 fresh-days
const LEAN_FD = 4;   // lean regime: <= 4 (PRODTHROTTLE threshold)

const rows = [];
for (const f of fs.readdirSync(opt.dir).filter(f => /^seed-\d+\.json$/.test(f))) {
  rows.push(JSON.parse(fs.readFileSync(path.join(opt.dir, f), 'utf8')));
}
if (!rows.length) { console.error('FATAL: no per-seed JSONs in ' + opt.dir); process.exit(2); }

const r1 = o => { const r = {}; for (const k of Object.keys(o)) r[k] = Math.round(o[k]); return r; };
const pct = (a, b) => b > 0 ? (100 * a / b) : 0;

const verdict = { clauses: {}, go: true, notes: [] };
const perRun = [];

// ---------- clause (a): instrument consistency ----------
let consistencyFails = 0;
for (const r of rows) {
  const evSum = r.decEvents.reduce((t, e) => t + e.kcal, 0);
  const ok = evSum === Math.round(r.end.chokeTotal);
  if (!ok) consistencyFails++;
  perRun.push({ seed: r.seed, policy: r.policy, evSum, chokeTotal: Math.round(r.end.chokeTotal), consistent: ok });
}
verdict.clauses.consistency = { pass: consistencyFails === 0, fails: consistencyFails, n: rows.length };
if (consistencyFails) { verdict.go = false; verdict.notes.push(`${consistencyFails} runs fail sum(decEvents)===chokeTotal`); }

// ---------- clause (c): instrumentErrors === 0 ----------
let errRuns = 0;
const errDetail = [];
for (const r of rows) {
  if (r.end.instrumentErrors !== 0) { errRuns++; errDetail.push({ seed: r.seed, errors: r.end.instrumentErrors, keys: r.end.errKeys }); }
}
verdict.clauses.zeroErrors = { pass: errRuns === 0, errRuns, detail: errDetail };
if (errRuns) { verdict.go = false; verdict.notes.push(`${errRuns} runs have instrumentErrors > 0`); }

// ---------- marginal-glut attribution (clause b) ----------
let glutKcal = 0, glutNamed = 0, glutUnexpl = 0;
const dpGlut = {};      // dp -> kcal (glut regime)
const dpAll = {};       // dp -> kcal (all regimes)
const dpRegime = {};    // dp -> {lean, mid, glut} kcal
const dpSensorRead = {}; // dp -> {n, readFD}
const actorGlut = {};   // name -> kcal (glut regime)
const fdAtDecision = []; // freshDays values for glut events
const funnelNoRead = { n: 0, kcal: 0 };
const funnelCrisis = { true: 0, false: 0 };
const funnelTrust = {};
let funnelGave = 0, funnelProduced = 0;

for (const r of rows) {
  for (const e of r.decEvents) {
    const dp = e.dp || 'unexplained';
    dpAll[dp] = (dpAll[dp] || 0) + e.kcal;
    const fd = e.sensor ? e.sensor.freshDays : null;
    const regime = (fd === null || fd === undefined) ? 'unknown' : fd >= GLUT_FD ? 'glut' : fd <= LEAN_FD ? 'lean' : 'mid';
    if (!dpRegime[dp]) dpRegime[dp] = { lean: 0, mid: 0, glut: 0, unknown: 0 };
    dpRegime[dp][regime] += e.kcal;
    const cell = dpSensorRead[dp] || (dpSensorRead[dp] = { n: 0, readFD: 0, readKcal: 0, noReadKcal: 0 });
    cell.n++;
    if (e.sensor && e.sensor.codeReadFreshDays) { cell.readFD++; cell.readKcal += e.kcal; }
    else cell.noReadKcal += e.kcal;
    if (regime === 'glut') {
      glutKcal += e.kcal;
      dpGlut[dp] = (dpGlut[dp] || 0) + e.kcal;
      fdAtDecision.push(fd);
      if (dp === 'unexplained') glutUnexpl += e.kcal; else glutNamed += e.kcal;
      if (e.actor && e.actor.name) {
        const nm = e.actor.name;
        actorGlut[nm] = (actorGlut[nm] || 0) + e.kcal;
      }
      if (dp === 'funnel.share') {
        if (!e.sensor.codeReadFreshDays && !e.sensor.codeReadDoomed) { funnelNoRead.n++; funnelNoRead.kcal += e.kcal; }
        const cl = e.sensor.crisisLeg;
        funnelCrisis[cl === true ? 'true' : 'false'] = (funnelCrisis[cl === true ? 'true' : 'false'] || 0) + e.kcal;
        const tb = e.sensor.trustBand || '?';
        funnelTrust[tb] = (funnelTrust[tb] || 0) + e.kcal;
        funnelGave += (e.detail && e.detail.gaveKcal) || 0;
        funnelProduced += (e.detail && e.detail.producedKcal) || 0;
      }
    }
  }
}
const glutNamedShare = glutKcal > 0 ? glutNamed / glutKcal : 0;
verdict.clauses.glutAttribution = {
  pass: glutNamedShare >= 0.95, glutKcal: Math.round(glutKcal),
  namedShare: +glutNamedShare.toFixed(4), unexplainedKcal: Math.round(glutUnexpl),
};
if (!(glutNamedShare >= 0.95)) { verdict.go = false; verdict.notes.push(`marginal-glut named share ${(100 * glutNamedShare).toFixed(2)}% < 95%`); }

// ---------- governor / cap-trim / donation telemetry ----------
let nRedirect = 0, redirectSensed = 0;
const redirectFromTo = {};
const redirectFD = [];
for (const r of rows) {
  for (const g of r.govEvents) {
    if (g.dp !== 'throttle.redirect') continue;
    nRedirect++;
    const key = `${g.detail.from}->${g.detail.to}`;
    redirectFromTo[key] = (redirectFromTo[key] || 0) + 1;
    if (typeof g.detail.throttleResult === 'boolean') redirectSensed++;
    if (typeof g.detail.freshDays === 'number') redirectFD.push(g.detail.freshDays);
  }
}
let capNominal = 0, capStored = 0, capLost = 0;
const capFate = {};
for (const r of rows) {
  for (const c of r.capTrimEvents) {
    capNominal += c.nominalKcal; capStored += c.storedKcal; capLost += c.lostKcal;
    capFate[c.fate] = (capFate[c.fate] || 0) + c.lostKcal;
  }
}
const donOutcome = {};
let donKcal = 0;
for (const r of rows) {
  for (const d of r.donationEvents) {
    donOutcome[d.outcome] = (donOutcome[d.outcome] || 0) + 1;
    donKcal += d.depositedKcal || 0;
  }
}

// ---------- scale-wall numbers (standing directive) ----------
let wins = 0, nationals = 0, tables = 0, exiled = 0;
const arcs = {}, waves = {}, survivals = [];
for (const r of rows) {
  const e = r.end;
  if (e.won) wins++;
  if (e.national) nationals++;
  if (e.table) tables++;
  exiled += e.exiled || 0;
  arcs[e.arc] = (arcs[e.arc] || 0) + 1;
  waves[e.maxWave] = (waves[e.maxWave] || 0) + 1;
  survivals.push(e.days);
}
survivals.sort((a, b) => a - b);
const median = survivals.length ? survivals[Math.floor(survivals.length / 2)] : 0;

const analysis = {
  meta: { dir: opt.dir, runs: rows.length, seeds: rows.map(r => r.seed).sort(), policies: [...new Set(rows.map(r => r.policy))].sort(), glutFD: GLUT_FD, leanFD: LEAN_FD },
  verdict,
  perRun,
  marginalGlut: {
    totalKcal: Math.round(glutKcal), namedKcal: Math.round(glutNamed), namedShare: +glutNamedShare.toFixed(4),
    byDP: r1(dpGlut),
    byDPShare: Object.fromEntries(Object.entries(dpGlut).map(([k, v]) => [k, +(v / glutKcal).toFixed(4)])),
    topActors: Object.entries(actorGlut).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, k]) => ({ name, kcal: Math.round(k), share: +(k / glutKcal).toFixed(4) })),
    freshDaysAtDecision: { n: fdAtDecision.length, min: Math.min(...fdAtDecision), max: Math.max(...fdAtDecision), mean: +(fdAtDecision.reduce((a, b) => a + b, 0) / fdAtDecision.length).toFixed(2) },
  },
  dpDoseResponse: Object.fromEntries(Object.entries(dpRegime).map(([dp, rg]) => [dp, {
    ...r1(rg),
    glutLeanRatio: rg.lean > 0 ? +(rg.glut / rg.lean).toFixed(2) : null,
    sensorReadShare: (() => { const c = dpSensorRead[dp]; return c && c.n ? +(c.readFD / c.n).toFixed(3) : 0; })(),
  }])),
  funnel: {
    glutNoSensorShare: funnelNoRead.kcal > 0 && dpGlut['funnel.share'] ? +(funnelNoRead.kcal / dpGlut['funnel.share']).toFixed(4) : 0,
    glutCrisisKcal: r1(funnelCrisis), glutTrustBandKcal: r1(funnelTrust),
    gaveKcal: Math.round(funnelGave), producedKcal: Math.round(funnelProduced),
  },
  throttle: { redirects: nRedirect, sensed: redirectSensed, fromTo: redirectFromTo, freshDaysMean: redirectFD.length ? +(redirectFD.reduce((a, b) => a + b, 0) / redirectFD.length).toFixed(2) : null },
  capTrim: { nominalKcal: Math.round(capNominal), storedKcal: Math.round(capStored), lostKcal: Math.round(capLost), fateKcal: r1(capFate) },
  donations: { outcomes: donOutcome, depositedKcal: Math.round(donKcal) },
  scaleWall: { runs: rows.length, wins, nationals, tables, exiled, arcs, waves, medianSurvival: median, maxSurvival: Math.max(...survivals) },
};

if (opt.out) {
  fs.mkdirSync(path.dirname(opt.out), { recursive: true });
  fs.writeFileSync(opt.out, JSON.stringify(analysis, null, 1));
  console.log('wrote ' + opt.out);
}

console.log(`\n=== sim-prodrebound-b2 DIAG verdict (${rows.length} runs) ===`);
console.log(`clause (a) consistency sum(decEvents)===chokeTotal: ${verdict.clauses.consistency.pass ? 'PASS' : 'FAIL'} (${rows.length - consistencyFails}/${rows.length})`);
console.log(`clause (b) marginal-glut named-DP share: ${verdict.clauses.glutAttribution.pass ? 'PASS' : 'FAIL'} ${(100 * glutNamedShare).toFixed(2)}% of ${Math.round(glutKcal / 1000)}k kcal (bar >=95%)`);
console.log(`clause (c) instrumentErrors === 0: ${verdict.clauses.zeroErrors.pass ? 'PASS' : 'FAIL'} (${errRuns} runs with errors)`);
console.log(`DIAG verdict: ${verdict.go ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
console.log(`\nmarginal-glut kcal by decision point (>=7 fresh-days at decision):`);
for (const [dp, k] of Object.entries(dpGlut).sort((a, b) => b[1] - a[1])) {
  const rg = dpRegime[dp];
  console.log(`  ${dp}: ${Math.round(k / 1000)}k (${(100 * k / glutKcal).toFixed(1)}%) glut/lean=${rg.lean > 0 ? (k / rg.lean).toFixed(2) : 'n/a'} sensorRead=${(100 * (dpSensorRead[dp] ? dpSensorRead[dp].readFD / dpSensorRead[dp].n : 0)).toFixed(1)}%`);
}
console.log(`\ntop marginal-glut actors:`);
for (const a of analysis.marginalGlut.topActors.slice(0, 10)) console.log(`  ${a.name}: ${Math.round(a.kcal / 1000)}k (${(100 * a.share).toFixed(1)}%)`);
console.log(`\nscale wall: wins ${wins}/${rows.length} national ${nationals}/${rows.length} table ${tables}/${rows.length} arcs ${JSON.stringify(arcs)} waves ${JSON.stringify(waves)} medianSurv ${median}d max ${Math.max(...survivals)}d exiled ${exiled}`);
console.log(`throttle redirects: ${nRedirect} (${redirectSensed} sensed) ${JSON.stringify(redirectFromTo)}`);
console.log(`cap-trim: nominal ${Math.round(capNominal / 1000)}k stored ${Math.round(capStored / 1000)}k lost ${Math.round(capLost / 1000)}k fate ${JSON.stringify(capFate)}`);
