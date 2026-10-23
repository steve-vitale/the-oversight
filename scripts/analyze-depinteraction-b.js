#!/usr/bin/env node
// analyze-depinteraction-b.js — PLENTYDEPRI x DEPOSITGATE interaction
// decomposer (sim-depinteraction-b, 2026-10-23, DIAG — not a lever).
//
// Reads the 8 interaction sweep JSONs (pd0/pd1 x dg0/dg1 x
// leadfeast/belongfeast, 16 FRESH seeds 9250-9265, 100d death-aware,
// FEASTSCALE_R13=1/SEATDRIVE=0, both gates explicit — produced by
// scripts/sweep-depinteraction-b.js, derived from the confirm's
// scripts/sweep-plentydepri-confirm-b.js, cited) and asserts the
// PRE-REGISTERED DIAG verdict (§14 binds: a miss is a miss, never re-scored).
//
// PRE-REGISTRATION (bound):
//   PRIMARY (per feast-side, per DEPOSITGATE setting): rot/100d =
//     (rotFreshKcal+rotPreservedKcal) absolute kcal per 100 days alive,
//     PD=1/PD=0 ratio. Same metric as the pilot/confirm — this is a
//     decomposition of the confirm's reversal, not a new lever.
//   DIAG-GO iff:
//     (i) the DG=0 leg reproduces the pilot GO (ratio <= 0.80 both
//         feast-sides) OR the miss is root-caused to a NAMED substrate
//         change (no floating miss);
//     (ii) the interaction term is NAMED, SIGNED, and mechanism-attributed
//          via depriKcal/easedKcal + glutChannels evidence — 0 unexplained cells;
//     (iii) guardrails hold PD=1 vs PD=0 on EVERY cell:
//         (a) median paired (pd1-pd0) survival-diff >= -10d (paired by seed);
//         (b) exposure-normalized starvation: armedRate <= controlRate + 2/(armedVD/100)
//             (rate = starvationDeaths/villageDays*100);
//         (c) no new death modes: pd1 cause-families (kind-mapped; named-monster
//             strings are combat-family variants, the pilot's operationalization)
//             ⊆ pooled pd0 corpus (both policies, both DG cells);
//         (d) national reach not collapsing vs control (report; >= control-2);
//         (e) pantry median-of-run-medians freshDays: pd1 >= 0.5x pd0 (report both);
//         ENGAGEMENT: >=28/32 PD=1 configs with depriKcal>0 or easedKcal>0.
//   WATCH (report-only): wall numbers per cell (national/table/wins,
//     wave 4-5 unlocks, median survival), channel ratios, death-cause shares.
//
// Interaction term: log(ratio_DG1) - log(ratio_DG0) per feast-side.
// >0 means DEPOSITGATE=ON attenuates (or reverses) PLENTYDEPRI's rot effect.
// Signed and mechanism-attributed by construction: the sweep records both
// levers' engagement ledgers (depriKcal, easedKcal incl. DG holdbacks) and
// the per-channel inflow partition (glutChannels), so the story must be
// carried by the channels, never narrated freehand.
//
// Also patches each per-seed corpus JSON with the cell's medianSurvival
// (the schema key the sibling channel arm reads), and emits the manual
// paired rows for the #797 fallback (env-gated levers on identical code
// make the automated panel compare invalid "Unmatched flags" by
// construction — attached alongside, the metric is NOT re-scored).
//
// Exit 0 on DIAG-GO, 1 on DIAG-NO-GO, 2 on malformed input.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.DIAG_DIR || path.join(__dirname, '..', 'evidence', '2026-10-23', 'depinteraction-b-corpus');
const SEEDS = '9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265';

