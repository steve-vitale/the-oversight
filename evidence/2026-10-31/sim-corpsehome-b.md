# sim-corpsehome-b — fresh-bearer re-proof of the corpse-home mechanism: DIAG-GO

Run: Loop B, arm sim-corpsehome-b, axis food-economy. Worktree
sim-corpsehome-b. DIAG ONLY: measurement, zero src/js changes,
zero policy-default flips, zero edits to any existing policy file
or existing script. New files only: prereg, driver + splitter +
analyzer + proof, this evidence file, corpora, table. Nothing is
merged by this worker (the coordinator merges); report status:
committed on branch, pending coordinator merge, no ship.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-corpsehome-b-prereg.md (commit 8d327af87).
Pinned base: f536e3ad3. Search band: seeds 15000–15059 plus the
corpsemove 8-seed stragglers outside it (15091, 15211, 15220,
15221, 15337), DAYS=60, ON leg, same stack as corpsemove
(POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1). EXPLICITLY
NOT the diverged 15215 trajectory. DIAG-GO iff a fresh bracket
covers death morning/evening through Haven morning with bearer
identity on both sides of the overnight segment, the node/mx/my
readings on both sides, the mechanism traced to the
recoverBearer arithmetic, items identical, looted false
throughout, the say line if present, and the corpsemove
candidates excluded or confirmed on THIS bracket — OR bracket +
excluded mechanisms + residue stated as an explicit unknown. If
no fresh death were found on the band, the prereg required
reporting the search width and claiming NOTHING.

## Canon

docs/CANON.md read. No canon doc covers corpse recovery itself;
the mechanism is documented in code (src/js/corpses.js header
rule the_village_brings_its_bearer_home, journey-succession r9
2026-10-12) — stated here instead of inventing canon.

## Prior evidence read in full before designing anything

evidence/2026-10-31/sim-corpsemove-b.md in full, especially: the
mechanism (Game.recoverBearer(), endDay caller, pendingBurials
queue, due on the first endDay where scholar.day > death day),
§1 the bracket format (bearer identity + name on both sides of
the segment), and §2 the discriminated candidates.

## Verdict: DIAG-GO — fresh bracket on current master, mechanism re-proved

The corpsemove re-proof blank is filled. On seed 15001, the
bearer Lucia Shin (gen_yg04sz4) dies away from Haven, and her
body comes home on exactly the recoverBearer arithmetic, with the
search leg and the full-capture bracket leg agreeing byte-for-byte
on the bracketing snapshots (no divergence):

- Pending day 8 (ledger playerDeath queue, scholar day at death).
  Succession morning is loop-day 9: Tomas Reynolds
  (gen_7qjv8xz) holds the mantle, Lucia's corpse
  (corpse_8_vlznp8) first reads at node (3,0), mx 0, my 8,
  recovered false, looted false, deathKnown true.
- Evening loop-day 9, same readings, same 8 item stacks, pending
  entry still present. No body line anywhere in Tomas's day-9
  transcript.
- Morning loop-day 10: node (4,4) Haven, mx 4, my 4 (the fire
  cell), recovered true, looted false, items identical, pending
  entry cleared. The move segment is the single overnight gap
  evening 9 -> morning 10 — endDay 9, the first endDay with
  scholar.day (9) > pending day (8).
- The say line sits in the morning-10 gap lines (index 13,
  before the DAY 10 DAWN marker): "That night, they bring Lucia
  home. Nobody asks you to help carry; nobody has to. By morning
  the grave is dug by the fire, and the body is laid out beside
  it. The filling of it is yours."

The uniform arithmetic this arm can now state across all 46
deaths: pending day P -> recovery on the night of loop-day
P+1, visible on morning P+2. Corpsemove's "two mornings at the
creek" is not an extra night and not a quirk: it is the
strict-> comparison plus where the death falls against the
morning-snapshot boundary (succession morning varies between P
and P+1; the recovery night is always P+1). 15001: P=8, night
9, morning 10. Corpsemove's 15215: P=17, night 18, morning 19.
Same rule, both brackets.

## 1. THE BRACKET (seed 15001, bearer-first)

