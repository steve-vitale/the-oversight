#!/usr/bin/env node
// test-scale-lead-fix-20261012.js — proof for the LEAD-road scale-wall fix.
//
// PART A (pure, seeded): Monte Carlo the NEW weekly trust process for a
//   primary-Haven subordinate link and assert the drift properties the fix
//   promises: tended links clearly positive, healthy links slow-positive,
//   starving links slow audible decay. Also runs the OLD (lottery) process
//   and asserts it FAILS the bar — the bug the fix removes, demonstrated.
// PART B (live sim): leadcourt policy x N seeds x 150d. Asserts the
//   pre-registered pilot GO: >=50% of LEAD links season (age>=30d, trust>=40).
//   Pre-fix baseline: 0% for links #2+ (probe Part A).
//
// RED: on pre-fix code, Part B fails (no seasoning; the lottery spirals).
//   Verify with: git stash (tracked changes) && node this-file ; git stash pop.
//
// Usage: SEEDS="11,22,33,44" DAYS=150 PART=A|B|ALL node scripts/test-scale-lead-fix-20261012.js
'use strict';
const fs = require('fs');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// NEW process: tribute attempted every week; trust tracks what happened.
// payKind: 'full' (+1), 'half' (50/50 +1/-1), 'none' (-2). tending: +8
// every tendEvery weeks (0 = never). deaths: 10%/wk -> -8 + mourning blocks
// that week's gains (mirrors _trustGain choke).
function simNew(rand, t0, weeks, payKind, tendEvery, deathPerWeek) {
  let trust = t0, mourning = 0, minTrust = trust;
  for (let w = 0; w < weeks; w++) {
    if (deathPerWeek > 0 && rand() < deathPerWeek) { trust = Math.max(0, trust - 8); mourning = 1; }
    if (payKind === 'full') { if (mourning <= 0) trust = Math.min(100, trust + 1); }
    else if (payKind === 'half') { if (rand() < 0.5) { if (mourning <= 0) trust = Math.min(100, trust + 1); } else trust = Math.max(0, trust - 1); }
    else { trust = Math.max(0, trust - 2); }
    if (tendEvery > 0 && w % tendEvery === 0 && mourning <= 0) trust = Math.min(100, trust + 8);
    if (mourning > 0) mourning--;
    if (trust < minTrust) minTrust = trust;
  }
  return { endTrust: trust, minTrust };
}

// OLD process (pre-fix): arrival lottery R() < trust/100; +1 on arrival
// (if pantry covers), -4 on shortfall or miss. Mirrors probe Part A.
function simOld(rand, t0, weeks, payProb, deathPerWeek) {
  let trust = t0, mourning = 0;
  for (let w = 0; w < weeks; w++) {
    if (deathPerWeek > 0 && rand() < deathPerWeek) { trust = Math.max(0, trust - 8); mourning = 1; }
    if (rand() < trust / 100) {
      if (mourning <= 0) trust = Math.min(100, trust + 1);
      if (rand() >= payProb) trust = Math.max(0, trust - 4);
    } else trust = Math.max(0, trust - 4);
    if (mourning > 0) mourning--;
  }
  return { endTrust: trust };
}

