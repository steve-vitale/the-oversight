# sim-raidname-fix-b — the raidname provenance-gate fix (backlog #1451 residual (2))

Run: oversight-flesh-out-loop-b, arm sim-raidname-fix-b
(run fleshout-loop-b-20261030T0230Z, axis food-economy).
Builds the fix for the misfire LIVE-PROVEN by
sim-raidname-b1-b (evidence/2026-10-29/sim-raidname-
b1-b.md, landed e19534e56): 9/9 staged B1 configs
misfired. Fix recommendation source:
evidence/2026-10-29/sim-raidname-collision-b.md
(documented, never built — built here). The
coordinator marks the backlog; this arm does not
edit the backlog file.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-30/sim-raidname-fix-b-prereg.md, committed as e5413a5db BEFORE any judged leg, plus Amendment 1 f03c0390e, committed BEFORE any after-leg judging; bars UNCHANGED by the amendment)

**GO — primary + neutrality + sense all pass.**

- BEFORE leg (clean pinned base ff6bf0e04, band
  10710–10725, 16 seeds, 30d, insideevening):
  9 staged configurations, 9 misfires, rate 1.000,
  0 unclassified, 0 staging misses, pre-staging
  determinism identical on every staged seed.
  Reproduction gate PASSED (bar >= 0.75); counts
  identical to b1 on the same band (windows 26/27).
- AFTER leg (fix only + harness alignment, same
  band/seeds): 9 staged configurations, 0 misfires,
  9 non-misfires, 0 unclassified, 0 staging
  misses, determinism identical, windows 26/27.
  The after leg stages the EXACT same 9
  configurations (same seeds, species, loop-days,
  tile-entity HP) — only the classification flips
  misfire-b to non-misfire.
- CONTROL leg (aligned harness + CLEAN game code,
  pilot 8 seeds, analyzed against the before OFF
  pilot): 4 staged, 4 misfires, 0 unclassified,
  determinism clean. The harness change alone fixes
  nothing — the game fix is the cause of the
  after-leg zero.
- NEUTRALITY gate: OFF-leg (blind, no staging)
  fight sequences (kind / species / raidLineFired)
  identical before vs after on all 16 seeds (0
  diff seeds); OFF raid-line totals 44 -> 44.
  Genuine raid lines still fire, unchanged.
- SENSE bar: full post-fix staged fight tail read
  end to end (seed 10710, 119 lines, below) — the
  raid line is absent and the tail reads
  coherently as a wanderer fight.
- PROOF: `node scripts/test-raidname-fix-b.js
  --corpus <after-on> --base-corpus <after-off>
  --before-corpus <before-on> --before-off
  <before-off> --analysis <after-analysis>` —
  RESULT pass=33 fail=0 skip=0 (fixtures P1–P8
  plus corpus judgement plus neutrality).
- The b1 analyzer's after-leg verdict label reads
  "DIAG-NO-GO" because its ladder scores rate <
  0.75 that way. For THIS arm that label is the GO
  outcome (0 misfires is the bar); the judgement
  above, not the borrowed label, is the verdict.

## The fix, in plain words

Before: when a fight started, the game said the
raid line if EITHER the pending matched a stored
raid shadow OR the monster on your tile was
raid-born. The second rule lied: a fight that
resolves a pending is built fresh from the
monster's species, not lifted from the tile — so
a wanderer fight could be named as a raid fight
just because a real raider of the same species
happened to be standing on your tile. And a raid
shadow could outlive its pending (a mismatch
fight, an exile, a succession cleared the pending
but kept the shadow), so a later same-species
fight inherited a dead raid's name.

After: the tile-entity rule only fires for a
genuine direct meeting — not for a fight that
resolves a pending, not for a contest-arena
fight, never for a table trial. And the shadow
dies with its pending: it survives a fight start
only when that fight IS its own pending's
resolution, and is consumed on match; every other
fight start, exile, succession, new-run reset,
and load-validation phantom clear drops it with
the pending. The raid line text itself is
UNCHANGED. No spawn, damage, or economy value
is touched — narration honesty only.

## What changed (files in commit 852289547 [needs-eyes])

- src/js/game.js — startCombat: capture
  pending/contest provenance at entry (before
  anything can clear it); consume-or-clear the
  shadow at the pending-clear site; provenance
  gate on both naming paths (contest gates (a)
  too: an arena beast is never the raid pending's
  fighter, even on a species coincidence); new-run
  reset and load-validation phantom clear drop
  the shadow.
- src/js/havenGrowth.js — raid-naming comment
  updated to the new clears and the direct-fight-
  only entity rule (no code behavior change
  beyond the comment).
