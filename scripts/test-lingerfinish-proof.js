#!/usr/bin/env node
// scripts/test-lingerfinish-proof.js — sim-lingerfinish-a proof test.
// NON-JUDGED except for construction facts it pins:
//   (1) lingerfinish composes over tableseat-nowait: withLingerfinish
//       builds, LINGERFINISH unset delegates (layerOn false, base daily
//       called, no lf.* ctx surface), LINGERFINISH=1 arms it.
//   (2) wound-selective targeting: pickMarchTarget prefers lowest HP
//       fraction, haven-tile tie-break, then lowest absolute HP.
//   (3) sortie gate: the whole-treeline gate fires only on min <= 80,
//       sum <= 300, muster >= 2, pantry >= 12000, cooldown >= 6 days.
//   (4) mock-daily: a finishable treeline sorties (answerLingerer called
//       with 'sortie'); a too-strong treeline holds the sortie and
//       marches the scholar to the most-wounded lingerer instead.
//   (5) the verbs used exist in src (answerLingerer, lingererSortie,
//       travelTo, triggerEncounter) — the policy needs no new hook.
// Usage: node scripts/test-lingerfinish-proof.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let fails = 0;
function ok(cond, name) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name);
  if (!cond) fails++;
}
const lf = require('./policies/lingerfinish');
const ts = require('./policies/tableseat-nowait');

// (1) composition + gate
ok(typeof lf.withLingerfinish === 'function', 'withLingerfinish exported');
const composed = lf.withLingerfinish(ts.tableseatNowait, 'test-lf-compose', 'proof only');
ok(composed && typeof composed.daily === 'function', 'withLingerfinish(tableseatNowait) builds with daily');
const saved = process.env.LINGERFINISH;
try {
  delete process.env.LINGERFINISH;
  ok(!lf.layerOn(), 'layer OFF when LINGERFINISH unset');
  let baseCalled = false;
  const base = { daily() { baseCalled = true; return 'base-ret'; } };
  const w = lf.withLingerfinish(base, 'test-off', 'proof');
  const ctx = {};
  const ret = w.daily({}, ctx);
  ok(baseCalled && ret === 'base-ret', 'gate OFF delegates to base daily');
  ok(!Object.keys(ctx).some(k => k.indexOf('lf') === 0), 'gate OFF leaves no lf.* ctx surface');
  process.env.LINGERFINISH = '1';
  ok(lf.layerOn(), 'layer ON when LINGERFINISH=1');
} finally {
  if (saved === undefined) delete process.env.LINGERFINISH; else process.env.LINGERFINISH = saved;
}

// (2) march targeting
const haven = { x: 4, y: 4 };
const mk = (id, hp, mx, tx, ty) => ({ m: { id, hp, maxHp: mx, tx, ty }, hp, maxHp: mx, frac: hp / mx });
ok(lf.pickMarchTarget([mk('a', 900, 1200, 4, 4), mk('b', 40, 280, 9, 9), mk('c', 700, 1000, 4, 4)], haven).m.id === 'b',
  'march target = lowest fraction (40/280 beats 900/1200)');
ok(lf.pickMarchTarget([mk('a', 150, 200, 9, 9), mk('b', 150, 200, 4, 4)], haven).m.id === 'b',
  'march tie-break: haven-tile first at equal fraction');
ok(lf.pickMarchTarget([mk('a', 90, 200, 4, 4), mk('b', 60, 200, 4, 4)], haven).m.id === 'b',
  'march tie-break: lowest absolute HP at equal fraction+tile');
