# sim-thindefer-b — "Leave it for the hungry": villager thin-pool draw deference (pilot)

Run: oversight-flesh-out-loop-b, arm sim-thindefer-b. Worker tree:
~/workspace/worktrees/sim-thindefer-b (base master 8720dc2c7, verified).
Axis: food-economy. Named next from sim-poolscholar-b (backlog #816, the
#643-adjacent thin-side lever — #643 portion-law itself is a steve-call and
is NOT touched by this arm).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: the pool-thickness theory (sim-poolscholar-b, DIAG-GO)
  found the thin-pool regime (pantryFreshDays<2, the Q1 thin quintile:
  <589 kcal/mouth, 20% of days, 61.5% of starvation deaths, 3.1x
  enrichment) and the counter-cyclical top-up surge: villagers draw MORE
  from a thin pool (23.4% of draws in Q1 vs ~8–14% elsewhere) — nobody
  defers. The landed levers (plentydepri, depositgate) ease when
  PLENTIFUL. This arm builds the named thin-side mirror: villagers defer
  their own pooled top-up draws when the pantry reads thin, voiced
  per-villager. The meal stays sacred (only villagers whose ownEat already
  covers ≥80% of need defer); the scholar's trust-scaled villageMeal is
  NOT touched (#761 sense-hostility constraint).
- **Lever**: "Leave it for the hungry" — at villagerMealDay, when
  pantryFreshDays()<2 and the villager's ownEat covers ≥80% of need
  (dayWant ≤ 0.2×need), draw dayWant×0.5 from the pantry (halved top-up),
  cap the drawSpoiled fallback to the same halved intent, carry the gap
  as hunger; one voiced day-beat per day (rotating speaker, deterministic,
  depositgate-voice pattern). Implemented as a LAYER
  (scripts/layers/thindefer-b.js, env THINDEFER_B=1) wrapping
  villagerMealDay/pantryDraw/drawSpoiled/villageEats — ZERO src/js
  modifications, disjoint namespace (THINDEFER_B, _thinDefer) from all
  loop-A arms (sim-armor-drive, sim-devotion-arm, sim-feastdisc-confirm,
  sim-vetbench — read-only status checked, no hook-point or namespace
  overlap before building).
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b /
  poolscholar-b substrate — the substrate the theory was measured on).
- **Policies**: competent-player leadfeast + belongfeast (feastscale).
- **Seeds**: 8 fresh (67301–67308, filename-verified 2026-10-22, inline
  filename-freshness assertion in the sweep). Pilot gate: 8 seeds per arm
  per policy × {control, armed} = 32 configs, paired identical seeds.
- **Horizon**: 180d death-aware (dead villages stop simulating; the
  deathcause-b corpus horizon — the corpus the theory was built on). Never
  a fixed 200d.
- **PRIMARY (binding GO)**: thin-pool starvation deaths (cause-class
  'starvation' AND death-day pantryFreshDays<2), corpus totals over the 16
  paired configs: armed ≤ control−2 AND control ≥ 1 (mechanism bar — the
  lever must have thin-pool starvation to prevent).
