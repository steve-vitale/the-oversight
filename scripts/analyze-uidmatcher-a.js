#!/usr/bin/env node
// scripts/analyze-uidmatcher-a.js — sim-uidmatcher-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Judged corpus: evidence/2026-10-30/perseed-sameday-a/ (committed:
// row + enriched uid census per seed, one run carrying w4dpr field
// meetings, scholarmelt scholar fights, removal spawn/removal events
// with object-identity uid, and sameday part/sequence stamps).
// ANTI-SMUGGLING: this file reads NO prior arm's verdict or analysis
// file. Prior verdicts appear only in the evidence file's comparison
// table, quoted there with their prereg labels — never here.
// Chains: REQUIRED buildChains (analyze-chainclose-a). Fates:
// REQUIRED censusMatch/classifyFate/opportunity (analyze-recurrence-a).
// Scholar fights: REQUIRED classifyFight/firstAbsentDay
// (analyze-scholarmelt-a). Removals/drops: REQUIRED classifyRemoval/
// classifyDrop/uidTrajectories/uidDrops/perIdDrops (analyze-removal-a).
// Stamp joins: REQUIRED meetingJoinOk/fightJoinOk + stripSameday
// (analyze-sameday-a). All-channel meetings: REQUIRED joinAllChannel
// (analyze-spawnhp-a). Nothing below re-implements any of those.
// Usage:
//   node scripts/analyze-uidmatcher-a.js [--out <path>] [--seeds 75102,75116]
//   node scripts/analyze-uidmatcher-a.js --sense (print judged-chain logs)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { buildChains } = require('./analyze-chainclose-a');
const { censusMatch, classifyFate, opportunity } = require('./analyze-recurrence-a');
const { classifyFight, firstAbsentDay } = require('./analyze-scholarmelt-a');
const { classifyRemoval, classifyDrop, uidTrajectories, uidDrops, perIdDrops } = require('./analyze-removal-a');
const { meetingJoinOk, fightJoinOk, stripSameday } = require('./analyze-sameday-a');
const { joinAllChannel } = require('./analyze-spawnhp-a');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const SAMEDAY_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a');
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
const EXPECTED_VANISHED = [[75102, 'algorithm'], [75102, 'eulogy'], [75116, 'audit'], [75116, 'suburb']];
const HAVEN_TILE = '4,4';

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function stackHas(ev, name) {
  const funcs = (ev && ev.stack && ev.stack.funcs) || [];
  return funcs.some(f => f === name || f.endsWith('.' + name) || f.indexOf(name) >= 0);
}

