# sim-bankadded-substrate-a — BANK-ADDED edible retention: NO-GO-NON-UNANIMOUS (6 retained / 8 VANISHED, mechanism traced)

Run: oversight-flesh-out-loop, run fleshout-20261105T1041Z, arm
sim-bankadded-substrate-a, axis food-economy. MEASUREMENT/
DIAGNOSIS ONLY: no game-code change, no policy change, no
win-price / deed-gate / food-number change. Zero src/js.
Prereg: `evidence/2026-11-05/sim-bankadded-substrate-a-prereg.md`
+ `sim-bankadded-substrate-a-prereg-addendum.md` (instrument
fix, both committed BEFORE any judged full-band sim). Probe
policy: `scripts/policies/bankadded-probe-diag.js`; driver:
`scripts/bankadded-probe-trace-b.js`; analyzer:
`scripts/analyze-bankadded-probe.js`; proof:
`scripts/test-bankadded-probe-a.js` 58/58 green (re-run green
after the rebase onto master 45c134fab). Census corpus:
`evidence/2026-11-05/sim-bankadded-substrate-a-corpus/` (8
files, seeds 17025, 17029, 17051, 17059, 17060, 17063, 17064,
17073, 60d, guard-variant legs). Instrument errors: 0
(bankfood errs 0, probe errs 0) across the corpus.

## Blank

Loop A arm sim-bankadded-a (run fleshout-20261105T0515Z,
evidence/2026-11-04/sim-bankadded-a.md) screened 64 seeds and
found exactly 1 bank-mode evening in 64 seeds (seed 17063,
+325 kcal, RETAINED) — verdict INSUFFICIENT-DATA. This arm
gave the narrow bank-added case a substrate rich enough to
judge, per sim-findings.md: a probe-given-food leg that stages
a bank-added evening directly on any stranded evening (honest
advancer to the bank clock band + a recorded injection of a
fixed known-edible haul). The probe-given-food leg was chosen
over the bank-screened band because a screen IS a full 60d sim
per seed, and at ~1 bank-mode evening per 64 seeds a screened
band would need ~200 seeds with high variance. This arm is a
RE-DISPATCH: the first worker died at 11:19:51Z on a platform
transport error with no committed work; the re-dispatched
worker wrote the prereg from the same brief.

## Verdict — NO-GO-NON-UNANIMOUS (14 distinct judged events)

The pre-registered GO bar was >= 3 distinct judged bank-band
added events with a UNANIMOUS retention verdict. The probe
band delivered 14 distinct judged events (13 staged + 1
genuine), 0 censored — the bar's count is met many times
over — but the verdicts split 6 retained / 8 VANISHED, so
unanimity fails and the verdict is NO-GO-NON-UNANIMOUS by
the prereg's binding rule. The bar is not re-scored. What the
split MEANS is traced below: the 8 VANISHED are not food
vanishing overnight. They are food eaten as a morning meal by
a hungry scholar BEFORE the instrument's "first-upkeep"
snapshot fires, in the sleep-refused path — a snapshot-timing
artifact, not a retention failure. The evidence for that
reading is exact (see "Mechanism"), and the metric review
proposes the snapshot fix for the next run. No game bug is
claimed; the game behaved correctly throughout.

## Yield tables

Primary band (8 seeds, the screen-stranding seeds): 31
stranded evenings, 13 staged events, 1 genuine event, 0
press-added events, 0 censored. The per-seed cap (first 2
probe-produced events per seed) bound 6 of 8 seeds.

| seed | days | end | stranded | staged | genuine | judged | retained | vanished |
|---|---|---|---|---|---|---|---|---|
| 17025 | 60 | survived | 6 | 2 | 0 | 2 | 2 | 0 |
| 17029 | 60 | survived | 2 | 0 | 0 | 0 | 0 | 0 |
| 17051 | 60 | survived | 1 | 1 | 0 | 1 | 1 | 0 |
| 17059 | 60 | survived | 5 | 2 | 0 | 2 | 0 | 2 |
| 17060 | 42 | village-lost | 3 | 2 | 0 | 2 | 1 | 1 |
| 17063 | 60 | survived | 3 | 2 | 1 | 3 | 1 | 2 |
| 17064 | 60 | survived | 7 | 2 | 0 | 2 | 0 | 2 |
| 17073 | 35 | village-lost | 4 | 2 | 0 | 2 | 1 | 1 |
| total | — | — | 31 | 13 | 1 | 14 | 6 | 8 |

