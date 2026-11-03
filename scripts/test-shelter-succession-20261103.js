#!/usr/bin/env node
// test-shelter-succession-20261103.js — proof for the r116 shelter /
// succession blank (journey-crisis r116, 2026-11-03):
//
// Observed on panel seed 11601: the mantle passed to Ruth Goldstein on
// day 101 ("You wake up somebody else. Ruth Goldstein, 71"), and on
// day 102 the crisis driver drove a SHELTERED-two-days-after convo
// with Ruth as NPC — while Ruth WAS the player character (favor probe:
// isPlayer true, personDead false). The engine correctly blocked the
// self-favor ("They are no longer available to receive help."), but
// the conversation itself was a self-conversation: Ruth had been
// sheltered as an NPC, inherited the mantle, and kept her shelter
// flag. The shelter verb never musters the scholar
// (shelter.js: "the scholar is the player's — never mustered"), so a
// sheltered scholar is stale NPC state by construction — and
// shelteredVillagers() (the getter) returns everyone flagged,
// scholar included, so the driver picked her.
//
// AFTER: when the mantle passes, the successor's shelter flag is
// cleared in the succession path (ledger.js playerDeath), next to
// the other new-body resets. Other villagers' shelter flags are
// untouched (control).
// Run: node scripts/test-shelter-succession-20261103.js (seeds 7, 42, 99)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [7, 42, 99];

function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}

async function one(seed) {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  PASS ' : '  FAIL ') + msg); };
  const { Game } = await loadGame({ seed, mode: 'test-shelter-succession', fullTelemetry: true });
  await setupGame(Game);
  const roster = livingRoster(Game).filter(id => String(id) !== String(Game.villagerId));
  ok(roster.length >= 2, `seed ${seed}: 2+ NPC villagers to cast (have ${roster.length})`);
  if (roster.length < 2) return fails;
  const heir = roster[0], bystander = roster[1];

  // Shelter both as NPCs, exactly as a muster would.
  try { Game.shelterVillagers([heir, bystander], { reason: 'test', quiet: true }); } catch (e) { ok(false, `seed ${seed}: shelterVillagers threw: ${e.message}`); return fails; }
  ok(Game.isSheltered(heir), `seed ${seed}: heir sheltered before succession`);
  ok(Game.isSheltered(bystander), `seed ${seed}: bystander sheltered before succession`);

  // Rig trust so the heir — and only the heir — inherits the mantle.
  try {
    const v = Game.state.village || {};
    v.trust = {};
    v.trust[heir] = 999;
  } catch (e) {}

  // Drive the REAL succession path.
  try { Game.playerDeath('the wild'); } catch (e) { ok(false, `seed ${seed}: playerDeath threw: ${e.message}`); return fails; }
  ok(String(Game.villagerId) === String(heir), `seed ${seed}: mantle passed to the sheltered heir (got ${Game.villagerId})`);
  if (String(Game.villagerId) !== String(heir)) return fails;

  // (1) THE FIX: the new bearer <redacted> NPC shelter flag.
  ok(!Game.isSheltered(heir), `seed ${seed}: successor no longer flagged sheltered`);
  let sh = [];
  try { sh = Game.shelteredVillagers() || []; } catch (e) {}
  ok(!sh.map(String).includes(String(heir)), `seed ${seed}: shelteredVillagers() excludes the successor`);

  // (2) CONTROL: everyone else's shelter flag survives succession.
  ok(Game.isSheltered(bystander), `seed ${seed}: bystander still sheltered after succession`);
  return fails;
}

(async () => {
  let allFails = [];
  for (const seed of SEEDS) {
    console.log(`seed ${seed}:`);
    try { allFails = allFails.concat(await one(seed)); } catch (e) { console.log('  FAIL harness: ' + e.message); allFails.push('harness ' + seed); }
  }
  if (allFails.length) { console.log(`\n${allFails.length} FAILURES`); process.exit(1); }
  console.log('\nALL PASS');
})();
