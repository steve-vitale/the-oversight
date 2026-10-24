#!/usr/bin/env node
// analyze-depositrelief-b.js — DEPOSITRELIEF=1 buffer-aware deposit-gate
// stand-down verdict (sim-depositrelief-b, 2026-10-24).
//
// Reads the 4 lever sweep JSONs (dr0/dr1 x leadfeast/belongfeast, 16 seeds
// 9250-9265, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, PLENTYDEPRI=0,
// DEPOSITGATE=1, DEPOSITRELIEF explicit — produced by
// scripts/sweep-depositrelief-b.js, derived from the bufferdepri sweep,
// cited) and asserts the PRE-REGISTERED verdict (§14 binds: a miss is a
// miss, never re-scored).
//
// PRE-REGISTRATION (bound):
//   PRIMARY (per policy): exposure-normalized starvation DR=1 vs DR=0:
//     armedRate <= controlRate + 2/(armedVD/100) (the depinteraction prior
//     bar — per bufferdepri's metric review, the strict bar was
//     chaos-dominated). GO iff holds on BOTH policies.
//   ENGAGEMENT: stand-down ledger counts >0 on >=12/32 DR=1 configs per
//     policy.
//   GUARDRAILS (DR=1 vs DR=0, per policy):
//     (a) rot/100d DR=1/DR=0 <= 1.10 (non-inferiority — absolute rot is
//         hostile to a repair that keeps hauls flowing);
//     (b) national(end) >= control-2;
//     (c) median paired (dr1-dr0) survival-diff >= -10d (paired by seed);
//     (d) no new death modes: dr1 cause-families (kind-mapped) ⊆ pooled
//         dr0 corpus.
//   Verdict: GO iff primary + engagement + all guardrails on both policies.
//     Else NO-GO, classified per §14a.
//
// Also patches each per-seed corpus JSON with the cell's medianSurvival
// (the schema key the sibling arms read), prints the wall numbers per cell,
// and emits the manual paired rows for the #797 fallback (env-gated levers
// on identical code make the automated panel compare invalid "Unmatched
// flags" by construction — attached alongside, the metric is NOT re-scored).
//
// Exit 0 on GO, 1 on NO-GO, 2 on malformed input.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.DEPOSITRELIEF_DIR || path.join(__dirname, '..', 'evidence', '2026-10-24', 'depositrelief-b-corpus');
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
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.message); process.exit(2); }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}
const check = (name, cond, detail) => {
  report((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

const cells = ['dr0', 'dr1'];
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
  if (m.env.PLENTYDEPRI !== '0') { console.error('PD ENV MISMATCH ' + f); process.exit(2); }
  if (m.env.DEPOSITGATE !== '1') { console.error('DG ENV MISMATCH ' + f); process.exit(2); }
  if (m.env.DEPOSITRELIEF !== (cell === 'dr1' ? '1' : '0')) { console.error('DR ENV MISMATCH ' + f); process.exit(2); }
  for (const r of (j.rows || [])) {
    if (![0, 1].includes(r.perSeed.depositrelief)) { console.error('SCHEMA MISMATCH depositrelief in ' + f); process.exit(2); }
    if (r.perSeed.depositgate !== 1 || r.perSeed.plentydepri !== 0) { console.error('SCHEMA MISMATCH gates in ' + f); process.exit(2); }
    if (!r.diag) { console.error('DIAG MISSING in ' + f); process.exit(2); }
  }
}
check('input sweeps present: 2 cells x 2 policies, 16 seeds, 100d, R13=1/SEATDRIVE=0, PD=0/DG=1/DR explicit', true);

const rowsOf = (cell, policy) => sweeps[cell + '|' + policy].rows;
const ps = r => r.perSeed;
const rot = r => (ps(r).rotFreshKcal || 0) + (ps(r).rotPreservedKcal || 0);
const days = r => ps(r).daysAlive || 1;
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const rot100 = rs => rs.reduce((t, r) => t + rot(r), 0) / rs.reduce((t, r) => t + days(r), 0) * 100;
const starveDeaths = r => Object.entries(ps(r).deathCauses || {}).filter(([k]) => /starv/i.test(k)).reduce((t, [, v]) => t + v, 0);
const starveRate = rs => { // exposure-normalized: deaths per 100 villager-days
  const d = rs.reduce((t, r) => t + starveDeaths(r), 0);
  const vd = rs.reduce((t, r) => t + (ps(r).villageDays || 0), 0);
  return { rate: vd ? d / vd * 100 : 0, deaths: d, vd };
};

function kindOf(c) {
  c = String(c || '?').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/alien/.test(c)) return 'alien';
  if (/sick|disease|fever|plague|infection/.test(c)) return 'sickness';
  if (/combat|fight|wound|maul|claw|bite|monster|beast|deer|bear/.test(c)) return 'combat';
  // MONSTER-NAME KILL FLAVORS ARE COMBAT (instrument repair 2026-10-24):
  // the game records some monster kills under the monster's name
  // ("the landlord" = The Landlord, wave-2) or kill flavor ("the night" =
  // the Night Court's "the night takes it back", app.js:12758 — and a
  // pre-existing cause: 2 occurrences in the bufferdepri-b corpus).
  // Misclassifying a monster kill as a "new death mode" would be an
  // instrument error — the lever (deposit decisions only) cannot create
  // new ways to die. The bar (no new modes) is unchanged.
  const names = monsterNames();
  for (const n of names) { if (n && c.includes(n)) return 'combat'; }
  if (c === 'the night') return 'combat';
  return 'other:' + c.slice(0, 24);
}

// monster roster (ids + names, lowercased) for kindOf's combat mapping
let MONSTER_NAMES = null;
function monsterNames() {
  if (!MONSTER_NAMES) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
      const list = Array.isArray(m) ? m : (m.monsters || []);
      MONSTER_NAMES = [];
      for (const x of list) {
        const nm = String(x.name || '').toLowerCase(); if (nm) MONSTER_NAMES.push(nm);
        const id = String(x.id || '').toLowerCase(); if (id) MONSTER_NAMES.push(id);
      }
    } catch (e) { MONSTER_NAMES = []; }
  }
  return MONSTER_NAMES;
}

