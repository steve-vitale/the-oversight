#!/usr/bin/env node
// scripts/analyze-crumbdefault-20261016.js — adjudication for sim-crumbdefault-b.
//
// Compares control vs armed sweep outputs (scripts/sweep-crumbdefault-20261016.js)
// against the pre-registered header in evidence/2026-10-16/sim-crumbdefault-b.md:
//
// PRIMARY: absolute starvedDays armed <= control (strict).
// COVERAGE: control stoppedRefusals >= 20 AND control crumbs-left
//   starvedDays >= 2; else verdict = no-coverage diagnostic.
// HETEROGENEITY: max per-seed (armed-control) starvedDays <= +2.
// GUARDRAILS: national >= control-2 (of 16); medianDays >= control-10;
//   no new death mode; freeloader stage>=2 counts armed <= control.
// Verdict: GO only if primary + coverage + heterogeneity + all guardrails.
//
// Usage:
//   node scripts/analyze-crumbdefault-20261016.js <control-out.json...> -- <armed-out.json...>
//   (each OUT lists its runs; census dirs are derived from OUT paths'
//   sibling census-control/ and census-armed/ dirs — pass explicitly:)
//   node scripts/analyze-crumbdefault-20261016.js --census-control <dir> --census-armed <dir> \
//     <control-out.json...> -- <armed-out.json...>
'use strict';
const fs = require('fs');

function parseArgs() {
  const argv = process.argv.slice(2);
  const o = { censusControl: null, censusArmed: null, controlOuts: [], armedOuts: [] };
  let side = 'control';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--census-control') o.censusControl = argv[++i];
    else if (a === '--census-armed') o.censusArmed = argv[++i];
    else if (a === '--') side = 'armed';
    else (side === 'control' ? o.controlOuts : o.armedOuts).push(a);
  }
  return o;
}

function loadOuts(paths) {
  const runs = [];
  for (const p of paths) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const r of (j.rows || [])) runs.push(r);
  }
  return runs;
}

function loadCensus(dir) {
  // key `${policy}-s${seed}` -> { starvedDays, starvePaths, perSeedStarved }
  const perSeed = {};
  if (!dir || !fs.existsSync(dir)) return perSeed;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('-census.json')) continue;
    const j = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
    const key = `${j.policy}-s${j.seed}`;
    const paths = {};
    let starved = 0;
    for (const r of (j.rows || [])) {
      if (r.starved) { starved++; paths[r.starvePath || 'unknown'] = (paths[r.starvePath || 'unknown'] || 0) + 1; }
    }
    perSeed[key] = { starvedDays: starved, starvePaths: paths, mech: j.mech || 0, mechKind: j.mechKind, freeloadStage2: j.freeloadStage2 || 0 };
  }
  return perSeed;
}

function summarize(label, runs, census) {
  const s = { label, n: runs.length, starvedDays: 0, starvePaths: {}, mech: 0, mechKind: null,
    national: 0, table: 0, won: 0, exiled: 0, hungryDays: 0, freeloadStage2: 0,
    deaths: {}, waves: {}, arcs: {}, days: [], perSeedStarved: {} };
  for (const r of runs) {
    const key = `${r.policy}-s${r.seed}`;
    const c = census[key] || { starvedDays: 0, starvePaths: {}, mech: 0 };
    s.starvedDays += c.starvedDays;
    for (const [k, n] of Object.entries(c.starvePaths)) s.starvePaths[k] = (s.starvePaths[k] || 0) + n;
    s.perSeedStarved[key] = c.starvedDays;
    s.mech += c.mech || 0; s.mechKind = c.mechKind || s.mechKind;
    s.freeloadStage2 += (r.freeloadStage2 || 0);
    if (r.national) s.national++;
    if (r.table) s.table++;
    if (r.won) s.won++;
    if (r.exiled) s.exiled++;
    s.hungryDays += r.hungryDays || 0;
    s.days.push(r.days);
    s.waves[r.waveReach] = (s.waves[r.waveReach] || 0) + 1;
    s.arcs[r.maxArc] = (s.arcs[r.maxArc] || 0) + 1;
    for (const [k, n] of Object.entries(r.deaths || {})) s.deaths[k] = (s.deaths[k] || 0) + n;
  }
  s.days.sort((a, b) => a - b);
  s.medianDays = s.days.length ? s.days[Math.floor(s.days.length / 2)] : 0;
  s.maxDays = s.days.length ? s.days[s.days.length - 1] : 0;
  return s;
}

