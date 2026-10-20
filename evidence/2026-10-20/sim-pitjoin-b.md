# sim-pitjoin-b — trapper-joiner integration: duty priority for the trapline (2026-10-20)

Loop-B food-economy lever arm, run fleshout-loop-b-20261020T0930Z.
Backlog #603 named direction: "Treat the joiner flow as a first-class
channel, not seed luck." Backlog #613: learned-pit joiners (arriving with
knowsPit learned, not from occupation) are the turnover economy's second
sustain path — served here too.
DISTINCT from the two kills: pitstaff (KILLED WITH TEETH, #581 — staffed
pit-trap crafting, a villager-death factory) and trapjoin (KILLED AT PILOT,
#611 — 'teach' duties for joiners, 0 lessons from 4 duties). This arm is
integration, not teaching and not staffing.

## Canon read (BEFORE sims)

- docs/CANON.md (full read): knowledge gates every surface ("If you don't
  know, it doesn't show"); human skills ≠ alien abilities — snare/pit/trap
  craft is HUMAN skill (teachable earthly knowledge), never a System slot;
  no silent actions (every refusal is narrated); trust ≠ reputation.
- docs/PRESERVATION.md: pit catches (boar/deer meat) enter the existing
  food ladder — the pit needs no new ladder logic.
- docs/BEAR.md: trichinosis in boar meat — only `foodState: 'cooked'`
  clears it (unchanged; the pit's boar kcal enters the existing ladder via
  stockPantry, no new ladder logic).
- **No hunting/traps canon doc exists** (docs/ has no HUNTING.md or
  TRAPS.md — re-verified 2026-10-20, same as the 2026-10-19 censuses). The
  trap species table lives in src/data/recipes.json (pit_trap). Stated here
  instead of invented.

## The gap (traced, not assumed)

The NPC pit line runs on autonomous TRAPS-purpose returns (18%/return
npc_pit catch for knowsPit hands, villager-objectives.js) — there is NO
pit task in delegateTasks(), and purposes are NPC autonomy (the trapjoin
design call). The base policy (competent.js → leadfeast/belongfeast)
staffs productive/danger duties via Game.assignTask (water, wood, cook,
garden, fish, hunt, ...). A pit-capable joiner swept into one of those
duties spends the part on the duty instead of the line they already work.
The engine gives the scholar no "work the trapline" order to give — so
the honest policy-side routing is DUTY PRIORITY: the trapline outranks
village duties for these hands.

## The lever (POLICY-SIDE, zero src/js changes)

`scripts/policies/pitjoin.js` (env gate PITJOIN=1; unset = pure
delegation, proven byte-identical by RED-2). Wraps feastscale's
leadfeast/belongfeast via withPitJoin:

1. **Setup-day cohort pin** (setup): whatever numeric day the harness
   leaves scholar.day on, the setup roster is pinned as the day-0 cohort
   (vid-appearance events after that = joiners, #603's events-not-snapshots
   rule).
2. **Assign guard** (upkeep/daily, installed once, chains any existing
   Game.assignTask wrapper): when the scholar's staffing would assign a
   competing duty to a mid-run knowsPit joiner (background-trapper
   occupation OR learned — the #613 scope), the assignment is refused with
   the engine's own refusal shape ({ok:false, refused:true}). The base
   policy makes a single staffing attempt per part (no retry), so a refused
   duty goes UNFILLED that part — the honest price of the doctrine, judged
   by the guardrails. 'rest' and unknown tasks always pass (recovery never
   blocked; fail-open). Every refusal is narrated ("X stays on the
   trapline — ..."), counted (ctx._pjExemptions), and logged
   (ctx._pjExemptLog).

Design calls (Steve can overrule):
1. Exemption, not orders: the layer never assigns, never moves trust,
   never grants knowledge, never touches purposes or NPC autonomy.
2. Joiner = first-appeared strictly after the setup day. knowsPit = any
   origin (background OR learned).
3. Competing duties = all productive/danger delegateTasks except 'rest'.
4. The setup-day cast is never routed — day-0 trappers are the census's
   dying cohort; the task scopes to joiners.

## PRE-REGISTRATION (binding; written BEFORE the pilot sweep — MEASUREMENT.md §14)

- PRIMARY: pit-channel kcal/run, armed/control, identical seeds.
  GO threshold: ≥ 1.3x.
- ENGAGEMENT (kill-fast): the layer fires (≥1 exemption) on ≥3 of the 16
  armed runs. If the base policy never diverts pit-capable joiners, the
  lever cannot engage → KILL AT PILOT (the task's honest-kill clause).
- GUARDRAILS (hard): starvation deaths ≤ control; median survival ≥
  control − 10d; national ≥ control − 2; no new death mechanism (explicit
  watch: 'own pit trap' — pitstaff's killed mode).
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); PITKNOWLEDGE unset
  (channel on). Env asserted up front; SWEEP STOPS on mismatch.
- SEEDS: 61201–61208 (freshness verified against evidence/ + scripts/ +
  hidden_files/ before any sims; the only hits were coincidental kcal
  counters inside JSON bodies, the dismissed class) × {leadfeast,
  belongfeast} × {on, off} = 32 runs (16 pairs). These 16 pairs ARE the
  pilot — no confirm spend before judging them.
- POLICIES: leadfeast, belongfeast (competent family).
- §15: before/after through scripts/balance-panel.js on the temporary
  registry policies pitjoinlead/pitjoinbelong (gate-off vs PITJOIN=1);
  the panel is the instrument, the pre-registered threshold is the judge.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Proof test

`scripts/test-pitjoin-b.js` — all pass (2026-10-20, FEASTSCALE_R13=1):
- RED-1: gate-off layer is zero-write, pure delegation (no _pj* ctx keys,
  assignTask unwrapped, daily returns base.daily's value).
- RED-2: 20d trajectories identical gate-off vs base, both policies.
- GREEN-1: joiner injected through the engine's real join path
  (background_survivors → arrivals → arrivalTick → hydrateSeed) detected
  as a pit-joiner (knowsPit from occupation); setup-day cohort excluded
  even when given knowsPit.
- GREEN-2: competing-duty assignment refused ({ok:false, refused:true}),
  counted, logged, narrated ("stays on the trapline"); the duty slot stays
  open (no assignment written).
- GREEN-3: non-pit joiner passes through; setup-day villager never routed.
- GREEN-4 (#613): learned-pit joiner (non-trapper occupation, knowsPit set
  post-arrival via the apprenticeship's write path) IS exempted —
  occupation-independent.
- GREEN-5: wrapper chains over a pre-existing assignTask wrapper
  (exempt short-circuits, rest delegates).
- GREEN-6: 6-day live smoke, no errors.
- Fixture bug caught and fixed by the proof: setupGame leaves
  scholar.day at 1, so the first isPitJoiner draft (firstSeen <= 0
  exclusion) misclassified the setup-day cast as joiners. Fixed with the
  setup-cohort pin (_pjSetupRoster/_pjSetupDay); the proof pins the fix.

## Pilot result — 32 runs (61201–61208 × {leadfeast,belongfeast} × {on,off})

Per-seed JSONs: `evidence/2026-10-20/perseed-pitjoin-b/`. Env asserted up
front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit); the off side runs the SAME
wrapped policy objects with PITJOIN unset (RED-2: gate-off trajectory
identical). One runtime restart killed the sweep mid-run (~10 min in, 6
runs done); the completed per-seed JSONs were validated and the remaining
27 runs resumed to a workspace log (not /tmp — service restarts wipe /tmp).
All 32 runs completed; RESUME-EXIT=0.

| side | pit kcal/run | kcal/100d | catches | joinerKcal | boar | lessons | pitJoinerRuns | exemptRuns | exemptions | medSurv | starv | ownPit | wins | national | table | wave4 | wave5 |
|------|-------------|-----------|---------|------------|------|---------|---------------|------------|------------|---------|-------|--------|------|----------|-------|-------|-------|
| on (PITJOIN=1) | 706.8 | 504.4 | 16 | 0 | 2 | 1 | 1/16 | 1/16 | 18 | 138d | 10 | 0 | 0 | 9 | 12 | 14 | 0 |
| off (unset) | 706.8 | 507.8 | 16 | 0 | 2 | 1 | 1/16 | 0/16 | 0 | 138d | 9 | 0 | 0 | 9 | 12 | 14 | 0 |

Species (both sides identical): the pit_trap table's shape. Boar avg kcal
in-band (649). Death buckets essentially identical (violence 120/118,
monster 59/61, contest 9/9, disease 3/3, wounds 4/4, ambush 2/2).

Paired structure (16 pairs): **15/16 pairs bit-identical** on kcal, days,
and starvation. The single engaged pair is leadfeast-s61205: on-side
2331 kcal / 179d / 3 starv / 18 exemptions vs off-side 2331 kcal / 164d /
2 starv / 0 exemptions. The 18 exemptions kept Owen Smith (hunting_guide,
joined d91 with knowsPit) off 15 fish + 3 water duties — but his pit line
was quiet on both sides (0 joiner catches either side; the 3 catches came
from the day-0 trapper). The layer engaged honestly and changed nothing.

## §15 balanced-panel compare

Built per §15: before-panel (PITJOIN unset) and after-panel (PITJOIN=1),
same 8 seeds × {pitjoinlead, pitjoinbelong} × 180d, temporary registry
entries (reverted post-run). Both panels valid (16 cases each, neutrality
proofs green, no validity errors).

**Compare decision: `invalid` — "Unmatched flags".** The panel's validity
check mechanically rejects the comparison: PITJOIN is discovered from
source (`process.env.PITJOIN` in the layer) and differs between the builds
(unset vs `1`). This is STRUCTURAL, not a flaw in the run: the panel's
before/after is designed for source-tree differences (game-code levers —
it only flags `scripts/*` changes, allowing `src/*`); for a policy-side
env-gated layer there is no way to express the treatment without tripping
either "Unmatched flags" (env differs) or "Policy/harness changed" (source
differs). The paired sweep on identical seeds — env gate as the sole
difference, 15/16 pairs bit-identical — is the valid before/after
instrument for this layer class. Panels + the invalid compare are kept as
the demonstration (`evidence/2026-10-20/panel-pitjoin-{before,after}/panel.json.gz`,
`pitjoin-panel-compare.{json,md}`; `cases/` caches deleted per hygiene).

## Pre-registration verdicts

- **PRIMARY (binding, pit-kcal/run ≥ 1.3x): 706.8/706.8 = 1.000x — MISS.**
  Recorded as a miss per §14, not re-scored. Not a bar-calibration miss —
  the paired structure shows the layer is inert on the primary (15/16
  identical pairs; the engaged pair identical at 2331=2331).
- **ENGAGEMENT (binding, layer fires on ≥3/16 armed runs): 1/16 — MISS.**
  Pit-capable joiners arrived on only 1/16 armed runs this seed batch
  (vs ~3-4/16 in the censuses — seed luck). The lever engages honestly
  where it can (18 exemptions on s61205) but the channel is too thin.
- **GUARDRAILS:** starvation 10 vs 9 — MISS by the letter (≤ control);
  median survival 138d vs 138d (bar −10d) — PASS; national 9 vs 9 (bar
  −2) — PASS; no new death mechanism — PASS (own-pit-trap 0/0; buckets
  identical; the +1 starvation rides on the engaged pair which also lived
  +15d — confounded, not a harm signal, but the miss stands as recorded).
- **MECHANISM:** the on-side exemptions (18) are all accounted for
  (15 fish + 3 water refusals for Owen Smith); 0 joiner catches on both
  sides. Keeping the joiner free does not make them trap — the TRAPS
  purpose pick is NPC autonomy, and Owen's 18% never fired.

**Verdict: KILLED AT PILOT.** Per kill protocol the layer is deleted
zero-trace; instruments + evidence land. The joiner flow sustains the pit
line by working it (the census finding stands) — but only when a
pit-capable joiner arrives AND their line fires, neither of which a
policy-side layer can direct.

## Village assessment (plain words)

Sixteen villages, one with a pit-capable joiner. On s61205-leadfeast the
layer's best case plays out in full: Owen Smith, a hunting guide, walks in
on day 91 ("pack light, eyes wide"), works both lines from day 92 — snares
(+167, +200 kcal) and the pit ("Pit was quiet. They'll keep.", over and
over, the 18% never landing for him) — gets shown the snare on day 100,
shows Oliver on day 111, and from day 128 the scholar's new doctrine
refuses him, day after day, for the fish crew: "Owen stays on the trapline
— the pits are their work, not fish. You find someone else for it." He
stays. His line stays quiet. The village outlives the off-side by 15 days
and the pit-kcal doesn't move a single kcal. On the other fifteen seeds the
layer is a ghost: same catches, same deaths, same days, to the decimal.

The blank this arm fills is a negative one, and it's worth writing down:
duty priority is real — the base policy DID try to pull the trapper onto
fish duty 15 times — but a free trapper is not a catching trapper. The pit
line is NPC autonomy all the way down: the 18% roll, the purpose pick, the
arrival itself. There is no policy-side handle on any of the three. The
census's turnover economy stands: the line lives on whoever walks in, and
no doctrine makes them walk in or make the pits give.

## Sense-test (SENSE-TESTING LAW)

Read evidence/2026-10-20/sense-pitjoin-b.txt (seed 61205, PITJOIN=1,
179d, 362 lines):

- Owen's arc reads as a person: arrives a stranger, works two lines,
  learns and teaches the snare, keeps a quiet pit without complaint.
  "Owen heads out to check the snares. 'Wire doesn't lie.'" — a working
  man's refrain, not a mechanic line.
- Ethan Hunt (day-0 trapper) teaches the scholar the pit on day 14:
  "'...Want to actually SEE one?' They walk you out to it — the depth,
  the sharpened stakes at the bottom, where the game trail runs. 'Brush
  it over with leaves. And mark it well — your own pit will take you
  too.'" — the warning names the real death mode. Coherent.
- The exemption narration is honest ("Owen stays on the trapline — the
  pits are their work, not fish. You find someone else for it.") — a
  leader deciding, never silent. **Narration-repeat note:** it fires
  byte-identical 15 days running for the fish duty. If this doctrine ever
  ships, the line needs day-keyed variety (the beatidentity-b pattern) —
  a leader doesn't announce the same sentence fifteen dawns in a row.

Judgment: sensical. People act like people; catches have names and
consequences; the doctrine is voiced. The transcript does NOT show the
doctrine changing what the pit gives — because it didn't.

## Telemetry deviation check (run-body step 10)

`telemetry-check.js` vs scale-wall-preseat.json fired LOUD
(national/table "disappeared") — SCHEMA ARTIFACT, not a deviation: the
per-seed files nest wall metrics under `wall:` (national/table/won are
not top-level keys; the handbookloot metric note, still unheeded).
Armed-vs-control is the valid deviation check here and it is identical:
national 9v9, table 12v12, wins 0v0. No layer deviation. Baseline NOT
rolled.

## Metric review (mandatory)

- PRIMARY (binding, 1.3x): MISSED 1.000x. Not a calibration miss — the
  paired structure (15/16 identical pairs; engaged pair 2331=2331) shows
  the lever is inert on the primary, not underpowered. No re-score.
- ENGAGEMENT (binding, ≥3/16): MISSED 1/16. Seed-composition miss: this
  batch drew 1/16 pit-joiner runs vs the census ~3-4/16. But the miss
  doesn't matter for the verdict — the engaged pair proves the mechanism
  can't move the primary even at full engagement (18 exemptions → 0
  delta). A luckier seed batch would not have saved it.
- Starvation guardrail (≤ control): MISSED 10v9 by the letter. The +1
  rides on the engaged pair (3v2), which also lived +15d on-side —
  confounded with the longer horizon, no mechanism (the refused duties
  were fish/water, not food). Recorded as a miss, not a harm finding;
  the arm was already killed on the primary + engagement.
- The §15 panel's "Unmatched flags" invalidity is structural (see above):
  for env-gated policy-side layers the panel cannot express the treatment.
  Proposed for the loops: the paired sweep on identical seeds (env gate as
  sole difference) is the valid before/after instrument for this layer
  class; the panel remains the instrument for game-code (src/js) levers.
  Metric-contract question for Steve only if he wants the panel to cover
  policy layers.
- Seed note: 61201–61208 verified fresh (only coincidental kcal-counter
  hits in JSON bodies, the dismissed class). One runtime restart killed
  the sweep mid-run; completed per-seed JSONs validated, 27 runs resumed
  to a workspace log (not /tmp). No data loss.

## Wall numbers (report-only)

On-side (16 runs): national 9/16, table 12/16, wins 0/16, wave-4 14/16,
wave-5 0/16, median survival 138d, max 180d, maxArc 4.
Off-side (16 runs): national 9/16, table 12/16, wins 0/16, wave-4 14/16,
wave-5 0/16, median survival 138d, max 180d, maxArc 4.
Identical to the pair. The scale wall is unmoved: no wins, no wave-5,
national/table at the pre-seat census level.

## Convergence state

**killed-at-pilot** — food-economy axis stays **converging**. The
trapper-joiner integration as a policy-side lever is dead: duty priority
engages honestly (18/18 refusals on the one pit-joiner run) but cannot
move pit-kcal (1.000x) — a free trapper is not a catching trapper, and
no policy-side layer can direct arrivals, purpose picks, or the 18%.
