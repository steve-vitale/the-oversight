# sim-storageshed-b4 — STORAGESHED unpark confirm (2026-10-23)

UNPARK CONFIRM of the parked STORAGESHED lever — the STORAGE half of Steve's
2026-10-21 ruling ("villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the decision). Parked three times
on misapplied metrics: b (rot/100d absolute 0.983 > 0.80), b2 (total
rack-kcal-smoked-during-plenty 0.941 > 0.70, confounded by +74% plenty-day
exposure), b3 (preserved-rot/100d: overall 0.538 GO but belongfeast leg
2.316 > 0.80 NO-GO — confounded by the lever's own plenty-extending
equilibrium on an 8-seed leg). Design spec:
evidence/2026-10-22/sim-storageshed-b.md. Full autopsies:
evidence/2026-10-22/sim-storageshed-b2.md,
evidence/2026-10-22/sim-storageshed-b3.md.

## Implementation (patched, sweep-only until verdict)

The parked patch (~/workspace/storageshed-parked.patch — the corrected
b2/b3 re-implementation, NOT the destroyed-shed-half b-version) was copied
into this worktree and verified to apply CLEANLY to this base
(b47814fa7d3ac20199e1f766bc28c2b514197b56) via `git apply --check`. The
patch is applied sweep-only — never committed unless GO.

Behavior (unchanged from b3):
- Env-gated `_storageShedOn()` (STORAGESHED=0 control; default-ON). No RNG,
  ledger-only state.
- SHED once per cook-day (shedDayByVid gate): on the cook's first resolution
  with eligible about-to-rot surplus (post-dinner-reserve), floor(u/2) units
  of each batch are pushed back to the pantry as an honest fresh copy
  (pre-conversion name, original spoilDay); the rest goes to the racks.
  Tiny stacks (floor(u/2)=0) engage nothing; gate unconsumed.
- DAY-GATED EASED BUDGET: a shed day's rack budget is 2000 kcal across ALL
  resolutions (spent accumulates per resolution on the day record's shed
  flag — the b2 spent-accounting fix). Non-shed days 4000.
- DAY VOICE `_storageShedDayVoice(v)`: once/day after the meal loop,
  rotating speaker, 12-line instead-of-work pool (real work — never idle,
  never storage work), prefix 🍽️◦ distinct from the production half's 🍽️.

## Proof + determinism (run BEFORE the sweep — never sweep on an unproven patch)

- scripts/test-storageshed-b3.js on this base WITH patch applied: 36/36
  green (gate-off RED → gate-on GREEN: shedKcal on fixture, batches halved
  exactly once, once-per-day gate holds across 3 resolutions, no
  compounding, day spent ≤ 2000, tiny stacks engage nothing, dinner
  reserve intact, 🍽️◦ voice once/day, all 12 pool lines reachable).
- Det-gate: patched-gate-off (STORAGESHED=0, seeds 63001/63002 ×
  leadfeast/belongfeast, 40d) fingerprints byte-identical across two
  invocations AND byte-identical to unpatched HEAD — the lever adds zero
  behavior when off, on this base. Ledger never created with gate off.

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- QUESTION: does the STORAGESHED storage-half lever behave as Steve's
  2026-10-21 ruling asks — racks running at about half pace during plenty —
  measured on the exposure-invariant behavioral metric, on a confirm-sized
  corpus?
- LEVER: STORAGESHED (sweep-only env-gated patch; default-ON behavior
  intended on GO).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- POLICIES: leadfeast, belongfeast (competent-player policy + variant).
- SEEDS: 16 FRESH per policy per side (64101–64116; fresh = not used as sim
  seeds by any prior run — verified: 63101–63116 (the task's suggested
  range) are taken by compchan scripts (63101–63108), 63201–63216 by
  killdisc, 63301–63308 by compresence, 63401–63408/63411 by
  watchline/doorpositions, 63501–63508/63511–63516 by vetarm/armory; 64100–
  64115 is the first free contiguous block of 16 in the 64xxx namespace,
  and no evidence/ filename uses 64101–64116 — filename criterion clean).
- HORIZON: 100d death-aware (dead villages stop simulating; +10d tail max).
  Why 100d: the tracker's named horizon for this unpark — the storage
  half's effect window; the lever only fires during plenty, which needs an
  established village; 100d covers establishment + the plenty regime
  without a fixed 200d run.
- PRIMARY (binding GO): per-plenty-day rack rate
  (rackKcalPlenty / rackDaysPlenty, sums-per-side), armed/control ≤ 0.70,
  OVERALL AND PER-POLICY. The stable behavioral measure across three runs
  (b2: ~0.59× on 16 seeds; b3: 0.556 overall, 0.568 leadfeast, 0.567
  belongfeast). Sums-per-side aggregation (not mean-of-per-run ratios) so
  thin plenty days don't dominate.
- GO threshold: ≤ 0.70 (overall AND per-policy).
- SECONDARY (reported, NOT the judge): preserved-rot/100d absolute, with
  the documented equilibrium-confounder caveat (it scales with
  plenty-regime length, which the lever itself extends — b2 +74%,
  b3 +57%; per-policy legs unstable at n ≤ 16).
- ENGAGEMENT (kill-fast): shedKcal > 0 on ≥ 12/32 armed runs. If the shed
  never fires in sims, the lever is decoration — killed-at-pilot.
- GUARDRAILS: (a) median of paired (armed − control) survival diffs ≥ −10d
  (pairs by policy×seed); (b) total starvation deaths armed ≤ control
  (strict); (c) no new death modes at mechanism-class level — roster-aware
  canonicalizer AND the #827 fix (map /expedition/ to its own mode class;
  player expedition deaths are pre-existing content, game.js:8672); (d) no
  median pantry collapse (median end pantry kcal armed ≥ 0.5 × control).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15: the panel is the instrument, the pre-registered threshold is the
  judge. Known contract limitation: env-gated flag → "Unmatched flags"
  (descriptive-by-construction); the manual paired analysis judges.
