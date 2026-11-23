// test-musterask-a.js — proof for arm sim-musterask-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the dawn-state sampler wraps exist (dawnState / objTickTrace /
// objPickLog / refreshLog, on top of the muster / musterExtra streams),
// ZERO src/js change survives on the branch, the wave-4+ id set matches
// the data, the ask sites AND the dawn-path gates exist where the prereg
// says they do (objTick scholar/engaged skips, dawn staleness test,
// vbrainShouldRefresh dawn:true, objPick early returns before the feed,
// gate-commit blocks mid-day refresh), classifyMusterAsk maps every ask
// kind correctly, the analyzer selftest is green (one synthetic corpus
// per taxonomy row incl. the new dawn rows + determinism checks), a
// synthetic band classifies 100% with 0 unclassified, the OLD (-a2)
// analyzer FAILS (unclassified) on a scholar-day corpus the new analyzer
// names (the new name comes from the new stream, not a re-read of EOD
// state), and the determinism legs D1 (repeatability) + D2 (wrap
// neutrality) are green at 150d on seed 107617, with muster AND dawn
// rows identical across replays, 0 instrument errors, and 0 tick-gate
// mismatches.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-musterask-a.js
// (Substrate flags are also set by the test itself when absent, so a
// bare `node scripts/test-musterask-a.js` works too.)
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

