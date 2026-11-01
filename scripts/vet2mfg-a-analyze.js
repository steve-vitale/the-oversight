#!/usr/bin/env node
// vet2mfg-a-analyze.js — wave-4 funnel analyzer for sim-vet2mfg-a.
//
// Reads per-seed JSONs (scripts/vet2mfg-a-sweep.js output, split by
// scripts/vet2mfg-split.js) and builds the per-seed funnel +
// pooled totals + UNCLASSIFIED/orphan checks. Pure analysis: no game
// loaded, no trajectory effect.
//
// Usage: node scripts/vet2mfg-a-analyze.js <per-seed-dir> [out.json]
// Prints per-seed + pooled funnel tables. Exit 0 always (verdict
// inputs are data, printed as PASS/FAIL lines for the evidence).
'use strict';
const fs = require('fs');
const path = require('path');

const CHANNELS = ['wild', 'patrol', 'raid', 'aid', 'player', 'other-field'];
function outcomeClass(ch, outcome, result) {
  if (ch === 'player') {
    if (result === 'won') return 'killed-or-won';
    if (result === 'routed') return 'monsterFled';
    if (result === 'fled') return 'fled';
    if (result === 'lost') return 'lost';
    return 'unknown';
  }
  if (outcome === 'vKill') return 'killed';
  if (outcome === 'mFlee') return 'monsterFled';
  if (outcome === 'vFlee') return 'fled';
  if (outcome === 'vDie') return 'lost';
  if (outcome === 'evade') return 'evade';
  if (outcome === 'alreadyDead') return 'alreadyDead';
  if (outcome === 'blocked-rest') return 'blockedRest';
  return 'unknown';
}

