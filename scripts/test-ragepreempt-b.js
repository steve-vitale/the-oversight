// test-ragepreempt-b.js — proof test for the sim-ragepreempt-b
// instrument (finding #2584). Proves the effect, not the plumbing:
// the analyzer must classify the REAL corpus rows correctly — the
// Heinrich d53 pre-emption and the free strikes that landed — and
// the ctl leg must show zero pre-emptions (Rage consumes the turn
// there). Runs the analyzer --selftest, then the analyzer on the
// frozen rage-setup-a corpora, and asserts the prereg's frozen test
// cases. Exits non-zero on any failure. No game code is loaded and
// no sims run: the corpora are frozen evidence.
// Usage: node scripts/test-ragepreempt-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-ragepreempt-b.js');
const CTL = path.join(ROOT, 'evidence', '2026-11-18', 'perseed-rage-setup-a-ctl');
const ARM = path.join(ROOT, 'evidence', '2026-11-18', 'perseed-rage-setup-a-arm');
const PRIOR = path.join(ROOT, 'evidence', '2026-11-18', 'rage-setup-a-analysis.json');
const OUT = path.join(ROOT, 'evidence', '2026-11-19', 'ragepreempt-b-analysis.json');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('ok: ' + name); }
  else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function run(cmd, args) {
  return cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
}

// 1. Analyzer selftest (synthetic rows for every taxonomy verb,
// strike landed / zero / absent, anomalies, later-round Rage).
let t = run('node', [ANALYZER, '--selftest']);
check('analyzer --selftest green', t.status === 0, (t.stdout || '') + (t.stderr || ''));

// 2. Analyzer on the frozen corpora (exit 0 iff DIAG-GO; the test
// asserts the content either way, so a non-GO verdict is a test
// failure only if the frozen bars actually fail — see §4).
t = run('node', [ANALYZER, '--ctl', CTL, '--arm', ARM, '--out', OUT, '--prior-analysis', PRIOR]);
check('analyzer wrote analysis JSON', fs.existsSync(OUT), 'no ' + OUT);
const a = JSON.parse(fs.readFileSync(OUT, 'utf8'));
check('analyzer exit matches its verdict', (t.status === 0) === (a.verdict === 'DIAG-GO'), 'exit ' + t.status + ' verdict ' + a.verdict);

function findRow(leg, seed, day, vid, mid) {
  const rows = a[leg].rows;
  for (const r of rows) {
    if (r.seed === seed && r.day === day && r.vid === vid && r.mid === mid) return r;
  }
  return null;
}

// 3. Frozen test cases (prereg §DIAG-GO criterion 3) — real corpus rows.
let r = findRow('arm', 106006, 53, 'gen_bs9o198', 'reunion');
check('Heinrich d53 pre-empted by peacemaker (failed Walk In)', !!r && r.status === 'preempted' && r.verb === 'peacemaker_failed' && r.harmful === true && r.rageRound === 1, JSON.stringify(r));
r = findRow('arm', 106004, 95, 'visjoin_90', 'influencer');
check('Sergio d95 free strike landed', !!r && r.status === 'not_preempted' && r.strikeDmg > 0, JSON.stringify(r));
r = findRow('arm', 106005, 139, 'ruby_callaghan', 'algorithm');
check('Ruby d139 Rage round unobservable (log cap; see prereg Correction 1)', !!r && r.status === 'rage_round_unobserved', JSON.stringify(r));
r = findRow('arm', 106008, 47, 'gen_arcfvpg', 'algorithm');
check('gen_arcfvpg d47 free strike landed', !!r && r.status === 'not_preempted' && r.strikeDmg > 0, JSON.stringify(r));
r = findRow('arm', 106001, 132, 'app_mgpspkc7680', 'eater');
check('Kavira d132 pre-empted by field medicine', !!r && r.status === 'preempted' && r.verb === 'field_medicine' && r.harmful === true, JSON.stringify(r));

// 4. Frozen bars (prereg): pool floor, classification complete,
// ctl negative control, instrument errors.
check('pool floor: arm observable >= 8', a.arm.summary.observable >= 8, 'observable ' + a.arm.summary.observable);
check('classification complete: 0 unclassified, 0 anomalies', a.arm.summary.unclassified === 0 && a.arm.summary.anomalies === 0, JSON.stringify(a.arm.summary));
check('ctl negative control: 0 pre-empted, every observable row consumed, 0 unclassified, 0 anomalies', a.ctl.summary.preempted === 0 && a.ctl.summary.consumed === a.ctl.summary.observable && a.ctl.summary.unclassified === 0 && a.ctl.summary.anomalies === 0, JSON.stringify(a.ctl.summary));
check('instrument errors 0 both legs', a.bars.filter(function (b) { return b.id === 'instrument-errors'; })[0].pass, JSON.stringify(a.bars));
check('verdict DIAG-GO', a.verdict === 'DIAG-GO', a.verdict);
check('judged-population cut matched 8/8 arm rows', !!a.arm.judgedCut && a.arm.judgedCut.matched === 8 && a.arm.judgedCut.expected === 8, JSON.stringify(a.arm.judgedCut));
check('wall numbers recomputed (national 0/8, wave4 8/8 both)', a.arm.wall.national === 0 && a.ctl.wall.national === 0 && a.arm.wall.wave4 === 8 && a.ctl.wall.wave4 === 8 && a.arm.wall.wins === 0 && a.ctl.wall.wins === 0, JSON.stringify({ arm: a.arm.wall, ctl: a.ctl.wall }));

console.log('test-ragepreempt-b: ' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
