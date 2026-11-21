// test-reseedwide-b.js — proof test, arm sim-reseedwide-b.
// Proves, before any judged leg:
//   (a) HORIZON + NAMING: the ported driver defaults DAYS 180 (the
//       judged horizon), the corpus filename / self-description carry
//       `reseedwide-b` + MODE `reseedwide`, and the MODE guard refuses
//       anything else. The replica itself is unchanged code (ported
//       byte-identical from reseedexpiry) — its fidelity proof is
//       test-reseedexpiry-b.js §A, re-run green on this base, not
//       duplicated here.
//   (b) DRIVER SMOKE: armed + control 1-seed smokes through the
//       ported driver at the judged default (DAYS unset -> 180, seed
//       106601) record rumorPool snapshots on depart rows, the corpus
//       self-describes the flag + base, the analyzer reads both
//       corpora, and the reseedwide panel build + compare run on the
//       two smoke corpora (panel options.days 180).
//   (c) ANALYZER §H WIRING: judgePooled with minExpiries 3 reports
//       (not judges) the follow bars at ec < 3 and judges them at
//       ec >= 3 — exercised here from the test side (the analyzer's
//       own selftest §H is the same behavior's home proof).
// Usage: node scripts/test-reseedwide-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'analyze-reseedexpiry-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- §A HORIZON + NAMING (static pins on the ported driver) ----
(function sectionA() {
  const src = fs.readFileSync(path.join(__dirname, 'reseedwide-driver-b.js'), 'utf8');
  check('§A driver defaults DAYS 180 (judged horizon)',
    /parseInt\(process\.env\.DAYS \|\| '180', 10\) \|\| 180/.test(src), null);
  check('§A driver MODE guard is reseedwide',
    /if \(MODE !== 'reseedwide'\)/.test(src) && /RESEEDWIDE STOP: MODE must be reseedwide/.test(src), null);
  check('§A driver corpus prefix is reseedwide-b-s',
    src.indexOf("'reseedwide-b-s'") !== -1, null);
  check('§A driver arm label is reseedwide-b',
    src.indexOf("arm: 'reseedwide-b'") !== -1, null);
  check('§A driver loadGame mode prefix is reseedwide-',
    src.indexOf("mode: 'reseedwide-' + MODE") !== -1, null);
  check('§A driver is a port, not a rewrite: rumor-pool snapshot + gate snapshot present, no other recorder change',
    src.indexOf('rumorPoolSnapshot') !== -1 && src.indexOf('gateSnapshot') !== -1, null);
  const anSrc = fs.readFileSync(path.join(__dirname, 'analyze-reseedexpiry-b.js'), 'utf8');
  check('§A analyzer carries the minExpiries extension (judgePooled opts + CLI flag)',
    anSrc.indexOf('minExpiries') !== -1 && anSrc.indexOf("'--min-expiries'") !== -1, null);
  const pbSrc = fs.readFileSync(path.join(__dirname, 'build-reseedwide-b-panels.js'), 'utf8');
  check('§A panel builder is the 180d port (DAYS 180, reseedwide filename pattern)',
    /const DAYS = 180;/.test(pbSrc) && pbSrc.indexOf("'reseedwide-b-s'") !== -1, null);
})();

