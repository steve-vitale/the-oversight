#!/usr/bin/env node
// scripts/sense-feasttable-20261014.js — sense-testing for the feasttable arm
// (SENSE-TESTING LAW): read actual feast beats from an armed run. A feast
// that feeds the table door must read like a village celebration with
// consequences, not a number going up.
//
// Prints, for one armed seed x policy: feast decision context per feast
// (day, fresh-days before->after, hungryStreak, armed?, menu) plus the
// say-lines around each feast.
//
// Usage: FEASTTABLE=1 SEED=22 POLICY=leadcourt DAYS=120 node scripts/sense-feasttable-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.FEASTTABLE === '1';
if (!ARMED) { console.log('sense-feasttable: run with FEASTTABLE=1'); process.exit(1); }
let FT;
try { FT = require('./policies/feasttable'); } catch (e) { console.log('INFO-SKIP: layer absent'); process.exit(0); }

const seed = parseInt(process.env.SEED || '22', 10);
const pid = process.env.POLICY || 'leadcourt';
const days = parseInt(process.env.DAYS || '120', 10);
const base = pid === 'belongseek' ? FT.belongtable : FT.leadtable;

(async () => {
  const { Game } = await loadGame({ seed, mode: 'feasttable-sense-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const feasts = [];
  const sayAround = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  let lastFeast = -1;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      const day = (Game.state.scholar || {}).day || 0;
      if (/FEAST/i.test(text) && day - lastFeast > 1) {
        lastFeast = day;
        sayAround.push({ day, text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400) });
      } else if (day - lastFeast <= 2 && /feast|celebrat|table|deed/i.test(text) && sayAround.length < 60) {
        sayAround.push({ day, text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400) });
      }
    } catch (e) {}
    return origSay ? origSay(msg) : msg;
  };
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  let runCtx = null;
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  policy.daily = (G, ctx) => {
    try {
      const d = (G.state.scholar || {}).day || 0;
      const n = (ctx.fsFeasts || 0);
      if (n > feasts.length) {
        let fd = -1, hs = -1;
        try { fd = +G.pantryFreshDays().toFixed(1); } catch (e) {}
        try { hs = ((G.state.village || {}).progState || {}).hungryStreak; } catch (e) {}
        try { hs = (typeof G.progState === 'function' ? G.progState().hungryStreak : -1); } catch (e) {}
        const armed = !!((((G.state.scholar || {}).prog) || {}).feastSurge);
        feasts.push({ day: d, freshDaysAfter: fd, hungryStreak: hs, armed, n });
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  console.log(`\n== sense ${pid} seed ${seed}: ${feasts.length} feasts in ${result.days}d (${result.endReason}) ==`);
  for (const f of feasts) {
    console.log(`  feast #${f.n} day ${f.day}: freshDays(after)=${f.freshDaysAfter} hungryStreak=${f.hungryStreak} armed=${f.armed}`);
  }
  console.log(`\n== feast beats (${sayAround.length} captured) ==`);
  for (const s of sayAround.slice(0, 40)) {
    console.log(`  [d${s.day}] ${s.text}`);
  }
  try {
    const pg = Game.progState();
    const st = Game.tableSeat ? Game.tableSeat() : null;
    console.log(`\nsentimentTaught=${!!pg.sentimentTaught} tableSeat=${st ? st.seat : 'n/a'} ftGateHeld=${(runCtx || {}).ftGateHeld || 0}`);
  } catch (e) {}
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
