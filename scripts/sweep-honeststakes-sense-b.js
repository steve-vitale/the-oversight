#!/usr/bin/env node
// sweep-honeststakes-sense-b.js — SENSE RECORDER for the honest-stakes fix
// (arm sim-honeststakes-b). The arenadecomp recorder caps sysSayLines at 400
// (first-400 sample), so late choice screens (e.g. seed 43008 d28) never
// reach the committed corpora. This focused recorder re-runs ONE seed
// (43008, winseek, 150d) with an UNCAPPED capture of exactly the
// choice-screen record lines ("This one has killed N before" / "No one has
// died in this one yet") plus the contest takes for the join. Pure
// observation: a call-through sysSay wrap (the arenadecomp lesson — sysSay
// does NOT route through say) and a call-through contestInterruption wrap;
// no Game-state writes, no RNG. Run once per leg:
//   node scripts/sweep-honeststakes-sense-b.js  (OUT env required)
// Usage: OUT=evidence/2026-11-09/perseed-honeststakes-b/sense-43008-after.json node scripts/sweep-honeststakes-sense-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const SEED = 43008, DAYS = 150;
const OUT = process.env.OUT;
if (!OUT) { console.error('FATAL: OUT env required'); process.exit(2); }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'honeststakes-b-sense', fullTelemetry: false });
  await setupGame(Game);
  const records = [];
  const takes = [];
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  const oSysSay = Game.sysSay;
  if (typeof oSysSay === 'function') Game.sysSay = function (txt) {
    try {
      const line = String(txt == null ? '' : txt);
      if (/has killed \d+ before|No one has died in this one yet/.test(line)) {
        records.push({ day: dayOf(), line });
      }
    } catch (e) {}
    return oSysSay.apply(this, arguments);
  };
  const oCI = Game.contestInterruption;
  if (typeof oCI === 'function') Game.contestInterruption = function (contest, participantIds) {
    let r;
    try { r = oCI.apply(this, arguments); } catch (e) { throw e; }
    try { takes.push({ day: dayOf(), contestId: (contest && contest.id) || null, name: (contest && contest.name) || null }); } catch (e) {}
    return r;
  };
  const result = await runDays(Game, winseek, { days: DAYS, manifest: null });
  const payload = { seed: SEED, days: result.days, endReason: result.endReason,
    ledger: (Game.state || {}).contestDeathsById || {}, records, takes };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log('wrote ' + OUT + ' records=' + records.length + ' takes=' + takes.length + ' ledger=' + JSON.stringify(payload.ledger));
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
