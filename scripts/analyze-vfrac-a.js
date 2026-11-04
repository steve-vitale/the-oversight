#!/usr/bin/env node
// analyze-vfrac-a.js — deploy-fraction decision analyzer for
// sim-vfrac-a (DIAG ONLY). Pure functions over evening series;
// no game load, no file writes, no RNG.
//
// Compares variant (v_f) = (e_f) OR (F) at E1 fractions 0.85
// and 0.90 on IDENTICAL trajectories, using the reused
// parameterized envelope analyzer (scripts/analyze-envelope-b.js)
// for both fractions, the reused gatediseng analyzer for (c),
// and the reused freshband analyzer for the settled-field
// verification and the independent-(c) cross-check. Nothing
// here re-implements a rule: the fraction parameter is the
// ONLY difference between the two compared variants.
//
// Decision procedure (prereg evidence/2026-11-04/
// sim-vfrac-a-prereg.md §(f), applied on the traced
// still-collapsing legs plus the cost leg on traced
// survivors, this band only, never pooled):
//   lead_f = reference day - (v_f) first-firing day;
//   no-fire = -Infinity.
//   wins90 = legs with lead_90 > lead_85; wins85 symmetric;
//   identical = lead_90 == lead_85.
//   cost_f = traced survivors with (v_f) firing / traced
//   survivors.
//   1. wins90 >= 3 AND wins90 > wins85 AND cost_90 <= 25%
//      -> DECISION 0.90
//   2. wins85 >= 3 AND wins85 > wins90 -> DECISION 0.85 MEASURED
//   3. wins90 >= 3 but cost_90 > 25% -> DECISION 0.85 COST-VETO
//   4. otherwise -> DECISION 0.85 TIE-BREAK (recorded
//      explicitly as a tie-break, NOT measured superiority).
// Count gates / cross-check / tracer / still-collapsing /
// survivor-drift rules are carried from the freshband prereg
// and gate INSUFFICIENT-DATA exactly as there; the decision
// function itself assumes the gates have passed and reports
// the gate state alongside, never silently.
'use strict';
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const { fireVariantAt } = require('./analyze-envelope-b');
const { verifyLeg, fireCIndependent } = require('./analyze-freshband-b');

const FRACTIONS = [0.85, 0.90];
const NEG_INF = -Infinity;

function leadOf(v, ref) {
  if (v == null || ref == null) return null;
  return ref - v.day;
}
function leadNum(v, ref) {
  const l = leadOf(v, ref);
  return l == null ? NEG_INF : l;
}

function analyzeSeedVfrac(seedJson) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const cInd = fireCIndependent(seedJson);
  const cDay = c == null ? null : c.day;
  const cIndDay = cInd == null ? null : cInd.day;
  const collapsing = base.collapsed && base.firstStarvationDay != null;
  const ref = collapsing ? base.firstStarvationDay : null;
  const leadC = leadOf(c, ref);
  const perFraction = {};
  for (const fr of FRACTIONS) {
    const v = fireVariantAt(seedJson, fr);
    const lv = leadOf(v, ref);
    perFraction[fr.toFixed(2)] = {
      v: v == null ? null : Object.assign({}, v, { lead: lv }),
      lead: lv,
      leadNum: leadNum(v, ref),
      tie: lv != null && (leadC == null || lv >= leadC),
      strict: lv != null && (leadC == null || lv > leadC),
      leadOne: lv != null && lv >= 1,
      fired: v != null,
    };
  }
  const a85 = perFraction['0.85'];
  const a90 = perFraction['0.90'];
  return {
    seed: seedJson.seed,
    survived: base.survived,
    collapsed: base.collapsed,
    collapsing,
    daysAlive: base.daysAlive,
    endReason: base.endReason,
    maxWaveUnlocked: base.maxWaveUnlocked,
    firstStarvationDay: base.firstStarvationDay,
    referenceDay: ref,
    verification: verifyLeg(seedJson),
    c: c == null ? null : { day: c.day, lead: leadC },
    cIndependentDay: cIndDay,
    crossCheckMatch: cDay === cIndDay,
    perFraction,
    // Per-leg comparison (collapsing legs only; on survivors
    // these fields are still computed but never counted).
    win90: a90.leadNum > a85.leadNum,
    win85: a85.leadNum > a90.leadNum,
    identical: a90.leadNum === a85.leadNum,
    e1Fractions: (() => {
      const out = {};
      for (const fr of FRACTIONS) {
        // E1 firing fraction at the (e_f) level, from the
        // envelope analyzer's e component via fireVariantAt
        // is not exposed; recompute from the variant only
        // when its clause is E1-envelope.
        const v = perFraction[fr.toFixed(2)].v;
        out[fr.toFixed(2)] = (v != null && v.clause === 'E1-envelope') ? v.fraction : null;
      }
      return out;
    })(),
  };
}

