#!/usr/bin/env node
// test-synergyholdout-b.js — proof for the sim-synergyholdout-b prereg.
//
// Asserts the prereg (evidence/2026-11-12/sim-synergyholdout-b-prereg.md)
// from the COMMITTED corpora only — no sims run here:
//   (a) panel compare: neither of the two 8-seed exploratory signals
//       (villageDeaths100Days, npcClassAccess) reproduces as
//       `regression_signal` on the fresh 16-seed band;
//   (b) cost bar: starvation deaths (any death-cause key containing
//       "starvation") after <= before total + 2, BOTH on totals and on
//       arm-only seeds (after-leg starvation on seeds where the before
//       leg had none); median survival (median row.days) after >= 0.8x
//       before median.
// Exit 0 = GO (prereg met). Exit 1 = NO-GO (signal reproduced or cost
// bar breached) — a failing run here IS the verdict, not a broken test.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-12');
const BEFORE_PANEL = path.join(EVID, 'synergyholdout-b-panel-before', 'panel.json.gz');
const AFTER_PANEL = path.join(EVID, 'synergyholdout-b-panel-after', 'panel.json.gz');
const COMPARE = path.join(EVID, 'synergyholdout-b-panel-compare.json');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}
function readPanel(file) {
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'));
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2;
}
function starvationOf(row) {
  return Object.entries(row.deaths || {})
    .filter(([k]) => k.toLowerCase().includes('starvation'))
    .reduce((n, [, v]) => n + v, 0);
}

const compare = JSON.parse(fs.readFileSync(COMPARE, 'utf8'));
const competent = (compare.policies || []).find(p => p.policy === 'competent');
check('compare has a competent policy block', !!competent);
const byId = {};
for (const m of (competent && competent.metrics) || []) byId[m.id] = m;
for (const id of ['villageDeaths100Days', 'npcClassAccess']) {
  const m = byId[id];
  check('compare carries ' + id, !!m);
  if (m) {
    check(id + ' is not regression_signal', m.status !== 'regression_signal',
      'status=' + m.status + ' before=' + m.before + ' after=' + m.after +
      ' delta=' + (m.delta == null ? 'null' : m.delta.toFixed(4)) +
      ' interval=[' + (m.interval95 || []).join(', ') + '] pairs=' + m.pairs);
  }
}
check('compare decision recorded', typeof compare.decision === 'string',
  'decision=' + compare.decision);

const before = readPanel(BEFORE_PANEL);
const after = readPanel(AFTER_PANEL);
check('before panel is 16 competent cases', before.rows.length === 16,
  'rows=' + before.rows.length + ' head=' + before.sourceHeadStart);
check('after panel is 16 competent cases', after.rows.length === 16,
  'rows=' + after.rows.length + ' head=' + after.sourceHeadStart);
check('before leg is fed635f1f', String(before.sourceHeadStart).startsWith('fed635f1f'),
  String(before.sourceHeadStart));
check('after leg is ad2bd13fd', String(after.sourceHeadStart).startsWith('ad2bd13fd'),
  String(after.sourceHeadStart));

const bRows = before.rows.slice().sort((a, b) => a.row.seed - b.row.seed);
const aRows = after.rows.slice().sort((a, b) => a.row.seed - b.row.seed);
check('panels cover identical seeds',
  JSON.stringify(bRows.map(r => r.row.seed)) === JSON.stringify(aRows.map(r => r.row.seed)));
const bStarv = bRows.map(r => starvationOf(r.row));
const aStarv = aRows.map(r => starvationOf(r.row));
const bTotal = bStarv.reduce((n, x) => n + x, 0);
const aTotal = aStarv.reduce((n, x) => n + x, 0);
const armOnly = aStarv.filter((v, i) => v > 0 && bStarv[i] === 0).reduce((n, x) => n + x, 0);
check('starvation total after <= before+2', aTotal <= bTotal + 2,
  'before=' + bTotal + ' after=' + aTotal + ' bar=' + (bTotal + 2));
check('starvation arm-only <= 2', armOnly <= 2,
  'arm-only=' + armOnly + ' (after-leg starvation on seeds where before had none)');
const bMed = median(bRows.map(r => r.row.days));
const aMed = median(aRows.map(r => r.row.days));
check('median survival after >= 0.8x before', aMed >= 0.8 * bMed,
  'before=' + bMed + 'd after=' + aMed + 'd bar=' + (0.8 * bMed).toFixed(1) + 'd');

if (failures) {
  console.log('synergyholdout-b: NO-GO — ' + failures + ' prereg check(s) failed (see above)');
  process.exitCode = 1;
} else {
  console.log('synergyholdout-b: GO — compare signals did not reproduce; cost bar holds');
}
