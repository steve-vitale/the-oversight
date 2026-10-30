#!/usr/bin/env node
// scripts/analyze-removal-a.js — sim-removal-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-removal-a/s<seed>-fresh.json
//   (chainclose sweep copy + removal recorder) + census-s<seed>.json
//   (enriched daily world-monster snapshots with object-identity uid).
// Cross-reference corpus (never re-judged): evidence/2026-10-30/
//   perseed-scholarmelt-a/s<seed>-fresh.json scholar fights, classified
//   with analyze-scholarmelt-a.js classifyFight (required).
// Chains: REQUIRED from scripts/analyze-chainclose-a.js buildChains
// via its analyze() (never re-implemented). Fates: REQUIRED from
// scripts/analyze-recurrence-a.js censusMatch/classifyFate/opportunity
// (never re-implemented), run against THIS sweep's census.
// Taxonomy: the prereg priority order in
// evidence/2026-10-30/sim-removal-a-prereg.md. A removal row's class
// rests on its stack function tokens + its pre-removal fields;
// line numbers are never trusted (they drift daily).
// Usage:
//   node scripts/analyze-removal-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-removal-a.js --sense (print judged-chain
//     meeting logs + removal rows + matched scholar traces)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { buildChains } = require('./analyze-chainclose-a');
const ccAnalyze = require('./analyze-chainclose-a').analyze;
const { censusMatch, classifyFate, opportunity } = require('./analyze-recurrence-a');
const { classifyFight, firstAbsentDay } = require('./analyze-scholarmelt-a');
const { joinAllChannel } = require('./analyze-spawnhp-a');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
const SCHOLARMELT_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-scholarmelt-a');

const DEFS = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.monsters || []);
    const m = {};
    for (const d of list) if (d && d.id) m[d.id] = d;
    return m;
  } catch (e) { return {}; }
})();
function waveOfId(mid) { const d = DEFS[mid]; return d ? ((d.wave | 0) || 1) : null; }
function floorOf(mid) { const d = DEFS[mid]; return (d && Array.isArray(d.hp)) ? d.hp[0] : null; }
function filesByteEqual(a, b) {
  try { return fs.readFileSync(a).equals(fs.readFileSync(b)); } catch (e) { return false; }
}
function stripRemoval(row) {
  const copy = JSON.parse(JSON.stringify(row));
  delete copy.removal;
  return copy;
}
function stripRemovalBytes(row) { return JSON.stringify(stripRemoval(row), null, 1) + '\n'; }
function censoredOf(row) { return row && row.endReason === 'survived'; }

// stackFuncs(row): function tokens from the recorder's stack frames.
function stackFuncs(row) {
  if (!row || !row.stack) return [];
  if (Array.isArray(row.stack.funcs)) return row.stack.funcs;
  return [];
}
function stackHas(row, name) { return stackFuncs(row).some(f => f === name || f.endsWith('.' + name) || f.indexOf(name) >= 0); }
function firstStackFn(row) {
  const fs_ = stackFuncs(row);
  return fs_.length ? fs_[0] : null;
}
function atEdge(mon) {
  if (!mon) return false;
  return mon.mx === 0 || mon.mx === 8 || mon.my === 0 || mon.my === 8;
}
function fledHas(fledSnap, mid, hp) {
  if (!fledSnap) return false;
  for (const k of Object.keys(fledSnap)) {
    const e = fledSnap[k];
    if (e && e.id === mid && (hp == null || e.hp === hp)) return true;
  }
  return false;
}

