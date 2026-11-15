# H1 transplant — narrowed family 8c prereg: the excluded second dlg:more hunk of PR #22 (arm sim-transplant8c-a)

Run: fleshout-20261115T0215Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8c-a` (worktree `~/workspace/worktrees/sim-transplant8c-a`,
base master at run start — HEAD f1400295b, an ancestor of master a4d0b2038).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step mechanics,
far-end baseline 4/8 with per-seed days 86/144/150/43/150/87/150/150 on the
matched band 190391–190398) + evidence/2026-11-14/sim-transplant8b-prereg.md
+ evidence/2026-11-14/sim-transplant8b.md (narrowed 8b: NOT-CARRIER 4/8,
bit-identical trajectories; the second dlg:more hunk documented as the
remaining unmeasured piece) + evidence/2026-11-14/sim-transplant-round-0608.md
arm 3 (coordinator decision narrowing 8 → 8b) + findings backlog line 2363
(tracker next blank #2).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon is invented or rewritten.

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant8c.js, stage 1, green at prereg stage;
targeted dlg:more script scripts/test-transplant8c-dlgmore.js, control run
on the far end recorded in §Family-test leg).

## The question

Does the remaining unmeasured piece of the dialog-coherence audit #4
repair — narrowed family 8c, the second dlg:more hunk of merge
`713eb7545` (PR #22 live-thread-dry-engage), which narrowed family 8b
EXCLUDED — alone collapse the far end `203a32775` (GOOD 4/8 on the
matched band) toward the merge's 1/8? Family 8b measured NOT-CARRIER on
the three clean hunks of PR #22; this arm measures ONLY the excluded
continuation hunk. Nothing 8b already measured, nothing else from the
merge.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` ("Merge pull request #21 from
  steve-vitale/cursor/living-garden-deed-master"); second parent
  `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3 and the family-8
  prereg.
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

## Narrowed 8c definition (COORDINATOR-DEFINED via the task brief — do not redefine)

Include ONLY this ONE hunk from the family diff, in `src/js/convo-dialogue.js`
(family-diff header `@@ -293,11 +308,27 @@`; merge-tree header
`@@ -308,11 +323,27 @@`). No test file, no other hunk, nothing from 8b.

Exact hunk (verified by this arm from
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

## Mechanism analysis (pre-registered, from source reads at the far end — not a verdict)

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

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 9f388a524 203a32775 713eb7545` (re-run by THIS arm at
run start; the proof re-runs it live):

- The 8c hunk appears as a MARKER-FREE hunk in the merged output at
  `@@ -308,11 +323,27 @@` (verified by the 8b arm and re-verified here).
- The four excluded conflicted hunks carry ALL the conflict markers
  (conversation.js 3 markers, convo-dialogue.js 9 markers). No other
  markers anywhere in the output.

PREDICTED OUTCOME — MEASURABLE: the single-hunk filtered patch applies
cleanly to the far end with ZERO conflicts, because the hunk's context
lines are byte-identical between the first parent and the far end (that
is what "marker-free in the merge-tree output" means). The live
`git apply` is the authority — if it conflicts, the conflict-STOP rule
below fires.

## Conflict-STOP rule (binding on this arm)

Apply the filtered patch to the scratch branch `transplant-8c-subject`
(cut at the far end). On ANY conflict: STOP, report the exact
conflict list (which paths, which hunks), do NOT hand-resolve game
code, do NOT silently drop a conflicting hunk and proceed (dropping
would redefine the family mid-run), report UNMEASURED with the
exact conflict list. The patch contains exactly one hunk, so ANY
conflict is by definition beyond the family definition.

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190541–190548** (8 seeds), candidate named by the coordinator.
- Freshness check (per local_seed_band_freshness skill), scope:
  `evidence/*/sim-*-prereg.md` (every dated prereg) + every
  forbidden/contaminated band list those files name + `evidence/*/sim-*.md`
  evidence files. Method: word-boundary grep for the exact 6-digit seeds
  `19054[1-8]`.
  - Result: ZERO hits for 190541–190548 as 6-digit seeds in any prereg or
    evidence file. The only near-hit is the token `1905434728` in
    evidence/2026-11-12/sim-regresswatch-b-prereg.md:103 — a 10-digit seed
    value (a float-fragment token), not band seed 190543; that prereg
    itself documents this class ("tokens 190525–190540 appear ONLY as
    float fragments ... `1905434728` ... none names 190525–190540 as a
    seed. No reservation.").
  - No forbidden/contaminated band list exists carrying a 1905xx
    reservation (the Oct 26–27 preregs naming "forbidden" carry none).
  - Known used bands in the range, all below this band: 190501–190508
    (sim-synergydisc-b), 190509–190524 (regresswatch-b),
    190525–190532 (regresswatch-b pilot), 190533–190540 (regresswatch-b
    confirm extension — named = used).
  - **Verdict: band 190541–190548 is FRESH.** No collision; no next-band
    fallback needed.
- NOTE on the step tooling: `scripts/culpritbisect-step.sh` and
  `scripts/culpritbisect-analyze-20261113.js` hardcode the matched band
  190391–190398 (SEEDS literal / SEEDS constant). This run uses the FRESH
  band, so both run from /tmp copies with the band edited in the copy
  only (step script copy: SEEDS line → 190541,…,190548; analyzer copy:
  SEEDS constant → [190541,…,190548]; masterregress analyzer copied to
  /tmp alongside it for the analyzer's relative require). The committed
  tooling is NOT edited. The driver itself takes SEEDS from the
  environment. Per-seed JSONs in the corpora carry the seed fields —
  the durable record that the fresh band ran.

## Measurement plan

- Subject branch `transplant-8c-subject` left in place; subject
  commit hash recorded in evidence. Measured diff (src/js) verified
  byte-identical to the family's 8c hunk: the subject diff's
  added/removed lines (modulo hunk-header line numbers, which shift
  with the far end) must equal the family diff's 8c-hunk added/removed
  lines exactly (+17/−1, one file); the test file must be ABSENT from
  the subject; subject policy == far-end policy `a7ff5c51…`;
  subject native standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-8c` on the far end `203a32775`,
  via the /tmp step-script copy (fresh band, REPO passed in, fix
  standing swapped in). Expect the far end to read healthy on the fresh
  band (by analogy with its settled 4/8 on the matched band).
  Gate: the fresh baseline leg reads ≥3/8 — if it reads ≤2/8, STOP and
  report loudly (the fresh band would not replicate far-end health; no
  subject step is cut). The settled matched-band baseline (4/8,
  days 86/144/150/43/150/87/150/150) is the anchor, not this run's leg.
- SUBJECT LEG: STEP id `t8c`, via the same /tmp step-script copy.
  Seeds 190541–190548, 150d death-aware, competent verbatim own-policy
  (family touches no policy — subject policy IS the far-end policy
  `a7ff5c51…`), fix standing swapped in every step, native restored
  byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on
  the suspect list); ≥3/8 NOT-CARRIER. The task's expected NOT-CARRIER
  form is subject identical to the fresh baseline leg (count AND
  per-seed days identical); a ≥3/8 subject that differs from baseline
  is still NOT-CARRIER, with the divergence reported, never re-scored.
  Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent warning:
  the 15E p3conv arm found its dialogue paths unexercised on the
  survival band (0 resume-opener matches in 225 vetSays lines), arm 9
  found its family's new lines never fire under the competent policy,
  and 8b found 0 "lost my train of thought" / 0 "Still on" across both
  corpora. Census the 8c lines in the corpus (dry-fallback returns,
  thread-dry markers). A survival verdict proves
  survival-inertness, not dialogue behavior.

## Family-test leg (dialogue instrument — pre-registered)

The dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
cannot run whole on the 8c subject: its Dale setup calls
`Game.convoHasLiveUnfinished(vid)` (line 60), a method the 8c subject
does NOT carry (it is an 8b hunk; the 8c hunk only references it behind
a typeof guard). Attempt the proof against the subject tree (pathspec
extract to /tmp — never a full-tree extract, /tmp tmpfs is 512M) and
record the outcome: the expected result is a SETUP failure on the
missing method — a pre-existing far-end substrate gap for the 8c-only
subject, NOT a regression and NOT a pass, same class as 8b's #14
finding (that sub-test file is absent at the far end too — expect its
spawn to fail on a missing file, not a regression). The #14 check
cannot run on this substrate at all.

The 8c behavior is proven instead by the dedicated script
`scripts/test-transplant8c-dlgmore.js`, run BEFORE/AFTER (far end vs
subject, same staging, same seeds):

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
  survival verdict, per the task brief.

## Proof

`scripts/test-transplant8c.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master), narrowed-definition hunk inventory (family diff
has exactly 3 conversation.js hunks + 5 convo-dialogue.js hunks; the
8c hunk is exactly dlg 293, +17/−1; the 8b included set and the four
excluded conflict hunks are named exactly), merge-tree prediction
(marker-free 8c hunk at @@ -308, all markers confined to the four
excluded hunks, test file added cleanly, no DU), mechanism analysis
(`_sayFellBack` set by sayLine at the far end, `convoHasLiveUnfinished`
absent at the far end, dry-pool-exhaustion returns null, far-end
dlg:more returns `line: composed`), conflict-STOP rule + tooling-only
analysis (n/a — the rule here is any-conflict-stops, since the patch is
pre-filtered), verdict mapping, base state (branch-identity legs
worktree-aware per the 0215 coordinator note — they assert the arm
branch in the worktree and the merged tip on master, so the proof stays
green on master), seed-band identity (fresh band 190541–190548, step
ids t8c / ep-far-8c, subject branch transplant-8c-subject, /tmp-copy
band mechanism). Sections 7 (live subject state) and 8 (step corpora)
are added after the subject is cut and the steps run; on the
conflict-STOP path they become the live conflict record / no-corpus
sections instead.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
branch as the reused-tooling check.
`scripts/test-transplant8c-dlgmore.js` — the targeted before/after
script for the family-test leg (see above); stage 1 control run on the
far end must show the pre-fix behavior (non-zero exit), stage 2 run on
the subject must show the 8c behavior (exit 0).

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
- This arm does NOT re-judge any prior verdict (8b NOT-CARRIER,
  masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the
  rest of the bisect record) — it measures only the excluded 8c hunk.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test and dlgmore runs.
- No game-code change is committed by this arm (the subject lives on
  its own branch `transplant-8c-subject`, left in place); no
  `[needs-eyes]` applies. The arm branch commits only: prereg, proof
  scripts, evidence file, step corpora + summaries + driver logs.
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
