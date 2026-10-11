#!/usr/bin/env node
// test-village-smoke-20261011.js — proof for the village smoke technique
// (longsim food lever 2026-10-11): a cook on duty preserves the pantry's
// TRUE fresh surplus at the specialist/blind rate. DINNER-FIRST: ~2 days of
// village draw (soonest-spoiling) stays fresh — the cook never smokes
// tonight's dinner at 0.80x. Throughput caps at ~4000 kcal per cook per
// part. Energy is never created.
// Usage: node scripts/test-village-smoke-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', label); }
};

// A TRUE surplus: far more fresh than 2 days of village draw (~48k for 12).
function bigSurplus(Game, day, n, kcalEach) {
  const v = Game.state.village;
  v.pantry = [];
  for (let i = 0; i < n; i++) {
    v.pantry.push({
      name: i % 2 ? 'Fish catch' : 'Foraged food',
      kcalEach, units: 1, spoilDay: day + (i % 3), safe: true, // sd-day 0..2
    });
  }
}

function setCook(Game, occupation) {
  const vid = Game.state.village.roster.find(id => id !== Game.villagerId);
  Game.getPerson(vid).formerOccupation = occupation;
  return vid;
}

async function main() {
  // --- CASE 1: fisherman cook (preserver 3), true surplus -> specialist rate
  {
    const { Game } = await loadGame({ seed: 4242, mode: 'village-smoke' });
    await setupGame(Game);
    const day = Game.state.scholar.day || 1;
    bigSurplus(Game, day, 120, 500); // 60k fresh, reserve ~48k -> excess hits racks
    const vid = setCook(Game, 'fisherman');
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const p = Game.state.village.pantry;
    const smoked = p.filter(i => /\(smoked\)/.test(i.name));
    const dried = p.filter(i => /\(dried\)/.test(i.name));
    ok(smoked.length + dried.length > 0, 'true surplus gets preserved');
    const one = smoked[0] || dried[0];
    ok(one && one.foodState === 'preserved', 'foodState preserved');
    ok(one && one.kcalEach === 500, 'skill-3: 1.0x cap, wastes nothing (got ' + (one && one.kcalEach) + ')');
    ok(one && one.spoilDay === day + 45, 'skill-3: 45d shelf (got ' + (one && one.spoilDay) + ')');
    ok(smoked.length > 0 && dried.length > 0, 'fish smokes AND plants dry');
    const kept = p.filter(i => i.foodState === 'preserved').reduce((t, i) => t + i.kcalEach * i.units, 0);
    ok(kept <= 4000 && kept >= 3500, `throughput ~4000/cook/part (kept ${kept})`);
    // dinner-first: the soonest-spoiling (sd-day 0) stays fresh
    const dinnerFresh = p.filter(i => !i.foodState && i.spoilDay - day <= 0)
      .reduce((t, i) => t + i.kcalEach * i.units, 0);
    ok(dinnerFresh > 0, `tonight's dinner stays fresh (${dinnerFresh} kcal untouched)`);
    const before = 120 * 500;
    const after = p.reduce((t, i) => t + i.kcalEach * i.units, 0);
    ok(after <= before, `no calorie creation (${before} -> ${after})`);
  }
  // --- CASE 2: unskilled cook, true surplus -> rough job (blind parity)
  {
    const { Game } = await loadGame({ seed: 777, mode: 'village-smoke' });
    await setupGame(Game);
    const day = Game.state.scholar.day || 1;
    bigSurplus(Game, day, 120, 500);
    const vid = setCook(Game, 'accountant');
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const p = Game.state.village.pantry;
    const one = p.find(i => i.foodState === 'preserved');
    ok(!!one, 'unskilled cook still preserves the true surplus');
    ok(one && one.kcalEach === 400, 'rough job 0.80x (got ' + (one && one.kcalEach) + ')');
    ok(one && one.spoilDay === day + 15, 'rough job 15d shelf (got ' + (one && one.spoilDay) + ')');
    ok(one && !one.wellMade, 'rough job is not wellMade');
  }
  // --- CASE 3: dinner protection — small fresh pile, efficient village
  {
    const { Game } = await loadGame({ seed: 31, mode: 'village-smoke' });
    await setupGame(Game);
    const day = Game.state.scholar.day || 1;
    const v = Game.state.village;
    v.pantry = [
      { name: 'Fish catch', kcalEach: 500, units: 4, spoilDay: day + 1, safe: true }, // 2000, within reserve
      { name: 'Canned soup', kcalEach: 250, units: 4, spoilDay: day + 366, safe: true },
    ];
    const vid = setCook(Game, 'fisherman');
    Game.resolveOneAssignment(vid, { task: 'cook' });
    ok(v.pantry.every(i => !i.foodState), 'no true surplus -> nothing preserved (dinner protected)');
    ok((v.gives[vid] || 0) > 0, 'haven credit still lands');
  }
  // --- CASE 4: staples and already-preserved are never touched
  {
    const { Game } = await loadGame({ seed: 55, mode: 'village-smoke' });
    await setupGame(Game);
    const day = Game.state.scholar.day || 1;
    const v = Game.state.village;
    v.pantry = [
      { name: 'Rice', kcalEach: 200, units: 65, spoilDay: day + 366, safe: true },
      { name: 'Old smoked meat', kcalEach: 400, units: 2, spoilDay: day + 20, safe: true, foodState: 'preserved' },
    ];
    // force a tiny reserve so the surplus logic would otherwise fire
    for (const rid of v.roster) { try { Game.getPerson(rid).kcalPerDay = 10; } catch (e) {} }
    bigSurplus(Game, day, 0, 500); // clears pantry — re-add staples below
    v.pantry.push(
      { name: 'Rice', kcalEach: 200, units: 65, spoilDay: day + 366, safe: true },
      { name: 'Old smoked meat', kcalEach: 400, units: 2, spoilDay: day + 20, safe: true, foodState: 'preserved' },
      { name: 'Fish catch', kcalEach: 500, units: 60, spoilDay: day + 1, safe: true },
    );
    const vid = setCook(Game, 'chef');
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const rice = v.pantry.find(i => i.name === 'Rice');
    const old = v.pantry.find(i => /Old smoked/.test(i.name));
    ok(rice && !rice.foodState && rice.spoilDay === day + 366, 'long-shelf staple untouched');
    ok(old && old.spoilDay === day + 20, 'already-preserved untouched');
    ok(v.pantry.some(i => /Fish catch \(smoked\)/.test(i.name)), 'fresh fish still preserved');
  }
  // --- CASE 5: racks-full — preserved stockpile above the cook's cap: no smoking
  {
    const { Game } = await loadGame({ seed: 4243, mode: 'village-smoke' });
    await setupGame(Game);
    const said = [];
    const origSay = Game.say; Game.say = (m) => said.push(String(m));
    const day = Game.state.scholar.day || 1;
    const v = Game.state.village;
    v.pantry = [];
    // unskilled cap: 125 x roster x 13 — pre-stock ABOVE it
    const rosterN = (v.roster || []).length || 10;
    const cap = 125 * rosterN * 13;
    v.pantry.push({ name: 'Pre-stocked dried meat', kcalEach: 500, units: Math.ceil((cap + 5000) / 500), spoilDay: day + 10, safe: true, foodState: 'preserved' });
    const prePreserved = v.pantry.filter(i => i.foodState === 'preserved').length;
    // fresh surplus that WOULD have been smoked
    for (let i = 0; i < 40; i++) v.pantry.push({ name: 'Fish catch', kcalEach: 500, units: 1, spoilDay: day + 1, safe: true });
    const vid = setCook(Game, 'accountant'); // unskilled: 0.80x/15d
    Game.resolveOneAssignment(vid, { task: 'cook' });
    Game.say = origSay;
    const postPreserved = v.pantry.filter(i => i.foodState === 'preserved').length;
    ok(postPreserved === prePreserved, `racks full -> nothing new smoked (${prePreserved} -> ${postPreserved})`);
    ok(said.join(' ').indexOf('racks are already full') >= 0, 'the cook says the racks are full, honestly');
    ok(v.pantry.some(i => i.name === 'Fish catch' && !i.foodState), 'the fresh pile stays fresh for dinner, not smoked onto the rot pile');
  }
  // --- CASE 6: the cap is skill-aware — a preserver's racks hold more
  {
    const { Game } = await loadGame({ seed: 4244, mode: 'village-smoke' });
    await setupGame(Game);
    const day = Game.state.scholar.day || 1;
    const v = Game.state.village;
    v.pantry = [];
    const rosterN = (v.roster || []).length || 10;
    const unskilledCap = 125 * rosterN * 13;
    // stock above the UNSKILLED cap but below the skill-3 cap (125 x 12 x 43)
    v.pantry.push({ name: 'Pre-stocked dried meat', kcalEach: 500, units: Math.ceil((unskilledCap + 5000) / 500), spoilDay: day + 10, safe: true, foodState: 'preserved' });
    for (let i = 0; i < 40; i++) v.pantry.push({ name: 'Fish catch', kcalEach: 500, units: 1, spoilDay: day + 1, safe: true });
    const vid = setCook(Game, 'fisherman'); // preserver 3: cap ~64.5k for 12
    Game.resolveOneAssignment(vid, { task: 'cook' });
    ok(v.pantry.some(i => /Fish catch \(smoked\)/.test(i.name)), 'skilled cook still preserves below their own higher cap');
  }
  console.log(`village-smoke: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
