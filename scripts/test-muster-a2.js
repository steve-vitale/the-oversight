// test-muster-a2.js — proof for arm sim-muster-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the driver wraps exist (incl. the new muster / musterExtra
// streams, the vbrainFeedExtras ask-diff, and the extended pool members),
// ZERO src/js change survives on the branch, the wave-4+ id set matches
// the data, the ask sites exist where the prereg says they do,
// classifyMusterAsk maps every ask kind correctly (incl. the gear_hold
// never-asked case), the analyzer selftest is green (one synthetic
// corpus per taxonomy row + determinism checks), a synthetic band
// classifies 100% with 0 unclassified, the classifier FAILS
// (unclassified) on a corpus stripped of the new stream (the muster
// stream is load-bearing, not decorative), and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 150d on seed
// 107617, with muster rows identical across replays, 0 instrument
// errors, and 0 tick-gate mismatches.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-muster-a2.js
// (Substrate flags are also set by the test itself when absent, so a
// bare `node scripts/test-muster-a2.js` works too.)
//
// NAME NOTE (prereg §13): scripts/test-muster-a.js already exists on
// master — the landed October 2026-10-30 sim-muster-a arm's fixture
// suite. This arm's proof test is -a2 so it never overwrites it.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// Substrate: the launchsilence band's flags (frozen in the prereg). Set
// here so a bare invocation runs the same substrate as the band.
for (const f of ['VETREENGAGE', 'PARTYSIZE4', 'FLEEREPAIR2', 'FIGHTALLY2', 'SENSEEXPED', 'BOWOPEN', 'SPEARGATE', 'GUNRATE', 'CELLGATE']) {
  if (process.env[f] === undefined) process.env[f] = '1';
}
// Policy layers MUST be off (tableseat-nowait + leanlinkrescue
// default-off -> competent verbatim). Never set by this test.
delete process.env.TABLESEATNOWAIT;
delete process.env.LEANLINKRESCUE;
// Full horizon for the live legs (the property under test is
// determinism/neutrality on band seeds, not a 30d smoke).
process.env.DAYS = '150';

const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-muster-a2.js'));
const DRIVER_PATH = path.join(REPO, 'scripts', 'muster-driver-a.js');
const DRIVER = require(DRIVER_PATH);