- **Guardrails** (all corpus-total / paired, must all PASS):
  1. total starvation deaths armed ≤ control;
  2. median survival (run days) armed ≥ control−10d;
  3. no new death modes (armed cause-class set ⊆ control set, reviewed);
  4. no median pantry collapse (median of per-run median daily
     pantryFreshDays: armed ≥ 0.8 × control).
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15 is
  the instrument for the before/after comparison; the pre-registered
  threshold above is the judge. Env-gated lever ⇒ automated panel compare
  is descriptive-by-construction (sim-findings.md #796); the manual
  paired-row comparison judges. The panel compare .md is attached.
- **Verdict classes**: GO (all bars) / NO-GO (primary or any guardrail
  missed — never re-scored per §14) / killed-at-pilot (mechanism never
  fired — fast kill). Convergence: converging | converged | parked |
  killed-at-pilot.
- **Instrument proof** (scripts/test-thindefer-b.js, BEFORE the sweep):
  gate-off byte-identity (methods unwrapped, short-sim digest identical),
  mechanism (stubbed-Game: eligible villager draws half, ineligible draws
  full, spoiled fallback capped, scholar's villageMeal untouched),
  voice (day-beat fires, deterministic across runs), DET.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (food ladder),
  docs/STORAGE.md (stash/ledger/trust; pantry cap 120,000 "tight, not
  cruel"), docs/DECISIONS.md 2026-10-21 SURPLUSFEED ruling (behavioral,
  bottom-up, never post-hoc — this lever is the thin-side mirror of that
  ruling's direction), docs/SURVIVAL-LEVERS.md (lever register — entry
  added on landing).
- Code-grounded: villagerMealDay (game.js:29029 — ownEat first,
  dayWant=need−ownEat, pantryDraw top-up + drawSpoiled desperation path,
  hurtFromStarvation at ateAll<need×0.6); depositgate voice pattern
  (game.js:28648 _depositGateDayVoice — one line/day, rotating speaker,
  deterministic, narration-only); pantryFreshDays (game.js:15260).
- Sense-hostility constraint (backlog #761): a lever that silently
  overrides the player's (scholar's) draw is sense-hostile — hence
  villager-side only, and voiced (canon: "No silent actions").
- No canon doc covers thin-pool draw deference — sim-poolscholar-b.md IS
  the theory's first written form; this arm builds its named Lever 1.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. Thin gate = pantryFreshDays()<2, evaluated per-villager at their meal
   (the mirror of depositgate's >4 plentiful gate). Intra-day thinning is
   real: early deferrers keep the pool thicker for later eaters — the
   desired bottom-up dynamic.
2. Eligibility = ownEat ≥ 80% of need (dayWant ≤ 0.2×need, need recomputed
   with the function's exact math incl. hearthStretch). The meal stays
   sacred: a deferrer always ends ate ≥ 0.8×need, mechanically above the
   hurtFromStarvation 0.6 line — deferral can never starvation-hit.
3. The deferred half is carried as hunger (the engine's own hunger easing
   does it: ate is lower, n.hunger eases less). Nothing is destroyed.
4. The drawSpoiled desperation fallback is capped to the halved intent — a
   comfortable villager must not backfill their deference with rot.
5. Voice = day-voice (not per-meal): one line/day, rotating speaker,
   deterministic line pick, depositgate pattern. Per-meal lines would spam
   on multi-deferrer days.
6. Layer, not game code: the sibling loop is live on scale-onramp with
   uncommitted game.js trees; zero src/js keeps the lanes disjoint.
   Gate-off = wrappers never installed ⇒ byte-identical delegation (the
   proof test pins it).

## RESULTS

Pilot complete: 32 configs (8 fresh seeds 67301–67308 × {leadfeast,
belongfeast} × {control, thindefer}), 180d death-aware, paired identical
seeds, substrate FEASTSCALE_R13=1/SEATDRIVE=0. Per-seed JSONs:
evidence/2026-10-22/perseed-thindefer-b/. Panel compare:
evidence/2026-10-22/thindefer-panel-primary.{md,json} (+ .json.gz panels).

### Instrument proof (scripts/test-thindefer-b.js — 32/32 GREEN, before the sweep)

- E0 unit (stubbed Game): eligible villager draws half (100→50), hungry
  villager draws full (1000), spoiled fallback capped to the halved intent
  (80→30), thick pool (5.0 fresh-days) no deference, away villager no flag,
  villageMeal method identity untouched (scholar never in the wrapped path),
  one deterministic day-beat per day with voiceDay guard, layer draws zero
  Math.random, gate-off install() is a noop (methods unwrapped, no tele,
  no state).
- E1 det-gate: 60d sims, THINDEFER_B unset, install() called vs not —
  digest-identical on both policies.
- E2 sim smoke (THINDEFER_B=1, 60d): completes, zero layer errors,
  mechanism fires in the wild (thinMeals=9, deferrals=3, deferredKcal=346,
  voices=1).
- E3: armed 60d re-run digest-identical (deterministic).

### Mechanism telemetry (armed arm, 16 configs)

177 deferrals, 18,474 kcal of deferred top-up intent kept in pools, 122
voiced day-beats, 0 layer errors. Heaviest config (belong-s67301):
thinMeals=250, deferrals=48, deferredKcal=5,044, voices=28. The mechanism
FIRED as designed — this is not a "mechanism never fired" kill.

### Primary + guardrails (manual paired comparison — the judging instrument)

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| thin-pool starvation (PRIMARY) | 2 | 4 | armed ≤ control−2 AND control ≥ 1 | **NO-GO** |
| total starvation (g1) | 10 | 12 | armed ≤ control | **FAIL** |
| median survival (g2) | 114d | 134d | armed ≥ control−10d | PASS |
| new death modes (g3) | — | combat-paparazzo, combat-statickite | none | PASS-on-review* |
| median pantryFreshDays (g4) | 5.34 | 5.34 | armed ≥ 0.8×control | PASS |

\* g3 as written is monster-name-granular (the armorydrive-confirm bar-
construction lesson): both "new" modes are combat-* deaths by different
monsters, not new death mechanisms. Reviewed: no new mechanism classes.

Paired rows: the +2 thin-pool deaths are leadfeast|s67304 (0→1, Pavel d166,
death-day freshDays 1.71) and belongfeast|s67301 (0→1, Wanjiru d106,
freshDays 0.05). The +2 total-starvation is exactly those two (other
starvation 8→8). Median survival IMPROVED (+20d). Pantry thickness
unchanged.

Panel (§15, descriptive-by-construction for the env-gated lever):
review_required on both policies; regression_watch on playerDeaths
(+1.25/100d lead, +0.75 belong — all combat vessel deaths on diverged
trajectories, no food mechanism) and npcHungry (+0.125 both).

### Root cause (kill discipline — why the lever is wrong, not just the bar)

The lever is correctly implemented and fires, but it is structurally
undersized for the primary: the heaviest config deferred 5,044 kcal over
~115 days ≈ 44 kcal/day/village — roughly 2% of the pool's dominant fixed
drain, the scholar's ~2,000 kcal/day trust-scaled villageMeal. The
pool-thickness theory's own numbers bind this: the scholar is ~50% of ALL
draws at EVERY thickness quintile (thickness-independent by design); the
Q1 top-up slice is 23.4% of draws, and only the comfortable subset defers
(half of that). Even at 2× power (full top-up deferral) the savings would
be ~4% of the scholar's draw — the math cannot close. The binding
constraint on thin-pool starvation is the scholar's fixed draw, which this
arm was explicitly forbidden from touching (#761 sense-hostility; the
companion lever "the scholar's bowl" — a player-side voiced meal choice
when thin — is the one that touches it, and it needs a choice UI, a
design task beyond this arm).

The 2 extra thin-pool deaths are not plausibly lever-caused: (a) a
deferrer always ends ate ≥ 0.8×need, mechanically above the
hurtFromStarvation 0.6 line — deferral cannot starvation-hit; (b)
production is grit-based, not hunger-based (game.js:28542) — no
hunger→production feedback; (c) the deferred kcal stays in the pool
(conservation — nothing destroyed). This is variance on small counts
amplified across diverged trajectories (the depositgate-b2 seed-9204
class), but per §14 the miss stands as a miss.

**Verdict: KILLED-AT-PILOT with teeth.** Named next: "the scholar's bowl"
(sim-poolscholar-b companion lever) — the player-side thin-pool lever that
touches the actual binding constraint. Filed to the findings backlog.

## Village assessment

Sixteen villages on the FEASTSCALE_R13=1/SEATDRIVE=0 substrate, read
through the thin-pool lens, both arms:

**What the villages looked like**: the thin-pool regime is real on this
substrate — control showed thin-pool starvation on 2/16 configs and the
armed arm's tele logged thin meals on every config (thinMeals 2–250).
Pools still empty under the scholar's fixed draw on the thinnest runs
(belong-s67301 hit freshDays 0.05 despite 48 deferrals keeping 5,044 kcal
in the pool). The median village survived 114d (control) / 134d (armed);
wave-4 unlocked widely, wave-5 never (the binding wall, unmoved).

**Who thrived**: villages whose inflow stayed ahead of the scholar's
fixed draw never went thin — deference or not. The armed arm's median
survival gain (+20d) came from the early/mid game, not from thin-pool
rescues.

**Who died and why**: the thin-pool dead — Pavel (lead-s67304, d166,
pool at 1.71 fresh-days) and Wanjiru (belong-s67301, d106, pool at 0.05,
empty). Both died with the pool thin/empty while the scholar's fixed draw
continued. Nobody died OF deference; two died DESPITE it. The combat
deaths (the vast majority, all monster-named) are untouched by this lever.

**What's missing**: any lever on the scholar's thickness-independent
fixed draw — the pool's largest single cost, which no villager-side
behavior can move. That is the companion lever's job.

**Blanks filled**: the thin-side draw behavior now exists as a measured,
voiced, correctly-implemented mechanism — and is proven undersized for
thin-pool starvation (the theory's fixed-drain binding constraint named
in numbers). **Blanks documented**: "the scholar's bowl" companion lever
(filed); the day-1 thin-beat artifact (pantryFreshDays reads thin before
burnHistory stabilizes — a d1 "bins are thin" beat is fictionally early);
the per-speaker line-key repetition nit (Onni's identical line 8× on a
long thin run — vary by day as well as speaker if the beat ever revives).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read all 122 armed day-beats (sample above). SENSE-VERDICT: PASS with two
nits. The beats read as villagers choosing, not a system trimming:
"🍽️ Salvador leaves the scoop in the bin — 'half's plenty for me
tonight.'", "🍽️ Devon takes half a share and pushes the rest back —
'leave it for the hungry.'" — the brief's named beat fires verbatim.
Named villagers, situated at the pantry, varied across the 5-line pool.
Nits: (1) the per-speaker deterministic line key repeats the identical
line for the same villager across a long thin run (Onni ×8) — mildly
robotic; (2) a day-1 "bins are thin" beat fires before burnHistory
stabilizes (measurement artifact, fictionally early). Neither is a
sense-fail; both are recorded as refinements for any revival.

## Metric review (§14)

1. PRIMARY missed as written: armed 4 vs control 2 (bar: ≤ control−2 AND
   control ≥ 1). No re-scoring — the verdict is NO-GO per the binding
   header.
2. g1 (total starvation 10→12) missed as written; the +2 is exactly the
   primary's +2 (other starvation 8→8). No adverse mechanism found
   (deferrers can't cross the 0.6 line; production is grit-based).
3. g3's "new death modes" fired on monster-name granularity
   (combat-paparazzo, combat-statickite) — the same bar-construction flaw
   the armorydrive-confirm arm documented. Reviewed as PASS: no new death
   mechanism classes. Future thin-pool arms should pre-register g3 at the
   mechanism-class level (starvation/dehydration/combat/sickness/wound/
   contest/raid), not the monster-name level.
4. The thin gate (pantryFreshDays<2) fires on day 1–2 before burnHistory
   stabilizes — the "thin" classification on the first days is an
   estimate artifact. A future arm should either warm up the burn history
   or gate the voice (not the mechanism) on day ≥ 3.
5. Death-day freshDays joins on the nearest recorded dawn ≤ death day
   (the dawn series can skip a day) — documented in the sweep; no
   thin-pool death in this corpus depended on the fallback (all had
   same-day records).
6. Panel compare is descriptive-by-construction (env-gated lever, #796) —
   the manual paired-row comparison judged, as pre-registered.

## Convergence state

**killed-at-pilot** (with teeth — mechanism fired 177×, root cause named:
the lever is structurally undersized against the scholar's fixed drain;
the binding constraint needs the companion "scholar's bowl" lever).
food-economy stays converging. Backlog: #816 stays diagnosed (theory
stands); new named next filed ("the scholar's bowl" — player-side thin-
pool meal choice; the #643 portion-law steve-call is adjacent but
untouched).

## Telemetry note

Telemetry deviation check is the coordinator's step (run body §10). The
corpus is evidence/2026-10-22/perseed-thindefer-b/ (32 per-seed JSONs),
anchor 8720dc2c7, substrate FEASTSCALE_R13=1/SEATDRIVE=0. Wall (pilot
corpus): national —, table —, won 0/32, wave-4 26/32, national 14/32, table 23/32, wave-5 0/32, median
survival 114d control / 134d armed. (National/table/wins fields are in the
per-seed JSONs; the panel carries won/table/national.)