- src/js/betrayal.js — exilePlayer clears the
  shadow with the pending.
- src/js/ledger.js — playerDeath (succession)
  clears the shadow with the pending.
- scripts/sim-harness.js — driveContests pending
  block stops pre-clearing the pending before
  startCombat (see Amendment 1 below). No game
  behavior change except on a startCombat throw,
  where the pending now survives (as live).
- scripts/test-raidname-fix-b.js — proof script
  (fixtures P1–P8 + corpus judgement, see Proof).

## Amendment 1 — the harness pre-clear discovery (bars unchanged)

Audit finding, after the before leg ran and
BEFORE any after-leg judging: the sim harness
pending block PRE-CLEARED pendingEncounter /
pendingMonsterId and then called startCombat(mid),
while EVERY game resolver arrives with the pending
live — the app "Face it" button (startCombat()
with no id, no pre-clear), faceTentIntruder
(clears only pendingInTent), faceFeastDraw
(clears only the feastDraw marker, after). A pure
startCombat entry-gate therefore cannot see
harness-resolved pendings — and the staged leg
itself resolves through the harness block. The
prereg's fix design as written would have passed
live play and failed its own regression
instrument. Correction: the harness now resolves
like the live button (startCombat is the single
pending-clearer). Caller census after alignment:
NO game, policy, or harness path pre-clears a
pending before startCombat (all startCombat call
sites checked: tile Fight buttons, Face-it,
debug, contest arena, faceFeastDraw,
faceTentIntruder, door-flee re-engage, policy
hunt bump, glasswing trap, monster bumps, table
trial). The ONLY pre-clearer left in the repo is
the old collision test's fixture helper — a test
artifact mimicking the retired harness protocol
(see the collision-test note below).

## Staged configurations (all 9, before misfire -> after non-misfire)

| seed | loop-day | species (display) | tile entity HP | line before | line after |
|------|----------|-------------------|----------------|-------------|------------|
| 10710 | 10 | gallowdeer (Highbeam Deer) | 43 | yes | no |
| 10714 | 8 | gallowdeer (Highbeam Deer) | 107 | yes | no |
| 10716 | 13 | anaconda_empress (The Anaconda Empress) | 50 | yes | no |
| 10717 | 9 | cliffhanger (Cliffhanger) | 44 | yes | no |
| 10719 | 12 | gallowdeer (Highbeam Deer) | 130 | yes | no |
| 10720 | 9 | anaconda_empress (The Anaconda Empress) | 50 | yes | no |
| 10722 | 11 | sanjun (The Mountain Lord) | 17 | yes | no |
| 10724 | 9 | hushwolf (Hushpuppy pack) | 12 | yes | no |
| 10725 | 11 | hushwolf (Hushpuppy pack) | 14 | yes | no |

Every staged fight: haven tile (4,4), player
inside, shadow null at entry, tile entity
raidBorn of the same species, pendingMatch false.
Pilot tails are exactly one line shorter after
(120->119, 75->74, 74->73, 47->46): the removed
line is the lie, nothing else moved.

## Sense (full post-fix staged fight tail read end to end — SENSE-TESTING LAW)

Seed 10710, loop-day 10, gallowdeer/Highbeam Deer
(full 119-line tail in
sim-raidname-fix-b-corpus-after-on/
stage-b1-b-insideevening-s10710.json,
stagedSayFull; raid line ABSENT, verified by
search, not by eye alone). The village is
rattled, the deer intro fires, villagers join,
the fight runs long and brutal (beam charges,
dodges, patches, "Move! MOVE!"), the player goes
down to the beam, and the succession beats read
as earned grief — the mantle passes to Natalie
Gonzalez mid-tail, "You knew Jason — not the
office, the person." Nothing in the tail claims
a raid origin, and nothing else reads confused
by the line's absence: the fight was always a
wanderer fight in its beats; only the false
provenance sentence is gone. Sense verdict:
PASS — the fix removes a lie, not a confusion.

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages on the insideevening
shape, before and after: the same villages, the
same fights, the same wall numbers (below). The
one change is honesty at the doorstep: when a
wanderer fight resolves against a raid-born
lingerer sitting on the haven tile, the game no
longer calls it a raid fight, 9 times out of 9
it used to, 0 times out of 9 now. Blank filled:
the provenance gate itself, measured on identical
seeds with the regression instrument the b1 arm
left behind. Blank documented, not filled: the
natural coincidence rate of wanderer pendings
with lingerer windows (still 0 on the blind
band — the staged leg measures the conditional
rate, which is now 0).

