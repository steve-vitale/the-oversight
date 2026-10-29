#!/usr/bin/env node
// scripts/test-funnel-a.js — sim-funnel-a funnel analyzer.
// DIAGNOSIS ONLY: pure reads of sim corpora, never game state.
// Primary: evidence/2026-10-29/perseed-funnel-a/s<seed>-fresh.json
//   (fieldparty.meetings + returns.meetings/departures/drops +
//   funnel.picks/notes + deathsList, seeds 75101-75116, base code).
// Reference: evidence/2026-10-29/perseed-returns-a/ (returns-a
// corpus, read-only) for the recorder-neutrality reproduction.
//   (a) NEUTRALITY: returns channels of the funnel corpus must
//   equal the returns-a corpus exactly (per-seed deep equality of
//   fieldparty meetings, returns meetings/departures/drops; wall
//   fields; death totals; judgedA 42; classes 39/3/0; chains 13;
//   HUNT departures 326; true drops 297). Any mismatch: STOP —
//   the taxonomy is not judged against a perturbed corpus.
//   (b) TRIPLES: judgedA vFlee grouped by (seed, vid, mid) must
//   yield exactly 19 (the returns-a triple set, same rule).
//   (c) TAXONOMY (prereg): each triple classified by furthest
//   stage reached in its post-anchor window (see classifyTriple),
//   with the cause from the last episode at that stage.
// Exit 1 on corpus invalidity, join errors, control-shape failure,
// neutrality mismatch, triple-count mismatch, or OTHER > 1.
// Usage: node scripts/test-funnel-a.js [--out <path>]
// When required as a module, main() does NOT run; the taxonomy
// functions are exported for the fixtures file.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyMeeting, buildChains } = require('./test-returns-a');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);

function medianOf(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s[Math.floor(s.length / 2)];
}
function cheb(ax, ay, bx, by) {
  if (ax == null || ay == null || bx == null || by == null) return null;
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}
function isFormedCrew(m) {
  return ((m.crewRaw || []).filter(v => v !== m.vid)).length > 0 && (m.calledHelp || !!m.joinedAllyVid);
}
function loadWaveMap() {
  const map = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const arr = Array.isArray(raw) ? raw : (raw.monsters || raw.data || []);
    for (const d of (arr || [])) if (d && d.id) map[d.id] = (d.wave | 0) || null;
  } catch (e) { /* best-effort */ }
  return map;
}

// ---- ordering helpers ----
// partCounter is monotonic with engine time (increments once per
// advancePart, on every recorder). Within one part value, channels
// cannot be cross-ordered by index, so same-part event pairs are
// resolved by the explicit rules in the prereg: a pick is
// post-anchor if its part exceeds the anchor's, or if it shares
// the anchor's part AND its pre-pick memories already carry the
// anchor fight's own stamp (the anchor note refreshed that entry
// before the pick ran).
function noteStampOf(meetingRt) {
  // The anchor note stamps (meeting day, meeting dayPart).
  return { day: meetingRt ? meetingRt.day : null, dayPart: meetingRt ? meetingRt.dayPart : null };
}
function sightingHasStamp(preSightings, mid, stamp) {
  if (!stamp || stamp.day == null) return false;
  return (preSightings || []).some(s => s[0] === mid && s[3] === stamp.day
    && (stamp.dayPart == null || s[4] == null || s[4] === stamp.dayPart));
}
function isPostAnchorPick(pick, anchorPart, anchorRt, mid) {
  if ((pick.part | 0) > (anchorPart | 0)) return true;
  if ((pick.part | 0) === (anchorPart | 0)) {
    return sightingHasStamp(pick.preSightings, mid, noteStampOf(anchorRt));
  }
  return false;
}

