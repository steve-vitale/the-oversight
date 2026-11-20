// analyze-draftmiss-a.js — diagnostic analyzer, arm sim-draftmiss-a.
// Pure read: classifies the presence arm's 21 draft-miss day|mid pairs
// from the already-committed corpora (perseed-presence-a-arm / -ctl,
// band 107051-107058, 150d). No game code, no new sims, no harness load.
//
// The presence counter (analyze-presence-a.js presenceStats) counts a
// poolDraftMiss row per v4tickPresence row where an armed holder was
// pooled (on-tile or adjacent), a wave-4+ world-tick encounter joins on
// (day, mid), and the lead is not a pooled holder. The rows collapse to
// 21 distinct (seed, day, mid) pairs — but the rows overcount (one row
// per tick call per fight), the recorder's adjacent list does not filter
// sheltered / post-flee-resting holders the way the draft does, the
// pre-tick read goes stale across the raid teleport (endDay), and the
// origin classifier mislabels raid-defense fights as 'world-tick'
// (fightOrigin returns 'world-tick' for ANY fight routed through
// resolveWildMonsterEncounter, including the raid path).
//
// Classification (frozen prereg, evidence/2026-11-20/sim-draftmiss-a.md):
//   (a) sheltered holder — tick fight at a pooled slot; holder's feasible
//       node region for that call is exactly the haven (4,4) AND the
//       muster was in effect that day. NOT a miss.
//   (b) post-flee resting holder — tick fight at a pooled slot; holder
//       fled a same-day earlier fight at <= 25% HP (corpus encounter row).
//       NOT a miss.
//   (c) stale pre-tick read — tick fight at a pooled slot; holder died or
//       fought an earlier monster in the SAME tick call. NOT a miss.
//   (d) duplicate-row inflation — tick fight(s) happened but at NO pooled
//       slot; the counter re-counts one fight across the day's calls.
//       NOT a miss.
//   (e) no tick fight at the pooled slots — no tick fight happened for the
//       instance that day (all rows nOnTile = 0, so the joined encounter
//       must be a raid-path fight; or proven raid day + teleport
//       signature). The draft lives in the tick; the raid never consults
//       it. NOT a miss.
//   (f) UNCLASSIFIED — none of (a)-(e) established, or the evidence cannot
//       separate a NOT-a-miss mechanism from a REAL miss (an eligible
//       holder, pooled at the fight's tick slot, in a tick fight the draft
//       did not take).
//
// GO iff all 21 pairs classified, 0 UNCLASSIFIED.
//
// Usage:
//   node scripts/analyze-draftmiss-a.js --arm DIR --ctl DIR [--out FILE]
//   node scripts/analyze-draftmiss-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

const HAVEN = { x: 4, y: 4 };
const GRID_MAX = 8;

function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
function tileKey(x, y) { return x + ',' + y; }

// ---- corpus loading -------------------------------------------------------
function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const docs = [];
  for (const f of files) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (d && typeof d === 'object') docs.push(d);
    } catch (e) { /* invalid file: skipped, counted by caller */ }
  }
  docs.sort(function (a, b) { return (a.seed | 0) - (b.seed | 0); });
  return docs;
}

// ---- reproduction gate: the presence counter, verbatim --------------------
// presenceStats (analyze-presence-a.js): encByKey on (day, mid) for wave>=4
// origin 'world-tick' encounters; per tick row, pooled = onTile + adjacent;
// no match -> poolNoFight; lead in pooled -> poolHolderLed; else pooled ->
// poolDraftMiss row + detail. Returns { missRows, pairs } where pairs is a
// Map keyed seed|day|mid -> { seed, day, mid, rows, encounters }.
function reproduceMiss(docs) {
  const missRows = [];
  const pairMap = new Map();
  for (const d of docs) {
    const seed = d.seed;
    const encByKey = {};
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      if (r.origin !== 'world-tick') continue;
      const k = r.day + '|' + r.mid;
      (encByKey[k] = encByKey[k] || []).push(r);
    }
    for (const t of (d.v4tickPresence || [])) {
      const pooled = (t.onTile || []).concat(t.adjacent || []);
      const matches = encByKey[t.day + '|' + t.mid] || [];
      if (!matches.length) continue;
      let led = false;
      for (const m of matches) if (pooled.indexOf(m.vid) !== -1) { led = true; break; }
      if (led) continue;
      if (!pooled.length) continue;
      missRows.push({ seed: seed, day: t.day, mid: t.mid, seq: t.seq, pooled: pooled.slice(), leads: matches.map(function (m) { return m.vid; }) });
      const pk = seed + '|' + t.day + '|' + t.mid;
      if (!pairMap.has(pk)) pairMap.set(pk, { seed: seed, day: t.day, mid: t.mid, rows: [], encounters: matches });
      pairMap.get(pk).rows.push(t);
    }
  }
  const pairs = Array.from(pairMap.values()).sort(function (a, b) {
    return (a.seed - b.seed) || (a.day - b.day) || (a.mid < b.mid ? -1 : 1);
  });
  return { missRows: missRows, pairs: pairs };
}

