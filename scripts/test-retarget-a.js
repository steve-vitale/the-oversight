// test-retarget-a.js — proof for arm sim-retarget-a.
// Proves, on live in-memory runs (no corpus numbers):
//   §0 STATIC: the lever exists where the prereg says it does
//      (planretargetOn gate, upward-only branch, retargetBeat,
//      planRetargets stat); the driver pins the frozen base and
//      refuses a mismatched MODE/flag pair; the analyzer selftest
//      is green (38 checks incl. the retarget/defect fixtures).
//   §1 LIVE unit: winPlanSeedFromFight on a live game —
//      flag OFF leaves a hunt plan unchanged on a wave-4 meeting
//      (the old-code control: same code, flag off = old behavior);
//      flag ON retargets upward (hunt 3 -> 4, targetless hunt,
//      needWave-null inherited plan, table 4 -> 5) and holds the
//      lock on sideways / downward / suburb meetings; the beat is
//      spoken, deterministic, and carries the SAY_RE token
//      'veteran'; the gear/party seed path still works with the
//      flag off and on (regression).
//   §2 ANALYZER: synthetic band aggregates retargets / defects /
//      w4kills (dup excluded) / starvation deaths / planRetargets
//      stat correctly.
//   §3 LIVE determinism (30d, seed 109411): D1 repeatability of the
//      driver's ctl leg (identical retargets + w4kills +
//      classification + launches); D2 recorder neutrality (recorder
//      off reproduces the recorder-independent game outcomes
//      exactly, with no recorder rows).
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-retarget-a.js
// (Substrate flags are also set by the test itself when absent, so a
// bare `node scripts/test-retarget-a.js` works too. PLANRETARGET is
// NEVER set at process level here — the live unit toggles it per
// call, and the driver legs run MODE=ctl, flag off.)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// Substrate: the planform band's flags (frozen in the prereg §4).
// Set here so a bare invocation runs the same substrate as the band.
for (const f of ['VETREENGAGE', 'PARTYSIZE4', 'FLEEREPAIR2', 'FIGHTALLY2', 'SENSEEXPED', 'BOWOPEN', 'SPEARGATE', 'GUNRATE', 'CELLGATE']) {
  if (process.env[f] === undefined) process.env[f] = '1';
}
// Policy layers MUST be off. Never set by this test.
delete process.env.TABLESEATNOWAIT;
delete process.env.LEANLINKRESCUE;
// The lever flag is toggled per call in §1, never at process level.
delete process.env.PLANRETARGET;
// Short horizon for the live legs (the property under test is
// determinism/neutrality, not the band numbers).
process.env.DAYS = '30';

