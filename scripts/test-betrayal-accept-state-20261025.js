#!/usr/bin/env node
// BETRAYAL:ACCEPT STATE CONSEQUENCE (journey establishment r40, 2026-10-25):
// Scale r36 + establishment r39 left the same blank: an invitation accept
// ENGAGES in conversation, but its landing was never measured — does the
// accept change game state, or only print a walk line? The r40 panel probe
// drove two real accepts (209 Dayo: reward/knowledge walk; 239 Jovan:
// sick-veto) and found the accept's state footprint is exactly:
//   pending cleared, inviteHistory count+1, accepted+1, and (walk only)
//   one outcomes entry {defId, outcome, day}. Trust did NOT move on either
//   (209: trust 75, above the talk-words cap of 40 in convo-scene.js
//   resolveConsequence; 239: the sick veto returns before resolveInvite,
//   so no trust is granted at all). Pantry/stash move only on cache/bundle
//   outcomes. No departure-plan state exists anywhere in betrayalState.
// This test pins that footprint with fabricated pending invites so future
// runs can re-check it cheaply instead of re-driving panels.
// Usage: node scripts/test-betrayal-accept-state-20261025.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0, passes = 0;
function ok(cond, label) {
  if (cond) { passes++; console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}
function livingVillagers(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  return roster.filter(id => id && id !== Game.villagerId && !(Game.getPerson(id) || {}).dead);
}

(async () => {
  for (const seed of [209, 228]) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const vids = livingVillagers(Game);
    if (vids.length < 2) { console.log(`  SKIP seed ${seed}: fewer than 2 living villagers`); continue; }
    const day = (Game.state.scholar || {}).day || 0;
    // --- Walk accept: fabricated pending invite, healthy villager. ---
    const a = vids[0];
    const ha = Game.inviteHistory(a);
    const c0 = ha.count, a0 = ha.accepted, o0 = (ha.outcomes || []).length;
    ha.pending = { defId: 'show', day, spoken: true };
    ok(Game.pendingInvite(a) && Game.pendingInvite(a).defId === 'show', `seed ${seed}: pending invite staged`);
    const r = Game.acceptInvite(a);
    ok(!!r && typeof r.line === 'string' && r.line.length > 0, `seed ${seed}: accept returns a walk line`);
    ok(Game.pendingInvite(a) === null, `seed ${seed}: pending cleared by accept`);
    ok(ha.count === c0 + 1 && ha.accepted === a0 + 1, `seed ${seed}: history count/accepted +1`);
    ok((ha.outcomes || []).length === o0 + 1, `seed ${seed}: one outcome recorded`);
    const last = (ha.outcomes || [])[(ha.outcomes || []).length - 1] || {};
    ok(last.defId === 'show' && ['small', 'reward', 'wild'].includes(last.outcome), `seed ${seed}: outcome is a walk outcome (${last.outcome})`);
    // --- Sick veto: feverish villager's invite still consumes, but no walk. ---
    const b = vids[1];
    const hb = Game.inviteHistory(b);
    const cb0 = hb.count, ab0 = hb.accepted, ob0 = (hb.outcomes || []).length;
    Game.state.village.sick = Object.assign({}, Game.state.village.sick, { [b]: true });
    hb.pending = { defId: 'traps', day, spoken: true };
    const rs = Game.acceptInvite(b);
    ok(!!rs && rs.outcome === 'sick', `seed ${seed}: sick villager accept vetoes with outcome=sick`);
    ok(Game.pendingInvite(b) === null, `seed ${seed}: sick accept still clears pending`);
    ok(hb.count === cb0 + 1 && hb.accepted === ab0 + 1, `seed ${seed}: sick accept still counts as accepted`);
    ok((hb.outcomes || []).length === ob0, `seed ${seed}: sick accept records NO walk outcome`);
    // --- No departure-plan state exists to land. ---
    const bs = Game.betrayalState ? Game.betrayalState() : {};
    ok(!Object.keys(bs).some(k => /depart/i.test(k)), `seed ${seed}: betrayalState carries no departure key`);
    ok(!(bs.plots || []).some(p => p && /depart/i.test(JSON.stringify(p))), `seed ${seed}: no plot carries a departure plan`);
  }
  console.log(failures ? `RESULT: ${passes} PASS, ${failures} FAIL` : `RESULT: ${passes} PASS, 0 FAIL`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
