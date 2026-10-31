// strandfix2-diag — evening flip-bank + morning pack-eat (FLIPBANK)
// (sim-strandfix2-b, 2026-10-31, flesh-out loop B, axis food-economy).
// POLICY-SIDE VARIANT ONLY: zero src/js changes, zero edits to any
// existing policy file (pressb-diag.js helpers are REQUIRED, never
// edited). Env-gated: STRANDFIX2=1 arms it; unset/0 delegates to
// inner.daily untouched (the OFF leg runs the same stack with
// STRANDFIX2=0).
//
// BEHAVIOR (exact, pre-registered in
// evidence/2026-10-31/sim-strandfix2-b-prereg.md — no mid-run swaps):
// The wrapper sits OUTSIDE the warmed stack:
//   strandfix2(warmed(woodcarry(nighttravel))).
// MORNING (before inner.daily, stranded morning gate exactly as prior
// strand arms: previous evening still-creek, wake not at haven, not
// game-over, not combat): if pack food kcal > 0 and ticksLeft >= 1,
// call Game.eat() ONCE (1 tick) and record realized net. NOTHING ELSE
// in the morning: no walk, no forage, no fell, no brush — position is
// preserved exactly, so the routine's walk and the morning press cell
// are the control leg's own.
// EVENING (after inner.daily returns, i.e. after woodcarry's bridge
// decision AND woodwarm's warmth fire, on a still creek evening only:
// ctx._wcLast outcome travel-refused, bucket creek, rescued false;
// not game-over, not combat, not in tent, not at haven): the bridge
// has already failed, so spending ticks now cannot hurt that evening.
// It can change tomorrow, through the waitsalign 448 line (sleep
// accepted at clock <= 448 -> tomorrow cramped 384 used / 128 left;
// sleep refused at clock >= 449 -> tomorrow roomy 256 used / 256
// left):
//   - clock >= 449: skip 'already-flipped', except the LAST-LIGHT
//     BANK: if ticksLeft >= 17, up to 2 forages (or a short walk +
//     forage within budget, final clock <= 505) bank pack food.
//   - clock <= 448 and needed = 449 - clock <= 80: FLIP-BANK. Actions
//     until clock >= 449 or 5 verbs spent: first, while branches < 2,
//     BFS-walk (occupied tile's own detail grid, morning-b
//     precedent) to a tree/bigtree/bush/thicket stance and
//     gatherFallen (16 ticks, 10 kcal, NO tool gate — deadfall is
//     always available); branches >= 2 makes the NEXT night's
//     warmth fire MISS ('branches-available'), so warmth cannot
//     spend a bridge log that night. Then forage presses (16 ticks
//     each) banking pack food for tomorrow morning.
//   - clock <= 448 and needed > 80: skip 'flip-too-far' (an 8+
//     forage evening is fiction-breaking and stock-limited).
// Every evening act carries ONE honest say line naming what was done
// and whether the night flipped, banked only, or fell short. The
// wrapper NEVER calls travelTo, buildBridge, takeWood, cutTree, or
// clearBrush, and writes game state only through microMove,
// gatherFallen, doAction('forage'), and eat. It draws NO RNG itself
// (BFS/verb order fixed; forage/gather lotteries are the engine's
// own). Recording errors are counted in store.errs, never thrown.
'use strict';

const { pressTotals } = require('./pressb-diag');

const FLIP_LINE = 448;
const MAX_FLIP_SPEND = 80;
const MAX_FLIP_VERBS = 5;
const MAX_BANK_FORAGES = 2;
const BANK_CLOCK_CAP = 505;

function leverOn() {
  try { return process.env.STRANDFIX2 === '1'; } catch (e) { return false; }
}

function newStore() {
  return { mornings: [], evenings: [], errs: 0, errors: [] };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* counting must never throw; errs already counted where possible */ }
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

