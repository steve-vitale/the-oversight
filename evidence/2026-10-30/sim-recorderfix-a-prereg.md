# sim-recorderfix-a prereg — recorder loss-day snapshot gap (instrument fix)

Run: fleshout-20261030T1747Z, arm sim-recorderfix-a, axis scale-onramp.
Backlog item claimed by this run: the RECORDER LOSS-DAY SNAPSHOT GAP from
arm sim-tributecost-a (evidence/2026-10-30/sim-tributecost-a.md, run
fleshout-20261030T1427Z, adjudicated DIAG-NO-GO on bar 2 in round 1639).

## Canon read first

- docs/CANON.md, then the tributecost canon note in
  evidence/2026-10-30/sim-tributecost-a-prereg.md (hierarchy.js
  LEAD/counter tribute mechanics, formation floors).
- No canon doc covers recorder instrumentation specifically. The
  mechanism below comes from scripts/sweep-tributecost-a.js itself,
  read before writing this prereg — not invented: the recorder's
  daily pantry/population/link snapshots land in the post-daily hook
  (after a completed policy.daily), so on a village-lost run the loss
  day contributes no snapshot when the village is lost before or
  inside that day's daily. The sweep already takes an end-of-run
  link snapshot for exactly this mid-day-loss case but takes no
  equivalent end-of-run pantry/population snapshot. That asymmetry
  is the gap this arm closes. Adjacent canon: docs/ABILITY-REFUSALS.md
  (pantry ledger accounting) is about game pantry numbers, not this
  recorder, and is not changed or relied on here.

## Scope guard (binding)

- ZERO src/js changes, ZERO policy changes, ZERO default flips.
  Recorder script + proof test only: scripts/sweep-tributecost-a.js
  and a new scripts/test-recorderfix-a.js. scripts/test-tributecost-a.js
  is re-run as a regression check but NOT modified unless it breaks
  for a stated reason (it should not: the fix adds a field, it does
  not change any existing series).
- NO other instrument is touched: scripts/analyze-tributecost-a.js,
  scripts/test-tributecost-zero.js, the balance-panel driver, and
  every other sweep/test script are out of scope. If the fix would
  touch a file another arm owns, STOP and report instead of editing.
- The recorder still never feeds a roster, list, census, or link
  snapshot into any villager decision (perception law): the new
  snapshot is a pure post-run read of pantry + roster state, like
  the existing end-of-run link snapshot.
- No [needs-eyes]: instrument-only, no feel, combat, or UI change.

## The fix (prescribed by the round-1639 metric review)

1. The recorder takes an end-of-run pantry/population snapshot
   alongside the existing end-of-run link snapshot: one new
   top-level row field, `endSnapshot: { scholarDay, pantryKcal,
   pop }`, computed from pure reads immediately after runDays
   returns (pantry sum via the existing pantryKcal helper, roster
   length via the existing rosterIds helper). Existing series
   (pantryDaily, popDaily, linkDays, pantryEOD, endLinks) are NOT
   extended, renamed, or reordered, so every previously recorded
   number stays in place and the new snapshot is strictly additive.
2. Bar 2 is reworded (this prereg + the final evidence, not game
   code): one snapshot per completed post-daily — pantryDaily /
   popDaily / linkDays length == result.days, OR == days-1 on a
   village-lost run whose loss day yielded no post-daily snapshot —
   AND endSnapshot present with scholarDay == result.days,
   pantryKcal finite and non-negative, pop a non-negative integer.

## Pilot (judged): leanlink seeds 9911–9918, 180d, death-aware

- Horizon: 180 days, DEATH-AWARE (runDays ends on village-lost /
  over; no fixed-200d tail). Same horizon and same seeds as the
  tributecost pilot, so per-seed reproduction is checkable.
- Seeds: 9911, 9912, 9913, 9914, 9915, 9916, 9917, 9918. Policy:
  leanlink (LEANLINK=1, separate process), via the unchanged
  scripts/sweep-tributecost-a.js driver. The three loss-day pilot
  seeds are 9911 (166d), 9913 (129d), 9918 (159d).
