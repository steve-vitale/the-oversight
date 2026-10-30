#!/usr/bin/env node
// scripts/analyze-sameday-a.js — sim-sameday-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-sameday-a/s<seed>-fresh.json
//   (chainclose sweep copy + scholarmelt + removal + sameday
//   recorders, seeds 75101-75116) + census-s<seed>.json (enriched
//   daily world-monster snapshots, from the removal sweep).
// Joins: per seed, fp/dp/bl/sr/tj join by fight-order index, VERIFIED
// (mid, vid, day must match at every index), exactly as scholarmelt;
// PLUS sameday meeting join (sameday field-meeting events in order
// vs w4dpr meetings in order, by index AND day/vid/mid/mHpStart)
// and sameday fight join (sameday scholar-fight-start/refused
// events in order vs scholarmelt non-orphan meetings in order, by
// index AND dayStart/intendedMid/lift id+hp). Orphan-end rows have
// no start and are excluded from the fight join by construction.
// Universe: joined rows with fieldparty wave == 4 AND channel ==
// 'field' (wild shape only), all callers.
// Chains: REQUIRED from scripts/analyze-chainclose-a.js buildChains
// (the fixed (seed,mid) grouping — never re-implemented here, never
// edited there). Fates: REQUIRED from scripts/analyze-recurrence-a.js
// censusMatch/classifyFate/opportunity (censored = horizon-survived
// ONLY, endReason == 'survived' — never re-implemented).
// Scholar-fight classification: REQUIRED from
// scripts/analyze-scholarmelt-a.js classifyFight + firstAbsentDay
// (never re-implemented). The NEW window below is this arm's own
// prereg rule (matchSameday), kept separate from scholarmelt's
// strict-window matchCandidate so the two verdicts are never
// conflated: old-window verdicts are recomputed with
// matchCandidate AND quoted from the committed scholarmelt
// analysis, and the two must agree.
// Usage:
//   node scripts/analyze-sameday-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-sameday-a.js --sense (print vanished-chain
//     meeting logs + matched scholar trace rows + sameday stamps)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { buildChains } = require('./analyze-chainclose-a');
const { censusMatch, classifyFate, opportunity } = require('./analyze-recurrence-a');
const { classifyFight, firstAbsentDay, matchCandidate } = require('./analyze-scholarmelt-a');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
const RECURRENCE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-recurrence-a');
const SCHOLARMELT_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-scholarmelt-a');
// Expected vanished set, from recurrence evidence (the assigned 4).
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

// matchSameday(f, chain, fab, meetingStamp, fightStamp): the NEW
// window from sim-sameday-a-prereg.md. Returns {matched, failed[]}.
// Rules: same seed+mid is enforced by the caller (candidate filter);
// lifted, hp-exact, dayStart in [lastDay, fab] inclusive, no veteran
// primary fighter; SAME-DAY ONLY (dayStart == lastDay) additionally
// requires ORDER-PROVEN stamps: both stamps present, meeting.seq <
// fight.seq, meeting.dayPart <= fight.dayPart. Fights after lastDay
// match on day order alone (stamps corroborate, never gate).
function matchSameday(f, chain, fab, meetingStamp, fightStamp) {
  const failed = [];
  if (!(f.lifted === true)) failed.push('not-lifted');
  if (f.lift && f.lift.hp !== chain.remainingHp) failed.push(`hp-mismatch lift=${f.lift.hp} chain=${chain.remainingHp}`);
  if (!f.lift) failed.push('no-lift-snapshot');
  if (!(f.dayStart >= chain.lastDay)) failed.push(`before-last-day dayStart=${f.dayStart} lastDay=${chain.lastDay}`);
  if (fab != null && !(f.dayStart <= fab)) failed.push(`out-of-window dayStart=${f.dayStart} firstAbsentDay=${fab}`);
  if (f.fightersStart && f.fightersStart.length) {
    const prim = f.fightersStart.find(y => y && y.monsterId === chain.mid);
    if (prim && prim.veteran) failed.push('veteran-fighter-hp-unmatched');
  }
  if (f.dayStart === chain.lastDay) {
    if (!meetingStamp || !fightStamp) failed.push('same-day-stamp-missing');
    else {
      if (!(meetingStamp.seq < fightStamp.seq)) failed.push(`same-day-order-reversed meetingSeq=${meetingStamp.seq} fightSeqStamp=${fightStamp.seq}`);
      if (meetingStamp.dayPart != null && fightStamp.dayPart != null && !(meetingStamp.dayPart <= fightStamp.dayPart)) failed.push(`same-day-part-reversed meetingPart=${meetingStamp.dayPart} fightPart=${fightStamp.dayPart}`);
    }
  }
  return { matched: failed.length === 0, failed };
}

