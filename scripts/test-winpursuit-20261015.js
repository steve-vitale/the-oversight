#!/usr/bin/env node
// scripts/test-winpursuit-20261015.js — proof for the winpursuit layer
// (sim-wintrace PHASE 2, 2026-10-15).
//
// RED (the gap, on shipped code): with WINPURSUIT unset the wrapper
// delegates byte-identically (30d day-hashes identical to the unwrapped
// policy) and the table modal goes unanswered on a table-reaching seed
// (leadfeast s22, table sits ~day 47): tableAnswers is 0/undefined after
// 70 days.
// GREEN: with WINPURSUIT=1 the same 70d run answers the modal
// (tableAnswers > 0).
// HONESTY: layerOn() reads the env exactly.
//
// Usage: node scripts/test-winpursuit-20261015.js
'use strict';
// Substrate: the r13 feast layer must be ON — it is what marks the
// table's food-thesis deed (feastSurgeUsed) on the courtship road, so the
// table actually sits on seed 22 ~day 47. Without it there is no modal to
// answer and both phases test nothing.
process.env.FEASTSCALE_R13 = '1';
const WP = require('./policies/winpursuit');
const FS = require('./policies/feastscale');

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');

  async function runWith(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'winpursuit-proof', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    let runCtx = null;
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hs.push(G.state.scholar.day + ':' + dayHash(G)); return base ? base(G, ctx) : undefined; };
    const oSetup = policy.setup;
    wrapped.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 30 }); });
    return { hs, runCtx, won: !!Game.won, Game };
  }

  console.log('RED — gate-off purity + the unanswered modal');
  delete process.env.WINPURSUIT;
  check('layerOn false when unset', WP.layerOn() === false);
  {
    const a = await runWith(FS.leadfeast, 11, 30);
    const b = await runWith(WP.leadpursuit, 11, 30);
    const same = a.hs.length === b.hs.length && a.hs.every((h, i) => h === b.hs[i]);
    check('gate-off byte-identical to unwrapped (30d)', same,
      `lengths ${a.hs.length}/${b.hs.length}`);
  }
  {
    // leadfeast s22: the table sits ~day 47 (measured in the diagnostic
    // sweep). Without the layer the modal pends unanswered.
    const r = await runWith(FS.leadfeast, 22, 70);
    const answers = (r.runCtx && r.runCtx.tableAnswers) || 0;
    let invited = false;
    try { const pg = r.Game.progState(); invited = !!(pg.tableWaiting || pg.tableDone); } catch (e) {}
    check('RED: table was invited (modal existed)', invited === true);
    check('RED: unwrapped policy answers nothing (tableAnswers=0)', answers === 0, `answers=${answers}`);
  }

  console.log('GREEN — the layer drives the modal');
  process.env.WINPURSUIT = '1';
  check('layerOn true when set', WP.layerOn() === true);
  {
    const r = await runWith(WP.leadpursuit, 22, 70);
    const answers = (r.runCtx && r.runCtx.tableAnswers) || 0;
    check('GREEN: pursuit layer answers the modal (tableAnswers>0)', answers > 0, `answers=${answers}`);
  }
  delete process.env.WINPURSUIT;

  console.log(`\nproof winpursuit: ${pass} pass, ${fail} fail${fail ? ' — FAILED: ' + fails.join(', ') : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
