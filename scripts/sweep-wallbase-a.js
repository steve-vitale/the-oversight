#!/usr/bin/env node
// scripts/sweep-wallbase-a.js — SCALE-WALL BASELINE SWEEP (flesh-out loop,
// 2026-11-09/10, arm sim-wallbase-a, DIAG / measurement only).
//
// Fresh wall numbers on current master: 16 seeds, competent policy ONLY,
// 150d death-aware cap, env PLENTYDEPRI=1 DEPOSITGATE=1. ZERO src/js, ZERO
// scripts/policies edits — instrument + analysis only. Modeled on the
// established census pattern (scripts/census-feastvoice-b.js): per-seed
// JSON + say/ambient beats, daily maxRank/maxArc/maxFires/maxWave history,
// death telemetry. Per-seed files land in
// evidence/2026-11-09/sim-wallbase-a/; the analyzer
// (scripts/analyze-wallbase-a.js) aggregates them.
//
// Usage:
//   PLENTYDEPRI=1 DEPOSITGATE=1 node scripts/sweep-wallbase-a.js
// Targeted: SEEDS="110001" DAYS=60 node scripts/sweep-wallbase-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { competent } = require('./policies/competent');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [110001, 110002, 110003, 110004, 110005, 110006, 110007, 110008, 110009, 110010, 110011, 110012, 110013, 110014, 110015, 110016]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const EVID = path.join(__dirname, '..', 'evidence', '2026-11-09', 'sim-wallbase-a');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const stripTags = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
const msgText = (msg) => stripTags((msg && (msg.text || msg.msg || msg.message)) || msg || '');

// Vests read — copied from sweep-compare.js stdSnapshot (vest-counter fix,
// sim-vestcounter-b 2026-10-30): inventory entries live under `.itemId`,
// equipped slots store `{itemId, name, ...}`; scholar counted in `vests`,
// live roster villagers counted once per (holder, vestId) pair in
// `vestsVillager`. Pure reads only.
function readVests(Game) {
  const out = { vests: 0, vestsVillager: 0 };
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    const vestEntryId = (e) => {
      if (!e) return null;
      if (typeof e === 'string') return e;
      return e.itemId || e.id || null;
    };
    let n = 0;
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (VEST_IDS.includes(vestEntryId(it))) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (VEST_IDS.includes(vestEntryId(v))) n++;
    out.vests = n;
    const seenPairs = new Set();
    const scholarVid = Game.villagerId;
    const roster = ((Game.state.village || {}).roster || []);
    const people = (Game.data || {}).villagers || [];
    const survivors = (Game.data || {}).background_survivors || [];
    for (const vid of roster) {
      if (vid === scholarVid) continue;
      const p = people.find(x => x && x.id === vid) || survivors.find(x => x && x.id === vid);
      if (!p || p.dead) continue;
      for (const it of (p.items || [])) {
        const id = vestEntryId(it);
        if (VEST_IDS.includes(id)) seenPairs.add(vid + '|' + id);
      }
      for (const v of Object.values(p.equipped || {})) {
        const id = vestEntryId(v);
        if (VEST_IDS.includes(id)) seenPairs.add(vid + '|' + id);
      }
    }
    out.vestsVillager = seenPairs.size;
  } catch (e) {}
  return out;
}

function readRoster(Game) {
  // Living roster at end: name + occupation, for the village assessment
  // (who thrived). Pure reads only.
  const living = [];
  try {
    const scholarVid = Game.villagerId;
    const roster = ((Game.state.village || {}).roster || []);
    const people = (Game.data || {}).villagers || [];
    const survivors = (Game.data || {}).background_survivors || [];
    for (const vid of roster) {
      const p = people.find(x => x && x.id === vid) || survivors.find(x => x && x.id === vid);
      if (!p || p.dead) continue;
      living.push({ name: p.name || vid, occ: p.occupationId || p.occupation || null, scholar: vid === scholarVid });
    }
  } catch (e) {}
  return living;
}

function attachAmbientInstrument(Game, t) {
  t.ambient = [];
  try {
    if (typeof Game.ambientLine === 'function') {
      const orig = Game.ambientLine.bind(Game);
      Game.ambientLine = function (key, vid, nm, arg) {
        let out = null;
        try { out = orig(key, vid, nm, arg); } catch (e) { out = null; }
        try {
          if (out) {
            t.ambient.push({ day: gday(Game), key: String(key), vid: String(vid), nm: stripTags(nm), text: stripTags(out) });
            if (t.ambient.length > 4000) t.ambient.splice(0, 1000);
          }
        } catch (e) { t.errors++; }
        return out;
      };
    } else { t.errors++; }
  } catch (e) { t.errors++; }
}

