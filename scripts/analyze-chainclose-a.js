#!/usr/bin/env node
// scripts/analyze-chainclose-a.js — sim-chainclose-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-chainclose-a/s<seed>-fresh.json
//   (fieldparty + w4dpr + breakline + shoutrec + tilejoin recorders,
//   seeds 75101-75108; joinendlines store is calledHelp-only, so it is
//   checked for errs/overflow but NOT index-joined).
// Join: per seed, fp/dp/bl/sr/tj join by fight-order index; VERIFIED
// (mid, vid, day must match at every index); join errors must be 0.
// Universe: joined rows with fieldparty wave == 4 AND channel ==
// 'field' (wild shape only), all callers, scholar-led flagged.
// Beast-zero: breakline/w4dpr mDealt == 0 (totalled over leader+ally).
// Leader-zero: leaderDealt = mDealt - allyDealt == 0. A meeting with
// leaderDealt == 0 AND mDealt > 0 is LEADER-ZERO-ALLY-POSITIVE: NOT
// beast-zero, reported separately, never in the per-cause table.
// Per-cause beast-zero taxonomy (prereg priority order, first match):
//   1 PRE-CONTACT-SCATTER  rounds<1 & mFlee
//   2 PRE-CONTACT-FLEE     rounds<1 & vFlee
//   3 PRE-CONTACT-DEATH    rounds<1 & vDie
//   4 NARRATION-SUPPRESSED rounds>=1 & log has 'contradicts the narration'
//                            (or trickLog has 'contradict')
//   5 NO-USABLE-WEAPON     rounds>=1 & (armed==false or no carried
//                            weapons) OR (melee==null & ranged!=null &
//                            log has 'no arrows')
//   6 TURN-CONSUMED-OTHER  rounds>=1 & no 'strikes for' line & none above
//   7 STRIKE-WITHOUT-DAMAGE rounds>=1 & a 'strikes for' line & mDealt==0
//   8 OTHER                anything else (must be 0)
// Chain: maximal run of same-mid meetings on one seed, in day order,
// where each meeting's mHpStart equals the previous meeting's mHpLeft.
// A meeting breaking continuity starts a new chain.
// Price: remaining HP = last meeting's mHpLeft; median rate = statistical
// median of the chain's per-meeting mDealt (zeros included; even n =
// mean of two middles); best rate = max per-meeting mDealt;
// meetings-to-finish = ceil(remaining / rate); rate 0 -> null (never).
// Prices computed only for chains with n >= 2.
// Usage:
//   node scripts/analyze-chainclose-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-chainclose-a.js --sense (print wild wave-4 logs)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);

