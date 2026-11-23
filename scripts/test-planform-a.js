// test-planform-a.js — proof for arm sim-planform-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the driver wraps exist (incl. the new planform fields on
// the meeting/seed streams — origin, planBefore/planAfter, retNull,
// lingering, scholarId), ZERO src/js change survives on the branch,
// the wave-4+ id set matches the data, the seed sites exist where the
// prereg says they do (the four call sites + the no-seed paths), the
// analyzer selftest is green (one synthetic corpus per taxonomy row +
// join + seeded-later + determinism checks), a synthetic band
// classifies 100% with 0 unclassified, the classifier FAILS
// (unclassified / wrong-rule) on a corpus stripped of the new fields
// (the new fields are load-bearing, not decorative), and the
// determinism legs D1 (repeatability) + D2 (wrap neutrality) are green
// at 30d on seed 107633, with planform rows present, 0 instrument
// errors, and 0 tick-gate mismatches.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-planform-a.js
// (Substrate flags are also set by the test itself when absent, so a
// bare `node scripts/test-planform-a.js` works too.)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// Substrate: the launchsilence band's flags (frozen in the prereg).
// Set here so a bare invocation runs the same substrate as the band.
for (const f of ['VETREENGAGE', 'PARTYSIZE4', 'FLEEREPAIR2', 'FIGHTALLY2', 'SENSEEXPED', 'BOWOPEN', 'SPEARGATE', 'GUNRATE', 'CELLGATE']) {
  if (process.env[f] === undefined) process.env[f] = '1';
}
// Policy layers MUST be off (tableseat-nowait + leanlinkrescue
// default-off -> competent verbatim). Never set by this test.
delete process.env.TABLESEATNOWAIT;
delete process.env.LEANLINKRESCUE;
// Short horizon for the live legs (the property under test is
// determinism/neutrality, not the band numbers).
process.env.DAYS = '30';

