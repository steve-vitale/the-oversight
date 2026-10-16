#!/usr/bin/env node
// test-racksmoke-20261016.js — proof for scripts/policies/racksmoke.js
// (flesh-out loop B, 2026-10-16, finding #50's named next: the RACK-side
// scholar smoke arm).
//
// RED->GREEN on the layer:
//   C1 gate honesty: RACKSMOKE unset -> tendRacks returns 0 on a rich
//      fabricated state (pure delegation; the RED phase of the gate).
//   C2 the dawn beat fires: no cook assigned, about-to-spoil pantry meat,
//      scholar home at dawn with a fire -> take->smoke->donate runs the
//      real verbs: pantry units move to the pack (takes ledgered), the
//      stack smokes (0.80x rough, teaches 'preserve' — the #50 channel),
//      the smoked stack is donated back (gives ledgered). ctx.rackSmokes>=1.
//   C3 dinner-first: a single about-to-spoil meat stack inside the
//      250/person reserve stays in the pantry — the scholar never smokes
//      tonight's dinner.
//   C4 racks-full: preserved stock >= rackCap -> stand down (no fresh-rot
//      into preserved-rot).
//   C5 skilled cook: cook assigned with preserver skill>0 and pool <= 4000
//      kcal -> the scholar stands down (the cook's 0.95+/30+d wins).
//   C6 quality lane: blind cook + scholar who knows preserve -> the scholar
//      works the meat pool (solid 0.95x beats blind 0.80x).
//   C7 trust ledger: gave>0 and the take would push net<=0 -> no take
//      (the REVOKE wound is never worth the racks).
//   C8 once-per-day: a second dawn call the same day returns 0.
//   C9 det-gate (real harness): gate-off byte-identical to the parent
//      policy (2 seeds, 60d); gate-on deterministic (identical armed 60d
//      byte-identical); gate-ON non-vacuous on a fabricated rich state.
//   C10 SMOKE: 15d real-harness runs both sides complete; layer-live
//      markers honest (racksmokeOn true iff RACKSMOKE=1); expected ids.
// Usage: node scripts/test-racksmoke-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (RACKSMOKE_KILLED=1 set
// by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'racksmoke.js'))) {
  if (process.env.RACKSMOKE_KILLED === '1') {
    console.log('INFO-SKIP: racksmoke layer deleted per kill protocol (sim-racksmoke PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/racksmoke.js missing and RACKSMOKE_KILLED not set.');
  process.exit(1);
}

const RS = require('./policies/racksmoke');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fabricated Game with honest verb contracts ----------
// takeFromPantry: one unit pantry->pack (merge-if-same), takes ledgered.
// preserveFood(idx): whole stack -> preserved (0.80x rough, spoilDay day+15
//   unless taught), teaches 'preserve' on first smoke (canon: the attempt
//   teaches). donateToPantry(idx): pack stack -> pantry, gives ledgered.
function stubGame(o) {
  o = o || {};
  const day = (o.day == null ? 100 : o.day);
  const pantry = (o.pantry || []).map(it => Object.assign({}, it));
  const G = {
    dayPart: o.dayPart == null ? 0 : o.dayPart,
    over: false,
    state: {
      scholar: Object.assign({
        day, villagerId: 'scholar1',
        inventory: (o.pack || []).map(it => Object.assign({}, it)),
      }, o.scholar || {}),
      village: Object.assign({
        pantry,
        roster: o.roster || ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12'],
        assignments: o.assignments || {},
        trust: {}, takes: o.takes || {}, gives: o.gives || {},
      }, o.village || {}),
    },
    techniques: Object.assign({}, o.techniques || {}),
    said: [],
    say(msg) { G.said.push(String(msg)); },
    playerAtHaven: () => o.atHaven === undefined ? true : !!o.atHaven,
    nearFire: () => o.fire === undefined ? true : !!o.fire,
    isSpoiled: (it) => (it.spoilDay || 0) <= day,
    isKeepsake: () => false,
    knowsTechnique: (t) => !!G.techniques[t],
    learnTechnique: (t) => { G.techniques[t] = true; },
    specialistSkill: () => (o.cookSkill || 0),
    getPerson: () => ({}),
    takeFromPantry(idx) {
      const p = G.state.village.pantry;
      const item = p[idx];
      if (!item || (item.units || 0) <= 0) return null;
      item.units--;
      if (item.units <= 0) p.splice(idx, 1);
      const inv = G.state.scholar.inventory;
      const taken = { name: item.name, kcalEach: item.kcalEach, units: 1, spoilDay: item.spoilDay, plantId: item.plantId, foodKind: item.foodKind, foodState: item.foodState, edible: item.edible };
      const ex = inv.find(i => i && i.name === taken.name && i.kcalEach === taken.kcalEach && i.foodState === taken.foodState && i.spoilDay === taken.spoilDay);
      if (ex) ex.units++; else inv.push(taken);
      const v = G.state.village, vid = G.state.scholar.villagerId;
      v.takes[vid] = (v.takes[vid] || 0) + (item.kcalEach || 0);
      G.say(`Took ${item.name}.`);
      return null;
    },
    preserveFood(idx) {
      const inv = G.state.scholar.inventory;
      const it = inv[idx];
      if (!it || it.foodKind !== 'meat' || !(it.foodState === 'cleaned' || it.foodState === 'cooked')) return null;
      const knows = G.knowsTechnique('preserve');
      const eff = knows ? 0.95 : 0.80;
      it.kcalEach = Math.round(it.kcalEach * eff);
      it.foodState = 'preserved';
      it.spoilDay = day + (knows ? 30 : 15);
      it.name = it.name + ' (smoked)';
      if (!knows) G.learnTechnique('preserve');
      G.say(`Smoked ${it.units} batch(es) over the fire.`);
      return null;
    },
    donateToPantry(idx) {
      const inv = G.state.scholar.inventory;
      const item = inv[idx];
      if (!item || (item.kcalEach || 0) <= 0) return null;
      inv.splice(idx, 1);
      G.state.village.pantry.push(item);
      const v = G.state.village, vid = G.state.scholar.villagerId;
      v.gives[vid] = (v.gives[vid] || 0) + (item.kcalEach || 0) * (item.units || 1);
      G.say(`Donated ${item.name} to the pantry.`);
      return null;
    },
  };
  return G;
}

