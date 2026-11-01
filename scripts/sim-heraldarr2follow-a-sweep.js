#!/usr/bin/env node
// sim-heraldarr2follow-a-sweep.js — HERALD ARRIVAL PATH, RAID-PIN RIVAL census (DIAG ONLY).
// Wrapped proof of the follow re-entry candidate + raid-pin rival.
//
// Substrate (named exactly, see the prereg): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + fullseat-diag +
// wavegate-diag, all REUSED UNMODIFIED. No muster-diag, no vet
// recorders (arrival attribution does not need them).
//
// New capture (this arm) wraps ONLY, all pure observation (call
// through with identical arguments and return values, never mutate
// game state, never draw RNG, never throw into the engine):
//   travelTo (follow branch classification, before/after herald tile,
//     say-sequence window), wanderWorldMonsters (before/after steps),
//   spawnWorldMonster (herald lair events), removeWorldMonster
//   (herald departures), havenRaidTick (draft-selection census),
//   havenGrowthDaily (linger re-pin census),
//   resolveWildMonsterEncounter (villager contacts + mFlee moves),
//   titanDawnTick (dawn position snapshots), worldTick (counter),
//   startCombat (scholar herald contacts),
//   Game.say (needles incl. follow/treeline/boundary/raid lines).
//
// STDOUT-RUNNER: the game-loaded process prints EXACTLY ONE JSON
// line per seed to stdout (progress to stderr). Invoke per seed
// and redirect stdout to the per-seed evidence file:
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 \
//     SIMHERALDARR2FOLLOW=1 SEEDS=95304 node scripts/sim-heraldarr2follow-a-sweep.js \
//     > evidence/2026-11-01/sim-heraldarr2follow-a/s95304.json 2> s95304.err
//
// Legs: ON = SIMHERALDARR2FOLLOW=1 (this capture). OFF = SIMHERALDARR2FOLLOW
// unset (same substrate, no capture; the screen runs' and the
// neutrality leg's OFF side).
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HAL = require(path.join(REPO, 'scripts', 'sim-heraldarr2follow-a-lib'));

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
const CAP_ON = process.env.SIMHERALDARR2FOLLOW === '1';

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const wg = WG.withWavegateDiag(tableseatNowait, 'wavegate-diag', 'tableseat-nowait + wave-gate recorder');
  return FD.withFullseatDiag(wg, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
}

