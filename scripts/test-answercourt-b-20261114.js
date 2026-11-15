// test-answercourt-b-20261114.js — proof test for the BUILD arm
// sim-answercourt-b (run fleshout-loop-b-20261114T1945Z). Lever: isolate
// the First Court answer — scaleclimb + answerNationalChoice on EVERY
// staged national beat (lead feast / conquest mercy / belong swear /
// covenant pact / trade sign), nothing else — and measure national EVER
// before/after on identical seeds.
// Run: node scripts/test-answercourt-b-20261114.js [--game]
//   --game runs the recorder legs (§2, one 60d sim per policy on seed
//   100101): the armed leg courts and answers (if a beat stages), the
//   baseline leg answers nothing; 0 instrument errors, every link
//   classified, 0 unattributed diplomacy points (up AND down).
// RED->GREEN: on the prereg commit §1 fails (no policy/driver/analyzer).
// On the instrument commit all legs pass.
// NOTE: national cannot stage before ~day 62 on the ladder, so the 60d
// smoke is NOT expected to stage a beat — the answer path itself is
// proven by fake-Game unit tests staging a pendingNational per shape.
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

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------- §1 static ----------
const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-answercourt-b-prereg.md');
const preregText = (function () { try { return fs.readFileSync(preregPath, 'utf8'); } catch (e) { return ''; } })();
t('prereg exists', preregText.length > 0);
t('prereg binds G1 instrument validity', preregText.indexOf('G1 INSTRUMENT VALIDITY') !== -1);
t('prereg binds G2 the lever', preregText.indexOf('G2 THE LEVER') !== -1);
t('prereg binds G3 lever-only', preregText.indexOf('G3 LEVER-ONLY') !== -1);
t('prereg names the pilot band 100101-100108', preregText.indexOf('100101') !== -1 && preregText.indexOf('100108') !== -1);
t('prereg names the national-ever bar', preregText.indexOf('NATIONAL EVER') !== -1);
t('prereg pre-registers the per-shape answer map', preregText.indexOf("lead     | 'feast'") !== -1 && preregText.indexOf("belong   | 'swear'") !== -1);
t('prereg records the fresh-band check (0 hits)', preregText.indexOf('0 hits') !== -1);
t('prereg records the env (all three flags unset)', preregText.indexOf('ANSWERMAIL_DRIVE unset') !== -1);

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

const policyPath = path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b.js');
const policyText = (function () { try { return fs.readFileSync(policyPath, 'utf8'); } catch (e) { return ''; } })();
t('armed policy exists', policyText.length > 0);
t('armed policy maps lead->feast', /lead:\s*'feast'/.test(policyText));
t('armed policy maps conquest->mercy', /conquest:\s*'mercy'/.test(policyText));
t('armed policy maps belong->swear', /belong:\s*'swear'/.test(policyText));
t('armed policy maps covenant->pact', /covenant:\s*'pact'/.test(policyText));
t('armed policy maps trade->sign', /trade:\s*'sign'/.test(policyText));
t('armed policy answers national beats', policyText.indexOf('answerNationalChoice') !== -1);
t('armed policy never answers global beats', policyText.indexOf('Game.answerGlobalChoice') === -1 && policyText.indexOf("answerGlobalChoice('") === -1);
t('armed policy has no banking step', policyText.indexOf('forageTripSeedFirst') === -1 && policyText.indexOf('donateSurplus') === -1 && policyText.indexOf('sortHaul') === -1 && policyText.indexOf('cookPack') === -1);
t('armed policy never takes the seat (out of scope)', policyText.indexOf('Game.tableTakeSeat') === -1);
t('armed policy delegates courtship to scaleclimb (no own propose/tend)', policyText.indexOf('Game.proposeLink') === -1 && policyText.indexOf('Game.tendLink') === -1 && policyText.indexOf('Game.answerAccord') === -1);
t('armed policy never chooses refuse/walk', policyText.indexOf("answerNationalChoice('refuse')") === -1 && policyText.indexOf("answerNationalChoice('walk')") === -1 && !/NATIONAL_ANSWERS = \{[^}]*'(refuse|walk)'/.test(policyText));
t('armed policy composes onto scaleclimb', policyText.indexOf("require('./competent-scaleclimb-b')") !== -1);
t('armed policy exports answercourtStats + reset + answerNationalBeat', policyText.indexOf('answercourtStats') !== -1 && policyText.indexOf('resetAnswercourtStats') !== -1 && policyText.indexOf('answerNationalBeat') !== -1);
t('armed policy draws no RNG', policyText.indexOf('Math.random(') === -1);

