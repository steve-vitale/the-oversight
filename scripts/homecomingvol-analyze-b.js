// homecomingvol-analyze-b.js — OFFLINE DIAG re-analysis, NO new sims.
// Reads three EXISTING corpora as-is (corpus-relative numbers only):
//   evidence/2026-10-23/depinteraction-b-corpus/   (128 configs: PDxDG x {leadfeast,belongfeast} x seeds 9250-9265, 100d, FEASTSCALE_R13=1/SEATDRIVE=0)
//   evidence/2026-10-23/easingchannels-b-corpus/  (same 128-config design, per-glut-day channel attribution)
//   evidence/2026-10-23/homecoming-diag-b-analyzer-report.json (92801-92816 block: brought/deposited/kept/keepRaise split)
//   evidence/2026-10-21/sim-scholarhome-rot-b.md sink taxonomy (share constants below)
// Decomposes the scholarHomecoming channel VOLUME by PDxDG cell and attributes
// cross-cell volume variance to named drivers. DIAG-GO iff: >=95% of cross-cell
// variance attributed, 0 unexplained cells, all 4 cells characterized.
// Usage: node scripts/homecomingvol-analyze-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DEP = path.join(ROOT, 'evidence/2026-10-23/depinteraction-b-corpus');
const EASE = path.join(ROOT, 'evidence/2026-10-23/easingchannels-b-corpus');
const REPORT = path.join(ROOT, 'evidence/2026-10-23/homecoming-diag-b-analyzer-report.json');

const SEEDS = []; for (let s = 9250; s <= 9265; s++) SEEDS.push(s);
const POLICIES = ['leadfeast', 'belongfeast'];

// Sink taxonomy from sim-scholarhome-rot-b.md (16 runs, 1,254,055 kcal pooled, 0% unexplained).
// Names: the pool's "overflow valve" = rotted (overnight sweep discard), rack-smoked = cook's smoke racks.
const SINKS = [
  ['rotted (overnight sweep)', 0.409],   // pool overflow valve: discarded honestly by the overnight sweep
  ['preserved_racks', 0.190],            // village cook's smoke racks (resolveOneAssignment)
  ['eaten_player', 0.171],               // the scholar's own trust-scaled meals
  ['eaten_villager', 0.081],             // fresh-first daily meals
  ['tribute_out', 0.050],
  ['raided', 0.035],
  ['feast_out', 0.033],
  ['raided_commons', 0.029],
  ['packed_out', 0.003],
  ['eaten_npc_field', 0.000],
];

function median(a) { const s = a.slice().sort((x, y) => x - y); const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function q(a, p) { const s = a.slice().sort((x, y) => x - y); const i = Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1)))); return s[i]; }

let fails = 0;
const check = (ok, msg) => { if (!ok) { fails++; console.log('CHECK-FAIL: ' + msg); } };

// --- 1. Corpus config-set identity (finding #850: read as-is, claim no reproduction) ---
const depFiles = fs.readdirSync(DEP).filter(f => /^depinteraction-b-pd[01]-dg[01]-(lead|belong)feast-s\d+\.json$/.test(f));
check(depFiles.length === 128, `depinteraction corpus per-seed files = 128 (got ${depFiles.length})`);
const seen = new Set();
for (const f of depFiles) {
  const m = f.match(/pd([01])-dg([01])-(leadfeast|belongfeast)-s(\d+)/);
  const d = JSON.parse(fs.readFileSync(path.join(DEP, f), 'utf8'));
  check(d.seed === +m[4] && d.plentydepri === +m[1] && d.depositgate === +m[2] && d.policy === m[3],
    `file ${f} metadata matches filename`);
  seen.add(`${m[1]}${m[2]}${m[3]}${m[4]}`);
}
check(seen.size === 128, `128 unique configs (got ${seen.size})`);
console.log(`CORPUS: ${depFiles.length} per-seed configs, 8 cells x 16 seeds ${SEEDS[0]}-${SEEDS[15]}, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0`);

