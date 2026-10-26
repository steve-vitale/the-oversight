#!/usr/bin/env node
// analyze-stock9762-b.js — pantry-composition analyzer (sim-stock9762-b).
//
// Reads evidence/2026-10-26/sim-stock9762-b-corpus/*.json (this sweep's
// own corpus). Judges ONLY the pre-registration in
// evidence/2026-10-26/sim-stock9762-b-prereg.md:
//   unit = engaged garden resolutions at resolution entry
//   medFresh[S][C] = median bucket-C freshKcal over ALL of S's engaged
//     resolutions (0 when absent)
//   totalGap = medFresh[9762] - median of other seeds' medFresh[S]
//   channelGap[C] = medFresh[9762][C] - median of other seeds' medFresh[S][C]
//   channelShare[C] = channelGap[C] / totalGap
//   "present across the band" on 9762 = freshKcal > 0 on >= 80% of 9762's
//     engaged resolutions AND on >= 50 distinct engaged days
//   GO iff (1) control reproduction exact, (2) snapshot rebuild >= 99%,
//     (3) a single channel, or a named set of <= 3 channels each with
//     share >= 10%, covers >= 50% of totalGap with every member present
//     across the band on 9762.
// A miss is NO-GO, never re-scored (no means, inflows, or day-end
// snapshots rescue a failed median leg — those are secondaries only).
//
// Usage: node scripts/analyze-stock9762-b.js [corpus-dir]
// Prints the verdict + all secondary figures; exit 0 always (the verdict
// line carries GO/NO-GO; the proof script asserts it).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const EXPECT = { resolutions: 761, engaged: 750, npcSows: 11, keeperTurns: 3167, beds: 32, playerSows: 235 };