Judged events (seed/loopDay, kind, delta, verdict,
disposition, injected-stack identity):

| event | kind | delta | source | verdict | morning disposition | injected 18/18 at firstUpkeep |
|---|---|---|---|---|---|---|
| 17025/32 | staged | 720 | banked | RETAINED | morning-phase-eaten | yes |
| 17025/33 | staged | 720 | mixed | RETAINED-SPOIL-SWEPT | morning-phase-eaten | yes |
| 17051/11 | staged | 720 | banked | RETAINED | upkeep-eaten | yes |
| 17059/5 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17059/6 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17060/8 | staged | 720 | mixed | RETAINED | upkeep-eaten-unexact | yes |
| 17060/9 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17063/13 | genuine | 325 | banked | RETAINED | upkeep-eaten | n/a (press provenance) |
| 17063/14 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17063/15 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17064/6 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17064/7 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17073/31 | staged | 720 | banked | VANISHED | still-in-pack | no (0/18) |
| 17073/32 | staged | 720 | banked | RETAINED | upkeep-eaten-unexact | yes |

Flip-mode delta > 0 events (screen context only, never
counted toward the bar): 5 judged, 0 censored. No event of
any kind was censored. Every staged event landed its
injection (post-bank injected units 18/18 on all 13). No
press-added event occurred (the advancer's presses never
yielded edible food — the fine window never fired a
successful press; see below).

Non-events (stranded evenings that did not stage): seed
17029 staged 0 of 2 stranded evenings — loopDay 25: the
advancer's fine press returned null ("This patch is picked
clean" — the flip phase had already worked the patch; the
transcript narrates it), skip 'press-null'; loopDay 26: the
scholar was in combat after the evening phase, so the probe
returned early with no record. Both are honest non-events,
recorded in the corpus.

## The instrument fix (addendum, before the judged run)

The 1-seed pilot (seed 17063, old instrument) exposed a pure
instrument failure: honest waits CANNOT park the clock at
449. Engine code (src/js/game.js doAction): 'wait' ticks to
the NEXT day-part boundary (128-tick parts) and 'forage'
costs exactly 16 ticks — a wait from clock 275 lands at 384,
the next wait rolls the day. Pilot evidence, 17063 loopDay
14: 11 waits, 275 -> 128, skip 'wait-cap'. The fix
(addendum, committed before the judged run): the advancer is
now 'rest' (+96 ticks, 40 kcal) while the clock is below
416, 'forage' presses (+16 ticks, 60 kcal) in the 416–448
window where a rest would roll the day, with a day-roll
guard and an 8-action cap. Rest counts across the 13 staged
events: 0 rests on the 2 already-in-band evenings, 1 rest on
17059/5 (387 -> 483), 3 rests on 17073/31 (171 -> 459), 2
rests on the other 9. The press-added kind never fired.

Before/after proof (identical seed 17063, same env): the
pilot's genuine event reproduces EXACTLY under the fixed
instrument — loopDay 13, +325 kcal, RETAINED, disposition
'upkeep-eaten' — and loopDay 14 now stages (kind staged,
rests 2, 275 -> 467, delta 720, judged at the loopDay-15
morning), as the addendum required. The pilot corpus file was
replaced by the fixed-instrument full-band run (the pilot
copy is not evidence; the genuine event's reproduction is
the proof). The probe changed 17063's later trajectory
(bfEvenings 2 -> 3), as expected once staged food is eaten.

## Mechanism — why 8 events read VANISHED (traced, not guessed)