// ---- episodes ----
// An episode for (vid, mid) is a maximal interval during which at
// least one sighting entry for mid exists in the villager's store.
// Notes carry postSightings (all mids); drops remove one entry.
// Episode records: openNote (or 'anchor' for the anchor fight's
// own note, which is the first note in the window), closeKind:
// 'evicted' | 'drop' | 'horizon', closePart, picks (filled later),
// notes (count). The anchor note is identified as the first note
// for vid+mid at part >= anchorPart (notes are chronological).
function buildEpisodes(notes, drops, mid) {
  const episodes = [];
  let cur = null;
  const open = (ev, kind) => {
    cur = { openPart: ev.part | 0, openDay: ev.day, openKind: kind, closeKind: 'horizon', closePart: null, closeDay: null, notes: 0, evictedMids: [] };
    episodes.push(cur);
  };
  const close = (ev, kind) => {
    if (!cur) return;
    cur.closeKind = kind; cur.closePart = ev.part | 0; cur.closeDay = ev.day;
    cur = null;
  };
  // Walk notes + drops in part order (notes chronological within
  // their array; drops chronological within theirs; merge by part,
  // notes before drops on ties — a drop can only follow the note
  // that created the entry it spends, never precede it).
  const merged = [];
  for (const n of notes) merged.push({ t: 'note', ev: n });
  for (const d of drops) if (d.dropped) merged.push({ t: 'drop', ev: d });
  merged.sort((a, b) => ((a.ev.part | 0) - (b.ev.part | 0)) || (a.t === 'note' ? -1 : 1));
  for (const item of merged) {
    const ev = item.ev;
    if (item.t === 'note') {
      const post = (ev.postSightings || []).filter(s => s[0] === mid);
      const had = !!cur;
      if (!cur && post.length > 0) open(ev, 'note');
      if (cur) {
        cur.notes++;
        if ((ev.evicted || []).some(e => e[0] === mid)) cur.evictedMids.push(ev);
        if (post.length === 0) close(ev, 'evicted');
      } else if (had) {
        // cur was just closed above; nothing more to do.
      }
    } else {
      // Drop spends one entry (mid, tx, ty). If it empties the
      // mid set, the episode closes. The set is tracked via the
      // most recent note's postSightings: recompute from notes is
      // expensive; instead track entries seen: a drop closes the
      // episode only when no later note re-opens it AND the drop
      // is the last mid event before horizon or a new note — the
      // analyzer refines this below using note post-lists, so
      // here we close tentatively and re-open on the next note.
      if (cur) close(ev, 'drop');
    }
  }
  return episodes;
}

// Refine episodes against note post-lists: a tentative drop-close
// is WRONG if a later note (before any new mid-creating note... )
// still shows mid entries — that cannot happen, because a drop
// removes exactly one entry and the next note's post-list is
// authoritative: if the next note still lists mid entries, the
// episode never closed (the drop spent a different tile's entry
// while another mid entry survived). This function replays notes
// only and returns authoritative open/close boundaries; drops
// only close an episode when the following note (if any) shows
// no mid entries, or when no following note exists and the drop
// was for the last known entry. Simpler and exact: derive
// episodes from note post-lists alone, then mark a close as
// 'drop' when a true drop for the mid falls between the last
// mid-listing note and the first empty note (or horizon).
function buildEpisodesFromNotes(notes, drops, mid) {
  const episodes = [];
  let cur = null;
  let lastMidNote = null;
  const noteList = notes.slice();
  for (const n of noteList) {
    const post = (n.postSightings || []).filter(s => s[0] === mid);
    if (!cur && post.length > 0) {
      cur = { openPart: n.part | 0, openDay: n.day, openKind: 'note', closeKind: 'horizon', closePart: null, closeDay: null, notes: 0, evictedMids: [] };
      episodes.push(cur);
    }
    if (cur) {
      cur.notes++;
      if ((n.evicted || []).some(e => e[0] === mid)) cur.evictedMids.push({ day: n.day, part: n.part, entry: (n.evicted || []).filter(e => e[0] === mid) });
      if (post.length === 0) {
        // Closed between lastMidNote and this note: drop or eviction?
        const dropHere = (drops || []).filter(d => d.dropped && d.mid === mid
          && (d.part | 0) >= (lastMidNote ? (lastMidNote.part | 0) : 0) && (d.part | 0) <= (n.part | 0));
        cur.closeKind = dropHere.length ? 'drop' : 'evicted';
        cur.closePart = n.part | 0; cur.closeDay = n.day;
        cur.closeDrop = dropHere.length ? dropHere[0] : null;
        cur = null;
      } else {
        lastMidNote = n;
      }
    }
  }
  // A trailing drop after the last mid-listing note, with no later
  // note, closes the episode only if it spent the LAST mid entry.
  // Without a post-list we cannot prove "last" — but a drop for a
  // (mid, tile) that matches the last note's ONLY mid entry does
  // prove it. Otherwise the episode stays open to horizon (the
  // memory survives; the drop spent a duplicate tile entry).
  if (cur && lastMidNote) {
    const post = (lastMidNote.postSightings || []).filter(s => s[0] === mid);
    const trailing = (drops || []).filter(d => d.dropped && d.mid === mid && (d.part | 0) >= (lastMidNote.part | 0));
    if (post.length === 1 && trailing.length) {
      const t = trailing[0];
      if (t.tx === post[0][1] && t.ty === post[0][2]) {
        cur.closeKind = 'drop'; cur.closePart = t.part | 0; cur.closeDay = t.day; cur.closeDrop = t;
      }
    }
  }
  return episodes;
}

