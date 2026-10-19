#!/usr/bin/env node
// scripts/test-trustgain-20261014.js — TRUST-GAIN CENSUS PROOF (2026-10-14).
//
// The r31 trust-gain arm is DIAGNOSTIC (zero game-code changes), so the proof
// is an INSTRUMENT proof with a real RED phase: the census must be SILENT
// when nothing happens (RED: any phantom row fails the suite) and must
// catch each channel's write with the right caller/channel and delta
// (GREEN). Then GREEN on honest runs: a real sim completes with a ranked
// census.
//
// RED tests (FAIL if the instrument hallucinates or mis-attributes):
//   R1  fresh census, no acts            -> zero writes, zero progressive rows
//   R2  bumpTrust(+5,'proof-gift')       -> one gain row, delta>0
//   R3  bumpTrust(-3,'proof-confront')    -> one drain row, delta<0
//   R4  donateToPantry(idx, 1200 kcal)    -> channel gain:donate-unload, delta>0
//   R5  takeFromPantry, hostile ledger    -> channel drain:pantry-take-sting, delta -2
//   R6  comfort(grieving villager)        -> channel gain:grief-comfort, delta>0
//   R7  giveFood(villager, food in inv)   -> channel gain:food-deed, delta>0
//   R8  applyRep(vid,{kind:5},1)          -> channel gain:rep-drift, delta>0
//   R9  _trustGain(link,5)                -> linkGains row, applied 5 (link currency)
//   R10 makeAmends path via bumpTrust     -> write row present (reason captured)
// GREEN (honest run): seed 11 leadcourt 20d -> writes>0, ranked table non-empty,
//   scholar lineage sampled every day, per-100vd computable.
//
// Usage: node scripts/test-trustgain-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus, rankChannels, classifyWrite } = require('./trustgain-20261014');
const { leadcourt } = require('./policies/leadcourt');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function lastWriteFor(census, vid, caller) {
  const rows = census.writes.filter(w => w.vid === String(vid) && (!caller || w.caller === caller));
  return rows[rows.length - 1];
}

