#!/usr/bin/env node
// vet2-analyze-20261031.js — sim-vet2-a veterans-trajectory analyzer.
//
// Reads per-seed JSONs (scripts/vet2-sweep-20261031.js output, split by
// scripts/vet2-split-20261031.js) and derives, per seed, the veteran
// trajectory table the prereg requires: max living veterans, veterans
// at end, wave-4+ kills per villager KILL-TIME-keyed (scholar vs
// companion share separately), veteran deaths + replacement outcomes,
// first day with veterans>=2 vs win/table day — plus the four
// prereg cross-checks (snapshot-vs-rd counts, capture-vs-log,
// capture-vs-census, derived-vs-engine uw).
//
// Pure analysis of the corpus: no game loaded, no RNG, no writes
// except the analysis JSON (when run as a script).
'use strict';
const fs = require('fs');
const path = require('path');

const DEFER5 = [87115, 87123, 87132, 87134, 87135, 87137];
const W4FACED = [87120, 87121, 87126];
const KEY_SEEDS = DEFER5.concat(W4FACED);

function killKey(k) {
  return JSON.stringify([k.d, k.mid, k.w, k.by, k.via, (k.trick === undefined ? null : k.trick)]);
}
function dedupeKills(kills) {
  const seen = new Set(), out = [];
  let dupes = 0;
  for (const k of (kills || [])) {
    const key = killKey(k);
    if (seen.has(key)) { dupes++; continue; }
    seen.add(key); out.push(k);
  }
  return { kills: out, dupes };
}
function isCaptureScholar(k) {
  return k.by === 'player' || (k.by != null && k.scholarVid != null && k.by === k.scholarVid);
}
// scholarVidOfDay(vetRows, day, initial): latest daily scholar vid with
// row day <= kill day (daily-call order breaks ties); initial scholar
// vid covers days before the first daily row.
function scholarVidOfDay(vetRows, day, initial) {
  let cur = initial || null;
  for (const r of (vetRows || [])) {
    if ((r.day | 0) <= (day | 0)) cur = r.scholarVid || cur;
    else break;
  }
  return cur;
}
function firstDay(rows, pred) {
  for (const r of (rows || [])) { if (pred(r)) return r.day; }
  return null;
}
function nameForSeed(seedObj, vid) {
  for (const r of (seedObj.vetRows || [])) {
    if (r.names && r.names[vid]) return r.names[vid];
  }
  return String(vid || '?').slice(0, 14);
}

