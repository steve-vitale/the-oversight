#!/usr/bin/env node
// dedupspan-apply-b.js — wiring helper for the ability-span
// de-duplication rule (sim-dedupspan-wire-b; rule:
// scripts/dedupspan-ledger-b.js, sim-dedupspan-b, 33/33).
//
// Problem: a ledger that sums directRecords + mealDrawRecords
// counts one removal twice when a useAbility span swallows an
// endDay (the meal draws inside the span are also inside the
// span's pantry diff). The rule's exclusions must be subtracted
// from the direct side of every ledger total that includes them.
//
// Wired analyzers (their perSeed calls the two apply functions
// below): analyze-stockdoors-b, analyze-residualhunt-b,
// analyze-ledgerbound-b, analyze-raiddor-ledger-b,
// analyze-raidday100-b, analyze-raidday100-general-b,
// analyze-raidday100-judge-b, analyze-raidcallers-b.
//
// Documented-only (never sum directRecords, so the double-count
// cannot occur in them; if one ever gains a direct leg, it MUST
// call spanDedupSummary + applySpanDedupToFams before computing
// residuals, or its figures are pre-dedup by construction):
// analyze-driedpath-b (OLD-definition control: pantryDraw-only,
// no direct leg), analyze-bothgrow-b, analyze-cattailband-b,
// analyze-lqpersist-b, analyze-mealdraw-b,
// analyze-mealdraw-reprereg-b (mealDrawRecords only),
// analyze-spoilvol-b, analyze-smoke-eq-b (no directRecords
// reference at all). Capture/sweep scripts only PRODUCE records;
// they do not sum ledger totals and are out of scope.
//
// Guard contract (see the summary's `status` field, returned on
// every wired perSeed result):
//   'applied' — payload carried nestEvents; exclusions applied.
//   'applied-with-ambiguity' — payload carried nestEvents and at
//     least one span was ambiguous; the rule already fails closed
//     on ambiguity (that span excludes nothing), so applied
//     exclusions are still exact, but the status says the corpus
//     had a span the rule could not resolve.
//   'no-span-data' — payload carried no nestEvents; exclusions
//     are 0 and figures are exactly the old figures. This does NOT
//     certify the corpus clean: a span double-count, if one
//     existed, is undetectable without a span log. Only corpora
//     WITH a span log can be deduped after the fact.
// Boundary rule: boundary legs count flows dated <= 100, so only
// exclusions whose direct record is dated <= 100 enter the
// boundary correction (byFamilyBoundary). Boundary closing is
// untouched: excluded items are direct records, not day-100 meal
// draws. directKcal itself is never rewritten: it stays the raw
// direct total, so newDraws = meal + other + drawSpoiled +
// directKcal - spanDedupKcal is auditable from returned fields.
// LIMITATION carried from the rule: the match key is
// (name, kcalEach, spoilDay) — nest drawExit items lack
// foodState/granaryDays (see the rule module header). This helper
// does not touch the match key.
'use strict';
const { applySpanDedup } = require('./dedupspan-ledger-b.js');

function spanDedupSummary(ps, famOf, isDried) {
  const d = applySpanDedup(ps);
  const byFamily = {};
  const byFamilyDried = {};
  const byFamilyBoundary = {};
  const byFamilyBoundaryDried = {};
  const direct = ps.directRecords || [];
  for (const e of (d.exclusions || [])) {
    const fam = famOf(String((e.item || {}).name));
    const kcal = e.kcal || 0;
    byFamily[fam] = (byFamily[fam] || 0) + kcal;
    if (isDried((e.item || {}).name)) byFamilyDried[fam] = (byFamilyDried[fam] || 0) + kcal;
    // Attribute the exclusion to its direct record's day via the
    // audit index added to exclusions (seq lookup would fail on
    // seq-less corpora, where the index is the only key).
    const idx = e.directIndex;
    const rec = (idx != null && idx >= 0 && idx < direct.length) ? direct[idx] : null;
    if (rec && rec.day != null && rec.day <= 100) {
      byFamilyBoundary[fam] = (byFamilyBoundary[fam] || 0) + kcal;
      if (isDried((e.item || {}).name)) byFamilyBoundaryDried[fam] = (byFamilyBoundaryDried[fam] || 0) + kcal;
    }
  }
  const status = !d.hasSpanData ? 'no-span-data'
    : (d.ambiguousSpans || []).length > 0 ? 'applied-with-ambiguity' : 'applied';
  return {
    hasSpanData: d.hasSpanData, status,
    spans: d.spans, spansCreatingRecord: d.spansCreatingRecord,
    drawPairs: d.drawPairs, spanInternalDraws: d.spanInternalDraws,
    unmatchedDrawLinks: d.unmatchedDrawLinks,
    ambiguousSpans: (d.ambiguousSpans || []).length,
    totalExcludedKcal: d.totalExcludedKcal,
    totalExcludedGenericKcal: d.totalExcludedGenericKcal,
    changedRecords: d.changedRecords,
    byFamily, byFamilyDried, byFamilyBoundary, byFamilyBoundaryDried,
  };
}

function applySpanDedupToFams(fams, summary) {
  for (const rec of fams.values()) {
    const fam = rec.family;
    rec.newDrawsPreDedup = rec.newDraws;
    rec.newDriedDrawsPreDedup = rec.newDriedDraws;
    rec.spanDedupKcal = (summary.byFamily || {})[fam] || 0;
    rec.spanDedupDriedKcal = (summary.byFamilyDried || {})[fam] || 0;
    rec.newDraws -= rec.spanDedupKcal;
    rec.newDriedDraws -= rec.spanDedupDriedKcal;
  }
}

function applySpanDedupToBoundary(bFam, summary) {
  for (const [fam, kcal] of Object.entries(summary.byFamilyBoundary || {})) {
    const entry = bFam.get(fam);
    if (!entry) continue;
    entry.drawsPreDedup = entry.draws;
    entry.dDrawsPreDedup = entry.dDraws;
    entry.draws -= kcal;
    entry.dDraws -= (summary.byFamilyBoundaryDried || {})[fam] || 0;
  }
}

module.exports = { spanDedupSummary, applySpanDedupToFams, applySpanDedupToBoundary };
