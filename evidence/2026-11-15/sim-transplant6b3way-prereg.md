# H1 transplant — narrowed family 6b --3way follow-up prereg: the objectives-side half of PR #33 (arm sim-transplant6b3way-a)

Run: fleshout-20261115T0810Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant6b3way-a` (worktree `~/workspace/worktrees/sim-transplant6b3way-a`).
Binding prereg: evidence/2026-11-15/sim-transplant6b-prereg.md (the 6b
prereg — family identity, mechanism analysis, verdict mapping, and
green-list union are inherited verbatim unless this prereg says
otherwise) + evidence/2026-11-15/sim-transplant6b.md (the 6b arm: plain
`git apply` FAILED on the two header-comment hunks only; `git apply
--3way --check` clean as a diagnostic; subject branch
`transplant-6b-subject` left at the far end `203a32775`, no subject
commit exists) + evidence/2026-11-15/sim-scale-onramp-round-0707.md
(coordinator authorization: this --3way follow-up is next blank (1)
from run fleshout-20261115T0707Z, with explicit coordinator
AUTHORIZATION recorded there) + evidence/2026-11-15/sim-transplant7b-prereg.md
+ evidence/2026-11-15/sim-transplant7b.md (the 7b arm's baseline-leg
method, reused exactly here).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §5 ("Re-scoring
inside the day happens only on a perception-changing event — evaluated
at the next day-part boundary") and Seam 9 ("one decision clock (dawn +
event-triggered re-score, §5)") read — the family's area. The family is
canon-grounded: it demotes the mid-day idle/done re-pick to exactly that
event-triggered re-score. No canon is invented or rewritten.

Written and committed BEFORE cutting the subject commit or running any
judged sim (proof scripts/test-transplant6b3way.js, stage 1, green at
prereg stage; targeted refresh script
scripts/test-transplant6b-refresh.js inherited from the 6b arm, control
run on the far end recorded in the 6b evidence).

## The question

Does the objectives-side half of PR #33 alone — narrowed family 6b, the
`src/js/villager-objectives.js` hunks of merge `f843fab1c` (dawn-midday-
repick, OVE-38 Candidate B, seam 9) — collapse the far end `203a32775`
(GOOD 4/8 on the matched band) toward the merge's 1/8? The 6b arm could
not answer it: plain `git apply` of the mechanically extracted
objectives patch failed on the two header-comment hunks (the far end
stripped the brain-module references from the comment block), and the
6b prereg's conflict-STOP rule fired before any sim. This arm answers
it with the method the 6b evidence proposed and the coordinator
authorized: build the subject with `git apply --3way` of the same
filtered objectives patch. Nothing the 6b arm already measured,
nothing else from the merge.

## What changes vs the 6b prereg (the ONLY deltas)

1. APPLICATION METHOD: `git apply --3way` (not plain `git apply`).
   The 6b diagnostic (`git apply --3way --check` clean) is the basis;
   the live `--3way --check` on the subject branch at the far end is
   the authority, run before the subject commit.
2. COMMENT HUNKS: hunks 0–1 (header comment) are EXPECTED to 3-way-
   merge and therefore NOT byte-identical to the family's comment
   hunks. They are accepted ONLY as inert-text-only: the resulting
   diff is reviewed line by line and recorded in the evidence, and
   the proof gates that every non-code added/removed line in the
   subject diff is a comment line (`//` after trim) and that the
   family's three added comment lines (the two method-list lines +
   the `midday_repick_event_only` rule line) are present in the
   subject file. If ANY code hunk differs or ANY conflict appears:
   STOP per §3way-STOP below (conflict-STOP, same discipline as the
   6b arm), no subject, no corpus.
