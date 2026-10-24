#!/usr/bin/env node
// analyze-keepceil-b.js — KEEPCEIL keep-ceiling volume knob verdict
// (sim-keepceil-b, 2026-10-24).
//
// Reads the keepceil sweep JSONs (kc4000/kc6000/kc8000 x leadfeast/
// belongfeast, seeds 9250-9265, 100d death-aware, FEASTSCALE_R13=1/
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, KEEPCEIL explicit — produced
// by scripts/sweep-keepceil-b.js) and asserts the PRE-REGISTERED verdict
// in evidence/2026-10-24/sim-keepceil-b.md (§14 binds: a miss is a miss,
// never re-scored).
//
// PRE-REGISTRATION (bound):
//   PRIMARY (per policy): mean hc glutDeposit per glut-day STRICTLY
//     decreasing in KEEPCEIL: 4000 > 6000 > 8000 (the ceiling binds).
//   NO ROT REGRESSION: fresh-rot/100d at 4000 and 8000 <= the 6000 cell,
//     BOTH policies.
//   GUARDRAILS (4000 and 8000 vs 6000 control, per policy):
//     (a) paired survival diff median >= -10d;
//     (b) exposure-normalized starvation <= control + 2/(armedVD/100);
//     (c) no new death modes (armed cause-families ⊆ pooled control);
//     (d) national(end) >= control-2;
//     (e) freshDays median >= 0.5x control.
//   ENGAGEMENT: keepRaiseEvents > 0 on >= ENGAGE_MIN seeds per cell
//     (7 at pilot, 14 at confirm — set via ENGAGE_MIN env).
//   OFF-IDENTITY (when the kcoff leadfeast summary is present): per-seed
//     perSeed fields (minus medianSurvival) byte-equal to kc6000 leadfeast.
//   Verdict: GO iff primary + rot + all guardrails + engagement +
//     off-identity (when present) on both policies. Else NO-GO.
//   Also patches each per-seed corpus JSON with the cell medianSurvival
//   and prints the wall numbers + manual paired rows (the §15 panel
//   fallback: env-gated compares may be invalid-by-construction, #797).
//
// Exit 0 on GO, 1 on NO-GO, 2 on malformed input.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.KEEPCEIL_DIR || path.join(__dirname, '..', 'evidence', '2026-10-24', 'keepceil-b-corpus');
const SEEDS = (process.env.EXPECTED_SEEDS || '9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265').split(',').map(s => parseInt(s.trim(), 10));
const ENGAGE_MIN = parseInt(process.env.ENGAGE_MIN || '14', 10);

const FAIL = { n: 0 };
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
const report = (...a) => console.log(...a);
const check = (name, cond, detail) => { report((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : '')); if (!cond) FAIL.n++; };

const cells = ['kc4000', 'kc6000', 'kc8000'];
const policies = ['leadfeast', 'belongfeast'];
const sweeps = {};
for (const cell of cells) for (const policy of policies) {
  const f = path.join(DIR, `sweep-${cell}-${policy}.json`);
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  sweeps[cell + '|' + policy] = j;
  const m = j.meta;
  if ((m.seeds || []).join(',') !== SEEDS.join(',')) { console.error('SEED MISMATCH in ' + f + ' got ' + (m.seeds || []).join(',')); process.exit(2); }
  if (m.days !== 100 || m.env.FEASTSCALE_R13 !== '1' || m.env.SEATDRIVE !== '0') { console.error('ENV/HORIZON MISMATCH in ' + f); process.exit(2); }
  if (m.env.PLENTYDEPRI !== '0' || m.env.DEPOSITGATE !== '1') { console.error('GATE ENV MISMATCH in ' + f); process.exit(2); }
  const kcWant = cell === 'kc4000' ? '4000' : cell === 'kc6000' ? '6000' : '8000';
  if (m.env.KEEPCEIL !== kcWant) { console.error('KEEPCEIL ENV MISMATCH in ' + f); process.exit(2); }
  for (const r of (j.rows || [])) {
    if (r.keepceil !== parseInt(kcWant, 10) || r.depositgate !== 1 || r.plentydepri !== 0) { console.error('SCHEMA MISMATCH in ' + f); process.exit(2); }
    if (!r.hc || typeof r.hc.depositPerGlutDay !== 'number' && r.hc.depositPerGlutDay !== null) { console.error('HC SCHEMA MISMATCH in ' + f); process.exit(2); }
  }
}
check('input sweeps present: 3 cells x 2 policies, seeds as expected, 100d, R13=1/SEATDRIVE=0, PD=0/DG=1/KEEPCEIL explicit', true);

const rowsOf = (cell, policy) => sweeps[cell + '|' + policy].rows;
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const rotFresh100 = rs => rs.reduce((t, r) => t + (r.rotFreshKcal || 0), 0) / rs.reduce((t, r) => t + (r.daysAlive || 1), 0) * 100;
const rotTot100 = rs => rs.reduce((t, r) => t + (r.rotFreshKcal || 0) + (r.rotPreservedKcal || 0), 0) / rs.reduce((t, r) => t + (r.daysAlive || 1), 0) * 100;

