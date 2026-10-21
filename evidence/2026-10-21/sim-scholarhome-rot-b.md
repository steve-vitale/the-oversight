# sim-scholarhome-rot-b — DIAG: the scholar_home pool's conservation story

Run: fleshout-loop-b-20261021T1545Z (loop B, axis food-economy) · arm sim-scholarhome-rot-b
Date: 2026-10-21 · anchor commit 1aadc167d · instrument-only (zero src/js)

## Question
sim-prodrebuff-b DIAG'd scholar_home (the returnToVillage homecoming-pool
deposit, game.js ~8298–8360) as **16.2% of marginal glut inflow** with the
steepest glut/lean ramp of any channel (30.96x), and huntstaff-decomp-b's
metric review flagged the **scholar_home rot collapse (10,314 → 214/100d) as
unexplained at the mechanism level**. This DIAG builds the pool's
conservation story: where does every deposited kcal go?

## Pre-registration (binding — MEASUREMENT.md §§9–12, 14–15)
- **DIAG-GO bar**: ≥95% of scholar_home pooled inflow attributed to named
  sinks across the corpus, 0 unexplained remainder; the conservation
  equation (inflow == Σ sinks within ±2%) holds on **every** run.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max — the
  harness's communityExposure threshold is 10 iterations).
- **Seeds**: 8951–8958 × {leadfeast, belongfeast} (competent-family base,
  `scripts/policies/feastscale.js`) = 16 runs, observation-only.
- **Substrate** (asserted up front, LOUD STOP in every script):
  FEASTSCALE_R13=1, SEATDRIVE=0 explicit, SURPLUSFEED unset.
- **Proof**: `scripts/test-scholarhome-20261021.js` — instrument fidelity
  RED→GREEN (T1 sink-taxonomy unit probe incl. the spoilDay-honesty filter;
  T2 conservation on a 60d sim; T3 instrumented-vs-pristine digest identical;
  T4 det-gate byte-identical re-run). Result: **ALL GREEN**.
- **Verdict form**: DIAG-GO / DIAG-NO-GO / insufficient-data.
- **Panel (§15)**: pure-observation DIAG, no treatment arms — no panel
  compare ships. There is no before/after; the instrument is the measurement.
- **SENSE**: homecoming beats read (see below); narration blanks filed, not chased.

## Method
`scripts/scholarhome-conservation-20261021.js`: every piece deposited through
the homecoming pool is tagged with a unique per-deposit `__shTag` via a
behavior-faithful reimplementation of `depositPantryPieces` whose ONLY delta
is tag-aware merge (tagged pieces merge only with same-tag stacks — no
dilution into the mixed pool; T3 fidelity proves behavior-neutrality).
Every named pantry-removal path is wrapped with pre/post tagged-kcal diffs
(outermost hook attributes; nested defers). Transform paths
(player smoke/render/pemmican, the village cook's rack-smoking in
`resolveOneAssignment`) use a per-tag balance: transformed kcal = pre-tag
kcal − kcal still riding fresh (unchanged survivors + the cook's
dinner-reserve keep-aside copies keep their tags); only genuinely
transformed outputs lose the tag. No double counting, verified by T2.

