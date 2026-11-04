# sim-freshband-b — FRESH-BAND RE-JUDGMENT PREREGISTRATION (committed BEFORE any screen or judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261104T0046Z,
axis food-economy, arm sim-freshband-b. Worktree sim-freshband-b,
branch sim-freshband-b. This arm changes NO game code, NO policy
defaults, NO gates/prices. It is a would-fire instrument overlay
only: it measures (v**) firing days on evening trajectories as
run. New files only, all named *-freshband-b.*: this prereg, the
analyzer (scripts/analyze-freshband-b.js), the proof test
(scripts/test-freshband-b.js), the evidence file, and the corpora
(evidence/2026-11-03/screen-tmp-freshband-b/screen.jsonl /
screen.log, sim-freshband-b-tracer.jsonl / -summary.json /
-sweep.log). The gatecover tracer (scripts/trace-gatecover-b.js),
the gatediseng analyzer (scripts/analyze-gatediseng-b.js), the
streakfree-cost analyzer (scripts/analyze-streakfree-cost-b.js),
the envelope analyzer (scripts/analyze-envelope-b.js, descriptive
columns only), and scripts/policies/competent.js are REUSED
VERBATIM, read-only, never edited. This worker does NOT push,
bump versions, verify live, or merge to master — the coordinator
lands the branch. This run does NOT deploy (e*), (v*), or (v**):
a GO here lands an instrument file + evidence ONLY, and no
deploy claim may cite this pilot alone.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng
sensor (e*) itself — it is a policy-side sim instrument, not a
game system; no canon is invented for it. docs/PRESERVATION.md
(food ladder) is adjacent only, not the sensor. This arm invents
no game system: it measures would-fire overlays on existing
evening trajectories. docs/MEASUREMENT.md sections 9-12 and
14-15 read: staged pilot gate, death-aware horizon, pre-
registration, metric binding, balanced-panel instrument rule
(see §15 declaration below).

## Background (read, never re-litigated, never re-judged)

- sim-streakfree-cost-b (run fleshout-loop-b-20261103T2130Z):
  variant (v**) on fresh band 83201-83400, verdict
  INSUFFICIENT-DATA on a tracer verification failure (seeds
  83373, 83377: rows == gameDays == daysAlive - 1 under the
  then-used rows == daysAlive field).
- sim-verifyfield-b (run fleshout-loop-b-20261103T2330Z,
  sibling arm): settled the verification field (see below)
  and re-judged the full 28-leg 2130Z corpus under it:
  PILOT-NO-GO on the tie leg, sole miss seed 83248
  (pantry hovering at 0.898 of peak; E1@0.85 waits until
  day 18 while (c) fires day 17).
- sim-envelope-b (same 2330Z run, offline table, judging
  nothing): E1 at 0.87/0.88 identical collapsing days to
  0.85 on that corpus with earlier survivor firing; 0.90
  gains two collapsing legs (83248- and 83272-shaped
  hovers). That table is a selection aid ONLY.
- This run judges (v**) on FRESH legs only. It does NOT
  pool, re-score, or re-judge the 83201-83400 corpus or any
  prior corpus into any judged denominator. The envelope
  DRAFT (evidence/2026-11-03/sim-envelope-next-prereg-
  DRAFT.md) judges nothing — THIS prereg binds, not the
  draft. Where this prereg differs from the draft, this
  prereg governs: in particular the base rule below
  (sibling landing does NOT void judging) supersedes the
  draft's Requirement 2 "run STOPS" wording, per the
  coordinator's assignment for this arm.

## (a) Fresh band — verified interval-disjoint BEFORE judging

Seeds 83401-83600 inclusive (200 seeds), 30d competent,
screened via the verbatim gatecover tracer, one node
process per seed, each line appended in seed order to
evidence/2026-11-03/screen-tmp-freshband-b/screen.jsonl.

FRESHNESS, VERIFIED HERE: 83401-83600 is interval-disjoint
from EVERY consumed band listed in draft Requirement 1 —
79xxx screen, 767xx confirm band, 522 pilot subset,
80001-80024, 81001-81056, 82001-82200, judged band
83001-83200, resupply supply seeds (82032, 82077, 82088,
82120, 82127, 82148, 82166, 82177) and its survivor sample
82001-82016 — AND from judged band 83201-83400, AND from
83201-83400's successor interval 83201-83400 itself, AND
from 83201-83400-adjacent 83201-83400 (stated twice
deliberately: the prior judged band ends at 83400, this
band starts at 83401). Lower bound 83401 exceeds every
consumed band's upper bound (83400); no interval overlaps
any listed band; no seed is shared with any listed band.
No seed is added, dropped, or substituted mid-run. No
cherry-picking: the screen runs the full band, and Stage-2
tracer legs run on the full screened candidate set plus
the fixed survivor sample defined below. If this band had
overlapped any consumed band, a different disjoint band
would have been picked HERE, before judging — it does
not overlap, so 83401-83600 stands as written.

