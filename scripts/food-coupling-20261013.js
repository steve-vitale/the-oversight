#!/usr/bin/env node
// scripts/food-coupling-20261013.js — the FIGHT→FOOD COUPLING instrument
// (longsim scale-wall r5, 2026-10-13). Fills r3's open blank: an in-run
// measure of the kill→meat→pantry→rot pipeline, plus vest tracking in the
// sweep driver. TOOLING ONLY — no game balance changes (measurement §8).
//
// Wraps (Game methods, no RNG touched, no game state mutated):
//   recordWaveKill(monsterId) -> kills/day by wave
//   carcassToMeat(inv,i,knows) -> kcal harvested per kill (gross vs net)
//   stockPantry(kcal,name) -> influx by source
//   sweepSpoiled() -> rot loss breakdown (pack/pantry/stash x foodState)
//   cookFood/preserveFood/renderFat/makePemmican/askSpecialist/hostFeast/grantFeastBuff -> processing + feast counts
//   resolveOneAssignment(vid,a) -> hunt/forage labor split (task counts)
// Policy.daily wrapper -> daily rows: roster need, pantry kcal, pantry-days
// buffer (pantryDaysEstimate), ate share (lastEat vs need).
// End-of-run: vest scan (military_vest/swat_vest in pack or equipped).
//
// Usage:
//   SEEDS="11,22,33,44" POLICIES="competent,winseek" DAYS=150 \
//   OUT=/tmp/fc-baseline.json node scripts/food-coupling-20261013.js
//   FOODLEVER=1 <...>   # after-side: any game gate behind FOODLEVER
//
// Exit 0 + stdout summary table; OUT gets the full JSON.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');

const POLICY_REGISTRY = { competent, winseek };
const VEST_IDS = ['military_vest', 'swat_vest'];

function vestCount(Game) {
  try {
    let n = 0;
    const inv = (Game.state.scholar || {}).inventory || [];
    for (const it of inv) if (it && VEST_IDS.includes(it.id)) n += (it.units || 1);
    const eq = (Game.state.scholar || {}).equipped || {};
    for (const v of Object.values(eq)) if (v && VEST_IDS.includes(v.id)) n++;
    return n;
  } catch (e) { return 0; }
}

function pantryKcalOf(Game, v) {
  try { return ((v || Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}

function rosterNeed(Game) {
  let need = 0, pop = 0;
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson ? Game.getPerson(id) : null;
      if (!person || person.dead) continue;
      need += (person.kcalPerDay || 2000); pop++;
    }
  } catch (e) {}
  return { need, pop };
}

// attachInstruments(Game) -> metrics object + detach(). Everything behind
// try/catch: a hostile read must never kill a run.
function attachInstruments(Game) {
  const m = {
    kills: [],           // {day, wave, mid}
    butcher: [],         // {day, gross, net, meatId, how, knows}
    influx: {},          // name -> kcal
    rot: { kcal: 0, items: 0, by: {} },
    process: { cook: 0, smoke: 0, render: 0, pemmican: 0, spec: 0, feast: 0, feastBuff: 0 },
    tasks: {},           // taskId -> resolutions/day-labor
    daily: [],           // {day, need, pop, pantryKcal, pantryDays, ateShare}
    starveDays: 0,
    vests: 0,
  };
  const day = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
  const waveOf = (mid) => {
    try {
      const d = (Game.data.monsters || []).find(x => x.id === mid);
      return (d && d.wave) || 1;
    } catch (e) { return 1; }
  };
  const wrap = (name, fn) => {
    const f = Game[name];
    if (typeof f !== 'function') return;
    Game[name] = function (...a) { try { fn.apply(this, a); } catch (e) {} return f.apply(this, a); };
  };

  wrap('recordWaveKill', (mid) => { m.kills.push({ day: day(), wave: waveOf(mid), mid: String(mid || '?') }); });

  // carcassToMeat(inv, i, knows): capture gross before, net after.
  const origCTM = Game.carcassToMeat;
  if (typeof origCTM === 'function') {
    Game.carcassToMeat = function (inv, i, knows) {
      let gross = 0, meatId = '?', how = '?';
      try {
        const it = inv && inv[i];
        gross = (it && it.hiddenKcal) || 0;
        meatId = String(((it && it.plantId) || '').replace(/^meat_/, '') || '?');
        how = String((it && it.how) || '?');
      } catch (e) {}
      const r = origCTM.apply(this, arguments);
      try {
        const it = inv && inv[i];
        const net = it ? (it.kcalEach || 0) * (it.units || 1) : 0;
        m.butcher.push({ day: day(), gross: Math.round(gross), net: Math.round(net), meatId, how, knows: !!knows });
      } catch (e) {}
      return r;
    };
  }

  wrap('stockPantry', (kcal, name) => {
    const k = Math.round(kcal || 0);
    if (k <= 0) return;
    const nm = String(name || 'unknown');
    m.influx[nm] = (m.influx[nm] || 0) + k;
  });

  // rot loss: snapshot spoiled kcal just before the sweep runs
  const origSweep = Game.sweepSpoiled;
  if (typeof origSweep === 'function') {
    Game.sweepSpoiled = function (...a) {
      try {
        const scan = (cont, label) => {
          for (const it of (cont || [])) {
            if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
              const k = (it.kcalEach || 0) * (it.units || 1);
              m.rot.kcal += k; m.rot.items++;
              const fs = (it.foodState || '?') + '/' + (it.foodKind || '?');
              m.rot.by[label] = m.rot.by[label] || {};
              m.rot.by[label][fs] = (m.rot.by[label][fs] || 0) + k;
              // by-name top offenders (item identity, first 40 chars)
              const nm = String(it.name || '?').slice(0, 40);
              const nn = m.rotNames || (m.rotNames = {});
              nn[nm] = (nn[nm] || 0) + k;
            }
          }
        };
        scan(Game.state.scholar.inventory, 'pack');
        try { const ps = Game.prepStash ? Game.prepStash() : null; if (ps && ps !== Game.state.scholar.inventory) scan(ps, 'stash'); } catch (e) {}
        scan((Game.state.village || {}).pantry, 'pantry');
      } catch (e) {}
      return origSweep.apply(this, a);
    };
  }

  wrap('cookFood', () => m.process.cook++);
  wrap('preserveFood', () => m.process.smoke++);
  wrap('renderFat', () => m.process.render++);
  wrap('makePemmican', () => m.process.pemmican++);
  wrap('askSpecialist', () => m.process.spec++);
  wrap('hostFeast', () => m.process.feast++);
  wrap('grantFeastBuff', () => m.process.feastBuff++);
  wrap('resolveOneAssignment', (vid, a) => {
    const t = (a && a.task) || '?';
    m.tasks[t] = (m.tasks[t] || 0) + 1;
  });
  return m;
}

