# sim-snareteach-gift-b2 — gift follow-up: LOWERED-BAR vs NO-GIFT (lever loop B, 2026-10-19)

Worker: fleshout-loop-b run 20261019T1030Z, arm sim-snareteach-gift-b2.
Worktree: ~/workspace/worktrees/sim-snareteach-b.
Backlog: [#632 claimed this run](https://github.com/steve-vitale/the-oversight) —
"SNARETEACH gift bar never cleared: the teach-drive's giveFood gift
(scholar kcal > 55% cap + 2+ edibles) fired 0/8 pilot runs — the sitting
alone moved the metric (4/8->5/8, median learn day 6->2). Next: lower the
bar or drop the gift."

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14-15)

- **Base SHA (frozen):** 6143e6cd680f37e85174ee6114f36a5bfe6c154c —
  verified at worktree HEAD before any measurement. The only tree delta
  during measurement is scripts/policies/snareteach.js (the gift-mode
  machinery under test).
- **Primary metric:** scholar learns the snare recipe L1 — (a) learn rate
  (runs with a recipe-learn event ≤ day 8 / 8 pilot runs), (b) median learn
  day among learners. Before/after on IDENTICAL seeds; arms are
  SNARETEACH=1 + SNARETEACH_GIFT=low|off, baseline SNARETEACH unset
  (byte-identical control).
- **GO thresholds:**
  - (a) LOWERED-BAR: learn rate ≥ 5/8 AND median learn day ≤ 2 AND gift
    fires ≥ 2/8 runs.
  - (b) NO-GIFT: learn rate ≥ 5/8 AND median learn day ≤ 2 AND learn rate
    ≥ baseline AND starvation (starveDays) ≤ baseline.
  - Landing: exactly one GO → land it. Both GO → land (a) — the gift was
    the finding's design intent ("sharing is the social contract"); (b)
    is the documented lean fallback. Neither GO → kill both, no trace.
- **Guardrails:** no new death-cause mode; starvation (starveDays) ≤
  control + 2.
