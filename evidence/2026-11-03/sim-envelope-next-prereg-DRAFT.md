DRAFT — NOT JUDGED, NOT DEPLOYED, NOT A SUBSTITUTE FOR THE FUTURE RUN'S OWN PREREGISTRATION

# sim-envelope-next — DRAFT PREREGISTRATION FOR THE FUTURE FRESH-BAND VARIANT RUN

Status: DRAFT. This file proposes the shape of a future run; it
judges nothing, deploys nothing, and changes nothing in the
game. The future run MUST commit its own preregistration
before any screen or judged leg, and that preregistration —
not this draft — binds the future run. Anything below marked
PROPOSAL is a suggestion for that preregistration, never a
decision. Anything below marked CARRIED is carried verbatim
from evidence/2026-11-03/sim-streakfree-cost-b-prereg.md
unless the future run's own preregistration says otherwise
in writing before judging.

## Origin

This draft follows two runs. (1) sim-streakfree-cost-b (run
fleshout-loop-b-20261103T2130Z, evidence/2026-11-03/
sim-streakfree-cost-b.md): verdict INSUFFICIENT-DATA on a
tracer verification failure (seeds 83373, 83377: rows ==
gameDays == daysAlive − 1), with descriptive-only verified
legs showing the E1@0.85 tightening fixing cost (1/16
descriptive) but costing the tie leg on seed 83248 (pantry
hovering at 0.898 of peak). (2) sim-envelope-b (run
fleshout-loop-b-20261103T2330Z, evidence/2026-11-03/
sim-envelope-b.md): an OFFLINE trade table on that same
corpus, judging nothing, recommending E1@0.85 as the next
run's primary fraction and finding 0.87/0.88 dominated on
that corpus (identical collapsing days to 0.85, earlier
survivor firing). The future run judges a variant on FRESH
legs; it does not pool, re-score, or re-judge either prior
corpus.

## Requirement 1 — a fresh band, never the old corpus for judging

The future run MUST screen a fresh seed band and judge ONLY
legs from that band. It MUST NEVER reuse the 83201–83400
corpus (screen or tracer) for judging, and MUST NEVER pool
the envelope table's 28 legs — verified or unverified —
into any judged denominator. The envelope table is a
selection aid; the fresh band is the judge.

PROPOSAL (not decided): the next band is 83401–83600
inclusive (200 seeds), 30d competent, chosen because its
lower bound exceeds every consumed band's upper bound. The
binding requirement is interval-disjointness, not this
particular band: the future preregistration MUST verify its
band is disjoint from EVERY consumed sensor band listed in
the streakfree prereg (79xxx screen, 767xx confirm band,
522 pilot subset, 80001–80024, 81001–81056, 82001–82200,
the streakfree judged band 83001–83200, the resupply supply
82032/82077/82088/82120/82127/82148/82166/82177 and its
survivor sample 82001–82016) AND from 83201–83400, with no
seed added, dropped, or substituted mid-run and no
cherry-picking. If the proposed band overlaps any consumed
band, the future preregistration MUST pick a different
disjoint band before judging.

## Requirement 2 — screen AND tracer on ONE base (base-drift handling, CARRIED)

CARRIED from the streakfree-cost prereg: screen AND tracer
BOTH run on the judging base in the future run. The base is
whatever master the worktree sits on when the screen starts,
the screen corpus is generated fresh on that base, and the
tracer legs are re-runs on that SAME base. NO salvaged screen
is used in any judged denominator, NO inherited corpus
(including the adopt tracer corpus and the 83201–83400
corpus) enters any judged denominator, and NO leg is judged
on a line generated on a different base. If the base moves
mid-run (a sibling landing), the run STOPS and reports the
base move loudly rather than judging across bases; a
re-screen on the new base is a new run with a new
preregistration, not a continuation.

## Requirement 3 — the verification field MUST be settled BEFORE judging (sibling arm)

The future run MUST NOT judge any leg until its own
preregistration states, in writing, which field tracer
verification compares rows against. The question, quoted
from streakfree-cost metric review item 1, is: "the prereg
verifies rows against daysAlive, but for villages lost on
their final day the tracer records rows == gameDays ==
daysAlive − 1. The recorded evenings stop one day short of
the counted days alive — the loss day itself produces no
evening row." The next run's prereg was told to settle,
BEFORE judging, "whether verification compares rows to
daysAlive or to gameDays (or exempts the loss-day row
explicitly) — with the rationale stated, not chosen after
seeing which seeds fail."

