# sim-verifyfield-b — VERIFICATION-FIELD PREREGISTRATION (committed BEFORE any judging in this run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2330Z,
axis food-economy, arm sim-verifyfield-b. Worktree
sim-verifyfield-b, branch sim-verifyfield-b. This arm changes NO
game code, flips NO policy default, edits NO existing script or
policy file, changes NO gate or price. New files only, all named
*-verifyfield-b.*: this prereg, the proof test
(scripts/test-verifyfield-b.js), and the evidence file
(evidence/2026-11-03/sim-verifyfield-b.md). The tracer corpus
(evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl), the
cost analyzer (scripts/analyze-streakfree-cost-b.js), the
gatediseng analyzer (scripts/analyze-gatediseng-b.js), and the
streakfree analyzer (scripts/analyze-streakfree-b.js) are REUSED
VERBATIM, read-only, never edited. This worker does NOT push,
bump versions, verify live, or merge — the coordinator lands the
branch. This run does NOT deploy (e*), (v*), or (v**): a verdict
here lands an instrument decision + evidence ONLY, and no deploy
claim may cite this run alone.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng
sensor (e*) itself — it is a policy-side sim instrument, not a
game system; no canon is invented for it. docs/PRESERVATION.md
(food ladder) is adjacent only, not the sensor. This arm invents
no game system: it re-judges would-fire overlays on an existing
evening corpus.

## Background (read, never re-litigated)

Run fleshout-loop-b-20261103T2130Z, arm sim-streakfree-cost-b
(evidence/2026-11-03/sim-streakfree-cost-b.md, landed to master
as e483747cc, ship tip 23f71b7f4), judged variant (v**) =
(e**) OR (F), (e**) = (e*) with the E1 envelope tightened from
0.90 to 0.85 peak, (F) carried verbatim, (c) carried verbatim
(full definitions in evidence/2026-11-03/
sim-streakfree-cost-b-prereg.md, carried here by reference and
not redefined). That run's verdict was INSUFFICIENT-DATA on one
ground only: tracer verification rows == daysAlive failed on 2
of 28 legs — 83373 (rows 19 vs daysAlive 20) and 83377 (rows 25
vs daysAlive 26) — on the tracer leg, the single allowed
re-run, and screen re-runs, deterministically. Its metric
review item 1 left exactly one question for this run: settle,
BEFORE judging, whether verification compares rows to
daysAlive, to gameDays, or exempts the loss day explicitly.
This run answers that question and re-judges (v**) on the
existing 28-leg tracer corpus. It does NOT re-screen 200
seeds, does NOT open a fresh band, and does NOT substitute any
leg: the judged corpus is the 2130Z corpus below, whole.

## STEP 1 — THE SETTLED VERIFICATION FIELD (decided here, before judging)

DECISION: verification compares rows to daysAlive WITH a
loss-day exemption, and gameDays is NOT a verification field.
A leg verifies iff ALL of the following hold:

- (V1) its rows are contiguous in loopDay, 1..N with no gap
  (loopDay is the policy.daily call count — the tracer's own
  row index, scripts/trace-gatecover-b.js);
- (V2) N == daysAlive, OR (loss-day exemption) endReason is
  'village-lost' AND N == daysAlive - 1;
- (V3) for an exempted leg, the exemption is corroborated, not
  assumed: the series must end at the game clock
  (gameDays == N on that leg) and its classification
  (endReason + first starvation day) must be stable across the
  2130Z screen, tracer, and re-run lines.

RATIONALE, from tracer semantics (not from which seeds fail):

1. What a row IS: the tracer pushes exactly one row per
   policy.daily call, in loopDay order
   (trace-gatecover-b.js: rows.push inside the daily wrapper).
   A complete evening series is therefore a contiguous
   loopDay 1..N series. Contiguity (V1) is the real
   completeness check; any field comparison that ignores it
   could pass a gapped series.
2. What daysAlive IS: runDays' `days` return
   (scripts/sim-harness.js: days = day capped at the horizon).
   For a village lost on its final day, the harness counts
   that day as alive even though the village dies before that
   day's evening daily call produces a row — so N ==
   daysAlive - 1 is the EXPECTED complete count for a
   village-lost leg, not a missing row. The 2130Z finding is
   exactly this shape, and it is deterministic, not flaky:
   on all four lines for seeds 83373 and 83377 (screen,
   tracer, screen re-run, tracer re-run),
   rows == gameDays == daysAlive - 1. A rule that rejects
   the expected count for a lost village would reject every
   same-shaped loss leg forever, and would have rejected
   the two legs this run exists to judge for a reason that
   has nothing to do with the variant.
