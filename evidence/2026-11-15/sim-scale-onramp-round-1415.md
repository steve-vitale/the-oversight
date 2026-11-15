# Scale-onramp round 1415 — stale-lock recovery + adoption (7redef UNMEASURED-substrate, 8fam UNMEASURED-sniff, both landed)

Run: fleshout-20261115T1415Z (Loop A), axis scale-onramp (survival
collapse). STALE-LOCK RECOVERY + ADOPTION of the dead 1215Z run.

## Recovery (run start)

- Lock fleshout-20261115T1215Z was 121min old at 14:24Z; both
  workers' heartbeats 58–65min stale (transplant7redef-a 13:13:00Z,
  transplant8fam-a 13:20:37Z); no live processes. The dead claim was
  retired to .DEAD with a note; the lock was replaced by this run's.
  Loop B live on winnability chain throughout (claim
  fleshout-loop-b-20261115T1330Z, arms sim-gorgeprice2-b +
  sim-courtship-b) — NOT touched. Loop B landed mid-run
  (740838f3c gorgeprice2-b CONFIRM GO); both arm branches rebased
  onto the fresh tip before merging.
- CORRECTION (coordinator misread, owned here): the run-start
  assessment said the dead run left "nothing" for 8fam. WRONG. The
  dead run's 8fam branch held a committed prereg + proof
  (fbae7cf31, corrected 4b95529b9), a cut subject
  (transplant-8fam-subject b6ec3c7d1), and a partial baseline leg
  killed by a write flap (2 seeds written, 6 zero-byte .tmp-6927
  files). The misread came from checking the worktree's DETACHED
  HEAD (far end 203a32775) instead of the branch. The 8fam worker
  caught it, adopted the subject, superseded the prereg on band +
  sniff only, and documented the recovered leg in its evidence.
  Lesson: on adoption, read the BRANCH (`git log master.. <branch>`)
  before declaring an arm empty — a detached worktree HEAD is not
  the branch state.

## Arm 1 — sim-transplant7redef-a (ADOPTION + FINISH, UNMEASURED-substrate, landed)

Adopted at stage 1 (prereg + proof committed c89ad7984 by the dead
worker; no judged legs, no subject). Finished by a worker in the
adopted tree per the binding prereg
(evidence/2026-11-15/sim-transplant7redef-prereg.md).
- Base + rebase: diff 1ca2c257d..b0b171cc8 touches no src/js and no
  scripts/policies/ (equivalence rule passes). Clean rebase to
  c2e67ed00; proof re-run 108/108 green.
- Sniff (seeds 190581–190584): 150d / 76d / 149d / 99d; none dead
  before day 30 → PROCEED-TO-BASELINE. Sniff seeds re-ran
  identically inside the baseline leg (deterministic).
- Baseline leg ep-tip-7redef (seeds 190581–190588, 150d,
  competent verbatim, fix standing swapped in, native restored
  byte-identical sha f9359976…): survived **3/8** — 190581 (150d,
  wave 5, standing 640), 190585 (150d, wave 5, 300), 190586 (150d,
  wave 4, 199); lost 190582 d76, 190583 d149, 190584 d99, 190587
  d144, 190588 d102. Instrument errors 0.