- Verdict authority: GO ⇒ this is the unpark — land the game-code change
  as the intended DEFAULT behavior (non-env-gated) + proof GREEN +
  evidence + instruments via scripts/safe-commit.sh, in this worktree
  branch only; report "ready for merge". NO-GO ⇒ PARKED again: the patch
  stays sweep-only with ZERO trace in the commit — commit evidence +
  instruments only. Killed arms leave no trace. Per §14 the primary binds:
  a miss is NO-GO, never re-scored against a friendlier metric mid-run.

## metric review (pre-sims design review; updated post-results below)

- The primary is deliberately the behavioral per-day rate, not any total:
  b2 proved totals measure the equilibrium (0.59 × 1.74 ≈ 1.03 ≈ the
  measured 0.94), b3 proved preserved-rot/100d suffers the same
  confounding per-policy. The rate is the only measure stable across all
  three runs (0.59, 0.556, 0.568/0.567). If it moves off ≤0.70 on this
  32-config corpus, the mechanism itself has drifted — that would be a
  lever miss, not a metric miss.
- The engagement gate moved from ≥6/16 to ≥12/32: the lever fired 16/16
  (b2) and 14/16 (b3); the confirm corpus should show the same
  near-universal engagement, else the precondition (plenty) has shifted.
- Guardrail (a) uses paired diffs rather than unpaired medians: the 100d
  horizon censored survival in b3 (32/32 survived), so unpaired medians
  are uninformative; pairing by (policy, seed) keeps whatever within-pair
  signal exists.
- Guardrail (d) is new (end pantry kcal added to the sweep): the shed
  keeps food fresh instead of smoking it; a pantry collapse would be the
  failure mode the fresh-rot trade could hide.
- POST-RESULTS metric review: (to be written after the sweep — every
  evidence file carries this section).

## Results

Sweep: scripts/sweep-storageshed-b4.js, 16 fresh seeds (64101–64116) × 2
policies (leadfeast, belongfeast) × 2 sides = 64 runs, 100d death-aware
horizons, FEASTSCALE_R13=1/SEATDRIVE=0. Proof: scripts/test-storageshed-b3.js
36/36 green on this base with patch applied. Det-gate: patched-gate-off
fingerprints byte-identical across invocations AND byte-identical to
unpatched HEAD (STORAGESHED=0, 63001/63002 × leadfeast/belongfeast).

Adjudication (scripts/analyze-storageshed-b4.js, evidence/2026-10-23/sweep-b4/
— NOTE: the first sweep wrote to /tmp/sim-storageshed-b4/, which a /tmp
reaper wiped mid-run along with its logs; the sweep was re-run to the
worktree on identical seeds/policies/days/code — the sims are deterministic
(det-gate proved byte-identical trajectories), so the regenerated JSONs
are the same data; the analyzer was re-run on the regenerated set and the
numbers below are from that re-run):

