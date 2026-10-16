#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('sealed-learning');
(async () => {
  const G = await K.load({ seed: 2 }); let s, v, id;
  function fresh() {
    G.tbfight = null; G.over = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; s.day = 85; G.state.systemArrived = true;
    id = v.roster.find(x => x !== G.villagerId);
    v.health = { [id]: 100 }; G.npcNeeds(id).hunger = 10;
    v.npcAbilities = { [id]: [] }; v.npcSkills = { [id]: [] }; v.npcGodhood = {};
    const p = G.vpOf(id); p.items = []; p.equipment = {};
  }
  const drone = () => G.data.monsters.find(m => m.id === 'review_drone');
  fresh(); let r = G.fieldFight(id, drone(), { hp: 10000, maxHp: 10000 }, { noFlee: true, rng: () => 0.1 });
  T.ok('an unprepared learner cannot withdraw from a sealed fight after three rounds', !r.fleeLearn && !(r.outcome === 'vFlee' && !r.judges), JSON.stringify({ outcome: r.outcome, rounds: r.rounds, fleeLearn: r.fleeLearn }));
  T.ok('the sealed fight reaches actual death or a round-cap ruling', r.outcome === 'vDie' || r.judges === true);
  fresh(); r = G.fieldFight(id, drone(), { hp: 10000, maxHp: 10000 }, { rng: () => 0.1 });
  T.ok('ordinary wild learning withdrawals remain possible and nonfatal', r.outcome === 'vFlee' && r.vHpLeft > 0 && r.rounds < 15 && r.fleeLearn);
  fresh();
  const slow = { ...drone(), id: 'sealed-jury-fixture', hp: [10000, 10000], attacks: [], attack: { ...drone().attack, damage: [1, 1], pattern: { type: 'single' } } };
  r = G.fieldFight(id, slow, { hp: 10000, maxHp: 10000 }, { noFlee: true, rng: () => 0.1 });
  T.ok('a low-damage sealed fixture reaches all fifteen rounds', r.rounds === 15);
  T.ok('judges can still award the beast an honest nonfatal loss', r.outcome === 'vFlee' && r.judges && r.vHpLeft > 0 && !r.fleeLearn);
  // Pin only the offered beast. Public contest dispatch, seeded combat,
  // field resolution and actual health settlement all remain production code.
  const pick = G.contestBeastFor, fight = G.fieldFight;
  const records = [], outcomes = [];
  G.contestBeastFor = () => drone();
  G.fieldFight = function (who, md, entity, opts) {
    const result = fight.apply(this, arguments);
    records.push({ who, noFlee: opts.noFlee, result }); return result;
  };
  try {
    for (const contestId of ['pit', 'gauntlet', 'siege']) {
      fresh(); const result = G.contestResolveVillager(id, { id: contestId, cat: 'blood', risk: 'high', name: 'Prepared closed arena' });
      outcomes.push(result);
      T.ok(contestId + ' settles actual fight health through the public contest caller', v.health[id] < 100 && records.at(-1).result.healthSettlement.applied === true);
    }
  } finally { G.contestBeastFor = pick; G.fieldFight = fight; }
  T.ok('all three actual contest variants request a sealed arena', records.length >= 3 && records.every(x => x.noFlee === true));
  T.ok('none of the real contest fights returns an unjudged learning escape', records.every(x => !x.result.fleeLearn && !(x.result.outcome === 'vFlee' && !x.result.judges)));
  T.ok('the real contest reports deaths or judged losses rather than invented victories', outcomes.every(x => x.outcome === 'died' || x.outcome === 'lost'));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
