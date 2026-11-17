// test-profilegate-b.js — proof for arm sim-profilegate-b (LEVER: widen
// the companion profile gate, PROFILEGATE=1, default OFF).
// VERDICT: NO-GO on B3 (median survival 116.5 vs bar 118.0), lever
// REVERTED by disposition (commit ea3d3eabe). This test now proves the
// INSTRUMENT plus the REVERT, on the frozen-base measurement (50/50 green
// on eb2d3714f, see evidence/2026-11-17/sim-profilegate-b.md):
//   - static: src/ diff vs the frozen base is EMPTY (no lever in the tree);
//     the twins carry the UNGUARDED profile check (master behavior) and no
//     profilegateOn() helper; the depart bypass is landed and untouched;
//     winPlanSecondCompanion stays profile-open.
//   - analyzer fixtures judge the frozen pool-shape / damage / arm-only /
//     bar logic; the live gate fixture shows a forager/homebody companion
//     is picked at dawn in NEITHER PROFILEGATE state (the flag is inert
//     post-revert); the depart variants still prove the range-0 block.
//   - determinism legs D1 (repeatability) + D2 (wrap neutrality) are green
//     at 60d on seed 103411 with VETREENGAGE=1 in both PROFILEGATE states,
//     plus a cross-state flag-inert check (identical trajectories).
// The 150d gate-act check is RETIRED, not re-scored: its subject (the
// lever) is gone by disposition, and its fixture seed 103413 plants no
// plans on the rebased base (trajectory drift from the fightallycap
// landing — see the evidence Rebase note). The gate-act behavior was
// proven 50/50 on the frozen base and is recorded in the evidence.
// Usage:
//   node scripts/test-profilegate-b.js
// The gate fixture runs in child processes (one harness per process):
//   PROFILEGATE=1 GATE_VARIANT=bid node -e "require('./scripts/test-profilegate-b.js').gateFixture().then(function(r){console.log(JSON.stringify(r));})"
// Variants: bid | depart-homebody | depart-forager.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js'));
const LAUNCHDEF_ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen prereg.
function frozenBase() {
  if (process.env.PROFILEGATE_BASE) return process.env.PROFILEGATE_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-profilegate-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return null;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitStatusNames(dir) {
  try {
    // Porcelain lines are XY + space + path (XY is 2 chars: ' M', '??',
    // 'A '...). Do NOT trim the whole output first — trim() eats the
    // FIRST line's leading status space and the regex then mangles it
    // ('M src/...' -> 'rc/...'); split first, filter empties after.
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().split('\n').map(function (s) { return s.replace(/^.{2} /, ''); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
function staticChecks() {
console.log('== static ==');
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
const EXPECTED_SRC = ['src/js/villager-brain.js', 'src/js/win-plan.js'];
const srcDiff = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
const srcStatus = gitStatusNames('src/').filter(function (s) { return EXPECTED_SRC.indexOf(s) !== -1; });
const srcUnion = Array.from(new Set(srcDiff.concat(srcStatus))).sort();
// NO-GO disposition (revert ea3d3eabe): the lever is OUT of the tree, so
// the src/ diff vs the frozen base must be EMPTY — not the two twins.
check('src/ diff vs base + untracked is EMPTY (lever reverted by NO-GO disposition)',
  JSON.stringify(srcUnion) === JSON.stringify([]),
  'union=' + JSON.stringify(srcUnion));
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const GATED = "if (!profilegateOn() && prof !== 'wanderer' && prof !== 'explorer') continue;";
check('brain twin does NOT carry the gated profile check (lever reverted)', brainJs.indexOf(GATED) === -1);
check('win-plan twin does NOT carry the gated profile check (lever reverted)', winplanJs.indexOf(GATED) === -1);
check('unguarded profile check PRESENT in both twins (master behavior restored)',
  brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1 &&
  winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1);
check('no profilegateOn() helper remains in either twin (lever reverted)',
  brainJs.indexOf("function profilegateOn()") === -1 && winplanJs.indexOf("function profilegateOn()") === -1 &&
  brainJs.indexOf("process.env.PROFILEGATE") === -1 && winplanJs.indexOf("process.env.PROFILEGATE") === -1);
check('depart bypass landed in villager-agency.js and untouched by this arm',
  agencyJs.indexOf('PROFILEGATE (sim-profilegate-a)') !== -1 &&
  (BASE ? gitDiffNames(BASE, 'src/js/villager-agency.js').length === 0 : false),
  'agency diff=' + JSON.stringify(BASE ? gitDiffNames(BASE, 'src/js/villager-agency.js') : null));
check('winPlanSecondCompanion stays profile-open (no wanderer/explorer check in it)',
  (function () {
    const a = winplanJs.indexOf('winPlanSecondCompanion(vid, hx, hy, firstCid)');
    const b = winplanJs.indexOf('winPlanFightGate(vid, mdef)', a + 1);
    if (a === -1 || b === -1 || b <= a) return false;
    return winplanJs.slice(a, b).indexOf('wanderer') === -1;
  })());
check('winPlanHavenTick plan-seeding gate NOT widened (holders stay as seeded)',
  winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') return null;") !== -1);
check('expeditionCand own-ranging gate NOT widened',
  brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') return null;") !== -1);
const EXPECTED_SCRIPTS = [
  'scripts/profilegate-driver-20261117.js',
  'scripts/analyze-profilegate-b.js',
  'scripts/profilegate-drift-check.js',
  'scripts/build-profilegate-panels-20261117.js',
  'scripts/test-profilegate-b.js',
];
const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
check('scripts diff vs base + untracked is the profilegate instrument only (5 files)',
  JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
  'union=' + JSON.stringify(scriptsUnion));
check('profilegate instrument files exist',
  EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js'), 'utf8');
check('driver poolReplica is PROFILEGATE-aware (gate skips notRanger when on)',
  driverSrc.indexOf("const profileGateOpen = (typeof process !== 'undefined' && process.env && process.env.PROFILEGATE === '1');") !== -1 &&
  driverSrc.indexOf("else if (!profileGateOpen && prof !== 'wanderer' && prof !== 'explorer')") !== -1);
check('driver recorder flag is PROFILEGATE_RECORDER',
  driverSrc.indexOf("process.env.PROFILEGATE_RECORDER !== 'off'") !== -1);
check('driver accepts legs off|on|rec|rec0',
  driverSrc.indexOf("MODE !== 'off' && MODE !== 'on' && MODE !== 'rec' && MODE !== 'rec0'") !== -1);
check('driver exports poolReplica + oneRun',
  typeof DRIVER.poolReplica === 'function' && typeof DRIVER.oneRun === 'function');
check('analyzer exports computeBars + deriveMaxHp + armOnlyStarv',
  typeof ANALYZE.computeBars === 'function' && typeof ANALYZE.deriveMaxHp === 'function' &&
  typeof ANALYZE.armOnlyStarv === 'function');
}

// ---------- 2. Analyzer fixtures ----------
function analyzerFixtures() {
console.log('== analyzer fixtures ==');
function mkSeed(over) {
  const j = {
    seed: 103411, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [], dawnbidStarts: [],
    launchdefSkips: [], companionPool: [], daily: [], deaths: [],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, path, stageAfter) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: 'fled', path: path,
    caller: 'test', stageAfter: stageAfter || 'party', target: target, node: null };
}
function scoreRow(day, vid, target, opts) {
  const o = opts || {};
  const cands = o.cands !== undefined ? o.cands : [{ kind: 'winplan', w: 10, winPlanAction: 'party_launch', companion: 'c1' }];
  return { day: day, part: 0, vid: vid, cands: cands,
    pick: { kind: 'winplan', winPlanAction: o.commitAction !== undefined ? o.commitAction : 'party_launch' },
    logCands: cands.map(function (c) { return { kind: c.kind || 'winplan', score: 10, winPlanAction: c.winPlanAction || null }; }),
    commit: o.commit === undefined ? { kind: 'winplan', winPlanAction: 'party_launch', companion: 'c1' } : o.commit,
    plan: { stage: 'party', target: target, needWave: 4, party: ['c1'] },
    holderGear: { armed: true, armored: true } };
}
function depRow(day, vid, target, result, opts) {
  const o = opts || {};
  return { seq: 1, day: day, vid: vid, source: 'brain', result: result,
    winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0,
    companion: o.companion !== undefined ? o.companion : 'c1',
    vidExped: result === 'launch', companionExped: result === 'launch',
    vidBlock: o.vidBlock || null, companionBlock: o.companionBlock || null,
    stage: 'party', target: target, party: ['c1'] };
}
function encRow(day, vid, mid, outcome, opts) {
  const o = opts || {};
  return { day: day, vid: vid, mid: mid, wave: o.wave || 4, alliesN: 1, allyVids: [],
    allyFromStart: false, gate: null, outcome: outcome, rounds: o.rounds != null ? o.rounds : 3,
    vTaken: 20, mDealt: o.mDealt != null ? o.mDealt : 100, calledHelp: false, allyVid: o.allyVid || null,
    fleeHpFrac: null, trickBefore: false, trickAfter: false, lines: [], log: o.log || [],
    origin: o.origin || 'expedition' };
}
function member(id, profile, firstFail, opts) {
  const o = opts || {};
  return { id: id, profile: profile, trust: o.trust != null ? o.trust : 50, trustRaw: 50,
    node: o.node !== undefined ? o.node : { nx: 4, ny: 4 }, away: !!o.away, engaged: false,
    onExped: false, alive: true, firstFail: firstFail };
}
function poolRow(day, vid, opts) {
  const o = opts || {};
  return { day: day, part: 0, vid: vid, target: 'eulogy', stage: 'party',
    holderProfile: 'forager', holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 }, rosterN: 5,
    profileGateOpen: !!o.gateOpen,
    counts: o.counts, fails: {}, eligible: o.eligible || [],
    rankedOrder: [], rankedPick: o.rankedPick || null, rankedVia: 'companionRank',
    bidCompanion: o.bidCompanion || null, agree: o.agree !== undefined ? o.agree : null,
    members: o.members || [] };
}
function launchedCorpus(opts) {
  const o = opts || {};
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike', 4, 'world-tick')];
  j.dawnbidScores = [scoreRow(20, 'v1', 'strike')];
  j.dawnbidDeparts = [depRow(20, 'v1', 'strike', 'launch')];
  j.v4departs = [{ day: 20, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
    companion: 'c1', companion2: null, stage: 'party', target: 'strike', party: ['c1'],
    partySize: 2, partyKillers: 0, partyArmed: 1, targetWave: 4 }];
  j.dawnbidCensus = [{ day: 150, vid: 'v1', target: 'strike', needWave: 4, stage: 'party', party: ['c1'],
    holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false,
    holderHealth: 100, holderGear: { armed: true, armored: true } }];
  j.daily = [{ day: 150, waveKillLog: [], roster: [{ vid: 'v1', dead: false }], wave4Slain: {}, vetsW3: { count: 0 }, vetsW4: { count: 0 }, ready4: { ready: false }, ready5: { ready: false } }];
  if (o.encounters) j.v4encounters = o.encounters;
  return j;
}
(function () { // F1: pool-shape table from fixture pool rows
  const j = mkSeed();
  j.companionPool = [
    poolRow(20, 'v1', { gateOpen: false, eligible: [],
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
      members: [
        member('c1', 'forager', 'notRanger'),
        member('c2', 'wanderer', 'away', { away: true }),
        { id: 'v1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
        { id: 's1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
      ] }),
    poolRow(21, 'v1', { gateOpen: true, eligible: ['c1', 'c3'], rankedPick: 'c1', bidCompanion: 'c1', agree: true,
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 },
      members: [
        member('c1', 'forager', 'eligible'),
        member('c3', 'homebody', 'eligible'),
        member('c2', 'wanderer', 'away', { away: true }),
        { id: 'v1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
        { id: 's1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
      ] }),
  ];
  const r = ANALYZE.funnelForSeed(j);
  check('F1 poolShape: 2 dawns, 1 empty, emptyShare 0.5, meanEligible 1.0',
    r.poolShape.dawns === 2 && r.poolShape.empty === 1 && r.poolShape.emptyShare === 0.5 && r.poolShape.meanEligible === 1,
    JSON.stringify(r.poolShape));
  check('F1 pickedProfiles: the ON dawn picked a forager; agree 1/1',
    r.poolShape.pickedProfiles.forager === 1 && r.poolShape.agreeTrue === 1 && r.poolShape.agreeFalse === 0 && r.poolShape.agreeRate === 1,
    JSON.stringify(r.poolShape.pickedProfiles) + ' agree=' + r.poolShape.agreeTrue + '/' + r.poolShape.agreeFalse);
  check('F1 wouldBeNotRanger: 3 members fail profile under the OLD gate (1 OFF + 2 ON)',
    r.poolShape.wouldBeNotRanger === 3, 'got ' + r.poolShape.wouldBeNotRanger);
  check('F1 gateOpenRows: 1 of 2 pool rows ran with the widened gate',
    r.poolShape.gateOpenRows === 1, 'got ' + r.poolShape.gateOpenRows);
})();
(function () { // F2: damage-share derivation (log-parse + range-mid fallback)
  check('F2 deriveMaxHp: first strike line 24 + 885 left = 909',
    ANALYZE.deriveMaxHp({ log: ['R1: Sofia strikes for 24 (885 left)', 'R2: Sofia strikes for 20 (861 left)'] }) === 909);
  check('F2 deriveMaxHp: no strike line -> null (fallback path)',
    ANALYZE.deriveMaxHp({ log: ['Sofia walks straight into The Eulogy.'] }) === null);
  check('F2 rangeMidHp: eulogy hp range [900,1100] -> 1000',
    ANALYZE.rangeMidHp('eulogy') === 1000);
  const r = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [
    encRow(25, 'v1', 'strike', 'vFlee', { mDealt: 77, log: ['R1: Sofia strikes for 24 (885 left)'] }),
  ] }));
  const inst = r.instances[0];
  check('F2 damage: fought meeting 77/909 = 0.0847 (launchfunnel 8.5%), derived via log',
    r.damage.meetings === 1 && r.damage.pooledDealt === 77 && r.damage.pooledMaxHp === 909 &&
    r.damage.pooledShare === 0.0847 && r.damage.derived === 1 && r.damage.fallback === 0 &&
    inst.meetings[0].maxHp === 909 && inst.meetings[0].maxHpVia === 'log',
    JSON.stringify(r.damage));
  const r2 = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [
    encRow(25, 'v1', 'strike', 'vFlee', { mDealt: 50, log: [] }),
  ] }));
  check('F2 damage fallback: no log line -> strike hp-range midpoint 1100, via range-mid',
    r2.damage.meetings === 1 && r2.damage.pooledMaxHp === 1100 && r2.damage.fallback === 1 &&
    r2.instances[0].meetings[0].maxHpVia === 'range-mid',
    JSON.stringify(r2.damage));
})();
(function () { // F3: arm-only starvation (matched same-seed same-day)
  function rawDeaths(seed, days) {
    const j = { seed: seed, deaths: days.map(function (d) { return { day: d, cause: 'starvation', who: 'v1', kind: 'x', player: false }; }) };
    return j;
  }
  const onRaw = { 103411: rawDeaths(103411, [5, 9]), 103412: rawDeaths(103412, [12]) };
  const offRaw = { 103411: rawDeaths(103411, [5]), 103412: rawDeaths(103412, [12]) };
  check('F3 armOnlyStarv: ON has 1 arm-only death (day 9), OFF has 0',
    ANALYZE.armOnlyStarv(onRaw, offRaw) === 1 && ANALYZE.armOnlyStarv(offRaw, onRaw) === 0);
})();
(function () { // F4: frozen bar logic via computeBars on fixture summaries
  function sum(over) {
    return Object.assign({
      poolShape: { dawns: 87, empty: 10, emptyShare: 0.115, meanEligible: 2.36 },
      launchedInstances: 6, medianSurvival: 140,
      damage: { pooledShare: 0.09, meetings: 1, perMeeting: [] },
      classifiedShare: 1, unknown: 0,
    }, over || {});
  }
  const base = { onStarvTotal: 3, offStarvTotal: 3, armOnlyOn: 0, armOnlyOff: 0,
    d2On: 0, d2Off: 0, w4Match: true,
    files: { on: 8, off: 8, rec: 8, rec0: 8 }, errors: { on: 0, off: 0, rec: 0, rec0: 0 } };
  const go = ANALYZE.computeBars(Object.assign({}, base, { on: sum(), off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 bars GO case: B1+B2+B3+B5 pass -> GO',
    go.bar1 && go.bar2 && go.bar3 && go.bar5 && go.verdict === 'GO' && go.bar4.tracked === true,
    JSON.stringify({ b1: go.bar1, b2: go.bar2, b3: go.bar3, b5: go.bar5, v: go.verdict }));
  const b1fail = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ poolShape: { dawns: 87, empty: 80, emptyShare: 0.92, meanEligible: 0.1 } }),
    off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 B1 fail (emptyShare 0.92) -> NO-GO', !b1fail.bar1 && b1fail.verdict === 'NO-GO');
  const b2fail = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ launchedInstances: 3 }), off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 B2 fail (launched 3, not > off 3 and < 5) -> NO-GO', !b2fail.bar2 && b2fail.verdict === 'NO-GO');
  const b3fail = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum(), off: sum({ launchedInstances: 3, medianSurvival: 150 }),
    onStarvTotal: 10, armOnlyOn: 5, armOnlyOff: 0 }));
  check('F4 B3 fail (starvation 10 vs 3+2, arm-only 5 vs 0+2) -> NO-GO', !b3fail.bar3 && b3fail.verdict === 'NO-GO');
  const b3edge = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ medianSurvival: 120 }), off: sum({ launchedInstances: 3, medianSurvival: 150 }),
    onStarvTotal: 5, armOnlyOn: 2, armOnlyOff: 0 }));
  check('F4 B3 edge passes (starvation 5 = 3+2, arm-only 2 = 0+2, survival 120 = 0.8x150)',
    b3edge.bar3 && b3edge.verdict === 'GO', JSON.stringify({ b3: b3edge.bar3, v: b3edge.verdict }));
})();
}