| snapshot | bearer (id, name) | corpse corpse_8_vlznp8 (villagerId gen_yg04sz4, "Lucia") node | mx, my | items | looted | recovered | pendingBurials |
|----------|-------------------|--------------------------------------------------------------|--------|-------|--------|-----------|----------------|
| morning 9 | Tomas Reynolds (gen_7qjv8xz; snapshot short name "Tomas") | (3,0) | 0, 8 | 8 stacks incl. Hunting spear, Flannel Shirt | false | false | [{corpse_8_vlznp8, day 8, "Lucia Shin"}] |
| evening 9 | Tomas Reynolds (gen_7qjv8xz) | (3,0) | 0, 8 | identical 8 stacks | false | false | [{corpse_8_vlznp8, day 8}] |
| morning 10 | Tomas Reynolds (gen_7qjv8xz) | (4,4) Haven | 4, 4 | identical 8 stacks | false | true | [] (cleared) |

Segment: evening loop-day 9 -> morning loop-day 10, the
overnight gap. Bearer id + name on both sides; corpse
villagerId + name on both sides; the body that moves is Lucia's
while the snapshot bearer is her successor Tomas on both sides,
so this is not a bearer-change artifact. Snapshot names are
short forms ("Tomas", "Lucia"); the full name "Lucia Shin"
rides on the pendingBurials entry and the say line — recorded
exactly, not smoothed over.

Two honest limits, both stated rather than hidden:

- deathKnown was already true on morning 9 (the death beat
  tells the successor at succession), so the deathKnown flag
  does NOT flip on the move segment here — only recovered
  flips, plus the pending clearance and the position constants.
  The prereg's "flags flipping" bar is therefore met by
  recovered + pending, not by deathKnown; the code sets
  deathKnown in recoverBearer regardless, but on this bracket
  it was already set by the death-knowledge path.
- On the move segment, Lucia's was the ONLY corpse in the
  village (evening 9 corpse set = {corpse_8_vlznp8}), so the
  same-segment other-corpse stability check is vacuous on THIS
  bracket. The recentering exclusion below therefore rests on
  the sole-writer grep (no recentering writer exists in the
  code), not on a stability observation — and the wider census
  supplies the missing stability from the other side: 33
  at-Haven bearer corpses and every non-bearer corpse never
  move node on any seed.

## 2. CANDIDATE MECHANISMS — DISCRIMINATED ON THIS BRACKET

| candidate | verdict | evidence |
|-----------|---------|----------|
| Body-recovery duty (recoverBearer / pendingBurials) | CONFIRMED as the mechanism | Firing arithmetic (pending 8 -> due endDay 9 -> morning 10) matches; node/mx/my constants match corpses.js:937-938; recovered flips false->true and pending clears on the move segment; verbatim say line in the bracket's gap (§4); sole corpse-node writer in the codebase |
| Return-home routine / a villager carrying the body by day | EXCLUDED | Day-9 full transcript (24 lines) contains zero lines matching /corpse|grave|Lucia|body/; the only home/carry lines are a woodpile "road home" line and a food "carried it home" line, neither about the body; the move falls in the overnight gap, not in any day segment |
| Corpse relocation at succession | EXCLUDED | Succession morning is loop-day 9; the corpse still reads (3,0) on evening 9. The move is a full day later, on the recoverBearer due-night, not the succession |
| Map-node recentering / global shift | EXCLUDED (by code, stability vacuous on this segment) | No recentering writer exists: the only `c.node =` assignment in src/js is corpses.js:937, inside recoverBearer. Same-segment stability cannot be shown (only one corpse existed); but across the 65-seed census no non-bearer corpse ever moves node, and at-Haven bearer corpses move only mx/my to the fire cell on their due night |
| Other code paths writing corpse position | EXCLUDED | Grep: `c.node =` occurs only in corpses.js; pendingBurials is touched only by corpses.js + ledger.js; recoverBearer's only caller is game.js endDay |

## 3. SEARCH CENSUS (65 seeds, 60 days, ON leg) — specificity, not a rate

| chunk | seeds | bearer deaths | away-deaths ending at Haven |
|-------|-------|---------------|------------------------------|
| 1 | 15000–15009 | 6 | 2 (15001 Lucia (3,0); 15006 Esmeralda (3,0)) |
| 2 | 15010–15019 | 6 | 0 (all died at Haven node) |
| 3 | 15020–15029 | 10 | 3 (15021 Li (1,7); 15027 Reem (4,1); 15029 Kelsey (4,1)) |
| 4 | 15030–15039 | 4 | 1 ((2,0)) |
| 5 | 15040–15049 | 8 | 3 ((0,2); (3,0); (5,1)) |
| 6 | 15050–15059 | 11 | 4 ((4,5); (2,8); (5,3); (0,5)) |
| 7 | 15091, 15211, 15220, 15221, 15337 | 1 | 0 |
| **total** | **65** | **46** | **13** |