function main() {
  const o = parseArgs();
  if (!o.controlOuts.length || !o.armedOuts.length) { console.error('need control and armed OUT files'); process.exit(1); }
  const cRuns = loadOuts(o.controlOuts), aRuns = loadOuts(o.armedOuts);
  const cCen = loadCensus(o.censusControl), aCen = loadCensus(o.censusArmed);
  const C = summarize('control', cRuns, cCen), A = summarize('armed', aRuns, aCen);

  console.log('=== sim-crumbdefault-b adjudication ===');
  for (const s of [C, A]) {
    console.log(`\n[${s.label}] n=${s.n} starvedDays=${s.starvedDays} ${s.mechKind}=${s.mech}`);
    console.log(`  starvePaths: ${JSON.stringify(s.starvePaths)}`);
    console.log(`  national=${s.national} table=${s.table} won=${s.won} exiled=${s.exiled} hungryDays=${s.hungryDays} freeloadStage2=${s.freeloadStage2}`);
    console.log(`  medianDays=${s.medianDays} maxDays=${s.maxDays}`);
    console.log(`  waves(maxReach): ${JSON.stringify(s.waves)} arcs: ${JSON.stringify(s.arcs)}`);
    console.log(`  deaths: ${JSON.stringify(s.deaths)}`);
  }

  console.log('\n--- per-seed starvedDays (control -> armed) ---');
  let maxDelta = -Infinity;
  const keys = [...new Set([...Object.keys(C.perSeedStarved), ...Object.keys(A.perSeedStarved)])].sort();
  for (const k of keys) {
    const c = C.perSeedStarved[k] || 0, a = A.perSeedStarved[k] || 0;
    const d = a - c;
    if (d > maxDelta) maxDelta = d;
    console.log(`  ${k}: ${c} -> ${a} (delta ${d >= 0 ? '+' : ''}${d})`);
  }

  console.log('\n--- header adjudication ---');
  const res = [];
  const judge = (name, cond, detail) => { res.push({ name, pass: !!cond, detail }); console.log(`  ${cond ? 'GO  ' : 'NO-GO'} ${name} — ${detail}`); };
  judge('PRIMARY absolute starvedDays armed<=control', A.starvedDays <= C.starvedDays, `${A.starvedDays} <= ${C.starvedDays}`);
  const cov = C.mech >= 20 && (C.starvePaths['crumbs-left'] || 0) >= 2;
  judge('COVERAGE control refusals>=20', C.mech >= 20, `${C.mechKind}=${C.mech}`);
  judge('COVERAGE control crumbs-left starvedDays>=2', (C.starvePaths['crumbs-left'] || 0) >= 2, `${C.starvePaths['crumbs-left'] || 0}`);
  judge('HETEROGENEITY max per-seed delta<=+2', maxDelta <= 2, `max delta ${maxDelta >= 0 ? '+' : ''}${maxDelta}`);
  judge('GUARDRAIL national>=control-2', A.national >= C.national - 2, `${A.national} >= ${C.national - 2}`);
  judge('GUARDRAIL medianDays>=control-10', A.medianDays >= C.medianDays - 10, `${A.medianDays} >= ${C.medianDays - 10}`);
  const newModes = Object.keys(A.deaths).filter(k => !(k in C.deaths) && (A.deaths[k] || 0) >= 3);
  judge('GUARDRAIL no new death mode (n>=3)', newModes.length === 0, newModes.length ? 'new: ' + newModes.join(',') : 'none');
  judge('GUARDRAIL freeloadStage2 armed<=control', A.freeloadStage2 <= C.freeloadStage2, `${A.freeloadStage2} <= ${C.freeloadStage2}`);
  const go = res.every(r => r.pass);
  console.log(`\nVERDICT: ${go ? 'GO' : (cov ? 'NO-GO (killed)' : 'NO-COVERAGE diagnostic')}`);
  if (!cov) console.log('  (coverage missed: the mechanism did not engage enough on control to adjudicate — kill as invisible per header)');
}

if (require.main === module) main();
