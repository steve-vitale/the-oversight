#!/usr/bin/env node
// verify-shelter-muster-20261020.js — mechanism pin for sim-emptydraft:
// for each raid-night, record WHY villagers are sheltered
// (v.sheltered[vid].reason: 'muster' vs other) and whether the engine's
// shelterMustered episode flag is live. Pins whether the sheltered drain
// is the engine's DAILY MUSTER (shelterMusterCheck — wave-4+ threat near
// Haven) rather than player-ordered sheltering.
//
// Usage (same substrate env as the census):
//   FEASTSCALE_R13=1 ... SEATDRIVE=0 NODEWITNESS=1 \
//   node scripts/verify-shelter-muster-20261020.js [SEEDS=64008]
'use strict';
const M = require('./measure-emptydraft-20261020');
const TF = require('./policies/tribfloor');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64005, 64008]).filter(Number.isFinite);
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10) : 180;

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, 'x');
  const wd = WD.withWinDefer(rp, `${tag}-windefer`, 'x');
  return SD.withSeatDrive(wd, `${tag}-windefer`, 'x');
}

async function runOne(seed, policyId) {
  const base = policyFor(policyId);
  const C = { raidNights: [], _fights: [], _says: [], _tickId: 0, instrumentErrors: 0 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    M.installRaidCensus(G, C);
    // outer decorator: runs after the census wrap recorded this night
    const inner = G.havenRaidTick;
    G.havenRaidTick = function () {
      const res = inner.apply(this, arguments);
      try {
        if (res === true && C.raidNights.length > extra.length) {
          const rn = C.raidNights[C.raidNights.length - 1];
          const v = G.state.village || {};
          const reasons = {};
          const purposes = {};
          const mustered = !!(v.shelterMustered);
          const musterThreat = mustered ? (v.shelterMustered.threat || '?') : null;
          const rawShape = {};
          for (const c of rn.comp) {
            if (c.cat === 'sheltered') {
              let val;
              try { val = (v.sheltered || {})[c.id]; } catch (e) { val = undefined; }
              const reason = (val && val.reason) || 'n/a';
              reasons[reason] = (reasons[reason] || 0) + 1;
              const shape = val === undefined ? 'undefined' : (typeof val === 'object' ? 'object' : typeof val);
              rawShape[shape] = (rawShape[shape] || 0) + 1;
            } else if (c.cat === 'away') {
              let p = 'n/a';
              try { p = (((v.away || {})[c.id]) || {}).purpose || 'n/a'; } catch (e) {}
              purposes[p] = (purposes[p] || 0) + 1;
            }
          }
          extra.push({ day: rn.day, engaged: rn.engaged, shelteredN: rn.counts.sheltered, awayN: rn.counts.away, reasons, rawShape, purposes, mustered, musterThreat });
        }
      } catch (e) { C.instrumentErrors++; }
      return res;
    };
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'emptydraft-verify', fullTelemetry: false });
  // The decorator must run AFTER the census wrap (outer), so the census
  // record it reads is the CURRENT night's. Install order: census first
  // (inside policy.setup), then this wrap — also inside policy.setup.
  const extra = [];
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  return extra;
}

(async () => {
  for (const policyId of ['leadfeast', 'belongfeast']) {
    for (const seed of SEEDS) {
      const rows = await runOne(seed, policyId);
      console.log(`== ${policyId} s${seed} ==`);
      for (const r of rows) {
        console.log(`d${r.day}: engaged=${r.engaged} sheltered=${r.shelteredN} away=${r.awayN} reasons=${JSON.stringify(r.reasons)} purposes=${JSON.stringify(r.purposes)} mustered=${r.mustered} threat=${r.musterThreat}`);
      }
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
