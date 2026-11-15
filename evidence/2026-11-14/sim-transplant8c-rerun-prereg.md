# H1 transplant — narrowed family 8c RERUN prereg: matched-band rerun of the excluded second dlg:more hunk of PR #22 (arm sim-transplant8c-rerun-a)

Run: fleshout-20261115T0427Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8c-rerun-a` (worktree
`~/workspace/worktrees/sim-transplant8c-rerun-a`, base master at run
start — HEAD 7ba58d326, the 0215Z coordinator evidence commit).
Binding prereg: evidence/2026-11-14/sim-transplant8c-prereg.md (the 8c
prereg — family definition, mechanism analysis, step mechanics, and
the family test are adopted VERBATIM from it; this prereg changes
only the band, the step ids, and the gate's band-health pre-check) +
evidence/2026-11-14/sim-transplant8c.md (the 0215Z arm: baseline gate
FAILED on the fresh band, 1/8, STOP, subject leg never cut) +
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics, far-end
baseline 4/8 with per-seed days 86/144/150/43/150/87/150/150 on the
matched band 190391–190398).
License: the 0215Z coordinator LICENSED this rerun on the matched
band with its own prereg, pre-registering the matched band BEFORE
running — the subject leg never ran, so no subject outcome exists to
select on. The fresh-band 1/8 stays on the record. This rerun does
NOT re-judge the fresh-band outcome; it measures the same question on
the band where the far end is known healthy.
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon is invented or rewritten.

Written and committed BEFORE running any judged sim in THIS run
(proof scripts/test-transplant8c-rerun.js, stage 1, green at prereg
stage; the targeted dlg:more script scripts/test-transplant8c-dlgmore.js
is reused unchanged from the 8c arm). The subject branch already
exists (cut by the 0215Z arm, left in place, READ-ONLY here — never
commit onto it, never rebuild it); its verification is re-run by THIS
arm at run start and recorded below.

## The question

Does the remaining unmeasured piece of the dialog-coherence audit #4
repair — narrowed family 8c, the second dlg:more hunk of merge
`713eb7545` (PR #22 live-thread-dry-engage), which narrowed family 8b
EXCLUDED — alone collapse the far end `203a32775` (GOOD 4/8 on the
matched band) toward the merge's 1/8? Family 8b measured NOT-CARRIER on
the three clean hunks of PR #22; this rerun measures ONLY the excluded
continuation hunk. Nothing 8b already measured, nothing else from the
merge.

## Family identity (re-verified by THIS arm at run start, before any sim)

Adopted from the 8c prereg (verified there and re-verified here from
`git diff 713eb7545^1 713eb7545`):

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` ("Merge pull request #21 from
  steve-vitale/cursor/living-garden-deed-master"); second parent
  `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0.
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
- `713eb7545` is NOT an ancestor of the far end `203a32775` (the family
  is origin-side, absent from the far end), and IS an ancestor of
  master HEAD (the origin line was merged to master after the far end;
  the family lives on master today).

## Narrowed 8c definition (COORDINATOR-DEFINED via the 8c prereg — do not redefine)

Include ONLY this ONE hunk from the family diff, in `src/js/convo-dialogue.js`
(family-diff header `@@ -293,11 +308,27 @@`; merge-tree header
`@@ -308,11 +323,27 @@`). No test file, no other hunk, nothing from 8b.

Exact hunk (verified by the 8c arm from
`git diff 713eb7545^1 713eb7545 -- src/js/convo-dialogue.js`): +17/−1.

- Removed (1): `return { line: composed, choices: this.convoChoices(vid),
  ended: false, transcript: c.transcript.slice() };` — the success-branch
  return inside `if (said)`.
- Added (17):
  - `return { line: said, choices: ...};` (same return, now echoing what
    `sayLine` actually spoke instead of the composed beat);
  - `}` closing the `if (said)` success branch;
  - `// sayLine already spoke a dry fallback into the transcript —` +
    `// retire "tell me more" without emitting a second line.`
  - `if (c._sayFellBack) { c.threadDryFor = c.thread; return { line: said,
    choices: ...}; }` — the fell-back early return;
  - `// If unfinished work still exists, name it instead of "that's all."`
  - `if (typeof this.convoHasLiveUnfinished === 'function' &&
    this.convoHasLiveUnfinished(vid)) { ... }` — the dry-branch
    unfinished-name block (speaks an honest unfinished name structurally,
    returns it; 9 added lines).

EXCLUDED: everything else in the merge — all three 8b hunks (new methods,
goon delivery, dlg:more pre-check), all four conflicted hunks
(lesson-outcome/diegetic-act, favor settlement, favor-line sayLine,
blocked-repeat), and the test file. The subject diff must be exactly
this hunk: one file, +17/−1, no other file touched.

