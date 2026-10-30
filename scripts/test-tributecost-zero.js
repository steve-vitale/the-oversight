#!/usr/bin/env node
// test-tributecost-zero.js — proof for sim-tributecost-a: tribute cannot
// be zeroed from policy code (prereg legs Z1/Z2).
//
// BEHAVIORAL, not source-grep only: a real game is loaded, and the two
// formation paths a policy can reach are exercised with a 0-tribute
// offer:
//   Z1: _formLink (the path proposeLink takes on accept) with
//       tributeKcalPerWeek: 0 must floor to 4000 (hierarchy.js:753:
//       `opts.tributeKcalPerWeek || 4000`).
//   Z2: _stageCounter (the path proposeLink takes on a mid-band score)
//       from a 0-tribute proposal must stage FIXED terms of 5,000
//       (LEAD-origin, hierarchy.js:683), and answerCounter('accept')
//       must form the link on those terms — never 0.
// A negative tribute, a monkey-patched engine method, and a game-code
// change are all OUT of scope for a policy variant: this test proves
// the honest policy inputs (0, or omitted) never produce a 0 link.
// Source assertions pin the floors so a future code move that changes
// the defaults fails loudly here instead of silently re-enabling a
// "zeroed" arm that is not zeroed.
//
// Usage: node scripts/test-tributecost-zero.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  // Source pins (documentation of the floors; behavioral legs below are primary).
  const hier = fs.readFileSync(path.join(ROOT, 'src/js/hierarchy.js'), 'utf8');
  check('S1 proposeLink defaults offered to 4000', /var offered = opts\.tributeKcalPerWeek \|\| 4000/.test(hier));
  check('S2 _formLink defaults tribute to 4000', /tributeKcalPerWeek: opts\.tributeKcalPerWeek \|\| 4000/.test(hier));
  check('S3 counter terms fixed at 5000 for LEAD-origin', /tributeKcalPerWeek: opts\.asSubordinate \? Math\.max\(offered, 6000\) : 5000/.test(hier));

  const { Game } = await loadGame({ seed: 9911, mode: 'tributecost-zero' });
  await setupGame(Game);
  check('H1 _formLink exposed on Game', typeof Game._formLink === 'function');
  check('H2 _stageCounter exposed on Game', typeof Game._stageCounter === 'function');
  check('H3 answerCounter exposed on Game', typeof Game.answerCounter === 'function');
  if (typeof Game._formLink !== 'function' || typeof Game._stageCounter !== 'function' || typeof Game.answerCounter !== 'function') {
    console.log(`${pass} passed, ${fail} failed`);
    process.exit(1);
  }
  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id);
  check('H4 at least two other villages to link', ovs.length >= 2, 'found ' + ovs.length);
  if (ovs.length < 2) { console.log(`${pass} passed, ${fail} failed`); process.exit(1); }

  // Z1: formation with a 0 offer.
  const link0 = Game._formLink(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 0 }, null);
  check('Z1 _formLink tribute 0 -> 4000, not 0', link0 && link0.tributeKcalPerWeek === 4000, 'got ' + (link0 && link0.tributeKcalPerWeek));
  check('Z1 link is Haven-primary (LEAD)', link0 && link0.primary === 'haven' && link0.subordinate === ovs[0].id);
  // Z1 control: an explicit 4000 offer forms at 4000 (the call path works).
  const link4 = Game._formLink(ovs[1].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  check('Z1c _formLink tribute 4000 -> 4000', link4 && link4.tributeKcalPerWeek === 4000, 'got ' + (link4 && link4.tributeKcalPerWeek));

  // Z2: counter from a 0 offer. Use a third village if present, else
  // reuse the second village's pair via a fresh counter (stage does not
  // check existing links; accept forms a second link object — the
  // tribute value, not the graph, is what this leg proves).
  const cTarget = ovs[2] ? ovs[2].id : ovs[1].id;
  const staged = Game._stageCounter(cTarget, { asSubordinate: false, tributeKcalPerWeek: 0 }, null);
  check('Z2 staged counter exists', !!staged);
  const pc = Game.state.pendingCounter;
  check('Z2 counter terms are 5000, not 0', pc && pc.tributeKcalPerWeek === 5000, 'got ' + (pc && pc.tributeKcalPerWeek));
  check('Z2 counter makes Haven subordinate', pc && pc.asSubordinate === true);
  const accepted = Game.answerCounter('accept');
  check('Z2 accept forms a link', !!accepted && typeof accepted === 'object');
  check('Z2 accepted link tribute is 5000, not 0', accepted && accepted.tributeKcalPerWeek === 5000, 'got ' + (accepted && accepted.tributeKcalPerWeek));
  check('Z2 accepted link is Haven-subordinate', accepted && accepted.subordinate === 'haven' && accepted.primary === cTarget);

  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
