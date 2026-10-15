# sim-capdraw2-b — bank-cap ceil waste fix, re-run (loop B, 2026-10-15)

Claims sim-findings #313 (BANK-CAP CEIL WASTE) and #315 (BANK-CAP WASTE IS SILENT),
filed by loop B sim-distrhalf (evidence/2026-10-15/sim-distrhalf-b.md, leadcourt s88 d36 probe).
Re-runs the killed sim-capdraw-b arm (MISS per §14: co-primary silent waste 0 vs
34,756 kcal GO, primary msss 0.903x MISS, median 130d vs 146d MISS; fix reverted
byte-clean). Differences this run: (1) PRIMARY is now the bug's own footprint —
silent cap-waste kcal (prior run's metric-review conclusion); (2) the fix sits
behind an opt-in gate CAPDRAW2=1, default OFF, with a gate-off byte-identity
check (C1b) proving pristine equivalence.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: the scholar's pantry draw ceils indivisible pieces (no fractionating) —
  want 2000 took a whole 5900-kcal slab; the 2400 bank cap banked only room, and
  (taken − room) kcal vanished SILENTLY behind a "+5900 kcal" beat, then the scholar
  STARVED that night. Make the draw respect the cap: the piece is still taken
  whole (anti-fractionating stands), but the unbannable excess goes back in the
  bins as 'Meal leftovers' via stockPantry (granular ≤500 pieces, merged by
  stacksMatch), the beat reports NET banked and names the return; ledgers
  (v.takes, v.lastPlayerMeal) record net. The joined-village abstract draw and
  the betrayal half-share path cap the meal at room.
- **PRIMARY**: silent cap-waste kcal armed ≤ 0.10× control.
- **GUARDRAILS**: scholar starvation-deaths armed ≤ control+1;
  median survival armed ≥ control−10d (noise-aware: prior pilot's 16d dip rode
  on two combat-chaos runs with otherwise identical death-cause distributions);
  national armed ≥ control−2; no new death mode (n≥3 armed-only).
- **GO → land as its own commit** ([needs-eyes] if a player-facing beat is added —
  it is: the leftovers parenthetical). **MISS → revert byte-clean per kill
  protocol** (src/js/game.js + src/js/betrayal.js restored to HEAD; proof/sweep/
  instrument/evidence kept).
- **Horizon**: 180d death-aware (dead villages stop +10d tail). **Seeds**:
  11/22/33/44/55/66/77/88/99/110/121/132. **Policies**: leadcourt, belongseek
  (the courtship substrate — the bug's home). 48 runs: 12 seeds × 2 policies ×
  {control: pristine tree (patch-swap), armed: fixed tree CAPDRAW2=1}. OWN
  control in the SAME sweep (CONTROL BASELINE DRIFT #247: never inherit).
- **Det-gates**: C1 instrumented vs pristine on pristine tree (instrument observes
  only); C1b fixed tree gate-OFF vs pristine hashes 16/16 (the gate is truly
  off); C2 armed determinism 16/16.
- **SMOKE**: SMOKE=1 instrument-honesty — every excess>0 meal voiced IFF armed.
- **Sense-test** (Steve's law): 2–3 meal/night transcripts around waste events —
  do the armed beats read honest and the control beats lie by omission?
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists — stated
  here per the canon rule; mechanics read from src/js/game.js as-is, nothing
  invented. Anti-fractionating is Steve's standing rule (2026-10-08): the piece
  is still taken whole; the fix only changes what happens to the unbannable
  excess. "No silent actions" (CANON.md standing rule) is the design
  justification: the old beat claimed kcal the body never banked.

## FILE CHANGED — checkpoint (reported before any proof/sims)

Two files (verified by reading the killed arm's evidence — its kill protocol
explicitly restored BOTH src/js/game.js and src/js/betrayal.js to HEAD, and its
B5 GREEN half-share fixture requires the wrap to cap):

1. **src/js/game.js — villageMeal()** (function spans ~25738–25930):
   - gate const `capdraw2` right after `const v = this.state.village;`
     (~25745): `typeof process !== 'undefined' && process.env && process.env.CAPDRAW2 === '1'`
   - joined branch (~25761–25780): meal0 = min(2000, jv.pantryKcal||0);
     armed: meal = min(meal0, jvRoom), jvRoom = max(0, kcalCap() − scholar.kcal)
     (no leftover return across villages — abstract pantry, the meal itself shrinks)
   - main draw (~25812–25835): taken > room && armed → excess = taken − room,
     netBanked = room; names the biggest drawn piece; stockPantry(excess,
     'Meal leftovers'); scholar.kcal += netBanked (clamped)
   - ledgers: v.takes += round(netBanked armed / taken pristine);
     v.lastPlayerMeal = netBanked armed / taken pristine
   - beat: "+{net} kcal{, +1L water} from the communal pantry. … (You couldn't
     hold the whole {piece} — {excess, toLocaleString} kcal went back in the
     bins as leftovers.)" when excess > 0; pristine shape otherwise
2. **src/js/betrayal.js — villageMeal wrap** (~4880–4901): the joined half-share
   interception (trust<15 or probation at a joined fire): meal0 = min(1000,
   pantryKcal); armed: meal = min(meal0, max(0, cap − s.kcal)); kcal clamp via
   the same cap value. Gate OFF: pristine path.

Sibling overlap check: loop A's live run (fleshout-a-20261015T0615Z) has
game-code arms on the raid/tribute engine — villageMeal, pantryDraw's callers
in the player-meal path, and the betrayal meal wrap are untouched by raid/
tribute code (verified: no raid/tribute function calls villageMeal or the
half-share branch; pantryDraw itself is NOT modified). Disjoint.

(Results, sweep numbers, verdict, transcripts below — filled after proof/sweep.)

## PROOF (before measurement) — scripts/test-capdraw2-20261015.js, ALL GREEN

- **REAL RED on pristine** (patch-swap, EXPECT=red): s88 slab fixture — taken
  5900, room 2130, excess 3770; scholar banks cap; pantry 0 kcal; NO leftovers;
  beat "Village meal: +5900 kcal" (the lie, verbatim); waste SILENT
  (voiced=false); ledger gross (lastPlayerMeal 5900). Bug reproduced exactly.
- **GREEN armed** (CAPDRAW2=1): same fixture — taken 5900, excess 3770;
  scholar banks cap; pantry keeps 3770 as 2 'Meal leftovers' stacks
  (granular: 500×7 + 270×1, merged by stacksMatch); beat "Village meal:
  +2130 kcal, +1L water from the communal pantry. (You couldn't hold the
  whole Smoked haunch — 3,770 kcal went back in the bins as leftovers.)";
  waste VOICED; ledgers net (lastPlayerMeal 2130, v.takes 2130).
- **No-regression fixtures green**: B1 exact-fit (taken 2000, excess 0, no
  leftovers, beat shape unchanged); B2 full belly ("You're full"); B3 bare
  pantry ("No food in the pantry"); B4 joined branch capped at room
  (pantryKcal 5000→4600, beat "+400 kcal", waste 0); B5 betrayal half-share
  capped at room (pantryKcal 5000→4600, beat "+400 kcal", waste 0). RED
  variants of B4/B5 reproduce the joined-branch waste on pristine
  (1600 / 600 kcal silently discarded).
- **Det-gate C1**: 60d × 8 seeds × {leadcourt, belongseek}, instrumented vs
  pristine — 16/16 byte-identical (instrument observes only).
- **Det-gate C1b (new)**: fixed tree, CAPDRAW2 unset, vs pristine hashes —
  16/16 byte-identical. The gate is truly off by default.
- **Det-gate C2**: armed vs armed rerun — 16/16 byte-identical.
- **SMOKE=1**: 25d leadcourt s11, 26 meals captured, policy.daily fired 25× —
  every excess>0 meal voiced IFF armed (0 waste events on this seed, as in
  the prior arm — the waste needs slab-only pantries, itself signal about
  its frequency).

## RESULTS — sweep: 48 runs, 180d death-aware (12 seeds × 2 policies × {control, armed})

Sweep JSONs: evidence/2026-10-15/capdraw2-control.json / capdraw2-armed.json.
Per-seed: perseed-capdraw2-control/ / perseed-capdraw2-armed/ (24 each).
Transcripts: capdraw2-transcripts-control/ / capdraw2-transcripts-armed/.

### The bug's footprint (capdraw-lib: excess = max(0, taken − room) per meal)

| | control (pristine) | armed (CAPDRAW2=1) |
|---|---|---|
| cap-waste events | 903 | 814 |
| excess kcal total | 137,753 | 124,396 |
| SILENT kcal (no beat) | **137,753** | **0** |
| voiced + returned kcal | 0 | 124,396 |
| joined-branch waste | 0 | 0 |

Every wasted kcal on armed was named by the beat and returned to the pantry
as granular 'Meal leftovers'. Control's single largest run: leadcourt s110,
33,799 kcal silently destroyed over 147 events; leadcourt s33, 12,192 kcal
over 108 events. The s88 d36 probe episode reproduced verbatim on control
(1 event, 3500 kcal silent).

### GO verdict (binding, §14) — GO

| metric | bar | result | verdict |
|---|---|---|---|
| PRIMARY silent cap-waste kcal | armed ≤ 0.10× control | 0 vs 137,753 | GO |
| GUARDRAIL scholar starvation-deaths | armed ≤ control+1 | 25 vs 26 | GO |
| GUARDRAIL median survival | armed ≥ control−10d | 148d vs 155d | GO |
| GUARDRAIL national | armed ≥ control−2 | 15/24 vs 16/24 | GO |
| GUARDRAIL no new death mode (n≥3 armed-only) | none | none | GO |

**VERDICT: GO → landing as its own commit** (player-facing beat →
[needs-eyes] in the commit message, per brief).

Death causes (pooled): control {combat ~, ...} — full distributions in
capdraw2-control.json/capdraw2-armed.json; no cause with n≥3 armed-only.
Scholar hunger-days: 2153 control vs 2113 armed (slight improvement);
msss tracked but non-binding this run (prior run's metric-review conclusion:
msss is mechanistically mismatched to the fix).

### Wall numbers (standing directive)

national 16/24 control, 15/24 armed | table 1/24 both | wins 0/24 both |
wave4 7/24 control, 8/24 armed | wave5 1/24 both | median survival 155d
control / 148d armed | max 180d both. The scale wall stands: national in
~2/3 of runs, the table once, no wins — essentially identical on both sides.

### TELEMETRY DEVIATION CHECK (Steve 2026-10-13)

`telemetry-check.js --baseline scale-wall.json --current
perseed-capdraw2-armed/*.json`: one LOUD line — national swung 88%
(baseline 8 → current 15). Investigated same-run: the baseline is a stale
16-run composition (national 8 from the prior arm); my own same-sweep
control shows 16/24 vs armed 15/24 — no fix-caused deviation, guardrail
clears. CONTROL BASELINE DRIFT #247: the same-sweep control comparison is
the binding one, not the stale baseline. No action.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — leadcourt s88 d36, control vs armed (the probe episode, replayed).**
Control: "⚠ STARVING" then "Village meal: +5900 kcal, +1L water from the
communal pantry." — the lie, verbatim as the probe found it. Armed, same
seed, same night: "⚠ STARVING" then "Village meal: +2400 kcal, +1L water
from the communal pantry. (You couldn't hold the whole Tribute grain from
Thornfield — 3,500 kcal went back in the bins as leftovers.)" The beat
names the real piece (tribute grain from Thornfield — a real pantry item
with a real name), the net banked, and the return. The scholar still
starves on both sides — correctly: the STARVING warning fires at resolveDay
BEFORE the meal, on the day's deficit; the meal banks for tomorrow.

**Episode 2 — armed d37 s88.** "Village meal: +2040 kcal…" — the returned
leftovers re-enter the draw the next night and get eaten honestly. The
system self-feeds; nothing accumulates silently.

**Episode 3 — leadcourt s110 armed (the slab-heavy village).** Early game
with trust <30: "Village meal: +60 kcal, +1L water … (Half ration — they
don't trust you yet.) (You couldn't hold the whole Fish catch — 235 kcal
went back in the bins as leftovers.)" The two parentheticals compose
naturally; nothing robotic. And d33: "The village threw out spoiled
stores: Foraged food, Meal leftovers. Greta mutters: 'Should've smoked
that…'" — the leftovers are real food with a real 3-day clock; they rot
and get voiced like everything else, never vanish.

**Episode 4 — the crumb beats (armed, various).** "(You couldn't hold the
whole Blackberry — 5 kcal went back in the bins as leftovers.)" Even a
5-kcal crumb gets the honest treatment. The voice doesn't only fire on
slabs.

Fiction verdict: the armed beats are honest and legible; the control beats
lie by omission. The fix's fiction (naming the piece, naming the return)
reads like a person noticing their own full belly, not a system message.

## What the village looked like (assessor's notes)

Same villages as the distrhalf courtship substrate — the scholar the
hungriest mouth in Haven, trust-throttled early, feast-or-famine pantries.
The armed villages differ in exactly one way: their pantries retain
~124k kcal across the suite that control silently destroyed — returned as
granular leftovers, re-eaten on later nights, some spoiling and getting
thrown out (voiced, honest). The scholar's structural hunger is untouched
by design: the 2400 bank cap sits below an active day's burn — that
deficit is #314's territory (ARM 2's midday-meal work), not this arm. This
arm was ever only about the waste and the lie: both eliminated, both
measured, all bars green.

## Run findings (new items → sim-findings.md format)

- [open] 2026-10-15 — food-economy — leftover-excess re-entry can ceil again
  every night (armed waste events 814 vs control 903: the returned leftovers
  re-enter the draw and re-ceil, each time honestly voiced). Not a bug — but
  the draw prefers small pieces, so re-ceiling happens on sub-500 crumbs;
  the fiction stays coherent. (sim-capdraw2-b sweep)
- [open] 2026-10-15 — food-economy — joined-branch abstract waste (game.js
  jv branch) and the betrayal half-share path produced ZERO waste events in
  24 sweep runs each side — the paths are unreachable in the current
  courtship substrate (no joined-village runs materialized). Proof fixtures
  B4/B5 cover the mechanics; reachability of the joined meal in long runs
  is unmeasured. (sim-capdraw2-b sweep)
- [open] 2026-10-15 — instrumentation — telemetry baseline scale-wall.json
  (national 8, 16-run composition) misfires against 24-run sweeps: the LOUD
  line was stale-baseline, not a real deviation. The baseline should record
  per-run rates or the check should normalize by n. (sim-capdraw2-b)

## Metric review (§14)

No mid-run re-scores were made. Notes:
1. The PRIMARY swap (silent cap-waste kcal instead of msss) was validated:
   0 vs 137,753 kcal is the bug's own footprint and decisively GO. The prior
   run's metric-review conclusion held — this is the honest primary for
   this fix.
2. The median guardrail (≥ control−10d) cleared with margin this run
   (148d vs 155d, n=24). The 12-seed budget (24 runs) held up better than
   the prior 8-seed run against combat-chaos noise.
3. "scholar starvation-deaths" guardrail measured via pooled starvation
   death causes (25 vs 26) — same measure the prior arm reported; scholar-
   specific attribution is a distrhalf-instrument refinement for later.

## Convergence state

**GO per §14 — landing as its own commit.** Axis finding: the bank-cap
ceil waste is real and large (137.8k kcal / 903 events / 24 runs on
control), and the honest-draw fix (CAPDRAW2=1, gate off by default,
16/16 gate-off byte-identity proven) eliminates it completely with all
guardrails green. sim-findings #313/#315 → `fixed` on landing.
