// test-fightcap-recheck-a.js — proof test, arm sim-fightcap-recheck-a
// (DIAG RECHECK of the wave-4 fight, findings #2538/#2544).
//
// WHAT IT PROVES (the instrument, not just the port):
//   §A GUARDS (subprocess, fast exits): the ported driver's MODE
//     guard keys on SENSEEXPED, not ALLYSLOT3 — arm without
//     SENSEEXPED stops, ctl with SENSEEXPED stops, ALLYSLOT3=1
//     stops on EITHER leg, a missing substrate flag stops, a bad
//     MODE stops. A leg/flag mismatch is a loud stop, never a
//     silent mislabel.
//   §B REGRESSION (frozen corpora): the UNCHANGED analyzer
//     (analyze-fightcap-a.js) run over the Nov 18 frozen corpora
//     (evidence/2026-11-18/perseed-fightcap-a-{ctl,arm}) reproduces
//     the published fightcap-a numbers exactly — arm pair-inclusive
//     22 meetings / 4 wins / 2 kills / 18 losses (vDie 3, vFlee 15),
//     ctl pair-inclusive 4 meetings / 0 wins / 0 kills, trio+ arm
//     3 meetings / 0 wins, verdict DIAG-GO kind THIN-POOL. If the
//     instrument drifts, this fails first.
//   §C DRIVER SMOKE (subprocess): the ported driver runs one
//     control seed (30d) and one arm seed (1d) cleanly under the
//     recheck substrate and writes self-describing corpus files
//     (senseexpedPresent true, allyslot3Flag null, senseexpedFlag
//     null on ctl / '1' on arm, 0 instrument errors, anchor a
//     40-hex commit — recorded, NOT pinned to a commit: the
//     fightcap-b §C pin broke on rebase). Smoke corpora are deleted
//     by the test afterwards, so the worktree stays clean.
// Usage: node scripts/test-fightcap-recheck-a.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-fightcap-a.js'));
const DRIVER = path.join(REPO, 'scripts', 'fightcap-driver-recheck-a.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

function runDriver(envExtra, timeoutMs) {
  const env = Object.assign({}, process.env, {
    PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
  }, envExtra);
  return spawnSync(process.execPath, [DRIVER], { env: env, timeout: timeoutMs || 120000, maxBuffer: 64 * 1024 * 1024 });
}

(function sectionA() {
  let r = runDriver({ MODE: 'arm', SEEDS: '110101' });
  check('§A arm without SENSEEXPED stops (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: MODE=arm requires SENSEEXPED=1/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
  r = runDriver({ MODE: 'ctl', SENSEEXPED: '1', SEEDS: '110101' });
  check('§A ctl with SENSEEXPED stops (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: MODE=ctl requires SENSEEXPED unset/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
  r = runDriver({ MODE: 'arm', SENSEEXPED: '1', ALLYSLOT3: '1', SEEDS: '110101' });
  check('§A ALLYSLOT3=1 stops on the arm leg (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: ALLYSLOT3 must be unset/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
  r = runDriver({ MODE: 'ctl', ALLYSLOT3: '1', SEEDS: '110101' });
  check('§A ALLYSLOT3=1 stops on the ctl leg too (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: ALLYSLOT3 must be unset/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
  const envNoVre = Object.assign({}, process.env, {
    PARTYSIZE4: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1', MODE: 'ctl', SEEDS: '110101',
  });
  delete envNoVre.VETREENGAGE;
  r = spawnSync(process.execPath, [DRIVER], { env: envNoVre, timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
  check('§A missing VETREENGAGE stops (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: VETREENGAGE=1 required/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
  r = runDriver({ MODE: 'bogus', SEEDS: '110101' });
  check('§A bad MODE stops (exit 2, FIGHTCAP STOP)',
    r.status === 2 && /FIGHTCAP STOP: MODE must be ctl\|arm/.test(String(r.stderr || '')), { status: r.status, stderr: String(r.stderr || '').slice(0, 200) });
})();

(function sectionB() {
  const ctlDir = path.join(REPO, 'evidence', '2026-11-18', 'perseed-fightcap-a-ctl');
  const armDir = path.join(REPO, 'evidence', '2026-11-18', 'perseed-fightcap-a-arm');
  if (!fs.existsSync(ctlDir) || !fs.existsSync(armDir)) {
    console.log('SKIP §B: Nov 18 fightcap-a corpora not present in this checkout');
    return;
  }
  const ctlPair = A.legStats(ctlDir, { minPlanParty: 1 });
  const armPair = A.legStats(armDir, { minPlanParty: 1 });
  const ctl = A.legStats(ctlDir);
  const arm = A.legStats(armDir);
  check('§B Nov 18 corpora: arm pair-inclusive 22 meetings / 4 wins / 2 kills / 18 losses (vDie 3, vFlee 15)',
    armPair.meetings === 22 && armPair.wins === 4 && armPair.kills === 2 &&
    armPair.losses === 18 && armPair.vDie === 3 && armPair.vFlee === 15,
    { meetings: armPair.meetings, wins: armPair.wins, kills: armPair.kills, losses: armPair.losses, vDie: armPair.vDie, vFlee: armPair.vFlee });
  check('§B Nov 18 corpora: ctl pair-inclusive 4 meetings / 0 wins / 0 kills',
    ctlPair.meetings === 4 && ctlPair.wins === 0 && ctlPair.kills === 0,
    { meetings: ctlPair.meetings, wins: ctlPair.wins, kills: ctlPair.kills });
  check('§B Nov 18 corpora: trio+ arm 3 meetings / 0 wins / 0 kills',
    arm.meetings === 3 && arm.wins === 0 && arm.kills === 0,
    { meetings: arm.meetings, wins: arm.wins, kills: arm.kills });
  check('§B Nov 18 corpora: trio+ ctl 0 meetings',
    ctl.meetings === 0, { meetings: ctl.meetings });
  const j = A.judge(ctl, arm);
  check('§B Nov 18 corpora: judge verdict DIAG-GO kind THIN-POOL',
    j && j.verdict === 'DIAG-GO' && j.kind === 'THIN-POOL', j);
})();

(function sectionC() {
  const seed = 110101;
  const cases = [
    { mode: 'ctl', days: '30', outDir: 'perseed-fightcap-recheck-a-smoke-ctl', senseFlag: null },
    { mode: 'arm', days: '1', outDir: 'perseed-fightcap-recheck-a-smoke-arm', senseFlag: '1' },
  ];
  for (const c of cases) {
    const dir = path.join(REPO, 'evidence', '2026-11-24', c.outDir);
    const file = path.join(dir, 'fightcap-recheck-a-s' + seed + '-fightcap-recheck-a-smoke-' + c.mode + '.json');
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    const envExtra = { MODE: c.mode, DAYS: c.days, SEEDS: String(seed), RUN: 'fightcap-recheck-a-smoke', OUTDIR: c.outDir };
    if (c.mode === 'arm') envExtra.SENSEEXPED = '1';
    const r = runDriver(envExtra, 900000);
    check('§C driver smoke ' + c.mode + ': exit 0 on one ' + c.days + 'd seed',
      r.status === 0, { status: r.status, stderr: String(r.stderr || '').slice(0, 300) });
    let d = null;
    try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
    check('§C driver smoke ' + c.mode + ': corpus file written', !!d, file);
    if (d) {
      check('§C driver smoke ' + c.mode + ': flags self-describe (senseexpedPresent true, allyslot3Flag null, senseexpedFlag ' + JSON.stringify(c.senseFlag) + ')',
        d.senseexpedPresent === true && d.allyslot3Flag == null && d.senseexpedFlag === c.senseFlag,
        { senseexpedPresent: d.senseexpedPresent, allyslot3Flag: d.allyslot3Flag, senseexpedFlag: d.senseexpedFlag });
      check('§C driver smoke ' + c.mode + ': 0 instrument errors',
        Array.isArray(d.instrumentErrors) && d.instrumentErrors.length === 0, d.instrumentErrors);
      check('§C driver smoke ' + c.mode + ': anchor is a 40-hex commit (recorded, not pinned)',
        typeof d.anchorCommit === 'string' && /^[0-9a-f]{40}$/.test(d.anchorCommit), d.anchorCommit);
      check('§C driver smoke ' + c.mode + ': arm field is fightcap-recheck-a',
        d.arm === 'fightcap-recheck-a' && d.run === 'fightcap-recheck-a-smoke', { arm: d.arm, run: d.run });
    }
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('test-fightcap-recheck-a: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
