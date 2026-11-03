# sim-streakfree-cost-b — STREAK-FREE COST-LEG PREREGISTRATION (committed BEFORE any screen or judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2130Z,
axis food-economy, arm sim-streakfree-cost-b. Worktree
sim-streakfree-cost-b, branch sim-streakfree-cost-b. This arm
changes NO game code, flips NO policy default, edits NO existing
script or policy file. New files only, all named
*-streakfree-cost-b.*: this prereg, the analyzer
(scripts/analyze-streakfree-cost-b.js), the proof test
(scripts/test-streakfree-cost-b.js), the evidence file, and the
corpora (evidence/2026-11-03/screen-tmp-streakfree-cost-b/
screen.jsonl / screen.log, sim-streakfree-cost-b-tracer.jsonl /
-summary.json / -sweep.log / -detcheck.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), the streakfree analyzer
(scripts/analyze-streakfree-b.js), and
scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited. This worker does NOT push, bump versions, verify
live, or merge — the coordinator lands the branch. This run does
NOT deploy (e*), (v*), or (v**): a GO here lands a
policy/instrument file + evidence ONLY, and no deploy claim may
cite this pilot alone.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng
sensor (e*) itself — it is a policy-side sim instrument, not a
game system; no canon is invented for it. docs/PRESERVATION.md
(food ladder) is adjacent only, not the sensor. This arm invents
no game system: it measures would-fire overlays on existing
evening trajectories.

## Background (read, never re-litigated, never re-judged)

Read before judging: evidence/2026-11-03/
sim-streakfree-adopt-b.md and sim-streakfree-b-prereg.md. The
adoption run on the prior base yielded 10 screened collapsing
seeds and 16 sampled survivors, verdict INSUFFICIENT-DATA, on
two independent findings: (1) the COST leg failed, (v*) firing
on 4/15 = 26.7% of traced survivors against a <= 25% bar, with
the extra survivor firing being 83011, day 30 (the horizon's
last evening, E1 envelope, pantry 25,914 at 0.872 of its stretch
peak 29,732 — a village flush with food); and (2) survivor drift
(seed 83013, screen survivor -> tracer collapsing) plus screen
base 991609dfe vs tracer base 77ff4a807 drift. On the old
corpus the collapsing legs passed in full: fire 8/8, tie 8/8,
strict 6/8 = 75%, lead-one 7/8 = 87.5%, mean lead (v*) 3.75d vs
(c) 2.875d. The committed tracer corpus
evidence/2026-11-03/sim-streakfree-adopt-b-tracer.jsonl (26 legs)
is REFERENCE FOR VARIANT SELECTION ONLY in this run — it is
stale-base relative to current master and is never a judged
corpus, never pooled into any judged denominator.

## Step 1 — offline variant exploration (no judged legs)

On the adopt tracer corpus, firing anatomy was computed per leg
for (e*), (F), and (c) (clause, falls count, pantry/peak
fraction, firing day, lead). Still-collapsing E1 firings sit at
fractions 0.759 (83019), 0.737 (83111), 0.661 (83189) — all well
below 0.85. Traced-survivor (v*) firings: 83001 E1 day 8
(fraction 0.728), 83002 F day 8 (fraction 0.375), 83005 E2 day 24
(fraction 0.463), 83011 E1 day 30 (fraction 0.872, the
shallowest firing in the whole corpus and the only one above
0.85). Candidates tested on the old corpus:

- Tighten (F) to 0.75 peak: cost UNCHANGED (4/15 — 83002's F
  fraction is 0.375), and 83014 loses its strict day (5/8).
  Rejected: does not fix the cost leg, weakens a passing leg.
- Tighten (F) to falls >= 4: cost UNCHANGED (83002's F has 5
  falls), and 83014 loses its strict day (5/8). Rejected on
  the same grounds.
- Persistence/confirmation (fire only on the day AFTER the
  qualifying evening also qualifies): breaks 83055 — its
  qualifying evening is its first-starvation day itself, so a
  one-day confirmation delay fires AFTER starvation (lead -1,
  tie fails). It also smuggles a horizon-edge suppression in
  through the back door (a day-30 firing has no next evening
  to confirm it). Rejected: weakens a passing leg and is not
  an honest game rule.