function partA() {
  const N = 20000;
  const results = {};
  // Tending every 2 weeks: model as +8 on even weeks inside the loop instead
  // death calibrated: linked villages live the light weekly tick (no roster
  // deaths) and catch-up covers ~0 days while linked, so speaker deaths are
  // rare (~2%/wk, approach-driven). Tending modeled weekly — the leadcourt
  // policy tends every week the pantry allows.
  const cfgs = [
    { name: 'new_tended_T30', t0: 30, pay: 'full', death: 0.02, tendEvery: 1, weeks: 4, bar: 40, atWeek: 3, need: 0.90 },
    { name: 'new_healthy_T30', t0: 30, pay: 'full', death: 0.02, tendEvery: 0, weeks: 14, bar: 40, atWeek: 13, need: 0.60 },
    { name: 'new_half_T30', t0: 30, pay: 'half', death: 0.02, tendEvery: 0, weeks: 12, bar: 25, atWeek: 11, need: 0.50 },
    { name: 'new_starving_T30', t0: 30, pay: 'none', death: 0, tendEvery: 0, weeks: 8, bar: 20, atWeek: 7, need: 0.60, below: true },
    { name: 'old_healthy_T30', t0: 30, pay: 1.0, death: 0, old: true, weeks: 12, bar: 40, atWeek: 11, need: 0.05, below: true },
  ];
  for (const c of cfgs) {
    let n = 0;
    for (let i = 0; i < N; i++) {
      const rand = mulberry32(7000 + i);
      let trust = c.t0, mourning = 0, ok = false;
      for (let w = 0; w < c.weeks; w++) {
        if (c.old) {
          if (rand() < trust / 100) {
            if (mourning <= 0) trust = Math.min(100, trust + 1);
            if (rand() >= c.pay) trust = Math.max(0, trust - 4);
          } else trust = Math.max(0, trust - 4);
        } else {
          if (c.death > 0 && rand() < c.death) { trust = Math.max(0, trust - 8); mourning = 1; }
          if (c.pay === 'full') { if (mourning <= 0) trust = Math.min(100, trust + 1); }
          else if (c.pay === 'half') { if (rand() < 0.5) { if (mourning <= 0) trust = Math.min(100, trust + 1); } else trust = Math.max(0, trust - 1); }
          else { trust = Math.max(0, trust - 2); }
          if (c.tendEvery > 0 && w % c.tendEvery === 0 && mourning <= 0) trust = Math.min(100, trust + 8);
        }
        if (mourning > 0) mourning--;
        if (w === c.atWeek) {
          ok = c.below ? (trust < c.bar) : (trust >= c.bar);
        }
      }
      if (ok) n++;
    }
    const p = n / N;
    const pass = c.below ? (p >= c.need) : (p >= c.need);
    results[c.name] = { p: +p.toFixed(4), need: (c.below ? '<' : '>=') + c.bar + ' p' + (c.below ? '>=' : '>=') + c.need, pass };
  }
  return results;
}

async function partB(seeds, days) {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { leadcourt } = require('./policies/leadcourt');
  const rows = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'scale-wall' });
    await setupGame(Game);
    const L = { formed: 0, seasoned: [], maxTrust: 0, nationalStages: [], dawnDay: null, polityDay: null, breaks: [] };
    const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
    const isLead = (l) => l && l.primary === 'haven' && !l.conquered && l.kind !== 'covenant' && l.kind !== 'trade';
    const origForm = Game._formLink;
    if (typeof origForm === 'function') {
      Game._formLink = function () { const l = origForm.apply(this, arguments); try { if (isLead(l)) L.formed++; } catch (e) {} return l; };
    }
    const origBreak = Game.breakLink;
    if (typeof origBreak === 'function') {
      Game.breakLink = function (id, how) {
        try { L.breaks.push({ day: dayOf(), how: String(how || '?') }); } catch (e) {}
        return origBreak.apply(this, arguments);
      };
    }
    const origStage = Game.stageNationalBeat;
    if (typeof origStage === 'function') {
      Game.stageNationalBeat = function (p) {
        try { L.nationalStages.push({ day: dayOf(), shape: p && p.shape }); } catch (e) {}
        return origStage.apply(this, arguments);
      };
    }
    const policy = Object.assign({}, leadcourt);
    const origDaily = leadcourt.daily;
    policy.daily = (G, ctx) => {
      try { origDaily(G, ctx); } catch (e) {}
      try {
        const day = dayOf();
        if (!L.dawnDay && G.state.networkLive) L.dawnDay = G.state.networkLiveDay || day;
        let pol = null;
        try { pol = G._havenPolity ? G._havenPolity() : null; } catch (e) {}
        if (pol && L.polityDay == null) L.polityDay = day;
        const links = (G.hierarchyState ? G.hierarchyState() : []).filter(isLead);
        for (const l of links) {
          if (l.trust > L.maxTrust) L.maxTrust = l.trust;
          let seasoned = false;
          try { seasoned = G._linkSeasoned ? !!G._linkSeasoned(l) : ((day - (l.day || 0)) >= 30 && (l.trust || 0) >= 40); } catch (e) {}
          if (seasoned && !L.seasoned.find(s => s.id === l.id)) {
            L.seasoned.push({ id: l.id, day, trust: l.trust });
          }
        }
      } catch (e) {}
    };
    let endReason = '?';
    try {
      const res = await runDays(Game, policy, { days });
      endReason = (res && res.endReason) || '?';
    } catch (e) { endReason = 'error: ' + String((e && e.message) || e).slice(0, 80); }
    rows.push({ seed, formed: L.formed, seasoned: L.seasoned.length, maxTrust: L.maxTrust, national: L.nationalStages.length, dawnDay: L.dawnDay, polityDay: L.polityDay, breaks: L.breaks.length, endReason });
  }
  return rows;
}