let pass = 0, fail = 0, skipped = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, detail) {
  skipped++; console.log('  SKIP: ' + name + (detail ? ' — ' + detail : ''));
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO, timeout: 90000 }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (srcStatus[0] === 'GIT-UNAVAILABLE') skip('ZERO src/js change (git status unavailable)', 'infrastructure');
else check('ZERO src/js change: src worktree diff is empty (' + JSON.stringify(srcStatus) + ')', srcStatus.length === 0);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (scriptsStatus[0] === 'GIT-UNAVAILABLE') skip('scripts diff is muster-a* files only (git status unavailable)', 'infrastructure');
else {
  const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/(muster-driver-a|analyze-muster-a2|test-muster-a2)\.js$/.test(s); });
  check('scripts worktree diff is muster-a* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
}
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
for (const w of ['muster', 'musterExtra', 'musterFeedCalls', 'vbrainFeedExtras',
  'winPlanSecondCompanion', 'winPlanThirdCompanion', 'classifyMusterAsk',
  'MUSTER_RECORDER', 'FROZEN_BASE', 'tableseatNowait', 'planIsWave4p',
  'loadWave4pIds', 'MODE must be ctl', 'refusing to overwrite',
  'TABLESEATNOWAIT/LEANLINKRESCUE must be unset', 'villagerId']) {
  check('driver defines/refuses ' + w, driverSrc.indexOf(w) !== -1);
}
// The October arm's files are untouched (name-collision guard, prereg §13).
const octStatus = gitStatus('scripts/analyze-muster-a.js scripts/test-muster-a.js').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (octStatus[0] === 'GIT-UNAVAILABLE') skip('October muster files untouched (git status unavailable)', 'infrastructure');
else check('October arm files untouched (analyze-muster-a.js, test-muster-a.js)', octStatus.length === 0, JSON.stringify(octStatus));
// Frozen base is this tree's HEAD (the prereg's frozen base).
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: REPO, timeout: 30000 }).toString().trim(); } catch (e) {}
check('driver FROZEN_BASE is this tree HEAD (' + head.slice(0, 12) + ')', DRIVER.FROZEN_BASE === head && head !== 'unknown', 'FROZEN_BASE=' + DRIVER.FROZEN_BASE);
// Policy shas recorded by the driver match the files on disk.
const h = function (f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', f), 'utf8')).digest('hex').slice(0, 12); };
check('tableseat-nowait policy file hashes computable', h('tableseat-nowait.js').length === 12 && h('leanlinkrescue.js').length === 12 && h('competent.js').length === 12);
// Wave-4+ id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4p = (rawMon.monsters || rawMon).filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
const frozenW4p = ['algorithm', 'audit', 'cancellation', 'congregation', 'eater', 'editor', 'eulogy', 'finale', 'finale_crew', 'finale_opening', 'herald', 'influencer', 'network_heart', 'network_limb', 'network_note', 'network_tower', 'nielsen', 'rerun', 'reunion', 'spoiler', 'strike', 'suburb', 'timeslot'].sort();
check('wave-4+ id set matches monsters.json (23 ids)', JSON.stringify(liveW4p) === JSON.stringify(frozenW4p), JSON.stringify(liveW4p));
check('driver loadWave4pIds matches monsters.json', JSON.stringify(DRIVER.loadWave4pIds()) === JSON.stringify(frozenW4p));
// The ask sites exist where the prereg says they do (call TEXT is the
// anchor — line numbers drift daily).
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
check('winPlanCands calls findCompanion once', brainJs.indexOf('var companion = findCompanion(self, vid, hx, hy);') !== -1);
check('winPlanCands gear_hold early return (stage gear, unarmed+unarmored)', brainJs.indexOf("if (stage === 'gear' && !gear.armed && !gear.armored) {") !== -1);
check('winPlanCands party_launch candidate (stage party/hunt/standing/table + companion)', brainJs.indexOf("winPlanAction: 'party_launch'") !== -1);
check('winPlanCands party_wait candidate (stage party, no companion)', brainJs.indexOf("winPlanAction: 'party_wait'") !== -1);
check('winPlanCands veteran_guard candidate (stage table + wave-4 kill, no companion)', brainJs.indexOf("winPlanAction: 'veteran_guard'") !== -1);
check('findCompanion trust floor 15 (undefined -> 10)', brainJs.indexOf("if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;") !== -1);
check('findCompanion profile gate (wanderer/explorer)', brainJs.indexOf("prof !== 'wanderer' && prof !== 'explorer'") !== -1);
const objectivesJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-objectives.js'), 'utf8');
check('objPick calls vbrainFeedExtras then vbrainScorePick (one feed+score pair)', objectivesJs.indexOf('this.vbrainFeedExtras(vid, cands, hx, hy)') !== -1 && objectivesJs.indexOf('this.vbrainScorePick(vid, cands, { rng: R })') !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('win-plan findCompanion mirrors the brain copy (same trust floor)', winPlanJs.indexOf("if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;") !== -1);
check('companionLaunchable armed-or-armored bar', winPlanJs.indexOf('if (!cg.armed && !cg.armored) return false;') !== -1);
check('companionLaunchable sick stays home', winPlanJs.indexOf("if ((self.state.village.sick || {})[cid]) return false;") !== -1);
check('second/third companion picks are pure reads (no gear-up)', winPlanJs.indexOf('winPlanSecondCompanion(vid, hx, hy, firstCid) {') !== -1 && winPlanJs.indexOf('winPlanThirdCompanion(vid, hx, hy, firstCid, secondCid) {') !== -1);

// ---------- 2. classifyMusterAsk (pure function, prereg §5a) ----------
console.log('== classifyMusterAsk ==');
(function askKinds() {
  const A = DRIVER.classifyMusterAsk;
  const plan = function (stage) { return { stage: stage, target: 'eater', needWave: 4 }; };
  let r = A(plan('party'), [{ winPlanAction: 'party_launch', companion: 'b', w: 5.0 }]);
  check('ask: party_launch -> asked, returned companion', r.askKind === 'party_launch' && r.asked === true && r.returned === 'b', JSON.stringify(r));
  r = A(plan('party'), [{ winPlanAction: 'party_wait', companion: null, w: 4.0 }]);
  check('ask: party_wait -> asked, returned null', r.askKind === 'party_wait' && r.asked === true && r.returned === null, JSON.stringify(r));
  r = A(plan('table'), [{ winPlanAction: 'veteran_guard', companion: null, w: 5.5 }]);
  check('ask: veteran_guard -> asked, returned null', r.askKind === 'veteran_guard' && r.asked === true && r.returned === null, JSON.stringify(r));
  r = A(plan('hunt'), []);
  check('ask: hunt + no candidate -> no-candidate, asked (findCompanion ran)', r.askKind === 'no-candidate' && r.asked === true && r.returned === null, JSON.stringify(r));
  r = A(plan('standing'), []);
  check('ask: standing + no candidate -> no-candidate, asked', r.askKind === 'no-candidate' && r.asked === true, JSON.stringify(r));
  r = A(plan('gear'), [{ winPlanAction: 'gear_hold', companion: null, w: 6.0 }]);
  check('ask: gear_hold -> NEVER ASKED (early return before findCompanion)', r.askKind === 'gear_hold' && r.asked === false && r.returned === null, JSON.stringify(r));
  r = A(plan('gear'), []);
  check('ask: gear + armed (no gear_hold, no candidate) -> no-candidate, asked', r.askKind === 'no-candidate' && r.asked === true, JSON.stringify(r));
  r = A(null, []);
  check('ask: no plan -> no-plan, never asked', r.askKind === 'no-plan' && r.asked === false, JSON.stringify(r));
  r = A(plan('party'), [{ winPlanAction: 'party_dance', companion: 'b', w: 5.0 }]);
  check('ask: unknown action surfaces as other:<action>, never silently mapped', r.askKind === 'other:party_dance' && r.asked === true, JSON.stringify(r));
})();

// ---------- 3. Analyzer ----------
console.log('== analyzer ==');
const st = ANALYZE.selftest();
check('analyzer selftest green (' + st.pass + ' passed, ' + st.fail + ' failed)', st.fail === 0, st.failures.join(' | '));
// Synthetic band: one corpus per taxonomy row + launchers + a found
// day — the band classifies 100% with 0 unclassified (the frozen
// bars 1–2 shape, on fixtures).
(function syntheticBand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muster-band-'));
  function base(seed, over) {
    const b = { seed: seed, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
      endReason: 'days', won: false, scaleRank: 'village', villagerId: 'scholar',
      v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
      dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
      havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
      muster: [], musterExtra: [], musterFeedCalls: 500,
      funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  function member(id, firstFail, over) {
    const m = { id: id, profile: 'homebody', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 },
      away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail,
      armed: true, armored: false, sick: false, health: 100, maxDist: 3, killer3: false };
    if (over) for (const k in over) m[k] = over[k];
    return m;
  }
  function musterRow(askKind, members, counts, over) {
    const r = { day: 100, part: 0, vid: 'a', stage: 'party', target: 'eater', needWave: 4, party: [],
      askKind: askKind, findCompanionAsked: askKind !== 'gear_hold', findCompanionReturned: null,
      addedCands: [{ winPlanAction: askKind, companion: null, w: 4.0 }],
      pool: { rosterN: 6, haven: { nx: 4, ny: 4 }, counts: counts, members: members } };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function census(vid, over) {
    const c = { day: 100, vid: vid, target: 'eater', needWave: 4, stage: 'party',
      holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false };
    if (over) for (const k in over) c[k] = over[k];
    return c;
  }
  const counts0 = { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 };
  const seeds = [
    base(900001, { v4departs: [{ day: 90, vid: 'a', result: 'launch', targetWave: 4 }] }),
    base(900002, { muster: [musterRow('party_wait',
      [member('h', 'selfOrScholar'), member('s', 'selfOrScholar'),
        member('b', 'notAtHaven', { node: { nx: 1, ny: 1 } }),
        member('c', 'notAtHaven', { node: { nx: 2, ny: 2 } }),
        member('d', 'notAtHaven', { node: { nx: 3, ny: 3 } }),
        member('e', 'notRanger')],
      Object.assign({}, counts0, { notAtHaven: 3, notRanger: 1 }))],
      planCensus: [census('a')] }),
    base(900003, { muster: [musterRow('party_wait',
      [member('h', 'selfOrScholar'), member('s', 'selfOrScholar'),
        member('b', 'notRanger'), member('c', 'notRanger'),
        member('d', 'notRanger'), member('e', 'notRanger')],
      Object.assign({}, counts0, { notRanger: 4 }))],
      planCensus: [census('a')] }),
    base(900004, { muster: [musterRow('gear_hold',
      [member('h', 'selfOrScholar'), member('s', 'selfOrScholar'),
        member('b', 'notRanger'), member('c', 'notRanger'),
        member('d', 'notRanger'), member('e', 'notRanger')],
      Object.assign({}, counts0, { notRanger: 4 }),
      { stage: 'gear', addedCands: [{ winPlanAction: 'gear_hold', companion: null, w: 6.0 }] })],
      planCensus: [census('a', { stage: 'gear' })] }),
    base(900005, { planCensus: [census('a', { holderExped: true })] }),
    base(900006, { planCensus: [census('scholar')] }),
    base(900007, { muster: [musterRow('party_wait',
      [member('h', 'selfOrScholar'), member('s', 'selfOrScholar'),
        member('b', 'trustLow', { trust: 10, trustRaw: null }),
        member('c', 'trustLow', { trust: 5, trustRaw: 5 }),
        member('d', 'trustLow', { trust: 12, trustRaw: 12 })],
      Object.assign({}, counts0, { trustLow: 3 }))],
      planCensus: [census('a')] }),
    // Brain-path homebody-handoff launch (launchsilence pilot 107522
    // d45 shape): the range-0 holder stays home, the companion walks.
    base(900008, { maxWave: 4,
      v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: 'party', target: 'eater', targetWave: 4 }],
      dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: 'eater', targetWave: 4 }] }),
    // Found day: eligible 1, launch offered — 0 events, not an
    // eligible-0 event.
    base(900009, { muster: [musterRow('party_launch',
      [member('h', 'selfOrScholar'), member('s', 'selfOrScholar'),
        member('b', 'eligible', { profile: 'wanderer' }),
        member('c', 'notRanger'), member('d', 'notRanger'), member('e', 'notRanger')],
      Object.assign({}, counts0, { notRanger: 3, eligible: 1 }),
      { askKind: 'party_launch', findCompanionReturned: 'b',
        addedCands: [{ winPlanAction: 'party_launch', companion: 'b', w: 5.0 }] })],
      dawnbidScores: [{ day: 100, vid: 'a', cands: [{ kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'b' }],
        commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'b' },
        pick: { kind: 'EXPEDITION', winPlanAction: 'party_launch' },
        logCands: [{ kind: 'EXPEDITION', score: 5.0, winPlanAction: 'party_launch' }],
        plan: { stage: 'party', target: 'eater', needWave: 4 } }],
      planCensus: [census('a')] }),
  ];
  seeds.forEach(function (s) { fs.writeFileSync(path.join(dir, 'muster-a-s' + s.seed + '-x.json'), JSON.stringify(s)); });
  const r = ANALYZE.analyzeDir(dir);
  check('synthetic band: 9 seeds read', r.seeds === 9, 'got ' + r.seeds);
  check('synthetic band: 2 launchers, 7 non-launchers', r.launchingSeeds === 2 && r.nonLaunchingSeeds === 7, JSON.stringify({ l: r.launchingSeeds, n: r.nonLaunchingSeeds }));
  check('synthetic band: 6 events, classified 6/6 (100%), 0 unclassified', r.eligible0Events === 6 && r.classifiedEvents === 6 && r.unclassifiedEvents === 0, JSON.stringify({ e: r.eligible0Events, c: r.classifiedEvents, u: r.unclassifiedEvents }));
  check('synthetic band: cause totals name each fixture', r.causeTotals['pool-empty:notAtHaven'] === 1 && r.causeTotals['pool-empty:notRanger'] === 1 && r.causeTotals['never-asked:stage-gear'] === 1 && r.causeTotals['never-asked:holder-not-scored'] === 2 && r.causeTotals['pool-empty:trustLow'] === 1, JSON.stringify(r.causeTotals));
  check('synthetic band: non-launcher gate population matches (6 events, 0 unclassified)', r.nonLauncherEvents === 6 && r.nonLauncherUnclassified === 0, JSON.stringify({ e: r.nonLauncherEvents, u: r.nonLauncherUnclassified }));
  check('synthetic band: 1 found day, 1 launch-offered day', r.foundDaysTotal === 1 && r.launchOfferedDaysTotal === 1, JSON.stringify({ f: r.foundDaysTotal, l: r.launchOfferedDaysTotal }));
  fs.rmSync(dir, { recursive: true, force: true });
})();
// Old-code-fails control: a corpus stripped of the muster stream (what
// a pre-muster corpus carries) must NOT classify a holder-day that
// should have been scored — it comes back unclassified, because
// without the muster stream the analyzer cannot tell a scored
// eligible-0 day from a never-scored one. The muster stream is
// load-bearing, not decorative.
(function oldCodeFails() {
  const stripped = { seed: 999002, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', villagerId: 'scholar',
    v4creates: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    musterExtra: [], musterFeedCalls: 0,
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }],
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
  // No `muster` key at all — the pre-muster shape.
  const c = ANALYZE.analyzeSeed(stripped);
  check('old-code control: stripped corpus classifies unclassified', c.totalEvents === 1 && c.unclassifiedEvents === 1, JSON.stringify({ t: c.totalEvents, u: c.unclassifiedEvents }));
})();

