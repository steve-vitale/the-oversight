# sim-vfrac-a — DEPLOY-FRACTION DECISION PREREGISTRATION (committed BEFORE any screen or judged leg)

Run: oversight-flesh-out-loop, run fleshout-20261104T0545Z (Loop A),
axis food-economy, arm sim-vfrac-a. Worktree sim-vfrac-a,
branch sim-vfrac-a. This arm changes NO game code, NO policy
defaults, NO gates/prices/deeds/readyDemand, NO default flip.
It is a would-fire instrument overlay only: it measures (v**)
firing days at E1 fractions 0.85 and 0.90 on identical evening
trajectories and produces a DECISION only. Deployment of any
fraction is a separate future arm. This worker does NOT push,
bump versions, verify live, or merge to master — the coordinator
lands the branch. No deploy claim may cite this decision alone.

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

## Background (read, never re-litigated, never re-judged, never pooled)

- sim-streakfree-cost-b (20261103T2130Z): (v**) on band
  83201-83400, INSUFFICIENT-DATA on a tracer verification
  failure, descriptive tie miss on seed 83248 (pantry hovering
  at 0.898 of peak).
- sim-verifyfield-b (20261103T2330Z, sibling arm): settled
  the verification field (adopted below) and re-judged the
  2130Z corpus: PILOT-NO-GO on the tie leg, sole miss 83248.
- sim-envelope-b (same 2330Z run, offline table, judging
  nothing): E1 at 0.87/0.88 identical collapsing days to 0.85
  on that corpus with earlier survivor firing; 0.90 gains two
  collapsing legs (83248- and 83272-shaped hovers).
