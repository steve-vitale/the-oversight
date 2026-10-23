#!/usr/bin/env node
// analyze-plentydepri-confirm-b.js — PLENTYDEPRI confirm verdict analyzer
// (sim-plentydepri-confirm-b, 2026-10-23).
//
// Reads the 4 confirm sweep JSONs (control/armed x leadfeast/belongfeast,
// 16 FRESH seeds, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 — produced
// by scripts/sweep-plentydepri-confirm-b.js, derived from the pilot's
// instrument scripts/sweep-plentydepri-b.js, cited) and asserts the
// PRE-REGISTERED verdict (§14 binds: a miss is NO-GO, never re-scored).
//
// PRE-REGISTRATION:
//   PRIMARY (per feast-side): (rotFresh+rotPreserved) absolute kcal per 100
//     days alive, armed/control <= 0.80
//     (pilot 0.542x leadfeast / 0.622x; prior 16-seed 180d confirm 0.348x/0.508x).
//   GUARDRAILS (per feast-side):
//     (a) median paired (armed-control) survival-diff >= -10d (paired by seed)
//     (b) exposure-normalized starvation: armedRate <= controlRate + 2/(armedVD/100)
//         (rate = starvationDeaths / villageDays * 100)
//     (c) no new death modes: armed cause-families (kind-mapped) subset of the
//         pooled control corpus across both policies
//     (d) national reach not collapsing vs control (report; >= control-2)
//     (e) pantry median-of-run-medians freshDays: armed >= 0.5x control (report both)
//   ENGAGEMENT (report): armed runs with depriKcal>0.
//   WATCH (report-only): channel laundering ratios, wins/exiled, arc/wave reach,
//     death-cause shares, median/max survival.
//
// Also emits the MANUAL PAIRED ROW analysis (per-seed paired rows) for the
// #797 fallback: the automated balance-panel compare is invalid by
// construction for env-gated levers on identical code ("Unmatched flags"),
// so the comparison is done by manual paired row analysis attached
// alongside — the metric is NOT re-scored.
//
// Verdict: GO if PRIMARY passes on BOTH feast-sides AND all guardrails hold;
// else NO-GO. Exit 0 on GO, 1 on NO-GO, 2 on malformed input.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.CONFIRM_DIR || require('path').join(require('os').homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-plentydepri-confirm-b'); // NEVER /tmp (wiped mid-run 2026-10-23)
const EXPECTED_SEEDS = '9209,9222,9223,9224,9225,9227,9228,9229,9230,9232,9233,9234,9236,9237,9239,9240';
const files = {
  'control|leadfeast': path.join(DIR, 'sweep-control-leadfeast.json'),
  'armed|leadfeast': path.join(DIR, 'sweep-armed-leadfeast.json'),
  'control|belongfeast': path.join(DIR, 'sweep-control-belongfeast.json'),
  'armed|belongfeast': path.join(DIR, 'sweep-armed-belongfeast.json'),
};

const FAIL = { n: 0 };
const check = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

const sweeps = {};
for (const [k, f] of Object.entries(files)) {
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  sweeps[k] = JSON.parse(fs.readFileSync(f, 'utf8'));
  const m = sweeps[k].meta;
  if (m.seeds.join(',') !== EXPECTED_SEEDS) { console.error('SEED MISMATCH in ' + f); process.exit(2); }
  if (m.days !== 100 || m.env.FEASTSCALE_R13 !== '1' || m.env.SEATDRIVE !== '0') {
    console.error('ENV/HORIZON MISMATCH in ' + f + ' ' + JSON.stringify(m)); process.exit(2);
  }
  const wantPD = k.startsWith('armed') ? '1' : '0';
  if (m.env.PLENTYDEPRI !== wantPD) { console.error('SIDE/ENV MISMATCH in ' + f); process.exit(2); }
}
check('input sweeps present, 16 fresh seeds, 100d, FEASTSCALE_R13=1/SEATDRIVE=0, PLENTYDEPRI explicit per side', true);

const rowsOf = (side, policy) => sweeps[side + '|' + policy].rows;
const rot = r => (r.end.rotFresh || 0) + (r.end.rotPreserved || 0);
const days = r => r.end.days || 1;
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const nationalReach = r => /national|global/i.test(String(r.end.rank || '')) || !!r.end.nationalLive;
const starveDeaths = r => (r.end.deaths || []).filter(d => /starv/i.test(String(d.cause || ''))).length;

