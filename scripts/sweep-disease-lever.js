#!/usr/bin/env node
// sweep-disease-lever.js — long-run disease-pressure measurement (2026-10-11).
// Rotation lever 7: disease pressure — vectors, cure gating, mundane/alien pool
// separation. Wraps sim-harness (shared infra untouched) and records, per run:
//   - survival days, win, arc reach, max wave unlocked
//   - disease incidence per id + pool (tele 'disease'), cure counts ('cured'),
//     diagnoses (state.codex.diseases at end)
//   - disease deaths: bucket + which disease id (from cause strings)
//   - giant-mosquito / alien-tick fight counts (combat_start vs ids)
//   - fight outcomes per wave, villager deaths by cause
//
// Usage:
//   SEEDS="7,42,99,2026,4242,987654" DAYS=200 POLICIES="competent,careless" \
//     OUT=/tmp/disease-baseline.json node scripts/sweep-disease-lever.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DISEASE_IDS = ['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever',
  'trembles', 'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw',
  'flockmind', 'eurika', 'east_nile', 'lemons'];
const MUNDANE = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles']);
const ALIEN = new Set(['howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons']);
const GIANT_IDS = new Set(['giant_mosquito', 'alien_tick']);

// ---- careless policy: raw water, raw food, never touches ticks ----
// A careless player drinks risky water raw, eats from the pack uncooked
// (no cookPack), and ignores attached ticks (no removal of any kind).
function drinkRaw(Game, ctx) {
  try {
    const s = Game.state.scholar;
    try {
      const t = Game.playerTile ? Game.playerTile() : null;
      if (t && /creek|well|spring|river|pond/i.test(t.type || '') && (s.water || []).length < 3) {
        try { Game.fillWater(); } catch (e) {}
      }
    } catch (e) {}
    if ((s.hydration || 0) >= 70) return;
    // drink the rawest thing available: direct from tile first, then raw bottle
    let drank = false;
    try {
      const t = Game.playerTile ? Game.playerTile() : null;
      if (t && /creek|well|spring|river|pond/i.test(t.type || '')) {
        try { Game.drinkFromTile(); drank = true; } catch (e) {}
      }
    } catch (e) {}
    if (!drank && (s.water || []).length) {
      try { Game.doAction('drink'); ctx.drankRaw = (ctx.drankRaw || 0) + 1; } catch (e) {}
    }
  } catch (e) {}
}

function carelessEat(Game) {
  const s = Game.state.scholar, vv = Game.state.village;
  try {
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    // eat from pack as-is (raw included, uncooked meat included)
    try { Game.eat(); } catch (e) {}
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    let guard = 0;
    while (s.kcal < Game.kcalCap() * 0.95 && guard++ < 20) {
      const pantry = vv.pantry || [];
      let best = -1, bestKcal = -1;
      for (let i = 0; i < pantry.length; i++) {
        const it = pantry[i];
        if (!it || (it.kcalEach || 0) <= 0) continue;
        if ((it.kcalEach || 0) > bestKcal) { bestKcal = it.kcalEach; best = i; }
      }
      if (best < 0) break;
      try { Game.takeFromPantry(best); } catch (e) { break; }
      try { Game.eat(); } catch (e) { break; }
    }
  } catch (e) {}
}

const careless = Object.assign({}, competent, {
  id: 'careless',
  desc: 'drinks risky water raw, eats uncooked food, never removes ticks',
  upkeep(Game, ctx) {
    // no cookPack, no safe water, no tick removal — the careless life
    carelessEat(Game);
    drinkRaw(Game, ctx);
  },
});

const POLICIES = { competent, careless };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

const DISEASE_RE = /gutrot|trichinosis|lockjaw|wound_?fever|trembles|lemons|eurika|east_?nile|howlbelly|gristlefit|croakbelly|shellgut|witness_?maw|flockmind|disease|sick|plague|pox/;

function bucket(c, monsterNames) {
  c = String(c || '').toLowerCase().trim();
  if (!c || c === '?' || c === 'the wild') return 'unattributed';
  if (/the night|starvat|the expedition/.test(c)) return 'starvation';
  if (/contest/.test(c)) return 'contest';
  if (/phoenix/.test(c)) return 'phoenix';
  if (/thirst|dehydrat/.test(c)) return 'thirst';
  if (/raid-defense/.test(c)) return 'raid-defense';
  if (/^raid/.test(c)) return 'raid';
  if (/alien/.test(c)) return 'alien-attack';
  if (/ambush|murder|betrayal|assassin/.test(c)) return 'murder';
  if (DISEASE_RE.test(c)) return 'disease';
  if (/wound|injur|bled|mauled/.test(c)) return 'wound';
  if (/^monster$|combat|split-fight/.test(c)) return 'combat';
  for (const n of monsterNames) { if (n && c.includes(n)) return 'combat'; }
  return 'other';
}

