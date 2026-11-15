# H1 transplant — narrowed family 6b prereg: the objectives-side half of PR #33 (arm sim-transplant6b-a)

Run: fleshout-20261115T0615Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant6b-a` (worktree `~/workspace/worktrees/sim-transplant6b-a`,
base master at run start — HEAD 96c139d75, an ancestor of master 3904f2b8f).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step mechanics,
far-end baseline 4/8 with per-seed days 86/144/150/43/150/87/150/150 on the
matched band 190391–190398) + evidence/2026-11-13/sim-transplant6.md
(full family 6: cherry-pick STOP on the villager-brain.js DU + ONTOLOGY
conflicts; narrowed 6b proposed there as the mechanically possible next
step) + evidence/2026-11-14/sim-transplant8c-prereg.md (narrowed-family +
baseline-gate-STOP pattern) + evidence/2026-11-14/sim-transplant8c.md
(gate-STOP precedent: fresh-band baseline 1/8 stopped the run).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §5 ("Re-scoring
inside the day happens only on a perception-changing event — evaluated at
the next day-part boundary") and Seam 9 ("one decision clock (dawn +
event-triggered re-score, §5)") read — the family's area. The family is
canon-grounded: it demotes the mid-day idle/done re-pick to exactly that
event-triggered re-score. No canon is invented or rewritten.

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant6b.js, stage 1, green at prereg stage;
targeted refresh script scripts/test-transplant6b-refresh.js, control run
on the far end recorded in §Family-test leg).

## The question

Does the objectives-side half of PR #33 alone — narrowed family 6b, the
`src/js/villager-objectives.js` hunks of merge `f843fab1c` (dawn-midday-
repick, OVE-38 Candidate B, seam 9) — collapse the far end `203a32775`
(GOOD 4/8 on the matched band) toward the merge's 1/8? The full family 6
could not be measured: its cherry-pick stopped on a delete/modify conflict
(`src/js/villager-brain.js` — the far end never had the brain module) plus
ONTOLOGY.md conflicts. The objectives-side change is the survival-relevant
half (it is the code that stops mid-day re-picks); the brain-side change
is the gate-keeping around it. This arm measures ONLY the objectives side.
Nothing the full family 6 already excluded, nothing else from the merge.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `f843fab1c` (full `f843fab1c…` — "Merge pull request #33 from
  steve-vitale/cursor/dawn-midday-repick-3e68"). First parent `230dba219`
  ("Merge origin/master (#31 one_person_army attainment) into OVE-37
  port"); second parent `713c96f12` ("Demote mid-day idle objPick
  without perception"). Second-parent side is 1 commit.
- `git diff --stat f843fab1c^1 f843fab1c`: 5 files, +347/−12.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3 and the family-6
  prereg.
  - `src/js/villager-objectives.js` +63/−8: `objRefreshPick(vid, hx,
    hy, opts)` / `objNeedsEmergencyPick(vid)` (new methods), the three
    mid-day call sites switch from direct `objPick` to
    `objRefreshPick` (one with `{ dawn: true }`), monster-sighting
    memories mark perception (`monster_sighting`).
  - `src/js/villager-brain.js` +47/−1: `vbrainShouldRefresh(vid,
    opts)` / `vbrainMarkPerception(vid, reason)` (new methods) —
    EXCLUDED from 6b (see §Narrowed 6b definition).
  - `docs/ONTOLOGY.md` +5/−3: the `### villager-brain` section
    insert + the `### villager-objectives` `**Provides:**` line
    (objRefreshPick / objNeedsEmergencyPick / objDangerBelief /
    objRallyFreshRaid(vid) + the `midday_repick_event_only` rule) —
    EXCLUDED from 6b (docs, not game code; the family-6 pick
    conflicted on it).
  - `scripts/green-list.txt` +1/−0: `scripts/test-dawn-midday-repick.js
    quick` — included ONLY as the union line (see §Green-list union).
  - `scripts/test-dawn-midday-repick.js` +231/−0 (new file, blob
    `70409952…`): the OVE-38 Candidate B proof — included.
- `standing.js` NOT in the family diff; `scripts/policies` NOT in the
  family diff. The subject's native standing.js is the far-end one
  (sha256 `75762cb2…`), so the standing-fix swap mechanics are exactly
  as in the bisect prereg. Far-end policy sha `a7ff5c51…`; the family
  touches no policy file.
- The test file is ABSENT at the far end AND at the first parent,
  present at the merge: a clean addition, not missing substrate.
- `f843fab1c` is NOT an ancestor of the far end `203a32775` (verified
  by this arm — the family is origin-side, absent from the far end),
  and IS an ancestor of master HEAD (the origin line was merged to
  master after the far end; the family lives on master today).