## (b) Screen AND tracer on ONE base (this arm's base rule)

The base is whatever master the worktree sits on when the
screen starts: HEAD 6e47e1a2251d8944978ccdfae7cbbd65e7320a0e
at prereg time (re-confirmed in the evidence file at
screen start). Screen AND tracer BOTH run on that judging
base. NEVER rebase between screen and judgment. A sibling
landing moving master mid-run does NOT move this base
and does NOT void judging: the judging base hash is
reported in the evidence file, judged numbers stand as
judged on the screen base, and a rebase happens ONLY at
the very end for landing, with proof re-run — if proofs
fail post-rebase that failure is reported LOUDLY and the
judged numbers still stand as judged on the screen base.
NO salvaged screen is used in any judged denominator, NO
inherited corpus (including the 83201-83400 corpus and
the adopt tracer corpus) enters any judged denominator,
and NO leg is judged on a line generated on a different
base.

## (c) The SETTLED verification field (adopted from sim-verifyfield-b)

ADOPTED VERBATIM from sim-verifyfield-b: a leg verifies
iff rows are contiguous in loopDay 1..N AND (N ==
daysAlive OR village-lost with N == daysAlive - 1 and
gameDays == N).

Settlement rationale, quoted from sim-verifyfield-b: "A
row is one policy.daily call, in loopDay order
(scripts/trace-gatecover-b.js). Contiguity 1..N is the
real completeness check. daysAlive is runDays' day count
(scripts/sim-harness.js). For a village lost on its
final day, the harness counts that day even though the
village dies before that day's evening daily call
produces a row — so N == daysAlive - 1 is the EXPECTED
complete count for a village-lost leg, not a missing
row. gameDays is REJECTED as the field: it is the
scholar's game-clock day at run end (sim-harness.js:
gameDays = Game.state.scholar.day || 0), not a row
count. On the verifyfield corpus it equals rows on all
12 collapsing legs but EXCEEDS rows on 14 of 16 complete
survivor legs (rows 30, gameDays 31 on thirteen
survivors and 32 on 83208). Verifying rows == gameDays
would falsely fail 14 complete survivor series — a
strictly worse verifier. gameDays serves only as
corroboration on exempted loss legs, where it equals N,
showing the series ends at the game clock rather than
being truncated mid-series. The exemption is narrow by
construction: village-lost only, exactly daysAlive - 1
only, with contiguity and gameDays corroboration. A
survivor leg at N == daysAlive - 1 would still FAIL."

Choosing the field after seeing failures is FORBIDDEN.
This field is fixed here, before any screen or judged
leg. A verification failure unrepairable by the
preregistered re-run rule (at most one re-run per leg)
voids judging as INSUFFICIENT-DATA, exactly as in the
bars below.

## (d) The variant (v**) — EXACT text (carried verbatim)

Variant (v**) = (e**) OR (F), first-firing wins, EXACTLY
as fixed in the streakfree-cost prereg: (e**) is (e*)
with E1 tightened 0.90 -> 0.85 peak; (F) falls >= 3 AND
pantry <= 0.80 peak, no streak condition; (c) verbatim.

  S = first evening of the current disengaged stretch;
  peak(D) = max pantry over S..D in the stretch;
  falls(D) = count of evenings t in (S..D] with
  pantry(t) < pantry(t-1), cumulative not consecutive.
  (e**): fire at FIRST evening D in the stretch with
  D > S, D >= 8, disengaged, hungryStreak(D) >= 1,
  where (E1) falls(D) >= 2 AND pantry(D) <= 0.85 x
  peak(D), or (E2) pantry(D) <= 0.65 x peak(D).
  (F): fire at FIRST evening D in the stretch with
  D > S, D >= 8, disengaged, falls(D) >= 3 AND
  pantry(D) <= 0.80 x peak(D), with NO hungryStreak
  condition.
  (c): S = first evening of the current disengaged
  stretch; D > S, D >= 8, three consecutive falls
  ending at D with D-3 >= S, and pantry(D) <= 0.90 x
  pantry(S).
  Variant first-firing: stretches scanned in order;
  within a stretch the variant fires at the earliest of
  the (e**) firing day and the (F) firing day in that
  stretch; the first stretch with any firing wins.
  Collapsing = village-lost WITH a starvation death
  within the 30d window (a loss ON the horizon day
  counts). Reference day = first starvation death day.
  Lead = reference day - first firing day. No-fire =
  negative infinity for lead-vs-(c) comparisons.

