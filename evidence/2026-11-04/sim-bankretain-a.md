# sim-bankretain-a — in-stack edible-bank retention: INSUFFICIENT-DATA (pool too small; the one edible bank is still censored)

Run: oversight-flesh-out-loop, run fleshout-20261104T1647Z, arm
sim-bankretain-a, axis food-economy. Worktree sim-bankretain-a.
Blank: in-stack edible-bank retention, the ONE open sub-question
from sim-bankfood-a (evidence/2026-11-04/sim-bankfood-a.md §4/§8).
POLICY-SIDE MEASUREMENT ARM: zero src/js changes, zero edits to
any existing policy file, zero policy-default flips. Sibling
trees never touched; main tree never touched. Nothing is pushed,
bumped, or live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-bankretain-a-prereg.md (commit aa8ebd29).
Pinned base: worktree HEAD at prereg writing time.
Instruments commit e0963ced (analyzer + proof test, 13/13 pure
green before any judged sim).

Primary metric: share of judged known-edible bank events
RETAINED at the true post-sleep morning (first-upkeep snapshot).
A judged event is an evening bank/flip whose bank itself added
edible-now food (bankedEdibleDelta = postDailyPack.edibleKcal -
evening packBefore.edibleKcal > 0) AND which has a following
morning in-stack (next loop-day row + firstUpkeep for
scholarDay = gameDay + 1). A bank on the final loop-day, or
followed by village death before the next morning snapshot, is
CENSORED, not judged.

Judge bar: >= 3 judged events. Pre-registered expansion rule:
if the 8-seed pilot yields < 3 judged events, expand BEFORE
judging to the full 16-seed wider band (same legs, same
horizon) and judge the combined corpus. Expansion is a
pre-registered sample-size rule, not a post-hoc rescue.

Verdict rules (as pre-registered): >= 3 judged, all retained =>
RETENTION-CONFIRMED (measurement result, not a kill); >= 1
judged vanished/partial-unexplained with a traced mechanism
stage => VANISH-CHARACTERIZED (fix small + proof-tested, or
document why it cannot be fixed); < 3 judged after expansion
=> INSUFFICIENT-DATA, §14a SUBSTRATE-MISSING (pool too small),
never CONCEPT-DEAD and never a retention claim on 1-2 events.
Guardrail: variant vs off survival/endReason identical on
every seed; any deviation reported and investigated before any
verdict, not averaged away.

Panel note (§15): scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day evening
census, or an env-gated single-mechanism probe (same declaration
as every prior strand arm). Comparison here is off-vs-variant
legs on identical seeds through the bankretain analyzer, never
labeled a panel comparison. No game-code change was made, so no
panel comparison was owed.

## Verdict: INSUFFICIENT-DATA (§14a SUBSTRATE-MISSING)

| clause | bar | result |
|--------|-----|--------|
| Judgeable sample | >= 3 judged known-edible banks after pre-registered expansion | 0 judged on 16 seeds x 2 legs. FAIL (the pool, not the instrument) |
| Retention-confirmed | >= 3 judged, all retained | 0 judged — no claim made, in either direction |
| Vanish-characterized | >= 1 judged vanished with traced mechanism | 0 judged — nothing to characterize |
| Censored | (reported, never judged) | 1 event, both legs: seed 15003 loop-day 30, delta 195 kcal — the SAME event the prior arm censored, still censored (see §1) |

The 60-day horizon did NOT un-censor the 15003 bank, because the
village still dies at day 30 on both legs (see §1). The longer
horizon bought a new strand (16505, days 47-48 + 59-60) but no
new known-edible bank: its stranded evenings added zero edible
food. Across 32 variant legs (16 seeds x guard + ON), exactly
ONE evening bank added edible food in-stack — and it is the
censored one. The edible-bank pool is 1 event per 32 legs, and
that event dies with its village before morning. That is a
substrate-pool finding, not a retention finding: no retention
claim, no vanish claim, no fix. A future arm must change the
substrate (see §6), not re-run this census.

## 1. THE CENSUS (16 seeds, guard + ON, off + variant, 60d)

Corpora: evidence/2026-11-04/sim-bankretain-a-corpus-{guard,on}-
{off,variant} (16 files each, 64 total). Analyzer:
scripts/analyze-bankretain-b.js. All bankfood errs 0 on all 64
files. Stranded-away seeds at 60d: 15003, 15376, 15211 (1 skip
evening), 16505. The other 12 seeds never strand in 60 days.

All evening bank/flip events with >= 1 forage action, guard
variant leg (ON leg agrees on every judged-relevant row):