// Pure stranded-morning gate (unit-tested). Input o:
// { gameOver, combatLive, prevOutcome, prevBucket, prevRescued,
//   wakeTileType, insideHaven }.
function strandDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.prevOutcome === 'travel-refused' && o.prevBucket === 'creek' && o.prevRescued === false)) {
    return { fire: false, skip: 'prev-not-stranded' };
  }
  if (o.wakeTileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  return { fire: true };
}

// Pure evening flip decision (unit-tested). clock = dayTicks at the
// post-warmth still-evening moment.
function flipDecision(clock) {
  if (clock === null || clock === undefined) return { mode: 'skip', skip: 'clock-unknown' };
  if (clock >= 449) return { mode: 'bank', needed: 0 };
  const needed = 449 - clock;
  if (needed > MAX_FLIP_SPEND) return { mode: 'skip', skip: 'flip-too-far', needed };
  return { mode: 'flip', needed };
}

function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}

function dayTicks(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}

function ticksLeft(Game) {
  try {
    const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
    return tpd - dayTicks(Game);
  } catch (e) { return null; }
}

function playerWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

function branchCount(Game) {
  try { return (typeof Game.materialCount === 'function') ? Game.materialCount('branch') : null; } catch (e) { return null; }
}

function packFoodKcal(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let sum = 0;
    for (const it of inv) {
      const k = (it && it.kcalEach) || 0;
      if (k > 0) sum += k * ((it.units === undefined || it.units === null) ? 1 : it.units);
    }
    return Math.round(sum);
  } catch (e) { return null; }
}

function snapInventory(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      return { plantId: it.plantId || null, name: it.name || null, units: it.units || null,
        kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
        edible: (it.edible === undefined ? null : !!it.edible),
        foodState: it.foodState || null, material: it.material || null };
    });
  } catch (e) { return []; }
}

function blocksCell(Game, cell) {
  try {
    if (Game && typeof Game.cellProps === 'function') return !!Game.cellProps(cell).blocks;
  } catch (e) { /* fall through to the static set */ }
  return cell === 'wall' || cell === 'water' || cell === 'tree' || cell === 'bigtree' || cell === 'tent' || cell === 'fire';
}

function isGatherCell(cell) {
  return cell === 'tree' || cell === 'bigtree' || cell === 'bush' || cell === 'thicket';
}

function kindRank(cell) {
  if (cell === 'bigtree') return 0;
  if (cell === 'tree') return 1;
  if (cell === 'bush') return 2;
  return 3; // thicket
}

// Pure BFS gather-target choice (unit-tested). grid: 9x9 detail rows;
// start: [mx, my]; blocks: (cell) => boolean. Returns
// { target: {x, y, cell}, stance: [x, y], path } (path excludes start;
// empty = already adjacent/standing on a gatherable cell) or null.
function findGatherTarget(grid, start, blocks) {
  const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
  const key = (x, y) => x + ',' + y;
  const [sx, sy] = start;
  if (!inB(sx, sy)) return null;
  const dist = {};
  const prev = {};
  dist[key(sx, sy)] = 0;
  prev[key(sx, sy)] = null;
  const q = [[sx, sy]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, 1]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!inB(nx, ny) || (key(nx, ny) in dist)) continue;
      const cell = grid[ny] && grid[ny][nx];
      if (blocks(cell)) continue;
      dist[key(nx, ny)] = dist[key(x, y)] + 1;
      prev[key(nx, ny)] = [x, y];
      q.push([nx, ny]);
    }
  }
  let best = null;
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 9; tx++) {
      const cell = grid[ty] && grid[ty][tx];
      if (!isGatherCell(cell)) continue;
      let stance = null, stanceDist = null;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx = tx + dx, cy = ty + dy;
          if (!inB(cx, cy)) continue;
          const k = key(cx, cy);
          if (!(k in dist)) continue;
          if (stanceDist === null || dist[k] < stanceDist) { stance = [cx, cy]; stanceDist = dist[k]; }
        }
      }
      if (stance === null) continue;
      const cand = { target: { x: tx, y: ty, cell }, stance, pathLen: stanceDist };
      if (!best || cand.pathLen < best.pathLen ||
        (cand.pathLen === best.pathLen && kindRank(cell) < kindRank(best.target.cell)) ||
        (cand.pathLen === best.pathLen && kindRank(cell) === kindRank(best.target.cell) &&
          (ty < best.target.y || (ty === best.target.y && tx < best.target.x)))) {
        best = cand;
      }
    }
  }
  if (!best) return null;
  const path = [];
  let cur = best.stance;
  while (cur && !(cur[0] === sx && cur[1] === sy)) {
    path.unshift(cur);
    cur = prev[key(cur[0], cur[1])];
  }
  return { target: best.target, stance: best.stance, path };
}

