#!/usr/bin/env node
// scripts/test-batch-loot-20261013.js — PROOF for the batch-loot lever
// (stall forensics driver #1: corpseTakeItem = 36.5% of stall acts, one
// decision per item stack, no take-all).
//
// Proves the OBSERVABLE EFFECT, not just no-throw (proof-of-effect skill):
//  1. one corpseLootAll verb clears a 4-stack corpse (1 decision, not 4)
//  2. overweight: takes what fits, leaves + reports the rest (never silent)
//  3. corpseTakeItem per-item path is behavior-identical to before
//     (parity: same end state as N per-item takes)
//  4. skipFn honored (human meat stays; trembles rule)
//  5. _left items are never swept up by take-all
//  6. first-touch trauma/ticks fire ONCE per corpse, not per stack
//  7. UI: the loot panel renders a "Take all" button wired to
//     Game.corpseLootAll(cid, meat_human-skipper)
//  8. OLD-CODE CONTROL: the same scenario fails on the pre-change corpses.js
//     (no corpseLootAll verb) — the test is not vacuous.
//
// Determinism: Math.random is seeded BEFORE anything (modules capture it at
// load). No RNG is consumed by the loot path itself.
//
// Usage: node scripts/test-batch-loot-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

// deterministic PRNG before module load (AGENTS.md: seed before eval)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(20261013);

let pass = 0, fail = 0;
const results = [];
function ok(cond, name, detail) {
  if (cond) { pass++; results.push(['PASS', name]); }
  else { fail++; results.push(['FAIL', name + (detail ? ' — ' + detail : '')]); }
}
const j = (o) => JSON.stringify(o);

// ---------- fake Game + eval corpses.js ----------
function makeGame(capKg) {
  const said = [], teled = [], geared = [];
  const g = {
    _said: said, _teled: teled, _geared: geared, _ticks: 0,
    state: { scholar: { inventory: [], day: 5 }, corpses: [] },
    corpses() { return this.state.corpses; },
    packWeight() {
      return (this.state.scholar.inventory || [])
        .reduce((t, x) => t + (x.kg || 0) * (x.units || 1), 0);
    },
    packCapacity() { return capKg == null ? 999 : capKg; },
    canCarry(kg) { return this.packWeight() + kg <= this.packCapacity(); },
    say(m) { said.push(String(m)); },
    tele(ev, d) { teled.push([ev, d]); },
    itemDisplayName(it) { return it.name || 'thing'; },
    noteGearHandled(id) { geared.push(id); },
    tickAction(n) { this._ticks += (n || 0); },
  };
  return g;
}
// corpses.js Object.assign OVERWRITES same-named methods on the game object,
// so these stubs must be applied AFTER loadCorpsesInto.
function applyStubs(g) {
  g._corpseCheckRange = () => true;
  g.corpseStageInfo = () => ({ id: 'fresh', diseaseP: 0, diseaseDmg: 0 });
  g.corpseTrauma = () => 0;
  g.addTrauma = () => {};
  g.observe = () => {};
  g.corpseIsPerson = () => false;
  g.corpseStage = () => 1;
  return g;
}
function loadCorpsesInto(g, src) {
  const prev = global.Game;
  global.Game = g;
  try { eval(src); } finally { global.Game = prev; }
}
const NEW_SRC = fs.readFileSync(path.join(ROOT, 'src/js/corpses.js'), 'utf8');

function mkItem(name, plantId, units, kg, kcalEach, extra) {
  return Object.assign({ name, plantId, units, kg, kcalEach }, extra);
}
function mkCorpse(id, items) {
  return { id, kind: 'monster', descriptor: 'beast', buried: false, looted: false, items };
}
const MEAT_SKIP = (it) => it.plantId === 'meat_human';

// ---------- 1. one verb clears a 4-stack corpse ----------
{
  const g = makeGame();
  loadCorpsesInto(g, NEW_SRC);
  applyStubs(g);
  g.state.corpses = [mkCorpse('c1', [
    mkItem('venison', 'meat_venison', 3, 2, 500),
    mkItem('hide', 'hide_deer', 1, 1, 0),
    mkItem('bone', 'bone', 2, 0.5, 0),
    mkItem('sinew', 'sinew', 1, 0.2, 0),
  ])];
  const r = g.corpseLootAll('c1');
  ok(r && r.taken.length === 4, 'lootAll takes all 4 stacks in one verb', j(r && r.taken.length));
  ok(g.state.corpses[0].looted === true, 'corpse marked looted when stripped');
  const inv = g.state.scholar.inventory;
  ok(inv.length === 4 && inv.every(x => x.units > 0), 'inventory holds the 4 stacks', j(inv.map(x => x.units)));
  ok(g._ticks === 8, 'first-touch ticks fire once per corpse, not per stack', 'ticks=' + g._ticks);
  ok(g._teled.filter(t => t[0] === 'loot_taken').length === 4, 'loot_taken tele fires per stack (telemetry parity)');
  ok(g._said.some(s => s.startsWith('Taken:')), 'narration names what was taken', j(g._said));
}