async function main() {
  ok('actual haul-arrival caller has an exact physical-work channel', classifyWrite({caller:'mapmemHaulAt',delta:1}) === 'gain:haul-deed');
  const { Game } = await loadGame({ seed: 4242, mode: 'trustgain-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const vid = Game.villagerId;
  const other = (v.roster || []).find(id => id !== vid);
  if (!other) { console.log('  FAIL setup: no second villager'); process.exit(1); }

  const realRandom = Math.random;
  Math.random = () => 0.99; // deterministic: no 30% watch-line, thief caught, etc.
  // Seed trust BEFORE installing the census: the seeding write is ours, not
  // the engine's — installing first would record a phantom -5 (scholar
  // starts at 15, not 10) and break R1's silence assertion.
  v.trust = v.trust || {};
  v.trust[vid] = 10; v.trust[other] = 10;
  const census = installTrustCensus(Game);

  console.log('== R1 (RED): fresh census, no acts — silence ==');
  ok('R1: zero writes before any act', census.writes.length === 0, `writes=${census.writes.length}`);
  ok('R1: zero progressive rows before any act', census.progressive.length === 0);
  ok('R1: zero link rows before any act', census.linkGains.length === 0);

  console.log('== R2 (GREEN): bumpTrust gain ==');
  Game.bumpTrust(other, 5, 'proof-gift');
  const r2 = lastWriteFor(census, other);
  ok('R2: gain row recorded', !!r2 && r2.delta > 0, JSON.stringify(r2));
  ok('R2: bumpTrust reason captured', census.bumpReasons.some(b => b.reason === 'proof-gift'));

  console.log('== R3 (GREEN): bumpTrust loss ==');
  const wBefore = census.writes.length;
  Game.bumpTrust(other, -3, 'proof-confront');
  const r3 = lastWriteFor(census, other);
  ok('R3: drain row recorded', !!r3 && r3.delta < 0 && census.writes.length === wBefore + 1, JSON.stringify(r3));

  console.log('== R4 (GREEN): donateToPantry — unload gives ==');
  Game.state.scholar.inventory.push({ name: 'proof jerky', kcalEach: 1200, units: 1, kg: 0.2, foodState: 'preserved' });
  const t4before = v.trust[vid];
  Game.donateToPantry(Game.state.scholar.inventory.length - 1);
  const r4 = census.writes.filter(w => w.caller === 'donateToPantry').pop();
  ok('R4: donate write, caller donateToPantry', !!r4 && r4.delta > 0, JSON.stringify(r4));
  ok('R4: progressive row base>0', census.progressive.some(p => p.caller === 'donateToPantry' && p.base > 0));

  console.log('== R5 (GREEN): takeFromPantry sting — penalty drain ==');
  v.takes = v.takes || {}; v.gives = v.gives || {};
  v.takes[vid] = 6000; v.gives[vid] = 0; // hostile cumulative: the old gate stings
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'test biscuit', kcalEach: 500, units: 5, kg: 0.1 });
  Game.witnesses = () => [];
  try { Game.takeFromPantry(v.pantry.length - 1); } catch (e) { console.log('  (take threw: ' + e.message + ')'); }
  const r5 = census.writes.filter(w => w.caller === 'takeFromPantry').pop();
  ok('R5: sting row, caller takeFromPantry, delta -2', !!r5 && r5.delta === -2, JSON.stringify(r5));

  console.log('== R6 (GREEN): comfort — grief beat ==');
  try { const n = Game.npcNeeds(other); if (n) n.fear = 80; } catch (e) {}
  const r6res = Game.comfort(other);
  const r6 = census.writes.filter(w => w.caller === 'comfort').pop();
  ok('R6: comfort fired', r6res !== null, 'comfort returned null (mood gate)');
  ok('R6: comfort write, channel grief-comfort, delta>0', !!r6 && r6.delta > 0, JSON.stringify(r6));

  console.log('== R7 (GREEN): giveFood — food deed ==');
  Game.state.scholar.inventory.push({ name: 'proof berry', kcalEach: 300, units: 2, kg: 0.1 });
  const r7res = Game.giveFood(other);
  const r7 = census.writes.filter(w => w.caller === 'giveFood').pop();
  ok('R7: giveFood fired', r7res !== null, 'giveFood returned null (no food?)');
  ok('R7: giveFood write, delta>0', !!r7 && r7.delta > 0, JSON.stringify(r7));

  console.log('== R8 (GREEN): applyRep — rep drift ==');
  Game.applyRep(other, { kind: 5 }, 1);
  const r8 = census.writes.filter(w => w.caller === 'applyRep').pop();
  ok('R8: applyRep write, delta>0', !!r8 && r8.delta > 0, JSON.stringify(r8));

  console.log('== R8b (GREEN): actual carcass butcher/carry — haul deed ==');
  const carcass = { id: 'proof-carry-carcass', kind: 'animal', items: [
    { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_rabbit', hiddenKcal: 1000, units: 1 },
  ] };
  const carried = Game.mapmemButcherForCarry(other, carcass);
  const haul = lastWriteFor(census, other, 'mapmemButcherForCarry');
  ok('R8b: real carcass is taken and yields carried calories', !!carried && carried.kcal > 0 && carcass.items[0].units === 0);
  ok('R8b: actual carry trust write is attributed exactly', !!haul && haul.delta === 1, JSON.stringify(haul));

  console.log('== R9 (GREEN): _trustGain — link currency (separate) ==');
  const testLink = { id: 'proof-link', trust: 10 };
  const applied = Game._trustGain(testLink, 5);
  ok('R9: link gain recorded in linkGains, not village writes',
    applied === 5 && census.linkGains.length === 1 && testLink.trust === 15,
    `applied=${applied} linkTrust=${testLink.trust}`);
  ok('R9: no village-trust write leaked for the link gain',
    !census.writes.some(w => w.caller === '_trustGain'));

  console.log('== R10 (GREEN): classification covers all writes ==');
  const { rows } = rankChannels(census, null);
  // 'main' is this test's own synthetic bumpTrust calls (caller one-deeper
  // lands on the test function) — a harness artifact, not an engine gap.
  const others = rows.filter(r => r.channel.indexOf('other:') === 0 && r.channel !== 'other:delete' && r.channel !== 'other:main');
  ok('R10: every engine write classified to a named channel',
    others.length === 0, others.map(r => r.channel + ' x' + r.fires).join(', '));
  const chNames = rows.map(r => r.channel);
  for (const want of ['gain:donate-unload', 'drain:pantry-take-sting', 'gain:grief-comfort', 'gain:food-deed', 'gain:rep-drift', 'gain:haul-deed']) {
    ok(`R10: channel present: ${want}`, chNames.includes(want));
  }

  console.log('== GREEN on honest run: seed 11 leadcourt 20d ==');
  Math.random = realRandom;
  const { Game: G2 } = await loadGame({ seed: 11, mode: 'trustgain-honest' });
  await setupGame(G2);
  const c2 = installTrustCensus(G2);
  const base = leadcourt;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try { c2.reproxy(); c2.sampleDay(); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  if (base.setup) { const s = base.setup; policy.setup = (G, ctx) => { try { c2.reproxy(); } catch (e) {} return s(G, ctx); }; }
  else policy.setup = (G) => { try { c2.reproxy(); } catch (e) {} };
  let r;
  await quietLog(async () => { r = await runDays(G2, policy, { days: 20 }); });
  c2.sampleDay();
  ok('honest: run completed', !!r && r.days > 0, `days=${r && r.days}`);
  ok('honest: census captured writes', c2.writes.length > 0, `writes=${c2.writes.length}`);
  const vids = new Set(c2.daySamples.map(s => s.vid));
  const { rows: hr } = rankChannels(c2, vids);
  ok('honest: ranked table non-empty', hr.length > 0, `channels=${hr.length}`);
  const vd = c2.daySamples.reduce((t, s) => t + s.roster, 0);
  ok('honest: per-100vd computable', vd > 0, `villageDays=${vd}`);
  ok('honest: scholar lineage sampled daily', c2.daySamples.length >= 20, `samples=${c2.daySamples.length}`);
  // R11: the honest run is the real classification-coverage proof — every
  // engine write must land on a named channel, no 'other:' survivors.
  const othersH = hr.filter(r => r.channel.indexOf('other:') === 0 && r.channel !== 'other:delete');
  ok('R11: honest run fully classified (no other: channels)',
    othersH.length === 0, othersH.map(r => r.channel + ' x' + r.fires).join(', '));
  console.log('  honest run channels: ' + hr.slice(0, 8).map(x => `${x.channel} +${x.gainTotal.toFixed(0)}/${x.drainTotal.toFixed(0)} x${x.fires}`).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(1); });
