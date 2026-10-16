#!/usr/bin/env node
'use strict';
// scripts/feastcost-sweep-20261016.js — feast-economy cost lever pilot
// (sim-feastcost-b, 2026-10-16, food-economy axis).
//
// ONE armed lever: FEASTCOST=1 (src/js/standing.js standingCfg) — a fine
// feast (quality 1) credits +10 plenty instead of +20; a legend (quality 2)
// still credits +20. Default OFF = byte-identical to pristine.
//
// Sweep: 8 fresh seeds x {leadfeast, belongfeast} = 16 runs per arm,
// 180d death-aware, FEASTSCALE_R13=1 both sides, identical seeds
// (paired control vs armed). Paired comparison: same seed, gate on/off.
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9–12, 14 — binding):
//   primary (BOTH must hold):
//     P1: bread-standing gain rate (plenty/day pre-w4) down ≥20% on
//         identical seeds (paired mean ratio armed/control ≤ 0.8)
//     P2: median w4-unlock day pushed ≥+7d (armed median − control median)
//   guardrails:
//     G1: national+ (armed) ≥ control−2
//     G2: table (armed) ≥ control−2
//     G3: median survival (armed) ≥ control−10d
//     G4: no new death mode (endReason distribution comparison)
//     G5: feasts still fire — median feast count armed ≥ 0.8 × control
//   horizon: 180d death-aware. The question is whether the bread road's
//     standing gain slows and the w4 bar moves; dead villages census at
//     their own numbers (short deaths dilute gain rate honestly).
//   seeds: 101..108 x 2 policies = 16 runs/arm; control and armed paired.
//   policies: leadfeast (leadcourt + feastscale r13), belongfeast
//     (belongseek + feastscale r13) — the census-established shape.
//   secondary: q1/q2 feast mix at unlock (how much of the 2.0/day bread
//     rate is fine-feast vs legend); wall numbers (national/table/wave
//     4-5/median survival/exiled) per arm; sense check of feast beats on
//     the armed arm (SENSE-TESTING LAW — light feast-keyword capture).
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/feastcost-sweep-20261016.js            # control
//   FEASTSCALE_R13=1 FEASTCOST=1 node scripts/feastcost-sweep-20261016.js # armed
//   OUT=... node scripts/feastcost-sweep-20261016.js
process.env.FEASTSCALE_R13 = '1';
if (process.env.FEASTSCALE_R13 !== '1') { console.error('FATAL: FEASTSCALE_R13=1 not set'); process.exit(1); }
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { sampleGate, classifyGate } = require('./standing-lib-20261015');

const ARMED = process.env.FEASTCOST === '1';
const SEEDS = (process.env.SEEDS || '101,102,103,104,105,106,107,108').split(',').map(s => +s.trim()).filter(Boolean);
const POLICIES = [['leadfeast', leadfeast], ['belongfeast', belongfeast]];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-16/feastcost-rows-' + (ARMED ? 'armed' : 'control') + '.json');
const ROW_EVERY = 5;
const FEASTRE = /feast/i;

const gday = (G) => { try { return ((G && G.state && G.state.scholar) || {}).day || 0; } catch (e) { return 0; } };

function feastMix(G) {
  // q1/q2 counts among credited (quality>=1) feasts in the current log.
  try {
    const log = (G && G.state && G.state.feastLog) || [];
    let q1 = 0, q2 = 0;
    for (const f of log) {
      const q = ((f && f.quality) | 0);
      if (q >= 2) q2++; else if (q >= 1) q1++;
    }
    return { q1, q2, total: log.length };
  } catch (e) { return { q1: 0, q2: 0, total: 0 }; }
}

