#!/usr/bin/env node
// PROBE (gapscomp-hide): hide-wearer gap reproduction fixture.
// One load per process (harness rule). Usage:
//   node scripts/probe-hide-wearer.js [seed] [handler|nohandler]
// handler: one home villager is marked as having handled hide (the
// post-fix NPC record, or a manual fixture pre-fix). nohandler: baseline.
// Prints a JSON census; exit 0 always (this is a probe, not an assertion).
const { loadGame, setupGame } = require(process.env.HARNESS || './sim-harness');
(async () => {
  const seed = Number(process.argv[2] || 330);
  const mode = process.argv[3] || 'nohandler';
  const { Game } = await loadGame({ seed, mode: 'probe-hide', fullTelemetry: false });
  await setupGame(Game, 'Columbus, Ohio');
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  // Fixture controls (disclosed): everyone home, no craft cooldown, stash abundant.
  v.away = {};
  v.stash = v.stash || {};
  v.stash.materials = Object.assign({}, (v.stash.materials || {}), { bark: 20, vine: 20, hide: 20, wood: 20, branch: 20 });
  v.avCraftCd = {};
  const person = (id) => { try { return Game.getPerson ? Game.getPerson(id) : null; } catch (e) { return null; } };
  const worn = (p) => Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean);
  const census = () => {
    let wornHide = 0, wornBark = 0, heldHide = 0, heldBark = 0, home = 0;
    for (const id of roster) {
      const p = person(id); if (!p || p.dead) continue;
      if (!((v.away || {})[id])) home++;
      const w = worn(p);
      if (w.includes('hide_armor')) wornHide++;
      if (w.includes('bark_armor')) wornBark++;
      for (const it of (p.items || [])) {
        const iid = (it && (it.itemId || it.id)) || it;
        if (iid === 'hide_armor') heldHide++;
        if (iid === 'bark_armor') heldBark++;
      }
    }
    return { home, wornHide, wornBark, heldHide, heldBark };
  };
  const before = census();
  let handlerId = null;
  if (mode === 'handler') {
    // Simulate the post-fix record: a home villager handled hide.
    // Pre-fix this map entry is inert (craft beat ignores it); post-fix
    // the craft beat reads it as hide knowledge. Also try the real API
    // when it exists.
    const homeIds = roster.filter(id => { const p = person(id); return p && !p.dead; });
    handlerId = homeIds[0] || null;
    if (handlerId) {
      if (Game.noteNpcHideHandled) Game.noteNpcHideHandled(handlerId);
      else { v.avCraft = v.avCraft || {}; v.avCraft[handlerId] = v.avCraft[handlerId] || {}; v.avCraft[handlerId].hide_armor = 1; }
    }
  }
  // Force craft success (isolate KNOWLEDGE gating from the 35% blind odds).
  const realRandom = Math.random;
  Math.random = () => 0;
  let made = null;
  try { made = Game.villagerArmorCraftDay ? Game.villagerArmorCraftDay() : null; } catch (e) { made = 'ERROR:' + e.message; }
  Math.random = realRandom;
  const after = census();
  // Pieces = worn + held (a piece may sit in either; the SUM delta is the
  // crafted count regardless of where autoEquip parks it).
  const pieces = (c) => ({ hide: c.wornHide + c.heldHide, bark: c.wornBark + c.heldBark });
  console.log(JSON.stringify({ seed, mode, handlerId, before, made, after,
    hideCrafted: pieces(after).hide - pieces(before).hide, barkCrafted: pieces(after).bark - pieces(before).bark,
    stashAfter: (v.stash.materials || {}) }, null, 1));
})().catch(e => { console.error('PROBE-ERROR', e); process.exit(1); });