## (e) GO bars — CARRIED verbatim (judged exactly as written)

GO requires ALL of the following, on the TRACED legs of
the fresh band:

- STAGE-1 GO: screened collapsing >= 4. Below = 
  INSUFFICIENT-DATA, STOP, no Stage 2, no fallback band,
  no top-up.
- STAGE-2 COUNT GATE: traced still-collapsing >= 4 AND
  traced survivors >= 12. Below either =
  INSUFFICIENT-DATA.
- FIRE: (v**) fires on ALL traced collapsing.
- TIE: lead_variant >= lead_c on ALL traced collapsing.
- STRICT: lead_variant > lead_c on >= 50% of traced
  collapsing.
- LEAD-ONE: lead_variant >= 1 on >= 75% of traced
  collapsing.
- COST: (v**) fires on <= 25% of traced survivors.
- CROSS-CHECK: this arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's
  (c) first-firing on ALL tracer legs. Any mismatch =
  INSUFFICIENT-DATA.
- TRACER: verification under the settled field (c) on
  every tracer leg after at most one re-run per leg.
  Unrepairable failure = INSUFFICIENT-DATA.
- STILL-COLLAPSING RULE: a screened collapsing candidate
  whose tracer is NOT collapsing is EXCLUDED and
  reported by seed, never a rule failure.
- SURVIVOR-DRIFT RULE: a sampled survivor whose tracer
  NEWLY collapses = INSUFFICIENT-DATA, seed named, no
  replacement, no denominator join.
- SURVIVOR SAMPLE: FIRST 16 screened survivors in seed
  order, fixed by seed order alone. If the screen yields
  fewer than 16 survivors, the sample is all of them,
  and the count gate decides.

Verdict words (only these): PILOT-GO (Stage 1 GO AND
count gate holds AND all legs hold — the shape survives
a fresh supply on the current base; it does NOT deploy
(e*), (v*), or (v**), and no deploy claim may cite the
pilot alone); PILOT-NO-GO (Stage 1 GO and count gate
hold but any judged leg fails, failing leg named);
INSUFFICIENT-DATA (Stage 1 < 4 collapsing, count gate
fails, survivor-drift membership change, cross-check
mismatch, or tracer verification failure unrepairable
by re-run — failure stated). No leg re-scored, no
margin relaxed, no seed substituted, no clause
redefined mid-run.

## Definitions (fixed here, before judging)

- Survivor = survived the full 30d (daysAlive == 30,
  endReason not 'village-lost').
- Other outcomes (lost before 30d with NO starvation
  death, or any other non-survivor end) are neither
  collapsing nor survivors: reported seed-by-seed,
  count toward neither judged denominator, fill neither
  count.
- Screen tool: VERBATIM gatecover tracer
  (scripts/trace-gatecover-b.js), reused read-only.
  Invocation per seed, verbatim from prior confirms:
  POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 DAYS=30 SEEDS=<seed>
  node scripts/trace-gatecover-b.js (the seven non-gate
  flags the tracer forbids at 1 are left unset, which
  satisfies its FATAL checks).
- Screen-vs-tracer agreement: every tracer leg's
  membership (collapsing / survivor / other) is compared
  against its screen classification and reported per leg.
  Disagreements are handled ONLY by the still-collapsing
  rule and the survivor-drift rule — never by
  re-sampling, substitution, or redefinition.
- Determinism spot-check (descriptive, not judged):
  3 tracer legs re-run verbatim (first/middle/last
  still-collapsing in seed order if >= 3 exist, else
  first 3 tracer legs) and tracer-vs-screen byte-
  equality reported as substrate findings.

## Primary metric, horizon, seeds, policies (fixed here)