// ---- tick-call reconstruction ---------------------------------------------
// Rows of one villagerMonsterTick call are consecutive in seq, one row per
// living wave-4+ monster; one monster per tile per call. A new call begins
// when a (tx, ty) repeats. Returns [{ rows, seqMin, seqMax }].
function segmentCalls(dayRows) {
  const rows = (dayRows || []).slice().sort(function (a, b) { return (a.seq | 0) - (b.seq | 0); });
  const calls = [];
  let cur = null;
  let seen = {};
  for (const r of rows) {
    const k = tileKey(r.tx, r.ty);
    if (!cur || seen[k]) {
      cur = { rows: [], seqMin: r.seq, seqMax: r.seq, seen: {} };
      calls.push(cur);
      seen = cur.seen;
    }
    cur.rows.push(r);
    cur.seqMax = r.seq;
    seen[k] = true;
  }
  for (const c of calls) delete c.seen;
  return calls;
}

// ---- instance tracking ------------------------------------------------------
// Link a monster type's rows across a day's calls into instances by position
// continuity (a wander step is one orthogonal tile; the raid teleport moves
// to the haven overnight, never within a day). Returns [{ rows }].
function trackInstances(rows) {
  const sorted = (rows || []).slice().sort(function (a, b) { return (a.seq | 0) - (b.seq | 0); });
  const insts = [];
  for (const r of sorted) {
    let best = null, bestD = Infinity;
    for (const inst of insts) {
      if (inst.mid !== r.mid) continue;
      const last = inst.rows[inst.rows.length - 1];
      const d = cheb(last.tx, last.ty, r.tx, r.ty);
      if (d <= 1 && d < bestD) { best = inst; bestD = d; }
    }
    if (best) best.rows.push(r);
    else insts.push({ mid: r.mid, rows: [r] });
  }
  return insts;
}

// ---- feasible node region ---------------------------------------------------
// For one tick call (all of the day's rows in that call) and one holder:
// the holder is armed (per the day's census, stable within the call —
// no volley without a lead, no damage without a fight), so pooled in a
// row ⟺ the holder's node is within Chebyshev 1 of that row's monster.
// Returns the set of tiles (as [x, y] pairs) consistent with every row,
// or null when the holder is not armed that day (region unusable).
function feasibleRegion(callRows, holder, armed) {
  if (!armed) return null;
  const tiles = [];
  for (let x = 0; x <= GRID_MAX; x++) {
    for (let y = 0; y <= GRID_MAX; y++) {
      let ok = true;
      for (const r of callRows) {
        const pooled = ((r.onTile || []).indexOf(holder) !== -1) || ((r.adjacent || []).indexOf(holder) !== -1);
        const adj = cheb(x, y, r.tx, r.ty) <= 1;
        if (pooled !== adj) { ok = false; break; }
      }
      if (ok) tiles.push([x, y]);
    }
  }
  return tiles;
}
function regionIsHaven(tiles) {
  return Array.isArray(tiles) && tiles.length === 1 && tiles[0][0] === HAVEN.x && tiles[0][1] === HAVEN.y;
}

// ---- muster-state model -------------------------------------------------------
// shelterMusterCheck runs once a day inside endDay (progDaily): fires when
// a wave-4+ monster is within Chebyshev 2 of the haven, stands down only
// when no wave-4+ threat is within Chebyshev 3. The sim bot never stands
// a muster down (stand-down is a Haven-panel player action); the only
// release is the endDay all-clear. So the state during day D is set at
// endDay D-1. Simulated from the last tick call's positions each day
// (the endDay positions, modulo fight moves inside the last call). Days
// with no tick rows carry the previous day's positions forward (no
// worldTick ran, so nothing wandered). Returns
// { during: {day: bool}, log: [{day, threat2, threat3, fired, cleared}]}.
function musterModel(doc) {
  const byDay = {};
  for (const t of (doc.v4tickPresence || [])) {
    (byDay[t.day] = byDay[t.day] || []).push(t);
  }
  const rowDays = Object.keys(byDay).map(Number).sort(function (a, b) { return a - b; });
  if (!rowDays.length) return { during: {}, log: [] };
  const minDay = rowDays[0];
  const maxDay = (doc.days | 0) || rowDays[rowDays.length - 1];
  const during = {};
  const log = [];
  let mustered = false;
  let carried = null; // last-call positions carried across no-row days
  for (let day = minDay; day <= maxDay; day++) {
    during[day] = mustered;
    let last = null;
    if (byDay[day]) {
      const calls = segmentCalls(byDay[day]);
      last = calls.length ? calls[calls.length - 1].rows : [];
      carried = last;
    } else {
      last = carried || [];
    }
    let threat2 = false, threat3 = false;
    for (const r of last) {
      const d = cheb(r.tx, r.ty, HAVEN.x, HAVEN.y);
      if (d <= 2) threat2 = true;
      if (d <= 3) threat3 = true;
    }
    let fired = false, cleared = false;
    if (threat2 && !mustered) { mustered = true; fired = true; }
    else if (!threat3 && mustered) { mustered = false; cleared = true; }
    log.push({ day: day, threat2: threat2, threat3: threat3, fired: fired, cleared: cleared, musteredAfter: mustered });
  }
  return { during: during, log: log };
}

