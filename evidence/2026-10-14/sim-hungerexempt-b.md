# HUNGER-EXEMPT THROTTLE — pilot (fleshout-b ARM: thinner-buffer-cost)
2026-10-14 (run 2026-10-14T06:00Z) | axis: food-economy | arm: hunger-exempt-throttle

## Context
The landed prodthrottle lever (afb736e6) cut village-scale fresh-rot −74%
(pilot) / −41.1% (confirm) but its §10-12 confirm was NO-GO at guardrails:
median survival −14d, starvation deaths 26→38 (evidence/2026-10-14/sim-throttleconfirm-b.md).
The confirm's metric review proposed the pilot's named thinner-buffer-cost
arm: "exempt redirect while any villager is actively hungry" — this arm.
Signal note (engine-honest, not a proxy): the exemption gates on
progState().hungryStreak — the anyStarving signal out of villageEats (some
villager ate under 60% of ration-adjusted need, not fasting, not on voted
half-rations; the same signal that fires the hunger-winter crisis). The
throttlefeast arm's logged signal (v.hungryDays, the empty-pantry clock) is
MUTUALLY EXCLUSIVE with the throttle — an empty pantry never engages — so a
hungryDays gate would be a dead branch; it cannot serve as the exemption.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sweep spend
- Question: does exempting the prod-throttle redirect while any villager is
  actively hungry shrink the confirm's survival cost (starvation) without
  giving back the lever's rot effect?
- Lever: HUNGER-EXEMPT THROTTLE as landed in this run's commit — game-code
  change in src/js/game.js resolveOneAssignment: when the throttle would
  fire but progState().hungryStreak > 0, production continues (no redirect,
  no rotation advance) and the beat narrates the decision
  ("🍲 ...but someone went to bed hungry... the hungry eat first.").
  HUNGEREXEMPT=0 disables (instrumentation-side control; default ON).
- CONTROL: landed throttle on current tip (HUNGEREXEMPT=0 — exemption
  disabled). ARMED: hunger-exempt throttle (HUNGEREXEMPT unset — exemption
  enabled). Same code tree, identical seeds, env-var only.
- PRIMARY: starvation deaths per 100 villager-days (death-cause 'starvation'
  over summed daily roster length from samples.pop), armed vs control on
  identical seeds. GO = armed ≤ 0.85 × control (the survival cost shrinks).
- GUARDRAILS:
  - absolute fresh-rot kcal: armed ≤ 1.33 × control (the lever must still
    move rot — the exemption must not gut the effect)
  - national: armed ≥ control − 2
  - median survival: armed_median ≥ control_median − 10d (ONE-SIDED:
    improvement passes)
  - hungryDays: armed ≤ control + max(5, 10% of control) (confirm convention)
- Horizon: 180d death-aware (dead villages stop, 10d tail — harnessstop fix);
  180d is the pacing-law max.
- Seeds: 11/22/33/44/55/66/77/88 × leadcourt/belongseek, IDENTICAL seeds
  both sides (16 runs/side). This 16-run pilot IS the gate per
  pre-registration (pilot, no confirm spend this run).
