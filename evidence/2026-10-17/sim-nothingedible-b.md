# sim-nothingedible-b — nothing-edible guard-loop spam fix (loop B, run fleshout-b-20261017T1235Z, axis food-economy)

Fixes filed finding #473 (evidence/2026-10-17/sim-feastvoice-b.md, instrument
scripts/census-feastvoice-b.js): the scholar pack-eat flow's
"Nothing edible. (<inventory list> — not food yet: <prep hint>.)" beat
(src/js/game.js:25107) fires byte-identical up to 105 times in a single day
(belongfeast-s6101 d143 = 105, s6103-belong d-max 83, s6104-lead d-max 63).
Same guard-loop spam class as #363 — the competent policy re-attempts
pack-eating many times on a starvation day and the engine voices the full
inventory list every time. Precedent: sim-dawnrefuse-b fixed #363 POLICY-SIDE
with a per-dawn flag in scripts/policies/competent.js (c3346dd5).

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14)

- PRIMARY: max per-day "Nothing edible." beat count ARMED ≤ 2 on the
  previously-spamming seeds (s6101–s6108 × {leadfeast,belongfeast},
  FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware).
- GUARDRAIL: det-gate byte-identical state trajectories
  (control vs armed, per-day hashes) + wall metrics identical
  (national, table, wins, wave-4/5, median survival, starvation deaths).
- GO → the layer lands PERMANENTLY (voice-only precedent: dawnrefuse landed
  permanently, default-on). Frequency-only gating: no [needs-eyes] (prose
  text itself unchanged).
- NO-GO → evidence + instruments only, layer reverted zero-trace.
- Horizon: 180d death-aware (dead villages stop, +10d tail max) — the spam
  days are deep-run starvation days (d143+), so a short horizon can't see it.
- Seeds: 6101–6108 × {leadfeast, belongfeast} (the exact corpus the census
  filed the finding on). Screening = pilot only; the metric IS the pilot
  verdict (8 seeds × 2 policies = 16 runs/side). Confirm spend only if pilot
  passes.
- Policies: competent-family (leadfeast, belongfeast) with FEASTSCALE_R13=1
  both sides — the substrate where the spam was found.

## The lever (policy-side, voice-only)

Gate the re-attempt, not the verb: once the day's pack-eat attempt has heard
"nothing edible" and the pack is unchanged, skip the re-attempt (the engine
would voice the same beat and move no state). A changed pack (forage haul,
pantry take, aid parcel) or a new day re-arms honestly. Implemented as
`packEatOnce()` in scripts/policies/competent.js, wrapping both `Game.eat()`
call sites in `competentEat` (the line-32 pack-first eat and the guard-loop
eat after `takeFromPantry` — a successful take changes the pack key, so the
pantry fallback re-arms automatically). Env kill: NOTHINGEDIBLE_GATE='0'
restores the old path (default ON). WeakMap keyed on the Game object, like
DAWNREFUSE, so sequential seeds in one process don't leak flags. Loop A is
live in src/js/game.js — this arm touches NOTHING in src/js, only
scripts/policies/competent.js + instruments + evidence.

## Before / after (pilot: 32 runs, 8 seeds × 2 policies × {control,armed}, 180d death-aware)

| seed/policy | control beats (max/day) | armed beats (max/day) |
|---|---|---|
| leadfeast s6101 | 2 (1) | 2 (1) |
| leadfeast s6102 | 5 (1) | 5 (1) |
| leadfeast s6103 | 5 (3) | 3 (1) |
| leadfeast s6104 | 130 (63) | 5 (1) |
| leadfeast s6105 | 0 (0) | 0 (0) |
| leadfeast s6106 | 0 (0) | 0 (0) |
| leadfeast s6107 | 16 (5) | 8 (2) |
| leadfeast s6108 | 0 (0) | 0 (0) |
| belongfeast s6101 | 272 (105) | 19 (1) |
| belongfeast s6102 | 17 (3) | 13 (1) |
| belongfeast s6103 | 215 (83) | 5 (1) |
| belongfeast s6104 | 2 (2) | 1 (1) |
| belongfeast s6105 | 0 (0) | 0 (0) |
| belongfeast s6106 | 2 (1) | 1 (1) |
| belongfeast s6107 | 16 (5) | 8 (2) |
| belongfeast s6108 | 11 (4) | 6 (2) |

Pooled: control 693 beats over 71 starvation days, max 105/day → armed 76
beats over 69 starvation days, max 2/day. PRIMARY MET (≤2).

The three census headline seeds reproduce exactly and are crushed:
belongfeast-s6101 272/105d-max → 19/1; belongfeast-s6103 215/83 → 5/1;
leadfeast-s6104 130/63 → 5/1.

Wall metrics (identical both sides — the gate moves no game state):
national 11/16 = 11/16, table 13/13, won 0 = 0, wave4 0 = 0, wave5 0 = 0,
starvation deaths 7 = 7, median survival 145d = 145d, per-run days/endReason/
wave/rank matched on all 16 pairs, and the pooled death-cause histogram is
byte-identical (combat 470, villager combat 124, monster 78, expedition 35,
contest 14, starvation 7, ...).

