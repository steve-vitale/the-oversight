# H1 transplant — family 8 as a family: the four CONFLICTED PR #22 hunks, theirs-resolved (arm sim-transplant8fam-a)

Run: fleshout-20261115T1215Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8fam-a` (worktree `~/workspace/worktrees/sim-transplant8fam-a`,
base master 738ccb2c9 at run start — current tip).
Binding prereg: evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics, far-end baseline 4/8
with per-seed days 86/144/150/43/150/87/150/150 on the matched band 190391–190398)
+ evidence/2026-11-13/sim-transplant8-prereg.md (full family 8 prereg — family
identity, merge-tree prediction, conflict-STOP outcome)
+ evidence/2026-11-13/sim-transplant8.md (the conflict-STOP record — exact marker
positions and merge-tree anchors)
+ evidence/2026-11-14/sim-transplant8b.md (narrowed 8b NOT-CARRIER: the three clean
hunks, bit-identical trajectories)
+ evidence/2026-11-14/sim-transplant8c.md + evidence/2026-11-14/sim-transplant8c-rerun-a.md
(narrowed 8c NOT-CARRIER on the matched band, subject 4/8 with bit-identical
trajectories; the 8c question is CLOSED for survival).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue, talk,
gossip — the family's area). This arm measures a conversation family; no canon is
invented or rewritten.

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant8fam.js, stage 1, green at prereg stage).

## The question

Do the FOUR CONFLICTED hunks of origin family 8 — merge `713eb7545` (PR #22
live-thread-dry-engage, dialog-coherence audit defect #4) — AS A FAMILY,
resolved by taking THEIRS in the conflicted regions, alone collapse the far
end `203a32775` (GOOD 4/8 on the matched band) toward the merge's 1/8?

What is already measured — NOT re-measured here: narrowed 8b (the three CLEAN
hunks) is NOT-CARRIER; narrowed 8c (the excluded second dlg:more hunk) is
NOT-CARRIER, measured by the 0427Z run's matched-band rerun (subject 4/8 with
BIT-IDENTICAL trajectories to baseline, merged 73a7f8fa8) — the 8c question is
CLOSED for survival. Four of PR #22's five hunks are measured non-carriers on
their own. What is UNMEASURED and is this arm's question: the four conflicted
hunks TOGETHER, as one subject, against the far end.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` ("Merge pull request #21 from
  steve-vitale/cursor/living-garden-deed-master"); second parent
  `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3 and the family-8 prereg.
  - `src/js/conversation.js` +87/−3: `convoHasLiveUnfinished` +
    `convoUnfinishedEngageLine` (new methods), goon live-unfinished
    delivery, plant-teach diegetic-act handling in the lesson-outcome
    region.
  - `src/js/convo-dialogue.js` +74/−12: dlg:more live-unfinished
    pre-check + `_sayFellBack` handling, favor-settlement
    unfinished-outing / deferred-resume guards, Help
    live-unfinished structural delivery.
  - `scripts/test-live-thread-engage-dry-20261108.js` +228/−0 (new
    file, blob `a0161cc9…`): the dialog-audit #4 proof (Dale goon→dry,
    Ruth plant-lesson resume).
- `standing.js` NOT in the family diff; `scripts/policies` NOT in the
  family diff. The subject's native standing.js is the far-end
  one (sha256 `75762cb2…`), so the standing-fix swap mechanics are
  exactly as in the bisect prereg. Merge policy sha == far-end policy
  sha `a7ff5c51…` (no policy drift — the family touches no policy).
- The test file is ABSENT at the far end AND at the first parent,
  present at the merge: a clean addition, not missing substrate.
- `713eb7545` is NOT an ancestor of the far end `203a32775` (verified
  by this arm — the family is origin-side, absent from the far end),
  and IS an ancestor of master HEAD (the origin line was merged to
  master after the far end; the family lives on master today).
- Family-diff hunk inventory (verified by this arm from
  `git diff 713eb7545^1 713eb7545`): `src/js/conversation.js` has
  EXACTLY 3 hunks (`@@ -1163,6 +1163,55 @@`, `@@ -5995,9 +6044,38 @@`,
  `@@ -7017,7 +7095,13 @@`); `src/js/convo-dialogue.js` has EXACTLY 5
  hunks (`@@ -273,15 +273,30 @@`, `@@ -293,11 +308,27 @@`,
  `@@ -444,6 +475,10 @@`, `@@ -495,10 +530,25 @@`,
  `@@ -510,18 +560,30 @@`). The 3 + 4 + 1 partition is: 8b included
  {conv 1163, conv 5995, dlg 273}, 8c {dlg 293}, conflicted four
  {conv 7017, dlg 444, 495, 510}.

## The four-hunk definition (THIS arm — the conflicted family)

Include ONLY these four hunks, resolved per the CONFLICT-RESOLUTION RULE
below. Hunk headers are cited in MERGE-TREE numbering (far-end/result side,
from `git merge-tree 9f388a524 203a32775 713eb7545`); the family-diff
numbering for the same hunks is given in parentheses. Ours/theirs line
counts are the merge-tree conflict-region contents (verified by this arm
from the merge-tree output saved at /tmp/mt8fam.txt during prereg work —
the proof re-runs merge-tree live and re-derives them).

- **Hunk 1 — lesson-outcome / diegetic-act**, `src/js/conversation.js`,
  merge-tree `@@ -7167,6 +7246,16 @@` (family-diff
  `@@ -7017,7 +7095,13 @@`): ours 6 lines, theirs 8 lines.
  Theirs: `lessonOutcome` WITHOUT `teach` + the PLANT TEACH comment
  (5 lines) + `plantTeachOutcome = choiceId === 'teach'` + the
  `diegeticAct: inviteOutcome || lessonOutcome || plantTeachOutcome`
  sayLine call. Ours (discarded by the rule): `lessonOutcome` WITH
  `|| choiceId === 'teach'` + the SECRET REPLIES comment block (3 lines)
  + `secretOutcome = choiceId.indexOf('secret:') === 0` + the sayLine
  call with `diegeticAct: ... || secretOutcome`.
- **Hunk A — favor settlement**, `src/js/convo-dialogue.js`, merge-tree
  `@@ -448,9 +479,34 @@` (family-diff `@@ -444,6 +475,10 @@`):
  ours 3 lines, theirs 22 lines. Theirs: the FULL favor block —
  `pinnedFavor` / `ledgerFavor` / `helpFavor` / `unfinishedOuting` /
  `deferredAfterResume` / `liveUnfinished` / `settledFavor` + the
  guarded `if (!unfinishedOuting && !deferredAfterResume && ...)`.
  Ours (discarded): the far end's simplified 3 lines (`settledFavor`
  from `c.want.favor || this.convoGetFavor(vid)` + the bare `if`).
- **Hunk B — favor-line sayLine**, `src/js/convo-dialogue.js`,
  merge-tree `@@ -497,7 +553,33 @@` (family-diff
  `@@ -495,10 +530,25 @@`): ours 1 line, theirs 23 lines. Theirs:
  `helpStructural = !!liveUnfinished` + the `convoWouldBlock`
  pre-check block (honest unfinished name, structural sayLine,
  early return) + the `sayLine(..., { tag, structural: helpStructural
  || undefined })` call. Ours (discarded): the far end's bare
  `const said = this.sayLine(vid, composed, { tag: ... });`.
- **Hunk C — blocked-repeat check**, `src/js/convo-dialogue.js`,
  merge-tree `@@ -505,7 +587,34 @@` (family-diff
  `@@ -510,18 +560,30 @@`): ours 1 line, theirs 24 lines. Theirs:
  the dry-fallback comment + `if (!said || c._sayFellBack) {` + the
  UNFINISHED HELP BLOCKED `#1/#4` block (liveUnfinished branch +
  fell-back early return). Ours (discarded): the far end's bare
  `if (!said) {`.

Expected subject diff vs the far end (derived, not assumed — the proof
checks it line-for-line): `src/js/conversation.js` +8/−6 (exactly 1
hunk); `src/js/convo-dialogue.js` +69/−5 (exactly 3 hunks:
+22/−3, +23/−1, +24/−1). Two files, four hunks, nothing else.

NOTE on hunk A (recorded so the subject diff is not misread as a
five-hunk family): the family-diff hunk A is only +4/−0 (the
`liveUnfinished` const), because `pinnedFavor` / `ledgerFavor` /
`helpFavor` / `unfinishedOuting` / `deferredAfterResume` already
existed at the FIRST parent. The FAR END later rewrote that whole
block down to 3 simplified lines (sociallife favor settlement).
Taking THEIRS in the conflicted region therefore restores those
pre-existing lines as well — they are the merge's version of the
region, i.e. theirs-content in the merge-tree sense, even though
they are not family-diff additions. The subject diff for hunk A is
+22/−3, NOT +4/−0. The same holds in smaller form for hunks B and C
(the far end removed `helpStructural` and the `_sayFellBack` handling
outright). The proof verifies each region equals the merge's region
exactly; it does NOT compare against the family-diff hunk lines.

## CONFLICT-RESOLUTION RULE (binding, pre-registered)

Resolve all four conflicted hunks by taking THEIRS (the family's side,
i.e. the merge's version of the region) in the conflicted regions, so
the subject contains the family's code exactly as merged there — NOT a
union hybrid (a union would measure a code state neither side ever had).
Concretely:

- Taking theirs in the lesson-outcome hunk DISCARDS the far end's
  `|| choiceId === 'teach'` + SECRET REPLIES block in that region
  (the `secretOutcome` const, its comment, and its place in the
  `diegeticAct` expression all go; `plantTeachOutcome` takes its place).
- The subject diff must be EXACTLY the four hunks' theirs-content:
  per-file added lines == the merge-tree theirs lines and removed lines
  == the merge-tree ours lines for the four regions (proof §8 checks
  this as sorted multisets per file). NO other file may differ from the
  far end.
- NO test file in the subject (game code only): the cherry-pick stages
  `scripts/test-live-thread-engage-dry-20261108.js` as a clean addition;
  it is REMOVED before the subject commit. The dialog-audit #4 proof
  file is a proof artifact, not game behavior; it is pre-registered as
  EXPECTED-FAIL/partial as a diagnostic only (see §Family-test leg),
  never a verdict input.
- The four CLEAN hunks (the 8b three + the 8c one) are NOT part of this
  family: the cherry-pick auto-merges them, and they are REVERSED
  (reverse-applied from the family diff) before the subject commit, so
  the subject carries no 8b-only or 8c-only strings (proof §8 checks
  the exclusion list).
- If the live pick conflicts in any file OTHER than the two predicted,
  or the marker count/positions differ from the prediction, or the
  clean-hunk reversal fails: STOP, report the exact deviation, do NOT
  hand-edit game code beyond the pre-registered theirs-resolution,
  report UNMEASURED with the exact conflict/reversal record.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 9f388a524 203a32775 713eb7545` (re-run by THIS arm at run
start; full output saved at /tmp/mt8fam.txt during prereg work — the
proof re-runs it live):

- `scripts/test-live-thread-engage-dry-20261108.js` — "added in remote",
  merges cleanly (new file, no far-end counterpart).
- TWO 'changed in both' files: `src/js/conversation.js`,
  `src/js/convo-dialogue.js`. NO 'merged' sections, NO delete/modify
  (DU) entries, NO other changed-in-both file.
- 12 marker lines total (3 + 9): conversation.js 3 markers (1 hunk),
  convo-dialogue.js 9 markers (3 hunks).
- Clean (marker-free) hunks: conversation.js
  `@@ -1163,6 +1163,55 @@`, `@@ -6069,9 +6118,38 @@`;
  convo-dialogue.js `@@ -288,15 +288,30 @@`,
  `@@ -308,11 +323,27 @@`. (The `@@ -7158,6 +7236,7 @@`
  fragment is only the context split immediately before the conflict
  markers of the lesson-outcome hunk, not a separate clean hunk.)
- The four conflicted hunks carry ALL the markers, at the anchors
  named in the definition above. All four hunks' ours/theirs signature
  lines are present in the output (`lessonOutcome`, `SECRET REPLIES`,
  `PLANT TEACH`, `plantTeachOutcome`, `settledFavor`, `pinnedFavor`,
  `unfinishedOuting`, `liveUnfinished`, `helpStructural`,
  `_sayFellBack`, `UNFINISHED HELP BLOCKED`).

PREDICTED OUTCOME — MEASURABLE BY THEIRS-RESOLUTION: the live
`git cherry-pick -m 1 713eb7545` onto the far end conflicts in exactly
the TWO predicted files (pick_rc=1), with markers at the positions the
family-8 arm recorded live (conversation.js 7239/7249/7258;
convo-dialogue.js 482/486/509, 556/558/582, 590/592/617), the test file
staged clean, no DU. The live pick is the authority — if it differs,
the STOP clause above fires. This is the sixth consecutive exact
merge-tree prediction in this program (families 2, 2b, 5, 5b, 7, 8).

## Subject construction (pre-registered procedure)

1. Branch `transplant-8fam-subject` cut at the far end `203a32775`
   (fresh name; the family-8 arm's `transplant-8-subject` stays at the
   far end with no subject commit — do NOT reuse it).
2. `git cherry-pick -m 1 713eb7545` — expect the predicted conflict
   (rc=1). Record the live marker positions and the
   `git status --porcelain` at the stop.
3. Resolve each of the 4 marker regions by taking THEIRS verbatim with
   a deterministic script (/tmp, not committed — the proof verifies
   the RESULT, not the process): for each conflicted file, replace
   every `<<<<<<< HEAD … ======= … >>>>>>>` span with the lines
   between `=======` and `>>>>>>>`, dropping markers and ours lines.
   Verify zero markers remain (`grep -c '<<<<<<<\|>>>>>>>'` == 0).
4. Remove the staged test file (`git rm -f
   scripts/test-live-thread-engage-dry-20261108.js`).
5. Reverse the 4 auto-merged clean hunks: extract the family-diff
   hunks `conversation.js @@ -1163,6 +1163,55 @@`,
   `@@ -5995,9 +6044,38 @@` and `convo-dialogue.js
   @@ -273,15 +273,30 @@`, `@@ -293,11 +308,27 @@` into patch
   files and `git apply -R` each against the resolved tree. If any
   reverse-apply fails: STOP per the rule above (no hand-edit fallback).
6. Verify: `git diff 203a32775 --stat` is exactly the 2 files with the
   expected +/− counts; `node --check` both files (extracted via
   `git show` to /tmp, so the check cannot touch the tree);
   proof §8 green.
7. Commit the subject on `transplant-8fam-subject` with
   `scripts/safe-commit.sh` (message names the family + theirs-rule).
   The subject is a MEASUREMENT INSTRUMENT and is NEVER landed on
   master; the branch is left in place. After the subject commit,
   check the arm branch back out and verify the tree clean before any
   step runs.

## Mechanism analysis (pre-registered, not a verdict)

What the four hunks CAN do together on far-end substrate (verified by
this arm from `git grep` counts at the far end vs the merge — the proof
re-checks the key counts live):

- The four hunks are COHERENT as a set: hunk A defines
  `liveUnfinished` (and `unfinishedOuting` / `deferredAfterResume`),
  hunks B and C USE `liveUnfinished`; hunk 1 is independent
  (diegetic-act accounting in the lesson-outcome region). No hunk in
  the set depends on an 8b/8c hunk for its DEFINITIONS — only for the
  typeof-guarded method calls below.
- `secretOutcome`: 2 occurrences at the far end (definition + use,
  both inside the conflicted region) and 0 at the merge. Taking theirs
  removes both together; nothing outside the region references it.
  The far end's secret-replies diegetic accounting is GONE in the
  subject in this region — the subject's `diegeticAct` no longer fires
  for `secret:` choices. That is the rule's cost, stated up front.
- `unfinishedOuting`, `deferredAfterResume`, `helpFavor`,
  `pinnedFavor`, `ledgerFavor`, `liveUnfinished`, `helpStructural`:
  0 occurrences at the far end (both files), present at the merge only
  in convo-dialogue.js. No far-end code outside the regions references
  them, so taking theirs introduces them cleanly.
- `plantTeachOutcome`: 0 at the far end, 2 at the merge (definition +
  use, both inside hunk 1). The subject's `diegeticAct` fires for
  `choiceId === 'teach'` via `plantTeachOutcome` instead of via the
  far end's `lessonOutcome || choiceId === 'teach'`.
- `convoHasLiveUnfinished` / `convoUnfinishedEngageLine`: 0 at the far
  end, present at the merge. Both are referenced ONLY behind
  `typeof ... === 'function'` guards inside hunks A/B/C, so on
  far-end substrate those call sites fall back (self-repeat line) or
  evaluate false. Consequence: `liveUnfinished` in the subject reduces
  to `unfinishedOuting || deferredAfterResume` — the 8b methods' live
  thread is NOT named. The hunks' only LIVE effects alone are the
  outing/deferred branches.
- `convoWouldBlock`: EXISTS at the far end (24 occurrences in
  conversation.js, 2 in convo-dialogue.js) — the typeof guard in hunk
  B PASSES, so the pre-check is LIVE, not inert: when Help's composed
  favor line would ledger-block, the subject speaks the honest
  unfinished name structurally instead of letting sayLine dry.
- `convoGetFavor`: exists at the far end (the far end's own
  settledFavor line calls it unguarded); hunk A's typeof-guarded call
  is safe either way.
- `convoSelfRepeatLine`, `convoWantEngage`, `convoComposeDlg`: exist
  at the far end (3 / 16 / 10 occurrences).
- `_sayFellBack` IS set by `sayLine` at the far end (pre-existing
  FELL-BACK mechanism, not introduced by family 8) — hunk C's
  `if (!said || c._sayFellBack)` condition can fire; the
  `if (c._sayFellBack)` early return inside it is reachable on a
  dry-fallback return.
- Net behavioral shape, stated up front: the subject restores the
  family's Help-on-unfinished-work grammar (settled-favor guard,
  structural Help, blocked-repeat recovery) while LOSING the far
  end's secret-replies diegetic accounting in one region. Whether
  either side moves survival is the measurement; the competent bot
  may never open a Help exchange on a live unfinished thread (8b/8c
  found 0 such lines in the survival corpora), in which case the
  subject reads inert like its siblings — that would be a finding
  about the SIM's exercise of the hunks, not a dialogue verdict.
  The family-test leg below is the dialogue instrument.

## Measurement plan

- Subject branch `transplant-8fam-subject` left in place, never landed;
  subject commit hash recorded in evidence. Measured diff (src/js)
  verified line-identical to the merge-tree theirs/ours regions:
  conversation.js +8/−6 (1 hunk), convo-dialogue.js +69/−5 (3 hunks);
  the test file ABSENT from the subject; subject policy == far-end
  policy `a7ff5c51…`; subject native standing == far-end standing
  `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-8fam` on the far end `203a32775`,
  via `scripts/culpritbisect-step.sh` run from a /tmp copy with REPO
  passed in (the script is absent at the far end; copy from the arm
  branch). Expect 4/8, per-seed days 86/144/150/43/150/87/150/150
  (masterregress far leg, per the bisect prereg — reproduced THREE
  times now: masterregress, 8b, the 0427Z 8c rerun, identical per-seed
  days all three times). The step id is `ep-far-8fam`, NOT a re-run of
  `ep-far`: the settled baseline corpus is committed on master (4/8,
  same days) and this run re-verifies it with a fresh id rather than
  overwriting the settled record.
- BASELINE GATE (precondition, stated explicitly): the fresh baseline
  leg must read ≥3/8 (expected 4/8 with the exact per-seed days above).
  If it reads ≤2/8, STOP and report loudly — the matched band would not
  have reproduced far-end health a fourth time, the settled
  localization would be in question, and a subject leg would be
  uninterpretable (a subject 1/8 could not distinguish "the family
  collapses the far end" from "the band is hard"). On the gate-STOP
  path: no subject leg is cut, the evidence file records UNMEASURED
  with the baseline count, and the subject branch is left in place for
  a possible coordinator-directed rerun.
- SUBJECT LEG: STEP id `t8fam`, via the same /tmp step-script copy.
  Seeds 190391–190398, 150d death-aware, competent verbatim own-policy
  (family touches no policy — subject policy IS the far-end policy
  `a7ff5c51…`), fix standing swapped in every step, native restored
  byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on
  the suspect list); ≥3/8 NOT-CARRIER. Secondary (diagnostic only):
  wave-5 unlocks, median days, death-cause shares, standing
  distribution. Expected NOT-CARRIER form: subject identical to the
  baseline leg (count AND per-seed days identical); a ≥3/8 subject
  that differs from baseline is still NOT-CARRIER, with the divergence
  reported, never re-scored.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent warning:
  the 15E p3conv arm found its dialogue paths unexercised on the
  survival band (0 resume-opener matches in 225 vetSays lines), arm 9
  found its family's new lines never fire under the competent policy,
  8b found 0 "lost my train of thought" / 0 "Still on" across both
  corpora, and the 8c arms found 0/0 across 440 + 225 vetSays lines.
  Census the 8fam lines in the corpus (dry-fallback returns,
  thread-dry markers, "Still on", settled-favor lines). A survival
  verdict proves survival-inertness, not dialogue behavior.

## Family-test leg (dialogue instrument — pre-registered, judged separately)

The dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
is run against a /tmp pathspec extract of the SUBJECT tree (test file
copied in from the merge blob `a0161cc9…`; the file exists on neither
the far end nor the subject tree) and, as a control, against a /tmp
pathspec extract of the FAR END. It is pre-registered as
EXPECTED-FAIL/partial as a diagnostic only, never a verdict input:

- The Dale goon setup calls `Game.convoHasLiveUnfinished(vid)` — a
  method the 8fam subject does NOT carry (it is an 8b hunk, reversed
  out of this subject). Expected: SETUP FAILURE on the subject, same
  as the 8c arm recorded.
- The Dale-honest shape needs the 8b goon delivery. Expected: FAILS
  on the subject on missing-8b-content grounds.
- The plant-lesson resume shape runs through the lesson-outcome region
  (hunk 1 IS in the subject) — its outcome is recorded as observed,
  pass or fail; it is the one #4 shape this subject could carry, and
  its result is diagnostic either way.
- The #14 favor/debt Help check fails on a missing file
  (`scripts/test-favor-debt-help-coherence-20261108.js` is ABSENT at
  the far end and at the subject — MODULE_NOT_FOUND on spawn, the
  pre-existing far-end substrate gap 8b documented). Expected, not a
  regression.
- No full-tree `git archive` extract — /tmp tmpfs is 512M and a
  full-tree extract fills it (8b's finding). Use a pathspec extract
  (src/scripts/index.html/manifest.json/sw.js/build-source.json).

## Proof

`scripts/test-transplant8fam.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master), four-hunk definition (family-diff hunk inventory
3 + 5; the conflicted four named exactly in both numberings; the 8b
included set and the 8c hunk named as excluded; the hunk-A +22/−3 vs
family-diff +4/−0 distinction stated), merge-tree prediction
(marker-free clean hunks, all 12 markers confined to the four
conflicted hunks with the exact ours/theirs line counts, test file
added cleanly, no DU), mechanism analysis (reference counts at the
far end vs the merge for every name the hunks touch; secretOutcome
def+use inside the region; convoWouldBlock EXISTS at the far end so
the hunk-B pre-check is live; convoHasLiveUnfinished /
convoUnfinishedEngageLine absent so liveUnfinished reduces to
outing||deferred), CONFLICT-RESOLUTION RULE + verdict mapping
(theirs-resolution function: take-theirs maps the four regions;
classifyTransplant maps every survived count to CARRIER / AMBIGUOUS /
NOT-CARRIER / UNCLASSIFIABLE), base state (branch-identity legs
worktree-aware per the 0215 coordinator note — they assert the arm
branch in the worktree and the merged tip on master, so the proof
stays green on master), seed-band identity (MATCHED band 190391–
190398, step ids t8fam / ep-far-8fam, subject branch
transplant-8fam-subject, /tmp-copy mechanism for the running script
only — NO band edit, the committed tooling already carries the
matched band), live subject state (§9: state-aware — before the
subject cut it asserts the branch does not exist; after the cut it
asserts parent is the far end, diff exactly +8/−6 and +69/−5 with
per-file added/removed lines equal to the merge-tree theirs/ours
lines, test file absent, no 8b/8c-only strings, all four-hunk
theirs-strings present, policy + standing match the far end,
`node --check` passes on both subject files), step corpora (§10:
state-aware — see the §10 guard note below).
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check.

### §10 intermediate-state guard (the 1116Z fix — pre-registered)

The 1116Z coordinator note records the proof §10 intermediate-state
crash class: an unguarded `readFileSync(sumPath)` after a "subject
step summary exists" leg crashes with uncaught ENOENT in the state
where the baseline summary exists but the subject summary does not
yet (6b3way evidence). This proof's §10 is written against that class
EXPLICITLY: every summary read is preceded by an `fs.existsSync`
check on the SAME path in the SAME branch, and the intermediate state
(baseline summary exists, subject summary absent, baseline ≥3/8) is
its own passing branch ("baseline leg done, subject leg pending") —
it never falls through to a subject-summary read. The gate-STOP branch
(baseline ≤2/8, no subject summary) is separate. The proof must pass
in ALL FOUR states (neither / baseline-only-healthy / baseline-only-
gate-stop / both), not just at stage 1 and at the final state; the
stage-1 run covers "neither", and the proof is re-run after the
baseline leg (expecting the intermediate branch) and after the
subject leg (expecting the final branch).

## Canon

docs/CANON.md read first, plus docs/CONVERSATIONS.md (the family's
area). No canon doc covers survival-collapse attribution; nothing here
invents canon. The family's change (never dry while unfinished work
remains) and the far end's side (diegetic-act accounting, secret
replies) are both inside the canon's "replies belong to the spoken
exchange" and "no repeats, ever" rules; the collision is in
implementation lines, not in canon. Taking theirs trades one repair
for the other in a single region — the measurement says whether that
trade moves survival.

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
- This arm does NOT re-judge any prior verdict (8b NOT-CARRIER, 8c
  NOT-CARRIER on the matched band, the 0215Z 8c UNMEASURED-on-fresh-
  band, masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and
  the rest of the bisect record) — it measures only the four
  conflicted hunks as a family on the matched band.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs.
- No game-code change is committed by this arm on the arm branch
  (the subject lives on its own branch `transplant-8fam-subject`, left
  in place, NEVER landed); no `[needs-eyes]` applies. The arm branch
  commits only: prereg, proof scripts, evidence file, step corpora +
  summaries + driver logs.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect / transplant arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT rolled.
- Flap note: a write-flap window is ACTIVE at run start (first FLAP?
  probe line 2026-11-15T12:47:42Z; ALL-OK at 12:46:38Z). Probes A
  (atomic tmp+fsync+rename) and B (git update-ref) FAIL with EPERM;
  probes C/D (node plain writes) and F (python plain write) read OK.
  The heartbeat script's atomic registry save fails in this window
  (registry heartbeat_at stuck at 12:41:21Z); the registry's
  NEVER-rewrite-in-place safety rule forbids an in-place workaround,
  so the heartbeat is retried periodically and the stale heartbeat is
  recorded here, not worked around. Prereg + tooling are written and
  committed only after a probe succeeds (plain writes go through in
  this window). If the flap returns mid-run, wait for it to clear
  rather than bypassing safe-commit; never route around a denial.
- Disk at run start: /home 40% (90G free).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