function hasStrike(log) {
  return (log || []).some(l => String(l).indexOf('strikes for') >= 0);
}
function hasNarration(log, trickLog) {
  if ((log || []).some(l => String(l).indexOf('contradicts the narration') >= 0)) return true;
  return (trickLog || []).some(t => String(t).indexOf('contradict') >= 0);
}
function hasNoArrows(log) {
  return (log || []).some(l => String(l).indexOf('no arrows') >= 0);
}
function consumingLines(log) {
  return (log || []).filter(l => /binds the wound|eyes go red|stops mid-fight|has .* but no arrows|contradicts the narration/.test(String(l)));
}
// classifyZero takes a joined wild meeting and returns {cls, evidence}.
// Caller guarantees mDealt == 0. Priority order is the prereg order.
function classifyZero(j) {
  const rounds = (j.bl.rounds | 0);
  const out = j.bl.outcome;
  const log = (j.dp.log || []);
  if (rounds < 1 && out === 'mFlee') return { cls: 'PRE-CONTACT-SCATTER', evidence: 'rounds<1 mFlee' };
  if (rounds < 1 && out === 'vFlee') return { cls: 'PRE-CONTACT-FLEE', evidence: 'rounds<1 vFlee' };
  if (rounds < 1 && out === 'vDie') return { cls: 'PRE-CONTACT-DEATH', evidence: 'rounds<1 vDie' };
  if (rounds >= 1 && hasNarration(log, j.bl.trickLog)) return { cls: 'NARRATION-SUPPRESSED', evidence: 'log/trickLog contradicts-narration' };
  const post = (j.dp.loadoutPost || {});
  const carried = post.carriedWeapons || [];
  const armed = j.fp.leader ? j.fp.leader.armed : null;
  if (rounds >= 1 && (armed === false || carried.length === 0
      || (post.melee == null && post.ranged != null && hasNoArrows(log)))) {
    return { cls: 'NO-USABLE-WEAPON', evidence: `armed=${armed} melee=${post.melee} ranged=${post.ranged} noArrows=${hasNoArrows(log)} carried=${JSON.stringify(carried)}` };
  }
  if (rounds >= 1 && !hasStrike(log)) return { cls: 'TURN-CONSUMED-OTHER', evidence: `no strike line; consuming=${JSON.stringify(consumingLines(log))}` };
  if (rounds >= 1 && hasStrike(log)) return { cls: 'STRIKE-WITHOUT-DAMAGE', evidence: 'strike line present but mDealt==0' };
  return { cls: 'OTHER', evidence: `rounds=${rounds} outcome=${out}` };
}
function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const n = s.length;
  if (n % 2 === 1) return s[Math.floor(n / 2)];
  return (s[n / 2 - 1] + s[n / 2]) / 2;
}
function price(remaining, rate) {
  if (remaining <= 0) return 0;
  if (!rate || rate <= 0) return null;
  return Math.ceil(remaining / rate);
}
// buildChains: meetings (day order) -> chains split on HP discontinuity.
function buildChains(meetings) {
  // Group by (seed, mid): the prereg chain is same-mid on the SAME seed.
  // Grouping by mid alone mixes seeds when several seeds meet one type.
  const byKey = {};
  for (const m of meetings) {
    const k = `${m.seed}|${m.mid}`;
    (byKey[k] = byKey[k] || []).push(m);
  }
  const chains = [];
  for (const key of Object.keys(byKey).sort()) {
    const mid = key.split('|').slice(1).join('|');
    const list = byKey[key].slice().sort((a, b) => (a.day - b.day) || (a.part - b.part));
    let cur = null;
    for (const m of list) {
      if (!cur || m.mHpStart !== cur.lastLeft) {
        cur = { mid, seed: m.seed, meetings: [], openingHp: m.mHpStart, lastLeft: m.mHpLeft, breaks: [] };
        if (cur && meetings.length && cur.meetings.length === 0 && list.indexOf(m) > 0) { /* first of a new chain after a break */ }
        chains.push(cur);
        if (list.indexOf(m) > 0) {
          const prev = list[list.indexOf(m) - 1];
          cur.breakReason = `mHpStart ${m.mHpStart} != prev mHpLeft ${prev.mHpLeft} (day ${prev.day})`;
        }
      } else if (m.mHpStart > cur.lastLeft) { cur.healed = true; }
      cur.meetings.push(m);
      cur.lastLeft = m.mHpLeft;
    }
  }
  return chains;
}
function chainPrice(chain) {
  const dealt = chain.meetings.map(m => m.mDealt);
  const med = medianOf(dealt);
  const best = dealt.length ? Math.max.apply(null, dealt) : null;
  const remaining = chain.lastLeft;
  const out = { n: chain.meetings.length, dealt, medianRate: med, bestRate: best,
    remainingHp: remaining,
    meetingsToFinishMedian: chain.meetings.length >= 2 ? price(remaining, med) : null,
    meetingsToFinishBest: chain.meetings.length >= 2 ? price(remaining, best) : null,
    intervals: [] };
  for (let i = 1; i < chain.meetings.length; i++) out.intervals.push(chain.meetings[i].day - chain.meetings[i - 1].day);
  return out;
}


