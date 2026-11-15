// test-succpolity-b-20261114.js — proof test for the MEASUREMENT arm
// sim-succpolity-b (run fleshout-loop-b-20261114T2345Z). Levers: the
// env-gated SUCCPOLITY=1 / SUCCGRACE=1 (already in src/js/hierarchy.js,
// default OFF) against the hold — 7 dissolutions on the answercourt
// confirm band, 2 never re-climbed. Zero src/js changes: measure only.
// Policies/driver recovered byte-identical from ed6df749e; the
// succpolity policy + driver + analyzer are new, succpolity-suffixed.
// Run: node scripts/test-succpolity-b-20261114.js [--game]
//   --game runs the recorder legs (§2, one 60d sim per policy on seed
//   100201, env SUCCPOLITY=1 / SUCCGRACE=1): both policies load and
//   record, 0 instrument errors, the prSg field and the dissolution
//   episode ring are present, the env flags are recorded in the file.
// RED->GREEN: on the prereg commit §1 fails (no policies/driver/
// analyzer). On the instrument commit all legs pass.
// NOTE: national cannot stage before ~day 62 on the ladder, so the 60d
// smoke is NOT expected to stage a succgrace beat — the beat path
// itself is proven by fake-Game unit tests staging a
// pendingRenegotiation per kind, and by the pilot sweep.
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const GAME = process.argv.indexOf('--game') !== -1;
process.env.DAYS = process.env.DAYS || '60';

// The baseline policy's sha256 at commit 29a794df6 (also byte-identical
// in holdpantry commit 4f26f01c5). Any difference is an instrument error.
const BASELINE_SHA256 = '24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032';
// The armed policy's sha256 at the pilot branch tip ed6df749e (frozen lever).
const ARMED_SHA256 = '616aa98670770697fac49fba3dad06c6ec9895f16361368eaf6d757d4a25a0c2';
// Pilot instrument files at ed6df749e (recovered byte-identical; the
// succpolity-suffixed copies must keep the pilot files untouched).
const PILOT_SHA256 = {
  'scripts/answercourt-driver-20261114.js': '1257e215ff601ccbd2fa52b2aff6ed6fe12e1e36b698ecdb76b5591b8f89b7c8',
  'scripts/analyze-answercourt-b.js': 'bc1d5bbdf44ec5b28bbb79806269e2607f6366f108e2a20fbc2a99eee3af6a5b',
  'scripts/test-answercourt-b-20261114.js': 'a295c9ad9a416d6ff751cdce899103bb63232af052d301609be36a275bb3daab',
};

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------- §1 static ----------
const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-succpolity-b-prereg.md');
const preregText = (function () { try { return fs.readFileSync(preregPath, 'utf8'); } catch (e) { return ''; } })();
t('prereg exists', preregText.length > 0);
t('prereg binds G1 instrument validity', preregText.indexOf('G1 INSTRUMENT VALIDITY') !== -1);
t('prereg binds G2 the lever', preregText.indexOf('G2 THE LEVER') !== -1);
t('prereg binds G3 lever-only', preregText.indexOf('G3 LEVER-ONLY') !== -1);
t('prereg names the repro gate', preregText.indexOf('REPRO GATE') !== -1);
t('prereg records the src/js correction (Reunion arena balance)', preregText.indexOf('Reunion ARENA') !== -1 && preregText.indexOf('FALSE') !== -1);
t('prereg names the 7 known dissolution seeds', preregText.indexOf('100203, 100204') !== -1 && preregText.indexOf('100216') !== -1);
t('prereg fixes the GO bar (dissolutions <= 4 of 7 + a re-climb)', preregText.indexOf('≤ 4 of 7') !== -1 && preregText.indexOf('100203 / 100212 re-climbs') !== -1);
t('prereg fixes the cost bar (starvation <= 8, median >= 0.8x)', preregText.indexOf('≤ 8') !== -1 && preregText.indexOf('97.2d') !== -1);

