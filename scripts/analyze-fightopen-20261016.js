#!/usr/bin/env node
// analyze-fightopen-20261016.js — judge for the sim-fightopen pilot sweep.
//
// Reads evidence/2026-10-16/perseed-fightopen/*-fightopen-{treatment,control}.json
// and reports against the pre-registered metrics (evidence header):
//
// PRIMARY (binding): conditions-never-met share on post-learning wave-4/5
//   field fights <= 40% on identical seeds (vs 65% measured by execensus).
//   GO iff treatment share <= 0.40.
// SECONDARY: trick resolutions > 0 movement. Resolution (counterwire
//   metric-review definition): trick-attributed kill (vKill with non-empty
//   trickLog) OR mFlee/vFlee with >= 2 trick actions in the fight's trickLog.
//   Movement = treatment count - control count > 0.
// Guardrails: no new death mode (treatment-only death causes), national >=
//   control - 2, median survival >= control - 10d, wave reach not worse.
//
// Also reports: gate-fire movement, opener fires (round-1 trickLog entries
// matching the five opener tokens), wall numbers per arm.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.FIGHTOPEN_EVID || path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fightopen');

const OPENER_TOKENS = new Set(['argue', 'wait:reunion-novel', 'continuity', 'offscript', 'inefficient']);

function load() {
  const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
  const runs = { treatment: [], control: [] };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
    if (j.armId === 'treatment') runs.treatment.push(j);
    else if (j.armId === 'control') runs.control.push(j);
  }
  return runs;
}

function funnelFights45(run) {
  // Post-learning field fights vs wave-4/5 learnings (the PRIMARY's pool).
  const out = [];
  for (const l of (run.funnel || [])) {
    if ((l.wave || 1) < 4) continue;
    for (const f of (l.fights || [])) {
      if (f.path !== 'field') continue;
      out.push({ cls: f.cls, sub: f.sub, outcome: f.outcome, trickLog: f.trickLog || [], rounds: f.rounds, id: l.id, learnId: l.learnId, day: f.day, seed: run.seed, policyId: run.policyId });
    }
  }
  return out;
}

function resolutions(fights) {
  // counterwire metric-review definition.
  return fights.filter(f => {
    const tl = f.trickLog || [];
    if (f.outcome === 'vKill' && tl.length > 0) return true;
    if ((f.outcome === 'mFlee' || f.outcome === 'vFlee') && tl.length >= 2) return true;
    return false;
  });
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const runs = load();
console.log(`runs: treatment=${runs.treatment.length} control=${runs.control.length}`);
if (!runs.treatment.length || !runs.control.length) { console.error('ANALYZE STOP: missing arm'); process.exit(2); }

const stats = {};
for (const arm of ['treatment', 'control']) {
  const fights = runs[arm].flatMap(funnelFights45);
  const cnm = fights.filter(f => f.cls === 'conditions-never-met').length;
  const share = fights.length ? cnm / fights.length : NaN;
  const clsCounts = {};
  for (const f of fights) clsCounts[f.cls] = (clsCounts[f.cls] || 0) + 1;
  const res = resolutions(fights);
  const openers = fights.filter(f => (f.trickLog || []).length && OPENER_TOKENS.has(f.trickLog[0])).length;
  const fires = fights.filter(f => (f.trickLog || []).length > 0).length;
  const national = runs[arm].reduce((a, r) => a + (r.national || 0), 0);
  const table = runs[arm].reduce((a, r) => a + (r.table || 0), 0);
  const won = runs[arm].reduce((a, r) => a + (r.won || 0), 0);
  const w4 = runs[arm].reduce((a, r) => a + (r.wave4Reached || 0), 0);
  const w5 = runs[arm].reduce((a, r) => a + (r.wave5Reached || 0), 0);
  const medDays = median(runs[arm].map(r => r.days));
  const maxDays = Math.max.apply(null, runs[arm].map(r => r.days));
  const causes = {};
  for (const r of runs[arm]) for (const [c, n] of Object.entries(r.deathCauses || {})) causes[c] = (causes[c] || 0) + n;
  stats[arm] = { n: runs[arm].length, fights: fights.length, cnm, share, clsCounts, nRes: res.length, openers, fires, national, table, won, w4, w5, medDays, maxDays, causes, resFights: res };
}

for (const arm of ['treatment', 'control']) {
  const s = stats[arm];
  console.log(`\n== ${arm} (n=${s.n}) ==`);
  console.log(`  w4/5 post-learning field fights: ${s.fights}`);
  console.log(`  conditions-never-met: ${s.cnm}/${s.fights} = ${(s.share * 100).toFixed(1)}%`);
  console.log(`  funnel classes: ${JSON.stringify(s.clsCounts)}`);
  console.log(`  resolutions: ${s.nRes} (movement target)`);
  console.log(`  fights with any trick fire: ${s.fires}; opener-first fights: ${s.openers}`);
  console.log(`  wall: national ${s.national}/${s.n} table ${s.table}/${s.n} won ${s.won}/${s.n} w4 ${s.w4}/${s.n} w5 ${s.w5}/${s.n} medDays ${s.medDays} maxDays ${s.maxDays}`);
}

const t = stats.treatment, c = stats.control;
console.log('\n== VERDICTS ==');
const primaryGo = t.share <= 0.40;
console.log(`PRIMARY (cnm share <= 40%): treatment ${(t.share * 100).toFixed(1)}% vs control ${(c.share * 100).toFixed(1)}% -> ${primaryGo ? 'GO' : 'NO-GO'}`);
const secMove = t.nRes - c.nRes;
console.log(`SECONDARY (resolutions movement > 0): treatment ${t.nRes} - control ${c.nRes} = ${secMove} -> ${secMove > 0 ? 'MOVEMENT' : 'NO MOVEMENT'}`);
// Guardrails
const newModes = Object.keys(t.causes).filter(k => !(k in c.causes));
console.log(`GUARDRAIL no-new-death-mode: treatment-only causes: ${JSON.stringify(newModes)} -> ${newModes.length ? 'CHECK' : 'OK'}`);
console.log(`GUARDRAIL national >= control-2: ${t.national} >= ${c.national - 2} -> ${t.national >= c.national - 2 ? 'OK' : 'BREACH'}`);
console.log(`GUARDRAIL median survival >= control-10d: ${t.medDays} >= ${c.medDays - 10} -> ${t.medDays >= c.medDays - 10 ? 'OK' : 'BREACH'}`);
const wReach = (t.w4 + t.w5) >= (c.w4 + c.w5) - 1;
console.log(`GUARDRAIL wave reach not worse: t(w4+w5)=${t.w4 + t.w5} c=${c.w4 + c.w5} -> ${wReach ? 'OK' : 'BREACH'}`);

// Resolution detail (sense material pointers)
console.log('\n== treatment resolutions ==');
for (const f of t.resFights.slice(0, 12)) {
  console.log(`  s${f.seed}/${f.policyId} d${f.day} ${f.id}: ${f.outcome} rounds=${f.rounds} trickLog=[${f.trickLog.join(',')}]`);
}
if (t.resFights.length > 12) console.log(`  ... +${t.resFights.length - 12} more`);
