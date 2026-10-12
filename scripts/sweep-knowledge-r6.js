#!/usr/bin/env node
// sweep-knowledge-r6.js — long-run KNOWLEDGE & TEACHING measurement, r6
// (2026-10-12): the animal-codex funnel. Copied from sweep-knowledge-lever.js
// (r5's sweep, still live there) with two additions: the hunt hook
// (HUNT_HOOK=1 — competent-player hunting bootstrap: reads found books,
// scavenges wild ruins for the field shelf) and the animal-funnel
// instrumentation (kill-teaches-L1, the 3/6/10 tasting ladder, villager-side
// animal learning, bear-rework gate firings, near-miss counters).
//
// HUNT_HOOK=0 reproduces the r1-r5 zero-meat baseline exactly (input-problem
// verification). HUNT_HOOK=1 gets meat flowing; the before/after lever
// comparison then runs at HUNT_HOOK=1 on identical seeds.
//
// Usage:
//   SEEDS="1,...,20" DAYS=200 OUT=/tmp/knowledge-r6-before.json \
//     TRADE_HOOK=1 TRADE_POOL_GROWTH=1 HUNT_HOOK=1 node scripts/sweep-knowledge-r6.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
// r4: competent-player trade behavior (models a player who engages trader
// offers). Game code untouched; enabled with TRADE_HOOK=1.
const { tradeRound } = require('./trade-hook');
// r6: competent-player hunting bootstrap (reads found books, scavenges wild
// ruins for the field shelf). Game code untouched; HUNT_HOOK=1 enables.
const { huntRound, positionSweep } = require('./hunt-hook');

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
      // r4: trader-channel instrumentation (near-miss style: count the
      // meetings/offers/declines, not just completed trades)
      traderMentions: 0,        // "I trade in what I know" seeded lines heard
      tradeOutcomes: {},        // tradeKnowledge return token -> count
      tradeTurns: 0,            // convoTurns taken by the trade hook
      // r5: trader pool growth (TRADE_POOL_GROWTH=1) instrumentation
      deepTrades: 0,            // tradeKnowledge 'ok' on a grown (deep-pool) plant
      deepGains: 0,             // deep plants gained by traders this run
      deepVia: {},              // 'fireside+taught' style channel pairs -> count
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
      const _ck = Game.combineKnowledge;
      Game.combineKnowledge = function (pid) {
        const r = _ck.call(this, pid);
        if (r) { K.combines++; }
        else {
          // r3: near-miss instrumentation — village-shared source only, so the
          // lever design sees how many fireside overlaps ALMOST fired.
          try {
            const mine = (this.state.codex.plants || {})[pid];
            if (mine && (mine.level || 1) < 4) {
              const sh = ((this.state.village || {}).sharedKnowledge || {})[pid];
              const shL = (sh && sh.level) || 0;
              if (shL > (mine.level || 1)) {
                const hv = mine.harvests || 0;
                K.nearMiss++;
                K.nearMissHist[(mine.level || 1) + '->' + shL + '/h' + Math.min(4, hv)] =
                  (K.nearMissHist[(mine.level || 1) + '->' + shL + '/h' + Math.min(4, hv)] || 0) + 1;
              }
            }
          } catch (e2) {}
        }
        return r;
      };
    } catch (e) {}
    K.combines = K.combines || 0;
    K.nearMiss = K.nearMiss || 0;
    K.nearMissHist = K.nearMissHist || {};
    // r6: ANIMAL FUNNEL (the 3/6/10 tasting ladder, kill-teaches-L1,
    // villager-side animal learning, bear-rework gate firings). Near-miss
    // discipline: count the calls that ALMOST fire, not just firings.
    const AF = K.af = {
      identifyAnimal: 0, identIds: {},
      noteDepthByVia: {},   // 'kill:1' / 'tasted:2' / 'taught:3' -> count
      depthBeatsTasted: { 2: 0, 3: 0, 4: 0 },
      masterTech: 0,        // mastery techniques granted (bear fat rendering)
      tastingsNew: 0,       // animalPrep tastings accumulated this run
      tastingsByAid: {},
      booksRead: 0, huntBooksRead: 0, huntRuinScavenges: 0, huntTurns: 0,
      snareL1Day: null,
      vilHuntKills: 0, vilHuntSpecies: {},  // villager hunt returns w/ species
      nearMiss: { unknownSpeciesTastings: 0, phantomTastings: 0, tastingsLostToUnknown: 0, unknownIds: {} },
    };
    const _prevTast = {};
    try {
      const _ia = Game.encIdentifyAnimal;
      Game.encIdentifyAnimal = function (id) { AF.identifyAnimal++; bump(AF.identIds, String(id)); return _ia.call(this, id); };
      const _nd = Game._noteAnimalDepth;
      Game._noteAnimalDepth = function (aid, level, src) {
        const r = _nd.call(this, aid, level, src);
        if (r) {
          const t = (src && src.type) || '?';
          bump(AF.noteDepthByVia, t + ':' + level);
          if (t === 'tasted' && AF.depthBeatsTasted[level] != null) AF.depthBeatsTasted[level]++;
        }
        return r;
      };
      const _gk2 = Game.grantKnowledge;
      Game.grantKnowledge = function (d, id, lvl, src) {
        const r = _gk2.call(this, d, id, lvl, src);
        if (r && d === 'technique' && src && src.type === 'mastery') AF.masterTech++;
        if (r && d === 'recipe' && id === 'snare' && AF.snareL1Day == null) AF.snareL1Day = (Game.state.scholar || {}).day || 0;
        return r;
      };
      const _vhr = Game.villagerHuntResolve;
      if (_vhr) Game.villagerHuntResolve = function (vid, eff) {
        const r = _vhr.call(this, vid, eff);
        try {
          if (r && r.kcal > 0 && r.aid) { AF.vilHuntKills++; bump(AF.vilHuntSpecies, String(r.aid)); }
        } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _tk = Game.tradeKnowledge;
      Game.tradeKnowledge = function (vid, pid) {
        const r = _tk.call(this, vid, pid);
        bump(K.tradeOutcomes, String(r || '?'));
        // r5: was this a grown-pool plant? (deep store, not the static core)
        try {
          const rec = (((this.state.village || {}).traderDeep || {})[vid] || {})[pid];
          if (r === 'ok' && rec && rec.deep) K.deepTrades++;
        } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _say = Game.say;
      const MENTION_RE = /I trade in what I know/i;
      Game.say = function (msg) {
        try {
          const m = String(msg || '');
          if (TEACH_RE.test(m)) { K.transcript.push(m); if (K.transcript.length > 120) K.transcript.shift(); }
        } catch (e) {}
        return _say.call(this, msg);
      };
      // the trader's seeding line goes through sayLine, not say — wrap both
      try {
        const _sayLine = Game.sayLine;
        Game.sayLine = function (vid, msg) {
          try { if (MENTION_RE.test(String(msg || ''))) K.traderMentions++; } catch (e) {}
          return _sayLine.call(this, vid, msg);
        };
      } catch (e2) {}
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
        // r5: trader pool sizes over time (static core vs grown deep pool)
        let traderPools = [];
        try {
          const vG = G.state.village || {};
          for (const rid of (vG.roster || [])) {
            if (rid === G.villagerId) continue;
            let isT = false;
            try { isT = G.isKnowledgeTrader(rid); } catch (e) {}
            if (!isT) continue;
            const full = (G.traderKnowledge(rid, true) || []).length;
            const deep = Object.keys(((vG.traderDeep || {})[rid] || {}))
              .filter(k => k.charAt(0) !== '_' && ((((vG.traderDeep || {})[rid] || {})[k]) || {}).deep).length;
            traderPools.push({ vid: rid, full, deep, tradeable: (G.traderKnowledge(rid) || []).length });
          }
        } catch (e) {}
        knowSnap[d] = {
          playerLevels: lv,
          vilMean: per.length ? +(per.reduce((a, b) => a + b, 0) / per.length).toFixed(1) : 0,
          vilDistinct: union.size, roster: per.length,
          mNamed, skills: Object.keys((G.state.codex || {}).skills || {}).length,
          traderPools,
        };
      } catch (e) {}
    };
    // r6: position the forage sweep at the forage call itself (hunt hook).
    // The policy travels inside its own trip functions, so positioning in
    // policy.daily runs too early. Wrapping doAction puts the step exactly
    // where the game's own tap-to-forage would center it. Off by default
    // (HUNT_HOOK=1 enables) — the bare sweep is the r1-r5 behavior.
    try {
      if (process.env.HUNT_HOOK === '1') {
        const _da = Game.doAction;
        Game.doAction = function (kind, opts) {
          try {
            if (kind === 'forage' && !(opts && (opts.cx !== undefined || opts.cy !== undefined))) {
              positionSweep(this);
            }
          } catch (e) {}
          return _da.call(this, kind, opts);
        };
      }
    } catch (e) {}
    policy.daily = (G, ctx) => {
      // r6: the hunting bootstrap FIRST (reads books, scavenges ruins, gets
      // the knife) — it needs day-parts for travel, so it runs before the
      // main daily consumes them. Off by default (HUNT_HOOK=1 enables).
      try {
        if (process.env.HUNT_HOOK === '1') K.huntTurns = (K.huntTurns || 0) + (huntRound(G, K) || 0);
      } catch (e) {}
      try { if (G.villagerId) playerIds.add(G.villagerId); } catch (e) {}
      try { if (G.scaleRank) scaleHist.push(G.scaleRank()); } catch (e) {}
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { asks += askRound(G, ctx); } catch (e) {}
      // r4 lever: the competent player engages trader offers. Off by default
      // (TRADE_HOOK=1 enables) so the before-run reproduces r1-r3's zero.
      try {
        if (process.env.TRADE_HOOK === '1') K.tradeTurns += tradeRound(G, K) || 0;
      } catch (e) {}
      // r6: animal-funnel daily scan — tastings accumulated in animalPrep
      try {
        const ap = (G.state.codex || {}).animalPrep || {};
        for (const [aid, e] of Object.entries(ap)) {
          const t = (e && e.tastings) || 0;
          const prev = _prevTast[aid] || 0;
          if (t > prev) {
            K.af.tastingsNew += (t - prev);
            K.af.tastingsByAid[aid] = (K.af.tastingsByAid[aid] || 0) + (t - prev);
          }
          _prevTast[aid] = t;
        }
        // snare recipe known? (catches the 'witnessed' path too)
        if (K.af.snareL1Day == null) {
          const rl = (((G.state.codex || {}).recipes || {}).snare || {}).level || 0;
          if (rl >= 1) K.af.snareL1Day = (G.state.scholar || {}).day || 0;
        }
      } catch (e) {}
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
      sharedLevels: {}, sharedServings: 0, sharedMaxServings: 0,
      harvestHist: { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 }, maxHarvests: 0,
    };
    try {
      const cxp = (Game.state.codex || {}).plants || {};
      for (const [pid, e] of Object.entries(cxp)) {
        const lvl = (e && e.level) || 0;
        if (lvl >= 4) ks.plantLevels[4]++; else ks.plantLevels[lvl] = (ks.plantLevels[lvl] || 0) + 1;
        if (e && (e.prepKnown || lvl >= 2)) ks.prepKnown++;
        // r3: harvest-depth instrumentation (the combine toll gate)
        try {
          if (lvl >= 1) {
            const hv = (e && e.harvests) || 0;
            const b = hv >= 4 ? '4+' : hv;
            ks.harvestHist[b] = (ks.harvestHist[b] || 0) + 1;
            if (hv > ks.maxHarvests) ks.maxHarvests = hv;
          }
        } catch (e2) {}
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
      // village shared depth (kitchen-deepening lever reads/writes this)
      try {
        for (const e of Object.values(v.sharedKnowledge || {})) {
          const l = (e && e.level) || 0;
          ks.sharedLevels[l] = (ks.sharedLevels[l] || 0) + 1;
          const sv = (e && e.servings) || 0;
          if (sv > 0) ks.sharedServings++;
          ks.sharedMaxServings = Math.max(ks.sharedMaxServings, sv);
        }
      } catch (e) {}
    } catch (e) {}

    // r6: merge the hunt hook's top-level counters into the af bucket
    try {
      AF.huntBooksRead = (K.huntBooksRead || 0);
      AF.huntRuinScavenges = (K.huntRuinScavenges || 0);
      AF.huntTurns = (K.huntTurns || 0);
      AF.huntStaffed = (K.huntStaffed || 0);
      AF.huntStoneRuns = (K.huntStoneRuns || 0);
      AF.huntKnivesKnapped = (K.huntKnivesKnapped || 0);
      // village-side animal knowledge (the r6 lever)
      AF.villageAnimals = (() => { const o = {}; try { for (const [aid, e] of Object.entries(((Game.state.village || {}).animals) || {})) o[aid] = (e && e.level) || 0; } catch (x) {} return o; })();
    } catch (e) {}
    // r6: end-state animal near-miss audit — input that ALMOST deepened
    try {
      const ap = (Game.state.codex || {}).animalPrep || {};
      for (const [aid, e] of Object.entries(ap)) {
        const t = (e && e.tastings) || 0;
        if (!t) continue;
        const adef = (Game.data.animals || []).find(a => a.id === aid);
        if (!adef) { AF.nearMiss.phantomTastings += t; continue; }
        let known = false;
        try { known = Game.encAnimalKnown(aid); } catch (x) {}
        if (!known) {
          AF.nearMiss.unknownSpeciesTastings += t;
          AF.nearMiss.unknownIds[aid] = t;
          if (t >= 3) AF.nearMiss.tastingsLostToUnknown += t;
        }
      }
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

    // ---- r5: end-state trader pool growth summary ----
    // (traders seen during the run, not just end-state roster — the dead
    // leave traderDeep records behind, and their growth still counts)
    const tr = { deepTotal: 0, deepByTrader: {}, deepVia: {}, poolFull: [], tradersAlive: 0, tradersEver: 0, traderNames: {} };
    try {
      const v = Game.state.village || {};
      const td = v.traderDeep || {};
      const seen = Object.assign({}, K.traderIds || {});
      for (const rid of (v.roster || [])) {
        if (rid === Game.villagerId) continue;
        let isT = false;
        try { isT = Game.isKnowledgeTrader(rid); } catch (e) {}
        if (isT) seen[rid] = true;
      }
      for (const rid of Object.keys(seen)) {
        tr.tradersEver++;
        try { tr.traderNames[rid] = Game.displayName(rid); } catch (e) {}
        if ((v.roster || []).includes(rid)) tr.tradersAlive++;
        const rec = td[rid] || {};
        let n = 0;
        for (const [pid, e] of Object.entries(rec)) {
          if (pid.charAt(0) === '_') continue;
          if (e && e.deep) {
            n++;
            tr.deepTotal++;
            const via = String(e.via || '?');
            tr.deepVia[via] = (tr.deepVia[via] || 0) + 1;
          }
        }
        if (n) tr.deepByTrader[rid] = n;
        if ((v.roster || []).includes(rid)) {
          let full = 0;
          try { full = (Game.traderKnowledge(rid, true) || []).length; } catch (e) {}
          tr.poolFull.push(full);
        }
      }
    } catch (e) {}

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
      foodSafeBy: K.foodSafeBy, combines: K.combines,
      nearMiss: K.nearMiss, nearMissHist: K.nearMissHist,
      // r4: trader channel
      traderMentions: K.traderMentions, tradeOutcomes: K.tradeOutcomes,
      traderMeetings: K.traderMeetings || 0, tradeOffers: K.tradeOffers || 0,
      tradeTurns: K.tradeTurns,
      // r5: pool growth
      deepTrades: K.deepTrades || 0, trDeepTotal: tr.deepTotal,
      trDeepByTrader: tr.deepByTrader, trDeepVia: tr.deepVia,
      trPoolFull: tr.poolFull, trTradersAlive: tr.tradersAlive, trTradersEver: tr.tradersEver,
      trTraderNames: tr.traderNames,
      // r6: animal funnel
      af: K.af,
      tradeDeclined: Object.fromEntries(Object.entries(K).filter(([k]) => k.indexOf('tradeDeclined:') === 0)),
      tradeNoOffer: Object.fromEntries(Object.entries(K).filter(([k]) => k.indexOf('tradeNoOffer:') === 0)),
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
      `vilMean=${ks.vilMeanKnown} vilDistinct=${ks.villageDistinct} pd=${playerDeaths} vd=${villagerDeaths} ` +
      `trMeet=${K.traderMeetings || 0} trOffer=${K.tradeOffers || 0} trOut=${JSON.stringify(K.tradeOutcomes)} ` +
      `af: idA=${K.af.identifyAnimal} tastings=${K.af.tastingsNew} depth=${JSON.stringify(K.af.depthBeatsTasted)} ` +
      `staff=${K.af.huntStaffed} vilAnim=${JSON.stringify(K.af.villageAnimals)} ` +
      `via=${JSON.stringify(K.af.noteDepthByVia)} master=${K.af.masterTech} snareD=${K.af.snareL1Day} ` +
      `vilHunt=${K.af.vilHuntKills} nearMiss=${JSON.stringify(K.af.nearMiss.unknownSpeciesTastings !== undefined ? { lost: K.af.nearMiss.tastingsLostToUnknown, phantom: K.af.nearMiss.phantomTastings } : {})}`);
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
    combines: sum(runs.map(r => r.combines || 0)),
    nearMiss: sum(runs.map(r => r.nearMiss || 0)),
    nearMissHist: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.nearMissHist || {})) o[k] = (o[k] || 0) + v; return o; })(),
    harvestHist: (() => { const o = { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 }; for (const r of runs) for (const [k, v] of Object.entries((r.ks || {}).harvestHist || {})) o[k] = (o[k] || 0) + v; return o; })(),
    maxHarvestsMax: Math.max.apply(null, runs.map(r => ((r.ks || {}).maxHarvests) || 0)),
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
    // r6: animal funnel aggregate
    afIdentifyAnimal: sum(runs.map(r => ((r.af || {}).identifyAnimal) || 0)),
    afIdentIds: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).identIds) || {})) o[k] = (o[k] || 0) + v; return o; })(),
    afNoteDepthByVia: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).noteDepthByVia) || {})) o[k] = (o[k] || 0) + v; return o; })(),
    afDepthBeatsTasted: (() => { const o = { 2: 0, 3: 0, 4: 0 }; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).depthBeatsTasted) || {})) o[k] = (o[k] || 0) + v; return o; })(),
    afMasterTech: sum(runs.map(r => ((r.af || {}).masterTech) || 0)),
    afTastingsNew: sum(runs.map(r => ((r.af || {}).tastingsNew) || 0)),
    afTastingsByAid: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).tastingsByAid) || {})) o[k] = (o[k] || 0) + v; return o; })(),
    afHuntBooksRead: sum(runs.map(r => ((r.af || {}).huntBooksRead) || 0)),
    afHuntRuinScavenges: sum(runs.map(r => ((r.af || {}).huntRuinScavenges) || 0)),
    afSnareL1Days: runs.map(r => ((r.af || {}).snareL1Day)),
    afVilHuntKills: sum(runs.map(r => ((r.af || {}).vilHuntKills) || 0)),
    afVilHuntSpecies: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).vilHuntSpecies) || {})) o[k] = (o[k] || 0) + v; return o; })(),
    afLostToUnknown: sum(runs.map(r => (((r.af || {}).nearMiss) || {}).tastingsLostToUnknown || 0)),
    afPhantomTastings: sum(runs.map(r => (((r.af || {}).nearMiss) || {}).phantomTastings || 0)),
    afHuntStaffed: sum(runs.map(r => ((r.af || {}).huntStaffed) || 0)),
    afHuntStoneRuns: sum(runs.map(r => ((r.af || {}).huntStoneRuns) || 0)),
    afHuntKnivesKnapped: sum(runs.map(r => ((r.af || {}).huntKnivesKnapped) || 0)),
    afVillageAnimals: (() => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(((r.af || {}).villageAnimals) || {})) o[k] = (o[k] || 0) + 1; return o; })(),
  };
  console.log('\n=== KNOWLEDGE AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policy: 'competent+ask' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
