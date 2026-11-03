# sim-streakfree-b — STREAK-FREE FALLBACK PREREGISTRATION (committed BEFORE any screen or judged leg)

Run: oversight-flesh-out-loop-b, arm sim-streakfree-b, axis
food-economy. Worktree sim-streakfree-b, branch sim-streakfree-b.
This arm changes NO game code, flips NO policy default, edits NO
existing script or policy file. New files only, all named
*-streakfree-b.*: this prereg, the proof test
(scripts/test-streakfree-b.js), the thin analyzer
(scripts/analyze-streakfree-b.js, which imports the reused
gatediseng analyzer for the judged (c) and adds an independent (c)
for the cross-check, the (e*) rule carried verbatim, the (F)
fallback clause below, the variant first-firing, the screen
classification, the still-collapsing exclusion, and the pilot
verdict), the evidence file, and the corpora
(evidence/2026-11-03/sim-streakfree-b-screen.jsonl / *-screen.log,
*-tracer.jsonl / *-summary.json / *-sweep.log / *-detcheck.log).
The gatecover tracer (scripts/trace-gatecover-b.js), the
gatediseng analyzer (scripts/analyze-gatediseng-b.js), and
scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited. This worker does NOT push, bump versions, verify
live, merge, or rebase — the coordinator lands the branch. This
run does NOT deploy (e*) and does NOT deploy the variant (v*):
a GO here lands a policy/instrument file + evidence ONLY.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng
sensor (e*) itself — it is a policy-side sim instrument, not a
game system; no canon is invented for it. docs/PRESERVATION.md
(food ladder) is adjacent only, not the sensor. This arm invents
no game system: it measures would-fire overlays on existing
evening trajectories.

## Background (read, never re-litigated, never re-judged)

Read before judging: evidence/2026-11-03/
sim-sensorresupply-b-prereg.md and sim-sensorresupply-b.md. The
re-supply run on the current base yielded 8 fresh collapsing
seeds and 16 survivors, verdict PILOT-NO-GO on exactly ONE leg:
the TIE (lead_e >= lead_c on ALL traced collapsing seeds), 7/8,
sole failure seed 82127 (E2-cliff, (e*) fires day 23, lead 0,
while (c) fires day 20). Cost passed with ZERO margin (4/16 =
25% exactly). Do NOT re-screen, pool, or re-score the resupply
supply: its 8 collapsing + 16 survivors are reference only. The
judged band of this run must be FRESH (below).

Rule (e*) verbatim, carried from the resupply prereg: S = first
evening of the current disengaged stretch; peak(D) = max pantry
over S..D in the stretch; falls(D) = count of evenings t in
(S..D] with pantry(t) < pantry(t-1), cumulative not
consecutive; fire at FIRST evening D in the stretch with D > S,
D >= 8, disengaged, hungryStreak(D) >= 1, where (E1) falls(D)
>= 2 AND pantry(D) <= 0.90*peak(D), or (E2) pantry(D) <=
0.65*peak(D). Rule (c) is the old stand-down+trend rule from the
same prereg (S = first evening of the current disengaged
stretch; D > S, D >= 8, three consecutive falls ending at D with
D-3 >= S, and pantry(D) <= 0.90*pantry(S)).

## Step 1 — bounded diagnostic on seed 82127 (no rule change yet)

Question: on seed 82127, what resets hungryStreak? Its recorded
streak sat at 0 for four evenings (days 19-22) while the pantry
drained 10,900 -> 2,750 (day 16 pantry 10,900; 17: 10,900; 18:
9,700; 19: 8,300; 20: 6,400; 21: 4,500; 22: 2,750; 23: 0, with
streak 0, 1, 2, 0, 0, 0, 0, 1 across days 16-23, from the resupply
tracer corpus evidence/2026-11-03/
sim-sensorresupply-b-tracer.jsonl).

