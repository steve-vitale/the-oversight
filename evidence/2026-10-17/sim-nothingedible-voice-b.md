# sim-nothingedible-voice-b — ENGINE-side nothing-edible voice gate (loop B, run fleshout-b-20261017T1940Z, axis food-economy)

Fills finding #473 (evidence/2026-10-17/sim-feastvoice-b.md, instrument
scripts/census-feastvoice-b.js): the scholar pack-eat flow's
"Nothing edible. (<inventory list> — not food yet: <prep hint>.)" beat
(src/js/game.js:25256) fires byte-identical up to 105 times in a single day
(belongfeast-s6101 d143; 272 beats that run; also leadfeast-s6104 d-max 63,
belongfeast-s6103 d-max 83). Same guard-loop spam class as #363
(sim-dawnrefuse-b fixed the pantry-fallback variant policy-side with a
per-dawn flag).

RELATIONSHIP TO THE PRIOR ARM (sim-nothingedible-b, run
fleshout-b-20261017T1235Z, commit 37fb259e): that arm fixed #473
POLICY-side in scripts/policies/competent.js (`packEatOnce`, default ON,
NOTHINGEDIBLE_GATE kill switch) — it gates the re-attempt, so the competent
bot policy no longer re-calls Game.eat(). This arm is the ENGINE-side
complement in src/js/game.js: the beat itself is gated to once per day, so
the fix protects EVERY caller (human player hammering pack-eat, other
policies, debug flows) — not just the competent policy. Different locus,
different file, no file conflict with the sibling arm. The policy-side gate
is a behavior optimization (skips state-neutral re-attempts); the
engine-side gate is narration robustness (the voice never repeats within a
day, whatever drives it).

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- PRIMARY (duplicate-beat reduction): on the census seeds where the bug was
  observed, the count of DUPLICATE "Nothing edible." beats — beats beyond
  the first per day per (seed, policy) — must drop ≥90% armed vs control.
  Secondary spec checks: armed max/day ≤ 1 on every (seed, policy), and the
  armed side's first beat on each nothing-day is byte-identical to the
  control side's first beat that day (first-voice content preserved — the
  informational content is never lost, only the repeats are).
- GUARDRAILS: (a) det-gate — per-day game-state trajectories byte-identical
  control vs armed (the dayHash from test-nothingedible-20261017.js: scholar
  day/health/kcal, roster size, map px/py, unlockedWave, pantry kcal; the
  narration stream — this.log content — is the ONLY allowed difference);
  (b) wall metrics — national ≥ ctrl−2, table ≥ ctrl−2, wins/starveDeaths
  within ±2, no new death mode with n≥3; wave-4/5 and median survival
  REPORT-ONLY (the corpus caps at wave 3 on both sides, pre-seat substrate).
- GO → the engine gate lands PERMANENTLY (voice-only narration precedent).
  Player-facing narration → commit message carries [needs-eyes].
- NO-GO → revert the game.js edit zero-trace; commit evidence + instruments
  as KILLED AT PILOT.
- Horizon: 180d death-aware (dead villages stop, +10d engine tail max) — the
  spam days are deep-run starvation days (d143+), so a short horizon can't
  see them.
- Seeds: 6101–6108 × {leadfeast, belongfeast} (the exact corpus the census
  filed the finding on) — 16 pairs = 32 runs. No pilot/confirm split: the
  metric IS the verdict on this fixed corpus (same as the prior arm).
- Policies: competent-family (leadfeast, belongfeast) with FEASTSCALE_R13=1,
  SEATDRIVE=0 EXPLICIT both sides (the substrate where the spam was found).
- Control substrate: NOTHINGEDIBLE_GATE='0' (policy-side gate OFF) BOTH
  sides + NOTHINGEDIBLE_VOICEGATE='0' on control — this restores the exact
  pre-fix world where the census observed the spam. Armed: policy-side gate
  OFF + engine voice gate ON — this isolates the ENGINE gate's effect.

## The lever (engine-side, voice-only)