// Stamp-order judgment for a same-day matched/near-miss candidate,
// stated numerically for the evidence file (never derived from the
// match result — it IS the match's same-day leg).
function stampOrder(meetingStamp, fightStamp) {
  if (!meetingStamp || !fightStamp) return { order: 'ORDER-UNPROVEN', why: 'one or both sameday stamps missing' };
  if (!(meetingStamp.seq < fightStamp.seq)) return { order: 'ORDER-CONTRADICTION', why: `meeting seq ${meetingStamp.seq} is not before fight seq ${fightStamp.seq}` };
  if (meetingStamp.dayPart != null && fightStamp.dayPart != null && !(meetingStamp.dayPart <= fightStamp.dayPart)) return { order: 'ORDER-CONTRADICTION', why: `meeting dayPart ${meetingStamp.dayPart} is after fight dayPart ${fightStamp.dayPart}` };
  return { order: 'ORDER-PROVEN', why: `meeting seq ${meetingStamp.seq} < fight seq ${fightStamp.seq} and meeting dayPart ${meetingStamp.dayPart} <= fight dayPart ${fightStamp.dayPart}` };
}

// stripSameday(row): the substrate comparator's row transform — the
// three additive recorder fields removed, everything else untouched,
// so re-stringifying must reproduce chainclose's corpus bytes.
function stripSameday(row) {
  const copy = JSON.parse(JSON.stringify(row));
  delete copy.sameday;
  delete copy.scholarmelt;
  delete copy.removal;
  return copy;
}

// Meeting join comparator (sameday event vs w4dpr meeting, same index).
function meetingJoinOk(sd, dp) {
  return !!sd && !!dp && sd.day === dp.day && sd.vid === dp.vid && sd.mid === dp.mid && sd.mHpStart === dp.mHpStart;
}
// Fight join comparator (sameday event vs scholarmelt non-orphan row).
function fightJoinOk(sd, sm) {
  if (!sd || !sm) return false;
  if (sd.day !== sm.dayStart) return false;
  if (sd.intendedMid !== sm.intendedMid) return false;
  if (sm.lift) {
    if (!sd.lift) return false;
    if (sd.lift.id !== sm.lift.id || sd.lift.hp !== sm.lift.hp) return false;
  } else if (sd.lift) return false;
  return true;
}

