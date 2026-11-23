// test-homebody-handoff-a.js — proof for arm sim-homebody-a
// (findings #2498/#2568: the homebody-holder launch-attempt wall —
// seed 107380, Dale Hoffman held a wave-4 strike plan day 86-150,
// 41 dawn commits, held all 41; startExpedition refuses the range-0
// holder. The fix hands the plan to a walkable companion at depart
// time.) NOTE: scripts/test-homebody-a.js is a DIFFERENT file — the
// Oct-29 census analyzer (measurement only). This file is the -a
// BUILD arm's proof test and must not be confused with it.
// Fixtures drive the REAL winPlanDepart AND the REAL
// vbrainExecuteDepart on lightweight ctx objects (the needwave-a
// fixture shape): holder + companions with pre-existing plans,
// staged at encounter gear — a geared party (armed + armored),
// never a fresh un-geared solo scholar.
//   §A source pins (read-only greps) + instrument pins + analyzer
//     selftest 100%.
//   §B live fixtures (new code): brain-path trio handoff, winPlan
//     path pair handoff (fill), first-companion fallback.
//   §C OLD-CODE CONTROL: same fixtures against git show of the
//     branch base tip (f2d03db92) — the handoff assertions must
//     FAIL there (hold, nobody departs, plan stays) while the
//     launches themselves still succeed for a walker.
//   §D negative cases (new code): no walkable companion (hold),
//     wave-3 plan (hold — scope is wave-4+), walker holder (normal
//     launch, no transfer), targetless null-wave plan (hold),
//     wave-4 target with null needWave (handoff fires — the OR
//     definition).
// Usage:
//   node scripts/test-homebody-handoff-a.js
//   node scripts/test-homebody-handoff-a.js --old-base <sha>
// (the old-base child reads the base-tip sources straight from git
// show and evals them in-memory — no temp files, so the host write
// flap cannot break §C.)
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

