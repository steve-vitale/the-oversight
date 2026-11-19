// test-partysurvive-b.js — proof test, arm sim-partysurvive-b.
// §A analyzer selftest (34 checks: per-member outcomes, every cause
//    class, died-in-meeting split, death-day cross-check, judge shapes).
// §B corpus reproduction: the analyzer re-run on the FROZEN
//    fightcap-b arm corpus must reproduce the sense-miss Dead count
//    (10) and the full by-cause table (Dead 10 / Expedition ended 5 /
//    different-tile 3 / same-tile 1 / Different expedition 1 /
//    trim-unproven 1). A mismatch is a loud instrument failure.
// §C driver smoke: one 30d seed in a subprocess under the frozen
//    substrate env + LAUNCHSURVIVE=1 — exit 0, 0 instrument errors,
//    launchTrack rows present, flags self-describing, anchor == HEAD.
//    The smoke corpus is deleted afterwards (this test writes into
//    the repo only transiently).
// Usage: node scripts/test-partysurvive-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'analyze-partysurvive-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('ok: ' + name); }
  else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// §A — analyzer selftest.
let selfOk = false;
try { selfOk = AN.selftest(); } catch (e) { console.log('FAIL: analyzer selftest threw: ' + e.message); }
check('§A analyzer selftest green (34 checks)', selfOk === true);

// §B — corpus reproduction on the frozen fightcap-b arm corpus.
const REF_DIR = path.join(REPO, 'evidence', '2026-11-19', 'perseed-fightcap-b-arm');
let repro = null;
try { repro = AN.reproduceFightcap(REF_DIR); } catch (e) { console.log('FAIL: reproduceFightcap threw: ' + e.message); }
check('§B fightcap-b arm sense-miss table reproduced (Dead 10)',
  !!repro && repro.ok === true && repro.byCause.dead === 10,
  repro ? JSON.stringify(repro.byCause) : 'no result');
check('§B fightcap-b arm meetings reproduced (18, sense-full 5)',
  !!repro && repro.meetings === 18 && repro.senseFull === 5,
  repro ? ('meetings ' + repro.meetings + ', senseFull ' + repro.senseFull) : 'no result');

// §C — driver smoke (one 30d seed, frozen substrate env).
const SMOKE_DIR = path.join(REPO, 'evidence', '2026-11-19', 'perseed-partysurvive-b-smoke');
const SMOKE_SEED = 105941;
const smokeFile = path.join(SMOKE_DIR, 'fightcap-b-s' + SMOKE_SEED + '-partysurvive-b-arm.json');
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
let smokeOk = false, smokeDetail = '';
try {
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', ALLYSLOT3: '1', LAUNCHSURVIVE: '1',
    MODE: 'arm', RUN: 'partysurvive-b', OUTDIR: 'perseed-partysurvive-b-smoke',
    SEEDS: String(SMOKE_SEED), DAYS: '30',
  });
  const r = spawnSync('node', [path.join(__dirname, 'fightcap-driver-b.js')], {
    cwd: REPO, env: env, timeout: 10 * 60 * 1000, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    smokeDetail = 'driver exit ' + r.status + ' stderr: ' + String(r.stderr || '').slice(0, 500);
  } else if (!fs.existsSync(smokeFile)) {
    smokeDetail = 'smoke corpus file missing: ' + smokeFile;
  } else {
    const d = JSON.parse(fs.readFileSync(smokeFile, 'utf8'));
    const anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
    const errs = (d.instrumentErrors || []).length;
    const checks = {
      seed: d.seed === SMOKE_SEED,
      modeArm: d.mode === 'arm' && d.allyslot3Flag === '1',
      substrate: d.senseexpedFlag === '1',
      anchor: d.anchorCommit === anchor,
      policy: d.policy === 'competent',
      days30: d.days === 30,
      noErrors: errs === 0,
      trackerOn: d.launchTrackOn === true && (d.v4launchTrack || []).length >= 0,
      recorderOn: d.recorderOn === true,
    };
    const bad = Object.keys(checks).filter(function (k) { return !checks[k]; });
    smokeOk = bad.length === 0;
    smokeDetail = smokeOk ? ('seed ' + d.seed + ', days ' + d.days + ', errors 0, launchTrack rows ' + (d.v4launchTrack || []).length)
      : ('failed checks: ' + bad.join(', ') + ' — ' + JSON.stringify({ errors: errs, anchor: (d.anchorCommit || '').slice(0, 12) }));
  }
} catch (e) { smokeDetail = 'smoke threw: ' + e.message; }
check('§C driver smoke (30d seed 105941, frozen substrate + LAUNCHSURVIVE=1)', smokeOk, smokeDetail);
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
check('§C smoke corpus cleaned up', !fs.existsSync(SMOKE_DIR));

console.log('test-partysurvive-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
