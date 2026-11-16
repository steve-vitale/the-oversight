// Verbatim-repeat counter: split deliberate re-poses from real repeats.
//
// Shared by the landing driver (journey-landing-r138+) and its proof tests
// (test-landing-r138-verbatim-repose-20261116.js,
// test-landing-r139-verbatim-repose-greeting-20261116.js) — one
// implementation, no drift between the instrument and the tests that
// prove it.
//
// CONTEXT (journey-landing r137, 2026-11-15): the r137 fix re-poses the
// SAME curious question when the player picks the want-thread resume
// ("We never finished — <question>"). The re-pose IS a repeat by design —
// the NPC asks again because the player came back. The driver's verbatim
// counter (exact duplicate THEM lines in a sitting) counted all four
// r137 re-poses as VERBATIM REPEATS (seeds 1146, 1147, 1148, 1150).
//
// RULE (R138): a duplicate THEM line is EXEMPT when ALL hold:
//   1. this sitting took a want-thread resume (alive:thread:want >= 1), AND
//   2. the line's FIRST occurrence is one of the sitting's opener THEM
//      lines (index < openerCount in the sitting's normalized THEM lines).
//
// RULE (R139, journey-landing r139 pilot, 2026-11-16): a duplicate
// occurrence is ALSO exempt when it is the THEM line spoken IMMEDIATELY
// AFTER a want-thread resume take — i.e. its occurrence index is one of
// the reposeIndices the driver recorded at each resume take. The R138
// opener rule is an approximation ("the re-posed question is usually the
// opener") and it MISSES the greeting-opener shape: seed 1164 day 6,
// Henry opens with "Can we talk?..." (openerCount 1) and asks the
// question on the NEXT turn (first occurrence index 1, not < 1), so the
// deliberate re-pose after "We never finished — who you don't trust."
// read as a VERBATIM REPEAT. The repose-index rule is the precise
// version: the engine speaks the re-posed question as the very next
// THEM line after the resume take, whatever the opener was.
//
// Why these rules, and no more:
// - The opener set is tiny (usually the curious question alone) and the
//   only engine path that re-speaks an opener line mid-sitting is the
//   r137 re-pose (the generic resume line is a NEW line; beats are
//   ledger-blocked from repeating in-sitting). A '?' test was considered
//   and REJECTED: one of the four r137 re-poses ends in a period
//   ("What's your first memory? Like, ever. The earliest thing.").
// - The repose-index rule fires only on the exact THEM index the driver
//   recorded at a resume take — no other engine path speaks a line
//   there, and a duplicate elsewhere in the sitting is untouched.
// - At most ONE duplicate occurrence per distinct line per sitting is
//   exempt (the thread is SPENT after one resume; a third speaking of
//   the same line would be a real repeat and still counts), and at most
//   ONE exemption per recorded repose index.
// - Exempted lines are counted separately by the caller
//   (MET.verbatimRepeatsExempted) so an explosion stays visible.
//
// INPUTS
//   dupes: normalized THEM lines, one entry per duplicate occurrence
//     (2nd, 3rd, ... speaking of a line), in transcript order — the
//     exact output of themNorm.filter((x, i) => themNorm.indexOf(x) !== i).
//   themNorm: normalized THEM lines for the whole sitting, spoken order.
//   openerCount: number of THEM lines spoken at the opener
//     (the driver's _startThem.length).
//   resumeTakes: want-thread resumes taken this sitting.
//   reposeIndices (optional): THEM indices of the lines spoken
//     immediately after each want-thread resume take (the driver's
//     per-sitting _reposeIdxSit). Omitted/empty = R138 behavior.
// RETURNS { real, exempted, exemptedBy } — a partition of dupes, same
//   order, same length in total; exemptedBy[i] is 'opener' or 'repose'
//   parallel to exempted. Never mutates its inputs.

function splitVerbatimDupes(dupes, themNorm, openerCount, resumeTakes, reposeIndices) {
  const real = [];
  const exempted = [];
  const exemptedBy = [];
  const exemptedValues = new Set();
  const usedReposeIdx = new Set();
  const canExemptOpener = (resumeTakes || 0) > 0 && (openerCount || 0) > 0;
  const lines = Array.isArray(themNorm) ? themNorm : [];
  const reposeSet = new Set(Array.isArray(reposeIndices) ? reposeIndices : []);
  // Duplicate occurrences in transcript order, with their THEM index —
  // the same order as the caller's dupes list (2nd, 3rd, ... speaking).
  const seen = new Set();
  const occIdx = [];
  for (let i = 0; i < lines.length; i++) {
    if (seen.has(lines[i])) occIdx.push(i);
    else seen.add(lines[i]);
  }
  const list = Array.isArray(dupes) ? dupes : [];
  for (let k = 0; k < list.length; k++) {
    const d = list[k];
    const idx = occIdx[k];
    const firstIdx = lines.indexOf(d);
    let rule = null;
    if (canExemptOpener && firstIdx >= 0 && firstIdx < openerCount && !exemptedValues.has(d)) {
      rule = 'opener';
    } else if (typeof idx === 'number' && reposeSet.has(idx) && !usedReposeIdx.has(idx) && !exemptedValues.has(d)) {
      rule = 'repose';
    }
    if (rule) {
      exemptedValues.add(d);
      if (typeof idx === 'number') usedReposeIdx.add(idx);
      exempted.push(d);
      exemptedBy.push(rule);
    } else {
      real.push(d);
    }
  }
  return { real, exempted, exemptedBy };
}

module.exports = { splitVerbatimDupes };
