#!/usr/bin/env node
// scripts/test-feastdeed-73678.js — sim-deedtest-a follow-up:
// which half of the food-thesis deed failed on clean 73678?
// DIAG ONLY: one seed (73678), clean arm, feastdeed-diag +
// the deedtest recorders. Prints a JSON summary to stdout;
// the caller pipes it through a sibling cat into the corpus
// file (flap-proof pattern from test-deedtest-sweep.js).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag, analyzeFeastdraw } = require('./policies/feastdraw-diag');
const { newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag } = require('./policies/nonworldkill-diag');
const { newStore: newDtStore, installDeedtestDiag, withDeedtestDiag, analyzeDeed } = require('./policies/deedtest-diag');
const { newStore: newFeStore, installFeastdeedDiag, withFeastdeedDiag } = require('./policies/feastdeed-diag');

async function main() {
  const pid = process.argv[2] || 'clean';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'clean') process.env.FEASTDRAWCLEAN = '1';
  else delete process.env.FEASTDRAWCLEAN;
  delete process.env.COMPETENT_SEEK_FIGHTS;
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  process.env.DEEDTEST = '1';
  process.env.FEASTDEED = '1';
  const fdStore = newFdStore(), nwkStore = newNwkStore(), dtStore = newDtStore(), feStore = newFeStore();
  const inner = pid === 'clean' ? feastdrawDriveoffClean : tableseatNowait;
  const base = withFeastdeedDiag(withDeedtestDiag(withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'feastdeed 73678', nwkStore), 'feastdraw-diag', 'feastdeed 73678', fdStore), 'deedtest-diag', 'feastdeed 73678', dtStore), 'feastdeed-diag', 'feastdeed 73678', feStore);
  const { Game } = await loadGame({ seed: 73678, mode: 'feastdeed-73678-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  try { installDeedtestDiag(Game, dtStore); } catch (e) {}
  try { installFeastdeedDiag(Game, feStore); } catch (e) {}
  const policy = Object.assign({}, base, {
    daily(G, ctx) { if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} } },
    upkeep(G, ctx) { if (base.upkeep) { try { return base.upkeep(G, ctx); } catch (e) {} } },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const prog = ((Game.state || {}).scholar || {}).prog || {};
  const pg = Game.progState ? Game.progState() : {};
  let seat = null, gate = null;
  try { seat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; } catch (e) {}
  try { gate = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null; } catch (e) {}
  const fdAn = analyzeFeastdraw({ grants: fdStore.grants, draws: fdStore.draws, faces: fdStore.faces, driveoffs: fdStore.driveoffs, clears: fdStore.clears }, { starts: nwkStore.starts, ends: nwkStore.ends });
  const dtAn = analyzeDeed({ events: dtStore.events, kills: dtStore.kills }, { starts: nwkStore.starts, ends: nwkStore.ends }, (Game.state || {}).waveKillLog || []);
  const out = {
    seed: 73678, policy: pid, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, maxArc: pg.arc || 1,
    sentimentTaught: !!pg.sentimentTaught, feastSurgeUsed: !!prog.feastSurgeUsed,
    feastSurgeBy: prog.feastSurgeBy || null,
    foodDeeds: !!(pg.sentimentTaught && prog.feastSurgeUsed),
    tableSeat: seat, deedGate: gate,
    sentimentEvents: feStore.sentiment, spendEvents: feStore.spends,
    spendMarkedCount: feStore.spends.filter(s => s.marked).length,
    feastdrawOutcomes: fdAn.drawOutcomes,
    strikeTbKills: dtAn.tbKillDeeds.filter(t => t.mid === 'strike'),
    diagErrs: { feastdraw: fdStore.errs, nonworldkill: nwkStore.errs, deedtest: dtStore.errs, feastdeed: feStore.errs },
  };
  process.stdout.write(JSON.stringify(out) + '\n');
}
if (require.main === module) main().catch(e => { console.error('FEASTDEED 73678 FAILED:', (e && e.stack) || e); process.exit(1); });