ok(lf.pickMarchTarget([], haven) === null, 'march target null on empty list');
// wounded filter
const fakeGame = { data: { monsters: [{ id: 'x', hp: [100] }] }, worldMonsters: () => [] };
const wlist = lf.woundedLingerers(fakeGame, [
  { id: 'full', hp: 100, maxHp: 100 }, { id: 'hurt', hp: 30, maxHp: 100 },
  { id: 'nodef', hp: 50 }, // maxHp falls back to def hp[0]=100? no: id 'nodef' has no def; falls back to m.hp -> frac 1, not wounded
  { id: 'x', hp: 50 }, // def hp[0]=100 -> wounded at 0.5
]);
ok(wlist.length === 2 && wlist.some(e => e.m.id === 'hurt') && wlist.some(e => e.m.id === 'x'),
  'woundedLingerers keeps hp<maxHp only, with def base-HP fallback');

// (3) sortie gate
const G = (list, pantry, healthy, last, today) => lf.sortieGate(list, pantry, healthy, last, today);
const m1 = (hp) => ({ hp });
ok(!G([], 20000, 3, null, 10).fire && G([], 20000, 3, null, 10).why === 'none', 'sortie gate: none');
ok(!G([m1(100)], 20000, 3, null, 10).fire && G([m1(100)], 20000, 3, null, 10).why === 'minHp', 'sortie gate: minHp');
ok(!G([m1(40), m1(290)], 20000, 3, null, 10).fire && G([m1(40), m1(290)], 20000, 3, null, 10).why === 'sumHp', 'sortie gate: sumHp');
ok(!G([m1(40)], 20000, 1, null, 10).fire && G([m1(40)], 20000, 1, null, 10).why === 'muster', 'sortie gate: muster');
ok(!G([m1(40)], 5000, 3, null, 10).fire && G([m1(40)], 5000, 3, null, 10).why === 'pantry', 'sortie gate: pantry');
ok(!G([m1(40)], null, 3, null, 10).fire && G([m1(40)], null, 3, null, 10).why === 'pantry', 'sortie gate: unreadable pantry holds');
ok(!G([m1(40)], 20000, 3, 8, 10).fire && G([m1(40)], 20000, 3, 8, 10).why === 'cooldown', 'sortie gate: cooldown <6d');
ok(G([m1(40)], 20000, 3, 4, 10).fire, 'sortie gate: fires at 6d cooldown boundary');
ok(G([m1(1), m1(1)], 20000, 3, null, 10).fire, 'sortie gate: fires on 1-HP treeline');

