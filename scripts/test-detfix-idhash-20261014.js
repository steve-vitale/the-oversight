'use strict';
// test-detfix-idhash-20261014.js — proof test for the stable-person-key
// determinism fix (sixthlink-r27 arm, 2026-10-14).
//
// BUG CLASS (entropy-hunt r26, continued): villager IDs embed Date.now()
// (membership.js: 'app_' + Date.now().toString(36) + ...), so any engine path
// that hashes the ID STRING gives a different value on every in-process run
// of the same seed. r26 fixed the contestEngine.js sites; det-gate on the
// courtship stack still failed on s11/s22. Three more state-changing sites
// hashed the ID string:
//   1. traderKnowledge(vid) — game.js: which plants a trader knows (2-3)
//   2. showResolveVillager(pid, show) — contests.js: villager contest fate
//   3. convoFavorHash(vid, ctx) — convo-wants.js: favor slot combinations
// FIX: Game.stablePersonKey(vid) — the villager's index in data.villagers
// (append-only, deterministic creation order per seed) — hashed instead of
// the ID string. No RNG consumed, no feel/combat/UI change: the values are
// equally arbitrary, now reproducible run-to-run.
//
// PROOF (this file): invariance to ID-string changes. We take a real
// villager, record the three functions' outputs, then REWRITE its ID to a
// different timestamp-style string (simulating what another in-process run
// would mint) and verify the outputs are UNCHANGED. Under the old code
// (hash the ID string), every output would change; under the fix (hash the
// stable index key), none do. We also verify distinct villagers still get
// distinct keys (variation preserved, not a constant).
//
// Run: node scripts/test-detfix-idhash-20261014.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// A different timestamp-style ID, as another in-process run would mint.
function altId(vid, salt) {
  return 'app_' + Date.now().toString(36) + salt + Math.floor(Math.random() * 999);
}

(async () => {
  console.log('=== stable-person-key invariance proof (seed 11) ===');
  const { Game } = await loadGame({ seed: 11, mode: 'idhash-proof' });
  await setupGame(Game);
  const villagers = (Game.data.villagers || []).filter(v => v && v.id && !v.dead);
  check('villagers present', villagers.length > 3, 'n=' + villagers.length);

  const v = villagers[2];
  const origId = v.id;
  const keyBefore = Game.stablePersonKey(origId);
  const tkBefore = JSON.stringify(Game.traderKnowledge(origId, true));
  const srBefore = JSON.stringify(Game.showResolveVillager(origId, { id: 'proof-show' }, {}));
  const cfBefore = Game.convoFavorHash(origId, { day: 50, seq: 2 });

  // Simulate another run's ID for the SAME villager (same index, new string).
  v.id = altId(origId, 'x');
  const keyAfter = Game.stablePersonKey(v.id);
  const tkAfter = JSON.stringify(Game.traderKnowledge(v.id, true));
  const srAfter = JSON.stringify(Game.showResolveVillager(v.id, { id: 'proof-show' }, {}));
  const cfAfter = Game.convoFavorHash(v.id, { day: 50, seq: 2 });

  check('ID string actually changed', v.id !== origId, origId + ' -> ' + v.id);
  check('stablePersonKey invariant to ID change', keyBefore === keyAfter,
    keyBefore + ' vs ' + keyAfter);
  check('traderKnowledge invariant to ID change', tkBefore === tkAfter,
    tkBefore + ' vs ' + tkAfter);
  check('showResolveVillager invariant to ID change', srBefore === srAfter,
    srBefore + ' vs ' + srAfter);
  check('convoFavorHash invariant to ID change', cfBefore === cfAfter,
    cfBefore + ' vs ' + cfAfter);

  // Variation preserved: distinct villagers, distinct keys/outputs.
  const keys = new Set(villagers.slice(0, 8).map(x => Game.stablePersonKey(x.id)));
  check('stablePersonKey varies across villagers (not a constant)', keys.size > 1,
    'size=' + keys.size);
  const tks = new Set(villagers.slice(0, 8).map(x => JSON.stringify(Game.traderKnowledge(x.id, true))));
  check('traderKnowledge varies across villagers', tks.size > 1, 'size=' + tks.size);

  // Restore (hygiene; the Game is discarded anyway).
  v.id = origId;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