The 8 VANISHED are food eaten as a morning meal BEFORE the
first-upkeep snapshot, by the competent policy's dawn upkeep
eat, in the sleep-refused path. Four independent lines of
evidence converge:

1. THE EAT TRIGGER SPLIT IS EXACT. competentEat
   (scripts/policies/competent.js) eats from the pack while
   scholar kcal < 0.85 x kcalCap (baseline cap 2400, trigger
   2040). Evening kcal at the staged event, by verdict:
   RETAINED 2181, 2230, 2240, 2240, 2270, 2181 (ALL >= 2040,
   no pre-snapshot eat); VANISHED 0, 0, 0, 155, 165, 655,
   1328, 1510 (ALL < 2040, eat fires). A 671-kcal gap sits
   between the clusters (1510 vs 2181). No other mechanism
   in the night window keys off the scholar's evening kcal.

2. THE SNAPSHOT LANDS AFTER AN UPKEEP EAT WHEN SLEEP
   REFUSES. Sleep refuses when fewer than 64 ticks remain
   (TICKS_PER_BATCH 32 x 2; src/js/game.js sleep()): every
   bank-band evening (clock 449–483) refuses sleep. The day
   then rolls during the next loop-day's wait — AFTER upkeep
   #1 has run. Upkeep #1 runs competentEat (pack first). The
   first-upkeep snapshot fires at upkeep #2, after the eat.
   So in the refused path the "true post-sleep morning"
   snapshot is really "after the first dawn upkeep eat" —
   and a hungry scholar's meal is already gone from the
   pack when the snapshot fires.

3. NO OTHER PRE-SNAPSHOT PACK CONSUMER EXISTS in that
   window (code read): endDay's resolveDay burns scholar
   kcal (need 2200) but never touches the pack; villageMeal
   serves only at haven (the scholar is stranded away);
   cookPack needs a fire (stranded, no fire); sleep refused,
   so no sleep-loop meals. The only eater is the upkeep.

4. THE RETAINED EVENTS SHOW THE SAME MEAL, AFTER THE
   SNAPSHOT. All 6 retained events were eaten as a morning
   meal after the snapshot (dispositions: morning-phase-eaten
   2, upkeep-eaten 2, upkeep-eaten-unexact 2) — the food
   survived the night and was eaten at dawn, which the prior
   arms' adopted accounting counts as retained, not
   vanished. The vanished events' food met the same fate one
   upkeep call earlier. The morning dispositions confirm the
   shape: vanished events read 'still-in-pack' (nothing left
   for the morning phase to eat — it was already eaten).

What the food's fate actually was, in plain words: a hungry
scholar (under ~2000 kcal at bedtime) eats the banked food
at dawn before the instrument looks; a full scholar (over
~2100) leaves it for the snapshot to see, then eats it
anyway. In all 14 judged events the evening-added food was
either present at the snapshot or eaten as a documented
morning meal. No event shows food disappearing without
being eaten. The overnight retention mechanism itself did
not fail once — the snapshot's timing did.

## Morning narration (sense-testing)

