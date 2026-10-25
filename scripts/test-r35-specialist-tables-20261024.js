#!/usr/bin/env node
// Proof test: establishment r35 (2026-10-24) — the REMAINING SPECIALTIES
// tables (butcher/cook/spotter/builder) + TECHNIQUE_GRANTS.clean/cook match
// the REAL occupation pool. r31 fixed preserver/preserve the same way;
// r31/r32 documented this class as still infecting the other tables:
// 'hunter', 'line cook / hunter', 'veterinary tech', 'sushi chef',
// 'park ranger', 'cafeteria manager', 'botanist', 'hiker', 'herbalist',
// 'construction worker', 'engineer', 'camper', 'scout' matched NO real
// occupation, while real food occupations (hunting guide, fishing guide,
// sailor, rancher, line cook, wild food forager, arborist, florist,
// mushroom grower, mason, roofer) were unmapped — so villagers who
// should count as butchers/cooks/spotters/builders read skill 0.
// RED: run with --source <pristine food.js> (e.g. from `git show HEAD:`).
// GREEN: default (current worktree source) + live-game checks.
// Usage: node scripts/test-r35-specialist-tables-20261024.js [--source path]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log('  ok  ' + name); }
  else { failures++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- the real occupation pool (walk src/data like the game does) ----
// PLUS the drifter channel: membership.js genApplicant() generates
// applicants from a hardcoded list, not from JSON — 'hunter' lives there
// (r35 census: seed 124's Tatsuo arrived as a drifter hunter). The JSON
// walk alone called 'hunter' a ghost; the live roster proved otherwise.
// Any future ghost audit must include this list.
function realOccupations() {
  const occs = new Set();
  const dir = path.join(ROOT, 'src/data');
  function walk(o) {
    if (Array.isArray(o)) { for (const v of o) walk(v); return; }
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        if ((k === 'formerOccupation' || k === 'occupation') && typeof o[k] === 'string') occs.add(o[k]);
        walk(o[k]);
      }
    }
  }
  for (const f of fs.readdirSync(dir)) {
    if (!/\.json$/.test(f)) continue;
    try { walk(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) {}
  }
  for (const o of ['cook', 'carpenter', 'nurse', 'farmer', 'mechanic', 'teacher', 'hunter']) occs.add(o);
  return Array.from(occs);
}

// ---- extract tables from food.js source text (version-agnostic) ----
function extractTables(src) {
  const tables = {};
  const specBlock = src.match(/const SPECIALTIES = \{([\s\S]*?)\n  \};/);
  const block = specBlock ? specBlock[1] : '';
  for (const task of ['butcher', 'cook', 'preserver', 'spotter', 'builder']) {
    const m = block.match(new RegExp(task + ':\\s*\\[([\\s\\S]*?)\\],'));
    const rows = [];
    if (m) {
      const re = /\{\s*m:\s*'([^']+)'\s*,\s*s:\s*(\d+)\s*\}/g;
      let mm;
      while ((mm = re.exec(m[1]))) rows.push({ m: mm[1], s: parseInt(mm[2], 10) });
    }
    tables[task] = rows;
  }
  const grants = {};
  const tg = src.match(/const TECHNIQUE_GRANTS = \{([\s\S]*?)\n  \};/);
  const tgBlock = tg ? tg[1] : '';
  for (const g of ['clean', 'cook', 'preserve']) {
    const m = tgBlock.match(new RegExp(g + ':\\s*\\[([^\\]]*)\\]'));
    const list = [];
    if (m) {
      const re = /'([^']+)'/g;
      let mm;
      while ((mm = re.exec(m[1]))) list.push(mm[1]);
    }
    grants[g] = list;
  }
  return { tables, grants };
}
function tableSkill(table, occ) {
  const o = String(occ || '').toLowerCase();
  let skill = 0;
  for (const s of table) { if (o.includes(s.m.toLowerCase())) skill = Math.max(skill, s.s); }
  return skill;
}
function coveredCount(table, occs) {
  return occs.filter(o => table.some(r => o.toLowerCase().includes(r.m.toLowerCase()))).length;
}

