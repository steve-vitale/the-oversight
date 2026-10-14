'use strict';
// test-detfix-idhash-20261014.js — proof test for the stable-person-key
// determinism fix (sixthlink-r27 arm, 2026-10-14).
//
// BUG CLASS (entropy-hunt r26, continued): villager IDs embed Date.now()
// (membership.js), so any engine path that hashes the ID STRING gives a
// different value on every in-process run of the same seed. r26 fixed the
// contestEngine.js sites; det-gate on the courtship stack still failed on
// s11/s22 (divergence d41-d76, moving between runs — wall-clock signature).
// Three more state-changing sites hashed the ID string:
//   1. traderKnowledge(vid) — game.js: which plants a trader knows (2-3)
//   2. showResolveVillager(pid, show) — contests.js: villager contest fate
//   3. convoFavorHash(vid, ctx) — convo-wants.js: favor slot combinations
// FIX: Game.stablePersonKey(vid) — the villager's index in data.villagers
// (append-only, deterministic creation order per seed) — hashed instead of
// the ID string. No RNG consumed, no feel/combat/UI change: the values are
// equally arbitrary, now reproducible run-to-run.
//
// PROOF (this file):
//   A. mechanism: two in-process runs of seed 11 produce DIFFERENT villager
//      ID strings (proving the test isn't vacuous) but IDENTICAL
//      stablePersonKey values per villager position.
//   B. effect: traderKnowledge / showResolveVillager / convoFavorHash return
//      identical values across the two runs (they differed before the fix).
//   C. integration: scripts/det-gate-sixthlink-r27-20261014.js flips GREEN
//      on s11/s22 (run separately; the gate is the mandated check).
//
// Run: node scripts/test-detfix-idhash-20261014.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  console.log('=== stable-person-key determinism proof (seed 11, two in-process runs) ===');
  const runs = [];
  for (let i = 0; i < 2; i++) {
    const { Game } = await loadGame({ seed: 11, mode: 'idhash-proof' });
    await setupGame(Game);
    runs.push(Game);
    // Force a wall-clock gap: villager IDs embed Date.now() at ms resolution;
    // back-to-back loadGames can land in the same millisecond (identical IDs),
    // which would make this test vacuous. The det-gate divergence needs the
    // IDs to actually differ, as they do between real sequential runs.
    await new Promise(r => setTimeout(r, 1500));
  }
  const [A, B] = runs;
  const vA = (A.data.villagers || []).filter(v => v && v.id && !v.dead);
  const vB = (B.data.villagers || []).filter(v => v && v.id && !v.dead);
  check('both runs have villagers', vA.length > 3 && vB.length > 3, `A=${vA.length} B=${vB.length}`);
  check('same villager count both runs', vA.length === vB.length, `A=${vA.length} B=${vB.length}`);

  // A. IDs differ (wall-clock component) — the test is not vacuous.
  const idsDiffer = vA.some((v, i) => vB[i] && v.id !== vB[i].id);
  check('villager ID strings differ across runs (wall-clock leak present)', idsDiffer,
    'ids identical — leak not exercised, test vacuous');

  // A2. stablePersonKey matches per position across runs.
  let keyMatch = 0, keyTotal = 0;
  for (let i = 0; i < Math.min(vA.length, vB.length); i++) {
    keyTotal++;
    if (A.stablePersonKey(vA[i].id) === B.stablePersonKey(vB[i].id)) keyMatch++;
  }
  check(`stablePersonKey identical per villager position (${keyMatch}/${keyTotal})`, keyMatch === keyTotal && keyTotal > 0);

  // B1. traderKnowledge identical.
  let tkSame = 0, tkTotal = 0, tkDiffDetail = '';
  for (let i = 0; i < Math.min(vA.length, vB.length, 6); i++) {
    tkTotal++;
    const ka = JSON.stringify(A.traderKnowledge(vA[i].id, true));
    const kb = JSON.stringify(B.traderKnowledge(vB[i].id, true));
    if (ka === kb) tkSame++; else tkDiffDetail = `pos ${i}: ${ka} vs ${kb}`;
  }
  check(`traderKnowledge identical across runs (${tkSame}/${tkTotal})`, tkSame === tkTotal, tkDiffDetail);

  // B2. showResolveVillager identical.
  let srSame = 0, srTotal = 0, srDetail = '';
  for (let i = 0; i < Math.min(vA.length, vB.length, 6); i++) {
    srTotal++;
    const ra = JSON.stringify(A.showResolveVillager(vA[i].id, { id: 'proof-show' }, {}));
    const rb = JSON.stringify(B.showResolveVillager(vB[i].id, { id: 'proof-show' }, {}));
    if (ra === rb) srSame++; else srDetail = `pos ${i}: ${ra} vs ${rb}`;
  }
  check(`showResolveVillager identical across runs (${srSame}/${srTotal})`, srSame === srTotal, srDetail);

  // B3. convoFavorHash identical.
  let cfSame = 0, cfTotal = 0, cfDetail = '';
  for (let i = 0; i < Math.min(vA.length, vB.length, 6); i++) {
    cfTotal++;
    const ctx = { day: 50, seq: 2 };
    const ha = A.convoFavorHash(vA[i].id, ctx);
    const hb = B.convoFavorHash(vB[i].id, ctx);
    if (ha === hb) cfSame++; else cfDetail = `pos ${i}: ${ha} vs ${hb}`;
  }
  check(`convoFavorHash identical across runs (${cfSame}/${cfTotal})`, cfSame === cfTotal, cfDetail);

  // B4. distinct villagers still get distinct keys (variation preserved).
  const keys = new Set(vA.slice(0, 8).map(v => A.stablePersonKey(v.id)));
  check('stablePersonKey varies across villagers (not a constant)', keys.size > 1, 'size=' + keys.size);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
