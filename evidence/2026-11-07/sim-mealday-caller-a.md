# sim-mealday-caller-a — DIAG: the second villagerMealDay caller is endDay running twice on a player-death night (measurement only)

Run: oversight-flesh-out-loop, run fleshout-20261107T1615Z (Loop A), arm
sim-mealday-caller-a, axis food-economy. Worker tree:
~/workspace/worktrees/sim-mealday-caller-a, branch sim-mealday-caller-a,
base 4ce3c0c1f (see substrate note in the prereg — master has moved on
since; this worker does NOT rebase or merge, the coordinator lands).
DIAG ONLY: zero src/js game changes. No fix is built here; the fix shape
is documented precisely below for a LATER run's arm with its own prereg.

Preregistration (binding per MEASUREMENT.md §14):
evidence/2026-11-07/sim-mealday-caller-a-prereg.md — competent policy
only, 150d death-aware, pilot P1 = the 8 highest-fire seeds from the
awayconfirm corpus (98067, 98052, 98079, 98062, 98034, 98095, 98022,
98028; 86 known fires), each run twice (MEALDAY_TRACE=0 baseline, then
=1 recorder), extension P2 iff < 4 fires reproduce. Det-gate: recorder
captures the call site on 100% of dedupe fires; every fire classified;
zero UNCLASSIFIED; neutrality exact on all seeds.

VERDICT-RENDERED: DIAG-GO — the second caller is identified, every fire
classified, zero UNCLASSIFIED, neutrality exact on all 8 seeds.

## Results

Judged numbers (this run only, competent, 150d, pilot P1, base 4ce3c0c1f):

| Metric | Value |
|---|---|
| villagerMealDay calls recorded (trace-on) | 6,552 (missing call site: 0) |
| Reproduced dedupe fires | 14 (extension bar < 4 not met — P2 NOT run) |
| Fires by H-class | H1 14, H2 0, H3 0, UNCLASSIFIED 0 |
| Fires by effect | BUG 14, BENIGN 0 |
| Neutrality (trace-off vs trace-on) | exact on 8/8 seeds (daysAlive, deathRows, mealRows identical) |
| Double-days | 2 (seed 98022 day 133: 4 fires; seed 98079 day 10: 10 fires) |
| Rate | 14/6,552 calls (0.21%); 2 double-days in 842 lived days (0.24%) |
| Away / haven fires | 8 / 6 (no away skew) |
| Proof test | scripts/test-mealday-caller-a.js PASS 52 legs (incl. live leg E) |

The awayconfirm rate (141 fires / 78,010 rows = 0.18%) matches this
run's 0.21% — the same phenomenon, now named.

### The caller, named

There is no second caller of villagerMealDay. There is a second
**endDay**. Both meal calls in every fire come from the one and only
direct call site — `Object.villageEats (src/js/game.js:32246:24)`,
inside `villageEats()`, inside `endDay()` (`src/js/game.js:33167`) —
reached through the membership wrapper (`src/js/membership.js:1075`,
filters the roster to members, calls through once) and the endDay
wrappers (`src/js/journal.js:1367`, `src/js/truth.js:2079`,
`src/js/alienPlayers.js:3182` — each calls the original exactly once;
none of them is the doubler). The two calls in every fire carry
consecutive villageEats invocation ids (N then N+1) on the SAME
scholar.day, with the same roster order (seq 1→1, 2→2, …). The whole
night runs twice: villageEats is only the visible half — the second
endDay also re-runs villageMeal, villageLives, healerRounds, drinks,
sickness, ecology, traps, and the rest of the overnight sim.

### The trigger, proven

On BOTH double-days the player died overnight of starvation while
camped wild with a full pantry at home:

- seed 98079, day 10: Harold (gen_1d42oc6), player, starvation. Pantry
  21,300 kcal, 18.1 fresh days, 12 people, nobody hungry.
- seed 98022, day 133: Grace (grace_obi), player, starvation.

The mechanism, read in code and matched to the recorded data:

1. endDay #1 runs villageEats (pass 1, day N, invocation N), then
   reaches the overnight settlement: `!res.ok || scholar.health <= 0`
   → `playerDeath('starvation')` → succession → `returnToVillage()`
   → `return this.status()` — an EARLY RETURN that sits BEFORE
   `scholar.day += 1` (src/js/game.js:33281). The day is still N.
   (The same early-return-before-increment shape holds for the
   `villageLost` and `this.over` returns just above it.)
2. The day driver still sees the day un-advanced, so endDay is
   entered a SECOND time for the same scholar.day N (the dayTicks /
   day-part boundary conditions still hold because the day never moved
   and the clocks were not reset by the early return).