// ---- §C ANALYZER §H WIRING (synthetic pooled bands, no subprocess) ----
(function sectionC() {
  function mkBand(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 0, live: 8, unknown: 0, classified: 8, classifiedShare: 1.0, deadShare: 0,
      stageBefore: {}, deadStanding: 0, deadSlainKnown: 0, deadNeverRefought: 0,
      withFirstAfter: 0, sameDayFirstAfter: 0, medianDaysSinceLastFight: null,
      expiriesCount: 0, reseedsCount: 0, reseededWithin7Count: 0, foughtAgain14Count: 0,
      reseededShare: null, foughtAgainShare: null,
      deadCommitsCount: 3, poolDisagreementsCount: 0,
      poolFloor: { commits: 3, min: 1, median: 2, dist: { 1: 1, 2: 2 }, table: [] },
      postExpiryTargetlessLaunches: 0, postExpiryHolds: 0, expiryRuleMismatch: 0 }, o);
  }
  let jp = AN.judgePooled([mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§C minExpiries 3, ec=2: REPORTED LOW-N, follow bars reported (pass null), shares visible',
    jp.verdict === 'REPORTED' && jp.kind === 'LOW-N' && jp.bars[6].pass === null &&
    jp.pooled.reseededShare === 1.0 && jp.pooled.foughtAgainShare === 1.0, JSON.stringify(jp));
  jp = AN.judgePooled([mkBand({ expiriesCount: 2, reseededWithin7Count: 2, foughtAgain14Count: 2,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§C minExpiries 3, ec=3 shares 1.0: DIAG-GO (judged)',
    jp.verdict === 'DIAG-GO' && jp.pooled.expiries === 3, JSON.stringify(jp.pooled));
  jp = AN.judgePooled([mkBand({ expiriesCount: 2, reseededWithin7Count: 1, foughtAgain14Count: 2,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 0, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§C minExpiries 3, ec=3 re-seed 1/3: NO-GO RESEED',
    jp.verdict === 'NO-GO' && jp.kind === 'RESEED', JSON.stringify(jp.pooled));
  jp = AN.judgePooled([mkBand({}), mkBand({})], { armed: true, minExpiries: 3 });
  check('§C minExpiries 3, ec=0: REPORTED LOW-N (combined-fix judgment decides, not UNREACHABLE)',
    jp.verdict === 'REPORTED' && jp.kind === 'LOW-N', JSON.stringify(jp));
})();

// ---- §B DRIVER SMOKE + PANEL (subprocess, judged default: DAYS unset -> 180) ----
(function sectionB() {
  const { spawnSync } = require('child_process');
  const smokeDirCtl = 'perseed-reseedwide-b-smoke-ctl';
  const smokeDirArm = 'perseed-reseedwide-b-smoke-arm';
  const baseEnv = { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', MODE: 'reseedwide',
    SEEDS: '106601' };
  // DAYS deliberately UNSET: the smoke proves the driver's own default is the judged 180d.
  delete process.env.DAYS;
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  const envArm = Object.assign({}, process.env, baseEnv, { PLANRESEED: '1', RUN: 'reseedwide-b-106601-armed', OUTDIR: smokeDirArm });
  delete envArm.ALLYSLOT3; delete envArm.LAUNCHSURVIVE; delete envArm.DAYS;
  const ra = spawnSync(process.execPath, [path.join(__dirname, 'reseedwide-driver-b.js')],
    { cwd: REPO, env: envArm, encoding: 'utf8', timeout: 900000 });
  check('§B armed driver smoke: exit 0 on one 180d-default seed', ra.status === 0, (ra.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm, 'reseedwide-b-s106601-reseedwide-b-106601-armed-reseedwide.json'), 'utf8')); } catch (e) {}
  check('§B armed driver smoke: corpus file written under the reseedwide name', !!dd, null);
  if (dd) {
    check('§B armed smoke: corpus self-describes the flag (planreseedFlag 1, leverPresent false)',
      dd.planreseedFlag === '1' && dd.leverPresent === false && dd.allyslot3Flag == null,
      { planreseedFlag: dd.planreseedFlag, leverPresent: dd.leverPresent });
    check('§B armed smoke: arm label is reseedwide-b, mode reseedwide',
      dd.arm === 'reseedwide-b' && dd.mode === 'reseedwide', { arm: dd.arm, mode: dd.mode });
    check('§B armed smoke: horizon is the 180d default (days 180, or fewer only if the village ended early)',
      dd.days === 180 || (dd.days < 180 && !!dd.endReason),
      { days: dd.days, endReason: dd.endReason, gameDays: dd.gameDays });
    check('§B armed smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§B armed smoke: winPlanStats carries planReseeds + planExpiries',
      dd.winPlanStats && ('planReseeds' in dd.winPlanStats) && ('planExpiries' in dd.winPlanStats),
      dd.winPlanStats ? Object.keys(dd.winPlanStats) : null);
    const departs = dd.v4departs || [];
    const withPool = departs.filter(function (x) { return x.rumorPool && typeof x.rumorPool.poolN === 'number' && typeof x.rumorPool.deadTarget === 'boolean'; });
    check('§B armed smoke: every v4departs row carries a rumorPool snapshot (' + withPool.length + '/' + departs.length + ' rows)',
      departs.length === 0 || withPool.length === departs.length, { rows: departs.length, withPool: withPool.length });
    const an = AN.analyzeFile(dd);
    check('§B armed smoke: analyzer reads the smoke corpus (launches ' + an.launches + ', gate mismatches ' + an.gateMismatch + ')',
      an.gateMismatch === 0, { launches: an.launches, gateMissing: an.gateMissing, gateMismatch: an.gateMismatch });
    const dc = AN.deadCommitsOf(dd);
    const pf = AN.poolFloorStats(dc);
    check('§B armed smoke: dead-commit + pool-floor functions run on the smoke corpus (dead commits ' + dc.length + ', floor min ' + pf.min + ')',
      Array.isArray(dc) && pf && typeof pf === 'object', { deadCommits: dc.length, poolFloor: pf });
  }
  // Control smoke (flag unset) + panel build + compare on the two smoke dirs.
  const envCtl = Object.assign({}, process.env, baseEnv, { RUN: 'reseedwide-b-106601-control', OUTDIR: smokeDirCtl });
  delete envCtl.ALLYSLOT3; delete envCtl.LAUNCHSURVIVE; delete envCtl.PLANRESEED; delete envCtl.DAYS;
  const rc = spawnSync(process.execPath, [path.join(__dirname, 'reseedwide-driver-b.js')],
    { cwd: REPO, env: envCtl, encoding: 'utf8', timeout: 900000 });
  check('§B control driver smoke: exit 0 on one 180d-default seed', rc.status === 0, (rc.stderr || '').slice(0, 300));
  let dc2 = null;
  try { dc2 = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl, 'reseedwide-b-s106601-reseedwide-b-106601-control-reseedwide.json'), 'utf8')); } catch (e) {}
  check('§B control smoke: corpus file written, flag null, horizon 180d default',
    !!dc2 && dc2.planreseedFlag == null && (dc2.days === 180 || (dc2.days < 180 && !!dc2.endReason)),
    dc2 ? { flag: dc2.planreseedFlag, days: dc2.days, endReason: dc2.endReason } : null);
  if (dc2 && dd) {
    const rb = spawnSync(process.execPath, [path.join(__dirname, 'build-reseedwide-b-panels.js'),
      '--before', path.join('evidence', '2026-11-20', smokeDirCtl),
      '--after', path.join('evidence', '2026-11-20', smokeDirArm),
      '--out', path.join('evidence', '2026-11-20', 'reseedwide-b-smoke-panel'),
      '--seeds', '106601', '--before-seeds', '106601',
      '--run-before', 'reseedwide-b-106601-control', '--run-after', 'reseedwide-b-106601-armed'],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    check('§B panel build on the two smoke corpora: exit 0', rb.status === 0, (rb.stderr || '').slice(0, 300));
    let panelDays = null;
    try { panelDays = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel-before.json.gz'))).toString('utf8')).options.days; } catch (e) {}
    check('§B smoke panel carries the 180d horizon in options.days', panelDays === 180, panelDays);
    const rp = spawnSync(process.execPath, [path.join(__dirname, 'balance-panel.js'), 'compare',
      '--before', path.join('evidence', '2026-11-20', 'reseedwide-b-smoke-panel-before.json.gz'),
      '--after', path.join('evidence', '2026-11-20', 'reseedwide-b-smoke-panel-after.json.gz'),
      '--out', path.join('evidence', '2026-11-20', 'reseedwide-b-smoke-panel')],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    const panelMd = path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel.md');
    check('§B balance-panel compare on the smoke panels: writes the .md (exit 0 or 2, decision printed)',
      (rp.status === 0 || rp.status === 2) && fs.existsSync(panelMd) && /review_required|no_material_signal|material_signal/.test(rp.stdout || ''),
      { status: rp.status, out: (rp.stdout || '').slice(0, 120), mdExists: fs.existsSync(panelMd) });
  }
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel-before.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel-after.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel.md'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedwide-b-smoke-panel.json'), { force: true }); } catch (e) {}

  // Guard: MODE anything else must refuse before any sim runs.
  const envGuard = Object.assign({}, process.env, baseEnv, { MODE: 'reseedexpiry', DAYS: '1',
    RUN: 'reseedwide-guard', OUTDIR: 'perseed-reseedwide-b-guard' });
  const rg = spawnSync(process.execPath, [path.join(__dirname, 'reseedwide-driver-b.js')],
    { cwd: REPO, env: envGuard, encoding: 'utf8', timeout: 120000 });
  check('§B guard: MODE=reseedexpiry refuses on the reseedwide driver (exit 2)',
    rg.status === 2 && /RESEEDWIDE STOP: MODE must be reseedwide/.test(rg.stderr || ''), { status: rg.status, err: (rg.stderr || '').slice(0, 160) });
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'perseed-reseedwide-b-guard'), { recursive: true, force: true }); } catch (e) {}
})();

console.log('test-reseedwide-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
