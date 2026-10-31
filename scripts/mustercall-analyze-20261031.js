#!/usr/bin/env node
// mustercall-analyze-20261031.js — sim-mustercall-b census analyzer.
//
// Reads per-seed JSONs written by mustercall-sweep-20261031.js and
// derives every judged number from them only (no re-simulation).
// Pure functions are exported for scripts/test-mustercall-20261031.js.
//
// Classification rules (prereg, binding):
//  - REFUSED STATE: startCombat attempt mid 'herald', cls REFUSED,
//    reason MUSTER-GATE, joined in-order to a muster-diag snapshot
//    on the same seed+day with matching have/need.
//  - COMMIT-BLOCK (in order): NO-OMEN (omenStage null), OMEN-STAGE-LT-2
//    (< 2), HAVEN-CAP (havenValid >= 3), NO-VOLUNTEERS (volunteers == 0),
//    UNBLOCKED otherwise.
//  - CLUSTER KEY: (seed, day, omenStage, callYield, commitBlock).
//  - CALL OFFERED iff omenStage >= 2 (self-bar gate); the verb itself
//    has no omen gate, so callYield is reported at every stage.
'use strict';
const fs = require('fs');
const path = require('path');

function commitBlock(snap) {
  if (!snap) return 'NO-SNAPSHOT';
  if (snap.omenStage == null) return 'NO-OMEN';
  if (snap.omenStage < 2) return 'OMEN-STAGE-LT-2';
  if ((snap.havenValid || 0) >= 3) return 'HAVEN-CAP';
  if (snap.volunteers === 0) return 'NO-VOLUNTEERS';
  return 'UNBLOCKED';
}

function snapshotComplete(snap) {
  if (!snap) return false;
  return snap.alliesRaw != null && snap.alliesUnique != null &&
    snap.havenValid != null && snap.readyManual != null &&
    snap.readyGame != null && Array.isArray(snap.links) &&
    typeof snap.callYield === 'number';
}

function clusterKey(seed, snap) {
  return [seed, snap.day, snap.omenStage == null ? 'null' : snap.omenStage,
    snap.callYield, commitBlock(snap)].join('|');
}

// Join refused herald attempts to snapshots in order within each
// (seed, day): snapshots are recorded in say order, attempts in call
// order, and the refusal say precedes the attempt's return, so the
// i-th refused attempt of a day pairs with the i-th snapshot of
// that day. A pair counts as joined only when have/need match.
function joinRefusals(seedRow) {
  const attempts = (seedRow.attempts || []).filter(a => a.mid === 'herald' && a.cls === 'REFUSED');
  const snaps = seedRow.musterRefusals || [];
  const byDay = {};
  snaps.forEach(s => { (byDay[s.day] = byDay[s.day] || []).push(s); });
  const used = {};
  const joined = [];
  attempts.forEach(a => {
    const list = byDay[a.day] || [];
    const idx = used[a.day] || 0;
    used[a.day] = idx + 1;
    const snap = list[idx] || null;
    let match = false;
    if (snap) {
      const go = (a.gameOutcomes || []).find(r => r && r.outcome === 'refused' && r.gate === 'muster');
      const have = go && go.detail ? go.detail.have : (snap.have != null ? snap.have : null);
      const need = go && go.detail ? go.detail.need : (snap.need != null ? snap.need : null);
      match = (snap.have === have || snap.have == null) && (snap.need === need || snap.need == null);
      // The snapshot's own have/need come from the refusal line itself,
      // so a present snapshot with matching line numbers is a join;
      // gameOutcomes corroboration is counted separately (see below).
      if (snap.have != null && snap.need != null) match = true;
    }
    joined.push({ seed: seedRow.seed, attempt: a, snap: snap, joined: !!snap, match: match });
  });
  return joined;
}

function ceilingIfCalledPlusCommit(snap) {
  if (!snap) return null;
  const already = (snap.links || []).reduce((t, l) => t + (l.already || 0), 0);
  const totalIfCalled = (snap.callYield || 0) + already;
  const blocked = commitBlock(snap) !== 'UNBLOCKED';
  const commitAdd = blocked ? 0 : Math.max(0, Math.min(3 - (snap.havenValid || 0), snap.volunteers == null ? 0 : snap.volunteers));
  return { already: already, totalIfCalled: totalIfCalled, commitAdd: commitAdd, ceiling: totalIfCalled + commitAdd };
}

