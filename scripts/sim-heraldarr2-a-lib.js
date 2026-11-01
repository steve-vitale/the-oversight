// sim-heraldarr2-a-lib.js — pure helpers for the Herald arrival attribution
// (DIAG ONLY). No game state, no RNG, no I/O.
// Derived from sim-heraldarr-a-lib.js (v2, UNCHANGED helpers below) +
// classifyRaidCall / classifyLingerPin (NEW in this arm).
'use strict';

function key(t) {
  if (!t || typeof t.x !== 'number' || typeof t.y !== 'number') return null;
  return t.x + ',' + t.y;
}
function sameTile(a, b) {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}
function manhattan(a, b) {
  if (!a || !b) return null;
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function chebyshev(a, b) {
  if (!a || !b) return null;
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// Predict the travelTo follow branch from before-state + destination.
// Inputs: scholarMoved (bool), hadOldMonster (bool), follows (raw def
// value — truthiness is the engine's test, so a non-empty string counts),
// destOccupied (bool), destSafe (bool). hadHerald states whether the
// monster on the from-tile was the herald (for labeling only; the branch
// logic itself is monster-agnostic).
function predictTravelBranch(o) {
  if (!o.scholarMoved) return 'noTravel';
  if (!o.hadOldMonster) return 'noOldMonster';
  if (!o.follows) return 'oldMonsterNotFollows';
  if (o.destOccupied) return 'followBlockedOccupied';
  if (o.destSafe) return 'followHoldSafe';
  return 'followEnter';
}

// Expected herald tile after a travelTo call, given the predicted branch.
// Returns 'dest' | 'stay' | 'n/a' (no herald on the from-tile to track).
function expectedAfter(branch, hadHerald) {
  if (!hadHerald) return 'n/a';
  if (branch === 'followEnter') return 'dest';
  return 'stay';
}

// Check an actual after-tile against a predicted branch.
// Returns null when consistent, else a mismatch string.
function travelMismatch(branch, beforeTile, afterTile, destTile) {
  if (!beforeTile) {
    // No herald tracked before: consistent iff none appears, or the
    // appearance is flagged separately by the caller (spawnDuringTravel).
    return afterTile ? 'appearedDuringTravel' : null;
  }
  if (!afterTile) return 'removedDuringTravel';
  if (branch === 'followEnter') {
    return sameTile(afterTile, destTile) ? null : 'followEnterDidNotLand';
  }
  return sameTile(afterTile, beforeTile) ? null : 'movedDespiteHold';
}

// Attribute one inter-dawn window from its move-event chain.
// events: [{from, to, cls}] in order. startTile/endTile: dawn tiles
// (null = herald absent that dawn).
// Returns {attributed, landingCls, reason}.
function attributeWindow(startTile, endTile, events) {
  const startK = key(startTile), endK = key(endTile);
  if (startK === endK && events.length === 0) {
    return { attributed: true, landingCls: null, reason: 'no-change-no-events' };
  }
  if (events.length === 0) {
    return { attributed: false, landingCls: null, reason: 'tile-changed-no-events' };
  }
  // Chain continuity: first from == start, each next from == prev to,
  // last to == end. A null start (absent) can only chain from a spawn.
  let cur = startK;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const fromK = key(ev.from), toK = key(ev.to);
    if (fromK !== cur) {
      return { attributed: false, landingCls: null, reason: 'chain-gap-at-event-' + i };
    }
    cur = toK;
    if (cur === null && i < events.length - 1) {
      return { attributed: false, landingCls: null, reason: 'chain-through-absence-at-event-' + i };
    }
  }
  if (cur !== endK) {
    return { attributed: false, landingCls: null, reason: 'chain-end-mismatch' };
  }
  // Landing class: the event whose `to` is the end tile, last such event.
  let landingCls = null;
  for (let i = events.length - 1; i >= 0; i--) {
    if (key(events[i].to) === endK) { landingCls = events[i].cls; break; }
  }
  return { attributed: true, landingCls: landingCls, reason: 'chain-continuous' };
}

// Classify one havenRaidTick call from its pre/post snapshots.
// pre: { over, tableActive, day, lastRaidDay, cooldown, livingCount,
//   pantry, sortedIds (pre-call nearest order), raidN, heraldRank
//   (null when the Herald is not a living world monster at entry),
//   heraldPresent (bool), raidLineBefore (say-line count) }
// post: { lastRaidDay, raidLineAfter }
// readErr: true when any gate input failed to read (forces 'unknown'
//   unless the raid demonstrably fired — a fired raid's drafted set
//   is still computable from the pre-call sorted list).
// Returns { cls, heraldStatus, draftedIds } where cls is one of
// blocked-over | blocked-table | blocked-cooldown | blocked-few |
// blocked-pantry | roll-miss | draft | unknown, and heraldStatus is
// drafted | rank-missed | gate-or-roll | absent | unknown.
// Drafted set = first raidN of the pre-call sorted list (the code
// slices exactly that list when the raid fires).
function classifyRaidCall(pre, post, readErr) {
  const fired = (post.lastRaidDay !== null && post.lastRaidDay !== undefined &&
    pre.lastRaidDay !== null && pre.lastRaidDay !== undefined &&
    post.lastRaidDay !== pre.lastRaidDay);
  let cls = null;
  if (pre.over) cls = 'blocked-over';
  else if (pre.tableActive) cls = 'blocked-table';
  else if (pre.day !== null && pre.lastRaidDay !== null && pre.cooldown !== null &&
    (pre.day - pre.lastRaidDay) < pre.cooldown) cls = 'blocked-cooldown';
  else if (pre.livingCount !== null && pre.livingCount < 3) cls = 'blocked-few';
  else if (pre.pantry !== null && pre.pantry < 3000) cls = 'blocked-pantry';
  else if (fired) cls = 'draft';
  else if (!readErr && pre.livingCount !== null && pre.pantry !== null &&
    pre.day !== null && pre.lastRaidDay !== null && pre.cooldown !== null) cls = 'roll-miss';
  else cls = 'unknown';
  let draftedIds = [];
  if (cls === 'draft') {
    const n = (pre.raidN === null || pre.raidN === undefined) ? 0 : pre.raidN;
    draftedIds = (pre.sortedIds || []).slice(0, n);
  }
  let heraldStatus = null;
  if (!pre.heraldPresent) heraldStatus = 'absent';
  else if (cls === 'draft') {
    heraldStatus = draftedIds.indexOf('herald') !== -1 ? 'drafted' : 'rank-missed';
  } else if (cls === 'unknown') heraldStatus = 'unknown';
  else heraldStatus = 'gate-or-roll';
  return { cls: cls, heraldStatus: heraldStatus, draftedIds: draftedIds };
}

// Classify one havenGrowthDaily lingering re-pin application for the
// Herald. pre: { lingering, tile, havenTile, lingerSince, day,
//   tableActive }. post: { lingering, tile }.
// Returns { cls, gorgeSkipped } where cls is repin-moved |
// repin-held | repin-drift-cleared | not-lingering.
function classifyLingerPin(pre, post) {
  if (!pre.lingering) return { cls: 'not-lingering', gorgeSkipped: !!pre.tableActive };
  const postTile = post.tile, havenTile = pre.havenTile;
  if (post.lingering === false && pre.lingering === true) {
    return { cls: 'repin-drift-cleared', gorgeSkipped: !!pre.tableActive };
  }
  if (postTile && havenTile && sameTile(postTile, havenTile)) {
    if (pre.tile && sameTile(pre.tile, havenTile)) return { cls: 'repin-held', gorgeSkipped: !!pre.tableActive };
    return { cls: 'repin-moved', gorgeSkipped: !!pre.tableActive };
  }
  // The code pins every lingering monster to the haven tile; a
  // lingering post tile off-haven is unexpected, never smoothed.
  return { cls: 'repin-unexpected', gorgeSkipped: !!pre.tableActive };
}

module.exports = { key, sameTile, manhattan, chebyshev, predictTravelBranch, expectedAfter, travelMismatch, attributeWindow, classifyRaidCall, classifyLingerPin };
