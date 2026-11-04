# sim-upkeepbreakfast-a — Phase 2 verification gate: NO-GO for the hook as scoped (the silence is not real on either base)

Run: oversight-flesh-out-loop, arm sim-upkeepbreakfast-a, axis
food-economy. Worktree sim-upkeepbreakfast-a. NO game-code change,
NO hook landed, NO prereg written, NO judged pilot run — for the
reason below, each of those would have presumed a deficit that does
not exist. Sibling trees never touched; main tree never touched;
hidden_files never touched (coordinator owns the backlog/tracker/
claims). Nothing is pushed, bumped, or live-verified by this worker
(coordinator merges via --ff-only); report 'merged locally, pending
ship' readiness for the instrument + verification record only.

## The gate, as briefed

Phase 2 was conditioned on re-verification: rebase onto master
(exphurt-land-a merge + journey-scale r97), then verify the
instrument still reproduces the upkeep-breakfast silence on the new
base, THEN write the binding prereg and run the pilot. This file is
the record of that gate step. The gate FAILED — not because the
instrument broke, but because there is no silence to reproduce, on
either base.

## Rebase

- Phase 1 base: f7c49968a. Phase 1 instrument commit cb4cb48bf.
- New master: 570daa9c5 (exphurt-land-a evidence + corpus: GO LAND;
  hook 16f2c0640; prereg 1a715818b) which includes 014e2f758
  (journey-scale r97). Rebase completed clean, zero conflicts:
  instrument commit is now a701f75be on top of 570daa9c5.
- The two Phase 1 reproduction corpora (guard, ON) survived the
  rebase as untracked files and are committed with this note.

## Re-verification on the new base (seed 16505, 60d, BANKFOOD=1, guard leg)

Corpus: evidence/2026-11-04/sim-upkeepbreakfast-a-corpus-guard-postmerge/
upkeepbreakfast-a-s16505.json. Run summary identical to Phase 1:
survived, 60 days, 240 events, 60 first-upkeeps, bfErrs 0,
sayTotal 6758. The post-merge corpus is BYTE-IDENTICAL to the
Phase 1 guard corpus (`cmp` clean) — the exphurt merge and r97
changed nothing about the upkeep breakfast.

| measure | Phase 1 guard (f7c49968a base) | Post-merge guard (570daa9c5 base) |
|---|---|---|
| Morning windows | 60 | 60 |
| Chain-qualifying upkeep meals | 2 | 2 |
| NARRATED | 2 | 2 |
| SILENT | 0 | 0 |
| W61 (ld60/sd61) chain | 344 -> 884, eaten 540, grapes | identical |
| W61 narration | "You eat Muscadine Grapes (540 kcal)." | identical |
| ld28/sd28 meal | 785 kcal, Blackberry + Grapes, NARRATED | identical |

The substrate chain reproduces verbatim on the new base: first-upkeep
kcal 344 with 540 kcal Muscadine Grapes intact -> daily-start kcal
884, pack 0, morning phase ate=false, skip 'no-pack-food'
(884-344=540, exact). And the meal IS narrated, in the upkeep window
itself, by the engine's own meal beat (`Game.eat()`,
src/js/game.js:27629: `You eat <meal> (<kcal> kcal).` when ate > 0).

## Sense test (law — read end to end)

The loop-day 60 morning's upkeep lines, quoted, not summarized away:

"You eat Muscadine Grapes (540 kcal)." — then, in the same upkeep
window: "Hunger gnaws. The pack is thin — work the green, haul it
back, get it named at camp. That's the whole game." / "No risky
water to boil." / "Drank clean water." / "Equipped Rage Bindings
(hands)." / "Nothing edible. (Gray Squirrel (trapped) — not food
yet: Gut it quickly — clean with a knife. Spoils in ~2 days..)" /
"Equipped Work Gloves (hands)."

The meal line is the FIRST line of the morning's upkeep window: a
player opening the day sees what was eaten, by name, with the kcal,
before any of the day's other business. The daily lines for that
morning contain no eat line (dailyEatLines []), which is correct —
the eating happened at upkeep, and the daily-entry morning phase
honestly records ate=false / 'no-pack-food' because the pack was
already empty. There is no second, hidden silence here: the phase
record says nothing because there was nothing left for the phase to
eat, and the meal itself was already spoken one window earlier.

## Why the bankretain arm saw silence (root cause, unchanged)