// kind-mapping: named-monster cause strings are combat-family variants
// (the pilot's operationalization, carried unchanged).
function kindOf(c) {
  c = String(c || '?').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/alien/.test(c)) return 'alien';
  if (/sick|lockjaw|drum-belly|bad belly|wound|toad|choir|fever|poison|disease|infect|belly/.test(c)) return 'sickness';
  return 'combat'; // combat, monster, ambush, contest (played fights), named monsters
}

const verdicts = {};
const pairedRows = [];
for (const policy of ['leadfeast', 'belongfeast']) {
  const C = rowsOf('control', policy), A = rowsOf('armed', policy);
  const rot100 = rs => rs.reduce((t, r) => t + rot(r), 0) / rs.reduce((t, r) => t + days(r), 0) * 100;
  const cRot = rot100(C), aRot = rot100(A), ratio = cRot > 0 ? aRot / cRot : (aRot > 0 ? Infinity : 1);
  console.log(`\n== ${policy} ==`);
  console.log(`rot/100d: control ${(cRot / 1000).toFixed(1)}k -> armed ${(aRot / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x`);
  const primary = ratio <= 0.80;
  verdicts[policy] = { primary, ratio };
  check(`${policy} PRIMARY rot/100d armed/control <= 0.80`, primary, ratio === Infinity ? 'inf' : ratio.toFixed(3) + 'x');

  // (a) median paired survival-diff
  const paired = A.map(a => { const c = C.find(x => x.seed === a.seed); return c ? a.end.days - c.end.days : null; }).filter(x => x !== null);
  const medDiff = median(paired);
  check(`${policy} (a) median paired survival-diff >= -10d`, medDiff >= -10, `${medDiff}d (n=${paired.length})`);

  // (b) exposure-normalized starvation
  const cVD = C.reduce((t, r) => t + days(r), 0), aVD = A.reduce((t, r) => t + days(r), 0);
  const cStarve = C.reduce((t, r) => t + starveDeaths(r), 0), aStarve = A.reduce((t, r) => t + starveDeaths(r), 0);
  const cRate = cStarve / cVD * 100, aRate = aStarve / aVD * 100;
  const bar = cRate + 2 / (aVD / 100);
  check(`${policy} (b) starvation/100vd armed <= control + 2/(armedVD/100)`, aRate <= bar,
    `armed ${aRate.toFixed(3)} (${aStarve}/${aVD}d) vs control ${cRate.toFixed(3)} (${cStarve}/${cVD}d), bar ${bar.toFixed(3)}`);

  // (c) no new death modes — computed against the pooled control corpus below
  // (d) national reach
  const cNat = C.filter(nationalReach).length, aNat = A.filter(nationalReach).length;
  check(`${policy} (d) national reach >= control-2`, aNat >= cNat - 2, `${aNat} vs ${cNat}`);
  console.log(`  national ranks (control): ${C.filter(nationalReach).map(r => r.seed + ':' + r.end.rank).join(', ') || 'none'}`);
  console.log(`  national ranks (armed):   ${A.filter(nationalReach).map(r => r.seed + ':' + r.end.rank).join(', ') || 'none'}`);

  // (e) pantry freshDays not collapsing
  const cFresh = median(C.map(r => r.end.freshDaysMedian).filter(x => x != null));
  const aFresh = median(A.map(r => r.end.freshDaysMedian).filter(x => x != null));
  check(`${policy} (e) pantry median freshDays armed >= 0.5x control`, aFresh >= 0.5 * cFresh,
    `armed ${aFresh}d vs control ${cFresh}d`);
  const cPlenty = C.reduce((t, r) => t + (r.end.plentyDays || 0), 0);
  const aPlenty = A.reduce((t, r) => t + (r.end.plentyDays || 0), 0);
  console.log(`  plenty-days (pantry>4 fresh days): control ${cPlenty}, armed ${aPlenty}`);

  // engagement
  const firing = A.filter(r => (r.end.depriKcal || 0) > 0).length;
  const depriKcal = A.reduce((t, r) => t + (r.end.depriKcal || 0), 0);
  console.log(`ENGAGEMENT armed runs firing (depriKcal>0): ${firing}/${A.length}, total ${(depriKcal / 1000).toFixed(0)}k kcal`);

  // watch-only
  const cMed = median(C.map(days)), aMed = median(A.map(days));
  const cMax = Math.max(...C.map(days)), aMax = Math.max(...A.map(days));
  const cWon = C.filter(r => r.end.won).length, aWon = A.filter(r => r.end.won).length;
  const cEx = C.reduce((t, r) => t + (r.end.exiled || 0), 0), aEx = A.reduce((t, r) => t + (r.end.exiled || 0), 0);
  const cArc = Math.max(...C.map(r => r.end.arc || 1)), aArc = Math.max(...A.map(r => r.end.arc || 1));
  const cWave = Math.max(...C.map(r => r.end.maxWave || 1)), aWave = Math.max(...A.map(r => r.end.maxWave || 1));
  const cW4 = C.filter(r => (r.end.maxWave || 1) >= 4).length, aW4 = A.filter(r => (r.end.maxWave || 1) >= 4).length;
  console.log(`watch: days control median ${cMed}/max ${cMax} | armed median ${aMed}/max ${aMax}`);
  console.log(`watch: wins ${cWon}/${aWon}; exiled ${cEx}/${cEx === aEx ? aEx : aEx + ' (DIFF)'}`);
  console.log(`watch: arc max ${cArc}/${aArc}; wave max ${cWave}/${aWave}; wave>=4 reach ${cW4}/${aW4}`);

  // channel laundering (watch): inflow channel ratios armed/control
  const chanSum = rs => { const o = {}; for (const r of rs) for (const [k, v] of Object.entries(r.end.chan || {})) o[k] = (o[k] || 0) + v; return o; };
  const cCh = chanSum(C), aCh = chanSum(A);
  const ratios = Object.keys(aCh).map(k => [k, cCh[k] > 0 ? aCh[k] / cCh[k] : (aCh[k] > 0 ? Infinity : 1)]);
  const maxR = ratios.reduce((m, [, r]) => Math.max(m, r === Infinity ? 99 : r), 0);
  console.log(`watch: channel ratios (armed/control): ${ratios.map(([k, r]) => k + '=' + (r === Infinity ? 'inf' : r.toFixed(2) + 'x')).join(', ')}`);
  if (maxR > 2) console.log('  NOTE: a channel exceeds 2x — review for laundering');

  // death-cause shares (watch)
  const causes = rs => { const o = {}; for (const r of rs) for (const d of (r.end.deaths || [])) { const k = kindOf(d.cause); o[k] = (o[k] || 0) + 1; } return o; };
  console.log(`watch: deaths by family control ${JSON.stringify(causes(C))} | armed ${JSON.stringify(causes(A))}`);

  // manual paired rows (#797 fallback instrument)
  for (const a of A) {
    const c = C.find(x => x.seed === a.seed);
    pairedRows.push({
      policy, seed: a.seed,
      c_days: c.end.days, a_days: a.end.days, d_days: a.end.days - c.end.days,
      c_rot100: +(rot(c) / days(c) * 100).toFixed(0), a_rot100: +(rot(a) / days(a) * 100).toFixed(0),
      c_starve: starveDeaths(c), a_starve: starveDeaths(a),
      c_nat: nationalReach(c) ? 1 : 0, a_nat: nationalReach(a) ? 1 : 0,
      a_depriKcal: a.end.depriKcal, a_freshMed: a.end.freshDaysMedian, c_freshMed: c.end.freshDaysMedian,
    });
  }
}

