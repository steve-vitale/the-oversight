# H1 transplant — family 2: PR #6 raid-danger-heard-c0a3 (arm sim-transplant2-a)

Run: fleshout-20261113T2215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 2 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant2-a` (worktree `~/workspace/worktrees/sim-transplant2-a`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 2: merge `7ddcdfff9` "Merge pull request #6 from
steve-vitale/cursor/raid-danger-heard-c0a3" — the raid-danger heard-filter
family (unify raid danger to one heard-filtered belief read).

## Family identity (verified at run start, before any sim)

- First parent `21ae2d6968` (PR #5 merge, forager-ascension-deed);
  second parent `dff2cd523` ("Merge origin/master into raid-danger-heard
  branch"). Second-parent side is 2 commits: `dff2cd523` itself +
  `763456007` "Unify raid danger to one heard-filtered belief read".
- `git diff --stat 7ddcdfff9^1 7ddcdfff9`: 14 files, +379/−97.
  `src/js`: 4 files, +71/−62 — game.js +7/−1, npc-triggers.js +3/−1,
  villager-goals.js +4/−11, villager-objectives.js +57/−49. No
  scripts/policies file (pol=0). Table reading (js=4, pol=0)
  CONFIRMED — matches round-2115 §3.
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

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t2-7ddcdfff9`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-2-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 7ddcdfff9`. On ANY conflict: STOP, report the
  conflict, do not hand-resolve game code.
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
- Proof: `scripts/test-transplant2.js` (family diff applied completely,
  subject commit recorded, base restored) + the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-2-subject` — (to be filled).
- Subject commit: (to be filled).

## Cherry-pick conflict — STOP (to be filled if the pick conflicts)

(to be filled after the cherry-pick attempt.)

## What this means for the H1 transplant program

(to be filled after the verdict or the STOP.)

## Results (filled after the step)

(to be filled after the step.)

## Sense-testing (SENSE-TESTING LAW)

(to be filled after the step; NONE if no sim ran.)

## Metric review (§14)

(to be filled after the step.)

## Wall numbers

(to be filled after the step. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.)

## Proof results

(to be filled after the proof runs.)
