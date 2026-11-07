// loadoutcensus-20261107.js — opening keep-5 census (arm sim-loadoutcensus-b).
// DIAG, zero game-code change. Per seed: loadGame + setupGame, then a day-0
// dump of every roster villager's opening loadout: fullPool (8), kept 5,
// stashed 3, equipped slots — each item classified with its keep-score
// components. No runDays: this is an opening-days census, not a survival run.
// Usage:
//   SEEDS=53001..53008 LABEL=c1 OUTDIR=evidence/2026-11-07/perseed-loadoutcensus-b-c1 node scripts/loadoutcensus-20261107.js
// Refuses to overwrite. OUTDIR defaults to evidence/2026-11-07/perseed-loadoutcensus-b-<label>.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

// --- Pure helpers (also exported for the proof test) -----------------------

// Primary kind for counting: weapon wins over tool wins over armor wins over
// sentimental; flags are recorded separately so a dual-profile item (e.g. a
// tool-class machete with a weapon profile) is never silently single-counted.
function classifyItem(def) {
  def = def || {};
  const hasWeapon = !!(def.weapon);
  const hasTool = !!(def.tool);
  const hasArmor = !!(def.armor);
  const sentimental = def.class === 'sentimental';
  let kind = 'other';
  if (hasWeapon) kind = 'weapon';
  else if (hasTool) kind = 'tool';
  else if (hasArmor) kind = 'armor';
  else if (sentimental) kind = 'sentimental';
  return { kind, hasWeapon, hasTool, hasArmor, sentimental };
}

// Deterministic part of the choosePersonalFive score (game.js:1920), WITHOUT
// the Math.random()*10 idiosyncrasy term (unrecoverable after the fact).
// sentimental +1000, weapon bonus*10, tool +50, armor protection*5.
function keepScoreDet(def) {
  def = def || {};
  let s = 0;
  if (def.class === 'sentimental') s += 1000;
  if (def.weapon) s += (def.weapon.bonus || 0) * 10;
  if (def.tool) s += 50;
  if (def.armor) s += (def.armor.protection || 0) * 5;
  return s;
}

function itemRow(def, id, kept) {
  const c = classifyItem(def);
  return {
    id: id, name: def.name || id, kind: c.kind,
    hasWeapon: c.hasWeapon, hasTool: c.hasTool, hasArmor: c.hasArmor, sentimental: c.sentimental,
    weaponBonus: (def.weapon && def.weapon.bonus) || 0,
    protection: (def.armor && def.armor.protection) || 0,
    keepScoreDet: keepScoreDet(def), kept: !!kept,
  };
}

// Summarize one villager's dump row into counts. `kept` and `stashed` are
// arrays of itemRow; `equipped` is the villager's equipped map.
function summarizeVillager(v) {
  const kept = v.kept || [];
  const stashed = v.stashed || [];
  const eq = v.equipped || {};
  const countFlag = function (rows, flag) { return rows.filter(function (r) { return !!r[flag]; }).length; };
  return {
    weaponsKept: countFlag(kept, 'hasWeapon'),
    toolsKept: countFlag(kept, 'hasTool'),
    armorKept: countFlag(kept, 'hasArmor'),
    sentimentalKept: countFlag(kept, 'sentimental'),
    weaponsStashed: countFlag(stashed, 'hasWeapon'),
    toolsStashed: countFlag(stashed, 'hasTool'),
    armorStashed: countFlag(stashed, 'hasArmor'),
    hasMelee: !!(eq.melee && eq.melee.itemId),
    hasRanged: !!(eq.ranged && eq.ranged.itemId),
    armorPiecesEquipped: ['torso', 'legs', 'feet', 'head', 'hands'].filter(function (s) { return !!(eq[s] && eq[s].itemId); }).length,
  };
}

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

function personById(Game, id) {
  try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(id); if (p) return p; } } catch (e) {}
  const pools = [(Game.data || {}).villagers || [], (Game.data || {}).background_survivors || []];
  for (const pool of pools) {
    const hit = pool.find(function (p) { return p && p.id === id; });
    if (hit) return hit;
  }
  return null;
}

