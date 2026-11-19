// test-fightcap-b.js — measurement proof test, arm sim-fightcap-b
// (the 4th member's damage share + kill share on quad-fight meetings,
// findings #2559 family / #2567).
//
// WHAT IT PROVES (the measurement, not just the slot):
//   §A REGRESSION (synthetic): the d133 Reunion row (finding #2564 —
//     launch target Herald, meeting monster Reunion) fields 1/1 under
//     the loose join AND shares 23/239 = 0.096 on that fight.
//   §B REPRODUCTION (frozen corpora): the analyzer run over the
//     sim-allyslot3-rerun-b corpora (evidence/2026-11-18/
//     perseed-allyslot3-rerun-b-{ctl,arm}) reproduces the published
//     rerun numbers exactly — field-4 4/6 = 0.67, sense 6/9, fourth
//     share 98/1206 = 0.081 over 4 fielded fights, kill share 0/9
//     arm, launches 22 ctl / 24 arm. If the instrument drifts, this
//     fails first.
//   §C DRIVER SMOKE (subprocess): the fightcap driver runs one
//     control seed (30d) cleanly under the SENSEEXPED substrate and
//     writes a self-describing corpus file (senseexpedPresent true,
//     leverPresent true, allyslot3Flag null, senseexpedFlag '1',
//     0 instrument errors).
// Usage: node scripts/test-fightcap-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-fightcap-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(function sectionA() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fcb-d133-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 's104437.json'), JSON.stringify({
    seed: 104437, endReason: 'village-lost', deaths: [],
    v4departs: [{ day: 130, vid: 'app_mgpsphub92', result: 'launch', targetWave: 4, target: 'herald',
      party: ['ruby_callaghan', 'gen_ph37qf5', 'gen_353ni1r'], partySize: 4 }],
    v4encounters: [
      { day: 133, vid: 'ruby_callaghan', mid: 'reunion', wave: 4, outcome: 'vFlee', rounds: 7, mDealt: 239, mHpStart: 1322, origin: 'expedition',
        allyVids: ['app_mgpsphub92', 'gen_ph37qf5', 'gen_353ni1r'], allyVid: 'app_mgpsphub92', ally2Vid: 'gen_ph37qf5', ally3Vid: 'gen_353ni1r', ally3Dealt: 23 },
    ],
  }));
  const t = A.field4Table(dir);
  check('§A d133 Reunion row fields 1/1 under the loose join (finding #2564)',
    t.meetings === 1 && t.denom === 1 && t.numer === 1 && t.rate === 1, t);
  const fsA = A.fourthShare(dir);
  check('§A d133 fourth share is 23/239 = 0.096 on that fight',
    fsA.n === 1 && Math.abs(fsA.share - 23 / 239) < 1e-9, fsA);
  const qk = A.quadKills(dir);
  check('§A d133 meeting is a joined quad meeting with 0 kills (vFlee)',
    qk.meetings === 1 && qk.kills === 0 && qk.killShare === 0, qk);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
})();

(function sectionB() {
  const ctlDir = path.join(REPO, 'evidence', '2026-11-18', 'perseed-allyslot3-rerun-b-ctl');
  const armDir = path.join(REPO, 'evidence', '2026-11-18', 'perseed-allyslot3-rerun-b-arm');
  if (!fs.existsSync(ctlDir) || !fs.existsSync(armDir)) {
    console.log('SKIP §B: rerun corpora not present in this checkout');
    return;
  }
  const ctl = A.summarizeLeg(ctlDir);
  const arm = A.summarizeLeg(armDir);
  check('§B rerun corpora: launches 22 ctl / 24 arm (published)',
    ctl.launches === 22 && arm.launches === 24, { ctl: ctl.launches, arm: arm.launches });
  const armF4 = A.field4Table(armDir);
  check('§B rerun corpora: field-4 4/6 = 0.67, sense 6/9 (finding #2570 sensitivity)',
    armF4.numer === 4 && armF4.denom === 6 && armF4.senseN === 6 && armF4.senseDen === 9, armF4);
  const armFourth = A.fourthShare(armDir);
  check('§B rerun corpora: fourth share 98/1206 = 0.081 over 4 fielded fights',
    armFourth.n === 4 && armFourth.ally3DealtTotal === 98 && armFourth.mDealtTotal === 1206 &&
    Math.abs(armFourth.share - 98 / 1206) < 1e-9, armFourth);
  const armQK = A.quadKills(armDir);
  check('§B rerun corpora: kill share 0/9 arm, 0 talk-downs',
    armQK.meetings === 9 && armQK.kills === 0 && armQK.killShare === 0 && armQK.talkdowns === 0, armQK);
  const ctlQK = A.quadKills(ctlDir);
  check('§B rerun corpora: ctl 5 joined quad meetings, 0 kills',
    ctlQK.meetings === 5 && ctlQK.kills === 0, ctlQK);
})();

(function sectionC() {
  const seed = 104730;
  const outDir = path.join(REPO, 'evidence', '2026-11-19', 'perseed-fightcap-b-smoke-ctl');
  const file = path.join(outDir, 'fightcap-b-s' + seed + '-fightcap-b-smoke-ctl.json');
  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    MODE: 'ctl', DAYS: '30', SEEDS: String(seed), RUN: 'fightcap-b-smoke',
    OUTDIR: 'perseed-fightcap-b-smoke-ctl',
  });
  delete env.ALLYSLOT3;
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'fightcap-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§C driver smoke: exit 0 on one 30d control seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let d = null;
  try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
  check('§C driver smoke: corpus file written', !!d, file);
  if (d) {
    check('§C driver smoke: flags self-describe (senseexpedPresent, leverPresent, allyslot3Flag null, senseexpedFlag 1)',
      d.senseexpedPresent === true && d.leverPresent === true && d.allyslot3Flag == null && d.senseexpedFlag === '1',
      { senseexpedPresent: d.senseexpedPresent, leverPresent: d.leverPresent, allyslot3Flag: d.allyslot3Flag, senseexpedFlag: d.senseexpedFlag });
    check('§C driver smoke: 0 instrument errors',
      (d.instrumentErrors || []).length === 0, d.instrumentErrors);
    check('§C driver smoke: anchor is this tip (eccc08af2)',
      String(d.anchorCommit || '').indexOf('eccc08af2') === 0, d.anchorCommit);
  }
  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
})();

console.log('test-fightcap-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
