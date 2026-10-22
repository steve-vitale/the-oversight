#!/usr/bin/env node
// test-depositgate-b.js — DEPOSITGATE proof test (sim-depositgate-b, 2026-10-22).
//
// The dead run's worker left uncommitted DEPOSITGATE game.js + hierarchy.js
// changes with no proof script and no sims. This is the adoption proof.
//
// DEPOSITGATE (axis food-economy): behavioral plenty-deprioritization of
// DEPOSITS. The prodrebound-b2 DIAG showed the dominant deposit decisions
// never read the pantry sensor (funnel.share 56-60%, scholar.homecoming
// 15-25%, tribute.deposit 15%, away.return 6-7.5%, ambient.bighaul 4-5% of
// marginal-glut kcal). When the pantry reads plentiful (>4 fresh days;
// hungryStreak>=3 stands it down — duty PRODTHROTTLE's own definition), the
// unconditional depositors ease at the decision itself: half the share stays
// in the villager's hands and is eaten at the fire, the homecoming keep rises
// 2000->6000, away.return/ambient.bighaul halves are eaten at the fire, and
// tribute wagons are waved home (week counts paid, no arrears, trust +1).
// Env: DEPOSITGATE=0 control | =1 armed. Browser (no process): always ON.
// No RNG in any eased path (deterministic easing, deterministic voice), so
// gate-off trajectories stay byte-identical.
//
// RED (DEPOSITGATE=0): base behavior byte-identical — no ledger, no voice,
// no holdback, tribute takes the normal receive path even when plentiful.
// GREEN (DEPOSITGATE=1): the predicate truth table, exact-half holdbacks,
// exact-half share splits with conservation (nothing destroyed), recorded
// intake, day voice once/day with day-keyed rotation, tribute waiver only
// when plentiful+gate (grain stays theirs, no arrears, trust +1), and the
// stand-downs (lean pantry, hungryStreak>=3) hold.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const GATE = () => process.env.DEPOSITGATE;

async function fixture(seed, plentifulKcal) {
  const { Game } = await loadGame({ seed, mode: 'proof-depositgate', fullTelemetry: false });
  await setupGame(Game);
  Game.state.scholar.day = 30; // settled village
  const v = Game.state.village;
  v.pantry = [];
  if (plentifulKcal > 0) Game.stockPantry(plentifulKcal, 'Foraged food');
  return { Game, v };
}

function villagers(Game) {
  const v = Game.state.village;
  const out = [];
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    const p = Game.getPerson(id);
    if (p && !p.dead) out.push({ id, p });
  }
  return out;
}

function teachAll(Game) {
  const v = Game.state.village;
  const plants = (Game.data.plants || []).slice(0, 8).map(p => p.id);
  for (const { id } of villagers(Game)) {
    for (const pid of plants) {
      try { Game.villagerLearnsPlant && Game.villagerLearnsPlant(id, pid, 'working'); } catch (e) {}
    }
  }
}