const baselinePath = path.join(REPO, 'scripts', 'policies', 'competent-scaleclimb-b.js');
const baselineText = (function () { try { return fs.readFileSync(baselinePath, 'utf8'); } catch (e) { return ''; } })();
t('baseline policy exists', baselineText.length > 0);
(function () {
  let got = '';
  try { got = crypto.createHash('sha256').update(fs.readFileSync(baselinePath)).digest('hex'); } catch (e) { got = 'READ-ERROR'; }
  t('baseline policy is byte-identical to 29a794df6 (sha256)', got === BASELINE_SHA256, 'got ' + got);
  let gitHash = '';
  try {
    const buf = execSync('git show 29a794df6:scripts/policies/competent-scaleclimb-b.js', { cwd: REPO });
    gitHash = crypto.createHash('sha256').update(buf).digest('hex');
  } catch (e) { gitHash = 'GIT-ERROR'; }
  t('baseline sha256 matches the 29a794df6 blob itself', gitHash === BASELINE_SHA256, 'git ' + gitHash);
})();

// Pilot instrument files at ed6df749e: this branch does NOT carry the
// pilot files as worktree files (the succpolity driver is a renamed
// derivative, the analyzer is new) — so the check is the recovery
// source itself: each pilot blob's sha256 at ed6df749e.
(function () {
  for (const f of Object.keys(PILOT_SHA256)) {
    let gitHash = '';
    try {
      const buf = execSync('git show ed6df749e:' + f, { cwd: REPO });
      gitHash = crypto.createHash('sha256').update(buf).digest('hex');
    } catch (e) { gitHash = 'GIT-ERROR'; }
    t('pilot blob sha256 matches ed6df749e: ' + f, gitHash === PILOT_SHA256[f], 'git ' + gitHash);
  }
})();

const policyPath = path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b.js');
const policyText = (function () { try { return fs.readFileSync(policyPath, 'utf8'); } catch (e) { return ''; } })();
t('armed policy exists', policyText.length > 0);
(function () {
  let got = '';
  try { got = crypto.createHash('sha256').update(fs.readFileSync(policyPath)).digest('hex'); } catch (e) { got = 'READ-ERROR'; }
  t('armed policy is byte-identical to ed6df749e (sha256)', got === ARMED_SHA256, 'got ' + got);
  let gitHash = '';
  try {
    const buf = execSync('git show ed6df749e:scripts/policies/competent-answercourt-b.js', { cwd: REPO });
    gitHash = crypto.createHash('sha256').update(buf).digest('hex');
  } catch (e) { gitHash = 'GIT-ERROR'; }
  t('armed sha256 matches the ed6df749e blob itself', gitHash === ARMED_SHA256, 'git ' + gitHash);
})();
t('armed policy answers NO renegotiation beats (grep)', policyText.indexOf('Renegotiation') === -1 && policyText.indexOf('renegotiation') === -1);

const spPath = path.join(REPO, 'scripts', 'policies', 'competent-succpolity-b.js');
const spText = (function () { try { return fs.readFileSync(spPath, 'utf8'); } catch (e) { return ''; } })();
t('succpolity policy exists', spText.length > 0);
t('succpolity policy answers ONLY succgrace beats', spText.indexOf('pendingRenegotiation.succgrace') !== -1);
t('succpolity policy answers with the gift', spText.indexOf("answerRenegotiation(link.id, 'gift')") !== -1);
t('succpolity policy never chooses wait', spText.indexOf("'wait'") === -1 || spText.indexOf("answerRenegotiation(link.id, 'wait')") === -1);
t('succpolity policy composes onto answercourt', spText.indexOf("require('./competent-answercourt-b')") !== -1);
t('succpolity policy exports succpolityStats + reset + answerSuccgraceBeats', spText.indexOf('succpolityStats') !== -1 && spText.indexOf('resetSuccpolityStats') !== -1 && spText.indexOf('answerSuccgraceBeats') !== -1);
t('succpolity policy draws no RNG', spText.indexOf('Math.random(') === -1);