// resolveChainUid(chain, census, events): prereg Step 1.
// chain: {seed, mid, meetings:[{day, mHpStart, mHpLeft}]}.
// Returns {status:'RESOLVED', uid, traj, maxHp, checks} |
//         {status:'UNRESOLVED', reason, candidates:[uids]} |
//         {status:'AMBIGUOUS', candidates:[uids]}.
function resolveChainUid(chain, census, events) {
  const trajs = uidTrajectories(census);
  const firstSpawn = {};
  for (const ev of (events || [])) {
    if (ev && ev.type === 'spawn' && ev.monster && ev.monster.uid != null
      && firstSpawn[ev.monster.uid] == null) firstSpawn[ev.monster.uid] = ev;
  }
  const candidates = [];
  const rejected = [];
  for (const uidKey of Object.keys(trajs)) {
    const uid = Number(uidKey);
    const traj = trajs[uidKey];
    if (!traj.length) continue;
    if (traj[0].id !== chain.mid) continue;
    if ((traj[0].wave | 0) !== 4) continue;
    const spawn = firstSpawn[uid];
    if (!spawn || (spawn.monster && spawn.monster.id !== chain.mid)) {
      rejected.push({ uid, reason: 'no-spawn-event-for-uid' });
      continue;
    }
    let hits = 0, failed = null;
    for (const m of chain.meetings) {
      const entry = traj.find(e => e.day === m.day);
      if (entry) {
        hits++;
        if ((entry.hp | 0) !== (m.mHpStart | 0)) { failed = `census day ${m.day} hp ${entry.hp} != meeting mHpStart ${m.mHpStart}`; break; }
        continue;
      }
      // Prereg correction #2: spawn-day check, only when no census
      // entry exists on the meeting day. The uid's first spawn on
      // the meeting day at mHpStart + next-day census at mHpLeft
      // is the same start-of-day logic with the birth as the start.
      const spawnDay = spawn && spawn.monster ? spawn : null;
      if (spawnDay && spawnDay.day === m.day && (spawnDay.monster.hp | 0) === (m.mHpStart | 0)) {
        const nextEntry = traj.find(e => e.day === m.day + 1);
        if (nextEntry && (nextEntry.hp | 0) === (m.mHpLeft | 0)) { hits++; continue; }
        failed = `spawn-day-check-failed day ${m.day}`;
        break;
      }
      // No census entry and no passing spawn-day check: unchecked,
      // neither proves nor vetoes this meeting.
    }
    if (failed) { rejected.push({ uid, reason: 'hp-check-failed: ' + failed }); continue; }
    if (hits < 1) { rejected.push({ uid, reason: 'no-census-hit-on-meeting-day' }); continue; }
    candidates.push({ uid, traj, maxHp: traj[0].maxHp, hits });
  }
  if (candidates.length === 1) {
    return { status: 'RESOLVED', uid: candidates[0].uid, traj: candidates[0].traj,
      maxHp: candidates[0].maxHp, hits: candidates[0].hits };
  }
  if (candidates.length > 1) {
    return { status: 'AMBIGUOUS', candidates: candidates.map(c => c.uid), rejected };
  }
  return { status: 'UNRESOLVED', reason: rejected.length ? rejected.map(r => `uid ${r.uid}: ${r.reason}`).join('; ') : 'no uid trajectory with id ' + chain.mid, candidates: [], rejected };
}

// uidFirstAbsence(census, uid, lastDay): first snapshot day after
// lastDay on which the uid is absent, or null if never absent.
function uidFirstAbsence(census, uid, lastDay) {
  const snaps = ((census && census.snapshots) || []).slice().sort((a, b) => a.day - b.day);
  for (const sn of snaps) {
    if (sn.day <= lastDay) continue;
    const present = (sn.monsters || []).some(m => m.uid === uid);
    if (!present) return sn.day;
  }
  return null;
}

// linkFight(f, chain, resolution, events, stamps): prereg Step 2.
// stamps: {meetingStamp, fightStamp} (may be nulls).
// Returns {linked, failed[], bridge} where bridge is
// {chainHp, liftHp, tollShaped} when hp differs.
function linkFight(f, chain, resolution, events, stamps) {
  const failed = [];
  if (!(f.lift && f.lift.id === chain.mid)) failed.push('lift-id-mismatch');
  if (!(f.lifted === true)) failed.push('not-lifted');
  const rem = (events || []).find(e => e && e.type === 'removal' && e.monster
    && e.monster.uid === resolution.uid && e.day === f.dayStart
    && e.monster.hp === (f.lift ? f.lift.hp : null) && stackHas(e, 'startCombat'));
  if (!rem) failed.push(`no removal event for uid ${resolution.uid} on fight day ${f.dayStart} at lift hp ${f.lift ? f.lift.hp : null} with startCombat stack`);
  if (!(f.dayStart >= chain.lastDay)) failed.push(`before-last-day dayStart=${f.dayStart} lastDay=${chain.lastDay}`);
  if (chain.windowUpper != null && !(f.dayStart <= chain.windowUpper)) failed.push(`out-of-window dayStart=${f.dayStart} windowUpper=${chain.windowUpper}`);
  let stampOrder = null;
  if (f.dayStart === chain.lastDay) {
    const ms = stamps ? stamps.meetingStamp : null;
    const fs = stamps ? stamps.fightStamp : null;
    if (!ms || !fs) failed.push('same-day-stamp-missing');
    else if (!(ms.seq < fs.seq)) failed.push(`same-day-order-reversed meetingSeq=${ms.seq} fightSeqStamp=${fs.seq}`);
    else if (ms.dayPart != null && fs.dayPart != null && !(ms.dayPart <= fs.dayPart)) failed.push(`same-day-part-reversed meetingPart=${ms.dayPart} fightPart=${fs.dayPart}`);
    else stampOrder = { order: 'ORDER-PROVEN', why: `meeting seq ${ms.seq} < fight seq ${fs.seq} and meeting dayPart ${ms.dayPart} <= fight dayPart ${fs.dayPart}` };
  }
  const bridge = (f.lift && f.lift.hp !== chain.remainingHp)
    ? { chainHp: chain.remainingHp, liftHp: f.lift.hp,
        tollShaped: resolution.maxHp != null && (chain.remainingHp - f.lift.hp) === Math.round(resolution.maxHp * 0.25) }
    : null;
  return { linked: failed.length === 0, failed, bridge, removalSeq: rem ? rem.seq : null, stampOrder };
}

