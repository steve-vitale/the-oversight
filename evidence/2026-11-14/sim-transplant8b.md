# H1 transplant — narrowed family 8b: clean-hunks subset of PR #22 (arm sim-transplant8b-a)

Run: fleshout-20261114T2315Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-14/sim-transplant8b-prereg.md (committed BEFORE
cutting the subject or running any judged sim).
Arm branch: `sim-transplant8b-a` (worktree
`~/workspace/worktrees/sim-transplant8b-a`, base master 910bff7f4 at run
start — the batch-ship version bump).
Subject branch: `transplant-8b-subject`, commit
05307dbcdd5baa35fbd8cd5e61b142ffe9bf48f6 (left in place, one commit on
the far end 203a32775).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). No canon invented or rewritten.

## Verdict: NOT-CARRIER — survived 4/8

The narrowed family 8b does NOT collapse the far end. Baseline leg
ep-far-8b reads survived 4/8; subject leg t8b reads survived 4/8 on the
identical seeds, with per-seed days, death counts, kill calls, pantry
and every other recorded field byte-identical (the only differing field
in the full per-seed JSONs is `anchorCommit`, which is the branch
itself). The clean hunks are survival-inert on this band: the
dialogue repair never fires under the competent policy, so the
trajectories do not diverge at all.

## Adoption note (this run adopted a stranded run)

The previous run died mid-flight after committing the prereg + proof
(stage 1, 100/100, then 108/108) and cutting the subject, leaving:

- A far leg 6/8 complete (seeds 190391–190396, step ep-far-8b,
  standingFix f8fda4295a99 swapped in, policy a7ff5c51). Verified:
  all 6 JSONs parse, instrument errors 0, per-seed days
  86/144/150/43/150/87 — exactly the first six of the settled
  baseline days. The step id ep-far-8b is fresh (no prior corpus
  carries it); the seed band 190391–190398 is the program's matched
  band by design (bisect prereg), not a freshness violation.
  Per the committed prereg's 8-seed definition, this adoption
  EXTENDED the band to 8 by running the two missing far-leg seeds
  (190397, 190398) on the identical setup — both read 150d survived,
  completing the leg at 4/8.
- Uncommitted `src/js/standing.js`: judged, not carried blindly.
  Its sha256 is exactly f8fda4295a99 — the bisect fix swapped in for
  the far leg, and the diff vs the far-end native is exactly the
  7-line ROSTER CHECK insertion. The task brief's "master already
  contains this check" is true of master but NOT of the far end
  (203a32775), which lacks it; the swap is a step mechanic, not a
  commit. It was kept in place for the remaining far-leg seeds and
  the subject leg, then restored byte-identical to the native
  far-end standing (sha256 75762cb2) after the legs. No redundant
  change was committed. One-line reason: fix-swap residue from the
  died-mid-leg run, restored after use.
- Four untracked harness scripts (culpritbisect driver/analyzer,
  masterregress analyzer, vetfirst instrument): all four verified
  byte-identical to master (shas edf27ac1/d8efc220/24712a02/311f105b)
  — duplicates of master content, used as scratch only, DELETED
  (not committed) before checking the arm branch back out.
- The subject branch already existed with the exact three included
  hunks (verified: diff hunks @@ -1163,6 +1163,55 @@,
  @@ -6069,9 +6118,38 @@, @@ -288,15 +288,30 @@; test file blob
  a0161cc9; parent is the far end). No subject re-cut was needed.
- /tmp filled (512M tmpfs, 100%) during a full-tree `git archive`
  extract for the family-test run; recovered by re-extracting with
  a pathspec (src/scripts/index.html/manifest.json/sw.js/
  build-source.json, 199M) and deleting the partial tree. No work
  was lost; the sim corpora live on /home, never /tmp.

## The question

Does origin family 8's clean-hunks subset — narrowed family 8b,
coordinator-defined in the 0608Z round (arm 3: full family 8 stopped
on conflict-STOP, sixth family on the same-lines-rewritten wall) —
alone collapse the far end `203a32775` (GOOD 4/8) toward the merge's
1/8? Family 8 = merge `713eb7545` "Merge pull request #22
live-thread-dry-engage" (dialog-coherence audit defect #4: live
unfinished Help/engage must not dry to "lost my train of thought").

## Family 8b definition (coordinator-defined, prereg-fixed)

Included (three clean hunks + test file):

- `src/js/conversation.js @@ -1163,6 +1163,55 @@` — new methods
  `convoHasLiveUnfinished` + `convoUnfinishedEngageLine`.
