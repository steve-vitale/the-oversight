#!/usr/bin/env node
// scripts/godpath/validate.js — data contract for the god-path system.
// Pure JSON checks, no game load: runs in well under a second.
//
//   node scripts/godpath/validate.js            # checks up to current phase
//   GODPATH_PHASE=3 node scripts/godpath/validate.js   # preview a later phase
//
// The contract itself is documented in docs/godpath/PLAN.md ("Data contract").
// If you change the contract, change PLAN.md in the same commit.
'use strict';
const K = require('./lib');
const T = K.reporter('godpath-validate');

const abilities = K.readJSON('src/data/abilities.json');
const items = K.readJSON('src/data/items.json');
const synergies = K.readJSON('src/data/synergies.json');
const contests = K.readJSON('src/data/contests.json');
const GP = K.readJSON('src/data/godpaths.json');
const paths = GP.paths || {};
const conds = GP.conditions || {};
const byId = Object.fromEntries(abilities.map(a => [a.id, a]));
const PATH_IDS = ['brawler', 'shieldbearer', 'hunter', 'caregiver', 'drifter',
  'explorer', 'socialite', 'survivalist', 'miser', 'forager'];
const ROLES = ['support', 'enabler', 'payoff', 'wildcard'];

// ── Phase 0: guards for rejected approaches + the 10 paths ─────────────────
T.section('P0 · paths and rejected-approach guards');
T.ok('godpaths.json has exactly the brief\'s 10 paths',
  PATH_IDS.every(p => paths[p]) && Object.keys(paths).length === 10,
  'have: ' + Object.keys(paths).join(','));
T.ok('every ability has a valid role', abilities.every(a => ROLES.includes(a.role)),
  abilities.filter(a => !ROLES.includes(a.role)).map(a => a.id).slice(0, 8).join(','));
T.ok('no item carries abilityHooks (rejected: gear rewrites abilities)',
  !items.some(i => i.abilityHooks), items.filter(i => i.abilityHooks).map(i => i.id).join(','));
T.ok('no fusion data (rejected: fusion system)',
  !(() => { try { K.readJSON('src/data/fusions.json'); return true; } catch (e) { return false; } })());
