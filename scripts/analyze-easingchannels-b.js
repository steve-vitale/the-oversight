#!/usr/bin/env node
// analyze-easingchannels-b.js — easing-channel decomposition analyzer
// (sim-easingchannels-b, 2026-10-23). Reads the 8 cell sweep JSONs (or the
// per-seed corpus) and judges the pre-registered primary + guardrails.
//
// PRIMARY (per feast-side, per DG setting — PD=1 vs PD=0, paired by seed):
//   (i)  funnel.share THROTTLE: funnel.share raw kcal/glut-day + depriKcal/glut-day
//   (ii) away_wild COMPENSATION: away_wild kcal/glut-day + away.return kcal/glut-day
// DIAG-GO: both sub-claims measured; >=90% marginal-glut inflow attributed
//   to named channels on all four cells.
// GUARDRAILS (per feast-side, per DG): (a) median paired survival diff >= -10d;
//   (b) exposure-normalized starvation; (c) no new death modes; (d) national >= control-2;
//   (e) freshDays >= 0.5x control.
// Usage: node scripts/analyze-easingchannels-b.js [SWEEPDIR]
// Exit 0 = DIAG-GO, 1 = NO-GO (or missing data).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const DIR = process.argv[2] || path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-easingchannels-b');
const CELLS = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
const POLICIES = ['leadfeast', 'belongfeast'];

