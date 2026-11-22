// test-needwave-a.js — REVERT GUARD for arm sim-needwave-a (NO-GO).
// The arm's lever (copy needWave unconditionally in the companion
// plan sync) was KILLED: a leader with no wave number wipes a
// companion's set wave number (evidence/2026-11-22/sim-needwave-a.md
// §4 — seed 107377, Jason's wave 4 wiped day 58, trio launch became
// a silent solo). The game-code change is reverted zero-trace, and
// THIS test now guards the revert on master: it proves the unguarded
// copy is absent on BOTH launch paths and that a companion's set
// wave number survives departing with a null-wave leader.
//   §A source pins (negated): no unguarded `cplan.needWave = ...`
//       statement at line start in win-plan.js / villager-brain.js.
//       A GUARDED copy (e.g. `if (...) cplan.needWave = ...`) does
//       not trip these pins — sim-needwave-b owns that shape.
//   §B live fixtures: launches still succeed; companions keep their
//       own needWave (null stays null, 4 stays 4).
//   §B2W null-holder wipe guard: leader needWave null, companions 4
//       — both companions must keep 4 after the departure.
//   §B3 LAUNCHVOICE (journey r268, 1c11dbb14): the departure-beat
//       wave-4+ gate is gone by design, so the companion-turned-
//       holder speaks their line too — the beat is wave-agnostic
//       now. §B3 pins that the hook fires (launch narration intact),
//       not silence.
//   §C OLD-CODE CONTROL unchanged: fixtures against the frozen
//       branch-base tip must leave companions needWave-null.
//   §D negative cases: wave-3 launch copies nothing; targetless
//       null-wave launch invents nothing.
// Adopted by run fleshout-20261122T1415Z (rebase onto 4dc7cb454 +
// this guard flip); the frozen arm record (23/23 on the lever code)
// stands in sim-needwave-a.md §9. sim-needwave-b (guarded copy)
// replaces this guard with a lever proof of its own.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { execSync } = require('child_process');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};