function installHeraldArrCapture(Game, store) {
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const scholarTile = () => { try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return null; } };
  const havenTile = () => { try { const v = Game.state.village || {}; return { x: (v.px == null ? 4 : v.px), y: (v.py == null ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; } };
  const heraldMon = () => { try { return (Game.worldMonsters() || []).find(m => m && m.id === 'herald') || null; } catch (e) { return null; } };
  const heraldTile = () => { const m = heraldMon(); return m ? { x: m.tx, y: m.ty } : null; };
  const heraldFlags = () => { const m = heraldMon(); return m ? { lingering: !!m.lingering, raidBorn: !!m.raidBorn, titan: !!m.titan, lingerSince: (m.lingerSince != null ? m.lingerSince : null) } : null; };
  const omenStage = () => { try { const o = ((Game.state || {}).titans || {}).omens || {}; return o.herald ? (o.herald.stage != null ? o.herald.stage : null) : null; } catch (e) { return null; } };
  const tileType = (t) => { try { const tl = Game.tileAt(t.x, t.y); return tl ? (tl.type || null) : null; } catch (e) { return null; } };
  const safeAt = (t) => { try { return Game.isSafeTile(t.x, t.y); } catch (e) { return null; } };
  const monsterAtTile = (t) => { try { return Game.monsterAt(t.x, t.y); } catch (e) { return null; } };
  const followsOf = (mon) => {
    try {
      if (!mon) return null;
      const def = (Game.data.monsters || []).find(m => m.id === mon.id) || null;
      return def ? (def.hasOwnProperty('follows') ? def.follows : null) : null;
    } catch (e) { return null; }
  };
  const npcsOn = (t) => { try { return t ? (Game.npcsOnNode(t.x, t.y) || []) : []; } catch (e) { return []; } };

  const origs = {};
  const wrap = (method, fn) => {
    const orig = Game[method];
    if (typeof orig !== 'function') { store.captureErrs++; if (store.errors.length < 20) store.errors.push('missing:' + method); return; }
    origs[method] = orig;
    Game[method] = fn(orig);
  };
  const noteErr = (where, e) => { store.captureErrs++; if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); };
  const pushMove = (cls, from, to, extra) => {
    const rec = { kind: cls, day: dayOf(), from: from, to: to, scholarTile: scholarTile() };
    if (extra) Object.assign(rec, extra);
    store.moves.push(rec);
  };

  wrap('titanDawnTick', (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      const ht = heraldTile(), st = scholarTile(), hv = havenTile(), fl = heraldFlags();
      store.dawns.push({
        day: dayOf(), omenStage: omenStage(), heraldTile: ht, scholarTile: st, havenTile: hv,
        havenTileType: tileType(hv), havenSafe: safeAt(hv),
        distHavenMan: HAL.manhattan(ht, hv), distHavenCheb: HAL.chebyshev(ht, hv),
        npcOnHeraldTile: ht ? npcsOn(ht).length : 0,
        lingering: fl ? fl.lingering : null, raidBorn: fl ? fl.raidBorn : null,
        worldTicks: store.worldTickCount,
      });
    } catch (e) { noteErr('dawn', e); }
    return r;
  });

  wrap('worldTick', (orig) => function () {
    store.worldTickCount++;
    return orig.apply(this, arguments);
  });

  wrap('spawnWorldMonster', (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      if (r && r.id === 'herald') {
        const t = { x: r.tx, y: r.ty }, st = scholarTile(), hv = havenTile();
        const opts = arguments.length > 3 ? arguments[3] : null;
        store.lairs.push({
          day: dayOf(), tx: t.x, ty: t.y, tileType: tileType(t),
          scholarTile: st, havenTile: hv,
          distHavenMan: HAL.manhattan(t, hv), distHavenCheb: HAL.chebyshev(t, hv),
          distScholarMan: HAL.manhattan(t, st), distScholarCheb: HAL.chebyshev(t, st),
          titanOpt: !!(opts && opts.titan),
        });
        pushMove('spawn', null, t, { titanOpt: !!(opts && opts.titan) });
      }
    } catch (e) { noteErr('spawn', e); }
    return r;
  });

  wrap('removeWorldMonster', (orig) => function () {
    try {
      const m = arguments.length ? arguments[0] : null;
      if (m && m.id === 'herald') {
        store.removals.push({ day: dayOf(), tx: m.tx, ty: m.ty });
        pushMove('remove', { x: m.tx, y: m.ty }, null, {});
      }
    } catch (e) { noteErr('remove', e); }
    return orig.apply(this, arguments);
  });

  wrap('wanderWorldMonsters', (orig) => function () {
    let before = null;
    try { before = heraldTile(); } catch (e) { before = null; }
    const r = orig.apply(this, arguments);
    try {
      const after = heraldTile();
      store.wanderCalls++;
      if (before && after && !HAL.sameTile(before, after)) {
        pushMove('wander', before, after, {});
      } else if ((before && !after) || (!before && after)) {
        pushMove('wanderEdge', before, after, {});
      }
    } catch (e) { noteErr('wander', e); }
    return r;
  });

  wrap('travelTo', (orig) => function () {
    const dest = (arguments.length >= 2) ? { x: arguments[0], y: arguments[1] } : null;
    let fromTile = null, heraldBefore = null, oldMonster = null, followsVal = null;
    let destOccupied = null, destSafe = null, seqBefore = 0;
    try {
      fromTile = scholarTile();
      heraldBefore = heraldTile();
      oldMonster = fromTile ? monsterAtTile(fromTile) : null;
      followsVal = followsOf(oldMonster);
      destOccupied = dest ? !!monsterAtTile(dest) : null;
      destSafe = dest ? safeAt(dest) : null;
      seqBefore = store.saySeq;
    } catch (e) { noteErr('travelBefore', e); }
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const scholarAfter = scholarTile();
      const heraldAfter = heraldTile();
      const scholarMoved = !!(fromTile && scholarAfter && !HAL.sameTile(fromTile, scholarAfter));
      const hadOldMonster = !!oldMonster;
      // Tracked = the herald itself sat on the from-tile, i.e. the herald
      // IS the old monster the follow branch governs. Only tracked calls
      // can contradict a branch prediction. A herald that moves during a
      // travelTo where it was NOT the old monster moved via a nested
      // call (worldTick -> wander, recorded by the wander wrapper) — that
      // is a nestedMove observation, never a branch mismatch, and it must
      // NOT push a second move event (v1 double-counted exactly this).
      const tracked = !!(heraldBefore && fromTile && HAL.sameTile(heraldBefore, fromTile));
      const branch = HAL.predictTravelBranch({
        scholarMoved: scholarMoved, hadOldMonster: hadOldMonster,
        follows: followsVal, destOccupied: !!destOccupied, destSafe: !!destSafe,
      });
      let mismatch = null, nestedMove = false;
      if (tracked) {
        mismatch = HAL.travelMismatch(branch, heraldBefore, heraldAfter, dest);
      } else if (heraldBefore && heraldAfter && !HAL.sameTile(heraldBefore, heraldAfter)) {
        nestedMove = true;
      } else if (!heraldBefore && heraldAfter) {
        nestedMove = true;
      } else if (heraldBefore && !heraldAfter) {
        nestedMove = true;
      }
      const sayDuring = store.sayLines.filter(s => s.seq > seqBefore && s.seq <= store.saySeq).map(s => ({ kind: s.kind, text: s.text }));
      const rec = {
        day: dayOf(), from: fromTile, dest: dest, scholarAfter: scholarAfter,
        heraldBefore: heraldBefore, heraldAfter: heraldAfter,
        oldMonsterId: oldMonster ? oldMonster.id : null,
        followsRaw: (followsVal === undefined ? null : followsVal),
        destOccupied: destOccupied, destSafe: destSafe,
        branch: branch, mismatch: mismatch, nestedMove: nestedMove, sayDuring: sayDuring,
        returnedKind: (r === null ? 'null' : (r && typeof r === 'object' ? (r.blockType ? 'block:' + r.blockType : 'object') : typeof r)),
      };
      store.travelEvents.push(rec);
      // FOLLOW-LEG STEPWISE PUSH (NEW in this arm — closes the
      // heraldarr2-a day-120 gap): when the Herald IS the tracked old
      // monster and the branch is followEnter, push the follow leg
      // itself, stepwise, to the code's assignment tile (dest) —
      // NEVER to heraldAfter, which may already include a nested
      // wander inside the same call (that wander is the wander
      // wrapper's own row). Non-followEnter tracked travels push
      // nothing: any herald move there is a nested move, recorded
      // by its own wrapper (wander/mFlee). The analyzer suppresses
      // its synth leg for travels covered by this row (same day,
      // same from, same to-dest), so no double count.
      if (tracked && branch === 'followEnter' && heraldBefore && dest && !HAL.sameTile(heraldBefore, dest)) {
        pushMove('followEnter', heraldBefore, dest, {});
      }
    } catch (e) { noteErr('travelAfter', e); }
    return r;
  });

  // DRAFT-SELECTION WRAP (NEW in this arm): records the full gate state
  // + sorted-nearest list + predicted raidN BEFORE the call, and the
  // drafted set (first raidN of the pre-call sorted list, exactly the
  // code's slice when the raid fires) AFTER it. A non-draft is thus
  // distinguishable from a draft-that-missed: blocked-* names the
  // failing gate, roll-miss names the 18% roll by elimination (all
  // gates pass, lastRaidDay unchanged, no drafted set), rank-missed
  // names a Herald sorted nearest but beyond the raidN cut.
  wrap('havenRaidTick', (orig) => function () {
    let pre = null, readErr = false;
    try {
      const hv = havenTile();
      const living = (Game.worldMonsters() || []).filter(m => m && (m.hp || 0) > 0);
      // Keep the ENTITY REFERENCE on each entry: the raid code mutates
      // tx/ty in place on these same objects, so a pre-call reference
      // still describes the drafted entity post-call even when a twin
      // shares its id (the heraldarr2-a by-id re-find could return the
      // wrong twin). Pre tiles are captured as numbers now, before
      // any mutation.
      const withDist = living.map(m => ({ id: m.id, tx: m.tx, ty: m.ty, hp: m.hp, dist: HAL.manhattan({ x: m.tx, y: m.ty }, hv), ref: m }));
      const sorted = withDist.slice().sort((a, b) => a.dist - b.dist);
      let pantry = null, tableActive = null, cooldown = null, over = null, lastRaidDay = null;
      try { pantry = Game.pantryKcalLive(Game.state.village); } catch (e) { readErr = true; }
      try { tableActive = Game.tableActive ? !!Game.tableActive() : false; } catch (e) { readErr = true; }
      try { const ot = Game.overtimeRaidKnobs ? Game.overtimeRaidKnobs() : null; cooldown = ot ? ot.cooldown : 7; } catch (e) { readErr = true; }
      try { over = !!Game.over; } catch (e) { readErr = true; }
      try { lastRaidDay = (Game.state.village || {}).lastRaidDay || 0; } catch (e) { readErr = true; }
      const heraldIdx = sorted.findIndex(m => m.id === 'herald');
      const heraldDist = heraldIdx >= 0 ? sorted[heraldIdx].dist : null;
      const tie = heraldIdx >= 0 ? sorted.some((m, i) => i !== heraldIdx && m.dist === heraldDist) : false;
      let raidN = null;
      try { raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0)); } catch (e) { raidN = null; readErr = true; }
      pre = { day: dayOf(), over: over, tableActive: tableActive, lastRaidDay: lastRaidDay, cooldown: cooldown,
        livingCount: living.length, pantry: pantry, havenTile: hv,
        sorted: sorted, sortedIds: sorted.map(m => m.id), raidN: raidN,
        draftedEntries: (raidN === null ? [] : sorted.slice(0, raidN).map(e => ({ id: e.id, ref: e.ref, preTile: { x: e.tx, y: e.ty } }))),
        heraldPresent: heraldIdx >= 0, heraldRank: heraldIdx >= 0 ? heraldIdx : null,
        heraldDist: heraldDist, heraldTie: tie,
        heraldTileBefore: heraldTile(), heraldFlagsBefore: heraldFlags() };
    } catch (e) { noteErr('raidPre', e); readErr = true; }
    const r = orig.apply(this, arguments);
    try {
      store.raidCalls++;
      if (!pre) { store.raidDrafts.push({ day: dayOf(), cls: 'unknown', heraldStatus: 'unknown', reason: 'pre-state-failed' }); return r; }
      let postLast = null;
      try { postLast = (Game.state.village || {}).lastRaidDay || 0; } catch (e) {}
      const cls = HAL.classifyRaidCall(
        { over: pre.over, tableActive: pre.tableActive, day: pre.day, lastRaidDay: pre.lastRaidDay,
          cooldown: pre.cooldown, livingCount: pre.livingCount, pantry: pre.pantry,
          sortedIds: pre.sortedIds, raidN: pre.raidN, heraldRank: pre.heraldRank, heraldPresent: pre.heraldPresent },
        { lastRaidDay: postLast }, readErr);
      const draftedPost = {};
      if (cls.cls === 'draft') {
        for (const id of cls.draftedIds) {
          try {
            const m = (Game.worldMonsters() || []).find(x => x && x.id === id) || null;
            draftedPost[id] = m ? { tile: { x: m.tx, y: m.ty }, onHaven: HAL.sameTile({ x: m.tx, y: m.ty }, pre.havenTile), raidBorn: !!m.raidBorn, hp: m.hp, lingering: !!m.lingering } : null;
          } catch (e) { draftedPost[id] = null; }
        }
      }
      // DRAFTEDPOSTLIST (NEW in this arm — authoritative): one entry
      // per drafted ENTITY, read off the pre-call reference, never
      // off a by-id re-find. present=false means the reference left
      // the world list during the raid call (killed/removed); its
      // tile is still the reference's last tile. The old by-id
      // draftedPost object above is kept alongside for comparison.
      let draftedPostList = [];
      if (cls.cls === 'draft') {
        try {
          const live = Game.worldMonsters() || [];
          draftedPostList = (pre.draftedEntries || []).map(e => {
            const ref = e.ref;
            const tile = (ref && typeof ref.tx === 'number' && typeof ref.ty === 'number') ? { x: ref.tx, y: ref.ty } : null;
            return { id: e.id, preTile: e.preTile, tile: tile,
              onHaven: tile ? HAL.sameTile(tile, pre.havenTile) : false,
              raidBorn: !!(ref && ref.raidBorn), hp: ref ? ref.hp : null,
              lingering: !!(ref && ref.lingering), present: live.indexOf(ref) !== -1 };
          });
        } catch (e) { draftedPostList = []; }
      }
      const heraldAfter = heraldTile(), flagsAfter = heraldFlags();
      const heraldDraftMovedOff = (cls.heraldStatus === 'drafted' && draftedPost.herald && draftedPost.herald.tile)
        ? !HAL.sameTile(draftedPost.herald.tile, pre.havenTile) : false;
      store.raidDrafts.push({ day: pre.day, cls: cls.cls, heraldStatus: cls.heraldStatus,
        draftedIds: cls.draftedIds, draftedPost: draftedPost, draftedPostList: draftedPostList,
        heraldDraftMovedOff: heraldDraftMovedOff,
        heraldRank: pre.heraldRank, heraldDist: pre.heraldDist, heraldTie: pre.heraldTie,
        raidN: pre.raidN, livingCount: pre.livingCount, pantry: pre.pantry,
        lastRaidDayBefore: pre.lastRaidDay, lastRaidDayAfter: postLast,
        cooldown: pre.cooldown, tableActive: pre.tableActive, over: pre.over,
        sortedIds: pre.sortedIds, sortedDists: pre.sorted.map(m => m.dist),
        heraldTileBefore: pre.heraldTileBefore, heraldTileAfter: heraldAfter,
        heraldFlagsBefore: pre.heraldFlagsBefore, heraldFlagsAfter: flagsAfter });
      // STEPWISE raidPin (NEW in this arm — replaces the v2 NET record):
      // a drafted Herald's landing leg is before → haven, whatever
      // the after-state reads (a defender fight inside the same call
      // may already have fled it off Haven — that flee is the
      // resolve wrapper's mFleeMove row, not part of this leg).
      // A drafted Herald already on haven pushes no move (in place).
      if (pre.heraldTileBefore && cls.heraldStatus === 'drafted' && !HAL.sameTile(pre.heraldTileBefore, pre.havenTile)) {
        pushMove('raidPin', pre.heraldTileBefore, pre.havenTile, { flagsBefore: pre.heraldFlagsBefore, flagsAfter: flagsAfter });
      } else if (pre.heraldTileBefore && pre.heraldFlagsBefore && flagsAfter &&
        (pre.heraldFlagsBefore.lingering !== flagsAfter.lingering || pre.heraldFlagsBefore.raidBorn !== flagsAfter.raidBorn)) {
        store.flagEvents.push({ day: pre.day, kind: 'raidFlag', tile: heraldAfter, flagsBefore: pre.heraldFlagsBefore, flagsAfter: flagsAfter });
      }
    } catch (e) { noteErr('raid', e); }
    return r;
  });

  // LINGER RE-PIN WRAP (NEW in this arm): records EVERY re-pin
  // application for a lingering Herald — moved, held-in-place, or
  // drift-cleared — not only tile-changing pins (v1 missed held).
  // dailyObs records every call's entry state so bar 3 (no missing
  // re-pin record) is checkable from the corpus alone.
  wrap('havenGrowthDaily', (orig) => function () {
    let pre = null;
    try {
      const fl = heraldFlags();
      let tableActive = null;
      try { tableActive = Game.tableActive ? !!Game.tableActive() : false; } catch (e) {}
      let over = null;
      try { over = !!Game.over; } catch (e) {}
      pre = { day: dayOf(), lingering: fl ? fl.lingering : false, tile: heraldTile(),
        havenTile: havenTile(), lingerSince: fl ? fl.lingerSince : null,
        tableActive: tableActive, over: over };
    } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      store.dailyCalls++;
      if (pre) store.dailyObs.push({ day: pre.day, heraldLingering: pre.lingering, over: pre.over });
      if (pre && pre.lingering) {
        if (pre.over) {
          store.lingerPins.push({ day: pre.day, cls: 'skipped-over', gorgeSkipped: false,
            tileBefore: pre.tile, tileAfter: pre.tile, havenTile: pre.havenTile,
            lingerSince: pre.lingerSince, lingeringAfter: pre.lingering, tableActive: pre.tableActive });
        } else {
          const postFlags = heraldFlags();
          const post = { lingering: postFlags ? postFlags.lingering : null, tile: heraldTile() };
          const c = HAL.classifyLingerPin(
            { lingering: pre.lingering, tile: pre.tile, havenTile: pre.havenTile, lingerSince: pre.lingerSince, day: pre.day, tableActive: pre.tableActive }, post);
          store.lingerPins.push({ day: pre.day, cls: c.cls, gorgeSkipped: c.gorgeSkipped,
            tileBefore: pre.tile, tileAfter: post.tile, havenTile: pre.havenTile,
            lingerSince: pre.lingerSince, lingeringAfter: post.lingering, tableActive: pre.tableActive });
          if (pre.tile && post.tile && !HAL.sameTile(pre.tile, post.tile)) {
            pushMove('lingerPin', pre.tile, post.tile, {});
          } else if (pre.tile && postFlags && postFlags.lingering !== pre.lingering) {
            store.flagEvents.push({ day: pre.day, kind: 'dailyFlag', tile: post.tile, flagsBefore: null, flagsAfter: postFlags });
          }
        }
      }
    } catch (e) { noteErr('daily', e); }
    return r;
  });

  wrap('resolveWildMonsterEncounter', (orig) => function () {
    let before = null;
    try { before = heraldTile(); } catch (e) {}
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const m = arguments.length > 1 ? arguments[1] : null;
      const after = heraldTile();
      if (before && after && !HAL.sameTile(before, after)) {
        pushMove('mFleeMove', before, after, { vid: arguments.length ? arguments[0] : null, outcome: (r && r.outcome) || null });
      }
      if (m && m.id === 'herald') {
        const vid = arguments.length ? arguments[0] : null;
        store.contacts.push({ day: dayOf(), channel: 'villager', mid: 'herald',
          outcome: (r && r.outcome) || null, vid: vid,
          scholarTile: scholarTile(), heraldTile: after });
      }
    } catch (e) { noteErr('resolve', e); }
    return r;
  });

  const NEEDLES = [
    ['omen2', /Scouts found its lair/],
    ['pads', /pads into the clearing/],
    ['refusal', /does not notice you/],
    ['followed', /It followed you/],
    ['treeline', /stops at the treeline/],
    ['boundary', /stops at the boundary/],
    ['nobodyMet', /Nobody met/],
    ['linger', /still out there at the treeline/],
    ['raid', /RAID —/],
    ['gorge', /gorges at the treeline/],
    ['meltback', /melts back into the dark/],
    ['call', /THE CALL GOES OUT/],
    ['omen0', /Scouts come back pale/],
    ['omen1', /They name it/],
  ];
  wrap('say', (orig) => function () {
    try {
      const raw = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
      store.saySeq++;
      store.ring.push({ day: dayOf(), text: raw.slice(0, 500) });
      if (store.ring.length > 12) store.ring.shift();
      NEEDLES.forEach(function (spec) {
        if (spec[1].test(raw)) {
          store.sayLines.push({ day: dayOf(), kind: spec[0], text: raw.slice(0, 500), seq: store.saySeq });
        }
      });
    } catch (e) { store.captureErrs++; }
    return orig.apply(this, arguments);
  });

  wrap('startCombat', (orig) => function () {
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const mid = arguments.length ? arguments[0] : null;
      if (mid === 'herald') {
        let outcome = (r === null || r === undefined) ? 'refused' : 'fought';
        try {
          const outs = ((Game.state || {}).titans || {}).outcomes || [];
          for (let i = outs.length - 1; i >= 0; i--) {
            const o = outs[i];
            if (o && o.titan === 'herald' && o.outcome === 'refused') { outcome = 'refused'; break; }
          }
        } catch (e) {}
        store.contacts.push({ day: dayOf(), channel: 'scholar', mid: mid, outcome: outcome,
          scholarTile: scholarTile(), heraldTile: heraldTile() });
        if (!store.firstEvents.beatFirstContact) store.firstEvents.beatFirstContact = store.ring.slice();
      }
    } catch (e) { noteErr('startCombat', e); }
    return r;
  });

  return function uninstall() {
    Object.keys(origs).forEach(function (m) { try { Game[m] = origs[m]; } catch (e) {} });
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const store = {
    lairs: [], removals: [], dawns: [], moves: [], travelEvents: [], contacts: [],
    sayLines: [], ring: [], firstEvents: {}, captureErrs: 0, errors: [],
    worldTickCount: 0, wanderCalls: 0, raidCalls: 0, dailyCalls: 0,
    flagEvents: [], raidDrafts: [], lingerPins: [], dailyObs: [], saySeq: 0,
  };
  let uninstall = function () {};
  if (CAP_ON) uninstall = installHeraldArrCapture(Game, store);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let endSnap = null;
  try { endSnap = FD.snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  let endHerald = null;
  try {
    const m = (Game.worldMonsters() || []).find(x => x && x.id === 'herald') || null;
    const omen = ((st.titans || {}).omens || {}).herald || null;
    endHerald = { present: !!m, tile: m ? { x: m.tx, y: m.ty } : null,
      omenStage: omen ? (omen.stage != null ? omen.stage : null) : null,
      lingering: m ? !!m.lingering : null, raidBorn: m ? !!m.raidBorn : null };
  } catch (e) { endHerald = { error: String((e && e.message) || e).slice(0, 120) }; }

  const out = {
    seed, instrument: CAP_ON ? 'heraldarr2follow-a-v1' : 'substrate-only',
    substrate: 'withFullseatDiag(withWavegateDiag(tableseatNowait))' + (CAP_ON ? ' + sim-heraldarr2follow-a capture' : ' (capture off)'),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endSnap, endHerald,
    rows: wg ? wg.rows : [], recorderErrs: wg ? wg.errs : 0,
    lairs: store.lairs, removals: store.removals, dawns: store.dawns,
    moves: store.moves, travelEvents: store.travelEvents, contacts: store.contacts,
    sayLines: store.sayLines, firstEvents: store.firstEvents,
    captureErrs: store.captureErrs, captureErrors: store.errors,
    worldTickCount: store.worldTickCount, wanderCalls: store.wanderCalls,
    raidCalls: store.raidCalls, dailyCalls: store.dailyCalls,
    flagEvents: store.flagEvents, raidDrafts: store.raidDrafts,
    lingerPins: store.lingerPins, dailyObs: store.dailyObs,
  };
  process.stdout.write(JSON.stringify(out) + '\n');
  const nC = store.contacts.length;
  console.error(`done s${seed}: lairs=${store.lairs.length} contacts=${nC} moves=${store.moves.length} travel=${store.travelEvents.length} dawns=${store.dawns.length} worldTicks=${store.worldTickCount} raidDrafts=${store.raidDrafts.length} lingerPins=${store.lingerPins.length} capErrs=${store.captureErrs} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try { await oneRun(seed); }
    catch (e) { console.error(`ERROR s${seed}: ${e && e.message}`); process.exitCode = 1; }
  }
})();