- Outputs (new directory, never overwriting the tributecost
  corpus): evidence/2026-10-30/sim-recorderfix-a-corpus-leanlink/
  (per-seed files) + sim-recorderfix-a-leanlink.json (aggregate)
  + sim-recorderfix-a-leanlink.log (sweep stdout).
- Confirm band (ONLY if pilot GO): none is needed for an
  instrument fix whose pilot already covers the loss-day pattern
  on 3 seeds plus the full 8-seed band; a confirm band would
  re-prove the same recorder property on fresh seeds. If the
  pilot passes, the arm is done — no confirm spend. If the pilot
  fails its bars, STOP per the pilot gate.

## Primary metric (binding) + GO threshold

GO iff ALL of:

(a) Proof test green: scripts/test-recorderfix-a.js passes, proving
    the end-of-run snapshot is written on village-lost runs
    (fixture check of the snapshot helper + a live full-horizon
    leanlink loss run asserting endSnapshot present, scholarDay ==
    days, and series length == days-1 on that run). The pre-existing
    scripts/test-tributecost-a.js also stays green (regression).
(b) Byte-identical reproduction except the added snapshot:
    re-running the three loss-day pilot seeds (9911/9913/9918,
    leanlink policy, same substrate) reproduces every previously
    recorded number byte-identically EXCEPT the added endSnapshot
    field — checked by a field-by-field deep comparison of the new
    per-seed files against the committed tributecost corpus files,
    ignoring only the new top-level `endSnapshot` key. Any other
    moved number is NO-GO.
(c) Bar 2 passes under the new wording on all 8 pilot seeds:
    for every seed, pantryDaily/popDaily/linkDays length is days
    or (village-lost and days-1), teleDeathCount == deathLogCount,
    aggregate deaths sum == deathLogCount, all pantry values finite
    and non-negative, and endSnapshot present with scholarDay ==
    days.

A miss on any leg is NO-GO. No re-scoring mid-run; doubts go under
"metric review" in the evidence file. "Same substrate" in (b) means
the same sweep driver invocation, policy, seeds, and horizon as the
tributecost pilot; if the current master has moved game/policy code
since that corpus was produced, any resulting divergence is
reported as a (b) miss with the divergence attributed as far as
the evidence allows, not explained away.

## Wall numbers (every band)

Report for the pilot band: national / table / wins, wave 1–5 reach,
median + max survival, village-lost count, death-cause shares,
and the bar-2 table (series lengths vs days, endSnapshot day).

## Sense-testing (SENSE-TESTING LAW, brief — instrument arm)

This arm is primarily an instrument fix; the sense check is brief:
read the endSnapshot values on the three loss-day seeds and judge
whether the captured final state is coherent with the recorded
decline (pantry at/near zero on a collapse, pop matching the last
death-log state). Transcripts are read only if a re-run surfaces a
sense issue.

## Metric review (pre-filled, to be completed at run end)

- The endSnapshot is a post-run read, not a post-daily snapshot:
  on survived runs it duplicates the last post-daily's day (with
  post-loop state), and on loss runs it supplies the loss day's
  state the series lacks. It must not be counted as a series entry
  when judging series completeness — the reworded bar keeps the
  series count and the end snapshot as separate checks.
- The byte-identical check in (b) compares whole row objects
  field-by-field; the aggregate (OUT) file is not part of (b)
  because it embeds the new field in its runs array by construction.
- If (b) fails only because game/policy code moved since the
  tributecost corpus, the fix itself may still be sound — but
  under §14 that is a (b) miss for THIS run, and the next run's
  prereg must re-baseline (b) against a corpus produced on the
  current substrate rather than softening this run's verdict.

## Outputs

- scripts/sweep-tributecost-a.js (endSnapshot only)
- scripts/test-recorderfix-a.js (proof, see (a))
- evidence/2026-10-30/sim-recorderfix-a-prereg.md (this file)
- evidence/2026-10-30/sim-recorderfix-a-corpus-leanlink/ (8 new
  per-seed files) + sim-recorderfix-a-leanlink.json +
  sim-recorderfix-a-leanlink.log
- evidence/2026-10-30/sim-recorderfix-a.md (final evidence
  narrative + metric review section)