- Instrument-honesty: SMOKE=1 gate before any sweep spend; named-export
  policy unwrap (no Object.assign({}, require(...)) — #69); per-side shape
  assertion (proof test §3: HUNGEREXEMPT=0 redirects, armed exempts) before
  each side's runs; sweep logs to evidence/2026-10-14/ (never /tmp).
- A miss is NO-GO — never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review", revisions apply to the NEXT run.

## Proof (scripts/test-hungerexempt-20261014.js)
RED→GREEN verified via the patch-file cycle (no git stash on the hot tree):
- RED (pristine): exemption inert — redirect fires into hungryStreak>0
  villages; rotation advances; no exemption ledger. ALL GREEN.
- GREEN (armed): production continues on hungryStreak>0 (task not
  redirected, exemption counted, decision narrated honestly, redirect beat
  silent, rotation untouched); landed redirect preserved when hungryStreak=0;
  HUNGEREXEMPT=0 restores landed behavior; empty-pantry mutual exclusivity
  asserted. ALL GREEN (19/19).

## Instrument-honesty gate
- `SMOKE=1 node scripts/measure-hungerexempt-20261014.js`: ALL GREEN (8/8) —
  both policies unwrap to a real `daily`, the harness invokes it
  (meanCalls/day 3.8), and ≥1 policy-origin deliberate act fires
  (policyActs=2379 both policies). The suite cannot run policy-less.
- Per-side shape assertion (scripts/test-hungerexempt-20261014.js, side-aware):
  - CONTROL (HUNGEREXEMPT=0): ALL GREEN — the exemption is provably
    DISABLED on the control side (redirect fires into hungryStreak>0,
    no exemption ledger, landed rotation advance). exempt=0 on all 16
    control runs in the sweep — the gate held.
  - ARMED (exemption enabled): ALL GREEN — exemption fires, production
    continues, decision narrated, rotation untouched.
- Seed-identity check: 16 vs 16 per-seed files, identical policy:seed sets,
  all 8 pilot seeds × both policies on both sides. GREEN.

## Results

| metric | control (landed, HUNGEREXEMPT=0) | armed (hunger-exempt) | delta | pre-reg |
|---|---|---|---|---|
| starve deaths / 100 villager-days (PRIMARY) | 1.241 (17/1370vd) | 1.853 (23/1241vd) | **+49.3%** | GO ≤1.055 ✗ |
| starvation deaths | 17 | 23 | +6 | — |
| villager-days | 1370 | 1241 | −129 | — |
| fresh-rot kcal (guardrail) | 2159.8k | 2637.9k | +22% | ≤2872.5k ✓ |
| preserved-rot kcal | 184.6k | 168.0k | −9% | — |
| median survival | 121d | 108d | −13d | ≥111d ✗ |
| max survival | 180d | 180d | 0 | — |
| national | 11/16 | 8/16 | −3 | ≥9 ✗ |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| exiled | 0 | 1 | +1 (tiny base) | report only |
| max wave reach | 4 | 4 | 0 | — |
| wave-4 reach | 4 | 3 | −1 | — |
| wave-5 reach | 0 | 0 | — | — |
| hungryDays | 29 | 36 | +7 | ≤34 ✗ |
| throttle redirects | 3933 | 2989 | −944 (exempted) | — |
| throttle exemptions | 0 | 686 | mechanism fires | — |
| tribute (belongseek) | 1082.3k | 787.9k | −294k | guardrail-only |

Per-seed (days / starve deaths / sp100 | redirects | exemptions):
- lead-11: 121/1/1.05 | 38/4/14.29 | 484 | 55/47
- lead-22: 158/2/1.91 | 180/2/1.56 | 501 | 393/4
- lead-33: 159/0/0 | 32/1/4.00 | 326 | 51/13
- lead-44: 96/1/1.27 | 92/0/0 | 114 | 107/7
- lead-55: 115/0/0 | 130/1/1.10 | 218 | 166/11
- lead-66: 95/1/1.92 | 53/0/0 | 107 | 28/49
- lead-77: 79/0/0 | 166/0/0 | 320 | 170/183
- lead-88: 52/2/4.76 | 108/1/1.27 | 146 | 122/46
- belo-11: 146/1/1.05 | 146/0/0 | 290 | 200/50
- belo-22: 180/0/0 | 68/4/8.33 | 445 | 199/9
- belo-33: 33/5/17.24 | 38/6/23.08 | 65 | 61/5
- belo-44: 180/0/0 | 180/0/0 | 196 | 316/4
- belo-55: 180/0/0 | 104/3/4.48 | 343 | 78/4
- belo-66: 137/1/1.02 | 71/0/0 | 125 | 32/53
- belo-77: 47/2/5.26 | 180/0/0 | 154 | 820/120
- belo-88: 29/1/5.00 | 134/1/0.98 | 99 | 191/81

Per-seed JSON: evidence/2026-10-14/hungerexempt-control-perseed/*.json,
hungerexempt-armed-perseed/*.json. Aggregates: hungerexempt-control.json,
hungerexempt-armed.json. Sweep logs: hungerexempt-control.log,
hungerexempt-armed.log.

## Verdict: NO-GO (killed-at-pilot)
The PRIMARY missed by a wide margin in the wrong direction: starvation
deaths per 100 villager-days 1.241 → 1.853 (+49.3%; GO needed ≤1.055, a
15% improvement). Both policies regressed (leadcourt 1.10→1.54, belongseek
1.37→2.13), so it is not one seed driving the aggregate. Three of four
guardrails also missed (national 11→8, median 121→108d, hungryDays 29→36);
only the rot guardrail held (2637.9k ≤ 2872.5k — the lever's rot effect
survives the exemption, but the survival cost got worse, not better).
Per §14 the pre-registered primary binds: a miss is NO-GO, never re-scored
mid-run. The game-code change is REVERTED per kill protocol (killed arms
leave no trace); instruments (proof/sweep/sample scripts) and this evidence
are retained.

Candidate mechanism (hypothesis, documented not proven): when hungryStreak>0
AND the pantry holds >4 fresh days, the bind is DISTRIBUTION, not total
food — someone is under-eating while the shelves are full (trust-gated
sharing, best-fit draws). The exemption keeps food duties producing into an
already-full pantry while forfeiting the redirected wood/water/stone work —
which the lever's design notes carries "its own haul + trust". Less trust
→ less sharing → more under-eating → higher hungryStreak → more exemptions:
a feedback loop. Consistent with the armed side's higher starvation rate
despite more food production, and with chronic exemption firing on long-lived
seeds (lead-77: 183 exemptions, starve=0 both sides — the village under-ate
for months without dying of it). The exemption buys days on some seeds
(lead-77 79→166d, belo-77 47→180d) but not bellies.

## Wall numbers (scale wall — report every run)
Control: national 11/16, table 0, wins 0, exiled 0, wave4 4/16, wave5 0/16,
median/max survival 121/180d, hungryDays 29.
Armed: national 8/16, table 0, wins 0, exiled 1, wave4 3/16, wave5 0/16,
median/max survival 108/180d, hungryDays 36.
The mortality wall still rules: 13/16 control and 13/16 armed runs end
village-lost/village-dead (3 survived to 180 both sides). Nobody reached
the table or won on either side. The arm did not move the wall — it moved
the wrong direction on the axis.

## Village assessment (plain words)
These are villages that build real surplus — the throttle fired 3,933 times
on the control side (8,636 on the confirm's fresh seeds; the pilot seeds are
leaner). The exemption is not a dead letter: it fired 686 times, almost
always into villages that were already in trouble — the honest signal works
as designed (hungryStreak>0 = someone genuinely under-ate yesterday).

What the arm does to a village: on a hungry day, the pantry-check beat
flips from 🌿 to 🥄 — instead of leaving the harvest standing, the villager
keeps working it "because the hungry eat first." The pantry keeps growing
past 4 fresh days while someone goes to bed hungry anyway. The villages that
took the exemption hardest (lead-11: 47 exemptions, died d38 with 4
starvations vs control d121/1; belo-22: control survived 180d, armed died
d68 with 4 starvations) look like villages that chose to keep hauling food
into a full pantry instead of doing the trust-building work that would
have gotten the food eaten. The villages that did well on the armed side
(lead-77, belo-77, belo-88) lived longer — but their starvation counts
didn't fall. The arm's theory ("thinner buffer starves people") was wrong
about the mechanism: the confirm's starvation wasn't a buffer problem, it
was a sharing problem, and this arm fed the buffer while starving the
sharing.

## Sense-test (redirect/exemption narration — read, judge meaning and honesty)
Sampled leadcourt seed 77 armed (183 exemptions, 227 redirects on the sweep;
sampler run: 195 exemption beats, 227 redirect beats — the first sampler
count of 299 was contaminated by unrelated 🍲 cook beats, corrected).
- The exemption beat reads as an honest village decision, not a token
  reroute: "🥄 Nino checks the pantry before heading out — the shelves are
  full, ~17 days of fresh on hand… but someone went to bed hungry, and a
  full pantry means nothing while bellies are empty. Nino keeps working
  the fish nets — the hungry eat first." The pantry state is honest (the
  day-count matches the >4 gate), the reason is named (someone hungry), the
  action is legible (keeps working the fish nets). Exemptions vary by task
  (forage/harvest/fish nets all observed).
- The mirror beat (redirect) keeps its tone: "🌿 …leaves the fish nets
  standing and turns to the water run instead. The pantry can't take more;
  the wild will keep." The two beats are visually and verbally distinct —
  the player can tell which decision the village made.
- Emoji audit (Steve's no-doubling law): the beat first shipped as 🍲 —
  COLLISION with the cook-duty beats (cooked meals, recipe learning, cook
  role icon). Changed to 🥣 — COLLISION with the beggar beat ("walks into
  your firelight alone, thinner than you remember. 'Our jars are empty'").
  Final: 🥄 (spoon) — unused anywhere in src/js, reads as feeding, pairs
  with "the hungry eat first". Verified 0 other uses.
- Cadence: one beat per resolved duty while exempt (same as the redirect's
  4×/day cadence). On chronic-hunger seeds ~1–2/day — not spammy relative
  to the redirect beat it replaces.

## Blanks filled / documented
- FILLED: scripts/test-hungerexempt-20261014.js — the arm's measurement
  proof: RED→GREEN via the patch-file cycle (no git stash on the hot tree);
  side-aware shape assertion (control HUNGEREXEMPT=0 proves the exemption
  disabled; armed proves it fires); mutual-exclusivity assertion
  (v.hungryDays can never gate the exemption — an empty pantry never
  engages); rotation-untouched assertion. RED pristine ALL GREEN, GREEN
  armed ALL GREEN (19/19), control-side ALL GREEN.
- FILLED: scripts/measure-hungerexempt-20261014.js — the pilot sweep
  (SMOKE=1 instrument-honesty gate, named-export unwrap, per-side SIDE
  assertion, per-seed JSON, villager-days from samples.pop, starvation
  cause 'starvation' from the death register).
- FILLED: scripts/sample-exempt-days-20261014.js — exemption-beat sampler
  (sense-test) + the emoji-collision audit.
- REVERTED per kill protocol: the src/js/game.js exemption (committed as
  01bc65a5, reverted — killed arms leave no trace).
- DOCUMENTED (not chased — findings for the backlog/next run):
  1. The confirm's "thinner-buffer cost" hypothesis misdiagnosed the
     mechanism: the starvation bind under the throttle looks like
     DISTRIBUTION (trust-gated sharing), not total food. A future arm
     could attack sharing directly (or gate the exemption on hunger depth,
     e.g. streak ≥2, rather than any hunger).
  2. hungryStreak is a chronic condition on some seeds (lead-77: 183
     exemptions across 166 days with zero starvation deaths) — the
     anyStarving signal fires on under-eating that never kills. A
     "genuinely hungry" gate with no depth floor exempts constantly.
  3. Sampler lesson: /^🍲/ matched unrelated cook beats — when sampling
     beats by emoji, assert the beat's full text, not just the glyph.

## Metric review (§14)
1. The new primary (starvation deaths per 100 villager-days, proposed by
   the confirm's metric review) worked as designed: denominator-aware, so
   shorter armed runs couldn't hide a higher death rate — and it caught a
   real regression (+49%) that the raw starvation count (17→23) would have
   understated relative to the villager-day base. Keep this primary for
   future survival-cost arms on this axis.
2. The 0.85 GO bar was honest: the arm missed it by 5× in the wrong
   direction. No ambiguity, no re-score temptation.
3. The rot guardrail (≤1.33×) held with room (1.22×) — correctly shaped as
   a one-sided "don't gut the lever" bound; it did its job without
   punishing the arm.
4. hungryDays as a guardrail corroborated the primary again (29→36, bound
   ≤34) — the two hunger signals move together, as the confirm found.
5. National as a guardrail caught a real regression (11→8, bound ≥9) on
   the same seeds — worth keeping on this axis: the throttle's labor-mix
   shift reaches the scale road.
6. Design note for the next run (not a re-score of this one): gate any
   future hunger exemption on hunger DEPTH (hungryStreak ≥ 2 or 3) or on a
   per-run exemption budget — the any-hunger gate fired 686 times and
   behaved like a standing override of the lever, not a famine guard.

## Convergence state
food-economy: hunger-exempt-throttle **killed-at-pilot (2026-10-14)** —
primary starvation/100vd regressed 1.241→1.853 (+49%; GO needed ≤1.055),
guardrails national/median/hungryDays missed, rot guardrail held. The
landed prodthrottle (afb736e6) stands WITHOUT the exemption; the arm's
game code is reverted per kill protocol. The confirm's thinner-buffer
hypothesis is superseded: the bind looks distributional (trust-gated
sharing), not buffer depth — candidate mechanism recorded for the next arm.