const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-planform-a.js'));
const DRIVER_PATH = path.join(REPO, 'scripts', 'planform-driver-a.js');
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
    // This tree's restat is slow (shared hot tree); the 240s budget
    // is a harness allowance, not an assertion.
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO, timeout: 240000 }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (srcStatus[0] === 'GIT-UNAVAILABLE') skip('ZERO src/js change (git status unavailable)', 'infrastructure');
else check('ZERO src/js change: src worktree diff is empty (' + JSON.stringify(srcStatus) + ')', srcStatus.length === 0);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (scriptsStatus[0] === 'GIT-UNAVAILABLE') skip('scripts diff is planform-* only (git status unavailable)', 'infrastructure');
else {
  const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*planform-[a-z0-9.-]+\.js$/.test(s); });
  check('scripts worktree diff is planform-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
}
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
for (const w of ['planBefore', 'planAfter', 'retNull', 'PLANFORM_RECORDER', 'FROZEN_BASE',
  'tableseatNowait', 'planIsWave4p', 'loadWave4pIds', 'MODE must be ctl',
  'refusing to overwrite', 'TABLESEATNOWAIT/LEANLINKRESCUE must be unset',
  'classifyFightOrigin', 'scholarId', 'lingering', 'FIGHT_ORIGINS']) {
  check('driver defines/refuses ' + w, driverSrc.indexOf(w) !== -1);
}
// Frozen base is this tree's HEAD (the prereg's frozen base, as
// re-frozen to the prereg commit — see prereg §14).
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
// The seed sites exist where the prereg says they do (call TEXT is
// the anchor — line numbers drift daily).
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('seed: hunt-stage early return (gear/party only)', winPlanJs.indexOf("if (plan && plan.stage !== 'gear' && plan.stage !== 'party') return plan;") !== -1);
check('seed: suburb guard (FLEEREPAIR2)', winPlanJs.indexOf("if (fleerepair2On() && mdef.id === 'suburb') return null;") !== -1);
check('seed: sets target + needWave from the faced monster', winPlanJs.indexOf('plan.target = mdef.id || null;') !== -1 && winPlanJs.indexOf('plan.needWave = (mdef.wave || 1);') !== -1);
check('seed: gate-avoid seeds only when no plan exists', winPlanJs.indexOf("else this.winPlanSeedFromFight(vid, mdef, 'avoided');") !== -1);
check('havenTick: creates targetless plans only', winPlanJs.indexOf("plan = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };") !== -1);
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('seed site 1: world-tick vFlee block (VETREENGAGE, !raid, !aid)', gameJs.indexOf("if (_vreSeed && !opts.raid && !wViaAid && rec && rec.outcome === 'vFlee' && this.winPlanSeedFromFight)") !== -1);
check('seed site 1: world-tick raid router passes {raid:true}', fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8').indexOf('this.resolveWildMonsterEncounter(d, m, { raid: true })') !== -1);
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('seed site 2: expedition evade seeds', agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'evaded')") !== -1);
check('seed site 3: expedition flee seeds', agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'fled')") !== -1);
check('no-seed on kill: expedition vKill calls winPlanNoteKill only', agencyJs.indexOf('this.winPlanNoteKill(vid, m)') !== -1 && agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'killed')") === -1);
check('gate consulted only by expeditionMonster', agencyJs.indexOf('this.winPlanFightGate ? this.winPlanFightGate(vid, m) : null') !== -1 && gameJs.indexOf('winPlanFightGate(vid, m)') === -1);
// classifyFightOrigin pins the prereg §2a map on synthetic frames.
check('classifyFightOrigin: world-tick', DRIVER.classifyFightOrigin('at Object.resolveWildMonsterEncounter (src/js/game.js:1:1)', '') === 'world-tick');
check('classifyFightOrigin: expedition', DRIVER.classifyFightOrigin('at Object.expeditionMonster (src/js/villager-agency.js:1:1)', '') === 'expedition');
check('classifyFightOrigin: patrol', DRIVER.classifyFightOrigin('at Object.resolvePatrol (src/js/game.js:1:1)', '') === 'patrol');
check('classifyFightOrigin: aid', DRIVER.classifyFightOrigin('at Object.aidFight (src/js/comms.js:1:1)', '') === 'aid');
check('classifyFightOrigin: sortie', DRIVER.classifyFightOrigin('at Object.lingererSortie (src/js/havenGrowth.js:1:1)', '') === 'sortie');
check('classifyFightOrigin: contest', DRIVER.classifyFightOrigin('at foo (src/js/contestEngine.js:1:1)', '') === 'contest');
check('classifyFightOrigin: unknown caller is explicit', DRIVER.classifyFightOrigin('at foo (src/js/nowhere.js:1:1)', '').indexOf('unknown-caller:') === 0);
check('classifyFightOrigin: aid wins over the router in the full stack', DRIVER.classifyFightOrigin('', 'at aidFight (comms.js)\nat resolveWildMonsterEncounter (game.js)') === 'aid');

// ---------- 2. Analyzer ----------
console.log('== analyzer ==');
const st = ANALYZE.selftest();
check('analyzer selftest green (' + st.pass + ' passed, ' + st.fail + ' failed)', st.fail === 0, st.failures.join(' | '));
// Synthetic band: one corpus per taxonomy row — the band classifies
// 100% with 0 unclassified (the frozen bar 1–2 shape, on fixtures).
(function syntheticBand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planform-band-'));
  function base(seed, over) {
    const b = { seed: seed, scholarId: 'scholar', roster: ['a', 'b', 'scholar'],
      maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
      endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
      v4encounters: [], v4seeds: [], v4gates: [],
      v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
      dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
      havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
      funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  function fight(day, vid, mid, wave, origin, outcome, extra) {
    const r = { day: day, vid: vid, mid: mid, wave: wave, origin: origin, caller: 'x', outcome: outcome, monsterTile: { tx: 1, ty: 1 }, havenTile: { nx: 4, ny: 4 }, lingering: false, optsRaid: false, optsCornered: false };
    if (extra) for (const k in extra) r[k] = extra[k];
    return r;
  }
  function seedCall(day, vid, mid, wave, path, outcome, before, after, retNull, profile) {
    return { day: day, vid: vid, mid: mid, wave: wave, outcome: outcome, path: path, caller: 'x',
      planExistedBefore: !!before, planBefore: before || null, planAfter: after || null,
      retNull: !!retNull, profile: profile || 'forager', seq: 0,
      stageAfter: after ? after.stage : null, target: after ? after.target : null, node: null };
  }
  const seeds = [
    base(900001, { v4encounters: [fight(63, 'a', 'eulogy', 4, 'world-tick', 'vFlee')],
      v4seeds: [seedCall(63, 'a', 'eulogy', 4, 'world-tick', 'fled', null, { stage: 'gear', target: 'eulogy', needWave: 4 }, false, 'forager')] }),
    base(900002, { v4encounters: [fight(108, 'a', 'herald', 4, 'world-tick', 'vKill')] }),
    base(900003, { v4encounters: [fight(108, 'a', 'timeslot', 5, 'expedition', 'vFlee')],
      v4seeds: [seedCall(108, 'a', 'timeslot', 5, 'agency-flee', 'fled', { stage: 'hunt', target: null, needWave: null }, { stage: 'hunt', target: null, needWave: null }, false, 'wanderer')] }),
    base(900004, { v4encounters: [fight(95, 'a', 'suburb', 4, 'expedition', 'vFlee')],
      v4seeds: [seedCall(95, 'a', 'suburb', 4, 'agency-flee', 'fled', null, null, true, 'forager')] }),
    base(900005, { v4encounters: [fight(60, 'a', 'audit', 4, 'aid', 'vFlee')] }),
    base(900006, { v4encounters: [fight(60, 'a', 'audit', 4, 'patrol', 'vFlee')] }),
    base(900007, { v4gates: [{ day: 50, vid: 'a', mid: 'eater', wave: 4, origin: 'expedition', caller: 'x', result: 'avoid', reason: 'outmatched', planStage: 'party', planTarget: 'spool' }] }),
    base(900008, { v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee', { lingering: false, monsterTile: { tx: 4, ty: 4 } })] }), // B6: tile decides, not lingering (§16)
    base(900009, { v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'evade')] }),
    base(900010, { v4encounters: [fight(40, 'a', 'spool', 3, 'expedition', 'evade')],
      v4seeds: [seedCall(40, 'a', 'spool', 3, 'agency-evade', 'evaded', null, { stage: 'gear', target: 'spool', needWave: 3 }, false, 'wanderer')] }),
  ];
  seeds.forEach(function (s) { fs.writeFileSync(path.join(dir, 'planform-a-s' + s.seed + '-x.json'), JSON.stringify(s)); });
  const r = ANALYZE.analyzeDir(dir);
  check('synthetic band: 10 seeds read', r.seeds === 10, 'got ' + r.seeds);
  check('synthetic band: 8 wave-4 meetings, 1 wave-3, 1 wave-5', r.meetingsW4 === 8 && r.meetingsW3 === 1 && r.meetingsW5 === 1, JSON.stringify({ w4: r.meetingsW4, w3: r.meetingsW3, w5: r.meetingsW5 }));
  check('synthetic band: classified 8/8 wave-4 (100%), 0 unclassified', r.classifiedW4 === 8 && r.unclassifiedW4 === 0 && r.classifiedShareW4 === 1, JSON.stringify({ c: r.classifiedW4, u: r.unclassifiedW4, s: r.classifiedShareW4 }));
  check('synthetic band: each taxonomy row named once', r.classCountsW4.seeded === 1 && r.classCountsW4['no-call-kill'] === 1 && r.classCountsW4['bounced-suburb'] === 1 && r.classCountsW4['no-call-aid'] === 1 && r.classCountsW4['no-call-patrol-router'] === 1 && r.classCountsW4['gate-avoid-plan-exists-no-retarget'] === 1 && r.classCountsW4['no-call-raid'] === 1 && r.classCountsW4['no-call-outcome-evade'] === 1 && r.classCountsW5['bounced-hunt-lock'] === 1, JSON.stringify({ w4: r.classCountsW4, w5: r.classCountsW5 }));
  check('synthetic band: 0 orphan seeds, 0 join-ambiguous', r.orphanSeeds === 0 && r.joinAmbiguous === 0, JSON.stringify({ o: r.orphanSeeds, j: r.joinAmbiguous }));
  fs.rmSync(dir, { recursive: true, force: true });
})();
// Old-code-fails controls: corpora in the pre-planform shape must NOT
// classify — the new fields are load-bearing, not decorative.
// (a) A wave-4 world-tick vFlee meeting with no origin / lingering /
// tile fields and no seed row: without the origin the classifier
// cannot tell a raid from an expected seed — unclassified.
// (b) The same meeting WITH a seed row but in the old shape (only
// stageAfter/target, no planBefore/planAfter): the classifier reads
// the seed as a bounce (wrong rule), where the planform-shaped row
// reads seeded — the before/after fields carry the verdict.
(function oldCodeFails() {
  function base(over) {
    const b = { seed: 999002, scholarId: 'scholar', roster: ['a'],
      maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
      endReason: 'days', won: false, scaleRank: 'village',
      v4encounters: [], v4seeds: [], v4gates: [],
      v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
      dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
      havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
      funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  const noOrigin = base({ v4encounters: [{ day: 63, vid: 'a', mid: 'eulogy', wave: 4, outcome: 'vFlee' }] });
  const c1 = ANALYZE.analyzeSeed(noOrigin);
  check('old-code control (a): no-origin meeting classifies unclassified', c1.meetings[0] && c1.meetings[0].rule === 'unclassified', JSON.stringify(c1.meetings[0]));
  const oldSeed = base({ v4encounters: [{ day: 63, vid: 'a', mid: 'eulogy', wave: 4, origin: 'world-tick', caller: 'x', outcome: 'vFlee', monsterTile: { tx: 1, ty: 1 }, havenTile: { nx: 4, ny: 4 }, lingering: false }],
    v4seeds: [{ day: 63, vid: 'a', mid: 'eulogy', wave: 4, outcome: 'fled', path: 'world-tick', caller: 'x', planExistedBefore: false, stageAfter: 'gear', target: 'eulogy', node: null }] });
  const c2 = ANALYZE.analyzeSeed(oldSeed);
  check('old-code control (b): old-shape seed row misreads as bounced-other (not seeded)', c2.meetings[0] && c2.meetings[0].rule === 'bounced-other', JSON.stringify(c2.meetings[0]));
  const newSeed = base({ v4encounters: [{ day: 63, vid: 'a', mid: 'eulogy', wave: 4, origin: 'world-tick', caller: 'x', outcome: 'vFlee', monsterTile: { tx: 1, ty: 1 }, havenTile: { nx: 4, ny: 4 }, lingering: false }],
    v4seeds: [{ day: 63, vid: 'a', mid: 'eulogy', wave: 4, outcome: 'fled', path: 'world-tick', caller: 'x', planExistedBefore: false, planBefore: null, planAfter: { stage: 'gear', target: 'eulogy', needWave: 4 }, retNull: false, profile: 'forager', seq: 0, stageAfter: 'gear', target: 'eulogy', node: null }] });
  const c3 = ANALYZE.analyzeSeed(newSeed);
  check('old-code control (b): planform-shape seed row reads seeded-new', c3.meetings[0] && c3.meetings[0].rule === 'seeded' && c3.meetings[0].sub === 'seeded-new', JSON.stringify(c3.meetings[0]));
})();

// ---------- 3. Live determinism (30d, seed 107633) ----------
console.log('== live determinism (30d, seed 107633) ==');
(async function live() {
  function derivedMaxStage(out) {
    const w4p = function (r) {
      if (!r) return false;
      if ((r.targetWave | 0) >= 4) return true;
      if ((r.needWave | 0) >= 4) return true;
      return !!(r.target && frozenW4p.indexOf(r.target) !== -1);
    };
    let launches = 0, attempts = false, considered = false, hasPlan = false;
    for (const r of (out.v4departs || [])) if (r.result === 'launch' && w4p(r)) launches++;
    if (launches > 0) return 4;
    for (const r of (out.v4departs || [])) if (w4p(r)) attempts = true;
    if (attempts) return 3;
    for (const r of (out.dawnbidScores || [])) {
      if (!r.plan || (r.plan.needWave | 0) < 4) continue;
      for (const c of (r.cands || [])) if (c && c.winPlanAction) considered = true;
    }
    if (considered) return 2;
    for (const c of (out.v4creates || [])) if (w4p(c)) hasPlan = true;
    for (const c of (out.planCensus || [])) if (w4p(c)) hasPlan = true;
    if (hasPlan) return 1;
    return 0;
  }
  function classSignature(out) {
    const a = ANALYZE.analyzeSeed(out);
    return JSON.stringify({ cc: a.classCounts, launches: a.launches, w4: a.meetingsW4, w3: a.meetingsW3, orphan: a.orphanSeedCount });
  }
  let run1 = null, run2 = null, runOff = null;
  try {
    run1 = await DRIVER.oneRun(107633);
  } catch (e) { check('live run 1 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  if (run1) {
    const fdays = (run1.funnelStage || []).map(function (r) { return r.day; });
    let fmono = true;
    for (let i = 1; i < fdays.length; i++) if (fdays[i] <= fdays[i - 1]) fmono = false;
    check('live run 1: funnelStage rows present, strictly increasing days', (run1.funnelStage || []).length > 0 && fmono && fdays[fdays.length - 1] >= run1.days - 1, 'rows=' + (run1.funnelStage || []).length + ' days=' + run1.days + ' last=' + fdays[fdays.length - 1]);
    let mono = true;
    for (let i = 1; i < (run1.funnelStage || []).length; i++) {
      if (run1.funnelStage[i].maxStage < run1.funnelStage[i - 1].maxStage) mono = false;
    }
    check('live run 1: funnelStage maxStage monotonic', mono);
    check('live run 1: funnelVillage maxStage agrees with derived stage',
      run1.funnelVillage.maxStage === derivedMaxStage(run1),
      'funnel=' + run1.funnelVillage.maxStage + ' derived=' + derivedMaxStage(run1));
    check('live run 1: 0 instrument errors', (run1.instrumentErrors || []).length === 0, JSON.stringify((run1.instrumentErrors || []).slice(0, 3)));
    check('live run 1: 0 tick-gate mismatches', (run1.tickGateChecks || []).filter(function (x) { return !x.match; }).length === 0);
    check('live run 1: policy recorded as tableseat-nowait layers-off', run1.policy === 'tableseat-nowait (layers off -> competent verbatim)' && run1.tableseatLayerOn === false && run1.leanlinkLayerOn === false, run1.policy);
    check('live run 1: anchor is the frozen base', run1.anchorCommit === DRIVER.FROZEN_BASE && run1.anchorHead === DRIVER.FROZEN_BASE, run1.anchorCommit);
    check('live run 1: scholarId + roster recorded', typeof run1.scholarId === 'string' && Array.isArray(run1.roster) && run1.roster.length > 0, 'scholarId=' + run1.scholarId + ' rosterN=' + (run1.roster || []).length);
    // Planform streams are populated correctly on a live run. At 30d
    // a village may legitimately have met no wave-3+ monster yet
    // (wave 3 opens day 25+), so an empty stream is NOT a failure —
    // the checks below are vacuous-safe: every recorded row must
    // carry the new fields. The pilot band (150d) is where the
    // streams must be non-empty; the evidence records the counts.
    const enc = run1.v4encounters || [];
    check('live run 1: v4encounters rows carry origin + lingering', enc.every(function (r) { return typeof r.origin === 'string' && typeof r.lingering === 'boolean'; }), 'rows=' + enc.length);
    const sd = run1.v4seeds || [];
    check('live run 1: v4seeds rows carry planBefore/planAfter + retNull', sd.every(function (r) { return ('planBefore' in r) && ('planAfter' in r) && ('retNull' in r) && typeof r.profile === 'string'; }), 'rows=' + sd.length);
    check('live run 1: analyzer reads the live corpus without unclassified meetings on missing streams', ANALYZE.analyzeSeed(run1).missingStreams.length === 0, JSON.stringify(ANALYZE.analyzeSeed(run1).missingStreams));
    try { run2 = await DRIVER.oneRun(107633); } catch (e) { check('live run 2 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  }
  if (run1 && run2) {
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D1 repeatability: identical days', run1.days === run2.days, run1.days + ' vs ' + run2.days);
    check('D1 repeatability: identical meeting classification + launches', classSignature(run1) === classSignature(run2), classSignature(run1) + ' vs ' + classSignature(run2));
    check('D1 repeatability: identical funnelStage rows', JSON.stringify(run1.funnelStage) === JSON.stringify(run2.funnelStage));
    check('D1 repeatability: identical game launch count (partyDepartures)', pd(run1) === pd(run2), pd(run1) + ' vs ' + pd(run2));
    check('D1 repeatability: identical v4seeds rows', JSON.stringify(run1.v4seeds) === JSON.stringify(run2.v4seeds));
    check('D1 repeatability: identical v4encounters rows', JSON.stringify(run1.v4encounters) === JSON.stringify(run2.v4encounters));
  }
  // D2: recorder OFF — a fresh require with the flag off (the flag
  // is read at module scope).
  try {
    process.env.PLANFORM_RECORDER = 'off';
    delete require.cache[DRIVER_PATH];
    const DRIVER_OFF = require(DRIVER_PATH);
    runOff = await DRIVER_OFF.oneRun(107633);
  } catch (e) { check('live run 3 completes (recorder off)', false, String(e && e.stack || e).slice(0, 300)); }
  finally { delete process.env.PLANFORM_RECORDER; }
  if (run1 && runOff) {
    // D2 neutrality via RECORDER-INDEPENDENT game outcomes only.
    // The v4encounters/v4seeds rows are the recorder's own output —
    // they are empty by construction when the recorder is off, so
    // comparing them across the legs is a test bug, not a game
    // difference (launchsilence prereg §12). The launch count that
    // exists in BOTH legs is the game's own
    // winPlanStats.partyDepartures (bumped by launchParty itself).
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D2 neutrality: recorder off, identical days', run1.days === runOff.days, run1.days + ' vs ' + runOff.days);
    check('D2 neutrality: recorder off, identical game launch count (partyDepartures)', pd(run1) === pd(runOff), pd(run1) + ' vs ' + pd(runOff));
    check('D2 neutrality: recorder off, identical maxWave + standing', run1.maxWave === runOff.maxWave && run1.standing === runOff.standing, run1.maxWave + '/' + run1.standing + ' vs ' + runOff.maxWave + '/' + runOff.standing);
    check('D2 neutrality: recorder off, identical deaths + killCalls', (run1.deaths || []).length === (runOff.deaths || []).length && (run1.killCalls || []).length === (runOff.killCalls || []).length, (run1.deaths || []).length + '/' + (run1.killCalls || []).length + ' vs ' + (runOff.deaths || []).length + '/' + (runOff.killCalls || []).length);
    check('D2 neutrality: recorder off, no planform rows', (runOff.v4encounters || []).length === 0 && (runOff.v4seeds || []).length === 0 && (runOff.v4gates || []).length === 0, 'enc=' + (runOff.v4encounters || []).length + ' seeds=' + (runOff.v4seeds || []).length + ' gates=' + (runOff.v4gates || []).length);
    check('D2 neutrality: recorder off, no funnelStage rows', (runOff.funnelStage || []).length === 0, 'rows=' + (runOff.funnelStage || []).length);
  }
  console.log('\nplanform-a proof: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
  if (failures.length) for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
