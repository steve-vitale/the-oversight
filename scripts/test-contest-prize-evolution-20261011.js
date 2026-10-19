#!/usr/bin/env node
// test-contest-prize-evolution-20261011.js — long-run sim lever 6, round 5
// (contests & shows): item-evolution-assist prize lane.
//
// Canon docs/CONTESTS.md "Prizes — every lane": "Item evolution assists".
// r4 measured: NEVER happened (no code path). This round builds it as the
// fourth System prize lane — via the EXISTING relic bond/threshold machinery
// (game.js RELIC BOND), no new mechanics:
//   A. fires on a bonded relic; story moment = +3 bond (canon), +5 extreme
//   B. sentimental keepsakes preferred; equipped (carried visibly) preferred
//   C. bond 10/25/50 offers fire through the real offerRelicEnhancement path
//   D. keepsake reveal fires through checkKeepsakeReveal (bond>=10 + System)
//   E. owner-lock respected (stranger's keepsake -> false, no assist)
//   F. gates: no System -> false; no relics -> false; never silent (announced)
//   G. integration: _cxPrizeLane reaches the 'e' lane with the 0.85+ order,
//      sets cxFirstWinGift, teles prize_evolution_assist
//   H. pending relicChoices is not trampled by a threshold-crossing assist
//   I. SENSE-TEST: the copy reads like the System, not a database
// UPDATED 2026-10-14 (keepsake growth, Steve: "Sentimental items need to
// compete with accessory gear"): keepsakes grow ONLY while worn in acc1-acc4,
// and their enhancement offer moved to L3 (bond 50). The isolated keepsake is
// now worn; C crosses 50 instead of 10; G/J wear the keepsake. A pack
// keepsake is dormant and never takes the assist (design change, on purpose).
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok:', name); }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, decodeURIComponent(new URL(f, 'https://fixture.invalid/').pathname).slice(1)), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'"'"']*\\.js' index.html`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  const lines = [];
  const teleEvents = [];
  Game.say = function (t) { lines.push(t); };
  Game.sysSay = function (t) { lines.push(t); };
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  const realTele = Game.tele.bind(Game);
  Game.tele = function (type, data) { teleEvents.push({ type, data }); return realTele(type, data); };
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.relicChoices = null;

  const defOf = (r) => (Game.data.items || []).find(i => i.id === (r.itemId || r.id)) || {};
  const relics = () => (typeof Game.relicItems === 'function' ? Game.relicItems() : []);
  ok(Array.isArray(relics()) && relics().length > 0, 'spawned relics exist', relics().length);

  // Ensure at least one real sentimental keepsake for preference tests.
  const sentDef = (Game.data.items || []).find(i => i.class === 'sentimental');
  ok(!!sentDef, 'a sentimental item def exists in data');
  let keep = relics().find(r => defOf(r).class === 'sentimental');
  if (!keep) {
    const mk = { itemId: sentDef.id, units: 1, kcalEach: 0, kg: 0.2, name: sentDef.name,
      flavor: sentDef.flavor, owner: Game.villagerId, bonded: true, bond: 0, bondOffered: [], enhancements: [] };
    s.inventory.push(mk);
    keep = mk;
  }
  ok(keep.owner === Game.villagerId, 'test keepsake is mine (owner-lock passes)');

  const CONTEST = { id: 'blood_pit', cat: 'blood', risk: 'high', name: 'The Blood Pit' };
  const teleCount = (t) => teleEvents.filter(e => e.type === t).length;
  // isolate: the bond tests address exactly one relic so the random pick is deterministic
  const isolateKeep = () => { s.inventory = []; s.equipped = { acc1: keep }; };

  // ---- A. the assist fires: +3 bond, announced, tele'd ----
  console.log('A. assist fires (+3 story moment)');
  isolateKeep();
  lines.length = 0; teleEvents.length = 0;
  const b0 = keep.bond || 0;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === true, 'assist returns true');
  ok(keep.bond === b0 + 3, 'story moment = +3 bond (canon value)', keep.bond);
  ok(lines.some(t => /SYSTEM/i.test(t) && /\+3 bond/.test(t)), 'announcement says what happened (+3 bond)');
  ok(lines.some(t => /cameras kept finding it/.test(t)), 'announcement has the show frame');
  ok(teleCount('prize_evolution_assist') === 1, 'prize_evolution_assist tele fired');

  // ---- extreme wins nudge harder ----
  console.log('B. extreme risk -> +5');
  isolateKeep();
  const b1 = keep.bond;
  ok(Game._cxPrizeEvolutionAssist({ id: 'x', cat: 'blood', risk: 'extreme' }) === true, 'extreme assist fires');
  ok(keep.bond === b1 + 5, '+5 bond on extreme', keep.bond);

  // ---- C. threshold offer through the real path ----
  console.log('C. bond 50 (keepsake L3) threshold -> System 1-of-3 offer');
  isolateKeep();
  s.relicChoices = null;
  keep.bond = 48; keep.bondOffered = [];
  lines.length = 0;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === true, 'threshold-crossing assist fires');
  ok(keep.bond === 51, 'bond crossed 50', keep.bond);
  ok(!!s.relicChoices, 'offerRelicEnhancement fired (relicChoices set)');
  ok((s.relicChoices.options || []).length >= 3, 'offer is 1-of-3 (or +secret)', (s.relicChoices.options || []).length);
  ok(lines.some(t => /elevated attachment|UNIT/i.test(t)), 'offer narrated, never silent');
  // cleanup: choose one so later tests are clean
  if (s.relicChoices && s.relicChoices.options && s.relicChoices.options.length) {
    Game.chooseRelicEnhancement(s.relicChoices.options[0].id);
  }
  ok(s.relicChoices === null, 'choosing clears the offer');

  // ---- D. keepsake reveal at bond>=10 ----
  console.log('D. keepsake reveal');
  isolateKeep();
  keep.bond = 9; keep.effectRevealed = false; keep.bondOffered = [];
  s.relicChoices = null;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === true, 'assist fires');
  ok(keep.effectRevealed === true, 'checkKeepsakeReveal fired (bond>=10 + System arrived)');
  s.relicChoices = null; // the threshold offer may have fired here too; clear for isolation

  // ---- E. owner-lock ----
  console.log('E. owner-lock');
  const stranger = { itemId: sentDef.id, units: 1, kcalEach: 0, kg: 0.2, name: 'Strange keepsake',
    owner: 'villager_other_person', bonded: true, bond: 0, bondOffered: [], enhancements: [] };
  const savedInv = s.inventory, savedEq = s.equipped;
  s.inventory = [stranger]; s.equipped = {};
  const sb0 = stranger.bond;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === false, 'stranger keepsake -> no assist');
  ok(stranger.bond === sb0, 'stranger keepsake untouched');
  s.inventory = savedInv; s.equipped = savedEq;

  // ---- F. gates ----
  console.log('F. gates');
  isolateKeep();
  const linesBefore = lines.length, teleBefore = teleCount('prize_evolution_assist');
  Game.state.systemArrived = false;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === false, 'no System -> false');
  Game.state.systemArrived = true;
  s.inventory = []; s.equipped = {};
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === false, 'no relics -> false');
  ok(lines.length === linesBefore && teleCount('prize_evolution_assist') === teleBefore,
    'no grant -> no new announcement (announcements only on grant)');
  s.inventory = savedInv; s.equipped = savedEq;

  // ---- preference: sentimental beats bonded tool; equipped beats pack ----
  console.log('G. preferences');
  const tool = { itemId: ((Game.data.items || []).find(i => i.class === 'tool') || {}).id || 'knife',
    units: 1, kcalEach: 0, kg: 0.3, name: 'Knife', owner: Game.villagerId,
    bonded: true, bond: 0, bondOffered: [], enhancements: [] };
  if (!((Game.data.items || []).find(i => i.id === tool.itemId))) tool.itemId = relics().find(r => r !== keep).itemId;
  s.inventory = [tool]; s.equipped = { acc1: keep };
  lines.length = 0; teleEvents.length = 0;
  Math.random = mulberry32(777);
  let sentPicks = 0, toolPicks = 0;
  for (let i = 0; i < 20; i++) {
    const ev = teleCount('prize_evolution_assist');
    Game._cxPrizeEvolutionAssist(CONTEST);
    const got = teleEvents[teleEvents.length - 1];
    if (got && got.type === 'prize_evolution_assist') {
      if (got.data.item === (keep.itemId || keep.id)) sentPicks++;
      else toolPicks++;
    }
  }
  ok(sentPicks > 0 && toolPicks === 0, 'sentimental always preferred over bonded tool', `sent=${sentPicks} tool=${toolPicks}`);
  // equipped preference: equip the tool too, but it is NOT sentimental; now
  // make two sentimental relics — equip one, keep the other in pack.
  const keep2 = { itemId: sentDef.id, units: 1, kcalEach: 0, kg: 0.2, name: sentDef.name,
    owner: Game.villagerId, bonded: true, bond: 0, bondOffered: [], enhancements: [] };
  s.inventory = [keep, keep2]; s.equipped = { acc1: keep2 };
  Math.random = mulberry32(4242);
  let eqPicks = 0, packPicks = 0;
  for (let i = 0; i < 20; i++) {
    Game._cxPrizeEvolutionAssist(CONTEST);
    const got = teleEvents[teleEvents.length - 1];
    if (got && got.type === 'prize_evolution_assist') {
      // both are the same itemId; distinguish via bond counters
      const after = relics().filter(r => (r.itemId || r.id) === sentDef.id).sort((a, b) => (b.bond || 0) - (a.bond || 0))[0];
      if (after === keep2) eqPicks++; else packPicks++;
    }
  }
  ok(eqPicks > 0 && packPicks === 0, 'equipped (carried visibly) preferred over pack', `equipped=${eqPicks} pack=${packPicks}`);
  s.inventory = savedInv; s.equipped = savedEq;
  Math.random = mulberry32(20261011);

  // ---- H. pending offer not trampled ----
  console.log('H. no offer trample');
  isolateKeep();
  keep.bond = 8; keep.bondOffered = [];
  s.relicChoices = { itemId: keep.itemId || keep.id, itemName: 'Pending', threshold: 10, options: [{ id: 'x', name: 'X' }] };
  const pending = s.relicChoices;
  ok(Game._cxPrizeEvolutionAssist(CONTEST) === true, 'assist still grants bond when offer pending');
  ok(keep.bond === 11, 'bond +3 even with pending offer');
  ok(s.relicChoices === pending, 'pending offer not trampled');
  s.relicChoices = null;

  // ---- I. lane integration ----
  console.log('I. _cxPrizeLane reaches the evolution lane');
  Game.state.cxFirstWinGift = false;
  s.inventory = savedInv; s.equipped = savedEq;
  const realRandom = Math.random;
  Math.random = () => 0.9; // order ['e','a','s','k'] — evolution first
  teleEvents.length = 0; lines.length = 0;
  ok(Game._cxPrizeLane({ variant: null }, CONTEST) === true, 'lane returns true via evolution');
  ok(teleCount('prize_evolution_assist') === 1, 'evolution assist fired through the lane');
  ok(Game.state.cxFirstWinGift === true, 'first-win gift flag set by a real grant');
  Math.random = realRandom;
  // fall-through still works: assist impossible (no relics) -> next lane fires
  s.inventory = []; s.equipped = {};
  Math.random = () => 0.9;
  const teleE = teleCount('prize_evolution_assist');
  Game._cxPrizeLane({ variant: null }, CONTEST);
  ok(teleCount('prize_evolution_assist') === teleE, 'assist impossible -> falls through to another lane');
  s.inventory = savedInv; s.equipped = savedEq;
  Math.random = realRandom;

  // ---- J. SENSE read of the copy ----
  console.log('J. sense read');
  lines.length = 0; teleEvents.length = 0;
  s.inventory = []; s.equipped = { acc1: keep };
  Game._cxPrizeEvolutionAssist({ id: 'blood_pit', cat: 'blood', risk: 'high' });
  const said = lines.filter(t => /cameras kept finding it/.test(t)).join(' ');
  ok(said.indexOf(String(keep.name).toUpperCase()) >= 0, 'copy names YOUR relic, in the System\'s register');
  ok(/Meaning is fuel/.test(said), 'copy is the System\'s unhinged voice');
  ok(!/undefined|null|NaN/.test(said), 'copy has no template leaks');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