// (4) mock-daily
function mockGame(lingerers, opts) {
  opts = opts || {};
  const g = {
    state: {
      scholar: { day: opts.day || 10, health: 100, insideTent: false },
      village: {
        px: 4, py: 4,
        roster: ['v1', 'v2', 'v3'], away: {},
        health: { v1: 100, v2: 100, v3: 100 },
        trust: { v1: 50, v2: 50, v3: 50 },
        pantryKcal: opts.pantry === undefined ? 20000 : opts.pantry,
      },
      systemArrived: true,
    },
    villagerId: 'scholar1',
    over: false, tbfight: null, pendingEncounter: false, _sleeping: false,
    map: { px: 4, py: 4 },
    data: { monsters: (opts.defs || [{ id: 'w3a', hp: [280], wave: 3 }, { id: 'w4a', hp: [1200], wave: 4 }]) },
    _linger: lingerers,
    worldMonsters() { return this._linger.filter(m => m.lingering); },
    tableActive() { return false; },
    maxHealth() { return 100; },
    _party: [],
    partyMembers() { return this._party; },
    partyFull() { return false; },
    inviteToParty(vid) { this._party.push(vid); return { ok: true }; },
    monsterAt(x, y) { return this._linger.find(m => m.tx === x && m.ty === y) || null; },
    travelTo(x, y) { this.map.px = x; this.map.py = y; },
    triggerEncounter(id) { this._triggered = id; },
    answerLingerer(how) {
      this._sortieCalled = how;
      // simulate a cleared treeline: all lingerers stop lingering
      for (const m of this._linger) m.lingering = false;
      return { ok: true, cleared: this._linger.length, broke: false, remaining: 0, paid: 6000 };
    },
    displayName() { return 'Scholar One'; },
    monsterDisplayName(id) { return id; },
    say() {},
  };
  return g;
}
process.env.LINGERFINISH = '1';
try {
  // (a) finishable treeline sorties, march skipped (nothing left)
  const gA = mockGame([
    { id: 'w3a', hp: 1, maxHp: 280, tx: 4, ty: 4, lingering: true },
    { id: 'w3a', hp: 1, maxHp: 280, tx: 4, ty: 4, lingering: true },
  ]);
  const ctxA = {};
  lf.lingerfinishStep(gA, ctxA);
  ok(gA._sortieCalled === 'sortie', 'mock daily: finishable treeline sorties');
  ok(ctxA.lfSortieCalls === 1, 'mock daily: sortie counter = 1');
  ok(!gA._triggered, 'mock daily: no march after treeline cleared by sortie');
  // (b) too-strong treeline: sortie held, march goes to most-wounded
  // (different tiles so both are first-on-tile and fightable)
  const gB = mockGame([
    { id: 'w4a', hp: 900, maxHp: 1200, tx: 4, ty: 4, lingering: true },
    { id: 'w3a', hp: 40, maxHp: 280, tx: 5, ty: 5, lingering: true },
  ]);
  const ctxB = {};
  lf.lingerfinishStep(gB, ctxB);
  ok(!gB._sortieCalled, 'mock daily: too-strong treeline holds sortie');
  ok(ctxB.lfSortieHeld_sumHp === 1, 'mock daily: sortie held reason sumHp recorded');
  ok(gB._triggered === 'w3a', 'mock daily: march targets most-wounded (40/280)');
  ok(ctxB.lfMarchEngagements === 1, 'mock daily: march engagement counter = 1');
  // (b2) stacked haven tile: most-wounded second on the tile is NOT the
  // march target — the fightable first-on-tile one is (no wrong entity)
  const gB2 = mockGame([
    { id: 'w4a', hp: 900, maxHp: 1200, tx: 4, ty: 4, lingering: true },
    { id: 'w3a', hp: 40, maxHp: 280, tx: 4, ty: 4, lingering: true },
  ]);
  const ctxB2 = {};
  lf.lingerfinishStep(gB2, ctxB2);
  ok(!gB2._sortieCalled, 'mock daily: stacked treeline holds sortie (sumHp)');
  ok(gB2._triggered === 'w4a', 'mock daily: stacked tile marches first-on-tile, not stacked-behind most-wounded');
  // (c) cooldown: second call same day does not re-sortie
  const gC = mockGame([{ id: 'w3a', hp: 1, maxHp: 280, tx: 4, ty: 4, lingering: true }]);
  const ctxC = {};
  lf.lingerfinishStep(gC, ctxC);
  // restore a lingerer and call again same day: sortie must hold on cooldown
  gC._linger = [{ id: 'w3a', hp: 1, maxHp: 280, tx: 4, ty: 4, lingering: true }];
  gC._sortieCalled = undefined;
  lf.lingerfinishStep(gC, ctxC);
  ok(!gC._sortieCalled && ctxC.lfSortieHeld_cooldown === 1, 'mock daily: sortie cooldown blocks same-day re-sortie');
} finally {
  if (saved === undefined) delete process.env.LINGERFINISH; else process.env.LINGERFINISH = saved;
}

// (5) verbs exist in src, no new hook needed
const hg = fs.readFileSync(path.join(REPO, 'src/js', 'havenGrowth.js'), 'utf8');
ok(hg.includes('answerLingerer(how)'), 'answerLingerer exists in havenGrowth.js');
ok(hg.includes('lingererSortie()'), 'lingererSortie exists in havenGrowth.js');
const gameSrc = fs.readFileSync(path.join(REPO, 'src/js', 'game.js'), 'utf8');
ok(gameSrc.includes('triggerEncounter('), 'triggerEncounter exists in game.js');
ok(gameSrc.includes('travelTo('), 'travelTo exists in game.js');

console.log(fails ? `PROOF FAILED: ${fails} failure(s)` : 'PROOF GREEN');
process.exit(fails ? 1 : 0);
