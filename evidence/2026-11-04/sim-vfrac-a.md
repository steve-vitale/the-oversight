# sim-vfrac-a — DEPLOY-FRACTION DECISION (finisher-completed)

Run: oversight-flesh-out-loop, run fleshout-20261104T0545Z (Loop A),
axis food-economy, arm sim-vfrac-a. Worktree sim-vfrac-a,
branch sim-vfrac-a. This arm changes NO game code, NO policy
defaults, NO gates/prices/deeds/readyDemand, NO default flip.
It is a would-fire instrument overlay only. Deployment of any
fraction is a separate future arm. No deploy claim may cite
this run alone — and this run reaches no decision at all
(see verdict).

CONTINUATION NOTE: the 0545Z coordinator timed out (7200s)
with this arm at screen 298/300 and no tracer stage. A
finisher completed it on the SAME judging base (see below):
screen seeds 84099-84100, extension classification, all 31
tracer legs, the 83976 re-run, judging, sense test, and this
evidence. Nothing was re-based before judging. The judging
base is the worktree HEAD at screen start and at judging:
`71821b087` (tools commit; prereg `f3f82451c` beneath it).
Screen AND tracer both ran on that base, per prereg §(c).

## VERDICT: INSUFFICIENT-DATA

Sole cause: tracer verification failure on seed 83976,
unrepairable by the one allowed re-run (the re-run
reproduces the failure exactly). Per prereg §(d)/§(e),
that voids judging. No fraction decision is reached, no
branch (1–4) is taken, and no number below is a decision.
All other gates pass (see gates table). The descriptive
tables below judge nothing and are never pooled into any
decision.

## Prereg compliance

- Band: fresh 83801-84000 (200 seeds) + the ONE pre-declared
  extension 84001-84100 (100 seeds), 30d competent,
  `POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1`, verbatim gatecover tracer,
  one node process per seed, seed order.
- Extension decision (prereg §(b)): first-band screened
  collapsing = 9 (< 12), so the extension ran. Final
  screened band: 83801-84100, 300 seeds.
- Survivor sample (prereg §(e)): FIRST 16 screened
  survivors in seed order over the final band =
  83801-83816 (all in the first band; the first screened
  collapsing seed is 83838, so the extension does not
  touch the sample).
- No pooling: no older corpus enters any denominator.
  Older bands (83201-83400, 83401-83600, 83601-83800) are
  context only.
- Proofs re-run green on the judging base before judging:
  test-vfrac-a.js 70/70, test-freshband-b.js 70/70,
  test-streakfree-cost-b.js 24/24, test-gatediseng-b.js
  21/21, test-gatediseng-confirm-b.js 11/11. Reused files
  verified untouched (git status shows only the new
  evidence; no modification to reused files).

## Screen (Stage 1)

Final band 83801-84100, 300 seeds:

- Survivors: 285. Collapsing (village-lost WITH a
  starvation death in window): 15.
- First band 83801-84000: 191 survivors, 9 collapsing
  (83838, 83889, 83918, 83941, 83959, 83970, 83976, 83997,
  84000).
- Extension 84001-84100: 94 survivors, 6 collapsing
  (84061, 84068, 84079, 84082, 84084, 84095).
- Screen verification under the settled field §(d):
  299/300 verified. Sole miss: 83976 (village-lost,
  rows 29, daysAlive 30, gameDays 30, contiguous 1..29).
  The loss-day exemption requires N == daysAlive - 1
  (29 == 29, met) AND gameDays == N (30 != 29, FAILED).
  So the screen line is unverified, exactly as the
  settled field prescribes.

Raw screen corpus NOT committed: screen.jsonl is ~149MB
(300 lines with full sayLines) and GitHub hard-blocks
files over 100MB — committing it would break the next
ship push. Committed instead: the full 300-seed
classification (this dir, classification.json), the
compact per-seed summary
(evidence/2026-11-04/screen-summary-vfrac-a.json,
300 rows, 201KB), and the full tracer corpus below.

## Tracer (Stage 2)

31 legs, verbatim tracer on the judging base: all 15
screened collapsing candidates + the 16-seed survivor
sample. First-pass verification: 30/31.

- 83976 tracer: reproduces the screen exactly (29 rows,
  contiguous 1..29, daysAlive 30, gameDays 30,
  village-lost). Verification fails identically.
- One allowed re-run of 83976 (prereg §(e) re-run rule,
  separate file tracer-rerun-83976.jsonl/.log):
  reproduces the failure exactly (29 rows, gameDays 30).
  The failure is deterministic, not flaky. Unrepairable.
- All other 30 tracer legs verify (exact or loss-day
  exempt where applicable).

## Gates (prereg §(e), judged exactly as written)

- Traced still-collapsing >= 4: PASS (15).
- Traced survivors >= 12: PASS (16).
- Still-collapsing rule: all 15 candidates still collapse
  on tracer. Excluded: none.
