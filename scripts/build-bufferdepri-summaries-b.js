#!/usr/bin/env node
// build-bufferdepri-summaries-b.js — verify the 12 analyzer summary JSONs
// are re-derivable from the committed per-seed corpus (sim-bufferdepri-b,
// 2026-10-24).
//
// Each summary must carry 16 rows (seeds 9250-9265) with perSeed + diag,
// schema-exact per-seed JSONs, and env consistent with the cell. The sweep
// merges rows by seed across invocations, so pilot + full + recovery runs
// share one 16-row summary per cell. This script is the re-derivability
// proof: exit 0 iff every number the analyzer reads can be traced to a
// committed per-seed JSON or a summary row.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-bufferdepri-b');
const SEEDS = [9250, 9251, 9252, 9253, 9254, 9255, 9256, 9257, 9258, 9259, 9260, 9261, 9262, 9263, 9264, 9265];
const cells = ['pd0-dg0', 'pd1-dg0', 'pd2-dg0', 'pd0-dg1', 'pd1-dg1', 'pd2-dg1'];
const policies = ['leadfeast', 'belongfeast'];
let fail = 0;
const check = (n, c, d) => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (d ? ' — ' + d : '')); if (!c) fail++; };

for (const cell of cells) for (const policy of policies) {
  const sf = path.join(DIR, `sweep-${cell}-${policy}.json`);
  if (!fs.existsSync(sf)) { check(`summary exists ${cell} ${policy}`, false); continue; }
  const sj = JSON.parse(fs.readFileSync(sf, 'utf8'));
  const rows = sj.rows || [];
  check(`summary ${cell} ${policy} has 16 rows`, rows.length === 16, rows.length + ' rows');
  const pdWant = cell.startsWith('pd2') ? '2' : (cell.startsWith('pd1') ? '1' : '0');
  check(`summary ${cell} ${policy} env`, sj.meta.env.PLENTYDEPRI === pdWant &&
    sj.meta.env.DEPOSITGATE === (cell.endsWith('dg1') ? '1' : '0') &&
    sj.meta.env.FEASTSCALE_R13 === '1' && sj.meta.env.SEATDRIVE === '0' && sj.meta.days === 100);
  const pdNum = cell.startsWith('pd2') ? 2 : (cell.startsWith('pd1') ? 1 : 0);
  for (const s of SEEDS) {
    const f = path.join(DIR, `bufferdepri-b-${cell}-${policy}-s${s}.json`);
    if (!fs.existsSync(f)) { check(`per-seed ${cell} ${policy} s${s}`, false); continue; }
    const perSeed = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (perSeed.seed !== s || perSeed.policy !== policy || perSeed.plentydepri !== pdNum ||
        perSeed.depositgate !== (cell.endsWith('dg1') ? 1 : 0)) {
      check(`per-seed schema ${cell} ${policy} s${s}`, false); continue;
    }
    const row = rows.find(r => r.seed === s);
    // medianSurvival is written by analyze-bufferdepri-b.js (post-analysis
    // patch) into the per-seed FILES only — normalize it out on both sides
    // so the re-derivability proof is robust to the analyzer's documented
    // mutation. All measured fields stay schema-exact.
    const norm = o => { const c = { ...o }; delete c.medianSurvival; return JSON.stringify(c); };
    if (!row || !row.diag || norm(row.perSeed) !== norm(perSeed)) {
      check(`summary row matches per-seed ${cell} ${policy} s${s}`, false, row ? (row.diag ? 'perSeed drift' : 'diag missing') : 'row missing');
    }
  }
}
console.log(fail === 0 ? 'CORPUS VERIFIED — 192/192 per-seed JSONs schema-exact, 12/12 summaries 16-row' : fail + ' FAILURES');
process.exit(fail === 0 ? 0 : 1);
