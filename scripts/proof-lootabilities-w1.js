#!/usr/bin/env node
// proof-lootabilities-w1.js — WAVE 1 (Arms 1-3) proof-of-effect harness.
// Preregs: evidence/2026-10-31/lootabilities-preregs-20261031.md (FROZEN).
//
// Modes (run separately; never two harnesses in one process):
//   node scripts/proof-lootabilities-w1.js scan      — reference scan (Arm 1 Metric A)
//   node scripts/proof-lootabilities-w1.js rolls     — kill-pool rolls, monster drops,
//                                                      wave-3/wave-4 rates, kill->loot->equip
//                                                      transcript, ruin gear-find transcript
//   node scripts/proof-lootabilities-w1.js simcount  — scholar 'scavenge' telemetry count,
//                                                      capable policy, seed 42, 30 days (Arm 3 report-only)
//
// On the UNEDITED tree, `rolls` is the CONTROL: it must FAIL Metric B/C
// (no armor in kill pool at any tier, no T1 weapon, herald + 4 wave-1
// monsters never drop). Control output recorded in the w1 evidence.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const mode = process.argv[2] || 'rolls';

function loadJSON(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }

// ---------- scan ----------
function doScan() {
  const items = loadJSON('src/data/items.json');
  const lt = items.filter(i => i.lootTier);
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  })(path.join(ROOT, 'src'));
  files.push(path.join(ROOT, 'index.html'), path.join(ROOT, 'sw.js'));
  let corpus = '';
  for (const f of files) {
    if (f.endsWith(path.join('data', 'items.json'))) continue;
    try { corpus += fs.readFileSync(f, 'utf8') + '\n'; } catch (e) { console.error('scan read fail', f, e.message); }
  }
  const unreachable = lt.filter(i => !corpus.includes(i.id));
  console.log('SCAN lootTier items:', lt.length);
  console.log('SCAN unreachable:', unreachable.length);
  console.log('SCAN unreachable ids:', JSON.stringify(unreachable.map(i => i.id)));
  // Arm 3 composition: scavenge pools per playable region + gear slice.
  const regions = loadJSON('src/data/regions.json');
  const rl = Array.isArray(regions) ? regions : (regions.regions || Object.values(regions));
  const itemById = {}; items.forEach(i => { itemById[i.id] = i; });
  for (const r of rl) {
    const sc = ((r.people || {}).scavenge) || null;
    if (!sc) { console.log('REGION', r.id, 'no people/scavenge layer (stub)'); continue; }
    const gear = sc.filter(s => { const d = itemById[s.id]; return d && (d.weapon || d.armor || d.class === 'tool'); });
    console.log('REGION', r.id, 'pool', sc.length, 'gear', gear.length, JSON.stringify(gear.map(g => g.id)),
      'gearPct', sc.length ? Math.round(1000 * gear.length / sc.length) / 10 : 0);
  }
}

