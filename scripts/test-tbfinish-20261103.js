// test-tbfinish-20261103.js — proof test for the TB turn-economy
// instrument + analyzer (arm sim-tbfinish-a).
// Fixture turn classes, a stub known TB fight driven round by round
// (turn open/close, action attribution, NPC brackets, kill linkage,
// ledger), plus a live-harness smoke.
// Usage: node scripts/test-tbfinish-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const A = require(path.join(__dirname, 'tbfinish-analyze-20261103'));
const INST = require(path.join(__dirname, 'tbfinish-instrument-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function mkTurn(over) {
  return Object.assign({
    turnSeq: 1, round: 1, extra: false, actions: [], sayLines: [],
    start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 80, maxHp: 100, stunned: 0, stunFull: false, blindTurns: 0 },
      weapon: { range: 1, name: 'Spear' }, dists: [{ key: 'm_0', mid: 'm4', dist: 1, inRange: true }] },
    end: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 80, maxHp: 100 }, dists: [{ key: 'm_0', mid: 'm4', dist: 1, inRange: true }] },
    closeReason: 'advance',
  }, over);
}
function act(kind, returned) {
  return { fn: 'x', kind: kind, args: [], returned: returned,
    pre: { player: { acted: false } }, post: { player: { acted: true } } };
}

// 1. Turn classification fixtures, every class, mutually exclusive.
ok('turn classes: all nine + move variants', function () {
  const ex = { hits: [], turns: [] };
  const cls = function (t) { return A.classifyTurn(ex, t).cls; };
  assert.strictEqual(cls(mkTurn({ actions: [], start: { player: { mx: 4, my: 4, moveLeft: 0, acted: false, hp: 80, stunned: 0, stunFull: true, blindTurns: 0 }, weapon: { range: 1 }, dists: [] } })), 'stunned-full');
  assert.strictEqual(cls(mkTurn({ actions: [act('strike', true)], turnSeq: 9 })), 'strike-missed');
  assert.strictEqual(cls(mkTurn({ actions: [act('move', true), act('strike', true)], turnSeq: 9 })), 'move-strike-missed');
  assert.strictEqual(cls(mkTurn({ actions: [act('wait', true)] })), 'wait');
  assert.strictEqual(cls(mkTurn({ actions: [act('move', true), act('wait', true)] })), 'move-wait');
  assert.strictEqual(cls(mkTurn({ actions: [act('barrierExit', true)] })), 'flee-attempt');
  assert.strictEqual(cls(mkTurn({ actions: [act('shout', true)] })), 'trick-or-ability');
  assert.strictEqual(cls(mkTurn({ actions: [act('ability', true)] })), 'trick-or-ability');
  assert.strictEqual(cls(mkTurn({ actions: [act('move', true)] })), 'move-only');
  assert.strictEqual(cls(mkTurn({ actions: [act('strike', false)], sayLines: ["The blade can't reach that far. (range 1)"] })), 'failed-strike');
  assert.strictEqual(A.classifyTurn(ex, mkTurn({ actions: [act('strike', false)], sayLines: ["The blade can't reach that far. (range 1)"] })).reason.indexOf("can't reach") >= 0, true);
  assert.strictEqual(cls(mkTurn({ actions: [] })), 'no-action');
  // Strike-landed needs a leader hit stamped with the turn's seq.
  const ex2 = { hits: [{ turnSeq: 5, targetKind: 'monster', sourceClass: 'leader', hpDelta: -50 }], turns: [] };
  assert.strictEqual(A.classifyTurn(ex2, mkTurn({ turnSeq: 5, actions: [act('strike', true)] })).cls, 'strike');
  assert.strictEqual(A.classifyTurn(ex2, mkTurn({ turnSeq: 5, actions: [act('move', true), act('strike', true)] })).cls, 'move-strike');
  // Out-of-range flag: dist 3 vs range 1.
  const oor = mkTurn({ start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 80, stunned: 0, stunFull: false, blindTurns: 0 }, weapon: { range: 1 }, dists: [{ key: 'm_0', mid: 'm4', dist: 3, inRange: false }] } });
  assert.strictEqual(A.classifyTurn(ex, oor).flags.outOfRangeAtStart, true);
  assert.strictEqual(A.classifyTurn(ex, oor).flags.minDistStart, 3);
  // movesSpent reads ACTION pre/post moveLeft, never turn start/end
  // snapshots (start predates tbBeginTurn's reset, end postdates the
  // policy's endTurn zeroing): a strike turn with start ml 3, end ml 0
  // and strike action pre/post ml 1 spends 0 moves, budget 1.
  const strikeTurn = mkTurn({ actions: [{ fn: 'x', kind: 'strike', args: [], returned: true,
    pre: { player: { acted: false, moveLeft: 1 } }, post: { player: { acted: true, moveLeft: 1 } } }],
    start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 80, stunned: 0, stunFull: false, blindTurns: 0 }, weapon: { range: 1 }, dists: [{ key: 'm_0', mid: 'm4', dist: 1, inRange: true }] },
    end: { player: { mx: 4, my: 4, moveLeft: 0, acted: true, hp: 80 }, dists: [{ key: 'm_0', mid: 'm4', dist: 1, inRange: true }] } });
  assert.strictEqual(A.classifyTurn(ex, strikeTurn).flags.movesSpent, 0);
  assert.strictEqual(A.classifyTurn(ex, strikeTurn).flags.movesAvailable, 1);
  const moveTurn = mkTurn({ actions: [{ fn: 'x', kind: 'move', args: [], returned: true,
    pre: { player: { acted: false, moveLeft: 3 } }, post: { player: { acted: false, moveLeft: 1 } } }] });
  assert.strictEqual(A.classifyTurn(ex, moveTurn).flags.movesSpent, 2);
  assert.strictEqual(A.classifyTurn(ex, moveTurn).flags.movesAvailable, 3);
});