// classifyRemoval(row, smFights): prereg priority order. smFights are
// the seed's scholarmelt fights with their classifyFight verdicts.
// Returns {cls, evidence, smFightSeq|null}.
function classifyRemoval(row, smFights) {
  if (!row || row.type !== 'removal') return { cls: 'NOT-A-REMOVAL', evidence: 'row is not a removal event', smFightSeq: null };
  const mon = row.monster || null;
  if (!mon) return { cls: 'NULL-ROW', evidence: 'null monster argument (engine no-op), not a beast removal', smFightSeq: null };
  const mid = mon.id;
  // 1-4. Scholar lifts: the class comes from the cross-referenced
  // scholarmelt fight, never from re-judging here.
  if (stackHas(row, 'startCombat')) {
    const cands = (smFights || []).filter(f => f && f.lift && String(f.lift.id) === String(mid)
      && f.lift.hp === mon.hp && f.dayStart === row.day && f.lifted === true);
    if (!cands.length) {
      return { cls: 'UNCLASSIFIED', sub: 'scholar-lift-unmatched',
        evidence: `startCombat lift of ${mid} hp=${mon.hp} day=${row.day} with NO scholarmelt cross-ref fight (lift hp + day)`,
        missingInstrument: 'scholarmelt cross-ref miss', smFightSeq: null };
    }
    const f = cands[0];
    const verdict = classifyFight(f);
    const map = {
      'SCHOLAR-FLEE-MELT': 'SCHOLAR-MELT', 'DISSOLVED-MELT': 'SCHOLAR-MELT',
      'SCHOLAR-KILL': 'SCHOLAR-KILL', 'SCHOLAR-RESTORED': 'SCHOLAR-RESTORED',
      'SPAWN-ENDED': 'SCHOLAR-SPAWN-ENDED', 'BYSTANDER-OR-NONMONSTER': 'SCHOLAR-BYSTANDER',
    };
    if (map[verdict.fate]) {
      return { cls: map[verdict.fate], sub: verdict.sub || null,
        evidence: `startCombat lift, scholarmelt fightSeq ${f.fightSeq} day=${f.dayStart} lift=${f.lift.hp} classified ${verdict.fate} there (${verdict.why})`,
        smFightSeq: f.fightSeq };
    }
    return { cls: 'UNCLASSIFIED', sub: 'scholar-lift-unclassified',
      evidence: `startCombat lift, scholarmelt fightSeq ${f.fightSeq} classified ${verdict.fate} there (${verdict.why})`,
      missingInstrument: 'scholarmelt cross-ref unclassified', smFightSeq: f.fightSeq };
  }
  // 5-9. monsterTurn ambient removals.
  if (stackHas(row, 'monsterTurn')) {
    if (mid === 'glasswing') return { cls: 'GLASSWING-TRAP-VANISH', evidence: 'monsterTurn glasswing trap trigger (sight within 5)', smFightSeq: null };
    if (mon.stance === 'curious' && mid === 'nightlight_catfish' && (mon.watchTurns || 0) >= 2) {
      return { cls: 'CURIOUS-FADE', evidence: `monsterTurn curious nightlight watchTurns=${mon.watchTurns} (glow dims and sinks)`, smFightSeq: null };
    }
    if ((mon.lostSight || 0) > 6) return { cls: 'LOSTSIGHT-REMOVE', evidence: `monsterTurn lostSight=${mon.lostSight} > 6`, smFightSeq: null };
    if (mon.stance === 'fearful') {
      if (atEdge(mon) && fledHas(row.fledAfter, mid, mon.hp)) {
        return { cls: 'FLED-BOLT', evidence: `monsterTurn fearful at edge (${mon.mx},${mon.my}) fearTurns=${mon.fearTurns}, fledMonsters entry present after call`, smFightSeq: null };
      }
      return { cls: 'FLED-GAVE-UP', evidence: `monsterTurn fearful not-at-edge (${mon.mx},${mon.my}) fearTurns=${mon.fearTurns}, no fledMonsters entry (melts back into the treeline)`, smFightSeq: null };
    }
    return { cls: 'OTHER-monsterTurn', evidence: `monsterTurn removal, stance=${mon.stance} lostSight=${mon.lostSight} (no prereg class matches)`, smFightSeq: null };
  }
  // 10. Titan fall.
  if (stackHas(row, 'titanVictory')) return { cls: 'TITAN-FALL-CLEANUP', evidence: 'titanVictory world-monster removal', smFightSeq: null };
  // 11. Villager fight routers.
  if (stackHas(row, 'resolveWildMonsterEncounter') || stackHas(row, 'resolvePatrol')
    || stackHas(row, 'lingererSortie') || stackHas(row, 'aidFight')) {
    return { cls: 'VILLAGER-KILL', evidence: `villager fight router removal (stack: ${stackFuncs(row).slice(0, 4).join(',')}) — fieldparty meeting match verified by the caller`, smFightSeq: null };
  }
  // 12. Campaign clears.
  const frames = (row.stack && row.stack.frames) || [];
  if (frames.some(f => f.indexOf('finale-campaign') >= 0 || f.indexOf('network-campaign') >= 0)
    || stackFuncs(row).some(f => /finale|network/i.test(f))) {
    return { cls: 'CAMPAIGN-CLEAR', evidence: 'finale/network campaign world-monster clear', smFightSeq: null };
  }
  const fn = firstStackFn(row);
  return { cls: fn ? ('OTHER-' + fn) : 'OTHER-unknown',
    evidence: `no prereg class matches; stack funcs: ${stackFuncs(row).slice(0, 5).join(',') || '(none)'}`, smFightSeq: null };
}