function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : 'n/a'; }
function median(xs) {
  // Conventional median: average of the two middle values for even n.
  // This reproduces the throttledays evidence medians exactly
  // (9761: 32950.5, 9763: 16196.5); a floor-index median would not.
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
function bucketFresh(rec, channel) {
  const b = (rec.buckets || []).find(x => x.channel === channel);
  return b ? b.freshKcal : 0;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (files.length !== 8) { console.error('FATAL: expected 8 corpus files, found ' + files.length); process.exit(2); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

let rep = { resolutions: 0, engaged: 0, npcSows: 0, keeperTurns: 0, beds: 0, playerSows: 0 };
let flagMismatch = 0, rebuildOk = 0, rebuildChecked = 0, rebuildBadList = [];
const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survival: [], deaths: 0 };
const deathCauses = {};
const perSeed = {}; // seed -> {engaged, medFresh, medByChannel, meanByChannel, presence}
const engBySeed = {};
const allChannels = new Set();

for (const s of seeds) {
  const gr = (s.gardenEvents && s.gardenEvents.resolutions) || [];
  const tr = (s.throttleEvents && s.throttleEvents.resolutions) || [];
  const sr = (s.stockEvents && s.stockEvents.resolutions) || [];
  rep.resolutions += gr.length;
  rep.engaged += gr.filter(r => r.throttle === true).length;
  rep.npcSows += ((s.gardenEvents && s.gardenEvents.npcSows) || []).length;
  rep.keeperTurns += ((s.gardenEvents && s.gardenEvents.keeperTurns) || []).length;
  rep.beds += ((s.gardenEvents && s.gardenEvents.makes) || []).length;
  rep.playerSows += ((s.gardenEvents && s.gardenEvents.sows) || []).length;
  const n = Math.min(gr.length, tr.length, sr.length);
  for (let i = 0; i < n; i++) {
    if (gr[i].throttle !== tr[i].throttle || gr[i].throttle !== sr[i].throttle) flagMismatch++;
  }
  if (gr.length !== sr.length || tr.length !== sr.length) console.log('NOTE seed ' + s.seed + ': gardenRes ' + gr.length + ' throttleRes ' + tr.length + ' stockRes ' + sr.length);
  const eng = sr.filter(r => r.throttle === true);
  for (const r of sr) {
    if (r.freshKcal != null && r.freshRebuilt != null) {
      rebuildChecked++;
      if (r.freshRebuilt === r.freshKcal) rebuildOk++;
      else rebuildBadList.push({ seed: s.seed, day: r.day, fresh: r.freshKcal, rebuilt: r.freshRebuilt });
    }
    for (const b of (r.buckets || [])) allChannels.add(b.channel);
  }
  // Medians/presence are computed in a SECOND pass below, over the full
  // channel set (channels seen on later seeds must exist on earlier
  // seeds' tables too). Store the engaged resolutions here.
  engBySeed[s.seed] = eng;
  perSeed[s.seed] = {
    engaged: eng.length, medFresh: median(eng.map(r => r.freshKcal)),
    medTotal: median(eng.map(r => r.totalKcal)),
    medNonFresh: median(eng.map(r => r.totalKcal - r.freshKcal)),
    dayEndMedFresh: median((s.stockDays || []).map(d => d.freshKcal)),
  };
  if (s.national) wall.national++;
  if (s.table) wall.table++;
  if (s.win) wall.wins++;
  if ((s.waveReach || []).includes(4)) wall.wave4++;
  if ((s.waveReach || []).includes(5)) wall.wave5++;
  wall.survival.push(s.daysAlive);
  wall.deaths += s.deaths || 0;
  for (const [k, v] of Object.entries(s.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
}

// Second pass: per-seed channel medians/means/presence over the FULL
// channel set (a channel absent from a seed's engaged resolutions gets
// median 0 and presence 0 on that seed — that is the prereg's rule).
for (const s of seeds) {
  const eng = engBySeed[s.seed];
  const medByChannel = {}, meanByChannel = {}, presence = {};
  for (const c of allChannels) {
    const vals = eng.map(r => bucketFresh(r, c));
    medByChannel[c] = median(vals);
    meanByChannel[c] = mean(vals);
    let cnt = 0; const days = new Set();
    for (const r of eng) { if (bucketFresh(r, c) > 0) { cnt++; days.add(r.day); } }
    presence[c] = { res: cnt, resShare: eng.length ? cnt / eng.length : 0, days: days.size };
  }
  perSeed[s.seed].medByChannel = medByChannel;
  perSeed[s.seed].meanByChannel = meanByChannel;
  perSeed[s.seed].presence = presence;
}

const reproExact = rep.resolutions === EXPECT.resolutions && rep.engaged === EXPECT.engaged &&
  rep.npcSows === EXPECT.npcSows && rep.keeperTurns === EXPECT.keeperTurns &&
  rep.beds === EXPECT.beds && rep.playerSows === EXPECT.playerSows;
console.log('reproduction vs gardenbar: resolutions ' + rep.resolutions + ' (exp ' + EXPECT.resolutions + '), engaged ' + rep.engaged + ' (exp ' + EXPECT.engaged + '), npcSows ' + rep.npcSows + ' (exp ' + EXPECT.npcSows + '), keeperTurns ' + rep.keeperTurns + ' (exp ' + EXPECT.keeperTurns + '), beds ' + rep.beds + ' (exp ' + EXPECT.beds + '), playerSows ' + rep.playerSows + ' (exp ' + EXPECT.playerSows + ') => ' + (reproExact ? 'REPRODUCED' : 'FRESH BAND'));
console.log('flag agreement (garden vs throttle vs stock): mismatches ' + flagMismatch + ' / ' + rep.resolutions + ' resolutions');
console.log('snapshot rebuild: freshRebuilt == freshKcal on ' + rebuildOk + ' / ' + rebuildChecked + ' = ' + pct(rebuildOk, rebuildChecked));
if (rebuildBadList.length) console.log('rebuild mismatches (first 10): ' + JSON.stringify(rebuildBadList.slice(0, 10)));

// Per-seed medians.
console.log('\nper-seed engaged-resolution medians:');
for (const s of seeds) {
  const p = perSeed[s.seed];
  console.log(' seed ' + s.seed + ': engaged ' + p.engaged + ' medFresh ' + p.medFresh + ' medTotal ' + p.medTotal + ' medNonFresh ' + p.medNonFresh + ' dayEndMedFresh ' + p.dayEndMedFresh);
}

// Gap decomposition.
const others = seeds.map(s => s.seed).filter(x => x !== 9762);
const totalGap = perSeed[9762].medFresh - median(others.map(x => perSeed[x].medFresh));
console.log('\ntotalGap = medFresh[9762] ' + perSeed[9762].medFresh + ' - median(other medFresh) ' + median(others.map(x => perSeed[x].medFresh)) + ' = ' + totalGap);
const rows = [];
for (const c of allChannels) {
  const med9762 = perSeed[9762].medByChannel[c];
  const medOther = median(others.map(x => perSeed[x].medByChannel[c]));
  const gap = med9762 - medOther;
  const share = totalGap ? gap / totalGap : null;
  const pres = perSeed[9762].presence[c];
  const presentAcross = pres.resShare >= 0.8 && pres.days >= 50;
  rows.push({ channel: c, med9762, medOther, gap, share, pres, presentAcross });
}
rows.sort((a, b) => b.gap - a.gap);
console.log('channel decomposition (median-based, primary):');
for (const r of rows) {
  console.log('  ' + JSON.stringify(r.channel) + ': med9762 ' + r.med9762 + ' medOther ' + r.medOther + ' gap ' + r.gap + ' share ' + (r.share == null ? 'n/a' : (100 * r.share).toFixed(1) + '%') + ' presence9762 ' + r.pres.res + '/' + perSeed[9762].engaged + ' (' + pct(r.pres.res, perSeed[9762].engaged) + '), ' + r.pres.days + ' days, presentAcross=' + r.presentAcross);
}
const residual = 1 - rows.reduce((a, r) => a + (r.share || 0), 0);
console.log('median residual (1 - sum of shares): ' + (100 * residual).toFixed(1) + '%');

// GO legs.
const leg1 = reproExact;
const leg2 = rebuildChecked > 0 && rebuildOk / rebuildChecked >= 0.99;
let bestSingle = null, bestSet = null;
for (const r of rows) if (r.presentAcross && (bestSingle === null || r.share > bestSingle.share)) bestSingle = r;
const presentRows = rows.filter(r => r.presentAcross && r.share >= 0.10).sort((a, b) => b.share - a.share);
let setShare = 0; const setMembers = [];
for (const r of presentRows.slice(0, 3)) { setShare += r.share; setMembers.push(r.channel); }
bestSet = { members: setMembers, share: setShare };
const leg3single = bestSingle && bestSingle.share >= 0.5;
const leg3set = setMembers.length >= 1 && setShare >= 0.5;
const leg3 = !!(leg3single || leg3set);
console.log('\nGO legs: (1) reproduction exact = ' + leg1 + '; (2) rebuild >= 99% = ' + leg2 + ' (' + pct(rebuildOk, rebuildChecked) + '); (3) channel cover >= 50% present-across = ' + leg3 +
  ' (best single: ' + JSON.stringify(bestSingle && bestSingle.channel) + ' ' + (bestSingle ? (100 * bestSingle.share).toFixed(1) + '%' : 'n/a') +
  '; best set <=3 @>=10% each: ' + JSON.stringify(setMembers) + ' ' + (100 * setShare).toFixed(1) + '%)');
console.log('VERDICT: ' + (leg1 && leg2 && leg3 ? 'GO' : 'NO-GO') + (leg1 && leg2 && leg3 ? '' : ' (failing legs: ' + [!leg1 ? '1-reproduction' : null, !leg2 ? '2-rebuild' : null, !leg3 ? '3-channel-cover' : null].filter(Boolean).join(', ') + ')'));

// Secondaries: mean decomposition (channel means only; total mean fresh
// is not stored per seed, so no mean total-gap is computed here).
console.log('\nsecondary — mean decomposition:');
{
  const meanRows = [];
  for (const c of allChannels) {
    const m9762 = perSeed[9762].meanByChannel[c];
    const mOther = mean(others.map(x => perSeed[x].meanByChannel[c]));
    meanRows.push({ channel: c, mean9762: Math.round(m9762), meanOther: Math.round(mOther), gap: Math.round(m9762 - mOther) });
  }
  meanRows.sort((a, b) => b.gap - a.gap);
  for (const r of meanRows.slice(0, 12)) console.log('  ' + JSON.stringify(r.channel) + ': mean9762 ' + r.mean9762 + ' meanOther ' + r.meanOther + ' gap ' + r.gap);
}

// Secondaries: inflow decomposition (this run's inflows, flows not stocks).
console.log('\nsecondary — cumulative inflow totals by door x name (this run, kcal>0, pantryAdd only when added):');
for (const s of seeds) {
  const byDoor = {}, byName = {};
  for (const inf of (s.inflows || [])) {
    if (inf.kcal <= 0) continue;
    if (inf.door === 'pantryAdd' && !inf.added) continue;
    byDoor[inf.door] = (byDoor[inf.door] || 0) + inf.kcal;
    byName[inf.name] = (byName[inf.name] || 0) + inf.kcal;
  }
  const top = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(' seed ' + s.seed + ': doors ' + JSON.stringify(byDoor) + ' total ' + Object.values(byDoor).reduce((a, b) => a + b, 0) + ' topNames ' + JSON.stringify(top));
}

// Garden-harvest check + 9762 presence table.
console.log('\nsecondary — Garden harvest channel: ' + ('Garden harvest' in perSeed[9762].medByChannel
  ? ('med9762 ' + perSeed[9762].medByChannel['Garden harvest'] + ', other-seed medians ' + JSON.stringify(others.map(x => perSeed[x].medByChannel['Garden harvest'])) + '; presence9762 ' + JSON.stringify(perSeed[9762].presence['Garden harvest']))
  : 'ABSENT from every pantry snapshot on every seed (no Garden harvest bucket exists anywhere; consistent with ripe == 0 on all 800 seed-days)'));
console.log('\nsecondary — 9762 presence table (engaged resolutions):');
for (const r of rows) console.log('  ' + JSON.stringify(r.channel) + ': ' + r.pres.res + '/' + perSeed[9762].engaged + ' (' + pct(r.pres.res, perSeed[9762].engaged) + '), ' + r.pres.days + ' days, medWhenPresent n/a (median over all engaged = ' + r.med9762 + ')');

// Wall numbers.
wall.survival.sort((a, b) => a - b);
console.log('\nwall: national ' + wall.national + '/8, table ' + wall.table + '/8, wins ' + wall.wins + '/8, wave4 ' + wall.wave4 + '/8, wave5 ' + wall.wave5 + '/8, median survival ' + median(wall.survival) + 'd, deaths ' + wall.deaths + ', causes ' + JSON.stringify(deathCauses));
console.log('wave reach per seed: ' + seeds.map(s => s.seed + ':' + (s.waveReach || []).join(',')).join(' '));
