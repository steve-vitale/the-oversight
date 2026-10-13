'use strict';
// Proof: ability cards speak plain English, and names match mechanics
// (Steve 2026-10-12 — the Pathfinder redirect).
// 1. The modifier formatter in src/js/engine/modifiers.js renders every
//    (target, op) combo in abilities.json without raw engine jargon.
// 2. The renamed abilities' data no longer claims what the mechanic doesn't do.
// 3. The ability-bar concatenation bug is fixed in src/js/app.js source.
// 4. The card renderer no longer contains the raw "${target} ${op}" template.
//
// RED check: `git stash` the src/ changes (keep this file) and this test fails.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, extra ? '— ' + extra : ''); }
}

// ---- load the node-safe engine module ----
global.window = undefined;
eval(fs.readFileSync(path.join(ROOT, 'src/js/engine/modifiers.js'), 'utf8'));
const MOD = globalThis.Scattering.modifiers;
ok('modifiers module loads with describe()', !!(MOD && MOD.describe));

const abilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
const list = abilities.abilities || abilities;
const byId = {};
for (const a of list) (byId[a.id] = byId[a.id] || []).push(a);

function jargon(s) {
  return /multiply|_mult|cost_mult|poison_chance|detect_chance|find_chance|eat_target_mult|bank_mult|resolve_bonus|trade_window|spoilage_days|gift_chance|trap_catch|meat_yield|rain_catch|hear_mult|weight_mult/i.test(s);
}

// ---- 1. every observed (target, op) combo renders jargon-free ----
const seen = new Set();
for (const a of list) {
  for (const m of (a.modifiers || [])) {
    const key = m.target + '|' + m.op;
    if (seen.has(key)) continue;
    seen.add(key);
    const out = MOD.describe(m, 1);
    ok(`describe ${key}`, !!out && !jargon(out), JSON.stringify(out));
  }
}
ok('all combos covered (no fallback needed)', seen.size > 0);

// ---- 2. spot checks: exact plain-English output ----
const cases = [
  [{ target: 'travel.cost_mult', op: 'multiply', value: 0.85 }, 1, '15% less travel cost'],
  [{ target: 'food.poison_chance', op: 'multiply', value: 0.25 }, 1, '75% less food-poisoning risk'],
  [{ target: 'carry.weight_mult', op: 'multiply', value: 0.7 }, 1, '30% less pack weight'],
  [{ target: 'combat.strike_damage', op: 'multiply', value: 2 }, 1, '+100% strike damage'],
  [{ target: 'food.bank_mult', op: 'multiply', value: 5 }, 1, '5x calorie bank'],
  [{ target: 'monster.hear_mult', op: 'multiply', value: 2 }, 1, 'monsters hear you 2x as well'],
  [{ target: 'combat.dodge_chance', op: 'add', value: 0.15 }, 1, '+15% dodge chance'],
  [{ target: 'health.max_add', op: 'add', value: 10 }, 1, '+10 max health'],
  [{ target: 'trust.gain_mult', op: 'multiply', value: 0.8 }, 1, '20% less trust gained'],
  // level scaling mirrors the engine: multiply value^level
  [{ target: 'travel.cost_mult', op: 'multiply', value: 0.85, scale: 'level' }, 2, '28% less travel cost'],
];
for (const [m, lvl, want] of cases) {
  const out = MOD.describe(m, lvl);
  ok(`"${want}"`, out === want, `got ${JSON.stringify(out)}`);
}
// fallback for unknown targets: cleaned generic, never raw op-speak
ok('unknown target fallback', MOD.describe({ target: 'zzz.foo', op: 'multiply', value: 1.5 }, 1) === 'zzz.foo ×1.5');

// ---- 3. renamed abilities: names/flavor match mechanics ----
const pf = byId['pathfinder'];
ok('pathfinder renamed (exploration)', pf[0].name === 'Tireless Stride', pf[0].name);
ok('pathfinder renamed (latent_knack)', pf[1].name === 'Waywise', pf[1].name);
for (const p of pf) {
  ok(`no lost-flavor in ${p.pool}`, !/never been lost|don't get lost|know the way/i.test(p.description), p.description.slice(0, 60));
}
ok('second_skin renamed', byId['second_skin'][0].name === 'Travel Light');
ok('second_skin no armor-fiction', !/armor never slows|move full speed in any armor/i.test(byId['second_skin'][0].description));
ok('poisoner renamed', byId['poisoner'][0].name === 'Tainted Bait');
ok('poisoner no phantom verb', !/poison food\/water/i.test(byId['poisoner'][0].description));
ok('purify canon flavor', /intention|System/i.test(byId['purify'][0].description) && !/Charcoal, clean water, time/i.test(byId['purify'][0].description));
ok('lucky_rock honest scope', /on the hunt/i.test(byId['lucky_rock'][0].description) && !/to everything/i.test(byId['lucky_rock'][0].description));

// ---- 4. app.js source checks ----
const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
ok('raw modifier template gone', !app.includes('${esc(m.target)} ${esc(m.op)}'));
ok('card uses describe()', app.includes('M.describe(m, level)'));
ok('abilitybar name/desc separated', app.includes('<span class="ctx-desc"> — ${esc(a.desc)}</span>'));
ok('contextbar name/desc separated', app.includes('<span class="ctx-desc"> — ${esc(desc)}</span>'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
