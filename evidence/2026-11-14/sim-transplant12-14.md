# sim-transplant12-14 — families 12+14 COMBINED (Loop A, fleshout-20261114T0740Z)

Run: fleshout-20261114T0740Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant12-14-a, branch `sim-transplant12-14-a`,
worktree `~/workspace/worktrees/sim-transplant12-14-a`.
Prereg: evidence/2026-11-14/sim-transplant12-14-prereg.md (committed
2cc3edbe2, BEFORE cutting the subject or running any judged sim).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics).

## Verdict

- VERDICT: NOT-CARRIER
- Survived: 4/8 (pair reads GOOD). Per-seed days 86/144/150/43/150/87/
  150/150 — IDENTICAL to the far-end baseline seed-for-seed, not just
  in count. Wave-5: 2/8. Median: 150d. Deaths: 629. Rank:
  REGIONAL_INTACT (regional 7/8). National 0, table 0, wins 0.
- The 12+14 pair, landed together on the far end, does not collapse
  it: the far end stays 4/8 with every seed's trajectory length
  unchanged. The dialogue guards change what resume openers quote
  and nothing else — no survival lever moved. The pair is cleared;
  the collapse lives elsewhere. No split arm is needed (a CARRIER
  read would have split 14-alone vs 12-on-14; the parallel 14-alone
  arm's verdict is its own).
- STEP: t12-14-combined. Subject branch `transplant-12-14-subject`
  tip c8655548f4be892c7722f2bbb46910c3c7262d5c (LEFT in place, 2 picks:
  ec6b03f42 family 14, c8655548f family 12). Subject tip tree
  e78fac42d89e811f6bfce981b7274e5ee3c5c014 — exactly the predicted
  pick-2 tree. Pick-1 tree bc52919e73e6449e93ab2b64497eb25138d9ee90 —
  exactly the predicted pick-1 tree.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant12-14-prereg.md. Authority:
the 0615Z closeout + sim-findings line 2329 (family 12 rides on
family 14's origin-only guard; do not re-attempt 12 alone). Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified). Seeds 190391–190398,
150d death-aware, competent verbatim own-policy per step.
Thresholds for the PAIR as one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS →
re-run once with a fresh STEP id; ≥3/8 NOT-CARRIER.

## Family identity (verified at run start, before any sim)

- Family 14: merge 7688cb7a4 "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard". First parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f. Second-parent side is 1
  commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files,
  +33: src/js/conversation.js +12, scripts/test-snippet-stage-direction.js
  +21 (new test).
- Family 12: merge ac119e4ed "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726". First parent
  aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0. Second-parent side is 1
  commit: 3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject residual
  silence/meta resume memory quotes". Diff: 2 files, +73/-5 by
  numstat: src/js/conversation.js +18/-3,
  scripts/test-snippet-stage-direction.js +55/-2 (edited test).
  (Brief-shorthand correction: the brief wrote conversation.js
  "+21/-5" and the test "+57/-5" — those are git --stat TOTAL
  changed-line counts, not insertions/deletions; numstat is +18/-3
  and +55/-2, totalling +73/-5.)
- Guard origin-only counts (verified): convoSnippetIsStageDirection
  0 hits at far end 203a32775, 0 at merge-base d229b58f5, 0 at 14's
  first parent 16cdd69006, 3 at 12's first parent aa5d9ef92. Test
  file absent at the far end, present at both first parents.
- No policy file, no standing.js, no data, no docs in either
  family diff.

## Merge-tree pre-check (run before cutting the subject)

Cherry-pick predictions use each merge's FIRST PARENT as the base
(the base `git cherry-pick -m 1` itself uses), with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (14 onto the far end): rc=0, clean tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90, zero conflicted files,
  zero markers. CLEAN. Live-confirmed on a throwaway scaffold
  branch (tmp-14-predict, deleted afterwards): cherry-pick rc=0,
  commit e45649c68, 2 files +33.
- PICK 2 (12 onto the 14-applied tree): rc=0, clean tree
  e78fac42d89e811f6bfce981b7274e5ee3c5c014, zero conflicted files,
  zero markers. CLEAN. The 14-applied tree was built two
  independent ways with the same result: the live scaffold pick
  (tree bc52919e…) and a temp-index rebuild (read-tree far end +
  apply the 14 diff + write-tree → bc52919e… again). The predicted
  pick-2 tree carries the guard (2 hits) and the residual markers
  (2 in conversation.js, 3 in the test file).
- BRIEF-BASE NOTE (method correction, recorded not hidden): the
  task brief's literal first command uses merge-base d229b58f5 as
  the base. That run reports rc=1 with conflicts ONLY in
  scripts/balance-proof.json and scripts/green-list.txt — because
  d229b58f5 predates the whole origin line, so base→theirs carries
  ALL origin-line drift in those files (both change on
  d229b58f5..7688cb7a4), while base→ours carries the local line's
  own edits. Neither file is in family 14's own diff
  (16cdd69006..7688cb7a4 = exactly the 2 files above), so those
  conflicts are cumulative-line drift, not a family-14 conflict —
  a cherry-pick -m 1 never sees them (its base is the first
  parent). The binding prediction is the first-parent one (CLEAN);
  the live picks are ground truth, and both were clean.
- Prediction: BOTH PICKS CLEAN. Live picks reproduced the
  prediction exactly (trees match, §Live picks).

## Live picks (no conflict — STOP clause did not fire)

- Subject branch `transplant-12-14-subject` cut at the far end
  203a32775; `git cherry-pick -m 1 7688cb7a4` rc=0
  ("Auto-merging src/js/conversation.js", commit ec6b03f42, 2
  files +33, tree bc52919e… — the predicted pick-1 tree).
- `git cherry-pick -m 1 ac119e4ed` rc=0 ("Auto-merging
  src/js/conversation.js", commit c8655548f, 2 files +73/-5, tree
  e78fac42… — the predicted pick-2 tree).
- Subject diff vs far end: exactly 2 files, conversation.js
  +27/-0, test file +74/-0 (net: 12+18-3=27; 21+55-2=74 — the -3/-2
  are internal to the family diffs since the far end lacks both the
  guard and the test file). No other file differs.
- No subject commit was made to the arm branch; the subject branch
  is LEFT in place at c8655548f for reproducibility.

## Step result (t12-14-combined)

Driver: scripts/culpritbisect-step.sh (from a /tmp copy with REPO
passed in) + scripts/culpritbisect-driver-20261113.js + analyzer.
Standing fix swapped in (f8fda4295a99, ROSTER CHECK present,
own-policy a7ff5c516440); native standing.js restored
byte-identical afterwards (75762cb2…); tooling scratch deleted;
tracked tree clean. Corpus:
evidence/2026-11-13/perseed-culpritbisect-a-t12-14-combined/
(8 per-seed JSONs); summary
evidence/2026-11-13/culpritbisect-a-t12-14-combined-summary.json;
driver log
evidence/2026-11-13/culpritbisect-a-t12-14-combined-driver.log.
Instrument errors: 0.

| seed | days | end | rank | wave | standing | deaths |
|------|------|-----|------|------|----------|--------|
| 190391 | 86 | village-lost | regional | 4 | 199 | 88 |
| 190392 | 144 | village-lost | regional | 4 | 199 | 77 |
| 190393 | 150 | survived | regional | 5 | 325 | 66 |
| 190394 | 43 | village-lost | village | 4 | 150 | 52 |
| 190395 | 150 | survived | regional | 4 | 199 | 96 |
| 190396 | 87 | village-lost | regional | 4 | 199 | 80 |
| 190397 | 150 | survived | regional | 5 | 275 | 74 |
| 190398 | 150 | survived | regional | 4 | 199 | 96 |

Analyzer: GOOD (survived 4/8, rank REGIONAL_INTACT, median 150d,
errors 0). Wall: wins 0, national 0, table 0, wave-5 2/8, wave-4
8/8, median 150d, deaths 629, standing 150–325, blooded 4.
Per-seed days are IDENTICAL to the far-end baseline
(86/144/150/43/150/87/150/150) on all 8 seeds — the pair moves
nothing, not even a day.

Death causes (629): villager combat 267, combat 130, expedition
126, the wild 74, monster 13, starvation 1, wound-fever 3, the
rest single digits. Combat-heavy, same profile as the far end.

Wall numbers carried in (collapse band): far end 4/8, wave-5 2/8;
merge 1/8, wave-5 0/8; national 0, table 0, wins 0.

## Infrastructure — flap + runtime restart (both recorded, neither hidden)

- HOST WRITE FLAP: a flap window ran ~08:07–09:00Z (53 min),
  first seen when the heartbeat write failed with EPERM and the
  flap-watch log went FLAP? (atomic + git-ref + fsync/rename +
  O_EXCL writes refused; plain small writes passed early, then
  failed too as the window deepened). The step script could not be
  staged and the step could not run during the window — the run
  WAITED (no bypass, no work lost). Heartbeat retries failed
  through the window (last good heartbeat 08:04:41Z, then nothing
  until 08:58:43Z when a retry landed as the window cleared).
  Reaper risk: none — the reaper's staleness line is 4h; the
  heartbeat was ~54 min stale at worst. Prereg + proof were
  committed BEFORE the window (2cc3edbe2); the subject was cut and
  both picks verified BEFORE the window. The window cost ~50 min
  of waiting, nothing else.
- RUNTIME RESTART: the first step attempt (started 09:01Z, after
  the flap cleared) was killed by a runtime/VM restart at 4/8
  seeds (190391–190394 complete, days 86/144/150/43 — already
  matching the far end; 190395 never started). State on recovery:
  HEAD detached at the subject tip, fix standing.js still swapped
  in, tooling scratch present, no summary. Recovered per the step
  script's own discipline: native standing.js restored
  byte-identical (75762cb2… verified), scratch deleted, the
  PARTIAL corpus + driver log DISCARDED (no verdict had been
  produced), tracked tree verified clean, step re-run from scratch
  under the SAME STEP id t12-14-combined (the /tmp step script was
  gone with the replaced VM and was re-staged from the arm
  branch). The judged corpus is the complete 8-seed re-run only;
  the discarded partial 4 seeds are not in evidence. The re-run
  reproduced the partial run's four days exactly (86/144/150/43),
  so the restart cost time, not signal.

## Sense-testing (SENSE-TESTING LAW)

Read the step corpus transcripts (vetSays, 225 lines across the 8
seeds) and the activity telemetry. In plain words:

- The villages still act like people. Villagers learn skills
  (653 skill events), teach lessons (238), propose bonds (346),
  discover monster counters (261), take loot (555), use abilities
  (493) — teaching, bonding, and counter-learning all fire, not
  just fighting and eating. The System/audience voice names names
  ("Javier just put down The Redactor... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name.") and the ambient
  vignettes follow the same generated people doing the same jobs
  across days (the woman with the burn-scarred forearm hauling
  water, +4 clean) — a recurring person with a recurring routine,
  not a reset extra.
- What the villages looked like: four survived, four died. The
  strongest, 190397, reached wave 5, banked 2 wave-4 veterans, and
  stands tribute-ready at standing 275 with 5 people alive and
  5,798 kcal in the pantry. 190393 also reached wave 5 (standing
  325, 8/8 alive, 8,200 kcal). The other two survivors (190395,
  190398) lived hand-to-mouth — 6 and 3 people alive, pantry 0 at
  day 150. The dead villages died fighting, not hungry: 190394
  fell on day 43 still at village rank; starvation killed 1
  villager across all 8 seeds. Nobody reached national, the table,
  or a win — the scale wall stands untouched by this pair, which
  is the expected shape for a dialogue-only change.
- MECHANISM CHECK: the guards fire — `node
  scripts/test-snippet-stage-direction.js` PASSES on the subject's
  exact tree (extracted to /tmp from c8655548f): warm silence
  ("You say nothing…"), recap scaffolding ("Still on X", "Say it
  plain. Still on X"), teach diegesis ("You show them Cacao…"),
  wind-down filler ("Anyway. A small smile."), and party-join
  assent ("...Fine. This had better be worth it.") are all
  rejected as resume memory quotes; the thread label is kept and
  the quote dropped; real spoken content ("The water haul went
  wrong after the storm.") still counts. In the SIM corpus itself,
  guard firings are NOT observable: the recorder corpus carries no
  conversation/resume-opener rows (sayCount 5,502–15,529
  utterances per seed are counted, not stored as text) — same
  telemetry-gap class as the bond finding in sim-findings (the
  corpus records no trust/bond event rows either). The verdict
  rests on survived/8, which is complete; the mechanism question
  (how often the guards fire in live play) stays open and needs a
  recorder that logs resume-opener decisions.
- Nothing robotic, static, or repeated beyond the System's own
  templated audience lines (by design — the System repeats its
  catchphrases across seeds with different names attached).

## Reachability

Waves 1–5: wave 4 reached 8/8, wave 5 unlocked 2/8 (190393,
190397). Regional reached 7/8. National 0/8, table 0/8, wins 0/8 —
same as the far end; the pair neither opens nor closes any reach.
The content in this arm's area (resume openers quoting real
speech) is reachable in live conversation and now quotes only real
speech on the subject tree (unit-proven above).

## Metric review

- No metric proved wrong. The primary (survived/8, pair thresholds
  fresh per 2115 §3) judged cleanly: 4/8 is NOT-CARRIER with no
  re-run needed (not a 2/8 ambiguous read).
- The per-seed-day identity (all 8 days equal to the far end) is a
  stronger signal than the count alone and is worth carrying as a
  secondary in future transplant arms: when a family moves nothing,
  the days match exactly; a family that moves survival should move
  at least one seed's days.
- The merge-tree pre-check needs the first-parent base, not the
  brief's merge-base: the brief's literal command mis-predicts
  tooling conflicts from cumulative origin-line drift. Future
  briefs should name the first-parent base (as the transplant12
  arm did). The proof now carries both predictions with the
  artifact leg explaining the difference.
- Telemetry deviation check: REFUSED (recorder-corpus class —
  "refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not
  runs"). Baseline NOT rolled, same as all prior bisect/transplant
  arms.

## Proof

- scripts/test-transplant12-14.js — stage 1: 100 passed, 0 failed
  (committed with the prereg, 2cc3edbe2); stage 2: 135 passed, 0
  failed (live pick trees equal the predicted trees, subject holds
  both picks, step verdict NOT-CARRIER, base restored).
- scripts/test-culpritbisect-a.js — 116 passed, 0 failed (re-run
  after the step).
- scripts/test-snippet-stage-direction.js — PASS on the subject's
  exact tree (extracted from c8655548f) and PASS on the arm branch
  (master code, a superset guard).
