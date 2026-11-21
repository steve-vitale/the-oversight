// test-profilegate4-confirm-b.js — proof for arm sim-profilegate-confirm-b (SCOPED LEVER:
// relax the companion profile gate ONLY for wave-4+ plan holders,
// PROFILEGATE4=1 + plan.needWave >= 4, default OFF; findings #2638/#2605).
// Frozen prereg: evidence/2026-11-21/sim-profilegate-confirm-b-prereg.md.
// Base (frozen): master df4867134afa. Band: 106751–106766, 150d, full substrate
// (SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FIGHTALLY2=1 ALLYSLOT3=1
// LAUNCHSURVIVE=1 on every leg; legs differ ONLY by PROFILEGATE4).
//
// Fixture staging (local_proof_of_effect): the staged holder + companion
// are geared before the bid/depart (Game.villagerGearUp, acquire=true —
// the same gear-up departure itself performs), so the fixture stages a
// geared party, never a fresh un-geared solo. Encounter average it claims
// to match: launched parties in the parent arm's corpora were armed and
// armored (gate rows allArmed/allArmored); the fixture records the
// staged pair's armed/armored read beside the bid. Proofs demonstrate
// the OBSERVABLE effect (companions actually picked / launched), not
// just green assertions.
//
// ANCHOR RULE: the anchor assertion reads the CORPUS files' stamped
// anchorCommit (frozen df4867134afa), NOT live HEAD — it must stay green
// after the coordinator rebases the branch at landing. Before the legs
// run there are no corpora yet, so the check passes on the stamp
// mechanism (driver ANCHOR export is a 40-hex commit) and asserts the
// frozen constant; once leg corpora exist it asserts every file's stamp.
//
// DEVIATION (recorded, not hidden): the prereg says the homebody
// range-0 block is "proven by companionLaunchable returning false" —
// companionLaunchable is module-internal in win-plan.js (not exposed on
// Game), so no harness can call it. The proof instead reads its EXACT
// range-0 condition (Game.npcMaxDist(companion) < 1 — the same read the
// depart block and the homebody-voice guard use) AND proves the block
// behaviorally (depart-homebody: holder leaves, homebody does not).
// Same observable effect, same code path exercised.
//
// The gate fixture runs in child processes (one harness per process):
//   PROFILEGATE4=1 GATE_VARIANT=bid node -e "require('./scripts/test-profilegate4-confirm-b.js').gateFixture().then(function(r){console.log(JSON.stringify(r));})"
// Variants: bid | bid-scope | bid-homebody | depart-homebody | depart-forager.
// Usage:
//   node scripts/test-profilegate4-confirm-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
// Frozen substrate on every leg of this arm (prereg §Substrate).
process.env.SENSEEXPED = '1';
process.env.PARTYSIZE4 = '1';
process.env.VETREENGAGE = '1';
process.env.FIGHTALLY2 = '1';
process.env.ALLYSLOT3 = '1';
process.env.LAUNCHSURVIVE = '1';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate4-confirm-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'profilegate4-driver-20261121.js'));

