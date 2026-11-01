// dawnblock-diag — dawn lingering-encounter recorder (sim-dawnblock-a,
// scale-onramp axis, run fleshout-loop-a-20261101T1235Z).
//
// DIAG ONLY: zero src/js changes, zero edits to existing scripts or
// policy files. This file is the arm's recorder layer; the sweep that
// drives it lives in scripts/dawnblock-a-sweep.js.
//
// QUESTION (1016Z next blank 2, from sim-seathes-a): on seed 78201 a
// pending encounter at dawn ("Finish the current encounter…") blocks
// sitting on the last 8 mornings (days 173-180), and on 78208 on days
// 140/147/148/163 — it would block sitting even at national rank.
// The PRIMARY block is the policy-national vs lesser-regional gate
// mismatch (steve-call, NOT re-litigated here); this layer isolates
// ONLY the secondary dawn-encounter block.
//
// WHY A NEW RECORDER: sim-seathes-a recorded the decision moment's
// preview why / block line, but not WHICH encounter state produced
// it, how long that state had already lingered, or what cleared it.
// tableEntryBlock() (src/js/table.js) returns the encounter line iff
// inCombat() (a live tbfight, not over) OR state.scholar.monster
// (the monster on the scholar's tile). It does NOT check
// pendingEncounter (unstarted wanderer/raid pending) or
// activeContest (own, earlier line), and conversations never
// produce a block line at all. This layer therefore records every
// encounter signal SEPARATELY at the decision moment, so the
// trigger is identified from evidence, never assumed:
//   inCombat + tbfight fighters, tile monster (scholar.monster /
//   playerMonster() / monsterAt(px,py)), pendingEncounter +
//   pendingMonsterId + pendingInTent + raidPendingMonsterId,
//   activeContest, and the world-monster list (for moved-away
//   detection) plus the waveKillLog (for kill attribution).
//
// PURE OBSERVATION: withDawnblockDiag(inner) snapshots BEFORE
// delegating inward (the decision moment — the exact point the
// substrate's seat leg evaluates, same as seathes) and AFTER
// delegating (pre-sleep end of day), passes arguments and return
// values through untouched, writes nothing to game state, draws
// no RNG. DAWNBLOCK=1 is the only on-switch; unset (or
// DAWNBLOCKOFF=1) delegates byte-identically (the neutrality OFF
// leg). Every read is wrapped in try/catch: a failed read records
// an error string and increments errs, never throws into the day.
//
// EPISODES (analyzer, pure): an episode is a run of consecutive
// decision rows carrying the SAME encounter identity key with no
// gap row — fight:<fighter ids> if inCombat, else
// tile:<monster id>@<tx>,<ty> if a tile monster, else
// pending:<pendingMonsterId>, else contest:<id>. A gap row with a
// different key, or a no-encounter row, ends the episode; a later
// same-key row is a NEW episode (recurrence, not linger).
// Pending age = dawns since the episode's first decision row.
// Clearance outcome per episode: STILL-PENDING (runs to the last
// decision row), CLEARED-KILL-LOGGED (waveKillLog entry for that
// monster id/type appears across the gap), CLEARED-MOVED-AWAY
// (same monster id in worldMonsters on another tile at the next
// decision row), CLEARED-DURING-DAY (present at a day's pre
// snapshot, absent at that day's post snapshot, gone at the next
// dawn), CLEARED-GONE-UNATTRIBUTED (absent next dawn, neither
// kill-logged nor moved-away — slain-without-log vs despawned
// cannot be distinguished from dawn snapshots alone, and the
// label says so).
'use strict';

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function layerOn() { return process.env.DAWNBLOCK === '1' && process.env.DAWNBLOCKOFF !== '1'; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safeStr(x) { try { return String(x == null ? '' : x); } catch (e) { return ''; } }

function monsterDefWave(Game, id) {
  try {
    const def = ((Game.data || {}).monsters || []).find(m => m && m.id === id);
    return def ? (def.wave | 0 || null) : null;
  } catch (e) { return null; }
}
function monsterName(Game, id) {
  try {
    if (typeof Game.monsterDisplayName === 'function') {
      const n = Game.monsterDisplayName(id);
      if (n) return String(n);
    }
  } catch (e) {}
  try {
    const def = ((Game.data || {}).monsters || []).find(m => m && m.id === id);
    if (def && def.name) return String(def.name);
  } catch (e) {}
  return id ? String(id) : null;
}

// Compact world-monster list: "id@tx,ty:hp" per entry (for moved-away
// detection). Defensive: any shape failure yields an empty list plus
// an error note, never a throw.
function worldList(Game) {
  try {
    const wm = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    if (!Array.isArray(wm)) return [];
    return wm.map(m => {
      if (!m) return null;
      const id = m.id || m.monsterId || m.type || '?';
      return `${id}@${m.tx == null ? '?' : m.tx},${m.ty == null ? '?' : m.ty}:${m.hp == null ? '?' : Math.round(m.hp)}`;
    }).filter(Boolean);
  } catch (e) { return []; }
}
function killLog(Game) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    if (!Array.isArray(log)) return [];
    return log.map(e => {
      if (!e) return null;
      return `${e.day == null ? '?' : e.day}:${e.w == null ? '?' : e.w}:${e.type || e.mid || '?'}:${e.by || '?'}`;
    }).filter(Boolean);
  } catch (e) { return []; }
}
function fightSnap(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return null;
    const fighters = [];
    try {
      for (const ft of (f.fighters || [])) {
        if (!ft) continue;
        const mid = ft.monsterId || ft.id || ft.type || null;
        fighters.push({
          key: ft.key || null, kind: ft.kind || null,
          alive: ft.alive !== false, fled: !!ft.fled,
          hp: ft.hp == null ? null : Math.round(ft.hp),
          maxHp: ft.maxHp == null ? null : Math.round(ft.maxHp),
          monsterId: mid, name: mid ? monsterName(Game, mid) : (ft.name || null),
        });
      }
    } catch (e) {}
    return { id: f.id || null, over: !!f.over, round: f.round == null ? null : f.round, result: f.result || null, tableTrial: !!f.tableTrial, fighters };
  } catch (e) { return null; }
}
function tileMonsterSnap(Game) {
  try {
    let m = null;
    try { m = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null; } catch (e) { m = null; }
    if (!m) {
      try { const s = (Game.state || {}).scholar; m = s ? s.monster : null; } catch (e) { m = null; }
    }
    if (!m) {
      try {
        const px = (Game.map && Game.map.px) | 0, py = (Game.map && Game.map.py) | 0;
        m = (typeof Game.monsterAt === 'function') ? Game.monsterAt(px, py) : null;
      } catch (e) { m = null; }
    }
    if (!m) return null;
    const id = m.id || m.monsterId || m.type || null;
    const inWorld = (() => {
      try { return (typeof Game.worldMonsters === 'function') ? Game.worldMonsters().indexOf(m) >= 0 : null; } catch (e) { return null; }
    })();
    return {
      id, name: id ? monsterName(Game, id) : null,
      wave: id ? monsterDefWave(Game, id) : null,
      hp: m.hp == null ? null : Math.round(m.hp),
      tx: m.tx == null ? null : m.tx, ty: m.ty == null ? null : m.ty,
      mx: m.mx == null ? null : m.mx, my: m.my == null ? null : m.my,
      inWorld,
    };
  } catch (e) { return null; }
}
function contestSnap(Game) {
  try {
    const c = (Game.state || {}).activeContest;
    if (!c) return null;
    if (typeof c === 'string') return { id: c };
    return { id: c.id || c.contestId || null, kind: c.kind || c.type || null, name: c.name || null };
  } catch (e) { return null; }
}

