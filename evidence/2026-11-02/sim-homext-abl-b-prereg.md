# sim-homext-abl-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-homext-abl-b (Loop B,
food-economy tracker blank 1 from run
fleshout-loop-b-20261102T1030Z). Worktree sim-homext-abl-b,
branch sim-homext-abl-b. Coordinator task brief, 2026-11-02.
This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Predecessor (read, never checked out or merged)

Evidence evidence/2026-11-02/sim-homewardstep-rpt-b.md (Loop B
1030Z, policy scripts/policies/competent-homewardstep-b.js,
landed on master as commit 300ab0b44): PILOT GO for the FULL
guard on qualifying band 62801-62808 (30d, competent vs
competent-homewardstep-b) — 3 baseline homeward-hop pocket
episodes, 3 prevented, all no-harm bars PASS — BUT homeward
vetoes were 0 on the judged band: all 96 armed vetoes were
inherited OUTWARD vetoes, and all 3 preventions came from
outward diversion before the homeward entry step. The 1030Z
pilot proves the FULL GUARD, not the homeward extension.
The unjudged 61807 diagnostic (2 homeward vetoes, episode
1 -> 0) remains a follow-up blank and is NOT re-judged here.

## Canon note

docs/CANON.md read first; docs/MAP.md §6 covers the way home
as a concept (travel through the same travelTo pipeline).
No canon doc covers the pocket guard itself: it is a
policy-side sim instrument (a competent variant), not a
game system, so there is no canon to invent from — the
guard's E(D) model is inherited verbatim from the
predecessor, and this run changes only which hops it may
veto (see below).

## Question

On the SAME band 62801-62808, does the homeward extension
add any pocket prevention over the outward-only guard — or
is the outward guard the whole working part?

## The ablation (decided up front)

A NEW policy file
scripts/policies/competent-homewardstep-outwardonly-b.js: the
full guard's code with ONE change — a homeward hop is never
vetoed (it is still evaluated and logged, exactly as the
shadow mode logs, but always passes through to the real
travelTo). Outward hops are evaluated and vetoed exactly
as the full guard vetoes them (same E(D), same credit,
same veto memory for outward destinations). Zero src/js
changes, zero competent.js edits, zero policy-default
flips. The panel registry gains one additive line for the
new policy (same pattern as the predecessor's line, zero
behavior change to existing entries).

The driver scripts/homext-abl-b-driver.js is the rpt-b
driver with the POLICY set extended to the third policy
(baseline 'competent' still runs under the SHADOW guard,
as in the rpt run, so its trajectories are provably
identical to pure competent). The analyzer
scripts/analyze-homext-abl-b.js judges three legs on
identical seeds.

NO BAND SEARCH (decided up front): the band is fixed by
the tracker blank. Screening a different band to chase a
GO is forbidden in this run. If the extension's own
vetoes are 0 and it prevents 0 on this band, the verdict
is NO-GO for the extension (DIAG: the outward guard is
the working part) — reported honestly, not re-scored.

## Judged legs (all fresh, identical seeds, same driver)

Substrate (identical to the 1030Z pilot): competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
and the packcomp * =1 flags must NOT be 1. Death-aware
horizon: 30 loop-days max; dead villages stop simulating;
no fixed-200d horizon. Horizon reason: pockets are an
early far-travel phenomenon (observed days 4-22 in
predecessor evidence); a 30d window contains them while a
longer window adds pre-seat noise, and the 30d pre-seat
profile (national / table / wins 0) is expected, not a
regression. Policies: baseline 'competent' (shadow),
'competent-homewardstep-outwardonly-b' (outward-only),
'competent-homewardstep-b' (full). Seeds 62801-62808, 8
seeds, one leg per policy. No confirm spend in this run:
a pilot verdict goes to the coordinator for a confirm
decision, it is not spent here.

Definitions (inherited unchanged from the rpt-b prereg):
- Away day-end: post-daily snapshot position != haven tile.
- Failed-trip day: >= 1 forage attempt, 0 successes.
- Mean daily haul: band mean of seed mean-daily forage
  kcal (roadguard valuation, as in the rpt-b analyzer).
- Pocket-entry stranding episode: a maximal run of
  consecutive away day-ends containing >= 1 day-end whose
  live dayEndReturnSim E(position) FAILS, AND (the run
  lasts >= 2 day-ends OR a strand-linked player death
  follows: a player starvation/dehydration death whose
  deaths[].day maps to an away day-end that day or the
  day before).
- HOMEWARD-HOP pocket episode: a pocket-entry episode
  whose ENTRY day's shadow hop log contains a homeward hop
  (destination Manhattan distance to haven < current
  distance) landing on the entry day-end tile. Episodes
  not meeting this are counted separately and are NOT in
  the PRIMARY denominator.
- PREVENTED by a leg (conservative per-seed rule, as in
  rpt-b): a baseline homeward-hop pocket episode on a
  seed counts as PREVENTED by that leg only if that leg
  on that seed has ZERO pocket-entry episodes of any type.

