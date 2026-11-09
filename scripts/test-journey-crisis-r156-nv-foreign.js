#!/usr/bin/env node
// test-journey-crisis-r156-nv-foreign.js — r156 Q1(c) SIGNING-NOD PAIR proof.
// The foreign-react fallback 'They answer at length.' repeated verbatim
// 12x across 3 no-words sittings (13903 d37/d38, 13904 d90) because
// convoPick's dedupe stringified phrase OBJECTS to "[object Object]" —
// one said phrase marked the whole foreignSpeech pool said, so
// foreignLine returned null forever after for that villager (and the
// opener fell back too on later sittings).
// RED on unfixed code: foreignLine returns null after the first pick,
// nvRespond falls back to 'They answer at length.' every time.
// GREEN on fixed code: foreign phrases cycle distinctly, no fallback.
// Uses the shared seeded harness (sim-harness.js); a day-0 villager is
// forced Bengali-only (Farid joins later in the panel seed).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' — ' + extra : '')); }
}
(async () => {
  const { Game } = await loadGame({ seed: 13904, mode: 'crisis-delayed-r70', fullTelemetry: true });
  await setupGame(Game, 'Chicago, Illinois');
  const vid = ((Game.state.village || {}).roster || [])[0];
  const person = Game.getPerson(vid) || {};
  person.languages = { native: 'bengali', english: 0 };
  check('probe villager is Bengali-only', Game.npcNativeLang(vid) === 'bengali');
  // 1. foreignLine cycles the agree pool (4 phrases) without going null.
  const agreeTexts = [];
  for (let i = 0; i < 4; i++) {
    const ph = Game.foreignLine(vid, 'agree');
    agreeTexts.push(ph ? ph.t : null);
  }
  check('foreignLine agree returns a phrase 4x', agreeTexts.every(t => typeof t === 'string' && t.length > 0), JSON.stringify(agreeTexts));
  check('foreignLine agree phrases are all distinct', new Set(agreeTexts).size === 4, JSON.stringify(agreeTexts));
  // 2. A different kind is NOT poisoned by the agree picks (cross-kind).
  const op = Game.foreignLine(vid, 'openers');
  check('foreignLine openers still returns a phrase after agree picks', !!op && typeof op.t === 'string', op ? op.t : 'NULL');
  // 3. nvRespond renders foreign speech, never the fixed fallback.
  Game.startConvo(vid);
  const reacts = [];
  for (let i = 0; i < 4; i++) reacts.push(Game.nvRespond(vid, 'nod'));
  for (let i = 0; i < 2; i++) reacts.push(Game.nvRespond(vid, 'smile'));
  check('nvRespond never falls back to They answer at length.', reacts.every(l => !String(l).startsWith('They answer at length.')), JSON.stringify(reacts));
  check('nvRespond renders foreign text', reacts.every(l => String(l).indexOf('«') !== -1), JSON.stringify(reacts));
  // 4. A second sitting with the same villager is NOT poisoned (c.said persists).
  Game.startConvo(vid);
  const second = Game.nvRespond(vid, 'nod');
  check('second sitting nvRespond still renders foreign text', String(second).indexOf('«') !== -1 && !String(second).startsWith('They answer at length.'), JSON.stringify(second));
  // 5. Control: string pools still dedupe/cycle (no behavior change for strings).
  const cyc = [];
  for (let i = 0; i < 3; i++) cyc.push(Game.convoPickCycle(vid, 'r156-test-strings', ['alpha', 'beta', 'gamma']));
  check('string pool cycles distinctly', new Set(cyc).size === 3, JSON.stringify(cyc));
  console.log(fail === 0 ? 'ALL NV-FOREIGN CHECKS PASSED' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('TEST ERROR', e && e.stack || e); process.exit(1); });
