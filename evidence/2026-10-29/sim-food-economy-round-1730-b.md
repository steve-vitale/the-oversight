# sim-food-economy-round-1730-b — coordinator evidence (Loop B, axis food-economy)

Run: fleshout-loop-b-20261029T1730Z. Axis: food-economy (second non-converged
axis; loop A live on scale-onramp 1715Z tilejoin/fullseat, NOT touched).
Claim: hidden_files/lever-claims/fleshout-loop-b-20261029T1730Z.json (deleted
at closeout). Base at dispatch: 6dccc8b5a. Both arms merged locally, pending
ship (no push, no version bump, no live verification — the ship loop owns
deploys).

## Arm 1 — sim-lackingline-b: INSUFFICIENT-DATA (measurement only, zero src/js)

Backlog #1424 / #1444 (fourth run): the woodcarry lacking-line is unit-proven
but had never played in a tail, because no still-refused ON creek evening had
occurred in three prior runs. This arm staged one honestly instead of lowering
the bar — and still found none.

- Prereg (before any judged leg): c934fdb96. Evidence: cb82e02f0 (merged).
- Screen: 60 sequential seeds 13300–13359, woodcarry3 driver ON, 30 loop-days,
  stripped driver family (no thief grant, no taps, detour OFF). 1,797 evenings.
- Travel-refused: 14 (0.8%). Creek: 3. Other-refused: 11. Unclassified: 0.
- Still-refused ON creek evenings: 0 (minimum-n 1 unmet). Lacking-lines
  owed/fired in play: 0/0. Sense-test on a played still-refused tail: NOT
  PERFORMED (no such tail exists — recorded as not performed, never as a pass).
- The 3 creek evenings (all rescued, no line owed): 13323 day 25, 13327 day 30,
  13336 day 29 — every one held wood exactly 4, kcal in the thousands vs the
  60 floor, ticks above the 96 floor; bridge built, retry arrived, narration
  null.
- Diagnosis: the funnel narrows twice — most outside nights never attempt the
  hop (53 out-of-reach evenings), and on every creek evening the lever's
  precondition held with huge margin. Competent play keeps kcal near ~2400 and
  the pack stocked, so the gates the line names almost never bind.
- Coordinator proof re-run post-rebase:
  `node scripts/test-lackingline-b.js --census <screen-census>` → 10 checks
  pass; T4 determinism not-checked without --det files (the worker's
  byte-identical re-run check for seed 13336 stands, as in prior rounds).
- Disposition: #1424 / #1444 stay OPEN. The line is still unit-proven only
  after four runs.

## Arm 2 — sim-raidname-b: GO (narration-only game change, [needs-eyes])

Backlog #1445: dawn raid fights announced only the generic BREACH line, never
that the arrival was a haven raid, and the say window interleaved night-raid
casualty narration with fight-start lines without flagging raid aftermath.

- Prereg: db6abb449 (before any judged leg). Amendment (pre-judging instrument
  correction — BREACH is once-per-run via fireCrisis dedup; creation sayTail
  is only the last 12 lines): 45036b492. Wording: 734083429 [needs-eyes].
  Evidence: 559c5787f (merged).
- Census re-derived on current master (backlog #1446 honored — the old
  morningpersist miss set was NOT quoted as current): band 10710–10725,
  30 days, insideevening policy, fightorigin substrate. Miss mornings
  unchanged from fightorigin (10712/21, 10713/28, 10720/18), but the census
  is much bigger than the backlog's 3-morning framing: 25 dawn-raid mornings /
  25 dawn-raid fights out of 36 morning creations (33 haven).
- Pre-change: 0/25 tails named the raid; 11/25 showed BREACH in-tail (rest
  spent by once-per-run dedup or pushed out of the 12-line window).
  Post-change: 25/25 raid-named. Neutrality: non-say fields deep-equal 16/16;
  say diff exactly the added lines modulo 12-line tail truncation (one BREACH
  line pushed out of a tail window — a window artifact, not a removal).
  Miss mornings unchanged (3, same seeds). Sense: all three miss-morning tails
  read PASS post-change.