// ---------- 3. Gate fixture (live, staged — runs in a child process) ----------
// gateFixture(variant): one harness per process. Variants:
//   bid — stage a wave-4+ plan on a non-ranger holder at Haven, away all
//     rangers, and ask the dawn feed for candidates.
//   depart-homebody / depart-forager — stage a party_launch commit naming
//     the homebody / forager companion and tick agency once.
// Returns a JSON-able result; the main runner asserts per variant+flag.
async function gateFixture(variant) {
  variant = variant || process.env.GATE_VARIANT || 'bid';
  const gateOn = process.env.PROFILEGATE === '1';
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  // Try seeds in order until one stages the holder + the companion the
  // variant needs — a seed's day-0 Haven may hold no homebody at all.
  // Sequential loadGame calls in one process are the sweep pattern
  // (seeds run sequentially, never concurrently).
  let lastFailure = null;
  for (const seed of [103413, 103411, 103412, 103414, 103415]) {
    const r = await attemptSeed(seed);
    if (r && !r.stagingFailed) { r.seed = seed; return r; }
    lastFailure = r;
  }
  return lastFailure || { variant: variant, gateOn: gateOn, error: 'no-seed-staged' };
  async function attemptSeed(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'profilegate-gate-test', fullTelemetry: false });
  await setupGame(Game);
  Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  function atHaven(rid) {
    try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  }
  function profOf(rid) {
    try { return Game.npcRangeProfile ? Game.npcRangeProfile(rid) : null; } catch (e) { return null; }
  }
  function alive(rid) {
    try { const p = Game.getPerson ? Game.getPerson(rid) : null; return !(p && p.dead); } catch (e) { return true; }
  }
  function healthy(rid) {
    try { if (((v.sick || {})[rid])) return false; } catch (e) {}
    try { const h = ((v.health || {})[rid] !== undefined) ? v.health[rid] : 100; return h >= 70; } catch (e) { return true; }
  }
  function engaged(rid) {
    try { return !!(Game.isEngaged && Game.isEngaged(rid)); } catch (e) { return false; }
  }
  function dangerOff(rid) {
    try { return !Game.npcTrigger(rid, 'expedition_launch'); } catch (e) { return true; }
  }
  // Holder: a non-ranger at Haven, healthy, not engaged, not away, no danger.
  let holder = null, holderProfile = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    const prof = profOf(rid);
    if (prof !== 'forager' && prof !== 'homebody') continue;
    if (!atHaven(rid) || !alive(rid) || !healthy(rid) || engaged(rid)) continue;
    if (((v.away || {})[rid])) continue;
    if (!dangerOff(rid)) continue;
    holder = rid; holderProfile = prof; break;
  }
  if (!holder) return { variant: variant, gateOn: gateOn, stagingFailed: true, error: 'no-holder-at-haven' };
  // Stage the wave-4+ plan on the holder (read-only shape for winPlanCands).
  v.winPlan = v.winPlan || {};
  v.winPlan[holder] = { stage: 'party', target: 'eulogy', needWave: 4, party: [], sinceDay: today, holdSinceDay: -1 };
  // Away every ranger, so ONLY foragers/homebodies can be eligible.
  for (const rid of (v.roster || [])) {
    const prof = profOf(rid);
    if (prof === 'wanderer' || prof === 'explorer') { v.away = v.away || {}; v.away[rid] = true; }
  }
  // Staged companions: one forager + one homebody at Haven. For the BID
  // variant they must pass the full findCompanion bars (healthy, not
  // engaged, trusted) because the bid itself applies them. For the DEPART
  // variants only the range-0 block is under test — the commit names the
  // companion directly, so health/engagement do not gate staging there.
  let foragerComp = null, homebodyComp = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId || rid === holder) continue;
    if (!atHaven(rid) || !alive(rid)) continue;
    if (variant === 'bid' && (!healthy(rid) || engaged(rid))) continue;
    if (((v.away || {})[rid])) continue;
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      if (a && a.exped && a.exped[rid]) continue;
    } catch (e) {}
    const prof = profOf(rid);
    if (prof === 'forager' && !foragerComp) { foragerComp = rid; v.trust = v.trust || {}; v.trust[rid] = 50; }
    if (prof === 'homebody' && !homebodyComp) { homebodyComp = rid; v.trust = v.trust || {}; v.trust[rid] = 50; }
  }
  if (!foragerComp && !homebodyComp) return { variant: variant, gateOn: gateOn, stagingFailed: true, error: 'no-staged-companion', holder: holder, holderProfile: holderProfile };
  if (variant === 'bid') {
    const cands = Game.vbrainFeedExtras(holder, [], hx, hy);
    const launch = (cands || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
    const wait = (cands || []).find(function (c) { return c && c.winPlanAction === 'party_wait'; });
    return { variant: variant, gateOn: gateOn, holder: holder, holderProfile: holderProfile,
      foragerComp: foragerComp, homebodyComp: homebodyComp,
      launchCompanion: launch ? (launch.companion || null) : null,
      launchCompanionProfile: launch ? profOf(launch.companion) : null,
      hasWait: !!wait, candidates: (cands || []).length };
  }
  // Depart variants: stage the commit naming the chosen companion, tick once.
  const targetComp = variant === 'depart-homebody' ? homebodyComp : foragerComp;
  if (!targetComp) return { variant: variant, gateOn: gateOn, stagingFailed: true, error: 'no-target-companion', holder: holder, holderProfile: holderProfile };
  v.vbrain = v.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  v.vbrain.commit = v.vbrain.commit || {};
  v.vbrain.commit[holder] = { kind: 'EXPEDITION', day: today, part: 0, winPlanAction: 'party_launch', companion: targetComp };
  try { Game.agencyTick(); } catch (e) { return { variant: variant, gateOn: gateOn, error: 'agencyTick threw: ' + (e && e.message) }; }
  let holderExped = false, companionExped = false;
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    holderExped = !!(a && a.exped && a.exped[holder]);
    companionExped = !!(a && a.exped && a.exped[targetComp]);
  } catch (e) {}
  return { variant: variant, gateOn: gateOn, holder: holder, holderProfile: holderProfile,
    companion: targetComp, companionProfile: profOf(targetComp),
    holderExped: holderExped, companionExped: companionExped };
  }
}
function childGateFixture(profilegate, variant) {
  const env = Object.assign({}, process.env, { PROFILEGATE: profilegate, GATE_VARIANT: variant });
  const script = "const t=require('./scripts/test-profilegate-b.js');" +
    "t.gateFixture().then(function(r){console.log(JSON.stringify(r));}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function gateLive() {
  console.log('== gate live (child processes, seeds 103413+) ==');
  const bidOff = childGateFixture('0', 'bid');
  check('gate bid OFF: no party_launch candidate when only foragers/homebodies are eligible (party_wait instead)',
    !bidOff.error && bidOff.launchCompanion == null && bidOff.hasWait === true,
    JSON.stringify(bidOff));
  const bidOn = childGateFixture('1', 'bid');
  // REVERTED (NO-GO): the flag is inert — ON behaves exactly like OFF
  // (no launch candidate, party_wait instead). The gate-act behavior was
  // proven on the frozen base (50/50) and is recorded in the evidence.
  check('gate bid ON (reverted): same as OFF — no party_launch candidate when only foragers/homebodies are eligible (party_wait instead)',
    !bidOn.error && bidOn.launchCompanion == null && bidOn.hasWait === true,
    JSON.stringify(bidOn));
  const depHome = childGateFixture('1', 'depart-homebody');
  check('gate depart-homebody ON: holder leaves, homebody companion does NOT (range-0, startExpedition no-op)',
    !depHome.error && depHome.holderExped === true && depHome.companionExped === false,
    JSON.stringify(depHome));
  const depFor = childGateFixture('1', 'depart-forager');
  check('gate depart-forager ON: holder AND forager companion both leave',
    !depFor.error && depFor.holderExped === true && depFor.companionExped === true,
    JSON.stringify(depFor));
}

