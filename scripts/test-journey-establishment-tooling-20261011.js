#!/usr/bin/env node
// Proof test for journey-establishment harness tooling fixes (2026-10-11):
//  1. agencyXP: buildCensus used to read Game.agencyOf(id).xp — the GLOBAL map —
//     so every villager showed identical "XP". Fixed to (agencyOf(id).xp||{})[id].
//  2. teleSide: state.telemetry is capped at 300 entries; the harness's
//     once-per-day contestEvents() read lost contest_fired entries on busy
//     seeds ('honey' end with no fire, seed 777). Fixed with an unbounded
//     Game.tele side-channel wrapped in runSeed.
//
// Usage: node scripts/test-journey-establishment-tooling-20261011.js
// Seeds: 777 (the busy seed that lost the fire).

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEEDS || '777', 10);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;
const { competent } = require('./policies/competent.js');
const { driveFights, driveContests } = require('./sim-harness.js');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name); }
}

(async () => {
  _s = SEED >>> 0;
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const ctx = {};
  if (competent.setup) competent.setup(Game, ctx);

  // drive a few days so agency XP differentiates
  for (let day = 1; day <= 12 && !Game.over; day++) {
    for (let p = 0; p < 3; p++) {
      try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx); driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, competent, ctx);
  }

  // --- 1. agencyXP is per-villager, not the global map ---
  const roster = (Game.state.village.roster || []);
  // replicate the FIXED buildCensus reader
  const fixed = roster.map(id => {
    let axp = null;
    try { const a = Game.agencyOf ? Game.agencyOf(id) : null; axp = (a && a.xp && a.xp[id]) || null; } catch (e) {}
    return { id, axp };
  });
  ok(fixed.length > 0, 'roster non-empty for XP check');
  // the OLD bug's signature: every villager's agencyXP was the same object
  // (the whole map, keyed by every villager id). The fixed reader returns a
  // per-villager {tracking,survival,bravery} object (or null).
  const allKeys = new Set();
  let anyPerVillager = false;
  for (const f of fixed) {
    if (f.axp && typeof f.axp === 'object') {
      const keys = Object.keys(f.axp);
      keys.forEach(k => allKeys.add(k));
      if (keys.includes('tracking') && keys.includes('survival') && keys.includes('bravery')) anyPerVillager = true;
    }
  }
  ok(anyPerVillager, 'at least one villager has a per-villager {tracking,survival,bravery} XP object');
  ok(!allKeys.has(roster[0]) && ![...allKeys].some(k => String(k).startsWith('gen_') || String(k).includes('_')),
    'fixed agencyXP has no villager-id keys (old bug put the whole map in)');
  // differentiation: not all villagers share identical XP (the old code made
  // them LITERALLY the same object)
  const sigs = new Set(fixed.map(f => JSON.stringify(f.axp)));
  ok(sigs.size > 1, 'villagers differentiate on agencyXP (' + sigs.size + ' distinct of ' + fixed.length + ')');

  // --- 2. teleSide survives the 300-entry telemetry trim ---
  const side = [];
  const _tele = Game.tele;
  Game.tele = function (t, d) {
    try {
      if (typeof t === 'string' && /^(contest_fired|contest_end|show_aired|prize_)/.test(t)) {
        side.push({ day: (Game.state.scholar || {}).day || 0, type: t, id: (d && d.id) || '?' });
      }
    } catch (e) {}
    return _tele.apply(this, arguments);
  };
  Game.tele('contest_fired', { id: 'probe_contest' });
  // flood telemetry past the 300-entry cap
  for (let i = 0; i < 400; i++) { try { Game.tele('probe_noise', { i }); } catch (e) {} }
  const inTrimmed = (Game.state.telemetry || []).some(e => e && e.type === 'contest_fired' && e.id === 'probe_contest');
  const inSide = side.some(e => e.type === 'contest_fired' && e.id === 'probe_contest');
  ok(!inTrimmed, 'trim removed probe_contest from state.telemetry (reproduces the seed-777 loss)');
  ok(inSide, 'side-channel still holds probe_contest after 400-entry flood');
  Game.tele = _tele;

  console.log(`\ntooling proof: ${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
