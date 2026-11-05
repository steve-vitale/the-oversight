# sim-upkeepbf52-a — adjudication: UPKEEP BREAKFAST 17021/52 is NARRATED (capture artifact, closed)

Run: oversight-flesh-out-loop, run fleshout-20261105T0115Z, arm
sim-upkeepbf52-a, axis food-economy. Worktree sim-upkeepbf52-a.
Measurement on current master; NO game-code change, NO policy
change, NO hook landed, NO gate/price/deed-bar/win-price change.
Zero src/js. Sibling trees never touched; main tree never
touched; hidden_files never touched (coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness
for the instrument + adjudication record only.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-upkeepbf52-a-prereg.md (commit
271ca4840). Pinned base: c498e05ff (worktree HEAD at prereg
writing time). Instrument commit 271ca4840 (adapted
full-transcript sweep + pack-pinned lib/analyzer + proof test,
24/24 pure green before any judged sim).

The prereg's ONE adaptation, disclosed before any judged sim:
the 2115Z arm's exact-chain rule (pack drop == kcal gain)
disqualifies the 17021/52 case by construction (pack drop 270
!= kcal gain 2182, because competentEat's pantry draws add
1912 kcal inside the same upkeep window). The primary verdict
therefore uses a PACK-PINNED rule — first-upkeep stacks ->
daily-start stacks, with the daily-entry morning phase running
AFTER the daily-start snapshot, so only the upkeep window can
have removed the grapes. The exact-chain verdict is still
computed and reported for every window, but it does not gate
the primary verdict.

## Verdict: NARRATED on both legs — finding CLOSED as a capture artifact

| leg | primary window (morning loop-day 53 / scholarDay 53) | verdict |
|---|---|---|
| guard (WOODWARM=0) | first-upkeep kcal 128, 3x Muscadine Grapes intact (spoilDay 56) -> daily-start kcal 2310, pack edible 0; morning phase ate=false, skip 'no-pack-food' | NARRATED, named |
| ON (WOODWARM=1) | identical chain, identical window | NARRATED, named |

No leg split. The reproduction matches the substrate arm's
numbers exactly on both legs (128 -> 2310, 270 grapes, spoilDay
56, 'no-pack-food'), so this is the same case, not a lookalike.

The quoted evidence, the FIRST line of the loop-day 53 upkeep
window on both legs:

"You eat Muscadine Grapes (270 kcal)."

That is the engine's own meal beat (`Game.eat()`), naming the
exact food and the exact kcal of the finding, spoken in the
upkeep window itself — before anything else that morning. The
daily lines for that morning contain no eat line (dailyEatLines
[]), which is correct: the eating happened at upkeep, and the
daily-entry morning phase honestly records ate=false /
'no-pack-food' because the pack was already empty. The
"silence" was never in the game; it was in bankfood-trace-b's
capture, which recorded say lines only around daily() and
never saw the upkeep window. This is the same closure as the
2115Z arm's 16505 instance, now confirmed for the second,
independent instance.

## Sense test (law — read end to end)

The loop-day 53 morning's upkeep window, quoted, not
summarized away. It opens with the grape meal, then works
through the pantry draws one by one, each narrated:

"You eat Muscadine Grapes (270 kcal)." / "Your chewing
echoes off the trees. Something out there heard.
(encounters more likely tomorrow)" / "Hunger gnaws. The pack
is thin — work the green, haul it back, get it named at
camp. That's the whole game." / then, repeated per dried
blackberry drawn from the pantry: "Took Blackberry (dried)."
/ "You chew the Blackberry deliberately — the way you were
taught. Bitter, working. (+2 health)" / "You eat Blackberry
(52 kcal)." / ... / "Need a fire to boil water." / "Drank
clean water." / ... / "Your chewing echoes off the trees.
Something out there heard. (encounters more likely tomorrow)"

The whole kcal jump is spoken, line by line: 270 grapes +
37 x 52 blackberry draws = 270 + 1924 = 2194, against the
measured gain 2182 (the 12 kcal difference is the morning's
other upkeep costs inside the same window — metabolism ticks
between the calls — and does not touch the verdict: the
grape line itself is exact). A player opening the day sees
what was eaten, by name, with the kcal, before any of the
day's other business. The morning phase says nothing about
breakfast because breakfast already happened and was already
spoken one window earlier. There is no second, hidden
silence here.

## Secondary: additional pack-pinned upkeep meals in the same corpus

Screened corpus: seed 17021, both legs, all 60 morning windows
per leg. Pack-pinned meals = pack edible drop > 0 across the
upkeep window.

| leg | windows | pack meals | NARRATED | SILENT | exact-chain | pantry-mixed |
|---|---|---|---|---|---|---|
| guard | 60 | 29 | 29 | 0 | 8 | 21 |
| ON | 60 | 29 | 29 | 0 | 8 | 21 |

Combined: 58 pack meals, 58 narrated, 0 silent. Excluding
the primary, 28 additional meals per leg, all narrated.
The away-wake subset is narrated too: the primary (thicket,
wakeInsideHaven false) and loop-day 31 (wakeInsideHaven
false, haven tile) are both NARRATED. The chain split is
reported, not hidden: 21 of 29 meals per leg are
pantry-mixed (kcal-chain-inexact), exactly the shape the
prereg's pack-pinned rule was built for — and every one of
them carries upkeep eat lines. No silent upkeep meal exists
anywhere in this corpus.

## Why the bankretain arm saw silence (root cause, unchanged)

`bankfood-trace-b.js` captures say lines only around `daily()`
and stores full day lines only on bankfood-evening rows.
Upkeep calls run outside `daily()`, so the window where
`competentEat` speaks the meal beat was never recorded. The
filed blank ("the meal is visible only as a kcal jump") was
read off a corpus blind to that window. This instrument was
built to close that blind spot, and it closes the blank with
it: the kcal jump and the narration line are the same event,
and both are present — for 16505 (2115Z arm) and now for
17021/52 (this arm).

## Consequences, stated plainly

- NO hook spec is written: the decision rule's SILENT branch
  did not fire. A narration hook here could only duplicate
  an existing line, not fill a blank.
- NO hook arm should be spawned from this finding. The
  finding is closed, not carried forward.
- NO prereg shape with a GO threshold was needed: this is a
  single-case adjudication, and either verdict completes the
  arm per the prereg. No 8-seed pilot and no 12-16 confirm
  spend apply (no lever exists to pilot); running extra seeds
  would manufacture activity, not evidence.
- Panel note (§15): scripts/balance-panel.js cannot express
  the nighttravel+woodcarry+woodwarm strand stack, the 60-day
  morning-window census, or an env-gated single-case
  adjudication (same declaration as every prior strand arm).
  Comparison here is guard-vs-ON legs on identical seeds
  through the bf52 analyzer, never labeled a panel
  comparison. No game-code change was made, so no panel
  comparison was owed.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — upkeep pantry-draw narration is
  VERBOSE, not silent — the loop-day 53 morning repeats the
  "Took Blackberry (dried) / chew / You eat Blackberry
  (52 kcal)" triplet 37 times in one upkeep window. Every
  draw is narrated honestly, but a player scrolling that
  morning meets a wall of identical lines before the day
  starts. Whether that repetition wants collapsing (one line
  per food per morning, with a count) is a UI/narration
  design question, not a silence bug — and it is NOT a hook
  for this arm (sim-upkeepbf52-a).
- [open] 2026-11-04 — upkeep kcal arithmetic inside a mixed
  window does not foot exactly — loop-day 53: grapes 270 +
  37 blackberry draws at 52 = 2194 spoken kcal vs 2182
  measured gain, a 12 kcal gap from metabolism ticks inside
  the window. No narration is missing; the gap is
  bookkeeping across upkeep calls, named here so a future
  ledger arm does not re-file it as a silence
  (sim-upkeepbf52-a).

## Metric review (for the NEXT run, never mid-run)

- The pack-pinned rule is validated by this run: it judged
  the case the exact-chain rule could not, without changing
  any verdict the exact-chain rule would have given (all 8
  exact-chain meals per leg are also pack-pinned and also
  narrated; the 21 pantry-mixed meals per leg are pack-pinned
  and narrated too). Any future narration prereg for a
  pantry-mixed morning must use the pack-pinned rule, not the
  exact-chain rule — the exact-chain rule is the wrong
  instrument once pantry draws enter the window.
- The verdict definition (upkeep-window eat lines only;
  daily lines quoted but never counted) is validated a
  second time: it found the line exactly where the eating
  happens and correctly refused to credit the daily window,
  which honestly says nothing because the pack was empty.
- The 2115Z arm's "browser-transcript-placement" caveat
  still stands and is NOT re-litigated here: node sims prove
  the line is SPOKEN via `Game.say`, not where it lands in
  the phone transcript surface. If Steve still perceives a
  gap, it must be filed as a browser-transcript-placement
  question with its own substrate, not as a continuation of
  this silence finding.

## Proof and files

- scripts/test-upkeepbf52-a.js: pure 24/24 before any judged
  sim; corpus mode 31/31 on the guard corpus and 31/31 on
  the ON corpus (24 pure + 7 corpus each: loopDay 53 window
  present, first-upkeep 128, pack meal 270 grapes,
  daily-start 2310, morning phase no-pack-food, verdict
  computed — never asserting WHICH verdict).
- scripts/upkeepbf52-a-lib.js, sweep-upkeepbf52-a.js,
  analyze-upkeepbf52-a.js: `node --check` clean.
- Corpora committed with this note:
  evidence/2026-11-04/sim-upkeepbf52-a-corpus-guard/
  evidence/2026-11-04/sim-upkeepbf52-a-corpus-on/
  (each: upkeepbf52-a-s17021.json; survived, 60 days, 240
  events, 60 first-upkeeps, bfErrs 0, sayTotal 6313; the two
  files differ only in the recorded leg field — every
  analyzed verdict is identical across legs).
- Check-quick NOT run: this commit touches zero src/js files
  and adds no green-list entries (the new scripts are
  standalone instrument code, imported by nothing in the
  test list), so no green-list movement is possible from it.
  No claim is made that the green list was re-run.
- Instrument correction disclosed: during proof, one pure
  check caught a real lib bug — a missing daily-start pack
  snapshot was counted as "all food lost," inventing a meal
  from missing data. Fixed before the prereg commit (missing
  snapshot = unknown, never a meal); the proof is 24/24 with
  the fix, and the fix is in the committed instrument.
- Index-clobber note (AGENTS.md class, third-sighting
  pattern): after the prereg safe-commit, the worktree index
  showed all 5 committed files staged-as-deleted plus
  untracked. Repaired with `git update-index --add
  --cacheinfo` from HEAD blobs; verified `git status`
  empty + `git diff HEAD` empty before running judged sims.
  The commit itself was correct throughout.
- Pinned base for this adjudication: c498e05ff; prereg +
  instrument commit 271ca4840.
