# sim-poolscholar-b — pool-thickness theory (backlog #816, DIAG, instrument-only)

Run: oversight-flesh-out-loop-b, arm sim-poolscholar-b. Worker tree:
~/workspace/worktrees/sim-poolscholar-b (base master b73e4751e).
DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero policy edits, ZERO new sims. Offline analysis of the deathcause-b
corpus (evidence/2026-10-22/perseed-deathcause-b/: 16 per-seed JSONs +
_summary.json), plus the depositgate-b2 panel-compare and the
plentydepri-confirm-b numbers as substrate context.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the verdict)

- **Question** (backlog #816, from sim-deathcause-b): the scholar is the
  pooled pantry's largest customer — a full trust-scaled villageMeal
  (~2000-2200 kcal/day); on thin-surplus villages 50-91% of everything the
  village shared. Only ~20% of production ever pools (rest is ownEat); the
  pool drains under the scholar's fixed daily draw + top-ups + rot while the
  village "produces enough" (0.98-1.03x need). Steve's SURPLUSFEED-removal
  replacement direction (behavioral storage deprioritization, DECISIONS.md
  2026-10-21) needs a POOL-THICKNESS THEORY. Build it offline on the
  existing corpora.
- **Method**: scripts/diag-poolscholar-b.js reads the 16 per-seed JSONs.
  Draw taxonomy (all instrumented = "named"): scholarDraw (villageMeal),
  topups (villager pantry draws, away=false), packDraws (villager pack draws,
  away=true — the engine's own honest-burn convention counts these as pantry
  outflow: "totalDrawn is the pantry's real outflow (best-fit draws + away
  rations)", game.js villageEats), rot (sensor phase-broken — reported as
  instrument silence, never as zero rot), feast (hostFeast real-drawn),
  tribute (payTribute/tendLink real paid). Pool thickness: pantry stock per
  mouth per day (daily series) + measured inflow per mouth per day (gave +
  deposits; LOWER BOUND — duty-haul stockPantry is uninstrumented in this
  corpus). Quintiles: all ~2105 run-days binned by stock/mouth.
  Thin-pool→starvation: death-day quintile + trailing-14d per starvation
  death vs the corpus day distribution.
- **PRIMARY (DIAG-GO bar)**: ≥95% of measured pooled-draw kcal attributed to
  named draws (scholar draw / top-ups / rot / villager draws — the
  theory-core four; feast + tribute named as the remainder, both
  instrumented, both voiced in-game, both designed outflows, never
  "unattributed") on ≥15/16 corpus runs, PLUS the pantry-equation residual
  decomposed with unmeasured flows named (not hand-waved), PLUS the
  quintile table, PLUS the named behavioral lever.
- **Verdict classes**: DIAG-GO (bar met, theory + lever delivered),
  DIAG-insufficient-data, or NO-GO (bar missed — never re-scored per §14).
- **Instrument proof** (scripts/test-poolscholar-b.js): (a) PRIMARY bar
  re-asserted from the parsed report; (b) DET: two corpus runs
  byte-identical; (c) FIXTURE: synthetic 2-run corpus with hand-computed
  flows (draws, residual, thickness, quintile binning, starvation join).

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (the food ladder; rot
  can't be smoked back), docs/STORAGE.md (stash/ledger/trust mechanics —
  the pantry cap 120,000 kcal, "tight, not cruel", food.js:2020),
  docs/DECISIONS.md (2026-10-21 SURPLUSFEED ruling: "villagers deprioritize
  production and storage when food is plentiful" — behavioral, bottom-up,
  never a post-hoc trim), docs/SURVIVAL-LEVERS.md (lever register).
- Code-grounded (not invented): villageMeal (game.js:27899 — trust-scaled
  1000/2000/2200, best-fit pantryDraw, voiced); villagerMealDay
  (game.js:29029 — ownEat first, dayWant=need−ownEat drawn from pantry at
  home / pack away, surplus shared by trust into stockSurplus);
  villageEats (game.js:29768 — honest-burn: totalDrawn is the pantry's real
  outflow); depositgate (game.js:29174 — plentiful-side storage easing,
  voiced, "the meal stays sacred"); plentydepri (game.js:28562 —
  production-side easing, voiced).
- **No canon doc covers the pool-thickness question** — this evidence file
  IS the theory's first written form, built on the engine's measured flows.
