// test-diploverb-b.js — proof test for the DIAG arm sim-diplo-verb-b
// (run fleshout-loop-b-20261114T1130Z). Finding #2321 follow-up: competent's
// diplomacy standing is 0 on 16/16 runs while capable reaches median 102
// at the win. Question: which leadfeast verb seasons a link?
// This arm is INSTRUMENT-ONLY: the recorder (driver-side, in scripts/)
// attributes every diplomacy point to a named verb; zero src/js changes.
// Run: node scripts/test-diploverb-b.js [--game]  (exit 0 = all green)
//   --game runs the recorder legs (§2, one 150d sim per policy on seed
//   98801): full daily link roll, 0 instrument errors, every link
//   classified, every diplomacy point attributed, capable-98801 wins with
//   diplomacy 34 x counted links (positive) and competent-98801 dip 0
//   (the finding, on the smoke seed).
// RED->GREEN: on the prereg commit §1 fails (no driver/analyzer/test
// files, no G-bars to bind). On the instrument commit all legs pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const GAME = process.argv.indexOf('--game') !== -1;

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------- §1 static ----------
const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-diplo-verb-b-prereg.md');
const preregText = (function () { try { return fs.readFileSync(preregPath, 'utf8'); } catch (e) { return ''; } })();
t('prereg exists', preregText.length > 0);
t('prereg binds G1 instrument validity', preregText.indexOf('G1 INSTRUMENT VALIDITY') !== -1);
t('prereg binds G2 attribution', preregText.indexOf('G2 ATTRIBUTION') !== -1);
t('prereg binds G3 instrument-only', preregText.indexOf('G3 INSTRUMENT-ONLY') !== -1);
t('prereg names the pilot band 98801-98808', preregText.indexOf('98801') !== -1 && preregText.indexOf('98808') !== -1);
t('prereg names the link classification taxonomy', preregText.indexOf('seasoned-and-counted') !== -1 && preregText.indexOf('UNCLASSIFIED') !== -1);

const driverPath = path.join(REPO, 'scripts', 'diploverb-driver-20261114.js');
const driverText = (function () { try { return fs.readFileSync(driverPath, 'utf8'); } catch (e) { return ''; } })();
t('driver exists', driverText.length > 0);
t('driver wraps tendLink', driverText.indexOf("wrapVerb('tendLink'") !== -1);
t('driver wraps proposeLink', driverText.indexOf("wrapVerb('proposeLink'") !== -1);
t('driver wraps answerAccord', driverText.indexOf("wrapVerb('answerAccord'") !== -1);
t('driver wraps breakLink', driverText.indexOf("wrapVerb('breakLink'") !== -1);
t('driver wraps _formLink formations', driverText.indexOf("wrapForm('_formLink')") !== -1);
t('driver snapshots the link roll', driverText.indexOf('linksRoll') !== -1);
t('driver tags caller policy vs engine', driverText.indexOf("caller: inDaily ? 'policy' : 'engine'") !== -1);
t('driver exports oneRun', driverText.indexOf('module.exports = { oneRun: oneRun }') !== -1);

const analyzerPath = path.join(REPO, 'scripts', 'analyze-diploverb-b.js');
const analyzerText = (function () { try { return fs.readFileSync(analyzerPath, 'utf8'); } catch (e) { return ''; } })();
t('analyzer exists', analyzerText.length > 0);
t('analyzer exports classifyLink + attribute + analyze', analyzerText.indexOf('module.exports = { linkTrajectories: linkTrajectories, classifyLink: classifyLink, attribute: attribute, analyze: analyze }') !== -1);

// The gated reads must never be called by the recorder's snapshot: extract
// the snapshot() body and assert it contains neither gated name.
(function () {
  const m = /function snapshot\(Game, errors\) \{([\s\S]*?)\n\}\n/.exec(driverText);
  const body = m ? m[1] : null;
  t('snapshot() body is present', body != null);
  if (body) {
    t('snapshot() never calls villageStandingTotal (gated, side-effecting)', body.indexOf('villageStandingTotal') === -1);
    t('snapshot() never calls unlockedWave (gated, side-effecting)', body.indexOf('unlockedWave') === -1);
    t('snapshot() reads the pure raw breakdown villageStanding()', body.indexOf('Game.villageStanding()') !== -1);
    t('snapshot() reads the live link roll hierarchyState()', body.indexOf('Game.hierarchyState()') !== -1);
    t('snapshot() reads seasoned + regional+ per link', body.indexOf('Game._linkSeasoned') !== -1 && body.indexOf('Game._linkRegionalPlus') !== -1);
  }
})();