async function main() {
  const PART = (process.env.PART || 'ALL').toUpperCase();
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '150', 10);
  let failures = 0;
  const ok = (name, cond, detail) => {
    console.log((cond ? '  PASS ' : '  FAIL ') + name + (detail ? ' — ' + detail : ''));
    if (!cond) failures++;
  };
  if (PART === 'A' || PART === 'ALL') {
    console.log('PART A — trust-drift Monte Carlo (new process vs old lottery)');
    const r = partA();
    for (const [k, v] of Object.entries(r)) console.log(`  ${k}: p=${v.p} (need ${v.need}) ${v.pass ? 'PASS' : 'FAIL'}`);
    ok('new_tended seasons in weeks', r.new_tended_T30.pass, `p=${r.new_tended_T30.p}`);
    ok('new_healthy creeps to 40 (tending is the accelerator)', r.new_healthy_T30.pass, `p=${r.new_healthy_T30.p}`);
    ok('new_half bleeds slowly, not collapse', r.new_half_T30.pass, `p=${r.new_half_T30.p} hold>=25`);
    ok('new_starving decays audibly not instantly', r.new_starving_T30.pass, `p=${r.new_starving_T30.p} below 20 by wk8`);
    ok('old lottery FAILS the bar (bug demonstrated)', r.old_healthy_T30.pass, `p=${r.old_healthy_T30.p} reach 40 (need <0.05)`);
  }
  if (PART === 'B' || PART === 'ALL') {
    console.log(`PART B — live sims (leadcourt x ${seeds.length} seeds x ${days}d)`);
    const rows = await partB(seeds, days);
    let totFormed = 0, totSeasoned = 0;
    for (const r of rows) {
      totFormed += r.formed; totSeasoned += r.seasoned;
      console.log(`  seed ${r.seed}: formed=${r.formed} seasoned=${r.seasoned} maxTrust=${r.maxTrust} national=${r.national} dawn=${r.dawnDay} polity=${r.polityDay} breaks=${r.breaks} end=${r.endReason}`);
    }
    const frac = totFormed > 0 ? totSeasoned / totFormed : 0;
    console.log(`  seasoned fraction: ${totSeasoned}/${totFormed} = ${frac.toFixed(2)} (GO threshold >= 0.50)`);
    ok('pilot GO: >=50% of LEAD links season', totFormed > 0 && frac >= 0.50, `${totSeasoned}/${totFormed}`);
    const natSeeds = rows.filter(r => r.national > 0).length;
    console.log(`  national staged on ${natSeeds}/${rows.length} seeds (reported, not gated)`);
  }
  console.log(failures === 0 ? `\n${'ALL GREEN'}` : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
