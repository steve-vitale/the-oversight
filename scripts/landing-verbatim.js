// Verbatim-repeat counter: split deliberate re-poses from real repeats.
//
// Shared by the landing driver (journey-landing-r138+) and its proof test
// (test-landing-r138-verbatim-repose-20261116.js) — one implementation, no
// drift between the instrument and the test that proves it.
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
// Why these two, and no more:
// - The opener set is tiny (usually the curious question alone) and the
//   only engine path that re-speaks an opener line mid-sitting is the
//   r137 re-pose (the generic resume line is a NEW line; beats are
//   ledger-blocked from repeating in-sitting). A '?' test was considered
//   and REJECTED: one of the four r137 re-poses ends in a period
//   ("What's your first memory? Like, ever. The earliest thing.").
// - At most ONE duplicate occurrence per distinct line per sitting is
//   exempt (the thread is SPENT after one resume; a third speaking of
//   the same line would be a real repeat and still counts).
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
// RETURNS { real, exempted } — a partition of dupes, same order, same
//   length in total. Never mutates its inputs.

function splitVerbatimDupes(dupes, themNorm, openerCount, resumeTakes) {
  const real = [];
  const exempted = [];
  const exemptedValues = new Set();
  const canExempt = (resumeTakes || 0) > 0 && (openerCount || 0) > 0;
  const lines = Array.isArray(themNorm) ? themNorm : [];
  for (const d of (Array.isArray(dupes) ? dupes : [])) {
    const firstIdx = lines.indexOf(d);
    if (canExempt && firstIdx >= 0 && firstIdx < openerCount && !exemptedValues.has(d)) {
      exemptedValues.add(d);
      exempted.push(d);
    } else {
      real.push(d);
    }
  }
  return { real, exempted };
}

module.exports = { splitVerbatimDupes };
