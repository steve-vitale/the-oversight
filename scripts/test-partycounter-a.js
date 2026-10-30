#!/usr/bin/env node
// scripts/test-partycounter-a.js — sim-partycounter-a analyzer + judge.
//
// Reads the partycounter band (evidence/2026-10-29/perseed-partycounter-a/
// on, overridable via CORDIR env), index-joins fieldparty / tilejoin /
// shoutrec rows per seed, and prices the PARTY counterfactual for
// shout-joined wild fights: if EVERY villager on the fight tile at
// shout time had joined, with real observed per-round damage, do the
// kill-flip and survival-flip multipliers become bridgeable?
//
// MEASUREMENT ONLY. No game code is touched, no join mechanism is
// simulated (the engine takes exactly one ally per shout); the
// counterfactual is analytic pricing from recorded state.
//
// Single-ally prices reuse the shoutrec formulas verbatim. Party
// primary (equal-rate bound): party DPR = N x observed ally DPR,
// pKill = kKill / N, pSurv = kSurv / N, N = tileAll.length (uncapped).
// Sensitivity (per-mate observed rates): each mate's own DPR from
// other U fights in the same seed (Tier A: own ally data; Tier B:
// own leader data; Tier C: joined ally's rate fallback; Tier SELF:
// the joined ally's rate in this fight).
//
// Universe U (tilejoin / breakline verbatim): fieldparty channel ==
// 'field', caller in {resolve, patrol, aid}, wave 1..4, leader NOT the
// scholar, fought (rounds >= 1). Addressable = shout-joined with
// allyActiveRounds > 0. Floor-branch (active == 0) reported
// separately, never folded into the party median.
//
// Exit 0 iff analyzer legs pass (coverage + join integrity +
// sense slots available). Determinism (scratch re-run byte-identity)
// is verified separately and combined with this exit code in the
// evidence verdict — see the prereg.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const CORDIR = process.env.CORDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-partycounter-a', 'on');

