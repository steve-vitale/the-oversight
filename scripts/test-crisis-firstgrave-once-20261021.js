#!/usr/bin/env node
// test-crisis-firstgrave-once-20261021.js — CRISIS LEG r36: regression guard for
// the r35 "first-grave fired 2x" lead. Root cause: the r35 instrument counted
// fireCrisis CALLS, not true FIRES. fireCrisis dedupes once-per-kind-per-run
// (progression.js) — the second and later calls return false. This test drives
// two real villager deaths through registerDeath and asserts the 'first-grave'
// crisis beat FIRES exactly once.
// Usage: node scripts/test-crisis-firstgrave-once-20261021.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 101, mode: 'test-firstgrave-once' });
  await setupGame(Game);
  let pass = 0, fail = 0;
  const ok = (cond, name) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };

  const roster = ((Game.state.village || {}).roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead && id !== Game.villagerId; } catch (e) { return false; }
  });
  ok(roster.length >= 2, `have >=2 living villagers (got ${roster.length})`);

  // count TRUE fires (return value === true), not calls
  let trueFires = 0, calls = 0;
  const _fc = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    const r = _fc ? _fc.call(this, kind, ctx) : undefined;
    if (kind === 'first-grave') { calls++; if (r === true) trueFires++; }
    return r;
  };

  const nm = (id) => { try { return Game.displayName(id); } catch (e) { return 'Someone'; } };
  Game.registerDeath({ kind: 'villager', villagerId: roster[0], name: nm(roster[0]), cause: 'test-one' });
  Game.registerDeath({ kind: 'villager', villagerId: roster[1], name: nm(roster[1]), cause: 'test-two' });

  ok(calls === 2, `fireCrisis('first-grave') called twice (got ${calls})`);
  ok(trueFires === 1, `fireCrisis('first-grave') FIRED exactly once (got ${trueFires})`);

  // direct double-call also dedupes
  const r3 = Game.fireCrisis('first-grave', { name: 'Nobody' });
  ok(r3 === false, 'third fireCrisis call returns false (dedupe holds)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