// Full encounter snapshot at one moment (pre or post). Pure reads.
function snapEncounter(Game) {
  const out = { d: dayOf(Game) };
  try { out.inCombat = (typeof Game.inCombat === 'function') ? !!Game.inCombat() : null; } catch (e) { out.inCombat = null; }
  try { out.fight = fightSnap(Game); } catch (e) { out.fight = null; }
  try { out.tileMonster = tileMonsterSnap(Game); } catch (e) { out.tileMonster = null; }
  try { out.pending = !!Game.pendingEncounter; } catch (e) { out.pending = null; }
  try { out.pendingMonsterId = Game.pendingMonsterId || null; } catch (e) { out.pendingMonsterId = null; }
  try { out.pendingInTent = !!Game.pendingInTent; } catch (e) { out.pendingInTent = null; }
  try { out.raidPendingMonsterId = Game.raidPendingMonsterId || null; } catch (e) { out.raidPendingMonsterId = null; }
  try { out.contest = contestSnap(Game); } catch (e) { out.contest = null; }
  try { out.px = (Game.map && Game.map.px) | 0; out.py = (Game.map && Game.map.py) | 0; } catch (e) {}
  try { const t = Game.playerTile ? Game.playerTile() : null; out.tile = (t && t.type) || null; } catch (e) { out.tile = null; }
  try { out.inside = !!(((Game.state || {}).scholar || {}).insideHaven); } catch (e) { out.inside = null; }
  out.world = worldList(Game);
  out.kills = killLog(Game);
  return out;
}