// ---------- 2. overweight: takes what fits, reports the rest ----------
{
  const g = makeGame(3); // 3kg capacity
  loadCorpsesInto(g, NEW_SRC);
  applyStubs(g);
  g.state.corpses = [mkCorpse('c1', [
    mkItem('venison', 'meat_venison', 1, 2, 500),
    mkItem('hide', 'hide_deer', 1, 2, 0),
    mkItem('bone', 'bone', 1, 2, 0),
  ])];
  const r = g.corpseLootAll('c1');
  ok(r && r.taken.length === 1 && r.left.length === 2, 'takes what fits, leaves the rest', j(r && { t: r.taken.length, l: r.left.length }));
  ok(g.state.corpses[0].items.filter(i => i.units > 0).length === 2, 'left items stay on the corpse with units > 0');
  ok(g.state.corpses[0].looted !== true, 'corpse NOT marked looted while items remain');
  ok(g._said.some(s => /Too heavy/.test(s)), 'overweight leftovers are reported, never silent', j(g._said));
}

// ---------- 3. per-item path unchanged + parity with batch ----------
{
  const items = () => [
    mkItem('venison', 'meat_venison', 3, 2, 500),
    mkItem('hide', 'hide_deer', 1, 1, 0),
    mkItem('bone', 'bone', 2, 0.5, 0),
  ];
  const g1 = makeGame(); loadCorpsesInto(g1, NEW_SRC);
  applyStubs(g1);
  g1.state.corpses = [mkCorpse('c1', items())];
  for (const idx of [0, 1, 2]) g1.corpseTakeItem('c1', idx);
  const g2 = makeGame(); loadCorpsesInto(g2, NEW_SRC);
  applyStubs(g2);
  g2.state.corpses = [mkCorpse('c1', items())];
  g2.corpseLootAll('c1');
  const norm = (g) => j(g.state.scholar.inventory.map(x => [x.plantId, x.units]).sort());
  ok(norm(g1) === norm(g2), 'batch end state == N per-item takes (parity)', norm(g1) + ' vs ' + norm(g2));
  ok(g1.state.corpses[0].looted === true && g2._ticks === 8, 'per-item path still marks looted; batch costs the same 8 ticks');
  // overweight single item still refused, as before
  const g3 = makeGame(1); loadCorpsesInto(g3, NEW_SRC);
  applyStubs(g3);
  g3.state.corpses = [mkCorpse('c1', [mkItem('venison', 'meat_venison', 1, 2, 500)])];
  ok(g3.corpseTakeItem('c1', 0) === null, 'per-item overweight refusal unchanged');
}

// ---------- 4. skipFn: human meat stays, trembles rule ----------
{
  const g = makeGame(); loadCorpsesInto(g, NEW_SRC);
  applyStubs(g);
  g.state.corpses = [mkCorpse('c1', [
    mkItem('human meat', 'meat_human', 2, 2, 400),
    mkItem('venison', 'meat_venison', 3, 2, 500),
  ])];
  const r = g.corpseLootAll('c1', MEAT_SKIP);
  ok(r.taken.length === 1 && r.taken[0].name === 'venison', 'only venison taken');
  ok(g.state.corpses[0].items[0].units === 2, 'human meat untouched on the corpse');
  ok(g._said.some(s => /Trembles/.test(s)), 'skip narrated honestly', j(g._said));
  ok(g.state.scholar.inventory.every(x => x.plantId !== 'meat_human'), 'no human meat in pack');
}

// ---------- 5. _left items are never swept up ----------
{
  const g = makeGame(); loadCorpsesInto(g, NEW_SRC);
  applyStubs(g);
  g.state.corpses = [mkCorpse('c1', [
    mkItem('venison', 'meat_venison', 3, 2, 500),
    mkItem('hide', 'hide_deer', 1, 1, 0, { _left: true }),
  ])];
  const r = g.corpseLootAll('c1');
  ok(r.taken.length === 1 && r.skipped === 1, '_left item skipped, not taken');
  ok(g.state.corpses[0].items[1].units === 1, '_left item keeps its units');
}

// ---------- 6. determinism: same setup, same result ----------
{
  const run = () => {
    const g = makeGame(); loadCorpsesInto(g, NEW_SRC);
  applyStubs(g);
    g.state.corpses = [mkCorpse('c1', [
      mkItem('venison', 'meat_venison', 3, 2, 500),
      mkItem('hide', 'hide_deer', 1, 1, 0),
    ])];
    g.corpseLootAll('c1');
    return j(g.state.scholar.inventory) + '|' + j(g._said);
  };
  ok(run() === run(), 'byte-identical repeat runs (no RNG in loot path)');
}

