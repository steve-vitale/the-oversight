// condbreak-20261017.js — READ-ONLY diagnostic analyzer.
// Decomposes every conditions-never-met (fight, trick-kind) row in the
// execensus corpus (evidence/2026-10-16/perseed-execensus/) into a reason:
//   material-missing | rounds-missing | knowledge-missing | position-missing | other:<name>
// The classification is a lookup from (kind, rounds, evals, fires) against the
// engine's own base gates in villagerTrickAction (src/js/fieldFights.js,
// FIGHTOPEN off — the corpus ran with FIGHTOPEN unset). No inference.
//
// Gate facts (base gates, verified against fieldFights.js):
//   congregation/argue  : knownSig && round%3===0            -> first fire round-3 eval
//   reunion/improvise   : strikesThrown>=2 && last action strike -> first fire round-3 eval
//                         (gate is evaluated BEFORE the round's action, so at
//                          round-r eval, strikesThrown <= r-1; 2 needs r>=3)
//   editor/continuity   : actionKinds[-2]==='strike' && [-1]==='strike' -> first fire round-3 eval
//   eater/poison        : villagerHasSpoiledFood(vid)        -> no round component,
//                         pure material gate; fires any round when stocked
// None of these gates references grid position (position-needing kinds are
// documented UN-ACTUABLE and have no learnings in the corpus).
// Knowledge is proven per-row by fight.seq > learn.seq (funnel is post-learning).
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-execensus');

// Gate table: grounded in villagerTrickAction (fieldFights.js). minRounds is
// the earliest round whose gate EVALUATION can return non-null.
const GATE_TABLE = {
  congregation: {
    trick: 'argue theology (congregation-heresy)',
    gateText: 'knownSig && fctx.round % 3 === 0',
    gateClass: 'round-schedule', minRounds: 3, needsPosition: false, needsMaterial: false,
  },
  reunion: {
    trick: 'improvise (reunion-novel)',
    gateText: 'rec.strikesThrown >= 2 && rec.actionKinds last === "strike"',
    gateClass: 'action-count', minRounds: 3, needsPosition: false, needsMaterial: false,
  },
  editor: {
    trick: 'contradict yourself (editor-continuity)',
    gateText: 'rec.actionKinds last two both "strike"',
    gateClass: 'action-count', minRounds: 3, needsPosition: false, needsMaterial: false,
  },
  eater: {
    trick: 'poison the meal (eater-poison)',
    gateText: 'this.villagerHasSpoiledFood(vid)',
    gateTextNote: 'the ONLY precondition; fires on any round when the fighter carries spoiled food',
    gateClass: 'material', minRounds: 1, needsPosition: false, needsMaterial: true,
  },
};