const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-musterask-a.js'));
const ANALYZE_OLD = require(path.join(REPO, 'scripts', 'analyze-muster-a2.js'));
const DRIVER_PATH = path.join(REPO, 'scripts', 'musterask-driver-a.js');
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
if (scriptsStatus[0] === 'GIT-UNAVAILABLE') skip('scripts diff is musterask-* files only (git status unavailable)', 'infrastructure');
else {
  const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/(musterask-driver-a|analyze-musterask-a|test-musterask-a)\.js$/.test(s); });
  check('scripts worktree diff is musterask-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
}
// The muster-a arm's files are untouched (this arm copies, never edits).
const musterAStatus = gitStatus('scripts/muster-driver-a.js scripts/analyze-muster-a2.js scripts/test-muster-a2.js').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (musterAStatus[0] === 'GIT-UNAVAILABLE') skip('muster-a files untouched (git status unavailable)', 'infrastructure');
else check('muster-a arm files untouched (driver/analyzer/test -a2)', musterAStatus.length === 0, JSON.stringify(musterAStatus));
// The October arm's files are untouched (name-collision guard).
const octStatus = gitStatus('scripts/analyze-muster-a.js scripts/test-muster-a.js').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (octStatus[0] === 'GIT-UNAVAILABLE') skip('October muster files untouched (git status unavailable)', 'infrastructure');
else check('October arm files untouched (analyze-muster-a.js, test-muster-a.js)', octStatus.length === 0, JSON.stringify(octStatus));
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
for (const w of ['muster', 'musterExtra', 'musterFeedCalls', 'vbrainFeedExtras',
  'winPlanSecondCompanion', 'winPlanThirdCompanion', 'classifyMusterAsk',
  'MUSTER_RECORDER', 'FROZEN_BASE', 'tableseatNowait', 'planIsWave4p',
  'loadWave4pIds', 'MODE must be ctl', 'refusing to overwrite',
  'TABLESEATNOWAIT/LEANLINKRESCUE must be unset', 'villagerId',
  'dawnState', 'objTickTrace', 'objPickLog', 'refreshLog',
  'objTick', 'objPick', 'objRefreshPick', 'snapHolder',
  '(v.objectives || {})[vid]', '(v.needs || {})[vid]']) {
  check('driver defines/refuses ' + w, driverSrc.indexOf(w) !== -1);
}
// Purity, scoped to the sampler: snapHolder (the dawn-state reader)
// never calls the lazy-creating accessors Game.objOf / Game.npcNeeds —
// it reads the store directly. (The one Game.objOf code occurrence in
// the driver is INHERITED muster-a instrument code — the indoor
// firstFail classifier, byte-identical to muster-driver-a.js — not the
// sampler. A whole-file absence check would be a false trip on it.)
const snapSrc = driverSrc.slice(driverSrc.indexOf('function snapHolder'), driverSrc.indexOf('function snapHolders'));
check('sampler snapHolder never calls Game.objOf', snapSrc.indexOf('Game.objOf') === -1, 'Game.objOf inside snapHolder');
check('sampler snapHolder never calls Game.npcNeeds', snapSrc.indexOf('Game.npcNeeds') === -1, 'Game.npcNeeds inside snapHolder');
check('sampler snapHolder reads objectives off the store directly', snapSrc.indexOf('(v.objectives || {})[vid]') !== -1);
check('sampler snapHolder reads needs off the store directly', snapSrc.indexOf('(v.needs || {})[vid]') !== -1);
(function inheritedObjOf() {
  const codeLines = function (src) { return src.split('\n').filter(function (l) { return l.trim().indexOf('//') !== 0; }); };
  const askSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
  const oldSrc = fs.readFileSync(path.join(REPO, 'scripts', 'muster-driver-a.js'), 'utf8');
  const count = function (lines, re) { return lines.filter(function (l) { return re.test(l); }).length; };
  check('inherited Game.objOf: same code occurrences as muster-driver-a.js (2 lines)', count(codeLines(askSrc), /Game\.objOf/) === 2 && count(codeLines(oldSrc), /Game\.objOf/) === 2, 'ask=' + count(codeLines(askSrc), /Game\.objOf/) + ' old=' + count(codeLines(oldSrc), /Game\.objOf/));
  check('no Game.npcNeeds code call in either driver', count(codeLines(askSrc), /Game\.npcNeeds/) === 0 && count(codeLines(oldSrc), /Game\.npcNeeds/) === 0);
})();
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
// The dawn path exists where the prereg says it does (prereg §0a).
check('objTick skips the scholar before any pick', objectivesJs.indexOf('if (rid === this.villagerId) continue;') !== -1);
check('objTick skips engaged villagers before the dawn block', objectivesJs.indexOf('if (this.isEngaged(rid)) continue;') !== -1);
check('objTick dawn re-pick only when the objective is stale', objectivesJs.indexOf("if (!o.kind || o.kind === 'idle' || o.state === 'done' || o.state === 'returning') {") !== -1);
check('objTick skips the dawn re-pick for away villagers', objectivesJs.indexOf('if (dawn && !away) {') !== -1);
const feedIdx = objectivesJs.indexOf('this.vbrainFeedExtras(vid, cands, hx, hy)');
for (const k of ['REST', 'EAT', 'SEEK', 'HAUL', 'LEAVE']) {
  const ki = objectivesJs.indexOf("o.kind = '" + k + "'");
  check('objPick early return ' + k + ' fires BEFORE the feed line', ki !== -1 && feedIdx !== -1 && ki < feedIdx, 'kindIdx=' + ki + ' feedIdx=' + feedIdx);
}
check('vbrainShouldRefresh always true at dawn (opts.dawn)', brainJs.indexOf('if (opts.force || opts.dawn) return true;') !== -1);
check('commitDayPartStale: a commit written today is not stale', brainJs.indexOf('return commit.day !== dayOf(self);') !== -1);
check('gate picks write a same-day commit (vbrainLogGate)', brainJs.indexOf("writeCommit(this, vid, { kind: kind, score: 1, vbrainSrc: 'gate:' + gateId }, entry);") !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('win-plan findCompanion mirrors the brain copy (same trust floor)', winPlanJs.indexOf("if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;") !== -1);
check('companionLaunchable armed-or-armored bar', winPlanJs.indexOf('if (!cg.armed && !cg.armored) return false;') !== -1);
check('companionLaunchable sick stays home', winPlanJs.indexOf("if ((self.state.village.sick || {})[cid]) return false;") !== -1);

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
// Synthetic band: the -a2 band (9 seeds) + 7 dawn-cause seeds — the
// band classifies 100% with 0 unclassified (the frozen bars 1–2 shape,
// on fixtures).
(function syntheticBand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'musterask-band-'));
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
  function dawnRow(vid, over) {
    const r = { day: 100, part: 0, vid: vid, scholarId: 'scholar', isScholar: false,
      onRoster: true, personExists: true, vpDead: false, engaged: false, away: false,
      awayEntry: null, onExped: false, node: { nx: 4, ny: 4 },
      objective: { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: 2, indoor: true, purpose: 'chore' },
      plan: { stage: 'party', target: 'eater', needWave: 4, party: [] },
      needs: { energy: 80, hunger: 20 }, goal: 'feed', health: 100, sick: false };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function traceRow(vid, part, over) {
    const r = { day: 100, part: part, vid: vid,
      objective: { kind: 'FORAGE', state: 'out', partsLeft: 3, indoor: false },
      isScholar: false, engaged: false, away: false, onExped: false,
      node: { nx: 4, ny: 4 }, plan: { stage: 'hunt', target: 'eater' } };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function pickRow(vid, kind, over) {
    const r = { day: 100, part: 0, vid: vid,
      planBefore: { stage: 'party', target: 'eater', needWave: 4 },
      result: { kind: kind, state: 'indoor', partsLeft: 3, indoor: true },
      feedRan: false, error: null };
    if (over) for (const k in over) r[k] = over[k];
    return r;
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
    base(900008, { maxWave: 4,
      v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: 'party', target: 'eater', targetWave: 4 }],
      dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: 'eater', targetWave: 4 }] }),
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
    // ---- dawn-cause seeds (new taxonomy) ----
    base(900010, { daily: [{ day: 100, scholarId: 'a', roster: [{ vid: 'a', name: 'A', dead: false }] }],
      planCensus: [census('a')] }),
    base(900011, { dawnState: [dawnRow('a', { engaged: true })], planCensus: [census('a')] }),
    base(900012, { dawnState: [dawnRow('a', { away: true, awayEntry: { purpose: 'forage', sinceDay: 99, duration: 3 } })], planCensus: [census('a')] }),
    base(900013, { dawnState: [dawnRow('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })],
      objPickLog: [pickRow('a', 'REST')], planCensus: [census('a')] }),
    base(900014, { dawnState: [dawnRow('a', { objective: { kind: 'FORAGE', state: 'out', partsLeft: 3, indoor: false, purpose: 'forage' } })],
      objTickTrace: [traceRow('a', 1), traceRow('a', 2), traceRow('a', 3)], planCensus: [census('a')] }),
    base(900015, { dawnState: [dawnRow('b')],
      v4creates: [{ day: 100, vid: 'a', creator: 'world-tick', stageAfter: 'party', target: 'eater', needWave: 4 }],
      planCensus: [census('a')] }),
    base(900016, { dawnState: [dawnRow('a', { onRoster: false, personExists: false })], planCensus: [census('a')] }),
  ];
  seeds.forEach(function (s) { fs.writeFileSync(path.join(dir, 'musterask-a-s' + s.seed + '-x.json'), JSON.stringify(s)); });
  const r = ANALYZE.analyzeDir(dir);
  check('synthetic band: 16 seeds read', r.seeds === 16, 'got ' + r.seeds);
  check('synthetic band: 2 launchers, 14 non-launchers', r.launchingSeeds === 2 && r.nonLaunchingSeeds === 14, JSON.stringify({ l: r.launchingSeeds, n: r.nonLaunchingSeeds }));
  check('synthetic band: 13 events, classified 13/13 (100%), 0 unclassified', r.eligible0Events === 13 && r.classifiedEvents === 13 && r.unclassifiedEvents === 0, JSON.stringify({ e: r.eligible0Events, c: r.classifiedEvents, u: r.unclassifiedEvents }));
  check('synthetic band: cause totals name each fixture', r.causeTotals['pool-empty:notAtHaven'] === 1 && r.causeTotals['pool-empty:notRanger'] === 1 && r.causeTotals['never-asked:stage-gear'] === 1 && r.causeTotals['never-asked:holder-not-scored'] === 2 && r.causeTotals['pool-empty:trustLow'] === 1 && r.causeTotals['never-asked:holder-scholar-at-dawn'] === 1 && r.causeTotals['never-asked:holder-engaged-at-dawn'] === 1 && r.causeTotals['never-asked:holder-away-at-dawn'] === 1 && r.causeTotals['never-asked:pick-early-return'] === 1 && r.causeTotals['never-asked:objective-live-all-day'] === 1 && r.causeTotals['never-asked:plan-created-after-dawn'] === 1 && r.causeTotals['never-asked:holder-off-roster-at-dawn'] === 1, JSON.stringify(r.causeTotals));
  check('synthetic band: non-launcher gate population matches (13 events, 0 unclassified)', r.nonLauncherEvents === 13 && r.nonLauncherUnclassified === 0, JSON.stringify({ e: r.nonLauncherEvents, u: r.nonLauncherUnclassified }));
  check('synthetic band: 1 found day, 1 launch-offered day', r.foundDaysTotal === 1 && r.launchOfferedDaysTotal === 1, JSON.stringify({ f: r.foundDaysTotal, l: r.launchOfferedDaysTotal }));
  fs.rmSync(dir, { recursive: true, force: true });
})();
// Old-code-fails control: the -a2 analyzer on a scholar-day corpus
// (daily.scholarId + dawnState streams present, which -a2 ignores)
// must leave it unclassified — the new name comes from the new
// taxonomy + sampler, not from re-reading EOD state. The -ask analyzer
// on the SAME corpus must name it scholar-at-dawn.
(function oldCodeFails() {
  const scholarDay = { seed: 999003, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', villagerId: 'scholar',
    v4creates: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    muster: [], musterExtra: [], musterFeedCalls: 0,
    daily: [{ day: 100, scholarId: 'a', roster: [{ vid: 'a', name: 'A', dead: false }] }],
    dawnState: [{ day: 100, part: 0, vid: 'a', scholarId: 'a', isScholar: true, onRoster: true, personExists: true, vpDead: false, engaged: false, away: false, awayEntry: null, onExped: false, node: { nx: 4, ny: 4 }, objective: null, plan: { stage: 'party', target: 'eater', needWave: 4, party: [] }, needs: null, goal: null, health: 100, sick: false }],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }],
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
  const cOld = ANALYZE_OLD.analyzeSeed(JSON.parse(JSON.stringify(scholarDay)));
  check('old-code control: -a2 analyzer leaves the scholar-day unclassified', cOld.totalEvents === 1 && cOld.unclassifiedEvents === 1, JSON.stringify({ t: cOld.totalEvents, u: cOld.unclassifiedEvents }));
  const cNew = ANALYZE.analyzeSeed(JSON.parse(JSON.stringify(scholarDay)));
  check('new analyzer names the same scholar-day holder-scholar-at-dawn', cNew.totalEvents === 1 && cNew.unclassifiedEvents === 0 && cNew.neverScored[0].cause === 'never-asked:holder-scholar-at-dawn', JSON.stringify(cNew.neverScored));
  // And the stripped-muster control from -a2 still holds: without the
  // muster stream the analyzer cannot tell a scored eligible-0 day
  // from a never-scored one. The plan pre-existed (day-99 census row)
  // so the day-100 silence is NOT plan-created — it is genuinely
  // unexplained without the muster/dawn streams. (Day 99 itself IS
  // named plan-created from the census alone, which is by design:
  // plan-created-after-dawn is derivable from planCensus/v4creates.)
  const stripped = { seed: 999002, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', villagerId: 'scholar',
    v4creates: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    musterExtra: [], musterFeedCalls: 0,
    planCensus: [{ day: 99, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false },
      { day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }],
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
  const c = ANALYZE.analyzeSeed(stripped);
  check('old-code control: stripped corpus leaves the day-100 silence unclassified', c.totalEvents === 2 && c.unclassifiedEvents === 1 && c.neverScored.filter(function (n) { return n.cause === 'unclassified'; })[0].day === 100, JSON.stringify({ t: c.totalEvents, u: c.unclassifiedEvents, ns: c.neverScored }));
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
    check('live run 1: dawn sampler streams present and non-empty', Array.isArray(run1.dawnState) && run1.dawnState.length > 0 && Array.isArray(run1.objPickLog) && run1.objPickLog.length > 0 && Array.isArray(run1.refreshLog) && Array.isArray(run1.objTickTrace), 'dawn=' + (run1.dawnState || []).length + ' picks=' + (run1.objPickLog || []).length + ' refresh=' + (run1.refreshLog || []).length + ' trace=' + (run1.objTickTrace || []).length);
    check('live run 1: 0 instrument errors', (run1.instrumentErrors || []).length === 0, JSON.stringify((run1.instrumentErrors || []).slice(0, 3)));
    check('live run 1: 0 tick-gate mismatches', (run1.tickGateChecks || []).filter(function (x) { return !x.match; }).length === 0);
    check('live run 1: policy recorded as tableseat-nowait layers-off', run1.policy === 'tableseat-nowait (layers off -> competent verbatim)' && run1.tableseatLayerOn === false && run1.leanlinkLayerOn === false, run1.policy);
    check('live run 1: anchor is the frozen base', run1.anchorCommit === DRIVER.FROZEN_BASE && run1.anchorHead === DRIVER.FROZEN_BASE, run1.anchorCommit);
    // Sampler shape: every dawnState row carries the gate fields.
    let shapeOk = true, shapeSeen = 0;
    for (const r of (run1.dawnState || [])) {
      shapeSeen++;
      for (const k of ['vid', 'day', 'scholarId', 'isScholar', 'onRoster', 'personExists', 'engaged', 'away', 'onExped', 'node', 'objective', 'plan']) {
        if (!(k in r)) { shapeOk = false; break; }
      }
    }
    check('live run 1: every dawnState row carries the gate fields (' + shapeSeen + ' rows)', shapeOk, 'rows=' + shapeSeen);
    // Sampler shape: dawnState rows are unique per (vid, day).
    const dawnKeys = {};
    let dawnDupes = 0;
    for (const r of (run1.dawnState || [])) { const k = r.vid + '|' + r.day; if (dawnKeys[k]) dawnDupes++; dawnKeys[k] = true; }
    check('live run 1: dawnState rows unique per (vid, day)', dawnDupes === 0, 'dupes=' + dawnDupes);
    // Sampler cross-check: every part-0 muster row has a dawnState row
    // for the same holder-day (the feed runs inside objTick, after the
    // entry snapshot, with no plan creation in between).
    const dawnSet = {};
    for (const r of (run1.dawnState || [])) dawnSet[r.vid + '|' + r.day] = true;
    let missingDawn = 0;
    for (const r of (run1.muster || [])) {
      if ((r.part | 0) === 0 && !dawnSet[r.vid + '|' + r.day]) missingDawn++;
    }
    check('live run 1: every part-0 muster row has a dawnState row', missingDawn === 0, 'missing=' + missingDawn);
    // Sampler cross-check: every objPickLog feedRan=true row has a
    // matching muster row (same vid/day/part).
    const musterSet = {};
    for (const r of (run1.muster || [])) musterSet[r.vid + '|' + r.day + '|' + (r.part | 0)] = true;
    let feedNoMuster = 0, pickErrors = 0;
    for (const r of (run1.objPickLog || [])) {
      if (r.feedRan && !musterSet[r.vid + '|' + r.day + '|' + (r.part | 0)]) feedNoMuster++;
      if (r.error) pickErrors++;
    }
    check('live run 1: every feedRan pick has a matching muster row', feedNoMuster === 0, 'missing=' + feedNoMuster);
    check('live run 1: 0 objPick errors recorded', pickErrors === 0, 'errors=' + pickErrors);
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
    // Classification on the live replay matches the frozen 107617
    // denominator (35 events) and names at least as much as the
    // fallback analysis (32 classified, 3 unclassified).
    const c1 = ANALYZE.analyzeSeed(run1);
    check('live run 1: 107617 replays to the frozen denominator (35 events)', c1.totalEvents === 35, 'got ' + c1.totalEvents);
    check('live run 1: 107617 names at least the fallback 32 (unclassified <= 3)', c1.unclassifiedEvents <= 3, 'unclassified=' + c1.unclassifiedEvents);
    try { run2 = await DRIVER.oneRun(107617); } catch (e) { check('live run 2 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  }
  if (run1 && run2) {
    const c1 = ANALYZE.analyzeSeed(run1);
    const c2 = ANALYZE.analyzeSeed(run2);
    check('D1 repeatability: identical days', run1.days === run2.days, run1.days + ' vs ' + run2.days);
    check('D1 repeatability: identical muster rows', JSON.stringify(run1.muster) === JSON.stringify(run2.muster), 'rows ' + (run1.muster || []).length + ' vs ' + (run2.muster || []).length);
    check('D1 repeatability: identical musterExtra rows', JSON.stringify(run1.musterExtra) === JSON.stringify(run2.musterExtra), 'rows ' + (run1.musterExtra || []).length + ' vs ' + (run2.musterExtra || []).length);
    check('D1 repeatability: identical dawnState rows', JSON.stringify(run1.dawnState) === JSON.stringify(run2.dawnState), 'rows ' + (run1.dawnState || []).length + ' vs ' + (run2.dawnState || []).length);
    check('D1 repeatability: identical objTickTrace rows', JSON.stringify(run1.objTickTrace) === JSON.stringify(run2.objTickTrace), 'rows ' + (run1.objTickTrace || []).length + ' vs ' + (run2.objTickTrace || []).length);
    check('D1 repeatability: identical objPickLog rows', JSON.stringify(run1.objPickLog) === JSON.stringify(run2.objPickLog), 'rows ' + (run1.objPickLog || []).length + ' vs ' + (run2.objPickLog || []).length);
    check('D1 repeatability: identical refreshLog rows', JSON.stringify(run1.refreshLog) === JSON.stringify(run2.refreshLog), 'rows ' + (run1.refreshLog || []).length + ' vs ' + (run2.refreshLog || []).length);
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
    check('D2 neutrality: recorder off, no dawn sampler rows', (runOff.dawnState || []).length === 0 && (runOff.objPickLog || []).length === 0 && (runOff.refreshLog || []).length === 0 && (runOff.objTickTrace || []).length === 0, 'dawn=' + (runOff.dawnState || []).length + ' picks=' + (runOff.objPickLog || []).length);
  }
  console.log('\nmusterask-a proof: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
  if (failures.length) for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