function analyze(evidDir, chaincloseDir, recurrenceDir, scholarmeltDir) {
  evidDir = evidDir || path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a');
  chaincloseDir = chaincloseDir || CHAINCLOSE_DIR;
  recurrenceDir = recurrenceDir || RECURRENCE_DIR;
  scholarmeltDir = scholarmeltDir || SCHOLARMELT_DIR;
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
  const eventsOk = (s) => s && Array.isArray(s.events) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && (r.tilejoin === null || storeOk(r.tilejoin))
    && r.joinendlines && r.joinendlines.diag.errs === 0
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0)
    && storeOk(r.scholarmelt) && eventsOk(r.removal) && eventsOk(r.sameday));
  let joinErrors = 0, joinTotal = 0, mDealtMismatches = 0, srChecked = 0, srPrefixViolations = 0;
  let meetingJoinErrors = 0, meetingJoinTotal = 0, fightJoinErrors = 0, fightJoinTotal = 0;
  const joined = [];
  // Per-seed sameday join tables (needed to resolve stamps by index).
  const sdBySeed = {};
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
    // Sameday meeting join: sameday field-meeting events (non-threw)
    // in order vs w4dpr meetings in order.
    const sdEvents = ((r.sameday && r.sameday.events) || []);
    const sdMeetings = sdEvents.filter(x => x && x.kind === 'field-meeting' && !x.threw);
    const sdFights = sdEvents.filter(x => x && (x.kind === 'scholar-fight-start' || x.kind === 'scholar-fight-refused') && !x.threw);
    const smNonOrphan = ((r.scholarmelt && r.scholarmelt.meetings) || []).filter(x => x && x.kind !== 'orphan-end' && !x.threw);
    sdBySeed[r.seed] = { sdEvents, sdMeetings, sdFights, smNonOrphan, dpMeetings: dp };
    const mn = Math.min(sdMeetings.length, dp.length);
    meetingJoinTotal += mn;
    meetingJoinErrors += Math.abs(sdMeetings.length - dp.length);
    for (let i = 0; i < mn; i++) if (!meetingJoinOk(sdMeetings[i], dp[i])) meetingJoinErrors++;
    const fn = Math.min(sdFights.length, smNonOrphan.length);
    fightJoinTotal += fn;
    fightJoinErrors += Math.abs(sdFights.length - smNonOrphan.length);
    for (let i = 0; i < fn; i++) if (!fightJoinOk(sdFights[i], smNonOrphan[i])) fightJoinErrors++;
  }
  const completeness = corpusOk && joinErrors === 0 && mDealtMismatches === 0 && srPrefixViolations === 0 && censusFilesOk;
  const samedayJoinsOk = meetingJoinErrors === 0 && fightJoinErrors === 0;
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

  // --- scholar tb-combat census (reused classifyFight) ---
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

  // --- new-window chain matching (with stamps resolved by join index) ---
  // Quoted old verdicts from the committed scholarmelt analysis.
  let quotedOld = {};
  try {
    const sm = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-30', 'sim-scholarmelt-a-analysis.json'), 'utf8'));
    for (const m of (sm.matches || [])) quotedOld[`${m.seed}|${m.mid}`] = m.verdict;
  } catch (e) { quotedOld = { error: String((e && e.message) || e).slice(0, 120) }; }
  const matches = vanishedChains.map(c => {
    const cen = censusBySeed[c.seed];
    const fab = firstAbsentDay(cen, c.mid, c.remainingHp, c.lastDay);
    const fabUpper = (fab != null) ? fab : (cen && cen.snapshots && cen.snapshots.length ? cen.snapshots[cen.snapshots.length - 1].day : null);
    const sd = sdBySeed[c.seed];
    // Last-meeting stamp: w4dpr index of the chain's last meeting
    // (day + part + mid + mHpStart), then the sameday meeting event
    // at that same index (meeting join guarantees alignment).
    const lastM = c.meetings[c.meetings.length - 1];
    let lastMeetingIdx = -1;
    for (let i = 0; i < sd.dpMeetings.length; i++) {
      const d = sd.dpMeetings[i];
      if (d.day === lastM.day && d.part === lastM.part && d.mid === c.mid && d.mHpStart === lastM.mHpStart) { lastMeetingIdx = i; break; }
    }
    const meetingStamp = (lastMeetingIdx >= 0 && lastMeetingIdx < sd.sdMeetings.length) ? sd.sdMeetings[lastMeetingIdx] : null;
    const cands = [], nearMiss = [];
    for (const f of tbFights.filter(x => x.seed === c.seed)) {
      const midHit = (f.lift && f.lift.id === c.mid) || f.primaryMid === c.mid;
      if (!midHit) continue;
      if (!(f.dayStart >= c.lastDay && (fabUpper == null || f.dayStart <= fabUpper))) continue;
      // Fight stamp: scholarmelt non-orphan index of this fight,
      // then the sameday fight event at that same index.
      let smIdx = -1;
      for (let i = 0; i < sd.smNonOrphan.length; i++) if (sd.smNonOrphan[i].fightSeq === f.fightSeq) { smIdx = i; break; }
      const fightStamp = (smIdx >= 0 && smIdx < sd.sdFights.length) ? sd.sdFights[smIdx] : null;
      const { matched, failed } = matchSameday(f, c, fab, meetingStamp, fightStamp);
      const stamp = (f.dayStart === c.lastDay) ? stampOrder(meetingStamp, fightStamp) : null;
      const detail = { fightSeq: f.fightSeq, dayStart: f.dayStart, dayEnd: f.dayEnd,
        result: f.result, fate: f.fate, fateSub: f.fateSub, liftHp: f.lift ? f.lift.hp : null,
        liftTile: f.lift ? [f.lift.tx, f.lift.ty] : null, liftTitan: f.lift ? f.lift.titan : null,
        liftLingering: f.lift ? f.lift.lingering : null,
        primaryHpStart: f.primaryHpStart, primaryHpEnd: f.primaryHpEnd,
        primaryAliveEnd: f.primaryAliveEnd, restoredIdentity: f.restoredIdentity,
        restoredEntry: f.restoredEntry, restoredHp: f.restoredHp,
        meetingStamp: meetingStamp ? { seq: meetingStamp.seq, day: meetingStamp.day, dayPart: meetingStamp.dayPart, dayPartName: meetingStamp.dayPartName, partCounter: meetingStamp.partCounter, vid: meetingStamp.vid, mHpStart: meetingStamp.mHpStart, mHpLeft: meetingStamp.mHpLeft } : null,
        fightStamp: fightStamp ? { seq: fightStamp.seq, day: fightStamp.day, dayPart: fightStamp.dayPart, dayPartName: fightStamp.dayPartName, partCounter: fightStamp.partCounter } : null,
        stampOrder: stamp, failed };
      if (matched) cands.push(detail);
      else nearMiss.push(detail);
    }
    cands.sort((a, b) => (a.dayStart - b.dayStart) || (a.fightSeq - b.fightSeq));
    const first = cands[0] || null;
    let verdict = 'INSUFFICIENT-DATA', verdictWhy = 'no matched scholar fight in the new window [lastDay, firstAbsentDay] with stamped order for same-day fights';
    if (first) {
      if (first.fate === 'SCHOLAR-KILL') { verdict = 'scholar-kill'; verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, monster fighter dead`; }
      else if (first.fate === 'SCHOLAR-FLEE-MELT' || first.fate === 'DISSOLVED-MELT') {
        verdict = (first.dayStart === c.lastDay) ? 'SCHOLAR-MELT (primary, same-day stamped)' : 'scholar-flee-melt';
        verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, fate ${first.fate}, lifted hp ${first.liftHp} absent post-end${first.dayStart === c.lastDay ? `, stamp ${first.stampOrder ? first.stampOrder.order : 'n/a'}` : ''}`;
      } else { verdict = 'other'; verdictWhy = `matched fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result} fate ${first.fate} — not kill, not melt`; }
    }
    // Old-window recomputation (scholarmelt's strict rule) for the
    // comparison table — never this arm's verdict.
    let oldMatched = [];
    for (const f of tbFights.filter(x => x.seed === c.seed)) {
      const midHit = (f.lift && f.lift.id === c.mid) || f.primaryMid === c.mid;
      if (!midHit) continue;
      const mc = matchCandidate(f, c, fab);
      if (mc.matched) oldMatched.push(f.fightSeq);
    }
    let oldVerdict = 'INSUFFICIENT-DATA';
    if (oldMatched.length) {
      const of = tbFights.find(x => x.seed === c.seed && x.fightSeq === oldMatched[0]);
      if (of) oldVerdict = (of.fate === 'SCHOLAR-KILL') ? 'scholar-kill' : ((of.fate === 'SCHOLAR-FLEE-MELT' || of.fate === 'DISSOLVED-MELT') ? 'scholar-flee-melt' : 'other');
    }
    const key = `${c.seed}|${c.mid}`;
    const quoted = quotedOld[key] || null;
    return { seed: c.seed, mid: c.mid, n: c.n, firstDay: c.firstDay, lastDay: c.lastDay,
      remainingHp: c.remainingHp, firstAbsentDay: fab, finalDay: c.census.finalDay,
      lastSeen: c.census.lastSeen, lastMeetingIdx, verdict, verdictWhy,
      oldVerdictRecomputed: oldVerdict, oldVerdictQuoted: quoted,
      oldAgrees: (quoted == null) ? null : (quoted === oldVerdict),
      changedVsScholarmelt: (quoted != null && quoted !== verdict),
      matched: cands, matchedN: cands.length, nearMiss };
  });
  const unresolvedVanished = matches.filter(m => m.verdict === 'INSUFFICIENT-DATA').length;

  // --- removal cross-reference for the algorithm chain (own corpus) ---
  let removalXref = null;
  try {
    const row = rowBySeed[75102];
    const evs = ((row.removal && row.removal.events) || []).filter(e => e && e.type === 'removal' && e.monster && e.monster.id === 'algorithm' && e.day === 71);
    removalXref = evs.map(e => ({ seq: e.seq, day: e.day, hp: e.monster.hp, tx: e.monster.tx, ty: e.monster.ty, uid: e.monster.uid, stackFuncs: (e.stack && e.stack.funcs) || [] }));
  } catch (e) { removalXref = { error: String((e && e.message) || e).slice(0, 120) }; }

  // --- substrate equivalence ---
  const substrate = { perSeedRowMinusThree: {}, perSeedStrippedCensus: {}, allRows: true, allStrippedCensus: true };
  for (const seed of SEEDS) {
    try {
      const own = stripSameday(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
      const ownBytes = Buffer.from(JSON.stringify(own, null, 1) + '\n');
      const ccBytes = fs.readFileSync(path.join(chaincloseDir, `s${seed}-fresh.json`));
      substrate.perSeedRowMinusThree[seed] = ownBytes.equals(ccBytes);
    } catch (e) { substrate.perSeedRowMinusThree[seed] = false; }
    if (!substrate.perSeedRowMinusThree[seed]) substrate.allRows = false;
    try {
      const ownC = JSON.parse(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`), 'utf8'));
      const stripped = { seed: ownC.seed, snapshots: (ownC.snapshots || []).map(s => ({ day: s.day, monsters: (s.monsters || []).map(m => ({ id: m.id, tx: m.tx, ty: m.ty, hp: m.hp })) })) };
      const strippedBytes = Buffer.from(JSON.stringify(stripped, null, 1) + '\n');
      const recBytes = fs.readFileSync(path.join(recurrenceDir, `census-s${seed}.json`));
      substrate.perSeedStrippedCensus[seed] = strippedBytes.equals(recBytes);
    } catch (e) { substrate.perSeedStrippedCensus[seed] = false; }
    if (!substrate.perSeedStrippedCensus[seed]) substrate.allStrippedCensus = false;
  }
  substrate.all = substrate.allRows;
  // Diagnostic: own scholarmelt meetings vs committed scholarmelt corpus.
  let scholarmeltDiag = null;
  try {
    let same = 0, diff = 0, diffSeeds = [];
    for (const seed of SEEDS) {
      const own = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
      const old = JSON.parse(fs.readFileSync(path.join(scholarmeltDir, `s${seed}-fresh.json`), 'utf8'));
      const a = JSON.stringify((own.scholarmelt && own.scholarmelt.meetings) || []);
      const b = JSON.stringify((old.scholarmelt && old.scholarmelt.meetings) || []);
      if (a === b) same++; else { diff++; diffSeeds.push(seed); }
    }
    scholarmeltDiag = { seedsIdentical: same, seedsDiffering: diff, diffSeeds };
  } catch (e) { scholarmeltDiag = { error: String((e && e.message) || e).slice(0, 120) }; }

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
    sdEvents: ((r.sameday && r.sameday.events) || []).length,
    censusSnapshots: ((censusBySeed[r.seed] || {}).snapshots || []).length }));

  return { corpusOk, censusFilesOk, completeness, joinTotal, joinErrors, mDealtMismatches,
    srChecked, srPrefixViolations,
    meetingJoinTotal, meetingJoinErrors, fightJoinTotal, fightJoinErrors, samedayJoinsOk,
    census, wildN: U.length, chains: chainTables,
    fateCounts, vanishedChains: vanishedChains.map(c => ({ seed: c.seed, mid: c.mid, n: c.n,
      firstDay: c.firstDay, lastDay: c.lastDay, remainingHp: c.remainingHp })),
    vanishedSet, expectedSet, chainSetAgreement,
    fights: tbFights, refusedN, fightFateCounts, fightFateByWave, unclassifiedN,
    orphanAliveN, perSeedTb, sinkAllN: sinkAll.length, sinkW4N: sinkW4.length,
    sinkWildN: sinkWild.length,
    sinkAll: sinkAll.map(f => ({ seed: f.seed, fightSeq: f.fightSeq, dayStart: f.dayStart,
      primaryMid: f.primaryMid, primaryWave: f.primaryWave, result: f.result, fate: f.fate })),
    matches, unresolvedVanished, removalXref, substrate, scholarmeltDiag,
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
  console.log('SENSE-RULE: every meeting log of the 4 vanished chains (w4dpr rec.log) + matched scholar trace rows + sameday stamps for the algorithm chain');
  for (const c of res.chains) {
    if (!vanishedKeys.has(`${c.seed}|${c.mid}`)) continue;
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
      console.log(`\n--- SCHOLAR-TRACE s${mt.seed} ${mt.mid} newVerdict=${mt.verdict} oldQuoted=${mt.oldVerdictQuoted} fightSeq=${f.fightSeq} d${f.dayStart} result=${f.result} fate=${f.fate} liftHp=${f.liftHp} liftTile=${JSON.stringify(f.liftTile)} fighterHp=${f.primaryHpStart}->${f.primaryHpEnd} aliveEnd=${f.primaryAliveEnd} restoredId=${f.restoredIdentity} restoredEntry=${f.restoredEntry} restoredHp=${f.restoredHp} stampOrder=${f.stampOrder ? f.stampOrder.order : 'n/a'} (${f.stampOrder ? f.stampOrder.why : ''}) meetingStamp=${JSON.stringify(f.meetingStamp)} fightStamp=${JSON.stringify(f.fightStamp)} ---`);
    }
    for (const nm of mt.nearMiss) {
      console.log(`--- NEAR-MISS s${mt.seed} ${mt.mid} fightSeq=${nm.fightSeq} d${nm.dayStart} fate=${nm.fate} liftHp=${nm.liftHp} failed=${JSON.stringify(nm.failed)} stampOrder=${nm.stampOrder ? nm.stampOrder.order : 'n/a'} meetingStamp=${JSON.stringify(nm.meetingStamp)} fightStamp=${JSON.stringify(nm.fightStamp)} ---`);
    }
  }
  console.log(`\nREMOVAL-XREF algorithm d71: ${JSON.stringify(res.removalXref)}`);
  console.log(`\nSENSE-SELECTED=${sel}`);
  return sel;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a');
  if (args.indexOf('--sense') >= 0) { sense(evidDir); return; }
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-sameday-a census ===');
  console.log(`corpusOk=${res.corpusOk} censusFilesOk=${res.censusFilesOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} mDealtMismatches=${res.mDealtMismatches} srChecked=${res.srChecked} srPrefixViolations=${res.srPrefixViolations}`);
  console.log(`SAMEDAY JOINS: meetingJoin=${res.meetingJoinTotal} errors=${res.meetingJoinErrors} fightJoin=${res.fightJoinTotal} errors=${res.fightJoinErrors} ok=${res.samedayJoinsOk}`);
  console.log(`WAVE-4 CENSUS: wild=${res.census.wild} raid=${res.census.raid} other=${res.census.other} ${JSON.stringify(res.census.otherChannels)}`);
  console.log(`CHAINS: total=${res.chains.length} fateCounts=${JSON.stringify(res.fateCounts)} vanishedSet=${JSON.stringify(res.vanishedSet)} expected=${JSON.stringify(res.expectedSet)} chainSetAgreement=${res.chainSetAgreement}`);
  console.log(`SCHOLAR TB: total=${res.fights.length} refusedExcluded=${res.refusedN} fateCounts=${JSON.stringify(res.fightFateCounts)} unclassified=${res.unclassifiedN} (orphan rows, cannot match a chain: no lift) orphanAliveUnknown=${res.orphanAliveN}`);
  console.log(`SCHOLAR TB BY WAVE: ${JSON.stringify(res.fightFateByWave)}`);
  console.log(`SINK (context, re-derived): allMelt=${res.sinkAllN} wave4Melt=${res.sinkW4N} wildNonTitanNonLingererMelt=${res.sinkWildN}`);
  console.log(`PER-SEED TB: ${JSON.stringify(res.perSeedTb)}`);
  for (const mt of res.matches) {
    console.log(`  VANISHED s${mt.seed} ${mt.mid} n=${mt.n} d${mt.firstDay}-d${mt.lastDay} remain=${mt.remainingHp} firstAbsentDay=${mt.firstAbsentDay} lastSeen=${mt.lastSeen} finalDay=${mt.finalDay} NEW-VERDICT=${mt.verdict} oldQuoted=${mt.oldVerdictQuoted} oldRecomputed=${mt.oldVerdictRecomputed} oldAgrees=${mt.oldAgrees} changed=${mt.changedVsScholarmelt} matchedN=${mt.matchedN} nearMissN=${mt.nearMiss.length}`);
    console.log(`    WHY: ${mt.verdictWhy}`);
    for (const f of mt.matched) console.log(`    MATCH fightSeq=${f.fightSeq} d${f.dayStart} result=${f.result} fate=${f.fate} liftHp=${f.liftHp} liftTile=${JSON.stringify(f.liftTile)} fighterHp=${f.primaryHpStart}->${f.primaryHpEnd} aliveEnd=${f.primaryAliveEnd} restoredId=${f.restoredIdentity} restoredEntry=${f.restoredEntry} stampOrder=${f.stampOrder ? f.stampOrder.order : 'n/a'} meetingStamp=${JSON.stringify(f.meetingStamp)} fightStamp=${JSON.stringify(f.fightStamp)}`);
    for (const nm of mt.nearMiss) console.log(`    NEAR-MISS fightSeq=${nm.fightSeq} d${nm.dayStart} fate=${nm.fate} liftHp=${nm.liftHp} failed=${JSON.stringify(nm.failed)} stampOrder=${nm.stampOrder ? nm.stampOrder.order : 'n/a'}`);
  }
  console.log(`REMOVAL-XREF algorithm d71: ${JSON.stringify(res.removalXref)}`);
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave1=${w.wave1reach} wave2=${w.wave2reach} wave3=${w.wave3reach} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`SUBSTRATE: all=${res.substrate.all} rows=${res.substrate.allRows} perSeedRows=${JSON.stringify(res.substrate.perSeedRowMinusThree)} strippedCensus=${res.substrate.allStrippedCensus} perSeedStripped=${JSON.stringify(res.substrate.perSeedStrippedCensus)}`);
  console.log(`SCHOLARMELT-DIAG (own vs committed corpus): ${JSON.stringify(res.scholarmeltDiag)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} SAMEDAY-JOINS=${res.samedayJoinsOk ? 'PASS' : 'FAIL'} SUBSTRATE=${res.substrate.all ? 'PASS' : 'FAIL'} CHAINSET=${res.chainSetAgreement ? 'PASS' : 'FAIL'}`);
  if (!res.completeness || !res.samedayJoinsOk || !res.substrate.all || !res.chainSetAgreement) process.exit(1);
}
if (require.main === module) main();
module.exports = { analyze, matchSameday, stampOrder, stripSameday, meetingJoinOk, fightJoinOk, sense };
