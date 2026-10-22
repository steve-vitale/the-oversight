#!/usr/bin/env node
// diag-earlystarve-depositgate-b2.js — follow-up diagnostic for #798.
//
// Two armed leadfeast probe runs showed starvation deaths on day 16-17 with
// the pantry PLENTIFUL (20-33k kcal) — not the buffer-transition mechanism.
// This traces the victim's daily intake by route, away status, hunger, and
// health for days 1-25 to find why a villager starves with a full pantry.
// Env: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1.
// SEED=9203 POLICY=leadfeast VICTIM=gen_ihwedah node scripts/diag-earlystarve-depositgate-b2.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: need FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=1');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY = POLICIES[process.env.POLICY || 'leadfeast'];
const SEED = parseInt(process.env.SEED || '9203', 10);
const VICTIM = process.env.VICTIM || 'gen_ihwedah';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-earlystarve', fullTelemetry: false });
  await setupGame(Game);
  const rec = {};
  const oIntake = Game.recordHarvestIntake;
  Game.recordHarvestIntake = function (eater, portions, route) {
    const r = oIntake.apply(this, arguments);
    try {
      const who = typeof eater === 'string' ? eater : (eater && eater.who);
      if (String(who) === VICTIM || String(who || '').startsWith(VICTIM.slice(0, 12))) {
        const day = (Game.state.scholar || {}).day || 0;
        const kcal = (portions || []).reduce((n, p) => n + (Number(p.kcal) || 0), 0);
        const row = rec[day] || (rec[day] = {});
        row[String(route)] = (row[String(route)] || 0) + Math.round(kcal);
      }
    } catch (e) {}
    return r;
  };
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  const daily = {};
  policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const day = (G.state.scholar || {}).day || 0;
      if (day <= 25) {
        let hunger = null, health = null, away = null, dead = null;
        try { hunger = Math.round(G.npcNeeds(VICTIM).hunger || 0); } catch (e) {}
        try { health = Math.round((v.health || {})[VICTIM] ?? -1); } catch (e) {}
        try { away = !!((v.away || {})[VICTIM]); } catch (e) {}
        try { const p = G.getPerson ? G.getPerson(VICTIM) : null; dead = !!(p && p.dead); } catch (e) {}
        let pk = 0;
        try { pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
        daily[day] = { hunger, health, away, dead, pantryKcal: Math.round(pk) };
      }
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  const sayLines = [];
  const oSay = Game.say;
  Game.say = function (t) { try { sayLines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + String(t).slice(0, 160)); } catch (e) {} return oSay && oSay.apply(this, arguments); };
  await runDays(Game, policy, { days: 30, manifest: null });
  console.log(`victim=${VICTIM} seed=${SEED}`);
  for (let d = 1; d <= 25; d++) {
    const dy = daily[d] || {}, ir = rec[d] || {};
    console.log(`d${d}: hunger=${dy.hunger} health=${dy.health} away=${dy.away} dead=${dy.dead} pantry=${dy.pantryKcal} intake=${JSON.stringify(ir)}`);
  }
  console.log('--- say lines mentioning victim or starv ---');
  sayLines.filter(l => /starv|hungry/i.test(l)).slice(0, 10).forEach(l => console.log(l));
})().catch(e => { console.error('DIAG CRASH', e); process.exit(2); });
