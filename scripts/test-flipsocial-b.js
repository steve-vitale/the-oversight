// test-flipsocial-b.js — proof for sim-flipsocial-b (the §15 socialite +
// winseek panel columns on the flip: collapsed cf22937b8 vs healed c9fea16ee,
// frozen band 53001–53008, 150d).
// Proves: both panel.json.gz exist and are valid panels (schemaVersion,
// identical options, expected row counts); the compare re-run through
// lib/balance-scorecard.js equals the recorded decision; the per-policy rows
// carry the evidence numbers (sits + median survival); the pre-registered
// GO bars are derived from those numbers.
// EXPECTED OUTCOME (read before running): the structural checks pass and the
// verdict checks FAIL — the failures ARE the NO-GO verdict, not a broken
// instrument. Sits delta 0 (< +2), median delta negative (< +30d), and the
// village-deaths rate carries a regression_watch on both columns, so GO
// bars (c) and (d) miss on both policy legs. This test is NOT on the green
// list; check.js --quick does not run it.
// Run: node scripts/test-flipsocial-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-11-08', 'panel-flipsocial-b');
const BEFORE_PANEL = path.join(EVID, 'before', 'panel.json.gz');
const AFTER_PANEL = path.join(EVID, 'after', 'panel.json.gz');
const COMPARE_JSON = path.join(EVID, 'compare.json');
const score = require(path.join(REPO, 'scripts', 'lib', 'balance-scorecard.js'));

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadPanel(p) {
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString('utf8'));
}

let before, after, compare;
try { before = loadPanel(BEFORE_PANEL); check('panel-before-exists', true); }
catch (e) { check('panel-before-exists', false, String(e.message).slice(0, 160)); }
try { after = loadPanel(AFTER_PANEL); check('panel-after-exists', true); }
catch (e) { check('panel-after-exists', false, String(e.message).slice(0, 160)); }
try { compare = JSON.parse(fs.readFileSync(COMPARE_JSON, 'utf8')); check('compare-exists', true); }
catch (e) { check('compare-exists', false, String(e.message).slice(0, 160)); }