const OLD_BASE = (function () {
  const i = process.argv.indexOf('--old-base');
  return i !== -1 ? process.argv[i + 1] : null;
})();
if (OLD_BASE) {
  // Old-code child: eval the base-tip sources in-memory (git show
  // reads work during the host write flap; temp-file writes do not).
  // Both files are self-contained IIFEs reading globalThis.Scattering.
  const _wp = execSync('git show ' + OLD_BASE + ':src/js/win-plan.js', { cwd: REPO }).toString();
  const _br = execSync('git show ' + OLD_BASE + ':src/js/villager-brain.js', { cwd: REPO }).toString();
  (new Function(_wp))();
  (new Function(_br))();
} else {
  require(path.join(REPO, 'src', 'js', 'win-plan.js'));
  require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
}
const Game = globalThis.Scattering.Game;

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const HANDOFF_LINE_RE = /takes the plan and leads the party/;
const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'reunion', wave: 4 }, { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 },
  { id: 'audit', wave: 4 }, { id: 'suburb', wave: 4 }, { id: 'eulogy', wave: 4 },
  { id: 'bulldozer', wave: 1 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

// Dale Hoffman, homebody (maxD 0). Maya / Theo / Femi walk (maxD 3).
// All four armed + armored: encounter gear, a geared party.
function makePeople(o) {
  const opts = o || {};
  const maxD = function (id) {
    if (opts.allHomebody) return 0;
    if (id === 'dale_hoffman') return 0;
    return 3;
  };
  const people = {
    dale_hoffman: { id: 'dale_hoffman', name: 'Dale', dead: false, _armorP: 12, _weaponB: 6,
      items: [{ id: 'spear' }], node: [5, 5] },
    maya_chen: { id: 'maya_chen', name: 'Maya', dead: false, _armorP: 11, _weaponB: 6,
      items: [{ id: 'spear' }], node: [5, 5] },
    theo_okafor: { id: 'theo_okafor', name: 'Theo', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    femi_ade: { id: 'femi_ade', name: 'Femi', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
  };
  return { people: people, maxD: maxD };
}
// Holder Dale, live wave-4 Eulogy plan (needWave 4, node set).
// Companion Maya carries a pre-existing plan (stage 'party', target
// null, needWave null); Theo carries one too; Femi carries NO plan
// (winPlanOf must create one and the sync must fill it).
// opts: target/needWave/stage/sickCompanion/walkerHolder.
function homebodyCtx(o) {
  const opts = o || {};
  const made = makePeople(opts);
  const people = made.people;
  const exped = {};
  const says = [];
  const sick = {};
  if (opts.sickCompanion) sick[opts.sickCompanion] = true;
  const holderId = opts.walkerHolder ? 'maya_chen' : 'dale_hoffman';
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? 'eulogy' : opts.target),
    needWave: (opts.needWave === undefined ? 4 : opts.needWave),
    node: { nx: 7, ny: 3 }, party: [], sinceDay: 86, holdSinceDay: -1 };
  const mayaPlan = { stage: 'party', target: null, needWave: null,
    node: null, party: [], sinceDay: 90, holdSinceDay: -1 };
  const theoPlan = { stage: 'party', target: null, needWave: null,
    node: null, party: [], sinceDay: 90, holdSinceDay: -1 };
  const roster = ['dale_hoffman', 'maya_chen', 'theo_okafor', 'femi_ade'];
  const winPlan = {};
  winPlan[holderId] = plan;
  if (holderId !== 'maya_chen') winPlan.maya_chen = mayaPlan;
  if (holderId !== 'theo_okafor') winPlan.theo_okafor = theoPlan;
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: {},
      waveKillLog: [],
      villageLastSeenDay: { eulogy: 130 },
      village: {
        px: 5, py: 5,
        roster: roster,
        trust: { maya_chen: 20, theo_okafor: 20, femi_ade: 20, dale_hoffman: 20 },
        away: {}, sick: sick, health: { dale_hoffman: 100, maya_chen: 100, theo_okafor: 100, femi_ade: 100 },
        winPlan: winPlan,
        winPlanStats: null,
        monsterSightings: { dale_hoffman: [] },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function (vid) { return made.maxD(vid) === 0 ? 'homebody' : 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function (vid) { return made.maxD(vid); },
    agencyState: function () { return { exped: exped, know: { dale_hoffman: { fought: [] } } }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function () { return true; },
    villagerFightAllies: function () { return []; },
    // Fixture model of the real startExpedition range/sick gates:
    // range-0 or sick never departs (no exped record); anyone else
    // departs on the shared target. This models the gate, not the
    // method under test — the handoff is what is being proved.
    startExpedition: function (vid, hx, hy, announce, o2) {
      if (made.maxD(vid) < 1) return;
      if (sick[vid]) return;
      exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration };
    },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'dale_hoffman' ? 'Dale' : (vid === 'maya_chen' ? 'Maya' : (vid === 'theo_okafor' ? 'Theo' : (vid === 'femi_ade' ? 'Femi' : vid))); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanDepart = function (vid, hx, hy, announce) { return Game.winPlanDepart.call(ctx, vid, hx, hy, announce); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  if (typeof Game.winPlanHomebodyHandoff === 'function') {
    ctx.winPlanHomebodyHandoff = function (vid, hx, hy, announce, opts2, c, fill) { return Game.winPlanHomebodyHandoff.call(ctx, vid, hx, hy, announce, opts2, c, fill); };
  }
  if (typeof Game.winPlanSecondCompanion === 'function') {
    ctx.winPlanSecondCompanion = function (vid, hx, hy, firstCid) { return Game.winPlanSecondCompanion.call(ctx, vid, hx, hy, firstCid); };
  }
  if (typeof Game.winPlanThirdCompanion === 'function') {
    ctx.winPlanThirdCompanion = function (vid, hx, hy, firstCid, secondCid) { return Game.winPlanThirdCompanion.call(ctx, vid, hx, hy, firstCid, secondCid); };
  }
  if (typeof Game.winPlanReseedLaunchBeat === 'function') {
    ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  }
  if (typeof Game.winPlanDepartLaunchBeat === 'function') {
    ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      // A walker holder (D3) leads different companions than Dale
      // does — the commit never names the holder as their own
      // companion.
      if (holderId === 'maya_chen') {
        return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
          companion: 'theo_okafor', companion2: 'femi_ade', companion3: null };
      }
      return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'maya_chen', companion2: 'theo_okafor', companion3: 'femi_ade' };
    };
    ctx.vbrainExecuteDepart = function (vid, hx, hy, announce) { return Game.vbrainExecuteDepart.call(ctx, vid, hx, hy, announce); };
  }
  return { ctx: ctx, plan: plan, mayaPlan: mayaPlan, theoPlan: theoPlan,
    winPlan: winPlan, exped: exped, says: says, holderId: holderId };
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  process.env.VETREENGAGE = '1';
  process.env.PARTYSIZE4 = '1';
  delete process.env.DEPARTBEAT;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4; delete process.env.DEPARTBEAT; }
function handoffLines(says) { return says.filter(function (l) { return HANDOFF_LINE_RE.test(l); }); }
function departBeatLines(says) { return says.filter(function (l) { return DEPART_BEAT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B fixtures against the given win-plan.js +
// villager-brain.js and prints one JSON line. Exits 0 always (the
// parent judges the values).
if (OLD_BASE) {
  const out = {};
  armEnv();
  const f = homebodyCtx({});
  out.brainResult = Game.vbrainExecuteDepart.call(f.ctx, 'dale_hoffman', 5, 5, false);
  out.brainExped = Object.keys(f.exped).sort();
  out.brainPlanStaysWithDale = f.winPlan.dale_hoffman === f.plan;
  out.brainHandoffLines = handoffLines(f.says).length;
  disarmEnv();
  armEnv();
  const g = homebodyCtx({});
  out.winPlanDepartResult = Game.winPlanDepart.call(g.ctx, 'dale_hoffman', 5, 5, false);
  out.winPlanDepartExped = Object.keys(g.exped).sort();
  out.winPlanPlanStaysWithDale = g.winPlan.dale_hoffman === g.plan;
  out.winPlanHandoffLines = handoffLines(g.says).length;
  disarmEnv();
  console.log(JSON.stringify(out));
  process.exit(0);
}

// ---- §A CODE PINS (read-only greps) + INSTRUMENT PINS ----
(function sectionA() {
  const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const drvSrc = fs.readFileSync(path.join(__dirname, 'homebody-driver-a.js'), 'utf8');
  const anaSrc = fs.readFileSync(path.join(__dirname, 'analyze-homebody-a.js'), 'utf8');
  check('§A win-plan.js defines winPlanHomebodyHandoff',
    /winPlanHomebodyHandoff\(vid, hx, hy, announce, opts, c, fill\)/.test(wpSrc), null);
  check('§A handoff transfers the plan (key move + delete old entry)',
    /vv\.winPlan\[leader\] = plan; delete vv\.winPlan\[vid\];/.test(wpSrc), null);
  check('§A handoff never re-offers the holder a departure (no startExpedition(vid in the helper)',
    (function () {
      const m = wpSrc.match(/winPlanHomebodyHandoff\(vid, hx, hy, announce, opts, c, fill\) \{([\s\S]*?)\n    \},/);
      return !!m && m[1].indexOf('startExpedition(vid') === -1;
    })(), null);
  check('§A handoff is wave-4+ scoped (needWave >= 4 OR target wave via monsterWaveOf)',
    /monsterWaveOf\(this, plan\.target\)/.test(wpSrc) && /if \(wave < 4\)/.test(wpSrc), null);
  check('§A handoff speaks the transfer line',
    /takes the plan and leads the party/.test(wpSrc), null);
  check('§A brain path calls the handoff (no fill — dawn companions carried)',
    /winPlanHomebodyHandoff\(vid, hx, hy, announce, opts, c, false\)/.test(brainSrc), null);
  check('§A winPlanDepart path calls the handoff (fill — second seat after transfer)',
    /winPlanHomebodyHandoff\(vid, hx, hy, playerAtHaven, \{ tx: tx, ty: ty, duration: dur \}, \{ companion: cid, companion2: null, companion3: null \}, true\)/.test(wpSrc), null);
  check('§A driver records handoffs (method-absent safe, no error on ctl)',
    /handoffs/.test(drvSrc) && /winPlanHomebodyHandoff/.test(drvSrc) && /HANDOFF_LINE_RE/.test(drvSrc), null);
  check('§A driver records winplanSha + brainSha for leg-side proof',
    /winplanSha/.test(drvSrc) && /brainSha/.test(drvSrc), null);
  check('§A analyzer judges the frozen bars (primary +4, Dale >= 1, starvation, survival, det-gate)',
    /ctlLaunches \+ 4/.test(anaSrc) && /daleConversions/.test(anaSrc) && /firstHandoffDay/.test(anaSrc) && /0\.8 \* ctlMed/.test(anaSrc), null);
  check('§A analyzer selftest passes 100%',
    (function () { try { return require(path.join(__dirname, 'analyze-homebody-a.js')).selftest() === true; } catch (e) { return false; } })(), null);
})();

// ---- §B LIVE FIXTURES (new code) ----
(function sectionB() {
  // B1: brain path — Dale holds, Maya leads the trio out.
  armEnv();
  const f = homebodyCtx({});
  const res = Game.vbrainExecuteDepart.call(f.ctx, 'dale_hoffman', 5, 5, false);
  check('§B1 brain path launches (handoff, not hold)', res === 'launch', { res: res });
  check('§B1 the new leader + both companions depart; the homebody stays home',
    !!f.exped.maya_chen && !!f.exped.theo_okafor && !!f.exped.femi_ade && !f.exped.dale_hoffman,
    { exped: Object.keys(f.exped) });
  check('§B1 the plan object moves to the new leader (identity)',
    f.winPlan.maya_chen === f.plan && f.winPlan.dale_hoffman === undefined, null);
  check('§B1 the transferred plan is stage hunt with the departed party',
    f.plan.stage === 'hunt' && JSON.stringify(f.plan.party) === JSON.stringify(['theo_okafor', 'femi_ade']), { party: f.plan.party });
  check('§B1 the handoff line speaks the transfer',
    handoffLines(f.says).length === 1 && /Dale never leaves Haven — Maya takes the plan/.test(handoffLines(f.says)[0]), { lines: handoffLines(f.says) });
  check('§B1 the departure beat speaks with the new leader',
    departBeatLines(f.says).length === 1 && /Maya sets out with Theo and Femi after Eulogy/.test(departBeatLines(f.says)[0]), { lines: departBeatLines(f.says) });
  check('§B1 homebodyHandoffs + partyDepartures bumped',
    f.ctx.state.village.winPlanStats && f.ctx.state.village.winPlanStats.homebodyHandoffs === 1 &&
    f.ctx.state.village.winPlanStats.partyDepartures === 1, { stats: f.ctx.state.village.winPlanStats });
  check('§B1 companion plans mirror the hunt (target + needWave carried)',
    f.winPlan.theo_okafor && f.winPlan.theo_okafor.stage === 'hunt' && f.winPlan.theo_okafor.target === 'eulogy' &&
    f.winPlan.theo_okafor.needWave === 4 && f.winPlan.femi_ade && f.winPlan.femi_ade.stage === 'hunt' &&
    f.winPlan.femi_ade.needWave === 4, { theo: f.winPlan.theo_okafor, femi: f.winPlan.femi_ade });
  disarmEnv();

  // B2: winPlanDepart path — the picked companion leads, second seat filled.
  armEnv();
  const g = homebodyCtx({});
  const res2 = Game.winPlanDepart.call(g.ctx, 'dale_hoffman', 5, 5, false);
  check('§B2 winPlanDepart launches (handoff, not false)', res2 === 'launch', { res: res2 });
  check('§B2 the picked companion leads (Femi, first by rank) + second seat filled (Maya); Dale + Theo stay',
    !!g.exped.femi_ade && !!g.exped.maya_chen && !g.exped.dale_hoffman && !g.exped.theo_okafor,
    { exped: Object.keys(g.exped) });
  check('§B2 the plan object moves to the picked leader (identity)',
    g.winPlan.femi_ade === g.plan && g.winPlan.dale_hoffman === undefined, null);
  check('§B2 the handoff line + departure beat speak with the new leader',
    handoffLines(g.says).length === 1 && /Dale never leaves Haven — Femi takes the plan/.test(handoffLines(g.says)[0]) &&
    departBeatLines(g.says).length === 1 && /Femi sets out with Maya after Eulogy/.test(departBeatLines(g.says)[0]),
    { lines: g.says });
  disarmEnv();

  // B6: first companion blocked (Maya sick) — the lead falls to Theo.
  armEnv();
  const h = homebodyCtx({ sickCompanion: 'maya_chen' });
  const res6 = Game.vbrainExecuteDepart.call(h.ctx, 'dale_hoffman', 5, 5, false);
  check('§B6 sick first companion: the lead falls to the next walker (Theo)',
    res6 === 'launch' && !!h.exped.theo_okafor && !!h.exped.femi_ade && !h.exped.maya_chen && !h.exped.dale_hoffman,
    { res: res6, exped: Object.keys(h.exped) });
  check('§B6 the plan moves to Theo (identity)',
    h.winPlan.theo_okafor === h.plan && h.winPlan.dale_hoffman === undefined, null);
  check('§B6 the handoff line names Theo',
    handoffLines(h.says).length === 1 && /Theo takes the plan/.test(handoffLines(h.says)[0]), { lines: handoffLines(h.says) });
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL ----
(function sectionC() {
  // Frozen base tip: the old win-plan.js + villager-brain.js come
  // from git show of this commit. The child runs the same §B
  // fixtures against them; the handoff assertions must read hold /
  // false with nobody departing and the plan staying with Dale.
  const BASE = '80e7da0bc';
  try {
    const raw = execSync('node ' + path.join(__dirname, 'test-homebody-handoff-a.js') +
      ' --old-base ' + BASE, { cwd: REPO }).toString().trim();
    const old = JSON.parse(raw.split('\n').pop());
    check('§C old code holds on the brain path (no handoff exists)',
      old.brainResult === 'hold' && old.brainExped.length === 0, old);
    check('§C old code keeps the plan with Dale on the brain path',
      old.brainPlanStaysWithDale === true && old.brainHandoffLines === 0, old);
    check('§C old code fails the launch on the winPlanDepart path',
      old.winPlanDepartResult === 'hold' && old.winPlanDepartExped.length === 0, old);
    check('§C old code keeps the plan with Dale on the winPlanDepart path',
      old.winPlanPlanStaysWithDale === true && old.winPlanHandoffLines === 0, old);
  } catch (e) {
    check('§C old-code control runs', false, String(e && e.message || e).slice(0, 200));
  }
})();

// ---- §D NEGATIVE CASES (new code) ----
(function sectionD() {
  // D1: no walkable companion — all homebodies. Hold; plan stays.
  armEnv();
  const f = homebodyCtx({ allHomebody: true });
  const res = Game.vbrainExecuteDepart.call(f.ctx, 'dale_hoffman', 5, 5, false);
  check('§D1 all-homebody party holds (no walker to hand to)',
    res === 'hold' && Object.keys(f.exped).length === 0 && f.winPlan.dale_hoffman === f.plan,
    { res: res, exped: Object.keys(f.exped) });
  check('§D1 no handoff line on a hold', handoffLines(f.says).length === 0, { lines: f.says });
  disarmEnv();
  // D2: wave-3 plan — scope is wave-4+. Hold; plan stays.
  armEnv();
  const g = homebodyCtx({ target: 'spool', needWave: 3 });
  const res2 = Game.vbrainExecuteDepart.call(g.ctx, 'dale_hoffman', 5, 5, false);
  check('§D2 wave-3 plan holds (handoff is wave-4+ only)',
    res2 === 'hold' && Object.keys(g.exped).length === 0 && g.winPlan.dale_hoffman === g.plan,
    { res: res2, exped: Object.keys(g.exped) });
  disarmEnv();
  // D3: walker holder — normal launch, no transfer, no handoff line.
  armEnv();
  const h = homebodyCtx({ walkerHolder: true });
  const res3 = Game.vbrainExecuteDepart.call(h.ctx, 'maya_chen', 5, 5, false);
  check('§D3 walker holder launches normally (holder leads)',
    res3 === 'launch' && !!h.exped.maya_chen && !!h.exped.theo_okafor && !!h.exped.femi_ade,
    { res: res3, exped: Object.keys(h.exped) });
  check('§D3 the plan stays with the walker holder (no transfer)',
    h.winPlan.maya_chen === h.plan, null);
  check('§D3 no handoff line for a normal launch', handoffLines(h.says).length === 0, { lines: h.says });
  disarmEnv();
  // D4: targetless null-wave plan — not wave-4+. Hold; plan stays.
  armEnv();
  const k = homebodyCtx({ target: null, needWave: null });
  const res4 = Game.vbrainExecuteDepart.call(k.ctx, 'dale_hoffman', 5, 5, false);
  check('§D4 targetless null-wave plan holds (not wave-4+)',
    res4 === 'hold' && Object.keys(k.exped).length === 0 && k.winPlan.dale_hoffman === k.plan,
    { res: res4, exped: Object.keys(k.exped) });
  disarmEnv();
  // D5: wave-4 TARGET with null needWave — the OR definition fires.
  armEnv();
  const m = homebodyCtx({ target: 'eulogy', needWave: null });
  const res5 = Game.vbrainExecuteDepart.call(m.ctx, 'dale_hoffman', 5, 5, false);
  check('§D5 wave-4 target with null needWave still hands off (OR definition)',
    res5 === 'launch' && !!m.exped.maya_chen && m.winPlan.maya_chen === m.plan,
    { res: res5, exped: Object.keys(m.exped) });
  disarmEnv();
})();

console.log('test-homebody-handoff-a: ' + passed + ' pass, ' + failed + ' fail');
process.exit(failed === 0 ? 0 : 1);