// ---- small corpus helpers -----------------------------------------------------
function censusRow(doc, day, vid) {
  for (const r of (doc.ammoCensus || [])) {
    if (r.day === day && r.vid === vid) return r;
  }
  return null;
}
function holderArmed(doc, day, vid) {
  const c = censusRow(doc, day, vid);
  return !!c && c.rangedId === 'searcaster' && (c.cells | 0) >= 1;
}
function holderDied(doc, day, vid) {
  for (const dh of (doc.deaths || [])) {
    if (dh.day === day && dh.who === vid) return dh;
  }
  return null;
}
// The holder's same-day earlier flee at <= 25% HP (wild router + expedition
// branch only; aid/raid/arena fights never flag). Origins 'world-tick' and
// 'expedition' are the flaggable paths in this corpus (the raid path reads
// as 'world-tick' too — a raid vFlee would be indistinguishable here; no
// holder flees at all on pair days, so the ambiguity is moot for the verdict).
function holderEarlierFlee(doc, day, vid) {
  const out = [];
  for (const r of (doc.v4encounters || [])) {
    if (r.day !== day || r.vid !== vid) continue;
    if (r.origin !== 'world-tick' && r.origin !== 'expedition') continue;
    if (r.outcome !== 'vFlee') continue;
    if (r.fleeHpFrac == null || +r.fleeHpFrac > 0.25) continue;
    out.push(r);
  }
  return out;
}
// The holder as lead/ally in another monster's encounter the same day.
function holderOtherEncounters(doc, day, vid, mid) {
  const out = [];
  for (const r of (doc.v4encounters || [])) {
    if (r.day !== day || (r.wave | 0) < 4) continue;
    if (r.mid === mid) continue;
    if (r.vid === vid || ((r.allyVids || []).indexOf(vid) !== -1)) out.push(r);
  }
  return out;
}

// ---- raid-teleport signature --------------------------------------------------
// havenRaidTick teleports drafted raiders onto the haven tile (4,4) at
// endDay. Between the last tick call of day D and the first tick call of
// day D+1 the monster can move at most: one mFlee step (only if the pair's
// fight ended mFlee) + one wander step (orthogonal, in the first D+1
// worldTick). So a teleport is PROVEN when the instance's first D+1
// position is at/adjacent-orthogonally to the haven while the displacement
// from its last day-D position exceeds the available steps. A diagonal or
// long overnight move cannot be wandering.
function teleportSignature(doc, day, mid, instRows, encounters) {
  const d1 = (doc.v4tickPresence || []).filter(function (t) { return t.day === day + 1 && t.mid === mid; });
  if (!d1.length) return { teleported: false, reason: 'no D+1 rows for ' + mid };
  const last = instRows[instRows.length - 1];
  const lastPos = [last.tx, last.ty];
  const calls = segmentCalls(d1);
  const first = calls.length ? calls[0].rows : [];
  if (!first.length) return { teleported: false, reason: 'no D+1 calls' };
  let best = null, bestD = Infinity;
  for (const r of first) {
    const d = cheb(lastPos[0], lastPos[1], r.tx, r.ty);
    if (d < bestD) { best = r; bestD = d; }
  }
  const fp = [best.tx, best.ty];
  const nearHaven = (fp[0] === 4 && fp[1] === 4) ||
    (fp[0] === 3 && fp[1] === 4) || (fp[0] === 5 && fp[1] === 4) ||
    (fp[0] === 4 && fp[1] === 3) || (fp[0] === 4 && fp[1] === 5);
  const mFlee = (encounters || []).some(function (e) { return e.outcome === 'mFlee'; });
  const available = 1 + (mFlee ? 1 : 0);
  const manhattan = Math.abs(fp[0] - lastPos[0]) + Math.abs(fp[1] - lastPos[1]);
  const teleported = nearHaven && manhattan > available;
  return { teleported: teleported, lastPos: lastPos, firstPos: fp, manhattan: manhattan,
    availableSteps: available, mFlee: mFlee,
    reason: teleported ? 'overnight move ' + JSON.stringify(lastPos) + '->' + JSON.stringify(fp) +
      ' (' + manhattan + ' steps) exceeds the ' + available + ' available without a raid teleport'
      : (nearHaven ? 'first D+1 position near haven but reachable in ' + available + ' step(s)' : 'first D+1 position not near haven') };
}