The settling run is the sibling arm sim-verifyfield-b
(same 2330Z run, different arm). This draft does NOT assume
its outcome — no settlement is claimed here, and if that
arm has not landed a settlement when the future run starts,
the future run MUST settle the field itself in its own
preregistration, with its rationale stated, before any
judged leg. The future run ADOPTS whatever field the
settling run settles, by writing that field into its own
preregistration before judging: if the settlement is
gameDays, verification is rows == gameDays; if it is
daysAlive, verification stays rows == daysAlive; if it is
an explicit loss-day exemption, the exemption is written
out seed-by-seed in the preregistration. A seed is never
judged on a mismatched row count under the settled field,
and a verification failure unrepairable by the preregistered
re-run rule voids judging exactly as in the carried bars
below. Choosing the field AFTER seeing which seeds fail is
forbidden — that is the error this requirement exists to
prevent.

## The variant (CARRIED primary, per the envelope recommendation)

CARRIED primary variant (v**) = (e**) OR (F),
first-firing wins, EXACTLY as fixed in the
streakfree-cost prereg: (e**) is (e*) with ONE change,
the E1 envelope fraction tightened from 0.90 to 0.85
peak; (F) is carried verbatim (falls >= 3 AND pantry <=
0.80 peak, no streak condition); (c) is carried verbatim
(three consecutive falls ending at D with D−3 >= S, and
pantry(D) <= 0.90 × pantry(S)). Definitions CARRIED:
S = first evening of the current disengaged stretch;
peak(D) = max pantry over S..D in the stretch; falls(D)
= cumulative (not consecutive) falls; eligible day >= 8;
(e**) requires hungryStreak >= 1, with (E1) falls >= 2
AND pantry <= 0.85 × peak, or (E2) pantry <= 0.65 ×
peak; collapsing = village-lost WITH a starvation death
within the 30d window (a loss ON the horizon day counts);
reference day = first starvation death day; lead =
reference day − first firing day; no-fire counts as
negative infinity for lead-vs-(c) comparisons.

PROPOSAL (not decided, secondary reporting only): report
the envelope sensitivity columns (E1 at 0.87, 0.88, 0.90,
holding (F) and (c) verbatim) DESCRIPTIVELY on the fresh
band, alongside the judged 0.85 primary — same method as
scripts/analyze-envelope-b.js. These columns are never
judged, never pooled into a verdict, and never a basis for
mid-run substitution of the primary variant. Their purpose
is to test whether the envelope table's findings replicate:
the 0.87/0.88 dead zone (no collapsing gain, earlier
survivor firing) and the 0.90 two-leg gain (83248- and
83272-shaped hovers). If the future run's preregistration
does not adopt this proposal, the columns are simply not
reported; the primary verdict is unaffected.

## GO bars (CARRIED from the streakfree-cost prereg, with PROPOSAL flags)

GO requires ALL of the following, on the TRACED legs of
the fresh band (CARRIED verbatim, with (v**) as above):

- STAGE-1 GO BAR: screened collapsing seeds >= 4. Below
  that, the verdict is INSUFFICIENT-DATA and the run
  STOPS: no Stage 2, no judged legs, no fallback band,
  no top-up screen, no re-scored bar.
- STAGE-2 COUNT GATE: traced still-collapsing >= 4 AND
  traced survivors >= 12. Below either bar, the verdict
  is INSUFFICIENT-DATA — do not lower bars, do not screen
  extra seeds to fill the count, do not run an extra band.
- FIRE LEG: variant (v**) fires on ALL traced collapsing
  seeds.
- TIE LEG: lead_variant >= lead_c on ALL traced
  collapsing seeds.
- STRICT LEG: lead_variant > lead_c on >= 50% of traced
  collapsing seeds.
- LEAD-ONE LEG: lead_variant >= 1 on >= 75% of traced
  collapsing seeds.
- COST LEG: variant (v**) fires on <= 25% of traced
  survivors.
- CROSS-CHECK LEG: the arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's
  (c) first-firing on ALL tracer legs. Any mismatch =
  INSUFFICIENT-DATA (loud failure, not a re-score).
- TRACER LEG: tracer verification on every tracer leg
  under the SETTLED field from Requirement 3 (after at
  most one re-run per leg, as carried). A verification
  failure unrepairable by re-run = INSUFFICIENT-DATA.
- STILL-COLLAPSING RULE (CARRIED): a screened collapsing
  candidate whose tracer line is NOT collapsing is
  EXCLUDED by this rule and reported by seed; NEVER
  counted as a rule failure.
- SURVIVOR-DRIFT RULE (CARRIED): a sampled survivor whose
  tracer line NEWLY collapses is membership-changing
  drift: the verdict is INSUFFICIENT-DATA, with the seed
  named; it does not join the collapsing denominator
  mid-run, and no replacement survivor is sampled.
- SURVIVOR SAMPLE (CARRIED): the FIRST 16 screened
  survivors in seed order; fixed by seed order alone,
  never by firing, pantry, or any outcome of either rule.
  If the screen yields fewer than 16 survivors, the
  sample is all of them, and the count gate decides.

