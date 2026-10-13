#!/usr/bin/env node
// test-fightlog-names-20261012.js — PROOF for the villager-depth fight-log
// naming fix.
//
// BLANK: fieldFights.js resolved villager names via
// displayName(vid).split(' ')[0]. Pre-System, an unknown villager's
// displayName is a descriptor like "A woman, maybe 30s" — so fight logs
// read "A strikes for 25 (15 left)", "A is losing — shouts for help!".
// The firstRef helper (game.js) exists precisely to never collapse to
// bare "A"; fieldFights.js wasn't using it.
//
// BEFORE: rec.log contains bare-"A" fighter references.
// AFTER: rec.log uses firstRef ("the woman in her 30s ...") — no bare "A".
//
// RED: git stash the fieldFights.js fix -> this test FAILs.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { failures++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

// deterministic rng for the fight
function mkRng(seed) {
  let s = seed >>> 0;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'fightlog-names-proof' });
  Game.say = () => {}; Game.sysSay = () => {}; Game.audioEvent = () => {};
  await setupGame(Game);

  // pre-System: names are knowledge-gated
  Game.state.systemArrived = false;
  const v = Game.state.village;
  v.knownNames = {};
  const me = Game.villagerId;
  const vid = (v.roster || []).find(id => id !== me);
  check('found a non-player villager', !!vid, 'no roster');

  // confirm the fixture: displayName is a descriptor, name not known
  const dn = Game.displayName(vid);
  check('displayName is an "A ..." descriptor pre-System', /^A /.test(dn), 'got: ' + dn);
  check('nameKnown is false', !Game.nameKnown(vid));

  // run a real field fight
  const mdef = { id: 'hushwolf', wave: 1, speed: 3, attack: { name: 'Snap', damage: [4, 7] } };
  const rec = Game.fieldFight(vid, mdef, null, { awareness: true, rng: mkRng(7) });
  check('fight produced a log', rec && rec.log && rec.log.length > 0, 'no log');

  const bareA = /(^|[^a-zA-Z])A (strikes|is losing|sees how|BELLOWS|SCREAMS|charges in)/;
  const bad = (rec.log || []).filter(l => bareA.test(String(l)));
  check('no bare-"A" fighter reference in fight log', bad.length === 0,
    bad.length ? 'e.g. ' + String(bad[0]).slice(0, 80) : '');

  // the log should name them the firstRef way (descriptor or real name)
  const ref = Game.firstRef(vid);
  const hasRef = (rec.log || []).some(l => String(l).includes(ref));
  check('log uses firstRef-style reference ("' + ref + '")', hasRef);

  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
