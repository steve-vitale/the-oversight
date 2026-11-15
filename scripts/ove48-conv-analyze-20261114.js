// ove48-conv-analyze-20261114.js — analyzer for the OVE-48 MECHANISM
// arm (sim-ove48-conv-a). Reads one step's 8 per-seed JSONs (seeds
// 190457–190464, the band-3 band) from
// evidence/2026-11-14/perseed-ove48-conv-<step>/ and judges them
// against the prereg (evidence/2026-11-14/sim-ove48-conv-prereg.md).
//
// VALIDITY (V1–V5, all must pass before the mechanism is judged):
//   V1 opens/leg >= 200; V2 >= 95% opens classified; V3 dawn-priority
//   reads > 0 on the subject leg, = 0 on the baseline leg; V4 zero
//   instrument errors; V5 per-seed survival fields field-for-field
//   identical to the band-3 corpora (the recorder is a pure observer).
// DECIDING COMPARISON (judged only if V1–V5 pass):
//   dawn-aligned share among weighted-pick opens, subject minus
//   baseline. GO = subject >= 40% AND improvement >= +15pp.
//   NO-GO = instrument valid but the bar missed.
//   DIAG = any validity bar missed (including a V5 replication
//   deviation — investigate, never re-score).
// SECONDARY (reported, not judged): want distribution + total
// variation distance, pre-emptor rates, dawn-state-present rate,
// opener-produced rate, opener threads, stage-at-close distribution,
// pickDawn cross-check agreement, dawn/commitment/want line counts,
// wall numbers (survived/8, national/table/wins, wave-5, median,
// death-cause shares, starvation).
// Usage: STEP=t-ove48-conv-base node scripts/ove48-conv-analyze-20261114.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STEP = process.env.STEP || '';
const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];
const RUN = 'ove48-conv-pilot';
const SC = require('./masterregress-analyze-20261113');

// DAWN TABLES — copied VERBATIM from the subject source
// (transplant-15a-narrowed-subject:src/js/convo-wants.js, the OVE-48
// pick's DAWN_KIND_WANTS / DAWN_DRIVE_WANTS). The proof test diffs
// these against `git show transplant-15a-narrowed-subject:...` so a
// drift fails loudly instead of silently redefining alignment.
const DAWN_KIND_WANTS = {
  FORAGE: ['ask_favor', 'share_news'],
  WATER: ['ask_favor', 'share_news'],
  HAUL: ['ask_favor', 'share_news'],
  VISIT: ['just_company', 'seek_comfort', 'curious'],
  HAVEN_CHORE: ['warn_you', 'just_company'],
  TRAPS: ['warn_you', 'share_news'],
  HUNT: ['warn_you', 'share_news'],
  SEEK: ['curious', 'share_news'],
  EXPLORE: ['share_news', 'curious'],
  EXPEDITION: ['share_news', 'warn_you'],
  REST: ['seek_comfort', 'just_company'],
  EAT: ['just_company', 'ask_favor'],
  LEAVE: ['warn_you', 'share_news'],
};
const DAWN_DRIVE_WANTS = {
  food_security: ['ask_favor', 'share_news'],
  bonds: ['seek_comfort', 'just_company'],
  safety: ['warn_you', 'just_company'],
  knowledge: ['curious', 'share_news'],
  party_up: ['curious', 'just_company'],
  build_standing: ['curious', 'share_news'],
  gear_up: ['ask_favor', 'share_news'],
  bank_veterans: ['warn_you', 'share_news'],
};

function preferredWants(kind, drive) {
  const out = {};
  const add = function (list) { if (list) for (const id of list) out[id] = true; };
  if (kind) add(DAWN_KIND_WANTS[kind]);
  if (drive) add(DAWN_DRIVE_WANTS[drive]);
  return out;
}
function isAligned(open) {
  if (!open || !open.want) return null;
  if (!open.dawnKind && !open.dawnDrive) return null; // no dawn state: no preference to align with
  const pref = preferredWants(open.dawnKind, open.dawnDrive);
  return !!pref[open.want];
}