// ---------- 4. Live determinism (150d, seed 107617) ----------
console.log('== live determinism (150d, seed 107617) ==');
(async function live() {
  let run1 = null, run2 = null, runOff = null;
  try {
    run1 = await DRIVER.oneRun(107617);
  } catch (e) { check('live run 1 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  if (run1) {
    check('live run 1: vbrainFeedExtras wrap is live (musterFeedCalls > 0)', (run1.musterFeedCalls | 0) > 0, 'calls=' + run1.musterFeedCalls);
    check('live run 1: muster + musterExtra streams present (arrays)', Array.isArray(run1.muster) && Array.isArray(run1.musterExtra), 'muster=' + (run1.muster || []).length + ' extra=' + (run1.musterExtra || []).length);
    check('live run 1: 0 instrument errors', (run1.instrumentErrors || []).length === 0, JSON.stringify((run1.instrumentErrors || []).slice(0, 3)));
    check('live run 1: 0 tick-gate mismatches', (run1.tickGateChecks || []).filter(function (x) { return !x.match; }).length === 0);
    check('live run 1: policy recorded as tableseat-nowait layers-off', run1.policy === 'tableseat-nowait (layers off -> competent verbatim)' && run1.tableseatLayerOn === false && run1.leanlinkLayerOn === false, run1.policy);
    check('live run 1: anchor is the frozen base', run1.anchorCommit === DRIVER.FROZEN_BASE && run1.anchorHead === DRIVER.FROZEN_BASE, run1.anchorCommit);
    check('live run 1: funnelVillage maxStage agrees with analyzer derived stage (launchsilence cross-check still holds)',
      run1.funnelVillage.maxStage === (function () { try { return require(path.join(REPO, 'scripts', 'analyze-launchsilence-a.js')).derivedMaxStage(run1); } catch (e) { return -1; } })(),
      'funnel=' + run1.funnelVillage.maxStage);
    // Extended member fields: every muster-row pool member carries
    // the new context attributes (nulls allowed, keys must exist).
    let membersOk = true, membersSeen = 0;
    for (const row of (run1.muster || [])) {
      for (const m of ((row.pool || {}).members || [])) {
        membersSeen++;
        for (const k of ['armed', 'armored', 'sick', 'health', 'maxDist', 'killer3']) {
          if (!(k in m)) { membersOk = false; break; }
        }
      }
    }
    check('live run 1: extended pool members carry armed/armored/sick/health/maxDist/killer3 (' + membersSeen + ' members seen)', membersOk, 'members=' + membersSeen);
    try { run2 = await DRIVER.oneRun(107617); } catch (e) { check('live run 2 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  }
  if (run1 && run2) {
    const c1 = ANALYZE.analyzeSeed(run1);
    const c2 = ANALYZE.analyzeSeed(run2);
    check('D1 repeatability: identical days', run1.days === run2.days, run1.days + ' vs ' + run2.days);
    check('D1 repeatability: identical muster rows', JSON.stringify(run1.muster) === JSON.stringify(run2.muster), 'rows ' + (run1.muster || []).length + ' vs ' + (run2.muster || []).length);
    check('D1 repeatability: identical musterExtra rows', JSON.stringify(run1.musterExtra) === JSON.stringify(run2.musterExtra), 'rows ' + (run1.musterExtra || []).length + ' vs ' + (run2.musterExtra || []).length);
    check('D1 repeatability: identical funnelStage rows', JSON.stringify(run1.funnelStage) === JSON.stringify(run2.funnelStage));
    check('D1 repeatability: identical classification summary', JSON.stringify({ t: c1.totalEvents, c: c1.classifiedEvents, u: c1.unclassifiedEvents, causes: c1.causeCounts, asks: c1.askKindCounts }) === JSON.stringify({ t: c2.totalEvents, c: c2.classifiedEvents, u: c2.unclassifiedEvents, causes: c2.causeCounts, asks: c2.askKindCounts }), JSON.stringify(c1.causeCounts) + ' vs ' + JSON.stringify(c2.causeCounts));
    check('D1 repeatability: identical launch counts', c1.launches === c2.launches, c1.launches + ' vs ' + c2.launches);
  }
  // D2: recorder OFF — a fresh require with the flag off (the flag
  // is read at module scope).
  try {
    process.env.MUSTER_RECORDER = 'off';
    delete require.cache[DRIVER_PATH];
    const DRIVER_OFF = require(DRIVER_PATH);
    runOff = await DRIVER_OFF.oneRun(107617);
  } catch (e) { check('live run 3 completes (recorder off)', false, String(e && e.stack || e).slice(0, 300)); }
  finally { delete process.env.MUSTER_RECORDER; }
  if (run1 && runOff) {
    // D2 neutrality via RECORDER-INDEPENDENT game outcomes only.
    // The muster rows are the recorder's own output — empty by
    // construction when the recorder is off, so comparing them
    // across the legs is a test bug, not a game difference (the
    // launchsilence §12 lesson). The launch count that exists in
    // BOTH legs is the game's own winPlanStats.partyDepartures.
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D2 neutrality: recorder off, identical days', run1.days === runOff.days, run1.days + ' vs ' + runOff.days);
    check('D2 neutrality: recorder off, identical game launch count (partyDepartures)', pd(run1) === pd(runOff), pd(run1) + ' vs ' + pd(runOff));
    check('D2 neutrality: recorder off, identical maxWave + standing', run1.maxWave === runOff.maxWave && run1.standing === runOff.standing, run1.maxWave + '/' + run1.standing + ' vs ' + runOff.maxWave + '/' + runOff.standing);
    check('D2 neutrality: recorder off, identical deaths + killCalls', (run1.deaths || []).length === (runOff.deaths || []).length && (run1.killCalls || []).length === (runOff.killCalls || []).length, (run1.deaths || []).length + '/' + (run1.killCalls || []).length + ' vs ' + (runOff.deaths || []).length + '/' + (runOff.killCalls || []).length);
    check('D2 neutrality: recorder off, no muster rows', (runOff.muster || []).length === 0 && (runOff.musterExtra || []).length === 0, 'muster=' + (runOff.muster || []).length + ' extra=' + (runOff.musterExtra || []).length);
  }
  console.log('\nmuster-a proof: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
  if (failures.length) for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