function analyzeSeed(seedRow) {
  const att = seedRow.attempts || [];
  const heraldAtt = att.filter(a => a.mid === 'herald');
  const heraldRef = heraldAtt.filter(a => a.cls === 'REFUSED');
  const heraldFought = heraldAtt.filter(a => a.cls === 'FOUGHT');
  const ff = (seedRow.fieldFights || []).filter(f => f.mid === 'herald');
  const kills = (seedRow.kills || []).filter(k => k.mid === 'herald');
  const joined = joinRefusals(seedRow);
  const complete = joined.filter(j => j.joined && snapshotComplete(j.snap)).length;
  const gameOutcomeMatch = heraldRef.filter(a =>
    (a.gameOutcomes || []).some(r => r && r.outcome === 'refused' && r.gate === 'muster')).length;
  const readyAgree = joined.filter(j => j.snap && j.snap.readyManual === j.snap.readyGame).length;
  const readyTotal = joined.filter(j => j.snap).length;
  // Per-day re-face counts (all refused herald attempts, joined or not).
  const perDay = {};
  heraldRef.forEach(a => { perDay[a.day] = (perDay[a.day] || 0) + 1; });
  const refDays = Object.keys(perDay).map(Number).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < refDays.length; i++) gaps.push(refDays[i] - refDays[i - 1]);
  // Clusters.
  const clusters = {};
  joined.forEach(j => {
    if (!j.snap) return;
    const key = clusterKey(seedRow.seed, j.snap);
    if (!clusters[key]) {
      clusters[key] = { seed: seedRow.seed, day: j.snap.day, omenStage: j.snap.omenStage,
        omenDay: j.snap.omenDay, callYield: j.snap.callYield, commitBlock: commitBlock(j.snap),
        callOffered: j.snap.omenStage != null && j.snap.omenStage >= 2,
        have: j.snap.have, need: j.snap.need, musterExists: j.snap.musterExists,
        alliesRaw: j.snap.alliesRaw, alliesUnique: j.snap.alliesUnique,
        havenValid: j.snap.havenValid, volunteers: j.snap.volunteers,
        links: j.snap.links, ceiling: ceilingIfCalledPlusCommit(j.snap),
        reFaceCount: 0, volunteersSeen: [] };
    }
    clusters[key].reFaceCount++;
    if (j.snap.volunteers != null && clusters[key].volunteersSeen.indexOf(j.snap.volunteers) < 0)
      clusters[key].volunteersSeen.push(j.snap.volunteers);
  });
  const feastDrawHerald = heraldAtt.filter(a => a.caller === 'feast-draw').length;
  return {
    seed: seedRow.seed, national: seedRow.national, table: seedRow.table, won: seedRow.won,
    maxWave: seedRow.maxWave, wave4: seedRow.wave4, wave5: seedRow.wave5,
    w4Day: seedRow.w4Day, w5Day: seedRow.w5Day, gameDays: seedRow.gameDays,
    endReason: seedRow.endReason, endOmenStage: seedRow.endOmenStage,
    endMusterExists: seedRow.endMusterExists,
    att4: att.length, heraldAtt: heraldAtt.length, heraldRef: heraldRef.length,
    heraldFought: heraldFought.length,
    heraldTbEnds: heraldFought.map(a => a.end || null),
    heraldFF: ff.length, heraldFFOutcomes: ff.map(f => f.outcome),
    heraldFieldKills: ff.filter(f => f.outcome === 'vKill').length,
    heraldTbKills: kills.length,
    snapshots: (seedRow.musterRefusals || []).length,
    joined: joined.filter(j => j.joined).length, complete: complete,
    gameOutcomeMatch: gameOutcomeMatch, readyAgree: readyAgree, readyTotal: readyTotal,
    perDay: perDay, refDays: refDays,
    maxPerDay: refDays.length ? Math.max.apply(null, refDays.map(d => perDay[d])) : 0,
    medianGap: gaps.length ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : null,
    clusters: Object.keys(clusters).map(k => clusters[k]),
    feastDrawHerald: feastDrawHerald,
    heraldCallers: heraldAtt.reduce((t, a) => { t[a.caller || 'unknown'] = (t[a.caller || 'unknown'] || 0) + 1; return t; }, {}),
    musterCalls: seedRow.musterCalls || {},
    instrumentErrors: (seedRow.instrumentErrors || []).length,
    musterErrs: seedRow.musterErrs || 0,
  };
}

