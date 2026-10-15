#!/usr/bin/env node
// scripts/test-besiegeanswer-20261015.js — proof tests for the answer-the-
// besieger lever (scripts/policies/besiegeanswer.js, gate BESIEGEANSWER=1,
// default OFF; scale-onramp, sim-findings #270).
//
// THE DESIGN (pre-registered, evidence/2026-10-15/sim-besiegeanswer.md): on a
// Haven scholar combat death, tile-identify the besieger from tile-stamped
// telemetry; wave ≤3 besiegers with a passing readiness gate (HP≥60% AND
// (counter learned OR ≥1 villager joins)) get a deliberate drive-off fight
// (party + triggerEncounter + committed fight hook: counter verbs first, no
// early flee, 25% HP honest floor); wave ≥4 besiegers are NEVER engaged.
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> withBesiegeAnswer returns the base itself; daily/
//       upkeep/fight delegate identically; NO tracking state written.
//   R2 (REAL RED): gate OFF + Haven combat death -> NO answer (the blank,
//       unblocked): no drive-off line, no triggerEncounter, no invites.
// GREEN:
//   G1: Haven combat death, w2 besieger identified, HP≥60%, villager joins
//       -> answer: drive-off line once (names dead+living+besieger),
//       triggerEncounter(mid), party invite attempted, ctx._baAnswer armed.
//   G2: wave-4 besieger -> NO engagement (declined silently, counted).
//   G3: HP<60% -> held (no answer).
//   G4: no villager joins + counter unknown -> held (no answer).
//   G5: counter known + no villagers -> answer (the trick answers it).
//   G6: wild combat death -> no answer.
//   G7: unattributed death (no tile) -> fail safe, no answer.
//   G8: no combat_start pairing -> unattributed besieger -> no answer.
//   G9: table active -> held (no answer).
//   G10: mid-combat at scan -> held (never clobbers a live fight).
//   G11: fight() — answer fight, besieger live, HP≥25%: counter verb fired
//       when known (returns true, base NOT called); else returns false
//       (harness default strikes — committed, no flee path). HP<25% ->
//       delegates to base. Besieger gone -> disarms, delegates.
//   G12 (det-gate): gate-off 3-day scripted run — identical verb sequences
//       + identical ctx keys (no tracking state).
//
// SMOKE=1: instrument-honesty subset (R1 + G12) only.
'use strict';
let W = null;
try { W = require('./policies/besiegeanswer'); } catch (e) { /* deleted per kill protocol */ }
if (!W) {
  console.log('INFO-SKIP: besiegeanswer layer deleted per kill protocol; see evidence/2026-10-15/sim-besiegeanswer.md');
  process.exit(0);
}
const assert = require('assert');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok - ' + name); }
  catch (e) { fail++; console.log('  FAIL - ' + name + ' :: ' + e.message); }
}

const MONSTER_DEFS = [
  { id: 'hushwolf', name: 'Hushwolf', wave: 1, counter: { kind: 'shout', trick: 'bellow', reveal: 'it scatters' } },
  { id: 'voice_mimic_radio', name: 'Static', wave: 2, counter: { kind: 'keep_distance', trick: 'refuse', reveal: 'it starves' } },
  { id: 'reunion', name: 'The Reunion', wave: 4 },
  { id: 'editor', name: 'The Editor', wave: 5 },
];

