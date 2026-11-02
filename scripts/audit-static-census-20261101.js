#!/usr/bin/env node
// audit-static-census-20261101.js — static census for the loot/abilities
// efficacy audit. READ-ONLY: reads data + src, prints JSON tables.
// No game changes, no harness load.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const abilities = load('src/data/abilities.json');
const items = load('src/data/items.json');
const synergies = load('src/data/synergies.json');
const reward = load('src/data/reward-economy.json');
const recipes = load('src/data/recipes.json');
const regions = load('src/data/regions.json');

const ff = read('src/js/fieldFights.js');
const gp = read('src/js/godpath.js');
const aa = read('src/js/abilityActions.js');
const allSrc = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.js')) allSrc.push(p);
  }
})(path.join(ROOT, 'src'));
const corpus = allSrc.map(f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } }).join('\n');
const corpusNoItems = allSrc.filter(f => !f.endsWith(path.join('data', 'items.json')))
  .map(f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } }).join('\n')
  + read('index.html');

// --- ability code paths ---
const fieldIds = [...gp.matchAll(/FIELD_IDS\s*=\s*\[([^\]]*)\]/gs)].flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
const fieldKit = [...gp.matchAll(/FIELD_KIT\s*=\s*\[([^\]]*)\]/gs)].flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
const fieldSet = new Set([...fieldIds, ...fieldKit]);
const vHasAbs = new Set([...ff.matchAll(/vHasAb\('([^']+)'\)/g)].map(m => m[1]));
// useAbility action implementations: action ids named in abilityActions.js
const actionImpls = new Set([...aa.matchAll(/'([a-z_0-9]+)'\s*:/g)].map(m => m[1]));

const abRows = abilities.map(a => {
  const actions = a.actions || [];
  const actionIds = actions.map(x => x.id || x.action || x.name).filter(Boolean);
  const implHits = actionIds.filter(id => aa.includes(`'${id}'`) || aa.includes(`"${id}"`));
  const paths = [];
  if (vHasAbs.has(a.id)) paths.push('field-vHasAb');
  if (fieldSet.has(a.id)) paths.push('field-kit');
  if (actions.length) paths.push(actions.length === implHits.length && implHits.length ? 'useAbility-impl' : 'useAbility-data');
  if ((a.modifiers || []).length) paths.push('passive-mod');
  if (corpus.includes(`'${a.id}'`) || corpus.includes(`"${a.id}"`)) paths.push('referenced');
  return {
    id: a.id, pool: a.pool, slotRole: a.slotRole, role: a.role,
    unlock: (a.unlock && a.unlock.type) || null, skillId: a.skillId || null,
    nActions: actions.length, actionIds, implHits: implHits.length,
    nMods: (a.modifiers || []).length,
    modTargets: (a.modifiers || []).map(m => m.target),
    synergyHints: a.synergyHints || [],
    paths: [...new Set(paths)],
  };
});

// --- synergy census ---
const abById = {};
abilities.forEach(a => { abById[a.id] = a; });
const syRows = synergies.map(s => {
  const req = s.requires || null;
  const members = Array.isArray(req) ? req : [];
  return {
    id: s.id, requires: req, minLevel: s.minLevel || null,
    membersExist: members.map(m => !!abById[m]),
    memberPaths: members.map(m => {
      const r = abRows.find(x => x.id === m);
      return r ? r.paths : ['MISSING-ABILITY'];
    }),
    modTargets: (s.modifiers || []).map(m => m.target),
    flags: s.flags || [],
  };
});

// --- loot route census ---
const regionList = Array.isArray(regions) ? regions : (regions.regions || Object.values(regions));
const scavengeIds = new Set();
for (const r of regionList) {
  const sc = ((r.people || {}).scavenge) || [];
  for (const s of sc) if (s.id) scavengeIds.add(s.id);
}
const recipeOutputs = new Set(recipes.map(r => r.output || r.result || r.id).filter(Boolean));
const killByTier = {}; const extraByTier = {};
for (const [t, arr] of Object.entries(reward.killItems || {})) killByTier[t] = new Set(arr);
for (const [t, arr] of Object.entries(reward.extraItems || {})) extraByTier[t] = new Set(arr);
const tradeIds = new Set();
try {
  const tr = reward.trade || {};
  const walkT = (x) => {
    if (Array.isArray(x)) x.forEach(walkT);
    else if (x && typeof x === 'object') Object.values(x).forEach(walkT);
    else if (typeof x === 'string') tradeIds.add(x);
  };
  walkT(tr);
} catch (e) {}
const lt = items.filter(i => i.lootTier);
const lootRows = lt.map(i => {
  const t = i.lootTier;
  const routes = [];
  if (i.origin === 'alien') routes.push('alien-origin');
  if ((killByTier[t] || new Set()).has(i.id)) routes.push('kill');
  if ((extraByTier[t] || new Set()).has(i.id)) routes.push('prize');
  if (scavengeIds.has(i.id)) routes.push('ruin-scavenge');
  if (recipeOutputs.has(i.id)) routes.push('craft');
  if (tradeIds.has(i.id)) routes.push('trade');
  const referenced = corpusNoItems.includes(i.id);
  return {
    id: i.id, tier: t, klass: i.class, origin: i.origin || null,
    findable: i.findable === undefined ? null : !!i.findable,
    slot: i.slot || null,
    weaponBonus: i.weapon ? i.weapon.bonus : null,
    weaponType: i.weapon ? i.weapon.type : null,
    armorProt: i.armor ? i.armor.protection : null,
    damage: i.damage || null, kg: i.kg || null,
    routes, referenced,
  };
});

// --- tier stats ---
const byTier = {};
for (const r of lootRows) {
  const b = byTier[r.tier] || (byTier[r.tier] = { n: 0, weapons: [], armors: [], classes: {}, routes: {} });
  b.n++;
  if (r.weaponBonus != null) b.weapons.push(r.weaponBonus);
  if (r.armorProt != null) b.armors.push(r.armorProt);
  b.classes[r.klass] = (b.classes[r.klass] || 0) + 1;
  for (const rt of r.routes) b.routes[rt] = (b.routes[rt] || 0) + 1;
}
const med = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
for (const t of Object.keys(byTier)) {
  const b = byTier[t];
  b.weaponBonus = { min: Math.min(...b.weapons), max: Math.max(...b.weapons), med: med(b.weapons), n: b.weapons.length };
  b.armorProt = { min: Math.min(...b.armors), max: Math.max(...b.armors), med: med(b.armors), n: b.armors.length };
  delete b.weapons; delete b.armors;
}

console.log(JSON.stringify({
  meta: { abilities: abilities.length, lootTier: lt.length, synergies: synergies.length, fieldIds: fieldIds.length, fieldKit: fieldKit.length, vHasAbIds: vHasAbs.size },
  abilityPathCounts: (() => {
    const c = {};
    for (const r of abRows) for (const p of r.paths) c[p] = (c[p] || 0) + 1;
    c.noPath = abRows.filter(r => !r.paths.length || (r.paths.length === 1 && r.paths[0] === 'referenced')).length;
    return c;
  })(),
  abilities: abRows,
  synergies: syRows,
  loot: lootRows,
  tierStats: byTier,
  unreachable: lootRows.filter(r => !r.referenced).map(r => r.id),
}, null, 1));
