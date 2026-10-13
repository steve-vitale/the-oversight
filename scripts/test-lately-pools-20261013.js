#!/usr/bin/env node
// scripts/test-lately-pools-20261013.js — journey deepening r10 PROOF (2026-10-13).
//
// Blank filled: t2fol_lately's non-mourning kinds (naming, threat, defense,
// betrayal, tension, hunger, gratitude, cheer, none) each had a single line
// per follow-up level — the same thinness R9 fixed for mourning. Every
// villager on every seed recited the identical three-line sequence verbatim
// for whatever the village was going through ("I sleep with my boots on
// now." xN). Fix: 3 variants per level per kind, using the villager's own
// habit ({habitI}, t2fill); variant 0 of each pool is always the original
// line (tone preserved).
//
// RED (pre-fix): 1 line/level for every non-mourning kind.
// GREEN (post-fix): 3 lines/level for every kind; {habitI} fills clean;
//   originals present; villagers diverge via convoPick's run-ledger.
//
// Scope: the pools inside t2fol_lately (what changed). Event detection
// (t2LatelyEvent) is untouched, so kinds are forced by patching it; one
// end-to-end check keeps real mourning resolution as the regression guard.
//
// Usage: node scripts/test-lately-pools-20261013.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// variant-0 lines per kind, verbatim originals (tone-preserved regression guard)
const ORIGINALS = {
  naming: ["I'm staying out of the naming fight", "usually the loudest person's idea", "until the shouting stops"],
  threat: ["I sleep with my boots on now", "We set a better watch", "I take the watch nobody wants"],
  defense: ["The treeline gets loud in my head", "somebody has to meet them", "I was at the door"],
  betrayal: ["I'm watching", "it gets talked out or it festers", "I keep my word"],
  tension: ["I stay out of it", "the thing nobody's saying", "I talk to both sides"],
  hunger: ["Small meals", "We need food", "I share what I have"],
  gratitude: ["I'll pay it forward", "becoming something", "I say thank you like I mean it"],
  cheer: ["letting myself feel it", "More of this", "I laugh"],
  none: ["Ask me tomorrow", "Same as always: we endure", "I show up"],
  mourning: ["It just keeps my hands from shaking", "There's no step four", "Someone has to do it properly"],
};
const KINDS = Object.keys(ORIGINALS);

async function runOne(seed) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed, mode: 'lately-pools-r10' });
  await setupGame(Game);
  const v = Game.state.village;
  const scholar = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== scholar && !(Game.getPerson(id) || {}).dead).slice(0, 3);
  if (npcs.length < 3) { console.log('  FAIL setup: need 3 live NPCs'); fail++; return; }

  const realEvent = Game.t2LatelyEvent.bind(Game);
  for (const kind of KINDS) {
    // force the kind (event detection itself is unchanged by this fix)
    Game.t2LatelyEvent = () => ({ kind, name: kind === 'mourning' ? 'TestDead' : null });
    const pools = npcs.map(vid => Game.t2fol_lately(vid));
    ok(`${kind}: three follow-up levels`, pools.every(p => p.length === 3),
      JSON.stringify(pools.map(p => p.length)));
    ok(`${kind}: three variants per level`, pools.every(p => p.every(lv => lv.length === 3)),
      JSON.stringify(pools.map(p => p.map(lv => lv.length))));
    const flat = pools.flat(2).map(String);
    const joined = flat.join('\n');
    for (const orig of ORIGINALS[kind]) {
      ok(`${kind}: original kept ("${orig.slice(0, 34)}…")`, joined.includes(orig));
    }
    // {habitI} present on the non-mourning variants (mourning already proven by r9)
    if (kind !== 'mourning') {
      ok(`${kind}: {habitI} used`, flat.some(l => l.includes('{habitI}')));
    }
    // full fill path: no unfilled braces, no raw {mname} outside mourning
    let clean = true, sample = '';
    for (const vid of npcs) {
      for (const lv of pools[npcs.indexOf(vid)]) {
        for (const raw of lv) {
          let filled;
          try { filled = Game.t2fill(String(raw), Game.vpOf(vid), vid); }
          catch (e) { filled = 'FILL-ERR ' + e.message; }
          if (/\{[a-zA-Z]+\}/.test(filled) || (kind !== 'mourning' && filled.includes('{mname}'))) {
            clean = false; sample = filled.slice(0, 120);
          }
        }
      }
    }
    ok(`${kind}: t2fill clean on all variants`, clean, sample);
    // divergence across villagers on the same level
    const picks = npcs.map(vid => {
      try { return Game.t2pick(vid, 't2:lately', pools[0][0]); } catch (e) { return 'PICK-ERR'; }
    });
    ok(`${kind}: villagers diverge`, new Set(picks.map(String)).size > 1, picks.join(' | ').slice(0, 160));
    // sense sample: print one filled variant per level for the run note
    const vid0 = npcs[0];
    const samp = pools[0].map(lv => {
      const raw = lv.find(l => String(l).includes('{habitI}')) || lv[0];
      try { return Game.t2fill(String(raw), Game.vpOf(vid0), vid0); } catch (e) { return raw; }
    });
    console.log(`  SENSE [${kind}]: ${samp.map(s => String(s).slice(0, 80)).join(' / ')}`);
  }
  // end-to-end regression: real event resolution still returns a valid kind
  Game.t2LatelyEvent = realEvent;
  const dead = npcs[0];
  try { Game.getPerson(dead).dead = true; } catch (e) {}
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push({ villagerId: dead, name: 'TestDead' });
  v.grief = 5;
  let ev = null;
  try { ev = Game.t2LatelyEvent(npcs[1]); } catch (e) { ev = 'ERR'; }
  ok('real mourning event still resolves', ev && ev.kind === 'mourning', JSON.stringify(ev && ev.kind));
  const fol = Game.t2fol_lately(npcs[1]);
  ok('real mourning pools 3/level end-to-end', fol.length === 3 && fol.every(lv => lv.length === 3));
}

(async () => {
  for (const s of [7, 42, 99]) await runOne(s);
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();
