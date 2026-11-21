#!/usr/bin/env node
// OWED WALK (journey-scale r249, 2026-11-21): a yes the fever vetoes must
// not evaporate. Panel evidence (seed 103922 d90, Dorothy): the player
// accepts "Walk my trap line with me?" and Dorothy cancels in the same
// breath — "Maybe not today. The fire's got me." — no walk, no reschedule,
// no owe. The accepted invitation simply dies.
// The fix (src/js/betrayal.js): the sick veto records hist.owedWalk
// {defId, day} and names the reschedule out loud; npcInviteTick re-offers
// the SAME walk first once the villager is well.
// This test pins: (1) the r40 footprint is preserved (outcome 'sick',
// pending cleared, count/accepted +1, NO walk outcome); (2) the line
// names the reschedule; (3) the owe is recorded; (4) the owe re-issues
// the same walk after recovery; (5) no re-issue while still sick.
// Usage: node scripts/test-journey-scale-r249-owed-walk-20261121.js
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
    // --- Sick veto: the r40 footprint is preserved. ---
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
    // --- The new behavior: the veto names the reschedule and records the owe. ---
    ok(typeof rs.line === 'string' && /Tomorrow/.test(rs.line) && /same walk/.test(rs.line),
      `seed ${seed}: sick line names the reschedule ("${(rs.line || '').slice(0, 120)}")`);
    ok(!!hb.owedWalk && hb.owedWalk.defId === 'traps' && hb.owedWalk.day === day,
      `seed ${seed}: owed walk recorded {defId:traps, day:${day}}`);
    // --- No re-issue while still sick. ---
    for (let i = 0; i < 20; i++) Game.npcInviteTick();
    ok(Game.pendingInvite(b) === null, `seed ${seed}: no invite re-issued while still sick`);
    ok(!!hb.owedWalk && hb.owedWalk.defId === 'traps', `seed ${seed}: owe survives the sick ticks`);
    // --- Recovery: the SAME walk comes back first. ---
    Game.state.village.sick = Object.assign({}, Game.state.village.sick, { [b]: false });
    delete Game.state.village.sick[b];
    let reissued = false;
    for (let i = 0; i < 100 && !reissued; i++) {
      Game.npcInviteTick();
      const p = Game.pendingInvite(b);
      if (p) reissued = p.defId === 'traps';
    }
    ok(reissued, `seed ${seed}: owed walk re-issued as pending 'traps' after recovery`);
    ok(!hb.owedWalk, `seed ${seed}: owe consumed on re-issue`);
    ok(!!Game.pendingInvite(b) && Game.pendingInvite(b).defId === 'traps',
      `seed ${seed}: re-issued pending is the owed walk, not a fresh random one`);
  }
  console.log(failures ? `RESULT: ${passes} PASS, ${failures} FAIL` : `RESULT: ${passes} PASS, 0 FAIL`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
