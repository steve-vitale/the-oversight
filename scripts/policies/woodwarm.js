// policies/woodwarm.js — stranded-night warmth fire (sim-woodwarm-b,
// flesh-out loop B, axis food-economy). POLICY-SIDE ONLY: zero src/js
// changes. Wraps woodcarry (which wraps nighttravel): AFTER inner.daily
// each loop-day, on a genuine still-refused creek night spent out, the
// player lights a fire FOR WARMTH — not to cook — if and only if the
// honest trigger holds (see warmDecision). The fire is lit because the
// night is spent outside in the cold, so it needs no food in the pack
// and attempts no cooking step (contrast policies/campfire.js, whose
// cooking purpose never fired because stranded nights are foodless).
//
// The spend, when it happens, is the engine's own: makeFire spends fuel
// ONLY on success (spendFireFuel sits inside the success branch); a
// failed friction attempt spends kcal/ticks but no fuel and is recorded
// as a failed warmth fire, never counted as a spend. No state edits
// outside engine verbs (makeFire only). No RNG drawn by the policy
// itself.
//
// Gate: WOODWARM=1 enables; WOODWARM=0 (or unset) records lever-off
// and acts never, so guard legs stay pure for the OFF guard. This
// policy also requires WOODCARRY=1 in the driver (the staged line
// fires only on the ON leg); the policy itself does not re-check
// WOODCARRY — the driver asserts it FATAL.
'use strict';

function woodwarmOn() {
  try { return process.env.WOODWARM === '1'; } catch (e) { return false; }
}