function analyzeSeed(o) {
  const wgRows = o.rows || [];
  let unlockDay = null;
  for (const r of wgRows) {
    if ((r.uw | 0) >= 4) { unlockDay = r.day; break; }
  }
  const spawns = (o.spawns || []).filter(s => s.wave === 4);
  const postSpawns = unlockDay == null ? [] : spawns.filter(s => s.day >= unlockDay);
  const preSpawns = unlockDay == null ? spawns : spawns.filter(s => s.day < unlockDay);
  const firstSpawnDay = spawns.length ? Math.min.apply(null, spawns.map(s => s.day)) : null;
  const firstPostSpawnDay = postSpawns.length ? Math.min.apply(null, postSpawns.map(s => s.day)) : null;

  // Player fights: join tbEnd -> tbStart by fightSeq.
  const startsBySeq = {};
  for (const s of (o.tbStarts || [])) {
    if (s.fightSeq != null && !s.refused) startsBySeq[s.fightSeq] = s;
  }
  const killByIdx = {};
  for (const k of (o.kills || [])) killByIdx[k.idx] = k;
  const joinedKillIdx = new Set();
  const playerFights = [];
  for (const e of (o.tbEnds || [])) {
    const st = startsBySeq[e.fightSeq] || null;
    const sliceKills = (e.kills || []).map(i => killByIdx[i]).filter(Boolean);
    for (const i of (e.kills || [])) joinedKillIdx.add(i);
    const w4kill = sliceKills.some(k => (k.w | 0) >= 4);
    const startW4 = !!(st && (st.wave | 0) === 4);
    if (!startW4 && !w4kill) continue; // not a wave-4 player fight
    let cls = outcomeClass('player', null, e.result);
    // 'won' with a w4 kill = killed. 'won' with other-wave kills but no
    // w4 kill = the w4 monster left the fight alive while its packmates
    // died (TB-fled). 'won' with no kills at all = genuinely unexplained.
    if (cls === 'killed-or-won') cls = w4kill ? 'killed' : (sliceKills.length > 0 ? 'monsterFled' : 'won-nokill');
    playerFights.push({
      ch: 'player', day: e.day, type: st ? st.type : null, outcome: e.result,
      cls, kills: (e.kills || []).slice(), w4kill,
      // Pending-instantiated: the fight's monster was NOT lifted from a
      // world tile (no worldWave on the start) — the player channel can
      // bypass the world-spawn stage (wanderer/pending instantiation).
      pendingInstantiated: !!(st && st.worldWave == null),
    });
  }
  // Refused starts (titan gate, live-fight, throw): classified events,
  // never fights, never UNCLASSIFIED. Only non-refused starts without a
  // tbEnd are unresolved.
  const refusedStarts = (o.tbStarts || []).filter(s => s.refused);
  const refusedW4 = refusedStarts.filter(s => (s.wave | 0) === 4);
  const refusedByType = {};
  for (const s of refusedW4) refusedByType[s.type] = (refusedByType[s.type] || 0) + 1;
  const unresolvedStarts = (o.tbStarts || []).filter(s =>
    !s.refused && s.fightSeq != null && !(o.tbEnds || []).some(e => e.fightSeq === s.fightSeq));
  const unresolvedW4Starts = unresolvedStarts.filter(s => (s.wave | 0) === 4);

  const routerFights = [];
  for (const f of (o.fights || [])) {
    if ((f.wave | 0) !== 4) continue;
    for (const i of (f.kills || [])) joinedKillIdx.add(i);
    routerFights.push({
      ch: f.ch, sub: f.sub || null, day: f.day, seq: f.seq, type: f.type,
      vid: f.vid || null, outcome: f.outcome || null,
      cls: outcomeClass(f.ch, f.outcome, null), kills: (f.kills || []).slice(),
    });
  }
  const allFights = routerFights.concat(playerFights);
  const postFights = unlockDay == null ? [] : allFights.filter(f => f.day >= unlockDay);
  const preFights = unlockDay == null ? allFights : allFights.filter(f => f.day < unlockDay);

  // Fight counts by channel + outcomes (post-unlock funnel).
  const byChannel = {}, byOutcome = {};
  for (const c of CHANNELS) byChannel[c] = 0;
  for (const f of postFights) {
    byChannel[f.ch] = (byChannel[f.ch] || 0) + 1;
    byOutcome[f.cls] = (byOutcome[f.cls] || 0) + 1;
  }
  const fightsByChannelAll = {};
  for (const f of allFights) fightsByChannelAll[f.ch] = (fightsByChannelAll[f.ch] || 0) + 1;

  // Kills (wave 4+): joined vs orphan, by via, by killer class.
  const w4kills = (o.kills || []).filter(k => (k.w | 0) >= 4);
  const postKills = unlockDay == null ? [] : w4kills.filter(k => k.d >= unlockDay);
  const preKills = unlockDay == null ? w4kills : w4kills.filter(k => k.d < unlockDay);
  const orphans = w4kills.filter(k => !joinedKillIdx.has(k.idx));
  const killsByVia = {}, killsBySrc = {};
  for (const k of postKills) {
    killsByVia[k.via] = (killsByVia[k.via] || 0) + 1;
    killsBySrc[k.src] = (killsBySrc[k.src] || 0) + 1;
  }
  // Scholar at kill time is the capture's scholarVid, not the end vid:
  // count scholar-kills by capture scholarVid == by.
  const postKillsByScholarAtCall = postKills.filter(k => k.scholarVid != null && k.by === k.scholarVid).length;

  // Tick aggregates (post-unlock only; tick day = scholar day at tick).
  const tickPost = { ticks: 0, w4monsters: 0, opps: 0, shelterBlocked: 0, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 0 };
  const tickAll = { ticks: 0, w4monsters: 0, opps: 0, shelterBlocked: 0, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 0 };
  for (const t of (o.tickDaily || [])) {
    for (const k of Object.keys(tickAll)) tickAll[k] += t[k] || 0;
    if (unlockDay != null && t.day >= unlockDay) for (const k of Object.keys(tickPost)) tickPost[k] += t[k] || 0;
  }

  // Vet5 trajectory (vet2 rows).
  let maxVet5 = 0, maxVet5Day = null, maxVet4 = 0, endVet5 = 0, endVet4 = 0;
  const vetRows = o.vetRows || [];
  for (const r of vetRows) {
    if ((r.vet5 || []).length > maxVet5) { maxVet5 = r.vet5.length; maxVet5Day = r.day; }
    if ((r.vet4 || []).length > maxVet4) maxVet4 = r.vet4.length;
  }
  if (vetRows.length) {
    const last = vetRows[vetRows.length - 1];
    endVet5 = (last.vet5 || []).length; endVet4 = (last.vet4 || []).length;
  }

  // Shelter episodes from daily mfg rows.
  const episodes = [];
  let cur = null;
  for (const r of (o.mfgRows || [])) {
    const n = r.shelteredCount || 0;
    if (n > 0) {
      if (!cur) cur = { start: r.day, end: r.day, max: n };
      else { cur.end = r.day; if (n > cur.max) cur.max = n; }
    } else if (cur) { episodes.push(cur); cur = null; }
  }
  if (cur) episodes.push(cur);
  const shelterDays = episodes.reduce((t, e) => t + (e.end - e.start + 1), 0);

  // UNCLASSIFIED per the prereg.
  const unclassified = [];
  for (const f of allFights) {
    if (f.cls === 'unknown' || f.cls === 'won-nokill') unclassified.push({ kind: 'fight-outcome', ch: f.ch, day: f.day, type: f.type, outcome: f.outcome, cls: f.cls });
  }
  for (const k of orphans) unclassified.push({ kind: 'orphan-kill', day: k.d, type: k.mid, via: k.via, src: k.src });
  for (const s of unresolvedW4Starts) unclassified.push({ kind: 'unresolved-start', day: s.day, type: s.type });
  for (const s of spawns) {
    if (s.wave == null) unclassified.push({ kind: 'spawn-wave', day: s.day, type: s.type });
  }
  // Fights whose instance never had a spawn record (direct-push path).
  const spawnSeqs = new Set(spawns.map(s => s.seq));
  for (const f of routerFights) {
    if (f.seq != null && !spawnSeqs.has(f.seq)) unclassified.push({ kind: 'fight-no-spawn', ch: f.ch, day: f.day, type: f.type, seq: f.seq });
  }

  const endDay = o.gameDays || 0;
  const windowDays = unlockDay == null ? null : (endDay - unlockDay);
  const wonDay = o.won ? endDay : null;

  // Seed-leak label (computed, with numbers beside it — the evidence
  // interprets, the analyzer only labels).
  let leak = 'no-unlock';
  if (unlockDay != null) {
    if (postKills.length >= 2) leak = 'kills-made';
    else if (postKills.length === 1) leak = 'one-kill-only';
    else if (postFights.length > 0) leak = 'fought-no-kill';
    else if (postSpawns.length > 0) leak = 'spawned-never-fought';
    else leak = 'never-spawned';
  }
  const complete = (unlockDay !== undefined && firstSpawnDay !== undefined)
    && unclassified.length === 0;

  const pendingInstantiatedFights = playerFights.filter(f => f.pendingInstantiated).length;
  return {
    seed: o.seed, anchorCommit: o.anchorCommit || null,
    endDay, endReason: o.endReason || null, won: o.won || 0, wonDay,
    refusedStarts: refusedStarts.length, refusedW4: refusedW4.length, refusedByType,
    pendingInstantiatedFights,
    national: o.national || 0, table: o.table || 0, maxWave: o.maxWave || 1,
    endScaleRank: o.endScaleRank || null,
    unlockDay, firstSpawnDay, firstPostSpawnDay,
    spawnsPost: postSpawns.length, spawnsPre: preSpawns.length,
    spawnsTotal: spawns.length,
    tickPost, tickAll,
    fightsPost: postFights.length, fightsPre: preFights.length,
    fightsByChannel: byChannel, fightsByChannelAll, fightsByOutcome: byOutcome,
    postFights, preFights,
    killsPost: postKills.length, killsPre: preKills.length,
    killsByVia, killsBySrc, killsPostScholarAtCall: postKillsByScholarAtCall,
    killsPostCompanionAtCall: postKills.length - postKillsByScholarAtCall,
    orphans: orphans.length, orphanDetail: orphans,
    unclassified, unclassifiedCount: unclassified.length,
    maxVet5, maxVet5Day, maxVet4, endVet5, endVet4,
    episodes, shelterDays, episodeCount: episodes.length,
    windowDays, leak, complete,
    errs: { wg: o.recorderErrs || 0, vet: o.vetErrs || 0, mfg: o.mfgErrs || 0, cap: o.captureErrs || 0 },
    sayLines: (o.sayLines || []).length,
  };
}