// 2. NPC turn classes.
ok('npc turn classes: damage / telegraph / finisher / ally-damage / ally-heal / non-damage', function () {
  const nt = function (kind, hits, pre, post) {
    return { kind: kind, hits: hits, pre: pre || { pos: { mx: 4, my: 4 }, telegraph: false }, post: post || { pos: { mx: 4, my: 4 }, telegraph: false } };
  };
  assert.strictEqual(A.classifyNpcTurn(nt('monster', [{ targetKind: 'player', hpDelta: -20, requested: 20 }])), 'damage');
  assert.strictEqual(A.classifyNpcTurn(nt('monster', [], { pos: { mx: 4, my: 4 }, telegraph: false }, { pos: { mx: 4, my: 4 }, telegraph: true })), 'telegraph');
  assert.strictEqual(A.classifyNpcTurn(nt('monster', [{ targetKind: 'player', hpDelta: -3225, requested: 9999 }])), 'finisher');
  assert.strictEqual(A.classifyNpcTurn(nt('monster', [], { pos: { mx: 4, my: 4 }, telegraph: false }, { pos: { mx: 5, my: 4 }, telegraph: false })), 'move');
  assert.strictEqual(A.classifyNpcTurn(nt('monster', [])), 'non-damage');
  assert.strictEqual(A.classifyNpcTurn(nt('ally', [{ targetKind: 'monster', hpDelta: -7 }])), 'ally-damage');
  assert.strictEqual(A.classifyNpcTurn(nt('ally', [{ targetKind: 'player', hpDelta: 12 }])), 'ally-heal');
});

