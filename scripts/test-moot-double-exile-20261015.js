#!/usr/bin/env node
// test-moot-double-exile-20261015.js — PROOF TEST for the social-life blank:
// an already-exiled accused was sentenced to exile AGAIN by a later moot.
// Transcript-verified (r15 pilot, seed 1201 competent): case_2 exiled Deirdre
// on day 11; case_4 (same charge, same crew) exiled Deirdre AGAIN on day 12 —
// "Deirdre is exiled. 'Take what you can carry and go.'" twice for one
// leaving. The flipped-leniency line had the same ghost problem ("Karimi
// talked first... leniency" for Karimi, exiled the day before).
// Root cause: resolveCase's exile path narrated + removed every accused
// without checking they were still in the village.
// Fix: skip accused no longer on the roster; the flipped-leniency line only
// fires for a flipper who is still here.
// RED: the exile line fires for the already-gone accused. GREEN: only the
// present are exiled, and ghost leniency stays silent.
// Usage: node scripts/test-moot-double-exile-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); }
}

async function main() {
  const { Game } = await loadGame({ seed: 99 });
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.sysSay = () => {}; Game.emit = () => {};
  await setupGame(Game);

  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  const A = npcs[0], B = npcs[1], F = npcs[2]; // A gone, B present, F flipper
  const nm = (id) => { try { return Game.displayName(id); } catch (e) { return id; } };

  const bs = Game.betrayalState();
  bs.cases = [];
  const c = {
    id: 'case_test_double', plotId: 'plot_test', charge: 'ambush', day: 0,
    accused: [A, B, F], target: npcs[3], accuser: npcs[4],
    belief: {}, evidence: [], bribes: [], exposedBribes: [],
    inconsistencies: [], status: 'open', flipped: F,
    playerRole: 'bystander',
  };
  bs.cases.push(c);

  // A was already exiled by an earlier verdict
  Game.removeVillager(A, 'exiled');
  said.length = 0;

  Game.resolveCase(c.id, 'exile');

  const exileLines = said.filter(t => /is exiled/.test(t));
  console.log('  exile lines:', JSON.stringify(exileLines.map(t => t.slice(0, 60))));
  ok(!exileLines.some(t => t.indexOf(nm(A)) !== -1),
    'the already-exiled accused is not exiled again', nm(A));
  ok(exileLines.some(t => t.indexOf(nm(B)) !== -1),
    'the present accused IS exiled', nm(B));
  ok(!exileLines.some(t => t.indexOf(nm(F)) !== -1),
    'the flipper is spared (leniency, not exile)', nm(F));
  ok(said.some(t => /talked first/.test(t)),
    'the present flipper still gets the leniency line');

  // flipper gone too: no ghost leniency
  said.length = 0;
  const c2 = Object.assign({}, c, { id: 'case_test_double2', flipped: A });
  bs.cases.push(c2);
  Game.resolveCase(c2.id, 'exile');
  ok(!said.some(t => /talked first/.test(t)),
    'no leniency line for an exiled flipper');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the blank is present'); process.exit(1); }
  console.log('GREEN: the gone are never re-exiled, and ghosts get no leniency');
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
