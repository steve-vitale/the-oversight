# sim-mealdraw-b — the meal-draw record, reconciling gross vs surviving pile (INSTRUMENT ONLY, no game change)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-mealdraw-b. Takes the stockdoor arm's named next blank: a
meal-draw record + pile-match prereg for the residual pair.
Instrument: `scripts/mealdraw-capture.js` (new: recorder-side
wrappers around `Game.villagerMealDay`, `Game.villageMeal`,
`Game.pantryDraw`, `Game.drawSpoiled`, plus a cook-line
counting `Game.say` wrapper for exact window stamps).
Sweep: `scripts/sweep-mealdraw-b.js` (identical band to the
stockdoor band, plus the mealdraw install; substrate, inflow,
resid, and stockdoor captures reused UNCHANGED; zero src/js
changes). Analyzer: `scripts/analyze-mealdraw-b.js`. Proof:
`scripts/test-mealdraw-b.js` (see "Reproduction check" — 18
PASS, 19 FAIL; the failures ARE the verdict, see below).
Post-hoc new-base check (NOT a verdict input):
`scripts/check-mealdraw-b-newbase.js` (3/3 windows CLOSED).
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned
2d < cooked 5d < smoked 30d; smoking 16 ticks; "rot can't be
smoked back into food").

## Pre-registration (binding, MEASUREMENT.md §14 — written BEFORE the sweep ran)

Full text: evidence/2026-10-26/sim-mealdraw-b-prereg.md
(written before any sim ran in this arm; the sweep ran after
it).

Band: identical seeds/policies to the stockdoor band — seeds
9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d, CAP=1. This 8-seed band IS the pilot
gate.

Control (must pass before any residual judgment): the
PRE-FOURTH-DOOR view re-derives 327/289/38, lag 1x32/2x4/3x1/
4x1, median lag 1.0, coverage 36/38, residuals exactly
(9750,83) and (9750,84); plus the determinism leg (new corpus
matches the stockdoor corpus on every game-output field on
all 8 seeds).

Primary metric: reconciliation of the seed 9750 day-83 and
day-84 piles from meal-draw records, gross and surviving pile
judged SEPARATELY. GO iff ALL seven hold: (1) control passes
exactly; (2) window-1 meal draws from class ('Foraged food',
200, 85, null) total exactly 800 kcal, all villager-home;
(3) window-1 draws from ALL spoilDay-85 classes total exactly
1,142 kcal, so 342 + 2,800 − 1,142 = 2,000 closes with ZERO
residual; (4) window-2 draws from class ('Foraged food', 200,
85, null) total exactly 0; (5) every @86 class equation closes
exactly with evidenced smoke; (6) cross-checks (home meal
calls fresh+spoiled == returned drawn; every drawSpoiled got
== its diff sum; no truncation); (7) determinism leg passes.

## Verdict: NO-GO — literally, and the reason is the base moved, not the instrument

Judged against the header only, never re-scored: NO-GO. The
failing legs, named:

- Leg 1 (control): FAIL. The new corpus re-derives
  383/338/45 (not 327/289/38), lag 1x40/2x4/3x1 (not
  1x32/2x4/3x1/4x1), coverage 44/45 (not 36/38), residual
  exactly one: (9754,80) — the stockdoor residual pair is
  GONE on this base.
- Leg 2 (night-82 gap): FAIL on every number. Window-1 draws
  from the Class-A stack are 0 kcal (not 800); whole-@85
  draws are 0 (not 1,142); the equation computes 4,142 (not
  2,000) because its inputs are the old trajectory's numbers
  (342 granary, 2,800 gross) and the new trajectory has
  neither (new granary @85 fresh: 212 + 278; new gross:
  3,800).
