#!/usr/bin/env node
// analyze-lqpersist-b.js — post-arrival persistence analyzer (sim-lqpersist-b).
//
// Judges ONLY the pre-registration in
// evidence/2026-10-26/sim-lqpersist-b-prereg.md:
//   pilot GO iff (1) control reproduction exact (761/750/11/3167/32/235),
//   (2) snapshot rebuild >= 99% + throttle flags agree >= 99%,
//   (3) Lamb's Quarters on seed 9762 present on >= 80% of its
//   POST-ARRIVAL engaged resolutions (day >= first-appearance day).
//   The band-start measure is reported alongside, never judged.
// Mechanism: exactly one of SPOIL-TIMING / MEAL-DRAW-ORDER /
// DEPOSIT-FREQUENCY passes its bar, else UNDISTINGUISHED.
//   A: median LQ horizon >= 2.0x pooled comparator median horizon.
//   B: median LQ slab share >= 0.50 AND LQ draw share <= 0.50x stock share.
//   C: LQ deposit-day coverage >= 0.60 AND both comparators < 0.40.
// Comparators (fixed): Cattail on 9761, Burdock on 9760.
// Median rule: conventional median (average of two middle values).
//
// Usage:
//   node scripts/analyze-lqpersist-b.js [corpus-dir] pilot
//   node scripts/analyze-lqpersist-b.js [corpus-dir] confirm <MECHANISM|NONE>
// Exit 0 always (verdict lines carry GO/NO-GO, MECHANISM, CONFIRM).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-lqpersist-b-corpus');
const MODE = process.argv[3] || 'pilot';
const PILOT_MECH = process.argv[4] || 'NONE';
const EXPECT = { resolutions: 761, engaged: 750, npcSows: 11, keeperTurns: 3167, beds: 32, playerSows: 235 };
const LQ = "Lamb's Quarters";
const COMP = [{ seed: 9761, channel: 'Cattail' }, { seed: 9760, channel: 'Burdock' }];