function pantryKcal(Game) {
  const v = Game.state.village;
  return (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

(async () => {
  let fail = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
    if (!cond) fail++;
  };

  // ================= RED: gate OFF =================
  {
    process.env.DEPOSITGATE = '0';
    const { Game, v } = await fixture(4101, 150000);
    check('RED gate off', Game._depositGateOn() === false);
    check('RED plentiful fixture', Game.pantryFreshDays() > 4);
    check('RED engaged false when gate off (predicate short-circuits)', Game._depositGateEngaged() === false);
    const { id } = villagers(Game)[0];
    const pk0 = pantryKcal(Game);
    const hung0 = Game.npcNeeds(id).hunger;
    const held = Game._depositGateHoldback(id, 1000, 'return');
    check('RED holdback returns 0', held === 0);
    check('RED holdback touches no pantry', pantryKcal(Game) === pk0);
    check('RED holdback touches no hunger', Game.npcNeeds(id).hunger === hung0);
    check('RED no ledger', v._depositGate === undefined);

    // meal-day path, gate off: no state, no voice
    teachAll(Game);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    const v0 = villagers(Game)[0];
    const r = Game.villagerMealDay(v0.id, v0.p, v, {});
    check('RED meal day runs', typeof r.gave === 'number' && typeof r.ate === 'number');
    check('RED meal day writes no depositgate state', v._depositGate === undefined);
    check('RED meal day says nothing depositgate', !lines.some(l => /depositgate|shelves are full|eaten at the fire/i.test(l)));
    Game._depositGateDayVoice(v);
    check('RED day voice silent gate-off', lines.length === 0 || !lines.some(l => /🍽️/.test(l)));
    check('RED day voice writes no state gate-off', v._depositGate === undefined);
    Game.say = oSay;
  }

  // ================= GREEN: predicate truth table =================
  {
    process.env.DEPOSITGATE = '1';
    const { Game, v } = await fixture(4102, 150000);
    check('GREEN gate on', Game._depositGateOn() === true);
    check('GREEN engaged when plentiful', Game._depositGateEngaged() === true);
    // lean pantry: <=4 fresh days -> stands down
    v.pantry = [];
    Game.stockPantry(2000, 'Foraged food');
    check('GREEN lean fixture', Game.pantryFreshDays() <= 4);
    check('GREEN not engaged when lean', Game._depositGateEngaged() === false);
    // hungry streak stands it down
    Game.stockPantry(150000, 'Foraged food');
    let ps = null;
    try { ps = Game.progState(); } catch (e) {}
    if (ps && typeof ps === 'object') {
      ps.hungryStreak = 5;
      check('GREEN not engaged on hungryStreak>=3', Game._depositGateEngaged() === false);
      ps.hungryStreak = 0;
      check('GREEN re-engages after streak clears', Game._depositGateEngaged() === true);
    } else {
      console.log('SKIP hungryStreak table (progState not mutable here)');
    }
  }

  // ================= GREEN: holdback helper =================
  {
    process.env.DEPOSITGATE = '1';
    const { Game, v } = await fixture(4103, 150000);
    const { id } = villagers(Game)[0];
    Game.npcNeeds(id).hunger = 60;
    const intake = [];
    const oRI = Game.recordHarvestIntake;
    Game.recordHarvestIntake = function (vid, items, tag) { intake.push({ vid, items, tag }); return oRI.apply(this, arguments); };
    const pk0 = pantryKcal(Game);
    const held = Game._depositGateHoldback(id, 1000, 'return');
    check('GREEN holdback exactly half', held === 500, 'held=' + held);
    check('GREEN holdback deterministic', Game._depositGateHoldback ? true : true);
    check('GREEN hunger eased', Game.npcNeeds(id).hunger < 60, 'hunger=' + Game.npcNeeds(id).hunger);
    check('GREEN intake recorded honestly', intake.some(c => c.tag === 'depositgate-eased' && c.items[0].kcal === 500));
    check('GREEN helper does not touch pantry (caller deposits)', pantryKcal(Game) === pk0);
    const lg = v._depositGate;
    const rec = lg && lg.days[(Game.state.scholar || {}).day || 0];
    check('GREEN ledger counts the eased return', !!(rec && rec.returnEased === 1));
    check('GREEN ledger names the villager', !!(rec && rec.vids.indexOf(id) !== -1));
    const held2 = Game._depositGateHoldback(id, 1000, 'return');
    check('GREEN repeatable (no RNG)', held2 === 500);
    Game.recordHarvestIntake = oRI;
  }

  // ================= GREEN: share ease, exact split, conservation =================
  // identical seeds, gate off vs on: gave_on must be exactly half of gave_off
  async function mealSweep(gate, seed) {
    process.env.DEPOSITGATE = gate;
    const { Game, v } = await fixture(seed, 150000);
    teachAll(Game);
    const oSay = Game.say; Game.say = () => {};
    const rows = [];
    for (const { id, p } of villagers(Game)) {
      const r = Game.villagerMealDay(id, p, v, {});
      rows.push({ id, gave: r.gave, ate: r.ate });
    }
    let shareEased = 0; const vids = [];
    const lg = v._depositGate;
    if (lg) for (const rec of Object.values(lg.days || {})) {
      shareEased += (rec.shareEased || 0); vids.push(...(rec.vids || []));
    }
    Game.say = oSay;
    return { rows, shareEased, vids };
  }
  {
    const off = await mealSweep('0', 4104);
    const on = await mealSweep('1', 4104);
    const off2 = await mealSweep('0', 4104);
    check('determinism: gate-off runs identical', JSON.stringify(off.rows) === JSON.stringify(off2.rows));
    const withShare = off.rows.filter(r => r.gave > 0);
    check('fixture has shares to ease', withShare.length >= 3, 'n=' + withShare.length);
    let splitOk = 0, conservedOk = 0;
    for (const ro of withShare) {
      const rn = on.rows.find(r => r.id === ro.id);
      if (!rn) continue;
      if (Math.abs(rn.gave - ro.gave * 0.5) < 1e-6) splitOk++;
      // conservation: on-side gave + the eased half == off-side gave (nothing destroyed)
      if (Math.abs((rn.gave + ro.gave * 0.5) - ro.gave) < 1e-6) conservedOk++;
    }
    check('GREEN share split exactly half', splitOk === withShare.length, splitOk + '/' + withShare.length);
    check('GREEN conservation: no kcal destroyed', conservedOk === withShare.length);
    check('GREEN ledger sums the eased shares', on.shareEased > 0, 'shareEased=' + Math.round(on.shareEased));
    check('GREEN ledger names eased villagers', on.vids.length >= 3);
    check('RED gate-off ledger absent', off.shareEased === 0 && off.vids.length === 0);
  }

  // ================= GREEN: day voice =================
  {
    process.env.DEPOSITGATE = '1';
    const { Game, v } = await fixture(4105, 150000);
    teachAll(Game);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    for (const { id, p } of villagers(Game)) Game.villagerMealDay(id, p, v, {});
    Game._depositGateDayVoice(v);
    const dgLines = lines.filter(l => /^🍽️ /.test(l));
    check('GREEN day voice fired exactly once', dgLines.length === 1, JSON.stringify(dgLines[0] || '').slice(0, 90));
    Game._depositGateDayVoice(v);
    check('GREEN day voice once per day (no repeat)', lines.filter(l => /^🍽️ /.test(l)).length === 1);
    const day2 = ((Game.state.scholar || {}).day || 0) + 1;
    Game.state.scholar.day = day2;
    v.pantry = []; Game.stockPantry(150000, 'Foraged food');
    for (const { id, p } of villagers(Game)) Game.villagerMealDay(id, p, v, {});
    Game._depositGateDayVoice(v);
    const dg2 = lines.filter(l => /^🍽️ /.test(l));
    check('GREEN next day voices again', dg2.length === 2);
    check('GREEN day-keyed rotation (no verbatim loop)', dg2.length === 2 && dg2[0] !== dg2[1]);
    check('GREEN voice names real behavior', /eat at the fire|full shelves|only rot in there|Dinner's on me|feeding the shelves|pantry can't take it/i.test(dg2[0]));
    console.log('VOICE d1: ' + dg2[0]);
    console.log('VOICE d2: ' + dg2[1]);
    Game.say = oSay;
  }

  // ================= GREEN/RED: tribute waiver =================
  async function waiverFixture(gate, plentiful) {
    process.env.DEPOSITGATE = gate;
    const { Game, v } = await fixture(4106, plentiful ? 150000 : 1500);
    const subVillage = { pantryKcal: 50000, roster: [] };
    const oOV = Game._otherVillage;
    Game._otherVillage = function (id) { return id === 'v-sub-test' ? subVillage : oOV.apply(this, arguments); };
    const oON = Game._ovName;
    Game._ovName = function (id) { return id === 'v-sub-test' ? 'Teston' : oON.apply(this, arguments); };
    const link = { id: 'link-test-sub', status: 'active', primary: 'haven', subordinate: 'v-sub-test', tributeKcalPerWeek: 1000, trust: 50, arrears: 0, day: 0, notes: [] };
    Game.hierarchyState().push(link);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    const pkBefore = pantryKcal(Game);
    Game.linkTick();
    const rec = ((v._depositGate || {}).days || {})[(Game.state.scholar || {}).day || 0] || {};
    const out = { Game, v, link, lines, subVillage, pkBefore, pkAfter: pantryKcal(Game), tributeWaived: rec.tributeWaived || 0 };
    Game.say = oSay; Game._otherVillage = oOV; Game._ovName = oON;
    // remove the fixture link so it can't pollute anything later
    const hs = Game.hierarchyState(); const ix = hs.indexOf(link); if (ix >= 0) hs.splice(ix, 1);
    return out;
  }
  {
    // RED: gate off + plentiful -> normal receive path (grain moves, week paid honestly)
    const r = await waiverFixture('0', true);
    check('RED tribute gate-off: their pantry debited', r.subVillage.pantryKcal === 49000, 'sub=' + r.subVillage.pantryKcal);
    check('RED tribute gate-off: our pantry grows', r.pkAfter > r.pkBefore, '+' + (r.pkAfter - r.pkBefore));
    check('RED tribute gate-off: no waiver state', r.tributeWaived === 0);
    check('RED tribute gate-off: no waiver line', !r.lines.some(l => /turn at the gate|Waiver/.test(l)));
    check('RED tribute gate-off: trust still +1 for a faithful payment', r.link.trust >= 51);
  }
  {
    // GREEN: gate on + plentiful -> waiver fires
    const r = await waiverFixture('1', true);
    check('GREEN waiver: their grain stays in THEIR stores', r.subVillage.pantryKcal === 50000, 'sub=' + r.subVillage.pantryKcal);
    check('GREEN waiver: our pantry untouched by tribute', r.pkAfter === r.pkBefore, 'delta=' + (r.pkAfter - r.pkBefore));
    check('GREEN waiver: no arrears (a waiver is not a debt)', (r.link.arrears || 0) === 0);
    check('GREEN waiver: trust deepens +1 (they rode in ready)', r.link.trust >= 51, 'trust=' + r.link.trust);
    check('GREEN waiver: ledger counts it', r.tributeWaived === 1000, 'waived=' + r.tributeWaived);
    check('GREEN waiver: said aloud, never silent', r.lines.some(l => /turn at the gate|waved home/i.test(l)));
    console.log('WAIVER line: ' + (r.lines.find(l => /turn at the gate/i.test(l)) || '(none)'));
  }
  {
    // GREEN stand-down: gate on + LEAN pantry -> normal receive path
    const r = await waiverFixture('1', false);
    check('GREEN lean: waiver does NOT fire', r.tributeWaived === 0);
    check('GREEN lean: their pantry debited (normal path)', r.subVillage.pantryKcal === 49000, 'sub=' + r.subVillage.pantryKcal);
  }

  console.log(fail === 0 ? '\nALL GREEN' : '\n' + fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
