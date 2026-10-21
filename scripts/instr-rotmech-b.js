#!/usr/bin/env node
// instr-rotmech-b.js — funnel-rot attribution instrument (arm sim-rotmech-b).
//
// INSTRUMENT ONLY. Zero policy layers, zero src/js changes. Every wrap calls
// through to the original and only counts/tags; tags (_diagF/_diagArr/...) are
// untracked fields stacksMatch ignores, so trajectories stay RNG-clean
// (proven by the det-gate in scripts/test-rotmech-b.js).
//
// The question (findings backlog #719): what in the Game.stockPantry path rots
// faster than the engine's stockSurplus path, and why did the retagrot benefit
// concentrate where the bypass binds (belong 0.55x vs lead 1.32x)?
//
// Two funnels, tagged at write time:
//   'surplus' — Game.stockSurplus: uniform 200-kcal units, spoilDay v.day+3,
//               PANTRY-CAP-GATED (over-cap refuses, returns partial/0).
//   'pantry'  — Game.stockPantry:  pieces <=500 kcal, spoilDay day+3+granary,
//               NO cap gate.
//   'other'   — pantryAdd / depositPantryPieces (conservation completeness).
//
// Per funnel: written / rot / drawn / eatenSpoiled / playerTakes / endInv,
// arrival draw-rank (fresh-first order), residence times, cap-room at arrival.
// The analyzer decomposes the rot-rate differential D = rotRate_p - rotRate_s
// into (a) cap-door, (b) piece-size/clock, (c) draw-order components.
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcalLive(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0); } catch (e) { return 0; }
}
function capKcal(Game) { try { return Game.pantryCapKcal(); } catch (e) { return Infinity; } }

// Draw-rank comparator — mirrors pantryDraw's FRESH-FIRST sort:
// slabs last, then spoilDay asc, then kcalEach asc.
function cmpDraw(a, b) {
  const slab = (it) => ((it.kcalEach || 0) > 2000 ? 1 : 0);
  return (slab(a) - slab(b)) || (((a.spoilDay == null ? 99999 : a.spoilDay)) - ((b.spoilDay == null ? 99999 : b.spoilDay))) || ((a.kcalEach || 0) - (b.kcalEach || 0));
}

function mkFunnel() {
  return {
    written: 0, rot: 0, rotFast: 0, drawn: 0, eatenSpoiled: 0, playerTakes: 0, tribute: 0,
    rotOverCap: 0,            // rot from items that arrived with roomBefore<=0
    rotFastOverCap: 0,        // fast-rot from over-cap arrivals
    overCapWrite: 0,          // kcal written while roomBefore<=0
    capRefused: 0,            // (surplus) kcal the cap door refused
    arrRankSum: 0, arrRankN: 0,   // mean arrival draw-rank
    resEatSum: 0, resEatK: 0,     // residence-weighted eaten kcal
    resRotSum: 0, resRotK: 0,     // residence-weighted rotted kcal
    rotByPiece: {},           // rot by arrival piece size bucket
    rotFastByPiece: {},       // fast-rot by arrival piece size bucket
    rotByRankQ: [0, 0, 0, 0], // rot by arrival-rank quartile
    rotFastByRankQ: [0, 0, 0, 0],
    writtenByRankQ: [0, 0, 0, 0], // written kcal by arrival-rank quartile
    writtenByPiece: {},          // written kcal by arrival piece bucket
    clockSum: 0, clockN: 0,       // spoilDay - arrDay at arrival
  };
}

