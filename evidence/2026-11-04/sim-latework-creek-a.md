# sim-latework-creek-a — late-work line names the place actually worked

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z, arm
sim-latework-creek-a, axis food-economy. Worktree sim-latework-a.
Prereg: evidence/2026-11-04/sim-latework-creek-a-prereg.md
(committed BEFORE any judged sim, commit 7f98fc0a).
Verdict against prereg: **GO**.

## 1. The blank and the premise correction

From evidence/2026-11-04/sim-bankretain-rerun-a.md §4/§6: the
late-work line still said "at the creek" on forest_floor
evenings (seed 16505 loop-day 59: 2 gathers, 0 forages).

Correction found while locating the line: it is NOT in src/js.
Repo-wide grep for "work late" finds exactly one emitter,
scripts/policies/bankfood-diag.js:371 — the bankfood evening
bank/flip handler, a sim policy wrapper (env-gated BANKFOOD=1)
that speaks the line through Game.say into sim transcripts.
No shipped game-code line carries this wording, so there was
no src/js line to fix; the fix lands in the policy that speaks
it. Voice-only: no mechanic, number, gate, or price changed;
no src/js file touched; every other narration line in the
file byte-identical.

Canon: docs/CANON.md read. No canon doc covers evening
late-work narration lines (docs/SYSTEM-VOICE.md is the System
voice bible, not this line; docs/PRESERVATION.md covers the
food ladder, not narration). No canon invented. Terrain names
are only names the engine already carries: TILE_NAME values
(src/js/game.js) for creek/forest floor/grove/meadow/thicket/
wetland/Haven, and the engine's nodeEpithet narration names
for trail_edge/ruin/street/plaza/cache ("the old trail",
"the old place", "the old street", "the old plaza",
"a buried cache"). Only the preposition is chosen in the fix.
Naming-source note: the prereg said "TILE_NAME values
verbatim"; the implemented trail/ruin/street/plaza/cache
phrases use nodeEpithet's narration names instead of raw
TILE_NAME labels ("ruin", "trail edge") because a person
says "the old trail", not "the trail edge". Both sources are
engine-carried; no name was invented.

## 2. The fix (commit 260a1604, [needs-eyes] — spoken narration)

New exported helper `lateWorkPlace(Game, fallbackType)` in
scripts/policies/bankfood-diag.js, used at the say site:

- Reads the player's CURRENT tile at say time — after any
  evening walk, this is where the work happened — falling
  back to the evening-start tile type already captured in
  the handler, then to a neutral phrasing with no place name.
- creek -> "at the creek" (BYTE-IDENTICAL old line, counts
  and tail clause included).
- forest_floor -> "on the forest floor"; grove/meadow/
  thicket -> "in the ..."; wetland -> "at the wetland";
  trail_edge -> "on the old trail"; ruin -> "at the old
  place"; haven -> "at Haven"; building -> "at the
  building"; street/plaza -> "on the old street/plaza";
  cache -> "at a buried cache".
- Unknown/null tile type -> "You work late — ..." (no place
  name; never a wrong place name).
- The evening record gains `sayPlace` (the tile type used)
  so sweeps can audit emitted text against the recorded
  place. Narration failure still cannot break the record
  (existing try/catch kept).

## 3. Proof

### Fixture (proof instrument): scripts/test-latework-creek-a.js
32 passed, 0 failed. Covers: creek line byte-identical to
the old line; forest_floor line free of "creek" and naming
the forest floor; every other TILE_NAME terrain type with
its phrase and no "creek"; fallback to evening-start tile;
neutral line for null/throwing/missing playerTile; policy
source carries exactly one creek map entry and zero
remaining hardcoded templates.

### Sweep (regression check): bankfood-trace-b driver, unchanged
DAYS=60 death-aware (dead villages stop; +10d tail max),
pilot seeds 15003, 15376, 15009, 15091, 15211, 15215, 15220,
15221, guard leg (WOODWARM=0), BANKFOOD=1, gates
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1. Corpus:
evidence/2026-11-04/sim-latework-creek-a-corpus (8 files).
bfErrs=0 on all 8 seeds. Outcomes: 4 seeds survived 60d,
4 villages lost (days 30/28/24/55 — death-aware stops, not
a fixed horizon).

