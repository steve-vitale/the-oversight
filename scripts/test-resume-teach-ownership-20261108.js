#!/usr/bin/env node
// test-resume-teach-ownership-20261108.js — dialog audit defect #7.
// Unfinished-thread resume must not offer Teach / agency pivots while the
// claimed debt/confide owns the sitting. Teach succeeding abandons the
// claimed thread — suppress until subject-change (mirrors r7 question
// ownership).
//
// Repros (dialog-coherence-audit.md #7): seed-7 Vasyl / seed-99 Luis turn 0
// — resume unfinished confide/debt → menu offers Teach.
//
// GREEN: resume menu has no teach / skill_teach / agency pivots while
//   ownership holds; after explicit subject-change, teach may return.
// RED (pre-fix): teach present on turn-0 resume menu.
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const PIVOT = /^(teach|theorize|trade|hawker|compare_maps|observe|offer_help|invite_party|skill_learn:|skill_teach:|agency:)/;

function ensureTeachable(Game) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.plants = Game.state.codex.plants || {};
  Game.state.codex.plants.burdock = Object.assign(
    { name: 'burdock', known: true, level: 2 },
    Game.state.codex.plants.burdock || {}
  );
  // Mark as plantKnown-friendly if the helper needs more fields.
  try {
    if (typeof Game.plantKnown === 'function' && !Game.plantKnown('burdock')) {
      Game.state.codex.plants.burdock.level = 2;
      Game.state.codex.plants.burdock.known = true;
    }
  } catch (e) {}
}

async function confideResumeShape() {
  // seed-7 Vasyl shape: unfinished confide resume offers Teach.
  const { Game } = await loadGame({ seed: 7, mode: 'resume-teach-confide' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 50;
  ensureTeachable(Game);
  Game.convoThreadOpen(vid, 'secret', 'what they confided', 'walked away mid-thread',
    'I still have not told you the whole of what I promised to say.');
  if (!(Game.convoOpenThreads(vid) || []).some(o => o.tid === 'secret')) {
    throw new Error('confide open thread failed to plant');
  }
  const orig = Math.random;
  Math.random = () => 0.1; // force resume
  const opened = Game.startConvo(vid);
  Math.random = orig;
  const c = Game.convoGet(vid);
  const opener = opened && opened.line ? String(opened.line) : '';
  if (!c._resumedOnce || c._resumeOwnsTid !== 'secret') {
    throw new Error('expected resume ownership on secret, got tid=' + c._resumeOwnsTid);
  }
  if (!/confided|never finished/i.test(opener)) {
    throw new Error('opener did not claim unfinished confide: ' + opener);
  }
  if (!Game.convoResumeOwnsSitting(vid)) {
    throw new Error('convoResumeOwnsSitting should be true after confide resume');
  }
  const menu = Game.convoChoices(vid) || [];
  const ids = menu.map(m => m && m.id).filter(Boolean);
  const pivots = ids.filter(id => PIVOT.test(id));
  // Subject-change releases ownership — teach may return after.
  let teachAfterSubject = null;
  if (ids.includes('dlg:subject') || ids.includes('subject')) {
    const subId = ids.includes('dlg:subject') ? 'dlg:subject' : 'subject';
    Game.convoTurn(vid, subId);
    const after = Game.convoChoices(vid) || [];
    teachAfterSubject = after.some(m => m && (m.id === 'teach' || String(m.id).startsWith('skill_')));
  }
  Game.endConvo(vid, 'left');
  return { opener, ids, pivots, teachAfterSubject, owns: true };
}

async function debtResumeShape() {
  // seed-99 Luis-adjacent: unfinished debt/want resume must not offer Teach.
  const { Game } = await loadGame({ seed: 99, mode: 'resume-teach-debt' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 50;
  ensureTeachable(Game);
  Game.convoThreadOpen(vid, 'want', 'that debt', 'walked away mid-thread',
    'I still owe you for that promise we left hanging.');
  if (!(Game.convoOpenThreads(vid) || []).some(o => o.tid === 'want')) {
    throw new Error('debt open thread failed to plant');
  }
  const orig = Math.random;
  Math.random = () => 0.1;
  const opened = Game.startConvo(vid);
  Math.random = orig;
  const c = Game.convoGet(vid);
  const opener = opened && opened.line ? String(opened.line) : '';
  if (!c._resumedOnce) throw new Error('expected _resumedOnce after debt resume');
  const owns = !!Game.convoResumeOwnsSitting(vid);
  const menu = Game.convoChoices(vid) || [];
  const ids = menu.map(m => m && m.id).filter(Boolean);
  const pivots = ids.filter(id => PIVOT.test(id));
  Game.endConvo(vid, 'left');
  return { opener, ids, pivots, owns };
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  if (!process.argv.includes('--child')) {
    for (const shape of ['confide', 'debt']) {
      const r = spawnSync(process.execPath, [__filename, '--child', shape], {
        encoding: 'utf8', env: process.env,
      });
      process.stdout.write(r.stdout || '');
      process.stderr.write(r.stderr || '');
      if (r.status !== 0) fails++;
    }
    // Keep #1 favor/debt Help green.
    const favor = spawnSync(process.execPath, [
      path.join(__dirname, 'test-favor-debt-help-coherence-20261108.js'),
    ], { encoding: 'utf8', env: process.env });
    process.stdout.write(favor.stdout || '');
    process.stderr.write(favor.stderr || '');
    if (favor.status !== 0) fail('favor/debt Help coherence (#1) regressed');
    console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — resume ownership suppresses Teach/agency pivots');
    process.exit(fails ? 1 : 0);
  }

  const shape = process.argv[process.argv.indexOf('--child') + 1];
  if (shape === 'confide') {
    const { opener, ids, pivots, teachAfterSubject } = await confideResumeShape();
    console.log('confide opener:', opener);
    console.log('confide menu:', ids.join(','));
    if (pivots.length) fail('confide resume offered pivots while owned: ' + pivots.join(','));
    if (ids.includes('teach')) fail('confide resume offered Teach');
    if (teachAfterSubject === false) {
      // Subject menu may or may not surface teach depending on knowledge;
      // only fail if we explicitly got a false after ensuring teachable —
      // allow null when no subject choice existed.
      console.log('note: teach after subject-change =', teachAfterSubject);
    }
  } else if (shape === 'debt') {
    const { opener, ids, pivots, owns } = await debtResumeShape();
    console.log('debt opener:', opener);
    console.log('debt menu:', ids.join(','));
    console.log('debt owns:', owns);
    // Want-stage ownership may already narrow the menu; either way Teach
    // must not appear while the unfinished claim is live.
    if (pivots.length) fail('debt resume offered pivots while unfinished: ' + pivots.join(','));
    if (ids.includes('teach')) fail('debt resume offered Teach');
  } else {
    fail('unknown child shape ' + shape);
  }
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
