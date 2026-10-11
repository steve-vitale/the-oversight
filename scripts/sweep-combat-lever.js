#!/usr/bin/env node
// sweep-combat-lever.js — long-run combat & death-share measurement (2026-10-11).
// Rotation lever 1: combat & death share. Wraps sim-harness (shared infra
// untouched) and records, per run:
//   - endReason, days survived, max arc reached, max wave UNLOCKED
//   - fights per wave (combat_start), fight outcomes per wave (combat_end)
//   - player deaths (mantle lineage) + villager deaths, bucketed by cause
//     (combat / starvation / thirst / disease / contest / raid / phoenix /
//      murder / wound / unattributed)
//   - counter discoveries (counter_discovered tele + state.monsterCounters),
//     counter-kill ledger proxy (waveLedger perType >= 2 — ambiguous, caveat)
//   - trap acquisition by source (craft tele vs loot_dropped tele)
//   - scale reach (max scaleRank), realm size (max polity villages),
//     young-link succession survival (link history 'succession' notes),
//     trauma log, slot vesting (abilities held/slots), tier reach
//
// Usage:
//   SEEDS="1,2,...,20" DAYS=200 POLICIES="competent" OUT=/tmp/x.json \
//     node scripts/sweep-combat-lever.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const POLICIES = { competent };

const TRAP_IDS = new Set(['deadfall_trap', 'box_trap', 'minnow_trap', 'pit_trap', 'snare', 'snare_wire']);

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

const DISEASE_RE = /gutrot|trichinosis|lockjaw|wound_?fever|trembles|lemons|eurika|east_?nile|howlbelly|gristlefit|croakbelly|shellgut|witness_?maw|flockmind|disease|sick|plague|pox/;

// bucket(c, monsterNames): death cause -> share bucket
function bucket(c, monsterNames) {
  c = String(c || '').toLowerCase().trim();
  if (!c || c === '?' || c === 'the wild') return 'unattributed';
  // 'the night': the overnight attrition spiral — game.js sleep(): comment
  // names it starvation ("the overnight spiral is starvation, not violence").
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
  // villager-agency expedDeath: cause is the monster's display name — combat.
  for (const n of monsterNames) { if (n && c.includes(n)) return 'combat'; }
  return 'other';
}

