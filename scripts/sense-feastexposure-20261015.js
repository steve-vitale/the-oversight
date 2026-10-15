#!/usr/bin/env node
// scripts/sense-feastexposure-20261015.js — sense-testing for the feast
// fight-exposure gate arm (SENSE-TESTING LAW): read actual feast beats,
// draw beats, and drive-off beats from an armed run. The gate must read as
// village prudence — a watched fire, a judged risk — never silent skipping.
//
// Prints, for one armed seed x policy: per-feast context (day, armed?,
// the gate's draw decision) plus the say-lines around each feast/draw.
//
// Usage:
//   FEASTSCALE_R13=1 FEASTEXPOSURE=1 SEED=22 POLICY=belongseek DAYS=120 node scripts/sense-feastexposure-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.FEASTEXPOSURE !== '1') {
  console.log('sense-feastexposure: run with FEASTSCALE_R13=1 FEASTEXPOSURE=1');
  process.exit(1);
}
let FE;
try { FE = require('./policies/feastexposure'); } catch (e) { console.log('INFO-SKIP: layer absent'); process.exit(0); }

const seed = parseInt(process.env.SEED || '22', 10);
const pid = process.env.POLICY || 'belongseek';
const days = parseInt(process.env.DAYS || '120', 10);
const base = pid === 'belongseek' ? FE.belongexposure : FE.leadexposure;

(async () => {
  const { Game } = await loadGame({ seed, mode: 'feastexposure-sense-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      const day = (Game.state.scholar || {}).day || 0;
      if (/feast|scavenger|circling|brands|drove off|draw|surge|heckler|memory_projector|statickite|gallowdeer/i.test(text) && beats.length < 80) {
        beats.push({ day, text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 420) });
      }
    } catch (e) {}
    return origSay ? origSay(msg) : msg;
  };
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  let runCtx = null;
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const feasts = [];
  policy.daily = (G, ctx) => {
    try {
      const d = (G.state.scholar || {}).day || 0;
      const n = (ctx.fsFeasts || 0);
      if (n > feasts.length) {
        const armed = !!((((G.state.scholar || {}).prog) || {}).feastSurge);
        feasts.push({ day: d, n, armed });
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const ctx = runCtx || {};
  console.log(`\n== sense ${pid} seed ${seed}: ${feasts.length} feasts in ${result.days}d (${result.endReason}) ==`);
  for (const f of feasts) {
    console.log(`  feast #${f.n} day ${f.day}: armed=${f.armed}`);
  }
  console.log(`\n== gate decisions ==`);
  console.log(`  assessed=${ctx.exposureAssessed || 0} left=${ctx.exposureLeft || 0} driven=${ctx.exposureDriven || 0} drivenUsed=${ctx.exposureDrivenUsed || 0}`);
  if (ctx.exposureFirstDecline) console.log(`  first decline: ${JSON.stringify(ctx.exposureFirstDecline)}`);
  if (ctx.exposureLastDetail) console.log(`  last decision: ${JSON.stringify(ctx.exposureLastDetail)}`);
  console.log(`\n== beats (${beats.length} captured) ==`);
  for (const b of beats.slice(0, 50)) {
    console.log(`  [d${b.day}] ${b.text}`);
  }
  try {
    const pg = Game.progState();
    const st = Game.tableSeat ? Game.tableSeat() : null;
    console.log(`\nsentimentTaught=${!!pg.sentimentTaught} feastSurgeUsed=${!!(((Game.state.scholar || {}).prog) || {}).feastSurgeUsed} tableSeat=${st ? st.seat : 'n/a'}`);
  } catch (e) {}
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