- Sense-hostility constraint (task brief, cf. backlog #761): a lever that
  SILENTLY overrides the player (scholar) is sense-hostile. Any named lever
  must be a voiced choice or a villager-side behavior. Canon backing: "No
  silent actions. Every action narrates honestly, including failures."

## Proof results (pre-verdict — all green)

scripts/test-poolscholar-b.js: **20/20 GREEN**.
- FIXTURE (12 checks): synthetic 2-run corpus — draws (8000/2000/800/
  500/300), measuredDraws=11600, residual=−600, thickStock=800,
  scholarShare exact, Q1-thinnest/Q5-thickest binning, starvation join
  (Vic d3 → 700 spm), nDeaths=1 — all exact.
- DET: two full-corpus runs byte-identical (sha256 match).
- PRIMARY re-asserted from the parsed report (see below).

## Results

Machine-readable report: evidence/2026-10-22/poolscholar-b.json (this
section's headline numbers; the .md is the record, the .json is the data).

### (a) Pool-thickness distribution

Two measurable dimensions (n=16 runs, ~2105 run-days):

| run | policy | mean stock/mouth (kcal) | measured inflow/mouth/day (kcal) |
|---|---|---|---|
| s66054 | belong | 806 | 276 |
| s66050 | lead | 818 | 95 |
| s66056 | belong | 900 | 357 |
| s66050 | belong | 1003 | 286 |
| s66054 | lead | 1132 | 264 |
| s66051 | lead | 1141 | 276 |
| s66049 | belong | 1206 | 462 |
| s66051 | belong | 1259 | 361 |
| s66055 | lead | 1455 | 322 |
| s66053 | belong | 1501 | 327 |
| s66055 | belong | 1572 | 341 |
| s66052 | belong | 1620 | 362 |
| s66049 | lead | 1820 | 353 |
| s66053 | lead | 1866 | 533 |
| s66052 | lead | 1992 | 374 |
| s66056 | lead | 3133 | 331 |

- Stock/mouth: 806–3133, mean ~1400. One mouth-day of buffer is ~2000 kcal
  of need — so the corpus spans ~0.4 to ~1.6 days of buffer per mouth.
- Measured inflow/mouth/day: 95–533, mean ~330 (LOWER BOUND — duty-haul
  stockPantry is uninstrumented; the residual decomposition bounds it, see
  below). For reference, per-mouth daily need is ~2000 kcal — the pool
  replenishes at ~5–27% of need per day from measured flows.

### (b) Scholar's share of pooled draws by pool-thickness quintile

Run-days binned by pantry stock per mouth (421 days/quintile):

| quintile | stock/mouth | scholar | top-ups | pack | feast | tribute |
|---|---|---|---|---|---|---|
| Q1 thinnest (0–589, mean 336) | 49.7% | 23.4% | 18.5% | 4.1% | 4.3% |
| Q2 (589–1037, mean 787) | 50.9% | 14.4% | 10.8% | 6.6% | 17.2% |
| Q3 (1040–1599, mean 1294) | 56.5% | 7.8% | 8.4% | 4.8% | 22.5% |
| Q4 (1600–2251, mean 1918) | 54.7% | 9.7% | 10.1% | 6.9% | 18.6% |
| Q5 thickest (2251–7460, mean 3000) | 49.7% | 11.9% | 8.9% | 10.2% | 19.1% |

Three theory facts:
1. **The scholar is ~half of ALL draws at EVERY thickness** (49.7–56.5%,
   remarkably flat). The brief's "50–91%" was scholar-share-of-INFLOW on
   thin trailing windows; the draw-side view shows the scholar's draw is
   the pool's single largest FIXED cost regardless of thickness.
2. **Villager top-ups RISE when thin** (23.4% in Q1 vs 7.8–14.4%
   elsewhere): hunger drives top-up draws UP, not down. Nobody defers —
   the thin pool faces HIGHER villager draw pressure, the opposite of what
   the replacement direction needs.
3. **Feast + tribute are 8–33% of draws** (named, instrumented, voiced —
   the remainder, never unattributed). Tribute peaks in mid-thickness
   (courtship-road standing payments continue while the pool is merely
   adequate).

Scholar share of measured INFLOW per run (the brief's framing, for the
record): 36–64% on 15/16 runs; **s66050-leadfeast 126.5%** — the scholar
drew MORE than the entire village pooled (67,959 drawn vs 53,723 pooled).
The fixed draw exceeds variable inflow: the pool-thickness drain in one
number.

### (c) Thin-pool → starvation linkage

13 starvation deaths; death-day quintile vs corpus day distribution:

| who | run | day | channel (deathcause-b) | death-day spm | Q | trailing-14d spm |
|---|---|---|---|---|---|---|
| Zihao | lead s66050 | 43 | inflow-failure | 124 | Q1 | 498 |
| Pavel | lead s66050 | 48 | inflow-failure | 0 | Q1 | 250 |
| Theo | lead s66050 | 50 | inflow-failure | 0 | Q1 | 204 |
| Ruth | lead s66050 | 54 | inflow-failure | 171 | Q1 | 87 |
| Laura | lead s66050 | 65 | inflow-failure | 0 | Q1 | 58 |
| Somchai | belong s66050 | 135 | unattributed | 125 | Q1 | 308 |
| Ingrid | belong s66050 | 141 | unattributed | 100 | Q1 | 181 |
| Kenneth | belong s66050 | 143 | unattributed | 0 | Q1 | 120 |
| Theo | belong s66050 | 29 | unattributed | 782 | Q2 | 1074 |
| Irving | belong s66053 | 21 | unattributed | 886 | Q2 | 1256 |
| Juan | belong s66053 | 8 | unattributed | 1408 | Q3 | 2237 |
| Zinaida | belong s66053 | 36 | unattributed | 1347 | Q3 | 2160 |
| Juan | lead s66053 | 8 | unattributed | 1408 | Q3 | 2237 |

- Quintile counts: Q1:8, Q2:2, Q3:3, Q4:0, Q5:0. Median death quintile: Q1.
- Q1 holds 20.0% of run-days but 61.5% of starvation deaths → **3.1x enrichment**.
- The linkage decomposes by deathcause-b's shapes: Shape 1 (inflow-failure
  famine, 5/5 Q1) + Shape 3 (thin-pool drain, 3/3 Q1) are thin-pool deaths;
  Shape 2 (trail-starvation, 5 deaths, Q2–Q3, pantries 8,604–16,900 at death)
  is pool-INDEPENDENT — those villagers died AWAY from a full pantry. Thin
  pools predict at-home starvation; they do not predict trail-starvation.

### Attribution + residual decomposition (PRIMARY)

- **PRIMARY bar: 16/16 runs ≥95%** — every measured pooled-draw kcal falls
  in a named draw category (scholar/top-ups/packDraws/rot/feast/tribute).
  The theory-core four (scholar/top-ups/packDraws/rot) cover 61.3–100%
  per run (median ~79%); the remainder is feast + tribute (both named).
- Pantry equation per run: residual = inflowMeasured − measuredDraws − Δ,
  range −82,695 … +205,820. Cross-run regression residual ~ awayN:
  **slope +578 kcal/away-day, intercept −135,228, R²=0.497**.
  - Positive slope: each away-day carries ~578 kcal of unmeasured OUTFLOW
    — the dawn-ration waste (packKcal reseed discards unspent ration;
    game.js:4119/packMeal). Named, bounded by the regression.
  - Negative intercept: ~135k/run of unmeasured INFLOW exceeding baseline
    unmeasured outflow — duty-haul stockPantry (taskLeads/gardenKeeper;
    policies don't staff duties on this substrate), league-granary famine
    draws, contest/betrayal one-offs. Named as categories; the corpus
    cannot split them (not instrumented — a named next, not a gap).
  - The pantry cap (120,000) never binds in this corpus (refused=0 on
    16/16) — cap-refusal is not the residual's source here.

### Substrate context (plentydepri-confirm-b + depositgate-b2 panel)

- plentydepri-confirm-b (landed): rot 0.348x/0.508x, eased 2079k/1732k kcal
  on 16/16 runs, starvation 4→3 / 5→1, survival +10.5d/+25d — the
  PRODUCTION-side behavioral deprioritization works and is live.
- depositgate-b2 (landed): storage-side easing (funnel.share halved when
  plentiful, homecoming keep 2000→6000), primary 0.273x/0.365x rot,
  0.627x/0.831x inflow — the INFLOW-side behavioral deprioritization works
  and is live.
- What's missing is the DRAW side when THIN: both landed levers ease when
  PLENTIFUL. Nothing in the mechanics or the fiction deprioritizes DRAWS
  when the pool is thin. That is this theory's lever.

## The pool-thickness theory (for the replacement direction)

1. The pool is a stock (buffer per mouth: 806–3133 kcal, ~0.4–1.6 days)
   fed by variable inflow (measured 95–533 kcal/mouth/day, lower bound)
   and drained by a FIXED scholar draw (~2000–2200/day at haven) plus
   variable villager draws.
2. The scholar's draw is thickness-INDEPENDENT (~50–57% of draws in every
   quintile). Inflow is thickness-dependent (trust-gated surplus shrinks
   when production sags). When inflow < scholar + top-ups, the pool drains
   at any production level — including 0.98–1.03x of need (s66050-leadfeast:
   scholar drew 126% of pooled inflow).
3. Villager top-up draws are COUNTER-cyclical: 23.4% of draws in Q1 vs
   ~8–14% elsewhere. Hunger makes villagers draw MORE from a thin pool.
   The replacement direction ("deprioritize storage when plentiful") has
   no thin-side mirror: nobody defers, nobody draws less, the fiction
   never remarks on the thinning until the crisis.
4. Thin pools (Q1, <589 kcal/mouth) predict at-home starvation at 3.1x
   enrichment. The pool is not decoration: it is the at-home survival
   buffer, and its thickness is the observable that precedes the deaths.
5. The unmeasured flows are bounded and named: ~578 kcal/away-day of
   ration waste out; ~135k/run of duty/granary inflow in. Neither changes
   the theory's shape; both are named nexts for instrumentation.

## The named lever (d)

**Primary — "LEAVE IT FOR THE HUNGRY": villager thin-pool draw deference.**
- WHO DECIDES: each villager, at their own meal draw (villagerMealDay,
  game.js:29133). Villager-side behavior — never the player, never silent.
- WHEN: the pantry reads THIN — the mirror of depositgate's plentiful gate
  (depositgate engages at pantryFreshDays > 4; the thin gate engages at
  pantryFreshDays < 2, i.e. under ~2 days of buffer). Only villagers whose
  ownEat already covers ≥80% of need defer — the meal stays sacred (the
  depositgate precedent: "only the share above their own meal is eased").
- WHAT: defer part of the top-up draw (draw dayWant × 0.5), carry the gap
  as hunger. Directly attacks finding (3): the counter-cyclical top-up
  surge in Q1.
- VOICED HOW: per-villager day-voice line, the depositgate
  _depositGateDayVoice pattern (game.js:29834): "🍽️ {Name} waves off the
  pantry — 'bins are thin, I'll make do with what I caught.'" Never
  silent (canon). This also fills the fiction's thin-middle silence (see
  Sense-testing).
