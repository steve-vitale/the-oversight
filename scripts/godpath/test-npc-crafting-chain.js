'use strict';
// Prepared counterexamples. Natural campaigns are a separate required proof.
const assert = require('assert/strict'), fs = require('fs'), cp = require('child_process');
const K = require('./lib'), mode = process.argv[2] || 'normal';
async function run() {
  const memory = new Map();
  globalThis.localStorage = { get length() { return memory.size; }, key: i => [...memory.keys()][i] ?? null,
    getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
  const read = fs.readFileSync;
  if (mode === 'removed' || mode === 'removed-forage') fs.readFileSync = function (file, ...args) {
    let text = read.call(this, file, ...args);
    if (String(file).replace(/\\/g, '/').endsWith('/src/js/villager-objectives.js')) {
      const before = String(text), after = mode === 'removed'
        ? before.replace('const work = this.npcWorkGear(rid);', 'const work = { paid: false };')
        : before.replace('this.npcForageCraftMaterial(rid, nx, ny);', '/* actual procurement dispatch removed */');
      assert.notEqual(before, after, 'must remove actual objective executor');
      text = typeof text === 'string' ? after : Buffer.from(after);
    }
    return text;
  };
  let G; try { G = await K.load({ seed: 7 }); } finally { fs.readFileSync = read; }
  if (mode === 'recover') {
    const saved = JSON.parse(fs.readFileSync(0, 'utf8'));
    for (const [key, value] of Object.entries(saved.disk)) memory.set(key, value);
    const raw = memory.get(saved.key); assert(G.load(saved.key)); assert.equal(memory.get(saved.key), raw);
    const person = G.getPerson(saved.id);
    assert.deepEqual(person.items, saved.items); assert.deepEqual(person.equipped, saved.equipped);
    assert.equal(G.state.village.workedPart[saved.id], saved.part);
    assert.equal(G.npcGearPlan(saved.id), null); return;
  }
  const audit = require('../gear-usage-audit');
  const observer = mode === 'observed' ? audit.install(G) : null;
  const T = K.reporter('NPC crafting chain');
  function setup() {
    K.newRun(G); G.dayPart = 1;
    const v = G.state.village, s = G.state.scholar;
    const id = v.roster.find(id => id !== G.villagerId && G.npcAge(id) >= 15 && !G.getPerson(id).dead);
    assert(id);
    v.assignments = {}; v.taskLeads = {}; v.away = {}; v.engaged = {}; v.workedPart = {};
    v.gardenKeeper = null; v.health = { [id]: 100 }; v.sheltered = {}; v.followers = []; v.party = [];
    G.npcSetNode(id, v.px ?? 4, v.py ?? 4);
    Object.assign(G.npcNeeds(id), { energy: 90, hunger: 20 });
    const p = G.getPerson(id); p.items = []; p.equipped = {}; p.stashed = [];
    G.stashState().materials = {}; G.stashState().weapons = [];
    for (const other of v.roster) if (other !== id) v.engaged[other] = 5;
    return { id, v, s, p };
  }
  let c = setup();
  const materials = [{ material: 'stone', units: 1 }, { material: 'vine', units: 1 }];
  const before = JSON.stringify(materials), random = Math.random;
  Math.random = () => { throw Error('planning must not draw randomness'); };
  let plan; try { plan = G.planRecipeCraft('stone_knife', materials, 3); } finally { Math.random = random; }
  T.ok('recipe planner is read only and knows exact costs', plan.ready && JSON.stringify(materials) === before && plan.materials.every(m => m.need === 1));
  for (const units of [0, -1, NaN, Infinity, 0.5, undefined]) {
    const p = G.planRecipeCraft('stone_knife', [{ material: 'stone', units }, { material: 'vine', units: 1 }], 3);
    T.ok('invalid material quantity is never spendable: ' + units, !p.ready);
  }
  T.ok('unlearned recipe cannot be executed', !G.attemptRecipeCraft(G.planRecipeCraft('stone_knife', materials, 0), 1, () => { throw Error('no roll'); }).paid);
  materials[0].units = 0;
  T.ok('executor revalidates a stale plan without spending', !G.attemptRecipeCraft(plan, 1, () => { throw Error('no roll'); }).paid && materials[1].units === 1);
  const rows = [{ material: 'stone', units: 1 }, { material: 'vine', units: 1 }, 'keepsake'];
  const made = G.attemptRecipeCraft(G.planRecipeCraft('stone_knife', rows, 3), .85, () => .2);
  T.ok('shared recipe creates the real item and preserves string gear', made.ok && made.product.itemId === 'stone_knife' && made.inventory.length === 1 && made.inventory[0] === 'keepsake');
  T.ok('unarmed resident recognizes missing vine rather than free crafting', G.npcGearPlan(c.id)?.action === 'forage' && !G.npcWorkGear(c.id).paid);
  // Use an actual generated bush; only the actor/body/objective are prepared.
  let site;
  for (let ny = 0; ny < 9 && !site; ny++) for (let nx = 0; nx < 9 && !site; nx++) {
    const tile = G.tileAt(nx, ny);
    if (!globalThis.Scattering.forage.canForage(tile)) continue;
    const grid = G.genDetail(nx, ny);
    for (let y = 0; y < 9 && !site; y++) for (let x = 0; x < 9; x++)
      if (grid[y]?.[x] === 'bush' && !tile.detailRegrow?.[x + ',' + y]) { site = { nx, ny, tile }; break; }
  }
  assert(site, 'actual generated bush is required');
  const o = G.objOf(c.id);
  Object.assign(o, { kind: 'FORAGE', purpose: 'forage', state: 'ready', tx: site.nx, ty: site.ny, partsLeft: 3, craftMaterial: 'vine' });
  const playerPack = JSON.stringify(c.s.inventory), ticks = c.s.dayTicks;
  assert(G.objDepart(c.id, o, c.v.px ?? 4, c.v.py ?? 4, false) !== false);
  const energy = G.npcNeeds(c.id).energy, hunger = G.npcNeeds(c.id).hunger;
  o.tightened = true;
  const harvest = G.npcForageCraftMaterial;
  G.npcForageCraftMaterial = function (id, nx, ny) { return harvest.call(this, id, nx, ny, () => 0); };
  G.objAwayStep(c.id, G.npcNode(c.id), c.v.away[c.id], c.v.px ?? 4, c.v.py ?? 4);
  G.npcForageCraftMaterial = harvest;
  assert(c.p.items.some(i => i.material === 'vine'), 'real visited patch must supply own vine');
  T.ok('real visit harvests a real patch into the worker own pack', c.p.items.some(i => i.material === 'vine' && i.units === 1) && o.materialSource.found === 1 && site.tile.detailRegrow[o.materialSource.x + ',' + o.materialSource.y].was === 'bush');
  T.ok('actual travel and harvest pay own exertion without repeated work', G.npcNeeds(c.id).energy === energy - 7 && G.npcNeeds(c.id).hunger === hunger + 6 && !G.npcForageCraftMaterial(c.id, site.nx, site.ny, () => 0));
  // Return to the work site after the real procurement; no material injection.
  delete c.v.away[c.id]; G.npcSetNode(c.id, c.v.px ?? 4, c.v.py ?? 4); G.dayPart++;
  T.ok('next missing prerequisite chooses actual stone duty', G.npcGearPlan(c.id)?.action === 'stone' && G.npcWorkGear(c.id).paid && G.stashState().materials.stone > 0);
  T.ok('stone duty prevents a second shift in the same part', G.npcGearPlan(c.id) === null);
  G.dayPart++;
  const stone = G.stashState().materials.stone;
  Object.assign(o, { kind: 'HAVEN_CHORE', chore: 'gear', state: 'indoor', indoor: true, partsLeft: 1 });
  // Exercise the actual objective hook, with a deterministic successful roll.
  const attempt = G.attemptRecipeCraft;
  G.attemptRecipeCraft = function (p, chance) { return attempt.call(this, p, chance, () => 0); };
  G.objTick(); G.attemptRecipeCraft = attempt;
  assert(c.p.items.some(i => i.itemId === 'stone_knife'), 'objective must craft a real knife');
  T.ok('last objective part crafts and equips the own knife', c.p.equipped.melee?.itemId === 'stone_knife' || c.p.equipped.melee === 'stone_knife');
  T.ok('craft consumes real gathered vine and communal stone', !c.p.items.some(i => i.material === 'vine') && G.stashState().materials.stone === stone - 1);
  T.ok('NPC work never borrows bearer inventory or action clock', JSON.stringify(c.s.inventory) === playerPack && c.s.dayTicks === ticks);
  assert.equal(G.save(), true);
  const cold = cp.spawnSync(process.execPath, [__filename, 'recover'], { input: JSON.stringify({ disk: Object.fromEntries(memory), key: G.state.runKey,
    id: c.id, items: c.p.items, equipped: c.p.equipped, part: c.v.workedPart[c.id] }), encoding: 'utf8', windowsHide: true, timeout: 60000 });
  T.ok('fresh-process Continue retains the actual NPC knife and spent work part', cold.status === 0, cold.stderr);
  G.dayPart++;
  T.ok('adequate owned weapon ends the crafting need', G.npcGearPlan(c.id) === null);
  c = setup(); c.p.stashed = [{ material: 'vine', units: 2 }]; G.stashState().materials.stone = 1;
  const failed = G.npcWorkGear(c.id, () => 1);
  T.ok('failed craft spends actual own stashed vine and stone, no gear', failed.paid && !failed.made && c.p.stashed[0].units === 1 && !c.p.items.length && G.stashState().materials.stone === 0);
  T.ok('failure also consumes the work part', !G.npcWorkGear(c.id, () => 0).paid);
  for (const own of [false, true]) {
    c = setup(); c.p.items = [{ material: 'vine', units: 1 }]; G.stashState().materials.stone = 1;
    c.v.npcAbilities = { [c.id]: own ? ['steady_hands'] : [] };
    c.v.npcAbilityPractice = { [c.id]: { steady_hands: { level: 1 } } };
    c.s.abilities = own ? [] : [{ id: 'steady_hands', level: 1 }];
    c.s.backgroundAbilities = [];
    const result = G.npcWorkGear(c.id, () => .99);
    T.ok((own ? 'own' : 'bearer only') + ' Steady Hands has honest crafting effect', result.made === own);
  }
  for (const [label, change] of [
    ['exhausted', c => { G.npcNeeds(c.id).energy = 0; }],
    ['hungry', c => { G.npcNeeds(c.id).hunger = 90; }],
    ['injured', c => { c.v.health[c.id] = 10; }],
    ['dead', c => { c.p.dead = true; }],
    ['assigned', c => { c.v.assignments[c.id] = { task: 'water' }; }],
    ['away', c => { c.v.away[c.id] = { purpose: 'forage' }; }],
    ['sheltered', c => { c.v.sheltered[c.id] = true; }],
    ['already armed', c => { c.p.items = ['stone_knife']; }],
  ]) {
    c = setup(); c.p.items = [{ material: 'vine', units: 1 }]; G.stashState().materials.stone = 1;
    change(c); const pack = JSON.stringify(c.p.items), pile = JSON.stringify(G.stashState().materials);
    T.ok(label + ' does not spend or earn phantom gear', !G.npcWorkGear(c.id, () => 0).paid && JSON.stringify(c.p.items) === pack && JSON.stringify(G.stashState().materials) === pile);
  }
  c = setup(); G.npcNeeds(c.id).energy = 0;
  T.ok('zero energy is a real rest need', G.objPick(c.id, 4, 4).kind === 'REST');
  const result = T.done(); assert.equal(result.fail, 0);
  const hash = audit.gameplayHash(G.state);
  if (observer) console.log('CRAFT_OBSERVER ' + JSON.stringify({ hash, crafts: observer.npcCrafts,
    grants: observer.grants.filter(g => g.source === 'craft'), errors: observer.errors }));
  if (mode === 'normal') {
    const observed = cp.spawnSync(process.execPath, [__filename, 'observed'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(observed.status, 0, observed.stderr);
    const proof = JSON.parse(observed.stdout.split('\n').find(l => l.startsWith('CRAFT_OBSERVER ')).slice(15));
    assert.equal(proof.hash, hash, 'observer must preserve the actual full gameplay state');
    assert.equal(proof.grants.length, 2); assert(proof.grants.every(g => g.id === 'stone_knife' && g.who !== 'player' && g.n === 1));
    assert.equal(proof.crafts.stone_knife.attempts, 4); assert.equal(proof.crafts.stone_knife.successes, 2);
    assert.deepEqual(proof.errors, []);
    console.log('NPC crafting chain: real observer records actual own knives, paid failures and unchanged gameplay hash');
    const control = cp.spawnSync(process.execPath, [__filename, 'removed'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.notEqual(control.status, 0); assert.match(control.stderr, /objective must craft a real knife/);
    console.log('NPC crafting chain: actual removed objective executor rejected');
    const forageControl = cp.spawnSync(process.execPath, [__filename, 'removed-forage'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.notEqual(forageControl.status, 0); assert.match(forageControl.stderr, /real visited patch must supply own vine/);
    console.log('NPC crafting chain: actual removed travel procurement rejected');
  }
}
run().catch(e => { console.error(e.stack); process.exitCode = 1; });