3. STEP IDS: baseline `ep-far-6b3way`, subject `t6b3way-f843fab1c`
   (the 6b ids `ep-far-6b` / `t6b-f843fab1c` are not reused — the 6b
   run cut no step, so no corpus collision exists, but the ids stay
   distinct so the two runs' records can never be confused).
4. PROOF SCRIPT: `scripts/test-transplant6b3way.js` (adapted from the
   6b proof; same sections, renamed ids/branch/evidence paths, plus
   the comment-hunk inert-only legs and the 3way-STOP branch).
5. EVIDENCE FILE: `evidence/2026-11-15/sim-transplant6b3way.md`
   (this prereg: `evidence/2026-11-15/sim-transplant6b3way-prereg.md`).

Everything else — family identity, narrowed definition, mechanism
analysis, green-list union, seed band, verdict mapping, baseline gate,
family-test leg, guards — is inherited from the 6b prereg unchanged
and is restated below only where this arm re-verifies it.

## Family identity (re-verified by THIS arm at run start, before any sim)

- Merge `f843fab1c` ("Merge pull request #33 from
  steve-vitale/cursor/dawn-midday-repick-3e68"). First parent
  `230dba219`; second parent `713c96f12` ("Demote mid-day idle objPick
  without perception"). Second-parent side is 1 commit.
- `git diff --stat f843fab1c^1 f843fab1c`: 5 files, +347/−12.
  `src/js`: 2 files — villager-brain.js 47+/1− (EXCLUDED from 6b),
  villager-objectives.js 63+/8− (the 6b set). No scripts/policies
  file (pol=0). The other three files: docs/ONTOLOGY.md (5+/3−,
  EXCLUDED), scripts/green-list.txt (+1/−0, the union line),
  scripts/test-dawn-midday-repick.js (+231/−0, new file).
- The narrowed 6b set is exactly the SEVEN objectives hunks
  (`@@ -5,6 +5,8 @@`, `@@ -15,6 +17,7 @@`,
  `@@ -264,6 +267,44 @@`, `@@ -708,12 +749,24 @@`,
  `@@ -1141,12 +1194,13 @@`, `@@ -1435,7 +1489,9 @@`,
  `@@ -1449,10 +1505,9 @@`): objRefreshPick /
  objNeedsEmergencyPick (new methods), the three mid-day call sites
  switch from direct objPick to objRefreshPick (one with
  `{ dawn: true }`), monster-sighting memories mark perception
  (`monster_sighting`), header comment (method list +
  `midday_repick_event_only` rule line).
- `f843fab1c` is NOT an ancestor of the far end `203a32775` and IS an
  ancestor of master HEAD. `src/js/villager-brain.js` is ABSENT at the
  far end and PRESENT at the first parent (blob `2f99c9e51…`) — the
  full-family DU, reproduced in this arm's merge-tree pre-check.
- The subject branch `transplant-6b-subject` is LEFT at the far end
  `203a32775` by the 6b arm (verified by this arm at run start:
  `git rev-parse transplant-6b-subject` =
  `203a327750a223e0a1465dc51f5409787efdfaae`). No subject commit
  exists. This arm cuts the subject commit from there; the branch is
  NOT re-cut (re-cutting would destroy the 6b arm's recorded
  disposition).

## Narrowed 6b definition (unchanged from the 6b prereg)

Include ONLY these pieces of the family diff:

1. ALL SEVEN `src/js/villager-objectives.js` hunks (family-diff
   headers as above): +63/−8 total. Contents: header comment (the
   two new methods listed + the `midday_repick_event_only` rule
   line); `objNeedsEmergencyPick(vid)` (escape goal, energy < 35,
   hunger > 55 with pantry > 500 kcal); `objRefreshPick(vid, hx,
   hy, opts)` (the typeof-guarded gate around `objPick`; dawn
   callers pass `{ dawn: true }`); monster-sighting memory: two
   `vbrainMarkPerception(vid, 'monster_sighting')` call sites (one
   on the update path, one on the insert path), both typeof-guarded;
   three call-site switches: objMaybeDepart idle/done
   (`objPick` → `objRefreshPick`), haul-return
   (`objPick` → `objRefreshPick(rid, hx, hy, { dawn: true })`),
   indoor fallback (`objPick` → `objRefreshPick`).
2. The new test file `scripts/test-dawn-midday-repick.js` (+231,
   blob `70409952…`, byte-identical to the merge's copy).
3. The green-list union line `scripts/test-dawn-midday-repick.js
   quick` (see §Green-list union — the ONLY authorized carve-out).

EXCLUDED: `src/js/villager-brain.js` (all 48 lines), the
`docs/ONTOLOGY.md` changes (all 8 lines), everything else. The
subject diff must be exactly: one src/js file (+63/−8, code-hunk
added/removed lines byte-identical to the family's code hunks —
see §3way subject gate) + the test file (+231) + the green-list
union (+1 line). No other file touched.

## Mechanism analysis (inherited from the 6b prereg, pre-registered — not a verdict)

What the 6b hunks CAN do alone on far-end substrate:

- (a) `objRefreshPick`'s gate is DEAD on this substrate. The guard
  reads `typeof this.vbrainOwnsDawn === 'function' &&
  this.vbrainOwnsDawn() && typeof this.vbrainShouldRefresh ===
  'function' && !this.vbrainShouldRefresh(vid, opts) &&
  !this.objNeedsEmergencyPick(vid)`. At the far end,
  `vbrainOwnsDawn`, `vbrainShouldRefresh`, and
  `vbrainMarkPerception` exist in NO src/js file (`git grep -l`
  over `203a32775 -- src/js/` returns nothing for all three
  names; they live in `villager-brain.js` + `villager-agency.js`
  on the origin line, and the far end has neither the module nor
  the references). The first typeof test is false, the `&&`
  short-circuits, no method is called, no RNG is consumed, and
  `objRefreshPick` falls straight through to `return
  this.objPick(vid, hx, hy)`. On far-end substrate,
  `objRefreshPick ≡ objPick` — same function, same arguments,
  same RNG stream.
- (b) The three call-site switches are therefore BEHAVIORALLY
  INERT on this substrate: each switched call reaches the same
  `objPick` with the same arguments (the `{ dawn: true }` opts
  object is ignored by `objPick`, which takes `(vid, hx, hy)`).
- (c) `objNeedsEmergencyPick` is DEFINED but UNREACHABLE on this
  substrate: its only caller is the dead guard in (a). The
  emergency body gates (escape / energy < 35 / hunger > 55 with
  pantry > 500) never fire through it here.
- (d) The two `monster_sighting` `vbrainMarkPerception` calls are
  typeof-guarded no-ops on this substrate (the method does not
  exist); they cannot mark anything.
- (e) The header-comment hunks are inert text.
- (f) The test file and the green-list line are not loaded by the
  sim harness (only src/js via index.html order) and cannot move
  survival.

Consequence, stated up front: the 6b subject is EXPECTED to be
behaviorally inert on far-end substrate — the survival leg should
read NOT-CARRIER with per-seed trajectories BIT-IDENTICAL to the
baseline leg (count AND per-seed days identical), the same expected
form as 7b's. That is a finding about THIS substrate (the gate-keeping
brain module is missing from the far end), not a verdict on the full
family 6: the demotion only bites when `vbrainShouldRefresh` exists
to say no. If the subject leg instead diverges from baseline, the
divergence is reported, never re-scored — a divergence would falsify
this mechanism analysis and would itself be the finding.

## The --3way subject gate (binding on this arm)

Build the subject by MECHANICALLY applying the filtered objectives
patch with `git apply --3way` onto the subject branch at the far end,
plus the new test file plus the green-list union, on scratch branch
`transplant-6b-subject` (already at the far end, left by the 6b arm).
The gate, in order:

1. `git apply --3way --check` on the subject branch MUST exit 0
   with no conflict report. Any conflict → STOP (see below).
2. After `git apply --3way`, `git status` must show NO unmerged
   paths and the file must contain NO conflict markers
   (`<<<<<<<` / `=======` / `>>>>>>>`). Any marker → STOP.
3. CODE HUNKS BYTE-IDENTICAL: the subject diff's added/removed
   lines for hunks 2–6 must equal the family's code-hunk
   added/removed lines exactly (multiset equality, per the proof).
   Any code-hunk difference → STOP.
4. COMMENT HUNKS INERT-ONLY: every subject-diff added/removed line
   NOT accounted for by the family code hunks must be a comment
   line (`//` after trim), and the family's three added comment
   lines (the two method-list lines + the
   `midday_repick_event_only` rule line) must be present in the
   subject file. The resulting header-comment diff is reviewed
   line by line and recorded verbatim in the evidence. Any
   non-comment line outside the code hunks → STOP.
5. Test file byte-identical to the merge's copy (blob
   `70409952…`); green-list diff exactly +1/−0 (the one union
   line); NO `villager-brain.js` content; NO ONTOLOGY.md changes;
   subject policy == far-end policy `a7ff5c51…`; subject native
   standing == far-end standing `75762cb2…`.

## 3way-STOP rule (binding on this arm)

On ANY failure of the gate above (a `--3way` conflict, a conflict
marker left in the file, a code-hunk difference, or a non-comment
line outside the code hunks): STOP, report the exact failure (which
hunks, which lines), do NOT hand-resolve game code, do NOT silently
drop a conflicting hunk and proceed (dropping would redefine the
family mid-run), report UNMEASURED with the exact failure list. The
green-list union is the ONLY carve-out, and it covers ONLY the one
line in §Green-list union. Any conflict anywhere else — or any
second green-list line — fires the STOP. Same discipline as the 6b
arm's conflict-STOP; the only change is the authorized application
method.

## Merge-tree pre-check (re-run by THIS arm at run start)

`git merge-tree 230dba219 203a32775 f843fab1c` reproduces the 6b
prediction exactly (the proof re-runs it live):

- `src/js/villager-objectives.js` — changed in both, ZERO markers:
  all seven family hunks auto-merge. PREDICTED OUTCOME — MEASURABLE
  VIA --3WAY: the filtered objectives patch applies to the far end
  with ZERO conflicts under `git apply --3way`, because the hunks
  are marker-free in the full-family merge-tree output and the 6b
  diagnostic (`git apply --3way --check`) was clean. The live
  `--3way --check` on the subject branch is the authority — if it
  conflicts, the 3way-STOP rule above fires. (Prereg-method note
  carried from the 6b arm: a marker-free 3-way merge does NOT imply
  a clean 2-way patch application — that is exactly why this arm
  uses the 3-way method, and why the plain-apply failure of the 6b
  arm does not impeach this prediction.)
- `docs/ONTOLOGY.md` — 2 marker blocks (6 markers). EXCLUDED.
- `scripts/green-list.txt` — 1 marker block (3 markers): ours side
  EMPTY; theirs adds 3 lines. The union carve-out covers ONLY the
  third line; the first two are family-7 content, never added.
- `src/js/villager-brain.js` — `removed in local` (DU). EXCLUDED.
- `scripts/test-dawn-midday-repick.js` — `added in remote` (clean
  addition, blob `70409952…`).
- Total markers: 9 (3 blocks × 3), all confined to ONTOLOGY.md +
  green-list.txt. No other markers anywhere.

## Green-list union (inherited from the 6b prereg — the ONLY authorized carve-out; family-2b precedent)

The merge's green-list hunk adds `scripts/test-dawn-midday-repick.js
quick` after `scripts/test-dawn-materialize-honesty.js quick` — but
that anchor line is ABSENT at the far end (it is family-7 content,
PR #30 dawn honesty, not in 6b). A plain `git apply` of the merge's
green-list hunk would fail on context. The union resolves it:

- Far-end green-list contains ZERO occurrences of
  `scripts/test-dawn-midday-repick.js quick` (verified by grep).
- Insert exactly that ONE line into the far-end file at the
  analogous position: after `scripts/test-village-smoke-20261011.js`
  (the line immediately above the dawn block in the merge) and
  before `scripts/test-villager-gear-20261009.js` (the line
  immediately below it). Both neighbors are present at the far end
  at lines 802–803.
- No line is removed, no line is edited, no other line is added.
  The two family-7 lines (`test-villager-brain-dawn.js quick`,
  `test-dawn-materialize-honesty.js quick`) are NOT added — they
  belong to family 7.
- Result: far-end green-list + 1 line. The subject's green-list
  diff is +1/−0, exactly the family's green-list line, at the
  far-end position.
- Readers (verified by grep in the 6b prereg, re-verified by the
  proof): `scripts/check.js` reads `scripts/green-list.txt` via
  `readList` (line 59) — the only code reader. ZERO readers in
  `src/` — no `src/js` file references green-list.txt at all. The
  file is a test list with no runtime game effect.

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190391–190398** (8 seeds), the MATCHED band.
- BAND NOTE (coordinator decision, recorded here and in the 6b
  prereg): the matched band 190391–190398 is REUSED BY DESIGN — it
  is the program's defining baseline band where the far end reads
  4/8 (reproduced twice: masterregress, then 8b, then 7b with
  identical per-seed days), NOT claimed fresh.
- Freshness search (per local_seed_band_freshness skill), scope:
  `evidence/*/sim-*-prereg.md` (every dated prereg) + every
  forbidden/contaminated band list those files name + `evidence/*/sim-*.md`
  evidence files. Method: word-boundary grep for the exact 6-digit
  seeds `19039[1-8]`.
  - Result: **90 prereg files** reference the band
    (`grep -rl --include='sim-*-prereg.md' -E '19039[1-8]' evidence/
    | wc -l` = 90) — the band is the program's shared baseline,
    named as the same band in every bisect / transplant prereg from
    vetphantom through 7b and the 6b arm. Zero forbidden/contaminated
    list carries a 190391–190398 reservation (the band IS the
    reference band; the Oct 26–27 preregs naming "forbidden" carry
    no 19039x reservation).
  - **Verdict: band 190391–190398 is REUSED BY DESIGN, not fresh.**
    No next-band fallback applies — reuse is the coordinator's
    decision for this arm, recorded here.
- NOTE on the step tooling: `scripts/culpritbisect-step.sh` and
  `scripts/culpritbisect-analyze-20261113.js` hardcode the matched
  band (SEEDS literal / SEEDS constant) — this run USES the matched
  band, so both run AS-IS from the worktree, no /tmp copies needed
  (unlike 8c, which needed copies for its fresh band). The committed
  tooling is NOT edited.

## Measurement plan

- Subject branch `transplant-6b-subject` left in place; subject
  commit hash recorded in evidence. Measured diff verified per the
  --3way subject gate above: the subject diff's code-hunk
  added/removed lines byte-identical to the family's code hunks;
  the comment-hunk lines inert-only and reviewed line by line; the
  test file byte-identical to the merge's copy (blob `70409952…`);
  the green-list diff exactly +1/−0 (the one union line);
  NO `villager-brain.js` content (no `vbrainShouldRefresh` /
  `vbrainMarkPerception` definitions, no ONTOLOGY.md changes);
  subject policy == far-end policy `a7ff5c51…`; subject native
  standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-6b3way` on the far end `203a32775`,
  via `scripts/culpritbisect-step.sh` (matched band, fix standing
  swapped in). Expect the far end to read healthy (4/8, per-seed
  days 86/144/150/43/150/87/150/150, as reproduced three times).
  Gate: the baseline leg reads ≥3/8 — if it reads ≤2/8, STOP and
  report loudly (the 8c precedent: the baseline would not replicate
  far-end health; no subject step is cut). The settled matched-band
  baseline (4/8) is the anchor, not this run's leg.
- SUBJECT LEG: STEP id `t6b3way-f843fab1c`, via the same step script.
  Seeds 190391–190398, 150d death-aware, competent verbatim
  own-policy (family touches no policy — subject policy IS the
  far-end policy `a7ff5c51…`), fix standing swapped in every step,
  native restored byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept
  on the suspect list); ≥3/8 NOT-CARRIER. The task's expected
  NOT-CARRIER form is subject identical to the baseline leg (count
  AND per-seed days identical — the mechanism analysis in §Mechanism
  predicts bit-identical trajectories); a ≥3/8 subject that differs
  from baseline is still NOT-CARRIER, with the divergence reported,
  never re-scored.
  Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpora; judge
  coherence/meaning/consequences, not just counts. Precedent
  warning: the objectives change touches no dialogue, so no
  dialogue census is expected to move; census the vetSays lines
  for decision-coherence signals (villagers sitting idle mid-day
  vs re-picking) and report what the transcripts show. The 7b arm
  found the two corpora's vetSays arrays byte-identical (225/225)
  — the same identity census is run here.

## Family-test leg (refresh behavior — pre-registered)

The merge's own proof `scripts/test-dawn-midday-repick.js` CANNOT run
whole on the 6b subject: its precondition (lines 95–98) requires
`Game.vbrainShouldRefresh`, `Game.vbrainMarkPerception`,
`Game.objRefreshPick`, AND `Game.vbrainOwnsDawn` as functions, and
three of the four do not exist on far-end substrate (the subject
carries only `objRefreshPick`). Attempt the proof against the subject
tree (pathspec extract to /tmp — never a full-tree extract, /tmp tmpfs
is 512M) and record the outcome: the expected result is the script's
own SKIP exit (exit 2, 'mid-day refresh API missing') — a pre-existing
far-end substrate gap for the 6b-only subject, NOT a regression and
NOT a pass, same class as 8b's #14 finding (that sub-test file is
absent at the far end too) and 8c's #4 finding (missing 8b method).
The far-end control run of the same proof (exit 2, same skip) is
recorded alongside, as the 6b arm did.