const EXPECTED_BASE = 'df4867134afa';
const EXPECTED_POLICY_SHA = '1884c8852d38';

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function frozenBase() {
  if (process.env.PROFILEGATE4_BASE) return process.env.PROFILEGATE4_BASE.trim();
  return EXPECTED_BASE;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
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
// diffHunks(base, dir): [{ file, newStart, newCount }] from git diff -U0.
function diffHunks(base, dir) {
  try {
    const out = execSync('git diff -U0 ' + base + ' -- ' + dir, { cwd: REPO }).toString();
    const hunks = [];
    let file = null;
    for (const line of out.split('\n')) {
      const dm = /^diff --git a\/(\S+) b\/(\S+)/.exec(line);
      if (dm) { file = dm[2]; continue; }
      const hm = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (hm && file) hunks.push({ file: file, newStart: parseInt(hm[1], 10), newCount: hm[2] == null ? 1 : parseInt(hm[2], 10) });
    }
    return hunks;
  } catch (e) { return [{ file: 'GIT-UNAVAILABLE', newStart: -1, newCount: 0 }]; }
}

// ---------- 1. Static ----------
function staticChecks() {
console.log('== static ==');
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
check('frozen base is the prereg anchor df4867134afa', BASE === EXPECTED_BASE);
try {
  execSync('git merge-base --is-ancestor ' + BASE + ' HEAD', { cwd: REPO });
  check('frozen base is an ancestor of HEAD', true);
} catch (e) { check('frozen base is an ancestor of HEAD', false, 'not an ancestor'); }
// CONFIRM arm: NO src/ change — the lever is already on master (commit
// 84e57fcc3) and the frozen base df4867134afa contains it. The diff vs
// the frozen base must be EMPTY; the lever-presence checks below
// (content reads) prove the landed lever is the scoped one.
const srcDiff = gitDiffNames(BASE, 'src/');
const srcStatus = gitStatusNames('src/');
check('src/ diff vs frozen base is EMPTY (confirm arm makes no src/ change)',
  srcDiff.length === 0 && srcStatus.length === 0,
  'diff=' + JSON.stringify(srcDiff) + ' status=' + JSON.stringify(srcStatus));
const hunks = diffHunks(BASE, 'src/');
check('src/ diff hunks: none (no src/ change in this arm)',
  hunks.length === 0, 'hunks=' + JSON.stringify(hunks));
const pinquadOk = hunks.every(function (h) {
  if (h.file === 'src/js/villager-brain.js') return !(h.newStart >= 1200 && h.newStart <= 1320);
  if (h.file === 'src/js/win-plan.js') return !(h.newStart >= 1100 && h.newStart <= 1220);
  return true;
});
check('PINQUAD blocks untouched (no hunk near brain ~1269 / win-plan ~1152, held by sim-pinquaddoor-b)',
  pinquadOk, 'hunks=' + JSON.stringify(hunks));
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const SCOPED = "if (!profilegate4OpenFor(self, vid) && prof !== 'wanderer' && prof !== 'explorer') continue;";
const UNGUARDED = "if (prof !== 'wanderer' && prof !== 'explorer') continue;";
check('lever present: scoped gate line in the brain twin',
  brainJs.indexOf(SCOPED) !== -1);
check('lever present: scoped gate line in the win-plan twin',
  winplanJs.indexOf(SCOPED) !== -1);
check('unguarded profile check GONE from both twins (old gate replaced, not doubled)',
  brainJs.indexOf(UNGUARDED) === -1 && winplanJs.indexOf(UNGUARDED) === -1);
check('env gate present in both twins (profilegate4On + PROFILEGATE4=1, default OFF)',
  brainJs.indexOf('function profilegate4On()') !== -1 && winplanJs.indexOf('function profilegate4On()') !== -1 &&
  brainJs.indexOf("process.env.PROFILEGATE4 === '1'") !== -1 && winplanJs.indexOf("process.env.PROFILEGATE4 === '1'") !== -1);
check('scope helper present in both twins (profilegate4OpenFor, needWave >= 4)',
  brainJs.indexOf('function profilegate4OpenFor(self, vid)') !== -1 && winplanJs.indexOf('function profilegate4OpenFor(self, vid)') !== -1 &&
  brainJs.indexOf('((plan.needWave | 0) >= 4)') !== -1 && winplanJs.indexOf('((plan.needWave | 0) >= 4)') !== -1);
check('parent flag NOT reused: no process.env.PROFILEGATE (bare) read in either twin',
  brainJs.indexOf("process.env.PROFILEGATE === '1'") === -1 && winplanJs.indexOf("process.env.PROFILEGATE === '1'") === -1);
check('depart bypass landed in villager-agency.js and untouched by this arm',
  agencyJs.indexOf('PROFILEGATE (sim-profilegate-a)') !== -1 &&
  gitDiffNames(BASE, 'src/js/villager-agency.js').length === 0 &&
  gitStatusNames('src/js/villager-agency.js').length === 0,
  'agency diff=' + JSON.stringify(gitDiffNames(BASE, 'src/js/villager-agency.js')));
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
  'scripts/profilegate4-confirm-b-driver-20261121.js',
  'scripts/analyze-profilegate4-confirm-b.js',
  'scripts/profilegate4-confirm-b-drift-check.js',
  'scripts/build-profilegate4-confirm-b-panels-20261121.js',
  'scripts/test-profilegate4-confirm-b.js',
];
const scriptsDiff = gitDiffNames(BASE, 'scripts/');
const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
check('scripts diff vs base + untracked is the profilegate4 instrument only (5 files)',
  JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
  'union=' + JSON.stringify(scriptsUnion));
check('profilegate4 instrument files exist',
  EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'profilegate4-driver-20261121.js'), 'utf8');
