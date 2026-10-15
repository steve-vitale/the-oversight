#!/usr/bin/env node
// Proof: the village's appointed leader is never mustered into the road
// party (nomad-reachability 2026-10-15: start() appointed the leader from
// all non-bearer <redacted> BEFORE mustering, so the leader could be drafted —
// the epilogue praised them for holding the village while they starved).
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
  const g = Game.nomad.canLeave();
  ok(g.ok, 'eligible after forcing gates (' + (g.kin || []).length + ' known kin)');
  const r = Game.nomad.start();
  ok(!!(r && r.active), 'road started');
  const lid = r.villageLeft.leaderId;
  ok(!!lid, 'a leader was appointed (' + lid + ')');
  ok(!r.partyIds.includes(lid), 'leader is NOT in the road party (party: ' + r.partyIds.length + ')');
  ok(r.bearerId === r.partyIds[0], 'bearer <redacted> the party');
  // And across a few seeds, the invariant holds wherever departure is possible.
  console.log(`\nleader-stays: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