Answer, from the code path that writes hungryStreak and the
tracer values: the streak is INTAKE-based, not pantry-based.
src/js/game.js (end-of-day meal loop) sets, once per day,
pg.hungryStreak = anyStarving ? (pg.hungryStreak || 0) + 1 : 0,
where anyStarving is true iff at least one living, non-player,
non-fasting villager's villagerMealDay return satisfies ate <
0.6 * needBase, with needBase = kcalPerDay (default 2000) halved
while a voted half-ration is in force. ANY day on which no
villager under-eats by that definition resets the streak to 0,
however fast the store is draining. The tracer reads
progState().hungryStreak exactly as the sensor does, so the
day-19-22 zeros are not an instrument read issue.

Verdict on the reading: CORRECT GAME BEHAVIOR under the streak's
own definition. Days 19-22 the villagers still ate at least 60%
of need each day (the store was shrinking because draws
exceeded hauls, but rations remained adequate until the store
hit 0 on day 23, when streak returns to 1 and two people starve
that evening). A falling store is not, by this definition,
hunger; hunger is someone actually under-eating. The same
fragility is visible earlier on this seed: streak 1, 2 on days
11-12 resets to 0 on day 13, and streak 1 on day 15 resets to 0
on day 16 — a single adequately-fed day clears the streak.
Consequence beyond the sensor, noted not acted on: the shipped
hunger-depth throttle exemption (hungryStreak >= 3) likewise
triggers only on actual under-eating stretches, never on a
falling store alone; a village can drain its store to zero
without ever tripping it, as 82127 does until day 23.

## The streak-gate decision (explicit, fixed here, before judging)

DECISION: KEEP the streak gate in (e*) AND ADD a streak-free
fallback clause (F). Neither "keep the gate and accept a
0-streak collapse beats it" nor "drop/weaken the gate" is taken:
dropping the gate would ungate E1/E2 outright and, with cost
already exactly at its bar on the resupply (4/16), would be the
highest-cost option; keeping the gate alone re-runs the known
82127 failure shape. The fallback is deliberately NARROWER than
ungated E1 (one more fall required, a stricter pantry fraction)
so that it fires on sustained, material store falls without
needing anyone to have under-eaten, while adding as little
survivor firing as possible. Cost is re-proved in full by the
COST leg below; any earlier/more-frequent firing must pass it.

## The variant (v*) — EXACT text (fixed here, before judging)

Variant (v*) = (e*) OR (F), first-firing wins. (e*) is carried
verbatim above, streak gate included. The fallback clause (F)
verbatim:

  S = first evening of the current disengaged stretch;
  peak(D) = max pantry over S..D in the stretch; falls(D) =
  count of evenings t in (S..D] with pantry(t) <
  pantry(t-1), cumulative not consecutive; fire at FIRST
  evening D in the stretch with D > S, D >= 8, disengaged,
  falls(D) >= 3 AND pantry(D) <= 0.80*peak(D), with NO
  hungryStreak condition.

Variant first-firing: stretches are scanned in order; within a
stretch the variant fires at the earliest of the (e*) firing
day and the (F) firing day in that stretch; the first stretch
with any firing wins. The variant's clause is reported per
traced collapsing seed as E1 / E2 / F / E*-via-F-early (the
firing clause, with the (e*) day also reported when (F) fires
earlier than (e*)).

