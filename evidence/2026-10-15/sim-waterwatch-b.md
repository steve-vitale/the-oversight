# sim-waterwatch-b — SCHOLAR CISTERN-WATCH (ARM 2, loop B 2026-10-15)

**Run:** fleshout-b r46b · ARM 2 of 3 · sim-findings **#291** (claims #291; NO VILLAGE WATER-DUTY ADAPTATION AFTER DEHYDRATION DEATH)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-waterwatch`

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** — per the canon rule this is stated, not invented. All water mechanics below were read from `src/js/game.js` as-is (see "Engine reality" in scripts/policies/waterwatch.js). docs/STORAGE.md covers tools/stashes/caches, not water.

## Pre-registration (§11 — written before sims ran)

- **PRIMARY:** cistern 0/0 days (armed) ≤ 0.5 × control AND villager thirst deaths (armed) ≤ control (expect ≤ 2).
- **CO-PRIMARY:** scholar water-duty acts (layer ledger `creekFills + boilsOk`) ≥ 1/day on dry-cistern days the scholar was at haven (dry = dawn-snapshot `clean < 2×roster`; join on scholar day). The instrument-honesty receipt that the mechanism fired.
- **GUARDRAILS:** median survival ≥ control−10d; national ≥ control−2/16; no new death mode (n≥3).
- **Baseline:** OWN control in the SAME sweep (CONTROL BASELINE DRIFT #247 — never inherit). 8 seeds (11/22/33/44/55/66/77/88) × {leadcourt, belongseek}, 180d death-aware, identical seeds both sides. Both sides install the rangedehy instrument (trajectory-neutral, proven A/A byte-identical at full horizon); the armed side additionally wraps the policy with the waterwatch layer (WATERWATCH=1).
- **GO →** 12–16 seed confirm. **MISS →** layer deleted per kill protocol, evidence-only landing.
- **Gates before sims:** `scripts/test-waterwatch-20261015.js` — REAL RED phases (broken-copy `--red`: isDry forced false → 5 GREEN assertions fail LOUD; restored → green), gate-off wrapped == raw base det-gate (8 seeds × 2 policies × 60d, 16/16 byte-identical), SMOKE=1 instrument-honesty (named-export unwrap #69 + layer-live marker + policy.daily ≥10×/run).

## What was built (policy-side only — zero src/js changes)

- `scripts/policies/waterwatch.js` — the SCHOLAR CISTERN-WATCH layer (WATERWATCH=1, default OFF). Trigger: `cistern.clean < 2×roster` (~1 day of the 2L/villager villageDrinks draw) OR a dehydration death latched on this run (via a call-through `registerDeath` wrap — the successor inherits the latch). When the watch is on and the scholar is at haven with < 3 pack bottles, the leg (inside the wrapped upkeep, 3×/day, before the base upkeep's drinkSafe) walks hop-by-hop to the nearest revealed creek/wetland/pond, fills there (risky), walks back, and boils at the haven hearth — so the competent-family haven-well fill gate never fires on watch days. Drinking stays with the base policy (clean first, always). A village-meeting-style beat fires on engagement, weekly while it holds, and once naming the dead after a dehydration death (the successor speaks it). Every decision lands in `Game._waterwatch`.
- `scripts/test-waterwatch-20261015.js` — proof (see Proof results).
- `scripts/sweep-waterwatch-20261015.js` — the pilot sweep (32 runs + SMOKE mode).

### Engine reality that shaped the design (read, not invented)

- `fillWater()` at haven DRAWS 1L clean FROM the cistern per bottle; at creek/wetland/pond it fills the PACK with risky water. `boilWater()` converts pack risky→clean at a fire (the haven hearth counts — `nearFire()` true at haven on all probed seeds). `pourWater()` DUMPS pack water — it does NOT add to the cistern. **There is no honest engine verb for the scholar to deposit water into the cistern.** The only cistern inputs are the assigned 'water' duty (+10–14L dirty), autonomous WATER objectives (+2–4L clean), and weather. `assignTask` refuses the scholar ("You're the leader. Lead.").
- Consequence: the scholar-as-adaptation this arm tests is **cistern-draw elimination + self-sourcing**, not cistern-filling. A scholar "water duty" that FILLS the cistern needs a new engine verb — the steve-call frontier, documented here, not overreached.
- The competent-family `drinkSafe` (the well-draw source) runs in `upkeep` (3×/day), not `daily` — the first layer draft wrapped only `daily` and would have missed every mid-day well fill. The leg lives in the wrapped upkeep.

## Proof results

`scripts/test-waterwatch-20261015.js` — **50/50 GREEN** (final re-run, exit 0):
- PART 0 (module + gate): named exports resolve (#69 unwrap); gate off/on correct; inert wrap when off (`_waterwatchLive` false, base id kept).
- PART 1 (RED — natural behavior): gate OFF, dry cistern → the scholar draws the haven well (haven fills ≥ 1 via the upkeep drinkSafe); no `_waterwatch` state, no death-wrap.
- PART 2 (GREEN — the mechanism): gate ON, seed 33 (wetland@d1, hearth fire) → creekFills ≥ 3, boilsOk ≥ 3, ZERO haven-well fills, beat fired and reads as a person deciding ("Well's down to the dregs. I'll fill my bottles off the creek run today — nobody in Haven goes thirsty because I was thirsty."), pack ends clean, death-wrap installed.
- PART 3 (death latch): full cistern → watch off; forced honest dehydration death (hydration 0 / health 10 / endDay) → latch set, dead scholar's name recorded; cistern refilled (fixture isolation) → watch held by the latch alone (reason 'death', dry false); the successor's first watch day fires the death beat naming the dead.
- PART 4 (det-gate): 16/16 pairs byte-identical (8 seeds × 2 policies × 60d, gate-off wrapped vs raw base).
- PART 5 (SMOKE): instrument-honesty green both policies/sides (daily ≥10×, live marker true/false, ledger present/absent).
- RED phase (`--red`, broken copy with isDry forced false, repo file untouched): 5 GREEN assertions fail LOUD → RED OBSERVED (exit 0); a passing broken layer would have been exit 2 (vacuous test).

## Pilot results (32 runs: 8 seeds × {leadcourt, belongseek} × {armed, control}, 180d death-aware)

Verdict table (§14 — the pilot judges; a miss is NO-GO):

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| PRIMARY: cistern 0/0 days | 131 | 116 | ≤ 0.5× (≤ 65.5) | **MISS** (0.885×) |
| PRIMARY: villager thirst deaths | 0 | 0 | ≤ control (expect ≤ 2) | pass |
| CO-PRIMARY: scholar water acts / dry-haven day | 0 | 0.428 | ≥ 1.0 | **MISS** |
| GUARDRAIL: median survival | 147d | 126d | ≥ control−10d (≥ 137d) | **MISS** |
| GUARDRAIL: national | 5/16 | 6/16 | ≥ control−2 (≥ 3) | pass |
| GUARDRAIL: new death mode (n≥3) | — | none | none | pass |

**NO-GO per §14.** Three independent misses (primary, co-primary, median guardrail). Kill protocol: layer deleted, proof/sweep degrade to INFO-SKIP, evidence-only landing.

The mechanism DID fire (instrument-honesty receipts):
- Haven-well fills on dry-cistern days: **126 → 19** (0.264/day → 0.060/day, −85%). The scholar's cistern draw was nearly eliminated.
- Layer ledger (armed, 16 runs): 102 creek fills + 102 boils ok, 97 beats (32 dry-engagement, 47 reminders, 18 death — the death-beat repeat is a layer bug, see Sense-test), 35 no-water-tile skips, 108 away skips, 0 no-fire, 0 walk failures, 0 leg errors, 0 instrument errors.
- Scholar dehydration deaths: control 3 → armed 1. On the finding's own seed (s55): control dehy=1 (both policies, the Violet Pang day-12 death reproduced) → armed dehy=0 (both policies); survival 100/123d → 182/126d; haven fills 7 → 0.

Why the primary missed anyway: the scholar's well draw is a small term. Control drew 0.264 L/day from the well on dry days vs the village's deterministic 2 L/villager/day drain (~24 L/day). Eliminating the scholar's draw delays the 0/0 state by hours, not days — cistern 0/0 days fell only 131 → 116 (−11%). The 0/0 days are driven by zero duty input against the full village drain; no scholar-side lever can move them without a cistern-deposit verb (which does not exist — the steve-call frontier).

Why the co-primary missed: the leg is demand-driven (fires only when pack < 3). On dry days the pack is often already stocked, so acts/day = 0.428 < 1.0 even though the mechanism (zero well draw) held. The ≥1/day bar assumed daily water need; the pack buffers it.

Why the median guardrail missed: per-seed deltas are symmetric noise (−133 to +110; s55 +82/+3, s88 +85/+110, s22 −73/−65, s33 −133/+35), not a harm signature — the third instance of the #186/#201 median-perturbation pattern (see metric review). Death causes redistribute within combat (monster:combat +7, villager:combat −7) from trajectory divergence (water runs cost ticks), but no mode is new and starvation/sickness both fell.

### Per-seed survival deltas (armed − control)

leadcourt: s11 +89, s22 −73, s33 +35, s44 −59, s55 +82, s66 +0, s77 +0, s88 +85.
belongseek: s11 +4, s22 −65, s33 −133, s44 +23, s55 +3, s66 +0, s77 +0, s88 +110.

### The s55 story (the finding's seed)

Control reproduced #290/#291 exactly: the day-12 ranging-dehydration death (both policies), 17 cistern 0/0 days, 7 haven-well fills on dry days. Armed: the death did not happen (the scholar self-sourced at haven before ranging and carried water), 16 zero-days, 0 haven fills, 4–5 watch beats. The scholar adapted; the village's cistern still sat empty 16 days (rain refilled it) — #291's village-side question is untouched.

## Sense-test (SENSE-TESTING LAW)

Seed 55, belongseek, 40d, armed — every 🪣 beat read in context:

- Day 1 (engagement): "🪣 Well's down to the dregs. I'll fill my bottles off the creek run today — nobody in Haven goes thirsty because I was thirsty." Reads as a person deciding — names the decision, names the cost, no knob language. Sits naturally among the night beats.
- Day 15 (reminder): "🪣 The well hasn't recovered. My bottles stay on the creek." Fine.
- Caveat: the watch engages on day 1 (cistern starts at 20 L < 24 L threshold), so "down to the dregs" is dishonest on day 1 — the cistern is at its starting level. The threshold should be relative to capacity, not to the drain rate, or the beat copy should not assume visible emptiness.
- BUG (layer, documented for the next rebuild): the death beat re-fired 18 times on belongseek-s44 (one real death). Root cause: the 'reminder' beat resets `lastBeatKind`, re-arming the `lastBeatKind !== 'death'` death-beat condition — they alternated death/reminder/death. The death beat needs its own latch flag. Cosmetic (narration only; measurements unaffected) but it reads robotic — exactly what the sense law is for.

## Wall numbers (the standing scale-wall report)

| policy | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| belongseek control (8) | 2/8 | 1/8 | 0 | 2/8 | 0/8 | 156d | 182d |
| belongseek armed (8) | 3/8 | 0/8 | 0 | 2/8 | 0/8 | 126d | 182d |
| leadcourt control (8) | 3/8 | 0/8 | 0 | 2/8 | 0/8 | 147d | 182d |
| leadcourt armed (8) | 3/8 | 1/8 | 0 | 3/8 | 0/8 | 129d | 182d |
| **pooled control** | **5/16** | **1/16** | **0/16** | **4/16** | **0/16** | **147d** | **182d** |
| **pooled armed** | **6/16** | **1/16** | **0/16** | **5/16** | **0/16** | **126d** | **182d** |

No table, no wins — the wall stands.

## Village assessment (plain words)

Sixteen villages lived under the cistern-watch and sixteen without. The watched scholars learned the one thing Violet Pang didn't: they stopped drinking the village's water when the well ran low, walked to the creek, boiled at the hearth, and said so out loud — 97 beats, every one a decision. On the seed where Violet died, both watched scholars lived (one to day 182). The villages themselves did not change: the cistern still emptied on schedule, sat at 0/0 for the same two weeks, and rain still did the refilling. Nobody was put on water duty — the engine has no trigger for it, and the scholar cannot order themselves onto a duty the leader's verb refuses them. The scholar adapted; the village waited for rain. That is #291, unchanged, and it is now measured: the scholar's whole cistern draw is 0.26 L/day against a 24 L/day drain. The village's water problem is not the scholar's thirst. It is the missing duty.

## Blanks filled / documented

- **DOCUMENTED (finding): the scholar's cistern draw is 0.26 L/day on dry days vs ~24 L/day village drain.** Eliminating it (126 → 19 fills) moves cistern 0/0 days only −11%. Any lever that targets cistern 0/0 days without a cistern-input verb is pushing on a string. The engine-side duty trigger (assign villagers to 'water' when dry) remains the steve-call frontier.
- **DOCUMENTED (finding): the watch prevents scholar dehydration deaths on the #291 trajectory** (s55: 1 → 0 both policies; pooled 3 → 1). A scholar-side water lever's honest primary is scholar water deaths, not village cistern days.
- **DOCUMENTED (bug): death-beat repeat** — the reminder beat re-arms the death beat (18 fires, 1 death). Next rebuild latches the death beat separately.
- **DOCUMENTED (sense): day-1 "dregs" copy is dishonest** — the dry threshold engages at the cistern's starting level. Threshold or copy needs revision.

## Metric review (§14 — mandatory)

1. **The primary measured the wrong thing for a scholar-side lever.** Cistern 0/0 days is a village-water metric; the scholar has no cistern-input verb, so the metric was unachievable by construction (0.885× vs the 0.5× bar). The pilot still ran to completion because the miss had to be measured, not assumed — and the measurement is the finding (0.26 L/day vs 24 L/day). Next scholar-water arm: primary = scholar dehydration deaths (3 → ≤1 here) or haven-well fills on dry days (126 → ≤63 here), never village cistern days.
2. **The co-primary's ≥1/day bar mis-modeled a demand-driven leg.** Acts fire only when pack < 3; a stocked pack is the mechanism working, not failing. The instrument-honesty receipt that actually proved the mechanism was haven-well fills on dry days (126 → 19). Next run: co-primary = haven-well fills per dry-haven day (armed < 0.5× control), with acts/day reported as context.
3. **Median guardrail: third instance of the #186/#201 median-perturbation pattern.** Per-seed deltas −133…+110, symmetric, no harm signature in death causes (combat redistribution from tick-cost trajectory divergence; starvation/sickness down). The median moved on noise. Proposal (restated): median as report-only for policy levers, guardrails on death-mode emergence + starvation/sickness counts. For the NEXT run's pre-registration.
4. **Metrics held otherwise.** Identical seeds, death-aware horizons, own-control baseline, REAL RED, full det-gate — all honored; the NO-GO is on the merits, not on procedure.

## Convergence state

**KILLED AT PILOT — NO-GO per §14** (primary 0.885×, co-primary 0.428, median guardrail miss). Layer deleted per kill protocol (`scripts/policies/waterwatch.js` removed; proof/sweep degrade to INFO-SKIP; green backup kept at `~/workspace/waterwatch-layer-20261015.js.green` for the next rebuild). Evidence, proof (50/50), sweep (32 per-seed JSONs), and sense script retained. #291 stays open — the village-side water-duty adaptation is still unaddressed (engine-side trigger, steve-call).