- Tighten the E1 envelope from 0.90 to 0.85 peak: cost becomes
  3/15 = 20.0% (only 83011, the 0.872 shallow firing, drops
  out), and EVERY collapsing leg is byte-identical to (v*):
  fire 8/8, tie 8/8, strict 6/8, lead-one 7/8, mean lead 3.75d
  vs 2.875d. A tighter E1 at 0.80 gives identical old-corpus
  numbers, so 0.85 is chosen as the MINIMAL tightening that
  fixes the leg — the rule now demands a fall of at least 15%
  from the stretch peak before the envelope clause speaks, so
  a store still holding 87% of its recent high no longer
  raises a collapse warning. This is a game-meaningful rule
  (a stricter fall threshold), NOT a horizon-edge suppression:
  it is defined purely on falls and pantry fraction, applies
  on every day of the window, and kills no day-30 firing by
  virtue of its date.

EXACTLY ONE variant is carried forward, chosen here before
judging: (v**) below. The fresh pilot judges it honestly — a
NO-GO on the fresh band is a valid pilot outcome, and no
further variant may be substituted mid-run.

## The variant (v**) — EXACT text (fixed here, before judging)

Variant (v**) = (e**) OR (F), first-firing wins. (e**) is (e*)
with ONE change: the E1 envelope fraction tightened from 0.90
to 0.85. (F) is carried verbatim. Rule (c) is carried verbatim
from the streakfree prereg.

  S = first evening of the current disengaged stretch;
  peak(D) = max pantry over S..D in the stretch; falls(D) =
  count of evenings t in (S..D] with pantry(t) <
  pantry(t-1), cumulative not consecutive.
  (e**): fire at FIRST evening D in the stretch with D > S,
  D >= 8, disengaged, hungryStreak(D) >= 1, where (E1)
  falls(D) >= 2 AND pantry(D) <= 0.85*peak(D), or (E2)
  pantry(D) <= 0.65*peak(D).
  (F): fire at FIRST evening D in the stretch with D > S,
  D >= 8, disengaged, falls(D) >= 3 AND pantry(D) <=
  0.80*peak(D), with NO hungryStreak condition.
  (c): S = first evening of the current disengaged stretch;
  D > S, D >= 8, three consecutive falls ending at D with
  D-3 >= S, and pantry(D) <= 0.90*pantry(S).
  Variant first-firing: stretches are scanned in order;
  within a stretch the variant fires at the earliest of the
  (e**) firing day and the (F) firing day in that stretch;
  the first stretch with any firing wins. The variant's clause
  is reported per traced collapsing seed as E1 / E2 / F, with
  the (e**) day also reported when (F) fires earlier than
  (e**).

## Fresh band (fixed here, BEFORE any judged leg)

Seeds 83201-83400 inclusive (200 seeds), 30d competent,
screened via the verbatim gatecover tracer (screen tool,
below), one node process per seed, each line appended to
evidence/2026-11-03/screen-tmp-streakfree-cost-b/screen.jsonl,
in seed order. FRESHNESS, VERIFIED: 83201-83400 is
interval-disjoint from EVERY consumed sensor band listed in
the streakfree prereg — 79xxx screen, 767xx confirm band, 522
pilot subset, 80001-80024, 81001-81056, 82001-82200 — AND from
the streakfree judged band 83001-83200. Lower bound 83201
exceeds every consumed band's upper bound (83200); no interval
overlaps any listed band, and no seed is shared with the
resupply supply (82032, 82077, 82088, 82120, 82127, 82148,
82166, 82177) or its survivor sample (82001-82016). No seed is
added, dropped, or substituted mid-run. No cherry-picking: the
screen runs the full band, and Stage-2 tracer legs run on the
full screened candidate set plus the fixed survivor sample
defined below. Checkpoint corpora inside the worktree
(evidence/2026-11-03/screen-tmp-streakfree-cost-b/), NOT /tmp.

## BASE-DRIFT HANDLING (stated explicitly, fixed here)