// (c) no new death modes: pooled control corpus across both policies
{
  const cFam = new Set(), aFam = new Set();
  for (const p of ['leadfeast', 'belongfeast']) {
    for (const r of rowsOf('control', p)) for (const d of (r.end.deaths || [])) cFam.add(kindOf(d.cause));
    for (const r of rowsOf('armed', p)) for (const d of (r.end.deaths || [])) aFam.add(kindOf(d.cause));
  }
  const novel = [...aFam].filter(k => !cFam.has(k));
  check('(c) no new death modes (armed families ⊆ pooled control corpus)', novel.length === 0,
    `armed {${[...aFam].sort().join(',')}} ⊆ control {${[...cFam].sort().join(',')}}${novel.length ? ' NOVEL: ' + novel.join(',') : ''}`);
}

console.log('\n== MANUAL PAIRED ROWS (#797 fallback; per-seed, armed vs control) ==');
console.log('policy seed | c_days a_days d | c_rot100 a_rot100 | c_starve a_starve | c_nat a_nat | a_depriKcal a_freshMed/c_freshMed');
for (const r of pairedRows) {
  console.log(`${r.policy} ${r.seed} | ${r.c_days} ${r.a_days} ${r.d_days >= 0 ? '+' : ''}${r.d_days} | ${r.c_rot100} ${r.a_rot100} | ${r.c_starve} ${r.a_starve} | ${r.c_nat} ${r.a_nat} | ${r.a_depriKcal} ${r.a_freshMed}/${r.c_freshMed}`);
}

const go = verdicts.leadfeast.primary && verdicts.belongfeast.primary && FAIL.n === 0;
console.log('\nVERDICT: ' + (go ? 'GO — primary both policies, all guardrails hold' : 'NO-GO — see FAIL lines above'));
process.exit(go ? 0 : 1);
