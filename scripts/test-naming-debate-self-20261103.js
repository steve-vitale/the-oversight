#!/usr/bin/env node
// test-naming-debate-self-20261103.js — proof for the W4 naming-debate
// self-naming blank (journey-crisis r116, 2026-11-03):
//
// W4 class (r103 Jamal, r114 Simone Jain): a villager reporting the
// monster-naming debate names their OWN proposal in third person from
// their own mouth — Simone: "Simone is pushing 'The Loud Beast'".
// The debate template in t2gen_lately (convoTopics.js, 'naming' case)
// renders props[0] with `who(p0) + ' is pushing ...'` no matter who
// speaks, even when props[0]'s proposer IS the speaker.
//
// AFTER: when the first proposal's proposer is the speaker, the line
// reads first person ("I'm pushing 'Loud Beast'"). When the speaker
// is anyone else, the third-person rendering is unchanged (control).
// Run: node scripts/test-naming-debate-self-20261103.js (seeds 7, 42, 99)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [7, 42, 99];

function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}

async function one(seed) {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  PASS ' : '  FAIL ') + msg); };
  const { Game } = await loadGame({ seed, mode: 'test-naming-debate-self', fullTelemetry: true });
  await setupGame(Game);
  try { Game.state.scholar.day = 15; } catch (e) {}
  const roster = livingRoster(Game).filter(id => String(id) !== String(Game.villagerId));
  ok(roster.length >= 2, `seed ${seed}: 2+ NPC villagers to cast (have ${roster.length})`);
  if (roster.length < 2) return fails;
  const speaker = roster[0], other = roster[1];
  const speakerName = (() => { try { return Game.firstRef(speaker); } catch (e) { return 'someone'; } })();

  // Stage a live naming debate: one monster entry, naming kicked, no
  // village name yet, speaker's proposal first, another villager's second.
  // Neutralize any competing lately event so 'naming' surfaces.
  const mid = ((Game.data.monsters || [])[0] || {}).id || 'test_beast';
  const entries = (Game.state.codex || {}).monsters || {};
  for (const k of Object.keys(entries)) { try { if (k !== mid) entries[k].namingKicked = false; } catch (e) {} }
  let entry = null;
  try { entry = Game.ensureMonsterEntry ? Game.ensureMonsterEntry(mid) : null; } catch (e) {}
  if (!entry) { entries[mid] = entries[mid] || {}; entry = entries[mid]; }
  entry.namingKicked = true;
  delete entry.villageName;
  entry.proposals = {};
  entry.proposals[speaker] = 'Loud Beast';
  entry.proposals[other] = 'Big Loud';
  try { const v = Game.state.village || {}; v.grief = 0; v.lastContest = null; v.sick = {}; } catch (e) {}

  const ev = (() => { try { return Game.t2LatelyEvent(speaker); } catch (e) { return null; } })();
  ok(ev && ev.kind === 'naming' && ev.mid === mid, `seed ${seed}: lately event is the staged naming debate (got ${ev ? ev.kind + '/' + ev.mid : 'none'})`);
  if (!ev || ev.kind !== 'naming') return fails;

  // (1) THE FIX: the speaker's own proposal reads first person.
  let lines = [];
  try { lines = Game.t2gen_lately(speaker) || []; } catch (e) { ok(false, `seed ${seed}: t2gen_lately(speaker) threw: ${e.message}`); }
  const line1 = lines[0] || '';
  ok(line1.includes("I'm pushing 'Loud Beast'"), `seed ${seed}: speaker's line reads first person (got: ${line1.slice(0, 160)})`);
  ok(!lines.some(l => String(l).includes(speakerName + ' is pushing')), `seed ${seed}: no line names the speaker in third-person push form`);

  // (2) CONTROL: another villager reporting the same debate still gets
  // the third-person rendering — the fix must not flatten all voices.
  let otherLines = [];
  try { otherLines = Game.t2gen_lately(other) || []; } catch (e) { ok(false, `seed ${seed}: t2gen_lately(other) threw: ${e.message}`); }
  const otherLine1 = otherLines[0] || '';
  ok(otherLine1.includes(speakerName + " is pushing 'Loud Beast'"), `seed ${seed}: control speaker keeps third person (got: ${otherLine1.slice(0, 160)})`);
  return fails;
}

(async () => {
  let allFails = [];
  for (const seed of SEEDS) {
    console.log(`seed ${seed}:`);
    try { allFails = allFails.concat(await one(seed)); } catch (e) { console.log('  FAIL harness: ' + e.message); allFails.push('harness ' + seed); }
  }
  if (allFails.length) { console.log(`\n${allFails.length} FAILURES`); process.exit(1); }
  console.log('\nALL PASS');
})();
