'use strict';
// hurthome-b-lib.js — pure event-case logic for sim-hurthome-fix-b
// (EVENT-based re-judgement of the hurt-aware turn-home rule).
// No RNG reads, no game-value writes: inputs are only read, never
// mutated. Shared by scripts/sweep-hurthome-fix-b.js (live sims) and
// scripts/test-hurthome-b.js (proof), so the proof exercises the
// same case logic the verdict judges by.
//
// CASE (the unit): one hurt episode of one ledger-away villager.
// Opens when a ledger-away villager is observed alive-and-hurt
// (hp 1..7). Closes as exactly one outcome (see close* fns).
// Latency (parts) = (closeDay - eventDay) * 4 + (closePart - eventPart).
const HURT_MAX = 7;

function tripKey(aw) {
  if (!aw) return null;
  return String(aw.sinceDay ?? '?') + '|' + String(aw.sincePart ?? '?') + '|' + String(aw.purpose || '?');
}

function isHurtHp(hp) {
  return typeof hp === 'number' && hp >= 1 && hp <= HURT_MAX;
}

function latencyParts(c) {
  if (c == null || c.eventDay == null || c.closeDay == null) return null;
  return (c.closeDay - c.eventDay) * 4 + ((c.closePart ?? 0) - (c.eventPart ?? 0));
}

// Open a case, or count a repeat hurt on the open case. `open` is a
// Map vid -> case (owned by the caller). Returns { action, case }:
// 'opened' | 'counted' (already open, same trip) | 'none' (not a case:
// no away record, not hurt hp, or lethal — deaths close, never open).
function hurtStep(open, vid, day, part, aw, hp, extra) {
  const e = extra || {};
  if (!aw) return { action: 'none', case: null };
  if (!isHurtHp(hp)) return { action: 'none', case: null };
  const key = tripKey(aw);
  let c = open.get(vid) || null;
  if (c && c.tripKey !== key) {
    c.outcome = 'censored-tripKeyChanged';
    c.censorNote = 'tripKeyChanged';
    c.closeDay = day; c.closePart = part;
    open.delete(vid);
    c = null;
  }
  if (!c) {
    c = {
      vid: String(vid), eventDay: day, eventPart: part, tripKey: key,
      purpose: aw.purpose || null, sinceDay: aw.sinceDay ?? null,
      sincePart: aw.sincePart ?? null, awayDuration: aw.duration ?? null,
      hpAtEvent: hp, lastHp: hp, hurtCount: 1,
      source: e.source || 'hurtVillager', cause: e.cause || null,
      dmg: (e.dmg != null ? e.dmg : null),
      outcome: 'open', closeDay: null, closePart: null,
      returnPreHp: null, deathCause: null, censorNote: null,
    };
    open.set(vid, c);
    return { action: 'opened', case: c };
  }
  c.hurtCount += 1;
  c.lastHp = hp;
  return { action: 'counted', case: c };
}

function closeReturned(open, vid, day, part, preHp, censorNote) {
  const c = open.get(vid) || null;
  if (!c) return null;
  c.closeDay = day; c.closePart = part;
  c.returnPreHp = (preHp != null ? preHp : null);
  if (censorNote) c.censorNote = censorNote;
  if (preHp == null) c.outcome = 'returned-unknown';
  else if (isHurtHp(preHp)) c.outcome = 'returned-hurt';
  else c.outcome = 'returned-healed';
  open.delete(vid);
  return c;
}

function closeDied(open, vid, day, part, cause, censorNote) {
  const c = open.get(vid) || null;
  if (!c) return null;
  c.outcome = 'died';
  c.closeDay = day; c.closePart = part;
  c.deathCause = cause || null;
  if (censorNote) c.censorNote = censorNote;
  open.delete(vid);
  return c;
}

function closeHealed(open, vid, day, part, hp) {
  const c = open.get(vid) || null;
  if (!c) return null;
  c.outcome = 'healed-away';
  c.closeDay = day; c.closePart = part;
  c.lastHp = hp;
  open.delete(vid);
  return c;
}

// Retrospective case (sim-hurthome-fix-c coverage fix, ordered by
// fix-b's metric review): when a hurt-return line fires for a villager
// with NO open case, the line itself is the event record. Open a case
// whose event IS the return tick, so the travel scan closes it
// returned-hurt at latency 0 in the same tick. Refuses when a case is
// already open (the normal path owns it), when purpose is 'leave'
// (walk-outs never fire this line), or when hp is not hurt hp.
// Returns { action, case }: 'opened' | 'none'.
function retroCase(open, vid, day, part, purpose, hp, name) {
  if (!vid || purpose === 'leave') return { action: 'none', case: null };
  if (!isHurtHp(hp)) return { action: 'none', case: null };
  if (open.has(vid)) return { action: 'none', case: null };
  const c = {
    vid: String(vid), eventDay: day, eventPart: part, tripKey: 'retro|' + String(purpose || '?'),
    purpose: purpose || null, sinceDay: null, sincePart: null, awayDuration: null,
    hpAtEvent: hp, lastHp: hp, hurtCount: 1,
    source: 'retro-line', cause: 'retro-line', dmg: null,
    outcome: 'open', closeDay: null, closePart: null,
    returnPreHp: null, deathCause: null, censorNote: 'retroLineCase',
    name: name || null,
  };
  open.set(vid, c);
  return { action: 'opened', case: c };
}

function closeCensored(open, day, part) {
  const out = [];
  for (const [vid, c] of open.entries()) {
    c.outcome = 'censored';
    c.closeDay = day; c.closePart = part;
    out.push(c);
  }
  open.clear();
  return out;
}

// Median of a numeric array (null if empty). Pooled case-level
// median: every case counts once, never a median of per-seed medians.
function median(nums) {
  const xs = (nums || []).filter((n) => typeof n === 'number').sort((a, b) => a - b);
  if (!xs.length) return null;
  const m = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
}

module.exports = { HURT_MAX, tripKey, isHurtHp, latencyParts, hurtStep, retroCase,
  closeReturned, closeDied, closeHealed, closeCensored, median };
