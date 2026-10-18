#!/usr/bin/env node
// analyze-fightopen4.js — judge for the sim-fightopen4 pilot sweep.
//
// Reads evidence/2026-10-18/perseed-fightopen4/*-fightopen4-{armed,control}.json
// and reports against the pre-registered metrics (evidence header):
//
// PRIMARY (binding, §14): conditions-never-met share on post-learning
//   wave-4 field fights vs OPENER-ELIGIBLE species (congregation, reunion,
//   editor, cancellation, audit — the five species the landed FIGHTOPEN
//   block actuates) — armed <= 20% AND control >= 80%.
//   Calibration: fightopen round-2 measured 0.0% vs 95.2% on the same pool
//   shape (w4/5 opener-eligible, pre-seat courtship); the wave-4 bar here
//   is the confirm on the readiness substrate.
// POOL GATE (pre-registered, reunioncost precedent): >= 12 wave-4 trick
//   fights per side; else INCONCLUSIVE — never re-scored against a
//   friendlier pool.
// SECONDARY: resolutions movement > 0 on the same pool (counterwire
//   metric-review definition: trick-attributed kill OR mFlee/vFlee with
//   >= 2 trick actions in trickLog).
// Guardrails: median survival >= control - 10d · wave-4 unlock share >=
//   control - 2 · no new death mode (no armed-only death causes).
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.FIGHTOPEN4_EVID || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-fightopen4');

// The five species the landed FIGHTOPEN block actuates
// (src/js/fieldFights.js villagerTrickAction, FIGHTOPEN=1 branch).
const OPENER_SPECIES = new Set(['congregation', 'reunion', 'editor', 'cancellation', 'audit']);
const OPENER_TOKENS = new Set(['argue', 'wait:reunion-novel', 'continuity', 'offscript', 'inefficient']);

function load() {
  const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
  const runs = { armed: [], control: [] };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
    if (j.armId === 'armed') runs.armed.push(j);
    else if (j.armId === 'control') runs.control.push(j);
  }
  return runs;
}

function funnelFights4(run) {
  // Post-learning FIELD fights vs opener-eligible species at wave >= 4.
  const out = [];
  for (const l of (run.funnel || [])) {
    if ((l.wave || 1) < 4) continue;
    if (!OPENER_SPECIES.has(l.id)) continue;
    for (const f of (l.fights || [])) {
      if (f.path !== 'field') continue;
      out.push({ cls: f.cls, sub: f.sub, outcome: f.outcome, trickLog: f.trickLog || [], rounds: f.rounds, id: l.id, learnId: l.learnId, day: f.day, seed: run.seed, policyId: run.policyId });
    }
  }
  return out;
}

function resolutions(fights) {
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
console.log(`runs: armed=${runs.armed.length} control=${runs.control.length}`);
if (!runs.armed.length || !runs.control.length) { console.error('ANALYZE STOP: missing arm'); process.exit(2); }

const stats = {};
for (const arm of ['armed', 'control']) {
  const fights = runs[arm].flatMap(funnelFights4);
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

for (const arm of ['armed', 'control']) {
  const s = stats[arm];
  console.log(`\n== ${arm} (n=${s.n}) ==`);
  console.log(`  wave-4 opener-eligible post-learning field fights: ${s.fights}`);
  console.log(`  conditions-never-met: ${s.cnm}/${s.fights} = ${Number.isNaN(s.share) ? 'n/a' : (s.share * 100).toFixed(1) + '%'}`);
  console.log(`  funnel classes: ${JSON.stringify(s.clsCounts)}`);
  console.log(`  resolutions: ${s.nRes} (movement target)`);
  console.log(`  fights with any trick fire: ${s.fires}; opener-first fights: ${s.openers}`);
  console.log(`  wall: national ${s.national}/${s.n} table ${s.table}/${s.n} won ${s.won}/${s.n} w4 ${s.w4}/${s.n} w5 ${s.w5}/${s.n} medDays ${s.medDays} maxDays ${s.maxDays}`);
}

const t = stats.armed, c = stats.control;
console.log('\n== VERDICTS ==');
const poolOk = t.fights >= 12 && c.fights >= 12;
console.log(`POOL GATE (>= 12 wave-4 trick fights per side): armed ${t.fights} control ${c.fights} -> ${poolOk ? 'HONEST POOL' : 'INCONCLUSIVE (insufficient data)'}`);
const primaryGo = poolOk && t.share <= 0.20 && c.share >= 0.80;
console.log(`PRIMARY (armed cnm <= 20% AND control cnm >= 80%): armed ${Number.isNaN(t.share) ? 'n/a' : (t.share * 100).toFixed(1) + '%'} vs control ${Number.isNaN(c.share) ? 'n/a' : (c.share * 100).toFixed(1) + '%'} -> ${primaryGo ? 'GO' : (poolOk ? 'NO-GO' : 'INCONCLUSIVE')}`);
const secMove = t.nRes - c.nRes;
console.log(`SECONDARY (resolutions movement > 0): armed ${t.nRes} - control ${c.nRes} = ${secMove} -> ${secMove > 0 ? 'MOVEMENT' : 'NO MOVEMENT'}`);
const newModes = Object.keys(t.causes).filter(k => !(k in c.causes));
console.log(`GUARDRAIL no-new-death-mode: armed-only causes: ${JSON.stringify(newModes)} -> ${newModes.length ? 'CHECK' : 'OK'}`);
console.log(`GUARDRAIL wave-4 unlock share >= control-2: ${t.w4} >= ${c.w4 - 2} -> ${t.w4 >= c.w4 - 2 ? 'OK' : 'BREACH'}`);
console.log(`GUARDRAIL median survival >= control-10d: ${t.medDays} >= ${c.medDays - 10} -> ${t.medDays >= c.medDays - 10 ? 'OK' : 'BREACH'}`);

console.log('\n== armed resolutions ==');
for (const f of t.resFights.slice(0, 12)) {
  console.log(`  s${f.seed}/${f.policyId} d${f.day} ${f.id}: ${f.outcome} rounds=${f.rounds} trickLog=[${f.trickLog.join(',')}]`);
}
if (t.resFights.length > 12) console.log(`  ... +${t.resFights.length - 12} more`);