- Leg 5 (@86 classes): FAIL on the Foraged-200@86 equation
  (before 0 + writes 4,400 − draws 0 − smoke 2,800 = 1,600,
  not the after value 0) and on the smoke cross-check (there
  is NO day-84 worked line on the new base, so worked84Kcal
  is null — the prereg's smoke evidence does not exist here).
  The Winner/178/189 @86 equations pass.
- Leg 7 (determinism): FAIL on 3 seeds (9750, 9753, 9754:
  dayTable, attribution, deaths/deathCauses, waveReach, and
  for 9754 daysAlive/endReason). The other 5 seeds match
  exactly.
- Legs 4 and 6 PASS: window-2 draws from the @85 class are
  exactly 0, and all 630 villager-home meal calls cross-check
  exactly (fresh + spoiled == returned drawn, 0 mismatches);
  0 drawSpoiled mismatches (over 0 spoiled draws — see below);
  no truncation on any file; ctxKcalMatch 0 mismatches over
  1,729 lines; resid join 0 misses.

## Root cause, proven by control experiment (not speculation)

Between the stockdoor run and this run, commit 1377d03c3
("journey deepening r53: stage-0 ask_favor re-ask guard +
villageAgency falsy-0 fixes") changed src/js/conversation.js
and src/js/villageAgency.js. That is a game-code change on
the measurement band's path (conversations and village
agency run during competent-policy days), and it moved the
trajectory: seed 9750 went from wave 3 / 5 deaths to wave 2 /
2 deaths; the control numbers moved with it.

The instrument is PROVEN neutral by a control experiment run
inside this arm: `scripts/sweep-stockdoor-b.js` (UNMODIFIED,
stockdoor-only, no mealdraw install) re-run on current HEAD
into a scratch directory reproduced the mealdraw corpus
EXACTLY on all 8 seeds — identical per-seed log lines down
to the millisecond (9750: days 100, deaths 2, cook 191,
batches 129, res 45; 9751: days 48, deaths 12; and so on for
all 8). The scratch directory was deleted after comparison;
the identity is the evidence. A wrapper that changed the
trajectory could not reproduce byte-equivalent game outputs
with and without itself. The prereg's leg-7 attribution
("any mismatch is an instrument effect") is therefore
FALSIFIED for this run: the mismatch is a base effect, and
the leg-7 baseline (the stockdoor corpus) is stale. The
verdict stays NO-GO because the prereg binds the run to that
stale baseline — but the instrument itself is exonerated,
and the next prereg must re-derive its endpoints on the
current HEAD (see "Metric review").

## Post-hoc new-base reconciliation (NOT a re-score, NOT a verdict change)

The following was computed AFTER the verdict, against the
NEW corpus's own dayPantry endpoints (not the stale
stockdoor endpoints), by
`scripts/check-mealdraw-b-newbase.js`. It does not change
the NO-GO above. It answers the question the next prereg
needs: on the current base, does the meal-draw record
reconcile gross vs surviving pile?

YES — on all three nights, exactly, with draws 0 from the
surplus classes:

- Window 81 (day-81 first cook → day-82 first cook):
  surplus class 200@84: before 0 + writes 3,600 (night-81
  stockdoor gross) − draws 0 = after 3,600. CLOSED.
- Window 82: surplus class 200@85: before 0 + writes 3,800
  (night-82 gross: 600+1,000+0+200+0+200+800+1,000) − draws 0
  = after 3,800. CLOSED. (Whole fresh @85: 490 before
  (212 + 278 granary pieces) + 3,800 − 0 = 4,290 after.)
- Window 83: surplus class 200@86: before 0 + writes 4,400
  (night-83 gross: 600+1,000+600+0+1,000+1,200) − draws 0 =
  after 4,400. CLOSED. (Fresh @85 unchanged 4,290 → 4,290.)

So on the current base, the night meal does NOT eat its own
surplus at all — gross EQUALS surviving pile on all three
nights. The mechanism the record proves is fresh-first
ordering: stockSurplus stamps the FRESHEST clock (v.day + 3),
and pantryDraw eats soonest-spoiling first, so the night's
own surplus is the LAST thing the meal touches. The village
only reaches its surplus when its wants exceed all older
stock — on the old trajectory that happened (800 kcal on
night 82, the whole 3,000 on night 81); on the new trajectory
it never happens, because the village mostly feeds itself
(see "Sense samples": 7 of 9 night-82 meal calls drew 0 from
the pantry). The old trajectory's 800-kcal gap and the new
trajectory's 0-kcal gap are the SAME mechanism at different
hunger levels, and the meal-draw record measures both.

What the record does NOT close (honestly stated): other
(non-surplus) classes show residuals that decompose into two
known mechanisms, not meal-draw gaps: (a) three-door writes
(inflow records carry no spoilDay, so those writes cannot be
attributed to a class — e.g. window-82's +254@88 matches the
day-82 inflow stock 254 exactly; window-83's +214@89 and
+293@89 match the day-83 inflow stocks exactly); (b) spoil
sweeps (stacks whose spoilDay passes leave the pantry
overnight — e.g. the 200@80 class: 3,200 before − 2,400
drawn = 800 swept). The surplus classes need neither term:
their writers (stockdoor) and draws (mealdraw) are fully
recorded, and they close at exactly 0 residual.

## Sense samples (plain words — meaning, not just counts)

Seed 9750, night 82, the full sequence in meal-call order
(new corpus, mealDrawRecords):

- The player eats first: want 170, took 355 — the documented
  player ceil on indivisible pieces (one 155-kcal Expedition
  haul + one 200-kcal Foraged food, both spoilDay 81, the
  soonest-spoiling stacks in the pantry). Honest overdraw on
  indivisible food, not conjured calories.