const driverPath = path.join(REPO, 'scripts', 'succpolity-driver-20261114.js');
const driverText = (function () { try { return fs.readFileSync(driverPath, 'utf8'); } catch (e) { return ''; } })();
t('driver exists', driverText.length > 0);
t('driver records prSg in the link roll', driverText.indexOf('prSg:') !== -1);
t('driver feeds the dissolution episode ring', driverText.indexOf('createLinkCapture') !== -1 && driverText.indexOf('dissolutionLines:') !== -1);
t('driver records env flags in the record', driverText.indexOf("env: { SUCCPOLITY:") !== -1 && driverText.indexOf('SUCCGRACE:') !== -1);
t('driver loads the succpolity policy', driverText.indexOf('competent-succpolity-b') !== -1);
t('driver loads the answercourt policy', driverText.indexOf('competent-answercourt-b') !== -1);
t('driver loads the scaleclimb baseline', driverText.indexOf('competent-scaleclimb-b') !== -1);
t('driver wraps answerRenegotiation', driverText.indexOf("wrapVerb('answerRenegotiation'") !== -1);
t('driver exports oneRun', driverText.indexOf('module.exports = { oneRun: oneRun }') !== -1);

const analyzerPath = path.join(REPO, 'scripts', 'analyze-succpolity-b.js');
const analyzerText = (function () { try { return fs.readFileSync(analyzerPath, 'utf8'); } catch (e) { return ''; } })();
t('analyzer exists', analyzerText.length > 0);
t('analyzer exports dissolutionEvents + reclimbEvents + succgraceAccounting + analyze', analyzerText.indexOf('dissolutionEvents: dissolutionEvents') !== -1 && analyzerText.indexOf('succgraceAccounting: succgraceAccounting') !== -1 && analyzerText.indexOf('analyze: analyze') !== -1);
t('analyzer counts dissolutions as series events', analyzerText.indexOf("sc === 'regional'") !== -1);
t('analyzer judges the GO bar (<= 4 of 7 + re-climb)', analyzerText.indexOf('dissCount <= 4') !== -1 && analyzerText.indexOf('reclimbed.length >= 1') !== -1);
t('analyzer reads the corpus baseline dir', analyzerText.indexOf('perseed-answercourt-confirm-b') !== -1);
t('analyzer writes the succpolity analysis file', analyzerText.indexOf('succpolity-b-analysis.json') !== -1);

const panelPath = path.join(REPO, 'scripts', 'build-succpolity-panels-20261114.js');
const panelText = (function () { try { return fs.readFileSync(panelPath, 'utf8'); } catch (e) { return ''; } })();
t('panel builder exists', panelText.length > 0);
t('panel builder uses the confirm band 100201-100216', panelText.indexOf('100201') !== -1 && panelText.indexOf('100216') !== -1);
t('panel builder reads the corpus armed leg as before', panelText.indexOf('perseed-answercourt-confirm-b') !== -1);
t('panel builder reads the succpolity per-seed dir as after', panelText.indexOf('perseed-succpolity-b') !== -1);
t('panel builder takes --leg/--policy', panelText.indexOf("'--leg'") !== -1 && panelText.indexOf("'--policy'") !== -1);

// G3 (static leg): zero src/js changes on this branch vs master.
(function () {
  let names = '';
  try { names = execSync('git diff --name-only master...HEAD -- src/js', { cwd: REPO }).toString().trim(); } catch (e) { names = 'GIT-ERROR'; }
  t('G3 static: no src/js files differ from master', names === '', names ? names.slice(0, 200) : '');
})();