function meatStack(units, kcalEach, spoilIn, extra) {
  return Object.assign({
    name: 'venison', kcalEach: kcalEach || 500, units: units || 2,
    spoilDay: 100 + spoilIn, plantId: 'meat_deer', foodKind: 'meat',
    foodState: 'cleaned', edible: true,
  }, extra || {});
}

console.log('== test-racksmoke-20261016 ==');
process.env.RACKSMOKE = '1';

// C1: gate honesty — unset gate = pure delegation on a rich state.
{
  delete process.env.RACKSMOKE;
  const g = stubGame({ pantry: [meatStack(4, 500, 1)] });
  const n = RS.tendRacks(g, {});
  check('C1: gate-off tendRacks returns 0 on a rich state', n === 0 && g.state.village.pantry.length === 1,
    `n=${n} pantry=${g.state.village.pantry.length}`);
  process.env.RACKSMOKE = '1';
}

// C2: the dawn beat fires — take->smoke->donate, teach channel opens.
{
  const g = stubGame({ pantry: [meatStack(8, 500, 1), meatStack(3, 400, 0)], gives: { scholar1: 20000 } });
  const ctx = {};
  const n = RS.tendRacks(g, ctx);
  const v = g.state.village;
  const smoked = v.pantry.filter(i => i && i.foodState === 'preserved');
  const smokedKcal = smoked.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  check('C2a: dawn beat fires preserve calls', n >= 1 && (ctx.rackSmokes || 0) >= 1,
    `preserveCalls=${n} ctx.rackSmokes=${ctx.rackSmokes}`);
  check('C2b: smoked stacks land back in the pantry', smoked.length >= 1 && smokedKcal > 0,
    `smokedStacks=${smoked.length} kcal=${smokedKcal}`);
  check('C2c: takes and gives both ledgered (no silent moves)', (v.takes.scholar1 || 0) > 0 && (v.gives.scholar1 || 0) > 20000,
    `takes=${v.takes.scholar1} gives=${v.gives.scholar1}`);
  check('C2d: self-trial teaches preserve (the #50 channel)', g.knowsTechnique('preserve') === true);
  check('C2e: the beat narrates', g.said.some(s => /smoke racks/i.test(s)), `lines=${g.said.length}`);
  check('C2f: scholar pack left clean (no stranded takes)', g.state.scholar.inventory.length === 0,
    `pack=${g.state.scholar.inventory.length}`);
}

// C3: dinner-first — reserve stays fresh.
{
  const g = stubGame({ pantry: [meatStack(2, 500, 1)] }); // 1000 kcal < 250*12 reserve
  const n = RS.tendRacks(g, {});
  check('C3: within-reserve meat stays in the pantry', n === 0 && g.state.village.pantry.length === 1 && g.state.village.pantry[0].foodState === 'cleaned',
    `n=${n}`);
}

// C4: racks-full stand-down.
{
  const pantry = [meatStack(6, 500, 1)];
  for (let i = 0; i < 20; i++) pantry.push({ name: 'smoked fish', kcalEach: 400, units: 10, spoilDay: 200, foodKind: 'meat', foodState: 'preserved', edible: true });
  const g = stubGame({ pantry, gives: { scholar1: 20000 } });
  const ctx = {};
  const n = RS.tendRacks(g, ctx);
  check('C4: racks-full stands down', n === 0 && (ctx._rackStoodDown || 0) === 1 && g.state.village.pantry.filter(i => i.foodState === 'preserved').length === 20,
    `n=${n} stoodDown=${ctx._rackStoodDown}`);
}

