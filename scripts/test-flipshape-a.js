#!/usr/bin/env node
// scripts/test-flipshape-a.js — sim-flipshape-a analyzer + judge.
//
// Reads the flipshape band (evidence/2026-10-29/perseed-flipshape-a/
// on, overridable via CORDIR env), index-joins fieldparty / tilejoin /
// shoutrec rows per seed, and prices the MECHANISM-CLASS decomposition
// for LOST shout-joined fights (vFlee/vDie), holding damage output
// fixed at its observed post-shout rate:
//
//   (A) staying, shout-anchored shortfall (rounds, signed):
//       A = needS / postDPR - rtdS
//   (B) mitigation, window-survival factor (capped at 1.0):
//       f = min(1, (vHps - floorHP) / incomingPost), floorHP =
//       shoutFleeAt * shoutVhpMax for vFlee, 0 for vDie
//   (C) flee-window, end-anchored extension (rounds, signed):
//       C = needEnd / postDPR
//
// where postDPR = (final mDealt - shoutMdealt) / active,
// incomingPost = final vTaken - shoutVtaken, rtdS = shoutVhp /
// max(1, shoutVtaken / S), needS = shoutMhp - shoutMbreak *
// shoutMmax, needEnd = final mHpLeft - shoutMbreak * shoutMmax.
//
// MEASUREMENT ONLY. No game code is touched, no mechanism is
// simulated; every price is analytic from recorded state.
//
// Floor-branch (active == 0) and active-zero-dealt (active > 0,
// allyDealt == 0) lost fights are reported separately, never folded
// into medians, following partycounter discipline.
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
const CORDIR = process.env.CORDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-flipshape-a', 'on');