async function oneSeed(seed, label, anchor, itemsSha) {
  const { Game } = await loadGame({ seed: seed, mode: 'loadoutcensus-b-' + label, fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  const itemDefs = {};
  (Game.data.items || []).forEach(function (i) { if (i && i.id) itemDefs[i.id] = i; });
  const roster = (((Game.state || {}).village || {}).roster || []).slice();
  const scholarId = Game.villagerId || null;
  const villagers = [];
  const errors = [];
  for (const vid of roster) {
    try {
      const v = personById(Game, vid);
      if (!v) { errors.push('no-person:' + String(vid).slice(0, 12)); continue; }
      const poolIds = ((v.fullPool || []).slice());
      const keptIds = ((v.items || []).map(function (e) { return (e && (e.itemId || e.id)) || e; }).filter(Boolean));
      const stashedIds = ((v.stashed || []).map(function (e) { return (e && (e.itemId || e.id)) || e; }).filter(Boolean));
      const keptSet = {};
      keptIds.forEach(function (id) { keptSet[id] = true; });
      const pool = poolIds.map(function (id) { return itemRow(itemDefs[id] || {}, id, keptSet[id]); });
      const kept = keptIds.map(function (id) { return itemRow(itemDefs[id] || {}, id, true); });
      const stashed = stashedIds.map(function (id) { return itemRow(itemDefs[id] || {}, id, false); });
      const equipped = {};
      Object.keys(v.equipped || {}).forEach(function (slot) {
        const e = v.equipped[slot];
        if (!e) return;
        equipped[slot] = { itemId: (e.itemId || e.id || e), name: e.name || null };
      });
      const row = {
        id: v.id, name: v.name || v.displayName || v.id,
        occupation: v.occupationId || v.formerOccupation || null,
        temperament: ((v.personality || {}).temperament) || null,
        isScholar: v.id === scholarId,
        poolSize: poolIds.length, pool: pool, kept: kept, stashed: stashed, equipped: equipped,
      };
      row.summary = summarizeVillager(row);
      villagers.push(row);
    } catch (e) { errors.push('villager:' + String(e.message).slice(0, 80)); }
  }
  return {
    seed: seed, arm: 'loadoutcensus-b', label: label, anchorCommit: anchor, itemsSha: itemsSha,
    day: 0, rosterSize: roster.length, villagers: villagers, errors: errors,
  };
}

async function main() {
  const SEEDS = expandSeeds(process.env.SEEDS);
  const LABEL = process.env.LABEL || 'unlabeled';
  if (!SEEDS.length) { console.error('LOADOUTCENSUS STOP: SEEDS required.'); process.exit(2); }
  let anchor = 'unknown';
  try { anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  let itemsSha = 'unknown';
  try { itemsSha = execSync('git hash-object src/data/items.json', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-loadoutcensus-b-' + LABEL);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'loadoutcensus-b-s' + seed + '-' + LABEL + '.json');
    if (fs.existsSync(file)) { console.error('LOADOUTCENSUS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneSeed(seed, LABEL, anchor, itemsSha);
    const file = path.join(outDir, 'loadoutcensus-b-s' + seed + '-' + LABEL + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const n = out.villagers.length;
    const tot = function (f) { return out.villagers.reduce(function (a, v) { return a + (v.summary[f] || 0); }, 0); };
    console.log(JSON.stringify({
      seed: seed, label: LABEL, anchor: anchor, villagers: n,
      meanWeaponsKept: n ? +(tot('weaponsKept') / n).toFixed(2) : null,
      meanArmorKept: n ? +(tot('armorKept') / n).toFixed(2) : null,
      meanToolsKept: n ? +(tot('toolsKept') / n).toFixed(2) : null,
      equippedMelee: tot('hasMelee') + '/' + n, weaponsStashed: tot('weaponsStashed'),
      errors: out.errors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { classifyItem, keepScoreDet, itemRow, summarizeVillager, expandSeeds };