// ---- per-pair classification --------------------------------------------------
function classifyPair(pair, doc, muster, provenRaidDays) {
  const seed = pair.seed, day = pair.day, mid = pair.mid;
  const ev = { seed: seed, day: day, mid: mid, mechanisms: [], alternates: [], notes: [] };
  const dayRows = (doc.v4tickPresence || []).filter(function (t) { return t.day === day; });
  const pairRows = dayRows.filter(function (t) { return t.mid === mid; });
  const calls = segmentCalls(dayRows);
  const callOfSeq = {};
  calls.forEach(function (c, i) { c.rows.forEach(function (r) { callOfSeq[r.seq] = i; }); });
  const instances = trackInstances(pairRows);
  const missPooled = [];
  for (const r of pair.rows) {
    for (const h of (r.onTile || []).concat(r.adjacent || [])) {
      if (missPooled.indexOf(h) === -1) missPooled.push(h);
    }
  }
  ev.holders = missPooled;
  ev.nRows = pair.rows.length;
  ev.nEncounters = pair.encounters.length;
  ev.nInstances = instances.length;
  if (missPooled.length !== 1) {
    ev.cls = 'f'; ev.reason = 'expected exactly one pooled holder, found ' + missPooled.length + ' (' + missPooled.join(',') + ')';
    return ev;
  }
  const holder = missPooled[0];
  ev.holder = holder;
  const armed = holderArmed(doc, day, holder);
  ev.armed = armed;
  if (!armed) {
    ev.cls = 'f'; ev.reason = 'holder ' + holder + ' is not armed per the day-' + day + ' census (no searcaster or 0 cells) — recorder/census contradiction';
    return ev;
  }
  // Per-instance eligible slots (a tick fight needs a villager on the tile).
  const instInfo = instances.map(function (inst) {
    const eligible = inst.rows.filter(function (r) { return (r.nOnTile | 0) >= 1; });
    const pooledEligible = eligible.filter(function (r) {
      return ((r.onTile || []).indexOf(holder) !== -1) || ((r.adjacent || []).indexOf(holder) !== -1);
    });
    return { inst: inst, eligible: eligible, pooledEligible: pooledEligible };
  });
  const allEligible = [];
  instInfo.forEach(function (ii) { ii.eligible.forEach(function (r) { allEligible.push(r); }); });
  const pooledEligible = [];
  instInfo.forEach(function (ii) { ii.pooledEligible.forEach(function (r) { pooledEligible.push(r); }); });
  ev.eligibleSlots = allEligible.length;
  ev.pooledEligibleSlots = pooledEligible.length;
  ev.rowInflation = pair.rows.length / Math.max(1, pair.encounters.length);

  // (e) E1: no tick-eligible slot anywhere for this mid — a tick fight was
  // impossible at every call (the candidate set can only shrink mid-call).
  if (allEligible.length === 0) {
    ev.cls = 'e'; ev.mechanisms.push('e');
    ev.reason = 'every tick row for ' + mid + ' on day ' + day + ' has nOnTile = 0 — no tick fight could happen; the joined encounter(s) must be raid-path fights';
    return ev;
  }

  // Raid context for this seed/day.
  const isProvenRaidDay = provenRaidDays.has(day);
  const tele = teleportSignature(doc, day, mid, instances[0].rows, pair.encounters);
  ev.teleport = tele;
  ev.provenRaidDay = isProvenRaidDay;
  ev.raidExcluded = false;
  for (const rd of provenRaidDays) {
    if (day - rd >= 1 && day - rd <= 6) { ev.raidExcluded = true; ev.raidExcludedBy = rd; }
  }
  // At most one raid fight per instance per day (one raid, one fight per
  // raider); on a proven raid day with a teleport signature, one of the
  // joined encounters may be that raid fight.
  let nTick = pair.encounters.length;
  if (isProvenRaidDay && tele.teleported && nTick >= 2) nTick = nTick - 1;
  ev.nTickFights = nTick;

  // (e) E2: proven raid day + teleport signature + a single joined
  // encounter. If the encounter were a tick fight, the raid (proven to
  // have fired that day) would have drafted this tied-nearest instance
  // too and fought it again with an available defender — a second
  // encounter. Only one exists, so the single encounter is the raid
  // fight. (Residual: defenders exhausted — implausible with a full
  // healthy roster fighting that day; recorded as a limitation.)
  if (isProvenRaidDay && tele.teleported && pair.encounters.length === 1) {
    ev.cls = 'e'; ev.mechanisms.push('e');
    ev.reason = 'proven raid day + raid-teleport signature + a single joined encounter — the encounter is the raid fight, not a tick fight';
    const alt = shelteredAtSlots(ev, doc, muster, pooledEligible, callOfSeq, calls, holder, armed);
    if (alt.allSheltered) { ev.alternates.push('a'); ev.notes.push('alternate (a): the holder was also sheltered at the pooled eligible slot(s) — NOT-a-miss either way'); }
    return ev;
  }

  // (b): same-day earlier flee at <= 25% HP (flaggable paths only).
  const flee = holderEarlierFlee(doc, day, holder);
  if (flee.length) {
    ev.cls = 'b'; ev.mechanisms.push('b');
    ev.fleeRows = flee.map(function (r) { return { mid: r.mid, vid: r.vid, origin: r.origin, fleeHpFrac: r.fleeHpFrac }; });
    ev.reason = 'holder fled a same-day earlier fight at <= 25% HP (' + flee.length + ' row(s)) — post-flee resting at fight time';
    ev.notes.push('same-day ordering assumed: the corpus has no intra-day timestamps; the flee is taken to precede the pair\'s fight');
    return ev;
  }
  // (c): holder died that day, or fought an earlier monster in the same
  // tick call (same-call precedence from the call's row order).
  const death = holderDied(doc, day, holder);
  if (death) {
    ev.cls = 'c'; ev.mechanisms.push('c');
    ev.reason = 'holder died on day ' + day + ' (' + (death.cause || death.kind || '?') + ') — the pre-tick pooled read went stale';
    return ev;
  }
  const otherEnc = holderOtherEncounters(doc, day, holder, mid);
  if (otherEnc.length) {
    const sameCall = earlierSameCall(otherEnc, pair, calls, callOfSeq, doc, day);
    if (sameCall) {
      ev.cls = 'c'; ev.mechanisms.push('c');
      ev.reason = 'holder fought an earlier monster in the same tick call (' + sameCall.mid + ', ' + sameCall.vid + ') before this monster\'s turn';
      return ev;
    }
    ev.notes.push('holder has ' + otherEnc.length + ' other wave-4+ encounter(s) that day but none in the same tick call before this monster');
  }

  // Slot logic for (a) / (d) / real-miss.
  if (pooledEligible.length === 0) {
    ev.cls = 'd'; ev.mechanisms.push('d');
    ev.reason = 'tick fight(s) happened, but at NO pooled slot: all ' + allEligible.length + ' tick-eligible slot(s) have the holder NOT pooled; the ' + pair.rows.length + ' pooled rows are from other slots of the same instance';
    return ev;
  }
  const shel = shelteredAtSlots(ev, doc, muster, pooledEligible, callOfSeq, calls, holder, armed);
  ev.slotShelter = shel.perSlot;
  if (nTick === allEligible.length) {
    // Every eligible slot hosted a fight — the draft had its chance at
    // every pooled eligible slot.
    if (shel.allSheltered) {
      ev.cls = 'a'; ev.mechanisms.push('a');
      ev.reason = 'tick fight at a pooled slot; the holder was sheltered at every pooled eligible slot (feasible node = haven (4,4), muster in effect day ' + day + ')';
    } else {
      ev.cls = 'f'; ev.reason = 'REAL-MISS? tick fight at a pooled slot where the holder was NOT sheltered (slot shelter: ' + JSON.stringify(shel.perSlot) + ') and not resting/stale — the draft should have fired';
      ev.realMiss = true;
    }
    return ev;
  }
  // Subset unknown: the fight(s) are at an unknown subset of the eligible
  // slots. Sheltered-at-all-pooled-slots => (a) with (d) alternate (fight
  // at a pooled slot is (a), at an unpooled slot is (d) — both NOT-a-miss).
  // Sheltered-at-none => cannot separate a real miss from (d) => (f).
  if (shel.allSheltered) {
    ev.cls = 'a'; ev.mechanisms.push('a'); ev.alternates.push('d');
    ev.reason = 'tick fight(s) at an unknown subset of ' + allEligible.length + ' eligible slot(s); the holder was sheltered at every pooled eligible slot, so a fight at a pooled slot is (a) and at an unpooled slot is (d) — NOT-a-miss either way';
  } else if (shel.noneSheltered) {
    ev.cls = 'f'; ev.reason = 'ambiguous: the tick fight(s) are at an unknown subset of ' + allEligible.length + ' eligible slot(s); the holder was NOT sheltered at any pooled eligible slot, so the fight may have been a real miss (pooled slot) or (d) (unpooled slot)';
  } else {
    ev.cls = 'f'; ev.reason = 'ambiguous: sheltered at some pooled eligible slots but not others, and the fight\'s slot is unknown';
  }
  return ev;
}

