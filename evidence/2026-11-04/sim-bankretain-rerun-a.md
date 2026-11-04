# sim-bankretain-rerun-a — redefined bank retention: INSUFFICIENT-DATA again (1 distinct judged event; the pool, not the instrument)

Run: oversight-flesh-out-loop, run fleshout-20261104T1836Z, arm
sim-bankretain-rerun-a, axis food-economy. Worktree
sim-bankretain-rerun-a. Measurement re-run on current master;
NO game-code change, NO fix landed, NO silent landing of
anything. Sibling trees never touched; main tree never
touched; hidden_files never touched (coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-bankretain-rerun-a-prereg.md (commit
0e1496a8b). Pinned base: worktree HEAD at prereg writing time.
Instruments commit 0e1496a8b (new analyzer + proof test, 30/30
pure green before any judged sim; prior proof test
test-bankretain-b.js re-run 13/13 green as a regression check).

The changes vs sim-bankretain-a, and ONLY these changes: the
current-master base, and the REDEFINED judged event — "edible
pack at a stranded evening -> true morning" regardless of
whether the food got there by bank/flip or was carried (the
prior bank-added-only definition was too narrow). Everything
else is identical: same 16-seed band, same legs, same 60d
death-aware horizon, same env gates, same instruments
(bankfood-diag.js and bankfood-trace-b.js unchanged).

Primary metric: share of judged events RETAINED at the true
post-sleep morning (first-upkeep snapshot). Upkeep-eat
mechanism decision, picked in the prereg before any sim: the
morning upkeep's competentEat IS the morning meal for
accounting — edible present at the first-upkeep snapshot and
then upkeep-eaten, with the exact kcal chain, counts as
RETAINED-then-eaten, NOT vanished. Vanished = edible gone
with no upkeep-eat accounting.

Judge bar: >= 3 judged events. Retention bar, pre-registered:
RETENTION-CONFIRMED requires >= 3 judged AND all retained at
first upkeep (clean or spoil-swept) — the prior arm's
unanimity standard, kept deliberately: with single-digit n, a
2/3 majority would let one unexplained loss hide inside a
"confirmed" verdict. Retained-then-eaten counts as retained.

Revised neutrality guardrail (binding): trajectory equality
through the last pre-action day + a named divergence point +
the OFF-leg det-gate as the instrument check. Whole-run
survival equality is INVALID for acting variants and was NOT
re-imposed (see §3).

Panel note (§15): scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day
evening census, or an env-gated single-mechanism probe (same
declaration as every prior strand arm). Comparison here is
off-vs-variant legs on identical seeds through the rerun
analyzer, never labeled a panel comparison. No game-code
change was made, so no panel comparison was owed.

## Verdict: INSUFFICIENT-DATA (§14a SUBSTRATE-MISSING)

| clause | bar | result |
|--------|-----|--------|
| Judgeable sample | >= 3 judged events, full 16-seed band | 1 distinct judged event (reproduced on both legs = 2 leg-instances). FAIL (the pool, not the instrument) |
| Retention-confirmed | >= 3 judged, all retained | 1 judged — no claim made, in either direction |
| Vanish-characterized | >= 1 judged vanished with traced mechanism | 0 vanished — nothing to characterize, no fix proposed |
| Censored | (reported, never judged) | 1 event, both legs: seed 15003 loop-day 30, banked 195 kcal — the SAME event, still censored (see §1) |

The redefinition did exactly what it was supposed to do: it
promoted the prior arm's carried observation into a JUDGED
event. The 16505 grapes case is now judged, and it is
retained-then-eaten (see §2). But it is the ONLY judged
event in the whole band. One retained event does not confirm
retention, and the bar held — this run does not claim
retention from n=1, exactly as the prior run refused to claim
it from n=0. The pool is still the problem: across 32 variant
legs (16 seeds x guard + ON), exactly TWO evenings carry
edible pack food into a stranded night — one judged, one
censored. A future arm must change the substrate (see §6),
not re-run this census a third time.

## 1. THE CENSUS (16 seeds, guard + ON, off + variant, 60d)

Corpora: evidence/2026-11-04/sim-bankretain-rerun-a-corpus-{guard,on}-
{off,variant} (16 files each, 64 total) + sweep logs
sim-bankretain-rerun-a-{guard,on}-{off,variant}.log. Analyzer:
scripts/analyze-bankretain-rerun.js. All bankfood errs 0 on
all 64 files. Stranded-away seeds at 60d: 15003, 15376, 16505.
The other 13 seeds never strand in 60 days (15211, which had
a skip evening in the prior arm, has no bank/flip evening in
this rerun — skip-mode evenings are not stranded evenings
and are never events).

All bank/flip evenings with post-bank edible > 0, guard
variant leg (ON leg identical on every judged-relevant row —
judged rows byte-identical across legs):

| seed/loop-day | mode | source | before | post-bank | delta | next morning? | class |
|---|---|---|---|---|---|---|---|
| 15003/30 | flip | banked | 0 | 195 | 195 | NO | CENSORED |
| 16505/59 | flip | carried | 540 | 540 | 0 | yes | JUDGED, RETAINED-then-eaten |

All other bank/flip evenings (15003/24, 25, 26, 27, 29;
15376/8, 9, 10; 16505/48) end with post-bank edible 0 —
lump-only or no-gain — and are excluded, as before.

### The 15003 censored-event re-check on current master: STILL CENSORED

Seed 15003, loop-day 30, both legs, reproduced verbatim:
flip, 4 actions, 195 kcal Blackberry bank-added (delta 195,
before 0) + 3 unknown nuts, same late-work line (see §4).
The village is lost at day 30 on ALL FOUR legs (guard/off,
guard/variant, on/off, on/variant — daysAlive 30, endReason
village-lost, identical). There is no day-31 in-stack on any
leg, so the bank has no following morning and is censored
(reason no-next-loop-day) — the third consecutive run in
which this exact event is censored (30d arm, 60d arm, this
rerun). No horizon fixes a bank made on the village's death
day. The event is real and still unjudged, not an artifact.

## 2. THE ONE JUDGED EVENT: 16505/59 — carried grapes retained, then upkeep-eaten

Seed 16505, loop-day 59 (gameDay 60), guard + ON legs
identical. The scholar ends a stranded out-of-reach evening
at a forest_floor tile carrying 540 kcal of Muscadine Grapes
(6 x 90 kcal, spoilDay 63, foodState ready) foraged during
the competent day. The evening flip adds nothing (3 actions:
walk + 2 deadfall gathers, 0 forages — the patch is worked
out). Stage chain, canonical snapshots:

- Evening packBefore (loop-day 59): edible 540, source
  carried, delta 0.
- Post-bank (evening, loop-day 59): edible 540, lump 0.
  Stacks: 6x Muscadine Grapes, spoilDay 63.
- First upkeep (true post-sleep morning, scholarDay 61):
  edible 540, lump 0, scholar kcal 344. THE GRAPES SURVIVED
  THE NIGHT INTACT — same stacks, same units, same spoilDay.
  Verdict at the true morning: RETAINED (clean, no shortfall).
- Daily-entry morning phase (loop-day 60): packBefore edible
  0, scholar kcalBefore 884, ate = false, skip =
  'no-pack-food'.

The kcal chain is exact: 884 - 344 = 540. The morning
upkeep's competentEat ate the grapes between the true-morning
snapshot and the daily-entry morning phase. Morning
disposition: upkeep-eaten. Under the prereg's mechanism
decision this is RETAINED-then-eaten — retained at the true
morning, then eaten as the morning meal — NOT vanished.
The morning pack-eat phase never fired (ate=false) because
upkeep ate first, exactly as the prior arm observed; the
redefinition plus the mechanism decision is what turns that
observation from "shadowed, unjudged" into a judged,
accounted retention event.

This is the only judged event. It is reported as a number
(1/1 retained), not a verdict: the >= 3 bar is not met, so
no retention claim is made. The mechanism is confirmed in
the sense that the chain reproduces exactly on current
master, on both legs — but one case is not a pattern.

## 3. REVISED NEUTRALITY GUARDRAIL: PASSES (and the 15376 split, re-examined)

- OFF-leg det-gate: PASS on all 16 seeds x both leg-pairs
  (guard-off and on-off): bankfood errs 0 AND zero acted
  bank/flip evenings on every OFF leg. The instrument check
  holds — the wrapper delegates untouched when OFF.
- Pre-action trajectory equality: PASS on all 16 seeds x
  both leg-pairs. For every loop-day before the variant
  leg's first acted bank/flip evening, off and variant
  evening rows agree on (kcal, tile, mx, my, gameDay).
  Proof corpus mode: 110/110 checks green per leg (30 pure
  + 80 corpus: present + parse, errs 0, det-gate, pre-action
  match).
- Named divergence points (first acted variant evening):
  15003 loop-day 24 (kcal delta -14), 15376 loop-day 8 (kcal
  delta -72, the same -72 as the prior arm), 16505 loop-day
  48 (kcal delta -28). Post-divergence splits are expected,
  not guardrail failures.

The 15376 split reproduces on current master: off legs die
at day 49 (village-lost), variant legs survive 60 days, on
both leg-pairs. Under the old whole-run guardrail this
would have been a "failure"; under the revised guardrail it
is the predicted consequence of an acting variant — the
trajectories are identical through loop-day 7, diverge at
the first acted evening (loop-day 8, scholar 2238 vs 2310
kcal in the prior arm's terms; -72 delta here), and the
village fates diverge downstream. The verdict does not
depend on neutrality either way: the judged count is 1 on
both legs regardless.

## 4. SENSE TEST (law — read end to end)

The judged event's lines, quoted, not summarized away:

The stranded evening, 16505 loop-day 59: "This patch is
worked out — step to another green patch and forage again."
"You gather fallen limbs from under the tree. +1 branch +1
bark strip. Slow, but free." (x2) "You work late at the
creek — 2 deadfall gathers and 0 forages — until the night
is too far gone for real sleep." The late-work line again
says "at the creek" on a forest_floor evening — the same
hardcoded, not tile-aware line noted in the prior arm. The
day's travel does cross a creek ("The creek runs fast here
— no crossing without a bridge or a swim"), so the line is
defensible, but it is still hardcoded. Voice-only; not
fixed here.

The morning, 16505 loop-day 60: the day opens with NO line
about the grapes. The 540-kcal breakfast is visible only as
the kcal jump (344 -> 884) between snapshots; the morning
phase records skip 'no-pack-food' and says nothing. A player
would never know they ate 540 kcal of grapes for breakfast.
That silence is the same sense gap the prior arm filed, and
it is STILL PRESENT on current master — the upkeep breakfast
is silent. Per the task, the narration fix is NOT made in
this arm; it is filed below as a separate blank. The day's
own narration is otherwise coherent: foraging Hickory Nuts
in shell, a wary deer, notebook-breathing for trauma — a
scholar still working a stranded forest tile, not a robot
loop.

The censored bank, 15003 loop-day 30 (identical on all
legs): "You work the patch: 3x Blackberry — and 3x unknown
nuts you can't name yet. This patch is picked clean — it'll
recover in a few days." plus the deeper-knowledge Blackberry
line ("Parts: berries (eat), leaves (tea), roots
(medicinal). Pick ripe (black, not red). (Yield +50%)") and
"You work late at the creek — 0 deadfall gathers and 3
forages — until the night is too far gone for real sleep."
The forage narration is honest: known Blackberry named,
unknowns called unknown. The late-work line promises nothing
about morning. Then there is no day-31 morning at all — the
village is lost — so there is no morning line to judge, and
none is invented.

## 5. VILLAGE ASSESSMENT (plain words)

At 60 days the picture is unchanged from the prior arm:
most villages never leave haven at all. Thirteen of sixteen
seeds never strand in 60 days — the scholar stays home
while the village lives or dies there. The stranded seeds
tell two different bad weeks: 15003 starves at a creek tile
for nine nights and loses the village on the bank day
itself; 16505 strands late (days 47-48, then 59-60) as a
competent, equipped scholar (crossbow, surgeon's kit,
multitool) still working forest patches and gathering
deadfall, carrying real food in its pack. The 15376
variant-survives-while-off-dies split is a reminder that one
evening of extra foraging can tip a village's fate through
the RNG stream — not a lever effect, just chaos with a named
starting point (loop-day 8, -72 kcal).

## 6. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- The redefinition worked but the pool did not grow: the
  redefined event turned the prior arm's 0 judged into 1
  judged — the carried case — and no other seed produced a
  carried-or-banked stranded evening in 60 days. Two runs
  now agree the in-stack pool is ~1 edible stranded evening
  per 16 seeds. A third census of the same band will not
  beat the bar. The next run must change the substrate, not
  the definition: either a seed band screened for stranded
  evenings with known-edible yields (a survivorship +
  strand screen, not a blind band), or a probe-driven design
  where the scholar is GIVEN known-edible food before a
  stranded night and the in-stack question is asked about
  carried food — the probe route the bankfood arm already
  validated in isolation.
- The >= 3 bar was the right bar again: with n=1 the run
  faced pressure to claim retention from a single carried
  case. The bar held. The bar should stay at >= 3 for any
  future census of this question.
- The revised neutrality guardrail worked as designed: the
  pre-action match passed everywhere, the divergence points
  are named with kcal deltas, and the 15376 split is no
  longer a guardrail "failure" but a documented divergence.
  Future acting-variant arms should use this guardrail, not
  whole-run survival equality.
- The upkeep-eat mechanism decision should be carried
  forward as settled for this question: upkeep eating IS the
  morning meal for accounting, and any future morning
  pack-eat measurement must either run before upkeep eating
  or count the upkeep eat. Measuring the daily-entry phase's
  firing rate without that accounting measures the shadow,
  not the phase.
- Counting rule for future runs: guard and ON legs reproduce
  the same events (judged rows byte-identical here), so leg
  instances must NOT be counted as independent events. The
  judge bar applies to DISTINCT events (seed + loop-day),
  with leg reproduction reported as a replication check, not
  as sample size. This run's bar math: 1 distinct event, 2
  leg-instances — below 3 under either counting, so the
  verdict is unaffected, but the rule matters for the next
  run's prereg.

## 7. REACHABILITY / WALL NUMBERS (observed, NOT attributed)

A 60-day strand census does not read national / table /
wins — stated plainly, not fabricated. What the corpus reads
(variant legs, guard + ON agreeing exactly):
median survival 60 days (census boundary; 11/16 seeds at 60
on each variant leg); maxWaveUnlocked 2 on 2 seeds, 3 on 10
seeds, 4 on 4 seeds (15221, 15439, 16501, 16502). Wave reach
is NOT a GO input on a strand census and no lever-effect
claim is made from it. No wins, no national, no table are
read by this corpus — the scale wall is untouched by this
arm and unmeasured here.

## Proof

- scripts/test-bankretain-rerun-a.js: pure 30/30 GREEN
  (carried vs banked vs mixed, censored, retained,
  upkeep-eaten kcal chain, vanished, spoil-shortfall naming,
  morning dispositions, revised neutrality, OFF-leg
  det-gate). Corpus mode: 110/110 GREEN per leg (guard and
  ON separately: 16 seeds x present + parse, errs 0,
  det-gate, pre-action trajectory match).
- scripts/test-bankretain-b.js (prior arm's proof, regression
  check): pure 13/13 GREEN.
- Determinism note: guard vs ON variant corpora agree on
  every judged-relevant row (the 15003 censored event and
  the 16505 judged chain are byte-identical across legs);
  variant vs off diverge only from the first acted evening
  (15003 day 24, 15376 day 8, 16505 day 48), with pre-action
  trajectories identical. No byte-determinism re-run was
  performed (not required: no game-code change, no fix
  landed).
- Corpora + sweep logs: evidence/2026-11-04/
  sim-bankretain-rerun-a-corpus-{guard,on}-{off,variant} (16
  files each, 64 total) + sim-bankretain-rerun-a-{guard,on}-
  {off,variant}.log, for the coordinator to merge.
- Pinned base: worktree HEAD at prereg writing time; prereg
  + instruments 0e1496a8b; evidence + corpora in the final
  commit below.
- node scripts/check.js --quick (after all sims): 284 passed,
  6 failed in 785s. The 6 failures are all pre-existing
  green-list failures unrelated to this arm:
  godpath/test-measurement-proof-update.js (retained
  neutrality proof), godpath/test-measurement-workflow.js,
  godpath/test-mobile-combat-cadence.js (Continue round
  wrap), godpath/test-occupation-panels.js (CLI workflow),
  godpath/test-phone-frame-proof.js (stale phone receipt),
  test-establishment-r20-fixes-20261020.js (the racks-full
  next-day re-voice count, also visible in the prior arm's
  run). This arm changed ZERO src/js files and ZERO existing
  scripts, and its new scripts are not on
  scripts/green-list.txt (verified: no bankretain entry),
  so none of the 6 failures can be caused by this arm.
  They are reported here as pre-existing failures, never
  waived: the arm's own proof (rerun proof pure 30/30 +
  corpus mode 110/110 per leg) stands separately from the
  green list.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — upkeep breakfast still silent on
  current master — the judged 16505/59 carried case (540 kcal
  Muscadine Grapes, first-upkeep kcal 344 -> daily-entry
  kcalBefore 884) leaves no narration line; the morning phase
  records skip 'no-pack-food' and says nothing. The meal is
  visible only as a kcal jump between snapshots
  (sim-bankretain-rerun-a). NOT fixed here per the task
  (separate blank).
- [open] 2026-11-04 — late-work line still hardcoded "at the
  creek" — 16505 loop-day 59 forest_floor evening (2 gathers,
  0 forages) carries the creek line; the day's travel does
  cross a creek, so it is defensible, but the line is not
  tile-aware (sim-bankretain-rerun-a). Voice-only.
- [open] 2026-11-04 — 15003 day-30 bank censored a third
  consecutive run — the banked 195 kcal Blackberry event is
  reproduced verbatim on current master and still dies with
  its village on the bank day (daysAlive 30, all legs);
  no horizon un-censors it (sim-bankretain-rerun-a).
- [open] 2026-11-04 — in-stack edible stranded-evening pool
  is ~1 per 16 seeds — across 32 variant legs only 2
  evenings carry edible pack food into a stranded night (1
  judged carried, 1 censored banked); a third census of the
  same band cannot beat the >= 3 bar — the next arm needs a
  strand-screened seed band or a probe-given-food design
  (sim-bankretain-rerun-a).
