#!/usr/bin/env node
// probe-scale-wall-20261012.js — DIAGNOSIS ONLY (no game-code changes).
// Finds the binding constraint on the scale on-ramp: village -> regional -> national.
//
// PART A (analytic, no sim): Monte Carlo the LEAD-road weekly trust process
//   for a primary-Haven subordinate link, exactly as coded in hierarchy.js
//   linkTick (arrival iff R() < trust/100; +1 on arrival; -4 on shortfall or
//   no-arrival). Answers: can a link ever hold trust>=40 for the 30-day
//   seasoning window (_linkSeasoned)?
// PART B (live sim): scalecourt policy x N seeds x 200d. Deep per-link trace
//   (formation, trust trajectory, seasoning, breaks + reason), national
//   staging attempts, Haven food ledger, subordinate NPC pantry at tribute
//   ticks.
//
// Usage: SEEDS="11,22,33" DAYS=200 OUT=/tmp/scale-wall.json node scripts/probe-scale-wall-20261012.js
//   PART=A|B|ALL (default ALL)
'use strict';
const fs = require('fs');

// ---------- PART A: trust-drift Monte Carlo (pure, seeded) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One weekly tick for a primary-Haven subordinate link, mirroring hierarchy.js.
// payProb: P(subordinate's pantry covers the full 4000 on an arrival week).
// deathPerWeek: P(a speaker death that week) -> -8 trust + mourning blocks the +1.
function simLeadLink(rand, startTrust, weeks, payProb, deathPerWeek) {
  let trust = startTrust;
  let mourning = 0;
  let minTrust = trust;
  for (let w = 0; w < weeks; w++) {
    if (deathPerWeek > 0 && rand() < deathPerWeek) {
      trust = Math.max(0, trust - 8);
      mourning = 1; // ~7d: blocks gains this weekly tick
    }
    if (rand() < trust / 100) {
      // arrival week
      if (mourning <= 0) trust = Math.min(100, trust + 1);
      if (rand() >= payProb) trust = Math.max(0, trust - 4); // shortfall
    } else {
      trust = Math.max(0, trust - 4); // no arrival: full arrears, -4
    }
    if (mourning > 0) mourning--;
    if (trust < minTrust) minTrust = trust;
  }
  return { endTrust: trust, minTrust };
}

function partA() {
  const out = {};
  const cfgs = [
    { name: 'link1_gesture_T40_payAlways', t0: 40, pay: 1.0, death: 0 },
    { name: 'link1_gesture_T40_payAlways_deaths', t0: 40, pay: 1.0, death: 0.10 },
    { name: 'link1_gesture_T40_payHalf', t0: 40, pay: 0.5, death: 0.10 },
    { name: 'link2plus_T30_payAlways', t0: 30, pay: 1.0, death: 0 },
    { name: 'link2plus_T30_payAlways_deaths', t0: 30, pay: 1.0, death: 0.10 },
    { name: 'link2plus_T30_payHalf_deaths', t0: 30, pay: 0.5, death: 0.10 },
  ];
  // Seasoning needs trust>=40 sustained across the 30-day (4.3wk) window AND
  // age>=30d. We test: starting at formation+gesture, does trust stay >=40
  // for 5 consecutive weekly checks (a proxy for the 30d window)?
  for (const c of cfgs) {
    let held40x5 = 0, ever40at30d = 0;
    const N = 20000;
    for (let i = 0; i < N; i++) {
      const rand = mulberry32(1000 + i);
      let trust = c.t0, mourning = 0, consec = 0, held = false, tAt30 = 0;
      for (let w = 0; w < 12; w++) { // 12 weeks ~ 84 days
        if (c.death > 0 && rand() < c.death) { trust = Math.max(0, trust - 8); mourning = 1; }
        if (rand() < trust / 100) {
          if (mourning <= 0) trust = Math.min(100, trust + 1);
          if (rand() >= c.pay) trust = Math.max(0, trust - 4);
        } else trust = Math.max(0, trust - 4);
        if (mourning > 0) mourning--;
        if (w === 4) tAt30 = trust; // ~30 days in
        if (trust >= 40) { consec++; if (consec >= 5) held = true; } else consec = 0;
      }
      if (held) held40x5++;
      if (tAt30 >= 40) ever40at30d++;
    }
    out[c.name] = {
      n: N,
      p_hold40_for5wks: +(held40x5 / N).toFixed(4),
      p_trustGE40_at_day30: +(ever40at30d / N).toFixed(4),
    };
  }
  return out;
}