3. endDay #2 runs the full night again: villageEats pass 2 (day N,
   invocation N+1). Every surviving villager eats a second time that
   day — a second pantry/pack draw, a second hunger tick, a second
   production/learn roll. This time the (new) player survives the
   night, the day increments once, and the calendar shows no skip and
   no repeat: days run consecutively, invocations stay exactly one
   ahead of days afterwards. The double is invisible except in the
   meal rows and the extra food burn.

Succession proof in the data: the successor eats in pass 1 as a
villager and never eats again — omar_farouk (98079) ate day-10 pass 1
and is absent from every meal row from day 11 on; visjoin_105 (98022)
ate day-133 pass 1 and is absent from day 134 on. A joiner
(visjoin_133, 98022) appears only in pass 2 — the roster changed
between the two passes, so real game time (succession, joins) ran
between them; this is not a re-entrant call inside one endDay.

### The effect: BUG, all 14 fires

Per the prereg's benign/bug rule (BENIGN iff ate, drawn, hungerAfter
and healthAfter are all equal across the two calls), 0/14 fires are
benign. The second call is a real second meal, not a re-record:

- Extra food drawn by the second calls: 1,808.5 kcal in total across
  the 14 fires (5 fires drew again, max single extra draw 1,000 kcal —
  visjoin_121, 98022 d133, drew 1,000 twice). The village pays for the
  same night twice.
