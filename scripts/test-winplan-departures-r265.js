// test-winplan-departures-r265.js — proof test, run r265 (establishment).
// Proves the brain launch path counts its departures: vbrainExecuteDepart
// is the departure path that fires in sims (agency calls it before
// winPlanDepart), and it sets plans to 'hunt' — but it never bumped
// partyDepartures, only winPlanDepart did. The r265 pilot seed 101966
// showed the shape live: two plans in 'hunt' with partyDepartures 0,
// partyFights 86 — plans were launching and fighting, and the counter
// that the WINPLAN bar judges on read zero. Same gap the trio/quad
// counters already had (their comments say so); this test pins the
// departures half.
//   §A code pin (read-only grep): the bump lives in vbrainExecuteDepart.
//   §B staged fixture — holder Amina, wave-4 Herald plan, companion
//       Diana, both armed + armored (spear + armor) — the gear and
//       party a player actually has at a wave-4 hunt, never a fresh
//       un-geared solo scholar. Drives the REAL vbrainExecuteDepart
//       (stubbed dawn commit): departures 0 -> 1, stage 'hunt'.
//   §C repeat call while already out: still 'launch', departures stay 1.
//   §D blocked inviter: 'hold', departures stay 0, stage stays 'party'.
//   §E the other path still counts: winPlanDepart bumps the same ledger.
// Usage: node scripts/test-winplan-departures-r265.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

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

require(path.join(REPO, 'src', 'js', 'win-plan.js'));
require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

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
  };
}
// Adapted from test-departbeat-b.js beatCtx (proven to drive both launch
// paths): holder Amina, live Herald plan (needWave 4), companion Diana.
// opts override: stage/target/slain/killLog/seen/fought/sightings/
// needWave/away/systemArrived/refuse (ids whose startExpedition is
// refused, modelling a blocked holder or companion).
function launchCtx(o) {
  const opts = o || {};
  const people = makePeople();
  const exped = {};
  const says = [];
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave == null ? 4 : opts.needWave),
    node: null, party: [], sinceDay: 26, holdSinceDay: -1 };
  if (opts.expired) plan.reseedExpiryDay = 28;
  const roster = ['amina_diallo', 'diana_osei', 'emmett_okafor'];
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: (opts.slain == null ? {} : opts.slain),
      waveKillLog: (opts.killLog === undefined ? [] : opts.killLog),
      villageLastSeenDay: (opts.seen === undefined ? { herald: 130 } : opts.seen),
      village: {
        px: 5, py: 5,
        roster: roster,
        trust: { diana_osei: 20, emmett_okafor: 20 },
        away: (opts.away || {}), sick: {}, health: { amina_diallo: 100, diana_osei: 100, emmett_okafor: 100 },
        winPlan: { amina_diallo: plan },
        winPlanStats: null,
        monsterSightings: { amina_diallo: (opts.sightings || []) },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function () { return 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function () { return 3; },
    agencyState: function () { return { exped: exped, know: { amina_diallo: { fought: (opts.fought || []) } } }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function () { return true; },
    villagerFightAllies: function () { return []; },
    startExpedition: function (vid, hx, hy, announce, o2) {
      if ((opts.refuse || []).indexOf(vid) !== -1) return;
      exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration };
    },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'amina_diallo' ? 'Amina' : (vid === 'diana_osei' ? 'Diana' : (vid === 'emmett_okafor' ? 'Emmett' : vid)); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  if (opts.systemArrived) ctx.state.systemArrived = true;
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanDepart = function (vid, hx, hy, announce) { return Game.winPlanDepart.call(ctx, vid, hx, hy, announce); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  // The real Game carries winPlanStats as a method; the bump reads
  // this.winPlanStats(), so the fixture binds it the same way.
  ctx.winPlanStats = function () { return Game.winPlanStats.call(ctx); };
  if (typeof Game.winPlanReseedLaunchBeat === 'function') {
    ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  }
  if (typeof Game.winPlanDepartLaunchBeat === 'function') {
    ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'diana_osei', companion2: (opts.companion2 || null), companion3: null };
    };
    ctx.vbrainExecuteDepart = function (vid, hx, hy, announce) { return Game.vbrainExecuteDepart.call(ctx, vid, hx, hy, announce); };
  }
  return { ctx: ctx, plan: plan, exped: exped, says: says };
}
function statsOf(ctx) {
  try { return Game.winPlanStats.call(ctx) || {}; } catch (e) { return {}; }
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
  delete process.env.DEPARTBEAT;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; delete process.env.VETREENGAGE; delete process.env.DEPARTBEAT; }