// dailyRow(Game): the daily village food snapshot. Call from policy.daily.
function dailyRow(Game) {
  const row = { day: 0, need: 0, pop: 0, pantryKcal: 0, pantryDays: 0, ateShare: null, preservedKcal: 0 };
  try { row.day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const rn = rosterNeed(Game);
    row.need = rn.need; row.pop = rn.pop;
  } catch (e) {}
  try {
    const v = Game.state.village || {};
    for (const it of (v.pantry || [])) {
      const k = (it.kcalEach || 0) * (it.units || 1);
      row.pantryKcal += k;
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) row.preservedKcal += k;
    }
  } catch (e) {}
  try { row.pantryDays = Game.pantryDaysEstimate ? Math.min(999, Game.pantryDaysEstimate()) : 0; } catch (e) {}
  try {
    const v = Game.state.village || {};
    if (typeof v.lastEat === 'number' && row.need > 0) {
      row.ateShare = +((v.lastEat / row.need) * 100).toFixed(1);
      if (v.lastEat < row.need * 0.6) row.starved = true;
    }
  } catch (e) {}
  return row;
}

function finalize(Game, m, runResult) {
  const out = {
    days: runResult.days, endReason: runResult.endReason,
    kills: m.kills.length,
    killsByWave: {},
    butcherEvents: m.butcher.length,
    grossHarvest: 0, netHarvest: 0,
    influx: m.influx,
    rotKcal: Math.round(m.rot.kcal), rotItems: m.rot.items, rotBy: m.rot.by,
    process: m.process,
    tasks: m.tasks,
    starveDays: 0,
    ateShareMed: null,
    pantryDaysMed: null,
    pantryKcalEnd: 0,
    vests: 0,
  };
  for (const k of m.kills) out.killsByWave[k.wave] = (out.killsByWave[k.wave] || 0) + 1;
  for (const b of m.butcher) { out.grossHarvest += b.gross; out.netHarvest += b.net; }
  const ate = [], pd = [];
  for (const r of m.daily) {
    if (r.ateShare != null) ate.push(r.ateShare);
    if (r.pantryDays != null && r.pantryDays < 999) pd.push(r.pantryDays);
    if (r.starved) out.starveDays++;
  }
  ate.sort((a, b) => a - b); pd.sort((a, b) => a - b);
  out.ateShareMed = ate.length ? ate[Math.floor(ate.length / 2)] : null;
  out.pantryDaysMed = pd.length ? pd[Math.floor(pd.length / 2)] : null;
  try { out.pantryKcalEnd = pantryKcalOf(Game); } catch (e) {}
  try {
    let pk = 0;
    for (const it of ((Game.state.village || {}).pantry || []))
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) pk += (it.kcalEach || 0) * (it.units || 1);
    out.preservedKcalEnd = Math.round(pk);
  } catch (e) { out.preservedKcalEnd = 0; }
  out.rotNames = m.rotNames || {};
  out.vests = vestCount(Game);
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  out.won = !!Game.won;
  // wall fields
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  out.national = (RANK_ORDER[out.rank] || 0) >= 2 ? 1 : 0;
  out.table = out.tableWaiting ? 1 : 0;
  return out;
}

