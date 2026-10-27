#!/usr/bin/env node
// dedupspan-ledger-b.js — ability-span de-duplication rule for the
// summing ledger (sim-dedupspan-b; prereg:
// evidence/2026-10-27/sim-dedupspan-b-prereg.md).
//
// Problem (proven by sim-cultnest-b, verdict NESTED): the stockdoors
// useAbility wrapper records a pantry diff across a whole useAbility
// SPAN. When the span swallows an endDay, that endDay's pantryDraw
// calls (village meal, commons raid) land inside the diff, so a
// ledger that sums directRecords + mealDrawRecords counts one
// removal twice — once as the meal draws, once as the diff.
//
// Rule (general, span-keyed, item-matched, record-retaining):
//  1. Pair spanEnter/spanExit on a stack by (ability, action, depth)
//     in monotonic evt order. A draw is span-internal iff its
//     drawEnter evt falls strictly between its enclosing span's
//     entry and exit evts. Never by day label, never by ability name.
//  2. A spanExit with directAfter == directBefore + 1 created one
//     directRecord, identified by seq == directAfter when seqs are
//     present (else 1-based ordinal). Seq/ordinal disagreement, or
//     a missing seq, is ambiguous: that span excludes NOTHING.
//  3. For each span-internal draw, match its drawExit items against
//     the created record's remaining items on (name, kcalEach,
//     spoilDay), consuming units. Only matched units are excluded;
//     unmatched record items stay counted, unmatched draw items stay
//     counted under the meal draw. No amount-matching, ever.
//  4. Excluded-from records are RETAINED with summed kcal reduced by
//     exactly the excluded amount, flagged span-duplicate, with the
//     span identity preserved for audit. Nothing is deleted.
//  5. A payload with no nestEvents yields zero exclusions: the rule
//     never falls back to day-label matching.
//  LIMITATION (prereg-stated): nest drawExit items carry
//  (name, kcalEach, units, spoilDay) only — no foodState, no
//  granaryDays — so the match key is those fields. A future span
//  logger should carry foodState to complete the five-field key.
//
// This module changes NO game code and NO existing analyzer: it
// takes a corpus payload and returns the deduped per-record sums
// plus the adjustment, so a ledger can report old vs deduped side
// by side. When required, exports { applySpanDedup, famOf, isDried }.
// When run, prints the 9954 dedup summary for the cultnest replay.
'use strict';
const fs = require('fs');
const path = require('path');

function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function itemKey(it) { return [it.name, it.kcalEach, it.spoilDay].join('|'); }
function itemKcal(it) { return (it.units || 0) * (it.kcalEach || 0); }
function isGeneric(it) { return famOf(it.name) === 'Foraged food' && !isDried(it.name); }
function drawItemsKey(items) {
  return (items || []).map((i) => [i.name, i.kcalEach, i.units, i.spoilDay].join('|')).join(';');
}