Screen AND tracer BOTH run on the judging base in this run:
the base is whatever master the worktree sits on when the
screen starts, the screen corpus is generated fresh on that
base, and the tracer legs are re-runs on that SAME base. NO
salvaged screen is used in any judged denominator, NO
inherited corpus (including the adopt tracer corpus) enters
any judged denominator, and NO leg is judged on a line
generated on a different base. If the base moves mid-run (a
sibling landing), the run STOPS and reports the base move
loudly rather than judging across bases; a re-screen on the
new base would be a new run with a new prereg, not a
continuation. The adopt corpus remains reference-only for
variant selection, as stated above.

## Definitions (fixed here, BEFORE any judged leg)

- COLLAPSING DEFINITION, WINDOW-INCLUSIVE (carried verbatim
  from the streakfree prereg, unchanged): a seed is collapsing
  iff endReason is 'village-lost' AND at least one death has
  cause 'starvation', within the 30d window. A loss ON the
  horizon day (daysAlive == 30) counts. Reference day = first
  starvation death day. The cost analyzer computes collapsing
  from this judged definition (endReason + first starvation
  day from the reused analyzer's death scan) and reports any
  divergence from the reused analyzer's collapsed flag loudly;
  a divergence is a substrate finding, never a silent
  redefinition.
- Survivor = survived the full 30d (daysAlive == 30, endReason
  not 'village-lost').
- Other outcomes (lost before 30d with NO starvation death, or
  any other non-survivor end) are neither collapsing nor
  survivors: reported seed-by-seed, count toward neither
  judged denominator, and do not fill either count.
- Lead = reference day - first firing day. A collapsing seed
  with NO firing has no lead and fails outright; for
  lead-vs-(c) comparisons, no-fire counts as negative infinity
  (worse than any firing).
- Tracer/screen verification: rows == daysAlive on every leg. A
  leg failing verification is re-run once and the retry
  reported loudly; a seed is never judged on a mismatched row
  count.
- Screen-vs-tracer agreement: every tracer leg's membership
  (collapsing / survivor / other) is compared against its
  screen classification and reported per leg. Disagreements
  are handled ONLY by the still-collapsing rule and the
  survivor-drift rule below — never by re-sampling,
  substitution, or redefinition.

## Screen tool (fixed here, BEFORE any judged leg)

The screen tool is the VERBATIM gatecover tracer
(scripts/trace-gatecover-b.js), reused read-only: it runs
competent 30d and its JSON line reports endReason, daysAlive,
and the full deaths list with causes — exactly the fields the
candidate rule reads. Invocation per seed, verbatim from the
prior confirms:
POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 DAYS=30 SEEDS=<seed> node scripts/trace-gatecover-b.js
(the seven non-gate flags the tracer forbids at 1 are left
unset, which satisfies its FATAL checks). The screen corpus is
NOT the judged corpus: judged legs run on the tracer corpus
only (below). The screen rate (screened collapsing / 200) is
reported honestly alongside the verdict; it is a band
property, not a rate claim.

## STAGE 1 — screen + GO bar (fixed here)

STAGE-1 GO BAR: screened collapsing seeds >= 4. If the screen
yields < 4 collapsing seeds, the verdict is INSUFFICIENT-DATA
and the run STOPS: no Stage 2, no judged legs, no fallback
band, no top-up screen, no re-scored bar. The screen is
reported honestly in full (collapsers found with their
loss/starvation days, survivors, other outcomes,
starvation-death counts). If the screen yields >= 4 collapsing
seeds, the run proceeds to Stage 2.

## STAGE 2 — survivor sample + tracer legs (fixed here; only if Stage 1 GO)

The survivor sample is the FIRST 16 screened survivors in seed
order (the first 16 seeds in 83201-83400 order whose screen
classification is survivor). If the screen yields fewer than 16
survivors, the sample is all of them, and the Stage-2 count
gate below decides the verdict. The sample is fixed by seed
order alone — never by firing, pantry, or any outcome of
either rule. Tracer legs are VERBATIM gatecover tracer re-runs
(same invocation as the screen) on ALL screened collapsing
candidates PLUS the sampled survivors, one node process per
seed, each line appended to evidence/2026-11-03/
sim-streakfree-cost-b-tracer.jsonl. Judged legs run on the
tracer corpus only, never on screen lines.
- STILL-COLLAPSING RULE (carried verbatim): a screened
  collapsing candidate whose tracer line is NOT collapsing is
  EXCLUDED by this pre-registered rule and reported by seed
  with its tracer outcome. It is NEVER counted as a rule
  failure. The judged collapsing denominator is the
  still-collapsing (traced) count.
- SURVIVOR-DRIFT RULE (carried verbatim): a sampled survivor
  whose tracer line NEWLY collapses is membership-changing
  drift: the verdict is INSUFFICIENT-DATA, with the seed
  named. It does not join the collapsing denominator mid-run,
  and no replacement survivor is sampled.
- FULL POLICY OBJECT RULE (carried verbatim): no new probe
  driver is written; the reused tracer builds its policy as
  Object.assign({}, competent, {daily wrapper calling
  competent.daily}) and passes it to runDays, and
  sim-harness.js calls policy.setup, policy.upkeep, and
  policy.daily — the FULL policy object, never a bare {daily}.

## STAGE 2 — judged legs + GO bars (fixed here, carried VERBATIM from the streakfree prereg, with (v**) in place of (v*))

GO requires ALL of the following, on the TRACED legs:
- COUNT GATE: traced still-collapsing >= 4 AND traced
  survivors >= 12. If either count is below its bar, the
  verdict is INSUFFICIENT-DATA — do not lower bars, do not
  screen extra seeds to fill the count, do not run an extra
  band.
- FIRE LEG: variant (v**) fires on ALL traced collapsing seeds.
- TIE LEG: lead_variant >= lead_c on ALL traced collapsing
  seeds.
- STRICT LEG: lead_variant > lead_c on >= 50% of traced
  collapsing seeds.
- LEAD-ONE LEG: lead_variant >= 1 on >= 75% of traced
  collapsing seeds.
- COST LEG: variant (v**) fires on <= 25% of traced survivors.
- CROSS-CHECK LEG: this arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's (c)
  first-firing on ALL tracer legs. Any mismatch =
  INSUFFICIENT-DATA (loud failure, not a re-score). This is
  the streakfree run's two-implementation form of the
  cross-check.
- TRACER LEG: tracer verification rows == daysAlive on every
  tracer leg (after at most one re-run per leg).
Verdict words (judged exactly against this header):
- PILOT-GO: Stage 1 GO AND Stage-2 count gate holds AND all
  legs hold. The (v**) shape survives a fresh supply on the
  current base; it does NOT deploy (e*), (v*), or (v**), and no
  deploy claim may cite this pilot alone. A GO lands a
  policy/instrument file + evidence ONLY.
- PILOT-NO-GO: Stage 1 GO and count gate hold but any judged
  leg fails, with the failing leg named. The shape does not
  advance on this evidence.
- INSUFFICIENT-DATA: Stage 1 screen < 4 collapsing, Stage-2
  count gate fails, survivor-drift membership change,
  cross-check mismatch, or tracer verification failure
  unrepairable by re-run — with the failure stated. No leg is
  re-scored, no margin relaxed, no seed substituted, no clause
  redefined mid-run.
Secondary (reported, NOT judged): per-seed clause (E1/E2/F) and
firing days for both rules on traced collapsing seeds; mean
lead_variant vs mean lead_c (with the warning that means
mislead when coverage differs); traced collapsing seeds with
lead_variant == 0 (death-knell firings, named even on a GO);
(c) firing rate on traced survivors for context; the (c)-vs-
(v**) survivor overlap on the traced survivors; screen-vs-
tracer membership agreement per leg; the screen rate
(screened collapsing / 200) with the screened collapsing seeds
named even when a gate fails; determinism spot-check (3 legs
re-run verbatim, first/middle/last still-collapsing in seed
order if >= 3 exist, else first 3 tracer legs) and tracer-vs-
screen byte-equality, both reported as substrate findings,
judged legs run on the tracer lines.

## Primary metric, horizon, seeds, policies (fixed here)

PRIMARY METRIC: the COST leg jointly with all other legs — GO
requires every leg above to hold on the traced legs; the cost
leg (v** fires on <= 25% of traced survivors) is the leg this
run exists to fix, and it is judged together with fire, tie,
strict, lead-one, cross-check, and the count gates, never
alone. HORIZON: 30 days, because this is the same early window
as the streakfree and adoption runs — the window in which
collapsing villages first starve (days 18–28 on the old
corpus) and in which the sensor must warn in time; a longer
window would mix in late-game states this instrument does not
measure. SEEDS: fresh band 83201-83400 (screen), tracer legs
on screened candidates + first 16 screened survivors.
POLICIES: competent only, with COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1, verbatim tracer invocation above.
METRIC BINDING (§14): the metrics above bind this run — a
miss is NO-GO (or INSUFFICIENT-DATA where the header says so),
never re-scored against a friendlier metric mid-run. If the
metric proves wrong, it is written under "metric review" in
the evidence file and proposed for the NEXT run.

## Sense test (fixed here)

Read transcripts around variant firing evenings on traced
collapsing seeds — at least 2 collapsing firing evenings when
at least 2 traced collapsing firings exist (otherwise all
firing collapsing evenings available, with the shortfall
stated) — quote >= 3 lines, and judge in plain words whether
the warnings read as the village noticing in time, or as a
silent cliff / death-knell. A warning that lands on a silent
evening, or alongside a death, is reported as such even on a
GO. The framing constraint travels: a future deploy must frame
(v**) as the village store's fall, never as personal hunger.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any screen or judged leg).
STEP 2 — TOOLS + PROOF (new analyzer
scripts/analyze-streakfree-cost-b.js; new proof test
scripts/test-streakfree-cost-b.js; pure, synthetic series
only, NO judged seeds — synthetic seed 999102 only — run green
after the prereg commit and before any judged application; it
proves the (e**) E1@0.85 rule (including the 83011-shape
shallow-firing case as a SYNTHETIC series, not the judged
seed), the (F) clause carried verbatim, the variant
first-firing, the window-inclusive collapse derivation, the
screen classification, the still-collapsing exclusion, and the
pilot verdict logic; the reused proof tests
test-streakfree-b.js (22/22), test-gatediseng-b.js (21/21), and
test-gatediseng-confirm-b.js (11/11) are also re-run green on
current base before judging).
STEP 3 — STAGE 1 SCREEN (full 83201-83400 band fresh via the
verbatim tracer on the judging base; verify rows == daysAlive
each; classify every seed; apply the Stage-1 GO bar).
STEP 4 — STAGE 2 TRACER LEGS (only if Stage 1 GO; verbatim
tracer re-runs on all screened collapsing candidates + the
first-16 survivor sample on the SAME base; verify rows ==
daysAlive each; apply the still-collapsing rule and the
survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (v**) via cost
analyzer, cross-check, leads, verdict judged exactly against
this header; wall numbers from the traced legs, 30d limit
stated).
STEP 6 — SENSE TEST (firing-evening transcripts, >= 3 quoted
lines, plain-words judgment).
STEP 7 — EVIDENCE (evidence/2026-11-03/sim-streakfree-cost-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same
reasoning as the streakfree prereg: this arm changes NO game
code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays
on identical evening series), not panel metrics. The tables
are reported directly in the evidence file instead, on
identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins.
NO wall movement is claimed. What is reported from the traced
legs: survival (seeds survived / legs, median and max days
alive), wave reach, traced collapsing-seed count, and national
/ table / wins as NOT REACHED IN WINDOW (expected 0 —
late-game states with no fields in this window, reported as
such, not as a rate claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen from
its recent high"), never stand-down-anchored — per the
pilot's metric review, (e*) can in principle fire while pantry
is still above its stand-down level. This run does NOT deploy
(e*), (v*), or (v**) and writes no deploy copy. Any future
(v**) deploy must also frame the warning as the village
store's fall, not personal hunger. A GO here lands a
policy/instrument file + evidence ONLY, and no deploy claim
may cite this pilot alone.

## Attribution limits (stated before judging)

- Evening snapshots only: (v**) reads evening pantry/gate/
  streak values. Intraday flicker is not measured and cannot
  change a would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days are
  computed on trajectories as run. A real (v**) rule could
  change villager behavior and therefore later evenings;
  whether it would have saved any village is unmeasured and is
  not claimed.
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game legs
  unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  PILOT-GO here is shape survival on a fresh supply, not a
  deploy claim, and no pooling with prior runs is used to
  strengthen it — screened collapsing seeds here are fresh
  villages counted in this run only.

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