| seed/loop-day | mode | Eknown | unknown | delta | post-bank edible | next morning? | class |
|---|---|---|---|---|---|---|---|
| 15003/24 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 15003/25 | flip | 0 | 7 | 0 | 0 | yes | lump-only (excluded) |
| 15003/26 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 15003/27 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 15003/29 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 15003/30 | flip | 195 | 3 | 195 | 195 | NO | CENSORED |
| 15376/8 | flip | 0 | 18 | 0 | 0 | yes | lump-only (excluded) |
| 15376/9 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 15376/10 | flip | 0 | 0 | 0 | 0 | yes | lump-only (excluded) |
| 16505/48 | flip | 0 | 0 | 0 | 0 | yes | no-gain (excluded) |
| 16505/59 | flip | 0 | 0 | 0 | 540* | yes | carried-edible (excluded — see §2) |

* 16505/59's 540 kcal was already in the pack BEFORE the evening
phase (carried, foraged during the competent day); the evening
bank added 0 edible kcal, so it fails the prereg's judged-event
definition (delta > 0). It is reported in §2 as an observation
only — it is NOT counted toward the >= 3 bar, and no verdict
rests on it. Re-scoring it as judged would violate §14.

Why 15003 still censors at 60d: the village is lost at day 30
on ALL FOUR legs (guard/off, guard/variant, on/off, on/variant
— daysAlive 30, endReason village-lost, identical). The
horizon extension cannot help a seed whose village dies on the
bank day itself: there is no day 31 in-stack, on any leg. The
day-30 bank is reproduced verbatim (same presses, same 195 kcal
Blackberry + 3 unknown nuts, same late-work line — see §4), so
the prior arm's censored event is confirmed real and still
unjudged, not an artifact.

New strand, 16505: travel-refused evenings at a trail_edge tile
(loop-days 47-48) plus out-of-reach evenings at a forest_floor
tile (loop-days 59-60). The old travel-refused population DOES
occur here (unlike the prior pilot band) — but its banks add
nothing edible. The strand shape the prereg hoped for (an
earlier strand with repeat known-edible banks) did not occur:
16505's strand starts at day 47, not day 8.

## 2. OBSERVATION (NOT a judged event): carried edible food DOES survive the night — and upkeep eats it first

Seed 16505, loop-day 59, guard + ON legs identical. The scholar
ends a stranded out-of-reach evening at a forest_floor tile
(8,2) carrying 540 kcal of Muscadine Grapes (6 x 90 kcal,
spoilDay 63, foodState ready) foraged during the competent day.
The evening bank phase adds nothing (2 gathers, 0 forages —
the patch is worked out). Stage chain, canonical snapshots:

- Post-bank (evening, loop-day 59): edible 540, lump 0.
- First upkeep (true post-sleep morning, scholarDay 61):
  edible 540, lump 0, scholar kcal 344. THE GRAPES SURVIVED THE
  NIGHT INTACT — same stacks, same units, same spoilDay.
- Daily-entry morning phase (loop-day 60): packBefore edible 0,
  scholar kcal 884, ate = false, skip = 'no-pack-food'.

The 540 kcal did not vanish: 884 - 344 = 540 exactly. The
morning upkeep's competentEat ate the grapes between the true
morning snapshot and the daily-entry morning phase. So the
morning pack-eat phase never saw them — not because the night
took them, but because upkeep ate them first.

This is the second shadow over the morning pack-eat phase, and
it is now measured, not guessed. The prior arm's shadow: banks
are unknown lumps the phase cannot eat. This arm's shadow: even
when known-edible food IS present at the true morning, the
upkeep eat consumes it before the morning phase runs, so the
phase's precondition (pack edible > 0 at daily entry) is
essentially unreachable in-stack. A morning pack-eat design
must either run before upkeep eating or accept that upkeep
eating IS the morning meal. This observation changes no verdict
(it is not a judged bank event), but it is the mechanism the
next run's metric must be built around (see §6).

## 3. GUARDRAIL DEVIATION, INVESTIGATED (15376)

Variant vs off survival/endReason match on 15/16 seeds on both
legs. The exception, both legs: seed 15376 — off legs die at
day 49 (village-lost), variant legs survive 60 days. The
proof-test corpus check reports this as its single failure
(76/77 checks green per leg; the failure is this deviation on
both legs — see Proof).