- `src/js/conversation.js @@ -6069,9 +6118,38 @@` — goon
  live-unfinished delivery.
- `src/js/convo-dialogue.js @@ -288,15 +288,30 @@` — dlg:more
  live-unfinished pre-check.
- `scripts/test-live-thread-engage-dry-20261108.js` (new file, blob
  a0161cc9) — the family's proof for the clean hunks.

Excluded: all four conflicted hunks (lesson-outcome/diegetic-act,
favor settlement, favor-line sayLine, blocked-repeat) AND the
unlisted clean second dlg:more hunk (`@@ -293,11 +308,27 @@`,
`_sayFellBack` early-return + thread-dry unfinished-name block) —
clean but NOT in the coordinator's ONLY list. Consequence, stated
in the prereg: the subject carries the pre-check and the
`if (said && !c._sayFellBack)` guard, but NOT the fell-back early
return or the dry-branch unfinished-name block.

## Baseline leg ep-far-8b (far end, fix standing swapped in)

Gate: reproduce the settled far end at ≥3/8 or stop. PASSED.

- Survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 —
  exactly the masterregress far leg.
- Rank: REGIONAL_INTACT (regional 7/8). Wall: wins 0, national 0,
  table 0, wave5 2/8, wave4 8/8, median 150d, deaths 629, standing
  150–325.
- Death causes (629): villager combat 267, combat 130, expedition
  126, the wild 74, monster 13, ambush 3, contest 3, wound-fever 3,
  Spool 2, a stranger 2, the arena 2, starvation 1, the night 1,
  Big-Eyes 1, alien 1.
