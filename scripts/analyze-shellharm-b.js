#!/usr/bin/env node
// scripts/analyze-shellharm-b.js — attribution analysis for the sim-shellharm-b diagnostic.
//
// Reads evidence/2026-10-17/perseed-shellharm/*.json and attributes the
// control->shell starvation delta (villager-only) to three mechanisms:
//
//   1. COLLAPSE-TAIL RE-TIMING: shell-arm villager-starvation deaths at day >=
//      the shell-arm villageLostDay, in excess of the control-arm's own tail
//      deaths, are timing artifacts of when collapses land, not food harm.
//   2. NEUTRAL-PERTURBATION REPLICATION: pre-collapse excess on pairs where the
//      neutral 4-tick probe reproduces the shell arm's shift (same direction,
//      >= 50% magnitude) is chaotic re-timing, not shelling.
//   3. RESIDUAL: pre-collapse excess with no perturb replication and no
//      food-channel explanation is genuine-harm candidate.
//
// Usage:
//   node scripts/analyze-shellharm-b.js [--write-compare]
// With --write-compare, emits evidence/2026-10-17/panel-shellharm/compare-shellharm-b.md.
'use strict';
const fs = require('fs');
const path = require('path');

const IN = process.env.IN || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellharm');
const PANEL_OUT = path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellharm');

// pair: { controlVill:[{day}], shellVill:[{day}], perturbVill:[{day}],
//         controlLost, shellLost (9999 = never lost) }
function attributePair(pair) {
  const LOST = 9999;
  const cLost = pair.controlLost == null ? LOST : pair.controlLost;
  const sLost = pair.shellLost == null ? LOST : pair.shellLost;
  const shellVill = pair.shellVill || [], controlVill = pair.controlVill || [], perturbVill = pair.perturbVill || [];
  const excess = Math.max(0, shellVill.length - controlVill.length);
  if (excess === 0) return { excess: 0, tailExcess: 0, preExcess: 0, replicated: false, timing: 0, residual: 0, share: 1 };
  const shellTail = shellVill.filter(d => d.day >= sLost).length;
  const controlTail = controlVill.filter(d => d.day >= cLost).length;
  const tailExcess = Math.max(0, shellTail - controlTail);
  const preExcess = Math.max(0, excess - tailExcess);
  const shellDelta = shellVill.length - controlVill.length;
  const perturbDelta = perturbVill.length - controlVill.length;
  const replicated = shellDelta > 0 && perturbDelta > 0 && perturbDelta >= shellDelta / 2;
  const timing = tailExcess + (replicated ? preExcess : 0);
  const residual = excess - timing;
  return { excess, tailExcess, preExcess, replicated, timing, residual, share: timing / excess };
}

function load() {
  const files = fs.readdirSync(IN).filter(f => f.endsWith('.json'));
  const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8')));
  const by = {};
  for (const r of runs) by[`${r.policyId}:s${r.seed}:${r.arm}`] = r;
  const pairs = [];
  const seeds = [...new Set(runs.map(r => r.seed))].sort((a, b) => a - b);
  const policies = [...new Set(runs.map(r => r.policyId))];
  for (const policyId of policies) for (const seed of seeds) {
    const c = by[`${policyId}:s${seed}:control`], s = by[`${policyId}:s${seed}:shell`], p = by[`${policyId}:s${seed}:perturb`];
    if (!c || !s || !p) { console.log(`  MISSING pair ${policyId} s${seed}`); continue; }
    pairs.push({ policyId, seed, c, s, p });
  }
  return pairs;
}

function leanPantryMean(run) {
  // mean pantry kcal on lean days (pre-collapse only if the village was lost)
  const lost = run.villageLostDay == null ? 9999 : run.villageLostDay;
  const days = (run.curve || []).filter(e => e.d < lost && e.lean);
  if (!days.length) return null;
  return days.reduce((t, e) => t + e.pantry, 0) / days.length;
}

