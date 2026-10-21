#!/usr/bin/env node
// w5gates-sense-20261021.js — SENSE-TESTING for sim-w5gates: re-runs a sweep
// seed with LIVE narration (loadGame {narration:true} — the harness's
// sanctioned path; sims silence say/sysSay by default, which is why the
// sweep's own capture saw no hold/release beats) and prints the System's
// voiced gate states for judgment against the instrument's gate states.
//
// This is a SEPARATE diagnostic run, not part of the 16-run corpus — no
// DET claim attaches to it.
//
// Usage:
//   VGEAR=1 FEASTSCALE_R13=1 SEED=64401 POLICY=leadfeast DAYS=160 \
//     node scripts/w5gates-sense-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dailyGateTrace } = require('./w5gates-lib');
const VG = require('./policies/villagergear');

const SEED = parseInt(process.env.SEED || '64401', 10);
const POLICY = (process.env.POLICY || 'leadfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '160', 10);
const GATE_LINE_RE = /fifth draft|the next act|talent has been released|greenlit|not bought with bread alone/i;

(async () => {
  const base = POLICY === 'leadfeast' ? VG.vgearLead : VG.vgearBelong;
  const { Game } = await loadGame({ seed: SEED, mode: 'w5gates-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (GATE_LINE_RE.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        lines.push(`[d${day}] ${s.slice(0, 400)}`);
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  let lastTrace = null;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { lastTrace = dailyGateTrace(G); } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const t = lastTrace || {};
  console.log(`sense ${POLICY}/s${SEED}: days=${DAYS} uw=${t.uw} raw=${t.raw} capped=${t.capped} peak=${t.peak}`);
  console.log(`  r5: ${t.r5 ? `a${t.r5.armored}/w${t.r5.armed}/t${t.r5.tricks}/v${t.r5.veterans} short=[${t.r5.short}]` : '?'}`);
  console.log(`  w4faced=${t.w4faced}`);
  console.log(`\n  ${lines.length} voiced gate lines:`);
  for (const l of lines) console.log('  ' + l);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