// ---------- 7. OLD-CODE CONTROL: pre-change corpses.js has no such verb ----------
{
  const base = process.env.OLD_CORPSES_REF || '5a6f4629';
  let oldSrc = null;
  try { oldSrc = execSync(`git -C ${ROOT} show ${base}:src/js/corpses.js`, { encoding: 'utf8' }); }
  catch (e) { oldSrc = null; }
  if (oldSrc) {
    const g = makeGame(); loadCorpsesInto(g, oldSrc);
  applyStubs(g);
    ok(typeof g.corpseLootAll === 'undefined', `old code (${base}) has no corpseLootAll — test is not vacuous`);
    g.state.corpses = [mkCorpse('c1', [mkItem('venison', 'meat_venison', 3, 2, 500)])];
    let threw = false;
    try { g.corpseLootAll('c1'); } catch (e) { threw = true; }
    ok(threw, 'batch scenario fails on old code');
  } else {
    ok(false, 'old-code control', 'could not read ' + base + ':src/js/corpses.js');
  }
}

// ---------- 8. UI: loot panel renders a wired "Take all" button ----------
{
  const appSrc = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  const fnStart = appSrc.indexOf('function renderLootInline(slot, view)');
  const endMarker = '  // ---------- the one screen ----------';
  const fnEnd = appSrc.indexOf(endMarker, fnStart);
  ok(fnStart > 0 && fnEnd > fnStart, 'renderLootInline extracted from app.js');
  if (fnStart > 0 && fnEnd > fnStart) {
    const fnSrc = appSrc.slice(fnStart, fnEnd);
    let inlineView = null;
    const stubs = {
      inlineHead: (t) => `<h3>${t}</h3>`,
      itemSpriteHtml: () => '',
      esc: (s) => String(s == null ? '' : s),
      wireInlineX: () => {},
      refresh: () => {},
    };
    let lootAllSaw = null;
    const uiGame = {
      state: { corpses: [mkCorpse('c9', [
        mkItem('venison', 'meat_venison', 3, 2, 500),
        mkItem('human meat', 'meat_human', 1, 2, 400),
      ])], scholar: { day: 5 } },
      status: () => ({ day: 5 }),
      data: { plants: [] },
      itemDisplayName: (it) => it.name || 'thing',
      corpseStageInfo: () => ({ id: 'fresh' }),
      spoilBonusDays: () => 0,
      isUsable: () => false,
      corpseTakeItem: () => null,
      corpseUseItem: () => null,
      corpseEatItem: () => null,
      corpseLootAll: (cid, skip) => { lootAllSaw = [cid, skip]; return { taken: [], left: [], skipped: 0, looted: false }; },
    };
    const lootAllBtn = { dataset: { lootall: '1' }, onclick: null };
    const slot = {
      innerHTML: '',
      querySelectorAll(sel) { return sel === '[data-lootall]' ? [lootAllBtn] : []; },
    };
    let renderOk = true, renderErr = '';
    try {
      const factory = new Function('slot', 'view', 'Game', 'inlineHead',
        'itemSpriteHtml', 'esc', 'wireInlineX', 'refresh',
        'let inlineView = {};\n' + fnSrc + '\nreturn renderLootInline(slot, view);');
      factory(slot, { cid: 'c9' }, uiGame, stubs.inlineHead, stubs.itemSpriteHtml,
        stubs.esc, stubs.wireInlineX, stubs.refresh);
    } catch (e) { renderOk = false; renderErr = e.message; }
    ok(renderOk, 'loot panel renders headless with stubs', renderErr);
    ok(slot.innerHTML.includes('data-lootall') && slot.innerHTML.includes('Take all'),
      '"Take all" button present in the loot panel');
    ok(typeof lootAllBtn.onclick === 'function', 'Take-all button is wired');
    if (typeof lootAllBtn.onclick === 'function') {
      lootAllBtn.onclick({});
      ok(lootAllSaw && lootAllSaw[0] === 'c9', 'click calls Game.corpseLootAll with the corpse id', j(lootAllSaw && lootAllSaw[0]));
      const skip = lootAllSaw && lootAllSaw[1];
      ok(typeof skip === 'function' && skip({ plantId: 'meat_human' }) === true &&
        skip({ plantId: 'meat_venison' }) === false,
        'Take-all skips human meat (trembles) via the same predicate as policies');
    }
  }
}

// ---------- report ----------
for (const [s, n] of results) console.log(`${s === 'PASS' ? 'ok' : 'NOT OK'} - ${n}`);
console.log(`\n${pass}/${pass + fail} green`);
process.exit(fail ? 1 : 0);
