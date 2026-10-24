#!/usr/bin/env node
// analyze-bufferdepri-b.js — PLENTYDEPRI=2 buffer-aware easing lever verdict
// (sim-bufferdepri-b, 2026-10-23/24).
//
// Reads the 12 lever sweep JSONs (pd0/pd1/pd2 x dg0/dg1 x
// leadfeast/belongfeast, 16 seeds 9250-9265, 100d death-aware,
// FEASTSCALE_R13=1/SEATDRIVE=0, both gates explicit — produced by
// scripts/sweep-bufferdepri-b.js, derived from the depinteraction sweep,
// cited) and asserts the PRE-REGISTERED verdict (§14 binds: a miss is a
// miss, never re-scored).
//
// PRE-REGISTRATION (bound):
//   PRIMARY (per feast-side, per DEPOSITGATE setting): rot/100d =
//     (rotFreshKcal+rotPreservedKcal) absolute kcal per 100 days alive,
//     PD=2/PD=0 ratio. GO iff ratio <= 0.50 on ALL FOUR cells.
//   ENGAGEMENT: depriKcal > 0 on >= 12/32 PD=2 configs per cell.
//   GUARDRAILS (PD=2 vs PD=0, every cell):
//     (a) exposure-normalized starvation: armedRate <= controlRate
//         (rate = starvationDeaths/villageDays*100);
//     (b) national(end) >= control - 2;
//     (c) median paired (pd2-pd0) survival-diff >= -10d (paired by seed);
//     (d) no new death modes: pd2 cause-families (kind-mapped, the pilot's
//         operationalization) ⊆ pooled pd0 corpus.
//   SANITY (report-only): PD=1/PD=0 replication vs the depinteraction
//     ratios (leadfeast 0.647/0.558, belongfeast 0.523/0.339).
//   Verdict: GO iff primary + engagement + all guardrails hold on all four
//     PD=2 cells; else NO-GO, classified per §14a.
//
// Also patches each per-seed corpus JSON with the cell's medianSurvival
// (the schema key the sibling arms read), and emits the manual paired rows
// for the #797 fallback (env-gated levers on identical code make the
// automated panel compare invalid "Unmatched flags" by construction —
// attached alongside, the metric is NOT re-scored).
//
// Exit 0 on GO, 1 on NO-GO, 2 on malformed input.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.BUFFERDEPRI_DIR || path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-bufferdepri-b');
const SEEDS = '9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265';

const FAIL = { n: 0 };
const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
const report = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}
const check = (name, cond, detail) => {
  report((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

const cells = ['pd0-dg0', 'pd1-dg0', 'pd2-dg0', 'pd0-dg1', 'pd1-dg1', 'pd2-dg1'];
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
  const pdWant = cell.startsWith('pd2') ? '2' : (cell.startsWith('pd1') ? '1' : '0');
  if (m.env.PLENTYDEPRI !== pdWant) { console.error('PD ENV MISMATCH ' + f); process.exit(2); }
  if (m.env.DEPOSITGATE !== (cell.endsWith('dg1') ? '1' : '0')) { console.error('DG ENV MISMATCH ' + f); process.exit(2); }
  // per-seed schema check: plentydepri in {0,1,2}
  for (const r of (j.rows || [])) {
    if (![0, 1, 2].includes(r.perSeed.plentydepri)) { console.error('SCHEMA MISMATCH plentydepri in ' + f); process.exit(2); }
  }
}
check('input sweeps present: 6 cells x 2 policies, 16 seeds, 100d, R13=1/SEATDRIVE=0, both gates explicit', true);

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
check('glutChannels partition conserved (sum ~= total inflow) on all 192 runs', true);

const ratioOf = (armedSide, policy, dg) => {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`${armedSide}-${dg}`, policy);
  const c = rot100(C), a = rot100(A);
  return { c, a, ratio: c > 0 ? a / c : (a > 0 ? Infinity : 1), C, A };
};

// == SANITY: PD=1/PD=0 replication vs the depinteraction substrate ==
report('\n== SANITY: PD=1/PD=0 rot/100d replication (depinteraction: 0.647/0.558 leadfeast, 0.523/0.339 belongfeast) ==');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const { c, a, ratio } = ratioOf('pd1', policy, dg);
  report(`${policy} ${dg}: control ${(c / 1000).toFixed(1)}k -> pd1 ${(a / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x`);
}

