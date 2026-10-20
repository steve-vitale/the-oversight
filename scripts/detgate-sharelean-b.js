#!/usr/bin/env node
// detgate-sharelean-b.js — r27 determinism gate for the lean valve.
//
// 16 configs (seeds 5201-5208 x leadsharelean/belongsharelean) x {control,
// armed} x 2 reps. Each side's two reps must be bit-identical (16/16 pairs
// per side). No instruments — pure trajectory determinism.
//
// A repeat pair hashes per-day [pantryKcal, roster, deaths] + the say-stream.
// Control reps must match; armed reps must match. Control vs armed are NOT
// expected to match (the lever moves kcal on lean days).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 [DAYS=180] node scripts/detgate-sharelean-b.js
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadsharelean, belongsharelean } = require('./policies/sharelean');

const DAYS = parseInt(process.env.DAYS || '180', 10);
const SEEDS = [5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208];
const POLICIES = { leadsharelean, belongsharelean };

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRep(policyId, seed, armed) {
  const saved = process.env.SHARELEAN;
  try {
    if (armed) process.env.SHARELEAN = '1'; else delete process.env.SHARELEAN;
    const { Game } = await loadGame({ seed, mode: 'detgate-sharelean-b', fullTelemetry: false });
    await setupGame(Game);
    const rows = [], says = [];
    let deaths = 0;
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; }
      try { if (t === 'death') deaths++; } catch (e) {}
      return r;
    };
    const oSay = Game.say;
    Game.say = function (m) { try { says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
    const P = Object.assign({}, POLICIES[policyId]);
    const origDaily = P.daily;
    P.daily = (G, ctx) => {
      const r = origDaily(G, ctx);
      const v = G.state.village || {};
      const pk = ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
      rows.push([dayOf(G), Math.round(pk), (v.roster || []).length, deaths].join(','));
      return r;
    };
    const t0 = Date.now();
    await runDays(Game, P, { days: DAYS, manifest: null, sampleEvery: 181 });
    const ms = Date.now() - t0;
    const h = crypto.createHash('sha256').update(rows.join('\n') + '\n###\n' + says.join('\n')).digest('hex').slice(0, 16);
    return { h, ms };
  } finally {
    if (saved === undefined) delete process.env.SHARELEAN; else process.env.SHARELEAN = saved;
  }
}

(async () => {
  console.log(`detgate-sharelean-b: ${SEEDS.length * 2} configs x 2 sides x 2 reps, ${DAYS}d`);
  let passC = 0, passA = 0, total = 0, msTot = 0;
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      total++;
      const c1 = await oneRep(pid, seed, false), c2 = await oneRep(pid, seed, false);
      const a1 = await oneRep(pid, seed, true), a2 = await oneRep(pid, seed, true);
      msTot += c1.ms + c2.ms + a1.ms + a2.ms;
      const okC = c1.h === c2.h, okA = a1.h === a2.h;
      if (okC) passC++; if (okA) passA++;
      const diverge = c1.h === a1.h ? ' (control==armed: lever silent on this config!)' : '';
      console.log(`${okC && okA ? 'ok  ' : 'FAIL'} ${pid} s${seed}: control ${c1.h}==${c2.h} ${okC ? 'Y' : 'N'} | armed ${a1.h}==${a2.h} ${okA ? 'Y' : 'N'}${diverge}`);
      if (!okC || !okA) { console.error('DET-GATE FAILED'); process.exit(1); }
    }
  }
  console.log(`\nDET-GATE: control ${passC}/${total} armed ${passA}/${total} — PASS (${Math.round(msTot / 1000)}s total)`);
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
