#!/usr/bin/env node
// test-build-armor-seed.js — build-armor seeding proof (adopts fixall-armor).
// Proves the FIRST-piece mechanism, not another sewing tweak: NPC craft
// knowledge comes only from wearing, so a village with no wearer can never
// start sewing. seedArmorWearer() (game.js, called from newGame after goals
// are final) guarantees staying first wearers at village creation:
//
//   S1 synthetic, direct method: sterile roster -> grants bark to up to
//      three staying villagers (never the player), worn from day 0, flag
//      set to the first grantee. Three, not one: a single wearer proved
//      too fragile (scratch seed 67703: home 17 days, died ~day 36 before
//      vine reached 2 while home).
//   S2 synthetic: a staying carrier already exists -> no grant (null, kits
//      untouched, no flag). An escape-goal-only carrier does NOT count as a
//      durable seed -> grant fires to a staying villager.
//   S3 synthetic: grantee preference — a staying villager whose torso the
//      bark improves is picked over one wearing better armor.
//   S4 real villages, setup + one gear day: every fresh village in the
//      fixall confirm band (67701-67712) and fresh seeds (67801-67806) has
//      a staying (non-escape-goal) bark/hide wearer, and any grant went to
//      a non-player villager. This is the observable floor the confirm
//      band judges, not a unit-only claim.
//   S5 determinism: the same seed loads twice -> the same grantee (the
//      pick draws no RNG, so generation streams are unchanged).
//
// Usage: node scripts/test-build-armor-seed.js
// (ARMORVILLAGE must be UNSET — the seeding proof is about live play.)
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
if ('ARMORVILLAGE' in process.env) {
  console.error('PROOF STOP: ARMORVILLAGE must be UNSET.');
  process.exit(2);
}
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; console.log('  ok: ' + label + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}
const idOf = (it) => (it && (it.itemId || it.id)) || it;
const wornIds = (p) => new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
const carries = (p, id) => (p.items || []).map(idOf).includes(id) || (p.stashed || []).map(idOf).includes(id);

function mkPerson(id, goal, items, equipped) {
  return { id, name: id, goal: goal || null, items: (items || []).slice(), stashed: [], equipped: equipped || {}, dead: false };
}

async function withSynthetic(Game, people, roster, playerId, genIds, fn) {
  // Swap Game state/data onto a synthetic village, run fn, restore.
  const savedState = Game.state, savedVillagers = Game.data.villagers, savedGen = Game.generatedRoster, savedVid = Game.villagerId;
  try {
    const rc = {};
    for (const p of people) rc[p.id] = p;
    Game.state = { village: { roster: roster.slice(), rosterChars: rc, bgGoals: {} }, scholar: { day: 0 } };
    Game.data.villagers = people.slice();
    Game.generatedRoster = (genIds || []).map(id => people.find(p => p.id === id)).filter(Boolean);
    Game.villagerId = playerId;
    return fn();
  } finally {
    Game.state = savedState; Game.data.villagers = savedVillagers; Game.generatedRoster = savedGen; Game.villagerId = savedVid;
  }
}

