// CONTEST INTERFERENCE DETERMINISM (audit 2026-10-14). contestEngine
// promises no Math.random in the resolution path (same state = same fate,
// reload replays it), but the verdict's apContestInterference rolled
// Math.random for sadistic rigging and the benevolent lifeline. Proof: the
// same active contest, resolved twice with different Math.random states,
// gets identical interference.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('contest-interference-determinism');

(async () => {
  const Game = await K.load({ seed: 20261014 });
  K.newRun(Game);
  Game.state.systemArrived = true;
  Game.unlockedWave = () => 2;
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);

  // Two sadistic rivals and a bonded benevolent ally, all live.
  const ap = Game.apState();
  ap.met = ap.met || {};
  ap.met.vex_marlowe = { encounters: 3, bond: 0 };
  ap.met.countess_sable = { encounters: 3, bond: 0 };
  ap.met.rax_dentist = { encounters: 3, bond: 0 };
  ap.met.wren = { encounters: 3, bond: 3 };

  const realRandom = Math.random;
  function resolveWith(ac, opts, rnd) {
    ap.lastRigDay = -999; ap.lastLifelineDay = -999;
    Math.random = () => rnd;
    try { return Game.apContestInterference(ac, opts); }
    finally { Math.random = realRandom; }
  }

  T.section('verdict (sadistic rigging)');
  // The larger occupation pool changes participant IDs in the seeded draw.
  // Twelve keys can honestly all rig; test both branches across64 day keys
  // while retaining exact replay invariance for every individual contest.
  const RIG_DAYS = 64;
  let diffs = 0, rigs = 0;
  for (let d = 1; d <= 12; d++) {
    Game.state.scholar.day = d;
    const ac = { contestId: 'blood_pit', participant: vid, participants: [vid], phase: 'verdict' };
    const a = resolveWith(ac, undefined, 0.01);
    const b = resolveWith(ac, undefined, 0.99);
    if (a.winMod !== b.winMod || a.note !== b.note) diffs++;
    if (a.winMod < 0) rigs++;
  }
  T.ok('same ac -> identical interference regardless of Math.random', diffs === 0, diffs + '/' + RIG_DAYS + ' days differed');
  T.ok('rigging still happens on some days (not zeroed)', rigs > 0 && rigs < RIG_DAYS, 'rigged ' + rigs + '/' + RIG_DAYS);

  T.section('player killing blow (benevolent lifeline)');
  let ldiffs = 0, saves = 0;
  for (let d = 1; d <= 12; d++) {
    Game.state.scholar.day = d;
    const ac = { contestId: 'blood_pit', participant: 'player', participants: ['player'], phase: 'choice' };
    const a = resolveWith(ac, { forPlayer: true }, 0.01);
    const b = resolveWith(ac, { forPlayer: true }, 0.99);
    if (a.deathSave !== b.deathSave) ldiffs++;
    if (a.deathSave) saves++;
  }
  T.ok('lifeline identical regardless of Math.random', ldiffs === 0, ldiffs + '/12 days differed');
  T.ok('lifeline still fires on some days', saves > 0 && saves < 12, 'saved ' + saves + '/12');

  T.done();
})();
