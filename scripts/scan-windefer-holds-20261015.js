#!/usr/bin/env node
// scan-windefer-holds-20261015.js — supplementary: hunt for a NATURAL hold
// (sim-findings #310, 2026-10-15).
//
// The pilot (8 seeds x {leadfeast, belongfeast} x {control, armed}) fired
// ZERO holds — every offer-time village failed the survivability bar, so
// the hold→walk-at-90 path has never executed on a real run (only on
// stubs). This scan runs the ARMED side only on 12 fresh seeds per policy
// to see whether any natural hold fires in the wild and what follows.
// NOT a re-score of the pre-registered verdict — supplementary validation.
//
// Usage: FEASTSCALE_R13=1 WINPURSUIT=1 WINDEFER=1 node scripts/scan-windefer-holds-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const WT = require('./policies/wintrace');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SCAN STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-windefer-scan');

(async () => {
  let holdsTotal = 0;
  for (const policyId of ['belongfeast', 'leadfeast']) {
    const inner = policyId === 'leadfeast' ? WD.leaddefer : WD.belongdefer;
    for (const seed of SEEDS) {
      process.env.WINTRAZE = '1';
      const base = WT.withWinTrace(inner, `${policyId}-traced-scan`, 'hold scan');
      const { Game } = await loadGame({ seed, mode: 'windefer-scan', fullTelemetry: false });
      await setupGame(Game);
      let runCtx = null;
      const policy = Object.assign({}, base);
      const oSetup = base.setup;
      policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
      const oDaily = base.daily;
      policy.daily = (G, ctx) => { if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} } };
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
      const decisions = ((runCtx && runCtx._windefer && runCtx._windefer.decisions) || []).slice();
      const holds = decisions.filter(d => d.hold);
      holdsTotal += holds.length;
      const att = WT.attribute(Game, runCtx || {}, { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason });
      const out = { seed, policyId, gameDays: result.gameDays, endReason: result.endReason,
        won: Game.won ? 1 : 0, decisions, verdict: att.verdict, pathsEntered: att.pathsEntered,
        deferDays: att.deferDays, evidence: att.evidence };
      fs.mkdirSync(EVID, { recursive: true });
      fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
      const dstr = decisions.map(d => `d${d.day}:${d.hold ? 'HOLD' : 'walk'}`).join(' ');
      console.log(`  [${policyId} s${seed}] days=${result.gameDays} end=${result.endReason} won=${out.won} verdict=${att.verdict}${dstr ? ' decisions=[' + dstr + ']' : ''}`);
      for (const h of holds) {
        console.log(`    HOLD d${h.day}: sick=${h.sick} wounded=${h.wounded} pantry=${h.freshDays}d window=${h.window}d — ${h.why}`);
      }
    }
  }
  console.log(`\nSCAN DONE: ${holdsTotal} natural hold(s) across ${SEEDS.length * 2} runs.`);
})().catch(e => { console.error('SCAN CRASH:', e); process.exit(2); });
