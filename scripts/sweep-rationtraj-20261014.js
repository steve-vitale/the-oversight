#!/usr/bin/env node
// sweep-rationtraj-20261014.js — PANTRY-TRAJECTORY RATION sweep
// (scale-onramp, fleshout-a 2026-10-14-2315, ARM 4: sim-rationtraj).
//
// Baseline (SIDE=baseline): leadfeast (FEASTSCALE_R13=1) + predation-lib.
// Armed (SIDE=armed): leadfeast + scripts/policies/rationtraj.js (RATIONTRAJ=1)
//   + predation-lib. Identical seeds, post-fix code both sides.
// The r31 layer was deleted per kill protocol; this sweep runs the rebuilt
// rationtraj layer (pantry-trajectory trigger, no defender-meal verb).
//
// Modes:
//   --invocations=1   single invocation per seed            -> sweep JSON
//   --invocations=2   two in-process invocations            -> det-gate style
//                     A/A (identical day-hash check)        -> sweep JSON per invocation
//
// PRE-REGISTERED (evidence/2026-10-14/sim-rationtraj.md header, written before any sims):
//   SEEDS 11/22/33/44/55/66/77/88 x leadfeast, 180d death-aware, identical seeds.
//   DET-GATE: 8/8 identical per side required; a diverged seed is EXCLUDED
//     from the before/after comparison (documented). >2 diverged -> untrustworthy, KILL.
//   PRIMARY: armed starvation deaths <= control-2 AND armed median >= control-5d.
//   GO: primary AND guardrails clean — national >= control-2, no new death
//     mode (cause-FAMILY level, armed-only family n>=3 per #215), exiled <= control+1.
'use strict';
if (!process.env.FEASTSCALE_R13) process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { stdSnapshot } = require('./sweep-compare');
const { installPredation, finalizePredation } = require('./predation-lib-20261014');
// NAMED export unwrap (the r20b lesson): destructure leadfeast from the
// module — never Object.assign({}, require(...)).
const { leadfeast: baselineLeadfeast } = require('./policies/feastscale');
// rationtraj is required lazily (SIDE=armed only) so the baseline
// pre-screen never loads the armed layer.

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SIDE = process.env.SIDE || 'baseline';
const INVOC = parseInt((process.argv.find(a => a.startsWith('--invocations=')) || '=1').split('=')[1], 10) || 1;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-14');
const PERSEED = path.join(EVID, 'rationtraj-per-seed');

function basePolicy() {
  if (SIDE === 'armed') {
    process.env.RATIONTRAJ = '1';
    return require('./policies/rationtraj').policyForRun();
  }
  delete process.env.RATIONTRAJ;
  return baselineLeadfeast;
}

