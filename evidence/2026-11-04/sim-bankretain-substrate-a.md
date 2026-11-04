# sim-bankretain-substrate-a — strand-screened band: RETENTION-CONFIRMED (3/3 distinct judged events retained)

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z, arm
sim-bankretain-substrate-a, axis food-economy. Worktree
sim-banksubstr-a. Measurement on current master; NO game-code
change, NO policy change, NO fix landed. The probe fallback was
pre-registered but NEVER TRIGGERED (the screen hit the bar), so
no probe code was written. Sibling trees never touched; main
tree never touched; hidden_files never touched (coordinator
owns the backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-bankretain-substrate-a-prereg.md (commit
49c965d06). Pinned base: worktree HEAD at prereg writing time.
Instruments commit 49c965d06 (new distinct-event union +
proof test, 11/11 pure green before any judged sim; prior proof
test test-bankretain-rerun-a.js re-run 30/30 green as a
regression check). ONE instrument correction after the screen,
disclosed in full in §0 below — it aligns the analyzer's code
with the prereg's written definition; it does not change the
metric, the bar, or any counting rule.

The substrate change vs both prior arms, and ONLY this change:
instead of re-censing the old 16-seed band a third time, this
run SCREENED a fresh band (seeds 17001–17040, none from the old
band) for stranded evenings carrying edible pack food, in
blocks of 8, stopping early once cumulative DISTINCT judged
events reached >= 3 — then censused ONLY the screened seeds
with full legs. Everything else adopts the rerun arm: the
REDEFINED judged event (edible pack at a stranded evening ->
true morning, regardless of which phase put it there), the
upkeep-eat mechanism decision (morning upkeep's competentEat IS
the morning meal; retained-then-eaten counts as retained), the
60d death-aware horizon, the same env gates, the same driver
(bankfood-trace-b.js) and analyzer (analyze-bankretain-
rerun.js, as corrected in §0).

Primary metric: share of DISTINCT judged events RETAINED at the
true post-sleep morning (first-upkeep snapshot). Count
DISTINCT events (seed + loopDay), never leg-instances; a
distinct event is RETAINED iff every judged leg-instance of it
is retained; differing instance verdicts flag DISAGREED, which
fails unanimity. Judge bar: >= 3 distinct judged events, ALL
retained (clean or spoil-swept) — the prior arms' unanimity
standard, kept deliberately.

Panel note (§15): scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day
evening census, or an env-gated single-mechanism probe (same
declaration as every prior strand arm). Comparison here is
off-vs-variant legs on identical seeds through the rerun
analyzer + the distinct-event union, never labeled a panel
comparison. No game-code change was made, so no panel
comparison was owed.

## Verdict: RETENTION-CONFIRMED (measurement result, NOT a kill)

| clause | bar | result |
|--------|-----|--------|
| Judgeable sample | >= 3 distinct judged events | 3 distinct judged events (2 census seeds). PASS |
| Retention-confirmed | >= 3 judged, ALL retained | 3/3 retained: 1 clean, 2 spoil-swept. PASS |
| Vanish-characterized | >= 1 judged vanished with traced mechanism | 0 vanished, 0 partial-unexplained. Nothing to characterize |
| Censored | (reported, never judged) | 0 censored events in this run |
| Disagreement | (must be 0 for unanimity) | 0 disagreed; all 3 events reproduce identically on guard + ON legs (6 leg-instances, same verdict each) |

Edible pack food at a stranded evening DOES survive the night
in-stack: what the dawn takes is exactly what the documented
per-form spoil sweep takes (forms whose spoilDay arrived), and
nothing else. No unexplained overnight loss appears in any of
the 3 judged events, on either leg. This closes the blank the
two prior arms could not close — not by re-running their
census, but by changing the substrate, as both of their metric
reviews directed.

SOURCE CAVEAT, stated plainly: all 3 judged events are
CARRIED source (food foraged during the competent day, already
in the pack at the stranded evening). NO bank-added-edible
event (evening phase itself adding edible food) was judged in
this run either — the original 15003/30 bank case remains
censored from the old band and does not recur here. The
verdict confirms overnight retention of edible pack food at
stranded evenings under the redefined event, not of
bank-added food specifically. A future arm that wants the
bank-added case judged still needs a bank that adds edible
food on a surviving seed — this run proves the night does not
take carried food, which is the mechanism the bank-added case
would ride on, but it is not the bank-added case itself.

## 0. INSTRUMENT CORRECTION, disclosed (read before the verdict)

The screen's first analysis labeled event 17021/51 VANISHED.
Its shortfall data said otherwise: the ONLY edible stack (3x
Muscadine Grapes, spoilDay 52) was swept on scholarDay 52 —
a fully-NAMED dawn spoil sweep. The analyzer's branch order
returned VANISHED whenever first-upkeep edible was 0, BEFORE
checking whether every shortfall was named spoil — so a FULL
sweep (every edible stack's spoilDay arrived) was mislabeled
as a vanish, while a PARTIAL sweep (17016/18, grapes persist)
was labeled correctly. The prior arms never hit a full sweep,
so the edge never fired before.

The prereg's written definition resolves it: RETAINED-
SPOIL-SWEPT is "every shortfall is a named per-form dawn
spoil sweep," with "an unnamed shortfall is not retention" as
the exclusion. 17021/51 has one shortfall, named, and no
unnamed shortfall — it satisfies the pre-registered definition
of spoil-swept. The fix (commit c864f9df, BEFORE any census
leg ran) reorders the classifier so the spoil check precedes
the vanish check: VANISHED now means only food gone with at
least one UNNAMED shortfall. The metric, the bar, and the
counting rules are UNCHANGED; only the instrument now matches
the binding definition it implements. Proof: new pure checks
(full named sweep -> SPOIL-SWEPT; full unnamed loss ->
VANISHED) in test-bankretain-substrate-a.js, 14/14 green;
rerun regression still 30/30 green. The original VANISHED
label is preserved here so the correction is auditable, never
silent. Had the correction not been made, the verdict would
have read NOT-CONFIRMED on a documented spoil sweep — a
misleading verdict, not a stricter one.

## 1. THE SCREEN (24 seeds, blocks 1–3; band exhausted at the bar, not the band)

Screening leg: guard-variant only (BANKFOOD=1, WOODWARM=0),
60d. Blocks ran in seed order; the pre-registered early stop
fired after block 3 (17017–17024) when cumulative distinct
judged events reached 3. Blocks 4–5 (17025–17040) were NOT run
— the stop rule, not a post-hoc cut. Screen log:
sim-bankretain-substrate-a-screen-guard-variant.log. All
bankfood errs 0 on all 24 files.

| block | seeds | judged (cumulative) |
|-------|-------|---------------------|
| 1 (pilot) | 17001–17008 | 0 (0) |
| 2 | 17009–17016 | 1 (1: 17016/18) |
| 3 | 17017–17024 | 2 (3: 17021/51, 17021/52) |

Per-seed screen table (guard-variant leg; bfEvenings = stranded
evening records; skips are mode 'skip', never events):

| seed | days / end | wave | stranded records | judged |
|------|-----------|------|------------------|--------|
| 17001 | 59 village-lost | 3 | 0 | 0 |
| 17002 | 60 survived | 4 | 0 | 0 |
| 17003 | 60 survived | 3 | 0 | 0 |
| 17004 | 60 survived | 3 | 0 | 0 |
| 17005 | 60 survived | 3 | 0 | 0 |
| 17006 | 60 survived | 3 | 0 | 0 |
| 17007 | 60 survived | 3 | 3 flips | 0 (lump-only) |
| 17008 | 60 survived | 3 | 0 | 0 |
| 17009 | 60 survived | 3 | 0 | 0 |
| 17010 | 57 village-lost | 4 | 1 skip + 2 flips | 0 (lump-only) |
| 17011 | 60 survived | 3 | 0 | 0 |
| 17012 | 34 village-lost | 3 | 0 | 0 |
| 17013 | 60 survived | 3 | 0 | 0 |
| 17014 | 60 survived | 4 | 0 | 0 |
| 17015 | 51 village-lost | 3 | 0 | 0 |
| 17016 | 60 survived | 4 | 3 flips + 1 skip | 1 (17016/18) |
| 17017 | 60 survived | 3 | 0 | 0 |
| 17018 | 60 survived | 4 | 0 | 0 |
| 17019 | 60 survived | 3 | 0 | 0 |
| 17020 | 60 survived | 3 | 2 flips | 0 (lump-only) |
| 17021 | 60 survived | 3 | 3 flips | 2 (17021/51, 17021/52) |
| 17022 | 60 survived | 3 | 0 | 0 |
| 17023 | 60 survived | 3 | 3 flips + 1 skip | 0 (lump-only) |
| 17024 | 60 survived | 3 | 1 flip + 1 skip | 0 (lump-only) |

Seven seeds strand; 21 stranded-evening records (17 flips, 4
skips); 3 judged, 14 flips lump-only / no-gain (post-bank
edible 0), 0 censored. The pool rate on a fresh band is 3
judged per 24 seeds — better than the old band's 1 per 16, but
the same order of magnitude: edible stranded evenings are
rare because most stranded evenings end with lumps or nothing,
not because the night eats the food. Census seeds (≥ 1 judged
event): 17016, 17021 — the cap of 8 never bound.

## 2. THE CENSUS (census seeds only, 4 legs each; union verdict)

Census legs (60d): guard-off, guard-variant (= screen files,
reused, not re-run), on-off, on-variant. Logs:
sim-bankretain-substrate-a-census-{guard-off,on-off,
on-variant}.log. Corpora: evidence/2026-11-04/
sim-bankretain-substrate-a-corpus-{guard-off,guard-variant,
on-off,on-variant}. Union report:
sim-bankretain-substrate-a-union.json (distinct-event union
across guard-variant + on-variant legs).

| distinct event | source | post-bank edible | first-upkeep (true morning) | verdict | morning disposition |
|---|---|---|---|---|---|
| 17016/18 | carried | 935 | 90 (Blackberry swept, grapes persist) | RETAINED-SPOIL-SWEPT | upkeep-eaten-unexact |
| 17021/51 | carried | 270 | 0 (grapes swept, named) | RETAINED-SPOIL-SWEPT | still-in-pack (0/0) |
| 17021/52 | carried | 270 | 270 intact | RETAINED | upkeep-eaten-unexact |

Stage chains, canonical snapshots:

- 17016/18 (forest tile, acted flip, divergence day 18,
  -2 kcal): evening pack 13x Blackberry (65 kcal, spoilDay 19)
  + 1x Muscadine Grapes (90 kcal, spoilDay 21) = 935, delta 0
  (carried). First upkeep scholarDay 19: Blackberry absent
  (spoilDay 19 <= 19, named spoil, 845 kcal swept), grapes
  intact (90 kcal). Every shortfall named -> spoil-swept.
  Morning phase: packBefore edible 0, skip 'no-pack-food',
  kcalBefore 2400 (first-upkeep kcal 334) — the 90 grapes were
  eaten in the upkeep window, mixed with pantry draws (see §5).
- 17021/51 (thicket 8,8, no-op flip — see §3): evening pack
  3x Muscadine Grapes (90 kcal, spoilDay 52) = 270, delta 0.
  First upkeep scholarDay 52: grapes absent (spoilDay 52 <=
  52, named spoil, 270 kcal swept). The full sweep, now
  labeled correctly (§0). Morning: packBefore edible 0,
  skip 'no-pack-food' — nothing left to eat, nothing eaten.
- 17021/52 (thicket 8,8, no-op flip): evening pack 3x
  Muscadine Grapes (90 kcal, spoilDay 56) = 270, delta 0.
  First upkeep scholarDay 53: grapes intact, all 3 units,
  same spoilDay. Clean retention. Morning phase: packBefore
  edible 0, skip 'no-pack-food', kcalBefore 2310
  (first-upkeep kcal 128) — the 270 grapes were eaten in the
  upkeep window, mixed with pantry draws (see §5).

The 17021/51 → /52 pair is a controlled comparison, same
scholar, same tile area, same food, consecutive nights: the
night the spoilDay arrives, the dawn sweep takes the food
(named, explained); the night it has not arrived, the food
survives intact. That is the documented mechanism behaving
exactly as documented — not a vanish, not a fluke, and it
reproduces identically on both legs.

## 3. NEUTRALITY GUARDRAIL (revised): PASSES on both leg-pairs

- OFF-leg det-gate: PASS on all 4 OFF legs (17016, 17021 x
  guard, ON): bankfood errs 0 AND zero acted bank/flip
  evenings. The instrument check holds.
- Pre-action trajectory equality: PASS on both seeds x both
  leg-pairs. 17016: first acted evening loop-day 18, kcal
  delta -2, all earlier rows agree on (kcal, tile, mx, my,
  gameDay) — the same shape as the prior arms' named
  divergence, here tiny. 17021: NO acted evening exists —
  all three flips record 0 actions with skip
  'no-gather-target' (the flip found no tree/bigtree gather
  target on the thicket tile, so the evening phase did
  nothing and said nothing). Variant and OFF evening rows
  therefore agree on every field for all 60 days: the flip
  is a pure recording of a carried-food night, with no RNG
  draw and no kcal change. The guardrail's "first acted"
  lookup returns null for 17021, and the all-rows match that
  follows is genuine identity, not a vacuous pass — verified
  row by row in the corpus (variant kcal/tile/mx/my equal
  OFF on loop-days 50–53 and throughout).
- Corpus proof: test-bankretain-rerun-a.js corpus mode
  40/40 GREEN per leg-pair (30 pure + 10 corpus: present +
  parse, errs 0, det-gate, pre-action match) — guard pair and
  ON pair separately.

## 4. SENSE TEST (law — read end to end)

The stranded scholar reads as a real person on a bad week
out, not a robot loop. 17021 loop-day 51 (the spoiled-grapes
evening), quoted:

- "Movement — a bobcat, tufted ears, watching you with yellow
  eyes." / "👁 It is hunting you. Don't run — that invites the
  chase. Hold your ground, strike true, or wear the claws."
- "A shot in the dark — you take what's green: 4× unknown
  nuts. Into the bag, unnamed. (Not food until identified —
  sort them at camp.) You also gather deadfall: 2× branches,
  1× bark fiber. This patch is picked clean — it'll recover in
  a few days."
- "Journal: Deep shade. The floor keeps its secrets."
- "Travel 1 tile to thicket." / "— Thick brush — Old nests in
  the thorns, built and abandoned and built again. This tangle
  has been home to a hundred tenants. None of them are you."

The foraging narration is honest (unknowns called unknown,
never silently counted as food), the danger is voiced, the
journal line is a person's line. The BLANK is the night
itself: on a no-gather-target flip the evening phase says
nothing at all — no "you bed down in the thicket," no
mention of the grapes, no morning line about them either.
Loop-day 52 opens with travel and foraging ("You work the
patch: 8× Muscadine Grapes — and 7× unknown shoots you can't
name yet"), learns Field Dressing, learns a Static counter,
gains Lucky Rock — a full lived day — but the 270 kcal that
spoiled at dawn and the 270 kcal eaten in the upkeep window
leave no line anywhere. The morning meal is silent again
(the same gap both prior arms filed): the morning phase
records skip 'no-pack-food' and says nothing, while the kcal
jump (128 -> 2310) is the only trace of breakfast. Voice
gap, not a retention gap — filed below, not fixed here.

## 5. VILLAGE ASSESSMENT (plain words)

At 60 days the fresh band looks like the old band with better
luck: most villages never leave haven at all (17 of 24 seeds
never record a stranded evening), and the ones that strand do
so as competent, equipped scholars still working forest and
thicket patches — 17021 carries a bow, multitool, sutures, a
trail rations pouch, and real food, and spends days 51–53
stranded in a thicket foraging grapes and unknown shoots.
The food story is now complete at the mechanism level: a
stranded scholar's pack is mostly lumps (unknown shoots and
nuts, honestly inedible until identified) plus, on rare
nights, real known food — and that real food survives the
night unless its spoil day has come, in which case the dawn
sweep takes exactly that form and no other. Nothing in this
run suggests the night itself eats food.

One accounting wrinkle, characterized, not hidden: on the two
upkeep-eaten mornings the kcal gain between the first-upkeep
snapshot and the daily-entry morning phase (1028 and 2182
kcal) far exceeds the pack food lost (0 and 270 kcal). The
cause is the competent policy's upkeep eating: competentEat
eats pack first, then draws from the village pantry via
takeFromPantry across the 3 daily upkeeps — and those draws
evidently succeed while the scholar is stranded away (the
DAWNREFUSE gate only blocks when havenStoresAccess() is
'none', which it is not here). So the morning disposition
"upkeep-eaten-unexact" is honest: the grapes were eaten in
that window, but so was ~1000–1900 kcal of pantry food, and
the analyzer cannot attribute the gain to the grapes alone.
The primary verdict does not depend on this chain (it rests
on the first-upkeep pack snapshot, taken before inner upkeep
eats anything), but any future morning-meal measurement must
account for remote pantry draws — filed below.

## 6. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- The substrate change worked: screening a fresh band in
  blocks, stopping at >= 3 distinct judged events, reached
  the bar on 24 seeds where two blind 16-seed censuses
  reached 0 and 1. The block-and-stop rule is selection-neutral
  (it selects on evening pack contents, never on the morning
  outcome) and should be the default substrate design for any
  future rare-evening census. The probe fallback, pre-
  registered but untriggered, stays available — it was not
  needed, and no probe code exists to confuse with judged
  evidence.
- The classifier ordering fix (§0) is a standing correction:
  any future user of analyze-bankretain-rerun.js inherits the
  spec-conformant order (spoil before vanish). The lesson for
  instrument authors: a "vanished" label must mean an
  UNNAMED loss; a fully-named loss is a mechanism, not a
  mystery, even when the loss is total.
- The >= 3 unanimity bar held again, and this time it was
  met: 3 distinct events, 0 disagreements, 0 unexplained
  losses, replication on both legs. The bar should stay at
  >= 3 for any future census of this question.
- The revised neutrality guardrail needs one footnote for
  future arms: a "first acted evening" lookup returns null
  when every flip is a no-op (no-gather-target). That is not
  a guardrail failure — it is the strongest neutrality result
  (variant == OFF everywhere) — but future proof tests should
  assert the no-acted-evening case explicitly rather than
  letting null pass silently.
- The morning-disposition vocabulary needs the pantry-draw
  confound (§5): "upkeep-eaten" should be split into exact
  (kcal chain matches the pack loss, as on 16505) vs unexact
  (gain exceeds the loss; pantry draws mixed in). The
  analyzer already computes the unexact variant; future
  preregs should name it as the expected disposition when
  the competent policy runs.
- Source composition is the remaining caveat (§Verdict):
  3/3 judged events are carried. The redefined event is
  answered; the narrow bank-added case is not. A future arm
  wanting it should screen for BANK-mode evenings with
  delta > 0 on surviving seeds, not re-run a general census.

## 7. REACHABILITY / WALL NUMBERS (observed, NOT attributed)

A 60-day strand census does not read national / table /
wins — stated plainly, not fabricated. What the screen corpus
reads (guard-variant, 24 seeds): median survival 60 days
(census boundary); maxWaveUnlocked 3 on 19 seeds, 4 on 5
seeds (17002, 17010, 17014, 17016, 17018). Census seeds: both
survived 60 days; waves 4 (17016) and 3 (17021). Wave reach is
NOT a GO input on a strand census and no lever-effect claim
is made from it. No wins, no national, no table are read by
this corpus — the scale wall is untouched by this arm and
unmeasured here.

## Proof

- scripts/test-bankretain-substrate-a.js: pure 14/14 GREEN
  (distinct-event union: same event on two legs counts once,
  judged + censored legs, disagreement flags, distinct keys,
  full named sweep -> spoil-swept, full unnamed loss ->
  vanished).
- scripts/test-bankretain-rerun-a.js (prior arm's proof,
  regression check): pure 30/30 GREEN; corpus mode 40/40
  GREEN per leg-pair (guard and ON separately: 2 seeds x
  present + parse, errs 0, det-gate, pre-action trajectory
  match).
- scripts/union-bankretain-substrate-a.js output:
  evidence/2026-11-04/sim-bankretain-substrate-a-union.json
  (3 distinct judged, 3 retained, 0 disagreed, 0 censored).
- Determinism note: guard vs ON variant corpora agree on
  every judged row (all 3 events byte-identical in verdict
  across legs; 17021 variant == OFF on every evening field
  all 60 days; 17016 diverges only at its first acted flip,
  loop-day 18, -2 kcal). No byte-determinism re-run was
  performed (not required: no game-code change, no fix
  landed).
- Corpora + sweep logs: evidence/2026-11-04/
  sim-bankretain-substrate-a-corpus-{guard, on}-{off,
  variant} (guard-variant: 24 files; other legs: 2 files
  each) + sim-bankretain-substrate-a-screen-guard-variant.log
  + sim-bankretain-substrate-a-census-{guard-off, on-off,
  on-variant}.log, for the coordinator to merge.
- Pinned base: worktree HEAD at prereg writing time; prereg
  49c965d06; instrument correction c864f9df; evidence +
  corpora in the final commit below.
- node scripts/check.js --quick: 278 passed, 12 failed in 1458s.
  Six failures are the same pre-existing failures the rerun arm
  reported (godpath/test-measurement-proof-update.js,
  godpath/test-measurement-workflow.js,
  godpath/test-mobile-combat-cadence.js (Continue round wrap),
  godpath/test-occupation-panels.js (CLI workflow),
  godpath/test-phone-frame-proof.js (stale phone receipt),
  test-establishment-r20-fixes-20261020.js (racks-full
  next-day re-voice count)). The other six are new in this run's
  list: godpath/test-measurement-cache-flags.js plus five
  120s timeouts (godpath/test-solo-campaign-endings.js,
  godpath/test-trust-observer-neutrality.js,
  test-synergy-stall.js, test-throttlefeast-20261014.js,
  test-capable-bot-20261014.js). Attribution: this arm changed
  ZERO src/js files, and its one edited instrument script
  (analyze-bankretain-rerun.js) is imported only by the three
  bankretain scripts (verified by grep), none of which is on
  scripts/green-list.txt (verified: no bankretain/bankfood
  entry) — so no green-list failure can be caused by this arm.
  The timeout cluster coincides with a much slower run than the
  rerun arm's (1458s vs 785s), consistent with load flake, but
  that is an inference, not a proof: the 12 failures are
  reported here as observed, never waived. The arm's own proof
  (substrate 14/14 + rerun 30/30 + corpus 40/40 per leg-pair)
  stands separately from the green list. Full log:
  sim-bankretain-substrate-a-checkquick.log.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — upkeep breakfast still silent on
  current master — 17021/52 (270 kcal Muscadine Grapes eaten
  in the upkeep window, first-upkeep kcal 128 -> daily-entry
  kcalBefore 2310) leaves no narration line; the morning phase
  records skip 'no-pack-food' and says nothing
  (sim-bankretain-substrate-a). Recurs from both prior arms.
- [open] 2026-11-04 — stranded night itself has no line on
  no-gather-target flips — 17021 loop-days 51–53 (thicket
  strand, flip with 0 actions, skip 'no-gather-target') say
  nothing about bedding down or the carried food; the day
  record just ends (sim-bankretain-substrate-a). Voice-only.
- [open] 2026-11-04 — competent upkeep draws pantry food
  while stranded away — between the first-upkeep snapshot and
  the daily-entry morning phase the scholar gains 1028 kcal
  (morning after event 17021/51) and 2182 kcal (morning after
  event 17021/52) while stranded in a thicket, far above the
  pack food lost (0 / 270 kcal):
  competentEat's takeFromPantry loop succeeds away from haven
  (DAWNREFUSE gate only blocks when havenStoresAccess() is
  'none'). Any morning-meal measurement must account for
  remote pantry draws; whether remote draws are intended
  engine behavior or a policy/harness gap needs a ruling
  (sim-bankretain-substrate-a).
- [open] 2026-11-04 — haven-gossip lines in a stranded
  scholar's day record — 17021 loop-day 52 carries "Word gets
  around the haven" / "Back at the haven the argument starts:
  Owen is calling it 'The Ugly Beast'" while the scholar
  wakes and evenings in a thicket, away from haven. Needs a
  perception read: is this gossip about events the scholar
  witnessed, or remote haven chatter reaching an away scholar?
  (sim-bankretain-substrate-a). Question only, not a verdict.
- [open] 2026-11-04 — bank-added-edible case still unjudged
  in-stack — all 3 judged events in this run are carried
  source; no evening phase adding edible food on a surviving
  seed was observed (old band's 15003/30 case remains
  censored). A future arm wanting the narrow bank-added case
  should screen for BANK-mode evenings with delta > 0
  (sim-bankretain-substrate-a).