async function main() {
  const argv = process.argv.slice(2);
  const srcIdx = argv.indexOf('--source');
  const srcPath = srcIdx >= 0 ? argv[srcIdx + 1] : path.join(ROOT, 'src/js/food.js');
  const src = fs.readFileSync(srcPath, 'utf8');
  const { tables, grants } = extractTables(src);
  const occs = realOccupations();
  console.log('occupations in pool: ' + occs.length);
  for (const t of ['butcher', 'cook', 'spotter', 'builder']) {
    console.log('  ' + t + ' rows: ' + tables[t].length + ', covered occupations: ' + coveredCount(tables[t], occs));
  }

  console.log('== new table values ==');
  // butcher: ghosts out, real food trades in
  check('butcher: Hunting Guide -> 3', tableSkill(tables.butcher, 'Hunting Guide') === 3);
  check('butcher: Fishing Guide -> 2', tableSkill(tables.butcher, 'Fishing Guide') === 2);
  check('butcher: Line Cook -> 2', tableSkill(tables.butcher, 'Line Cook') === 2);
  check('butcher: Rancher -> 2', tableSkill(tables.butcher, 'Rancher') === 2);
  check('butcher: Sailor -> 2', tableSkill(tables.butcher, 'Sailor') === 2);
  // cook: butcher joins (mirrors villagerCompetence cook 1.4 list)
  check('cook: Butcher -> 2', tableSkill(tables.cook, 'Butcher') === 2);
  // spotter: plant trades in
  check('spotter: Wild Food Forager -> 3', tableSkill(tables.spotter, 'Wild Food Forager') === 3);
  check('spotter: Arborist -> 2', tableSkill(tables.spotter, 'Arborist') === 2);
  check('spotter: Florist -> 2', tableSkill(tables.spotter, 'Florist') === 2);
  check('spotter: Mushroom Grower -> 1', tableSkill(tables.spotter, 'Mushroom Grower') === 1);
  // builder: construction trades in
  check('builder: Mason -> 2', tableSkill(tables.builder, 'Mason') === 2);
  check('builder: Roofer -> 2', tableSkill(tables.builder, 'Roofer') === 2);

  console.log('== no regressions: previously-covered occupations keep skill ==');
  check('butcher: Hunter -> 3 (drifter channel, r35 catch)', tableSkill(tables.butcher, 'Hunter') === 3);
  check('butcher: Butcher -> 3', tableSkill(tables.butcher, 'Butcher') === 3);
  check('butcher: Veterinarian -> 3', tableSkill(tables.butcher, 'Veterinarian') === 3);
  check('butcher: Fisherman -> 2', tableSkill(tables.butcher, 'Fisherman') === 2);
  check('butcher: Chef -> 2', tableSkill(tables.butcher, 'Chef') === 2);
  check('butcher: Farmer -> 2', tableSkill(tables.butcher, 'Farmer') === 2);
  check('cook: Chef -> 3', tableSkill(tables.cook, 'Chef') === 3);
  check('cook: Line Cook -> 2', tableSkill(tables.cook, 'Line Cook') === 2);
  check('cook: Baker -> 2', tableSkill(tables.cook, 'Baker') === 2);
  check('spotter: Community Gardener -> 2', tableSkill(tables.spotter, 'Community Gardener') === 2);
  check('spotter: Farmer -> 2', tableSkill(tables.spotter, 'Farmer') === 2);
  check('builder: Carpenter -> 3', tableSkill(tables.builder, 'Carpenter') === 3);
  check('builder: Mechanic -> 1', tableSkill(tables.builder, 'Mechanic') === 1);
  check('preserver untouched: Fisherman -> 3 (r31)', tableSkill(tables.preserver, 'Fisherman') === 3);
  check('preserver untouched: Hunting Guide -> 2 (r31)', tableSkill(tables.preserver, 'Hunting Guide') === 2);

  console.log('== ghost audit: every match string must hit >=1 real occupation ==');
  for (const t of ['butcher', 'cook', 'spotter', 'builder']) {
    for (const row of tables[t]) {
      const hits = occs.filter(o => o.toLowerCase().includes(row.m.toLowerCase()));
      check(t + " '" + row.m + "' matches >=1 occupation (" + hits.length + ')', hits.length >= 1, 'ghost: ' + row.m);
    }
  }
  for (const g of ['clean', 'cook']) {
    for (const s of grants[g]) {
      const hits = occs.filter(o => o.toLowerCase().includes(s.toLowerCase()));
      check('grant ' + g + " '" + s + "' matches >=1 occupation (" + hits.length + ')', hits.length >= 1, 'ghost: ' + s);
    }
  }

  console.log('== grant coverage mirrors the tables ==');
  for (const o of ['Hunting Guide', 'Fishing Guide', 'Sailor', 'Rancher', 'Line Cook']) {
    const ol = o.toLowerCase();
    check("clean grant covers '" + o + "'", grants.clean.some(g => ol.includes(g.toLowerCase())), 'missing');
  }
  check("cook grant covers 'Butcher'", grants.cook.some(g => 'butcher'.includes(g.toLowerCase())));
  check("clean grant keeps 'hunter' (drifter channel, not a ghost)", grants.clean.some(g => g === 'hunter'));
  check("cook grant has no 'camper/scout/hiker' ghosts", !grants.cook.some(g => ['camper', 'scout', 'hiker'].includes(g)));

  console.log('== coverage floors ==');
  check('butcher covers >=10 occupations', coveredCount(tables.butcher, occs) >= 10, 'got ' + coveredCount(tables.butcher, occs));
  check('cook covers >=4 occupations', coveredCount(tables.cook, occs) >= 4, 'got ' + coveredCount(tables.cook, occs));
  check('spotter covers >=6 occupations', coveredCount(tables.spotter, occs) >= 6, 'got ' + coveredCount(tables.spotter, occs));
  check('builder covers >=4 occupations', coveredCount(tables.builder, occs) >= 4, 'got ' + coveredCount(tables.builder, occs));

  // ---- live-game integration (current source only) ----
  if (srcIdx < 0) {
    console.log('== live game: Game.specialistSkill ==');
    const { loadGame } = require('./sim-harness');
    const { Game } = await loadGame({ seed: 7, mode: 'mvc' });
    check('live: Hunter butcher -> 3 (drifter channel)', Game.specialistSkill({ formerOccupation: 'hunter' }, 'butcher') === 3);
    check('live: Hunting Guide butcher -> 3', Game.specialistSkill({ formerOccupation: 'Hunting Guide' }, 'butcher') === 3);
    check('live: Fishing Guide butcher -> 2', Game.specialistSkill({ formerOccupation: 'Fishing Guide' }, 'butcher') === 2);
    check('live: Wild Food Forager spotter -> 3', Game.specialistSkill({ formerOccupation: 'Wild Food Forager' }, 'spotter') === 3);
    check('live: Arborist spotter -> 2', Game.specialistSkill({ formerOccupation: 'Arborist' }, 'spotter') === 2);
    check('live: Mason builder -> 2', Game.specialistSkill({ formerOccupation: 'Mason' }, 'builder') === 2);
    check('live: Roofer builder -> 2', Game.specialistSkill({ formerOccupation: 'Roofer' }, 'builder') === 2);
    check('live: Butcher cook -> 2', Game.specialistSkill({ formerOccupation: 'Butcher' }, 'cook') === 2);
    check('live: Truck Driver all -> 0', ['butcher', 'cook', 'spotter', 'builder'].every(t => Game.specialistSkill({ formerOccupation: 'Truck Driver' }, t) === 0));
  }

  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