// answerSuccgraceBeats() unit legs (fake Game — no game load): one
// staged pendingRenegotiation per kind, plus the guards.
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'policies', 'competent-succpolity-b')); } catch (e) { /* policy missing: RED */ }
  t('succpolity policy module loads', mod && typeof mod.answerSuccgraceBeats === 'function' && typeof mod.succpolityStats === 'function');
  if (!mod) return;
  function fakeGame(pending) {
    const calls = [];
    return {
      calls: calls,
      over: false,
      state: { scholar: { day: 90 }, village: { pantry: [{ kcalEach: 1500, units: 2 }] } },
      hierarchyState: function () {
        return [{ id: 'link_x', status: 'active', primary: 'haven', subordinate: 'village_0', pendingRenegotiation: pending }];
      },
      answerRenegotiation: function (id, how) { calls.push({ id: id, how: how }); return 'gift'; },
    };
  }
  // succgrace beat: answered gift, counted once
  mod.resetSuccpolityStats();
  const fg = fakeGame({ day: 89, sub: false, succgrace: true });
  t('answerSuccgraceBeats: succgrace beat answered', mod.answerSuccgraceBeats(fg, {}) === 1 && fg.calls.length === 1 && fg.calls[0].how === 'gift', JSON.stringify(fg.calls));
  t('answerSuccgraceBeats: succgrace beat counted once', mod.succpolityStats().succgraceAnswers === 1 && mod.succpolityStats().succgraceBeatsSeen === 1, JSON.stringify(mod.succpolityStats()));
  // young-link beat: NOT answered, counted as seen
  mod.resetSuccpolityStats();
  const fy = fakeGame({ day: 89, sub: false });
  t('answerSuccgraceBeats: young-link beat NOT answered', mod.answerSuccgraceBeats(fy, {}) === 0 && fy.calls.length === 0, JSON.stringify(fy.calls));
  t('answerSuccgraceBeats: young-link beat counted as seen-not-answered', mod.succpolityStats().youngBeatsSeen === 1 && mod.succpolityStats().succgraceAnswers === 0, JSON.stringify(mod.succpolityStats()));
  // no beat pending: no-op
  mod.resetSuccpolityStats();
  const fn = fakeGame(null);
  // hierarchyState returns a link with pendingRenegotiation null — the
  // fake above passes pending=null, so the link is skipped.
  t('answerSuccgraceBeats: no beat -> 0, no call', mod.answerSuccgraceBeats(fn, {}) === 0 && fn.calls.length === 0);
  // stats reset
  mod.resetSuccpolityStats();
  const st0 = mod.succpolityStats();
  t('succpolityStats: zeroed after reset', st0.succgraceAnswers === 0 && st0.succgraceBeatsSeen === 0 && st0.youngBeatsSeen === 0 && st0.errors === 0);
})();

// Episode-ring leg: a dissolution line pushed after 200 filler lines is
// retained in the episode ring and absent from the capped general buffer.
(function () {
  let cap = null;
  try { cap = require(path.join(REPO, 'scripts', 'linklines-capture')).createLinkCapture({ cap: 150, episodeCap: 60 }); } catch (e) { /* missing: RED */ }
  t('linklines-capture module loads', cap && typeof cap.push === 'function');
  if (!cap) return;
  for (let i = 0; i < 200; i++) cap.push(50 + i, 'The villagers eat a village meal together.');
  cap.push(120, '◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again.');
  t('episode ring retains the dissolution line past filler', cap.episodeLines.length === 1 && /realm came apart/.test(cap.episodeLines[0].line), 'episodeLines=' + cap.episodeLines.length);
  t('general buffer keeps the cap (meal lines filtered by the driver regex, not the ring)', cap.linkLines.length <= 150, 'linkLines=' + cap.linkLines.length);
})();

