#!/usr/bin/env node
// audit-ability-needles.js — Steve 2026-10-11: every ability must MOVE THE
// NEEDLE at L1. For each of the 94 abilities, check:
//   REAL: modifier targets are live (modTarget called somewhere) or a code
//         hook (hasAbility/abilityLevel('id')) exists and fires.
//   MEANINGFUL: heuristic flags for trivial deltas.
// Output: JSON report + human-readable flags. Retune-first, no cuts.
// Usage: node scripts/audit-ability-needles.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

const abilities = require(path.join(ROOT, 'src/data/abilities.json'));
const list = abilities.abilities || abilities;

// Collect live modTarget targets from source.
const liveTargets = new Set();
try {
  const out = execSync(`grep -rho "modTarget('[^']*'" src/js/ 2>/dev/null`, { cwd: ROOT }).toString();
  for (const m of out.matchAll(/modTarget\('([^']+)'/g)) liveTargets.add(m[1]);
} catch (e) {}
// Also collect modifier targets declared in engine/modifiers.js maps (they feed the pipeline).
try {
  const modSrc = fs.readFileSync(path.join(ROOT, 'src/js/engine/modifiers.js'), 'utf8');
  for (const m of modSrc.matchAll(/target:\s*'([^']+)'/g)) liveTargets.add(m[1]);
} catch (e) {}

// Collect code hooks: files referencing ability id via hasAbility/abilityLevel.
const hookCache = {};
function hasCodeHook(id) {
  if (hookCache[id] !== undefined) return hookCache[id];
  try {
    // Unquoted id match: catches 'id', "id", id.action, id: {...}, etc.
    // Exclude data/tests/evolutions to find REAL engine hooks.
    const out = execSync(`grep -rl '${id}' src/js/ 2>/dev/null | grep -v 'test-\\|debug-scenarios' | head -8`, { cwd: ROOT }).toString().trim();
    hookCache[id] = out.length > 0 ? out.split('\n').map(s => s.trim()) : [];
  } catch (e) { hookCache[id] = []; }
  return hookCache[id];
}

// Heuristic: is this delta meaningful? Tiny adds on chance-based targets are weak.
function meaningfulness(mods) {
  const flags = [];
  for (const m of mods) {
    const v = Math.abs(m.value || 0);
    if (m.op === 'add' && /chance|_mult$|gain_mult/.test(m.target) && v < 0.1)
      flags.push(`weak-add ${m.target} +${m.value}`);
    if (m.op === 'multiply' && v > 0.95 && v < 1.05)
      flags.push(`noop-multiply ${m.target} x${m.value}`);
  }
  return flags;
}

const report = [];
for (const ab of list) {
  const mods = ab.modifiers || [];
  const entry = { id: ab.id, pool: ab.pool, tier: ab.tier || '', unlock: (ab.unlock || {}).type, real: true, issues: [] };
  if (mods.length === 0) {
    const hooks = hasCodeHook(ab.id);
    if (!hooks.length) { entry.real = false; entry.issues.push('NO MODIFIERS and NO code hook found — likely dead'); }
    else entry.hookFiles = hooks.slice(0, 3);
  } else {
    for (const m of mods) {
      if (!liveTargets.has(m.target)) { entry.real = false; entry.issues.push(`DEAD TARGET: ${m.target}`); }
    }
    entry.issues.push(...meaningfulness(mods));
  }
  // L2/L3 coverage in abilityLevelBonus.
  entry.hasL23 = null; // filled below
  report.push(entry);
}
// Check abilityLevelBonus coverage.
try {
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  const m = gameSrc.match(/abilityLevelBonus\(id, level\) \{[\s\S]*?return \(bonuses\[id\]/);
  const tableSrc = gameSrc.slice(gameSrc.indexOf('abilityLevelBonus(id, level)'), gameSrc.indexOf('abilityLevelBonus(id, level)') + 8000);
  for (const e of report) e.hasL23 = new RegExp(`\\b${e.id}:`).test(tableSrc);
} catch (e) {}

const dead = report.filter(r => !r.real);
const weak = report.filter(r => r.real && r.issues.length);
const noL23 = report.filter(r => !r.hasL23);
console.log(`total: ${report.length}, dead/unreal: ${dead.length}, weak flags: ${weak.length}, missing L2/L3: ${noL23.length}`);
console.log('\n=== DEAD/UNREAL ===');
for (const d of dead) console.log(`  ${d.id} [${d.pool}]: ${d.issues.join('; ')}`);
console.log('\n=== WEAK FLAGS ===');
for (const w of weak) console.log(`  ${w.id} [${w.pool}]: ${w.issues.join('; ')}`);
console.log('\n=== MISSING L2/L3 (first 40) ===');
console.log('  ' + noL23.slice(0, 40).map(r => r.id).join(', '));
if (process.argv.includes('--json')) fs.writeFileSync('/tmp/needle-audit.json', JSON.stringify(report, null, 1));
