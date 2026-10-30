#!/usr/bin/env node
// scripts/analyze-recurrence-a.js — sim-recurrence-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-recurrence-a/s<seed>-fresh.json
//   (chainclose sweep copy: same six recorders, seeds 75101-75116)
//   + census-s<seed>.json (record-only daily world-monster snapshots).
// Join: per seed, fp/dp/bl/sr/tj join by fight-order index; VERIFIED
// (mid, vid, day must match at every index); join errors must be 0.
// Universe: joined rows with fieldparty wave == 4 AND channel ==
// 'field' (wild shape only), all callers, scholar-led flagged.
// Chains: REQUIRED from scripts/analyze-chainclose-a.js buildChains
// (the fixed (seed,mid) grouping — never re-implemented here, never
// edited there). A chain is a maximal HP-continuous run of same-mid
// meetings on one seed.
// Census matching: an instance is (mid, hp) where hp is the chain's
// last meeting mHpLeft. A snapshot CONTAINS the instance iff some
// entry has id == mid AND hp == that HP. Post snapshots are day >
// lastDay (strict — a same-day snapshot may precede the meeting).
// Fate tree (prereg priority order): FINISHED > BEAST-VANISHED >
// VILLAGE-GONE > STILL-PRESENT-AT-HORIZON > NEVER-CROSSED >
// VILLAGE-NEVER-OUT > UNCLASSIFIED.
// Usage:
//   node scripts/analyze-recurrence-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-recurrence-a.js --sense (print first-meeting
//     logs per chain + one later log per recurring chain)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { buildChains } = require('./analyze-chainclose-a');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');

function cheb(a, b) {
  if (!a || !b || a.tx == null || a.ty == null || b.tx == null || b.ty == null) return null;
  return Math.max(Math.abs(a.tx - b.tx), Math.abs(a.ty - b.ty));
}
function tileKey(t) { return (t && t.tx != null && t.ty != null) ? `${t.tx},${t.ty}` : null; }

// censusMatch(census, mid, hp, lastDay):
//   post: snapshots with finite day > lastDay.
//   lastSeen: max post day containing (mid,hp), or null.
//   finalDay: max finite snapshot day, or null.
//   presentAtEnd: contains(finalDay snapshot) OR lastDay >= finalDay
//     (a meeting on/after the last census day is itself presence).
//   collisions: post snapshots with >= 2 entries matching (mid,hp).
//   vanished: post.length > 0 AND (lastSeen === null OR
//     (lastSeen < finalDay AND some snapshot has day > lastSeen)).
//   bad: census missing, or any snapshot day non-finite, or unsorted.
function censusMatch(census, mid, hp, lastDay) {
  if (!census || !Array.isArray(census.snapshots)) return { bad: true, reason: 'census missing/unparseable' };
  const snaps = census.snapshots;
  for (let i = 0; i < snaps.length; i++) {
    if (!Number.isFinite(snaps[i].day)) return { bad: true, reason: `snapshot ${i} day not finite` };
    if (i > 0 && snaps[i].day < snaps[i - 1].day) return { bad: true, reason: `snapshots unsorted at ${i}` };
  }
  const contains = (snap) => (snap.monsters || []).some(m => m.id === mid && m.hp === hp);
  const countIn = (snap) => (snap.monsters || []).filter(m => m.id === mid && m.hp === hp).length;
  const post = snaps.filter(s => s.day > lastDay);
  const finalDay = snaps.length ? snaps[snaps.length - 1].day : null;
  let lastSeen = null;
  const positions = [];
  for (const s of post) {
    if (contains(s)) {
      if (s.day > (lastSeen === null ? -Infinity : lastSeen)) lastSeen = s.day;
      for (const m of (s.monsters || []).filter(x => x.id === mid && x.hp === hp)) positions.push({ day: s.day, tx: m.tx, ty: m.ty });
    }
  }
  const collisions = post.filter(s => countIn(s) >= 2).map(s => s.day);
  const presentAtEnd = (finalDay !== null && snaps.some(s => s.day === finalDay && contains(s))) || (finalDay !== null && lastDay >= finalDay);
  const vanished = post.length > 0 && (lastSeen === null || (finalDay !== null && lastSeen < finalDay && snaps.some(s => s.day > lastSeen)));
  return { bad: false, postCount: post.length, lastSeen, finalDay, presentAtEnd, vanished, collisions, positions,
    censusDays: post.filter(s => contains(s)).length };
}