// monster roster for death-family mapping (same repair as depositrelief).
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
function kindOf(c) {
  c = String(c || '?').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/alien/.test(c)) return 'alien';
  if (/sick|disease|fever|plague|infection/.test(c)) return 'sickness';
  if (/combat|fight|wound|maul|claw|bite|monster|beast|deer|bear/.test(c)) return 'combat';
  for (const n of monsterNames()) { if (n && c.includes(n)) return 'combat'; }
  if (c === 'the night') return 'combat';
  return 'other:' + c.slice(0, 24);
}
const familiesOf = rs => { const s = new Set(); for (const r of rs) for (const k of Object.keys(r.deathCauses || {})) { const cause = k.includes(':') ? k.split(':').slice(1).join(':') : k; s.add(kindOf(cause)); } return s; };
const starveRate = rs => { // deaths per 100 villager-days (extra.starveDeaths)
  const d = rs.reduce((t, r) => t + ((r.extra || {}).starveDeaths || 0), 0);
  const vd = rs.reduce((t, r) => t + (r.villageDays || 0), 0);
  return { rate: vd ? d / vd * 100 : 0, deaths: d, vd };
};

// patch per-seed corpus JSONs with the cell medianSurvival
for (const cell of cells) for (const policy of policies) {
  const rs = rowsOf(cell, policy);
  const medSurv = median(rs.map(r => r.daysAlive));
  for (const r of rs) {
    const f = path.join(DIR, `keepceil-b-${cell}-${policy}-s${r.seed}.json`);
    if (fs.existsSync(f)) {
      try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); j.medianSurvival = medSurv; writeRobust(f, JSON.stringify(j)); } catch (e) { console.error('PATCH FAIL', f, e.message); }
    }
    r.medianSurvival = medSurv;
  }
}

