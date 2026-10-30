# Journey social r75 — PREREGISTRATION (lane B, 2026-10-30)

Leg 5 (social life). r74's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) target-aware walk — BFS steps only
onto tiles travelTo would accept from the step origin (orthogonal always;
diagonal only onto a revealed tile, and never past a guarded orthogonal
intermediate), same fix for hopHome; (2) dawn step-first retry — on a
clean-case no-micro-pos dawn block, one micro-step to trigger
ensureVillagerPositions, walk adjacent if a position appears, retry the
start inside dayPart 0; (3) position-history snapshots labelled
snapshot-relative, plus a midday snapshot after the day's play, so a
partner who gains a position mid-day stops reading as never-before;
(4) catch a genuine post-ending start; (5) moots stay a watch item.

## What changes in r75 (driver policy only, ZERO src/js)

- Wedge fork scripts/journey-social-r75-outing-wedge.js: (a) walkToNode
  rewritten target-aware (see above) with a refused-step record
  (refusedAt + blockage) when a planned step is refused on execution;
  (b) hopHome rewritten on the same walk (walkToNode to home, 40 steps)
  instead of best-distance travelTargets hops, so a d=2-3 jump's
  intermediate blockage can no longer strand the player; no-home
  entries carry the walk detail (pathFound, steps, refusedAt);
  (c) startWedge dawn step-first retry (clean case only: player at
  home node, partner node at home, door sides match, adjFail
  'no-micro-pos'): one adjacent micro-step, then walk to an
  anchor-adjacent cell if a position appeared, then a status re-read
  and start attempt inside dayPart 0; every attempt logs
  'start-step-retry' (stepOk, stepAssigned, retryStarted, dayPart
  after, final status); a successful retry also logs a 'start' entry
  with retryFromStep=true; combat after the step aborts the retry
  honestly; (d) recordPosHistory gains a phase ('dawn' default,
  'midday'): dawn history stays in posHistory (r74-compatible),
  midday history lands in posHistoryMidday with firstDay/lastDay.
- Driver fork scripts/journey-social-r75-20261030.js: r74 verbatim
  except the r75 wedge, fresh seeds, and funnel additions
  (stepRetries, retryAssigned, retryStarts, posHistoryMidday output,
  post-ending starts are analyzer-side from outingLog + favorAccepts).
  The driver's daily() calls recordPosHistory 'midday' after
  socialConvo, so the midday snapshot is after the day's play.
- Analyzer fork scripts/analyze-journey-social-r75-outing-20261030.js:
  r74 verbatim plus walk/hopHome/retry/post-ending/midday sections.

## Run shape (r74 verbatim otherwise)

Fresh seeds 6501-6504, smoke 6505 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Base master
bec2c000b (hatchequip evidence merge; zero social src/js delta vs
r74's base for this leg's systems).

## Bindings (a miss is NO-GO, never re-scored)

- B1 (target-aware walk): 100% of forage-travel-blocked entries carry
  walkAttempted=true, pathFound, and a blockage read; every walk
  refusal names its refused step (no silent walk failure). Walked
  entries are reported, not thresholded: walked>0 shows the gate
  dissolving; walked=0 with every refusal naming a real blockage
  shows a real game wall, not an instrument gap.
- B2 (hopHome): 100% of forage-no-home and deliver-no-home entries
  carry walk detail (pathFound, steps, refusedAt when refused); a
  bare no-home entry is a binding miss.
- B3 (dawn step-first): 100% of clean-case no-micro-pos dawn blocks
  carry a start-step-retry entry. stepAssigned rate and retryStarted
  rate are reported, not thresholded: assigned-high + started-0
  would mean the position is not the binding constraint, and that
  distinction is the finding.
- B4 (post-ending starts): the analyzer reports, per seed, every
  start entry dated after an outing-ended-stuck / outing-end-blocked
  entry (any favor), plus whether the SAME villager starts again.
  Binding: the count is reported with its day gaps; an unreported
  post-ending window (endings exist, no start window examined) is a
  miss. No claim of "gate freed" without a caught start.
- B5 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending.
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r74, zero new, adjudicated by name. Moots: watch item (0 on all
  r73+r74 seeds); any moot convened is reported, not celebrated
  without a read.

## Questions (judged by the bindings, not by hoping)

- Q1: does the target-aware walk dissolve the r74 0/35 walk class, or
  do refusals now name real walls (guarded intermediates, unrevealed
  diagonals) the game honestly keeps shut?
- Q2: does hopHome-on-a-walk end the Elena stranded-away loop, or
  does no-home persist with a named refusal?
- Q3: does the dawn step assign positions (stepAssigned rate), and do
  assigned retries actually start (retryStarted rate)?
- Q4: after an outing ends stuck or end-blocked, does a later outing
  start — same villager or another — and after how many days?
- Q5: do midday snapshots move any r74 never-before partner into
  ever-before, and on what kind of day?

## Named next (not pre-judged)

Whatever Q1-Q4 show: if the walk dissolves travel blocks, the next run
owns whether the walk belongs in the base competent policy rather
than the wedge; if stepAssigned is high but retryStarted is 0, the
next run owns the status-vs-adjacency distinction behind the start
block; if post-ending starts stay uncaught, the next run owns a
longer post-ending window (more seeds, not more days).
