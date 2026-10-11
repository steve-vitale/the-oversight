#!/usr/bin/env node
// test-double-death-guard-20261011.js — PROOF for the journey-social blank:
// Vikram "died" twice on day 104 (fallen: 'monster' + 'sickness') — two
// systems both processed one death (field-fight kill via hurtVillager, then
// a disease tick via hurtVillager), doubling the fallen entry, corpse,
// death tele, grief and gossip.
// Fix (three guards):
//   1. hurtVillager: health already <= 0 -> return before the death block.
//   2. registerDeath (the documented choke point): v.deathSeen set -> null.
//   3. tbVillagerFalls: vid not on roster -> return (already processed).
// Usage: node scripts/test-double-death-guard-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'test-double-death' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const vid = vids[0], vid2 = vids[1];
  const nm = (v) => { try { return Game.displayName(v); } catch (e) { return v; } };
  console.log('victim:', nm(vid), '| second:', nm(vid2));

  const fallenFor = (v) => (Game.state.village.fallen || []).filter(f => f.villagerId === v).length;
  const corpsesFor = (v) => (Game.corpses() || []).filter(c => c.villagerId === v).length;
  const deathTelesFor = (v) => (Game.state.telemetry || []).filter(e => e.type === 'death' && e.who === v).length;

  console.log('T1: hurtVillager lethal twice (monster, then sickness)');
  try { Game.state.village.health[vid] = 20; } catch (e) {}
  Game.hurtVillager(vid, 999, 'monster');
  const f1 = fallenFor(vid), c1 = corpsesFor(vid), t1 = deathTelesFor(vid);
  console.log('   after monster kill: fallen=' + f1, 'corpses=' + c1, 'teles=' + t1);
  ok(f1 === 1 && c1 === 1, 'first death recorded exactly once', `f=${f1} c=${c1}`);
  Game.hurtVillager(vid, 999, 'sickness');
  const f2 = fallenFor(vid), c2 = corpsesFor(vid), t2 = deathTelesFor(vid);
  console.log('   after sickness tick: fallen=' + f2, 'corpses=' + c2, 'teles=' + t2);
  ok(f2 === 1, 'no second fallen entry', f2);
  ok(c2 === 1, 'no second corpse', c2);
  ok(t2 === t1, 'no second death tele', t2 + ' vs ' + t1);

  console.log('T2: registerDeath twice directly');
  const r1 = Game.registerDeath({ kind: 'villager', villagerId: vid2, name: nm(vid2), cause: 'combat' });
  ok(r1 !== null, 'first registration returns the corpse');
  const r2 = Game.registerDeath({ kind: 'villager', villagerId: vid2, name: nm(vid2), cause: 'sickness' });
  ok(r2 === null, 'second registration is a no-op (null)');
  ok(corpsesFor(vid2) === 1, 'exactly one corpse for vid2', corpsesFor(vid2));

  console.log('T3: tbVillagerFalls after roster removal');
  const before = fallenFor(vid);
  Game.tbVillagerFalls({ villagerId: vid });
  ok(fallenFor(vid) === before, 'no fallen entry when already off roster', fallenFor(vid) + ' vs ' + before);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
