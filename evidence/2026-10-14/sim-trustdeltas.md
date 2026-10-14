# TRUST-DELTAS-BY-SOURCE — arm verdict (scale-onramp r32, diagnostic, 2026-10-14)

Axis: scale-onramp, trust lens (lever 5 as lens).
Blank: sim-findings #182 — "TRUST<30 HAS NON-PENALTY DRIVERS." The mealonly
pilot (loop B r32b) removed the −2/take sting's fuel line entirely (voluntary
takes = 0 armed) yet the trust<30 scholar-day share did not move (0.99x
belongseek) and trust>=30 days fell on both policies. Something OTHER than
the per-take penalty holds trust below 30. This arm instruments trust
DELTAS BY SOURCE — no lever, no game-code change, a diagnostic.

**VERDICT: GO — taxonomy complete, and #182 is ANSWERED in numbers.** The
per-take sting is 96% of the sitting scholar's FLOW drains (−514 of −534)
but removing it in-silico recovers only 46 days>=30 (+3.3%) — because 91.6%
of below-30 scholar-days (601/656) sit in tenures that were BORN below 30
and never climb out, not tenures drained below it. The non-penalty drivers:
(1) succession landings below 30 (p10 start-trust 15; 19 born-below
tenures); (2) near-zero flow gains while sitting (+164 across 16 combos —
nothing lifts the born-below out); (3) the succession haircut (successors'
own 90 → office 62 median); (4) trivial residual drains (convo-fallout
−16, fireside −4). There is NO trust decay — the periodic-drain hunt finds
only the sting on a regular cadence; tickNeeds and overcrowding both skip
the scholar's own vid. The progressive curve does NOT bind at 30 (eff 1.00
below 30, 0.97 at 30–49, 0.54 at 50+). The in-silico ablation (+46 days)
agrees with the mealonly pilot's real measurement (trust>=30 days FELL):
the mechanism is structural — inheritance landings + gainlessness — not
the sting.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **INSTRUMENT**: scripts/trustdeltas-20261014.js — harness-side delta layer
  on the r31 census (scripts/trustgain-20261014.js, reused unchanged).
  Reuses: Proxy on state.village.trust (every write, delta + caller),
  trustGainProgressive wrap (base vs applied), _trustGain wrap (link-trust
  currency, separate), bumpTrust reason capture, resolveConsequence name
  capture, say buffers. Adds: (1) succession-set decomposition (office-40%
  / own-40% / vouch / floor-10, reconstructed read-only from the writes
  log); (2) tenure decomposition (per-scholar-tenure strict deltas,
  start/end trust, crossed-30 flags, below-30 attribution: born-below vs
  drained-below); (3) sting ablation (in-silico replay without
  drain:pantry-take-sting, clamp-faithful — the counterfactual the mealonly
  pilot measured for real); (4) periodic-drain hunt (the #182 "trust decay"
  hypothesis); (5) progressive-at-threshold (scholar-gain applied/base by
  trust band). Read-only by construction; no RNG draws inside the
  instrument. SUCCESSION-AWARE per the r30 lesson: no per-vid ledger reads
  — every write is an event, lineage joins by strict (day, vid) map.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x belongseek/leadcourt = 16
  combos, 180d death-aware, det-gate required 16/16 identical before
  trusting the census (scripts/sweep-trustdeltas-20261014.js --invocations=2).
- **PRIMARY**: trust deltas attributed to sources across the full suite —
  complete taxonomy (every source named, its share of positive and negative
  deltas, per 100 village-days); the NON-PENALTY drivers of trust<30 named
  WITH NUMBERS (which sources hold it down, how much each contributes);
  ledgers successor-aware (strict per-day lineage).
- **GO**: complete taxonomy + named non-penalty drivers with numbers.
  DIAGNOSTIC arm — verdict = the taxonomy + the answer to #182.
- **PROOF**: scripts/test-trustdeltas-20261014.js — instrument proof with
  REAL RED phases (silence on nothing; classification sign-split;
  succession-decomposition fixture office 60/own 20/vouch 8 → 40;
  largest-|delta| SET selection; tenure-attribution fixture;
  ablation-replay fixture incl. set:-skip; junk-write classification) and
  GREEN on an honest run (zero unclassified, tenures built, ablation
  replayError 0, periodic hunt + progressive run). 39/39 PASS.
