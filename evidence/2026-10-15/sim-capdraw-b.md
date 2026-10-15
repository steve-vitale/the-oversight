# sim-capdraw-b — bank-cap ceil waste fix (loop B ARM 1, 2026-10-15)

Claims sim-findings #313 (BANK-CAP CEIL WASTE) and #315 (BANK-CAP WASTE IS SILENT),
filed by loop B sim-distrhalf (evidence/2026-10-15/sim-distrhalf-b.md, leadcourt s88 d36 probe).

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: the scholar's pantry draw ceils indivisible pieces (no fractionating) —
  want 2000 took a whole 5900-kcal slab; the 2400 bank cap banked only room, and
  (taken − room) kcal vanished SILENTLY behind a "+5900 kcal" beat, then the scholar
  STARVED that night. Make the draw respect the cap: what the body can't bank goes
  back in the bins as leftovers (stockPantry), the beat reports NET banked and names
  the return; ledgers (v.takes, v.lastPlayerMeal) record net.
- **PRIMARY**: scholar meal-served-still-starved days armed ≤ 0.80× control.
- **CO-PRIMARY**: silent cap-waste kcal armed ≤ 0.50× control (instrument the bug's own
  footprint first: excess = max(0, taken − room) per meal, silent iff no beat names it).
- **GUARDRAILS**: scholar hunger-days armed ≤ control; median survival ≥ control−10d;
  national ≥ control−2/16; no new death mode (n≥3).
