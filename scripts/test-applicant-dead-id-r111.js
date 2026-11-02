// Proof test for journey-crisis r111 (lane B, leg 6): a dead villager's
// identity must never be re-issued as a new applicant.
//
// Case (seed 11101): Sam Wilson dies on day 15 (first grave), then the
// applicant system re-picks his background_survivor seed on day 45
// because genApplicant() excluded only current roster ids + pending
// applications — not the dead. He "walks in" on day 64 on the corpse's
// record (dead=true in villagers, rosterChars and vpOf), acts in
// roster-name-driven ambient lines, can never be helped (every
// convoFavorAction call returns 'no longer available', disjunct
// person.dead), and inherits the mantle on day 102 while still
// flagged dead. Unique-person law: a dead person's identity is not
// a new person.
//
// Usage: node scripts/test-applicant-dead-id-r111.js (exit 0 = all pass)
// Uses the shared sim harness (one loadGame per process). genApplicant
// takes the background-survivor branch ~70% of calls, so each case
// calls it 50 times on the harness's fixed RNG stream: the dead seed
// must NEVER appear, the living seed must appear, the roster seed
// must NEVER appear. Before the fix the dead seed appears ~35/50.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 11101, mode: 'crisis-delayed-r70', fullTelemetry: true });
  await setupGame(Game);

  const deadSeed = { id: 'dead_seed_r111', name: 'Dead Seed', formerOccupation: 'bartender' };
  const liveSeed = { id: 'live_seed_r111', name: 'Live Seed', formerOccupation: 'cook' };
  const rosterSeed = { id: 'roster_seed_r111', name: 'Roster Seed', formerOccupation: 'farmer' };

  // The village roster holds only the player + one living member; the
  // dead seed's record sits in data.villagers flagged dead, off-roster
  // — exactly the day-15 Sam Wilson state before the day-45 re-pick.
  Game.state.village.roster = [Game.villagerId, rosterSeed.id];
  Game.state.village.mship = { applications: [], arrivals: [] };
  Game.data.villagers = Game.data.villagers || [];
  Game.data.villagers.push({ id: deadSeed.id, name: deadSeed.name, dead: true });
  Game.data.villagers.push({ id: liveSeed.id, name: liveSeed.name, dead: false });
  Game.data.villagers.push({ id: rosterSeed.id, name: rosterSeed.name, dead: false });

  function tally(pool) {
    Game.data.background_survivors = pool;
    const seen = {};
    for (let i = 0; i < 50; i++) {
      const app = Game.genApplicant();
      seen[app.id] = (seen[app.id] || 0) + 1;
    }
    return seen;
  }

  // 1. Dead identity must NOT be re-issued (the r111 bug).
  const deadTally = tally([deadSeed]);
  console.log('dead-seed tally:', JSON.stringify(deadTally));
  ok('dead seed is never re-issued as an applicant', !deadTally[deadSeed.id]);

  // 2. Living, off-roster seed still issues normally (no regression).
  const liveTally = tally([liveSeed]);
  console.log('live-seed tally:', JSON.stringify(liveTally));
  ok('living off-roster seed still issues', (liveTally[liveSeed.id] || 0) > 0);

  // 3. Roster member still excluded (pre-existing behavior preserved).
  const rosterTally = tally([rosterSeed]);
  console.log('roster-seed tally:', JSON.stringify(rosterTally));
  ok('roster seed is still excluded', !rosterTally[rosterSeed.id]);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERROR ' + (e && e.stack || e)); process.exit(1); });
