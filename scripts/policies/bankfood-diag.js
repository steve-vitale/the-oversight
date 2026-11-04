// bankfood-diag — evening bank/flip + morning pack-eat probe
// (sim-bankfood-a, 2026-11-04, flesh-out loop, axis food-economy).
// POLICY-SIDE VARIANT ONLY: zero src/js changes, zero edits to any
// existing policy file. Env-gated: BANKFOOD=1 arms it; unset/0
// delegates to inner.daily/inner.upkeep untouched (the OFF leg runs
// the same stack with BANKFOOD=0).
//
// RECONSTRUCTION NOTE: the 2026-10-31 strandfix2 policy file never
// landed on master, so this wrapper rebuilds its evening/morning
// behavior from its evidence (§Instruments) — it is NOT claimed to
// be byte-identical to strandfix2. What it DOES preserve exactly:
// the stack (bankfood outside warmed(woodcarry(nighttravel))),
// the still-creek-evening gate, the clock bands (bank >= 449,
// flip <= 448 within 80 ticks of 449, else flip-too-far skip),
// the morning stranded gate + single Game.eat(), and the
// never-call list (travelTo, buildBridge, takeWood, cutTree,
// clearBrush). The one deliberate narration change: the flip line
// does NOT carry "What you banked waits for morning" — that clause
// was measured false on 2026-10-31 and must not be repeated until
// banking is proven to survive the night.
//
// MEASUREMENT FIX vs 2026-10-31: pack is snapshotted CANONICALLY
// from Game.state.scholar.inventory at EVERY stage (post-bank,
// first-upkeep-of-new-day = the true post-sleep morning, daily-entry
// morning phase), split into edible-now kcal, gross kcalEach kcal,
// and lump units — so an evening estimate can never again be
// compared against a morning canonical read without the split
// showing. The old arm's evening "packAfter == E" ambiguity (press
// estimate vs inventory) is closed by recording both the press
// inventory-diff totals AND the canonical snapshot side by side.
'use strict';

function leverOn() {
  try { return process.env.BANKFOOD === '1'; } catch (e) { return false; }
}

function newStore() {
  return { mornings: [], evenings: [], firstUpkeeps: [], errs: 0, errors: [] };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function gameOver(Game) {
  try { return !!Game.over; } catch (e) { return false; }
}
function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}
function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}
function dayTicks(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function ticksLeft(Game) {
  try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; return tpd - dayTicks(Game); }
  catch (e) { return null; }
}
function playerWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}
function branchCount(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let n = 0;
    for (const it of inv) if (it && it.material === 'branch') n += (it.units || 0);
    return n;
  } catch (e) { return null; }
}

// Canonical pack snapshot. edibleKcal counts only edible-now food
// (edible !== false, kcalEach > 0); grossKcal counts every kcalEach > 0
// stack regardless of edible flag; lumpUnits counts unknown-lump units
// (kcalEach 0, inedible by construction). A bank that yields only
// unknowns shows edibleKcal 0 AND lumpUnits > 0 — never a bare 0.
function packSnap(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let edibleKcal = 0, grossKcal = 0, lumpUnits = 0;
    const lumpSpoilDays = [];
    const stacks = inv.map((it) => {
      if (!it || typeof it !== 'object') return it;
      const units = (it.units === undefined || it.units === null) ? 1 : it.units;
      const k = it.kcalEach || 0;
      if (k > 0) grossKcal += k * units;
      if (k > 0 && it.edible !== false) edibleKcal += k * units;
      if (it.foodState === 'unknown' && it.lump) { lumpUnits += units; lumpSpoilDays.push(it.spoilDay === undefined ? null : it.spoilDay); }
      return { name: it.name || null, units, kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
        edible: (it.edible === undefined ? null : !!it.edible),
        foodState: it.foodState || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay),
        material: it.material || null, lump: !!it.lump };
    });
    return { edibleKcal: Math.round(edibleKcal), grossKcal: Math.round(grossKcal),
      lumpUnits, lumpSpoilDays, stacks };
  } catch (e) { return { edibleKcal: null, grossKcal: null, lumpUnits: null, lumpSpoilDays: [], stacks: [] }; }
}

