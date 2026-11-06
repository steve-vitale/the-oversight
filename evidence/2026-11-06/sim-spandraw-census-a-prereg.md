# sim-spandraw-census-a — pre-registration (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop (loop A), run fleshout-20261106T0315Z,
arm sim-spandraw-census-a, axis food-economy. DIAG/measurement ONLY:
ZERO src/js changes, ZERO default flips, ZERO changes to any existing
analyzer, sweep, capture, or policy (competent.js untouched). New
files only: a long-day policy wrapper, a playpath driver vendored
from playpath-b, and the proof script. This arm answers
sim-findings item #1245 (2026-10-27, food-economy/ledger): only
cultivate spans are proven to swallow an endDay; other useAbility
spans that cross a day boundary could create the same direct+meal
double-count. Classification only; no fix.

## What is already proven (taken as proven, NOT re-proved)

- sim-spandraw-census-b (competent sims, seeds 9951-9958): surface
  is cultivate-only (356 spans, 0 day-crossings, 0 exclusions).
- sim-spandraw-design-b (scripted day-boundary probes, seeds
  9981-9988 + confirm 9991-10002): 15 non-cultivate keys
  PROBE-PROVEN (mechanism) — any useAbility span holding a night
  swallows that night's meals in a naive direct+meal ledger; the
  class is timing, not ability. 2 keys kcal-only (ask,
  push_through, impl ticks nothing, cannot cross); 7 refused-impl
  (5 pre-payment fixture refusals + cultivate hall gate); combat
  actions cannot day-cross by construction (tickAction no-ops
  mid-fight); legacy activatables and god/keepsake verbs sit
  outside the census span logger by construction.
- sim-spanpromo-b (competent band 10012-10019): NO PROMOTIONS —
  all 15 keys 0 spans under competent policy. Its note is BINDING
  for the promotion question: do NOT re-run under competent policy
  as a promotion band; a future promotion claim needs a NEW
  instrument (a play path that taps arbitrary ability actions),
  not more competent seeds.
- sim-spandraw-playpath-b (real-play tap instrument, seeds
  10040-10047, 488 taps, 0 crossings): 14 of 15 keys fire in real
  play; thief attempts but is hall-refused 37/37. Crossings stay
  unproven for a POSITIONAL reason: played evening taps land at
  median dayTicks 405, max 478, zero at or past 480 — never within
  any key's cost of the 512-tick boundary. Its named follow-up,
  which THIS arm runs: "a future promotion band needs a policy
  whose days run longer (more evening work) under its own prereg
  — NOT clock-setting, NOT waits-to-dusk as a steering device."

## This arm's design (two legs, one fresh band)

LEG 1 — census replication + wall numbers (competent surface).
The task's literal pilot, run with the census-b tooling
UNCHANGED: `scripts/sweep-spandraw-census-b.js` with
PERSEED_DIR=evidence/2026-11-06/sim-spandraw-census-a-corpus,
substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 POLICY=competent, DAYS=100, SEEDS=47001-47008.
Judged with the UNCHANGED `scripts/census-spandraw-b.js`.
Purpose: the cultivate row on a fresh band (expected
NO-DAY-CROSSING, per census-b and spanpromo-b), the
NOT-FIRED owned/never-owned split for all 142 ability ids,
and the wall numbers for the judged corpus. This leg is a
census replication, NOT a promotion re-run: no promotion
claim is judged from it, and its expected cultivate-only
zero is not scored as a failure. If LEG 1 somehow shows a
day-crossing span, that is reported as a census finding and
the extension rule below applies.

LEG 2 — playpath-longday pilot (the extension that can
actually see a crossing). The playpath-b instrument with
ONE change of policy: competent-longday-a, a wrapper that
runs competent.daily and then an evening-work block (extra
garden work via the exported workGarden helper + extra talk
rounds via the exported talkRound helper, at haven, while
the scholar has energy and kcal to work). Evening work is
genuine game action, never clock-setting, never a wait:
it stops on resource grounds (energy < 20 or kcal < 800),
on no-progress (a round adding 0 ticks), after 6 rounds,
or when the scholar leaves haven / enters combat / the
game ends. The tap then happens after the day's work, at
whatever dayTicks the work left — recorded, never chosen.
Driver: `scripts/playpath-spandraw-a.js`, vendored from
`scripts/playpath-spandraw-b.js` with ONLY these changes:
policy import swapped to competent-longday-a, OUTDIR
evidence/2026-11-06/sim-spandraw-census-a-playpath, mode
string, SEEDS default 47001-47008, and ONE added tap
field — `hasAbilityAtTap` (Game.hasAbility at tap time) —
which traces the playpath-b grant-persistence follow-up
(11 late taps refused "You don't have that ability").
LEAD=2 TAPDAYS=5, KEYS = the same 15 prereg keys as
playpath-b. Judged with the UNCHANGED
`scripts/analyze-spandraw-playpath-b.js` (takes a corpus
dir argument) for tap-window spans, PLUS the UNCHANGED
`scripts/census-spandraw-b.js` over the same corpus for
ALL spans (policy cultivate spans from evening garden
work included; the corpus carries no abilityOwnership
snapshot, so its notFired split is NOT used — the split
comes from LEG 1 only, stated in the evidence).

