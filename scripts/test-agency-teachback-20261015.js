#!/usr/bin/env node
'use strict';
// test-agency-teachback-20261015.js — proof for the agency-teach honesty fix
// (journey deepening r12, 2026-10-15).
//
// SENSE-CAUGHT: seed 8504 day 45 — Monique taught the player Chinese Chive
// via agency:ask_field ("This one — Chinese Chive. Leaf, stem, smell."),
// and three turns later the player "taught" Chinese Chive BACK to her
// ("You show them Chinese Chive..." / "And I've been walking past it for
// weeks."). The agency plant-lesson path (agencyTeachPlant) never recorded
// the plant in village.taught[vid], so plantsKnownBy(vid) missed it and the
// conversation teach-back filter (conversation.js 'teach' choice) offered
// the same plant back as if she never knew it.
//
// FIX: agencyTeachPlant records the taught plant via villagerLearnsPlant
// (source 'taught') — the canonical store plantsKnownBy reads.
//
// REAL-RED: fixture gives an NPC one agency teachable plant entry, runs
// agencyTeachPlant, then asserts (A) plantsKnownBy(vid) includes the taught
// pid, and (B) the teach-back filter (youKnow − theyKnow) excludes it.
// Both fail pre-fix (teach-back offers it again -> the 8504-d45 incoherence).
// GREEN: both pass post-fix.
//
// Usage: node scripts/test-agency-teachback-20261015.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; fails.push(name); console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 777, mode: 'test-agency-teachback-20261015' });
  if (loadFails && loadFails.length) { ok('module load', false, loadFails.join('; ')); return; }
  ok('module load', true);
  await setupGame(Game);

  const player = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== player);
  if (!vid) { ok('fixture NPC', false, 'no NPC on roster'); return; }
  ok('fixture NPC', true);

  // one agency plant-lesson entry, real path (earned, declining)
  const st = Game.agencyState();
  st.teachable[vid] = [{ topic: 'plants', day: 1 }];

  const before = new Set(Object.keys((Game.state.codex || {}).plants || {}));
  let taught = false;
  try { taught = Game.agencyTeachPlant(vid); } catch (e) { ok('agencyTeachPlant runs', false, e.message); return; }
  ok('agencyTeachPlant teaches', taught === true);

  const after = Object.keys((Game.state.codex || {}).plants || {});
  const taughtPid = after.find(pid => !before.has(pid));
  if (!taughtPid) { ok('taught pid detected', false, 'no new codex plant'); return; }
  ok('taught pid detected', true);
  console.log(`     taught: ${taughtPid} to player by ${vid}`);

  // (A) the teacher is recorded as knowing the plant (villager-side store)
  let theyKnow = [];
  try { theyKnow = Game.plantsKnownBy(vid) || []; } catch (e) { ok('plantsKnownBy runs', false, e.message); return; }
  ok('teacher recorded in village.taught (plantsKnownBy covers it)', theyKnow.indexOf(taughtPid) !== -1,
    `plantsKnownBy(${vid}) = [${theyKnow.join(', ')}]`);

  // (B) the conversation teach-back filter (conversation.js 'teach' choice)
  // must NOT offer the same plant back
  let youKnow = [];
  try { youKnow = Object.keys(Game.state.codex.plants || {}).filter(k => Game.plantKnown(k)); } catch (e) {}
  const teachable = youKnow.filter(pid => theyKnow.indexOf(pid) === -1);
  ok('teach-back filter excludes the just-taught plant', teachable.indexOf(taughtPid) === -1,
    `teach-back would offer ${taughtPid} again`);

  // sanity: the agency entry was spent exactly once (declining invariant)
  ok('teachable entry spent once', (Game.agencyState().teachable[vid] || []).length === 0);

  console.log(fail ? `\n${fail} FAIL(s): ${fails.join('; ')}` : '\nALL GREEN');
  if (fail) process.exitCode = 1;
}
main().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