- `src/js/villager-brain.js` is ABSENT at the far end (`git ls-tree
  203a32775 -- src/js/villager-brain.js` = empty) and PRESENT at the
  first parent (`230dba219`, blob `2f99c9e51…`) — the full-family DU,
  recorded in sim-transplant6.md, reproduced in this arm's
  merge-tree pre-check below. Narrowed 6b never touches that file.

## Narrowed 6b definition (COORDINATOR-DEFINED via the task brief — do not redefine)

Include ONLY these pieces of the family diff:

1. ALL SEVEN `src/js/villager-objectives.js` hunks (family-diff
   headers `@@ -5,6 +5,8 @@`, `@@ -15,6 +17,7 @@`,
   `@@ -264,6 +267,44 @@`, `@@ -708,12 +749,24 @@`,
   `@@ -1141,12 +1194,13 @@`, `@@ -1435,7 +1489,9 @@`,
   `@@ -1449,10 +1505,9 @@`): +63/−8 total. Contents:
   - header comment: the two new methods listed + the
     `midday_repick_event_only` rule line;
   - `objNeedsEmergencyPick(vid)` (escape goal, energy < 35,
     hunger > 55 with pantry > 500 kcal);
   - `objRefreshPick(vid, hx, hy, opts)` (the typeof-guarded gate
     around `objPick`; dawn callers pass `{ dawn: true }`);
   - monster-sighting memory: two `vbrainMarkPerception(vid,
     'monster_sighting')` call sites (one on the update path, one
     on the insert path), both typeof-guarded;
   - three call-site switches: objMaybeDepart idle/done
     (`objPick` → `objRefreshPick`), haul-return
     (`objPick` → `objRefreshPick(rid, hx, hy, { dawn: true })`),
     indoor fallback (`objPick` → `objRefreshPick`).
