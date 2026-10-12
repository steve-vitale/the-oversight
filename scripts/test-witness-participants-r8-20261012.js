#!/usr/bin/env node
// test-witness-participants-r8-20261012.js — lever-1 r8: combatWitnessReact
// participant pool. A villager fighting alongside you is a witness to the
// kill and the hurt — the bystander pool (map-proximity) missed them, so a
// companion said nothing when the beast dropped. 'start'/'flee' stay
// bystander-only.
//
// RED: with no bystanders in range, old code says nothing at kill/hurt.
// GREEN: with a villager participant in the fight, kill/hurt say a line;
//   start stays silent (participants don't "watch" their own fight).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; } else { fail++; console.log(`FAIL ${name}`); }
}

const WITNESS_FRAGS = ['jaw tight', 'whoops', 'It\'s dead?', 'stares at the body', 'winces', 'MOVE!'];

(async () => {
  const { Game } = await loadGame({ seed: 41, mode: 'test' });
  await setupGame(Game);
  const said = [];
  Game.say = function (m) { if (typeof m === 'string') said.push(m); };

  // Start a fight with a villager participant. Force no bystanders: move
  // every other roster villager far away on the map.
  Game.startCombat('hummice');
  if (!Game.tbfight) { console.log('FAIL setup: no fight'); process.exit(1); }
  const f = Game.tbfight;
  // add a villager fighter directly (participant)
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const allyId = roster[0];
  f.fighters.push({ key: 'vAlly', kind: 'villager', villagerId: allyId, name: 'Ally', hp: 100, maxHp: 100, alive: true, mx: 4, my: 4 });
  // clear bystander positions: push everyone else out of range.
  // (positions populate during play, so clear AFTER startCombat.)
  try {
    const pos = Game.state.village.positions || {};
    const smx = Game.state.scholar.mx != null ? Game.state.scholar.mx : 4;
    const smy = Game.state.scholar.my != null ? Game.state.scholar.my : 4;
    for (const rid of Object.keys(pos)) {
      if (rid === allyId || rid === Game.villagerId) continue;
      pos[rid] = { mx: smx + 50, my: smy + 50 };
    }
    // belt-and-suspenders: if a roster villager has no position entry, they
    // aren't in witnesses() anyway (it iterates positions).
  } catch (e) {}

  const bystanders = Game.witnesses(6) || [];
  check('no bystanders in range (test precondition)', bystanders.length === 0);

  // KILL with only a participant present -> a line (GREEN) / silence (RED)
  said.length = 0;
  Game.combatWitnessReact('kill');
  const killLine = said.find(m => WITNESS_FRAGS.some(fr => m.includes(fr)));
  check('kill moment: participant witness says a line', !!killLine);
  if (killLine) console.log('  kill line: ' + killLine.slice(0, 90));

  // HURT with only a participant present -> a line
  said.length = 0;
  Game.combatWitnessReact('hurt');
  const hurtLine = said.find(m => WITNESS_FRAGS.some(fr => m.includes(fr)));
  check('hurt moment: participant witness says a line', !!hurtLine);
  if (hurtLine) console.log('  hurt line: ' + hurtLine.slice(0, 90));

  // START with only a participant present -> silence (design: fighters don't "watch")
  said.length = 0;
  Game.combatWitnessReact('start');
  const startLine = said.find(m => WITNESS_FRAGS.some(fr => m.includes(fr)));
  check('start moment: participant does NOT watch their own fight (silent)', !startLine);

  // FLEE with only a participant present -> silence (bystander-only)
  said.length = 0;
  Game.combatWitnessReact('flee');
  const fleeLine = said.find(m => WITNESS_FRAGS.some(fr => m.includes(fr)));
  check('flee moment: stays bystander-only (silent)', !fleeLine);

  // Dead participants don't testify.
  f.fighters.find(x => x.key === 'vAlly').alive = false;
  said.length = 0;
  Game.combatWitnessReact('kill');
  const deadLine = said.find(m => WITNESS_FRAGS.some(fr => m.includes(fr)));
  check('dead participant says nothing', !deadLine);

  console.log(`\nwitness-participants: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
