# sim-food-economy-round-2230-b — Loop B coordinator evidence (axis food-economy — 2 DIAG-GO arms LANDED, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T2230Z.
Axis food-economy (converging). Loop A live on scale-onramp for the
whole run (2156Z claim: twoblow + contactrec — NOT touched) -> B
worked food-economy. Claim written before any sims. Pre-flight:
main tree clean, disk 20%, reaper removed nothing (sibling dirty
trees refused). Base at arm start c9ac9183c; two sibling landings
mid-run (journey-establishment r69 53eacdc60, journey-crisis r88
12e07e049), so both arms rebased clean onto 12e07e049, proofs
re-run green, then merged --ff-only in sequence (buckettile, then
confirmednight re-rebased onto the post-buckettile master, proofs
re-run a second time, then merged). Post-merge proofs re-run green
in the main tree: buckettile 7/7, confirmednight 4/4 (+ strandred
5/5). Origin/master NOT fetched before merging (local-only merge
per loop procedure; ship loop owns pushes — no divergence claim
made either way). check.js --quick NOT run at coordinator closeout
(arm proofs are the landing verification; --quick has hung under
concurrent loop load in recent rounds — cited neither as pass nor
as failure).

## Arm 1 — sim-buckettile-b: DIAG-GO (definitional; #1659 ANSWERED)

Commits (rebased): 610d1f344 prereg, cad7d8e87 instruments,
f03ccaa4f evidence. Proof 7/7 re-run green after rebase and
post-merge. Diff guard empty (zero src/js, zero policy edits).

Finding, exactly: the woodcarry bucket never says creek on P1
creek nights because classification never runs — it is correct
under its own definition, and the divergence is definitional,
not a bug. Chain: nighttravel.js nightStep() returns
'out-of-reach' before any travelTo hop when haven is not among
travelTargets(); travelTargets() offers revealed tiles at
Manhattan distance <= 3, and 17513's creek camp is distance 6
from haven, so haven is never offered; woodcarry.js classifies
only when ctx._ntLast.outcome === 'travel-refused', otherwise
the store record is never incremented. Gate 2 (creekremedy-diag
classifyRefusedEvening + bucketOf, needs block:creek + probe
agreement) is never reached: 0 travel-refused evenings in all
480 judged evenings. Pilot P1 F2 30d: 7 creek-tile evenings,
7 gate-1 explained, 0 unexplained (17513 days 5-10, 17511 day
10). Confirm P1 F1 30d: 0 creek-tile evenings, bucket 0.
Drift vs strandred (b26777c16 -> c9ac9183c): zero on all P1
cells, seed-for-seed. Sense PASS for the definitional reading
(17513 day 5 walks the creek line until home stops being
reachable; nights narrated in the sleep step; no homeward hop
attempted or refused on any creek night). Coordinator note
carried: the next strand arm should build on the TILE
criterion, or first find a band where travel-refused evenings
actually occur — gate 2 is untested by this corpus, not failed
by it. Worker-report inaccuracy (harmless, not a finding):
the buckettile report said #1658 was "not found" in
sim-findings.md at prereg time; #1658 IS in the file — the
worker correctly did not answer or pool it regardless.

## Arm 2 — sim-confirmednight-b: DIAG-GO (#1658 ANSWERED)

Commits (rebased twice): 053746e3a prereg, 563b41f41
instruments, 175bc31f8 evidence. Proof 4/4 re-run green after
both rebases and post-merge (+ strandred 5/5). Diff guard empty
(zero src/js, zero policy edits).

Finding, exactly: the confirmed-night unit (creek-tile evening +
following morning exists and is away) is argued in the prereg
and censused under it. All three prereg bars met: instrument
gate 8/8 clean, classification completeness 100% (50/50 pilot
confirmed nights carry a story), count bar 4 pilot seeds
(17504, 17505, 17506, 17508). Correction made IN THE PREREG
(not a re-score): strict confirmed count is 50 pilot nights,
not the class-based 60 — 7 away-continuation creek evenings
are followed by haven mornings and 3 end the run; every
haven-following creek evening on this corpus coincides with a
vessel change (succession morning). Return-story split is
POLICY-PERFECT: P3 deed-seeking 149/149 NO-ATTEMPT (pilot +
confirm; the policy has no evening walk-home step, so no
return is ever attempted), P1 nighttravel-stack 6/6
FAILED-RETURN (every creek night carries out-of-reach).
Camp ends, all cells: 35 camps, ZERO walk-home ends (18
succession, 11 moved-elsewhere, 6 horizon). In 24 judged legs,
no creek camper ever walks home. Judgement: P3 creek life is
CAMPING (lives at the creek because nothing brings her home);
P1 creek life is STRANDED (attempt + refusal + rough nights).
A P3-based strand arm without a return mechanism would
mislabel camps as strands. Named strand candidates: P1 F2
17513 (confirmed failed-return camp days 5-9, camp 5-10 ending
by succession) and 17511 (single confirmed failed-return night
day 10). Camp candidates: P3 F1 17504 (31 confirmed nights
60d), 17506 (27), 17505 (21), 17508 (9). Drift vs strandred
(b26777c16 -> c9ac9183c): ZERO on all three cells,
seed-for-seed. Sense PASS with nuance: the P1 failed return is
an outcome record plus blocked crossings, NOT a narrated
homeward attempt — no dayLine says the villager turned for
home; a future arm wanting narrated attempts must narrate
the out-of-reach outcome or ground home-directed movement
another way.

