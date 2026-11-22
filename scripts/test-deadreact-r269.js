#!/usr/bin/env node
// Proof: DEAD-REACT WASHOUT — a found-but-blocked thread beat must not reset
// the consecutive-dead-react count (journey-deepening r269).
//
// r269 panel, seed 105123 day 60: Henry, just_company, trust 91. The driver
// pressed dlg:react five times and the villager repeated a filler line
// VERBATIM on the 5th press: '"Well." A breath. "That\'s where things
// stand."' twice in one sitting (the VERBATIM REPEATS instrument flagged it;
// the pilot reproduced the sitting exactly, so this is the same defect
// twice, and scale r246's Miguel d90 "So." twice is the third sighting).
// The r246 exhaustion gate (react retires after 2 dead reacts) never fired.
//
// Root cause: convoThreadBeat resets reactDryCount to 0 as soon as it FINDS
// a beat — before the dlg:react handler checks whether the run ledger
// BLOCKS that beat (DRY3). The just_company engageBeat is a CONSTANT line
// ("This is nice. Just — being around people..."), so after it is spoken
// once, every react press finds it, blocks it, and washes the count to 0;
// the filler below re-raises it to 1. The count can never reach 2 while
// blockable beats keep being found, react stays offered forever, and the
// 4-line dead-react pool cycles verbatim on the 5th press.
// Fix (src/js/convo-dialogue.js): snapshot reactDryCount before the
// convoThreadBeat call; a blocked beat restores it, so the increment counts
// consecutive dead reacts. A landed beat keeps the reset (it returns above).
//
// GREEN (post-fix): the count rises by exactly 1 per dead react, react is
// no longer offered after 2 dead reacts, and the dead-react lines never
// repeat verbatim. Seed 7 is pinned: pre-fix it washes out on presses 2, 3
// AND 4 (count stuck at 1 three times in a row), so the failing control is
// deterministic — seed 269's roll sequence happens to skip the beat attempt
// on press 2 and passes pre-fix by luck. Staging mirrors
// test-mootclose-r269.js. Uses the shared harness (scripts/sim-harness).
// Exits nonzero on failure.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const ENGAGE = '"This is nice. Just — being around people. I forget how much I need it."';

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  assert(living.length > 0, 'need a living villager');
  const vid = living[0];
  Game.convoPlantSeed(vid, { wantId: 'just_company', note: 'just sit' });
  let r = Game.startConvo(vid);
  const c0 = Game.convoGet(vid);
  check('sitting opens on just_company', !!(c0 && c0.want && c0.want.id === 'just_company'));

  // Speak the engageBeat line first (dlg:more), so every later react press
  // finds it and the ledger blocks it — the Henry shape, deterministically.
  r = Game.convoTurn(vid, 'dlg:more');
  const themAfterMore = ((Game.convoGet(vid) || {}).transcript || [])
    .filter(e => e.who === 'them').map(e => String(e.text));
  check('dlg:more speaks the just_company engageBeat line',
    themAfterMore[themAfterMore.length - 1] === ENGAGE,
    JSON.stringify(themAfterMore[themAfterMore.length - 1]));

  // Press react until it retires (or 6 presses — past the pool's 4-line
  // cycle, where a pre-fix sitting repeats verbatim).
  const deadLines = [];
  let deadReacts = 0;
  let retiredAfter = null;
  for (let i = 0; i < 6; i++) {
    const c = Game.convoGet(vid);
    if (!c || !c.active) break;
    const ids = ((r && r.choices) || []).map(x => x.id);
    if (!ids.includes('dlg:react')) { retiredAfter = deadReacts; break; }
    const before = c.reactDryCount || 0;
    r = Game.convoTurn(vid, 'dlg:react');
    const after = (Game.convoGet(vid) || {}).reactDryCount || 0;
    const them = ((Game.convoGet(vid) || {}).transcript || [])
      .filter(e => e.who === 'them').map(e => String(e.text));
    const line = them[them.length - 1];
    // A landed beat would return the engageBeat line, not a filler — every
    // press here is a dead react (the constant line is ledger-blocked).
    check('press ' + (i + 1) + ' is a dead react (filler, not the engage line)',
      line !== ENGAGE, JSON.stringify(line));
    check('press ' + (i + 1) + ': dead count rises by exactly 1 (no washout)',
      after === before + 1, 'before=' + before + ' after=' + after);
    deadLines.push(line);
    deadReacts++;
    if (r && r.ended) break;
  }
  check('at least 2 dead reacts happened', deadReacts >= 2, 'deadReacts=' + deadReacts);
  check('react retires after exactly 2 dead reacts (r246 gate fires)',
    retiredAfter === 2, 'retiredAfter=' + JSON.stringify(retiredAfter));
  const dupes = deadLines.filter((x, i) => deadLines.indexOf(x) !== i);
  check('no verbatim repeat among the dead-react lines', dupes.length === 0,
    JSON.stringify(dupes));
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  console.log('DEADREACT-R269 PASS: ' + pass + ' checks, ' + deadReacts + ' dead reacts, retired after ' + retiredAfter);
}

main().catch(e => { console.error('DEADREACT-R269 FAIL: ' + (e && e.stack || e)); process.exit(1); });
