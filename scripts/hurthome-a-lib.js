'use strict';
// hurthome-a-lib.js — pure episode logic for sim-hurthome-a (DIAG ONLY).
// Shared by scripts/sweep-hurthome-a.js (live sims) and
// scripts/test-hurthome-a.js (proof), so the proof exercises the same
// classification code the census judges by. No RNG reads, no game-value
// writes: inputs (away/health records) are only read, never mutated.
//
// Episode unit (prereg, pinned): one away-trip spell containing at
// least one hurt dawn. Hurt = v.health[vid] <= 7 and >= 1 at a dawn
// sample (endDay post-call, dayPart === 0). Away = v.away[vid]
// present (ledger test, regardless of node distance).
const HURT_MAX = 7;

function tripKey(aw) {
  if (!aw) return null;
  return String(aw.sinceDay ?? '?') + '|' + String(aw.sincePart ?? '?') + '|' + String(aw.purpose || '?');
}

function isHurtHp(hp) {
  return typeof hp === 'number' && hp >= 1 && hp <= HURT_MAX;
}

// Classification, mutually exclusive, death first (expedDeath deletes
// the away record in the same call as registerDeath, so a part that
// both kills and deletes must read as died-away, never returned).
// Returns one of: 'died-away' | 'turn-home-same-day' |
// 'turn-home-next-day' | 'stayed-out-3plus' | 'censored-early'.
// Every episode object must land in exactly one bucket; there is no
// unclassified outcome by construction.
function classifyEpisode(ep) {
  if (!ep || typeof ep !== 'object') return 'censored-early';
  if (ep.outcome === 'died') return 'died-away';
  if (ep.outcome === 'returned') {
    const d = (ep.returnDay ?? 0) - (ep.episodeDay ?? 0);
    if (d <= 0) return 'turn-home-same-day';
    if (d === 1) return 'turn-home-next-day';
    return 'stayed-out-3plus';
  }
  // Still open at run end (outcome 'censored' or unset).
  // Stayed-out >= 3 days is already observed once the villager was
  // away at dawns episodeDay, episodeDay+1, episodeDay+2, i.e.
  // dawnsObserved >= 3 with the episode still open.
  if ((ep.dawnsObserved || 0) >= 3) return 'stayed-out-3plus';
  return 'censored-early';
}

// Dawn sample step for one villager. `open` is a Map vid -> episode
// (owned by the caller; episodes are plain data, never game state).
// Returns { action: 'opened' | 'extended' | 'none', episode }.
// - opened: first hurt dawn of this trip.
// - extended: episode already open for this trip; dawn counters move.
// - none: not away, not hurt, or no episode open and not hurt.
// A trip-key change under an open episode (not expected: departures
// require no away record) closes the old episode as censored with a
// note and opens the new one only if hurt; the old episode still
// classifies (censored-early or stayed-out-3plus by its dawns).
function dawnStep(open, vid, day, aw, hp, extra) {
  const e = extra || {};
  if (!aw) return { action: 'none', episode: null };
  const key = tripKey(aw);
  let ep = open.get(vid) || null;
  if (ep && ep.tripKey !== key) {
    ep.outcome = 'censored';
    ep.censorNote = 'tripKeyChanged';
    ep.closedDay = day;
    open.delete(vid);
    ep = null;
  }
  if (!ep) {
    if (!isHurtHp(hp)) return { action: 'none', episode: null };
    ep = {
      vid: String(vid), episodeDay: day, tripKey: key,
      purpose: aw.purpose || null, sinceDay: aw.sinceDay ?? null,
      sincePart: aw.sincePart ?? null, awayDuration: aw.duration ?? null,
      hpAtOpen: hp, dawnsObserved: 1, hurtDawns: 1, healedDawns: 0,
      lastHurt: e.lastHurt || null, hurtTiming: e.hurtTiming || null,
      expedDuration: (e.expedDuration != null ? e.expedDuration : null),
      outcome: 'open', returnDay: null, returnPart: null,
      deathDay: null, deathCause: null, censorNote: null, closedDay: null,
    };
    open.set(vid, ep);
    return { action: 'opened', episode: ep };
  }
  ep.dawnsObserved += 1;
  if (isHurtHp(hp)) ep.hurtDawns += 1;
  else ep.healedDawns += 1;
  ep.hpLast = hp;
  return { action: 'extended', episode: ep };
}

function closeReturned(open, vid, day, part) {
  const ep = open.get(vid) || null;
  if (!ep) return null;
  ep.outcome = 'returned';
  ep.returnDay = day;
  ep.returnPart = (part != null ? part : null);
  ep.closedDay = day;
  open.delete(vid);
  return ep;
}

function closeDied(open, vid, day, part, cause) {
  const ep = open.get(vid) || null;
  if (!ep) return null;
  ep.outcome = 'died';
  ep.deathDay = day;
  ep.deathPart = (part != null ? part : null);
  ep.deathCause = cause || null;
  ep.closedDay = day;
  open.delete(vid);
  return ep;
}

// Close every still-open episode at run end. Censored episodes keep
// their dawn counts, so classifyEpisode can still read stayed-out
// >= 3 days off them.
function closeCensored(open, day) {
  const out = [];
  for (const [vid, ep] of open.entries()) {
    ep.outcome = 'censored';
    ep.closedDay = day;
    out.push(ep);
  }
  open.clear();
  return out;
}

module.exports = { HURT_MAX, tripKey, isHurtHp, classifyEpisode, dawnStep, closeReturned, closeDied, closeCensored };
