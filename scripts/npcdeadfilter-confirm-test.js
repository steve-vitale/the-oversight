#!/usr/bin/env node
// npcdeadfilter-confirm-test.js — proof for sim-npcdeadfilter-confirm.
// The confirm band's substrate, in miniature, in ONE live harness
// (seed 42): three driven successions with a dead top-trust id on
// the roster, alternating the npcIds implementation:
//   C1 FILTERED (shipped code): dead victim, top trust -> playerDeath
//      must NOT make the dead id bearer; bearer is living.
//   C2 CONTROL (npcIds patched to the pre-fix roster-minus-bearer):
//      dead victim, top trust -> playerDeath MUST make the dead id
//      bearer. This proves the control arm discriminates: if C2 did
//      not install dead, the confirm band's control would be vacuous.
//   C3 FILTERED RESTORED: dead victim, top trust -> playerDeath
//      must NOT make the dead id bearer again (patch fully reverted).
// Plus guardrails: clean-roster npcIds() unchanged, and every victim
// is really deadMarked after the kill (phoenix holders skipped).
// Usage: node scripts/npcdeadfilter-confirm-test.js
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

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  v.trust = v.trust || {};

  function isDead(id) {
    try { if (Game.deadMarked && Game.deadMarked(id)) return true; } catch (e) {}
    try {
      const vr = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (vr && vr.dead) return true;
      const br = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
      if (br && br.dead) return true;
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp && vp.dead) return true;
    } catch (e) {}
    return false;
  }
  function hasPhoenix(id) {
    try { return !!(Game.npcHasAbility && Game.npcHasAbility(id, 'phoenix_clause')); } catch (e) { return false; }
  }
  // Pick the highest-trust living non-bearer without phoenix, with
  // at least 2 other living non-bearers left behind (mirrors the
  // driver's roster-allowance rule).
  function pickVictim() {
    const roster = (v.roster || []).slice();
    const living = roster.filter(function (id) { return id !== Game.villagerId && !isDead(id); });
    if (living.length < 3) return null;
    const cands = living.filter(function (id) { return !hasPhoenix(id); });
    cands.sort(function (a, b) { return ((v.trust[b] || 0) - (v.trust[a] || 0)) || (roster.indexOf(a) - roster.indexOf(b)); });
    return cands[0] || null;
  }
  // Inject corrupt-roster state: kill + repush + top trust. Returns
  // the victim id, or null if no victim / kill did not take.
  function inject() {
    const victim = pickVictim();
    if (!victim) return null;
    for (const id of (v.roster || [])) v.trust[id] = 0;
    Game.removeVillager(victim, 'killed');
    if (!isDead(victim)) return null;
    if ((v.roster || []).indexOf(victim) < 0) v.roster.push(victim);
    v.trust[victim] = 100;
    return victim;
  }

  const roster0 = (v.roster || []).slice();
  const cleanIds = roster0.filter(function (id) { return id !== Game.villagerId; });
  ok(cleanIds.length >= 3, 'setup: at least 3 living non-bearers (got ' + cleanIds.length + ')');

  // C1: filtered.
  const x1 = inject();
  ok(!!x1, 'C1: victim picked and killed (victim=' + x1 + ')');
  if (x1) {
    ok(isDead(x1), 'C1: victim is deadMarked after kill');
    ok(Game.npcIds().indexOf(x1) < 0, 'C1: filtered npcIds() excludes the dead victim');
    const oldB = Game.villagerId;
    Game.playerDeath('test-npcdeadfilter-confirm-c1');
    ok(Game.villagerId !== x1, 'C1: filtered succession does not install the dead id (bearer=' + Game.villagerId + ')');
    ok(!isDead(Game.villagerId), 'C1: filtered successor is living');
    ok(Game.villagerId !== oldB, 'C1: succession actually changed bearer');
  }

  // C2: control (pre-fix npcIds).
  const origNpcIds = Game.npcIds;
  Game.npcIds = function () {
    return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; });
  };
  const x2 = inject();
  ok(!!x2, 'C2: victim picked and killed (victim=' + x2 + ')');
  if (x2) {
    ok(isDead(x2), 'C2: victim is deadMarked after kill');
    ok(Game.npcIds().indexOf(x2) >= 0, 'C2: control npcIds() still returns the dead victim (positive control)');
    Game.playerDeath('test-npcdeadfilter-confirm-c2');
    ok(Game.villagerId === x2, 'C2: control succession DOES install the dead id (bearer=' + Game.villagerId + ')');
    ok(isDead(Game.villagerId), 'C2: control bearer is deadMarked (dead bearer leading)');
  }

  // C3: filtered restored.
  Game.npcIds = origNpcIds;
  const x3 = inject();
  ok(!!x3, 'C3: victim picked and killed (victim=' + x3 + ')');
  if (x3) {
    ok(isDead(x3), 'C3: victim is deadMarked after kill');
    ok(Game.npcIds().indexOf(x3) < 0, 'C3: restored npcIds() excludes the dead victim again');
    const oldB3 = Game.villagerId;
    Game.playerDeath('test-npcdeadfilter-confirm-c3');
    ok(Game.villagerId !== x3, 'C3: restored succession does not install the dead id (bearer=' + Game.villagerId + ')');
    ok(!isDead(Game.villagerId), 'C3: restored successor is living');
    ok(Game.villagerId !== oldB3, 'C3: succession actually changed bearer');
  }

  console.log(`\nnpcdeadfilter-confirm-test: ${pass} passed, ${fail} failed, ${skipped} skipped`);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