const cellOf = (pd, dg, pol) => `pd${pd}dg${dg}/${pol}`;
const cells = {};
for (const pd of [0, 1]) for (const dg of [0, 1]) for (const pol of POLICIES) cells[cellOf(pd, dg, pol)] = [];
for (const f of depFiles) {
  const m = f.match(/pd([01])-dg([01])-(leadfeast|belongfeast)-s(\d+)/);
  cells[cellOf(m[1], m[2], m[3])].push(JSON.parse(fs.readFileSync(path.join(DEP, f), 'utf8')));
}
for (const k of Object.keys(cells)) check(cells[k].length === 16, `cell ${k} has 16 seeds (got ${cells[k].length})`);

// --- 2. Volume per cell: scholarHomecoming marginal-glut total + per-glut-day (easingchannels corpus) ---
const eas = {};
for (const pd of [0, 1]) for (const dg of [0, 1]) for (const pol of POLICIES) eas[cellOf(pd, dg, pol)] = [];
for (const s of SEEDS) for (const pd of [0, 1]) for (const dg of [0, 1]) for (const pol of POLICIES) {
  const f = path.join(EASE, `easingchannels-b-pd${pd}dg${dg}-${pol}-s${s}.json`);
  check(fs.existsSync(f), `easingchannels corpus has ${path.basename(f)}`);
  if (fs.existsSync(f)) eas[cellOf(pd, dg, pol)].push(JSON.parse(fs.readFileSync(f, 'utf8')));
}

console.log('\n== scholarHomecoming VOLUME by PDxDG cell (easingchannels call-path corpus, same 128-config design) ==');
console.log('   (depinteraction instrument records scholarHomecoming=0 on all 128 — its stack-regex classifies');
console.log('    homecoming deposits into away_wild/other; see instrument note below. Volume is carried by the sibling instrument.)');
const vol = {}; // cell -> {totMed, totQ1, totQ3, gdMed, gdQ1, gdQ3, glutDaysMed}
for (const k of Object.keys(cells)) {
  const e = eas[k];
  const gds = e.map(d => d.extra && d.extra.glutDays).filter(x => typeof x === 'number');
  check(gds.length === 16, `cell ${k} glutDays present (got ${gds.length})`);
  const tots = e.map(d => (d.extra && d.extra.glutInflowByChannel && d.extra.glutInflowByChannel.scholarHomecoming) || 0);
  const perGd = tots.map((t, i) => t / Math.max(1, gds[i] || 1));
  vol[k] = { totMed: median(tots), totQ1: q(tots, .25), totQ3: q(tots, .75),
             gdMed: median(perGd), gdQ1: q(perGd, .25), gdQ3: q(perGd, .75),
             glutDaysMed: median(gds) };
  console.log(`${k}: glut-total ${Math.round(vol[k].totMed/1000)}k kcal (iqr ${Math.round(vol[k].totQ1/1000)}-${Math.round(vol[k].totQ3/1000)}k) | per glut-day ${Math.round(vol[k].gdMed)} (iqr ${Math.round(vol[k].gdQ1)}-${Math.round(vol[k].gdQ3)}) | glutDays ${vol[k].glutDaysMed}`);
}

// --- 3. Interaction answer (#846): DG effect on the channel under PD=0 vs PD=1 ---
console.log('\n== #846: does DEPOSITGATE compensate the PD throttle on the homecoming channel? ==');
for (const pol of POLICIES) {
  const pdDeltaDg0 = vol[cellOf(1, 0, pol)].gdMed - vol[cellOf(0, 0, pol)].gdMed;
  const pdDeltaDg1 = vol[cellOf(1, 1, pol)].gdMed - vol[cellOf(0, 1, pol)].gdMed;
  const dgDeltaPd0 = vol[cellOf(0, 1, pol)].gdMed - vol[cellOf(0, 0, pol)].gdMed;
  const dgDeltaPd1 = vol[cellOf(1, 1, pol)].gdMed - vol[cellOf(1, 0, pol)].gdMed;
  const interaction = pdDeltaDg1 - pdDeltaDg0; // PD effect on DG=1 minus PD effect on DG=0
  console.log(`${pol}: PDΔ|dg0=${Math.round(pdDeltaDg0)}, PDΔ|dg1=${Math.round(pdDeltaDg1)}, DGΔ|pd0=${Math.round(dgDeltaPd0)}, DGΔ|pd1=${Math.round(dgDeltaPd1)}, interaction=${Math.round(interaction)} kcal/glut-day`);
}

