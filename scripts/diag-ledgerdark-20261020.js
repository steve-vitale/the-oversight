#!/usr/bin/env node
// diag-ledgerdark-20261020.js — diagnostic: moral-ledger magnitudes on the
// CONTROL substrate (SEATDRIVE=1, no table driver) at day ~90.
// Informs the ledgerdark road design with real numbers, not guesses.
'use strict';
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = parseInt(process.env.DAYS || '100', 10);

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const wd = WD.withWinDefer(base, policyId + '-windefer', policyId + ' + windefer');
  return SD.withSeatDrive(wd, policyId + '-seatdrive', policyId + ' + seatdrive');
}

function snapLedger(Game) {
  const out = {};
  try {
    const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
    for (const k of ['killed', 'protected', 'betrayed', 'foodShared', 'foodHoarded', 'showmanship', 'might', 'defiance', 'embrace', 'brokerage', 'exposed', 'unified', 'fractured', 'routed']) out[k] = (L[k] | 0);
  } catch (e) { out.err = 1; }
  try { out.promises = Game.tablePromiseTally ? Game.tablePromiseTally() : null; } catch (e) {}
  try { out.sw = Game.tableSwitchTally ? Game.tableSwitchTally() : null; } catch (e) {}
  try {
    out.branches = {};
    for (const p of ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant']) {
      const s = Game.tableBranch(p) || {};
      out.branches[p] = `${s.branch} ${s.dark}v${s.light}`;
    }
  } catch (e) {}
  try { out.foodStance = Game.foodStance ? Game.foodStance().key : null; } catch (e) {}
  return out;
}

async function main() {
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const policy = policyFor(policyId);
      const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
      await setupGame(Game);
      let snap90 = null;
      const oDaily = policy.daily;
      const wrapped = Object.assign({}, policy, {
        daily(G, ctx) {
          const r = oDaily ? oDaily(G, ctx) : undefined;
          try { if (((G.state.scholar || {}).day || 0) === 90 && !snap90) snap90 = snapLedger(G); } catch (e) {}
          return r;
        },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
      if (!snap90) snap90 = snapLedger(Game);
      const day = (Game.state.scholar || {}).day || 0;
      console.log(`== ${policyId} s${seed} day=${day} over=${!!Game.over}`);
      console.log('   ledger: ' + JSON.stringify(snap90));
    }
  }
}

if (require.main === module) main().catch(e => { console.error('DIAG FATAL:', e && e.message); process.exit(1); });
