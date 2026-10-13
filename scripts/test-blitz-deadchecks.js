#!/usr/bin/env node
// test-blitz-deadchecks.js — blitz-deadchecks 2026-10-13.
//
// PART 1 (behaviorCheck dead checks): behaviorCheck in truth.js referenced
// memory types that were NEVER written — 'hoard', 'stole', 'betrayed',
// 'fight' — so those branches could never fire. Decisions (conservative):
//   - 'stole'    -> WIRED: theft confession (confrontTheft) now writes it.
//   - 'hoard'    -> WIRED: public freeloading warning (freeloadWarning) now writes it.
//   - 'betrayed' -> WIRED: villager ambush of the scholar (ambushAftermath) now writes it.
//   - 'fight'    -> WIRED: same ambush now writes it.
//   - 'confronted' was REMOVED from the fight branch: that memory is the
//     SCHOLAR confronting the villager about gossip, not the villager
//     picking fights — the read had the direction backwards.
//   - 'promise_broken' was already written; untouched.
//
// PART 2 (belltoad, Steve 2026-10-13): the carcass now yields LEGS as a
// separate item from the body meat. Legs are safe, body meat is poison —
// both the kill note and the POISON test-mark were right, about different
// parts. Neither is KNOWN until discovered: legs gate on codex
// 'belltoad_legs' through the normal cautious-test chain, and the
// "Legs are fine" note only reads post-discovery.
//
// RED on pristine (dead checks never fire; belltoad is one item), GREEN after.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