function mockGame(over) {
  const calls = [];
  const G = {
    calls,
    state: {
      scholar: { day: 10, health: 100, villagerId: 'v2' },
      village: {
        px: 4, py: 4,
        roster: ['v2', 'v3', 'v4'],
        health: { v2: 100, v3: 90, v4: 80 },
        away: {},
      },
      telemetry: [],
      monsterCounters: {},
    },
    villagerId: 'v2',
    map: { px: 4, py: 4 },
    data: { monsters: MONSTER_DEFS },
    _party: [],
    _pending: null,
    say(msg) { calls.push(['say', String(msg).slice(0, 220)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune', v4: 'Dee Elm' }[vid] || String(vid)); },
    monsterDisplayName(mid) { const d = MONSTER_DEFS.find(x => x.id === mid); return d ? d.name : mid; },
    monsterCounterKnown(mid) { return !!((this.state.monsterCounters || {})[mid]); },
    playerAtHaven() { return true; },
    maxHealth() { return 100; },
    tableActive() { return false; },
    inviteToParty(vid) {
      calls.push(['inviteToParty', vid]);
      if (this._party.length >= 3) return { ok: false, msg: 'full' };
      this._party.push(vid);
      return { ok: true, msg: 'joins' };
    },
    partyFull() { return this._party.length >= 3; },
    partyMembers() { return this._party.slice(); },
    triggerEncounter(mid) {
      calls.push(['triggerEncounter', mid]);
      this.pendingEncounter = true; this.pendingMonsterId = mid;
      return true;
    },
    pendingEncounter: false,
    pendingMonsterId: null,
    tbfight: null,
    tbIsPlayerTurn() { return true; },
    tbFighter(k) {
      if (k !== 'p' || !this.tbfight) return null;
      return this.tbfight.fighters.find(x => x.kind === 'p') || null;
    },
    tbPlayerShout() { calls.push(['tbPlayerShout']); return true; },
    tbPlayerOfferFood() { calls.push(['tbPlayerOfferFood']); return true; },
    tbPlayerWait() { calls.push(['tbPlayerWait']); return true; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// telemetry builders
function combatPair(g, day, mid, wave) {
  g.state.telemetry.push({ type: 'combat_start', day, vs: mid, wave });
  g.state.telemetry.push({ type: 'combat_end', day, result: 'defeat' });
}
function havenCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true, tile: [4, 4] });
}
function wildCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true, tile: [6, 6] });
}
function unattributedDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true });
}
function havenStarveDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'starvation', player: true, tile: [4, 4] });
}
function mantlePass(g, newVid, day) {
  g.villagerId = newVid;
  g.state.scholar.villagerId = newVid;
  g.state.scholar.day = day;
  // the new scholar is NOT in the party yet
  g._party = g._party.filter(v => v !== newVid);
}
const fakeParent = {
  id: 'fakeparent',
  daily(Game, ctx) {
    ctx.parentDaily = (ctx.parentDaily || 0) + 1;
    Game.say('parent chore');
    return 'daily-ret';
  },
  upkeep(Game, ctx) {
    ctx.parentUpkeep = (ctx.parentUpkeep || 0) + 1;
    return 'upkeep-ret';
  },
  fight(Game, ctx) {
    ctx.parentFight = (ctx.parentFight || 0) + 1;
    return 'fight-delegated';
  },
};

const SMOKE = process.env.SMOKE === '1';
const DRIVE_RE = /drive it off/;

// R1 (RED): gate off -> the base itself, verb-for-verb identical, no tracking
t('R1 gate-off: withBesiegeAnswer returns the base itself', () => {
  delete process.env.BESIEGEANSWER;
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  assert.strictEqual(layered, fakeParent, 'gate-off must return the base object itself');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  assert.strictEqual(layered.daily(g, c), 'daily-ret');
  assert.strictEqual(c._baSeen, undefined, 'no tracking state gate-off');
  assert.strictEqual(c.baAnswers || 0, 0, 'no answers gate-off');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter gate-off');
});

// R2 (REAL RED): gate off + Haven combat death -> successor NOT answered (blank unblocked)
t('R2 REAL RED: gate-off, post-Haven-death successor NOT answered', () => {
  delete process.env.BESIEGEANSWER;
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  layered.daily(g, c);
  layered.upkeep(g, c);
  assert.ok(!g.calls.some(k => k[0] === 'say' && DRIVE_RE.test(k[1])), 'no drive-off line gate-off');
  assert.ok(!g.calls.some(k => k[0] === 'inviteToParty'), 'no invites gate-off');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter gate-off (the blank)');
});

if (!SMOKE) {
// G1: the answer fires
t('G1 Haven combat death, w2 besieger, HP ok, villager joins -> deliberate drive-off', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'voice_mimic_radio', 2); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 80;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret', 'base daily must run');
  assert.strictEqual(c.baAnswers, 1, 'exactly one answer');
  assert.strictEqual(c._baAnswer.mid, 'voice_mimic_radio');
  assert.strictEqual(c._baAnswer.wave, 2);
  assert.strictEqual(c._baAnswer.armed, true, 'answer armed for the fight hook');
  assert.ok(g.calls.some(k => k[0] === 'inviteToParty' && k[1] === 'v3'), 'invited a healthy villager');
  const trig = g.calls.filter(k => k[0] === 'triggerEncounter');
  assert.strictEqual(trig.length, 1, 'triggerEncounter once, got ' + trig.length);
  assert.strictEqual(trig[0][1], 'voice_mimic_radio', 'answers the identified besieger');
  const says = g.calls.filter(k => k[0] === 'say' && DRIVE_RE.test(k[1]));
  assert.strictEqual(says.length, 1, 'drive-off line once, got ' + says.length);
  assert.ok(/Aldo/.test(says[0][1]) && /Bea/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  assert.ok(/Static/.test(says[0][1]), 'names the besieger: ' + says[0][1]);
  // second hook same death: no repeat answer (one answer per death)
  const n0 = g.calls.length;
  layered.upkeep(g, c);
  assert.strictEqual(c.baAnswers, 1, 'no repeat answer for the same death');
  assert.strictEqual(g.calls.slice(n0).filter(k => k[0] === 'triggerEncounter').length, 0);
  delete process.env.BESIEGEANSWER;
});

