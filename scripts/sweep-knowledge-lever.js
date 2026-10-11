#!/usr/bin/env node
// sweep-knowledge-lever.js — long-run KNOWLEDGE & TEACHING measurement (2026-10-11).
// Rotation lever 4: knowledge & teaching (codex breadth, teaching moments,
// identification). Wraps sim-harness + competent policy + the askRound hook
// (exercises the villager->player teachable spend path through the real convo
// path). Identical seeds make before/after lever comparisons honest.
//
// Per run records:
//   KNOWLEDGE BASELINE:
//   - identify events by source (fireside, taught, fieldwork, traded, tested,
//     observed, discovery, book, shared, background, word of mouth...)
//   - villagerLearnsPlant events by source, split player vs other-villager
//     (measures villager<->villager transfer, not just player learning)
//   - teachPlant (player->villager), agencyTeachPlant/agencyTeachMonster
//     (villager->player via ask path)
//   - learnSkill events by via (background/stranger/insight/book/practice...)
//   - grantKnowledge by domain:type
//   - testCautiously / testMonsterMeat CALLS (Steve's experiment path), plus
//     markMonsterFoodSafe by how ('tested', 'word-of-mouth', ...)
//   - end-state codex: plants by level 0..4, prepKnown, experiments, tested
//     verdicts, wrongAs unresolved; animals by level; monsters (entries,
//     named, foodSafe, foodTested-poison); skills (count, by via, max level);
//     trees count
//   - village-wide: mean plants known per villager, distinct village-known
//     plants, villagers with zero knowledge
//   - depth: plant level histogram at end (is L2/L3/L4 reached in 200 days?)
//   MISSION (same as agency sweep for comparability):
//   - endReason, days, maxArc, maxWaveUnlocked, won, tableWaiting, breadth,
//     stage, slots, abilities, tier, maxScale, realmMax, deaths by cause,
//     fights per wave, counters, traps by source, succession
//   SENSE: last ~120 teaching-related transcript lines per run.
//
// Usage:
//   SEEDS="1,...,20" DAYS=200 OUT=/tmp/knowledge-before.json \
//     node scripts/sweep-knowledge-lever.js
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