function scaleRankOrder(r) {
  const o = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  return (o[String(r || '').toLowerCase()] != null) ? o[String(r || '').toLowerCase()] : 0;
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 20 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const policyIds = parseList('POLICIES', 'competent');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: true });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const playerIds = new Set();       // villagerIds who held the mantle
      const scaleHist = [];
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          if (G.villagerId) playerIds.add(G.villagerId);
          if (G.scaleRank) scaleHist.push(G.scaleRank());
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const telemetry = result.telemetry || [];

      // ---- monster names for cause resolution ----
      const monsterNames = new Set();
      try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}

      // ---- deaths ----
      const playerDeaths = [], villagerDeaths = [];
      const deathBucketsP = {}, deathBucketsV = {};
      const lineage = [];
      try { for (const e of (Game.lineage() || [])) lineage.push(e); } catch (e) {}
      const playerNameSet = new Set(); // resolved below via playerIds
      for (const ev of telemetry) {
        if (ev.type !== 'death') continue;
        if ((ev.kind || '') === 'monster') continue;
        const b = bucket(ev.cause, monsterNames);
        const isPlayer = playerIds.has(ev.who);
        const rec = { day: ev.day, who: ev.who, cause: ev.cause, bucket: b, kind: ev.kind };
        if (isPlayer) { playerDeaths.push(rec); deathBucketsP[b] = (deathBucketsP[b] || 0) + 1; }
        else { villagerDeaths.push(rec); deathBucketsV[b] = (deathBucketsV[b] || 0) + 1; }
      }

      // ---- combat per wave ----
      const fightsPerWave = {}, outcomesPerWave = {};
      // Pair start/end sequentially (startCombat refuses nested fights, so
      // the stream is well-ordered) -> per-wave outcome table.
      let pendWave = null, pendPack = 1, pendPhp = null, pendVs = null;
      const waveOutcomes = {};
      const lostProfiles = []; // {wave, vs, pack, php0, day}
      for (const ev of telemetry) {
        if (ev.type === 'combat_start') {
          const w = ev.wave || '?';
          fightsPerWave[w] = (fightsPerWave[w] || 0) + 1;
          pendWave = w; pendPack = ev.pack || 1; pendPhp = ev.php; pendVs = ev.vs;
        } else if (ev.type === 'combat_end') {
          const r = ev.result || '?';
          outcomesPerWave[r] = (outcomesPerWave[r] || 0) + 1;
          if (pendWave != null) {
            waveOutcomes[pendWave] = waveOutcomes[pendWave] || {};
            waveOutcomes[pendWave][r] = (waveOutcomes[pendWave][r] || 0) + 1;
            if (r === 'lost') lostProfiles.push({ wave: pendWave, vs: pendVs, pack: pendPack, php0: pendPhp, day: ev.day });
            pendWave = null;
          }
        }
      }

      // ---- counters ----
      let countersDiscovered = 0, counterTeleCount = 0;
      try { countersDiscovered = Object.keys(Game.state.monsterCounters || {}).length; } catch (e) {}
      for (const ev of telemetry) if (ev.type === 'counter_discovered') counterTeleCount++;
      // counter-kill proxy: ledger perType points >= 2 (AMBIGUOUS: could be
      // two plain kills — perTypeCap is 2. Documented caveat.)
      let counterKillProxy = 0, ledgerPoints = {};
      try {
        const wl = Game.state.waveLedger || {};
        for (const w of Object.keys(wl)) {
          ledgerPoints[w] = wl[w].points || 0;
          for (const t of Object.keys(wl[w].perType || {})) if (wl[w].perType[t] >= 2) counterKillProxy++;
        }
      } catch (e) {}

      // ---- traps by source ----
      let trapsCrafted = 0, trapsLooted = 0;
      for (const ev of telemetry) {
        if (ev.type === 'craft' && TRAP_IDS.has(ev.id)) trapsCrafted++;
        if (ev.type === 'loot_dropped' && TRAP_IDS.has(ev.id)) trapsLooted++;
      }

      // ---- scale / realm / succession ----
      let maxScale = 'village';
      for (const r of scaleHist) if (scaleRankOrder(r) > scaleRankOrder(maxScale)) maxScale = r;
      let realmMax = 0, successionNotes = 0, successionSurvived = 0, successionSnapped = 0;
      try {
        const links = (Game.hierarchyState ? Game.hierarchyState() : []) || [];
        for (const l of links) {
          let sz = 1 + ((l.subs || []).length || 0);
          if (l.primary && l.subs) sz = 1 + l.subs.length;
          if (sz > realmMax) realmMax = sz;
          for (const h of (l.history || [])) {
            if (h.kind === 'succession') {
              successionNotes++;
              if (String(l.status || '').toLowerCase() === 'active') successionSurvived++;
              else successionSnapped++;
            }
          }
        }
      } catch (e) {}

      // ---- trauma / slots / tier ----
      let trauma = [];
      try { trauma = ((Game.betrayalState && Game.betrayalState() || {}).trauma || []).slice(); } catch (e) {}
      let slots = 0, abilitiesHeld = 0;
      try { slots = Game.abilitySlots ? Game.abilitySlots() : 0; abilitiesHeld = ((Game.state.scholar || {}).abilities || []).length; } catch (e) {}
      let tier = 0;
      try { tier = (Game.havenTier ? Game.havenTier() : 0) || 0; } catch (e) {}
      let maxArc = 1;
      try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
      let won = false, tableWaiting = false, breadth = 0, stage = 0;
      try { won = !!Game.won; } catch (e) {}
      try { tableWaiting = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
      try { breadth = Game.codexBreadth(); } catch (e) {}
      try { stage = Game.integrationStage(); } catch (e) {}

      const rec = {
        seed, policy: pid, days: result.days, endReason: result.endReason,
        maxArc, maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills || {},
        ledgerPoints, breadth, stage, slots, abilitiesHeld, tier,
        maxScale, realmMax,
        playerDeaths: playerDeaths.length, playerBuckets: deathBucketsP,
        villagerDeaths: villagerDeaths.length, villagerBuckets: deathBucketsV,
        deathDays: playerDeaths.concat(villagerDeaths).map(d => ({ day: d.day, b: d.bucket, p: playerIds.has(d.who) })),
        lineageLen: lineage.length,
        fightsPerWave, outcomesPerWave, waveOutcomes,
        lostProfiles,
        countersDiscovered, counterTeleCount, counterKillProxy,
        trapsCrafted, trapsLooted,
        successionNotes, successionSurvived, successionSnapped,
        traumaKinds: trauma.map(t => t.kind),
        ms: result.ms,
      };
      runs.push(rec);
      console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} wave=${result.maxWaveUnlocked} scale=${maxScale} pd=${playerDeaths.length} vd=${villagerDeaths.length} fights=${JSON.stringify(fightsPerWave)}`);
    }
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const agg = {};
  for (const pid of policyIds) {
    const pr = runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const addBuckets = (key) => {
      const o = {};
      for (const r of pr) for (const [b, n] of Object.entries(r[key])) o[b] = (o[b] || 0) + n;
      return o;
    };
    const ds = pr.map(r => r.days).sort((a, b) => a - b);
    const waveReach = {};
    for (const r of pr) for (const w of Object.keys(r.fightsPerWave)) waveReach[w] = (waveReach[w] || 0) + 1;
    const scaleDist = {};
    for (const r of pr) scaleDist[r.maxScale] = (scaleDist[r.maxScale] || 0) + 1;
    const deaths = sum(pr.map(r => r.playerDeaths + r.villagerDeaths));
    const total = (obj) => sum(Object.values(obj));
    const share = (obj) => { const t = total(obj) || 1; const o = {}; for (const [k, v] of Object.entries(obj)) o[k] = +(100 * v / t).toFixed(1); return o; };
    // death timing: share of deaths in day bands 1-30 / 31-60 / 61-100 / 101+
    const bands = { '1-30': 0, '31-60': 0, '61-100': 0, '101+': 0 };
    const bandBuckets = {};
    for (const r of pr) for (const d of (r.deathDays || [])) {
      const band = d.day <= 30 ? '1-30' : d.day <= 60 ? '31-60' : d.day <= 100 ? '61-100' : '101+';
      bands[band]++;
      bandBuckets[band] = bandBuckets[band] || {};
      bandBuckets[band][d.b] = (bandBuckets[band][d.b] || 0) + 1;
    }
    // per-wave outcome merge
    const waveOut = {};
    for (const r of pr) for (const [w, o] of Object.entries(r.waveOutcomes || {})) {
      waveOut[w] = waveOut[w] || {};
      for (const [res, n] of Object.entries(o)) waveOut[w][res] = (waveOut[w][res] || 0) + n;
    }
    agg[pid] = {
      n: pr.length,
      medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
      endReasons: pr.reduce((o, r) => { o[r.endReason] = (o[r.endReason] || 0) + 1; return o; }, {}),
      won: pr.filter(r => r.won).length, tableWaiting: pr.filter(r => r.tableWaiting).length,
      maxArcDist: pr.reduce((o, r) => { o[r.maxArc] = (o[r.maxArc] || 0) + 1; return o; }, {}),
      maxWaveDist: pr.reduce((o, r) => { o[r.maxWaveUnlocked] = (o[r.maxWaveUnlocked] || 0) + 1; return o; }, {}),
      waveReachRuns: waveReach, // runs with >=1 blow-by-blow fight vs that wave
      scaleDist, realmMaxMax: Math.max.apply(null, pr.map(r => r.realmMax)),
      totalDeaths: deaths,
      playerDeaths: sum(pr.map(r => r.playerDeaths)),
      villagerDeaths: sum(pr.map(r => r.villagerDeaths)),
      playerBuckets: addBuckets('playerBuckets'), playerBucketShare: share(addBuckets('playerBuckets')),
      villagerBuckets: addBuckets('villagerBuckets'), villagerBucketShare: share(addBuckets('villagerBuckets')),
      countersDiscovered: sum(pr.map(r => r.countersDiscovered)),
      counterKillProxy: sum(pr.map(r => r.counterKillProxy)),
      trapsCrafted: sum(pr.map(r => r.trapsCrafted)), trapsLooted: sum(pr.map(r => r.trapsLooted)),
      succession: { notes: sum(pr.map(r => r.successionNotes)), survived: sum(pr.map(r => r.successionSurvived)), snapped: sum(pr.map(r => r.successionSnapped)) },
      traumaTotal: sum(pr.map(r => r.traumaKinds.length)),
      traumaKinds: pr.flatMap(r => r.traumaKinds).reduce((o, k) => { o[k] = (o[k] || 0) + 1; return o; }, {}),
      meanSlots: +(sum(pr.map(r => r.slots)) / pr.length).toFixed(1),
      meanAbilities: +(sum(pr.map(r => r.abilitiesHeld)) / pr.length).toFixed(1),
      meanBreadth: +(sum(pr.map(r => r.breadth)) / pr.length).toFixed(1),
      meanStage: +(sum(pr.map(r => r.stage)) / pr.length).toFixed(1),
      meanTier: +(sum(pr.map(r => r.tier)) / pr.length).toFixed(1),
      deathBands: bands, deathBandBuckets: bandBuckets,
      waveOutcomes: waveOut,
      // lost-fight profile: pack size dist + median entry-HP for lost fights
      lostProfile: (() => {
        const lp = pr.flatMap(r => r.lostProfiles || []);
        const byWave = {};
        for (const f of lp) {
          byWave[f.wave] = byWave[f.wave] || { n: 0, packs: {}, php0: [], vs: {} };
          const b = byWave[f.wave];
          b.n++; b.packs[f.pack] = (b.packs[f.pack] || 0) + 1;
          if (f.php0 != null) b.php0.push(f.php0);
          b.vs[f.vs] = (b.vs[f.vs] || 0) + 1;
        }
        for (const w of Object.keys(byWave)) {
          const s = byWave[w].php0.sort((x, y) => x - y);
          byWave[w].medianPhp0 = s.length ? s[Math.floor(s.length / 2)] : null;
          delete byWave[w].php0;
        }
        return byWave;
      })(),
    };
  }
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10) }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
