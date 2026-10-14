#!/usr/bin/env node
// test-marketgod-rework-20261014.js — PROOF for the Market God capstone rework
// (Steve 2026-10-14: "fix market god").
//
// BEFORE (audited 2026-10-14):
//  B1. market_god capstone was "once per day: summon a trader to your location
//      with favorable prices" — pure shopping convenience. Every other godhood
//      changes the math of survival (cheat death, negate a hit, uncapped
//      retaliation, army-scale food, pre-fight terms...). Market God changed
//      the math of nothing.
//  B2. Worse: summonMarket was UNWIRED DEAD CODE — defined in godhood.js,
//      exported, and called from nowhere in src/js. Zero invocations.
//      (Verified: grep for summonMarket outside godhood.js returns nothing,
//      and the same is true of all 11 capstone verbs — but Market God is
//      this task's scope.)
//
// AFTER:
//  A1. New capstone: "Name Your Price" (daily) + "Buy Them Off" (per fight).
//      - namePrice(sch, itemId): name ANY item in the catalog; a trader
//        arrives with exactly that item. Paid in food-kcal barter
//        (t1 800 / t2 2000 / t3 5000). Tier-4 relics are lent, never sold.
//      - buyOff(sch, wave): one monster hesitates 2 turns (fighter.hesitate),
//        price scales by wave (w1 1000 / w2 2500 / w3 5000 / w4 10000,
//        w5 marker-only). Wealth is now a combat resource.
//  A2. Debt economy: can't pay (or buying the unbuyable) → debt MARKER, never
//      refusal — the market always delivers. 3 markers → auditDue() true.
//  A3. Wired: Game.marketNamePrice(itemId) and Game.marketBuyOff(fighter)
//      are real game methods with narration; hesitate lands on the fighter.
//  A4. Diegetic structure kept: fantasy, hint (knowledge-gated), recognition
//      beat, systemLine, real cost, real weakness.
//
// Seeded PRNG (loadGame seeds BEFORE eval). Usage: node scripts/test-marketgod-rework-20261014.js
'use strict';
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function marketScholar(kcal) {
  return { kcal: kcal == null ? 10000 : kcal, inventory: [], godhood: { active: ['market_god'], capstoneUsed: {} } };
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc' });
  const S = globalThis.Scattering;
  const G = S.Godhood;

  console.log('== JSON diegetic structure ==');
  const gh = G.byId('market_god');
  ok('market_god exists in godhood.json', !!gh);
  const cap = gh.capstone || {};
  for (const f of ['desc', 'mechanic', 'cost', 'weakness']) {
    ok('capstone.' + f + ' present and non-empty', !!(cap[f] && cap[f].length > 20), f);
  }
  ok('capstone.verb present and non-empty', !!(cap.verb && cap.verb.length > 3), 'verb');
  ok('fantasy present', !!(gh.fantasy && gh.fantasy.length > 10));
  ok('hint present (knowledge-gated)', !!(gh.hint && gh.hint.length > 20));
  ok('recognition.beat present', !!((gh.recognition || {}).beat));
  ok('recognition.systemLine present', !!((gh.recognition || {}).systemLine));
  ok('verb is not "Summon the Market"', cap.verb !== 'Summon the Market', cap.verb);
  ok('mechanic mentions both verbs', /name any item/i.test(cap.mechanic) && /hesitat/i.test(cap.mechanic));

  console.log('== namePrice: daily item delivery ==');
  S.ITEM_TIER = Object.assign({}, S.ITEM_TIER, { probe_t1: 1, probe_t2: 2, probe_t3: 3, probe_t4: 4 });
  let sch = marketScholar(10000);
  let r = G.namePrice(sch, 'probe_t1');
  ok('t1 delivers', r && r.ok && r.itemId === 'probe_t1');
  ok('t1 charges 800 kcal', r.paidKcal === 800 && sch.kcal === 9200, 'kcal=' + sch.kcal);
  ok('t1 lands in inventory', sch.inventory.some(i => i.itemId === 'probe_t1'));
  ok('t1 takes no marker', r.marker === false && G.marketMarkers(sch) === 0);
  ok('second call same day blocked', G.namePrice(sch, 'probe_t1') === null);
  G.resetDayVerbs(sch);
  r = G.namePrice(sch, 'probe_t2');
  ok('after dawn reset, t2 delivers for 2000', r && r.ok && r.paidKcal === 2000 && sch.kcal === 7200);

  console.log('== namePrice: tier-4 is lent, never sold ==');
  sch = marketScholar(999999);
  r = G.namePrice(sch, 'probe_t4');
  ok('t4 delivers even when rich', r && r.ok && sch.inventory.some(i => i.itemId === 'probe_t4'));
  ok('t4 always takes a marker', r.marker === true && G.marketMarkers(sch) === 1);
  ok('t4 charges no kcal', r.paidKcal === 0 && sch.kcal === 999999);

  console.log('== namePrice: the market never refuses ==');
  sch = marketScholar(100); // can't afford t1's 800
  r = G.namePrice(sch, 'probe_t1');
  ok('poor scholar still gets the item', r && r.ok && sch.inventory.length === 1);
  ok('poor scholar takes a marker instead', r.marker === true && G.marketMarkers(sch) === 1);
  ok('unknown item rejected honestly', G.namePrice(marketScholar(), 'nope_nonexistent').ok === false);

  console.log('== debt: 3 markers -> the Audit ==');
  sch = marketScholar(0);
  sch.godhood.marketDebt = 2;
  r = G.namePrice(sch, 'probe_t1');
  ok('3rd marker accrues', r.markers === 3, 'markers=' + r.markers);
  ok('auditDue true at 3', r.auditDue === true && G.auditDue(sch) === true);
  const sch2 = marketScholar(0);
  sch2.godhood.marketDebt = 2;
  ok('auditDue false at 2', G.auditDue(sch2) === false);

  console.log('== buyOff: wealth as a combat resource ==');
  sch = marketScholar(10000);
  r = G.buyOff(sch, 3);
  ok('w3 buyOff works', r && r.ok);
  ok('buys 2 turns of hesitation', r.hesitateTurns === 2);
  ok('w3 costs 5000 kcal', r.paidKcal === 5000 && sch.kcal === 5000, 'kcal=' + sch.kcal);
  ok('once per fight', G.buyOff(sch, 1) === null);
  G.resetFightVerbs(sch);
  r = G.buyOff(sch, 1);
  ok('after fight reset, w1 costs 1000', r && r.ok && r.paidKcal === 1000);
  sch = marketScholar(10);
  r = G.buyOff(sch, 5);
  ok('w5 is marker-only', r && r.ok && r.marker === true && r.paidKcal === 0);
  ok('no godhood -> null', G.buyOff({ kcal: 99999, inventory: [], godhood: { active: [], capstoneUsed: {} } }, 1) === null);
  ok('namePrice without godhood -> null', G.namePrice({ kcal: 99999, inventory: [], godhood: { active: [], capstoneUsed: {} } }, 'probe_t1') === null);

  console.log('== game wiring: played wrappers ==');
  ok('Game.marketNamePrice exists', typeof Game.marketNamePrice === 'function');
  ok('Game.marketBuyOff exists', typeof Game.marketBuyOff === 'function');
  ok('Game.marketItemName exists', typeof Game.marketItemName === 'function');
  // Wire the hesitate effect through the real game method on a fake fighter.
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const said = [];
  Game.say = (t) => said.push(t);
  Game.state.scholar.kcal = 20000;
  Game.state.scholar.inventory = [];
  Game.state.scholar.godhood = { active: ['market_god'], capstoneUsed: {} };
  Game.data = Game.data || {};
  Game.data.items = [{ id: 'probe_t2', name: 'Probe Widget', tier: 2 }];
  S.ITEM_TIER.probe_t2 = 2;
  const wr = Game.marketNamePrice('probe_t2');
  ok('marketNamePrice delivers via game', wr && wr.ok && Game.state.scholar.inventory.some(i => i.itemId === 'probe_t2'));
  ok('marketNamePrice narrates', said.length > 0 && /treeline|trader/i.test(said.join(' ')), said[0]);
  const fighter = { name: 'Test Horror', wave: 2, hesitate: 0 };
  const br = Game.marketBuyOff(fighter);
  ok('marketBuyOff applies hesitate to fighter', br && br.ok && fighter.hesitate === 2, 'hesitate=' + fighter.hesitate);
  ok('marketBuyOff narrates', /STOPS|hesitates/i.test(said.join(' ')));

  console.log('== power comparison: old vs new ==');
  // Old: summonMarket returned {verb, ok, note} and NOTHING happened in-game.
  // New: namePrice puts a real item in a real inventory; buyOff changes a
  // real fighter's turns. The observable effect is the proof.
  ok('old summonMarket is gone', typeof G.summonMarket === 'undefined');
  ok('new verbs exported', typeof G.namePrice === 'function' && typeof G.buyOff === 'function'
    && typeof G.marketMarkers === 'function' && typeof G.auditDue === 'function');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