- SENSE-SAFE: mirrors the LANDED depositgate voice, which sense-tested
  PASS ("the beats read as villagers choosing, not a system trimming",
  sim-depositgate-b2.md).

**Companion — "THE SCHOLAR'S BOWL": player-side voiced meal choice.**
- WHO DECIDES: the player. The scholar IS the player — a choice UI is
  voiced by construction, never a silent override (the #761 constraint).
- WHEN: villageMeal, when the pantry reads thin (same <2 fresh-days gate).
- WHAT: the fixed trust-scaled draw becomes a real choice: take the full
  share / take half / leave it for the village. The trust scaling stays
  (it's the village's offer); the THIN choice is the player's.
- WHY: a villager-only lever leaves the pool's largest fixed cost
  untouched (scholar ~50% of draws, up to 126% of inflow when thin).
  Only the player can legitimately flex the player's draw.

Both levers are behavioral and bottom-up (decisions at the draw, never a
post-hoc trim) — the SURPLUSFEED ruling's direction, extended to the thin
side. Neither touches src/js in this run (diagnostic only); the next arm
builds Lever 1.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Sampled the fiction around thin-pool days (deathcause-b death/loss-day
lines; the depositgate-b2 180d day-voice transcript,
evidence/2026-10-22/depositgate-dayvoice-s6005.txt, 983 lines):

- The pool's EXTREMES are voiced: plentiful ("🍽️ Grace leaves the surplus
  by the fire for whoever's hungry. 'The pantry can't take it. We can.'",
  "our shelves are full past tomorrow"); empty ("No food in the pantry.
  The village is hungry." — villageMeal's empty beat); crisis ("Heard
  your bins are echoing", the voted "Half rations for three days" beat,
  the scattering beat).