// Analyzer unit legs on synthetic records.
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'analyze-succpolity-b')); } catch (e) { /* analyzer missing: RED */ }
  t('analyzer module loads', mod && typeof mod.dissolutionEvents === 'function' && typeof mod.succgraceAccounting === 'function' && typeof mod.analyze === 'function');
  if (!mod) return;
  const S = function (d, scale, prSg) {
    return { d: d, scale: scale, dip: 0,
      linksRoll: [{ id: 'link_x', o: 'ov1', k: 'link', p: 'haven', sub: 'ov1', st: 'active', t: 45, f: 10, age: d - 10, cq: 0, ar: 0, tw: 0, pd: null, pr: prSg ? 1 : 0, prSg: prSg ? 1 : 0, se: 1, rp: 1 }] };
  };
  // Dissolve d90, re-climb d110, dissolve again d130: 2 events.
  const series = [];
  for (let d = 60; d <= 150; d++) {
    const scale = (d >= 62 && d < 90) || (d >= 110 && d < 130) ? 'national' : 'regional';
    series.push(S(d, scale, 0));
  }
  const rec = { seed: 100203, policy: 'synthetic', run: 'synthetic', series: series, verbEvents: [], deaths: [], linkLines: [], dissolutionLines: [] };
  const diss = mod.dissolutionEvents(rec);
  t('dissolutionEvents: counts BOTH dissolutions (re-climb does not erase)', diss.length === 2 && diss[0].day === 90 && diss[1].day === 130, JSON.stringify(diss));
  t('reclimbEvents: counts the re-climb', mod.reclimbEvents(rec).length === 1 && mod.reclimbEvents(rec)[0].day === 110, JSON.stringify(mod.reclimbEvents(rec)));
  // Succgrace accounting: beat stages d88 (prSg 0->1), answered d89 gift.
  const series2 = [];
  for (let d = 80; d <= 100; d++) {
    series2.push(S(d, 'national', (d === 88) ? 1 : 0));
  }
  const rec2 = { seed: 100203, policy: 'synthetic', run: 'synthetic', series: series2,
    verbEvents: [{ day: 89, verb: 'answerRenegotiation', caller: 'policy', linkId: 'link_x', other: 'ov1', before: 33, after: 41, dTrust: 8, result: 'gift' }],
    deaths: [], linkLines: [], dissolutionLines: [],
    capSummary: { succpolity: { succgraceAnswers: 1, succgraceBeatsSeen: 1, youngBeatsSeen: 0 } } };
  const sg = mod.succgraceAccounting(rec2);
  t('succgraceAccounting: staged beat counted', sg.stagedCount === 1 && sg.staged[0].day === 88, JSON.stringify(sg.staged));
  t('succgraceAccounting: gift answer joined to the staged beat', sg.answeredCount === 1 && sg.answeredStagedCount === 1, 'answered=' + sg.answeredCount + ' stagedAnswered=' + sg.answeredStagedCount);
  t('succgraceAccounting: staged = answered + lapsed + pending (accounted)', sg.accounted === sg.stagedCount, 'accounted=' + sg.accounted + ' staged=' + sg.stagedCount);
  t('succgraceAccounting: 0 young answers', sg.youngAnswersCount === 0);
  t('succgraceAccounting: policy stats agree with the join', sg.policySuccgraceAnswers === 1 && sg.policySuccgraceBeatsSeen === 1, JSON.stringify({ a: sg.policySuccgraceAnswers, s: sg.policySuccgraceBeatsSeen }));
  // Young-link answer: an answerRenegotiation on a link-day with prSg=0
  // on the answer day AND the day before is a violation.
  const series3 = [];
  for (let d = 80; d <= 100; d++) series3.push(S(d, 'national', 0));
  const rec3 = { seed: 100203, policy: 'synthetic', run: 'synthetic', series: series3,
    verbEvents: [{ day: 89, verb: 'answerRenegotiation', caller: 'policy', linkId: 'link_x', other: 'ov1', before: 33, after: 41, dTrust: 8, result: 'gift' }],
    deaths: [], linkLines: [], dissolutionLines: [], capSummary: {} };
  t('succgraceAccounting: young-link answer flagged', mod.succgraceAccounting(rec3).youngAnswersCount === 1, JSON.stringify(mod.succgraceAccounting(rec3).youngAnswers));
  // Lapsed beat: stages d88, never answered, prSg back to 0 by d95.
  const series4 = [];
  for (let d = 80; d <= 100; d++) series4.push(S(d, 'national', (d === 88) ? 1 : 0));
  const rec4 = { seed: 100203, policy: 'synthetic', run: 'synthetic', series: series4,
    verbEvents: [], deaths: [], linkLines: [], dissolutionLines: [], capSummary: {} };
  const sg4 = mod.succgraceAccounting(rec4);
  t('succgraceAccounting: unanswered beat lapses (staged = lapsed)', sg4.stagedCount === 1 && sg4.lapsedCount === 1 && sg4.accounted === 1, JSON.stringify({ staged: sg4.stagedCount, lapsed: sg4.lapsedCount }));
})();

