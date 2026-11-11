# Counter-close confirm — PRE-REGISTRATION (arm sim-counterconfirm-a)

Run: fleshout-20261110T2215Z (Loop A). Axis: scale-onramp / diplomacy
(the counter wall). Base at prereg time: b6cf13684 (worktree HEAD;
master is 3daa1a9b6, one evidence-only commit ahead — base is current
for game code). This is the CONFIRM of the sim-counterclose-a pilot
GO (evidence/2026-11-10/sim-counterclose-a.md, prereg
evidence/2026-11-10/sim-counterclose-a-prereg.md). Policy-side only,
zero src/js. Win prices, deed gates, readyDemand, judgeLink bands
untouched. The RAISER_SEAT +35 signal stays KILLED (NO-GO,
raiserseat-a) and is NOT re-landed: it returns here ONLY as the
test harness on both legs, exactly as the pilot did, and is REVERTED
before the final commit (proof pins the revert).

## The pilot GO being confirmed (no new sims yet)

Pilot (band 150201–150208, 8 seeds/leg, 150d, same legs as below):
second links armed 8/8 vs control 6/8; zero armed seeds stalled at
unanswered counters (control 2: 150204, 150206); cost bar passed
(deaths/100 village-days 62.14 vs 62.58; starvation 2 vs 2; median
150d vs 150d). The pilot's GO rests on 2 flipped seeds; the confirm
is what makes it a landing, not a pilot.

## Legs (isolation) — the harness question, decided here

- BOTH legs: `COMPETENT_TALK=1` (the talkturn-a substrate) AND
  `RAISER_SEAT=1` — the +35 raiser-seat signal, present on BOTH
  legs as the **test harness that reproduces the counter load**.
  The failure was observed ONLY on that substrate (pilot prereg:
  without the seat signal the band stages 0 counters and the lever
  would have nothing to answer — a vacuous pilot; talkturn-a band:
  0 counters, 27 formed, 0 declined).
- ARMED leg: + `COUNTER_ANSWER=1`.
- CONTROL leg: flag unset.
- The ONLY difference between legs is COUNTER_ANSWER. The driver
  sets/deletes all three flags explicitly per leg so ambient env
  cannot leak.

Why the harness is back (this is the decision the assignment's
"same legs" carries): the pilot evidence defines the owed confirm
as "the same legs on a FRESH band", and the pilot's legs include
the RAISER_SEAT harness. A harness-free confirm would not test the
fix at all — on the plain substrate counters essentially never
stage, so the harness-reproduction check below would fail and the
run would be VOID by the pilot prereg's own rule, not a test of
anything. "Do NOT re-land the killed +35 RAISER_SEAT signal" is
honored the pilot's way: the signal is applied as harness, used on
both legs only, and REVERTED before the final commit; the confirm
proof pins the revert (flag a no-op on talkScore, exports gone),
exactly as test-counterclose-a.js does for the pilot. The landed
artifact is COUNTER_ANSWER only. If the coordinator meant a
harness-free generalization run instead, this prereg's leg
definition is the place to overrule — the band and thresholds
below are unchanged either way.

## Band freshness (skill: local_seed_band_freshness)

- Band: **150217–150232 (16 seeds)**. Pilot: first 8
  (150217–150224); confirm extends to all 16.
- 150209–150216 stays reserved for tendexact-a — NOT used here
  (assignment + sim-tendexact-a-prereg.md, sim-raiserseat-a-prereg.md,
  sim-talkturn-a-prereg.md, sim-cookfirst-a-prereg.md).
- Freshness search (before this prereg was written):
  `git grep` for `15021[7-9]|15022[0-9]|15023[0-2]` over
  `evidence/*/sim-*-prereg.md` — ZERO hits. The 10 files that
  mention a forbidden/contaminated band list
  (evidence/2026-10-25/sim-preserveact-b.md,
  evidence/2026-11-01/sim-fullseat-recheck-a-prereg.md,
  sim-scale-onramp-round-0615.md, sim-trajband-a-prereg.md,
  sim-vet2mfg-a-prereg.md, sim-vet2mfg-a.md,
  evidence/2026-11-04/sim-tendfloor-guard-b-prereg.md,
  evidence/2026-11-05/journey-deepening-r104-prereg.md,
  journey-deepening-r104.md, journey-deepening-r105-prereg.md)
  were grepped for the same numbers — ZERO hits. No
  `perseed-*/` corpus file names any seed 150217–150232.
  Bands in use and avoided: 150201–150208 (pilot + siblings),
  150209–150216 (tendexact-a reserved), 140201–140224 (Loop B).
