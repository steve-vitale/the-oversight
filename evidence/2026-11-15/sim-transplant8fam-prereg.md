# H1 transplant — family 8fam: the four CONFLICTED PR #22 hunks, theirs-resolved (arm sim-transplant8fam-a)

Run: fleshout-20261115T1425Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8fam-a` (worktree
`~/workspace/worktrees/sim-transplant8fam-a`, branch base recent master
`738ccb2c9`; substrate the far end `203a32775`).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step mechanics,
far-end baseline 4/8 with per-seed days 86/144/150/43/150/87/150/150 on the
matched band 190391–190398) + evidence/2026-11-14/sim-transplant8b-prereg.md
+ evidence/2026-11-14/sim-transplant8b.md (narrowed 8b: NOT-CARRIER 4/8,
bit-identical trajectories) + evidence/2026-11-14/sim-transplant8c-prereg.md
+ evidence/2026-11-14/sim-transplant8c.md (narrowed 8c: UNMEASURED on the
fresh-band baseline gate, 1/8 on 190541–190548; hunk behavior proven by
its dlgmore script) + evidence/2026-11-15/sim-transplant7brain-prereg.md
(gate-polarity note: the far end as healthy baseline takes the ≥3/8
PROCEED polarity, opposite to an ablation gate) + evidence/2026-11-15/
sim-scale-onramp-round-1116.md §Next blanks (3) — this arm IS that blank.
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon is invented or rewritten.

Written and committed BEFORE cutting any judged leg or running any judged
sim (proof scripts/test-transplant8fam.js, stage 1, green at prereg stage;
targeted script scripts/test-transplant8fam-conflicted.js, far-end control
run recorded in §Family-test leg).

## Supersession of the 1215Z prereg — recorded here, not buried

The task brief says "The dead 1215Z run left NOTHING for this arm — no
prereg, no commits, no files". That is FALSE in every respect, and this
arm found the truth before committing anything of its own:

- The 1215Z run (fleshout-20261115T1215Z) DID commit a prereg + proof on
  this branch: `fbae7cf31` ("transplant-8fam prereg + proof (stage 1
  green 147/147) — four conflicted PR #22 hunks as a family,
  theirs-resolved") and `4b95529b9` (hunk-1 ours-count correction;
  proof now verifies regions by anchor lines). Both commits predate
  any judged sim. The 1215Z run also cut the subject (`b6ec3c7d1`) and
  ran a baseline leg that died incomplete in a write flap (§Recovered
  1215Z leg below).
- The 1215Z prereg defines the SAME family (four conflicted hunks,
  theirs-resolved), the SAME subject, and the SAME verdict mapping
  (≤1 CARRIER / 2 AMBIGUOUS→re-run once / ≥3 NOT-CARRIER) as this
  prereg. Its measurement design differs in exactly two places: it
  measures on the MATCHED band 190391–190398 (step ids `ep-far-8fam`
  / `t8fam`, baseline leg first, NO sniff pre-check).
- This 1425Z run SUPERSEDES the 1215Z prereg on those two points only,
  because the coordinator's 1425Z brief — this run's instruction —
  explicitly mandates them: a FRESH seed band (the matched band is
  named in the brief's never-reuse list) and a 4-seed sniff
  band-health pre-check (the 8c lesson). The 1215Z prereg's
  matched-band baseline leg also died INCOMPLETE in a flap, so there
  is no completed matched-band leg to inherit. The 1215Z prereg's text
  is preserved in git history (`fbae7cf31`, `4b95529b9`); this file
  replaces it as the binding prereg for the 1425Z run.
- What is ADOPTED from the 1215Z run (not re-done): the family
  definition, the subject commit `b6ec3c7d1` (verified hunk-by-hunk in
  §Subject adoption), the hunk-1 ours-count correction (ours 9, not 6
  — merge-tree display elides 3 middle comment lines; see §The four
  conflicted hunks), the subject-construction procedure (recorded in
  §Subject adoption as provenance), and the §10 intermediate-state
  guard shape (adopted into this proof).
- What is NEW in this prereg: the fresh band 190589–190596, the sniff
  leg + tripwire, the distinct step ids, the family-definition
  discrepancy resolution, and the recovered-leg record. If the
  coordinator intended the 1215Z matched-band design to stand, this
  prereg's verdict is the fresh-band answer, not the matched-band one
  — flagged here, not buried.

## The question

Does the remaining unmeasured piece of origin family 8 — the four
CONFLICTED hunks of merge `713eb7545` (PR #22 live-thread-dry-engage),
theirs-resolved onto the far end `203a32775` — alone collapse the far
end (GOOD 4/8 on the matched band) toward the merge's 1/8? Narrowed
family 8b measured the three clean hunks NOT-CARRIER (bit-identical
trajectories); narrowed family 8c measured the excluded second dlg:more
hunk UNMEASURED-on-gate, then NOT-CARRIER on the matched-band rerun
(fleshout-20261115T0427Z, 4/8 bit-identical, merged 73a7f8fa8 — NOT
re-measured here). The four conflicted hunks have NEVER been measured in
any form: the full-family-8 arm stopped on conflict-STOP at the
same-lines-rewritten wall, and no narrowed arm has touched them. This arm
measures ONLY those four hunks, theirs-resolved. Nothing 8b or 8c already
measured, nothing else from the merge.

## Family-definition discrepancy — resolved here, flagged for overrule

The task brief for this arm is internally inconsistent, and the prereg
records the resolution rather than silently picking a side:

- The brief's TITLE defines the family as "the four CONFLICTED PR #22
  hunks as a family, theirs-resolved onto the far end". The tracker
  blank this arm fills (round-1116 §Next blanks (3)) says the same:
  "the four conflicted PR #22 hunks as a family".
- The brief's step 2 parenthetical says "the family is the three clean
  hunks from 8b PLUS the excluded second dlg:more hunk" — that is the
  four CLEAN hunks (8b ∪ 8c), a different family: none of those four
  hunks conflicted, and "theirs-resolved" is meaningless for them
  (they apply cleanly).
- The merge is the authority (brief step 2: "verify each hunk's identity
  against the merge before defining it"), and the merge + the 8b
  evidence's conflict list identify the conflicted four exactly (§Family
  identity below). The pre-existing subject branch
  `transplant-8fam-subject` (commit b6ec3c7d1, built 2026-11-15 13:13:50Z
  during the 1215Z run) implements exactly the conflicted four
  theirs-resolved, verified hunk-by-hunk in §Subject adoption below.

RESOLUTION: this arm measures the four CONFLICTED hunks,
theirs-resolved, per the title + tracker blank + merge + existing
subject. The step-2 parenthetical is treated as a coordinator error
describing the wrong four. If the coordinator intended the clean-four
union (8b ∪ 8c), this prereg's verdict does not answer it, and a fresh
prereg + arm would be needed for that family — flagged here, not buried.
The clean-four union is NOT measured by this arm under either reading
of the brief's step 2, because the subject that exists and the blank
that names this arm both point at the conflicted four.

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
  and IS an ancestor of master (the origin line was merged to
  master after the far end; the family lives on master today).

## The four conflicted hunks (family-diff numbering; merge-tree in parens)

The family diff has EXACTLY 8 hunks: 3 in conversation.js + 5 in
convo-dialogue.js. Four are clean (the 8b three + the 8c one); four are
conflicted (ALL the conflict markers in the merge-tree output sit
inside these four — verified by this arm, §Merge-tree pre-check).
THIS arm includes ONLY the four conflicted hunks, theirs-resolved:

1. `src/js/conversation.js @@ -7017,7 +7095,13 @@` (merge-tree
   `@@ -7167,6 +7246,16 @@`) — lesson-outcome / diegetic-act.
   Family +7/−1: the `plantTeachOutcome` const (`choiceId === 'teach'`)
   + the PLANT TEACH comment + the sayLine call with
   `diegeticAct: inviteOutcome || lessonOutcome || plantTeachOutcome`.
   Merge-tree region: ours 9 lines, theirs 8 lines. CORRECTION
   (adopted from the 1215Z run, `4b95529b9`): the merge-tree display
   shows only 6 of the 9 ours lines — it ELIDES the three middle lines
   of the 6-line SECRET REPLIES comment block (unchanged context
   between the two marker insertions). Ours/theirs counts for hunk 1
   must be read from the far-end file (9) and the merge file (8), not
   from the merge-tree display.
2. `src/js/convo-dialogue.js @@ -444,6 +475,10 @@` (merge-tree
   `@@ -448,9 +479,34 @@`) — favor settlement. Family +4/−0: the
   LIVE UNFINISHED comment + the `liveUnfinished` const
   (`unfinishedOuting || deferredAfterResume ||
   convoHasLiveUnfinished(vid)` behind a typeof guard) + the guard
   change on the settled-favor early-out (`if (!unfinishedOuting &&
   !deferredAfterResume && settledFavor && …)`). Merge-tree region:
   ours 3 lines, theirs 22 lines. NOTE: the family-diff hunk is only
   +4/−0 because `pinnedFavor` / `ledgerFavor` / `helpFavor` /
   `unfinishedOuting` / `deferredAfterResume` already existed at the
   first parent; the far end later rewrote that whole block down to 3
   simplified lines, so taking THEIRS restores those pre-existing
   lines as well — the subject diff for this hunk is +22/−3, NOT
   +4/−0. The proof verifies each region against the merge's region
   text, not against the family-diff hunk lines.
3. `src/js/convo-dialogue.js @@ -495,10 +530,25 @@` (merge-tree
   `@@ -497,7 +553,33 @@`) — favor-line sayLine. Family +19/−4:
   `helpStructural = !!liveUnfinished`, the would-block pre-check
   (honest unfinished name instead of letting sayLine dry), and the
   structural sayLine call. Merge-tree region: ours 1 line, theirs
   23 lines.
4. `src/js/convo-dialogue.js @@ -510,18 +560,30 @@` (merge-tree
   `@@ -505,7 +587,34 @@`) — blocked-repeat. Family +17/−5:
   `if (!said || c._sayFellBack)`, the UNFINISHED HELP BLOCKED block
   (name the concrete unfinished work structurally), and the
   fell-back early return (dry already spoken — no second line).
   Merge-tree region: ours 1 line, theirs 24 lines.

EXCLUDED: the four clean hunks — the 8b three (conversation.js new
methods `@@ -1163,6 +1163,55 @@`, goon delivery
`@@ -5995,9 +6044,38 @@`, dlg:more pre-check
`@@ -273,15 +273,30 @@`) and the 8c one (dlg:more continuation
`@@ -293,11 +308,27 @@`) — and the test file
`scripts/test-live-thread-engage-dry-20261108.js` (NOT in the subject:
the subject carries no test file). The subject diff must be exactly the
four conflicted hunks theirs-resolved: two files, no test file.

## Subject adoption (the 1215Z run's subject — verified, NOT re-cut)

The task brief says "The dead 1215Z run left NOTHING for this arm — no
prereg, no commits, no files". That is WRONG about the subject: the
branch `transplant-8fam-subject` exists with one commit on the far end,
`b6ec3c7d1c700c3cab26c6bd578074588f7901f5` (2026-11-15 13:13:50Z,
"transplant-8fam-subject: four conflicted PR #22 hunks
(theirs-resolved) onto far end 203a32775 (+8/-9, +69/-5; no test file;
measurement instrument, never land)"), and the worktree holds its
incomplete baseline leg (`evidence/2026-11-13/culpritbisect-a-ep-far-8fam-driver.log`
+ `evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8fam/`, step id
`ep-far-8fam`, matched band — see §Recovered 1215Z leg below). The 1215Z
run ALSO left a committed prereg + proof on this branch (`fbae7cf31`,
corrected `4b95529b9`) — see §Supersession above; what it left NOTHING
of is the evidence file, which is this arm's work. The subject commit is
ADOPTED, not re-cut (8b/6b3way adoption precedent: verify, don't redo).
Construction procedure (recorded in the 1215Z prereg as the provenance
of `b6ec3c7d1`, verified by this arm only through its RESULT below):
`git cherry-pick -m 1 713eb7545` onto the far end (expected conflict,
rc=1, markers in exactly the two predicted files), each of the 4 marker
regions resolved by taking THEIRS verbatim with a deterministic script,
the staged test file removed, and the 4 auto-merged clean hunks
reverse-applied from the family diff before the subject commit.
This arm verified the adoption at run start, before any sim:

- Parent is the far end `203a32775` (exactly one commit on top).
- Diff vs the far end: exactly 2 files, `src/js/conversation.js`
  +8/−9, `src/js/convo-dialogue.js` +69/−5 (total +77/−14). No test
  file. No other file touched.
- Hunk-by-hunk theirs-resolution check (merge-side region text =
  context + added lines of each family hunk, searched verbatim in the
  subject file):
  - Hunk 2 (favor settlement): region verbatim in the subject.
  - Hunk 3 (favor-line sayLine): region verbatim in the subject.
  - Hunk 4 (blocked-repeat): region verbatim in the subject.
  - Hunk 1 (lesson-outcome): region verbatim EXCEPT its first context
    line — the merge has `// same answer from another person, not a
    parrot bug.` while the subject keeps the far end's rewording
    `// line is the same lesson from another person, not a parrot
    bug.` (a far-end later comment rewording, outside the hunk's
    changed lines — correctly retained by theirs-resolution, which
    takes the merge's side only inside the conflicted region). All 6
    added lines of the hunk are byte-identical in the subject.
  - Added-line multiset: every added line of the four family
    conflicted hunks appears in the subject's added lines (zero
    family-added lines missing). The subject's EXTRA added lines are
    first-parent context lines the far end had since removed or moved
    (e.g. `const pinnedFavor`, `const unfinishedOuting`, the
    `deferredAfterResume` definition) — restored wholesale by the
    theirs-resolution of the region, as expected.
- Subject policy == far-end policy `a7ff5c51…`; subject native
  standing == far-end standing `75762cb2…` (verified by the proof's
  §8 legs).
- The theirs-resolution side effects, stated up front (not
  discovered mid-run): (a) the far end's `secretOutcome` diegetic-act
  treatment (journey-deepening r120, postdates the merge) is REMOVED
  from the lesson-outcome region — the subject no longer treats
  `secret:` replies as diegetic acts; (b) the far end's favor
  settlement region is replaced wholesale by the merge's region text,
  reintroducing the `unfinishedOuting` / `deferredAfterResume`
  computations the far end had restructured away. Both are what
  "theirs-resolved" means — the merge's side wins inside the
  conflicted regions, including where it reverts later far-end work.
  The proof pins both facts (§4/§8).

CONFLICT-STOP RULE (binding on this arm, already discharged): the
subject exists as a theirs-resolution built by the 1215Z run; THIS
arm's check is the verification above. If any verification item had
failed (wrong parent, wrong files, a hunk region not verbatim, a
family-added line missing), the arm would STOP, report UNMEASURED with
the exact mismatch list, and cut NO subject of its own — no
hand-resolution, no silent hunk-drop, no rebuilding the subject by
hand. The verification passed on every item, so the arm proceeds with
the adopted subject.

## Recovered 1215Z leg (INCOMPLETE — recorded, not adopted, not re-run)

Step `ep-far-8fam` (matched band 190391–190398, far end, fix standing
swapped in, policy a7ff5c51) ran 13:21–13:57Z during the 1215Z run and
died in a WRITE FLAP: seeds 190391/190392 wrote full per-seed JSONs
(13:23, 13:24); seeds 190393–190398 left only 0-byte
`.tmp-6927` files (13:30–13:57, ~5–6 min apart — the driver's
writeRobust retrying each write before giving up). The driver log's
per-seed lines record all 8 sims completing in-process with errors 0:
days 86/144/150/43/150/87/150/150 — EXACTLY the settled far-end
baseline (4/8 survived). The analyzer reported INCOMPLETE (missing
seeds 190393–190398); no summary JSON exists. Per the guards, a step
with missing per-seed files is INCOMPLETE, not a verdict. This leg is
NOT adopted as this arm's baseline (it is on the matched band, which
this arm is forbidden to reuse, and it is incomplete) and its files are
LEFT ALONE (per the task brief — do not delete another run's files).
This arm's step ids are deliberately distinct (`ep-far-8fam-sniff`,
`ep-far-8fam-fresh`, `t8fam`) so no step overwrites the 1215Z log or
corpus directory. The 1215Z leg's per-seed outcomes corroborate the
settled baseline a fourth time (from log lines, not from a corpus —
reported as corroboration, not as a judged leg).

## Merge-tree pre-check (run before any judged leg)

`git merge-tree 9f388a524 203a32775 713eb7545` (re-run by THIS arm at
run start; the proof re-runs it live):

- The four conflicted hunks carry ALL the conflict markers:
  conversation.js 3 markers (1 hunk), convo-dialogue.js 9 markers
  (3 hunks). No other markers anywhere in the output.
- The four clean hunks appear marker-free: conversation.js
  `@@ -1163,6 +1163,55 @@`, `@@ -6069,9 +6118,38 @@`;
  convo-dialogue.js `@@ -288,15 +288,30 @@`,
  `@@ -308,11 +323,27 @@`.
- `scripts/test-live-thread-engage-dry-20261108.js` — "added in
  remote", merges cleanly (new file, no far-end counterpart).
- NO 'merged' sections for the conflicted files (a conflicted file's
  clean hunks ride inside its 'changed in both' section), NO
  delete/modify (DU) entries, NO other changed-in-both file.

## Mechanism analysis (pre-registered, from source reads at the far end — not a verdict)

What the four conflicted hunks CAN do alone on far-end substrate
(the 8b methods are NOT in this subject — every
`convoHasLiveUnfinished` / `convoUnfinishedEngageLine` reference in
the subject sits behind a `typeof ... === 'function'` guard, which is
false on this substrate, so those blocks are inert and fall back to
`convoSelfRepeatLine`):

- (a) Hunk 1 (lesson-outcome): the `plantTeachOutcome` split is
  BEHAVIORALLY IDENTICAL to the far end — the far end's
  `lessonOutcome` already includes `choiceId === 'teach'`, so
  `inviteOutcome || lessonOutcome || plantTeachOutcome` (merge) ≡
  `inviteOutcome || lessonOutcome` (far end). The hunk's ONLY live
  effect alone is the REMOVAL of `secretOutcome`: a `secret:` reply
  whose react line is run-ledger-blocked now DRIES (sayLine's
  `diegeticAct` exemption no longer applies) where the far end
  delivered it. Reachable only when a secret answer's react is
  ledger-blocked in play.
- (b) Hunk 2 (favor settlement): LIVE — the subject introduces the
  `unfinishedOuting` (water_haul / forage_help outing unreturned)
  and `deferredAfterResume` (resume claimed unfinished debt/favor,
  ask_favor not yet pinned) computations and guards the settled-favor
  early-out with them. A settled favor with a live unfinished outing
  or a deferred resume no longer gets "It's already handled" — the
  sitting falls through to engageBeat. `convoGetFavor` EXISTS at the
  far end (the ledger lookup the hunk uses); `c.want?.favor` is
  first-parent context restored by the resolution.
- (c) Hunk 3 (favor-line sayLine): PARTIALLY LIVE — `helpStructural`
  is true exactly when `liveUnfinished` is true, and `liveUnfinished`
  is live through its `unfinishedOuting` / `deferredAfterResume`
  terms (the `convoHasLiveUnfinished` term is inert). The would-block
  pre-check is live (`convoWouldBlock` EXISTS at the far end); when
  it fires, the honest line falls back to `convoSelfRepeatLine`
  (the `convoUnfinishedEngageLine` term is inert). The structural
  sayLine call is live whenever `helpStructural` is true.
- (d) Hunk 4 (blocked-repeat): LIVE — `if (!said || c._sayFellBack)`
  treats a dry-fallback return as blocked (`_sayFellBack` IS set by
  sayLine at the far end, pre-existing mechanism); the UNFINISHED
  HELP BLOCKED block is live through `liveUnfinished`'s live terms;
  the fell-back early return (dry already spoken — no second line,
  `line: said` which is null) is live whenever the dry pool is
  exhausted (the only null-with-flag path: `convoDryLine` returns
  null past 9 uses).
- Consequence, stated up front: unlike 8b (bit-identical
  trajectories — the repair never fired under the competent policy)
  and 8c (dry-branch block inert without the 8b methods), this
  subject HAS live paths on far-end substrate — Help/favor exchanges
  with unfinished outings, blocked Help favor lines, and blocked
  secret answers can all behave differently. Whether the competent
  bot ever drives those paths in sim is what the legs measure; a
  survival verdict proves survival-inertness (or not), never
  dialogue behavior — the family-test leg below is the dialogue
  instrument.

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190589–190596** (8 seeds).
- Freshness check (per local_seed_band_freshness skill), scope:
  `evidence/*/sim-*-prereg.md` (every dated prereg) + `evidence/*/sim-*.md`
  evidence files. Method: word-boundary grep for each exact 6-digit
  seed `190589`–`190596`.
  - Result: ZERO hits for every seed in the band, in any prereg or
    evidence file. The band is FRESH. No collision; no next-band
    fallback needed.
  - Neighbors, all used and avoided: 190541–190548 (8c fresh band),
    190561–190568 (forbidden per the task brief), 190581–190588 (the
    sibling 7redef arm's band THIS run — forbidden per the task
    brief), 190601–190616 (cut2confirm / cut7confirm / collapseband3,
    16-seed band). Below: 190501–190540 in the regresswatch /
    synergydisc bands. The task's forbidden list is honored in full:
    190391–190398, 190541–190548, 190561–190568, 190581–190588,
    100301–100316, 100401–100416, 100421–100436, 73671–73678 — none
    overlaps 190589–190596.
- SNIFF band: the first 4 seeds of the band, **190589–190592**.
- NOTE on the step tooling: `scripts/culpritbisect-step.sh` and
  `scripts/culpritbisect-analyze-20261113.js` hardcode the matched
  band 190391–190398 (SEEDS literal / SEEDS constant). This run uses
  the FRESH band, so both run from /tmp copies with the band edited
  in the copy only (step script copy: SEEDS line → the fresh band;
  analyzer copy: SEEDS constant → the fresh band; sniff analyzer
  copy: SEEDS constant → the 4 sniff seeds; masterregress analyzer
  copied to /tmp alongside them for the analyzer's relative require).
  The committed tooling is NOT edited. The driver itself takes SEEDS
  from the environment. Per-seed JSONs in the corpora carry the seed
  fields — the durable record that the fresh band ran.

## Measurement plan

- Subject branch `transplant-8fam-subject` left in place (adopted
  commit b6ec3c7d1); subject commit hash recorded in evidence.
  Measured diff verified per §Subject adoption above (region-text
  verification, not a re-cut).
- SNIFF LEG FIRST: STEP `ep-far-8fam-sniff` on the far end
  `203a32775`, via the /tmp step-script copy (4 sniff seeds,
  fix standing swapped in). Sniff rule (pre-registered): 0/4
  survived → STOP, report UNMEASURED-band-health, investigate, do
  NOT cut a baseline leg and do NOT run a subject leg; ≥1/4 survived
  → PROCEED to the full baseline leg. Rationale (the 8c lesson, made
  quantitative): the matched band's first 4 seeds read 1/4 survived
  (86 lost, 144 lost, 150 survived, 43 lost) while the 8c fresh
  band's first 4 read 0/4 (122 lost, 134 lost, 150 lost, 92 lost) —
  the 0/4 bar is the catastrophic tripwire that would have stopped
  8c's fresh band before its 27-minute leg, while letting the healthy
  matched band through. False-stop risk at the 3/8 boundary: a band
  with exactly 3 survivors among 8 has P(0 in a given 4-subset) =
  C(5,4)/C(8,4) ≈ 7%; at 4/8 it is ≈ 1.4%. A false STOP is recorded
  as UNMEASURED-band-health with the investigation note, never as a
  verdict on the family. The sniff is a tripwire, not a judge — the
  ≥3/8 baseline gate below remains the judge.
- BASELINE LEG: STEP `ep-far-8fam-fresh` on the far end `203a32775`,
  via the /tmp step-script copy (fresh band, fix standing swapped
  in). Gate (pre-registered, PROCEED/STOP polarity — the far end is
  the healthy baseline here, same polarity as 8b/8c, OPPOSITE to the
  7brain ablation gate): the baseline leg reads ≥3/8 → PROCEED to
  the subject leg; ≤2/8 → STOP and report UNMEASURED (the fresh band
  would not replicate far-end health; no subject leg is cut). The
  settled matched-band baseline (4/8, days
  86/144/150/43/150/87/150/150) is the anchor, not this run's leg.
- SUBJECT LEG: STEP id `t8fam`, via the same /tmp step-script copy,
  on the adopted subject commit b6ec3c7d1. Seeds 190589–190596, 150d
  death-aware, competent verbatim own-policy (family touches no
  policy — subject policy IS the far-end policy `a7ff5c51…`), fix
  standing swapped in every step, native restored byte-identical
  afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on
  the suspect list); ≥3/8 NOT-CARRIER. The expected NOT-CARRIER form
  is subject identical to the fresh baseline leg (count AND per-seed
  days identical); a ≥3/8 subject that differs from baseline is
  still NOT-CARRIER, with the divergence reported, never re-scored.
  Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent
  warning: the 15E p3conv arm found its dialogue paths
  unexercised on the survival band (0 resume-opener matches in
  225 vetSays lines), arm 9 found its family's new lines never
  fire under the competent policy, and 8b found 0 "lost my train of
  thought" / 0 "Still on" across both corpora. Census the 8fam
  lines in the corpus (dry-fallback returns, "already handled",
  thread-dry markers). A survival verdict proves
  survival-inertness, not dialogue behavior.

## Family-test leg (dialogue instrument — pre-registered)

The dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
cannot run whole on the 8fam subject: its Dale setup calls
`Game.convoHasLiveUnfinished(vid)`, a method the 8fam subject does
NOT carry (it is an 8b hunk; the conflicted hunks only reference it
behind typeof guards). Attempt the proof against the subject tree
(pathspec extract to /tmp — never a full-tree extract, /tmp tmpfs is
512M) and record the outcome: the expected result is a SETUP failure
on the missing method — a pre-existing far-end substrate gap for the
conflicted-only subject, NOT a regression and NOT a pass, same class
as 8c's finding (that sub-test file
`scripts/test-favor-debt-help-coherence-20261108.js` is absent at the
far end too — expect its spawn to fail on a missing file, not a
regression). The #14 check cannot run on this substrate at all.

The conflicted hunks' behavior is proven instead by the dedicated
script `scripts/test-transplant8fam-conflicted.js`, run BEFORE/AFTER
(far end vs subject, same staging, same seeds), staging through
`convoTurn` directly (the dlgmore script's pattern):

- Case H-settled (control — no change expected): want `ask_favor`,
  settled favor in the ledger, NO unfinished outing, NO deferred
  resume. BOTH far end and subject answer "It's already handled."
  (the settled-favor early-out fires on both).
- Case H-unfinished (hunk 2 discriminator): want `ask_favor`,
  settled favor in the ledger, PLUS a live unfinished water outing
  (`helpFavor` water_haul, waterRun unreturned). FAR END (control):
  "It's already handled" (the unguarded settled check fires).
  SUBJECT: falls through — no "already handled" line (the
  `!unfinishedOuting` guard blocks the early-out).
- Case B-fellback (hunk 4 discriminator): `dlg:help` with the favor
  line ledger-blocked AND the dry pool exhausted (`c.dryLines = 9`),
  so sayLine returns null with `_sayFellBack` set. FAR END (control):
  falls through to the dup repeat ("I just said…" line spoken).
  SUBJECT: fell-back early return — `r.line === null`, no second
  line emitted.
- Case L-secret (hunk 1 discriminator): `secret:promise` answer with
  the react line poisoned into the run ledger. FAR END (control):
  the react is delivered (diegetic act — the ledger block is
  exempted). SUBJECT: the react dries (no `secretOutcome` exemption
  — the transcript holds a dry line instead).
- The script exits 0 iff the subject behaviors hold for all staged
  cases; it is EXPECTED to exit non-zero on the far end (the control
  proving the hunks are what changes the behavior) and 0 on the
  subject. Both runs are recorded in the evidence file. Green /
  not-green is reported SEPARATELY from the survival verdict, per
  the task brief. If a case proves unstageable, it is recorded as a
  documented gap (static region verification in the proof covers the
  hunk identity either way) — never silently dropped, never scored
  as a pass.

## Proof

`scripts/test-transplant8fam.js` (stage 1, before any judged leg):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master), conflicted-hunk inventory (family diff has
exactly 3 conversation.js hunks + 5 convo-dialogue.js hunks; the
conflicted four are conv 7017 + dlg 444/495/510 with per-hunk +/−
7/1, 4/0, 19/4, 17/5; the clean four partition the rest exactly;
the family-definition discrepancy is named and resolved per §Family-
definition discrepancy), merge-tree prediction (marker-free clean
hunks, all 12 markers confined to the four conflicted hunks, test
file added cleanly, no DU), mechanism analysis (`_sayFellBack` set
by sayLine at the far end, `convoHasLiveUnfinished` /
`convoUnfinishedEngageLine` absent at the far end AND at the
subject, `convoWouldBlock` / `convoGetFavor` present at the far end,
far-end `lessonOutcome` already includes `teach`, far-end
`secretOutcome` present, dry-pool-exhaustion returns null),
conflict-STOP / adoption rule + verdict mapping + sniff mapping +
gate polarity, base state (branch-identity legs worktree-aware per
the 0215 coordinator note — they assert the arm branch in the
worktree and the merged tip on master, so the proof stays green on
master), seed-band identity (fresh band 190589–190596, sniff step
ep-far-8fam-sniff, baseline step ep-far-8fam-fresh, subject step
t8fam, subject branch transplant-8fam-subject, /tmp-copy band
mechanism). Sections 8 (live subject state) and 9 (step corpora) are
state-aware: §8 asserts the adopted subject (parent far end, exactly
2 files, numstat +8/−9 +69/−5, region-text verification per hunk,
no test file, policy/standing match); §9 takes the sniff-STOP /
gate-STOP / full-legs branch according to what ran, with the
intermediate-state guard (every summary read preceded by an
`fs.existsSync` check on the SAME path in the SAME branch; the
sniff-only and baseline-only states are their own passing branches —
the 1116Z fix, adopted from the 1215Z proof's §10).
`scripts/test-culpritbisect-a.js` (116 legs) re-run from a /tmp copy
as the reused-tooling check (the file predates this arm's far-end
base, so it is not committed on this branch — run, not vendored).
`scripts/test-transplant8fam-conflicted.js` — the targeted
before/after script for the family-test leg (see above); stage 1
control run on the far end must show the pre-fix behavior (non-zero
exit), stage 2 run on the subject must show the conflicted behavior
(exit 0).

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
- This arm does NOT re-judge any prior verdict (8b NOT-CARRIER, 8c
  NOT-CARRIER on the matched-band rerun / UNMEASURED on the fresh-band
  gate, masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and
  the rest of the bisect record) — it measures only the four
  conflicted hunks theirs-resolved.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-8fam-subject`, left in
  place); no `[needs-eyes]` applies. The arm branch commits only:
  prereg, proof scripts, evidence file, step corpora + summaries +
  driver logs. The 1215Z run's `ep-far-8fam` artifacts are left
  untouched (different step ids; no overwrite).
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect / transplant arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT rolled.
- Flap note: the flap-watch log is read at run start; prereg + tooling
  are written and committed only after a probe succeeds. If the flap
  returns mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial. The 1215Z run's baseline
  leg died in a flap window ~13:30–13:57Z today (6 per-seed files
  lost to 0-byte .tmp files) — this arm's legs run after that window
  cleared.
- The worktree's untracked `evidence/2026-11-13/` dir (the 1215Z
  run's driver log + incomplete corpus) is another run's files: left
  alone, never deleted, never committed by this arm except the new
  step artifacts this arm itself writes (distinct step ids, distinct
  filenames). The arm branch's `git status` is expected to show that
  dir as untracked throughout the run.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