Analyzer scripts/analyze-latework-creek-a.js on the corpus:
**total late-work lines 9, creek 6, non-creek 3,
wrong-place 0, exit 0.** The day-row tile agrees with
sayPlace on all 9 lines. Detail:

- Seed 15003 (creek evenings, days 24–27, 29, 30): all 6
  lines still read "You work late at the creek — ..." —
  genuinely at a creek, wording untouched.
- Seed 15376 (forest_floor evenings, days 8–10): all 3
  lines now read "You work late on the forest floor — ..."
  — the exact case the finding complained about, fixed in
  the wild, not just in a fixture.
- The other 6 seeds produced no stranded bank/flip
  evenings (mostly inside Haven), so no late-work lines —
  expected, not a gap: the fixture covers every terrain.

### Targeted narration regression (node, sequential, no jest)
- scripts/test-bankfood-b.js: 22 passed, 0 failed.
- scripts/test-upkeepbreakfast-a.js: 32 passed, 0 failed.
- scripts/test-upkeepgate-b.js (FEASTSCALE_R13=1
  SEATDRIVE=0): 13 passed, 0 failed, PROOF GREEN.
- node scripts/check.js --quick: started during the run;
  its background session ended without delivering output
  (runtime session loss, not a test failure). The three
  targeted suites above plus the fixture are the regression
  evidence for this voice-only policy change; check.js
  --quick was not re-run to a delivered result — flagged
  here rather than claimed.

## 4. SENSE TEST (law — read end to end, quoted)

BEFORE (bankretain rerun, seed 16505 loop-day 59,
forest_floor evening, 2 gathers, 0 forages):
"You work late at the creek — 2 deadfall gathers and 0
forages — until the night is too far gone for real sleep."
The evening's own earlier lines were about gathering fallen
limbs from under a tree on a forest tile. The creek line
did not match what the scholar had just done — it sounded
like a stock line pasted over the evening, not a person
describing their night.

AFTER (this sweep, seed 15376 loop-day 8, forest_floor
evening, 1 gather, 3 forages):
"You work late on the forest floor — 1 deadfall gathers
and 3 forages — until the night is too far gone for real
sleep."
This reads as a real person describing where they worked:
they spent the evening gathering deadfall and foraging on
the forest floor, and the line says so, with the same
tired-night tail as before. Nothing else about the line
changed — same counts, same rhythm — so the fix is
invisible except where it was wrong.

CREEK STILL CORRECT (this sweep, seed 15003 loop-day 24):
"You work late at the creek — 1 deadfall gathers and 3
forages — until the night is too far gone for real sleep."
Same wording as before, now earned by actually being at a
creek.

## 5. Village assessment (plain words)

The sweep's villages mostly stayed home: six of eight seeds
never stranded, so no late-work evenings at all. The two
that did strand tell the familiar story — 15003 worked a
creek tile for a week of evenings and lost the village on
day 30; 15376 worked forest-floor evenings early (days
8–10) and survived the full 60 days. The narration fix
changes nothing about those fates; it only makes the
evenings they lived through read true.

## 6. Metric review

The prereg metric (wrong-place late-work lines) proved
exactly right: it caught the bug class, the fixture
measured it per terrain, and the sweep confirmed it in
the wild with zero wrong-place lines. No revision proposed.
One instrument note: the sweep's late-work evenings came
only from creek and forest_floor tiles; all other terrains
are fixture-covered only. If a future arm strands scholars
on grove/meadow/thicket tiles, re-run the analyzer before
claiming wild coverage there.

## 7. Commits (worktree sim-latework-a, merged locally pending ship)

- 7f98fc0a prereg (binding, before any judged sim).
- 260a1604 fix + fixture (43 lines changed in
  scripts/policies/bankfood-diag.js, 74-line fixture).
- This evidence file + analyzer scripts/analyze-latework-creek-a.js
  (committed after the sweep; see git log).

Infrastructure notes: safe-commit.sh hit the known index
clobber twice (committed files shown staged-as-deleted +
untracked in the main index). Both times the commit was
verified correct with git show --stat and the index was
repaired from HEAD blobs (update-index --add --cacheinfo);
final git status clean. No EPERM flap, no truncated files.