function withStrandfix2(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'strandfix2',
    desc: 'nighttravel + woodcarry + woodwarm + evening flip-bank + morning pack-eat on strand days (STRANDFIX2=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      // ---- MORNING PHASE (before inner.daily) ----
      let prev = null;
      try { prev = (ctx && ctx._wcLast) || null; } catch (e) { prev = null; }
      try {
        const sch = (Game.state || {}).scholar || {};
        let wakeTileType = null;
        try { const t = Game.playerTile(); wakeTileType = t ? (t.type || null) : null; } catch (e) { noteErr(st, 'morning.tile', e); }
        const insideHaven = (sch.insideHaven === undefined ? null : !!sch.insideHaven);
        const gate = strandDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          prevOutcome: prev ? prev.outcome : null,
          prevBucket: prev ? prev.bucket : null,
          prevRescued: prev ? prev.rescued : null,
          wakeTileType, insideHaven,
        });
        if (!gate.fire) {
          st.mornings.push({ loopDay, skip: gate.skip,
            prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
            wakeTileType, insideHaven });
        } else {
          const kcalBefore = scholarKcal(Game);
          const tlBefore = ticksLeft(Game);
          const packBefore = packFoodKcal(Game);
          let eatErr = null, ate = false;
          if (packBefore !== null && packBefore > 0 && tlBefore !== null && tlBefore >= 1) {
            try { Game.eat(); ate = true; } catch (e) { eatErr = String((e && (e.message || e)) || e).slice(0, 300); }
          }
          st.mornings.push({ loopDay, ate, eatErr,
            prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
            wakeTileType, insideHaven, wakeTile: (Game.map ? (Game.map.px + ',' + Game.map.py) : null),
            kcalBefore, kcalAfterEat: scholarKcal(Game), realizedNet: scholarKcal(Game) - kcalBefore,
            packBefore, packAfter: packFoodKcal(Game),
            ticksLeftBefore: tlBefore,
            ticksSpent: (tlBefore === null || ticksLeft(Game) === null) ? null : (tlBefore - ticksLeft(Game)),
            skip: ate ? null : (packBefore !== null && packBefore <= 0 ? 'no-pack-food' : 'ticks-short') });
        }
      } catch (e) { noteErr(st, 'morning', e); }
      // ---- INNER DAY (competent + night step + bridge + warmth) ----
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      // ---- EVENING PHASE (after inner.daily) ----
      try {
        const wcl = (ctx && ctx._wcLast) || {};
        const sch = (Game.state || {}).scholar || {};
        const tileType = (() => { try { const t = Game.playerTile(); return t ? (t.type || null) : null; } catch (e) { return null; } })();
        const atHaven = sch.insideHaven === true || tileType === 'haven';
        const inTent = !!sch.insideTent;
        if (gameOver(Game)) {
          st.evenings.push({ loopDay, skip: 'game-over', clockBefore: dayTicks(Game) });
        } else if (combatLive(Game)) {
          st.evenings.push({ loopDay, skip: 'combat', clockBefore: dayTicks(Game) });
        } else if (!(wcl.outcome === 'travel-refused' && wcl.bucket === 'creek' && wcl.rescued === false)) {
          st.evenings.push({ loopDay, skip: 'not-still-creek', clockBefore: dayTicks(Game),
            wcOutcome: wcl.outcome || null, wcBucket: wcl.bucket || null, wcRescued: (wcl.rescued === undefined ? null : !!wcl.rescued) });
        } else if (atHaven || inTent) {
          st.evenings.push({ loopDay, skip: atHaven ? 'at-haven' : 'in-tent', clockBefore: dayTicks(Game) });
        } else {
          const clockBefore = dayTicks(Game);
          const dec = flipDecision(clockBefore);
          const rec = { loopDay, mode: dec.mode, skip: dec.skip || null, needed: dec.needed || null,
            clockBefore, woodBefore: playerWood(Game), kcalBefore: scholarKcal(Game),
            branchesBefore: branchCount(Game), packBefore: packFoodKcal(Game),
            actions: [], clockAfter: null, woodAfter: null, kcalAfter: null,
            branchesAfter: null, packAfter: null, flipped: false, sayLine: null };
          if (dec.mode === 'skip') {
            st.evenings.push(rec);
          } else if (dec.mode === 'bank') {
            // Last-light bank: up to 2 forages within budget.
            let forages = 0;
            while (forages < MAX_BANK_FORAGES && !gameOver(Game) && !combatLive(Game)) {
              const tl = ticksLeft(Game);
              if (tl === null || tl < 17 || dayTicks(Game) + 16 > BANK_CLOCK_CAP) break;
              const invBefore = snapInventory(Game);
              const kcalB = scholarKcal(Game), ticksB = dayTicks(Game);
              let err = null;
              try { Game.doAction('forage'); } catch (e) { err = String((e && (e.message || e)) || e).slice(0, 200); }
              const totals = pressTotals(invBefore, snapInventory(Game));
              rec.actions.push({ kind: 'forage', kcalBefore: kcalB, kcalAfter: scholarKcal(Game),
                ticksBefore: ticksB, ticksAfter: dayTicks(Game), err,
                E: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits, unknownForms: totals.unknownForms });
              forages++;
            }
            rec.clockAfter = dayTicks(Game);
            rec.woodAfter = playerWood(Game); rec.kcalAfter = scholarKcal(Game);
            rec.branchesAfter = branchCount(Game); rec.packAfter = packFoodKcal(Game);
            rec.flipped = true; // already-flipped evenings stay flipped
            rec.sayLine = 'You forage into the last light and bank what you find for the morning.';
            try { Game.say(rec.sayLine); } catch (e) { noteErr(st, 'evening.say', e); }
            st.evenings.push(rec);
          } else {
            // Flip-bank: gather branches first, then forage, until flipped.
            let verbs = 0;
            let stopped = null;
            while (verbs < MAX_FLIP_VERBS && dayTicks(Game) < 449 && !gameOver(Game) && !combatLive(Game)) {
              const spent = dayTicks(Game) - clockBefore;
              if (spent >= MAX_FLIP_SPEND) { stopped = 'spend-cap'; break; }
              const branches = branchCount(Game);
              if (branches !== null && branches < 2) {
                // Walk to a gather stance, then gather.
                let grid = null;
                try {
                  const live = Game.genDetail(Game.map.px, Game.map.py);
                  grid = live.map((row) => (row ? row.slice() : row));
                } catch (e) { noteErr(st, 'evening.scan', e); stopped = 'scan-error'; break; }
                if (!grid) { stopped = 'scan-error'; break; }
                const curMx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
                const curMy = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
                const found = findGatherTarget(grid, [curMx, curMy], (c) => blocksCell(Game, c));
                if (!found) { stopped = 'no-gather-target'; break; }
                const steps = [];
                let walkStop = null;
                for (const [tx, ty] of found.path) {
                  if (gameOver(Game) || combatLive(Game)) { walkStop = 'combat'; break; }
                  if (ticksLeft(Game) !== null && ticksLeft(Game) < 2) { walkStop = 'ticks-floor'; break; }
                  let ok = false, stepErr = null;
                  try { ok = !!Game.microMove(tx, ty); } catch (e) { stepErr = String((e && (e.message || e)) || e).slice(0, 120); }
                  steps.push({ to: tx + ',' + ty, ok, error: stepErr });
                  if (!ok) { walkStop = 'walk-blocked'; break; }
                }
                if (walkStop) { rec.actions.push({ kind: 'walk', target: found.target, stance: found.stance, steps, walkStop }); stopped = walkStop; break; }
                if (steps.length > 0) rec.actions.push({ kind: 'walk', target: found.target, stance: found.stance, steps, walkStop: null });
                // Gather at the target cell (adjacent to the stance by construction).
                const kcalB = scholarKcal(Game), ticksB = dayTicks(Game), brB = branchCount(Game);
                let gatherErr = null;
                try { Game.gatherFallen(found.target.x, found.target.y); } catch (e) { gatherErr = String((e && (e.message || e)) || e).slice(0, 200); }
                rec.actions.push({ kind: 'gather', target: found.target, kcalBefore: kcalB, kcalAfter: scholarKcal(Game),
                  ticksBefore: ticksB, ticksAfter: dayTicks(Game), branchesBefore: brB, branchesAfter: branchCount(Game), err: gatherErr });
                verbs++;
                if (dayTicks(Game) >= 449) break;
                // If the gather gave no branches (wrong cell / lottery), do not loop on it forever:
                // fall through to forage below on the next iteration only if branches still < 2
                // and verbs remain; the verb cap bounds this.
                if (branchCount(Game) !== null && branchCount(Game) >= 2) {
                  // branches secured; next iterations forage.
                } else if (verbs >= MAX_FLIP_VERBS) {
                  stopped = 'verb-cap'; break;
                }
              } else {
                const invBefore = snapInventory(Game);
                const kcalB = scholarKcal(Game), ticksB = dayTicks(Game);
                let err = null;
                try { Game.doAction('forage'); } catch (e) { err = String((e && (e.message || e)) || e).slice(0, 200); }
                const totals = pressTotals(invBefore, snapInventory(Game));
                rec.actions.push({ kind: 'forage', kcalBefore: kcalB, kcalAfter: scholarKcal(Game),
                  ticksBefore: ticksB, ticksAfter: dayTicks(Game), err,
                  E: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits, unknownForms: totals.unknownForms });
                verbs++;
              }
            }
            rec.stopped = stopped;
            rec.clockAfter = dayTicks(Game);
            rec.woodAfter = playerWood(Game); rec.kcalAfter = scholarKcal(Game);
            rec.branchesAfter = branchCount(Game); rec.packAfter = packFoodKcal(Game);
            rec.flipped = rec.clockAfter >= 449;
            const nGather = rec.actions.filter((a) => a.kind === 'gather').length;
            const nForage = rec.actions.filter((a) => a.kind === 'forage').length;
            rec.sayLine = rec.flipped
              ? ('You work late at the creek — ' + (nGather ? (nGather + ' deadfall gather' + (nGather > 1 ? 's' : '')) : '') + (nGather && nForage ? ' and ' : '') + (nForage ? (nForage + ' forage' + (nForage > 1 ? 's' : '')) : '') + ' — until the night is too far gone for real sleep. What you banked waits for morning.')
              : 'You gather late into the dusk, but the night still closes early.';
            try { Game.say(rec.sayLine); } catch (e) { noteErr(st, 'evening.say', e); }
            st.evenings.push(rec);
          }
        }
      } catch (e) { noteErr(st, 'evening', e); }
      return r;
    },
  });
}

module.exports = { leverOn, newStore, strandDecision, flipDecision, findGatherTarget, withStrandfix2 };
