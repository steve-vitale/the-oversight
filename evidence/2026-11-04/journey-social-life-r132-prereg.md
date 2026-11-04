# Journey social life r132 — PRE-REGISTRATION (Lane B, 2026-11-04)

Leg 5 (social life). Driver: scripts/journey-social-life-r132-20261104.js
= r125 driver verbatim (arming-motive + spring-trace + expired-plot
instruments, monotonic timer), fresh seeds 41601–41604, DAYCAP 140,
narration on. Base: master 570daa9c5 (post exphurt landing).
Fixture: scripts/test-journey-social-r132-escaped-expired.js
(escaped-spring surfacing + expired-plot trace, run BEFORE the panel
so the panel cannot re-score the fixture).

## Leg question
r125 left two dark-channel kinds unmeasured: escaped springs (0 in
panel, 55% roll each) and expired plots (0 in panel, 5-day expiry vs
≤1-day springing). r132 measures BOTH directly with a targeted
fixture, and runs a fresh wild panel for continuity (arming motive,
invite refusal, sense transcript, survival signal).

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive: REPORT arming-time motive for every plot.
  GO if ≥1 plot arms grievance-linked (grievanceTargetToLeader > 0
  at arming, or an accomplice motive with grievance) OR ≥1
  grievance-holder later leads a plot. NO-GO if every plot arms
  with grievance links 0 and reasons ambition-only or empty.
  Drought read: any plot arming after d30 breaks the d9–d19
  drought bound; none after d30 confirms it again.
- M2c escaped-spring trace (FIXTURE, binding): GO if an escaped
  spring's case reaches the player — caseDiscoveryTick on/after
  playerHeardDay sets knownToPlayer, playerRole 'juror', emits
  the 'Word reaches you / stands accused' line, and writes the
  journal note. NO-GO if the case never surfaces (no line, no
  journal, still bystander) after the heard day passes.
- M2x expired-plot trace (FIXTURE, report + judgment rule):
  REPORT every trace after expiry — say lines, gossip, grievance,
  journal, case naming the pair, and whether any code reads the
  expired flag. Judgment rule (fixed now, not after seeing the
  result): if the fixture shows 0 traces AND no player-visible
  state contradicts expiry (pending lure cleared, no case/gossip
  references the plot, the single-plot slot frees), then expiry
  silence is COHERENT — no event happened, and fog-of-war forbids
  leaking a secret the player never earned — and M2x closes as
  measured-silent, with NO surfacing line landed on speculation.
  If instead the fixture finds a contradiction (stale pending
  lure, a dangling reference, a blocked slot), that contradiction
  is the blank: fix it with its own proof test.
- M3 invite refusal, wrapper only: REPORT wrapper party/lure
  accept/decline counts for continuity. No threshold.
- M4 sense: GO if ≥1 full transcript read (friendship or
  ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Death-cluster census reported as recorded;
  cause attribution beyond the recorded cause is NOT claimed.

## What would count as interesting
- An escaped spring surfacing WITHOUT a moot (gossip/journal only)
  — or failing to surface (overturns the case-channel story).
- An expired plot leaving any trace (unexpected — code says none).
- A plot arming after d30 (drought broken).
- A second d100+ village (M5 threshold met), or a new death shape.

## Out of scope this run (held, not killed)
- No src/js change unless a finding names a concrete
  inconsistency with its own proof test; gating/threshold retunes
  are frozen and Steve-call. An expired-plot surfacing line is
  NOT pre-authorized: per the M2x judgment rule it lands only if
  the fixture proves a contradiction, never as decoration.
- No survival bisect (separate larger job; this panel adds one
  more matched point on current master).
- No live-build screenshot pass: this run touches no UI and no
  dialogue text; transcripts are re-read the r112/r113/r120/r125
  way.
