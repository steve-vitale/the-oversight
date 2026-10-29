#!/usr/bin/env node
// analyze-collision-b.js — species-id collision census over a
// COLLISION_TRACE fightorigin corpus (sim-raidname-collision-b;
// prereg evidence/2026-10-29/sim-raidname-collision-b-prereg.md,
// committed BEFORE any judged leg).
//
// Classifies EVERY fight creation (see prereg "Classification"):
//   provenance: raid-pending | nonraid-pending | tile | contest | unknown
//   COLLISION-A: raid line + pendingMatch + not raid-pending +
//     not raidBorn-same tile entity
//   COLLISION-B: raid line + no pendingMatch + entityMatchCandidate
//     + provenance nonraid-pending or contest
//   SAME-RAID: raid line + (raid-pending OR raidBorn-same tile)
//   UNCLASSIFIED-LINE: raid line + provenance unknown
// Opportunities: OPP-B (nonraid-pending + raidBorn-same origin,
//   fired/not-fired), OPP-A-WINDOW (shadow live at entry, mid !=
//   shadow), shadow lifetimes, distinct-pending pairs (raid set
//   for X followed by non-raid set for X before shadow consumed).
// Usage: node scripts/analyze-collision-b.js [--corpus DIR] [--out FILE]
'use strict';
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
let corpus = path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-raidname-collision-b-corpus');
let out = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--corpus') corpus = args[++i];
  else if (args[i] === '--out') out = args[++i];
}
const RAID_LINE = 'This one came with the raid on Haven';

function framesOf(p) {
  const f = [];
  for (const s of (p.stackFrames || [])) f.push(String(s));
  for (const s of (p.stackLines || [])) f.push(String(s));
  return f.join('\n');
}
function setterKind(p) {
  const f = framesOf(p);
  if (/havenRaidTick/.test(f)) return 'raid';
  if (/feastBuff\.js/.test(f)) return 'feast';
  if (/wandererTentBreach/.test(f)) return 'tent';
  if (/wanderer/.test(f)) return 'wanderer';
  return 'unknown';
}
// A pendingLog entry is a "set" for species X when it records a
// pending transition TO X: pendingMonsterId becoming X, or
// pendingEncounter becoming true while the id is X. Entries log
// the state AFTER the change, so a CLEAR entry (pendingEncounter
// false with the id still X, as the harness block logs before
// clearing the id) must NOT count as a set — it is the resolve,
// and counting it makes the resolver's stack (driveContestsImpl)
// look like the setter. (Pilot bug, fixed before the confirm
// leg: the first pilot run classified genuine raid pendings as
// unknown for exactly this reason.)
function isSetEntry(p, species) {
  if (p.pendingMonsterId !== species) return false;
  if (p.why === 'pendingMonsterId') return true;
  if (p.why === 'pendingEncounter' && p.pendingEncounter === true) return true;
  return false;
}
function setEntriesFor(d, species, prevFo, thisFo) {
  return (d.pendingLog || []).filter((p) =>
    p.foSeq > prevFo && p.foSeq < thisFo && isSetEntry(p, species));
}
function clearedAfter(d, species, setFo, thisFo) {
  // A clear of the pending for this species before this creation:
  // pendingMonsterId -> null, or pendingEncounter -> false while
  // the id was this species (the harness block clears both).
  const logs = (d.pendingLog || []).filter((p) => p.foSeq > setFo && p.foSeq < thisFo);
  for (const p of logs) {
    if (p.why === 'pendingMonsterId' && p.pendingMonsterId === null) return true;
    if (p.why === 'pendingEncounter' && p.pendingEncounter === false) return true;
  }
  return false;
}