function analyzeSeed(s) {
  const rows = s.rows || [];
  const vetRows = s.vetRows || [];
  const ded = dedupeKills(s.kills || []);
  const kills = ded.kills;
  const w3kills = kills.filter(k => (k.w | 0) >= 3);
  const w4kills = kills.filter(k => (k.w | 0) >= 4);

  // Milestones from wavegate rows.
  const nationalDay = firstDay(rows, r => r.rank === 'national' || r.rank === 'global');
  const wave4Day = firstDay(rows, r => (r.uw | 0) >= 4);
  const wave5Day = firstDay(rows, r => (r.uw | 0) >= 5);
  const tableDay = firstDay(rows, r => r.tableWaiting || r.tableDone);
  const winDay = firstDay(rows, r => r.won);
  const w4facedDay = firstDay(rows, r => r.w4faced);

  // Living-vet trajectory from vet rows.
  let maxVet5 = 0, maxVet4 = 0, daysAtVet2 = 0;
  let firstVet2Day = null;
  for (const r of vetRows) {
    const n5 = (r.vet5 || []).length, n4 = (r.vet4 || []).length;
    if (n5 > maxVet5) maxVet5 = n5;
    if (n4 > maxVet4) maxVet4 = n4;
    if (n5 >= 2) { daysAtVet2++; if (firstVet2Day == null) firstVet2Day = r.day; }
  }
  const lastVet = vetRows.length ? vetRows[vetRows.length - 1] : null;
  const endVet5 = lastVet ? (lastVet.vet5 || []).slice() : [];
  const endVet4 = lastVet ? (lastVet.vet4 || []).slice() : [];
  const everVet5 = new Set(), everVet4 = new Set();
  for (const r of vetRows) { for (const v of (r.vet5 || [])) everVet5.add(v); for (const v of (r.vet4 || [])) everVet4.add(v); }

  // Veteran deaths: vid in the vet4 set on row i, absent on row i+1.
  // The log only grows, so a set can only shrink via the killer no
  // longer living (standing.js isLiving rule) — that is a death (or
  // disappearance, named as such if the name map cannot confirm).
  const deaths = [];
  for (let i = 0; i + 1 < vetRows.length; i++) {
    const prev = vetRows[i], next = vetRows[i + 1];
    const prevSet = new Set(prev.vet4 || []), nextSet = new Set(next.vet4 || []);
    for (const vid of prevSet) {
      if (nextSet.has(vid)) continue;
      const wasVet5 = (prev.vet5 || []).includes(vid);
      // Replacement scan: first later row with a NEW vid entering the
      // vet4 set (never in any earlier set), and vet5 recovery to >= 2.
      let replacedDay = null, replacedBy = null, vet2RecoveredDay = null;
      const seenBefore = new Set();
      for (let j = 0; j <= i; j++) for (const v of (vetRows[j].vet4 || [])) seenBefore.add(v);
      for (let j = i + 1; j < vetRows.length; j++) {
        const entering = (vetRows[j].vet4 || []).filter(v => !seenBefore.has(v));
        if (replacedDay == null && entering.length) { replacedDay = vetRows[j].day; replacedBy = entering.slice(); }
        if (vet2RecoveredDay == null && (vetRows[j].vet5 || []).length >= 2) vet2RecoveredDay = vetRows[j].day;
        for (const v of (vetRows[j].vet4 || [])) seenBefore.add(v);
        if (replacedDay != null && vet2RecoveredDay != null) break;
      }
      deaths.push({
        vid, name: nameForSeed(s, vid), lostDay: next.day,
        tier: wasVet5 ? 'vet5+vet4' : 'vet4',
        preDeathVet4Size: prevSet.size, preDeathVet5Size: (prev.vet5 || []).length,
        replacedDay, replacedBy, vet2RecoveredDay,
      });
    }
  }

  // Per-villager kill tables, kill-time-keyed.
  const perVillager = {};
  function ensureVillager(by) {
    if (!perVillager[by]) {
      perVillager[by] = {
        vid: by, name: nameForSeed(s, by),
        kills3: 0, kills4: 0, scholarKills4: 0, villagerKills4: 0,
        scholarKills3: 0, villagerKills3: 0,
        firstDay4: null, lastDay4: null, firstDay3: null, lastDay3: null,
      };
    }
    return perVillager[by];
  }
  for (const k of w3kills) {
    const v = ensureVillager(k.by);
    v.kills3++;
    if (isCaptureScholar(k)) v.scholarKills3++; else v.villagerKills3++;
    if (v.firstDay3 == null || k.d < v.firstDay3) v.firstDay3 = k.d;
    if (v.lastDay3 == null || k.d > v.lastDay3) v.lastDay3 = k.d;
  }
  for (const k of w4kills) {
    const v = ensureVillager(k.by);
    v.kills4++;
    if (isCaptureScholar(k)) v.scholarKills4++; else v.villagerKills4++;
    if (v.firstDay4 == null || k.d < v.firstDay4) v.firstDay4 = k.d;
    if (v.lastDay4 == null || k.d > v.lastDay4) v.lastDay4 = k.d;
  }
  for (const by of Object.keys(perVillager)) {
    const v = perVillager[by];
    v.livingVet5AtEnd = endVet5.includes(by);
    v.livingVet4AtEnd = endVet4.includes(by);
    v.everVet5 = everVet5.has(by);
    v.everVet4 = everVet4.has(by);
  }
  const scholarKills4 = w4kills.filter(isCaptureScholar).length;
  const villagerKills4 = w4kills.length - scholarKills4;
  const scholarKills3 = w3kills.filter(isCaptureScholar).length;
  const villagerKills3 = w3kills.length - scholarKills3;

  // Cross-check (i): snapshot counts vs wavegate rd counts, per index.
  const cc1 = { rowsLen: rows.length, vetRowsLen: vetRows.length, mismatches: [] };
  const n = Math.min(rows.length, vetRows.length);
  if (rows.length !== vetRows.length) cc1.mismatches.push({ type: 'length', rows: rows.length, vetRows: vetRows.length });
  for (let i = 0; i < n; i++) {
    const r = rows[i], v = vetRows[i];
    const rd4 = (r.rd4 && r.rd4.veterans) | 0, rd5 = (r.rd5 && r.rd5.veterans) | 0;
    if (((v.vet4 || []).length !== rd4) || ((v.vet5 || []).length !== rd5)) {
      cc1.mismatches.push({ index: i, day: v.day, vet4: (v.vet4 || []).length, rd4, vet5: (v.vet5 || []).length, rd5 });
    }
  }
  // Cross-check (ii): deduped capture vs final waveKillLog multiset.
  const logTuples = (s.finalWaveKillLog || []).map(e => JSON.stringify([e.d, e.mid, e.w, e.by, e.via, (e.trick === undefined ? null : e.trick)])).sort();
  const capTuples = kills.map(k => JSON.stringify([k.d, k.mid, k.w, k.by, k.via, (k.trick === undefined ? null : k.trick)])).sort();
  const cc2 = {
    captureRaw: (s.kills || []).length, captureDeduped: kills.length, captureDupes: ded.dupes,
    logLen: (s.finalWaveKillLog || []).length,
    equal: JSON.stringify(logTuples) === JSON.stringify(capTuples),
  };
  if (!cc2.equal) {
    const logSet = new Map(), capSet = new Map();
    for (const t of logTuples) logSet.set(t, (logSet.get(t) || 0) + 1);
    for (const t of capTuples) capSet.set(t, (capSet.get(t) || 0) + 1);
    cc2.onlyInLog = logTuples.filter(t => (capSet.get(t) || 0) < (logSet.get(t) || 0)).slice(0, 10);
    cc2.onlyInCapture = capTuples.filter(t => (logSet.get(t) || 0) < (capSet.get(t) || 0)).slice(0, 10);
  }
  // Cross-check (iii): capture-vs-census scholar/companion per w3+ kill.
  // A mismatch is succession-shaped when the killer held the mantle on
  // an earlier daily row and the census scholar changed to a new holder
  // on the kill's own day — i.e. succession fell between the kill
  // moment and that day's daily snapshot, so the daily census (which
  // reads the scholar AFTER the kill) disagrees with the exact
  // kill-time capture (which reads it AT the kill). The exact capture
  // wins on such a mismatch; the shape is machine-checked here and
  // the human-verified read lives in the evidence.
  const cc3 = { kills3: w3kills.length, mismatches: [] };
  for (const k of w3kills) {
    const censusScholar = scholarVidOfDay(vetRows, k.d, s.initialScholarVid);
    const censusIsScholar = k.by === 'player' || (k.by != null && censusScholar != null && k.by === censusScholar);
    if (censusIsScholar !== isCaptureScholar(k)) {
      let successionShaped = false;
      for (let i = 0; i < vetRows.length; i++) {
        if ((vetRows[i].day | 0) === (k.d | 0) && vetRows[i].scholarVid === censusScholar) {
          for (let j = 0; j < i; j++) {
            if (vetRows[j].scholarVid === k.by) { successionShaped = true; break; }
          }
        }
        if (successionShaped) break;
      }
      cc3.mismatches.push({ d: k.d, mid: k.mid, by: k.by, captureScholarVid: k.scholarVid, censusScholar, captureScholar: isCaptureScholar(k), censusScholarFlag: censusIsScholar, successionShaped });
    }
  }
  // Cross-check (iv): derived final uw vs engine final uw.
  const cc4 = { derivedFinalUw: s.derivedFinalUw, engineFinalUw: s.engineFinalUw, equal: s.derivedFinalUw === s.engineFinalUw };

  // Own-base end blocker for wave 5 (from the last wavegate row).
  const last = rows.length ? rows[rows.length - 1] : null;
  let blocker5 = 'NO-ROWS';
  if (last) {
    if ((last.uw | 0) >= 5) blocker5 = 'UNLOCKED5';
    else if ((last.uw | 0) < 4) blocker5 = 'WAVE4-NOT-OPEN';
    else if (!last.w4faced) blocker5 = 'W4-FACED';
    else if ((last.holds || []).includes('defer5')) blocker5 = 'DEFER5';
    else if ((last.holds || []).includes('cap')) blocker5 = 'CAP';
    else if ((last.raw | 0) < 200) blocker5 = 'BELOW';
    else blocker5 = 'OTHER:' + (last.hold || '');
  }

  return {
    seed: s.seed, anchorCommit: s.anchorCommit, instrument: s.instrument,
    national: s.national, table: s.table, won: s.won, maxWave: s.maxWave,
    gameDays: s.gameDays, endReason: s.endReason, endScaleRank: s.endScaleRank,
    nationalDay, wave4Day, wave5Day, tableDay, winDay, w4facedDay,
    maxVet5, maxVet4, endVet5: endVet5.map(v => ({ vid: v, name: nameForSeed(s, v) })),
    endVet4: endVet4.map(v => ({ vid: v, name: nameForSeed(s, v) })),
    firstVet2Day, daysAtVet2,
    vet2BeforeWin: firstVet2Day != null && winDay != null ? (firstVet2Day < winDay) : null,
    vet2BeforeTable: firstVet2Day != null && tableDay != null ? (firstVet2Day < tableDay) : null,
    deaths, perVillager: Object.values(perVillager).sort((a, b) => (b.kills4 - a.kills4) || (b.kills3 - a.kills3)),
    kills3Total: w3kills.length, kills4Total: w4kills.length,
    scholarKills4, villagerKills4, scholarKills3, villagerKills3,
    recorderErrs: s.recorderErrs, vetErrs: s.vetErrs, captureErrs: s.captureErrs,
    scholarVidMismatches: s.scholarVidMismatches,
    cc1, cc2, cc3, cc4, blocker5,
    lastRow: last ? { day: last.day, uw: last.uw, gated: last.gated, raw: last.raw, hold: last.hold, holds: last.holds, w4faced: last.w4faced, rd5vets: last.rd5 ? last.rd5.veterans : null } : null,
  };
}