const TEACH_RE = /IDENTIFIED|Deeper knowledge|MASTERY|TRADED KNOWLEDGE|KNOWLEDGE COMBINES|LEARNED:|showed .* remember it|Word gets around|was watching|You watch closely|Turning .* over in good light|it clicks|cautious|taste.*wait|numb.*stomach|educationally sick|edible now|edible.*fills|knowledge.*spread|fireside|gossip|rumor|teach|learn|lesson|named|names|called|Codex notes/i;

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 20 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: true });
    await setupGame(Game);

    // ---- knowledge instrumentation (sweep tooling only, never game code) ----
    const K = {
      identifyBy: {},          // source -> count (player codex identifications)
      vlearnBy: {},             // source:who(player|villager) -> count
      teachPlant: 0,            // player -> villager via teachPlant (true)
      agencyTeachPlant: 0,
      agencyTeachMonster: 0,
      learnSkillBy: {},         // via -> count
      grantBy: {},              // domain:type -> count
      testCautiously: 0,        // calls (plant experiment path)
      testMonsterMeat: 0,       // calls (monster experiment path)
      foodSafeBy: {},           // how -> count (markMonsterFoodSafe)
      transcript: [],           // teaching-related say() lines
    };
    const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
    const me = () => Game.villagerId;
    try {
      const _id = Game.identifyPlant;
      Game.identifyPlant = function (pid, source, tn) {
        const r = _id.call(this, pid, source, tn);
        if (r) bump(K.identifyBy, String(source || '?'));
        return r;
      };
    } catch (e) {}
    try {
      const _vl = Game.villagerLearnsPlant;
      Game.villagerLearnsPlant = function (vid, pid, source) {
        const r = _vl.call(this, vid, pid, source);
        if (r) bump(K.vlearnBy, String(source || '?') + ':' + (vid === me() ? 'player' : 'villager'));
        return r;
      };
    } catch (e) {}
    try {
      const _tp = Game.teachPlant;
      Game.teachPlant = function (vid, pid) { const r = _tp.call(this, vid, pid); if (r) K.teachPlant++; return r; };
    } catch (e) {}
    try {
      const _atp = Game.agencyTeachPlant, _atm = Game.agencyTeachMonster;
      Game.agencyTeachPlant = function (vid) { const r = _atp.call(this, vid); if (r) K.agencyTeachPlant++; return r; };
      Game.agencyTeachMonster = function (vid) { const r = _atm.call(this, vid); if (r) K.agencyTeachMonster++; return r; };
    } catch (e) {}
    try {
      const _ls = Game.learnSkill;
      Game.learnSkill = function (sid, lvl, via) { const r = _ls.call(this, sid, lvl, via); if (r) bump(K.learnSkillBy, String(via || '?')); return r; };
    } catch (e) {}
    try {
      const _gk = Game.grantKnowledge;
      Game.grantKnowledge = function (d, id, lvl, src) {
        const r = _gk.call(this, d, id, lvl, src);
        if (r) bump(K.grantBy, String(d || '?') + ':' + String((src || {}).type || '?'));
        return r;
      };
    } catch (e) {}
    try {
      const _tc = Game.testCautiously;
      Game.testCautiously = function () { K.testCautiously++; return _tc.apply(this, arguments); };
      const _tm = Game.testMonsterMeat;
      Game.testMonsterMeat = function () { K.testMonsterMeat++; return _tm.apply(this, arguments); };
      const _fs = Game.markMonsterFoodSafe;
      Game.markMonsterFoodSafe = function (mid, how) { bump(K.foodSafeBy, String(how || '?')); return _fs.call(this, mid, how); };
    } catch (e) {}
    try {
      const _say = Game.say;
      Game.say = function (msg) {
        try {
          const m = String(msg || '');
          if (TEACH_RE.test(m)) { K.transcript.push(m); if (K.transcript.length > 120) K.transcript.shift(); }
        } catch (e) {}
        return _say.call(this, msg);
      };
    } catch (e) {}

    const policy = Object.assign({}, competent);
    const playerIds = new Set();
    const scaleHist = [];
    const knowSnap = {}; // day -> {playerLevels, vilMean, vilDistinct, mNamed, skills}
    let asks = 0;
    const origDaily = competent.daily;
    const snapKnowledge = (G) => {
      try {
        const cxp = (G.state.codex || {}).plants || {};
        const lv = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        for (const e of Object.values(cxp)) { const l = (e && e.level) || 0; lv[Math.min(4, l)] = (lv[Math.min(4, l)] || 0) + 1; }
        const v = G.state.village || {};
        const per = [], union = new Set();
        for (const rid of (v.roster || [])) {
          let known = [];
          try { known = G.plantsKnownBy(rid) || []; } catch (e) {}
          per.push(known.length);
          for (const p of known) union.add(p);
        }
        let mNamed = 0;
        for (const e of Object.values((G.state.codex || {}).monsters || {})) if (e && e.villageName) mNamed++;
        const d = (G.state.scholar || {}).day || 0;
        knowSnap[d] = {
          playerLevels: lv,
          vilMean: per.length ? +(per.reduce((a, b) => a + b, 0) / per.length).toFixed(1) : 0,
          vilDistinct: union.size, roster: per.length,
          mNamed, skills: Object.keys((G.state.codex || {}).skills || {}).length,
        };
      } catch (e) {}
    };
    policy.daily = (G, ctx) => {
      try { if (G.villagerId) playerIds.add(G.villagerId); } catch (e) {}
      try { if (G.scaleRank) scaleHist.push(G.scaleRank()); } catch (e) {}
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { asks += askRound(G, ctx); } catch (e) {}
      try { const d = (G.state.scholar || {}).day || 0; if (d > 0 && d % 50 === 0) snapKnowledge(G); } catch (e) {}
    };

    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const telemetry = result.telemetry || [];

    const monsterNames = new Set();
    try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}

    const deathBucketsP = {}, deathBucketsV = {};
    let playerDeaths = 0, villagerDeaths = 0;
    for (const ev of telemetry) {
      if (ev.type !== 'death' || (ev.kind || '') === 'monster') continue;
      const b = bucket(ev.cause, monsterNames);
      if (playerIds.has(ev.who)) { playerDeaths++; deathBucketsP[b] = (deathBucketsP[b] || 0) + 1; }
      else { villagerDeaths++; deathBucketsV[b] = (deathBucketsV[b] || 0) + 1; }
    }
    const fightsPerWave = {};
    const monstersFought = {};
    for (const ev of telemetry) {
      if (ev.type === 'combat_start') {
        const w = ev.wave || '?'; fightsPerWave[w] = (fightsPerWave[w] || 0) + 1;
        if (ev.monster) monstersFought[String(ev.monster)] = (monstersFought[String(ev.monster)] || 0) + 1;
      }
    }

    // ---- end-state knowledge ----
    const ks = {
      plantLevels: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      prepKnown: 0, experiments: 0, testedVerdicts: 0, wrongAsOpen: 0,
      plantBy: {},
      animalLevels: {}, monsterEntries: 0, monsterNamed: 0, monsterFoodSafe: 0,
      monsterPoisonKnown: 0, skills: 0, skillByVia: {}, skillMaxLevel: 0,
      trees: 0, recipes: 0,
      vilMeanKnown: 0, vilMaxKnown: 0, vilZeroKnown: 0, villageDistinct: 0,
    };
    try {
      const cxp = (Game.state.codex || {}).plants || {};
      for (const [pid, e] of Object.entries(cxp)) {
        const lvl = (e && e.level) || 0;
        if (lvl >= 4) ks.plantLevels[4]++; else ks.plantLevels[lvl] = (ks.plantLevels[lvl] || 0) + 1;
        if (e && (e.prepKnown || lvl >= 2)) ks.prepKnown++;
        ks.experiments += (e && e.experiments) || 0;
        if (e && e.tested) ks.testedVerdicts++;
        if (e && e.wrongAs) ks.wrongAsOpen++;
        const by = (e && e.by) || '?'; ks.plantBy[by] = (ks.plantBy[by] || 0) + 1;
      }
      const cxa = (Game.state.codex || {}).animals || {};
      for (const e of Object.values(cxa)) { const l = (e && e.level) || 0; ks.animalLevels[l] = (ks.animalLevels[l] || 0) + 1; }
      const cxm = (Game.state.codex || {}).monsters || {};
      ks.monsterEntries = Object.keys(cxm).length;
      for (const e of Object.values(cxm)) {
        if (e && e.villageName) ks.monsterNamed++;
        if (e && e.foodSafe === true) ks.monsterFoodSafe++;
        if (e && e.foodTested === 'poison') ks.monsterPoisonKnown++;
      }
      const cxs = (Game.state.codex || {}).skills || {};
      ks.skills = Object.keys(cxs).length;
      for (const e of Object.values(cxs)) {
        const via = (e && e.via) || '?'; ks.skillByVia[via] = (ks.skillByVia[via] || 0) + 1;
        ks.skillMaxLevel = Math.max(ks.skillMaxLevel, (e && e.level) || 0);
      }
      ks.trees = Object.keys((Game.state.codex || {}).trees || {}).length;
      ks.recipes = Object.keys((Game.state.codex || {}).recipes || {}).length;
      // village-wide
      const v = Game.state.village || {};
      const roster = (v.roster || []);
      const per = [], union = new Set();
      for (const rid of roster) {
        let known = [];
        try { known = Game.plantsKnownBy(rid) || []; } catch (e) {}
        per.push(known.length);
        for (const p of known) union.add(p);
      }
      ks.vilMeanKnown = per.length ? +(per.reduce((a, b) => a + b, 0) / per.length).toFixed(1) : 0;
      ks.vilMaxKnown = per.length ? Math.max.apply(null, per) : 0;
      ks.vilZeroKnown = per.filter(n => n === 0).length;
      ks.villageDistinct = union.size;
      ks.rosterSize = roster.length;
    } catch (e) {}

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
      fightsPerWave, monstersFought, countersDiscovered, trapsCrafted, trapsLooted,
      succession: { notes: successionNotes, survived: successionSurvived },
      asks,
      // knowledge
      identifyBy: K.identifyBy, vlearnBy: K.vlearnBy,
      teachPlant: K.teachPlant, agencyTeachPlant: K.agencyTeachPlant,
      agencyTeachMonster: K.agencyTeachMonster,
      learnSkillBy: K.learnSkillBy, grantBy: K.grantBy,
      testCautiously: K.testCautiously, testMonsterMeat: K.testMonsterMeat,
      foodSafeBy: K.foodSafeBy,
      ks,
      knowSnap,
      transcriptSample: K.transcript.slice(-24),
    };
    runs.push(rec);
    const pl = ks.plantLevels;
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} w=${result.maxWaveUnlocked} arc=${maxArc} ` +
      `idBy=${JSON.stringify(K.identifyBy)} vlearn=${JSON.stringify(K.vlearnBy)} ` +
      `plantLvl=${JSON.stringify(pl)} prepKnown=${ks.prepKnown} exp=${ks.experiments} tested=${ks.testedVerdicts} ` +
      `mNamed=${ks.monsterNamed}/${ks.monsterEntries} mSafe=${ks.monsterFoodSafe} skills=${ks.skills} ` +
      `teachP=${K.teachPlant} agP=${K.agencyTeachPlant} agM=${K.agencyTeachMonster} testC=${K.testCautiously} testM=${K.testMonsterMeat} ` +
      `vilMean=${ks.vilMeanKnown} vilDistinct=${ks.villageDistinct} pd=${playerDeaths} vd=${villagerDeaths}`);
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  const addBuckets = (key) => { const o = {}; for (const r of runs) for (const [b, n] of Object.entries(r[key])) o[b] = (o[b] || 0) + n; return o; };
  const total = (obj) => sum(Object.values(obj));
  const share = (obj) => { const t = total(obj) || 1; const o = {}; for (const [k, v] of Object.entries(obj)) o[k] = +(100 * v / t).toFixed(1); return o; };
  const mergeCounts = (key) => { const o = {}; for (const r of runs) for (const [k, n] of Object.entries(r[key] || {})) o[k] = (o[k] || 0) + n; return o; };
  const meanOf = (key) => +(sum(runs.map(r => r[key])) / runs.length).toFixed(1);
  const meanPath = (path) => {
    const get = (r) => path.split('.').reduce((o, k) => (o || {})[k], r);
    return +(sum(runs.map(r => +get(r) || 0)) / runs.length).toFixed(1);
  };
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
    // knowledge aggregate
    identifyBy: mergeCounts('identifyBy'),
    vlearnBy: mergeCounts('vlearnBy'),
    teachPlant: sum(runs.map(r => r.teachPlant)),
    agencyTeachPlant: sum(runs.map(r => r.agencyTeachPlant)),
    agencyTeachMonster: sum(runs.map(r => r.agencyTeachMonster)),
    asks: sum(runs.map(r => r.asks)),
    learnSkillBy: mergeCounts('learnSkillBy'),
    grantBy: mergeCounts('grantBy'),
    testCautiously: sum(runs.map(r => r.testCautiously)),
    testMonsterMeat: sum(runs.map(r => r.testMonsterMeat)),
    foodSafeBy: mergeCounts('foodSafeBy'),
    plantLevels: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.ks.plantLevels)) o[k] = (o[k] || 0) + v; return o; })(),
    meanPrepKnown: meanPath('ks.prepKnown'),
    totalExperiments: sum(runs.map(r => r.ks.experiments)),
    totalTestedVerdicts: sum(runs.map(r => r.ks.testedVerdicts)),
    totalWrongAsOpen: sum(runs.map(r => r.ks.wrongAsOpen)),
    plantBy: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.ks.plantBy)) o[k] = (o[k] || 0) + v; return o; })(),
    animalLevels: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.ks.animalLevels)) o[k] = (o[k] || 0) + v; return o; })(),
    monsterEntries: sum(runs.map(r => r.ks.monsterEntries)),
    monsterNamed: sum(runs.map(r => r.ks.monsterNamed)),
    monsterFoodSafe: sum(runs.map(r => r.ks.monsterFoodSafe)),
    monsterPoisonKnown: sum(runs.map(r => r.ks.monsterPoisonKnown)),
    skills: sum(runs.map(r => r.ks.skills)),
    skillByVia: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.ks.skillByVia)) o[k] = (o[k] || 0) + v; return o; })(),
    trees: sum(runs.map(r => r.ks.trees)),
    recipes: sum(runs.map(r => r.ks.recipes)),
    meanVilMeanKnown: meanPath('ks.vilMeanKnown'),
    meanVilMaxKnown: meanPath('ks.vilMaxKnown'),
    totalVilZeroKnown: sum(runs.map(r => r.ks.vilZeroKnown)),
    meanVillageDistinct: meanPath('ks.villageDistinct'),
    meanRoster: meanPath('ks.rosterSize'),
  };
  console.log('\n=== KNOWLEDGE AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policy: 'competent+ask' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
