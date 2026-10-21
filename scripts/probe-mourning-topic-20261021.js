#!/usr/bin/env node
// probe-mourning-topic-20261021.js — unit probe for journey-crisis r37:
// after a person death, does t2LatelyEvent (the 'ask:lately' topic home)
// return a mourning ev naming the dead? Isolates the engine from driver
// choice architecture.
// Usage: node scripts/probe-mourning-topic-20261021.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

async function main() {
  Math.random = mulberry32(777);
  const { Game } = await loadGame({ seed: 777, mode: 'mourning-probe', fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 6 });

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const victim = roster[0];
  const witness = roster[1];
  const vname = (() => { try { return Game.displayName(victim); } catch (e) { return victim; } })();
  console.log('victim:', vname, 'witness:', witness);

  // kill via the real pipeline
  try {
    Game.registerDeath({ kind: 'villager', villagerId: victim, cause: 'monster' });
  } catch (e) { console.log('registerDeath threw:', e.message); }
  console.log('grief after death:', (Game.state.village || {}).grief);

  // corpses?
  let corpses = [];
  try { corpses = Game.corpses ? Game.corpses() : (Game.state.corpses || []); } catch (e) {}
  const isP = (c) => { try { return Game.corpseIsPerson(c); } catch (e) { return c && (c.kind === 'person' || c.kind === 'villager'); } };
  console.log('person corpses:', corpses.filter(isP).map(c => ({ name: c.name, dayDied: c.dayDied, vid: String(c.villagerId || '').slice(0, 12) })));

  // the topic ev
  let ev = null;
  try { ev = Game.t2LatelyEvent(witness); } catch (e) { console.log('t2LatelyEvent threw:', e.message); }
  console.log('t2LatelyEvent kind:', ev && ev.kind, 'name:', ev && ev.name, 'names:', ev && ev.names);

  // render the lines the topic would say
  // (case 'mourning' lives in the topic-line builder; call it if exposed)
  console.log('grief still:', (Game.state.village || {}).grief);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
