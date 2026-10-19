'use strict';
const K = require('./lib'), T = K.reporter('field-health-outcome');
(async () => {
  const storage = new Map();
  globalThis.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v)), removeItem: k => storage.delete(k), key: i => [...storage.keys()][i] ?? null, get length() { return storage.size; } };
  const G = await K.load({ seed: Number(process.env.SEED || 7) });
  let s, v, id;
  function fresh(health = 5, abilities = ['second_wind']) {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village;
    id = v.roster.find(x => x !== G.villagerId && G.npcAge(x) >= 18);
    s.day = 85; G.state.systemArrived = true; v.party = [];
    v.npcAbilities = { [id]: abilities }; v.health = { [id]: health };
    G.npcNeeds(id).hunger = 0;
    const p = G.getPerson(id); p.items = []; p.equipped = {}; p.backgroundAbilities = [];
  }
  function refusal() {
    const def = { ...G.data.monsters.find(x => x.id === 'hushwolf'), pack: 1, hp: [1,1], speed: 99, attack: { damage: [500,500], accuracy: 1 } };
    return G.fieldFight(id, def, null, { intent: 'fight', rng: () => 0.5 });
  }
  const warnings = [], warn = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); };
  try {
    fresh(); let rec = refusal();
    T.ok('real field engine leaves a living Second Wind escape despite gross lethal damage', rec.outcome === 'vFlee' && rec.vHpLeft === 1 && rec.vTaken > 5 && /Second Wind/.test(rec.log.join(' ')));
    const gross = rec.vTaken, left = rec.vHpLeft;
    rec.vHpLeft = 10000; rec.health = { start: 5, end: 10000 };
    G.hurtVillager(id, gross, 'monster', rec);
    T.ok('settlement preserves the real survivor and ignores tampered public health', v.roster.includes(id) && !G.getPerson(id).dead && v.health[id] === left && !v.fallen?.some(x => x.villagerId === id));
    G.hurtVillager(id, gross, 'monster', rec);
    T.ok('the real field outcome can be applied only once', v.health[id] === left);

    fresh(40, ['field_medicine']);
    const harmless = { id: 'prepared_health_probe', hp: [10000,10000], pack: 1, speed: 0, attack: { damage: [0,0], accuracy: 1 }, behavior: 'territorial' };
    rec = G.fieldFight(id, harmless, null, { intent: 'fight', rng: () => 0.5 });
    T.ok('real field medicine heals a wounded body even without incoming damage', rec.vTaken === 0 && rec.vHpLeft === 60 && /field medicine/.test(rec.log.join(' ')));
    G.hurtVillager(id, rec.vTaken, 'monster', rec);
    T.ok('actual field healing reaches the world health pool', v.health[id] === rec.vHpLeft && v.roster.includes(id));
    fresh(40, ['field_medicine']);
    const monsters = G.data.monsters;
    const shawl = G.data.items.find(x => x.id === 'phase_shawl'), chance = shawl.damageAvoidChance;
    try {
      G.data.monsters = [{ ...harmless, wave: 1, attack: { damage: [1,1] } }];
      // Prepared certainty removes random avoidance from this caller test;
      // the actual worn-gear and field engines still resolve every hit.
      shawl.damageAvoidChance = 1;
      G.getPerson(id).items = ['phase_shawl'];
      G.getPerson(id).equipped = { acc1: { itemId: 'phase_shawl' } };
      const contest = G.contestResolveVillager(id, { id: 'pit', cat: 'blood', wave: 1, risk: 'high' }, {});
      T.ok('actual pit caller preserves a healing-only field outcome', v.health[id] === 60 && contest.log.some(x => /rounds, 0 taken/.test(x)), JSON.stringify(contest));
    } finally { G.data.monsters = monsters; shawl.damageAvoidChance = chance; }

    fresh(); rec = refusal();
    T.ok('wrong person cannot consume a living field outcome', G.hurtVillager(G.villagerId,rec.vTaken,'wrong person',rec) === false && s.health === 100);
    T.ok('wrong amount cannot consume it', G.hurtVillager(id,rec.vTaken+1,'wrong amount',rec) === false && v.health[id] === 5);
    T.ok('a serialized copy cannot forge it', G.hurtVillager(id,rec.vTaken,'copied receipt',JSON.parse(JSON.stringify(rec))) === false && v.health[id] === 5);
    G.hurtVillager(id,rec.vTaken,'monster',rec);
    T.ok('failed mismatches leave the original outcome available', v.health[id] === 1);

    fresh(); rec = refusal(); v.health[id] = 4;
    T.ok('stale starting health cannot overwrite a later wound', G.hurtVillager(id,rec.vTaken,'stale health',rec) === false && v.health[id] === 4);
    fresh(); rec = refusal(); G.save(); const key = G.state.runKey; G.load(key); s = G.state.scholar; v = G.state.village;
    T.ok('Continue invalidates a prior state field outcome', G.hurtVillager(id,rec.vTaken,'old state',rec) === false && v.health[id] === 5);

    fresh(100, []); rec = G.fieldFight(id, { ...harmless, attack: { damage: [2,2] } }, null, { intent: 'fight', rng: () => 0.5 });
    T.ok('ordinary field damage still has an honest final health', rec.vTaken > 0 && rec.vHpLeft === Math.max(0,100-rec.vTaken));
    G.hurtVillager(id,rec.vTaken,'monster',rec);
    T.ok('ordinary field damage settles once without healing', v.health[id] === rec.vHpLeft);
    fresh(100, []); const ordinary = G.sealDamageResult({}, [[id,10]]);
    G.hurtVillager(id,10,'ordinary resolved damage',ordinary);
    T.ok('non-field damage receipts retain subtraction semantics', v.health[id] === 90);
    fresh(5, []); rec = refusal(); G.hurtVillager(id,rec.vTaken,'monster',rec);
    T.ok('a genuinely lethal field outcome still records death', rec.vHpLeft === 0 && !v.roster.includes(id) && G.getPerson(id).dead && v.fallen.some(x => x.villagerId === id));
    T.ok('only deliberate stale or forged settlements warned', warnings.length === 6 && warnings.every(x => x.includes('stale or mismatched damage settlement')), JSON.stringify(warnings));
  } finally { console.warn = warn; }
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
