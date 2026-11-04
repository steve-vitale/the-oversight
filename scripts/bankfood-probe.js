#!/usr/bin/env node
// bankfood-probe.js — DIRECT overnight-pack probe (diagnostic, NOT a judged
// sim). Places known-edible food in the canonical pack, then advances
// through the night exactly as the harness does (Game.sleep(); if sleep
// refuses, doAction('wait') ticks to the day roll), snapshotting canonical
// pack kcal + scholar kcal at each stage. Answers: does the ENGINE take
// pack food overnight, or does the loss live on the stack/harness path?
//
// Usage: node scripts/bankfood-probe.js [seed]
// Output: one JSON object per stage, plus a verdict block per variant.
// No policy runs here; no game code is touched; no clock is set — the
// late variant reaches the bank-evening clock band (dayTicks >= 449) by
// honest waits only.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

function packSnap(Game) {
  const inv = ((Game.state || {}).scholar || {}).inventory || [];
  const stacks = inv.map((it) => ({
    name: it.name || null, units: it.units || 0, kcalEach: it.kcalEach || 0,
    spoilDay: (it.spoilDay === undefined ? null : it.spoilDay),
    edible: (it.edible === undefined ? null : !!it.edible),
    foodState: it.foodState || null,
  }));
  const edibleKcal = inv.reduce((t, it) => t + ((it.edible === false ? 0 : (it.kcalEach || 0)) * (it.units || 0)), 0);
  const grossKcal = inv.reduce((t, it) => t + ((it.kcalEach || 0) * (it.units || 0)), 0);
  return { stacks, edibleKcal, grossKcal };
}
function snap(Game, stage) {
  const sch = (Game.state || {}).scholar || {};
  const p = packSnap(Game);
  return { stage, day: sch.day || 0, dayTicks: sch.dayTicks || 0,
    scholarKcal: Math.round(sch.kcal || 0), over: !!Game.over,
    packEdibleKcal: p.edibleKcal, packGrossKcal: p.grossKcal,
    stacks: p.stacks.filter((s) => (s.units || 0) > 0) };
}
function inject(Game) {
  const sch = Game.state.scholar;
  const day = sch.day || 0;
  // Fresh evening bank, mimicking a known-edible forage haul: 720 kcal
  // edible-now (18 x 40) + an in-shell nut stack (0 edible kcal, must NOT
  // count toward edible pack kcal). spoilDay = day + 2 (foodForageItem).
  sch.inventory.push({ plantId: 'muscadine_grape', foodKind: 'plant',
    foodState: 'raw', edible: true, units: 18, unit: 'bunch', kcalEach: 40,
    spoilDay: day + 2, name: 'Muscadine Grapes', kg: 0.1 });
  sch.inventory.push({ plantId: 'hickory_nut', foodKind: 'nut',
    foodState: 'in_shell', edible: false, units: 8, unit: 'handful',
    kcalEach: 0, hiddenKcal: 100, spoilDay: day + 60,
    name: 'Hickory Nuts (in shell)', kg: 0.1 });
}
async function variant(seed, late) {
  const { Game } = await loadGame({ seed, mode: 'bankfood-probe', fullTelemetry: false });
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { sayLines.push(String(args[0] || '').slice(0, 300)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  const out = [];
  if (late) {
    // Honest waits to the bank-evening clock band (dayTicks >= 449).
    let guard = 0;
    while (((Game.state.scholar || {}).dayTicks || 0) < 449 && guard++ < 12 && !Game.over) {
      try { Game.doAction('wait'); } catch (e) { out.push({ stage: 'wait-error', error: String(e && e.message).slice(0, 120) }); break; }
    }
  }
  inject(Game);
  out.push(snap(Game, late ? 'late:pre-sleep' : 'early:pre-sleep'));
  let sleepRet = null, sleepErr = null;
  try { sleepRet = Game.sleep(); } catch (e) { sleepErr = String(e && e.message).slice(0, 160); }
  out.push(Object.assign(snap(Game, late ? 'late:post-sleep' : 'early:post-sleep'),
    { sleepErr, sleptThrough: (Game.state.scholar || {}).day !== out[0].day }));
  // If sleep refused (late band), wait to the day roll, snapshotting each wait.
  if (!out[out.length - 1].sleptThrough && !Game.over) {
    let guard = 0;
    while (((Game.state.scholar || {}).day || 0) === out[0].day && guard++ < 12) {
      try { Game.doAction('wait'); } catch (e) { break; }
      out.push(snap(Game, 'late:post-wait-' + guard));
      if (Game.over) break;
    }
  }
  // One upkeep cycle (the strand arms' morning snapshot sits AFTER 3
  // upkeep eats — here one suffices to test whether upkeep eats pack).
  if (!Game.over) {
    try { competent.upkeep(Game, {}); } catch (e) { out.push({ stage: 'upkeep-error', error: String(e && e.message).slice(0, 160) }); }
    out.push(snap(Game, 'post-upkeep'));
  }
  // Morning pack-eat capability: can Game.eat() take the banked food now?
  if (!Game.over) {
    const before = snap(Game, 'pre-eat');
    let eatErr = null;
    try { Game.eat(); } catch (e) { eatErr = String(e && e.message).slice(0, 160); }
    out.push(Object.assign(snap(Game, 'post-eat'), { eatErr, preEatPack: before.packEdibleKcal }));
  }
  const spoilLines = sayLines.filter((l) => /went bad|spoiled|flies/i.test(l));
  return { variant: late ? 'late-sleep-refused-band' : 'early-sleep-normal',
    seed, stages: out, spoilLines: spoilLines.slice(0, 5) };
}

(async () => {
  const seed = parseInt(process.argv[2] || '15215', 10);
  const early = await variant(seed, false);
  console.log(JSON.stringify(early, null, 1));
  const late = await variant(seed, true);
  console.log(JSON.stringify(late, null, 1));
  // Verdict block: pack survival across the night in each variant.
  const verdict = {};
  for (const v of [early, late]) {
    const pre = v.stages.find((s) => /pre-sleep/.test(s.stage));
    const postNight = v.stages.find((s) => /post-sleep|post-wait/.test(s.stage) && s.day !== (pre && pre.day));
    const firstPostNight = postNight || v.stages.find((s) => /post-sleep/.test(s.stage));
    verdict[v.variant] = {
      preSleepPackEdible: pre ? pre.packEdibleKcal : null,
      firstPostNightPackEdible: firstPostNight ? firstPostNight.packEdibleKcal : null,
      firstPostNightScholarKcal: firstPostNight ? firstPostNight.scholarKcal : null,
      packSurvivedNight: !!(pre && firstPostNight && firstPostNight.packEdibleKcal === pre.packEdibleKcal),
      packVanishedWithScholarZero: !!(pre && firstPostNight && firstPostNight.packEdibleKcal === 0 && firstPostNight.scholarKcal === 0),
    };
  }
  console.log('BANKFOOD-PROBE-VERDICT ' + JSON.stringify(verdict));
})().catch((e) => { console.error('BANKFOOD-PROBE CRASH', e && (e.stack || e)); process.exit(2); });