// 3. Stub known TB fight, driven round by round.
ok('stub TB fight: turn open/close, action attribution, npc brackets, kill linkage, ledger', function () {
  const p = { key: 'p', kind: 'player', villagerId: 'v_s', alive: true, hp: 80, maxHp: 100, mx: 4, my: 4, moveLeft: 3, acted: false, stunned: 0, stunFull: false, blindTurns: 0, speed: 3 };
  const m0 = { key: 'm_0', kind: 'monster', mdef: { id: 'm4' }, alive: true, hp: 1000, maxHp: 1000, mx: 4, my: 7, telegraph: null };
  const a0 = { key: 'a_0', kind: 'villager', villagerId: 'v_x', alive: true, hp: 60, maxHp: 60, mx: 3, my: 4, moveLeft: 3, acted: false };
  const fighters = [p, m0];
  let cur = null;
  const stub = {
    state: { scholar: { day: 5, monster: null, health: 80, energy: 70, inventory: [] }, village: { roster: ['v_s', 'v_x'] }, waveKillLog: [] },
    data: { monsters: [{ id: 'm4', wave: 4 }], items: [], villagers: [{ id: 'v_x' }] },
    villagerId: 'v_s', pendingMonsterId: null, tbfight: null,
    armorBonus: function () { return 20; },
    equippedWeapon: function () { return { unarmed: false, name: 'Spear', range: 1 }; },
    fighterDistTo: function (m, px, py) { return Math.max(Math.abs(m.mx - px), Math.abs(m.my - py)); },
    tbGridSize: function () { return 9; },
    vpOf: function (vid) { return vid === 'v_x' ? { id: 'v_x', dead: false, items: [] } : {}; },
    monsterCounterKnown: function () { return false; },
    tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
    tbCurrent: function () { return cur; },
    spawnWorldMonster: function () { return { id: 'm4', wave: 4 }; },
    startCombat: function () {
      this.tbfight = { id: 'f1', round: 1, fighters: fighters, over: false };
      return null;
    },
    tbBeginTurn: function () { return null; },
    tbAdvance: function () { return null; },
    tbPlayerMove: function (dx, dy) {
      const cost = Math.max(Math.abs(dx - p.mx), Math.abs(dy - p.my));
      p.mx = dx; p.my = dy; p.moveLeft -= cost; return true;
    },
    tbPlayerStrike: function (key) {
      const tgt = this.tbFighter(key);
      const d = Math.max(Math.abs(tgt.mx - p.mx), Math.abs(tgt.my - p.my));
      if (d > 1) { this.say("The blade can't reach that far. (range 1)"); return false; }
      p.acted = true;
      this.tbDamage(key, 100, 'you', 'p', {});
      return true;
    },
    tbPlayerWait: function () { p.acted = true; p.moveLeft = 0; this.say('You hold still, watching.'); this.tbAdvance(); return true; },
    tbPlayerStudy: function () { p.acted = true; return true; },
    tbPlayerShout: function () { p.acted = true; return true; },
    tbPlayerOfferFood: function () { p.acted = true; return true; },
    tbPlayerTalk: function () { p.acted = true; return true; },
    tbPlayerRally: function () { p.acted = true; return true; },
    tbPlayerWarCry: function () { p.acted = true; return true; },
    tbPlayerFlip: function () { return false; },
    tbPlayerEndTurn: function () { this.tbAdvance(); return null; },
    tbBarrierExit: function () { return true; },
    tbMonsterTurn: function (m) { this.tbDamage('p', 20, 'paw', 'm_0', {}); return null; },
    tbVillagerTurn: function (v) { this.tbDamage('m_0', 15, 'ally strike', 'a_0', {}); return null; },
    tbEnd: function () {
      this.recordWaveKill('m4', 'v_s', 'player', null);
      this.tbfight = null; return null;
    },
    fieldFight: function () { return { outcome: 'vDie' }; },
    tbDamage: function (targetKey, dmg) {
      const t = this.tbFighter(targetKey);
      if (!t || !t.alive) return 0;
      const applied = (t.kind === 'monster') ? Math.floor(dmg / 2) : dmg;
      t.hp = Math.max(0, t.hp - applied);
      if (t.hp <= 0) t.alive = false;
      return applied;
    },
    say: function () { return null; },
    sysSay: function () { return null; },
    useAbility: function (id) { this.tbDamage('m_0', 40, id, null, {}); return true; },
    recordWaveKill: function (mid, by) { this.state.waveKillLog.push({ d: 5, mid: mid, w: 4, by: by, via: 'player' }); return null; },
    recordPyrrhicKill: function () { return null; },
  };
  const inst = INST.install(stub);
  const t = inst.t;
  assert.strictEqual(t.instrumentErrors.length, 0, 'clean install: ' + JSON.stringify(t.instrumentErrors));
  stub.spawnWorldMonster({ id: 'm4' }, 1, 2, {});
  stub.startCombat('m4');
  assert.strictEqual(t.exposures.length, 1, 'TB exposure created at start');
  const e = t.exposures[0];
  assert.strictEqual(e.partySizeStart, 1);
  assert.strictEqual(e.trickKnown, false);
  // Round 1: out of range (dist 3, range 1) -> move -> strike.
  cur = p;
  stub.tbBeginTurn();
  assert.strictEqual(e.turns.length, 1, 'turn opened at tbBeginTurn');
  const turn1 = e.turns[0];
  assert.strictEqual(turn1.start.dists[0].dist, 3);
  assert.strictEqual(turn1.start.player.moveLeft, 3);
  stub.tbPlayerMove(4, 6);
  stub.tbPlayerStrike('m_0');
  stub.tbAdvance();
  assert.strictEqual(turn1.closeReason, 'advance');
  assert.strictEqual(turn1.end.player.mx, 4);
  assert.strictEqual(turn1.end.player.my, 6);
  assert.strictEqual(turn1.end.player.moveLeft, 1);
  assert.strictEqual(turn1.end.dists[0].dist, 1);
  const s1 = A.summarize(e);
  assert.strictEqual(s1.turns[0].cls, 'move-strike');
  assert.strictEqual(s1.turns[0].flags.movesSpent, 2);
  assert.strictEqual(s1.turns[0].flags.strikesLanded, 1);
  assert.strictEqual(s1.turns[0].flags.dealt, 50);
  assert.strictEqual(s1.turns[0].flags.outOfRangeAtStart, true);
  // Monster turn between rounds: damage class, hit stamped npc-turn.
  stub.tbMonsterTurn(m0);
  assert.strictEqual(e.npcTurns.length, 1);
  assert.strictEqual(A.classifyNpcTurn(e.npcTurns[0]), 'damage');
  assert.strictEqual(e.hits[e.hits.length - 1].phase, 'npc-turn');
  assert.strictEqual(e.hits[e.hits.length - 1].actorKey, 'm_0');
  assert.strictEqual(p.hp, 60, 'monster hit landed on player');
  // Round 2: wait (auto-advances, closes its own turn).
  stub.tbfight.round = 2;
  p.moveLeft = 3; p.acted = false;
  stub.tbBeginTurn();
  const turn2 = e.turns[1];
  assert.strictEqual(turn2.start.player.hp, 60);
  stub.tbPlayerWait();
  assert.strictEqual(turn2.closeReason, 'advance');
  assert.strictEqual(A.summarize(e).turns[1].cls, 'wait');
  // Round 3: failed strike out of range (monster moved far).
  stub.tbfight.round = 3;
  m0.mx = 4; m0.my = 1; p.moveLeft = 3; p.acted = false;
  stub.tbBeginTurn();
  const r3 = stub.tbPlayerStrike('m_0');
  assert.strictEqual(r3, false);
  stub.tbAdvance();
  const s3 = A.summarize(e).turns[2];
  assert.strictEqual(s3.cls, 'failed-strike');
  assert.ok(s3.reason && s3.reason.indexOf("can't reach") >= 0, 'failure reason captured: ' + s3.reason);
  // Round 4: stunned-full turn (no actions, closed by advance).
  stub.tbfight.round = 4;
  p.stunFull = true; p.moveLeft = 3; p.acted = false;
  stub.tbBeginTurn();
  stub.tbAdvance();
  assert.strictEqual(A.summarize(e).turns[3].cls, 'stunned-full');
  p.stunFull = false;
  // Round 5: flee attempt via barrier exit.
  stub.tbfight.round = 5;
  p.moveLeft = 3; p.acted = false;
  stub.tbBeginTurn();
  stub.tbBarrierExit(1, 0);
  stub.tbAdvance();
  assert.strictEqual(A.summarize(e).turns[4].cls, 'flee-attempt');
  // Round 6: ability press (ability-or-trick class, hit stamped ability-or-trick).
  stub.tbfight.round = 6;
  m0.mx = 4; m0.my = 6; p.mx = 4; p.my = 6; p.moveLeft = 3; p.acted = false;
  // (p and m share a tile in this stub; distance 0 — the stub strike path
  // does not enforce occupancy, only range, so this stays a valid fixture.)
  stub.tbBeginTurn();
  stub.useAbility('bird_strike');
  stub.tbAdvance();
  const s6 = A.summarize(e).turns[5];
  assert.strictEqual(s6.cls, 'trick-or-ability');
  const abHit = e.hits.find(function (h) { return h.sourceClass === 'ability-or-trick'; });
  assert.ok(abHit, 'ability hit classified ability-or-trick');
  // Ally turn bracket: ally damage class.
  fighters.push(a0);
  stub.tbVillagerTurn(a0);
  assert.strictEqual(A.classifyNpcTurn(e.npcTurns[e.npcTurns.length - 1]), 'ally-damage');
  // Round 7: strike, then fight ends won with a linked kill.
  stub.tbfight.round = 7;
  p.moveLeft = 3; p.acted = false;
  stub.tbBeginTurn();
  stub.tbPlayerStrike('m_0');
  const turn7 = e.turns[6];
  stub.tbEnd('won');
  assert.strictEqual(turn7.closeReason, 'fight-end');
  assert.strictEqual(e.kills.length, 1, 'TB kill linked by open fight');
  assert.strictEqual(e.kills[0].linkHow, 'tb-open');
  assert.strictEqual(A.classify(e), 'kill');
  const led = A.ledgerFor(e);
  assert.strictEqual(led.length, 1);
  assert.strictEqual(led[0].gap, 0, 'ledger reconciles: dealt ' + led[0].dealt + ' endHp ' + led[0].endHp);
  assert.strictEqual(A.summarize(e).ledgerOpen, false);
  // A kill with no open fight is unlinked, never force-joined.
  stub.recordWaveKill('m4', 'v_x', 'contest', null);
  assert.strictEqual(t.unlinkedKills.length, 1, 'stray kill reported unlinked');
  assert.strictEqual(t.orphanTbEnds.length, 0);
  assert.strictEqual(t.instrumentErrors.length, 0);
  assert.ok(t.wrapCounts.tbBeginTurn >= 7 && t.wrapCounts.tbAdvance >= 6, 'turn wraps fired (7 begins, 6 advances: wait auto-advances inside its own call)');
  inst.uninstall();
});