// Decision-moment snapshot: seat/gate fields (seathes shape, trimmed
// to what this arm judges) + the encounter snapshot. Pure reads.
function snapDawn(Game) {
  const out = { d: dayOf(Game), enc: null };
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { out.rank = 'village'; }
  out.rankOrd = RANK_ORDER[out.rank] || 0;
  try { const t = Game.tableSeat ? Game.tableSeat() : null; out.seat = (t && t.seat) || 'none'; } catch (e) { out.seat = 'none'; }
  try { const pg = Game.progState ? Game.progState() : {}; out.waiting = !!pg.tableWaiting; out.done = !!pg.tableDone; } catch (e) { out.waiting = false; out.done = false; }
  try {
    const pv = Game.tablePreview ? Game.tablePreview() : null;
    out.pv = pv ? { seat: pv.seat, ready: !!pv.ready, why: safeStr(pv.why), ot: (pv.overtime | 0) } : null;
  } catch (e) { out.pv = null; out.pvErr = safeStr((e && e.message) || e).slice(0, 80); }
  try { out.block = Game.tableEntryBlock ? safeStr(Game.tableEntryBlock()) : ''; } catch (e) { out.block = ''; }
  try { out.access = Game.havenStoresAccess ? safeStr(Game.havenStoresAccess()) : null; } catch (e) { out.access = null; }
  try { out.enc = snapEncounter(Game); } catch (e) { out.enc = null; out.encErr = safeStr((e && e.message) || e).slice(0, 120); }
  return out;
}

function encounterKind(enc) {
  if (!enc) return 'none';
  if (enc.inCombat && enc.fight && !enc.fight.over) return 'tbfight';
  if (enc.tileMonster) return 'tile-monster';
  if (enc.pending) return 'pending';
  if (enc.contest) return 'contest';
  return 'none';
}
function identityKey(enc) {
  if (!enc) return null;
  if (enc.inCombat && enc.fight && !enc.fight.over) {
    const ids = (enc.fight.fighters || []).filter(f => f.kind === 'monster').map(f => f.monsterId || f.key || '?').sort();
    return 'fight:' + (ids.length ? ids.join('+') : (enc.fight.id || '?'));
  }
  if (enc.tileMonster) return 'tile:' + (enc.tileMonster.id || '?') + '@' + (enc.tileMonster.tx == null ? '?' : enc.tileMonster.tx) + ',' + (enc.tileMonster.ty == null ? '?' : enc.tileMonster.ty);
  if (enc.pending) return 'pending:' + (enc.pendingMonsterId || '?');
  if (enc.contest) return 'contest:' + (enc.contest.id || enc.contest.kind || '?');
  return null;
}
// Which signal actually fires the encounter block line? tableEntryBlock
// returns the encounter line iff inCombat OR scholar.monster — so the
// firing signal is 'tbfight' when a live fight exists, else
// 'tile-monster' when a tile monster exists. A pending-only or
// contest-only state can NEVER fire the encounter line; if a row
// shows the encounter line with neither signal, that is a CODE
// SURPRISE (recorded as 'surprise', never silently reclassified).
function firingSignal(enc) {
  if (!enc) return null;
  if (enc.inCombat && enc.fight && !enc.fight.over) return 'tbfight';
  if (enc.tileMonster) return 'tile-monster';
  return null;
}
function isEncounterLine(why) { return /encounter/i.test(safeStr(why)); }