const driverPath = path.join(REPO, 'scripts', 'answercourt-driver-20261114.js');
const driverText = (function () { try { return fs.readFileSync(driverPath, 'utf8'); } catch (e) { return ''; } })();
t('driver exists', driverText.length > 0);
t('driver wraps answerNationalChoice with shape capture', driverText.indexOf('wrapNationalChoice') !== -1 && driverText.indexOf('pendingNational') !== -1);
t('driver snapshots pendingNational + nationalLive', driverText.indexOf('pendingNational:') !== -1 && driverText.indexOf('nationalLive:') !== -1);
t('driver wraps tendLink', driverText.indexOf("wrapVerb('tendLink'") !== -1);
t('driver wraps proposeLink', driverText.indexOf("wrapVerb('proposeLink'") !== -1);
t('driver wraps answerAccord', driverText.indexOf("wrapVerb('answerAccord'") !== -1);
t('driver snapshots the link roll', driverText.indexOf('linksRoll') !== -1);
t('driver loads the answercourt policy', driverText.indexOf('competent-answercourt-b') !== -1);
t('driver loads the scaleclimb baseline', driverText.indexOf('competent-scaleclimb-b') !== -1);
t('driver exports oneRun', driverText.indexOf('module.exports = { oneRun: oneRun }') !== -1);

const analyzerPath = path.join(REPO, 'scripts', 'analyze-answercourt-b.js');
const analyzerText = (function () { try { return fs.readFileSync(analyzerPath, 'utf8'); } catch (e) { return ''; } })();
t('analyzer exists', analyzerText.length > 0);
t('analyzer exports classifyLink + attribute + analyze', analyzerText.indexOf('module.exports = { linkTrajectories: linkTrajectories, classifyLink: classifyLink, attribute: attribute, analyze: analyze }') !== -1);
t('analyzer tracks nationalEver + nationalHeldDays', analyzerText.indexOf('nationalEver') !== -1 && analyzerText.indexOf('nationalHeldDays') !== -1);
t('analyzer attributes dip steps by episode (up + down)', analyzerText.indexOf('dipDownSteps') !== -1 && analyzerText.indexOf('episodes') !== -1);
t('analyzer counts starvation deaths', analyzerText.indexOf('starvationDeaths') !== -1);

const panelPath = path.join(REPO, 'scripts', 'build-answercourt-panels-20261114.js');
const panelText = (function () { try { return fs.readFileSync(panelPath, 'utf8'); } catch (e) { return ''; } })();
t('panel builder exists', panelText.length > 0);
t('panel builder uses the fresh band 100101-100108', panelText.indexOf('100101') !== -1 && panelText.indexOf('100108') !== -1);
t('panel builder compares scaleclimb -> answercourt', panelText.indexOf("load('competent-scaleclimb-b')") !== -1 && panelText.indexOf("load('competent-answercourt-b')") !== -1);

// G3 (static leg): zero src/js changes on this branch vs master.
(function () {
  let names = '';
  try { names = execSync('git diff --name-only master...HEAD -- src/js', { cwd: REPO }).toString().trim(); } catch (e) { names = 'GIT-ERROR'; }
  t('G3 static: no src/js files differ from master', names === '', names ? names.slice(0, 200) : '');
})();

