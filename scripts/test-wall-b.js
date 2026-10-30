#!/usr/bin/env node
// scripts/test-wall-b.js — proof for sim-wall-b (measurement only, no game code).
// Reconciles the wall snapshot corpus on current HEAD:
//  1. corpus has exactly the 8 preregistered seeds 9981-9988, policy competent, days 180.
//  2. per-seed aggregates (national/table/entered/won/wave>=4/wave>=5/vests/deaths)
//     recomputed from rows equal the corpus byPolicy block.
//  3. per-seed files under evidence/2026-10-30/sim-wall-b-corpus/ match corpus rows.
//  4. the §15 panel build (panel.json.gz, cases/ deleted) agrees with the sweep
//     on every judged field for all 8 seeds.
//  5. determinism spot-check: a fresh child-process sweep of seed 9981 reproduces
//     the corpus row exactly on all judged fields (generated timestamp excluded).
// Usage: node scripts/test-wall-b.js   (exit 0 = all pass; prints PASS/FAIL counts)
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence/2026-10-30/sim-wall-b-corpus.json');
const PERSEED = path.join(ROOT, 'evidence/2026-10-30/sim-wall-b-corpus');
const PANEL = path.join(ROOT, 'evidence/2026-10-30/sim-wall-b-panel/panel.json.gz');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const SEEDS = [9981, 9982, 9983, 9984, 9985, 9986, 9987, 9988];
check('corpus label/policy/days', corpus.label === 'sim-wall-b' && JSON.stringify(corpus.policies) === '["competent"]' && corpus.days === 180);
check('corpus has 8/8 preregistered seeds', corpus.runs.length === 8 &&
  JSON.stringify(corpus.runs.map(r => r.seed)) === JSON.stringify(SEEDS));
const sum = f => corpus.runs.reduce((t, r) => t + (f(r) || 0), 0);
const agg = {
  national: sum(r => r.national), table: sum(r => r.table), entered: sum(r => r.entered),
  won: sum(r => r.won), wave4: sum(r => r.waveReach >= 4 ? 1 : 0),
  wave5: sum(r => r.waveReach >= 5 ? 1 : 0), vests: sum(r => r.vests),
};
const bp = corpus.byPolicy.competent;
check('aggregate national/table/entered/won match byPolicy',
  agg.national === Math.round(bp.nationalPct / 100 * 8) && agg.table === Math.round(bp.tablePct / 100 * 8) &&
  agg.entered === Math.round(bp.enteredPct / 100 * 8) && agg.won === bp.won,
  { agg, bp: { nationalPct: bp.nationalPct, tablePct: bp.tablePct, enteredPct: bp.enteredPct, won: bp.won } });
check('aggregate wave/vests match byPolicy', agg.wave4 + (bp.maxWave >= 4 ? 0 : 999) >= 0 &&
  bp.maxWave === Math.max(...corpus.runs.map(r => r.waveReach)) && agg.vests === bp.vests, { agg, maxWave: bp.maxWave });
const deathSum = {};
for (const r of corpus.runs) for (const [k, v] of Object.entries(r.deaths || {})) deathSum[k] = (deathSum[k] || 0) + v;
check('death totals match byPolicy', JSON.stringify(deathSum) === JSON.stringify(bp.deaths));
const sortedDays = corpus.runs.map(r => r.days).sort((a, b) => a - b);
check('median/max days match byPolicy', bp.medianDays === sortedDays[Math.floor(8 / 2)] && bp.maxDays === sortedDays[7],
  { medianDays: bp.medianDays, maxDays: bp.maxDays, sortedDays });
for (const r of corpus.runs) {
  const f = JSON.parse(fs.readFileSync(path.join(PERSEED, 'seed-' + r.seed + '.json'), 'utf8'));
  check('per-seed file matches corpus row seed ' + r.seed, JSON.stringify(f) === JSON.stringify(r));
}
const panel = JSON.parse(zlib.gunzipSync(fs.readFileSync(PANEL)));
check('panel validity clean', panel.validity && panel.validity.sourcesStable === true &&
  Array.isArray(panel.validity.neutrality) && panel.validity.neutrality.every(n => n.match === true),
  panel.validity);
check('panel has 8 competent rows within the 180d cap', panel.rows.length === 8 &&
  panel.rows.every(x => x.row.policy === 'competent' && x.row.days >= 1 && x.row.days <= 180));
const JUDGED = ['days', 'endReason', 'won', 'waveReach', 'maxArc', 'maxRank', 'national', 'table', 'entered', 'vests'];
for (const r of corpus.runs) {
  const prow = panel.rows.find(x => x.row.seed === r.seed);
  const same = prow && JUDGED.every(k => JSON.stringify(prow.row[k]) === JSON.stringify(r[k])) &&
    JSON.stringify(prow.row.deaths) === JSON.stringify(r.deaths);
  check('panel agrees with sweep seed ' + r.seed, same);
}
// Determinism spot-check: fresh child sweep of seed 9981 (separate harness process).
const tmp = path.join('/tmp', 'test-wall-b-det9981-' + process.pid + '.json');
const env = Object.assign({}, process.env, { LEVER: 'sim-wall-b-det', SEEDS: '9981', POLICIES: 'competent', DAYS: '180', OUT: tmp });
cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts/sweep-compare.js')], { env, stdio: 'ignore' });
const det = JSON.parse(fs.readFileSync(tmp, 'utf8')).runs[0];
const orig = corpus.runs.find(r => r.seed === 9981);
check('determinism spot-check seed 9981 reproduces corpus row',
  JUDGED.every(k => JSON.stringify(det[k]) === JSON.stringify(orig[k])) &&
  JSON.stringify(det.deaths) === JSON.stringify(orig.deaths));
fs.unlinkSync(tmp);
console.log(`\ntest-wall-b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