// --- chainclose targets (prereg formula, binding) ---
// M = floor(pace * T_rem); C = ceil(R / M) if M >= 1 else Infinity.
// p_chain = n / inclusiveSpan (n>=2 only); p_seed = seedWild / seedSpan.
function closeTarget(remaining, meetingsAvail) {
  if (remaining <= 0) return 0;
  if (!meetingsAvail || meetingsAvail < 1) return Infinity;
  return Math.ceil(remaining / meetingsAvail);
}
function meetingsAvail(pace, tRem) {
  if (pace == null || !(pace > 0) || tRem == null || tRem < 0) return 0;
  return Math.floor(pace * tRem);
}
function bindingClass(cDaily, cChain) {
  if (!isFinite(cDaily) || cDaily > 60) return 'LIFETIME-HP-BOUND';
  if (!isFinite(cChain) || cChain > 60) return 'PACE-BOUND';
  return 'DAMAGE-SCALE-QUESTION';
}
function computeCloseTargets(chainTables, perSeedRows, wildDetail) {
  const rowBySeed = {};
  for (const r of perSeedRows) rowBySeed[r.seed] = r;
  const bySeed = {};
  for (const m of wildDetail) (bySeed[m.seed] = bySeed[m.seed] || []).push(m);
  const seedPace = {}, lifetime = {};
  for (const seed of Object.keys(bySeed)) {
    const list = bySeed[seed].slice().sort((x, y) => (x.day - y.day) || (x.part - y.part));
    const first = list[0].day, last = list[list.length - 1].day;
    const row = rowBySeed[seed] || {};
    const censored = row.endReason === 'survived';
    seedPace[seed] = list.length / (last - first + 1);
    lifetime[seed] = { seed: +seed, days: row.days, endReason: row.endReason,
      censored: !!censored, firstWildDay: first, lastWildDay: last,
      lifetimeAfterFirstContact: (row.days - first), nWild: list.length };
  }
  const targets = chainTables.map(c => {
    const ms = c.meetings;
    const firstDay = ms[0].day, lastDay = ms[ms.length - 1].day;
    const span = lastDay - firstDay + 1;
    const row = rowBySeed[c.seed] || {};
    const censored = row.endReason === 'survived';
    const tRem = row.days - lastDay;
    const pChain = c.n >= 2 ? (c.n / span) : null;
    const gaps = [];
    for (let i = 1; i < ms.length; i++) gaps.push(ms[i].day - ms[i - 1].day);
    const meanGap = gaps.length ? gaps.reduce((t, g) => t + g, 0) / gaps.length : null;
    const mChain = meetingsAvail(pChain, tRem);
    const mSeed = meetingsAvail(seedPace[c.seed], tRem);
    const cChain = pChain == null ? null : closeTarget(c.remainingHp, mChain);
    const cSeed = closeTarget(c.remainingHp, mSeed);
    const cDaily = tRem >= 1 ? closeTarget(c.remainingHp, tRem) : Infinity;
    const mFirst = meetingsAvail(pChain, row.days - firstDay);
    return { seed: c.seed, mid: c.mid, n: c.n, firstDay, lastDay, span,
      intervals: gaps, meanGap, openingHp: c.openingHp, remainingHp: c.remainingHp,
      censored, days: row.days, tRem, pChain, pSeed: seedPace[c.seed],
      mChain, mSeed, mFirst, cChain, cSeed, cDaily,
      binding: cChain == null ? 'PACE-UNKNOWN-N1' : bindingClass(cDaily, cChain),
      breakReason: c.breakReason || null };
  });
  const frac = (get, denom) => {
    const list = targets.filter(t => get(t) != null);
    const d = denom != null ? denom : list.length;
    const out = {};
    for (const T of [20, 41, 60]) out['le' + T] = d ? list.filter(t => get(t) <= T).length / d : null;
    out.numeratorDenom = {};
    for (const T of [20, 41, 60]) out.numeratorDenom['le' + T] = [list.filter(t => get(t) <= T).length, d];
    return out;
  };
  const chainPaceFrac = frac(t => t.cChain, targets.filter(t => t.cChain != null).length);
  const seedPaceFrac = frac(t => t.cSeed, targets.length);
  const contactSeeds = Object.keys(bySeed).map(Number);
  const seedLevel = {};
  for (const T of [20, 41, 60]) {
    const ok = contactSeeds.filter(sd => targets.some(t => t.seed === sd && t.cChain != null && t.cChain <= T)).length;
    seedLevel['le' + T] = contactSeeds.length ? [ok, contactSeeds.length] : [0, 0];
    seedLevel['le' + T + 'Frac'] = contactSeeds.length ? ok / contactSeeds.length : null;
  }
  const cVals = targets.map(t => t.cChain).filter(v => v != null && isFinite(v)).sort((x, y) => x - y);
  const cSeedVals = targets.map(t => t.cSeed).filter(v => isFinite(v)).sort((x, y) => x - y);
  return { targets, lifetime, seedPace, chainPaceFrac, seedPaceFrac, seedLevel,
    contactSeeds, cChainSorted: cVals, cChainMedian: medianOf(cVals),
    cSeedSorted: cSeedVals, cSeedMedian: medianOf(cSeedVals),
    nChainPaceUndefined: targets.filter(t => t.cChain == null).length,
    nInfiniteChainPace: targets.filter(t => t.cChain === Infinity).length,
    bindingCounts: targets.reduce((o, t) => { o[t.binding] = (o[t.binding] || 0) + 1; return o; }, {}) };
}

