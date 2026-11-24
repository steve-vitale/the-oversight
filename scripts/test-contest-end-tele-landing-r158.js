// LANDING r158 — contest-end telemetry: every contest terminal emits contest_end.
//
// r155 defect (seed 1364): Tanya died day 27 in a Duel and the contest ledger
// entry stayed open — endDay null, outcome null at day 28 — because
// _contestDie never emits contest_end. The ledger is built from
// contest_fired / contest_end tele rows, so any contest ending in death (or
// refusal, or an arena loss) never closes. An unclosed entry's span is
// open-ended, so it also swallows later deaths into the wrong contest
// (the r155 day-28 monster deaths carried contestId 'duel', outcome null).
//
// Root cause: the only tele('contest_end') in src lived in _contestEnd
// (contests.js:5232). Three terminals never touch it: _contestDie (player +
// watched death), _contestRefuse, and the arena-lost branch of
// _contestArenaAfter. Same class as the held-counter gap the _cxCountHeld
// comment documents (r12): "every end path flows through here" was false
// for the counter, and it is still false for the end telemetry. Fix: emit
// the same-shaped tele from the three missing terminals. _contestEnd itself
// is untouched (its per-contestant emission in multi-take is existing
// analyzer-visible behavior; the ledger tolerates multiple ends per contest
// via its endDays array).
//
// Usage: node scripts/test-contest-end-tele-landing-r158.js
// Expects 14/14 PASS on fixed code; 2/14 on base (only the _contestEnd
// control passes without the fix).
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }

async function main() {
  const { Game } = await loadGame({ seed: 1364, fullTelemetry: true });
  await setupGame(Game);
  const tele = () => (Game.state.telemetry || []);
  const ends = () => tele().filter(t => t.type === 'contest_end');
  const endsSince = (n) => ends().slice(n);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0], W = roster[1];

  sec('T1 — watched death emits contest_end died');
  {
    const n0 = ends().length;
    const ac = { contestId: 'duel', participant: V, participants: [V, W], phase: 'watching', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
    Game.state.activeContest = ac;
    Game._contestDie(ac, 'the duel');
    const rows = endsSince(n0);
    ok('one contest_end row for the watched death', rows.length === 1, 'rows=' + rows.length);
    ok('row carries id duel + outcome died', rows[0] && rows[0].id === 'duel' && rows[0].outcome === 'died',
      rows[0] ? JSON.stringify({ id: rows[0].id, outcome: rows[0].outcome }) : 'no row');
    ok('row carries a numeric day', rows[0] && typeof rows[0].day === 'number', 'day=' + (rows[0] && rows[0].day));
    // Re-entrant death on the same contestant emits nothing twice.
    Game._contestDie(ac, 'the duel');
    ok('re-entrant death emits no second row', ends().length === n0 + 1, 'rows=' + (ends().length - n0));
    Game.state.activeContest = null;
  }

  sec('T2 — player death emits contest_end died');
  {
    // Stub the cheat-death hook so the test game survives the death path;
    // the tele fires before the cheat check, so this changes no assertion.
    const realCheat = Game.maybeCheatDeath;
    Game.maybeCheatDeath = () => true;
    const n0 = ends().length;
    const ac = { contestId: 'duel', participant: 'player', phase: 'fighting', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
    Game.state.activeContest = ac;
    Game._contestDie(ac, 'The damage was too much.');
    const rows = endsSince(n0);
    ok('one contest_end row for the player death', rows.length === 1, 'rows=' + rows.length);
    ok('row carries id duel + outcome died', rows[0] && rows[0].id === 'duel' && rows[0].outcome === 'died',
      rows[0] ? JSON.stringify({ id: rows[0].id, outcome: rows[0].outcome }) : 'no row');
    Game.maybeCheatDeath = realCheat;
    Game.state.activeContest = null;
  }

  sec('T3 — refusal emits contest_end refused');
  {
    const n0 = ends().length;
    const ac = { contestId: 'duel', participant: 'player', phase: 'choose', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
    Game.state.activeContest = ac;
    Game._contestRefuse(ac);
    const rows = endsSince(n0);
    ok('one contest_end row for the refusal', rows.length === 1, 'rows=' + rows.length);
    ok('row carries id duel + outcome refused', rows[0] && rows[0].id === 'duel' && rows[0].outcome === 'refused',
      rows[0] ? JSON.stringify({ id: rows[0].id, outcome: rows[0].outcome }) : 'no row');
    Game.state.activeContest = null;
  }

  sec('T4 — arena loss emits contest_end died (phoenix hold: lost)');
  {
    const n0 = ends().length;
    const ac = { contestId: 'duel', participant: 'player' };
    Game.state.activeContest = ac;
    Game.state.phoenixLink = null;
    Game._contestArenaAfter({}, 'lost');
    const rows = endsSince(n0);
    ok('one contest_end row for the arena loss', rows.length === 1, 'rows=' + rows.length);
    ok('row carries id duel + outcome died', rows[0] && rows[0].id === 'duel' && rows[0].outcome === 'died',
      rows[0] ? JSON.stringify({ id: rows[0].id, outcome: rows[0].outcome }) : 'no row');
    // Phoenix hold: tbEnd routes a held loss here without calling playerDeath —
    // the fire holds the death, so it is not a death yet: outcome is 'lost'.
    const n1 = ends().length;
    const ac2 = { contestId: 'duel', participant: 'player' };
    Game.state.activeContest = ac2;
    Game.state.phoenixLink = { bearerIsPlayer: true };
    Game._contestArenaAfter({}, 'lost');
    const rows2 = endsSince(n1);
    ok('held loss emits one contest_end row', rows2.length === 1, 'rows=' + rows2.length);
    ok('held row carries outcome lost, not died', rows2[0] && rows2[0].outcome === 'lost',
      rows2[0] ? JSON.stringify({ outcome: rows2[0].outcome }) : 'no row');
    Game.state.phoenixLink = null;
    Game.state.activeContest = null;
  }

  sec('T5 — control: _contestEnd still emits contest_end won');
  {
    const n0 = ends().length;
    const ac = { contestId: 'duel', participant: 'player' };
    Game.state.activeContest = ac;
    Game._contestEnd(ac, 'won', false);
    const rows = endsSince(n0);
    ok('one contest_end row for the win', rows.length === 1, 'rows=' + rows.length);
    ok('row carries id duel + outcome won', rows[0] && rows[0].id === 'duel' && rows[0].outcome === 'won',
      rows[0] ? JSON.stringify({ id: rows[0].id, outcome: rows[0].outcome }) : 'no row');
    Game.state.activeContest = null;
  }

  console.log(`\ncontest-end-tele r158: ${pass} passed, ${fail} failed` + (failures.length ? '\nFAILURES:\n- ' + failures.join('\n- ') : ''));
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('TEST ERROR: ' + (e && e.stack || e)); process.exit(2); });
