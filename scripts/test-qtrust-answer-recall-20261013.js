#!/usr/bin/env node
// test-qtrust-answer-recall-20261013.js — PLAYTEST social r9 2026-10-13.
// Fabricated-history blank from probe 2: q_trust's recall was answer-blind.
// A player who answered "I hope to earn it." (a_earn) later heard
// "You told me to watch what you do" — words they never said.
// Fix: answer-specific `recalls` map on q_trust; conversation.js picks by
// the stored answer id. RED on pristine, GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 777, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const player = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== player);
  if (!vid) { fail('no NPC on roster'); return; }

  const cases = [
    ['a_earn', /earn it/, /watch what you do/],
    ['a_actions', /watch what you do/, /hope to earn it/],
    ['a_yes', /choosing to believe/, /watch what you do/],
  ];
  for (const [ans, mustMatch, mustNotMatch] of cases) {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.answered = c.answered || {};
    c.recalled = c.recalled || {};
    c.answered.q_trust = ans;
    delete c.recalled.q_trust;
    let out = null;
    try { out = Game.convoOpening(vid, null); } catch (e) { fail(ans + ': convoOpening threw: ' + e.message); continue; }
    const line = out && out.line ? String(out.line) : '';
    if (!line) { fail(ans + ': opener returned no line'); continue; }
    if (!mustMatch.test(line)) { fail(ans + ': recall does not reflect the answer. Line: ' + line); continue; }
    if (mustNotMatch.test(line)) { fail(ans + ': recall attributes words the player never said. Line: ' + line); continue; }
    ok(ans + ' -> "' + line.slice(0, 80) + '"');
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  if (!process.exitCode) console.log('ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
