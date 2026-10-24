#!/usr/bin/env node
// analyze-pdtradeoff-b.js — DIAG analyzer for sim-pdtradeoff-b (2026-10-24,
// oversight-flesh-out-loop-b, axis food-economy). Measurement only.
//
// PRIMARY (DIAG, binding as a measurement): the four PD=1/PD=0 rot/100d
// ratios — rot/100d = sum(rotFreshKcal+rotPreservedKcal)/sum(daysAlive)*100
// (the SAME operationalization as the depinteraction/bufferdepri substrate
// runs; see analyze-bufferdepri-b.js rot100). DIAG-GO either way — the flag
// is resolved BY the numbers:
//   - leadfeast/dg1 reproduces ~1.033x -> current master has a different
//     PD=1 rot effect on dg1 than the depinteraction substrate (drift
//     confirmed; candidate drift commits are named in the evidence file via
//     git log on the relevant regions).
//   - leadfeast/dg1 reproduces ~0.558x -> the bufferdepri replication was
//     instrument noise (which instrument differed is named in evidence).
// SECONDARY (report-only, no verdict): the #847 tradeoff table on current
// master per cell — PD=1 vs PD=0: rot/100d ratio, exposure-normalized
// starvation (deaths/villageDays*100), national(end), table reach.
//
// Also reports: corpus byte-reproduce vs the bufferdepri PD=0 corpus (mod
// the documented medianSurvival analyzer-patch normalization), the scale
// wall per cell (national/table/wins, wave 1-5 unlocks, median/max
// survival, death-cause shares), and the manual paired rows (§15 fallback).
//
// Patches each per-seed corpus JSON with the cell's medianSurvival (the
// bufferdepri-documented analyzer mutation; the byte-reproduce check
// normalizes it out). Exits 0 on a completed analysis (DIAG, no GO/NO-GO),
// 2 on input/corpus/schema failure. Report goes to STDOUT; the runner
// captures it into the evidence file.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'pdtradeoff-b-corpus');
const BUFFER_DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-bufferdepri-b');
const SEEDS = '9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265';