- Band 150217–150232 is FRESH. This prereg names it, reserving it
  for this confirm.

## The lever (unchanged from the pilot — already landed in tree)

`answerPendingCounter`, `scripts/policies/competent.js`, env gate
`COUNTER_ANSWER=1`, default OFF. Called once daily at the top of
`competent.daily`. Pantry ≥ 12,000 kcal → sweeten (1,500 kcal
one-off, keep Haven's terms; re-judgment +12 vs 45). Pantry <
12,000 kcal → walk (clear the table, −3 opinion, keep the food).
Never 'accept' on the raise path. No code change in this arm
unless the proof or the sims expose a defect in the lever itself;
any such change is a new decision recorded in the evidence, not a
silent edit.

## Canon

No canon doc covers village-link counters / judgeLink negotiation
(CANON.md manifest: CONVERSATIONS.md covers dialogue/talk, but no
doc covers hierarchy links). The diagnosis is code-grounded
(hierarchy.js:645 proposeLink guard, :704–738 answerCounter) plus
the pilot evidence — stated here rather than inventing canon.

## Pre-registered judgments

Horizon: **150d**, death-aware (dead villages stop; +10d tail max
per the harness). Seeds: **150217–150232** (16, confirm);
pilot gate on the first 8 (150217–150224). Policies: competent,
both legs `COMPETENT_TALK=1` + `RAISER_SEAT=1` (harness);
armed + `COUNTER_ANSWER=1`.

STAGING: pilot 8 seeds before/after first. If the pilot gate
(primary judged on the pilot 8, below) fails, the run stops —
no confirm spend. If it passes, run the remaining 8 seeds and
judge the confirm on all 16.

HARNESS REPRODUCTION (checked FIRST — if it fails, the confirm is
VOID, not NO-GO): the control leg must show the counter-stall
class — ≥1 seed ending with `pending.counter` true at its last
snapshot, and ≥1 fresh counter band-wide. (Pilot observed: 2
stalled seeds, 2 fresh counters, 79 blocked re-knocks on 8
seeds; a 16-seed band should stage at least as much.)

PRIMARY METRIC (conjunction, judged strictly, on all 16 seeds):
(a) second links formed: **armed seeds > control seeds**
(second-link counting per the talkturn analyzer: any village
beyond the first link, ever).
(b) **zero armed seeds stalled at unanswered counters** (no armed
seed ends with `pending.counter` true at its last snapshot).
GO requires (a) AND (b). A tie on (a) with (b) passing is NO-GO —
the lever must move links, not just clear counters.

COST BAR (per-day form, as the pilot):
- deaths per 100 village-days armed ≤ control × 1.10;
- starvation deaths armed ≤ control + 2;
- arm-only starvation (armed starvation on seeds where control
  starvation = 0) ≤ control starvation total;
- median survival armed ≥ 0.8 × control median.
A GO primary with a failing cost bar is HELD, not landed (same
rule as talkturn-a / the pilot).

SECONDARY (reported, not judged): fresh counters vs blocked
re-knocks per leg; counter answers per leg (sweeten formed/failed,
walked, kcal spent); accepts/expires; first-link source; polity /
seasoned links; wall numbers (national / table / wins, wave 4–5
unlocks, median survival); death causes; per-seed table.

BALANCED PANEL (§15): before/after comparison runs through
`scripts/balance-panel.js`; the compare .md is attached to the
evidence file.

## If GO

The lever (COUNTER_ANSWER, policy-side, env-gated, default off)
is a landing candidate. Landing it as the competent default vs
keeping it env-gated is a coordinator/Steve call: COUNTER_ANSWER=1
is bot behavior, not a game change. If NO-GO, the lever is killed;
the instrument and diagnosis stay as the record. Either way the
RAISER_SEAT harness is reverted before the final commit.

## Instrument notes (carried from the pilot's metric review)

- The confirm driver extends the pilot driver's say-wrap regex
  with `counter|sweeten|table is set`, so the counter's own words
  (the stage line and the sweeten line) are captured this time —
  the pilot's say-wrap missed them.
- The decline-null split (four distinct null reasons lumped) is
  NOT attempted here: counts were small and verdict-neutral in the
  pilot, and the confirm judges the same primary. If null counts
  grow on the fresh band, the split is a metric-review item for the
  next run, not an in-run instrument change.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- (Carried) Report fresh vs blocked counters separately; a raw
  'counter' return count measures the guard, not the negotiation.
- (Carried) The 150206-class (≥10 stagings, 0 picks) is retired as
  a failure definition for this substrate; the counter-stalled
  seed class (fresh counter staged, `pending.counter` true at
  end) is the judged failure.
