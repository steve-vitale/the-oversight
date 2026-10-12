'use strict';
// hunt-hook.js — competent-player hunting bootstrap for the knowledge sweep
// (longsim knowledge r6, 2026-10-12).
//
// The blank: 0 meat tastings in 3x40d sims (r3's "animal codex depth 0
// entries" — input problem, verified on current master). Diagnosis, from
// the harness side:
//   - the competent policy's full trapline machinery EXISTS (workTrapline
//     craft/set, cleanCatch, cookPack, eat) but never fires: snare recipe
//     stays L0 forever (no button at L0), so craft() refuses, so no trap
//     is ever set, so the "first witnessed catch grants L1" bootstrap can
//     never run (circular).
//   - the game's intended bootstrap is the field shelf (2026-10-10):
//     wild-ruin scavenging can yield trappers_handbook (snare L3 on read)
//     or the day-24 trial pamphlet. The policy never reads books and never
//     scavenges ruins (forageTripSeedFirst skips t.type === 'ruin'), so the
//     bootstrap is dead in sims but reachable in real play.
// The hook models the competent player who (a) reads found books ("Read it
// from your pack"), and (b) scavenges wild ruins — somebody's camp out here,
// the game's own field-shelf fiction — while the snare recipe is unknown.
//
// Game code is untouched. The hook's own decisions are deterministic; the
// game's internal rolls (book 30%, field-shelf 50%, craft 85%, trap catch
// 40%...) are honest RNG. Env gate: HUNT_HOOK=1 enables (off = r1-r5
// behavior, zero meat input).
//
// Usage: const { huntRound } = require('./hunt-hook');
//        huntRound(Game, K)  // K = sweep instrumentation bucket (optional)
function huntRound(Game, K) {
  const k = K || {};
  const bump = (o, key) => { o[key] = (o[key] || 0) + 1; };
  let acted = 0;
  try {
    const s = Game.state.scholar || {};
    const inv = s.inventory || [];
    // 1. READ FOUND BOOKS (competent: a book that says "Read it" gets read).
    try {
      const books = inv.filter(i => i && i.bookId);
      for (const b of books) {
        if (Game.readBook) {
          try { if (Game.readBook(b.bookId)) { bump(k, 'huntBooksRead'); acted++; } } catch (e) {}
        }
      }
    } catch (e) {}
    // 2. WILD-RUIN SCAVENGING while the snare recipe is unknown. The field
    // shelf (2026-10-10) stocks wild ruins with trap manuals. Throttled:
    // at most one ruin run per 3 days, only while the recipe is L0 and no
    // trap is held. HUNT_DEBUG=1 narrates the attempt on stderr.
    // (Does not return early — the knife check below runs regardless.)
    try {
      const dbg = process.env.HUNT_DEBUG === '1' ? (m) => { try { process.stderr.write('[hunt-hook] ' + m + '\n'); } catch (e) {} } : () => {};
      const rk = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
      const heldTrap = ((s.tools || []).some(t => t && /snare|deadfall|box_trap|pit_trap/.test(t.recipeId || '')));
      const day = s.day || 0;
      const last = k._lastRuinDay || 0;
      if (rk < 1 && !heldTrap && !(day - last < 3)) {
        // find a ruin among travel targets (d<=3 honest walk)
        const tts = (Game.travelTargets && Game.travelTargets()) || [];
        let ruin = null;
        for (const tt of tts) {
          try {
            const t = Game.tileAt(tt.x, tt.y);
            if (t && t.type === 'ruin') { ruin = tt; break; }
          } catch (e) {}
        }
        if (!ruin) { dbg(`day=${day} no ruin in ${tts.length} targets`); }
        else {
          const hx = Game.map.px, hy = Game.map.py;
          let res = null;
          try { res = Game.travelTo(ruin.x, ruin.y); } catch (e) { dbg(`day=${day} travelTo threw`); }
          if (!Game.over && !Game.tbfight && Game.map.px === ruin.x && Game.map.py === ruin.y) {
            // scavenging a ruin = foraging it (the game's own verb — the forage
            // function handles ruin loot + the field-shelf book check)
            try {
              const ok = Game.doAction('forage', {});
              dbg(`day=${day} scavenged ruin ok=${!!ok}`);
              if (ok) { bump(k, 'huntRuinScavenges'); acted++; }
            } catch (e) { dbg(`day=${day} forage threw ${String(e).slice(0, 80)}`); }
            try { Game.travelTo(hx, hy); } catch (e) {}
            k._lastRuinDay = day;
          } else {
            dbg(`day=${day} travelTo landed ${Game.map.px},${Game.map.py} not ${ruin.x},${ruin.y}`);
            try { Game.travelTo(hx, hy); } catch (e) {}
          }
        }
      }
    } catch (e) {}
    // 3. THE KNIFE (the trapline's missing half): no blade, no cleaned
    // meat, no tastings. The stone knife is universal (L3 for everyone).
    try { ensureKnife(Game, K); } catch (e) {}
    // 4. STAFF HUNTERS: the village hunt is the r6 lever's input — without
    // assigned hunters, villagerHuntResolve never runs in sims.
    try { staffHunters(Game, K); } catch (e) {}
  } catch (e) {}
  return acted;
}

