#!/usr/bin/env node
// scripts/test-snarecatch-b.js — proof test for the snare witnessed-catch
// bootstrap (lever loop B, arm sim-snarecatch-b, 2026-10-19, backlog #633).
//
// The lever ports the pit's witnessed-catch bootstrap (pitknowledge
// 2026-10-18, villager-objectives.js objReturnEffect 'traps') to the
// snare: witnessing an NPC snare catch grants snare recipe L1 — NO trust
// gate, like the pit. The trust-15 gates stay on the TRAP TEACHING beat
// and the SNARE OVERHEAR channel.
//
// RED honesty: run against the UNPATCHED tree — the home-catch grant
// checks FAIL (the hook does not exist). GREEN: against the patched tree
// all checks pass. Trust is pinned at 10 before every call so the
// trust-15 teach beat can never fire and confound the catch channel.
//
// KILL NOTE (2026-10-19): the sim-snarecatch-b pilot missed its
// pre-registered GO bar (7/16 vs 7/16) and the hook was reverted per
// kill protocol — this test REDs on master by design. It is kept as the
// instrument for the next trapline arm that re-tries the hook.
//
// Harness: the real shared kit (scripts/sim-harness.js, loadGame+
// setupGame); Math.random seeded BEFORE eval inside the harness, so the
// module-captured R() is deterministic. The real Game.objReturnEffect is
// driven directly — no mocks of the mechanic under test.
'use strict';
const assert = require('assert');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}

