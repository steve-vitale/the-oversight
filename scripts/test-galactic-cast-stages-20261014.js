// GALACTIC CAST STAGES 3-4 (audit 2026-10-14). Nothing called
// advanceCastStage(pid, 3|4): the cast arc stopped at stage 2. The encounter
// system now drives it (handoff: evidence/2026-10-11/galactic-cast.md):
// stage 3 when a known persona is faced (apStartEncounter / group / reveal),
// stage 4 + history flags at a decisive apOnCombatEnd. Knowledge gate: a
// stage-0 stranger fight never advances the stage (no name leak).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('galactic-cast-stages');

(async () => {
  const Game = await K.load({ seed: 20261014 });
  K.newRun(Game);
  Game.state.systemArrived = true;

  T.section('persona id mapping');
  const apIds = (Game.data.alienPlayers || []).map(p => p.id);
  T.ok('every cast persona is an alienPlayers id', (Game.CAST_PERSONAS || []).length === 5 &&
    Game.CAST_PERSONAS.every(pid => apIds.includes(pid)), JSON.stringify(Game.CAST_PERSONAS));

  T.section('heard-of persona: encounter start -> stage 3');
  {
    const pid = 'vex_marlowe';
    Game.advanceCastStage(pid, 2, 'test: producer note');
    const ok = Game.apStartEncounter(pid);
    T.ok('encounter started', !!ok);
    T.ok('stage 3 (faced) at encounter start', Game.castStage(pid) === 3, 'stage=' + Game.castStage(pid));
    if (Game.tbfight) { Game.tbfight = null; }
    delete Game.state.alienEncounter;
    Game.apOnCombatEnd(pid, 'won', { killed: true });
    const fl = (Game.castState().flags || {})[pid] || {};
    T.ok('stage 4 (known) after a decisive end', Game.castStage(pid) === 4, 'stage=' + Game.castStage(pid));
    T.ok('fought + killed flags set', !!fl.fought && !!fl.killed && !fl.spared, JSON.stringify(fl));
  }

  T.section('spared / beat_player flags');
  {
    const pid = 'sarge';
    Game.advanceCastStage(pid, 1, 'test: show');
    Game.apOnCombatEnd(pid, 'won', { killed: false });
    let fl = (Game.castState().flags || {})[pid] || {};
    T.ok('won without a kill -> spared', !!fl.spared && !fl.killed, JSON.stringify(fl));
    T.ok('decisive end from stage 1 -> stage 4', Game.castStage(pid) === 4);
    const pid2 = 'countess_sable';
    Game.advanceCastStage(pid2, 1, 'test: show');
    Game.apOnCombatEnd(pid2, 'lost', {});
    fl = (Game.castState().flags || {})[pid2] || {};
    T.ok('lost -> beat_player', !!fl.beat_player);
  }

  T.section('fled is not decisive');
  {
    const pid = 'pip_quindle';
    Game.advanceCastStage(pid, 1, 'test: show');
    Game.apOnCombatEnd(pid, 'fled', {});
    T.ok('fled leaves stage < 4', Game.castStage(pid) < 4, 'stage=' + Game.castStage(pid));
  }

  T.section('stage-0 stranger: no name leak');
  {
    const pid = 'dr_fenwick';
    const ap = Game.apState();
    delete ap.known[pid];
    const known = Game.apKnowsAlien(pid);
    Game.apOnCombatEnd(pid, 'won', { killed: false });
    T.ok('stranger fight keeps stage 0 (unless already revealed)', known || Game.castStage(pid) === 0, 'stage=' + Game.castStage(pid));
    T.ok('but the history flag is still recorded', !!((Game.castState().flags || {})[pid] || {}).fought);
    Game.apRevealAlien(pid, 'test reveal');
    T.ok('the reveal makes them faced (stage 3)', Game.castStage(pid) >= 3, 'stage=' + Game.castStage(pid));
  }

  T.done();
})();
