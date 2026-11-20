// test-deadtarget-diag-b.js — proof test, arm sim-deadtarget-diag-b.
// §A CODE ANSWER (read-only greps of src/js/win-plan.js — the
// departure-gate question, answered from the code before any sim):
//   (1) winPlanDepart reads no liveness / recency / sighting /
//       villageSlain input anywhere on its path;
//   (2) plan.target is never cleared anywhere in win-plan.js;
//   (3) stage 'standing' still launches (the post-kill re-launch
//       shape of finding #2617);
//   (4) winPlanNoteKill advances hunt/party to 'standing' without
//       touching the target or the node.
// §B ANALYZER SELFTEST (analyze-deadtarget-b.js --selftest logic).
// §C DRIVER SMOKE (subprocess): one 30d seed on the designated
// band, exit 0, 0 instrument errors, flags self-describing
// (leverPresent false — the ALLYSLOT3 slot is absent on the landed
// substrate; allyslot3Flag null; no launchTrackOn key), plus the
// ALLYSLOT3=1 guard refusing before any sim runs.
// Usage: node scripts/test-deadtarget-diag-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const os = require('os');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'analyze-deadtarget-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- §A CODE ANSWER ----
const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
function fnBody(src, startMarker, endMarker) {
  const i = src.indexOf(startMarker);
  if (i === -1) return null;
  const j = endMarker ? src.indexOf(endMarker, i + startMarker.length) : src.length;
  return src.slice(i, j === -1 ? src.length : j);
}
const departBody = fnBody(wpSrc, 'winPlanDepart(vid, hx, hy, playerAtHaven) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
check('§A winPlanDepart found', departBody != null && departBody.length > 1000, departBody ? departBody.length : null);
if (departBody) {
  check('§A winPlanDepart reads no villageSlain', departBody.indexOf('villageSlain') === -1, null);
  check('§A winPlanDepart reads no sighting', /sighting/i.test(departBody) === false, null);
  check('§A winPlanDepart reads no liveness / last-fight / recency input',
    /liveness|lastFight|lastSeen|recent/i.test(departBody) === false, null);
  check('§A winPlanDepart still launches from stage standing (post-kill re-launch shape)',
    departBody.indexOf("plan.stage === 'party' || plan.stage === 'hunt' || plan.stage === 'standing'") !== -1, null);
  check('§A launchParty copies the target onto companions without validating it',
    departBody.indexOf('cplan.target = plan.target') !== -1, null);
}
check('§A plan.target is never cleared anywhere in win-plan.js (no plan.target = null)',
  wpSrc.indexOf('plan.target = null') === -1 && wpSrc.indexOf('target = null') === -1, null);
check('§A plan.node is never cleared anywhere in win-plan.js (no plan.node = null)',
  wpSrc.indexOf('plan.node = null') === -1, null);
const killBody = fnBody(wpSrc, 'winPlanNoteKill(vid, mdef) {', '\n    // Haven evaluation:');
check('§A winPlanNoteKill found', killBody != null && killBody.length > 200, killBody ? killBody.length : null);
if (killBody) {
  check('§A winPlanNoteKill advances hunt/party to standing on a wave-3+ kill',
    killBody.indexOf("plan.stage = 'standing'") !== -1, null);
  check('§A winPlanNoteKill touches neither the target nor the node',
    killBody.indexOf('plan.target') === -1 && killBody.indexOf('plan.node') === -1, null);
}
const gateBody = fnBody(wpSrc, 'winPlanFightGate(vid, mdef) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
check('§A winPlanFightGate reads no liveness / villageSlain input either',
  gateBody != null && gateBody.indexOf('villageSlain') === -1 && /liveness|lastFight/i.test(gateBody) === false, null);

// ---- §B ANALYZER SELFTEST ----
let selfOk = false;
try {
  // Silence the analyzer's own PASS lines: run it as a subprocess.
  const r = spawnSync(process.execPath, [path.join(__dirname, 'analyze-deadtarget-b.js'), '--selftest'],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  selfOk = r.status === 0 && /0 failed/.test(r.stdout || '');
  check('§B analyzer selftest passes (subprocess, 0 failed)', selfOk, (r.stdout || '').slice(-200) + (r.stderr || '').slice(0, 200));
} catch (e) { check('§B analyzer selftest passes (subprocess, 0 failed)', false, String(e.message)); }

// ---- §C DRIVER SMOKE + GUARDS ----
const smokeDir = 'perseed-deadtarget-diag-b-smoke';
const smokePath = path.join(REPO, 'evidence', '2026-11-19', smokeDir);
try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
const env = Object.assign({}, process.env, { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
  FLEEREPAIR2: '1', FIGHTALLY2: '1', MODE: 'deadtarget', DAYS: '30',
  SEEDS: '106081', RUN: 'deadtarget-diag-b-smoke', OUTDIR: smokeDir });
delete env.ALLYSLOT3; delete env.LAUNCHSURVIVE;
const r = spawnSync(process.execPath, [path.join(__dirname, 'deadtarget-driver-b.js')],
  { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
check('§C driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
let dd = null;
try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'deadtarget-diag-b-s106081-deadtarget-diag-b-smoke-deadtarget.json'), 'utf8')); } catch (e) {}
check('§C driver smoke: corpus file written', !!dd, null);
if (dd) {
  check('§C driver smoke: landed substrate self-describes (leverPresent false, allyslot3Flag null, senseexpedFlag 1, no launchTrackOn)',
    dd.leverPresent === false && dd.allyslot3Flag == null && dd.senseexpedFlag === '1' && dd.launchTrackOn == null && !('v4launchTrack' in dd),
    { leverPresent: dd.leverPresent, allyslot3Flag: dd.allyslot3Flag, senseexpedFlag: dd.senseexpedFlag, launchTrackOn: dd.launchTrackOn });
  check('§C driver smoke: 0 instrument errors',
    (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
  check('§C driver smoke: anchor is a 40-hex commit (never a pinned hash)',
    /^[0-9a-f]{40}$/.test(String(dd.anchorCommit || '')), dd.anchorCommit);
  check('§C driver smoke: arm label is deadtarget-diag-b',
    dd.arm === 'deadtarget-diag-b', dd.arm);
  const launches = (dd.v4departs || []).filter(function (x) { return x.result === 'launch'; });
  const gateKeys = ['stageBefore', 'targetBefore', 'node', 'sinceDay', 'villageSlain',
    'lastFightDay', 'lastFightKill', 'lastFightOutcome', 'daysSinceLastFight',
    'lastSightingDay', 'daysSinceLastSighting'];
  const gatesOk = launches.every(function (x) {
    return x.gate && gateKeys.every(function (k) { return k in x.gate; });
  });
  check('§C driver smoke: every launch row carries a complete gate snapshot (' + launches.length + ' launches in 30d)',
    gatesOk, launches.length);
  const an = AN.analyzeFile(dd);
  check('§C driver smoke: analyzer reads the smoke corpus (launches ' + an.launches + ', gate mismatches ' + an.gateMismatch + ')',
    an.gateMismatch === 0, { launches: an.launches, gateMissing: an.gateMissing, gateMismatch: an.gateMismatch });
}
try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
try { fs.rmSync(fs.mkdtempSync(path.join(os.tmpdir(), 'deadtarget-smoke-')), { recursive: true, force: true }); } catch (e) {}

// Guard: ALLYSLOT3=1 must refuse before any sim runs.
const envGuard = Object.assign({}, process.env, { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
  FLEEREPAIR2: '1', FIGHTALLY2: '1', ALLYSLOT3: '1', MODE: 'deadtarget', DAYS: '1',
  SEEDS: '106081', RUN: 'deadtarget-guard', OUTDIR: 'perseed-deadtarget-diag-b-guard' });
const rg = spawnSync(process.execPath, [path.join(__dirname, 'deadtarget-driver-b.js')],
  { cwd: REPO, env: envGuard, encoding: 'utf8', timeout: 120000 });
check('§C guard: ALLYSLOT3=1 refuses (exit 2, landed substrate only)',
  rg.status === 2 && /ALLYSLOT3 must be unset/.test(rg.stderr || ''), { status: rg.status, err: (rg.stderr || '').slice(0, 160) });
try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-19', 'perseed-deadtarget-diag-b-guard'), { recursive: true, force: true }); } catch (e) {}

console.log('test-deadtarget-diag-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