check('driver poolReplica is PROFILEGATE4- AND scope-aware (needWave >= 4)',
  driverSrc.indexOf('holderNeedWave') !== -1 &&
  driverSrc.indexOf("((holderNeedWave | 0) >= 4)") !== -1 &&
  driverSrc.indexOf("needWave: holderNeedWave") !== -1 &&
  driverSrc.indexOf("needWave: (plan && plan.needWave != null ? plan.needWave : null)") !== -1);
check('driver recorder flag is PROFILEGATE4_RECORDER',
  driverSrc.indexOf("process.env.PROFILEGATE4_RECORDER !== 'off'") !== -1);
check('driver accepts legs off|on|rec|rec0',
  driverSrc.indexOf("MODE !== 'off' && MODE !== 'on' && MODE !== 'rec' && MODE !== 'rec0'") !== -1);
check('driver exports poolReplica + oneRun + ANCHOR',
  typeof DRIVER.poolReplica === 'function' && typeof DRIVER.oneRun === 'function' &&
  typeof DRIVER.ANCHOR === 'string' && /^[0-9a-f]{40}$/.test(DRIVER.ANCHOR));
check('analyzer exports computeBars + deriveMaxHp + armOnlyStarv + anchorReport',
  typeof ANALYZE.computeBars === 'function' && typeof ANALYZE.deriveMaxHp === 'function' &&
  typeof ANALYZE.armOnlyStarv === 'function' && typeof ANALYZE.anchorReport === 'function');
check('analyzer ANCHOR12 is the frozen df4867134afa',
  ANALYZE.ANCHOR12 === EXPECTED_BASE);
}

// ---------- 2. Anchor (corpus files, frozen df4867134afa — NOT live HEAD) ----------
function anchorChecks() {
console.log('== anchor (corpus stamps, frozen df4867134afa) ==');
check('driver ANCHOR export is a 40-hex commit (the stamp mechanism works)',
  typeof DRIVER.ANCHOR === 'string' && /^[0-9a-f]{40}$/.test(DRIVER.ANCHOR));
check('analyzer ANCHOR12 is the frozen base', ANALYZE.ANCHOR12 === EXPECTED_BASE);
const dirs = ['perseed-profilegate4-confirm-b-off', 'perseed-profilegate4-confirm-b-on', 'perseed-profilegate4-confirm-b-rec', 'perseed-profilegate4-confirm-b-rec0'];
let anyCorpus = false;
for (const d of dirs) {
  const dir = path.join(REPO, 'evidence', '2026-11-21', d);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); });
  if (!files.length) continue;
  anyCorpus = true;
  const bySeed = {};
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  const rep = ANALYZE.anchorReport(bySeed);
  check('corpus anchors in ' + d + ' all start with df4867134afa (' + files.length + ' files)',
    rep.allMatch, 'bad=' + JSON.stringify(rep.badSeeds));
}
if (!anyCorpus) console.log('  info: no leg corpora on disk yet — anchor asserted on corpora when present (analyzer B5 covers the judged legs)');
}

