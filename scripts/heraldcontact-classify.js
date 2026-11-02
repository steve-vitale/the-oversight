'use strict';
// heraldcontact-classify.js — PURE classifier for sim-heraldcontact-a
// (Loop A 20261102T0725Z, axis scale-onramp). No game load, no I/O.
// Decision order (first match wins), pre-registered in
// evidence/2026-11-02/sim-heraldcontact-a-prereg.md. Input is one
// per-seed corpus record from scripts/heraldcontact-replay-20261102.js
// (or a stub with the same fields). A seed is UNCLASSIFIED only when
// no recorder row explains it — never as a bucket for "didn't look".
//
// Milestones are re-derived here from samples when present (the
// replay's milestones are a convenience copy, not the authority),
// so the validator reproduces the verdict from the corpus alone.
function firstDay(samples, pred) {
  if (!Array.isArray(samples)) return null;
  for (const s of samples) { if (s && pred(s)) return s.day; }
  return null;
}

function derive(rec) {
  const samples = Array.isArray(rec.samples) ? rec.samples : [];
  const attempts = Array.isArray(rec.attempts) ? rec.attempts : [];
  const ms = rec.milestones || {};
  const wave4Day = samples.length ? firstDay(samples, s => (s.wave | 0) >= 4) : (ms.wave4Day != null ? ms.wave4Day : null);
  const regionalDay = samples.length ? firstDay(samples, s => ['regional', 'national', 'global'].indexOf(s.rank) >= 0) : (ms.regionalDay != null ? ms.regionalDay : null);
  const omenStartDay = samples.length ? firstDay(samples, s => s.omenStage !== null && s.omenStage !== undefined) : (ms.omenStartDay != null ? ms.omenStartDay : null);
  const omenStage2Day = samples.length ? firstDay(samples, s => (s.omenStage | 0) >= 2) : (ms.omenStage2Day != null ? ms.omenStage2Day : null);
  let endOmenStage = null;
  if (rec.endOmen && rec.endOmen.stage != null) endOmenStage = rec.endOmen.stage;
  else if (samples.length) {
    const last = samples[samples.length - 1];
    endOmenStage = (last && last.omenStage != null) ? last.omenStage : null;
  }
  const hasSamples = samples.length > 0;
  const hasEnd = rec.endReason != null && rec.gameDays != null;
  return { wave4Day, regionalDay, omenStartDay, omenStage2Day, endOmenStage, hasSamples, hasEnd, attempts };
}

function classify(rec) {
  const d = derive(rec);
  const end = rec.endReason || null;
  if (d.attempts.length >= 1) {
    return { code: 'ATTEMPTED', why: '>=1 herald attempt row', detail: d };
  }
  if (d.omenStage2Day != null) {
    return { code: 'LOCATED_NO_ENGAGE', why: 'omen stage 2 reached day ' + d.omenStage2Day + ', zero attempts', detail: d };
  }
  if (d.omenStartDay != null && d.endOmenStage !== null && (d.endOmenStage | 0) < 2) {
    return { code: 'OMEN_STUCK', why: 'omen started day ' + d.omenStartDay + ', stage ' + d.endOmenStage + ' at end, zero attempts', detail: d };
  }
  if (d.wave4Day != null && d.regionalDay != null && d.omenStartDay == null) {
    return { code: 'NO_OMEN', why: 'wave4 day ' + d.wave4Day + ' + regional day ' + d.regionalDay + ', omen never started, zero attempts', detail: d };
  }
  if (d.wave4Day != null && d.regionalDay == null) {
    if (end === 'survived') return { code: 'NEVER_REGIONAL', why: 'wave4 day ' + d.wave4Day + ', regional never reached, survived', detail: d };
    if (end === 'over-other') return { code: 'DIED_BEFORE_REGIONAL', why: 'wave4 day ' + d.wave4Day + ', regional never reached, run ended over-other', detail: d };
    if (end === 'village-lost') return { code: 'LOST_BEFORE_REGIONAL', why: 'wave4 day ' + d.wave4Day + ', regional never reached, village lost', detail: d };
  }
  if (d.wave4Day == null && d.regionalDay == null) {
    if (end === 'survived') return { code: 'NEVER_WAVE4', why: 'wave4 never reached, survived', detail: d };
    if (end === 'over-other') return { code: 'DIED_BEFORE_WAVE4', why: 'wave4 never reached, run ended over-other', detail: d };
    if (end === 'village-lost') return { code: 'LOST_BEFORE_WAVE4', why: 'wave4 never reached, village lost', detail: d };
  }
  // Partial recorder rows that still explain the seed: an omen that
  // started but whose end stage is unknown is OMEN_STUCK only if the
  // last sample shows stage < 2; that case is handled above via
  // endOmenStage. Anything reaching here lacks the rows to decide.
  if (!d.hasSamples && !d.hasEnd) {
    return { code: 'UNCLASSIFIED', why: 'no samples and no end data; no recorder row explains this seed', detail: d };
  }
  return { code: 'UNCLASSIFIED', why: 'recorder rows present but match no code leg (wave4Day=' + d.wave4Day + ' regionalDay=' + d.regionalDay + ' omenStartDay=' + d.omenStartDay + ' end=' + end + ')', detail: d };
}

module.exports = { classify, derive, firstDay };