- What landed (narration-only, no mechanism/balance/policy change):
  src/js/havenGrowth.js (raidBorn entity flag at draft + raidPendingMonsterId
  pending shadow), src/js/game.js (startCombat raid line said last + aftermath
  guard + 5 pending-overwrite clears), src/js/feastBuff.js (1 overwrite clear)
  — 3 files, +80 lines, no deletions. Key finding: an entity-flag-only first
  cut named just 4/25, because pending-resolved fights are instantiated by
  species id, not lifted from the world entity (10712's raid murkcaps sat at
  (4,3)/(3,4)/(5,4) around haven (4,4) at fight time while the fight's murkcap
  entered fresh at 65/65). Pending shadow (consumed on match, cleared on
  non-raid pending overwrite) + entity flag union gives 25/25.
- Correction to fightorigin's sense note: 10713/28's Rasha fall is the dawn
  fight's own opening exchange (creation snapshot is post-opening-turns;
  the engine does not seat 0-HP villagers — unit-proven), NOT raid aftermath
  interleaved. The gap was raid-naming only.
- Coordinator proof re-runs post-rebase AND post-final-rebase (full flags):
  `node scripts/test-raidname-b.js --corpus <corpus-on> --base-corpus <corpus>`
  → RESULT pass=15 fail=0 skip=1 both times (T2 skipped: engine won't seat a
  0-HP villager in unit setup; corpus zero-fire, no misfire).
- G5 honesty note: check.js --quick is NOT green on either tree — base and
  changed trees both score 284 passed, 6 failed with the identical failing
  set (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20 racks-full), all
  pre-existing on base and reproduced with src reverted. G5 holds as
  no-new-failures, not as literal green. Raid-area tests pass individually.
- Not chased: backlog #1380 (bedroll line for never-slept players) — noted as
  adjacent only.

## Wall (bands, NOT movement)

Both arms are 30-day narration/measurement legs: national / table / wins NOT
OBSERVABLE, reported not claimed. Wave 4–5 reach 0 on both bands. Median
survival 30 days capped (lackingline: 59/60 villages reach day 30; 13317 lost
day 28 to a starvation cascade, not a creek stranding).

## Telemetry deviation check

On the raidname post corpus (row-only glob, default and --sweep-rows modes):
3 LOUD lines each (national 12→0, table 16→0, wins 16→0) — the KNOWN
WINSEAT-baseline vs pre-seat regime artifact class (a 16-config win-seat
baseline vs 30-day pre-seat narration legs whose rows carry no top-level
national/table/wins). Exiled: no LOUD line. Baseline NOT rolled. No new
investigation opened.

## Metric review

- Lackingline: sequential-ON screening has now failed four times to produce a
  still-refused evening. The next prereg should bank on OFF-leg creek episodes
  first (the blockscreen2 method) — do NOT repeat sequential-ON screening
  hoping for a better draw, and do NOT lower the minimum-n bar to pass a
  thinner corpus.
- Raidname: the aftermath guard (`already fell to the raid…`) fired 0 times on
  the band — correct, since no fighter was pre-dead at any fight's opening
  line, but it is a guard for a case the engine may make impossible. Next
  touch: prove a firing case or remove it. Residuals: species-id collision
  caveat on the entity path (none on band); browser ordering untested (the
  raid line reads before first blows in browser/async, after them in node) —
  hence [needs-eyes] on the wording commit.

## Infrastructure

- One service restart interrupted the first worktree registration (partial
  checkout dir left behind, holding only copies of committed files — removed,
  then re-registered clean). Registrations slow under sibling load
  (lackingline ~4.8 min, raidname ~10.3 min, worktree add progressing slowly).
- Safe-commit index clobber hit the lackingline worker's commits
  (worker-repaired via HEAD-blob cacheinfo, commits verified correct).
- Master moved under the run (journey tooling commits, then loop A 1915Z's
  adoption landing of tilejoin DIAG-NO-GO + fullseat NO-GO + its coordinator
  evidence 1445c59db). Both branches rebased clean with proofs re-run after
  every rebase; zero file overlap with sibling landings. A sibling untracked
  evidence file appeared in the main tree mid-closeout and resolved itself
  via loop A's own commit — left untouched throughout.
- check.js --quick NOT re-run at coordinator level (zero src/js in arm 1;
  arm 2's gate is its proof suite + the worker's base-vs-changed check.js
  comparison above).

## Dispositions

- food-economy stays converging (NOT converged): one narration gap closed by
  a landed wording change, one measurement blank still open after four runs,
  no food-economy default flipped, no game-code balance change landed.
- scale-onramp stays converging (untouched; sibling loop A lane).
- Claim deleted; lock deleted.