// Say/sysSay wrap: the full narrator transcript (sense-test surface).
// Capped with trimming so a 150d run cannot balloon the beats file.
function attachSayInstrument(Game, t) {
  t.saybeats = [];
  const push = (msg, src) => {
    try {
      const s = msgText(msg);
      if (!s) return;
      t.saybeats.push({ day: gday(Game), src, text: s });
      if (t.saybeats.length > 4000) t.saybeats.splice(0, 1000);
    } catch (e) {}
  };
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    const oSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    if (oSay) Game.say = function (msg) { push(msg, 'say'); return oSay(msg); };
    if (oSys) Game.sysSay = function (msg) { push(msg, 'sys'); return oSys.apply(this, arguments); };
  } catch (e) { t.errors++; }
}

function attachDeathInstrument(Game, t) {
  t.deaths = [];
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    Game.tele = function (type, data) {
      const r = oTele ? oTele.apply(this, arguments) : undefined;
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause, player: !!(data && data.player) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'wallbase-a', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  const inst = { errors: 0 };
  attachAmbientInstrument(Game, inst);
  attachSayInstrument(Game, inst);
  attachDeathInstrument(Game, inst);
  const hist = { maxRank: 0, maxArc: 1, maxFires: 0, maxWave: 1, everTable: false, everEntered: false, maxVests: 0, maxVestsVillager: 0, maxStanding: 0 };
  const oDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      if (pg.tableDone) hist.everEntered = true;
      const rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1;
      if (a > hist.maxArc) hist.maxArc = a;
      const pol2 = G._havenPolity ? G._havenPolity() : null;
      const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
      if (fires > hist.maxFires) hist.maxFires = fires;
      const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
      if (w > hist.maxWave) hist.maxWave = w;
      const vs = readVests(G);
      if (vs.vests > hist.maxVests) hist.maxVests = vs.vests;
      if (vs.vestsVillager > hist.maxVestsVillager) hist.maxVestsVillager = vs.vestsVillager;
      const st = G.villageStanding ? ((G.villageStanding() || {}).total | 0) : 0;
      if (st > hist.maxStanding) hist.maxStanding = st;
    } catch (e) { inst.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const pg = Game.progState ? Game.progState() : {};
  const endRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village';
  const endVests = readVests(Game);
  const endStanding = Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : null;
  const causeCounts = {};
  for (const d of inst.deaths) {
    const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
    causeCounts[k] = (causeCounts[k] || 0) + 1;
  }
  const out = {
    arm: 'sim-wallbase-a', seed, policyId: 'competent', days: result.days, gameDays: result.gameDays,
    endReason: result.endReason, stop: result.stop, communityExposure: result.communityExposure,
    national: Math.max(hist.maxRank, RANK_ORDER[endRank] || 0) >= 2 ? 1 : 0,
    maxRank: Math.max(hist.maxRank, RANK_ORDER[endRank] || 0),
    table: (hist.everTable || !!pg.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || !!pg.tableDone) ? 1 : 0,
    wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    waveKills: result.waveKills || {},
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxStanding: hist.maxStanding, endStanding,
    vests: Math.max(hist.maxVests, endVests.vests || 0),
    vestsVillager: Math.max(hist.maxVestsVillager, endVests.vestsVillager || 0),
    causeCounts, deaths: inst.deaths,
    livingAtEnd: readRoster(Game),
    nAmbient: inst.ambient.length, nSay: inst.saybeats.length,
    instrumentErrors: inst.errors | 0,
    pacing: result.pacing ? {
      meanDeliberatePerDay: result.pacing.meanDeliberatePerDay,
      meanPolicyCallsPerDay: result.pacing.meanPolicyCallsPerDay,
      meanTicksPerDay: result.pacing.meanTicksPerDay,
    } : null,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `wallbase-a-competent-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVID, `wallbase-a-beats-s${seed}.json`),
    JSON.stringify({ seed, policyId: 'competent', ambient: inst.ambient, saybeats: inst.saybeats }));
  console.log(`  [competent seed ${seed}] days=${out.days} end=${out.endReason} wave=${out.maxWave} arc=${out.maxArc} rank=${out.maxRank} fires=${out.maxFires} national=${out.national} table=${out.table} entered=${out.entered} won=${out.wins} standing=${out.endStanding}`);
  return out;
}

(async () => {
  const t0 = process.hrtime.bigint(); // hrtime, not Date.now: the harness freezes the clock
  for (const seed of SEEDS) await oneRun(seed);
  console.log(`wallbase-a sweep done: ${SEEDS.length} seeds x ${DAYS}d in ${(Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1)}s`);
})().catch((e) => { console.error('wallbase-a sweep FAILED: ' + (e && e.stack || e)); process.exit(1); });
