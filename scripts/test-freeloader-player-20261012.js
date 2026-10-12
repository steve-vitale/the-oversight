#!/usr/bin/env node
// Proof: the freeloader pipeline's (effort < 0.5 && draining) clause is dead
// for villagers (produced = expected x grit, grit >= 0.5 by construction —
// the code's own comment says so) but LIVE and miscalibrated for the PLAYER,
// whose production is never logged (contribLog only written by the villager
// daily sim). A player who forages daily but yields little early (low
// knowledge) and eats from the pantry while learning was exiled ~day 17-20,
// which blocked EVERY scale-leg council verb ("Exile means exile") and made
// the whole scale leg unreachable — not a village decline, an engine exile.
// The fix: judge everyone by the live signal (sustained net drain vs own
// capacity, drainBeyondCapacity). The design ("kick out drains") is preserved.
// We assert on fl.days (the pipeline's condemnation counter), not the moot
// vote (separate system, pairAffinity RNG).
// RED on master: case A condemns (fl.days hits 12). GREEN after fix: case A
// stays 0, case C (true drain) still condemns.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let _s = 777;
Math.random = function () { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _m: {}, getItem(k) { return (k in this._m) ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.window = global;
const files = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js', 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js', 'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js', 'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js', 'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js', 'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js', 'src/js/partyTactics.js', 'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js', 'src/js/metaProgression.js', 'src/js/sigW3c.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js', 'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js', 'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js', 'src/js/debug-scenarios.js', 'src/js/build.js'];
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
delete global.window;
const Game = globalThis.Scattering.Game;

let failures = 0;
function check(name, cond) { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) failures++; }

// Drive freeloaderTick with a scripted cumulative ledger for the player.
// takes/gives are cumulative in the live game; we set the day-17 state.
function condemnationDays(takes, gives, days) {
  const v = Game.state.village;
  const pid = Game.villagerId;
  v.freeload = {}; v.contribHist = {}; v.contribLog = {};
  v.gives = {}; v.takes = {};
  v.takes[pid] = takes; v.gives[pid] = gives;
  Game.state.scholar.exiled = false;
  const _say = Game.say; Game.say = function () { return ''; };
  // stub the moot vote: we measure condemnation (fl.days), not the vote
  const _vote = Game.freeloadVote; Game.freeloadVote = function (vid) {
    const fl = (Game.state.village.freeload || {})[vid] || {};
    fl.voteFired = true;
  };
  for (let d = 1; d <= days; d++) {
    Game.state.scholar.day = d;
    Game.freeloaderTick(v);
  }
  Game.say = _say; Game.freeloadVote = _vote;
  const fl = (v.freeload || {})[pid] || {};
  return { days: fl.days || 0, stage: fl.stage || 0, voteFired: !!fl.voteFired };
}

(async () => {
  await Game.init();
  Game.genDetail = () => ({});
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  // CASE A: the learning player — 20.4k net pantry drain over 17 days, 0 gives
  // (the measured seed-20261012 scholar). Below 3x own 5-day capacity.
  const a = condemnationDays(20400, 0, 20);
  console.log('   A: fl.days=' + a.days + ' stage=' + a.stage + ' vote=' + a.voteFired);
  check('A: learning player NOT condemned (fl.days stays 0)', a.days === 0 && !a.voteFired);

  // CASE C: the true drain — 100k net, 0 gives. Above 3x capacity: the design
  // must still bite.
  const c = condemnationDays(100000, 0, 20);
  console.log('   C: fl.days=' + c.days + ' stage=' + c.stage + ' vote=' + c.voteFired);
  check('C: true drain still condemned (vote fires)', c.voteFired && c.days >= 12);

  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