const med = xs => { const s = xs.filter(x => x != null).sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const mean = xs => { const s = xs.filter(x => x != null); return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null; };

function loadCell(cell, policy) {
  const p = path.join(DIR, `sweep-${cell}-${policy}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return j.rows || [];
  } catch (e) { return null; }
}

let fail = 0;
const verdict = (name, cond, detail) => {
  console.log((cond ? 'GO  ' : 'NO-GO') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) fail++;
};

const allRows = {};
for (const policy of POLICIES) for (const cell of CELLS) {
  const rows = loadCell(cell, policy);
  allRows[policy + '/' + cell] = rows;
  if (!rows) console.log('MISSING sweep-' + cell + '-' + policy + '.json');
}

let anyMissing = false;
for (const k of Object.keys(allRows)) if (!allRows[k]) anyMissing = true;
if (anyMissing) { console.log('ANALYZER: missing cells — cannot judge'); process.exit(1); }

// ---------- per feast-side, per DG: PD=1 vs PD=0 ----------
for (const policy of POLICIES) {
  for (const dg of ['dg0', 'dg1']) {
    const c0 = allRows[policy + '/pd0' + dg], c1 = allRows[policy + '/pd1' + dg];
    const tag = `${policy}/${dg}`;
    const bySeed0 = Object.fromEntries(c0.map(r => [r.seed, r]));
    const bySeed1 = Object.fromEntries(c1.map(r => [r.seed, r]));
    const seeds = Object.keys(bySeed0).filter(s => bySeed1[s]).map(Number).sort((a, b) => a - b);

    const g = r => (r.extra || {});
    // (i) THROTTLE: funnel.share raw kcal per glut-day
    const fs0 = seeds.map(s => g(bySeed0[s]).funnelSharePerGlutDay);
    const fs1 = seeds.map(s => g(bySeed1[s]).funnelSharePerGlutDay);
    const dFs = med(fs1) - med(fs0);
    const depri0 = seeds.map(s => g(bySeed0[s]).depriKcalPerGlutDay || 0);
    const depri1 = seeds.map(s => g(bySeed1[s]).depriKcalPerGlutDay || 0);
    console.log(`\n[${tag}] (i) funnel.share THROTTLE — raw kcal/glut-day: pd0 med ${med(fs0) == null ? 'n/a' : med(fs0).toFixed(0)} vs pd1 med ${med(fs1) == null ? 'n/a' : med(fs1).toFixed(0)} (Δ ${dFs == null ? 'n/a' : dFs.toFixed(0)}); eased-share (depriKcal) per glut-day: pd0 med ${med(depri0).toFixed(0)} vs pd1 med ${med(depri1).toFixed(0)}`);
    verdict(`${tag} throttle: funnel.share raw/glut-day DOWN under PD=1`, dFs != null && dFs < 0, `Δ=${dFs == null ? 'n/a' : dFs.toFixed(0)} kcal/glut-day`);

    // (ii) COMPENSATION: away_wild kcal per glut-day (+ away.return total)
    const aw0 = seeds.map(s => g(bySeed0[s]).awayWildPerGlutDay);
    const aw1 = seeds.map(s => g(bySeed1[s]).awayWildPerGlutDay);
    const dAw = med(aw1) - med(aw0);
    const ar0 = seeds.map(s => g(bySeed0[s]).awayReturnPerGlutDay);
    const ar1 = seeds.map(s => g(bySeed1[s]).awayReturnPerGlutDay);
    const dAr = med(ar1) - med(ar0);
    console.log(`[${tag}] (ii) away_wild COMPENSATION — away_wild kcal/glut-day: pd0 med ${med(aw0) == null ? 'n/a' : med(aw0).toFixed(0)} vs pd1 med ${med(aw1) == null ? 'n/a' : med(aw1).toFixed(0)} (Δ ${dAw == null ? 'n/a' : dAw.toFixed(0)}); away.return kcal/glut-day: pd0 med ${med(ar0) == null ? 'n/a' : med(ar0).toFixed(0)} vs pd1 med ${med(ar1) == null ? 'n/a' : med(ar1).toFixed(0)} (Δ ${dAr == null ? 'n/a' : dAr.toFixed(0)})`);
    // compensation is a MEASURED sub-claim, not a GO/NO-GO gate — report direction
    console.log(`[${tag}] compensation direction: ${dAw == null ? 'n/a' : (dAw > 0 ? 'UP (compensates)' : dAw < 0 ? 'DOWN (no compensation)' : 'FLAT')}`);

    // attribution per cell
    for (const [cell, rows] of [['pd0' + dg, c0], ['pd1' + dg, c1]]) {
      const attrs = rows.map(r => (r.extra || {}).attribution).filter(x => x != null);
      const minA = Math.min(...attrs);
      verdict(`${policy}/${cell} attribution>=90%`, minA >= 0.90, `min=${(minA * 100).toFixed(1)}% n=${attrs.length}`);
    }

    // guardrails
    const surv0 = seeds.map(s => bySeed0[s].daysAlive), surv1 = seeds.map(s => bySeed1[s].daysAlive);
    const pdiff = seeds.map(s => bySeed1[s].daysAlive - bySeed0[s].daysAlive);
    verdict(`${tag} (a) median paired survival diff >= -10d`, med(pdiff) >= -10, `med Δ=${med(pdiff)}d`);

    const vd0 = c0.reduce((t, r) => t + (r.villageDays || 0), 0), vd1 = c1.reduce((t, r) => t + (r.villageDays || 0), 0);
    const sd0 = c0.reduce((t, r) => t + ((r.extra || {}).starveDeaths || 0), 0), sd1 = c1.reduce((t, r) => t + ((r.extra || {}).starveDeaths || 0), 0);
    const rate0 = vd0 ? sd0 / vd0 * 100 : 0, rate1 = vd1 ? sd1 / vd1 * 100 : 0;
    verdict(`${tag} (b) exposure-normalized starvation`, rate1 <= rate0 + 2 / (vd1 / 100), `pd1 ${rate1.toFixed(2)}/100vd vs pd0 ${rate0.toFixed(2)}/100vd`);

    const fams = rows => { const s = new Set(); for (const r of rows) for (const k of Object.keys(r.deathCauses || {})) s.add(k.split(':')[0]); return s; };
    const f0 = fams(c0), f1 = fams(c1);
    const newModes = [...f1].filter(x => !f0.has(x));
    verdict(`${tag} (c) no new death modes`, newModes.length === 0, newModes.length ? 'new: ' + newModes.join(',') : 'none');

    const n0 = c0.filter(r => r.national).length, n1 = c1.filter(r => r.national).length;
    verdict(`${tag} (d) national >= control-2`, n1 >= n0 - 2, `pd1 ${n1} vs pd0 ${n0}`);

    const fr0 = c0.map(r => r.freshDaysMedian).filter(x => x != null), fr1 = c1.map(r => r.freshDaysMedian).filter(x => x != null);
    verdict(`${tag} (e) freshDays >= 0.5x control`, med(fr1) >= 0.5 * med(fr0), `pd1 med ${med(fr1)} vs pd0 med ${med(fr0)}`);

    // wall numbers
    const wall = rows => ({
      national: rows.filter(r => r.national).length,
      everNational: rows.filter(r => (r.extra || {}).everNational).length,
      table: rows.filter(r => r.table).length,
      win: rows.filter(r => r.win).length,
      wave4: rows.filter(r => (r.extra || {}).wave4).length,
      wave5: rows.filter(r => (r.extra || {}).wave5).length,
      medSurv: med(rows.map(r => r.daysAlive)),
      maxSurv: Math.max(...rows.map(r => r.daysAlive)),
    });
    console.log(`[${tag}] WALL pd0:`, JSON.stringify(wall(c0)), 'pd1:', JSON.stringify(wall(c1)));
    // secondary: rot
    const rot0 = c0.map(r => (r.extra || {}).rot100d), rot1 = c1.map(r => (r.extra || {}).rot100d);
    console.log(`[${tag}] rot/100d: pd0 med ${med(rot0)} vs pd1 med ${med(rot1)}`);
  }
}

console.log(fail ? `\nANALYZER: ${fail} NO-GO lines` : '\nANALYZER: ALL GO');
process.exit(fail ? 1 : 0);
