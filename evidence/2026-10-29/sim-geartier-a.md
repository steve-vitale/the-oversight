# sim-geartier-a — GEAR TIER + ABILITIES: SNARE NO-GO, ABILITIES PASS

Run: gaps-gear arm, run geartier-20261029T0400Z (prior worker) continued
2026-10-29T05:00-07:30Z (replacement worker). Axis: scale-onramp
(blocking axis, converging, NOT converged). Assignment: GEAR-TIER +
ABILITIES (Steve 2026-10-28 22:04: a better tier of gear/abilities
that is actually earnable; Steve 2026-10-28 22:29, folded into this
arm: abilities as a class don't feel impactful enough — a general
abilities-strength pass, not just the new tier).
Preregistration (binding, committed BEFORE any judged run):
evidence/2026-10-29/sim-geartier-a-prereg.md — original commit
2245155f1, Amendment A (opening snare + per-ability P4 shapes)
committed e9a70c4e5 BEFORE any post-build fixture or sweep.
No threshold was changed after any judged run; thresholds below
are the frozen ones. No judged run was counted under an
uncommitted prereg.

## Verdicts (plain words first)

- GEAR TIER (Tangle Line accessory): NO-GO, code KILLED. The line
  works exactly as designed — it deals +78% damage in fixtures and
  halves incoming blows — but the party still runs at round 3 in
  7 of 10 fixture fights, so the median-rounds leg of P1 fails.
  The flee decision is driven by time-to-drop vs time-to-kill,
  and halving incoming damage does not flip that race for a
  100-HP villager against 677 HP of remaining beast. Per the
  frozen prereg (a miss is NO-GO, never re-scored), the snare
  code, the item, and the reward-pool entry were reverted; only
  evidence remains. The wild legs PASSED (P2 saturation, P3
  earn), but GO requires ALL legs, so the item does not ship.
  The earn finding survives as knowledge: the tier-3 pools DO
  deliver a new accessory naturally (4 clean earners in 8
  seeds), and the trajectory finding names what a future
  control mechanism must actually flip.
- ABILITIES PASS (bird / broadcast / mending, 3 existing magic
  verbs, costs unchanged): PASS, 3 of 3 improve with no damage
  regression. Bird Strike now blinds in the field as its card
  promises (taken/round median -10.5%); Live Broadcast emboldens
  the ally for two rounds (ally damage +25.2%); Mending Hands
  runs to a wounded ally too (ally HP left median 52 -> 58).
  Margins on bird and broadcast are razor-thin (0.5 and 0.2
  points over their bars) — reported exactly, not rounded up.
  This code STAYS and is the branch's shippable content.
- Confirm (16 seeds) NOT run: the prereg sends confirm only if
  pilot GO. Pilot is not GO for the snare (P1 fails), and the
  abilities pass has no sweep leg (P4 is fixture-judged). No
  confirm is owed.
- No merge to master, no push, no version bump, no live
  verification by this arm (coordinator line). No gate retune
  anywhere. Forbidden files untouched (storage.js,
  villager-build.js, villager-objectives.js, docs/MAP.md).

## Header (pre-registered) vs result

- P1 (snare fixture): mean mDealt >= CONTROL +30% AND median
  rounds >= CONTROL +1, pooled over both beasts (10 cells/arm).
  RESULT: mDealt 280.3 vs 157.5 (+78.0%, leg PASS); median
  rounds 3 vs 3 (required >= 4, leg FAIL) -> P1 FAILS.
- P2 (snare wild saturation): ARMED-SAT wave-4 judged-U mean
  damage/meeting >= CONTROL-NATURAL +25% AND median rounds >=
  control +1 AND kills+driveoffs >= control count.
  RESULT: mDealt 21.5 vs 10.8 (+99%); roundsMed 2 vs 1;
  kills+drives 0 vs 0 -> P2 PASSES (thin universe: 4 vs 5
  fights, single-seed clusters — see caveats).
- P3 (natural earn): >= 1 villager FIRST observed holding
  tangle_line AFTER day 14 across 8 seeds.
  RESULT: 4 clean earners, 0 joiner-flagged -> P3 PASSES.
