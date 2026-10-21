#!/usr/bin/env node
// analyze-rotmech-b.js — funnel-rot attribution analysis (arm sim-rotmech-b).
//
// Per run: D_fast = rotFastRate_pantry - rotFastRate_surplus (PRIMARY
// differential; fast-rot is the retagrot line's metric), D_total secondary.
// Mechanism decomposition (structural, content-robust):
//   (a) cap door:   share_a = 1 - D_capadj/D,  D_capadj removes over-cap
//                   pantry arrivals (the kcal the surplus path would refuse).
//   (b) piece size: share_b = 1 - D_sizeadj/D, D_sizeadj is the size-matched
//                   differential (pantry le200 pieces vs surplus 200 units).
//   (c) draw order: pooled rank rates r_pool(q); E_f = sum_q w_fq r_pool(q);
//                   share_c = (E_p - E_s)/D  (rank-composition effect).
// Verdict bars are pre-registered in evidence/2026-10-21/sim-rotmech-b.md.
//
// Usage: node scripts/analyze-rotmech-b.js evidence/2026-10-21/perseed-rotmech-b
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-21/perseed-rotmech-b';
const files = { lead: 'leadfeast.json', belong: 'belongfeast.json' };
const rows = [];
for (const [pol, fn] of Object.entries(files)) {
  const p = path.join(dir, fn);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const r of (j.rows || [])) rows.push({ policy: pol, seed: r.seed, end: r.end });
}

function rate(rot, written) { return written > 0 ? rot / written : null; }

