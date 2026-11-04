// test-journey-deepening-r95-instruments-20261104.js -- proof that the r95
// driver carries the standing trace + last-living census, and that the
// r95 analyzer classifies S-TRACE verdicts (EXPLAINED /
// NEEDS-POLITY-CHECK / ARITHMETIC-BUG / NO-REGIONAL-DAYS) and P-DIST-LL
// correctly on fixtures. Tooling only; a live smoke run (seed 93800 x
// DAYCAP=45) proves the wraps fire in a real game.
// Usage: node scripts/test-journey-deepening-r95-instruments-20261104.js
'use strict';
const fs = require('fs');
const path = require('path');
const { summarizeStanding, distStats, median, scanBetrayalTranscript } = require('./analyze-journey-deepening-r95-20261104.js');
const { pickChoice, beginSitting, orderSittingCandidates } = require('./journey-deepening-r95-20261104.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const driver = fs.readFileSync(path.join(__dirname, 'journey-deepening-r95-20261104.js'), 'utf8');
for (const marker of ['standingTrace', 'lastLivingCensus', 'networkLive', 'villageStanding()',
  '93801', 'journey-deepening-r95-transcript-', 'journey-deepening-r95-seed']) {
  check('driver marker ' + marker, driver.indexOf(marker) !== -1);
}
check('driver has no r93 output filenames', driver.indexOf('journey-deepening-r93-') === -1);
// The header honestly names r92's band as provenance; the stale-band
// check therefore reads the SEEDS default, not the whole file.
const seedsLine = (driver.split('\n').find(l => l.indexOf('const SEEDS') !== -1) || '');
check('driver has no stale seed default', seedsLine.indexOf('93701') === -1 && seedsLine.indexOf('93801') !== -1);
// The r93 insert (inherited) must read the PURE breakdown, not the gated total
// (gated calls can trip release beats / move the peak ratchet).
const insertAt = driver.indexOf('R94: standing trace');
check('r93 insert exists', insertAt !== -1);
if (insertAt !== -1) {
  const blockEnd = driver.indexOf('r95trace', insertAt) + 80;
  const block = driver.slice(insertAt, blockEnd);
  check('r93 insert reads villageStanding()', block.indexOf('villageStanding()') !== -1);
  // The comment names the gated function as a warning; the call check
  // therefore looks for an actual _G call, not the name in prose.
  check('r93 insert does not call villageStandingTotal()', block.indexOf('_G.villageStandingTotal') === -1);
}

// distStats: median / min / max / sorted list, empty-safe.
check('dist odd median', distStats([8, 12, 38]).median === 12);
check('dist even median', distStats([8, 12, 13, 14]).median === 12.5);
check('dist sorted', JSON.stringify(distStats([38, 8, 14]).list) === '[8,14,38]');
check('dist empty', distStats([]).median === null && distStats([]).n === 0);
check('median helper', median([3, 1, 2]) === 2);

// Fixture builder: trace days + deed checkpoints.
function seedFixture(trace, deed, llc) {
  return { standingTrace: trace, deedLog: deed, lastLivingCensus: llc || null };
}
const T = (day, standing, scale, comp) => Object.assign({ day, standing, scale, pop: 5, networkLive: scale === 'regional' }, comp || { war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 });
const D = (day, standingTotal, scale, pop, links) => ({ day, standingTotal, scale, pop, links: links || [] });

// EXPLAINED: regional from day 50 at zero, all components zero,
// checkpoint link young (age 22 < 30) and low trust.
{
  const s = seedFixture(
    [T(49, 0, 'village'), T(50, 0, 'regional'), T(60, 0, 'regional'), T(70, 40, 'regional', { war: 0, diplomacy: 40, plenty: 0, warPts: 0, links: 1, feasts: 0 })],
    [D(50, 0, 'regional', 6, [{ other: 'Stonebridge', age: 22, trust: 35, seasoned: false, status: 'active' }]),
     D(70, 40, 'regional', 6, [{ other: 'Stonebridge', age: 42, trust: 45, seasoned: true, status: 'active' }])],
    { day: 70, pop: 6, plants: [8, 12, 38], names: ['A', 'B', 'C'] });
  const v = summarizeStanding(s);
  check('explained verdict', v.verdict === 'EXPLAINED', v.verdict);
  check('explained firstRegional', v.firstRegionalDay === 50);
  check('explained regionalZero count', v.regionalZeroDays === 2);
  check('explained firstPos', v.firstPositiveDay === 70);
  check('explained P-DIST-LL', v.lastLivingCensus.plants.median === 12 && v.lastLivingCensus.plants.max === 38 && v.lastLivingCensus.day === 70);
}

// NEEDS-POLITY-CHECK: seasoned link beside a gated regional zero.
{
  const s = seedFixture(
    [T(50, 0, 'regional')],
    [D(50, 0, 'regional', 6, [{ other: 'Stonebridge', age: 45, trust: 50, seasoned: true, status: 'active' }])],
    { day: 50, pop: 6, plants: [10], names: ['A'] });
  const v = summarizeStanding(s);
  check('polity-check verdict', v.verdict === 'NEEDS-POLITY-CHECK', v.verdict);
  check('polity-check link captured', v.seasonedBesideZero && v.seasonedBesideZero.links[0].age === 45);
}

// ARITHMETIC-BUG: positive diplomacy component beside a zero total.
{
  const s = seedFixture(
    [T(50, 0, 'regional', { war: 0, diplomacy: 40, plenty: 0, warPts: 0, links: 1, feasts: 0 })],
    [D(50, 0, 'regional', 6, [])], null);
  const v = summarizeStanding(s);
  check('arith-bug verdict', v.verdict === 'ARITHMETIC-BUG', v.verdict);
  check('arith-bug captured', v.arithBug && v.arithBug.diplomacy === 40);
}

// NO-REGIONAL-DAYS: village scale throughout.
{
  const s = seedFixture([T(50, 0, 'village'), T(60, 10, 'village', { war: 10, diplomacy: 0, plenty: 0, warPts: 1, links: 0, feasts: 0 })], [], null);
  const v = summarizeStanding(s);
  check('no-regional verdict', v.verdict === 'NO-REGIONAL-DAYS', v.verdict);
  check('no-regional firstPos', v.firstPositiveDay === 60);
}

// P-DIST-LL prefers the last-living census over a final empty census:
// the fixture's lastLivingCensus is day 50 even though the seed later died.
{
  const s = seedFixture([T(50, 0, 'regional')], [D(50, 0, 'regional', 6, [])],
    { day: 50, pop: 6, plants: [5, 5, 20, 20], names: ['A', 'B', 'C', 'D'] });
  const v = summarizeStanding(s);
  check('last-living census kept', v.lastLivingCensus && v.lastLivingCensus.plants.median === 12.5 && v.lastLivingCensus.plants.n === 4);
}

// ---- R94: betrayal-branch picker ----
// Alternation: first betrayal sitting accepts, second declines, third accepts.
{
  const menu = [{ id: 'betrayal:accept', label: 'a' }, { id: 'betrayal:decline', label: 'd' }, { id: 'leave', label: 'l' }];
  beginSitting();
  const first = pickChoice(menu, 0);
  check('betrayal first sitting accepts', first && first.id === 'betrayal:accept');
  // A second betrayal offer in the SAME sitting must NOT re-take the branch:
  // the normal picker falls through to leave (no engage id matches).
  const second = pickChoice(menu, 1);
  check('betrayal taken once per sitting', second && second.id === 'leave');
  beginSitting();
  const secondSit = pickChoice(menu, 0);
  check('betrayal second sitting declines', secondSit && secondSit.id === 'betrayal:decline');
  beginSitting();
  const thirdSit = pickChoice(menu, 0);
  check('betrayal third sitting accepts again', thirdSit && thirdSit.id === 'betrayal:accept');
  // Non-betrayal menus are untouched: engage-first still wins.
  beginSitting();
  const normal = pickChoice([{ id: 'dlg:help', label: 'h' }, { id: 'leave', label: 'l' }], 0);
  check('non-betrayal menu unchanged', normal && normal.id === 'dlg:help');
  // Accept-only menu (no decline offered) falls back to accept, never crashes.
  beginSitting();
  const acceptOnly = pickChoice([{ id: 'betrayal:accept', label: 'a' }, { id: 'leave', label: 'l' }], 0);
  check('accept-only menu picks accept', acceptOnly && acceptOnly.id === 'betrayal:accept');
}
// ---- R94: betrayal transcript scan ----
{
  const t = scanBetrayalTranscript([
    '=== seed 93801 day 45 — conversation with X (v1) ===',
    '(offered=betrayal:accept,betrayal:decline,leave,silence)',
    'YOU: [betrayal:decline] "Not this time."',
    'THEM: Fine. Remember you said that.',
    'YOU: (leave)',
    'betrayal branch: decline',
    'want final: id=none stage=0 resolution=none',
  ].join('\n'));
  check('scan finds betrayal sitting', t.betrayal === true);
  check('scan branch decline', t.branch === 'decline');
  check('scan youTurns counts YOU lines incl leave', t.youCount === 2);
  check('scan wantFinal parsed', t.wantFinal && t.wantFinal.resolution === 'none');
  const t2 = scanBetrayalTranscript('(offered=dlg:more,leave)\nYOU: [dlg:more] more\nwant final: id=x stage=3 resolution=promised\n');
  check('scan ordinary sitting not betrayal', t2.betrayal === false && t2.branch === 'none');
  const t3 = scanBetrayalTranscript('(offered=betrayal:accept,betrayal:decline,leave,silence)\nYOU: (leave)\nwant final: id=none stage=0 resolution=none\n');
  check('scan unanswered betrayal sitting', t3.betrayal === true && t3.branch === 'none');
}

// ---- R95: inviter-seeking sitting order ----
// Revisit target first, then count<2 in roster order, then the rest;
// deduped, capped at 3.
{
  const info = [{ id: 'a', count: 5 }, { id: 'b', count: 0 }, { id: 'c', count: 1 }, { id: 'd', count: 3 }];
  check('order revisit first exact', JSON.stringify(orderSittingCandidates('c', info)) === '["c","b","a"]');
  check('order no revisit prefers count<2', JSON.stringify(orderSittingCandidates(null, info)) === '["b","c","a"]');
  check('order dedups revisit', JSON.stringify(orderSittingCandidates('b', info)) === '["b","c","a"]');
  check('order unknown count sorts last', JSON.stringify(orderSittingCandidates(null, [{ id: 'x', count: -1 }, { id: 'y', count: 0 }])) === '["y","x"]');
  check('order empty', JSON.stringify(orderSittingCandidates(null, [])) === '[]');
  check('order absent revisit still first', JSON.stringify(orderSittingCandidates('z', info)) === '["z","b","c"]');
}
// Driver writes vid-suffixed transcript filenames (same-day sittings
// must not collide) and the r95 seed JSON carries the sitting log.
check('driver transcript filename carries vid', driver.indexOf('day${day}-${vid}.txt') !== -1);
check('driver records inviterHistory', driver.indexOf('inviterHistory') !== -1);
check('driver records sittingLog', driver.indexOf('sittingLog') !== -1);
check('driver stops after betrayal sitting', driver.indexOf('stop seeking after the first betrayal sitting today') !== -1);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