// Shelter evaluation at a set of pooled eligible rows: per row, the
// holder's feasible node region for that row's call, and the muster state
// that day. Sheltered ⟺ region is exactly the haven AND the muster is in
// effect. Returns { allSheltered, noneSheltered, perSlot }.
function shelteredAtSlots(ev, doc, muster, pooledEligible, callOfSeq, calls, holder, armed) {
  const perSlot = [];
  for (const r of pooledEligible) {
    const ci = callOfSeq[r.seq];
    const callRows = (ci != null && calls[ci]) ? calls[ci].rows : [r];
    const region = feasibleRegion(callRows, holder, armed);
    const isHaven = regionIsHaven(region);
    const musterOn = !!muster.during[r.day];
    perSlot.push({ seq: r.seq, call: ci, regionSize: region ? region.length : null,
      regionIsHaven: isHaven, musterOn: musterOn, sheltered: isHaven && musterOn });
  }
  const allSheltered = perSlot.length > 0 && perSlot.every(function (s) { return s.sheltered; });
  const noneSheltered = perSlot.every(function (s) { return !s.sheltered; });
  return { allSheltered: allSheltered, noneSheltered: noneSheltered, perSlot: perSlot };
}

// (c) same-call check: did the holder fight an earlier monster in the
// same tick call as this pair's fight? An encounter's candidate calls are
// the calls where its instance has an eligible slot; precedence inside a
// call is the tick row order (worldMonsters order). Returns the earliest
// such encounter or null.
function earlierSameCall(otherEncounters, pair, calls, callOfSeq, doc, day) {
  const pairDayRows = (doc.v4tickPresence || []).filter(function (t) { return t.day === day && t.mid === pair.mid; });
  const pairInsts = trackInstances(pairDayRows);
  const pairEligibleCalls = {};
  pairInsts.forEach(function (inst) {
    inst.rows.forEach(function (r) {
      if ((r.nOnTile | 0) >= 1) pairEligibleCalls[callOfSeq[r.seq]] = true;
    });
  });
  for (const oe of otherEncounters) {
    const oeRows = (doc.v4tickPresence || []).filter(function (t) { return t.day === day && t.mid === oe.mid; });
    const oeInsts = trackInstances(oeRows);
    for (const inst of oeInsts) {
      for (const r of inst.rows) {
        if ((r.nOnTile | 0) < 1) continue;
        const ci = callOfSeq[r.seq];
        if (ci == null || !pairEligibleCalls[ci]) continue;
        // Same call: does the other monster precede the pair's monster?
        const callRows = calls[ci].rows;
        const oeIdx = callRows.findIndex(function (x) { return x.seq === r.seq; });
        const pairIdx = callRows.findIndex(function (x) { return x.mid === pair.mid; });
        if (oeIdx !== -1 && pairIdx !== -1 && oeIdx < pairIdx) return oe;
      }
    }
  }
  return null;
}

// ---- whole-band analysis -----------------------------------------------------
function provenRaidDaysForSeed(doc, pairs) {
  const days = new Set();
  for (const pair of pairs) {
    if (pair.seed !== doc.seed) continue;
    const rows = (doc.v4tickPresence || []).filter(function (t) { return t.day === pair.day && t.mid === pair.mid; });
    if (rows.length && rows.every(function (r) { return (r.nOnTile | 0) === 0; })) days.add(pair.day);
  }
  return days;
}

