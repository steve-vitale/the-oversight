'use strict';
// analyze-hurthome-a.js — aggregate the sim-hurthome-a census and pick
// the narration-audit sample. Reads per-seed JSONs only; writes nothing.
// Usage:
//   node scripts/analyze-hurthome-a.js evidence/2026-11-04/perseed-hurthome-a
//   node scripts/analyze-hurthome-a.js --evenings evidence/2026-11-04/perseed-hurthome-a
const fs = require('fs');
const path = require('path');
const lib = require('./hurthome-a-lib');

const args = process.argv.slice(2).filter((a) => a !== '--evenings');
const showEvenings = process.argv.includes('--evenings');
const dir = args[0];
if (!dir) { console.error('usage: analyze-hurthome-a.js [--evenings] <perseed-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f.includes('hurthome-a-competent')).sort();
const seeds = [];
let episodes = [];
let hurtMealLines = 0;
let deaths = 0;
let errors = 0;
let transcriptLines = 0;
const perSeedRows = [];
const eveningCandidates = []; // {seed, vid, name, eveningDay, episode}

for (const f of files) {
  const ps = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  seeds.push(ps.seed);
  hurtMealLines += ps.hurtMealLineCount || 0;
  deaths += (ps.deaths || []).length;
  errors += (ps.errors || []).length;
  transcriptLines += (ps.transcript || []).length;
  const eps = ps.episodes || [];
  for (const ep of eps) {
    ep.seed = ps.seed;
    ep.bucket = lib.classifyEpisode(ep);
    episodes.push(ep);
  }
  perSeedRows.push({ seed: ps.seed, daysAlive: ps.daysAlive, endReason: ps.endReason,
    episodes: eps.length, hurtMealLines: ps.hurtMealLineCount || 0, errors: (ps.errors || []).length });
  // Stay-out evenings: evening day E where the episode was open at dawn
  // E and still open at dawn E+1. Reconstruct from dawn counts: an
  // episode with dawnsObserved >= 2 stayed at least one night out;
  // evenings are episodeDay .. episodeDay + dawnsObserved - 2 (the
  // last observed dawn has no following dawn in the episode, except
  // for returned episodes whose return day is known: evenings up to
  // returnDay - 1 if returnDay > episodeDay, or the night of a
  // return day is NOT a stay-out night). Conservative rule used here:
  // evening E counts iff E >= episodeDay and E + 1 <= lastDawnDay,
  // where lastDawnDay = episodeDay + dawnsObserved - 1 for open/
  // censored episodes, and for returned episodes E < returnDay.
  for (const ep of eps) {
    const lastDawn = ep.episodeDay + (ep.dawnsObserved || 1) - 1;
    let lastEvening;
    if (ep.outcome === 'returned') lastEvening = Math.min(lastDawn - 1, (ep.returnDay ?? 0) - 1);
    else lastEvening = lastDawn - 1;
    for (let e = ep.episodeDay; e <= lastEvening; e++) {
      eveningCandidates.push({ seed: ps.seed, vid: ep.vid, name: ep.name || '?',
        eveningDay: e, episode: ep, transcript: ps.transcript || [], hurtMealLines: ps.hurtMealLines || [] });
    }
  }
}

const buckets = {};
for (const ep of episodes) buckets[ep.bucket] = (buckets[ep.bucket] || 0) + 1;
const unclassified = episodes.filter((ep) => !ep.bucket).length;
const returned = episodes.filter((ep) => ep.outcome === 'returned');
const died = episodes.filter((ep) => ep.outcome === 'died');
const returnedLater = returned.filter((ep) => (ep.returnDay - ep.episodeDay) >= 2).length;
const turnHomeRateDen = (buckets['turn-home-same-day'] || 0) + (buckets['turn-home-next-day'] || 0) + returnedLater;
const turnHomeRate = turnHomeRateDen ? ((buckets['turn-home-same-day'] || 0) + (buckets['turn-home-next-day'] || 0)) / turnHomeRateDen : null;
const lens = [...returned.map((ep) => ep.returnDay - ep.episodeDay), ...died.map((ep) => ep.deathDay - ep.episodeDay)].sort((a, b) => a - b);
const med = lens.length ? lens[Math.floor((lens.length - 1) / 2)] : null;
const retLens = returned.map((ep) => ep.returnDay - ep.episodeDay).sort((a, b) => a - b);
const retMed = retLens.length ? retLens[Math.floor((retLens.length - 1) / 2)] : null;
const dieLens = died.map((ep) => ep.deathDay - ep.episodeDay).sort((a, b) => a - b);
const dieMed = dieLens.length ? dieLens[Math.floor((dieLens.length - 1) / 2)] : null;
const hpDist = {};
for (const ep of episodes) hpDist[ep.hpAtOpen] = (hpDist[ep.hpAtOpen] || 0) + 1;
const purposeDist = {};
for (const ep of episodes) purposeDist[ep.purpose || '?'] = (purposeDist[ep.purpose || '?'] || 0) + 1;
const timingDist = {};
for (const ep of episodes) timingDist[ep.hurtTiming || '?'] = (timingDist[ep.hurtTiming || '?'] || 0) + 1;

console.log('seeds: ' + seeds.join(','));
console.log('per-seed: ' + JSON.stringify(perSeedRows));
console.log('EPISODES: ' + episodes.length);
console.log('buckets: ' + JSON.stringify(buckets));
console.log('unclassified: ' + unclassified);
console.log('turn-home rate (same+next / same+next+later-returned): ' + (turnHomeRate == null ? 'n/a' : turnHomeRate.toFixed(3) + ' (' + ((buckets['turn-home-same-day'] || 0) + (buckets['turn-home-next-day'] || 0)) + '/' + turnHomeRateDen + ')'));
console.log('median days-out-while-hurt pooled (returned+died): ' + med);
console.log('median returned length: ' + retMed + ' (n=' + returned.length + '), median died length: ' + dieMed + ' (n=' + died.length + ')');
console.log('died-away share: ' + (episodes.length ? ((buckets['died-away'] || 0) / episodes.length).toFixed(3) + ' (' + (buckets['died-away'] || 0) + '/' + episodes.length + ')' : 'n/a'));
console.log('hpAtOpen dist: ' + JSON.stringify(hpDist));
console.log('purpose dist: ' + JSON.stringify(purposeDist));
console.log('hurtTiming dist: ' + JSON.stringify(timingDist));
console.log('hurtMealLines (context, cf. 2130Z 23 on 96101-96108): ' + hurtMealLines);
console.log('deaths recorded: ' + deaths + ', transcript lines kept: ' + transcriptLines + ', instrument errors: ' + errors);
console.log('stay-out evening candidates: ' + eveningCandidates.length);

// Audit sample: first 5 evenings, at most one per episode, preferring
// distinct seeds (stable order: seed, eveningDay).
const picked = [];
const usedEp = new Set();
const usedSeed = new Set();
for (const c of eveningCandidates.sort((a, b) => a.seed - b.seed || a.eveningDay - b.eveningDay)) {
  if (picked.length >= 5) break;
  const key = c.seed + '|' + c.vid + '|' + c.episode.episodeDay;
  if (usedEp.has(key)) continue;
  if (picked.length < 5 && usedSeed.has(c.seed) && eveningCandidates.some((o) => !usedSeed.has(o.seed))) {
    // prefer a fresh seed while fresh seeds remain; still allow repeats
    // if this is the last candidate class — handled by second pass below.
    continue;
  }
  usedEp.add(key);
  usedSeed.add(c.seed);
  picked.push(c);
}
if (picked.length < 5) {
  for (const c of eveningCandidates.sort((a, b) => a.seed - b.seed || a.eveningDay - b.eveningDay)) {
    if (picked.length >= 5) break;
    const key = c.seed + '|' + c.vid + '|' + c.episode.episodeDay;
    if (usedEp.has(key)) continue;
    usedEp.add(key);
    picked.push(c);
  }
}
console.log('AUDIT SAMPLE: ' + picked.length + ' evenings');
for (const c of picked) {
  const eveningLines = c.transcript.filter((t) => t.day === c.eveningDay && (t.part === 2 || t.part === 3)
    && c.name !== 'Someone' && t.line.indexOf(c.name) !== -1);
  const voice = c.hurtMealLines.filter((t) => t.day === c.eveningDay);
  console.log('--- seed ' + c.seed + ' ' + c.name + ' evening day ' + c.eveningDay
    + ' (episode day ' + c.episode.episodeDay + ', purpose ' + c.episode.purpose
    + ', hpAtOpen ' + c.episode.hpAtOpen + ', hurtDawns ' + c.episode.hurtDawns
    + ', outcome ' + c.episode.outcome + ')');
  console.log('    evening lines naming them: ' + eveningLines.length + '; voice lines that day: ' + voice.length);
  if (showEvenings) {
    for (const t of eveningLines) console.log('    [d' + t.day + ' p' + t.part + '] ' + t.line);
    for (const t of voice) console.log('    [voice d' + t.day + ' p' + t.part + '] ' + t.line);
  }
}
if (showEvenings) {
  console.log('=== ALL EPISODES ===');
  for (const ep of episodes.sort((a, b) => a.seed - b.seed || a.episodeDay - b.episodeDay)) {
    console.log('seed ' + ep.seed + ' ' + (ep.name || '?') + ' epDay ' + ep.episodeDay + ' purpose ' + ep.purpose
      + ' hp ' + ep.hpAtOpen + ' hurtDawns ' + ep.hurtDawns + '/' + ep.dawnsObserved
      + ' outcome ' + ep.outcome + (ep.returnDay != null ? ' retDay ' + ep.returnDay : '')
      + (ep.deathDay != null ? ' deathDay ' + ep.deathDay + ' cause ' + ep.deathCause : '')
      + ' bucket ' + ep.bucket + ' hurtTiming ' + (ep.hurtTiming || '?')
      + ' expedDur ' + (ep.expedDuration != null ? ep.expedDuration : '?') + ' awayDur ' + ep.awayDuration);
  }
}
