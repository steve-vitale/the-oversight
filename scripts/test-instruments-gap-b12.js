// scripts/test-instruments-gap-b12.js — B12 proof: the balanced-panel
// compare ingests a per-seed sweep corpus (gap-instruments, 2026-10-27).
//
// BEFORE (verified 2026-10-27, before the fix):
//   comparePanels(waitlongSweep, waitlongSweep) threw
//   TypeError: Cannot read properties of undefined (reading 'days')
//   at scripts/lib/balance-scorecard.js:44, and the CLI
//   `node scripts/balance-panel.js compare --before <sweep> --after <sweep>`
//   threw identically. AFTER: the same inputs produce a labeled
//   sweep-corpus comparison (no throw, non-empty, paired), while the
//   strict panel path is unchanged.
//
// Writes nothing into the repo: the CLI check writes under a /tmp
// temp dir. Exit code 0 = all checks pass.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const score = require('./lib/balance-scorecard');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const sweep = JSON.parse(fs.readFileSync(path.join(ROOT, 'evidence/2026-10-27/sim-waitlong-a-sweep.json'), 'utf8'));

// 1. The exact 1215Z attempt, at API level: no throw, labeled report.
let report = null, threw = null;
try { report = score.comparePanels(sweep, sweep); } catch (e) { threw = e; }
check('comparePanels(sweep, sweep) does not throw', threw === null, threw && threw.message);
check('report source is sweep-corpus, never a panel verdict',
  report && report.source === 'sweep-corpus', report && report.source);
check('report decision is review_required, driven ONLY by not_observed metrics',
  report && report.decision === 'review_required'
    && report.policies.every(p => p.metrics.every(m =>
      ['descriptive', 'no_material_signal', 'not_observed'].includes(m.status))),
  report && report.decision);
check('report note says it is not a balanced-panel verdict',
  report && /NOT a balanced-panel verdict/.test(report.note || ''), report && report.note);

// 2. Non-empty, paired: all 3 policies, 8 seeds each.
const byPolicy = {};
for (const p of (report ? report.policies : [])) byPolicy[p.policy] = p;
for (const name of ['baseline', 'seatonly', 'seatwait']) {
  check('policy ' + name + ' present with 8 paired cases',
    byPolicy[name] && byPolicy[name].cases === 8, byPolicy[name] && byPolicy[name].cases);
}

// 3. Real values where the corpus carries them; not_observed elsewhere.
const MAPPED = ['won', 'entered', 'table', 'national', 'playerDeaths'];
for (const name of ['baseline', 'seatonly', 'seatwait']) {
  const metrics = {};
  for (const m of (byPolicy[name] ? byPolicy[name].metrics : [])) metrics[m.id] = m;
  for (const id of MAPPED) {
    check(name + '/' + id + ' has 8 pairs and delta 0 (self-compare)',
      metrics[id] && metrics[id].pairs === 8 && metrics[id].delta === 0,
      metrics[id] && ('pairs=' + metrics[id].pairs + ' delta=' + metrics[id].delta));
  }
  const unmapped = (byPolicy[name] ? byPolicy[name].metrics : [])
    .filter(m => !MAPPED.includes(m.id) && m.status !== 'not_observed');
  check(name + ': every unmapped contract metric is not_observed, never invented',
    unmapped.length === 0, unmapped.map(m => m.id + '=' + m.status).join(','));
}

// 4. Shape discipline: mixed shapes and garbage yield invalid, never a throw.
let mixed = null, mixedThrew = null;
try { mixed = score.comparePanels(sweep, { options: {}, rows: [] }); } catch (e) { mixedThrew = e; }
check('sweep vs non-panel yields invalid, not a throw',
  mixedThrew === null && mixed && mixed.decision === 'invalid', mixedThrew && mixedThrew.message);
let garbage = null, garbageThrew = null;
try { garbage = score.comparePanels({ rows: [] }, null); } catch (e) { garbageThrew = e; }
check('garbage inputs yield invalid, not a throw',
  garbageThrew === null && garbage && garbage.decision === 'invalid', garbageThrew && garbageThrew.message);

// 5. Strict panel path unchanged: a minimal valid panel pair still
// compares, and an options mismatch is still invalid.
function miniPanel(days) {
  return {
    schemaVersion: 1, observerDigest: 'obs', contractDigest: score.contractDigest,
    sources: {}, validity: { sourcesStable: true, neutrality: [{ policy: 'p', seed: 1, match: true }] },
    options: { days, policies: ['p'], seeds: [1], region: null, origin: 'Columbus, Ohio',
      occupation: null, flags: {}, nodeVersion: process.version },
    rows: [{ row: { policy: 'p', seed: 1 }, metrics: { won: 1, entered: 0, table: 0, national: 1 },
      warnings: [], observerErrors: [], gear: { errors: [] } }],
  };
}
const panelReport = score.comparePanels(miniPanel(150), miniPanel(150));
check('genuine panel pair still compares via the strict path',
  panelReport && panelReport.source === undefined && panelReport.policies.length === 1
    && panelReport.policies[0].cases === 1, panelReport && panelReport.decision);
const mismatch = score.comparePanels(miniPanel(150), miniPanel(151));
check('panel options mismatch is still invalid with an Unmatched error',
  mismatch && mismatch.decision === 'invalid' && mismatch.errors.some(e => /Unmatched days/.test(e)),
  mismatch && JSON.stringify(mismatch.errors));

// 6. The exact 1215Z CLI attempt end to end.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-b12-'));
const cli = cp.spawnSync(process.execPath,
  [path.join(ROOT, 'scripts/balance-panel.js'), 'compare',
   '--before', path.join(ROOT, 'evidence/2026-10-27/sim-waitlong-a-sweep.json'),
   '--after', path.join(ROOT, 'evidence/2026-10-27/sim-waitlong-a-sweep.json'),
   '--out', path.join(tmp, 'waitlong-panel')],
  { encoding: 'utf8' });
const cliJson = (() => { try { return JSON.parse(fs.readFileSync(path.join(tmp, 'waitlong-panel.json'), 'utf8')); } catch (e) { return null; } })();
const cliMd = (() => { try { return fs.readFileSync(path.join(tmp, 'waitlong-panel.md'), 'utf8'); } catch (e) { return ''; } })();
check('CLI compare on the sweep corpus writes a report (exit 2 = review_required, the existing CLI contract for any non-clean decision)',
  cli.status === 2 && cliJson && cliJson.source === 'sweep-corpus' && cliJson.decision === 'review_required',
  'status=' + cli.status + ' stderr=' + (cli.stderr || '').slice(0, 200));
check('CLI markdown is labeled as not a panel verdict',
  /not a balanced-panel verdict/.test(cliMd), cliMd.split('\n')[0] || '');

console.log(`\nB12 proof: ${pass} PASS, ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;
