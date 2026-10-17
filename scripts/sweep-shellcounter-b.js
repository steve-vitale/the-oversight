#!/usr/bin/env node
// scripts/sweep-shellcounter-b.js — PILOT sweep for the counter-shelling layer (arm sim-shellcounter-b).
//
// 8 fresh seeds x {leadfeast,belongfeast} x {control,armed}, 180d death-aware,
// FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT. In-sweep control: identical seeds.
//
// Measures:
//   PRIMARY: counter-nut kcal shelled on LEAN days (armed vs 0 control),
//     split by day type (LEAN <50% cap / FED) at firing time.
//   GUARDRAILS: starvation deaths armed <= control+2 (noise margin);
//     national >= control-2; median survival >= control-10d; no new death mode.
// Wall metrics: win rate, vesting/national reach, Arc reach, wave reach 1-5,
// four-realm formation, median/max survival, death-cause shares.
//
// Emits per-seed panel-schema JSONs for §15 (wall metrics + arm metrics) in
// evidence/2026-10-17/panel-shellcounter/.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-shellcounter-b.js
// Targeted: SEEDS="7301" POLICIES="leadfeast" ARMS="armed" DAYS=60 OUT=...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellcounter');
const PANEL_OUT = process.env.PANEL_OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellcounter');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = arm === 'armed' ? SC.withShellCounter(base, policyId + '+shellcounter', 'sweep') : base;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = { deaths: [], errors: 0, eatKcalByDay: {}, shellLog: [] };
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player), cls: deathClass(cause) });
        }
        if (type === 'eat' && data && typeof data.ateKcal === 'number') {
          const d = gday(Game);
          t.eatKcalByDay[d] = (t.eatKcalByDay[d] || 0) + data.ateKcal;
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  // SHELL-DAY ACCOUNTING: the layer fires in upkeep (before this daily) or in
  // its own daily hook (inside oDaily, before base.daily). Catch both with a
  // seen-counter on the layer's ctx telemetry, plus the LEAN/FED day-type
  // split (the PRIMARY's buckets).
  const noteShell = (G, ctx) => {
    try {
      const n = ctx._scShellDays || 0;
      if (n > (t._seenShellDays || 0)) {
        t._seenShellDays = n;
        t.shellLog.push({ day: ctx._scShellDay != null ? ctx._scShellDay : gday(G),
          kcal: num((G.state.scholar || {}).kcal), cumShelledKcal: ctx._scShelledKcal || 0 });
      }
      t.shelledKcalTotal = ctx._scShelledKcal || 0;
      t.shelledKcalLean = ctx._scShelledKcalLean || 0;
      t.shelledKcalFed = ctx._scShelledKcalFed || 0;
    } catch (e) { t.errors++; }
  };
  policy.daily = (G, ctx) => {
    noteShell(G, ctx); // upkeep-hook firings (before this daily)
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    noteShell(G, ctx); // daily-hook firings (inside oDaily, before base.daily)
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {};
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  // shelled-and-eaten: kcal eaten on days the layer shelled (ate tele, pack or pantry)
  const shellDays = new Set(t.shellLog.map(e => e.day));
  let shelledDayEatKcal = 0;
  for (const [d, k] of Object.entries(t.eatKcalByDay)) if (shellDays.has(+d)) shelledDayEatKcal += k;
  const out = {
    seed, policyId, arm, days: result.days, gameDays, endReason: result.endReason,
    survivalDays: gameDays,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    starvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION').length,
    playerStarvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    causeCounts, clsCounts,
    shellDays: t.shellLog.length, shelledKcal: t.shelledKcalTotal || 0,
    shelledKcalLean: t.shelledKcalLean || 0, shelledKcalFed: t.shelledKcalFed || 0,
    shelledDayEatKcal,
    scholarPantryTakes: (() => { try {
      // PURE-GAIN EXONERATION (sim-shellrevive-b validated instrument): the
      // scholar's cumulative pantry draws in kcal (v.takes[vid] is written
      // by Game.takeFromPantry). The shelling must not divert village food:
      // paired displacement (control - armed) must be >= 0.
      const vv = Game.state.village || {}, s = Game.state.scholar || {};
      return ((vv.takes || {})[s.villagerId]) || 0;
    } catch (e) { return null; } })(),
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} shell=${out.shellDays} leanK=${out.shelledKcalLean} fedK=${out.shelledKcalFed} starvD=${out.starvationDeaths} nat=${out.national} wave=${waveMax} err=${t.errors}`);
  return out;
}

function writePanel(all) {
  // §15 light panel: honest per-seed metrics, NOT a balance-panel.js panel
  // (no observer, no validity gates) — see metric review in the evidence file.
  const wallMetrics = ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths'];
  const armMetrics = ['shelledKcal', 'shelledKcalLean', 'shelledKcalFed', 'shelledDayEatKcal', 'scholarPantryTakes'];
  const rows = all.map(o => {
    const metrics = {};
    for (const m of wallMetrics.concat(armMetrics)) metrics[m] = num(o[m]) == null ? 0 : num(o[m]);
    return { seed: o.seed, policy: o.policyId, arm: o.arm, metrics };
  });
  for (const arm of ['control', 'armed']) {
    const payload = {
      schema: 'shellcounter-b-light-panel/1',
      note: 'Light panel: honest per-seed metrics from the sim-shellcounter-b pilot sweep. NOT a balance-panel.js panel (no observer, no validity gates) — see metric review.',
      wallMetrics, armMetrics,
      rows: rows.filter(r => r.arm === arm),
    };
    fs.mkdirSync(PANEL_OUT, { recursive: true });
    fs.writeFileSync(path.join(PANEL_OUT, `${arm}.json`), JSON.stringify(payload, null, 1));
  }
  console.log('PANEL JSONS WRITTEN to', PANEL_OUT);
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required EXPLICITLY.'); process.exit(2); }
  const all = [];
  for (const seed of SEEDS) {
    for (const p of POLICIES) {
      for (const a of ARMS) {
        if (a === 'armed') process.env.SHELLCOUNTER = '1'; else delete process.env.SHELLCOUNTER;
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.SHELLCOUNTER;
  writePanel(all);
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