const out = [];
const report = s => { out.push(s); console.log(s); };
const FAIL = { n: 0 };
const check = (name, cond, detail) => {
  report((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

report('# sim-pdtradeoff-b DIAG analyzer — ' + new Date().toISOString());
report('substrate: FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware, seeds 9250-9265, policies {leadfeast,belongfeast}, cells {pd0,pd1}x{dg0,dg1}, DG FATAL-explicit');

// ---- input validation ----
const cells = ['pd0-dg0', 'pd1-dg0', 'pd0-dg1', 'pd1-dg1'];
const policies = ['leadfeast', 'belongfeast'];
const sweeps = {};
for (const cell of cells) for (const policy of policies) {
  const f = path.join(DIR, `sweep-${cell}-${policy}.json`);
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  sweeps[cell + '|' + policy] = j;
  const m = j.meta;
  if ((m.seeds || []).join(',') !== SEEDS) { console.error('SEED MISMATCH in ' + f); process.exit(2); }
  if (m.days !== 100 || m.env.FEASTSCALE_R13 !== '1' || m.env.SEATDRIVE !== '0') {
    console.error('ENV/HORIZON MISMATCH in ' + f + ' ' + JSON.stringify(m)); process.exit(2);
  }
  const pdWant = cell.startsWith('pd1') ? '1' : '0';
  if (m.env.PLENTYDEPRI !== pdWant) { console.error('PD ENV MISMATCH ' + f); process.exit(2); }
  if (m.env.DEPOSITGATE !== (cell.endsWith('dg1') ? '1' : '0')) { console.error('DG ENV MISMATCH ' + f); process.exit(2); }
  for (const r of (j.rows || [])) {
    if (![0, 1].includes(r.perSeed.plentydepri)) { console.error('SCHEMA MISMATCH plentydepri in ' + f); process.exit(2); }
    if (![0, 1].includes(r.perSeed.depositgate)) { console.error('SCHEMA MISMATCH depositgate in ' + f); process.exit(2); }
    if (!r.diag) { console.error('DIAG MISSING in ' + f); process.exit(2); }
  }
}
check('input sweeps present: 4 cells x 2 policies, 16 seeds, 100d, R13=1/SEATDRIVE=0, both gates explicit', true);

const rowsOf = (cell, policy) => sweeps[cell + '|' + policy].rows;
const ps = r => r.perSeed;
const rot = r => (ps(r).rotFreshKcal || 0) + (ps(r).rotPreservedKcal || 0);
const days = r => ps(r).daysAlive || 1;
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const rot100 = rs => rs.reduce((t, r) => t + rot(r), 0) / rs.reduce((t, r) => t + days(r), 0) * 100;
const starveDeaths = r => Object.entries(ps(r).deathCauses || {}).filter(([k]) => /starv/i.test(k)).reduce((t, [, v]) => t + v, 0);

function kindOf(c) {
  c = String(c || '?').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/alien/.test(c)) return 'alien';
  if (/sick|lockjaw|drum-belly|bad belly|wound|toad|choir|fever|poison|disease|infect|belly/.test(c)) return 'sickness';
  return 'combat';
}

// partition conservation: glutChannels sum ~= total inflow
for (const cell of cells) for (const policy of policies) {
  for (const r of rowsOf(cell, policy)) {
    const g = ps(r).glutChannels || {};
    const sum = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other'].reduce((t, k) => t + (g[k] || 0), 0);
    const tot = (r.diag.inflowTotal || 0);
    if (Math.abs(sum - tot) > Math.max(1, tot * 0.05)) {
      console.error(`PARTITION BREAK ${cell}|${policy} s${ps(r).seed}: channels sum ${sum} vs inflow ${tot}`);
      process.exit(2);
    }
  }
}
check('glutChannels partition conserved (sum ~= total inflow) on all 64 runs', true);

// ---- medianSurvival patch (bufferdepri-documented analyzer mutation) ----
report('\n== medianSurvival patch ==');
for (const cell of cells) for (const policy of policies) {
  const rows = rowsOf(cell, policy);
  const med = median(rows.map(days));
  for (const r of rows) {
    const f = path.join(DIR, `pdtradeoff-b-${cell}-${policy}-s${ps(r).seed}.json`);
    if (!fs.existsSync(f)) { console.error('PER-SEED MISSING ' + f); process.exit(2); }
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    j.medianSurvival = med;
    fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n');
    ps(r).medianSurvival = med;
  }
  report(`patched ${cell}|${policy}: medianSurvival=${med} (${rows.length} files)`);
}
check('per-seed corpus JSONs patched with cell medianSurvival', true);

// ---- corpus byte-reproduce vs bufferdepri PD=0 corpus (mod medianSurvival) ----
report('\n== CORPUS BYTE-REPRODUCE vs bufferdepri PD=0 corpus (medianSurvival normalized) ==');
let reproSame = 0, reproDiff = 0;
const reproDiffSeeds = [];
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  for (const r of rowsOf(`pd0-${dg}`, policy)) {
    const f = path.join(BUFFER_DIR, `bufferdepri-b-pd0-${dg}-${policy}-s${ps(r).seed}.json`);
    if (!fs.existsSync(f)) { report(`  (bufferdepri corpus file missing: ${path.basename(f)})`); continue; }
    const b = JSON.parse(fs.readFileSync(f, 'utf8'));
    const m = path.join(DIR, `pdtradeoff-b-pd0-${dg}-${policy}-s${ps(r).seed}.json`);
    const mine = JSON.parse(fs.readFileSync(m, 'utf8'));
    const norm = j => { const c = JSON.parse(JSON.stringify(j)); delete c.medianSurvival; return c; };
    if (JSON.stringify(norm(b)) === JSON.stringify(norm(mine))) reproSame++;
    else { reproDiff++; if (reproDiffSeeds.length < 8) reproDiffSeeds.push(`${policy}/${dg}/s${ps(r).seed}`); }
  }
}
report(`byte-reproduce (PD=0 cells, 64 configs): ${reproSame} identical, ${reproDiff} differ`);
if (reproDiffSeeds.length) report(`  first differing: ${reproDiffSeeds.join(', ')}`);
report(reproDiff === 0
  ? 'DIAG NOTE: corpus reproduces — substrate stable since the bufferdepri corpus.'
  : 'DIAG NOTE: corpus drifted — the PD=0 control does not reproduce; substrate changed between the bufferdepri corpus and this sweep (see evidence file for named drift commits).');

// ---- PRIMARY (DIAG): the four PD=1/PD=0 rot/100d ratios ----
report('\n== PRIMARY (DIAG): PD=1/PD=0 rot/100d ratio per cell ==');
const ratioOf = (policy, dg) => {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  const c = rot100(C), a = rot100(A);
  return { c, a, ratio: c > 0 ? a / c : (a > 0 ? Infinity : 1), C, A };
};
const primary = {};
for (const policy of policies) {
  primary[policy] = {};
  for (const dg of ['dg0', 'dg1']) {
    const { c, a, ratio } = ratioOf(policy, dg);
    primary[policy][dg] = { c, a, ratio };
    report(`${policy} ${dg}: control ${(c / 1000).toFixed(1)}k -> pd1 ${(a / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x`);
  }
}
report('(substrate anchors: depinteraction leadfeast 0.647/0.558, belongfeast 0.523/0.339; bufferdepri replication 0.669/1.033, 0.482/0.781)');

// ---- DIAG resolution of the substrate flag ----
report('\n== DIAG RESOLUTION: substrate flag (bufferdepri metric review #3) ==');
const leadDg1 = primary.leadfeast.dg1.ratio;
const d = (x, y) => Math.abs(x - y);
if (leadDg1 === Infinity) {
  report('leadfeast/dg1 ratio is Infinity (zero control rot) — flag unresolved by this cell; see other cells.');
} else if (d(leadDg1, 1.033) <= d(leadDg1, 0.558)) {
  report(`RESOLVED: drift CONFIRMED. leadfeast/dg1 = ${leadDg1.toFixed(3)}x is closer to bufferdepri's 1.033x than to the depinteraction substrate's 0.558x.`);
  report('Current master has a different PD=1 rot effect on dg1 than the depinteraction substrate. The bufferdepri sanity replication was FAITHFUL on its corpus; the depinteraction 0.558x is a stale substrate reading.');
} else {
  report(`RESOLVED: instrument noise. leadfeast/dg1 = ${leadDg1.toFixed(3)}x is closer to the depinteraction substrate's 0.558x than to bufferdepri's 1.033x.`);
  report('The bufferdepri replication deviated by instrument, not substrate — see evidence file for which instrument differed (DG-unset-vs-explicit cell and the analyzer medianSurvival patch were the named candidates).');
}

// ---- SECONDARY (report-only): #847 tradeoff table ----
report('\n== SECONDARY (#847 tradeoff, report-only): PD=1 vs PD=0 per cell ==');
report('cell | rot/100d ratio | starvation/100vd c->a | national(end) c->a | table c->a');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  const { ratio } = ratioOf(policy, dg);
  const cVD = C.reduce((t, r) => t + (ps(r).villageDays || 0), 0), aVD = A.reduce((t, r) => t + (ps(r).villageDays || 0), 0);
  const cS = C.reduce((t, r) => t + starveDeaths(r), 0), aS = A.reduce((t, r) => t + starveDeaths(r), 0);
  const cNat = C.filter(r => ps(r).national).length, aNat = A.filter(r => ps(r).national).length;
  const cT = C.filter(r => ps(r).table).length, aT = A.filter(r => ps(r).table).length;
  report(`${policy} ${dg} | ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x | ${(cS / cVD * 100).toFixed(3)}->${(aS / aVD * 100).toFixed(3)} (${cS}/${aS} deaths) | ${cNat}->${aNat} | ${cT}->${aT}`);
}
report('(#847: "the lever trades a small survival/national cost for a large rot reduction" — the numbers above are the current-master reading; no verdict, a lever-run question for the axis.)');

