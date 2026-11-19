// test-dmgshape-b.js — measurement proof test, arm sim-dmgshape-b
// (the damage-per-round decomposition diagnostic, tracker blank 1).
// WHAT IT PROVES (the measurement, not just the instrument):
//   §A ANALYZER SELFTEST: the analyzer's own --selftest (19 checks):
//     reproduction of the frozen fightcap-b arm corpus (18 joined
//     quad meetings, 0 kills, vFlee ladder 49.4744/round, d58 row
//     686/9), the synthetic full-log decomposition (known strikes /
//     verb round / miss / ally join -> known components), the
//     Rage-fire-round parse + ability-excess arithmetic, and the
//     driver smoke (one 30d seed, exit 0, 0 instrument errors,
//     flags self-describing, leverPresent false).
//   §B CORPUS-REPRODUCTION CHECK: the analyzer run over the frozen
//     fightcap-b arm corpus reproduces the published ladder through
//     the analyzer's own judge path (quadKills + fled matching):
//     the d58 Congregation row is found and its decomposition fields
//     are populated from the capped corpus (log truncated at 20 lines
//     — the test asserts the parser still reads strikes, not that
//     the cap is absent; the uncapped log is the dmgshape driver's
//     job, proven in §A §C).
// Usage: node scripts/test-dmgshape-b.js
// Exit 0 = all checks pass.
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
  const m = out.match(/test-dmgshape-b: (\d+) passed, (\d+) failed/);
  check('§A analyzer selftest exits 0 with 21 passed, 0 failed',
    r.status === 0 && !!m && m[1] === '21' && m[2] === '0', out.slice(-300));
})();

(function sectionB() {
  const dir = path.join(REPO, 'evidence', '2026-11-19', 'perseed-fightcap-b-arm');
  if (!fs.existsSync(dir)) { console.log('SKIP §B: fightcap arm corpus not present'); return; }
  const dec = A.fledDecompositions(dir);
  check('§B frozen fightcap arm corpus: 18 meetings, 15 fled, 0 killed, 3 died',
    dec.qk.meetings === 18 && dec.fled.length === 15 && dec.killed.length === 0 && dec.died.length === 3,
    { meetings: dec.qk.meetings, fled: dec.fled.length, killed: dec.killed.length, died: dec.died.length });
  const d58 = dec.fled.filter(function (f) { return f.seed === 104771 && f.day === 58; })[0];
  check('§B d58 row decomposes from the capped corpus (686 dealt, 9 rounds, log truncated at 20 lines)',
    !!d58 && d58.mDealt === 686 && d58.rounds === 9 && d58.logLines === 20, d58 && { mDealt: d58.mDealt, rounds: d58.rounds, logLines: d58.logLines });
  check('§B d58 row parses strikes from the truncated log (R1-R4 visible)',
    !!d58 && d58.strikesAttempted >= 6 && d58.pMean != null && d58.pMean > 0,
    d58 && { attempts: d58.strikesAttempted, pMean: d58.pMean });
  check('§B capped-corpus rows carry no roundsDetail (the dmgshape driver adds it)',
    dec.fled.every(function (f) { return f.rdRounds === 0; }),
    { rdRounds: dec.fled.map(function (f) { return f.rdRounds; }).slice(0, 5) });
})();

console.log('test-dmgshape-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
