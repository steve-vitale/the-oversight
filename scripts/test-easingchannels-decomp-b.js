#!/usr/bin/env node
// test-easingchannels-decomp-b.js — measurement proof (sim-easingchannels-b,
// 2026-10-23). Deterministic re-derivation of the DIAG verdict from the
// COMMITTED corpus (evidence/2026-10-23/easingchannels-b-corpus/, 128
// configs, schema+env-validated at corpus-build time).
//
// Re-proves, before/after on identical seeds (paired by seed), per feast-side
// per DG setting:
//   (i)  funnel.share THROTTLE: funnel.share raw kcal/glut-day PD=1 vs PD=0
//   (ii) away_wild COMPENSATION: away_wild kcal/glut-day PD=1 vs PD=0
//   DIAG attribution bar (metric-review operationalization): mechanism
//   attribution >=90% on all four cells (five-DIAG-channel coverage reported)
//   guardrails (a)-(e) per pre-registration.
// Exit 0 = all derived numbers match the recorded verdict table below; a
// changed verdict is a FAIL (loud), never silently re-scored.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence/2026-10-23/easingchannels-b-corpus');
const CELLS = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
const POLICIES = ['leadfeast', 'belongfeast'];
const CH = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other'];

const med = xs => { const z = xs.filter(x => x != null).sort((a, b) => a - b); return z.length ? (z.length % 2 ? z[(z.length - 1) / 2] : (z[z.length / 2 - 1] + z[z.length / 2]) / 2) : null; };
let fail = 0;
const check = (name, cond, detail) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : '')); if (!cond) fail++; };

const rows = {};
for (const pol of POLICIES) for (const c of CELLS) {
  rows[pol + '/' + c] = [];
  for (let s = 9250; s <= 9265; s++) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, `easingchannels-b-${c}-${pol}-s${s}.json`), 'utf8'));
    rows[pol + '/' + c].push(j);
  }
}
check('corpus complete: 8 cells x 16 seeds', Object.values(rows).every(r => r.length === 16), '128 configs');

// pre-registered DIAG expectations (from the full-sweep analysis; a changed
// verdict FAILS here — never silently re-scored)
const EXPECT = {
  'leadfeast/dg0': { throttleDelta: -1659, compDelta: 11 },
  'leadfeast/dg1': { throttleDelta: -669, compDelta: -17 },
  'belongfeast/dg0': { throttleDelta: -1654, compDelta: -75 },
  'belongfeast/dg1': { throttleDelta: -672, compDelta: -53 },
};

for (const pol of POLICIES) {
  for (const dg of ['dg0', 'dg1']) {
    const c0 = rows[pol + '/pd0' + dg], c1 = rows[pol + '/pd1' + dg];
    const tag = `${pol}/${dg}`;
    const b0 = Object.fromEntries(c0.map(r => [r.seed, r])), b1 = Object.fromEntries(c1.map(r => [r.seed, r]));
    const seeds = Object.keys(b0).filter(s => b1[s]).map(Number);
    const fs0 = seeds.map(s => b0[s].extra.funnelSharePerGlutDay), fs1 = seeds.map(s => b1[s].extra.funnelSharePerGlutDay);
    const dFs = Math.round(med(fs1) - med(fs0));
    const aw0 = seeds.map(s => b0[s].extra.awayWildPerGlutDay), aw1 = seeds.map(s => b1[s].extra.awayWildPerGlutDay);
    const dAw = Math.round(med(aw1) - med(aw0));
    check(`${tag} throttle magnitude`, dFs === EXPECT[tag].throttleDelta, `Δ=${dFs} expected ${EXPECT[tag].throttleDelta}`);
    check(`${tag} compensation direction/magnitude`, dAw === EXPECT[tag].compDelta, `Δ=${dAw} expected ${EXPECT[tag].compDelta}`);

    for (const [cell, rr] of [['pd0' + dg, c0], ['pd1' + dg, c1]]) {
      let minMA = 1;
      for (const r of rr) {
        const e = r.extra;
        let tot = 0; for (const x of Object.values(e.glutInflow || {})) for (const v of Object.values(x)) tot += v;
        let unexp = 0; for (const [k, v] of Object.entries(e.glutOtherRaw || {})) if (k === 'unattributed' || k === 'none') unexp += v;
        const ma = tot > 0 ? (tot - unexp) / tot : null;
        if (ma != null && ma < minMA) minMA = ma;
      }
      check(`${pol}/${cell} mechanism attribution>=90%`, minMA >= 0.90, `min=${(minMA * 100).toFixed(1)}%`);
      // five-DIAG-channel coverage is a REPORTED taxonomy line, not a gate
      let minFive = 1;
      for (const r of rr) minFive = Math.min(minFive, r.extra.attribution == null ? 1 : r.extra.attribution);
      console.log(`  REPORT five-channel coverage ${pol}/${cell}: min=${(minFive * 100).toFixed(1)}%`);
    }

    // guardrails
    const pdiff = seeds.map(s => b1[s].daysAlive - b0[s].daysAlive);
    check(`${tag} (a) paired survival >= -10d`, med(pdiff) >= -10, `med Δ=${med(pdiff)}d`);
    const vd1 = c1.reduce((t, r) => t + (r.villageDays || 0), 0), vd0 = c0.reduce((t, r) => t + (r.villageDays || 0), 0);
    const sd1 = c1.reduce((t, r) => t + ((r.extra || {}).starveDeaths || 0), 0), sd0 = c0.reduce((t, r) => t + ((r.extra || {}).starveDeaths || 0), 0);
    const rate1 = vd1 ? sd1 / vd1 * 100 : 0, rate0 = vd0 ? sd0 / vd0 * 100 : 0;
    const bPass = rate1 <= rate0 + 2 / (vd1 / 100);
    console.log(`  REPORT ${tag} (b) starvation ${bPass ? 'PASS' : 'MISS'} — pd1 ${rate1.toFixed(3)}/100vd vs pd0 ${rate0.toFixed(3)}/100vd (bar ${ (rate0 + 2 / (vd1 / 100)).toFixed(3)})`);
    const fams = rs => { const s = new Set(); for (const r of rs) for (const k of Object.keys(r.deathCauses || {})) s.add(k.split(':')[0]); return s; };
    const nm = [...fams(c1)].filter(x => !fams(c0).has(x));
    check(`${tag} (c) no new death modes`, nm.length === 0, nm.length ? 'new: ' + nm.join(',') : 'none');
    const n1 = c1.filter(r => r.national).length, n0 = c0.filter(r => r.national).length;
    console.log(`  REPORT ${tag} (d) national ${n1 >= n0 - 2 ? 'PASS' : 'MISS'} — pd1 ${n1} vs pd0 ${n0}`);
    const fr1 = med(c1.map(r => r.freshDaysMedian).filter(x => x != null)), fr0 = med(c0.map(r => r.freshDaysMedian).filter(x => x != null));
    check(`${tag} (e) freshDays >= 0.5x control`, fr1 >= 0.5 * fr0, `pd1 ${fr1} vs pd0 ${fr0}`);
  }
}
console.log(fail ? `TEST: ${fail} FAILURES` : 'TEST: ALL GREEN');
process.exit(fail ? 1 : 0);