// classifyDrop(drop, ctx): drop = {seed, mid, uid, fromDay, toDay, fromHp, toHp, fromTile, toTile, maxHp}.
// ctx = {events, meetings, smFights} for the seed.
function classifyDrop(drop, ctx) {
  const { events, meetings, smFights } = ctx;
  const D = drop.fromDay;
  // A drop between snapshot D and D+1 happens during day D's play
  // (snapshot D is start-of-day state) or in the day-boundary phase
  // before snapshot D+1; candidate event days are D and D+1.
  const inWindow = (ev) => ev && (ev.day === D || ev.day === D + 1);
  if (drop.uidChanged) {
    return { cls: 'DROP-ENTITY-REPLACEMENT',
      evidence: `uid changes across the drop (uid ${drop.uidFrom} -> ${drop.uidTo} at ${drop.toTile}); different entity, not a wound`,
      missingInstrument: null };
  }
  const smHit = (smFights || []).find(f => f && f.lift && String(f.lift.id) === String(drop.mid)
    && f.lift.hp === drop.fromHp && f.restoredHp === drop.toHp && f.lift.lingering === true
    && (f.dayStart === D || f.dayStart === D + 1));
  if (smHit) {
    return { cls: 'DROP-SCHOLAR-RESTORED-WOUND',
      evidence: `scholarmelt fightSeq ${smHit.fightSeq} day=${smHit.dayStart} lift=${smHit.lift.hp} lingering restoredHp=${smHit.restoredHp} result=${smHit.result}`,
      missingInstrument: null };
  }
  const meetHit = (meetings || []).find(m => m.mid === drop.mid && (m.day === D || m.day === D + 1)
    && m.mHpLeft === drop.toHp && (m.outcome === 'vFlee' || m.outcome === 'mFlee' || m.outcome === 'vDie' || m.outcome === 'vKill'));
  if (meetHit) {
    return { cls: 'DROP-VILLAGER-FIGHT',
      evidence: `fieldparty meeting day=${meetHit.day} channel=${meetHit.channel} outcome=${meetHit.outcome} closes ${meetHit.mHpLeft}`,
      missingInstrument: null };
  }
  if (drop.maxHp != null && drop.fromHp - drop.toHp === Math.round(drop.maxHp * 0.25)) {
    return { cls: 'DROP-RAID-TOLL',
      evidence: `drop ${drop.fromHp - drop.toHp} == round(maxHp ${drop.maxHp} * 0.25) with haven-tile move (havenGrowth toll)`,
      missingInstrument: null };
  }
  const remHit = (events || []).find(ev => ev.type === 'removal' && ev.monster && String(ev.monster.id) === String(drop.mid)
    && inWindow(ev) && ev.monster.hp === drop.fromHp);
  if (remHit) {
    const c = classifyRemoval(remHit, smFights);
    return { cls: 'DROP-REMOVAL-ROW-' + c.cls,
      evidence: `removal row seq=${remHit.seq} day=${remHit.day} class ${c.cls}: ${c.evidence}`,
      missingInstrument: null };
  }
  return { cls: 'DROP-UNCLASSIFIED',
    evidence: `no scholarmelt restored-wound, villager meeting, toll-shaped amount, or removal row in days ${D}/${D + 1} explains ${drop.fromHp}->${drop.toHp}`,
    missingInstrument: 'per-tick hp-mutation recorder (direct world-monster hp writes outside fights/removals are not instrumented)' };
}

