#!/usr/bin/env node
// analyze-pdvalue-b.js — LEVER verdict analyzer for sim-pdvalue-b (2026-10-24,
// oversight-flesh-out-loop-b run fleshout-loop-b-20261024T0812Z, backlog #871).
// Measurement arm, zero src/js changes. Re-examines the PLENTYDEPRI=1 value
// proposition on FRESH seeds on current master: does PD=1 earn its (small)
// survival/national costs, or did drift change the lever's rank among rot
// levers? Derived from scripts/analyze-pdtradeoff-b.js (cited) with the
// declared deltas: verdict logic replaces DIAG resolution; seed list is
// env-driven (PDVALUE_SEEDS); the bufferdepri byte-reproduce section is
// replaced by a C1 freshness check (taken blocks + pdtradeoff corpus scan);
// the ms field is never byte-compared (pdtradeoff metric review: the ms gap
// made that check unpassable by construction — this analyzer compares
// trajectories, not wall-clock timings).
//
// PRE-REGISTRATION (binding per §14 — a miss is NO-GO, never re-scored):
//   substrate FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware horizons,
//   policies {leadfeast,belongfeast}, cells {pd0,pd1}x{dg0,dg1}, DG explicit.
//   PRIMARY: rot/100d PD=1/PD=0 <= 0.85 on at least 3 of 4 cells.
//     rot/100d = sum(rotFreshKcal+rotPreservedKcal)/sum(daysAlive)*100.
//   GUARDRAILS (per cell): exposure-normalized starvation <= control+0.02
//     /100vd; national >= control-2; no new death modes (no kind-mapped
//     cause kind present in PD=1 with >=2 deaths and absent from control).
//   VERDICT: GO ("earns its costs") iff PRIMARY + all guardrails pass;
//     otherwise NO-GO with the rank implication in the evidence file.
//   PILOT GATE: 8 seeds (94001-94008) before ANY confirm spend; confirm
//     16 fresh seeds (94011-94026) only if the pilot passes its own bar:
//     pilot GO-bar = primary met on the pilot (<=0.85 on >=3/4 cells) — a
//     pilot that already fails the primary is killed-at-pilot, never
//     confirmed. (Confirm adds power; it does not rescue a failed primary.)
//   Seeds: PDVALUE_SEEDS env, comma list. Pilot default 94001-94008;
//     full default 94001-94008,94011-94026.
//   Panel per §15: env-gated -> #797 invalid by construction; the attempt
//     is documented in pdvalue-b-panel-compare.md and the verdict is judged
//     on manual paired rows below. The metric is NOT re-scored.
//
// Exits 0 on a completed analysis (verdict printed, GO or NO-GO), 2 on
// input/corpus/schema failure. Report goes to STDOUT; the runner captures
// it into the evidence file.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'pdvalue-b-corpus');
const TRADEOFF_DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'pdtradeoff-b-corpus');
const SEEDS = (process.env.PDVALUE_SEEDS ||
  '94001,94002,94003,94004,94005,94006,94007,94008,94011,94012,94013,94014,94015,94016,94017,94018,94019,94020,94021,94022,94023,94024,94025,94026')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SEED_CSV = SEEDS.join(',');