Verdict words (CARRIED): PILOT-GO (Stage 1 GO AND count
gate holds AND all legs hold — the shape survives a fresh
supply on the current base; it does NOT deploy (e*),
(v*), or (v**), and no deploy claim may cite the pilot
alone); PILOT-NO-GO (Stage 1 GO and count gate hold but
any judged leg fails, with the failing leg named);
INSUFFICIENT-DATA (Stage 1 screen < 4 collapsing, count
gate fails, survivor-drift membership change, cross-check
mismatch, or tracer verification failure unrepairable by
re-run — with the failure stated). No leg is re-scored,
no margin relaxed, no seed substituted, no clause
redefined mid-run.

PROPOSED CHANGES to the carried bars (all PROPOSAL, none
decided — the future run's own preregistration decides):

- P1 (verification field): write the settled field from
  Requirement 3 into the TRACER LEG above, replacing the
  daysAlive wording, with the settling run's rationale
  quoted. This is the one change this draft most strongly
  proposes, because without it the future run risks
  repeating the 2130Z void.
- P2 (envelope sensitivity reporting): add the
  descriptive 0.87/0.88/0.90 columns described above as
  secondary reporting, explicitly not judged.
- P3 (cost precision, carried from streakfree-cost metric
  review item 3): consider a larger survivor sample if
  cost precision matters more than the 16-seed convention
  — with 16 survivors one seed is 6.25 points, so the 25%
  bar (4 seeds) is coarse. Any change to the sample size
  or the cost bar MUST be fixed in the future
  preregistration before judging, and the count gate
  MUST be re-stated to match; a mid-run sample change is
  forbidden.
- P4 (knife-edge reporting, from envelope metric review
  item 2): report, for every E1 firing, the pantry/peak
  fraction at firing, so a sub-0.001-margin firing (like
  83272's 0.8496 under a 0.85 bar) is visible as fragile
  rather than read as robust support for a fraction.
  Secondary reporting only, not judged.

## Staged design (CARRIED shape)

STEP 1 — FUTURE PREREGISTRATION COMMIT (before any screen
or judged leg; includes Requirements 1–3 settled in
writing, the variant text, the GO bars, and any adopted
proposals P1–P4 stated as adopted, not as proposals).
STEP 2 — TOOLS + PROOF (new analyzer/proof files named
for the future run; pure synthetic series only, NO judged
seeds; proof green after the preregistration commit and
before any judged application; reused proof tests re-run
green on the judging base before judging).
STEP 3 — STAGE 1 SCREEN (full fresh band via the verbatim
gatecover tracer on the judging base; verify under the
settled field each line; classify every seed; apply the
Stage-1 GO bar).
STEP 4 — STAGE 2 TRACER LEGS (only if Stage 1 GO;
verbatim tracer re-runs on all screened collapsing
candidates + the first-16 survivor sample on the SAME
base; verify under the settled field each; apply the
still-collapsing rule and the survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (v**) via the
future run's analyzer, cross-check, leads, verdict judged
exactly against the future preregistration; wall numbers
from the traced legs, 30d limit stated).
STEP 6 — SENSE TEST (firing-evening transcripts, >= 3
quoted lines, plain-words judgment; framing constraint
carried: a future deploy must frame (v**) as the village
store's fall, never as personal hunger, and must SAY
something on the firing evening).
STEP 7 — EVIDENCE (evidence/<date>/sim-<future-run>.md,
with a metric review section; any revision applies to the
run AFTER that one, never to itself).

## Balanced panel (§15) — inapplicability declared (CARRIED)

No balanced-panel compare is to be fabricated, with the
same reasoning as the streakfree-cost prereg: the future
run (like this draft's predecessors) changes NO game code,
runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
Tables are reported directly in the future evidence file,
on identical seeds and identical trajectories.

## Attribution limits (CARRIED)

Evening snapshots only; would-fire overlay, not a
counterfactual (a real (v**) rule could change villager
behavior and later evenings; whether it would have saved
any village is unmeasured and is not claimed); single
policy (competent) by design; 30-day early window only;
descriptive staged measurement, NOT a causal claim; no
pooling with prior runs to strengthen a verdict.

## Deploy wording note (CARRIED, not acted on)

Any future deploy wording must be peak-anchored ("fallen
from its recent high"), never stand-down-anchored. This
draft does NOT deploy (e*), (v*), or (v**), writes no
deploy copy, and no deploy claim may cite the envelope
table or this draft.

## Metric review (for the future run's preregistration to complete)

(To be completed in the future evidence file after
judging. Doubts about the future header go there, and any
revision applies to the run AFTER that one, never to
itself.)
