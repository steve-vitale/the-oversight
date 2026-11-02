#!/usr/bin/env node
// test-npcdeadfilter-a.js — proof for sim-npcdeadfilter-a (npcIds dead filter).
// Must be RED pre-fix, GREEN post-fix. Live harness only (seed 42):
//   P1. npcIds() excludes a dead-marked id placed on the roster, for
//       each death-record source separately:
//       (a) real removeVillager('killed') path, id pushed back onto
//           the roster to simulate "any other path";
//       (b) villagers-record-only dead mark;
//       (c) background_survivors-record-only dead mark;
//       (d) vpOf-only dead mark (skipped with a reason if the vp
//           object cannot be marked in harness).
//   P2. Succession: driven playerDeath with a dead top-trust id on
//       the roster must NOT make that id bearer (pre-fix it does);
//       the ledger-ordered candidate list (npcIds() sorted by trust)
//       must not have the dead id first.
//   P3. Living guardrail: with no dead id on the roster, npcIds()
//       returns exactly roster-minus-bearer, same ids, same order.
// Usage: node scripts/test-npcdeadfilter-a.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0, skipped = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label); }
}
function skip(label) { skipped++; console.log('SKIP: ' + label); }
function eqArr(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const bearer = Game.villagerId;
  const roster0 = (v.roster || []).slice();
  const cleanIds = roster0.filter(function (id) { return id !== bearer; });
  const X = cleanIds[0];
  const origIdxX = roster0.indexOf(X);
  ok(!!X, 'setup: a non-bearer roster id exists (got ' + X + ')');
  ok(eqArr(Game.npcIds(), cleanIds), 'P3: clean-roster npcIds() equals roster-minus-bearer in order');
  if (!X) { console.log(`\ntest-npcdeadfilter-a: ${pass} passed, ${fail} failed, ${skipped} skipped`); process.exit(1); }

  function clearMarks(id) {
    try {
      const vr = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (vr) delete vr.dead;
      const br = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
      if (br) delete br.dead;
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp) delete vp.dead;
    } catch (e) {}
  }
  function restoreRoster() {
    try {
      const r = v.roster || [];
      const i = r.indexOf(X);
      if (i >= 0) r.splice(i, 1);
      r.splice(Math.min(origIdxX, r.length), 0, X);
    } catch (e) {}
  }

  // P1 (a): real kill path + repush (simulates any other roster path).
  v.trust = v.trust || {};
  Game.removeVillager(X, 'killed');
  ok((v.roster || []).indexOf(X) < 0, 'P1a: removeVillager(killed) drops the id from the roster');
  ok(Game.deadMarked ? !!Game.deadMarked(X) : false, 'P1a: deadMarked(X) true after killed removal');
  v.roster.push(X);
  ok(Game.npcIds().indexOf(X) < 0, 'P1a: npcIds() excludes a killed id pushed back onto the roster');
  // Restore for the next cases.
  clearMarks(X);
  restoreRoster();
  ok(eqArr(Game.npcIds(), cleanIds), 'P3: npcIds() back to the clean list after P1a restore');

  // P1 (b): villagers-record-only dead mark (bg record clean).
  const named = cleanIds.find(function (id) {
    return (Game.data.villagers || []).some(function (r) { return r.id === id; }) &&
      (Game.data.background_survivors || []).some(function (r) { return r.id === id; });
  });
  if (named) {
    const vr = Game.data.villagers.find(function (r) { return r.id === named; });
    const br = Game.data.background_survivors.find(function (r) { return r.id === named; });
    delete br.dead;
    const vpB = Game.vpOf ? Game.vpOf(named) : null;
    if (vpB) delete vpB.dead;
    vr.dead = true;
    ok(Game.npcIds().indexOf(named) < 0, 'P1b: npcIds() excludes a villagers-record-only dead id (' + named + ')');
    clearMarks(named);
  } else { skip('P1b: no roster id present in both villagers and background_survivors'); }

  // P1 (c): background_survivors-record-only dead mark (villagers clean).
  if (named) {
    const vr = Game.data.villagers.find(function (r) { return r.id === named; });
    const br = Game.data.background_survivors.find(function (r) { return r.id === named; });
    delete vr.dead;
    const vpC = Game.vpOf ? Game.vpOf(named) : null;
    if (vpC) delete vpC.dead;
    br.dead = true;
    ok(Game.npcIds().indexOf(named) < 0, 'P1c: npcIds() excludes a bg-record-only dead id (' + named + ')');
    clearMarks(named);
  } else { skip('P1c: no roster id present in both villagers and background_survivors'); }

  // P1 (d): vpOf-only dead mark.
  const vpTarget = cleanIds[0];
  const vpT = Game.vpOf ? Game.vpOf(vpTarget) : null;
  if (vpT) {
    clearMarks(vpTarget);
    vpT.dead = true;
    let sticks = false;
    try { sticks = !!(Game.vpOf(vpTarget) || {}).dead; } catch (e) {}
    if (sticks) {
      ok(Game.npcIds().indexOf(vpTarget) < 0, 'P1d: npcIds() excludes a vpOf-only dead id (' + vpTarget + ')');
    } else { skip('P1d: vpOf dead mark does not stick in harness'); }
    clearMarks(vpTarget);
  } else { skip('P1d: vpOf returns nothing for the target id'); }
  ok(eqArr(Game.npcIds(), cleanIds), 'P3: npcIds() back to the clean list after P1 restores');

  // P2: driven succession. Dead X on the roster with top trust.
  for (const id of (v.roster || [])) v.trust[id] = 0;
  v.trust[X] = 90;
  Game.removeVillager(X, 'killed');
  v.roster.push(X);
  const cands = Game.npcIds().slice();
  cands.sort(function (a, b) { return (v.trust[b] || 0) - (v.trust[a] || 0); });
  ok(cands[0] !== X, 'P2: ledger-ordered candidate list does not put the dead id first (first=' + cands[0] + ')');
  ok(cands.indexOf(X) < 0, 'P2: ledger-ordered candidate list contains no dead id');
  const oldBearer = Game.villagerId;
  Game.playerDeath('test-npcdeadfilter');
  ok(Game.villagerId !== X, 'P2: driven playerDeath does not make the dead id bearer (bearer=' + Game.villagerId + ', dead id=' + X + ')');
  ok(Game.villagerId !== oldBearer, 'P2: driven playerDeath actually changed bearer (old=' + oldBearer + ')');

  console.log(`\ntest-npcdeadfilter-a: ${pass} passed, ${fail} failed, ${skipped} skipped`);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