The 6b behavior is proven instead by the dedicated script
`scripts/test-transplant6b-refresh.js` (inherited from the 6b arm),
run BEFORE/AFTER (far end vs subject, same staging, same seed,
`--mode pick` vs `--mode refresh`):

- Mode `pick`: stage an idle/done villager at haven, call
  `Game.objPick(vid, hx, hy)` once, print the resulting objective
  JSON + next RNG draw. Runs on BOTH trees (the control).
- Mode `refresh`: same staging, call `Game.objRefreshPick(vid, hx,
  hy)` once, print the same JSON. EXPECTED: exit 1 on the far end
  (the method does not exist — the pre-fix control) and exit 0 on
  the subject, with output BYTE-IDENTICAL to mode `pick` on the
  subject (same seed, same staging) — the live proof of mechanism
  (a): `objRefreshPick ≡ objPick` on this substrate.
- The script also asserts the substrate fact directly: on the
  subject, `typeof Game.vbrainOwnsDawn === 'undefined'` and
  `typeof Game.vbrainShouldRefresh === 'undefined'` and
  `typeof Game.vbrainMarkPerception === 'undefined'`, while
  `typeof Game.objRefreshPick === 'function'` and
  `typeof Game.objNeedsEmergencyPick === 'function'`.
- Both runs are recorded in the evidence file. Green/not-green is
  reported SEPARATELY from the survival verdict, per the task brief.