// ---------- PART A: static — no behaviorCheck branch references an unwritten memory type ----------
function behaviorCheckTypes() {
  const src = fs.readFileSync(path.join(ROOT, 'src/js/truth.js'), 'utf8');
  const start = src.indexOf('Game.behaviorCheck = function');
  if (start < 0) { fail('behaviorCheck not found in truth.js'); return []; }
  const end = src.indexOf('\n  };', start);
  const body = src.slice(start, end < 0 ? undefined : end);
  const types = new Set();
  const re = /m\.t === '([a-z_]+)'/g;
  let m;
  while ((m = re.exec(body))) types.add(m[1]);
  return [...types];
}
function writtenMemoryTypes() {
  const dir = path.join(ROOT, 'src/js');
  const types = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    let re = /remember\(\s*[^,]+,\s*'([a-z_]+)'/g, m;
    while ((m = re.exec(src))) types.add(m[1]);
    // convo-scene dynamic path: spec.memory = { type: 'x', ... }
    re = /memory:\s*\{\s*type:\s*'([a-z_]+)'/g;
    while ((m = re.exec(src))) types.add(m[1]);
  }
  return types;
}

async function main() {
  const checked = behaviorCheckTypes();
  const written = writtenMemoryTypes();
  assert(checked.length > 0, 'behaviorCheck references memory types: ' + checked.join(', '));
  for (const t of checked) {
    assert(written.has(t),
      `check type '${t}' has a memory-write site` + (written.has(t) ? '' : ' (DEAD CHECK)'));
  }

  // ---------- PART B: dynamic — wires fire in sim play ----------
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await setupGame(Game);
  const player = Game.villagerId;
  const npcs = (Game.state.village.roster || []).filter(id => id !== player);
  if (npcs.length < 3) { fail('need 3+ NPCs on roster, have ' + npcs.length); process.exitCode = 1; return; }
  const [thief, freeloader, ambusher] = npcs;
  const memOf = (vid) => ((Game.state.village.memory || {})[vid]) || [];

  // B1: 'stole' — theft confession writes it.
  try {
    const d = Game.addDoubt(thief, 'observation', 'saw them by the cache, pack heavy',
      ['saw them near the cache (day ' + Game.state.scholar.day + ')'], { quiet: true });
    if (!d) throw new Error('addDoubt returned null');
    d.theft = { cacheId: 'c1', label: 'buried rations', place: 'the wilds', day: Game.state.scholar.day, witness: 'you' };
    const realRandom = Math.random;
    Math.random = () => 0; // force the confession branch
    let res;
    try { res = Game.confrontTheft(thief, d.id); }
    finally { Math.random = realRandom; }
    assert(res && res.outcome === 'confessed', "confrontTheft forced confession (outcome=" + (res && res.outcome) + ')');
    assert(memOf(thief).some(m => m.t === 'stole'),
      "'stole' written to memory[" + thief + "] on theft confession");
  } catch (e) { fail("'stole' wire threw: " + (e && e.message)); }

  // B2: 'hoard' — public freeloading warning writes it.
  try {
    Game.freeloadWarning(freeloader);
    assert(memOf(freeloader).some(m => m.t === 'hoard'),
      "'hoard' written to memory[" + freeloader + "] on freeloading warning");
  } catch (e) { fail("'hoard' wire threw: " + (e && e.message)); }

  // B3: 'betrayed' + 'fight' — villager ambush of the scholar writes both.
  try {
    Game.ambushAftermath({ id: 'plot_test', leader: ambusher, accomplices: [], target: player }, 'escaped');
    assert(memOf(ambusher).some(m => m.t === 'betrayed'),
      "'betrayed' written to memory[" + ambusher + "] on ambush");
    assert(memOf(ambusher).some(m => m.t === 'fight'),
      "'fight' written to memory[" + ambusher + "] on ambush");
  } catch (e) { fail("ambush wires threw: " + (e && e.message)); }

  // B4: behaviorCheck fires end-to-end on the wired memories.
  try {
    Game.trackClaimSilent(thief, 'goal', 'belong');
    const dBefore = (Game.state.codex.doubts || []).length;
    Game.behaviorCheck(thief);
    const newDoubts = (Game.state.codex.doubts || []).slice(dBefore);
    assert(newDoubts.some(d => d.kind === 'behavior' && d.vid === thief),
      "behaviorCheck fires 'behavior' doubt: claimed belong + stole");
    Game.trackClaimSilent(ambusher, 'goal', 'survive');
    const dBefore2 = (Game.state.codex.doubts || []).length;
    Game.behaviorCheck(ambusher);
    const newDoubts2 = (Game.state.codex.doubts || []).slice(dBefore2);
    assert(newDoubts2.some(d => d.kind === 'behavior' && d.vid === ambusher),
      "behaviorCheck fires 'behavior' doubt: claimed survive + fight");
  } catch (e) { fail('behaviorCheck end-to-end threw: ' + (e && e.message)); }

  // ---------- PART C: belltoad part-specific yields ----------
  const mdef = (Game.data.monsters || []).find(m => m.id === 'belltoad');
  if (!mdef || !mdef.edible) { fail('belltoad mdef/edible missing'); process.exitCode = 1; return; }
  ok('belltoad mdef found (edible.calories=' + mdef.edible.calories + ')');

  // C1: two distinct items, honest calories.
  let entries = null;
  try {
    entries = Game.monsterCarcassEntries(mdef);
  } catch (e) { fail('monsterCarcassEntries threw: ' + (e && e.message)); }
  if (entries) {
    assert(entries.length === 2, 'belltoad kill yields 2 carcass entries (got ' + entries.length + ')');
    const ids = entries.map(e => e.plantId).sort();
    assert(ids[0] === 'meat_belltoad' && ids[1] === 'meat_belltoad_legs',
      'distinct items: ' + ids.join(' + '));
    const names = entries.map(e => e.name);
    assert(names[0] !== names[1], 'distinct names: "' + names[0] + '" vs "' + names[1] + '"');
    const total = entries.reduce((s, e) => s + (e.hiddenKcal || 0), 0);
    assert(total === mdef.edible.calories,
      'calorie split honest: ' + total + ' === ' + mdef.edible.calories + ' (no energy created)');
  }
  const legsEntry = entries && entries.find(e => e.plantId === 'meat_belltoad_legs');
  const bodyEntry = entries && entries.find(e => e.plantId === 'meat_belltoad');
  if (!legsEntry || !bodyEntry) { fail('missing legs/body entry'); process.exitCode = 1; return; }

  // C2: pre-discovery gating — cleaned legs stay unknown.
  try {
    const inv = [JSON.parse(JSON.stringify(legsEntry))];
    Game.carcassToMeat(inv, 0);
    assert(inv[0].edible === false,
      'legs NOT known pre-discovery (edible=false after cleaning — knowledge gating holds)');
    assert(!Game.monsterFoodSafe('belltoad_legs'), "monsterFoodSafe('belltoad_legs') false pre-discovery");
  } catch (e) { fail('legs gating threw: ' + (e && e.message)); }

  // C3: kill-note gating — "Legs are fine" reads only post-discovery.
  const said = [];
  const origSay = Game.say;
  Game.say = function (t) { said.push(String(t)); try { return origSay.call(this, t); } catch (e) {} };
  try {
    delete ((Game.state.codex.monsters || {}).belltoad_legs || {});
    if (Game.state.codex.monsters) delete Game.state.codex.monsters.belltoad_legs;
    Game.tbKillRewards([{ mdef, _deathCorpse: { items: [] }, key: 'bt1' }]);
    const pre = said.join('\n');
    assert(!pre.includes('Legs are fine'), 'kill note HIDDEN pre-discovery');
    assert(pre.includes("don't know this flesh"), 'generic "unknown flesh" guidance still shows pre-discovery');
  } catch (e) { fail('kill-note pre-discovery threw: ' + (e && e.message)); }

  // C4: discovery chain — legs test SAFE, body tests POISON.
  // (The legs item lives in the scholar's real inventory: markMonsterFoodSafe
  // reveals inventory items on discovery, which is part of the chain.)
  try {
    const linv = Game.state.scholar.inventory;
    linv.push(JSON.parse(JSON.stringify(legsEntry)));
    const lidx = linv.length - 1;
    Game.carcassToMeat(linv, lidx);
    Game.testMonsterMeat(lidx, linv);
    assert(Game.monsterFoodSafe('belltoad_legs') === true,
      "discovery: legs test SAFE (monsterFoodSafe('belltoad_legs')=true)");
    assert(linv[lidx].edible === true, 'discovered legs reveal as edible');
    const e0 = Game.state.scholar.energy;
    const binv = [JSON.parse(JSON.stringify(bodyEntry))];
    Game.carcassToMeat(binv, 0);
    Game.testMonsterMeat(0, binv);
    const ce = (Game.state.codex.monsters || {}).belltoad || {};
    assert(ce.foodTested === 'poison' && ce.foodSafe !== true,
      'discovery: body meat tests POISON (foodTested=' + ce.foodTested + ')');
    assert(Game.state.scholar.energy < e0, 'poison lesson costs energy (' + e0 + ' -> ' + Game.state.scholar.energy + ')');
  } catch (e) { fail('discovery chain threw: ' + (e && e.message)); }

  // C5: kill note reads post-discovery.
  try {
    said.length = 0;
    Game.tbKillRewards([{ mdef, _deathCorpse: { items: [] }, key: 'bt2' }]);
    const post = said.join('\n');
    assert(post.includes('Legs are fine'), 'kill note READS post-discovery ("Legs are fine" as folk knowledge)');
  } catch (e) { fail('kill-note post-discovery threw: ' + (e && e.message)); }
  Game.say = origSay;

  if (!failures) console.log('ALL GREEN');
  else console.error(failures + ' FAILURE(S)');
  process.exitCode = failures ? 1 : 0;
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
