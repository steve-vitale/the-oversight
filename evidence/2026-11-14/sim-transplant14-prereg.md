# sim-transplant14-prereg — H1 transplant family 14, snippet stage-direction guard (arm sim-transplant14-a)

Run: fleshout-20261114T0740Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: sim-transplant14-a. Worktree: ~/workspace/worktrees/sim-transplant14-a.
Prereg written and COMMITTED before cutting the subject or running any judged sim.
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (transplant program)
+ evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg: roster-check
standing-fix swap, step mechanics).

Canon read first: docs/CANON.md, then docs/CONVERSATIONS.md (the canon doc for
dialogue). No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Family identity (verified by this arm before any sim)

- Merge: 7688cb7a46367c88c7bb85e976502ddc0d5456f0 — "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard".
- First parent: 16cdd690062b3551ff6b4b0d3639770c8af84b5f — "Merge pull request #9
  from steve-vitale/cursor/curious-stale-opener-fix".
- Second parent: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b — "Reject stage-direction
  snippets as resume memory quotes".
- Second-parent side is 1 commit (`git rev-list --count 7688cb7a4^1..7688cb7a4^2` = 1).
- `git diff --stat 7688cb7a4^1 7688cb7a4`: 2 files, +33:
  - src/js/conversation.js +12 (the ONLY src/js file — table reading js=1, pol=0 CONFIRMED)
  - scripts/test-snippet-stage-direction.js +21 (new test file)
- standing.js NOT in the family diff. No scripts/policies file.
- `convoSnippetIsStageDirection` is ABSENT at the far end 203a32775 (grep rc=1)
  and PRESENT at the merge (2 hits, conversation.js:1732/1736) — the guard is
  genuinely new to the far end.
- The second parent's own diff is the same 2-file, +33 change (the merge adds
  nothing beyond the side commit).

## What the family does (canon-grounded, not invented)

Canon: docs/CONVERSATIONS.md — resume openers remember what the player told a
villager and quote unfinished threads ("want to pick it up? '<quote>'"). The
guard adds `convoSnippetIsStageDirection`: resume-memory quotes that are stage
directions (mood/narration lines from silence pools — "They glance at the
fire…", "A comfortable quiet settles…", "A tired smile") are rejected as
resume quotes. Pure dialogue-coherence: no numbers, no gates, no survival
lever. A villager whose unfinished thread was a stage direction simply gets
no quote attached to the resume opener; the thread itself is untouched.
Mechanism check in the corpus: does the guard fire (stage-direction resume
quotes rejected), and do the villagers still act like people?

## Base, seeds, horizon, policy

- Base: far end 203a32775 (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078;
  verified this run: `git show 5157782a4:src/js/standing.js` sha256 matches;
  native restored byte-identical afterwards, sha-verified). Base is the
  far end, never current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step.
- Driver mechanics reused (scripts/culpritbisect-step.sh +
  scripts/culpritbisect-driver-20261113.js + analyzer, same as the
  bisect steps); STEP id t14-7688cb7a4. The step script is run from a
  /tmp copy with REPO passed in (the script is absent at the far end,
  so running it from the worktree would unlink it mid-run at the
  detached checkout). The driver loads competent.js from the
  checked-out tree.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch transplant-14-subject in this worktree and LEFT in
  place (branch kept, hash recorded in the evidence file). Never
  committed to the arm branch. Apply via `git cherry-pick -m 1 7688cb7a4`.

## Merge-tree pre-check (BEFORE cutting the subject)

Prescribed check — `git merge-tree d229b58f595430e2a24c399820061b39c5b689ca
203a32775 7688cb7a4` (full output 12,000+ lines, saved /tmp/t14-mergetree.txt):

- NINE "changed in both" sections: docs/ONTOLOGY.md, scripts/balance-proof.json,
  scripts/green-list.txt, src/js/conversation.js, src/js/convo-wants.js,
  src/js/game.js, src/js/villager-agency.js, src/js/villager-objectives.js, sw.js.
- TWO of those nine carry real conflict markers (`+<<<<<<< .our`, 2 hits):
  scripts/balance-proof.json (panel pointer, r167 vs person-trust) and
  scripts/green-list.txt (test-list tail). Both are zero-src-reader tooling
  files. The other seven merged without markers.
- 20 "merged" (clean) sections, 22 "added in remote" sections.

That prediction is for a FULL-TREE merge with the merge-base as base — it is
NOT the cherry-pick operation. The cherry-pick carries only the 2-file family
diff, so the operative pre-check is the cherry-pick-base merge-tree:
`git merge-tree 16cdd690062b3551ff6b4b0d3639770c8af84b5f 203a32775 7688cb7a4`
(saved /tmp/t14-mergetree-pick.txt) — EXIT 0, CLEAN: test file added in
remote, conversation.js hunk applies cleanly, ZERO conflict markers. The
live cherry-pick is expected to apply cleanly with no conflicts. The
prescribed-base conflicts (balance-proof.json / green-list.txt) are an
artifact of both sides having moved those tooling files since d229b58f5;
the pick never touches them.

## Conflict rule (binding)

On ANY cherry-pick conflict: STOP, report the exact conflict list,
do NOT hand-resolve game code. (If conflicts are confined ENTIRELY
to zero-src-reader tooling files — scripts/balance-proof.json /
scripts/green-list.txt — record them and STOP too; the coordinator
decides the narrowed route. Do not resolve them yourself.)

## Primary metric + verdict thresholds (binding, fresh per 2115 §3)

- Primary: survived/8 on the band.
- ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id,
  2/8 again → recorded AMBIGUOUS, kept on the suspect list;
  ≥3/8 NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.

## Sense-testing (SENSE-TESTING LAW)

Read the step corpus transcripts (vetSays): do the villagers still
act like people with the stage-direction guard in, and what changes
in what they do/say? Report in plain words in the evidence file.
Mechanism check: does the guard fire in the corpus (stage-direction
resume quotes rejected)?

## Proof

- scripts/test-transplant14.js (family identity, merge-tree
  pre-check, subject state, step verdict, base restored; every
  branch-identity assertion marked worktree-only so the proof stays
  green on master) plus re-run scripts/test-culpritbisect-a.js
  (116 legs).
- Evidence: evidence/2026-11-14/sim-transplant14.md (lever played,
  before/after numbers on identical seeds, reachability verdict,
  village assessment, blanks filled or documented, metric review
  section).

## Wall numbers carried in (judged corpora)

- Far end 203a32775: survived 4/8, wave-5 2/8 (bisect endpoint).
- Merge e4dbe581b: survived 1/8, wave-5 0/8.
- National 0, table 0, wins 0 on the collapse band.
- Sibling transplants so far: family 11 NOT-CARRIER 5/8, family 12
  UNMEASURED (conflict-STOP), family 13 NOT-CARRIER 4/8.