// positionSweep: center the forage sweep where a competent player would
// stand. The game's own UI affordance is tap-the-cell (doAction('forage',
// {cx, cy}) centers the 3x3 sweep on the tapped cell, steps are free).
// The bare doAction('forage', {}) harness call sweeps wherever the travel
// arrival left the player — usually grass/dirt at the tile edge — so
// bush/tree cells (vine/stick materials) are almost never swept. This
// scans the visible detail grid (what the player SEES on the 9x9) and steps
// to the 3x3 center richest in forageable cells. Deterministic, zero RNG,
// no ticks. Wild tiles only.
function positionSweep(Game) {
  try {
    const t = Game.playerTile ? Game.playerTile() : null;
    if (!t || t.type === 'haven' || t.type === 'ruin') return false;
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    if (!detail) return false;
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    let best = null, bestScore = -1;
    for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
      let score = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x > 8 || y < 0 || y > 8) continue;
        const c = detail[y] && detail[y][x];
        if (!FORAGEABLE[c]) continue;
        if (t.detailRegrow && t.detailRegrow[x + ',' + y]) continue;
        score += (c === 'bush' || c === 'tree' || c === 'bigtree') ? 2 : 1;
      }
      if (score > bestScore) { bestScore = score; best = { cx, cy }; }
    }
    if (!best || bestScore <= 0) return false;
    const s = Game.state.scholar || {};
    if (s.mx === best.cx && s.my === best.cy) return true;
    s.mx = best.cx; s.my = best.cy;
    return true;
  } catch (e) { return false; }
}

// ensureKnife: the trapline needs a blade, and the stone knife is the
// game's universal answer (everyone's L3). The policy's stoneRun expedition
// finds rubble via the directional travelBlockage (which misses rubble
// unless you approach from the blocked side), so it walks the frontier
// daily and never finds stone. This scans the visible map directly for
// rubble tiles (player-visible geography, honest), walks to the guarded
// side, and clears it — the same clearBlockage the game offers. Throttled:
// only while knifeless and stone<1, at most once per 5 days.
function ensureKnife(Game, K) {
  const k = K || {};
  const bump = (o, key) => { o[key] = (o[key] || 0) + 1; };
  const dbg = process.env.HUNT_DEBUG === '1' ? (m) => { try { process.stderr.write('[ensureKnife] ' + m + '\n'); } catch (e) {} } : () => {};
  try {
    if (Game.hasCuttingTool && Game.hasCuttingTool()) return false;
    const inv = (Game.state.scholar.inventory || []);
    const stone = inv.filter(i => i && i.material === 'stone').reduce((t, i) => t + (i.units || 0), 0);
    if (stone >= 1) {
      // have stone + vine? knap the knife now (the policy's keepKnife runs
      // in daily, but this is the hook's own guarantee)
      const vine = inv.filter(i => i && i.material === 'vine').reduce((t, i) => t + (i.units || 0), 0);
      if (vine >= 1) {
        try { if (Game.craft('stone_knife')) { bump(k, 'huntKnivesKnapped'); return true; } } catch (e) {}
      }
      return false;
    }
    const s = Game.state.scholar || {};
    const day = s.day || 0;
    if ((k._lastStoneDay || 0) > 0 && day - k._lastStoneDay < 5) return false;
    // direct map scan for rubble (not the directional travelBlockage).
    // Try each rubble tile (nearest first) — some are behind uncrossable
    // creeks.
    const rubbleTiles = [];
    const hx0 = Game.map.px, hy0 = Game.map.py;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      let t = null;
      try { t = Game.tileAt(x, y); } catch (e) {}
      if (!t || !t.blockFrom || t.blockFrom.type !== 'rubble') continue;
      rubbleTiles.push({ x, y, d: Math.abs(x - hx0) + Math.abs(y - hy0) });
    }
    rubbleTiles.sort((a, b) => a.d - b.d);
    if (!rubbleTiles.length) { dbg('no rubble on map'); return false; }
    // The blockage is directional (guards one side). Walk onto the tile
    // from a CLEAR side, then clear it — clearBlockage doesn't care which
    // side you're on, only that the tile has a blockage. Try each rubble
    // tile until one works.
    const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const hx = Game.map.px, hy = Game.map.py;
    // walkToClear: honest walk that clears clearable blockages like a real
    // player would (chop the fallen tree, clear the rubble). Returns true
    // when the destination is reached.
    const walkToClear = (tx, ty) => {
      let guard = 0;
      while ((Game.map.px !== tx || Game.map.py !== ty) && guard++ < 15 && !Game.over && !Game.tbfight) {
        let bt = null, bdd = 1e9;
        for (const tt of (Game.travelTargets() || [])) {
          const d = Math.abs(tt.x - tx) + Math.abs(tt.y - ty);
          if (d < bdd) { bdd = d; bt = tt; }
        }
        if (!bt) { dbg('no hop target'); return false; }
        const px0 = Game.map.px, py0 = Game.map.py;
        let res = null;
        try { res = Game.travelTo(bt.x, bt.y); } catch (e) { dbg('travelTo threw'); return false; }
        if (Game.map.px === px0 && Game.map.py === py0) {
          // refused — if it's a clearable blockage, clear it and retry
          const block = res && res.blockType ? res : null;
          if (block && (block.blockType === 'fallen_tree' || block.blockType === 'rubble')) {
            dbg(`clearing ${block.blockType} at ${block.x},${block.y}`);
            try { Game.clearBlockage(block.x, block.y); } catch (e) {}
            continue;
          }
          dbg(`travelTo refused ${bt.x},${bt.y} (block: ${block ? block.blockType : '?'})`);
          return false;
        }
      }
      return Game.map.px === tx && Game.map.py === ty;
    };
    for (const rt of rubbleTiles) {
      const best = { x: rt.x, y: rt.y };
      let entry = null;
      for (const [dx, dy] of SIDES) {
        const fx = best.x + dx, fy = best.y + dy;
        if (fx < 0 || fy < 0 || fx > 8 || fy > 8) continue;
        let b = null;
        try { b = Game.travelBlockage(best.x, best.y, fx, fy); } catch (e) {}
        if (!b) { entry = { x: fx, y: fy }; break; }
      }
      if (!entry) { dbg(`no clear approach to rubble ${best.x},${best.y}`); continue; }
      dbg(`rubble at ${best.x},${best.y}, entering from ${entry.x},${entry.y}`);
      let cleared = false;
      try {
        if (!walkToClear(entry.x, entry.y)) { dbg('walk to entry failed'); continue; }
        try { Game.travelTo(best.x, best.y); } catch (e) {}
        if (Game.map.px !== best.x || Game.map.py !== best.y) { dbg('step onto rubble failed'); continue; }
        const invB = (Game.state.scholar.inventory || []);
        const before = invB.filter(i => i && i.material === 'stone').reduce((t, i) => t + (i.units || 0), 0);
        try { Game.clearBlockage(best.x, best.y); } catch (e) { dbg('clearBlockage threw'); continue; }
        const inv2 = (Game.state.scholar.inventory || []);
        const after = inv2.filter(i => i && i.material === 'stone').reduce((t, i) => t + (i.units || 0), 0);
        if (after > before) bump(k, 'huntStoneRuns');
        dbg(`cleared: stone ${before}->${after}`);
        k._lastStoneDay = day;
        cleared = true;
        // knap the knife now if we have vine
        const vine = inv2.filter(i => i && i.material === 'vine').reduce((t, i) => t + (i.units || 0), 0);
        if (after >= 1 && vine >= 1) {
          try { if (Game.craft('stone_knife')) { bump(k, 'huntKnivesKnapped'); dbg('knapped stone knife'); } } catch (e) {}
        }
      } finally {
        try { if (!Game.over && !Game.tbfight) Game.travelTo(hx, hy); } catch (e) {}
      }
      if (cleared) return true;
    }
    return false;
  } catch (e) { return false; }
}