// answerNationalBeat() unit legs (fake Game — no game load): one
// staged pendingNational per shape, plus the guards.
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b')); } catch (e) { /* policy missing: RED */ }
  t('armed policy module loads', mod && typeof mod.answerNationalBeat === 'function' && typeof mod.answercourtStats === 'function');
  if (!mod) return;
  const EXPECTED = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' };
  for (const shape of Object.keys(EXPECTED)) {
    mod.resetAnswercourtStats();
    const calls = [];
    const fake = {
      over: false,
      state: { scholar: { day: 70 }, pendingNational: { shape: shape, primary: 'village_0', villages: ['haven', 'village_0'], day: 69 } },
      answerNationalChoice: function (how) { calls.push(how); return true; },
    };
    const ret = mod.answerNationalBeat(fake, {});
    t('answerNationalBeat: ' + shape + ' -> ' + EXPECTED[shape], ret === EXPECTED[shape] && calls.length === 1 && calls[0] === EXPECTED[shape], 'ret=' + ret + ' calls=' + JSON.stringify(calls));
    const st = mod.answercourtStats();
    t('answerNationalBeat: ' + shape + ' counted once', st.nationalAnswers === 1 && st.nationalAnswersByShape[shape] === 1, JSON.stringify(st.nationalAnswersByShape));
  }
  // unknown shape: not answered, counted as an error
  mod.resetAnswercourtStats();
  const callsU = [];
  const fakeU = {
    over: false,
    state: { scholar: { day: 70 }, pendingNational: { shape: 'mystery', day: 69 } },
    answerNationalChoice: function (how) { callsU.push(how); return true; },
  };
  t('answerNationalBeat: unknown shape not answered', mod.answerNationalBeat(fakeU, {}) === 'unknown-shape' && callsU.length === 0);
  t('answerNationalBeat: unknown shape counts an error', mod.answercourtStats().nationalUnknownShape === 1 && mod.answercourtStats().errors === 1);
  // no beat pending: null, no call
  mod.resetAnswercourtStats();
  const callsN = [];
  const fakeN = { over: false, state: { scholar: { day: 70 } }, answerNationalChoice: function (h) { callsN.push(h); return true; } };
  t('answerNationalBeat: no beat -> null, no call', mod.answerNationalBeat(fakeN, {}) === null && callsN.length === 0);
  // global pending is observed, never answered
  mod.resetAnswercourtStats();
  const callsG = [];
  const fakeG = {
    over: false,
    state: { scholar: { day: 70 }, pendingGlobal: { viewership: 33, day: 69 } },
    answerNationalChoice: function (h) { callsG.push(h); return true; },
    answerGlobalChoice: function (h) { callsG.push('GLOBAL:' + h); return true; },
  };
  mod.answerNationalBeat(fakeG, {});
  t('answerNationalBeat: global beat observed, never answered', mod.answercourtStats().globalPendingDays === 1 && callsG.length === 0, JSON.stringify(callsG));
  // stats reset + shape
  mod.resetAnswercourtStats();
  const st0 = mod.answercourtStats();
  t('answercourtStats: zeroed after reset', st0.nationalAnswers === 0 && st0.pendingNationalDays === 0 && st0.errors === 0 && st0.nationalAnswersByShape.lead === 0);
})();

// classifyLink() + attribute() unit legs on synthetic records,
// including a FLICKERING link (count -> un-count -> re-count) — the
// episode attribution must name every step in both directions.
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'analyze-answercourt-b')); } catch (e) { /* analyzer missing: RED */ }
  t('analyzer module loads', mod && typeof mod.classifyLink === 'function' && typeof mod.attribute === 'function');
  if (!mod) return;
  const T = function (entries) { return { id: 'link_x', other: 'ov1', kind: 'link', primary: 'haven', conquered: false, formedDay: 10, entries: entries }; };
  const E = function (d, trust, age, status, seasoned, counted) {
    return { d: d, trust: trust, age: age, status: status, seasoned: seasoned, counted: counted, arrears: 0, tendedWeek: 0 };
  };
  t('classifyLink: seasoned-and-counted', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(45, 48, 35, 'active', true, true)]), { verbEvents: [] }) === 'seasoned-and-counted');
  t('classifyLink: never-seasoned-trust names the trust', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(60, 33, 50, 'active', false, false)]), { verbEvents: [] }) === 'never-seasoned-trust<33');
  // Flicker record: link counted d40-50 (dip 102), un-counted d51-60
  // (dip 0), re-counted d61-70 (dip 102). One counted link = 34 dip per
  // counted link; 3 links counted at once here is faked by dip 102 with
  // a single link trajectory — the episode math uses 34/link, so use
  // dip 34 for one link to keep the synthetic honest.
  const series = [];
  for (let d = 40; d <= 70; d++) {
    const counted = (d >= 40 && d <= 50) || (d >= 61 && d <= 70);
    series.push({
      d: d, dip: counted ? 34 : 0, scale: 'regional',
      linksRoll: [{ id: 'link_x', o: 'ov1', k: 'link', p: 'haven', sub: 'ov1', st: 'active', t: counted ? 45 : 33, f: 10, age: d - 10, cq: 0, ar: 0, tw: 0, pd: null, pr: 0, se: counted, rp: counted }],
    });
  }
  const rec = { seed: 1, policy: 'synthetic', series: series, verbEvents: [], deaths: [] };
  const at = mod.attribute(rec);
  t('attribute: flicker up-steps attributed', at.totalUp === 68 && at.unattributedUp === 0, 'totalUp=' + at.totalUp + ' unattrUp=' + at.unattributedUp);
  t('attribute: flicker down-step attributed', at.totalDown === 34 && at.unattributedDown === 0, 'totalDown=' + at.totalDown + ' unattrDown=' + at.unattributedDown);
  t('attribute: flicker telescoping holds', at.telescopeGap === 0 && at.endDip === 34, 'gap=' + at.telescopeGap + ' endDip=' + at.endDip);
  t('attribute: flicker 0 unattributed total', at.unattributed === 0, 'unattributed=' + at.unattributed);
  t('attribute: two counting episodes', (at.episodes.link_x || []).length === 2, JSON.stringify(at.episodes.link_x));
})();