const DAWN_LINE_RE = /\bdawn\b/i;
const COMMIT_LINE_RE = /\bcommit(ment|ted|ting)?\b/i;
const WANT_LINE_RE = /\bwhat I (want|need)\b|\bI (want|need) (a hand|help|you to)\b|\babout what'?s on my mind\b/i;

function dirFor(step) { return path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-' + step); }
function perSeedFile(seed, step) {
  return path.join(dirFor(step), 'ove48conv-s' + seed + '-' + RUN + '-fix.json');
}
function band3StepFor(step) {
  if (step === 't-ove48-conv-base') return 't15a-band3-base';
  if (step === 't-ove48-conv-subj') return 't15a-band3-subj';
  return null;
}
function band3File(seed, b3step) {
  return path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + b3step, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
}

function loadCorpus(seeds, step) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, step);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function aggregateConvo(rows) {
  const agg = {
    opens: 0, classified: 0, selectWantCalls: 0, dawnPriorityReads: 0,
    talkToCalls: 0, endConvoCalls: 0,
    byWant: {}, bySource: {}, byThread: {}, byStageClose: {}, byCloseHow: {},
    weightedPick: 0, weightedAligned: 0, weightedWithDawn: 0,
    preemptor: { seed: 0, 'repay-preemptor': 0, 'pocketed-preemptor': 0 },
    dawnPresent: 0, openerProduced: 0, openerTotal: 0,
    pickDawnPresent: 0, pickDawnAgree: 0, pickDawnDisagree: 0,
    lines: 0, dawnLines: 0, commitLines: 0, wantLines: 0,
    perSeed: [],
  };
  for (const r of rows) {
    const c = r.convo || null;
    const seedAgg = { seed: r.seed, opens: 0, weightedPick: 0, weightedAligned: 0, dawnReads: 0 };
    if (!c) { agg.perSeed.push(seedAgg); continue; }
    agg.selectWantCalls += (c.totals && c.totals.selectWantCalls) || 0;
    agg.dawnPriorityReads += (c.totals && c.totals.dawnPriorityReads) || 0;
    agg.talkToCalls += (c.totals && c.totals.talkToCalls) || 0;
    agg.endConvoCalls += (c.totals && c.totals.endConvoCalls) || 0;
    seedAgg.dawnReads = (c.totals && c.totals.dawnPriorityReads) || 0;
    const opens = Array.isArray(c.opens) ? c.opens : [];
    const lines = Array.isArray(c.lines) ? c.lines : [];
    agg.lines += lines.length;
    for (const l of lines) {
      const text = (l && l.line) || '';
      if (DAWN_LINE_RE.test(text)) agg.dawnLines++;
      if (COMMIT_LINE_RE.test(text)) agg.commitLines++;
      if (WANT_LINE_RE.test(text)) agg.wantLines++;
    }
    for (const o of opens) {
      agg.opens++;
      seedAgg.opens++;
      const classified = !!(o.want && o.source && o.dawnSource && o.dawnSource !== 'error');
      if (classified) agg.classified++;
      if (o.want) agg.byWant[o.want] = (agg.byWant[o.want] || 0) + 1;
      if (o.source) agg.bySource[o.source] = (agg.bySource[o.source] || 0) + 1;
      if (o.source === 'weighted-pick') {
        agg.weightedPick++;
        seedAgg.weightedPick++;
        const al = isAligned(o);
        if (al !== null) {
          agg.weightedWithDawn++;
          if (al) { agg.weightedAligned++; seedAgg.weightedAligned++; }
        }
        if (o.pickDawn) {
          agg.pickDawnPresent++;
          const mine = isAligned(o);
          if (mine !== null && mine === !!o.pickDawn.aligned) agg.pickDawnAgree++;
          else if (mine !== null) agg.pickDawnDisagree++;
        }
      } else if (o.source && agg.preemptor[o.source] != null) {
        agg.preemptor[o.source]++;
      }
      if (o.dawnKind || o.dawnDrive) agg.dawnPresent++;
      if (o.openerProduced != null) {
        agg.openerTotal++;
        if (o.openerProduced) agg.openerProduced++;
      }
      if (o.openerThread) agg.byThread[o.openerThread] = (agg.byThread[o.openerThread] || 0) + 1;
      const st = (o.stageAtClose == null) ? 'null' : String(o.stageAtClose);
      agg.byStageClose[st] = (agg.byStageClose[st] || 0) + 1;
      const how = o.closeHow || 'null';
      agg.byCloseHow[how] = (agg.byCloseHow[how] || 0) + 1;
    }
    agg.perSeed.push(seedAgg);
  }
  agg.classifiedShare = agg.opens ? agg.classified / agg.opens : null;
  agg.alignedShare = agg.weightedWithDawn ? agg.weightedAligned / agg.weightedWithDawn : null;
  agg.dawnPresentShare = agg.opens ? agg.dawnPresent / agg.opens : null;
  agg.openerProducedShare = agg.openerTotal ? agg.openerProduced / agg.openerTotal : null;
  agg.pickDawnAgreeRate = agg.pickDawnPresent ? agg.pickDawnAgree / agg.pickDawnPresent : null;
  return agg;
}