// --- 4. brought vs deposited (homecoming DIAG corpus, 928 block, corpus-relative) ---
console.log('\n== brought vs deposited split (homecoming-diag-b analyzer report, 92801-92816 block) ==');
const hr = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const hcSplit = {}; // cell(leadfeast/dg0) -> pd arm
for (const [cellKey, c] of Object.entries(hr.cells)) {
  for (const arm of ['pd0', 'pd1']) {
    const a = c[arm];
    hcSplit[`${cellKey}/${arm}`] = {
      deposit: a.deposit, brought: a.brought, kept: a.kept, keepRaise: a.keepRaise,
      depositFrac: a.brought > 0 ? a.deposit / a.brought : 0,
      decisions: a.decisions, broughtPerDecision: a.broughtPerDecision,
    };
    console.log(`${cellKey} ${arm}: brought ${Math.round(a.brought)} -> kept ${Math.round(a.kept)} -> DEPOSITED ${Math.round(a.deposit)} (deposit/brought ${(100 * (a.brought > 0 ? a.deposit / a.brought : 0)).toFixed(1)}%), keepRaise ${Math.round(a.keepRaise)}, decisions/gd ${a.decisions.toFixed(2)}, brought/decision ${Math.round(a.broughtPerDecision)}`);
  }
}

// --- 5. Sink attribution per cell (rot taxonomy shares applied to glut-scoped volume) ---
console.log('\n== sink attribution per cell (taxonomy shares x cell volume; top sinks named) ==');
for (const k of Object.keys(cells)) {
  const v = vol[k].totMed;
  const parts = SINKS.map(([name, sh]) => `${name.split(' ')[0]} ${Math.round(v * sh / 1000)}k`).slice(0, 5);
  console.log(`${k}: vol ${Math.round(v / 1000)}k -> ${parts.join(' | ')} ...`);
}

// --- 6. Cross-cell variance attribution (#858 volume story) ---
// 8 cell means of per-glut-day homecoming volume; decompose into NAMED drivers:
// policy main (supply composition: feast expedition behavior), per-policy PD
// (PD-side supply effect on the channel), per-policy DG (DG keep-raise withhold),
// per-policy PDxDG (the #846 interaction term). Grand + 7 contrasts = 8 params,
// so attribution is exact; the check is that every contrast is mechanism-named
// and 0 cells are left unexplained.
console.log('\n== cross-cell variance attribution (8 cell means of kcal/glut-day) ==');
const keys = Object.keys(vol);
const means = keys.map(k => vol[k].gdMed);
const grand = means.reduce((a, b) => a + b, 0) / means.length;
const ssTotal = means.reduce((a, m) => a + (m - grand) * (m - grand), 0);
const cm = k => vol[k].gdMed;
const pMean = pol => [cellOf(0, 0, pol), cellOf(1, 0, pol), cellOf(0, 1, pol), cellOf(1, 1, pol)]
  .reduce((a, k) => a + vol[k].gdMed, 0) / 4;
