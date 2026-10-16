#!/usr/bin/env node
// scripts/measure-drawvol-20261016.js — CAP DERIVATION PRE-PASS for sim-drawvol-b
// (2026-10-16, food-economy axis — the sim-floorday3-b named next).
//
// Measures the sweep substrate's OWN daily drawdown-outflow distribution so
// the drawvol cap is derived from numbers, not taste. Runs the CONTROL
// substrate only (belongfeast/leadfeast, FEASTSCALE_R13=1, SEATDRIVE=0
// explicit, DRAWDVOL unset) with a read-only instrument that buckets every
// engine day:
//   fdStart      — pantryFreshDays() at the day's first policy call
//   obligated    — payTribute/tendLink actual paid kcal (engine returns)
//   aid          — answerAidBeg('give') asks, recorded on 'gave'
//   feast        — hostFeast plan.cost, recorded on rep.ok
// The day's TOTAL = obligated + aid + feast. The drawvol lever will hold
// DISCRETIONARY (aid/feast) when fd < 6 and dayTotal + cost > CAP — so the
// cap must bind on the margin of the fd<6-day TOTAL distribution.
//
// Output: per-seed JSONs (evidence/2026-10-16/perseed-drawvol-measure/) +
// a printed distribution summary. The cap choice + numbers are documented
// in evidence/2026-10-16/sim-drawvol-b.md.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/measure-drawvol-20261016.js
// Targeted: SEEDS="982,983" POLICIES="belongfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`MEASURE STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('MEASURE STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [982, 983, 984, 985]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongfeast', 'leadfeast']);
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-drawvol-measure');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const fdOf = (Game) => { try { return Game.pantryFreshDays(); } catch (e) { return -1; } };

// The measurement instrument: same wrap points the drawvol layer will use,
// read-only (no holds). Buckets are per engine-day (scholar.day at call
// time — the harness calls upkeep x3 then daily then sleep under one day).
function instrument(Game, t) {
  t.dayRecords = [];
  let bucket = null;
  const dayBucket = () => {
    const day = gday(Game);
    if (!bucket || bucket.day !== day) {
      bucket = { day, fdStart: +fdOf(Game).toFixed(2), obligated: 0, aid: 0, feast: 0 };
      t.dayRecords.push(bucket);
    }
    return bucket;
  };
  const rec = (n, kcal) => { try { dayBucket()[n] += Math.round(kcal) || 0; } catch (e) {} };
  const origPT = Game.payTribute, origTL = Game.tendLink;
  const origBeg = Game.answerAidBeg, origFeast = Game.hostFeast;
  const wrap = (base) => Object.assign({}, base, {
    daily(G, ctx) {
      dayBucket();
      const rPT = typeof origPT === 'function' ? Game.payTribute : null;
      const rTL = typeof origTL === 'function' ? Game.tendLink : null;
      const rBeg = typeof origBeg === 'function' ? Game.answerAidBeg : null;
      if (typeof origPT === 'function') Game.payTribute = function () { const r = origPT.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obligated', r); return r; };
      if (typeof origTL === 'function') Game.tendLink = function () { const r = origTL.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obligated', r); return r; };
      if (typeof origBeg === 'function') Game.answerAidBeg = function (how) {
        let ask = 0;
        try { ask = ((Game.state || {}).pendingAidBeg || {}).amount || 1500; } catch (e) {}
        const r = origBeg.apply(this, arguments);
        if (how === 'give' && r === 'gave') rec('aid', ask);
        return r;
      };
      try { return base.daily ? base.daily(G, ctx) : undefined; }
      finally {
        if (typeof origPT === 'function') Game.payTribute = origPT;
        if (typeof origTL === 'function') Game.tendLink = origTL;
        if (typeof origBeg === 'function') Game.answerAidBeg = origBeg;
        void rPT; void rTL; void rBeg;
      }
    },
    upkeep(G, ctx) {
      dayBucket();
      const rFeast = typeof origFeast === 'function' ? Game.hostFeast : null;
      if (typeof origFeast === 'function') Game.hostFeast = function () {
        let cost = 0;
        try { const p = Game.feastPlan ? Game.feastPlan() : null; if (p && p.ok) cost = Math.round(p.cost) || 0; } catch (e) {}
        const r = origFeast.apply(this, arguments);
        if (r && r.ok && cost > 0) rec('feast', cost);
        return r;
      };
      try { return base.upkeep ? base.upkeep(G, ctx) : undefined; }
      finally { if (typeof origFeast === 'function') Game.hostFeast = origFeast; void rFeast; }
    },
  });
  return wrap;
}

function pct(xs, q) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'drawvol-measure', fullTelemetry: false });
  await setupGame(Game);
  const t = {};
  const pol = instrument(Game, t)(base);
  let result;
  await quietLog(async () => { result = await runDays(Game, pol, { days: DAYS, sampleEvery: 30 }); });
  const days = t.dayRecords.map(b => ({ day: b.day, fd: b.fdStart, obl: b.obligated, aid: b.aid, feast: b.feast, total: b.obligated + b.aid + b.feast }));
  const out = { seed, policyId, gameDays: result.gameDays, endReason: result.endReason, days };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${policyId} s${seed}] gameDays=${out.gameDays} end=${out.endReason} dayRecords=${days.length}`);
  return out;
}

(async () => {
  const recs = [];
  for (const pid of POLICIES) for (const seed of SEEDS) recs.push(await oneRun(seed, pid));
  // ---- distribution: daily TOTAL outflow on fd<6 days vs fd>=6 days ----
  const thin = [], fat = [];
  let thinObl = 0, thinAid = 0, thinFeast = 0, thinN = 0;
  for (const r of recs) for (const d of r.days) {
    if (d.fd < 0) continue;
    if (d.fd < 6) { thin.push(d.total); thinN++; thinObl += d.obl; thinAid += d.aid; thinFeast += d.feast; }
    else fat.push(d.total);
  }
  const f = (xs) => xs.length ? `n=${xs.length} p50=${pct(xs, .5)} p60=${pct(xs, .6)} p75=${pct(xs, .75)} p90=${pct(xs, .9)} max=${Math.max(...xs)}` : 'n=0';
  console.log('\n== daily TOTAL drawdown outflow (kcal) ==');
  console.log('fd<6 days:  ' + f(thin));
  console.log('fd>=6 days: ' + f(fat));
  console.log(`fd<6 stream shares: obligated=${Math.round(thinObl / 1000)}k aid=${Math.round(thinAid / 1000)}k feast=${Math.round(thinFeast / 1000)}k over ${thinN} thin days`);
  const thinWithFlow = thin.filter(x => x > 0).length;
  console.log(`fd<6 days with any drawdown outflow: ${thinWithFlow}/${thinN}`);
  // candidate margin: on fd<6 days, how often would a 1500-aid or 2500-feast exceed candidate caps
  for (const cap of [3000, 4000, 5000, 6000, 8000]) {
    const bindAid = thin.filter(t => t + 1500 > cap).length;
    const bindFeast = thin.filter(t => t + 2500 > cap).length;
    console.log(`cap=${cap}: aid(1500) would bind on ${bindAid}/${thinN} thin days; feast(2500) on ${bindFeast}/${thinN}`);
  }
})().catch(e => { console.error('MEASURE CRASH:', e && e.stack || e); process.exit(2); });