// H1/H3 grounding: tendLink is the repeatable trust verb; competent never tends.
const hierText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'hierarchy.js'), 'utf8'); } catch (e) { return ''; } })();
t('H-grounding: tendLink grants +8 trust weekly', hierText.indexOf('tendLink(linkId)') !== -1 && hierText.indexOf('Math.round(8 * frac)') !== -1);
t('H-grounding: links form at trust 30', hierText.indexOf('trust: 30') !== -1);
t('H-grounding: seasoned needs 30 days + trust 40', hierText.indexOf('(link.trust || 0)') !== -1 && hierText.indexOf('>= 40') !== -1);
const compText = (function () { try { return fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'); } catch (e) { return ''; } })();
t('H-grounding: competent.js never calls tendLink', compText.indexOf('tendLink') === -1);
t('H-grounding: competent.js never calls proposeLink', compText.indexOf('proposeLink(') === -1);

// G3 (static leg): zero src/js changes on this branch vs master.
(function () {
  let names = '';
  try { names = execSync('git diff --name-only master...HEAD -- src/js', { cwd: REPO }).toString().trim(); } catch (e) { names = 'GIT-ERROR'; }
  t('G3 static: no src/js files differ from master', names === '', names ? names.slice(0, 200) : '');
})();

// classifyLink() + attribute() unit legs on synthetic records.
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'analyze-diploverb-b')); } catch (e) { /* analyzer missing: RED */ }
  t('analyzer module loads', mod && typeof mod.classifyLink === 'function' && typeof mod.attribute === 'function');
  if (!mod) return;
  const T = function (entries) { return { id: 'link_x', other: 'ov1', kind: 'link', primary: 'haven', conquered: false, formedDay: 10, entries: entries }; };
  const E = function (d, trust, age, status, seasoned, counted) {
    return { d: d, trust: trust, age: age, status: status, seasoned: seasoned, counted: counted, arrears: 0, tendedWeek: 0 };
  };
  t('classifyLink: seasoned-and-counted', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(45, 48, 35, 'active', true, true)]), { verbEvents: [] }) === 'seasoned-and-counted');
  t('classifyLink: seasoned-but-no-polity', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(45, 48, 35, 'active', true, false)]), { verbEvents: [] }) === 'seasoned-but-no-polity');
  t('classifyLink: broke-succession', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(20, 25, 10, 'broken', false, false)]), { verbEvents: [{ verb: 'breakLink', linkId: 'link_x', result: 'broke:succession' }] }) === 'broke-succession');
  t('classifyLink: broke-unknown without an event', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(20, 25, 10, 'broken', false, false)]), { verbEvents: [] }) === 'broke-unknown');
  t('classifyLink: still-young-at-end', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(25, 38, 15, 'active', false, false)]), { verbEvents: [] }) === 'still-young-at-end');
  t('classifyLink: never-seasoned-trust names the trust', mod.classifyLink(T([E(10, 30, 0, 'active', false, false), E(60, 33, 50, 'active', false, false)]), { verbEvents: [] }) === 'never-seasoned-trust<33');
  // attribute(): a +34 dip step names the link that became counted that day.
  const rec = {
    series: [
      { d: 40, dip: 0, linksRoll: [{ id: 'link_a', o: 'ov1', k: 'link', p: 'haven', sub: 'ov1', st: 'active', t: 42, f: 10, age: 30, cq: 0, ar: 0, tw: 5, pd: null, pr: 0, se: 1, rp: 0 }] },
      { d: 41, dip: 34, linksRoll: [{ id: 'link_a', o: 'ov1', k: 'link', p: 'haven', sub: 'ov1', st: 'active', t: 42, f: 10, age: 31, cq: 0, ar: 0, tw: 5, pd: null, pr: 0, se: 1, rp: 1 }] },
    ],
    verbEvents: [{ day: 40, verb: 'tendLink', caller: 'policy', linkId: 'link_a', before: 34, after: 42, dTrust: 8, result: 'n=1500' }],
  };
  const at = mod.attribute(rec);
  t('attribute: dip step attributed to the counted link', at.dipSteps.length === 1 && at.dipSteps[0].gained === 34 && at.dipSteps[0].links[0] === 'link_a', JSON.stringify(at.dipSteps));
  t('attribute: 0 unattributed diplomacy points', at.unattributed === 0, 'unattributed=' + at.unattributed);
  t('attribute: tend crossing counted', (at.verbs['tendLink:policy'] || {}).crossings === 1, JSON.stringify(at.verbs));
})();