function analyzeDir(evidDir) {
  const dir = path.join(evidDir, 'leadfeast');
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = [];
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(s));
  }
  seeds.sort((a, b) => a.seed - b.seed);
  const key = seeds.filter(s => KEY_SEEDS.includes(s.seed));
  const keyComplete = key.filter(s =>
    s.recorderErrs === 0 && s.vetErrs === 0 && s.captureErrs === 0
    && s.cc1.mismatches.length === 0 && s.cc2.equal && s.cc3.mismatches.length === 0 && s.cc4.equal
  ).length;
  // Key completeness with the prereg's read-only exception: a seed
  // counts as complete when every cc3 mismatch on it is
  // succession-shaped (exact capture wins; see the cc3 comment).
  const keyCompleteExplained = key.filter(s =>
    s.recorderErrs === 0 && s.vetErrs === 0 && s.captureErrs === 0
    && s.cc1.mismatches.length === 0 && s.cc2.equal && s.cc4.equal
    && s.cc3.mismatches.every(m => m.successionShaped)
  ).length;
  const summary = {
    seeds: seeds.length, keySeeds: key.length, keyComplete, keyCompleteExplained,
    national: seeds.filter(s => s.national).length,
    table: seeds.filter(s => s.table).length,
    won: seeds.filter(s => s.won).length,
    wave4: seeds.filter(s => s.maxWave >= 4).length,
    wave5: seeds.filter(s => s.maxWave >= 5).length,
    everVet2: seeds.filter(s => s.firstVet2Day != null).length,
    everVet2Key: key.filter(s => s.firstVet2Day != null).length,
    maxVet5Overall: seeds.reduce((m, s) => Math.max(m, s.maxVet5), 0),
  };
  return { summary, seeds, keySeeds: KEY_SEEDS, defer5Seeds: DEFER5, w4facedSeeds: W4FACED };
}