function tvd(a, b) {
  const keys = {};
  for (const k of Object.keys(a)) keys[k] = true;
  for (const k of Object.keys(b)) keys[k] = true;
  const ta = Object.values(a).reduce(function (s, v) { return s + v; }, 0) || 1;
  const tb = Object.values(b).reduce(function (s, v) { return s + v; }, 0) || 1;
  let d = 0;
  for (const k of Object.keys(keys)) d += Math.abs((a[k] || 0) / ta - (b[k] || 0) / tb);
  return d / 2;
}

function checkReplication(rows, step) {
  const b3 = band3StepFor(step);
  const out = { checked: 0, mismatches: [], band3Step: b3 };
  if (!b3) { out.mismatches.push('no band-3 mapping for step ' + step); return out; }
  for (const r of rows) {
    const f = band3File(r.seed, b3);
    if (!fs.existsSync(f)) { out.mismatches.push('seed ' + r.seed + ': band-3 corpus file missing'); continue; }
    const b = JSON.parse(fs.readFileSync(f, 'utf8'));
    out.checked++;
    const fields = [
      ['days', r.days, b.days],
      ['endReason', r.endReason, b.endReason],
      ['deaths', (r.deaths || []).length, (b.deaths || []).length],
      ['maxWave', r.maxWave, b.maxWave],
      ['standing', r.standing, b.standing],
    ];
    for (const entry of fields) {
      if (entry[1] !== entry[2]) out.mismatches.push('seed ' + r.seed + ': ' + entry[0] + ' ' + JSON.stringify(entry[1]) + ' != band-3 ' + JSON.stringify(entry[2]));
    }
  }
  return out;
}

