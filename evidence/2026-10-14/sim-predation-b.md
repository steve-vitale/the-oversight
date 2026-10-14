# ARM 3 "pantry-predation" — WAVE-5 PANTRY PREDATION DIAGNOSTIC (loop B, food-economy axis)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Question**: sim-findings #138 (hollow arm r27): The Cancellation (wave-5
  Producer) lingered at the treeline and gorged 4,071 kcal over two nights
  (s88 d85–86), driving pantry 17.6k→0 → 3 hungry days → village-lost with a
  living scholar. Is the gorge a TUNED WALL LEVER (reachable counterplay,
  gorge cost proportional to village-scale production) or a DEATH SPIRAL (no
  counterplay, gorge → collapse chain)?
- **Type**: DIAGNOSTIC — instruments + evidence only. No game-code changes,
  no lever, no before/after. (Per-run determinism holds on this commit —
  detA/detB byte-identical — but there is no "before" for a diagnostic.)
- **GO**: instrument honesty — the sweep produces gorge events/nights/kcal,
  drive-off engagements with outcomes, episode resolutions, and collapse
  windows on wave-5-rich seeds — AND a VERDICT IS NAMED LOUDLY (tuned lever
  vs death spiral, with the wave split if they differ).
- **Horizon**: 180d ceiling, death-aware (runDays stops on Game.over /
  pop-zero +10d tail). The gorge is a late-game phenomenon (raids need 3+
  world monsters and 3,000+ kcal pantries); a short horizon would miss it.
- **Seeds**: leadfeast × 11/22/33/44/55/66/77/88 (r27 census: wave-5 on
  22/44/55/88); fifthlink (leadcourt + FOURTHLINK=1 + FIFTHLINK=1) ×
  11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808 (r26-era wave-5
  seeds s11/s33/s44/s606 included). 24 runs, ~94s compute.
- **Policies**: leadfeast (FEASTSCALE_R13=1 — the wave-5-maximizing road);
  fifthlink-r26 (the leadcourt road that produced the r26 wave-5s).
- **Anti-drift (§14)**: the verdict is judged against this header. A miss on
  instrument honesty would be NO-GO, never re-scoped. Metric doubts go
  under "metric review" below and apply to the NEXT run.

## Instrument