// ---------- 4. Recorder: live in-memory run (shape) ----------
async function liveRuns() {
  console.log('== recorder live ==');
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(103411);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  const noOrigin = (out.v4encounters || []).find(function (r) { return !r.origin || typeof r.origin !== 'string'; });
  check('every recorded v4encounters row carries an origin string', !noOrigin, noOrigin ? JSON.stringify(noOrigin).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4gates || []).length + ' gate rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.launchdefSkips || []).length + ' skip rows');
  return out;
}

// ---------- 5. Determinism legs D1/D2 + flag-inert (60d, VETREENGAGE=1) ----------
function childRun(days, seed, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), VETREENGAGE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/profilegate-driver-20261117.js');" +
    "d.oneRun(" + seed + ").then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
function poolShapeOf(full) {
  const rows = full.companionPool || [];
  const empty = rows.filter(function (r) { return (r.eligible || []).length === 0; }).length;
  const elig = rows.reduce(function (t, r) { return t + (r.eligible || []).length; }, 0);
  return { dawns: rows.length, empty: empty,
    emptyShare: rows.length ? empty / rows.length : null,
    meanEligible: rows.length ? elig / rows.length : null };
}
async function determinism() {
  console.log('== determinism legs D1/D2 + flag-inert ==');
  // D1/D2 in each PROFILEGATE state (60d, seed 103411).
  const fpByState = {};
  for (const pg of ['0', '1']) {
    const a = childRun(60, 103411, { MODE: 'on', PROFILEGATE: pg });
    const b = childRun(60, 103411, { MODE: 'on', PROFILEGATE: pg });
    fpByState[pg] = a.fp;
    check('D1 repeatability PROFILEGATE=' + pg + ': identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childRun(60, 103411, { MODE: 'on', PROFILEGATE: pg, PROFILEGATE_RECORDER: 'off' });
    check('D2 wrap neutrality PROFILEGATE=' + pg + ': identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run PROFILEGATE=' + pg + ' carries empty recorder arrays (v4/dawnbid/pool/skips)',
      (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
      (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
      (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
    check('D2 recorder-off run PROFILEGATE=' + pg + ' has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  }
  // Flag-inert (reverted lever): the GAME trajectory must not depend on
  // PROFILEGATE. The fingerprint excludes recorder arrays (the driver's
  // flag-aware pool replica still scores pools per state — instrument
  // behavior, not game behavior), so fp equality is the game-level proof.
  check('flag-inert: PROFILEGATE=1 vs 0 identical game trajectories (60d, seed 103411)',
    JSON.stringify(fpByState['0']) === JSON.stringify(fpByState['1']),
    'fp0=' + JSON.stringify(fpByState['0']).slice(0, 200) + ' fp1=' + JSON.stringify(fpByState['1']).slice(0, 200));
  // Gate-act RETIRED (see header): the 150d seed-103413 check exercised
  // the lever, which is gone by disposition, and its fixture seed plants
  // no plans on the rebased base. Do not re-add a 150d gate-act check
  // without a live fixture seed on the current base.
}

async function main() {
  try {
    staticChecks();
    analyzerFixtures();
    await liveRuns();
    await gateLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
}

if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
module.exports = { gateFixture: gateFixture };