async function runFoodCouple(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'food-couple';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'foodcouple-' + pid });
      await setupGame(Game);
      const m = attachInstruments(Game);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(dailyRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed }, finalize(Game, m, result));
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] d=${row.days} ${row.endReason} kills=${row.kills} (w1:${row.killsByWave[1]||0} w2:${row.killsByWave[2]||0} w3:${row.killsByWave[3]||0}) butcher=${row.butcherEvents} net=${row.netHarvest}k rot=${row.rotKcal}k pantryEnd=${Math.round(row.pantryKcalEnd/1000)}k pdaysMed=${row.pantryDaysMed} ateMed=${row.ateShareMed}% vests=${row.vests} wave=${row.maxWave} rank=${row.rank}`);
    }
  }
  // summary
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const rotNameAgg = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.rotNames || {})) rotNameAgg[k] = (rotNameAgg[k] || 0) + v;
  const topRot = Object.entries(rotNameAgg).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const summary = {
    label, seeds, policies: policyIds, days,
    runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), won: agg(r => r.won),
    medianDays: med(rows.map(r => r.days)),
    kills: agg(r => r.kills),
    killsPerDay: +(agg(r => r.kills) / Math.max(1, agg(r => r.days))).toFixed(2),
    killsByWave: {},
    butcherEvents: agg(r => r.butcherEvents),
    grossHarvestK: agg(r => r.grossHarvest),
    netHarvestK: agg(r => r.netHarvest),
    avgKcalPerKill: rows.length && agg(r => r.kills) ? Math.round(agg(r => r.netHarvest) / agg(r => r.kills)) : 0,
    influx: {},
    rotKcal: agg(r => r.rotKcal), rotItems: agg(r => r.rotItems),
    process: {}, tasks: {},
    starveDays: agg(r => r.starveDays),
    vests: agg(r => r.vests),
    maxWave: Math.max.apply(null, rows.map(r => r.maxWave).concat([1])),
    preservedKcalEnd: agg(r => r.preservedKcalEnd || 0),
    rotTopNames: topRot.map(([k, v]) => `${k}=${(v / 1000).toFixed(0)}k`),
  };
  for (const r of rows) {
    for (const [w, n] of Object.entries(r.killsByWave)) summary.killsByWave[w] = (summary.killsByWave[w] || 0) + n;
    for (const [k, v] of Object.entries(r.influx)) summary.influx[k] = (summary.influx[k] || 0) + v;
    for (const [k, v] of Object.entries(r.process)) summary.process[k] = (summary.process[k] || 0) + v;
    for (const [k, v] of Object.entries(r.tasks)) summary.tasks[k] = (summary.tasks[k] || 0) + v;
  }
  return { summary, rows };
}

function printSummary(rep) {
  const s = rep.summary;
  console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days}`);
  console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} medianDays ${s.medianDays} maxWave ${s.maxWave} vests ${s.vests}`);
  console.log(`fight->food: kills=${s.kills} (${s.killsPerDay}/day) byWave=${JSON.stringify(s.killsByWave)} butcherEvents=${s.butcherEvents} netHarvest=${(s.netHarvestK / 1000).toFixed(0)}k avgKcalPerKill=${s.avgKcalPerKill}`);
  console.log('influx:', Object.entries(s.influx).map(([k, v]) => `${k}=${(v / 1000).toFixed(0)}k`).join(' '));
  console.log(`rot: ${s.rotKcal / 1000}k kcal over ${s.rotItems} items; process:`, JSON.stringify(s.process));
  console.log('  rot top names:', (s.rotTopNames || []).join(' | '));
  console.log(`  preserved stock at end: ${(s.preservedKcalEnd / 1000).toFixed(0)}k kcal`);
  console.log('labor (task resolutions):', JSON.stringify(s.tasks));
  console.log(`starveDays=${s.starveDays}`);
}

if (require.main === module) {
  (async () => {
    const rep = await runFoodCouple({});
    printSummary(rep);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runFoodCouple, attachInstruments, dailyRow, finalize, printSummary, vestCount, VEST_IDS };