console.log('§1 static: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
if (!GAME) { console.log('static green; re-run with --game for the recorder legs'); process.exit(0); }

// ---------- §2 game: recorder legs on seed 98801 ----------
async function gameLevel() {
  let gpass = 0, gfail = 0;
  function gt(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS ' + name); }
    else { gfail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const { oneRun } = require(path.join(REPO, 'scripts', 'diploverb-driver-20261114'));
  const { attribute } = require(path.join(REPO, 'scripts', 'analyze-diploverb-b'));
  const REQUIRED = ['d', 'scale', 'stRaw', 'war', 'dip', 'plenty', 'links', 'linksRoll', 'nActive', 'nSeasoned', 'nCounted', 'polity', 'havenPolity', 'pantry', 'drive', 'pop'];
  for (const pol of ['competent', 'capable']) {
    const r = await oneRun(98801, pol);
    gt(pol + ': series covers the run (' + r.series.length + ' days)', r.series.length >= 80, 'days=' + r.days);
    gt(pol + ': series days strictly increasing', r.series.every(function (s, i) { return i === 0 || s.d > r.series[i - 1].d; }));
    gt(pol + ': every snapshot carries the required fields', r.series.every(function (s) { return REQUIRED.every(function (k) { return s[k] !== undefined; }); }));
    gt(pol + ': every snapshot carries a link roll array', r.series.every(function (s) { return Array.isArray(s.linksRoll); }));
    gt(pol + ': 0 instrument errors', (r.instrumentErrors || []).length === 0, JSON.stringify(r.instrumentErrors).slice(0, 300));
    const at = attribute(r);
    const uncls = at.links.filter(function (l) { return l.cls === 'UNCLASSIFIED'; }).length;
    gt(pol + ': every link classified (0 UNCLASSIFIED)', uncls === 0, uncls + ' unclassified of ' + at.links.length);
    gt(pol + ': 0 unattributed diplomacy points', at.unattributed === 0, 'unattributed=' + at.unattributed + ' endDip=' + at.endDip);
    gt(pol + ': anchorCommit recorded', typeof r.anchorCommit === 'string' && r.anchorCommit.length >= 7);
    if (pol === 'capable') {
      gt('capable-98801: won-table (the finding, smoke seed)', r.won === true, 'won=' + r.won + ' end=' + r.endReason);
      const lastDip = r.series[r.series.length - 1].dip | 0;
      const countedN = at.links.filter(function (l) { return l.countedDay !== null; }).length;
      // Base-moved (237fb445f vs capablewinpath 2042cb96c: fusion-offer
      // landing reshuffles capable's RNG draws): the old corpus read dip
      // 102 / 3 links on day 90; this base reads dip 170 / 5 links on day
      // 92 — the unmodified capablewinpath driver reproduces 92/170 on
      // this base, so the move is the base, not this recorder. Assert the
      // finding structurally: diplomacy is a positive multiple of 34 and
      // equals 34 x counted links, with at least 3 counted.
      gt('capable-98801: diplomacy is 34 x counted links (positive)', lastDip > 0 && lastDip % 34 === 0 && lastDip === 34 * countedN, 'dip=' + lastDip + ' counted=' + countedN);
      gt('capable-98801: at least 3 counted links', countedN >= 3, JSON.stringify(at.links.map(function (l) { return l.cls; })));
    } else {
      gt('competent-98801: not won', r.won === false, 'won=' + r.won);
      const lastDip = r.series[r.series.length - 1].dip | 0;
      gt('competent-98801: diplomacy 0 at end of run', lastDip === 0, 'dip=' + lastDip);
      gt('competent-98801: never proposed a link (0 proposeLink calls)', ((at.verbs['proposeLink:policy'] || {}).calls | 0) === 0, JSON.stringify(at.verbs));
    }
    console.log('  [' + pol + ' 98801] days=' + r.days + ' end=' + r.endReason + ' won=' + r.won + ' dip=' + (r.series[r.series.length - 1].dip | 0) + ' links=' + at.links.length + ' counted=' + at.links.filter(function (l) { return l.countedDay !== null; }).length + ' villDeaths=' + r.villagerCombatDeaths);
  }
  console.log('§2 game: ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