Span types covered (every useAbility span type the
instruments can see): green_thumb.cultivate and
green_whisper.cultivate (LEG 1 policy spans + LEG 2
evening-work spans) and the 15 probe-proven keys (LEG 2
tap-window spans). Combat actions, legacy activatables,
and god/keepsake verbs are classified structurally (per
design-b, unchanged): DAY-CROSSING-IMPOSSIBLE-BY-
CONSTRUCTION / OUTSIDE-LOGGER, stated, not probed, not
counted as failures. Kcal-only actions (ask, push_through)
are NO-DAY-CROSSING by construction (impl ticks nothing),
per design-b, not re-probed.

## How a day-crossing span is detected, and how endDay-swallow / double-count is judged

- Day-crossing: a paired span (spanEnter/spanExit from the
  nest logger, matched by ability+action+depth) with
  enterDay != exitDay. The day number advances only via
  endDay, so enterDay != exitDay means an endDay fell
  inside the span. (Same proxy as census-b/design-b; a
  crossing span's endDay link is confirmed from draw
  frames — villageMeal / commonsTick / endDay — as the
  cultnest arm did, before any PROMOTED verdict.)
- EndDay swallowed: >=1 span-internal pantryDraw (drawEnter
  evt strictly between span entry/exit) whose frames name
  endDay. Internal draws are counted per span by the
  analyzer; endDayDraws is the endDay-framed subset.
- Double-count (PROVEN): item-matched exclusions > 0 kcal
  attributed to the span by the UNCHANGED applySpanDedup
  (dedupspan-ledger-b.js), AND the span crosses a day
  boundary, AND >=1 span-internal pantryDraw. Amount-
  matching never counts; an unmatched internal draw stays
  counted under the meal draw and the key is reported as
  crosses-day with an unmatched-draw note, never promoted.
- Classification per key (census rules, unchanged):
  PROVEN-SPAN-DOUBLE-COUNT / PROMOTED-REAL-PLAY (playpath
  leg: crossing + internal draws + endDay framing +
  exclusions) / SPAN-CROSSES-DAY-NO-DRAW / NO-DAY-CROSSING
  / TAPPED-NO-CROSSING (playpath leg) / NOT-FIRED-ON-BAND
  (with owned/never-owned split from LEG 1) /
  MIXED-NEEDS-READ (named, never silently bucketed).

## Fresh band + freshness record (mandatory, whole-token grep)

- Pilot band: 47001-47008 (LEG 1 + LEG 2, same seeds).
  Extension band: 47009-47016. Confirm band (only if a
  key meets PROMOTED-REAL-PLAY on the pilot):
  47017-47028 (12 seeds).
- Search scope: whole-token grep over ALL dated preregs
  `evidence/*/sim-*-prereg.md` (549 files) for `47[0-9]{3}`
  as a standalone token, PLUS every candidate seed
  individually, PLUS the forbidden/contaminated band lists
  those files name.
- Result: ZERO whole-token 47xxx hits in any prereg. Each
  candidate 47001-47016 appears in 0 prereg files. The
  only substring hits (47396, 47162) sit inside commit
  hashes (18d27c4c20a7ce42cb5d655e047396d8a6377cd2,
  47162b801a9763ed92a54bcbd633ec56b9fb049d), not seed
  tokens — not bands, not collisions.
- Forbidden lists checked and avoided: 99001-99008,
  99009-99024, 99041-99052, 99101, 99201-99216,
  99217-99232, 99401-99412, 99601-99612, 99701-99708,
  99801-99808, and 46001-46064 (enddaybeats-fix-a arm,
  named in the task). None overlaps 47001-47028.
- Rejected candidates: none — the first choice (47001+)
  is clean; no fallback band was needed. The task's
  suggested 47xxx range was verified, not assumed.

## Horizon + why (death-aware, never fixed-200d)

- LEG 1: DAYS=100 MAXIMUM, death-aware via runDays
  endReason — never a fixed 200d. Justification: 100d is
  the horizon of every prior span corpus (census-b 9951-
  9958, spanpromo-b 10012-10019, cultnest 9954), so span
  rates are comparable; long enough for dozens of
  useAbility spans per seed and many endDay crossings,
  while dead villages stop simulating (daysAlive +
  endReason per seed). A fixed 200d would double compute
  for a question about span mechanics, not late-game
  reach.
- LEG 2: 2 lead + 5 tap days per instance (same as
  playpath-b, so tap counts are comparable). Tap
  positions are set by daily work, not by run length; a
  100d run would repeat the same evenings. Wall numbers
  come from LEG 1, not from 7-day instances, and are not
  estimated for LEG 2.