`bankfood-trace-b.js` captures say lines only around `daily()` and
stores full day lines only on bankfood-evening rows. Upkeep calls run
outside `daily()`, so the window where `competentEat` speaks the meal
beat was never recorded. The filed blank ("the meal is visible only
as a kcal jump") was read off a corpus blind to that window. This
instrument was built specifically to close that blind spot, and it
closes the blank with it: the kcal jump and the narration line are
the same event, and both are present.

## Verdict: VERIFICATION-GATE NO-GO (hook premise fails)

| gate leg | bar | result |
|---|---|---|
| Instrument survives rebase | proof green on new base | PASS — 44/44 corpus mode on the post-merge corpus; `node --check` clean on all 4 scripts |
| Silence reproduces on new base | >= 1 qualifying SILENT morning (the 16505 case) | FAIL — 0 SILENT on both bases; the 16505 case is NARRATED on both |
| Hook prereg warranted | baseline deficit exists to fix | NO — baseline is 2/2 narrated; a narration hook could only duplicate an existing line, not fill a blank |

Consequences, stated plainly rather than papered over:

- NO prereg was written. The suggested prereg shape (GO >= 0.80 of
  qualifying meals carrying a line) is vacuous against a 2/2-narrated
  baseline and must not be reused without a re-scoped deficit.
- NO pilot (8 seeds) and NO confirm (12–16) were run. There is no
  judged comparison to make: before/after on identical seeds would
  compare an already-narrated baseline against a hook that adds a
  second line for the same meal. Running it would manufacture
  activity, not evidence.
- NO hook was written and no `[needs-eyes]` commit exists, because
  there is nothing player-facing to change.
- The player-away question posed for the prereg is moot for this
  meal: the 16505 case wakes away from haven (insideHaven false,
  forest_floor, map 8,2) and is still narrated, because the scholar
  IS the player character in the field. The exphurt "player away
  gets no line" rule concerns other villagers' returns, a different
  mechanism, and must not be imported here without a code reason.

## Recommendation to the coordinator

Close the "UPKEEP BREAKFAST IS SILENT" backlog item as a
measurement artifact, citing this note + the Phase 1 report: the
meal was always narrated; the instrument that filed the blank
could not see upkeep lines. Do NOT carry this arm forward as a
hook task.

If Steve still perceives a gap here, it must be re-scoped as a NEW
question, not a continuation of this one: node sims prove the line
is SPOKEN via `Game.say` (the one text stream), but they cannot
prove where the line lands in the phone transcript surface or
whether a player scrolling a long morning notices it. That is a
browser-transcript-placement question requiring a browser proof,
not a sim narration hook — and it should be filed as such, with
its own substrate, rather than re-running this arm.

## Metric review (for the NEXT run, never mid-run)

- The Phase 1 instrument's verdict definition (upkeep-window eat
  lines; daily lines quoted but never counted) is validated by this
  gate: it found the line exactly where the eating happens and
  correctly refused to credit the daily window.
- The exact-chain qualification rule is validated twice over: the
  7 kcal-chain-inexact mornings (pack eaten, kcal gain larger —
  pantry/feast top-ups inside upkeep) are honestly excluded, and
  the 2 qualifying mornings are exact on both bases.
- The suggested GO >= 0.80 prereg shape must be retired for this
  question: a threshold that the unmodified baseline already
  exceeds (2/2 = 1.00) cannot judge a fix. Any future narration
  prereg must first demonstrate a baseline below its bar.

## Proof and files

- scripts/test-upkeepbreakfast-a.js: pure 32/32; corpus mode 44/44
  on the post-merge corpus (guard leg). ON-leg corpus mode 44/44
  on the Phase 1 corpus (unchanged scripts, rebased commit).
- scripts/upkeepbreakfast-a-lib.js, sweep-upkeepbreakfast-a.js,
  analyze-upkeepbreakfast-a.js: `node --check` clean.
- Corpora committed with this note:
  evidence/2026-11-04/sim-upkeepbreakfast-a-corpus-guard/
  evidence/2026-11-04/sim-upkeepbreakfast-a-corpus-on/
  evidence/2026-11-04/sim-upkeepbreakfast-a-corpus-guard-postmerge/
  (each: upkeepbreakfast-a-s16505.json).
- Check-quick NOT run: this commit touches zero src/js files and
  adds no green-list entries (the new scripts are standalone
  instrument code, imported by nothing in the test list), so no
  green-list movement is possible from it. The standing set on
  this base is 284 passed / 6 failed per the exphurt merge commit
  (570daa9c5); nothing here changes that set, and no claim is
  made that it was re-run.
- Pinned base for this verification: worktree HEAD a701f75be
  (instrument) on master 570daa9c5 at re-verification time.