- Survivor-drift rule: no sampled survivor newly
  collapses. Newly-collapsing cost legs: none.
- Cross-check (analyzer (c) vs independent (c)):
  PASS on all 31 legs, zero mismatches.
- Tracer verification: FAIL — sole failure 83976
  (screen + tracer + re-run all fail identically).
- Gates overall: FAIL on verification alone.
  Verdict: INSUFFICIENT-DATA. Decision: none (null).

## Descriptive tables (judge nothing)

Per-leg variant days and leads on traced collapsing legs
(ref = first starvation death day, game-clock basis;
firing days are loopDays — the day-basis mismatch stated
in the prereg before judging):

| seed | ref | v85 day/clause | lead85 | v90 day/clause | lead90 | (c) day | verified |
| 83838 | 25 | 19 E1-envelope | 6 | 19 E1-envelope | 6 | 20 | yes |
| 83889 | 23 | 14 E2-cliff | 9 | 14 E2-cliff | 9 | 16 | yes |
| 83918 | 30 | 23 E1-envelope | 7 | 23 E1-envelope | 7 | 24 | yes |
| 83941 | 27 | 23 E1-envelope | 4 | 23 E1-envelope | 4 | 24 | yes |
| 83959 | 24 | 8 F-fallback | 16 | 8 F-fallback | 16 | 8 | yes |
| 83970 | 14 | 13 E2-cliff | 1 | 13 E2-cliff | 1 | 14 | yes |
| 83976 | 27 | 8 F-fallback | 19 | 8 F-fallback | 19 | 8 | NO |
| 83997 | 28 | 21 E2-cliff | 7 | 21 E2-cliff | 7 | 21 | yes |
| 84000 | 19 | 21 E2-cliff | -2 | 21 E2-cliff | -2 | — | yes |
| 84061 | 15 | 13 E2-cliff | 2 | 13 E2-cliff | 2 | 13 | yes |
| 84068 | 16 | 12 F-fallback | 4 | 12 F-fallback | 4 | 12 | yes |
| 84079 | 25 | 20 E2-cliff | 5 | 20 E2-cliff | 5 | 22 | yes |
| 84082 | 7 | 22 E2-cliff | -15 | 22 E2-cliff | -15 | 23 | yes |
| 84084 | 28 | 20 E2-cliff | 8 | 20 E2-cliff | 8 | 21 | yes |
| 84095 | 19 | 19 E2-cliff | 0 | 19 E2-cliff | 0 | 19 | yes |

Aggregates at 0.85 AND at 0.90 (identical):
fire 15/15, tie 15/15, strict 9/15, lead-one 12/15,
mean lead 4.73. Identical variant days on 15/15 legs.
Per-dimension flips: tie 0/0, strict 0/0, lead-one 0/0.

Why identical: only 3 legs fire via the E1 envelope
(83838 at pantry/peak 0.776, 83918 at 0.782, 83941 at
0.824) — all far below BOTH 0.85 and 0.90, so the
threshold never binds. The other 12 fire via E2-cliff
(0.65, 9 legs) or F-fallback (0.80, 3 legs), both
fraction-independent. No E1 firing sits within 0.001
of either threshold — no fragile knife-edge firing.
The fraction is UNIDENTIFIABLE on this band, the same
shape as the freshband finding (0.87/0.88/0.90
identical there). That is descriptive context for the
NEXT run's design, not a decision here.

Cost leg (traced survivors, descriptive): 1/16 fire at
0.85 and 1/16 at 0.90 — the same leg, 83812, day 8,
no starvation death in its deaths list. Cost identical
at both fractions.

Negative-lead legs (descriptive): 84000 (lead -2: fires
day 21, first starvation day 19) and 84082 (lead -15:
fires day 22, first starvation day 7). A day-7 first
starvation death cannot be warned about by a sensor
whose earliest eligible evening is day 8 — the lead
metric is undefined-useful for very early collapses.

## Wall numbers (traced legs only, 30d limit stated)

31 traced legs: median daysAlive 30, max 30, min 15;
16 survivors, 15 village-lost; maxWaveUnlocked 2–3;
wave >= 4: 0. National / table / wins: NOT REACHED IN
WINDOW (expected 0 — late-game states with no fields
in this window, reported as such, not as a rate claim).
This is NOT wall movement.

## Sense test (prereg, >= 3 quoted lines)

Firing evenings from verified still-collapsing legs
(E1-envelope firings). The deployed narration lines:

- 83838 (instrument firing loopDay 19):
  scholar day 18: "⚠ The store has fallen from its recent
  high — the shelves are thinning." Escalation day 19:
  "⚠ The store has fallen further still from its recent
  high."
- 83918 (instrument firing loopDay 23):
  scholar day 23: "⚠ The store has fallen from its recent
  high — the shelves are thinning." Escalation day 26.