// CTL comparison for one pair: the same (seed, day, mid) on the control leg
// (PRESENCE off — the draft cannot fire there, but the tick rows and the
// fights should match the arm leg until the legs diverge). Returns
// 'identical' | 'diverged' with a detail string.
function ctlCompare(pair, ctlDoc) {
  if (!ctlDoc) return { status: 'no-ctl-doc', detail: '' };
  const armRows = (pair.doc.v4tickPresence || []).filter(function (t) { return t.day === pair.day && t.mid === pair.mid; });
  const ctlRows = (ctlDoc.v4tickPresence || []).filter(function (t) { return t.day === pair.day && t.mid === pair.mid; });
  const armEnc = pair.encounters;
  const ctlEnc = (ctlDoc.v4encounters || []).filter(function (r) {
    return r.day === pair.day && r.mid === pair.mid && (r.wave | 0) >= 4 && r.origin === 'world-tick';
  });
  const normRow = function (r) { return [r.seq, r.tx, r.ty, r.nOnTile, (r.onTile || []).join(','), (r.adjacent || []).join(',')].join('|'); };
  const normEnc = function (r) { return [r.vid, r.origin, r.outcome, r.rounds].join('|'); };
  const aR = armRows.map(normRow).sort().join(';');
  const cR = ctlRows.map(normRow).sort().join(';');
  const aE = armEnc.map(normEnc).sort().join(';');
  const cE = ctlEnc.map(normEnc).sort().join(';');
  if (aR === cR && aE === cE) return { status: 'identical', detail: armRows.length + ' tick rows, ' + armEnc.length + ' encounter(s)' };
  return { status: 'diverged',
    detail: 'tick rows arm ' + armRows.length + ' vs ctl ' + ctlRows.length +
      '; encounters arm [' + armEnc.map(function (e) { return e.vid + '/' + e.outcome; }).join(',') +
      '] vs ctl [' + ctlEnc.map(function (e) { return e.vid + '/' + e.outcome; }).join(',') + ']' };
}

function analyze(armDir, ctlDir) {
  const armDocs = loadDir(armDir);
  const ctlDocs = loadDir(ctlDir);
  const ctlBySeed = {};
  ctlDocs.forEach(function (d) { ctlBySeed[d.seed] = d; });
  const rep = reproduceMiss(armDocs);
  const gate = { rows: rep.missRows.length, pairs: rep.pairs.length,
    expectedRows: 64, expectedPairs: 21,
    pass: rep.missRows.length === 64 && rep.pairs.length === 21 };
  const perSeed = {};
  armDocs.forEach(function (doc) {
    perSeed[doc.seed] = { doc: doc, muster: musterModel(doc) };
  });
  const results = [];
  for (const pair of rep.pairs) {
    const ps = perSeed[pair.seed];
    pair.doc = ps.doc;
    const proven = provenRaidDaysForSeed(ps.doc, rep.pairs.filter(function (p) { return p.seed === pair.seed; }));
    const r = classifyPair(pair, ps.doc, ps.muster, proven);
    r.ctl = ctlCompare(pair, ctlBySeed[pair.seed]);
    results.push(r);
  }
  const counts = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
  results.forEach(function (r) { counts[r.cls] = (counts[r.cls] || 0) + 1; });
  const totalFights = results.reduce(function (s, r) { return s + r.nEncounters; }, 0);
  const overcount = { rows: rep.missRows.length, fights: totalFights, pairs: rep.pairs.length,
    rowsPerFight: rep.missRows.length / Math.max(1, totalFights),
    rowsPerPair: rep.missRows.length / Math.max(1, rep.pairs.length) };
  // Muster-model agreement: over the slot shelter checks, on muster-ON days
  // the holder's region should be exactly the haven; on muster-OFF days it
  // should exclude the haven (the holder is out working).
  let agreeOn = 0, totalOn = 0, agreeOff = 0, totalOff = 0;
  results.forEach(function (r) {
    (r.slotShelter || []).forEach(function (s) {
      if (s.musterOn) { totalOn++; if (s.regionIsHaven) agreeOn++; }
      else { totalOff++; if (!s.regionIsHaven) agreeOff++; }
    });
  });
  const musterAgreement = { onDays: { haven: agreeOn, total: totalOn }, offDays: { notHaven: agreeOff, total: totalOff } };
  const realMiss = results.filter(function (r) { return r.realMiss; });
  const verdict = (gate.pass && counts.f === 0) ? 'GO' : 'NO-GO';
  return { verdict: verdict, gate: gate, counts: counts, overcount: overcount,
    musterAgreement: musterAgreement, realMiss: realMiss.map(function (r) { return r.seed + '|' + r.day + '|' + r.mid; }),
    pairs: results };
}