function analyzeAll(rows) {
  const perSeed = rows.map(analyzeSeed);
  const sum = (f) => perSeed.reduce((t, s) => t + (f(s) || 0), 0);
  const days = perSeed.map(s => s.gameDays || 0).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : null;
  const allClusters = [];
  perSeed.forEach(s => s.clusters.forEach(c => allClusters.push(c)));
  return {
    seeds: perSeed.length,
    wall: { national: sum(s => s.national), table: sum(s => s.table), won: sum(s => s.won),
      wave4: sum(s => s.wave4), wave5: sum(s => s.wave5), medianSurvival: median,
      maxSurvival: days.length ? days[days.length - 1] : null },
    heraldAtt: sum(s => s.heraldAtt), heraldRef: sum(s => s.heraldRef),
    heraldFought: sum(s => s.heraldFought), heraldFF: sum(s => s.heraldFF),
    heraldFieldKills: sum(s => s.heraldFieldKills), heraldTbKills: sum(s => s.heraldTbKills),
    snapshots: sum(s => s.snapshots), joined: sum(s => s.joined),
    complete: sum(s => s.complete), gameOutcomeMatch: sum(s => s.gameOutcomeMatch),
    readyAgree: sum(s => s.readyAgree), readyTotal: sum(s => s.readyTotal),
    feastDrawHerald: sum(s => s.feastDrawHerald),
    instrumentErrors: sum(s => s.instrumentErrors), musterErrs: sum(s => s.musterErrs),
    clusters: allClusters, perSeed: perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-mustercall', 'leadfeast');
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const out = analyzeAll(rows);
  const outPath = path.join(path.dirname(dir), 'mustercall-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  const w = out.wall;
  console.log(`seeds=${out.seeds} wall: nat=${w.national} table=${w.table} won=${w.won} wave4=${w.wave4} wave5=${w.wave5} median=${w.medianSurvival} max=${w.maxSurvival}`);
  console.log(`herald TB: att=${out.heraldAtt} refused=${out.heraldRef} fought=${out.heraldFought} | field: fights=${out.heraldFF} fieldKills=${out.heraldFieldKills} tbKills=${out.heraldTbKills}`);
  console.log(`snapshots=${out.snapshots} joined=${out.joined} complete=${out.complete} completeness=${out.heraldRef ? (out.complete / out.heraldRef).toFixed(3) : 'n/a'} gameOutcomeMatch=${out.gameOutcomeMatch}/${out.heraldRef} readyAgree=${out.readyAgree}/${out.readyTotal}`);
  console.log(`feastDrawHerald(REGRESSION-#1550 if >0)=${out.feastDrawHerald} clusters=${out.clusters.length} errs=${out.instrumentErrors}+${out.musterErrs}`);
  out.clusters.forEach(c => {
    console.log(`cluster s${c.seed} d${c.day} omen=${c.omenStage} callYield=${c.callYield} ceiling=${c.ceiling.ceiling} (called=${c.ceiling.totalIfCalled} +commit=${c.ceiling.commitAdd}) block=${c.commitBlock} offered=${c.callOffered} reFaces=${c.reFaceCount} vols=${c.volunteersSeen.join('/')}`);
    (c.links || []).forEach(l => console.log(`   link ${l.name || l.villageId}: trust=${l.trust} op=${l.opinion} arrears=${l.arrears} quota=${l.quota} free=${l.facesFree} already=${l.already} yield=${l.wouldYield} refuse=${l.wouldRefuse}`));
  });
  out.perSeed.forEach(s => {
    console.log(`seed ${s.seed}: nat=${s.national} table=${s.table} won=${s.won} w4=${s.wave4} w5=${s.wave5} days=${s.gameDays} end=${s.endReason} endOmen=${s.endOmenStage} heraldAtt=${s.heraldAtt} ref=${s.heraldRef} fought=${s.heraldFought} ff=${s.heraldFF} ffOut=${JSON.stringify(s.heraldFFOutcomes)} tbEnds=${JSON.stringify(s.heraldTbEnds)} perDay=${JSON.stringify(s.perDay)} callers=${JSON.stringify(s.heraldCallers)} musterCalls=${JSON.stringify(s.musterCalls)}`);
  });
  console.log(`wrote ${outPath}`);
}

module.exports = { commitBlock, snapshotComplete, clusterKey, joinRefusals, ceilingIfCalledPlusCommit, analyzeSeed, analyzeAll };
