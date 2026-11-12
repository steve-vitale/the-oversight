#!/usr/bin/env node
// test-mcconfirm-refresh-b.js — proof test for item (a) of
// sim-mcconfirm-refresh-b: the stale on-disk mcconfirm-ctrl summary.
//
// WHAT THIS TEST PROVES (no new sims; the corpus is already committed):
//   1. The analyzer's joint-rule inputs are the fresh-band merge leg:
//      MERGE_SEEDS = 16, MERGE_SURVIVED = 1, and its printed context
//      line renders "merge 1/16 vs control 5/16".
//   2. The on-disk summary records 16 in both places (mergeLeg.seeds
//      and jointRule.mergeSeeds) with the same 5/16 control read.
//   3. jointVerdict(1,5) = INCONCLUSIVE (merge analyzer export,
//      machine-checked; sanity: (1,8) CONFIRMED, (1,2) REFUTED).
//   4. The summary matches a fresh analyzer run end-to-end: re-running
//      the analyzer reproduces the on-disk file byte-identically
//      (the summary carries no timestamp field).
//   5. The ctrl proof's live-sha pin matches the current on-disk
//      standing.js sha (so a master move that re-shas the ROSTER CHECK
//      hunk trips this proof instead of silently passing).
//
// Usage: node scripts/test-mcconfirm-refresh-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('mcconfirm-refresh-b');
const ROOT = path.join(__dirname, '..');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const analyzerSrc = fs.readFileSync(path.join(__dirname, 'mcconfirm-ctrl-analyze-20261111.js'), 'utf8');
const SUMMARY = path.join(ROOT, 'evidence', '2026-11-11', 'mcconfirm-ctrl-b-summary.json');
const summary = JSON.parse(fs.readFileSync(SUMMARY, 'utf8'));
const MERGE = require('./mcconfirm-merge-analyze-20261111');
const proofSrc = fs.readFileSync(path.join(__dirname, 'test-mcconfirm-ctrl-b.js'), 'utf8');

// ---- 1. Analyzer constants: the fresh-band merge leg ----
T.section('1. Analyzer joint-rule inputs are the fresh-band merge leg (1/16)');
T.ok('analyzer MERGE_SEEDS = 16', /const MERGE_SEEDS = 16;/.test(analyzerSrc), 'MERGE_SEEDS=16 in source');
T.ok('analyzer MERGE_SURVIVED = 1', /const MERGE_SURVIVED = 1;/.test(analyzerSrc), 'MERGE_SURVIVED=1 in source');
T.ok('analyzer prints "merge 1/16" from its constants',
  analyzerSrc.indexOf("'  joint rule inputs: merge ' + MERGE_SURVIVED + '/' + MERGE_SEEDS") !== -1,
  'printed line built from MERGE_SURVIVED/MERGE_SEEDS');

// ---- 2. On-disk summary records 16 ----
T.section('2. On-disk summary records the 16-seed merge leg');
T.ok('summary mergeLeg.seeds = 16', summary.mergeLeg && summary.mergeLeg.seeds === 16,
  'mergeLeg=' + JSON.stringify(summary.mergeLeg));
T.ok('summary mergeLeg.survived = 1 on base e4dbe581b',
  summary.mergeLeg && summary.mergeLeg.survived === 1 && summary.mergeLeg.base === 'e4dbe581b',
  'mergeLeg=' + JSON.stringify(summary.mergeLeg));
T.ok('summary jointRule.mergeSeeds = 16', summary.jointRule && summary.jointRule.mergeSeeds === 16,
  'jointRule.mergeSeeds=' + (summary.jointRule && summary.jointRule.mergeSeeds));
T.ok('summary jointRule inputs are (1, 5) on 16 seeds',
  summary.jointRule && summary.jointRule.mergeSurvived === 1 && summary.jointRule.controlSurvived === 5 &&
  summary.jointRule.controlSeeds === 16,
  'jointRule=' + JSON.stringify(summary.jointRule));
T.ok('summary control leg still 5/16 LEG_COMPLETE, 0 instrument errors',
  summary.survived === 5 && summary.legStatus === 'LEG_COMPLETE' && summary.instrumentErrors === 0,
  'survived=' + summary.survived + ' legStatus=' + summary.legStatus + ' errors=' + summary.instrumentErrors);

// ---- 3. Joint verdict, machine-checked ----
T.section('3. jointVerdict(1,5) = INCONCLUSIVE');
T.ok('jointVerdict(1,5) = INCONCLUSIVE', MERGE.jointVerdict(1, 5) === 'INCONCLUSIVE',
  'jointVerdict(1,5)=' + MERGE.jointVerdict(1, 5));
T.ok('sanity: jointVerdict(1,8) = CONFIRMED', MERGE.jointVerdict(1, 8) === 'CONFIRMED',
  'jointVerdict(1,8)=' + MERGE.jointVerdict(1, 8));
T.ok('sanity: jointVerdict(1,2) = REFUTED', MERGE.jointVerdict(1, 2) === 'REFUTED',
  'jointVerdict(1,2)=' + MERGE.jointVerdict(1, 2));

// ---- 4. Fresh re-run reproduces the summary byte-identically ----
T.section('4. Fresh analyzer re-run reproduces the on-disk summary');
const beforeSha = sha256(SUMMARY);
const run = spawnSync(process.execPath, [path.join(__dirname, 'mcconfirm-ctrl-analyze-20261111.js')],
  { cwd: ROOT, encoding: 'utf8' });
T.ok('analyzer re-run exits 0', run.status === 0, 'exit=' + run.status + ' ' + String(run.stderr || '').slice(0, 200));
T.ok('analyzer re-run prints "merge 1/16 vs control 5/16"',
  String(run.stdout || '').indexOf('merge 1/16 vs control 5/16') !== -1,
  String(run.stdout || '').split('\n')[1] || '');
const afterSha = sha256(SUMMARY);
T.ok('summary byte-identical after the fresh re-run (no timestamp drift)',
  beforeSha === afterSha, 'before=' + beforeSha.slice(0, 12) + ' after=' + afterSha.slice(0, 12));

// ---- 5. Ctrl proof live-sha pin tracks current master ----
T.section('5. Ctrl proof live-sha pin matches current standing.js');
const liveSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'src', 'js', 'standing.js'))).digest('hex').slice(0, 12);
const liveText = fs.readFileSync(path.join(ROOT, 'src', 'js', 'standing.js'), 'utf8');
T.ok('live standing.js still carries the ROSTER CHECK marker', liveText.indexOf('ROSTER CHECK') !== -1, 'marker present');
T.ok('ctrl proof pins the live sha ' + liveSha, proofSrc.indexOf("gLive.sha === '" + liveSha + "'") !== -1,
  'proof pins sha ' + liveSha + ' (standing.js on disk)');

T.done();