function newStore() {
  return { records: 0, errs: 0, errors: [], acted: 0, missed: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// Pure warmth gate (unit-tested by scripts/test-woodwarm-b.js).
// Inputs are all reads taken at the stranded-evening moment.
// Returns { act: true } or { miss: reason }.
// NOTE: no rawCookable input at all — warmth needs no food.
// The ticks margin is +10, NOT the campfire's +40: +10 exists
// ONLY to keep tickAction from rolling the day over inside the
// fire step (tickAction calls endDay at dayTicks >= 512).
// No cooking follows, so no cooking margin is claimed.
function warmDecision(o) {
  if (!o || o.outcome !== 'travel-refused' || o.bucket !== 'creek') return { miss: 'not-creek-refused' };
  if (o.rescued) return { miss: 'rescued' };
  if (o.gameOver) return { miss: 'game-over' };
  if (o.combat) return { miss: 'combat' };
  if (o.inTent) return { miss: 'in-tent' };
  if (o.atHaven) return { miss: 'at-haven' };
  if (o.branches === null || o.branches === undefined || o.branches >= 2) return { miss: 'branches-available' };
  if (o.wood === null || o.wood === undefined || o.wood < 1) return { miss: 'no-wood' };
  if (o.nearFire) return { miss: 'fire-near' };
  if (!o.groundFound) return { miss: 'no-ground' };
  if (o.ticksLeft === null || o.ticksLeft === undefined || o.fireCost === null || o.fireCost === undefined
      || o.ticksLeft < o.fireCost + 10) return { miss: 'ticks-short' };
  return { act: true };
}

// Pure restraint gate (sim-warmthrestr2-b, opt-in only). Applies AFTER
// warmDecision returns act, BEFORE makeFire. Bridge cost B = 4.
//   R1 (bridge-feasibility): act only if woodBefore - 1 >= 4, i.e. >= 5.
//   R2 (bridge-already-lost): act only if woodBefore < 4 (window 1..3,
//     since warmDecision already requires wood >= 1).
//   null / 'off' / undefined: no restraint (unconditional behavior).
//   unknown restraint string: fail closed (miss).
function restraintDecision(restraint, wood) {
  if (!restraint || restraint === 'off') return { act: true };
  if (restraint === 'R1') {
    if (wood !== null && wood !== undefined && wood >= 5) return { act: true };
    return { miss: 'restraint-r1' };
  }
  if (restraint === 'R2') {
    if (wood !== null && wood !== undefined && wood < 4) return { act: true };
    return { miss: 'restraint-r2' };
  }
  return { miss: 'restraint-unknown' };
}

function withWoodwarm(inner, store, opts) {
  const restraint = (opts && opts.restraint) || null;
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'woodwarm',
    desc: 'woodcarry + stranded-night warmth fire (WOODWARM=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      let warmRec = null;
      if (!woodwarmOn()) {
        warmRec = { acted: false, miss: 'lever-off', purpose: 'warmth', loopDay };
      } else {
        try {
          const wcl = (ctx && ctx._wcLast) || {};
          const sch = (Game.state || {}).scholar || {};
          const over = !!Game.over;
          const combat = combatLive(Game);
          const inTent = !!sch.insideTent;
          let atHaven = false;
          try {
            if (sch.insideHaven === true) atHaven = true;
            else { const t = Game.playerTile(); if (t && t.type === 'haven') atHaven = true; }
          } catch (e) {}
          let branches = null, wood = null, nearFire = false;
          try { branches = (typeof Game.materialCount === 'function') ? Game.materialCount('branch') : null; } catch (e) {}
          try { wood = (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) {}
          try { nearFire = (typeof Game.nearFire === 'function') ? !!Game.nearFire() : false; } catch (e) {}
          let ground = null;
          try {
            const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
            const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
            const detail = Game.genDetail(Game.map.px, Game.map.py);
            const cands = [[mx, my], [mx, my + 1], [mx, my - 1], [mx + 1, my], [mx - 1, my],
              [mx + 1, my + 1], [mx + 1, my - 1], [mx - 1, my + 1], [mx - 1, my - 1]];
            for (const [cx, cy] of cands) {
              if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
              let plot = false;
              try { plot = !!(Game.gardenCellAt && Game.gardenCellAt(cx, cy) && Game.gardenCellAt(cx, cy).plot); } catch (e) {}
              if (plot) continue;
              const cell = detail[cy] && detail[cy][cx];
              if (Game.fireGroundOK(cell)) { ground = { cx, cy, cell }; break; }
            }
          } catch (e) { noteErr(st, 'warm.ground', e); }
          let fireCost = 48;
          try {
            if (Game.hasItem && Game.hasItem('lighter')) fireCost = 8;
            else if (Game.hasAbility && Game.hasAbility('beard_moss')) fireCost = 32;
          } catch (e) {}
          let ticksLeft = null;
          try {
            const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
            ticksLeft = tpd - (sch.dayTicks || 0);
          } catch (e) {}
          const dec = warmDecision({
            outcome: wcl.outcome, bucket: wcl.bucket, rescued: !!wcl.rescued,
            gameOver: over, combat, inTent, atHaven,
            branches, wood, nearFire,
            groundFound: !!ground, ticksLeft, fireCost,
          });
          if (!dec.act) {
            warmRec = { acted: false, miss: dec.miss, purpose: 'warmth', loopDay,
              woodBefore: wood, branchesBefore: branches, ticksLeft, fireCost,
              ground: ground ? (ground.cx + ',' + ground.cy) : null };
            st.missed++;
          } else if (!restraintDecision(restraint, wood).act) {
            const rdec = restraintDecision(restraint, wood);
            warmRec = { acted: false, miss: rdec.miss, purpose: 'warmth', loopDay,
              restraint: restraint, woodBefore: wood, branchesBefore: branches,
              ticksLeft, fireCost,
              ground: ground ? (ground.cx + ',' + ground.cy) : null };
            st.missed++;
          } else {
            const woodBefore = wood, kcalBefore = Math.round(sch.kcal || 0), ticksBefore = ticksLeft;
            let fireErr = null;
            try { Game.makeFire(ground.cx, ground.cy); } catch (e) { fireErr = String(e && e.message).slice(0, 120); }
            let woodAfter = null, kcalAfter = null, ticksAfter = null, fireLit = false;
            try { woodAfter = Game.woodCount(); } catch (e) {}
            try { kcalAfter = Math.round((Game.state.scholar || {}).kcal || 0); } catch (e) {}
            try {
              const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
              ticksAfter = tpd - ((Game.state.scholar || {}).dayTicks || 0);
            } catch (e) {}
            try {
              const detail = Game.genDetail(Game.map.px, Game.map.py);
              fireLit = !!((detail[ground.cy] && detail[ground.cy][ground.cx]) === 'fire') || (woodAfter !== null && woodBefore !== null && woodAfter < woodBefore);
            } catch (e) {}
            warmRec = { acted: true, purpose: 'warmth', loopDay, ground: ground.cx + ',' + ground.cy,
              woodBefore, woodAfter, logSpent: (woodBefore !== null && woodAfter !== null) ? (woodBefore - woodAfter) : null,
              branchesBefore: branches, kcalBefore, kcalAfter, ticksBefore, ticksAfter,
              fireLit, fireErr };
            st.acted++;
          }
        } catch (e) {
          noteErr(st, 'warm', e);
          warmRec = { acted: false, miss: 'error', purpose: 'warmth', loopDay };
        }
      }
      try { ctx._wwLast = warmRec; } catch (e) { noteErr(st, 'warm.ctx', e); }
      try { st.records++; } catch (e) {}
      return r;
    },
  });
}

module.exports = { woodwarmOn, newStore, warmDecision, restraintDecision, withWoodwarm };
