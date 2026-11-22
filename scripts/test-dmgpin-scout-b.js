// test-dmgpin-scout-b.js — proof test, arm sim-dmgpin-report-b
// (findings #2619/#2636: DMGPIN re-judged on a band PRE-SCREENED for
// pin formation by a control-only scout).
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §0 the frozen prereg exists and names the scout bands
//     (106809–106832) + the designation rule (a seed DESIGNATES
//     iff its control corpus has >= 1 fought door fight) + the
//     SCOUT-GO bar.
//   §1 the ANCHOR assertion: the anchorCommit stamped on a
//     driver-written smoke corpus equals the frozen base, read from
//     the corpus file and from the prereg — never from live HEAD
//     (the poolfirstfail lesson).
//   §2 the designation rule on synthetic corpora: a fought door
//     designates; an unfought door, an unpinned expedition fight,
//     a non-expedition pinned fight, a wave-3 door-shaped fight,
//     and an empty corpus do not.
//   §3 a live 30d CONTROL-ONLY shape run (PINQUAD=1, DMGPIN unset)
//     on a screening seed: exit 0, 0 instrument errors, pin fields
//     present (pinquadFlag '1', dmgpinFlag null, slotPresent true).
//     The screening seed is 106251 (sense3 band, already used —
//     never a fresh scout seed, so the shape run cannot touch the
//     scout bands). The smoke corpus is deleted after the read.
// Usage: node scripts/test-dmgpin-scout-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-pinquaddoor-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// The frozen designation rule (prereg §"Design", Stage 1): a seed
// DESIGNATES iff its control corpus has >= 1 fought door fight.
// A door fight is a wave-4+ encounter row with origin 'expedition'
// AND allyFromStart true AND pinned true; fought means rounds >= 1.
function designates(data) {
  return (data.v4encounters || []).some(function (r) {
    return analyzer.isDoorFight(r) && (r.rounds | 0) >= 1;
  });
}

(function section0() {
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-21', 'sim-dmgpin-report-b-prereg.md'), 'utf8');
  check('§0 frozen prereg names the scout bands 106809–106832',
    /FROZEN/.test(prereg) && /106809–106832/.test(prereg));
  check('§0 frozen prereg states the designation rule (>= 1 fought door fight)',
    /DESIGNATES/.test(prereg) && /fought door fight/.test(prereg));
  check('§0 frozen prereg states the SCOUT-GO bar (>= 1 scouted seed designates)',
    /SCOUT-GO iff/.test(prereg));
})();

(function section2() {
  const doorBase = { day: 120, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', outcome: 'vKill',
    vKill: true, allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: 'c3',
    allyFromStart: true, pinned: true, pinnedAllies: ['c1', 'c2', 'c3'], rounds: 5, mDealt: 900 };
  check('§2 a fought door designates',
    designates({ v4encounters: [doorBase] }) === true);
  check('§2 an unfought door (rounds 0) does not designate',
    designates({ v4encounters: [Object.assign({}, doorBase, { rounds: 0, outcome: 'vFlee', mDealt: 0 })] }) === false);
  check('§2 an unpinned expedition fight does not designate',
    designates({ v4encounters: [Object.assign({}, doorBase, { pinned: false })] }) === false);
  check('§2 a non-expedition pinned fight does not designate',
    designates({ v4encounters: [Object.assign({}, doorBase, { origin: 'wild' })] }) === false);
  check('§2 a wave-3 door-shaped fight does not designate',
    designates({ v4encounters: [Object.assign({}, doorBase, { wave: 3 })] }) === false);
  check('§2 an empty corpus does not designate',
    designates({ v4encounters: [] }) === false);
  check('§2 a fought door among other rows still designates',
    designates({ v4encounters: [Object.assign({}, doorBase, { pinned: false }), doorBase] }) === true);
})();

// ---------- §1 + §3 LIVE SMOKE (control-only, direct) ----------
(function section13() {
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-21', 'sim-dmgpin-report-b-prereg.md'), 'utf8');
  const m = /Frozen base:\s*`?([0-9a-f]{40})/.exec(prereg);
  check('§1 frozen base is parseable from the prereg (40-hex, never live HEAD)',
    !!m, m && m[1]);
  const expectedAnchor = m ? m[1] : null;

  const smokeDir = 'perseed-dmgpin-report-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-21', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-21', CORPUS_PREFIX: 'dmgpin-report-b',
    SEEDS: '106251', RUN: 'dmgpin-report-b-smoke', OUTDIR: smokeDir });
  delete env.DMGPIN;
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§3 driver smoke (control-only, 30d, seed 106251): exit 0', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'dmgpin-report-b-s106251-dmgpin-report-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§1 anchor stamped on the smoke corpus equals the frozen base (read from corpus + prereg)',
    !!dd && !!expectedAnchor && dd.anchorCommit === expectedAnchor,
    dd && { anchorCommit: dd.anchorCommit, expected: expectedAnchor });
  check('§3 control smoke: pin fields present (pinquadFlag 1, dmgpinFlag null, slotPresent true)',
    !!dd && dd.pinquadFlag === '1' && (dd.dmgpinFlag === null || dd.dmgpinFlag === undefined) && dd.slotPresent === true,
    dd && { pinquadFlag: dd.pinquadFlag, dmgpinFlag: dd.dmgpinFlag, slotPresent: dd.slotPresent });
  check('§3 control smoke: policySha is the frozen policy (1884c8852d38)',
    !!dd && typeof dd.policySha === 'string' && dd.policySha.indexOf('1884c8852d38') === 0,
    dd && { policySha: dd.policySha });
  if (dd) {
    check('§3 control smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
})();

console.log('test-dmgpin-scout-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
