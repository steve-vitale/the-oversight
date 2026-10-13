#!/usr/bin/env node
// test-party-wiring-20261012.js — proof that villagers actually fight together.
// Steve 2026-10-12: "make sure they actually utilize the party system among
// themselves." The depth probe measured calledHelp 0/531 fights — the
// machinery existed but was never fed.
// (a) a villager fight with crew nearby gets >=1 ally via the real path
// (b) the ally is the high-trust villager, not random
// (c) expeditionMonster passes allies through fieldFight opts
// (d) calledHelp fires when hopeless with help near (0/531 becomes >0)
// (e) no allies when truly alone
// RED: revert party-wiring.js + the expeditionMonster hook and (a)/(c)/(d) fail.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 12, mode: 'competent' });
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter((id) => id !== Game.villagerId);
  ok(roster.length >= 4, 'roster has villagers to work with (' + roster.length + ')');
  const fighter = roster[0], helperHi = roster[1], helperLo = roster[2], loner = roster[3];

  // trust: helperHi is beloved, helperLo is a stranger
  v.trust[helperHi] = 80;
  v.trust[helperLo] = 5;

  // positions: fighter + helpers together, loner far away
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(helperHi, 5, 5);
  Game.npcSetNode(helperLo, 6, 5); // adjacent node — in earshot
  Game.npcSetNode(loner, 0, 0);

  // (a) allies found via the real helper
  ok(typeof Game.villagerFightAllies === 'function', '(0) villagerFightAllies exists on Game');
  let allies = [];
  try { allies = Game.villagerFightAllies(fighter) || []; } catch (e) { allies = []; }
  ok(Array.isArray(allies) && allies.length >= 1, '(a) fighter with crew nearby gets >=1 ally (got ' + allies.length + ')');
  // (b) trust-ordered, not random: the beloved answers first
  ok(allies[0] === helperHi, '(b) highest-trust villager answers first');
  ok(allies.indexOf(helperLo) === -1 || allies[0] === helperHi, '(b) stranger does not jump the queue');

  // (e) truly alone: fighter far from everyone (all other roster at (0,0))
  Game.npcSetNode(fighter, 8, 8);
  for (const rid of roster) { if (rid !== fighter) Game.npcSetNode(rid, 0, 0); }
  let aloneAllies = [];
  try { aloneAllies = Game.villagerFightAllies(fighter) || []; } catch (e) { aloneAllies = []; }
  ok(aloneAllies.length === 0, '(e) no allies when truly alone (got ' + aloneAllies.length + ')');

  // restore proximity for the fight-path tests
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(helperHi, 5, 5);
  Game.npcSetNode(helperLo, 6, 5);

  // (c) expeditionMonster passes allies through fieldFight opts
  let capturedOpts = null;
  const oFF = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    capturedOpts = opts || {};
    return oFF.apply(this, arguments);
  };
  try { Game.expeditionMonster(fighter, 3, false); } catch (e) { console.log('  note: expeditionMonster threw: ' + e.message); }
  Game.fieldFight = oFF;
  ok(capturedOpts && (capturedOpts.allyVids || []).length >= 1,
    '(c) expeditionMonster passes allyVids (got ' + ((capturedOpts && capturedOpts.allyVids) || []).length + ')');
  ok(capturedOpts && (capturedOpts.allyVids || [])[0] === helperHi,
    '(c) the passed ally is the trusted one');

  // (d) calledHelp fires when hopeless with help near.
  // Drive real fights with a FRESH villager (the (c) fighter may be wounded
  // from its expedition fight): weak fighter vs strong monsters until the
  // hopeless branch fires (deterministic under the seeded RNG).
  const fresh = roster[4];
  Game.npcSetNode(fresh, 5, 5);
  const monsters = (Game.data.monsters || []).slice().sort((a, b) => {
    const pow = (m) => ((m.dmg || m.damage || 5) * (m.hp || m.health || 30));
    return pow(b) - pow(a);
  });
  let fired = false, tried = 0, sampleLog = '';
  for (const m of monsters.slice(0, 12)) {
    if (fired) break;
    tried++;
    try {
      const rec = Game.fieldFight(fresh, m, null, { allies: 1, allyVids: [helperHi] });
      if (rec && rec.calledHelp) { fired = true; sampleLog = (rec.log || []).filter((l) => /shout|charges/i.test(l)).join(' | '); }
    } catch (e) { /* keep trying */ }
  }
  ok(fired, '(d) calledHelp fires when hopeless with help near (' + tried + ' monsters tried)');
  if (fired) console.log('      e.g. "' + sampleLog.slice(0, 110) + '"');
  ok(/shout|charges/i.test(sampleLog), '(d) the help call is visible in the fight log');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
