// policies/woodday.js — daytime (morning) wood-gather probe
// (sim-woodday-b; prereg: evidence/2026-10-30/
// sim-woodday-b-prereg.md, committed BEFORE any judged leg).
// POLICY-SIDE ONLY: zero src/js changes. Wraps OUTSIDE the
// warmed stack, so it runs BEFORE woodcarry's morning carry
// each loop-day; the two never co-act (probe requires
// away-from-haven, carry requires at-haven).
//
// Rule (exact, pre-registered — no mid-run swaps): on a morning
// away from haven, with pack wood < 4, morning kcal >= 80 and
// ticksLeft >= 96, scan adjacent detail cells in warmth scan
// order (self + 8 neighbours) and call the engine's own verbs:
// cutTree on tree/bigtree (max 2 fells per morning), clearBrush
// on bush — stopping when pack >= 4, when adjacent wood sources
// are exhausted, when kcal < 80 or ticksLeft < 96, or after 2
// tree fells. NO state edits outside engine verbs; NO RNG drawn
// by the policy itself (cutTree's yield lottery is the engine's
// own, like warmth's friction lottery); NO weakening of the
// carry (pile untouched); NO hand top-ups; mornings only — the
// evening bridge attempt is unchanged and still judges the pack
// the probe leaves.
//
// Gate: WOODDAY=1 enables; WOODDAY=0 (or unset) records
// lever-off and acts never, so census legs stay pure.
'use strict';

function wooddayOn() {
  try { return process.env.WOODDAY === '1'; } catch (e) { return false; }
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

// Pure morning gate (unit-tested by scripts/test-woodday-b.js).
// KCAL_FLOOR 80 = one cutTree's effort cost; TICKS_FLOOR 96 =
// one cutTree's tick cost. Both floors apply to every verb
// attempt (the pre-registered stop conditions, applied literally).
function probeGate(o) {
  if (!o) return { skip: 'no-input' };
  if (o.gameOver) return { skip: 'game-over' };
  if (o.combat) return { skip: 'combat' };
  if (o.atHaven) return { skip: 'at-haven' };
  if (o.wood === null || o.wood === undefined) return { skip: 'wood-unknown' };
  if (o.wood >= 4) return { skip: 'pack-ready' };
  if (o.kcal === null || o.kcal === undefined || o.kcal < 80) return { skip: 'kcal-floor' };
  if (o.ticksLeft === null || o.ticksLeft === undefined || o.ticksLeft < 96) return { skip: 'ticks-floor' };
  return { act: true };
}

function withWoodday(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'woodday',
    desc: 'woodwarm + morning wood-gather probe (WOODDAY=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      let probeRec = null;
      if (!wooddayOn()) {
        probeRec = { acted: false, skip: 'lever-off', loopDay };
      } else {
        try {
          const sch = (Game.state || {}).scholar || {};
          const over = !!Game.over;
          const combat = combatLive(Game);
          let atHaven = false;
          try {
            if (sch.insideHaven === true) atHaven = true;
            else { const t = Game.playerTile(); if (t && t.type === 'haven') atHaven = true; }
          } catch (e) {}
          let wood = null;
          try { wood = (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) {}
          const kcal0 = Math.round(sch.kcal || 0);
          let ticksLeft0 = null;
          try {
            const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
            ticksLeft0 = tpd - (sch.dayTicks || 0);
          } catch (e) {}
          const gate = probeGate({ gameOver: over, combat, atHaven, wood, kcal: kcal0, ticksLeft: ticksLeft0 });
          if (!gate.act) {
            probeRec = { acted: false, skip: gate.skip, loopDay, woodBefore: wood, kcalBefore: kcal0, ticksLeftBefore: ticksLeft0 };
            st.missed++;
          } else {
            const woodBefore = wood;
            const verbs = [];
            let fells = 0;
            let stopReason = null;
            // Snapshot adjacent cell types first (cutting mutates the
            // live detail array; cells are independent, so a snapshot
            // scan stays valid for the remaining cells).
            let cells = null;
            try {
              const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
              const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
              const detail = Game.genDetail(Game.map.px, Game.map.py);
              const cands = [[mx, my], [mx, my + 1], [mx, my - 1], [mx + 1, my], [mx - 1, my],
                [mx + 1, my + 1], [mx + 1, my - 1], [mx - 1, my + 1], [mx - 1, my - 1]];
              cells = [];
              for (const [cx, cy] of cands) {
                if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
                const cell = detail[cy] && detail[cy][cx];
                if (cell === 'tree' || cell === 'bigtree' || cell === 'bush') cells.push({ cx, cy, cell });
              }
            } catch (e) { noteErr(st, 'probe.scan', e); cells = []; }
            let sourcesExhausted = false;
            for (const c of cells) {
              let curWood = null, curKcal = null, curTicks = null;
              try { curWood = Game.woodCount(); } catch (e) {}
              try { curKcal = Math.round((Game.state.scholar || {}).kcal || 0); } catch (e) {}
              try {
                const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
                curTicks = tpd - ((Game.state.scholar || {}).dayTicks || 0);
              } catch (e) {}
              if (curWood !== null && curWood >= 4) { stopReason = 'pack-ready'; break; }
              if (curKcal !== null && curKcal < 80) { stopReason = 'kcal-floor'; break; }
              if (curTicks !== null && curTicks < 96) { stopReason = 'ticks-floor'; break; }
              if ((c.cell === 'tree' || c.cell === 'bigtree') && fells >= 2) { stopReason = 'fell-cap'; continue; }
              const wb = curWood;
              let verbErr = null;
              try {
                if (c.cell === 'tree' || c.cell === 'bigtree') { Game.cutTree(c.cx, c.cy); fells++; }
                else Game.clearBrush(c.cx, c.cy);
              } catch (e) { verbErr = String(e && e.message).slice(0, 120); }
              let wa = null;
              try { wa = Game.woodCount(); } catch (e) {}
              verbs.push({ verb: (c.cell === 'bush' ? 'clearBrush' : 'cutTree'), cell: c.cx + ',' + c.cy, kind: c.cell, woodBefore: wb, woodAfter: wa, error: verbErr });
            }
            if (!stopReason) {
              // Loop ran out of adjacent sources without hitting a cap.
              let curWood = null;
              try { curWood = Game.woodCount(); } catch (e) {}
              if (curWood !== null && curWood >= 4) stopReason = 'pack-ready';
              else { stopReason = 'sources-exhausted'; sourcesExhausted = true; }
            }
            let woodAfter = null;
            try { woodAfter = Game.woodCount(); } catch (e) {}
            probeRec = { acted: verbs.length > 0, skip: verbs.length > 0 ? null : stopReason, loopDay,
              woodBefore, woodAfter, kcalBefore: kcal0, ticksLeftBefore: ticksLeft0,
              verbs, fells, stopReason, sourcesExhausted };
            if (verbs.length > 0) st.acted++;
            else st.missed++;
          }
        } catch (e) {
          noteErr(st, 'probe', e);
          probeRec = { acted: false, skip: 'error', loopDay };
        }
      }
      try { ctx._wdLast = probeRec; } catch (e) { noteErr(st, 'probe.ctx', e); }
      try { st.records++; } catch (e) {}
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      return r;
    },
  });
}

module.exports = { wooddayOn, newStore, probeGate, withWoodday };
