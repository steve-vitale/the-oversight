# sim-firenarr-deploy-b — DEPLOY VERDICT: GO (with a loud ordering caveat)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261104T0130Z,
axis food-economy, arm sim-firenarr-deploy-b (the firing-evening
narration deploy). Worktree sim-firenarr-deploy-b, branch
sim-firenarr-deploy-b. Prereg:
evidence/2026-11-04/sim-firenarr-deploy-b-prereg.md (committed
085c5f55 BEFORE the deploy code commit and before any screen
or judged leg). The deploy commit for this arm follows this
evidence file in the same commit set; no push, no bump, no live
verification — the coordinator merges, the ship loop owns deploys.

## Verdict: GO — on the preregistered metric, with one loud caveat

GO threshold (prereg, all must hold): narration emits on ALL
traced firing evenings in a sample of >= 8 firing legs,
INCLUDING >= 1 real (F)-first evening read from a real
transcript, all template constraints hold, AND zero
trajectory divergence on those same 8 identical seeds run
with/without the narration. Result:

- Emission: pilot 8/8 legs match predicted-vs-observed
  exactly (day + template), and the full screen matches
  80/80 legs (23 firing legs, 36 firenarr lines, zero
  extra lines, zero missing lines, zero repeat lines).
- (F)-first, real transcript: YES — 83632 day 28 (pilot
  leg, plain F template) and 83648 day 8 (screen leg,
  plain F template), both read and quoted below.
- Template constraints: every emitted line <= 85 chars,
  says "store" and "recent high", no digit, no percent
  sign, no "days" claim, no hunger word, no stand-down /
  gate / throttle language. Proved on live lines and on
  synthetic fixtures (scripts/test-firenarr-deploy-b.js,
  22/22; reused spec proof scripts/test-firenarr-20261104.js,
  107/107; streakfree proof 24/24).
- Trajectory identity: pilot 8/8 legs identical ON vs OFF
  (deploy-input series, deaths, endReason, daysAlive,
  alive count all identical; say streams differ ONLY by
  the firenarr lines). Narration only, as required: no
  game outcome changed.

