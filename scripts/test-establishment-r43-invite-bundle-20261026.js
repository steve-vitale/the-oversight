#!/usr/bin/env node
// Proof test for the r43 B-probe observation (journey-establishment r43,
// seed 209): Isabella's betrayal:accept returned the 'bundle' reward line
// ("+4 wood, +4 fiber to the village stash") but the probe's pre/post
// stash snapshots (both via Game.stashState()) were identical. The probe
// interval also crossed a day boundary, so it cannot decide whether the
// reward evaporated or was consumed elsewhere. This test decides the
// mutation itself, with no day advance between calls: snapshot the live
// stash, call Game.inviteReward repeatedly on one villager, and check
// that EVERY bundle-kind call moves wood AND fiber by exactly +4.
// Other kinds (cache/knowledge/item) must not move stash materials.
// Usage: node scripts/test-establishment-r43-invite-bundle-20261026.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 209, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  Game.say = () => {};
  if (typeof Game.sysSay === 'function') Game.sysSay = () => {};
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  if (!vid) { console.log('NO-ROSTER'); process.exit(1); }
  const snap = () => {
    const st = Game.stashState();
    return { wood: (st.materials || {}).wood || 0, fiber: (st.materials || {}).fiber || 0 };
  };
  let bundle = 0, bundleOk = 0, other = 0;
  const failures = [];
  for (let i = 0; i < 200; i++) {
    const before = snap();
    let rw = null;
    try { rw = Game.inviteReward(vid); } catch (e) { failures.push(`call ${i} threw: ${e.message}`); break; }
    const after = snap();
    const line = (rw && rw.line) || '';
    if (line.includes('stockpiling where nobody looks')) {
      bundle++;
      const dw = after.wood - before.wood, df = after.fiber - before.fiber;
      if (dw === 4 && df === 4) bundleOk++;
      else failures.push(`bundle call ${i}: wood ${before.wood}->${after.wood} (d${dw}), fiber ${before.fiber}->${after.fiber} (d${df})`);
    } else {
      other++;
      if (after.wood !== before.wood || after.fiber !== before.fiber) {
        failures.push(`non-bundle call ${i} moved stash: wood ${before.wood}->${after.wood}, fiber ${before.fiber}->${after.fiber} (line: ${line.slice(0, 60)})`);
      }
    }
    if (bundle >= 5) break;
  }
  console.log(`vid=${vid} bundle=${bundle} bundleOk=${bundleOk} other=${other}`);
  if (bundle === 0) { console.log('NO-BUNDLE-KIND-SEEN (inconclusive, not a pass)'); process.exit(2); }
  if (failures.length) { console.log('FAILURES:'); for (const f of failures) console.log('  ' + f); process.exit(1); }
  console.log('PASS: every bundle reward moved the live stash +4 wood / +4 fiber');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
