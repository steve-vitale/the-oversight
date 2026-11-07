# Journey endgame r152 — PREREG AMENDMENT 1 (post-pilot fix, before any re-run)

Written after the pilot scored (analyzer exit 1, PRIMARY-BINDINGS GO),
before the post-fix re-run. Nothing in the original prereg's bindings
changes; this amendment adds one instrument fix and its verification.

## The finding

The pilot proved the r124 SIT-DAY-DEATHS dedupe proposal live: on
89705, Sam Wilson (sam_wilson) died d44 in combat and was recorded
TWICE in deathRecords — once via `tbVillagerFalls`, once via
`registerDeath`, same vid+day+cause. The pilot counted 9 deaths for
8 dead villagers. The probe wraps both channels by design ("ride
both channels for one body", probe line ~829) and pushes a record
per channel call, so one death reads as two. The analyzer's
SECOND-VETERAN fateOf, FALLEN-ambush, and SIT-DAY-DEATHS sections
are unaffected (Sam's cause is 'combat', not ambush; d44 is not a
sit day), but every death COUNT in the run note and in the
analyzer's death-records printout overcounts combat deaths. The
sit-day case itself (89704, Patricia visjoin_88, monster, d90 —
the sit day) is recorded ONCE in deathRecords, so the sit-day
table is clean; the duplicate is a second, distinct manifestation
of the same two-channel shape.

## The fix (probe-only, no game change)

`scripts/probe-endgame-r152-20261107.js` recordDeath: before
pushing, skip the record when a record for the same vid on the
same day already exists (first channel wins; the surviving entry
keeps its channel label). A villager dies once, so vid+day
identifies a death. Null vids are never deduped. No game state,
no RNG, no trajectory effect — the fix touches only the probe's
recording, so the post-fix pilot must reproduce the pre-fix
trajectories byte-identically except deathRecords.

## Proof

`scripts/test-endgame-r152-deathdedupe.js` — verifies on the two
committed corpora (pre-fix `perseed-endgame-r152-prefix/`, post-fix
`perseed-endgame-r152/`): (1) post-fix deathRecords unique by
(vid, day); (2) post-fix == pre-fix minus exact duplicates;
(3) every other per-seed JSON field byte-identical pre/post;
(4) transcripts byte-identical pre/post; plus the headline case
(Sam Wilson twice pre-fix, once post-fix). RED-verified on the
pre-fix corpus (3 failures: uniqueness, minus-dups, Sam-once)
before the re-run.

## Re-run plan

Re-run the pilot with the identical invocation (same env, same
5 seeds, same 180d) into `perseed-endgame-r152/` (the pre-fix
corpus is preserved at `perseed-endgame-r152-prefix/`). Then run
the proof test and the analyzer; diff the analyzer output against
the pre-fix copy (saved at /tmp/r152-prefix/). Expected: proof
test all-PASS, analyzer verdicts unchanged (the duplicate did not
feed any verdict), death counts 89705: 9 -> 8. If any trajectory
differs, that is a same-run investigation item — the fix must not
move the game.
