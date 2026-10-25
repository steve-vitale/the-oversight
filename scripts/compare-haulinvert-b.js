// compare-haulinvert-b.js — field-by-field comparison of the inverted-
// predicate corpus against the sim-haulcount-b pilot corpus
// (sim-haulinvert-b, 2026-10-25, oversight-flesh-out-loop-b).
//
// For every seed x side in the identical pilot (9400-9407 x pd0/pd1,
// leadfeast/dg1), loads the prior per-seed file and the new per-seed
// file and checks:
//   H4: every field EXCEPT anchorCommit and the new inv* fields is
//       exactly equal (src/ unchanged since the prior pilot tip, so
//       the deterministic harness must reproduce the prior files).
//   H1: invHaulActions >= haulActions and invHaulKcal >= haulKcal.
//   Closure: pantryDeposit = invHaul + stockExcluded + homeExcluded
//       + foreign, for actions and kcal alike.
//   Preserve columns are reported as controls (scholar columns are
//       policy-dependent; villager columns carry preservation here).
// Also prints the per-file table and per-side ranges for both
// predicates, plus the inv-minus-current delta per file.
//
// Usage:
//   node scripts/compare-haulinvert-b.js --prior evidence/2026-10-25/haulcount-b-corpus --new evidence/2026-10-25/haulinvert-b-corpus [--seeds 9400-9407]
// Exit non-zero on any H1/H4/closure failure. Prints PASS/FAIL lines.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const priorDir = path.isAbsolute(getArg('--prior') || '') ? getArg('--prior') : path.join(ROOT, getArg('--prior') || 'evidence/2026-10-25/haulcount-b-corpus');
const newDir = path.isAbsolute(getArg('--new') || '') ? getArg('--new') : path.join(ROOT, getArg('--new') || 'evidence/2026-10-25/haulinvert-b-corpus');
const seedRange = (getArg('--seeds') || '9400-9407').split('-').map(Number);
const SEEDS = [];
for (let s = seedRange[0]; s <= seedRange[1]; s++) SEEDS.push(s);

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function findFile(dir, prefix, side, seed) {
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && !f.includes('trace') && f.endsWith(`-${side}-dg1-leadfeast-s${seed}.json`));
  return files.length === 1 ? path.join(dir, files[0]) : null;
}

const INV_FIELDS = ['invHaulActions', 'invHaulKcal', 'invStockExcludedActions', 'invStockExcludedKcal',
  'invPiecesHomeExcludedActions', 'invPiecesHomeExcludedKcal', 'invPiecesForeignActions', 'invPiecesForeignKcal'];
const rows = [];
for (const side of ['pd0', 'pd1']) {
  for (const seed of SEEDS) {
    const priorPath = findFile(priorDir, 'haulcount-b-', side, seed);
    const newPath = findFile(newDir, 'haulinvert-b-', side, seed);
    check(`prior file ${side} s${seed} found`, !!priorPath, priorPath || 'missing');
    check(`new file ${side} s${seed} found`, !!newPath, newPath || 'missing');
    if (!priorPath || !newPath) continue;
    const prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
    const cur = JSON.parse(fs.readFileSync(newPath, 'utf8'));
    // H4: every shared non-anchor field equal.
    const keys = Object.keys(prior).filter((k) => k !== 'anchorCommit');
    for (const k of keys) {
      check(`H4 ${side} s${seed} field ${k} reproduced`, prior[k] !== undefined && JSON.stringify(prior[k]) === JSON.stringify(cur[k]),
        `prior=${JSON.stringify(prior[k])} new=${JSON.stringify(cur[k])}`);
    }
    // H1: inversion is a superset.
    check(`H1 ${side} s${seed} invHaulActions >= haulActions`, cur.invHaulActions >= cur.haulActions, `${cur.invHaulActions} vs ${cur.haulActions}`);
    check(`H1 ${side} s${seed} invHaulKcal >= haulKcal`, cur.invHaulKcal >= cur.haulKcal, `${cur.invHaulKcal} vs ${cur.haulKcal}`);
    // Closure.
    check(`closure ${side} s${seed} actions`, cur.pantryDepositActions === cur.invHaulActions + cur.invStockExcludedActions + cur.invPiecesHomeExcludedActions + cur.invPiecesForeignActions,
      `${cur.pantryDepositActions} vs ${cur.invHaulActions}+${cur.invStockExcludedActions}+${cur.invPiecesHomeExcludedActions}+${cur.invPiecesForeignActions}`);
    check(`closure ${side} s${seed} kcal`, cur.pantryDepositKcal === cur.invHaulKcal + cur.invStockExcludedKcal + cur.invPiecesHomeExcludedKcal + cur.invPiecesForeignKcal,
      `${cur.pantryDepositKcal} vs ${cur.invHaulKcal}+${cur.invStockExcludedKcal}+${cur.invPiecesHomeExcludedKcal}+${cur.invPiecesForeignKcal}`);
    // Inv fields are non-negative ints.
    for (const f of INV_FIELDS) check(`inv field ${side} s${seed} ${f} non-neg int`, Number.isSafeInteger(cur[f]) && cur[f] >= 0, `${f}=${cur[f]}`);
    rows.push({ side, seed, days: cur.daysAlive, haulActions: cur.haulActions, haulKcal: cur.haulKcal,
      invHaulActions: cur.invHaulActions, invHaulKcal: cur.invHaulKcal,
      dActions: cur.invHaulActions - cur.haulActions, dKcal: cur.invHaulKcal - cur.haulKcal,
      stockExcl: cur.invStockExcludedActions, stockExclK: cur.invStockExcludedKcal,
      homeExcl: cur.invPiecesHomeExcludedActions, foreign: cur.invPiecesForeignActions,
      deposits: cur.pantryDepositActions, presAtt: cur.preserveAttempts,
      villB: cur.preserveVillagerBatches, villK: cur.preserveVillagerKcal, villR: cur.preserveVillagerResolutions,
      rot: cur.rotFreshKcal + cur.rotPreservedKcal, depri: cur.depriKcal });
  }
}

console.log('\nseed side days haul(inv) invHaul dActions/dKcal stockExcl homeExcl foreign deposits presAtt villB/villK/villR');
for (const r of rows) {
  console.log(`${r.seed} ${r.side} ${r.days} ${r.haulActions}/${r.haulKcal} ${r.invHaulActions}/${r.invHaulKcal} +${r.dActions}/+${r.dKcal} ${r.stockExcl}/${r.stockExclK} ${r.homeExcl} ${r.foreign} ${r.deposits} ${r.presAtt} ${r.villB}/${r.villK}/${r.villR}`);
}
for (const side of ['pd0', 'pd1']) {
  const sub = rows.filter((r) => r.side === side);
  if (!sub.length) continue;
  const range = (f) => { const v = sub.map((r) => r[f]).sort((a, b) => a - b); return `${v[0]}–${v[v.length - 1]}`; };
  console.log(`${side} ranges: haulActions ${range('haulActions')} invHaulActions ${range('invHaulActions')} dActions ${range('dActions')} dKcal ${range('dKcal')} stockExcl ${range('stockExcl')}`);
}
console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
