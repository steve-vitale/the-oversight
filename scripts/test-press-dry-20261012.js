#!/usr/bin/env node
// test-press-dry-20261012.js — PROOF for journey-succession r9.
//
// BLANK: `betrayal:press` ("Walk me through that night again. Slowly.")
// was offered FOREVER with no exhaustion guard. Once pressAccomplice ran
// dry, the choice cycled "story holds" lines into sayLine's repeat-filter
// deflections ("...Sorry, lost my train of thought.") infinitely —
// transcript-verified 7 dead presses in a row. A dead choice, a filler
// loop, against the conversation quality bar.
//
// FIX: two honest dry presses of the designed "story holds" content, then
// a terminal line ("There's nothing more to press here.") and the choice
// stops being offered. Fresh inconsistencies re-arm it.
//
// RED on pristine HEAD: no terminal line, the press choice never goes
// away (press #3/#4/#5 still cycle the held box).
// GREEN post-fix: terminal line on dry press #2, choice suppressed after.
//
// Usage: node scripts/test-press-dry-20261012.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}
const hasPressChoice = (Game, vid) =>
  (Game.betrayalChoices(vid) || []).some(c => (c.id || '').indexOf('betrayal:press:') === 0);

async function main() {
  Math.random = mulberry32(4242);
  const { Game } = await loadGame({ seed: 4242, mode: 'press-dry', fullTelemetry: false });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 4) { console.log('roster too small'); process.exit(2); }
  const [A, B, D, W] = roster;

  // a dry case: no inconsistencies to find, known to the player, open
  const plot = { id: 'dryplot', leader: A, accomplices: [B], target: D, weakest: B, witnesses: [] };
  const c = Game.openCase(plot, 'ambush');
  c.inconsistencies = [];
  c.knownToPlayer = true;
  c.status = 'open';

  Game.startConvo(B);
  const pressId = 'betrayal:press:' + c.id + ':' + B;
  check('press-offered-initially', hasPressChoice(Game, B), '');

  const lines = [];
  for (let i = 1; i <= 5; i++) {
    let r = null;
    try { r = Game.betrayalTurn(B, pressId); } catch (e) { lines.push('THREW: ' + e.message); break; }
    lines.push(String((r && r.line) || ''));
  }
  console.log('  press lines:');
  lines.forEach((l, i) => console.log(`    #${i + 1}: ${l.slice(0, 110)}`));

  const terminal = lines.some(l => /nothing more to press here/i.test(l));
  check('terminal-line-appears', terminal, 'no "nothing more to press here" in 5 presses (pristine?)');
  const termIdx = lines.findIndex(l => /nothing more to press here/i.test(l));
  check('terminal-on-second-dry-press', termIdx === 1, `terminal at press #${termIdx + 1}`);
  check('press-suppressed-after', !hasPressChoice(Game, B), 'press choice still offered');
  // pressing a 3rd/4th/5th time via the raw API (UI-unreachable once the
  // choice is suppressed) must never pretend progress: no crack claims,
  // no fresh story-holds content — only the terminal line or the generic
  // repeat-filter backstop.
  const noFalseProgress = lines.slice(2).every(l =>
    /nothing more to press here/i.test(l) || !/crack|story holds|No crack/i.test(l));
  check('later-presses-no-false-progress', noFalseProgress, lines.slice(2).map(l => l.slice(0, 60)).join(' | '));

  // re-arm: a fresh inconsistency brings the press back, and it cracks
  c.inconsistencies.push({ found: false, claims: { [B]: 'they were at the fire' }, field: 'whereabouts', altClaim: 'they were at the treeline', selfContra: true });
  check('press-rearmed', hasPressChoice(Game, B), 'press not re-offered after new inconsistency');
  let r2 = null;
  try { r2 = Game.betrayalTurn(B, pressId); } catch (e) {}
  check('fresh-crack-lands', r2 && c.inconsistencies.at(-1).found && /crack|story splits/i.test(String(r2.line || '')), String((r2 && r2.line) || '').slice(0, 110));
  check('dry-count-reset', !((c.pressDry || {})[B]), `pressDry=${JSON.stringify(c.pressDry)}`);

  try { Game.endConvo(B, 'left'); } catch (e) {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('THREW: ' + e.stack); process.exit(2); });