function analyzeBand(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = [];
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(o));
  }
  const pooled = {
    n: seeds.length,
    unlocked: seeds.filter(s => s.unlockDay != null).length,
    spawnedPost: seeds.filter(s => s.spawnsPost > 0).length,
    foughtPost: seeds.filter(s => s.fightsPost > 0).length,
    killedPost: seeds.filter(s => s.killsPost > 0).length,
    vet5ge2: seeds.filter(s => s.maxVet5 >= 2).length,
    won: seeds.filter(s => s.won).length,
    wonBy100: seeds.filter(s => s.won && s.endDay <= 100).length,
    spawnsPost: seeds.reduce((t, s) => t + s.spawnsPost, 0),
    spawnsPre: seeds.reduce((t, s) => t + s.spawnsPre, 0),
    fightsPost: seeds.reduce((t, s) => t + s.fightsPost, 0),
    killsPost: seeds.reduce((t, s) => t + s.killsPost, 0),
    refusedW4: seeds.reduce((t, s) => t + s.refusedW4, 0),
    pendingInstantiatedFights: seeds.reduce((t, s) => t + s.pendingInstantiatedFights, 0),
    orphans: seeds.reduce((t, s) => t + s.orphans, 0),
    unclassified: seeds.reduce((t, s) => t + s.unclassifiedCount, 0),
    complete: seeds.filter(s => s.complete).length,
    tickPost: {}, fightsByChannel: {}, fightsByOutcome: {}, killsByVia: {},
    leakCounts: {},
  };
  for (const k of ['ticks', 'w4monsters', 'opps', 'shelterBlocked', 'restBlocked', 'scholarTile', 'rollSkipped', 'availTotal']) {
    pooled.tickPost[k] = seeds.reduce((t, s) => t + (s.tickPost[k] || 0), 0);
  }
  for (const s of seeds) {
    for (const c of CHANNELS) pooled.fightsByChannel[c] = (pooled.fightsByChannel[c] || 0) + (s.fightsByChannel[c] || 0);
    for (const k of Object.keys(s.fightsByOutcome)) pooled.fightsByOutcome[k] = (pooled.fightsByOutcome[k] || 0) + s.fightsByOutcome[k];
    for (const k of Object.keys(s.killsByVia)) pooled.killsByVia[k] = (pooled.killsByVia[k] || 0) + s.killsByVia[k];
    pooled.leakCounts[s.leak] = (pooled.leakCounts[s.leak] || 0) + 1;
  }
  return { seeds, pooled };
}