// Per-pick gate diagnosis for one triple-mid entry set at a pick.
// Returns { fresh: bool, stale: bool, reasons: [] } where reasons
// names the per-entry blocks (UNARMED, SHELTERED, POST-FLEE,
// OUT-OF-RANGE, SHADOWED) when a fresh entry exists but the
// candidate is not for this mid.
function diagnosePick(pick, mid) {
  const entries = (pick.preSightings || []).filter(s => s[0] === mid);
  if (!entries.length) return { hasEntry: false, fresh: false, stale: false, reasons: [] };
  const ages = entries.map(s => (pick.day != null && s[3] != null) ? (pick.day - s[3]) : null);
  const freshEntries = entries.filter((s, i) => ages[i] != null && ages[i] >= 0 && ages[i] <= 3);
  if (!freshEntries.length) return { hasEntry: true, fresh: false, stale: true, reasons: [] };
  const reasons = [];
  const g = pick.gates || {};
  if (g.armed === false) reasons.push('UNARMED');
  if (g.sheltered === true) reasons.push('SHELTERED');
  if (g.postFleeResting === true) reasons.push('POST-FLEE');
  let anyInRange = false;
  for (const s of freshEntries) {
    const d = cheb(s[1], s[2], pick.hx, pick.hy);
    if (d != null && d >= 1 && g.maxD != null && d <= g.maxD) anyInRange = true;
  }
  if (!anyInRange) reasons.push('OUT-OF-RANGE');
  if (!reasons.length && pick.candidate && pick.candidate.mid !== mid) reasons.push('SHADOWED');
  if (!reasons.length && !pick.candidate) reasons.push('UNKNOWN-GATE');
  return { hasEntry: true, fresh: true, stale: false, reasons };
}

