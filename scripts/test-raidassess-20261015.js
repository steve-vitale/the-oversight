#!/usr/bin/env node
// scripts/test-raidassess-20261015.js — proof tests for the raid-pack
// assessment lever (scripts/policies/raidassess.js, gate RAIDASSESS=1,
// default OFF; scale-onramp, sim-findings #344).
//
// THE DESIGN (pre-registered, evidence/2026-10-15/sim-raidassess.md): the
// modal bearer combat death on national-holding runs is w1 x haven x
// turn-based — a raider (modal: Highbeam Deer) reaches the sleeping scholar
// through the raid's pendingEncounter and the base policy STANDS THE WALL
// (on this substrate the base never barrier-pushes: COMPETENT_FIGHT_ASSESS /
// COMPETENT_DIRECTIONAL_FLEE / COMPETENT_DPS_RACE are all off, and the legacy
// outmatched block doesn't fire at full HP vs a 160-HP deer). Force is
// falsified (besiegeanswer: 27 answers bought 19 feeds). The honest lever
// space is AVOIDANCE: no deliberate engagement of a lost raid fight —
// withdraw off the haven node through the real tbBarrierExit path (a BUILD,
// the palisade, is the only "withdraw inside"; there is no hide-in-the-hall
// verb, and the layer refuses that fiction).
//
// Assessment (at fight start, turn 1 only):
// - RAID: open raid-raised aid crisis (crisis.raiders set ONLY by
//   havenRaidTick) + scholar on the haven node + live monster opponents ->
//   DPR race via fightAssessRace (counter-known discount included). Decline
//   (lost race or dead-in-two) -> disengage (walk to edge, barrier push,
//   dawn return). Race won/parity -> existing behavior.
// - ALIEN-PLAYER: live opponents with alienPid (kind 'hostile' — the base is
//   blind to them) -> pessimistic DPR prior; disengage on lost race.
// - Everything else: existing behavior, byte-identical.
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> withRaidAssess returns the base itself (identity).
//   R2 (REAL RED): gate ON + lost DPR race but NO raid crisis (the blank,
//       unblocked) -> NO assessment, NO disengage; base.fight runs.
// GREEN:
//   G1: raid crisis at haven + lost-race monster -> disengage (raDeclined,
//       raPushes, say line, one grid step, turn spent, push state armed).
//   G2: raid crisis at haven + won-race monster -> base.fight (raFought),
//       no push.
//   G3: alien-player duel, lost race -> disengage.
//   G4: push continuation -> edge reached -> barrier exit -> off-haven,
//       fight ended, push cleared, raDisengaged, markRecover armed.
//   G5: dawn return after disengage -> walks home at dayPart 0 (raReturned);
//       no walk at night.
//   G6: raid crisis + NO live monsters -> base.fight, no assessment.
//   G7: sealed fight (tbBarrierExit consumed without moving) -> push
//       cleared honestly, raPushBlocked counted, base fights next turn.
//
// SMOKE=1: instrument-honesty subset (R1 + R2 + G2) only.
'use strict';
let W = null;
try { W = require('./policies/raidassess'); } catch (e) { /* deleted per kill protocol */ }
if (!W) {
  console.log('INFO-SKIP: raidassess layer deleted per kill protocol; see evidence/2026-10-15/sim-raidassess.md');
  process.exit(0);
}
const assert = require('assert');
const { withRaidAssess } = W;

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok - ' + name); }
  catch (e) { fail++; console.log('  FAIL - ' + name + ' :: ' + e.message); }
}

const MONSTER_DEFS = [
  { id: 'gallowdeer', name: 'Highbeam Deer', wave: 1, attack: { damage: [40, 60] } },
  { id: 'midge', name: 'Midge', wave: 1, attack: { damage: [1, 2] } },
];

function mockBase() {
  const calls = [];
  return {
    id: 'base', calls,
    fight(G, c) { calls.push('fight'); return 'base-fight'; },
    daily(G, c) { calls.push('daily'); },
    upkeep(G, c) { calls.push('upkeep'); },
  };
}

