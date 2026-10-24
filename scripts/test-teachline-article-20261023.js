#!/usr/bin/env node
'use strict';
// test-teachline-article-20261023.js — proof for the agencyMonsterLessonLine
// article fix (journey deepening r38, 2026-10-23).
//
// SENSE-CAUGHT: seed 38003 day 81 — Ethan taught the player the Union Rep's
// tell via agency:ask_field: "BROTHERS! That's the The Union Rep telling
// you it's about to move. It hunts by day — watch the open ground."
// The doubled article ("the The") is the same class as backlog #542
// (landing r22: "the The Loud Beast flesh"), for which game.js already
// carries the class fix: articlePhrase(noun, cap). But
// agencyMonsterLessonLine (villager-agency.js) still composes
// `"That's the ${noun} telling you..."` blindly, and monsterNoun keeps
// proper-cased System names ("The Union Rep", "The Moderator") intact.
//
// FIX: compose via the existing helper —
//   (this.articlePhrase ? this.articlePhrase(noun) : 'the ' + noun)
// so proper names keep standing ("That's The Union Rep telling you...")
// and lowercase descriptors keep their article ("the toad like a war
// drum").
//
// REAL-RED: call the real agencyMonsterLessonLine for proper-named mids;
// assert no /\bthe the\b/i in any returned line. Pre-fix, union_rep
// produces "the The Union Rep" (v is hash-deterministic per mid, and the
// 38003 transcript proves union_rep takes the v===1 branch).
// GREEN: no doubled article on any tested mid.
//
// Usage: node scripts/test-teachline-article-20261023.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; fails.push(name); console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const MIDS = ['union_rep', 'moderator', 'redactor', 'landlord', 'heckler',
  'performance_review', 'grief_counselor', 'static_kite', 'bulldozer', 'hushwolf'];

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'test-teachline-article-20261023' });
  if (loadFails && loadFails.length) { ok('module load', false, loadFails.join(';')); return; }
  ok('module load', true);
  await setupGame(Game);
  ok('agencyMonsterLessonLine exists', typeof Game.agencyMonsterLessonLine === 'function');

  // The bug needs proper names: post-System-arrival, monsterNoun returns
  // the System name as-is ("The Union Rep"). Pre-arrival it returns prose
  // descriptors (which fall back to 'something'), hiding the bug.
  Game.state.systemArrived = true;
  ok('monsterNoun proper post-arrival',
    Game.monsterNoun('union_rep') === 'The Union Rep',
    JSON.stringify(Game.monsterNoun('union_rep')));

  let sawV1 = false;
  for (const mid of MIDS) {
    let line = null;
    try { line = Game.agencyMonsterLessonLine(mid); } catch (e) { ok(`line for ${mid}`, false, e.message); continue; }
    if (!line) { ok(`line for ${mid} non-null`, false, 'null line'); continue; }
    if (/telling you it's about to move/.test(line)) sawV1 = true;
    ok(`no doubled article: ${mid}`, !/\bthe\s+the\b/i.test(line), line.slice(0, 120));
  }
  ok('v===1 branch exercised (the fixed template)', sawV1, 'no mid hit the telling-you branch');
  console.log(`\n${pass} passed, ${fail} failed${fails.length ? ' :: ' + fails.join(', ') : ''}`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
