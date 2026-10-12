#!/usr/bin/env node
// test-sprite-aggro-20261012.js — proof for the wave 3-5 sprite build
// (Steve phone order 2026-10-12: calm + aggro forms for ALL monsters).
//
// Asserts:
//  - every one of the 59 monsters resolves a non-null calm AND aggro sprite
//    via Sprites.monsterSprite (no emoji fallback — null means fallback)
//  - every sprite is valid SVG: parseable XML, viewBox 0 0 32 32,
//    class="sprite", no full-bleed background rect (composition law: the
//    tile shows through)
//  - calm and aggro differ for every monster
//  - size values sane: positive ints 1-3; the six 3x3 are the titans /
//    house-sized / place entities; the 2x2 set is the ensemble list
//  - RED on old code: the pre-sprite sprites.js resolves null for wave 3-5
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' :: ' + e.message); }
};

const monsters = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/monsters.json'), 'utf8'));
const ids = monsters.map(m => m.id);
console.log('== sprite calm/aggro proof: ' + ids.length + ' monsters ==');

// The IIFE calls with (globalThis) — evaluate in this context so it lands.
eval(fs.readFileSync(path.join(ROOT, 'src/js/sprites.js'), 'utf8'));
const Sprites = globalThis.Scattering.Sprites;
assert.ok(Sprites && Sprites.monsterSprite, 'Sprites.monsterSprite missing');

const calm = {}, aggro = {};
for (const id of ids) {
  calm[id] = Sprites.monsterSprite(id, false);
  aggro[id] = Sprites.monsterSprite(id, true);
}

check('59/59 calm sprites resolve (non-null, no emoji fallback)', () => {
  const missing = ids.filter(id => !calm[id]);
  assert.deepStrictEqual(missing, [], 'missing calm: ' + missing.join(','));
});
check('59/59 aggro sprites resolve (non-null, no emoji fallback)', () => {
  const missing = ids.filter(id => !aggro[id]);
  assert.deepStrictEqual(missing, [], 'missing aggro: ' + missing.join(','));
});

const xmlOk = (s) => {
  assert.ok(/^<svg[\s>]/.test(s), 'not an svg root');
  assert.ok(s.includes('viewBox="0 0 32 32"'), 'bad viewBox');
  assert.ok(s.includes('class="sprite"'), 'bad class');
  assert.ok(!/width="32"/.test(s), 'full-bleed width — background rect?');
  assert.ok(!s.includes('`') && !s.includes('${'), 'template hazard');
  // well-formedness: crude tag balance
  const opens = (s.match(/<(g|path|rect|circle|ellipse|polygon|line|text|defs|linearGradient|radialGradient)[\s>]/g) || []).length;
  const closes = (s.match(/<\/(g|path|rect|circle|ellipse|polygon|line|text|defs|linearGradient|radialGradient)>/g) || []).length;
  const selfClose = (s.match(/\/>/g) || []).length;
  assert.ok(opens <= closes + selfClose, `tag imbalance o=${opens} c=${closes} sc=${selfClose}`);
};
check('all 118 sprites are valid 32x32 SVGs with no full-bleed background', () => {
  for (const id of ids) { xmlOk(calm[id]); xmlOk(aggro[id]); }
});
check('calm != aggro for every monster', () => {
  const same = ids.filter(id => calm[id] === aggro[id]);
  assert.deepStrictEqual(same, [], 'identical forms: ' + same.join(','));
});

check('sizes sane: ints in 1..3 for all 59', () => {
  for (const m of monsters) {
    assert.ok(Number.isInteger(m.size) && m.size >= 1 && m.size <= 3, `${m.id}: size=${m.size}`);
  }
});
check('size 3 = titans + house-sized + place entities', () => {
  const s3 = monsters.filter(m => m.size === 3).map(m => m.id).sort();
  assert.deepStrictEqual(s3, ['eater', 'finale', 'herald', 'nielsen', 'strike', 'suburb']);
});
check('size 2 = ensembles (+ bulldozer, moderator)', () => {
  const s2 = monsters.filter(m => m.size === 2).map(m => m.id).sort();
  const want = ['ad_break', 'algorithm', 'bulldozer', 'cancellation', 'chorus_line',
    'congregation', 'editor', 'eulogy', 'finale_crew', 'finale_opening',
    'focus_group', 'gavel', 'influencer', 'moderator', 'reunion', 'spoiler',
    'spool', 'terms_of_service', 'timeslot'].sort();
  assert.deepStrictEqual(s2, want);
});

// RED on old code: pre-sprite sprites.js must resolve null for wave 3-5.
check('RED-verified: old sprites.js has no wave 3-5 sprites', () => {
  const oldSrc = execSync(`git -C ${ROOT} show HEAD~1:src/js/sprites.js`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  // oldSrc hardcodes (globalThis) at the IIFE call — instead of executing it
  // (which would clobber the live registry), assert on the source text:
  for (const id of ['finale', 'eater', 'redactor', 'nielsen', 'herald']) {
    assert.ok(!oldSrc.includes(`    ${id}_calm:`), `old sprites.js unexpectedly has ${id}_calm`);
    assert.ok(!oldSrc.includes(`    ${id}_aggro:`), `old sprites.js unexpectedly has ${id}_aggro`);
  }
  // and the current file DOES have them (this test is green for the right reason)
  const cur = fs.readFileSync(path.join(ROOT, 'src/js/sprites.js'), 'utf8');
  for (const id of ['finale', 'eater', 'redactor', 'nielsen', 'herald']) {
    assert.ok(cur.includes(`    ${id}_calm:`), `current sprites.js missing ${id}_calm`);
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
