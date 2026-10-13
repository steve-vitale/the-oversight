#!/usr/bin/env node
// diag-kcal-r8-20261012.js — lever 0 r8: the kcal BALANCE SHEET.
// Instrument pantry inflow by source, outflow by sink, and pantry
// trajectory around scale commitments. Doubles as the r8 baseline sweep
// (wall numbers: national / table / wins, wave 4-5, median+max survival,
// death-cause shares, vests, counters, successions, feastSurge).
//
// SEEDS="11,22,..." DAYS=200 OUT=/tmp/kcal-r8.json node scripts/diag-kcal-r8-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const POLICIES = {
  competent: require('./policies/competent').competent,
  winseek: require('./policies/winseek').winseek,
};
const POLICY_ID = process.env.POLICY || 'competent';
const POLICY = POLICIES[POLICY_ID] || POLICIES.competent;

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,111,222,333').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/kcal-r8.json';

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function rosterN(Game) {
  try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return 0; }
}

// (classifyRemoveKcal retired: stack-sniffing perturbs the sim. Sinks are
// tracked via the withSink entry-point wrappers above.)

async function oneRun(seed, days) {
  const { Game, manifest } = await loadGame({ seed, mode: POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    inBy: {}, outBy: {}, deaths: [],
    successions: 0, youngSuccessions: 0, successionDays: [],
    vests: [], vestSeen: {}, counterKills: 0, countersKnown: new Set(),
    waves: { max: 0, day: {} },
  };
  // --- inflow ---
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name) {
    try { if (kcal > 0) W.inBy[name || '?'] = (W.inBy[name || '?'] || 0) + kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
  // --- inflow: scholar donations bypass stockPantry (donateToPantry pushes direct) ---
  const oDon = Game.donateToPantry;
  if (typeof oDon === 'function') Game.donateToPantry = function (idx) {
    let item = null;
    try { item = (this.state.scholar || {}).inventory[idx]; } catch (e) {}
    const r = oDon.apply(this, arguments);
    try {
      if (item && item.kcalEach > 0) {
        const nm = 'donated:' + (item.name || 'food');
        W.inBy[nm] = (W.inBy[nm] || 0) + (item.kcalEach || 0) * (item.units || 1);
      }
    } catch (e) {}
    return r;
  };
  // --- inflow: villager surplus-sharing writes directly (stockSurplus), not via stockPantry ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    try { if (give > 0) W.inBy['villager surplus'] = (W.inBy['villager surplus'] || 0) + give; } catch (e) {}
    return oSur.apply(this, arguments);
  };
  // --- sink override: set by wrapping the OBLIGATION entry points (payTribute,
  // hostFeast, answerNationalChoice...). Stack-sniffing (new Error().stack)
  // perturbs the sim (measured: seed-77 trajectory changes with it in) —
  // never sniff stacks in measurement wrappers.
  let sinkOverride = null;
  const withSink = (sink, fnName) => {
    const o = Game[fnName];
    if (typeof o === 'function') Game[fnName] = function () {
      const prev = sinkOverride; sinkOverride = sink;
      try { return o.apply(this, arguments); } finally { sinkOverride = prev; }
    };
  };
  withSink('tribute', 'payTribute');
  withSink('feast', 'hostFeast');
  withSink('oath', 'answerNationalChoice');
  withSink('watchers', 'answerGlobalChoice');
  withSink('aid', 'sendAid');
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') Game._removePantryKcal = function (kcal) {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
  };
  // --- pantry draws: meals / rations / feast / scholar ---
  const oDraw = Game.pantryDraw;
  if (typeof oDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    let sink = null;
    try {
      const realPantry = (Game.state.village || {}).pantry;
      const isReal = v && v.pantry === realPantry;
      if (sinkOverride === 'feast' && isReal) sink = 'feast-draw';
      else if (isReal && opts && opts.cook) sink = 'meals';
      else if (isReal && opts && opts.cook === false) sink = 'rations';
    } catch (e) {}
    const r = oDraw.apply(this, arguments);
    try { if (sink && r && r.taken) W.outBy[sink] = (W.outBy[sink] || 0) + r.taken; } catch (e) {}
    return r;
  };
  // --- player takes from pantry (scholar eating) ---
  const oTake = Game.takeFromPantry;
  if (typeof oTake === 'function') Game.takeFromPantry = function () {
    const r = oTake.apply(this, arguments);
    try {
      const t = (r && r.takenStack) || [];
      const k = t.reduce((a, i) => a + (i.kcalEach || 0) * (i.units || 1), 0);
      if (k > 0) W.outBy['scholar'] = (W.outBy['scholar'] || 0) + k;
    } catch (e) {}
    return r;
  };
  // --- rot (dedupe by item identity: the sweep may run before removal completes) ---
  // key by foodState: rot:fresh vs rot:preserved tells us whether the cook's
  // racks are keeping up or the preserved stockpile itself is rotting.
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W.outBy['rot:' + fs] = (W.outBy['rot:' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  // --- deaths ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try { W.deaths.push({ day: (Game.state.scholar || {}).day || 0, who: String((opts && (opts.name || opts.villagerId)) || '?').slice(0, 24), cause: String((opts && opts.cause) || '?').slice(0, 24) }); } catch (e) {}
    return oDie.apply(this, arguments);
  };
  // --- successions / vests / counters / wave unlocks ---
  const pd = Game.playerDeath;
  if (typeof pd === 'function') Game.playerDeath = function () {
    const beforeId = this.villagerId;
    const r = pd.apply(this, arguments);
    try {
      if (!this.over && this.villagerId && this.villagerId !== beforeId) {
        W.successions++;
        const nc = ((this.data || {}).villagers || []).find(x => x.id === this.villagerId) || {};
        if (nc.age != null && nc.age < 25) W.youngSuccessions++;
        W.successionDays.push(((this.state || {}).scholar || {}).day || 0);
      }
    } catch (e) {}
    return r;
  };
  const oPol = Game.polityOf;
  if (typeof oPol === 'function') Game.polityOf = function (vid) {
    let r = null; try { r = oPol.apply(this, arguments); } catch (e) { return null; }
    try { if (r && r.shape && !W.vestSeen[r.shape]) { W.vestSeen[r.shape] = true; W.vests.push({ day: (Game.state.scholar || {}).day || 0, shape: r.shape, size: r.size || 0 }); } } catch (e) {}
    return r;
  };
  // wave reach: read at end of run (no unlockWave API; unlockedWave() is the getter)
  const oRWK = Game.recordWaveKill;
  if (typeof oRWK === 'function') Game.recordWaveKill = function (mid) {
    try { if (Game.monsterCounterKnown && Game.monsterCounterKnown(mid)) W.counterKills++; } catch (e) {}
    return oRWK.apply(this, arguments);
  };
  // counters discovered: hook teach path lightly — use monsterCounterKnown presence per kill via noteFeastedCombatUse? skip; use recordWaveKill's own.
  // --- daily trace ---
  const trace = [];
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      let rank = '?'; try { rank = G.scaleRank(); } catch (e) {}
      let nat = false, net = false; try { nat = !!G.state.nationalLive; net = !!G.state.networkLive; } catch (e) {}
      let owed = 0; try { owed = (G.hierarchyState() || []).filter(l => l.subordinate === 'haven' && l.status === 'active').reduce((a, l) => a + (l.tributeKcalPerWeek || 0), 0); } catch (e) {}
      let feast = false; try { feast = !!(((G.state || {}).scholar || {}).prog || {}).feastSurgeUsed; } catch (e) {}
      let arc = 1; try { arc = (G.progState() || {}).arc || 1; } catch (e) {}
      let wave = 1; try { wave = G.unlockedWave ? G.unlockedWave() : 1; } catch (e) {}
      let pres = 0; try { for (const it of (((G.state || {}).village || {}).pantry || [])) if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) pres += (it.kcalEach || 0) * (it.units || 1); } catch (e) {}
      let cooks = 0; try { const asg = (((G.state || {}).village || {}).assignments || {}); for (const a of Object.values(asg)) if (a && a.task === 'cook') cooks++; } catch (e) {}
      trace.push({ day, pk: Math.round(pantryKcal(G)), roster: rosterN(G), rank, nat, net, owed, feast, arc, wave, pres: Math.round(pres), cooks });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest });
  const ms = Date.now() - t0;
  try { W.waves.max = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState() || {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    networkLive: !!((Game.state || {}).networkLive),
    feastSurge: !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    pkEnd: Math.round(pantryKcal(Game)), rosterEnd: rosterN(Game),
    inBy: W.inBy, outBy: W.outBy,
    deaths: W.deaths, successions: W.successions, youngSuccessions: W.youngSuccessions, successionDays: W.successionDays,
    vests: W.vests, counterKills: W.counterKills, waves: W.waves,
    ms,
  };
  return { seed, end, trace };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end, trace } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end, trace });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} pkEnd=${Math.round(end.pkEnd / 1000)}k maxWave=${end.waves.max} feast=${end.feastSurge} won=${end.won} (${end.ms}ms)`);
  }
  fs.writeFileSync(OUT, JSON.stringify({ meta: { days: DAYS, seeds: SEEDS }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
