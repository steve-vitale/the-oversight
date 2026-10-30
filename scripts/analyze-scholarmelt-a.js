#!/usr/bin/env node
// scripts/analyze-scholarmelt-a.js — sim-scholarmelt-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-scholarmelt-a/s<seed>-fresh.json
//   (chainclose sweep copy: same six recorders + scholarmelt recorder,
//   seeds 75101-75116) + census-s<seed>.json (record-only daily
//   world-monster snapshots, copied from the recurrence sweep).
// Join: per seed, fp/dp/bl/sr/tj join by fight-order index; VERIFIED
// (mid, vid, day must match at every index); join errors must be 0.
// Universe: joined rows with fieldparty wave == 4 AND channel ==
// 'field' (wild shape only), all callers, scholar-led flagged.
// Chains: REQUIRED from scripts/analyze-chainclose-a.js buildChains
// (the fixed (seed,mid) grouping — never re-implemented here, never
// edited there). Fates: REQUIRED from scripts/analyze-recurrence-a.js
// censusMatch/classifyFate/opportunity (censored = horizon-survived
// ONLY, endReason == 'survived' — never re-implemented).
// Scholar fights: classified by classifyFight (prereg priority order,
// incl. the pre-sweep correction's DISSOLVED-MELT). Chain matching:
// same seed+mid, lifted, lift.hp == chain remainingHp, lastDay <
// dayStart <= firstAbsentDay (first post-lastDay census snapshot day
// NOT containing the (mid,hp) instance). Type alone never matches.
// Usage:
//   node scripts/analyze-scholarmelt-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-scholarmelt-a.js --sense (print vanished-chain
//     meeting logs + matched scholar trace rows)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { buildChains } = require('./analyze-chainclose-a');
const { censusMatch, classifyFate, opportunity } = require('./analyze-recurrence-a');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
const RECURRENCE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-recurrence-a');
// Expected vanished set, from recurrence evidence (the assigned 4).
// The analyzer ASSERTS this corpus's own BEAST-VANISHED set equals it;
// a difference is a substrate divergence (chain-set leg fails).
const EXPECTED_VANISHED = [
  [75102, 'algorithm'], [75102, 'eulogy'], [75116, 'audit'], [75116, 'suburb'],
];

let WAVE_BY_ID = null;
function waveById(mid) {
  if (WAVE_BY_ID === null) {
    WAVE_BY_ID = {};
    try {
      const data = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
      const list = Array.isArray(data) ? data : (data.monsters || []);
      for (const d of list) if (d && d.id) WAVE_BY_ID[d.id] = (d.wave | 0) || 1;
    } catch (e) { WAVE_BY_ID = {}; }
  }
  return WAVE_BY_ID[mid] || null;
}

function primaryMidOf(f) {
  const list = (f.fightersStart && f.fightersStart.length) ? f.fightersStart : (f.fightersEnd || []);
  const first = list.find(x => x && x.monsterId) || null;
  return first ? first.monsterId : null;
}
function monsterFightersEnd(f) {
  return (f.fightersEnd || []).filter(x => x && x.monsterId);
}
function anyMonsterDead(f) {
  return monsterFightersEnd(f).some(x => x.alive === false);
}
function allMonsterAlive(f) {
  const ms = monsterFightersEnd(f);
  return ms.length > 0 && ms.every(x => x.alive !== false);
}