- P4 (abilities pass): post-vs-pre per ability on its own
  fixture shape, >= 2 of 3 improve on their named metric AND
  none regresses mDealt by > 10% vs its own pre-change cell.
  RESULT: 3 of 3 improve, 0 regressions -> P4 PASSES.
- GUARDS: no crash, no save corruption, no softlock; recorder
  errs 0, wrapErrs 0, joinMismatch 0 in both bands. Wall numbers
  reported below (guards, not judged).
- SENSE: >= 1 full snare transcript + >= 1 ability transcript
  quoted below and read as played fights -> PASS (the snare
  reads as a thing used with cost and effect; the fights still
  end in flight, which is the honest result, not a numbers
  artifact).

## Fixtures (scripts/test-geartier-a.js, 5 paired seeds x 2 beasts)

Pre-change baselines (HEAD code, same script/seeds, run in a
pristine copy before judging — frozen in
evidence/2026-10-29/geartier-a-prebaseline.json):
control mDealtMean 157.5 roundsMed 3 taken/R 18.3; control-aid
133.4 / 2 / ally 9.1 / allyHpLeft 52; control-aid-hurt 124.3 /
2 / ally 8.8 / allyHpLeft 52; bird-pre 114.1 / 3 / taken/R 19;
broadcast-pre 137.9 / 2 / ally 14.3; mending-pre 98.2 / 2 /
allyHpLeft 52. Verb firing pre: bird 10/10, broadcast 10/10,
mending 6/10.

Post-build (evidence/2026-10-29/geartier-a-postfixture.json):
control 157.5 / 3 (identical — the build changed nothing for
the bare kit); SNARE 280.3 / 3, snareSet 10/10, snareDmgMean
52.8, taken/R 9.0 (halved, as designed), equipFail 0;
bird-post 114.9 / taken/R med 17 (-10.5% vs pre 19);
broadcast-post 146.2 / ally 17.9 (+25.2% vs pre 14.3);
mending-post 98.2 / allyHpLeft 58 (vs pre 52).

P4 detail (exact, unrounded): bird taken/R median 19 -> 17
(-10.53%, bar -10%); broadcast allyDealt mean 14.3 -> 17.9
(+25.17%, bar +25%); mending allyHpLeft median 52 -> 58
(bar: up). mDealt regressions: bird +0.7%, broadcast +6.0%,
mending 0.0% (bar: none worse than -10%). All three pass;
bird and broadcast pass by 0.53 and 0.17 points — thin, and
a future re-measurement on more seeds could overturn them;
the coordinator should know the margins are that tight.

## Why P1 failed (root cause, not opinion)

The snare mechanism fires perfectly: 10/10 sets, ticks
lroll([10,14]) every round, lead blows halved (48 -> 24 raw
in the quoted transcript), taken/round halved 18.3 -> 9.0.
But the round-3 flee is a trajectory decision, not a damage
or wound decision (leader HP 75/100 in the quoted 3-round
fight — healthy). Trajectory math at round 3 of that fight:
~677 beast HP remains at ~60 damage/round -> ~11 rounds to
kill; 75 villager HP at ~9/round incoming -> ~8 rounds to
drop. Hopeless = drop-time < kill-time x 0.85 -> 8 < 9.4 ->
hopeless -> the party runs "while running still works."
Even the 204/215/222-mDealt audit fights fled at round 3.
Amendment A's winning-band estimate (~196 mDealt at round 3
for an 850 beast) was miscalibrated: it ignored that the
race is villager-HP-pool vs remaining-beast-HP, and halving
incoming from ~18 to ~9 does not close that race. Three
fights DID flip (8, 11, 5 rounds: 479/643/325 mDealt) — the
mechanism can flip a fight, but the median fight does not
flip, and P1 judges the median. Mean rounds DID rise
(4.5 vs 3.0) — but the frozen bar is the median, and
re-scoring on the mean is forbidden, so the mean is reported
here only as diagnosis, never as a pass.
A future control mechanism must flip the trajectory itself
(hold the beast, change the race, or change what the flee
rule credits) — more damage of the same shape will not do
it, and this arm does not build that (it would need a new
prereg).

