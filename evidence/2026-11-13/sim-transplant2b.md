# H1 transplant — family 2b: PR #6 raid-danger-heard-c0a3, NARROWED re-run (arm sim-transplant2b-a)

Run: fleshout-20261113T2215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 2b (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant2b-a` (worktree `~/workspace/worktrees/sim-transplant2b-a`).
Prereg written and committed BEFORE any judged sim.

## The question

Family 2 (evidence/2026-11-13/sim-transplant2.md, arm sim-transplant2-a)
STOPPED on a cherry-pick conflict in exactly ONE file,
`scripts/green-list.txt` (UU, lines 916–924 — both sides appended
different test-list entries at the same spot). All four src/js files
applied cleanly and the two files the far end lacked added cleanly.
This arm re-runs the SAME family under a NARROWED prereg that resolves
ONLY that file by union. This is a NEW family definition, not a
re-judgment of family 2 — recorded as such.

Family 2b: merge `7ddcdfff9` "Merge pull request #6 from
steve-vitale/cursor/raid-danger-heard-c0a3" — the raid-danger heard-filter
family (unify raid danger to one heard-filtered belief read) — with the
green-list.txt conflict resolved by union (keep both sides' added
test-list entries, no deletions, no edits to any other line).

## Family identity (verified at run start, before any sim)

- First parent `21ae2d6968` (PR #5 merge, forager-ascension-deed);
  second parent `dff2cd523` ("Merge origin/master into raid-danger-heard
  branch"). Second-parent side is 2 commits: `dff2cd523` itself +
  `763456007` "Unify raid danger to one heard-filtered belief read".
- `git diff --stat 7ddcdfff9^1 7ddcdfff9`: 14 files, +379/−97.
  `src/js`: 4 files, +71/−62 — game.js +7/−1, npc-triggers.js +3/−1,
  villager-goals.js +4/−11, villager-objectives.js +57/−49. No
  scripts/policies file (pol=0). Table reading (js=4, pol=0)
  CONFIRMED — matches round-2115 §3 and the family-2 record.
- Content (from the diff, not assumed): VILLAGER-BRAIN seam 4 —
  door, rally and safety read danger through one heard-filtered
  belief (`objDangerBelief`); gossip counts only if this villager is
  in its heard list; the raid seed arms only villagers at the fire
  (`npcIds().slice(0, 4)`); `dangerHeard` in villager-goals.js becomes
  a thin read over `objDangerBelief`. Perception-first: a raid nobody
  heard arms nothing.
- `standing.js` NOT in the family diff: the subject's native standing.js
  is the far-end one (sha256 `75762cb2…`, per the bisect prereg), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy is the far-end competent.js (family touches no policy
  file); own-policy per step, same as the bisect.

## Narrowed transplant prereg (binding; family-2 prereg plus the one change below)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t2b-7ddcdfff9`.
- Conflict resolution (the ONLY deviation from family 2): after
  `git cherry-pick -m 1 7ddcdfff9`, if the ONLY conflict is
  `scripts/green-list.txt`, resolve it by UNION — keep both sides'
  added test-list entries, no deletions, no edits to any other line.
  FIRST verify by grep that green-list.txt is read only by test/check
  tooling (never by src/js game code at runtime) and record the
  readers; if it is read by game code, STOP and report UNMEASURABLE
  instead. If ANY file other than green-list.txt conflicts, STOP and
  report UNMEASURABLE with the conflict record — do not hand-resolve
  game code. Record the exact union resolution (which lines from each
  side, resulting diff) in evidence.
- Subject: the transplant commit = far end + family diff (with the
  union-resolved green-list.txt), built on scratch branch
  `transplant-2b-subject` in this worktree and LEFT in place (branch
  kept, hash recorded below). Never committed to the arm branch.
- Primary metric: survived/8 on the band. Verdict thresholds (fresh —
  the bisect's metric does not transfer):
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is 4/8,
    so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution. No cost guard — measurement arm;
  nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant2b.js` (family identity incl. the
  narrowed definition, union resolution correctness + green-list
  readers, subject commit recorded, base restored, verdict mapping)
  plus re-run the reused `scripts/test-culpritbisect-a.js` (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 21ae2d6968 203a32775 7ddcdfff9` (base = first parent)
reproduces family 2's prediction exactly: exactly ONE content-conflicted
file — `scripts/green-list.txt`, 3 markers (`+<<<<<<<`, `+=======`,
`+>>>>>>>` by the transplant118 counting method) — and the other three
'changed in both' files (`docs/ONTOLOGY.md`, `src/js/game.js`,
`src/js/villager-objectives.js`) merge cleanly with ZERO markers.
The live conflict hunk (merge-tree `@@ -913,5 +913,12 @@`):

- ours (far end): `scripts/test-pellet-boost-20261108.js quick`,
  `scripts/test-pellet-q4-20261108.js quick`
- theirs (family): `scripts/test-person-trust-20261108.js quick`,
  `scripts/test-raid-danger-heard.js quick`,
  `scripts/test-win-rallyguard.js quick`,
  `scripts/test-retarget-gossip.js quick`

Duplicate check before the pick: the far-end file contains ZERO
occurrences of any of the four theirs-lines, and the merge file
contains ZERO occurrences of either ours-line — the union adds six
distinct lines, no duplication. The union order is ours-first then
theirs (the order the conflict hunk presents them).

## Green-list.txt readers (verified by grep before the pick)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList`
  (line 59) — the only code reader. It is the check runner, not game
  code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt
  at all. The file is a test list with no runtime game effect.
- Only other mentions are comments in scripts (`green-list
  discipline` notes in journey-* scripts). The union is safe: adding
  test-list lines cannot change game behavior; the subject's game-code
  diff is exactly the family's four src/js files.

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-2b-subject` — LEFT in place at the subject
  commit below (never committed to the arm branch).
- Subject commit: `385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac` (parent: far
  end `203a327750a223e0a1465dc51f5409787efdfaae`), message "Merge pull
  request #6 from steve-vitale/cursor/raid-danger-heard-c0a3"
  (the cherry-pick's carried message).
- Subject vs far end: 14 files, +380/−97 — exactly the family file
  list. The src/js content diff is BYTE-IDENTICAL to the family
  src/js diff (+71/−62 across the 4 files; content-hash
  `92023c6d…` both ways, headers/hunks stripped). The +1 insertion
  vs the family (+379) is the green-list union (+4 vs the family's
  +3). No other file differs from the family diff.

## Union resolution (the only deviation from family 2)

The live cherry-pick conflicted in exactly ONE file, as the
merge-tree pre-check predicted:

- UU — `scripts/green-list.txt`, lines 916–924, one hunk. No other
  file conflicted; the other 13 files staged cleanly (M: ONTOLOGY,
  VILLAGER-BRAIN, 5 test scripts, 4 src/js files; A:
  evidence/2026-11-08/raid-danger-heard.md,
  scripts/test-raid-danger-heard.js).

Resolved by UNION (ours first, then theirs — the hunk's own order),
no deletions, no edits to any other line:

- ours (far end): `scripts/test-pellet-boost-20261108.js quick`,
  `scripts/test-pellet-q4-20261108.js quick`
- theirs (family): `scripts/test-person-trust-20261108.js quick`,
  `scripts/test-raid-danger-heard.js quick`,
  `scripts/test-win-rallyguard.js quick`,
  `scripts/test-retarget-gossip.js quick`

Resulting lines 916–921 of the subject file, in order:
pellet-boost, pellet-q4, person-trust, raid-danger-heard,
win-rallyguard, retarget-gossip. Verified after the resolution:
0 conflict markers; diff vs far end = exactly the 4 theirs-lines
added and nothing else; diff vs merge = the 2 ours-lines plus the
6 ladder lines the far end added elsewhere in the file (clean
far-end-side additions, not part of the conflict); each union line
appears exactly once. The subject file also equals the merge file
with the 2 ours-lines inserted after
`scripts/test-alien-expansion-20261107.js`.

## Results (filled after the step)

**VERDICT: AMBIGUOUS (recorded) — 2/8 twice.**

- Step `t2b-7ddcdfff9` (subject `385a9f7b6`, fix swapped in
  `f8fda4295a99`, policy `a7ff5c516440`): **survived 2/8**,
  rank REGIONAL_INTACT, median 123d, instrument errors 0.
- Re-run `t2b-7ddcdfff9r` (fresh STEP id, same subject, same
  mechanics): **survived 2/8 again**, rank REGIONAL_INTACT, median
  123d, instrument errors 0. The re-run reproduces the first run
  EXACTLY — perSeed, wall, and deathCauses byte-identical — as
  expected for a deterministic driver on an identical subject.
- Per the prereg (2/8 → re-run once; 2/8 again → recorded
  AMBIGUOUS): family 2b is **AMBIGUOUS — treated as NOT-CARRIER for
  ordering, kept on the suspect list**. It is NOT a carrier: it did
  not collapse the far end to the merge's 1/8 level. But it is also
  NOT a clean exoneration: 2/8 is two steps below the far end's 4/8,
  and the family moved survival DOWN on the band, not up.

Per-seed (both runs identical):

| seed | days | outcome | max wave | standing | scale | deaths |
|------|------|---------|----------|----------|-------|--------|
| 190391 | 150 | survived | 5 | 450 | regional | 115 |
| 190392 | 150 | survived | 4 | 199 | regional | 55 |
| 190393 | 109 | village-lost | 4 | 199 | regional | 83 |
| 190394 | 100 | village-lost | 4 | 199 | regional | 76 |
| 190395 | 139 | village-lost | 4 | 199 | regional | 132 |
| 190396 | 58 | village-lost | 4 | 175 | regional | 90 |
| 190397 | 123 | village-lost | 4 | 199 | regional | 74 |
| 190398 | 89 | village-lost | 4 | 199 | regional | 69 |

Secondary (diagnostic only): wave-5 unlocks 1/8 (seed 190391 only),
wave-4 8/8, median days 123 (far end: 150), deaths 694 (far end:
629), standing range 175–450 (far end: 150–325), blooded 2/8,
national 0/8, wins 0/8, table 0/8. Death causes (694): villager
combat 257, expedition 203, combat 112, the wild 80, monster 17,
starvation 2, contest 3, the arena 4, a stranger 4, ambush 2, a
wound that wouldn't close 4, the night 1, the expedition 1,
The Congregation 1, Gavel 1, The Callback 1, Ugly-Eyes 1.

## What this means for the H1 transplant program

Family 2b does NOT carry the collapse on its own — but it does
not leave the far end untouched either. The band reads 2/8 where
the far end reads 4/8, and the median falls 150d → 123d. The
family's heard-filtered danger read is survival-relevant in both
directions: seed 190391, which the far end LOST on day 86 at
standing 199, SURVIVED to 150d at standing 450 with wave 5
unlocked under the subject — the strongest single village in
either corpus — while five of the other seven seeds died earlier
than their far-end selves. A filter that arms nothing when nobody
heard the raid can save a village that would have walked into a
raid it never heard — and can also strand a village whose
departures the old unfiltered read would have covered. The
net effect on this band is negative-but-not-collapsing, hence
AMBIGUOUS: the family stays on the suspect list, and the collapse
needs more than this family alone (the merge is 1/8; 2b is 2/8).
The next arms (families 3–16 in table order) continue; if the
program ends with no CARRIER, the collapse is cumulative across
families, and 2b's −2 seeds are part of that sum.

## Sense-testing (SENSE-TESTING LAW)

Read the per-seed corpus for the standout village, seed 190391
(the only survivor to reach wave 5 under the subject; far end
lost the same seed on day 86). Its story reads sensibly and the
numbers cohere with the narration:

- Days 13–35: villagers meet raids at the door in parties of
  five ("Lulwa, Leo, Raj, Meera and Ingrid met them at the door —
  4 put down, 1 driven off"), hurt but holding.
- Day 28: "Lulwa just put down The Callback... on CAMERA. That's
  a veteran kill, folks." Day 35: the same beat for The Redactor.
  Lulwa is named in 5 vetSays (days 13–35), then never again —
  she does not survive to the end, which is why the day-150
  readiness bars still read veterans 0 (the bar counts LIVING
  veterans only): her kills are real, her survival is not.
- Days 99–117: real Producer fights — herald, reunion, algorithm,
  cancellation — and the village survives them; day 130 carries
  the wave-5 "Blooded" beat ("the village knows where the
  Producers bleed"); day 142: "Ricardo met them at the door — 1
  put down." The village ends at standing 450 with a 58,889-kcal
  pantry — rich and standing-high, still only regional, no table,
  no win. The wall holds at the top even for the strongest village.
- One narration wrinkle, not a finding: day 36 repeats "Kurt
  strikes the Elder Old Gavel." three times verbatim before "The
  Elder Old Gavel falls." — identical strike lines, a combat-log
  repetition, not a sense break.

No transcript in the corpus contradicts the numbers; the 2/8
verdict is a survival count, not a narration failure.

## Metric review (§14)

- The primary metric (survived/8) was measured twice, identically.
  The metric held; no re-score, no threshold change proposed. The
  re-run leg behaved as designed: a deterministic driver on an
  identical subject reproduces byte-identical summaries, so the
  re-run is a stability check, not a new sample — worth stating
  plainly so the "2/8 again" is not misread as 16 fresh seeds.
- The merge-tree pre-check (transplant118's suggested substrate
  gate, validated by family 2) predicted the live conflict exactly
  again — file, hunk, both sides' lines. The union carve-out for a
  test-list file worked as specified: the only deviation from
  family 2 was the resolution itself, and the subject's game-code
  diff is byte-identical to the family's.
- Telemetry: the deviation check REFUSED the recorder corpus
  ("refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not
  runs") — recorded, baseline NOT rolled.

## Wall numbers

This run's judged corpus (subject 385a9f7b6, steps t2b-7ddcdfff9 +
t2b-7ddcdfff9r, identical): survived 2/8, national 0/8, table 0/8,
wins 0/8, wave-5 unlocks 1/8, wave-4 8/8, median 123d.
Reference: far end 203a32775 4/8 (median 150d, wave-5 2/8),
merge e4dbe581b 1/8, on the same seeds 190391–190398, 150d,
competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant2b.js`: **65 passed, 0 failed** (run
  after both steps; one leg was fixed first — the merge-side union
  leg initially asserted subject == merge + 2 ours-lines, which
  ignores the 6 ladder lines the far end added elsewhere in the
  file; the corrected leg proves subject-minus-merge ==
  far-minus-merge, i.e. the subject adds to the merge file exactly
  the far-end additions, with nothing in the merge file missing).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Safe-commit index clobber struck once on the prereg commit
  (2c4a7e7b7): the file showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree). The repair
  itself took ~4 min (slow full-tree restat under the write flap).
- Host write flap: the index-clobber repair ran slow (~4 min for
  the status restat); no EPERM failure struck this arm's git or
  file writes directly. Heartbeats succeeded throughout.
- No telemetry deviation check run beyond the recorded refusal:
  the tool refuses recorder-corpus class — recorded, baseline NOT
  rolled.
- Closeout: arm branch `sim-transplant2b-a` tip `2c4a7e7b7` + the
  results commit below (this file's tip-hash line itself is
  record-only); subject branch `transplant-2b-subject` LEFT at
  `385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac`; worktree verified
  clean at closeout (tracked tree empty, standing.js == HEAD,
  no swap residue).