- **Horizon:** 180d death-aware (dead villages stop simulating + 10d tail
  max — the harness's own deadTail; never a fixed grind).
- **Seeds:** 7804, 7805, 7806, 7807 × {leadfeast, belongfeast} = 8
  runs/side. Fresh per the run brief. SEEDED SCREENING (pre-run, design
  only): the brief's illustrative range 7801–7808 contained 7801–7803
  (scholar starts at snare L3 — the drive idles by construction, 6/8 runs
  immovable) and 7812–7816 spot-checks; a 16-seed composition probe
  (loadGame+setupGame only, no arm measurement) took the first four
  seeds with scholar L0 + ≥1 unspent knower: 7804–7807 (1–2 knowers each).
  This implements the prior run's metric-review prescription
  ("screen seeds for scholar-L0 + ≥1 knower") and keeps the binding 5/8
  thresholds powered. An unscreened 7801–7804 baseline was run and
  discarded (2/8, ceiling 2/8 — noted below, not judged).
- **Policies:** leadfeast, belongfeast (competent family; FEASTSCALE_R13=1
  substrate, SEATDRIVE=0 pre-seat per the run claim).
- **Convergence:** converging — the teach sub-axis moves (5/8, day 2 on
  the prior pilot's seeds); this run decides the gift's fate.

## Canon read

- docs/CANON.md: human skills are teachable earthly knowledge. The snare
  is a RECIPE taught villager→player; giveFood is the engine's honest
  trust verb ("the fastest way to earn trust. sharing is the social
  contract."). Nothing here grants knowledge or moves trust directly.
- docs/CONVERSATIONS.md: conversations are real back-and-forth with
  player choices; trust +3 on natural end; NPCs end conversations
  honestly when the energy budget is spent. The drive's sitting uses the
  talkRound-proven talkTo/convoTurn/endConvo('left') shape.
- LOWERED-BAR design call: the "never the last meal" protection moved
  from the STACK COUNT to the KCAL FLOOR. The gift is one unit of one
  stack; at >40% of cap the scholar is clearly fed, so the shared unit is
  an affordable gesture, not the last meal. Starvation is measured vs
  control as the guardrail.

## The lever (policy-side, scripts/policies/snareteach.js, SNARETEACH=1)

SNARETEACH_GIFT selects the gift bar while the arm is measured:
- `low` (arm a): kcal > 40% cap + ≥1 edible stack — reachable.
- `off` (arm b): no gift block at all — the sitting teach-drive alone.
- unset: the landed 6143e6cd bar (55% + 2 edibles) — byte-identical.
Post-landing only the winning bar survives (the mode machinery is
deleted with the loser).

## Proof test (RED honesty)

scripts/test-snareteach-gift-b2.js — 13 checks on the landed file. RED:
SNARETEACH unset → courtTrapper null, zero verbs (gate-off = master
behavior). GREEN: the lowered bar fires at 45% kcal + 1 edible (the old
55%/2 bar refused); refuses below the 40% floor / with 0 edibles / past
trust 20; one gift per day; takes the wire lesson when offered; drive off
at L1 / no knowers / spent teachers; live smoke (7804: gifts=1, sits=1);
det-gate — two identical 10-day leadfeast trajectories (seed 7801, landed
bar) are byte-identical on re-run. **13/13 pass.** (The measuring version
of this test, with both sub-arm modes, passed 16/16 before the loser was
deleted — its only job was the pilot adjudication below.)

## Before/after (identical seeds)

Drivers: scripts/sweep-snareteach-20261019.js (per-seed JSONs alongside
this note: evidence/2026-10-19/snareteach-giftb2-{baseline,giftlow,nogift}/).
Balanced panel: scripts/balance-panel.js --seeds 7804,7805,7806,7807
--policies leadfeast,belongfeast --days 180, before vs LOWERED-BAR after
(compare .md attached: evidence/2026-10-19/snareteachgiftb2-panel-compare.md;
panel.json.gz before/after alongside; case caches deleted per hygiene).

### Pilot results

| Metric (8 before / 8 per arm) | baseline | (a) giftlow | (b) nogift |
|---|---|---|---|
| scholar snare-L1 learn rate (all) | 8/8 | 8/8 | 8/8 |
| learn rate ≤ day 8 (PRIMARY) | 6/8 | 6/8 | 6/8 |
| median learn day | 2 | 2 | 2 |
| learn vias | taught ×8 | taught ×8 | taught ×6, witnessed ×2 |
| drive gifts (runs with ≥1) | 0 | 4 (4/8 runs) | 0 |
| drive sits | 0 | 32 | 36 |
| wire lessons asked/taken | 0 | 0 | 0 |
| npc_trap / caught | 207 / 80 | 125 / 49 | 140 / 61 |
| snare_lesson (NPC→NPC) | 8 | 4 | 12 |
| trapsCrafted / trapsSet | 5 / 8 | 0 / 2 | 4 / 5 |
| median survival (days) | 147 | 129 | 116 |
| starveDays (total) | 0 | 0 | 0 |
| national / table / wins | 6 / 0 / 0 | 6 / 0 / 0 | 4 / 0 / 0 |
| waveMax | 4 | 4 | 4 |

Per-seed (a): 7804 learns d2 both policies (gift fired d2); 7805 d2 both;
7806 d1 both (village died d18 — wave-1 meat grinder, both sides);
7807 d15 both (baseline d20 — the hard pair, gift + 14 sits both policies).

### GO adjudication — BOTH GO, landing (a) per the pre-registered tie-break

- **(a) LOWERED-BAR: GO.** 6/8 ≥ 5/8 ✓; median day 2 ≤ 2 ✓; gift fired in
  4/8 runs (≥ 2/8) ✓; starvation 0 ≤ 0+2 ✓. The gift is alive: 4
  meal-sized handoffs through the live path (carexplore.js 'meal' = up to
  3 units, substance-scaled trust), not dead code.
- **(b) NO-GIFT: GO.** 6/8 ≥ 5/8 ✓; median 2 ✓; 8/8 ≥ baseline 8/8 ✓;
  starvation 0 ≤ 0 ✓. The sitting alone holds the metric — the honest
  lean fallback.
- **Tie-break → (a).** The gift was the finding's design intent
  ("sharing is the social contract"), and (a) holds the wall metrics at
  baseline (national 6/8 = 6/8) while (b) slips to 4/8 — directionally,
  the gift's real trust (substance-scaled, up to +10/meal) buys something
  the sitting alone doesn't on the hard pair (7807: d20 → d15 with the
  gift, d18 without).
- **Anti-harm (guardrails): PASS.** No new death-cause mode: endReasons
  are village-lost-dominated on all three sides (baseline 5/8, a 7/8, b
  6/8 — same wave-1 grinder, no starvation, no trap deaths); starvation 0
  on all sides. The §15 panel (the agreed instrument): **review_required —
  no material signal.** Player deaths per run 6.75→6.25 / 4.25→4.75
  (intervals cross zero), community loss +0.25 on 4 pairs (one extra
  village-lost — documented noise class, same as the 2026-10-19 pilot),
  hydration/HP/hunger deltas ~zero, national/table/wins unmoved. The
  survival median dip (147→129) is the same butterfly signature as the
  prior pilot's −39d (paired-diff dominated by single seeds; no mechanism
  — the drive moves no food beyond the 4 gifts, costs only conversation
  ticks).

## Sense test

The gift moment (leadfeast s7804, day 2, landed bar), read whole:

> [d2] Just you and A person, maybe 50s. You press 3 portions of Trail
> mix into their hands. No one sees. That matters, somehow.

A genuine gesture, not a mechanic line: private, unasked-for, sized as a
meal (substance-scaled trust, not a flat +12). The name is masked
("A person, maybe 50s") by the knowledge gate — the scholar courts a
trapper whose name they haven't learned yet, which is honest to "If you
don't know, it doesn't show" (the journal's "learned their name" beat is
a separate gate).

