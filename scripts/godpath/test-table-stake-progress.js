#!/usr/bin/env node
// Prepared Table states exercise actual public prompts; no winning-run claim.
'use strict';
const K = require('./lib'), T = K.reporter('table-stake-progress');
const cap = require('../policies/capable');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar, pg = G.progState();
  s.day = 100; G.state.systemArrived = true;
  s.godpath = { path: 'forager', subclass: 'gardener', since: 80 };
  s.godhood = { active: ['living_garden'], recognized: { living_garden: 85 } };
  delete process.env.CAPABLE_READ_STAKES;
  const hidden = { branch: 'light', get meters() { throw new Error('default policy consulted hidden meters'); } };
  const failures = []; let cases = 0;
  for (const [path, def] of Object.entries(G.data.tableBeats.paths)) for (const [moral, stake] of Object.entries(def.stake || {})) {
    for (const ready of [false, true]) {
      G.over = false; pg.table = {}; pg._teleSeen = {};
      G.endingKeyLock(); G.endingKeyEnter(path, moral);
      const current = stake.gte != null ? stake.gte - (ready ? 0 : 1) : stake.lte + (ready ? 0 : 1);
      const state = G.tableState(); Object.assign(state, { path, phase: 'challenge', branch: moral, beat: def.beat, meters: { [stake.meter]: current } });
      G.tableRunBeat();
      const choice = s.tableChoices.options.find(o => o.id === 'beat:build');
      if (!choice) throw new Error(path + '/' + moral + ': actual build choice absent');
      const score = cap.scoreTableOption(G, choice, hidden);
      const effect = G.tableBuildBeat(state).choices[0].effects(state);
      if ((ready ? score < 4 : score >= -40) || (!ready && !effect.fail)) failures.push(path + '/' + moral + '/' + ready + '/' + score);
      cases++;
    }
  }
  T.ok(cases + ' real path/moral boundary prompts are scored from their visible meter line', cases >= 28 && failures.length === 0, failures.join(', '));
  const option = { id: 'beat:build', label: 'Answer with your build. (needs audience 4+)' };
  const fake = prompt => ({ state: { scholar: { tableChoices: { prompt } } } });
  T.ok('public progress wins over contradictory private state', cap.scoreTableOption(fake('<p><i>audience 3</i></p>'), option, { meters: { audience: 99 } }) < -40);
  T.ok('unrelated numbers in prose do not become a meter reading', cap.scoreTableOption(fake('<p>The audience has 3 questions.</p>'), option, hidden) > -10);
  T.ok('a missing public reading does not become a fabricated zero', cap.scoreTableOption({}, option, hidden) > -10);
  process.env.CAPABLE_READ_STAKES = '0';
  T.ok('explicit opt-out reproduces the word-only decision', cap.scoreTableOption(fake('<i>audience 3</i>'), option, hidden) > -10);
  delete process.env.CAPABLE_READ_STAKES;
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
