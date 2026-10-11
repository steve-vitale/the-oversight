#!/usr/bin/env node
// sweep-agency-lever.js — long-run villager-agency measurement (2026-10-11).
// Rotation lever 3: villager agency (routines, goals, dialogue variety,
// teach/learn behavior). Wraps sim-harness (shared infra untouched) and the
// competent policy (behavior untouched) plus an askRound hook: once per day
// the player asks every villager with fresh explorer news "what did you see
// out there?" — exercising the real agency teach path (agencyTurn ->
// agencyTeachPlant/agencyTeachMonster, which are otherwise never spent in
// sims because no policy asks).
//
// Per run records:
//   - endReason, days survived, max arc, max wave unlocked, won, tableWaiting,
//     breadth, stage, slots, abilities, tier, max scale, realm size
//   - deaths bucketed by cause (player vs villager shares)
//   - fights per wave, counters, traps by source, succession
//   - AGENCY: range-profile distribution, expeditions launched, teachable
//     plant-lesson entries created/spent, plants taught, monsters taught,
//     'taught' deeds, objective-kind shares over time, deeds by type,
//     villager XP totals, tier distribution, asks made
//
// Usage:
//   SEEDS="1,...,20" DAYS=200 OUT=/tmp/agency-before.json \
//     node scripts/sweep-agency-lever.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

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

function scaleRankOrder(r) {
  const o = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  return (o[String(r || '').toLowerCase()] != null) ? o[String(r || '').toLowerCase()] : 0;
}