// pull a disease id out of a death cause string for the disease bucket
function diseaseIdOf(c) {
  c = String(c || '').toLowerCase();
  for (const id of DISEASE_IDS) {
    if (c.includes(id) || c.includes(id.replace(/_/g, ' '))) return id;
  }
  return '?';
}

function arcSnapshot(Game) {
  const out = { arc: 1, table: false, won: false, day: 0 };
  try {
    const pg = Game.progState();
    out.arc = pg.arc || 1;
    out.table = !!pg.tableWaiting;
  } catch (e) {}
  try { out.day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try { out.won = !!Game.won; } catch (e) {}
  return out;
}

(async () => {
  const seeds = parseList('SEEDS', '7,42,99,2026,4242,987654').map(Number);
  const policyIds = parseList('POLICIES', 'competent,careless');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      const t0 = Date.now();
      const { Game, manifest, loadFails } = await loadGame({ seed, mode: pid, fullTelemetry: true });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const playerIds = new Set();
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { if (G.villagerId) playerIds.add(G.villagerId); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const telemetry = result.telemetry || [];

      const monsterNames = new Set();
      try {
        for (const m of (Game.data.monsters || [])) {
          monsterNames.add(String(m.name || '').toLowerCase());
          monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' '));
        }
      } catch (e) {}

      // ---- disease events ----
      const cases = {}, cures = {};
      const casesPool = { mundane: 0, alien: 0 };
      for (const ev of telemetry) {
        if (ev.type === 'disease') {
          const id = ev.id || '?';
          cases[id] = (cases[id] || 0) + 1;
          const pool = ev.pool || (MUNDANE.has(id) ? 'mundane' : ALIEN.has(id) ? 'alien' : '?');
          casesPool[pool] = (casesPool[pool] || 0) + 1;
        } else if (ev.type === 'cured') {
          const id = ev.id || '?';
          cures[id] = (cures[id] || 0) + 1;
        }
      }
      // ---- diagnoses at end ----
      let diagnosed = [];
      try { diagnosed = Object.keys((Game.state.codex || {}).diseases || {}); } catch (e) {}
      // ---- deaths ----
      const deathBucketsP = {}, deathBucketsV = {};
      const diseaseDeaths = {}; // id -> count (player + villager)
      const deaths = [];
      for (const ev of telemetry) {
        if (ev.type !== 'death') continue;
        if ((ev.kind || '') === 'monster') continue;
        const b = bucket(ev.cause, monsterNames);
        const rec = { day: ev.day, who: ev.who, cause: ev.cause, bucket: b, kind: ev.kind };
        deaths.push(rec);
        const isPlayer = playerIds.has(ev.who);
        if (isPlayer) deathBucketsP[b] = (deathBucketsP[b] || 0) + 1;
        else deathBucketsV[b] = (deathBucketsV[b] || 0) + 1;
        if (b === 'disease') {
          const did = diseaseIdOf(ev.cause);
          diseaseDeaths[did] = (diseaseDeaths[did] || 0) + 1;
        }
      }
      // ---- giant monster-fight encounters ----
      let giantFights = 0, giantWon = 0, giantLost = 0;
      const giantPerId = {};
      const waveFights = {};
      let pendGiant = null;
      for (const ev of telemetry) {
        if (ev.type === 'combat_start') {
          const w = ev.wave || '?';
          waveFights[w] = (waveFights[w] || 0) + 1;
          pendGiant = GIANT_IDS.has(ev.vs) ? ev.vs : null;
          if (pendGiant) { giantFights++; giantPerId[ev.vs] = (giantPerId[ev.vs] || 0) + 1; }
        } else if (ev.type === 'combat_end' && pendGiant) {
          if (ev.win) giantWon++; else giantLost++;
          pendGiant = null;
        }
      }
      const end = arcSnapshot(Game);
      // wave unlock: max wave from combat_start + state
      let maxWaveUnlocked = 1;
      try {
        const wu = Game.unlockedWave ? Game.unlockedWave() : null;
        if (wu) maxWaveUnlocked = wu;
      } catch (e) {}
      runs.push({
        policy: pid, seed, ms: Date.now() - t0,
        daysSurvived: end.day, over: !!Game.over, won: end.won,
        arc: end.arc, tableWaiting: end.table, maxWaveUnlocked,
        waveFights, cases, casesPool, cures, diagnosed, diagnosedCount: diagnosed.length,
        deathBucketsP, deathBucketsV, diseaseDeaths,
        nDeathsP: Object.values(deathBucketsP).reduce((a, b) => a + b, 0),
        nDeathsV: Object.values(deathBucketsV).reduce((a, b) => a + b, 0),
        giantFights, giantWon, giantLost, giantPerId,
        loadFails: (loadFails || []).length,
      });
      console.log(`done ${pid} seed ${seed}: day ${end.day} cases=${Object.values(cases).reduce((a,b)=>a+b,0)} pool=${JSON.stringify(casesPool)} deathsP=${JSON.stringify(deathBucketsP)} giant=${giantFights} (${((Date.now()-t0)/1000)|0}s)`);
    }
  }

  // ---- summary ----
  function sum(runs, f) { return runs.map(f).reduce((a, b) => a + b, 0); }
  const summary = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const ag = { n: rs.length };
    ag.survived = rs.map(r => r.daysSurvived);
    ag.medianSurv = ag.survived.slice().sort((a, b) => a - b)[Math.floor(ag.survived.length / 2)];
    ag.maxSurv = Math.max(...ag.survived);
    ag.won = sum(rs, r => r.won ? 1 : 0);
    ag.arcMax = Math.max(...rs.map(r => r.arc));
    ag.arcReach = {};
    for (let a = 1; a <= 4; a++) ag.arcReach['arc' + a] = sum(rs, r => r.arc >= a ? 1 : 0);
    ag.waveMax = Math.max(...rs.map(r => r.maxWaveUnlocked));
    ag.waveReach = {};
    for (let w = 1; w <= 5; w++) ag.waveReach['wave' + w] = sum(rs, r => r.maxWaveUnlocked >= w ? 1 : 0);
    ag.waveFights = sum(rs, r => sum(Object.values(r.waveFights || {}), x => x));
    ag.waveFightShare = {};
    for (const r of rs) for (const [w, c] of Object.entries(r.waveFights || {})) ag.waveFightShare[w] = (ag.waveFightShare[w] || 0) + c;
    ag.cases = {}; ag.casesPool = { mundane: 0, alien: 0 };
    for (const r of rs) {
      for (const [id, c] of Object.entries(r.cases)) ag.cases[id] = (ag.cases[id] || 0) + c;
      ag.casesPool.mundane += r.casesPool.mundane; ag.casesPool.alien += r.casesPool.alien;
    }
    ag.totalCases = sum(rs, r => sum(Object.values(r.cases), x => x));
    ag.cures = {}; for (const r of rs) for (const [id, c] of Object.entries(r.cures)) ag.cures[id] = (ag.cures[id] || 0) + c;
    ag.diagnosedPerRun = rs.map(r => r.diagnosedCount);
    ag.deathBucketsP = {}; ag.deathBucketsV = {}; ag.diseaseDeaths = {};
    for (const r of rs) {
      for (const [b, c] of Object.entries(r.deathBucketsP)) ag.deathBucketsP[b] = (ag.deathBucketsP[b] || 0) + c;
      for (const [b, c] of Object.entries(r.deathBucketsV)) ag.deathBucketsV[b] = (ag.deathBucketsV[b] || 0) + c;
      for (const [id, c] of Object.entries(r.diseaseDeaths)) ag.diseaseDeaths[id] = (ag.diseaseDeaths[id] || 0) + c;
    }
    ag.playerDeaths = sum(rs, r => r.nDeathsP); ag.villagerDeaths = sum(rs, r => r.nDeathsV);
    ag.giantFights = sum(rs, r => r.giantFights);
    ag.giantWon = sum(rs, r => r.giantWon); ag.giantLost = sum(rs, r => r.giantLost);
    ag.giantPerId = {};
    for (const r of rs) for (const [id, c] of Object.entries(r.giantPerId)) ag.giantPerId[id] = (ag.giantPerId[id] || 0) + c;
    summary[pid] = ag;
  }
  const out = { manifest: manifest(0, 'disease-sweep'), days, seeds, summary, runs };
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); console.log('wrote', outFile); }
  console.log(JSON.stringify(summary, null, 1));
})();