// ---- §A CODE PIN (read-only grep) ----
(function sectionA() {
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const lines = src.split('\n');
  const idxExecute = lines.findIndex(function (l) { return l.indexOf('vbrainExecuteDepart: function') !== -1; });
  const idxBump = lines.findIndex(function (l) { return l.indexOf('partyDepartures = (_pd.partyDepartures') !== -1; });
  check('§A vbrainExecuteDepart bumps partyDepartures (the brain launch path counts its departures)',
    idxExecute !== -1 && idxBump !== -1 && idxBump > idxExecute,
    { idxExecute: idxExecute, idxBump: idxBump });
  if (idxExecute !== -1 && idxBump !== -1) {
    const between = lines.slice(idxExecute, idxBump).join('\n');
    check('§A the bump sits inside the party_launch branch (not a stray counter)',
      between.indexOf('party_launch') !== -1, null);
  }
})();

// ---- §B LIVE: brain-path launch counts one departure ----
(function sectionB() {
  armEnv();
  const f = launchCtx({});
  const before = statsOf(f.ctx).partyDepartures || 0;
  const res = Game.vbrainExecuteDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const after = statsOf(f.ctx).partyDepartures || 0;
  check('§B brain-path launch returns launch', res === 'launch', { res: res });
  check('§B holder + companion expeditions started', !!f.exped.amina_diallo && !!f.exped.diana_osei, { exped: Object.keys(f.exped) });
  check('§B holder plan advanced to hunt', f.plan.stage === 'hunt', { stage: f.plan.stage });
  check('§B partyDepartures 0 -> 1 on the brain path (was 0 before the fix)', before === 0 && after === 1, { before: before, after: after });
  check('§B pair launch does not bump partyTrios', (statsOf(f.ctx).partyTrios || 0) === 0, { trios: statsOf(f.ctx).partyTrios });
  disarmEnv();
})();

// ---- §C REPEAT CALL: no double-count ----
(function sectionC() {
  armEnv();
  const f = launchCtx({});
  Game.vbrainExecuteDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const first = statsOf(f.ctx).partyDepartures || 0;
  const res2 = Game.vbrainExecuteDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const second = statsOf(f.ctx).partyDepartures || 0;
  check('§C repeat call while already out still returns launch', res2 === 'launch', { res: res2 });
  check('§C repeat call does not bump departures again', first === 1 && second === 1, { first: first, second: second });
  disarmEnv();
})();

// ---- §D BLOCKED INVITER: no launch, no count ----
(function sectionD() {
  armEnv();
  const f = launchCtx({ refuse: ['amina_diallo'] });
  const res = Game.vbrainExecuteDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const after = statsOf(f.ctx).partyDepartures || 0;
  check('§D blocked inviter returns hold', res === 'hold', { res: res });
  check('§D blocked inviter bumps nothing', after === 0, { after: after });
  check('§D blocked inviter plan stays party', f.plan.stage === 'party', { stage: f.plan.stage });
  disarmEnv();
})();

// ---- §E THE OTHER PATH STILL COUNTS (shared ledger) ----
(function sectionE() {
  armEnv();
  const f = launchCtx({});
  const before = statsOf(f.ctx).partyDepartures || 0;
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const after = statsOf(f.ctx).partyDepartures || 0;
  check('§E winPlanDepart launch returns launch', res === 'launch', { res: res });
  check('§E winPlanDepart bumps the same partyDepartures ledger', before === 0 && after === 1, { before: before, after: after });
  disarmEnv();
})();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
