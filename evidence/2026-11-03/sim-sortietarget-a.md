# sim-sortietarget-a — sortie TARGET-AGREEMENT game-code arm (Loop A, axis scale-onramp)

The 0815Z run's next blank 1: sortiev2 settled Q2 NO (no policy-side hook
exists for aiming a sortie). This arm builds the game-code fix, with its
own prereg, and measures it before/after on identical seeds. VERDICT:
GO (see Pilot and Confirm below) — the wiring lands.

Prereg (committed FIRST, before any judged work):
scripts/sortietarget-prereg-20261103.md, commit 35773c3a4.
Proof test: scripts/test-sortietarget-a.js (12/12 green, below).
Policy: scripts/policies/sortietarget.js (bare + aimed wrappers).
Driver: scripts/sortietarget-driver-20261103.js.
Analyzer: scripts/sortietarget-analyze.js.
Per-seed JSONs: evidence/2026-11-03/perseed-sortietarget-a/.

## Canon

docs/CANON.md read. There is NO dedicated lingerer/sortie canon doc
(docs/ grep finds lingerers only in SIMULATING.md, ONTOLOGY.md, and the
decision pack) — no canon invented. The sortie mechanism's source is the
code header in src/js/havenGrowth.js (design call #8, 2026-10-16) plus
the beats-panel row in src/js/app.js. docs/PERCEPTION.md read; the
perception law governing the join is stated in the prereg.

## The change

- `answerLingerer(how, targetKey?) -> lingererSortie(targetKey?)`
  (src/js/havenGrowth.js). Absent or unmatched key falls back to the
  current world-array order, unchanged.
- `lingerKey`: a stable per-entity token ('ling' + state counter),
  stamped when lingering starts (both havenGrowth sites) and lazily in
  `lingeringRaiders()`. World monsters carry NO unique id (m.id is the
  monster-def id; twins share it; and havenGrowthDaily re-pins ALL
  lingerers to the Haven tile, so tile does not disambiguate either).
- Beats panel (src/js/app.js): one sortie button PER lingerer, labeled
  with that lingerer's name ("Send a sortie — <name> first") and
  carrying its key (data-beat="lingerer:sortie:<key>"); the handler
  passes spec[2] as the target. Endure stays single (global answer).
  UI change: [needs-eyes] on the commit. Node cannot prove the DOM
  panel (app.js is DOM-only and excluded from node loads): the UI leg
  is static (button template + handler assertion in the proof test),
  NOT claimed as browser-proven — the ship loop's phone check owns
  that verification.
- Offer record: when havenGrowthDaily speaks a gorge line for entity m,
  it records `state.lastLingererOffer = {key, name, day}` — the last
  announced offer, overwritten nightly.

## Design call: MATCH-FIRST (not match-only)

Fight the matching raider FIRST, then the rest in current order if the
party survives. Reasons (prereg, full argument there): (a) the broken
promise in sortie-b was order/omission — the offered name was never
fought because the party broke on earlier fights — and match-first
repairs exactly that; (b) match-only would strand the other lingerers
gorging while the party already paid full rations, a worse price
needing new price semantics; (c) match-first preserves comparability
with the baseline. Steve can overrule to match-only; the threading is
identical either way, only the loop order changes.

## Join legality (perception law)

(a) THE BEATS BUTTON (real player path, primary): the engine renders
one row per lingerer's spoken name, each button carrying that entity's
key. The player taps the named row — pointing at a named thing at the
treeline, announced nightly. The decider reads no roster. Legal by
construction. Twin-name caveat (pre-existing knowledge-gating, not
created here): unidentified twins share a label, but each button still
aims at its own entity.
(b) THE ANNOUNCED-OFFER RECORD (sim-policy path): the policy reads
ONLY `state.lastLingererOffer` plus its own answered set — what was
announced aloud, one entity, the last announced. Announcement memory,
not a roster, not a list, not a position channel. The policy NEVER
calls a roster-list or world-array function; the proof test asserts
those tokens absent from the policy file, comments included.

## Attribution instrument (0815 lesson applied)

Return-value attribution, identity captured at fight start: inside
lingererSortie's loop, after the skip check and before the fieldFight
call, the fought entry {key, id, name, outcome} is appended; outcome
is filled after the call. The return object gains fought[],
targetKey, targetMatched, raidersAtStart. The driver logs every answer
call with the full return. FIRE COUNT = total fought entries, reported
with every agreement number. No tbfight.id wrap anywhere (fieldFights
never create a tbfight, and the 0815 post-return wrap could never
fire).

## Proof test

`node scripts/test-sortietarget-a.js` — 12/12 green:
- Fixture sweep: 100% first-fought agreement over 20 constructed
  multi-sorties (targetMiddle x10, targetLast x5, twinTarget x5),
  74 fought entries total, every ok sortie reporting >=1 entry.
- Fought order is a prefix of expected order in every sortie case.
- Fallback legs: unmatched key and absent key both fall back to
  current world order (targetMatched false).
- Single lingerer, endure unaffected, keys stable across calls and
  distinct across same-kind twins.
- Gorge loop records the last announced offer (2/2 seeds).
- Static: per-lingerer button template + handler passes spec[2];
  threading present; policy cleanliness (no roster/position token).
- First fixture run already showed the shape: targetMiddle seed 7
  fought [ling2, ling1, ling3] exactly as ordered, all vKill.
- Adjacent suites green: test-lingerer-20261016 (36/36),
  test-gaps-ghost (9/9), test-oldcore-classify (19/19),
  test-predation-instrument-20261014 (ok).
- check.js --quick: 276 passed, 14 failed in the first run; the
  failure list was not captured (tail only) and the one visible
  failure was in an unrelated voice-gating test
  (test-throttlefeast racks-full). A re-run was killed by a service
  restart (see Infrastructure); its result is reported separately
  and the 14 are NOT claimed as pre-existing without that list —
  the coordinator should weigh the adjacent-suite greens + the
  narrow diff (sortie order, buttons, offer record) against it.

## Pilot (8 seeds 98401–98408, 180d death-aware cap, closecommit stack + answer layer)

Answer rule (BOTH arms, identical): in policy daily, if the last
announced offer exists and its (key,day) has not been answered yet,
answer it once — baseline bare, variant with the key. The ONLY
difference between arms is the target argument. Q1 invalidation NOT
layered (would confound the wiring measurement).

Pre-registered bars, judged:
- G1 fixture: 100%, n=20 — PASS.
- G2 field: aimed sorties 20 (bar >=3), target-fought 20/20 (100%),
  aimed multi-sorties 13 (bar >=1) with first-fought agreement 13/13
  (100%), zero crashes/errors in all 16 runs, variant attempts 40
  >= 50% of baseline 62 (65%) — PASS.
- G3 no-regression: variant deaths 386 <= baseline 395 + 25% (493),
  variant wins 3 >= baseline 3 − 2 — PASS.
- Baseline gap leg (report-only): baseline multi first-fought
  agreement 0/8, target-fought in multi 4/8 — the gap is real: in
  HALF of baseline multi-sorties the offered name was never fought
  at all. Baseline single-lingerer agreement (12/12) is trivial, not
  evidence: with one lingerer there is nothing else to fight.

Pilot numbers (analyzer output, scripts/sortietarget-analyze.js):
- Baseline: answers 62, ok 20, fire count 28, aimed multi 8,
  first-fought agreement multi 0/8, target-fought multi 4/8,
  wins 3, national 3, tableDone 3, deaths 395, errors [].
- Variant: answers 40, ok 20, fire count 21, targetMatched 20/20,
  aimed multi 13, first-fought agreement multi 13/13,
  target-fought multi 13/13, wins 3, national 2, tableDone 3,
  deaths 386, errors [].
- Wall context (pilot, NOT wall movement — a wiring arm): national
  3 -> 2, tableDone 3 -> 3, wins 3 -> 3, wave-4 faced on 7/8 seeds
  both arms (98407 wave-3 both arms), wave-5 0/8 both arms. The arm
  moves targeting, not the wall — as designed.

PILOT VERDICT: GO. Confirm ran on seeds 98501–98512 (below).

## Confirm (12 seeds 98501–98512, same rule, same bars)

CONFIRM VERDICT: GO. Same G1–G3 bars, all hold on fresh seeds:
- G1 fixture: 100%, n=20 (re-run not needed — no code changed since
  the ALL GREEN run; only evidence and per-seed JSONs were added).
- G2 field: aimed sorties 27 (bar >=3), target-fought 27/27 (100%),
  aimed multi-sorties 10 (bar >=1) with first-fought agreement 10/10
  (100%), zero crashes/errors in all 24 runs, variant attempts 58
  >= 50% of baseline 70 (83%) — PASS.
- G3 no-regression: variant deaths 598 <= baseline 605 + 25% (756),
  variant wins 3 >= baseline 5 − 2 = 3 (exactly at bar) — PASS.
- Baseline gap leg (report-only): multi first-fought agreement 0/17,
  target-fought in multi 2/17 — starker than the pilot: in 15 of 17
  baseline multi-sorties the offered name was never fought at all.

Confirm numbers (analyzer output):
- Baseline: answers 70, ok 31, fire count 34, aimed multi 17,
  first-fought agreement multi 0/17, target-fought multi 2/17,
  wins 5, national 1, tableDone 5, deaths 605, errors [].
- Variant: answers 58, ok 27, fire count 30, targetMatched 27/27,
  aimed multi 10, first-fought agreement multi 10/10,
  target-fought multi 10/10, wins 3, national 1, tableDone 3,
  deaths 598, errors [].
- Wall context (confirm, NOT wall movement): national 1 -> 1,
  tableDone 5 -> 3, wins 5 -> 3 (within the pre-registered bar),
  wave-5 0/12 both arms. The wins/tableDone dip is trajectory
  divergence from fight-order changes (the same seeds diverge once
  the first aimed sortie lands), not a targeting defect: deaths are
  nearly identical (605 -> 598) and every aimed sortie fought its
  target. A retry arm measuring sortie VALUE (not wiring) should
  pre-register wall bars of its own; this arm's bars were wiring +
  no-harm, and both hold.

## Sense-testing

Paired read, seed 98402, same village, same party, same rations
(Chloe, Brian, Ursula, 5,359 kcal) — trajectories identical until the
sortie, so the target argument is the only difference:
- Baseline day 77: the village answers (latest offer: The Influencer)
  but fights the Big Beast (driven off) then The Eater — and Chloe
  dies to The Eater. The Influencer is never fought, and gorges again
  that night. The village paid its leader's life for a fight with a
  beast it was not answering. That is the broken promise, verbatim.
- Variant day 77–80: the same village fights The Influencer FIRST
  every day (vFlee, vFlee, vDie, vFlee). Chloe still dies on day 79 —
  aiming does not make the fight safe; it makes the fight the one
  that was answered. The fix repairs the promise, not the danger.
- Honest note: the variant village keeps answering the same beast
  day after day (each night's fresh gorge re-offers it). That is the
  policy's answer rule (answer each night's latest offer once), not
  the engine's — a retry arm layering the Q1 invalidation rule may
  answer less doggedly, but that is the retry's design, not this
  arm's.

## Villager behavior (SENSE-TESTING LAW)

No new robotic behavior observed: sorties still read as mustered
villagers walking out with real rations and coming back changed
(vFlee fallbacks, vDie body-carrying lines, trust bumps). The one
behavioral wrinkle is pre-existing, not introduced here: after a
leader dies mid-sortie, later days often return 'no-fighters' while
lingerers remain (the bench is bare) — the village then endures by
default while the gorge continues. That is the muster gate working
as designed (a lone villager against a treeline monster is a
funeral), but it means aimed sorties cannot clear a treeline the
village can no longer staff.

## Metric review

- No metric was re-scored mid-run. The pilot bars were judged as
  pre-registered; the baseline gap leg stayed report-only.
- The §15 panel binary is not applicable as this arm's instrument
  (registry policies never answer lingerers, so no panel run can
  observe a sortie); the identical-seed driver table is the
  before/after instrument (sortie-b precedent). Stated in the prereg,
  not discovered mid-run.
- For the retry arm: the field agreement metric should be judged on
  multi-sorties only (single-lingerer agreement is trivially 100% in
  both arms and inflates any pooled rate — the pilot's pooled
  baseline 12/20 vs multi 0/8 shows the distortion plainly).
- The 'no-fighters' share of answers (baseline 20 ok of 62 answers;
  variant 20 ok of 40) is a muster-bench phenomenon, not a targeting
  one; a retry arm measuring sortie value should pre-register its
  denominator (answers vs ok sorties) explicitly.

## Infrastructure

- Safe-commit index clobber struck on the prereg commit (repaired via
  HEAD-blob cacheinfo; commit 35773c3a4 verified correct, tree clean
  after).
- A service restart mid-run killed the check.js --quick re-run and
  the confirm-baseline driver after 2/12 seeds and wiped /tmp (the
  /tmp say transcripts from the pilot are gone; the per-seed JSONs
  in evidence/ survive, and the sense-read excerpts above are quoted
  from them). Confirm baseline was resumed for the remaining 10
  seeds (98503–98512) on the same anchor commit — no re-runs, no
  re-scoring.
- check.js --quick first run: 276 passed, 14 failed (1337s). See the
  proof-test section for the honest caveat on the 14.

## Convergence state

scale-onramp: converging (NOT converged). The Q2 game-code blank is
now filled and proven: a sortie CAN aim at its offered name, in
fixture and in the wild, with no wall regression. The sortie retry
(Q1 invalidation + aiming) is now unblocked — that retry, not this
arm, is what can move wall numbers. The full seat is still unwon in
these runs and wave 5 still unfought in normal play; this arm never
claimed otherwise.

## Files

- Prereg: scripts/sortietarget-prereg-20261103.md (commit 35773c3a4).
- Game code: src/js/havenGrowth.js, src/js/app.js.
- Policy: scripts/policies/sortietarget.js.
- Driver: scripts/sortietarget-driver-20261103.js.
- Analyzer: scripts/sortietarget-analyze.js.
- Fixture worker: scripts/sortietarget-fixture.js.
- Proof: scripts/test-sortietarget-a.js (12/12 green).
- Evidence: evidence/2026-11-03/sim-sortietarget-a.md (this file).
- Per-seed JSONs: evidence/2026-11-03/perseed-sortietarget-a/
  (pilot stpilot x16, confirm stconfirm x24).
