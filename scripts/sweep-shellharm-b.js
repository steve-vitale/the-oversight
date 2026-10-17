#!/usr/bin/env node
// scripts/sweep-shellharm-b.js — DIAGNOSTIC sweep for the sim-shellcounter-b harm model.
//
// 8 seeds x {leadfeast,belongfeast} x {control,shell-armed,perturb-armed}, 180d
// death-aware, FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT. Own in-sweep controls,
// identical seeds (the original shellcounter-b corpus, evidence/2026-10-17/).
//
// Arms:
//   control      — base policy, no wrapper.
//   shell        — SHELLCOUNTER=1: faithful reconstruction of the killed layer
//                  (shells + putAway; the 22-vs-7 arm).
//   perturb      — PERTURBDAWN=1: neutral 4-tick dawn busywork under identical
//                  gates, no food moved (isolates the timing vector).
//
// Per run, records: per-death {day,who,cause,player,cls} (player = scholar;
// villager-only starvation = !player && STARVATION), villageLostDay, days the
// pantry went empty, a daily pantry/scholar-kcal/lean curve, shell/perturb
// beat logs, per-vid pantry takes (food-channel audit), wall metrics, and the
// §15 light panel JSONs (control/shell/perturb).
//
// Emits per-seed JSONs to evidence/2026-10-17/perseed-shellharm/ and light
// panel-schema JSONs to evidence/2026-10-17/panel-shellharm/.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-shellharm-b.js
// Targeted: SEEDS="7304" POLICIES="belongfeast" ARMS="perturb" DAYS=60 OUT=...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const PD = require('./policies/perturbdawn');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'shell', 'perturb']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellharm');
const PANEL_OUT = process.env.PANEL_OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellharm');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

function wrapPolicy(base, policyId, arm) {
  if (arm === 'shell') return SC.withShellCounter(base, policyId + '+shellcounter', 'harmdiag');
  if (arm === 'perturb') return PD.withPerturbDawn(base, policyId + '+perturbdawn', 'harmdiag');
  return base;
}