// ---------- rolls ----------
async function doRolls() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 20261031, mode: 'proof-lootabilities-w1', narration: true });
  await setupGame(Game);
  const items = Game.data.items || [];
  const byId = {}; items.forEach(i => { byId[i.id] = i; });
  const monsters = Game.data.monsters.monsters || Game.data.monsters;
  const mById = {}; monsters.forEach(m => { mById[m.id] = m; });
  const isW = id => !!(byId[id] && byId[id].weapon);
  const isA = id => !!(byId[id] && byId[id].armor);

  // (b) 2000-roll samples per tier via the REAL rollAlienLoot pool path.
  // Synthetic mdef pins chance=1 and the tier; wave chosen so the wave-1
  // cap (<=2, non-apex) never masks the tier under test.
  const waveForTier = { 1: 1, 2: 1, 3: 3, 4: 5 };
  const tierResults = {};
  for (const T of [1, 2, 3, 4]) {
    const mdef = { id: 'proof_dummy', wave: waveForTier[T], loot: { chance: 1, tier: T } };
    const counts = {};
    for (let n = 0; n < 2000; n++) {
      const id = Game.rollAlienLoot(mdef, { id: 'proof_fighter' });
      if (id) counts[id] = (counts[id] || 0) + 1;
    }
    const ids = Object.keys(counts);
    const weapons = ids.filter(isW), armors = ids.filter(isA);
    tierResults[T] = { distinct: ids.length, weapons, armors, counts };
    console.log('TIER', T, 'distinct drops:', ids.length,
      '| weapons:', JSON.stringify(weapons), '| armor:', JSON.stringify(armors));
    console.log('TIER', T, 'sample counts:', JSON.stringify(counts));
  }

  // (c) drops occurring for the named monsters (real mdef, real chance).
  for (const mid of ['dustboar', 'sunback', 'sweeps_week', 'cliffhanger', 'herald']) {
    const mdef = mById[mid];
    let drops = 0; const got = {};
    for (let n = 0; n < 3000; n++) {
      const id = Game.rollAlienLoot(mdef, { id: 'proof_fighter' });
      if (id) { drops++; got[id] = (got[id] || 0) + 1; }
    }
    console.log('MONSTER', mid, 'loot=', JSON.stringify(mdef.loot || null), 'drops/3000:', drops, JSON.stringify(got));
  }

  // (d) wave-3 tier-3 rate and wave-4 tier-4 rate (seeded rolls, real chances).
  for (const W of [3, 4]) {
    const roster = monsters.filter(m => (m.wave || 1) === W);
    let tot = 0, t3 = 0, t4 = 0; const perMonster = {};
    for (const mdef of roster) {
      let d = 0, a = 0, b = 0;
      for (let n = 0; n < 3000; n++) {
        const id = Game.rollAlienLoot(mdef, { id: 'proof_fighter' });
        if (id) { d++; const t = (byId[id] || {}).lootTier || 1; if (t === 3) a++; if (t === 4) b++; }
      }
      perMonster[mdef.id] = { drops: d, tier3: a, tier4: b };
      tot += d; t3 += a; t4 += b;
    }
    console.log('WAVE', W, 'per-monster:', JSON.stringify(perMonster));
    console.log('WAVE', W, 'totals: drops', tot, 'tier3', t3, 'tier4', t4,
      '| tier3 rate per kill-roll:', (t3 / (roster.length * 3000)).toFixed(4),
      '| tier4 rate per kill-roll:', (t4 / (roster.length * 3000)).toFixed(4));
  }

  // (e) kill -> loot -> equip transcript. A hushwolf (wave 1, tier 2) is
  // "killed" by rolling its real loot entry until a weapon or armor drops;
  // the drop goes on the corpse (alienLootGrant), a villager loots the
  // corpse into their own items, and autoEquip puts it on.
  const hush = mById['hushwolf'];
  let dropId = null, tries = 0;
  while (tries < 2000 && !dropId) {
    tries++;
    const id = Game.rollAlienLoot(hush, { id: 'proof_fighter' });
    if (id && (isW(id) || isA(id))) dropId = id;
  }
  console.log('TRANSCRIPT kill->loot->equip:');
  if (!dropId) {
    console.log('  No weapon/armor dropped from hushwolf in', tries, 'rolls (CONTROL EXPECTED on unedited tree).');
  } else {
    const corpse = { kind: 'monster', monsterId: 'hushwolf', items: [] };
    const grant = Game.alienLootGrant(dropId, corpse);
    console.log(`  A hushwolf dies (loot roll succeeded on try ${tries}). On its corpse: ${grant.def.name} [${dropId}].`);
    const person = { id: 'proof_villager', name: 'Mara (proof villager)', items: [], personality: { temperament: 'steady', sharing: 'balanced' } };
    person.items.push(corpse.items[0]);
    console.log('  Mara loots the corpse. Her items now:', JSON.stringify(person.items.map(e => e.itemId)));
    const EQ = (globalThis.Scattering || {}).equipment;
    if (!EQ) { console.log('  EQUIPMENT MODULE MISSING'); }
    else {
      EQ.autoEquip(person, items);
      console.log('  After autoEquip, Mara wears/carries:', JSON.stringify(person.equipped));
      console.log('  Gear description:', EQ.gearDescription ? EQ.gearDescription(person) : '(n/a)');
    }
  }

  // Arm 3: ruin gear-find transcript. Fixture: the generated ruin tile is
  // restocked with the active region's first gear scavenge entry at the
  // front of its loot list and its first-search book roll is pre-marked
  // (bookChecked) so the transcript isolates the scavenge draw itself.
  console.log('TRANSCRIPT ruin gear find:');
  try {
    const scav = Game.regionScavenge();
    const gearEntry = scav.find(s => { const d = byId[s.id]; return d && (d.weapon || d.armor); });
    if (!gearEntry) console.log('  Active region scavenge pool has NO gear entry (CONTROL EXPECTED on unedited tree). Pool:', JSON.stringify(scav.map(s => s.id)));
    else {
      let ruin = null, rx = -1, ry = -1;
      const tiles = (Game.map && Game.map.tiles) || [];
      for (let y = 0; y < tiles.length && !ruin; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
        if (tiles[y][x] && tiles[y][x].type === 'ruin') { ruin = tiles[y][x]; rx = x; ry = y; }
      }
      if (!ruin) console.log('  No ruin tile on the generated map for this seed.');
      else {
        ruin.loot = [gearEntry.id]; ruin.bookChecked = true;
        Game.map.px = rx; Game.map.py = ry;
        const sch = Game.state.scholar; sch.mx = 4; sch.my = 4; sch.kcal = Math.max(sch.kcal || 0, 1500);
        const said = [];
        const origSay = Game.say; Game.say = function (m) { said.push(String(m)); try { return origSay.apply(this, arguments); } catch (e) { console.error('say fail', e.message); } };
        Game.doAction('forage');
        Game.say = origSay;
        console.log('  Region:', ((Game.state || {}).region || '?'), '| gear entry searched:', gearEntry.id);
        console.log('  Search narration:', JSON.stringify(said.filter(s => s && s.length < 400)));
        const found = (sch.inventory || []).filter(e => e.itemId === gearEntry.id || e.plantId === gearEntry.id);
        console.log('  Scholar inventory entries for', gearEntry.id + ':', JSON.stringify(found));
        const def = byId[gearEntry.id];
        console.log('  Gear def:', def ? JSON.stringify({ name: def.name, weapon: def.weapon || null, armor: def.armor || null }) : 'MISSING DEF');
      }
    }
  } catch (e) { console.log('  Ruin transcript error:', e && e.message); }
}

// ---------- simcount ----------
async function doSimCount() {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { capable } = require('./policies/capable');
  const { Game } = await loadGame({ seed: 42, mode: 'proof-lootabilities-w1-simcount' });
  await setupGame(Game);
  let scavenge = 0, lootDropped = 0;
  const origTele = Game.tele;
  Game.tele = function (type, data) { if (type === 'scavenge') scavenge++; if (type === 'loot_dropped') lootDropped++; return origTele.apply(this, arguments); };
  const res = await runDays(Game, capable, { days: 30 });
  console.log('SIMCOUNT seed=42 policy=capable days=30 endReason=', res.endReason,
    '| scavenge telemetry events:', scavenge, '| loot_dropped events:', lootDropped);
}

(async () => {
  if (mode === 'scan') doScan();
  else if (mode === 'simcount') await doSimCount();
  else await doRolls();
})().catch(e => { console.error('PROOF FAIL', e && e.stack || e); process.exit(1); });