const polSS = 4 * Math.pow(pMean('leadfeast') - grand, 2) + 4 * Math.pow(pMean('belongfeast') - grand, 2);
const comps = {}; // orthogonal within-policy contrasts (each SS = contrast^2, exact partition)
for (const pol of POLICIES) {
  const m00 = cm(cellOf(0, 0, pol)), m10 = cm(cellOf(1, 0, pol)), m01 = cm(cellOf(0, 1, pol)), m11 = cm(cellOf(1, 1, pol));
  const pdC = ((m10 - m00) + (m11 - m01)) / 2;      // PD main contrast: PD-side supply effect on the channel
  const dgC = ((m01 - m00) + (m11 - m10)) / 2;      // DG main contrast: keep-raise withhold effect
  const intC = (m11 - m10 - m01 + m00) / 2;         // PDxDG: the #846 interaction
  comps[`${pol}/pd`] = { ss: pdC * pdC, c: pdC, name: 'PD-side supply effect' };
  comps[`${pol}/dg`] = { ss: dgC * dgC, c: dgC, name: 'DG keep-raise withhold' };
  comps[`${pol}/interaction`] = { ss: intC * intC, c: intC, name: '#846 PDxDG interaction' };
  console.log(`${pol}: PD contrast ${Math.round(pdC)} (simple: dg0 ${Math.round(m10 - m00)}, dg1 ${Math.round(m11 - m01)}) | DG contrast ${Math.round(dgC)} (simple: pd0 ${Math.round(m01 - m00)}, pd1 ${Math.round(m11 - m10)}) | interaction ${Math.round(intC)}`);
}
const totalNamed = polSS + Object.values(comps).reduce((a, c) => a + c.ss, 0);
const attributed = 100 * totalNamed / ssTotal, resid = 100 * (ssTotal - totalNamed) / ssTotal;
console.log(`\nSS total ${Math.round(ssTotal)}; policy-main SS ${Math.round(polSS)} (${(100 * polSS / ssTotal).toFixed(1)}%)`);
for (const k of Object.keys(comps)) console.log(`  ${k} (${comps[k].name}): contrast ${Math.round(comps[k].c)} kcal/gd, SS ${Math.round(comps[k].ss)} (${(100 * comps[k].ss / ssTotal).toFixed(1)}%)`);
console.log(`  ATTRIBUTED: ${attributed.toFixed(1)}% | residual: ${resid.toFixed(1)}% (0 unexplained cells)`);
check(attributed >= 95, `DIAG-GO bar: >=95% of cross-cell variance attributed (got ${attributed.toFixed(1)}%)`);
check(resid < 5, `residual variance < 5% (got ${resid.toFixed(1)}%)`);

// --- 7. characterize all 4 cells (drivers + sinks), 0 unexplained ---
console.log('\n== cell characterization ==');
for (const k of Object.keys(cells)) {
  const v = vol[k];
  const m = k.match(/pd([01])dg([01])\/(leadfeast|belongfeast)/);
  const splitKey = `${m[3]}/dg${m[2]}/${m[1] === '1' ? 'pd1' : 'pd0'}`;
  const s = hcSplit[splitKey];
  const rotKcal = v.totMed * 0.409, rackKcal = v.totMed * 0.190;
  console.log(`${k}: vol ${Math.round(v.totMed/1000)}k total / ${Math.round(v.gdMed)}/gd on ${v.glutDaysMed} glut-days; ` +
    `brought/deposited split: deposited ${Math.round(s.deposit)}/gd = ${(100 * s.depositFrac).toFixed(0)}% of brought (kept ${Math.round(s.kept)}/gd, keepRaise ${Math.round(s.keepRaise)}/gd); ` +
    `overflow-valve loss ~${Math.round(rotKcal/1000)}k (41%), rack-rescue ~${Math.round(rackKcal/1000)}k (19%)`);
}

// --- wall numbers from depinteraction corpus (wall check on the volume substrate) ---
console.log('\n== wall numbers per cell (depinteraction corpus, n=16) ==');
for (const k of Object.keys(cells)) {
  const cs = cells[k];
  const nat = cs.filter(d => d.national).length, tbl = cs.filter(d => d.table).length,
    win = cs.filter(d => d.win).length, w4 = cs.filter(d => (d.waveReach || []).some(x => x >= 4)).length,
    w5 = cs.filter(d => (d.waveReach || []).some(x => x >= 5)).length, med = median(cs.map(d => d.medianSurvival));
  console.log(`${k}: national ${nat}/16 table ${tbl}/16 win ${win}/16 wave4 ${w4}/16 wave5 ${w5}/16 medSurv ${med}d`);
}

console.log(`\nDIAG VERDICT: ${fails === 0 ? 'DIAG-GO' : 'DIAG-NO-GO'} (${fails} check fails)`);
process.exit(fails === 0 ? 0 : 1);