- sim-freshband-b (Loop B 20261104T0046Z): (v**) at E1@0.85
  on fresh band 83401-83600 (200 seeds, 30d, competent):
  PILOT-GO — FIRE 9/9, TIE 9/9, STRICT 7/9, LEAD-ONE 8/9,
  COST 3/16, mean lead 6.2d vs 3.4d. Descriptively, however,
  0.87/0.88/0.90 gave IDENTICAL variant days on all 25 traced
  legs — the fraction is UNIDENTIFIABLE on that band. On the
  older 83201-83400 corpus 0.90 moved 83248 but re-opened the
  cost failure (4/15 in that corpus's cost accounting).
- sim-firenarr-deploy-b (de1271d6f, separate lane): firing-
  evening narration for (v**) is DEPLOYED in game code on
  this worktree's base. This arm does NOT re-deploy narration
  and does NOT touch game code. A read-only narration check
  is specified below; it judges no leg.
- This run judges the fraction question on FRESH legs only.
  It does NOT pool, re-score, or re-judge any prior corpus
  into any judged denominator. Older corpora are context
  only. The envelope DRAFT
  (evidence/2026-11-03/sim-envelope-next-prereg-DRAFT.md)
  judges nothing — THIS prereg binds, not the draft. Its
  "if unsettled" branch is moot: the verification field IS
  settled (see below) and is adopted here.

## (a) Fresh band — verified interval-disjoint BEFORE judging

Seeds 83801-84000 inclusive (200 seeds), 30d competent,
screened via the verbatim gatecover tracer, one node
process per seed, each line appended in seed order to
evidence/2026-11-04/screen-tmp-vfrac-a/screen.jsonl.

FRESHNESS, VERIFIED HERE: 83801-84000 is interval-disjoint
from EVERY consumed band named in the task assignment and
found in evidence filenames/dated .md files:
83201-83400, 83401-83600, and the fracchoice/firenarr
screen 83601-83800 (all three named in the assignment and
confirmed in evidence), AND from every band listed in the
freshband prereg (79xxx screen, 767xx confirm band, 522
pilot subset, 80001-80024, 81001-81056, 82001-82200,
judged band 83001-83200, resupply supply seeds 82032/
82077/82088/82120/82127/82148/82166/82177 and survivor
sample 82001-82016), AND from all other interval mentions
found in evidence/2026-11-03 and evidence/2026-11-04 .md
files (83601-83680, 89701-89707, 93301-93304, 96101-96108,
98301-98308, 98401-98408, 98501-98508, 99104-99108, and the
85xxx journey-scale seed sets). Lower bound 83801 exceeds
the upper bound of every consumed band below it (83800);
the bands above it start at 85042 or higher; no interval
overlaps 83801-84000; no seed is shared with any consumed
band. No seed is added, dropped, or substituted mid-run
except by the ONE pre-declared extension in (b) below.
No cherry-picking: the screen runs the full band, and
Stage-2 tracer legs run on the full screened candidate
set plus the fixed survivor sample defined below. If this
band had overlapped any consumed band, a different
disjoint band would have been picked HERE, before
judging — it does not overlap, so 83801-84000 stands.

## (b) Pilot gate + ONE pre-declared extension

The screen itself is the pilot-scale run (200 seeds).
If screened collapsing legs number < 12, the run extends
the screen ONCE by the next 100 contiguous seeds,
84001-84100 (verified disjoint by the same check as (a):
no consumed interval touches 84001-84100), screens them
in seed order, and then judges on the combined screened
band. No second extension, no top-up beyond +100, no
cherry-picking, no band substitution. If screened
collapsing legs number >= 12, no extension runs.
After the (single, conditional) extension, the run
judges on whatever traced still-collapsing legs exist
provided the count gates in (e) hold; if traced
still-collapsing < 4, the verdict is INSUFFICIENT-DATA
(see (e)). The extension decision is made on the
SCREENED collapsing count only, never on any firing
comparison, and is recorded in the evidence file.

## (c) Screen AND tracer on ONE base (this arm's base rule)

The base is whatever the worktree HEAD is when the screen
starts — i.e. HEAD after this prereg commit and the tools
commit, before any screen line is generated. The judging
base hash is reported in the evidence file. Screen AND
tracer BOTH run on that judging base. NEVER rebase
between screen and judgment. A sibling landing moving
master mid-run does NOT move this base and does NOT void
judging: judged numbers stand as judged on the screen
base. NO salvaged screen is used in any judged
denominator, NO inherited corpus (including the
83401-83600 corpus and the adopt tracer corpus) enters
any judged denominator, and NO leg is judged on a line
generated on a different base. This worker does NOT
merge to master (merging touches the main tree, which
workers never touch); the coordinator lands via
--ff-only. If proofs fail after the coordinator's
landing rebase, that failure is reported LOUDLY and the
judged numbers still stand as judged on the screen base.

## (d) The SETTLED verification field (adopted from sim-verifyfield-b)

ADOPTED VERBATIM from sim-verifyfield-b, as carried in
the freshband prereg: a leg verifies iff rows are
contiguous in loopDay 1..N AND (N == daysAlive OR
village-lost with N == daysAlive - 1 and gameDays == N).

Settlement rationale, quoted from sim-verifyfield-b via
the freshband prereg: "A row is one policy.daily call,
in loopDay order (scripts/trace-gatecover-b.js).
Contiguity 1..N is the real completeness check.
daysAlive is runDays' day count (scripts/sim-harness.js).
For a village lost on its final day, the harness counts
that day even though the village dies before that day's
evening daily call produces a row — so N == daysAlive - 1
is the EXPECTED complete count for a village-lost leg,
not a missing row. gameDays is REJECTED as the field:
it is the scholar's game-clock day at run end
(sim-harness.js: gameDays = Game.state.scholar.day || 0),
not a row count. On the verifyfield corpus it equals
rows on all 12 collapsing legs but EXCEEDS rows on 14
of 16 complete survivor legs (rows 30, gameDays 31 on
thirteen survivors and 32 on 83208). Verifying rows ==
gameDays would falsely fail 14 complete survivor series
— a strictly worse verifier. gameDays serves only as
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

## (e) The variant, the fraction comparison, and the count gates

Variant (v_f) = (e_f) OR (F), first-firing wins, EXACTLY
as fixed in the streakfree-cost prereg, with ONLY the E1
envelope fraction parameterized (f = 0.85 or 0.90):
(e_f) is (e*) with E1 at fraction f; (F) and (c) carried
verbatim.

  S = first evening of the current disengaged stretch;
  peak(D) = max pantry over S..D in the stretch;
  falls(D) = count of evenings t in (S..D] with
  pantry(t) < pantry(t-1), cumulative not consecutive.
  (e_f): fire at FIRST evening D in the stretch with
  D > S, D >= 8, disengaged, hungryStreak(D) >= 1,
  where (E1) falls(D) >= 2 AND pantry(D) <= f x
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
  the (e_f) firing day and the (F) firing day in that
  stretch (tie goes to (e_f)); the first stretch with
  any firing wins.
  Collapsing = village-lost WITH a starvation death
  within the 30d window (a loss ON the horizon day
  counts). Reference day = first starvation death day
  from the deaths list (game-clock day basis, carried
  uniformly; firing days are loopDays — the day-basis
  mismatch noted in freshband metric review 1 is stated
  here BEFORE judging, not discovered after).
  Lead_f = reference day - first-firing day of (v_f);
  no-fire counts as negative infinity for all lead
  comparisons. A survivor carrying a starvation death
  in its deaths list while the village survives stays a
  survivor (collapsing requires village-lost), and such
  firings are reported split out descriptively.

COUNT GATES (judged exactly as written; failure =
INSUFFICIENT-DATA, never a relaxed bar):
- Traced still-collapsing >= 4 AND traced survivors
  >= 12. Below either = INSUFFICIENT-DATA.
- CROSS-CHECK: this arm's analyzer's independent (c)
  first-firing matches the reused gatediseng analyzer's
  (c) first-firing on ALL tracer legs. Any mismatch =
  INSUFFICIENT-DATA.
- TRACER: verification under the settled field (d) on
  every tracer leg after at most one re-run per leg.
  Unrepairable failure = INSUFFICIENT-DATA.
- STILL-COLLAPSING RULE: a screened collapsing candidate
  whose tracer is NOT collapsing is EXCLUDED and
  reported by seed, never a rule failure.
- SURVIVOR-DRIFT RULE: a sampled survivor whose tracer
  NEWLY collapses = INSUFFICIENT-DATA, seed named, no
  replacement, no denominator join.
- SURVIVOR SAMPLE: FIRST 16 screened survivors in seed
  order over the FINAL screened band (after any (b)
  extension), fixed by seed order alone, never by firing,
  pantry, or any outcome of either rule. If the screen
  yields fewer than 16 survivors, the sample is all of
  them, and the count gate decides.

## (f) PRE-REGISTERED DECISION PROCEDURE (verbatim in substance)

Primary metric: the head-to-head fraction comparison on
the traced still-collapsing legs, with the cost leg as a
veto on the 0.90 branch. For each traced still-collapsing
leg, compute lead_85, lead_90, and lead_c (fixed across
fractions). Define per leg:
- wins90: lead_90 > lead_85 (a lead improvement; since
  lead_c is fixed per leg, a lead improvement is at
  least as good on tie (lead >= lead_c), strict
  (lead > lead_c), and lead-one (lead >= 1), and can
  flip any of them from false to true, never true to
  false — the per-dimension flip counts are reported
  descriptively alongside the lead counts so the
  tie/strict/lead wording is honored in full).
- wins85: lead_85 > lead_90 (symmetric).
- identical: lead_90 == lead_85 (including both no-fire).
Cost: cost_f = (traced survivors with (v_f) firing) /
(traced survivors), reported for f = 0.85 and f = 0.90.

DECISION (applied in this order, on this band only,
never pooled with older corpora):
1. If 0.90 beats 0.85 on tie/strict/lead on >= 3
   collapsing legs (wins90 >= 3) AND wins90 > wins85
   AND cost_90 <= 25%, decision = 0.90.
2. Else if 0.85 beats 0.90 on >= 3 collapsing legs
   (wins85 >= 3) AND wins85 > wins90, decision = 0.85
   (measured direction: 0.85 beats 0.90 on >= 3 legs).
3. Else if wins90 >= 3 but cost_90 > 25%, decision =
   0.85 by COST VETO (recorded explicitly as a cost
   veto, not as measured superiority and not as a
   tie-break).
4. Otherwise — identical legs, or the difference is
   < 3 legs, or wins90 == wins85 — decision = 0.85 by
   the minimal-threshold tie-break (fewest extra
   firings; 0.90's only known gain was on the old
   corpus where it re-opened cost failure) — recorded
   explicitly as a tie-break decision, NOT as measured
   superiority.

Verdict words for this arm: DECISION 0.90 (branch 1);
DECISION 0.85 MEASURED (branch 2); DECISION 0.85
COST-VETO (branch 3); DECISION 0.85 TIE-BREAK (branch 4);
INSUFFICIENT-DATA (count gates fail, survivor-drift
membership change, cross-check mismatch, or tracer
verification failure unrepairable by re-run — failure
stated). No leg is re-scored, no margin relaxed, no seed
substituted, no clause redefined mid-run. Older corpora
are context only and never enter any denominator.

## Primary metric, horizon, seeds, policies (fixed here)

PRIMARY METRIC: the decision procedure in (f), on the
traced still-collapsing legs plus the cost leg on the
traced survivors. HORIZON: 30 days, the same early
window as the streakfree and freshband runs — the window
in which collapsing villages first starve (days 15-29 on
prior bands) and in which the sensor must warn in time;
a longer window would mix in late-game states this
instrument does not measure. SEEDS: fresh band
83801-84000 (screen), plus conditional extension
84001-84100 per (b); tracer legs on screened candidates
+ first 16 screened survivors. POLICIES: competent only,
with COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, verbatim tracer invocation:
POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1 DAYS=30 SEEDS=<seed>
node scripts/trace-gatecover-b.js (the seven non-gate
flags the tracer forbids at 1 are left unset, which
satisfies its FATAL checks). METRIC BINDING (§14): the
metrics above bind this run — a miss is the verdict the
header says it is, never re-scored against a friendlier
metric mid-run. If the metric proves wrong, it is
written under "metric review" in the evidence file and
proposed for the NEXT run.

## Descriptive reporting (never judged, never pooled into the decision)

- Per-fraction legs on the traced collapsing legs:
  fire, tie, strict, lead-one, mean lead at 0.85 and at
  0.90, with lead_c fixed — the same table shape as
  freshband, at both fractions.
- Per-dimension flip counts: legs where 0.90 flips tie /
  strict / lead-one relative to 0.85 (either direction).
- Per-seed variant days at 0.85 and 0.90 (identical-days
  check, as in freshband's descriptive envelope table).
- Knife-edge visibility: for EVERY E1 firing on traced
  legs at either fraction, the pantry/peak fraction at
  firing, so a sub-0.001-margin firing is visible as
  fragile rather than read as robust support.
- Survivor firings split by "any starvation death in the
  leg" as descriptive context for the cost leg.
- Wall numbers from the traced legs with the 30d limit
  stated (NOT wall movement): survival, median/max days
  alive, wave reach, traced collapsing count, national /
  table / wins as NOT REACHED IN WINDOW (expected 0 —
  late-game states with no fields in this window,
  reported as such, not as a rate claim).

## Narration read-only check (no game-code change, no judged leg)

The deployed firing-evening narration (de1271d6f) is
checked READ-ONLY: read its game.js diff and confirm
(1) it touches only _firenarrEvening plus one endDay
call, (2) it writes no pantry, streak, gate, price, deed,
readiness, or throttle state — its only game-visible
effect is say() plus plain-JSON _firenarr bookkeeping on
the village object, (3) its E1 constant (0.85) matches
the currently judged value but is a narration constant,
not the instrument rule, and (4) any interaction is
flagged: the read-point difference (post-meal endDay
store/streak vs the tracer's pre-sleep policy.daily
read) means a narration evening may differ by a day
from the instrument firing evening on the same
trajectory — that is an expected read-point difference,
not a rule change; the escalation line is extra
narration after a first firing, not a second (v**)
firing; and if a future arm changes the fraction, the
narration constant must move with it (future arm's job,
not this one's). Disabling narration to re-prove
trajectory identity would require a game-code change
this arm forbids, so no new identity experiment is run
here; the firenarr deploy's own 8/8 trajectory-identity
pilot is cited as the existing evidence. Any interaction
found is flagged in the evidence file; none changes any
judged number, because judged numbers come from tracer
rows (pantry/streak/gate reads off Game state), never
from transcript lines.

## Sense test (fixed here)

Read firing evenings from traced collapsing legs (tracer
row sayLines for the firing day and the following
evening, to catch the post-meal narration offset noted
above), >= 3 quoted lines, plain-words judgment whether
the warning would read as a person noticing the store
falling. Framing constraint carried: a future deploy
must frame (v**) as the village store's fall, never as
personal hunger, and must SAY something on the firing
evening. With narration deployed, the sense test also
notes whether the deployed line actually appears on or
just after the instrument firing evening.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any screen or judged
leg).
STEP 2 — TOOLS + PROOF (new analyzer
scripts/analyze-vfrac-a.js; new proof test
scripts/test-vfrac-a.js; pure synthetic series only, NO
judged seeds; proof green after the prereg commit and
before any judged application; reused proof tests
test-freshband-b.js (70/70), test-streakfree-cost-b.js
(24/24), test-gatediseng-b.js (21/21),
test-gatediseng-confirm-b.js (11/11) re-run green on
the judging base before judging; reused files verified
untouched — git status shows no modification to reused
files).
STEP 3 — STAGE 1 SCREEN (full 83801-84000 band fresh via
the verbatim gatecover tracer on the judging base;
verify each line under the settled field; classify
every seed; apply the (b) pilot gate / extension).
STEP 4 — STAGE 2 TRACER LEGS (verbatim tracer re-runs
on all screened collapsing candidates + the first-16
survivor sample on the SAME base; verify under the
settled field each; apply the still-collapsing rule and
the survivor-drift rule).
STEP 5 — JUDGE ((c) via reused analyzer, (v_0.85) and
(v_0.90) via this arm's analyzer, cross-check, leads,
decision judged exactly against (f); wall numbers from
the traced legs, 30d limit stated).
STEP 6 — SENSE TEST + NARRATION READ-ONLY CHECK
(firing-evening transcripts, >= 3 quoted lines,
plain-words judgment; narration diff read, interactions
flagged).
STEP 7 — EVIDENCE (evidence/2026-11-04/sim-vfrac-a.md,
with a metric review section; any revision applies to
the run AFTER that one, never to itself).

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
decision.

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored
("fallen from its recent high"), never stand-down-
anchored, and must frame (v**) as the village store's
fall, never as personal hunger. This run does NOT
deploy (e*), (v*), or (v**) and writes no deploy copy.
The deployed narration's lines already follow this
framing; this run does not re-tune them.

## Metric review

(To be completed in the evidence file after judging.
Doubts about this header go there, and any revision
applies to the NEXT run, never to this one.)