In `Game.eat()` (src/js/game.js): the `nothingEdible` branch voices the full
"Nothing edible. (<list> — not food yet: <hint>.)" beat only when it has not
already been voiced today (`this._nothingEdibleDay !== scholar.day`); repeats
within the same day make no say() call at all (no fallback line — a repeat
would be byte-identical spam; the day's telling stands). NOTHINGEDIBLE_VOICEGATE='0'
disables (testing only; in the browser the gate is always on). The day flag
lives off-state on the Game object — saves and state fingerprints untouched:
voice only, never behavior. Scope is the pack-eat "Nothing edible." beat
only — the eatOne "Nothing edible there." beat, the "You are full enough."
beat, and the "Nothing to eat." beat are untouched.

Canon note: no dedicated canon doc covers this beat (docs/SYSTEM-VOICE.md is
the System narrator's TTS voice bible — a different surface; this beat is
the scholar's own narration). The design precedent is the #363/#473
guard-loop spam class and Steve's "No silent actions" rule — preserved by
voicing the first attempt's outcome in full every day; the suppressed
repeats are attempts the player already saw answered.

## Before / after (32 runs: 8 seeds × 2 policies × {control,armed}, 180d death-aware)

Control = policy-side gate OFF + engine gate OFF (the exact pre-fix world);
armed = policy-side gate OFF + engine gate ON (isolates the engine gate).
FEASTSCALE_R13=1, SEATDRIVE=0 both sides.

| seed/policy | control beats (max/day) | armed beats (max/day) |
|---|---|---|
| leadfeast s6101 | 2 (1) | 2 (1) |
| leadfeast s6102 | 5 (1) | 5 (1) |
| leadfeast s6103 | 5 (3) | 3 (1) |
| leadfeast s6104 | 130 (63) | 5 (1) |
| leadfeast s6105 | 0 (0) | 0 (0) |
| leadfeast s6106 | 0 (0) | 0 (0) |
| leadfeast s6107 | 16 (5) | 5 (1) |
| leadfeast s6108 | 0 (0) | 0 (0) |
| belongfeast s6101 | 272 (105) | 20 (1) |
| belongfeast s6102 | 222 (84) | 13 (1) |
| belongfeast s6103 | 215 (83) | 5 (1) |
| belongfeast s6104 | 2 (2) | 1 (1) |
| belongfeast s6105 | 0 (0) | 0 (0) |
| belongfeast s6106 | 2 (1) | 2 (1) |
| belongfeast s6107 | 16 (5) | 5 (1) |
| belongfeast s6108 | 11 (4) | 5 (1) |

Pooled: control 898 beats over 71 starvation days, max 105/day → armed
71 beats over 71 starvation days, max 1/day. Duplicates (beats beyond the
first per day per pair): 827 → 0 = **100.0% reduction** (GO ≥ 90%).

The three census headline seeds reproduce on this run's control and are
crushed by the engine gate alone: belongfeast-s6101 272/105d-max → 20/1;
belongfeast-s6103 215/83 → 5/1; leadfeast-s6104 130/63 → 5/1.

Per-pair det-gate: 16/16 byte-identical per-day state trajectories
(detGate=SAME on every pair). First-voice: byte-identical on every shared
nothing-day on all 16 pairs (20d on the worst seed).

Wall metrics (identical both sides — the gate moves no game state):
national 12/16 = 12/16, table 13/13, won 0 = 0, exiled 0 = 0, wave4 0 = 0,
wave5 0 = 0, starvation deaths 7 = 7, median survival 147d = 147d, and the
pooled death-cause histogram is byte-identical (combat 462, villager combat
128, monster 81, expedition 35, contest 13, starvation 7, wound 9, ...).

Proof (scripts/test-nothingedible-voice-b.js): PART A 9/9 — live engine
constructed starvation state: gate-off voices 5/5 attempts (RED), gate-on
voices exactly 1 (GREEN) with the one beat byte-identical to the control's
first beat (A3); state hashes identical (A4); new day re-arms (A5); per-Game
flags (A6); edible/full/empty-pack beats never gated (A7–A9). PART B
det-gate 16/16 byte-identical trajectories on 8 seeds × 2 policies × 60d,
trigger exercised on 6/16 seeds (the starvation seeds; the other 10 have no
starvation day in 60d, gate inert there by construction).

Sweep artifacts: evidence/2026-10-17/nevoice-sweep.json (pooled verdict),
evidence/2026-10-17/nevoice-sweep.log (per-pair lines),
evidence/2026-10-17/perseed-nevoice-voice-b/ (per-run JSON),
evidence/2026-10-17/transcripts-nevoice-voice-b/ (beat transcripts for the
sense-test).

## Reachability verdict

n/a — voice-only arm; no content gates touched. Wall numbers on this corpus
(identical both sides): national 12/16, table 13/16, wins 0/16, wave-4 0/16,
wave-5 0/16, exiled 0/16, median survival 147d. The wave-4/5 zeros are a
corpus property (this seed set caps at wave 3, pre-seat substrate), not an
arm effect — both sides agree exactly.

## Village assessment (plain words)

The corpus shows the same two kinds of villages the prior arm described.
The thriving kind: belongfeast-s6101 survived the full 182 days, reached
global rank, sat at the table — and its lean stretch (d124–143, the spam
window) is exactly where the engine gate does its work: 20 starvation days,
each now voiced once instead of 105 times at the worst. Its dead are
overwhelmingly fighters (combat 462 pooled / 16 runs): this is a village
that bleeds in fights and keeps going, not one that starves — 7 starvation
deaths in 16 runs. The fragile kind: leadfeast-s6106 died at d51 (wave 2,
regional); belongfeast-s6103 lost the village at d111 (regional). Same
policies, same substrate — the difference is the fights, not the food, and
the food-voice gate doesn't touch the fights (the death histogram is
byte-identical both sides).

## Sense-test (SENSE-TESTING LAW — transcripts read)

Control d143 (belongfeast-s6101): the same sentence 105 times —
"Nothing edible. (White Oak Acorns (in shell), Hickory Nuts (in shell) —
not food yet: Needs shelling — crack and pick the nutmeats. (Shell
action).)" The FIRST hearing is honest and useful: it names exactly what's
in the pack and exactly what would fix it. Hearings 2–105 add nothing — a
wall of identical text on a starvation day. Armed: the same beat once that
day. **PASS** — one telling reads as a person taking stock; 105 readings
reads as a stuck record. The gate keeps the telling and loses the record.

