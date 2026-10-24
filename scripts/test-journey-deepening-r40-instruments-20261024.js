// test-journey-deepening-r40-instruments-20261024.js -- proof that the r40
// "ARMOR THE VILLAGE" harness instruments fire and are deterministic.
// Runs the r40 harness twice (throwaway seed 99, DAYCAP=45) and asserts:
//   (1) the armor block is populated (absorbs array, tierLog, raidLog,
//       snaps, readiness all present; tier-ups + armor census non-empty);
//   (2) the armor-relevant fields are byte-identical across the two runs
//       (instrument determinism, r17 pattern).
// Scratch files are deleted afterwards. Usage:
//   node scripts/test-journey-deepening-r40-instruments-20261024.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EVIDIR = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24';
const SEED = 99;
const jsonFp = path.join(EVIDIR, `journey-deepening-r40-seed${SEED}.json`);
const txRe = new RegExp(`^journey-deepening-r40-transcript-${SEED}-day\\d+\\.txt$`);

function cleanup() {
  try { fs.unlinkSync(jsonFp); } catch (e) {}
  try {
    for (const f of fs.readdirSync(EVIDIR)) {
      if (txRe.test(f)) { try { fs.unlinkSync(path.join(EVIDIR, f)); } catch (e) {} }
    }
  } catch (e) {}
}

function runOnce() {
  cleanup();
  execFileSync('node', [path.join(ROOT, 'scripts', 'journey-deepening-r40-20261024.js')], {
    cwd: ROOT,
    env: Object.assign({}, process.env, { POLICY: 'competent', SEEDS: String(SEED), DAYCAP: '45' }),
    stdio: 'pipe',
    timeout: 600000,
  });
  return JSON.parse(fs.readFileSync(jsonFp, 'utf8'));
}

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

try {
  console.log('run 1 (seed 99, DAYCAP=45)...');
  const a = runOnce();
  const ar = a.armor;
  check('armor block present', !!ar);
  check('absorbs is array', ar && Array.isArray(ar.absorbs), JSON.stringify(ar && ar.absorbs && ar.absorbs.length));
  check('tierLog non-empty (tier-ups fire)', ar && ar.tierLog && ar.tierLog.length >= 1, JSON.stringify(ar && ar.tierLog));
  check('snaps non-empty (census fires)', ar && ar.snaps && ar.snaps.length >= 1);
  check('readiness non-empty', ar && ar.readiness && ar.readiness.length >= 1);
  check('raidLog present', ar && Array.isArray(ar.raids));
  check('census has havenTier', ar && ar.snaps && ar.snaps.every(s => typeof s.havenTier === 'number'), JSON.stringify(ar && ar.snaps && ar.snaps.map(s => s.havenTier)));
  const snap1 = JSON.stringify({ absorbs: ar.absorbs, tierLog: ar.tierLog, raids: ar.raids, snaps: ar.snaps, readiness: ar.readiness });
  console.log('run 2 (determinism)...');
  const b = runOnce();
  const br = b.armor;
  const snap2 = JSON.stringify({ absorbs: br.absorbs, tierLog: br.tierLog, raids: br.raids, snaps: br.snaps, readiness: br.readiness });
  check('armor fields byte-identical across runs', snap1 === snap2,
    snap1 === snap2 ? '' : `len ${snap1.length} vs ${snap2.length}`);
} finally {
  cleanup();
}

if (failures) { console.log(`\n${failures} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