// uidTrajectories(census): uid -> ordered entries {day, id, tx, ty, hp, maxHp, wave, ...}.
function uidTrajectories(census) {
  const byUid = {};
  const snaps = (census && census.snapshots) || [];
  for (const sn of snaps) {
    if (sn.day == null) continue;
    for (const m of (sn.monsters || [])) {
      if (m.uid == null) continue;
      (byUid[m.uid] = byUid[m.uid] || []).push(Object.assign({ day: sn.day }, m));
    }
  }
  for (const u of Object.keys(byUid)) byUid[u].sort((a, b) => a.day - b.day);
  return byUid;
}
// uidDrops(census): adjacent-snapshot drops on one uid (wave-4 ids only).
function uidDrops(census) {
  const out = [];
  const trajs = uidTrajectories(census);
  for (const uid of Object.keys(trajs)) {
    const list = trajs[uid];
    for (let i = 1; i < list.length; i++) {
      const a = list[i - 1], b = list[i];
      if (b.day !== a.day + 1) continue;
      if ((b.hp | 0) < (a.hp | 0) && (waveOfId(b.id) === 4)) {
        out.push({ mid: b.id, uid: Number(uid), uidFrom: Number(uid), uidTo: Number(uid), uidChanged: false,
          fromDay: a.day, toDay: b.day, fromHp: a.hp, toHp: b.hp, fromTile: `${a.tx},${a.ty}`, toTile: `${b.tx},${b.ty}`,
          maxHp: b.maxHp != null ? b.maxHp : a.maxHp });
      }
    }
  }
  return out;
}
// perIdDrops(census): spawnhp-style first-entry-per-day per id drops
// (used to reproduce the spawnhp named drops even where uid differs).
function perIdDrops(census) {
  const out = [];
  const byIdDay = {};
  for (const sn of ((census && census.snapshots) || [])) {
    if (sn.day == null) continue;
    for (const m of (sn.monsters || [])) {
      const k = `${m.id}|${sn.day}`;
      if (!byIdDay[k]) byIdDay[k] = Object.assign({ day: sn.day }, m);
    }
  }
  const byId = {};
  for (const k of Object.keys(byIdDay)) {
    const e = byIdDay[k];
    (byId[e.id] = byId[e.id] || []).push(e);
  }
  for (const id of Object.keys(byId)) {
    if (waveOfId(id) !== 4) continue;
    const list = byId[id].sort((a, b) => a.day - b.day);
    for (let i = 1; i < list.length; i++) {
      const a = list[i - 1], b = list[i];
      if (b.day !== a.day + 1) continue;
      if ((b.hp | 0) < (a.hp | 0)) {
        out.push({ mid: id, uid: b.uid != null ? b.uid : null, uidFrom: a.uid != null ? a.uid : null, uidTo: b.uid != null ? b.uid : null,
          uidChanged: (a.uid != null && b.uid != null && a.uid !== b.uid),
          fromDay: a.day, toDay: b.day, fromHp: a.hp, toHp: b.hp, fromTile: `${a.tx},${a.ty}`, toTile: `${b.tx},${b.ty}`,
          maxHp: b.maxHp != null ? b.maxHp : a.maxHp });
      }
    }
  }
  return out;
}