- Instrument errors 0. Analyzer exit 0. Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-8b-summary.json;
  corpus evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8b/
  (8 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-ep-far-8b-driver.log.

## Subject leg t8b (transplant-8b-subject, fix standing swapped in)

- Survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 —
  identical to the baseline leg seed-for-seed.
- Rank: REGIONAL_INTACT (regional 7/8). Wall: wins 0, national 0,
  table 0, wave5 2/8, wave4 8/8, median 150d, deaths 629, standing
  150–325. Death causes identical counts to the baseline (629).
- Instrument errors 0. Analyzer exit 0. Summary:
  evidence/2026-11-13/culpritbisect-a-t8b-summary.json; corpus
  evidence/2026-11-13/perseed-culpritbisect-a-t8b/ (8 per-seed
  JSONs); driver log evidence/2026-11-13/culpritbisect-a-t8b-driver.log.
- Deep comparison (all 8 seeds, full per-seed JSONs): the ONLY
  differing field is `anchorCommit` (far end vs subject commit).
  Days, end reasons, death lists, kill calls, pantry, vetSays,
  daily snapshots — all byte-identical. The subject's trajectories
  do not diverge from the far end's at all.

Verdict mapping (prereg): ≥3/8 → NOT-CARRIER. No re-run (2/8
ambiguity rule not triggered).

## The family's own test on the subject

`scripts/test-live-thread-engage-dry-20261108.js` run against the
subject tree (pathspec extract to /tmp, since the full-tree extract
filled /tmp):

- Dale goon shape: coherent (non-dry) follow-through — GREEN.
- Dale-honest shape: names the unfinished work ("Yeah — their
  past. Let me pick that up.") — GREEN.
- Resume (unfinished plant lesson) engage: coherent (non-dry)
  follow-through, opener "Honestly, we never finished talking
  about that plant lesson" — GREEN.
- The parent runner reports 1 FAILURE: favor/debt Help coherence
  (#14) — the sub-test file
  `scripts/test-favor-debt-help-coherence-20261108.js` is ABSENT
  at the far end and at the subject (MODULE_NOT_FOUND on spawn).
  The file exists at the merge 713eb7545 and on master (blob
  02d9ccb9) — it predates the far end on another line. This is a
  pre-existing far-end substrate gap, NOT an 8b regression: no 8b
  hunk touches favor/debt Help, and the three #4 shapes the family
  actually tests are green. The #14 check cannot run on this
  substrate at all.

So the code works when a player actually holds a live unfinished
conversation — the sims simply never put the bot in that seat (see
sense-testing).

## Sense-testing (SENSE-TESTING LAW)

Census of the 8b lines in both corpora (vetSays, 225 lines each):

- Far leg: "lost my train of thought" 0, "Still on" 0.
- Subject leg: "lost my train of thought" 0, "Still on" 0.
- vetSays byte-identical between the legs on sampled seeds
  (190391, 190393, 190397) — as expected from the bit-identical
  trajectories.

What the villagers do read as: door fights are named group efforts
("Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4 put
down, 1 driven off. ... are hurt."), water runs are voiced with
real returns ("Off to the well — back with a full skin", "+2
clean"), foragers come back unprompted with food. Nothing robotic
in the narration; nothing repeated verbatim across seeds beyond the
shared event grammar.

What it means: the competent bot never opens a Help/engage/goon
exchange on a live unfinished thread, so the repair has no path to
act in sim — the same pattern as arm 9 (family lines never fire
under the competent policy) and 15E p3conv (0 resume-opener matches
in 225 vetSays lines). A survival verdict proves
survival-inertness, not dialogue behavior; the dialogue behavior is
proven only by the family's own test above (green on the subject).
The excluded continuation hunk (the `_sayFellBack` early-return +
dry-branch unfinished-name block) is a candidate follow-up if a
future arm wants to measure the full repair — it would need its own
prereg + coordinator decision (a further narrowed 8c), NOT this
arm's call.

## Village assessment (plain words)

Four of eight villages live to day 150; four die at the door or on
the road. The ones that live reach the region (7/8 regional) but
none reach national, the table, or a win — the scale wall stands
exactly where the far end left it. Two villages unlock wave 5; all
eight unlock wave 4. People die fighting (267 villager-combat
deaths, 130 combat, 126 expedition) and almost never of hunger
(1 starvation death in 629). The village that dies on day 43 never
gets past village standing; the day-150 survivors sit at standing
199–325, regional, with full pantries sometimes (8,200 kcal on
seed 190393) and empty ones others. Nothing in the clean-hunks
repair changes any of that — it is a conversation-coherence fix,
and the villages live or die by combat, not by talk.

## Reachability

Waves 1–5: wave 4 reached 8/8, wave 5 reached 2/8. Regional 7/8.
National 0/8, table 0/8, wins 0/8 — unchanged from the far end.
Arc II/III/IV and the win flag remain unreached on this band.

## Blanks filled / documented

- FILLED (measured): narrowed family 8b is NOT-CARRIER (4/8,
  bit-identical trajectories). The survival collapse is not in
  these three clean hunks.
- DOCUMENTED: the excluded continuation hunk (second dlg:more
  hunk) is the remaining unmeasured piece of the #4 repair — a
  candidate 8c (own prereg + coordinator decision).
- DOCUMENTED: the #14 sub-test file is absent at the far end — the
  family test cannot run whole on far-end substrate; future
  transplant arms on old bases should expect the #14 spawn to fail
  on a missing file, not a regression.
- DOCUMENTED: /tmp tmpfs is 512M and a full-tree `git archive`
  extract fills it — extract with a pathspec for old-tree test
  runs.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t8b per-seed corpus, metrics
national,table,wins,exiled): REFUSED — "recorder-corpus input:
all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs" (exit 2). Recorded, not waived;
baseline NOT rolled. Same refusal class as all prior bisect /
transplant arms.

## Proof

- `scripts/test-transplant8b.js` — stage 1 green at prereg
  (100/100, then 108/108 after the evidence-hash leg fix);
  stage 2 (live subject state §7 + step corpora §8) re-run after
  the legs: 115 passed, 0 failed.
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
  branch as the reused-tooling check: 116 passed, 0 failed.
- No game-code change is committed by this arm (the subject lives
  on its own branch `transplant-8b-subject`, left in place); no
  `[needs-eyes]` applies. Committed on the arm branch: prereg,
  proof, this evidence file, both step corpora + summaries +
  driver logs.

## Metric review (§14 — filled after the run, never re-scored)

- The primary metric (survived/8, ≤1 CARRIER / 2 AMBIGUOUS /
  ≥3 NOT-CARRIER) held: the subject read 4/8, a clean
  NOT-CARRIER with no ambiguity. The bit-identical trajectories
  make the verdict stronger than the count alone — the metric
  could not have been gamed by a friendlier read.
- The baseline gate (fresh ep-far-8b leg must reproduce 4/8 with
  the exact per-seed days) held exactly, including the two
  extension seeds. The 6-seed stranded leg was NOT judged as-is;
  the prereg's 8-seed definition was honored by extension.
- Sense-testing metric gap, carried forward: the per-seed JSONs
  retain no conversation transcript text (sayCount is a bare
  count; vetSays is event narration), so a dialogue family's
  live behavior cannot be censused from the sim corpus at all —
  only from its own test. The prereg already warned of this; the
  next dialogue-family arm should pre-register the family test
  as the dialogue-behavior instrument, not the corpus census.
- No metric revision proposed for the next run.