// ---- per-policy verdicts ----
for (const policy of policies) {
  report(`\n== ${policy} ==`);
  const byCell = {};
  for (const cell of cells) {
    const rs = rowsOf(cell, policy);
    const depGd = rs.map(r => r.hc.depositPerGlutDay).filter(v => v !== null);
    const keepGd = rs.map(r => r.hc.keptPerGlutDay).filter(v => v !== null);
    const keepRaiseGd = rs.map(r => r.hc.keepRaisePerGlutDay).filter(v => v !== null);
    byCell[cell] = { rs, depMean: mean(depGd), depMed: median(depGd), keepMean: mean(keepGd), keepRaiseMean: mean(keepRaiseGd) };
    report(`  ${cell}: deposit/gd mean=${byCell[cell].depMean == null ? 'null' : byCell[cell].depMean.toFixed(1)} median=${byCell[cell].depMed == null ? 'null' : byCell[cell].depMed.toFixed(1)} kept/gd mean=${byCell[cell].keepMean == null ? 'null' : byCell[cell].keepMean.toFixed(1)} keepRaise/gd mean=${byCell[cell].keepRaiseMean == null ? 'null' : byCell[cell].keepRaiseMean.toFixed(1)} rotFresh/100d=${rotFresh100(rs).toFixed(0)} rotTot/100d=${rotTot100(rs).toFixed(0)} national=${rs.filter(r => r.national).length}/${rs.length} table=${rs.filter(r => r.table).length} win=${rs.filter(r => r.win).length} wave4=${rs.filter(r => (r.waveReach || [1])[0] >= 4).length} wave5=${rs.filter(r => (r.waveReach || [1])[0] >= 5).length} medSurv=${median(rs.map(r => r.daysAlive))} freshDaysMed=${median(rs.map(r => r.freshDaysMedian).filter(v => v !== null))}`);
    // paired rows (manual §15 fallback rows)
    for (const r of rs) report(`    PAIRED seed=${r.seed} ${cell} dep/gd=${r.hc.depositPerGlutDay} kept/gd=${r.hc.keptPerGlutDay} keepRaiseEv=${r.hc.keepRaiseEvents} dec=${r.hc.decisions} days=${r.daysAlive} rotFresh100d=${r.extra.rot100d} national=${r.national} wave=${(r.waveReach || [1])[0]}`);
  }
  const mono = byCell.kc4000.depMean > byCell.kc6000.depMean && byCell.kc6000.depMean > byCell.kc8000.depMean;
  check(`PRIMARY ${policy}: deposit/gd strictly decreasing in KEEPCEIL`, mono,
    `${byCell.kc4000.depMean == null ? 'null' : byCell.kc4000.depMean.toFixed(1)} > ${byCell.kc6000.depMean == null ? 'null' : byCell.kc6000.depMean.toFixed(1)} > ${byCell.kc8000.depMean == null ? 'null' : byCell.kc8000.depMean.toFixed(1)}`);
  const ctrl = rowsOf('kc6000', policy);
  const ctrlRot = rotFresh100(ctrl);
  for (const armed of ['kc4000', 'kc8000']) {
    const rs = rowsOf(armed, policy);
    check(`ROT ${policy} ${armed}: fresh-rot/100d <= control`, rotFresh100(rs) <= ctrlRot, `${rotFresh100(rs).toFixed(0)} <= ${ctrlRot.toFixed(0)}`);
    const paired = rs.map(r => { const c = ctrl.find(x => x.seed === r.seed); return c ? r.daysAlive - c.daysAlive : null; }).filter(v => v !== null);
    check(`GUARD (a) ${policy} ${armed}: paired survival diff median >= -10d`, median(paired) >= -10, 'median=' + median(paired));
    const aRate = starveRate(rs), cRate = starveRate(ctrl);
    const bar = cRate.rate + (aRate.vd ? 2 / (aRate.vd / 100) : Infinity);
    check(`GUARD (b) ${policy} ${armed}: starvation rate <= control+2/(armedVD/100)`, aRate.rate <= bar, `${aRate.rate.toFixed(3)} <= ${bar.toFixed(3)} (deaths ${aRate.deaths}/${aRate.vd} VD vs control ${cRate.deaths}/${cRate.vd} VD)`);
    const newFams = [...familiesOf(rs)].filter(f => !familiesOf(ctrl).has(f));
    check(`GUARD (c) ${policy} ${armed}: no new death modes`, newFams.length === 0, newFams.length ? 'new: ' + newFams.join(',') : 'families ⊆ control');
    const natA = rs.filter(r => r.national).length, natC = ctrl.filter(r => r.national).length;
    check(`GUARD (d) ${policy} ${armed}: national >= control-2`, natA >= natC - 2, `${natA} vs control ${natC}`);
    const fA = median(rs.map(r => r.freshDaysMedian).filter(v => v !== null)), fC = median(ctrl.map(r => r.freshDaysMedian).filter(v => v !== null));
    check(`GUARD (e) ${policy} ${armed}: freshDays median >= 0.5x control`, fC === null || fA >= 0.5 * fC, `${fA} vs 0.5x${fC}=${fC == null ? 'null' : (0.5 * fC).toFixed(1)}`);
    const eng = rs.filter(r => (r.hc.keepRaiseEvents || 0) > 0).length;
    check(`ENGAGEMENT ${policy} ${armed}: keepRaiseEvents>0 on >=${ENGAGE_MIN}/${rs.length} seeds`, eng >= ENGAGE_MIN, `${eng}/${rs.length}`);
  }
  const engC = ctrl.filter(r => (r.hc.keepRaiseEvents || 0) > 0).length;
  check(`ENGAGEMENT ${policy} kc6000: keepRaiseEvents>0 on >=${ENGAGE_MIN}/${ctrl.length} seeds`, engC >= ENGAGE_MIN, `${engC}/${ctrl.length}`);
  // channel-identity diagnostic (not a GO bar — instrument health)
  let maxGap = 0;
  for (const cell of cells) for (const r of rowsOf(cell, policy)) maxGap = Math.max(maxGap, (r.extra || {}).channelIdentityGap || 0);
  report(`  DIAG ${policy}: max hc channel-identity gap = ${maxGap} kcal`);
}

// ---- OFF-IDENTITY (when kcoff leadfeast summary present) ----
{
  const f = path.join(DIR, 'sweep-kcoff-leadfeast.json');
  if (fs.existsSync(f)) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const ctrl = rowsOf('kc6000', 'leadfeast');
    let diffs = 0;
    for (const r of (j.rows || [])) {
      const c = ctrl.find(x => x.seed === r.seed);
      if (!c) { diffs++; report(`  OFF-DIFF seed=${r.seed}: no kc6000 counterpart`); continue; }
      // BEHAVIORAL identity: exclude the bookkeeping fields — `keepceil`
      // records the env itself (null vs 6000 by construction) and
      // `medianSurvival` is patched only for analyzed cells (kcoff is not
      // an analyzed cell). Comparing them would fail by construction.
      const a = Object.assign({}, r); delete a.medianSurvival; delete a.keepceil;
      const b = Object.assign({}, c); delete b.medianSurvival; delete b.keepceil;
      if (JSON.stringify(a) !== JSON.stringify(b)) { diffs++; report(`  OFF-DIFF seed=${r.seed}: behavioral perSeed fields differ (kcoff vs kc6000)`); }
    }
    check('OFF-IDENTITY leadfeast: kcoff per-seed JSON == kc6000 per-seed JSON (minus medianSurvival)', diffs === 0, diffs ? diffs + ' differing seeds' : 'all ' + (j.rows || []).length + ' seeds identical');
  } else {
    report('OFF-IDENTITY: kcoff summary absent — skipped (proof-test hash covers OFF identity)');
  }
}

report(FAIL.n === 0 ? '\nVERDICT: GO' : `\nVERDICT: NO-GO (${FAIL.n} failed checks)`);
process.exit(FAIL.n === 0 ? 0 : 1);