- Then the villagers, in roster order: seven of nine drew
  NOTHING from the pantry (drawn 0) and ate 1,719–2,300 kcal
  each from their own day's work, then banked surplus
  (gave 509, 1,018, 49, 223, 18, 120, 838, 1,047 — the eight
  night-82 stockdoor writes). One villager drew: gen_nx9o7q9,
  want 306, took exactly one 200-kcal unit at spoilDay 81 —
  again the soonest-spoiling stack, fresh-first working as
  designed. Away villagers drew nothing from the pantry
  (pack rations, drawn 0).
- Total window draws: 555 kcal, all from spoilDay-81 stacks.
  Nothing from @85, nothing from @86, nothing from granary
  pieces. The night's own 3,800-kcal surplus survived whole
  because the village barely touched the pantry that night.
- The next morning's narration matches: Sierra and Heidi
  cook plain "meals stretched" lines (no racks-full complaint,
  no hungry-night line — nobody went to sleep hungry, and
  indeed every villager ate 1,719+ kcal against ~2,000 need).
  Heidi's day-82 throttle line ("the shelves are full, ~118
  days of fresh on hand… leaves the harvest standing and
  turns to the water run instead") matches a pantry holding
  tens of thousands of kcal: leaving the harvest standing is
  the honest behavior of a full village, not a scripted
  excuse. No robotic, static, or repeated behavior is flagged
  as a blank in this sequence: the one repeated template (the
  plain cook line) fires with true numbers and true
  situations, and the villagers' differing gives (18 vs
  1,047) are real people differing, not a loop.

Sense judgment: the story coheres, and the record makes the
coherence checkable — every kcal the narration implies (a
fed village, a full pantry, a banked surplus) is a recorded
number, and no number contradicts a line.

## Village assessment (what the village looked like)

Seed 9750 (the focus seed, new base): survived the full 100d
horizon, village rank, wave 2 reached, haven tier 3 (the
granary stands: +3 days on fresh stores). Two deaths: one
ambush, one the arena — a village losing people to the world
and the show, not to hunger: no starvation or dehydration
deaths on this seed. The cooks, Sierra and Heidi, work the
smoke racks daily (129 villager preserve batches, 97,910
kcal preserved, 45 resolutions on this seed). Knowledge/
capabilities missing on this seed: anything past wave 2 — the
scale wall stands here as everywhere on this band (the old
base's wave 3 on this seed is gone with the trajectory
change, which is itself a measurement warning: wave reach on
this band is trajectory-fragile, not a stable village trait).

Band (8 seeds, competent-nofeast, 100d): 7 villages survived
to the horizon, 1 lost early (9751 at day 48). Median survival
100d (censored at the horizon). Deaths 31 total (was 43 on
the old base); top causes: the arena 13, starvation 5,
ambush 3, sickness 3, monster 2, a wound that wouldn't close
2, dehydration 1, contest 1, lockjaw 1. Wave reach: wave 3
on 3 seeds (9753, 9754, 9755), wave 2 on the rest; wave 4/5
on none. Rank stayed village on all 8 seeds. Who thrived:
the villages that reached wave 3 with a granary and working
cooks; who died and why: the arena dominates the band's
deaths, then starvation — the show takes people, and the
food economy still starves villages that cannot keep the
pantry ahead of the throttle. The blank this run filled is a
measurement blank (the meal-draw record), not a
village-capability blank; the village's own blanks (wave 4+,
skilled preserver depth) are documented, not filled.

## Reachability verdict