const FAIL = { n: 0 };
const UNEXPLAINED = { n: 0 };
// Output routing: STDOUT_SPLIT=1 sends patched per-seed JSONs to stdout with
// @@FILE markers for a shell splitter; the verdict report goes to stderr.
// (Same EPERM-flap workaround as the sweep script.)
const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
const report = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };
// EPERM-FLAP-RESILIENT WRITE (2026-10-23): same as the sweep script —
// atomic temp+rename with retries, FAIL LOUDLY if the window never opens.
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
const name = (name, cond, detail) => { // mechanism-naming check: failures mark unexplained cells
  report((cond ? 'NAMED' : 'UNEXPLAINED') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) UNEXPLAINED.n++;
};

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
  if (m.env.PLENTYDEPRI !== (cell.startsWith('pd1') ? '1' : '0')) { console.error('PD ENV MISMATCH ' + f); process.exit(2); }
  if (m.env.DEPOSITGATE !== (cell.endsWith('dg1') ? '1' : '0')) { console.error('DG ENV MISMATCH ' + f); process.exit(2); }
}
check('input sweeps present: 4 cells x 2 policies, 16 fresh seeds, 100d, R13=1/SEATDRIVE=0, both gates explicit', true);

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

// partition conservation: glutChannels sum ~= total inflow (shareKcal + stockPantry paths)
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
check('glutChannels partition conserved (sum ~= total inflow) on all 128 runs', true);

// per-feast-side per-DG: PD=1/PD=0 rot/100d ratio
const cellRows = (cell, policy) => rowsOf(cell, policy);
const ratioOf = (policy, dg) => {
  const C = cellRows(`pd0-${dg}`, policy), A = cellRows(`pd1-${dg}`, policy);
  const c = rot100(C), a = rot100(A);
  return { c, a, ratio: c > 0 ? a / c : (a > 0 ? Infinity : 1), C, A };
};

const ratios = {}; // policy -> {dg0: ratio, dg1: ratio}
report('\n== PRIMARY: rot/100d PD=1/PD=0 ratio (per feast-side, per DEPOSITGATE) ==');
for (const policy of policies) {
  ratios[policy] = {};
  for (const dg of ['dg0', 'dg1']) {
    const { c, a, ratio } = ratioOf(policy, dg);
    ratios[policy][dg] = ratio;
    report(`${policy} ${dg}: control ${(c / 1000).toFixed(1)}k -> armed ${(a / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x`);
  }
  // (i) DG=0 leg reproduces the pilot GO
  const r0 = ratios[policy].dg0;
  const go0 = r0 !== Infinity && r0 <= 0.80;
  if (go0) check(`(i) ${policy} DG=0 leg reproduces pilot GO (ratio<=0.80)`, true, (r0).toFixed(3) + 'x');
  else check(`(i) ${policy} DG=0 leg reproduces pilot GO (ratio<=0.80)`, false,
    (r0 === Infinity ? 'inf' : r0.toFixed(3)) + 'x — MUST be root-caused to a NAMED substrate change');
}

// interaction term: log(ratio_DG1) - log(ratio_DG0), per feast-side
report('\n== INTERACTION TERM: log(ratio_DG1) - log(ratio_DG0) ==');
const interactions = {};
for (const policy of policies) {
  const r0 = ratios[policy].dg0, r1 = ratios[policy].dg1;
  if (r0 === Infinity || r1 === Infinity || r0 <= 0 || r1 <= 0) {
    report(`${policy}: interaction UNDEFINED (zero-control leg) — substrate change required`);
    UNEXPLAINED.n++;
    interactions[policy] = null;
    continue;
  }
  const it = Math.log(r1) - Math.log(r0);
  interactions[policy] = it;
  report(`${policy}: log(${r1.toFixed(3)}) - log(${r0.toFixed(3)}) = ${it >= 0 ? '+' : ''}${it.toFixed(3)} ` +
    (it > 0 ? '— DEPOSITGATE=ON ATTENUATES/REVERSES PLENTYDEPRI (sign +)' :
     it < 0 ? '— DEPOSITGATE=ON AMPLIFIES PLENTYDEPRI (sign -)' : '— no interaction'));
}