- Meal rows overwritten: 11/14 (ate lost 4, inflated 7; total ate
  26,499 first calls vs 24,938 second calls — the record the analyzer
  judges is the second meal's, last-wins).
- Hunger/health end states differ in 14/14 (the extra +25..40 hunger
  tick stuck, then the second meal eased it again; health moved
  between passes, e.g. visjoin_121 healed 31 → 44 between the two
  passes, gen_2n7fip7 fell 13 → 5 inside the second pass).
- No fire is a pure re-record: even the 9 fires with drawn2 = 0 still
  re-ran production, hunger, and the learn/handling rolls.

Rate context: the double needs the player to die overnight AND the
night to have been entered on the path whose early return skips the
day increment. That is rare (2 double-days in 842 lived days here;
141 fires in 100 awayconfirm seeds) but it is a real double-charge
on the village's food every time it happens — and it fires exactly on
the nights the village has just lost its bearer, when food honesty
matters most.

### Balanced panel per §15 (not applicable, known class)

Single-policy diag, no before/after comparison arm — the panel
ingests panel.json.gz before/after outputs and this run has none (the
same known failure class as awayconfirm-a). The neutrality off/on
comparison table above (exact match, 8/8 seeds) stands in its place.

## Metric review (post-run)

- The metric was the right one and was judged as pre-registered:
  neutrality exact 8/8, capture 100%, every fire classified, zero
  UNCLASSIFIED. No re-scoring happened.
- Seed deviation, recorded: the brief suggested seeds 98000–98007,
  but those fired ZERO dedupes in the awayconfirm corpus (checked
  before sims against sweep-competent.json), so the pilot used the 8
  highest-fire seeds instead (86 known fires). The prereg records the
  deviation and the reason; it is a diag recorder, not a lever, so
  selection on the fire count is the correct design and no
  band-freshness reservation applies.
- Base sensitivity, observed: seed 98067 fired 21 dedupes on the
  awayconfirm measurement base (c92a873f4) and 0 on this base
  (4ce3c0c1f); 98079 fired 10 on both. The phenomenon needs a player
  overnight death on the right entry path, so its per-seed count is
  volatile across bases — the mechanism, not the count, is the finding.
  A fix arm must re-run the pilot on ITS base and show 0 fires; it
  cannot lean on the old base's counts.
- Proof-test correction during the run: leg E10 first asserted
  eatsInvCount >= daysAlive (one villageEats per lived day). It
  failed on 98067 (89 vs 90): the final partial day's endDay never
  runs villageEats (all 8 seeds end village-lost; non-double seeds
  sit at daysAlive − 1, 98062 at − 2). The assumption was wrong, not
  the game. E10 was replaced with the sharper leg the phenomenon
  itself supports (every live fire has consecutive invocation ids on
  the same day) plus E11 (every live fire H1/BUG). Final proof: 52/52.
- Proposed revision for the NEXT run, not this one: none to the diag
  gate. The fix arm's prereg should pre-register 0 reproduced fires
  on the same pilot seeds with trajectories identical except on the
  former double-days.

## Sense (SENSE-TESTING LAW)

Transcripts read, beats quoted — never just counts. Both double-days
are player-death nights, and the game says so plainly both times:

**Harold, s98079 d10 — the player starves camped wild, pantry full.**
Pantry 21,300 kcal, 18.1 fresh days, 12 people, nobody hungry — and
Harold dies in the wild anyway: *"You camp wild tonight — no pantry
meal. Eat from your pack."* alongside *"⚠ STARVING: health and
energy falling. The spiral has started."* and *"The System's gifts
are hungry: -60 kcal metabolic cost. Feed the power or lose it."*
The same night, his villagers eat twice: Paola (gen_2n7fip7) eats
1,596 kcal from her pack (drawn 1,168), then eats again — 648 kcal,
drawn 3, the pack nearly dry — health 10 → 10, then 13 → 5, and dies
of dehydration the same day. The double meal did not save her; it
burned the last of her pack. The beats cohere: a bearer dies out in
the wild, the village keeps his people fed — twice — and the record
keeps only the second meal.

**Grace, s98022 d133 — the same shape, 123 days later.** *"You camp
wild tonight — no hall meal, but the pantry still reaches you through
System requisition. Eat from your pack tonight."* The village's
answer is the same: everybody eats the night twice (4 fires), the
new bearer (visjoin_105) steps in silently — no line names the
succession in the meal rows — and the calendar never shows the
stutter. A player watching would see one long night and never know
the village ate twice. That invisibility is the bug's character: it
is a quiet double-charge, not a visible stumble.

What the transcripts do NOT show: any villager noticing the second
meal. No line says "we ate twice." The double is silent in the
fiction, which is why only the instrument could see it.

## Village assessment in plain words

Eight villages lived 51 to 141 days and died the usual way — the
village lost, not the game broken. On two of those nights, the person
leading the village starved to death out in the wild while the pantry
at home sat full, and the village — in the middle of losing its
leader and finding a new one — fed everyone twice. Nobody noticed:
the second supper looks exactly like the first, the calendar never
skips, and the only trace is that the food bins are a little emptier
than they should be and the meal log keeps the second helping
instead of the first. It happens rarely, about twice in eight
villages, and it always happens on the worst night — the night the
bearer dies. The food story is not that villagers are greedy; it is
that the night itself runs twice when the leader dies in it.

## Blanks filled or documented

- FILLED (identified): the second villagerMealDay caller is endDay
  running twice for the same scholar.day after a player-death early
  return skips `scholar.day += 1` (game.js:33281). 14/14 fires H1,
  14/14 BUG, 0 UNCLASSIFIED, capture 100%, neutrality exact 8/8.
- DOCUMENTED (fix shape, NOT built): move `scholar.day += 1` above
  the three early returns in endDay (`villageLost`, `this.over`,
  player-death — all before line 33281), so the day advances once
  even when the night ends in death/succession; the day driver then
  cannot re-enter endDay for the same day. Alternative: a same-day
  re-entry guard on endDay. Either needs its own prereg and a pilot
  re-run showing 0 fires. The same hazard covers the villageLost and
  over branches, not only the observed player-death branch.
- DOCUMENTED: the recorder is provably neutral (trace-off vs trace-on
  trajectories identical on all 8 seeds) and the instrument is
  reusable: scripts/sweep-mealday-caller-a.js,
  scripts/analyze-mealday-caller-a.js, scripts/test-mealday-caller-a.js
  (PASS 52 legs incl. live leg E), scripts/run-mealday-caller-a.sh —
  all committed with the prereg, the evidence file, and the 16-seed
  corpus (8 seeds × trace-off/trace-on) + analysis.json. Zero src/js
  changes; this arm needs no [needs-eyes] (measurement only, nothing
  for Steve to playtest).
- DOCUMENTED: seed 98067's fire count is base-volatile (21 on the
  awayconfirm base, 0 on this base) — fix arms must re-run the pilot
  on their own base.
- DOCUMENTED: both triggering deaths are the known camp-wild player
  starvation shape (full pantry at home, empty pack in the wild) —
  the same finding the awayconfirm backlog already carries for the
  player's path. The double-night is a consequence of that death, not
  a separate cause.

## Findings for the backlog (this worker appends — task-directed)

- [open] 2026-11-07 — food economy / endDay — DOUBLE-NIGHT BUG: endDay runs twice for the same scholar.day when the player dies overnight (sim-mealday-caller-a, run fleshout-20261107T1615Z, evidence/2026-11-07/sim-mealday-caller-a.md): 14/14 dedupe fires H1/BUG, 0 benign; the player-death branch returns early before `scholar.day += 1` (game.js:33281) and the day driver re-enters endDay; villagers eat twice (1,808.5 extra kcal drawn across the 14 fires), meal rows overwritten last-wins, no day skipped. Fix shape (NOT built — needs its own prereg): move `scholar.day += 1` above the three early returns in endDay (villageLost / over / player-death), or a same-day re-entry guard; fix arm re-runs pilot P1 and shows 0 fires.