// staffHunters: a competent village leader puts hunters on the hunt duty.
// The village's hunt resolves REAL animals (villagerHuntResolve) — the
// r6 lever records the species village-side, and the fire teaches the
// player. Without assigned hunters, the lever has no input in sims.
// Prefers hunter/tracker/outdoors occupations. Caps at 2 hunters.
function staffHunters(Game, K) {
  const k = K || {};
  const bump = (o, key) => { o[key] = (o[key] || 0) + 1; };
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    let hunters = 0;
    for (const id of Object.keys(asg)) {
      try { if ((asg[id] && asg[id].task) === 'hunt') hunters++; } catch (e) {}
    }
    if (hunters >= 2) return;
    // free villagers (not assigned, not the player, alive, at haven)
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const free = roster.filter(id => {
      try {
        if ((asg[id] && asg[id].task)) return false;
        if (v.away && v.away[id]) return false;
        return true;
      } catch (e) { return false; }
    });
    if (!free.length) return;
    const score = (id) => {
      let s = 0;
      try {
        const p = (Game.getPerson && Game.getPerson(id)) || {};
        const occ = String(p.formerOccupation || '').toLowerCase();
        if (/hunter|tracker|trapper|scout|ranger/.test(occ)) s += 3;
        else if (/forager|fisher|farmer|outdoors|guide/.test(occ)) s += 1;
      } catch (e) {}
      return s;
    };
    free.sort((a, b) => score(b) - score(a));
    // only staff if there's at least a mildly suitable candidate, or the
    // pantry is low (hunger staffs anyone)
    let pantryKcal = 0;
    try { pantryKcal = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) {}
    const best = free[0];
    if (score(best) >= 1 || pantryKcal < 15000) {
      try {
        if (Game.assignTask) { Game.assignTask(best, 'hunt', { via: 'in-person' }); bump(k, 'huntStaffed'); }
      } catch (e) {}
    }
  } catch (e) {}
}

module.exports = { huntRound, positionSweep, ensureKnife, staffHunters };
