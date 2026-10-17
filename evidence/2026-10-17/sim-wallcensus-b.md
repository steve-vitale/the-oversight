# sim-wallcensus-b — wall-state census post-0152a2ce (flesh-out loop B, 2026-10-17)

Axis: food-economy. Run: fleshout-loop-b-20261017T0004Z. Master 0adefbb4.

## Why
Steve's 2026-10-16 root-cause ruling 0152a2ce closed the pantry granularity
leak (all external deposits split to <=500-kcal pieces by default) AFTER the
last pure food-economy wall census; the crisis-tier fix and the ledger-reset
verify also landed since. This is the first wall-state census on the
post-ruling substrate.

## Pre-registration (binding, MEASUREMENT.md §14)
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (unset now means driver
  ON after c004b9dd — the census pins the driver OFF), base courtship
  policies only (leadcourt, belongseek), no policy layers. 180d
  death-aware. Asserted up front by scripts/sweep-wallcensus-20261017.js
  (SWEEP STOP on mismatch).
- SEEDS: 8 FRESH seeds 4201–4208 x 2 roads = 16 runs, identical-seed
  lead/belong pairs. Fresh check against the coordinator's banned list
  (none of [982–989], [3101–3108], [3301–3308], [3201–3208],
  [171,282,393,504,615,726,837,948], [931–938], [111–888],
  [121,232,343,454,565,676,787,898], [131,242,353,464,575,686,797,908],
  [151,262,373,484,595,706,817,928], [163,274,385,496,607,718,829,940],
  [1701..1708], [205,246,321,412,523,634,745,856],
  [307,418,529,640,751,862,973,84], [917,928,939,104,215,326,437,548],
  [141,252,363,474], [101,202,303,404,606,707,808,909],
  [137,248,359,470,581,692,803,914], [11–88], [1201–1208], [991–998]).
- PRIMARY = census COMPLETION gates: 16/16 runs completed; 100%
  wall-metric attribution (every per-seed JSON carries numeric
  national/table/wins/exiled — the schema-drift LOUD class); 4-run
  det-gate byte-identical trajectory hashes; 0 instrument errors.
- ESTABLISHMENT gate (expect, NOT require — the census describes, the
  tracker judges): national 11–14/16, table-arrival 13–15/16, wins 0/16,
  wave-4 13–15/16, wave-5 6–9/16, median survival 115–145d.
- Also recorded per run: starvation share of deaths, dehydration/thirst
  counts, crumb/whole-piece take dynamics (verify in-sim that no external
  deposit exceeds 500-kcal pieces via the depositPantryPieces choke-point
  instrument), exiled, death-cause shares, maxRank, wave unlock days.
- SENSE: read beats — one starvation-relevant arc, one feast arc — judge
  meaning, not counts (SENSE-TESTING LAW).

## Metric review
The establishment gate's table/wave expectations (table 13–15/16, wave-4
13–15/16, wave-5 6–9/16) proved wrong for this substrate — actual 0/16 on
all three. Per §14 the miss stands (NOT re-scored); the revision for the
NEXT run: pre-register table/wave expectations conditional on the seat
substrate (SEATDRIVE=0 base-courtship runs should expect table 0/16; the
gate as written described the seat-driver-on lineage). The completion
gates were the right primary — all GO. No metric changes mid-run.

## Instruments
- scripts/sweep-wallcensus-20261017.js — 16-run sweep, read-only
  instrument stack (beats, tendLink, depositPantryPieces, daily link +
  fresh-days census). Errors counted, never swallowed.
- scripts/test-wallcensus-20261017.js — proof: (a) fixture attribution
  with REAL RED pins (crumb threshold, road attribution), (b) 4-seed
  det-gate, (c) SMOKE schema check.
- scripts/analyze-aidchannel-20261017.js — ARM 2 analyzer over the same
  16 per-seed JSONs (no second sweep).