async function main() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 300, mode: 'snarecatch-test' });
  await setupGame(Game);

  const v = Game.state.village || {};
  const roster = v.roster || [];
  const knower = roster.find(vid => { try { const vp = Game.vpOf(vid); return vp && vp.knowsSnare && !vp.dead; } catch (e) { return false; } });
  assert.ok(knower, 'test needs a snare-knower in the seed-300 cast — FAIL LOUDLY if none');
  const pitKnower = roster.find(vid => { try { const vp = Game.vpOf(vid); return vp && vp.knowsPit && !vp.dead; } catch (e) { return false; } });

  const grants = [];   // {id, level, src} from _grantRecipe
  const catches = [];  // per-call npc_trap {caught} flags (rebuilt each call)
  const catchLearns = []; // snare_catch_learn tele events (mechanism attribution)
  const sayLines = []; // narration captured for the sense test
  const origGR = Game._grantRecipe.bind(Game);
  Game._grantRecipe = function (id, level, src) {
    try { grants.push({ id: String(id), level, src: Object.assign({}, src) }); } catch (e) {}
    return origGR(id, level, src);
  };
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'npc_trap') catches.push(!!(data && data.caught));
      if (type === 'npc_pit') catches.push('pit:' + !!(data && data.kcal));
      if (type === 'snare_catch_learn') catchLearns.push({ teacher: data && data.teacher });
    } catch (e) {}
    return origTele(type, data);
  };
  const origSay = Game.say.bind(Game);
  Game.say = function (line) { try { sayLines.push(String(line)); } catch (e) {} return origSay(line); };

  const atHaven = () => { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); };
  const away = () => { Game.map.px = 0; Game.map.py = 0; };
  const pinTrust10 = () => { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[knower] = 10; };

  const snareLevel = () => { try { return (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; } catch (e) { return 0; } };
  assert.strictEqual(snareLevel(), 0, 'scholar starts L0 on snare');

  // Drive objReturnEffect('traps') until fn(perCallCaught) is satisfied.
  // Returns the list of per-call caught flags observed.
  function driveUntil(vid, maxCalls, done) {
    const seen = [];
    for (let i = 0; i < maxCalls; i++) {
      pinTrust10();
      catches.length = 0;
      Game.objReturnEffect(vid, 'traps');
      const caught = catches.some(c => c === true);
      seen.push(caught);
      if (done(caught, seen)) return seen;
    }
    return seen;
  }

  // ---- AWAY: catch happens, but no grant (witness gate) ------------------
  away();
  const g0 = grants.length;
  const awaySeen = driveUntil(knower, 60, (caught) => caught);
  check('away: a snare catch occurs within 60 returns', () => {
    assert.ok(awaySeen.some(Boolean), 'no catch observed — test vacuous');
  });
  check('away: unwitnessed catch grants NOTHING (witness gate)', () => {
    assert.strictEqual(grants.length, g0, 'grant fired while scholar away');
    assert.strictEqual(snareLevel(), 0);
  });

  // ---- HOME: witnessed catch at trust 10 grants L1, no trust gate --------
  atHaven();
  grants.length = 0; sayLines.length = 0;
  const snareGrantCount = () => grants.filter(g => g.id === 'snare').length;
  const pairings = []; // {caught, grantedThisCall} — snare grants only (pit grants are the pit bootstrap)
  let seen2 = [];
  for (let i = 0; i < 60; i++) {
    pinTrust10();
    catches.length = 0;
    const gb = snareGrantCount();
    Game.objReturnEffect(knower, 'traps');
    const caught = catches.some(c => c === true);
    pairings.push({ caught, grantedThisCall: snareGrantCount() > gb });
    seen2.push(caught);
    if (caught && snareGrantCount() > gb) break;
  }
  check('home: a witnessed snare catch occurs within 60 returns', () => {
    assert.ok(seen2.some(Boolean), 'no catch observed — test vacuous');
  });
  check('GREEN home: witnessed catch at trust 10 grants snare L1 (no trust gate)', () => {
    const g = grants.find(g => g.id === 'snare' && g.level === 1);
    assert.ok(g, 'no snare L1 grant on witnessed catch — RED on unpatched tree');
    assert.strictEqual(g.src.type, 'witnessed', 'grant type mirrors the pit bootstrap');
    assert.ok(catchLearns.length >= 1, 'snare_catch_learn tele fired with the grant (mechanism attribution)');
    assert.strictEqual(snareLevel(), 1);
  });
  check('every grant fired on a caught call (hook lives in the catch block)', () => {
    assert.ok(pairings.some(p => p.grantedThisCall && p.caught), 'no caught-call grant');
    assert.ok(!pairings.some(p => p.grantedThisCall && !p.caught), 'grant on an uncaught call');
  });
  check('the trust-15 teach beat stayed off (no taught grant, taughtSnare unset)', () => {
    assert.ok(!grants.some(g => g.id === 'snare' && g.src && g.src.type === 'taught'), 'teach beat fired at trust 10');
    const vp = Game.vpOf(knower);
    assert.ok(!(vp && vp.taughtSnare), 'taughtSnare set without the teach beat');
  });
  check('L1 gate: further witnessed catches grant nothing more (once-per via L0)', () => {
    // jorge knows the pit too — pit grants during these calls are the
    // pit bootstrap working, not a snare re-grant. Count snare only.
    const n = grants.filter(g => g.id === 'snare').length;
    for (let i = 0; i < 40; i++) { pinTrust10(); catches.length = 0; Game.objReturnEffect(knower, 'traps'); }
    assert.strictEqual(grants.filter(g => g.id === 'snare').length, n, 'second snare grant fired at L1+');
    assert.strictEqual(snareLevel(), 1);
  });
  check('the learn beat narrates (SENSE-TESTING LAW: read it)', () => {
    const line = sayLines.find(l => l.indexOf('shape of it') >= 0 && l.indexOf('snare') >= 0);
    assert.ok(line, 'no learn narration captured; sayLines=' + sayLines.length);
    console.log('    > ' + line);
  });

  // ---- DET-GATE: the pit witnessed-catch bootstrap is unchanged ----------
  check('det-gate: a pit knower exists in the seed-300 cast', () => {
    assert.ok(pitKnower, 'no pit knower in cast — det-gate vacuous');
  });
  if (pitKnower) {
    const pg0 = grants.length;
    Game.state.village.trust[pitKnower] = 10;
    // The seed-300 knower knows BOTH wire and pit, so the snare loops
    // above may already have fired the pit bootstrap (pit_trap L1). Re-arm
    // the L0 gate for the det-gate — it tests the bootstrap's presence,
    // not the village's memory.
    try { delete Game.state.codex.recipes.pit_trap; } catch (e) {}
    let pitCatchSeen = false;
    for (let i = 0; i < 200 && !pitCatchSeen; i++) {
      Game.state.village.trust[pitKnower] = 10;
      catches.length = 0;
      Game.objReturnEffect(pitKnower, 'traps');
      pitCatchSeen = catches.some(c => c === 'pit:true');
    }
    check('det-gate: pit witnessed-catch bootstrap still fires post-change', () => {
      assert.ok(pitCatchSeen, 'no pit catch observed in 80 returns — det-gate vacuous');
      const g = grants.slice(pg0).find(g => g.id === 'pit_trap' && g.level === 1 && g.src && g.src.type === 'witnessed');
      assert.ok(g, 'pit bootstrap did not grant on witnessed pit catch');
    });
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