console.log('§1 static: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
if (!GAME) { console.log('static green; re-run with --game for the recorder legs'); process.exit(0); }

// ---------- §2 game: recorder legs on seed 100101, 60d smoke ----------
async function gameLevel() {
  let gpass = 0, gfail = 0;
  function gt(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS ' + name); }
    else { gfail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const { oneRun } = require(path.join(REPO, 'scripts', 'answercourt-driver-20261114'));
  const { attribute } = require(path.join(REPO, 'scripts', 'analyze-answercourt-b'));
  const REQUIRED = ['d', 'scale', 'stRaw', 'war', 'dip', 'plenty', 'links', 'linksRoll', 'nActive', 'nSeasoned', 'nCounted', 'polity', 'havenPolity', 'pantry', 'drive', 'pop', 'pendingNational', 'pendingGlobal', 'nationalLive'];
  for (const pol of ['competent-scaleclimb-b', 'competent-answercourt-b']) {
    const r = await oneRun(100101, pol);
    gt(pol + ': series covers the smoke run (' + r.series.length + ' days)', r.series.length >= 50, 'days=' + r.days);
    gt(pol + ': series days strictly increasing', r.series.every(function (s, i) { return i === 0 || s.d > r.series[i - 1].d; }));
    gt(pol + ': every snapshot carries the required fields', r.series.every(function (s) { return REQUIRED.every(function (k) { return s[k] !== undefined; }); }));
    gt(pol + ': every snapshot carries a link roll array', r.series.every(function (s) { return Array.isArray(s.linksRoll); }));
    gt(pol + ': 0 instrument errors', (r.instrumentErrors || []).length === 0, JSON.stringify(r.instrumentErrors).slice(0, 300));
    const at = attribute(r);
    const uncls = at.links.filter(function (l) { return l.cls === 'UNCLASSIFIED'; }).length;
    gt(pol + ': every link classified (0 UNCLASSIFIED)', uncls === 0, uncls + ' unclassified of ' + at.links.length);
    gt(pol + ': 0 unattributed diplomacy points (up+down)', at.unattributed === 0, 'unattributed=' + at.unattributed + ' up=' + at.unattributedUp + ' down=' + at.unattributedDown + ' endDip=' + at.endDip);
    gt(pol + ': dip telescoping holds', at.telescopeGap === 0, 'gap=' + at.telescopeGap);
    gt(pol + ': anchorCommit recorded', typeof r.anchorCommit === 'string' && r.anchorCommit.length >= 7);
    const natCalls = (r.verbEvents || []).filter(function (ev) { return ev.verb === 'answerNationalChoice'; }).length;
    if (pol === 'competent-answercourt-b') {
      const sc = r.capSummary || {};
      gt('armed-100101: answercourt stats recorded', !!sc.answercourt && typeof sc.answercourt.nationalAnswers === 'number', JSON.stringify(sc.answercourt));
      gt('armed-100101: scaleclimb core stats recorded', typeof sc.proposeCalls === 'number' && typeof sc.tends === 'number');
      gt('armed-100101: never took the seat (out of scope)', (r.seatTakes || []).length === 0, JSON.stringify(r.seatTakes));
      gt('armed-100101: never answered a global beat', (r.verbEvents || []).filter(function (ev) { return ev.verb === 'answerGlobalChoice'; }).length === 0);
      gt('armed-100101: national answers match verb events', (sc.answercourt.nationalAnswers | 0) === natCalls, 'stats=' + (sc.answercourt.nationalAnswers | 0) + ' events=' + natCalls);
    } else {
      gt('baseline-100101: never answered a national beat (0 calls)', natCalls === 0, 'calls=' + natCalls);
      gt('baseline-100101: never answered a global beat', (r.verbEvents || []).filter(function (ev) { return ev.verb === 'answerGlobalChoice'; }).length === 0);
      gt('baseline-100101: no answercourt stats (baseline instrument)', !r.capSummary || !r.capSummary.answercourt);
    }
    console.log('  [' + pol + ' 100101] days=' + r.days + ' end=' + r.endReason + ' won=' + r.won + ' dip=' + (r.series[r.series.length - 1].dip | 0) + ' links=' + at.links.length + ' counted=' + at.links.filter(function (l) { return l.countedDay !== null; }).length + ' natAns=' + natCalls + ' villDeaths=' + r.villagerCombatDeaths);
  }
  console.log('§2 game: ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
