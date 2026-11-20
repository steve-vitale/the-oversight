// test-dmgshape-b.js — measurement proof test, arm sim-dmgshape-b (Loop B 0530Z run)
// (the damage-per-launch re-measurement, finding #2605, designated band
// 106181-106188).
// WHAT IT PROVES (the measurement, not just the instrument):
//   §A ANALYZER SELFTEST: the analyzer's own --selftest (43 checks):
//     first-fight selection fixtures (any-origin, earliest-day,
//     21-day window, target-type match, fought filter, same-day
//     file-order tiebreak, one fight shared by two launches,
//     no-fight-in-window), classification fixtures (landed-strike
//     rule vs the strict reading, 0-damage fight unclassified),
//     judge fixtures (GO shape, both pool legs, classification,
//     instrument, reconciliation, NO-GAP, UNEXPLAINED-GAP), the
//     retained decomposition fixtures (synthetic 6-round fight,
//     Rage-fire parse + ability excess, aggregate identity,
//     fightcap-arm reproduction), and the driver smoke (one 30d
//     seed on the designated band, exit 0, 0 instrument errors,
//     flags self-describing, port present, arm label dmgshape-b).
//   §B CORPUS-REPRODUCTION CHECK: the analyzer run over the FROZEN
//     dmgsurvey designated-band corpus (same band, same policy,
//     slot env-only there) reproduces the first-fight population
//     the prereg's pool floor is priced against: 16 launches, 9
//     first-fights, 6 fled, 0 killed, 3 died, 6 distinct fights,
//     by origin expedition 3 / world-tick 5 / aid 1, same-day 2.
//     COUNTS ONLY: the survey corpora carry no roundsDetail, so
//     no decomposition value is asserted here. This is a
//     reproduction of the PRIOR corpus through the new instrument
//     — not a judged sim.
// Usage: node scripts/test-dmgshape-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-dmgshape-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(function sectionA() {
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-dmgshape-b.js'), '--selftest'],
    { cwd: REPO, encoding: 'utf8', timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/analyze-dmgshape-b selftest: (\d+) passed, (\d+) failed/);
  check('§A analyzer selftest exits 0 with 43 passed, 0 failed',
    r.status === 0 && !!m && m[1] === '43' && m[2] === '0', out.slice(-300));
})();

(function sectionB() {
  const dir = path.join(REPO, 'evidence', '2026-11-20', 'perseed-dmgsurvey-b-106181-106188');
  if (!fs.existsSync(dir)) { console.log('SKIP §B: dmgsurvey designated-band corpus not present'); return; }
  const a = A.analyzeDir(dir);
  check('§B frozen dmgsurvey designated-band corpus: 16 launches, 9 first-fights, 6 fled, 0 killed, 3 died',
    a.launches === 16 && a.firstFights === 9 && a.fled === 6 && a.killed === 0 && a.died === 3,
    { launches: a.launches, firstFights: a.firstFights, fled: a.fled, killed: a.killed, died: a.died });
  check('§B three launches share fights: distinct fights 6, not 9',
    a.distinctFights === 6, a.distinctFights);
  check('§B first-fights by origin: expedition 3, world-tick 5, aid 1',
    (a.byOrigin.expedition || 0) === 3 && (a.byOrigin['world-tick'] || 0) === 5 && (a.byOrigin.aid || 0) === 1,
    a.byOrigin);
  check('§B same-day first-fights 2', a.sameDayFirstFights === 2, a.sameDayFirstFights);
  check('§B no-fight launches 7', a.noFight === 7, a.noFight);
  const s188 = a.perSeed.filter(function (p) { return p.seed === 106188; })[0];
  check('§B seed 106188: 7 launches, 2 first-fights, 5 no-fight (the audit churn)',
    !!s188 && s188.launches === 7 && s188.firstFights === 2 && s188.noFight === 5, s188);
  const eul = a.rows.filter(function (r) { return r.fight && r.seed === 106182 && r.fight.day === 114 && r.fight.mid === 'eulogy'; })[0];
  check('§B seed 106182 d114 Eulogy first-fight: 5 rounds, 329 dealt, fled (Hassan, the survey sense-test fight)',
    !!eul && eul.fight.rounds === 5 && eul.fight.mDealt === 329 && eul.fight.outcome === 'vFlee',
    eul && { day: eul.fight.day, rounds: eul.fight.rounds, dealt: eul.fight.mDealt, outcome: eul.fight.outcome });
  check('§B instrument clean on the prior corpus (0 errors, 8 files)',
    a.errors === 0 && a.files === 8, { errors: a.errors, files: a.files });
})();

console.log('test-dmgshape-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