const OLD_CODE_PATH = (function () {
  const i = process.argv.indexOf('--old-code');
  return i !== -1 ? process.argv[i + 1] : null;
})();
const OLD_BRAIN_PATH = (function () {
  const i = process.argv.indexOf('--old-brain');
  return i !== -1 ? process.argv[i + 1] : null;
})();
require(OLD_CODE_PATH || path.join(REPO, 'src', 'js', 'win-plan.js'));
if (!OLD_CODE_PATH) require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
else if (OLD_BRAIN_PATH) require(OLD_BRAIN_PATH);
const Game = globalThis.Scattering.Game;

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'reunion', wave: 4 }, { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 },
  { id: 'audit', wave: 4 }, { id: 'suburb', wave: 4 }, { id: 'bulldozer', wave: 1 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

function makePeople() {
  return {
    amina_diallo: { id: 'amina_diallo', name: 'Amina', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    diana_osei: { id: 'diana_osei', name: 'Diana', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    emmett_okafor: { id: 'emmett_okafor', name: 'Emmett', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    femi_ade: { id: 'femi_ade', name: 'Femi', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
  };
}
// Holder Amina, live wave-4 Herald plan (needWave 4). Companion
// Diana carries a pre-existing plan (stage 'party', target null,
// needWave null) — the companion-inherited shape. Emmett carries a
// pre-existing plan too (for the brain trio); Femi carries NO plan
// (winPlanOf must create one and the sync must fill it).
// opts: target/needWave/stage/quad (brain path with companion2/3).
function needwaveCtx(o) {
  const opts = o || {};
  const people = makePeople();
  const exped = {};
  const says = [];
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave === undefined ? 4 : opts.needWave),
    node: null, party: [], sinceDay: 26, holdSinceDay: -1 };
  const dianaPlan = { stage: 'party', target: null, needWave: (opts.dianaNeedWave === undefined ? null : opts.dianaNeedWave),
    node: null, party: [], sinceDay: 30, holdSinceDay: -1 };
  const emmettPlan = { stage: 'party', target: null, needWave: (opts.emmettNeedWave === undefined ? null : opts.emmettNeedWave),
    node: null, party: [], sinceDay: 30, holdSinceDay: -1 };
  const roster = ['amina_diallo', 'diana_osei', 'emmett_okafor', 'femi_ade'];
  const winPlan = { amina_diallo: plan, diana_osei: dianaPlan, emmett_okafor: emmettPlan };
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: {},
      waveKillLog: [],
      villageLastSeenDay: { herald: 130 },
      village: {
        px: 5, py: 5,
        roster: roster,
        trust: { diana_osei: 20, emmett_okafor: 20, femi_ade: 20 },
        away: {}, sick: {}, health: { amina_diallo: 100, diana_osei: 100, emmett_okafor: 100, femi_ade: 100 },
        winPlan: winPlan,
        winPlanStats: null,
        monsterSightings: { amina_diallo: [] },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function () { return 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function () { return 3; },
    agencyState: function () { return { exped: exped, know: { amina_diallo: { fought: [] } } }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function () { return true; },
    villagerFightAllies: function () { return []; },
    startExpedition: function (vid, hx, hy, announce, o2) {
      exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration };
    },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'amina_diallo' ? 'Amina' : (vid === 'diana_osei' ? 'Diana' : (vid === 'emmett_okafor' ? 'Emmett' : (vid === 'femi_ade' ? 'Femi' : vid))); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanDepart = function (vid, hx, hy, announce) { return Game.winPlanDepart.call(ctx, vid, hx, hy, announce); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  if (typeof Game.winPlanReseedLaunchBeat === 'function') {
    ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  }
  if (typeof Game.winPlanDepartLaunchBeat === 'function') {
    ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'diana_osei', companion2: (opts.quad ? 'emmett_okafor' : null),
        companion3: (opts.quad ? 'femi_ade' : null) };
    };
    ctx.vbrainExecuteDepart = function (vid, hx, hy, announce) { return Game.vbrainExecuteDepart.call(ctx, vid, hx, hy, announce); };
  }
  return { ctx: ctx, plan: plan, dianaPlan: dianaPlan, emmettPlan: emmettPlan,
    winPlan: winPlan, exped: exped, says: says };
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
  delete process.env.DEPARTBEAT;
}
function armQuadEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  process.env.VETREENGAGE = '1'; process.env.PARTYSIZE4 = '1';
  delete process.env.DEPARTBEAT;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4; delete process.env.DEPARTBEAT; }
function departBeatLines(says) { return says.filter(function (l) { return DEPART_BEAT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B fixtures against the given win-plan.js +
// villager-brain.js and prints one JSON line. Exits 0 always (the
// parent judges the values).
if (OLD_CODE_PATH) {
  const out = {};
  armEnv();
  const f = needwaveCtx({});
  out.winPlanDepartResult = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  out.winPlanDepartLaunched = !!f.exped.amina_diallo;
  out.dianaNeedWaveAfterDepart = (f.winPlan.diana_osei && f.winPlan.diana_osei.needWave != null) ? f.winPlan.diana_osei.needWave : null;
  out.dianaTargetAfterDepart = (f.winPlan.diana_osei && f.winPlan.diana_osei.target) || null;
  out.dianaStageAfterDepart = (f.winPlan.diana_osei && f.winPlan.diana_osei.stage) || null;
  disarmEnv();
  armQuadEnv();
  const g = needwaveCtx({ quad: true });
  out.brainResult = Game.vbrainExecuteDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  out.brainLaunched = !!g.exped.amina_diallo;
  out.brainDianaNeedWave = (g.winPlan.diana_osei && g.winPlan.diana_osei.needWave != null) ? g.winPlan.diana_osei.needWave : null;
  out.brainEmmettNeedWave = (g.winPlan.emmett_okafor && g.winPlan.emmett_okafor.needWave != null) ? g.winPlan.emmett_okafor.needWave : null;
  out.brainFemiNeedWave = (g.winPlan.femi_ade && g.winPlan.femi_ade.needWave != null) ? g.winPlan.femi_ade.needWave : null;
  out.brainFemiTarget = (g.winPlan.femi_ade && g.winPlan.femi_ade.target) || null;
  out.brainFemiExists = !!g.winPlan.femi_ade;
  disarmEnv();
  console.log(JSON.stringify(out));
  process.exit(0);
}

// ---- §A CODE PINS (read-only greps) ----
(function sectionA() {
  const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const drvSrc = fs.readFileSync(path.join(__dirname, 'needwave-driver-a.js'), 'utf8');
  const anaSrc = fs.readFileSync(path.join(__dirname, 'analyze-needwave-a.js'), 'utf8');
  check('§A win-plan.js has NO unguarded needWave copy (NO-GO revert guard)',
    !/(^|\n)\s*cplan\.needWave = plan\.needWave;/.test(wpSrc) &&
    !/(^|\n)\s*cplan2\.needWave = plan\.needWave;/.test(wpSrc) &&
    !/(^|\n)\s*cplan3\.needWave = plan\.needWave;/.test(wpSrc), null);
  check('§A villager-brain.js has NO unguarded needWave copy (NO-GO revert guard)',
    !/(^|\n)\s*cplan\.needWave = plan2 \? plan2\.needWave : null;/.test(brainSrc) &&
    !/(^|\n)\s*cplan2\.needWave = plan2 \? plan2\.needWave : null;/.test(brainSrc) &&
    !/(^|\n)\s*cplan3\.needWave = plan2 \? plan2\.needWave : null;/.test(brainSrc), null);
  check('§A driver records needWaveCopies on both depart paths',
    /needWaveCopies/.test(drvSrc) && /snapshotNeedWaves/.test(drvSrc) && /diffNeedWaves/.test(drvSrc), null);
  check('§A driver records departBeats with ordinarySpoke + reseedSpoke',
    /departBeats/.test(drvSrc) && /ordinarySpoke/.test(drvSrc) && /reseedSpoke/.test(drvSrc), null);
  check('§A driver records verbatim beatLines via say wrap',
    /beatLines/.test(drvSrc) && /DEPART_BEAT_RE/.test(drvSrc), null);
  check('§A driver records winplanSha + brainSha for leg-side proof',
    /winplanSha/.test(drvSrc) && /brainSha/.test(drvSrc), null);
  check('§A analyzer judges the frozen bars (primary 0.25, trio, beat, starvation, survival, det-gate)',
    /0\.25/.test(anaSrc) && /detGateForSeed/.test(anaSrc) && /starvTotal/.test(anaSrc) && /0\.8 \* ctlMed/.test(anaSrc), null);
  check('§A analyzer selftest passes 100%',
    (function () { try { return require(path.join(__dirname, 'analyze-needwave-a.js')).selftest() === true; } catch (e) { return false; } })(), null);
})();

// ---- §B LIVE FIXTURES (new code) ----
(function sectionB() {
  // B1: winPlanDepart path — pair launch, Diana inherits needWave 4.
  armEnv();
  const f = needwaveCtx({});
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  check('§B1 winPlanDepart launches the pair', res === 'launch' && !!f.exped.amina_diallo && !!f.exped.diana_osei, { res: res, exped: Object.keys(f.exped) });
  check('§B1 companion plan needWave stays null (no unguarded copy)',
    f.winPlan.diana_osei && f.winPlan.diana_osei.needWave == null, { needWave: f.winPlan.diana_osei && f.winPlan.diana_osei.needWave });
  check('§B1 companion plan still inherits target + stage',
    f.winPlan.diana_osei && f.winPlan.diana_osei.target === 'herald' && f.winPlan.diana_osei.stage === 'hunt', null);
  check('§B1 holder plan needWave untouched by the sync',
    f.plan.needWave === 4 && f.plan.stage === 'hunt', null);
  disarmEnv();

  // B2: brain path — quad launch, all three companions inherit needWave 4.
  armQuadEnv();
  const g = needwaveCtx({ quad: true });
  const res2 = Game.vbrainExecuteDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  check('§B2 vbrainExecuteDepart launches the quad', res2 === 'launch' && !!g.exped.amina_diallo && !!g.exped.diana_osei && !!g.exped.emmett_okafor && !!g.exped.femi_ade, { res: res2, exped: Object.keys(g.exped) });
  check('§B2 first companion needWave stays null (no unguarded copy)',
    g.winPlan.diana_osei && g.winPlan.diana_osei.needWave == null, { needWave: g.winPlan.diana_osei && g.winPlan.diana_osei.needWave });
  check('§B2 second companion needWave stays null (no unguarded copy)',
    g.winPlan.emmett_okafor && g.winPlan.emmett_okafor.needWave == null, { needWave: g.winPlan.emmett_okafor && g.winPlan.emmett_okafor.needWave });
  check('§B2 planless third companion gets a plan, needWave stays null',
    g.winPlan.femi_ade && g.winPlan.femi_ade.needWave == null && g.winPlan.femi_ade.stage === 'hunt', { femi: g.winPlan.femi_ade });
  disarmEnv();

  // B2W: null-holder wipe guard — the NO-GO's root cause. A leader
  // whose plan has NO wave number departs with companions who DO
  // have one; the unguarded copy would erase theirs. On reverted
  // code both companions keep their 4.
  armQuadEnv();
  const w = needwaveCtx({ quad: true, needWave: null, dianaNeedWave: 4, emmettNeedWave: 4 });
  const resW = Game.vbrainExecuteDepart.call(w.ctx, 'amina_diallo', 5, 5, false);
  check('§B2W null-wave leader departs with set-wave companions', resW === 'launch' && !!w.exped.amina_diallo, { res: resW, exped: Object.keys(w.exped) });
  check('§B2W first companion keeps needWave 4 (no wipe)',
    w.winPlan.diana_osei && w.winPlan.diana_osei.needWave === 4, { needWave: w.winPlan.diana_osei && w.winPlan.diana_osei.needWave });
  check('§B2W second companion keeps needWave 4 (no wipe)',
    w.winPlan.emmett_okafor && w.winPlan.emmett_okafor.needWave === 4, { needWave: w.winPlan.emmett_okafor && w.winPlan.emmett_okafor.needWave });
  disarmEnv();

  // B3: second order — the companion-turned-holder speaks the beat.
  armEnv();
  const h = needwaveCtx({});
  Game.winPlanDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  const before = departBeatLines(h.says).length;
  const hookRet = Game.winPlanDepartLaunchBeat.call(h.ctx, 'diana_osei', ['amina_diallo']);
  const beatLines = departBeatLines(h.says);
  check('§B3 companion-turned-holder speaks (LAUNCHVOICE r268: wave-4+ beat gate gone, beat is wave-agnostic)',
    hookRet === true && beatLines.length === before + 1 &&
    /Diana sets out with Amina after Herald — the fire marks the trail\./.test(beatLines[beatLines.length - 1] || ''), { hookRet: hookRet, lines: beatLines });
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL ----
(function sectionC() {
  // Frozen branch base tip (prereg §base): the old win-plan.js +
  // villager-brain.js come from git show of this commit. The child
  // runs the same §B fixtures against them; the copy assertions
  // must read null (fail on old, pass on new) while the launches
  // themselves still succeed.
  const BASE = 'bda6ff495';
  const tmp = '/tmp/needwave-oldcode-' + process.pid;
  try {
    fs.mkdirSync(tmp, { recursive: true });
    const wpOld = path.join(tmp, 'win-plan.js');
    const brOld = path.join(tmp, 'villager-brain.js');
    fs.writeFileSync(wpOld, execSync('git show ' + BASE + ':src/js/win-plan.js', { cwd: REPO }).toString());
    fs.writeFileSync(brOld, execSync('git show ' + BASE + ':src/js/villager-brain.js', { cwd: REPO }).toString());
    const raw = execSync('node ' + path.join(__dirname, 'test-needwave-a.js') +
      ' --old-code ' + wpOld + ' --old-brain ' + brOld, { cwd: REPO }).toString().trim();
    const old = JSON.parse(raw.split('\n').pop());
    check('§C old code still launches on both paths (the lever changes the sync, not the launch)',
      old.winPlanDepartResult === 'launch' && old.winPlanDepartLaunched === true &&
      old.brainResult === 'launch' && old.brainLaunched === true, old);
    check('§C old code leaves the companion needWave null on the winPlanDepart path',
      old.dianaNeedWaveAfterDepart === null, { needWave: old.dianaNeedWaveAfterDepart });
    check('§C old code leaves all three companions needWave null on the brain path',
      old.brainDianaNeedWave === null && old.brainEmmettNeedWave === null && old.brainFemiNeedWave === null,
      { diana: old.brainDianaNeedWave, emmett: old.brainEmmettNeedWave, femi: old.brainFemiNeedWave });
    check('§C old code still creates the planless third companion plan (winPlanOf), targetless and needWave-null',
      old.brainFemiExists === true && old.brainFemiNeedWave === null, { femi: old.brainFemiNeedWave });
  } catch (e) {
    check('§C old-code control runs', false, String(e && e.message || e).slice(0, 200));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
})();

// ---- §D NEGATIVE CASES ----
(function sectionD() {
  // D1: a wave-3 launch copies needWave 3 faithfully (not a hardcoded 4).
  armEnv();
  const f = needwaveCtx({ target: 'spool', needWave: 3 });
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  check('§D1 wave-3 launch does NOT copy needWave (stays null, no unguarded copy)',
    res === 'launch' && f.winPlan.diana_osei && f.winPlan.diana_osei.needWave == null, { needWave: f.winPlan.diana_osei && f.winPlan.diana_osei.needWave });
  disarmEnv();
  // D2: the sync does not invent a needWave for a targetless plan.
  armEnv();
  const g = needwaveCtx({ target: null, needWave: null });
  // A targetless plan with needWave null: the seed would have set
  // needWave 1+; force the shape directly (holder plan needWave null
  // is the winPlanOf-created shape). The launch copies null, not 4.
  g.plan.needWave = null;
  const res2 = Game.winPlanDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  check('§D2 targetless null-needWave launch copies null (no invented wave)',
    g.winPlan.diana_osei && g.winPlan.diana_osei.needWave == null, { needWave: g.winPlan.diana_osei && g.winPlan.diana_osei.needWave });
  disarmEnv();
})();

console.log('test-needwave-a: ' + passed + ' pass, ' + failed + ' fail');
process.exit(failed ? 1 : 0);
