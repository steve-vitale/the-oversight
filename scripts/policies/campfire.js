// policies/campfire.js — stranded-night campfire (sim-woodshort-ledger-b,
// flesh-out loop B, axis food-economy). POLICY-SIDE ONLY: zero src/js
// changes. Wraps woodcarry (which wraps nighttravel): AFTER inner.daily
// each loop-day, on a genuine still-refused creek night spent out, the
// player makes camp — ONE makeFire to cook dinner — if and only if the
// honest trigger holds (see campDecision). The fire is lit to COOK, not
// to spend: raw cookable food in the pack, no fire already near, good
// ground within reach, enough evening ticks that tickAction can never
// roll the day over inside the camp step, and fewer than 2 branches (so
// the engine's own fuel preference actually spends a log; a branch fire
// is recorded as a miss and never lit for staging).
//
// The spend, when it happens, is the engine's own: makeFire spends fuel
// ONLY on success (spendFireFuel sits inside the success branch); a
// failed friction attempt spends kcal/ticks but no fuel and is recorded
// as a failed camp, never counted as a spend. No state edits outside
// engine verbs (makeFire, cookFood). No RNG drawn by the policy itself.
//
// Gate: CAMPFIRE=1 enables; CAMPFIRE=0 (or unset) records lever-off
// and acts never, so OFF legs stay pure for the OFF guard.
'use strict';

function campfireOn() {
  try { return process.env.CAMPFIRE === '1'; } catch (e) { return false; }
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

// Pure camp gate (unit-tested by scripts/test-woodshort-ledger-b.js).
// Inputs are all reads taken at the stranded-evening moment.
// Returns { act: true } or { miss: reason }.
function campDecision(o) {
  if (!o || o.outcome !== 'travel-refused' || o.bucket !== 'creek') return { miss: 'not-creek-refused' };
  if (o.rescued) return { miss: 'rescued' };
  if (o.gameOver) return { miss: 'game-over' };
  if (o.combat) return { miss: 'combat' };
  if (o.inTent) return { miss: 'in-tent' };
  if (o.atHaven) return { miss: 'at-haven' };
  if (o.branches === null || o.branches === undefined || o.branches >= 2) return { miss: 'branches-available' };
  if (o.wood === null || o.wood === undefined || o.wood < 1) return { miss: 'no-wood' };
  if (!o.rawCookable) return { miss: 'no-raw-food' };
  if (o.nearFire) return { miss: 'fire-near' };
  if (!o.groundFound) return { miss: 'no-ground' };
  if (o.ticksLeft === null || o.ticksLeft === undefined || o.fireCost === null || o.fireCost === undefined
      || o.ticksLeft < o.fireCost + 40) return { miss: 'ticks-short' };
  return { act: true };
}

function withCampfire(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'campfire',
    desc: 'woodcarry + stranded-night campfire (CAMPFIRE=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      let campRec = null;
      if (!campfireOn()) {
        campRec = { acted: false, miss: 'lever-off', loopDay };
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
          let branches = null, wood = null, rawCookable = null, nearFire = false;
          try { branches = (typeof Game.materialCount === 'function') ? Game.materialCount('branch') : null; } catch (e) {}
          try { wood = (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) {}
          try {
            const inv = sch.inventory || [];
            for (let i = 0; i < inv.length; i++) {
              const it = inv[i];
              if (it && it.rawKcal && it.needsCooking) { rawCookable = { index: i, name: it.name || it.itemId || it.id || 'food' }; break; }
            }
          } catch (e) {}
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
          } catch (e) { noteErr(st, 'camp.ground', e); }
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
          const dec = campDecision({
            outcome: wcl.outcome, bucket: wcl.bucket, rescued: !!wcl.rescued,
            gameOver: over, combat, inTent, atHaven,
            branches, wood, rawCookable: !!rawCookable, nearFire,
            groundFound: !!ground, ticksLeft, fireCost,
          });
          if (!dec.act) {
            campRec = { acted: false, miss: dec.miss, loopDay,
              woodBefore: wood, branchesBefore: branches, ticksLeft, fireCost,
              rawName: rawCookable ? rawCookable.name : null,
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
            let cooked = 0, cookedName = null, cookErr = null;
            if (fireLit && ticksAfter !== null && ticksAfter >= 16) {
              try {
                const inv = (Game.state.scholar || {}).inventory || [];
                let idx = -1, nm = null;
                for (let i = 0; i < inv.length; i++) {
                  const it = inv[i];
                  if (it && it.rawKcal && it.needsCooking) { idx = i; nm = it.name || it.itemId || it.id || 'food'; break; }
                }
                if (idx >= 0) {
                  Game.cookFood(idx);
                  const after = (Game.state.scholar || {}).inventory || [];
                  const it = after[idx];
                  if (it && !it.needsCooking && (it.rawKcal === null || it.rawKcal === undefined)) { cooked = 1; cookedName = nm; }
                }
              } catch (e) { cookErr = String(e && e.message).slice(0, 120); }
            }
            campRec = { acted: true, loopDay, ground: ground.cx + ',' + ground.cy,
              woodBefore, woodAfter, logSpent: (woodBefore !== null && woodAfter !== null) ? (woodBefore - woodAfter) : null,
              branchesBefore: branches, kcalBefore, kcalAfter, ticksBefore, ticksAfter,
              fireLit, fireErr, rawName: rawCookable ? rawCookable.name : null,
              cooked, cookedName, cookErr };
            st.acted++;
          }
        } catch (e) {
          noteErr(st, 'camp', e);
          campRec = { acted: false, miss: 'error', loopDay };
        }
      }
      try { ctx._cfLast = campRec; } catch (e) { noteErr(st, 'camp.ctx', e); }
      try { st.records++; } catch (e) {}
      return r;
    },
  });
}

module.exports = { campfireOn, newStore, campDecision, withCampfire };