- **GO on taxonomy completeness, else KILL per §14.** A miss is NO-GO,
  never re-scored against a friendlier metric mid-run.

## Proof test (scripts/test-trustdeltas-20261014.js) — 39/39 PASS

- **RED on nothing**: fresh census, no acts → zero writes.
- **RED on classification**: applyRep −3 → drain side, +3 → gain side;
  pure channels keep r31 names; unknown callers surface (drain:other-*).
- **RED on decomposition**: synthetic succession (office 60, own 20,
  vouch 8) → neu 40, check ok; largest-|delta| SET picked over +1 noise.
- **RED on tenure attribution**: born-below / drained-below-mixed /
  held-above / born-below-mixed fixtures all classify correctly.
- **RED on ablation**: replay math exact; set: writes skipped (the −458
  phantom-day bug caught here, not in the suite).
- **RED on junk**: groundingReactionBeats −2 → drain:relay-fray-junk.
- **GREEN on honest run**: seed 11 leadcourt 20d — zero unclassified,
  tenures built, ablation replayError 0, hunt + progressive run.

Two instrument bugs were caught and fixed during the build (both had REAL
RED phases written before the fix): (1) the ablation double-counted
succession SETs (startTrust is already post-SET) — net-negative SETs
deflated the ablated stream by a phantom −458 days; fixed by skipping
set: channels in both replay streams. (2) the decomposition took the first
playerDeath-caller write instead of the SET — the death flow emits small
+1 writes alongside the SET; fixed by taking the largest |delta| on the
succession window.

## Det-gate (scripts/sweep-trustdeltas-20261014.js --invocations=2)

- **16/16 IDENTICAL** (day-hash A/A per combo, instrument installed).
  In-process A/A spread on every metric is 0. The instrument does not
  perturb determinism; the census numbers are trustworthy.
- Evidence: evidence/2026-10-14/trustdeltas-sweep.log (first run, 32 runs).

## The delta census (16 combos, 180d death-aware, 16,899 village-days)

### Complete delta taxonomy — sitting scholar (strict per-day lineage)

DRAINS (per 100 village-days):

| source | −/100vd | total | share of scholar drains | fires | combos | what it is |
|---|---|---|---|---|---|---|
| set:succession-inherit | −10.60 | −1,791 | 77.0% | 110 | 15/16 | SET, not flow — the successor's own entry discounted to the office (see decomposition) |
| drain:pantry-take-sting | −3.04 | −514 | 22.1% | 261 | 13/16 | −2 per take (thief −20 never fired; gift-takeback never fired) |
| drain:convo-fallout | −0.09 | −16 | 0.7% | 8 | 9/16 | conflict fallout (−2) |
| gain:fireside-conflict− | −0.02 | −4 | 0.2% | 2 | 11/16 | cold-shouldered side of fireside conflicts |

GAINS:

