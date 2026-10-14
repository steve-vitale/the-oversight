# LEDGER-BLIND UNLOADS — arm verdict (scale-onramp r29 ARM 1, 2026-10-14)

Axis: scale-onramp, food-distribution lens (lever 0 as lens, lever-5 ledger as target).
Blank: sim-findings #154 — the forager homecoming split (game.js returnToVillage)
computes givenKcal for the say line ("unload 1260 kcal into Haven's pantry") but
never writes v.gives[vid] and never calls recordGiveHist. The r28 scholarreserve
diagnostic (evidence/2026-10-14/sim-scholarreserve.md) measured the causal chain:
takeFromPantry + meals write cumulative v.takes with -2 trust per take at
net<-5000, while homecoming unloads are ledger-invisible — 30d: s11
takes=42148/gives=0/trust=0. This arm is the prescribed engine fix: record the
unload as gives (one-line class), mirroring donateToPantry's accounting contract.

**VERDICT: KILLED per §14 — primary missed (3.7% vs 25% bar), median guardrail
missed on the letter. The fix was proven correct (proof 6/6 RED->GREEN) and
fires on 14/16 runs, but it does not move the bind it was built to address.
Game-code change REVERTED byte-clean per kill protocol; scripts + evidence land.**

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **FIX**: at the Haven homecoming unload site (game.js, after `givenKcal`
  computed), record the unload with the exact donateToPantry contract:
  `vv.gives[this.villagerId] += givenKcal` + `this.recordGiveHist(this.villagerId,
  givenKcal)` when givenKcal > 0. NO trust grant (unlike donate): automatic
  pooling is not a gift, and the REVOKE LEDGER doctrine has nothing to revoke.
  Out of scope: the exile-amends unload at another village's fire (~7494) —
  that writes to `ov.pantry` (the OLD village's pantry), a different village
  entity; its ledger treatment is a separate design question.
- **Sign conventions verified by reading, not guessing**: net = gives − takes
  (positive = contributor). An unload INTO the pantry is a give (+); a meal
  taken OUT is a take (+). donateToPantry writes `v.gives[vid] += kcal` +
  recordGiveHist; villagerMealDay's shared surplus writes `v.gives[vid] +=
  Math.round(gave)` + recordGiveHist when gave > 0. The fix mirrors both.
  The freeloader judgment proper uses `takeRate7 − giveRate7` (r9 fair-share
  machinery) — recorded unloads feed exactly that. The effort-gate block reads
  cumulative `gave` but applies only to non-players, so no double-counting.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x belongseek/leadcourt = 16
  combos, 180d death-aware, det-gate required 8/8 identical per side before
  trusting the comparison.
- **PRIMARY**: half-ration-day share reduction >= 25% vs control (suite share =
  total halfRationDays / total gameDays; half-ration detected via the engine's
  own meal line "(Half ration — they don't trust you yet.)", same instrument
  class as the r28 census, proven read-only).
- **GUARDRAILS**: median survival >= control (one-sided, no regression);
  national >= control−1; exiled run-count unchanged. (Note #150: median is
  report-only class per the loop's own noise finding — reported both ways.)
- **Noise handling (#150/#159)**: the primary must also clear 2x the measured
  A/A spread to count as GO.

## The fix (applied, proven, then reverted)

Diff (14 insertions, game.js, now reverted byte-clean — verified: 0
"LEDGER-BLIND UNLOADS" matches post-checkout, proof test back to pristine RED):

```js
const givenKcal = Math.round(give.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0));
// LEDGER-BLIND UNLOADS (longsim scale-wall r29 2026-10-14, lever 0):
// the homecoming unload feeds the village, so it is a GIVE — same
// two-line accounting contract as donateToPantry and villagerMealDay's
// shared surplus: cumulative v.gives[vid] + dated recordGiveHist for
// the r8/r9 fair-share rate machinery. No trust grant here (unlike
// donate): this is automatic pooling, not a gift — the grant/revoke
// doctrine lives in donateToPantry and has nothing to revoke here.
if (givenKcal > 0) {
  try {
    vv.gives = vv.gives || {};
    vv.gives[this.villagerId] = (vv.gives[this.villagerId] || 0) + givenKcal;
    this.recordGiveHist(this.villagerId, givenKcal);
  } catch (e) {}
}
```

## Proof test (scripts/test-ledgerunload-20261014.js)

- **RED on pristine**: homecoming unload of exactly 2500 kcal pools (pantry
  +2500) but `v.gives[vid]` unchanged (0) and no giveHist entry — 2 FAIL as
  required. Say line honest ("unload 2500 kcal into Haven's pantry").
- **GREEN after fix**: `v.gives[vid]` diff == pooled kcal exactly, one dated
  giveHist entry with that kcal and the current day — 6/6 PASS.
- **Non-regression**: pure takeFromPantryBulk fixture at net −60000 keeps its
  exact −2 trust delta and +400 takes write on the fixed build — the take
  path is untouched. (Passes on pristine too, as required.)
- **Post-revert check**: after the byte-clean checkout, the test returns to
  the identical pristine RED (same 2 fails) — the fix left no trace.

## Det-gate (scripts/sweep-ledgerunload-20261014.js --invocations=2)

- **Armed: 16/16 IDENTICAL. Control: 16/16 IDENTICAL.** The brief's hard gate
  is met on both sides; in-process A/A spread on the primary metric is
  exactly 0.00000 both sides. Cross-side divergence is a deterministic
  consequence of the fix, not #113 noise.

## Before/after on identical seeds

| run | days A/C | hrShare A/C | national A/C | table A/C | unload kcal (A) |
|---|---|---|---|---|---|
| belongseek:11 | 180/180 | 0.445/0.478 | 1/1 | 0/0 | 50350 |
| belongseek:22 | 97/94 | 0.189/0.179 | 0/0 | 1/0 | 7890 |
| belongseek:33 | 39/124 | 0.375/0.112 | 0/1 | 0/0 | 12060 |
| belongseek:44 | 180/180 | 0.319/0.333 | 1/1 | 0/0 | 26235 |
| belongseek:55 | 175/175 | 0.222/0.222 | 1/1 | 0/0 | 0 |
| belongseek:66 | 156/129 | 0.342/0.392 | 1/1 | 0/0 | 28765 |
| belongseek:77 | 40/38 | 0.415/0.436 | 0/0 | 0/0 | 7945 |
| belongseek:88 | 64/123 | 0.154/0.069 | 0/0 | 0/0 | 38860 |
| leadcourt:11 | 51/51 | 0.712/0.712 | 0/0 | 0/0 | 1200 |
| leadcourt:22 | 96/82 | 0.186/0.193 | 1/0 | 0/0 | 19250 |
| leadcourt:33 | 97/129 | 0.143/0.107 | 0/0 | 0/0 | 32070 |
| leadcourt:44 | 113/122 | 0.439/0.645 | 1/1 | 0/0 | 19940 |
| leadcourt:55 | 107/107 | 0.231/0.231 | 1/1 | 0/0 | 0 |
| leadcourt:66 | 180/100 | 0.412/0.743 | 1/1 | 1/1 | 48130 |
| leadcourt:77 | 38/44 | 0.436/0.378 | 0/0 | 0/0 | 7080 |
| leadcourt:88 | 79/47 | 0.100/0.170 | 0/0 | 0/0 | 47620 |

Suite totals (invocation 1; invocation 2 byte-identical):

| metric | control | armed | delta |
|---|---|---|---|
| half-ration-day share | 0.3258 (563/1728) | 0.3139 (532/1695) | **−3.7% (GO needed −25%)** |
| median survival | 122d | 97d | **−25d (guardrail: >= control)** |
| national | 8/16 | 8/16 | ok (>= 7) |
| table | 1/16 | 2/16 | ok (report) |
| wins | 0/16 | 0/16 | — |
| exiled | 0/16 | 0/16 | ok (unchanged) |
| max wave | 4 | 5 | report |
| trust<30 scholar-days | 1724 | 1690 | −2.0% |

## Mechanism probe (scripts/probe-ledgerunload-20261014.js)

The fix FIRES: 14/16 armed runs recorded homecoming unloads (12–59 unloads,
1.2k–50k kcal per run). The mechanism is live — the ledger hole is being
filled. But the half-ration share barely moved. Reading the transcripts, the
reason is structural: the unload gives are small against the take volume.
belongseek s11 recorded 50,350 unload kcal — yet takes were 54,434 and
trustEnd stayed 0 with half-ration meals through d72. The r28 vicious cycle
(competentEat compensates with more takes → more −2 hits) absorbs the
recorded gives: the fix narrows the net hole but doesn't lift it out of the
−5000 cumulative band on the runs that need it. On runs where trust recovered
anyway (s33: full-ration meals by d23 via tribute/gift channels), the fix is
redundant. The arm addressed the accounting correctly but the bind is
take-VOLUME, not give-invisibility.

## Divergence notes (real, not noise)

The fix deterministically moved trajectories ±80d: leadcourt s66 +80d
(100→180, reached table), belongseek s33 −85d (124→39), belongseek s88 −59d
(123→64), leadcourt s33 −32d. All three regressions recorded real unload kcal
(12–32k), so the trust change is the driver — but HOW more trust shortens a
run is unexamined (hypothesis: faster trust recovery → full rations → faster
pantry drain under raid pressure; s33's transcript shows nightly raids
stripping 1000–1760 kcal). Documented, not chased — filed as a sim-finding.

## Sense-test (SENSE-TESTING LAW)

Read unload-day beats on 4 runs (belongseek s11/s33, leadcourt s33/s66).
The unload say line is UNCHANGED by the fix and reads honestly beside the
half-ration meal line that names the reason: "You keep a day's food (1970
kcal) and unload 870 kcal into Haven's pantry." next to "Village meal: +300
kcal… (Half ration — they don't trust you yet.)" Trust consequences read as
village decisions, not dispenser text: Priya "Why should I listen to you?",
"You haven't earned that yet", Irving shaking his head, June weeping at a
real gift to Ashford. Raids, tribute arrears, and starving-village gossip
read as people. No robotic flags. The fix adds no narration — the ledger is
invisible to the fiction, as it should be.

## Village assessment

- **s33 (both policies)**: the raid spiral. Nightly raids (Emberhold,
  Hungry Road) stripped 1000–1760 kcal/night while the scholar unloaded
  12–32k total and the village gifted Ashford 2000 kcal. STARVING signals
  from d17. Armed died much earlier than control — the open divergence
  question.
- **s66 (leadcourt)**: the win for the arm. 48k unload kcal recorded, trust
  recovered, village survived to 180d and reached the table (the only table
  on the armed side besides belongseek s22's). Full beats: the d46 System
  network-online line, then steady ranging.
- **s11 (belongseek)**: the vicious cycle incarnate. 50k unload kcal
  recorded, takes 54k, trust pinned at 0, half-ration through d72, 180d
  survival. The fix fired hardest here and changed nothing — the take-volume
  bind swallows it.
- **s55 (both)**: no unloads at all (0 kcal) — trajectories byte-identical
  across sides. The fix is inert where scholars keep everything.
- The scale wall stands: 0 wins, 2/16 table armed (1/16 control), national
  8/16 both sides. Villages die of the combat bleed + hollow + raids before
  the on-ramp.

## Reachability verdict

Waves 1–5 reachable (armed hit wave 5 on leadcourt s66). Regional→national
on 8/16 runs both sides. Table: 2/16 armed vs 1/16 control — the arm's one
bright spot, not a verdict. No wins on any seed. The ledger fix does not
open or close any content gate.

## Blanks filled / documented

- **sim-findings #154 — ADDRESSED AND MEASURED, KILLED AS A LEVER.** The
  accounting hole is real (proven RED), the one-line fix is correct (proven
  GREEN, fires on 14/16 runs), and it does not move the bind: −3.7% vs the
  25% bar. The bind is take-VOLUME (the cumulative −2 gate fires on 60+
  takes/day), not give-invisibility. Recording unloads is honest bookkeeping
  but not a lever. The proven patch is preserved in the evidence diff above
  for re-application if a future arm needs honest gives (e.g. paired with
  the take-discipline policy seed #156 or the cumulative-penalty routing
  #155).
- **New open blank: UNLOAD-TRUST DIVERGENCE** — the fix moved survival ±80d
  deterministically (s33/s88 worse, s66 better). Whether faster trust
  recovery can starve a raided village (full rations → faster pantry drain)
  is unexamined; a future arm should test trust-recovery speed against raid
  pressure before any trust-side lever ships.

## Metric review (§14, mandatory)

- PRIMARY (half-ration-day share −25%): MISSED — measured −3.7%, A/A spread
  0.00000 (real delta, far below the 2x-spread floor AND the 25% bar). NO-GO
  per §14. Not re-scored: the bar was pre-registered and the miss is
  unambiguous.
- GUARDRAIL median survival (>= control): MISSED on the letter (97 vs 122d).
  Per sim-findings #150 this guardrail is report-only class (tighter than
  the cross-process #113 noise); reported here as miss-on-letter,
  report-only-per-#150. The primary miss is decisive regardless.
- GUARDRAIL national (>= control−1): PASS (8 >= 7). Exiled: PASS (0 = 0).
- Instrument honesty: the say-wrap class was proven read-only by the r28
  census (40/40 byte-identical); this run's 16/16 det-gate on both sides
  additionally guards every combo.
- Metric concern for future arms: half-ration-day share has a floor problem —
  on seeds where trust recovers through gift channels the fix is redundant,
  and on pinned-at-0 seeds the take volume swallows it. A future arm on the
  trust ledger should pre-register scholar trust-days<30 or the takes/gives
  net directly, not ration share.

## Convergence report

- Convergence: killed-at-measurement. Axis scale-onramp: still blocked
  (0/16 wins; the ledger fix is not a scale lever).
- Wall numbers this run (armed side, 16 combos): national 8/16, table 2/16,
  wins 0/16, wave 4–5 unlocks on 5/16 (max wave 5), median survival 97d.