if (require.main === module) {
  const evidDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-vet2');
  const outPath = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'vet2-analysis.json');
  const a = analyzeDir(evidDir);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(a, null, 1) + '\n');
  console.log(`seeds=${a.summary.seeds} key=${a.summary.keySeeds} keyComplete=${a.summary.keyComplete} nat=${a.summary.national} table=${a.summary.table} won=${a.summary.won} w4=${a.summary.wave4} w5=${a.summary.wave5} everVet2=${a.summary.everVet2}/${a.summary.seeds} maxVet5=${a.summary.maxVet5Overall}`);
  console.log('seed | nat w4 tbl win | maxV5 maxV4 endV5 | firstVet2 | w4kills S/V | deaths | blocker5 | cc');
  for (const s of a.seeds) {
    const cc = `c1:${s.cc1.mismatches.length} c2:${s.cc2.equal ? 'ok' : 'MISMATCH'} c3:${s.cc3.mismatches.length} c4:${s.cc4.equal ? 'ok' : 'MISMATCH'}`;
    console.log(`${s.seed} | ${s.nationalDay} ${s.wave4Day} ${s.tableDay} ${s.winDay} | ${s.maxVet5} ${s.maxVet4} ${s.endVet5.length} | ${s.firstVet2Day} | ${s.kills4Total} ${s.scholarKills4}/${s.villagerKills4} | ${s.deaths.length} | ${s.blocker5} | ${cc}`);
  }
  console.log(`analysis -> ${outPath}`);
}

module.exports = {
  analyzeSeed, analyzeDir, dedupeKills, isCaptureScholar,
  scholarVidOfDay, firstDay, DEFER5, W4FACED, KEY_SEEDS,
};