3. Why gameDays is REJECTED as the field: gameDays is NOT a
   row count. It is the scholar's game-clock day at run end
   (sim-harness.js: gameDays = Game.state.scholar.day || 0).
   On the 2130Z corpus it equals rows on all 12 collapsing
   legs, but it EXCEEDS rows on 14 of 16 complete survivor
   legs (rows 30, gameDays 31 on thirteen survivors and 32
   on 83208, whose last row itself carries gameDay 31).
   Verifying rows == gameDays would therefore falsely fail
   14 complete survivor series whose loopDay series is
   contiguous 1..30 — a strictly worse verifier than the one
   it replaces. gameDays is used only as (V3) corroboration
   on exempted loss legs, where it happens to equal N,
   showing the recorded series ends at the game clock
   rather than being truncated mid-series.
4. Why the exemption is narrow: it applies ONLY to
   village-lost legs, ONLY at exactly daysAlive - 1, and
   ONLY with (V1) contiguity and (V3) corroboration. A
   survivor leg at N == daysAlive - 1 would still FAIL
   (a survivor ran all 30 daily calls; a short survivor
   series is genuinely incomplete). No other shortfall is
   excused, and no leg is judged on a gapped series.

Rejected alternatives, stated before judging: (a) rows ==
gameDays for every leg — rejected per (3) above: it fails
14/16 survivors. (b) rows == daysAlive with no exemption —
that is the 2130Z rule; it is rejected here only because
the tracer semantics in (2) show its loss-day count is
wrong for village-lost legs, and this run's whole purpose
is to settle that question before judging. (c) Dropping
verification entirely — rejected: contiguity + the
daysAlive rule above still guards against genuinely
truncated series.

## Judged corpus (fixed here, BEFORE any judging)

Judged corpus = the 28 tracer lines in
evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl,
byte-identical in count and membership to the 2130Z summary
(evidence/2026-11-03/sim-streakfree-cost-b-summary.json,
analyzerFullCorpusDescriptiveOnly.seeds, 28 seeds). Seed
order and membership, as summarized in 2130Z:

- 12 collapsing candidates: 83230, 83248, 83263, 83272,
  83281, 83284, 83286, 83336, 83341, 83373, 83377, 83379.
- 16 survivors (first 16 screened survivors in seed order):
  83201, 83202, 83203, 83204, 83205, 83206, 83207, 83208,
  83209, 83210, 83211, 83212, 83213, 83214, 83215, 83216.
- Corpus file sha256 (recorded at prereg time):
  e4f97a2219126f7ac580fe57d011183f993dfdfbf5ec9471b224608b013b8ea5

CORPUS-IDENTITY STOP RULE: if the corpus file, when read
for judging, differs from this summary in count or
membership, STOP and report — do not re-judge on changed
data, do not substitute legs, do not pool in any other
corpus. (A changed file hash alone, with count and
membership identical, is reported as a substrate note, not
a stop, since the tracer lines carry large sayLines payloads;
membership is the judged identity.)

## GO bars — carried VERBATIM from evidence/2026-11-03/sim-streakfree-cost-b-prereg.md

Quoted verbatim (with (v**) in place of (v*), as that prereg
itself states):

> GO requires ALL of the following, on the TRACED legs:
> - COUNT GATE: traced still-collapsing >= 4 AND traced
>   survivors >= 12. If either count is below its bar, the
>   verdict is INSUFFICIENT-DATA — do not lower bars, do not
>   screen extra seeds to fill the count, do not run an extra
>   band.
> - FIRE LEG: variant (v**) fires on ALL traced collapsing seeds.
> - TIE LEG: lead_variant >= lead_c on ALL traced collapsing
>   seeds.
> - STRICT LEG: lead_variant > lead_c on >= 50% of traced
>   collapsing seeds.
> - LEAD-ONE LEG: lead_variant >= 1 on >= 75% of traced
>   collapsing seeds.
> - COST LEG: variant (v**) fires on <= 25% of traced survivors.
> - CROSS-CHECK LEG: this arm's analyzer's independent (c)
>   first-firing matches the reused gatediseng analyzer's (c)
>   first-firing on ALL tracer legs. Any mismatch =
>   INSUFFICIENT-DATA (loud failure, not a re-score). This is
>   the streakfree run's two-implementation form of the
>   cross-check.
> - TRACER LEG: tracer verification rows == daysAlive on every
>   tracer leg (after at most one re-run per leg).

TRACER LEG AS SETTLED HERE: the "tracer verification" in
that bar is read under the settled field in STEP 1 above
(contiguity + daysAlive, with the village-lost
daysAlive - 1 exemption and gameDays corroboration). The
2130Z legs need no re-run in this run: they are judged
as recorded, and any leg failing the SETTLED field would
void judging exactly as the 2130Z rule voided it — the
settlement changes which field is compared, not the
consequence of failing it. Verdict words (judged exactly
against this header):