function attachRotmech(Game) {
  const W = {
    fun: { surplus: mkFunnel(), pantry: mkFunnel(), other: mkFunnel(), untagged: mkFunnel() },
    surplusCalls: 0, pantryCalls: 0,
    mergeXfer: {},          // "writerF->stackTag" : kcal merged into existing stacks
    dayFill: [],           // {day, fill} fill = pantryKcal/cap
    daysFull: 0, daysLean: 0,  // fill>=0.95 / pantryKcal<5000
    deaths: [], deathSeen: new Set(),
  };
  const seen = new WeakSet();   // pantry items already tagged
  const rotCounted = new Set(); // swept items already counted
  let curCtx = null;            // {f, roomBefore, day}

  // merge-transfer: after a wrapped write, find existing stacks whose units
  // grew — the new kcal joined an old tag. "writerF->stackTag": kcal.
  // The merged kcal ALSO counts toward the writer funnel's rank/piece
  // buckets at the absorbing stack's arrival rank (it faces that queue
  // position) — otherwise the quartile denominators miss merged volume and
  // rank-specific rates inflate past 100%.
  function trackMerge(beforeUnits, writerF) {
    try {
      const v = (Game.state || {}).village || {};
      for (const it of (v.pantry || [])) {
        if (!beforeUnits.has(it)) continue; // new item, not a merge
        const grew = (it.units || 0) - beforeUnits.get(it);
        if (grew > 0) {
          const k = grew * (it.kcalEach || 0);
          const key = writerF + '->' + fOf(it);
          W.mergeXfer[key] = (W.mergeXfer[key] || 0) + k;
          const F = W.fun[writerF] || W.fun.untagged;
          const rk = (typeof it._diagRank === 'number') ? it._diagRank : 4;
          const q = rk <= 1 ? 0 : rk <= 3 ? 1 : rk <= 8 ? 2 : 3;
          F.writtenByRankQ[q] = (F.writtenByRankQ[q] || 0) + k;
          const pb = (it.kcalEach || 0) <= 200 ? 'le200' : 'gt200';
          F.writtenByPiece[pb] = (F.writtenByPiece[pb] || 0) + k;
        }
      }
    } catch (e) {}
  }
  function snapUnits() {
    const m = new Map();
    try { for (const it of (((Game.state || {}).village || {}).pantry || [])) m.set(it, it.units || 0); } catch (e) {}
    return m;
  }

  function tagNewArrivals() {
    if (!curCtx) return;
    const v = (Game.state || {}).village || {};
    const pan = v.pantry || [];
    const day = dayOf(Game);
    for (const it of pan) {
      if (!it || seen.has(it)) continue;
      seen.add(it);
      // inherited tags (Object.assign clones from smoke-splits / takes)
      // keep the source funnel — the kcal genuinely belongs there. Only
      // truly new items take the current write's funnel.
      if (it._diagF) continue;
      it._diagF = curCtx.f;
      it._diagArr = day;
      it._diagRoom = curCtx.roomBefore;
      it._diagOverCap = curCtx.roomBefore <= 0;
      it._diagPiece = it.kcalEach || 0;
      it._diagClock = (it.spoilDay == null ? 0 : it.spoilDay) - day;
      // arrival draw-rank among fresh pantry items (1 = eaten first)
      let rank = 1;
      try {
        for (const o of pan) {
          if (o === it || !o || (o.kcalEach || 0) <= 0 || (o.units || 0) <= 0) continue;
          if (Game.isSpoiled && Game.isSpoiled(o)) continue;
          if (cmpDraw(o, it) < 0) rank++;
        }
      } catch (e) {}
      it._diagRank = rank;
      const F = W.fun[curCtx.f] || W.fun.untagged;
      F.arrRankSum += rank; F.arrRankN++;
      F.clockSum += it._diagClock; F.clockN++;
      const q = rank <= 1 ? 0 : rank <= 3 ? 1 : rank <= 8 ? 2 : 3;
      const ik = (it.kcalEach || 0) * (it.units || 1);
      F.writtenByRankQ[q] += ik;
      const pb = (it.kcalEach || 0) <= 200 ? 'le200' : 'gt200';
      F.writtenByPiece[pb] = (F.writtenByPiece[pb] || 0) + ik;
    }
  }

  function fOf(it) {
    const f = it && it._diagF;
    return (f === 'surplus' || f === 'pantry' || f === 'other') ? f : 'untagged';
  }
  function pieceBucket(k) { return k <= 200 ? 'le200' : 'gt200'; }

  // --- choke 1: stockSurplus (engine share funnel) ---
  {
    const o = Game.stockSurplus;
    if (typeof o === 'function') Game.stockSurplus = function (v, give) {
      const roomBefore = capKcal(Game) - pantryKcalLive(Game);
      const g = Math.round(Number(give) || 0);
      const beforeUnits = snapUnits();
      let r = 0;
      try { r = o.apply(this, arguments); } catch (e) { r = 0; }
      try {
        W.surplusCalls++;
        const F = W.fun.surplus;
        F.written += Math.round(Number(r) || 0);
        // cap-door refusal: kcal the cap refused (granularity-withheld remainder
        // is separate: give - stored - capRefused, carried by v._surplusRemainder)
        F.capRefused += Math.max(0, g - Math.max(0, Math.round(roomBefore)));
        curCtx = { f: 'surplus', roomBefore: Math.round(roomBefore) };
        tagNewArrivals(); curCtx = null;
        trackMerge(beforeUnits, 'surplus');
      } catch (e) {}
      return r;
    };
  }
  // --- choke 2: stockPantry (re-tag-equivalent funnel) ---
  {
    const o = Game.stockPantry;
    if (typeof o === 'function') Game.stockPantry = function (kcal, name, opts) {
      const roomBefore = capKcal(Game) - pantryKcalLive(Game);
      const k = Math.round(Number(kcal) || 0);
      const beforeUnits = snapUnits();
      let r;
      try { r = o.apply(this, arguments); } catch (e) { r = undefined; }
      try {
        W.pantryCalls++;
        const F = W.fun.pantry;
        if (k > 0) {
          F.written += k;
          if (roomBefore <= 0) F.overCapWrite += k;
        }
        curCtx = { f: 'pantry', roomBefore: Math.round(roomBefore) };
        tagNewArrivals(); curCtx = null;
        trackMerge(beforeUnits, 'pantry');
      } catch (e) {}
      return r;
    };
  }
  // --- choke 3: other writers (conservation completeness) ---
  for (const [mname, fname] of [['pantryAdd', 'other'], ['depositPantryPieces', 'other']]) {
    const o = Game[mname];
    if (typeof o === 'function') {
      Game[mname] = function () {
        const roomBefore = capKcal(Game) - pantryKcalLive(Game);
        let r; try { r = o.apply(this, arguments); } catch (e) { r = 0; }
        try {
          const F = W.fun[fname];
          if (mname === 'pantryAdd' && r === true) {
            const it = arguments[0] || {};
            F.written += Math.round((it.kcalEach || 0) * (it.units || 0));
          } else if (mname === 'depositPantryPieces') {
            F.written += Math.round(Number(r) || 0);
          }
          curCtx = { f: fname, roomBefore: Math.round(roomBefore) }; tagNewArrivals(); curCtx = null;
        } catch (e) {}
        return r;
      };
    }
  }

  // --- rot: identity-deduped, by arrival tag ---
  {
    const o = Game.sweepSpoiled;
    if (typeof o === 'function') Game.sweepSpoiled = function () {
      const rotDay = dayOf(Game);
      try {
        for (const it of (((Game.state || {}).village || {}).pantry || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            const k = (it.kcalEach || 0) * (it.units || 1);
            const f = fOf(it);
            const F = W.fun[f];
            F.rot += k;
            const arr = (typeof it._diagArr === 'number') ? it._diagArr : rotDay;
            const res = Math.max(0, rotDay - arr);
            const fast = res <= 3; // fast-rot: the retagrot line's metric
            if (fast) F.rotFast += k;
            if (it._diagOverCap) { F.rotOverCap += k; if (fast) F.rotFastOverCap += k; }
            const pb = pieceBucket(it._diagPiece || it.kcalEach || 0);
            F.rotByPiece[pb] = (F.rotByPiece[pb] || 0) + k;
            if (fast) F.rotFastByPiece[pb] = (F.rotFastByPiece[pb] || 0) + k;
            const rk = (typeof it._diagRank === 'number') ? it._diagRank : 4;
            const q = rk <= 1 ? 0 : rk <= 3 ? 1 : rk <= 8 ? 2 : 3;
            F.rotByRankQ[q] += k;
            if (fast) F.rotFastByRankQ[q] += k;
            F.resRotSum += k * res; F.resRotK += k;
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- draws: pantryDraw (meals + dawn rations) ---
  {
    const o = Game.pantryDraw;
    if (typeof o === 'function') Game.pantryDraw = function (v, want, opts) {
      let out;
      try { out = o.apply(this, arguments); } catch (e) { out = { taken: 0, items: [] }; }
      try {
        const day = dayOf(Game);
        for (const d of (out.items || [])) {
          const it = d && d.item; if (!it) continue;
          // physical pantry outflow (units x kcalEach); effectiveKcal carries
          // the cook transform — nutritional, not conservation
          const k = (d.units || 0) * (it.kcalEach || 0);
          const f = fOf(it);
          const F = W.fun[f];
          F.drawn += k;
          const arr = (typeof it._diagArr === 'number') ? it._diagArr : day;
          F.resEatSum += k * Math.max(0, day - arr); F.resEatK += k;
        }
      } catch (e) {}
      return out;
    };
  }
  // --- drawSpoiled (desperation eats) ---
  {
    const o = Game.drawSpoiled;
    if (typeof o === 'function') Game.drawSpoiled = function (v, want, exposure) {
      const before = new Map();
      try { for (const it of ((v || {}).pantry || [])) before.set(it, it.units || 0); } catch (e) {}
      let r = 0;
      try { r = o.apply(this, arguments); } catch (e) { r = 0; }
      try {
        const now = new Map();
        for (const it of ((v || {}).pantry || [])) now.set(it, it.units || 0);
        for (const [it, was] of before) {
          const took = Math.max(0, was - (now.has(it) ? now.get(it) : 0));
          if (took > 0) { const F = W.fun[fOf(it)]; F.eatenSpoiled += took * (it.kcalEach || 0); }
        }
      } catch (e) {}
      return r;
    };
  }
  // --- takeFromPantry (player takes) ---
  {
    const o = Game.takeFromPantry;
    if (typeof o === 'function') Game.takeFromPantry = function (idx) {
      let it = null;
      try { it = (((Game.state || {}).village || {}).pantry || [])[idx] || null; } catch (e) {}
      const f = fOf(it), ke = (it && it.kcalEach) || 0;
      let r; try { r = o.apply(this, arguments); } catch (e) { r = null; }
      try { if (it && r !== null) W.fun[f].playerTakes += ke; } catch (e) {}
      return r;
    };
  }
  // --- takeFromPantryBulk (player bulk takes) ---
  {
    const o = Game.takeFromPantryBulk;
    if (typeof o === 'function') Game.takeFromPantryBulk = function (selections) {
      const before = new Map();
      try { for (const it of (((Game.state || {}).village || {}).pantry || [])) before.set(it, it.units || 0); } catch (e) {}
      let r; try { r = o.apply(this, arguments); } catch (e) { r = null; }
      try {
        const now = new Map();
        for (const it of (((Game.state || {}).village || {}).pantry || [])) now.set(it, it.units || 0);
        for (const [it, was] of before) {
          const took = Math.max(0, was - (now.has(it) ? now.get(it) : 0));
          if (took > 0) W.fun[fOf(it)].playerTakes += took * (it.kcalEach || 0);
        }
      } catch (e) {}
      return r;
    };
  }
  // --- _removePantryKcal (tribute / levy takes — latest-clock first) ---
  {
    const o = Game._removePantryKcal;
    if (typeof o === 'function') Game._removePantryKcal = function (kcal) {
      const before = new Map();
      try { for (const it of (((Game.state || {}).village || {}).pantry || [])) before.set(it, it.units || 0); } catch (e) {}
      let r = 0;
      try { r = o.apply(this, arguments); } catch (e) { r = 0; }
      try {
        const now = new Map();
        for (const it of (((Game.state || {}).village || {}).pantry || [])) now.set(it, it.units || 0);
        for (const [it, was] of before) {
          const took = Math.max(0, was - (now.has(it) ? now.get(it) : 0));
          if (took > 0) { const F = W.fun[fOf(it)]; F.tribute = (F.tribute || 0) + took * (it.kcalEach || 0); }
        }
      } catch (e) {}
      return r;
    };
  }

  // --- deaths (wall numbers) ---
  {
    const oDie = Game.registerDeath;
    if (typeof oDie === 'function') Game.registerDeath = function (opts) {
      try {
        const kind = String((opts && opts.kind) || '');
        if (kind === 'person' || kind === 'villager') {
          const who = String((opts && (opts.villagerId || opts.name)) || '?');
          const day = dayOf(Game);
          const cause = String((opts && opts.cause) || '?').toLowerCase().slice(0, 40);
          const key = who + '|' + day + '|' + cause;
          if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: who.slice(0, 24), cause }); }
        }
      } catch (e) {}
      return oDie.apply(this, arguments);
    };
  }

  // daily posture sample (called by the driver from its daily hook).
  // Also reconciles per-funnel pantry kcal: any day-over-day change not
  // explained by written/drawn/rot/eatenSpoiled/playerTakes is an unwrapped
  // sink (smoke-rack kcal destruction, tribute/theft takes, kid/forager
  // nibbles) — accumulated as F.unaccounted, reported, never hidden.
  let lastTagKcal = null;
  let lastCum = null;
  W.sampleDay = function () {
    try {
      const day = dayOf(Game);
      const pk = pantryKcalLive(Game), cap = capKcal(Game);
      const fill = cap > 0 ? pk / cap : 0;
      W.dayFill.push({ day, fill: +fill.toFixed(4) });
      if (fill >= 0.95) W.daysFull++;
      if (pk < 5000) W.daysLean++;
      const tagKcal = { surplus: 0, pantry: 0, other: 0, untagged: 0 };
      for (const it of (((Game.state || {}).village || {}).pantry || [])) {
        tagKcal[fOf(it)] += (it.kcalEach || 0) * (it.units || 0);
      }
      const cum = {};
      for (const f of Object.keys(tagKcal)) {
        const F = W.fun[f];
        cum[f] = F.written - F.drawn - F.rot - F.eatenSpoiled - F.playerTakes - (F.tribute || 0);
      }
      if (lastTagKcal && lastCum) {
        for (const f of Object.keys(tagKcal)) {
          const dPan = tagKcal[f] - lastTagKcal[f];
          const dCum = cum[f] - lastCum[f];
          W.fun[f].unaccounted = (W.fun[f].unaccounted || 0) + (dPan - dCum);
        }
      }
      lastTagKcal = tagKcal; lastCum = cum;
    } catch (e) {}
  };

  // end-of-run residual inventory by tag (conservation check)
  W.endInventory = function () {
    const inv = { surplus: 0, pantry: 0, other: 0, untagged: 0 };
    try {
      for (const it of (((Game.state || {}).village || {}).pantry || [])) {
        inv[fOf(it)] += (it.kcalEach || 0) * (it.units || 0);
      }
    } catch (e) {}
    return inv;
  };

  // pre-existing pantry stock (initial stores, direct pushes) predates the
  // instrument: mark seen WITHOUT a funnel tag -> 'untagged'. Otherwise the
  // first wrapped write would adopt tens of thousands of kcal into its funnel.
  try {
    for (const it of (((Game.state || {}).village || {}).pantry || [])) seen.add(it);
  } catch (e) {}

  return W;
}

module.exports = { attachRotmech, dayOf, pantryKcalLive, capKcal, cmpDraw };