SENSE-TESTING LAW: the retained food is confirmed as the
injected bank-added food by stack identity (Muscadine
Grapes, 18 x 40 kcal, spoilDay gameDay+2, 18/18 at
first-upkeep on all 5 retained staged events), and the
morning meal reads sensibly. Retained-spoil-swept morning
(17025/33): "You eat Muscadine Grapes (320 kcal)." — the
morning meal is narrated, eating the banked grapes. Genuine
evening (17063/13): "You work late on the forest floor — 0
deadfall gathers and 2 forages — until the night is too far
gone for real sleep." The staged evenings read honestly as
rests: "You settle in and rest through most of the dusk.
Breath slows. +30 energy. (-40 kcal — rest burns fuel too.)"
Vanished mornings show a starving scholar with nothing
edible left ("Nothing edible. (unknown shoots, unknown
berries, ... — not food yet: identify it first ...)") —
sensible given the food was eaten before dawn. One capture
thinness, not a game finding: the pre-snapshot upkeep eat
itself falls in the inter-daily say gap (upkeep lines run
before daily, outside any row's fullDaySay slice), so no
eat line for the vanished food is in the corpus — the eat is
proven by the trigger split + code path, not by a transcript
line.

## Metric review

The metric held as written (no re-scoring: the verdict is
NO-GO-NON-UNANIMOUS per the binding rule), but the metric
PROVED WRONG in one respect, and the fix belongs to the
NEXT run, not this one: the first-upkeep snapshot does not
measure "the true post-sleep morning" when sleep refuses.
In the refused path (every bank-band evening) it measures
"after the first dawn upkeep eat", so food eaten as a
legitimate morning meal reads VANISHED. Proposed revision
for the next run: snapshot the pack at EVERY upkeep call
(not just on day-change), and classify a first-upkeep
shortfall as eaten-not-vanished when a same-window kcal
rise accounts for it (the prior arms' "retained-then-eaten
counts as retained" rule, applied to the pre-snapshot
upkeep eat). The next run should also re-judge these 14
events under the fixed snapshot rather than re-staging
them — the substrate worked (14 judged, 0 censored) and
needs no third census. Also recorded: the injected-stack
identity check was fixed mid-run (pure analyzer fix, proof
still 58/58) to count by (key, spoilDay) instead of bare
key — a carried same-key stack swept at dawn had made
17025/33 read 8/18 injected units when all 18 survived;
the corrected check reads 18/18, and the verdicts (from
classifyRetention) did not change. The press-null fine
window (17029/25: a foraged-clean patch returns null) is a
real staging limitation, documented, not a bug.

## Wall numbers

Not re-measured this run (diagnosis arm; narration-diagnostic
recorder corpora, not scale panels — same caveat as the
0815Z run). Corpus survival: median 60d, 2 of 8 villages
lost (17073 day 35, 17060 day 42). Carried state: standaccum2
band national/table/wins 0/16, wave-5 0/16, median survival
90.5d; Loop B 0618Z postblood wild-dominant. Full seat still
unwon; wave-5 kills still 0 in normal play.

## Closeout provenance

Re-dispatch worker: prereg + instrument committed
(73487bad5, proof 46/46), index-clobber repair after the
commit (SAFE-COMMIT lesson: cacheinfo from HEAD blobs,
verified status empty + diff HEAD empty + hash match).
Pilot (1 seed, 17063) exposed the wait-to-band failure;
addendum + fix committed (f9c081029, proof 58/58), index
clobber repaired again. Full 8-seed band ran clean (~7.2
min, exit 0). Analyzer identity-check fix committed
(adcafcb43, proof 58/58), index clobber repaired a third
time. Master moved under the run (version bump 45c134fab,
version files only — no game logic); rebased cleanly onto
it, proof re-run 58/58 green after the rebase. (The three
commit hashes above are post-rebase; pre-rebase they were
88f096a9c / 9f6595af6 / 77dbdaeac.) Evidence + corpus are
committed as the final commit of this arm.
The safe-commit index clobber hit on all three commits in
this worktree — the repair (cacheinfo from HEAD blobs) is
reliable but the clobber itself is worth a look by whoever
owns safe-commit.sh.

## Files

- Prereg + addendum: evidence/2026-11-05/
  sim-bankadded-substrate-a-prereg.md,
  sim-bankadded-substrate-a-prereg-addendum.md
  (post-rebase commits 73487bad5 / f9c081029).
- Instrument: scripts/policies/bankadded-probe-diag.js,
  scripts/bankadded-probe-trace-b.js,
  scripts/analyze-bankadded-probe.js (identity-check fix
  adcafcb43), scripts/test-bankadded-probe-a.js (58/58).
- Census corpus: evidence/2026-11-05/
  sim-bankadded-substrate-a-corpus/ (8 files).
- This evidence: evidence/2026-11-05/
  sim-bankadded-substrate-a.md.
- Analyzer reports (not repo files): /tmp/probe-final-report.json
  (full 14-event report), /tmp/probe-pilot-report.json
  (pilot, for the before/after proof).
