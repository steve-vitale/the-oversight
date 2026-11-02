# sim-vetobudget-b — veto budget: 3 silent vetoes per expedition (PILOT GO)

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1233Z).
Worktree sim-vetobudget-b, branch sim-vetobudget-b.
Prereg: evidence/2026-11-02/sim-vetobudget-b-prereg.md (committed
c56862a16 BEFORE any judged sim). Port: cd2662b66 (policy + driver
+ analyzer + proof). Proof: scripts/test-vetobudget-b.js 27/27.
Convergence state: converging (primary met on the band that
carries the repetition; confirm owed, not spent here).

## What was built (policy-side ONLY)

scripts/policies/competent-vetobudget-b.js wraps the guard policy
scripts/policies/competent-homewardstep-b.js (read-only reuse via
its exported installGuard; ZERO edits to it, ZERO edits to
scripts/policies/competent.js, ZERO src/js changes, ZERO
policy-default flips). The budget wrapper sits OUTSIDE the guard
on Game.travelTo during competent.daily and is restored after.

THE ONE DEFINITION (prereg, decided up front): N = 3 silent
vetoes per expedition. An "expedition" is the scholar's ongoing
pursuit of ONE route — a run-scoped campaign to take a
particular step (ordered tile pair from -> to) — and the budget
does NOT reset at dawn, because the observed pathology IS
multi-day and a per-day budget would throttle it without ending
it. Only SILENT vetoes count (the first, spoken veto is the
scholar learning the route is refused); silent vetoes are
detected via the guard's OWN ctx counters, never from return
shapes. On the Nth silent veto the step is marked ABANDONED
(run-scoped, permanent — the expedition is over, not paused);
later attempts are SUPPRESSED (veto-shaped block returned
WITHOUT invoking the guard: no veto counted, no narration, no
escapeCheck sim). Force, combatExit, self-calls, and in-combat
calls are never suppressed. No narration is added by this arm.

## Census (proof, not judged evidence)

scripts/test-vetobudget-b.js: PASS 27 checks. Fake-Game battery:
spoken vetoes never count (5 spoken, no abandonment); silent
vetoes accumulate and the 3rd abandons; post-abandonment
attempts never reach the guard, return the veto block, and count
as suppressions; step keys carry independent budgets; force /
combatExit / self / in-combat calls always reach the guard;
passing hops move untouched; veto-shaped blocks WITHOUT counter
movement are never counted (counters are the source of truth);
1 spoken + 3 silent abandons exactly like the 62808 shape;
a wrapper error falls back to exactly one guarded call. A
counter-initialization fix found by the proof (suppresssions /
abandonments counters now initialize to 0 on first install so
telemetry reads 0 instead of undefined before any event) is in
the committed policy.

## Pilot (judged band 62801-62808, 30d, guard-only vs guard+budget, identical seeds, DEPOSITGATE=0)

