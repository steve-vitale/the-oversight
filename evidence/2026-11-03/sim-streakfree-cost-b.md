# sim-streakfree-cost-b — COST-LEG VERDICT: INSUFFICIENT-DATA (tracer verification failure on 2 legs)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2130Z,
axis food-economy, arm sim-streakfree-cost-b. Worktree
sim-streakfree-cost-b, branch sim-streakfree-cost-b. MEASUREMENT
ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-streakfree-cost-b.* plus the checkpoint directory
screen-tmp-streakfree-cost-b/. The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), the streakfree analyzer
(scripts/analyze-streakfree-b.js), and
scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited. This worker does NOT push, bump versions, verify
live, or merge — the coordinator lands the branch. This run does
NOT deploy (e*), (v*), or (v**): a GO here would have landed a
policy/instrument file + evidence ONLY. No deploy claim may cite
this run.

## Verdict: INSUFFICIENT-DATA — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-streakfree-cost-b-prereg.md
(committed c14c9902a BEFORE any screen or judged leg; tools
commit 9818ac98a after the prereg commit and before any judged
application; proof test 24/24, pure synthetic series, no judged
seeds; the reused proof tests were also re-run green on current
base before judging: streakfree 22/22, gatediseng 21/21,
gatediseng-confirm 11/11). Judging base 9818ac98a: screen AND
tracer BOTH ran on this base, per the prereg's base-drift
handling — no salvaged screen, no inherited corpus in any judged
denominator. The base did not move during the run (HEAD still
9818ac98a at evidence time).

| leg | result | bar | outcome |
|---|---|---|---|
| Stage 1 screen GO: screened collapsing | 12 / 200 | >= 4 | PASS -> Stage 2 |
| Stage 2 count gate (descriptive): still-collapsing | 12 | >= 4 | would pass |
| Stage 2 count gate (descriptive): traced survivors | 16 | >= 12 | would pass |
| Tracer verification: rows == daysAlive | 26/28 first try; 2 fail after the allowed re-run | every leg | **FAIL -> INSUFFICIENT-DATA** |
| Survivor drift | none (16/16 survivors still survivors) | Any = INSUFFICIENT-DATA | no drift |
| Still-collapsing exclusions | none (12/12 candidates still collapsing) | reported, never a failure | — |
| Cross-check (descriptive, verified legs): independent (c) vs reused (c) | 0 mismatches on 26/26 verified legs | Any mismatch = INSUFFICIENT-DATA | would pass |
| Determinism spot-check | 3/3 byte-identical | Report match/mismatch | PASS |
| Tracer-vs-screen byte-equality | 28/28 identical | Report per leg (substrate finding) | SEE BELOW |

INSUFFICIENT-DATA means, per the prereg: a tracer verification
failure unrepairable by re-run voids judging. Two tracer legs —
83373 (rows 19 vs daysAlive 20) and 83377 (rows 25 vs daysAlive
26) — fail rows == daysAlive on the tracer leg AND on the single
allowed tracer re-run each, and the same mismatch reproduced on
screen re-runs of both seeds. Per the prereg, "a seed is never
judged on a mismatched row count": neither seed enters any
judged denominator, and there is NO judged legs table for this
run. The descriptive section below reports what the 26 verified
legs show, labeled descriptive-only throughout — it is NOT a
judged verdict, NOT a GO/NO-GO claim, and must not be cited as
one. The analyzer's own verdict field (PILOT-NO-GO on both the
full and verified-only corpora, driven descriptively by the tie
leg) is superseded by this prereg verdict and is reported only
inside that descriptive section.

## The variant (v**) — as preregistered

(v**) = (e**) OR (F), first-firing wins. (e**) is (e*) with ONE
change: the E1 envelope fraction tightened from 0.90 to 0.85
peak. (F) is carried verbatim (falls >= 3 AND pantry <= 0.80
peak, no streak condition). (c) is carried verbatim. Offline
variant selection on the stale-base adopt corpus predicted:
cost 3/15 = 20.0% (only the shallow 0.872 firing on 83011 drops
out) with every collapsing leg byte-identical to (v*). The
fresh pilot was to judge that prediction honestly; the
verification failure means it remains unjudged on a fresh band.

## STAGE 1 — screen (full fresh band 83201–83400, 30d competent, judging base)