function classifyRow(kind, fight, learnSeq) {
  const errors = [];
  const row = {
    kind, learnSeq, seq: fight.seq, day: fight.day, vid: fight.vid,
    rounds: fight.rounds, evals: fight.evals, fires: fight.fires,
    outcome: fight.outcome, cls: fight.cls,
    reason: null, reasonDetail: null, instrumentError: false,
  };
  // The sweep's own classification is the input sanity check.
  if (fight.cls !== 'conditions-never-met') {
    row.instrumentError = true; errors.push('input row not conditions-never-met');
    return { row, errors };
  }
  if (fight.fires !== 0) {
    row.instrumentError = true; errors.push('fires!=0 on a conditions-never-met row');
    return { row, errors };
  }
  // Knowledge: the funnel is post-learning; prove it per row.
  if (!(fight.seq > learnSeq)) {
    row.instrumentError = true;
    errors.push('fight.seq <= learn.seq: fight predates the learning (knowledge not held)');
    return { row, errors };
  }
  const gate = GATE_TABLE[kind];
  if (!gate) {
    row.reason = 'other';
    row.reasonDetail = 'other: unmapped-kind — no gate entry for "' + kind + '"';
    return { row, errors };
  }
  if (gate.needsPosition) {
    row.reason = 'position-missing';
    row.reasonDetail = 'position-missing: gate needs a grid position the fight never produced';
    return { row, errors };
  }
  if (gate.needsMaterial) {
    // Pure material gate: it fires on ANY round when stocked. evals>=1 and
    // fires==0 proves the fighter carried no spoiled food — no round count
    // can fix it.
    if (fight.evals >= 1) {
      row.reason = 'material-missing';
      row.reasonDetail = 'material-missing: poison gate = villagerHasSpoiledFood(vid) — the ONLY precondition; ' +
        'evaluated ' + fight.evals + 'x, never fired => fighter carried no spoiled food';
    } else {
      row.instrumentError = true;
      errors.push('evals=0 on a conditions-never-met row (sweep classifies evals=0 as no-opportunity)');
    }
    return { row, errors };
  }
  // Round-schedule / action-count gates: they can only fire once the fight
  // reaches minRounds. Below that, the fight's shape — not behavior —
  // closed the window.
  if (fight.rounds < gate.minRounds) {
    row.reason = 'rounds-missing';
    row.reasonDetail = 'rounds-missing: gate "' + gate.gateText + '" can first fire on the round-' +
      gate.minRounds + ' evaluation; fight ended round ' + fight.rounds;
    return { row, errors };
  }
  // Reaching the gate's round requirement with evals and still no fire is
  // an engine/instrument inconsistency (the gate has no other precondition),
  // not a classification — fail loudly rather than attribute it.
  row.instrumentError = true;
  errors.push('rounds=' + fight.rounds + ' >= minRounds=' + gate.minRounds + ', evals=' + fight.evals +
    ', fires=0: gate should have been fireable — instrument/engine inconsistency, not attributable');
  return { row, errors };
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyze(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
  const rows = [];
  const errors = [];
  let nLearnings = 0, nRuns = 0;
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    nRuns++;
    nLearnings += (d.witnessLearnings || []).length;
    for (const L of (d.funnel || [])) {
      const kind = L.id || L.trick;
      // The funnel entry carries learnId; the learning's seq lives on
      // witnessLearnings (the funnel entry itself has no seq).
      const wl = (d.witnessLearnings || []).find(x => x.learnId === L.learnId);
      const learnSeq = wl ? wl.seq : L.seq;
      for (const fight of (L.fights || [])) {
        if (fight.cls !== 'conditions-never-met') continue;
        const { row, errors: errs } = classifyRow(kind, fight, learnSeq);
        if (wl == null && L.seq == null) errs.push('no learn seq available for learnId ' + L.learnId);
        row.runFile = f; row.learnId = L.learnId; row.wave = L.wave;
        rows.push(row);
        errors.push(...errs.map(e => f + ' seq=' + fight.seq + ' ' + kind + ': ' + e));
      }
    }
  }
  const byReason = {}, byKindReason = {}, byKind = {};
  const shapeByReason = {};
  for (const r of rows) {
    const key = r.reason || 'ERROR';
    byReason[key] = (byReason[key] || 0) + 1;
    const kr = r.kind + ' x ' + key;
    byKindReason[kr] = (byKindReason[kr] || 0) + 1;
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    if (r.reason && !r.instrumentError) {
      (shapeByReason[r.reason] = shapeByReason[r.reason] || []).push(r);
    }
  }
  const fightShape = {};
  for (const [reason, rs] of Object.entries(shapeByReason)) {
    const outcomes = {};
    for (const r of rs) outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
    fightShape[reason] = {
      n: rs.length,
      medianRounds: median(rs.map(r => r.rounds)),
      medianEvals: median(rs.map(r => r.evals)),
      outcomeSplit: outcomes,
      pctDied: (outcomes.vDie || 0) / rs.length,
    };
  }
  const unattributed = rows.filter(r => !r.reason && !r.instrumentError);
  const result = {
    corpusFiles: files.length, nRuns, nLearnings,
    nConditionsNeverMet: rows.length,
    rows,
    reasonShares: byReason,
    kindReasonCells: byKindReason,
    kindCounts: byKind,
    fightShapeByReason: fightShape,
    instrumentErrors: errors,
    unattributedRows: unattributed.length,
    verdict: (errors.length === 0 && unattributed.length === 0 && rows.length > 0) ? 'GO' : 'NO-GO',
  };
  return result;
}

module.exports = { classifyRow, GATE_TABLE, analyze, CORPUS };

if (require.main === module) {
  const result = analyze(process.env.CONDBREAK_CORPUS || CORPUS);
  console.log('files:', result.corpusFiles, 'runs:', result.nRuns, 'learnings:', result.nLearnings);
  console.log('conditions-never-met rows:', result.nConditionsNeverMet);
  console.log('--- reason shares ---');
  for (const [k, v] of Object.entries(result.reasonShares))
    console.log('  ' + k + ':', v, '(' + (100 * v / result.nConditionsNeverMet).toFixed(1) + '%)');
  console.log('--- kind x reason cells ---');
  for (const [k, v] of Object.entries(result.kindReasonCells)) console.log('  ' + k + ':', v);
  console.log('--- fight shape by reason ---');
  console.log(JSON.stringify(result.fightShapeByReason, null, 1));
  console.log('instrument errors:', result.instrumentErrors.length);
  for (const e of result.instrumentErrors) console.log('  ERROR:', e);
  console.log('unattributed rows:', result.unattributedRows);
  console.log('VERDICT:', result.verdict);
}