PRIMARY METRIC: the GO legs jointly on the traced legs
— GO requires every leg above to hold; the tie leg is
the leg the prior judged run failed, the cost leg is
the leg the 0.85 tightening exists to fix, and both are
judged together with fire, strict, lead-one,
cross-check, and the count gates, never alone. HORIZON:
30 days, the same early window as the streakfree and
adoption runs — the window in which collapsing villages
first starve (days 16-28 on the old corpus) and in
which the sensor must warn in time; a longer window
would mix in late-game states this instrument does not
measure. SEEDS: fresh band 83401-83600 (screen), tracer
legs on screened candidates + first 16 screened
survivors. POLICIES: competent only, with
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, verbatim tracer invocation above.
METRIC BINDING (§14): the metrics above bind this run
— a miss is NO-GO (or INSUFFICIENT-DATA where the
header says so), never re-scored against a friendlier
metric mid-run. If the metric proves wrong, it is
written under "metric review" in the evidence file and
proposed for the NEXT run.

## Descriptive reporting (never judged, never pooled into the verdict)

- Envelope sensitivity columns: E1 at 0.87, 0.88, 0.90
  holding (F) and (c) verbatim, same method as
  scripts/analyze-envelope-b.js (fireEnvelope /
  fireVariantAt imported from the reused envelope
  analyzer, read-only), computed on the fresh traced
  legs only. These columns test whether the envelope
  table's findings replicate (0.87/0.88 dead zone, 0.90
  two-leg gain). They are never judged, never a basis
  for mid-run substitution of the primary variant.
- Knife-edge visibility: for EVERY E1 firing on traced
  legs, the pantry/peak fraction at firing, so a
  sub-0.001-margin firing is visible as fragile rather
  than read as robust support for a fraction.
- P3 NOT adopted: the survivor sample stays 16. No
  larger sample, no sample change mid-run.
- Wall numbers from the traced legs with the 30d limit
  stated (these are NOT wall movement): survival,
  median/max days alive, wave reach, traced collapsing
  count, national / table / wins as NOT REACHED IN
  WINDOW (expected 0 — late-game states with no fields
  in this window, reported as such, not as a rate
  claim).

## Sense test (fixed here)

Read transcripts around variant firing evenings on
traced collapsing seeds — firing-evening transcripts,
>= 3 quoted lines, plain-words judgment whether the
warnings read as the village noticing in time or as a
silent cliff / death-knell. Framing constraint carried:
a future deploy must frame (v**) as the village store's
fall, never as personal hunger, and must SAY something
on the firing evening.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any screen or judged
leg).
STEP 2 — TOOLS + PROOF (new analyzer
scripts/analyze-freshband-b.js; new proof test
scripts/test-freshband-b.js; pure synthetic series only,
NO judged seeds; proof green after the prereg commit
and before any judged application; reused proof tests
test-streakfree-cost-b.js (24/24),
test-gatediseng-b.js (21/21),
test-gatediseng-confirm-b.js (11/11) re-run green on
the judging base before judging; reused gatediseng
tracer/analyzer verified untouched — git status shows
no modification to reused files).
STEP 3 — STAGE 1 SCREEN (full 83401-83600 band fresh via
the verbatim gatecover tracer on the judging base;
verify each line under the settled field; classify
every seed; apply the Stage-1 bar).
STEP 4 — STAGE 2 TRACER LEGS (only if Stage 1 GO;
verbatim tracer re-runs on all screened collapsing
candidates + the first-16 survivor sample on the SAME
base; verify under the settled field each; apply the
still-collapsing rule and the survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (v**) via this
arm's analyzer, cross-check, leads, verdict judged
exactly against this header; wall numbers from the
traced legs, 30d limit stated).
STEP 6 — SENSE TEST (firing-evening transcripts, >= 3
quoted lines, plain-words judgment).
STEP 7 — EVIDENCE (evidence/2026-11-03/
sim-freshband-b.md, with a metric review section; any
revision applies to the run AFTER that one, never to
itself).

## Balanced panel (§15) — inapplicability declared

No balanced-panel compare is fabricated: this arm
changes NO game code, runs NO lever, and its primary
metrics are within-trajectory instrument diagnostics
(would-fire overlays on identical evening series), not
panel metrics. Tables are reported directly in the
evidence file, on identical seeds and identical
trajectories.

## Attribution limits (stated before judging)

Evening snapshots only; would-fire overlay, not a
counterfactual (whether a real rule would have saved
any village is unmeasured — do not claim it). Single
policy (competent) by design; 30-day early window
only. Descriptive staged measurement, NOT a causal
claim. No pooling with prior runs to strengthen a
verdict.

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored
("fallen from its recent high"), never stand-down-
anchored, and must frame (v**) as the village store's
fall, never as personal hunger. This run does NOT
deploy (e*), (v*), or (v**) and writes no deploy copy.

## Metric review

(To be completed in the evidence file after judging.
Doubts about this header go there, and any revision
applies to the NEXT run, never to this one.)
