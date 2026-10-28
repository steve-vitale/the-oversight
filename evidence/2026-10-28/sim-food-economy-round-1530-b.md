# sim-food-economy-round-1530-b — coordinator record (loop B, axis food-economy)

Run: fleshout-loop-b-20261028T1530Z. Sibling loop A live on scale-onramp
for the whole run (1528Z claim: sim-partyfinish-band-a +
sim-fieldparty-form-a, NOT touched — A landed partyfinish NO-GO, fieldparty
DIAG-GO, and its coordinator record mid-closeout; see Infrastructure).
This run worked the second axis (food-economy, converging), taking the
1430Z tracker blanks in order: (1) the once-a-day test refresh, (2) the
spandraw grant-persistence follow-up. Main-tree pre-flight clean, disk
17%, reap at start: journey2-endgame left alone (uncommitted changes,
another lane's tree).

## Arm 1 — sim-onceaday-testrefresh-b (GO, test-only, zero src/js)

The game already fixed this; only the test was out of date. A repeat tap
of a once-a-day ability (war-cry challenge, or throwing weight around to
end a dispute) now refuses BEFORE charging anything. The old test still
expected the old behaviour — pay time ticks and silently burn 40 kcal,
then refuse. R13/R14 now assert pre-payment refusal: result false, day
unchanged, ticks unchanged, kcal unchanged, day flag unchanged, refusal
sentence present. A refused repeat tap now costs the player nothing —
that is the point, and the test now guards it.

Proof: baseline on the unmodified test FAILURES (32), all R13/R14, no
other fixture failing. After the refresh: PASS, all 112 fixtures
(8 seeds x 14), twice in the worker run and again by the coordinator
after every rebase. `_actionAvailable` recorded diagnostic-only
(availOk=false on every R13/R14 row), not asserted, per prereg.
`check.js --quick` in the worker run: 284 passed, 6 failed — the 6 are
pre-existing and unrelated (establishment racks-voice, phone-frame
receipt staleness, both reproduced standalone via --only); this arm
touches no src/js and its file is not a check.js job, so it cannot
have caused them. Nothing loosened or hidden.

Commits (rebased hashes on master): prereg 659d07032, refresh
d19ddeac4, evidence note 0a7b38004. Diff: exactly one test file plus
prereg + evidence (3 files, 328 insertions, 25 deletions). This arm
also closes findings-backlog line 1330 (stale R13/R14 test) — marked
fixed by this round.

## Arm 2 — sim-grantpersist-b (DIAG-GO, measurement only, zero src/js)

The spandraw playpath pilot's mystery is solved, and it is not a bug.
On seeds 10041/10042, 11 late taps were refused "You don't have that
ability" though the setup grant succeeded and early taps on the same
instances fired. The trace instrument (a copy of the playpath driver
plus per-tap ability-list/bearer snapshots) reproduced the loss exactly
on the full 8-seed band 10040–10047, same substrate gates, 120/120
instances: 7 instances lost the grant, producing exactly the 11
refusal taps; the other 113 instances never lost it. Correlation is
perfect both ways: 7/7 losses came with a bearer change, 0/113
non-switching instances lost the grant.

Localization: every loss sits in one adjacent snapshot pair, always
overnight in the sleep/endDay window — never inside competent.daily,
never at a tap. Mechanism, named: overnight death ->
`playerDeath(cause)` (src/js/ledger.js) -> `mantleBecome(oldId, newId)`
(src/js/villager-build.js), which replaces `scholar.abilities`
wholesale with the successor's own abilities, plus villager-id
reassignment. This is Steve's 2026-10-14 ruling — "You become that
villager; you don't take your XP or the abilities" — so the refusal
is legitimate game behaviour, not a defect. Eliminated with evidence:
mid-run list rewrite, slot replacement, sigW5 STAMP splice,
deepening/evolution, cap/prune. One documented gap: the trace does not
record what killed each bearer overnight (last tap days showed healthy
bearers); the death cause in the sleep/endDay window is a follow-up,
not a verdict blocker.

What this means for reusing long tap runs: any tap run longer than a
few days will cross successions on some seeds. Future drivers must
record bearer id per tap day (this instrument does) and
record-and-exclude post-succession taps (recommended), re-grant per
tap day under disclosure, or end the instance at succession — never
keep tapping a dead bearer's key and count the refusals as key data.
No spandraw verdict changes (all keys classify the same with or without
the 11 taps).

Commits (rebased hashes on master): prereg ea41e296a, instrument +
8-leg proof 5d0f5e628 (PROOF-GREEN), evidence + 120-file corpus +
analyzer ddf4f5786. Diff: 125 files, 1136 insertions, zero src/js.

## Village assessment (plain words)

No new village band ran this round — both arms are fixture/diagnostic
work — so no new wall numbers are claimed, and none are invented here.
What the traces show of village life is people-like at the hard moment:
a villager who holds the scholar's mantle can die overnight, and the
person who wakes up as the scholar is a different person with their own
abilities, not a continuation of the dead one's powers. The game
refuses the dead person's ability honestly instead of pretending the
new bearer still has it. And a villager who has already thrown down a
challenge today is refused a second one for free — no time lost, no
food burned on a "no". Both are the game telling the truth about its
own rules, which is what these follow-ups were checking.

## Wall (this round: no judged wall corpus)

National / table / wins / wave 4–5 / median survival: NOT measured by
either arm (fixture test + tap-instance traces carry no wall fields).
No wall movement is claimed. Standing wall picture is the sibling
1528Z round's (partyfinish NO-GO on field conversion, fieldparty
DIAG-GO on the empty-crew + unwired-allies finding) — cited, not
re-measured here.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/sim-grantpersist-b-corpus/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12->0, table
16->0, wins 16->0, n=120 files) — the known field-shape + regime
artifact class: tap-instance trace rows carry no top-level wall
fields, versus a WINSEAT baseline. Baseline NOT rolled. No new
investigation; arm 1 has no corpus to check (fixture test only).