// Decision on already-gated legs. `collapsingLegs` are analyzed
// traced still-collapsing legs; `survivorLegs` are analyzed
// traced survivors. Returns counts + decision + branch label.
function decideFraction(collapsingLegs, survivorLegs) {
  const col = collapsingLegs || [];
  const surv = survivorLegs || [];
  const wins90 = col.filter((s) => s.win90).length;
  const wins85 = col.filter((s) => s.win85).length;
  const identical = col.filter((s) => s.identical).length;
  const cost90Count = surv.filter((s) => s.perFraction['0.90'].fired).length;
  const cost85Count = surv.filter((s) => s.perFraction['0.85'].fired).length;
  const cost90 = surv.length ? cost90Count / surv.length : null;
  const cost85 = surv.length ? cost85Count / surv.length : null;
  // Per-dimension flips (descriptive, honoring the
  // tie/strict/lead wording in full).
  const flips = { tie: { to90: 0, to85: 0 }, strict: { to90: 0, to85: 0 }, leadOne: { to90: 0, to85: 0 } };
  for (const s of col) {
    for (const dim of ['tie', 'strict', 'leadOne']) {
      if (s.perFraction['0.90'][dim] && !s.perFraction['0.85'][dim]) flips[dim].to90++;
      if (s.perFraction['0.85'][dim] && !s.perFraction['0.90'][dim]) flips[dim].to85++;
    }
  }
  let decision;
  let branch;
  if (wins90 >= 3 && wins90 > wins85 && cost90 != null && cost90 <= 0.25) {
    decision = 0.90; branch = 'DECISION 0.90';
  } else if (wins85 >= 3 && wins85 > wins90) {
    decision = 0.85; branch = 'DECISION 0.85 MEASURED';
  } else if (wins90 >= 3 && cost90 != null && cost90 > 0.25) {
    decision = 0.85; branch = 'DECISION 0.85 COST-VETO';
  } else {
    decision = 0.85; branch = 'DECISION 0.85 TIE-BREAK';
  }
  return {
    collapsingN: col.length,
    survivorN: surv.length,
    wins90, wins85, identical,
    win90Seeds: col.filter((s) => s.win90).map((s) => s.seed),
    win85Seeds: col.filter((s) => s.win85).map((s) => s.seed),
    identicalSeeds: col.filter((s) => s.identical).map((s) => s.seed),
    cost85Count, cost90Count, cost85, cost90,
    cost85Seeds: surv.filter((s) => s.perFraction['0.85'].fired).map((s) => s.seed),
    cost90Seeds: surv.filter((s) => s.perFraction['0.90'].fired).map((s) => s.seed),
    flips,
    decision, branch,
  };
}

function judgeVfrac(analyzed, roles) {
  const rmap = roles || {};
  const seeds = analyzed.map((a) => Object.assign({}, a, { role: rmap[a.seed] || 'candidate' }));
  const candidates = seeds.filter((s) => s.role === 'candidate');
  const stillCollapsing = candidates.filter((s) => s.collapsing);
  const excluded = candidates.filter((s) => !s.collapsing);
  const costSeeds = seeds.filter((s) => s.role === 'cost');
  const costSurvivors = costSeeds.filter((s) => s.survived);
  const newlyCollapsingCost = costSeeds.filter((s) => s.collapsing);
  const countGate = stillCollapsing.length >= 4;
  const survivorGate = costSurvivors.length >= 12;
  const membershipChange = newlyCollapsingCost.length > 0;
  const crossCheckMismatches = seeds.filter((s) => !s.crossCheckMatch).map((s) => s.seed);
  const crossCheckLeg = crossCheckMismatches.length === 0;
  const verificationFailures = seeds.filter((s) => !(s.verification && s.verification.verified)).map((s) => s.seed);
  const gatesPass = countGate && survivorGate && !membershipChange && crossCheckLeg && verificationFailures.length === 0;
  const decision = gatesPass ? decideFraction(stillCollapsing, costSurvivors) : null;
  return {
    seeds,
    stillCollapsing: stillCollapsing.map((s) => s.seed),
    excludedCandidates: excluded.map((s) => s.seed),
    costSurvivors: costSurvivors.map((s) => s.seed),
    newlyCollapsingCost: newlyCollapsingCost.map((s) => s.seed),
    crossCheckMismatches,
    verificationFailures,
    gates: { countGate, survivorGate, membershipChange, crossCheckLeg, verificationPass: verificationFailures.length === 0, gatesPass },
    verdict: gatesPass ? decision.branch : 'INSUFFICIENT-DATA',
    decision,
  };
}

function summarizeVfrac(allSeeds, roles) {
  return judgeVfrac(allSeeds.map((sj) => analyzeSeedVfrac(sj)), roles);
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    let roles = null;
    try { roles = process.env.SENSOR_VFRAC_ROLES ? JSON.parse(process.env.SENSOR_VFRAC_ROLES) : null; } catch (e) { roles = null; }
    process.stdout.write(JSON.stringify(summarizeVfrac(seeds, roles), null, 2) + '\n');
  });
}

module.exports = { analyzeSeedVfrac, decideFraction, judgeVfrac, summarizeVfrac, FRACTIONS };