// classifyTriple(trace) — trace: {
//   seed, vid, mid, anchor: {day, part, rtPart, rt, fp},
//   picks: [post-anchor picks for vid, in order],
//   departures: [returns departures for vid, in order],
//   drops: [returns drops for vid, dropped=true only, in order],
//   notes: [funnel notes for vid, in order],
//   meetings: [judgedA meetings for vid+mid after anchor, with
//     retClass from classifyMeeting],
//   deaths: [deathsList entries for vid, in order],
//   leaves: [returns departures for vid with kind LEAVE, in order],
// }
// Returns { stage, cls, sub, detail } — cls is the mechanism class
// (or DELIBERATE-MEETING / OTHER). Stage order S0..S5; the class
// follows the furthest stage, cause from the last episode at
// that stage (see prereg).
function classifyTriple(trace) {
  const { seed, vid, mid, anchor, picks, departures, drops, notes, meetings, deaths, leaves } = trace;
  const detail = { seed, vid, mid, anchorDay: anchor.day, anchorPart: anchor.part };
  // S5: a deliberate meeting in the window.
  const delib = (meetings || []).filter(m => m.retClass === 'DELIBERATE');
  if (delib.length) {
    return { stage: 'S5', cls: 'DELIBERATE-MEETING', sub: `deliberate meetings=${delib.length} first d${delib[0].day}`, detail };
  }
  // Departures for this mid in the window: match to picks by
  // huntMid + huntDay, part >= pick part, before the next pick.
  const huntPicks = (picks || []).filter(p => p.chosen && p.chosen.kind === 'HUNT' && p.chosen.huntMid === mid);
  const pickIndex = new Map();
  (picks || []).forEach((p, i) => pickIndex.set(p, i));
  const depJoins = [];
  for (const dep of (departures || [])) {
    const o = dep.objective || {};
    if (o.kind !== 'HUNT' || o.huntMid !== mid) continue;
    // Find the pick that chose this objective: same huntDay, part
    // <= dep part, and no later pick with part <= dep part.
    const cands = huntPicks.filter(p => p.chosen.huntDay === o.huntDay && (p.part | 0) <= (dep.part | 0));
    if (!cands.length) { depJoins.push({ dep, pick: null, unmatched: true }); continue; }
    cands.sort((a, b) => (a.part | 0) - (b.part | 0));
    const pk = cands[cands.length - 1];
    const pkIdx = pickIndex.get(pk);
    const nextPick = (picks || [])[pkIdx + 1];
    if (nextPick && (nextPick.part | 0) <= (dep.part | 0)) continue; // superseded before departure
    depJoins.push({ dep, pick: pk, unmatched: false });
  }
  // S4: departed.
  if (depJoins.length) {
    const j = depJoins[0];
    const drop = (drops || []).filter(d => d.mid === mid && d.tx === j.dep.objective.huntTx && d.ty === j.dep.objective.huntTy
      && (d.part | 0) >= (j.dep.part | 0));
    if (drop.length) {
      return { stage: 'S4', cls: 'DEPARTED-EMPTY-TILE', sub: `pick d${j.pick ? j.pick.day : '?'} huntDay=${j.dep.objective.huntDay} dep d${j.dep.day} drop d${drop[0].day} @(${drop[0].tx},${drop[0].ty})`, detail };
    }
    return { stage: 'S4', cls: 'DEPARTED-NO-MEETING', sub: `pick d${j.pick ? j.pick.day : '?'} huntDay=${j.dep.objective.huntDay} dep d${j.dep.day} no drop, no meeting`, detail };
  }
  // S3: HUNT picked, never departed. Sub-cause priority (corrected
  // during sense review, class unchanged): a later pick record
  // PROVES the villager lived past the HUNT pick, so supersession
  // outranks a later death — the old died-first order misread
  // visjoin_113 (HUNT d135, superseded d136, died d145) as
  // died-while-holding. Died-while-holding applies only when no
  // later pick exists.
  if (huntPicks.length) {
    const pk = huntPicks[0];
    const pkIdx = pickIndex.get(pk);
    const nextPick = (picks || [])[pkIdx + 1];
    const diedAfter = (deaths || []).filter(d => d.day >= pk.day);
    let sub;
    if (nextPick) sub = `pick d${pk.day} huntDay=${pk.chosen.huntDay} superseded by ${nextPick.chosen ? nextPick.chosen.kind : '?'} pick d${nextPick.day}${diedAfter.length ? ` (later died d${diedAfter[0].day})` : ''}`;
    else if (diedAfter.length) sub = `pick d${pk.day} huntDay=${pk.chosen.huntDay} died d${diedAfter[0].day}${diedAfter[0].day === pk.day ? ' (SAME-DAY-AMBIGUOUS)' : ''} cause=${diedAfter[0].cause}`;
    else sub = `pick d${pk.day} huntDay=${pk.chosen.huntDay} held to horizon end`;
    return { stage: 'S3', cls: 'PICKED-NEVER-DEPARTED', sub, detail };
  }
  // S2: fresh candidate offered for this mid, never HUNT chosen.
  const offered = (picks || []).filter(p => p.candidate && p.candidate.mid === mid);
  if (offered.length) {
    const kinds = {};
    for (const p of offered) kinds[(p.chosen && p.chosen.kind) || 'null'] = (kinds[(p.chosen && p.chosen.kind) || 'null'] || 0) + 1;
    return { stage: 'S2', cls: 'LOTTERY-LOST', sub: `offered picks=${offered.length} chosen=${JSON.stringify(kinds)} first d${offered[0].day}`, detail };
  }
  // S1/S0: episodes decide.
  const episodes = buildEpisodesFromNotes(notes || [], drops || [], mid);
  detail.episodes = episodes.map(e => ({ openDay: e.openDay, openPart: e.openPart, closeKind: e.closeKind, closeDay: e.closeDay, notes: e.notes }));
  const picksInWindow = picks || [];
  if (!picksInWindow.length) {
    const died = (deaths || []).filter(d => d.day >= anchor.day);
    const left = (leaves || []).filter(d => d.day >= anchor.day);
    if (died.length && (!left.length || died[0].day <= left[0].day)) {
      return { stage: 'S0', cls: 'DIED-BEFORE-PICK', sub: `died d${died[0].day}${died[0].day === anchor.day ? ' (SAME-DAY-AMBIGUOUS)' : ''} cause=${died[0].cause}`, detail };
    }
    if (left.length) {
      return { stage: 'S0', cls: 'LEFT-BEFORE-PICK', sub: `LEAVE departure d${left[0].day}`, detail };
    }
    return { stage: 'S0', cls: 'NO-PICK-RECORDED', sub: 'alive at horizon end, no pick recorded after anchor', detail };
  }
  // Picks exist but no offer/pick/departure: last episode decides.
  const lastEp = episodes.length ? episodes[episodes.length - 1] : null;
  if (lastEp && lastEp.closeKind === 'evicted') {
    // Eviction closed the last episode without a HUNT pick in it
    // (a HUNT pick would have raised the stage). The memory's
    // final fate was eviction.
    return { stage: 'S1', cls: 'MEMORY-OVERWRITTEN', sub: `last episode d${lastEp.openDay}..d${lastEp.closeDay} closed by eviction, ${lastEp.notes} notes`, detail };
  }
  // Picks in the last episode (part within [open, close or end]).
  const epPicks = lastEp ? picksInWindow.filter(p => (p.part | 0) >= (lastEp.openPart | 0) && (lastEp.closePart == null || (p.part | 0) <= (lastEp.closePart | 0))) : [];
  const diagPicks = (epPicks.length ? epPicks : picksInWindow).map(p => ({ pick: p, diag: diagnosePick(p, mid) }));
  const gatePick = diagPicks.find(d => d.diag.fresh && d.diag.reasons.length);
  if (gatePick) {
    return { stage: 'S1', cls: 'GATE-BLOCKED-AT-PICK', sub: `pick d${gatePick.pick.day} reasons=${gatePick.diag.reasons.join('+')} candidate=${gatePick.pick.candidate ? gatePick.pick.candidate.mid : 'null'}`, detail };
  }
  const anyFresh = diagPicks.some(d => d.diag.fresh);
  if (!anyFresh && diagPicks.length) {
    return { stage: 'S1', cls: 'MEMORY-STALE-AT-PICK', sub: `picks=${diagPicks.length} all stale first d${diagPicks[0].pick.day}`, detail };
  }
  if (!diagPicks.length && lastEp) {
    // Last episode had no picks: the villager stopped picking
    // after the last memory formed — death/leave/out-at-end.
    const died = (deaths || []).filter(d => d.day >= lastEp.openDay);
    const left = (leaves || []).filter(d => d.day >= lastEp.openDay);
    if (died.length && (!left.length || died[0].day <= left[0].day)) {
      return { stage: 'S1', cls: 'DIED-BEFORE-PICK', sub: `died d${died[0].day} after last episode opened d${lastEp.openDay} (earlier episodes had picks)`, detail };
    }
    if (left.length) {
      return { stage: 'S1', cls: 'LEFT-BEFORE-PICK', sub: `LEAVE departure d${left[0].day} after last episode opened d${lastEp.openDay}`, detail };
    }
    return { stage: 'S1', cls: 'NO-PICK-RECORDED', sub: `last episode opened d${lastEp.openDay}, no pick in it, alive at horizon end`, detail };
  }
  return { stage: 'S?', cls: 'OTHER', sub: 'no rule applied', detail };
}