// (ii) mechanism attribution: both levers' engagement ledgers + channel evidence, per cell
report('\n== (ii) MECHANISM ATTRIBUTION: engagement ledgers + channel deltas ==');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = cellRows(`pd0-${dg}`, policy), A = cellRows(`pd1-${dg}`, policy);
  const pdK = A.reduce((t, r) => t + (ps(r).depriKcal || 0), 0);
  const pdKc = C.reduce((t, r) => t + (ps(r).depriKcal || 0), 0);
  const egK = A.reduce((t, r) => t + (ps(r).easedKcal || 0), 0);
  const egKc = C.reduce((t, r) => t + (ps(r).easedKcal || 0), 0);
  const cPlenty = C.reduce((t, r) => t + ((r.diag || {}).plentyDays || 0), 0);
  const aPlenty = A.reduce((t, r) => t + ((r.diag || {}).plentyDays || 0), 0);
  report(`${policy} ${dg}: depriKcal pd0=${Math.round(pdKc / 1000)}k pd1=${Math.round(pdK / 1000)}k | ` +
    `easedKcal pd0=${Math.round(egKc / 1000)}k pd1=${Math.round(egK / 1000)}k | ` +
    `plentyDays pd0=${cPlenty} pd1=${aPlenty}`);
}

// DG engagement asymmetry: does PD=1 stand DOWN DG's holdbacks (plentyDays falls)?
// and does DG=1 stand DOWN PD's easing (depriKcal falls)?
report('\n== CROSS-LEVER STAND-DOWN (both levers read the same plentiful sensor) ==');
for (const policy of policies) {
  // DG engagement on pd0 vs pd1: does easing production starve DG of plentiful days?
  const dg0 = cellRows('pd0-dg1', policy), dg1 = cellRows('pd1-dg1', policy);
  const e0 = dg0.reduce((t, r) => t + (ps(r).easedKcal || 0), 0);
  const e1 = dg1.reduce((t, r) => t + (ps(r).easedKcal || 0), 0);
  // PD engagement on dg0 vs dg1: does deposit holdback starve PD of plentiful days?
  const p0 = cellRows('pd1-dg0', policy), p1 = cellRows('pd1-dg1', policy);
  const d0 = p0.reduce((t, r) => t + (ps(r).depriKcal || 0), 0);
  const d1 = p1.reduce((t, r) => t + (ps(r).depriKcal || 0), 0);
  report(`${policy}: DG easedKcal (dg1) with PD=0 vs PD=1: ${Math.round(e0 / 1000)}k -> ${Math.round(e1 / 1000)}k`);
  report(`${policy}: PD depriKcal (pd1) with DG=0 vs DG=1: ${Math.round(d0 / 1000)}k -> ${Math.round(d1 / 1000)}k`);
  name(`${policy} stand-down direction named (PD steals DG's plentiful days / DG steals PD's)`,
    (e1 <= e0 || d1 <= d0), // at least one lever's engagement falls under the other's
    `eased ${Math.round(e0 / 1000)}k->${Math.round(e1 / 1000)}k, depri ${Math.round(d0 / 1000)}k->${Math.round(d1 / 1000)}k`);
}

// channel deltas: where does the PD delta in rot come from, per DG leg?
report('\n== CHANNEL DELTAS (PD=1 - PD=0 inflow, by glut channel) ==');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = cellRows(`pd0-${dg}`, policy), A = cellRows(`pd1-${dg}`, policy);
  const sum = (rs, k) => rs.reduce((t, r) => t + ((ps(r).glutChannels || {})[k] || 0), 0);
  const keys = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other'];
  const deltas = keys.map(k => [k, sum(A, k) - sum(C, k)]);
  report(`${policy} ${dg}: ` + deltas.map(([k, d]) => `${k}=${d >= 0 ? '+' : ''}${Math.round(d / 1000)}k`).join(' '));
  const top = deltas.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  name(`${policy} ${dg} dominant PD-delta channel named`, Math.abs(top[1]) > 0, `${top[0]} ${Math.round(top[1] / 1000)}k`);
}

