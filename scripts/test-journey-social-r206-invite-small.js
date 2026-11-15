#!/usr/bin/env node
// test-journey-social-r206-invite-small.js — r206 invite double-serve proof (Lane B).
// The invite 'small' pool in betrayal.js resolveInvite is picked by raw RNG,
// and the accept outcome rides the diegeticAct exemption through sayLine —
// so taking the invite twice in one sitting can serve the identical scene
// line twice. Transcript-caught on the r206 panel: Saud, seed 44504,
// "Saud shows you where they go to think. \"Don't tell the others.
// Everyone needs one place.\"" twice in one C-friendship sitting (10
// turns). Seed 8 reproduces it pre-fix (Marvin, think-place line twice).
// Fix: the 'small' pick skips lines already spoken in THIS sitting (the
// per-sitting ledger sayLine maintains), falling back to the first pool
// line when all three were said. Reward/wild lines are untouched — their
// lines carry granted rewards / trauma, not pure flavor.
// RED verified on the unfixed code (seed 8: identical lines); GREEN after.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const SMALL = [
  'Nothing much there',
  "doesn't say much",
  'where they go to think',
];
const isSmall = (l) => SMALL.some(s => String(l || '').includes(s));
const lastNpc = (Game, vid) => {
  const tr = (Game.convoGet(vid).transcript || []).filter(e => e.who !== 'you');
  return tr.length ? String(tr[tr.length - 1].text || '') : '';
};

(async () => {
  const { Game } = await loadGame({ seed: 8, mode: 'test-journey-social-r206-invite-small' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const me = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== me);
  const defId = (Game.INVITE_DEFS()[0] || {}).id;
  Game.startConvo(vid);
  const lines = [];
  for (let i = 0; i < 2; i++) {
    const bs = Game.betrayalState();
    bs.invites[vid] = { count: 0, accepted: 0, outcomes: [], pending: { defId, day: Game.state.scholar.day } };
    Game.betrayalTurn(vid, 'betrayal:accept');
    lines.push(lastNpc(Game, vid));
  }
  Game.endConvo(vid, 'left');

  // Precondition: seed 8 rolls 'small' on both accepts (guards the test
  // against RNG drift silently changing what it exercises).
  ok('precondition: both accepts roll small', lines.every(isSmall), 'got: ' + JSON.stringify(lines.map(l => l.slice(0, 60))));
  // The fix: the second serve must not repeat the first line verbatim.
  ok('second small serve differs from the first', lines[0] !== lines[1], 'got identical: ' + JSON.stringify(lines[0].slice(0, 80)));

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