## Mechanism analysis (pre-registered, adopted from the 8c prereg — not a verdict)

What the hunk CAN do alone on far-end substrate:

- (a) `line: said` — live whenever `sayLine` returns something other than
  the composed beat. `sayLine` returns the dry fallback string (truthy)
  when the beat is no-repeat-blocked (self-block per sitting, or run
  ledger). `convoComposeBeat` returns the raw beat unchanged for a
  "tell me more" label, so the composed line's first chunk IS the beat's
  first chunk and the block fires on the composed line. Far end returns
  the phantom composed line to the caller while the transcript holds the
  dry line; 8c returns the actually-spoken dry line. Reachable only when
  a dlg:more beat is ledger-blocked in play.
- (b) `if (c._sayFellBack)` early return — `_sayFellBack` IS set by
  `sayLine` at the far end (conversation.js:976–982, pre-existing FELL-BACK
  mechanism, not introduced by family 8). Reachable in exactly one narrow
  case: the beat is blocked AND the 9-line dry pool is exhausted
  (`convoDryLine` returns null past 9 uses in one conversation), so
  `sayLine` returns null with the flag set. Then 8c retires "tell me more"
  and returns `{line: null}` instead of falling through to the dry-branch
  "that's all" line. In every other blocked case `said` is truthy, the
  `if (said)` success branch returns first (the hunk-1 guard
  `if (said && !c._sayFellBack)` is NOT in 8c), and the early return is
  unreachable.
- (c) Dry-branch unfinished-name block — INERT on far-end substrate:
  `convoHasLiveUnfinished` does not exist at the far end (it is an 8b
  hunk), so the `typeof ... === 'function'` guard is false and the block
  never runs. The 8c subject therefore carries the NAME of the unfinished
  check but not the check itself.

Consequence, stated up front: the 8c hunk's only live effects alone are
(a) and the narrow case (b), both inside dlg:more on a ledger-blocked
beat. The competent bot opens a dlg:more exchange only when it talks, and
8b already showed the bot never opens a Help/engage/goon exchange on a
live unfinished thread — the survival leg may read inert for the same
reason. That is a finding about the SIM's exercise of the hunk, not a
dialogue verdict; the family-test leg below is the dialogue instrument.

## Subject-branch verification (run by THIS arm at run start — READ-ONLY)

Subject branch `transplant-8c-subject`, commit
`2cd6720b00faf728dae8818ade87961b3839d059` (cut by the 0215Z arm, left
in place). Verified by THIS arm before any judged sim:

- Exactly 1 commit on the far end: `git log --oneline
  203a32775..transplant-8c-subject` lists only
  `2cd6720b0 transplant-8c-subject: narrowed family 8c second dlg:more
  hunk (PR #22) onto far end 203a32775`.
- Parent is the far end (`203a32775`, full
  `203a327750a223e0a1465dc51f5409787efdfaae`).
- Diff exactly +17/−1, one file `src/js/convo-dialogue.js`, and the
  subject diff's added/removed lines are byte-identical to the family
  8c hunk (proof §8 re-checks this live).
- Test file ABSENT from the subject.
- Subject policy sha == far-end policy sha `a7ff5c51…`; subject native
  standing sha == far-end standing sha `75762cb2…`.
- No 8b-only strings in the subject (proof §8).

If any of these checks fails, FAIL LOUDLY and stop — the subject is
READ-ONLY and is never rebuilt by this arm. No conflict-STOP applies
here (the subject already exists, cut cleanly by the 0215Z arm; the
merge-tree prediction was already proven live by that arm's clean
apply). The conflict-STOP rule below is retained for the record and
for any future re-cut, which this arm does NOT perform.