// classifyFate(chain, seedRow, cm, opp): prereg priority order.
// chain: {n, lastDay, remainingHp}; seedRow: {days, endReason};
// cm: censusMatch output; opp: {fieldDaysInWindow}.
function classifyFate(chain, seedRow, cm, opp) {
  const windowDays = seedRow.days - chain.lastDay;
  const survived = seedRow.endReason === 'survived';
  if (chain.remainingHp === 0) return { fate: 'FINISHED', why: `last meeting mHpLeft==0 (kill)` };
  if (cm.bad) return { fate: 'UNCLASSIFIED', why: `census unusable: ${cm.reason}` };
  if (cm.vanished) {
    return { fate: 'BEAST-VANISHED',
      why: cm.lastSeen === null ? `gone by first post snapshot (lastDay ${chain.lastDay}, ${cm.postCount} post snapshots, none contain instance)`
        : `last seen day ${cm.lastSeen}, absent from all later snapshots through final day ${cm.finalDay}` };
  }
  if (!survived && windowDays <= 7) return { fate: 'VILLAGE-GONE', why: `run ended ${seedRow.endReason} with windowDays ${windowDays} <= 7` };
  if (survived && cm.presentAtEnd) return { fate: 'STILL-PRESENT-AT-HORIZON', why: `survived to horizon, instance present at end (finalDay ${cm.finalDay}, lastDay ${chain.lastDay})` };
  if (cm.presentAtEnd) {
    if (opp.fieldDaysInWindow >= 1) return { fate: 'NEVER-CROSSED', why: `windowDays ${windowDays} > 7, instance present at end, ${opp.fieldDaysInWindow} field days in window, no second meeting` };
    return { fate: 'VILLAGE-NEVER-OUT', why: `windowDays ${windowDays} > 7, instance present at end, 0 field days in window` };
  }
  return { fate: 'UNCLASSIFIED', why: `no post snapshot and windowDays ${windowDays} > 7 (or run ended without census tail)` };
}

// opportunity(chain, fpMeetings): post-window measures from the full
// fieldparty corpus (all waves/channels) of the seed.
function opportunity(chain, fpMeetings) {
  const post = (fpMeetings || []).filter(m => m.day > chain.lastDay);
  const fieldPost = post.filter(m => m.channel === 'field');
  const fieldDays = new Set(fieldPost.map(m => m.day));
  const tiles = new Set();
  for (const m of fieldPost) { const k = tileKey(m.mTile); if (k) tiles.add(k); }
  let revisits = 0, adjacent = 0;
  for (const m of fieldPost) {
    const d = cheb(m.mTile, chain.beastLastTile);
    if (d === 0) revisits++;
    else if (d === 1) adjacent++;
  }
  const reappeared = (fpMeetings || []).filter(m => m.mid === chain.mid && m.day > chain.lastDay)
    .map(m => ({ day: m.day, channel: m.channel, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, outcome: m.outcome }));
  return { windowDays: chain.windowDays, fieldDaysInWindow: fieldDays.size,
    fieldMeetingsInWindow: fieldPost.length, distinctTilesVisited: tiles.size,
    tileRevisits: revisits, adjacentTileVisits: adjacent,
    typeReappeared: reappeared, typeReappearedN: reappeared.length,
    typeKilledLater: reappeared.filter(r => r.mHpLeft === 0).length };
}