function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  const refDir = process.env.REF_EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-returns-a');
  const rows = [];
  const problems = [];
  const joinErrors = [];
  for (const seed of SEEDS16) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-fresh.json`); continue; }
    let r;
    try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { problems.push(`seed ${seed}: unparsable`); continue; }
    rows.push(r);
    if (!(r.days > 0)) problems.push(`seed ${seed}: days<=0`);
    for (const key of ['fieldparty', 'returns', 'funnel']) {
      const st = r[key];
      if (!st) { problems.push(`seed ${seed}: no ${key}`); continue; }
      if (key === 'funnel') {
        if (!Array.isArray(st.picks) || !Array.isArray(st.notes)) problems.push(`seed ${seed}: no funnel picks/notes`);
      } else if (!Array.isArray(st.meetings)) problems.push(`seed ${seed}: no ${key}.meetings`);
      if (st.diag) {
        if (st.diag.errs !== 0) problems.push(`seed ${seed} (${key}): recorder errs=${st.diag.errs} ${JSON.stringify(st.diag.errors || [])}`);
        if (Object.values(st.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed} (${key}): recorder overflow`);
      }
    }
    if (!Array.isArray(r.deathsList)) problems.push(`seed ${seed}: no deathsList`);
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    if (fpMs.length !== rtMs.length) {
      joinErrors.push(`seed ${seed}: meeting count mismatch fieldparty=${fpMs.length} returns=${rtMs.length}`);
    } else {
      for (let i = 0; i < fpMs.length; i++) {
        if (fpMs[i].mid !== rtMs[i].mid || fpMs[i].vid !== rtMs[i].vid || fpMs[i].day !== rtMs[i].day) {
          joinErrors.push(`seed ${seed} idx ${i}: fp(${fpMs[i].vid},${fpMs[i].mid},d${fpMs[i].day}) != rt(${rtMs[i].vid},${rtMs[i].mid},d${rtMs[i].day})`);
          if (joinErrors.length > 20) break;
        }
      }
    }
  }
  const corpusOk = problems.length === 0 && rows.length === 16;
  // Neutrality vs returns-a corpus (per-seed deep equality of the
  // returns channels + wall fields + death totals).
  const neutralityDiffs = [];
  for (const r of rows) {
    const rp = path.join(refDir, `s${r.seed}-fresh.json`);
    if (!fs.existsSync(rp)) { neutralityDiffs.push(`s${r.seed}: reference row missing`); continue; }
    const ref = JSON.parse(fs.readFileSync(rp, 'utf8'));
    const eq = (a, b, label) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) neutralityDiffs.push(`s${r.seed}: ${label} differs`);
    };
    eq((r.fieldparty || {}).meetings, (ref.fieldparty || {}).meetings, 'fieldparty.meetings');
    eq((r.returns || {}).meetings, (ref.returns || {}).meetings, 'returns.meetings');
    eq((r.returns || {}).departures, (ref.returns || {}).departures, 'returns.departures');
    eq((r.returns || {}).drops, (ref.returns || {}).drops, 'returns.drops');
    for (const k of ['won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths', 'days', 'endReason']) {
      if (r[k] !== ref[k]) neutralityDiffs.push(`s${r.seed}: wall field ${k} funnel=${r[k]} returns=${ref[k]}`);
    }
    eq(r.deaths, ref.deaths, 'deaths summary');
  }
  const neutralityPass = neutralityDiffs.length === 0;
  // Joined judged universe + returns classes (verbatim reuse).
  const joined = [];
  for (const r of rows) {
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    for (let i = 0; i < fpMs.length; i++) {
      joined.push({ fp: Object.assign({ seed: r.seed }, fpMs[i]), rt: rtMs[i] || null, seed: r.seed, index: i });
    }
  }
  const judgedA = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const judgedB = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field'
    && ['resolve', 'patrol'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const formedA = judgedA.filter(j => isFormedCrew(j.fp));
  const formedB = judgedB.filter(j => isFormedCrew(j.fp));
  const killsA = judgedA.filter(j => j.fp.outcome === 'vKill');
  const killsB = judgedB.filter(j => j.fp.outcome === 'vKill');
  const controlPass = formedA.length === 0 && formedB.length === 0 && killsA.length === 0 && killsB.length === 0;
  const classified = judgedA.map(j => {
    const c = classifyMeeting(j);
    j.retClass = c.cls; j.retFlags = c.flags; j.retHuntTile = c.huntTile; j.retPre = c.preSightings;
    return j;
  });
  const classCounts = {};
  for (const j of classified) classCounts[j.retClass] = (classCounts[j.retClass] || 0) + 1;
  const chainInput = judgedA.map(j => {
    const m = Object.assign({}, j.fp, { seed: j.seed });
    m._retClass = j.retClass; m._retFlags = j.retFlags; m._retHuntTile = j.retHuntTile;
    return m;
  });
  const built = buildChains(chainInput);
  const chainClasses = {};
  for (const c of built.chains) chainClasses[c.cls] = (chainClasses[c.cls] || 0) + 1;
  // HUNT census (returns channels, wave map like returns-a).
  const waveMap = loadWaveMap();
  const allDepartures = [];
  const allDrops = [];
  for (const r of rows) {
    for (const d of (((r.returns || {}).departures) || [])) allDepartures.push(Object.assign({ seed: r.seed }, d));
    for (const d of (((r.returns || {}).drops) || [])) allDrops.push(Object.assign({ seed: r.seed }, d));
  }
  const huntDepartures = allDepartures.filter(d => d.objective && d.objective.kind === 'HUNT');
  const huntDeparturesW4 = huntDepartures.filter(d => waveMap[d.objective.huntMid] === 4);
  const huntDrops = allDrops.filter(d => d.dropped);
  const huntDropsW4 = huntDrops.filter(d => waveMap[d.mid] === 4);
  // Wall.
  const wall = {
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const perSeedA = {};
  for (const j of judgedA) perSeedA[j.seed] = (perSeedA[j.seed] || 0) + 1;
  // Triples + taxonomy.
  const tripleMap = new Map();
  for (const j of classified) {
    if (j.fp.outcome !== 'vFlee') continue;
    const key = `${j.seed}|${j.fp.vid}|${j.fp.mid}`;
    if (!tripleMap.has(key)) tripleMap.set(key, []);
    tripleMap.get(key).push(j);
  }
  const triples = [];
  for (const [key, meetings] of tripleMap) {
    meetings.sort((a, b) => ((a.fp.day - b.fp.day) || ((a.fp.part | 0) - (b.fp.part | 0))));
    const anchorJ = meetings[0];
    const seed = anchorJ.seed;
    const vid = anchorJ.fp.vid;
    const mid = anchorJ.fp.mid;
    const row = rows.find(r => r.seed === seed);
    const rtMeetings = ((row.returns || {}).meetings || []);
    const fpMeetings = ((row.fieldparty || {}).meetings || []);
    // Anchor's returns record: same fight-order index as anchorJ.
    const anchorRt = anchorJ.rt;
    const anchorPart = anchorRt ? (anchorRt.part | 0) : (anchorJ.fp.part | 0);
    const vidPicks = (((row.funnel || {}).picks || []).filter(p => p.vid === vid));
    const vidNotes = (((row.funnel || {}).notes || []).filter(n => n.vid === vid));
    const vidDeps = (((row.returns || {}).departures || []).filter(d => d.vid === vid));
    const vidDrops = (((row.returns || {}).drops || []).filter(d => d.dropped && d.vid === vid));
    const vidDeaths = ((row.deathsList || []).filter(d => d.who === vid));
    const vidLeaves = vidDeps.filter(d => d.objective && d.objective.kind === 'LEAVE');
    const postPicks = vidPicks.filter(p => isPostAnchorPick(p, anchorPart, anchorRt, mid));
    // Window notes: part >= anchorPart (the anchor's own note is
    // at anchorPart; earlier notes are pre-anchor history).
    const windowNotes = vidNotes.filter(n => (n.part | 0) >= (anchorPart | 0));
    const windowDrops = vidDrops.filter(d => (d.part | 0) >= (anchorPart | 0));
    const windowDeps = vidDeps.filter(d => (d.part | 0) >= (anchorPart | 0));
    // Later judgedA meetings for this vid+mid (excluding anchor).
    const laterMeetings = classified.filter(j => j.seed === seed && j.fp.vid === vid && j.fp.mid === mid
      && !(j.fp.day === anchorJ.fp.day && (j.fp.part | 0) === (anchorJ.fp.part | 0)))
      .map(j => ({ day: j.fp.day, part: j.fp.part, vid: j.fp.vid, mid: j.fp.mid, outcome: j.fp.outcome, retClass: j.retClass }));
    const trace = {
      seed, vid, mid,
      anchor: { day: anchorJ.fp.day, part: anchorPart, rt: anchorRt, fp: anchorJ.fp },
      picks: postPicks, departures: windowDeps, drops: windowDrops, notes: windowNotes,
      meetings: laterMeetings, deaths: vidDeaths, leaves: vidLeaves,
    };
    const cls = classifyTriple(trace);
    triples.push({
      seed, vid, mid,
      anchorDay: anchorJ.fp.day, anchorOutcome: anchorJ.fp.outcome,
      survivingMeetings: meetings.length,
      stage: cls.stage, cls: cls.cls, sub: cls.sub, detail: cls.detail,
      counts: {
        picks: postPicks.length,
        huntPicks: postPicks.filter(p => p.chosen && p.chosen.kind === 'HUNT' && p.chosen.huntMid === mid).length,
        offeredPicks: postPicks.filter(p => p.candidate && p.candidate.mid === mid).length,
        huntDepartures: windowDeps.filter(d => d.objective && d.objective.kind === 'HUNT' && d.objective.huntMid === mid).length,
        dropsW4mid: windowDrops.filter(d => d.mid === mid).length,
        notes: windowNotes.length,
        laterMeetings: laterMeetings.length,
      },
    });
  }
  triples.sort((a, b) => (a.seed - b.seed) || (a.vid < b.vid ? -1 : 1) || (a.mid < b.mid ? -1 : 1));
  const tripleClassCounts = {};
  for (const t of triples) tripleClassCounts[t.cls] = (tripleClassCounts[t.cls] || 0) + 1;
  const lossesAssigned = triples.filter(t => t.cls !== 'OTHER' && t.cls !== 'DELIBERATE-MEETING').length;
  const otherCount = triples.filter(t => t.cls === 'OTHER').length;
  const goLeg1 = triples.length === 19;
  const goLeg2 = lossesAssigned >= 18;
  console.log('=== sim-funnel-a analyzer ===');
  console.log(`corpus: rows=${rows.length}/16 ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`JOIN: errors=${joinErrors.length} ${joinErrors.slice(0, 5).join('; ')}`);
  console.log(`NEUTRALITY vs returns-a: ${neutralityPass ? 'PASS (returns channels + wall + deaths identical)' : 'FAIL'} ${neutralityDiffs.slice(0, 10).join('; ')}`);
  console.log(`CONTROL-SHAPE: judgedA=${judgedA.length} formedA=${formedA.length} killsA=${killsA.length} | judgedB=${judgedB.length} formedB=${formedB.length} killsB=${killsB.length} => ${controlPass ? 'PASS' : 'FAIL'}`);
  console.log(`RETURNS-CLASSES: ${JSON.stringify(classCounts)} (expect ACCIDENTAL 39, MEMORY-ONLY 3, DELIBERATE 0)`);
  console.log(`CHAINS: ${built.chains.length} classes=${JSON.stringify(chainClasses)} (expect 13 STILL-ALIVE)`);
  console.log(`HUNT: departures=${huntDepartures.length} (W4 ${huntDeparturesW4.length}) true drops=${huntDrops.length} (W4 ${huntDropsW4.length}) (expect 326/1, 297/1)`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  console.log(`TRIPLES: ${triples.length} (expect 19) classes=${JSON.stringify(tripleClassCounts)} lossesAssigned=${lossesAssigned} OTHER=${otherCount}`);
  console.log(`GO: leg1 triples==19 ${goLeg1 ? 'PASS' : 'FAIL'} | leg2 lossesAssigned>=18 ${goLeg2 ? 'PASS' : 'FAIL'} | leg3 determinism checked separately (seed 75106 re-run diff)`);
  console.log('PER-TRIPLE:');
  for (const t of triples) {
    console.log(`  [s${t.seed} ${t.vid} ${t.mid} anchor d${t.anchorDay} survMeetings=${t.survivingMeetings}] stage=${t.stage} cls=${t.cls} :: ${t.sub} | counts=${JSON.stringify(t.counts)}`);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({ corpusOk, controlPass, joinErrors,
      neutralityPass, neutralityDiffs, judgedA: judgedA.length, formedA: formedA.length, killsA: killsA.length,
      judgedB: judgedB.length, formedB: formedB.length, killsB: killsB.length,
      perSeedA, wall, deathsByCause, classCounts, chainClasses,
      chains: built.chains,
      hunt: { departures: huntDepartures.length, departuresW4: huntDeparturesW4.length, drops: huntDrops.length, dropsW4: huntDropsW4.length },
      triples, tripleClassCounts, lossesAssigned, otherCount, goLeg1, goLeg2,
    }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (!corpusOk) { console.log('CENSUS: FAIL (corpus invalid)'); process.exit(1); }
  if (joinErrors.length > 0) { console.log('JOIN: FAIL'); process.exit(1); }
  if (!controlPass) { console.log('CONTROL-SHAPE: FAIL — do not judge taxonomy'); process.exit(1); }
  if (!neutralityPass) { console.log('NEUTRALITY: FAIL — do not judge taxonomy against a perturbed corpus'); process.exit(1); }
  if (!goLeg1) { console.log('TRIPLES: FAIL (expected 19)'); process.exit(1); }
  if (!goLeg2) { console.log('TAXONOMY: FAIL (losses assigned < 18)'); process.exit(1); }
  console.log('MACHINE LEGS: census PASS, join PASS, control-shape PASS, neutrality PASS, triples PASS, taxonomy PASS (determinism + sense live in evidence)');
}

if (require.main === module) main();
module.exports = { classifyTriple, buildEpisodesFromNotes, buildEpisodes, diagnosePick, isPostAnchorPick, sightingHasStamp, cheb };
