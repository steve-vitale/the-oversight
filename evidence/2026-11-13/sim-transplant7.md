# H1 transplant — family 7: PR #30 dawn honesty, OVE-37 port (arm sim-transplant7-a)

Run: fleshout-20261114T0215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 7 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant7-a` (worktree `~/workspace/worktrees/sim-transplant7-a`).
Prereg written and committed BEFORE any judged sim (and before cutting the subject branch).

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 7: merge `23245d5d6` "Merge origin/master (#30 dawn honesty)
into OVE-37 port" — dawn materialize honesty (OVE-36 Candidate A /
OVE-37 port): when an aimed override wins at dawn, the live objective
kind is aligned to the dawn commitment after the core chore/facing
draws, so what the villager does matches what dawn decided.

## Canon

docs/CANON.md read first. The canon doc for this area is
docs/VILLAGER-BRAIN.md, and it covers the target directly: §5 ("One
arbiter, with commitment" — the pick writes the commitment record;
"While a commitment is still valid ... its candidate's score carries
a commitment multiplier ... A villager's choice does not flip-flop
dawn to dawn") and §4 ("Every dawn decision logs its full
consideration breakdown per villager"). The family is canon-grounded:
it makes the live objective honestly match the dawn commitment — the
commitment §5 already requires — instead of materializing the core
lottery kind while the commitment says something else. Nothing here
invents canon. (No doc named OVE-37 exists; OVE-37 is the port
branch name for this dawn-brain work, and the merge message + second
parent carry it.)

## Family identity (verified at run start, before any sim)

- First parent `7041e1bfb` ("OVE-33: refresh stale quick proofs and
  fix outside-Muse fails"); second parent `a038cf151` ("Align dawn
  materialize with commit after aimed override"). Second-parent side
  is 1 commit.
- `git diff --stat 23245d5d6^1 23245d5d6`: 6 files, +300/−13.
  `src/js`: 2 files — villager-brain.js 59 changed lines
  (numstat 56+/3−), villager-objectives.js 26 changed lines
  (numstat 19+/7−). Total src/js +75/−10. No scripts/policies file
  (pol=0). Table reading (js=2, pol=0) CONFIRMED — matches
  round-2115 §3 and the task brief exactly
  (villager-brain.js + villager-objectives.js).
- The other four files: docs/ONTOLOGY.md (2+/1−), scripts/green-list.txt
  (+1/−0), scripts/test-dawn-materialize-honesty.js (+214/−0, new file),
  scripts/test-villager-brain-dawn.js (8+/2−).
- Content (from the diff, not assumed): OVE-36 Candidate A —
  `vbrainAlignObjective(vid, o, hx, hy)` in villager-brain.js (when
  an aimed override won, rewrite the live objective to the dawn
  commitment: win-plan holds `gear_hold` / `veteran_guard` /
  `party_wait` become an indoor hall chore matching the commit;
  EXPEDITION becomes an indoor chore hold so agencyTick can launch
  without a second lottery; any other aimed override takes the
  commit's kind/purpose/chore/target/companion/goal — no
  `Math.random` anywhere in it); the scorer still returns the CORE
  pick so objPick's chore/facing draws stay on the legacy lottery
  kind (panel byte-stability); the commit also carries `vgoalLine`
  and `chore` now. In villager-objectives.js, objPick wraps every
  early return in `finishLottery(o)` (calls `vbrainAlignObjective`
  when loaded, guarded by try/catch) — FORAGE fall-through, VISIT,
  HUNT, HAUL, SEEK, HAVEN_CHORE, and the outdoor-target return —
  and an EXPEDITION-with-purpose-chore dawn hold is narrated as its
  hold chore instead of falling through to the chore branch. The
  ONTOLOGY change adds the `vbrain_materialize_matches_commit` rule
  + `vbrainAlignObjective` to the villager-brain `**Provides:**`
  line. The test change re-words the dawn test's override
  expectation (scorer returns core pick for the RNG stream; align
  rewrites it to the EXPEDITION hold) and adds the new 214-line
  honesty test (seeded explorer + win-plan gear_hold fixture).
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
  + analyzer, same as the bisect steps); STEP id `t7-23245d5d6`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-7-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 23245d5d6`. On ANY conflict: STOP, report the
  conflict, do NOT hand-resolve game code. The narrowed-tooling rule
  does NOT apply to this arm (task brief, explicit): family 7 is a
  FULL-family attempt; even a tooling-only conflict stops the run,
  and whether its conflicts are tooling-only is recorded for the
  coordinator to authorize a narrowed 7b as a separate decision.
  This arm does not decide that.