// 4. Live harness smoke: install on the real game, wraps chain, clean uninstall.
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'tbfinish-proof', fullTelemetry: false });
  await setupGame(Game);
  const pre = { tbBeginTurn: Game.tbBeginTurn, tbAdvance: Game.tbAdvance,
    tbPlayerStrike: Game.tbPlayerStrike, tbPlayerMove: Game.tbPlayerMove,
    tbPlayerWait: Game.tbPlayerWait, tbMonsterTurn: Game.tbMonsterTurn,
    tbVillagerTurn: Game.tbVillagerTurn, tbDamage: Game.tbDamage };
  const inst = INST.install(Game);
  try {
    assert.strictEqual(typeof Game.tbBeginTurn, 'function');
    assert.strictEqual(typeof Game.tbAdvance, 'function');
    assert.strictEqual(typeof Game.tbPlayerStrike, 'function');
    assert.strictEqual(typeof Game.tbPlayerMove, 'function');
    assert.strictEqual(typeof Game.tbPlayerWait, 'function');
    assert.strictEqual(typeof Game.tbMonsterTurn, 'function');
    assert.strictEqual(typeof Game.tbVillagerTurn, 'function');
    assert.notStrictEqual(Game.tbBeginTurn, pre.tbBeginTurn, 'tbBeginTurn wrapped');
    assert.notStrictEqual(Game.tbAdvance, pre.tbAdvance, 'tbAdvance wrapped');
    assert.notStrictEqual(Game.tbMonsterTurn, pre.tbMonsterTurn, 'tbMonsterTurn wrapped');
    // Calling tbBeginTurn with no fight must not throw (no current fight).
    Game.tbBeginTurn();
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors on live install: ' + JSON.stringify(inst.t.instrumentErrors));
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: turn wraps installed + chained + clean');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  assert.strictEqual(Game.tbBeginTurn, pre.tbBeginTurn, 'tbBeginTurn restored on uninstall');
  assert.strictEqual(Game.tbAdvance, pre.tbAdvance, 'tbAdvance restored on uninstall');
  console.log('TBFINISH-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('TBFINISH-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