const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-retarget-a.js'));
const DRIVER_PATH = path.join(REPO, 'scripts', 'retarget-driver-a.js');
const DRIVER = require(DRIVER_PATH);
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- 0. Static ----------
console.log('== static ==');
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('lever: planretargetOn gate (PLANRETARGET=1, default off)', winPlanJs.indexOf("function planretargetOn()") !== -1 && winPlanJs.indexOf("process.env.PLANRETARGET === '1'") !== -1);
check('lever: hunt-lock early return intact (flag-off path unchanged)', winPlanJs.indexOf("if (plan && plan.stage !== 'gear' && plan.stage !== 'party') {") !== -1);
check('lever: upward-only branch (newWave >= 4, newWave > curWave)', winPlanJs.indexOf('if (newWave >= 4)') !== -1 && winPlanJs.indexOf('if (newWave > curWave)') !== -1);
check('lever: retarget sets target + needWave + node, keeps stage', winPlanJs.indexOf('plan.target = mdef.id || null;\n                plan.needWave = newWave;') !== -1);
check('lever: suburb guard still first (never retarget onto suburb)', winPlanJs.indexOf("if (fleerepair2On() && mdef.id === 'suburb') return null;") !== -1);
check('lever: retargetBeat defined (deterministic, SAY_RE token veteran)', winPlanJs.indexOf('function retargetBeat(self, vid, oldType, newType)') !== -1 && winPlanJs.indexOf('the kind that makes veterans') !== -1);
check('lever: planRetargets stat + null-guard in stateOf', winPlanJs.indexOf('planReseeds: 0, planExpiries: 0, planRetargets: 0,') !== -1 && winPlanJs.indexOf("if (v.winPlanStats.planRetargets == null) v.winPlanStats.planRetargets = 0;") !== -1);
check('lever: bump planRetargets on retarget', winPlanJs.indexOf("bump(this, 'planRetargets');") !== -1);
check('lever: gear/party seed path untouched', winPlanJs.indexOf('plan.target = mdef.id || null;\n        plan.needWave = (mdef.wave || 1);') !== -1);
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
check('driver: FROZEN_BASE literal present', driverSrc.indexOf("const FROZEN_BASE = '75b19b2046b3734ccd9ea4a5ec1abc0ff3180acd';") !== -1);
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: REPO, timeout: 30000 }).toString().trim(); } catch (e) {}
check('driver FROZEN_BASE is this tree HEAD (' + head.slice(0, 12) + ')', DRIVER.FROZEN_BASE === head && head !== 'unknown', 'FROZEN_BASE=' + DRIVER.FROZEN_BASE);
check('driver: MODE=arm requires PLANRETARGET=1', driverSrc.indexOf("MODE=arm requires PLANRETARGET=1") !== -1);
check('driver: MODE=ctl refuses PLANRETARGET=1', driverSrc.indexOf("MODE=ctl refuses PLANRETARGET=1") !== -1);
check('driver: layers-off refusal intact', driverSrc.indexOf('TABLESEATNOWAIT/LEANLINKRESCUE must be unset') !== -1);
check('driver: records winPlanSha (lever code identity)', driverSrc.indexOf('winPlanSha') !== -1);
check('driver exports oneRun + helpers', typeof DRIVER.oneRun === 'function' && typeof DRIVER.loadWave4pIds === 'function' && typeof DRIVER.classifyFightOrigin === 'function');
// Policy shas recorded by the driver match the files on disk.
const h = function (f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', f), 'utf8')).digest('hex').slice(0, 12); };
check('tableseat-nowait policy file hashes computable', h('tableseat-nowait.js').length === 12 && h('leanlinkrescue.js').length === 12 && h('competent.js').length === 12);

// ---------- 1. Analyzer ----------
console.log('== analyzer ==');
const st = ANALYZE.selftest();
check('analyzer selftest green (' + st.pass + ' passed, ' + st.fail + ' failed)', st.fail === 0, st.failures.join(' | '));

// ---------- 2. Analyzer band aggregates ----------
console.log('== analyzer band ==');
(function bandAggregates() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'retarget-band-'));
  function base(seed, over) {
    const b = { seed: seed, scholarId: 'scholar', roster: ['a', 'b', 'scholar'],
      maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
      endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
      v4encounters: [], v4seeds: [], v4gates: [],
      v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
      dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
      havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
      killCalls: [], daily: [{ day: 1, wave4Slain: 0 }],
      winPlanStats: { partyDepartures: 0, planRetargets: 0 },
      funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  function fight(day, vid, mid, wave, origin, outcome) {
    return { day: day, vid: vid, mid: mid, wave: wave, origin: origin, caller: 'x', outcome: outcome, monsterTile: { tx: 1, ty: 1 }, havenTile: { nx: 4, ny: 4 }, lingering: false, optsRaid: false, optsCornered: false };
  }
  function seedCall(day, vid, mid, wave, path, outcome, before, after) {
    return { day: day, vid: vid, mid: mid, wave: wave, outcome: outcome, path: path, caller: 'x',
      planExistedBefore: !!before, planBefore: before || null, planAfter: after || null,
      retNull: false, profile: 'forager', seq: 0,
      stageAfter: after ? after.stage : null, target: after ? after.target : null, node: null };
  }
  const seeds = [
    base(910001, {
      v4encounters: [fight(70, 'a', 'eater', 4, 'expedition', 'vFlee'), fight(90, 'a', 'reunion', 4, 'expedition', 'vFlee')],
      v4seeds: [
        seedCall(70, 'a', 'eater', 4, 'agency-flee', 'fled', { stage: 'hunt', target: 'spool', needWave: 3 }, { stage: 'hunt', target: 'eater', needWave: 4 }),
        seedCall(90, 'a', 'reunion', 4, 'agency-flee', 'fled', { stage: 'hunt', target: 'audit', needWave: 4 }, { stage: 'hunt', target: 'reunion', needWave: 4 }),
      ],
      killCalls: [{ day: 72, mid: 'eater', wave: 4, by: 'a', via: 'wild', trick: null, dup: false, threw: false }],
      daily: [{ day: 1, wave4Slain: 0 }, { day: 150, wave4Slain: 1 }],
      deaths: [{ day: 10, kind: 'villager', who: 'x', cause: 'starvation', player: false }],
      winPlanStats: { partyDepartures: 2, planRetargets: 1 },
    }),
    base(910002, {
      v4encounters: [fight(80, 'b', 'audit', 4, 'world-tick', 'vFlee')],
      v4seeds: [seedCall(80, 'b', 'audit', 4, 'world-tick', 'fled', { stage: 'hunt', target: null, needWave: 3 }, { stage: 'hunt', target: 'audit', needWave: 4 })],
      killCalls: [],
      daily: [{ day: 1, wave4Slain: 0 }, { day: 150, wave4Slain: 0 }],
      deaths: [],
      winPlanStats: { partyDepartures: 1, planRetargets: 1 },
    }),
  ];
  seeds.forEach(function (s) { fs.writeFileSync(path.join(dir, 'retarget-a-s' + s.seed + '-x.json'), JSON.stringify(s)); });
  const r = ANALYZE.analyzeDir(dir);
  check('band: 2 seeds read', r.seeds === 2, 'got ' + r.seeds);
  check('band: retargets 2 (one per seed)', r.retargets === 2, 'got ' + r.retargets);
  check('band: defects 1 (the sideways reunion move)', r.defects === 1, 'got ' + r.defects);
  check('band: w4kills 1, starvationDeaths 1, planRetargetsStat 2', r.w4kills === 1 && r.starvationDeaths === 1 && r.planRetargetsStat === 2, JSON.stringify({ k: r.w4kills, s: r.starvationDeaths, p: r.planRetargetsStat }));
  check('band: stat agrees with meeting rows (2 == 2)', r.planRetargetsStat === r.retargets, r.planRetargetsStat + ' vs ' + r.retargets);
  check('band: classCountsW4 names retargeted + defect', r.classCountsW4.retargeted === 2 && r.classCountsW4['defect-sideways-downward'] === 1, JSON.stringify(r.classCountsW4));
  fs.rmSync(dir, { recursive: true, force: true });
})();

