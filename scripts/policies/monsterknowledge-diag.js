// monsterknowledge-diag — monster-location knowledge census for
// sim-monsterknowledge-a (2026-10-27, flesh-out loop, axis
// scale-onramp, DIAG ONLY).
//
// QUESTION (from sim-meetrule-a): G1 KNOWLEDGE is MISSING — no engine
// path supplies a live monster's tile to villager routing. This
// recorder does NOT propose a link. It measures, per policy day,
// whether villagers ever hold or act on monster-location knowledge:
// objectives targeting a live monster's tile, gossip naming a live
// monster, codex knowledge of a live monster's type, muster state
// while a threat is near Haven, map-seen state for live monster
// tiles, and co-location (meeting, not knowledge — counted only to
// keep it out of the knowledge classes).
//
// MECHANISM, READ FROM CODE (never invented):
//   - Objectives (villager-objectives.js objPick): outdoor kinds carry
//     o.tx/o.ty (a direction+distance node, a remembered corpse site
//     for HAUL, a person's node for VISIT via targetVid). objState()
//     is the raw store; objOf() would CREATE entries, so this
//     recorder reads objState() directly, never via objOf.
//   - Gossip (game.js seedGossip): entries {action, dims, heard,
//     day, partKey} on state.village.gossip. Dims carry person ids
//     and traits, never tiles — a gossip match names a monster at
//     most, never a place. The census stores the entries verbatim
//     (action + JSON dims) so the proof can join them to live types.
//   - Codex monster knowledge (game.js monsterKnown -> canShow;
//     state.codex.monsters entries with stage): type knowledge only.
//     The census reads state.codex.monsters + deedState().wavesFaced
//     directly, never via a mutating helper.
//   - Muster threat gate (shelter.js shelterThreatNearHaven): a pure
//     read over worldMonsters() — wave-4+ monster within radius
//     (Chebyshev) of Haven, worst wave wins. shelterMusterCheck()
//     turns that threat into shelter (villagers INSIDE), never into
//     a pursuit objective. The census records the gate result and
//     state.village.shelterMustered verbatim.
//   - Map-seen (game.js mapSeen): scholar.seenTiles — 'visited' for
//     walked tiles, 'shared' for scout/sense-shared tiles, null
//     otherwise. A monster tile can be map-known to the PLAYER
//     without any villager objective pointing at it.
//   - Lingering raiders (havenGrowth.js lingeringRaiders): world
//     monsters with .lingering set — the treeline-gorge state the
//     sortie language attaches to, not a world-monster tile supply.
//   - Meeting set (villagerMonsterTick, game.js): roster minus player,
//     living, not sheltered, not post-flee-resting; monsters on the
//     player tile offer NO villager meeting (same filter as w4opp).
//
// OBSERVATIONAL ONLY. MONSTERKNOWLEDGE=1 is the only on-switch.
// Unset delegates byte-identically: no census rows, no ctx surface.
// The daily hook records AFTER delegating, writes nothing to game
// state, draws no RNG, never throws into the engine (recording
// errors are counted). It never calls villageStandingTotal() or
// unlockedWave() mid-run. shelterThreatNearHaven() is the engine's
// own pure read; the G2 leg-exact identity check in the sweep is
// the proof that calling it moves nothing.
'use strict';

const MAX_CENSUS = 20000;

function layerOn() { try { return process.env.MONSTERKNOWLEDGE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return { census: [], errs: 0, errors: [], overflow: { census: 0 }, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, item) {
  if (store.census.length >= MAX_CENSUS) { store.overflow.census++; return false; }
  store.census.push(item);
  return true;
}

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through to 1 */ }
  return 1;
}