// G2: wave-4 besieger -> NEVER engaged
t('G2 wave-4 besieger -> NO engagement (declined silently, counted)', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'reunion', 4); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0, 'no answer for w4');
  assert.strictEqual(c.baDeclinedW4, 1, 'w4 decline counted');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter for w4');
  assert.ok(!g.calls.some(k => k[0] === 'inviteToParty'), 'no invites for w4');
  assert.ok(!g.calls.some(k => k[0] === 'say' && DRIVE_RE.test(k[1])), 'no drive-off line for w4');
  delete process.env.BESIEGEANSWER;
});

// G3: HP<60% -> held
t('G3 successor HP<60% -> held, no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 40;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.strictEqual(c.baHeldHp, 1, 'HP hold counted');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter when hurt');
  delete process.env.BESIEGEANSWER;
});

// G4: no villagers join + counter unknown -> held
t('G4 no party and counter unknown -> held, no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame({
    inviteToParty(vid) { this.calls.push(['inviteToParty', vid]); return { ok: false, msg: 'no' }; },
  }), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 90;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.strictEqual(c.baHeldParty, 1, 'party hold counted');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter without party or trick');
  delete process.env.BESIEGEANSWER;
});

// G5: counter known + no villagers -> answer (the trick answers it)
t('G5 counter known, no villagers -> answer via the trick', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame({
    inviteToParty(vid) { this.calls.push(['inviteToParty', vid]); return { ok: false, msg: 'no' }; },
  }), c = mockCtx();
  g.state.monsterCounters = { hushwolf: true };
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 90;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers, 1, 'counter-known answers even alone');
  const trig = g.calls.filter(k => k[0] === 'triggerEncounter');
  assert.strictEqual(trig.length, 1);
  assert.strictEqual(trig[0][1], 'hushwolf');
  delete process.env.BESIEGEANSWER;
});

// G6: wild combat death -> no answer
t('G6 wild combat death -> no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  wildCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0, 'wild deaths do not open an answer');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter for wild deaths');
  delete process.env.BESIEGEANSWER;
});

// G7: unattributed death (no tile) -> fail safe
t('G7 unattributed death (no tile) -> fail safe, no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  unattributedDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no answer without the tile channel');
  delete process.env.BESIEGEANSWER;
});

// G8: no combat pairing -> unattributed besieger -> no answer
t('G8 no combat_start pairing -> besieger unattributed -> no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10); // no combat pair at all
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.strictEqual(c.baUnattributed, 1, 'unattributed besieger counted');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no answer without besieger ID');
  delete process.env.BESIEGEANSWER;
});

// G9: table active -> held
t('G9 table active -> held, no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame({ tableActive() { return true; } }), c = mockCtx();
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.strictEqual(c.baHeldTable, 1, 'table hold counted');
  delete process.env.BESIEGEANSWER;
});

// G10: mid-combat at scan -> held (never clobbers a live fight)
t('G10 mid-combat at scan -> held, no triggerEncounter', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  g.tbfight = { over: false, fighters: [] };
  havenCombatDeath(g, 10, 'v1'); combatPair(g, 10, 'hushwolf', 1); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.strictEqual(c.baHeldBusy, 1, 'busy hold counted');
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no triggerEncounter mid-fight');
  delete process.env.BESIEGEANSWER;
});