function analyze(evidDir, chaincloseDir) {
  evidDir = evidDir || path.join(REPO, 'evidence', '2026-10-30', 'perseed-recurrence-a');
  chaincloseDir = chaincloseDir || CHAINCLOSE_DIR;
  const rows = [], censusBySeed = {};
  let censusFilesOk = true;
  for (const seed of SEEDS) {
    rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
    try {
      const c = JSON.parse(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`), 'utf8'));
      censusBySeed[seed] = c;
      const snaps = (c && c.snapshots) || [];
      const row = rows[rows.length - 1];
      const sorted = snaps.every((s, i) => i === 0 || (Number.isFinite(s.day) && Number.isFinite(snaps[i - 1].day) && s.day >= snaps[i - 1].day));
      const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
      if (!sorted || lastDay === null || Math.abs(lastDay - row.days) > 1) censusFilesOk = false;
    } catch (e) { censusBySeed[seed] = null; censusFilesOk = false; }
  }
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && (r.tilejoin === null || storeOk(r.tilejoin))
    && r.joinendlines && r.joinendlines.diag.errs === 0
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0));
  let joinErrors = 0, joinTotal = 0, mDealtMismatches = 0, srChecked = 0, srPrefixViolations = 0;
  const joined = [];
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [],
      bl = r.breakline.meetings || [], sr = r.shoutrec.meetings || [],
      tj = (r.tilejoin && r.tilejoin.meetings) || [];
    const lens = [fp.length, dp.length, bl.length, sr.length, tj.length];
    const n = Math.min.apply(null, lens);
    for (const L of lens) joinErrors += Math.abs(L - fp.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i], d = sr[i], e = tj[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day
        || a.mid !== d.mid || a.vid !== d.vid || a.day !== d.day
        || a.mid !== e.mid || a.vid !== e.vid || a.day !== e.day) { joinErrors++; continue; }
      if ((c.mDealt | 0) !== (b.mDealt | 0)) mDealtMismatches++;
      const rt = d.roundTotals;
      if (Array.isArray(rt) && rt.length) {
        srChecked++;
        let prev = -1;
        for (const e2 of rt) {
          const v = (e2.mDealt | 0);
          if (v < prev || v > (c.mDealt | 0)) srPrefixViolations++;
          prev = v;
        }
      }
      joined.push({ seed: r.seed, fp: a, dp: b, bl: c, sr: d, tj: e });
    }
  }
  const completeness = corpusOk && joinErrors === 0 && mDealtMismatches === 0 && srPrefixViolations === 0 && censusFilesOk;
  const w4all = joined.filter(j => (j.fp.wave | 0) === 4);
  const census = { wild: 0, raid: 0, other: 0, otherChannels: {} };
  for (const j of w4all) {
    if (j.fp.channel === 'field') census.wild++;
    else if (j.fp.channel === 'raid') census.raid++;
    else { census.other++; census.otherChannels[j.fp.channel] = (census.otherChannels[j.fp.channel] || 0) + 1; }
  }
  const U = w4all.filter(j => j.fp.channel === 'field').map(j => ({
    seed: j.seed, day: j.fp.day, part: j.fp.part, mid: j.fp.mid, caller: j.fp.caller,
    leaderVid: j.fp.vid, scholarLed: !!(j.fp.leader && j.fp.leader.isScholar),
    outcome: j.bl.outcome, rounds: j.bl.rounds, mDealt: (j.bl.mDealt | 0),
    allyDealt: (j.bl.allyDealt | 0), mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft,
    vTaken: j.bl.vTaken, calledHelp: j.bl.calledHelp, joinedAllyVid: j.bl.joinedAllyVid,
    mTile: j.fp.mTile || null, log: j.dp.log || [], logLines: (j.dp.log || []).length,
  }));
  const chains = buildChains(U.map(m => ({ seed: m.seed, day: m.day, part: m.part, mid: m.mid,
    mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, mDealt: m.mDealt, outcome: m.outcome, rounds: m.rounds })));
  const rowBySeed = {};
  for (const r of rows) rowBySeed[r.seed] = r;
  const fpBySeed = {};
  for (const r of rows) fpBySeed[r.seed] = r.fieldparty.meetings || [];
  const chainTables = chains.map(c => {
    const ms = c.meetings;
    const firstDay = ms[0].day, lastDay = ms[ms.length - 1].day;
    const row = rowBySeed[c.seed] || {};
    const gaps = [];
    for (let i = 1; i < ms.length; i++) gaps.push(ms[i].day - ms[i - 1].day);
    const lastM = ms[ms.length - 1];
    const lastMeeting = U.find(m => m.seed === c.seed && m.day === lastDay && m.part === lastM.part && m.mid === c.mid);
    const beastLastTile = lastMeeting ? lastMeeting.mTile : null;
    const chain = { seed: c.seed, mid: c.mid, n: ms.length, firstDay, lastDay,
      openingHp: c.openingHp, remainingHp: c.lastLeft, breakReason: c.breakReason || null,
      totalDealt: ms.reduce((t, m) => t + (m.mDealt | 0), 0),
      gaps, beastLastTile, windowDays: row.days - lastDay,
      firstContactRunway: row.days - firstDay, days: row.days, endReason: row.endReason,
      enteredTable: row.entered === 1, tableReached: row.table === 1,
      meetings: ms.map(m => ({ day: m.day, part: m.part, outcome: m.outcome, rounds: m.rounds,
        mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, mDealt: m.mDealt })) };
    const cm = censusMatch(censusBySeed[c.seed], c.mid, c.lastLeft, lastDay);
    const opp = opportunity({ lastDay, mid: c.mid, beastLastTile, windowDays: chain.windowDays }, fpBySeed[c.seed]);
    const fate = classifyFate({ n: ms.length, lastDay, remainingHp: c.lastLeft }, row, cm, opp);
    let drift = null;
    if (cm.positions && cm.positions.length && beastLastTile) {
      drift = Math.max.apply(null, cm.positions.map(p => cheb(p, beastLastTile)));
    }
    return Object.assign(chain, {
      census: { postSnapshots: cm.postCount, lastSeen: cm.lastSeen, finalDay: cm.finalDay,
        presentAtEnd: cm.presentAtEnd, vanished: cm.vanished, collisions: cm.collisions,
        censusDays: cm.censusDays, bad: cm.bad, badReason: cm.reason || null },
      fate: fate.fate, fateWhy: fate.why,
      opp: Object.assign(opp, { beastCensusDays: cm.censusDays, beastLastSeenDay: cm.lastSeen,
        beastTileDrift: drift, beastHpAtLast: c.lastLeft }),
    });
  });
  const fateCounts = {};
  for (const c of chainTables) fateCounts[c.fate] = (fateCounts[c.fate] || 0) + 1;
  const unclassified = chainTables.filter(c => c.fate === 'UNCLASSIFIED').length;
  const classification = unclassified === 0 && chainTables.length > 0;
  // Substrate equivalence: byte-compare each row file to chainclose's.
  const substrate = { perSeed: {}, all: true };
  for (const seed of SEEDS) {
    try {
      const a = fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`));
      const b = fs.readFileSync(path.join(chaincloseDir, `s${seed}-fresh.json`));
      substrate.perSeed[seed] = a.equals(b);
    } catch (e) { substrate.perSeed[seed] = false; }
    if (!substrate.perSeed[seed]) substrate.all = false;
  }
  // Wall numbers (upper-middle median convention, as chainclose).
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const nationalFinal = rows.reduce((t, r) => t + r.nationalFinal, 0);
  const tableN = rows.reduce((t, r) => t + r.table, 0);
  const entered = rows.reduce((t, r) => t + r.entered, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const waveReachCount = (w) => rows.filter(r => (r.waveReach || 1) >= w).length;
  const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
  const medianDays = daysSorted[Math.floor(daysSorted.length / 2)];
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const perSeedRows = rows.map(r => ({ seed: r.seed, days: r.days, endReason: r.endReason, won: r.won,
    waveReach: r.waveReach, nationalEver: r.nationalEver, deaths: r.deathTotal,
    fpMeetings: (r.fieldparty.meetings || []).length,
    censusSnapshots: ((censusBySeed[r.seed] || {}).snapshots || []).length }));
  return { corpusOk, censusFilesOk, completeness, joinTotal, joinErrors, mDealtMismatches,
    srChecked, srPrefixViolations, census, wildN: U.length, chains: chainTables,
    fateCounts, unclassified, classification, substrate,
    wildDetail: U,
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave1reach: waveReachCount(1), wave2reach: waveReachCount(2), wave3reach: waveReachCount(3),
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, deathsByCause },
    perSeedRows };
}

