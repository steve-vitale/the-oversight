#!/usr/bin/env node
// PROOF: pilot episode (journey leg, 2026-10-11).
// Canon (docs/CONTESTS.md, Steve 2026-10-05): "The first challenge is a pilot
// episode — diegetic excuse for jank, and the System says so out loud."
// Before: no "pilot" anywhere in the contest system — the first contest was
// announced exactly like every later one.
// After: the first fireContest of a run opens with the System's pilot frame
// (test broadcast, pardon-the-jank, name stumble on the real cast); the
// grab-day beat calls the pilot live; the second contest has no pilot frame;
// the countdown-dread line is untouched in both; the flag never fires when
// fireContest bails early (no eligible).
//
// Usage: node scripts/test-pilot-episode-20261011.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function seedRandom(seed) {
  let _s = seed;
  Math.random = function () {
    _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
    let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
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

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? '\n  ' + extra : '')); }
}

const DREAD = 'The grab comes at dawn. One more day. Sleep if you can.';
const TODAY = 'It is today. You dreamed about the cameras.';

async function runSeed(seed) {
  seedRandom(seed);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;
  Game.state.systemArrived = true;

  const { eligible } = Game.contestEligible();
  check(`seed ${seed}: eligible cast exists`, eligible.length > 0, 'eligible=' + eligible.length);
  if (!eligible.length) return;

  let lines = [];
  const origSysSay = Game.sysSay;
  Game.sysSay = (t) => lines.push(String(t));
  // Stub the interruption: we only assert the grab-day beats, not the modal.
  const origInterruption = Game.contestInterruption;
  let interruptionCalled = false;
  Game.contestInterruption = () => { interruptionCalled = true; return null; };

  try {
    // --- first contest: the pilot ---
    Game.fireContest(Game.pickContest());
    const first = lines.join('\n');
    if (process.env.PRINT_PILOT && seed === 20261011) {
      console.log('--- pilot announcement (verbatim) ---');
      for (const l of lines) console.log(l);
      console.log('--- end ---');
    }
    check(`seed ${seed}: pilot announced out loud`, /PILOT EPISODE/.test(first), first.slice(0, 400));
    check(`seed ${seed}: jank pardoned`, /Pardon the jank/.test(first));
    check(`seed ${seed}: name stumble on the cast`, /first-ever contestants/.test(first));
    check(`seed ${seed}: dread line intact on pilot`, first.includes(DREAD));
    check(`seed ${seed}: pilotAired set`, Game.state.pilotAired === true);
    check(`seed ${seed}: pendingContest carries pilot`, !!(Game.state.pendingContest && Game.state.pendingContest.pilot));

    // --- grab day: the pilot goes live ---
    lines = [];
    Game.state.scholar.day = Game.state.pendingContest.firesDay;
    Game.resolveContest();
    const grab = lines.join('\n');
    check(`seed ${seed}: grab-day dread intact`, grab.includes(TODAY));
    check(`seed ${seed}: pilot called live at the grab`, /pilot is LIVE/.test(grab));
    check(`seed ${seed}: interruption still fires`, interruptionCalled);
    check(`seed ${seed}: pendingContest cleared`, !Game.state.pendingContest);

    // --- second contest: no pilot frame ---
    lines = [];
    interruptionCalled = false;
    Game.fireContest(Game.pickContest());
    const second = lines.join('\n');
    check(`seed ${seed}: second contest has no pilot frame`, !/PILOT|first-ever contestants|pardon the jank/i.test(second), second.slice(0, 300));
    check(`seed ${seed}: second contest still announces + dreads`, /CONTEST:/.test(second) && second.includes(DREAD));

    // --- early bail: no eligible -> flag untouched ---
    // (the player is eligible while alive, so the bail needs a dead scholar
    // AND an empty roster)
    lines = [];
    delete Game.state.pilotAired;
    Game.over = true;
    Game.state.village.roster = [];
    Game.fireContest(Game.pickContest());
    Game.over = false;
    check(`seed ${seed}: early bail sets no flag`, !Game.state.pilotAired);
    check(`seed ${seed}: early bail says nothing`, lines.length === 0, 'lines=' + lines.length);
  } finally {
    Game.sysSay = origSysSay;
    Game.contestInterruption = origInterruption;
  }
}

async function main() {
  for (const seed of [20261011, 777, 424242]) await runSeed(seed);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