// patch per-seed corpus JSONs with the cell medianSurvival (schema key)
for (const cell of cells) for (const policy of policies) {
  const rows = rowsOf(cell, policy);
  const med = median(rows.map(r => ps(r).daysAlive || 0));
  for (const r of rows) {
    const f = path.join(DIR, `depositrelief-b-${cell}-${policy}-s${r.seed}.json`);
    if (fs.existsSync(f)) {
      try {
        const j = JSON.parse(fs.readFileSync(f, 'utf8'));
        j.medianSurvival = med;
        writeRobust(f, JSON.stringify(j));
      } catch (e) { console.error('MEDIAN PATCH FAIL', f, e.message); }
    }
  }
}

// ---- verdict ----
report('\n=== PRE-REGISTERED VERDICT ===');
for (const policy of policies) {
  const ctrl = rowsOf('dr0', policy), armed = rowsOf('dr1', policy);
  const sA = starveRate(armed), sC = starveRate(ctrl);
  const bar = sC.rate + 2 / (sA.vd / 100);
  check(`PRIMARY ${policy}: armed starvation ${sA.rate.toFixed(3)}/100vd (n=${sA.deaths}/${sA.vd}vd) <= control ${sC.rate.toFixed(3)} + 2/(armedVD/100)=${bar.toFixed(3)}`,
    sA.rate <= bar);
  const engaged = armed.filter(r => (ps(r).reliefStandDownDec || 0) > 0).length;
  check(`ENGAGEMENT ${policy}: stand-down ledger >0 on ${engaged}/32 configs (>=12)`, engaged >= 12);
  const rotRatio = rot100(armed) / (rot100(ctrl) || 1);
  check(`GUARDRAIL(a) ${policy}: rot/100d ratio ${rotRatio.toFixed(3)} <= 1.10`, rotRatio <= 1.10);
  const nC = ctrl.filter(r => ps(r).national).length, nA = armed.filter(r => ps(r).national).length;
  check(`GUARDRAIL(b) ${policy}: national(end) ${nA} >= control-2 (${nC - 2})`, nA >= nC - 2);
  const diffs = armed.map(r => {
    const c = ctrl.find(x => x.seed === r.seed);
    return (ps(r).daysAlive || 0) - (c ? (ps(c).daysAlive || 0) : 0);
  });
  const medDiff = median(diffs);
  check(`GUARDRAIL(c) ${policy}: median paired survival-diff ${medDiff.toFixed(1)}d >= -10d`, medDiff >= -10);
  const corpus = new Set();
  for (const r of ctrl) for (const k of Object.keys(ps(r).deathCauses || {})) corpus.add(kindOf(k));
  const newKinds = new Set();
  for (const r of armed) for (const k of Object.keys(ps(r).deathCauses || {})) { const kk = kindOf(k); if (!corpus.has(kk)) newKinds.add(kk); }
  check(`GUARDRAIL(d) ${policy}: no new death modes (${[...newKinds].join(',') || 'none'})`, newKinds.size === 0);
}