function applySpanDedup(payload) {
  const direct = payload.directRecords || [];
  const meals = (payload.mealDrawRecords || []).filter((r) => r.kind === 'pantryDraw');
  const ev = payload.nestEvents || [];
  const perDirect = direct.map((r) => {
    const items = r.items || [];
    const origTotal = typeof r.totalKcal === 'number' ? r.totalKcal : items.reduce((t, i) => t + itemKcal(i), 0);
    const origGeneric = items.filter(isGeneric).reduce((t, i) => t + itemKcal(i), 0);
    return {
      seq: r.seq != null ? r.seq : null, path: r.path || null, day: r.day != null ? r.day : null,
      originalTotalKcal: origTotal, originalGenericKcal: origGeneric,
      excludedKcal: 0, excludedGenericKcal: 0, summedTotalKcal: origTotal, summedGenericKcal: origGeneric,
      flagged: false, span: null,
    };
  });
  const base = {
    hasSpanData: Array.isArray(payload.nestEvents) && payload.nestEvents.length > 0,
    spans: 0, spansCreatingRecord: 0, drawPairs: 0, spanInternalDraws: 0,
    exclusions: [], perDirect, ambiguousSpans: [], unmatchedDrawLinks: 0,
    totalExcludedKcal: 0, totalExcludedGenericKcal: 0, changedRecords: 0,
  };
  if (!base.hasSpanData) return base;

  // Pair spans (stack) and draws (pending enter) in evt order.
  const events = ev.slice().sort((a, b) => (a.evt || 0) - (b.evt || 0));
  const stack = [];
  const spans = [];
  const draws = [];
  let pendingDraw = null;
  for (const e of events) {
    if (e.kind === 'spanEnter') {
      const entry = { ability: e.ability, action: e.action, depth: e.depth,
        enterEvt: e.evt, enterDay: e.day, directBefore: e.directBefore, exitEvt: null, exitDay: null, directAfter: null };
      stack.push(entry);
    } else if (e.kind === 'spanExit') {
      let idx = -1;
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].ability === e.ability && stack[i].action === e.action && stack[i].depth === e.depth) { idx = i; break; }
      }
      if (idx < 0) continue;
      const entry = stack[idx];
      entry.exitEvt = e.evt; entry.exitDay = e.day; entry.directAfter = e.directAfter;
      spans.push(entry);
      stack.splice(idx, 1);
    } else if (e.kind === 'drawEnter') {
      pendingDraw = { enterEvt: e.evt, enterDay: e.day, want: e.want,
        span: stack.length ? stack[stack.length - 1] : null };
    } else if (e.kind === 'drawExit' && pendingDraw) {
      pendingDraw.exitEvt = e.evt; pendingDraw.exitDay = e.day;
      pendingDraw.taken = e.taken; pendingDraw.items = e.items || [];
      draws.push(pendingDraw);
      pendingDraw = null;
    }
  }
  base.spans = spans.length;
  base.drawPairs = draws.length;

  // Link each draw, in evt order, to the next unmatched pantryDraw
  // record with the same (want, taken, items key). Linkage is audit
  // only; it never changes an exclusion.
  const usedMeal = new Set();
  for (const d of draws) {
    d.mealSeq = null;
    for (let i = 0; i < meals.length; i++) {
      if (usedMeal.has(i)) continue;
      const m = meals[i];
      if (Math.round(m.want) === Math.round(d.want) && Math.round(m.taken) === Math.round(d.taken) &&
          drawItemsKey(m.items) === drawItemsKey(d.items)) {
        usedMeal.add(i); d.mealSeq = m.seq != null ? m.seq : null; break;
      }
    }
    if (d.mealSeq == null) base.unmatchedDrawLinks++;
  }

  // Resolve each span's created record (fail-closed on ambiguity).
  const hasSeq = direct.some((r) => r.seq != null);
  for (const s of spans) {
    if (s.directAfter !== s.directBefore + 1) continue;
    base.spansCreatingRecord++;
    let recIdx = -1;
    if (hasSeq) {
      const bySeq = direct.findIndex((r) => r.seq === s.directAfter);
      if (bySeq < 0) { base.ambiguousSpans.push({ span: s, reason: 'seq-not-found' }); continue; }
      const byOrd = direct[s.directAfter - 1];
      if (byOrd && byOrd.seq != null && byOrd !== direct[bySeq]) {
        base.ambiguousSpans.push({ span: s, reason: 'seq-ordinal-disagree' }); continue;
      }
      recIdx = bySeq;
    } else {
      recIdx = s.directAfter - 1;
      if (recIdx < 0 || recIdx >= direct.length) {
        base.ambiguousSpans.push({ span: s, reason: 'ordinal-out-of-range' }); continue;
      }
    }
    s.createdRecordIndex = recIdx;
  }

  // Consume span-internal draws against their span's created record.
  const remaining = new Map(); // record index -> Map(key -> units)
  function remainingFor(idx) {
    if (!remaining.has(idx)) {
      const m = new Map();
      for (const it of (direct[idx].items || [])) m.set(itemKey(it), (m.get(itemKey(it)) || 0) + (it.units || 0));
      remaining.set(idx, m);
    }
    return remaining.get(idx);
  }
  for (const d of draws) {
    if (!d.span || d.span.createdRecordIndex == null) continue;
    base.spanInternalDraws++;
    const idx = d.span.createdRecordIndex;
    const rem = remainingFor(idx);
    const pd = perDirect[idx];
    for (const it of (d.items || [])) {
      const k = itemKey(it);
      const avail = rem.get(k) || 0;
      const take = Math.min(it.units || 0, avail);
      if (take <= 0) continue;
      rem.set(k, avail - take);
      const kcal = take * (it.kcalEach || 0);
      const generic = isGeneric(it);
      base.exclusions.push({
        directIndex: idx,
        directSeq: direct[idx].seq != null ? direct[idx].seq : null,
        directPath: direct[idx].path || null, mealSeq: d.mealSeq,
        spanAbility: d.span.ability, spanAction: d.span.action,
        spanEnterEvt: d.span.enterEvt, spanExitEvt: d.span.exitEvt,
        drawEnterEvt: d.enterEvt, drawExitEvt: d.exitEvt,
        item: { name: it.name, kcalEach: it.kcalEach, units: take, spoilDay: it.spoilDay },
        kcal, generic,
      });
      pd.excludedKcal += kcal;
      if (generic) pd.excludedGenericKcal += kcal;
    }
  }
  for (let i = 0; i < perDirect.length; i++) {
    const pd = perDirect[i];
    pd.summedTotalKcal = pd.originalTotalKcal - pd.excludedKcal;
    pd.summedGenericKcal = pd.originalGenericKcal - pd.excludedGenericKcal;
    if (pd.excludedKcal > 0) {
      pd.flagged = true;
      const s = spans.find((x) => x.createdRecordIndex === i);
      pd.span = s ? { ability: s.ability, action: s.action, enterEvt: s.enterEvt, exitEvt: s.exitEvt } : null;
    }
  }
  base.totalExcludedKcal = base.exclusions.reduce((t, e) => t + e.kcal, 0);
  base.totalExcludedGenericKcal = base.exclusions.filter((e) => e.generic).reduce((t, e) => t + e.kcal, 0);
  base.changedRecords = perDirect.filter((p) => p.excludedKcal > 0).length;
  return base;
}

