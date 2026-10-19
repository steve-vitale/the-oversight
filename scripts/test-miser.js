// Miser playtest: hoarding, caches, stash theft, personal economy.
// Plays the full miser loop end-to-end and asserts the mechanics hold.
// Usage: node scripts/test-miser.js
const K = require('./godpath/lib');
const SEED = parseInt(process.env.SEED || '20261017', 10);
let Game;
function withRoll(value, fn) {
  const real = Math.random;
  Math.random = typeof value === 'function' ? value : () => value;
  try { return fn(); } finally { Math.random = real; }
}

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}

let said = [];
function freshGame() {
  said = [];
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.say = t => said.push(String(t));
  Game.depart();
  // deterministic light pack: 1 water bottle, empty pockets
  Game.state.scholar.water = (Game.state.scholar.water || []).slice(0, 1);
  Game.state.scholar.inventory = [];
}
const ME = () => Game.state.scholar.villagerId;

(async () => {
  Game = await K.load({ seed: SEED });
  Game.debugRegion = 'na_eastern_woodlands';

  // ---------- ACT 1: gather & stash ----------
  freshGame();
  Game.addMaterial('branch', 12);
  Game.addMaterial('wood', 2);
  ok('gathered materials land in inventory', Game.materialCount('branch') === 12);

  const trustBefore = (Game.state.village.trust || {})[ME()] || 15;
  Game.donateMaterial('branch', 10);
  const st = Game.stashState();
  ok('donation reaches the stash', st.materials.branch === 10);
  ok('donation is ledgered', st.ledger.length >= 1 && st.ledger[0].kind === 'give' && st.ledger[0].qty === 10);
  ok('donation buys a little trust', ((Game.state.village.trust || {})[ME()] || 0) > trustBefore);
  ok('donation says something warm', said.some(t => /pile grows/i.test(t)));
  ok('branches, never branchs', said.some(t => /10 branches/i.test(t)) && !said.some(t => /branchs/.test(t)));

  Game.takeMaterial('branch', 5);
  ok('take removes from stash', Game.stashState().materials.branch === 5);
  ok('take lands in inventory', Game.materialCount('branch') === 7); // 2 left + 5 taken
  ok('take is ledgered', Game.stashState().ledger[0].kind === 'take');
  ok('take names the plural', said.some(t => /Took 5 branches/i.test(t)));

  // drain past the -20 net line: seed the stash, take heavy
  Game.stashState().materials.branch = 60;
  const tMid = (Game.state.village.trust || {})[ME()];
  Game.takeMaterial('branch', 10);
  Game.spendMaterial('branch', 99); // haul it away; the miser doesn't carry it all
  Game.takeMaterial('branch', 20);
  Game.spendMaterial('branch', 99);
  const v = Game.state.village;
  // LEDGER SHAPE (miser break-it 2026-10-08): stashGives/stashTakes are now
  // per-material objects ({branch: n}); sum for totals, _stashTotalNet for net.
  const takesSum = Object.values(v.stashTakes[ME()] || {}).reduce((t, x) => t + (x || 0), 0);
  const net = Game._stashTotalNet(ME());
  ok('takes accumulate in the ledger', takesSum === 35);
  ok('net goes negative past -20', net < -20);
  ok('heavy taking costs trust', ((v.trust || {})[ME()] || 0) < tMid);
  console.log(`  stash drain: gives=10 takes=${takesSum} net=${net}, trust ${tMid} → ${(v.trust || {})[ME()]}`);

  const lt = Game.stashLedgerText(5);
  ok('ledger text lists gives and takes', /left/.test(lt) && /took/.test(lt));

  // ---------- ACT 2: caches ----------
  freshGame();
  Game.addMaterial('wood', 6);
  Game.addMaterial('stone', 6);
  Game.buryCache('material', 'wood', 4);
  let caches = Game.playerCaches();
  ok('cache buried', caches.length === 1 && caches[0].items[0].units === 4);
  ok('cache notes the journal/codex', (Game.state.codex.places || []).some(p => /buried/i.test(p.text)));
  ok('burying says where', said.some(t => /Buried\./.test(t)));
  ok('burying costs the goods', Game.materialCount('wood') === 2);

  const cid = caches[0].id;
  Game.digUpCache(cid);
  ok('digging up returns the goods', Game.materialCount('wood') === 6);
  ok('dug cache is gone', Game.playerCaches().length === 0);
  ok('digging up feels good', said.some(t => /Still yours/.test(t)));

  // robbed cache: the gut-punch
  Game.buryCache('material', 'stone', 6);
  const robId = Game.playerCaches()[0].id;
  Game.playerCaches()[0].found = true;
  Game.playerCaches()[0].items = [];
  said = [];
  Game.digUpCache(robId);
  ok('robbed cache tells you straight', said.some(t => /Someone got here first/.test(t)));
  ok('robbed cache is cleared', Game.playerCaches().length === 0);

  // food caching round-trips
  const inv = Game.state.scholar.inventory;
  inv.push({ name: 'Test jerky', kcalEach: 200, units: 3, spoilDay: 99, kg: 0.1 });
  const fidx = inv.findIndex(i => i.name === 'Test jerky');
  Game.buryCache('food', fidx, 2);
  ok('food cache holds kcal', Game.playerCaches()[0].items[0].kcalEach === 200);
  Game.digUpCache(Game.playerCaches()[0].id);
  ok('food comes back', inv.find(i => i.name === 'Test jerky').units === 3);

  // ---------- ACT 3: actual cache theft thresholds, without sampling noise ----------
  freshGame();
  const home = Game.state.village;
  const hx = home.px ?? 4, hy = home.py ?? 4;
  const spots = [{ x: hx, y: hy }, ...(Game.state.otherVillages || []),
    ...(Game.state.pastVillages || []).filter(Boolean).map(v => ({ x: v.px ?? 4, y: v.py ?? 4 }))];
  // Select real map coordinates farthest from ALL villages, not an impossible
  // off-map cache or a spot next to a different village.
  let far = { x: hx, y: hy, distance: 0 };
  for (let y = 0; y < Game.map.tiles.length; y++) for (let x = 0; x < Game.map.tiles[y].length; x++) {
    const distance = Math.min(...spots.map(p => Math.abs(p.x - x) + Math.abs(p.y - y)));
    if (distance > far.distance) far = { x, y, distance };
  }
  ok('far cache uses a legal tile away from the nearest village', far.distance > 0 && !!Game.tileAt(far.x, far.y));
  const nearRate = Game.cacheTheftChance(0), farRate = Game.cacheTheftChance(far.distance);
  ok('doorstep daily theft rate is the authored 0.8%', Math.abs(nearRate - 0.008) < 1e-12);
  ok('wild distance reduces the daily theft rate', farRate > 0 && farRate < nearRate);
  ok('distant caches retain nonzero risk', Math.abs(Game.cacheTheftChance(24) - 0.00048) < 1e-12);
  const rates = [0, 3, 6, 9, 12, 24].map(d => Game.cacheTheftChance(d));
  ok('theft risk never increases with distance', rates.every((p, i) => i === 0 || p <= rates[i - 1]));
  function resetCaches() {
    const caches = Game.playerCaches();
    caches.length = 0;
    for (const [id, node] of [['near', { x: hx, y: hy }], ['far', { x: far.x, y: far.y }]])
      caches.push({ id, node, desc: id, label: id, items: [{ name: 'wood', material: 'wood', units: 1 }], found: false, day: 0 });
    return caches;
  }
  for (const [label, roll, nearStolen, farStolen] of [
    ['below both rates', farRate / 2, true, true],
    ['exactly the far rate', farRate, true, false],
    ['between both rates', (nearRate + farRate) / 2, true, false],
    ['exactly the near rate', nearRate, false, false],
    ['above both rates', 0.999, false, false],
  ]) {
    const caches = resetCaches();
    withRoll(roll, () => Game.dailyCacheCheck());
    ok(label + ': near cache threshold is honored', caches[0].found === nearStolen);
    ok(label + ': far cache threshold is honored', caches[1].found === farStolen);
    ok(label + ': goods disappear only when stolen', caches.every(c => c.items.length === (c.found ? 0 : 1)));
    if (nearStolen) ok(label + ': near robbery has a real local culprit', home.roster.includes(caches[0].robbedBy) && caches[0].robbedBy !== ME());
  }

  // Already robbed caches cannot be robbed or rolled again.
  const emptied = resetCaches();
  withRoll(0, () => Game.dailyCacheCheck());
  const foundBefore = JSON.stringify(emptied);
  let rerolls = 0;
  withRoll(() => { rerolls++; return 0; }, () => Game.dailyCacheCheck());
  ok('found caches consume no additional theft rolls', rerolls === 0);
  ok('found caches retain their original robbery record', JSON.stringify(emptied) === foundBefore);

  // Verify the real day-end hook, not only direct method calls.
  const overnight = resetCaches(), dailyCheck = Game.dailyCacheCheck;
  let dailyCalls = 0, observed;
  Game.dailyCacheCheck = function (...args) {
    dailyCalls++;
    const result = withRoll((nearRate + farRate) / 2, () => dailyCheck.apply(this, args));
    observed = overnight.map(c => ({ found: c.found, units: c.items.length }));
    return result;
  };
  const cacheDay = Game.state.scholar.day;
  try { Game.endDay(); } finally { Game.dailyCacheCheck = dailyCheck; }
  ok('actual day resolution calls the cache check once', dailyCalls === 1);
  ok('actual overnight theft uses the distance thresholds', observed?.[0].found === true && observed?.[1].found === false);
  ok('actual overnight theft removes only the stolen goods', observed?.[0].units === 0 && observed?.[1].units === 1);
  ok('actual overnight check advances the day', Game.state.scholar.day === cacheDay + 1);

  // ---------- ACT 4: pickpocket → notice → justice ----------
  freshGame();
  const victim = Game.state.village.roster.find(id => id !== ME());
  let seenCaught = false, seenUnseen = false, caughtKeptPack = false;
  for (const roll of [0, 0.999]) {
    // keep the victim's pack full: we're testing the detection roll, not pack economics
    const v0 = Game.state.village;
    v0.pack = v0.pack || {};
    Game.packKcal(victim);
    v0.pack[victim].kcal = Math.max(v0.pack[victim].kcal, 1000);
    const packBefore = Game.packKcal(victim);
    const r = withRoll(roll, () => Game.stealFrom(victim));
    if (r === 'caught') {
      seenCaught = true;
      // getting caught means you let go — the food stays where it was
      if (Game.packKcal(victim) === packBefore) caughtKeptPack = true;
    }
    if (r === 'unseen') seenUnseen = true;
  }
  ok('pickpocket can get caught', seenCaught);
  ok('caught pickpocket leaves the food in the pack', caughtKeptPack);
  ok('pickpocket can go unseen', seenUnseen);
  ok('unseen theft stashes stolen goods', Game.state.scholar.inventory.some(i => i.stolen));
  Game.dayPart = (Game.dayPart || 0) + 1;
  said = [];
  Game.theftNoticeSweep();
  ok('victim notices missing rations', said.some(t => /Someone took my rations/.test(t)));
  const heat = Game.justiceHeat();
  ok('theft registers justice heat', heat >= 15);
  console.log(`  justice heat after one noticed theft: ${heat}`);

  // ---------- ACT 5: stash drain vs justice heat (design probe) ----------
  freshGame();
  Game.stashState().materials.branch = 100;
  Game.takeMaterial('branch', 60); // weight-capped; takes what fits
  const v2 = Game.state.village;
  const took = Object.values((v2.stashTakes || {})[ME()] || {}).reduce((t, x) => t + (x || 0), 0);
  const heat2 = Game.justiceHeat();
  console.log(`  stash-only drain: took=${took}, justice heat=${heat2} (pickpocket theft heat was >=15)`);
  ok('stash ledger tracks the drain', took > 0);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('THREW', e); process.exit(1); });
