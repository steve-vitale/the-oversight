#!/usr/bin/env node
// scripts/probe-feastdraw-20261017.js — why does the feast draw never pend?
// Wraps drawFeastScavenger + grantFeastBuff returns, samples feastDraw state.
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/probe-feastdraw-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
    console.error('PROBE STOP: need FEASTSCALE_R13=1 SEATDRIVE=0'); process.exit(2);
  }
  const seed = parseInt(process.env.SEEDS || '9101', 10);
  const { Game } = await loadGame({ seed, mode: 'feastdraw-probe' });
  await setupGame(Game);
  const log = [];
  const day = () => (Game.state.scholar || {}).day || 0;
  const og = Game.grantFeastBuff;
  Game.grantFeastBuff = function (...a) {
    const r = og.apply(this, a);
    log.push({ d: day(), ev: 'grant', ok: !!(r && r.ok), armed: !!r && !!r.armed });
    return r;
  };
  const od = Game.drawFeastScavenger;
  Game.drawFeastScavenger = function (...a) {
    const pre = { pendingEncounter: !!Game.pendingEncounter, pendingId: Game.pendingMonsterId || null };
    const r = od.apply(this, a);
    log.push({ d: day(), ev: 'draw', ret: r && (r.drawn ? 'DRAWN ' + r.monsterId : 'no:' + r.why), pre });
    return r;
  };
  const op = Game.feastDrawPending;
  let pendHits = 0;
  Game.feastDrawPending = function (...a) {
    const r = op.apply(this, a);
    if (r) { pendHits++; log.push({ d: day(), ev: 'pend-hit', mid: r.monsterId || r }); }
    return r;
  };
  const of = Game.faceFeastDraw;
  Game.faceFeastDraw = function (...a) {
    log.push({ d: day(), ev: 'faced' });
    return of.apply(this, a);
  };
  await quietLog(async () => { await runDays(Game, leadfeast, { days: 90, sampleEvery: 30 }); });
  console.log('pendHits=' + pendHits);
  for (const e of log) console.log(JSON.stringify(e));
})().catch(e => { console.error('PROBE FATAL', e); process.exit(1); });
