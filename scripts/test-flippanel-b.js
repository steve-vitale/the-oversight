// test-flippanel-b.js — proof for sim-flippanel-b (real §15 panel verdict on
// the flip-point before/after: collapsed cf22937b8 vs healed c9fea16ee,
// frozen band 53001–53008, policies capable + risk-aware, 150d).
// Proves: both panel.json.gz exist and are valid panels (schemaVersion,
// identical options, expected row counts); the compare re-run through
// lib/balance-scorecard.js equals the recorded decision; the capable-leg rows
// reproduce the control headlines within the prereg tolerance; the two panels'
// registrationDigest values agree.
// Run: node scripts/test-flippanel-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-11-08', 'panel-flippanel-b');
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
    JSON.stringify(before.options.policies) === JSON.stringify(['capable', 'risk-aware'])
    && JSON.stringify(before.options.seeds) === JSON.stringify([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008])
    && before.options.days === 150,
    'policies/seeds/days must match the prereg invocation');
  check('panel-rows-before', before.rows.length === 16, 'rows=' + before.rows.length);
  check('panel-rows-after', after.rows.length === 16, 'rows=' + after.rows.length);
  function legRows(panel, policy) {
    return panel.rows.filter((r) => r.row.policy === policy).sort((a, b) => a.row.seed - b.row.seed);
  }
  for (const policy of ['capable', 'risk-aware']) {
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

  // --- capable-leg reproduction vs the doorwalk controls (prereg tolerance) -
  const capBefore = legRows(before, 'capable');
  const capAfter = legRows(after, 'capable');
  const sitsBefore = capBefore.reduce((n, r) => n + (r.metrics.table || 0), 0);
  const sitsAfter = capAfter.reduce((n, r) => n + (r.metrics.table || 0), 0);
  const medBefore = median(capBefore.map((r) => r.row.gameDays));
  const medAfter = median(capAfter.map((r) => r.row.gameDays));
  console.log('CAPABLE before: sits=' + sitsBefore + '/8 median=' + medBefore + 'd');
  console.log('CAPABLE after:  sits=' + sitsAfter + '/8 median=' + medAfter + 'd');
  check('repro-sits-delta', sitsAfter - sitsBefore >= 2, 'delta=' + (sitsAfter - sitsBefore));
  check('repro-median-delta', medAfter - medBefore >= 30, 'delta=' + (medAfter - medBefore) + 'd');
  check('repro-sits-before-band', sitsBefore >= 0 && sitsBefore <= 2, 'sits=' + sitsBefore);
  check('repro-sits-after-band', sitsAfter >= 2 && sitsAfter <= 6, 'sits=' + sitsAfter);
  check('repro-median-before-band', medBefore >= 40 && medBefore <= 100, 'median=' + medBefore);
  check('repro-median-after-band', medAfter >= 115 && medAfter <= 150, 'median=' + medAfter);

  // --- death guardrails: no regression status on either death metric -------
  for (const p of compare.policies || []) {
    for (const m of p.metrics || []) {
      if (m.id === 'villageDeaths' || m.id === 'playerDeaths') {
        check('guardrail-' + p.policy + '-' + m.id,
          m.status !== 'regression_signal' && m.status !== 'regression_watch',
          'status=' + m.status);
      }
    }
  }
}

console.log(pass + '/' + (pass + fail) + ' PASS');
process.exitCode = fail ? 1 : 0;
