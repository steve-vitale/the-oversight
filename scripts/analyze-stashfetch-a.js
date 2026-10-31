#!/usr/bin/env node
// analyze-stashfetch-a.js — pure-read analyzer for stashfetch corpora.
// Usage: node scripts/analyze-stashfetch-a.js <corpus-dir> [out-json]
// Reads scripts/../src/data/items.json for def classes (weapon/armor)
// and each stashfetch-a-s<seed>.json in the corpus dir. No game load,
// no writes except the optional out-json census. Classifies, per seed,
// the DAY-1 WEAPON-FETCH and DAY-1 ARMOR-FETCH indicators from the
// prereg's five channels (wrapper result, tele event, fetch line,
// evening inv gain, next-morning pool shrink); any channel
// disagreement makes the indicator INVALID.
'use strict';
const fs = require('fs');
const path = require('path');

const corpusDir = process.argv[2];
if (!corpusDir) { console.error('usage: analyze-stashfetch-a.js <corpus-dir> [out-json]'); process.exit(2); }
const outPath = process.argv[3] || null;

const itemsPath = path.join(__dirname, '..', 'src', 'data', 'items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const defOf = (id) => (Array.isArray(items) ? items : (items.items || [])).find((d) => d.id === id) || null;
const itemName = (id) => { const d = defOf(id); return (d && d.name) || id; };
const isWeapon = (id) => { const d = defOf(id); return !!(d && d.class === 'weapon' && d.weapon); };
const isArmor = (id) => { const d = defOf(id); return !!(d && d.armor); };

function fetchIndicator(inst, kind) {
  // kind: 'weapon' | 'armor'
  const method = kind === 'weapon' ? 'vesselStashFetch' : 'vesselArmorFetch';
  const teleEv = kind === 'weapon' ? 'vessel_stash_fetch' : 'vessel_armor_fetch';
  const spawn = inst.spawnSnap || {};
  const spawnInv = spawn.inv || [];
  const spawnStash = (spawn.pool && spawn.pool.stashed) || [];
  const ev1 = (inst.evenings || []).find((r) => r.loopDay === 1) || null;
  const ev2 = (inst.evenings || []).find((r) => r.loopDay === 2) || null;
  const day2Pool = ev2 && ev2.morningAxe ? (ev2.morningAxe.pool || {}) : null;
  const day2Stash = day2Pool ? (day2Pool.stashed || null) : null;
  const spawnCandidates = spawnStash.filter((id) => (kind === 'weapon' ? isWeapon(id) : isArmor(id)));
  // Channel 1: wrapper result on loopDay 1.
  const wrapCalls = (inst.fetchEvents || []).filter((e) => e.method === method && e.loopDay === 1);
  const wrapItem = wrapCalls.length && wrapCalls[0].result ? wrapCalls[0].result.item : null;
  // Channel 2: tele event on loopDay 1.
  const teles = (inst.teleEvents || []).filter((e) => e.event === teleEv && e.loopDay === 1);
  const teleItem = teles.length && teles[0].data ? teles[0].data.item : null;
  // Channel 3: day-1 fetch line naming the item.
  const lines1 = ev1 ? (ev1.fetchLines || []) : [];
  // Channel 4: evening inv gain.
  const eveInv = ev1 && ev1.eveningAxe ? (ev1.eveningAxe.inv || []) : [];
  // Channel 5: day-2 pool shrink.
  const present = { spawn: !!ev1, day2morning: !!ev2, day2pool: day2Stash !== null };
  const incomplete = !ev1 || !ev2 || day2Stash === null;
  // Candidate items: union of wrap/tele/line-matched/gained/shrunk.
  // NOTE (pilot fix, pre-judged): gained/shrunk MUST be kind-filtered.
  // Both fetches fire on day 1, so the raw evening gain and pool shrink
  // name the weapon AND the armor; without the filter every seed with
  // both kinds stashed classified multi-item INVALID.
  const kindCheck = (id) => (kind === 'weapon' ? isWeapon(id) : isArmor(id));
  const gained = eveInv.filter((id) => !spawnInv.includes(id) && spawnStash.includes(id) && kindCheck(id));
  const shrunk = spawnStash.filter((id) => day2Stash !== null && !day2Stash.includes(id) && kindCheck(id));
  const lineItems = spawnCandidates.filter((id) => lines1.some((l) => l.toLowerCase().includes(itemName(id).toLowerCase())));
  const union = [...new Set([wrapItem, teleItem, ...lineItems, ...gained, ...shrunk].filter(Boolean))];
  // Valid-true: exactly one item, all five channels name it.
  // Valid-false: no item on any channel (and not incomplete).
  // Else INVALID.
  let indicator = null, item = null, detail = null;
  if (incomplete) {
    indicator = 'INVALID';
    detail = 'incomplete-snaps';
  } else if (union.length === 0) {
    indicator = 'NOFETCH';
    detail = 'no-channel-fires';
  } else if (union.length === 1) {
    const it = union[0];
    const ch = {
      wrap: wrapItem === it,
      tele: teleItem === it,
      line: lineItems.includes(it),
      gain: gained.includes(it),
      shrink: shrunk.includes(it),
    };
    if (ch.wrap && ch.tele && ch.line && ch.gain && ch.shrink) {
      indicator = 'FETCH'; item = it; detail = 'all-five-channels';
    } else {
      indicator = 'INVALID'; item = it; detail = 'channel-disagreement:' + JSON.stringify(ch);
    }
  } else {
    indicator = 'INVALID'; detail = 'multi-item-union:' + union.join(',');
  }
  return {
    indicator, item, detail, spawnCandidates,
    channels: { wrapItem, teleItem, lineItems, gained, shrunk },
    spawnStash, day2Stash, spawnInv, eveInv,
    wrapCallsDay1: wrapCalls.map((c) => ({ result: c.result, before: c.before })),
    teleDay1: teles,
    linesDay1: lines1,
  };
}

function analyzeSeed(inst) {
  const spawn = inst.spawnSnap || {};
  const spawnStash = (spawn.pool && spawn.pool.stashed) || [];
  const weapon = fetchIndicator(inst, 'weapon');
  const armor = fetchIndicator(inst, 'armor');
  const allCalls = (inst.fetchEvents || []).map((e) => ({
    loopDay: e.loopDay, method: e.method, result: e.result,
    before: e.before ? { over: e.before.over, dayFlag: e.before.dayFlag, atHaven: e.before.atHaven, personAlive: e.before.personAlive, stash: e.before.stash, eqMelee: e.before.eqMelee, eqMeleeBonus: e.before.eqMeleeBonus, eqRanged: e.before.eqRanged, eqRangedBonus: e.before.eqRangedBonus } : null,
  }));
  const complete = !!(inst.spawnSnap && !inst.spawnSnap.error &&
    (inst.evenings || []).some((r) => r.loopDay === 1 && r.eveningAxe && !r.eveningAxe.error) &&
    (inst.evenings || []).some((r) => r.loopDay === 2 && r.morningAxe && r.morningAxe.pool && !r.morningAxe.pool.error));
  return {
    seed: inst.seed, cell: inst.cell, policy: inst.policy,
    woodcarry: inst.woodcarry, woodwarm: inst.woodwarm, strandfix: inst.strandfix,
    vesselId: spawn.villagerId || null,
    recorderErrs: (inst.recorder || {}).errs || 0,
    complete,
    daysAlive: inst.daysAlive, endReason: inst.endReason,
    spawnStash, spawnInv: spawn.inv || [], spawnEq: spawn.eq || [],
    weaponFetch: weapon, armorFetch: armor,
    fetchCalls: allCalls,
  };
}

const files = fs.readdirSync(corpusDir).filter((f) => f.startsWith('stashfetch-a-s') && f.endsWith('.json')).sort();
const seeds = {};
for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
  seeds[inst.seed] = analyzeSeed(inst);
}
const census = {
  corpusDir, cell: (Object.values(seeds)[0] || {}).cell || null,
  n: Object.keys(seeds).length,
  seeds,
  summary: {
    complete: Object.values(seeds).filter((s) => s.complete).length,
    recorderErrsTotal: Object.values(seeds).reduce((a, s) => a + s.recorderErrs, 0),
    weaponFetch: Object.values(seeds).filter((s) => s.weaponFetch.indicator === 'FETCH').length,
    weaponNoFetch: Object.values(seeds).filter((s) => s.weaponFetch.indicator === 'NOFETCH').length,
    weaponInvalid: Object.values(seeds).filter((s) => s.weaponFetch.indicator === 'INVALID').length,
    armorFetch: Object.values(seeds).filter((s) => s.armorFetch.indicator === 'FETCH').length,
    armorNoFetch: Object.values(seeds).filter((s) => s.armorFetch.indicator === 'NOFETCH').length,
    armorInvalid: Object.values(seeds).filter((s) => s.armorFetch.indicator === 'INVALID').length,
  },
};
const out = JSON.stringify(census, null, 2);
if (outPath) fs.writeFileSync(outPath, out);
console.log(out);