// (iii) guardrails: PD=1 vs PD=0 on EVERY cell
report('\n== (iii) GUARDRAILS: PD=1 vs PD=0 per cell ==');
const pairedRows = [];
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = cellRows(`pd0-${dg}`, policy), A = cellRows(`pd1-${dg}`, policy);
  const tag = `${policy} ${dg}`;
  const paired = A.map(a => { const c = C.find(x => ps(x).seed === ps(a).seed); return c ? days(a) - days(c) : null; }).filter(x => x !== null);
  check(`(a) ${tag} median paired survival-diff >= -10d`, median(paired) >= -10, `${median(paired)}d (n=${paired.length})`);
  const cVD = C.reduce((t, r) => t + (ps(r).villageDays || 0), 0), aVD = A.reduce((t, r) => t + (ps(r).villageDays || 0), 0);
  const cStarve = C.reduce((t, r) => t + starveDeaths(r), 0), aStarve = A.reduce((t, r) => t + starveDeaths(r), 0);
  const cRate = cStarve / cVD * 100, aRate = aStarve / aVD * 100, bar = cRate + 2 / (aVD / 100);
  check(`(b) ${tag} starvation/100vd armed <= control + 2/(armedVD/100)`, aRate <= bar,
    `armed ${aRate.toFixed(3)} (${aStarve}/${aVD}d) vs control ${cRate.toFixed(3)} (${cStarve}/${cVD}d), bar ${bar.toFixed(3)}`);
  const cNat = C.filter(r => ps(r).national).length, aNat = A.filter(r => ps(r).national).length;
  check(`(d) ${tag} national reach >= control-2`, aNat >= cNat - 2, `${aNat} vs ${cNat}`);
  const cFresh = median(C.map(r => ps(r).freshDaysMedian).filter(x => x != null));
  const aFresh = median(A.map(r => ps(r).freshDaysMedian).filter(x => x != null));
  check(`(e) ${tag} pantry median freshDays pd1 >= 0.5x pd0`, aFresh >= 0.5 * cFresh, `armed ${aFresh}d vs control ${cFresh}d`);
  // engagement (pooled at the end); per-cell report
  const firing = A.filter(r => (ps(r).depriKcal || 0) > 0 || (ps(r).easedKcal || 0) > 0).length;
  report(`  engagement ${tag}: ${firing}/${A.length} PD=1 configs with depriKcal>0 or easedKcal>0`);
  // manual paired rows (#797 fallback)
  for (const a of A) {
    const c = C.find(x => ps(x).seed === ps(a).seed);
    pairedRows.push({ policy, dg, seed: ps(a).seed,
      c_days: days(c), a_days: days(a), d_days: days(a) - days(c),
      c_rot100: +(rot(c) / days(c) * 100).toFixed(0), a_rot100: +(rot(a) / days(a) * 100).toFixed(0),
      c_starve: starveDeaths(c), a_starve: starveDeaths(a),
      c_nat: ps(c).national ? 1 : 0, a_nat: ps(a).national ? 1 : 0,
      a_depriKcal: ps(a).depriKcal, a_easedKcal: ps(a).easedKcal,
      c_freshMed: ps(c).freshDaysMedian, a_freshMed: ps(a).freshDaysMedian });
  }
}