Worked reference (NOT a judged seed of this run — 82127 is
reference only): S = day 16 (pantry 10,900); falls: day 17: 0
(flat), day 18: 1, day 19: 2, day 20: 3 with pantry 6,400 <=
0.80*10,900 = 8,720, so (F) fires day 20 — tying (c)'s day-20
firing (lead 3, vs (e*)'s day-23 lead 0). (F) does NOT fire day
19 (falls 2 < 3). This worked example is a design check on the
clause text, not a judged leg: this run judges only its fresh
band.

## Fresh band (fixed here, BEFORE any judged leg)

Seeds 83001-83200 inclusive (200 seeds), 30d competent, screened
via the verbatim gatecover tracer (screen tool, below), one
node process per seed, each line appended to
evidence/2026-11-03/sim-streakfree-b-screen.jsonl, in seed order.
FRESHNESS, VERIFIED: 83001-83200 is interval-disjoint from
EVERY consumed sensor band listed in the resupply prereg —
79xxx screen, 767xx confirm band, 522 pilot subset, 80001-80024,
81001-81056, 82001-82200 — and shares no seed with the resupply
supply (82032, 82077, 82088, 82120, 82127, 82148, 82166, 82177)
or its survivor sample (82001-82016). Lower bound 83001 exceeds
every consumed band's upper bound (82200); no interval overlaps
any listed band. No seed is added, dropped, or substituted
mid-run. No cherry-picking: the screen runs the full band, and
Stage-2 tracer legs run on the full screened candidate set plus
the fixed survivor sample defined below. Checkpoint corpora
inside the worktree (evidence/2026-11-03/
screen-tmp-streakfree-b/), NOT /tmp — a prior run lost /tmp
checkpoints on a runtime restart.

## Definitions (fixed here, BEFORE any judged leg)

- COLLAPSING DEFINITION, WINDOW-INCLUSIVE (carried verbatim
  from the resupply prereg, unchanged): a seed is collapsing
  iff endReason is 'village-lost' AND at least one death has
  cause 'starvation', within the 30d window. A loss ON the
  horizon day (daysAlive == 30) counts. Reference day = first
  starvation death day. The thin analyzer computes collapsing
  from this judged definition (endReason + first starvation day
  from the reused analyzer's death scan) and reports any
  divergence from the reused analyzer's collapsed flag loudly;
  a divergence is a substrate finding, never a silent
  redefinition.
- Survivor = survived the full 30d (daysAlive == 30, endReason
  not 'village-lost').
- Other outcomes (lost before 30d with NO starvation death, or
  any other non-survivor end) are neither collapsing nor
  survivors: reported seed-by-seed, count toward neither judged
  denominator, and do not fill either count.
- Lead = reference day - first firing day. A collapsing seed
  with NO firing has no lead and fails outright; for
  lead-vs-(c) comparisons, no-fire counts as negative infinity
  (worse than any firing).
- Tracer/screen verification: rows == daysAlive on every leg. A
  leg failing verification is re-run once and the retry
  reported loudly; a seed is never judged on a mismatched row
  count.
- Screen-vs-tracer agreement: every tracer leg's membership
  (collapsing / survivor / other) is compared against its screen
  classification and reported per leg. Disagreements are handled
  ONLY by the still-collapsing rule and the survivor-drift rule
  below — never by re-sampling, substitution, or redefinition.

## Screen tool (fixed here, BEFORE any judged leg)

The screen tool is the VERBATIM gatecover tracer
(scripts/trace-gatecover-b.js), reused read-only: it runs
competent 30d and its JSON line reports endReason, daysAlive,
and the full deaths list with causes — exactly the fields the
candidate rule reads. Invocation per seed, verbatim from the
prior confirms:
POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 DAYS=30 SEEDS=<seed> node scripts/trace-gatecover-b.js
(the seven non-gate flags the tracer forbids at 1 are left unset,
which satisfies its FATAL checks). The screen corpus is NOT the
judged corpus: judged legs run on the tracer corpus only
(below). The screen rate (screened collapsing / 200) is reported
honestly alongside the verdict; it is a band property, not a
rate claim.

## STAGE 1 — screen + GO bar (fixed here)

STAGE-1 GO BAR: screened collapsing seeds >= 4. If the screen
yields < 4 collapsing seeds, the verdict is INSUFFICIENT-DATA
and the run STOPS: no Stage 2, no judged legs, no fallback band,
no top-up screen, no re-scored bar. The screen is reported
honestly in full (collapsers found with their loss/starvation
days, survivors, other outcomes, starvation-death counts). If
the screen yields >= 4 collapsing seeds, the run proceeds to
Stage 2.

## STAGE 2 — survivor sample + tracer legs (fixed here; only if Stage 1 GO)

The survivor sample is the FIRST 16 screened survivors in seed
order (the first 16 seeds in 83001-83200 order whose screen
classification is survivor). If the screen yields fewer than 16
survivors, the sample is all of them, and the Stage-2 count gate
below decides the verdict. The sample is fixed by seed order
alone — never by firing, pantry, or any outcome of either rule.
Tracer legs are VERBATIM gatecover tracer re-runs (same
invocation as the screen) on ALL screened collapsing candidates
PLUS the sampled survivors, one node process per seed, each line
appended to evidence/2026-11-03/sim-streakfree-b-tracer.jsonl.
Judged legs run on the tracer corpus only, never on screen lines.
- STILL-COLLAPSING RULE (carried verbatim): a screened
  collapsing candidate whose tracer line is NOT collapsing is
  EXCLUDED by this pre-registered rule and reported by seed with
  its tracer outcome. It is NEVER counted as a rule failure.
  The judged collapsing denominator is the still-collapsing
  (traced) count.
- SURVIVOR-DRIFT RULE (carried verbatim): a sampled survivor
  whose tracer line NEWLY collapses is membership-changing
  drift: the verdict is INSUFFICIENT-DATA, with the seed named.
  It does not join the collapsing denominator mid-run, and no
  replacement survivor is sampled.
- FULL POLICY OBJECT RULE (carried verbatim): no new probe
  driver is written; the reused tracer builds its policy as
  Object.assign({}, competent, {daily wrapper calling
  competent.daily}) and passes it to runDays, and
  sim-harness.js calls policy.setup, policy.upkeep, and
  policy.daily — the FULL policy object, never a bare {daily}.

## STAGE 2 — judged legs + GO bars (fixed here, carried VERBATIM from the resupply prereg, with (v*) in place of (e*))

GO requires ALL of the following, on the TRACED legs:
- COUNT GATE: traced still-collapsing >= 4 AND traced survivors
  >= 12. If either count is below its bar, the verdict is
  INSUFFICIENT-DATA — do not lower bars, do not screen extra
  seeds to fill the count, do not run an extra band.
- FIRE LEG: variant (v*) fires on ALL traced collapsing seeds.
- TIE LEG: lead_variant >= lead_c on ALL traced collapsing
  seeds.
- STRICT LEG: lead_variant > lead_c on >= 50% of traced
  collapsing seeds.
- LEAD-ONE LEG: lead_variant >= 1 on >= 75% of traced collapsing
  seeds.
- COST LEG: variant (v*) fires on <= 25% of traced survivors.
- CROSS-CHECK LEG: this arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's (c)
  first-firing on ALL tracer legs. Any mismatch =
  INSUFFICIENT-DATA (loud failure, not a re-score). This is the
  resupply's two-implementation form of the cross-check.
- TRACER LEG: tracer verification rows == daysAlive on every
  tracer leg (after at most one re-run per leg).
Verdict words (judged exactly against this header):
- PILOT-GO: Stage 1 GO AND Stage-2 count gate holds AND all legs
  hold. The (v*) shape survives a fresh supply on the current
  base; it does NOT deploy (e*) or (v*), and no deploy claim may
  cite this pilot alone. A GO lands a policy/instrument file +
  evidence ONLY.
- PILOT-NO-GO: Stage 1 GO and count gate hold but any judged leg
  fails, with the failing leg named. The shape does not advance
  on this evidence.
- INSUFFICIENT-DATA: Stage 1 screen < 4 collapsing, Stage-2
  count gate fails, survivor-drift membership change, cross-check
  mismatch, or tracer verification failure unrepairable by re-run
  — with the failure stated. No leg is re-scored, no margin
  relaxed, no seed substituted, no clause redefined mid-run.
Secondary (reported, NOT judged): per-seed clause (E1/E2/F) and
firing days for both rules on traced collapsing seeds; mean
lead_variant vs mean lead_c (with the warning that means mislead
when coverage differs); traced collapsing seeds with
lead_variant == 0 (death-knell firings, named even on a GO);
(c) firing rate on traced survivors for context; the (c)-vs-(v*)
survivor overlap on the traced survivors; screen-vs-tracer
membership agreement per leg; the screen rate (screened
collapsing / 200) with the screened collapsing seeds named even
when a gate fails; determinism spot-check (3 legs re-run
verbatim, first/middle/last still-collapsing in seed order if
>= 3 exist, else first 3 tracer legs) and tracer-vs-screen
byte-equality, both reported as substrate findings, judged legs
run on the tracer lines.

## Sense test (fixed here)

Read transcripts around variant firing evenings on traced
collapsing seeds — at least 2 collapsing firing evenings when at
least 2 traced collapsing firings exist (otherwise all firing
collapsing evenings available, with the shortfall stated) —
quote >= 3 lines, and judge in plain words whether the warnings
read as the village noticing in time, or as a silent cliff /
death-knell. A warning that lands on a silent evening, or
alongside a death, is reported as such even on a GO. The
confirm2 sense framing constraint travels: a future deploy must
frame (v*) as the village store's fall, never as personal
hunger.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any screen or judged leg).
STEP 2 — TOOLS + PROOF (new proof test
scripts/test-streakfree-b.js; pure, synthetic series only, NO
judged seeds — synthetic seed 999002 only — run green after the
prereg commit and before any judged application; it proves the
(e*) rule, the (F) clause (including the 82127-shape worked
example as a SYNTHETIC series, not the judged seed), the variant
first-firing, the window-inclusive collapse derivation, the
screen classification, the still-collapsing exclusion, and the
pilot verdict logic; the reused proof tests
test-gatediseng-b.js (21/21) and test-gatediseng-confirm-b.js
(11/11) are also re-run green on current base before judging).
STEP 3 — STAGE 1 SCREEN (full 83001-83200 band fresh via the
verbatim tracer; verify rows == daysAlive each; classify every
seed; apply the Stage-1 GO bar).
STEP 4 — STAGE 2 TRACER LEGS (only if Stage 1 GO; verbatim
tracer re-runs on all screened collapsing candidates + the
first-16 survivor sample; verify rows == daysAlive each; apply
the still-collapsing rule and the survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (v*) via thin analyzer,
cross-check, leads, verdict judged exactly against this header;
wall numbers from the traced legs, 30d limit stated).
STEP 6 — SENSE TEST (firing-evening transcripts, >= 3 quoted
lines, plain-words judgment).
STEP 7 — EVIDENCE (evidence/2026-11-03/sim-streakfree-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same reasoning
as the resupply prereg: this arm changes NO game code, runs NO
lever, and its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening series),
not panel metrics. The tables are reported directly in the
evidence file instead, on identical seeds and identical
trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins. NO
wall movement is claimed. What is reported from the traced legs:
survival (seeds survived / legs, median and max days alive),
wave reach, traced collapsing-seed count, and national / table /
wins as NOT REACHED IN WINDOW (expected 0 — late-game states
with no fields in this window, reported as such, not as a rate
claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen from
its recent high"), never stand-down-anchored — per the pilot's
metric review, (e*) can in principle fire while pantry is still
above its stand-down level. This run does NOT deploy (e*) or
(v*) and writes no deploy copy. Any future (v*) deploy must
also frame the warning as the village store's fall, not personal
hunger (confirm2 sense framing constraint). A GO here lands a
policy/instrument file + evidence ONLY, and no deploy claim may
cite this pilot alone.

## Attribution limits (stated before judging)

- Evening snapshots only: (v*) reads evening pantry/gate/streak
  values. Intraday flicker is not measured and cannot change a
  would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days are
  computed on trajectories as run. A real (v*) rule could change
  villager behavior and therefore later evenings; whether it
  would have saved any village is unmeasured and is not claimed.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs
  unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  PILOT-GO here is shape survival on a fresh supply, not a
  deploy claim, and no pooling with prior runs is used to
  strengthen it — screened collapsing seeds here are fresh
  villages counted in this run only.

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run,
never to this one.)