## Wall numbers (30-day legs, report-only, never judged)

Identical before and after (another neutrality
signal, not a verdict input):

- National / table / wins: NOT OBSERVABLE inside
  30-day instances — reported as not claimed,
  never as zeros. Scale stays 'village' on 16/16
  seeds, standing 0 on 16/16.
- Wave reach: max wave unlocked 1 on 4 seeds, 2
  on 12 seeds; wave 4–5 reach 0. Median survival:
  30 loop-days; max 30. Total fights on the ON
  corpora: before 51, after 51 (same fights).
  One village-lost (10714, day 22) on both legs.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as raidname-b,
collision-b, and raidname-b1-b: this leg is a
narration regression on 30-day instances, and
panel metrics (national / table / wins, wave
reach) cannot move — and cannot even be observed
— inside 30-day instances. The judged instrument
is the staged corpus on identical seeds, and the
pre-registered bars are the judge.

## Proof

- Fixtures-only: `node scripts/test-raidname-
  fix-b.js` — RESULT pass=24 fail=0 skip=1
  (skip = corpus judgement without corpus args).
  P1 genuine raid pending (live Face-it path) ->
  line fires + shadow consumed. P2 staged-B1
  shape -> line absent. P3 direct tile fight vs
  raidBorn entity, no pending -> line fires
  (genuine (b) preserved). P4 A1 orphan sequence
  (mismatch fight, then same-species non-raid
  pending) -> shadow cleared by the mismatch,
  no line on the later fight. P5 contest-arena
  fight vs same-species raidBorn tile entity ->
  line absent. P6 exile with live pending+shadow
  -> shadow null. P7 succession (playerDeath)
  with live pending+shadow -> shadow null. P8
  genuine raid pending, explicit-arg resolution
  -> line fires (no over-gating of (a)).
- Full: `node scripts/test-raidname-fix-b.js
  --corpus <after-on> --base-corpus <after-off>
  --before-corpus <before-on> --before-off
  <before-off> --analysis <after-analysis>` —
  RESULT pass=33 fail=0 skip=0.
- `node --check` clean on game.js, havenGrowth.js,
  betrayal.js, ledger.js, sim-harness.js,
  test-raidname-fix-b.js.
- Scoped base checks (clean base, before the
  fix): b1 proof on before corpora (DIAG-GO
  recomputation), collision proof 29 pass / 0
  fail on its 2026-10-29 corpora, node --check
  clean on all files later touched.
- Full `check.js --quick` on the base TIMED OUT
  at 600s with no result (290 scripts, still
  streaming dots when killed) — recorded, not
  claimed. Scoped gates above are the check for
  this narration-only change; no full after-quick
  was run, because there is no full base result
  to compare it against.
- Corpora: evidence/2026-10-30/
  sim-raidname-fix-b-corpus-before-off/ (16),
  sim-raidname-fix-b-corpus-before-on/ (16),
  sim-raidname-fix-b-corpus-control-on/ (8),
  sim-raidname-fix-b-corpus-after-off/ (16),
  sim-raidname-fix-b-corpus-after-on/ (16).
  Analyses: ...-before-pilot-analysis.json,
  ...-before-analysis.json,
  ...-control-analysis.json,
  ...-after-pilot-analysis.json,
  ...-after-analysis.json.
- Prereg: evidence/2026-10-30/
  sim-raidname-fix-b-prereg.md (e5413a5db +
  Amendment 1 f03c0390e, both before the legs
  they bind). Fix: 852289547 [needs-eyes].
- No push, no version bump, no live verification
  (coordinator/ship-loop owns those). Merged
  locally, pending ship is the COORDINATOR's
  step, not this worker's.

## Post-fix collision-test note (read before panicking at its 4 FAILs)

Running the OLD collision proof post-fix gives
RESULT pass=25 fail=4 skip=1. The 4 FAILs
decompose exactly, and none is a fix failure:

1. A1 "shadow KEPT after mismatch fight" — FAILS
   because the fix clears it. INTENDED (this is
   the A1 closure).
2. A1 "raid line FIRES on non-raid pending via
   orphan shadow" — FAILS because the line no
   longer fires. INTENDED (this is the A1
   closure).
3. B1-raid-control "raid line fires for a genuine
   raid pending" — FAILS because the old fixture
   resolves via its own pre-clear helper (see
   Amendment 1): pre-clear -> pending not live at
   entry -> the fix clears the shadow -> no line.
   STALE PROTOCOL ARTIFACT: no game, policy, or
   harness path pre-clears anymore, and under the
   live protocol genuine lines DO fire (P1, P8,
   and the OFF 44->44 neutrality).