// ---------- 3. Analyzer fixtures ----------
function analyzerFixtures() {
console.log('== analyzer fixtures ==');
function mkSeed(over) {
  const j = {
    seed: 106764, days: 150, gameDays: 150, endReason: 'survived',
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
    needWave: o.needWave != null ? o.needWave : 4,
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
(function () { // F1: needWave>=4 pool-shape filter (B1 population) + all-dawns table
  const j = mkSeed();
  j.companionPool = [
    poolRow(20, 'v1', { needWave: 4, gateOpen: false, eligible: [],
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
      members: [
        member('c1', 'forager', 'notRanger'),
        member('c2', 'wanderer', 'away', { away: true }),
        { id: 'v1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
        { id: 's1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
      ] }),
    poolRow(21, 'v1', { needWave: 4, gateOpen: true, eligible: ['c1', 'c3'], rankedPick: 'c1', bidCompanion: 'c1', agree: true,
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 },
      members: [
        member('c1', 'forager', 'eligible'),
        member('c3', 'homebody', 'eligible'),
        member('c2', 'wanderer', 'away', { away: true }),
        { id: 'v1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
        { id: 's1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
      ] }),
    // needWave-3 dawn (old gate on BOTH legs): 2 eligible under the old
    // gate — it must NOT count toward the B1 (needWave>=4) shape.
    poolRow(22, 'v1', { needWave: 3, gateOpen: false, eligible: ['c2', 'c4'], rankedPick: 'c2', bidCompanion: 'c2', agree: true,
      counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 },
      members: [
        member('c2', 'wanderer', 'eligible'),
        member('c4', 'explorer', 'eligible'),
        { id: 'v1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
        { id: 's1', profile: null, trust: 10, trustRaw: null, node: null, away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' },
      ] }),
  ];
  const r = ANALYZE.funnelForSeed(j);
  check('F1 poolShape (needWave>=4 only): 2 dawns, 1 empty, emptyShare 0.5, meanEligible 1.0',
    r.poolShape.dawns === 2 && r.poolShape.empty === 1 && r.poolShape.emptyShare === 0.5 && r.poolShape.meanEligible === 1,
    JSON.stringify(r.poolShape));
  check('F1 poolShapeAll: 3 dawns, 1 empty, eligSum 4, meanEligible 1.333 (scope effect visible)',
    r.poolShapeAll.dawns === 3 && r.poolShapeAll.empty === 1 && r.poolShapeAll.eligSum === 4 && r.poolShapeAll.meanEligible === 1.333,
    JSON.stringify(r.poolShapeAll));
  check('F1 pickedProfiles (v4): the ON dawn picked a forager; agree 1/1',
    r.poolShape.pickedProfiles.forager === 1 && r.poolShape.agreeTrue === 1 && r.poolShape.agreeFalse === 0 && r.poolShape.agreeRate === 1,
    JSON.stringify(r.poolShape.pickedProfiles) + ' agree=' + r.poolShape.agreeTrue + '/' + r.poolShape.agreeFalse);
  check('F1 wouldBeNotRanger (v4): 3 members fail profile under the OLD gate (1 OFF + 2 ON)',
    r.poolShape.wouldBeNotRanger === 3, 'got ' + r.poolShape.wouldBeNotRanger);
  check('F1 gateOpenRows (v4): 1 of 2 wave-4+ pool rows ran with the scoped gate open',
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
  const onRaw = { 106741: rawDeaths(106741, [5, 9]), 106742: rawDeaths(106742, [12]) };
  const offRaw = { 106741: rawDeaths(106741, [5]), 106742: rawDeaths(106742, [12]) };
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
    d2On: 0, d2Off: 0, w4Match: true, anchorAll: true,
    files: { on: 16, off: 16, rec: 16, rec0: 16 }, errors: { on: 0, off: 0, rec: 0, rec0: 0 } };
  const go = ANALYZE.computeBars(Object.assign({}, base, { on: sum(), off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 bars GO case: B1+B2+B3+B5 pass -> GO',
    go.bar1 && go.bar2 && go.bar3 && go.bar5 && go.verdict === 'GO' && go.bar4.tracked === true,
    JSON.stringify({ b1: go.bar1, b2: go.bar2, b3: go.bar3, b5: go.bar5, v: go.verdict }));
  const b1edge = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ poolShape: { dawns: 100, empty: 47, emptyShare: 0.47, meanEligible: 1.5 } }),
    off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 B1 edge passes (emptyShare 0.47 = bar, meanEligible 1.5 = bar)',
    b1edge.bar1 && b1edge.verdict === 'GO', JSON.stringify({ b1: b1edge.bar1, v: b1edge.verdict }));
  const b1fail = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ poolShape: { dawns: 87, empty: 80, emptyShare: 0.92, meanEligible: 0.1 } }),
    off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 B1 fail (emptyShare 0.92) -> NO-GO', !b1fail.bar1 && b1fail.verdict === 'NO-GO');
  const b1failMean = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum({ poolShape: { dawns: 87, empty: 10, emptyShare: 0.115, meanEligible: 1.4 } }),
    off: sum({ launchedInstances: 3, medianSurvival: 150 }) }));
  check('F4 B1 fail (meanEligible 1.4 < 1.5) -> NO-GO', !b1failMean.bar1 && b1failMean.verdict === 'NO-GO');
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
  const b5anchorFail = ANALYZE.computeBars(Object.assign({}, base, {
    on: sum(), off: sum({ launchedInstances: 3, medianSurvival: 150 }), anchorAll: false }));
  check('F4 B5 fail (anchor mismatch: anchorAll false) -> NO-GO',
    !b5anchorFail.bar5 && b5anchorFail.verdict === 'NO-GO',
    JSON.stringify({ b5: b5anchorFail.bar5, v: b5anchorFail.verdict }));
})();
(function () { // F5: anchorReport fixture (corpus-anchor check, part of B5)
  const good = { 106741: { seed: 106741, anchorCommit: 'df4867134afaf556232c4a7c377a4595b644a55c' },
    106742: { seed: 106742, anchorCommit: 'df4867134afaabcdef' } };
  const rep = ANALYZE.anchorReport(good);
  check('F5 anchorReport: matching anchors -> allMatch, anchors listed',
    rep.allMatch === true && rep.anchors[106741] === 'df4867134afa' && rep.badSeeds.length === 0,
    JSON.stringify(rep));
  const bad = { 106741: { seed: 106741, anchorCommit: 'df4867134afaf556232c4a7c377a4595b644a55c' },
    106742: { seed: 106742, anchorCommit: '9c4ed7a8700000000000000000000000000000000' } };
  const rep2 = ANALYZE.anchorReport(bad);
  check('F5 anchorReport: one moved anchor -> allMatch false, badSeeds names it',
    rep2.allMatch === false && rep2.badSeeds.length === 1 && rep2.badSeeds[0] === 106742,
    JSON.stringify(rep2));
  const missing = { 106741: { seed: 106741 } };
  check('F5 anchorReport: missing anchorCommit -> allMatch false',
    ANALYZE.anchorReport(missing).allMatch === false);
})();
}

