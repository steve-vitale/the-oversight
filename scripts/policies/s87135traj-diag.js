// s87135traj-diag — trajectory recorder for sim-s87135-traj-a (DIAG ONLY).
//
// Pure reads, no engine calls: never calls unlockedWave(),
// villageStandingTotal(), scaleRank(), or any method that could roll RNG
// or write state / fire beats mid-run. Reads state.worldMonsters directly
// (never Game.worldMonsters(), which initializes state when absent).
// Wraps AFTER the inner daily runs, like contactfinish-diag's snapDaily.
//
// Snapshot fields per policy-daily call:
//   day (scholar day), px, py (map tile), scholar {name,hp,kcal},
//   roster [{id,name,alive,hp}] from state.village.roster + village.health,
//   pantryKcal bucket (rounded /100, same bucketing as dayHash),
//   worldMonsters [{id,tx,ty,hp,maxHp,veteran}] sorted for stable compare,
//   fledKeys (sorted "tx,ty" keys of state.fledMonsters),
//   killLogLen + last kill entry, faced copy (deedState().wavesFaced —
//     read-only getter already used by contactfinish-diag's copyFaced).
'use strict';

function layerOn() { try { return process.env.S87135TRAJ === '1'; } catch (e) { return false; } }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }

function newStore() {
  return { snaps: [], ticks: [], errs: 0, errors: [] };
}

// installS87135TrajTick(Game, store): wrap Game.villagerMonsterTick with a
// pure-read pre-pass. For each roaming monster, count the villagers the
// tick COULD fight (roster members on the monster's node, minus the scholar,
// minus sheltered, minus post-flee-resting) using only state/Game-property
// reads — never Game.npcNode() (writes defaults) or Game.isSheltered()
// wrappers beyond the raw flag map. Recording never throws into the engine
// and the delegate's return value passes through untouched.
function installS87135TrajTick(Game, store) {
  try {
    if (!Game || Game._s87135trajTickInstalled) return;
    const orig = Game.villagerMonsterTick;
    if (typeof orig !== 'function') return;
    Game.villagerMonsterTick = function () {
      try {
        const st = Game.state || {};
        const vil = st.village || {};
        const sch = st.scholar || {};
        const day = sch.day || 0;
        const roster = Array.isArray(vil.roster) ? vil.roster : [];
        const np = vil.nodePos || {};
        const sheltered = vil.sheltered || {};
        const rest = Game._postFleeRest || {};
        const scholarVid = Game.villagerId || null;
        const px = Game.map ? Game.map.px : null;
        const py = Game.map ? Game.map.py : null;
        const wm = Array.isArray(st.worldMonsters) ? st.worldMonsters : [];
        let monsters = 0, opps = 0, npcTotal = 0, scholarTileSkipped = 0, shelterSkipped = 0, restSkipped = 0;
        for (const m of wm) {
          monsters++;
          if (m.tx === px && m.ty === py) { scholarTileSkipped++; continue; }
          let ids = [];
          for (const rid of roster) {
            if (rid === scholarVid) continue;
            const n = np[rid];
            if (!n || n.nx !== m.tx || n.ny !== m.ty) continue;
            if (sheltered[rid]) { shelterSkipped++; continue; }
            if (rest[rid] === day) { restSkipped++; continue; }
            ids.push(rid);
          }
          if (ids.length) { opps++; npcTotal += ids.length; }
        }
        if (store.ticks.length < 60000) {
          store.ticks.push({ day, monsters, opps, npcTotal, scholarTileSkipped, shelterSkipped, restSkipped });
        }
      } catch (e) { /* pre-pass must never break the tick */ }
      return orig.apply(this, arguments);
    };
    Game._s87135trajTickInstalled = true;
  } catch (e) { /* install failure is counted by the driver via store check */ }
}
function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* never throw */ }
}

