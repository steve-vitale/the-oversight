#!/usr/bin/env node
// scripts/test-mourning-pools-20261013.js — journey deepening r9 PROOF (2026-10-13).
//
// Blank filled: t2fol_lately's mourning follow-ups were a single-line-per-level
// global script — every grieving villager on every seed recited the identical
// three-line sequence verbatim ("It just keeps my hands from shaking." /
// "There's no step four." / "Someone has to do it properly."), transcript-
// verified on seeds 99 and 10101. Fix: 3 variants per level, using the
// villager's own habit ({habitI}) and the dead person's knowledge-gated name
// ({mname}).
//
// RED (pre-fix): pools have 1 line/level; {mname} unsupported; two villagers
//   pick the identical sequence.
// GREEN (post-fix): 3 lines/level; {mname} substituted with the dead person's
//   name; {habitI} survives for t2fill; the three original lines still present
//   (variant 0 of each pool); villagers diverge via convoPick's run-ledger
//   preference.
//
// Usage: SEED=7 node scripts/test-mourning-pools-20261013.js  (default runs 7,42,99)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function runOne(seed) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed, mode: 'mourning-pools-r9' });
  await setupGame(Game);
  const v = Game.state.village;
  const scholar = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== scholar && !(Game.getPerson(id) || {}).dead).slice(0, 3);
  if (npcs.length < 3) { console.log('  FAIL setup: need 3 live NPCs'); fail++; return; }
  // force acute grief with a named corpse
  const dead = npcs[0];
  try { Game.getPerson(dead).dead = true; } catch (e) {}
  const deadName = (Game.displayName ? Game.displayName(dead) : null) || 'TestDead';
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push({ villagerId: dead, name: deadName });
  v.grief = 5;

  const vids = npcs.slice(1); // the survivors who grieve
  const pools = vids.map(vid => Game.t2fol_lately(vid));
  ok('three follow-up levels', pools.every(p => p.length === 3), JSON.stringify(pools.map(p => p.length)));
  ok('three mourning variants per level', pools.every(p => p.every(lv => lv.length === 3)),
    JSON.stringify(pools.map(p => p.map(lv => lv.length))));
  const flat = pools.flat(2);
  ok('no raw {mname} left in pools', flat.every(l => !String(l).includes('{mname}')));
  ok('{habitI} survives for t2fill', flat.some(l => String(l).includes('{habitI}')));
  // the name made it in somewhere (or a 'them' fallback when name is null)
  const evName = (() => { try { const ev = Game.t2LatelyEvent(vids[0]); return ev && ev.name; } catch (e) { return null; } })();
  // compare against ev.name (firstRef, the knowledge-gated name the game uses),
  // not displayName — they legitimately differ
  const named = evName ? flat.some(l => String(l).includes(evName)) : true;
  ok('dead person named in variants', named, `evName=${evName}`);
  // the three originals still present (regression: tone preserved)
  const joined = flat.join('\n');
  ok('original cope line kept', joined.includes("It just keeps my hands from shaking."));
  ok('original next line kept', joined.includes("There's no step four."));
  ok('original part line kept', joined.includes("Someone has to do it properly."));
  // full fill path: no unfilled braces after t2fill
  for (const vid of vids) {
    for (const lv of pools[vids.indexOf(vid)]) {
      for (const raw of lv) {
        let filled;
        try { filled = Game.t2fill(String(raw), Game.vpOf(vid), vid); } catch (e) { filled = 'FILL-ERR ' + e.message; }
        ok(`t2fill clean (vid ${String(vid).slice(-4)})`, !/\{[a-zA-Z]+\}/.test(filled), filled.slice(0, 120));
      }
    }
  }
  // divergence: three villagers picking level-0 from identical pools should
  // not all land on the same line (run-ledger preference spreads them)
  const picks = vids.map(vid => {
    try { return Game.t2pick(vid, 't2:lately', pools[0][0]); } catch (e) { return 'PICK-ERR'; }
  });
  console.log('  INFO level-0 picks:', picks.map(p => String(p).slice(0, 60)));
  ok('villagers diverge (not all identical)', new Set(picks.map(String)).size > 1, picks.join(' | ').slice(0, 200));
}

async function main() {
  const seeds = process.env.SEED ? [parseInt(process.env.SEED, 10)] : [7, 42, 99];
  for (const s of seeds) await runOne(s);
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