PRIMARY METRIC (binding): EXTENSION-ONLY PREVENTIONS =
the count of baseline homeward-hop pocket episodes on
seeds where the FULL leg has ZERO pocket episodes of any
type AND the OUTWARD-ONLY leg has >= 1 pocket episode.
GO threshold: >= 1 extension-only prevention.
A miss is NO-GO for the extension, never re-scored
against a friendlier metric mid-run (e.g. never
re-scored as full-guard prevention, which the 1030Z
pilot already established at 3).

NO-HARM BARS (all binding, judged FULL vs OUTWARD-ONLY —
the extension's own cost, not the inherited guard's):
- B1 away day-ends: full <= outward-only (band total).
- B2 new-or-worsened: ZERO — no full seed with away
  day-ends >= 10 AND >= outward-only + 10, and no
  strand-linked player death on a full seed without an
  outward-only counterpart episode on that seed.
- B4 failed-trip share: full <= outward-only.
- B5 per-seed haul floor: EVERY seed's full mean daily
  haul >= 1.00x its own outward-only haul (worst seed
  decides; a 0/0 seed is null and excluded, as in rpt-b).
  This floor is stricter than rpt-b's 0.50x-vs-baseline
  floor on purpose: it is the direct descendant of the
  62003 B5 failure (a pooled pass hiding a single-seed
  collapse), and full-vs-outward-only is the comparison
  where a homeward-veto haul cost would actually show.
  No pooled B5 bar is judged here: the pooled
  full-vs-baseline haul comparison is the 1030Z pilot's
  bar, already passed at 1.28x, and re-judging it would
  double-count the inherited guard.
- B6 survival: median survival full >= outward-only;
  player starvation-death seeds full <= outward-only + 2.

VETO-CREATED-POCKET BAR (binding): ZERO full seeds with
>= 1 pocket-entry episode where the outward-only leg on
that seed has none (a pocket the homeward vetoes
themselves created).

REPORTED (not bars): full homeward vetoes vs outward
vetoes; outward-only homeward vetoes (must be 0 — a
proof property, checked on the judged band); spoken vs
silent vetoes; lateral passes; credit uses; false opens
(full away day-ends with zero vetoes that day and a
failing day-end sim); beyond-ungenerated touches;
trajectory identity between the full and outward-only
legs (if full homeward vetoes = 0, the two legs' veto
decisions coincide on every hop, so their trajectories
should be identical — any divergence is reported as a
finding, since it would mean the homeward evaluation
itself perturbs trajectories); per-seed table for all
three legs.

BALANCED PANEL (§15): run scripts/balance-panel.js on the
judged seeds/policies (single combined campaign, all
three policies, same seeds/days) as CONTEXT, never
verdict — the panel runs its own substrate and its
definitions differ from the driver's judged bars. Attach
the compare summary to the evidence file. If a
multi-policy compare returns INVALID by design (as the
rpt-b split-panel compare did), record it as-is; do not
override it.

SENSE-TESTING LAW: read the sayLines transcripts for
veto lines on both armed legs and for the stranded
villages' own words; judge meaning and coherence, never
just counts. The evidence file carries a village
assessment in plain words, plus wall numbers for the
judged band (national / table / wins, wave unlocks,
median survival) with the 30d pre-seat profile stated
as expected, not a regression.

METRIC REVIEW (in the evidence file, never a re-score):
metric doubts go here and propose revisions for the NEXT
run only.

## Census (proof, not judged evidence)

BEFORE the judged legs are judged, the proof test
scripts/test-homext-abl-b.js must show, on synthetic
fake-Game cases plus the live-engine hop/walk battery
pattern ported from the predecessor: (a) the outward-only
variant NEVER vetoes a homeward hop, even into a
no-escape destination (the scholar proceeds; orig
travelTo called); (b) on identical fake states, the
outward-only variant's OUTWARD veto decisions match the
full guard's exactly (same veto/pass on every outward
hop in the battery); (c) veto memory for outward
destinations works (first says, second silent, both
vetoed); (d) on the judged band, the outward-only leg
fires ZERO homeward vetoes. Target: 100% on the above.
Any disagreement is a proof failure: fix the variant, do
not judge the legs against a disagreeing variant.

## Deliverable

Evidence file evidence/2026-11-02/sim-homext-abl-b.md
(prereg header, census numbers, three-leg numbers
before/after, extension-only verdict, village assessment
in plain words, wall numbers, metric review section),
plus the outward-only policy + driver + analyzer + proof
test files, all committed on branch sim-homext-abl-b.
Report to coordinator: GO / NO-GO / DIAG verdict with
judged numbers, commit hashes, and proof-test result.

## Explicitly excluded

No re-screening, no different band, no chasing the
unjudged 61807 diagnostic, no pairing with any other
arm's re-confirm.