async function runOne(seed, policyId, POLICY) {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed, mode: 'feastcost-sweep', fullTelemetry: true });
  await setupGame(Game);
  const track = { unlockDay: {}, rows: [], sayLines: [], instrErrors: [], lastRowDay: -999, lastUw: 1 };
  try {
    const origSay = Game.say ? Game.say.bind(Game) : null;
    Game.say = function (msg) {
      try {
        const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
        if (FEASTRE.test(text) && track.sayLines.length < 100) {
          track.sayLines.push({ day: gday(Game),
            text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280) });
        }
      } catch (e) { track.instrErrors.push('sayWrap: ' + e.message); }
      return origSay ? origSay(msg) : msg;
    };
  } catch (e) { track.instrErrors.push('sayWrapInstall: ' + e.message); }
  const origDaily = POLICY.daily;
  const policy = Object.assign({}, POLICY);
  policy.daily = (G, ctx) => {
    try {
      const day = gday(G);
      let uw = 1;
      try { uw = (G.unlockedWave && G.unlockedWave()) || 1; } catch (e) {}
      for (let w = 1; w <= uw; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = day;
      if (uw !== track.lastUw || day - track.lastRowDay >= ROW_EVERY) {
        try {
          const row = sampleGate(G);
          row.gameDay = day;
          row.feastMix = feastMix(G);
          track.rows.push(row);
          track.lastRowDay = day;
        } catch (e) { track.instrErrors.push('sample: ' + e.message); }
      }
      track.lastUw = uw;
    } catch (e) { track.instrErrors.push('daily: ' + e.message); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) { track.instrErrors.push('origDaily: ' + e.message); } }
  };
  let result = null, endErr = null;
  try {
    result = await quietLog(() => runDays(Game, policy, { days: DAYS, sampleEvery: 10 }));
  } catch (e) { endErr = String((e && e.message) || e); }
  let finalSample = null, scaleRank = null, tableEver = false, exiled = false;
  try { finalSample = sampleGate(Game); } catch (e) {}
  try { finalSample.feastMix = feastMix(Game); } catch (e) {}
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; tableEver = !!(pg.tableWaiting || pg.tableEntered); } catch (e) {}
  try { exiled = !!(Game.state && Game.state.scholar && Game.state.scholar.exiled); } catch (e) {}
  return {
    seed, policyId, arm: ARMED ? 'armed' : 'control',
    FEASTSCALE_R13: '1', FEASTCOST: ARMED ? '1' : '0', horizon: DAYS,
    gameDays: gday(Game), endReason: result ? result.endReason : ('ERROR:' + endErr),
    ms: Date.now() - t0,
    unlockDay: track.unlockDay,
    finalSample, scaleRank, tableEver, exiled,
    sayLines: track.sayLines,
    rows: track.rows,
    instrErrors: track.instrErrors.slice(0, 10),
  };
}

function summarize(all) {
  // Per policy road: w4 days, gain rates, feast mix at unlock, wall numbers.
  const out = {};
  for (const [pid] of POLICIES) {
    const runs = all.filter(r => r.policyId === pid);
    const unlocked = runs.filter(r => r.unlockDay['4'] != null);
    const w4days = unlocked.map(r => r.unlockDay['4']).sort((a, b) => a - b);
    const med = w4days.length ? w4days[Math.floor(w4days.length / 2)] : null;
    // gain rate: plenty@unlock / unlockDay, from the first row at/after unlock
    const gains = [];
    for (const r of unlocked) {
      const row = (r.rows || []).find(x => (x.gameDay || 0) >= (r.unlockDay['4'] || 0));
      if (row && r.unlockDay['4'] > 0) gains.push({ seed: r.seed, gain: (row.plenty || 0) / r.unlockDay['4'], plenty: row.plenty, mix: row.feastMix });
    }
    const gainsMean = gains.length ? gains.reduce((a, g) => a + g.gain, 0) / gains.length : null;
    const natPlus = runs.filter(r => /national|global/i.test(String(r.scaleRank || ''))).length;
    const table = runs.filter(r => r.tableEver).length;
    const w5 = runs.filter(r => r.unlockDay['5'] != null).length;
    const surv = runs.map(r => r.gameDays).sort((a, b) => a - b);
    const survMed = surv.length ? surv[Math.floor(surv.length / 2)] : null;
    const feasts = runs.map(r => (r.finalSample && r.finalSample.feastMix && r.finalSample.feastMix.total) || 0);
    const feastsMed = feasts.length ? feasts.sort((a, b) => a - b)[Math.floor(feasts.length / 2)] : null;
    const deaths = {};
    for (const r of runs) deaths[r.endReason] = (deaths[r.endReason] || 0) + 1;
    out[pid] = {
      runs: runs.length, w4unlock: unlocked.length, w4days, w4median: med,
      gainRates: gains.map(g => ({ seed: g.seed, gain: +g.gain.toFixed(3), plenty: g.plenty, q1: g.mix && g.mix.q1, q2: g.mix && g.mix.q2 })),
      gainMean: gainsMean == null ? null : +gainsMean.toFixed(3),
      nationalPlus: natPlus, table, w5, survivalMedian: survMed, survivalMax: surv.length ? surv[surv.length - 1] : null,
      feastsMedian: feastsMed, exiled: runs.filter(r => r.exiled).length, deaths,
    };
  }
  return out;
}

