#!/usr/bin/env node
// Proof test: establishment r32 (2026-10-24) — builder / wood / stone keyword
// tables vs the REAL occupation pool (src/data/characterGen.json, 78 entries).
// R31 proved this class of bug for preserver (ghost 'park ranger'/'smoker',
// 47/48 villagers at preserver 0). This test audits the sibling tables BEFORE
// any fix, so a fix changes the test in the same commit (green-list rule).
// Matching is substring (occ.includes(word)), exactly like
// specialistSkill (food.js) and villagerCompetence's has() (game.js).
// Usage: node scripts/test-r32-builder-table-20261024.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log('  ok  ' + name); }
  else { failures++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function poolNames() {
  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
  return (cg.occupations || []).map(o => String(o.name || '').toLowerCase());
}
function matchesPool(word, names) {
  // An entry matches iff some real occupation name contains it as a substring
  // (the game's own matching rule), or equals it.
  return names.some(n => n.includes(word));
}

async function main() {
  const names = poolNames();
  console.log('occupations in pool: ' + names.length);
  const food = fs.readFileSync(path.join(ROOT, 'src/js/food.js'), 'utf8');
  const game = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');

  // ---- SPECIALTIES.builder (food.js) ----
  const bBlock = food.match(/builder:\s*\[([\s\S]*?)\],\s*\n\s*\}/);
  const builderRows = [];
  if (bBlock) {
    const re = /\{\s*m:\s*'([^']+)'\s*,\s*s:\s*(\d+)\s*\}/g;
    let m;
    while ((m = re.exec(bBlock[1]))) builderRows.push({ m: m[1], s: parseInt(m[2], 10) });
  }
  console.log('== SPECIALTIES.builder rows: ' + builderRows.map(r => r.m + ':' + r.s).join(', ') + ' ==');
  for (const r of builderRows) {
    const hit = matchesPool(r.m, names);
    console.log(`  ${hit ? 'MATCH ' : 'GHOST '} builder '${r.m}' (s=${r.s})`);
  }
  check('builder: carpenter matches pool', matchesPool('carpenter', names));
  check('builder: mechanic matches pool', matchesPool('mechanic', names));
  check('builder: construction worker is a GHOST (documents r31-class blank)',
    !matchesPool('construction worker', names));
  check('builder: engineer is a GHOST (documents r31-class blank)',
    !matchesPool('engineer', names));

  // ---- villagerCompetence wood/stone word lists (game.js) ----
  const woodBlock = game.match(/task === 'wood'\) \{([\s\S]*?)\} else if \(task === 'stone'\)/);
  const stoneBlock = game.match(/task === 'stone'\) \{([\s\S]*?)\} else if \(task === 'water'\)/);
  function words(block) {
    if (!block) return [];
    const out = [];
    const re = /'([^']+)'/g;
    let m;
    while ((m = re.exec(block[1]))) out.push(m[1]);
    return out;
  }
  const woodWords = words(woodBlock);
  const stoneWords = words(stoneBlock);
  console.log('== wood competence words: ' + woodWords.join(', ') + ' ==');
  for (const w of woodWords) console.log(`  ${matchesPool(w, names) ? 'MATCH ' : 'GHOST '} wood '${w}'`);
  console.log('== stone competence words: ' + stoneWords.join(', ') + ' ==');
  for (const w of stoneWords) console.log(`  ${matchesPool(w, names) ? 'MATCH ' : 'GHOST '} stone '${w}'`);
  check('wood: carpenter matches pool', matchesPool('carpenter', names));
  check('wood: farmer matches pool', matchesPool('farmer', names));
  check('wood: firefighter matches pool', matchesPool('firefighter', names));
  check('wood: lumberjack is a GHOST', !matchesPool('lumberjack', names));
  check('wood: logger is a GHOST', !matchesPool('logger', names));
  check('wood: builder is a GHOST', !matchesPool('builder', names));
  check('wood: handyman is a GHOST', !matchesPool('handyman', names));
  check('stone: mason matches pool', matchesPool('mason', names));
  check('stone: carpenter matches pool', matchesPool('carpenter', names));
  check('stone: stonecutter is a GHOST', !matchesPool('stonecutter', names));
  check('stone: quarry is a GHOST', !matchesPool('quarry', names));

  // ---- live-game cross-check: builder skill on real census occupations ----
  // (Uses the same substring rule; a carpenter villager must read >= 2.)
  const tableSkill = (occ) => {
    const o = String(occ || '').toLowerCase();
    let skill = 0;
    for (const s of builderRows) { if (o.includes(s.m)) skill = Math.max(skill, s.s); }
    return skill;
  };
  check('live-rule: Carpenter -> builder >= 2', tableSkill('Carpenter') >= 2);
  check('live-rule: Mechanic -> builder >= 1', tableSkill('Mechanic') >= 1);
  check('live-rule: Mason -> builder 0 (mason is stone, not builder table)',
    tableSkill('Mason') === 0);

  console.log(failures === 0 ? 'ALL GREEN (ghost audit documented)' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
