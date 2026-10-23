#!/usr/bin/env node
// test-qlaugh-deeper-variants-20261023.js — Q_LAUGH DEEPER VARIANTS proof
// (journey-crisis 2026-10-23 r43).
//
// Finding: the q_laugh bespoke beat's `deeper` line was a singleton string,
// so two villagers in different runs recited the identical paragraph
// verbatim ("They laugh — really laugh..." + "Laughter's a mutiny. A good
// one." — Paola seed303 and Elena seed404, r42 transcripts). The deeper-beat
// variant-pool convention (convoDeeperPick, journey-deepening r32,
// 2026-10-22, built for q_first_week) already supports arrays; q_laugh just
// never got variants.
//
// Fix: q_laugh `deeper` is now a 3-variant array in src/data/characterGen.json
// (data-only; engine unchanged).
//
// Proves:
//   1. q_laugh deeper is an array of 3 distinct variants (data shape).
//   2. convoDeeperPick serves different villagers different lines (no two
//      villagers recite the same paragraph — the reported defect).
//   3. Per-villager no-repeat while the pool is fresh: three picks yield all
//      three variants; the documented exhaustion contract (convoDeeperPick
//      falls back to pool[0] rather than dropping the reliably-queued beat)
//      then applies.
// Usage: node scripts/test-qlaugh-deeper-variants-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

function findQuestion(Game, qid) {
  // characterGen questions live wherever the bespoke defs do; search the
  // loaded data the same way the answer path does (cg.questions).
  try {
    const cg = Game.characterGen || (Game.state && Game.state.characterGen);
    if (cg && cg.questions) {
      const q = cg.questions.find(q => q.id === qid);
      if (q) return q;
    }
  } catch (e) {}
  // fallback: raw file
  try {
    const d = require('../src/data/characterGen.json');
    const stack = [d];
    while (stack.length) {
      const o = stack.pop();
      if (o && typeof o === 'object') {
        if (o.id === qid && o.q) return o;
        for (const v of Object.values(o)) stack.push(v);
      }
    }
  } catch (e) {}
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: 777, mode: 'proof' });
  await setupGame(Game);
  const qd = findQuestion(Game, 'q_laugh');
  ok(!!qd, 'q_laugh def found');
  ok(Array.isArray(qd && qd.deeper), 'q_laugh deeper is an array (variant pool)');
  ok(qd && qd.deeper && qd.deeper.length === 3, 'q_laugh deeper has 3 variants', 'got=' + (qd && qd.deeper && qd.deeper.length));
  const uniq = new Set((qd && qd.deeper) || []);
  ok(uniq.size === 3, 'all 3 variants distinct');

  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  ok(npcs.length >= 3, 'roster has 3+ NPCs', 'npcs=' + npcs.length);
  const [v1, v2, v3] = npcs;

  // 2. two villagers get different lines (village-fresh preference)
  let l1 = null, l2 = null;
  try { l1 = Game.convoDeeperPick(v1, qd); } catch (e) { ok(false, 'convoDeeperPick no-throw v1', e.message); }
  try { l2 = Game.convoDeeperPick(v2, qd); } catch (e) { ok(false, 'convoDeeperPick no-throw v2', e.message); }
  ok(!!l1 && !!l2, 'both villagers got a deeper line');
  ok(l1 !== l2, 'two villagers get DIFFERENT deeper lines (the reported defect is gone)',
    'v1=' + String(l1).slice(0, 40) + ' | v2=' + String(l2).slice(0, 40));

  // 3. per-villager no-repeat while fresh: three picks => all three variants.
  // (v3 is fresh: v1/v2 each spent one variant in check 2.)
  const seen = new Set();
  let threw = false;
  const firstThree = [];
  for (let i = 0; i < 3; i++) {
    try { firstThree.push(Game.convoDeeperPick(v3, qd)); } catch (e) { threw = true; }
  }
  for (const l of firstThree) seen.add(l);
  ok(!threw, 'three picks no-throw');
  ok(seen.size === 3, 'one villager gets all 3 variants with no repeat while fresh', 'distinct=' + seen.size);
  // exhaustion contract: 4th pick falls back to pool[0] (documented, by design)
  let fourth = null;
  try { fourth = Game.convoDeeperPick(v3, qd); } catch (e) { threw = true; }
  ok(fourth === qd.deeper[0], 'exhausted pool falls back to pool[0] (documented contract)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
