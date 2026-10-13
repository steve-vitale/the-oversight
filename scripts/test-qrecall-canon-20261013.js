#!/usr/bin/env node
// test-qrecall-canon-20261013.js — PLAYTEST social r10 2026-10-13.
// Blank from r9 talk probe: the four other canon questions (q_plan, q_scared,
// q_miss, q_think) have `recall: null` in characterGen.json, and the generic
// `recall` lines on q_hands / q_theory are DEAD DATA (no code ever reads them —
// only q_origin/q_trust have opener blocks). docs/CONVERSATIONS.md promises
// answers are "remembered (conv.answered) and referenced later" — it holds for
// 2 of 36 questions.
// Fix: answer-specific `recalls` maps on the four canon questions + q_hands,
// q_theory, q_origin (preserving origin's a_tell-only gating), and a
// generalized recall opener loop in conversation.js. Rules:
//   - only answers with a recall entry fire (opt-outs / honest_pass never fire)
//   - a `recalls` map is strict: unmapped answers don't fire the generic text
//     (no fabricated memory — the q_trust r9 lesson)
// RED on pristine (recall is null/dead data -> no 'recall' thread), GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
function ok(msg) { console.log('ok: ' + msg); }

const CASES = [
  // [qid, answerId, regexes the recall MUST contain, regexes it must NOT contain]
  ['q_plan', 'a_survive', [/one day at a time/i], [/keep this group alive/i, /figure out what happened/i]],
  ['q_plan', 'a_lead', [/keeping this group alive/i], [/one day at a time/i]],
  ['q_plan', 'a_find', [/what happened/i], [/one day at a time/i]],
  ['q_scared', 'a_yes', [/honest about being scared/i], [/luxury/i]],
  ['q_scared', 'a_no', [/luxury/i], [/quiet with teeth/i]],
  ['q_scared', 'a_honest', [/quiet with teeth/i], [/luxury/i]],
  ['q_miss', 'a_food', [/hot meal/i, /spoon/i], [/your people/i]],
  ['q_miss', 'a_people', [/your people/i], [/hot meal/i]],
  ['q_miss', 'a_quiet', [/feeling safe/i], [/hot meal/i]],
  ['q_miss', 'a_home', [/the smell of it/i], [/hot meal/i]],
  ['q_think', 'a_end', [/end of the world/i], [/test/i]],
  ['q_think', 'a_test', [/turning that over/i], [/second chance/i]],
  ['q_think', 'a_chance', [/second chance/i], [/end of the world/i]],
  ['q_hands', 'a_tell', [/your trade/i], [/office work/i]],
  ['q_hands', 'a_vague', [/office work/i], [/your trade/i]],
  ['q_theory', 'a_aliens', [/watching the sky/i], [/felt like a test/i]],
  ['q_theory', 'a_test', [/turning that over/i], [/watching the sky/i]],
  ['q_origin', 'a_tell', [/told me you're from/i], []],
];

const OPTOUTS = [
  // [qid, answerId] — these must NEVER produce a recall opener
  ['q_plan', 'a_quiet'],
  ['q_hands', 'a_deflect'],
  ['q_theory', 'a_shrug'],
  ['q_plan', 'honest_pass'],
];

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const player = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== player);
  if (!vid) { fail('no NPC on roster'); return; }

  for (const [qid, ans, mustMatch, mustNot] of CASES) {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.answered = c.answered || {};
    c.recalled = c.recalled || {};
    c.answered[qid] = ans;
    delete c.recalled[qid];
    let out = null;
    try { out = Game.convoOpening(vid, null); } catch (e) { fail(qid + '/' + ans + ': convoOpening threw: ' + e.message); try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    const line = out && out.line ? String(out.line) : '';
    const thread = out && out.thread ? String(out.thread) : '';
    if (thread !== 'recall') { fail(qid + '/' + ans + ': no recall opener fired (thread=' + thread + ')'); try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    let bad = false;
    for (const re of mustMatch) if (!re.test(line)) { fail(qid + '/' + ans + ': recall does not reflect the answer. Line: ' + line); bad = true; break; }
    if (bad) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    for (const re of mustNot) if (re.test(line)) { fail(qid + '/' + ans + ': recall attributes an answer the player never gave. Line: ' + line); bad = true; break; }
    if (bad) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    ok(qid + '/' + ans + ' -> "' + line.slice(0, 70) + '..."');
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  for (const [qid, ans] of OPTOUTS) {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.answered = c.answered || {};
    c.recalled = c.recalled || {};
    c.answered[qid] = ans;
    delete c.recalled[qid];
    let out = null;
    try { out = Game.convoOpening(vid, null); } catch (e) { fail('optout ' + qid + '/' + ans + ': threw: ' + e.message); try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    const thread = out && out.thread ? String(out.thread) : '';
    const line = out && out.line ? String(out.line) : '';
    if (thread === 'recall') { fail('optout ' + qid + '/' + ans + ': recall fired on an opt-out: ' + line); }
    else ok('optout ' + qid + '/' + ans + ' -> no recall (thread=' + thread + ')');
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  if (!process.exitCode) console.log('ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
