// test-triodrought-b.js — proof test, arm sim-triodrought-b (finding #2518).
// Proves, on synthetic fixtures through the REAL dawn chain (no hand-built
// commit): the dawn candidate's second companion survives scoring ->
// writeCommit -> stored commit -> vbrainExecuteDepart, and the launch goes
// out as a trio. This is the chain test-vetreengage-a.js §5d never ran:
// it hand-built the commit literal ({companion2: 'v3'}) and called execute
// directly, so the writeCommit drop that caused the trio drought (0/17
// wave-4 launches on the launchparty band) was invisible to it.
// The bug, plainly: writeCommit copied `companion` into the stored commit
// but never copied `companion2`/`companion3`, so every brain-path trio
// launch degraded to a pair at dawn. The fix restores the carry (the lines
// the producergate revert 72a6efc99 removed).
// Usage: node scripts/test-triodrought-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §0 static: the serializer carries companion2 + companion3 ----
const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
(function section0() {
  check('§0 writeCommit carries companion2', /companion2:\s*chosen\.companion2\s*\|\|\s*null/.test(brainSrc));
  check('§0 writeCommit carries companion3', /companion3:\s*chosen\.companion3\s*\|\|\s*null/.test(brainSrc));
})();

// ---- load the game modules (same pattern as test-vetreengage-a.js) ----
process.env.VETREENGAGE = '1';
globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};
require(path.join(REPO, 'src', 'js', 'win-plan.js'));
require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

function makePeople(spec) {
  const people = {};
  Object.keys(spec).forEach(function (vid) {
    const s = spec[vid];
    people[vid] = { id: vid, name: vid, dead: !!s.dead, _armorP: s.armorP || 0, _weaponB: s.weaponB || 0,
      items: s.items || [], node: s.node || null };
  });
  return people;
}
function makeCtx(opts) {
  const o = opts || {};
  const people = o.people || {};
  const exped = o.exped || {};
  const profiles = o.profiles || {};
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }] },
    state: {
      scholar: { day: o.day || 60 },
      _standingDeferBeat: o.beat || {},
      village: {
        px: 5, py: 5,
        roster: o.roster || Object.keys(people),
        trust: o.trust || {},
        away: o.away || {},
        sick: o.sick || {},
        health: o.health || {},
        winPlan: o.winPlan || {},
        vbrain: o.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } },
      },
      waveKillLog: o.waveKillLog || [],
    },
    dayPart: 0,
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function (vid) { return profiles[vid] || 'settler'; },
    isEngaged: function () { return false; },
    npcMaxDist: function () { return 3; },
    agencyState: function () { return { exped: exped, know: {} }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function (mid) { return (o.tricks || {})[mid] === true; },
    villagerFightAllies: function (vid) { return (o.allies || {})[vid] || []; },
    winPlanSeedFromFight: function () { return null; },
  };
  ctx._exped = exped;
  // winPlanCands looks the second-companion pick up on `self` (in live
  // play self IS the Game object). The fake ctx must carry the real
  // method, called with this === ctx, as in live play.
  ctx.winPlanSecondCompanion = Game.winPlanSecondCompanion;
  ctx.vbrainCommit = function (vid) {
    try { var c = ctx.state.village.vbrain.commit; return (c && c[vid]) || null; } catch (e) { return null; }
  };
  ctx.winPlanOf = function (vid) {
    var v = ctx.state.village;
    if (!v.winPlan[vid]) v.winPlan[vid] = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    return v.winPlan[vid];
  };
  ctx.startExpedition = function (vid, hx, hy, announce, opts) {
    if ((o.block || {})[vid]) return; // blocked: no expedition starts
    exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
  };
  return ctx;
}
function trioFixture(opts) {
  const o = opts || {};
  const people = makePeople({
    v1: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    scholar1: { node: [5, 5] },
  });
  const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
  const plan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  const plan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  const ctx = makeCtx({ people: people,
    profiles: { v2: 'wanderer', v3: 'settler' },
    trust: { v2: 20, v3: 20 },
    waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
    winPlan: { v1: plan1, v2: plan2, v3: plan3 },
    away: o.away || {}, block: o.block || {},
  });
  return { ctx: ctx, plan1: plan1, exped: ctx._exped };
}

