# Journey leg: DEEPENING (days 40–80) R94 — "WHEN THE INVITATION IS TAKEN, DOES IT MAKE SENSE?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r94 plays deepening, writes 2->3
at closeout. Base: master 6a48b6d3e at worktree creation. Policy:
competent (pinned, r93 driver lineage + r94 betrayal-branch sitting
instrument). Seeds: fresh 93701–93704 (fresh-band check: r93 used
93601–93604, r92 93501–93504, r91 93401–93404). Horizon: DAYCAP=100,
death-aware stop. Smoke seed 93700 (outside the main band) x DAYCAP=45
proves the r94 driver (betrayal-branch picker + transcript capture)
before the main run; smoke outputs deleted after the check.

Context: r93 (same leg, same day) left two metric-review items, and this
run answers the first and fixes the second instead of re-measuring
anything else. It does NOT re-judge wave 4 (r90), the knowledge economy
(r91), beast-trick teaching (r92), or the standing/scale two-rulers
finding (r93). No game change is pre-committed: if a betrayal sitting
reads senseless, the fix (if any) is judged on its own proof test; if
sittings read coherent, the instrument result is the finding.

Item 1 — betrayal-branch coverage (r93 people check): 4 of r93's 11
sittings ended "unestablished" because the driver left immediately at
stage 0 — in each, the only offered moves were betrayal:accept /
betrayal:decline / leave / silence, and the picker never takes a
betrayal branch, so it fell through to leave. A live player could
accept or decline and proceed; the game was not shown broken, the
driver's coverage was. r94's instrument: a betrayal-branch picker.
When a sitting's offered menu contains betrayal:accept, the picker
takes betrayal:accept on even-numbered betrayal sittings and
betrayal:decline on odd-numbered ones (sitting order across the whole
panel run, accept first), then continues with the normal picker for
later turns. Non-betrayal sittings are unchanged (r93 picker,
including the 2-consecutive more/details rotation bound). The
transcript header records the betrayal mode for that sitting.

Item 2 — analyzer field mismatch (r93 metric review, CORRECTED on
re-read): r93's note said the driver outputs markerCounts instead of
knowCounts. Re-reading the r93 driver before this run shows it outputs
BOTH knowCounts (experiment/traderDeep/moot over captured text) and
markerCounts (exile/moot/theft/confrontation), and the r93 seed JSONs
carry both. The real mismatch is in the analyzer's PRINT: the r93
analyzer prints `k.knowCounts`, but the r92 summarizeSeed it calls
returns knowExperiment / knowTraderDeep / knowMoot, not a knowCounts
key — so the print was undefined while the data was fine. The r94
analyzer prints the returned fields. No metric is re-scored on this
correction; r93's moot counts (from markerCounts directly) stand.

Canon note: no dedicated betrayal-invitation section exists in
docs/CONVERSATIONS.md (searched: only the replies-ownership rule). The
governing rule is Steve's 2026-10-27 ruling — invitations, betrayal
invitations included, should sometimes be taken; villagers choose like
real people by character, not never and not always — plus the
sense-testing law (Steve 2026-10-11): a sitting must have meaning
(the NPC wants something, options engage or deflect it, endings
resolve/plant/owe), never just exchange counts.

## Leg question

In the deepening window under natural competent play, when a stage-0
betrayal invitation is actually answered instead of left: does the
sitting make sense — does the invitation resolve, plant, or owe
something legible; does the conversation continue coherently after an
accept and after a decline; and does an accept carry a visible
consequence (or an honest absence of one) rather than a silent void?
And secondarily: does taking the branch change the village's later
fortunes in any way the census can see (a plot joined, a trust move,
a death) — reported, not judged as good or bad.

## Binding metrics (NO-GO never re-scored; revisions go to metric review)

- B-SIT (primary): every sitting in the panel classified from its
  transcript: betrayal sitting (offered betrayal:accept at any turn)
  vs ordinary; for betrayal sittings, mode (accept/decline), turns
  taken after the branch, want final (id/stage/resolution), and a
  sense verdict (SENSE / SENSELESS / UNESTABLISHED) from a full read.
  Bar: at least 4 betrayal sittings read in full (2 accept, 2
  decline if the panel yields them); if the panel yields fewer than
  4 betrayal sittings, the count miss is reported as panel
  composition, not rounded up and not re-scored against ordinary
  sittings.
- B-SENSE (primary, strict): 0 SENSELESS betrayal sittings. A sitting
  is SENSELESS only on a full read: fabricated shared history, a
  verbatim repeat, a branch that voids the invitation without a line,
  or an ending that neither resolves, plants, nor owes. An engaged
  but unresolved ending (plant/owe) counts as SENSE, as in r93.
- B-AFTER (descriptive): for each accept sitting, the seed's later
  census/death/trust notes: any plot, case, trust, or death event
  naming the inviter or the scholar in the 20 days after the sitting,
  or an explicit "none visible". No causal claim is made from a
  single sitting; co-occurrence is reported as co-occurrence.
- K-CONTEXT (carried, not re-judged): lessons ok/total, moots
  (markerCounts), proposals/outcomes, standing + scale at the
  last-living snapshot, from the r94 analyzer (fixed print keys).
- M5 winnable (descriptive, by endReason): survived vs lost per seed.
- STAY-GREEN: 0 death-honesty mislabels on all seeds.
- Rotation bound (carried): max consecutive dlg:more/dlg:details
  picks <= 2 in every transcript, betrayal sittings included.

## Interesting-finding bar (pilot gate)

The pilot (smoke seed 93700 x DAYCAP=45) must prove: the betrayal
picker fires (or, if no betrayal opening occurs by day 45, the
instrument is proven by its proof test on a fixture menu instead and
the main panel is the live test); transcripts capture the offered
menu every turn including the betrayal branch; no harness crash from
the new branch. If the pilot crashes on the branch, the run stops
and the branch is fixed with a proof test before any main seed runs.