// judgeChain(chain, ctx): prereg Step 3. ctx: {census, events,
// smFights, stampsFor(fightSeq)->{meetingStamp, fightStamp}}.
// Returns the verdict record (never reads a prior arm's verdict).
function judgeChain(chain, ctx) {
  const resolution = resolveChainUid(chain, ctx.census, ctx.events);
  const base = { seed: chain.seed, mid: chain.mid, n: chain.meetings.length,
    firstDay: chain.meetings[0].day, lastDay: chain.lastDay,
    remainingHp: chain.remainingHp, resolution };
  if (resolution.status !== 'RESOLVED') {
    return Object.assign(base, { verdict: 'INSUFFICIENT-DATA',
      verdictWhy: `chain→uid ${resolution.status}: ${resolution.reason || ('candidates ' + (resolution.candidates || []).join(','))}`,
      missingLink: 'chain-uid-resolution', fight: null, removal: null });
  }
  const uid = resolution.uid;
  const fabUid = uidFirstAbsence(ctx.census, uid, chain.lastDay);
  const fabHp = firstAbsentDay(ctx.census, chain.mid, chain.remainingHp, chain.lastDay);
  const windowUpper = (fabUid != null) ? fabUid : fabHp;
  const chainW = Object.assign({}, chain, { windowUpper });
  const cands = [], nearMiss = [];
  for (const f of (ctx.smFights || [])) {
    if (!(f.lift && f.lift.id === chain.mid)) continue;
    if (!(f.dayStart >= chain.lastDay && (windowUpper == null || f.dayStart <= windowUpper))) continue;
    const stamps = ctx.stampsFor ? ctx.stampsFor(f.fightSeq) : { meetingStamp: null, fightStamp: null };
    const link = linkFight(f, chainW, resolution, ctx.events, stamps);
    const cls = classifyFight(f);
    const detail = { fightSeq: f.fightSeq, dayStart: f.dayStart, result: f.result,
      fate: cls.fate, fateSub: cls.sub, fateWhy: cls.why,
      liftHp: f.lift ? f.lift.hp : null, liftTile: f.lift ? [f.lift.tx, f.lift.ty] : null,
      liftLingering: f.lift ? f.lift.lingering : null,
      restoredIdentity: f.restoredIdentity, restoredEntry: f.restoredEntry, restoredHp: f.restoredHp,
      linkFailed: link.failed, bridge: link.bridge, removalSeq: link.removalSeq,
      stampOrder: link.stampOrder,
      meetingStamp: stamps.meetingStamp ? { seq: stamps.meetingStamp.seq, day: stamps.meetingStamp.day, dayPart: stamps.meetingStamp.dayPart } : null,
      fightStamp: stamps.fightStamp ? { seq: stamps.fightStamp.seq, day: stamps.fightStamp.day, dayPart: stamps.fightStamp.dayPart } : null };
    if (link.linked) cands.push(detail); else nearMiss.push(detail);
  }
  cands.sort((a, b) => (a.dayStart - b.dayStart) || (a.fightSeq - b.fightSeq));
  const first = cands[0] || null;
  if (first) {
    if (first.fate === 'SCHOLAR-FLEE-MELT' || first.fate === 'DISSOLVED-MELT') {
      return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: 'SCHOLAR-MELT (uid-first)',
        verdictWhy: `uid-linked fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, fate ${first.fate}, lift ${first.liftHp}${first.bridge ? ` (bridge ${first.bridge.chainHp}→${first.bridge.liftHp}${first.bridge.tollShaped ? ', toll-shaped' : ''})` : ''}`,
        missingLink: null, fight: first, removal: null });
    }
    if (first.fate === 'SCHOLAR-KILL') {
      return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: 'SCHOLAR-KILL',
        verdictWhy: `uid-linked fightSeq ${first.fightSeq} d${first.dayStart} result ${first.result}, monster fighter dead`,
        missingLink: null, fight: first, removal: null });
    }
    if (first.fate === 'SCHOLAR-RESTORED') {
      // NOT-AN-END: fall through to the removal rule below.
      const rem = uidRemovalInWindow(ctx.events, uid, chain.lastDay, windowUpper);
      if (rem) {
        const c = classifyRemoval(rem.ev, ctx.smFights);
        return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: c.cls,
          verdictWhy: `uid-linked fightSeq ${first.fightSeq} was RESTORED (not an end); later uid removal seq ${rem.ev.seq} d${rem.ev.day} class ${c.cls}: ${c.evidence}`,
          missingLink: null, fight: first, removal: { seq: rem.ev.seq, day: rem.ev.day, cls: c.cls, evidence: c.evidence } });
      }
      return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: 'INSUFFICIENT-DATA',
        verdictWhy: `only uid-linked fightSeq ${first.fightSeq} was RESTORED (beast came back) and no later uid removal exists in the window`,
        missingLink: 'post-restore-end', fight: first, removal: null });
    }
    return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: 'INSUFFICIENT-DATA',
      verdictWhy: `uid-linked fightSeq ${first.fightSeq} classified ${first.fate} (${first.fateWhy}), not an end class`,
      missingLink: 'fight-fate-not-an-end', fight: first, removal: null });
  }
  const rem = uidRemovalInWindow(ctx.events, uid, chain.lastDay, windowUpper);
  if (rem) {
    const c = classifyRemoval(rem.ev, ctx.smFights);
    return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: c.cls,
      verdictWhy: `no uid-linked fight; uid removal seq ${rem.ev.seq} d${rem.ev.day} class ${c.cls}: ${c.evidence}`,
      missingLink: null, fight: null, removal: { seq: rem.ev.seq, day: rem.ev.day, cls: c.cls, evidence: c.evidence } });
  }
  return Object.assign(base, { fabUid, fabHp, windowUpper, verdict: 'INSUFFICIENT-DATA',
    verdictWhy: 'no uid-linked scholar fight and no uid removal event in the window [lastDay, windowUpper]',
    missingLink: nearMiss.length ? ('near-miss fights exist: ' + nearMiss.map(n => `fightSeq ${n.fightSeq} d${n.dayStart} failed(${n.linkFailed.join('; ')})`).join(' | ')) : 'no uid-linked fight, no uid removal',
    fight: null, removal: null, nearMiss });
}
function uidRemovalInWindow(events, uid, lastDay, windowUpper) {
  const list = (events || []).filter(e => e && e.type === 'removal' && e.monster
    && e.monster.uid === uid && e.day >= lastDay && (windowUpper == null || e.day <= windowUpper));
  list.sort((a, b) => (a.day - b.day) || (a.seq - b.seq));
  return list.length ? { ev: list[0] } : null;
}