4. A1-control "raid line fires on the matching
   raid fight" — same stale-protocol artifact.

Correlated: the old T-B1 main assertion still
PASSES post-fix, also via the pre-clear artifact
(the gate is blind to a pre-cleared resolution).
The old fixture therefore can no longer
distinguish fixed from unfixed code on that path
— which is why P2 and the staged legs, not the
old fixture, are this arm's regression proof. The
old test is a historical DIAG artifact and is
left untouched, not re-scored: rewriting its
expectations mid-arm would be re-scoring history.

## Known blind spot, stated plainly (tradeoff, not a gap found later)

A resolver that pre-clears a pending before
startCombat is invisible to the provenance gate:
with no pending live at entry, the fix clears the
shadow, so a genuine raid pending resolved that
way would lose its line (false negative). The
alternative — keeping the shadow when mid matches
it without a live pending — IS the A1 orphan
misfire (false positive), and the two cases are
indistinguishable inside startCombat. The fix
chooses the false negative, because the caller
census shows no such resolver exists in game,
policy, or harness code after alignment, while
orphans were the documented bug. If a future
resolver ever pre-clears, it must either stop
pre-clearing or pass provenance explicitly —
that is the standing rule this fix establishes.

## Residuals documented, NOT fixed here (coordinator backlog)

- Coalition arena (titans.js): its flag is set
  on the tbfight AFTER startCombat creates it, so
  no pre-start flag exists to gate on. A
  coalition-arena fight against a same-species
  raidBorn tile entity stays a theoretical
  residual (no such case on any corpus).
- startAlienCombat (encounters.js) clears
  pendingEncounter but keeps pendingMonsterId —
  a half-clear. It is not a startCombat call, so
  the entry rule already neutralizes it for the
  raid line (the next monster startCombat sees no
  live pending and clears the shadow). The stale
  pendingMonsterId itself is a separate
  pre-existing blank, not fixed here.
- The staged fight's tile-entity removal
  (startCombat lifts the species-matched tile
  entity): pre-existing world behavior, not
  narration; changing it would alter combat/world
  state and is out of scope.
- Browser-ordering residual (3) stays OPEN and
  is NOT this arm. [needs-eyes] on the fix commit
  covers the player-visible raid line.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as committed
  before any judged leg, plus Amendment 1 (bars
  unchanged) committed before any after-leg
  judging. No band, substrate, threshold, staging
  clause, or classification rule changed after
  the after leg ran. Pilot (8 seeds, 4/4
  non-misfires) passed the sniff test and the
  confirm extension ran in band order to the
  8-config floor (9 configs on 16 seeds); no
  seeds beyond 10725 were run.
- The one design correction (Amendment 1) is
  recorded above with its confound analysis and
  its control leg, not hidden: the harness change
  cannot fake a pass, and the control leg proves
  it (4/4 misfires on clean game code).
- No instrument corrections during the judged
  legs. The stage/analyze scripts are UNCHANGED
  from the b1 arm; the only instrument change is
  the harness alignment, made and controlled
  before the after leg.
- No revision proposed for the next run's metric
  except: the next raid-narration arm should
  treat the staged leg + P1–P8 as the standing
  regression (the old collision fixture's
  pre-clear protocol is retired), and any future
  pending resolver must preserve pending-live-at-
  entry or pass provenance explicitly.

## Canon status (stated, not invented)

No canon doc covers raids or palisade sleep
(docs/CANON.md read first). The raid rule lives
only in a havenGrowth.js header comment. This
arm invents no canon: it gates existing
narration on provenance.

## Convergence line

raidname-fix — GO: on band 10710–10725 (16 seeds,
30d, insideevening) the staged-B1 leg goes from
9/9 misfires pre-fix to 0/9 post-fix (9 staged
configs, 0 unclassified, determinism clean,
windows 26/27 both legs), OFF neutrality exact
(fight sequences identical, raid lines 44->44),
sense tail (10710, 119 lines) carries no false
raid origin, proof 33 pass / 0 fail; fix commit
852289547 [needs-eyes] (game.js provenance gate
+ consume-or-clear, exile/succession/new-run/
load-validation shadow clears, havenGrowth
comment, harness pending-resolution alignment,
proof script); control leg proves the harness
change alone fixes nothing (4/4 misfires on clean
code); wall numbers on the band: national/table/
wins NOT OBSERVABLE (30d), wave 4–5 reach 0,
median survival 30. Browser-ordering residual (3)
stays OPEN; coalition-arena + alien half-clear
residuals documented, not fixed.

## Verdict (judged against the pre-registered bar, not re-scored): GO
