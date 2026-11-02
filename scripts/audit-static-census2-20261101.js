#!/usr/bin/env node
// audit-static-census2-20261101.js — supplement: godpath membership,
// synergy requires_any/discovery, loot routes v2 (godpath gear, starter,
// regions full-text, show gifts), ability mention files.
// READ-ONLY.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const read = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return ''; } };

const abilities = load('src/data/abilities.json');
const items = load('src/data/items.json');
const synergies = load('src/data/synergies.json');
const godpaths = load('src/data/godpaths.json');
const regions = load('src/data/regions.json');

// --- godpath membership ---
const gpMember = {}; // ability id -> roles
const gpGear = {}; // item id -> roles
for (const [pk, pv] of Object.entries(godpaths.paths || {})) {
  const add = (id, role) => {
    if (!id) return;
    (gpMember[id] || (gpMember[id] = [])).push(`${pk}:${role}`);
  };
  const addGear = (id, role) => {
    if (!id) return;
    (gpGear[id] || (gpGear[id] = [])).push(`${pk}:${role}`);
  };
  add(pv.core, 'core');
  (pv.relevantGear || []).forEach(g => addGear(g, 'relevantGear'));
  for (const [sk, sv] of Object.entries(pv.subclasses || {})) {
    if (typeof sv !== 'object') continue;
    add(sv.payoff, `payoff:${sk}`);
    (sv.enablers || []).forEach(e => add(e, `enabler:${sk}`));
    add(sv.tie, `tie:${sk}`);
    (sv.capstoneItems || []).forEach(g => addGear(g, `capstone:${sk}`));
    (sv.deedSynergies || []).forEach(s => add(s, `deedSynergy:${sk}`));
  }
}

// --- synergy v2 ---
const syn2 = synergies.map(s => {
  const classify = (r) => {
    if (!r) return 'none';
    if (r.startsWith('tech:')) return 'tech';
    if (r.startsWith('skill:')) return 'skill';
    if (r.startsWith('item:')) return 'item';
    if (synergies.some(x => x.id === r)) return 'synergy';
    if (abilities.some(a => a.id === r)) return 'ability';
    return 'UNKNOWN';
  };
  const reqs = s.requires || null;
  const reqAny = s.requires_any || null;
  return {
    id: s.id,
    requires: reqs, requires_any: reqAny,
    reqClasses: reqs ? reqs.map(classify) : null,
    reqAnyClasses: reqAny ? reqAny.map(p => p.map(classify)) : null,
    discovery: s.discovery_method ? s.discovery_method.type : null,
    discoveryOrder: s.discovery_method ? (s.discovery_method.order || null) : null,
    minLevel: s.minLevel || null,
    modTargets: (s.modifiers || []).map(m => m.target),
  };
});

// --- ability mention files + memberships ---
const jsFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.js')) jsFiles.push(p);
  }
})(path.join(ROOT, 'src'));
const ab2 = abilities.map(a => {
  const files = jsFiles.filter(f => {
    try { const t = fs.readFileSync(f, 'utf8'); return t.includes(`'${a.id}'`) || t.includes(`"${a.id}"`); } catch (e) { return false; }
  }).map(f => path.relative(ROOT, f));
  const synMember = synergies.filter(s => {
    const all = [...(s.requires || []), ...((s.requires_any || []).flat())];
    return all.includes(a.id);
  }).map(s => s.id);
  return {
    id: a.id, pool: a.pool, unlock: (a.unlock && a.unlock.type) || null,
    skillId: a.skillId || null,
    godpath: gpMember[a.id] || [],
    synergyMemberOf: synMember,
    mentionFiles: files,
  };
});

// --- loot routes v2 ---
const regionText = JSON.stringify(regions);
const lt = items.filter(i => i.lootTier);
const loot2 = lt.map(i => {
  const routes = [];
  if ((gpGear[i.id] || []).length) routes.push('godpath-gear:' + gpGear[i.id].join(','));
  if (regionText.includes(`"${i.id}"`)) routes.push('regions-data');
  // starter: game.js starter takes weapon<=T2 non-alien + all<=T2 non-alien kinAgeOk
  if ((i.lootTier || 1) <= 2 && i.origin !== 'alien') routes.push('starter-eligible');
  return { id: i.id, tier: i.lootTier, routes2: routes };
});

// --- skillId teaching mentions ---
const skillMentions = {};
for (const f of jsFiles) {
  try {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of t.matchAll(/skillId['"]?\s*[:=]+\s*['"]([^'"]+)['"]/g)) {
      (skillMentions[m[1]] || (skillMentions[m[1]] = [])).push(path.relative(ROOT, f));
    }
  } catch (e) {}
}

console.log(JSON.stringify({ godpathAbilities: gpMember, godpathGear: gpGear, synergies2: syn2, abilities2: ab2, loot2, skillMentions }, null, 1));