function mockGame(opts) {
  opts = opts || {};
  const calls = [];
  const crisis = opts.crisis === undefined
    ? { raiders: true, resolved: false, name: 'raid' }
    : opts.crisis;
  const fighters = opts.fighters || [
    { key: 'p', kind: 'player', hp: 100, maxHp: 100, mx: 7, my: 4, moveLeft: 3, acted: false, alive: true },
    { key: 'm_0', kind: 'monster', hp: 160, maxHp: 160, monsterId: 'gallowdeer', alive: true },
  ];
  const G = {
    calls,
    state: {
      scholar: { day: 10, health: 100, kcal: 1800 },
      village: { px: 4, py: 4 },
      codex: { monsters: {} },
    },
    villagerId: 'v2',
    map: { px: 4, py: 4 },
    dayPart: 0,
    over: false,
    tbfight: opts.noFight ? null : { over: false, fighters },
    data: { monsters: MONSTER_DEFS },
    aidCrisis() { return crisis; },
    tbIsPlayerTurn() { return true; },
    tbFighter(k) { return fighters.find(f => f.key === k) || null; },
    tbGridMax() { return 8; },
    tbPlayerMove(x, y) {
      calls.push(['move', x, y]);
      const p = this.tbFighter('p');
      p.mx = x; p.my = y;
      p.moveLeft = Math.max(0, (p.moveLeft || 1) - 1);
      return true;
    },
    tbBarrierExit(dx, dy) {
      calls.push(['barrier', dx, dy]);
      if (opts.sealed) return true; // consumed, no movement (sealed fight)
      this.map.px += dx; this.map.py += dy;
      this.tbfight.over = true; this.tbfight.result = 'fled';
      return true;
    },
    tbAfterPlayerAction() { calls.push(['afterAction']); },
    say(s) { calls.push(['say', String(s).slice(0, 60)]); },
    tileAt(x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen() { return true; },
    monsterAt() { return false; },
    travelTargets() {
      const out = [];
      const { px, py } = this.map;
      for (const dd of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = px + dd[0], ny = py + dd[1];
        if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 8) out.push({ x: nx, y: ny });
      }
      return out;
    },
    travelTo(x, y) { this.map.px = x; this.map.py = y; return true; },
  };
  return G;
}

function withGate(on) {
  if (on) process.env.RAIDASSESS = '1';
  else delete process.env.RAIDASSESS;
}

const SMOKE = process.env.SMOKE === '1';

// R1 (RED): gate OFF -> identity.
t('R1 gate OFF returns the base itself', () => {
  withGate(false);
  const base = mockBase();
  assert.strictEqual(withRaidAssess(base), base, 'gate-off must return the identical base policy');
});

// R2 (REAL RED): gate ON, lost race, but NO raid crisis -> no assessment.
t('R2 gate ON, no crisis -> no assessment, base fights', () => {
  withGate(true);
  const base = mockBase();
  const wrapped = withRaidAssess(base);
  assert.notStrictEqual(wrapped, base);
  const G = mockGame({ crisis: null }); // no aid crisis at all
  const ctx = {};
  const r = wrapped.fight(G, ctx);
  assert.strictEqual(r, 'base-fight', 'must delegate to base');
  assert.deepStrictEqual(base.calls, ['fight'], 'base.fight called once');
  assert.strictEqual(ctx.raAssessed, undefined, 'no assessment without a raid crisis');
  assert.strictEqual(ctx._raPush, undefined, 'no push armed');
});