// ASK ROUND: the player asks villagers with fresh explorer news about the
// wild, through the real conversation path. Bounded: each ask consumes the
// villager's explorerNews entry (agencyTurn deletes it), so at most one ask
// per expedition return. Exercising spend is the point — teachable entries
// otherwise accumulate unspent forever in sims.
function askRound(Game, ctx) {
  let n = 0;
  try {
    const v = Game.state.village || {};
    const news = v.explorerNews || {};
    const ids = Object.keys(news).filter(id => id !== Game.villagerId);
    for (const vid of ids) {
      try {
        if (!((v.roster || []).includes(vid))) continue;
        const st = Game.startConvo(vid);
        if (!st) continue;
        const choices = Game.convoChoices(vid) || [];
        const ac = choices.find(c => c.id && String(c.id).indexOf('agency:') === 0);
        if (ac) {
          try { Game.convoTurn(vid, ac.id); n++; } catch (e) {}
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 20 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: true });
    await setupGame(Game);

    // instrumentation wraps (sweep tooling only, never game code)
    let plantTaught = 0, monsterTaught = 0, villagerLessons = 0;
    try {
      const _tp = Game.agencyTeachPlant, _tm = Game.agencyTeachMonster, _tv = Game.agencyTeachVillager;
      Game.agencyTeachPlant = function (vid) { const r = _tp.call(this, vid); if (r) plantTaught++; return r; };
      Game.agencyTeachMonster = function (vid) { const r = _tm.call(this, vid); if (r) monsterTaught++; return r; };
      if (_tv) Game.agencyTeachVillager = function (t, l) { const r = _tv.call(this, t, l); if (r && r.taught) villagerLessons++; return r; };
    } catch (e) {}

    const policy = Object.assign({}, competent);
    const playerIds = new Set();
    const scaleHist = [];
    const objKindSamples = {}; // day -> {kind: count}
    let asks = 0;
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      try { if (G.villagerId) playerIds.add(G.villagerId); } catch (e) {}
      try { if (G.scaleRank) scaleHist.push(G.scaleRank()); } catch (e) {}
      try {
        const d = (G.state.scholar || {}).day || 0;
        if (d % 10 === 0) {
          const o = G.objState ? G.objState() : {};
          const c = {};
          for (const id of Object.keys(o)) { const k = o[id].kind || '?'; c[k] = (c[k] || 0) + 1; }
          objKindSamples[d] = c;
        }
      } catch (e) {}
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { asks += askRound(G, ctx); } catch (e) {} // after competent's daily: news is freshest then
    };

    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const telemetry = result.telemetry || [];

    const monsterNames = new Set();
    try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}

    // deaths
    const deathBucketsP = {}, deathBucketsV = {};
    let playerDeaths = 0, villagerDeaths = 0;
    for (const ev of telemetry) {
      if (ev.type !== 'death' || (ev.kind || '') === 'monster') continue;
      const b = bucket(ev.cause, monsterNames);
      if (playerIds.has(ev.who)) { playerDeaths++; deathBucketsP[b] = (deathBucketsP[b] || 0) + 1; }
      else { villagerDeaths++; deathBucketsV[b] = (deathBucketsV[b] || 0) + 1; }
    }

    // fights per wave
    const fightsPerWave = {};
    for (const ev of telemetry) if (ev.type === 'combat_start') { const w = ev.wave || '?'; fightsPerWave[w] = (fightsPerWave[w] || 0) + 1; }

    // agency end-state
    let profiles = {}, expeditions = 0, teachableLeft = 0, xpSum = { t: 0, s: 0, b: 0 }, tiers = {}, taughtDeeds = 0, deedTypes = {}, monsterKillsV = 0;
    let lessonsRecorded = 0, learners = 0, teacherSet = {};
    try {
      const a = Game.agencyState();
      for (const [vid, p] of Object.entries(a.profiles || {})) profiles[p] = (profiles[p] || 0) + 1;
      for (const vid of Object.keys(a.stats || {})) {
        const st = a.stats[vid] || {};
        expeditions += st.expeditions || 0;
        monsterKillsV += st.monsterKills || 0;
      }
      for (const vid of Object.keys(a.teachable || {})) teachableLeft += (a.teachable[vid] || []).length;
      for (const vid of Object.keys(a.xp || {})) {
        const x = a.xp[vid] || {};
        xpSum.t += x.tracking || 0; xpSum.s += x.survival || 0; xpSum.b += x.bravery || 0;
      }
      for (const vid of Object.keys(a.tier || {})) { const t = a.tier[vid] || 0; tiers['t' + t] = (tiers['t' + t] || 0) + 1; }
      for (const d of (a.ach || [])) {
        deedTypes[d.type] = (deedTypes[d.type] || 0) + 1;
        if (d.type === 'taught') taughtDeeds++;
      }
      // villager->villager lesson records (the lever's channel)
      for (const [lid, list] of Object.entries(a.lessons || {})) {
        if (list && list.length) { learners++; lessonsRecorded += list.length; }
        for (const l of (list || [])) if (l && l.from) teacherSet[l.from] = true;
      }
    } catch (e) {}
    let taughtPlants = 0;
    try { for (const p of Object.values((Game.state.codex || {}).plants || {})) if (p && p.source === 'taught') taughtPlants++; } catch (e) {}

    // objective kind shares across the run (mean of samples)
    const objShares = {};
    {
      let n = 0;
      for (const d of Object.keys(objKindSamples)) {
        n++;
        for (const [k, c] of Object.entries(objKindSamples[d])) objShares[k] = (objShares[k] || 0) + c;
      }
      for (const k of Object.keys(objShares)) objShares[k] = +(objShares[k] / (n || 1)).toFixed(1);
    }

    // standard end-state
    let maxScale = 'village';
    for (const r of scaleHist) if (scaleRankOrder(r) > scaleRankOrder(maxScale)) maxScale = r;
    let realmMax = 0, successionNotes = 0, successionSurvived = 0;
    try {
      const links = (Game.hierarchyState ? Game.hierarchyState() : []) || [];
      for (const l of links) {
        const sz = 1 + ((l.subs || []).length || 0);
        if (sz > realmMax) realmMax = sz;
        for (const h of (l.history || [])) if (h.kind === 'succession') {
          successionNotes++;
          if (String(l.status || '').toLowerCase() === 'active') successionSurvived++;
        }
      }
    } catch (e) {}
    let countersDiscovered = 0;
    try { countersDiscovered = Object.keys(Game.state.monsterCounters || {}).length; } catch (e) {}
    const TRAP_IDS = new Set(['deadfall_trap', 'box_trap', 'minnow_trap', 'pit_trap', 'snare', 'snare_wire']);
    let trapsCrafted = 0, trapsLooted = 0;
    for (const ev of telemetry) {
      if (ev.type === 'craft' && TRAP_IDS.has(ev.id)) trapsCrafted++;
      if (ev.type === 'loot_dropped' && TRAP_IDS.has(ev.id)) trapsLooted++;
    }
    let maxArc = 1, won = false, tableWaiting = false, breadth = 0, stage = 0, slots = 0, abilitiesHeld = 0, tier = 0;
    try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
    try { won = !!Game.won; } catch (e) {}
    try { tableWaiting = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
    try { breadth = Game.codexBreadth(); } catch (e) {}
    try { stage = Game.integrationStage(); } catch (e) {}
    try { slots = Game.abilitySlots ? Game.abilitySlots() : 0; abilitiesHeld = ((Game.state.scholar || {}).abilities || []).length; } catch (e) {}
    try { tier = (Game.havenTier ? Game.havenTier() : 0) || 0; } catch (e) {}

    const rec = {
      seed, days: result.days, endReason: result.endReason,
      maxArc, maxWaveUnlocked: result.maxWaveUnlocked, won, tableWaiting,
      breadth, stage, slots, abilitiesHeld, tier, maxScale, realmMax,
      playerDeaths, villagerDeaths, deathBucketsP, deathBucketsV,
      fightsPerWave, countersDiscovered, trapsCrafted, trapsLooted,
      succession: { notes: successionNotes, survived: successionSurvived },
      // agency
      profiles, expeditions, teachableCreated: teachableLeft + plantTaught,
      teachableLeft, plantTaught, monsterTaught, taughtDeeds,
      villagerLessons, lessonsRecorded, learners, teachers: Object.keys(teacherSet).length,
      asks, deedTypes, xpSum, tiers, villagerMonsterKills: monsterKillsV,
      objShares,
    };
    runs.push(rec);
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} w=${result.maxWaveUnlocked} arc=${maxArc} exped=${expeditions} teachable=${teachableLeft + plantTaught} taughtP=${plantTaught} taughtM=${monsterTaught} vlessons=${villagerLessons} deeds=${taughtDeeds} pd=${playerDeaths} vd=${villagerDeaths}`);
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  const addBuckets = (key) => { const o = {}; for (const r of runs) for (const [b, n] of Object.entries(r[key])) o[b] = (o[b] || 0) + n; return o; };
  const total = (obj) => sum(Object.values(obj));
  const share = (obj) => { const t = total(obj) || 1; const o = {}; for (const [k, v] of Object.entries(obj)) o[k] = +(100 * v / t).toFixed(1); return o; };
  const mergeCounts = (key) => { const o = {}; for (const r of runs) for (const [k, n] of Object.entries(r[key] || {})) o[k] = (o[k] || 0) + n; return o; };
  const meanOf = (key) => +(sum(runs.map(r => r[key])) / runs.length).toFixed(1);
  const waveReach = {};
  for (const r of runs) for (const w of Object.keys(r.fightsPerWave)) waveReach[w] = (waveReach[w] || 0) + 1;

  const agg = {
    n: runs.length,
    medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
    endReasons: runs.reduce((o, r) => { o[r.endReason] = (o[r.endReason] || 0) + 1; return o; }, {}),
    won: runs.filter(r => r.won).length, tableWaiting: runs.filter(r => r.tableWaiting).length,
    maxArcDist: runs.reduce((o, r) => { o[r.maxArc] = (o[r.maxArc] || 0) + 1; return o; }, {}),
    maxWaveDist: runs.reduce((o, r) => { o[r.maxWaveUnlocked] = (o[r.maxWaveUnlocked] || 0) + 1; return o; }, {}),
    waveReachRuns: waveReach,
    scaleDist: runs.reduce((o, r) => { o[r.maxScale] = (o[r.maxScale] || 0) + 1; return o; }, {}),
    realmMaxMax: Math.max.apply(null, runs.map(r => r.realmMax)),
    playerDeaths: sum(runs.map(r => r.playerDeaths)), villagerDeaths: sum(runs.map(r => r.villagerDeaths)),
    playerBucketShare: share(addBuckets('deathBucketsP')), villagerBucketShare: share(addBuckets('deathBucketsV')),
    countersDiscovered: sum(runs.map(r => r.countersDiscovered)),
    trapsCrafted: sum(runs.map(r => r.trapsCrafted)), trapsLooted: sum(runs.map(r => r.trapsLooted)),
    succession: { notes: sum(runs.map(r => r.succession.notes)), survived: sum(runs.map(r => r.succession.survived)) },
    meanBreadth: meanOf('breadth'), meanStage: meanOf('stage'), meanTier: meanOf('tier'),
    // agency aggregate
    profiles: mergeCounts('profiles'),
    expeditions: sum(runs.map(r => r.expeditions)),
    teachableCreated: sum(runs.map(r => r.teachableCreated)),
    teachableLeft: sum(runs.map(r => r.teachableLeft)),
    plantTaught: sum(runs.map(r => r.plantTaught)),
    monsterTaught: sum(runs.map(r => r.monsterTaught)),
    taughtDeeds: sum(runs.map(r => r.taughtDeeds)),
    villagerLessons: sum(runs.map(r => r.villagerLessons)),
    lessonsRecorded: sum(runs.map(r => r.lessonsRecorded)),
    learners: sum(runs.map(r => r.learners)),
    teachers: sum(runs.map(r => r.teachers)),
    asks: sum(runs.map(r => r.asks)),
    deedTypes: mergeCounts('deedTypes'),
    xpSum: runs.reduce((o, r) => ({ t: o.t + r.xpSum.t, s: o.s + r.xpSum.s, b: o.b + r.xpSum.b }), { t: 0, s: 0, b: 0 }),
    tiers: mergeCounts('tiers'),
    villagerMonsterKills: sum(runs.map(r => r.villagerMonsterKills)),
    objShares: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.objShares || {})) o[k] = (o[k] || 0) + v; for (const k of Object.keys(o)) o[k] = +(o[k] / runs.length).toFixed(1); return o; })(),
  };
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policy: 'competent+ask' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
