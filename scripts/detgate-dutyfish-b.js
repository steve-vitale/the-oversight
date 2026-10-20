#!/usr/bin/env node
// detgate-dutyfish-b.js — determinism gate for the duty_fish scale-up arm.
//
// 16 configs (seeds 5601-5608 x leaddutyfish/belongdutyfish) x {control,
// armed} x 2 reps. Each side's two reps must be bit-identical (16/16 pairs
// per side). No instruments — pure trajectory determinism.
//
// A repeat pair hashes per-day [pantryKcal, roster, deaths] + the say-stream.
// Control reps must match; armed reps must match. Control vs armed are NOT
// expected to match (the lever staffs extra fishers on lean days).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 [DAYS=180] node scripts/detgate-dutyfish-b.js
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leaddutyfish, belongdutyfish } = require('./policies/dutyfish-b');

const DAYS = parseInt(process.env.DAYS || '180', 10);
const SEEDS = (process.env.DETGATE_SEEDS || '5601,5602,5603,5604,5605,5606,5607,5608')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const POLICIES = { leaddutyfish, belongdutyfish };
// POLICY_SUBSET: comma-separated policy ids to run (for parallel chunks)
if (process.env.DETGATE_POLICIES) {
  for (const k of Object.keys(POLICIES)) {
    if (!process.env.DETGATE_POLICIES.split(',').includes(k)) delete POLICIES[k];
  }
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRep(policyId, seed, armed) {
  const saved = process.env.DUTYFISH_B;
  try {
    if (armed) process.env.DUTYFISH_B = '1'; else delete process.env.DUTYFISH_B;
    const { Game } = await loadGame({ seed, mode: 'detgate-dutyfish-b', fullTelemetry: false });
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
    if (saved === undefined) delete process.env.DUTYFISH_B; else process.env.DUTYFISH_B = saved;
  }
}

(async () => {
  // RESUME (2026-10-20): mid-run service restarts killed two attempts before
  // the first pair completed. Reps are journaled INDIVIDUALLY (not per-pair)
  // to ~/workspace/detgate-dutyfish-b-reps.jsonl (never /tmp — restarts wipe
  // it); a restart loses only the in-flight rep. Completed reps are skipped
  // on re-run.
  const fs = require('fs');
  const PROGRESS = process.env.DETGATE_PROGRESS ||
    (process.env.HOME + '/workspace/detgate-dutyfish-b-reps.jsonl');
  const reps = new Map(); // key `${pid}|${seed}|${side}|${rep}` -> {h, ms}
  try {
    if (fs.existsSync(PROGRESS)) {
      for (const line of fs.readFileSync(PROGRESS, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try { const r = JSON.parse(line); reps.set(r.key, r); } catch (e) {}
      }
      console.log(`resume: ${reps.size} reps already done`);
    }
  } catch (e) {}
  async function rep(pid, seed, side, n) {
    const key = `${pid}|${seed}|${side}|${n}`;
    let r = reps.get(key);
    if (!r) {
      r = await oneRep(pid, seed, side === 'armed');
      r = { key, h: r.h, ms: r.ms };
      reps.set(key, r);
      try { fs.appendFileSync(PROGRESS, JSON.stringify(r) + '\n'); } catch (e) {}
    }
    return r;
  }
  console.log(`detgate-dutyfish-b: ${SEEDS.length * Object.keys(POLICIES).length} configs x 2 sides x 2 reps, ${DAYS}d`);
  let passC = 0, passA = 0, total = 0;
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      total++;
      const c1 = await rep(pid, seed, 'control', 1), c2 = await rep(pid, seed, 'control', 2);
      const a1 = await rep(pid, seed, 'armed', 1), a2 = await rep(pid, seed, 'armed', 2);
      const okC = c1.h === c2.h, okA = a1.h === a2.h;
      if (okC) passC++; if (okA) passA++;
      const divergeNote = (c1.h === a1.h) ? ' (control==armed: lever silent on this config!)' : '';
      console.log(`${okC && okA ? 'ok  ' : 'FAIL'} ${pid} s${seed}: control ${c1.h}==${c2.h} ${okC ? 'Y' : 'N'} | armed ${a1.h}==${a2.h} ${okA ? 'Y' : 'N'}${divergeNote}`);
      if (!okC || !okA) { console.error('DET-GATE FAILED'); process.exit(1); }
    }
  }
  console.log(`\nDET-GATE: control ${passC}/${total} armed ${passA}/${total} — PASS`);
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
