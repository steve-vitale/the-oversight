# H1 transplant — family 6: PR #33 dawn-midday-repick-3e68 (arm sim-transplant6-a)

Run: fleshout-20261114T0015Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 6 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant6-a` (worktree `~/workspace/worktrees/sim-transplant6-a`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 6: merge `f843fab1c` "Merge pull request #33 from
steve-vitale/cursor/dawn-midday-repick-3e68" — the dawn/mid-day
re-pick demotion (OVE-38 Candidate B, VILLAGER-BRAIN seam 9): mid-day
idle/done re-picks run only on a perception-changing event, not on
every idle/done moment.

## Canon

docs/CANON.md read first. The canon doc for this area is
docs/VILLAGER-BRAIN.md, and it covers the target directly: §5
("Re-scoring inside the day happens only on a perception-changing
event — a threat sensed, an injury, a grievance earned, a fight
survived — evaluated at the next day-part boundary") and Seam 9
("every subsystem keeps its own clock... Replaced by: one decision
clock (dawn + event-triggered re-score, §5)"). The family is
canon-grounded: it demotes the mid-day idle/done re-pick to exactly
that event-triggered re-score. Nothing here invents canon.

## Family identity (verified at run start, before any sim)

- First parent `230dba219` (merge origin/master #31 one_person_army
  attainment into OVE-37 port); second parent `713c96f12` ("Demote
  mid-day idle objPick without perception"). Second-parent side is
  1 commit.
- `git diff --stat f843fab1c^1 f843fab1c`: 5 files, +347/−12.
  `src/js`: 2 files — villager-brain.js 48 changed lines
  (numstat 47+/1−), villager-objectives.js 71 changed lines
  (numstat 63+/8−). No scripts/policies file (pol=0). Table reading
  (js=2, pol=0) CONFIRMED — matches round-2115 §3 and the task brief
  exactly (villager-brain.js +48, villager-objectives.js +71).
- The other three files: docs/ONTOLOGY.md (5+/3−), scripts/green-list.txt
  (+1/−0), scripts/test-dawn-midday-repick.js (+231/−0, new file).
- Content (from the diff, not assumed): OVE-38 Candidate B
  (VILLAGER-BRAIN seam 9) — `vbrainShouldRefresh(vid, opts)` /
  `vbrainMarkPerception(vid, reason)` in villager-brain.js (a
  same-day commitment is stale only when its day/part metadata is
  missing or the recorded day no longer matches; advancing day-part
  alone does NOT stale the lead — "that was the mid-day rewrite
  bug"); `objRefreshPick(vid, hx, hy, opts)` /
  `objNeedsEmergencyPick(vid)` in villager-objectives.js (mid-day
  idle/done may call objPick only when the dawn commitment's
  day/part is stale, a perception flag fired, or an emergency body
  gate must interrupt: escape goal, energy < 35, hunger > 55 with
  pantry > 500 kcal); monster-sighting memories mark perception
  (`monster_sighting`); the three mid-day call sites switch from
  direct `objPick` to `objRefreshPick` (one with `{ dawn: true }`).
- `standing.js` NOT in the family diff: the subject's native standing.js
  would be the far-end one (sha256 `75762cb2…`, per the bisect prereg),
  so the standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy would be the far-end competent.js (family touches no
  policy file); own-policy per step, same as the bisect.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t6-f843fab1c`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-6-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 f843fab1c`. On ANY conflict: STOP, report the
  conflict, do NOT hand-resolve game code. ONE exception (coordinator
  decision, family-2b precedent): a conflict in ONLY
  scripts/green-list.txt may be resolved by union — but ONLY after
  verifying that only scripts/check.js reads green-list.txt and zero
  src/js files do. Any other conflicted file: STOP, and the
  deliverable is the conflict report + UNMEASURED verdict.
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
- Proof: `scripts/test-transplant6.js` (family identity incl. the
  merge-tree prediction, live-conflict record, base restored, verdict
  mapping) plus re-run the reused `scripts/test-culpritbisect-a.js`
  (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 230dba219 203a32775 f843fab1c` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base). Prediction: TWO content-conflicted files, THREE
marker blocks total (transplant118/2b counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`):

- `docs/ONTOLOGY.md` — 2 marker blocks (6 markers):
  - Hunk 1 (~line 947, godpath `**Provides:**` line): ours vs
    theirs differ by one inserted function — theirs adds
    `observeHarvestFeed(game)` to the long Provides line; both
    sides edited the same line since the divergence.
  - Hunk 2 (~line 1974–2037): theirs inserts the whole
    `### villager-brain` ONTOLOGY section (with the new
    `vbrain_midday_event_only` rule) AND updates the
    `### villager-objectives` `**Provides:**` line
    (objRefreshPick / objNeedsEmergencyPick / objDangerBelief /
    objRallyFreshRaid(vid) + the `midday_repick_event_only` rule);
    ours has no villager-brain section at that anchor and the old
    Provides line. (Two adjacent insertions that the merge
    presents as two conflict blocks in one changed-in-both section.)
- `scripts/green-list.txt` — 1 marker block (3 markers, ~line 800):
  ours side EMPTY at that anchor; theirs adds 3 lines:
  `scripts/test-villager-brain-dawn.js quick`,
  `scripts/test-dawn-materialize-honesty.js quick`,
  `scripts/test-dawn-midday-repick.js quick`.
- Clean: `src/js/villager-objectives.js` (changed in both, ZERO
  markers — auto-merges); `src/js/villager-brain.js` (base+their
  only, "removed in local" — the far end never touched it since the
  first parent, clean take-theirs); `scripts/test-dawn-midday-repick.js`
  (added in remote — clean add).

Consequence recorded BEFORE the pick: the union exception does NOT
apply even though green-list.txt is conflicted — the exception
covers a conflict in ONLY green-list.txt, and ONTOLOGY.md conflicts
too. If the live cherry-pick reproduces this prediction, the run
STOPS with UNMEASURED. (ONTOLOGY.md is a docs file, not game code,
but the exception as written is green-list-only; resolving a docs
conflict by hand would still be a hand-resolution of family content
outside the authorized carve-out, so the STOP stands.)

## Green-list.txt readers (verified by grep before the pick)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList`
  — the only code reader. It is the check runner, not game code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt
  at all. (Recorded for the union-exception analysis; the exception
  still does not apply — see above.)

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-6-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

(to fill after the live cherry-pick)

## Results (filled after the step)

NONE — (to fill; expected UNMEASURED if the pick stops as predicted).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its OVE-38 seam-9 change is a
dawn/mid-day decision-coherence change (villagers keep their dawn
lead through the day unless something they perceived changes it),
described in the family-identity section from the diff and from
docs/VILLAGER-BRAIN.md §5 / Seam 9.

## Metric review (§14)

(to fill after the STOP: the primary metric was never measured; the
metric itself holds — nothing in the conflict impeaches it; the
transplant METHOD failed at the mechanical step, as for families 1,
2, and 3.)

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

(to fill after the STOP + proof runs)

## Infrastructure

(to fill at closeout)
