#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('field-market-beams');
(async () => {
  const G = await K.load({ seed: 7 }), GP = globalThis.Scattering.Godpath;
  let s, v, id;
  function fresh() {
    G.tbfight = null; G.over = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; s.day = 85;
    G.state.systemArrived = true;
    id = v.roster.find(x => x !== G.villagerId);
    v.npcAbilities = { [id]: [] }; v.npcSkills = { [id]: [] };
    v.npcGodhood = { [id]: { active: ['market_god'], recognized: { market_god: 85 } } };
    G.npcNeeds(id).hunger = 10; v.health = { [id]: 100 };
  }
  const spent = () => (v.npcGodhood[id].guardDepletion || []).reduce((a, b) => a + b, 0);
  function field(monsterId, rng = () => 0.1) {
    fresh();
    const calls = [], original = GP.fieldIncoming;
    GP.fieldIncoming = function (actor, total, context) {
      const before = spent(), result = original.apply(this, arguments);
      calls.push({ total, result, spent: spent() - before, attack: context.attack?.name, beam: context.beamDamage });
      return result;
    };
    try {
      const md = G.data.monsters.find(m => m.id === monsterId);
      const rec = G.fieldFight(id, md, { hp: 10000, maxHp: 10000 }, { noFlee: true, rng });
      return { rec, calls };
    } finally { GP.fieldIncoming = original; }
  }
  let r = field('review_drone'), hit = r.calls[0];
  T.ok('real field fight reaches the beam with its selected attack', !!hit && hit.attack === 'Scored Assessment' && hit.beam === hit.total, JSON.stringify(hit));
  T.ok('Gilded Guard does not stop that off-screen beam', hit && hit.result === hit.total && hit.spent === 0, JSON.stringify(hit));
  r = field('gallowdeer'); hit = r.calls[0];
  T.ok('mixed deer beam and antlers retain separate amounts', hit && hit.beam > 0 && hit.beam < hit.total, JSON.stringify(hit));
  T.ok('mixed hit coins stop only the antlers, leaving the beam', hit && hit.result === hit.beam && hit.spent === hit.total - hit.beam, JSON.stringify(hit));
  r = field('gallowdeer', () => 0.55); hit = r.calls[0];
  T.ok('a selected physical attack from a beam species remains physical', hit && hit.attack === 'Antler Sweep' && hit.beam === 0 && hit.result === 0 && hit.spent === hit.total, JSON.stringify(hit));
  r = field('hushwolf'); hit = r.calls[0];
  T.ok('ordinary physical field hits retain their coin protection', hit && hit.result === 0 && hit.spent === hit.total, JSON.stringify(hit));
  // The same actual tactical damage caller already enforces this weakness.
  fresh(); const md = K.fight(G, 'review_drone', { party: true });
  const ally = { key: 'v_market_beam', kind: 'villager', villagerId: id, name: 'Trader', hp: 100, maxHp: 100, mx: 3, my: 3, alive: true, fled: false };
  G.tbfight.fighters.push(ally); G.tbfight.order.push(ally.key);
  const before = ally.hp; G.tbDamage(ally.key, 20, 'beam', md.key, {});
  T.ok('actual tactical NPC beam also bypasses the same guard', ally.hp < before && spent() === 0);
  G.tbDamage(ally.key, 20, 'claws', md.key, {});
  T.ok('physical tactical damage still uses coins', spent() > 0);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