// == PRIMARY: PD=2/PD=0 rot/100d, GO iff <=0.50 on all four cells ==
report('\n== PRIMARY: rot/100d PD=2/PD=0 ratio (per feast-side, per DEPOSITGATE) ==');
const ratios2 = {};
for (const policy of policies) {
  ratios2[policy] = {};
  for (const dg of ['dg0', 'dg1']) {
    const { c, a, ratio } = ratioOf('pd2', policy, dg);
    ratios2[policy][dg] = ratio;
    report(`${policy} ${dg}: control ${(c / 1000).toFixed(1)}k -> pd2 ${(a / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x`);
    check(`PRIMARY ${policy} ${dg} PD=2/PD=0 <= 0.50`, ratio !== Infinity && ratio <= 0.50,
      (ratio === Infinity ? 'inf' : ratio.toFixed(3)) + 'x');
  }
}

// == stand-down ledger + engagement ==
report('\n== STAND-DOWN LEDGER (pd2 cells) + ENGAGEMENT ==');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const A = rowsOf(`pd2-${dg}`, policy);
  const sdK = A.reduce((t, r) => t + ((r.diag || {}).standDownKcal || 0), 0);
  const sdD = A.reduce((t, r) => t + ((r.diag || {}).standDownDec || 0), 0);
  const depK = A.reduce((t, r) => t + (ps(r).depriKcal || 0), 0);
  const firing = A.filter(r => (ps(r).depriKcal || 0) > 0).length;
  report(`${policy} ${dg}: depriKcal=${Math.round(depK / 1000)}k standDownKcal=${Math.round(sdK / 1000)}k standDownDec=${sdD} configs-eased=${firing}/${A.length}`);
  check(`ENGAGEMENT ${policy} ${dg} depriKcal>0 on >=12/32 pd2 configs`, firing >= 12, `${firing}/32`);
}

// == GUARDRAILS: PD=2 vs PD=0 per cell ==
report('\n== GUARDRAILS: PD=2 vs PD=0 per cell ==');
const pairedRows = [];
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd2-${dg}`, policy);
  const tag = `${policy} ${dg}`;
  const paired = A.map(a => { const c = C.find(x => ps(x).seed === ps(a).seed); return c ? days(a) - days(c) : null; }).filter(x => x !== null);
  check(`(c) ${tag} median paired survival-diff >= -10d`, median(paired) >= -10, `${median(paired)}d (n=${paired.length})`);
  const cVD = C.reduce((t, r) => t + (ps(r).villageDays || 0), 0), aVD = A.reduce((t, r) => t + (ps(r).villageDays || 0), 0);
  const cStarve = C.reduce((t, r) => t + starveDeaths(r), 0), aStarve = A.reduce((t, r) => t + starveDeaths(r), 0);
  const cRate = cStarve / cVD * 100, aRate = aStarve / aVD * 100;
  const priorBar = cRate + 2 / (aVD / 100); // depinteraction bar, reported for context
  check(`(a) ${tag} starvation/100vd armed <= control`, aRate <= cRate,
    `armed ${aRate.toFixed(3)} (${aStarve}/${aVD}d) vs control ${cRate.toFixed(3)} (${cStarve}/${cVD}d); depinteraction-bar ${priorBar.toFixed(3)}`);
  const cNat = C.filter(r => ps(r).national).length, aNat = A.filter(r => ps(r).national).length;
  check(`(b) ${tag} national(end) >= control-2`, aNat >= cNat - 2, `${aNat} vs ${cNat}`);
  for (const a of A) {
    const c = C.find(x => ps(x).seed === ps(a).seed);
    pairedRows.push({ policy, dg, seed: ps(a).seed,
      c_days: days(c), a_days: days(a), d_days: days(a) - days(c),
      c_rot100: +(rot(c) / days(c) * 100).toFixed(0), a_rot100: +(rot(a) / days(a) * 100).toFixed(0),
      c_starve: starveDeaths(c), a_starve: starveDeaths(a),
      c_nat: ps(c).national ? 1 : 0, a_nat: ps(a).national ? 1 : 0,
      a_depriKcal: ps(a).depriKcal, a_sdKcal: (a.diag || {}).standDownKcal || 0,
      c_freshMed: ps(c).freshDaysMedian, a_freshMed: ps(a).freshDaysMedian });
  }
}

// (d) no new death modes: pd2 families ⊆ pooled pd0 corpus
{
  const cFam = new Set(), aFam = new Set();
  for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
    for (const r of rowsOf('pd0-' + dg, policy)) for (const [k] of Object.entries(ps(r).deathCauses || {})) cFam.add(kindOf(k));
    for (const r of rowsOf('pd2-' + dg, policy)) for (const [k] of Object.entries(ps(r).deathCauses || {})) aFam.add(kindOf(k));
  }
  const novel = [...aFam].filter(k => !cFam.has(k));
  check('(d) no new death modes (pd2 families ⊆ pooled pd0 corpus)', novel.length === 0,
    `pd2 {${[...aFam].sort().join(',')}} ⊆ pd0 {${[...cFam].sort().join(',')}}${novel.length ? ' NOVEL: ' + novel.join(',') : ''}`);
}

// == REPAIR REPORT: PD=2 vs PD=1 (the lever's own comparison) ==
report('\n== REPAIR: PD=2 vs PD=1 (rot/100d ratio, starvation rate, national) ==');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const A1 = rowsOf(`pd1-${dg}`, policy), A2 = rowsOf(`pd2-${dg}`, policy);
  const r1 = rot100(A1), r2 = rot100(A2);
  const s1 = A1.reduce((t, r) => t + starveDeaths(r), 0) / A1.reduce((t, r) => t + (ps(r).villageDays || 0), 0) * 100;
  const s2 = A2.reduce((t, r) => t + starveDeaths(r), 0) / A2.reduce((t, r) => t + (ps(r).villageDays || 0), 0) * 100;
  const n1 = A1.filter(r => ps(r).national).length, n2 = A2.filter(r => ps(r).national).length;
  report(`${policy} ${dg}: rot/100d pd1 ${(r1 / 1000).toFixed(1)}k pd2 ${(r2 / 1000).toFixed(1)}k (pd2/pd1 ${(r1 > 0 ? r2 / r1 : 0).toFixed(3)}x) | starve/100vd pd1 ${s1.toFixed(3)} pd2 ${s2.toFixed(3)} | national pd1 ${n1} pd2 ${n2}`);
}

// wall numbers per cell
report('\n== WALL NUMBERS per cell (national / table / wins, wave 4-5, median/max survival) ==');
for (const cell of cells) for (const policy of policies) {
  const rs = rowsOf(cell, policy);
  const nat = rs.filter(r => ps(r).national).length;
  const won = rs.filter(r => ps(r).win).length;
  const w4 = rs.filter(r => (ps(r).waveReach || []).includes(4)).length;
  const w5 = rs.filter(r => (ps(r).waveReach || []).includes(5)).length;
  const med = median(rs.map(days));
  const max = Math.max(...rs.map(days));
  report(`${cell} ${policy}: national ${nat}/16 table/wins ${won}/16 wave>=4 ${w4}/16 wave>=5 ${w5}/16 survival median ${med}d max ${max}d`);
}

// death-cause shares pooled
report('\n== DEATH-CAUSE SHARES (pooled, kind-mapped) ==');
{
  const fam = {};
  for (const cell of cells) for (const policy of policies)
    for (const r of rowsOf(cell, policy))
      for (const [k, n] of Object.entries(ps(r).deathCauses || {})) { const f = kindOf(k); fam[f] = (fam[f] || 0) + n; }
  const tot = Object.values(fam).reduce((a, b) => a + b, 0);
  report(Object.entries(fam).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${(n / tot * 100).toFixed(1)}%`).join(' '));
}