Named sinks: `rotted` (sweepSpoiled, split fast ≤5d / slow >5d by shelf at
deposit), `preserved_racks` (village cook's smoke racks), `eaten_villager`
(villageEats incl. fresh-first pantryDraw and desperation drawSpoiled),
`eaten_player` (villageMeal), `packed_out` (takeFromPantry/Bulk),
`feast_out` (hostFeast), `tribute_out` (_removePantryKcal: payTribute/tendLink),
`raided` (havenGrowth monster raidPillage), `raided_commons`
(commonsRaid — neighbor-village night raids on our pantry),
`traded` (_evTakePantryKcal: river-trader feed/pay),
`eaten_npc_field` (npcTakeAction/npcChildAction 1-unit snacks),
`pantryDraw_other` (fallback direct draws), `in_pantry` (residual at run end).

## Results — the conservation story (16 runs, 1,254,055 kcal pooled)

Equation: **inflow == Σ sinks + residual exactly on all 16 runs
(unexplained 0.000%, attributed 100.0%)**. DIAG-GO bar cleared by a mile
(bar was ≥95% / ±2%).

kcal-weighted sink shares of the scholar_home inflow:

| Sink | Share | kcal | What it is |
|------|------:|-----:|-----------|
| rotted (all fast-rot) | 40.9% | 512,305 | village's overnight sweep discards it |
| preserved_racks | 19.0% | 238,158 | the village cook's smoke racks (resolveOneAssignment) |
| eaten_player | 17.1% | 214,595 | the scholar's own trust-scaled meals |
| eaten_villager | 8.1% | 101,515 | fresh-first daily meals |
| tribute_out | 5.0% | 62,105 | tribute/tend paid to primary villages |
| raided | 3.5% | 44,410 | monster pantry raids |
| feast_out | 3.3% | 41,145 | hosted feasts |
| raided_commons | 2.9% | 36,060 | neighbor-village night raids |
| packed_out | 0.3% | 3,582 | scholar packs from the pantry |
| eaten_npc_field | ~0% | 180 | field NPC 1-unit snacks |
| in_pantry (residual) | 0.0% | 0 | **nothing survives — see below** |

Deposit profile: 307 deposits across 13 depositing runs (3 runs: the
scholar never brought home a surplus — inflow 0, equation trivially holds),
mean **4,085 kcal/deposit**. Freshness at deposit (55 deposits sampled
across 4 runs): **100% with ≤5 days of shelf left** (16 in 0–2d, 39 in
3–5d, 0 above 5d), all `foodState: 'ready'`.

### The mechanism (the flagged rot collapse, explained)
The homecoming pool is not fresh food — it is **expedition-tail food**.
The scholar cooks on the trail (cooked rung: 5d shelf per the canon
ladder), carries it for days, and unloads what's left: every sampled
deposit arrives with 0–5 days of shelf remaining. The village does eat
fresh-first and the cook's racks rescue ~19% onto the preserved rung, but
the pulse is large (mean 4.1k kcal, up to ~6.5k) against a ~2–5d clock, so
**41% rots in the bins** — discarded honestly by the overnight sweep,
narrated ("went bad — beyond saving"). This is the huntstaff-decomp-b
"10,314 → 214/100d" collapse at the mechanism level: the pool's inflow is
structurally short-shelf, and no preservation path scales to the pulse.
Notably the residual is **0 kcal on all 16 runs** — the pool fully turns
over every run; nothing accumulates. The glut doesn't stockpile, it
evaporates.

Also of note: the player's own meals (17.1%) are the pool's second
mouth — the village feeds the scholar back, by design (parity). Monster
raids (3.5%) and neighbor night raids (2.9%) are real, named leaks on the
pool. The player-side preservation actions (preserveFood/renderFat/
makePemmican) never touch pantry pieces in sims — they operate on
inventory/prepStash; only the village cook's racks work the pool.

## Wall numbers (scale wall — every run)
- national: **9/16** · table: **15/16** · wins: **0/16**
- wave 4 unlock: 15/16 · wave 5 unlock: 0/16 (maxWaveUnlocked: 15× wave 4, 1× wave 3)
- median survival 146d · max 181d · endReason: 13 village-lost, 3 survived
- death causes: combat 436 · villager combat 145 · monster 67 · expedition 30 · starvation 12 · contest 8 · "a wound that wouldn't close" 7 · sickness 6 · (rest ≤2)

Reachability: waves 1–4 reached and fought (wave-4 field fights present in
the corpus); wave 5 never unlocked in 16 runs. Arc II/III/IV, regional →
national, and the table all reached (table 15/16, national 9/16). The win
flag never fired. Vests: not exercised by these policies in this corpus
(no vest telemetry in the per-seed JSONs — noted as a gap, not a claim).

## Village assessment
Thirteen of sixteen villages died, median 146 days — and the deaths are
overwhelmingly violent, not hungry: 648 of ~700 deaths are combat/monster/
expedition, starvation only 12. The food economy is not what kills these
villages; the scholar_home pool, for all its 41% rot, is a *surplus*
channel — the village eats (fresh-first works), the cook smokes, the
scholar eats back, and the rot is the overflow valve. The three surviving
villages include two where the scholar never deposited at all
(belongfeast 8952/8957, leadfeast 8957) — the pool is optional to survival,
a glut channel exactly as the taxonomy said. National reach (9/16) with
zero wins keeps the scale-wall picture: villages climb, the table waits,
the win stays shut on this substrate.

Villagers acted like people throughout: the cook works the racks and says
so ("worked the smoke racks too"), the village throws out its own rot
overnight rather than eating it (except genuine desperation draws, which
stay inside villageEats), raiders and neighbors steal from the pantry and
get named for it. No robotic behavior flagged in the meal/pool paths.

## SENSE-TESTING (homecoming beats read)
37 homecoming beats sampled (seed 8951, 40d). The deposit reads as a
person coming home: first return gets the pooling explanation ("We pool
food here. Keep what you need for the road — the rest feeds everyone."),
later returns are quiet; the keep/give split is narrated honestly every
time ("You keep a day's food (1920 kcal) and unload 240 kcal into Haven's
pantry." / "…nothing extra for the pantry this time."). The away-news
beat and the haul-teaching moment interleave sensibly. No fabricated
history, no silent pooling.

Narration blank (filed, not chased): the <2-days-away return line ("You
walk back into Haven. N Codex entries. The village is glad to see you.")
fires verbatim on consecutive-day returns — the same repetition class the
exile-refrain fix (r28) already cured on the exile path. Filed as
`[open] 2026-10-21 — homecoming beats — <2-day return line repeats verbatim
on back-to-back returns (evidence/2026-10-21/sim-scholarhome-rot-b.md).`

## Blanks filled
- **Filled**: the scholar_home conservation story — 100% of 1.25M kcal
  attributed to 11 named sinks on all 16 runs (instrument:
  `scripts/scholarhome-conservation-20261021.js`, proof:
  `scripts/test-scholarhome-20261021.js` ALL GREEN).
- **Filled**: huntstaff-decomp-b's metric-review flag — the rot collapse is
  explained at the mechanism level (expedition-tail deposits, 0–5d shelf,
  pulse vs. fresh-first throughput; 40.9% rots, 0 residual).
- **Filled**: `commonsRaid` identified as a real named pantry sink
  (neighbor night raids, 2.9%) — previously would have hidden in a
  fallback bucket.
- **Documented**: the village cook's rack-smoking (`resolveOneAssignment`)
  is the ONLY preservation path that touches the pool (19%); player
  smoke/render/pemmican never see pantry pieces in sims.
- **Documented**: 3/16 runs had zero scholar_home inflow — the channel is
  policy/seed-dependent, not structural.

## Metric review
- The ±2% equation bar was far too loose for this instrument: every run
  hit 0.000% unexplained. For future conservation DIAGs, propose the bar
  be "0 unexplained remainder, every named sink >0.1% identified by
  mechanism" — the instrument proved it can be met.
- `pantryDraw_other` as a fallback bucket worked as designed (caught the
  commonsRaid path, which then got its own name). Keep the pattern:
  fallback-then-name.
- Per-seed JSONs carry won/national/table/maxWaveUnlocked/deathCauses
  plus the full conservation summary (see
  `evidence/2026-10-21/perseed-scholarhome-rot-b/`); the coordinator's
  telemetry deviation check can read them directly.

## Panel note (§15)
No balanced-panel compare ships: this is a pure-observation DIAG with no
treatment arms. The instrument (tag + hook census) is the measurement; the
pre-registered threshold was the judge, and it was met (DIAG-GO).