// ---------- 4. Gate fixture (live, staged — runs in a child process) ----------
// gateFixture(variant): one harness per process. Variants:
//   bid — stage a wave-4+ plan on a non-ranger holder at Haven, away all
//     rangers, and ask the dawn feed for candidates.
//   bid-scope — the same staging with a needWave-3 plan: the gate must
//     stay closed in BOTH PROFILEGATE4 states.
//   bid-homebody — stage ONLY a homebody companion (foragers awayed): ON
//     must pick the homebody at dawn, and its npcMaxDist must be < 1
//     (the exact range-0 condition inside companionLaunchable, which is
//     module-internal and cannot be called from the harness).
//   depart-homebody / depart-forager — stage a party_launch commit naming
//     the homebody / forager companion and tick agency once.
// The staged holder + companion are geared first (villagerGearUp,
// acquire=true — the same gear-up departure performs), and the fixture
// records their armed/armored read. Returns a JSON-able result; the
// main runner asserts per variant+flag.
function gearOf(Game, vid) {
  try {
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person) return { armed: false, armored: false };
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const items = (Game.data && Game.data.items) || [];
    let armorP = 0, weaponB = 0;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
    let carriesWeapon = false;
    try {
      for (let i = 0; i < ((person.items || []).length); i++) {
        const ent = person.items[i] || {};
        const iid = ent.itemId || ent.id || ent;
        let def = null;
        for (let j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
        if (def && def.weapon) { carriesWeapon = true; break; }
      }
    } catch (e) {}
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0 };
  } catch (e) { return { armed: false, armored: false }; }
}
async function gateFixture(variant) {
  variant = variant || process.env.GATE_VARIANT || 'bid';
  const gateOn = process.env.PROFILEGATE4 === '1';
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
  const { Game } = await loadGame({ seed: seed, mode: 'profilegate4-gate-test', fullTelemetry: false });
  await setupGame(Game);
  Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  const needWave = variant === 'bid-scope' ? 3 : 4;
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
  function maxDist(rid) {
    try { return Game.npcMaxDist ? Game.npcMaxDist(rid) : null; } catch (e) { return null; }
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
  // Stage the plan on the holder (read-only shape for winPlanCands).
  // needWave 4 for bid / bid-homebody / depart-*, needWave 3 for bid-scope.
  v.winPlan = v.winPlan || {};
  v.winPlan[holder] = { stage: 'party', target: 'eulogy', needWave: needWave, party: [], sinceDay: today, holdSinceDay: -1 };
  // Away every ranger, so ONLY foragers/homebodies can be eligible.
  // bid-homebody additionally aways foragers (except the holder) so
  // only a homebody can be picked.
  for (const rid of (v.roster || [])) {
    const prof = profOf(rid);
    if (prof === 'wanderer' || prof === 'explorer') { v.away = v.away || {}; v.away[rid] = true; }
    if (variant === 'bid-homebody' && prof === 'forager' && rid !== holder) { v.away = v.away || {}; v.away[rid] = true; }
  }
  // Staged companions: one forager + one homebody at Haven. For the BID
  // variants they must pass the full findCompanion bars (healthy, not
  // engaged, trusted) because the bid itself applies them. For the DEPART
  // variants only the range-0 block is under test — the commit names the
  // companion directly, so health/engagement do not gate staging there.
  let foragerComp = null, homebodyComp = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId || rid === holder) continue;
    if (!atHaven(rid) || !alive(rid)) continue;
    if ((variant === 'bid' || variant === 'bid-scope' || variant === 'bid-homebody') && (!healthy(rid) || engaged(rid))) continue;
    if (((v.away || {})[rid])) continue;
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      if (a && a.exped && a.exped[rid]) continue;
    } catch (e) {}
    const prof = profOf(rid);
    if (prof === 'forager' && !foragerComp) { foragerComp = rid; v.trust = v.trust || {}; v.trust[rid] = 50; }
    if (prof === 'homebody' && !homebodyComp) { homebodyComp = rid; v.trust = v.trust || {}; v.trust[rid] = 50; }
  }
  const needComp = variant === 'bid-homebody' ? homebodyComp : (foragerComp || homebodyComp);
  if (!needComp) return { variant: variant, gateOn: gateOn, stagingFailed: true, error: 'no-staged-companion', holder: holder, holderProfile: holderProfile };
  // Encounter gear (local_proof_of_effect): gear the staged holder +
  // companion the way departure would, and record the read.
  let holderGear = null, compGear = null;
  try { if (Game.villagerGearUp) Game.villagerGearUp(holder, true); } catch (e) {}
  try { if (Game.villagerGearUp && needComp) Game.villagerGearUp(needComp, true); } catch (e) {}
  holderGear = gearOf(Game, holder);
  compGear = gearOf(Game, needComp);
  if (variant === 'bid' || variant === 'bid-scope' || variant === 'bid-homebody') {
    const cands = Game.vbrainFeedExtras(holder, [], hx, hy);
    const launch = (cands || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
    const wait = (cands || []).find(function (c) { return c && c.winPlanAction === 'party_wait'; });
    const picked = launch ? launch.companion : null;
    return { variant: variant, gateOn: gateOn, needWave: needWave,
      holder: holder, holderProfile: holderProfile, holderGear: holderGear,
      foragerComp: foragerComp, homebodyComp: homebodyComp,
      launchCompanion: picked,
      launchCompanionProfile: picked ? profOf(picked) : null,
      launchCompanionMaxD: picked ? maxDist(picked) : null,
      launchCompanionGear: picked ? gearOf(Game, picked) : null,
      stagedCompanionGear: compGear,
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
  return { variant: variant, gateOn: gateOn, needWave: needWave,
    holder: holder, holderProfile: holderProfile, holderGear: holderGear,
    companion: targetComp, companionProfile: profOf(targetComp),
    companionMaxD: maxDist(targetComp), companionGear: gearOf(Game, targetComp),
    holderExped: holderExped, companionExped: companionExped };
  }
}
function childGateFixture(profilegate4, variant) {
  const env = Object.assign({}, process.env, { PROFILEGATE4: profilegate4, GATE_VARIANT: variant });
  const script = "const t=require('./scripts/test-profilegate4-confirm-b.js');" +
    "t.gateFixture().then(function(r){console.log(JSON.stringify(r));}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function gateLive() {
  console.log('== gate live (child processes, seeds 103413+) ==');
  const bidOff = childGateFixture('0', 'bid');
  check('gate bid OFF (needWave 4): no party_launch candidate when only foragers/homebodies are eligible (party_wait instead)',
    !bidOff.error && bidOff.launchCompanion == null && bidOff.hasWait === true,
    JSON.stringify(bidOff));
  const bidOn = childGateFixture('1', 'bid');
  check('gate bid ON (needWave 4): a non-ranger companion IS picked at dawn (forager/homebody, not a ranger)',
    !bidOn.error && bidOn.launchCompanion != null &&
    (bidOn.launchCompanionProfile === 'forager' || bidOn.launchCompanionProfile === 'homebody'),
    JSON.stringify(bidOn));
  console.log('  info: bid ON picked ' + bidOn.launchCompanion + ' (' + bidOn.launchCompanionProfile + '), holderGear=' +
    JSON.stringify(bidOn.holderGear) + ' pickedGear=' + JSON.stringify(bidOn.launchCompanionGear));
  const scopeOff = childGateFixture('0', 'bid-scope');
  check('gate SCOPE OFF (needWave 3): no party_launch candidate (old gate)',
    !scopeOff.error && scopeOff.launchCompanion == null,
    JSON.stringify(scopeOff));
  const scopeOn = childGateFixture('1', 'bid-scope');
  check('gate SCOPE ON (needWave 3): STILL no party_launch candidate — the scoped gate stays closed below wave 4',
    !scopeOn.error && scopeOn.launchCompanion == null,
    JSON.stringify(scopeOn));
  const hbOn = childGateFixture('1', 'bid-homebody');
  check('gate bid-homebody ON: the homebody IS picked at dawn (not a roster slot — a named homebody)',
    !hbOn.error && hbOn.launchCompanion != null && hbOn.launchCompanionProfile === 'homebody',
    JSON.stringify(hbOn));
  check('gate bid-homebody ON: the picked homebody is range-0 (npcMaxDist < 1 — companionLaunchable\'s exact block condition)',
    !hbOn.error && hbOn.launchCompanionMaxD != null && hbOn.launchCompanionMaxD < 1,
    'maxD=' + JSON.stringify(hbOn.launchCompanionMaxD));
  const depHome = childGateFixture('1', 'depart-homebody');
  check('gate depart-homebody ON: holder leaves, homebody companion does NOT (range-0, startExpedition no-op)',
    !depHome.error && depHome.holderExped === true && depHome.companionExped === false,
    JSON.stringify(depHome));
  const depFor = childGateFixture('1', 'depart-forager');
  check('gate depart-forager ON: holder AND forager companion both leave (the landed depart bypass lets a picked non-ranger depart)',
    !depFor.error && depFor.holderExped === true && depFor.companionExped === true,
    JSON.stringify(depFor));
}

// ---------- 5. Recorder: live in-memory run (shape) ----------
async function liveRuns() {
  console.log('== recorder live ==');
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'profilegate4-driver-20261121.js'))];
  const driver = require(path.join(REPO, 'scripts', 'profilegate4-driver-20261121.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(106764);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run policy sha is the frozen competent verbatim (' + EXPECTED_POLICY_SHA + ')',
    out.policySha === EXPECTED_POLICY_SHA, 'got ' + out.policySha);
  const noOrigin = (out.v4encounters || []).find(function (r) { return !r.origin || typeof r.origin !== 'string'; });
  check('every recorded v4encounters row carries an origin string', !noOrigin, noOrigin ? JSON.stringify(noOrigin).slice(0, 300) : '');
  const noNeedWave = (out.companionPool || []).find(function (r) { return r.needWave == null; });
  check('every recorded companionPool row carries needWave', !noNeedWave, noNeedWave ? JSON.stringify(noNeedWave).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4gates || []).length + ' gate rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.launchdefSkips || []).length + ' skip rows');
  return out;
}

