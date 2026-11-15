# FAMILY-7 ALIGN STEP — minimal ablation on master-tip substrate (arm sim-alignstep-a)

Run: fleshout-20261115T2115Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-alignstep-a` (worktree `~/workspace/worktrees/sim-alignstep-a`,
base master tip ce0f28a46 — rebased from the registration base d073bd656,
which was one commit behind; the intervening commit is the journey r137
conversation landing, ce0f28a46, which touches only src/js/conversation.js
plus evidence/scripts; the rebase was clean and no arm commit existed yet,
so the arm branch now sits exactly on the master tip at run start).
Binding prereg: evidence/2026-11-15/sim-transplant7brain-prereg.md +
evidence/2026-11-15/sim-transplant7brain.md (the brain-side ablation arm:
UNMEASURED-conflict — 4 of 5 reverse hunks fail on master tip, INCLUDING
the align function itself) + evidence/2026-11-15/sim-transplant7b-prereg.md
+ evidence/2026-11-15/sim-transplant7b.md (narrowed objectives-side half:
NOT-CARRIER) + evidence/2026-11-13/sim-transplant7.md (full family 7:
UNMEASURED on cherry-pick conflict) + evidence/2026-11-15/sim-transplant8c.md
(narrowed-family + baseline-gate-STOP pattern) + the 2026-11-15 2015Z
coordinator decision (family 7 CLOSED by attribution — the collapse regime
was guard-masked, not family-7).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4 (one scoring
pass — "Every dawn decision logs its full consideration breakdown per
villager") and §5 (one arbiter, with commitment — "While a commitment is
still valid ... its candidate's score carries a commitment multiplier ...
A villager's choice does not flip-flop dawn to dawn") read — the family's
area. The family is canon-grounded: it makes the live objective honestly
match the dawn commitment §5 already requires. Nothing here invents canon.
(No doc named OVE-37 exists; OVE-37 is the port branch name for this
dawn-brain work, and the merge message + second parent carry it.)

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-alignstep-a.js, stage 1, green at prereg stage).

## The question

Does the FAMILY-7 ALIGN STEP alone collapse survival? Full family 7
(merge `23245d5d6`, PR #30 dawn honesty, OVE-37 port, OVE-36 Candidate A)
is UNMEASURED and now CLOSED by attribution (2026-11-15 2015Z coordinator
decision — the collapse regime was guard-masked, not family-7); this arm
does NOT re-judge family 7 and does NOT hand-reverse PR #30. The one
piece of family 7 that stays UNMEASURED — no subject leg ever ran — is
the align step itself: the `vbrainAlignObjective` function in
src/js/villager-brain.js, which rewrites the live objective to the dawn
commitment when an aimed override wins. The transplant7brain arm proved
the merge's 48-line align function cannot be reversed onto master tip by
mechanical means (4 of 5 hunks conflict; the tip's align function is 114
lines — Phase 6 inserted a DUTY/ASSIGN branch inside it — and the
conflict-STOP rule fired before any subject existed). This arm defines a
NEW, minimal ablation on current master tip: remove ONLY the call to
`vbrainAlignObjective` in `finishLottery` (villager-objectives.js),
leaving the function itself in place as dead code. This measures ONLY the
align step defined below. Nothing else from the merge, nothing else from
the brain module.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `23245d5d6` (full `23245d5d6d91b4b5284e2f503345dcfd1621ff0c`).
  First parent `7041e1bfb`; second parent `a038cf151` ("Align dawn
  materialize with commit after aimed override"). Second-parent side is
  1 commit. `git diff --stat 23245d5d6^1 23245d5d6`: 6 files, +300/−13.
  `src/js`: 2 files — villager-brain.js 59 changed lines (numstat 56+/3−),
  villager-objectives.js 26 changed lines (numstat 19+/7−). Total src/js
  +75/−10. No scripts/policies file (pol=0). (Re-verified by the proof's
  §1 legs, which re-run the same checks the transplant7brain proof ran.)
- `23245d5d6` IS an ancestor of master tip `ce0f28a46` (verified by this
  arm — the family lives on master today) and is NOT an ancestor of the
  far end `203a32775` (verified by the transplant7brain arm).
- The tip's align function is 114 lines (lines 892–1005) vs the merge's
  44; the merge's align text is NOT a verbatim substring of the tip align
  text (both re-verified live by this arm at run start). 12 commits touch
  villager-brain.js between the merge and master tip (unchanged count).

## Ablation set definition (COORDINATOR-DEFINED via the task brief — do not redefine)

In `src/js/villager-objectives.js`, inside `finishLottery` (lines
680–687 at master tip), remove EXACTLY these 5 lines (681–685):

```
        try {
          if (typeof this.vbrainAlignObjective === 'function') {
            return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;
          }
        } catch (e) {}