// classifyFight(f): prereg priority order (with the correction's 1b).
// Returns {fate, sub, why}. kind 'refused' is never classified here
// (the analyzer excludes refused rows from the denominator).
function classifyFight(f) {
  if (!f || typeof f !== 'object') return { fate: 'UNCLASSIFIED', sub: 'no-row', why: 'missing row' };
  if (f.kind === 'refused') return { fate: 'EXCLUDED-REFUSED', sub: 'refused', why: 'startCombat refused (fight already live); nothing lifted' };
  if (f.result == null) return { fate: 'UNENDED', sub: 'live-at-end', why: 'start with no tbEnd by run end, fight still live at sweep end' };
  if (f.result === 'dissolved-no-tbend') {
    // CORRECTION #2: restored-first. An object back in the world by
    // identity (or id+tile entry) is not a melt, whatever the lift
    // flag says — alias adoption can put a lifted titan back without
    // tbEnd. Only then does lifted decide melt vs never-lifted.
    if (f.restoredIdentity) return { fate: 'SCHOLAR-RESTORED', sub: 'dissolved-restored', why: 'flushed dissolved but lifted object is back by identity' };
    if (f.restoredEntry) return { fate: 'SCHOLAR-RESTORED', sub: 'dissolved-restored-entry', why: 'flushed dissolved; id+tile entry present post-end (identity absent)' };
    if (f.lifted === true) return { fate: 'DISSOLVED-MELT', sub: 'dissolved', why: 'flushed dissolved; lifted and absent (tbEnd is the only restore path)' };
    if (f.lifted === false && !f.lift) return { fate: 'SPAWN-ENDED', sub: 'dissolved-spawned', why: 'flushed dissolved; no lift (spawned fight)' };
    if (f.lifted === false) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'dissolved-never-lifted', why: 'flushed dissolved; lift object present at start post-record — this fight never removed it' };
    if (f.bystander) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'dissolved-bystander', why: 'flushed dissolved; tile monster was a bystander, not a fighter' };
    return { fate: 'UNCLASSIFIED', sub: 'dissolved-ambiguous', why: 'flushed dissolved with ambiguous lift/restore state' };
  }
  if (f.orphan) {
    const ms = monsterFightersEnd(f);
    if (!ms.length) return { fate: 'UNCLASSIFIED', sub: 'orphan-unreadable', why: 'orphan tbEnd with no readable monster fighters' };
    if (anyMonsterDead(f)) return { fate: 'SCHOLAR-KILL', sub: 'orphan', why: `orphan tbEnd, monster fighter dead, result ${f.result}` };
    // Orphan + monster alive + lift unknown: prereg rule 7's "no lifted
    // monster" reads vacuously (no lift was recorded), so this lands
    // in BYSTANDER-OR-NONMONSTER with the orphan subflag — but it is
    // counted separately (orphanAliveN) because it cannot prove
    // melt-vs-spawn. It can never match a vanished chain (matching
    // requires lifted==true).
    return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'orphan-lift-unknown', why: `orphan tbEnd, monster alive, lift unknown, result ${f.result}` };
  }
  if (anyMonsterDead(f)) {
    return { fate: 'SCHOLAR-KILL', sub: f.result === 'lost' ? 'pyrrhic' : 'kill',
      why: `monster fighter dead at tbEnd pre-call, result ${f.result}` };
  }
  if (f.lifted && allMonsterAlive(f) && !f.restoredIdentity && !f.restoredEntry) {
    return { fate: 'SCHOLAR-FLEE-MELT', sub: 'melt', why: `lifted, monster alive at end, absent post-end, result ${f.result}` };
  }
  if (f.lifted && (f.restoredIdentity || f.restoredEntry)) {
    return { fate: 'SCHOLAR-RESTORED', sub: 'restored', why: `lifted and back in world post-end (identity=${!!f.restoredIdentity} entry=${!!f.restoredEntry} hp=${f.restoredHp}), result ${f.result}` };
  }
  if (!f.lifted && !f.lift) {
    if (allMonsterAlive(f)) return { fate: 'SPAWN-ENDED', sub: 'spawned', why: `spawned fight (no tile monster), monster alive at end, result ${f.result}` };
    if (!monsterFightersEnd(f).length) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'nonmonster', why: `no monster fighters, result ${f.result}` };
  }
  if (f.bystander) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'bystander-stays', why: `tile monster was not a fighter and stayed, result ${f.result}` };
  if (!monsterFightersEnd(f).length) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'nonmonster', why: `no monster fighters, result ${f.result}` };
  return { fate: 'UNCLASSIFIED', sub: 'fallthrough', why: `lifted=${f.lifted} restoredId=${f.restoredIdentity} restoredEntry=${f.restoredEntry} result=${f.result}` };
}

