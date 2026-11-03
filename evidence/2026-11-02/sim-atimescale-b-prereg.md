# sim-atimescale-b — PREREG (committed BEFORE any judged read or spot-check leg)

Run: oversight-flesh-out-loop-b, arm sim-atimescale-b
(coordinator brief 2026-11-02, run fleshout-loop-b-20261102T2030Z,
axis food-economy). Worktree sim-atimescale-b, branch sim-atimescale-b.
This worker does NOT push, bump, verify live, merge, or rebase;
the coordinator lands the branch. Status to coordinator:
committed in worktree, pending coordinator merge.

## Predecessors (read, never re-judged)

- evidence/2026-11-02/sim-destfirst-b.md + sim-destfirst-b-prereg.md
  (1730Z): DIAG-NO-BAND, stage-2 A tries 0/40 confirmed on the
  day-5 day-end alone. 14 clean-entry trips kept their lateral
  escape to day-end; 22 engine-blocked routes; 4 walk-out-complete
  trips with a walk-out hop E failure (outward prevention, not
  homeward rescue). Metric review prescribes this run: walk out
  on day 5 and check day-ends on days 5-8, day-end position ==
  destination REQUIRED (the 69716 lesson).
- evidence/2026-11-02/sim-homeward-shapes-b.md (1505Z): A/C
  episode definitions + veto E table, inherited verbatim.
- evidence/2026-11-02/sim-gatedisengconf-b.md: gatediseng cost
  PASS stands; this arm judges A construction only, not
  timeliness, not the guard.
- docs/CANON.md read first; docs/MAP.md (way home travels
  through the same travelTo pipeline). No canon doc covers the
  pocket guard itself: it is a policy-side sim instrument, not a
  game system, so there is no canon to invent from.

## Question

Does any already-tried A destination close over days 5-8 —
scholar walks out clean on day 5, camps at the destination, and
on some later day-end (6, 7, or 8) the destination's escape E
fails while day-end position == destination?

## DIAG-ONLY discipline (zero game change)

Zero src/js changes, zero edits to scripts/policies/competent.js,
zero edits to any reused script/policy, zero policy-default flips,
zero bundled fix, unless a genuinely separate instrument bug is
found and documented as its own finding. New files only:
this prereg, a multi-day confirmation analyzer
(scripts/atimescale-b-analyze.js), a proof test
(scripts/test-atimescale-b.js), the evidence file, and
per-try multi-day read files (filenames include the origin:
sim-atimescale-b-<seed>-<dest>-from-destfirst-A.jsonl — the
origin here is the destfirst stage-2 A try itself; no C-style
origin collision exists for A, and each file names its seed,
destination, and destfirst origin).

## Candidate set (NO re-screening, NO new seed band)

All 40 destfirst stage-2 A tries, exactly as archived:
evidence/2026-11-02/sim-destfirst-b-stage2-A-<seed>-<dest>.jsonl
for seeds 69701-69720, 2 tries per seed (40 files; the A set
suffered no filename overwrite — the destfirst disclosure covers
C pairs only). No silent narrowing: every try is read and
reported, including the 22 engine-blocked and the 4 walk-out-E
failures, which are structurally ineligible for a multi-day
closing (they never camp clean at the destination on day 5)
and are reported as such, not dropped.

## Procedure (fixed here, before any judged read)

1. DETERMINISM SPOT-CHECK (not judged): re-run 3 archived A
   legs with the destfirst stage-2 procedure verbatim
   (homeconstruct driver, POLICY=construct-shadow,
   CONSTRUCT_SHAPE=A, CONSTRUCT_DAY_A=5, CONSTRUCT_ROUTE_A
   rebuilt from the archived day-5 construct steps, DAYS=30,
   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0,
   no packcomp *=1 flags) and compare days 5-8 end positions
   and dayEndReturnSim.ok to the archived files. If any
   spot-check leg mismatches on those fields, STOP: the
   archive is not a faithful replay, no judged reading is
   claimed, and the mismatch is the finding. Spot-check seeds:
   69701 dest 6,2 (clean-entry), 69709 dest 5,8 (walk-out-E
   failure near-miss), 69703 dest 0,0 (clean-entry).
2. JUDGED READ (no new judged legs): the archived stage-2 legs
   already ran 30 days under the destfirst procedure, with
   competent.daily untouched on days 6-8, so their days 5-8
   records ARE the multi-day extension. Re-running all 40
   would be a deterministic replay of the same legs, not new
   evidence; the spot-check in step 1 is what licenses reading
   the archive instead. Day-end position is day.end.pos;
   day-end E is day.dayEndReturnSim.ok (with via/directOk/legs
   reported). A day-end E reading counts only when the
   day-end position is the destination.
3. For each try, the analyzer reports: walkout (day-5
   construct posAfterForced == dest), walkE (every shadow
   walk-out hop simOk, per destfirst-b-confirm.js), day-5
   end position and E, and for days 6, 7, 8 each: end
   position, E ok/via/directOk/legs, and whether the camp is
   still contiguous (every day from 5 through that day ended
   at the destination).

## Primary metric + GO threshold (binds the run, §14)

CONFIRMED multi-day A setup, defined as ALL of:
- walk-out clean: day-5 walkout true AND walkE true; AND
- day-5 end position == destination AND day-5 E true; AND
- some closing day c in {6, 7, 8} with end position ==
  destination AND day-end E false; AND
- every day from 5 through c-1 ended at the destination with
  E true (contiguous camp; a broken camp before c voids the
  setup even if a later day-end fails elsewhere — the 69716
  lesson, applied across days).
GO: >= 1 confirmed multi-day A setup among the 40 tries.
A miss (0 confirmed) is NO-GO, never re-scored mid-run
against a friendlier metric (e.g. counting a day-end failure
elsewhere, a broken-camp failure, or a walk-out-E failure as
a setup). The day of closing is reported per setup.
Secondary (reported, never promoted to the verdict): count
of clean-entry tries still camping at day 8 with E passing;
count of legs whose camp breaks before day 8 and how.

## Horizon (death-aware, never fixed 200d)

Window days 5-8 by construction. Legs that lose the village
before day 8, or whose scholar leaves the destination, are
reported with their last camp day — not silently dropped.
No leg is extended past day 8 for the verdict; day 9+ records
in the archive are context only.

## Seeds / policies

Seeds: the destfirst screen band 69701-69740, A tries only
(69701-69720, 2 per seed). Policy: construct-shadow (shadow
legs only — no armed legs, no vetoes, no episode counts in
this run). No policy-default flips anywhere.

## Balanced panel (§15)

VACUOUS, stated deliberately: this is a DIAG-ONLY
construction check on archived shadow legs, not a
before/after lever comparison — there is no baseline/arm
pair to panel, and the panel expresses the guard policies,
not the construct instrument. No compare file is fabricated.

## Sense-testing

At least one multi-day leg transcript is read for human sense:
a closing case if one exists, else the longest clean-camp
case (most contiguous camp days with E passing). Report what
the scholar and village actually do/say across days 5-8.

## Wall numbers (honestly limited)

Reported from this arm's corpus only, window-limited: the
30d construction legs are not natural play; national / table /
wins and wave reach are reported as in-window archive values
only, never as a rate claim.
