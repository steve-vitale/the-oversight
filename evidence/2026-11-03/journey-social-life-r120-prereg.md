# Journey social life r120 — PRE-REGISTRATION (Lane B, 2026-11-03)

Leg 5 (social life). Driver: scripts/journey-social-life-r120-20261103.js
= r113 driver verbatim + two driver-side, read-only instruments:
(a) armPlot wrapper: at the moment a plot arms, record
motiveBetween(leader, target) score + reasons, grievanceBetween both
directions, each accomplice's motiveBetween(accomplice, target), and
trust of leader/accomplices — the arming-time motive read r113's
metric review prescribed, replacing grievance-day reconstruction.
(b) simNpcAmbush wrapper: record every NPC-NPC spring (plotId,
leader, target, outcome, caseId) so escaped springs can be traced to
their case and its playerHeardDay.
darkSnap cases are now a detail list (id, plotId, charge, day,
target, accused, status, playerHeardDay), not a count.
Seeds 41401–41404 (fresh), DAYCAP 140, narration on.
Base: master 172f01311 (includes the flee-repair landing, which may
move the survival signal — the panel is also a fresh post-flee-repair
survival point).

## Leg question
On the CORRECT measurement, what actually arms a plot — grievance,
ambition, or something else — and does an escaped spring (the
commonest NPC-NPC outcome, 55%) leave a trace the player can ever
follow up? r113 proved plots arm early and revenge fires, but its
motive read was reconstructed from grievance days and contaminated
by post-arm grievances and conflict tension. r120 measures motive
AT ARMING. r113 also claimed escaped springs "leave no trace a
player can follow up" — but simNpcAmbush opens a case for every
spring including escaped ones, with a playerHeardDay 1–2 days later.
r120 tests whether that case ever reaches the player (gossip window
passed, case still open at end, any ambush/gossip line naming it).

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive: REPORT the arming-time motive for every plot:
  score, reasons, grievanceTargetToLeader, grievanceLeaderToTarget,
  accomplice motives. GO (motive story holds) if ≥1 plot arms with a
  grievance-linked motive (grievanceTargetToLeader > 0 at arming, or
  an accomplice motive with grievance) OR ≥1 grievance-holder later
  leads a plot. NO-GO (plots arm on ambition/cool air) if every plot
  arms with grievance links 0 and reasons ambition-only or empty.
  Drought read: any plot arming after d30 breaks the d9 drought
  bound r113 set; none after d30 confirms it on the new instrument.
- M2 escaped-spring trace: GO (trace exists) if ≥1 escaped spring's
  case is still open at end AND its playerHeardDay has passed AND at
  least one ambush/gossip line in the run's captured stream names
  that spring's people — i.e. the player could have heard. NO-GO
  (invisible in practice) if escaped springs produce cases whose
  heard day never arrives in play (village dead first), or cases
  that vanish/close unheard, or no captured line ever names them.
  A NO-GO names the blank to fill (case surfacing), it does not by
  itself authorize a gate change.
- M3 invite refusal, wrapper only: REPORT wrapper party/lure
  accept/decline counts (bs.invites histories are NOT refusal
  evidence, r112/r113). No threshold — this metric is closed; the
  counts are carried for continuity only.
- M4 sense: GO if ≥1 full transcript read (friendship or
  ambush-recall) passes the bar: NPC wants something real, options
  engage or deflect it, ending resolves/plants/owes. Otherwise
  NO-GO with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only (as in r112/r113)
  and must be reported that way. Death-cluster census (cause +
  day per fallen villager) is reported as recorded; cause
  attribution beyond the recorded cause is NOT claimed.

## What would count as interesting
- A plot arming on a grievance motive at arming time (first clean
  proof the grievance→plot link exists, not just revenge echoes).
- A plot arming after d30 (drought broken on the new instrument).
- An escaped spring whose case the player actually hears about
  (overturns r113's "no trace" claim) — or proof it never lands.
- Villages living past d100 again (survival signal moving after
  the flee-repair landing), or a new death shape replacing the
  r112/r113 "wild cluster" wipe.

## Out of scope this run (held, not killed)
- No src/js change unless M2 returns NO-GO AND the fix is a
  surfacing-only change (a case/gossip line the player can follow),
  not a gate or threshold retune — gating stays frozen, and any
  such fix gets its own proof test before landing.
- No survival bisect: the 19-commit post-ship bisect r112 called
  for is a separate, larger job; r120 adds one more matched panel
  point on current master instead.
- No live-build screenshot pass: this run touches no UI and no
  dialogue text; transcripts are re-read the r112/r113 way.