Every one of the 46 dead-bearer corpses ends at Haven (4,4) /
fire cell (4,4) with recovered=true. 43 show a position change
(node and/or mx/my); the 3 without one already lay at the fire
cell, so only the recovered flag flipped. No non-bearer corpse
moved node on any seed. The at-Haven deaths are the same
mechanism from the other side: recoverBearer still fires on
their due night, snapping mx/my to the fire cell and flipping
recovered — visible proof the firing is universal to dead
bearers, not special to far deaths. The bracket seed 15001 is
the LOWEST seed meeting the search criterion (first away-death
in ascending order), exactly as the prereg's bracket rule
requires.

## 4. SENSE-TEST (law — read end to end, judged for meaning)

The death night (morning-9 gap lines) reads as a village
stopping, not a system event: "Lucia Shin is dead — the wild.
The village stops. Somebody screams. Somebody else starts
digging." The Codex tells the successor itself ("Lucia Shin is
dead. You didn't ask. It knew."), the mantle passes to Tomas,
and the village carries on — foraging, water runs, gossip,
suspicion — through day 9 with no mention of the body. Then,
on the night of day 9, the line lands: "That night, they bring
Lucia home... By morning the grave is dug by the fire, and the
body is laid out beside it. The filling of it is yours." Read
in sequence, the homecoming is the village acting overnight —
the same anonymous "they" who screamed and started digging —
not a teleport: the body travels, the grave is dug by others,
and the one act left undone is the successor's (the filling).
PASS on narration. The honest limit is corpsemove's and stands:
the carrier is "they," never a named villager seen carrying.
That matches the code (recoverBearer names no carrier) and the
collective grief beat; it is a texture note for when burial
narration is next touched, not a bug claim and not built here
(diag only).

## 5. INSTRUMENT NOTES (disclosed)

- The driver is corpsemove-trace-b.js with one READ-ONLY switch
  (FULLCAPTURE): search legs omit gap lines and full-day
  transcripts except bearer-change mornings; the bracket leg
  stores gap lines on every morning and full day lines on every
  day. Policy stack, env gates, and day loop are the corpsemove
  substrate unchanged; the search==bracket identity check on
  9m/9e/10m proves the switch did not perturb the trajectory.
- Transport followed the EPERM-flap rule throughout: the driver
  prints one JSON line per seed to stdout; a foreground exec
  redirects stdout to an evidence .jsonl; an idle splitter
  process splits it into per-seed corpus files; the .jsonl is
  deleted after splitting. No judged corpus was ever staged in
  /tmp.
- safe-commit index clobber (known class): after both the
  prereg commit and the instruments commit, committed files
  showed as staged deletions plus untracked copies. Repaired
  both times with `git update-index --add --cacheinfo` from the
  HEAD blobs; `git status` clean after each repair. The same
  check runs after the final commit.
- One proof-test correction, disclosed not hidden: the first
  proof run failed 2 checks because the test assumed snapshot
  names were full names ("Tomas Reynolds", "Lucia Shin"). The
  corpora carry short names ("Tomas", "Lucia"); full names ride
  on pendingBurials and the say line. The test was corrected to
  assert the recorded forms (id-anchored), and now passes
  22/22. No corpus or claim was altered to fit the test.

## 6. VILLAGE ASSESSMENT (plain words)

This village — seed 15001 — is a small, working Haven that
loses its bearer early and keeps going. Lucia Shin holds the
mantle for eight days, dies out in the wild ("the wild" is all
the record says — no monster named, no fight narrated in the
captured transcript), and her body lies where she fell, a long
way from home at the edge of the map, while Tomas takes up the
mantle the next morning. For a day Tomas works, forages, and
listens to the village gossip, and nobody mentions the body.
Then, on the second night, the village goes out and brings her
home: by morning her body lies by the fire, the grave already
dug, her spear and shirt and everything she carried still on
her, waiting for Tomas to fill the grave or take what the
village needs. Nobody in particular carried her — the village
did, the way a village would, and it said so that night.

