#!/usr/bin/env node
// Proof test: establishment r31 (2026-10-24) — SPECIALTIES.preserver +
// TECHNIQUE_GRANTS.preserve match the REAL occupation pool.
// The old tables were written against an imagined pool: 'park ranger' and
// 'smoker' matched no real occupation, and the food occupations
// 'hunting guide'/'fishing guide'/'sailor'/'butcher'/'line cook'/'rancher'/
// 'beekeeper'/'mushroom grower' were unmapped — 47/48 villagers across 4
// establishment seeds read preserver 0 and every smoke rack ran blind.
// RED: run with --source <pristine food.js> (e.g. from `git show HEAD:`).
// GREEN: default (current worktree source) + live-game checks.
// Usage: node scripts/test-r31-preserver-table-20261024.js [--source path]
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
  return Array.from(occs);
}

// ---- extract tables from food.js source text (version-agnostic) ----
function extractTables(src) {
  const preserver = [];
  const mBlock = src.match(/preserver:\s*\[([\s\S]*?)\],\s*\n\s*spotter/);
  if (mBlock) {
    const re = /\{\s*m:\s*'([^']+)'\s*,\s*s:\s*(\d+)\s*\}/g;
    let m;
    while ((m = re.exec(mBlock[1]))) preserver.push({ m: m[1], s: parseInt(m[2], 10) });
  }
  const grants = [];
  const mGrant = src.match(/preserve:\s*\[([^\]]*)\]/);
  if (mGrant) {
    const re = /'([^']+)'/g;
    let m;
    while ((m = re.exec(mGrant[1]))) grants.push(m[1]);
  }
  return { preserver, grants };
}
function tableSkill(table, occ) {
  const o = String(occ || '').toLowerCase();
  let skill = 0;
  for (const s of table) { if (o.includes(s.m)) skill = Math.max(skill, s.s); }
  return skill;
}

async function main() {
  const argv = process.argv.slice(2);
  const srcIdx = argv.indexOf('--source');
  const srcPath = srcIdx >= 0 ? argv[srcIdx + 1] : path.join(ROOT, 'src/js/food.js');
  const src = fs.readFileSync(srcPath, 'utf8');
  const { preserver, grants } = extractTables(src);
  const occs = realOccupations();
  console.log('occupations in pool: ' + occs.length + '; preserver rows: ' + preserver.length + '; preserve grants: ' + grants.length);

  console.log('== table values (new design) ==');
  check('fisherman -> 3', tableSkill(preserver, 'Fisherman') === 3);
  check('fishing guide -> 2', tableSkill(preserver, 'Fishing Guide') === 2);
  check('hunting guide -> 2', tableSkill(preserver, 'Hunting Guide') === 2);
  check('sailor -> 2', tableSkill(preserver, 'Sailor') === 2);
  check('chef -> 2', tableSkill(preserver, 'Chef') === 2);
  check('line cook -> 2', tableSkill(preserver, 'Line Cook') === 2);
  check('butcher -> 2', tableSkill(preserver, 'Butcher') === 2);
  check('farmer -> 2', tableSkill(preserver, 'Farmer') === 2);
  check('rancher -> 2', tableSkill(preserver, 'Rancher') === 2);
  check('beekeeper -> 1', tableSkill(preserver, 'Beekeeper') === 1);
  check('mushroom grower -> 1', tableSkill(preserver, 'Mushroom Grower') === 1);
  check('truck driver -> 0 (regression)', tableSkill(preserver, 'Truck Driver') === 0);
  check('street artist -> 0 (regression)', tableSkill(preserver, 'Street Artist') === 0);
  check('vintner -> 0 (not a preserver)', tableSkill(preserver, 'Vintner') === 0);

  console.log('== ghost audit: every match string must hit >=1 real occupation ==');
  for (const row of preserver) {
    const hits = occs.filter(o => o.toLowerCase().includes(row.m));
    check(`preserver '${row.m}' matches >=1 occupation (${hits.length})`, hits.length >= 1, 'ghost: ' + row.m);
  }
  for (const g of grants) {
    const hits = occs.filter(o => o.toLowerCase().includes(g));
    check(`preserve grant '${g}' matches >=1 occupation (${hits.length})`, hits.length >= 1, 'ghost: ' + g);
  }

  console.log('== grant coverage: real food occupations grant the preserve technique ==');
  for (const o of ['Sailor', 'Fishing Guide', 'Hunting Guide', 'Butcher', 'Line Cook', 'Rancher', 'Beekeeper']) {
    const ol = o.toLowerCase();
    check(`grant covers '${o}'`, grants.some(g => ol.includes(g)), 'missing');
  }

  // ---- live-game integration (current source only) ----
  if (srcIdx < 0) {
    console.log('== live game: Game.specialistSkill ==');
    const { loadGame } = require('./sim-harness');
    const { Game } = await loadGame({ seed: 7, mode: 'mvc' });
    check('live: Hunting Guide -> 2', Game.specialistSkill({ formerOccupation: 'Hunting Guide' }, 'preserver') === 2);
    check('live: Sailor -> 2', Game.specialistSkill({ formerOccupation: 'Sailor' }, 'preserver') === 2);
    check('live: Fisherman -> 3', Game.specialistSkill({ formerOccupation: 'Fisherman' }, 'preserver') === 3);
    check('live: Beekeeper -> 1', Game.specialistSkill({ formerOccupation: 'Beekeeper' }, 'preserver') === 1);
    check('live: Truck Driver -> 0', Game.specialistSkill({ formerOccupation: 'Truck Driver' }, 'preserver') === 0);
    // (player technique grants: techniques() reads the scholar's occupation
    // from the static data table with the same occ.includes(g) matching the
    // table-level ghost/coverage audit above pins; application logic
    // unchanged, so no separate live assertion.)
  }

  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
