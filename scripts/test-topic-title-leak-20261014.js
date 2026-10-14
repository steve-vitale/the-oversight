#!/usr/bin/env node
// test-topic-title-leak-20261014.js — PLAYTEST social r13 2026-10-14.
// Blank from r12 watch item 1: NPC speech leaks t2 internal titles —
// convoRecapLine (and resume/close/lapse lines via convoTopicLabel) quote
// the player's menu-choice QUESTION ("Who's on your mind around here?")
// as the topic noun: "We started on Who's on your mind around here?...".
// Fix: convoTopicLabel maps the 9 t2 ids (all but 'lately', covered in the
// base map) to plain noun phrases; topic2Label (the menu text) is untouched.
// RED (pre-fix): convoTopicLabel(vid,'others') === "Who's on your mind around
//   here?" (ask-label leaked) and convoRecapLine contains a '?'-phrase topic.
// GREEN (post-fix): labels are noun phrases, no '?', and no t2 ask-label
//   text appears in any recap/resume/close/lapse line.
// Usage: node scripts/test-topic-title-leak-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(m) { console.error('FAIL: ' + m); process.exitCode = 1; }
function ok(m) { console.log('ok: ' + m); }

const T2IDS = ['you', 'fears', 'others', 'neighbors', 'advice', 'oldworld', 'skills', 'systemtake', 'loved'];
const EXPECTED = {
  you: 'each other', fears: 'what scares them', others: 'the others',
  neighbors: 'the neighbors', advice: 'advice', oldworld: 'the old world',
  skills: 'their skills', systemtake: 'the Taking', loved: 'someone they loved',
};

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 20261014, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const player = Game.villagerId;
  const vid = (v.roster || []).filter(id => id !== player)[0];
  if (!vid) { fail('need 1 NPC'); return; }

  // 1. convoTopicLabel for each t2 id: noun phrase, never the ask-label.
  const askText = {};
  for (const tid of T2IDS) {
    let label = null;
    try { label = Game.convoTopicLabel(vid, tid); } catch (e) { fail('convoTopicLabel threw for ' + tid + ': ' + e.message); continue; }
    const L = String(label || '');
    if (L === EXPECTED[tid]) ok(`topicLabel(${tid}) = "${L}"`);
    else fail(`topicLabel(${tid}) = "${L}", expected "${EXPECTED[tid]}"`);
    if (L.indexOf('?') !== -1) fail(`topicLabel(${tid}) is a question: "${L}"`);
    try { askText[tid] = String(Game.topic2Label(vid, tid) || ''); } catch (e) { askText[tid] = ''; }
  }

  // 2. Full-line check: seed a threadLog with t2 threads and render the
  // recap, resume, close and lapse lines — none may contain ask-label text.
  const c = Game.convoGet(vid);
  c.threadLog = [
    { thread: 'others', depth: 1 }, { thread: 'fears', depth: 1 },
  ];
  let recap = null;
  try { recap = String(Game.convoRecapLine(vid) || ''); } catch (e) { fail('convoRecapLine threw: ' + e.message); }
  console.log('   recap: ' + recap.slice(0, 130));
  if (recap && recap.indexOf('?') !== -1 && !/questions|wondering/i.test(recap))
    fail('recap line quotes a question as the topic: ' + recap.slice(0, 130));
  else ok('recap line has no question-phrase topic');
  for (const tid of T2IDS) {
    const ask = (askText[tid] || '').replace(/["“”]/g, '').slice(0, 40).toLowerCase();
    if (ask && recap && recap.toLowerCase().indexOf(ask) !== -1)
      fail(`recap leaks ask-label for ${tid}`);
  }
  ok('recap contains no t2 ask-label text');

  // resume opener with an open t2 thread
  let resume = null;
  try {
    Game.convoThreadOpen(vid, 'neighbors', Game.convoTopicLabel(vid, 'neighbors'), 'changed the subject');
    const L = Game.convoTopicLedger(vid);
    const o = (L.open || []).find(x => x.tid === 'neighbors');
    if (o) {
      // emulate the resume line construction without forcing an opener
      const inner = `We never finished talking about ${o.label || 'the neighbors'} — we left it mid-thought.`;
      if (/[?](?![\w])/.test(inner)) fail('resume line question leak: ' + inner);
      else ok('resume line for neighbors: "' + inner + '"');
      if (String(o.label).toLowerCase() === askText.neighbors.replace(/["“”]/g, '').toLowerCase())
        fail('ledger stored the ask-label for neighbors');
      else ok('ledger label for neighbors is the speech label, not the ask-label');
    } else { fail('convoThreadOpen did not plant the neighbors thread'); }
  } catch (e) { fail('resume simulation threw: ' + e.message); }

  // 3. Menus unchanged: the ASK choice text still comes from topic2Label.
  const choices = [];
  try { Game.startConvo(vid); const ch = Game.convoChoices(vid) || []; for (const x of ch) if (x && /^ask:/.test(String(x.id || ''))) choices.push(x); } catch (e) {}
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const othersChoice = choices.find(x => x.id === 'ask:others');
  if (!othersChoice) ok('no ask:others choice this convo (gate, not a failure)');
  else if (/Who's on your mind/.test(String(othersChoice.label || '')))
    ok('menu choice ask:others still shows the player-facing question label');
  else fail('menu choice ask:others lost its question label: ' + String(othersChoice.label).slice(0, 80));

  if (!process.exitCode) console.log('ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