## Proof

`scripts/test-transplant6b3way.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master; villager-brain.js absent at the far end, present
at the first parent), narrowed definition (the family diff has
exactly 7 objectives hunks + 1 brain file + ONTOLOGY + green-list +
test file; the 6b set is exactly the 7 objectives hunks, named by
header; the excluded brain/ONTOLOGY content named exactly),
merge-tree prediction (objectives marker-free, ALL 9 markers confined
to ONTOLOGY 2 blocks + green-list 1 block, test file added cleanly,
villager-brain.js DU), mechanism analysis (`vbrain*` absent at the
far end by git grep; `objRefreshPick` guard short-circuits on the
first typeof; `objNeedsEmergencyPick` unreachable except via the dead
guard; monster-sighting marks typeof-guarded; call-site `{ dawn:
true }` opts ignored by `objPick`), green-list union (readers: only
check.js; zero src/js; far-end file has zero occurrences of the new
line; union position named by neighbors), the --3way subject gate +
3way-STOP rule + verdict mapping (incl. the GATE-STOP branch), base
state (branch-identity legs worktree-aware per the 0215 coordinator
note — they assert the arm branch in the worktree and the merged tip
on master, so the proof stays green on master), seed-band identity
(matched band 190391–190398, REUSED BY DESIGN, 90 prereg files
reference it; STEP ids ep-far-6b3way / t6b3way-f843fab1c; subject
branch transplant-6b-subject; step script + analyzer used as-is,
matched band hardcoded). Sections for live subject state and step
corpora are added after the subject is cut and the steps run; on the
3way-STOP path they become the live conflict record / no-corpus
sections instead, and on the GATE-STOP path the step-corpora section
takes the gate-stop branch.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
branch as the reused-tooling check.
`scripts/test-transplant6b-refresh.js` — the targeted before/after
script for the family-test leg (see above); stage 1 control run on
the far end must show the pre-fix behavior (refresh mode exit 1,
pick mode exit 0), stage 2 run on the subject must show
`objRefreshPick ≡ objPick` (both modes exit 0, byte-identical JSON).

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md §5 / Seam 9 (the
family's area). No canon doc covers survival-collapse attribution;
nothing here invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game, no before/after
pair to compare on one base. The before/after comparison IS the
boundary pair (far end vs subject) on identical seeds, judged by the
analyzer's decision rule. Same standing as masterregress §7,
survivalcontrol-b §7, anchor-a §7, and the r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict stands
  only if the errors cannot touch the survival read (the survival read
  comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified:
  `75762cb2…` on the far end / subject) before the next step or any
  evidence commit. If a restore fails, FAIL LOUDLY and do not commit
  evidence. After each leg, check the arm branch back out (the step
  script leaves HEAD detached at the step commit).
- This arm does NOT re-judge any prior verdict (family 6 UNMEASURED,
  6b UNMEASURED, 7b NOT-CARRIER, 8b NOT-CARRIER, 8c UNMEASURED,
  masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the
  rest of the bisect record) — it measures only the narrowed 6b
  objectives half via the --3way method.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test and refresh runs.
- No game-code change is committed by this arm on the arm branch
  (the subject lives on its own branch `transplant-6b-subject`, left
  in place); no `[needs-eyes]` applies. The arm branch commits only:
  prereg, proof scripts, evidence file, step corpora + summaries +
  driver logs.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect / transplant arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT rolled.
- Flap note: the flap-watch log is read at run start; prereg + tooling
  are written and committed only after a probe succeeds. If the flap
  returns mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial. A host write flap hit
  this run ~08:18–08:21Z (EPERM on fresh-file writes and git ref
  writes, cleared in ~3 min) — recorded here because it predates
  this arm's first write; the flap-watch log read ALL-OK at 08:47Z
  before this prereg was written.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
