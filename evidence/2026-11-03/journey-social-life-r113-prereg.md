# Journey social life r113 — PRE-REGISTRATION (Lane B, 2026-11-03)

Leg 5 (social life). Driver: scripts/journey-social-life-r113-20261103.js
= r112 driver verbatim + dark-snapshot extension (leader, accomplices,
grievanceTargetToLeader, grievanceTargetToInviter, max accomplice
grievance to target). Seeds 41301–41304, DAYCAP 140, narration on.
Base: master 4d595ebe6 (post-r112, no src/js change by r112).

## Leg question
Does the dark social channel (grievances → plots → lures) actually run
past the first two weeks, and on the CORRECT pair? r112 measured
inviter→target grievances (0 everywhere) and named the plot drought:
plots arm only d6–d19, then never again. But the code records the
victim's grievance against the plot LEADER, not the inviter face
(betrayal.js armPlot + spring line 1028: recordGrievance(target,
leader, 'ambushed', 60)). r112's M2 therefore measured the wrong pair.
r113 re-measures on victim→leader, and tracks whether any
grievance-holder later leads a plot.

Also carried from r112's metric review: M3's "44/44 accepted" was an
instrument artifact — bs.invites histories do not record declines,
while the npcInviteDecision wrapper DOES (party declines 3/1/6/1 in
r112). r113 reports wrapper party accept/decline as the corrected
refusal read.

## Pre-registered verdicts (BINDING, §14)
- M1 dark motive, corrected pair: GO if ≥1 plot in the panel carries
  grievanceTargetToLeader > 0 at/before arming, OR ≥1 grievance-holder
  later leads a plot (grievance day < plot day). NO-GO if plots still
  arm with zero grievance links on the corrected pair, or no plot arms
  after d19 again (drought persists on the right measurement).
- M2 invite refusal, corrected instrument: REPORT wrapper party
  accept/decline counts. Refusal proven if ≥1 party decline is
  recorded on the fresh panel (r112 already showed declines; this
  confirms the corrected instrument, it does not re-discover it).
- M3 accomplice-gate fixture: scripts/test-accomplice-gate-r113.js
  stages a warm village (trust 60, same-group, motive 0) and a cool
  village (trust 20) through the REAL Game.recruitAccomplices and
  asserts the gate outcome. PASS = warm mates score exactly 18 and
  are excluded (strict >18), cool mates recruit, and a 60-severity
  grievance breaks the warm block (score 42). A fixture PASS proves
  the drought mechanism at unit level; a FAIL overturns r112's
  formula reading and must be reported as such.
- M4 sense: GO if ≥1 full transcript read (friendship or
  ambush-recall) passes the bar: NPC wants something real, options
  engage or deflect it, ending resolves/plants/owes. Otherwise NO-GO
  with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else the dark-channel
  verdicts are within-window only (as in r112) and must be reported
  that way. Death-cluster census (cause + day per fallen villager,
  from samples.deaths) sharpens r112's "wild cluster" shape; cause
  attribution beyond the recorded cause is NOT claimed.

## What would count as interesting
- A grievance-holder leading a later plot (revenge arc actually firing).
- A plot arming after d30 on any seed (drought broken by warmth + motive).
- Villages living past d100 again (survival signal moving the other way).
- Party declines at scale (villagers refusing often, not rarely).

## Out of scope this run (held, not killed)
- No src/js change: the accomplice threshold and the leader/inviter
  split are Steve-call design/gating questions under the gating
  freeze. r113 proves the mechanism; it does not retune it.
- No survival bisect: the 19-commit post-ship bisect r112 called for
  is a separate, larger job; r113 adds one more matched panel point
  (fresh seeds, same driver family) to that signal instead.
- No live-build screenshot pass: this run touches no UI and no
  dialogue text; the conversation bar was last verified on r112's
  transcripts, and r113 re-reads transcripts in the same way.
