#!/usr/bin/env node
// scripts/test-palisade-sweep-20261025.js — sim-palisade-a PILOT.
// Shared band seeds 73671-73678, 180d death-aware, tableseat-nowait
// substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), mirroring the
// landed spawnsrc sweep's invocation (loadGame seed/mode/
// fullTelemetry:false, setupGame, runDays sampleEvery 10).
// Pairing: the silent sim say is a no-op, so a record-only say
// wrapper cannot move trajectories; each RAID line in the recorded
// stream starts a raid window, and the escalation beat (proven
// adjacent in test-palisade-escalation-20261025.js) is the very
// next line iff present. Raid windows are matched in order to the
// raftdraft census raids; wmax comes from the census raiders'
// crisisWaveOf waves. Guards (published control band): deaths 234,
// wins 4/8, national-ever 7/8, raids 85, raiders 361 — ANY deviation
// is NO-GO for a narration-only change.
// Usage: EVID=evidence/2026-10-25/perseed-sim-palisade-a node
//   scripts/test-palisade-sweep-20261025.js [--one <seed> | --summary]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newStore: newRaftStore, installRaftdraftDiag, withRaftdraftDiag } = require('./policies/raftdraft-diag');

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const CONTROL = { raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4 };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) { lastErr = e; if (a < 8) sleepMs(Math.min(10000, 1000 * a)); }
  }
  throw lastErr;
}
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-palisade-a'); }

async function runOne(seed, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.RAFTDRAFT = '1';
  const raftStore = newRaftStore();
  const base = withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore);
  const { Game } = await loadGame({ seed, mode: 'palisade-pilot', fullTelemetry: false });
  const said = [];
  Game.say = function () { said.push(Array.prototype.slice.call(arguments).join(' ')); };
  Game.sysSay = function () {};
  await setupGame(Game);
  try { installRaftdraftDiag(Game, raftStore); } catch (e) {}
  const hist = { maxRank: 0 };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const r = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[r] || 0);
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const deaths = result.samples.deaths || [];
  const endRank = (() => { try { return Game.scaleRank() || 'village'; } catch (e) { return 'village'; } })();
  const nationalEver = Math.max(hist.maxRank, RANK_ORDER[endRank] || 0) >= 2 ? 1 : 0;
  // Pair said-stream RAID lines (in order) to census raids (in order).
  const raidLines = [];
  for (let i = 0; i < said.length; i++) {
    if (said[i].indexOf('🐗 RAID —') === 0) {
      raidLines.push({ idx: i, line: said[i], next: said[i + 1] || null });
    }
  }
  const censusRaids = raftStore.raids || [];
  const paired = censusRaids.map((r, k) => {
    const w = (r.raiders || []).map(x => x.wave | 0);
    const wmax = w.length ? Math.max.apply(null, w) : 1;
    const win = raidLines[k] || null;
    const beatPresent = !!(win && win.next && win.next.indexOf('bigger than the usual teeth at the door') !== -1);
    return {
      day: r.day, wmax, raidN: (r.raiders || []).length,
      raidLine: win ? win.line : null, beatPresent,
      beatLine: beatPresent ? win.next : null,
    };
  });
  const row = {
    policy: 'palisade', seed, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason, won: Game.won ? 1 : 0,
    nationalEver, deathTotal: deaths.length,
    raids: paired, raidLineCount: raidLines.length, censusRaidCount: censusRaids.length,
    raftErrs: raftStore.errs, saidTotal: said.length,
  };
  if (evidDir) writeFileRetry(path.join(evidDir, 's' + seed + '-palisade.json'), JSON.stringify(row, null, 1) + '\n');
  console.log(`  [palisade seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} won=${row.won} natEver=${row.nationalEver} deaths=${row.deathTotal} censusRaids=${row.censusRaidCount} raidLines=${row.raidLineCount} beatRaids=${paired.filter(p => p.beatPresent).length} wmax3plus=${paired.filter(p => p.wmax >= 3).length} raftErrs=${row.raftErrs}`);
  return row;
}

async function summary() {
  const dir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, 's' + seed + '-palisade.json');
    try { rows.push(JSON.parse(fs.readFileSync(p, 'utf8'))); }
    catch (e) { console.log('MISSING ' + p); }
  }
  if (rows.length !== SEEDS.length) { console.log('PILOT SUMMARY INCOMPLETE: ' + rows.length + '/' + SEEDS.length); process.exit(1); }
  const raids = rows.reduce((t, r) => t.concat(r.raids), []);
  const raiders = raids.reduce((t, r) => t + r.raidN, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const wins = rows.reduce((t, r) => t + r.won, 0);
  const nat = rows.reduce((t, r) => t + r.nationalEver, 0);
  const w3 = raids.filter(r => r.wmax >= 3);
  const wLow = raids.filter(r => r.wmax < 3);
  const beatOnW3 = w3.filter(r => r.beatPresent).length;
  const beatOnLow = wLow.filter(r => r.beatPresent).length;
  const pairingOk = rows.every(r => r.raidLineCount === r.censusRaidCount) && rows.every(r => r.raftErrs === 0);
  const guardsOk = raids.length === CONTROL.raids && raiders === CONTROL.raiders && deaths === CONTROL.deaths && wins === CONTROL.wins && nat === CONTROL.nationalEver;
  console.log('PILOT-SUMMARY raids=' + raids.length + ' (control ' + CONTROL.raids + ') raiders=' + raiders + ' (control ' + CONTROL.raiders + ') deaths=' + deaths + ' (control ' + CONTROL.deaths + ') wins=' + wins + '/8 (control ' + CONTROL.wins + ') nationalEver=' + nat + '/8 (control ' + CONTROL.nationalEver + ')');
  console.log('PILOT-BEAT wmax>=3 raids=' + w3.length + ' beatPresent=' + beatOnW3 + ' (' + (w3.length ? Math.round(100 * beatOnW3 / w3.length) : 0) + '%) | wmax<3 raids=' + wLow.length + ' beatPresent=' + beatOnLow + ' (' + (wLow.length ? Math.round(100 * beatOnLow / wLow.length) : 0) + '%)');
  console.log('PILOT-PAIRING pairingOk=' + pairingOk + ' (raidLineCount==censusRaidCount per seed, raftErrs==0)');
  console.log('PILOT-VERDICT guardsExact=' + guardsOk + ' beat100_0=' + (beatOnW3 === w3.length && beatOnLow === 0) + ' pairingOk=' + pairingOk + ' -> ' + (guardsOk && beatOnW3 === w3.length && beatOnLow === 0 && pairingOk ? 'GO' : 'NO-GO'));
  if (!guardsOk || beatOnW3 !== w3.length || beatOnLow !== 0 || !pairingOk) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--summary')) return summary();
  if (args.includes('--one')) return runOne(parseInt(args[args.indexOf('--one') + 1], 10), evidDirOf());
  for (const seed of SEEDS) await runOne(seed, evidDirOf());
  return summary();
}
main().catch(e => { console.error('PALISADE-SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
