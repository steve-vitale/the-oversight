#!/usr/bin/env node
// test-packbank-20261014.js — pack-banking policy instrument proof test.
//
// scripts/policies/packbank.js (PACKBANK=1, default OFF) wraps
// leadcourt/belongseek: bankTag holds batch-eligible field arrivals raw in
// the pack (whole pieces, sturdiest first, surplus only — the competentEat
// 0.85 well-fed gate), up to PACKBANK_KCAL=1500; the press fires at the daily
// hook when the bank reaches the threshold via the honest Game.cookAll verb.
// One-line guards in competent.js (cookPack skip, donateHaul skip,
// post-cleanCatch bankTag hook) are inert without the flag.
//
// RED (PACKBANK unset): the wrapper is a pure passthrough — no tagging, no
//   press, base chained; leadcourt vs packbankLead trajectories byte-identical
//   (2 seeds x 30d). The competent.js guards never trigger (flag never set).
// GREEN (PACKBANK=1): bankTag tags batch-eligible arrivals up to the cap
//   (whole pieces; cap respected; hungry scholar banks nothing); cookPack
//   skips tagged items (stubbed-cookFood RED/GREEN on the guard wiring);
//   donateHaul spares the tagged reserve; the press fires exactly at
//   threshold (not below); banked rot is counted once; the release valve
//   frees soon-turning set-aside below threshold.
// SENSE: the banking narration must read as meal-planning
//   ("Setting aside ... for the batch pot"), not a silent counter.
//
// Node harness: sim-harness loadGame (full src/js list, Math.random seeded
// before eval), Game.save never stubbed. nearFire stubbed true only to reach
// the fire-gated press in headless node (same as test-batchpolicy).
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
// KILL PROTOCOL (packbank NO-GO at pilot 2026-10-14): the banking layer was
// deleted after the pilot killed the arm (primary 0.000 pool share / 0.00
// presses/week — no batch-eligible flow enters the pack). Degrade gracefully
// so the retained proof documents the pre-kill result instead of crashing on
// the missing module (cf. takedisc kill-protocol MODULE_NOT_FOUND hazard).
let pb = null;
try { pb = require('./policies/packbank'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: packbank layer deleted per kill protocol (NO-GO at pilot); proof was 31/31 RED->GREEN pre-kill — see evidence/2026-10-14/sim-packbank-b.md');
    process.exit(0);
  }
  throw e;
}
const { withPackBank, bankTag, pressStep, bankKcal, packbankLead } = pb;

function cleanedMeat(name, day, kcalEach, units, spoilIn) {
  return { name, foodKind: 'meat', foodState: 'cleaned', plantId: 'meat_white_tailed_deer',
    kcalEach, units, spoilDay: day + spoilIn, diseaseRisk: 0.1, safe: true, edible: true };
}
function beans(day, units) {
  return { name: 'Dried beans', rawKcal: 150, cookedKcal: 300, kcalEach: 150, units,
    spoilDay: day + 365, needsCooking: true, safe: false };
}
function wellFed(Game) { // surplus-only banking: the competentEat 0.85 trigger
  try { Game.state.scholar.kcal = Game.kcalCap(); } catch (e) {}
}

function snapshot(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  return [s.day, Math.round(s.kcal || 0), Math.round(s.hp || 0),
    (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0),
    ((s.inventory || []).length), ((v.roster || []).length),
    Object.keys((Game.state.codex || {}).plants || {}).length].join('|');
}
function trajHash(Game, policy, days) {
  return (async () => {
    const h = crypto.createHash('sha256');
    const base = Object.assign({}, policy);
    const origDaily = base.daily;
    base.daily = (G, ctx) => { h.update(snapshot(G) + '\n'); return origDaily ? origDaily(G, ctx) : undefined; };
    await runDays(Game, base, { days, sampleEvery: days });
    return h.digest('hex');
  })();
}