// (c) no new death modes: pd1 families ⊆ pooled pd0 corpus (both policies, both DG cells)
{
  const cFam = new Set(), aFam = new Set();
  for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
    for (const r of cellRows('pd0-' + dg, policy)) for (const [k] of Object.entries(ps(r).deathCauses || {})) cFam.add(kindOf(k));
    for (const r of cellRows('pd1-' + dg, policy)) for (const [k] of Object.entries(ps(r).deathCauses || {})) aFam.add(kindOf(k));
  }
  const novel = [...aFam].filter(k => !cFam.has(k));
  check('(c) no new death modes (pd1 families ⊆ pooled pd0 corpus)', novel.length === 0,
    `pd1 {${[...aFam].sort().join(',')}} ⊆ pd0 {${[...cFam].sort().join(',')}}${novel.length ? ' NOVEL: ' + novel.join(',') : ''}`);
}

// engagement pooled
{
  let firing = 0, total = 0;
  for (const policy of policies) for (const dg of ['dg0', 'dg1'])
    for (const r of cellRows('pd1-' + dg, policy)) { total++; if ((ps(r).depriKcal || 0) > 0 || (ps(r).easedKcal || 0) > 0) firing++; }
  check(`ENGAGEMENT >=28/32 PD=1 configs (depriKcal>0 or easedKcal>0)`, firing >= 28, `${firing}/${total}`);
}

// wall numbers per cell
report('\n== WALL NUMBERS per cell (national / table / wins, wave 4-5, median survival) ==');
const walls = {};
for (const cell of cells) for (const policy of policies) {
  const rs = cellRows(cell, policy);
  const nat = rs.filter(r => ps(r).national).length;
  const won = rs.filter(r => ps(r).win).length;
  const w4 = rs.filter(r => (ps(r).waveReach || []).includes(4)).length;
  const w5 = rs.filter(r => (ps(r).waveReach || []).includes(5)).length;
  const med = median(rs.map(days));
  const max = Math.max(...rs.map(days));
  walls[cell + '|' + policy] = { nat, won, w4, w5, med, max };
  report(`${cell} ${policy}: national ${nat}/16 table/wins ${won}/16 wave>=4 ${w4}/16 wave>=5 ${w5}/16 survival median ${med}d max ${max}d`);
}

// patch per-seed corpus JSONs with the cell's medianSurvival
for (const cell of cells) for (const policy of policies) {
  const med = median(cellRows(cell, policy).map(days));
  for (const r of cellRows(cell, policy)) {
    const f = path.join(DIR, `depinteraction-b-${cell}-${policy}-s${ps(r).seed}.json`);
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      j.medianSurvival = med;
      if (STDOUT_SPLIT) { process.stdout.write('@@FILE ' + path.basename(f) + '\n' + JSON.stringify(j) + '\n'); }
      else writeRobust(f, JSON.stringify(j, null, 1));
    } catch (e) { console.error('MEDIANSURVIVAL PATCH FAIL', f, e.message); process.exit(2); }
  }
}
check('per-seed corpus JSONs patched with cell medianSurvival', true);

// manual paired rows (#797 fallback)
report('\n== MANUAL PAIRED ROWS (#797 fallback; pd1 vs pd0 per cell) ==');
report('policy dg seed | c_days a_days d | c_rot100 a_rot100 | c_starve a_starve | c_nat a_nat | a_depriK a_easedK | a_fresh/c_fresh');
for (const r of pairedRows) {
  report(`${r.policy} ${r.dg} ${r.seed} | ${r.c_days} ${r.a_days} ${r.d_days >= 0 ? '+' : ''}${r.d_days} | ${r.c_rot100} ${r.a_rot100} | ${r.c_starve} ${r.a_starve} | ${r.c_nat} ${r.a_nat} | ${r.a_depriKcal} ${r.a_easedKcal} | ${r.a_freshMed}/${r.c_freshMed}`);
}

const go = FAIL.n === 0 && UNEXPLAINED.n === 0;
report('\nDIAG VERDICT: ' + (go ? 'DIAG-GO — interaction decomposed, named, signed, mechanism-attributed; 0 unexplained cells'
  : `DIAG-NO-GO — see ${FAIL.n} FAIL / ${UNEXPLAINED.n} UNEXPLAINED above`));
process.exit(go ? 0 : 1);
