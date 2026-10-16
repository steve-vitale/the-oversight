#!/usr/bin/env node
'use strict';
// test-apexpredators-20261016.js — proof for the sim-apexpredators DIAGNOSTIC
// instrument (flesh-out loop, 2026-10-16, scale-onramp axis).
//
// Proves: species/wave/one-round-kill/context/counter-known/codex/roster
// attribution on SYNTHETIC death sequences of known attribution (RED->GREEN),
// then SMOKE (15d x 2 policies, instrument live) and DET-GATE (4 identical-seed
// pairs, plain-repeat + instr-repeat + plain==instr, ends agree) via the
// instrument's SMOKE=1 / DET=1 modes.
//
// The unit section drives a FAKE Game through the same call sequences the real
// engine produces (wild vDie: resolveWildMonsterEncounter -> fieldFight ->
// hurtVillager -> registerDeath; agency vDie: fieldFight -> expedDeath ->
// registerDeath) and asserts every apex field on the recorded death.
// Production ordering is mirrored: the ffs death-recorder wraps registerDeath
// FIRST, the apex wrap goes OUTERMOST.
const AP = require('./apexpredators-20261016');

const DEFS = [
  { id: 'reunion', name: 'The Reunion', wave: 4 },
  { id: 'congregation', name: 'The Congregation', wave: 4 },
  { id: 'focus_group', name: 'The Focus Group', wave: 3 },
  { id: 'eater', name: 'THE EATER', wave: 4, counter: undefined },
  { id: 'highbeam_deer', name: 'Highbeam Deer', wave: 1, counter: { kind: 'shout' } },
];

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- speciesOf / monsterIdFromName ---------------------------------------
{
  const s = AP.speciesOf('reunion', DEFS);
  check('speciesOf reunion', s && s.name === 'The Reunion' && s.wave === 4, JSON.stringify(s));
  check('speciesOf unknown -> null', AP.speciesOf('nope', DEFS) === null, '');
  check('monsterIdFromName The Congregation', AP.monsterIdFromName('The Congregation', DEFS) === 'congregation', '');
  check('monsterIdFromName unknown -> null', AP.monsterIdFromName('No Such Beast', DEFS) === null, '');
}
// --- orkOf ----------------------------------------------------------------
{
  check('orkOf 1 -> true', AP.orkOf(1) === true, '');
  check('orkOf 0 -> true (volley caveat)', AP.orkOf(0) === true, '');
  check('orkOf 2 -> false', AP.orkOf(2) === false, '');
  check('orkOf null -> false', AP.orkOf(null) === false, '');
}
// --- resolveMonsterId ------------------------------------------------------
{
  check('resolveMonsterId prefers stack top',
    AP.resolveMonsterId({ stackTopId: 'reunion', lastFight: null, deathVid: 'v1', causeName: 'monster' }, DEFS) === 'reunion', '');
  check('resolveMonsterId falls back to lastFight on vid match',
    AP.resolveMonsterId({ stackTopId: null, lastFight: { vid: 'v1', monsterId: 'eater' }, deathVid: 'v1', causeName: 'monster' }, DEFS) === 'eater', '');
  check('resolveMonsterId rejects lastFight on vid mismatch',
    AP.resolveMonsterId({ stackTopId: null, lastFight: { vid: 'v2', monsterId: 'eater' }, deathVid: 'v1', causeName: 'monster' }, DEFS) === null, '');
  check('resolveMonsterId falls back to cause-name match',
    AP.resolveMonsterId({ stackTopId: null, lastFight: null, deathVid: 'v1', causeName: 'The Focus Group' }, DEFS) === 'focus_group', '');
}
// --- isTargetDeath (the fieldfightsrc population filter, verbatim) ---------
{
  const T = (d, inv) => AP.isTargetDeath(d, inv);
  check('isTargetDeath inviteDay null -> false', T({ day: 90, kind: 'villager', family: 'monster' }, null) === false, '');
  check('isTargetDeath pre-invite -> false', T({ day: 40, kind: 'villager', family: 'monster' }, 49) === false, '');
  check('isTargetDeath invite-day boundary -> true', T({ day: 49, kind: 'villager', family: 'monster' }, 49) === true, '');
  check('isTargetDeath sickness family -> false', T({ day: 90, kind: 'villager', family: 'sickness' }, 49) === false, '');
  check('isTargetDeath monster kind -> false', T({ day: 90, kind: 'monster', family: 'monster' }, 49) === false, '');
  check('isTargetDeath player flag -> true', T({ day: 90, kind: 'player', family: 'monster', player: true }, 49) === true, '');
}
// --- codexStageOf ------------------------------------------------------------
{
  const st = { codex: { monsters: { reunion: { stage: 'observed' }, eater: { stage: 'slain' } } } };
  check('codexStageOf observed', AP.codexStageOf(st, 'reunion') === 'observed', '');
  check('codexStageOf slain', AP.codexStageOf(st, 'eater') === 'slain', '');
  check('codexStageOf missing -> null', AP.codexStageOf(st, 'congregation') === null, '');
  check('codexStageOf null state -> null', AP.codexStageOf(null, 'reunion') === null, '');
}
// --- synthetic death sequences ----------------------------------------------
function fakeGame() {
  const villagers = [];
  for (let i = 1; i <= 7; i++) villagers.push({ id: 'v' + i, name: 'Villager' + i });
  const Game = {
    data: { monsters: DEFS, villagers },
    state: {
      scholar: { day: 90 },
      codex: { monsters: { reunion: { stage: 'observed' } } },
      villageSlain: { reunion: 1 },
      monsterCounters: {},
    },
    monsterCounterKnown(mid) {
      const known = (this.state.monsterCounters || {})[mid] === true;
      if (!known) return false;
      const mdef = (this.data.monsters || []).find(m => m.id === mid);
      return !!(mdef && mdef.counter);
    },
    registerDeath(opts) { this._regCalls = (this._regCalls || 0) + 1; return { ok: true }; },
    fieldFight(vid, mdef, m, opts) { return { outcome: 'vKill', rounds: 3, vTaken: 10, mDealt: 50 }; },
    expedDeath(vid, mName, nm, playerAtHaven) {
      return this.registerDeath({ kind: 'villager', villagerId: vid, name: nm, cause: mName, killerId: null });
    },
  };
  return Game;
}
function fakeCtx() {
  return { _ffs: { deaths: [], stack: [], _apex: { lastFight: null }, travelDays: {} } };
}
// Minimal stand-in for ffs's installDeathCapture: records the death record
// the apex wrap then stamps.
function installFakeFfsDeath(Game, ctx) {
  const orig = Game.registerDeath.bind(Game);
  Game.registerDeath = function (opts) {
    const r = orig.apply(this, arguments);
    const o = opts || {};
    const top = ctx._ffs.stack[ctx._ffs.stack.length - 1] || null;
    ctx._ffs.deaths.push({
      day: 90, kind: String(o.kind || '?'), name: String(o.name || '?'),
      vid: String(o.villagerId || o.monsterId || ''), cause: String(o.cause || '?'),
      family: 'monster', via: top ? top.via : null,
      monsterId: top ? top.monsterId : null,
      scholarAway: false, travelLegs: 0,
    });
    return r;
  };
}
{
  // WILD vDie: stack entry (ffs) -> fieldFight -> registerDeath inside the call.
  const Game = fakeGame();
  const ctx = fakeCtx();
  installFakeFfsDeath(Game, ctx);
  AP.installApexCapture(Game, ctx);
  // engine sequence: resolveWildMonsterEncounter pushes, fieldFight runs...
  ctx._ffs.stack.push({ via: 'wild', raid: false, monsterId: null, monsterLingering: false });
  Game.fieldFight('v3', {}, { id: 'reunion', name: 'The Reunion' }, {});
  // engine upgrades the entry from the entity; simulate the ffs upgrade
  ctx._ffs.stack[ctx._ffs.stack.length - 1].monsterId = 'reunion';
  // fight ends vDie after 1 round: override the fake's return for this sequence
  ctx._ffs._apex.lastFight.rounds = 1; ctx._ffs._apex.lastFight.outcome = 'vDie';
  Game.registerDeath({ kind: 'villager', villagerId: 'v3', name: 'Villager3', cause: 'monster', killerId: null });
  ctx._ffs.stack.pop();
  const d = ctx._ffs.deaths[ctx._ffs.deaths.length - 1];
  check('synthetic wild: death recorded', !!d, '');
  check('synthetic wild: species', d && d.species === 'The Reunion', d && d.species);
  check('synthetic wild: wave 4', d && d.wave === 4, d && String(d.wave));
  check('synthetic wild: oneRoundKill', d && d.oneRoundKill === true, d && String(d.fightRounds));
  check('synthetic wild: roster 7', d && d.rosterAtDeath === 7, d && String(d.rosterAtDeath));
  check('synthetic wild: codex observed', d && d.codexStage === 'observed', d && d.codexStage);
  check('synthetic wild: counterKnown false', d && d.counterKnown === false, d && String(d.counterKnown));
  check('synthetic wild: villageSlain 1', d && d.villageSlain === 1, d && String(d.villageSlain));
}
{
  // AGENCY vDie: fieldFight returns vDie -> expedDeath -> registerDeath (no stack id).
  const Game = fakeGame();
  const ctx = fakeCtx();
  installFakeFfsDeath(Game, ctx);
  AP.installApexCapture(Game, ctx);
  Game.fieldFight('v5', {}, { id: 'congregation', name: 'The Congregation' }, { awareness: true });
  ctx._ffs._apex.lastFight.rounds = 2; ctx._ffs._apex.lastFight.outcome = 'vDie';
  ctx._ffs.stack.push({ via: 'agency-expedition', raid: false, monsterId: null, monsterLingering: false, monsterName: 'The Congregation' });
  Game.expedDeath('v5', 'The Congregation', 'Villager5', true);
  ctx._ffs.stack.pop();
  const d = ctx._ffs.deaths[ctx._ffs.deaths.length - 1];
  check('synthetic agency: species via lastFight', d && d.species === 'The Congregation', d && d.species);
  check('synthetic agency: wave 4', d && d.wave === 4, d && String(d.wave));
  check('synthetic agency: not one-round (2 rounds)', d && d.oneRoundKill === false && d.fightRounds === 2, d && String(d.fightRounds));
}
{
  // Counter-known read: wave-1 monster with a discovered counter.
  const Game = fakeGame();
  Game.state.monsterCounters = { highbeam_deer: true };
  const ctx = fakeCtx();
  installFakeFfsDeath(Game, ctx);
  AP.installApexCapture(Game, ctx);
  ctx._ffs.stack.push({ via: 'wild', raid: true, monsterId: 'highbeam_deer', monsterLingering: false });
  Game.fieldFight('v2', {}, { id: 'highbeam_deer', name: 'Highbeam Deer' }, { raid: true });
  ctx._ffs._apex.lastFight.rounds = 4; ctx._ffs._apex.lastFight.outcome = 'vDie';
  Game.registerDeath({ kind: 'villager', villagerId: 'v2', name: 'Villager2', cause: 'monster', killerId: null });
  ctx._ffs.stack.pop();
  const d = ctx._ffs.deaths[ctx._ffs.deaths.length - 1];
  check('synthetic raid: counterKnown true (wave-1, discovered)', d && d.counterKnown === true, d && String(d.counterKnown));
  check('synthetic raid: wave 1', d && d.wave === 1, d && String(d.wave));
}
{
  // Read-only sanity: the instrument never writes game state.
  const Game = fakeGame();
  const ctx = fakeCtx();
  installFakeFfsDeath(Game, ctx);
  AP.installApexCapture(Game, ctx);
  const before = JSON.stringify({ v: Game.data.villagers.length, s: Game.state.villageSlain, c: Game.state.monsterCounters });
  ctx._ffs.stack.push({ via: 'wild', raid: false, monsterId: 'reunion', monsterLingering: false });
  Game.fieldFight('v1', {}, { id: 'reunion', name: 'The Reunion' }, {});
  Game.registerDeath({ kind: 'villager', villagerId: 'v1', name: 'Villager1', cause: 'monster', killerId: null });
  ctx._ffs.stack.pop();
  const after = JSON.stringify({ v: Game.data.villagers.length, s: Game.state.villageSlain, c: Game.state.monsterCounters });
  check('instrument writes nothing to game state', before === after, '');
}

console.log(`\nUNIT: ${pass} pass, ${fail} fail.`);
if (fail) process.exit(1);
console.log('UNIT GATE: all synthetic death sequences attribute correctly (RED->GREEN).');