// ---- selftest -----------------------------------------------------------------
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; }
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  function mkDoc(o) {
    return Object.assign({ seed: 1, v4tickPresence: [], v4encounters: [], ammoCensus: [], deaths: [] }, o);
  }
  function tickRow(seq, day, mid, tx, ty, nOnTile, onTile, adjacent) {
    return { seq: seq, day: day, mid: mid, wave: 4, tx: tx, ty: ty, nOnTile: nOnTile, onTile: onTile || [], adjacent: adjacent || [], holderPresent: ((onTile || []).length + (adjacent || []).length) > 0 };
  }
  function enc(day, vid, mid, outcome, opts) {
    return Object.assign({ day: day, vid: vid, mid: mid, wave: 4, origin: 'world-tick', outcome: outcome, rounds: 2, fleeHpFrac: null, allyVids: [] }, opts || {});
  }

  // 1. Reproduction: 2 miss rows -> 1 pair; a led row (a different mid whose
  // encounter is led by the holder) and a no-fight row add none.
  (function () {
    const doc = mkDoc({
      v4tickPresence: [
        tickRow(1, 10, 'reunion', 4, 5, 1, [], ['holder_a']),
        tickRow(2, 10, 'reunion', 4, 5, 1, [], ['holder_a']),
        tickRow(3, 10, 'herald', 4, 5, 1, [], ['holder_a']), // led row (holder leads it)
        tickRow(4, 11, 'reunion', 4, 5, 1, [], ['holder_a']) // no-fight row (no encounter day 11)
      ],
      v4encounters: [enc(10, 'lead_x', 'reunion', 'vFlee'), enc(10, 'holder_a', 'herald', 'vFlee')]
    });
    const rep = reproduceMiss([doc]);
    check('repro: 2 miss rows', rep.missRows.length === 2, 'got ' + rep.missRows.length);
    check('repro: 1 pair', rep.pairs.length === 1, 'got ' + rep.pairs.length);
    check('repro: pair has 1 encounter', rep.pairs[0].encounters.length === 1, 'got ' + rep.pairs[0].encounters.length);
  })();

  // 2. Call segmentation: (tx,ty) repeats start a new call. The fifth row's
  // tile (3,5) has not appeared in the second call, so it stays there.
  (function () {
    const rows = [tickRow(1, 10, 'a', 4, 5, 0), tickRow(2, 10, 'b', 6, 1, 0),
      tickRow(3, 10, 'a', 4, 5, 0), tickRow(4, 10, 'b', 6, 1, 0),
      tickRow(5, 10, 'a', 3, 5, 0)];
    const calls = segmentCalls(rows);
    check('calls: 2 calls', calls.length === 2, 'got ' + calls.length);
    check('calls: sizes 2,3', calls[0].rows.length === 2 && calls[1].rows.length === 3, JSON.stringify(calls.map(function (c) { return c.rows.length; })));
  })();

  // 3. Feasible region: pooled around (4,4) on all four sides pins (4,4).
  (function () {
    const callRows = [
      tickRow(1, 10, 'm1', 3, 4, 0, [], ['holder_a']),
      tickRow(2, 10, 'm2', 5, 4, 0, [], ['holder_a']),
      tickRow(3, 10, 'm3', 4, 3, 0, [], ['holder_a']),
      tickRow(4, 10, 'm4', 4, 5, 0, [], ['holder_a']),
      tickRow(5, 10, 'm5', 0, 0, 0, [], [])
    ];
    const region = feasibleRegion(callRows, 'holder_a', true);
    check('region: exactly the haven', regionIsHaven(region), JSON.stringify(region));
    const region2 = feasibleRegion([
      tickRow(1, 10, 'm1', 4, 6, 0, [], ['holder_a']),
      tickRow(2, 10, 'm2', 4, 4, 0, [], [])
    ], 'holder_a', true);
    check('region: excludes the haven', !!region2 && !regionIsHaven(region2) && region2.every(function (t) { return !(t[0] === 4 && t[1] === 4); }), JSON.stringify(region2));
    check('region: unarmed -> null', feasibleRegion(callRows, 'holder_a', false) === null, '');
  })();

  // 4. Muster model: threat within 2 fires at endDay; clears only past 3.
  (function () {
    const doc = mkDoc({
      v4tickPresence: [
        tickRow(1, 10, 'm1', 4, 5, 0), // day 10: threat at distance 1 -> fires at endDay 10
        tickRow(2, 11, 'm1', 4, 5, 0), // day 11: still a threat
        tickRow(3, 12, 'm1', 0, 0, 0) // day 12: far away -> clears at endDay 12
      ]
    });
    const m = musterModel(doc);
    check('muster: off during day 10', m.during[10] === false, JSON.stringify(m.during));
    check('muster: on during day 11', m.during[11] === true, JSON.stringify(m.during));
    check('muster: on during day 12', m.during[12] === true, JSON.stringify(m.during));
  })();

  // 5. Teleport signature: diagonal overnight move past the haven proves it.
  (function () {
    const doc = mkDoc({
      v4tickPresence: [
        tickRow(1, 10, 'reunion', 3, 5, 0),
        tickRow(2, 11, 'reunion', 4, 4, 0)
      ]
    });
    const t = teleportSignature(doc, 10, 'reunion', [doc.v4tickPresence[0]], [{ outcome: 'vFlee' }]);
    check('teleport: diagonal (3,5)->(4,4) proves raid', t.teleported === true, JSON.stringify(t));
    const doc2 = mkDoc({
      v4tickPresence: [
        tickRow(1, 10, 'reunion', 4, 5, 0),
        tickRow(2, 11, 'reunion', 4, 4, 0)
      ]
    });
    const t2 = teleportSignature(doc2, 10, 'reunion', [doc2.v4tickPresence[0]], [{ outcome: 'vFlee' }]);
    check('teleport: orthogonal (4,5)->(4,4) does not prove raid', t2.teleported === false, JSON.stringify(t2));
  })();

  // 6. Classification fixtures — one per class.
  function pairDoc(opts) {
    // opts: { tickRows, encounters, census, deaths, musterDays }
    const doc = mkDoc(opts);
    return doc;
  }
  function classifyFixture(doc, day, mid, musterOverride) {
    const rep = reproduceMiss([doc]);
    check('fixture repro: 1 pair', rep.pairs.length === 1, 'got ' + rep.pairs.length + ' for ' + mid + ' day ' + day);
    const muster = musterOverride || musterModel(doc);
    const proven = provenRaidDaysForSeed(doc, rep.pairs);
    const r = classifyPair(rep.pairs[0], doc, muster, proven);
    return r;
  }
  // (a) sheltered: 1 fight, 1 eligible pooled slot, region (4,4), muster on.
  (function () {
    const doc = pairDoc({
      v4tickPresence: [
        tickRow(1, 10, 'm0', 4, 5, 0), // day 10 last call: threat within 2 -> muster fires
        tickRow(10, 11, 'm1', 3, 4, 0, [], ['holder_a']),
        tickRow(11, 11, 'm2', 5, 4, 0, [], ['holder_a']),
        tickRow(12, 11, 'm3', 4, 3, 0, [], ['holder_a']),
        tickRow(13, 11, 'm4', 4, 5, 1, [], ['holder_a']), // the pair's monster: eligible + pooled
        tickRow(14, 11, 'm5', 0, 0, 0, [], [])
      ],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee')],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }]
    });
    // The pair is (11, 'm4'); the muster fires at endDay 10 (threat (4,5)).
    const r = classifyFixture(doc, 11, 'm4');
    check('class (a) sheltered', r.cls === 'a', 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();
  // (b) post-flee resting: same-day earlier flee at 20% HP.
  (function () {
    const doc = pairDoc({
      v4tickPresence: [tickRow(1, 11, 'm4', 4, 5, 1, [], ['holder_a'])],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee'),
        enc(11, 'holder_a', 'other', 'vFlee', { fleeHpFrac: 0.2 })],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }]
    });
    const r = classifyFixture(doc, 11, 'm4');
    check('class (b) resting', r.cls === 'b', 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();
  // (c) stale pre-tick: holder died that day.
  (function () {
    const doc = pairDoc({
      v4tickPresence: [tickRow(1, 11, 'm4', 4, 5, 1, [], ['holder_a'])],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee')],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }],
      deaths: [{ day: 11, who: 'holder_a', kind: 'villager', cause: 'villager combat' }]
    });
    const r = classifyFixture(doc, 11, 'm4');
    check('class (c) stale (death)', r.cls === 'c', 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();
  // (d) duplicate-row inflation: fight at an unpooled eligible slot.
  (function () {
    const doc = pairDoc({
      // call 1: monster at (4,4), eligible, holder NOT pooled.
      // call 2: monster at (4,5), not eligible, holder pooled.
      v4tickPresence: [
        tickRow(1, 11, 'm4', 4, 4, 1, [], []),
        tickRow(2, 11, 'm4', 4, 5, 0, [], ['holder_a'])
      ],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee')],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }]
    });
    const r = classifyFixture(doc, 11, 'm4');
    check('class (d) duplicate-row', r.cls === 'd', 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();
  // (e) no tick fight: all rows nOnTile = 0.
  (function () {
    const doc = pairDoc({
      v4tickPresence: [
        tickRow(1, 11, 'm4', 4, 6, 0, [], ['holder_a']),
        tickRow(2, 11, 'm4', 4, 6, 0, [], ['holder_a'])
      ],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee')],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }]
    });
    const r = classifyFixture(doc, 11, 'm4');
    check('class (e) no tick fight', r.cls === 'e', 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();
  // (f) real miss: eligible pooled slot, holder out in the world, muster off.
  (function () {
    const doc = pairDoc({
      v4tickPresence: [
        tickRow(1, 11, 'm4', 4, 6, 1, [], ['holder_a']), // eligible + pooled
        tickRow(2, 11, 'm5', 4, 4, 0, [], []) // holder NOT pooled here -> region excludes (4,4)
      ],
      v4encounters: [enc(11, 'lead_x', 'm4', 'vFlee')],
      ammoCensus: [{ day: 11, vid: 'holder_a', rangedId: 'searcaster', cells: 2 }]
    });
    const r = classifyFixture(doc, 11, 'm4');
    check('class (f) real miss', r.cls === 'f' && r.realMiss === true, 'got ' + r.cls + ' (' + (r.reason || '') + ')');
  })();

  console.log('analyze-draftmiss-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

// ---- CLI --------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let armDir = null, ctlDir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!armDir || !ctlDir) {
    console.error('usage: analyze-draftmiss-a.js --arm DIR --ctl DIR [--out FILE] | --selftest');
    process.exit(2);
  }
  const result = analyze(armDir, ctlDir);
  console.log(JSON.stringify({ verdict: result.verdict, gate: result.gate, counts: result.counts,
    overcount: result.overcount, musterAgreement: result.musterAgreement, realMiss: result.realMiss }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  if (!result.gate.pass) {
    console.error('REPRODUCTION GATE FAILED: expected 64 rows / 21 pairs, got ' +
      result.gate.rows + ' / ' + result.gate.pairs + ' — STOP, do not classify');
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) main();

module.exports = { loadDir: loadDir, reproduceMiss: reproduceMiss, segmentCalls: segmentCalls,
  trackInstances: trackInstances, feasibleRegion: feasibleRegion, regionIsHaven: regionIsHaven,
  musterModel: musterModel, holderArmed: holderArmed, holderDied: holderDied,
  holderEarlierFlee: holderEarlierFlee, holderOtherEncounters: holderOtherEncounters,
  teleportSignature: teleportSignature, classifyPair: classifyPair,
  provenRaidDaysForSeed: provenRaidDaysForSeed, ctlCompare: ctlCompare, analyze: analyze, selftest: selftest };