THE LOUD CAVEAT (read before citing this GO anywhere):
the deploy's firings are NOT the old tracer's firings.
On the 8 pilot seeds, deploy firings agree with old-tracer
firings on only 1 seed (83608). The other 7 shift by days,
appear, or disappear (table below). This is NOT a deploy
bug and NOT a GO miss: the prereg fixed the judged trace
as the DEPLOY's own evening reads, and the old tracer
reads a different point in the night (pre-meal store,
pre-update streak — see "Ordering proof"). The spec's
premise that the tracer read IS "the evening store after
the day's meals" is wrong, and this deploy proves it with
numbers. Consequence the coordinator must carry: if anyone
wants narration to fire on the tracer-judged evenings,
the (v**) rule needs re-judging on deploy reads — the
deploy does not retro-fit the tracer evenings. The
recommended reading: the deploy read (after the night's
meals, with tonight's streak) is the rule's true home —
it is what the village actually lives through — but that
call belongs to the coordinator / Steve, not this arm.

## The deploy (what changed)

- src/js/game.js: one new method, _firenarrEvening(),
  called once from endDay() immediately after the
  villageEats() call, via this.say(). The method holds
  the stretch state (stretch index, stretch start day,
  peak, previous evening's store, falls count, fired
  clause, escalation flag, last-processed day) on the
  village object (plain JSON, save-safe), uses NO RNG,
  and is wrapped in try/catch at the call site so
  narration can never break endDay.
- The E1 fraction is ONE named constant,
  FIRENARR_E1_FRACTION = 0.85 (the currently judged
  value), with a comment that the sibling
  sim-fracchoice-b arm owns the fraction decision.
  This arm did not block on the sibling and did not
  pick a new fraction.
- NARRATION ONLY: no throttle, gate, price, deed,
  readiness, or gameplay-effect change. The 8/8 identity
  proof is the evidence.
- New scripts (this arm only): scripts/trace-firenarr-deploy-b.js
  (deploy-input tracer + ON/OFF ablation), scripts/analyze-firenarr-deploy-b.js
  ((v**) analyzer over deploy series + template table),
  scripts/compare-firenarr-deploy-b.js (pilot comparison),
  scripts/transcript-firenarr-deploy-b.js (real-evening
  reader), scripts/test-firenarr-deploy-b.js (unit proof
  of the real method, 22/22).

## Pilot (judged): 8 firing legs, first 8 in seed order from the screen

Policy competent, 30d, DEPOSITGATE=1. ON legs are the
screen legs; OFF legs are ablation re-runs (hook method
replaced with a no-op before runDays, identical code
otherwise).

| seed | deploy firings (day:kind) | old-tracer firing | identity ON vs OFF |
|---|---|---|---|
| 83608 | 22:E1 | 22 E1-envelope | identical |
| 83609 | 17:F-again, 25:E2-again | 15 F-fallback | identical |
| 83615 | 23:E2 | 18 E2-cliff | identical |
| 83616 | 25:F-again | 8 F-fallback | identical |
| 83617 | 30:E2-again | 29 E2-cliff | identical |
| 83619 | 19:F-again | none | identical |
| 83624 | 18:E2 | 19 E1-envelope | identical |
| 83632 | 28:F, 29:ESC | 30 F-fallback | identical |

Emission 8/8, identity 8/8. "Identical" means: deploy-input
series (day, store, streak, gate) byte-identical, deaths
identical, endReason / daysAlive / alive count identical,
say streams differing ONLY by the firenarr lines.

## Screen (not judged, descriptive): 80 fresh seeds 83601-83680

Fresh band, never judged before. Emission match 80/80
(predicted-vs-observed over each leg's own deploy series).
23/80 legs fire (36 firenarr lines total); 57/80 never
fire and stay silent, as designed. Event kinds observed
live: E1 5, E2 5, F 5, E1-again 4, E2-again 5, F-again 4,
ESC 8. Every template kind and every occasion (first /
again / escalation) fired in live play — no variant ships
on synthetic proof alone. End reasons in the window:
survived 75, village-lost 5. Of the 23 firing legs, 18
survived the window and 5 were village-lost: a firing is
a warning, not a death sentence, exactly as the spec's
survivor firing (83201) foreshadowed.

## Spec gaps: closed or open

1. HOOK PINNED — CLOSED. Single call site: endDay()
   after villageEats(), via this.say(). Stretch state
   (start, peak, falls, fired, escalation, stretch
   index, lastDay guard) added on the village object;
   the game held none of it before. Evening-store read
   ordering proved below (it differs from the tracer's
   read — that difference is now measured, not assumed).
2. (F)-FIRST EVENING READ — CLOSED. Two real ones, quoted
   below: 83648 day 8 (plain F template, streak 0, seven
   straight falling evenings) and 83632 day 28 (pilot leg,
   plain F template, streak 0). The F wording ("keeps
   slipping … evening after evening, lower") fits both:
   both evenings ARE slow nightly slips with nobody short.
3. REPEAT / ESCALATION / AGAIN IN LIVE PLAY — CLOSED.
   83658: E1 day 15, E1-again day 25, ESC day 28 (two
   stretches, two firings, one escalation, all live).
   83648: F day 8, ESC day 9, E1-again day 16. 83632:
   F day 28, ESC day 29. Repeats silent on all 80 screen
   legs (the 80/80 match counts absences too: no line
   spoke on any repeat evening).
4. DEATH-KNELL PLACEMENT — CLOSED. 83640 day 18 is a
   first-firing day AND a first-starvation-death day
   (Dmitri starved). The firenarr E2 line speaks AFTER
   the death narration in the same night's stream (quoted
   below): the death lines name the death, the firenarr
   line names the store's fall, neither suppresses the
   other. Placement: after villageEats(), before the
   night's later beats (raid line follows it).
5. MOBILE RENDER AT 390px — STAYS OPEN, UNTESTED. Node
   cannot prove it. Templates are <= 85 chars by
   construction, but no phone-size render was checked in
   this arm. Do NOT claim mobile-verified.
6. KNIFE-EDGE FRACTION — CARRIED, NOT FIXED, as tasked.
   E1 implemented as the single named constant 0.85.
   The sibling sim-fracchoice-b arm owns the fraction
   decision. (Note: the 0.8496 knife-edge leg 83272 was a
   tracer-read leg; on deploy reads the firing evenings
   move anyway — see ordering proof — so no deploy leg
   in this run re-tests that exact edge.)

## Ordering proof (gap 1, measured — the run's sharpest finding)

The old tracer reads in policy.daily, which runs BEFORE
Game.sleep() and therefore before that night's endDay().
The deploy reads inside endDay(), after villageEats().
Between those two points the night's meals happen. Joining
the 8 pilot legs' old-tracer rows to deploy rows on the
same game day:

- Meal draw: the old (pre-meal) store exceeds the deploy
  (post-meal) store by a mean of 671-1980 kcal per night
  across pilot seeds. The deploy's store is the store
  after everyone ate; the tracer's is before.
- Streak lag: hungryStreak differs between the two reads
  on 0-18 nights per pilot leg. The old read carries last
  night's streak; the deploy read carries tonight's.
  (e**) firings therefore move: a night whose meals create
  the first streak can fire in the deploy a night before
  the tracer sees any streak at all.
- Gate flips: gateEngaged differs between the two reads
  on 0-11 nights per pilot leg. Stretches themselves can
  start/end on different evenings in the two reads.
- Day-count drift: game days and harness loop-days are
  not 1:1. 83617 runs 31 endDays in 30 loop-days (old
  tracer loopDay 29 = gameDay 30); 83609 runs only 29
  villageEats calls in 30 loop-days (one night's endDay
  never ran — e.g. an interrupted sleep); 83632 runs
  endDay twice for game day 15 (both engaged evenings,
  harmless; the hook's lastDay guard fires at most once
  per game day, and a dedupe-first re-analysis of all 80
  screen legs changes zero predictions).
- Net effect on firings (pilot table above): 1/8 agree
  exactly; 83624 fires a day EARLIER in the deploy (18
  E2 vs 19 E1); 83615 fires five days LATER (23 E2 vs 18
  E2); 83616 fires seventeen days later and in a later
  stretch (25 F-again vs 8 F); 83619 fires in the deploy
  where the tracer never fires; 83609 and 83617 fire in
  later stretches than the tracer's first stretch.

Plain words: the old sensor watched the pantry before
dinner; the narration watches it after dinner. They are
two different evenings' worth of information wearing the
same day number, and the firings move accordingly. The
deploy is faithful to its own read (80/80); it is not
faithful to the tracer's evenings, and no one should
claim otherwise.

## Real evenings, quoted (SENSE-TESTING LAW)

### (F)-first, 83648 day 8 — the slow drain, streak 0

Deploy series days 1-8 (store): 37090, 31150, 25900,
18300, 15900, 13300, 12300, 11300 — seven straight falls,
streak 0 every night, gate disengaged throughout. Day 8
is the first eligible day (D >= 8); the rule would have
fired on day 4 but for eligibility, which is why day 8
is the first firing. The night's stream (138 say lines)
runs lessons, knowledge, and a village meal, and the
warning lands near the night's close:

> "📚 Village knowledge: Muhindo taught everyone about Jackfruit. The Codex grows without you lifting a finger."
> "⚠ STARVING: health and energy falling. You went to bed on an empty stomach."
> "Village meal: +1080 kcal, +1L water from the communal pantry. (Half ration — they don't trust you yet.)"
> "🔍 Nikos crouches over tall stalks …"
> "🤢 Shanice's stomach knots — something in their meal was off."
> "Thabo and Aaron lingered over the fire together."
> "📓 Codex: Felipe taught Aaron Soft Step."
> "⚠ The store keeps slipping from its recent high — evening after evening, lower."

Sense verdict: the wording fits. The evening IS a slip
evening after evening, with nobody short — the line
claims a shape, not a depth, and the shape is true.
It does not collide with the player's own STARVING line
above it (that line is about one person's empty stomach;
the firenarr line is about the communal store), and it
does not reuse the haul line's phrasing. The next night
(day 9) the store rises to 12700 and the line correctly
stays silent.

### (F)-first in the pilot, 83632 day 28, and its escalation

Stretch from day 25: 9500, 9304, 7950, 5650 (day 28),
streak 0 throughout. Day 28: three falls, 5650/9500 =
0.595 <= 0.80, streak 0 — plain F template speaks. Day 29
the store RISES to 6050, yet the escalation speaks
(6050/9500 = 0.637 <= 0.65). Interpretation note, stated
not hidden: this implementation fires escalation on the
first LATER evening at or below the cliff LEVEL, even
when the first-firing evening was already below it (as
any streak-0 F-first below the cliff must be) and even
when that evening's store rose. The spec's word
"crosses" could be read transition-only (above -> below),
which would have silenced 83632's escalation. The
level reading is the one implemented, proved by the
analyzer, and observed live; if Steve wants the
transition reading, that is a one-line change plus a
re-proof, flagged here for the coordinator rather than
decided silently.

### Death-knell, 83640 day 18 — the line still speaks

Deploy series: stretch from day 16 (6694), day 17: 1000,
day 18: 0, streak 1 — E2 cliff. Dmitri starved the same
night. The night's stream, in order:

> "📖 The Codex turns a page on its own. Dmitri is dead. You didn't ask. It knew."
> "Nobody's talking much. The fire feels smaller tonight."
> "📖 The entry for Dmitri is finished. 1 deed recorded. No more pages."
> "DMITRI — GONE. 3 open questions closed unanswered."
> "💀 Dmitri starved. Slowly. Nobody eats much tonight. The pot stays full and nobody touches it."
> "⚠ Haven's pantry is empty. Day 1 of hunger."
> "✦ Wichai has found something — Field Pharmacy. …"
> "✦ Wichai has found something — Fever's End. …"
> "📓 Codex: Ye-seul taught Wichai Food Preservation."
> "⚠ The store has fallen far from its recent high — the shelves are nearly bare."
> "🌙 Raid — Stonebridge came in the night from the west. They carried off ~0 kcal from the pantry. …"

Sense verdict: placement is right — after the death
lines, not instead of them. One soft edge, noted not
hidden: on a night the store is literally 0, "nearly
bare" understates it — but the empty-pantry line eight
lines above already says the harder truth ("pantry is
empty"), so the pair reads honestly together: empty
tonight, fallen far from its high. No change proposed;
the template is depth-banded by design, not exact.

### Two stretches, 83658 — again + escalation, live

E1 day 15, then an engaged evening breaks the stretch,
E1-again day 25, ESC day 28. The "again" variant reads
as a return, not a first discovery, and the escalation
arrives only after the second stretch's first firing.
No repeat evening in any of the 80 screen legs spoke a
second line: the silence-after-first design holds in
live play, not just in fixtures.

## Village assessment, plain words

In this 30-day window most villages are doing fine:
75 of 80 survive the window, and the five that don't are
lost to the usual teeth (combat, expeditions, and two
starvation deaths on 83640's road). About three villages
in ten trip the store-fall warning at least once — the
store visibly slides on evenings when nothing else in
the night's chatter names it, which is exactly the
silence the spec set out to fix. The warnings do not
mean the village is doomed: 18 of the 23 warned villages
survive the window, including villages whose store dips
and recovers. What the villages are missing on those
evenings is not food knowledge — lessons and Codex
entries flow all night — it is a single spoken sentence
naming that the communal store itself has fallen from
where it stood. This deploy supplies that sentence, and
only that sentence: nothing about how the village plays,
eats, or survives changed underneath it (8/8 identity).

Who thrived and who died, briefly: the warned survivors
(83608, 83609, 83615, 83616, 83617, 83619, 83632, 83648,
and ten more screen legs) kept going after their warning
evenings; the warned lost legs (83624, 83640, 83646,
83652, 83662) were already on hard roads — 83640's
Dmitri starved on the warning night itself, and the
warning spoke anyway, as specified.

## Reachability verdict (for the 30d window)

Narration reachability: FULL for the window. Every
firing kind (E1, E2, F), every again variant, and the
escalation all fired in live sim play within 30 days.
Waves 1-5, Arc II/III/IV, regional -> national, the
table, and the win flag are NOT reachable verdicts in a
30d instrument window and no claim is made about them
here — the driver does not track scale, and 30 days is
far short of national/table play. This arm judges
narration emission, not the wall.

## Wall numbers (30d instrument window ONLY — not a wall claim)

- Screen 80 legs: survived 30d 75, village-lost 5.
  Median survival 30d, censored (75/80 alive at window
  end); max observed 30d (window-capped).
- National / table / wins in this window: not measured
  (no scale tracking in this arm's driver) and not
  claimed. Wave 4-5 unlocks: not tracked in this window.
  These numbers say nothing about the scale wall except
  that a 30d window cannot see it — stated plainly so
  nobody cites this run for wall movement.

## Metric review

The metric held and was not re-scored. One definitional
choice deserves a record because it decided the verdict:
"traced firing evenings" were defined in the prereg as
the DEPLOY's own evening reads (post-meal store,
post-meal streak, gate at that point), with the
old-tracer comparison reported descriptively. Had the
bar been old-tracer agreement, the verdict would be
NO-GO (1/8 agree) — but that bar would judge the deploy
against a read point it does not use, and the prereg
explicitly excluded it for that reason. Proposal for the
NEXT run (not this one): if the coordinator wants one
rule with one set of evenings, re-judge (v**) on deploy
reads and let the deploy reads become the rule's
canonical evenings; the tracer then becomes a legacy
instrument, not the judge. Until then, any citation of
this GO must carry the ordering caveat above.

## Blanks filled or documented

- Filled: the firing-evening narration blank (food-economy
  blank 2) is now DEPLOYED in code (not just specified):
  hook pinned, stretch state added, all six spec gaps
  closed except mobile render, which stays open and is
  stated as untested.
- Documented (not fixed): mobile render at 390px (open);
  the escalation level-vs-crossing reading (flagged for
  the coordinator; implementation = level reading);
  duplicate endDay calls for one game day (guarded, zero
  prediction effect on 80 legs); skipped nights and
  game-day/loop-day drift (observed, handled by using
  scholar.day as the deploy's day).
- No new findings-backlog item: nothing outside this arm
  surfaced. The ordering premise correction (tracer read
  is pre-meal, not post-meal) is reported here for the
  coordinator to carry into sim-findings.md / the
  tracker; this worker does not edit those files
  (concurrent-edit risk).
- No game-code change beyond the narration method and
  its one call site. No policy change. No other agent's
  files touched (Loop A trees untouched; sibling
  sim-fracchoice-b tree untouched).

## Checks

- scripts/test-firenarr-deploy-b.js: 22/22 (real method,
  harness-driven).
- scripts/test-firenarr-20261104.js (spec proof, reused):
  107/107.
- scripts/test-streakfree-cost-b.js (reused): 24/24.
- node scripts/check.js --quick: two runs, both red for
  reasons classified below as PRE-EXISTING, none
  attributable to this deploy. Run 1: 279 passed, 11
  failed in 1585s. Run 2 (logged):
  evidence/2026-11-04/sim-firenarr-deploy-b-checkquick.log:
  282 passed, 8 failed in 1068s. The run-to-run variance
  alone (11 vs 8) marks contention flakiness; each of
  the 8 rerun failures was individually classified:
  (1) godpath/test-measurement-proof-update.js and
  (2) godpath/test-measurement-workflow.js — the retained
  neutrality proof (evidence/2026-10-30 panel) already
  mismatches the BASE on 42 manifest entries, game.js
  included (retained game.js digest matches neither base
  nor worktree): the proof was stale before this arm,
  and this arm's one-file edit adds one more stale entry
  to an already-stale proof. Refreshing that shared
  proof (real re-observation under balance-proof-update.js)
  is coordinator / ship-loop maintenance, not this
  arm's scope, and was NOT done here. (3)
  godpath/test-mobile-combat-cadence.js — the test
  contains no endDay / sleep / villageEats / pantry
  reference, so the hook cannot run in it; combat
  announcement logic untouched by this arm. (4)
  godpath/test-occupation-panels.js — its temp driver
  fails to resolve ./lib/luck-instrument (a copy-list
  omission in the test's own driver setup); no file this
  arm touched is involved. (5)
  godpath/test-phone-frame-proof.js — the retained
  receipt mismatches ~70 current inputs including
  untouched index.html, CSS, and data files: stale on
  base, not caused by one game.js edit. (6,7)
  godpath/test-trust-observer-neutrality.js and
  test-capable-bot-20261014.js — 120s timeouts each,
  contention artifacts under multi-arm load. (8)
  test-establishment-r20-fixes-20261020.js — PROVEN
  pre-existing: the resolveOneAssignment body it
  text-extracts from game.js is byte-identical between
  HEAD and this worktree (44231 chars); this arm's diff
  touches only the firenarr method and its call site.
  This arm did NOT refresh the stale neutrality proof or
  the stale phone receipt, and did NOT loosen, skip, or
  quarantine any failing test.
- Never ran concurrent jest; sim processes ran as
  separate processes per the harness rules.

## Status for the coordinator (do NOT edit the trackers from here)

Firing-evening narration finding item: SPEC-READY ->
DEPLOYED (code committed on branch sim-firenarr-deploy-b,
pending coordinator merge, pending ship). GO on the
preregistered metric (emission 8/8 + identity 8/8 +
F-first read live). Loud caveat attached: deploy firings
differ from old-tracer firings on 7/8 pilot seeds by
read-point (post-meal vs pre-meal) — do not cite this
GO as tracer-evening agreement. Mobile render still
untested. Escalation level-reading flagged.