function sense(evidDir) {
  const res = analyze(evidDir);
  // Per-CHAIN lookup (a seed+mid group can hold several HP-split chains;
  // grouping by seed|mid alone would print the wrong chain's first log).
  const findLog = (seed, day, part, mid) => res.wildDetail.find(m => m.seed === seed && m.day === day && m.part === part && m.mid === mid) || null;
  const chains = res.chains;
  let sel = 0;
  console.log('SENSE-RULE: every first-meeting transcript of every chain (n=1 and recurring firsts) + one later-meeting log per recurring chain when a log exists');
  console.log(`SENSE-CANDIDATES chains=${chains.length} wildMeetings=${res.wildN}`);
  for (const c of chains) {
    const list = c.meetings.map(mm => findLog(c.seed, mm.day, mm.part, c.mid)).filter(Boolean);
    const first = list[0];
    if (first) {
      sel++;
      console.log(`\n--- FIRST s${c.seed} d${first.day} ${c.mid} n=${c.n} fate=${c.fate} caller=${first.caller} outcome=${first.outcome} rounds=${first.rounds} mDealt=${first.mDealt} mHp ${first.mHpStart}->${first.mHpLeft} logLines=${first.logLines} ---`);
      for (const line of first.log) console.log('  ' + line);
    }
    if (c.n >= 2) {
      const later = list.slice(1).find(m => (m.log || []).length) || list[1];
      if (later) {
        sel++;
        console.log(`\n--- LATER s${c.seed} d${later.day} ${c.mid} n=${c.n} fate=${c.fate} caller=${later.caller} outcome=${later.outcome} rounds=${later.rounds} mDealt=${later.mDealt} mHp ${later.mHpStart}->${later.mHpLeft} logLines=${later.logLines} ---`);
        for (const line of later.log) console.log('  ' + line);
      }
    }
  }
  console.log(`\nSENSE-SELECTED=${sel}`);
  return sel;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-recurrence-a');
  if (args.indexOf('--sense') >= 0) { sense(evidDir); return; }
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-recurrence-a census ===');
  console.log(`corpusOk=${res.corpusOk} censusFilesOk=${res.censusFilesOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} mDealtMismatches=${res.mDealtMismatches} srChecked=${res.srChecked} srPrefixViolations=${res.srPrefixViolations}`);
  console.log(`WAVE-4 CENSUS: wild=${res.census.wild} raid=${res.census.raid} other=${res.census.other} ${JSON.stringify(res.census.otherChannels)}`);
  console.log(`CHAINS: total=${res.chains.length} fateCounts=${JSON.stringify(res.fateCounts)} unclassified=${res.unclassified}`);
  for (const c of res.chains) {
    console.log(`  CHAIN s${c.seed} ${c.mid} n=${c.n} d${c.firstDay}-d${c.lastDay} open=${c.openingHp} remain=${c.remainingHp} dealt=${c.totalDealt} gaps=${JSON.stringify(c.gaps)} fate=${c.fate} window=${c.windowDays} runway1st=${c.firstContactRunway} end=${c.endReason} lastSeen=${c.opp.beastLastSeenDay} censusDays=${c.opp.beastCensusDays} drift=${c.opp.beastTileDrift} fieldDays=${c.opp.fieldDaysInWindow} fieldMeet=${c.opp.fieldMeetingsInWindow} revisits=${c.opp.tileRevisits} adj=${c.opp.adjacentTileVisits} reapp=${c.opp.typeReappearedN} killedLater=${c.opp.typeKilledLater} coll=${JSON.stringify(c.census.collisions)}`);
    console.log(`    WHY: ${c.fateWhy}`);
  }
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave1=${w.wave1reach} wave2=${w.wave2reach} wave3=${w.wave3reach} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`SUBSTRATE: all=${res.substrate.all} perSeed=${JSON.stringify(res.substrate.perSeed)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} CLASSIFICATION=${res.classification ? 'PASS' : 'FAIL'} SUBSTRATE=${res.substrate.all ? 'PASS' : 'FAIL'}`);
  if (!res.completeness || !res.classification || !res.substrate.all) process.exit(1);
}
function filesByteEqual(aPath, bPath) {
  try {
    return fs.readFileSync(aPath).equals(fs.readFileSync(bPath));
  } catch (e) { return false; }
}
if (require.main === module) main();
module.exports = { analyze, classifyFate, censusMatch, opportunity, cheb, tileKey, sense, filesByteEqual };
