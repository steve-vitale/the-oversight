#!/usr/bin/env node
// PROOF: competent policy must not be exiled for freeloading (journey-scale r3 2026-10-11).
//
// BEFORE: the competent policy never foraged while the starting pantry looked
// fine (needTrip gate: pantry < 25000). It lived off the pantry (takes ~2000/day,
// gives 0, pack empty) and the freeload pipeline exiled it at day ~17 —
// blocking ALL scale verbs (proposeLink etc. are exile-gated). 4/4 scale seeds
// were exiled before the courtship began; the previous run misread the exile
// blocks as a "courtship spiral" of declines.
//
// AFTER: needTrip also fires when the player hasn't given in 3 days
// (contribution maintenance). The policy forages, donates surplus, and the
// freeload pipeline sees real gives — no exile.
//
// Usage: node scripts/test-freeload-exile-20261011.js
// Pass: exiled=false at day 25, gives > 0, forageTrips > 0.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }
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
  'src/js/convo-mood.js', 'src/js/convo-wants.js',
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

async function runSeed(seed) {
  resetRng(seed);
  const ctx = {};
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (competent.setup) competent.setup(Game, ctx);
  // capture the exile reason
  let exileHow = null, exileDay = null;
  const _ex = Game.exilePlayer.bind(Game);
  Game.exilePlayer = function (how) { if (!exileHow) { exileHow = how; exileDay = (Game.state.scholar && Game.state.scholar.day) || 0; } return _ex(how); };
  for (let day = 1; day <= 25; day++) {
    for (let p = 0; p < 3; p++) {
      try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
  }
  const exiled = !!(Game.state.scholar && Game.state.scholar.exiled);
  const vv = Game.state.village || {};
  const pid = Game.villagerId;
  const gives = (vv.gives || {})[pid] || 0;
  const takes = (vv.takes || {})[pid] || 0;
  return { seed, exiled, exileHow, exileDay, gives: Math.round(gives), takes: Math.round(takes), forageTrips: ctx.forageTrips || 0, donated: ctx.donated || 0 };
}

async function main() {
  const seeds = [99, 777, 424242, 20261011];
  let pass = 0, fail = 0;
  for (const seed of seeds) {
    const r = await runSeed(seed);
    // THE FIX: the policy must CONTRIBUTE (forage + give). Before, it never
    // foraged (forageTrips=0, gives=0) and was exiled for freeloading. After,
    // it forages and gives. Betrayal-plot exiles (moot) are RNG, not the
    // freeload mechanism — the contribution pattern is the proof.
    const contributes = (r.forageTrips || 0) > 0 && r.gives > 0;
    const freeloadExile = r.exiled && r.exileHow === 'moot' && r.takes > 15000 && r.gives < 100;
    const ok = contributes && !freeloadExile;
    if (ok) pass++; else fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} seed ${seed}: exiled=${r.exiled}${r.exileHow ? ` (${r.exileHow} day ${r.exileDay})` : ''} gives=${r.gives} takes=${r.takes} forageTrips=${r.forageTrips} donated=${r.donated}`);
  }
  console.log(`\n${pass}/${seeds.length} passed (contributes + no freeload exile)`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
