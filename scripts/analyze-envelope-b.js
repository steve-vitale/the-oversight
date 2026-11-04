#!/usr/bin/env node
// analyze-envelope-b.js — OFFLINE envelope trade table for the
// streakfree cost-leg variant, run fleshout-loop-b-20261103T2330Z,
// axis food-economy, arm sim-envelope-b.
//
// DIAG ONLY. No game-code change, no policy-default flip, no gate/
// price change, no new sims. This tool reads the EXISTING 28-leg
// tracer corpus from run fleshout-loop-b-20261103T2130Z
// (evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl) and
// recomputes would-fire days while varying ONLY the E1 envelope
// fraction. Fallback (F) and old rule (c) are carried verbatim.
//
// Reuse contract: scripts/analyze-streakfree-cost-b.js is REUSED
// VERBATIM, read-only, never edited. Its fireFallback (F) and its
// cross-check (c) plumbing are imported, not copied. The E1 rule
// itself is re-implemented here ONLY to parameterize the fraction:
// fireEnvelope(seedJson, fraction) is fireEstar85 with the 0.85
// constant replaced by the parameter — same stretch scan, same
// eligible day (>= 8), same hungryStreak (>= 1), same E2 cliff
// (0.65) checked first, same peak/falls bookkeeping, same
// first-firing-wins semantics. At fraction 0.85 it must reproduce
// the streakfree-cost evidence descriptives exactly (see
// scripts/test-envelope-b.js); any mismatch is a STOP condition,
// never adjusted away.
//
// Rule text (from evidence/2026-11-03/sim-streakfree-cost-b-prereg.md):
//   S = first evening of the current disengaged stretch;
//   peak(D) = max pantry over S..D in the stretch; falls(D) =
//   count of evenings t in (S..D] with pantry(t) < pantry(t-1).
//   (e, fraction f): fire at FIRST evening D in the stretch with
//   D > S, D >= 8, disengaged, hungryStreak(D) >= 1, where (E1)
//   falls(D) >= 2 AND pantry(D) <= f*peak(D), or (E2)
//   pantry(D) <= 0.65*peak(D).
//   (F): fire at FIRST evening D in the stretch with D > S,
//   D >= 8, disengaged, falls(D) >= 3 AND pantry(D) <=
//   0.80*peak(D), with NO hungryStreak condition.
//   Variant (v_f): earliest of (e_f) and (F); tie goes to (e_f),
//   matching the cost analyzer's `f.day < e.day ? f : e`.
//   Lead = first-starvation day - first-firing day.
// Fractions tabled: 0.85 (current v**), 0.87, 0.88, 0.90 (old e*).
//
// Canon note: no canon doc covers the gatediseng sensor (e*)
// itself — it is a policy-side sim instrument, not a game system.
// docs/PRESERVATION.md (food ladder) is adjacent only. No canon
// is invented for the sensor here.
'use strict';
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const { fireFallback } = require('./analyze-streakfree-cost-b');

const CLIFF_FRACTION = 0.65;
const ELIGIBLE_DAY = 8;
const STREAK_MIN = 1;
const FRACTIONS = [0.85, 0.87, 0.88, 0.90];
// Seeds whose tracer rows fail rows == daysAlive in the 2130Z
// corpus (evidence/2026-11-03/sim-streakfree-cost-b.md, tracer
// verification failure). They are reported in a SEPARATELY
// labeled descriptive section only, never in a judged or
// verified denominator.
const UNVERIFIED_SEEDS = new Set([83373, 83377]);

function stretchesOf(seedJson) {
  const rows = ((seedJson && seedJson.rows) || []).slice()
    .sort((a, b) => a.loopDay - b.loopDay);
  const m = new Map(rows.map((r) => [r.loopDay, r]));
  const stretches = [];
  let cur = null;
  for (const r of rows) {
    if (!r.gateEngaged) {
      if (cur == null) cur = { start: r.loopDay, days: [] };
      cur.days.push(r.loopDay);
    } else if (cur != null) { stretches.push(cur); cur = null; }
  }
  if (cur != null) stretches.push(cur);
  return { rows, m, stretches };
}

// Parameterized E1 rule: fireEstar85 from
// analyze-streakfree-cost-b.js with ENVELOPE_FRACTION replaced
// by `fraction`. Everything else is identical, line for line
// in behavior: E2 cliff checked before E1, peak/falls updated
// before the check, prev advanced after the check, a null
// pantry row skips without advancing prev.
function fireEnvelope(seedJson, fraction) {
  const { m, stretches } = stretchesOf(seedJson);
  for (const st of stretches) {
    const S = st.start;
    const sPan = m.get(S) != null ? m.get(S).pantryKcal : null;
    if (sPan == null) continue;
    let peak = sPan;
    let falls = 0;
    let prev = sPan;
    for (const d of st.days) {
      if (d === S) continue;
      const row = m.get(d);
      const p = row != null ? row.pantryKcal : null;
      if (p == null) continue;
      if (prev != null && p < prev) falls++;
      if (p > peak) peak = p;
      if (d >= ELIGIBLE_DAY && row.hungryStreak != null && row.hungryStreak >= STREAK_MIN) {
        if (p <= CLIFF_FRACTION * peak) {
          return { day: d, clause: 'E2-cliff', standDownDay: S, standDownPantry: sPan, pantry: p, peak, falls, fraction: p / peak };
        }
        if (falls >= 2 && p <= fraction * peak) {
          return { day: d, clause: 'E1-envelope', standDownDay: S, standDownPantry: sPan, pantry: p, peak, falls, fraction: p / peak };
        }
      }
      prev = p;
    }
  }
  return null;
}