Baseline leg = fresh guard-only runs (NOT the predecessor's
JSONL — per-step per-day veto counts are recorded by this
run's own driver on both legs). The fresh baseline reproduces
the predecessor's repetition exactly on 62808 (68 vetoes, 66
silent; step (4,4)->(4,1) 65 silent / 22 days) and surfaces a
second repetition seed the predecessor did not highlight:
62807 step (4,4)->(7,4), 17 silent / 6 days. Band baseline:
95 vetoes, 85 silent (predecessor band total was 96/85 — a
1-spoken-veto delta on a non-repetition seed; silent counts
identical; the judged comparison is within this run's driver,
so the delta is context, not a bar).

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| P1 max same-step silent vetoes / seed-day on repetition seeds (<= 3) | 62807: 3, 62808: 3 | 62807: 2, 62808: 2 | PASS |
| P2 steps with silent vetoes on > 3 seed-days (= 0) | 62807: 6 days, 62808: 22 days | none | PASS |
| P3 total same-step silent vetoes > 3 (= 0) | 62807: 17, 62808: 65 | none (max 3) | PASS |
| B1 median survival (>= baseline) | 30d | 30d | PASS |
| B2 deaths (<= baseline, no new mode) | 75, modes as listed | 75, identical modes | PASS |
| B3 failed-trip share (<= baseline + 0.05, this arm's own tolerance) | 0.508 | 0.508 | PASS |
| B4 mean daily haul (>= 0.95x) | 258.9 | 258.9 (1.00x) | PASS |
| B4perSeed floor (every seed >= 0.50x own baseline) | — | worst seed 1.00x | PASS |
| B5 away day-ends (<= baseline + 2) | 3 | 3 | PASS |
| B6 forageTrips (>= 0.90x baseline) | 520 | 520 (1.00x) | PASS |
| B7 suppressions > 0 on every repetition seed | — | 62807: 14, 62808: 62 | PASS |
| B8 veto-created pockets (= 0) | — | 0 | PASS |

Per-seed (away/episodes, haul, vetoes(silent) base -> armed,
suppressions, abandonments): 62801 1/0 -> 1/0, haul 204.2
identical, 2(0) -> 2(0), supp 0; 62802 0/0 -> 0/0, 181.7
identical, 2(1) -> 2(1), supp 0; 62803 0/0 -> 0/0, haul 0 both,
0 -> 0, supp 0; 62804 2/0 -> 2/0, 230.8 identical, 3(0) -> 3(0),
supp 0; 62805 0/0 -> 0/0, 414.8 identical, 0 -> 0, supp 0;
62806 0/0 -> 0/0, 268.3 identical, 0 -> 0, supp 0; 62807 0/0 ->
0/0, 409.2 identical, 20(18) -> 6(4), supp 14, aband 1; 62808
0/0 -> 0/0, 362.0 identical, 68(66) -> 6(4), supp 62, aband 1.

### Mechanism accounting (every baseline veto, classified)

Band-wide: 95 baseline veto attempts = 19 armed vetoes + 76
suppressions. Silent vetoes: 85 baseline = 9 armed + 76
suppressed. Spoken vetoes: 10 baseline = 10 armed (spoken
vetoes are never suppressed — abandonment only follows silent
counts, and after a destination's first veto all its repeats
are silent by the guard's own memory). The budget does not
reduce attempts — competent still calls travelTo 3x/day —
it reclassifies post-budget attempts from guard vetoes to
suppressions and stops the guard from re-evaluating a dead
route. That is the instrument working as designed, not a
count hidden: the guard's veto counter is the thing the
finding complained about (68 vetoes), and it now stops at 4
per abandoned step (1 spoken + 3 silent).

### The two repetition traces (what the budget did, day by day)

62808 step (4,4)->(4,1): baseline 3 silent vetoes/day on days
9-30 (day 9: 1 spoken + 2 silent; days 10-30: 3 silent each).
Armed: day 9 identical (1 spoken + 2 silent, budget counts 1,
2); day 10 first attempt is the 3rd silent veto (count 3) —
step abandoned on the spot — remaining 2 day-10 attempts
suppressed; days 11-30 all 3 attempts/day suppressed (62
suppressions). Guard vetoes for the step: 4 total (1 spoken +
3 silent) vs 66 at baseline. Day-ends identical every day
(day 10 kcal 930, day 11 kcal 2180, day 20 kcal 2102, day 30
kcal 2190, home every night, same forage counts).

62807 step (4,4)->(7,4): baseline silent vetoes days 11-16
(2,3,3,3,3,3 = 17). Armed: day 10's budget entry is the
seed's other step (6,2)->(6,0) and its single silent veto
(baseline day 10: 1 spoken + 1 silent for that step — it
never reaches budget and is untouched); day 11: (7,4)
silent counts 1, 2; day 12 first attempt is the 3rd silent
veto — abandoned — remaining 2 day-12 attempts suppressed;
days 13-16 all suppressed (14 suppressions). Guard vetoes
for the step: 3 silent vs 17 silent at baseline. The budget
fires per step, not per seed.

### Abort side-effects (explicit, per the brief)

- IDLING: none. Band forageTrips 520 -> 520; every seed's
  day structure identical (0 divergent day-records across
  all 8 seeds on start/end snapshots + forage counts).
- LOST HAUL: none. Mean daily haul 258.9 -> 258.9; per-seed
  ratios all 1.00x (including both repetition seeds).
- NEW FAILURE MODES: none. Deaths 75 -> 75 with identical
  cause composition (villager combat 37, combat 19, ambush 3,
  monster 3, expedition 4, the wild 4, other 6, sickness 1);
  player-flagged deaths 6 -> 6; starvation/dehydration seeds
  0 -> 0; pocket episodes 0 -> 0; false opens 0.
- PERMANENT-ABANDONMENT RISK (prereg-named): did not
  materialize on this band — no budgeted step later opened
  (trajectories identical), so no haul was foregone to a
  reopened route. The risk stays real for longer horizons
  and is the confirm-stage question, not a pilot finding.

## Sense-testing (transcripts, not just counts)

SayLines are byte-identical between legs on all 8 seeds
(lengths 2967/3296/3193/3280/2992/2690/3073/3170, content
identical) — the budget adds no narration, exactly as
preregged. The veto line speaks only twice on 62808 (day 8
for (4,7)->(2,7), day 9 for (4,4)->(4,1)) on BOTH legs; every
later refusal was already silent at baseline, so the
transcript never showed the repetition — the repetition lived
in the hop log and veto counters, and that is what the budget
fixes. Stated plainly: this arm eliminates veto-count
repetition, not transcript repetition (there was none to
eliminate); a future narration arm could key an abandonment
line off the abandoned state this arm now records, but that
is explicitly not this arm.

The post-abort day reads sensibly because it IS the post-veto
day: day 9 night on 62808 armed shows the veto line, then
"Travel 1 tile to trail edge", "This patch is worked out —
step to another green patch and forage again", "Travel 2
tiles to meadow", a real forage (5x Purslane, 6x Cattail,
870 kcal), "Travel 1 tile to Haven", "You walk back into
Haven." The scholar tries north, is refused, works the ground
near home, and comes home fed — a person who learned the way
is shut, not a robot re-picking it. Post-abort days 11/20/30
show the same shape (3 forage attempts, home at kcal 2180 /
2102 / 2190). Nothing idles, nothing starves, nothing new
breaks.

## Village assessment (plain words)

On the two seeds where trouble actually showed up, the
baseline village kept a scholar hammering at a shut door
three times a day — north out of haven on one seed, east on
the other — for three weeks, while the village itself carried
on: the pantry held 17-26 days of fresh food, villagers
hauled stone and wood, cooked, taught each other plants
(Wolfgang teaching, Mariana watering beds, Werner on the
stone pile), fought off a Hushpuppy breach, held a moot, and
buried their dead from fighting, not hunger. Given the
budget, the scholar still tries the shut door — three times
in all, across two days — and then stops asking: the rest of
the month it works the near-home ground and comes home fed,
while the village's life goes on exactly as before. Nobody
eats less, nobody dies differently, nobody strands. What the
budget did not do is teach the scholar anything new about
the world — it stopped the asking, not the wanting — and
whether a permanently shut route should ever be re-tried
after the ground changes is still an open question for a
longer run. The village itself is the same village on both
legs: alive, fed, quarrelsome, and still fighting more than
starving.

## Wall numbers (in-window only, never pooled across arms)

Pilot window (30d): national / table / wins 0 both legs
(expected measurement profile in a 30-day pre-seat window,
not a regression — see panel section); median survival 30d
both; driver wave reach: maxWaveUnlocked per seed 2,2,2,3,2,
1,1,1 both legs (wave 4-5 unlocks 0, full seat 0, wave 5
reached 0 unchanged). No wall movement is shown or claimed:
this pilot measures veto repetition, not the scale wall.

## Balanced panel (§15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/vetobudget-b-panel --policies
competent-homewardstep-b,competent-vetobudget-b --seeds
62801,...,62808 --days 30 --par 4` — 16 cases, 0 reused,
sourcesStable true, neutrality matched on both policies
(proof seed 62801, 0 warnings). Per-seed panel rows are
IDENTICAL between legs on every seed: won 0, national 0,
table 0, maxArc 3, vests 0, deaths identical per seed (panel
death counting differs from the driver's by substrate — never
pooled; the point is the legs agree exactly within the panel
too). Raw panel archived as
evidence/2026-11-02/sim-vetobudget-b-panel.json.gz. No panel
verdict is claimed: per §15 the panel is the instrument, the
preregistered threshold is the judge, and the judged verdict
above comes from the driver/analyzer, not the panel.

The compare of the two single-policy panels (base
competent-homewardstep-b panel vs armed competent-vetobudget-b
panel, same seeds/days) returns decision INVALID — "Unmatched
policies / Unmatched cases" — and is attached as-is
(evidence/2026-11-02/sim-vetobudget-b-panel-compare.md), not
overridden. The reason is structural, and it is the same
refusal class as the predecessor's split-panel attempt: the
comparator matches campaigns with the same policy set across
two roots, while a policy-side arm splits its two policies
across the two panels, so the sets can never match. The valid
panel artifact is therefore the single combined campaign above
(both policies, one panel, sourcesStable, neutrality matched),
whose per-policy rows are the panel context quoted here. No
panel verdict is claimed.

## Verdict: GO (veto budget, on the band that carries the repetition)

- PRIMARY PASSES: P1 (max per-day <= 3 on both repetition
  seeds: 2 and 2), P2 (no step vetoed on > 3 days: max 2 days
  armed vs 22 baseline), P3 (no step over 3 total silent
  vetoes armed vs 65 baseline). The 20-day pattern is gone:
  the longest armed silent-veto span for any step is 2 days.
- ALL NO-HARM BARS PASS, most at exactly 1.00x — the
  instrument changes bookkeeping, not outcomes, on this band.
- The GO is for the BUDGET AS ARMED (N = 3 silent vetoes per
  expedition, run-scoped, permanent abandonment). It is not a
  claim that permanent abandonment is safe on longer horizons
  (the reopened-route risk is untested here) or that the
  transcript problem is solved (there was no transcript
  repetition to solve).
- No confirm spend in this run (prereg): a pilot GO goes to
  the coordinator for a confirm decision (12-16 seeds),
  ideally paired with a longer-horizon leg where a budgeted
  route could reopen, so the permanent-abandonment cost is
  actually measured rather than assumed away.

## Metric review (for the NEXT run, never a re-score)

- The primary's P1 clause (per-day <= budget) is weak on its
  own: baseline per-day was already 3 = budget, so P1 passes
  without discriminating. P2 (days spanned) and P3 (total per
  step) carry the verdict here. A future prereg should either
  set N below the observed daily rate (so P1 discriminates)
  or drop P1 and judge on P2+P3 alone.
- The "repetition seed" definition (>= 6 total silent OR >= 4
  days) caught 62807, which the predecessor's narrative had
  not flagged — definitions that scan the whole band beat
  definitions written around one known seed. Keep it.
- Death accounting: the driver's samples.deaths mixes 69 NPC
  deaths with 6 player-flagged deaths; B2's band total (75)
  is dominated by NPC combat deaths and is insensitive to
  scholar harm. A future prereg should bar on player-flagged
  deaths separately (here 6 -> 6, so no verdict change).
- The budget's trajectory-identity (0 divergent day-records)
  is expected from the design (suppression returns the veto
  block), but the analyzer's day-record comparison covers
  snapshots + forage counts only, not full game state. A
  confirm run should add a stronger identity check (e.g.
  pantry + roster snapshots) or state the comparison's scope
  as done here.
- The reopened-route risk needs a real test: a band/horizon
  where a budgeted step's E(D) flips from fail to pass after
  abandonment (rubble cleared by other work). Until then,
  "permanent" is a prereg choice with pilot support only on
  a band where nothing reopened.

## Corpora

- evidence/2026-11-02/sim-vetobudget-b-prereg.md
- evidence/2026-11-02/sim-vetobudget-b.md (this file)
- evidence/2026-11-02/sim-vetobudget-b-pilot-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-vetobudget-b-analysis.txt
- evidence/2026-11-02/sim-vetobudget-b-panel.json.gz
- evidence/2026-11-02/sim-vetobudget-b-panel-compare.md (+ .json)