function analyzeStep(step) {
  const corpus = loadCorpus(SEEDS, step);
  if (!corpus.complete) {
    console.error('ove48-conv ' + step + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    return { step: step, complete: false, missing: corpus.missing };
  }
  const analysis = SC.analyzeRows(corpus.rows);
  const convo = aggregateConvo(corpus.rows);
  const repl = checkReplication(corpus.rows, step);
  const isSubj = step === 't-ove48-conv-subj';
  const isBase = step === 't-ove48-conv-base';

  // Validity bars V1–V5 (V3's leg half is checked per leg here; the
  // cross-leg half is judged when both summaries exist — the evidence
  // file records it. This analyzer judges its own leg's half.)
  const v = {
    v1Opens: convo.opens >= 200,
    v2Classified: convo.classifiedShare != null && convo.classifiedShare >= 0.95,
    v3DawnReads: isSubj ? (convo.dawnPriorityReads > 0) : isBase ? (convo.dawnPriorityReads === 0) : null,
    v4Errors: analysis.instrumentErrors === 0,
    v5Replication: repl.mismatches.length === 0,
  };
  const validityPass = v.v1Opens && v.v2Classified && v.v3DawnReads !== false && v.v3DawnReads !== null && v.v4Errors && v.v5Replication;
  let verdict = 'DIAG';
  let verdictWhy = '';
  if (!validityPass) {
    verdict = 'DIAG';
    verdictWhy = 'validity failed: ' + Object.keys(v).filter(function (k) { return v[k] !== true; }).join(', ');
  } else {
    // Deciding comparison needs BOTH legs — this analyzer judges its
    // own leg's validity and records the aligned share; the cross-leg
    // GO/NO-GO is computed by compareLegs() below when both summaries
    // exist. A single-leg run reports ALIGNED-SHARE with its bar.
    verdict = 'VALID-INSTRUMENT';
    verdictWhy = 'validity V1–V5 pass on this leg; aligned share ' +
      (convo.alignedShare == null ? 'null' : (convo.alignedShare * 100).toFixed(1) + '%') +
      ' (n=' + convo.weightedWithDawn + ' weighted-pick opens with dawn state)';
  }
  const summary = {
    step: step, seeds: SEEDS, run: RUN,
    band3Step: repl.band3Step,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    rankVerdict: SC.classifyRegional ? SC.classifyRegional(analysis.wall.regional) : null,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
    validity: v,
    validityPass: validityPass,
    verdict: verdict,
    verdictWhy: verdictWhy,
    replication: repl,
    convo: convo,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-' + step + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('ove48-conv ' + step + ': ' + verdict + ' (survived ' + analysis.survived + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  console.log('  convo: opens ' + convo.opens + ', classified ' + (convo.classifiedShare == null ? 'null' : (convo.classifiedShare * 100).toFixed(1) + '%') + ', dawnReads ' + convo.dawnPriorityReads + ', weighted-pick ' + convo.weightedPick + ', aligned ' + (convo.alignedShare == null ? 'null' : (convo.alignedShare * 100).toFixed(1) + '%') + ' (n=' + convo.weightedWithDawn + ')');
  console.log('  convo: wantDist ' + JSON.stringify(convo.byWant) + ' sourceDist ' + JSON.stringify(convo.bySource));
  console.log('  convo: dawnPresent ' + (convo.dawnPresentShare == null ? 'null' : (convo.dawnPresentShare * 100).toFixed(1) + '%') + ', openerProduced ' + (convo.openerProducedShare == null ? 'null' : (convo.openerProducedShare * 100).toFixed(1) + '%') + ', stageClose ' + JSON.stringify(convo.byStageClose));
  console.log('  convo: lines ' + convo.lines + ' (dawn ' + convo.dawnLines + ', commitment ' + convo.commitLines + ', want ' + convo.wantLines + '), pickDawn agree ' + (convo.pickDawnAgreeRate == null ? 'null' : (convo.pickDawnAgreeRate * 100).toFixed(1) + '%') + ' (n=' + convo.pickDawnPresent + ')');
  console.log('  replication vs band-3 ' + repl.band3Step + ': checked ' + repl.checked + ' seeds, mismatches ' + repl.mismatches.length + (repl.mismatches.length ? ' — ' + repl.mismatches.slice(0, 5).join(' | ') : ''));
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  return { step: step, complete: true, survived: analysis.survived, validityPass: validityPass, verdict: verdict, instrumentErrors: analysis.instrumentErrors, summary: summary };
}

// compareLegs(baseSummary, subjSummary): the cross-leg deciding
// comparison from the prereg. GO = subject aligned share >= 40% AND
// improvement >= +15pp over baseline. Writes the comparison JSON.
function compareLegs(baseSummaryPath, subjSummaryPath) {
  const base = JSON.parse(fs.readFileSync(baseSummaryPath, 'utf8'));
  const subj = JSON.parse(fs.readFileSync(subjSummaryPath, 'utf8'));
  const b = base.convo, s = subj.convo;
  const alignedBase = b.alignedShare, alignedSubj = s.alignedShare;
  const diffPp = (alignedSubj != null && alignedBase != null) ? (alignedSubj - alignedBase) * 100 : null;
  const validityBoth = !!(base.validityPass && subj.validityPass);
  const v3Cross = (b.dawnPriorityReads === 0) && (s.dawnPriorityReads > 0);
  let verdict = 'DIAG', why = '';
  if (!validityBoth || !v3Cross) {
    verdict = 'DIAG';
    why = 'validity failed on a leg' + (!v3Cross ? ' (V3 cross-leg: baseline dawnReads=' + b.dawnPriorityReads + ', subject dawnReads=' + s.dawnPriorityReads + ')' : '');
  } else if (alignedSubj == null || alignedBase == null) {
    verdict = 'DIAG';
    why = 'aligned share null on a leg (no weighted-pick opens with dawn state)';
  } else if (alignedSubj >= 0.40 && diffPp >= 15) {
    verdict = 'GO';
    why = 'subject aligned ' + (alignedSubj * 100).toFixed(1) + '% vs baseline ' + (alignedBase * 100).toFixed(1) + '% (+' + diffPp.toFixed(1) + 'pp)';
  } else {
    verdict = 'NO-GO';
    why = 'subject aligned ' + (alignedSubj * 100).toFixed(1) + '% vs baseline ' + (alignedBase * 100).toFixed(1) + '% (' + (diffPp >= 0 ? '+' : '') + diffPp.toFixed(1) + 'pp) — bar is >=40% and +15pp';
  }
  const out = {
    baseStep: base.step, subjStep: subj.step,
    validityBoth: validityBoth, v3Cross: v3Cross,
    base: { opens: b.opens, alignedShare: alignedBase, weightedWithDawn: b.weightedWithDawn, dawnReads: b.dawnPriorityReads, byWant: b.byWant },
    subj: { opens: s.opens, alignedShare: alignedSubj, weightedWithDawn: s.weightedWithDawn, dawnReads: s.dawnPriorityReads, byWant: s.byWant },
    diffPp: diffPp,
    wantTvd: tvd(b.byWant, s.byWant),
    verdict: verdict, verdictWhy: why,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-comparison.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('ove48-conv COMPARISON: ' + verdict + ' — ' + why);
  console.log('  want TVD: ' + out.wantTvd.toFixed(3));
  console.log('  comparison: ' + path.relative(REPO, outFile));
  return out;
}

function main() {
  if (!STEP) { console.error('ove48-conv: STEP required.'); process.exit(2); }
  if (STEP === 'compare') {
    const baseP = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-t-ove48-conv-base-summary.json');
    const subjP = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-t-ove48-conv-subj-summary.json');
    if (!fs.existsSync(baseP) || !fs.existsSync(subjP)) { console.error('ove48-conv compare: both leg summaries required.'); process.exit(2); }
    const res = compareLegs(baseP, subjP);
    process.exit(res.verdict === 'DIAG' ? 1 : 0);
  }
  const res = analyzeStep(STEP);
  if (!res.complete) process.exit(1);
  if (!res.validityPass || res.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN,
  DAWN_KIND_WANTS: DAWN_KIND_WANTS, DAWN_DRIVE_WANTS: DAWN_DRIVE_WANTS,
  preferredWants: preferredWants, isAligned: isAligned,
  dirFor: dirFor, perSeedFile: perSeedFile, loadCorpus: loadCorpus,
  aggregateConvo: aggregateConvo, analyzeStep: analyzeStep,
  compareLegs: compareLegs, checkReplication: checkReplication, tvd: tvd,
};