// C5: skilled cook owns a small pool.
{
  const g = stubGame({
    pantry: [meatStack(8, 500, 1)], // 4000 kcal; 1000 beyond reserve, <= 4000 budget
    assignments: { v1: { task: 'cook' } }, cookSkill: 2,
    gives: { scholar1: 20000 },
  });
  const ctx = {};
  const n = RS.tendRacks(g, ctx);
  check('C5: skilled cook + small pool -> scholar stands down', n === 0 && g.state.village.pantry[0].foodState === 'cleaned',
    `n=${n}`);
}

// C6: quality lane — blind cook + knowing scholar works the meat.
{
  const g = stubGame({
    pantry: [meatStack(10, 500, 1)], // 5000 kcal; 2000 beyond reserve, within cook budget
    assignments: { v1: { task: 'cook' } }, cookSkill: 0,
    techniques: { preserve: true },
    gives: { scholar1: 20000 },
  });
  const ctx = {};
  const n = RS.tendRacks(g, ctx);
  const smoked = g.state.village.pantry.filter(i => i && i.foodState === 'preserved');
  check('C6: blind cook + knowing scholar -> scholar works (quality lane)', n >= 1 && smoked.length >= 1,
    `n=${n} smoked=${smoked.length}`);
  // solid rate: 500*0.95 = 475
  check('C6b: solid rate applied (0.95x)', smoked.length > 0 && smoked[0].kcalEach === 475, `kcalEach=${smoked[0] && smoked[0].kcalEach}`);
}

// C7: trust ledger — never trip the REVOKE.
{
  const g = stubGame({
    pantry: [meatStack(10, 500, 1)],
    gives: { scholar1: 1000 }, takes: { scholar1: 900 }, // net 100; a 500-kcal take would push net<=0
  });
  const n = RS.tendRacks(g, {});
  check('C7: take that would push net<=0 is refused', n === 0 && g.state.village.pantry.length === 1,
    `n=${n} takes=${g.state.village.takes.scholar1}`);
}

// C8: once per day.
{
  const g = stubGame({ pantry: [meatStack(10, 500, 1)], gives: { scholar1: 20000 } });
  const ctx = {};
  const n1 = RS.tendRacks(g, ctx);
  const n2 = RS.tendRacks(g, ctx);
  check('C8: one dawn beat per day', n1 >= 1 && n2 === 0, `n1=${n1} n2=${n2}`);
}

// C9: det-gate + C10: SMOKE (real harness).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { belongfeast, leadfeast } = require('./policies/feastscale');
  async function trajectory(seed, envOn, policyObj, days) {
    if (envOn) process.env.RACKSMOKE = '1'; else delete process.env.RACKSMOKE;
    const { Game } = await loadGame({ seed, mode: 'racksmoke-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const policy = Object.assign({}, policyObj);
    const oDaily = policyObj.daily;
    policy.daily = (G, ctx) => {
      let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(103, false, RS.belongfeastRacksmoke);
  const tOff2 = await trajectory(103, false, belongfeast);
  check('C9a det-gate: gate-off byte-identical to parent (s103, 60d)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(215, false, RS.leadfeastRacksmoke);
  const tOff4 = await trajectory(215, false, leadfeast);
  check('C9b det-gate: gate-off byte-identical to parent (s215, 60d, lead)',
    tOff3 === tOff4 && tOff3.length > 0);
  const tOn1 = await trajectory(103, true, RS.belongfeastRacksmoke);
  const tOn2 = await trajectory(103, true, RS.belongfeastRacksmoke);
  check('C9c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2 && tOn1.length > 0);
  // non-vacuity on a fabricated rich state (the w5reach3 det-vacuity lesson)
  process.env.RACKSMOKE = '1';
  const gOn = stubGame({ pantry: [meatStack(10, 500, 1)], gives: { scholar1: 20000 } });
  const nOn = RS.tendRacks(gOn, {});
  delete process.env.RACKSMOKE;
  const gOff = stubGame({ pantry: [meatStack(10, 500, 1)], gives: { scholar1: 20000 } });
  const nOff = RS.tendRacks(gOff, {});
  check('C9d det-gate: gate-ON genuinely moves the trajectory (non-vacuous)',
    nOn >= 1 && nOff === 0, `on=${nOn} off=${nOff}`);

  // C10: SMOKE — 15d real-harness runs, markers honest.
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.RACKSMOKE = '1'; else delete process.env.RACKSMOKE;
    const { Game } = await loadGame({ seed: 103, mode: `racksmoke-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, rsLive = null;
    const base = side === 'armed' ? RS.belongfeastRacksmoke : belongfeast;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { ctxLive = ctx; rsLive = RS.racksmokeOn(); if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live marker honest`, rsLive === (side === 'armed'), `rs=${rsLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === (side === 'armed' ? 'belongfeast-racksmoke' : 'belongfeast'), base.id);
  }
  delete process.env.RACKSMOKE;

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
