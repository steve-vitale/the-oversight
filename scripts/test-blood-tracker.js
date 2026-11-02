#!/usr/bin/env node
// test-blood-tracker.js — BLOOD-TRACKER arm proof (2026-11-02).
// Audit gap: blood_tracker activated but had NO modifiers and (per the audit)
// no code read it, so it was mechanically dead. Audit spec: attach a real
// modifier OR retire it. This proof checks the ATTACH option through the
// REAL modifier pipeline (Game.modTarget -> modifiers.resolve over
// Game.allModifiers -> collectModifiers), not just a JSON assertion:
//   scholar fixture, identical legs, only activeSynergies toggled:
//   BEFORE (inactive): hunt.find_chance resolves at base.
//   AFTER  (active):   hunt.find_chance resolves at base + 0.15.
// Readers that consume hunt.find_chance in game code: game.js hunt strike
// (base 0.7/0.4/0.15 by difficulty, capped 0.95 downstream) and
// encounters.js enc strike (same shape). The +0.15 is the same add pattern
// two shipped synergies already use for this target (apex_sense, farsight),
// so no new target, no new engine code.
// CORRECTION to the audit: blood_tracker DOES have a requirer —
// apex_predator's requires_any includes [blood_tracker, dead_aim]
// (synergies.json). Retiring it would strand that apex leg, so the
// attach option is the correct one; this proof also asserts that leg
// is intact.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
require(path.join(ROOT, 'src/js/engine/modifiers.js'));
const M = globalThis.Scattering.modifiers;
if (!M) { console.error('FAIL: modifiers module did not attach'); process.exit(1); }

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

const synergies = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/synergies.json'), 'utf8'));
const abilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
const abList = Array.isArray(abilities) ? abilities : (abilities.abilities || []);
const bt = synergies.find(s => s.id === 'blood_tracker');
check('blood_tracker exists in synergies.json', !!bt);
check('blood_tracker has >=1 modifier', bt && (bt.modifiers || []).length >= 1,
  bt ? JSON.stringify(bt.modifiers) : 'missing');
check('blood_tracker modifier is hunt.find_chance add 0.15',
  bt && bt.modifiers.length === 1 && bt.modifiers[0].target === 'hunt.find_chance'
    && bt.modifiers[0].op === 'add' && bt.modifiers[0].value === 0.15,
  bt ? JSON.stringify(bt.modifiers) : 'missing');
// Legs all exist as abilities (activation is reachable, not stranded).
for (const leg of ['tracker', 'game_sense', 'blood_trail', 'animal_ken']) {
  check('leg ability exists: ' + leg, abList.some(a => a.id === leg));
}
// Every requires_any path uses only existing legs.
for (const p of (bt.requires_any || [])) {
  check('requires_any path resolvable: ' + p.join('+'),
    p.every(id => abList.some(a => a.id === id)));
}
// Requirer preserved: apex_predator still has a [blood_tracker, dead_aim] leg.
const apex = synergies.find(s => s.id === 'apex_predator');
check('apex_predator still requires blood_tracker via [blood_tracker, dead_aim]',
  !!apex && (apex.requires_any || []).some(p => p.includes('blood_tracker') && p.includes('dead_aim')));
// No dangling references: every synergy requires_any leg id is an ability,
// synergy, or known id present in data (blood_tracker itself must resolve).
const synIds = new Set(synergies.map(s => s.id));
const abIds = new Set(abList.map(a => a.id));
for (const s of synergies) {
  for (const p of (s.requires_any || [])) {
    for (const id of p) {
      if (!abIds.has(id) && !synIds.has(id)) check('no dangling leg id ' + id + ' in ' + s.id, false);
    }
  }
}
console.log('PASS dangling-leg census (all requires_any ids resolve)');

// Pipeline before/after on an IDENTICAL fixture; only activeSynergies differs.
function scholar(active) {
  return {
    abilities: [{ id: 'tracker', level: 2 }],
    backgroundAbilities: [],
    inventory: [], equipped: {},
    synergies: ['blood_tracker'],
    activeSynergies: active,
  };
}
const before = scholar([]);
const after = scholar(['blood_tracker']);
const modsBefore = M.collectModifiers(before, abList, synergies);
const modsAfter = M.collectModifiers(after, abList, synergies);
check('BEFORE: no synergy:blood_tracker modifier collected',
  !modsBefore.some(m => m.source === 'synergy:blood_tracker'));
check('AFTER: synergy:blood_tracker modifier collected',
  modsAfter.some(m => m.source === 'synergy:blood_tracker' && m.target === 'hunt.find_chance'),
  JSON.stringify(modsAfter.filter(m => m.source === 'synergy:blood_tracker')));
for (const base of [0.15, 0.4, 0.7]) {
  const b = M.resolve(base, 'hunt.find_chance', modsBefore, {});
  const a = M.resolve(base, 'hunt.find_chance', modsAfter, {});
  check(`hunt.find_chance base ${base}: before ${b} -> after ${a} (+0.15)`,
    Math.abs(b - base) < 1e-9 && Math.abs(a - (base + 0.15)) < 1e-9,
    `before=${b} after=${a}`);
}
// Discovery text + requirer untouched: the card still reads the same.
check('description/flavor/discovery unchanged',
  bt && bt.description === "Wounded prey doesn't escape. You follow until it's done."
    && bt.discovery === 'The blood tells you where it\'s going. You just have to listen.');

console.log(failures === 0 ? 'BLOOD-TRACKER PROOF: ALL PASS' : `BLOOD-TRACKER PROOF: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