Screened collapsing 12 (screen classification; loss day / first
starvation day): 83230 (21/16), 83248 (30/20), 83263 (28/20),
83272 (27/25), 83281 (30/28), 83284 (26/22), 83286 (20/17),
83336 (28/27), 83341 (23/21), 83373 (20/16), 83377 (26/25),
83379 (30/28). Screen rate 12/200 = 6% — a band property, not
a rate claim. Survivors 188. Other outcomes 0. Screen wave
reach: wave 1 on 1 seed, wave 2 on 48, wave 3 on 151. Screen
verification: rows == daysAlive on 198/200 lines; the 2
mismatches are exactly 83373 and 83377 (below). Stage-1 GO bar
(>= 4) met, so the run proceeded to Stage 2. Screen corpus:
evidence/2026-11-03/screen-tmp-streakfree-cost-b/screen.jsonl
(+ screen.log). The screen ran slowly (~72 min for 200 seeds)
because the host was contended (load average up to 29 from
sibling runs); no seed failed or timed out, and the corpus is
complete and in seed order.

## STAGE 2 — tracer legs (verbatim tracer re-runs, same base)

Legs: all 12 screened collapsing candidates PLUS the first 16
screened survivors in seed order (83201–83216). 28 legs.
Membership agreement screen-vs-tracer: 28/28 — all 12
candidates still collapsing, all 16 survivors still survivors.
No still-collapsing exclusions, no survivor drift. Tracer
corpus: evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl
(+ sim-streakfree-cost-b-sweep.log).

### Tracer verification failure (drives the verdict)

- 83373: tracer rows 19, daysAlive 20, gameDays 19,
  endReason village-lost. Screen line identical (19 vs 20).
  Screen re-run: 19 vs 20 again. Tracer re-run (the prereg's
  one allowed retry): 19 vs 20 again. Deterministic, not
  flakiness.
- 83377: tracer rows 25, daysAlive 26, gameDays 25,
  endReason village-lost. Screen line identical (25 vs 26).
  Screen re-run: 25 vs 26 again. Tracer re-run: 25 vs 26 again.
  Deterministic, not flakiness.
- Pattern: in all four lines for these two seeds,
  rows == gameDays == daysAlive - 1. The recorded evenings stop
  one day short of the counted days alive — the loss day itself
  produces no evening row. Classification (endReason +
  starvation deaths) is identical across every run, so screen
  membership is stable; but the prereg forbids judging a seed
  on a mismatched row count, and the retry does not repair it.
  Hence INSUFFICIENT-DATA, with the seeds named. This is a
  substrate finding for the next run's prereg (see metric
  review), not a variant finding: the variant never gets judged
  here.

## DESCRIPTIVE ONLY — verified legs (26 legs, NOT judged)

Everything in this section is descriptive. It does not change
the verdict, and no GO/NO-GO claim may cite it. Verified legs:
10 still-collapsing + 16 survivors. The 2 unverified seeds'
analyzer values are listed separately at the end of this
section, also descriptive only.

### Descriptive table — (c) vs (v**) on identical tracer trajectories

lead = first-starvation day − first-firing day. (v**) clause:
F = fallback, E1 = envelope, E2 = cliff.

| seed | ref (1st starv.) | (c) day/lead | (e**) day/lead | (F) day | (v**) day/clause/lead | tie | strict |
|---|---|---|---|---|---|---|---|
| 83230 | 16 | 15 / 1 | 13 E2 / 3 | 14 | 13 E2 / 3 | yes | yes |
| 83248 | 20 | 17 / 3 | 18 E1 / 2 | 18 | 18 E1 / 2 | no | no |
| 83263 | 20 | 20 / 0 | 19 E2 / 1 | 20 | 19 E2 / 1 | yes | yes |
| 83272 | 25 | 21 / 4 | 20 E1 / 5 | 21 | 20 E1 / 5 | yes | yes |
| 83281 | 28 | 28 / 0 | 28 E2 / 0 | 28 | 28 E2 / 0 | yes | no |
| 83284 | 22 | 23 / -1 | 21 E2 / 1 | 23 | 21 E2 / 1 | yes | yes |
| 83286 | 17 | 17 / 0 | 16 E2 / 1 | 17 | 16 E2 / 1 | yes | yes |
| 83336 | 27 | 25 / 2 | 21 E1 / 6 | 23 | 21 E1 / 6 | yes | yes |
| 83341 | 21 | 15 / 6 | 14 E2 / 7 | 15 | 14 E2 / 7 | yes | yes |
| 83379 | 28 | 24 / 4 | 23 E1 / 5 | 24 | 23 E1 / 5 | yes | yes |