function median(arr) {
  // Standard median (shoutrec convention for prices): middle value, or
  // mean of the two middles for even n.
  if (!arr.length) return NaN;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function medianDays(arr) {
  // Upper-middle row (breakline / tilejoin convention for survival days).
  if (!arr.length) return NaN;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function shareLE(arr, t) {
  if (!arr.length) return NaN;
  return arr.filter(k => k <= t).length / arr.length;
}
function fmt(x, d) {
  if (x == null || (typeof x === 'number' && !Number.isFinite(x))) return 'inf';
  return x.toFixed(d == null ? 2 : d);
}

// ---- pricing core (shoutrec formulas verbatim, plus party division) ----
function priceSingle(j) {
  // j: {shoutRound, shoutMhp, shoutMmax, shoutVhp, shoutMdealt,
  //     shoutVtaken, shoutMbreak, rounds, allyDealt}
  const S = j.shoutRound;
  const mDpr = j.shoutVtaken / S;
  const rtdS = j.shoutVhp / Math.max(1, mDpr);
  const rtkS = j.shoutMhp / Math.max(1, j.shoutMdealt / S);
  const active = Math.max(0, j.rounds - S);
  const observed = active > 0 ? j.allyDealt / active : 0;
  const needS = j.shoutMhp - j.shoutMbreak * j.shoutMmax;
  const out = { rtdS, rtkS, active, observed, needS, hopelessCheck: rtdS < rtkS * 0.85,
    kKill: null, kSurv: null, kind: null };
  if (active === 0) { out.kind = 'zero-window'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  if (observed <= 0) { out.kind = 'active-zero-dealt'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  out.kKill = (j.shoutMhp / rtdS) / observed;
  if (needS <= 0) { out.kSurv = 0; out.kind = 'already-below-break'; }
  else { out.kSurv = (needS / rtdS) / observed; out.kind = 'priced'; }
  return out;
}
function priceParty(p, N, partyDpr) {
  // p: single-ally price; N: party size; partyDpr: summed mate rates.
  // Primary (equal-rate) calls this with partyDpr = N * observed.
  if (p.kind === 'zero-window' || p.kind === 'active-zero-dealt') {
    return { pKill: Infinity, pSurv: Infinity, kind: p.kind };
  }
  if (!(partyDpr > 0)) return { pKill: Infinity, pSurv: Infinity, kind: 'party-dpr-zero' };
  const pKill = (p.kKill * p.observed) / partyDpr; // == kKill / N for equal-rate
  const pSurv = p.kind === 'already-below-break' ? 0 : (p.kSurv * p.observed) / partyDpr;
  return { pKill, pSurv, kind: p.kind };
}

// ---- fixtures (must all pass before any judged output) ----
let fxPass = 0, fxFail = 0;
function ck(name, ok, detail) {
  if (ok) { fxPass++; } else { fxFail++; console.log(`FIXTURE-FAIL ${name} :: ${detail}`); }
}
function runFixtures() {
  // Single-ally prices, hand-computed.
  const p = priceSingle({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15, rounds: 4, allyDealt: 10 });
  ck('rtd 5.00', Math.abs(p.rtdS - 5) < 1e-9, `rtdS=${p.rtdS}`);
  ck('kill-flip 4.00x', Math.abs(p.kKill - 4) < 1e-9, `kKill=${p.kKill}`);
  ck('survival-flip 2.80x', Math.abs(p.kSurv - 2.8) < 1e-9, `kSurv=${p.kSurv}`);
  ck('needS 70', Math.abs(p.needS - 70) < 1e-9, `needS=${p.needS}`);
  ck('hopeless check false when equal', p.hopelessCheck === false, `rtdS=${p.rtdS} rtkS=${p.rtkS}`);
  const ph = priceSingle({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 30,
    shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15, rounds: 4, allyDealt: 10 });
  ck('hopeless check true when short', ph.hopelessCheck === true, `rtdS=${ph.rtdS} rtkS=${ph.rtkS}`);
  // Party primary: N=2 at equal rate halves both prices.
  const pp = priceParty(p, 2, 2 * p.observed);
  ck('party kill 2.00x', Math.abs(pp.pKill - 2) < 1e-9, `pKill=${pp.pKill}`);
  ck('party surv 1.40x', Math.abs(pp.pSurv - 1.4) < 1e-9, `pSurv=${pp.pSurv}`);
  // Party sensitivity: summed DPR 4x observed quarters the prices.
  const ps = priceParty(p, 2, 4 * p.observed);
  ck('sens kill 1.00x', Math.abs(ps.pKill - 1) < 1e-9, `pKill=${ps.pKill}`);
  ck('sens surv 0.70x', Math.abs(ps.pSurv - 0.7) < 1e-9, `pSurv=${ps.pSurv}`);
  // Zero-window / active-zero-dealt stay infinite under party pricing.
  const f0 = priceSingle({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 20,
    shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15, rounds: 2, allyDealt: 0 });
  ck('zero-window infinite', f0.kind === 'zero-window' && !Number.isFinite(f0.kKill), `kind=${f0.kind}`);
  ck('zero-window party infinite', !Number.isFinite(priceParty(f0, 5, 25).pKill), 'party must stay infinite');
  const az = priceSingle({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15, rounds: 3, allyDealt: 0 });
  ck('active-zero-dealt infinite', az.kind === 'active-zero-dealt' && !Number.isFinite(az.kKill), `kind=${az.kind}`);
  // Already-below-break: survival price 0, party survival 0, kill finite.
  const ab = priceSingle({ shoutRound: 2, shoutMhp: 24, shoutMmax: 260, shoutVhp: 16,
    shoutMdealt: 50, shoutVtaken: 25, shoutMbreak: 0.15, rounds: 3, allyDealt: 5 });
  ck('already-below-break kSurv=0', ab.kind === 'already-below-break' && ab.kSurv === 0, `needS=${ab.needS}`);
  ck('already-below-break party surv 0', priceParty(ab, 3, 7.5).pSurv === 0, 'party surv must stay 0');
  // Median conventions + shares.
  ck('median even (standard)', median([1, 2, 3, 4]) === 2.5, `median=${median([1, 2, 3, 4])}`);
  ck('medianDays upper-middle', medianDays([1, 2, 3, 4]) === 3, `medianDays=${medianDays([1, 2, 3, 4])}`);
  ck('shareLE', Math.abs(shareLE([0.5, 1, 2, 5], 1.5) - 0.5) < 1e-9, 'share');
  console.log(`FIXTURES: ${fxPass} passed, ${fxFail} failed`);
  return fxFail === 0;
}

// ---- census ----
function loadRows() {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(CORDIR, `s${seed}-fresh.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}

function main() {
  if (!runFixtures()) { console.log('FIXTURES-FAIL'); process.exit(2); }
  const rows = loadRows();
  const out = { joinErrors: 0, allyNotOnTile: 0, noShoutUnexplained: 0,
    shoutAllyDealtNonzero: 0, nonFedShoutJoined: 0, uFought: 0, joined: [],
    floor: [], activeZero: [], addressable: [], addressableDenom: 0,
    noShout: [], wall: null };
  let won = 0, wonFull = 0, natEver = 0, natFinal = 0, table = 0, entered = 0,
    wave4 = 0, wave5 = 0, starv = 0, deaths = 0;
  const days = [];
  const deathsByCause = {};
  const tierCounts = { SELF: 0, A: 0, B: 0, C: 0 };

  for (const r of rows) {
    won += r.won; natEver += r.nationalEver; natFinal += r.nationalFinal;
    table += r.table; entered += r.entered; starv += r.starvationDeaths; deaths += r.deathTotal;
    days.push(r.days);
    if (r.won && r.tableState && r.tableState.seat === 'full') wonFull++;
    if ((r.waveReach || 1) >= 4) wave4++;
    if ((r.waveReach || 1) >= 5) wave5++;
    for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
    const fp = (r.fieldparty || {}).meetings || [];
    const tj = (r.tilejoin || {}).meetings || [];
    const sr = (r.shoutrec || {}).meetings || [];
    if (fp.length !== tj.length || fp.length !== sr.length) {
      out.joinErrors += Math.abs(fp.length - tj.length) + Math.abs(fp.length - sr.length);
    }
    // Per-seed mate rate tables (U fights only; this fight contributes
    // nothing to a non-joined mate's aggregates, so no exclusion needed).
    const allyAgg = new Map(); // vid -> {dealt, active}
    const leaderAgg = new Map(); // vid -> {dealt, rounds}
    const uIdx = [];
    for (let i = 0; i < fp.length; i++) {
      const f = fp[i], t = tj[i], s = sr[i];
      if (!t || !s) { out.joinErrors++; continue; }
      if (f.day !== t.day || String(f.vid) !== String(t.vid) || String(f.mid) !== String(t.mid) ||
          f.day !== s.day || String(f.vid) !== String(s.vid) || String(f.mid) !== String(s.mid) ||
          (f.rounds | 0) !== (t.rounds | 0) || (f.rounds | 0) !== (s.rounds | 0)) out.joinErrors++;
      const leader = f.leader || {};
      const isU = f.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(f.caller) >= 0 &&
        f.wave >= 1 && f.wave <= 4 && leader.isScholar !== true;
      if (!isU) continue;
      if (!((f.rounds | 0) >= 1)) continue;
      uIdx.push(i);
      const lv = String(t.vid);
      const la = leaderAgg.get(lv) || { dealt: 0, rounds: 0 };
      la.dealt += (t.mDealt | 0); la.rounds += (t.rounds | 0);
      leaderAgg.set(lv, la);
      if (t.joinedAllyVid) {
        const av = String(t.joinedAllyVid);
        let active = null;
        if (s.shoutRound != null) active = Math.max(0, (t.rounds | 0) - (s.shoutRound | 0));
        else if (s.allyFromStart) active = (t.rounds | 0);
        if (active != null && active > 0) {
          const aa = allyAgg.get(av) || { dealt: 0, active: 0 };
          aa.dealt += (t.allyDealt | 0); aa.active += active;
          allyAgg.set(av, aa);
        }
      }
    }
    for (const i of uIdx) {
      const f = fp[i], t = tj[i], s = sr[i];
      out.uFought++;
      if (!t.joinedAllyVid) continue;
      const joined = { seed: r.seed, day: t.day, vid: t.vid, mid: t.mid, wave: t.wave,
        caller: t.caller, rounds: t.rounds, outcome: t.outcome, intent: t.intent,
        everHopeless: !!t.everHopeless, joinedAllyVid: String(t.joinedAllyVid),
        allyDealt: t.allyDealt | 0, allyTaken: t.allyTaken | 0,
        fed: !!t.fed, fedVids: (t.fedVids || []).map(String),
        tileAll: (t.tileAll || []).map(String),
        tileFed: (t.tileFed || []).map(x => x.vid),
        shoutRound: s.shoutRound, shoutMhp: s.shoutMhp, shoutMmax: s.shoutMmax,
        shoutVhp: s.shoutVhp, shoutVhpMax: s.shoutVhpMax, shoutMdealt: s.shoutMdealt,
        shoutVtaken: s.shoutVtaken, shoutAllyDealt: s.shoutAllyDealt,
        shoutMbreak: s.shoutMbreak, allyFromStart: !!s.allyFromStart };
      out.joined.push(joined);
      // Join integrity: joined ally must be a tile mate.
      if (joined.tileAll.indexOf(joined.joinedAllyVid) < 0) { out.allyNotOnTile++; out.joinErrors++; }
      if (!joined.fed) out.nonFedShoutJoined++;
      if (s.shoutRound == null) {
        if (s.allyFromStart) joined.noShoutKind = 'ally-from-start';
        else { joined.noShoutKind = 'unexplained'; out.noShoutUnexplained++; }
        out.noShout.push(joined);
        continue;
      }
      if ((s.shoutAllyDealt | 0) !== 0) out.shoutAllyDealtNonzero++;
      const p = priceSingle({ shoutRound: s.shoutRound, shoutMhp: s.shoutMhp,
        shoutMmax: s.shoutMmax, shoutVhp: s.shoutVhp, shoutMdealt: s.shoutMdealt,
        shoutVtaken: s.shoutVtaken, shoutMbreak: s.shoutMbreak,
        rounds: t.rounds, allyDealt: t.allyDealt });
      Object.assign(joined, { rtdS: p.rtdS, rtkS: p.rtkS, activeRounds: p.active,
        observedDpr: p.observed, needS: p.needS, kKill: p.kKill, kSurv: p.kSurv, priceKind: p.kind,
        N: joined.tileAll.length });
      if (p.kind === 'zero-window') { out.floor.push(joined); continue; }
      out.addressableDenom++; // shout-joined with a positive window (prereg denominator)
      // Party primary (equal-rate) + sensitivity (per-mate observed rates).
      const N = joined.tileAll.length;
      const prim = priceParty(p, N, N * p.observed);
      let sensDpr = 0;
      const tiers = [];
      for (const mv of joined.tileAll) {
        if (mv === joined.joinedAllyVid) { sensDpr += p.observed; tiers.push('SELF'); tierCounts.SELF++; }
        else if (allyAgg.has(mv) && allyAgg.get(mv).active > 0) {
          const a = allyAgg.get(mv); sensDpr += a.dealt / a.active; tiers.push('A'); tierCounts.A++;
        } else if (leaderAgg.has(mv) && leaderAgg.get(mv).rounds > 0) {
          const l = leaderAgg.get(mv); sensDpr += l.dealt / l.rounds; tiers.push('B'); tierCounts.B++;
        } else { sensDpr += p.observed; tiers.push('C'); tierCounts.C++; }
      }
      const sens = priceParty(p, N, sensDpr);
      Object.assign(joined, { pKill: prim.pKill, pSurv: prim.pSurv,
        sKill: sens.pKill, sSurv: sens.pSurv, sensDpr, tiers });
      if (Number.isFinite(prim.pKill) && Number.isFinite(prim.pSurv)) out.addressable.push(joined);
      else out.activeZero.push(joined); // active-zero-dealt: infinite, kept out of medians
    }
  }
  out.wall = { won, wonFull, natEver, natFinal, table, entered, wave4, wave5,
    medianDays: medianDays(days), starv, deaths, deathsByCause, days };
  out.tierCounts = tierCounts;

  // ---- report ----
  const J = out.joined, A = out.addressable, F = out.floor, AZ = out.activeZero;
  const killXs = A.map(j => j.kKill), survXs = A.map(j => j.kSurv);
  const pKillXs = A.map(j => j.pKill), pSurvXs = A.map(j => j.pSurv);
  const sKillXs = A.map(j => j.sKill), sSurvXs = A.map(j => j.sSurv);
  const finiteBoth = A.filter(j => Number.isFinite(j.kKill) && Number.isFinite(j.kSurv));
  console.log('=== sim-partycounter-a ===');
  console.log(`U fought=${out.uFought} joined=${J.length} shout-joined=${J.length - out.noShout.length} ` +
    `no-shout=${out.noShout.length} (ally-from-start=${out.noShout.filter(j => j.noShoutKind === 'ally-from-start').length} ` +
    `unexplained=${out.noShoutUnexplained}) floor-zero-window=${F.filter(j => j.priceKind === 'zero-window').length} ` +
    `active-zero-dealt=${F.filter(j => j.priceKind === 'active-zero-dealt').length}`);
  console.log(`JOIN-INTEGRITY: joinErrors=${out.joinErrors} allyNotOnTile=${out.allyNotOnTile} ` +
    `nonFedShoutJoined=${out.nonFedShoutJoined} shoutAllyDealtNonzero=${out.shoutAllyDealtNonzero}`);
  console.log(`ADDRESSABLE (shout-joined, window > 0): denom=${out.addressableDenom} priced-finite-both=${finiteBoth.length} ` +
    `active-zero-dealt=${AZ.length}; DIAG-GO bar needs >=80% of addressable finite for BOTH flips`);
  console.log(`BEFORE (single-ally, own band): kKill median=${fmt(median(killXs))}x kSurv median=${fmt(median(survXs))}x`);
  for (const t of [1, 1.5, 3, 5]) {
    console.log(`  BEFORE share <= ${t}x: kKill ${fmt(shareLE(killXs, t) * 100, 1)}% (${killXs.filter(k => k <= t).length}/${killXs.length}); ` +
      `kSurv ${fmt(shareLE(survXs, t) * 100, 1)}% (${survXs.filter(k => k <= t).length}/${survXs.length})`);
  }
  console.log(`PARTY PRIMARY (equal-rate, N mates): pKill median=${fmt(median(pKillXs))}x pSurv median=${fmt(median(pSurvXs))}x`);
  for (const t of [1, 1.5, 3, 5]) {
    console.log(`  PARTY share <= ${t}x: pKill ${fmt(shareLE(pKillXs, t) * 100, 1)}% (${pKillXs.filter(k => k <= t).length}/${pKillXs.length}); ` +
      `pSurv ${fmt(shareLE(pSurvXs, t) * 100, 1)}% (${pSurvXs.filter(k => k <= t).length}/${pSurvXs.length}); ` +
      `all-joined-denom pSurv ${fmt(shareLE(pSurvXs, t) * 100 * pSurvXs.length / Math.max(1, J.length), 1)}% (${pSurvXs.filter(k => k <= t).length}/${J.length})`);
  }
  console.log(`PARTY SENSITIVITY (per-mate observed rates): sKill median=${fmt(median(sKillXs))}x sSurv median=${fmt(median(sSurvXs))}x`);
  for (const t of [1, 1.5, 3, 5]) {
    console.log(`  SENS share <= ${t}x: sKill ${fmt(shareLE(sKillXs, t) * 100, 1)}% (${sKillXs.filter(k => k <= t).length}/${sKillXs.length}); ` +
      `sSurv ${fmt(shareLE(sSurvXs, t) * 100, 1)}% (${sSurvXs.filter(k => k <= t).length}/${sSurvXs.length})`);
  }
  console.log(`TIER MIX (mates across addressable fights): SELF=${tierCounts.SELF} A=${tierCounts.A} B=${tierCounts.B} C=${tierCounts.C}`);
  // N distribution.
  const nDist = {};
  for (const j of J) nDist[j.N] = (nDist[j.N] || 0) + 1;
  const nDistA = {};
  for (const j of A) nDistA[j.N] = (nDistA[j.N] || 0) + 1;
  const nDistF = {};
  for (const j of F) nDistF[j.N] = (nDistF[j.N] || 0) + 1;
  const nDistAZ = {};
  for (const j of AZ) nDistAZ[j.N] = (nDistAZ[j.N] || 0) + 1;
  console.log(`N DISTRIBUTION (tileAll count): all-joined ${JSON.stringify(nDist)}; addressable ${JSON.stringify(nDistA)}; floor-zero-window ${JSON.stringify(nDistF)}; active-zero-dealt ${JSON.stringify(nDistAZ)}`);
  const beyondFed = J.filter(j => j.N > 2).length;
  console.log(`Fights with N > 2 (party beyond the engine 2-cap feed): ${beyondFed}/${J.length}`);
  // Wave splits.
  for (const w of [1, 2, 3, 4]) {
    const sub = A.filter(j => j.wave === w);
    if (!sub.length) { console.log(`  wave ${w}: addressable n=0`); continue; }
    console.log(`  wave ${w}: addressable n=${sub.length} median kKill=${fmt(median(sub.map(j => j.kKill)))}x ` +
      `kSurv=${fmt(median(sub.map(j => j.kSurv)))}x pKill=${fmt(median(sub.map(j => j.pKill)))}x ` +
      `pSurv=${fmt(median(sub.map(j => j.pSurv)))}x sSurv=${fmt(median(sub.map(j => j.sSurv)))}x ` +
      `pSurv<=1.5x ${sub.filter(j => j.pSurv <= 1.5).length}/${sub.length}`);
  }
  // Floor line.
  console.log(`FLOOR-BRANCH (separate, never folded): n=${F.length} share of joined=${fmt(F.length / Math.max(1, J.length) * 100, 1)}%`);
  for (const j of F) {
    console.log(`  FLOOR s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} N=${j.N} kind=${j.priceKind}`);
  }
  console.log(`ACTIVE-ZERO-DEALT (separate, infinite, never folded): n=${AZ.length}`);
  for (const j of AZ) {
    console.log(`  AZ s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} N=${j.N} kind=${j.priceKind}`);
  }
  // Per-fight table.
  console.log('PER-FIGHT (addressable only):');
  for (const j of A) {
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} ally=${j.joinedAllyVid} ` +
      `N=${j.N} S=${j.shoutRound} HPs=${j.shoutMhp} vHps=${j.shoutVhp} Mmax=${j.shoutMmax} rtdS=${fmt(j.rtdS)} ` +
      `obs=${fmt(j.observedDpr)} kKill=${fmt(j.kKill)} kSurv=${fmt(j.kSurv)} pKill=${fmt(j.pKill)} pSurv=${fmt(j.pSurv)} ` +
      `sKill=${fmt(j.sKill)} sSurv=${fmt(j.sSurv)} sensDpr=${fmt(j.sensDpr)} tiers=${j.tiers.join(',')} kind=${j.priceKind}`);
  }
  console.log('PER-FIGHT (joined, not addressable):');
  for (const j of J) {
    if (A.indexOf(j) >= 0) continue;
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} ally=${j.joinedAllyVid} ` +
      `N=${j.N} S=${j.shoutRound} kind=${j.priceKind || j.noShoutKind}`);
  }
  // Wall numbers (report-only).
  const W = out.wall;
  console.log(`WALL (report-only): won=${W.won} (full=${W.wonFull}) natEver=${W.natEver} natFinal=${W.natFinal} ` +
    `table=${W.table} entered=${W.entered} wave4=${W.wave4} wave5=${W.wave5} median=${W.medianDays}d ` +
    `starv=${W.starv} deaths=${W.deaths} days=[${W.days.join(',')}]`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(W.deathsByCause)}`);
  // Sense slots available.
  let senseCount = 0;
  for (const r of rows) {
    const tjSense = (r.tilejoin || {}).sense || {};
    const srSense = (r.shoutrec || {}).sense || {};
    if (tjSense.joined) senseCount++;
    if (srSense.joined) senseCount++;
    const tj = tjSense.joined, sr = srSense.joined;
    console.log(`  SENSE s${r.seed}: tilejoin-joined=${tj ? `d${tj.day} ${tj.vid} vs ${tj.mid} ${tj.outcome} fed=[${(tj.fedVids || []).join(',')}] logLines=${(tj.log || []).length}` : 'none'}; ` +
      `shoutrec-joined=${sr ? `d${sr.day} ${sr.vid} vs ${sr.mid} ${sr.outcome} logLines=${(sr.log || []).length}` : 'none'}`);
  }
  console.log(`SENSE-SLOTS: ${senseCount} joined slots across ${rows.length} seeds (bar needs >=3 transcripts read, judged in evidence)`);
  // Drift diagnostic vs shoutrec published recompute targets (NOT a verdict leg).
  const allyDealtTot = J.reduce((t, j) => t + j.allyDealt, 0);
  const allyTakenTot = J.reduce((t, j) => t + j.allyTaken, 0);
  const outc = {};
  for (const j of J) outc[j.outcome] = (outc[j.outcome] || 0) + 1;
  console.log(`DRIFT-DIAGNOSTIC (vs shoutrec published 24 joined, 2/4/15/3, dealt 137 / taken 296 — reference only, never a leg): ` +
    `joined=${J.length} outcomes=${JSON.stringify(outc)} dealt=${allyDealtTot} taken=${allyTakenTot}`);
  // Judge.
  const coverage = out.addressableDenom ? finiteBoth.length / out.addressableDenom : 0;
  const legs = {
    coverage: coverage >= 0.8,
    joinIntegrity: out.joinErrors === 0 && out.noShoutUnexplained === 0 && out.shoutAllyDealtNonzero === 0,
    senseSlots: senseCount >= 3,
  };
  console.log(`LEGS: coverage=${legs.coverage} (${finiteBoth.length}/${out.addressableDenom}) joinIntegrity=${legs.joinIntegrity} senseSlots=${legs.senseSlots}`);
  const pass = legs.coverage && legs.joinIntegrity && legs.senseSlots;
  console.log(pass ? 'MACHINE-LEGS-PASS' : 'MACHINE-LEGS-FAIL');
  return pass;
}

const ok = main();
process.exit(ok ? 0 : 1);
