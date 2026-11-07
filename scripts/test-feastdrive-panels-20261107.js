// test-feastdrive-panels-20261107.js — proof for the feastdrive §15
// panel builder (scripts/build-feastdrive-panels-20261107.js) and the
// starvation-count correction in scripts/feastdrive-analyze-20261107.js.
// Fixture tests for the metric mapping (won / national / survival /
// communityLost / villageDeaths, nulls never faked) plus a real-corpus
// smoke: both corpora complete (8 files, 0 instrument errors) and the
// compare .md exists with a decision. Run: node scripts/test-feastdrive-panels-20261107.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const BUILD = require(path.join(REPO, 'scripts', 'build-feastdrive-panels-20261107'));

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// --- fixture: panel metric mapping ---------------------------------------
const wonRow = { won: true, scaleRank: 'national', gameDays: 150, endReason: 'survived', teleDeaths: [{ kind: 'monster' }, { kind: 'villager', cause: 'starvation' }] };
const mWon = BUILD.metricsFor(wonRow);
check('panel-won', mWon.won === 1, 'won=' + mWon.won);
check('panel-national', mWon.national === 1, 'national=' + mWon.national);
check('panel-survival60', mWon.survival60 === 1, 's60=' + mWon.survival60);
check('panel-community-kept', mWon.communityLost === 0, 'lost=' + mWon.communityLost);
check('panel-village-deaths', mWon.villageDeaths === 2, 'deaths=' + mWon.villageDeaths);
check('panel-table-null', mWon.table === null, 'table must stay null, never faked');
check('panel-player-deaths-null', mWon.playerDeaths === null, 'playerDeaths must stay null');

const lostRow = { won: false, scaleRank: 'village', gameDays: 45, endReason: 'village-lost', teleDeaths: [] };
const mLost = BUILD.metricsFor(lostRow);
check('panel-lost-community', mLost.communityLost === 1, 'lost=' + mLost.communityLost);
check('panel-lost-survival60', mLost.survival60 === 0, 's60=' + mLost.survival60);
check('panel-lost-survival30', mLost.survival30 === 1, 's30=' + mLost.survival30);
check('panel-lost-won', mLost.won === 0, 'won=' + mLost.won);

// --- fixture: analyzer starvation counting ------------------------------
// The analyzer treats teleDeaths as an ARRAY of {kind, cause} records.
// Build a 2-seed fixture corpus in /tmp and assert the summary counts
// starvation deaths (the old object-index read always returned 0).
const fixDir = '/tmp/feastdrive-analyze-fixture-' + process.pid;
fs.mkdirSync(fixDir, { recursive: true });
function fixSeed(seed, deaths) {
  const o = { seed: seed, policy: 'feastdrive', days: 50, endReason: 'village-lost', won: false,
    maxWave: 4, standing: 100, scaleRank: 'village', finalSeat: { seat: 'none' },
    waveKillLog: [], daily: [{ day: 50, pairDay: false, sentimentTaught: true, spent: false }],
    teleDeaths: deaths, instrumentErrors: [], firstSpendDay: null, endFeastGate: 'armed-no-feast' };
  fs.writeFileSync(path.join(fixDir, 'feastdrive-s' + seed + '-feastdrive-armed.json'), JSON.stringify(o) + '\n');
}
fixSeed(53001, [{ kind: 'villager', cause: 'starvation' }, { kind: 'monster', cause: 'villager combat' }]);
fixSeed(53002, [{ kind: 'villager', cause: 'sickness' }]);
try {
  const out = cp.execFileSync(process.execPath, [path.join(REPO, 'scripts', 'feastdrive-analyze-20261107.js'), fixDir], { encoding: 'utf8' });
  const sum = JSON.parse(out);
  check('analyze-starve-total', sum.starveDeathsTotal === 1, 'total=' + sum.starveDeathsTotal);
  check('analyze-starve-per-seed', JSON.stringify(sum.starveDeathsPerSeed) === '[1,0]', 'per=' + JSON.stringify(sum.starveDeathsPerSeed));
} catch (e) {
  check('analyze-starve-total', false, String(e.message).slice(0, 200));
}
try { fs.rmSync(fixDir, { recursive: true, force: true }); } catch (e) {}

// --- real-corpus smoke ----------------------------------------------------
const diagDir = path.join(REPO, 'evidence', '2026-11-07', 'perseed-feastdrive-b-diag');
const armedDir = path.join(REPO, 'evidence', '2026-11-07', 'perseed-feastdrive-b-armed');
function corpusOk(dir, run) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); });
  if (files.length !== 8) return 'files=' + files.length;
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (o.run !== run) return 'run mismatch in ' + f;
    if ((o.instrumentErrors || []).length !== 0) return 'instrument errors in ' + f;
  }
  return null;
}
check('corpus-diag-complete', corpusOk(diagDir, 'feastdrive-diag') === null, corpusOk(diagDir, 'feastdrive-diag'));
check('corpus-armed-complete', corpusOk(armedDir, 'feastdrive-armed') === null, corpusOk(armedDir, 'feastdrive-armed'));
const panelMd = path.join(REPO, 'evidence', '2026-11-07', 'feastdrive-panel.md');
const panelJson = path.join(REPO, 'evidence', '2026-11-07', 'feastdrive-panel.json');
check('panel-md-exists', fs.existsSync(panelMd), 'missing feastdrive-panel.md');
if (fs.existsSync(panelJson)) {
  const rep = JSON.parse(fs.readFileSync(panelJson, 'utf8'));
  check('panel-decision-known', typeof rep.decision === 'string' && rep.decision.length > 0, 'decision=' + rep.decision);
  const pol = (rep.policies || [])[0] || {};
  check('panel-8-paired-cases', pol.cases === 8, 'cases=' + pol.cases);
} else {
  check('panel-decision-known', false, 'missing feastdrive-panel.json');
}
try {
  const before = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-07', 'feastdrive-panel-before.json.gz')), 'utf8'));
  const after = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-07', 'feastdrive-panel-after.json.gz')), 'utf8'));
  check('panel-gz-rows', before.rows.length === 8 && after.rows.length === 8, 'rows=' + before.rows.length + '/' + after.rows.length);
} catch (e) {
  check('panel-gz-rows', false, String(e.message).slice(0, 200));
}

console.log(pass + '/' + (pass + fail) + ' PASS');
process.exitCode = fail ? 1 : 0;