function fireVariantAt(seedJson, fraction) {
  const e = fireEnvelope(seedJson, fraction);
  const f = fireFallback(seedJson);
  if (e == null) return f;
  if (f == null) return e;
  return f.day < e.day ? f : e;
}

function analyzeEnvelopeSeed(seedJson, fractions) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const collapsing = base.collapsed && base.firstStarvationDay != null;
  const ref = collapsing ? base.firstStarvationDay : null;
  const verified = (seedJson.rows || []).length === base.daysAlive;
  const perFraction = {};
  for (const fr of (fractions || FRACTIONS)) {
    const e = fireEnvelope(seedJson, fr);
    const f = fireFallback(seedJson);
    const v = fireVariantAt(seedJson, fr);
    const lead = (x) => (x != null && ref != null) ? (ref - x.day) : null;
    const leadC = lead(c);
    const leadV = lead(v);
    perFraction[String(fr)] = {
      e: e == null ? null : Object.assign({}, e, { lead: lead(e) }),
      f: f == null ? null : Object.assign({}, f),
      v: v == null ? null : Object.assign({}, v, { lead: leadV }),
      leadC,
      tie: leadV != null && (leadC == null || leadV >= leadC),
      strict: leadV != null && (leadC == null || leadV > leadC),
      leadOne: leadV != null && leadV >= 1,
    };
  }
  return {
    seed: seedJson.seed,
    survived: base.survived,
    collapsed: base.collapsed,
    collapsing,
    daysAlive: base.daysAlive,
    rows: (seedJson.rows || []).length,
    verified,
    unverified: UNVERIFIED_SEEDS.has(seedJson.seed),
    endReason: base.endReason,
    maxWaveUnlocked: base.maxWaveUnlocked,
    firstStarvationDay: base.firstStarvationDay,
    referenceDay: ref,
    c: c == null ? null : { day: c.day, lead: ref != null ? ref - c.day : null },
    perFraction,
  };
}

function summarizeEnvelope(allSeeds, fractions) {
  const frs = fractions || FRACTIONS;
  const analyzed = allSeeds.map((sj) => analyzeEnvelopeSeed(sj, frs));
  const verifiedCollapsing = analyzed.filter((s) => s.collapsing && s.verified);
  const verifiedSurvivors = analyzed.filter((s) => s.survived && s.verified);
  const unverified = analyzed.filter((s) => s.unverified);
  const perFractionSummary = {};
  for (const fr of frs) {
    const key = String(fr);
    const col = verifiedCollapsing;
    const n = col.length;
    const fired = col.filter((s) => s.perFraction[key].v != null);
    const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    const round1 = (x) => x == null ? null : Math.round(x * 10) / 10;
    perFractionSummary[key] = {
      fraction: fr,
      collapsingN: n,
      fireCount: fired.length,
      fireRate: n ? fired.length / n : null,
      tieCount: col.filter((s) => s.perFraction[key].tie).length,
      strictCount: col.filter((s) => s.perFraction[key].strict).length,
      leadOneCount: col.filter((s) => s.perFraction[key].leadOne).length,
      meanLeadV: round1(mean(fired.map((s) => s.perFraction[key].v.lead))),
      meanLeadC: round1(mean(col.filter((s) => s.c != null).map((s) => s.c.lead))),
      survivorN: verifiedSurvivors.length,
      survivorFireCount: verifiedSurvivors.filter((s) => s.perFraction[key].v != null).length,
      survivorFireSeeds: verifiedSurvivors.filter((s) => s.perFraction[key].v != null).map((s) => s.seed),
    };
  }
  return {
    fractions: frs,
    verifiedCollapsing: verifiedCollapsing.map((s) => s.seed),
    verifiedSurvivors: verifiedSurvivors.map((s) => s.seed),
    unverifiedSeeds: unverified.map((s) => s.seed),
    perFraction: perFractionSummary,
    seeds: analyzed,
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeEnvelope(seeds), null, 2) + '\n');
  });
}

module.exports = { fireEnvelope, fireVariantAt, analyzeEnvelopeSeed, summarizeEnvelope, FRACTIONS, UNVERIFIED_SEEDS };