function median(arr) {
  if (!arr.length) return NaN;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function medianDays(arr) {
  if (!arr.length) return NaN;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function shareLE(arr, t) {
  if (!arr.length) return NaN;
  return arr.filter(k => k <= t).length / arr.length;
}
function shareGE(arr, t) {
  if (!arr.length) return NaN;
  return arr.filter(k => k >= t).length / arr.length;
}
function fmt(x, d) {
  if (x == null || (typeof x === 'number' && !Number.isFinite(x))) return 'inf';
  return x.toFixed(d == null ? 2 : d);
}

// ---- mechanism pricing core (prereg formulas verbatim) ----
function priceFlip(j) {
  // j: {shoutRound, shoutMhp, shoutMmax, shoutVhp, shoutVhpMax,
  //     shoutMdealt, shoutVtaken, shoutMbreak, shoutFleeAt, rounds,
  //     finalMDealt, finalVTaken, finalMHpLeft, outcome}
  const S = j.shoutRound;
  const active = Math.max(0, j.rounds - S);
  const postDPR = active > 0 ? (j.finalMDealt - j.shoutMdealt) / active : 0;
  const incomingPost = j.finalVTaken - j.shoutVtaken;
  const rtdS = j.shoutVhp / Math.max(1, j.shoutVtaken / S);
  const needS = j.shoutMhp - j.shoutMbreak * j.shoutMmax;
  const needEnd = j.finalMHpLeft - j.shoutMbreak * j.shoutMmax;
  const out = { active, postDPR, incomingPost, rtdS, needS, needEnd,
    A: null, B: null, Braw: null, C: null, Akill: null, Ckill: null, kind: 'priced' };
  if (postDPR > 0) {
    out.A = needS / postDPR - rtdS;
    out.C = needEnd / postDPR;
    out.Akill = j.shoutMhp / postDPR - rtdS;
    out.Ckill = j.finalMHpLeft / postDPR;
  } else { out.kind = 'post-dpr-zero'; }
  if (incomingPost > 0) {
    const floorHP = j.outcome === 'vDie' ? 0 : j.shoutFleeAt * j.shoutVhpMax;
    out.Braw = (j.shoutVhp - floorHP) / incomingPost;
    out.B = Math.min(1.0, out.Braw);
  } else if (out.kind === 'priced') { out.kind = 'incoming-post-zero'; }
  return out;
}
function priceSingle(j) {
  // Shoutrec formulas verbatim (before leg): kKill / kSurv.
  const S = j.shoutRound;
  const mDpr = j.shoutVtaken / S;
  const rtdS = j.shoutVhp / Math.max(1, mDpr);
  const active = Math.max(0, j.rounds - S);
  const observed = active > 0 ? j.allyDealt / active : 0;
  const needS = j.shoutMhp - j.shoutMbreak * j.shoutMmax;
  const out = { rtdS, active, observed, needS, kKill: null, kSurv: null, kind: null };
  if (active === 0) { out.kind = 'zero-window'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  if (observed <= 0) { out.kind = 'active-zero-dealt'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  out.kKill = (j.shoutMhp / rtdS) / observed;
  if (needS <= 0) { out.kSurv = 0; out.kind = 'already-below-break'; }
  else { out.kSurv = (needS / rtdS) / observed; out.kind = 'priced'; }
  return out;
}

// ---- fixtures (must all pass before any judged output) ----
let fxPass = 0, fxFail = 0;
function ck(name, ok, detail) {
  if (ok) { fxPass++; } else { fxFail++; console.log(`FIXTURE-FAIL ${name} :: ${detail}`); }
}
function runFixtures() {
  const p = priceFlip({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutVhpMax: 100, shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15,
    shoutFleeAt: 0.4, rounds: 4, finalMDealt: 60, finalVTaken: 50,
    finalMHpLeft: 70, outcome: 'vFlee' });
  ck('postDPR 10', Math.abs(p.postDPR - 10) < 1e-9, `postDPR=${p.postDPR}`);
  ck('incomingPost 30', p.incomingPost === 30, `incomingPost=${p.incomingPost}`);
  ck('rtdS 5', Math.abs(p.rtdS - 5) < 1e-9, `rtdS=${p.rtdS}`);
  ck('needS 70', Math.abs(p.needS - 70) < 1e-9, `needS=${p.needS}`);
  ck('needEnd 40', Math.abs(p.needEnd - 40) < 1e-9, `needEnd=${p.needEnd}`);
  ck('A 2 rounds', Math.abs(p.A - 2) < 1e-9, `A=${p.A}`);
  ck('B 0.333', Math.abs(p.B - 1 / 3) < 1e-9, `B=${p.B}`);
  ck('C 4 rounds', Math.abs(p.C - 4) < 1e-9, `C=${p.C}`);
  ck('Akill 5', Math.abs(p.Akill - 5) < 1e-9, `Akill=${p.Akill}`);
  ck('Ckill 7', Math.abs(p.Ckill - 7) < 1e-9, `Ckill=${p.Ckill}`);
  const pd = priceFlip({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutVhpMax: 100, shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15,
    shoutFleeAt: 0.4, rounds: 4, finalMDealt: 60, finalVTaken: 50,
    finalMHpLeft: 70, outcome: 'vDie' });
  ck('vDie B capped at 1', Math.abs(pd.B - 1) < 1e-9, `B=${pd.B} Braw=${pd.Braw}`);
  const ab = priceFlip({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutVhpMax: 100, shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15,
    shoutFleeAt: 0.4, rounds: 4, finalMDealt: 60, finalVTaken: 50,
    finalMHpLeft: 20, outcome: 'vFlee' });
  ck('already-below-break C negative', Math.abs(ab.C - (-1)) < 1e-9, `C=${ab.C}`);
  const zd = priceFlip({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutVhpMax: 100, shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15,
    shoutFleeAt: 0.4, rounds: 4, finalMDealt: 40, finalVTaken: 50,
    finalMHpLeft: 100, outcome: 'vFlee' });
  ck('post-dpr-zero kind', zd.kind === 'post-dpr-zero' && zd.A == null, `kind=${zd.kind}`);
  const iz = priceFlip({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutVhpMax: 100, shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15,
    shoutFleeAt: 0.4, rounds: 4, finalMDealt: 60, finalVTaken: 20,
    finalMHpLeft: 70, outcome: 'vFlee' });
  ck('incoming-post-zero kind', iz.kind === 'incoming-post-zero' && iz.B == null && iz.A != null, `kind=${iz.kind}`);
  const s = priceSingle({ shoutRound: 2, shoutMhp: 100, shoutMmax: 200, shoutVhp: 50,
    shoutMdealt: 40, shoutVtaken: 20, shoutMbreak: 0.15, rounds: 4, allyDealt: 10 });
  ck('before kKill 4.00x', Math.abs(s.kKill - 4) < 1e-9, `kKill=${s.kKill}`);
  ck('before kSurv 2.80x', Math.abs(s.kSurv - 2.8) < 1e-9, `kSurv=${s.kSurv}`);
  ck('median even (standard)', median([1, 2, 3, 4]) === 2.5, `median=${median([1, 2, 3, 4])}`);
  ck('medianDays upper-middle', medianDays([1, 2, 3, 4]) === 3, `medianDays=${medianDays([1, 2, 3, 4])}`);
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
function fleeSubtype(j) {
  if (j.fleeLearn) return 'learn';
  if (j.rounds === 15) return 'round-cap';
  if (j.vHpLeft != null && j.shoutVhpMax != null && j.shoutFleeAt != null &&
      (j.vHpLeft / j.shoutVhpMax) < j.shoutFleeAt) return 'floor-plausible';
  return 'hopeless';
}
function readingRounds(med) {
  if (!Number.isFinite(med)) return 'UNPRICED';
  if (med <= 2) return 'BRIDGEABLE';
  if (med <= 4) return 'PARTIAL';
  return 'NOT BRIDGEABLE';
}
function readingMitigation(med, shareAtOne) {
  if (!Number.isFinite(med)) return 'UNPRICED';
  if (shareAtOne >= 0.5) return 'NOT THE LEVER';
  if (med >= 0.75) return 'BRIDGEABLE';
  if (med >= 0.5) return 'PARTIAL';
  return 'NOT BRIDGEABLE';
}

function main() {
  if (!runFixtures()) { console.log('FIXTURES-FAIL'); process.exit(2); }
  const rows = loadRows();
  const out = { joinErrors: 0, allyNotOnTile: 0, noShoutUnexplained: 0,
    shoutAllyDealtNonzero: 0, nonFedShoutJoined: 0, uFought: 0, uLost: 0,
    joined: [], floorLost: [], activeZeroLost: [], addressableLost: [],
    addressableLostDenom: 0, noShout: [], wall: null };
  let won = 0, wonFull = 0, natEver = 0, natFinal = 0, table = 0, entered = 0,
    wave4 = 0, wave5 = 0, starv = 0, deaths = 0;
  const days = [];
  const deathsByCause = {};
  const uLostByJoin = { 'shout-joined': 0, 'no-shout-joined': 0, unjoined: 0 };
  const uByOutcome = {};

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
      out.uFought++;
      uByOutcome[t.outcome] = (uByOutcome[t.outcome] || 0) + 1;
      const isLost = t.outcome === 'vFlee' || t.outcome === 'vDie';
      if (isLost) {
        out.uLost++;
        if (t.joinedAllyVid && s.shoutRound != null) uLostByJoin['shout-joined']++;
        else if (t.joinedAllyVid) uLostByJoin['no-shout-joined']++;
        else uLostByJoin.unjoined++;
      }
      if (!t.joinedAllyVid) continue;
      const joined = { seed: r.seed, day: t.day, vid: t.vid, mid: t.mid, wave: t.wave,
        caller: t.caller, rounds: t.rounds, outcome: t.outcome, intent: t.intent,
        everHopeless: !!t.everHopeless, fleeLearn: !!t.fleeLearn,
        joinedAllyVid: String(t.joinedAllyVid),
        allyDealt: t.allyDealt | 0, allyTaken: t.allyTaken | 0,
        finalMDealt: t.mDealt | 0, finalVTaken: t.vTaken | 0, finalMHpLeft: t.mHpLeft,
        fed: !!t.fed, fedVids: (t.fedVids || []).map(String),
        tileAll: (t.tileAll || []).map(String),
        shoutRound: s.shoutRound, shoutMhp: s.shoutMhp, shoutMmax: s.shoutMmax,
        shoutVhp: s.shoutVhp, shoutVhpMax: s.shoutVhpMax, shoutMdealt: s.shoutMdealt,
        shoutVtaken: s.shoutVtaken, shoutAllyDealt: s.shoutAllyDealt,
        shoutMbreak: s.shoutMbreak, shoutFleeAt: s.shoutFleeAt, vHpLeft: s.vHpLeft,
        allyFromStart: !!s.allyFromStart };
      out.joined.push(joined);
      if (joined.tileAll.indexOf(joined.joinedAllyVid) < 0) { out.allyNotOnTile++; out.joinErrors++; }
      if (!joined.fed) out.nonFedShoutJoined++;
      if (s.shoutRound == null) {
        if (s.allyFromStart) joined.noShoutKind = 'ally-from-start';
        else { joined.noShoutKind = 'unexplained'; out.noShoutUnexplained++; }
        out.noShout.push(joined);
        continue;
      }
      if ((s.shoutAllyDealt | 0) !== 0) out.shoutAllyDealtNonzero++;
      if (!isLost) continue; // only lost shout-joined fights are priced
      const p = priceFlip({ shoutRound: s.shoutRound, shoutMhp: s.shoutMhp,
        shoutMmax: s.shoutMmax, shoutVhp: s.shoutVhp, shoutVhpMax: s.shoutVhpMax,
        shoutMdealt: s.shoutMdealt, shoutVtaken: s.shoutVtaken, shoutMbreak: s.shoutMbreak,
        shoutFleeAt: s.shoutFleeAt, rounds: t.rounds, finalMDealt: t.mDealt,
        finalVTaken: t.vTaken, finalMHpLeft: t.mHpLeft, outcome: t.outcome });
      const sp = priceSingle({ shoutRound: s.shoutRound, shoutMhp: s.shoutMhp,
        shoutMmax: s.shoutMmax, shoutVhp: s.shoutVhp, shoutMdealt: s.shoutMdealt,
        shoutVtaken: s.shoutVtaken, shoutMbreak: s.shoutMbreak,
        rounds: t.rounds, allyDealt: t.allyDealt });
      Object.assign(joined, { rtdS: p.rtdS, activeRounds: p.active,
        postDPR: p.postDPR, incomingPost: p.incomingPost, needS: p.needS,
        needEnd: p.needEnd, A: p.A, B: p.B, Braw: p.Braw, C: p.C,
        Akill: p.Akill, Ckill: p.Ckill, priceKind: p.kind,
        kKill: sp.kKill, kSurv: sp.kSurv, singleKind: sp.kind,
        N: joined.tileAll.length, subtype: t.outcome === 'vFlee' ? fleeSubtype(joined) : 'death' });
      if (p.active === 0) { out.floorLost.push(joined); continue; }
      if ((t.allyDealt | 0) === 0) { out.activeZeroLost.push(joined); continue; }
      out.addressableLostDenom++;
      if (p.A != null && p.B != null && p.C != null) out.addressableLost.push(joined);
      // Jointly-unpriced addressable-lost fights stay in the denominator
      // but out of the priced list; they are printed separately below.
    }
  }
  out.wall = { won, wonFull, natEver, natFinal, table, entered, wave4, wave5,
    medianDays: medianDays(days), starv, deaths, deathsByCause, days };

  // ---- report ----
  const J = out.joined, A = out.addressableLost, F = out.floorLost, AZ = out.activeZeroLost;
  const jointlyUnpriced = [];
  // Re-derive jointly-unpriced: addressable-lost fights not in A are
  // those with a null class; they live in J with priceKind set and
  // outcome lost, active > 0, allyDealt > 0, but not in A.
  for (const j of J) {
    if (j.shoutRound == null) continue;
    if (j.outcome !== 'vFlee' && j.outcome !== 'vDie') continue;
    if (j.activeRounds === 0 || j.allyDealt === 0) continue;
    if (A.indexOf(j) < 0) jointlyUnpriced.push(j);
  }
  const aXs = A.map(j => j.A), bXs = A.map(j => j.B), cXs = A.map(j => j.C);
  const akXs = A.map(j => j.Akill), ckXs = A.map(j => j.Ckill);
  const kKillXs = A.filter(j => Number.isFinite(j.kKill)).map(j => j.kKill);
  const kSurvXs = A.filter(j => Number.isFinite(j.kSurv)).map(j => j.kSurv);
  const medA = median(aXs), medB = median(bXs), medC = median(cXs);
  const shareB1 = A.length ? A.filter(j => j.B === 1.0).length / A.length : NaN;
  const readA = readingRounds(medA), readB = readingMitigation(medB, shareB1), readC = readingRounds(medC);
  console.log('=== sim-flipshape-a ===');
  console.log(`U fought=${out.uFought} U lost=${out.uLost} (shout-joined=${uLostByJoin['shout-joined']} no-shout-joined=${uLostByJoin['no-shout-joined']} unjoined=${uLostByJoin.unjoined}) U outcomes=${JSON.stringify(uByOutcome)}`);
  console.log(`JOINED all=${J.length} shout-joined=${J.length - out.noShout.length} no-shout=${out.noShout.length} (ally-from-start=${out.noShout.filter(j => j.noShoutKind === 'ally-from-start').length} unexplained=${out.noShoutUnexplained})`);
  console.log(`JOIN-INTEGRITY: joinErrors=${out.joinErrors} allyNotOnTile=${out.allyNotOnTile} nonFedJoined=${out.nonFedShoutJoined} shoutAllyDealtNonzero=${out.shoutAllyDealtNonzero}`);
  console.log(`ADDRESSABLE-LOST (shout-joined, lost, window>0, allyDealt>0): denom=${out.addressableLostDenom} jointly-priced=${A.length} jointly-unpriced=${jointlyUnpriced.length}; DIAG-GO bar needs >=80% jointly finite`);
  console.log(`FLOOR-LOST (separate): n=${F.length}; ACTIVE-ZERO-LOST (separate): n=${AZ.length}`);
  console.log(`CLASS A staying-shout: median=${fmt(medA)} rounds; shares <=0: ${fmt(shareLE(aXs, 0) * 100, 1)}% (${aXs.filter(k => k <= 0).length}/${aXs.length}) <=2: ${fmt(shareLE(aXs, 2) * 100, 1)}% (${aXs.filter(k => k <= 2).length}/${aXs.length}) <=4: ${fmt(shareLE(aXs, 4) * 100, 1)}% (${aXs.filter(k => k <= 4).length}/${aXs.length}); reading=${readA}`);
  console.log(`CLASS B mitigation: median f=${fmt(medB)}; share f=1.0 (already above floor): ${fmt(shareB1 * 100, 1)}% (${A.filter(j => j.B === 1.0).length}/${A.length}); shares f>=0.75: ${fmt(shareGE(bXs, 0.75) * 100, 1)}% f>=0.50: ${fmt(shareGE(bXs, 0.5) * 100, 1)}% f<0.50: ${fmt(shareLE(bXs, 0.499999) * 100, 1)}%; reading=${readB}`);
  console.log(`CLASS C flee-window: median=${fmt(medC)} rounds; shares <=0: ${fmt(shareLE(cXs, 0) * 100, 1)}% (${cXs.filter(k => k <= 0).length}/${cXs.length}) <=2: ${fmt(shareLE(cXs, 2) * 100, 1)}% (${cXs.filter(k => k <= 2).length}/${cXs.length}) <=4: ${fmt(shareLE(cXs, 4) * 100, 1)}% (${cXs.filter(k => k <= 4).length}/${cXs.length}); reading=${readC}`);
  console.log(`SECONDARY kill variants (report-only): Akill median=${fmt(median(akXs))} Ckill median=${fmt(median(ckXs))}`);
  console.log(`BEFORE single-ally on addressable-lost (paired): kKill median=${fmt(median(kKillXs))}x (finite ${kKillXs.length}/${A.length}) kSurv median=${fmt(median(kSurvXs))}x (finite ${kSurvXs.length}/${A.length})`);
  // Wave splits.
  for (const w of [1, 2, 3, 4]) {
    const sub = A.filter(j => j.wave === w);
    if (!sub.length) { console.log(`  wave ${w}: addressable-lost n=0`); continue; }
    const mA = median(sub.map(j => j.A)), mB = median(sub.map(j => j.B)), mC = median(sub.map(j => j.C));
    const sB1 = sub.filter(j => j.B === 1.0).length / sub.length;
    console.log(`  wave ${w}: addressable-lost n=${sub.length}${sub.length < 3 ? ' (flag only)' : ''} median A=${fmt(mA)} B=${fmt(mB)} (f=1.0 ${fmt(sB1 * 100, 1)}%) C=${fmt(mC)} readings A=${readingRounds(mA)} B=${readingMitigation(mB, sB1)} C=${readingRounds(mC)} A<=2 ${sub.filter(j => j.A <= 2).length}/${sub.length} C<=2 ${sub.filter(j => j.C <= 2).length}/${sub.length}`);
  }
  // Subtype split (report-only).
  const subCounts = {};
  for (const j of A) subCounts[j.subtype] = (subCounts[j.subtype] || 0) + 1;
  console.log(`SUBTYPES (addressable-lost, report-only approximate): ${JSON.stringify(subCounts)}`);
  const subF = {};
  for (const j of F) subF[j.subtype || 'floor'] = (subF[j.subtype || 'floor'] || 0) + 1;
  console.log(`FLOOR-LOST subtypes: ${JSON.stringify(subF)}`);
  console.log('FLOOR-LOST (separate, never folded):');
  for (const j of F) {
    console.log(`  FLOOR s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} N=${j.N} S=${j.shoutRound}`);
  }
  console.log('ACTIVE-ZERO-LOST (separate, never folded):');
  for (const j of AZ) {
    console.log(`  AZ s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} N=${j.N} S=${j.shoutRound} active=${j.activeRounds} postDPR=${fmt(j.postDPR)} incomingPost=${j.incomingPost}`);
  }
  console.log('JOINTLY-UNPRICED ADDRESSABLE-LOST (in denominator, not in medians):');
  for (const j of jointlyUnpriced) {
    console.log(`  UNPRICED s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} kind=${j.priceKind} postDPR=${fmt(j.postDPR)} incomingPost=${j.incomingPost} A=${fmt(j.A)} B=${fmt(j.B)} C=${fmt(j.C)}`);
  }
  console.log('PER-FIGHT (addressable-lost, jointly priced):');
  for (const j of A) {
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} subtype=${j.subtype} ally=${j.joinedAllyVid} ` +
      `N=${j.N} S=${j.shoutRound} HPs=${j.shoutMhp} vHps=${j.shoutVhp} Mmax=${j.shoutMmax} mHpLeft=${j.finalMHpLeft} rtdS=${fmt(j.rtdS)} ` +
      `postDPR=${fmt(j.postDPR)} incomingPost=${j.incomingPost} needS=${fmt(j.needS, 0)} needEnd=${fmt(j.needEnd, 0)} ` +
      `A=${fmt(j.A)} B=${fmt(j.B)} (raw ${fmt(j.Braw)}) C=${fmt(j.C)} Akill=${fmt(j.Akill)} Ckill=${fmt(j.Ckill)} kKill=${fmt(j.kKill)} kSurv=${fmt(j.kSurv)}`);
  }
  console.log('PER-FIGHT (joined, not addressable-lost):');
  for (const j of J) {
    if (A.indexOf(j) >= 0) continue;
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} r${j.rounds} ${j.outcome} ally=${j.joinedAllyVid} ` +
      `N=${j.N} S=${j.shoutRound} kind=${j.priceKind || j.noShoutKind}`);
  }
  const W = out.wall;
  console.log(`WALL (report-only): won=${W.won} (full=${W.wonFull}) natEver=${W.natEver} natFinal=${W.natFinal} ` +
    `table=${W.table} entered=${W.entered} wave4=${W.wave4} wave5=${W.wave5} median=${W.medianDays}d ` +
    `starv=${W.starv} deaths=${W.deaths} days=[${W.days.join(',')}]`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(W.deathsByCause)}`);
  let senseCount = 0;
  for (const r of rows) {
    const tjSense = (r.tilejoin || {}).sense || {};
    const srSense = (r.shoutrec || {}).sense || {};
    if (tjSense.joined) senseCount++;
    if (srSense.joined) senseCount++;
    const tj = tjSense.joined, sr = srSense.joined;
    console.log(`  SENSE s${r.seed}: tilejoin-joined=${tj ? `d${tj.day} ${tj.vid} vs ${tj.mid} ${tj.outcome} fed=[${(tj.fedVids || []).join(',')}] logLines=${(tj.log || []).length}` : 'none'}; ` +
      `shoutrec-joined=${sr ? `d${sr.day} ${sr.vid} vs ${sr.mid} ${sr.outcome} logLines=${(sr.log || []).length}` : 'none'}; ` +
      `tilejoin-shouted=${tjSense.shouted ? `d${tjSense.shouted.day} ${tjSense.shouted.vid} vs ${tjSense.shouted.mid} ${tjSense.shouted.outcome}` : 'none'}; ` +
      `tilejoin-hopelessFlee=${tjSense.tileHopelessFlee ? `d${tjSense.tileHopelessFlee.day} ${tjSense.tileHopelessFlee.vid} vs ${tjSense.tileHopelessFlee.mid} ${tjSense.tileHopelessFlee.outcome}` : 'none'}`);
  }
  console.log(`SENSE-SLOTS: ${senseCount} joined slots across ${rows.length} seeds (bar needs >=3 transcripts read, judged in evidence)`);
  const allyDealtTot = J.reduce((t, j) => t + j.allyDealt, 0);
  const allyTakenTot = J.reduce((t, j) => t + j.allyTaken, 0);
  const outc = {};
  for (const j of J) outc[j.outcome] = (outc[j.outcome] || 0) + 1;
  console.log(`DRIFT-DIAGNOSTIC (vs partycounter published 26 joined — reference only, never a leg): ` +
    `joined=${J.length} outcomes=${JSON.stringify(outc)} dealt=${allyDealtTot} taken=${allyTakenTot}`);
  const coverage = out.addressableLostDenom ? A.length / out.addressableLostDenom : 0;
  const legs = {
    coverage: coverage >= 0.8,
    joinIntegrity: out.joinErrors === 0 && out.noShoutUnexplained === 0 && out.shoutAllyDealtNonzero === 0,
    senseSlots: senseCount >= 3,
  };
  console.log(`LEGS: coverage=${legs.coverage} (${A.length}/${out.addressableLostDenom}) joinIntegrity=${legs.joinIntegrity} senseSlots=${legs.senseSlots}`);
  // Ranked next (prereg rule; report-only for the analyzer exit code).
  const rankOrder = { BRIDGEABLE: 0, PARTIAL: 1, 'NOT BRIDGEABLE': 2, 'NOT THE LEVER': 3, UNPRICED: 4 };
  const cands = [
    { cls: 'A staying-shout', reading: readA, gap: medA, share: shareLE(aXs, 2) },
    { cls: 'B mitigation', reading: readB, gap: 1 - medB, share: shareGE(bXs, 0.75) },
    { cls: 'C flee-window', reading: readC, gap: medC, share: shareLE(cXs, 2) },
  ];
  cands.sort((x, y) => (rankOrder[x.reading] - rankOrder[y.reading]) || (x.gap - y.gap) || (y.share - x.share));
  console.log(`RANKED-NEXT (prereg rule): ${cands.map(c => `${c.cls}=${c.reading}`).join(' > ')}`);
  const pass = legs.coverage && legs.joinIntegrity && legs.senseSlots;
  console.log(pass ? 'MACHINE-LEGS-PASS' : 'MACHINE-LEGS-FAIL');
  return pass;
}

const ok = main();
process.exit(ok ? 0 : 1);
