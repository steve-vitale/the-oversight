# sim-sensorresupply-b — SENSOR RE-SUPPLY PREREGISTRATION (committed BEFORE any screen or judged leg)

Run: oversight-flesh-out-loop-b, arm sim-sensorresupply-b, axis
food-economy. Worktree sim-sensorresupply-b, branch
sim-sensorresupply-b. This arm changes NO game code, flips NO policy
default, edits NO existing script or policy file. New files only, all
named *-sensorresupply-b.*: this prereg, the proof test
(scripts/test-sensorresupply-b.js), the thin analyzer
(scripts/analyze-sensorresupply-b.js, which imports the reused
gatediseng analyzer for the judged (c) and adds an independent (c)
for the cross-check, the (e*) rule, the screen classification, the
still-collapsing exclusion, and the pilot verdict), the evidence
file, and the corpora (evidence/2026-11-03/
sim-sensorresupply-b-calib.jsonl / *-calib.log,
*-screen.jsonl / *-screen.log, *-tracer.jsonl /
*-summary.json / *-sweep.log / *-detcheck.log). The gatecover
tracer (scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited. This worker does NOT
push, bump versions, verify live, merge, or rebase — the coordinator
lands the branch. This run does NOT deploy (e*).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng
sensor (e*) itself — it is a policy-side sim instrument, not a game
system; no canon is invented for it. docs/PRESERVATION.md (food
ladder) is adjacent only, not the sensor. This arm invents no game
system: it measures would-fire overlays on existing evening
trajectories.

## Background (read, never re-litigated, never re-judged)

Read before judging: evidence/2026-11-03/sim-sensor-supply-b.md and
its prereg (fixed known-collapser supply PILOT-GO: 7/7
still-collapsing, all legs pass, zero drift, base before the
gap-w5window move), evidence/2026-11-03/sim-sensorconfirm3-b.md and
its prereg (the next run stopped at its calibration gate: the
screen tool reproduced only 4/7 known classifications on base
5440b7747; known collapsers 80008/80016/81053 now survive 30d with
zero starvation deaths; day-1 pantry identical, divergence days
11/12/18; timing lead only — the gap-w5window 5440b7747 wanderer
change, NOT a proven cause), plus evidence/2026-11-02/
sim-sensorconfirm-b.md and sim-sensorconfirm2-b.md (fresh-band
confirms INSUFFICIENT-DATA at 2 and 1 collapsing seeds), and
docs/MEASUREMENT.md sections 9-12, 14-15. Per the confirm3 prereg
and evidence, NO screen of band 82001-82200 was run — that band is
still fresh, never screened, and this run uses it. This run is the
re-supply the confirm3 metric review ordered: re-derive a collapsing
supply on the current base before any (e*) judging, with a
calibration gate of the same form kept first — but with its role
changed as stated below, because this run's purpose IS re-derivation.

Rule (e*) verbatim, carried from the pilot prereg: S = first evening
of the current disengaged stretch; peak(D) = max pantry over S..D in
the stretch; falls(D) = count of evenings t in (S..D] with
pantry(t) < pantry(t-1), cumulative not consecutive; fire at FIRST
evening D in the stretch with D > S, D >= 8, disengaged,
hungryStreak(D) >= 1, where (E1) falls(D) >= 2 AND
pantry(D) <= 0.90*peak(D), or (E2) pantry(D) <= 0.65*peak(D).
Rule (c) is the old stand-down+trend rule from the same prereg
(S = first evening of the current disengaged stretch; D > S, D >= 8,
three consecutive falls ending at D with D-3 >= S, and
pantry(D) <= 0.90*pantry(S)).

## Fresh band (fixed here, BEFORE any judged leg)

Seeds 82001-82200 inclusive (200 seeds), 30d competent, screened via
the verbatim gatecover tracer (screen tool, below), one node process
per seed, each line appended to
evidence/2026-11-03/sim-sensorresupply-b-screen.jsonl, in seed order.
FRESHNESS: this band was fixed in the confirm3 prereg and never
screened there (that run stopped at its calibration gate); it is
interval-disjoint from every consumed sensor band listed in the
prior preregs (79xxx screen, 767xx confirm band, 522 pilot subset,
80001-80024, 81001-81056) and shares no seed with the supply
pilot's candidate, cost, or context lists. No seed is added,
dropped, or substituted mid-run. No cherry-picking: the screen runs
the full band, and Stage-2 tracer legs run on the full screened
candidate set plus the fixed survivor sample defined below.

## Definitions (fixed here, BEFORE any judged leg)

- COLLAPSING DEFINITION, WINDOW-INCLUSIVE (matching prior arms,
  unchanged): a seed is collapsing iff endReason is 'village-lost'
  AND at least one death has cause 'starvation', within the 30d
  window. A loss ON the horizon day (daysAlive == 30) counts.
  Reference day = first starvation death day. The thin analyzer
  computes collapsing from this judged definition (endReason + first
  starvation day from the reused analyzer's death scan) and reports
  any divergence from the reused analyzer's collapsed flag loudly;
  a divergence is a substrate finding, never a silent redefinition.
- Survivor = survived the full 30d (daysAlive == 30, endReason not
  'village-lost').
- Other outcomes (lost before 30d with NO starvation death, or any
  other non-survivor end) are neither collapsing nor survivors:
  reported seed-by-seed, count toward neither judged denominator,
  and do not fill either count.
- Lead = reference day - first firing day. A collapsing seed with NO
  firing has no lead and fails outright; for lead-vs-(c)
  comparisons, no-fire counts as negative infinity (worse than any
  firing).
- Tracer/screen verification: rows == daysAlive on every leg. A leg
  failing verification is re-run once and the retry reported loudly;
  a seed is never judged on a mismatched row count.
- Screen-vs-tracer agreement: every tracer leg's membership
  (collapsing / survivor / other) is compared against its screen
  classification and reported per leg. Disagreements are handled
  ONLY by the still-collapsing rule and the survivor-drift rule
  below — never by re-sampling, substitution, or redefinition.

## Screen tool (fixed here, BEFORE any judged leg)

The screen tool is the VERBATIM gatecover tracer
(scripts/trace-gatecover-b.js), reused read-only: it runs competent
30d and its JSON line reports endReason, daysAlive, and the full
deaths list with causes — exactly the fields the candidate rule
reads. Invocation per seed, verbatim from the prior confirms:
POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 DAYS=30 SEEDS=<seed> node scripts/trace-gatecover-b.js
(the seven non-gate flags the tracer forbids at 1 are left unset,
which satisfies its FATAL checks). The screen corpus is NOT the
judged corpus: judged legs run on the tracer corpus only (below).
The screen rate (screened collapsing / 200) is reported honestly
alongside the verdict; it is a band property, not a rate claim.

## STAGE 1 — calibration gate (fixed here; RECORD-ONLY by design)

BEFORE the screen, the screen tool is re-run on the same 7 known
seeds as confirm3, whose classifications were fixed by archived
corpora and the supply pilot's fresh re-run: collapsing — 80008
(archived village-lost day 20, first starvation day 18), 80016
(village-lost day 29, first starvation day 28), 81053 (village-lost
day 30, first starvation day 26); survivors — 79001, 79002, 79003,
79004 (all archived and supply-fresh as 30-day survivors).
CALIBRATION-GATE RULE (stated change from confirm3, justified):
the gate outcome is RECORDED honestly whatever it is and does NOT
stop this run. Justification: confirm3 already proved the old supply
stale on base 5440b7747, so a mismatch here is the EXPECTED
re-confirmation of that finding, not an instrument failure; and this
run's purpose is re-derivation on the current base, whose fresh
screen does not depend on the old supply at all. A 7/7 reproduction
would be equally reportable (old supply alive again) and would not
change the screen either. The gate is therefore diagnostic data for
the re-supply, not a stop-gate — the opposite role from confirm3,
where the old supply was the judging substrate. Calibration legs are
not judged legs, are not pooled with any verdict denominator, and
are reported in the calibration corpus (evidence/2026-11-03/
sim-sensorresupply-b-calib.jsonl / *-calib.log). The old supply is
NOT expected to reproduce 7/7, and a mismatch is NOT this run's
failure.

## STAGE 1 — screen + GO bar (fixed here)

STAGE-1 GO BAR: screened collapsing seeds >= 4 (the prior
confirm-supply bar, carried verbatim). If the screen yields < 4
collapsing seeds, the verdict is INSUFFICIENT-DATA and the run
STOPS: no Stage 2, no judged legs, no fallback band, no top-up
screen, no re-scored bar. The screen is reported honestly in full
(collapsers found with their loss/starvation days, survivors,
other outcomes, starvation-death counts). If the screen yields
>= 4 collapsing seeds, the run proceeds to Stage 2.

## STAGE 2 — survivor sample + tracer legs (fixed here; only if Stage 1 GO)

The survivor sample is the FIRST 16 screened survivors in seed order
(the first 16 seeds in 82001-82200 order whose screen classification
is survivor). If the screen yields fewer than 16 survivors, the
sample is all of them, and the Stage-2 count gate below decides the
verdict. The sample is fixed by seed order alone — never by firing,
pantry, or any outcome of either rule.
Tracer legs are VERBATIM gatecover tracer re-runs (same invocation
as the screen) on ALL screened collapsing candidates PLUS the
sampled survivors, one node process per seed, each line appended to
evidence/2026-11-03/sim-sensorresupply-b-tracer.jsonl. Judged legs
run on the tracer corpus only, never on screen lines.
- STILL-COLLAPSING RULE (carried): a screened collapsing candidate
  whose tracer line is NOT collapsing is EXCLUDED by this
  pre-registered rule and reported by seed with its tracer outcome.
  It is NEVER counted as a rule failure. The judged collapsing
  denominator is the still-collapsing (traced) count.
- SURVIVOR-DRIFT RULE (carried): a sampled survivor whose tracer
  line NEWLY collapses is membership-changing drift: the verdict is
  INSUFFICIENT-DATA, with the seed named. It does not join the
  collapsing denominator mid-run, and no replacement survivor is
  sampled.
- FULL POLICY OBJECT RULE (carried): no new probe driver is written;
  the reused tracer builds its policy as Object.assign({}, competent,
  {daily wrapper calling competent.daily}) and passes it to runDays,
  and sim-harness.js calls policy.setup, policy.upkeep, and
  policy.daily — the FULL policy object, never a bare {daily}.

## STAGE 2 — judged legs + GO bars (fixed here, mirroring the 080700Z supply pilot)

GO requires ALL of the following, on the TRACED legs:
- COUNT GATE: traced still-collapsing >= 4 AND traced survivors
  >= 12. If either count is below its bar, the verdict is
  INSUFFICIENT-DATA — do not lower bars, do not screen extra seeds
  to fill the count, do not run an extra band. (The >= 12 survivor
  bar is the confirm's full cost denominator, made reachable here by
  the first-16 survivor sample; the supply pilot's <= 1/4 screen on
  4 survivors is superseded by this full leg, not waived.)
- FIRE LEG: (e*) fires on ALL traced collapsing seeds.
- TIE LEG: lead_e >= lead_c on ALL traced collapsing seeds.
- STRICT LEG: lead_e > lead_c on >= 50% of traced collapsing seeds.
- LEAD-ONE LEG: lead_e >= 1 on >= 75% of traced collapsing seeds.
- COST LEG: (e*) fires on <= 25% of traced survivors.
- CROSS-CHECK LEG: this arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's (c)
  first-firing on ALL tracer legs. Any mismatch = INSUFFICIENT-DATA
  (loud failure, not a re-score). This is the supply pilot's
  two-implementation form of the cross-check.
- TRACER LEG: tracer verification rows == daysAlive on every tracer
  leg (after at most one re-run per leg).
Verdict words (judged exactly against this header):
- PILOT-GO: Stage 1 GO AND Stage-2 count gate holds AND all legs
  hold. The (e*) shape survives a fresh supply re-derived on the
  current base; it does NOT deploy (e*), and no deploy claim may
  cite this pilot alone.
- PILOT-NO-GO: Stage 1 GO and count gate hold but any judged leg
  fails, with the failing leg named. The shape does not advance on
  this evidence.
- INSUFFICIENT-DATA: Stage 1 screen < 4 collapsing, Stage-2 count
  gate fails, survivor-drift membership change, cross-check
  mismatch, or tracer verification failure unrepairable by re-run —
  with the failure stated. No leg is re-scored, no margin relaxed,
  no seed substituted, no clause redefined mid-run.
Secondary (reported, NOT judged): per-seed clause (E1/E2) and firing
days for both rules on traced collapsing seeds; mean lead_e vs mean
lead_c (with the pilot's warning that means mislead when coverage
differs); traced collapsing seeds with lead_e == 0 (death-knell
firings, named even on a GO); (c) firing rate on traced survivors
for context; the (c)-vs-(e*) survivor overlap on the traced
survivors; screen-vs-tracer membership agreement per leg; and the
screen rate (screened collapsing / 200) with the screened
collapsing seeds named even when a gate fails.

## Determinism spot-check + base-equality (fixed here)

Re-run 3 legs verbatim (first, middle, and last still-collapsing
legs in seed order if >= 3 still-collapsing seeds exist; otherwise
the first 3 tracer legs in seed order) and report match/mismatch of
the full JSON line against the tracer leg line. A mismatch is
reported loudly as a substrate finding; judged legs run on the
tracer-leg lines (the first tracer runs), never on spot-check
re-runs. BASE-EQUALITY (as tasked): each tracer line is compared
byte-for-byte against its screen line (same verbatim invocation, so
a deterministic substrate must reproduce it); mismatches are
reported per seed as substrate findings, and judged legs run on the
tracer lines. The spot-check corpus is
evidence/2026-11-03/sim-sensorresupply-b-detcheck.log.

## Sense test (fixed here)

Read transcripts around (e*) firing evenings on traced collapsing
seeds — at least 2 collapsing firing evenings when at least 2 traced
collapsing firings exist (otherwise all firing collapsing evenings
available, with the shortfall stated) — quote >= 3 lines, and judge
in plain words whether the warnings read as the village noticing in
time, or as a silent cliff / death-knell. A warning that lands on a
silent evening, or alongside a death, is reported as such even on a
GO. The confirm2 sense framing constraint travels: a future deploy
must frame (e*) as the village store's fall, never as personal
hunger.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any screen or judged leg).
STEP 2 — TOOLS + PROOF (new proof test
scripts/test-sensorresupply-b.js; pure, synthetic series only, NO
judged seeds — synthetic seed 999001 only — run green after the
prereg commit and before any judged application; it proves the (e*)
rule, the window-inclusive collapse derivation (including the 81053
shape and the 81042 shape), the screen classification, the
still-collapsing exclusion, and the pilot verdict logic; the reused
proof tests test-gatediseng-b.js (21/21) and
test-gatediseng-confirm-b.js (11/11) are also re-run green on current
base before judging).
STEP 3 — STAGE 1 CALIBRATION GATE (7 known seeds via the screen tool;
record-only, per the rule above) THEN STAGE 1 SCREEN (full
82001-82200 band fresh via the verbatim tracer; verify rows ==
daysAlive each; classify every seed; apply the Stage-1 GO bar).
STEP 4 — STAGE 2 TRACER LEGS (only if Stage 1 GO; verbatim tracer
re-runs on all screened collapsing candidates + the first-16
survivor sample; verify rows == daysAlive each; apply the
still-collapsing rule and the survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (e*) via thin analyzer,
cross-check, leads, verdict judged exactly against this header;
wall numbers from the traced legs, 30d limit stated).
STEP 6 — SENSE TEST (firing-evening transcripts, >= 3 quoted lines,
plain-words judgment).
STEP 7 — EVIDENCE (evidence/2026-11-03/sim-sensorresupply-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same reasoning as
the pilot, both confirms, the supply pilot, and confirm3: this arm
changes NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays on
identical evening series), not panel metrics. The tables are
reported directly in the evidence file instead, on identical seeds
and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins. NO wall
movement is claimed. What is reported from the traced legs: survival
(seeds survived / legs, median and max days alive), wave reach,
traced collapsing-seed count, and national / table / wins as NOT
REACHED IN WINDOW (expected 0 — late-game states with no fields in
this window, reported as such, not as a rate claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen from its
recent high"), never stand-down-anchored — per the pilot's metric
review (4), (e*) can in principle fire while pantry is still above
its stand-down level. This run does NOT deploy (e*) and writes no
deploy copy. Any future (e*) deploy must also frame the warning as
the village store's fall, not personal hunger (confirm2 sense
framing constraint).

## Attribution limits (stated before judging)

- Evening snapshots only: (e*) reads evening pantry/gate/streak values.
  Intraday flicker is not measured and cannot change a would-fire
  evening verdict.
- Would-fire overlay, not a counterfactual: firing days are computed on
  trajectories as run. A real (e*) rule could change villager behavior
  and therefore later evenings; whether it would have saved any village
  is unmeasured and is not claimed.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a PILOT-GO
  here is shape survival on a re-derived fresh supply, not a deploy
  claim, and no pooling with prior runs is used to strengthen it —
  the supply pilot's 7 seeds are the same villages as the prior runs,
  and any screened collapsing seeds here are fresh villages counted
  in this run only.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