PREDICTED OUTCOME — MEASURABLE: both legs run cleanly on the matched
band with ZERO conflicts anywhere (the subject already exists; the
legs only check it out detached), because the hunk's context lines are
byte-identical between the first parent and the far end (proven by the
0215Z arm's clean subject cut).

## Conflict-STOP rule (binding, retained from the 8c prereg)

If the subject had to be re-cut (it does not — it exists): apply the
filtered patch to a scratch branch cut at the far end. On ANY conflict:
STOP, report the exact conflict list (which paths, which hunks), do NOT hand-resolve game code, do NOT silently drop a conflicting hunk and
proceed (dropping would redefine the family mid-run), report UNMEASURED
with the exact conflict list. The patch contains exactly one hunk, so
ANY conflict is by definition beyond the family definition.

## Seed band + band-health pre-check (the change this rerun makes)

- Band: **MATCHED band 190391–190398** (8 seeds), named explicitly
  before any judged sim in this run. This is the band the far end's
  settled 4/8 was measured on — NOT a fresh band, NOT a band chosen
  after seeing a subject outcome (no subject outcome exists).
- Band-health pre-check (stated BEFORE running): the far end's settled
  4/8 on this exact band was reproduced TWICE — by masterregress and
  then by the 8b arm with IDENTICAL per-seed days
  (86/144/150/43/150/87/150/150), recorded in
  evidence/2026-11-13/culpritbisect-a-ep-far-summary.json (survived
  4/8, rank REGIONAL_INTACT, 0 instrument errors), re-verified by THIS
  arm at run start. The baseline leg in this run is a THIRD read of
  the same band; the gate below expects it to read ≥3/8. If it reads
  ≤2/8 the run STOPS per prereg (the band would not have reproduced
  far-end health a third time, and a subject leg would be
  uninterpretable) — exactly the STOP the 0215Z arm took on the fresh
  band, now applied to the matched band.
- Freshness: the matched band is KNOWN-USED (it is the bisect's
  matched band by design); no freshness claim is made for it. The
  fresh band 190541–190548 and its 1/8 read stay on the record in
  evidence/2026-11-14/sim-transplant8c.md and are NOT re-judged here.
- Step tooling: `scripts/culpritbisect-step.sh` and
  `scripts/culpritbisect-analyze-20261113.js` hardcode the matched
  band 190391–190398 (SEEDS literal / SEEDS constant) — this run's
  band, so NO band edit is needed anywhere. The step script is still
  run from a /tmp copy (REPO passed in) so the detached checkout
  cannot unlink the running script itself; the copy is byte-identical
  to the committed script. The committed tooling is NOT edited.

## Measurement plan

- Subject branch `transplant-8c-subject` left in place, READ-ONLY;
  subject commit hash recorded in evidence. Measured diff (src/js)
  verified byte-identical to the family's 8c hunk: the subject diff's
  added/removed lines (modulo hunk-header line numbers, which shift
  with the far end) must equal the family diff's 8c-hunk added/removed
  lines exactly (+17/−1, one file); the test file must be ABSENT from
  the subject; subject policy == far-end policy `a7ff5c51…`;
  subject native standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-8c-rerun` on the far end `203a32775`,
  via the /tmp step-script copy (matched band, REPO passed in, fix
  standing swapped in). Expect the far end to read healthy on the
  matched band (settled 4/8, reproduced twice).
  Gate: the baseline leg reads ≥3/8 — if it reads ≤2/8, STOP and
  report loudly (the matched band would not have reproduced far-end
  health a third time; no subject step is cut). The settled
  matched-band baseline (4/8, days 86/144/150/43/150/87/150/150) is
  the anchor; this run's leg is the third read of it.
- SUBJECT LEG: STEP id `t8c-rerun`, via the same /tmp step-script copy.
  Seeds 190391–190398, 150d death-aware, competent verbatim own-policy
  (family touches no policy — subject policy IS the far-end policy
  `a7ff5c51…`), fix standing swapped in every step, native restored
  byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on
  the suspect list); ≥3/8 NOT-CARRIER. Carried VERBATIM from the 8c
  prereg — do NOT re-score against a friendlier bar mid-run. The
  task's expected NOT-CARRIER form is subject identical to the
  baseline leg (count AND per-seed days identical); a ≥3/8 subject
  that differs from baseline is still NOT-CARRIER, with the divergence
  reported, never re-scored. Secondary (diagnostic only): wave-5
  unlocks, median days, death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent warning:
  the 15E p3conv arm found its dialogue paths unexercised on the
  survival band (0 resume-opener matches in 225 vetSays lines), arm 9
  found its family's new lines never fire under the competent policy,
  8b found 0 "lost my train of thought" / 0 "Still on" across both
  corpora, and the 0215Z 8c arm found 0/0 across 440 vetSays lines.
  Census the 8c lines in the rerun corpus (dry-fallback returns,
  thread-dry markers). A survival verdict proves
  survival-inertness, not dialogue behavior.

## Family-test leg (dialogue instrument — pre-registered, judged separately)

The 8c behavior is proven by the dedicated script
`scripts/test-transplant8c-dlgmore.js` (reused unchanged from the 8c
arm), run BEFORE/AFTER (far end vs subject, same staging, same seeds):

- Case A (blocked beat, dry pool available): poison the whole
  `pastFollow` pool into the run ledger, `convoTurn(vid, 'dlg:more')`.
  Far end (control): `sayLine` falls back (`c._sayFellBack` true) and
  the handler returns the phantom composed beat while the transcript
  holds the dry line (`r.line !== lastThem`). Subject: the handler
  returns what was actually spoken (`r.line === lastThem`).
- Case B (blocked beat, dry pool exhausted: `c.dryLines = 9`): `sayLine`
  returns null with `_sayFellBack` set. Far end (control): falls through
  to the dry branch and speaks a "that's all" line (and the dry-branch
  emission resets `_sayFellBack` to false post-turn — the fall-through
  evidence; the flag is reported as a diagnostic, not a pass input).
  Subject: early return, `r.line === null`, `c.threadDryFor === c.thread`,
  no second line emitted.
- The script exits 0 iff both 8c behaviors hold; it is EXPECTED to exit
  non-zero on the far end (the control proving the hunk is what changes
  the behavior) and 0 on the subject. Both runs are recorded in the
  evidence file. Green/not-green is reported SEPARATELY from the
  survival verdict, per the task brief. The 0215Z arm already recorded
  exactly this outcome on this exact subject commit (exit 1 far end,
  exit 0 subject); this run re-runs it for its own record — same
  staging, same seeds, deterministic.

The dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
cannot run whole on the 8c subject: its Dale setup calls
`Game.convoHasLiveUnfinished(vid)` (line 60), a method the 8c subject
does NOT carry (it is an 8b hunk; the 8c hunk only references it behind
a typeof guard). The 0215Z arm already recorded the outcome (Dale goon
SETUP FAILURE on the missing method; Dale-honest 2 FAILS on missing 8b
goon delivery; plant-lesson resume GREEN through the 8c handler; #14
fails on the missing file at the far end). This run does NOT re-run the
#4 proof whole — its outcome on this substrate is already on the
record and nothing in this rerun changes the substrate. The #4 proof's
failures are missing-8b-content / missing-substrate, NOT a regression
and NOT a pass, same class as 8b's #14 finding.

## Proof

`scripts/test-transplant8c-rerun.js` (stage 1, before any judged sim
in this run): family identity (incl. merge NOT an ancestor of the far
end, IS an ancestor of master), narrowed-definition hunk inventory
(family diff has exactly 3 conversation.js hunks + 5 convo-dialogue.js
hunks; the 8c hunk is exactly dlg 293, +17/−1; the 8b included set and
the four excluded conflict hunks are named exactly), merge-tree
prediction (marker-free 8c hunk at @@ -308, all markers confined to
the four excluded hunks, test file added cleanly, no DU), mechanism
analysis (`_sayFellBack` set by sayLine at the far end,
`convoHasLiveUnfinished` absent at the far end, dry-pool-exhaustion
returns null, far-end dlg:more returns `line: composed`),
conflict-STOP rule + tooling-only analysis (n/a — the rule here is
any-conflict-stops on a re-cut, which this arm does not perform),
verdict mapping (carried verbatim: ≤1 CARRIER / 2 AMBIGUOUS / ≥3
NOT-CARRIER), base state (branch-identity legs worktree-aware per the
0215 coordinator note — they assert the arm branch in the worktree and
the merged tip on master, so the proof stays green on master),
seed-band identity (MATCHED band 190391–190398, step ids t8c-rerun /
ep-far-8c-rerun, subject branch transplant-8c-subject, /tmp-copy
mechanism for the running script only — NO band edit, the committed
tooling already carries the matched band), live subject state (§8:
subject exists, exactly 1 commit on the far end, diff exactly +17/−1
one file, byte-identical to the family 8c hunk, test file absent, no
8b-only strings, policy + standing match the far end), step corpora
(§9: settled matched-band baseline anchor 4/8 with per-seed days
86/144/150/43/150/87/150/150, plus this run's rerun legs; on the
gate-STOP path §9 takes the GATE-STOP branch — baseline ≤2/8, no
subject summary/log/corpus, evidence records UNMEASURED).
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
branch as the reused-tooling check.
`scripts/test-transplant8c-dlgmore.js` — the targeted before/after
script for the family-test leg (see above); re-run in this run on the
far end (control, expected non-zero exit) and on the subject
(expected exit 0).

## Canon

docs/CANON.md read first, plus docs/CONVERSATIONS.md (the family's area).
No canon doc covers survival-collapse attribution; nothing here invents
canon.

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
- This arm does NOT re-judge any prior verdict (8b NOT-CARRIER, the
  0215Z 8c UNMEASURED-on-fresh-band, masterregress CULPRIT_MERGE /
  POLICY_EXONERATED_AT_MERGE, and the rest of the bisect record) — it
  measures only the excluded 8c hunk on the matched band.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs.
- No game-code change is committed by this arm (the subject lives on
  its own branch `transplant-8c-subject`, left in place, READ-ONLY);
  no `[needs-eyes]` applies. The arm branch commits only: prereg,
  proof scripts, evidence file, step corpora + summaries + driver logs.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect / transplant arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT rolled.
- Flap note: the flap-watch log is read at run start (probes A–D, F–H
  OK at 04:36Z; E/I EEXIST is the watcher's own O_EXCL lock artifact,
  not a flap); prereg + tooling are written and committed only after a
  probe succeeds. If the flap returns mid-run, wait for it to clear
  rather than bypassing safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
