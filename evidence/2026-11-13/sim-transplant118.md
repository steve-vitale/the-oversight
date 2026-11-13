# H1 transplant — family 1: PR #118 prove-out-land-all-534ac (arm sim-transplant118)

Run: fleshout-20261113T2115Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 1 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant118` (worktree `~/workspace/worktrees/sim-transplant118`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 1: merge `1ec04e167` "Merge pull request #118 from
steve-vitale/cursor/prove-out-land-all-534ac" — the largest game-code
family on the origin line (8 src/js files).

## Family identity (verified at run start, before any sim)

- First parent `3339c0195` (PR #50 merge); second parent `534ac4e9d`
  (OVE-154 tip). Merge-base of the parents IS the first parent, so the
  family diff is exactly the 73 commits `3339c0195..534ac4e9d`
  (OVE-129..OVE-154): the army-advance contest leans — Between
  chase/race, Ward army-advance, OPA breach, Unkillable last-standing,
  Apex scout-mark, All-Seeing war-council — each wired + STD16
  rematched + phone-frame proof refreshed.
- `git diff --stat 1ec04e167^1 1ec04e167 -- src/js`: 8 files,
  +1705/−84: comms.js +23, contestEngine.js +221, conversation.js +9,
  game.js +58, godverbs.js +587, titans.js +427, villager-brain.js +380,
  villager-objectives.js +84. No scripts/policies file (pol=0).
  Full merge diff: 1020 files, +188282/−147 (the rest is
  evidence/panels/scripts/proofs — no game effect).
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
  + analyzer, same as the bisect steps); STEP id `t118-1ec04e167`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-118-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 1ec04e167`. On ANY conflict: STOP, report the
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
- Proof: `scripts/test-transplant118.js` (family diff applied
  completely, subject commit recorded, base restored) + the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-118-subject`
- Subject commit: (TBD)
- Cherry-pick: (TBD — clean / conflict)

## Results (filled after the step)

(TBD)

## Sense-testing (SENSE-TESTING LAW)

(TBD — read vetSays transcripts from the band; judge meaning,
coherence, relevance, consequences, never just counts.)

## Metric review (§14)

(TBD)

## Wall numbers

(TBD)