function analyze(evidDir, seedFilter) {
  evidDir = evidDir || SAMEDAY_DIR;
  const seeds = seedFilter || SEEDS;
  const rows = [], censusBySeed = {};
  let censusFilesOk = true;
  const censusInfo = {};
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
    rows.push(row);
    try {
      const c = JSON.parse(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`), 'utf8'));
      censusBySeed[seed] = c;
      const snaps = (c && c.snapshots) || [];
      const sorted = snaps.every((s, i) => i === 0 || s.day === null || snaps[i - 1].day === null || s.day >= snaps[i - 1].day);
      const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
      const uidOk = snaps.every(sn => (sn.monsters || []).every(m => m.uid != null));
      censusInfo[seed] = { snapshots: snaps.length, sorted, lastDay,
        within1: lastDay !== null && Math.abs(lastDay - row.days) <= 1, uidOk };
      if (!sorted || lastDay === null || Math.abs(lastDay - row.days) > 1 || !uidOk) censusFilesOk = false;
    } catch (e) { censusBySeed[seed] = null; censusFilesOk = false; censusInfo[seed] = { snapshots: 0, sorted: false, lastDay: null, within1: false, uidOk: false, error: String((e && e.message) || e).slice(0, 120) }; }
  }
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const eventsOk = (s) => s && Array.isArray(s.events) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === seeds.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && storeOk(r.scholarmelt) && eventsOk(r.removal) && eventsOk(r.sameday));
  // Substrate: row minus the three additive fields vs chainclose bytes.
  const substrate = {};
  let substrateOk = true;
  for (const row of rows) {
    let same = false;
    try {
      const mine = JSON.stringify(stripSameday(row), null, 1) + '\n';
      const theirs = fs.readFileSync(path.join(CHAINCLOSE_DIR, `s${row.seed}-fresh.json`), 'utf8');
      same = (mine === theirs);
    } catch (e) { same = false; }
    substrate[row.seed] = same;
    if (!same) substrateOk = false;
  }
  // Joins + sameday stamp joins.
  let joinErrors = 0, joinTotal = 0, meetingJoinErrors = 0, meetingJoinTotal = 0,
    fightJoinErrors = 0, fightJoinTotal = 0;
  const joined = [];
  const sdBySeed = {};
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [], bl = r.breakline.meetings || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    joinErrors += Math.abs(fp.length - dp.length) + Math.abs(fp.length - bl.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day) { joinErrors++; continue; }
      joined.push({ seed: r.seed, fp: a, dp: b, bl: c });
    }
    const sdEvents = ((r.sameday && r.sameday.events) || []);
    const sdMeetings = sdEvents.filter(x => x && x.kind === 'field-meeting' && !x.threw);
    const sdFights = sdEvents.filter(x => x && (x.kind === 'scholar-fight-start' || x.kind === 'scholar-fight-refused') && !x.threw);
    const smNonOrphan = ((r.scholarmelt && r.scholarmelt.meetings) || []).filter(x => x && x.kind !== 'orphan-end' && !x.threw);
    sdBySeed[r.seed] = { sdMeetings, sdFights, smNonOrphan, dpMeetings: dp };
    const mn = Math.min(sdMeetings.length, dp.length);
    meetingJoinTotal += mn;
    meetingJoinErrors += Math.abs(sdMeetings.length - dp.length);
    for (let i = 0; i < mn; i++) if (!meetingJoinOk(sdMeetings[i], dp[i])) meetingJoinErrors++;
    const fn = Math.min(sdFights.length, smNonOrphan.length);
    fightJoinTotal += fn;
    fightJoinErrors += Math.abs(sdFights.length - smNonOrphan.length);
    for (let i = 0; i < fn; i++) if (!fightJoinOk(sdFights[i], smNonOrphan[i])) fightJoinErrors++;
  }
  const w4all = joined.filter(j => (j.fp.wave | 0) === 4);
  const U = w4all.filter(j => j.fp.channel === 'field').map(j => ({
    seed: j.seed, day: j.fp.day, part: j.fp.part, mid: j.fp.mid,
    outcome: j.bl.outcome, rounds: j.bl.rounds, mDealt: (j.bl.mDealt | 0),
    mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft,
    mTile: j.fp.mTile || null, log: j.dp.log || [],
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
    const lastM = ms[ms.length - 1];
    const lastMeeting = U.find(m => m.seed === c.seed && m.day === lastDay && m.part === lastM.part && m.mid === c.mid);
    const beastLastTile = lastMeeting ? lastMeeting.mTile : null;
    const chain = { seed: c.seed, mid: c.mid, n: ms.length, firstDay, lastDay,
      openingHp: c.openingHp, remainingHp: c.lastLeft, breakReason: c.breakReason || null,
      beastLastTile, windowDays: row.days - lastDay,
      meetings: ms.map(m => ({ day: m.day, part: m.part, outcome: m.outcome, rounds: m.rounds,
        mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, mDealt: m.mDealt })) };
    const cm = censusMatch(censusBySeed[c.seed], c.mid, c.lastLeft, lastDay);
    const opp = opportunity({ lastDay, mid: c.mid, beastLastTile, windowDays: chain.windowDays }, fpBySeed[c.seed]);
    const fate = classifyFate({ n: ms.length, lastDay, remainingHp: c.lastLeft }, row, cm, opp);
    return Object.assign(chain, { fate: fate.fate, fateWhy: fate.why });
  });
  const fateCounts = {};
  for (const c of chainTables) fateCounts[c.fate] = (fateCounts[c.fate] || 0) + 1;
  const vanishedChains = chainTables.filter(c => c.fate === 'BEAST-VANISHED');
  const vanishedSet = vanishedChains.map(c => `${c.seed}|${c.mid}`).sort();
  const expectedSet = EXPECTED_VANISHED.map(p => `${p[0]}|${p[1]}`).sort();
  // Uid consistency: one uid never carries two monster ids.
  const uidIdConflicts = [];
  for (const seed of seeds) {
    const seen = {};
    for (const sn of ((censusBySeed[seed] || {}).snapshots || [])) {
      for (const m of (sn.monsters || [])) {
        if (m.uid == null) continue;
        if (seen[m.uid] && seen[m.uid] !== m.id) uidIdConflicts.push({ seed, uid: m.uid, ids: [seen[m.uid], m.id] });
        seen[m.uid] = m.id;
      }
    }
    for (const ev of ((rowBySeed[seed].removal && rowBySeed[seed].removal.events) || [])) {
      if (ev.monster && ev.monster.uid != null) {
        if (seen[ev.monster.uid] && seen[ev.monster.uid] !== ev.monster.id) uidIdConflicts.push({ seed, uid: ev.monster.uid, ids: [seen[ev.monster.uid], ev.monster.id], source: 'removal-event' });
        seen[ev.monster.uid] = ev.monster.id;
      }
    }
  }
  // Judge the vanished chains uid-first.
  const judgments = vanishedChains.map(c => {
    const row = rowBySeed[c.seed];
    const sd = sdBySeed[c.seed];
    const lastM = c.meetings[c.meetings.length - 1];
    let lastMeetingIdx = -1;
    for (let i = 0; i < sd.dpMeetings.length; i++) {
      const d = sd.dpMeetings[i];
      if (d.day === lastM.day && d.part === lastM.part && d.mid === c.mid && d.mHpStart === lastM.mHpStart) { lastMeetingIdx = i; break; }
    }
    const meetingStamp = (lastMeetingIdx >= 0 && lastMeetingIdx < sd.sdMeetings.length) ? sd.sdMeetings[lastMeetingIdx] : null;
    const stampsFor = (fightSeq) => {
      let smIdx = -1;
      for (let i = 0; i < sd.smNonOrphan.length; i++) if (sd.smNonOrphan[i].fightSeq === fightSeq) { smIdx = i; break; }
      const fightStamp = (smIdx >= 0 && smIdx < sd.sdFights.length) ? sd.sdFights[smIdx] : null;
      return { meetingStamp, fightStamp };
    };
    const judged = judgeChain(c, { census: censusBySeed[c.seed],
      events: (row.removal && row.removal.events) || [],
      smFights: (row.scholarmelt && row.scholarmelt.meetings) || [], stampsFor });
    return Object.assign({ fate: c.fate, fateWhy: c.fateWhy, beastLastTile: c.beastLastTile }, judged);
  });
  // Band drops: uid-first vs per-id, classified with REQUIRED classifyDrop.
  const { meetings: allW4 } = joinAllChannel(evidDir, seeds);
  const dropRows = [];
  for (const seed of seeds) {
    const cen = censusBySeed[seed];
    const row = rowBySeed[seed];
    const uid = uidDrops(cen);
    const perId = perIdDrops(cen);
    const perIdKeys = new Set(perId.map(d => `${d.mid}|${d.fromDay}|${d.toDay}|${d.fromHp}|${d.toHp}`));
    const ctx = { events: (row.removal && row.removal.events) || [],
      meetings: allW4.filter(m => m.seed === seed),
      smFights: (row.scholarmelt && row.scholarmelt.meetings) || [] };
    for (const d of uid) {
      const cls = classifyDrop(d, ctx);
      dropRows.push(Object.assign({ seed }, d, { method: 'uid', cls: cls.cls, evidence: cls.evidence,
        missingInstrument: cls.missingInstrument || null,
        inPerId: perIdKeys.has(`${d.mid}|${d.fromDay}|${d.toDay}|${d.fromHp}|${d.toHp}`) }));
    }
    for (const d of perId) {
      dropRows.push(Object.assign({ seed }, d, { method: 'per-id',
        inUid: uid.some(u => u.mid === d.mid && u.fromDay === d.fromDay && u.toDay === d.toDay && u.fromHp === d.fromHp && u.toHp === d.toHp) }));
    }
  }
  const uidDropRows = dropRows.filter(d => d.method === 'uid');
  const perIdDropRows = dropRows.filter(d => d.method === 'per-id');
  const uidOnlyDrops = uidDropRows.filter(d => !d.inPerId);
  const perIdOnlyDrops = perIdDropRows.filter(d => !d.inUid);
  const dropClsCounts = {};
  for (const d of uidDropRows) dropClsCounts[d.cls] = (dropClsCounts[d.cls] || 0) + 1;
  // Drafted-instance band count: toll-shaped uid drops whose uid later
  // has a uid-linked scholar fight (removal startCombat event for the
  // uid on the fight day at the fight's lift hp).
  const draftedInstances = [];
  for (const seed of seeds) {
    const cen = censusBySeed[seed];
    const row = rowBySeed[seed];
    const events = (row.removal && row.removal.events) || [];
    const fights = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const trajs = uidTrajectories(cen);
    for (const d of uidDrops(cen)) {
      if (!(d.fromHp - d.toHp === Math.round(d.maxHp * 0.25) && d.toTile === HAVEN_TILE)) continue;
      const laterFight = fights.find(f => f.lift && f.lift.id === d.mid && f.lifted === true
        && f.dayStart > d.toDay && events.some(e => e.type === 'removal' && e.monster
          && e.monster.uid === d.uid && e.day === f.dayStart && e.monster.hp === f.lift.hp && stackHas(e, 'startCombat')));
      if (laterFight) draftedInstances.push({ seed, mid: d.mid, uid: d.uid,
        tollDrop: `${d.fromHp}→${d.toHp} d${d.fromDay}→d${d.toDay}`, fightSeq: laterFight.fightSeq, fightDay: laterFight.dayStart, liftHp: laterFight.lift.hp });
    }
  }
  // Wall numbers (report-only).
  const wall = {
    wins: rows.filter(r => r.won).length, n: rows.length,
    nationalEver: rows.filter(r => r.nationalEver).length,
    nationalFinal: rows.filter(r => r.nationalFinal).length,
    tableReached: rows.filter(r => r.table).length,
    tableEntered: rows.filter(r => r.entered).length,
    waveReach: [1, 2, 3, 4, 5].map(w => rows.filter(r => (r.waveReach | 0) >= w).length),
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max.apply(null, rows.map(r => r.days)),
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal | 0), 0),
  };
  return { seeds, corpusOk, censusFilesOk, censusInfo, substrate, substrateOk,
    joinErrors, joinTotal, meetingJoinErrors, meetingJoinTotal, fightJoinErrors, fightJoinTotal,
    fateCounts, wildChains: chainTables.length, vanishedChains: vanishedSet,
    vanishedSetAgreement: JSON.stringify(vanishedSet) === JSON.stringify(expectedSet),
    uidIdConflicts, judgments, drops: { uidCount: uidDropRows.length, perIdCount: perIdDropRows.length,
      uidOnlyDrops, perIdOnlyDrops, clsCounts: dropClsCounts,
      unclassified: uidDropRows.filter(d => d.cls === 'DROP-UNCLASSIFIED').length,
      uidDropRows, perIdDropRows },
    draftedInstances, wall, rows: rows.map(r => ({ seed: r.seed, days: r.days, won: !!r.won,
      nationalEver: !!r.nationalEver, nationalFinal: !!r.nationalFinal, table: !!r.table,
      entered: !!r.entered, deathTotal: r.deathTotal | 0 })) };
}

function sense(evidDir) {
  const out = analyze(evidDir, SEEDS);
  for (const j of out.judgments) {
    console.log(`\n=== ${j.seed}|${j.mid} n=${j.n} d${j.firstDay}-${j.lastDay} hp=${j.remainingHp} uid=${j.resolution.uid} verdict=${j.verdict} ===`);
    console.log(`why: ${j.verdictWhy}`);
    if (j.fight) console.log(`fight: ${JSON.stringify(j.fight)}`);
    if (j.removal) console.log(`removal: ${JSON.stringify(j.removal)}`);
  }
  console.log(`\nDROPS uid=${out.drops.uidCount} perId=${out.drops.perIdCount} uidOnly=${out.drops.uidOnlyDrops.length}`);
  for (const d of out.drops.uidOnlyDrops) console.log(`uid-only: ${d.seed}|${d.mid} ${d.fromHp}→${d.toHp} d${d.fromDay}→d${d.toDay} uid=${d.uid} cls=${d.cls}`);
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--sense') >= 0) { sense(SAMEDAY_DIR); return; }
  let outPath = null, seedFilter = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') outPath = args[++i];
    if (args[i] === '--seeds') seedFilter = args[++i].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }
  const out = analyze(SAMEDAY_DIR, seedFilter);
  const summary = { seeds: out.seeds, corpusOk: out.corpusOk, censusFilesOk: out.censusFilesOk,
    substrateOk: out.substrateOk, substrate: out.substrate,
    joinErrors: out.joinErrors, meetingJoinErrors: out.meetingJoinErrors, fightJoinErrors: out.fightJoinErrors,
    fateCounts: out.fateCounts, wildChains: out.wildChains, vanishedChains: out.vanishedChains,
    vanishedSetAgreement: out.vanishedSetAgreement, uidIdConflicts: out.uidIdConflicts,
    judgments: out.judgments.map(j => ({ seed: j.seed, mid: j.mid, n: j.n, firstDay: j.firstDay,
      lastDay: j.lastDay, remainingHp: j.remainingHp, uid: j.resolution.uid, resolutionStatus: j.resolution.status,
      fabUid: j.fabUid, fabHp: j.fabHp, windowUpper: j.windowUpper, verdict: j.verdict, verdictWhy: j.verdictWhy,
      missingLink: j.missingLink || null, fight: j.fight, removal: j.removal })),
    drops: { uidCount: out.drops.uidCount, perIdCount: out.drops.perIdCount,
      uidOnlyDrops: out.drops.uidOnlyDrops, perIdOnlyDrops: out.drops.perIdOnlyDrops,
      clsCounts: out.drops.clsCounts, unclassified: out.drops.unclassified },
    draftedInstances: out.draftedInstances, wall: out.wall };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(JSON.stringify(summary, null, 1));
}
if (require.main === module) main();
module.exports = { analyze, resolveChainUid, linkFight, judgeChain, uidFirstAbsence, stripSameday, SEEDS };