The day-gate also stays honest across days: belongfeast-s6103 armed shows
d51 naming a POISON risk ("Big-Eyes (carcass) ... — not food yet: ☠️
POISON. Tested, the hard way. Never eat this.."), d52 naming the changed
inventory with the identify hint, d108+ naming the squirrel with the
gutting hint. Each day's single telling is the honest CURRENT inventory —
the gate never serves a stale telling, and the pack-change re-arms
naturally at the next dawn.

The suppressed repeats leave no hole: nothing else on a starvation day
answers the "what's in my pack" question, and the day's one telling is the
answer. No silent-action violation — the action's outcome was voiced, in
full, today.

## Blanks filled

- Finding #473 fixed ENGINE-side: per-day voice gate on the pack-eat
  "Nothing edible." beat in `Game.eat()` (src/js/game.js). First occurrence
  per day fires in full; repeats within the same day are suppressed (no
  fallback line). `NOTHINGEDIBLE_VOICEGATE='0'` disables (testing only; in
  the browser the gate is always on). The day flag lives off-state on the
  Game object — saves and state fingerprints untouched: voice only, never
  behavior. Scope is the pack-eat beat only — eatOne's "Nothing edible
  there.", "You are full enough.", and "Nothing to eat." beats are
  untouched (proof A7–A9). This complements the prior arm's policy-side
  `packEatOnce` (37fb259e): that gates the re-attempt for the competent bot
  policy; this gates the voice for EVERY caller — human players hammering
  pack-eat, other policies, debug flows. Player-facing narration → the
  commit carries [needs-eyes].

## Blanks documented (new findings, not chased)

- None new on this arm. The behavior blank the prior arm filed (competent
  policy never shells in-shell nuts or runs camp food processing) is
  visible again in these transcripts (d143's honest telling names the
  shelling action; the scholar still doesn't do it) — already filed, not
  re-filed.

## Metric review

- Primary (duplicate-beat reduction ≥90%): MET — 827 → 0 = 100.0%.
- Spec (armed max/day ≤ 1): MET — 1 on every pair.
- Spec (first-voice byte-identical): MET — every shared nothing-day, all
  16 pairs.
- Guardrail (det-gate byte-identical trajectories): MET — 16/16 SAME on the
  180d sweep + 16/16 in the 60d proof.
- Guardrail (wall metrics): MET — national/table/won/exiled/wave/median/
  starvation-deaths identical both sides; pooled death histogram
  byte-identical.
- Substrate note (not a metric miss): this run's control absolute (898
  beats) differs from the prior arm's control (693) on the same seed set —
  the tree is hot and sibling arms landed between the two runs. The
  before/after comparison is internally valid (identical master, identical
  seeds, own control in the same sweep); the census headline shape
  reproduces (272/105d-max on belongfeast-s6101 both times).
- check.js --quick: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (monster sprite SVGs: dustboar,
  sunback, sweeps_week, cliffhanger), pre-existing on this hot tree and
  unrelated to this arm (narration + scripts/evidence only). Matches the
  prior arm's baseline exactly.

## Convergence

Arm converged: finding #473's engine-side complement is proven (proof +
sweep green) and lands permanently. The nothing-edible guard-loop spam
class (#363 dawnrefuse policy-side, #473 nothing-edible policy-side AND
engine-side) is now gated at both loci: the policy skips state-neutral
re-attempts, the engine never voices the beat twice in one day no matter
who calls. Axis (food-economy) state per the convergence tracker.
