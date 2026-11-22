// test-pinquaddoor-wide-b.js — proof test, arm sim-pinquaddoor-wide-b
// (finding #2619: PIN THE QUAD + OPEN THE DOOR, measurement re-run on
// the wider band 106501–106516; frozen prereg
// evidence/2026-11-20/sim-pinquaddoor-wide-b-prereg.md).
//
// WHAT IT PROVES (the wide instrument, M2w — the lever itself is
// unchanged from the held tip and is proven by test-pinquaddoor-b.js
// 35/35, re-run on this tip):
//   §0 the wide instrument code is present: the driver writes the
//     all-waves pin census (`pinFights`) and the gate pin fields
//     (`pinned` + `pinnedAllies` on v4gates rows); the analyzer
//     exports classifyPinFight + gateCounts.
//   §1 the analyzer selftest passes (incl. the §E wide-secondary
//     fixtures S1–S4 and the §D driver smoke).
//   §2 the driver smoke on the WIDE band (seed 106501, armed, 30d)
//     writes a corpus file under the wide name, exit 0, 0 instrument
//     errors, with the `pinFights` array and gate pin fields — and
//     the analyzer reads that smoke corpus and prints the S1–S4 lines.
// Usage: node scripts/test-pinquaddoor-wide-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-pinquaddoor-b'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js'), 'utf8');

(function section0() {
  check('§0 driver writes the all-waves pin census (pinFights array on the corpus file)',
    /const pinFights = \[\];/.test(driverSrc) && /pinFights: pinFights,/.test(driverSrc));
  check('§0 driver records gate pin fields (pinned + pinnedAllies on v4gates rows)',
    /pinned: gatePinnedFlag, pinnedAllies: gatePinned,/.test(driverSrc));
  check('§0 driver records pinned fights at any wave (pinWatch, not wave-gated)',
    /const pinWatch = !!\(mdef && mdef\.id && pinAtFight && pinAtFight\.length\);/.test(driverSrc));
  check('§0 driver defaults are the wide leg (RUN pinquaddoor-wide-b, OUTDIR perseed-pinquaddoor-wide-b-control)',
    /RUN = process\.env\.RUN \|\| 'pinquaddoor-wide-b'/.test(driverSrc) &&
    /OUTDIR = process\.env\.OUTDIR \|\| 'perseed-pinquaddoor-wide-b-control'/.test(driverSrc));
  check('§0 analyzer exports the wide classifiers (classifyPinFight + gateCounts)',
    typeof A.classifyPinFight === 'function' && typeof A.gateCounts === 'function');
  check('§0 wide pin row classifies by outcome (wave-2 mFlee → monster-flee, wave-3 evade → evade)',
    (function () {
      const m = A.classifyPinFight(1, { day: 90, vid: 'h', mid: 'moderator', wave: 2, origin: 'expedition', rounds: 3, outcome: 'mFlee', vKill: false, ally3Vid: 'c3', ally3Dealt: 12, allyFromStart: true, pinnedAllies: ['c1', 'c2', 'c3'] });
      const e = A.classifyPinFight(1, { day: 90, vid: 'h', mid: 'spool', wave: 3, origin: 'expedition', rounds: 0, outcome: 'evade', vKill: false, ally3Vid: null, ally3Dealt: null, allyFromStart: false, pinnedAllies: ['c1', 'c2', 'c3'] });
      return m.endCause === 'monster-flee' && e.endCause === 'evade' && m.ally3Dealt === 12;
    })(), null);
  check('§0 gateCounts splits seek/avoid/other (legacy rows without pinned read as unknown downstream)',
    (function () {
      const c = A.gateCounts([{ result: 'seek' }, { result: 'avoid' }, { result: 'other' }, { result: 'seek' }]);
      return c.total === 4 && c.seek === 2 && c.avoid === 1 && c.other === 1;
    })(), null);
})();

(function section1() {
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-pinquaddoor-b.js'), '--selftest'],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 900000 });
  const tail = (r.stdout || '').split('\n').filter(function (l) { return /selftest:/.test(l); }).join(' / ');
  check('§1 analyzer selftest passes (incl. §E wide-secondary fixtures S1–S4)',
    r.status === 0 && /0 failed/.test(r.stdout || ''), tail || (r.stderr || '').slice(0, 300));
})();

(function section2() {
  const smokeDir = 'perseed-pinquaddoor-wide-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1',
    MODE: 'pinquaddoor', DAYS: '30',
    SEEDS: '106501', RUN: 'pinquaddoor-wide-b-smoke', OUTDIR: smokeDir });
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§2 wide driver smoke (armed, seed 106501, 30d): exit 0', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'pinquaddoor-wide-b-s106501-pinquaddoor-wide-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§2 wide driver smoke: corpus file written under the wide name (pinquaddoor-wide-b-s106501-...)',
    !!dd, null);
  if (dd) {
    check('§2 wide driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§2 wide driver smoke: pinFights array present (S4 census, possibly empty on 30d)',
      Array.isArray(dd.pinFights), typeof dd.pinFights);
    check('§2 wide driver smoke: every gate row carries pinned + pinnedAllies (S3 census)',
      (dd.v4gates || []).every(function (g) { return ('pinned' in g) && Array.isArray(g.pinnedAllies); }),
      (dd.v4gates || []).length);
    check('§2 wide driver smoke: every pinFights row carries the full field set',
      (dd.pinFights || []).every(function (x) { return ('day' in x) && ('vid' in x) && ('mid' in x) && ('wave' in x) && ('origin' in x) && ('outcome' in x) && ('rounds' in x) && ('vKill' in x) && ('ally3Vid' in x) && ('ally3Dealt' in x) && ('allyFromStart' in x) && Array.isArray(x.pinnedAllies); }),
      (dd.pinFights || []).length);
    check('§2 wide driver smoke: seed + flags self-describe (seed 106501, pinquadFlag 1, arm pinquaddoor-b)',
      dd.seed === 106501 && dd.pinquadFlag === '1' && dd.arm === 'pinquaddoor-b',
      { seed: dd.seed, pinquadFlag: dd.pinquadFlag, arm: dd.arm });
  }
  // The analyzer reads the smoke corpus and prints the S-lines.
  const ra = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-pinquaddoor-b.js'), smokePath],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 300000 });
  check('§2 analyzer reads the wide smoke corpus (exit 0, S1–S4 lines printed)',
    ra.status === 0 && /S1 pin-subset B1/.test(ra.stdout || '') && /S2 pinned drive-offs/.test(ra.stdout || '') &&
    /S3 SEEK by pin/.test(ra.stdout || '') && /S4 pinned fights, all waves/.test(ra.stdout || ''),
    (ra.stdout || '').split('\n').filter(function (l) { return / S[1-4] /.test(l); }).join(' / ') || (ra.stderr || '').slice(0, 300));
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
})();

console.log('test-pinquaddoor-wide-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