Mechanism, traced to the exact evening: trajectories are
identical through loop-day 7 (same outcome, tile, kcal every
day). They diverge at the FIRST acted variant evening,
loop-day 8 (flip): the variant scholar ends at 2238 kcal vs
the off leg's 2310 — the flip's walk + gathers + forages cost
72 kcal and draw RNG the off leg never draws. From there the
RNG streams diverge and the village fates diverge. This is NOT
instrument corruption: the BANKFOOD=0 legs delegate untouched
(code path + prior arm's det-gate proof), and the divergence
begins exactly at the first variant action, as an acting
variant must. The prereg's guardrail as written ("identical on
every seed") assumed the prior arm's 30d coincidence would hold
at 60d; it does not, because an acting variant necessarily
perturbs trajectory. The guardrail needs the revision in §6
(pre-action-day equality, not whole-run equality). The verdict
does not depend on neutrality: the judged count is 0 on both
legs regardless.

## 4. SENSE TEST (law — read end to end)

There are ZERO judged banks, so there are no judged morning /
pack lines to quote — that absence is the result, stated
plainly, not padded. What can be quoted:

The censored bank, 15003 loop-day 30 (identical on all legs):
- "You work the patch: 3x Blackberry — and 3x unknown nuts you
  can't name yet. This patch is picked clean — it'll recover in
  a few days."
- "You work late at the creek — 0 deadfall gathers and 3
  forages — until the night is too far gone for real sleep."
The forage narration is honest: known Blackberry named with
deeper-knowledge detail ("Parts: berries (eat), leaves (tea),
roots (medicinal). Pick ripe (black, not red). (Yield +50%)"),
unknowns called unknown. The late-work line promises nothing
about morning. Then there is no day-31 morning at all — the
village is lost — so there is no morning line to judge, and
none is invented.

The carried-edible morning, 16505 loop-day 60 (observation
only): the day opens with NO line about the grapes. The
540-kcal breakfast is visible only as the kcal jump (344 ->
884) between the true-morning snapshot and the daily-entry
morning record; the morning phase records skip 'no-pack-food'
and says nothing. A player would never know they ate 540 kcal
of grapes for breakfast — the meal is silent. That silence is a
real sense gap in the upkeep-eat path (not in the bank line),
filed below. The day's own narration is otherwise coherent:
foraging Hickory Nuts in shell, a wary deer, notebook-breathing
for trauma — a scholar still working a stranded forest tile,
not a robot loop.

Small wrinkle, not a finding: the late-work line says "at the
creek" on 16505's forest_floor evenings (loop-day 59: 2 gathers,
0 forages). The day's travel does cross a creek ("The creek
runs fast here — no crossing without a bridge or a swim"), so
the line is defensible, but the line is hardcoded, not tile-
aware. Voice-only; not fixed here.

## 5. VILLAGE ASSESSMENT (plain words)

At 60 days the picture sharpens: most villages never leave
haven at all. Twelve of sixteen seeds never strand in 60 days
— the scholar stays home while the village lives or dies
there. The stranded seeds tell two different bad weeks: 15003
starves at a creek tile for nine nights and loses the village
on the bank day itself; 16505 strands late (days 47-48, then
59-60) as a competent, equipped scholar (crossbow, surgeon's
kit, multitool) still working forest patches and gathering
deadfall, carrying real food home in its pack. The 15376
variant-survives-while-off-dies split is a reminder that one
evening of extra foraging can tip a village's fate through the
RNG stream — not a lever effect, just chaos with a named
starting point.

## 6. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- The judged-event definition was too narrow, in a way this
  run proves: it required the EVENING BANK to add the edible
  food (delta > 0), but in-stack the edible food that reaches a
  stranded morning is CARRIED (foraged during the competent
  day, as on 16505/59), not bank-added. The next run should
  define the event as "edible pack at a stranded evening ->
  true morning", regardless of which phase put it there. That
  redefinition is proposed here for the next run only; this
  run's 0-judged verdict stands under the definition it
  pre-registered.
- The morning pack-eat phase needs a mechanism decision before
  any further measurement: upkeep competentEat consumes edible
  pack food before the morning phase runs (§2). Measuring the
  morning phase's firing rate without fixing or accounting for
  that ordering measures the shadow, not the phase. Next run:
  either record the upkeep-eat as the morning meal, or gate
  the phase before upkeep.
- The neutrality guardrail needs revision for acting variants:
  whole-run survival equality is unachievable when the variant
  acts (15376, §3). The honest guardrail is equality through
  the last pre-action day + a named divergence point for any
  later split — plus the OFF-leg det-gate (wrapper neutral
  when OFF), which is the actual instrument check.
- The horizon lesson: extending the horizon does not un-censor
  an event censored by village death on the bank day. Future
  arms needing a following morning should ALSO require the
  seed to survive past the bank day on OFF legs (a
  survivorship screen), or pick seeds whose strands end
  mid-horizon — the 15003 strand ends exactly at the village's
  death, which no horizon fixes.
- The >= 3 bar was the right bar: with n=1 the run would have
  faced pressure to claim retention from a single carried case
  (§2). The bar held. The failure is the pool (1 bank-added
  edible event in 32 legs), and the pool is the next run's
  substrate problem: either a seed band screened for stranded
  evenings with known-edible yields, or a probe-driven design
  where the scholar is GIVEN known-edible food before a
  stranded night (the probe route the prior arm already
  validated in isolation) and the in-stack question is asked
  about carried food, not bank-added food.

## 7. REACHABILITY / WALL NUMBERS (observed, NOT attributed)

A 60-day strand census does not read national / table / wins —
stated plainly, not fabricated. What the corpus reads
(variant legs, guard + ON agreeing except 15376 survival):
median survival 60 days (census boundary; 11/16 seeds at 60 on
guard variant); maxWaveUnlocked 2 on 2 seeds, 3 on 11 seeds, 4
on 3 seeds (15439, 16501, 16502). Wave reach is NOT a GO input
on a strand census and no lever-effect claim is made from it.
No wins, no national, no table are read by this corpus — the
scale wall is untouched by this arm and unmeasured here.

## Proof

- scripts/test-bankretain-b.js: pure 13/13 GREEN (retention
  classification incl. named-spoil vs unexplained shortfalls,
  judged-vs-censored extraction, lump-only exclusion).
  Corpus mode (16 seeds x guard + ON, off + variant):
  76/77 checks green per leg; the single failure on each leg
  is the investigated 15376 survival-neutrality deviation (§3)
  — files present + parse, bankfood errs 0 on all 64 files.
  The corpus check's whole-run neutrality assertion is the
  item revised in §6; it is reported as failing, never waived
  or edited to pass.
- Determinism note: guard vs ON variant corpora agree on every
  judged-relevant row (the 15003 censored event and the 16505
  carried chain are byte-identical across legs); variant vs
  off diverge only from the first acted evening on 15376 (§3).
  No byte-determinism re-run was performed (not required: no
  game-code change, no fix landed).
- Corpora: pilot + expansion under evidence/2026-11-04/
  sim-bankretain-a-corpus-{guard,on}-{off,variant} (16 files
  each, 64 total), for the coordinator to merge.
- Pinned base: worktree HEAD at prereg writing time; prereg
  aa8ebd29; instruments e0963ced; evidence + corpora in the
  final commit below.
- node scripts/check.js --quick (first full run, after all sims):
  283 passed, 7 failed in 829s. The run's failure list was
  truncated in capture (piped through tail); the one visible
  failure is a racks-full voice-gate test (next-day re-voice
  count), unrelated to this arm. A second --quick run was
  started to name all 7 but was stopped while still running
  (it showed 8 F marks — flaky count variation, not a new
  signal). Attribution: this arm changed ZERO src/js files and
  ZERO existing scripts, and its two new scripts are not on
  scripts/green-list.txt (verified: no bankretain/bankfood
  entry), which is the only set check.js runs — so none of the
  failures can be caused by this arm. They are reported here
  as pre-existing failures, never waived: the arm's own proof
  (test-bankretain-b.js pure 13/13 + corpus mode 76/77 with
  the single investigated 15376 deviation) stands separately
  from the green list.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — upkeep eat shadows morning pack-eat —
  competentEat in morning upkeep consumes edible pack food
  (540 kcal Muscadine Grapes, seed 16505 loop-day 60: scholar
  kcal 344 -> 884) before the daily-entry morning pack-eat
  phase runs, so the phase sees pack edible 0 and skips
  'no-pack-food' even though the food survived the night
  (first-upkeep edible 540 = post-bank 540). Any morning
  pack-eat design must run before upkeep eating or count the
  upkeep eat as the morning meal (sim-bankretain-a).
- [open] 2026-11-04 — upkeep breakfast is silent — a 540-kcal
  upkeep eat leaves no narration line in the day's record; the
  meal is visible only as a kcal jump between snapshots
  (sim-bankretain-a, seed 16505).
- [open] 2026-11-04 — late strand 16505 — travel-refused strand
  at a trail_edge tile (loop-days 47-48) plus out-of-reach
  strand at a forest_floor tile (loop-days 59-60); the old
  travel-refused population occurs here, unlike the prior
  pilot band, but its banks add no edible food
  (sim-bankretain-a).
- [open] 2026-11-04 — acting variants diverge trajectories —
  a policy variant's first acted evening (15376 loop-day 8:
  scholar 2238 vs 2310 kcal) diverges the RNG stream and flips
  village fate (off dies day 49, variant survives 60); whole-
  run survival equality is not a valid neutrality guardrail
  for acting variants (sim-bankretain-a).