2. The new test file `scripts/test-dawn-midday-repick.js` (+231,
   blob `70409952…`, byte-identical to the merge's copy).
3. The green-list union line `scripts/test-dawn-midday-repick.js
   quick` (see §Green-list union — the ONLY authorized carve-out).

EXCLUDED: `src/js/villager-brain.js` (all 48 lines), the
`docs/ONTOLOGY.md` changes (all 8 lines), everything else. The
subject diff must be exactly: one src/js file (+63/−8, byte-identical
added/removed lines to the family's objectives hunks) + the test file
(+231) + the green-list union (+1 line). No other file touched.

## Mechanism analysis (pre-registered, from source reads at the far end — not a verdict)

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
form as 8c's. That is a finding about THIS substrate (the gate-keeping
brain module is missing from the far end), not a verdict on the full
family 6: the demotion only bites when `vbrainShouldRefresh` exists
to say no. If the subject leg instead diverges from baseline, the
divergence is reported, never re-scored — a divergence would falsify
this mechanism analysis and would itself be the finding.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 230dba219 203a32775 f843fab1c` (re-run by THIS arm at
run start; the proof re-runs it live) reproduces family 6's
prediction exactly:

- `src/js/villager-objectives.js` — changed in both, ZERO markers:
  all seven family hunks auto-merge. PREDICTED OUTCOME — MEASURABLE:
  the filtered objectives patch applies cleanly to the far end
  with ZERO conflicts, because the hunks are marker-free in the
  full-family merge-tree output. The live `git apply` is the
  authority — if it conflicts, the conflict-STOP rule below fires.
- `docs/ONTOLOGY.md` — 2 marker blocks (6 markers): the
  `### villager-brain` section insert + the
  `### villager-objectives` `**Provides:**` line. EXCLUDED from 6b;
  the filtered patch never touches this file.
- `scripts/green-list.txt` — 1 marker block (3 markers): ours side
  EMPTY; theirs adds 3 lines (`test-villager-brain-dawn.js`,
  `test-dawn-materialize-honesty.js`, `test-dawn-midday-repick.js`).
  The union carve-out covers ONLY the third line (see §Green-list
  union); the first two are family-7 content, never added.
- `src/js/villager-brain.js` — `removed in local` (DU): base blob
  `2f99c9e51…`, theirs blob `737093b44…`, no our line. EXCLUDED
  from 6b; the filtered patch never touches this file.
- `scripts/test-dawn-midday-repick.js` — `added in remote` (clean
  addition, blob `70409952…`).
- Total markers in the full-family merge-tree output: 9
  (3 blocks × 3), all confined to ONTOLOGY.md + green-list.txt.
  No other markers anywhere in the output.

## Green-list.txt readers (verified by grep before the subject cut)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList`
  (line 59) — the only code reader. It is the check runner, not game
  code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt
  at all (`grep -rn "green-list" src/js/` returns nothing). The file
  is a test list with no runtime game effect.
- Only other mentions are comments / test scripts that assert this
  same property (transplant10/10b/11/118, talktranscript, ove48-*).
  The union is safe: adding a test-list line cannot change game
  behavior; the subject's game-code diff is exactly the family's
  objectives hunks.

## Green-list union (the ONLY authorized carve-out; family-2b precedent)

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

## Conflict-STOP rule (binding on this arm)

Build the subject by MECHANICALLY extracting only the
villager-objectives.js hunks from the merge diff (`git diff
f843fab1c^1 f843fab1c -- src/js/villager-objectives.js`, `git apply`
onto the far end) plus the new test file plus the green-list union
above, on scratch branch `transplant-6b-subject` cut at the far end.
On ANY conflict in the objectives patch: STOP, report the exact
conflict list (which paths, which hunks), do NOT hand-resolve game
code, do NOT silently drop a conflicting hunk and proceed (dropping
would redefine the family mid-run), report UNMEASURED with the exact
conflict list. The green-list union is the ONLY carve-out, and it
covers ONLY the one line above. Any conflict anywhere else — or any
second green-list line — fires the STOP.

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190391–190398** (8 seeds), the MATCHED band.
- BAND NOTE (coordinator decision, recorded here): the matched band
  190391–190398 is REUSED BY DESIGN — it is the program's defining
  baseline band where the far end reads 4/8 (reproduced twice:
  masterregress, then 8b with identical per-seed days), NOT claimed
  fresh.
- Freshness search (per local_seed_band_freshness skill), scope:
  `evidence/*/sim-*-prereg.md` (every dated prereg) + every
  forbidden/contaminated band list those files name + `evidence/*/sim-*.md`
  evidence files. Method: word-boundary grep for the exact 6-digit
  seeds `19039[1-8]`.
  - Result: **88 prereg files** reference the band
    (`grep -rl --include='sim-*-prereg.md' -E '19039[1-8]' evidence/
    | wc -l` = 88) — the band is the program's shared baseline,
    named as the same band in every bisect / transplant prereg from
    vetphantom through 8b. Zero forbidden/contaminated list carries
    a 190391–190398 reservation (the band IS the reference band;
    the Oct 26–27 preregs naming "forbidden" carry no 19039x
    reservation).
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
  commit hash recorded in evidence. Measured diff verified
  byte-identical to the family's 6b pieces: the subject diff's
  added/removed lines (modulo hunk-header line numbers, which shift
  with the far end) must equal the family diff's objectives-hunk
  added/removed lines exactly (+63/−8, one file); the test file
  must be byte-identical to the merge's copy (blob `70409952…`);
  the green-list diff must be exactly +1/−0 (the one union line);
  NO `villager-brain.js` content (no `vbrainShouldRefresh` /
  `vbrainMarkPerception` definitions, no ONTOLOGY.md changes);
  subject policy == far-end policy `a7ff5c51…`; subject native
  standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-6b` on the far end `203a32775`,
  via `scripts/culpritbisect-step.sh` (matched band, fix standing
  swapped in). Expect the far end to read healthy (4/8, per-seed
  days 86/144/150/43/150/87/150/150, as reproduced twice).
  Gate: the baseline leg reads ≥3/8 — if it reads ≤2/8, STOP and
  report loudly (the 8c precedent: the baseline would not replicate
  far-end health; no subject step is cut). The settled matched-band
  baseline (4/8) is the anchor, not this run's leg.
- SUBJECT LEG: STEP id `t6b-f843fab1c`, via the same step script.
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
  vs re-picking) and report what the transcripts show.

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

The 6b behavior is proven instead by the dedicated script
`scripts/test-transplant6b-refresh.js`, run BEFORE/AFTER (far end vs
subject, same staging, same seed, `--mode pick` vs `--mode refresh`):

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

`scripts/test-transplant6b.js` (stage 1, before the subject):
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
line; union position named by neighbors), conflict-STOP rule +
verdict mapping (incl. the GATE-STOP branch), base state
(branch-identity legs worktree-aware per the 0215 coordinator note
— they assert the arm branch in the worktree and the merged tip on
master, so the proof stays green on master), seed-band identity
(matched band 190391–190398, REUSED BY DESIGN, 88 prereg files
reference it; STEP ids ep-far-6b / t6b-f843fab1c; subject branch
transplant-6b-subject; step script + analyzer used as-is, matched
band hardcoded). Sections for live subject state and step corpora
are added after the subject is cut and the steps run; on the
conflict-STOP path they become the live conflict record / no-corpus
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
  8b NOT-CARRIER, 8c UNMEASURED, masterregress CULPRIT_MERGE /
  POLICY_EXONERATED_AT_MERGE, and the rest of the bisect record) — it
  measures only the narrowed 6b objectives half.
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
  safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
