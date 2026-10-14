#!/usr/bin/env node
// Bisect 2: does runDays itself stall on s44? (vs the finalize calls)
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 44, mode: 'succession-bisect2' });
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  tune.attachStanding(Game, m);
  attachLinkPipe(Game, m);
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  const pp = m.linkpipe;
  policy.daily = (G, ctx) => {
    try { pp.snapshot(G, 'leadcourt'); } catch (e) {}
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
    try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
  };
  console.log('starting runDays...');
  const result = await runDays(Game, policy, { days: 70, sampleEvery: 10 });
  console.log(`runDays returned: days=${result.days} endReason=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const t1 = Date.now();
  const lp = finalizeLinkPipe(Game, m);
  console.log(`finalizeLinkPipe ok (${((Date.now() - t1) / 1000).toFixed(1)}s), links=${(lp.links || []).length}`);
  const t2 = Date.now();
  fc.finalize(Game, m, result);
  console.log(`fc.finalize ok (${((Date.now() - t2) / 1000).toFixed(1)}s)`);
  const t3 = Date.now();
  sr.finalizeScale(Game, m);
  console.log(`sr.finalizeScale ok (${((Date.now() - t3) / 1000).toFixed(1)}s)`);
  const t4 = Date.now();
  tune.finalizeStanding(Game, m);
  console.log(`tune.finalizeStanding ok (${((Date.now() - t4) / 1000).toFixed(1)}s)`);
  console.log('ALL DONE');
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
setTimeout(() => { console.log('WALL TIMEOUT 100s — still inside runDays or a finalize'); process.exit(3); }, 100000).unref();
