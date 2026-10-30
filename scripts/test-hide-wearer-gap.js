#!/usr/bin/env node
// test-hide-wearer-gap.js — PROOF for the hide-wearer gap (gapscomp-hide).
// Claim: hide armor enters the world through the NPC route once a villager
// has HANDLED hide (brought it home), the NPC analogue of the player's
// hide-handling beat (corpses.js noteHideHandled). Wearing still counts;
// handling adds the hide-only second route. Bark behavior is untouched.
//
// Fixture (identical seed to the pre-fix probe, seed 330): fresh world,
// everyone home, craft cooldowns cleared, stash abundant, craft RNG forced
// to success — so KNOWLEDGE is the only variable between arms.
// Arms (one world, sequential, deltas per arm). Crafted counts come from
// stash consumption (hide/2, bark/3), not from the worn+held census, which
// double-counts a piece sitting in both items and equipped.
//   A gate-holds: no handler, no hide wearer -> hide crafted 0, bark >= 1
//     (the beat runs; this is also the bark-regression arm: pre-fix
//     baseline on seed 330 was barkCrafted 1, hideCrafted 0).
//   B handler-crafts: noteNpcHideHandled(handler) -> hide crafted >= 1
//     AND worn hide >= 1 (the crafter auto-equips the piece they sewed:
//     hide protection 20 beats bark 10 in equipScore for every temperament).
//   C practice/idempotence: a second handling note never lowers the
//     craft level; a successful blind craft teaches L2 (PRACTICE rule).
//   D player-codex untouched: recording an NPC handler writes village
//     avCraft only, never the player's codex recipe.
// Usage: node scripts/test-hide-wearer-gap.js [seed]
// Exit 0 iff A, B, C, D all pass; prints JSON summary.
const { loadGame, setupGame } = require(process.env.HARNESS || './sim-harness');
(async () => {
  const seed = Number(process.argv[2] || 330); // argv: node, script, seed
  const { Game } = await loadGame({ seed, mode: 'test-hide-wearer', fullTelemetry: false });
  await setupGame(Game, 'Columbus, Ohio');
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const person = (id) => { try { return Game.getPerson ? Game.getPerson(id) : null; } catch (e) { return null; } };
  const worn = (p) => Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean);
  const census = () => {
    let wornHide = 0, wornBark = 0, heldHide = 0, heldBark = 0;
    for (const id of roster) {
      const p = person(id); if (!p || p.dead) continue;
      const w = worn(p);
      if (w.includes('hide_armor')) wornHide++;
      if (w.includes('bark_armor')) wornBark++;
      for (const it of (p.items || [])) {
        const iid = (it && (it.itemId || it.id)) || it;
        if (iid === 'hide_armor') heldHide++;
        if (iid === 'bark_armor') heldBark++;
      }
    }
    return { wornHide, wornBark, heldHide, heldBark,
      hidePieces: wornHide + heldHide, barkPieces: wornBark + heldBark };
  };
  const resetFixture = () => {
    v.away = {};
    v.stash = v.stash || {};
    v.stash.materials = Object.assign({}, (v.stash.materials || {}),
      { bark: 20, vine: 20, hide: 20, wood: 20, branch: 20 });
    v.avCraftCd = {};
  };
  // Stash-delta crafted counts (exact: a craft consumes its materials even
  // on failure, and with RNG forced to success every attempt succeeds, so
  // hide crafts = hide consumed / 2, bark crafts = bark consumed / 3).
  // The worn+held census double-counts a piece that sits in both items and
  // equipped, so it is reported only as a secondary check, never as the
  // crafted count.
  const stashMats = () => Object.assign({}, (v.stash.materials || {}));
  const craftDayForced = () => {
    const realRandom = Math.random;
    Math.random = () => 0; // success always: isolate knowledge gating
    let made = null;
    try { made = Game.villagerArmorCraftDay(); } catch (e) { made = 'ERROR:' + e.message; }
    Math.random = realRandom;
    return made;
  };
  const results = {};
  // --- Arm A: gate holds ---
  resetFixture();
  const aBefore = census();
  const aStashBefore = stashMats();
  const aMade = craftDayForced();
  const aAfter = census();
  const aStashAfter = stashMats();
  results.armA_gateHolds = {
    made: aMade,
    hideCrafted: (aStashBefore.hide - aStashAfter.hide) / 2,
    barkCrafted: (aStashBefore.bark - aStashAfter.bark) / 3,
    piecesHideDelta: aAfter.hidePieces - aBefore.hidePieces,
    pass: ((aStashBefore.hide - aStashAfter.hide) / 2) === 0 && ((aStashBefore.bark - aStashAfter.bark) / 3) >= 1,
  };
  // --- Arm B: handler crafts and wears ---
  resetFixture();
  const handlerId = roster.find(id => { const p = person(id); return p && !p.dead; }) || null;
  const playerRecipeBefore = JSON.stringify(((Game.state.codex || {}).recipes || {}).hide_armor || null);
  let noteResult = null;
  if (handlerId && Game.noteNpcHideHandled) noteResult = Game.noteNpcHideHandled(handlerId);
  const bBefore = census();
  const bStashBefore = stashMats();
  const bMade = craftDayForced();
  const bAfter = census();
  const bStashAfter = stashMats();
  results.armB_handlerCrafts = {
    handlerId, noteResult, made: bMade,
    hideCrafted: (bStashBefore.hide - bStashAfter.hide) / 2,
    piecesHideDelta: bAfter.hidePieces - bBefore.hidePieces,
    wornHideAfter: bAfter.wornHide, wornHideBefore: bBefore.wornHide,
    pass: ((bStashBefore.hide - bStashAfter.hide) / 2) >= 1 && bAfter.wornHide >= 1,
  };
  // --- Arm C: practice + idempotence ---
  let cLevelAfterCraft = null, cLevelAfterSecondNote = null;
  try { cLevelAfterCraft = ((v.avCraft || {})[handlerId] || {}).hide_armor; } catch (e) {}
  try { if (handlerId && Game.noteNpcHideHandled) Game.noteNpcHideHandled(handlerId); } catch (e) {}
  try { cLevelAfterSecondNote = ((v.avCraft || {})[handlerId] || {}).hide_armor; } catch (e) {}
  results.armC_practice = {
    levelAfterCraft: cLevelAfterCraft, levelAfterSecondNote: cLevelAfterSecondNote,
    pass: cLevelAfterCraft === 2 && cLevelAfterSecondNote === 2,
  };
  // --- Arm D: player codex untouched ---
  const playerRecipeAfter = JSON.stringify(((Game.state.codex || {}).recipes || {}).hide_armor || null);
  results.armD_playerCodexUntouched = {
    before: playerRecipeBefore, after: playerRecipeAfter,
    pass: playerRecipeBefore === playerRecipeAfter,
  };
  const allPass = Object.values(results).every(r => r.pass);
  console.log(JSON.stringify({ seed, handlerId, results, verdict: allPass ? 'PASS' : 'FAIL' }, null, 1));
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('PROOF-ERROR', e); process.exit(1); });
