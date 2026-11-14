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

- Subject branch: `transplant-2b-subject` — PENDING (filled after the pick).
- Subject commit: PENDING.
- Union resolution: PENDING (filled after the pick — exact lines, resulting diff).

## Results (filled after the step)

PENDING — no step run yet.

## Sense-testing (SENSE-TESTING LAW)

PENDING — no sim run yet.

## Metric review (§14)

PENDING — filled after the step.

## Wall numbers

PENDING — no judged corpus yet. Reference points carried from the
bisect prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

PENDING — filled after the step.
