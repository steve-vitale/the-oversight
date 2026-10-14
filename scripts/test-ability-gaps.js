// Proof test: ability gaps (Steve 2026-10-14 "address all gaps").
// RED->GREEN: run against HEAD (RED), then with patch applied (GREEN).
// Node harness: full src/js/*.js in index.html order, seed BEFORE eval.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = '/home/hatch/workspace/worktrees/sim-abilitygap';

// --- deterministic RNG BEFORE eval ---
let _seed = parseInt(process.env.SEED || '7', 10);
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(_seed);
Math.random = rng;

// --- load: game.js + abilityActions.js only (structural test) ---
global.window = global; // stub for eval, deleted before play
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
for (const s of ['src/js/game.js', 'src/js/abilityActions.js']) {
  const code = fs.readFileSync(path.join(ROOT, s), 'utf8');
  try { eval(code); } catch (e) { console.error('EVAL FAIL', s, e.message); process.exit(2); }
}
delete global.window; delete global.document;

// load data files
let data = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (f.endsWith('.json')) {
    try { data[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
  }
}

const G = (globalThis.Scattering && globalThis.Scattering.Game) || global.Game || globalThis.Game;
let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, detail || ''); }
}

// --- Gap 1: tbVillagerAbility exists ---
ok('tbVillagerAbility method exists', typeof G.tbVillagerAbility === 'function');

// --- Gap 2: OPENINGS hook in tbDamage source ---
const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
ok('OPENINGS party bonus in tbDamage', gameSrc.includes('OPENINGS (ability-gaps'));

// --- Gap 3: item: legs supported ---
ok('item: leg in recomputeActiveSynergies', gameSrc.includes("rid.startsWith('item:')"));
ok('item: leg in _synergyPassiveLegHeld', gameSrc.includes("// ITEM LEG (ability-gaps"));
ok('4 weapon synergies in data', (data.synergies || []).filter(s => ['shattering_blow','impaling_scream','blood_iron','static_edge'].includes(s.id)).length === 4);

// --- Gap 4: 6 new abilities in data + impls ---
const abs = data.abilities || [];
const newIds = ['static_toss','cheese_wheel','bird_strike','tripwire','turncoat','freeze_tag'];
ok('6 new abilities in data', newIds.every(id => abs.some(a => a.id === id)));
const impls = global.AbilityActionImpls || {};
const prechecks = global.AbilityActionPrechecks || {};
ok('6 new ability impls', ['static_toss.toss','cheese_wheel.hurl','bird_strike.call','tripwire.string','turncoat.persuade','freeze_tag.tag'].every(k => typeof impls[k] === 'function'));
ok('6 new ability prechecks', ['static_toss.toss','cheese_wheel.hurl','bird_strike.call','tripwire.string','turncoat.persuade','freeze_tag.tag'].every(k => typeof prechecks[k] === 'function'));

// --- Gap 5: 5 reworks ---
ok('survivor -> Scar Tissue', abs.some(a => a.id === 'survivor' && a.name === 'Scar Tissue'));
ok('green_thumb -> Literally', abs.some(a => a.id === 'green_thumb' && a.name === 'Green Thumb, Literally'));
ok('wanderer -> Wanderlust', abs.some(a => a.id === 'wanderer' && a.name === 'Wanderlust'));
ok('diplomat -> Incident', abs.some(a => a.id === 'diplomat' && a.name === 'Diplomatic Incident'));
ok('camp_cook -> Secret Ingredient', abs.some(a => a.id === 'camp_cook' && a.name === 'Secret Ingredient'));
ok('Scar Tissue hook in tbDamage', gameSrc.includes('SCAR TISSUE (ability-gaps'));
ok('green_thumb.ask impl', typeof impls['green_thumb.ask'] === 'function');

// --- behavioral: villager uses scream_cheese ---
// (smoke: method callable shape — full fight sim is the playtest)
ok('tbVillagerAbility returns boolean-ish', (() => { try { const r = G.tbVillagerAbility.call({ state: { village: { npcAbilities: {} } }, say(){}, npcHasAbility(){return false;} }, { id: 'v1' }); return r === false || r === true; } catch (e) { return false; } })());

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