function analyze(evidDir, chaincloseDir, scholarmeltDir) {
  evidDir = evidDir || path.join(REPO, 'evidence', '2026-10-30', 'perseed-removal-a');
  chaincloseDir = chaincloseDir || CHAINCLOSE_DIR;
  scholarmeltDir = scholarmeltDir || SCHOLARMELT_DIR;
  const cc = ccAnalyze(evidDir);
  const rows = [], censusBySeed = {}, smBySeed = {};
  let censusFilesOk = true;
  const censusInfo = {};
  for (const seed of SEEDS) {
    rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
    try {
      const c = JSON.parse(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`), 'utf8'));
      censusBySeed[seed] = c;
      const snaps = (c && c.snapshots) || [];
      const row = rows[rows.length - 1];
      const sorted = snaps.every((s, i) => i === 0 || (s.day === null || snaps[i - 1].day === null || s.day >= snaps[i - 1].day));
      const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
      const uidOk = snaps.every(sn => (sn.monsters || []).every(m => m.uid != null));
      censusInfo[seed] = { snapshots: snaps.length, sorted, lastDay,
        within1: lastDay !== null && Math.abs(lastDay - row.days) <= 1, uidOk };
      if (!sorted || lastDay === null || Math.abs(lastDay - row.days) > 1 || !uidOk) censusFilesOk = false;
    } catch (e) { censusBySeed[seed] = null; censusFilesOk = false; censusInfo[seed] = { snapshots: 0, sorted: false, lastDay: null, within1: false, uidOk: false, error: String((e && e.message) || e).slice(0, 120) }; }
    try {
      const smr = JSON.parse(fs.readFileSync(path.join(scholarmeltDir, `s${seed}-fresh.json`), 'utf8'));
      smBySeed[seed] = (smr.scholarmelt && smr.scholarmelt.meetings) || [];
    } catch (e) { smBySeed[seed] = []; }
  }
  const rowBySeed = {};
  for (const r of rows) rowBySeed[r.seed] = r;
  // Removal-store validity + substrate byte-identity.
  const removalOk = (s) => s && Array.isArray(s.events) && s.diag.errs === 0
    && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0 && removalOk(r.removal));
  const substrate = {};
  let substrateOk = true;
  for (const seed of SEEDS) {
    let same = false;
    try {
      const mine = stripRemovalBytes(rowBySeed[seed]);
      const theirs = fs.readFileSync(path.join(chaincloseDir, `s${seed}-fresh.json`), 'utf8');
      same = (mine === theirs);
    } catch (e) { same = false; }
    substrate[seed] = same;
    if (!same) substrateOk = false;
  }
  // Uid consistency: one uid must never carry two monster ids.
  const uidIdConflicts = [];
  for (const seed of SEEDS) {
    const seen = {};
    for (const sn of ((censusBySeed[seed] || {}).snapshots || [])) {
      for (const m of (sn.monsters || [])) {
        if (m.uid == null) continue;
        if (seen[m.uid] && seen[m.uid] !== m.id) uidIdConflicts.push({ seed, uid: m.uid, ids: [seen[m.uid], m.id] });
        seen[m.uid] = m.id;
      }
    }
  }
  // All-channel meetings for drop classification + sense logs.
  const { meetings: allW4 } = joinAllChannel(evidDir, SEEDS);
  // Chain fates on THIS census.
  const chainEnds = [];
  const fateCounts = {};
  for (const ch of (cc.chains || [])) {
    const seed = ch.seed, mid = ch.mid;
    const meetings = ch.meetings || [];
    const lastDay = meetings.length ? Math.max.apply(null, meetings.map(m => m.day)) : null;
    const remainingHp = ch.remainingHp != null ? ch.remainingHp : (meetings.length ? meetings[meetings.length - 1].mHpLeft : null);
    const row = rowBySeed[seed];
    const cm = censusMatch(censusBySeed[seed], mid, remainingHp, lastDay);
    const fpSeed = (row.fieldparty.meetings || []);
    const opp = opportunity({ lastDay, mid, beastLastTile: null, windowDays: row.days - lastDay }, fpSeed);
    const fate = classifyFate({ n: meetings.length, lastDay, remainingHp }, row, cm, opp);
    fateCounts[fate.fate] = (fateCounts[fate.fate] || 0) + 1;
    if (fate.fate !== 'BEAST-VANISHED') continue;
    const fad = firstAbsentDay(censusBySeed[seed], mid, remainingHp, lastDay);
    // Pin the census uid: post-lastDay snapshots at chain hp.
    const postUids = new Set();
    for (const sn of ((censusBySeed[seed] || {}).snapshots || [])) {
      if (!(sn.day > lastDay)) continue;
      for (const m of (sn.monsters || [])) if (m.id === mid && m.hp === remainingHp && m.uid != null) postUids.add(m.uid);
    }
    const pinnedUid = postUids.size === 1 ? Array.from(postUids)[0] : null;
    const events = ((row.removal && row.removal.events) || []);
    const lastSeen = cm.lastSeen;
    const primLo = (lastSeen == null ? lastDay : lastSeen);
    const inPrimary = (ev) => ev.day > primLo && (fad == null || ev.day <= fad);
    const inFull = (ev) => ev.day >= lastDay && (fad == null || ev.day <= fad);
    const matchRows = (uidPinned) => events.filter(ev => ev.type === 'removal' && ev.monster
      && String(ev.monster.id) === String(mid)
      && (uidPinned ? ev.monster.uid === pinnedUid : ev.monster.hp === remainingHp));
    const primaryRows = matchRows(pinnedUid != null).filter(inPrimary);
    const fullRows = matchRows(pinnedUid != null).filter(inFull);
    const edgeRows = fullRows.filter(ev => !inPrimary(ev));
    const spawnInWindow = events.filter(ev => ev.type === 'spawn' && ev.monster
      && String(ev.monster.id) === String(mid) && inFull(ev));
    // Terminal removal: the last primary row with no later census
    // sighting of the uid before firstAbsentDay (a lift followed by
    // a restore is not terminal — the census would show it again).
    let verdict = null, verdictEvidence = null, verdictRow = null, verdictEdge = false;
    const ordered = primaryRows.slice().sort((a, b) => a.seq - b.seq);
    for (const ev of ordered) {
      const c = classifyRemoval(ev, smBySeed[seed]);
      verdict = c; verdictRow = ev;
    }
    if (!verdict && edgeRows.length) {
      const ev = edgeRows.slice().sort((a, b) => a.seq - b.seq)[edgeRows.length - 1];
      verdict = classifyRemoval(ev, smBySeed[seed]); verdictRow = ev; verdictEdge = true;
    }
    if (!verdict) {
      verdict = { cls: 'UNCLASSIFIED', evidence: 'no removal row for this instance in the window',
        missingInstrument: 'removal before recorder install, or a direct worldMonsters splice bypass (no engine path is known to do this — see metric review)' };
    }
    const isUnclassified = verdict.cls === 'UNCLASSIFIED';
    chainEnds.push({ seed, mid, n: meetings.length, firstDay: meetings.length ? Math.min.apply(null, meetings.map(m => m.day)) : null,
      lastDay, remainingHp, fate: fate.fate, fateWhy: fate.why,
      lastSeen, firstAbsentDay: fad, finalDay: cm.finalDay,
      pinnedUid, postUidCount: postUids.size, uidPinned: pinnedUid != null,
      primaryRows: primaryRows.map(ev => ({ seq: ev.seq, day: ev.day, hp: ev.monster.hp, tile: `${ev.monster.tx},${ev.monster.ty}`, cls: classifyRemoval(ev, smBySeed[seed]).cls, stackFuncs: stackFuncs(ev).slice(0, 4) })),
      edgeRows: edgeRows.map(ev => ({ seq: ev.seq, day: ev.day, hp: ev.monster.hp, tile: `${ev.monster.tx},${ev.monster.ty}`, cls: classifyRemoval(ev, smBySeed[seed]).cls, stackFuncs: stackFuncs(ev).slice(0, 4) })),
      spawnInWindow: spawnInWindow.map(ev => ({ seq: ev.seq, day: ev.day, hp: ev.monster ? ev.monster.hp : null, uid: ev.monster ? ev.monster.uid : null })),
      verdict: verdict.cls, verdictSub: verdict.sub || null, verdictEvidence: verdict.evidence,
      verdictSmFightSeq: verdict.smFightSeq || null, verdictEdge, verdictRowSeq: verdictRow ? verdictRow.seq : null,
      missingInstrument: verdict.missingInstrument || null, isUnclassified });
  }
  // Band removal census (all wild wave-4 removals, for scale).
  const bandRemovalCounts = {};
  let bandRemovalN = 0, bandSpawnN = 0;
  for (const seed of SEEDS) {
    const events = (((rowBySeed[seed] || {}).removal || {}).events || []);
    for (const ev of events) {
      if (ev.type === 'spawn') { bandSpawnN++; continue; }
      if (ev.type !== 'removal' || !ev.monster || waveOfId(ev.monster.id) !== 4) continue;
      bandRemovalN++;
      const c = classifyRemoval(ev, smBySeed[seed]);
      bandRemovalCounts[c.cls] = (bandRemovalCounts[c.cls] || 0) + 1;
    }
  }
  // Drops: uid drops (primary) + per-id drops (spawnhp reproduction).
  const drops = [];
  for (const seed of SEEDS) {
    const events = (((rowBySeed[seed] || {}).removal || {}).events || []);
    const meetings = allW4.filter(m => m.seed === seed);
    const ctx = { events, meetings, smFights: smBySeed[seed] };
    for (const d of uidDrops(censusBySeed[seed])) {
      const c = classifyDrop(Object.assign({ seed }, d), ctx);
      drops.push(Object.assign({ seed, method: 'uid' }, d, { cls: c.cls, evidence: c.evidence, missingInstrument: c.missingInstrument || null }));
    }
  }
  const perIdDropList = [];
  for (const seed of SEEDS) {
    const events = (((rowBySeed[seed] || {}).removal || {}).events || []);
    const meetings = allW4.filter(m => m.seed === seed);
    const ctx = { events, meetings, smFights: smBySeed[seed] };
    for (const d of perIdDrops(censusBySeed[seed])) {
      const c = classifyDrop(Object.assign({ seed }, d), ctx);
      perIdDropList.push(Object.assign({ seed, method: 'per-id' }, d, { cls: c.cls, evidence: c.evidence, missingInstrument: c.missingInstrument || null }));
    }
  }
  const NAMED_DROPS = [
    { seed: 75105, mid: 'suburb', fromHp: 975, toHp: 872 },
    { seed: 75114, mid: 'reunion', fromHp: 900, toHp: 745 },
    { seed: 75114, mid: 'algorithm', fromHp: 750, toHp: 624 },
  ];
  const namedDrops = NAMED_DROPS.map(nd => {
    const uidHit = drops.find(d => d.seed === nd.seed && d.mid === nd.mid && d.fromHp === nd.fromHp && d.toHp === nd.toHp);
    const idHit = perIdDropList.find(d => d.seed === nd.seed && d.mid === nd.mid && d.fromHp === nd.fromHp && d.toHp === nd.toHp);
    const hit = uidHit || idHit || null;
    return Object.assign({}, nd, hit ? { reproduced: true, method: hit.method, fromDay: hit.fromDay, toDay: hit.toDay,
      fromTile: hit.fromTile, toTile: hit.toTile, cls: hit.cls, evidence: hit.evidence,
      missingInstrument: hit.missingInstrument || null }
      : { reproduced: false, cls: 'NOT-REPRODUCED', evidence: 'no adjacent-day drop with these endpoints in this census', missingInstrument: null });
  });
  const NAMED_CHAINS = [
    { seed: 75102, mid: 'eulogy', hp: 853 },
    { seed: 75116, mid: 'suburb', hp: 1285 },
  ];
  const namedChains = NAMED_CHAINS.map(nc => {
    const hit = chainEnds.find(c => c.seed === nc.seed && c.mid === nc.mid && c.remainingHp === nc.hp);
    return Object.assign({}, nc, hit ? { found: true, verdict: hit.verdict, verdictEvidence: hit.verdictEvidence, lastDay: hit.lastDay, lastSeen: hit.lastSeen, firstAbsentDay: hit.firstAbsentDay, verdictEdge: hit.verdictEdge, missingInstrument: hit.missingInstrument || null }
      : { found: false, verdict: 'NOT-FOUND', verdictEvidence: 'no BEAST-VANISHED chain with this (seed,mid,hp) in this corpus', missingInstrument: null });
  });
  const vanishedSet = chainEnds.map(c => `${c.seed}|${c.mid}`).sort();
  const expectedVanished = ['75102|algorithm', '75102|eulogy', '75116|audit', '75116|suburb'];
  const vanishedSetAgrees = JSON.stringify(vanishedSet) === JSON.stringify(expectedVanished);
  const unclassifiedVanished = chainEnds.filter(c => c.isUnclassified);
  const completeness = cc.corpusOk && cc.joinErrors === 0 && cc.mDealtMismatches === 0
    && cc.srPrefixViolations === 0 && corpusOk && censusFilesOk && substrateOk && uidIdConflicts.length === 0;
  return { corpusOk: cc.corpusOk, joinTotal: cc.joinTotal, joinErrors: cc.joinErrors,
    mDealtMismatches: cc.mDealtMismatches, srChecked: cc.srChecked, srPrefixViolations: cc.srPrefixViolations,
    removalCorpusOk: corpusOk, censusInfo, censusFilesOk, substrate, substrateOk,
    uidIdConflicts, completeness,
    fateCounts, chainEnds, vanishedSet, expectedVanished, vanishedSetAgrees,
    unclassifiedVanishedN: unclassifiedVanished.length,
    bandRemovalCounts, bandRemovalN, bandSpawnN,
    drops, perIdDrops: perIdDropList, namedDrops, namedChains,
    wall: cc.wall, wildN: cc.wildN, chainsN: (cc.chains || []).length };
}

function sense(evidDir) {
  const res = analyze(evidDir);
  const rows = {};
  for (const seed of SEEDS) rows[seed] = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  const { meetings } = joinAllChannel(evidDir, SEEDS);
  for (const c of res.chainEnds) {
    console.log(`\n=== CHAIN s${c.seed} ${c.mid} hp=${c.remainingHp} lastDay=${c.lastDay} lastSeen=${c.lastSeen} firstAbsent=${c.firstAbsentDay} verdict=${c.verdict}${c.verdictEdge ? ' (EDGE)' : ''} ===`);
    console.log(`  verdict evidence: ${c.verdictEvidence}`);
    for (const m of meetings.filter(m => m.seed === c.seed && m.mid === c.mid)) {
      console.log(`  meeting d${m.day} part=${m.part} channel=${m.channel} caller=${m.caller} outcome=${m.outcome} ${m.mHpStart}->${m.mHpLeft} dealt=${m.mDealt}`);
      for (const line of (m.log || [])) console.log(`    LOG: ${line}`);
    }
    for (const r of c.primaryRows) console.log(`  primary removal seq=${r.seq} d${r.day} hp=${r.hp} ${r.tile} class=${r.cls} stack=${r.stackFuncs.join(',')}`);
    for (const r of c.edgeRows) console.log(`  edge removal seq=${r.seq} d${r.day} hp=${r.hp} ${r.tile} class=${r.cls} stack=${r.stackFuncs.join(',')}`);
  }
  for (const d of res.namedDrops) {
    console.log(`\n=== DROP s${d.seed} ${d.mid} ${d.fromHp}->${d.toHp} reproduced=${d.reproduced} class=${d.cls} ===`);
    console.log(`  ${d.evidence}`);
  }
  return res;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-removal-a');
  if (args[0] === '--sense') { sense(evidDir); return; }
  const res = analyze(evidDir);
  let out = null;
  const oi = args.indexOf('--out');
  if (oi >= 0 && args[oi + 1]) out = args[oi + 1];
  const body = JSON.stringify(res, null, 1) + '\n';
  if (out) fs.writeFileSync(out, body);
  console.log('=== sim-removal-a ===');
  console.log(`corpus: chaincloseOk=${res.corpusOk} joins=${res.joinTotal} joinErr=${res.joinErrors} mDealtMismatch=${res.mDealtMismatches} srViol=${res.srPrefixViolations} removalOk=${res.removalCorpusOk} censusOk=${res.censusFilesOk} substrateOk=${res.substrateOk} uidConflicts=${res.uidIdConflicts.length} completeness=${res.completeness}`);
  console.log(`fates: ${JSON.stringify(res.fateCounts)}`);
  console.log(`vanished (${res.chainEnds.length}): setAgreesRecurrence=${res.vanishedSetAgrees} unclassified=${res.unclassifiedVanishedN}`);
  for (const c of res.chainEnds) console.log(`  VANISHED s${c.seed} ${c.mid} hp=${c.remainingHp} lastDay=${c.lastDay} lastSeen=${c.lastSeen} firstAbsent=${c.firstAbsentDay} pinnedUid=${c.pinnedUid} verdict=${c.verdict}${c.verdictEdge ? ' (EDGE)' : ''} smFight=${c.verdictSmFightSeq}`);
  console.log(`band wild w4 removals: ${res.bandRemovalN} spawns: ${res.bandSpawnN} byClass: ${JSON.stringify(res.bandRemovalCounts)}`);
  console.log(`uid drops: ${res.drops.length} per-id drops: ${res.perIdDrops.length}`);
  for (const d of res.namedDrops) console.log(`  DROP s${d.seed} ${d.mid} ${d.fromHp}->${d.toHp} reproduced=${d.reproduced} method=${d.method || '-'} days=${d.fromDay != null ? d.fromDay + '->' + d.toDay : '-'} class=${d.cls}`);
  for (const c of res.namedChains) console.log(`  NAMED-CHAIN s${c.seed} ${c.mid} hp=${c.hp} found=${c.found} verdict=${c.verdict}${c.verdictEdge ? ' (EDGE)' : ''}`);
  console.log(`WALL: won=${res.wall.won} (full=${res.wall.wonFull}) natEver=${res.wall.nationalEver} natFinal=${res.wall.nationalFinal} table=${res.wall.table} entered=${res.wall.entered} wave4=${res.wall.wave4reach} wave5=${res.wall.wave5reach} median=${res.wall.medianDays} deaths=${res.wall.deaths}`);
  if (out) console.log(`wrote ${out}`);
}
if (require.main === module) main();
module.exports = { analyze, classifyRemoval, classifyDrop, uidTrajectories, uidDrops, perIdDrops, stripRemoval, stripRemovalBytes, stackFuncs, SEEDS };
