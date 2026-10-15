#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('resumed-table');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar, d = G.deedState(), pg = G.progState();
  G.state.systemArrived = true; s.day = 100; s.integration = 45;
  G.scaleRank = () => 'regional';
  pg.sentimentTaught = true; s.prog = s.prog || {}; s.prog.feastSurgeUsed = true;
  pg.crises = { a: 1, b: 1 }; d.contestsSurvived = 2;
  for (const [w, n] of [[1, 4], [2, 4], [4, 2], [5, 1]]) {
    const ms = G.data.monsters.filter(m => m.wave === w && !m.campaignOnly).slice(0, n);
    for (const m of ms) d.wavesFaced[m.id] = w;
  }
  T.ok('late-wave encounters satisfy the lesser-seat late-wave bar', G.tableSeat().seat === 'lesser' && G.tableSeat().detail.w3 === 3, JSON.stringify(G.tableSeat()));
  for (const pid of ['feared', 'beloved', 'relay']) {
    const a = G.tableStanding(pid, 120), b = G.tableStanding(pid, 240);
    T.ok(`${pid}: two strong ledgers no longer tie at 100`, a < b && b < 100, `${a}/${b}`);
  }
  const table = G.tableState(); table.path = 'feared'; table.phase = 'challenge';
  s.kcal = 3000;
  G.tableFail('test: the footage failed');
  T.ok('a failed door burns a real food cost', s.kcal === 2500);
  T.ok('the failed path closes for this sitting', table.failedPaths.includes('feared') && table.phase === 'downgrade');
  const before = table.path; G.tableDowngradePick('feared');
  T.ok('the closed path cannot be retried', table.path === before && table.phase === 'downgrade');
  G.tableDowngradePick('assimilated');
  T.ok('the fallback begins with a weaker opening advantage', table.path === 'assimilated' && table.meters.comfort === 1, JSON.stringify(table.meters));
  G.tableFail('test: the second challenge failed');
  T.ok('two played failures end the sitting without a free win', G.over && !G.won && table.phase === 'done' && !s.tableChoices);
  G.over = false; table.weakened = 0; table.failedPaths = []; table.path = 'feared';
  table.phase = 'challenge'; table.meters = { terror: 3 };
  G.tableFinals();
  T.ok('insufficient closing leverage fails the door instead of granting a final', table.phase === 'downgrade');
  table.weakened = 0; table.failedPaths = []; table.path = 'feared';
  table.phase = 'challenge'; table.meters = { terror: 4 };
  G.tableFinals();
  T.ok('carrying the declared stake reaches the final choices', table.phase === 'finals' && !!s.tableChoices);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