function analyze(evidDir) {
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && (r.tilejoin === null || storeOk(r.tilejoin))
    && r.joinendlines && r.joinendlines.diag.errs === 0
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0));
  let joinErrors = 0, joinTotal = 0, mDealtMismatches = 0, srChecked = 0, srPrefixViolations = 0;
  const joined = [];
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [],
      bl = r.breakline.meetings || [], sr = r.shoutrec.meetings || [],
      tj = (r.tilejoin && r.tilejoin.meetings) || [];
    const lens = [fp.length, dp.length, bl.length, sr.length, tj.length];
    const n = Math.min.apply(null, lens);
    for (const L of lens) joinErrors += Math.abs(L - fp.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i], d = sr[i], e = tj[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day
        || a.mid !== d.mid || a.vid !== d.vid || a.day !== d.day
        || a.mid !== e.mid || a.vid !== e.vid || a.day !== e.day) { joinErrors++; continue; }
      if ((c.mDealt | 0) !== (b.mDealt | 0)) mDealtMismatches++;
      const rt = d.roundTotals;
      if (Array.isArray(rt) && rt.length) {
        srChecked++;
        // CORRECTED LEG (chainfinish metric review): roundTotals is a
        // morale-entry snapshot series, NOT final totals. Demand only
        // prefix-consistency: non-decreasing, each <= final total.
        let prev = -1;
        for (const e of rt) {
          const v = (e.mDealt | 0);
          if (v < prev || v > (c.mDealt | 0)) srPrefixViolations++;
          prev = v;
        }
      }
      joined.push({ seed: r.seed, fp: a, dp: b, bl: c, sr: d, tj: e });
    }
  }
  const w4all = joined.filter(j => (j.fp.wave | 0) === 4);
  const census = { wild: 0, raid: 0, other: 0, otherChannels: {} };
  for (const j of w4all) {
    if (j.fp.channel === 'field') census.wild++;
    else if (j.fp.channel === 'raid') census.raid++;
    else { census.other++; census.otherChannels[j.fp.channel] = (census.otherChannels[j.fp.channel] || 0) + 1; }
  }
  const U = w4all.filter(j => j.fp.channel === 'field').map(j => {
    const mDealt = (j.bl.mDealt | 0);
    const allyDealt = (j.bl.allyDealt | 0);
    return Object.assign({}, j, {
      day: j.fp.day, part: j.fp.part, mid: j.fp.mid, caller: j.fp.caller,
      leaderVid: j.fp.vid, scholarLed: !!(j.fp.leader && j.fp.leader.isScholar),
      outcome: j.bl.outcome, rounds: j.bl.rounds, mDealt, allyDealt,
      leaderDealt: mDealt - allyDealt,
      mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft, vTaken: j.bl.vTaken,
      intent: j.bl.intent, branch: j.bl.branch,
      calledHelp: j.bl.calledHelp, joinedAllyVid: j.bl.joinedAllyVid,
      tileCount: (j.fp.tile || []).filter(t => t.deadKnown !== true).length,
      hasLog: !!(j.dp.log && j.dp.log.length),
    });
  });
  const beastZero = U.filter(m => m.mDealt === 0).map(m => {
    const cls = classifyZero(m);
    return Object.assign({}, m, { zeroCls: cls.cls, zeroEvidence: cls.evidence });
  });
  const leaderZeroAllyPos = U.filter(m => m.leaderDealt === 0 && m.mDealt > 0);
  const zeroByCause = {};
  for (const m of beastZero) zeroByCause[m.zeroCls] = (zeroByCause[m.zeroCls] || 0) + 1;
  const otherZero = beastZero.filter(m => m.zeroCls === 'OTHER').length;
  const chains = buildChains(U.map(m => ({ seed: m.seed, day: m.day, part: m.part, mid: m.mid,
    mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, mDealt: m.mDealt, outcome: m.outcome,
    rounds: m.rounds, caller: m.caller, leaderVid: m.leaderVid, zeroCls: (beastZero.find(z => z.seed === m.seed && z.day === m.day && z.mid === m.mid && z.part === m.part) || {}).zeroCls || null })));
  const chainTables = chains.map(c => Object.assign({ mid: c.mid, seed: c.seed, openingHp: c.openingHp,
    breakReason: c.breakReason || null, healedFlag: !!c.healed }, chainPrice(c),
    { meetings: c.meetings.map(m => ({ day: m.day, part: m.part, caller: m.caller, leaderVid: m.leaderVid,
      outcome: m.outcome, rounds: m.rounds, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft,
      mDealt: m.mDealt, zeroCls: m.zeroCls })) }));
  const allIntervals = [];
  for (const c of chainTables) for (const g of c.intervals) allIntervals.push(g);
  const intervalMedian = medianOf(allIntervals);
  // Wall numbers (upper-middle median convention, as the 0320Z round).
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const nationalFinal = rows.reduce((t, r) => t + r.nationalFinal, 0);
  const tableN = rows.reduce((t, r) => t + r.table, 0);
  const entered = rows.reduce((t, r) => t + r.entered, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const waveReachCount = (w) => rows.filter(r => (r.waveReach || 1) >= w).length;
  const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
  const medianDays = daysSorted[Math.floor(daysSorted.length / 2)];
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const perSeedWild = {};
  for (const seed of SEEDS) {
    const list = U.filter(m => m.seed === seed);
    perSeedWild[seed] = { n: list.length,
      beastZero: list.filter(m => m.mDealt === 0).length,
      leaderZeroAllyPos: list.filter(m => m.leaderDealt === 0 && m.mDealt > 0).length,
      byOutcome: list.reduce((o, m) => { o[m.outcome] = (o[m.outcome] || 0) + 1; return o; }, {}) };
  }
  const completeness = corpusOk && joinErrors === 0 && mDealtMismatches === 0 && srPrefixViolations === 0 && otherZero === 0;
  const _perSeedRows = rows.map(r => ({ seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, waveReach: r.waveReach, nationalEver: r.nationalEver, deaths: r.deathTotal, fpMeetings: (r.fieldparty.meetings || []).length }));
  const _wildDetail = U.map(m => ({ seed: m.seed, day: m.day, part: m.part, mid: m.mid, mDealt: m.mDealt }));
  const _close = computeCloseTargets(chainTables, _perSeedRows, _wildDetail);
  return { corpusOk, joinTotal, joinErrors, mDealtMismatches, srChecked, srPrefixViolations,
    census, wildN: U.length, beastZeroN: beastZero.length, zeroByCause, otherZero,
    leaderZeroAllyPosN: leaderZeroAllyPos.length,
    leaderZeroAllyPos: leaderZeroAllyPos.map(m => ({ seed: m.seed, day: m.day, mid: m.mid, caller: m.caller, leaderVid: m.leaderVid, mDealt: m.mDealt, allyDealt: m.allyDealt, outcome: m.outcome, rounds: m.rounds })),
    beastZeroDetail: beastZero.map(m => ({ seed: m.seed, day: m.day, part: m.part, mid: m.mid, caller: m.caller, leaderVid: m.leaderVid, outcome: m.outcome, rounds: m.rounds, branch: m.branch, intent: m.intent, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, vTaken: m.vTaken, allyDealt: m.allyDealt, zeroCls: m.zeroCls, zeroEvidence: m.zeroEvidence, tileCount: m.tileCount, calledHelp: m.calledHelp, joinedAllyVid: m.joinedAllyVid, loadoutPost: m.dp.loadoutPost, armed: m.fp.leader ? m.fp.leader.armed : null })),
    chains: chainTables,
    intervals: allIntervals, intervalMedian,
    chainsPriced: chainTables.filter(c => c.n >= 2).length,
    perSeedWild,
    wildDetail: U.map(m => ({ seed: m.seed, day: m.day, part: m.part, mid: m.mid, caller: m.caller, leaderVid: m.leaderVid, scholarLed: m.scholarLed, outcome: m.outcome, rounds: m.rounds, branch: m.branch, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, mDealt: m.mDealt, allyDealt: m.allyDealt, leaderDealt: m.leaderDealt, vTaken: m.vTaken, tileCount: m.tileCount, calledHelp: m.calledHelp, joinedAllyVid: m.joinedAllyVid })),
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave1reach: waveReachCount(1), wave2reach: waveReachCount(2), wave3reach: waveReachCount(3),
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, deathsByCause },
    joinEffectiveness: (() => {
      const tot = { leader: 0, ally: 0, joined: 0, n: U.length };
      const leadVals = [], allyVals = [], joinedShares = [];
      for (const m of U) {
        tot.leader += m.leaderDealt; tot.ally += m.allyDealt;
        leadVals.push(m.leaderDealt); allyVals.push(m.allyDealt);
        if (m.calledHelp || m.joinedAllyVid) { tot.joined++; if (m.mDealt > 0) joinedShares.push(m.allyDealt / m.mDealt); }
      }
      return { totalLeader: tot.leader, totalAlly: tot.ally, joined: tot.joined, n: tot.n,
        medianLeader: medianOf(leadVals), medianAlly: medianOf(allyVals),
        medianAllyShareJoined: medianOf(joinedShares) };
    })(),
    close: _close,
    completeness,
    perSeedRows: rows.map(r => ({ seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, waveReach: r.waveReach, nationalEver: r.nationalEver, deaths: r.deathTotal, fpMeetings: (r.fieldparty.meetings || []).length })) };
}