if (before && after && compare) {
  // --- valid panels: schema, identical options, expected row counts --------
  check('panel-schema', typeof before.schemaVersion === 'number' && before.schemaVersion === after.schemaVersion,
    'schema=' + before.schemaVersion + '/' + after.schemaVersion);
  const optEq = JSON.stringify(before.options.policies) === JSON.stringify(after.options.policies)
    && JSON.stringify(before.options.seeds) === JSON.stringify(after.options.seeds)
    && before.options.days === after.options.days;
  check('panel-options-identical', optEq,
    'policies=' + JSON.stringify(before.options.policies) + ' seeds=' + JSON.stringify(before.options.seeds) + ' days=' + before.options.days);
  check('panel-options-expected',
    JSON.stringify(before.options.policies) === JSON.stringify(['socialite', 'winseek'])
    && JSON.stringify(before.options.seeds) === JSON.stringify([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008])
    && before.options.days === 150,
    'policies/seeds/days must match the prereg invocation');
  check('panel-rows-before', before.rows.length === 16, 'rows=' + before.rows.length);
  check('panel-rows-after', after.rows.length === 16, 'rows=' + after.rows.length);
  function legRows(panel, policy) {
    return panel.rows.filter((r) => r.row.policy === policy).sort((a, b) => a.row.seed - b.row.seed);
  }
  for (const policy of ['socialite', 'winseek']) {
    const b = legRows(before, policy), a = legRows(after, policy);
    check('panel-rows-' + policy + '-before', b.length === 8, 'rows=' + b.length);
    check('panel-rows-' + policy + '-after', a.length === 8, 'rows=' + a.length);
    check('panel-seeds-' + policy, JSON.stringify(b.map((r) => r.row.seed)) === JSON.stringify([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008])
      && JSON.stringify(a.map((r) => r.row.seed)) === JSON.stringify([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008]),
      'seeds must be the frozen band on both legs');
  }

  // --- digests: the frozen-controller overlay made the harness identical ---
  check('digest-registration', before.registrationDigest === after.registrationDigest,
    'before=' + String(before.registrationDigest).slice(0, 12) + ' after=' + String(after.registrationDigest).slice(0, 12));
  check('digest-observer', before.observerDigest === after.observerDigest,
    'before=' + String(before.observerDigest).slice(0, 12) + ' after=' + String(after.observerDigest).slice(0, 12));
  check('digest-contract', before.contractDigest === after.contractDigest,
    'before=' + String(before.contractDigest).slice(0, 12) + ' after=' + String(after.contractDigest).slice(0, 12));

  // --- compare re-run equals the recorded decision -------------------------
  let rerun = null;
  try { rerun = score.comparePanels(before, after, { interventionFlags: [] }); check('compare-rerun', true); }
  catch (e) { check('compare-rerun', false, String(e.message).slice(0, 200)); }
  if (rerun) {
    check('compare-decision', rerun.decision === compare.decision,
      'rerun=' + rerun.decision + ' recorded=' + compare.decision);
    const recByPolicy = {};
    for (const p of compare.policies || []) recByPolicy[p.policy] = p.decision;
    for (const p of rerun.policies || []) {
      check('compare-decision-' + p.policy, p.decision === recByPolicy[p.policy],
        'rerun=' + p.decision + ' recorded=' + recByPolicy[p.policy]);
    }
  }

  // --- per-policy numbers, as recorded in the evidence ----------------------
  // Sits are the panel `table` metric (ruling 665: sittings, row.entered).
  const EXPECTED = {
    socialite: { sitsBefore: 0, sitsAfter: 0, medBefore: 80.0, medAfter: 73.5 },
    winseek: { sitsBefore: 0, sitsAfter: 0, medBefore: 81.0, medAfter: 70.5 },
  };
  for (const policy of ['socialite', 'winseek']) {
    const b = legRows(before, policy), a = legRows(after, policy);
    const sitsBefore = b.reduce((n, r) => n + (r.metrics.table || 0), 0);
    const sitsAfter = a.reduce((n, r) => n + (r.metrics.table || 0), 0);
    const medBefore = median(b.map((r) => r.row.gameDays));
    const medAfter = median(a.map((r) => r.row.gameDays));
    console.log(policy.toUpperCase() + ' before: sits=' + sitsBefore + '/8 median=' + medBefore + 'd');
    console.log(policy.toUpperCase() + ' after:  sits=' + sitsAfter + '/8 median=' + medAfter + 'd');
    const exp = EXPECTED[policy];
    check('numbers-' + policy + '-sits', sitsBefore === exp.sitsBefore && sitsAfter === exp.sitsAfter,
      'sits=' + sitsBefore + '->' + sitsAfter + ' expected=' + exp.sitsBefore + '->' + exp.sitsAfter);
    check('numbers-' + policy + '-median', medBefore === exp.medBefore && medAfter === exp.medAfter,
      'median=' + medBefore + '->' + medAfter + ' expected=' + exp.medBefore + '->' + exp.medAfter);
    // --- flip-signature (prereg proof tolerance): paired deltas ------------
    // These FAIL on both columns: the flip does not reproduce here.
    check('repro-' + policy + '-sits-delta', sitsAfter - sitsBefore >= 2, 'delta=' + (sitsAfter - sitsBefore));
    check('repro-' + policy + '-median-delta', medAfter - medBefore >= 30, 'delta=' + (medAfter - medBefore) + 'd');
    check('repro-' + policy + '-sits-before-band', sitsBefore >= 0 && sitsBefore <= 2, 'sits=' + sitsBefore);
    check('repro-' + policy + '-sits-after-band', sitsAfter >= 2 && sitsAfter <= 6, 'sits=' + sitsAfter);
    check('repro-' + policy + '-median-before-band', medBefore >= 40 && medBefore <= 100, 'median=' + medBefore);
    check('repro-' + policy + '-median-after-band', medAfter >= 115 && medAfter <= 150, 'median=' + medAfter);
    // --- GO bar (c): healed median >= collapsed -----------------------------
    check('gobar-' + policy + '-median', medAfter >= medBefore, 'median ' + medBefore + '->' + medAfter);
    // --- GO bar (b): healed sits >= collapsed (holds as equality here) ------
    check('gobar-' + policy + '-sits', sitsAfter >= sitsBefore, 'sits ' + sitsBefore + '->' + sitsAfter);
  }

  // --- GO bar (d): no death-guardrail regression, both columns ---------------
  // Count metrics (villageDeaths / playerDeaths) and rate metrics
  // (villageDeaths100Days / playerDeaths100Days) are reported separately:
  // the verdict does not hinge on the family reading, because bar (c)
  // already misses on both columns.
  for (const p of compare.policies || []) {
    for (const m of p.metrics || []) {
      if (m.id === 'villageDeaths' || m.id === 'playerDeaths') {
        check('guardrail-count-' + p.policy + '-' + m.id,
          m.status !== 'regression_signal' && m.status !== 'regression_watch',
          'status=' + m.status);
      }
      if (m.id === 'villageDeaths100Days' || m.id === 'playerDeaths100Days') {
        check('guardrail-rate-' + p.policy + '-' + m.id,
          m.status !== 'regression_signal' && m.status !== 'regression_watch',
          'status=' + m.status + ' before=' + m.before + ' after=' + m.after);
      }
    }
  }

  // --- row.table vs metrics.table: the reached-but-never-sat gap -------------
  // row.table is the raw harness flag (village reached the table); the panel
  // `table` metric counts sittings only (ruling 665). On winseek the raw
  // flag reads 7/8 -> 5/8 while sittings read 0/8 -> 0/8: villages reach
  // the table and never sit under either endpoint.
  for (const policy of ['winseek']) {
    const b = legRows(before, policy), a = legRows(after, policy);
    const rawBefore = b.reduce((n, r) => n + (r.row.table || 0), 0);
    const rawAfter = a.reduce((n, r) => n + (r.row.table || 0), 0);
    check('rowtable-' + policy, rawBefore === 7 && rawAfter === 5,
      'row.table=' + rawBefore + '->' + rawAfter + ' while metrics.table=0->0');
  }
}

console.log(pass + '/' + (pass + fail) + ' PASS');
process.exitCode = fail ? 1 : 0;