function firstAbsentDay(census, mid, hp, lastDay) {
  if (!census || !Array.isArray(census.snapshots)) return null;
  for (const s of census.snapshots) {
    if (!(s.day > lastDay)) continue;
    const contains = (s.monsters || []).some(m => m.id === mid && m.hp === hp);
    if (!contains) return s.day;
  }
  return null;
}
function censusContainsOnDay(census, mid, hp, day) {
  if (!census || !Array.isArray(census.snapshots)) return null;
  const snap = census.snapshots.find(s => s.day === day) || null;
  if (!snap) return null;
  return (snap.monsters || []).some(m => m.id === mid && m.hp === hp);
}
function censusTileOnDay(census, mid, hp, day) {
  if (!census || !Array.isArray(census.snapshots)) return null;
  const snap = census.snapshots.find(s => s.day === day) || null;
  if (!snap) return null;
  const hit = (snap.monsters || []).find(m => m.id === mid && m.hp === hp) || null;
  return hit ? { tx: hit.tx, ty: hit.ty } : null;
}

// matchCandidate(f, chain, firstAbsentDay): the chain-matching rules.
// Returns {matched, failed[]} — failed names every rule the fight broke.
function matchCandidate(f, chain, firstAbsentDay) {
  const failed = [];
  if (!(f.lifted === true)) failed.push('not-lifted');
  if (f.lift && f.lift.hp !== chain.remainingHp) failed.push(`hp-mismatch lift=${f.lift.hp} chain=${chain.remainingHp}`);
  if (!f.lift) failed.push('no-lift-snapshot');
  if (!(f.dayStart > chain.lastDay)) failed.push(`same-day-or-earlier dayStart=${f.dayStart} lastDay=${chain.lastDay}`);
  if (firstAbsentDay != null && !(f.dayStart <= firstAbsentDay)) failed.push(`out-of-window dayStart=${f.dayStart} firstAbsentDay=${firstAbsentDay}`);
  if (f.fightersStart && f.fightersStart.length) {
    const prim = f.fightersStart.find(y => y && y.monsterId === chain.mid);
    if (prim && prim.veteran) failed.push('veteran-fighter-hp-unmatched');
  }
  return { matched: failed.length === 0, failed };
}

// stripScholarmelt(row): the substrate comparator's row transform —
// the additive recorder field removed, everything else untouched, so
// re-stringifying must reproduce chainclose's corpus bytes.
function stripScholarmelt(row) {
  const copy = JSON.parse(JSON.stringify(row));
  delete copy.scholarmelt;
  return copy;
}

