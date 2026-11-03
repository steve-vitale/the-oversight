// test-accomplice-gate-r113.js -- PROOF for the r112 plot-drought mechanism
// (Lane B social r113, no src/js change). recruitAccomplices (betrayal.js)
// needs TWO accomplices scoring > 18, where
//   score = motive*0.5 + (30 if same-group as leader, else 10) + (30-trust)*0.4
// r112 argued from the formula that a warm village (trust ~60) throttles
// plots to zero: a zero-motive same-group mate scores exactly 18, and the
// gate is STRICT (>18). This test stages that state through the REAL
// Game.recruitAccomplices and asserts the outcome at trust 60 vs 20, plus
// that a 60-severity grievance breaks the warm block for its holder.
// Usage: node scripts/test-accomplice-gate-r113.js (seed fixed at 42).
'use strict';
const K = require('./godpath/lib'), T = K.reporter('accomplice-gate-r113');
(async () => {
  const G = await K.load({ seed: 42, narration: false });
  K.newRun(G);
  const v = G.state.village;
  const npcs = (v.roster || []).filter(id => id !== G.villagerId && G.getPerson(id));
  T.ok('roster has 11 NPCs', npcs.length === 11, 'npcs=' + npcs.length);
  const [leader, target, ...rest] = npcs;
  // Clean slate: no recorded grievances, no live conflicts, so motive is
  // ambition/prove only — then pick zero-motive mates for the edge case.
  const bs = G.betrayalState();
  bs.grievances = [];
  v.conflicts = [];
  const zeroMotive = rest.filter(id => { try { return G.motiveBetween(id, target).score === 0; } catch (e) { return false; } });
  T.ok('at least 2 zero-motive NPCs for the edge case', zeroMotive.length >= 2, 'zeroMotive=' + zeroMotive.length);
  const mates = zeroMotive.slice(0, 3);
  v.groups = [{ id: 'r113', kind: 'friends', members: [leader, ...mates] }];
  const setTrust = (t) => { v.trust = v.trust || {}; for (const id of npcs) v.trust[id] = t; };
  // WARM village: trust 60 everywhere. Zero-motive mate scores
  // 0*0.5 + 30 + (30-60)*0.4 = 18 — NOT > 18, so excluded.
  setTrust(60);
  const warm = G.recruitAccomplices(leader, target);
  T.ok('warm (trust 60): zero-motive mates NOT recruited', mates.every(m => !warm.includes(m)), 'recruited=' + JSON.stringify(warm));
  T.ok('warm (trust 60): NO accomplice recruited at all (plot cannot arm)', warm.length === 0, 'recruited=' + JSON.stringify(warm));
  // COOL village: trust 20. Same mates score 0 + 30 + 4 = 34 > 18.
  setTrust(20);
  const cool = G.recruitAccomplices(leader, target);
  T.ok('cool (trust 20): zero-motive mates recruited', mates.slice(0, 2).every(m => cool.includes(m)), 'recruited=' + JSON.stringify(cool));
  T.ok('cool (trust 20): exactly 2 accomplices (plot CAN arm)', cool.length === 2, 'recruited=' + JSON.stringify(cool));
  // GRIEVANCE breaks the warm block for its holder only: 60 severity ->
  // grievance 60 -> motive 48 -> score 24 + 30 - 12 = 42 > 18.
  setTrust(60);
  G.recordGrievance(mates[0], target, 'ambushed', 60);
  const motiveAfter = G.motiveBetween(mates[0], target).score;
  T.ok('60-severity grievance gives motive 48', motiveAfter === 48, 'motive=' + motiveAfter);
  const g = G.recruitAccomplices(leader, target);
  T.ok('warm + grievance: holder IS recruited', g.includes(mates[0]), 'recruited=' + JSON.stringify(g));
  T.ok('warm + ONE grievance: still < 2 accomplices (plot still cannot arm)', g.length < 2, 'recruited=' + JSON.stringify(g));
  T.done();
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
