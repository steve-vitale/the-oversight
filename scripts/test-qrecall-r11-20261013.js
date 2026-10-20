#!/usr/bin/env node
// test-qrecall-r11-20261013.js — PLAYTEST social r11 2026-10-13.
// Blank from r10 watch item 3: the 28 remaining ask-and-forget questions.
// r11's ask-frequency probe (journey-social-r11-askfreq-20261013.js, 6 seeds x
// 60d, socialite + driveOne) measured a flat rotation; the top tier (>=28
// asks) is q_angry, q_read, q_skill, q_alone_time, q_laugh_memory, q_first_week,
// q_fight, q_laugh, q_someone, q_quiet, q_night. This run adds answer-specific
// `recalls` maps for exactly those 11 (scripts/apply-r11-recalls.py).
// Rules (inherited from r10): only answers WITH a recall entry fire; a
// `recalls` map is strict (unmapped answers do NOT fire — the r9 q_trust
// fabricated-history lesson); honest_opt_out / honest_pass never fire; each
// question fires at most once per villager (c.recalled).
// RED on pristine (no recalls map -> no 'recall' thread), GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
function ok(msg) { console.log('ok: ' + msg); }

const CASES = [
  // [qid, answerId, regexes the recall MUST contain, regexes it must NOT contain]
  ['q_night', 'a_yes', [/heard the sounds/i], [/slept fine/i]],
  ['q_night', 'a_no', [/slept fine/i], [/heard the sounds/i]],
  ['q_night', 'a_joke', [/just the wind/i], [/slept fine/i]],
  ['q_quiet', 'a_kind', [/not good at the talking part/i], []],
  ['q_quiet', 'a_help', [/asked what i needed/i], []],
  ['q_read', 'a_honest', [/figuring everyone out/i], []],
  ['q_read', 'a_name', [/who to watch/i], [/gave me a name/i]],
  ['q_read', 'a_none', [/don't gossip/i], []],
  ['q_skill', 'a_tell', [/better with your hands/i], []],
  ['q_skill', 'a_vague', [/hidden card/i], []],
  ['q_skill', 'a_deflect', [/nothing worth mentioning/i], []],
  ['q_alone_time', 'a_tell', [/breathing your own air/i], []],
  ['q_alone_time', 'a_vague', [/quiet scares you/i], []],
  ['q_alone_time', 'a_deflect', [/alone is how you get got/i], []],
  ['q_laugh_memory', 'a_tell', [/stolen laugh/i], []],
  ['q_laugh_memory', 'a_vague', [/couldn't remember/i], []],
  ['q_laugh_memory', 'a_deflect', [/laughing feels wrong/i], []],
  ['q_first_week', 'a_shock', [/shock got you through/i], []],
  ['q_first_week', 'a_person', [/one person/i], []],
  ['q_fight', 'a_tell', [/told me yes/i], [/define hurt/i]],
  ['q_fight', 'a_vague', [/define hurt/i], [/told me yes/i]],
  ['q_fight', 'a_deflect', [/not a question you ask/i], []],
  ['q_laugh', 'a_story', [/funny one/i], []],
  ['q_laugh', 'a_dark', [/gallows humor/i], []],
  ['q_someone', 'a_tell', [/someone you don't trust/i], []],
  ['q_someone', 'a_vague', [/well enough to distrust/i], []],
  ['q_someone', 'a_deflect', [/dangerous question/i], []],
  ['q_angry', 'a_yes', [/furious/i], [/too tired/i]],
  ['q_angry', 'a_tired', [/too tired/i], [/furious/i]],
  ['q_angry', 'a_deflect', [/anger doesn't help/i], []],
];

const OPTOUTS = [
  // [qid, answerId] — these must NEVER produce a recall opener
  ['q_laugh', 'a_nothing'],
  ['q_quiet', 'a_leave'],
  ['q_first_week', 'a_blur'],
  ['q_night', 'honest_pass'],
  // RETIRED r12: q_useful/a_hunger was r11's "no-recall question stays silent"
  // control; r12 added answer-specific recalls to q_useful, so the control no
  // longer holds. Covered by test-qrecall-r12-20261013.js instead.
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
