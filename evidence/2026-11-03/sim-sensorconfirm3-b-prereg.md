# sim-sensorconfirm3-b — SCREEN-THEN-TRACER CONFIRM PREREGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0856Z,
arm sim-sensorconfirm3-b, axis food-economy. Worktree
sim-sensorconfirm3-b, branch sim-sensorconfirm3-b. This arm changes NO
game code, flips NO policy default, edits NO existing script or policy
file. New files only, all named *-sensorconfirm3-b.*: this prereg, the
proof test (scripts/test-sensorconfirm3-b.js), the thin analyzer
(scripts/analyze-sensorconfirm3-b.js, which imports the reused
gatediseng analyzer for the (c) cross-check and adds only the new rule,
lead arithmetic, the screen classification, the survivor-sample rule,
the still-collapsing exclusion, and the confirm verdict), the evidence
file, and the corpora (evidence/2026-11-03/sim-sensorconfirm3-b-calib.jsonl
/ *-calib.log, *-screen.jsonl / *-screen.log, *-tracer.jsonl /
*-summary.json / *-sweep.log / *-detcheck.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited. This worker does NOT
push, bump versions, verify live, merge, or rebase — the coordinator
lands the branch. This confirm does NOT deploy (e*).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng sensor
itself — it is a policy-side sim instrument, not a game system; no
canon is invented for it. docs/PRESERVATION.md (food ladder) is
adjacent only, not the sensor. This arm invents no game system: it
measures would-fire overlays on existing evening trajectories.

## Background (read, never re-litigated, never re-judged)

Read in full before judging: evidence/2026-11-02/sim-sensorredesign-b.md
and its prereg (PILOT-GO on a KNOWN band), evidence/2026-11-02/
sim-sensorconfirm-b.md and its prereg (first fresh-band confirm
INSUFFICIENT-DATA: 2 collapsing vs bar >= 4, band 80001-80024),
evidence/2026-11-02/sim-sensorconfirm2-b.md and its prereg (second
fresh-band confirm INSUFFICIENT-DATA: 1 collapsing seed 81053 vs bar
>= 4, band 81001-81056), evidence/2026-11-03/sim-sensor-supply-b.md
and its prereg (fixed known-collapser supply PILOT-GO: 7/7
still-collapsing, all legs pass, zero drift), plus docs/MEASUREMENT.md
sections 9-12, 14-15. This run is the 080700Z next blank (1): the
confirm the supply pilot earned, with a collapsing supply fixed in
THIS prereg. This is a NEW recipe, NOT a repeat of the two failed
fresh-band confirms: screen-then-tracer (screen a fresh band,
trace only the screened collapsing candidates plus a fixed survivor
sample), instead of tracing a fixed band and hoping it contains
enough collapsers. No deploy claim may cite the pilot alone, the
supply pilot alone, or this confirm alone — this confirm does NOT
deploy (e*).

Rule (e*) verbatim, carried from the pilot prereg: S = first evening of
the current disengaged stretch; peak(D) = max pantry over S..D in the
stretch; falls(D) = count of evenings t in (S..D] with
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
evidence/2026-11-03/sim-sensorconfirm3-b-screen.jsonl, in seed order.
FRESHNESS VERIFICATION (done before this prereg was written, recorded
here, not asserted after the fact): the band is interval-disjoint
from every consumed sensor band listed in the prior preregs — the 79xxx
screen (79001-79064), the 767xx confirm band (76701-76712), the 522
pilot subset, the consumed 80001-80024 band, and the consumed
81001-81056 band — and shares no seed with the supply pilot's
candidate, cost, or context lists (79006/79019/79031/79064, 80008/80016,
81053, 79001-79004, 81042). A grep of the prior sensor preregs and
evidence notes for 82xxx seed mentions returned only two false
positives (a commit-hash fragment containing "82006" and a JSON byte
offset "82436"), neither a seed use; no 820xx/821xx/822xx seed use
appears in the 2026-11-03 evidence notes. No seed is added, dropped,
or substituted mid-run. No cherry-picking: the screen runs the full
band, and the tracer legs run on the full screened candidate set plus
the fixed survivor sample defined below.

## Definitions (fixed here, BEFORE any judged leg)

- COLLAPSING DEFINITION, WINDOW-INCLUSIVE (resolves the confirm2
  day-30 ambiguity exactly as the supply prereg fixed it): a seed is
  collapsing iff endReason is 'village-lost' AND at least one death
  has cause 'starvation', within the 30d window. A loss ON the
  horizon day (daysAlive == 30) counts. Reference day = first
  starvation death day. The thin analyzer computes collapsing from
  this judged definition (endReason + first starvation day from the
  reused analyzer's death scan) and reports any divergence from the
  reused analyzer's collapsed flag loudly; a divergence is a
  substrate finding, never a silent redefinition.
- Survivor = survived the full 30d (daysAlive == 30, endReason not
  'village-lost').
- Other outcomes (lost before 30d with NO starvation death, or any
  other non-survivor end) are neither collapsing nor survivors: they
  are reported seed-by-seed, count toward neither judged
  denominator, and do not fill either count.
- Lead = reference day - first firing day. A collapsing seed with NO
  firing has no lead and fails outright; for lead-vs-(c)
  comparisons, no-fire counts as negative infinity (worse than any
  firing).
- Tracer verification: rows == daysAlive on every tracer leg. A leg
  failing verification is re-run once and the retry reported loudly;
  a seed is never judged on a mismatched row count. Screen lines are
  likewise verified (rows == daysAlive); a screen line failing
  verification is re-run once and the retry reported loudly, and its
  classification comes from the verified re-run line.
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

## Calibration gate (fixed here, BEFORE any judged leg — runs before the screen)

BEFORE the screen, the screen tool is re-run on 7 known seeds whose
classifications are fixed by archived corpora and the supply pilot's
fresh re-run (byte-identical there): collapsing — 80008 (archived
village-lost day 20, first starvation day 18), 80016 (village-lost
day 29, first starvation day 28), 81053 (village-lost day 30, first
starvation day 26); survivors — 79001, 79002, 79003, 79004 (all
archived and supply-fresh as 30-day survivors). The gate requires
the screen tool to reproduce all 7 known classifications exactly.
ANY mismatch = INSUFFICIENT-DATA, instrument failure, no fallback
method, no judged legs, stop. Calibration legs are not judged legs,
are not pooled with any verdict denominator, and are reported in
the calibration corpus (evidence/2026-11-03/
sim-sensorconfirm3-b-calib.jsonl / *-calib.log).

## Survivor sample rule (fixed here, BEFORE any judged leg)

The survivor sample is the FIRST 16 screened survivors in seed order
(the first 16 seeds in 82001-82200 order whose screen classification
is survivor). If the screen yields fewer than 16 survivors, the
sample is all of them, and the count gate below decides the verdict.
The sample is fixed by seed order alone — never by firing, pantry,
or any outcome of either rule.

## Tracer legs (fixed here, BEFORE any judged leg)

Tracer legs are VERBATIM gatecover tracer re-runs (same invocation as
the screen) on ALL screened collapsing candidates PLUS the 16 sampled
survivors (or all screened survivors if fewer than 16), one node
process per seed, each line appended to
evidence/2026-11-03/sim-sensorconfirm3-b-tracer.jsonl. Judged legs run
on the tracer corpus only, never on screen lines.

- STILL-COLLAPSING RULE (carried from the supply prereg): a screened
  collapsing candidate whose tracer line is NOT collapsing
  (survived, or lost without a starvation death) is EXCLUDED by this
  pre-registered rule and reported by seed with its tracer outcome.
  It is NEVER counted as a rule failure (neither a no-fire nor a
  missed lead). The judged collapsing denominator is the
  still-collapsing (traced) count.
- SURVIVOR-DRIFT RULE (carried from the supply prereg's
  membership-change rule): a sampled survivor whose tracer line
  NEWLY collapses is membership-changing drift: the verdict is
  INSUFFICIENT-DATA, with the seed named. It does not join the
  collapsing denominator mid-run, and no replacement survivor is
  sampled.
- FULL POLICY OBJECT RULE (carried from the supply prereg): no new
  probe driver is written; the reused tracer builds its policy as
  Object.assign({}, competent, {daily wrapper calling
  competent.daily}) (trace-gatecover-b.js lines 71-72) and passes it
  to runDays (line 106), and sim-harness.js calls policy.setup
  (line 418), policy.upkeep (line 557), and policy.daily (line 574)
  — the FULL policy object (setup + upkeep + daily), never a bare
  {daily}.

## Judged legs + GO bars (fixed here, BEFORE any judged leg — verbatim from the confirm2 prereg, denominators traced)

GO requires ALL of the following, on the TRACED legs:

- COUNT GATE: traced still-collapsing >= 4 AND traced survivors >= 12.
  If either count is below its bar, the verdict is
  INSUFFICIENT-DATA — do not lower bars, do not screen extra seeds
  to fill the count, do not run an extra band. In particular: if the
  SCREEN yields < 4 collapsing seeds, the verdict is
  INSUFFICIENT-DATA with the screen rate reported, no top-up, no
  extra band (tracer legs still run on the screened candidates plus
  the survivor sample, so the record is complete, but the legs are
  reported on the traced n and cannot overturn the count gate).
- FIRE LEG: (e*) fires on ALL traced collapsing seeds.
- TIE LEG: lead_e >= lead_c on ALL traced collapsing seeds.
- STRICT LEG: lead_e > lead_c on >= 50% of traced collapsing seeds.
- LEAD-ONE LEG (the lead>=1 leg the pilot's metric review demanded):
  lead_e >= 1 on >= 75% of traced collapsing seeds.
- COST LEG: (e*) fires on <= 25% of traced survivors.
- CROSS-CHECK LEG: this arm's analyzer's (c) first-firing matches the
  reused gatediseng analyzer's (c) first-firing on ALL tracer legs.
  Any mismatch = INSUFFICIENT-DATA (loud failure, not a re-score).
  This is the import form of the cross-check (as in confirm2): the
  thin analyzer imports (c) from the reused analyzer and the check
  catches wiring slips; it is NOT described as an independent
  reimplementation (see the supply pilot's metric review (5)).
- TRACER LEG: tracer verification rows == daysAlive on every tracer
  leg (after at most one re-run per leg).

Verdict words (judged exactly against this header):
- CONFIRM-GO: count gate holds AND all legs hold. The shape survives
  a screen-then-tracer confirm; it does NOT deploy (e*).
- CONFIRM-NO-GO: count gate holds but any judged leg fails, with the
  failing leg named. The shape does not advance on this evidence.
- INSUFFICIENT-DATA: count gate fails, calibration mismatch,
  survivor-drift membership change, cross-check mismatch, or tracer
  verification failure unrepairable by re-run — with the failure
  stated. No leg is re-scored, no margin relaxed, no seed
  substituted, no clause redefined mid-run.

Secondary (reported, NOT judged): per-seed clause (E1/E2) and firing
days for both rules on traced collapsing seeds; mean lead_e vs mean
lead_c (with the pilot's warning that means mislead when coverage
differs); traced collapsing seeds with lead_e == 0 (death-knell
firings, named even on a GO); (c) firing rate on traced survivors
for context; the (c)-vs-(e*) survivor overlap on the traced
survivors; screen-vs-tracer membership agreement per leg; and the
screen rate (screened collapsing / 200) with the screened
collapsing seeds named even when the count gate fails.

## Determinism spot-check (fixed here, BEFORE any judged leg)

Re-run 3 legs verbatim (first, middle, and last still-collapsing
legs in seed order if >= 3 still-collapsing seeds exist; otherwise
the first 3 tracer legs in seed order) and report match/mismatch of
the full JSON line against the tracer leg line. A mismatch is
reported loudly as a substrate finding; judged legs run on the
tracer-leg lines (the first tracer runs), never on spot-check
re-runs. The spot-check corpus is
evidence/2026-11-03/sim-sensorconfirm3-b-detcheck.log.

## Sense test (fixed here, BEFORE any judged leg)

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

STEP 1 — THIS PREREG COMMIT (before any judged leg).
STEP 2 — TOOLS + PROOF (new proof test scripts/test-sensorconfirm3-b.js;
pure, synthetic series only, NO judged seeds — synthetic rows carry
no seed numbers from any judged band (synthetic seed 999001 only) —
run green after the prereg commit and before any judged application;
it proves the (e*) rule, the window-inclusive collapse derivation
(including the 81053 shape: village-lost on day 30 with a starvation
death IS collapsing, and the 81042 shape: village-lost with no
starvation death is NOT collapsing), the screen classification, the
first-16 survivor sample rule, the still-collapsing exclusion, and
the confirm verdict logic; the reused proof tests
test-gatediseng-b.js (21/21) and test-gatediseng-confirm-b.js (11/11)
are also re-run green on current base before the confirm).
STEP 3 — CALIBRATION GATE (7 known seeds via the screen tool; any
mismatch stops the run as INSUFFICIENT-DATA, instrument failure).
STEP 4 — SCREEN (run the full 82001-82200 band fresh via the verbatim
tracer, one node process per seed; verify rows == daysAlive each;
classify every seed; fix the candidate set and the first-16 survivor
sample by seed order).
STEP 5 — TRACER LEGS (verbatim tracer re-runs on all screened
collapsing candidates + the survivor sample; verify rows ==
daysAlive each; apply the still-collapsing rule and the
survivor-drift rule).
STEP 6 — JUDGE ((c) via reused analyzer, (e*) via thin analyzer,
cross-check, leads, verdict judged exactly against this header;
wall numbers from the traced legs, 30d limit stated).
STEP 7 — SENSE TEST (firing-evening transcripts, >= 3 quoted lines,
plain-words judgment).
STEP 8 — EVIDENCE (evidence/2026-11-03/sim-sensorconfirm3-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same reasoning as
the pilot, both confirms, and the supply pilot: this arm changes NO
game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays on
identical evening series), not panel metrics. The tables are reported
directly in the evidence file instead, on identical seeds and
identical trajectories.

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
its stand-down level. This confirm does NOT deploy (e*) and writes no
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
- Descriptive staged measurement, NOT a causal claim: a CONFIRM-GO
  here is shape survival on a screened fresh supply, not a deploy
  claim, and no pooling with prior runs is used to strengthen it —
  the supply pilot's 7 seeds are the same villages as the prior runs,
  and the prior confirms' collapsing seeds (2 + 1) are fresh villages
  already counted in their own runs, never re-counted here.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