## DIAG-GO bar (judge ONLY against this)

- LEG 1 — census pilot gate: DIAG-GO iff all 8 pilot
  seeds complete without sweep crash; every payload
  carries nestEvents, directRecords, mealDrawRecords;
  the analyzer classifies 100% of fired keys (no
  unclassified span); the per-key table is published with
  spans / day-crossing spans / span-internal draws /
  exclusions per key; every NOT-FIRED ability id carries
  its owned/never-owned split; wall numbers are recorded
  for the judged corpus.
- LEG 2 — playpath-longday pilot gate: DIAG-GO iff all
  120 instances (8 seeds x 15 keys) complete without
  driver crash; every genuinely attempted tap carries
  spanEnter+spanExit for its key; every tap-window span
  is classified (15-key table, no unclassified span);
  tap-position distribution is published (min/median/max
  dayTicksBefore, count of in-window taps per key —
  in-window = dayTicksBefore >= 512 - ticks(key), where
  ticks(key) = max(1, round(time_min/2)) from
  abilities.json: molt 30 ticks (>=482), lay_wait /
  stage_injury / share_pot 15 (>=497), clean_shot /
  follow_blood 10 (>=502), track / read_sign / stalk 8
  (>=504), steal / read_beast / mark / menace 5 (>=507),
  end_it_before / challenge 3 (>=509)); the 9954 replay
  control still classifies cultivate as PROVEN (3,820
  kcal) through the census analyzer.
- The census is a DIAG-GO even if its answer is
  "cultivate only, zero crossings, zero promotions" — a
  negative census is a completed census, not a failed
  run, and must NOT be re-scored as a failure for
  finding nothing new.
- EXTENSION RULE: extend LEG 2 to 16 seeds (47009-47016)
  iff the pilot shows >=1 day-crossing tap-window span
  (any key) OR >=5 in-window tap-days across keys. If
  neither fires, the 8-seed pilot stands as the judged
  corpus and the extension is NOT spent. Extend LEG 1
  only if LEG 1 itself shows a day-crossing span.
- PROMOTION RULE (LEG 2 only): a key meets
  PROMOTED-REAL-PLAY iff crossing + internal draws +
  endDay framing + item-matched exclusions on the pilot.
  If met, run the 12-seed confirm band (47017-47028,
  same driver) and judge recurrence there; if it does
  not recur, the verdict is SINGLE-SEED CANDIDATE, not
  PROMOTED — reported as such, never rounded up.
- LEG 3 — control: the 9954 belongseek replay control
  (evidence/2026-10-27/sim-9954cultnest-b-replay/) still
  classifies cultivate as PROVEN with 3,820 kcal
  exclusions through the same analyzer (proof leg); and
  the design-b tracker boundary instance still classifies
  crossed with 11 internal draws and 5,990 kcal
  exclusions through the tap-window analyzer (proof leg).
  If either control fails, the instrument is broken and
  no census verdict is claimed.

## Before/after and balanced panel (MEASUREMENT.md §15)

This census has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. The only
old-vs-new comparison is instrument-internal (boundary
vs control positions inside the probe; old sum vs deduped
sum inside applySpanDedup on identical payloads), which
is the detector, not a lever outcome — so NO balance-panel
compare .md is produced for this arm, as pre-registered.
The pilot-vs-confirm agreement (same keys, same exclusion
pattern on fresh seeds) is the replication check instead,
if a confirm runs.

## Wall numbers (reported for the judged corpus, never estimated)

For LEG 1 (8 seeds, or 16 if extended): national count,
table/wins count, wave 4-5 unlock count, wave reach per
seed, median/max survival (daysAlive), death-cause shares.
Anything not recorded in the payload (Arc II/III/IV reach,
four-realm formation, trap acquisition by source, counter
discovery/kill rate, young-link succession survival,
tier-2/wave-3 reach as separate fields) is listed as NOT
RECORDED, not estimated. LEG 2 instances are 7-day
instances: no wall numbers exist for them and none are
estimated.

## Sense-testing

At least one span trace is read end-to-end in the evidence:
if a key promotes, that key's trace; otherwise the
longest day-crossing span on either leg (or, if none, the
latest tap-window span by dayTicksBefore), judged on
whether the draws inside it are real meals (caller
frames: villageMeal / commonsTick / endDay) vs an
instrument artifact. No villager transcript claim is made
for a ledger phenomenon unless a transcript line actually
names the span — the cultnest arms already established
this surface is silent in speech, and silence is reported,
not filled in.

## Metric review (MEASUREMENT.md §14 — filled in the evidence)

Pre-registered metrics bind this run; a miss is NO-GO /
not-DIAG-GO, never re-scored mid-run. Metric doubts go in
the evidence's "metric review" section for the NEXT run.
