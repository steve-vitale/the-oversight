# sim-answermail-a — prereg amendment 5 (confirm analyzer fix, second artifact)

Committed BEFORE the confirm is judged (the v3 re-run legs have run
as data collection; the trustgrowth summaries have been computed for
inspection, the confirm verdict analyzer has NOT run, no confirm
verdict has been drawn). Amends
evidence/2026-11-10/sim-answermail-a-prereg-amendment-4.md.

## What the v3 re-run showed

The amendment-4 re-run reproduced the discarded computation's
trajectories exactly on all 32 legs (days, standings, wave unlocks,
end reasons identical — determinism confirmed), and the v3
instrument cleared 5 of the 6 cap-phantom downs. One residue
remains: **1 unattributed down on the armed leg** (seed 120104,
day 29: snapshot delta +1, event sum +2). The primary (13
seasoned), cost bar, and all other fidelity gates are unaffected;
the run is INVALID only on this single residue — so the residue is
diagnosed here, not judged around.

## Root cause: formation-day twin misattribution (analyzer, not instrument)

The raw per-seed data proves the +1 is one real move counted twice,
not a game effect:

- Seed 120104, formation day 28: three `_trustGain` calls fire —
  accord +10 (seq 1), tend +8 (seq 2), tribute +1 (seq 4). The
  link's first snapshot (seq 2, trust 48) already carries the accord
  and tend: the property setter was installed on the link only at
  that snapshot, so the accord/tend calls have NO setter twin
  (the known formation-day gap). The tribute call, later the same
  day, DOES have a setter twin (setter seq 3: trust 48 -> 49).
- `unifyEvents` (trustgrowth-analyze-20261109.js) pairs wraps to
  setter twins by (link, day) COUNT, consuming twins in ascending
  seq order. The single twin is consumed by the FIRST wrap (the
  accord, seq 1 — which needs no twin; it lives before the first
  snapshot and never enters a reconciled interval), and the tribute
  wrap (seq 4 — the one that HAS a twin) is kept. The d29 interval
  (seq 2, seq 4] then holds both the setter +1 and the wrap +1
  for one +1 move: event sum +2 against snapshot delta +1.
- A scan of all 48 legs (pilot 16 + confirm 32) shows 120104 d28
  is the ONLY (link, day) with live wraps > setter twins > 0. Every
  other formation day has wraps with 0 twins (pure gap cover, kept
  correctly); every other multi-call day has wraps == twins
  (pairing order-insensitive). The defect bites only when a
  formation day mixes pre-setter calls with a post-setter call.

## What changes

- **Analyzer fix** (`scripts/trustgrowth-analyze-20261109.js`,
  `unifyEvents`): twins are consumed by wraps in DESCENDING seq
  order within each (link, day) group. The invariant that makes
  this correct: the setter is installed once per link and stays
  installed, so within one day all twinless wraps precede all
  twinned calls — the latest wraps are the twinned ones. On
  120104 d28 the twin is now consumed by the tribute wrap (seq 4)
  and the accord/tend wraps (seq 1, 2) are kept as gap cover.
  Proof: `scripts/test-answermail-a.js` gains a regression check
  (synthetic 120104-shaped input to `unifyEvents`: 2 twinless
  wraps + 1 setter+wrap pair -> unified log holds the setter and
  the 2 gap wraps, the tribute wrap dropped; plus a normal-day
  control where both wraps drop). Before/after verification:
  the analyzer is re-run on the pilot legs and both confirm legs
  and the band summaries are diffed — pilot base/armed and confirm
  base must be byte-identical, and the ONLY permitted changes on
  confirm armed are the 120104 lines: d29 reconciles (evSum 2->1),
  reconciledDays 393->394, unattributedDown 1->0, and the
  attribution correction the fix entails (accord-gift +10 now
  counted, tribute-weekly -1 — the phantom wrap removed); all
  wall numbers unchanged. (Caveat found while re-running: the
  analyzer CLI's file filter also matches its own summary output,
  so a re-run in a directory that already holds a summary
  self-includes it as a degenerate extra seed — the summaries
  must be deleted before re-running, then regenerated fresh.)
- **No sim re-run.** The per-seed data is correct; only the
  analysis double-counted. The v3 legs stand as run.
- **Re-judgment:** the trustgrowth summaries and the verdict
  analyzer are re-run after the fix, and the confirm is judged
  against the SAME bars (primary >= 10/16, cost bar, fidelity
  gates as amended by amendments 2 and 3). Nothing else changes.

## Related note (instrument, NOT fixed by this arm)

The formation-day gap itself — `_trustGain` calls before the
link's first snapshot have no setter twin — is still covered only
by the wrap, as disclosed in trustgrowth-b amendment 1. The
pairing fix makes the cover correct; installing the setter at
formation time instead of first snapshot remains a future
instrument improvement.