// livingNPCs — mirrors the harness's own engine-true "is the community alive"
// check (sim-harness.js): roster minus the scholar minus .dead-marked persons.
// The collapse day for tail analysis = the first day this hits 0. The engine's
// own villageLost flag (game.js:28575) is captured as a fallback for runs where
// Game.over breaks the loop before policy.daily sees the death day.
function livingNPCs(G) {
  try {
    const v = G.state.village || {};
    const sid = G.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((G.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    }).length;
  } catch (e) { return 1; }
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = wrapPolicy(base, policyId, arm);
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = { deaths: [], errors: 0, shellLog: [], perturbLog: [], curve: [], collapseDay: null, pantryEmptyDays: [] };
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player), cls: deathClass(cause) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  const noteBeats = (G, ctx) => {
    try {
      const nS = ctx._scShellDays || 0;
      if (nS > (t._seenShell || 0)) {
        t._seenShell = nS;
        t.shellLog.push({ day: ctx._scShellDay != null ? ctx._scShellDay : gday(G), kcal: num((G.state.scholar || {}).kcal) });
      }
      const nP = ctx._pdPerturbDays || 0;
      if (nP > (t._seenPert || 0)) {
        t._seenPert = nP;
        t.perturbLog.push({ day: ctx._pdPerturbDay != null ? ctx._pdPerturbDay : gday(G), kcal: num((G.state.scholar || {}).kcal) });
      }
      t.shelledKcalTotal = ctx._scShelledKcal || 0;
      t.shelledKcalLean = ctx._scShelledKcalLean || 0;
      t.shelledKcalFed = ctx._scShelledKcalFed || 0;
      t.perturbDays = nP;
    } catch (e) { t.errors++; }
  };
  policy.daily = (G, ctx) => {
    noteBeats(G, ctx);
    try {
      const d = gday(G);
      const s = G.state.scholar || {};
      const lost = !!(G.villageLost);
      if (livingNPCs(G) === 0 && t.collapseDay == null) t.collapseDay = d;
      let pantry = 0;
      try { pantry = Math.round(G.pantryKcal() || 0); } catch (e) {}
      if (pantry < 1) t.pantryEmptyDays.push(d);
      let lean = 0;
      try { lean = ((s.kcal || 0) < G.kcalCap() * 0.5) ? 1 : 0; } catch (e) {}
      t.curve.push({ d, pantry, skcal: Math.round(s.kcal || 0), lean, lost: lost ? 1 : 0 });
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if (s.exiled) hist.exiled = true;
      if ((s.kcal || 99999) < 500) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    noteBeats(G, ctx);
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
  const starv = t.deaths.filter(d => d.cls === 'STARVATION');
  // collapseDay: first day the community died (livingNPCs hit 0). Fallback for
  // engine-declared villageLost runs where Game.over broke the loop before
  // the hook could see it: the engine's end day.
  let collapseDay = t.collapseDay;
  const engineLost = !!(Game.villageLost);
  if (collapseDay == null && engineLost) collapseDay = result.days;
  const lostDay = collapseDay == null ? 9999 : collapseDay;
  const splitStarv = (list) => ({
    pre: list.filter(d => d.day < lostDay).length,
    tail: list.filter(d => d.day >= lostDay).length,
  });
  const villStarv = starv.filter(d => !d.player);
  const scholarStarv = starv.filter(d => d.player);
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
    starvationDeaths: starv.length,
    villagerStarvationDeaths: villStarv.length,
    scholarStarvationDeaths: scholarStarv.length,
    villStarvPre: splitStarv(villStarv).pre,
    villStarvTail: splitStarv(villStarv).tail,
    villStarvDeathList: villStarv.map(d => ({ day: d.day, cause: d.cause })),
    scholarStarvDeathList: scholarStarv.map(d => ({ day: d.day, cause: d.cause })),
    villageLostDay: collapseDay,   // first community-death day (livingNPCs==0); engine fallback
    engineVillageLost: engineLost,
    pantryEmptyDays: t.pantryEmptyDays,
    firstPantryEmptyDay: t.pantryEmptyDays.length ? t.pantryEmptyDays[0] : null,
    curve: t.curve,
    causeCounts, clsCounts,
    shellDays: t.shellLog.length, shelledKcal: t.shelledKcalTotal || 0,
    shelledKcalLean: t.shelledKcalLean || 0, shelledKcalFed: t.shelledKcalFed || 0,
    perturbDays: t.perturbDays || 0,
    scholarPantryTakes: (() => { try {
      const vv = Game.state.village || {}, s = Game.state.scholar || {};
      return ((vv.takes || {})[s.villagerId]) || 0;
    } catch (e) { return null; } })(),
    villagerPantryTakes: (() => { try {
      const vv = Game.state.village || {}, s = Game.state.scholar || {};
      const takes = vv.takes || {};
      let sum = 0;
      for (const [vid, k] of Object.entries(takes)) if (vid !== s.villagerId) sum += (k || 0);
      return sum;
    } catch (e) { return null; } })(),
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} shell=${out.shellDays} pert=${out.perturbDays} villStarv=${out.villagerStarvationDeaths}(pre${out.villStarvPre}/tail${out.villStarvTail}) collapse=${out.villageLostDay == null ? 'n/a' : out.villageLostDay} nat=${out.national} err=${t.errors}`);
  return out;
}

function writePanel(all) {
  // §15 light panel: honest per-seed metrics, NOT a balance-panel.js panel
  // (no observer, no validity gates) — same deviation as shellcounter-b.
  const wallMetrics = ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths', 'villagerStarvationDeaths'];
  const armMetrics = ['shelledKcal', 'shelledKcalLean', 'shelledKcalFed', 'perturbDays'];
  const rows = all.map(o => {
    const metrics = {};
    for (const m of wallMetrics.concat(armMetrics)) metrics[m] = num(o[m]) == null ? 0 : num(o[m]);
    return { seed: o.seed, policy: o.policyId, arm: o.arm, metrics };
  });
  for (const arm of ['control', 'shell', 'perturb']) {
    const payload = {
      schema: 'shellharm-b-light-panel/1',
      note: 'Light panel: honest per-seed metrics from the sim-shellharm-b diagnostic sweep. NOT a balance-panel.js panel (no observer, no validity gates) — see metric review.',
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
        delete process.env.SHELLCOUNTER; delete process.env.PERTURBDAWN;
        if (a === 'shell') process.env.SHELLCOUNTER = '1';
        if (a === 'perturb') process.env.PERTURBDAWN = '1';
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.SHELLCOUNTER; delete process.env.PERTURBDAWN;
  writePanel(all);
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
