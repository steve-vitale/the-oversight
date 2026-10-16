# sim-dawnrefuse-b — BASE DAWN PANTRY-FALLBACK REFUSAL SPAM fix (loop B, axis food-economy, 2026-10-15)

Fixes the filed finding (sim-dawngo-b evidence, "BASE DAWN PANTRY-FALLBACK
REFUSAL SPAM"): when the courtship scholar is outside the hall at dawn and
kcal < 0.85*cap, the base competent policy's pantry-fallback guard-loop
(competent.js competentEat, `while (s.kcal < cap*0.95 && guard++ < 20)`)
voices "The pantry is in the hall. Your hands are not." ~40-50 times in a
single dawn. Honest but noisy.

Policy-side lever, zero src/js changes (game-code take verbs untouched).
run_id: fleshout-b-20261015T1746Z (coordinator-assigned worktree sim-dawnrefuse-b).

## PRE-REGISTRATION (MEASUREMENT §§9-12, 14 — binding, written BEFORE sims)

- **Question**: can the base policy's dawn pantry-fallback refusal be gated
  to once per dawn without changing take behavior (refused draws)?
- **Lever**: scripts/policies/competent.js — in competentEat, when
  Game.havenStoresAccess()==='none' (the scholar's hands can't reach the
  pantry), the guard loop's every iteration would be refused anyway: the
  engine's takeFromPantry voices honestly, returns null, changes NO state
  (verified by reading game.js takeFromPantry/takeFromPantryBulk/donateToPantry
  refusal paths — all voice + return null). So: voice the SAME refusal line
  ONCE per dawn (per-dawn flag keyed on scholar day, stored in a WeakMap
  keyed on the Game object so sequential seeds can't leak flags) and skip
  the loop. VOICE ONLY — the take behavior (refused draws) is unchanged.
  Game-code take verbs untouched. Gate: DAWNREFUSE_GATE='0' restores the
  old path (default ON — the fix is a strict improvement, lands permanent).
- **Canon**: docs/CANON.md read. No distribution canon doc exists (stated
  per the canon rule; none invented). No-silent-actions honored: the
  refusal still speaks, once.
- **PRIMARY (binding)**: refusal beats per dawn armed <= 2 (from ~40-50;
  measured on dawnmeal/dawngo-style dawn transcripts — Game.say capture
  filtering "pantry is in the hall").
- **GUARDRAILS**: trajectories BYTE-IDENTICAL on identical seeds — det-gate
  N seeds x {leadcourt,belongseek} x {gate-off,gate-on}, per-day hashes of
  (day, health, kcal, roster len, px, py, wave, pantry) must match exactly
  (a voice-only change must not alter game state). Wall metrics unchanged:
  national, table, wins, starvation deaths (pooled, 16/16 runs).
- **GO** -> the fix lands PERMANENTLY (default-on; commit the competent.js edit).
- **MISS** -> revert the competent.js edit, commit evidence + instruments
  as KILLED AT PILOT.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**:
  131/242/353/464/575/686/797/908 x {leadcourt,belongseek} x {gate-off,gate-on}
  = 32 runs, OWN control in the SAME sweep, FEASTSCALE_R13=1 both sides.
- **Proof**: scripts/test-dawnrefuse-20261015.js — RED->GREEN before sweep
  spend (PART A: unit — refusal fires once per dawn across simulated guard
  iterations; PART B: live-engine REAL RED — constructed dawn, scholar
  outside hall, kcal<0.85cap; PART C: det-gate byte-identical trajectories).
- **SMOKE=1** instrument-honesty gate on proof + sweep.
- **Sense-test** (Steve's law): read dawn transcripts before/after — the
  refusal must read as one honest refusal, not a stutter.
- **Metric review** section: see below (filled at end of run).

## PROOF (before measurement)

scripts/test-dawnrefuse-20261015.js — ALL GREEN (run 2026-10-15, before
sweep spend):

- PART A (unit, stub Game, 15 checks): A0 RED — gate off (the pre-fix
  path) reproduces the spam exactly: 20 refusal beats in one competentEat
  call (20 guard iterations), 20 take attempts, pantry untouched by the
  refused takes. A1 — gate on: exactly 1 refusal beat, 0 take attempts
  (loop skipped — every take would be refused), pantry and kcal unchanged.
  A2 — same-day second call: 0 beats (per-dawn flag). A3 — next day:
  1 beat (flag resets at dawn). A4 — hands not blocked (inside): 0
  refusal beats, takes succeed, kcal rises (loop not gated). A5 — not
  hungry: silent. A6 — flag is per-Game (WeakMap): a fresh Game object
  gets its own refusal.
- PART B (live engine, REAL RED): constructed dawn (scholar on the haven
  tile, insideHaven=false, kcal 0.6*cap, pack empty, pantry stocked),
  competent.upkeep x3. Gate OFF: access='none', 60 refusal beats (the bug,
  live — RED). Gate ON: exactly 1 refusal (GREEN). Per-upkeep state
  hashes (day, health, kcal, roster, px, py, wave, pantry) identical both
  sides — the change is voice-only on live game state.
- PART C det-gate: 8 seeds x {leadcourt,belongseek} x {gate-off,gate-on},
  30d, FEASTSCALE_R13=1 — 16/16 byte-identical per-day trajectories, and
  the trigger path was exercised on every seed (gate-off beats 400-2200
  vs gate-on 5-28 — ~1/80th, one honest refusal per trigger-dawn).
- SMOKE=1 (proof): leadcourt s131 25d — 25 days, <=1 refusal beat/day,
  trigger ran.
- SMOKE=1 (sweep): leadcourt s131 180d both sides — armed max 1/dawn
  (25 beats), control 1960 beats; both 159d village-lost. Instruments
  honest.

Fix location: scripts/policies/competent.js — competentEat (the
`while (s.kcal < cap*0.95 && guard++ < 20)` pantry-fallback guard loop),
plus a module-level `_dawnRefusedDays` WeakMap and the `competentEat`
export (added for testability — additive, behavior-preserving).
DAWNREFUSE_GATE='0' restores the old path; default ON (the fix is a
strict improvement, lands permanently). Zero src/js changes: the
game-code take verbs (takeFromPantry/takeFromPantryBulk/donateToPantry
refusal paths) are untouched.

## RESULTS — sweep: 32 runs, 180d death-aware, FEASTSCALE_R13=1 both sides

Sweep JSON: evidence/2026-10-15/dawnrefuse-sweep.json. Per-seed:
evidence/2026-10-15/perseed-dawnrefuse/. Transcripts:
evidence/2026-10-15/dawnrefuse-transcripts/.

### Pooled (16 control / 16 armed)

| side | refBeats | refDawns | refMaxDawn | starveDeaths | median | national/16 | table | won | wave4 | wave5 |
|---|---|---|---|---|---|---|---|---|---|---|
| control | 20,720 | 264 | 100 | 2 | 124d | 12 | 15 | 0 | 16 | 9 |
| armed | 264 | 264 | 1 | 2 | 124d | 12 | 15 | 0 | 16 | 9 |

Death causes pooled are IDENTICAL both sides (combat 367, villager
combat 124, monster 86, sickness 36, expedition 21, contest 10,
"a wound that wouldn't close" 10, ambush 6, starvation 2, dehydration
1, the night 1, The Ugly Beast 1) — and every per-seed row matches
(days, end reason, wave reach, rank identical control vs armed on all
16 seed-pairs). The change is voice-only, proven at 180d scale on top
of the 16/16 30d det-gate.

VERDICT: **GO** — PRIMARY refusalMaxPerDawn armed=1 (GO<=2): true
(20,720 -> 264 beats, 264 trigger-dawns both sides, mean 78.5 -> 1.0
per dawn). Guardrails: starveDeaths 2=2 (<=ctrl+2), national 12=12,
table 15=15, no new death modes, won 0=0, wave4 16=16, wave5 9=9,
median 124=124d (report-only). The fix lands PERMANENTLY (default-on).

### SENSE-TEST (Steve's law — transcripts read, not just counts)

BEFORE (dawngo-control-leadcourt-s109.txt, d4): 80 identical beats —
"The pantry is in the hall. Your hands are not." x80, a stutter.

AFTER (dawnrefuse-armed-leadcourt-s131.txt, d4; dawnrefuse-armed-belongseek-s242.txt, d10):

    d4: The pantry is in the hall. Your hands are not.
    d4: ⚠ STARVING: health and energy falling. The spiral has started.
    d4: Village meal: +1020 kcal, +1L water from the communal pantry. (Half ration — they don't trust you yet.)

**Verdict**: the refusal now reads as one honest refusal per dawn — a
hungry scholar outside the hall, told once, then the village's own
hunger beats (STARVING, the half-ration meal) carry the morning. Not a
stutter. The voice is unchanged (same line, same engine voice the
policy invokes directly); only the count changed.

## What the village looked like (assessor's notes)

The village is the same half-ration courtship regime on both sides —
this run changed no village outcomes by design (every seed-pair
identical: same days, same end, same wave reach, same rank). The
scholar is hungry at dawn on the grounds outside the hall ~16.5
trigger-dawns per run (264/16), refuses once, and the day proceeds.
The blank this run fills: the refusal-spam finding from sim-dawngo-b —
the base policy's dawn pantry-fallback no longer stutters. Documented,
not changed (per the task brief): the guard loop retries takes in a
way that would consume nothing per iteration (each refused take is
voice + null, no turns/energy cost — verified by reading the
takeFromPantry/takeFromPantryBulk/donateToPantry refusal paths); the
spam was pure voice, so the fix is pure voice.

**Villager people-check (sampled)**: out of this run's scope beyond
the refusal voice — the sampled dawn episodes show the scholar's
refusal alongside named-villager hunger beats and the half-ration meal
line. Nothing robotic in the sample; the refusal reads as a person
being told no once, not a machine looping.

## Wall numbers (standing directive)

national 12/16 both; table 15/16 both; won 0/16 both; wave4 16/16
both; wave5 9/16 both; median survival 124d both. The scale wall
stands: national in most runs, the table reached but never converted
on this substrate, no wins — the FEASTSCALE_R13 courtship substrate
holds the lower rungs. Unchanged metrics confirm the voice-only
verdict.

TELEMETRY DEVIATION CHECK: coordinator step per the loop body;
per-seed evidence glob evidence/2026-10-15/perseed-dawnrefuse/ is in
place for it.

## Metric review (§14)

GO as pre-registered (primary 1 <= 2; all guardrails green; no
re-scoring). Notes for the NEXT run:
1. The armed side still voices the refusal on ~16.5 dawns/run — the
   finding asked for once per dawn, and that is what it got. A future
   arm could ask whether even once-per-dawn is too much (e.g. only
   when the scholar is newly hungry), but that would be a behavior
   question, not this fix.
2. The per-seed rows being EXACTLY identical (not just statistically)
   is the strongest possible voice-only proof — worth keeping this
   pattern (det-gate + full-sweep row comparison) for future voice
   fixes.

## Convergence state

**fixed / landed-ready** — the refusal-spam finding is fixed and the
fix lands permanently (default-on). Axis food-economy: the finding is
closed; the underlying inside/outside pantry wall (#328) remains open
design work (not this run's axis claim).

## Findings filed

- [fixed] 2026-10-15 — food/policy — BASE DAWN PANTRY-FALLBACK REFUSAL
  SPAM (loop B sim-dawnrefuse-b, run fleshout-b-20261015T1746Z, this
  evidence): competent.js competentEat's guard loop voiced "The pantry
  is in the hall. Your hands are not." ~40-100 times per dawn
  (20,720 beats / 264 trigger-dawns pooled control). Voice-only fix:
  when havenStoresAccess()==='none', voice the same line ONCE per dawn
  (per-dawn flag, WeakMap keyed on Game) and skip the loop — every take
  in it would be refused anyway (engine voices + null, no state
  change). Zero src/js changes. Proof: 15/15 PART A (RED 20 beats ->
  GREEN 1), PART B live REAL RED (60 -> 1), PART C det-gate 16/16
  byte-identical, 32-run sweep: 20,720 -> 264 beats (max 1/dawn),
  every wall metric identical both sides (national 12, table 15,
  wave4 16, wave5 9, median 124d, death causes byte-identical).
  Sense-test: the refusal reads as one honest refusal, not a stutter.
  DAWNREFUSE_GATE='0' restores the old path (default ON).
