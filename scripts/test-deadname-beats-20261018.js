#!/usr/bin/env node
// test-deadname-beats-20261018.js — proof test for the r17 blank:
// live beats naming DEAD villagers.
//
// Observed in journey-endgame-r17 (community-s8951): the original Bearer
// (DeAndre Tian) died d64; the mantle passed to Aaron Ye, who had been
// appointed relay-holder. From d65 the relayTick "you look tired" line
// named DEAD DeAndre ("DeAndre watches you at the relay console"), and the
// d83 grounding grief beat said dead DeAndre "set a place for you at the
// feast". Both beats read (data.villagers||[]).filter(x => x.id !==
// villagerId)[0] — dead records stay in data.villagers (marked .dead), so
// the first non-Bearer entry can be a corpse.
//
// RED (before fix): the beats name a dead villager. GREEN (after fix):
// they name only the living.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 8951, mode: 'test-deadname-beats' });
  await setupGame(Game);
  const said = [];
  const osay = Game.say;
  Game.say = function (x) { try { said.push(String(x)); } catch (e) {} try { return osay.call(this, x); } catch (e) {} };
  const me = Game.villagerId;
  const others = (Game.data.villagers || []).filter(v => v && v.id && v.id !== me && v.name);
  if (others.length < 2) { console.log('SKIP: need 2+ fellow villagers'); process.exit(2); }
  // Kill everyone except the LAST fellow villager — the old filter()[0]
  // then returns a corpse by construction.
  const survivor = others[others.length - 1];
  const corpses = others.slice(0, -1);
  for (const v of corpses) v.dead = true;
  const sFirst = (survivor.name || '').split(' ')[0];
  const corpseFirsts = corpses.map(v => (v.name || '').split(' ')[0]).filter(n => n && n !== sFirst);

  let fail = 0;
  const check = (label, line) => {
    if (!line) { console.log('MISS: ' + label + ' — beat did not fire'); fail++; return; }
    const deadNamed = corpseFirsts.some(n => line.indexOf(n) >= 0);
    const liveNamed = sFirst && line.indexOf(sFirst) >= 0;
    console.log((deadNamed ? 'FAIL' : 'PASS') + ': ' + label +
      (deadNamed ? ' — named a CORPSE: ' : liveNamed ? ' — named the living: ' : ' — named nobody identifiable: ') +
      line.slice(0, 130));
    if (deadNamed || !liveNamed) fail++;
  };

  // 1. relayTick's weekly "you look tired" line (holderDays 6 -> 7).
  Game.state.switchboard = {
    holderId: me, appointedDay: 0, stage: 'village relay', bearerHeld: true,
    routed: 0, delayed: 0, edited: 0, skimmed: 0, log: [], mootVoiceLost: false, lastLeadDay: -1,
  };
  const rs = Game.state.scholar.relay || (Game.state.scholar.relay = {});
  rs.holderDays = 6;
  said.length = 0;
  try { Game.relayTick(); } catch (e) { console.log('relayTick threw: ' + e.message); fail++; }
  check('relayTick tired line', said.find(s => s.indexOf('You look tired') >= 0));

  // 2. groundingReactionBeats' hollow grief beat.
  said.length = 0;
  try { Game.groundingReactionBeats('grounded', 'hollow', 'test'); } catch (e) { console.log('grief beat threw: ' + e.message); fail++; }
  check('grounding grief beat', said.find(s => s.indexOf('grieve you while') >= 0));

  if (fail) { console.log('RED: dead villagers named in live beats (' + fail + ' problems)'); process.exit(1); }
  console.log('GREEN: beats name only the living');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