- `scripts/predation-lib-20261014.js` — read-only wraps: `havenGrowthDaily`
  + `raidPillage` (gorge events paired in call order, pantry before/after),
  `Game.say` (gorge beats verbatim), `resolveAidCrisis` (crisis end type),
  `resolveWildMonsterEncounter` (villager drive-off fights),
  `startCombat` + `tbEnd` (scholar engagements linked to fight outcomes),
  `callForHelp` (does anyone answer the beat's second clause?),
  `removeWorldMonster`, daily lingering+pantry samples. Episodes
  reconstructed from samples + sub-day synthetic episodes from
  engage/removal records (the raid-at-night / driven-off-next-morning
  pattern is invisible to daily samples alone).
- `scripts/sweep-predation-b-20261014.js` — sweep driver (POLICY × SEEDS ×
  DAYS → merged + per-seed JSON).
- `scripts/test-predation-instrument-20261014.js` — proof test, **23/23
  GREEN**: PART A (forced gorge fixture: 1 night, wave-5 id, got in
  [500,1500], pantry reduced by exactly got, beat captured with the
  drive-off verbs); PART B (killed → 'killed', lingering=false →
  'moved-on', kcal attributed); PART C (s44 120d wraps-vs-no-wraps
  BYTE-IDENTICAL on per-day state hashes — the wraps are read-only).
- Honesty notes: (1) world monsters are REMOVED at fight start with full HP
  ("it's in the fight now, not wandering") — removal ≠ kill; kills come
  from the tbEnd link. (2) One startCombat can pull pack members; engage
  records are per-call. (3) Residual accounting edge: on leadfeast-s44 d99
  two lingering cancellations were removed but only one startCombat call
  was recorded — a sub-day multi-raider sequencing edge; the drive-off
  outcome ('fight-lost') is still correctly attributed. (4) `wave` is
  resolved from the monster def by id (entity-wave-missing, known).

## VERDICT — SPLIT: TUNED WALL LEVER for waves 1–3; DEATH-SPIRAL POCKET for waves 4–5

**The gorge as a mechanic is a tuned wall lever.** The counterplay the beat
promises ("Drive it off") is real and reachable: 71 drive-off engagements
measured, 37 kills (52%). 16 of 29 sub-day episodes were killed BEFORE any
gorge night — scholars and villagers routinely answer the threat the next
morning. The cost is proportional: median 1,245 kcal/night/monster against
village-scale pantries (20–50k) — absorbable; villages DO survive it
(fifthlink-s707: 3 gorge nights at d140–142, pantry 20k, survived to d182).
The gorgedrive arm (r28 ARM 1) independently proved the same for waves 1–3.

**Wave-4/5 lingerers are a death-spiral pocket.** Across all 24 runs:
**0 drive-off kills against wave-4/5 lingering monsters in 17 attempts**
(scholars 0/9, villagers 0/8 — cancellations, editors, reunions, eulogies,
influencers, spools, suburbs, finales). For exactly the monsters the
wave-5 fiction is about, the beat's "Drive it off" is UNREACHABLE by combat.
The only exits measured: the crisis drifts after ~6 days ('moved-on',
~6–9k kcal gorged) or the village dies with the monster still gorging
('lingering-at-end' ×8, all village-lost/dead). The s88 Cancellation case
(4,071 kcal → hollow) is this pocket, not the tuned mechanic.

## Numbers

- **Gorge volume**: 11/24 runs gorged; 49 gorge nights; 78 beats;
  ~100k kcal total (leadfeast 11,197 + fifthlink 88,936).
- **Per-beat takes**: min 0, median 1,245, p90 2,495, max 3,982, mean 1,284.
  **26/78 beats (33%) exceed the 500–1,500 design cap** — `pantryDraw`'s
  indivisible-piece rule ("no fractionating", Steve 2026-10-08) lets one
  monster eat a whole 2.8–4.0k hunk in a night. 12 beats were 0 kcal
  (gorging on an already-empty pantry).
- **Worst single nights** (multi-raider pile-ups): 6,656 (s404 d95),
  5,496 (s55 d123), 5,278 (s404 d70) kcal in ONE night.
- **Gorge kcal by monster wave**: w1 8,502 · w2 26,023 · w3 13,505 ·
  w4 10,333 · w5 5,835. The gorge is wave-agnostic — most of it is NOT
  wave-5.
- **Wave-5 gorges**: 2/24 runs — fifthlink-s11: The Editor, 2 nights,
  3,340 kcal, moved-on; fifthlink-s44: The Finale's crew, 1 night,
  2,495 kcal, lingering-at-end (village-lost d132).
- **Drive-off outcomes**: scholar 20 kills / 17 failed; villager 17 kills /
  17 failed. Scholar kills by wave: w1:9, w2:8, w3:3, w4:0, w5:0. Scholar
  fails by wave: w4:8, w5:1 (+w1–3: 8). Villager kills: w1:5, w2:9, w3:3,
  w4:0, w5:0. **No wave-4/5 lingerer was ever killed.**
- **Episode resolutions** (57): killed 28 · moved-on 8 · drive-failed 13 ·
  lingering-at-end 8.
- **Collapse windows** (gorge → pantry ≤500 within 5d): 10 runs; 10/11
  gorge runs ended village-lost/dead. The hollow signature (gorge → 0 →
  hungry days → scattering) reproduced repeatedly, e.g. fifthlink-s44
  d121–126 (callback 1,148+994+3,953+2,813+0+2,215 → lost d132).
- **"Call for help"**: 0 calls in 24 runs. The beat's second verb is dead
  on these policies (the aid chain exists; nobody invokes it).
- **Aid crises**: 176 resolved 'fought' (threat cleared) vs 3 'moved-on'
  (6-day drift valve). The valve is a real backstop but slow (6+ gorge
  nights first).

## Wall numbers (this suite)

| policy | seeds | national | table | wins | wave-4 | wave-5 | median surv |
|---|---|---|---|---|---|---|---|
| leadfeast | 8 | 3 | 1 | 0 | 2 | 2 | 101d |
| fifthlink | 16 | 9 | 0 | 0 | 3 | 3 | 115d |

## Village assessment

The gorge fires when a raid leaves unmet raiders — i.e. when the defender
pool is already thin — and then deepens the depletion. Who thrived:
villages with fat pantries and full defender lines never saw a lingerer
(13/24 runs gorge-free). Who died: the depleted — s22's reunion+eulogy
parked at the treeline for the last 34 days of a 119-day village;
s66's tick drank 7,614 kcal across 5 nights from a 2,245-kcal pantry while
villagers fought it nightly and failed (wave-2 tick vs thin roster —
attrition, not a fair fight). What was missing is not the counterplay for
waves 1–3 (it exists and fires) but any answer at all for waves 4–5: the
scholars who marched out against cancellations, influencers, eulogies and
reunions lost every time, and the villages then chose between endurance
and the hollow. The s88 pattern is confirmed as the apex instance of a
real pocket, not a one-off.

## Sense-testing (read the beats, not just the counts)

The beat reads as a fair, legible fight for the village's food — for
waves 1–3. "🌙 Night. The lingering The Heckler gorges at the treeline —
1,600 kcal gone from the stores. Drive it off, or call for help." names
the thief, the exact cost, and two verbs. The preceding "Nobody met the
X — it's still out there at the treeline. It'll gorge every night until
it's driven off." frames a siege with stakes. Coherent, honest, no
dispenser text.

Two narration edges: (1) the 0-kcal beats ("gorges at the treeline — 0
kcal gone from the stores. Drive it off, or call for help.") fire on
emptied pantries — honest (says 0) but the verb "gorges" is wrong; the
monster is nosing empty bins. (2) For wave-4/5, the beat is a lie the
fiction can't cash: "Drive it off" names a counterplay that does not
exist at those waves (0/17 kills). The threat reads fair; the promised
answer is not there. That gap is the steve-call below.

## Blanks filled / documented

- **WAVE-5 PANTRY PREDATION** (sim-findings #138, open → diagnosed): the
  gorge is TUNED for waves 1–3 (reachable counterplay, proportional cost —
  confirms and bounds the gorgedrive arm's verdict) and a DEATH-SPIRAL
  POCKET for waves 4–5 (0/17 drive-off kills; beat's "Drive it off"
  unreachable). New sim-findings entry filed as steve-call (below) — no
  fix built.
- **Documented, not chased**: (a) indivisible-piece overshoot — 33% of
  takes exceed the 1,500 design cap (max 3,982), so the "500–1,500/night"
  design is not what the engine measures; (b) "call for help" 0/24 —
  whether the aid chain scales to apex lingerers is unmeasured; (c)
  0-kcal gorge beats on empty pantries; (d) the 2-removals/1-fight
  sub-day accounting edge (instrument note, no verdict impact).

## Metric review (§14)

The pre-registered GO (instrument honesty + a loudly named verdict) is
MET. Per §14 the run is judged against its header, not re-scored. For
the NEXT run on this question: (1) the wave split should be
pre-registered up front — "drive-off kill rate by monster wave" as the
primary, not a post-hoc cut; (2) "call for help" needs a policy that
actually calls (all four tiers sat at 0/24 here), otherwise the aid
chain's apex scaling stays unmeasured; (3) per-night pile-up drain (max
6.6k/night) deserves its own guardrail — the per-monster take cap is not
the binding number, the per-night sum is.

## Repro

- `SEEDS="11,22,33,44,55,66,77,88" POLICY=leadfeast DAYS=180 OUT=evidence/2026-10-14/predation-b-leadfeast.json node scripts/sweep-predation-b-20261014.js` (27s)
- `SEEDS="11,22,33,44,55,66,77,88,101,202,303,404,505,606,707,808" POLICY=fifthlink DAYS=180 OUT=evidence/2026-10-14/predation-b-fifthlink.json node scripts/sweep-predation-b-20261014.js` (67s)
- `node scripts/test-predation-instrument-20261014.js` (23/23)
- Per-seed JSON: `evidence/2026-10-14/predation-b-<policy>-s<seed>.json`