// census(Game, store): one row per policy day, post-day board.
function census(Game, store) {
  try {
    const v = (Game.state || {}).village || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    const roster = (v.roster || []).slice();
    const nodePos = (v.nodePos || {});
    const playerId = Game.villagerId;
    let objs = {};
    try { objs = (typeof Game.objState === 'function') ? (Game.objState() || {}) : {}; } catch (e) { noteErr(store, 'census.objState', e); }
    let pool = [];
    try { pool = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; } catch (e) { noteErr(store, 'census.pool', e); }
    let gossip = [];
    try {
      gossip = (v.gossip || []).map(g => ({
        action: g.action || null,
        dims: JSON.stringify(g.dims || {}),
        heardN: (g.heard || []).length,
        day: g.day != null ? g.day : null,
      }));
    } catch (e) { noteErr(store, 'census.gossip', e); }
    let codexMonsters = {};
    try {
      const cm = ((Game.state || {}).codex || {}).monsters || {};
      for (const k of Object.keys(cm)) codexMonsters[k] = (cm[k] && cm[k].stage) || 'entry';
    } catch (e) { noteErr(store, 'census.codex', e); }
    let faced = {};
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      faced = (ds && ds.wavesFaced) || {};
    } catch (e) { noteErr(store, 'census.faced', e); }
    let threat = null;
    try {
      if (typeof Game.shelterThreatNearHaven === 'function') {
        const t = Game.shelterThreatNearHaven();
        if (t) threat = { type: (t.monster && t.monster.id) || null, wave: t.wave != null ? t.wave : null, dist: t.dist != null ? t.dist : null, name: t.name || null, tx: (t.monster && t.monster.tx != null) ? t.monster.tx : null, ty: (t.monster && t.monster.ty != null) ? t.monster.ty : null };
      }
    } catch (e) { noteErr(store, 'census.threat', e); }
    let mustered = null;
    try { mustered = v.shelterMustered || null; } catch (e) {}
    let lingering = [];
    try {
      if (typeof Game.lingeringRaiders === 'function') lingering = (Game.lingeringRaiders() || []).map(m => ({ type: m.id || null, tx: m.tx, ty: m.ty }));
    } catch (e) { noteErr(store, 'census.lingering', e); }
    // Villager nodes + eligibility (meeting set, as in w4opp).
    const nodes = {};
    const eligible = {};
    for (const rid of roster) {
      if (rid === playerId) continue;
      let dead = false;
      try {
        if (typeof Game.vpOf === 'function') { const vp = Game.vpOf(rid); if (vp && vp.dead) dead = true; }
        else if (typeof Game.getPerson === 'function') { const p = Game.getPerson(rid); if (p && p.dead) dead = true; }
      } catch (e) { /* keep on read error */ }
      if (dead) continue;
      const n = nodePos[rid];
      nodes[rid] = [n ? n.nx : hx, n ? n.ny : hy];
      let sheltered = false, postFlee = false;
      try { sheltered = !!(typeof Game.isSheltered === 'function' && Game.isSheltered(rid)); } catch (e) {}
      try { postFlee = !!(typeof Game.isPostFleeResting === 'function' && Game.isPostFleeResting(rid)); } catch (e) {}
      eligible[rid] = !(sheltered || postFlee);
    }
    // All villager objectives with a target node (outdoor kinds).
    // Indoor/idle entries carry no tx,ty and are stored as kind-only.
    const objectives = {};
    for (const rid of Object.keys(objs)) {
      const o = objs[rid] || {};
      objectives[rid] = {
        kind: o.kind || 'idle', state: o.state || null,
        tx: (o.tx != null) ? o.tx : null, ty: (o.ty != null) ? o.ty : null,
        targetVid: o.targetVid || null, targetRef: o.targetRef || null,
        indoor: !!o.indoor,
      };
    }
    // Live monsters with map-seen state for their tile.
    const monsters = [];
    for (const m of pool) {
      let seen = null;
      try { seen = (typeof Game.mapSeen === 'function') ? Game.mapSeen(m.tx, m.ty) : null; } catch (e) { noteErr(store, 'census.mapSeen', e); }
      monsters.push({
        seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null,
        src: (m._spawnsrc != null) ? String(m._spawnsrc) : null,
        type: m.id || null, wave: waveOf(Game, m),
        tx: m.tx, ty: m.ty, lingering: !!m.lingering,
        onPlayerTile: (px != null && py != null && m.tx === px && m.ty === py),
        mapSeen: seen,
      });
    }
    pushCapped(store, {
      day: dayOf(Game),
      haven: [hx, hy],
      playerTile: [px, py],
      monsters: monsters,
      objectives: objectives,
      nodes: nodes,
      eligible: eligible,
      gossip: gossip,
      codexMonsters: codexMonsters,
      faced: faced,
      threat: threat,
      mustered: mustered,
      lingering: lingering,
    });
  } catch (e) { noteErr(store, 'census', e); }
}

function withMonsterknowledgeDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { census(Game, st); } catch (e) { noteErr(st, 'daily.census', e); }
        try { ctx._monsterknowledge = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, withMonsterknowledgeDiag, census, MAX_CENSUS };
