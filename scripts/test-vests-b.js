#!/usr/bin/env node
// test-vests-b.js — proof for sim-vests-b (DIAG instrument).
//   F1 (data): vest defs pass the generation-pool filter and FAIL the
//     alien-loot pool filter (both computed from the real data files).
//   F2 (engine): Game.rollAlienLoot with chance=1, tiers 1-4, reward
//     sources null/contest/trade, 200 draws each, NEVER returns a vest.
//   F3 (census): planted itemId-form vests are found by scan() in the
//     right locations, and sweep-compare's stdSnapshot now counts the
//     scholar's itemId-form vest too (sim-vestcounter-b fix; the old
//     `.id`-only read returned 0 here, which was the blind spot).
//   F4 (read-only): scan() + gateState() twice give identical results.
//   F5 (gate): leanlink is default-OFF (LEANLINK unset/'0' -> mode 0);
//     LEANLINK=1 -> mode 1; requiring leanlink leaves competent intact.
// Usage: node scripts/test-vests-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { scan, entryId, VEST_IDS } = require('./sweep-vests-b');
const { stdSnapshot } = require('./sweep-compare');
const { leanlinkMode } = require('./policies/leanlink');
const { competent } = require('./policies/competent');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(function f1() {
  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
  const list = Array.isArray(items) ? items : items.items;
  const byId = {};
  for (const it of list) byId[it.id] = it;
  const re = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/reward-economy.json'), 'utf8'));
  const extra = re.extraItems || {};
  for (const vid of VEST_IDS) {
    const def = byId[vid];
    check('F1 def exists ' + vid, !!def);
    if (!def) continue;
    // Generation pool (game.js genItemCandidates): class != food,
    // lootTier <= 2, origin != alien.
    const genOk = def.class !== 'food' && (def.lootTier || 1) <= 2 && def.origin !== 'alien';
    check('F1 generation pool includes ' + vid, genOk, JSON.stringify({ cls: def.class, lootTier: def.lootTier, origin: def.origin }));
    // Alien-loot pool (game.js rollAlienLoot): origin == alien OR id in
    // extraItems[tier], for every tier 1-4.
    let lootOk = false;
    for (let t = 1; t <= 4; t++) if (def.origin === 'alien' || (extra[String(t)] || []).includes(vid)) lootOk = true;
    check('F1 alien-loot pool excludes ' + vid, !lootOk);
    // Personal-pool clothing pick (lifeseed.js genPersonalPool
    // take('clothing',1)): class match only, no lootTier/origin gate.
    check('F1 personal-pool clothing class ' + vid, def.class === 'clothing');
  }
})();

(function f5() {
  const prev = process.env.LEANLINK;
  delete process.env.LEANLINK;
  check('F5 gate unset -> 0', leanlinkMode() === 0);
  process.env.LEANLINK = '0';
  check('F5 gate 0 -> 0', leanlinkMode() === 0);
  process.env.LEANLINK = '1';
  check('F5 gate 1 -> 1', leanlinkMode() === 1);
  if (prev === undefined) delete process.env.LEANLINK; else process.env.LEANLINK = prev;
  check('F5 competent.daily intact', typeof competent.daily === 'function');
  check('F5 entryId forms', entryId({ itemId: 'military_vest' }) === 'military_vest'
    && entryId({ id: 'swat_vest' }) === 'swat_vest' && entryId('hide_armor') === 'hide_armor');
})();

(async function f234() {
  const { Game } = await loadGame({ seed: 9911, mode: 'vests-b-test', fullTelemetry: false });
  await setupGame(Game);
  // F2: live loot rolls, chance forced to 1.
  let vestDraws = 0, draws = 0, badPool = 0;
  const re = Game.data.rewardEconomy || {};
  for (const rs of [null, 'contest', 'trade']) {
    for (let tier = 1; tier <= 4; tier++) {
      for (let i = 0; i < 200; i++) {
        const mdef = { wave: 1, loot: { chance: 1, tier } };
        if (rs) mdef.loot.rewardSource = rs;
        const got = Game.rollAlienLoot(mdef, null);
        if (!got) continue;
        draws++;
        if (VEST_IDS.includes(got)) vestDraws++;
        const def = (Game.data.items || []).find(x => x.id === got) || {};
        const extraList = (re.extraItems || {})[String(def.lootTier || 1)] || [];
        if (!(def.origin === 'alien' || extraList.includes(got))) badPool++;
      }
    }
  }
  check('F2 loot draws happened', draws > 0, 'draws=' + draws);
  check('F2 loot never returns a vest', vestDraws === 0, 'vestDraws=' + vestDraws);
  check('F2 loot returns only alien/extra pool', badPool === 0, 'badPool=' + badPool);

  // F3: plant vests in every census location, scholar + one villager.
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'military_vest', name: 'Military vest', units: 1, kg: 1.5 });
  const roster = ((Game.state.village || {}).roster || []);
  const other = roster.find(id => id && id !== Game.villagerId);
  let villagerPlanted = false;
  if (other) {
    const p = (Game.data.villagers || []).find(x => x && x.id === other);
    if (p) {
      p.items = p.items || [];
      p.items.push({ itemId: 'swat_vest', name: 'SWAT vest', units: 1, kg: 3.5 });
      p.stashed = p.stashed || [];
      p.stashed.push('military_vest');
      p.fullPool = p.fullPool || [];
      p.fullPool.push('swat_vest');
      villagerPlanted = true;
    }
  }
  check('F3 villager plant target exists', villagerPlanted);
  const sc = scan(Game);
  const heldIds = sc.held.map(h => h.holder + ':' + h.vestId + ':' + h.location);
  check('F3 scan finds scholar pack vest (itemId form)', heldIds.includes('scholar:military_vest:pack'), JSON.stringify(heldIds));
  if (villagerPlanted) {
    check('F3 scan finds villager pack vest', heldIds.some(h => h.endsWith(':swat_vest:pack')), JSON.stringify(heldIds));
    check('F3 scan finds villager stashed vest (separate from held)',
      sc.stashed.some(h => h.vestId === 'military_vest' && h.location === 'stashed'));
    check('F3 scan finds villager fullPool vest (separate from held)',
      sc.pools.some(h => h.vestId === 'swat_vest' && h.location === 'fullPool'));
    check('F3 held count excludes stash/pool', sc.held.filter(h => h.vestId === 'military_vest').length === 1
      && sc.held.filter(h => h.vestId === 'swat_vest').length === 1, JSON.stringify(sc.held));
  }
  // Sweep snapshot on the same state (sim-vestcounter-b fix): the
  // itemId-form scholar vest now counts (was 0 under the old `.id`-only
  // read — that assertion lived here until the fix landed).
  const snap = stdSnapshot(Game);
  check('F3 sweep snapshot counts itemId-form scholar vest', snap.vests === 1, 'snap.vests=' + snap.vests);
  // F4: read-only — scan + gate twice, identical.
  const sc2 = scan(Game);
  check('F4 scan idempotent', JSON.stringify(sc) === JSON.stringify(sc2));
  let g1 = null, g2 = null;
  try { g1 = JSON.stringify(require('./sweep-vests-b').gateState(Game)); } catch (e) { g1 = 'err:' + e.message; }
  try { g2 = JSON.stringify(require('./sweep-vests-b').gateState(Game)); } catch (e) { g2 = 'err:' + e.message; }
  check('F4 gateState idempotent', g1 === g2);
  console.log(`\ntest-vests-b: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