// Inventory-diff totals for one forage press (mirrors pressb-diag's
// pressTotals shape, computed locally so no other policy file is
// required): known edible kcal gained, unknown units gained + forms.
function pressTotals(before, after) {
  try {
    const key = (s) => [s.name, s.kcalEach, s.edible, s.foodState].join('|');
    const bmap = {};
    for (const s of before) { if (s && typeof s === 'object') bmap[key(s)] = (bmap[key(s)] || 0) + (s.units || 0); }
    let knownEdibleKcal = 0, unknownUnits = 0;
    const forms = [];
    for (const s of after) {
      if (!s || typeof s !== 'object') continue;
      const gained = (s.units || 0) - (bmap[key(s)] || 0);
      if (gained <= 0) continue;
      if (s.foodState === 'unknown' && s.lump) { unknownUnits += gained; if (s.name && forms.indexOf(s.name) < 0) forms.push(s.name); }
      else if ((s.kcalEach || 0) > 0 && s.edible !== false) knownEdibleKcal += gained * (s.kcalEach || 0);
    }
    return { knownEdibleKcal: Math.round(knownEdibleKcal), unknownUnits, unknownForms: forms };
  } catch (e) { return { knownEdibleKcal: null, unknownUnits: null, unknownForms: [] }; }
}

function blocksCell(Game, cell) {
  try { if (Game && typeof Game.cellProps === 'function') return !!Game.cellProps(cell).blocks; } catch (e) {}
  return cell === 'wall' || cell === 'water' || cell === 'tree' || cell === 'bigtree' || cell === 'tent' || cell === 'fire';
}

// BFS gather target: nearest tree/bigtree cell with a walkable adjacent
// stance, over the occupied tile's own 9x9 detail grid. Returns
// { target: {x,y,cell}, stance: [x,y], path: [[x,y],...] } or null.
function findGatherTarget(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const sx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const sy = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
    const key = (x, y) => x + ',' + y;
    const dist = {}, prev = {};
    dist[key(sx, sy)] = 0; prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!inB(nx, ny) || (key(nx, ny) in dist)) continue;
        const cell = detail[ny] && detail[ny][nx];
        if (blocksCell(Game, cell)) continue;
        dist[key(nx, ny)] = dist[key(x, y)] + 1;
        prev[key(nx, ny)] = [x, y];
        q.push([nx, ny]);
      }
    }
    let best = null;
    for (let ty = 0; ty < 9; ty++) for (let tx = 0; tx < 9; tx++) {
      const cell = detail[ty] && detail[ty][tx];
      if (cell !== 'tree' && cell !== 'bigtree') continue;
      let stance = null, stanceDist = null;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = tx + dx, cy = ty + dy;
        if (!inB(cx, cy)) continue;
        const k = key(cx, cy);
        if (!(k in dist)) continue;
        if (stanceDist === null || dist[k] < stanceDist) { stance = [cx, cy]; stanceDist = dist[k]; }
      }
      if (stance === null) continue;
      const cand = { target: { x: tx, y: ty, cell }, stance, pathLen: stanceDist };
      if (!best || cand.pathLen < best.pathLen ||
        (cand.pathLen === best.pathLen && cand.target.cell === 'bigtree' && best.target.cell !== 'bigtree') ||
        (cand.pathLen === best.pathLen && cand.target.cell === best.target.cell &&
          (ty < best.target.y || (ty === best.target.y && tx < best.target.x)))) best = cand;
    }
    if (!best) return null;
    const path = [];
    let cur = best.stance;
    while (cur && !(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
    return { target: best.target, stance: best.stance, path };
  } catch (e) { return null; }
}

function doForagePress(Game, store) {
  const before = packSnap(Game);
  const kcalBefore = scholarKcal(Game), ticksBefore = dayTicks(Game);
  let pressErr = null, retNull = null;
  try { const ret = Game.doAction('forage'); retNull = (ret === null || ret === undefined); }
  catch (e) { pressErr = String((e && (e.message || e)) || e).slice(0, 300); }
  const after = packSnap(Game);
  const totals = pressTotals(before.stacks, after.stacks);
  return { kind: 'forage', kcalBefore, kcalAfter: scholarKcal(Game),
    ticksBefore, ticksAfter: dayTicks(Game), err: pressErr, retNull,
    Eknown: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits,
    unknownForms: totals.unknownForms,
    packEdibleBefore: before.edibleKcal, packEdibleAfter: after.edibleKcal,
    lumpUnitsBefore: before.lumpUnits, lumpUnitsAfter: after.lumpUnits };
}