On this band, reachable: waves 1–3, village rank, haven tier
3, the full preserve ladder as used by villagers (smoking
exercised daily). NOT reached on this band: waves 4–5,
regional → national, the table, the win flag, Arc II/III/IV
(not recorded in this corpus's top-level fields). The scale
wall stands on this band; this arm closes a food-economy
measurement blank (the meal-draw record reconciles gross vs
surviving pile on the current base), it does not move the
wall numbers. Note for the coordinator: the old base's
residual pair (9750,83)/(9750,84) no longer exists — any
follow-up that assumes it must re-derive its endpoints on
the current HEAD first.

## Wall numbers (new corpus, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach: wave 3 on 3 seeds, wave 2 on 5 seeds. Median survival:
100d (censored at the 100d horizon; 1 village lost early —
9751 at day 48). Deaths 31 total (causes above). Rank
village on all 8 seeds.

## Metric review

- The pre-registered metric did its job and the bar was
  honored: the control reproduced NOTHING from the old
  trajectory, the determinism leg failed on 3 seeds, and the
  literal verdict is NO-GO. No re-scoring was done: the
  post-hoc new-base reconciliation above is reported as
  post-hoc analysis, and the NO-GO stands.
- Metric doubt, stated honestly: the prereg's legs assumed
  base stability across the stockdoor run and this run, and
  that assumption was false (1377d03c3 landed between them).
  Leg 7's attribution rule ("any mismatch is an instrument
  effect") is the specific failure: the control experiment
  (stockdoor-only rerun == mealdraw corpus, exactly) proves
  the mismatch is a base effect. Leg 5's smoke evidence
  assumed a day-84 worked line that does not exist on the
  new base. Leg 2's numbers (800/1,142/2,000) are old-
  trajectory constants, not invariants.
- Proposed revision for the NEXT run (not applied here):
  pin the base commit in the prereg; run a stockdoor-only
  control sweep on that HEAD FIRST and re-derive the
  control numbers, residuals, and pile endpoints from it;
  then pre-register the meal-draw legs against THOSE
  numbers. If the base moves again mid-run, the run stops
  and re-preregs instead of judging new numbers against old
  ones. The instrument itself needs no change: leg 6
  (630/630 meal-call cross-checks) and the rerun identity
  prove it neutral and complete for pantryDraw/drawSpoiled
  draws.
- No revision is applied to THIS run's verdict. The
  stockdoor arm's DIAG-NO-GO verdict stands as the prior
  run's judgment under its own header; this arm's NO-GO
  stands as this run's judgment under its header; the
  post-hoc reconciliation is a finding for the next
  prereg, not an edit to either verdict.
- Out-of-arm observations (logged here for the coordinator
  to append to sim-findings.md; NOT chased in this run):
  - Meal spoilage boundary split: pantryDraw on day 81 drew
    2,400 kcal from spoilDay-80 stacks that the bonus-0
    cook-eligibility rule calls spoiled (resid eligible
    stacks day 81 show only spoilDay 82/83). The meal's
    boundary is bonus-aware (player preservation_instinct
    modifier); the cook's is bonus-0. Two boundaries for
    "spoiled" is a candidate inconsistency, not yet a bug
    verdict.
  - Non-draw pantry removals unexplained: ~5,900 kcal of
    spoilDay-81 fresh stacks vanish between the day-82 and
    day-83 first-cook snapshots with only 555 kcal of
    recorded draws (candidates: the overnight spoil sweep
    under a stricter boundary than the meal's, or a
    non-pantryDraw removal path such as _evTakePantryKcal).
    The meal-draw record is complete for draws; removals
    outside draws are a separate instrument's job.
  - drawSpoiled never fired on this band: 0 drawSpoiled
    calls in 9,891 meal records across 8 seeds — the
    desperation path (eating spoiled stores rather than
    starving) is unexercised here, so its accounting is
    unproven by this corpus (the diff-sum cross-check code
    exists but never ran against a real spoiled draw).
  - Player meal ceil, confirmed honest: want 170 → took 355
    (indivisible pieces, soonest-spoiling first). Documented
    behavior, no action.
  - Wave reach is trajectory-fragile on this band: seed 9750
    moved wave 3 → wave 2 and deaths 5 → 2 on a conversation/
    agency commit with no food-economy content. Wave numbers
    from one base should not be quoted as village traits
    across bases.

## Reproduction check (this run)

- Analyzer `scripts/analyze-mealdraw-b.js` runs read-only
  against the new corpus and prints the control, the window
  draws, the leg checks, and the literal verdict (NO-GO).
- Proof `scripts/test-mealdraw-b.js` requires the analyzer
  and asserts every prereg leg plus wall numbers. Run in
  this worktree: 18 PASS, 19 FAIL — the failures are the
  control reproduction (neutrality, lag, coverage,
  residuals), the old-trajectory gross/draw numbers (2,800/
  3,000 gross, 800/1,142 draws), the @86 smoke equation and
  worked-line cross-check, the determinism mismatches (3
  seeds), the dayPantry endpoint match, the deaths total
  (31 vs 43), and the verdict flag (NO-GO, not GO). Every
  instrument-internal check passes (ctxKcalMatch, resid
  join, truncation, meal-record presence, leg-4 @85 anchor,
  leg-6 cross-checks). Exit 1. The failures ARE the verdict:
  the proof encodes the prereg, and the prereg's numbers
  belong to a moved base.
- Post-hoc check `scripts/check-mealdraw-b-newbase.js` runs
  read-only against the new corpus only: 3/3 surplus windows
  CLOSED (residual 0), exit 0. This check is not a verdict
  input; it is the next prereg's starting evidence.
- Control experiment: unmodified `scripts/sweep-stockdoor-b.js`
  re-run on current HEAD into a scratch directory reproduced
  the mealdraw corpus exactly on all 8 seeds (per-seed log
  lines identical including timings); the scratch directory
  was deleted after comparison and is not committed.
- Sweep: 8 seeds, ~13s total, no truncation, no write
  failures. No game harness changes, zero src/js changes, no
  jest run (nothing to test in js — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- Per-seed corpus: evidence/2026-10-26/
  sim-mealdraw-b-corpus/ (8 files, mealdraw-b-cap1 band).