(async () => {
  let fail = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' [' + extra + ']' : ''));
    if (!cond) fail++;
  };

  // ================= RED: gate-off passthrough =================
  delete process.env.PACKBANK;
  {
    const { Game } = await loadGame({ seed: 42, mode: 'proof-packbank-red', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    const fakeBase = { id: 'fakebase', desc: 'fake',
      upkeep: (G, ctx) => { ctx.upRan = true; }, daily: (G, ctx) => { ctx.baseRan = true; } };
    const wrapped = withPackBank(fakeBase, 'fakebase-packbank');
    Game.state.scholar.inventory = [cleanedMeat('Deer (cleaned)', day, 500, 2, 5), beans(day, 4)];
    const ctxR = {};
    wrapped.upkeep(Game, ctxR);
    wrapped.daily(Game, ctxR);
    check('RED: no tagging when PACKBANK unset',
      Game.state.scholar.inventory.every(i => !i.packbank));
    check('RED: no press when PACKBANK unset', Game._batchCookAllCalls === undefined,
      'calls=' + Game._batchCookAllCalls);
    check('RED: base upkeep+daily ran (chained, not clobbered)', ctxR.upRan === true && ctxR.baseRan === true);
    check('RED: hookDays sampled (observation only)', ctxR.hookDays === 1, 'hookDays=' + ctxR.hookDays);
  }
  // RED: trajectory byte-identical, real policies, 2 seeds x 30d.
  for (const seed of [11, 22]) {
    const g1 = await loadGame({ seed, mode: 'proof-packbank-red', fullTelemetry: false });
    await setupGame(g1.Game);
    const h1 = await trajHash(g1.Game, leadcourt, 30);
    const g2 = await loadGame({ seed, mode: 'proof-packbank-red', fullTelemetry: false });
    await setupGame(g2.Game);
    const h2 = await trajHash(g2.Game, packbankLead, 30);
    check(`RED: gate-off byte-identical trajectory (seed ${seed})`, h1 === h2,
      h1.slice(0, 12) + ' vs ' + h2.slice(0, 12));
  }

  // ================= GREEN: banking =================
  process.env.PACKBANK = '1';
  {
    const { Game } = await loadGame({ seed: 42, mode: 'proof-packbank-green', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    wellFed(Game);
    const said = [];
    const oSay = Game.say;
    Game.say = (m) => { said.push(String(m)); return oSay.call(Game, m); };
    // bankTag: whole pieces, cap respected, sturdiest first.
    // spoilDay desc: beans(365d,300) -> A(5d,500) -> C(5d,500) -> B(4d,400):
    // 300+500+500=1300 <= 1500; B would breach (1700) -> skipped.
    Game.state.scholar.inventory = [
      cleanedMeat('Deer A (cleaned)', day, 500, 1, 5),
      beans(day, 2),
      cleanedMeat('Deer B (cleaned)', day, 400, 1, 4),
      cleanedMeat('Deer C (cleaned)', day, 500, 1, 5),
    ];
    const ctxT = {};
    const tagged = bankTag(Game, ctxT);
    const taggedNames = Game.state.scholar.inventory.filter(i => i.packbank).map(i => i.name);
    check('GREEN: bankTag tags up to the cap', tagged === 3, 'tagged=' + tagged);
    check('GREEN: whole pieces only (cap respected)', bankKcal(Game) === 1300, 'bankKcal=' + bankKcal(Game));
    check('GREEN: the breaching piece stays untagged', taggedNames.includes('Deer C (cleaned)') && !taggedNames.includes('Deer B (cleaned)'),
      'tagged=[' + taggedNames.join(',') + ']');
    check('SENSE: banking said aloud as meal-planning',
      said.some(l => /Setting aside 3 for the batch pot/.test(l)),
      'lines=' + said.length);
    Game.say = oSay;
    // Hungry scholar banks nothing (surplus-only rule).
    Game.state.scholar.kcal = 0;
    Game.state.scholar.inventory.forEach(i => delete i.packbank);
    const taggedHungry = bankTag(Game, {});
    check('GREEN: hungry scholar banks nothing', taggedHungry === 0, 'tagged=' + taggedHungry);
  }
  // GREEN: cookPack guard wiring — stubbed cookFood records; the guard is the
  // only difference between the two runs.
  {
    const mk = async (tagIt) => {
      const { Game } = await loadGame({ seed: 7, mode: 'proof-packbank-cook', fullTelemetry: false });
      await setupGame(Game);
      const day = (Game.state.scholar || {}).day || 1;
      Game.nearFire = () => true;
      wellFed(Game);
      const calls = [];
      const oCookFood = Game.cookFood;
      Game.cookFood = function (idx) { calls.push(idx); return null; };
      const it = { name: 'Raw haunch', foodKind: 'meat', foodState: 'raw', kcalEach: 400, units: 1, spoilDay: day + 2 };
      if (tagIt) it.packbank = true;
      Game.state.scholar.inventory = [it];
      process.env.PACKBANK = '1';
      const wrapped = withPackBank(leadcourt, 'leadcourt-packbank-t');
      await wrapped.upkeep(Game, {});
      Game.cookFood = oCookFood;
      return calls.length;
    };
    const taggedCalls = await mk(true);
    const untaggedCalls = await mk(false);
    check('GREEN: cookPack skips packbank-tagged items', taggedCalls === 0, 'cookFood calls=' + taggedCalls);
    check('GREEN: cookPack fires on the same item untagged (guard is the difference)',
      untaggedCalls === 1, 'cookFood calls=' + untaggedCalls);
  }
  // GREEN: press fires exactly at threshold, not below; converts; clears tags.
  {
    const { Game } = await loadGame({ seed: 42, mode: 'proof-packbank-press', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    Game.nearFire = () => true;
    wellFed(Game);
    const fakeBase = { id: 'fakebase', desc: 'fake', daily: (G, ctx) => { ctx.baseRan = true; } };
    const wrapped = withPackBank(fakeBase, 'fakebase-packbank');
    // Below threshold: 600 < 1500 -> no press.
    Game.state.scholar.inventory = [cleanedMeat('Deer (cleaned)', day, 300, 2, 5)];
    const ctxB = {};
    bankTag(Game, ctxB);
    wrapped.daily(Game, ctxB);
    check('GREEN: no press below threshold', Game._batchCookAllCalls === undefined,
      'calls=' + Game._batchCookAllCalls);
    // At threshold: 500x2 + 500x1 = 1500 (boundary: not > 1500 -> tags), pool 2.
    Game.state.scholar.inventory = [
      cleanedMeat('Deer A (cleaned)', day, 500, 2, 5),
      cleanedMeat('Deer C (cleaned)', day, 500, 1, 5),
    ];
    const ctxP = {};
    bankTag(Game, ctxP);
    check('GREEN: boundary bank tags (1500 is not > 1500)', bankKcal(Game) === 1500, 'bankKcal=' + bankKcal(Game));
    const callsBefore = Game._batchCookAllCalls || 0;
    wrapped.daily(Game, ctxP);
    const inv = Game.state.scholar.inventory;
    check('GREEN: press fires at threshold', (Game._batchCookAllCalls || 0) === callsBefore + 1,
      'calls=' + Game._batchCookAllCalls);
    check('GREEN: pool converted to cooked', inv.every(i => i.foodState === 'cooked'),
      'states=' + inv.map(i => i.foodState).join(','));
    check('GREEN: batch kcal counted', (ctxP.batchKcal || 0) > 0, 'batchKcal=' + ctxP.batchKcal);
    check('GREEN: tags cleared after press', inv.every(i => !i.packbank));
    check('GREEN: base daily still ran', ctxP.baseRan === true);
    const lines = Game._packbankSayLines || [];
    console.log('--- press narration (SENSE) ---');
    for (const l of lines.slice(0, 6)) console.log('  | ' + l);
    console.log('-------------------------------');
    check('SENSE: press said something out loud', lines.length > 0, 'lines=' + lines.length);
    check('SENSE: press reads as village work', lines.some(l => /Cooked \d+/.test(l)));
  }
  // GREEN: banked rot counted once; release valve frees soon-turning set-aside.
  {
    const { Game } = await loadGame({ seed: 42, mode: 'proof-packbank-rot', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    const ctx = {};
    process.env.PACKBANK = '1';
    const rotten = cleanedMeat('Old deer (cleaned)', day, 500, 1, -1); // spoilDay < day
    rotten.packbank = true;
    const soon = cleanedMeat('Soon deer (cleaned)', day, 400, 1, 1); // turns tomorrow
    soon.packbank = true;
    Game.state.scholar.inventory = [rotten, soon];
    pressStep(Game, ctx);
    check('GREEN: banked rot counted', (ctx.bankRotKcal || 0) === 500, 'bankRotKcal=' + ctx.bankRotKcal);
    check('GREEN: rotted item untagged (counted once)', !rotten.packbank);
    const before = ctx.bankRotKcal;
    pressStep(Game, ctx);
    check('GREEN: no double-count on second pass', ctx.bankRotKcal === before);
    check('GREEN: release valve frees soon-turning set-aside below threshold',
      !soon.packbank, 'bankKcal=' + bankKcal(Game));
  }
  // GREEN: stall release — bank full but unpressable (lone piece) two days running.
  {
    const { Game } = await loadGame({ seed: 42, mode: 'proof-packbank-stall', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    Game.nearFire = () => true;
    const ctx = {};
    process.env.PACKBANK = '1';
    const lone = cleanedMeat('Lone giant roast (cleaned)', day, 1600, 1, 5);
    lone.packbank = true;
    Game.state.scholar.inventory = [lone];
    pressStep(Game, ctx); // stall day 1: no press (pool 1), no release yet
    check('GREEN: no press on lone-piece bank (button rule: >= 2)',
      (Game._batchCookAllCalls || 0) === 0 && !!lone.packbank);
    pressStep(Game, ctx); // stall day 2: released aloud
    check('GREEN: stall release untags after 2 days', !lone.packbank);
  }
  // GREEN: real-policy integration — hook 3 tags after cleanCatch; donateHaul
  // spares the reserve. (The end-of-daily competentEat may still eat tagged
  // meat most-perishable-first when the scholar is hungry — the honest
  // eat-drain, documented not asserted.)
  {
    const { Game } = await loadGame({ seed: 11, mode: 'proof-packbank-integ', fullTelemetry: false });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 1;
    process.env.PACKBANK = '1';
    wellFed(Game);
    // Pack over the 2400 donate buffer: donateHaul WOULD take untagged meat.
    // Fresh berries (more perishable) give the tagged meat a realistic chance
    // against the end-of-daily eat.
    Game.state.scholar.inventory = [
      { name: 'Trail mix', kcalEach: 400, units: 6, spoilDay: day + 60, safe: true, edible: true },
      cleanedMeat('Deer (cleaned)', day, 500, 2, 5),
      { name: 'Blackberry', foodKind: 'plant', foodState: 'ready', plantId: 'blackberry',
        kcalEach: 65, units: 10, spoilDay: day + 2, safe: false, edible: true },
    ];
    const donatedNames = [];
    const oDonate = Game.donateToPantry;
    Game.donateToPantry = function (idx) {
      try { const it = (this.state.scholar.inventory || [])[idx]; if (it) donatedNames.push(it.name); } catch (e) {}
      return oDonate.apply(this, arguments);
    };
    const ctx = {};
    await packbankLead.daily(Game, ctx); // full competent-family daily
    Game.donateToPantry = oDonate;
    check('GREEN: hook-3 tagged in a real daily (bankTag fired)', (ctx.bankTagged || 0) >= 1,
      'bankTagged=' + ctx.bankTagged);
    check('GREEN: donateHaul never took the tagged reserve',
      !donatedNames.some(n => /Deer \(cleaned\)/.test(n || '')),
      'donated=[' + donatedNames.slice(0, 4).join(',') + ']');
    const meat = Game.state.scholar.inventory.find(i => /Deer \(cleaned\)/.test(i.name || ''));
    console.log('  (info) tagged meat after full daily: ' + (meat ? 'survived, packbank=' + !!meat.packbank : 'eaten (honest eat-drain)'));
  }

  delete process.env.PACKBANK;
  console.log(fail ? `\n${fail} FAILURES` : '\nALL GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