// patch per-seed corpus JSONs with the cell's medianSurvival
for (const cell of cells) for (const policy of policies) {
  const med = median(rowsOf(cell, policy).map(days));
  for (const r of rowsOf(cell, policy)) {
    const f = path.join(DIR, `bufferdepri-b-${cell}-${policy}-s${ps(r).seed}.json`);
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      j.medianSurvival = med;
      if (STDOUT_SPLIT) { process.stdout.write('@@FILE ' + path.basename(f) + '\n' + JSON.stringify(j) + '\n'); }
      else writeRobust(f, JSON.stringify(j, null, 1));
    } catch (e) { console.error('MEDIANSURVIVAL PATCH FAIL', f, e.message); process.exit(2); }
  }
}
check('per-seed corpus JSONs patched with cell medianSurvival', true);

// manual paired rows (#797 fallback): pd2 vs pd0
report('\n== MANUAL PAIRED ROWS (#797 fallback; pd2 vs pd0 per cell) ==');
report('policy dg seed | c_days a_days d | c_rot100 a_rot100 | c_starve a_starve | c_nat a_nat | a_depriK a_sdK | a_fresh/c_fresh');
for (const r of pairedRows) {
  report(`${r.policy} ${r.dg} ${r.seed} | ${r.c_days} ${r.a_days} ${r.d_days >= 0 ? '+' : ''}${r.d_days} | ${r.c_rot100} ${r.a_rot100} | ${r.c_starve} ${r.a_starve} | ${r.c_nat} ${r.a_nat} | ${r.a_depriKcal} ${r.a_sdKcal} | ${r.a_freshMed}/${r.c_freshMed}`);
}

const go = FAIL.n === 0;
report('\nLEVER VERDICT: ' + (go ? 'GO — PD=2 keeps the rot design value (<=0.50x all cells), engagement bar met, guardrails hold'
  : `NO-GO — see ${FAIL.n} FAIL above (judged as pre-registered; classify per §14a)`));
process.exit(go ? 0 : 1);
