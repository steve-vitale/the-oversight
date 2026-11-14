# sim-transplant11-prereg — family 11 voice-line-decoration-stack (Loop A, fleshout-20261114T0615Z)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp (survival collapse).
Arm: sim-transplant11-a, branch `sim-transplant11-a`, worktree
`~/workspace/worktrees/sim-transplant11-a`.
Written and COMMITTED BEFORE cutting the subject or running any judged sim.

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics).

## The question

Does origin family 11 — PR #26, the voice-line decoration guard on
authored questions — alone collapse the far end (GOOD 4/8) toward the
merge's 1/8? Seeds 190391–190398, horizon 150d death-aware, competent
verbatim own-policy, STEP id t11-0f55a928c.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `0f55a928c` "Merge pull request #26 from
  steve-vitale/cursor/voice-line-decoration-stack-b24a". First parent
  `ac119e4ed27b2aa66131929795a4d3d0f381900b` (the family-12
  dialog-residual-sampler merge — the origin line already contained
  it when this PR landed). Second-parent side is 1 commit:
  `5b7d834266e58e2de7300b892d267d5939db601f` "Stop voiceLine stacking
  on authored questions" (`git rev-list --count 0f55a928c^1..0f55a928c^2` = 1).
- `git diff --stat 0f55a928c^1 0f55a928c`: 2 files, +157/−0.
  `src/js/conversation.js` +20/−0 (the ONLY src/js file — table
  reading js=1, pol=0 CONFIRMED by this arm, matches round-2115 §3
  and the brief). `scripts/test-voice-question-decoration-20261108.js`
  +137/−0 (NEW test file).
- `standing.js` NOT in the family diff. No scripts/policies file.
  No data, no docs in the family diff.

## Family content (read before the pick)

The single commit is a dialogue-coherence fix in `Game.voiceLine`,
no numeric change, no new system:

- `conversation.js` (+20): a FORMAL QUESTION GUARD (dialog audit #5,
  2026-11-08). Authored questions often trail the "?" mark ("Okay,
  real question: …? I desperately need it."), so the old
  terminal-only `isQ` check missed them and voice openers stacked
  ("Practical view: Okay, real question: …"); temperament closers
  also answered the ask ("…laughed? Extremely normal, all of it.").
  The guard adds `asksQ` (any "?" in the line) as the honesty gate
  after the mannerism pick: any opener on a line that asks, any
  closer on a multi-clause ask, and non-soft closers on plain
  terminal questions are discarded (the mannerism cycle is still
  consumed, so RNG lockstep with prior sittings is preserved). Soft
  address/punct closers (", friend.", "…") still fold on plain "?".
- The new test (`scripts/test-voice-question-decoration-20261108.js`)
  forces voice draws on the audit's authored questions (q_laugh,
  q_origin, plain) and asserts they stay undecorated, while the soft
  ", friend." closer still folds.
- Mechanism note for the verdict: the guard only ever REMOVES
  decoration from question lines — it changes no cost, no trust
  delta, no gate, no win price, no deed gate, no readiness bar, no
  table rule. Its only path to survival is through what villagers
  SAY in conversation (and what the competent bot then does with
  those lines). A carrier read would have to come through dialogue
  behavior, not numbers.

## Canon

docs/CANON.md read first, then docs/CONVERSATIONS.md (the canon doc
for dialogue). CONVERSATIONS.md covers conversation structure, voice
backends ("Both voice backends receive complete quoted speech only"),
and the spoken-context contract — the family lives inside that
canon: a question must stay a question, not gain a temperament
opener that talks over it or a closer that answers it. NO canon doc
covers voice-line decoration specifically (no doc names the
opener/closer stacking rule or the formal-question guard); the
guard's rules come from the merge's own comments and its dialog
audit #5 write-up, quoted above, not invented here. Nothing here
invents canon.

## Base / seeds / horizon / policy

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end,
  never current master.
- Far-end native standing.js sha256 (verified this arm):
  `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`.
  Far-end competent.js sha256 (verified this arm):
  `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`.
- Subject: far end + family 11 diff, built on scratch branch
  `transplant-11-subject` (far end + `git cherry-pick -m 1
  0f55a928c`). NEVER committed to the arm branch. Branch LEFT in
  place, hash recorded in evidence, so the verdict is reproducible.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as the
  bisect — scripts/culpritbisect-step.sh mechanics, run from a /tmp
  copy with REPO passed in, and scripts/test-culpritbisect-a.js,
  116 legs, plus this arm's own proof legs for the transplant
  mechanics: family diff applied completely, subject commit
  recorded, base restored).

## Merge-tree pre-check (run BEFORE cutting the subject)

`git merge-tree ac119e4ed27b2aa66131929795a4d3d0f381900b 203a32775
0f55a928c` (base = first parent) predicts a CLEAN pick: 0 conflict
markers in the whole output (counted as `+<<<<<<<` lines — bare
`^<<<<<<<` grep returns 0 and falsely reports clean, per the
transplant10 counting note; this arm counted both ways, both 0).
Two sections: `added in remote` (the new test file) and `changed in
both` (`src/js/conversation.js`, base ae77aa50 / ours 1c943900 /
theirs cdef3941 — one hunk, @@ -718,7 +718,11 @@ and @@ -750,6
+754,22 @@, applying cleanly with no markers). No `removed in
local` / `removed in remote` section, no DU, no delete/modify.
Prediction: CLEAN pick.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

Primary metric: survived/8 on the band.

| Survived | Verdict |
|---|---|
| ≤1/8 | CARRIER — the family alone collapses the far end to the merge's level |
| 2/8 | AMBIGUOUS → re-run once with a fresh STEP id; 2/8 again → recorded AMBIGUOUS, kept on the suspect list |
| ≥3/8 | NOT-CARRIER — family alone does not collapse (far end is 4/8, so 3/8 is within a step of it) |

## Secondary (diagnostic only)

Wave-5 unlocks, median days, death-cause shares, standing
distribution. No cost guard — measurement arm; nothing lands on
master from the subject.

## STOP clause

On ANY cherry-pick conflict: STOP, report the exact conflict list
(which paths, UU/DU, which hunks), do NOT hand-resolve game code.
If conflicts are confined ENTIRELY to zero-src-reader tooling files
(scripts/balance-proof.json / scripts/green-list.txt), record them
and STOP too — the coordinator decides the narrowed route; do not
resolve them yourself.

## Telemetry

Recorder-corpus class — the deviation check REFUSES these corpora;
record the refusal, never roll the baseline.

## Sense-testing (SENSE-TESTING LAW)

Read the step corpus transcripts (vetSays) — do the villagers still
act like people with the decoration lines in, and what changes in
what they do/say? Reported in plain words in the evidence file.
For this family specifically: sample the authored-question lines in
the corpora (q_laugh / q_origin / curious openers) and check
whether any still carry a stacked opener or a fighting closer.

## Proof

- `scripts/test-transplant11.js` (family identity, merge-tree
  pre-check, subject state, step verdict, base restored; every
  branch-identity assertion marked worktree-only so the proof stays
  green on master).
- Re-run `scripts/test-culpritbisect-a.js` (116 legs).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the step: did the metric set hold, or does a
  metric need revision for the NEXT run?)