function main() {
  const ROOT = path.join(__dirname, '..');
  const file = process.argv[2] || path.join(ROOT, 'evidence', '2026-10-27',
    'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json');
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = applySpanDedup(payload);
  console.log('hasSpanData=' + out.hasSpanData + ' spans=' + out.spans +
    ' spansCreatingRecord=' + out.spansCreatingRecord + ' drawPairs=' + out.drawPairs +
    ' spanInternalDraws=' + out.spanInternalDraws + ' unmatchedDrawLinks=' + out.unmatchedDrawLinks +
    ' ambiguousSpans=' + out.ambiguousSpans.length);
  console.log('totalExcludedKcal=' + out.totalExcludedKcal +
    ' totalExcludedGenericKcal=' + out.totalExcludedGenericKcal +
    ' changedRecords=' + out.changedRecords);
  for (const p of out.perDirect.filter((x) => x.flagged)) {
    console.log('flagged direct seq=' + p.seq + ' path=' + p.path + ' day=' + p.day +
      ' origTotal=' + p.originalTotalKcal + ' excluded=' + p.excludedKcal +
      ' origGeneric=' + p.originalGenericKcal + ' excludedGeneric=' + p.excludedGenericKcal +
      ' summedGeneric=' + p.summedGenericKcal +
      ' span=' + (p.span ? p.span.ability + '.' + p.span.action + ' evt ' + p.span.enterEvt + '->' + p.span.exitEvt : '?'));
  }
  try {
    const analyzer = require('./analyze-raidcallers-b.js');
    const fam = analyzer.perSeed(payload).fams.get('Foraged food');
    if (fam) {
      // WIRED (sim-dedupspan-wire-b): perSeed now returns deduped
      // figures; the pre-dedup figures come from its preDedup fields.
      console.log('analyzer generic wired (deduped): newDraws=' + fam.newDraws + ' cBResidual(boundary)=' + fam.cBResidual +
        ' newResidual=' + fam.newResidual);
      console.log('analyzer generic pre-dedup: newDraws=' + fam.newDrawsPreDedup +
        ' cBResidual(boundary)=' + (fam.cBResidual + out.totalExcludedGenericKcal));
    }
  } catch (e) { console.log('analyzer perSeed unavailable: ' + e.message); }
}

module.exports = { applySpanDedup, famOf, isDried };
if (require.main === module) main();