## Wall numbers

NOT MEASURED BY THESE PRE-SEAT CENSUSES — reported, never
fabricated. Observed survival: buckettile 16/16 legs survived
their window; confirmednight 23/24 (single village-lost leg
P3 17506 60d day 57, same leg/day as strandred). National 0,
table 0, wins 0 (structurally unreachable in these bands, not
a wall measurement). Wall UNCHANGED as last measured by the
Loop A lane: full seat 0 / wave 5 reached 0 stand.
food-economy stays converging (NOT converged): the strand
program's two yardstick questions are now both answered
(bucket-vs-tile mechanism, confirmed-night unit + return
story) — but no strand lever has been judged yet and no game
change landed.

## Telemetry deviation check (step 10 — investigated, baseline NOT rolled)

Coordinator re-ran telemetry-check on both census sets
(buckettile P1 F2, confirmednight P3 F1 30d): 3 LOUD lines each
(national/table/wins -> 0), same signature both arms already
investigated as the known missing-field artifact (censuses
carry no national/table/wins/exiled fields; the check ingests
a census file where the baseline expects per-seed sweep rows,
so 0 means "field absent", not "wall moved"). No genuine LOUD
signal. Baseline NOT rolled.

## Infrastructure findings (for the next coordinator — NOT game findings)

1. Worker 2 (confirmednight) finished its work but its final
   report was LOST to a transport error (subagent completion
   arrived as "[transport] sqlx error: pool timed out", agent
   status errored 23:23:59Z). Recovery from the branch, not a
   re-run: all 3 commits were present (817a36f32 / ba1b66764 /
   7ae3db4f8 pre-rebase), evidence file complete and
   self-consistent, worktree files byte-identical to HEAD
   blobs. Do NOT treat a transport-error completion as a
   failed arm — inspect the branch first.
2. The dead worker left a stale index.lock (0 bytes,
   23:23Z, no git process running) in
   .git/worktrees/sim-confirmednight-b/ that blocked every
   index write with "Unable to create index.lock". Removed
   after verifying no git process held it; the clobber repair
   then landed and status verified empty. Check for stale
   index.lock files whenever a worker dies mid-commit.
3. Safe-commit index clobber hit the confirmednight final
   commit in the worktree (34 files staged-as-deleted,
   byte-identical to HEAD). Repaired via --add --cacheinfo
   from HEAD blobs; status + diff HEAD verified empty after
   repair and again after each rebase. Buckettile worktree
   was clean at handoff. The commits were never in doubt.
4. No EPERM flap observed in this window. Registry lock
   contention slowed both registrations to ~8 min each
   (retries only, no force); heartbeat readbacks verified
   for both trees. Loop A trees showed stale heartbeats
   (21:59/22:01Z) while its claim stayed live — B did not
   touch A; staleness alone was not treated as A being dead.
5. Sequence-merge rule re-confirmed: after merging arm 1,
   arm 2's --ff-only merge correctly refused (its base was
   the pre-merge master); rebase onto the post-merge master
   + proof re-run + merge is the procedure, not a force.

## Next blanks, in order

1. Strand arm on the TILE criterion (or a travel-refused
   band, if one is found): named strand candidates P1 F2
   17513 (camp days 5-9 failed-return) and 17511 (day 10);
   own prereg, choosing its population (failed-return
   strands vs no-attempt camps) explicitly — a P3-based
   strand without a return mechanism mislabels camps.
2. Narrated homeward attempts: the P1 failed return is
   currently an outcome record, not a narrated attempt
   (design decision, counts supplied).
3. Death-aware camp-final unit: whether camp-final nights
   followed by succession mornings should count as
   confirmed under a death-aware unit (carried metric-review
   item; NO under the confirmednight prereg).
4. Gate-2 test: find or construct a band where
   travel-refused evenings actually occur, so the bucket's
   creek classification (block:creek + probe agreement) is
   tested rather than unreached.

## Landing

All arms rebased clean + merged --ff-only (buckettile
f03ccaa4f, confirmednight 175bc31f8), coordinator evidence
this file. Trees released as merged, branches deleted, main
tree clean at closeout. Claim retired to .DEAD; lock deleted.
Merged locally, pending ship.
