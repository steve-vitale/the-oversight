#!/usr/bin/env node
// test-thread-resume-deflection-20261014.js — PROOF TEST for the social-life
// blank: resuming TWO DIFFERENT open threads in one sitting served the
// "I just said — did you miss it?" deflection on the second resume.
// Root cause: the alive:thread handler's generic resume line ("Yeah... where
// were we with that.") was identical for every thread — it self-blocked in
// sayLine's no-repeat ledger on the second resume, and the fallback
// deflection fired for a player who wasn't repeating themselves (seed 53
// sit490: 5x, observed by the dead 2026-10-14 sociallife-r1 run).
// Fix (journey-social r15 2026-10-15): thread-specific resume line
// ("About <label> — yeah, we never did get back to that.") — distinct per
// thread, no self-block, reads like a person picking up the actual thread.
// RED: any deflection line on either resume. GREEN: 0 deflections, each
// response names its own thread.
// (Test recovered from the dead r1 run's uncommitted work and repaired —
// the original never declared `fails` and never checked its results.)
// Usage: node scripts/test-thread-resume-deflection-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const DEFLECT_RE = /I just said|I just told you|We've covered this one/;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); }
}

async function main() {
  const { Game } = await loadGame({ seed: 7 });
  if (typeof Game.say === 'function') { Game.say = function () {}; }
  await setupGame(Game);
  const v = Game.state.village || {};
  const me = Game.villagerId;
  const vid = (v.roster || []).find(id => id !== me);
  if (!vid) { console.log('FAIL: no villager'); process.exit(1); }

  Game.startConvo(vid);
  // two distinct open threads; resuming both in one sitting is the bug's
  // trigger (the second resume is a DIFFERENT thread, not a repeat)
  Game.convoThreadOpen(vid, 'testA', 'the old generator', 'unfinished');
  Game.convoThreadOpen(vid, 'testB', 'the north field', 'unfinished');

  const lines = [];
  for (const tid of ['testA', 'testB']) {
    const r = Game.convoTurn(vid, 'alive:thread:' + tid);
    const line = String((r && r.line) || '');
    lines.push({ tid, line });
    console.log('  resume', tid, '->', JSON.stringify(line.slice(0, 120)));
  }
  // the transcript is the observable record — the deflection must not appear
  const c = Game.convoGet(vid);
  const spoken = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  ok(!DEFLECT_RE.test(lines[0].line), 'first resume: no deflection');
  ok(!DEFLECT_RE.test(lines[1].line), 'second resume (different thread): no deflection');
  ok(lines[0].line.indexOf('the old generator') !== -1, 'first resume names its own thread', lines[0].line.slice(0, 80));
  ok(lines[1].line.indexOf('the north field') !== -1, 'second resume names its own thread', lines[1].line.slice(0, 80));
  ok(lines[0].line !== lines[1].line, 'the two resumes are distinct lines');
  ok(!spoken.some(t => DEFLECT_RE.test(t)), 'no deflection anywhere in the transcript');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the blank is present'); process.exit(1); }
  console.log('GREEN: two thread resumes, zero deflections, each names its thread');
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
