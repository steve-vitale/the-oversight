'use strict';
const assert = require('assert/strict'), cp = require('child_process');
const K = require('./lib'), A = require('../gear-usage-audit');
const mode = process.argv[2] || 'normal';
async function run() {
  const G = await K.load({ seed: 7 }), T = K.reporter('NPC armor gear observer');
  function fresh() {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    const s = G.state.scholar, v = G.state.village;
    const id = v.roster.find(id => id !== G.villagerId && G.npcAge(id) >= 18);
    const p = G.getPerson(id), recipe = G.data.recipes.find(r => r.id === 'bark_armor');
    v.roster = [G.villagerId, id]; v.away = {}; v.followers = []; v.party = []; v.health = { [id]: 100 };
    v.pantry = [{ name: 'Prepared stores', units: 100, kcalEach: 500, spoilDay: 9999, safe: true }];
    v.water = { clean: 100 }; v.wood = 100; v.avCraft = { [id]: { bark_armor: 2 } }; v.avCraftCd = {};
    v.assignments = { [id]: { task: 'guard' } };
    p.items = ['bark_armor', 'stone_knife']; p.stashed = []; p.equipped = { torso: { itemId: 'bark_armor' } };
    G.npcSetNode(id, v.px ?? 4, v.py ?? 4);
    Object.assign(G.npcNeeds(id), { energy: 90, hunger: 0 });
    Object.assign(G.objOf(id), { kind: 'REST', purpose: 'rest', indoor: true, state: 'indoor', partsLeft: 9 });
    s.day = 85; s.health = 100; s.kcal = 6000; s.hydration = 100;
    G.stashState().materials = { ...recipe.materials };
    G.worldMonsters().length = 0; G.pendingEncounter = null;
    return { s, v, id, p, recipe };
  }
  const fixed = (value, fn) => { const r = Math.random; Math.random = () => value; try { return fn(); } finally { Math.random = r; } };
  let c = fresh();
  if (mode === 'neutral-on' || mode === 'neutral-off') {
    const observer = mode === 'neutral-on' ? A.install(G) : null;
    observer?.sample(); const first = G.villagerArmorCraftDay(), repeat = G.villagerArmorCraftDay(); observer?.sample();
    console.log('ARMOR_NEUTRAL ' + JSON.stringify({ first, repeat, state: A.gameplayHash(G.state), nextRandom: Math.random(), errors: observer?.errors || [] })); return;
  }
  if (mode === 'removed') delete A.METHODS.villagerArmorCraftDay;
  const o = A.install(G); o.sample();
  T.ok('starting worn and carried armor is not earned again', o.grants.length === 0);
  const hash = A.gameplayHash(G.state); o.sample();
  T.ok('passive sampling neither hydrates people nor changes state', A.gameplayHash(G.state) === hash && !o.grants.length);
  const start = o.grants.length, before = { ...G.stashState().materials };
  const made = fixed(.1, () => G.villagerArmorCraftDay()), grants = o.grants.slice(start);
  assert(grants.length === 1 && grants[0].source === 'craft', 'direct armor must have its own craft source');
  T.ok('actual direct craft grants exactly one own piece', made === 1 && grants[0].who === c.id && grants[0].id === 'bark_armor' && grants[0].n === 1 && grants[0].gear);
  T.ok('actual communal recipe cost and cooldown are paid', Object.entries(c.recipe.materials).every(([key, n]) => G.stashState().materials[key] === before[key] - n) && c.v.avCraftCd[c.id] === c.s.day);
  const after = o.grants.length;
  fixed(.1, () => G.villagerArmorCraftDay());
  T.ok('same-day refusal does not rediscover owned armor', o.grants.length === after);
  c = fresh(); const failedStart = o.grants.length;
  T.ok('actual failed paid sewing produces no gear acquisition', fixed(.99, () => G.villagerArmorCraftDay()) === 0 && o.grants.length === failedStart && Object.values(G.stashState().materials).every(n => n === 0));
  T.ok('armor attempts are not fabricated in the objective-only counter', !Object.hasOwn(o.npcCrafts, 'bark_armor'));
  c = fresh(); c.p.dead = true; const deadStart = o.grants.length;
  T.ok('dead resident receives no observed reward', fixed(.1, () => G.villagerArmorCraftDay()) === 0 && o.grants.length === deadStart);
  c = fresh(); const nestedStart = o.grants.length;
  c.s.dayTicks = G.TIME.TICKS_PER_DAY - 1; c.s.actionClock = 0; G.dayPart = 3;
  fixed(.1, () => G.doAction('wait'));
  const nested = o.grants.slice(nestedStart).filter(g => g.id === 'bark_armor');
  // endDay runs villagerBuildDay before its scholar.day increment. Keep the
  // actual closing-day cooldown rather than relabeling it as the next dawn.
  T.ok('real outer wait commits closing-day armor work before the new dawn', c.s.day === 86 && c.v.avCraftCd[c.id] === 85,
    JSON.stringify({ day: c.s.day, craftDay: c.v.avCraftCd[c.id] }));
  T.ok('nested actual item retains one craft source and recipient', nested.length === 1 && nested[0].source === 'craft' && nested[0].who === c.id && nested[0].n === 1);
  T.ok('observer has no acquisition errors', o.errors.length === 0);
  const result = T.done(); assert.equal(result.fail, 0);
  if (mode === 'normal') {
    const launch = mode => cp.spawnSync(process.execPath, [__filename, mode], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    const values = ['neutral-off', 'neutral-on'].map(mode => { const r = launch(mode); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout.split('\n').find(l => l.startsWith('ARMOR_NEUTRAL ')).slice(14)); });
    assert.deepEqual(values[0], values[1], 'actual rewards, next RNG and whole gameplay hash must remain unchanged');
    const removed = launch('removed'); assert.notEqual(removed.status, 0); assert.match(removed.stderr, /direct armor must have its own craft source/);
    console.log('NPC armor gear observer: full neutral return/state/RNG pair and actual removed-boundary rejection passed');
  }
}
run().catch(e => { console.error(e.stack); process.exitCode = 1; });