## Metric review (§14)

Both arms judged against their preregs as written. Arm 1: primary
(112/112 post-refresh, R13/R14 pre-payment refusal) MET; no metric
swapped. Arm 2: primary (reproduction on 10041/10042 AND localization
to a single day-transition/event per reproducing seed) MET on both
legs — reproduction exact (7 instances, 11 taps) and localization
exact (sleep/endDay bracket on all 7). The arm-2 proof's L3 synthetic
leg first modeled bearer change as a new scholar object; the real
mantle mutates the same object — the fake was fixed to read the live
scholar, the detector unchanged. A future proof should add a
same-object mantle fixture. Balanced panel: not applicable to either
arm (no before/after game change; arm 1's before/after is a test
expectation change, arm 2 is a diagnostic trace) — no panel compare
is attached, and no panel verdict is claimed.

## Infrastructure

- EPERM flap blocked arm-2 worktree registration twice (ref-write
  lock failures, same class as 2026-10-23/24); no ref surgery, waited
  it out, third attempt registered clean. No partial tree/branch/
  registry entry was left by the failures (verified).
- Safe-commit index clobber hit ALL worker commits on both arms
  (bogus staged deletions in the main index, worktree files
  byte-identical to HEAD); repaired each time via
  `git update-index --add --cacheinfo` from the HEAD blob, verified
  status empty + diff HEAD empty. Commits always correct.
- Sibling loop A landed three times during closeout (partyfinish
  evidence, fieldparty evidence + corpus, 1528Z coordinator record);
  the ff-only merge correctly refused three times; each arm was
  rebased onto the then-current master in its own worktree and its
  proof re-run green after every rebase before merging. No conflicts
  (disjoint files), no force, no main-tree rebase.
- Worktree registration slow (~4–7 min each) as in the 1430Z run; no
  other infrastructure block.

## Files

- evidence/2026-10-28/sim-onceaday-testrefresh-b-prereg.md,
  sim-onceaday-testrefresh-b.md; scripts/test-refusalprecheck-b.js
- evidence/2026-10-28/sim-grantpersist-b-prereg.md,
  sim-grantpersist-b.md, sim-grantpersist-b-corpus/ (120 files);
  scripts/grantpersist-trace-b.js, test-grantpersist-b.js,
  analyze-grantpersist-b.js

food-economy stays converging (NOT converged): the once-a-day test
blank is closed and the grant-persistence question is answered
(succession, by design), but no food-economy fix in this run touches
the scale wall, and the home-birth path + pantry-lift convo line
remain Steve-call items. scale-onramp stays converging (untouched;
sibling loop A lane). Claim deleted; lock deleted. Merged locally,
pending ship. No push, no bump, no live verification (ship-loop line).

Next blanks, in order: (1) grantpersist follow-up — record the death
cause in the sleep/endDay window for the 7 succession instances
(appended to the findings backlog by this round); (2) spandraw
remaining follow-ups — thief hall-gate reachability in a played
position, tap-sitting conversation seam, longer played days for a
future span-promotion band (all documented in the 1430Z arm evidence,
none chased here); (3) home-village birth path + pantry-lift convo
line remain Steve-call.
