#!/usr/bin/env node
// Proof: entering a leg generates its foreign village (nomad-reachability
// 2026-10-15: genLegVillage existed and was unit-tested but nothing called
// it — no leg ever had its village, so trade/join/fight never fired and the
// road's only net-positive food source was unreachable).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '555', 10);
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  PASS: ' + l); } else { fail++; console.log('  FAIL: ' + l); } };

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game);
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  const r = Game.nomad.start();
  ok(!!(r && r.active), 'road started');
  ok(Game.nomad.enterLeg(0) === true, 'entered first leg');
  const leg = Game.state.road.legs[0];
  const v = leg && leg.village;
  ok(!!v, 'the leg has a foreign village');
  ok(!!(v && v.speaker && v.speaker.name), 'the village has a named speaker (' + (v && v.speaker && v.speaker.name) + ')');
  ok(v && v.pantryKcal > 0, 'the village has a pantry (' + (v && v.pantryKcal) + ' kcal)');
  // Joining briefly feeds the party from the village's pantry.
  const before = Math.round((Game.state.road.supplies || {}).food || 0);
  const jr = Game.nomadWild.joinVillage(v, 2);
  const after = Math.round((Game.state.road.supplies || {}).food || 0);
  ok(jr && jr.note !== 'refused', 'a non-hostile village lets the party rest (mood ' + Game.nomadWild.villageMood(v) + ')');
  ok(after > before, `joining fed the packs (+${(after - before).toLocaleString()} kcal)`);
  console.log(`\nleg-village: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