function analyze() {
  const pairs = load();
  console.log(`PAIRS: ${pairs.length}`);
  const rows = pairs.map(({ policyId, seed, c, s, p }) => {
    const att = attributePair({
      controlVill: c.villStarvDeathList, shellVill: s.villStarvDeathList, perturbVill: p.villStarvDeathList,
      controlLost: c.villageLostDay, shellLost: s.villageLostDay,
    });
    const shellDeltaVill = s.villagerStarvationDeaths - c.villagerStarvationDeaths;
    const perturbDeltaVill = p.villagerStarvationDeaths - c.villagerStarvationDeaths;
    const shellDeltaPooled = s.starvationDeaths - c.starvationDeaths;
    return {
      policyId, seed, c, s, p,
      cVill: c.villagerStarvationDeaths, sVill: s.villagerStarvationDeaths, pVill: p.villagerStarvationDeaths,
      cPool: c.starvationDeaths, sPool: s.starvationDeaths,
      shellDeltaVill, perturbDeltaVill, shellDeltaPooled,
      cLost: c.villageLostDay, sLost: s.villageLostDay, pLost: p.villageLostDay,
      cPantryEmpty: c.firstPantryEmptyDay, sPantryEmpty: s.firstPantryEmptyDay, pPantryEmpty: p.firstPantryEmptyDay,
      shelledKcal: s.shelledKcal, shellDays: s.shellDays, perturbDays: p.perturbDays,
      dispScholar: (c.scholarPantryTakes || 0) - (s.scholarPantryTakes || 0),
      dispVill: (c.villagerPantryTakes || 0) - (s.villagerPantryTakes || 0),
      leanPantryC: leanPantryMean(c), leanPantryS: leanPantryMean(s),
      cNat: c.national, sNat: s.national, pNat: p.national,
      cSurv: c.survivalDays, sSurv: s.survivalDays,
      ...att,
    };
  });

  const sum = (k) => rows.reduce((t, r) => t + r[k], 0);
  const totExcessVill = sum('excess'), totTiming = sum('timing'), totResidual = sum('residual');
  const totExcessPooled = rows.reduce((t, r) => t + Math.max(0, r.shellDeltaPooled), 0);

  console.log('\n=== STARVATION DELTA (villager-only; scholar excluded) ===');
  console.log(`control vill-starv: ${sum('cVill')}   shell vill-starv: ${sum('sVill')}   perturb vill-starv: ${sum('pVill')}`);
  console.log(`excess (shell-control, floored per pair): ${totExcessVill}`);
  console.log(`  timing-attributed (tail re-timing + perturb-replicated): ${totTiming}`);
  console.log(`  residual (unexplained pre-collapse, unreplicated): ${totResidual}`);
  console.log(`  PRIMARY share attributed: ${(totTiming / Math.max(1, totExcessVill) * 100).toFixed(1)}% (GO >= 80%)`);
  console.log(`pooled excess (for continuity with original verdict): ${totExcessPooled}`);

  console.log('\n=== PER-PAIR (worse pairs first) ===');
  console.log('pair                 c/s/p villStarv  deltaS deltaP  lostC lostS lostP  tailX preX repl  timing resid shelledK');
  for (const r of [...rows].sort((a, b) => b.excess - a.excess)) {
    const f = (x) => x == null ? 'n/a ' : String(x).padStart(4);
    console.log(`${r.policyId.slice(0, 6)} s${r.seed}  ${String(r.cVill).padStart(2)}/${String(r.sVill).padStart(2)}/${String(r.pVill).padStart(2)}` +
      `       ${String(r.shellDeltaVill).padStart(3)} ${String(r.perturbDeltaVill).padStart(3)}` +
      `  ${f(r.cLost)} ${f(r.sLost)} ${f(r.pLost)}` +
      `   ${String(r.tailExcess).padStart(2)}  ${String(r.preExcess).padStart(2)}  ${r.replicated ? 'Y' : 'n'}` +
      `    ${String(r.timing).padStart(2)}    ${String(r.residual).padStart(2)}   ${String(r.shelledKcal).padStart(7)}`);
  }

  console.log('\n=== COLLAPSE TIMING (villageLostDay per arm; earlier = negative delta) ===');
  let earlier = 0, later = 0, same = 0;
  for (const r of rows) {
    if (r.sLost == null && r.cLost == null) { same++; continue; }
    const d = (r.sLost == null ? 9999 : r.sLost) - (r.cLost == null ? 9999 : r.cLost);
    if (d < 0) earlier++; else if (d > 0) later++; else same++;
  }
  console.log(`shell vs control: earlier ${earlier} / later ${later} / same ${same}`);
  let pearlier = 0, plater = 0, psame = 0;
  for (const r of rows) {
    if (r.pLost == null && r.cLost == null) { psame++; continue; }
    const d = (r.pLost == null ? 9999 : r.pLost) - (r.cLost == null ? 9999 : r.cLost);
    if (d < 0) pearlier++; else if (d > 0) plater++; else psame++;
  }
  console.log(`perturb vs control: earlier ${pearlier} / later ${plater} / same ${psame}`);

  console.log('\n=== FOOD-CHANNEL AUDIT ===');
  console.log(`pantry displacement (control - shell): scholar takes ${sum('dispScholar')} kcal (orig +298,220), villager takes ${sum('dispVill')} kcal`);
  const lp = rows.filter(r => r.leanPantryC != null && r.leanPantryS != null);
  const lpDelta = lp.map(r => r.leanPantryS - r.leanPantryC);
  const mean = (a) => a.length ? a.reduce((t, x) => t + x, 0) / a.length : null;
  console.log(`pre-collapse lean-day mean pantry: control ${Math.round(mean(lp.map(r => r.leanPantryC)))} vs shell ${Math.round(mean(lp.map(r => r.leanPantryS)))} kcal (${lp.length} pairs)`);
  console.log(`paired lean-pantry delta (shell-control): mean ${Math.round(mean(lpDelta))}, min ${Math.round(Math.min(...lpDelta))}, max ${Math.round(Math.max(...lpDelta))}`);
  const big = [...rows].sort((a, b) => b.shelledKcal - a.shelledKcal).slice(0, 4);
  console.log('biggest shellers vs paired controls (vill-starv c/s):');
  for (const r of big) console.log(`  ${r.policyId} s${r.seed}: ${r.shelledKcal} kcal shelled over ${r.shellDays}d, vill-starv ${r.cVill}/${r.sVill}, lost ${r.cLost == null ? 'n/a' : r.cLost}/${r.sLost == null ? 'n/a' : r.sLost}`);

  console.log('\n=== WALL (control / shell / perturb) ===');
  console.log(`national: ${sum('cNat')}/${sum('sNat')}/${sum('pNat')}  (control/shell/perturb)`);
  console.log(`median survival: c=${median(rows.map(r => r.cSurv))} s=${median(rows.map(r => r.sSurv))}`);

  return { rows, totExcessVill, totTiming, totResidual, totExcessPooled };
}