// ---- manual paired rows (#797 fallback) ----
report('\n=== MANUAL PAIRED ROWS (#797 fallback) ===');
report('seed | policy | dr | daysAlive | villageDays | starveDeaths | starveRate/100vd | rotK | easedK | reliefDec | national | maxWave | endReason');
for (const policy of policies) {
  for (const seed of SEEDS.split(',')) {
    for (const cell of cells) {
      const r = rowsOf(cell, policy).find(x => String(x.seed) === seed);
      if (!r) { report(`MISSING ${policy} ${cell} seed ${seed}`); continue; }
      const sd = starveDeaths(r), vd = ps(r).villageDays || 0;
      report(`${seed} | ${policy} | ${cell} | ${ps(r).daysAlive} | ${vd} | ${sd} | ${(vd ? sd / vd * 100 : 0).toFixed(3)} | ${Math.round(rot(r) / 1000)} | ${Math.round((ps(r).easedKcal || 0) / 1000)} | ${ps(r).reliefStandDownDec || 0} | ${ps(r).national ? 1 : 0} | ${r.diag.maxWave} | ${r.diag.endReason}`);
    }
  }
}

// ---- wall numbers per cell ----
report('\n=== SCALE WALL (per cell) ===');
report('cell | policy | national | table/wins | wave>=4 | wave>=5 | survival median/max | scholarDeaths | trapsK(of inflow)');
for (const cell of cells) for (const policy of policies) {
  const rows = rowsOf(cell, policy);
  const nat = rows.filter(r => ps(r).national).length;
  const won = rows.filter(r => ps(r).win).length;
  const w4 = rows.filter(r => (r.diag.maxWave || 1) >= 4).length;
  const w5 = rows.filter(r => (r.diag.maxWave || 1) >= 5).length;
  const surv = rows.map(r => ps(r).daysAlive || 0);
  const sd = rows.reduce((t, r) => t + (r.diag.scholarDeaths || 0), 0);
  const trapsK = Math.round(rows.reduce((t, r) => t + ((r.diag.chan || {}).traps || 0), 0) / 1000);
  const inflowK = Math.round(rows.reduce((t, r) => t + (r.diag.inflowTotal || 0), 0) / 1000);
  report(`${cell} | ${policy} | ${nat}/16 | ${won}/16 | ${w4}/16 | ${w5}/16 | ${median(surv).toFixed(0)}d / ${Math.max(...surv)}d | ${sd} | ${trapsK}k/${inflowK}k`);
}

// ---- death-cause shares (pooled) ----
report('\n=== DEATH-CAUSE SHARES (pooled, kind-mapped) ===');
{
  const agg = {};
  let n = 0;
  for (const cell of cells) for (const policy of policies) for (const r of rowsOf(cell, policy)) {
    for (const [k, v] of Object.entries(ps(r).deathCauses || {})) { const kk = kindOf(k); agg[kk] = (agg[kk] || 0) + v; n += v; }
  }
  for (const [k, v] of Object.entries(agg).sort((a, b) => b[1] - a[1])) report(`  ${k}: ${(v / n * 100).toFixed(1)}% (${v})`);
}

report('\n' + (FAIL.n === 0 ? 'VERDICT: GO' : 'VERDICT: NO-GO (' + FAIL.n + ' misses)'));
process.exit(FAIL.n === 0 ? 0 : 1);
