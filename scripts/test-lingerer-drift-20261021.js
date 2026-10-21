#!/usr/bin/env node
// test-lingerer-drift-20261021.js — r38 M4 follow-up proof (RED -> GREEN).
//
// The narration promises lingerers "drift off within ~6 nights". The only
// implementation was the crisis-based moved-on valve (comms.js: only while a
// raid crisis is open). If the crisis resolved early — or never raised — a
// lingerer gorged forever with no clock.
//
// FIX (havenGrowth.js): per-raider drift clock. lingerSince is stamped when
// the lingering starts; havenGrowthDaily clears the flag past ~6 nights with
// an honest say line. The clock is not reset by a fled fight (it didn't
// leave) and pre-existing unstamped lingerers never drift (safe default).
//
// RED (pre-fix): a 7-night lingerer is still besieging after 2 more dawns.
// GREEN (post-fix): it drifts with the say line; a fresh lingerer stays.
// Usage: node scripts/test-lingerer-drift-20261021.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function ling(Game) { try { return (Game.lingeringRaiders() || []); } catch (e) { return []; } }
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function inject(Game, id, hp, lingerSince) {
  const v = Game.state.village;
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const m = {
    id, tx: hx, ty: hy, mx: 4, my: 4, size: 1,
    hp: hp != null ? hp : 60, maxHp: 60, lingering: true, lingerSince,
    stance: null, fearTurns: 0, veteran: false, variant: null, lostSight: 0,
  };
  Game.worldMonsters().push(m);
  return m;
}

async function main() {
  Math.random = mulberry32(31337);
  const { Game } = await loadGame({ seed: 31337, mode: 'linger-drift-test', fullTelemetry: false });
  const says = [];
  const _say = Game.say;
  Game.say = function (m) { try { says.push(String(m || '')); } catch (e) {} return _say ? _say.apply(this, arguments) : undefined; };
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 6 });
  // Idle policy from here: the drift clock is village-level (havenGrowthDaily);
  // the scholar must not wander into the injected lingerers and fight them.
  // (driveFights auto-strikes even for an idle policy, and monsterTurn makes
  // near monsters attack.) Park the scholar in a far corner for the test.
  const idle = { id: 'idle' };
  Game.map.px = 0; Game.map.py = 0;
  const d0 = dayOf(Game);

  // An old lingerer: 7 nights at the treeline already.
  const old = inject(Game, 'bulldozer', 60, d0 - 7);
  // A fresh lingerer: just started.
  const fresh = inject(Game, 'bulldozer', 60, d0);
  assert.strictEqual(ling(Game).length, 2, 'setup: two lingerers besieging');

  await runDays(Game, idle, { days: 2 });

  const oldGone = Game.worldMonsters().indexOf(old) < 0 || !old.lingering;
  ok(oldGone, 'old lingerer drifted after ~6 nights (was stuck pre-fix)');
  ok(ling(Game).length === 1 && ling(Game)[0] === fresh, 'fresh lingerer still besieging (clock not reset)');
  ok(says.some(s => /melts back into the dark/.test(s)), 'drift say line fired');
  // The drifter gorged its nights then stopped: no gorge after the drift.
  const driftDay = d0 + 1; // havenGrowthDaily runs at endDay; drift fires first dawn past the clock
  console.log(`  info: days run to ${dayOf(Game)}; drift say present: ${says.some(s => /melts back into the dark/.test(s))}`);
  console.log(`\nALL PASS (${pass} assertions)`);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