// G11: the committed fight
t('G11 fight(): answer fight commits — counter verb first, no early flee, 25% floor delegates', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const mkFight = (hp) => ({
    over: false, shouts: 0, round: 1,
    fighters: [
      { kind: 'p', hp, maxHp: 100, alive: true },
      { kind: 'monster', hp: 60, maxHp: 60, alive: true, fled: false, mdef: { id: 'hushwolf' } },
    ],
  });
  // (a) counter known (shout kind), HP 80%: the trick fires, base NOT called
  {
    const g = mockGame(), c = mockCtx();
    g.state.monsterCounters = { hushwolf: true };
    c._baAnswer = { mid: 'hushwolf', wave: 1, day: 10, armed: true };
    // NOTE: the answer is armed by the layer (ans.armed set at answer time)
    g.tbfight = mkFight(80);
    const r = layered.fight(g, c);
    assert.strictEqual(r, true, 'counter verb handled the turn');
    assert.ok(g.calls.some(k => k[0] === 'tbPlayerShout'), 'shout fired for the shout-kind counter');
    assert.strictEqual(c.parentFight || 0, 0, 'base fight NOT called on a committed turn');
    assert.strictEqual(c.baTricks, 1);
  }
  // (b) counter unknown, HP 80%: returns false (harness default strikes), base NOT called
  {
    const g = mockGame(), c = mockCtx();
    c._baAnswer = { mid: 'voice_mimic_radio', wave: 2, day: 10, armed: true };
    g.tbfight = {
      over: false, shouts: 0, round: 1,
      fighters: [
        { kind: 'p', hp: 80, maxHp: 100, alive: true },
        { kind: 'monster', hp: 60, maxHp: 60, alive: true, fled: false, mdef: { id: 'voice_mimic_radio' } },
      ],
    };
    const r = layered.fight(g, c);
    assert.strictEqual(r, false, 'no trick -> return false (default strikes, no flee path)');
    assert.strictEqual(c.parentFight || 0, 0, 'base fight NOT called — its early flee cannot fire');
    assert.strictEqual(c.baCommittedTurns, 1);
  }
  // (c) HP 20% (<25% floor): delegates to base (which may flee — honest floor)
  {
    const g = mockGame(), c = mockCtx();
    c._baAnswer = { mid: 'hushwolf', wave: 1, day: 10, armed: true };
    g.tbfight = mkFight(20);
    const r = layered.fight(g, c);
    assert.strictEqual(r, 'fight-delegated', 'below the floor the base takes the turn');
    assert.strictEqual(c.parentFight, 1);
  }
  // (d) besieger gone from the fight: disarm, delegate
  {
    const g = mockGame(), c = mockCtx();
    c._baAnswer = { mid: 'hushwolf', wave: 1, day: 10, armed: true };
    g.tbfight = {
      over: false, round: 2,
      fighters: [
        { kind: 'p', hp: 80, maxHp: 100, alive: true },
        { kind: 'monster', hp: 0, maxHp: 60, alive: false, fled: false, mdef: { id: 'hushwolf' } },
      ],
    };
    const r = layered.fight(g, c);
    assert.strictEqual(r, 'fight-delegated');
    assert.strictEqual(c._baAnswer.armed, false, 'answer disarmed when the besieger is gone');
  }
  delete process.env.BESIEGEANSWER;
});

// G13: non-combat Haven death -> no answer
t('G13 non-combat Haven death -> no answer', () => {
  process.env.BESIEGEANSWER = '1';
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const g = mockGame(), c = mockCtx();
  havenStarveDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; g.state.scholar.health = 100;
  layered.daily(g, c);
  assert.strictEqual(c.baAnswers || 0, 0);
  assert.ok(!g.calls.some(k => k[0] === 'triggerEncounter'), 'no answer for non-combat deaths');
  delete process.env.BESIEGEANSWER;
});
} // !SMOKE

// G12 (det-gate): gate-off 3-day scripted run — identical verbs + ctx keys.
t('G12 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.BESIEGEANSWER;
  const layered = W.withBesiegeAnswer(fakeParent, 'testlayer');
  const runScript = (pol) => {
    const g = mockGame(), c = mockCtx();
    for (let d = 10; d <= 12; d++) {
      g.state.scholar.day = d;
      if (d === 11) { havenCombatDeath(g, d, 'v1'); combatPair(g, d, 'hushwolf', 1); mantlePass(g, 'v2', d); }
      pol.daily(g, c); pol.upkeep(g, c);
    }
    return { calls: g.calls, ctxKeys: Object.keys(c).sort() };
  };
  const a = runScript(layered), b = runScript(fakeParent);
  assert.deepStrictEqual(a.calls, b.calls, 'verb sequences differ');
  assert.deepStrictEqual(a.ctxKeys, b.ctxKeys, 'ctx keys differ: ' + JSON.stringify(a.ctxKeys));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