- Evidence: evidence/2026-10-17/perseed-wallcensus-b/*.json (16),
  evidence/2026-10-17/wallcensus-b-beats/*.json.
- Instrument SHAs (worktree sim-censusb @ 0adefbb4 + new files):
  sweep-wallcensus-20261017.js, test-wallcensus-20261017.js,
  analyze-aidchannel-20261017.js (committed by coordinator).

## Results
Sweep ran 2026-10-17 ~00:30–00:55 UTC, exit 0, ~22 min wall for 16 runs.
Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit).

COMPLETION gates (primary, all GO):
- 16/16 runs completed (14 survived the full 182d horizon; 2 belong
  village-lost at d158/d115 — death-aware horizons working).
- 16/16 per-seed JSONs carry numeric national/table/wins/exiled
  (schema check: 0 bad records).
- Det-gate: 4/4 paired 60d runs byte-identical trajectory hashes
  (leadcourt+belongseek × s4201/s4202).
- 0 instrument errors across all 16 runs.

ESTABLISHMENT gate (expect, not require):

| road | national | table | wins | w4 | w5 | median | max | exiled |
|---|---|---|---|---|---|---|---|---|
| leadcourt | 8/8 | 0/8 | 0/8 | 0/8 | 0/8 | 182d | 182d | 0/8 |
| belongseek | 7/8 | 0/8 | 0/8 | 0/8 | 0/8 | 182d | 182d | 0/8 |

- national 15/16 (expected 11–14/16) — exceeded.
- table 0/16 (expected 13–15/16) — missed; THE headline deviation.
- wins 0/16 (expected 0/16) — met.
- wave-4 0/16, wave-5 0/16 (expected 13–15/16, 6–9/16) — missed.
- median survival 182d (expected 115–145d) — exceeded; villages live
  the whole horizon.
- maxWave = 3 on ALL 16 runs (daily sampling || harness max agree).

## Crumb verification (0152a2ce in-sim)
408 depositPantryPieces calls across 16 runs, max piece 500 kcal,
VIOLATIONS 0. The granularity ruling holds in-sim: no external deposit
exceeds 500-kcal pieces. Whole-piece take dynamics: worst pantry piece
observed 500 kcal; no >500 atoms reached the meal logic. Blank verified,
not just asserted.

## Starvation / thirst
- Starvation deaths: leadcourt 1, belongseek 9 (of 262 belong deaths =
  3.4%; lead 1/295 = 0.3%).
- Thirst/dehydration deaths: leadcourt 4 (dehydration ×3 + 1
  thirst-tagged), belongseek 0.
- 8 of the 9 belong starvations happened in ONE run (belongseek-s4205,
  the hunger-winter arc — sense-read below); the other in s4202's
  combat-wipe tail.

## Death-cause shares
- leadcourt (295 deaths): combat 155, villager combat 77, monster 29,
  expedition 12, sickness 9, contest 8, dehydration 3, the night 2.
- belongseek (262 deaths): combat 126, villager combat 82, monster 28,
  expedition 10, starvation 9, a wound that wouldn't close 3, contest 2,
  sickness 2.
- Same families both roads — no new death mode. Villages die of
  violence, not hunger (the hunger-winter run excepted).

## Village assessment (plain words)
Sixteen villages, two roads, one shape: they get big, they get national,
they live the whole season, and then nothing further happens. On the lead
road every village (8/8) proposed its three subordinates, tended them
weekly (865 tend attempts, ~1.16M kcal of real grain moved), and stood as
a primary at national. On the belong road 7/8 reached national as valued
subordinates. The pantry stayed healthy most days (the overstock trigger
stood open 1,186–1,312 run-days per road). And then — the table never
staged, wave 4 never unlocked, nobody won. The two villages that died
died of violence (s4202: 33 combat/monster deaths by d158, pantry empty
at the end — a combat wipe with a hunger tail) and of a genuine
hunger winter (s4205: see the sense read).

Who thrived: the courtship engine works — villages that court reach
national on both roads. Who died and why: the violence ledger, plus one
honest famine. What's missing: the on-ramp past national. The readiness
gate holds wave 4 shut (replicates sim-trickmatter/sim-arming: the gate
is tight by design or the arming substrate is absent — either way, 0/64
on the pre-seat courtship substrate now), and the table simply never
seats on base courtship with the seat driver pinned off. The blank this
run fills: the post-0152a2ce food economy is not the wall — the wall is
between national and everything after it.

## Villagers as people
Sense-read beats (belongseek-s4205, the hunger-winter run):
- d1–d25: the scholar starves from day one while the village eats —
  "Village meal: +140 kcal (Half ration — they don't trust you yet.)"
  Villagers ration the newcomer by trust. Social, not robotic — the
  trust economy is legible and consequential.
- d28: three villagers check a full pantry and turn away from foraging —
  "the shelves are full, ~8 days of fresh on hand… The pantry can't take
  more; the wild will keep." A judgment call, and they were wrong:
  tribute (5,000 kcal) + raids (~2,350 kcal over d28–d31) + a neighbor
  stripping the shared ground drained it.
- d32: "◈ CRISIS — THE HUNGER WINTER. Three days now the village has
  gone to sleep hungry. The pantry is an echo." d33: four villagers
  starve the same day — "💀 Katharina starved. Slowly. The village is
  10 now." × 4.
- d33–d40: grief becomes leverage — "With Haven grieving, Emberhold
  installs their own speaker at the table… tribute rises to 7,500
  kcal/week. Grief became leverage." The scale system reads the
  village's mourning and prices it. Cold, coherent, very Steve.
- Repetition note (same pre-existing class documented in
  sim-aidfeastint-b): the STARVING line and the "Something's been at
  the pantry" overheard beat repeat byte-identical daily. Filed, not
  chased.

Feast arc (leadcourt-s4201): feasts fire with named villagers opening
and varying menus; the sentimental-item feast line ("Dead Phone… The
feast was the weapon") repeats byte-identical daily — same filed class.

## Blanks filled / documented
- **MEASURED (diagnostic)**: post-0152a2ce wall census — 8 fresh seeds
  × {leadcourt, belongseek}, 180d death-aware, SEATDRIVE=0,
  FEASTSCALE_R13=1. Completion gates all GO (16/16, schema-clean,
  det-gate 4/4 identical, 0 instrument errors).
- **VERIFIED**: 0152a2ce holds in-sim — 408 external deposits, max
  500-kcal piece, 0 violations.
- **DOCUMENTED (scale wall)**: on the SEATDRIVE=0 base-courtship
  substrate, national arrives 15/16 but the table never stages (0/16)
  and waves 4/5 never unlock (0/16) — telemetry LOUD vs baseline
  (table 16→0, wins 16→0) investigated same-run: zero galactic-table
  staging beats in any run. The wall sits between national and the
  table; table arrival is not produced by courtship play on this
  substrate. Filed to sim-findings.md as [open] steve-call candidate.
- **REPLICATED**: wave-4 0/16 extends the sim-trickmatter/sim-arming
  readiness-gate finding to 0/64 on the pre-seat courtship substrate.
