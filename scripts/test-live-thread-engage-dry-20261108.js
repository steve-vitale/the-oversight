#!/usr/bin/env node
// test-live-thread-engage-dry-20261108.js — dialog audit defect #4.
// Help/engage (goon / dlg:more / dlg:help) on a live unfinished thread must
// not dry to "lost my train of thought" (or empty dry) while unfinished
// work remains.
//
// Repros (dialog-coherence-audit.md #4):
//   1) seed-1 Dale shape: live thread + blocked held beat → goon → dry.
//   2) seed-7 Ruth-adjacent: resume unfinished plant lesson → engage/Help
//      must not amnesia while the unfinished claim is live.
//
// GREEN: goon/help/more deliver coherent follow-through or an honest
//   unfinished name matching the opener; never dry train-of-thought while
//   unfinished work remains.
// RED (pre-fix): goon on a ledger-blocked held beat → dry while open
//   unfinished thread still exists.
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const DRY = /lost my train of thought|Never mind — go on|Actually, forget it|Where was I\? Gone|clean out of my head|slipped away from me|Wasn'?t important\. Probably/i;
const safe = (fn, d) => { try { return fn(); } catch (e) { console.error(e && e.stack); return d; } };

function lastThem(Game, vid) {
  const them = (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them');
  return them.length ? String(them[them.length - 1].text || '') : '';
}

async function daleGoonShape() {
  const { Game } = await loadGame({ seed: 1, mode: 'live-thread-dale-goon' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 40;

  // Open unfinished thread — real spoken beat (PR #10 rejects stage direction).
  Game.convoThreadOpen(vid, 'past', 'what you think happened to us', 'unfinished business',
    'My theory changes weekly. This week we are the control group.');
  if (!(Game.convoOpenThreads(vid) || []).some(o => o.tid === 'past')) {
    throw new Error('Dale open thread failed to plant');
  }

  const opened = Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Force a live unfinished sitting: substantive thread + open ledger thread
  // + a held beat that the run ledger will block (the Dale goon→dry shape).
  c.thread = 'past';
  c.depth = 2;
  c._resumedOnce = true;
  const beat = '"My theory changes weekly. This week\'s: we\'re the control group. Somewhere there\'s a village that got instructions."';
  const key = Game.convoSplitBeats(beat)[0].trim();
  Game.convoRunLedger().push(key);
  c.heldBeats = [{ text: beat }];
  if (!Game.convoWouldBlock(vid, beat)) {
    throw new Error('Dale setup: held beat should be ledger-blocked');
  }
  if (!Game.convoHasLiveUnfinished(vid)) {
    throw new Error('Dale setup: live unfinished should be true');
  }

  const r = safe(() => Game.convoTurn(vid, 'goon'), null);
  const them = lastThem(Game, vid);
  const line = r && r.line ? String(r.line) : '';
  const openAfter = Game.convoOpenThreads(vid) || [];
  Game.endConvo(vid, 'left');
  return {
    opener: opened && opened.line ? String(opened.line) : '',
    line, them,
    fellBack: !!c._sayFellBack,
    openLeft: openAfter.length,
  };
}

async function daleHonestNameShape() {
  // Same as Dale, but poison pastFollow so the alternate-beat path is
  // closed — goon must emit the structural unfinished name, not dry.
  const { Game } = await loadGame({ seed: 1, mode: 'live-thread-dale-honest' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 40;
  Game.convoThreadOpen(vid, 'past', 'what you think happened to us', 'unfinished business',
    'My theory changes weekly. This week we are the control group.');
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.thread = 'past';
  c.depth = 2;
  c._resumedOnce = true;
  const beat = '"My theory changes weekly. This week\'s: we\'re the control group. Somewhere there\'s a village that got instructions."';
  Game.convoRunLedger().push(Game.convoSplitBeats(beat)[0].trim());
  // Exhaust / poison pastFollow pool so convoThreadBeat cannot rescue.
  const pastFollow = (((Game.data.characterGen || {}).convo || {}).pastFollow) || [];
  for (const pf of pastFollow) {
    for (const chunk of Game.convoSplitBeats(pf)) {
      Game.convoRunLedger().push(chunk.trim());
    }
  }
  c.heldBeats = [{ text: beat }];
  const r = safe(() => Game.convoTurn(vid, 'goon'), null);
  const them = lastThem(Game, vid);
  const line = r && r.line ? String(r.line) : '';
  Game.endConvo(vid, 'left');
  return { line, them, fellBack: !!c._sayFellBack };
}

async function resumeHelpShape() {
  const { Game } = await loadGame({ seed: 7, mode: 'live-thread-resume-help' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 40;

  Game.convoThreadOpen(vid, 'past', 'that plant lesson', 'walked away mid-thread',
    'The chickweed by the creek — how to tell it from the lookalike.');
  const orig = Math.random;
  Math.random = () => 0.1; // force resume
  const opened = Game.startConvo(vid);
  Math.random = orig;
  const opener = opened && opened.line ? String(opened.line) : '';
  if (!/plant lesson|never finished|never did finish/i.test(opener)) {
    throw new Error('resume opener did not claim unfinished plant lesson: ' + opener);
  }
  const c = Game.convoGet(vid);
  if (!c._resumedOnce) throw new Error('expected _resumedOnce after unfinished resume');

  // Poison a likely engageBeat / thread-beat line so Help/more would dry
  // without the unfinished guard.
  const poison = [
    '"I had plans. Real ones. A trip. A thing I was saving for."',
    '"That\'s... pretty much all of it, honestly."',
    '"Good. Then we\'re square." They look lighter for it.',
  ];
  for (const p of poison) {
    for (const chunk of Game.convoSplitBeats(p)) {
      Game.convoRunLedger().push(chunk.trim());
    }
  }

  const ids = (Game.convoChoices(vid) || []).map(x => x.id);
  let choice = null;
  if (ids.includes('dlg:help')) choice = 'dlg:help';
  else if (ids.includes('dlg:more')) choice = 'dlg:more';
  else if (ids.includes('goon')) choice = 'goon';
  if (!choice) throw new Error('no Help/engage choice on unfinished resume: ' + ids.join(','));

  const r = safe(() => Game.convoTurn(vid, choice), null);
  const them = lastThem(Game, vid);
  const line = r && r.line ? String(r.line) : '';
  Game.endConvo(vid, 'left');
  return { opener, choice, line, them, fellBack: !!c._sayFellBack };
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  if (!process.argv.includes('--child')) {
    for (const shape of ['dale', 'dale-honest', 'resume']) {
      const r = spawnSync(process.execPath, [__filename, '--child', shape], {
        encoding: 'utf8', env: process.env,
      });
      process.stdout.write(r.stdout || '');
      process.stderr.write(r.stderr || '');
      if (r.status !== 0) fails++;
    }
    // Keep Favor Help #1 green — do not regress PR #14.
    const favor = spawnSync(process.execPath, [
      path.join(__dirname, 'test-favor-debt-help-coherence-20261108.js'),
    ], { encoding: 'utf8', env: process.env });
    process.stdout.write(favor.stdout || '');
    process.stderr.write(favor.stderr || '');
    if (favor.status !== 0) fail('favor/debt Help coherence (#14) regressed');

    console.log(fails
      ? `RESULT: ${fails} FAILURES`
      : 'RESULT: GREEN — live unfinished Help/engage never dries to train-of-thought');
    process.exit(fails ? 1 : 0);
  }

  const shape = process.argv[process.argv.indexOf('--child') + 1];
  if (shape === 'dale') {
    const { line, them, fellBack } = await daleGoonShape();
    console.log('Dale goon them:', them);
    console.log('Dale goon line:', line);
    if (!them || them.trim().length < 8) fail('Dale goon produced empty/near-empty line');
    if (DRY.test(them) || DRY.test(line)) {
      fail('Dale goon dried to train-of-thought while unfinished work remained: ' + them);
    }
    if (fellBack) fail('Dale goon sayLine fell back while unfinished work remained');
    // Coherent follow-through OR honest unfinished name — never amnesia.
    console.log('Dale goon: coherent (non-dry) follow-through');
  } else if (shape === 'dale-honest') {
    const { line, them, fellBack } = await daleHonestNameShape();
    console.log('Dale-honest them:', them);
    console.log('Dale-honest line:', line);
    if (!them || them.trim().length < 8) fail('Dale-honest goon produced empty/near-empty line');
    if (DRY.test(them) || DRY.test(line)) {
      fail('Dale-honest goon dried while unfinished remained: ' + them);
    }
    if (fellBack) fail('Dale-honest sayLine fell back while unfinished remained');
    if (!/(still on|hadn'?t finished|pick that up|where was I)/i.test(them)) {
      fail('Dale-honest should name unfinished work structurally: ' + them);
    }
  } else if (shape === 'resume') {
    const { opener, choice, line, them, fellBack } = await resumeHelpShape();
    console.log('Resume opener:', opener);
    console.log('Resume choice:', choice);
    console.log('Resume them:', them);
    console.log('Resume line:', line);
    if (!them || them.trim().length < 8) fail('Resume engage produced empty/near-empty line');
    if (DRY.test(them) || DRY.test(line)) {
      fail('Resume ' + choice + ' dried to train-of-thought while unfinished: ' + them);
    }
    if (fellBack) fail('Resume engage sayLine fell back while unfinished remained');
    // Opener claimed unfinished plant lesson; engage must not amnesia.
    console.log('Resume engage: coherent (non-dry) follow-through');
  } else {
    fail('unknown shape ' + shape);
  }
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