// ---- scale wall per cell ----
report('\n== SCALE WALL per cell (national / table+wins / wave>=4 / wave>=5 / survival median / max) ==');
for (const cell of cells) for (const policy of policies) {
  const R = rowsOf(cell, policy);
  const nat = R.filter(r => ps(r).national).length;
  const tw = R.filter(r => ps(r).table || ps(r).win).length;
  const w4 = R.filter(r => (ps(r).waveReach || []).includes(4)).length;
  const w5 = R.filter(r => (ps(r).waveReach || []).includes(5)).length;
  const ds = R.map(days);
  report(`${cell} ${policy}: ${nat} / ${tw} / ${w4} / ${w5} / ${median(ds)}d / ${Math.max(...ds)}d`);
}
report('(SEATDRIVE=0 pre-seat substrate: wins are structurally 0 — regime artifact, not a finding.)');

// ---- death-cause shares ----
report('\n== DEATH-CAUSE SHARES (pooled, kind-mapped) ==');
const causes = {};
let tot = 0;
for (const cell of cells) for (const policy of policies) for (const r of rowsOf(cell, policy))
  for (const [c, n] of Object.entries(ps(r).deathCauses || {})) { causes[kindOf(c)] = (causes[kindOf(c)] || 0) + n; tot += n; }
