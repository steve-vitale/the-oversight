#!/usr/bin/env node
// test-qrecall-r12-20261013.js — PLAYTEST social r12 2026-10-13.
// Blank from r11 watch item 3: the remaining 17 ask-and-forget questions
// (the <=27-ask long tail; r11 probe measured q_first_memory 27 down to
// q_name_day 19 across 6 seeds x 60d). This run adds answer-specific
// `recalls` maps for exactly those 17 (scripts/apply-r12-recalls.py).
// Rules (inherited from r10/r11): only answers WITH a recall entry fire; a
// `recalls` map is strict (unmapped answers do NOT fire — the r9 q_trust
// fabricated-history lesson); honest_opt_out answers get NO entry and never
// fire; each question fires at most once per villager (c.recalled).
// RED on pristine (no recalls map -> no 'recall' thread), GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
function ok(msg) { console.log('ok: ' + msg); }

const CASES = [
  // [qid, answerId, regexes the recall MUST contain, regexes it must NOT contain]
  ['q_first_memory', 'a_tell', [/kitchen/i, /morning light/i], []],
  ['q_first_memory', 'a_deflect', [/why i wanted to know/i], []],
  ['q_song', 'a_yes', [/singing in the creek/i, /badly/i], []],
  ['q_song', 'a_no', [/feels wrong/i], []],
  ['q_song', 'a_deflect', [/going to sing/i], []],
  ['q_change', 'a_tell', [/don.t recognize the person/i], []],
  ['q_change', 'a_vague', [/weren.t sure.*changed/i], []],
  ['q_change', 'a_deflect', [/identity crisis/i], []],
  ['q_useful', 'a_hunger', [/hungry and going/i], []],
  ['q_useful', 'a_self', [/more than you thought/i], []],
  ['q_dream', 'a_before', [/dream about before/i], []],
  ['q_dream', 'a_now', [/all this now/i], []],
  ['q_fun', 'a_people', [/your people/i], []],
  ['q_fun', 'a_hobby', [/hobbies, projects/i], []],
  ['q_fun', 'a_deflect', [/another lifetime/i], []],
  ['q_system_fear', 'a_tell', [/on purpose/i], []],
  ['q_system_fear', 'a_vague', [/feeling normal/i], []],
  ['q_system_fear', 'a_deflect', [/still everything/i], []],
  ['q_kindness', 'a_tell', [/couldn.t spare/i], []],
  ['q_kindness', 'a_vague', [/luckier than you admit/i], []],
  ['q_kindness', 'a_deflect', [/changed your mind/i], []],
  ['q_guilty', 'a_tell', [/carrying it/i], []],
  ['q_guilty', 'a_deflect', [/define .worst/i], []],
  ['q_regret', 'a_tell', [/another way to say it/i], []],
  ['q_regret', 'a_deflect', [/luxury/i], []],
  ['q_hope', 'a_tell', [/full night.s sleep/i], []],
  ['q_hope', 'a_vague', [/something sweet/i], []],
  ['q_hope', 'a_deflect', [/small thing today/i], []],
  ['q_before_skill', 'a_tell', [/patience/i, /superpower/i], []],
  ['q_before_skill', 'a_deflect', [/tv show/i], []],
  ['q_left_behind', 'a_yes', [/never asked who/i], []],
  ['q_left_behind', 'a_deflect', [/left someone behind/i], []],
  ['q_believe', 'a_tell', [/holding the line/i], []],
  ['q_believe', 'a_vague', [/breakfast/i], []],
  ['q_believe', 'a_deflect', [/spare energy/i], []],
  ['q_stay', 'a_tell', [/still true/i], []],
  ['q_stay', 'a_deflect', [/heard something/i], []],
  ['q_teach_me', 'a_tell', [/lesson two/i], []],
  ['q_teach_me', 'a_vague', [/guessing out here/i], []],
  ['q_teach_me', 'a_deflect', [/not much of a teacher/i], []],
  ['q_name_day', 'a_count', [/count the days/i], []],
  ['q_name_day', 'a_lost', [/lost track/i], []],
  ['q_name_day', 'a_guess', [/someday/i], []],
];

const OPTOUTS = [
  // [qid, answerId] — honest_opt_out answers must NEVER produce a recall
  ['q_first_memory', 'a_vague'],
  ['q_useful', 'a_learning'],
  ['q_dream', 'a_none'],
  ['q_guilty', 'a_vague'],
  ['q_regret', 'a_vague'],
  ['q_before_skill', 'a_vague'],
  ['q_left_behind', 'a_unknown'],
  ['q_stay', 'a_vague'],
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
