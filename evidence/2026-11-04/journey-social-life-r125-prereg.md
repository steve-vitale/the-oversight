# Journey social life r125 — PRE-REGISTRATION (Lane B, 2026-11-04)

Leg 5 (social life). Driver: scripts/journey-social-life-r125-20261104.js
= r120 driver verbatim + r120 metric-review fixes + one new instrument:
(a) monotonic timer: `process.hrtime.bigint()` elapsed replaces
`Date.now()` (harness freezes Date; r120's `ms` field was nonsense).
(b) ambushLines filter extended with 'stands accused' and
'Word reaches you' (r120's filter missed the discovery line).
(c) darkSnap cases now carry `knownToPlayer` (M2-corrected read).
(d) NEW expired-plot instrument: npcPlotTick wrapped (read-only
before/after diff) to record every plot that flips to expired, with
leader/target/inviter/armed day — the trace check for the invisible
kind r120 documented.
Seeds 41501–41504 (fresh), DAYCAP 140, narration on.
Base: master f01f7f026 (endgame r124 tip; post-flee-repair, post
win-plan/table/agency landings).

## Leg question
On the CORRECTED measurement, do escaped springs surface to the
player (r120 overturned r113's "no trace" claim via the case
channel — r125 re-tests that overturn on fresh seeds), and does
the OTHER invisible kind — plots that expire unsprung — leave any
trace at all? r120 found expired plots traceless by construction
(npcPlotTick sets expired silently: no line, no gossip, no
grievance). r125 counts them and checks for any naming line after
expiry before proposing anything.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive: REPORT arming-time motive for every plot
  (score, reasons, grievance links both ways, accomplice motives).
  GO if ≥1 plot arms with a grievance link (grievanceTargetToLeader
  > 0 at arming, or an accomplice motive with grievance) OR ≥1
  grievance-holder later leads a plot. NO-GO if every plot arms
  with grievance links 0 and reasons ambition-only or empty.
  Drought read: any plot arming after d30 breaks the d9–d19 drought
  bound r113/r120 set; none after d30 confirms it again.
- M2c escaped-spring trace (CORRECTED per r120 metric review):
  GO if ≥1 escaped spring's case reaches the player — any snapshot
  showing knownToPlayer true or playerRole other than 'bystander'
  (juror seat, verdict, or heard line). NO-GO if escaped springs
  produce cases that never reach knownToPlayer/juror before the
  village ends. The old "still open at end" clause is retired: an
  adjudicated case with a player role counts as surfaced.
- M2x expired-plot trace (NEW, report-only): REPORT expired count
  and lines naming the pair after expiry. No threshold — this
  metric is exploratory; a 0-line result documents the blank and
  any surfacing proposal goes to Steve as a design call (gating
  stays frozen; a surfacing line is game text, not a retune, but
  it is NOT pre-authorized by this run).
- M3 invite refusal, wrapper only: REPORT wrapper party/lure
  accept/decline counts for continuity. No threshold (closed
  metric, third panel running).
- M4 sense: GO if ≥1 full transcript read (friendship or
  ambush-recall) passes the bar: NPC wants something real, options
  engage or deflect it, ending resolves/plants/owes. Otherwise
  NO-GO with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only (as in r112/r113/
  r120) and must be reported that way. Death-cluster census
  reported as recorded; cause attribution beyond the recorded
  cause is NOT claimed.

## What would count as interesting
- An escaped spring surfacing WITHOUT a moot (gossip/journal only)
  — or failing to surface on fresh seeds (overturns r120's overturn).
- An expired plot leaving any trace (unexpected — code says none).
- A plot arming after d30 (drought broken).
- Villages living past d100 again (survival signal moving), or a
  new death shape replacing r120's attrition mix.

## Out of scope this run (held, not killed)
- No src/js change unless a finding names a surfacing-only fix
  with its own proof test; gating/threshold retunes are frozen
  and Steve-call. Expired-plot surfacing, if proposed, is
  documented for Steve, not landed silently.
- No survival bisect (separate larger job; this panel adds one
  more matched point on current master).
- No live-build screenshot pass: this run touches no UI and no
  dialogue text; transcripts are re-read the r112/r113/r120 way.
