#!/usr/bin/env node
// det-gate-storageshed-b6.js — gate-off byte-identity + shed determinism.
// Runs 4 configs (seeds 63001/63002 x leadfeast/belongfeast, 40d) with
// STORAGESHED=0 and prints a canonical sha256 digest of the end state.
// Run once on UNPATCHED game.js, once on PATCHED game.js (gate off):
// the digests must be byte-identical (the patch adds zero behavior when
// the gate is off). Also asserts the _storageShed ledger was never created.
// No sim sweep may start until these match.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 STORAGESHED=0 \
//   node scripts/det-gate-storageshed-b6.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.STORAGESHED = '0';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const cfgs = [[63001, 'leadfeast'], [63001, 'belongfeast'], [63002, 'leadfeast'], [63002, 'belongfeast']];

function canon(v) {
  // Canonical digest inputs: end-of-run identity of the village.
  return {
    days: v.days, endReason: v.endReason, won: v.won, rank: v.rank,
    rosterEnd: v.rosterEnd, pantryKcal: v.pantryKcal,
    rotFresh: v.rotFresh, rotPreserved: v.rotPreserved,
    starveDays: v.starveDays, villagerDays: v.villagerDays,
    rackKcalPlenty: v.rackKcalPlenty, rackDaysPlenty: v.rackDaysPlenty,
    rackKcalOther: v.rackKcalOther, rackDaysOther: v.rackDaysOther,
    deaths: v.deaths.map(d => d.day + '|' + d.who + '|' + d.cause),
    chan: v.chan, shareKcal: v.shareKcal,
    ledgerCreated: v.ledgerCreated,
  };
}

(async () => {
  let ok = true;
  for (const [seed, polId] of cfgs) {
    const pol = polId === 'belongfeast' ? belongfeast : leadfeast;
    const { Game } = await loadGame({ seed, mode: 'storageshed-b6-det', fullTelemetry: false });
    await setupGame(Game);
    const W = { deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, starveDays: 0,
      rackKcalPlenty: 0, rackKcalOther: 0, rackDaysPlenty: 0, rackDaysOther: 0, villagerDays: 0,
      rot_fresh: 0, rot_preserved: 0 };
    const rotCounted = new Set();
    const oSweep = Game.sweepSpoiled;
    if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
            W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
          }
        }
      } catch (e) {}
      return oSweep.apply(this, arguments);
    };
    const oSP = Game.stockPantry;
    if (typeof oSP === 'function') Game.stockPantry = function (kcal) {
      try { W.chan.ambient = (W.chan.ambient || 0) + (kcal || 0); } catch (e) {}
      return oSP.apply(this, arguments);
    };
    const oDie = Game.registerDeath;
    if (typeof oDie === 'function') Game.registerDeath = function (opts) {
      try {
        const kind = String((opts && opts.kind) || '');
        if (kind === 'person' || kind === 'villager') {
          const who = String((opts && (opts.villagerId || opts.name)) || '?');
          const day = (Game.state.scholar || {}).day || 0;
          const cause = String((opts && opts.cause) || '?').toLowerCase().slice(0, 48);
          const key = who + '|' + day + '|' + cause;
          if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: who.slice(0, 24), cause }); }
        }
      } catch (e) {}
    };
    const policy = Object.assign({}, pol);
    policy.daily = (G, ctx) => {
      try {
        const roster = (((G.state || {}).village || {}).roster || []);
        W.villagerDays += roster.length;
      } catch (e) {}
      if (pol.daily) return pol.daily(G, ctx);
    };
    const result = await runDays(Game, policy, { days: 40, manifest: null });
    let ledgerCreated = false, rosterEnd = 0, pantryKcal = 0;
    try {
      const v = Game.state.village || {};
      ledgerCreated = !!v._storageShed;
      rosterEnd = (v.roster || []).length;
      pantryKcal = Math.round((v.pantry || []).reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0));
    } catch (e) {}
    const v = { days: result.days, endReason: result.endReason, won: !!Game.won,
      rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
      rosterEnd, pantryKcal, rotFresh: Math.round(W.rot_fresh), rotPreserved: Math.round(W.rot_preserved),
      starveDays: W.starveDays, villagerDays: W.villagerDays,
      rackKcalPlenty: Math.round(W.rackKcalPlenty), rackKcalOther: Math.round(W.rackKcalOther),
      rackDaysPlenty: W.rackDaysPlenty, rackDaysOther: W.rackDaysOther,
      deaths: W.deaths, chan: W.chan, shareKcal: Math.round(W.shareKcal), ledgerCreated };
    const digest = crypto.createHash('sha256').update(JSON.stringify(canon(v))).digest('hex').slice(0, 32);
    console.log(`seed=${seed} policy=${polId} digest=${digest} ledger=${ledgerCreated}`);
    if (ledgerCreated) { console.log(`FAIL ledger created with gate off (seed=${seed} ${polId})`); ok = false; }
  }
  console.log(ok ? 'DET-GATE: 4/4 configs, ledger never created' : 'DET-GATE FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('DET CRASH', e); process.exit(2); });