(async () => {
  console.log('S1/S2/S3 synthetic seedArmorWearer (direct method)');
  {
    const { Game } = await loadGame({ seed: 4242, mode: 'armor-seed-proof', fullTelemetry: false });
    await quietLog(async () => {});
    // S1: sterile roster, staying grantees available (2 generated NPCs ->
    // both granted, first in roster order is the flag).
    const r1 = await withSynthetic(Game,
      [mkPerson('player1', 'prove', []), mkPerson('npcA', 'prove', ['flannel_shirt']), mkPerson('npcB', 'prove', ['work_gloves'])],
      ['player1', 'npcA', 'npcB'], 'player1', ['npcA', 'npcB'], () => {
        const g = Game.seedArmorWearer();
        const a = Game.state.village.rosterChars.npcA, b = Game.state.village.rosterChars.npcB;
        return { g, aWears: wornIds(a).has('bark_armor'), bWears: wornIds(b).has('bark_armor'),
          flag: Game.state.village.armorSeedVid, playerHas: carries(Game.state.village.rosterChars.player1, 'bark_armor') };
      });
    ok(r1.g === 'npcA', 'sterile roster grants first to the first-ranked generated villager', `grantee=${r1.g}`);
    ok(r1.g !== 'player1' && !r1.playerHas, 'grant never touches the player kit');
    ok(r1.flag === r1.g, 'armorSeedVid flag records the first grantee');
    ok(r1.aWears && r1.bWears, 'both grantees wear bark from day 0 (autoEquip)', `aWears=${r1.aWears} bWears=${r1.bWears}`);

    // S1b: sterile roster with 4 generated NPCs -> exactly 3 granted.
    const r1b = await withSynthetic(Game,
      [mkPerson('player1', 'prove', []), mkPerson('npcA', 'prove', []), mkPerson('npcB', 'prove', []), mkPerson('npcC', 'prove', []), mkPerson('npcD', 'prove', [])],
      ['player1', 'npcA', 'npcB', 'npcC', 'npcD'], 'player1', ['npcA', 'npcB', 'npcC', 'npcD'], () => {
        const g = Game.seedArmorWearer();
        const rc = Game.state.village.rosterChars;
        const counts = ['npcA', 'npcB', 'npcC', 'npcD'].map(id => carries(rc[id], 'bark_armor'));
        return { g, counts };
      });
    ok(r1b.g === 'npcA' && r1b.counts.join(',') === 'true,true,true,false', 'grant caps at three grantees in roster order', `grantee=${r1b.g} carries=${r1b.counts.join(',')}`);

    // S2a: staying carrier already exists -> no grant.
    const r2 = await withSynthetic(Game,
      [mkPerson('player1', 'prove', []), mkPerson('npcA', 'prove', ['bark_armor'], { torso: { itemId: 'bark_armor' } }), mkPerson('npcB', 'prove', [])],
      ['player1', 'npcA', 'npcB'], 'player1', ['npcA', 'npcB'], () => {
        const before = JSON.stringify(Game.state.village.rosterChars.npcB.items);
        const g = Game.seedArmorWearer();
        const after = JSON.stringify(Game.state.village.rosterChars.npcB.items);
        return { g, unchanged: before === after, flag: Game.state.village.armorSeedVid };
      });
    ok(r2.g === null && r2.unchanged && r2.flag === undefined, 'staying carrier present -> no grant, kits untouched');

    // S2b: escape-goal-only carrier does NOT count -> grant fires to a staying villager.
    const r3 = await withSynthetic(Game,
      [mkPerson('player1', 'prove', []), mkPerson('npcA', 'escape', ['bark_armor'], { torso: { itemId: 'bark_armor' } }), mkPerson('npcB', 'prove', [])],
      ['player1', 'npcA', 'npcB'], 'player1', ['npcA', 'npcB'], () => {
        const g = Game.seedArmorWearer();
        return { g, bCarries: carries(Game.state.village.rosterChars.npcB, 'bark_armor') };
      });
    ok(r3.g === 'npcB' && r3.bCarries, 'escape-only carrier -> grant fires to a staying villager', `grantee=${r3.g}`);

    // S3: staying villager with an improvable torso is picked FIRST, ahead
    // of one in better armor (both may still receive pieces under the
    // three-grantee cap; the ordering is what this case proves).
    const r4 = await withSynthetic(Game,
      [mkPerson('player1', 'prove', []),
       mkPerson('npcA', 'prove', [], { torso: { itemId: 'leather_jacket' } }),
       mkPerson('npcB', 'prove', [])],
      ['player1', 'npcA', 'npcB'], 'player1', ['npcA', 'npcB'], () => {
        const g = Game.seedArmorWearer();
        return { g, bWears: wornIds(Game.state.village.rosterChars.npcB).has('bark_armor') };
      });
    ok(r4.g === 'npcB' && r4.bWears, 'first grantee is the staying villager bark improves, not the leather wearer', `grantee=${r4.g} bWears=${r4.bWears}`);
  }

  console.log('S4 real villages: staying wearer floor after setup + one gear day');
  const seeds = [];
  for (let s = 67701; s <= 67712; s++) seeds.push(s);
  for (let s = 67801; s <= 67806; s++) seeds.push(s);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'armor-seed-proof', fullTelemetry: false });
    await setupGame(Game);
    const v = Game.state.village || {};
    const flag = v.armorSeedVid || null;
    if (flag) {
      ok(flag !== Game.villagerId, `seed ${seed}: grant (when set) is never the player`, `flag=${flag}`);
    }
    try { if (Game.villagerGearDay) Game.villagerGearDay(); } catch (e) { console.log('  gear day threw: ' + (e && e.message)); }
    let stayingWearers = 0; let flagWears = false;
    for (const vid of (v.roster || [])) {
      if (vid === Game.villagerId) continue;
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p) p = (v.rosterChars || {})[vid];
      if (!p || p.dead) continue;
      const w = wornIds(p);
      if ((w.has('bark_armor') || w.has('hide_armor')) && Game.npcGoal(vid) !== 'escape') stayingWearers++;
      if (vid === flag && w.has('bark_armor')) flagWears = true;
    }
    ok(stayingWearers >= 1, `seed ${seed}: >=1 staying bark/hide wearer after gear day`, `wearers=${stayingWearers} flag=${flag} flagWears=${flagWears}`);
  }

  console.log('S5 determinism: same seed -> same grantee');
  {
    const flags = [];
    for (let i = 0; i < 2; i++) {
      const { Game } = await loadGame({ seed: 67703, mode: 'armor-seed-proof', fullTelemetry: false });
      await setupGame(Game);
      flags.push((Game.state.village || {}).armorSeedVid || null);
    }
    ok(flags[0] && flags[0] === flags[1], 'grant pick is deterministic (no RNG draw)', `flags=${flags.join(',')}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FAILED', e && e.stack || e); process.exit(1); });