- Primary metric: survived/8 on the band. Verdict thresholds (fresh —
  the bisect's metric does not transfer):
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list. (A 2/8 re-run on a
    deterministic driver is a stability check, not fresh evidence —
    say so explicitly if it happens.)
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is 4/8,
    so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution. No cost guard — measurement arm;
  nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant7.js` (family identity incl. the
  merge-tree prediction, live-conflict record, base restored, verdict
  mapping) plus re-run the reused `scripts/test-culpritbisect-a.js`
  (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 7041e1bfb 203a32775 23245d5d6` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base). Prediction: TWO content-conflicted files (TWO
marker blocks total) plus TWO delete/modify entries — FOUR unmerged
paths in the live pick (transplant118/2b counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`):

- `docs/ONTOLOGY.md` — 1 marker block (3 markers, ~line 1974 in
  merge-tree coords): theirs inserts the whole `### villager-brain`
  ONTOLOGY section (with the new `vbrainAlignObjective` in
  `**Provides:**` and the `vbrain_materialize_matches_commit` rule);
  ours has no villager-brain section at that anchor. (The family
  diff itself only touches the Provides line + one rule line — but
  the far end has no villager-brain section at all, so the merge
  inserts the whole section as a conflict.)
- `scripts/green-list.txt` — 1 marker block (3 markers, ~line 800):
  ours side EMPTY at that anchor; theirs adds 2 lines:
  `scripts/test-villager-brain-dawn.js quick`,
  `scripts/test-dawn-materialize-honesty.js quick`.
- Clean: `scripts/test-dawn-materialize-honesty.js` (added in
  remote — clean add); `src/js/villager-objectives.js` (changed in
  both, ZERO markers across its 5 hunks — auto-merges).
- `removed in local` (delete/modify — the family-6 missing-substrate
  wall, twice over):
  - `src/js/villager-brain.js` — base blob `d2882bba9…`, theirs
    blob `2f99c9e51…`, no `our` line. ABSENT at the far end
    (`git ls-tree 203a32775 -- src/js/villager-brain.js` = empty),
    PRESENT at the first parent (`7041e1bfb`, blob `d2882bba9…`).
    The family modifies a whole brain module the far end never had.
  - `scripts/test-villager-brain-dawn.js` — base blob `0ffc7a868…`,
    theirs blob `06eb5ce89…`, no `our` line. ABSENT at the far end,
    PRESENT at the first parent. Same wall, test file.

Substrate gate (family-6 lesson, applied BEFORE the branch was cut):
(a) every file in the family diff checked at the far end —
`villager-brain.js` and `test-villager-brain-dawn.js` are ABSENT
there; (b) merge-tree reports content conflicts AND `removed in
local` / DU entries for src/js files. The gate FAILS on (b) before
any pick is attempted — the STOP below is therefore predicted, not
surprising, and the live pick is run only to record the exact
reproduction.

Consequence recorded BEFORE the pick: the run STOPS with UNMEASURED
if the live cherry-pick reproduces this prediction. The
narrowed-tooling rule does not apply to this arm, and in any case
the conflicts are NOT tooling-only: one is a game-code file
(`villager-brain.js`, DU), one is docs (`ONTOLOGY.md`). A narrowed
family 7b — the villager-objectives.js hunks alone (which
auto-merge) — is mechanically possible and would isolate the
objPick-side alignment from the missing brain module, but that is a
NEW family definition needing its own prereg and a coordinator
decision, not this arm's call. The objectives-side change is the
survival-relevant half (it is the code that rewrites live
objectives); the brain-side change is the align function itself.

## Green-list.txt readers (verified by grep before the pick)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList`
  — the only code reader. It is the check runner, not game code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt
  at all. (Recorded for the tooling-only analysis; the conflicts
  here are not tooling-only regardless — see above.)

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-7-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

(to fill after the live pick)

## Results (filled after the step)

NONE — the run stopped at the cherry-pick; no step ran, no corpus
exists, no survival number was measured. The transplant verdict for
family 7 is UNMEASURED (not CARRIER, not NOT-CARRIER).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its OVE-36 dawn-honesty change
is a decision-coherence change (the live objective honestly matches
the dawn commitment instead of showing the core lottery kind),
described in the family-identity section from the diff and from
docs/VILLAGER-BRAIN.md §4/§5.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step. No re-score, no threshold change proposed.
- Method note carried forward: the merge-tree pre-check IS a
  substrate gate (family-6 lesson, applied here before the pick) —
  a `removed in local` / `added in remote` section for a src/js
  file is a missing-substrate signal, not a clean application.
  Family 7 carries TWO such signals (villager-brain.js AND its test
  file), so the program's dominant outcome repeats: origin-line
  brain-module work cannot be transplanted onto the far end by
  cherry-pick at all.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant7.js`: **(to fill — pre-pick run
  count + post-pick run count)**.
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch after the pick).
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Closeout: arm branch `sim-transplant7-a`, proof-verified tip
  (to fill); subject branch `transplant-7-subject` LEFT at the far
  end `203a32775` (no subject commit); worktree verified clean at
  closeout (tracked tree empty, standing.js == HEAD, no swap
  residue — no swap ever ran).

## Infrastructure

- Host write flap: (to fill at closeout).
- Safe-commit index clobber: (to fill at closeout — watch for it;
  repair is the documented `git ls-tree -r HEAD | git update-index
  --add --index-info` pipe).
- Heartbeats succeeded throughout (run start; pre-pick; post-pick).