async function runCombo(seed, inv) {
  const { Game } = await loadGame({ seed, mode: `rationtraj-${SIDE}-i${inv}` });
  await setupGame(Game);
  const track = installPredation(Game);
  // death-cause telemetry: wrap Game.tele (read-only capture, call-through)
  const deaths = [];
  const origTele = Game.tele;
  if (typeof origTele === 'function') {
    Game.tele = function (ev, rec) {
      try {
        if (ev === 'death' && rec && (rec.kind === 'person' || rec.kind === 'villager')) {
          deaths.push({ cause: String(rec.cause || '?'), player: !!rec.player, who: String(rec.who || '?') });
        }
      } catch (e) {}
      return origTele.apply(this, arguments);
    };
  }
  const halfDays = new Set();
  const daySamples = [];
  const dayHashes = [];
  let lastCtx = null;
  let maxRank = 0, maxArc = 1, maxWave = 1, everTable = false, won = false;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      if (/Half ration/.test(String(msg))) halfDays.add((Game.state.scholar || {}).day || 0);
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const base = basePolicy();
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const origUpkeep = base.upkeep;
  policy.daily = (G, ctx) => {
    try {
      lastCtx = ctx;
      const d = (G.state.scholar || {}).day || 0;
      dayHashes.push(d + ':' + dayHash(G));
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      maxWave = Math.max(maxWave, s.wave || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
      daySamples.push({ day: d, exiled: !!((G.state.scholar || {}).exiled) });
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  if (origUpkeep) {
    policy.upkeep = (G, ctx) => { try { lastCtx = ctx; } catch (e) {} return origUpkeep(G, ctx); };
  }
  let r;
  try {
    r = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
  } finally {
    Game.say = origSay;
    if (typeof origTele === 'function') Game.tele = origTele;
  }
  let pred = null;
  try { pred = finalizePredation(Game, track); } catch (e) { pred = { error: String(e && e.message) }; }
  const gorgeNights = (track.gorgeNights || []);
  const totalGorgedKcal = gorgeNights.reduce((t, g) => t + Math.round(g.totalGorged || 0), 0);
  const gdays = gorgeNights.map(g => g.day).sort((a, b) => a - b);
  let peak14 = 0;
  for (const d0 of gdays) {
    const c = gdays.filter(d => d >= d0 && d < d0 + 14).length;
    if (c > peak14) peak14 = c;
  }
  const vv = Game.state.village || {};
  const end = stdSnapshot(Game);
  const rt = {};
  try {
    for (const k of Object.keys(lastCtx || {})) {
      if (k.startsWith('rt')) rt[k] = lastCtx[k];
    }
  } catch (e) {}
  const starvDeaths = deaths.filter(d => d.cause === 'starvation').length;
  const deathFamilies = {};
  for (const dth of deaths) deathFamilies[dth.cause] = (deathFamilies[dth.cause] || 0) + 1;
  return {
    side: SIDE, invocation: inv, policy: base.id || 'leadfeast', seed,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || maxWave || 1,
    national: maxRank >= 2 ? 1 : 0, table: everTable || end.tableWaiting ? 1 : 0,
    won: won || end.won ? 1 : 0, vests: end.vests || 0, maxArc,
    halfRationDays: halfDays.size,
    halfRationShare: r.gameDays > 0 ? halfDays.size / r.gameDays : 0,
    everExiled: daySamples.some(x => x.exiled) ? 1 : 0,
    starvationDeaths: starvDeaths,
    deathFamilies,
    gorgeNights: gorgeNights.length,
    totalGorgedKcal,
    gorgePeak14d: peak14,
    predInstrErrors: (track.instrErrors || []).length,
    rt,
    hashes: dayHashes,
  };
}

async function main() {
  if (!fs.existsSync(PERSEED)) fs.mkdirSync(PERSEED, { recursive: true });
  const rows = [];
  const gateLines = [];
  for (const seed of SEEDS) {
    const a = await runCombo(seed, 1);
    rows.push(a);
    fs.writeFileSync(path.join(PERSEED, `rationtraj-${SIDE}-leadfeast-s${seed}-i1.json`),
      JSON.stringify(a, (k, v) => (k === 'hashes' ? `[${(v || []).length} hashes]` : v), 1));
    console.log(`  [${SIDE} seed ${seed} i1] days=${a.days} end=${a.endReason} wave=${a.waveReach} national=${a.national} table=${a.table} won=${a.won} exiled=${a.everExiled} starv=${a.starvationDeaths} gorgeN=${a.gorgeNights} gorgeK=${a.totalGorgedKcal} instrErr=${a.predInstrErrors} rtEng=${a.rt.rtEngagements || 0}`);
    if (INVOC >= 2) {
      const b = await runCombo(seed, 2);
      rows.push(b);
      fs.writeFileSync(path.join(PERSEED, `rationtraj-${SIDE}-leadfeast-s${seed}-i2.json`),
        JSON.stringify(b, (k, v) => (k === 'hashes' ? `[${(v || []).length} hashes]` : v), 1));
      let firstDiv = -1;
      const n = Math.min(a.hashes.length, b.hashes.length);
      for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
      const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
      const divDay = firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '-';
      gateLines.push(`${SIDE} seed ${seed}: ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} (${n} days)`);
      console.log(`  [${SIDE} seed ${seed} i2] ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} starv=${b.starvationDeaths}`);
    }
  }
  const out = path.join(EVID, `sweep-rationtraj-${SIDE}-inv${INVOC}.json`);
  fs.writeFileSync(out, JSON.stringify({ side: SIDE, invocations: INVOC, days: DAYS, rows, gate: gateLines }, null, 1));
  console.log(`wrote ${out}`);
  if (gateLines.length) {
    const idn = gateLines.filter(l => l.includes('IDENTICAL')).length;
    console.log(`GATE: ${idn}/${gateLines.length} identical`);
    for (const l of gateLines) console.log('  ' + l);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
