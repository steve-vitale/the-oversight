// w4opp-diag — wave-4 spawn opportunity recorder for sim-w4opp-a
// (2026-10-26, flesh-out loop, axis scale-onramp, DIAG ONLY).
//
// QUESTION (findings backlog #1152, from sim-wave4enc-a 1920Z): 33 wave-4
// spawns, 24 never fought, days 101-180 — lateness alone does not explain
// them. This recorder follows each wave-4 spawn through its life: spawn
// position, daily/tick position and distance to the Haven node, nearest
// living-villager distance over time, meeting-rule trigger state, fight
// linkage (via the reused wave4enc/nonworldkill recorders, NOT re-derived
// here), removal cause hint, still-present-at-end flag.
//
// MECHANISM, READ FROM CODE (src/js/game.js, never invented):
//   - Villager field meeting (villagerMonsterTick, inside worldTick):
//     monster tile == villager node (npcNode), monster NOT on the player
//     tile, villager roster/living/not sheltered/not post-flee-resting;
//     then a 50% roll picks one occupant -> fieldFight. Same tile or
//     nothing — no distance gradient for villagers.
//   - THE ENGINE'S MEETING SET (exact): npcsOnNode excludes the player
//     character (game.js:2449 puts villagerId FIRST in the roster, and
//     npcsOnNode filters rid === villagerId), and villagerMonsterTick
//     further filters sheltered + post-flee-resting villagers and skips
//     monsters on the player tile entirely. The snapshot MUST apply the
//     same set — counting the player as a "villager on the tile" (or
//     counting player-tile monsters as villager-range) fabricates
//     contact opportunities the engine never offers. CORRECTED 2026-10-26
//     after the first sweep: the original snapshot counted the player
//     as a villager, inflating contact-without-fight (14/24). The
//     corrected snapshot counts ONLY eligible villagers (roster minus
//     player, living, not sheltered, not post-flee-resting) and sets
//     villagerRange false for monsters on the player tile. See the
//     evidence file's instrument-correction note.
//   - Player tb meeting (moveMonster handlers): player on the monster's
//     tile + grid contact (same mx,my cell -> startCombat; hummice:
//     Chebyshev <= 1). Proxy: same tile + Chebyshev gridDist <= 1 =
//     "player in range"; gridDist == 0 = "player contact".
//   - Monster movement (wanderWorldMonsters, inside worldTick): 35% per
//     worldTick, one orthogonal tile, never onto safe/occupied tiles.
//   - Villager movement (npcNodeTravel, once per day-part): objective
//     driven, never monster-targeted.
//   - worldTick runs ONLY on player tile entry (checkEncounter is its
//     sole caller). Post-tick snapshots are therefore exactly the
//     moments a villager tick could have met a co-located monster:
//     villager positions do not change during worldTick (npcNodeTravel
//     runs in advancePart), so post-tick co-location == co-location
//     during that tick's villagerMonsterTick (barring a fight, which the
//     reused recorders link separately).
//
// SNAPSHOT SOURCES: 'tick' (after each worldTick delegates) and 'daily'
// (after each policy day delegates, via the withW4oppDiag daily hook —
// the sweep ALSO calls snapshotDaily directly from its own daily wrapper
// so the daily cadence holds even if a policy layer sits above).
// A 'tick' snapshot in villager range IS a contact opportunity (the
// tick just ran with them co-located and no fight followed — the 50%
// roll, shelter, post-flee-rest, or table-sanctity stood in the way).
// A 'daily' snapshot in villager range is range without proven contact
// (the monster or the villager may move on before the next worldTick).
//
// OBSERVATIONAL ONLY. W4OPP=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no ctx surface, no record. The
// wraps record AFTER delegating, write nothing to game state, draw no
// RNG, never throw into the engine (recording errors are counted),
// and return every original value untouched. It never calls
// villageStandingTotal() or unlockedWave() mid-run. Wave is read off
// the entity (m.wave, set by spawnWorldMonster) with the spawnsrc
// waveOf fallback (crisisWaveOf) only when m.wave is absent.
'use strict';

const MAX_SNAPS = 120000;
const MAX_REMOVALS = 20000;

function layerOn() { try { return process.env.W4OPP === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundN(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    snaps: [], removals: [],
    errs: 0, errors: [], overflow: { snaps: 0, removals: 0 },
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= (list === 'snaps' ? MAX_SNAPS : MAX_REMOVALS)) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through to 1, as the engine does */ }
  return 1;
}

function stackHint() {
  try {
    const st = (new Error()).stack || '';
    const names = [];
    for (const line of st.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (!m) continue;
      const fn = m[1];
      if (fn === 'stackHint' || fn === 'installW4oppDiag' || fn === 'Error') continue;
      if (names.indexOf(fn) < 0) names.push(fn);
      if (names.length >= 6) break;
    }
    return names.join(',');
  } catch (e) { return ''; }
}