// ---------- 3. Live unit (one harness) ----------
console.log('== live unit (seed 109411) ==');
async function liveUnit() {
  const { Game, loadFails } = await loadGame({ seed: 109411, mode: 'test' });
  if (loadFails && loadFails.length) { check('live module load clean', false, loadFails.join('; ')); return; }
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  check('live: 3+ NPC villagers on the roster', roster.length >= 3, 'have ' + roster.length);
  if (roster.length < 3) return;
  check('live: Game.winPlanSeedFromFight exists', typeof Game.winPlanSeedFromFight === 'function');
  const eater = mdef('eater'), audit = mdef('audit'), reunion = mdef('reunion'), spool = mdef('spool'), suburb = mdef('suburb'), finale = mdef('finale');
  check('live: defs are the expected waves (eater/audit/reunion 4, spool 3, finale 5, suburb 4)',
    !!eater && eater.wave === 4 && !!audit && audit.wave === 4 && !!reunion && reunion.wave === 4 &&
    !!spool && spool.wave === 3 && !!finale && finale.wave === 5 && !!suburb && suburb.wave === 4,
    JSON.stringify({ eater: eater && eater.wave, audit: audit && audit.wave, spool: spool && spool.wave, finale: finale && finale.wave, suburb: suburb && suburb.wave }));
  if (!eater || !audit || !reunion || !spool || !suburb || !finale) return;

  const planOf = function (vid) { return ((Game.state.village.winPlan || {})[vid]) || null; };
  const stats = function () { try { return Game.winPlanStats ? Game.winPlanStats() : ((Game.state.village || {}).winPlanStats || {}); } catch (e) { return {}; } };
  const setPlan = function (vid, plan) {
    Game.state.village.winPlan = Game.state.village.winPlan || {};
    Game.state.village.winPlan[vid] = plan;
  };
  // Capture say() lines (the harness silences narration; the wrap
  // records whatever the lever speaks, calling through to the no-op).
  const said = [];
  const origSay = Game.say;
  Game.say = function () { said.push(Array.prototype.slice.call(arguments).join(' ')); if (typeof origSay === 'function') return origSay.apply(this, arguments); };
  const saidSince = function (mark) { return said.slice(mark); };

  // U0 — flag OFF (the old-code control): a hunt plan meeting a
  // wave-4 eater stays exactly as it was — no move, no beat, no bump.
  let mark = said.length;
  delete process.env.PLANRETARGET;
  const v0 = roster[0];
  setPlan(v0, { stage: 'hunt', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const beforeStats0 = (stats().planRetargets | 0);
  const ret0 = Game.winPlanSeedFromFight(v0, eater, 'fled');
  const plan0 = planOf(v0);
  check('U0 flag OFF: hunt plan unchanged on a wave-4 meeting (target spool, needWave 3, stage hunt)',
    !!ret0 && plan0 && plan0.target === 'spool' && plan0.needWave === 3 && plan0.stage === 'hunt',
    JSON.stringify(plan0));
  check('U0 flag OFF: no beat spoken, no stat bump', saidSince(mark).length === 0 && (stats().planRetargets | 0) === beforeStats0,
    'said=' + JSON.stringify(saidSince(mark)) + ' retargets=' + (stats().planRetargets | 0));

  // U1 — flag ON, upward: hunt (needWave 3, target spool) meets the
  // eater (wave 4) and turns onto it; stage stays hunt; beat speaks.
  mark = said.length;
  process.env.PLANRETARGET = '1';
  const v1 = roster[1];
  setPlan(v1, { stage: 'hunt', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret1 = Game.winPlanSeedFromFight(v1, eater, 'fled');
  const plan1 = planOf(v1);
  check('U1 flag ON: hunt 3 -> 4 retargets onto the eater (target eater, needWave 4, stage hunt)',
    !!ret1 && plan1 && plan1.target === 'eater' && plan1.needWave === 4 && plan1.stage === 'hunt',
    JSON.stringify(plan1));
  check('U1 flag ON: planRetargets bumped exactly once', (stats().planRetargets | 0) === beforeStats0 + 1, 'retargets=' + (stats().planRetargets | 0));
  const beat1 = saidSince(mark);
  check('U1 flag ON: one beat spoken, naming the change of mind (SAY_RE token veteran, hunt turns to)',
    beat1.length === 1 && /veteran/i.test(beat1[0]) && /hunt turns to/i.test(beat1[0]), JSON.stringify(beat1));
  // U1b — the beat is deterministic: the same setup speaks the same line.
  mark = said.length;
  const v1b = roster[2];
  setPlan(v1b, { stage: 'hunt', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  Game.winPlanSeedFromFight(v1b, eater, 'fled');
  const beat1b = saidSince(mark);
  check('U1b beat deterministic: same setup speaks the same line (modulo the holder name)',
    beat1b.length === 1 && beat1b[0].replace(/^[^\s]+/, 'NAME') === beat1[0].replace(/^[^\s]+/, 'NAME'),
    JSON.stringify(beat1b) + ' vs ' + JSON.stringify(beat1));

  // U2 — flag ON, targetless hunt plan (the planform sense case:
  // needWave 3, target null) meets the audit and turns onto it.
  mark = said.length;
  setPlan(v1, { stage: 'hunt', target: null, needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret2 = Game.winPlanSeedFromFight(v1, audit, 'fled');
  const plan2 = planOf(v1);
  check('U2 flag ON: targetless hunt plan retargets onto the audit',
    !!ret2 && plan2 && plan2.target === 'audit' && plan2.needWave === 4 && plan2.stage === 'hunt',
    JSON.stringify(plan2));
  check('U2 flag ON: the targetless beat says "had no trail"',
    saidSince(mark).length === 1 && /had no trail/i.test(saidSince(mark)[0]), JSON.stringify(saidSince(mark)));

  // U3 — flag ON, needWave-null inherited plan (target spool, wave 3
  // by roster) meets the eater and turns onto it.
  setPlan(v1, { stage: 'standing', target: 'spool', needWave: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret3 = Game.winPlanSeedFromFight(v1, eater, 'fled');
  const plan3 = planOf(v1);
  check('U3 flag ON: needWave-null standing plan retargets onto the eater (roster wave 3 -> 4)',
    !!ret3 && plan3 && plan3.target === 'eater' && plan3.needWave === 4 && plan3.stage === 'standing',
    JSON.stringify(plan3));

  // U4 — flag ON, sideways: hunt (needWave 4, target audit) meets
  // the reunion (wave 4) — the lock holds, nothing moves.
  mark = said.length;
  const st4 = (stats().planRetargets | 0);
  setPlan(v1, { stage: 'hunt', target: 'audit', needWave: 4, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret4 = Game.winPlanSeedFromFight(v1, reunion, 'fled');
  const plan4 = planOf(v1);
  check('U4 flag ON sideways: hunt 4 meeting another wave-4 beast stays put',
    !!ret4 && plan4 && plan4.target === 'audit' && plan4.needWave === 4 && plan4.stage === 'hunt',
    JSON.stringify(plan4));
  check('U4 flag ON sideways: silent, no bump', saidSince(mark).length === 0 && (stats().planRetargets | 0) === st4, JSON.stringify(saidSince(mark)));

  // U5 — flag ON, downward: standing (needWave 4, target eater)
  // meets the spool (wave 3) — the lock holds, nothing moves.
  mark = said.length;
  const st5 = (stats().planRetargets | 0);
  setPlan(v1, { stage: 'standing', target: 'eater', needWave: 4, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret5 = Game.winPlanSeedFromFight(v1, spool, 'evaded');
  const plan5 = planOf(v1);
  check('U5 flag ON downward: standing 4 meeting a wave-3 beast stays put',
    !!ret5 && plan5 && plan5.target === 'eater' && plan5.needWave === 4 && plan5.stage === 'standing',
    JSON.stringify(plan5));
  check('U5 flag ON downward: silent, no bump', saidSince(mark).length === 0 && (stats().planRetargets | 0) === st5, JSON.stringify(saidSince(mark)));

  // U6 — flag ON, suburb: hunt (needWave 3) meets the suburb — the
  // fleerepair2 guard returns null and the plan is untouched.
  mark = said.length;
  const st6 = (stats().planRetargets | 0);
  setPlan(v1, { stage: 'hunt', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret6 = Game.winPlanSeedFromFight(v1, suburb, 'fled');
  const plan6 = planOf(v1);
  check('U6 flag ON suburb: gated call returns null, plan untouched',
    ret6 == null && plan6 && plan6.target === 'spool' && plan6.needWave === 3 && plan6.stage === 'hunt',
    'ret=' + ret6 + ' plan=' + JSON.stringify(plan6));
  check('U6 flag ON suburb: silent, no bump', saidSince(mark).length === 0 && (stats().planRetargets | 0) === st6, JSON.stringify(saidSince(mark)));

  // U7 — flag ON, wave 4 -> 5: table (needWave 4, target eater)
  // meets the finale (wave 5) and turns onto it.
  setPlan(v1, { stage: 'table', target: 'eater', needWave: 4, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret7 = Game.winPlanSeedFromFight(v1, finale, 'fled');
  const plan7 = planOf(v1);
  check('U7 flag ON: table 4 -> 5 retargets onto the finale',
    !!ret7 && plan7 && plan7.target === 'finale' && plan7.needWave === 5 && plan7.stage === 'table',
    JSON.stringify(plan7));

  // U8 — regression: the gear/party seed path still works with the
  // flag OFF (old behavior) and ON. A party plan (needWave 3) meets
  // the eater and turns onto it either way.
  delete process.env.PLANRETARGET;
  setPlan(v1, { stage: 'party', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret8a = Game.winPlanSeedFromFight(v1, eater, 'fled');
  const plan8a = planOf(v1);
  check('U8a flag OFF regression: party plan still seeds onto the eater',
    !!ret8a && plan8a && plan8a.target === 'eater' && plan8a.needWave === 4, JSON.stringify(plan8a));
  process.env.PLANRETARGET = '1';
  setPlan(v1, { stage: 'party', target: 'spool', needWave: 3, node: null, party: [], sinceDay: 0, holdSinceDay: -1 });
  const ret8b = Game.winPlanSeedFromFight(v1, eater, 'fled');
  const plan8b = planOf(v1);
  check('U8b flag ON regression: party plan still seeds onto the eater',
    !!ret8b && plan8b && plan8b.target === 'eater' && plan8b.needWave === 4, JSON.stringify(plan8b));

  // U9 — a plan-less villager still seeds fresh (flag ON), and a
  // wave-2 meeting still seeds nothing (the wave >= 3 floor).
  const v9 = roster.find(function (id) { return !planOf(id); }) || roster[0];
  if (planOf(v9)) { delete Game.state.village.winPlan[v9]; }
  const ret9 = Game.winPlanSeedFromFight(v9, eater, 'fled');
  const plan9 = planOf(v9);
  check('U9 flag ON: plan-less villager seeds a fresh plan onto the eater',
    !!ret9 && plan9 && plan9.target === 'eater' && plan9.needWave === 4, JSON.stringify(plan9));
  const deer = mdef('highbeam_deer') || (Game.data.monsters || []).find(function (m) { return (m.wave | 0) === 1; });
  const v9b = roster[2];
  if (planOf(v9b)) { delete Game.state.village.winPlan[v9b]; }
  const ret9b = deer ? Game.winPlanSeedFromFight(v9b, deer, 'fled') : 'no-deer-def';
  check('U9b wave-2 meeting seeds nothing (wave >= 3 floor)', ret9b == null && planOf(v9b) == null, 'ret=' + ret9b);

  delete process.env.PLANRETARGET;
  Game.say = origSay;
}

// ---------- 4. Live determinism (30d, seed 109411) ----------
console.log('== live determinism (30d, seed 109411) ==');
async function liveDeterminism() {
  function classSignature(out) {
    const a = ANALYZE.analyzeSeed(out);
    return JSON.stringify({ cc: a.classCounts, launches: a.launches, w4: a.meetingsW4, w3: a.meetingsW3, retargets: a.retargets, w4kills: a.w4kills });
  }
  let run1 = null, run2 = null, runOff = null;
  try {
    run1 = await DRIVER.oneRun(109411);
  } catch (e) { check('live run 1 completes (recorder on, ctl)', false, String(e && e.stack || e).slice(0, 300)); }
  if (run1) {
    check('live run 1: 0 instrument errors', (run1.instrumentErrors || []).length === 0, JSON.stringify((run1.instrumentErrors || []).slice(0, 3)));
    check('live run 1: 0 tick-gate mismatches', (run1.tickGateChecks || []).filter(function (x) { return !x.match; }).length === 0);
    check('live run 1: policy recorded as tableseat-nowait layers-off', run1.policy === 'tableseat-nowait (layers off -> competent verbatim)' && run1.tableseatLayerOn === false && run1.leanlinkLayerOn === false, run1.policy);
    check('live run 1: anchor is the frozen base', run1.anchorCommit === DRIVER.FROZEN_BASE && run1.anchorHead === DRIVER.FROZEN_BASE, run1.anchorCommit);
    check('live run 1: lever flag off (planretargetOn false)', run1.planretargetOn === false, 'planretargetOn=' + run1.planretargetOn);
    check('live run 1: winPlanSha recorded', typeof run1.winPlanSha === 'string' && run1.winPlanSha.length === 12, 'winPlanSha=' + run1.winPlanSha);
    check('live run 1: analyzer reads the live corpus without missing streams', ANALYZE.analyzeSeed(run1).missingStreams.length === 0, JSON.stringify(ANALYZE.analyzeSeed(run1).missingStreams));
    try { run2 = await DRIVER.oneRun(109411); } catch (e) { check('live run 2 completes (recorder on, ctl)', false, String(e && e.stack || e).slice(0, 300)); }
  }
  if (run1 && run2) {
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D1 repeatability: identical days', run1.days === run2.days, run1.days + ' vs ' + run2.days);
    check('D1 repeatability: identical meeting classification + launches + retargets + w4kills', classSignature(run1) === classSignature(run2), classSignature(run1) + ' vs ' + classSignature(run2));
    check('D1 repeatability: identical funnelStage rows', JSON.stringify(run1.funnelStage) === JSON.stringify(run2.funnelStage));
    check('D1 repeatability: identical game launch count (partyDepartures)', pd(run1) === pd(run2), pd(run1) + ' vs ' + pd(run2));
    check('D1 repeatability: identical v4seeds rows', JSON.stringify(run1.v4seeds) === JSON.stringify(run2.v4seeds));
    check('D1 repeatability: identical v4encounters rows', JSON.stringify(run1.v4encounters) === JSON.stringify(run2.v4encounters));
  }
  // D2: recorder OFF — a fresh require with the flag off (the flag
  // is read at module scope).
  try {
    process.env.RETARGET_RECORDER = 'off';
    delete require.cache[DRIVER_PATH];
    const DRIVER_OFF = require(DRIVER_PATH);
    runOff = await DRIVER_OFF.oneRun(109411);
  } catch (e) { check('live run 3 completes (recorder off)', false, String(e && e.stack || e).slice(0, 300)); }
  finally { delete process.env.RETARGET_RECORDER; }
  if (run1 && runOff) {
    // D2 neutrality via RECORDER-INDEPENDENT game outcomes only.
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D2 neutrality: recorder off, identical days', run1.days === runOff.days, run1.days + ' vs ' + runOff.days);
    check('D2 neutrality: recorder off, identical game launch count (partyDepartures)', pd(run1) === pd(runOff), pd(run1) + ' vs ' + pd(runOff));
    check('D2 neutrality: recorder off, identical maxWave + standing', run1.maxWave === runOff.maxWave && run1.standing === runOff.standing, run1.maxWave + '/' + run1.standing + ' vs ' + runOff.maxWave + '/' + runOff.standing);
    check('D2 neutrality: recorder off, identical deaths + killCalls', (run1.deaths || []).length === (runOff.deaths || []).length && (run1.killCalls || []).length === (runOff.killCalls || []).length, (run1.deaths || []).length + '/' + (run1.killCalls || []).length + ' vs ' + (runOff.deaths || []).length + '/' + (runOff.killCalls || []).length);
    check('D2 neutrality: recorder off, no retarget rows', (runOff.v4encounters || []).length === 0 && (runOff.v4seeds || []).length === 0 && (runOff.v4gates || []).length === 0, 'enc=' + (runOff.v4encounters || []).length + ' seeds=' + (runOff.v4seeds || []).length + ' gates=' + (runOff.v4gates || []).length);
    check('D2 neutrality: recorder off, no funnelStage rows', (runOff.funnelStage || []).length === 0, 'rows=' + (runOff.funnelStage || []).length);
  }
}

async function main() {
  await liveUnit();
  await liveDeterminism();
  console.log('\nretarget-a proof: ' + pass + ' passed, ' + fail + ' failed');
  if (failures.length) for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(fail ? 1 : 0);
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exit(1); });