(async () => {
  console.log('== feastcost sweep (' + (ARMED ? 'FEASTCOST=1 armed' : 'control') + '): ' +
    SEEDS.length + ' seeds x ' + POLICIES.length + ' policies = ' + (SEEDS.length * POLICIES.length) +
    ' runs, ' + DAYS + 'd death-aware, FEASTSCALE_R13=1 ==');
  const all = [];
  for (const [policyId, POLICY] of POLICIES) {
    for (const seed of SEEDS) {
      const r = await runOne(seed, policyId, POLICY);
      all.push(r);
      const mix = (r.finalSample && r.finalSample.feastMix) || {};
      console.log(`  ${policyId} s${seed}: days=${r.gameDays} end=${r.endReason} ` +
        `w4=${r.unlockDay['4'] != null ? 'd' + r.unlockDay['4'] : 'no'} ` +
        `w5=${r.unlockDay['5'] != null ? 'd' + r.unlockDay['5'] : 'no'} ` +
        `rank=${r.scaleRank} table=${r.tableEver ? 1 : 0} feasts=${mix.total || 0}(q1=${mix.q1 || 0},q2=${mix.q2 || 0})`);
    }
  }
  const summary = summarize(all);
  try {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ preReg: {
      primary: 'P1: bread gain rate (plenty/day pre-w4) down ≥20% paired (armed/control ≤0.8); P2: median w4-unlock day armed−control ≥+7d',
      go: 'P1 AND P2 hold, plus guardrails G1–G5',
      miss: 'P1 or P2 miss, or any guardrail miss → NO-GO (killed at pilot, layer deleted)',
      horizon: DAYS + 'd death-aware', seeds: SEEDS, policies: POLICIES.map(p => p[0]),
      substrate: 'FEASTSCALE_R13=1 both sides; armed adds FEASTCOST=1; identical seeds (paired)',
      guardrails: 'G1 national+≥control−2; G2 table≥control−2; G3 median survival≥control−10d; G4 no new death mode; G5 median feast count ≥0.8×control',
    }, summary, runs: all }, null, 1));
  } catch (e) { console.error('WRITE FAIL: ' + e.message); process.exit(1); }
  console.log('\n== SUMMARY (' + (ARMED ? 'armed' : 'control') + ') ==');
  for (const pid of POLICIES.map(p => p[0])) {
    const s = summary[pid];
    console.log(`${pid}: runs=${s.runs} w4=${s.w4unlock}/${s.runs} w4days=[${s.w4days.join(',')}] med=${s.w4median} ` +
      `gainMean=${s.gainMean} w5=${s.w5} nat+=${s.nationalPlus} table=${s.table} ` +
      `survMed=${s.survivalMedian} survMax=${s.survivalMax} feastsMed=${s.feastsMedian} ` +
      `exiled=${s.exiled} deaths=${JSON.stringify(s.deaths)}`);
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