| source | +/100vd | total | share of scholar gains | fires | combos | what it is |
|---|---|---|---|---|---|---|
| set:succession-inherit | +1.11 | +188 | 53.4% | 110 | 15/16 | SET — positive inheritances |
| gain:objective-tick | +0.37 | +63 | 17.9% | 63 | 16/16 | objective ticks landing on the scholar |
| gain:social-away | +0.33 | +56 | 15.9% | 52 | 16/16 | walked out together / visits |
| gain:event-stranger | +0.19 | +32 | 9.1% | 4 | 4/16 | stranger events |
| gain:fireside-conflict+ | +0.02 | +4 | 1.1% | 2 | 11/16 | sided-with side |
| gain:assignment-deed | +0.02 | +3 | 0.9% | 3 | 16/16 | haven work (the village's +35/100vd engine barely touches the scholar) |
| gain:rep-drift+ | +0.02 | +3 | 0.9% | 3 | 16/16 | witness ripple |
| gain:donate-unload | +0.02 | +3 | 0.9% | 3 | 2/16 | pantry donations |

FLOW-ONLY (excluding set: transfers): gains **+164** vs drains **−534**
across 16 combos. The sting is **96.2% of flow drains**. The scholar's own
deeds earn essentially nothing — the trust economy flows between NPCs.

The brief's named sources, measured: per-take stings −514 (above); meals —
the village meal is trust-GATED (half ration below 30), not a trust
source, zero writes; gifts (giveFood) — zero fires (dead channel, r31);
grief-comfort — zero fires (dead); amends — zero fires (dead); teaching —
2 fires, +4 total; decay — DOES NOT EXIST (see periodic hunt); succession
inheritance — the SET (see decomposition); vouch — median +4 (see below);
link-trust vs villager-trust — separate currencies, no bridge (r31; the
courtship verbs feed link-trust +2,867, never villager-trust).

### Complete delta taxonomy — village-wide (context)

Top drains: set:succession-inherit −13.97/100vd · drain:lead-friction
−7.67 (648 fires, 16/16 — on contenders, not the scholar) ·
drain:pantry-take-sting −3.15 · gain:rep-drift− −3.07 (negative witness
ripple) · drain:auto-recruit −2.33 (skips the scholar's vid by design) ·
drain:ignored-ask −0.71 (on NPC requesters, not the scholar) ·
drain:convo-fallout −0.34 · gain:fireside-conflict− −0.28 ·
drain:intake-overrule −0.11 · drain:theft-confrontation −0.09.
SETs: set:newcomer-trust +6.45/100vd (not earned) ·
set:succession-inherit +3.50/100vd gross (+188 scholar-scoped).

### Succession-set decomposition: where the scholar's trust actually comes from

85 successions decomposed (5 with reconstruction noise — stale office
snapshots, documented below; 80 clean).

| component | median | notes |
|---|---|---|
| inherit (neu) | 62 | p10 28 — one in ten successions lands at or below 28 |
| office (40%) | 52 | the dead bearer's entry, discounted |
| own (40%) | 90 | the successor's villager-built entry — typically HIGH |
| vouch | +4 | elders' vouching, identifiable 85/85 |

The succession is a **90→62 haircut**: the village trusts the successor
personally at 90 (built through work), but the OFFICE only carries 62
(0.4×52 + 0.4×90 + 4 = 60.8). The discount is the design — the office's
standing, not the person's. Floor 10 never bound (0/85 clamped); the
ceiling never bound either. The 5 noisy decompositions (vouch not a
multiple of 4) are stale-office snapshots in the reconstruction, not
engine anomalies — the SET write and the office read race within the
death flow.

### Below-30 attribution: what holds trust under 30 (101 tenures, 2,067 scholar-days)

trust<30 scholar-day share: **0.3174** (656/2,067) — matches r31's 0.36
within noise.

| class | below-30 days | share | tenures | reading |
|---|---|---|---|---|
| born-below | 601 | 91.6% | 19 | start < 30, never reach 30 — STRUCTURAL |
| drained-below-mixed | 45 | 6.9% | 5 | start ≥ 30, drained below at some point |
| born-below-mixed | 10 | 1.5% | 2 | start < 30, briefly cross, fall back |
| held-above | 0 | 0.0% | 75 | never below 30 |

Tenure start-trust: median 54, p10 15, max 86. Three in four successions
land the scholar above 30 and those tenures stay there. But 19 tenures
(19%) land below 30 — and with +0.97/100vd flow gains, they NEVER climb
out (601 days, zero crossings). **The below-30 problem is a birth problem,
not a drain problem.**

### Sting ablation: the in-silico twin of the mealonly pilot

Replay every tenure's delta stream without drain:pantry-take-sting
(clamp-faithful, set: transfers excluded as initialization):

- days>=30: actual **1,411** → ablated **1,457** — **+46 days (+3.3%)**.
- Max replayError 2 (replay faithful to the sampled trajectory).
- Per-seed: only 3/16 combos gain >0 days (belongseek-s22 +13,
  belongseek-s55 +30, belongseek-s88 +3); 13/16 gain nothing.

The mealonly pilot measured the real thing (voluntary takes = 0):
trust>=30 days FELL on both policies. The in-silico twin agrees — removing
the sting moves almost nothing, because the born-below tenures are pinned
by gainlessness, not by the sting. **Two independent measurements, same
verdict.**

### Periodic-drain hunt: is there trust decay? (#182's hypothesis)

For the sitting scholar, grouped by source:

| source | total | fires | cadence |
|---|---|---|---|
| drain:pantry-take-sting | −514 | 261 | **REGULAR** (median gap ≤ 2d) |
| set:succession-inherit | −1,791 | 72 | irregular (one-shot transfers) |
| drain:convo-fallout | −16 | 8 | irregular |
| gain:fireside-conflict− | −4 | 2 | irregular |

**No trust decay exists.** The only regular drain on the sitting scholar
is the sting. tickNeeds' ignored-ask (−0.71/100vd village-wide) lands on
NPC requesters, never the scholar; crowdingTick explicitly skips the
scholar's vid (`if (id === this.villagerId) continue`); the
grounding-fraying write goes to a junk "null" key (table.js, relay path —
never fired on the courtship road). #182's "trust decay" hypothesis is
REFUTED in numbers.

### Progressive curve at the 30 line

Scholar-gain applied/base by trust band (strict):

| trust band | calls | base → applied | efficiency |
|---|---|---|---|
| <30 | 7 | 34 → 34 | 1.00 |
| 30–49 | 38 | 37 → 36 | 0.97 |
| 50+ | 121 | 173 → 94 | 0.54 |

The curve does NOT bind at 30 — gains below 30 land at full value. It
binds at 50+ (halved). The binding constraint at the 30 line is not the
curve; it's that only **7 gain calls** landed below 30 across 16 combos.
There is nothing to scale.

### Currency finding: link-trust vs villager-trust

Unchanged from r31: the courtship verbs (tribute, tending, accords)
feed LINK-trust (per-link, hierarchy.js `_trustGain`), never villager
trust. The two currencies never convert. A scholar can hold link-trust 90
with a foreign fire while their own village trusts them at 28 — and the
game never says which verb feeds which.

## Sense-test (SENSE-TESTING LAW)

Read the beats. The sting HAS voice — and it repeats: "Someone watches
you take food. They say nothing, but you feel it." (d12 x3, d14, d15 x2,
d19, d21 on seed 22 leadcourt — the 30% line fires constantly on a
taking scholar). The succession SET has voice too: "At the grave, [names]
speak for [new] — '[old] trusted them. We saw it. Give them the fire's
hearing.'" The village listens. The FLOW GAINS are silent — 40 days on
seed 44 leadcourt produced ZERO sitting-scholar flow gains to even sample,
and the r31 finding stands: gains land as mechanical ticks (bumpTrust →
tele event, no say). The fiction knows the penalty and the funeral; it
doesn't know the reward. Verdict: drains read as people reacting; gains
read as nothing at all.

## Village assessment

Sixteen villages on the courtship road, median 152 days, 10 reaching
national, 1 touching wave 5 (leadcourt-s66). The road is alive: 0–9
successions per village, the office passing with its discounted trust.
What thrives: villages that work — the assignment engine prints trust for
villagers (+35/100vd), and the succession ratchet converts villager
records into leader standing (own-90 → office-62). What dies: scholars —
19% of tenures are born below 30 and grind there for ~32 days each on
+0.97/100vd gains against the −2 sting, until death or the next
succession. The villages that reached national did it on link-trust, not
on scholar standing. The half-ration line binds 32% of scholar-days — a
real pressure, and it is the SUCCESSION LANDING plus the gain vacuum
doing it, not the sting.

## Reachability verdict / wall numbers

16 combos: national **10/16** · table **0/16** · wins **0/16** ·
wave 4–5 unlocks **1/16** (max wave 5, leadcourt-s66) · median survival
**152d** · exiled **0/16** · scholar trustEnd median 60. The trust
instrument opens no content gate — but it re-times the r30/r31 pressure:
the trust<30 half-ration bind is a 32%-of-days pressure on living
scholars, concentrated in born-below tenures, not a universal stranglehold.

## The answer to #182 (for the sitting-scholar steve-call)

The non-penalty drivers of trust<30, WITH NUMBERS:

1. **Succession landings below 30** — p10 start-trust 15; 19/101 tenures
   born-below; 601/656 below-30 days (91.6%). The office inherits 62
   median, but the distribution has a real left tail.
2. **The gain vacuum** — sitting-scholar flow gains +164 across 16 combos
   (+0.97/100vd). A born-below scholar needs +15 to reach 30; at
   +0.97/100vd that's ~1,500 village-days. They die first.
3. **The succession haircut** — own-90 → office-62 median. The village
   trusts the person; the office discounts it. (Design, not bug.)
4. **Trivial residual drains** — convo-fallout −16, fireside −4. Noise.
5. **No decay** — refuted. No hidden erosion. The sting is the only
   regular drain, and removing it gains +3.3% days>=30.

What the sitting-scholar design needs next (steve-call): whether the
player's own deeds while seated should earn villager trust at all. The
engine currently says no — the scholar's +35/100vd assignment engine
fires for NPCs, and the scholar's vid sees +0.02/100vd of it. If the
answer is yes, the gain channels need to reach the scholar's vid AND need
a voice (the fiction currently doesn't know the reward). If the answer is
no — the office runs on inheritance by design — then the born-below tail
(p10 start 15) is the tuning surface, not the sting.

## Blanks filled / documented

- **#182 TRUST<30 HAS NON-PENALTY DRIVERS — FILLED.** The drivers are
  named with numbers above. The sting is 96% of flow drains but only
  +3.3% of the answer; the born-below tail (91.6% of below-30 days) is
  the answer.
- **"Trust decay" hypothesis — REFUTED.** No passive decay mechanic
  exists; the periodic hunt finds only the sting on a regular cadence.
- **New open blank: THE SUCCESSION HAIRCUT.** own-90 → office-62 median
  is the design working, but it means the most-trusted villagers LOSE
  ~28 points of personal standing on taking office. Whether the office
  should carry more of the person's record is a design question.
- **New open blank: SET-ATTRIBUTION NOISE.** The death flow emits small
  (+1) playerDeath-caller writes alongside the SET; their origin is
  unidentified (not in ledger.js playerDeath's visible trust writes).
  Negligible in mass (<0.1%) but the channel name over-claims.
- **Instrument blank filled: DELTA-ATTRIBUTION.** Succession-aware,
  sign-split, ablation-capable trust instrument with 39/39 proof.

## Metric review (§14, mandatory)

- PRIMARY (complete delta taxonomy per 100vd, non-penalty drivers of
  trust<30 named with numbers, succession-aware ledgers): MET —
  26+ channels classified, zero `other:` survivors on 16 combos;
  det-gate 16/16 identical; proof 39/39; 85 successions decomposed;
  101 tenures attributed; ablation replay faithful (max error 2).
- The pre-registered GO was "complete taxonomy + named non-penalty
  drivers with numbers": the drivers are (1) born-below succession
  landings 91.6% of below-30 days, (2) the +0.97/100vd gain vacuum,
  (3) the 90→62 succession haircut, (4) trivial residual drains;
  decay refuted; the sting measured at +3.3% via ablation.
- Metric concern for the NEXT run (not this one): the "sitting scholar"
  scope counts the succession-day SET as a scholar write — the SET is a
  transfer, not a flow, and its −10.60/100vd dominates the drain table
  visually. Future arms should report flow-only and set-inclusive
  numbers separately (this file does both).
- No re-scoring: the diagnostic GO is taxonomy completeness, met as
  pre-registered.

## Convergence report

- Convergence: **GO (diagnostic)**. Axis scale-onramp: still the blocking
  axis — converging, not converged (0/16 wins; the trust picture is now
  fully measured, and it is not the wall's face: villages earn trust
  fine, the scholar's standing is inheritance-bound, villages die of the
  combat bleed before the on-ramp).
- Wall numbers this run (16 combos): national 10/16, table 0/16, wins
  0/16, wave 4–5 unlocks 1/16 (max wave 5), median survival 152d,
  exiled 0/16.
- TELEMETRY: coordinator runs telemetry-check vs scale-wall.json
  (national 10 vs baseline 8 — report LOUD/quiet with verdict).

## Files

- scripts/trustdeltas-20261014.js — the delta-layer instrument (harness module)
- scripts/sweep-trustdeltas-20261014.js — 16-combo sweep + det-gate mode + SMOKE gate
- scripts/test-trustdeltas-20261014.js — proof, 39/39 (REAL RED phases)
- scripts/analyze-trustdeltas-20261014.js — delta analysis
- scripts/recompute-deltas-20261014.js — delta-layer recompute on stored writes
- evidence/2026-10-14/trustdeltas.json — suite summary
- evidence/2026-10-14/trustdeltas-perseed/*.json — per-seed (deltas, tenures, successions, ablations, writes, trajectory)
- evidence/2026-10-14/trustdeltas-sweep.log — full sweep log incl. det-gate
- evidence/2026-10-14/sim-trustdeltas.md — this file
