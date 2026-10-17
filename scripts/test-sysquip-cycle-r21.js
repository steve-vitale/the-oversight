#!/usr/bin/env node
// test-sysquip-cycle-r21.js — proof for the journey-landing r21 System quip fix.
//
// BUG (spotted in r20's seed-72 System-arrival capture): identifyPlant()
// picked its post-arrival System quip at random from a 4-line pool, so a
// burst of identifications (the arrival dumps village knowledge -> many
// plants named in one stream) repeated the same quip verbatim —
// "SYSTEM: Oh! It has a NAME. You all love names." fired 5x in one stream
// (seed 72; 3x on seed 74, 1x on seeds 70/73). The convo engine already
// cycles generic pools without replacement (CONVERSATIONS.md) — the System
// overlay quips didn't.
//
// FIX: Game.cyclePick(key, pool) — draw without replacement; the pool
// re-randomizes only after every line has been said once. identifyPlant
// now uses it for the System voice gate.
//
// PROOF (deterministic, seed-independent): Math.random is rigged to a
// constant 0 stream for the fixture. On the OLD code that forces pool[0]
// every pick (8 identical quips -> the test's no-repeat-in-a-cycle
// assertion fails = RED). On the NEW code cyclePick draws bag[0] in order
// -> 0,1,2,3,0,1,2,3 — every 4-pick window is a full permutation (GREEN).
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}

const POOL = [
  'SYSTEM: Naming things. Very human. The audience approves.',
  'SYSTEM: Oh! It has a NAME. You all love names.',
  'SYSTEM: Catalogued. The Codex grows teeth.',
  'SYSTEM: Identification complete. You are 0.3% less lost.',
];
const inPool = new Set(POOL);

async function main() {
  const { Game, loadFails } = await loadGame();
  ok(!loadFails || !loadFails.length, 'game modules loaded', String(loadFails && loadFails.length));
  await setupGame(Game);
  Game.state.systemArrived = true;

  const lines = [];
  const origSay = Game.say;
  Game.say = function (s) { lines.push(String(s)); try { return origSay.call(this, s); } catch (e) {} };

  // 8 unknown plants to identify
  const pids = [];
  for (const p of (Game.data.plants || [])) {
    if (pids.length >= 8) break;
    try { if (!Game.plantKnown(p.id)) pids.push(p.id); } catch (e) {}
  }
  ok(pids.length === 8, 'fixture: 8 unknown plants available', 'found ' + pids.length);

  // Rig the RNG to a constant stream: deterministic on old AND new code.
  const savedRandom = Math.random;
  Math.random = () => 0;
  try {
    for (const pid of pids) {
      let r = false;
      try { r = Game.identifyPlant(pid, 'test'); } catch (e) { ok(false, 'identifyPlant threw', String(e && e.message)); }
      if (!r) ok(false, 'identifyPlant returned false for ' + pid);
    }
  } finally { Math.random = savedRandom; }

  const quips = lines.filter(l => l.indexOf('SYSTEM: ') === 0 && inPool.has(l));
  ok(quips.length === 8, '8 System quips fired (one per identification)', 'fired ' + quips.length);

  // The cycle property: no repeat inside any window of pool size.
  let repeatInWindow = false;
  for (let i = 0; i + POOL.length <= quips.length; i++) {
    const win = quips.slice(i, i + POOL.length);
    if (new Set(win).size !== win.length) { repeatInWindow = true; break; }
  }
  ok(!repeatInWindow, 'no verbatim repeat within any 4-pick window (cycle, not random)',
    repeatInWindow ? 'first 4 quips: ' + JSON.stringify(quips.slice(0, 4)) : '');

  // First window is a full permutation of the pool.
  const first = new Set(quips.slice(0, POOL.length));
  ok(first.size === POOL.length && POOL.every(q => first.has(q)),
    'first cycle covers the whole pool exactly once');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failures: ' + failures.join(', ')); process.exit(1); }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
