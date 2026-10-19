#!/usr/bin/env node
// CURIOUS-STRANDED PROOF (journey scale r10, 2026-10-19):
// The curious want hangs a bespoke question as its opener. When no unasked
// question remains for the NPC, the opener returns null — but
// convoSelectWant picked it anyway (pick 1-2, first-meeting floor 3),
// stranding the want at stage 0: fallback opener, no ans:* menu, the want
// never engages, resolution 'unestablished' (observed: Marcus d80 r10 —
// "want: curious (stage 0)" ... "want final: id=curious stage=3
// resolution=unestablished").
// FIX: WANTS.curious.canOpen(vid) — pure check for an askable question
// (convoPickUnaskedQuestion); convoSelectWant zeroes a want whose opener
// cannot fire, AFTER the first-meeting/grief floors are applied.
// Run: node scripts/test-curious-stranded-20261019.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9801, 9802, 9803]);

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

function liveRoster(Game) {
  const out = [];
  const roster = (Game.state.village || {}).roster || [];
  for (const id of roster) {
    if (!id || id === Game.villagerId) continue;
    let p = null;
    try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    if (p && !p.dead) out.push(id);
  }
  return out;
}

function exhaustQuestions(Game, vid) {
  const allIds = ((Game.data.characterGen || {}).convo || {}).questions
    ? Game.data.characterGen.convo.questions.map(q => q.id) : [];
  const c = Game.convoGet(vid);
  c.askedQs = allIds.slice();
  try { Game.state.village.askedQsAny = allIds.slice(); } catch (e) {}
  return allIds.length;
}

// find a first-meeting villager who draws curious on the control (fresh
// questions), so we hold the curious def for the exhausted-state probes
function curiousDraw(Game) {
  for (const vid of liveRoster(Game)) {
    let sel = null;
    try { sel = Game.convoSelectWant(vid); } catch (e) {}
    if (sel && sel.id === 'curious' && sel.def) return { vid, def: sel.def };
  }
  return null;
}

async function runSeed(seed) {
  console.log(`\n### SEED ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);

  const got = curiousDraw(Game);
  if (!got) { console.log('  SKIP: no first-meeting villager drew curious on control'); return; }
  const { vid, def } = got;
  console.log(`  control: ${vid} drew curious (def held)`);

  // canOpen is pure: it must not consume a question.
  const c0 = Game.convoGet(vid);
  const askedBefore = (c0.askedQs || []).length;
  let open0 = null;
  try { open0 = (def.canOpen || (() => 'no-canOpen')).call(Game, vid); } catch (e) { open0 = 'threw'; }
  const c0b = Game.convoGet(vid);
  ok(open0 === true && (c0b.askedQs || []).length === askedBefore && !c0b.pendingQ,
     `canOpen pure + true with questions available (open=${open0}, askedQs ${askedBefore}->${(c0b.askedQs || []).length}, pendingQ=${!!c0b.pendingQ})`);

  // RED SETUP: exhaust every question for this villager.
  const n = exhaustQuestions(Game, vid);
  let unasked = 'n/a';
  try { unasked = Game.convoPickUnaskedQuestion(vid); } catch (e) {}
  ok(unasked === null && n > 0, `question pool exhausted (${n} ids marked; convoPickUnaskedQuestion -> null)`);

  // The opener cannot fire now.
  let openerLine = 'threw';
  try { openerLine = def.opener.call(Game, vid); } catch (e) { openerLine = null; }
  ok(openerLine === null, 'curious opener returns null with no askable question');

  // canOpen now false.
  let open1 = 'threw';
  try { open1 = def.canOpen.call(Game, vid); } catch (e) {}
  ok(open1 === false, 'canOpen false with no askable question');

  // THE FIX: a want that cannot open must not be selected — even on a first
  // meeting, where the Principle-12 floor used to force curious to 3.
  // (Note: convoCheckSeeds may return a seed for this vid on repeat calls;
  // exhaustQuestions ran after the control draw, so a fresh select is fine.)
  let sel = null;
  try { sel = Game.convoSelectWant(vid); } catch (e) {}
  console.log(`  exhausted: selected=${sel && sel.id}${sel && sel.fromSeed ? ' (fromSeed)' : ''}`);
  const stranded = sel && sel.id === 'curious' && !sel.fromSeed;
  ok(!stranded, "curious not selected when it can't open (want=" + (sel && sel.id) + ')');
}

async function main() {
  for (const seed of SEEDS) {
    try { await runSeed(seed); }
    catch (e) { failures++; console.log('  FATAL: ' + (e && e.stack || e)); }
  }
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
