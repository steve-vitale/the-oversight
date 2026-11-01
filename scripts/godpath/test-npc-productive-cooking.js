'use strict';
const assert = require('assert/strict'), fs = require('fs'), cp = require('child_process');
const K = require('./lib');
const mode = process.argv[2] || 'normal';
async function run() {
  const memory = new Map();
  globalThis.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k), key: i => [...memory.keys()][i] ?? null, get length() { return memory.size; } };
  const read = fs.readFileSync;
  if (mode === 'removed') fs.readFileSync = function (file, ...args) {
    let value = read.call(this, file, ...args);
    if (String(file).replace(/\\/g, '/').endsWith('/src/js/villager-objectives.js')) {
      const before = String(value), after = before.replace("this.resolveOneAssignment(rid, { task: 'cook', autonomous: true });", '/* removed real objective work */');
      assert.notEqual(after, before);
      value = typeof value === 'string' ? after : Buffer.from(after);
    }
    return value;
  };
  let G; try { G = await K.load({ seed: 7 }); } finally { fs.readFileSync = read; }
  const T = K.reporter('NPC productive cooking');
  function setup() {
    K.newRun(G); G.dayPart = 1;
    const v = G.state.village, s = G.state.scholar;
    const id = v.roster.find(id => id !== G.villagerId && G.getPerson(id) && !G.getPerson(id).dead);
    assert(id);
    v.assignments = {}; v.taskLeads = {}; v.away = {}; v.engaged = {}; v.workedPart = {};
    v.gardenKeeper = null; v.health = { [id]: 100 }; v.sheltered = {}; v.followers = []; v.party = [];
    G.npcSetNode(id, 4, 4);
    Object.assign(G.npcNeeds(id), { energy: 90, hunger: 20 });
    // Prepared surplus. It is neither a natural campaign nor free production.
    v.pantry = [{ name: 'Fish', kcalEach: 100, units: 200, foodKind: 'fish', foodState: 'raw', spoilDay: s.day + 1 }];
    for (const other of v.roster) if (other !== id) v.engaged[other] = 5;
    const objective = G.objOf(id);
    Object.assign(objective, { kind: 'HAVEN_CHORE', chore: 'cook', state: 'indoor', indoor: true, partsLeft: 1 });
    return { v, s, id, objective };
  }
  let ctx = setup();
  const state = JSON.stringify(G.state), random = Math.random;
  Math.random = () => { throw Error('availability must not draw randomness'); };
  let plan; try { plan = G.havenPreservationPlan(ctx.id); } finally { Math.random = random; }
  T.ok('availability is read only and budgets actual surplus', JSON.stringify(G.state) === state && plan.workKcal === 4000);
  const deedCalls = [], deed = G.creditDeed;
  G.creditDeed = function (id, key, ...args) { deedCalls.push({ id, key }); return deed.call(this, id, key, ...args); };
  const pack = JSON.stringify(ctx.s.inventory), beforeTicks = ctx.s.dayTicks;
  // Player is elsewhere: real production must not depend on seeing the line.
  G.map.px = 3; G.map.py = 3;
  G.objTick();
  const kept = ctx.v.pantry.filter(it => it.foodState === 'preserved');
  assert(kept.length, 'objective must preserve real food');
  const mult = plan.skill > 0 ? Math.min(1, .95 + .02 * plan.skill) : .8;
  T.ok('last objective part performs actual skill-priced preservation', kept.reduce((n, it) => n + it.units * it.kcalEach, 0) === 40 * Math.max(1, Math.round(100 * mult)));
  T.ok('dinner reserve and unprocessed surplus stay fresh', ctx.v.pantry.filter(it => it.foodState === 'raw').reduce((n, it) => n + it.units * it.kcalEach, 0) === 16000);
  T.ok('actual NPC receives cooking and preserving deeds', ['cooking', 'preserving'].every(key => deedCalls.some(d => d.id === ctx.id && d.key === key)));
  T.ok('autonomous work leaves player pack and action clock alone', JSON.stringify(ctx.s.inventory) === pack && ctx.s.dayTicks === beforeTicks);
  const pantry = JSON.stringify(ctx.v.pantry), gives = ctx.v.gives[ctx.id];
  G.resolveOneAssignment(ctx.id, { task: 'cook', autonomous: true });
  T.ok('repeat in same part does not duplicate food or contribution', JSON.stringify(ctx.v.pantry) === pantry && ctx.v.gives[ctx.id] === gives);
  G.dayPart++;
  T.ok('next part can consider remaining useful work', G.autonomousCookReady(ctx.id));
  for (const [name, modify] of [
    ['empty pantry', c => { c.v.pantry = []; }],
    ['dinner only', c => { c.v.pantry[0].units = 1; }],
    ['rotten food', c => { c.v.pantry[0].spoilDay = c.s.day - 1; }],
    ['bonded food', c => { c.v.pantry[0].bonded = true; }],
    ['full racks', c => { c.v.pantry.push({ name: 'Dried food', foodState: 'preserved', kcalEach: 1000000, units: 1, spoilDay: c.s.day + 10 }); }],
    ['away worker', c => { c.v.away[c.id] = { parts: 2 }; }],
    ['explicit order', c => { c.v.assignments[c.id] = { task: 'water' }; }],
    ['task lead', c => { c.v.taskLeads.wood = c.id; }],
    ['garden caretaker', c => { c.v.gardenKeeper = c.id; }],
    ['engaged worker', c => { c.v.engaged[c.id] = 2; }],
    ['sheltered worker', c => { c.v.sheltered[c.id] = true; }],
    ['following worker', c => { c.v.followers = [c.id]; }],
    ['injured worker', c => { c.v.health[c.id] = 20; }],
    ['exhausted worker', c => { G.npcNeeds(c.id).energy = 10; }],
    ['hungry worker', c => { G.npcNeeds(c.id).hunger = 80; }],
    ['offsite worker', c => { G.npcSetNode(c.id, 3, 3); }],
    ['dead worker', c => { G.getPerson(c.id).dead = true; }],
    ['current bearer', c => { c.id = G.villagerId; }],
  ]) {
    ctx = setup(); modify(ctx);
    const before = JSON.stringify(ctx.v.pantry), credits = JSON.stringify(ctx.v.gives), deeds = deedCalls.length;
    const result = G.resolveOneAssignment(ctx.id, { task: 'cook', autonomous: true });
    T.ok(name + ' earns no phantom work', result === false && JSON.stringify(ctx.v.pantry) === before && JSON.stringify(ctx.v.gives) === credits && deedCalls.length === deeds);
  }
  ctx = setup();
  G.resolveOneAssignment(ctx.id, { task: 'cook' });
  const assigned = JSON.stringify(ctx.v.pantry);
  G.objTick();
  T.ok('consumed explicit duty prevents a second autonomous shift', JSON.stringify(ctx.v.pantry) === assigned);
  for (const skilled of [false, true]) {
    ctx = setup();
    G.getPerson(ctx.id).formerOccupation = skilled ? 'chef' : 'truck driver';
    G.getPerson(G.villagerId).formerOccupation = skilled ? 'truck driver' : 'chef';
    const ownPlan = G.havenPreservationPlan(ctx.id);
    assert.equal(ownPlan.skill > 0, skilled);
    G.resolveOneAssignment(ctx.id, { task: 'cook', autonomous: true });
    const food = ctx.v.pantry.find(it => it.foodState === 'preserved');
    T.ok((skilled ? 'specialist' : 'novice') + ' uses own skill, never bearer skill', food && food.kcalEach === Math.round(100 * (skilled ? Math.min(1, .95 + .02 * ownPlan.skill) : .8)) && food.spoilDay === ctx.s.day + (skilled ? 30 + 5 * ownPlan.skill : 15));
  }
  ctx = setup();
  G.resolveOneAssignment(ctx.id, { task: 'cook', autonomous: true });
  const durable = JSON.stringify(ctx.v.pantry), part = ctx.v.workedPart[ctx.id], key = G.state.runKey;
  G.save(); assert(G.load(key));
  T.ok('Continue retains real food and same-part work record', JSON.stringify(G.state.village.pantry) === durable && G.state.village.workedPart[ctx.id] === part && !G.autonomousCookReady(ctx.id));
  T.done();
  if (mode === 'normal') {
    const r = cp.spawnSync(process.execPath, [__filename, 'control'], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
    assert.equal(r.status, 0, r.stderr);
    process.stdout.write(r.stdout);
  }
}
if (mode === 'control') {
  const r = cp.spawnSync(process.execPath, [__filename, 'removed'], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /objective must preserve real food/);
  console.log('NPC productive cooking: actual removed executor hook rejected');
} else run().catch(e => { console.error(e); process.exitCode = 1; });