- Gate: 3/8 ≥ the pre-registered STOP threshold (≥3/8) → **STOP,
  UNMEASURED-substrate**. The collapse regime is gone on this band
  on current master (3/8 vs the merge's 1/8), so family 7's align
  step cannot be judged here. **No subject cut, no subject leg**
  (verified: transplant-7redef-subject does not exist).
- Family tests (baseline only): honesty test exit 0, pass:true,
  byte-identical to the prereg's expected output; all 4 pinned
  align cases fire align-ACTIVE. The align step is live on this
  substrate; it is the collapsed regime, not the instrument, that
  is missing.
- Wall: national 0/8, table 0/8, wins 0/8, wave-5 3/8, wave-4
  8/8, median 149d, deaths 730 (villager combat 259, expedition
  197, combat 144, the wild 66, starvation 7/730 — villages die
  fighting, not hungry). Rank REGIONAL_INTACT (8/8 regional).
- Sense-testing: 216 vetSays lines, 209 distinct — event-driven,
  named, coherent (door fights with real outcomes, named
  veteran-kill call-outs, ARC IV landing, the "FINALES need a
  NATION" gate voiced). One flag appended to the findings backlog:
  a door-fight line renders "Aria, the person in their 60s" — a
  name-fallback leaking into narration.
- Final proof on the branch: 110 passed, 2 failed — BOTH
  adjudicated, not edited: (1) §9 anchorCommit leg names base
  1ca2c257d, stale by design post-rebase; (2) §9 models
  baseline-only as always-intermediate, but a gate STOP terminally
  ends the run; the proof's own gate-STOP assertions pass. The
  verdict follows from the gate classifier, which reads
  STOP-UNMEASURED correctly.
- Merged ff-only as a9d85e32c (tip; branch commits c2e67ed00,
  ec285413e, a9d85e32c). Tree released, branch deleted.
  Evidence: evidence/2026-11-15/sim-transplant7redef.md (+ prereg).

## Arm 2 — sim-transplant8fam-a (ADOPTION + FINISH, UNMEASURED-sniff, landed)

Adopted with the dead run's prereg + proof + subject (see Recovery
correction above). Finished by a worker in the adopted tree; its
prereg supersedes the 1215Z prereg on band + sniff only (fresh band
190589–190596 + sniff pre-check, per this run's brief, which
forbids the matched band); family, subject, verdict mapping, and
mechanism adopted unchanged.
- Family definition (brief error, resolved by the worker, endorsed
  here): this run's brief was internally inconsistent — its title
  said "the four CONFLICTED PR #22 hunks" (matching the tracker
  blank) while its step-2 parenthetical described the three clean
  hunks from 8b PLUS the excluded dlg:more hunk (the four CLEAN
  hunks, 8b ∪ 8c — a different, already-measured-each family, for
  which "theirs-resolved" is meaningless). The worker followed the
  title + tracker blank + merge + existing subject: the four
  CONFLICTED hunks, theirs-resolved. Correct. The four: (1)
  conversation.js lesson-outcome/diegetic-act (plantTeachOutcome);
  (2) convo-dialogue.js favor settlement (liveUnfinished); (3)
  convo-dialogue.js favor-line sayLine (helpStructural); (4)
  convo-dialogue.js blocked-repeat (UNFINISHED HELP BLOCKED).
  Subject transplant-8fam-subject b6ec3c7d1, verified hunk-by-hunk,
  NOT re-cut, left in place.
- Sniff leg ep-far-8fam-sniff (far end 203a32775, seeds
  190589–190592, 150d, fix standing f8fda4295a99 verified swapped
  in, policy a7ff5c51): survived **0/4** — 190589 d140, 190590 d65,
  190591 d150 already-lost, 190592 d121. Instrument errors 0.
  Tripwire fired → **STOP, UNMEASURED (sniff band-health)**. No
  baseline leg, no subject leg. The survival question is
  unmeasured on this band; the 0/4 is a real read, not an artifact.
- Family-test (separate from the survival verdict): conflicted
  script test-transplant8fam-conflicted.js — subject exit 0, all 4
  cases pass; far-end control exit 1. Dialog-audit #4 proof on the
  subject: exit 1 with 3 pre-registered failures; the Ruth
  plant-lesson resume shape ran coherent and non-dry. **The hunks
  are LIVE at the dialogue level — the survival question is
  unmeasured because the band failed, not the hunks.**
- Wall: wins 0, national 0, table 0, wave-5 1/4, wave-4 4/4,
  median 140d, deaths 377 (villager combat 140, combat 102,
  expedition 79). All four stall at regional. This band is harsher
  than 8c's fresh band (1/8 over eight seeds); the matched band's
  first four read 1/4.
- Sense-testing: 247 vetSays lines censused; 0 train-of-thought /
  Still-on / already-handled / dry-fallback / secret: / teach /
  help / favor. The 4 "unfinished" hits are all the same scripted
  System ARC IV beat. Family dialogue surface unexercised in the
  survival sim, same as 8b/8c.
- Recovered 1215Z leg (recorded, NOT adopted): matched band
  190391–190398, ran 13:21–13:57Z, died in a write flap — seeds
  190391/190392 wrote full JSONs, 190393–190398 left 0-byte
  .tmp-6927 files. The driver log records all 8 sims completing
  in-process, errors 0, days 86/144/150/43/150/87/150/150 —
  EXACTLY the settled far-end baseline (4/8). Corroborates the
  settled baseline a fourth time. The flap-damaged files were left
  untracked and went with the worktree; the leg is fully recorded
  in the arm evidence.
- Proofs re-run green AFTER the rebase onto master tip 740838f3c:
  test-transplant8fam.js 151/151, test-culpritbisect-a.js 116/116.
- Merged ff-only as d20ef2bf8 (tip; branch commits f85ea62dd,
  e0ab38f60, 8b94b9651, d20ef2bf8 after rebase). Tree released, arm
  branch deleted; subject branch transplant-8fam-subject KEPT in
  place. Evidence: evidence/2026-11-15/sim-transplant8fam.md
  (+ prereg).

## Wall (this run's judged corpora, 12 configs)

national 0/12, table 0/12, wins 0/12, wave-5 4/12, wave-4 12/12,
median ~149d. Telemetry deviation check: REFUSED on both arms
(recorder-corpus class) — baseline NOT rolled, no LOUD lines.

## Coordinator decisions

1. Family 7 brain-side: UNMEASURED stands (fresh-band route
   closed by the gate STOP). Next route is a coordinator call for
   the next run, not decided here: a 7redef rerun on the MATCHED
   band 190391–190398 (where the merge reads collapsed 1/8) would
   put the question back in the live regime — it needs its own
   prereg band correction, not a silent band swap.
2. Family 8 conflicted-four: UNMEASURED stands (fresh-band route
   closed by the sniff STOP). The matched-band design is the one
   that measures this family: far end healthy 4/8 on 190391–
   190398, subject b6ec3c7d1 already in place. Next run's call: a
   matched-band rerun with a fresh prereg (the 1215Z prereg's
   matched-band design, superseded on band only by this run's
   fresh-band prereg, is the template).
3. Brief-parenthetical error (arm 2): the step-2 parenthetical
   describing the family as 8b ∪ 8c was wrong; the conflicted-four
   reading stands. Future briefs: when a title and a step disagree,
   the tracker blank + merge govern, and the worker's flagging it
   is the correct behavior.
4. Adoption-read rule (see Recovery): read the branch before
   declaring an arm empty.

## Infrastructure

- SAFE-COMMIT CLOBBER: struck 2× on the 7redef arm and 2× on the
  8fam arm — all repaired with the documented `ls-tree -r HEAD |
  git update-index --add --index-info` pipe; every commit verified
  correct (worktree hash == HEAD blob) before continuing. The
  7redef arm also hit the known safe-commit directory limitation
  (per-seed dirs failed to add; committed as explicit file lists).
- STEP-SCRIPT BUG (7redef): transplant7redef-step.sh deletes
  tracked tooling scratch after the analyzer writes, failing its
  own clean-tree check (×2). Sims/summaries completed fine;
  recovered with `git checkout --` + branch checkout. Fix owed in
  the script (restore scratch from the step commit instead of
  deleting tracked files); logged as a finding. Also: the analyzer
  requires exactly 8 seeds, so the sniff can never produce a
  summary — verdict read from per-seed files instead (finding).
- WRITE FLAP: no flap window struck either worker's sims or
  commits. Two transient `.git/worktrees/.../index.lock` EPERM
  failures hit the coordinator's run-start `git status` on the
  8fam tree (~14:20Z), self-cleared, no work lost; the 8fam
  worker's later probe lines were an EEXIST artifact, not a flap.
  Recorded as observed, not counted as a flap window.
- REBASES: both clean, no stop-at-pick quirk this run. The 7redef
  branch rebased once (onto b0b171cc8); the 8fam branch rebased
  once (onto 740838f3c after Loop B's gorgeprice2 landing).
  Proofs re-ran green after every rebase and on merged master
  (7redef 110/2 adjudicated, 8fam 151/151 + 116/116).
- REAPER: pre-flight reap deferred past run start (adoption
  investigation + live Loop B trees) and run as the final sweep:
  13/16 active, nothing removed; 7 LOUD uncommitted-changes trees
  (sim-redactor-a, sim-saycap-a, sim-siegedialog-a, sim-inffight-ab,
  journey2-endgame, sim-gorgeprice2-b, sim-courtship-b) belong to
  other runs — NOT touched, owners must commit or release.
- check.js --quick NOT re-run (zero src/js on either landed
  branch; loop precedent). Both arms' proofs re-ran green on the
  rebased trees that were merged ff-only.

scale-onramp stays converging (NOT converged): the objectives halves
of families 6 and 7 are measured (6b NOT-CARRIER, 7b NOT-CARRIER),
family 7's brain side is UNMEASURED on the fresh band, family 8's
conflicted four are UNMEASURED on the fresh band, and wins remain 0
on every judged corpus. food-economy stays converging (untouched;
parked). winnability chain stays converging (untouched; sibling
Loop B). Next blanks, in order: (1) family 8 matched-band rerun
(subject in place); (1b) family 7 redefined ablation on the matched
band (coordinator call + prereg band correction); (2) family 2b
AMBIGUOUS stays on the suspect list; (3) headcount-ceiling
(Steve-call); (4) Reunion mirror pack in the wild (Steve design
call). Claim deleted; lock deleted.
Evidence: evidence/2026-11-15/sim-scale-onramp-round-1415.md (this
file).