function sense(evidDir) {
  const res = analyze(evidDir);
  const rows = {};
  for (const seed of SEEDS) rows[seed] = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  const U = [];
  for (const seed of SEEDS) {
    const r = rows[seed];
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [], bl = r.breakline.meetings || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    for (let i = 0; i < n; i++) {
      if ((fp[i].wave | 0) !== 4 || fp[i].channel !== 'field') continue;
      if ((bl[i].rounds | 0) < 1) continue;
      U.push({ seed, day: fp[i].day, mid: fp[i].mid, caller: fp[i].caller, outcome: bl[i].outcome, rounds: bl[i].rounds, mDealt: bl[i].mDealt, log: dp[i].log || [] });
    }
  }
  let sel = U, rule = 'all fought wild wave-4 logs (n<=40)';
  if (U.length > 40) {
    rule = 'stratified: all beast-zero + all leader-zero-ally-positive + 3 per fought outcome class';
    const bz = U.filter(m => m.mDealt === 0);
    const byOutcome = {};
    for (const m of U) (byOutcome[m.outcome] = byOutcome[m.outcome] || []).push(m);
    const picked = new Map();
    for (const m of bz) picked.set(`${m.seed}-${m.day}-${m.mid}`, m);
    for (const oc of Object.keys(byOutcome)) for (const m of byOutcome[oc].slice(0, 3)) picked.set(`${m.seed}-${m.day}-${m.mid}`, m);
    sel = Array.from(picked.values());
  }
  console.log(`SENSE-RULE: ${rule}`);
  console.log(`SENSE-CANDIDATES fought-wild-wave4=${U.length} selected=${sel.length}`);
  for (const m of sel) {
    console.log(`\n--- s${m.seed} d${m.day} ${m.mid} caller=${m.caller} outcome=${m.outcome} rounds=${m.rounds} mDealt=${m.mDealt} logLines=${m.log.length} ---`);
    for (const line of m.log) console.log('  ' + line);
  }
  return sel.length;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
  if (args.indexOf('--sense') >= 0) { sense(evidDir); return; }
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-chainclose-a census ===');
  console.log(`corpusOk=${res.corpusOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} mDealtMismatches=${res.mDealtMismatches} srChecked=${res.srChecked}`);
  console.log(`WAVE-4 CENSUS: wild=${res.census.wild} raid=${res.census.raid} other=${res.census.other} ${JSON.stringify(res.census.otherChannels)}`);
  console.log(`WILD: n=${res.wildN} beastZero=${res.beastZeroN} leaderZeroAllyPos=${res.leaderZeroAllyPosN} OTHER-zero=${res.otherZero}`);
  console.log(`ZERO-BY-CAUSE: ${JSON.stringify(res.zeroByCause)}`);
  console.log(`CHAINS: total=${res.chains.length} priced(n>=2)=${res.chainsPriced} intervals=${JSON.stringify(res.intervals)} intervalMedian=${res.intervalMedian}`);
  for (const c of res.chains) console.log(`  CHAIN s${c.seed} ${c.mid} n=${c.n} open=${c.openingHp} remain=${c.remainingHp} dealt=${JSON.stringify(c.dealt)} median=${c.medianRate} best=${c.bestRate} priceMedian=${c.meetingsToFinishMedian} priceBest=${c.meetingsToFinishBest} gaps=${JSON.stringify(c.intervals)} break=${c.breakReason || 'none'}`);
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave1=${w.wave1reach} wave2=${w.wave2reach} wave3=${w.wave3reach} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`CLOSE: chains=${res.close.targets.length} cChainMedian=${res.close.cChainMedian} cChainSorted=${JSON.stringify(res.close.cChainSorted)} chainPaceFrac=${JSON.stringify(res.close.chainPaceFrac)} seedPaceFrac=${JSON.stringify(res.close.seedPaceFrac)} seedLevel=${JSON.stringify(res.close.seedLevel)} binding=${JSON.stringify(res.close.bindingCounts)} undefChainPace=${res.close.nChainPaceUndefined} infChainPace=${res.close.nInfiniteChainPace}`);
  for (const t of res.close.targets) console.log(`  TARGET s${t.seed} ${t.mid} n=${t.n} span=${t.span} pChain=${t.pChain} pSeed=${t.pSeed} tRem=${t.tRem} mChain=${t.mChain} mSeed=${t.mSeed} cChain=${t.cChain} cSeed=${t.cSeed} cDaily=${t.cDaily} binding=${t.binding} censored=${t.censored} remain=${t.remainingHp}`);
  console.log(`JOIN-EFFECTIVENESS (UNJUDGED): ${JSON.stringify(res.joinEffectiveness)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'}`);
  if (!res.completeness) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyZero, medianOf, price, buildChains, chainPrice, analyze, hasStrike, hasNarration, hasNoArrows, closeTarget, meetingsAvail, bindingClass, computeCloseTargets };