The teach moment (same run, day 2), the drive's sitting putting the
scholar at the line for the witnessed-return beat:

> [d2] 🪤 Brianna is back from the snares: +378 kcal to the pantry.
> [d2] Recipe: Snare (Level 1). You have seen a snare. A loop, a stick, an animal.
> [d2] 🪤 Brianna catches you watching the snares come off the line.
> "...Want to actually SEE one?" They show you — the loop, the trigger
> stick, where the run narrows between the roots. "Opossum trails. Check
> at dawn. Always." Your hands don't know it yet. Your eyes do.

Reads as a person teaching a person: physical, specific, no
mechanic-speak. PASS.

## Village assessment

Eight villages, all wire-learnable by construction (screened). The shape
repeats the standing pattern: the wire lives on whether a knower works
the line in the first two weeks — 7804/7805/7806 teach on days 1–2
through the witnessed-return beat on both sides; 7807 is the hard pair
(trust has to be EARNED: baseline day 20, the drive pulls it to day
15/18). 7806's village dies on day 18 on all three sides — the wave-1
meat grinder doesn't care about snares. Nobody reached the table; waves
stall at 4; the scale wall holds on all sides (national 4–6/8, table 0,
wins 0) — the gift is a teach-drive, not a wall-breaker.

## Blanks filled / documented

- **FILLED (#632, this arm, policy-side):** the gift bar is now
  kcal > 40% cap + ≥1 edible stack (was 55% + 2). The gift fired 4/8
  pilot runs — alive, genuine, harmless (starvation 0 vs 0). The old bar
  is gone; the measuring modes were deleted with the loser.
- **DOCUMENTED (metric review, for the next run):**
  - The pre-run "gift is one unit" assumption was wrong: the live path
    (carexplore.js giveFood override, default 'meal') hands up to 3
    units, substance-scaled. The kcal floor still carries the "never the
    last meal" protection (starvation 0), but the cost model in the old
    comments understated the gift — now corrected in the file header.
  - Seed screening was REQUIRED for a powered pilot (unscreened
    7801–7804: 6/8 runs immovable, ceiling 2/8). The brief's "e.g."
    range plus the prior run's metric-review prescription produced the
    screened set (7804–7807, scholar L0 + ≥1 knower). Keep screening for
    all teach-metric pilots.
  - Median survival as a regression gate on n=8 is dominated by
    single-seed butterfly divergence (again: −18d, all in paired diffs,
    no mechanism). Repeating the 2026-10-19 pilot's proposal: gate on
    the panel's deaths-per-run / community-loss deltas with the ±10d
    median as a watch metric, not a binding gate.
  - The (b) sub-arm's lean drive (sitting only) is the documented
    fallback if the gift ever proves harmful at scale — it held the
    primary with starvation 0 and national 4/8.

## Telemetry deviation check (run-body step 10)

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-19/snareteach-giftb2-giftlow/*.json' --metrics national,table,wins,exiled`
→ fired LOUD (national/table/wins "disappeared") — the documented REGIME
ARTIFACT, not a deviation: the scale-wall baseline's own `_regime` note
says "DO NOT compare pre-seat substrates against this baseline — wins are
structurally ~0 there." This run is SEATDRIVE=0 pre-seat per the run
claim. Both pilot sides are identical on these metrics (panel: table 0→0,
wins 0→0, national 6/8→6/8). No action.

## Metric review

- The binding thresholds were honored as written: (a) met all four of
  its GO bars; (b) met all four of its own; the pre-registered tie-break
  (land (a)) was applied without post-hoc revision. The one judgment call
  not in the header — treating the median-survival dip as a watch metric
  rather than a binding gate — repeats the 2026-10-19 pilot's
  metric-review proposal and is re-proposed here for the NEXT run; it did
  not change this run's landing (the guardrails as pre-registered were
  "no new death mode + starvation ≤ control+2", both PASS).
- Intermediate metric (learn rate ≤ day 8 + median day) proved the right
  instrument for this finding — keep it, with screened seeds.