function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : 'n/a'; }
function median(xs) {
  const v = xs.filter(x => x != null && isFinite(x));
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function mean(xs) { const v = xs.filter(x => x != null && isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
function stockFresh(rec, channel) {
  const b = (rec.buckets || []).find(x => x.channel === channel);
  return b ? b.freshKcal : 0;
}
function lqChan(rec, channel) {
  return (rec.channels || []).find(x => x.channel === channel) || null;
}
function fmt(x, digits) {
  if (x == null || !isFinite(x)) return 'n/a';
  return digits != null ? x.toFixed(digits) : String(Math.round(x * 100) / 100);
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const bySeed = {};
for (const s of seeds) bySeed[s.seed] = s;

// ---- shared per-seed structures ----
function engagedStock(s) {
  return ((s.stockEvents && s.stockEvents.resolutions) || []).filter(r => r.throttle === true);
}
function engagedLq(s) {
  return ((s.lqEvents && s.lqEvents.resolutions) || []).filter(r => r.throttle === true);
}
function firstAppearance(eng, channel) {
  for (const r of eng) if (stockFresh(r, channel) > 0) return r.day;
  return null;
}
function postArrival(eng, channel) {
  const fa = firstAppearance(eng, channel);
  if (fa == null) return { fa: null, res: [] };
  return { fa, res: eng.filter(r => r.day >= fa) };
}
function presenceOf(eng, channel) {
  let cnt = 0; const days = new Set();
  for (const r of eng) if (stockFresh(r, channel) > 0) { cnt++; days.add(r.day); }
  return { res: cnt, days: days.size, share: eng.length ? cnt / eng.length : 0 };
}
function depositStats(s, channel) {
  const evs = (s.inflows || []).filter(e => e.name === channel);
  if (!evs.length) return null;
  const days = [...new Set(evs.map(e => e.day))].sort((a, b) => a - b);
  const first = days[0], last = days[days.length - 1];
  const windowDays = last - first + 1;
  const coverage = windowDays ? days.length / windowDays : 0;
  const gaps = [];
  for (let i = 1; i < days.length; i++) gaps.push(days[i] - days[i - 1]);
  const byDoor = {};
  let totalKcal = 0;
  for (const e of evs) { byDoor[e.door] = (byDoor[e.door] || 0) + 1; totalKcal += (e.kcal || 0); }
  return { events: evs.length, days: days.length, first, last, windowDays, coverage,
    medianGap: median(gaps), maxGap: gaps.length ? Math.max(...gaps) : 0,
    totalKcal, byDoor, kcalPerEvent: mean(evs.map(e => e.kcal || 0)) };
}
function drawStats(s) {
  // Meal-context pantryDraw records only; channel kcal = sum units*effectiveKcal.
  const per = {};
  let total = 0, takenTotal = 0, itemSum = 0;
  for (const r of (s.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    if (r.context === 'other') continue;
    takenTotal += (r.taken || 0);
    for (const it of (r.items || [])) {
      const k = (it.units || 0) * (it.effectiveKcal || 0);
      itemSum += k; total += k;
      per[it.name] = (per[it.name] || 0) + k;
    }
  }
  return { per, total, takenTotal, itemSum };
}
function otherDrawStats(s) {
  const per = {};
  let total = 0;
  for (const r of (s.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    if (r.context !== 'other') continue;
    for (const it of (r.items || [])) {
      const k = (it.units || 0) * (it.effectiveKcal || 0);
      total += k; per[it.name] = (per[it.name] || 0) + k;
    }
  }
  return { per, total };
}
function spoiledDrawStats(s) {
  const per = {};
  let total = 0;
  for (const r of (s.mealDrawRecords || [])) {
    if (r.kind !== 'drawSpoiled') continue;
    total += (r.got || 0);
    for (const it of (r.items || [])) {
      const k = (it.units || 0) * (it.kcalEach || 0);
      per[it.name] = (per[it.name] || 0) + k;
    }
  }
  return { per, total };
}

// Per-channel post-arrival diagnostics on one seed (used by pilot + confirm).
function channelDiagnostics(s, channel) {
  const eng = engagedStock(s);
  const engLq = engagedLq(s);
  const pa = postArrival(eng, channel);
  if (pa.fa == null) return null;
  const paLq = engLq.filter(r => r.day >= pa.fa);
  const pres = presenceOf(pa.res, channel);
  const bandPres = presenceOf(eng, channel);
  const horizons = [];
  const slabShares = [];
  const spoiledShares = [];
  for (const r of paLq) {
    const c = lqChan(r, channel);
    if (!c) continue;
    if (c.freshKcal > 0) {
      if (c.horizonMed != null) horizons.push(c.horizonMed);
      slabShares.push(c.slabFreshKcal / c.freshKcal);
      if (c.freshKcal + c.spoiledKcal > 0) spoiledShares.push(c.spoiledKcal / (c.freshKcal + c.spoiledKcal));
    }
  }
  const medFresh = median(pa.res.map(r => stockFresh(r, channel)));
  const medTotal = median(pa.res.map(r => r.freshKcal));
  const draws = drawStats(s);
  const drawShare = draws.total ? (draws.per[channel] || 0) / draws.total : 0;
  const stockShare = medTotal ? medFresh / medTotal : 0;
  const dep = depositStats(s, channel);
  return { fa: pa.fa, postN: pa.res.length, pres, bandPres,
    medHorizon: median(horizons), medSlabShare: median(slabShares),
    medSpoiledShare: median(spoiledShares),
    medFresh, medTotal, drawKcal: draws.per[channel] || 0,
    drawShare, stockShare, dep, drawTotal: draws.total };
}

if (MODE === 'pilot') {
  // ---- control reproduction ----
  let rep = { resolutions: 0, engaged: 0, npcSows: 0, keeperTurns: 0, beds: 0, playerSows: 0 };
  let flagMismatch = 0, flagChecked = 0, rebuildOk = 0, rebuildChecked = 0;
  let lqFreshMismatch = 0, lqFreshChecked = 0;
  const rebuildBad = [];
  const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survival: [], deaths: 0 };
  const deathCauses = {};
  for (const s of seeds) {
    const gr = (s.gardenEvents && s.gardenEvents.resolutions) || [];
    const tr = (s.throttleEvents && s.throttleEvents.resolutions) || [];
    const sr = (s.stockEvents && s.stockEvents.resolutions) || [];
    const lr = (s.lqEvents && s.lqEvents.resolutions) || [];
    rep.resolutions += gr.length;
    rep.engaged += gr.filter(r => r.throttle === true).length;
    rep.npcSows += ((s.gardenEvents && s.gardenEvents.npcSows) || []).length;
    rep.keeperTurns += ((s.gardenEvents && s.gardenEvents.keeperTurns) || []).length;
    rep.beds += ((s.gardenEvents && s.gardenEvents.makes) || []).length;
    rep.playerSows += ((s.gardenEvents && s.gardenEvents.sows) || []).length;
    const n = Math.min(gr.length, tr.length, sr.length, lr.length);
    for (let i = 0; i < n; i++) {
      flagChecked++;
      if (gr[i].throttle !== tr[i].throttle || gr[i].throttle !== sr[i].throttle || gr[i].throttle !== lr[i].throttle) flagMismatch++;
    }
    if (gr.length !== sr.length || tr.length !== sr.length || lr.length !== sr.length)
      console.log('NOTE seed ' + s.seed + ': gardenRes ' + gr.length + ' throttleRes ' + tr.length + ' stockRes ' + sr.length + ' lqRes ' + lr.length);
    for (const r of sr) {
      if (r.freshKcal != null && r.freshRebuilt != null) {
        rebuildChecked++;
        if (r.freshRebuilt === r.freshKcal) rebuildOk++;
        else rebuildBad.push({ seed: s.seed, day: r.day, fresh: r.freshKcal, rebuilt: r.freshRebuilt });
      }
    }
    const m = Math.min(sr.length, lr.length);
    for (let i = 0; i < m; i++) {
      if (sr[i].freshKcal != null && lr[i].freshKcal != null) {
        lqFreshChecked++;
        if (sr[i].freshKcal !== lr[i].freshKcal) lqFreshMismatch++;
      }
    }
    if (s.national) wall.national++;
    if (s.table) wall.table++;
    if (s.win) wall.wins++;
    if ((s.waveReach || []).includes(4)) wall.wave4++;
    if ((s.waveReach || []).includes(5)) wall.wave5++;
    wall.survival.push(s.daysAlive);
    wall.deaths += s.deaths || 0;
    for (const [k, v] of Object.entries(s.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
  }
  const reproExact = rep.resolutions === EXPECT.resolutions && rep.engaged === EXPECT.engaged &&
    rep.npcSows === EXPECT.npcSows && rep.keeperTurns === EXPECT.keeperTurns &&
    rep.beds === EXPECT.beds && rep.playerSows === EXPECT.playerSows;
  const flagAgree = flagChecked ? 1 - flagMismatch / flagChecked : 0;
  const rebuildRate = rebuildChecked ? rebuildOk / rebuildChecked : 0;
  console.log('reproduction vs gardenbar: resolutions ' + rep.resolutions + ' (exp ' + EXPECT.resolutions + '), engaged ' + rep.engaged + ' (exp ' + EXPECT.engaged + '), npcSows ' + rep.npcSows + ' (exp ' + EXPECT.npcSows + '), keeperTurns ' + rep.keeperTurns + ' (exp ' + EXPECT.keeperTurns + '), beds ' + rep.beds + ' (exp ' + EXPECT.beds + '), playerSows ' + rep.playerSows + ' (exp ' + EXPECT.playerSows + ') => ' + (reproExact ? 'REPRODUCED' : 'FRESH BAND'));
  console.log('flag agreement (garden vs throttle vs stock vs lq): mismatches ' + flagMismatch + ' / ' + flagChecked + ' = ' + pct(flagChecked - flagMismatch, flagChecked));
  console.log('snapshot rebuild: freshRebuilt == freshKcal on ' + rebuildOk + ' / ' + rebuildChecked + ' = ' + pct(rebuildOk, rebuildChecked));
  if (rebuildBad.length) console.log('rebuild mismatches (first 10): ' + JSON.stringify(rebuildBad.slice(0, 10)));
  console.log('lq freshKcal cross-check (lq vs stock): mismatches ' + lqFreshMismatch + ' / ' + lqFreshChecked);

  // ---- 1930Z decomposition reproduction (comparability only) ----
  const s9762 = bySeed[9762];
  const eng9762 = engagedStock(s9762);
  const others = seeds.map(s => s.seed).filter(x => x !== 9762);
  const allChannels = new Set();
  for (const s of seeds) for (const r of engagedStock(s)) for (const b of (r.buckets || [])) allChannels.add(b.channel);
  const medBySeedChannel = {};
  for (const s of seeds) {
    const eng = engagedStock(s);
    medBySeedChannel[s.seed] = {};
    for (const c of allChannels) medBySeedChannel[s.seed][c] = median(eng.map(r => stockFresh(r, c)));
  }
  const medFresh9762 = median(eng9762.map(r => r.freshKcal));
  const totalGap = medFresh9762 - median(others.map(x => median(engagedStock(bySeed[x]).map(r => r.freshKcal))));
  console.log('\ndecomposition reproduction: medFresh[9762] ' + medFresh9762 + ', totalGap ' + totalGap);
  for (const c of [...allChannels].sort()) {
    const m9762 = medBySeedChannel[9762][c];
    const mOther = median(others.map(x => medBySeedChannel[x][c]));
    const gap = m9762 - mOther;
    if (Math.abs(gap) < 500) continue;
    console.log('  ' + JSON.stringify(c) + ': med9762 ' + m9762 + ' medOther ' + mOther + ' gap ' + gap + ' share ' + (totalGap ? (100 * gap / totalGap).toFixed(1) + '%' : 'n/a'));
  }

  // ---- PRIMARY: post-arrival persistence ----
  const lqDiag = channelDiagnostics(s9762, LQ);
  console.log('\nLQ on 9762: first appearance day ' + lqDiag.fa + ', post-arrival engaged ' + lqDiag.postN +
    ', present ' + lqDiag.pres.res + ' (' + pct(lqDiag.pres.res, lqDiag.postN) + '), band-start present ' +
    lqDiag.bandPres.res + '/' + eng9762.length + ' (' + pct(lqDiag.bandPres.res, eng9762.length) + ')');
  const leg1 = reproExact;
  const leg2 = rebuildRate >= 0.99 && flagAgree >= 0.99;
  const leg3 = lqDiag.pres.share >= 0.80;
  console.log('GO legs: (1) reproduction exact = ' + leg1 + '; (2) rebuild >= 99% + flags agree >= 99% = ' + leg2 +
    ' (rebuild ' + pct(rebuildOk, rebuildChecked) + ', flags ' + pct(flagChecked - flagMismatch, flagChecked) + '); (3) post-arrival presence >= 80% = ' + leg3 +
    ' (' + pct(lqDiag.pres.res, lqDiag.postN) + ')');
  console.log('VERDICT: ' + (leg1 && leg2 && leg3 ? 'GO' : 'NO-GO') +
    (leg1 && leg2 && leg3 ? '' : ' (failing legs: ' + [!leg1 ? '1-reproduction' : null, !leg2 ? '2-rebuild/flags' : null, !leg3 ? '3-post-arrival' : null].filter(Boolean).join(', ') + ')'));

  // ---- mechanism diagnostics ----
  console.log('\nmechanism diagnostics (seed 9762 LQ vs comparators):');
  const compDiags = COMP.map(c => {
    const s = bySeed[c.seed];
    const d = channelDiagnostics(s, c.channel);
    console.log('  comparator ' + JSON.stringify(c.channel) + ' on ' + c.seed + ': first appearance day ' + d.fa +
      ', post-arrival engaged ' + d.postN + ', present ' + d.pres.res + ' (' + pct(d.pres.res, d.postN) + ')' +
      ', medHorizon ' + fmt(d.medHorizon) + ', medSlabShare ' + fmt(d.medSlabShare, 3) +
      ', medSpoiledShare ' + fmt(d.medSpoiledShare, 3) + ', medFresh ' + d.medFresh +
      ', drawShare ' + fmt(d.drawShare, 3) + ', stockShare ' + fmt(d.stockShare, 3) +
      ', depCoverage ' + (d.dep ? fmt(d.dep.coverage, 3) : 'n/a') + ' (events ' + (d.dep ? d.dep.events : 0) +
      ', window ' + (d.dep ? d.dep.first + '-' + d.dep.last : 'n/a') + ', medianGap ' + (d.dep ? fmt(d.dep.medianGap) : 'n/a') + ')');
    return d;
  });
  // Pooled comparator horizon: per-resolution horizonMed values where channel fresh > 0.
  const pooledHorizons = [];
  for (const c of COMP) {
    const s = bySeed[c.seed];
    for (const r of engagedLq(s)) {
      const ch = lqChan(r, c.channel);
      if (ch && ch.freshKcal > 0 && ch.horizonMed != null) pooledHorizons.push(ch.horizonMed);
    }
  }
  const pooledMedHorizon = median(pooledHorizons);
  console.log('  pooled comparator median horizon (per-resolution horizonMed, fresh>0): ' + fmt(pooledMedHorizon) + ' over ' + pooledHorizons.length + ' resolutions');
  console.log('  LQ: medHorizon ' + fmt(lqDiag.medHorizon) + ', medSlabShare ' + fmt(lqDiag.medSlabShare, 3) +
    ', medSpoiledShare ' + fmt(lqDiag.medSpoiledShare, 3) + ', medFresh ' + lqDiag.medFresh + ', medTotal ' + lqDiag.medTotal +
    ', drawKcal ' + lqDiag.drawKcal + ' / ' + lqDiag.drawTotal + ' (drawShare ' + fmt(lqDiag.drawShare, 3) +
    ', stockShare ' + fmt(lqDiag.stockShare, 3) + ', ratio ' + fmt(lqDiag.stockShare ? lqDiag.drawShare / lqDiag.stockShare : null, 3) + ')' +
    ', depCoverage ' + (lqDiag.dep ? fmt(lqDiag.dep.coverage, 3) : 'n/a') + ' (events ' + (lqDiag.dep ? lqDiag.dep.events : 0) +
    ', window ' + (lqDiag.dep ? lqDiag.dep.first + '-' + lqDiag.dep.last : 'n/a') + ', medianGap ' + (lqDiag.dep ? fmt(lqDiag.dep.medianGap) : 'n/a') +
    ', totalKcal ' + (lqDiag.dep ? lqDiag.dep.totalKcal : 0) + ', doors ' + JSON.stringify(lqDiag.dep ? lqDiag.dep.byDoor : {}) +
    ', kcalPerEvent ' + (lqDiag.dep ? fmt(lqDiag.dep.kcalPerEvent) : 'n/a') + ')');
  const barA = lqDiag.medHorizon != null && pooledMedHorizon != null && lqDiag.medHorizon >= 2.0 * pooledMedHorizon;
  const barB = lqDiag.medSlabShare != null && lqDiag.medSlabShare >= 0.50 &&
    lqDiag.stockShare > 0 && lqDiag.drawShare <= 0.50 * lqDiag.stockShare;
  const barC = lqDiag.dep && lqDiag.dep.coverage >= 0.60 &&
    compDiags.every(d => d.dep && d.dep.coverage < 0.40);
  console.log('  bar A (spoil timing, horizon >= 2.0x pooled): ' + barA +
    ' (' + fmt(lqDiag.medHorizon) + ' vs 2.0x ' + fmt(pooledMedHorizon) + ' = ' + fmt(pooledMedHorizon != null ? 2.0 * pooledMedHorizon : null) + ')');
  console.log('  bar B (draw order, slabShare >= 0.50 AND drawShare <= 0.50x stockShare): ' + barB +
    ' (slabShare ' + fmt(lqDiag.medSlabShare, 3) + ', drawShare ' + fmt(lqDiag.drawShare, 3) + ' vs 0.50x stockShare ' + fmt(lqDiag.stockShare ? 0.50 * lqDiag.stockShare : null, 3) + ')');
  console.log('  bar C (deposit frequency, LQ coverage >= 0.60 AND both comparators < 0.40): ' + barC +
    ' (LQ ' + fmt(lqDiag.dep ? lqDiag.dep.coverage : null, 3) + ' vs comparators ' + compDiags.map(d => fmt(d.dep ? d.dep.coverage : null, 3)).join(', ') + ')');
  const passed = ['SPOIL-TIMING', 'MEAL-DRAW-ORDER', 'DEPOSIT-FREQUENCY'].filter((_, i) => [barA, barB, barC][i]);
  const mechanism = passed.length === 1 ? passed[0] : 'UNDISTINGUISHED';
  console.log('MECHANISM: ' + mechanism + ' (bars passed: ' + (passed.length ? passed.join(', ') : 'none') + ')');

  // ---- draw cross-checks + spoiled draws ----
  const draws9762 = drawStats(s9762);
  const other9762 = otherDrawStats(s9762);
  const spoiled9762 = spoiledDrawStats(s9762);
  console.log('\ndraw cross-checks (seed 9762): meal-context item-sum ' + draws9762.itemSum + ' vs taken-sum ' + draws9762.takenTotal +
    '; other-context drawn ' + other9762.total + ' (channels: ' + JSON.stringify(other9762.per) + ')' +
    '; drawSpoiled total got ' + spoiled9762.total + ' (channels: ' + JSON.stringify(spoiled9762.per) + ')');
  const mealCalls = (s9762.mealDrawRecords || []).filter(r => r.kind === 'mealCall');
  let anchorOk = 0, anchorChecked = 0;
  for (const m of mealCalls) {
    if (m.context === 'villager-home' && m.ret && m.ret.drawn != null) {
      anchorChecked++;
      if (m.freshTaken + m.spoiledGot === m.ret.drawn) anchorOk++;
    }
  }
  console.log('mealCall anchor (villager-home freshTaken+spoiledGot == drawn): ' + anchorOk + ' / ' + anchorChecked);
  console.log('mealdraw truncated: ' + s9762.mealdrawTruncated + '; inflow truncated: ' + s9762.inflowTruncated);

  // ---- sense block: 9762 days 20-45 ----
  console.log('\nsense block (seed 9762, day-end LQ fresh + LQ deposits + LQ meal-drawn per day):');
  const depByDay = {};
  for (const e of (s9762.inflows || []).filter(x => x.name === LQ)) depByDay[e.day] = (depByDay[e.day] || 0) + (e.kcal || 0);
  const drawByDay = {};
  for (const r of (s9762.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' || r.context === 'other') continue;
    for (const it of (r.items || [])) if (it.name === LQ) drawByDay[r.day] = (drawByDay[r.day] || 0) + (it.units || 0) * (it.effectiveKcal || 0);
  }
  for (const d of (s9762.stockDays || [])) {
    if (d.day < 20 || d.day > 45) continue;
    const b = (d.buckets || []).find(x => x.channel === LQ);
    console.log('  day ' + d.day + ': dayEndFresh ' + d.freshKcal + ', LQ fresh ' + (b ? b.freshKcal : 0) +
      ', LQ deposits ' + (depByDay[d.day] || 0) + ', LQ meal-drawn ' + (drawByDay[d.day] || 0));
  }
  console.log('garden say lines (seed 9762, harvest-can-wait + raid lines):');
  for (const l of ((s9762.gardenEvents && s9762.gardenEvents.sayLines) || [])) {
    if (/harvest can wait|Raid|trampled/i.test(l.line)) console.log('  day ' + l.day + ': ' + l.line.slice(0, 200));
  }

  // ---- wall ----
  console.log('\nwall: national ' + wall.national + '/' + seeds.length + ', table ' + wall.table + '/' + seeds.length +
    ', wins ' + wall.wins + '/' + seeds.length + ', wave4 ' + wall.wave4 + '/' + seeds.length + ', wave5 ' + wall.wave5 + '/' + seeds.length +
    ', median survival ' + median(wall.survival) + 'd, deaths ' + wall.deaths + ' ' + JSON.stringify(deathCauses));
  for (const s of seeds) console.log('  seed ' + s.seed + ': daysAlive ' + s.daysAlive + ', waveReach ' + JSON.stringify(s.waveReach) + ', rank ' + s.rank + ', deaths ' + s.deaths);
} else if (MODE === 'confirm') {
  // ---- confirm band: qualifying channels + mechanism agreement ----
  const quals = [];
  for (const s of seeds) {
    const eng = engagedStock(s);
    const medTotal = median(eng.map(r => r.freshKcal));
    const channels = new Set();
    for (const r of eng) for (const b of (r.buckets || [])) channels.add(b.channel);
    for (const c of channels) {
      const medFresh = median(eng.map(r => stockFresh(r, c)));
      if (!medTotal || medFresh < 0.10 * medTotal) continue;
      const d = channelDiagnostics(s, c);
      if (!d || d.fa == null || d.fa < 10) continue;
      quals.push({ seed: s.seed, channel: c, d });
    }
  }
  console.log('confirm qualifying channels (median share >= 10%, first appearance day >= 10): ' + quals.length);
  for (const q of quals) {
    const d = q.d;
    // Other qualifying channels on the same seed (for bar C(ii)).
    const sameSeedOthers = quals.filter(x => x.seed === q.seed && x.channel !== q.channel);
    // Pooled horizon of other channels' resolutions on the same seed (fresh>0).
    const s = bySeed[q.seed];
    const pooledOther = [];
    const otherChannels = new Set();
    for (const r of engagedLq(s)) for (const ch of (r.channels || [])) if (ch.channel !== q.channel) otherChannels.add(ch.channel);
    for (const r of engagedLq(s)) {
      for (const ch of (r.channels || [])) {
        if (ch.channel === q.channel) continue;
        if (ch.freshKcal > 0 && ch.horizonMed != null) pooledOther.push(ch.horizonMed);
      }
    }
    const pooledOtherMed = median(pooledOther);
    const barA = d.medHorizon != null && pooledOtherMed != null && d.medHorizon >= 2.0 * pooledOtherMed;
    const barB = d.medSlabShare != null && d.medSlabShare >= 0.50 && d.stockShare > 0 && d.drawShare <= 0.50 * d.stockShare;
    const barC = d.dep && d.dep.coverage >= 0.60 && sameSeedOthers.length > 0 &&
      sameSeedOthers.every(x => x.d.dep && x.d.dep.coverage < 0.40);
    q.bars = { A: barA, B: barB, C: barC };
    q.persistPass = d.pres.share >= 0.80;
    console.log('  seed ' + q.seed + ' ' + JSON.stringify(q.channel) + ': fa day ' + d.fa + ', postN ' + d.postN +
      ', present ' + d.pres.res + ' (' + pct(d.pres.res, d.postN) + ')' +
      ', medHorizon ' + fmt(d.medHorizon) + ' (pooledOther ' + fmt(pooledOtherMed) + ') => A=' + barA +
      ', slabShare ' + fmt(d.medSlabShare, 3) + ', drawShare ' + fmt(d.drawShare, 3) + ' vs 0.50x stockShare ' + fmt(d.stockShare ? 0.50 * d.stockShare : null, 3) + ' => B=' + barB +
      ', depCoverage ' + fmt(d.dep ? d.dep.coverage : null, 3) + ' (others ' + sameSeedOthers.map(x => fmt(x.d.dep ? x.d.dep.coverage : null, 3)).join(', ') + ') => C=' + barC);
  }
  if (PILOT_MECH === 'NONE' || PILOT_MECH === 'UNDISTINGUISHED') {
    console.log('CONFIRM: DIAG (pilot named no mechanism; distribution above only)');
  } else {
    const barKey = PILOT_MECH === 'SPOIL-TIMING' ? 'A' : PILOT_MECH === 'MEAL-DRAW-ORDER' ? 'B' : 'C';
    let agree = 0;
    for (const q of quals) if (q.bars[barKey] === q.persistPass) agree++;
    if (quals.length < 4) {
      console.log('CONFIRM: DIAG (only ' + quals.length + ' qualifying channels, need >= 4 to judge; agreement ' + agree + '/' + quals.length + ')');
    } else {
      const rate = agree / quals.length;
      console.log('CONFIRM: ' + (rate >= 0.75 ? 'PASS' : 'FAIL') + ' (mechanism ' + PILOT_MECH + ' bar ' + barKey + ' agrees with persistence>=80% on ' + agree + '/' + quals.length + ' = ' + pct(agree, quals.length) + ')');
    }
  }
  const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survival: [], deaths: 0 };
  const deathCauses = {};
  for (const s of seeds) {
    if (s.national) wall.national++;
    if (s.table) wall.table++;
    if (s.win) wall.wins++;
    if ((s.waveReach || []).includes(4)) wall.wave4++;
    if ((s.waveReach || []).includes(5)) wall.wave5++;
    wall.survival.push(s.daysAlive);
    wall.deaths += s.deaths || 0;
    for (const [k, v] of Object.entries(s.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
  }
  console.log('confirm wall: national ' + wall.national + '/' + seeds.length + ', table ' + wall.table + '/' + seeds.length +
    ', wins ' + wall.wins + '/' + seeds.length + ', wave4 ' + wall.wave4 + '/' + seeds.length + ', wave5 ' + wall.wave5 + '/' + seeds.length +
    ', median survival ' + median(wall.survival) + 'd, deaths ' + wall.deaths + ' ' + JSON.stringify(deathCauses));
  for (const s of seeds) console.log('  seed ' + s.seed + ': daysAlive ' + s.daysAlive + ', waveReach ' + JSON.stringify(s.waveReach) + ', rank ' + s.rank + ', deaths ' + s.deaths);
} else {
  console.error('FATAL: mode must be pilot or confirm');
  process.exit(2);
}
