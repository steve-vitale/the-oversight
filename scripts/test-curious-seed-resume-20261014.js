#!/usr/bin/env node
// test-curious-seed-resume-20261014.js — PLAYTEST social r14 2026-10-14.
// Blank from r13 watch item 1: the curious want plants a seed when the player
// walks away from an unanswered bespoke question ("About that question —").
// TWO defects on resume:
//   (1) the next conversation hangs a DIFFERENT question — the original
//       evaporates (convoHangWantQuestion excludes askedQs; the seed is
//       consumed; Q is lost forever). The seed claims to "resume" the
//       question but never does.
//   (2) the seed note is the generic "that question" — the reference
//       dangles; the seed stores no record of which question it was.
// Fix: curious.resolve() captures the hanging question's id in the seed
// (qid — convoResolveWant runs BEFORE endConvo clears pendingQ); the seed
// note names the actual question via a qid->noun-phrase map; the curious
// opener re-hangs THE SAME question when resuming from a seed.
// RED (pre-fix): resumeQid !== hungQid, opener says "that question".
// GREEN (post-fix): resumeQid === hungQid, opener names the question,
//   and the SAME question text is re-spoken.
// Usage: node scripts/test-curious-seed-resume-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(m) { console.error('FAIL: ' + m); process.exitCode = 1; }
function ok(m) { console.log('ok: ' + m); }

function openerLine(Game, vid) {
  try {
    const c = Game.convoGet(vid);
    const tr = (c && c.transcript) || [];
    const npc = tr.filter(e => e && e.who !== 'you');
    return npc.length ? String(npc[0].text || '') : '';
  } catch (e) { return ''; }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 818, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const player = Game.villagerId;
  const vid = (v.roster || []).filter(id => id !== player)[0];
  if (!vid) { fail('need 1 NPC'); return; }

  // --- Convo 1: plant a curious seed (emulates the post-walkaway state),
  // open it, and walk away from the hanging question.
  Game.convoPlantSeed(vid, { wantId: 'curious', note: 'that question' });
  Game.startConvo(vid);
  const hung1 = (Game.convoGet(vid) || {}).pendingQ || null;
  if (!hung1 || !hung1.id) { fail('curious opener did not hang a question'); return; }
  const open1 = openerLine(Game, vid);
  console.log('   convo1 opener: ' + open1.slice(0, 120));
  Game.endConvo(vid, 'left'); // walk away from the unanswered question

  // --- The seed planted by resolve().
  const seed = ((Game.state.village || {}).convoSeeds || {})[vid] || null;
  if (!seed || seed.wantId !== 'curious') { fail('curious seed not planted on walkaway'); return; }
  console.log('   seed: ' + JSON.stringify(seed));

  // --- Convo 2: the seed resumes. Capture the re-hung question + opener.
  Game.startConvo(vid);
  const hung2 = (Game.convoGet(vid) || {}).pendingQ || null;
  if (!hung2 || !hung2.id) { fail('resume opener did not hang a question'); return; }
  const open2 = openerLine(Game, vid);
  console.log('   convo2 opener: ' + open2.slice(0, 140));
  console.log('   hung Q1: ' + hung1.id + ' | resumed Q2: ' + hung2.id);
  Game.endConvo(vid, 'left');

  // --- Assertions (observable effect: the NPC's actual speech).
  if (hung2.id === hung1.id) ok('resume re-asks the SAME question (' + hung1.id + ')');
  else fail('resume asks a DIFFERENT question (' + hung1.id + ' -> ' + hung2.id + ') — the original evaporated');

  if (/that question/i.test(open2)) fail('opener still says the generic "that question": ' + open2.slice(0, 110));
  else ok('opener does not say the generic "that question"');

  // The same question text must be re-spoken (player must see what they answer).
  let qtext = '';
  try {
    const cg = (Game.data.characterGen || {}).convo || {};
    const qd = (cg.questions || []).find(q => q && q.id === hung1.id);
    qtext = String((qd && (qd.q || qd.text)) || '').replace(/[“”]/g, '"');
  } catch (e) {}
  const bare2 = open2.replace(/["“”]/g, '');
  const needle = qtext.replace(/[“”"]/g, '').slice(0, 40);
  if (qtext && needle && bare2.indexOf(needle) !== -1)
    ok('opener re-speaks the same question text');
  else fail('opener does not re-speak the hung question text');

  // The named reference must match the question actually re-asked.
  if (seed.qid && seed.qid === hung1.id) ok('seed records the question id (' + seed.qid + ')');
  else fail('seed does not record the hung question id: ' + JSON.stringify(seed));

  // --- Defect 2 (same blank, second surface): the open-thread ledger label
  // for the walked-away want. The player's resume choice is built as
  // "About <label> — we never finished." — pre-fix the label was the
  // generic 'that question' (convoTopicLabel's want-branch map).
  let openThreads = [];
  try { openThreads = Game.convoOpenThreads(vid) || []; } catch (e) {}
  const wantThread = openThreads.find(o => o && o.tid === 'want');
  if (!wantThread) fail('no open want thread planted on walkaway');
  else {
    console.log('   open-thread label: "' + wantThread.label + '"');
    if (/that question/i.test(String(wantThread.label || '')))
      fail('open-thread label is the generic "that question"');
    else ok('open-thread label names the question ("' + wantThread.label + '")');
  }

  // --- Scenario 3: answer the question, THEN change the subject, then walk
  // away. The 'want' thread plants as open via the subject-change path when
  // no question hangs — the label must still name the want's question.
  Game.convoPlantSeed(vid, { wantId: 'curious', note: 'legacy' });
  Game.startConvo(vid);
  const c3 = Game.convoGet(vid);
  const q3 = (c3 && c3.pendingQ) || null;
  if (!q3 || !q3.id) { fail('scenario 3: no question hung'); }
  else {
    // answer it
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    const ans = choices.find(x => x && new RegExp('^ans:' + q3.id + ':').test(String(x.id || '')) && !/honest_pass/.test(String(x.id || '')));
    if (!ans) fail('scenario 3: no answer choice for ' + q3.id);
    else {
      Game.convoTurn(vid, ans.id);
      // change the subject to a t2 topic
      let ch2 = [];
      try { ch2 = Game.convoChoices(vid) || []; } catch (e) {}
      const ask = ch2.find(x => x && /^ask:/.test(String(x.id || '')));
      if (ask) { try { Game.convoTurn(vid, ask.id); } catch (e) {} }
      Game.endConvo(vid, 'left');
      let open3 = [];
      try { open3 = Game.convoOpenThreads(vid) || []; } catch (e) {}
      const wt3 = open3.find(o => o && o.tid === 'want');
      if (!wt3) { console.log('   (scenario 3: no want thread planted — subject-change path did not fire)'); }
      else {
        console.log('   scenario-3 open-thread label: "' + wt3.label + '"');
        if (/that question/i.test(String(wt3.label || '')))
          fail('scenario 3: open-thread label is the generic "that question" after answer+subject-change');
        else ok('scenario 3: open-thread label names the answered question ("' + wt3.label + '")');
      }
    }
  }

  if (process.exitCode) console.log('RESULT: RED (blank reproduced)');
  else console.log('RESULT: ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