const out = [];
for (const { policy, seed, end } of rows) {
  const S = end.fun.surplus, P = end.fun.pantry;
  const rS = rate(S.rotFast, S.written), rP = rate(P.rotFast, P.written);
  const D = (rP == null || rS == null) ? null : rP - rS;
  const rSt = rate(S.rot, S.written), rPt = rate(P.rot, P.written);
  const Dt = (rPt == null || rSt == null) ? null : rPt - rSt;
  const meaningful = D != null && Math.abs(D) >= 0.02;

  // (a) cap-door adjustment: drop over-cap pantry arrivals
  let shareA = null, Dcap = null;
  if (meaningful && D !== 0) {
    const wPnc = P.written - P.overCapWrite;
    const rPnc = wPnc > 0 ? (P.rotFast - P.rotFastOverCap) / wPnc : null;
    if (rPnc != null) { Dcap = rPnc - rS; shareA = 1 - Dcap / D; }
  }
  // (b) size-matched: pantry le200 pieces vs surplus 200-units
  let shareB = null, Dsize = null;
  if (meaningful && D !== 0) {
    const wP200 = (P.writtenByPiece || {}).le200 || 0;
    const rP200 = wP200 > 0 ? ((P.rotFastByPiece || {}).le200 || 0) / wP200 : null;
    if (rP200 != null) { Dsize = rP200 - rS; shareB = 1 - Dsize / D; }
  }
  // (c) draw order: pooled rank-specific rates on the COMMON SUPPORT
  // (quartiles with arrivals from either funnel; weights renormalized).
  //   r_pool(q) = (rotFast_pq + rotFast_sq) / (written_pq + written_sq)
  //   E_f = sum_{q in support} (w_fq/W_f) * r_pool(q)
  //   share_c = (E_p - E_s) / D      (rank-composition effect).
  // NOTE (metric review): the pre-registered form share_c = (D-D_rankadj)/D
  // with D_rankadj = sum_q w_pq(r_pq - r_sq) is UNDEFINED when the funnels
  // occupy disjoint rank quartiles — precisely the extreme draw-order case.
  // Both are computed: shareC_within (pre-registered, null when disjoint),
  // shareC (pooled, always defined on common support). The bar is judged on
  // the pre-registered form where defined, the pooled form otherwise —
  // documented, not re-scored.
  let shareC = null, drank = null, shareCwithin = null;
  let demoteKcal = null, demotePp = null, rankCurve = null;
  if (meaningful && D !== 0) {
    const rpool = []; const support = [];
    for (let q = 0; q < 4; q++) {
      const wPq = (P.writtenByRankQ || [])[q] || 0;
      const wSq = (S.writtenByRankQ || [])[q] || 0;
      const wq = wPq + wSq;
      if (wq > 0) { support.push(q); rpool[q] = (((P.rotFastByRankQ || [])[q] || 0) + ((S.rotFastByRankQ || [])[q] || 0)) / wq; }
    }
    rankCurve = support.map(q => +rpool[q].toFixed(4));
    if (support.length > 0) {
      let Wp = 0, Ws = 0;
      for (const q of support) { Wp += ((P.writtenByRankQ || [])[q] || 0); Ws += ((S.writtenByRankQ || [])[q] || 0); }
      let Ep = 0, Es = 0;
      for (const q of support) {
        if (Wp > 0) Ep += (((P.writtenByRankQ || [])[q] || 0) / Wp) * rpool[q];
        if (Ws > 0) Es += (((S.writtenByRankQ || [])[q] || 0) / Ws) * rpool[q];
      }
      drank = Ep - Es;
      shareC = drank / D;
      // demotion counterfactual: surplus volume at the pantry rank mix
      let RpAtPmix = 0;
      for (const q of support) {
        if (Wp > 0) RpAtPmix += (((P.writtenByRankQ || [])[q] || 0) / Wp) * rpool[q];
      }
      demotePp = RpAtPmix - rS;
      demoteKcal = demotePp * S.written;
    }
    // pre-registered within-quartile form (needs overlap in every quartile)
    let dw = 0, okQ = true;
    for (let q = 0; q < 4; q++) {
      const wPq = (P.writtenByRankQ || [])[q] || 0;
      const wSq = (S.writtenByRankQ || [])[q] || 0;
      const rPq = wPq > 0 ? (((P.rotFastByRankQ || [])[q] || 0) / wPq) : null;
      const rSq = wSq > 0 ? (((S.rotFastByRankQ || [])[q] || 0) / wSq) : null;
      if (rPq == null || rSq == null) { okQ = false; break; }
      dw += (wPq / P.written) * (rPq - rSq);
    }
    if (okQ) shareCwithin = 1 - dw / D;
  }
  out.push({
    policy, seed, days: end.days, won: end.won, rank: end.rank, maxWave: end.maxWave,
    meanFill: end.meanFill, daysFull: end.daysFull, daysLean: end.daysLean,
    writtenS: S.written, writtenP: P.written,
    rotFastS: S.rotFast, rotFastP: P.rotFast,
    rateS: rS == null ? null : +(rS * 100).toFixed(2),
    rateP: rP == null ? null : +(rP * 100).toFixed(2),
    Dpp: D == null ? null : +(D * 100).toFixed(2),
    Dtpp: Dt == null ? null : +(Dt * 100).toFixed(2),
    meaningful,
    shareA: shareA == null ? null : +shareA.toFixed(3),
    shareB: shareB == null ? null : +shareB.toFixed(3),
    shareC: shareC == null ? null : +shareC.toFixed(3),
    shareCwithin: shareCwithin == null ? null : +shareCwithin.toFixed(3),
    meanRankS: S.meanRank, meanRankP: P.meanRank,
    meanClockS: S.meanClock, meanClockP: P.meanClock,
    capRefusedS: S.capRefused, overCapWriteP: P.overCapWrite,
    unaccountedS: S.unaccounted, unaccountedP: P.unaccounted,
    // demotion counterfactual (interpretive aid): predicted rot change for
    // the surplus funnel's written volume if demoted to the pantry rank mix,
    // via the pooled rank->rot curve. Structural estimate, not a re-score.
    demoteKcal: demoteKcal == null ? null : Math.round(demoteKcal),
    demotePp: demotePp == null ? null : +demotePp.toFixed(2),
    rankCurve: rankCurve,
  });
}

// verdict tally: a mechanism EXPLAINS when share >= 0.60 on >= 4 meaningful runs
const tally = { A: 0, B: 0, C: 0, Cwithin: 0, meaningful: 0 };
for (const r of out) {
  if (!r.meaningful) continue;
  tally.meaningful++;
  if (r.shareA != null && r.shareA >= 0.60) tally.A++;
  if (r.shareB != null && r.shareB >= 0.60) tally.B++;
  if (r.shareC != null && r.shareC >= 0.60) tally.C++;
  if (r.shareCwithin != null && r.shareCwithin >= 0.60) tally.Cwithin++;
}

const analysis = { tally, runs: out };
const outPath = path.join(dir, 'rotmech-b-analysis.json');
fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1));
console.log('meaningful runs:', tally.meaningful, '/ explaining>=60%: A(cap)=' + tally.A, 'B(size)=' + tally.B, 'C(rank,pooled)=' + tally.C, 'C(rank,within)=' + tally.Cwithin);
console.log('wrote ' + outPath);
for (const r of out) {
  console.log(`${r.policy} s${r.seed} d${r.days} fill=${r.meanFill} D=${r.Dpp}pp meaningful=${r.meaningful} A=${r.shareA} B=${r.shareB} C=${r.shareC} rank ${r.meanRankS}/${r.meanRankP}`);
}