## Pilot sweep (scripts/test-geartier-a-sweep.js, seeds 75101-75108)

Substrate VERBATIM: tableseat-nowait, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware, fieldparty-form-diag
recorder VERBATIM. Arms differ ONLY by a sweep-script-only
wrapper (never a policy default, never game code): NATURAL
(read-only census) vs ARMED-SAT (equips tangle_line on every
fieldFight leader before the fight — saturation, measuring
the ACTION's ceiling, not the earn rate; grant disclosed).
Corpus: evidence/2026-10-29/perseed-geartier-a/{natural,armed}/
(8 rows + summary.json each). Both bands: corpus ok, join
mismatch 0, wrapErrs 0, recorder errs 0.

Judged universe U (w4dpr2 universe, verbatim): wave == 4,
channel field, caller in {resolve, patrol, aid}, leader not
scholar.

NATURAL: meetings 901, judgedU 5, foughtU 5: kills 0, drives
0, fled 4, died 1, mDealtMean 10.8, mDealtMed 13, roundsMed 1,
roundsMean 1.4, snareSet 0/5, heldSnare 0. Wall: won 5 (full
0), natEver 7, natFinal 7, table 6, entered 5, wave4 5,
wave5 0, median days 123, starvation deaths 1, deaths 229.
All 5 judged fights are seed 75107 resolve-caller lone
villagers vs signature beasts (congregation x2, strike x2,
reunion x1), rounds 1-2, mDealt 0-16, vTaken 52-108 — the
wild judged universe is a single seed's catastrophe, and
the wild fight is over before any gear could matter.

ARMED-SAT: meetings 919, judgedU 4, foughtU 4: kills 0,
drives 0, fled 3, died 1, mDealtMean 21.5, mDealtMed 20,
roundsMed 2, roundsMean 1.5, snareSet 2/4, heldSnare 2,
granted 100. Wall: won 3 (full 0), natEver 6, natFinal 6,
table 3, entered 3, wave4 3, wave5 0, median days 132,
starvation deaths 1, deaths 246. All 4 judged fights are
seed 75108 resolve-caller: 2 WITHOUT the snare (granted but
never equipped — acc slots full, saturation leak disclosed),
2 WITH it (suburb: 44 dealt over 2 rounds, 23 of it snare
damage — the snare was more than half the damage; suburb
death: 11 dealt, 11 of it snare, leader died round 1 anyway).

P2 verdict: 21.5 vs 10.8 (+99% >= +25% PASS); roundsMed 2 vs
1 (>= 2 PASS); kills+drives 0 vs 0 (non-regression PASS).
CAVEATS (loud): universes are 4-5 fights on single seeds
that are NOT paired villages — the arms diverged (armed won
3 vs natural 5, wave4 reach 3 vs 5), so the wall gap is a
measured consequence of diverged trajectories, not a clean
causal read; only 2/4 armed judged fights actually wore the
line; the mean jump rides one 44-damage fight. P2 passes on
the frozen bars and would not survive as strong evidence on
its own — and it cannot resurrect P1 regardless.

P3 earn census (natural only; armed is grant-polluted):
clean earners 4, joiner-flagged 0: s75102 naran_tumen
(carried at end), s75102 elena_petrova (wore it in a fight,
day 36), s75103 oliver_moore (carried + equipped at end),
s75107 gen_peonr8i (carried at end). Day-7 snapshots held 0
in every seed, so no earner is a spawn candidate. The
tier-3 pools deliver: monster loot (alien tier-3 pool),
contest/trade/show (extraItems['3']) all feed the same
item without any threshold touched. SECOND GAP, disclosed:
2 of the 4 earners CARRY the line but do not WEAR it
(autoEquip sorts acc slots by bondThresholds; keepsakes
outrank a bond-less tool) — earning the item and fielding
it are different bars, and the wild judged fights show the
same gap (granted-but-unequipped 2/4 in armed). A future
item needs worn-slot priority, not just pool presence.

## Kill record (snare, per prereg severability)

KILLED (reverted, not shipped): fieldFights.js snare
detection block, opening block, tick block, hold/halving
block; items.json tangle_line entry; reward-economy.json
extraItems['3'] tangle_line entry. KEPT: godpath.js
abilities pass (bird blind, broadcast counter, ally mend)
and fieldFights.js abilities blocks (gpOut.allyHp landing,
broadcastN consumption) — verified by diff: post-kill
fieldFights diff vs HEAD is ONLY those two blocks.
Kill-proof (evidence/2026-10-29/geartier-a-killproof.json):
snare cell now identical to control (157.5, roundsMed 3),
snareSet 0/10, equipFail 10/10 (item gone, reported loudly,
never a silent control). Abilities cells post-kill are
byte-identical in summary to post-build (bird 114.9/17,
broadcast 146.2/17.9, mending 98.2/58) — the revert did not
touch the pass.
Side effect found and fixed by the kill: adding ANY item to
items.json broke two unrelated green tests (see check
section) — the killed item was the cause, proven by
bisection, and both are green again post-kill.

## check.js --quick (final tree state: abilities pass only)

Two full runs on the snare+abilities tree: 275 passed / 15
failed (2279s) and 275 passed / 15 failed (2190s, full log
/tmp/check-gear-full.log — counts identical, failures
stable, not flakes). Final full run on the EXACT final
tree (abilities pass only, snare killed): 284 passed / 6
failed in 1529s (full log /tmp/check-gear-final.log).
The kill fixed 9 of the 15. Classification of all 15
(HEAD-code comparison in a pristine copy, single-file
bisection, and post-kill re-runs):
- CAUSED BY THE KILLED ITEM, GREEN ON THE FINAL TREE (9):
  test-noncombat-rewards-20261015 (tier-3 additions need
  real equipment fields — tangle_line had none; HEAD 38/0,
  post-kill 38/0); test-party-opening-turn (joined humans
  distinct squares — items.json alone reproduces it, js
  files alone do not; HEAD 9/0, post-kill 9/0);
  test-cornucopia-wired (finite-harvest chain; HEAD 33/0,
  post-kill 33/0); conversation-spoken-context (HEAD 67/0);
  measurement-cache-flags (HEAD 4/0); occupation-cohorts
  (HEAD 6/0); capable-bot (HEAD 42/0); skill-teaching
  (HEAD 39/0); class-diversity (HEAD 22/0). Mechanism is
  pool-shift in setup draws: a new item changes which
  items seeded draws produce, so tests asserting specific
  generated content (a trade known, a job lean, a voice
  line, a square) shift — not a combat semantic, but the
  empirical bisection is exact, and all nine are green
  on the final tree. Lesson for future content arms: ANY
  items.json addition can move these tests; expect it.
- REMAINING ON THE FINAL TREE (6), all classified:
  measurement-proof-update ("Proof source inputs are not
  current") + measurement-workflow ("retained neutrality
  proof covers the current Game/controller/harness
  inputs") — proof-freshness family: the abilities pass
  still changes godpath.js/fieldFights.js, so the retained
  proofs are stale. Refresh requires a REAL neutral panel
  via scripts/balance-proof-update.js (a measurement job,
  not a hash hand-edit) — coordinator/ship-loop follow-up,
  not done by this arm. mobile-combat-cadence — same 2
  failures on HEAD code, pre-existing. occupation-panels —
  requires scripts/godpath/lib/luck-instrument, which does
  not exist in the tree — pre-existing environmental.
  phone-frame-proof — fails IDENTICALLY on HEAD code
  (whole-branch receipt staleness: the retained receipt
  predates the branch's many files, plus missing browser
  receipts) — pre-existing, not caused by this arm.
  establishment-r20 (racks-full voice gate) — fails
  IDENTICALLY on HEAD code — pre-existing on the branch
  base.
- Node --check clean on all changed files + both
  instruments. No assertion was loosened anywhere, no
  proof hash was hand-edited.

## Sense (law, not optional)

SNARE (3-round fixture fight, quoted verbatim — a thing
used, with cost and effect, ending in honest flight):

```
the person in their 40s, with grey-streaked hair sees the someone the light loves coming and nocks an arrow — the fight opens at range (2 shots).
  loosed wide — the arrow buries itself in the dirt. (spent)
  loosed wide — the arrow buries itself in the dirt. (spent)
the person in their 40s, with grey-streaked hair lowers the bow — the someone the light loves is on them now. (0/2 hit)
the person in their 40s, with grey-streaked hair walks with the line ready — as the someone the light loves closes, the Tangle Line is already across its path. It is tangled now.
R1: the line bites as the someone the light loves struggles — 11 (839 left). (Tangle Line)
  tangled — the someone the light loves's blow comes at half strength. (48 → 24)
the person in their 40s, with grey-streaked hair's gear absorbs 16.
R1: Ratio hits the person in their 40s, with grey-streaked hair for 8 (92 left)
R1: the person in their 40s, with grey-streaked hair strikes for 44 (x1.3) (795 left)
R2: the line bites as the someone the light loves struggles — 10 (785 left). (Tangle Line)
  tangled — the someone the light loves's blow comes at half strength. (50 → 25)
the person in their 40s, with grey-streaked hair's gear absorbs 17.
R2: Ratio hits the person in their 40s, with grey-streaked hair for 8 (84 left)
R2: the person in their 40s, with grey-streaked hair strikes for 44 (x1.3) (741 left)
the person in their 40s, with grey-streaked hair is losing — shouts for help! the person in their 50s, with freckles charges in!
R3: the line bites as the someone the light loves struggles — 13 (728 left). (Tangle Line)
  tangled — the someone the light loves's blow comes at half strength. (55 → 27)
the person in their 40s, with grey-streaked hair's gear absorbs 18.
R3: Ratio hits the person in their 40s, with grey-streaked hair for 9 (75 left)
R3: the person in their 40s, with grey-streaked hair strikes for 45 (x1.3) (683 left)
R3: the person in their 50s, with freckles strikes for 6 (677 left)
the person in their 40s, with grey-streaked hair sees how this ends — and runs while running still works.
```
Judgment: the line reads as a thing used — set in the opening
("walks with the line ready"), biting every round, halving
every blow — and the fight still ends in flight at round 3
with the leader healthy (75 HP). That is the P1 finding in
narrative form: control without a kill is still a retreat.
The volley missing 0/2 also matters: when the volley misses,
round-3 mDealt is 173, not ~205, and the race is worse.

ABILITIES (broadcast, aid shape, quoted verbatim — the
two-round embolden is visible as two "strikes again,
louder" lines, one per round):
```
the person in their 40s, with grey-streaked hair sees the someone the light loves coming and nocks an arrow — the fight opens at range (2 shots).
  loosed wide — the arrow buries itself in the dirt. (spent)
  loosed wide — the arrow buries itself in the dirt. (spent)
the person in their 40s, with grey-streaked hair lowers the bow — the someone the light loves is on them now. (0/2 hit)
the person in their 50s, with freckles is already at the door — charges in with the person in their 40s, with grey-streaked hair!
the person in their 40s, with grey-streaked hair's gear absorbs 27.
R1: Ratio hits the person in their 40s, with grey-streaked hair for 13 (87 left)
R1: the person in their 40s, with grey-streaked hair goes LIVE — the ally fights louder. (Live Broadcast)
R1: the person in their 40s, with grey-streaked hair strikes for 45 (x1.3) (805 left)
R1: the person in their 50s, with freckles strikes for 4 (801 left)
R1: the person in their 50s, with freckles strikes again, louder — 6 (795 left). (Live Broadcast)
the person in their 40s, with grey-streaked hair's gear absorbs 42.
R2: Ratio hits the person in their 40s, with grey-streaked hair for 20 (67 left)
R2: the person in their 40s, with grey-streaked hair strikes for 41 (x1.2) (754 left)
R2: the person in their 50s, with freckles strikes for 5 (749 left)
R2: the person in their 50s, with freckles strikes again, louder — 6 (743 left). (Live Broadcast)
the person in their 40s, with grey-streaked hair sees how this ends — and runs while running still works.
```
ABILITIES (mending, aid-hurt shape, ally-mend cell, quoted
verbatim — the thread runs to the wounded ally):
```
the person in their 40s, with grey-streaked hair sees the someone the light loves coming and nocks an arrow — the fight opens at range (2 shots).
  loosed wide — the arrow buries itself in the dirt. (spent)
  loosed wide — the arrow buries itself in the dirt. (spent)
the person in their 40s, with grey-streaked hair lowers the bow — the someone the light loves is on them now. (0/2 hit)
the person in their 50s, with freckles is already at the door — charges in with the person in their 40s, with grey-streaked hair!
R1: the person in their 40s, with grey-streaked hair strikes for 43 (x1.3) (807 left)
R1: the person in their 50s, with freckles strikes for 6 (801 left)
R1: Ratio hits the person in their 50s, with freckles for 48 (52 left)
the person in their 40s, with grey-streaked hair's gear absorbs 33.
R2: Ratio hits the person in their 40s, with grey-streaked hair for 17 (38 left)
R2: the person in their 40s, with grey-streaked hair presses the wound and it knits: +16 HP. (Mending Hands) The thread runs to their ally: +16 HP.
R2: the person in their 50s, with freckles strikes for 4 (797 left)
the person in their 40s, with grey-streaked hair sees how this ends — and runs while running still works.
```
Judgment: both verbs read as things done in a fight, not
numbers — the broadcast's second-round echo and the mend's
second body are visible in the log. Note the honest limit:
the mend reaches the ally only when the ally is already
wounded at mend time (first mending cell: ally unwounded at
R1, mend goes to the leader only). The median gain (52 ->
58) comes from the cells where that condition holds.

## Metric review (doubts, not re-scores)

- P1's median on a bimodal distribution (7 fights at 3
  rounds, 3 at 5/8/11) is a harsh statistic for a mechanism
  that flips some fights: the mean moved 3.0 -> 4.5. The
  bar stays as frozen; a future prereg for a control
  mechanism should judge the flip rate or the mean, not the
  median alone — named here for the NEXT run, not this one.
- P2's universe (4-5 fights, single seeds, diverged arms)
  is too thin to carry a design conclusion alone; P2's pass
  is formal, not strong.
- P4's bird and broadcast margins (0.53 / 0.17 points) are
  within seed noise: the same script on different seeds
  could flip either. The pass stands on the frozen seeds;
  a confirm re-run of the fixture on fresh seeds would be
  the honest robustness check, and is recommended before
  anyone cites the pass as strong.
- The sweep's armed band diverges from natural (different
  villages by mid-run), so wall-number gaps between arms
  are NOT paired comparisons. The judged-U comparison is
  still the prereg's comparison (identical seeds, same
  substrate, differing only by wrapper) — but the wrapper
  changes fight outcomes, which cascade into different
  villages. That cascade is inherent to the design, and is
  why the wall numbers are guards, not verdicts.

## Files

- Prereg: evidence/2026-10-29/sim-geartier-a-prereg.md
  (commits 2245155f1 + e9a70c4e5).
- This note: evidence/2026-10-29/sim-geartier-a.md.
- Fixture JSONs: evidence/2026-10-29/
  geartier-a-prebaseline.json (pre-change baselines),
  geartier-a-postfixture.json (judged post-build),
  geartier-a-killproof.json (post-kill verification).
- Sweep corpus: evidence/2026-10-29/perseed-geartier-a/
  {natural,armed}/ (8 rows + summary.json each).
- Instruments: scripts/test-geartier-a.js,
  scripts/test-geartier-a-sweep.js (new, committed with
  the final state).
- Shippable code (abilities pass only):
  src/js/godpath.js (bird blind, broadcast counter, ally
  mend), src/js/fieldFights.js (allyHp landing, broadcastN
  consumption). KILLED, not in the final tree: the snare
  blocks, the tangle_line item, the extraItems['3'] entry.
- No panel artifact: scripts/balance-panel.js has no
  census-ingest mode (standing §15 substitute). Identical-
  seed paired tables are the substitute; no panel artifact
  faked, no panel verdict claimed.