- **MISS → revert per kill protocol** (fix deleted, no trace), evidence only.
- **Horizon**: 180d death-aware (dead villages stop +10d tail). **Seeds**: 11/22/33/44/55/66/77/88.
  **Policies**: leadcourt, belongseek (the courtship substrate — the bug's home).
  32 runs: 8 seeds × 2 policies × {control: pristine, armed: fix}, OWN control in the
  SAME sweep (patch-swap; CONTROL BASELINE DRIFT #247: never inherit).
- **Det-gate**: instrumented vs pristine byte-identical (PART C1); armed determinism (C2).
- **SMOKE**: SMOKE=1 instrument-honesty (meals captured, policy.daily fired, every
  excess>0 meal voiced iff armed).
- **Sense-test** (Steve's law): 2–3 meal/night transcripts around waste events — is the
  fiction now honest?
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists — stated here per
  the canon rule; mechanics read from src/js/game.js as-is, nothing invented.
  (Anti-fractionating is Steve's standing rule — the piece is still taken whole;
  the fix only changes what happens to the unbannable excess.)

## FILE CHANGED (reported before sims)

**src/js/game.js — villageMeal only** (the draw-amount computation lives in the verb;
policies do NOT compute it — verified: leadcourt.js/belongseek.js reference pantryKcal
for decisions only, never pantryDraw). Sibling arms: sim-midday owns
scripts/policies/middaymeal.js (no overlap); sim-rfconfirm changes no code.

## PROOF (before measurement)

scripts/test-capdraw-20261015.js — REAL RED via patch-swap
(`git diff` → ~/workspace/capdraw-fix.patch, `git checkout HEAD -- src/js/game.js`,
NEVER git stash — repo-global stack cross-contaminates):

- **RED (pristine, EXPECT=red)**: the s88 d36 replay — trust 45 (share 2000),
  room 2130, pantry holding ONE 5900-kcal slab. Gross taken 5900, room 2130,
  excess 3770. Scholar banks the 2400 cap; pantry 0 kcal left (3770 destroyed);
  beat: "Village meal: +5900 kcal, +1L water from the communal pantry." — the lie,
  verbatim; waste SILENT (voiced=false); ledger gross (lastPlayerMeal 5900).
  Bug reproduced exactly as the probe measured. (One fixture correction mid-proof:
  the joined-village B4 initially expected full shares but betrayal.js wraps
  villageMeal — trust<15 at a joined fire eats half shares (meal 1000). Fixture
  fixed to trust 20; B5 added for the half-share path.)
- **GREEN (fixed, EXPECT=green)**: same fixture — taken 5900, excess 3770;
  scholar banks the cap; pantry keeps 3770 as 2 'Meal leftovers' stacks
  (7×500 + 1×270, merged by stacksMatch); beat: "Village meal: +2130 kcal, +1L
  water from the communal pantry. (You couldn't hold the whole Smoked haunch —
  3,770 kcal went back in the bins as leftovers.)"; waste VOICED; ledger net
  (lastPlayerMeal 2130). No-regression fixtures green: exact-fit draw (no
  leftovers, beat shape unchanged), full belly ("You're full"), bare pantry
  ("No food in the pantry"), joined branch capped at room (meal 400, beat
  "+400 kcal"), betrayal half-share path capped at room.
- **Det-gate C1** (pristine): 60d × 8 seeds × {leadcourt, belongseek},
  instrumented vs pristine — 16/16 byte-identical (the instrument observes only).
- **Det-gate C2** (armed): armed vs armed rerun — 16/16 byte-identical.
- **SMOKE=1** (fixed): 25d leadcourt s11 — 26 meals captured, policy.daily fired
  25×, every excess>0 meal voiced (0 events on this seed — the waste needs
  slab-only pantries, which is itself signal about its frequency).

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSONs: evidence/2026-10-15/capdraw-control.json / capdraw-armed.json.
Per-seed: perseed-capdraw-control/ / perseed-capdraw-armed/. Transcripts:
capdraw-transcripts-control/ / capdraw-transcripts-armed/.

Control reproduces the distrhalf baseline exactly (scholar 1548 hunger-days,
msss 622, trust-throttled 551, empty-pantry 214, exile 142, away-wild 60) —
cross-validating the reused instrument.

### The bug's footprint (capdraw-lib: excess = max(0, taken − room) per meal)

| | control (pristine) | armed (fix) |
|---|---|---|
| cap-waste events | 251 | 283 |
| excess kcal total | 34,756 | 46,541 |
| SILENT kcal (no beat) | **34,756** | **0** |
| voiced + returned kcal | 0 | 46,541 |
| joined-branch waste | 0 | 0 |

Every wasted kcal on armed was named by the beat and returned to the pantry as
'Meal leftovers' (granular ≤500 pieces, merged by stacksMatch). The single
largest control event: leadcourt s33, 12,192 kcal silently destroyed over 108
events. The s88 d36 probe episode reproduced verbatim on control (1 event,
3500 kcal silent).

### GO verdict (binding, §14) — MISS

| metric | bar | result | verdict |
|---|---|---|---|
| PRIMARY scholar meal-served-still-starved | armed ≤ 0.80× control | 562 vs 622 (0.903×) | MISS |
| CO-PRIMARY silent cap-waste kcal | armed ≤ 0.50× control | 0 vs 34,756 | GO |
| GUARDRAIL scholar hunger-days | armed ≤ control | 1512 ≤ 1548 | GO |
| GUARDRAIL median survival | armed ≥ control−10d | 130d vs 146d | MISS |
| GUARDRAIL national | armed ≥ control−2/16 | 8/16 vs 8/16 | GO |
| GUARDRAIL no new death mode (n≥3) | none | none | GO |

**VERDICT: MISS → fix reverted per kill protocol** (src/js/game.js +
src/js/betrayal.js restored to HEAD; patch deleted; proof/sweep/instrument/
evidence kept). #313/#315 stay OPEN.

Death causes (pooled): control {combat 72, villager-combat 22, monster 18,
starvation 16, wounds 14, sickness 10, contest 7}; armed {combat 65, monster 21,
villager-combat 21, starvation 16, wounds 14, sickness 9, contest 4} — same
distribution, no new mode. The median dip is timing chaos, not a new killer:
the divergent runs (leadcourt s22 −17d, s44 −24d) died of mixed combat/wound/
monster causes on both sides; scholar starvation IMPROVED (−36 hunger-days).

### Wall numbers (standing directive)

national 8/16 both | table 1/16 both (leadcourt s66, 180d, wave 4, global) |
wins 0/16 both | wave4 4/16 both | wave5 0/16 control, 1/16 armed (leadcourt s33,
159d) | median survival 146d control / 130d armed | max 180d both.
The scale wall stands: national in half the runs, the table once, no wins —
identical on both sides.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — leadcourt s88 d36, control vs armed (the probe episode, replayed).**
Control: "⚠ STARVING" then "Village meal: +5900 kcal, +1L water from the
communal pantry." — the lie, verbatim as the probe found it. The scholar banks
2400; 3500 kcal never existed anywhere again. Armed, same seed, same night:
"⚠ STARVING" then "Village meal: +2400 kcal, +1L water from the communal
pantry. (You couldn't hold the whole Tribute grain from Thornfield — 3,500 kcal
went back in the bins as leftovers.)" The beat names the real piece (tribute
grain — a real pantry item with a real name), the net banked, and the return.
The scholar still starves — correctly: the STARVING warning fires at resolveDay
BEFORE the meal, on the day's deficit; the meal banks for tomorrow. The fiction
no longer claims the meal fixed tonight.

**Episode 2 — leadcourt s88 d38 armed.** Another tribute slab the next night:
"(You couldn't hold the whole Tribute grain from Stonebridge — 3,360 kcal went
back in the bins as leftovers.)" Two consecutive nights, two named pieces, two
honest returns. The pantry keeps ~6.9k kcal across the two nights that control
destroyed.

**Episode 3 — the crumb beats (armed, various).** "Village meal: +2400 kcal…
(You couldn't hold the whole Foraged food — 66 kcal went back in the bins as
leftovers.)" Small excesses (66–269 kcal) get the same honest treatment — the
voice doesn't only fire on slabs. Nothing robotic; the parenthetical reads like
a person noticing their own full belly.

Fiction verdict: the armed beats are honest and legible. The control beats lie
by omission. (The fix is reverted per §14 — the fiction fix is documented here
for the next run.)

## What the village looked like (assessor's notes)

Same villages as the distrhalf baseline — the courtship roads, the scholar the
hungriest mouth in Haven. The armed villages differ in exactly one way: their
pantries retain ~46.5k kcal across the suite that control silently destroyed —
returned as granular leftovers and re-eaten on later nights (armed waste events
283 vs control 251: the leftovers re-enter the draw and can ceil again, each
time honestly). The scholar's structural hunger is untouched by design: the bank
cap (2400) sits below an active day's burn (~4900) — that deficit is #314
(SCHOLAR DAILY DEFICIT, ARM 2's midday-meal lever), not this arm. This arm was
ever only about the waste and the lie: both fixed, both measured.

## Metric review (§14)

No mid-run re-scores were made; none proposed for this run. Notes for the NEXT run:
1. **The PRIMARY was mechanistically mismatched to the fix.** meal-served-still-
   starved counts scholar hunger-days after a served meal; the fix provably cannot
   change per-meal banked kcal (the cap clamps by design — resolveDay runs BEFORE
   the meal, so tonight's starvation is always yesterday's business). It moved
   0.903× via second-order effects only (net freeloader ledger → less trust
   erosion; richer pantries). The bug's own footprint — silent cap-waste kcal,
   the CO-PRIMARY — is the honest primary for any re-run of this fix: 0 vs
   34,756 kcal is decisive.
2. **The median guardrail (≥ control−10d) is fragile at n=16 against combat
   chaos.** The 16d dip rides on two runs' combat/wound/monster deaths (s22, s44);
   death-cause distributions are otherwise identical and scholar starvation
   improved. A re-run should use a larger seed budget or a less chaos-sensitive
   survival metric (e.g., scholar starvation-deaths, or median over 24+ seeds).
3. The co-primary's "silent" definition (no beat names the waste) held up —
   instrument-honesty green on both sides.

## Convergence state

**MISS per §14 — fix reverted, evidence kept.** Axis finding: the bank-cap ceil
waste is real, large (34.8k kcal / 251 events / 16 runs on control), and now
precisely instrumented (scripts/capdraw-lib-20261015.js); the honest-draw fix is
proved RED→GREEN with det-gates green, but its pre-registered primary
(msss ≤ 0.80×) and the median guardrail did not clear. sim-findings #313/#315
remain OPEN — the next arm should re-run with silent cap-waste kcal as the
primary (this run's co-primary) and a bigger seed budget for the survival
guardrail.