console.log('§1 static: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
if (!GAME) { console.log('static green; re-run with --game for the recorder legs'); process.exit(0); }

// ---------- §2 game: recorder legs on seed 100201, 60d smoke ----------
async function gameLevel() {
  let gpass = 0, gfail = 0;
  function gt(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS ' + name); }
    else { gfail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const { oneRun } = require(path.join(REPO, 'scripts', 'succpolity-driver-20261114'));
  const REQUIRED = ['d', 'scale', 'stRaw', 'war', 'dip', 'plenty', 'links', 'linksRoll', 'nActive', 'nSeasoned', 'nCounted', 'polity', 'havenPolity', 'pantry', 'drive', 'pop', 'pendingNational', 'pendingGlobal', 'nationalLive'];
  // Leg (a) env: SUCCPOLITY=1, answercourt policy.
  process.env.SUCCPOLITY = '1';
  delete process.env.SUCCGRACE;
  const ra = await oneRun(100201, 'competent-answercourt-b');
  gt('leg-a-100201: series covers the smoke run (' + ra.series.length + ' days)', ra.series.length >= 50, 'days=' + ra.days);
  gt('leg-a-100201: every snapshot carries the required fields', ra.series.every(function (s) { return REQUIRED.every(function (k) { return s[k] !== undefined; }); }));
  gt('leg-a-100201: every link-roll entry carries prSg', ra.series.every(function (s) { return (s.linksRoll || []).every(function (l) { return l.prSg !== undefined; }); }));
  gt('leg-a-100201: dissolutionLines field present (episode ring)', Array.isArray(ra.dissolutionLines), typeof ra.dissolutionLines);
  gt('leg-a-100201: env recorded (SUCCPOLITY=1)', ra.env && ra.env.SUCCPOLITY === '1', JSON.stringify(ra.env));
  gt('leg-a-100201: 0 instrument errors', (ra.instrumentErrors || []).length === 0, JSON.stringify(ra.instrumentErrors).slice(0, 300));
  gt('leg-a-100201: no renegotiation answers before any beat stages', (ra.verbEvents || []).filter(function (ev) { return ev.verb === 'answerRenegotiation'; }).length === 0);
  console.log('  [leg-a 100201] days=' + ra.days + ' end=' + ra.endReason + ' won=' + ra.won + ' dip=' + (ra.series[ra.series.length - 1].dip | 0) + ' natAns=' + (ra.verbEvents || []).filter(function (ev) { return ev.verb === 'answerNationalChoice'; }).length);
  // Legs (b/c) env: SUCCGRACE=1, succpolity policy.
  process.env.SUCCGRACE = '1';
  delete process.env.SUCCPOLITY;
  const rb = await oneRun(100201, 'competent-succpolity-b');
  gt('leg-b-100201: series covers the smoke run (' + rb.series.length + ' days)', rb.series.length >= 50, 'days=' + rb.days);
  gt('leg-b-100201: every snapshot carries the required fields', rb.series.every(function (s) { return REQUIRED.every(function (k) { return s[k] !== undefined; }); }));
  gt('leg-b-100201: every link-roll entry carries prSg', rb.series.every(function (s) { return (s.linksRoll || []).every(function (l) { return l.prSg !== undefined; }); }));
  gt('leg-b-100201: dissolutionLines field present (episode ring)', Array.isArray(rb.dissolutionLines), typeof rb.dissolutionLines);
  gt('leg-b-100201: env recorded (SUCCGRACE=1)', rb.env && rb.env.SUCCGRACE === '1', JSON.stringify(rb.env));
  gt('leg-b-100201: 0 instrument errors', (rb.instrumentErrors || []).length === 0, JSON.stringify(rb.instrumentErrors).slice(0, 300));
  gt('leg-b-100201: succpolity stats recorded', !!(rb.capSummary && rb.capSummary.succpolity) && typeof rb.capSummary.succpolity.succgraceAnswers === 'number', JSON.stringify(rb.capSummary && rb.capSummary.succpolity));
  gt('leg-b-100201: answercourt stats recorded alongside', !!(rb.capSummary && rb.capSummary.answercourt) && typeof rb.capSummary.answercourt.nationalAnswers === 'number');
  gt('leg-b-100201: no renegotiation answers before any beat stages', (rb.verbEvents || []).filter(function (ev) { return ev.verb === 'answerRenegotiation'; }).length === 0);
  console.log('  [leg-b 100201] days=' + rb.days + ' end=' + rb.endReason + ' won=' + rb.won + ' dip=' + (rb.series[rb.series.length - 1].dip | 0) + ' natAns=' + (rb.verbEvents || []).filter(function (ev) { return ev.verb === 'answerNationalChoice'; }).length);
  console.log('§2 game: ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