const out = [];
const report = s => { out.push(s); console.log(s); };
const FAIL = { n: 0 };
const check = (name, cond, detail) => {
  report((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

report('# sim-pdvalue-b LEVER verdict analyzer — ' + new Date().toISOString());
report('substrate: FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware, policies {leadfeast,belongfeast}, cells {pd0,pd1}x{dg0,dg1}, DG FATAL-explicit');
report('seeds: ' + SEED_CSV + ' (' + SEEDS.length + ' seeds)');
report('PRE-REG: primary rot/100d <=0.85 on >=3/4 cells; guardrails starvation <=control+0.02/100vd, national >=control-2, no new death modes; GO iff primary+guardrails pass.');

// ---- C1 freshness check (binding: fresh seeds or the verdict is void) ----
const TAKEN = [];
for (let s = 9250; s <= 9265; s++) TAKEN.push(s);
for (let s = 92801; s <= 92816; s++) TAKEN.push(s);
for (let s = 92831; s <= 92846; s++) TAKEN.push(s);
const takenHit = SEEDS.filter(s => TAKEN.includes(s));
check('C1 freshness: no seed in taken blocks (9250-9265, 92801-92816, 92831-92846)', takenHit.length === 0, takenHit.length ? 'COLLISION: ' + takenHit.join(',') : SEEDS.length + ' seeds clear');
let tradeoffSeeds = new Set();
try {
  for (const f of fs.readdirSync(TRADEOFF_DIR)) {
    if (!/\.json$/.test(f) || f.startsWith('sweep-')) continue;
    try { const j = JSON.parse(fs.readFileSync(path.join(TRADEOFF_DIR, f), 'utf8')); if (Number.isInteger(j.seed)) tradeoffSeeds.add(j.seed); } catch (e) {}
  }
} catch (e) { report('(pdtradeoff corpus dir unreadable for freshness scan: ' + e.message + ')'); }
const overlap = SEEDS.filter(s => tradeoffSeeds.has(s));
check('C1 freshness: no seed in the pdtradeoff corpus (per-seed seed fields)', overlap.length === 0, overlap.length ? 'OVERLAP: ' + overlap.join(',') : 'pdtradeoff corpus holds ' + tradeoffSeeds.size + ' distinct seeds, none reused');
if (FAIL.n) { console.error('FRESHNESS FAILED — verdict void; aborting analysis.'); process.exit(2); }

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
  if ((m.seeds || []).join(',') !== SEED_CSV) { console.error('SEED MISMATCH in ' + f + ' (want ' + SEED_CSV + ', got ' + (m.seeds || []).join(',') + ')'); process.exit(2); }
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
check('input sweeps present: 4 cells x 2 policies, ' + SEEDS.length + ' seeds, 100d, R13=1/SEATDRIVE=0, both gates explicit', true);

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
check('glutChannels partition conserved (sum ~= total inflow) on all runs', true);

// ---- medianSurvival patch (pdtradeoff-documented analyzer mutation) ----
report('\n== medianSurvival patch ==');
for (const cell of cells) for (const policy of policies) {
  const rows = rowsOf(cell, policy);
  const med = median(rows.map(days));
  for (const r of rows) {
    const f = path.join(DIR, `pdvalue-b-${cell}-${policy}-s${ps(r).seed}.json`);
    if (!fs.existsSync(f)) { console.error('PER-SEED MISSING ' + f); process.exit(2); }
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    j.medianSurvival = med;
    fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n');
    ps(r).medianSurvival = med;
  }
  report(`patched ${cell}|${policy}: medianSurvival=${med} (${rows.length} files)`);
}
check('per-seed corpus JSONs patched with cell medianSurvival', true);

// ---- PRIMARY + GUARDRAILS (pre-registered, binding) ----
report('\n== PRIMARY (binding): PD=1/PD=0 rot/100d ratio per cell (bar <=0.85) ==');
const ratioOf = (policy, dg) => {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  const c = rot100(C), a = rot100(A);
  return { c, a, ratio: c > 0 ? a / c : (a > 0 ? Infinity : 1), C, A };
};
const primary = {};
let primaryPass = 0;
for (const policy of policies) {
  primary[policy] = {};
  for (const dg of ['dg0', 'dg1']) {
    const { c, a, ratio } = ratioOf(policy, dg);
    primary[policy][dg] = { c, a, ratio };
    const pass = ratio !== Infinity && ratio <= 0.85;
    if (pass) primaryPass++;
    report(`${policy} ${dg}: control ${(c / 1000).toFixed(1)}k -> pd1 ${(a / 1000).toFixed(1)}k = ${ratio === Infinity ? 'inf' : ratio.toFixed(3)}x ${pass ? 'PASS' : 'FAIL'} (bar <=0.85)`);
  }
}
report(`PRIMARY: ${primaryPass}/4 cells at bar — need >=3 to pass.`);
report('(pdtradeoff anchor on 9250-9265: 0.773x / 0.913x / 0.979x / 1.197x — the fresh-seed question is whether the pilot/full corpus reproduces that thinness.)');

report('\n== GUARDRAILS (binding, per cell) ==');
let guardFail = 0;
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  const cVD = C.reduce((t, r) => t + (ps(r).villageDays || 0), 0), aVD = A.reduce((t, r) => t + (ps(r).villageDays || 0), 0);
  const cS = C.reduce((t, r) => t + starveDeaths(r), 0), aS = A.reduce((t, r) => t + starveDeaths(r), 0);
  const cRate = cVD ? cS / cVD * 100 : 0, aRate = aVD ? aS / aVD * 100 : 0;
  const starvePass = (aRate - cRate) <= 0.02;
  const cNat = C.filter(r => ps(r).national).length, aNat = A.filter(r => ps(r).national).length;
  const natPass = aNat >= cNat - 2;
  const cKinds = {}, aKinds = {};
  for (const r of C) for (const [c, n] of Object.entries(ps(r).deathCauses || {})) cKinds[kindOf(c)] = (cKinds[kindOf(c)] || 0) + n;
  for (const r of A) for (const [c, n] of Object.entries(ps(r).deathCauses || {})) aKinds[kindOf(c)] = (aKinds[kindOf(c)] || 0) + n;
  const newModes = Object.entries(aKinds).filter(([k, n]) => n >= 2 && !(k in cKinds)).map(([k]) => k);
  const modesPass = newModes.length === 0;
  const cellPass = starvePass && natPass && modesPass;
  if (!cellPass) guardFail++;
  report(`${policy} ${dg}: starvation ${cRate.toFixed(3)}->${aRate.toFixed(3)}/100vd (delta ${(aRate - cRate).toFixed(3)}, bar +0.02) ${starvePass ? 'PASS' : 'FAIL'} | national ${cNat}->${aNat} (bar >=${cNat - 2}) ${natPass ? 'PASS' : 'FAIL'} | new modes: ${newModes.length ? newModes.join(',') : 'none'} ${modesPass ? 'PASS' : 'FAIL'}`);
}
report(`GUARDRAILS: ${guardFail === 0 ? 'all cells pass' : guardFail + ' cell(s) fail'}.`);

// ---- VERDICT (judged against the header, never re-scored) ----
const primaryOk = primaryPass >= 3;
const verdict = (primaryOk && guardFail === 0) ? 'GO' : 'NO-GO';
report('\n== VERDICT ==');
report(`PRIMARY ${primaryPass}/4 (need >=3): ${primaryOk ? 'PASS' : 'FAIL'}`);
report(`GUARDRAILS: ${guardFail === 0 ? 'PASS' : 'FAIL'}`);
report(`VERDICT: ${verdict}${verdict === 'GO' ? ' — PD=1 earns its costs on fresh seeds.' : ' — PD=1 does NOT earn its costs on fresh seeds; see evidence file for the rank implication (KEEPCEIL volume knob? rack-rescue? stay / re-price / park).'}`);
if (SEEDS.length === 8) report('PILOT VERDICT (8 seeds): ' + verdict + (verdict === 'GO' ? ' — confirm spend authorized (16 fresh seeds).' : ' — KILLED-AT-PILOT: no confirm spend.'));

// ---- tradeoff table (report) ----
report('\n== TRADEOFF TABLE (PD=1 vs PD=0 per cell) ==');
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

// ---- manual paired rows (§15 fallback) ----
report('\n== MANUAL PAIRED ROWS (§15 fallback; automated panel invalid by construction — see panel compare .md) ==');
report('policy dg seed | c_days a_days d_days | c_rot100 a_rot100 | c_starve a_starve | c_nat a_nat');
for (const policy of policies) for (const dg of ['dg0', 'dg1']) {
  const C = rowsOf(`pd0-${dg}`, policy), A = rowsOf(`pd1-${dg}`, policy);
  for (const a of A) {
    const c = C.find(x => ps(x).seed === ps(a).seed);
    const p = { seed: ps(a).seed, c_days: days(c), a_days: days(a), d_days: days(a) - days(c),
      c_rot100: +(rot(c) / days(c) * 100).toFixed(0), a_rot100: +(rot(a) / days(a) * 100).toFixed(0),
      c_starve: starveDeaths(c), a_starve: starveDeaths(a),
      c_nat: ps(c).national ? 1 : 0, a_nat: ps(a).national ? 1 : 0 };
    report(`${policy} ${dg} s${p.seed} | ${p.c_days} ${p.a_days} ${p.d_days >= 0 ? '+' : ''}${p.d_days} | ${p.c_rot100} ${p.a_rot100} | ${p.c_starve} ${p.a_starve} | ${p.c_nat} ${p.a_nat}`);
  }
}

report('\n== SUMMARY ==');
report(`checks: ${FAIL.n} FAIL`);
for (const policy of policies) for (const dg of ['dg0', 'dg1'])
  report(`primary ${policy}/${dg}: ${primary[policy][dg].ratio === Infinity ? 'inf' : primary[policy][dg].ratio.toFixed(3)}x`);
report(`VERDICT: ${verdict}`);
report('metric review: see the evidence file (a miss here is NO-GO, never re-scored; doubts go to the NEXT run).');
if (FAIL.n) { console.error('ANALYZER CHECKS FAILED: ' + FAIL.n); process.exit(2); }
report('analyzer exit 0 — LEVER verdict complete.');