// ---- §1 full chain: candidate c2 survives scoring -> commit -> trio launch ----
(function section1() {
  process.env.VETREENGAGE = '1';
  const f = trioFixture({});
  const cands = Game.vbrainFeedExtras.call(f.ctx, 'v1', [], 5, 5);
  const launch = cands.filter(function (c) { return c && c.winPlanAction === 'party_launch'; })[0];
  check('§1 dawn candidate carries a second companion', !!(launch && launch.companion2 === 'v3'),
    JSON.stringify(launch && { companion: launch.companion, companion2: launch.companion2 }));
  Game.vbrainScorePick.call(f.ctx, 'v1', cands, { dawn: true, rng: function () { return 0; } });
  const commit = Game.vbrainCommit.call(f.ctx, 'v1');
  check('§1 stored dawn commit carries the second companion', !!(commit && commit.companion2 === 'v3'),
    JSON.stringify(commit));
  const r = Game.vbrainExecuteDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§1 execute launches holder + both companions on one target',
    r === 'launch' && !!f.exped.v1 && !!f.exped.v2 && !!f.exped.v3 &&
    f.exped.v1.tx === f.exped.v2.tx && f.exped.v2.tx === f.exped.v3.tx &&
    f.plan1.party.length === 2 && f.plan1.party.indexOf('v2') !== -1 && f.plan1.party.indexOf('v3') !== -1,
    JSON.stringify({ r: r, exped: Object.keys(f.exped), party: f.plan1.party }));
})();

// ---- §2 off-mode: flag unset -> no pick, no carry, pair launch ----
(function section2() {
  delete process.env.VETREENGAGE;
  const f = trioFixture({});
  const cands = Game.vbrainFeedExtras.call(f.ctx, 'v1', [], 5, 5);
  const launch = cands.filter(function (c) { return c && c.winPlanAction === 'party_launch'; })[0];
  check('§2 off-mode: dawn candidate carries no second companion', !!(launch && !launch.companion2),
    JSON.stringify(launch && { companion: launch.companion, companion2: launch.companion2 }));
  Game.vbrainScorePick.call(f.ctx, 'v1', cands, { dawn: true, rng: function () { return 0; } });
  const commit = Game.vbrainCommit.call(f.ctx, 'v1');
  check('§2 off-mode: stored commit carries no second companion', !!(commit && !commit.companion2),
    JSON.stringify(commit));
  const r = Game.vbrainExecuteDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§2 off-mode: execute launches a pair only',
    r === 'launch' && !!f.exped.v1 && !!f.exped.v2 && !f.exped.v3 && f.plan1.party.length === 1,
    JSON.stringify({ r: r, exped: Object.keys(f.exped), party: f.plan1.party }));
  process.env.VETREENGAGE = '1';
})();

// ---- §3 no second companion eligible -> candidate c2 null -> pair launch ----
(function section3() {
  process.env.VETREENGAGE = '1';
  const f = trioFixture({ away: { v3: true } });
  const cands = Game.vbrainFeedExtras.call(f.ctx, 'v1', [], 5, 5);
  const launch = cands.filter(function (c) { return c && c.winPlanAction === 'party_launch'; })[0];
  check('§3 no eligible second companion: dawn candidate carries none', !!(launch && !launch.companion2),
    JSON.stringify(launch && { companion: launch.companion, companion2: launch.companion2 }));
  Game.vbrainScorePick.call(f.ctx, 'v1', cands, { dawn: true, rng: function () { return 0; } });
  const commit = Game.vbrainCommit.call(f.ctx, 'v1');
  check('§3 no eligible second companion: stored commit carries none', !!(commit && !commit.companion2),
    JSON.stringify(commit));
  const r = Game.vbrainExecuteDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§3 no eligible second companion: execute launches a pair only',
    r === 'launch' && !!f.exped.v1 && !!f.exped.v2 && !f.exped.v3 && f.plan1.party.length === 1,
    JSON.stringify({ r: r, exped: Object.keys(f.exped), party: f.plan1.party }));
})();

// ---- §4 serializer: a candidate carrying companion3 stores it too ----
(function section4() {
  process.env.VETREENGAGE = '1';
  const f = trioFixture({});
  const cand = { kind: 'EXPEDITION', w: 5.0, companion: 'v2', companion2: 'v3', companion3: 'v9',
    vbrainSrc: 'win_plan', winPlanAction: 'party_launch' };
  Game.vbrainScorePick.call(f.ctx, 'v1', [cand], { dawn: true, rng: function () { return 0; } });
  const commit = Game.vbrainCommit.call(f.ctx, 'v1');
  check('§4 serializer stores companion2 and companion3 from the candidate',
    !!(commit && commit.companion2 === 'v3' && commit.companion3 === 'v9'),
    JSON.stringify(commit));
})();

console.log('test-triodrought-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