// Stranding decisions (pure, unit-tested). ADDENDUM 2026-11-04: the
// pilot proved the old woodcarry-bucket gate never fires on current
// master, while genuinely stranded out-of-reach creek-tile evenings
// DO occur (seed 15003, 9 nights). Stranding is therefore read
// directly off the nighttravel outcome + away position, with the
// woodcarry bucket recorded when present but never required.
// Input o: { gameOver, combatLive, ntOutcome, tileType, insideHaven }.
// Returns { fire: true } or { fire: false, skip: reason }.
function strandedEveningDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.ntOutcome === 'travel-refused' || o.ntOutcome === 'out-of-reach')) {
    return { fire: false, skip: 'not-stranded' };
  }
  if (o.tileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-evening' };
  return { fire: true };
}
function strandedMorningDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.ntOutcome === 'travel-refused' || o.ntOutcome === 'out-of-reach')) {
    return { fire: false, skip: 'prev-not-stranded' };
  }
  if (o.tileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  return { fire: true };
}

function withBankfood(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'bankfood',
    desc: 'nighttravel + woodcarry + woodwarm + evening bank/flip + morning pack-eat probe (BANKFOOD=1)',
    upkeep(Game, ctx) {
      if (!leverOn()) return inner.upkeep ? inner.upkeep(Game, ctx) : undefined;
      // True post-sleep snapshot: the FIRST upkeep call of a new scholar
      // day runs before any upkeep eat, after sleep/wait rolled the day.
      try {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (st._lastUpkeepDay !== day) {
          st._lastUpkeepDay = day;
          st.firstUpkeeps.push({ scholarDay: day, afterDailyCalls: call,
            kcal: scholarKcal(Game), dayTicks: dayTicks(Game), pack: packSnap(Game) });
        }
      } catch (e) { noteErr(st, 'firstUpkeep', e); }
      return inner.upkeep ? inner.upkeep(Game, ctx) : undefined;
    },
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      // ---- MORNING PHASE (before inner.daily; prev evening from ctx) ----
      // Previous loop-day's nighttravel record: _ntLast is set at
      // evening time only, so at daily start it still holds yesterday's.
      try {
        let prevNt = null, prevWc = null;
        try { prevNt = (ctx && ctx._ntLast) || null; } catch (e) { prevNt = null; }
        try { prevWc = (ctx && ctx._wcLast) || null; } catch (e) { prevWc = null; }
        let wakeTileType = null;
        try { const t = Game.playerTile(); wakeTileType = t ? (t.type || null) : null; } catch (e) {}
        const sch = (Game.state || {}).scholar || {};
        const insideHaven = (sch.insideHaven === undefined ? null : !!sch.insideHaven);
        const gate = strandedMorningDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          ntOutcome: prevNt ? prevNt.outcome : null,
          tileType: wakeTileType, insideHaven,
        });
        if (!gate.fire) {
          st.mornings.push({ loopDay, skip: gate.skip,
            prevLoopDay: loopDay - 1,
            prevOutcome: prevNt ? prevNt.outcome : null,
            prevBucket: prevWc ? prevWc.bucket : null, prevRescued: prevWc ? prevWc.rescued : null,
            wakeTileType, insideHaven });
        } else {
          const wakeTile = (Game.map ? (Game.map.px + ',' + Game.map.py) : null);
          const kcalBefore = scholarKcal(Game);
          const packBefore = packSnap(Game);
          const ticksLeftBefore = ticksLeft(Game);
          let ate = false, eatErr = null;
          if (packBefore.edibleKcal > 0) {
            try { Game.eat(); ate = true; } catch (e) { eatErr = String((e && (e.message || e)) || e).slice(0, 300); }
          }
          st.mornings.push({ loopDay, ate, eatErr, prevLoopDay: loopDay - 1,
            prevOutcome: prevNt ? prevNt.outcome : null,
            prevBucket: prevWc ? prevWc.bucket : null, prevRescued: prevWc ? prevWc.rescued : null,
            wakeTileType, insideHaven, wakeTile,
            kcalBefore, kcalAfterEat: scholarKcal(Game),
            packBefore, packAfter: packSnap(Game),
            ticksLeftBefore, skip: packBefore.edibleKcal > 0 ? null : 'no-pack-food' });
        }
      } catch (e) { noteErr(st, 'morning', e); }
      // ---- INNER DAY (competent + nighttravel + woodcarry + woodwarm) ----
      if (inner.daily) inner.daily(Game, ctx);
      if (gameOver(Game) || combatLive(Game)) return;
      // ---- EVENING PHASE (after inner.daily; stranded-away evenings only, addendum 2026-11-04) ----
      try {
        let wc = null, nt = null;
        try { wc = (ctx && ctx._wcLast) || null; } catch (e) { wc = null; }
        try { nt = (ctx && ctx._ntLast) || null; } catch (e) { nt = null; }
        let eveTileType = null, eveInsideHaven = null;
        try { const t = Game.playerTile(); eveTileType = t ? (t.type || null) : null; } catch (e) {}
        try { eveInsideHaven = ((Game.state || {}).scholar || {}).insideHaven; } catch (e) {}
        const eveGate = strandedEveningDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          ntOutcome: nt ? nt.outcome : null,
          tileType: eveTileType, insideHaven: eveInsideHaven === true,
        });
        if (!eveGate.fire) return;
        const clock = dayTicks(Game);
        const rec = { loopDay, mode: null, skip: null, needed: null,
          ntOutcome: nt ? nt.outcome : null,
          wcBucket: wc ? wc.bucket : null, wcRescued: wc ? wc.rescued : null,
          clockBefore: clock, woodBefore: playerWood(Game), kcalBefore: scholarKcal(Game),
          branchesBefore: branchCount(Game), packBefore: packSnap(Game),
          actions: [], clockAfter: null, woodAfter: null, kcalAfter: null,
          branchesAfter: null, packAfter: null, flipped: false, sayLine: null };
        if (clock >= 449) {
          rec.mode = 'bank';
          for (let i = 0; i < 2; i++) rec.actions.push(doForagePress(Game, st));
        } else if (449 - clock <= 80) {
          rec.mode = 'flip';
          rec.needed = 449 - clock;
          const tgt = findGatherTarget(Game);
          if (!tgt) { rec.skip = 'no-gather-target'; }
          else {
            // Walk to the stance via the engine's own path verbs.
            let pth = null;
            try { pth = Game.beginPathWalk(tgt.stance[0], tgt.stance[1]); } catch (e) { pth = null; }
            const steps = [];
            if (pth) {
              for (const [sx2, sy2] of pth) {
                let ok = false;
                try { ok = !!Game.pathStep(sx2, sy2); } catch (e) { ok = false; }
                steps.push({ to: sx2 + ',' + sy2, ok });
                if (!ok || combatLive(Game)) break;
              }
            }
            rec.actions.push({ kind: 'walk', target: tgt.target, stance: tgt.stance, steps, walkStop: combatLive(Game) ? 'combat' : null });
            if (!combatLive(Game)) {
              let gathers = 0;
              while (branchCount(Game) < 2 && gathers < 4 && !combatLive(Game)) {
                const bBefore = branchCount(Game), kBefore = scholarKcal(Game), tBefore = dayTicks(Game);
                let gErr = null;
                try { Game.gatherFallen(tgt.target.x, tgt.target.y); } catch (e) { gErr = String((e && (e.message || e)) || e).slice(0, 120); }
                rec.actions.push({ kind: 'gather', target: tgt.target,
                  kcalBefore: kBefore, kcalAfter: scholarKcal(Game),
                  ticksBefore: tBefore, ticksAfter: dayTicks(Game),
                  branchesBefore: bBefore, branchesAfter: branchCount(Game), err: gErr });
                gathers++;
                if (gErr) break;
              }
              let presses = 0;
              while (dayTicks(Game) < 449 && presses < 3 && !combatLive(Game)) {
                rec.actions.push(doForagePress(Game, st));
                presses++;
              }
              rec.flipped = dayTicks(Game) >= 449;
            }
          }
        } else {
          rec.mode = 'skip'; rec.skip = 'flip-too-far'; rec.needed = 449 - clock;
        }
        rec.clockAfter = dayTicks(Game); rec.woodAfter = playerWood(Game);
        rec.kcalAfter = scholarKcal(Game); rec.branchesAfter = branchCount(Game);
        rec.packAfter = packSnap(Game);
        if ((rec.mode === 'bank' || rec.mode === 'flip') && !rec.skip && rec.actions.length) {
          const g = rec.actions.filter((a) => a.kind === 'gather').length;
          const f = rec.actions.filter((a) => a.kind === 'forage').length;
          try {
            Game.say(`You work late at the creek — ${g} deadfall gathers and ${f} forages — until the night is too far gone for real sleep.`);
            rec.sayLine = 'late-work-line';
          } catch (e) { /* narration must never break the record */ }
          rec.packAfter = packSnap(Game);
        }
        st.evenings.push(rec);
      } catch (e) { noteErr(st, 'evening', e); }
    },
  });
}

module.exports = { withBankfood, newStore, packSnap, pressTotals, findGatherTarget, strandedEveningDecision, strandedMorningDecision };