- PRIMARY per-plenty-day rack rate (sums-per-side), armed/control:
  **[all] 0.552 → GO** (control 1646/d, armed 908/d; rackDaysPlenty 638→869);
  **[leadfeast] 0.586 → GO** (1673/d → 980/d; days 337→464);
  **[belongfeast] 0.511 → GO** (1616/d → 825/d; days 301→405).
  The behavioral mechanism is confirmed on the confirm-sized corpus: racks
  run at ~0.55× pace during plenty on both policies — the fourth
  consistent measurement (b2: ~0.59×, b3: 0.556/0.568/0.567, b4:
  0.552/0.586/0.511).
- SECONDARY preserved-rot/100d (caveat: exposure-confounded, NOT the
  judge): [all] 0.262 (control 3046 → armed 798); leadfeast 0.265;
  belongfeast 0.256. Far stronger than b3's 0.538 — the equilibrium
  confounder is milder this corpus (rack-days-plenty +36% vs b3's +57%).
- SECONDARY total rack-kcal-smoked-during-plenty (same caveat): [all]
  0.751 (33k → 25k); leadfeast 0.806; belongfeast 0.687.
- ENGAGEMENT: shedKcal > 0 on **28/32** armed runs (need ≥ 12) → GO.
  919 shed-days, 997 shed decisions, 1,394k kcal shed. The lever fires
  reliably; it is not decoration.
- WATCH rot/100d absolute: 31,060 → 24,541 = 0.790 (flag > 1.20×) → ok.
  Split: fresh 26,771 → 23,670; preserved 2,996 → 798.
- WATCH fresh-rot/100d: 0.848 (flag > 1.50×) → ok. The b2-measured trade
  (+53%) did NOT reproduce — b3 measured +24%, b4 measures −15%. The
  left-fresh-surplus trade is corpus-dependent, not a stable cost.
- GUARD(a) median paired survival diff: 0d over 32 pairs (need ≥ −10d) →
  GO. (Unpaired medians both 100d — horizon-censored, as in b3.)
- GUARD(b) total starvation deaths: control 24, armed 26 (need ≤ 24) →
  **NO-GO**. See root-cause analysis below.
- GUARD(c) no new death modes (mechanism classes): raw set-difference
  flagged "expedition" as armed-only (1 death: armed-belongfeast-64116,
  day 65, player died on expedition). Investigation: pre-existing content
  (game.js:8672 — death on expedition), explicitly named as such in the
  pre-registration (#827 fix); the diff adds zero registerDeath calls; the
  lever touches only the cook's smoke-rack code and cannot dispatch
  expeditions. 1/32 vs 0/32 is sampling asymmetry over rare content, the
  same class as b's wave-4 names and b2's "night". → GO with documented
  rationale (not a new mode — a known pre-existing content class).
- GUARD(d) no median pantry collapse: median end pantry kcal control 2k
  → armed 7k = 3.464× (need ≥ 0.5×) → GO. The pantry is fuller, not
  emptier.
- GUARD channel laundering: no named inflow channel > 2× control → GO.
- Wall: national(end) 16 → 12 (reported, not a guardrail — both directions
  occur across 10 differing pairs; no mechanistic path from rack
  economics to rank progression); table 0 both; wins 0 both (SEATDRIVE=0,
  structurally 0); wave-4 16 → 14; wave-5 0 both; paired survival median
  0d. The scale wall stands.

### Root cause of the guardrail (b) miss (measured, not guessed)

Paired starvation diffs (armed − control) by (policy, seed): leadfeast
net 0 (+1,−2,0,−2,+2,+1,0,0,−1,+1); belongfeast net +2
(+1,0,−1,−1,+2,+1,−1,0,+1). Symmetric small diffs — no seed shows a
lever-driven starvation pattern. Exposure: armed villages systematically
kept MORE villagers alive longer (e.g. leadfeast-64102: control died day
77/roster 5, armed survived 100d/roster 7; belongfeast-64101: control lost
the village day 82/roster 0, armed 100d/roster 8) — more villager-days of
exposure mechanically creates more starvation-death opportunities in raw
totals. Mechanism: there is NO path from "smoke less during plenty" to
more starvation — the pantry median is UP 3.46×, fresh rot is DOWN, the
shed keeps food fresh for the fresh-first nightly meal. The +2 is noise +
exposure, against the mechanistic gradient.

The miss is a GUARDRAIL-CALIBRATION miss, not a lever miss: the
pre-registered bound (strict armed ≤ control) over-tightened the
historical calibration (b/b2/b3 all used control+2 slack) with no
justification, on raw totals with no exposure normalization. Under the
historical bound the check passes (26 ≤ 26). Per §14 the pre-registered
bound still binds — the NO-GO stands, and the calibration fix belongs to
the NEXT run's pre-registration (see metric review), not to this run's
verdict.

The lever is NOT confirmed harmful: primary GO on all three legs,
engagement 28/32, survival flat, pantry fuller, no new death modes, no
channel laundering. Per Steve's kill discipline (2026-10-21), a missed
bar is not a kill. **PARKED, not killed** — fourth parking, same standing
as the three prior runs.

## Sense test

SENSE-TESTING LAW (Steve 2026-10-11): the shed fiction must read as people
preserving food, not numbers moving. Sense run: 60d armed, seed 64102,
leadfeast (scripts/sense-storageshed-b3.js).

15 🍽️◦ shed voice lines, 15/15 unique, 0 consecutive-day verbatim repeats,
3 distinct speakers (Nokuthula, Yara, Nadia). The lines name real
instead-of work — patching boots ("half the haven's leaking"), tending
fever cases, splitting firewood, tending the hearth ("someone keeps the
stories"), sitting with the elders, sharpening skinning knives, weeding
gardens, mending nets, mending the palisade — never idle, never storage
work. The verbs are rack-honest: "stacks the unworked strips back on the
fresh pile", "leaves the racks half-loaded", "banks the smoke fire down to
coals", "closes the smokehouse door on a half-load" — the fiction is the
absence of rack work, which is exactly what the mechanism does. On shed
days both voices fire (15/15 shed days also voiced plenty) and the 🍽️◦ vs
🍽️ prefixes read distinct — the blend blank stays filled. The day stream
around shed days reads like a living village (water runs, wood hauling,
meals, gossip, fire-tending, harvest triage at a full pantry). No robotic
repetition. The village acts like people deciding the racks can wait.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
evidence/2026-10-23/sweep-b4/telemetry-<side>.json --metrics
national,table,wins,exiled` → LOUD: "table disappeared: baseline 16 →
current 0", "wins disappeared: baseline 16 → current 0" — on BOTH sides
identically. Investigated same-run: EXPLAINED, regime artifact, not a bug.
The baseline file's own _regime block says: "DO NOT compare pre-seat /
courtship / readiness substrates against this baseline — wins are
structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins
disappeared'." The baseline is the winseat regime (SEATDRIVE=1, ~100%-win
suite); this run is SEATDRIVE=0 where wins/table are structurally 0 (same
spurious pattern documented in sim-armordrive.md 2026-10-22). The national
metric did NOT fire (16→12 is within the <0.6 relative-change rule).
No lever-attributable telemetry deviation.

## Balanced panel (§15)

Before panel `evidence/2026-10-23/storageshed-b4-panel-before/`: 32 cases
(16 fresh seeds 64101–64116 × {leadfeast, belongfeast}, 100d,
FEASTSCALE_R13=1, SEATDRIVE=0, STORAGESHED=0), sourceHead b47814fa7d3a,
sourcesStable, neutrality 2/2 match. After panel
`evidence/2026-10-23/storageshed-b4-panel-after/`: 32 cases (same
options/seeds, STORAGESHED=1; 15 jobs reused from the partial run that a
/tmp wipe interrupted — the panel cache verified them), 32 rows,
sourcesStable, neutrality 2/2 match. Case JSONs live in the panels'
cases/ dirs (not committed — panel case caches never commit);
panel.json.gz for both sides committed.

Compare `storageshed-b4-panel-compare.{json,md}`: **Decision: invalid —
Unmatched flags** (STORAGESHED=0 vs STORAGESHED=1). This is the
pre-registered contract limitation for env-gated levers: the env flag IS
the lever, so comparator options can never match. The panel as instrument
is sound — matched seeds/policies, stable sources, green neutrality,
observer/contract/source digests identical across sides — but the
automated compare cannot score it (descriptive-by-construction). Manual
paired row analysis on the 64-config sweep (identical seeds): national
16→12, table 0→0, won 0→0, wave4 16→14, wave5 0→0, median paired survival
diff 0d; death-class diffs are the expedition sampling asymmetry
documented above, no new lever-caused classes. No broad-balance
footprint; the sweep's pre-registered threshold remains the judge:
PRIMARY GO on all legs, guardrail (b) NO-GO → **PARKED**.

## Reachability / wall

Waves 1–5: wave-4 reached 16/16 control → 14/16 armed; wave-5 0/32 both
(the wave-5 wall stands — unchanged by this lever). Arc: not separately
tracked (rank reached global/national). Regional → national: national(end)
16 → 12 (reported; both directions across 10 differing pairs — noise, no
mechanistic path). Table: 0 both. Wins: 0 both (SEATDRIVE=0 substrate).
Vests: not tracked. The lever does not gate or unlock any content — it is
a behavioral economic lever, reachability-neutral.

## Village assessment

The village during plenty: the pantry reads >4 fresh days, the cook still
cooks the haven meal, and the racks run at ~0.55× pace — one shed decision
per cook per day, named honestly, 919 shed-days across the 32 armed runs.
The pantry ends fuller (median 7k vs 2k kcal), preserved rot collapses
(2,996 → 798/100d), and the fresh-rot trade that b2 measured (+53%) does
not reproduce (−15% this corpus) — the village keeps more food fresh than
before and the nightly meal mostly keeps up.

Who thrived: villages reaching sustained plenty kept food fresh longer
(rack-days-plenty 638 → 869) and kept more villagers alive to the horizon
(the exposure behind the starvation-count noise). Who died: wave-3/4
monsters dominate both sides, plus early-collapse seeds (64103/64113: both
sides dead by day 23–32, starvation 1/1 and 4/4 — identical). What was
missing: the instead-of work remains narration-only; the cook's assignment
doesn't mechanically change (they still cook, just less rack work). Honest
(the voice claims the absence of rack work, not a fictional reassignment),
but a future pass could make the instead-of work real. The expedition
death (1, armed side, day 65) is pre-existing content, not a lever effect.

## Blanks filled / documented

- FILLED (instrument): b4 sweep + analyzer with the exposure-invariant
  primary (per-plenty-day rack rate, sums-per-side), the #827 expedition
  canonicalization fix, and the new end-pantry-kcal guardrail metric.
- FILLED (seed hygiene): 64101–64116 verified fresh by script-seed scan +
  evidence-filename scan (the task's suggested 63101–63116 range is taken
  by compchan; 6320x by killdisc; 6330x by compresence; 6340x by
  watchline/doorpositions; 6350x by vetarm/armory).
- DOCUMENTED (open): the instead-of work remains narration-only.
- DOCUMENTED (open): the starvation guardrail needs exposure normalization
  or the historical control+2 slack (see metric review).
- DOCUMENTED (open): the fresh-rot trade is corpus-dependent (+53% /
  +24% / −15% across b2/b3/b4) — not a stable cost to design against.

## metric review (post-results)

- The primary (per-plenty-day rack rate ≤ 0.70) is now confirmed STABLE
  across FOUR measurements on three corpora (0.59, 0.556, 0.568/0.567,
  0.552/0.586/0.511) — it is the right judge for this lever and should
  stay the primary for any future unpark. The equilibrium confounder is
  real but milder than b2/b3 feared (+36% plenty-days this corpus).
- Guardrail (b) as pre-registered (strict raw totals) is miscalibrated:
  it ignores exposure (armed villages keep more villagers alive longer)
  and I over-tightened it from the historical control+2 slack without
  justification. Proposed for the NEXT run: starvation deaths per
  1000 villager-days (exposure-normalized), or restore the calibrated
  control+2 bound. Do not re-judge this run's (b) on the friendlier
  bound — the NO-GO stands per §14.
- Guardrail (c)'s naive set-difference implementation false-flags known
  content classes that appear on one side by sampling (expedition, the
  third such flag in four runs). The pre-registration already names
  expedition as pre-existing content; the analyzer should whitelist
  pre-registered content classes rather than relying on post-hoc
  rationale. Measurement fix for the next run.
- The 100d horizon censors the survival guardrail (unpaired medians both
  100d); the paired-diff formulation (a) salvaged it (0d over 32 pairs).
  Keep the paired formulation.
- preserved-rot/100d as a secondary behaved dramatically better this
  corpus (0.262) than b3 (0.538) — the equilibrium confounder's strength
  is itself corpus-dependent. It remains a secondary, never the judge.

## Verdict

**NO-GO on pre-registered guardrail (b) (26 > 24, strict) — PARKED, not
killed.** Per §14 the miss binds: the lever does not land as a GO. Per
Steve's kill discipline (2026-10-21), a missed bar is not a kill: the lever
is not confirmed harmful — the primary passes decisively on all three
legs (0.552/0.586/0.511), engagement is 28/32, survival is flat, the
pantry is fuller, no new death modes, no channel laundering, and the (b)
miss root-causes to guardrail miscalibration (raw totals, no exposure
normalization, over-tightened from the historical bound), not to lever
harm. Killing it would override Steve's design direction on the basis of
my guardrail choice. The parked patch (~/workspace/storageshed-parked.patch,
the corrected re-implementation) is verified applying cleanly to this
base; it stays sweep-only with zero trace in the commit. The evidence
records the NO-GO and the metric review for the next unpark (proposed:
exposure-normalized starvation guardrail; keep the per-plenty-day rack
rate primary).