Proof (scripts/test-nothingedible-20261017.js): PART A 8/8 (stub: RED
gate-off voices every attempt; gate-on voices once per day per pack; pack
change and new day re-arm; per-Game flags; edible-pack path never gated;
empty-pack "nothing to eat" class gated too); PART B 3/3 (live engine,
constructed starvation state: 5 attempts → 5 beats off / 1 beat on, state
hashes identical); PART C det-gate 16/16 byte-identical per-day trajectories
(60d; trigger exercised on 7/16 seeds — the starvation seeds; the other 9
have no starvation day in 60d, gate inert there by construction).

## Reachability verdict

n/a — voice-only arm; no content gates touched. Wall numbers on this corpus
(identical both sides): national 11/16, table 13/16, wins 0/16, wave-4 0/16,
wave-5 0/16, median survival 145d. The wave-4/5 zeros are a corpus property
(this seed set caps at wave 3), not an arm effect — both sides agree.

## Village assessment (plain words)

The corpus shows two kinds of villages. The thriving kind: belongfeast-s6101
survived the full 182 days, reached global rank, sat at the table, hit Arc 4
— a late-game village that works. Its dead are overwhelmingly fighters
(59 combat, 8 villager combat, 4 expedition, 4 monster): this is a village
that bleeds in fights and keeps going, not one that starves — exactly one
starvation death in 182 days. The scholar's lean stretch (d134–148) is the
spam window: the pack held White Oak Acorns and Hickory Nuts in shell —
known, nameable food — while the engine recited the inventory 83–105 times a
day and the scholar ate nothing from it (see the new finding below). The
fragile kind: leadfeast-s6106 died at d51 (wave 2, regional); belongfeast-s6103
lost the village at d111 (regional). Same policies, same substrate — the
difference is the fights, not the food: combat is 470/16-run deaths, the
standing killer, and the food voice fix doesn't touch it.

## Sense-test (SENSE-TESTING LAW — transcripts read)

Control d142 (belongfeast-s6101): the same sentence 83 times —
"Nothing edible. (White Oak Acorns (in shell), Hickory Nuts (in shell) — not
food yet: Needs shelling — crack and pick the nutmeats. (Shell action).)"
The FIRST hearing is honest and useful: it names exactly what's in the pack
and exactly what would fix it. Hearings 2–83 add nothing — no new
information, no new meaning, a wall of identical text on a starvation day.
Armed: the same beat once per day per pack state. **PASS** — one telling
reads as a person taking stock; 105 readings reads as a stuck record. The
gate keeps the telling and loses the record.

## Blanks filled

- Finding #473 fixed: per-day pack-state voice gate (`packEatOnce`) in
  scripts/policies/competent.js, default ON, NOTHINGEDIBLE_GATE='0' kill
  switch. Lands permanently (voice-only precedent). Prose text unchanged —
  no [needs-eyes].

## Blanks documented (new finding, not chased — outside this arm)

- Filed to hidden_files/sim-findings.md: the competent policy never shells
  in-shell nuts (or runs any camp food processing — no cookAll, no shell,
  nothing). On belongfeast-s6101 d142–143 the scholar carried White Oak
  Acorns + Hickory Nuts in shell — named, known, processable ("Shell them —
  4 ticks · everyone knows how", src/js/food.js:2745) — through a starvation
  stretch while the engine voiced "Nothing edible" 188 times. The voice is
  honest; the behavior is the blank: the food ladder's first processing rung
  has no policy-side actor. A future food-economy arm should teach the
  policy to shell (and audit the other camp tasks).

## Metric review

- Primary (max/day armed ≤ 2): MET — armed max 2, on the previously-spamming
  seeds (105→1, 83→1, 63→1).
- Guardrail (det-gate byte-identical + wall identical): MET — PART C 16/16
  byte-identical per-day trajectories; 180d wall metrics identical
  (national/table/wins/wave/median/starvation/death histogram).
- Instrument/horizon note (not a metric miss): the det-gate runs 60d, not
  30d — the spam is a starvation-day phenomenon and the earliest trigger on
  this corpus is d51 (belongfeast-s6103). A 30d gate would have been vacuous.
  This was set before any det-gate spend (probe-verified), not re-scored
  mid-run.
- Telemetry deviation check: `telemetry-check.js` fired LOUD on "wins
  disappeared: baseline 16 → current 0". Investigated same-run: the CONTROL
  side also has 0 wins on this corpus — it is a seed-set property (0 wins on
  16 runs, both sides), not an arm effect. national/table/exiled show no
  LOUD deviation (11 vs 12, 13 vs 16, 0 vs 0).
- check.js --quick: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (monster sprite SVGs: dustboar,
  sunback, sweeps_week, cliffhanger), pre-existing on this hot tree and
  unrelated to this arm (no src/ files touched; policy-side only).

## Convergence

Arm converged: finding #473's fix is proven (proof + pilot green) and lands
permanently. The nothing-edible guard-loop spam class (#363 dawnrefuse,
#473 nothing-edible) now has the same policy-side per-day-gate treatment in
both loci. Axis (food-economy) state per the convergence tracker.