// ---------- 6. Determinism legs D1/D2 + live gate-act (150d, seed 106764) ----------
function childRun(days, seed, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/profilegate4-confirm-b-driver-20261121.js');" +
    "d.oneRun(" + seed + ").then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
function poolShapeOf(full) {
  // B1 population: needWave>=4 pool rows only.
  const rows = (full.companionPool || []).filter(function (r) { return ((r.needWave | 0) >= 4); });
  const empty = rows.filter(function (r) { return (r.eligible || []).length === 0; }).length;
  const elig = rows.reduce(function (t, r) { return t + (r.eligible || []).length; }, 0);
  return { dawns: rows.length, empty: empty,
    emptyShare: rows.length ? empty / rows.length : null,
    meanEligible: rows.length ? elig / rows.length : null };
}
async function determinism() {
  console.log('== determinism legs D1/D2 (60d, seed 106764, full substrate) ==');
  // D1/D2 in each PROFILEGATE4 state (60d, seed 106764).
  for (const pg of ['0', '1']) {
    const a = childRun(60, 106764, { MODE: 'on', PROFILEGATE4: pg });
    const b = childRun(60, 106764, { MODE: 'on', PROFILEGATE4: pg });
    check('D1 repeatability PROFILEGATE4=' + pg + ': identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childRun(60, 106764, { MODE: 'on', PROFILEGATE4: pg, PROFILEGATE4_RECORDER: 'off' });
    check('D2 wrap neutrality PROFILEGATE4=' + pg + ': identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run PROFILEGATE4=' + pg + ' carries empty recorder arrays (v4/dawnbid/pool/skips)',
      (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
      (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
      (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
    check('D2 recorder-off run PROFILEGATE4=' + pg + ' has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  }
  // Live gate-act check (150d, fixture seed 106764): the OFF leg must
  // score pool dawns (probed live at 28 v4 dawns, 19 empty (OFF); ON 26 dawns, 0 empty, mean 2.808) and the ON leg must
  // fill the pool (the B1 bar, on this seed).
  console.log('== live gate-act (150d, seed 106764) ==');
  const offRun = childRun(150, 106764, { MODE: 'off', PROFILEGATE4: '0' });
  const onRun = childRun(150, 106764, { MODE: 'on', PROFILEGATE4: '1' });
  const offShape = poolShapeOf(offRun.full);
  const onShape = poolShapeOf(onRun.full);
  console.log('  info: gate-act OFF pool (needWave>=4): ' + JSON.stringify(offShape) +
    '  ON pool: ' + JSON.stringify(onShape));
  check('gate-act OFF: pool dawns >= 1 on seed 106764 (probed live at 28 v4 dawns, 19 empty (OFF); ON 26 dawns, 0 empty, mean 2.808)',
    offShape.dawns >= 1, 'dawns=' + offShape.dawns);
  check('gate-act ON: pool fills on seed 106764 (emptyShare <= 0.47, meanEligible >= 1.5)',
    onShape.dawns >= 1 && onShape.emptyShare != null && onShape.emptyShare <= 0.47 &&
    onShape.meanEligible != null && onShape.meanEligible >= 1.5,
    'ON=' + JSON.stringify(onShape) + ' OFF=' + JSON.stringify(offShape));
  check('gate-act runs carry 0 instrument errors on both legs',
    (offRun.full.instrumentErrors || []).length === 0 && (onRun.full.instrumentErrors || []).length === 0,
    'off=' + JSON.stringify((offRun.full.instrumentErrors || []).slice(0, 2)) +
    ' on=' + JSON.stringify((onRun.full.instrumentErrors || []).slice(0, 2)));
}

async function main() {
  try {
    staticChecks();
    analyzerFixtures();
    anchorChecks();
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