function main() {
  const dir = process.argv[2];
  const outPath = process.argv[3] || null;
  if (!dir) { console.error('Usage: node scripts/vet2mfg-a-analyze.js <per-seed-dir> [out.json]'); process.exit(2); }
  const { seeds, pooled } = analyzeBand(dir);
  console.log('=== sim-vet2mfg-a funnel (wave 4, post-unlock unless noted) ===');
  console.log('seed unlock firstSpawn spawns fights kills maxVet5 endVet5 window end won leak unclass');
  for (const s of seeds) {
    console.log(`s${s.seed} ${s.unlockDay == null ? 'never' : s.unlockDay} ${s.firstSpawnDay == null ? 'never' : s.firstSpawnDay} post=${s.spawnsPost}/pre=${s.spawnsPre} ${s.fightsPost} ${s.killsPost} ${s.maxVet5} ${s.endVet5} ${s.windowDays == null ? '-' : s.windowDays} ${s.endDay} ${s.won} ${s.leak} ${s.unclassifiedCount}`);
  }
  console.log('\nPOOLED: ' + JSON.stringify(pooled, null, 1));
  console.log('\nPER-SEED TICK (post-unlock): opps shelterBlocked restBlocked scholarTile rollSkipped');
  for (const s of seeds) {
    const t = s.tickPost;
    console.log(`s${s.seed}: opps=${t.opps} shelter=${t.shelterBlocked} rest=${t.restBlocked} scholarTile=${t.scholarTile} rollSkip=${t.rollSkipped} w4ticks=${t.w4monsters}`);
  }
  console.log('\nPER-SEED FIGHTS BY CHANNEL (post-unlock) + OUTCOMES:');
  for (const s of seeds) {
    console.log(`s${s.seed}: ${JSON.stringify(s.fightsByChannel)} outcomes=${JSON.stringify(s.fightsByOutcome)} killsByVia=${JSON.stringify(s.killsByVia)} refusedW4=${s.refusedW4} ${JSON.stringify(s.refusedByType)} pendingInst=${s.pendingInstantiatedFights} episodes=${s.episodeCount} shelterDays=${s.shelterDays}`);
  }
  const uncl = seeds.filter(s => s.unclassifiedCount > 0);
  if (uncl.length) {
    console.log('\nUNCLASSIFIED DETAIL:');
    for (const s of uncl) for (const u of s.unclassified) console.log(`s${s.seed}: ${JSON.stringify(u)}`);
  } else console.log('\nUNCLASSIFIED: 0 (all seeds clean)');
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify({ seeds, pooled, generated: new Date().toISOString() }, null, 1) + '\n');
    console.log(`\nwrote ${outPath}`);
  }
}

if (require.main === module) main();
module.exports = { analyzeSeed, analyzeBand, outcomeClass, CHANNELS };
