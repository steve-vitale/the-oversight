#!/usr/bin/env node
'use strict';
// Prepared meal paths + independent shared-harness observer A/B proof.
// Each child loads exactly one world. No gameplay methods are stubbed.
const assert = require('assert');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');
const seed = Number(process.env.SEED || 42);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const realPaths = new Set(['voluntary-fast', 'self-fed', 'pantry-fresh',
  'desperation-spoiled', 'away-pack', 'away-pack-empty']);
let pass = 0;
function check(name, condition) { assert(condition, name); pass++; console.log('  ok ' + name); }
function child(kind, extra = {}) {
  const stdout = execFileSync(process.execPath, [__filename], {
    env: { ...process.env, CENSUS_CHILD: kind, ...extra }, encoding: 'utf8', maxBuffer: 8e6,
  });
  const marker = stdout.split('\n').find(line => line.startsWith('CENSUS_RESULT '));
  assert(marker, 'child returned a result: ' + kind);
  process.stdout.write(stdout.split('\n').filter(line => !line.startsWith('CENSUS_RESULT ')).join('\n'));
  return JSON.parse(marker.slice('CENSUS_RESULT '.length));
}
async function fixture(trust) {
  const { Game, loadFails } = await loadGame({ seed, mode: 'sharcensus-proof' });
  assert.equal(loadFails.length, 0, 'no module load failures');
  await setupGame(Game);
  const v = Game.state.village;
  const npcs = v.roster.filter(id => id !== Game.villagerId);
  assert(npcs.length >= 5, 'fixture needs five NPCs');
  const [exiledVid, awayVid, emptyVid, producerVid, homeVid] = npcs;
  v.trust ||= {}; v.health ||= {}; v.away ||= {}; v.severed ||= {};
  for (const id of npcs) { v.trust[id] = trust; Game.npcNeeds(id).hunger = 95; }
  Game.stockPantry(60000, 'Dried meat', { foodState: 'preserved' });
  v.severed[exiledVid] = true;
  // Actual identity/health inputs guarantee a shortage, rather than assuming
  // that away=true prevents self-feeding. Both packs contain real pantry food.
  for (const id of [awayVid, emptyVid, homeVid]) {
    const p = Game.getPerson(id);
    p.formerOccupation = 'programmer'; p.age = 75; p.mentorBonus = 0;
    v.health[id] = 1;
  }
  for (const id of [awayVid, emptyVid]) {
    v.away[id] = true;
    const packed = Game.packKcal(id);
    assert(packed > 100, 'actual ration was packed');
    Game.packSpend(id, packed - (id === awayVid ? 100 : 0));
  }
  // A prepared knowledgeable farmer guarantees genuine surplus in both trust
  // arms. This changes fixture inputs, never the production or meal function.
  const producer = Game.getPerson(producerVid);
  producer.formerOccupation = 'farmer'; producer.age = 35; producer.mentorBonus = 0;
  producer.personality = { ...producer.personality, temperament: 'steady' };
  v.health[producerVid] = 100;
  v.taught ||= {}; v.taught[producerVid] = Game.data.plants.slice(0, 8).map(p => p.id);
  assert(Game.villagerExpectedDaily(producer, producerVid, v) * 0.9 > (producer.kcalPerDay || 2000),
    'farmer produces a surplus even on minimum steady grit');
  return { Game, exiledVid, awayVid, emptyVid, producerVid, homeVid };
}
async function meal(armed, trust = 5) {
  const f = await fixture(trust), { Game } = f;
  const seen = [], original = Game.villagerMealDay;
  Game.villagerMealDay = function (vid) {
    const result = original.apply(this, arguments);
    seen.push({ vid: String(vid), result }); return result;
  };
  const methods = ['villageEats', 'villagerMealDay', 'pantryDraw', 'drawSpoiled', 'packMeal'];
  const saved = methods.map(name => Game[name]);
  const census = armed ? installShareCensus(Game) : null;
  // A lethal meal now removes the actual resident during villageEats. Meal
  // attempts are denominated by people present before eating, not survivors.
  const initialNpcIds = Game.state.village.roster.filter(id => id !== Game.villagerId);
  try { await quietLog(async () => Game.villageEats()); }
  finally {
    if (census) census.uninstall();
    methods.forEach((name, i) => assert.strictEqual(Game[name], saved[i], name + ' restored'));
    Game.villagerMealDay = original;
  }
  const result = { seen, ids: Object.fromEntries(Object.entries(f).filter(([k]) => k !== 'Game')),
    initialNpcIds,
    rows: census ? census.rows : [], skips: census ? census.skips : [], state: digest(Game.state) };
  assert.strictEqual(Game.villagerMealDay, original, 'meal wrapper restored');
  return result;
}
async function trustStock() {
  const { Game, producerVid } = await fixture(5), v = Game.state.village;
  if (process.env.CENSUS_EMPTY === '1') v.pantry = [];
  else for (const item of v.pantry) item.spoilDay = -1000;
  const original = Game.villagerDayProduction;
  let produced;
  Game.villagerDayProduction = function () { produced = original.apply(this, arguments); return produced; };
  const census = installShareCensus(Game);
  let result;
  try { result = Game.villagerMealDay(producerVid, Game.getPerson(producerVid), v, { cookId: null }); }
  finally { census.uninstall(); Game.villagerDayProduction = original; }
  const row = census.rows[0];
  assert(produced > row.need && result.gave > 0, 'trust stock fixture has actual surplus');
  return { row, produced, actualFactor: result.gave / (produced - row.need) };
}
async function campaign() {
  const { Game, loadFails } = await loadGame({ seed, mode: 'sharcensus-honesty' });
  assert.equal(loadFails.length, 0, 'no module load failures');
  await setupGame(Game);
  const armed = process.env.CENSUS_ARMED === '1';
  const census = armed ? installShareCensus(Game) : null;
  const hashes = [], warnings = [], warn = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); warn(...args); };
  const snapshot = () => digest({ state: Game.state, over: Game.over, won: Game.won,
    dayPart: Game.dayPart, villagerId: Game.villagerId,
    tbfight: Game.tbfight, pendingEncounter: Game.pendingEncounter });
  const policy = { ...leadcourt, daily(G, ctx) { hashes.push(snapshot()); return leadcourt.daily(G, ctx); } };
  let result;
  try { await quietLog(async () => { result = await runDays(Game, policy, { days: 30, sampleEvery: 10 }); }); }
  finally { if (census) census.uninstall(); console.warn = warn; }
  hashes.push(snapshot());
  return { seed, hashes, days: result.days, gameDays: result.gameDays, end: result.endReason,
    randomTail: Array.from({ length: 16 }, () => Math.random()), warnings,
    rows: census ? census.rows.length : 0 };
}
async function main() {
  const task = process.env.CENSUS_CHILD;
  if (task) {
    // Match the harness's frozen Date with a fixed wall-clock telemetry source.
    // Pacing reads performance.now(); actual elapsed milliseconds are not a game input.
    Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => 0 } });
    const result = task === 'campaign' ? await campaign() : task === 'trust-stock' ? await trustStock() : await meal(task === 'armed', Number(process.env.CENSUS_TRUST || 5));
    console.log('CENSUS_RESULT ' + JSON.stringify(result)); return;
  }
  const phase = process.env.PHASE || 'all';
  assert(['all', 'red', 'green', 'honesty'].includes(phase), 'known PHASE');
  if (phase === 'all' || phase === 'red' || phase === 'green') {
    const pristine = child('pristine');
    const raw = pristine.seen.map(r => r.result);
    check('raw returns observed', raw.length > 5);
    check('raw meal returns have no path or trust fields', raw.every(r => !('path' in r) && !('trust' in r)));
    check('severed villager has no pristine meal call', !pristine.seen.some(r => r.vid === pristine.ids.exiledVid));
    if (phase !== 'red') {
      const low = child('armed'), high = child('armed', { CENSUS_TRUST: '90' });
      check('prepared fixture observer leaves full state unchanged', pristine.state === low.state);
      const { rows, skips, ids } = low;
      const mealIds = rows.map(r => r.vid).concat(skips.filter(r => r.path === 'nonmember-withheld').map(r => r.vid));
      check('exactly one attempt or withheld skip per initial NPC, including real meal deaths',
        mealIds.length === low.initialNpcIds.length && new Set(mealIds).size === mealIds.length &&
        low.initialNpcIds.every(id => mealIds.includes(id)));
      check('every observed meal names a real path', rows.every(r => realPaths.has(r.path)));
      check('exile is recorded as withheld', skips.some(r => r.vid === ids.exiledVid && r.path === 'nonmember-withheld'));
      const row = id => rows.find(r => r.vid === id);
      check('short ration takes actual away-pack path', row(ids.awayVid)?.path === 'away-pack' && row(ids.awayVid).drew === 100);
      check('empty ration takes actual away-pack-empty path', row(ids.emptyVid)?.path === 'away-pack-empty' && row(ids.emptyVid).drew === 0);
      check('home shortage draws actual fresh pantry food', row(ids.homeVid)?.path === 'pantry-fresh' && row(ids.homeVid).drew > 0);
      check('surplus producer self-feeds without a draw', row(ids.producerVid)?.path === 'self-fed' && row(ids.producerVid).drew === 0);
      check('low trust is recorded on every meal', rows.every(r => r.trust === 5 && r.trustFactor === 0.2));
      const starved = rows.filter(r => classify(r).starved);
      check('attribution includes actual starvation', starved.length >= 2);
      check('starved-day attribution coverage >=80%', starved.filter(r => classify(r).starvePath !== 'other-short').length / starved.length >= 0.8);
      check('short and empty away starvation are distinct', classify(row(ids.awayVid)).starvePath === 'away-pack-short' && classify(row(ids.emptyVid)).starvePath === 'away-pack-empty');
      const lo = row(ids.producerVid), hi = high.rows.find(r => r.vid === high.ids.producerVid);
      check('trust arms have actual positive surplus', lo.gave > 0 && hi.gave > 0);
      check('trust factors follow both arms', lo.trustFactor === 0.2 && hi.trustFactor === 1);
      check('same farmer shares five times as much at high trust', Math.abs(hi.gave - lo.gave * 5) < 1e-6);
      const spoiled = child('trust-stock'), empty = child('trust-stock', { CENSUS_EMPTY: '1' });
      check('spoiled-stock trust factor matches actual sharing', Math.abs(spoiled.row.trustFactor - spoiled.actualFactor) < 1e-9);
      check('spoiled stock is distinguished from fresh stock', spoiled.row.pantryFreshBefore === 0 && spoiled.row.pantryTotalBefore >= 5000 && spoiled.row.trustFactor === 0.2);
      check('empty-stock crisis factor matches actual sharing', Math.abs(empty.row.trustFactor - empty.actualFactor) < 1e-9 && empty.row.trustFactor === 0.4);
      console.log('  measured paths ' + JSON.stringify(rows.reduce((out, r) => { out[r.path] = (out[r.path] || 0) + 1; return out; }, {})));
    }
  }
  if (phase === 'all' || phase === 'honesty') {
    for (const s of [11, 22, 33, 44]) {
      const a = child('campaign', { SEED: String(s), CENSUS_ARMED: '0' });
      const b = child('campaign', { SEED: String(s), CENSUS_ARMED: '1' });
      console.log('  neutrality receipt ' + JSON.stringify({ seed: s, pristine: a, observed: b }));
      check(`seed ${s}: observer saw real meals`, b.rows > 0);
      check(`seed ${s}: daily and final full-state hashes match`, digest(a.hashes) === digest(b.hashes));
      check(`seed ${s}: days and ending match`, a.days === b.days && a.gameDays === b.gameDays && a.end === b.end);
      check(`seed ${s}: RNG continuation matches`, digest(a.randomTail) === digest(b.randomTail));
      check(`seed ${s}: no campaign warnings`, a.warnings.length === 0 && b.warnings.length === 0);
      console.log(`  observed ${a.hashes.length} snapshots; days=${a.days}, end=${a.end}`);
    }
  }
  console.log(`PROOF ${phase.toUpperCase()}: ${pass}/${pass} checks green`);
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
