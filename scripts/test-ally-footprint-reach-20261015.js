#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('ally-footprint-reach');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const C = globalThis.Scattering.combat, open = () => false;
  const a = { key: 'a', kind: 'ally', name: 'Volunteer', mx: 8, my: 5, hp: 100, maxHp: 100, speed: 1, ai: 'brave', alive: true, wbonus: 60 };
  const m = { key: 'm', kind: 'monster', name: 'Large foe', mx: 6, my: 3, size: 2, alive: true, hp: 1000, maxHp: 1000, mdef: G.data.monsters.find(m => m.id === 'spoiler') };
  T.ok('nearest enemy distance includes the visible far corner', C.nearestEnemy([a, m], a).d === 1);
  T.ok('NPC distance agrees with player whole-body reach', !!C.distanceToBody && C.distanceToBody(a.mx, a.my, m) === G.fighterDistTo(m, a.mx, a.my));
  const decide = (actor = a, foes = [m], prefer = null) => C.villagerDecide(actor, [actor, ...foes], open, new Set(), prefer, 11);
  T.ok('brave ally uses melee beside large body instead of throwing a rock', decide().action.type === 'strike' && decide().moves.length === 0);
  T.ok('rally focus preserves whole-body reach', decide(a, [m], m.key).action.type === 'strike');
  T.ok('helpful ally can strike at the same visible body edge', decide({ ...a, ai: 'helpful' }).action.type === 'strike');
  const approach = decide({ ...a, mx: 9, my: 6 });
  T.ok('ally closes to large body within its real movement budget', approach.moves.length === 1 && approach.action.type === 'strike');
  const small = { ...m, key: 'small', mx: 5, my: 5, size: 1, mdef: { size: 1 } };
  T.ok('nearest selection compares bodies rather than favoring closer anchors', C.nearestEnemy([a, small, m], a).f === m);
  const one = { ...a, mx: 4, my: 4 }, target = { ...small, mx: 5, my: 4 };
  T.ok('single-cell adjacent behavior remains melee', decide(one, [target]).action.type === 'strike' && decide(one, [target]).moves.length === 0);
  const patient = { key: 'p', kind: 'player', mx: 6, my: 3, size: 2, hp: 40, maxHp: 100, alive: true };
  T.ok('helper can touch the edge of a large allied patient', decide({ ...a, ai: 'helpful' }, [patient]).action.type === 'help');
  const fallback = decide({ ...a, ai: 'cautious', hp: 20 });
  T.ok('cautious ally retreats without exceeding speed', fallback.action.type === 'flee' && fallback.moves.length <= 1);
  // A prepared outer-cell arena exercises the actual villager-turn caller.
  a.mx = 10; a.my = 10; m.mx = 8; m.my = 8;
  G.tbfight = { gridSize: 12, fighters: [a, m], round: 1, order: ['a', 'm'], zones: [] };
  let raw = 0; const damage = G.tbDamage;
  G.tbDamage = function(key, n) { if (key === m.key) raw = n; return damage.apply(this, arguments); };
  G.tbVillagerTurn(a);
  T.ok('real allied turn uses its donated weapon at outer footprint edge', raw >= 30 && m.hp < 1000);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