- PILOT-GO: count gate holds AND all legs hold. The (v**)
  shape survives re-judgment on the full 28-leg corpus; it
  does NOT deploy (e*), (v*), or (v**), and no deploy claim
  may cite this run alone.
- PILOT-NO-GO: count gate holds but any judged leg fails,
  with the failing leg named. The shape does not advance
  on this evidence.
- INSUFFICIENT-DATA: count gate fails, survivor-drift
  membership change, cross-check mismatch, or settled-field
  verification failure — with the failure stated. No leg is
  re-scored, no margin relaxed, no seed substituted, no
  clause redefined mid-run.

Secondary (reported, NOT judged): per-seed clause
(E1/E2/F) and firing days for both rules on traced
collapsing seeds; mean lead_variant vs mean lead_c;
traced collapsing seeds with lead_variant == 0 (death-knell
firings, named even on a GO); (c) firing rate on traced
survivors; the (c)-vs-(v**) survivor overlap; the
2130Z descriptive-vs-judged delta (which legs change
status under the settled field — expected: only the
verification status of 83373 and 83377, and the tie leg
carrying their values).

## Primary metric, horizon, seeds, policies (fixed here)

PRIMARY METRIC: the legs above, judged jointly — GO
requires every leg to hold on the 28 judged legs; the tie
leg is the leg the 2130Z descriptive section flagged as
failing (sole miss 83248 on verified legs), and it is
judged here with the two formerly unverified legs included,
never alone. HORIZON: 30 days, the 2130Z window — the
window in which collapsing villages first starve. SEEDS:
the 28 corpus seeds above, no others, no fresh band.
POLICIES: competent only (the corpus's policy); this run
re-judges recorded trajectories, it does not re-run the
policy except for the descriptive drift check in STEP 3
below. METRIC BINDING (§14): the bars above bind this run
— a miss is NO-GO (or INSUFFICIENT-DATA where the header
says so), never re-scored against a friendlier metric
mid-run. If the metric proves wrong, it is written under
"metric review" in the evidence file and proposed for the
NEXT run.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judging).
STEP 2 — JUDGE ((c) via reused analyzer, (v**) via reused
cost analyzer, cross-check, leads, verdict judged exactly
against this header; the analyzers are run on the corpus
as recorded, with roles candidate = the 12 collapsing
candidates, cost = the 16 survivors).
STEP 3 — DESCRIPTIVE DRIFT CHECK ONLY: re-run the verbatim
gatecover tracer for seeds 83373 and 83377 on the current
master base (2 seeds) and report rows/gameDays/daysAlive
+ classification stability. These re-runs are NEVER judged
legs and NEVER enter any judged denominator; if drifted,
say so.
STEP 4 — SENSE TEST: read 2–3 firing-evening transcripts
from the corpus and give a plain-words verdict on whether
the warning would land as a village noticing its store fall.
STEP 5 — PROOF: scripts/test-verifyfield-b.js (synthetic
series + the corpus counts) green before the evidence
commit; the reused proof tests (test-streakfree-cost-b.js
24/24, test-streakfree-b.js 22/22, test-gatediseng-b.js
21/21, test-gatediseng-confirm-b.js 11/11) re-run green
before judging.
STEP 6 — EVIDENCE (evidence/2026-11-03/sim-verifyfield-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same
reasoning as the 2130Z prereg: this arm changes NO game
code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables are reported directly in the evidence file
instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported from
the judged legs: survival (seeds survived / legs, median
and max days alive), wave reach, traced collapsing-seed
count, and national / table / wins as NOT REACHED IN
WINDOW (expected 0 — late-game states with no fields in
this window, reported as such, not as a rate claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen
from its recent high"), never stand-down-anchored, and must
frame (v**) as the village store's fall, not personal
hunger. This run does NOT deploy (e*), (v*), or (v**) and
writes no deploy copy. A GO here lands an instrument
decision + evidence ONLY, and no deploy claim may cite
this run alone.

## Attribution limits (stated before judging)

- Evening snapshots only: (v**) reads evening pantry/gate/
  streak values. Intraday flicker is not measured and
  cannot change a would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days
  are computed on trajectories as run. A real (v**) rule
  could change villager behavior and therefore later
  evenings; whether it would have saved any village is
  unmeasured and is not claimed.
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game
  legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  PILOT-GO here is shape survival on re-judgment of one
  corpus, not a deploy claim, and no pooling with prior
  runs is used to strengthen it.

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