Descriptive leg counts on the 10 verified collapsing seeds:
fire 10/10, tie 9/10 (sole miss 83248, below), strict 8/10 =
80%, lead-one 9/10 = 90% (only 83281 at lead 0). Mean lead
(v**) 3.1 days vs mean lead (c) 1.9 days (coverage identical,
10/10 fired under both rules, so the comparison is clean).
Death-knell firing (lead_v == 0, named even descriptively):
83281 alone, where (v**), (e**), and (c) all fire on the
first-starvation day itself.

### Descriptive cost leg (verified survivors only)

(v**) fires on 1 of 16 verified survivors: 83201 (day 15, E1
envelope — pantry 18,489 at 0.785 of its stretch peak 23,550,
streak 6; (F) also fires day 15 on the same evening). 1/16 =
6.25%, which would pass the <= 25% bar with wide margin. (c)
fires on the same single survivor (83201, day 15); the
(c)-vs-(v**) survivor overlap is exactly that seed. The other
15 survivors are silent under both rules. Note the contrast
with the old corpus, where the cost leg failed at 4/15: on
this fresh band the cost pressure is far lower — but because
the run is INSUFFICIENT-DATA, that contrast is descriptive
only, not evidence the cost leg is fixed.

### The descriptive tie miss (83248) — the tightening's trade, for the next run

On 83248, old (e*) would have fired day 16 (E1, pantry 15,650
at 0.898 of peak 17,430 — just under the old 0.90 envelope),
while (e**) waits until day 18 (pantry 13,400 at 0.769 of
peak), and (c) fires day 17. So the E1@0.85 tightening itself
costs two days on this seed and loses the tie leg
descriptively (lead_v 2 vs lead_c 3). This is the honest trade
the fresh band reveals: a tighter envelope kills shallow
survivor firings, but it also delays warnings on collapses
whose store hovers at 0.87–0.90 of peak for days. Whether that
trade is worth it is a question for the NEXT run's prereg —
it is not re-scored here, and it does not soften the
verification verdict.

### Unverified seeds (descriptive only, never judged)

- 83373: collapsing on screen and tracer (lost day 20, first
  starvation day 16, wave 2). Analyzer on its 19-row series:
  (c) day 17 (lead -1), (e**) day 16 E2 (lead 0), (F) day 17,
  (v**) day 16 E2 (lead 0). Cross-check matches.
- 83377: collapsing on screen and tracer (lost day 26, first
  starvation day 25, wave 3). Analyzer on its 25-row series:
  (c) day 15 (lead 10), (e**) day 14 E1 (lead 11), (F) day 15,
  (v**) day 14 E1 (lead 11). Cross-check matches.
Neither seed's values enter any leg count above.

## Substrate findings

- Base-drift handling WORKED: tracer-vs-screen byte-equality
  is 28/28 (the adopt run, across bases, managed only 10/26).
  Screening and tracing on one base removed the adopt run's
  membership churn entirely: no exclusions, no drift. The
  verification failure that voids this run is a different,
  within-base substrate quirk (loss-day evening row), not base
  drift.
- Determinism spot-check: 3/3 byte-identical re-runs (first
  83230, middle 83286, last 83379 of the still-collapsing
  seeds in order). The tracer side is stable; the quirk is in
  what runDays counts as days alive versus recorded evenings
  for a village lost on its final day.
- Screen/tracer lines are large (~450KB each, full sayLines
  transcripts included); the 200-line screen corpus is ~90MB.
  That size, plus host contention, set the run's wall-clock
  cost, not the seed count.

## Sense test (transcripts around variant firing evenings)

Read the firing-evening transcripts on traced collapsing seeds.
3 firing evenings examined (83230 day 13, 83336 day 21, 83341
day 14). Verdict in plain words: on all three evenings the
warning would land SILENTLY — nothing in the transcript
notices the store falling. That is expected for a would-fire
overlay (no deploy, no narration exists yet), but it is
reported as such because a future deploy must frame (v**) as
the village store's fall, never as personal hunger, and must
actually SAY something on the firing evening, or the warning
is invisible.

Seed 83230, variant fires day 13 via E2 (pantry 13,250,
streak 6, 11 alive; first starvation day 16). Quoted from that
evening:

> "You work the patch with practiced hands: 8× Hickory Nuts (in shell — shell them to eat). This patch is picked clean — it'll recover in a few days."
> "⚔️ Kai killed the Ugly-Eyes with their party — 3 rounds, 18 taken. Word travels fast. The village cheers."
> "📖 Mia starts in on the lesson, then catches themself. "Hold on — I already showed you this one. Hickory Nuts. You remember.""