- The THIN MIDDLE is silent. On the Somchai/Ingrid/Kenneth thin-pool
  windows (pantry 5,350→~1,000 → 500, scholar drawing 22–23k of 25–45k
  pooled), no line remarks on the thinning. The scholar's meal beat
  reports the kcal with a trust note ("Half ration — they don't trust you
  yet") but never a thinness note. Villager top-up draws are pure ledger
  (no voice at all). The drain that killed two villagers happened without
  a single voiced acknowledgment until the scattering.
- SENSE-VERDICT: the fiction does not acknowledge the thin pool. The
  named lever's voice (Lever 1) fills a real blank, not a decorative one.

## Village assessment

Sixteen villages on the current master (SURPLUSFEED gone, depositgate +
plentydepri live), read through the pool-thickness lens:

**What the villages looked like**: pools spanning 0.4–1.6 days of buffer
per mouth. The thick villages (s66056-lead, 3133/mouth) are the ones whose
inflow stayed ahead of the scholar's fixed draw; the thin ones (s66050-lead,
818/mouth, 95 inflow/mouth/day) are the ones where the scholar drew 126%
of everything pooled and the pantry hit zero by d66.

**Who thrived**: villages whose measured inflow stayed above ~350
kcal/mouth/day — the scholar's ~2000/day spread across ~12 mouths is
~167/mouth/day of fixed cost, and villages pooling 2x that kept their
buffer. s66053-lead (533 inflow) never went thin.

