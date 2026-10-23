#!/usr/bin/env node
// defer4transfer-analyze.js — the judge for sim-defer4-transfer (flesh-out
// loop arm sim-defer4-transfer, axis scale-onramp, run fleshout-20261023T2015Z).
// Reads the 48 per-seed JSONs
// (evidence/2026-10-23/perseed-defer4transfer/{control,formed}/) and judges
// the pre-registered bars:
//
// DIAG-GO (binding, §14): >=90% of configs where w5gates-lib attribute()
//   binds defer4 get a NAMED veterans-bar attribution from exactly:
//   formed-a-w3+-killer-and-lived / formed-and-died /
//   never-formed-any-w3+-killer / formation-does-not-stage-below-wave-4.
//   A miss is insufficient-data, not a failure — this is a DIAG.
// TRANSFER SIGNAL (reported, not judged): configs with barRelease4.veterans
//   released, formed vs control; defer4 binding counts formed vs control;
//   wave-3+ killer formation counts formed vs control.
// GUARDRAILS: median survival paired diff >= -15d; starvation <= control+2;
//   no new death kinds (>=2-event rule); wall block (national/table/wins,
//   wave4/5, median survival) both arms.
//
// Usage: node scripts/defer4transfer-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-defer4transfer');

const CHANNELS = [
  'formed-a-w3+-killer-and-lived',
  'formed-and-died',
  'never-formed-any-w3+-killer',
  'formation-does-not-stage-below-wave-4',
];
const LIVED_DAYS = 14; // post-kill life that makes a veteran count