The evening reads as an ordinary productive day — garden work,
a kill celebrated, a lesson by the fire. Nobody mentions the
store, which has fallen to a cliff fraction of its stretch
peak. The next evening (day 14, pantry 10,000, 10 alive) is
the same shape, with the line "You keep a day's food (585
kcal) — nothing extra for the pantry this time."

Seed 83336, variant fires day 21 via E1 (pantry 8,250, streak
2, 9 alive; first starvation day 27). Quoted from that evening:

> "Something moves out there — Grief Counselor."
> "You work the patch with practiced hands: 16× White Oak Acorns, 10× Blackberry (650 kcal). You also gather deadfall: 1× branches. This patch is picked clean — it'll recover in a few days."
> "The Grief Counselor stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there."

A monster pacing at the treeline dominates the evening's
attention; the store's fall is nowhere in the lines. The next
evening the village is down to 6 alive, still with no
store-fall line.

Seed 83341, variant fires day 14 via E2 (pantry 5,050, streak
5, 10 alive; first starvation day 21). Quoted from that evening:

> "Something moves out there — Lockpick."
> "Something big pads at the edge of the clearing — then thinks better of it. This ground is already claimed."
> "You work the patch with practiced hands: 4× Blackberry (260 kcal). This patch is picked clean — it'll recover in a few days."

Again a monster at the edge, a small haul, and no store
language — even though the pantry sits at 5,050 with a streak
of 5. The firing evenings read as monster-watch days, not as
a village noticing its store collapsing.

## Village assessment (plain words)

The villages, across 200 fresh villages on one base: almost
all of them make it through the month (188 survive the full 30
days; only 12 are lost at all, and none is lost without a
starvation death). The ones that collapse do so by hunger, with
first starvation deaths on days 16–28, after the store has
been draining for days. On the ten collapsing villages whose
evenings are fully recorded, the tightened variant would have
raised its flag about three days before the first starvation
death on average, and it fires on every single one of them —
but on one of the ten it fires a day later than the old rule,
because the tighter envelope makes it wait for a deeper fall.
The flag goes up on only one surviving village out of sixteen
traced, which looks like a much cheaper warning than the last
run's — but none of that can be certified yet, because two
collapsing villages' final evenings are missing from the
record itself, and the pre-written rules say a run with
unverifiable legs cannot certify anything. Nothing here
changes the game — no lever was flipped, no villager behaves
differently today than yesterday.

Villagers acting like people (sampled from the same
transcripts): the fire-side teaching reads as people talking
and teaching (Mia and Easton catching themselves repeating a
lesson they already gave), and gossip chains mutating as they
travel read as a living village. The counterweight, carried
from the prior run, is that monster-at-the-treeline lines and
forage lines repeat their shape evening after evening — but
that is the game's narration doing its job, not a new robotic
artifact found here, so no new backlog item is appended.

## Reachability verdict

Waves 1–5: screen wave reach is wave 1 (1 seed), wave 2 (48),
wave 3 (151) in this 30d window; verified traced legs reach
wave 2 (12) and wave 3 (14), with the 2 unverified legs at wave
2 (83373) and wave 3 (83377). Waves 4–5 are NOT reached in
this window — expected for a 30d early window, not a claim
about the game. Arc II/III/IV, regional → national, the table,
and the win flag are NOT REACHED IN WINDOW (no fields in this
window, reported as such, not as a rate claim). Vests: not
measured by this instrument.

## Wall numbers (traced legs, 30d limit stated)

Verified legs (26): survival 16/26; median days alive 30, max
30. Wave reach: wave 2 on 12 legs, wave 3 on 14 legs. Traced
collapsing seeds: 10 verified (2 unverified, not counted).
All 28 traced legs: wave 2 on 13, wave 3 on 15 (counting the
unverified seeds' waves descriptively). National / table /
wins: NOT REACHED IN WINDOW (expected 0 — late-game states
with no fields in this window).

## Before/after (identical seeds, identical trajectories — descriptive only)

Before = old rule (c) on verified tracer trajectories; after =
variant (v**) on the same trajectories. Fire coverage: (c)
10/10, (v**) 10/10 (no coverage gain — the old rule already
fired on all ten). Tie: (v**) ties or beats (c) on 9/10
descriptively (sole miss 83248, the tightening trade). Strictly
earlier: 8/10. Mean lead: (c) 1.9 days, (v**) 3.1 days (+1.2
days). Survivor firing: (c) 1/16, (v**) 1/16 — the same seed
(83201), so the variant adds no survivor firing on the
verified legs. None of these comparisons is a judged result:
the run's verdict is INSUFFICIENT-DATA on verification.

## Balanced panel (§15) — inapplicability declared in the prereg

No balanced-panel compare is fabricated, exactly as the prereg
declares: this arm changes NO game code, runs NO lever, and
its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening series),
not panel metrics. The tables above are reported directly, on
identical seeds and identical trajectories (verified legs
only, labeled descriptive).

