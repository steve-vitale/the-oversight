// test-dmgshape-rerun-b.js — measurement proof test, arm sim-dmgshape-rerun-b
// (the damage-per-launch re-measurement, finding #2605).
// WHAT IT PROVES (the measurement, not just the instrument):
//   §A ANALYZER SELFTEST: the analyzer's own --selftest (28 checks):
//     first-fight selection fixtures (any-origin, earliest-day,
//     21-day window, target-type match, fought filter, same-day
//     file-order tiebreak, one fight shared by two launches,
//     no-fight-in-window), classification fixtures (landed-strike
//     rule vs the strict reading, 0-damage fight unclassified),
//     judge fixtures (GO shape, both pool legs, classification,
//     instrument, reconciliation, NO-GAP, UNEXPLAINED-GAP), and
//     the driver smoke (one 30d seed on the designated band,
//     exit 0, 0 instrument errors, flags self-describing, port
//     present, arm label dmgshape-rerun-b).
//   §B CORPUS-REPRODUCTION CHECK: the analyzer run over the FROZEN
//     partysurvive-rerun-b corpus (same band, same substrate
//     flags, older policy) reproduces the first-fight population
//     the prereg's pool floor is priced against: 9 launches, 6
//     first-fights, 5 fled, 0 killed, 1 died, 4 distinct fights,
//     classified 5/6 (the d128 0-damage eulogy fight is the one
//     unclassified row). This is a reproduction of the PRIOR
//     corpus through the new instrument — not a judged sim.
// Usage: node scripts/test-dmgshape-rerun-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(function sectionA() {
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'), '--selftest'],
    { cwd: REPO, encoding: 'utf8', timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/analyze-dmgshape-rerun-b selftest: (\d+) passed, (\d+) failed/);
  check('§A analyzer selftest exits 0 with 28 passed, 0 failed',
    r.status === 0 && !!m && m[1] === '28' && m[2] === '0', out.slice(-300));
})();

(function sectionB() {
  const dir = path.join(REPO, 'evidence', '2026-11-19', 'perseed-partysurvive-rerun-b');
  if (!fs.existsSync(dir)) { console.log('SKIP §B: partysurvive-rerun-b corpus not present'); return; }
  const a = A.analyzeDir(dir);
  check('§B frozen partysurvive-rerun-b corpus: 9 launches, 6 first-fights, 5 fled, 0 killed, 1 died',
    a.launches === 9 && a.firstFights === 6 && a.fled === 5 && a.killed === 0 && a.died === 1,
    { launches: a.launches, firstFights: a.firstFights, fled: a.fled, killed: a.killed, died: a.died });
  check('§B three reunion launches share one first fight: distinct fights 4, not 6',
    a.distinctFights === 4, a.distinctFights);
  check('§B classified 5/6 = 0.833 (the d128 0-damage eulogy fight is the one unclassified row)',
    a.classified === 5 && Math.abs(a.classifiedShare - 5 / 6) < 1e-9,
    { classified: a.classified, share: a.classifiedShare });
  const d94 = a.rows.filter(function (r) { return r.fight && r.fight.day === 94 && r.fight.mid === 'reunion'; });
  check('§B d94 reunion fight serves three launches (world-tick, vFlee, 95 dealt in 3 rounds)',
    d94.length === 3 && d94.every(function (r) { return r.fight.origin === 'world-tick' && r.fight.outcome === 'vFlee' && r.fight.mDealt === 95 && r.fight.rounds === 3; }),
    d94.map(function (r) { return { launchDay: r.launch.day, origin: r.fight.origin, dealt: r.fight.mDealt }; }));
  const d128 = a.rows.filter(function (r) { return r.fight && r.fight.day === 128 && r.fight.mid === 'eulogy'; })[0];
  check('§B d128 eulogy fight is the unclassified row (aid origin, 1 round, 0 dealt, pMean null)',
    !!d128 && d128.classified === false && d128.fight.origin === 'aid' && d128.fight.mDealt === 0 && d128.dec.pMean == null,
    d128 && { origin: d128.fight.origin, dealt: d128.fight.mDealt, pMean: d128.dec.pMean });
  check('§B first-fights by origin: world-tick 5, aid 1 (no expedition first-fight on the prior corpus)',
    (a.byOrigin['world-tick'] || 0) === 5 && (a.byOrigin.aid || 0) === 1 && (a.byOrigin.expedition || 0) === 0,
    a.byOrigin);
  check('§B instrument clean on the prior corpus (0 errors, 8 files)',
    a.errors === 0 && a.files === 8, { errors: a.errors, files: a.files });
})();

console.log('test-dmgshape-rerun-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