**Who died and why**: the thin-pool dead — s66050-lead's five (famine:
inflow 95/mouth/day, scholar 126% of pooled), s66050-belong's Somchai /
Ingrid / Kenneth (pool drained 5,350→500 under fixed draws while
production read 0.98–1.03x). Nobody in this corpus died of the feast or
the trim. They died of fixed draws on variable inflow.

**What's missing**: (1) any thin-side draw behavior — villagers draw MORE
when thin, never less; (2) any fiction for the thinning — the pool goes
from "fine" to "echoing" with no middle voice; (3) instrumentation for
duty-haul inflow and ration waste (bounded here, split in a named next).

**Blanks filled**: #816 — the pool-thickness theory is built: thickness
distribution, quintile draw-mix, thin-pool→starvation linkage (3.1x, with
the trail-starvation exception characterized), residual decomposition,
and the named thin-side lever pair. **Blanks documented**: duty-haul
inflow / ration-waste split instrumentation (named next); the rot sensor
phase bug (carried from deathcause-b); Lever 1 build (named next arm).

## Metric review (§14)

1. PRIMARY passed: 16/16 runs ≥95% (100% — every measured draw is in a
   named category). The theory-core four cover 61.3–100% per run (median
   ~79%); the remainder is feast + tribute, both instrumented and voiced.
   No re-scoring was needed or done.
2. Operationalization note for the record: "named draws" was read as the
   instrument's six named draw categories; the task's parenthetical four
   are the theory-core subset, reported separately in the quintile table.
   If a future run wants the bar on the four alone, the numbers are here
   (2/16 ≥95%) — that would be a different, stricter bar, pre-registered
   then, not now.
3. The residual regression (R²=0.497) is directional, not exact — run-level
   unmeasured flows vary. The decomposition names the flows; it does not
   claim per-run closure. A future instrumented run (duty-haul +
   ration-waste sensors) can tighten this.
4. Inflow/mouth/day is a LOWER BOUND (duty-haul uninstrumented). The
   theory's ordering claims (thin vs thick) are robust to this; absolute
   inflow levels are not.
5. Rot reads 0 by sensor phase bug (deathcause-b metric review #4) — the
   theory treats rot as unmeasured, never as zero. The "rot" named
   category is a placeholder the next instrumented run must fill with the
   sweepSpoiled-phase sensor.

## Convergence state

**DIAG-GO.** Backlog #816 diagnosed: the pool-thickness theory is built
offline on the deathcause-b corpus with the pre-registered bar met
(16/16), the quintile table delivered, and the named thin-side lever pair
specified (Lever 1 "Leave it for the hungry" primary, Lever 2 "The
scholar's bowl" companion). food-economy stays converging; the wall is
unmoved (this run is diagnostic — no lever, no sims). Named nexts:
(1) build Lever 1 (villager thin-pool draw deference, voiced) as a
measured arm; (2) instrument duty-haul inflow + ration-waste outflow +
sweepSpoiled-phase rot sensor on the next food-economy sweep.

## Telemetry note

Telemetry deviation check is the coordinator's step (run body §10); the
corpus is evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs +
_summary.json), anchor cd68e6dd3, substrate FEASTSCALE_R13=1/SEATDRIVE=0.
Not run by this arm (diagnostic, no treatment).
