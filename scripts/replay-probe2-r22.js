#!/usr/bin/env node
// Replay seed 80 days 1-3 with the probe2 setup, logging villager objectives
// at each dawn + the corpse state. Drives the REAL daily machinery.
'use strict';
const { loadGame, setupGame } = require('./sim-harness.js');
const { competent } = require('./policies/competent');

async function main() {
  const { Game } = await loadGame({ seed: 80 });
  await setupGame(Game);
  const person = (vid) => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } };
  const vname = (vid) => { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } };
  const gday = () => (Game.state.scholar && Game.state.scholar.day) || 0;

  // probe2 setup (same as the harness)
  const roster = (Game.state.village.roster || []).filter(id =>
    id !== Game.villagerId && !person(id).dead);
  const mdef = (Game.data.monsters || []).find(m => m.id === 'hummice');
  const node = { x: 5, y: 4 };
  const corpse = Game.registerDeath({
    kind: 'monster', monsterId: 'hummice', monsterName: mdef.name,
    name: Game.monsterDisplayName('hummice'), descriptor: Game.monsterDisplayName('hummice'),
    node, cause: 'villager combat (probe2)', killerId: roster[0], witnesses: roster.slice(0, 2),
  });
  for (const me of Game.monsterCarcassEntries(mdef)) corpse.items.push(me);
  for (const vid of roster) { try { Game.mapmemRemember(vid, corpse); } catch (e) {} }
  console.log(`probe2: corpse ${corpse.id} at (5,4), spoilDay=${corpse.items.map(i=>i.spoilDay)}`);

  const ctx = { policyId: 'competent-replay' };
  const logObjs = (label) => {
    console.log(`--- ${label} day ${gday()} objectives ---`);
    for (const vid of roster) {
      let o = null;
      try { o = Game.objOf(vid); } catch (e) {}
      if (o && o.kind && o.kind !== 'idle') {
        console.log(`  ${vname(vid)}: kind=${o.kind} state=${o.state} targetRef=${(o.targetRef||'').slice(0,20)} haulUnknown=${!!(o.haulUnknown&&o.haulUnknown.length)}`);
      }
    }
    const c = (Game.corpses ? Game.corpses() : []).find(x => x.id === corpse.id);
    const meat = (c.items || []).filter(it => it.foodKind === 'meat' && it.foodState === 'carcass');
    console.log(`  corpse items: ${c.items.length}, carcass units: ${meat.map(m=>m.units)}`);
    const pan = (Game.state.village.pantry || []).filter(it => /unknown flesh/i.test(it.name || ''));
    console.log(`  pantry unknown-flesh: ${pan.length}`);
  };

  const day0 = gday();
  for (let d = 0; d < 4 && !Game.over; d++) {
    logObjs('start');
    // drive one game day like the harness: upkeep + waits + sleep
    for (let p = 0; p < 3; p++) {
      try { competent.upkeep(Game, ctx); } catch (e) {}
      try { Game.doAction('wait'); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    try { competent.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) { console.log('sleep note: ' + (e && e.message)); }
    logObjs('end');
    if (gday() >= day0 + 4) break;
  }
  console.log('DONE');
}
main().catch(e => { console.error('REPLAY ERROR:', e && e.stack || e); process.exit(2); });