const summary = {
  corpus, seeds: [],
  totals: {
    creations: 0, raidLines: 0,
    collisionA: 0, collisionB: 0, collisions: 0,
    sameRaid: 0, unclassifiedLines: 0,
    oppB: 0, oppBFired: 0, oppBNotFired: 0,
    oppAWindow: 0, distinctPendingPairs: 0,
    shadowSet: 0, shadowConsumed: 0, shadowOverwriteCleared: 0,
    shadowLiveAtEnd: 0, shadowOtherCleared: 0,
    dawnRaidMornings: 0, provenance: {},
  },
  collisions: [], unclassified: [], oppBList: [], oppAList: [], pairs: [],
};
for (const f of fs.readdirSync(corpus).sort()) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
  const seedRow = {
    seed: d.seed, creations: 0, collisions: [],
    shadowLifetimes: [], pairs: [],
  };
  const creations = d.fightCreations || [];
  // Shadow lifetimes from shadowLog: set (null -> X) ... consume
  // (X -> null with a startCombat stack) vs overwrite-clear
  // (X -> null with a non-raid setter stack) vs other-clear vs
  // still live at instance end.
  {
    let live = null; // {species, foSeq, loopDay}
    const close = (how, entry) => {
      seedRow.shadowLifetimes.push({
        species: live.species, setFo: live.foSeq, setLoopDay: live.loopDay,
        how, endFo: entry ? entry.foSeq : null,
      });
      summary.totals[{ consume: 'shadowConsumed', overwrite: 'shadowOverwriteCleared', other: 'shadowOtherCleared' }[how] || 'shadowOtherCleared']++;
      live = null;
    };
    for (const e of (d.shadowLog || [])) {
      if (e.newValue !== null && e.oldValue !== e.newValue) {
        // Set (null -> X) or overwrite (X -> Y, e.g. a new raid
        // while an orphan shadow is still live): close the old
        // lifetime as 'other', open the new one.
        if (live) close('other', e);
        live = { species: e.newValue, foSeq: e.foSeq, loopDay: e.loopDay };
        summary.totals.shadowSet++;
      } else if (e.oldValue !== null && e.newValue === null) {
        if (!live) continue;
        const fr = framesOf(e);
        if (/startCombat/.test(fr)) close('consume', e);
        else if (/wanderer|feastBuff|tentBreach/.test(fr)) close('overwrite', e);
        else close('other', e);
      }
    }
    if (live) {
      seedRow.shadowLifetimes.push({
        species: live.species, setFo: live.foSeq, setLoopDay: live.loopDay,
        how: 'live-at-end', endFo: null,
      });
      summary.totals.shadowLiveAtEnd++;
    }
  }
  // Distinct-pending pairs: raid set for X, later non-raid set
  // for X before the raid shadow is consumed/cleared. Shadow
  // consumption is approximated from shadowLog: the shadow for
  // X is "dead" after the first X -> null shadow transition
  // following the raid set.
  {
    const raidSets = [];
    for (const p of (d.pendingLog || [])) {
      const k = setterKind(p);
      if (k === 'raid' && p.pendingMonsterId && isSetEntry(p, p.pendingMonsterId)) raidSets.push(p);
    }
    for (const rs of raidSets) {
      const deadFo = (() => {
        for (const e of (d.shadowLog || [])) {
          if (e.foSeq > rs.foSeq && e.oldValue === rs.pendingMonsterId && e.newValue === null) return e.foSeq;
        }
        return Infinity;
      })();
      for (const p of (d.pendingLog || [])) {
        if (p.foSeq <= rs.foSeq || p.foSeq >= deadFo) continue;
        if (!isSetEntry(p, rs.pendingMonsterId)) continue;
        const k = setterKind(p);
        if (k === 'wanderer' || k === 'tent' || k === 'feast') {
          summary.totals.distinctPendingPairs++;
          const pair = { seed: d.seed, species: rs.pendingMonsterId, raidSetFo: rs.foSeq, nonraidSetFo: p.foSeq, nonraidKind: k };
          summary.pairs.push(pair); seedRow.pairs.push(pair);
          break;
        }
      }
    }
  }
  // AMENDMENT: a FIGHT is a creation OR an ended-inside attempt
  // (hadLive=false, liveNow=false — the fight ended inside
  // startCombat and its raid line lives in the attempt tail).
  // Refused attempts (hadLive=true) are counted separately and
  // never classified (no line can be said there).
  const fights = [
    ...creations.map((c) => ({ ...c, _kind: 'creation' })),
    ...(d.fightAttempts || []).filter((a) => !a.hadLive && !a.liveNow).map((a) => ({ ...a, _kind: 'attempt', ordinal: a.ordinal !== undefined ? a.ordinal : ('att' + a.foSeq) })),
  ].sort((a, b) => a.foSeq - b.foSeq);
  for (const a of (d.fightAttempts || [])) {
    if (a.hadLive) {
      summary.totals.refusedAttempts = (summary.totals.refusedAttempts || 0) + 1;
      if ((a.sayTail || []).some((l) => l.includes(RAID_LINE))) summary.totals.refusedLines = (summary.totals.refusedLines || 0) + 1;
    }
  }
  let prevFo = 0;
  for (const c of fights) {
    if (c._kind === 'creation') { summary.totals.creations++; seedRow.creations++; }
    summary.totals.fights = (summary.totals.fights || 0) + 1;
    const species = c.fightSpecies || [...new Set((c.fighters || []).filter((x) => x.monsterId).map((x) => x.monsterId))][0] || c.argMonsterId || null;
    const stackText = [...(c.stackLines || []), ...(c.stackFrames || [])].join('\n');
    const isDriveContests = /driveContestsImpl/.test(stackText);
    const sets = species ? setEntriesFor(d, species, prevFo, c.foSeq) : [];
    let pendingResolved = false, setterKindResolved = 'unknown';
    if (isDriveContests && sets.length) {
      const last = sets[sets.length - 1];
      if (clearedAfter(d, species, last.foSeq, c.foSeq)) {
        pendingResolved = true;
        setterKindResolved = setterKind(last);
      }
    }
    let provenance = 'unknown';
    if (pendingResolved) {
      provenance = setterKindResolved === 'raid' ? 'raid-pending'
        : (setterKindResolved === 'wanderer' || setterKindResolved === 'tent' || setterKindResolved === 'feast') ? 'nonraid-pending' : 'unknown';
    } else if (/contestChoose|contestEngine/.test(stackText)) provenance = 'contest';
    else if (c.argMonsterId) provenance = 'tile';
    summary.totals.provenance[provenance] = (summary.totals.provenance[provenance] || 0) + 1;
    const origin = c.originAtEntry || null;
    const originRaidBornSame = !!(origin && origin.raidBorn && species && origin.id === species);
    const raidLine = !!c.raidLineFired;
    if (raidLine) summary.totals.raidLines++;
    // OPP-B: nonraid-pending + raidBorn-same origin.
    if (provenance === 'nonraid-pending' && originRaidBornSame) {
      summary.totals.oppB++;
      if (raidLine) summary.totals.oppBFired++; else summary.totals.oppBNotFired++;
      summary.oppBList.push({ seed: d.seed, ordinal: c.ordinal, loopDay: c.loopDay, species, setterKind: setterKindResolved, raidLineFired: raidLine });
    }
    // OPP-A-WINDOW: shadow live at entry, fight species differs.
    if (c.shadowAtEntry && species && c.shadowAtEntry !== species) {
      summary.totals.oppAWindow++;
      summary.oppAList.push({ seed: d.seed, ordinal: c.ordinal, loopDay: c.loopDay, shadow: c.shadowAtEntry, fightSpecies: species, provenance, raidLineFired: raidLine });
    }
    const collisionA = raidLine && c.pendingMatch && provenance !== 'raid-pending' && !originRaidBornSame;
    const collisionB = raidLine && !c.pendingMatch && !!c.entityMatchCandidate && (provenance === 'nonraid-pending' || provenance === 'contest');
    const sameRaid = raidLine && !collisionA && !collisionB &&
      (provenance === 'raid-pending' || (originRaidBornSame && provenance === 'tile'));
    if (collisionA) summary.totals.collisionA++;
    if (collisionB) summary.totals.collisionB++;
    if (collisionA || collisionB) {
      summary.totals.collisions++;
      const rec = {
        seed: d.seed, ordinal: c.ordinal, loopDay: c.loopDay, path: collisionA ? 'A' : 'B',
        species, provenance, setterKind: setterKindResolved,
        shadowAtEntry: c.shadowAtEntry || null,
        origin: origin ? { id: origin.id, raidBorn: origin.raidBorn, lingering: origin.lingering } : null,
        slot: c.slot || null,
      };
      summary.collisions.push(rec); seedRow.collisions.push(rec);
    } else if (raidLine && provenance === 'unknown') {
      summary.totals.unclassifiedLines++;
      summary.unclassified.push({ seed: d.seed, ordinal: c.ordinal, loopDay: c.loopDay, species, pendingMatch: !!c.pendingMatch, entityMatchCandidate: !!c.entityMatchCandidate, origin: origin ? { id: origin.id, raidBorn: origin.raidBorn } : null });
    } else if (sameRaid) summary.totals.sameRaid++;
    prevFo = c.foSeq;
  }
  summary.seeds.push(seedRow);
}
// Dawn-raid mornings, raidname definition (morning interval +
// havenRaidTick setter + hall fight), for the sense sample + wall
// context. Reuses analyze-raidname-b logic in miniature.
{
  let mornings = 0;
  for (const f of fs.readdirSync(corpus).sort()) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
    const evCp = new Map(), moCp = new Map();
    for (const cp of (d.checkpoints || [])) {
      if (cp.checkpoint === 'evening') evCp.set(cp.loopDay, cp);
      if (cp.checkpoint === 'morning') moCp.set(cp.loopDay, cp);
    }
    const evRow = new Map((d.evenings || []).map((e) => [e.loopDay, e]));
    for (const m of (d.mornings || [])) {
      const ev = evRow.get(m.loopDay - 1);
      if (!ev || ev.inside !== true) continue;
      const ecp = evCp.get(m.loopDay - 1), mcp = moCp.get(m.loopDay);
      if (!ecp || !mcp) continue;
      const allFights = [
        ...(d.fightCreations || []),
        ...((d.fightAttempts || []).filter((a) => !a.hadLive && !a.liveNow)),
      ];
      const interval = allFights.filter((x) => x.seq >= ecp.seq && x.seq < mcp.seq);
      let isDawn = false;
      for (const c of interval) {
        const mons = c.fightSpecies ? [c.fightSpecies] : [...new Set((c.fighters || []).filter((x) => x.monsterId).map((x) => x.monsterId))];
        const prevFo2 = Math.max(0, ...(allFights.filter((x) => x.foSeq < c.foSeq).map((x) => x.foSeq)));
        const raidSet = (d.pendingLog || []).filter((p) =>
          p.foSeq < c.foSeq && p.foSeq > prevFo2 &&
          (p.stackFrames || []).some((s) => /havenRaidTick/.test(s)) && mons.includes(p.pendingMonsterId));
        if (raidSet.length && c.pos && c.pos.inside) { isDawn = true; break; }
      }
      if (isDawn) mornings++;
    }
  }
  summary.totals.dawnRaidMornings = mornings;
}
console.log(JSON.stringify(summary.totals, null, 2));
for (const c of summary.collisions) console.log('COLLISION-' + c.path + ' seed=' + c.seed + ' ord=' + c.ordinal + ' day=' + c.loopDay + ' species=' + c.species + ' provenance=' + c.provenance + ' setter=' + c.setterKind + ' shadow=' + c.shadowAtEntry);
for (const u of summary.unclassified) console.log('UNCLASSIFIED-LINE seed=' + u.seed + ' ord=' + u.ordinal + ' day=' + u.loopDay + ' species=' + u.species + ' pendingMatch=' + u.pendingMatch + ' entityCand=' + u.entityMatchCandidate);
if (out) fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