- 83941 (instrument firing loopDay 23):
  scholar day 22: "⚠ The store has fallen from its recent
  high — the shelves are thinning." Escalation day 24.

Plain-words judgment: PASS. The warning reads as a
person noticing the shelves thinning — store-fall
framing, never personal hunger, exactly as the prereg
requires. The narration lands on or within one day of
the instrument firing evening on all three legs (day
18 vs 19; same day; day 22 vs 23) — the known
read-point difference (post-meal endDay store/streak
vs pre-sleep policy.daily read), not a rule change.
Each leg shows exactly two firenarr lines (first +
escalation); the escalation is extra narration after
a first firing, not a second sensor firing.

## Narration read-only check (prereg, no game-code change)

Deploy commit de1271d6f read in full:

1. It touches only _firenarrEvening (one new method,
   +104 lines) plus one endDay call site. No other
   game.js change.
2. It writes no pantry, streak, gate, price, deed,
   readiness, or throttle state. Its only writes are
   plain-JSON _firenarr bookkeeping on the village
   object (stretch state, save-safe) plus say().
   Pantry and streak are read, never written.
3. Its E1 constant is 0.85 (FIRENARR_E1_FRACTION),
   matching the currently judged value — but it is a
   narration constant, not the instrument rule.
4. Interaction flagged (expected, not a rule change):
   the read-point difference above means a narration
   evening may differ by a day from the instrument
   firing evening on the same trajectory. If a future
   arm changes the fraction, the narration constant
   must move with it — that is the future arm's job,
   not this one's. No new identity experiment was run
   (this arm forbids the game-code change it would
   need); the deploy's own 8/8 trajectory-identity
   pilot stands as the existing evidence.

No interaction found changes any judged number: judged
numbers come from tracer rows (pantry/streak/gate
reads off Game state), never from transcript lines.

## Metric review (for the NEXT run, never this one)

1. The gameDays corroboration question. Seed 83976 is
   a contiguous, village-lost series (rows 1..29) whose
   only defect under the settled field is gameDays (30)
   exceeding rows (29). The scholar clock reads 30
   while no evening row exists for day 30 — the village
   died before that evening's daily call. Is the
   gameDays == N corroboration doing real work (catching
   truncations), or is it too narrow for exactly this
   loss-day shape? Evidence on this band: the only
   failure is this shape, and no noncontiguous series
   appeared anywhere in 300 screen + 31 tracer legs.
   Candidate revision for the NEXT run's prereg (not
   this one — metric binding forbids retroactive
   relaxation): exempt village-lost legs with N ==
   daysAlive - 1 + contiguity, dropping the gameDays
   corroboration; or keep the field and accept
   INSUFFICIENT-DATA whenever this shape appears in a
   candidate. Either way the question must be settled
   BEFORE the next run's screen, not after seeing its
   failures.
2. Fraction identifiability. On two fresh bands now
   (83401-83600 and 83801-84100), 0.85 vs 0.90 give
   identical variant days on every traced leg, because
   firings arrive via E2/F or deep E1 falls. Fresh-band
   screening at this sample size may never separate
   the fractions. A future run could pre-register a
   targeted band (legs whose E1 fractions fall near
   the 0.85–0.90 boundary) — but that selection must
   be pre-registered as a targeted design, never
   cherry-picked from a screened band after seeing
   outcomes.
3. Early-collapse leads. Legs with first starvation
   before day 8 (84082: day 7) produce large negative
   leads by construction. A future run's lead metric
   should state how pre-eligibility collapses are
   handled (excluded? reported split?) before judging.

## Attribution limits (carried from prereg)

Evening snapshots only; would-fire overlay, not a
counterfactual (whether a real rule would have saved
any village is unmeasured — not claimed). Single
policy (competent) by design; 30-day early window
only. Descriptive staged measurement, NOT a causal
claim. No pooling with prior runs.

## Files

- Evidence: evidence/2026-11-04/sim-vfrac-a.md (this file)
- Prereg: evidence/2026-11-04/sim-vfrac-a-prereg.md
  (committed before any screen or judged leg)
- Screen classification (full 300 seeds):
  evidence/2026-11-04/screen-tmp-vfrac-a/classification.json
- Compact screen summary (300 rows):
  evidence/2026-11-04/screen-summary-vfrac-a.json
- Tracer corpus (31 legs + 83976 re-run + per-leg
  analysis): evidence/2026-11-04/tracer-vfrac-a/
  (tracer.jsonl, tracer.log, tracer-rerun-83976.jsonl,
  tracer-rerun-83976.log, analysis-perleg.json)
- Raw screen corpus (screen.jsonl ~149MB, screen.log)
  deliberately NOT committed (GitHub 100MB push block);
  it remains only in the finisher's worktree until
  release and is summarized by the two files above.
- Tools + proof: scripts/analyze-vfrac-a.js,
  scripts/test-vfrac-a.js (70/70, committed before
  judging on the judging base).