function snapTraj(Game, store) {
  const st = Game.state || {};
  const sch = st.scholar || {};
  const vil = st.village || {};
  const rosterRaw = Array.isArray(vil.roster) ? vil.roster : [];
  const health = (vil.health && typeof vil.health === 'object') ? vil.health : {};
  const roster = rosterRaw.map((v) => {
    if (typeof v === 'string') return { id: v, name: v, alive: true, hp: (health[v] !== undefined ? health[v] : null) };
    if (v && typeof v === 'object') {
      const id = v.id || v.vid || v.key || null;
      const alive = (v.alive !== undefined) ? !!v.alive : (v.dead !== true);
      let hp = null;
      if (id && health[id] !== undefined) hp = health[id];
      else if (v.hp !== undefined) hp = v.hp;
      else if (v.health !== undefined) hp = v.health;
      return { id, name: v.name || null, alive, hp };
    }
    return { id: null, name: null, alive: false, hp: null };
  });
  let pantryKcal = 0;
  try {
    const pantry = vil.pantry || [];
    for (const it of pantry) pantryKcal += (it.kcalEach || 0) * (it.units || 1);
  } catch (e) {}
  const wmRaw = Array.isArray(st.worldMonsters) ? st.worldMonsters : [];
  const worldMonsters = wmRaw.map((m) => ({
    id: m.id || null, tx: m.tx, ty: m.ty,
    hp: m.hp, maxHp: m.maxHp, veteran: !!m.veteran,
  })).sort((a, b) => String(a.id).localeCompare(String(b.id)) || (a.tx - b.tx) || (a.ty - b.ty));
  let fledKeys = [];
  try {
    const fm = st.fledMonsters || {};
    fledKeys = Object.keys(fm).sort();
  } catch (e) {}
  let faced = {};
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const f = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(f)) faced[k] = f[k] | 0;
  } catch (e) {}
  const kl = Array.isArray(st.waveKillLog) ? st.waveKillLog : [];
  const lastKill = kl.length ? kl[kl.length - 1] : null;
  let px = null, py = null;
  try { px = Game.map ? Game.map.px : null; py = Game.map ? Game.map.py : null; } catch (e) {}
  // Villager node positions (state.village.nodePos, read directly — never
  // Game.npcNode(), which writes a default when absent). Wild encounters
  // need a villager ON a monster's tile, so also record the overlap count:
  // roster villagers whose node equals a roaming monster's tile, excluding
  // the scholar's own tile (villagerMonsterTick skips monsters there).
  let nodePos = {};
  try {
    const np = vil.nodePos || {};
    for (const k of Object.keys(np)) nodePos[k] = { nx: np[k].nx, ny: np[k].ny };
  } catch (e) {}
  let overlap = 0;
  const overlapTiles = [];
  try {
    const monTiles = new Set(wmRaw.map((m) => m.tx + ',' + m.ty));
    for (const rid of Object.keys(nodePos)) {
      const key = nodePos[rid].nx + ',' + nodePos[rid].ny;
      if (key === px + ',' + py) continue;
      if (monTiles.has(key)) { overlap++; overlapTiles.push(rid + '@' + key); }
    }
  } catch (e) {}
  let outdoorCrew = null;
  try { outdoorCrew = Array.isArray(Game._outdoorCrew) ? Game._outdoorCrew.slice() : null; } catch (e) {}
  let shelteredList = [];
  try {
    const sh = vil.sheltered || {};
    shelteredList = Object.keys(sh).filter((rid) => rosterRaw.indexOf(rid) >= 0 && sh[rid]).sort();
  } catch (e) {}
  let restList = [];
  try {
    const rr = Game._postFleeRest || {};
    restList = Object.keys(rr).sort();
  } catch (e) {}
  store.snaps.push({
    day: sch.day || 0, px, py,
    haven: { px: (vil.px !== undefined ? vil.px : null), py: (vil.py !== undefined ? vil.py : null) },
    nodePos, overlap, overlapTiles, outdoorCrew, shelteredList, restList,
    scholar: { name: sch.name || null, hp: sch.health !== undefined ? sch.health : null, kcal: sch.kcal !== undefined ? sch.kcal : null },
    roster, rosterAlive: roster.filter((r) => r.alive).length,
    pantryKcalBucket: Math.round(pantryKcal / 100),
    worldMonsters, fledKeys,
    killLogLen: kl.length,
    lastKill: lastKill ? { d: n0(lastKill.d), mid: lastKill.mid || null, by: lastKill.by || null, via: lastKill.via || null } : null,
    faced,
  });
}

function withS87135TrajDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc, s87135trajStore: st,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { snapTraj(Game, st); } catch (e) { noteErr(st, 'daily.snap', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, withS87135TrajDiag, snapTraj, installS87135TrajTick };