if (!SMOKE) {
  // G1: raid crisis at haven + lost-race monster -> disengage starts.
  t('G1 lost race at haven raid -> disengage (push armed, step taken)', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame(); // gallowdeer 160hp, unknown -> pessimistic prior 20 -> decline
    const ctx = {};
    const r = wrapped.fight(G, ctx);
    assert.strictEqual(r, true, 'disengage handles the turn');
    assert.strictEqual(ctx.raAssessed, 1);
    assert.strictEqual(ctx.raDeclined, 1);
    assert.strictEqual(ctx.raPushes, 1);
    assert.ok(ctx._raPush, 'push state armed');
    assert.strictEqual(ctx._raPush.why, 'raid');
    assert.ok(ctx.raPushDetail && typeof ctx.raPushDetail.score === 'number');
    const says = G.calls.filter(c => c[0] === 'say');
    assert.ok(says.length >= 1, 'disengage narration fired');
    assert.ok(says[0][1].indexOf('Teeth at the door') !== -1, 'the honest line, not a fiction');
    const moves = G.calls.filter(c => c[0] === 'move');
    assert.strictEqual(moves.length, 1, 'exactly one grid step this turn');
    assert.ok(G.calls.some(c => c[0] === 'afterAction'), 'turn spent');
    assert.deepStrictEqual(base.calls, [], 'base.fight NOT called on a declined raid');
    const d = ctx.raFirstDetail;
    assert.ok(d && d.lostRace === true, 'race detail recorded, lostRace true, got ' + JSON.stringify(d && { lostRace: d.lostRace, deadInTwo: d.deadInTwo }));
  });

  // G3: alien-player duel, lost race -> disengage.
  t('G3 alien-player duel, lost race -> disengage', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame({
      fighters: [
        { key: 'p', kind: 'player', hp: 100, maxHp: 100, mx: 7, my: 4, moveLeft: 3, acted: false, alive: true },
        { key: 'a_0', id: 'a_0', kind: 'hostile', alienPid: 'xp1', hp: 60, maxHp: 60, alive: true },
      ],
    });
    const ctx = {};
    const r = wrapped.fight(G, ctx);
    assert.strictEqual(r, true);
    assert.strictEqual(ctx.raAlienAssessed, 1);
    assert.strictEqual(ctx.raAlienDeclined, 1);
    assert.ok(ctx._raPush && ctx._raPush.why === 'alien', 'alien disengage armed');
    assert.deepStrictEqual(base.calls, [], 'base NOT called on declined alien duel');
  });

  // G4: push continuation -> edge -> barrier exit -> off-haven, cleared.
  t('G4 push reaches edge -> barrier exit moves off-haven, push cleared', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame();
    const p = G.tbFighter('p');
    p.mx = 0; p.my = 4; // already on the west edge
    const ctx = { _raPush: { dx: -1, dy: 0, why: 'raid' }, _raFightObj: G.tbfight };
    const r = wrapped.fight(G, ctx);
    assert.strictEqual(r, true);
    assert.deepStrictEqual([G.map.px, G.map.py], [3, 4], 'moved one node west');
    assert.strictEqual(G.tbfight.over, true, 'fight ended via the exit');
    assert.strictEqual(ctx._raPush, null, 'push cleared after a real exit');
    assert.strictEqual(ctx.raDisengaged, 1);
    assert.ok(ctx._raDisengaged && ctx._raDisengaged.why === 'raid');
    assert.strictEqual(ctx._recoverUntilDay, 12, 'markRecover armed a 2-day recovery window');
    assert.deepStrictEqual(base.calls, [], 'base NOT called mid-push');
  });

  // G5: dawn return walks home at dayPart 0; not at night.
  t('G5 dawn return walks home at dayPart 0 only', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame({ noFight: true });
    G.map.px = 3; G.map.py = 4;
    G.dayPart = 0;
    const ctx = { _raDisengaged: { day: 10, why: 'raid' } };
    wrapped.daily(G, ctx);
    assert.deepStrictEqual([G.map.px, G.map.py], [4, 4], 'walked home at dawn');
    assert.strictEqual(ctx.raReturnWalks, 1, 'return walk counted');
    wrapped.daily(G, ctx); // now home: clears the disengage marker
    assert.strictEqual(ctx._raDisengaged, null, 'disengage marker cleared once home');
    assert.strictEqual(ctx.raReturned, 1);
    assert.deepStrictEqual(base.calls, ['daily', 'daily'], 'base.daily still runs');
    // night: no walk
    const G2 = mockGame({ noFight: true });
    G2.map.px = 3; G2.map.py = 4;
    G2.dayPart = 2;
    const ctx2 = { _raDisengaged: { day: 10, why: 'raid' } };
    const base2 = mockBase();
    withRaidAssess(base2).daily(G2, ctx2);
    assert.deepStrictEqual([G2.map.px, G2.map.py], [3, 4], 'no walking home into the dark');
    assert.strictEqual(ctx2.raReturned, undefined);
  });

  // G6: raid crisis + no live monsters -> base.fight, no assessment.
  t('G6 crisis but no live monsters -> no assessment', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame({
      fighters: [
        { key: 'p', kind: 'player', hp: 100, maxHp: 100, mx: 7, my: 4, moveLeft: 3, acted: false, alive: true },
      ],
    });
    const ctx = {};
    const r = wrapped.fight(G, ctx);
    assert.strictEqual(r, 'base-fight');
    assert.strictEqual(ctx.raAssessed, undefined);
  });

  // G7: sealed fight — push consumed without moving -> honest failure path.
  t('G7 sealed barrier -> push cleared, raPushBlocked, base fights next turn', () => {
    withGate(true);
    const base = mockBase();
    const wrapped = withRaidAssess(base);
    const G = mockGame({ sealed: true });
    const p = G.tbFighter('p');
    p.mx = 0; p.my = 4;
    const ctx = { _raPush: { dx: -1, dy: 0, why: 'raid' }, _raFightObj: G.tbfight };
    const r = wrapped.fight(G, ctx);
    assert.strictEqual(r, true, 'turn spent on the failed push');
    assert.strictEqual(ctx._raPush, null, 'push cleared, not retried forever');
    assert.strictEqual(ctx.raPushBlocked, 1, 'blocked push counted honestly');
    assert.deepStrictEqual([G.map.px, G.map.py], [4, 4], 'did NOT move — no fiction');
    assert.strictEqual(G.tbfight.over, false, 'fight continues');
    // next turn: no push, same fight -> delegates to base (fights it out)
    const r2 = wrapped.fight(G, ctx);
    assert.strictEqual(r2, 'base-fight');
    assert.deepStrictEqual(base.calls, ['fight']);
  });
}

// G2: won race -> base fights (also in SMOKE).
t('G2 won race at haven raid -> base fights, no push', () => {
  withGate(true);
  const base = mockBase();
  const wrapped = withRaidAssess(base);
  const G = mockGame({
    fighters: [
      { key: 'p', kind: 'player', hp: 100, maxHp: 100, mx: 7, my: 4, moveLeft: 3, acted: false, alive: true },
      { key: 'm_0', kind: 'monster', hp: 1, maxHp: 1, monsterId: 'midge', alive: true },
    ],
  });
  const ctx = {};
  const r = wrapped.fight(G, ctx);
  assert.strictEqual(r, 'base-fight', 'parity/won race -> existing behavior');
  assert.strictEqual(ctx.raFought, 1);
  assert.strictEqual(ctx._raPush, undefined, 'no push armed');
  assert.strictEqual(ctx.raDeclined, undefined);
});

withGate(false);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