// snapshot(Game, store, source): one row per living wave-4 world monster.
// Strictly read-only (see the nodePos note inside); no game state is
// written, no RNG drawn.
function snapshot(Game, store, source) {
  try {
    const v = (Game.state || {}).village || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    const s = (Game.state || {}).scholar || {};
    const pmx = (s.mx !== undefined && s.mx !== null) ? s.mx : 4;
    const pmy = (s.my !== undefined && s.my !== null) ? s.my : 4;
    const roster = (v.roster || []).slice();
    // Living villagers only: dead villagers keep a stale nodePos and
    // must never count as "in range". vpOf is the engine's own read.
    const livingNodes = [];
    // Strictly read-only: read nodePos DIRECTLY, never via npcNode (which
    // would CREATE a default entry for a villager with none). A missing
    // entry is the engine default — the Haven node — identical to what
    // npcNode would return on first read, with zero game-state writes.
    // THE ENGINE'S MEETING SET: exclude the player character (roster[0],
    // filtered by npcsOnNode), the dead (vpOf), the sheltered, and the
    // post-flee-resting — exactly villagerMonsterTick's filter. A
    // villager failing any of these is NOT a meeting opportunity.
    const nodePos = (v.nodePos || {});
    const playerId = Game.villagerId;
    for (const rid of roster) {
      try {
        if (rid === playerId) continue;
        if (typeof Game.vpOf === 'function') {
          const vp = Game.vpOf(rid);
          if (vp && vp.dead) continue;
        } else if (typeof Game.getPerson === 'function') {
          const p = Game.getPerson(rid);
          if (p && p.dead) continue;
        }
        if (typeof Game.isSheltered === 'function' && Game.isSheltered(rid)) continue;
        if (typeof Game.isPostFleeResting === 'function' && Game.isPostFleeResting(rid)) continue;
      } catch (e) { /* keep the villager on a read error — counted, never hidden */ }
      try {
        const n = nodePos[rid];
        livingNodes.push({ rid: rid, nx: (n ? n.nx : hx), ny: (n ? n.ny : hy) });
      } catch (e) { noteErr(store, 'snapshot.nodePos', e); }
    }
    let pool = [];
    try { pool = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; } catch (e) { noteErr(store, 'snapshot.pool', e); }
    const day = dayOf(Game);
    for (const m of pool) {
      try {
        if (waveOf(Game, m) !== 4) continue;
        const onPlayerTile = (px != null && py != null && m.tx === px && m.ty === py);
        let gridDist = null;
        if (onPlayerTile && m.mx != null && m.my != null) {
          gridDist = Math.max(Math.abs(m.mx - pmx), Math.abs(m.my - pmy));
        }
        let nearest = null, onTile = 0, onTileVids = [];
        for (const ln of livingNodes) {
          const d = Math.abs(m.tx - ln.nx) + Math.abs(m.ty - ln.ny);
          if (nearest == null || d < nearest) nearest = d;
          if (ln.nx === m.tx && ln.ny === m.ty) { onTile++; if (onTileVids.length < 4) onTileVids.push(ln.rid); }
        }
        // villagerMonsterTick SKIPS monsters on the player tile entirely:
        // a monster there offers NO villager meeting, however many
        // villagers (party included) share the tile.
        const villagerRange = onTile > 0 && !onPlayerTile;
        const playerRange = !!(onPlayerTile && gridDist != null && gridDist <= 1);
        pushCapped(store, 'snaps', {
          day: day, source: source,
          seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null,
          src: (m._spawnsrc != null) ? String(m._spawnsrc) : null,
          type: m.id || null,
          tx: m.tx, ty: m.ty,
          distHaven: Math.abs(m.tx - hx) + Math.abs(m.ty - hy),
          distPlayerTiles: (px != null && py != null) ? (Math.abs(m.tx - px) + Math.abs(m.ty - py)) : null,
          onPlayerTile: onPlayerTile,
          gridDist: gridDist,
          nearestVillagerDist: nearest,
          nVillagersOnTile: onTile,
          onTileVids: onTileVids,
          villagerRange: villagerRange,
          playerRange: playerRange,
          // Contact opportunities (see header): tick + villager range,
          // or any-source player grid contact.
          contactVillager: (source === 'tick' && villagerRange),
          contactPlayer: (gridDist === 0),
          hp: roundN(m.hp), maxHp: roundN(m.maxHp),
        });
      } catch (e) { noteErr(store, 'snapshot.monster', e); }
    }
  } catch (e) { noteErr(store, 'snapshot', e); }
}

function installW4oppDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w4oppDiagStore === store && Game._w4oppDiagInstalled) return Game._w4oppDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Post-tick snapshots: the tick just ran (wander + villager ticks).
  wrap('worldTick', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { snapshot(Game, store, 'tick'); } catch (e) { noteErr(store, 'worldTick.snap', e); }
    return r;
  });

  // Removal cause hint: capture BEFORE delegating (the splice drops
  // the object from the pool; the object itself keeps tx/ty).
  wrap('removeWorldMonster', (orig) => function (m) {
    let rec = null;
    try {
      if (m) {
        rec = {
          day: dayOf(Game),
          seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null,
          src: (m._spawnsrc != null) ? String(m._spawnsrc) : null,
          type: m.id || null, wave: waveOf(Game, m),
          tx: m.tx, ty: m.ty, hp: roundN(m.hp),
          hint: stackHint(),
        };
      }
    } catch (e) { noteErr(store, 'remove.pre', e); }
    const r = orig.apply(this, arguments);
    try { if (rec) pushCapped(store, 'removals', rec); } catch (e) { noteErr(store, 'remove.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w4oppDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w4oppDiagStore = store;
    Game._w4oppDiagInstalled = true;
    Game._w4oppDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withW4oppDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Delegate FIRST (the day's play happens inside); install + daily
      // snapshot after, so the snapshot sees the post-day board.
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW4oppDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { snapshot(Game, st, 'daily'); } catch (e) { noteErr(st, 'daily.snap', e); }
        try { ctx._w4opp = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW4oppDiag, withW4oppDiag, snapshot, MAX_SNAPS, MAX_REMOVALS };