The other sixty-four villages tell the same story from every
angle: bearers die at home and away, early and late, and every
single dead bearer's body ends up by the fire. Nobody else's
body moves — villagers and monsters stay where they fell. That
is the rule, proved fresh on current master: only the bearer's
body comes home, it comes home on the night after the death
day's successor-morning arithmetic says it should, and the
village says so in one line. The blank this arm fills is the
re-proof corpsemove could not give: the mechanism is no longer
resting on an old-base corpus plus a code trace. It has a fresh
bracket, on current master, with the search leg and the bracket
leg agreeing exactly.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Corpse-recovery content (the
bring-home line, grave dug by the fire, burial as the
successor's act) is reached in this arm's bracket leg (seed
15001) and in the 13 away-death trajectories of the census.

## Wall numbers

NOT OBSERVABLE on this census — reported, never claimed. This
census measures one mechanism (corpse recovery) on 60-day legs,
not national/table/wins reachability; no wall numbers are
fabricated from it.

## Proof

scripts/test-corpsehome-b.js: 22/22 checks pass, including the
bracket (node/mx/my/flags/items/pending on morning 9, evening
9, morning 10), bearer identity on all three snapshots,
search==bracket identity (no divergence), the verbatim say line
before DAY 10 DAWN, the empty day-9 body-line scan, the death
beat + mantle in the morning-9 gap lines, the single-corpse
segment note, the full code trace (recoverBearer definition,
day > pending-day condition, node/mx/my constants, recovered +
deathKnown flags, say template, endDay caller, pendingBurials
queue), the sole-writer grep, the census totals recomputed
from the per-chunk summaries (46 deaths / 43 moves), and the
tracked-diff guard (src/ + scripts/policies/ unchanged since
the prereg base f536e3ad3).

## Metric review

- The bracket metric behaved as preregistered (single
  overnight segment, bearer-first snapshots, traced mechanism,
  items/looted stability, narration verbatim) and the
  search-then-bracket staging worked: the wide cheap band found
  the death, the single-seed full-capture rerun reproduced it
  exactly, so narration capture cost one seed instead of 65.
  No re-scoring occurred: the GO is claimed on the prereg's own
  bar, with the two honest limits (deathKnown pre-set;
  single-corpse segment) stated inside the verdict rather than
  smoothed over.
- Refinement for the next strand prereg: name the snapshot
  name-form explicitly (short names on snapshots, full names on
  pendingBurials/say lines) so a proof test does not assume a
  form the instrument never records. And when a bracket's move
  segment holds only one corpse, say so in the prereg's
  exclusion plan: the stability check is vacuous there, and the
  exclusion must rest on the sole-writer grep plus the wider
  census.
- No metric revision is proposed for the GO bar itself.
- §15 panel: not applicable, as declared in the prereg — zero
  game-root changes, so there is no before/after game delta
  for scripts/balance-panel.js to compare. The before/after
  here is morning vs evening snapshots on the same legs, and
  it is never labeled a panel comparison.

## 7. OUT-OF-SCOPE FINDINGS (NOT chased; for the coordinator's backlog)

- None new. For the coordinator: the corpse item's re-proof IS
  met by this arm (fresh bracket, seed 15001, DIAG-GO) — the
  sim-findings corpse item may be flipped from `open` to
  `fixed` on this evidence; the coordinator owns the backlog
  edit, not this worker.
- Texture note carried from corpsemove (not a bug claim):
  recovery carrier is anonymous ("they"), consistent with the
  collective grief beat; worth a look when burial narration is
  next touched.

## Files

- Prereg: evidence/2026-10-31/sim-corpsehome-b-prereg.md (commit
  8d327af87)
- Evidence (this file): evidence/2026-10-31/sim-corpsehome-b.md
- Drivers: scripts/corpsehome-trace-b.js (stdout emitter,
  adapted verbatim from scripts/corpsemove-trace-b.js with the
  READ-ONLY FULLCAPTURE switch); splitter:
  scripts/split-corpsehome-b.js; analyzer:
  scripts/analyze-corpsehome-b.js; proof:
  scripts/test-corpsehome-b.js (22/22)
- Bracket corpus: evidence/2026-10-31/sim-corpsehome-b-corpus-bracket
  (seed 15001, FULLCAPTURE=1)
- Search corpora: evidence/2026-10-31/sim-corpsehome-b-corpus-search1..7
  (65 seeds, FULLCAPTURE=0) + per-chunk summary JSONs
  (sim-corpsehome-b-searchN-summary.json)
- Per-snapshot table: evidence/2026-10-31/sim-corpsehome-b-table.json
- Run logs: evidence/2026-10-31/sim-corpsehome-b-search*.log,
  sim-corpsehome-b-bracket.log