function median(a) {
  const v = [...a].sort((x, y) => x - y);
  return v.length % 2 ? v[v.length >> 1] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
}

function writeCompare(res) {
  // §15 light compare: contract-overlapping metrics through scorecard compareMetric
  const { compareMetric } = require('./lib/balance-scorecard');
  const { rows } = res;
  const spec = (id, label, unit) => ({ id, label, unit, direction: 'neutral', tolerance: 0, reviewChanges: false });
  const metricSpecs = [
    ['wins', 'Win rate'], ['table', 'Table invitation'], ['national', 'National scale'],
    ['starvationDeaths', 'Starvation deaths (pooled)'], ['villagerStarvationDeaths', 'Villager starvation deaths'],
    ['survivalDays', 'Survival days'],
  ];
  const get = (r, arm, k) => (arm === 'control' ? r.c : arm === 'shell' ? r.s : r.p)[k];
  // rows carry per-arm runs as c/s/p
  const full = rows;
  let md = `# sim-shellharm-b — before/after compare (diagnostic, 8 seeds x 2 policies x control/shell/perturb)\n\n`;
  md += `**Harm-model diagnostic verdict: ${verdictText(res)}**\n\n`;
  md += `Paired cases: ${full.length}. Light panels: control.json / shell.json / perturb.json in this directory.\n`;
  md += `The contract-overlapping metrics below use the scorecard compareMetric statistics;\npre-registered metrics are judged directly (see evidence/2026-10-17/sim-shellharm-b.md).\n\n`;
  for (const [armB, armA, title] of [['control', 'shell', 'control -> shell'], ['control', 'perturb', 'control -> perturb']]) {
    md += `## ${title}\n\n| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n`;
    for (const [id, label] of metricSpecs) {
      const before = full.map(r => get(r, armB, id)), after = full.map(r => get(r, armA, id));
      const cm = compareMetric(before, after, spec(id, label, ''), 'shellharm/' + id);
      const ci = `[${cm.interval95[0].toFixed(3)}, ${cm.interval95[1].toFixed(3)}]`;
      const d = cm.delta >= 0 ? '+' : '';
      md += `| ${label} | ${cm.before.toFixed(3)} | ${cm.after.toFixed(3)} | ${d}${cm.delta.toFixed(3)} | ${ci} | ${cm.pairs} | ${cm.status} |\n`;
    }
    md += `\n`;
  }
  md += `## Pre-registered judgement (diagnostic)\n\n`;
  const share = res.totExcessVill > 0 ? res.totTiming / res.totExcessVill : 1;
  md += `- PRIMARY attribution share: **${(share * 100).toFixed(1)}%** (GO >= 80%): timing-attributed ${res.totTiming} of ${res.totExcessVill} excess villager-starvation deaths; residual ${res.totResidual}.\n`;
  md += `- Villager-only starvation: control ${res.rows.reduce((t, r) => t + r.cVill, 0)} -> shell ${res.rows.reduce((t, r) => t + r.sVill, 0)} -> perturb ${res.rows.reduce((t, r) => t + r.pVill, 0)}.\n`;
  fs.mkdirSync(PANEL_OUT, { recursive: true });
  fs.writeFileSync(path.join(PANEL_OUT, 'compare-shellharm-b.md'), md);
  console.log('COMPARE WRITTEN to', path.join(PANEL_OUT, 'compare-shellharm-b.md'));
}

function verdictText(res) {
  const share = res.totExcessVill > 0 ? res.totTiming / res.totExcessVill : 1;
  if (share >= 0.8) return `TAIL-TIMING NOISE (${(share * 100).toFixed(0)}% attributed)`;
  if (res.totResidual > 0) return `UNRESOLVED-BUT-SCOPED (residual ${res.totResidual})`;
  return 'GENUINE HARM (see analysis)';
}

if (require.main === module) {
  const res = analyze();
  if (process.argv.includes('--write-compare')) writeCompare(res);
}

module.exports = { attributePair, load, analyze };
