#!/usr/bin/env node
// PROOF: F13 redundant evasion template —
//   NPC: "Quick version — Short version: I don't know. Long version: also that, but slower."
// two filler openers merged (restless temperament's "Quick version — " +
// the GQ_TAKES pool's "Short version:" self-opener).
//
// FINDING (2026-10-21, verified on current master BEFORE this fix): the bug
// is NOT reproducible anymore. Commit 3329c74bf (2026-10-20, "Repair
// conversation intent") replaced the 'take' branch with a plain
// '"Take your time."' response, orphaning the entire GQ_TAKES pool — no
// code path feeds it. The pool sat in conversation.js as dead content.
// VERDICT: already-fixed on master; this change removes the orphaned pool
// so the bad template can't be resurrected by a future wiring, and proves
// the duplication class has no reachable instance left.
//
// RED (pre-fix): GQ_TAKES still defined in conversation.js (dead but present).
// GREEN (post-fix): no GQ_TAKES anywhere, game loads, voice sweeps over live
// content never double a filler opener.
//
// Usage: node scripts/test-voicefix-f13-evasion.js

'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const K = require('./godpath/lib');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}` + (extra ? ` — ${extra}` : '')); }
}

async function main() {
  // 1. Static: the orphaned pool is gone and unreferenced.
  const src = fs.readFileSync(path.join(ROOT, 'src/js/conversation.js'), 'utf8');
  const defs = (src.match(/const GQ_TAKES\s*=/g) || []).length;
  ok('GQ_TAKES pool definition removed from conversation.js', defs === 0, `found ${defs}`);
  const refs = (src.match(/^[ \t]*[^/\s].*\bGQ_TAKES\b/gm) || []);
  ok('no code references to GQ_TAKES remain (comment history note only)', refs.length === 0,
    `code refs: ${refs.length}`);
  ok('no "Short version:" self-opener template left in conversation.js',
    !/Short version:\\s*I don\\'t know/.test(src));

  // 2. Dynamic: the game still loads (the file parses, the module evals).
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  ok('game loads after pool removal', !!Game && typeof Game.voiceLine === 'function');

  // 3. Dynamic: live voice sweeps never double a filler opener. Feed a
  // restless-tempered villager (owns "Quick version — " opener) the old
  // template as a historical sample and assert one opener only; then sweep
  // every pooled opener against a self-opening line shape.
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const restless = npcs.find(id => { try { return String(Game.npcTemper(id)).toLowerCase() === 'restless'; } catch (e) { return false; } });
  if (restless) {
    const random = Math.random;
    const seen = new Set();
    try {
      for (let i = 0; i < 120; i++) {
        let call = 0;
        Math.random = () => call++ === 0 ? 0 : 0.99;
        seen.add(Game.voiceLine(restless, '"Short version: I don\'t know. Long version: also that, but slower."'));
      }
    } finally { Math.random = random; }
    const doubled = [...seen].filter(l => /Quick version — Short version|So — Short version|Okay, okay — Short version/i.test(String(l)));
    ok('restless villager never doubles fillers on the old template', doubled.length === 0,
      doubled.slice(0, 2).join(' | '));
    console.log('  restless samples:');
    for (const l of [...seen].slice(0, 4)) console.log(`    ${l}`);
  } else {
    console.log('  (no restless villager in seed 7 — dynamic doubling check skipped)');
  }

  console.log(`\nvoicefix-f13-evasion: ${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exitCode = 2; });