## Metric review (doubts about this header go here; any revision applies to the NEXT run, never to this one)

1. Verification field (daysAlive vs gameDays): the prereg
   verifies rows against daysAlive, but for villages lost on
   their final day the tracer records rows == gameDays ==
   daysAlive - 1. The next run's prereg should settle, BEFORE
   judging, whether verification compares rows to daysAlive or
   to gameDays (or exempts the loss-day row explicitly) —
   with the rationale stated, not chosen after seeing which
   seeds fail. Had this run verified against gameDays, all 28
   legs would verify and the descriptive legs above would
   have been the judged legs (with the tie leg failing,
   i.e. a descriptive PILOT-NO-GO on tie). That counterfactual
   is stated here so the next run can decide with eyes open;
   it does not change this run's verdict, which judges the
   header as written.
2. Tie/cost trade of E1@0.85: descriptively, the tightening
   fixed cost (1/16 on verified legs, vs 4/15 on the old
   corpus) but cost the tie leg on 83248 (a 0.898-fraction
   envelope hovering just under the old bar). A next run
   could pre-register an intermediate envelope (e.g. 0.87 or
   0.88) or a persistence-free tie repair — but any such
   variant needs its own prereg and fresh band, never a
   mid-run substitution.
3. Cost-bar granularity: with 16 survivors one seed is 6.25
   points, so the 25% bar (4 seeds) is still coarse; the
   descriptive 1/16 here passes with margin, the old 4/15
   failed by one seed. A next run could pre-register a larger
   survivor sample if cost precision matters more than the
   16-seed convention.
4. Sense-test scope (carried): the transcript lines available
   to this instrument are player-perspective evening lines;
   villagers' own noticing may live in lines this tracer does
   not capture. "Silent evening" here means silent in the
   captured transcript, not proven silent in the full game. A
   deploy-time sense check should read the live evening
   narration, not just this tracer.

## Corpora and proofs

- Prereg: evidence/2026-11-03/sim-streakfree-cost-b-prereg.md
  (c14c9902a)
- Tools: scripts/analyze-streakfree-cost-b.js,
  scripts/test-streakfree-cost-b.js (9818ac98a)
- Screen corpus (200 lines):
  evidence/2026-11-03/screen-tmp-streakfree-cost-b/screen.jsonl
  (+ screen.log, + screen re-runs rerun-83373.jsonl /
  rerun-83377.jsonl)
- Tracer corpus (28 lines):
  evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl
  (+ sim-streakfree-cost-b-sweep.log, + tracer re-runs
  sim-streakfree-cost-b-tracer-rerun-83373.jsonl /
  -83377.jsonl, + determinism re-runs
  sim-streakfree-cost-b-detcheck-83230.jsonl / -83286.jsonl /
  -83379.jsonl + sim-streakfree-cost-b-detcheck.log)
- Summary: evidence/2026-11-03/sim-streakfree-cost-b-summary.json
  (judgedVerdict field carries the prereg verdict; analyzer
  verdict fields inside are descriptive only)
- Proofs: scripts/test-streakfree-cost-b.js 24/24,
  scripts/test-streakfree-b.js 22/22,
  scripts/test-gatediseng-b.js 21/21,
  scripts/test-gatediseng-confirm-b.js 11/11, all on base
  9818ac98a before judging.
- No game code, policy, or existing-script change. No
  demand/gate/price change. Nothing pushed, bumped, or
  live-verified.

## Blanks filled or documented

- Filled: tracker blank 1 for food-economy gets a fresh,
  same-base pilot of the cost-leg fix (v**) — the variant,
  its offline selection, and its fresh-band behavior are now
  fully recorded, even though the verdict class is
  INSUFFICIENT-DATA rather than a pass/fail on the shape.
- Documented (not fixed, for the next run's prereg): (a) the
  rows-vs-daysAlive loss-day quirk (seeds 83373, 83377,
  deterministic, classification stable); (b) the E1@0.85
  tie/cost trade on 83248; (c) the descriptive fresh-band
  cost rate (1/16) vs old-corpus rate (4/15), unjudged.
- No new findings-backlog item: nothing outside this arm
  surfaced that is not already logged or documented above.