// ---------- PART B: live sim ----------
async function partB(seeds, days) {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { scalecourt } = require('./policies/scalecourt');
  const rows = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'scale-wall' });
    await setupGame(Game);
    const L = {
      linkEvents: [],      // {day, ev, linkId, kind, trust, detail}
      trustTrace: {},      // linkId -> [{day, trust, age}]
      nationalStages: [],  // {day, shape}
      polityFirstDay: null,// first day _havenPolity() non-null
      polityFirstShape: null,
      dawnDay: null,
      daily: {},           // day -> {pantry, roster, rank, links:[{id,kind,trust,age,arrears,seasoned}]}
      prodKcal: 0,         // stockPantry IN (duty production)
      subPantryAtTick: [], // {day, linkId, subPantryKcal}
      breakReasons: {},
    };
    const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
    const pantryKcalOf = () => { try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; } };

    // production IN
    const origStock = Game.stockPantry;
    if (typeof origStock === 'function') {
      Game.stockPantry = function (kcal) {
        try { if (kcal > 0) L.prodKcal += kcal; } catch (e) {}
        return origStock.apply(this, arguments);
      };
    }
    // link lifecycle events
    const noteLink = (ev, link, detail) => {
      try {
        L.linkEvents.push({ day: dayOf(), ev, linkId: link && link.id, kind: link && (link.kind || (link.primary === 'haven' ? 'sub' : 'sup')), trust: link && link.trust, detail: detail || '' });
      } catch (e) {}
    };
    const origForm = Game._formLink;
    if (typeof origForm === 'function') {
      Game._formLink = function () { const l = origForm.apply(this, arguments); try { noteLink('formed', l, 'primary-haven'); } catch (e) {} return l; };
    }
    const origPeer = Game._formPeerLink;
    if (typeof origPeer === 'function') {
      Game._formPeerLink = function () { const l = origPeer.apply(this, arguments); try { noteLink('formed', l, 'peer'); } catch (e) {} return l; };
    }
    const origBreak = Game.breakLink;
    if (typeof origBreak === 'function') {
      Game.breakLink = function (id, how) {
        try {
          const ls = (Game.hierarchyState ? Game.hierarchyState() : []).filter(x => x && x.id === id);
          noteLink('broke', ls[0] || { id }, String(how || ''));
          L.breakReasons[String(how || '?')] = (L.breakReasons[String(how || '?')] || 0) + 1;
        } catch (e) {}
        return origBreak.apply(this, arguments);
      };
    }
    const origStage = Game.stageNationalBeat;
    if (typeof origStage === 'function') {
      Game.stageNationalBeat = function (p) {
        try { L.nationalStages.push({ day: dayOf(), shape: p && p.shape, villages: p && p.villages && p.villages.length }); } catch (e) {}
        return origStage.apply(this, arguments);
      };
    }
    const origDawn = Game.stageFirstAccord;
    // networkLiveDay is set inside; sample daily instead.

    const policy = Object.assign({}, scalecourt);
    const origDaily = scalecourt.daily;
    policy.daily = (G, ctx) => {
      try {
        const day = dayOf();
        if (!L.dawnDay && G.state.networkLive) L.dawnDay = G.state.networkLiveDay || day;
        let pol = null;
        try { pol = G._havenPolity ? G._havenPolity() : null; } catch (e) {}
        if (pol && L.polityFirstDay == null) { L.polityFirstDay = day; L.polityFirstShape = pol.shape; }
        let links = [];
        try { links = G.hierarchyState ? G.hierarchyState() : []; } catch (e) {}
        const active = links.filter(l => l && l.status === 'active');
        // subordinate NPC pantry sampling (weekly)
        if (day % 7 === 0) {
          for (const l of active) {
            if (l.primary === 'haven' && !l.kind) {
              let sov = null;
              try { sov = G._otherVillage ? G._otherVillage(l.subordinate) : null; } catch (e) {}
              L.subPantryAtTick.push({ day, linkId: l.id, sub: l.subordinate, pantryKcal: Math.round((sov && sov.pantryKcal) || 0), trust: l.trust });
            }
          }
        }
        if (day % 5 === 0 || (G.state.nationalLive)) {
          L.daily[day] = {
            pantry: Math.round(pantryKcalOf()),
            roster: ((G.state.village || {}).roster || []).length,
            rank: (G.scaleRank ? G.scaleRank() : '?'),
            nationalLive: !!G.state.nationalLive,
            polity: pol ? pol.shape : null,
            links: active.map(l => ({
              id: String(l.id), kind: l.kind || (l.primary === 'haven' ? 'sub' : 'sup'),
              trust: l.trust, age: day - (l.day || 0), arrears: l.arrears || 0,
              trib: l.tributeKcalPerWeek || 0,
              seasoned: (function () { try { return G._linkSeasoned ? !!G._linkSeasoned(l, !!l.conquered) : null; } catch (e) { return null; } })(),
            })),
          };
        }
        for (const l of active) {
          const k = String(l.id);
          L.trustTrace[k] = L.trustTrace[k] || { kind: l.kind || (l.primary === 'haven' ? 'sub' : 'sup'), formedDay: (l.day || 0), pts: [] };
          const pts = L.trustTrace[k].pts;
          if (!pts.length || pts[pts.length - 1].d !== day) pts.push({ d: day, t: l.trust });
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };

    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
    // post: compute per-link max age + whether ever seasoned
    const linkSummary = Object.entries(L.trustTrace).map(([id, tr]) => {
      const pts = tr.pts;
      const maxT = Math.max(...pts.map(p => p.t));
      const lastT = pts[pts.length - 1].t;
      const daysGE40 = pts.filter(p => p.t >= 40).length; // sampled daily
      return { id, kind: tr.kind, formedDay: tr.formedDay, maxTrust: maxT, lastTrust: lastT, daysGE40 };
    });
    rows.push({
      seed, endReason: result.endReason, gameDays: result.gameDays,
      dawnDay: L.dawnDay, polityFirstDay: L.polityFirstDay, polityFirstShape: L.polityFirstShape,
      nationalStages: L.nationalStages, linkEvents: L.linkEvents, linkSummary,
      breakReasons: L.breakReasons, prodKcal: Math.round(L.prodKcal),
      subPantryAtTick: L.subPantryAtTick,
      daily: L.daily,
      end: {
        rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
        pantry: Math.round(pantryKcalOf()),
        roster: ((Game.state.village || {}).roster || []).length,
        nationalLive: !!Game.state.nationalLive,
      },
    });
    const e = rows[rows.length - 1].end;
    console.error(`seed ${seed}: ${result.endReason} d${result.gameDays} dawn=${L.dawnDay} polityFirst=${L.polityFirstDay}:${L.polityFirstShape} natStages=${L.nationalStages.length} rank=${e.rank} roster=${e.roster} links=${linkSummary.length} breaks=${JSON.stringify(L.breakReasons)}`);
  }
  return rows;
}

(async () => {
  const part = (process.env.PART || 'ALL').toUpperCase();
  const out = {};
  if (part === 'A' || part === 'ALL') { out.partA_trustDrift = partA(); console.error('PART A done'); }
  if (part === 'B' || part === 'ALL') {
    const seeds = (process.env.SEEDS || '11,22,33,44,55,66').split(',').map(s => Number(s.trim())).filter(Boolean);
    const days = parseInt(process.env.DAYS || '200', 10);
    out.partB_sims = await partB(seeds, days);
  }
  const outFile = process.env.OUT || null;
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); console.error('wrote ' + outFile); }
  else console.log(JSON.stringify(out.partA_trustDrift || {}, null, 1));
})();