// God-ability text must not promise things the constraints forbid.
const BANNED = [
  [/never need (food|water)/i, 'removes the need to eat'],
  [/don'?t need food/i, 'removes the need to eat'],
  [/auto-?win/i, 'contest auto-win'],
  [/instant win/i, 'contest instant win'],
  [/win [\w\/]+( [\w\/]+)? automatically/i, 'contest auto-win'],
  [/buy (anything \()?(even )?victory/i, 'buys victory'],
  [/bribe judges/i, 'contest auto-win by bribe'],
  [/can solo titans/i, 'bypasses the titan coalition gate'],
];
for (const pid of PATH_IDS) {
  const p = paths[pid] || {};
  const text = [p.godDescription, p.partyEffect, p.titanEffect, p.contestBeat, p.armyEffect].filter(Boolean).join(' ');
  const hit = BANNED.find(([re]) => re.test(text));
  T.ok(`${pid}: god text respects constraints`, !hit, hit && `"${hit[1]}"`);
}

// ── Phase 1: conditions + makes/spends tags ────────────────────────────────
T.section('P1 · conditions and tags');
const condIds = Object.keys(conds);
T.ok('10 conditions defined', condIds.length === 10, `have ${condIds.length}`, 1);
T.ok('every condition has name, plain sentence, scope fight|fightStart',
  condIds.length > 0 && condIds.every(c => conds[c].name && conds[c].plain && ['fight', 'fightStart'].includes(conds[c].scope)),
  condIds.filter(c => !(conds[c].name && conds[c].plain)).join(','), 1);
const pathConds = PATH_IDS.map(p => (paths[p] || {}).condition);
T.ok('each path names its own distinct condition',
  pathConds.every(c => c && conds[c]) && new Set(pathConds).size === 10,
  PATH_IDS.filter(p => !conds[(paths[p] || {}).condition]).join(','), 1);
const badMakes = abilities.filter(a => a.makes && !a.makes.every(c => conds[c])).map(a => a.id);
T.ok('every ability `makes` value is a known condition', condIds.length > 0 && badMakes.length === 0, badMakes.join(','), 1);
const badSpends = abilities.filter(a => a.spends && !conds[a.spends]).map(a => a.id);
T.ok('every ability `spends` value is a known condition', condIds.length > 0 && badSpends.length === 0, badSpends.join(','), 1);
const untaggedEnablers = abilities.filter(a => a.role === 'enabler' && !(a.makes && a.makes.length)).map(a => a.id);
T.ok('every enabler makes ≥1 condition', untaggedEnablers.length === 0,
  `${untaggedEnablers.length} untagged: ${untaggedEnablers.slice(0, 10).join(',')}`, 1);
for (const pid of PATH_IDS) {
  const c = (paths[pid] || {}).condition;
  const makers = abilities.filter(a => (a.makes || []).includes(c));
  const offPath = makers.filter(a => !(a.paths || []).includes(pid));
  T.ok(`${pid}: condition "${c}" has ≥3 makers, ≥1 off-path (the cross-path seam)`,
    makers.length >= 3 && offPath.length >= 1, `${makers.length} makers, ${offPath.length} off-path`, 1);
}
const gearMakers = items.filter(i => i.makes);
const badGear = gearMakers.filter(i => !i.makes.every(c => conds[c]) || !i.makesVia);
T.ok('gear `makes` are valid and name the gear action (`makesVia`)', badGear.length === 0, badGear.map(i => i.id).join(','), 1);
T.ok('rare stays rare: ≤ 12 items make a condition', gearMakers.length <= 12, `${gearMakers.length}`, 1);

// ── Phase 2: payoffs ───────────────────────────────────────────────────────
T.section('P2 · payoffs');
for (const pid of PATH_IDS) {
  const p = paths[pid] || {};
  const a = byId[p.payoff];
  const act = a && (a.actions || [])[0];
  T.ok(`${pid}: payoff "${p.payoff}" exists, role payoff, spends ${p.condition}, has an active verb with kcal cost`,
    !!(a && a.role === 'payoff' && a.spends === p.condition && act && act.cost && act.cost.kcal > 0),
    !a ? 'missing' : `role=${a.role} spends=${a.spends} action=${!!act}`, 2);
}

// ── Phase 3: Trials + god abilities ────────────────────────────────────────
T.section('P3 · trials and god abilities');
const contestIds = new Set((Array.isArray(contests) ? contests : contests.contests || []).map(c => c.id));
for (const pid of PATH_IDS) {
  const p = paths[pid] || {};
  const g = byId[p.godAbility];
  T.ok(`${pid}: trial "${p.trial}" exists in contests.json`, !!(p.trial && contestIds.has(p.trial)), '', 3);
  T.ok(`${pid}: god ability "${p.godAbility}" exists, unlock.type=trial, godOf=${pid}, kcal-costed verb, weakness`,
    !!(g && g.unlock && g.unlock.type === 'trial' && g.godOf === pid && (g.actions || []).some(x => x.cost && x.cost.kcal > 0) && g.weakness),
    !g ? 'missing' : `unlock=${(g.unlock || {}).type} godOf=${g.godOf} weakness=${!!g.weakness}`, 3);
}
const godIds = new Set(PATH_IDS.map(p => (paths[p] || {}).godAbility).filter(Boolean));
T.ok('god abilities are never system offers (Trial only)',
  abilities.filter(a => godIds.has(a.id)).every(a => a.unlock && a.unlock.type === 'trial'), '', 3);

// ── Phase 4: scale ─────────────────────────────────────────────────────────
T.section('P4 · scale');
for (const pid of PATH_IDS) {
  const p = paths[pid] || {};
  T.ok(`${pid}: partyEffect, contestBeat, armyEffect text + titanBlades number`,
    !!(p.partyEffect && p.contestBeat && p.armyEffect && typeof p.titanBlades === 'number'), '', 4);
}

// ── Phase 5: signature combos + duos ───────────────────────────────────────
T.section('P5 · synergies');
const sig = synergies.filter(s => s.kind === 'signature');
const duo = synergies.filter(s => s.kind === 'duo');
T.ok('one signature combo per path (10, each with `path`)',
  PATH_IDS.every(p => sig.some(s => s.path === p)), `${sig.length} signature`, 5);
T.ok('3–7 duos (rare stays rare), each spanning two paths',
  duo.length >= 3 && duo.length <= 7 && duo.every(s => Array.isArray(s.duoPaths) && s.duoPaths.length === 2),
  `${duo.length} duos`, 5);

T.done();