```

leaving:

```
      var finishLottery = function (obj) {
        return obj;
      }.bind(this);
```

Expected subject diff: exactly ONE file, `src/js/villager-objectives.js`,
−5/+0. Zero other files. The `vbrainAlignObjective` function itself
stays in place in villager-brain.js as dead code — including the Phase 6
DUTY/ASSIGN branch inside it, untouched — and the OVE-36 comment above
`finishLottery` (lines 678–679) stays. The proof verifies the subject
diff byte-equals this defined set: one file, the exact 5 removed lines,
no added lines, no other file touched.

Why this isolates the align step and nothing else:

- `finishLottery` is the ONLY game-code caller of `vbrainAlignObjective`
  (verified by this arm: grep over src/js finds the call only at
  villager-objectives.js:682–683; the other hits are the definition and
  comments in villager-brain.js, plus a comment at
  villager-objectives.js:405). All six `objPick` returns go through
  `finishLottery(o)` (lines 714, 721, 724, 735, 756, 763), so removing
  the call inside it removes the align step from every dawn
  materialization, with no other path left.
- 7b already established the no-align behavior: on far-end substrate,
  where the align function does not exist, the typeof guard in
  `finishLottery` returns the objective unchanged. Removing the call
  produces exactly that behavior on master-tip substrate — the live
  objective keeps the CORE lottery kind instead of being rewritten to
  the dawn commitment — while leaving the Phase 6 DUTY/ASSIGN code
  inside the function untouched. So the ablation isolates the align
  step's effect and nothing else.
- The test file `scripts/test-dawn-materialize-honesty.js` references
  `vbrainAlignObjective` (its setup gate + its stripped-align control);
  the function stays in place, so the test should still run whole —
  record its outcome as a diagnostic, it is not a judged leg.
  `scripts/test-villager-brain-dawn.js` references the function once;
  it is NOT in the ablation set and stays as-is.

## Mechanism analysis (pre-registered, from source reads at master tip — not a verdict)

What the ablation CAN do on master-tip substrate:

- (a) With the call gone, `finishLottery` returns the objective
  unchanged, exactly as on far-end substrate in 7b. The live objective
  then keeps the CORE lottery kind instead of being rewritten to the
  dawn commitment: aimed overrides (EXPEDITION hash, win-plan holds,
  DUTY top-score, ASSIGN standing) are recorded on the commitment + log
  but no longer materialize in the villager's actual errand. The
  villager's day is decided by the core lottery, not the dawn pick —
  the exact behavior the merge changed.
- (b) The brain module itself stays loaded (`vbrainOwnsDawn()` true,
  `vbrainScorePick` present, the align function present but uncalled) —
  only the align step is removed. Agency still honors the commitment
  at `vbrainExecuteDepart`; only the objective materialization is
  ablated. The ablation is therefore narrow: it isolates the align step
  from the rest of the brain, including the Phase 6 DUTY/ASSIGN handling
  that later commits added INSIDE the align function.
- Consequence, stated up front: if the subject leg collapses survival
  toward the merge's 1/8 from a collapsed master-tip baseline, the align
  step is a carrier; if survival is unchanged, it is not — on THIS
  substrate, where the brain module exists. The verdict is about the
  align step, not about the whole family (the objectives-side half was
  already judged NOT-CARRIER by 7b, and family 7 itself is closed by
  attribution).

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190391–190398** (8 seeds), the matched band — the transplant
  program's defining baseline band where the far end reads 4/8
  (reproduced three times: masterregress, 8b, 7b, with identical
  per-seed days 86/144/150/43/150/87/150/150).
- BAND NOTE (coordinator decision, recorded here): the matched band
  190391–190398 is REUSED BY DESIGN — it is the program's defining
  baseline band, NOT claimed fresh.
- Freshness search (per local_seed_band_freshness skill), scope: word
  grep for `190391` across the whole `evidence/` tree (every dated
  prereg + evidence file + per-seed corpora) AND the prereg-only count.
  Result: the band appears in **548 files** under `evidence/` (238 of
  them `*.md` files) and in **98** `sim-*-prereg.md` files (12 of them
  dated 2026-11-15) — it is the program's shared baseline band, heavily
  reused, NOT fresh. No forbidden/contaminated band list exists carrying
  a 190391–190398 reservation. Reuse rationale: the align-step question
  is defined AGAINST the far end's settled 4/8 on exactly this band; a
  fresh band would break comparability with every prior transplant
  verdict (and the 8c precedent shows a fresh band can fail the baseline
  gate for band-health reasons unrelated to the family). The reuse is
  explicit, recorded, and coordinator-directed — not silent.

## Measurement plan

- BASELINE LEG FIRST: STEP `ep-tip-alignstep` on master tip
  `ce0f28a46`, via `scripts/culpritbisect-step.sh` (matched band, REPO
  passed in, fix standing swapped in). Corpus directory names distinct
  from the sibling arms': `perseed-culpritbisect-a-ep-tip-alignstep`,
  summary `culpritbisect-a-ep-tip-alignstep-summary.json`.
  Gate (pre-registered, binding — inherited from the transplant7brain
  prereg): the carrier question is live on this substrate ONLY if the
  master-tip baseline reads ≤2/8 survived (the collapsed regime — the
  full merge read 1/8 vs the far end's 4/8). If the baseline reads ≥3/8,
  the collapse regime is gone on current master: STOP, report
  UNMEASURED-substrate (question moot here, do NOT re-judge family 7,
  do NOT cut a subject leg). Master tip is many merges past the merge,
  so the baseline could read anything — that is why the gate comes first.
  Gate polarity NOTE (from transplant7brain's metric review): this gate
  has the OPPOSITE polarity from 7b's (here ≤2/8 PROCEED / ≥3/8 STOP,
  because the question is live only in the collapsed regime; there
  ≥3/8 PROCEED, because the far end was the healthy baseline). The
  proof's gateStopVerdict legs pin this arm's polarity in code.
- SUBJECT LEG (only if the gate passes): subject branch
  `alignstep-subject`, branched from master tip `ce0f28a46`, carrying
  exactly the 5-line removal above and nothing else; subject commit
  hash recorded in evidence. Measured diff verified byte-identical to
  the defined set (one file, −5/+0, the exact 5 removed lines, no added
  lines). STEP id `talignstep`, via the same step script. Seeds
  190391–190398, 150d death-aware, competent verbatim own-policy, fix
  standing swapped in every step, native restored byte-identical
  afterwards, sha-verified.
- Primary metric: survived/8 on the subject leg MINUS the baseline leg.
  Subject − baseline ≥ +2 survivors = CARRIER (the align step collapses
  survival); within ±1 = NOT-CARRIER; subject worse by ≥2 = INVERTED
  (report it, do not re-judge). Secondary (diagnostic only): wave-5
  unlocks, median days, death-cause shares, standing distribution. No
  cost guard — measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — if scripts/telemetry-check.js
  REFUSES your corpus, record the refusal; never roll the baseline.
- Sense-testing: read vetSays narration from both corpora and judge
  meaning/coherence — census the lines, quote what villagers actually
  do/say, flag anything robotic or repeated.

## Family-test leg (honesty test — pre-registered; DIAGNOSTIC ONLY)

The honesty test `scripts/test-dawn-materialize-honesty.js` on master-tip
substrate: its setup gate requires `Game.vbrainScorePick` /
`Game.vbrainAlignObjective` / `Game.vbrainOwnsDawn()` — all present at
master tip, so expect it to run whole (exit 0 or 1, NOT the exit-2 setup
skip the 7b arm recorded on far-end substrate). Run it against the
worktree (master tip) as a DIAGNOSTIC after the prereg commit — it proves
the test runs whole on the substrate the ablation uses, and records what
actually happens; a skip here would be a finding, not a shrug. It is NOT
a judged leg (no subject leg is judged by it), and its result does not
touch any verdict. The transplant7brain arm recorded the same diagnostic
on master tip 7251dcb4f (exit 0, pass:true, materialize==commit,
controlMismatch true); this arm re-runs it on the new tip ce0f28a46.

## Proof

`scripts/test-alignstep-a.js` (stage 1, before the subject):
family identity (merge 23245d5d6, parents, 1-commit second-parent side,
exact 2 src/js files +75/−10, no policy file, honesty test present at
the merge, merge IS an ancestor of master tip ce0f28a46, NOT an ancestor
of the far end), ablation-set definition (the exact 5 removed lines at
villager-objectives.js:681–685; `finishLottery` is the only game-code
caller; all six objPick returns go through it; the align function stays
in place at the tip, 114 lines, Phase 6 DUTY/ASSIGN branch present, merge
align text NOT a substring of the tip align text; the test files
reference the function but are NOT in the ablation set), baseline-gate
verdict mapping, subject-vs-baseline verdict mapping, base state
(branch-identity legs worktree-aware — they assert the arm branch in
the worktree and the master tip on master, so the proof stays green on
master), seed-band identity (matched band 190391–190398, step ids
ep-tip-alignstep / talignstep, subject branch alignstep-subject,
reuse-by-design recorded with the live counts 548 files / 98 preregs).
§7 (live subject state) takes the pre-subject branch at stage 1 (no
subject branch exists yet — expected) and the subject-exists branch
after the gate passes (diff byte-equals the defined set); §8 (step
corpora) takes the no-corpus branch at stage 1 and the measured-legs
branch after the legs run.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check.
The honesty test is run as a diagnostic on the worktree after the prereg
commit (see §Family-test leg); its outcome is recorded in the evidence
file, not in the proof.

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md §4/§5 (the family's
area). No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game, no before/after
pair to compare on one base. The before/after comparison IS the
boundary pair (master tip vs subject) on identical seeds, judged by the
analyzer's decision rule. Same standing as masterregress §7,
survivalcontrol-b §7, anchor-a §7, and the r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If the baseline gate STOPs (≥3/8), NO subject branch is cut, NO
  subject leg runs. The verdict is UNMEASURED-substrate, not a carrier
  verdict, and family 7 stays CLOSED by attribution (not re-judged).
- This arm does NOT re-judge any prior verdict (family 7 CLOSED by
  attribution, 7b NOT-CARRIER, 8b NOT-CARRIER, 8c UNMEASURED-on-gate,
  masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the
  rest of the bisect record) — it measures only the align step defined
  above.
- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict stands
  only if the errors cannot touch the survival read (the survival read
  comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified) before the next
  step or any evidence commit. If a restore fails, FAIL LOUDLY and do not
  commit evidence. After each leg, check the arm branch back out (the step
  script leaves HEAD detached at the step commit).
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs. (The honesty-test
  diagnostic runs in the worktree itself — no extract needed.)
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `alignstep-subject`, left in place);
  no `[needs-eyes]` applies. The arm branch commits only: prereg, proof
  script, evidence file. No step corpora exist until the legs run.
- Telemetry deviation check (Loop A body step 10): recorder-corpus
  class — if the check REFUSES the corpus, record the refusal, never
  roll the baseline.
- Flap note: if a host write flap hits this run, STOP writing and probe
  once a minute until it clears; never route around a denial (per the
  transplant7brain precedent: three flap windows hit that run's morning,
  the longest ~56 min).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the run: did the metric set hold, or does a metric
  need revision for the NEXT run?)
