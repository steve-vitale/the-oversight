// probe-bond-proposer-r149-20261106.js -- diagnostic probe (Lane B r149).
// Question: does a bond formed by an accepted proposeBond carry the
// proposer on its bond record (bond-initiation.js writes bnd.proposer =
// initiator after bondAdd)? The r149 panel's bond samples (1 bond per
// seed) show no proposer, but most bonds form via bondAdd from meals /
// visits / feasts, not via proposeBond — the sample cannot settle it.
// This probe forces one accepted proposeBond (pinned roll) and reads
// the live record back via bondGet (which returns the live object, not
// a copy — betrayal.js). No src/js changes.
// Usage: node scripts/probe-bond-proposer-r149-20261106.js
// Exit 0 + PROPOSER-WRITTEN if the record carries proposer; exit 1 if not.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 42201, mode: 'probe-bond-proposer-r149', fullTelemetry: false, narration: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  console.log('scholar=' + Game.villagerId + ' roster=' + roster.length);
  let tried = 0, accepted = null;
  for (let i = 0; i < roster.length && !accepted && tried < 8; i++) {
    for (let j = i + 1; j < roster.length && !accepted && tried < 8; j++) {
      const A = roster[i], B = roster[j];
      tried++;
      // Seed a minimal bond so the perception gate sees the 'bond' channel
      // (v=1, depth 0 — below proposeBond's already-bonded guard).
      try { Game.bondAdd(A, B, 1, 'probe-seed'); } catch (e) {}
      let res = null;
      try { res = Game.proposeBond(A, B, { roll: 0.01 }); } catch (e) { console.log('proposeBond threw: ' + e.message); continue; }
      console.log(`try ${tried}: ${A} -> ${B}: ` + JSON.stringify(res));
      if (res && res.accepted) accepted = { A, B, res };
    }
  }
  if (!accepted) { console.log('RESULT: NO-ACCEPT — no pair accepted in ' + tried + ' tries'); process.exit(1); }
  const rec = Game.bondGet(accepted.A, accepted.B);
  console.log('bond record: ' + JSON.stringify(rec));
  const raw = ((Game.state.village || {}).bonds || {})[Game.bondKey(accepted.A, accepted.B)];
  console.log('raw store identical object: ' + (raw === rec));
  if (rec && rec.proposer === accepted.A && rec.proposed === true) {
    console.log('RESULT: PROPOSER-WRITTEN — bond record carries proposer=' + rec.proposer + ', proposedDay=' + rec.proposedDay);
    process.exit(0);
  }
  console.log('RESULT: PROPOSER-MISSING — accepted proposeBond left no proposer on the record');
  process.exit(1);
})().catch(e => { console.error('probe crashed: ' + (e && e.stack || e)); process.exit(2); });