function withDawnblockDiag(inner, id, desc) {
  const store = { rows: [], errs: 0 };
  const wrapped = Object.assign({}, inner, {
    id, desc, dawnblockStore: store,
    daily(Game, ctx) {
      let pre = null;
      if (layerOn()) { try { pre = snapDawn(Game); } catch (e) { store.errs += 1; pre = { err: safeStr((e && e.message) || e).slice(0, 120) }; } }
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          let post = null;
          try { post = snapEncounter(Game); } catch (e) { post = null; }
          store.rows.push({ pre, post });
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

// --- classification + episodes (pure; exported for the proof test) ---
function classifyHeldDawn(row) {
  const pre = row.pre || {};
  const enc = pre.enc || {};
  const cls = {
    day: pre.d, seat: pre.seat, rank: pre.rank, rankOrd: pre.rankOrd | 0,
    class: null, subclass: null,
    encounterLine: pre.pv ? isEncounterLine(pre.pv.why) : isEncounterLine(pre.block),
    encounterKind: encounterKind(enc), firingSignal: firingSignal(enc),
    identityKey: identityKey(enc),
    rankGateAlsoBinding: (pre.rankOrd | 0) < 2,
    soleBlocker: false, access: pre.access || null,
  };
  if (!pre.pv) {
    // Preview null: the seat is not yet offered (waiting false, done,
    // seat none, day < 90). The encounter may still be PRESENT, but
    // it is not the operative game block — record that separately.
    cls.class = 'PREVIEW-NULL';
    if (!pre.waiting) cls.subclass = 'TABLEWAITING-FALSE';
    else if (pre.done) cls.subclass = 'TABLEDONE';
    else if (pre.seat === 'none') cls.subclass = 'SEAT-NONE';
    else if ((pre.d | 0) < 90) cls.subclass = 'DAY-LT-90';
    else cls.subclass = 'OTHER';
    cls.encounterPresent = encounterKind(enc) !== 'none';
    return cls;
  }
  if (!pre.pv.ready) {
    const why = safeStr(pre.pv.why || pre.block);
    if (isEncounterLine(why)) {
      cls.class = 'ENTRY-BLOCKED'; cls.subclass = 'ENCOUNTER';
      cls.soleBlocker = (pre.rankOrd | 0) >= 2 && pre.access !== 'none' && pre.access != null && !enc.contest;
      if (cls.firingSignal == null) cls.subclass = 'ENCOUNTER-SURPRISE';
    } else if (/contest/i.test(why)) { cls.class = 'ENTRY-BLOCKED'; cls.subclass = 'CONTEST'; }
    else if (/Haven/i.test(why)) { cls.class = 'ENTRY-BLOCKED'; cls.subclass = 'HAVEN'; }
    else { cls.class = 'ENTRY-BLOCKED'; cls.subclass = 'OTHER:' + why.slice(0, 60); }
    return cls;
  }
  // Preview ready: the game gate is open. The policy gate decides.
  if ((pre.rankOrd | 0) < 2) { cls.class = 'RANK-GATE'; return cls; }
  cls.class = 'GAME-OPEN';
  return cls;
}

// Held dawn = decision row with a priced seat, table not done.
// Primary class priority (seathes scheme, extended): RANK-GATE
// first ONLY when the game gate is open (preview ready) — when the
// preview is not ready, the game block is the operative class even
// on regional days, because the question here is the encounter
// block itself. (Seathes' RANK-GATE-first scheme is preserved in
// the sweep's seathes-comparison path via classifyHeldDawn's
// rankGateAlsoBinding field, so the two schemes reconcile exactly:
// a dawn is RANK-GATE-primary in seathes iff rankGateAlsoBinding
// and the game gate is open or the preview is null.)
function isHeldDawn(row) {
  const pre = row.pre || {};
  return (pre.seat === 'lesser' || pre.seat === 'full') && !pre.done;
}
function isEncounterBlockedHeldDawn(cls) {
  return cls.class === 'ENTRY-BLOCKED' && (cls.subclass === 'ENCOUNTER' || cls.subclass === 'ENCOUNTER-SURPRISE');
}

function buildEpisodes(series) {
  const episodes = [];
  let cur = null;
  const flush = () => { if (cur) { episodes.push(cur); cur = null; } };
  for (let i = 0; i < series.length; i++) {
    const row = series[i] || {};
    const pre = row.pre || {};
    const enc = pre.enc || null;
    const key = identityKey(enc);
    const kind = encounterKind(enc);
    if (!key) { flush(); continue; }
    if (cur && cur.key === key && i === cur.lastIdx + 1) {
      cur.lastIdx = i; cur.lastDay = pre.d; cur.dawns += 1;
      cur.rows.push(i);
    } else {
      flush();
      cur = {
        key, kind,
        monsterId: (enc.tileMonster && enc.tileMonster.id) || (enc.pendingMonsterId) || null,
        monsterName: (enc.tileMonster && enc.tileMonster.name) || null,
        monsterWave: (enc.tileMonster && enc.tileMonster.wave) || null,
        tile: (enc.tileMonster && enc.tileMonster.tx != null) ? `${enc.tileMonster.tx},${enc.tileMonster.ty}` : null,
        pxpy: (enc.px != null) ? `${enc.px},${enc.py}` : null,
        scholarTile: enc.tile || null,
        firstIdx: i, lastIdx: i, firstDay: pre.d, lastDay: pre.d, dawns: 1, rows: [i],
      };
    }
  }
  flush();
  // Clearance outcome per episode, from the next decision row + the
  // kill-log diff + the episode's last post snapshot + world list.
  for (const ep of episodes) {
    const lastRow = series[ep.lastIdx] || {};
    const nextRow = series[ep.lastIdx + 1] || null;
    ep.heldDawns = ep.rows.filter(i => isHeldDawn(series[i] || {})).length;
    ep.blockedHeldDawns = ep.rows.filter(i => {
      if (!isHeldDawn(series[i] || {})) return false;
      return isEncounterBlockedHeldDawn(classifyHeldDawn(series[i]));
    }).length;
    if (!nextRow) { ep.clearance = 'STILL-PENDING'; ep.clearanceDay = null; continue; }
    const beforeKills = ((lastRow.pre || {}).enc || {}).kills || [];
    const afterKills = ((nextRow.pre || {}).enc || {}).kills || [];
    const newKills = afterKills.slice(beforeKills.length);
    const mid = ep.monsterId;
    const killLogged = mid ? newKills.some(k => {
      const parts = String(k).split(':');
      return parts[2] === mid;
    }) : false;
    // Kill-log entries carry the monster TYPE (def id); tile-monster
    // ids are def ids too, so a direct match is expected. Also match
    // on the fight-fighter ids for fight episodes.
    let killLogged2 = killLogged;
    if (!killLogged2 && ep.kind === 'fight') {
      const fids = (ep.key || '').replace(/^fight:/, '').split('+');
      killLogged2 = newKills.some(k => fids.indexOf(String(k).split(':')[2]) >= 0);
    }
    const nextWorld = ((nextRow.pre || {}).enc || {}).world || [];
    const movedAway = mid ? nextWorld.some(w => {
      const m = /^([^@]+)@([^:]+):/.exec(String(w));
      return m && m[1] === mid && m[2] !== ep.tile;
    }) : false;
    const postAbsent = lastRow.post ? (identityKey(lastRow.post) == null || identityKey(lastRow.post) !== ep.key) : false;
    if (killLogged2) ep.clearance = 'CLEARED-KILL-LOGGED';
    else if (movedAway) ep.clearance = 'CLEARED-MOVED-AWAY';
    else if (postAbsent) ep.clearance = 'CLEARED-DURING-DAY';
    else ep.clearance = 'CLEARED-GONE-UNATTRIBUTED';
    ep.clearanceDay = (nextRow.pre || {}).d ?? null;
    ep.newKillsAcrossGap = newKills;
  }
  return episodes;
}

module.exports = {
  layerOn, snapDawn, snapEncounter, withDawnblockDiag,
  encounterKind, identityKey, firingSignal, isEncounterLine,
  classifyHeldDawn, isHeldDawn, isEncounterBlockedHeldDawn,
  buildEpisodes, RANK_ORDER,
};
