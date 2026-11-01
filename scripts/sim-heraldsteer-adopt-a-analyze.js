// sim-heraldsteer-adopt-a-analyze.js — adoption metrics for the Herald steer.
// Usage: node scripts/sim-heraldsteer-adopt-a-analyze.js <corpusDir> <outJson>
// Reads one JSON object per file in <corpusDir> (heraldarr2 sweep format),
// writes adoption metrics JSON to <outJson>, prints a short summary.
// Pure read/aggregate: no game state, no RNG, no writes into the corpus.
'use strict';
const fs = require('fs');
const path = require('path');

function manhattan(a, b) {
  if (!a || !b) return null;
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function sameTile(a, b) {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

function analyzeSeed(s) {
  const contacts = s.contacts || [];
  const scholarContacts = contacts.filter(c => c.channel === 'scholar').length;
  const villagerContacts = contacts.filter(c => c.channel === 'villager').length;
  const contacted = contacts.length > 0;
  const dawns = s.dawns || [];
  const locatedDawns = dawns.filter(d => d.heraldTile);
  const dists = locatedDawns.map(d => d.distHavenMan).filter(n => typeof n === 'number');
  const meanDawnDist = dists.length ? dists.reduce((a, b) => a + b, 0) / dists.length : null;
  const minDawnDist = dists.length ? Math.min.apply(null, dists) : null;
  const dawnsAtDist1 = dists.filter(d => d <= 1).length;
  // Wander audit vs the haven tile recorded on each dawn (haven tile is
  // stable at (4,4) in practice but read per-seed, never assumed).
  const havenTile = (s.lairs && s.lairs.length && s.lairs[0].havenTile) ||
    (locatedDawns.length && locatedDawns[0].havenTile) || { x: 4, y: 4 };
  const wanders = (s.moves || []).filter(m => m.kind === 'wander');
  let approach = 0, retreat = 0, lateral = 0, teleports = 0, havenLandings = 0;
  const teleportEvents = [], havenLandingEvents = [];
  for (const w of wanders) {
    if (!w.from || !w.to) continue;
    const step = manhattan(w.from, w.to);
    if (step !== 1) { teleports++; teleportEvents.push(w); }
    if (sameTile(w.to, havenTile)) { havenLandings++; havenLandingEvents.push(w); }
    const d0 = manhattan(w.from, havenTile), d1 = manhattan(w.to, havenTile);
    if (d1 < d0) approach++;
    else if (d1 > d0) retreat++;
    else lateral++;
  }
  // Wave-5 fight-chain signal: any contact on a seed whose maxWave >= 5.
  const wave5FightChain = (s.maxWave >= 5 && contacted) ? 1 : 0;
  return {
    seed: s.seed, contacted: contacted ? 1 : 0, contacts: contacts.length,
    scholarContacts: scholarContacts, villagerContacts: villagerContacts,
    lairCount: (s.lairs || []).length,
    locatedDawns: locatedDawns.length, meanDawnDist: meanDawnDist,
    minDawnDist: minDawnDist, dawnsAtDist1: dawnsAtDist1,
    wanderSteps: wanders.length, wanderApproach: approach,
    wanderRetreat: retreat, wanderLateral: lateral,
    wanderTeleports: teleports, wanderHavenLandings: havenLandings,
    teleportEvents: teleportEvents, havenLandingEvents: havenLandingEvents,
    maxWave: s.maxWave || 1, wave4: s.wave4 || 0, wave5: s.wave5 || 0,
    national: s.national || 0, table: s.table || 0, won: s.won || 0,
    gameDays: s.gameDays || 0, endReason: s.endReason || null,
    endScaleRank: s.endScaleRank || null, wave5FightChain: wave5FightChain,
    captureErrs: s.captureErrs || 0,
  };
}

function main() {
  const dir = process.argv[2];
  const outPath = process.argv[3];
  if (!dir || !outPath) { console.error('usage: sim-heraldsteer-adopt-a-analyze.js <corpusDir> <outJson>'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const seeds = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8').trim();
    const lines = raw.split('\n').filter(l => l.trim().length);
    if (lines.length !== 1) { console.error('SKIP ' + f + ': expected 1 JSON line, got ' + lines.length); continue; }
    seeds.push(JSON.parse(lines[0]));
  }
  const perSeed = seeds.map(analyzeSeed);
  const contactedSeeds = perSeed.filter(p => p.contacted);
  const locatedSeeds = perSeed.filter(p => p.locatedDawns > 0);
  let pooledDistSum = 0, pooledDistN = 0;
  for (const s of seeds) {
    for (const d of (s.dawns || [])) {
      if (d.heraldTile && typeof d.distHavenMan === 'number') { pooledDistSum += d.distHavenMan; pooledDistN++; }
    }
  }
  const gameDaysSorted = perSeed.map(p => p.gameDays).sort((a, b) => a - b);
  const medianSurvival = gameDaysSorted.length ? gameDaysSorted[Math.floor(gameDaysSorted.length / 2)] : null;
  const out = {
    seeds: perSeed.length,
    contactSeedRate: perSeed.length ? contactedSeeds.length + '/' + perSeed.length : '0/0',
    contactedSeeds: contactedSeeds.map(p => p.seed),
    totalContacts: perSeed.reduce((a, p) => a + p.contacts, 0),
    totalScholarContacts: perSeed.reduce((a, p) => a + p.scholarContacts, 0),
    totalVillagerContacts: perSeed.reduce((a, p) => a + p.villagerContacts, 0),
    locatedSeeds: locatedSeeds.map(p => p.seed),
    pooledMeanDawnDist: pooledDistN ? pooledDistSum / pooledDistN : null,
    pooledLocatedDawns: pooledDistN,
    pooledDawnsAtDist1: perSeed.reduce((a, p) => a + p.dawnsAtDist1, 0),
    totalWanderSteps: perSeed.reduce((a, p) => a + p.wanderSteps, 0),
    wanderApproach: perSeed.reduce((a, p) => a + p.wanderApproach, 0),
    wanderRetreat: perSeed.reduce((a, p) => a + p.wanderRetreat, 0),
    wanderLateral: perSeed.reduce((a, p) => a + p.wanderLateral, 0),
    wanderTeleports: perSeed.reduce((a, p) => a + p.wanderTeleports, 0),
    wanderHavenLandings: perSeed.reduce((a, p) => a + p.wanderHavenLandings, 0),
    national: perSeed.reduce((a, p) => a + p.national, 0),
    table: perSeed.reduce((a, p) => a + p.table, 0),
    won: perSeed.reduce((a, p) => a + p.won, 0),
    wave4: perSeed.reduce((a, p) => a + p.wave4, 0),
    wave5: perSeed.reduce((a, p) => a + p.wave5, 0),
    wave5FightChains: perSeed.reduce((a, p) => a + p.wave5FightChain, 0),
    medianSurvival: medianSurvival,
    maxSurvival: gameDaysSorted.length ? gameDaysSorted[gameDaysSorted.length - 1] : null,
    totalCaptureErrs: perSeed.reduce((a, p) => a + p.captureErrs, 0),
    perSeed: perSeed,
  };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log('seeds=' + out.seeds + ' contactRate=' + out.contactSeedRate +
    ' contacts=' + out.totalContacts + ' (scholar ' + out.totalScholarContacts +
    ' villager ' + out.totalVillagerContacts + ')' +
    ' pooledMeanDawnDist=' + (out.pooledMeanDawnDist === null ? 'null' : out.pooledMeanDawnDist.toFixed(2)) +
    ' wander=' + out.totalWanderSteps + ' approach=' + out.wanderApproach +
    ' retreat=' + out.wanderRetreat + ' lateral=' + out.wanderLateral +
    ' teleports=' + out.wanderTeleports + ' havenLandings=' + out.wanderHavenLandings +
    ' national=' + out.national + ' table=' + out.table + ' won=' + out.won +
    ' wave4=' + out.wave4 + ' wave5=' + out.wave5 +
    ' medianSurvival=' + out.medianSurvival + ' capErrs=' + out.totalCaptureErrs);
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, manhattan: manhattan, sameTile: sameTile };