for (const [k, n] of Object.entries(causes).sort((a, b) => b[1] - a[1]))
  report(`  ${k}: ${(n / tot * 100).toFixed(1)}% (${n})`);

// ---- manual paired rows (§15 fallback; panel compare is invalid by construction, #797) ----
report('\n== MANUAL PAIRED ROWS (§15 fallback; automated panel invalid by construction — see panel compare .md) ==');
report('policy dg seed | c_days a_days d_days | c_rot100 a_rot100 | c_starve a_starve | c_nat a_nat');
const pairedRows = [];
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  for (const a of A) {
    const c = C.find(x => ps(x).seed === ps(a).seed);
    pairedRows.push({ policy, dg, seed: ps(a).seed,
      c_days: days(c), a_days: days(a), d_days: days(a) - days(c),
      c_rot100: +(rot(c) / days(c) * 100).toFixed(0), a_rot100: +(rot(a) / days(a) * 100).toFixed(0),
      c_starve: starveDeaths(c), a_starve: starveDeaths(a),
      c_nat: ps(c).national ? 1 : 0, a_nat: ps(a).national ? 1 : 0 });
    const p = pairedRows[pairedRows.length - 1];
    report(`${policy} ${dg} s${p.seed} | ${p.c_days} ${p.a_days} ${p.d_days >= 0 ? '+' : ''}${p.d_days} | ${p.c_rot100} ${p.a_rot100} | ${p.c_starve} ${p.a_starve} | ${p.c_nat} ${p.a_nat}`);
  }
}

report('\n== SUMMARY ==');
report(`checks: ${FAIL.n} FAIL`);
for (const policy of policies) for (const dg of ['dg0', 'dg1'])
  report(`primary ${policy}/${dg}: ${primary[policy][dg].ratio === Infinity ? 'inf' : primary[policy][dg].ratio.toFixed(3)}x`);
report('metric review: none pre-registered for a DIAG; any metric doubts are documented in the evidence file.');
if (FAIL.n) { console.error('ANALYZER CHECKS FAILED: ' + FAIL.n); process.exit(2); }
report('analyzer exit 0 — DIAG complete.');