function analyze(evidDir, chaincloseDir, recurrenceDir) {
  evidDir = evidDir || path.join(REPO, 'evidence', '2026-10-30', 'perseed-scholarmelt-a');
  chaincloseDir = chaincloseDir || CHAINCLOSE_DIR;
  recurrenceDir = recurrenceDir || RECURRENCE_DIR;
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
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0)
    && storeOk(r.scholarmelt));
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
    return Object.assign(chain, {
      census: { postSnapshots: cm.postCount, lastSeen: cm.lastSeen, finalDay: cm.finalDay,
        presentAtEnd: cm.presentAtEnd, vanished: cm.vanished, collisions: cm.collisions,
        censusDays: cm.censusDays, bad: cm.bad, badReason: cm.reason || null },
      fate: fate.fate, fateWhy: fate.why, opp,
    });
  });
  const fateCounts = {};
  for (const c of chainTables) fateCounts[c.fate] = (fateCounts[c.fate] || 0) + 1;
  const vanishedChains = chainTables.filter(c => c.fate === 'BEAST-VANISHED');
  const vanishedSet = vanishedChains.map(c => `${c.seed}|${c.mid}`).sort();
  const expectedSet = EXPECTED_VANISHED.map(p => `${p[0]}|${p[1]}`).sort();
  const chainSetAgreement = JSON.stringify(vanishedSet) === JSON.stringify(expectedSet);

  // --- scholar tb-combat census ---
  const fights = [];
  for (const r of rows) {
    for (const f of ((r.scholarmelt && r.scholarmelt.meetings) || [])) {
      const cls = classifyFight(f);
      const pm = primaryMidOf(f);
      fights.push(Object.assign({ seed: r.seed }, f, {
        fate: cls.fate, fateSub: cls.sub, fateWhy: cls.why,
        primaryMid: pm, primaryWave: pm ? waveById(pm) : null,
        primaryHpStart: (() => { const l = (f.fightersStart && f.fightersStart.length) ? f.fightersStart : (f.fightersEnd || []); const x = l.find(y => y && y.monsterId); return x ? x.hp : null; })(),
        primaryHpEnd: (() => { const l = f.fightersEnd || []; const x = l.find(y => y && y.monsterId); return x ? x.hp : null; })(),
        primaryAliveEnd: (() => { const l = f.fightersEnd || []; const x = l.find(y => y && y.monsterId); return x ? (x.alive !== false) : null; })(),
      }));
    }
  }
  const refusedN = fights.filter(f => f.fate === 'EXCLUDED-REFUSED').length;
  const tbFights = fights.filter(f => f.fate !== 'EXCLUDED-REFUSED');
  const fightFateCounts = {};
  for (const f of tbFights) fightFateCounts[f.fate] = (fightFateCounts[f.fate] || 0) + 1;
  const fightFateByWave = {};
  for (const f of tbFights) {
    const w = f.primaryWave != null ? String(f.primaryWave) : 'unknown';
    fightFateByWave[w] = fightFateByWave[w] || {};
    fightFateByWave[w][f.fate] = (fightFateByWave[w][f.fate] || 0) + 1;
  }
  const unclassifiedN = tbFights.filter(f => f.fate === 'UNCLASSIFIED').length;
  const orphanAliveN = tbFights.filter(f => f.fateSub === 'orphan-lift-unknown').length;
  const perSeedTb = {};
  for (const seed of SEEDS) perSeedTb[seed] = tbFights.filter(f => f.seed === seed).length;
  const sinkAll = tbFights.filter(f => f.fate === 'SCHOLAR-FLEE-MELT' || f.fate === 'DISSOLVED-MELT');
  const sinkW4 = sinkAll.filter(f => f.primaryWave === 4);
  const sinkWild = sinkAll.filter(f => f.lifted && !(f.lift && (f.lift.titan || f.lift.lingering)));

  // --- chain matching ---
  const matches = vanishedChains.map(c => {
    const cen = censusBySeed[c.seed];
    const fab = firstAbsentDay(cen, c.mid, c.remainingHp, c.lastDay);
    const cands = [];
    const nearMiss = [];
    for (const f of tbFights.filter(x => x.seed === c.seed)) {
      const midHit = (f.lift && f.lift.id === c.mid) || f.primaryMid === c.mid;
      if (!midHit) continue;
      const { matched, failed } = matchCandidate(f, c, fab);
      if (matched) {
        cands.push(Object.assign({}, f, {
          censusPresentOnFightDay: censusContainsOnDay(cen, c.mid, c.remainingHp, f.dayStart),
          censusTileOnFightDay: censusTileOnDay(cen, c.mid, c.remainingHp, f.dayStart),
          fighterHpCorroborates: (() => { const l = f.fightersStart || []; const x = l.find(y => y && y.monsterId === c.mid); return x ? (x.hp === (f.lift && f.lift.hp)) : null; })(),
        }));
      } else if (f.dayStart > c.lastDay && (fab == null || f.dayStart <= (cen && cen.snapshots && cen.snapshots.length ? cen.snapshots[cen.snapshots.length - 1].day : fab))) {
        nearMiss.push({ fightSeq: f.fightSeq, dayStart: f.dayStart, fate: f.fate, liftHp: f.lift ? f.lift.hp : null, lifted: f.lifted, failed });
      }
    }
    cands.sort((a, b) => (a.dayStart - b.dayStart) || (a.fightSeq - b.fightSeq));
    const first = cands[0] || null;
    let verdict = 'INSUFFICIENT-DATA';
    let verdictWhy = 'no matched scholar fight in the window (lifted, hp-exact, after last meeting, by first-absent day)';
    if (first) {
      if (first.fate === 'SCHOLAR-KILL') { verdict = 'scholar-kill'; verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, monster fighter dead`; }
      else if (first.fate === 'SCHOLAR-FLEE-MELT' || first.fate === 'DISSOLVED-MELT') { verdict = 'scholar-flee-melt'; verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, fate ${first.fate}, lifted hp ${first.lift.hp} absent post-end`; }
      else { verdict = 'other'; verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result} fate ${first.fate} — not kill, not melt`; }
    }
    return { seed: c.seed, mid: c.mid, n: c.n, firstDay: c.firstDay, lastDay: c.lastDay,
      remainingHp: c.remainingHp, firstAbsentDay: fab, finalDay: c.census.finalDay,
      lastSeen: c.census.lastSeen, verdict, verdictWhy,
      matched: cands.map(f => ({ fightSeq: f.fightSeq, dayStart: f.dayStart, dayEnd: f.dayEnd,
        result: f.result, fate: f.fate, fateSub: f.fateSub, liftHp: f.lift ? f.lift.hp : null,
        liftTile: f.lift ? [f.lift.tx, f.lift.ty] : null, liftTitan: f.lift ? f.lift.titan : null,
        liftLingering: f.lift ? f.lift.lingering : null,
        primaryHpStart: f.primaryHpStart, primaryHpEnd: f.primaryHpEnd,
        primaryAliveEnd: f.primaryAliveEnd, restoredIdentity: f.restoredIdentity,
        restoredEntry: f.restoredEntry, restoredHp: f.restoredHp,
        censusPresentOnFightDay: f.censusPresentOnFightDay,
        censusTileOnFightDay: f.censusTileOnFightDay,
        fighterHpCorroborates: f.fighterHpCorroborates })),
      matchedN: cands.length, nearMiss };
  });
  const unresolvedVanished = matches.filter(m => m.verdict === 'INSUFFICIENT-DATA').length;
  const classification = unclassifiedN === 0 && unresolvedVanished === 0;

  // --- substrate equivalence ---
  const substrate = { perSeedRowMinusScholarmelt: {}, perSeedCensus: {}, allRows: true, allCensus: true };
  for (const seed of SEEDS) {
    try {
      const own = stripScholarmelt(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
      const ownBytes = Buffer.from(JSON.stringify(own, null, 1) + '\n');
      const ccBytes = fs.readFileSync(path.join(chaincloseDir, `s${seed}-fresh.json`));
      substrate.perSeedRowMinusScholarmelt[seed] = ownBytes.equals(ccBytes);
    } catch (e) { substrate.perSeedRowMinusScholarmelt[seed] = false; }
    if (!substrate.perSeedRowMinusScholarmelt[seed]) substrate.allRows = false;
    try {
      const a = fs.readFileSync(path.join(evidDir, `census-s${seed}.json`));
      const b = fs.readFileSync(path.join(recurrenceDir, `census-s${seed}.json`));
      substrate.perSeedCensus[seed] = a.equals(b);
    } catch (e) { substrate.perSeedCensus[seed] = false; }
    if (!substrate.perSeedCensus[seed]) substrate.allCensus = false;
  }
  substrate.all = substrate.allRows && substrate.allCensus;

  // --- recurrence fate cross-check (diagnostic only, never a GO leg) ---
  let recurrenceCrossCheck = null;
  try {
    const rec = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-30', 'sim-recurrence-a-analysis.json'), 'utf8'));
    const recByKey = {};
    for (const c of (rec.chains || [])) recByKey[`${c.seed}|${c.mid}|${c.firstDay}|${c.lastDay}`] = c.fate;
    const mismatches = [];
    for (const c of chainTables) {
      const k = `${c.seed}|${c.mid}|${c.firstDay}|${c.lastDay}`;
      if (k in recByKey && recByKey[k] !== c.fate) mismatches.push({ key: k, recurrence: recByKey[k], own: c.fate });
    }
    recurrenceCrossCheck = { compared: chainTables.length, mismatches };
  } catch (e) { recurrenceCrossCheck = { error: String((e && e.message) || e).slice(0, 120) }; }

  // --- wall numbers (upper-middle median convention, as chainclose) ---
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
    smMeetings: ((r.scholarmelt && r.scholarmelt.meetings) || []).length,
    censusSnapshots: ((censusBySeed[r.seed] || {}).snapshots || []).length }));

  return { corpusOk, censusFilesOk, completeness, joinTotal, joinErrors, mDealtMismatches,
    srChecked, srPrefixViolations, census, wildN: U.length, chains: chainTables,
    fateCounts, vanishedChains: vanishedChains.map(c => ({ seed: c.seed, mid: c.mid, n: c.n,
      firstDay: c.firstDay, lastDay: c.lastDay, remainingHp: c.remainingHp })),
    vanishedSet, expectedSet, chainSetAgreement,
    fights: tbFights, refusedN, fightFateCounts, fightFateByWave, unclassifiedN,
    orphanAliveN, perSeedTb, sinkAllN: sinkAll.length, sinkW4N: sinkW4.length,
    sinkWildN: sinkWild.length,
    sinkAll: sinkAll.map(f => ({ seed: f.seed, fightSeq: f.fightSeq, dayStart: f.dayStart,
      primaryMid: f.primaryMid, primaryWave: f.primaryWave, result: f.result, fate: f.fate })),
    matches, unresolvedVanished, classification, substrate, recurrenceCrossCheck,
    wildDetail: U,
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave1reach: waveReachCount(1), wave2reach: waveReachCount(2), wave3reach: waveReachCount(3),
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, deathsByCause },
    perSeedRows };
}

function sense(evidDir) {
  const res = analyze(evidDir);
  const vanishedKeys = new Set(res.vanishedChains.map(c => `${c.seed}|${c.mid}`));
  let sel = 0;
  console.log('SENSE-RULE: every meeting log of the 4 vanished chains (w4dpr rec.log) + matched scholar trace rows');
  console.log(`SENSE-CANDIDATES vanishedChains=${res.vanishedChains.length} wildMeetings=${res.wildN}`);
  for (const c of res.chains) {
    if (!vanishedKeys.has(`${c.seed}|${c.mid}`)) continue;
    // Per-CHAIN logs: match meetings by (seed,day,part,mid) from wildDetail.
    for (const mm of c.meetings) {
      const m = res.wildDetail.find(x => x.seed === c.seed && x.day === mm.day && x.part === mm.part && x.mid === c.mid);
      if (!m) continue;
      sel++;
      console.log(`\n--- VILLAGER s${c.seed} d${m.day} ${c.mid} fate=${c.fate} caller=${m.caller} outcome=${m.outcome} rounds=${m.rounds} mDealt=${m.mDealt} mHp ${m.mHpStart}->${m.mHpLeft} logLines=${m.logLines} ---`);
      for (const line of m.log) console.log('  ' + line);
    }
  }
  for (const mt of res.matches) {
    for (const f of mt.matched) {
      sel++;
      console.log(`\n--- SCHOLAR-TRACE s${mt.seed} ${mt.mid} verdict=${mt.verdict} fightSeq=${f.fightSeq} d${f.dayStart} result=${f.result} fate=${f.fate} liftHp=${f.liftHp} liftTile=${JSON.stringify(f.liftTile)} fighterHp ${f.primaryHpStart}->${f.primaryHpEnd} aliveEnd=${f.primaryAliveEnd} restoredId=${f.restoredIdentity} restoredEntry=${f.restoredEntry} restoredHp=${f.restoredHp} censusPresentFightDay=${f.censusPresentOnFightDay} censusTileFightDay=${JSON.stringify(f.censusTileOnFightDay)} fighterHpCorroborates=${f.fighterHpCorroborates} ---`);
    }
    for (const nm of mt.nearMiss) {
      console.log(`--- NEAR-MISS s${mt.seed} ${mt.mid} fightSeq=${nm.fightSeq} d${nm.dayStart} fate=${nm.fate} liftHp=${nm.liftHp} lifted=${nm.lifted} failed=${JSON.stringify(nm.failed)} ---`);
    }
  }
  console.log(`\nSENSE-SELECTED=${sel}`);
  return sel;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-scholarmelt-a');
  if (args.indexOf('--sense') >= 0) { sense(evidDir); return; }
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-scholarmelt-a census ===');
  console.log(`corpusOk=${res.corpusOk} censusFilesOk=${res.censusFilesOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} mDealtMismatches=${res.mDealtMismatches} srChecked=${res.srChecked} srPrefixViolations=${res.srPrefixViolations}`);
  console.log(`WAVE-4 CENSUS: wild=${res.census.wild} raid=${res.census.raid} other=${res.census.other} ${JSON.stringify(res.census.otherChannels)}`);
  console.log(`CHAINS: total=${res.chains.length} fateCounts=${JSON.stringify(res.fateCounts)} vanishedSet=${JSON.stringify(res.vanishedSet)} expected=${JSON.stringify(res.expectedSet)} chainSetAgreement=${res.chainSetAgreement}`);
  console.log(`SCHOLAR TB: total=${res.fights.length} refusedExcluded=${res.refusedN} fateCounts=${JSON.stringify(res.fightFateCounts)} unclassified=${res.unclassifiedN} orphanAliveUnknown=${res.orphanAliveN}`);
  console.log(`SCHOLAR TB BY WAVE: ${JSON.stringify(res.fightFateByWave)}`);
  console.log(`SINK: allMelt=${res.sinkAllN} wave4Melt=${res.sinkW4N} wildNonTitanNonLingererMelt=${res.sinkWildN}`);
  console.log(`PER-SEED TB: ${JSON.stringify(res.perSeedTb)}`);
  for (const mt of res.matches) {
    console.log(`  VANISHED s${mt.seed} ${mt.mid} n=${mt.n} d${mt.firstDay}-d${mt.lastDay} remain=${mt.remainingHp} firstAbsentDay=${mt.firstAbsentDay} lastSeen=${mt.lastSeen} finalDay=${mt.finalDay} VERDICT=${mt.verdict} matchedN=${mt.matchedN} nearMissN=${mt.nearMiss.length}`);
    console.log(`    WHY: ${mt.verdictWhy}`);
    for (const f of mt.matched) console.log(`    MATCH fightSeq=${f.fightSeq} d${f.dayStart} result=${f.result} fate=${f.fate} liftHp=${f.liftHp} liftTile=${JSON.stringify(f.liftTile)} fighterHp=${f.primaryHpStart}->${f.primaryHpEnd} aliveEnd=${f.primaryAliveEnd} restoredId=${f.restoredIdentity} restoredEntry=${f.restoredEntry} censusPresentFightDay=${f.censusPresentOnFightDay} censusTileFightDay=${JSON.stringify(f.censusTileOnFightDay)} corroborates=${f.fighterHpCorroborates}`);
    for (const nm of mt.nearMiss) console.log(`    NEAR-MISS fightSeq=${nm.fightSeq} d${nm.dayStart} fate=${nm.fate} liftHp=${nm.liftHp} lifted=${nm.lifted} failed=${JSON.stringify(nm.failed)}`);
  }
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave1=${w.wave1reach} wave2=${w.wave2reach} wave3=${w.wave3reach} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`SUBSTRATE: all=${res.substrate.all} rows=${res.substrate.allRows} perSeedRows=${JSON.stringify(res.substrate.perSeedRowMinusScholarmelt)} census=${res.substrate.allCensus} perSeedCensus=${JSON.stringify(res.substrate.perSeedCensus)}`);
  console.log(`RECURRENCE-XCHECK: ${JSON.stringify(res.recurrenceCrossCheck)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} CLASSIFICATION=${res.classification ? 'PASS' : 'FAIL'} SUBSTRATE=${res.substrate.all ? 'PASS' : 'FAIL'} CHAINSET=${res.chainSetAgreement ? 'PASS' : 'FAIL'}`);
  if (!res.completeness || !res.classification || !res.substrate.all || !res.chainSetAgreement) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyFight, primaryMidOf, analyze, firstAbsentDay, sense, matchCandidate, stripScholarmelt };