function load(arm) {
  const d = path.join(DIR, arm);
  const out = [];
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
  }
  return out;
}
// Backlog #844: dedupe waveKillLog on (d, mid, by, via, trick) — the engine
// double-writes (recordWaveKill + recordPyrrhicKill on lost fights), symmetric
// across arms; distinct-vid counts are verdict-neutral, event counts are not.
function dedupKills(r) {
  const seen = new Set(), out = [];
  for (const e of (r.waveKillLog || [])) {
    const k = [(e.d | 0), String(e.mid), String(e.by), String(e.via), String(e.trick)].join('|');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function bindingOf(r) {
  try { return (r.gateVector && r.gateVector.attr && r.gateVector.attr.binding) || null; } catch (e) { return null; }
}
function defer4Detail(r) {
  try {
    const g = (r.gateVector && r.gateVector.attr && r.gateVector.attr.gates) || [];
    const d4 = g.find(g => g.id === 'defer4');
    return (d4 && d4.detail) || null;
  } catch (e) { return null; }
}

// The channel decision procedure for a defer4-binding config. Mutually
// exclusive; every config lands somewhere (gaps are named, not hidden).
function channelOf(r) {
  const gv = r.gateVector;
  if (!gv || !gv.attr) return { channel: 'no-gate-vector', note: 'gateVector read failed' };
  const det = defer4Detail(r);
  const short = (det && det.short) || [];
  if (short.indexOf('veterans') < 0) {
    return { channel: 'other-short-bar', note: 'defer4 binds but veterans not short: ' + short.join(',') };
  }
  const kills = dedupKills(r).filter(e => (e.w | 0) >= 3);
  if (!kills.length) return { channel: 'never-formed-any-w3+-killer', note: 'zero wave-3+ kill events' };
  const w4kills = kills.filter(e => (e.w | 0) >= 4);
  if (!w4kills.length) {
    // Every wave-3+ kill happened below wave 4 — the formation layer stages
    // and finishes on wave-4+ threats; below wave 4 it is inert by design.
    return { channel: 'formation-does-not-stage-below-wave-4', note: kills.length + ' wave-3 kills, zero wave-4+ kills' };
  }
  // At least one wave-4+ kill: did any killer live long enough to count?
  const endDay = (r.gameDays | 0) || 0;
  const byVid = {};
  for (const k of kills) {
    if (!k.by) continue;
    if (!byVid[k.by]) byVid[k.by] = { firstKill: k.d | 0, byName: k.byName };
    byVid[k.by].firstKill = Math.min(byVid[k.by].firstKill, k.d | 0);
  }
  const deaths = r.deathRows || [];
  let best = null;
  for (const vid of Object.keys(byVid)) {
    const rec = byVid[vid];
    let deathDay = null;
    for (const d of deaths) {
      if (String(d.who) === String(vid) || String(d.who) === String(rec.byName)) {
        if (deathDay == null || (d.day | 0) < deathDay) deathDay = d.day | 0;
      }
    }
    const lived = (deathDay == null ? endDay : deathDay) - rec.firstKill;
    if (!best || lived > best.lived) best = { vid, byName: rec.byName, firstKill: rec.firstKill, deathDay, lived };
  }
  if (best && best.lived >= LIVED_DAYS) {
    return {
      channel: 'formed-a-w3+-killer-and-lived',
      note: `${best.byName || best.vid} killed d${best.firstKill}, lived ${best.lived}d post-kill${best.deathDay == null ? ' (alive at end)' : ' (died d' + best.deathDay + ')'}`,
      best,
    };
  }
  return {
    channel: 'formed-and-died',
    note: best ? `${best.byName || best.vid} killed d${best.firstKill}, lived ${best.lived}d post-kill` : 'killers unresolvable',
    best,
  };
}

const C = load('control'), F = load('formed');
const key = (r) => r.seed + '|' + r.base;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = F.map(f => ({ f, c: cMap.get(key(f)) })).filter(p => p.c);
console.log(`configs: control=${C.length} formed=${F.length} pairs=${pairs.length}`);

let anchorBad = 0;
const anchors = new Set();
for (const r of C.concat(F)) { if (!r.anchorCommit || r.anchorCommit === 'unknown') anchorBad++; else anchors.add(r.anchorCommit); }
console.log(`anchor check: ${anchorBad} configs with missing anchor (anchors: ${[...anchors].join(',')})`);

// ---- DIAG-GO: defer4-binding configs, named veterans-bar attribution ----
const defer4Rows = [];
for (const r of C.concat(F)) {
  if (bindingOf(r) !== 'defer4') continue;
  const ch = channelOf(r);
  defer4Rows.push({
    seed: r.seed, base: r.base, arm: r.arm,
    short: ((defer4Detail(r) || {}).short || []).join(','),
    r4vets: (function () { try { return r.gateVector.r4.veterans; } catch (e) { return '?'; } })(),
    vetRelease: (r.barRelease4 && r.barRelease4.veterans != null) ? r.barRelease4.veterans : null,
    channel: ch.channel, note: ch.note,
  });
}
const named = defer4Rows.filter(r => CHANNELS.indexOf(r.channel) >= 0).length;
const goPct = defer4Rows.length ? (100 * named / defer4Rows.length) : 0;
console.log('\n== DIAG-GO (binding): defer4-binding configs with NAMED veterans-bar attribution ==');
console.log(`defer4-binding configs: ${defer4Rows.length} (control=${defer4Rows.filter(r => r.arm === 'control').length}, formed=${defer4Rows.filter(r => r.arm === 'formed').length})`);
console.log(`named: ${named}/${defer4Rows.length} = ${goPct.toFixed(1)}% (bar: >=90%)`);
for (const r of defer4Rows) {
  console.log(`  s${r.seed}-${r.base} [${r.arm}] short=[${r.short}] r4vets=${r.r4vets} vetRelease=${r.vetRelease} -> ${r.channel} (${r.note})`);
}
const chanCounts = {};
for (const r of defer4Rows) chanCounts[r.channel] = (chanCounts[r.channel] || 0) + 1;
console.log('channel counts:', JSON.stringify(chanCounts));
console.log(goPct >= 90 ? 'DIAG-GO: PASS (>=90% named)' : 'DIAG-GO: insufficient-data (<90% named)');

// ---- TRANSFER SIGNAL (reported, not judged) ----
const sig = (rows) => ({
  n: rows.length,
  vetReleased: rows.filter(r => r.barRelease4 && r.barRelease4.veterans != null).length,
  defer4: rows.filter(r => bindingOf(r) === 'defer4').length,
  w3vids: new Set(rows.flatMap(r => dedupKills(r).filter(e => (e.w | 0) >= 3 && e.by).map(e => String(e.by)))).size,
  w3kills: rows.reduce((t, r) => t + dedupKills(r).filter(e => (e.w | 0) >= 3).length, 0),
  cfgsWithW3Kill: rows.filter(r => dedupKills(r).some(e => (e.w | 0) >= 3)).length,
});
const sC = sig(C), sF = sig(F);
console.log('\n== TRANSFER SIGNAL (reported) ==');
console.log(`barRelease4.veterans released: control=${sC.vetReleased}/${sC.n} formed=${sF.vetReleased}/${sF.n}`);
console.log(`defer4 binding: control=${sC.defer4}/${sC.n} formed=${sF.defer4}/${sF.n}`);
console.log(`distinct wave-3+ killer vids: control=${sC.w3vids} formed=${sF.w3vids}`);
console.log(`wave-3+ kill events (deduped): control=${sC.w3kills} formed=${sF.w3kills}`);
console.log(`configs with >=1 wave-3+ kill: control=${sC.cfgsWithW3Kill}/${sC.n} formed=${sF.cfgsWithW3Kill}/${sF.n}`);

// ---- GUARDRAILS ----
const survDiffs = pairs.map(p => ((p.f.gameDays | 0) || 0) - ((p.c.gameDays | 0) || 0));
const medDiff = median(survDiffs);
const starvC = C.reduce((t, r) => t + (r.starvation | 0), 0);
const starvF = F.reduce((t, r) => t + (r.starvation | 0), 0);
const kindsC = new Set(), kindsF = {}, kindsFC = {};
for (const r of C) for (const k of Object.keys(r.deaths || {})) kindsC.add(k);
for (const r of F) for (const [k, n] of Object.entries(r.deaths || {})) { kindsF[k] = (kindsF[k] || 0) + n; }
for (const r of C) for (const [k, n] of Object.entries(r.deaths || {})) { kindsFC[k] = (kindsFC[k] || 0) + n; }
const newKinds = Object.keys(kindsF).filter(k => !kindsC.has(k) && kindsF[k] >= 2);
console.log('\n== GUARDRAILS ==');
console.log(`median survival paired diff: ${medDiff.toFixed(1)}d (bar >= -15d) ${medDiff >= -15 ? 'PASS' : 'FAIL'}`);
console.log(`starvation: control=${starvC} formed=${starvF} (bar <= control+2) ${starvF <= starvC + 2 ? 'PASS' : 'FAIL'}`);
console.log(`new death kinds (>=2-event rule): ${newKinds.length ? JSON.stringify(newKinds) + ' FAIL' : 'none PASS'}`);

// ---- WALL (both arms) ----
const wall = (rows) => ({
  national: rows.filter(r => r.national).length + '/' + rows.length,
  table: rows.filter(r => r.table).length + '/' + rows.length,
  wins: rows.filter(r => r.won).length + '/' + rows.length,
  wave4: rows.filter(r => (r.maxWave | 0) >= 4).length + '/' + rows.length,
  wave5: rows.filter(r => (r.maxWave | 0) >= 5).length + '/' + rows.length,
  medSurv: median(rows.map(r => (r.gameDays | 0) || 0)).toFixed(1) + 'd',
  maxSurv: Math.max.apply(null, rows.map(r => (r.gameDays | 0) || 0)) + 'd',
});
console.log('\n== WALL ==');
console.log('control:', JSON.stringify(wall(C)));
console.log('formed: ', JSON.stringify(wall(F)));

// ---- SENSE FLAGS: formed configs with a wave-3+ killer living >=14d post-kill ----
console.log('\n== SENSE FLAGS (formed, w3+ killer lived >=14d post-kill) ==');
let senseN = 0;
for (const r of F) {
  const kills = dedupKills(r).filter(e => (e.w | 0) >= 3);
  if (!kills.length) continue;
  const endDay = (r.gameDays | 0) || 0;
  const byVid = {};
  for (const k of kills) {
    if (!k.by) continue;
    if (!byVid[k.by]) byVid[k.by] = { firstKill: k.d | 0, byName: k.byName, w: k.w | 0 };
    byVid[k.by].firstKill = Math.min(byVid[k.by].firstKill, k.d | 0);
  }
  for (const vid of Object.keys(byVid)) {
    const rec = byVid[vid];
    let deathDay = null;
    for (const d of (r.deathRows || [])) {
      if (String(d.who) === String(vid) || String(d.who) === String(rec.byName)) {
        if (deathDay == null || (d.day | 0) < deathDay) deathDay = d.day | 0;
      }
    }
    const lived = (deathDay == null ? endDay : deathDay) - rec.firstKill;
    if (lived >= LIVED_DAYS) {
      senseN++;
      console.log(`  s${r.seed}-${r.base}: ${rec.byName || vid} (w${rec.w}) killed d${rec.firstKill}, lived ${lived}d post-kill${deathDay == null ? ' (alive at end)' : ' (died d' + deathDay + ')'}, binding=${bindingOf(r)}, vetRelease=${r.barRelease4 && r.barRelease4.veterans}`);
    }
  }
}
console.log(senseN ? `SENSE REQUIRED: ${senseN} formed config-killer(s) — read the beats` : 'no sense-qualifying configs');
