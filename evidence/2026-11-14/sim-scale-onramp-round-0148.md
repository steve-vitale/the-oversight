# Scale-onramp round 0148Z — ADOPTION RUN (OVE-48 instrument GO + narrowed 8b NOT-CARRIER)

Run: fleshout-20261115T0148Z (Loop A), axis scale-onramp (converging, NOT
converged). Coordinator evidence. Master at closeout 539034e74.

## Run start — stale-lock recovery + adoption

STALE-LOCK RECOVERY: the previous run fleshout-20261114T2315Z was dead on
every guard signal — its lock was 121 min old, its two trees'
heartbeats 37 min stale, no sim process running, no file activity in
either tree for 12+ min. Lock replaced (this run's lock
fleshout-20261115T0148Z, 2026-11-15T01:49:30Z); the dead claim retired
to .DEAD; my claim written before any sim. Loop B live on winnability
chain throughout (fleshout-loop-b-20261114T2345Z, sim-succpolity-b +
sim-holdbuild-b) — NOT touched; loop B landed Lane B social-life r206
(3321c6546) mid-run, zero overlap with either arm.

ADOPTION: both arms adopt the dead run's stranded work IN PLACE, in the
same trees and slugs. The dead run's workers had committed more than
the worktree state showed, and the coordinator's first briefs were
wrong on that point — corrected mid-run by `subagent.send` after the
branches were inspected:
- sim-ove48-conv-a branch already held the prereg + instrument + driver
  + analyzer (66b9ecfe8) and the full base-leg corpus (79d58abae). The
  worker checked out the existing branch, did NOT rewrite the prereg
  or re-run the base leg.
- sim-transplant8b-a branch already held the narrowed-8b prereg +
  stage-1 proof (c1b53753c) and a proof fix (a240573b7). The worker
  executed the committed prereg verbatim, did NOT redefine 8b.
The stranded corpora were real: ove48 subject leg 7/8 seeds (190457's
file missing, JSON recovered from the driver log's @@FALLBACK print);
8b far leg 6/6 seeds (190391–190396). Both arms took the 2115Z next
blanks #1 and #2 in order. Pre-flight: main tree clean, disk 41%,
worktree-reap run (nothing removed; all LOUD lines were dirty-tree
protections including the two adopted trees). 14/16 active at start,
11/16 at closeout.

## Arm 1 — sim-ove48-conv-a: GO (the OVE-48 mechanism is demonstrated)

Branch sim-ove48-conv-a, merged ff-only cec39a279 (commits c4f1c667c
prereg + instrument [adopted], 0c62b3847 baseline leg [adopted],
5e9200785 subject leg + comparison + evidence, cec39a279 wording fix).
Proof: test-ove48-conv.js stage 2, 21/21 green (coordinator re-ran
on the tip). Worktree released done-merged, branch deleted.

Question (2115Z blank #1): does OVE-48 change what conversations
open with — dawn commitment / top drive — or only survival? Band 3
proved the survival effect (3/8 → 0/8) with zero mechanism trace.

| identical seeds 190457–190464, 150d death-aware, competent verbatim | Baseline (far end 203a32775) | Subject (OVE-48, 493d7a975) |
|---|---|---|
| Conversation opens | 875 | 935 |
| Dawn-aligned share (weighted-pick) | 28.7% (148/515) | 74.9% (426/569) |
| convoDawnPriorities reads | 0 | 569 (one per weighted pick) |
| Survived /8 | 3/8 | 0/8 |
| Median survival | 129d | 134d |
| Wave-5 reached | 0/8 | 4/8 |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |

GO bar (subject ≥40% AND +15pp) met with wide margin: +46.1pp.
Per-seed subject alignment 65.8–87.7% on every seed; want-mix TVD
0.215 (curious 322→487, warn_you 0→50, seek_taken 67→7). Validity
V1–V5 passes on both legs; the pick's own aligned flag agrees with
the analyzer 100% (n=569).

Sense-testing (transcripts read): opener lines read like people and
track the want (food-drive ask_favor: "Pantry's thin and getting
thinner…"; safety-drive warn_you: "Listen. I need you to hear this
before you go back out there"). Two honest limits, recorded in the
arm evidence: (1) alignment flows entirely through top drive —
`dawnKind` is null on all 1,810 opens, so the kind half of OVE-48's
contract is unexercised in sims; (2) nobody *says* the drive aloud —
0 dawn/commitment/want mentions in 811 sampled lines, because the
verbatim policy walks out of every conversation. The pick is proven;
the spoken-conversation half and the causal path from pick to 0/8
survival remain unproven. **Revert-vs-keep is NOT decided here.**

Evidence: evidence/2026-11-14/sim-ove48-conv.md (+ prereg
sim-ove48-conv-prereg.md, comparison ove48-conv-comparison.json).
No src/js change.

## Arm 2 — sim-transplant8b-a: NOT-CARRIER (narrowed 8b does not collapse the far end)

Branch sim-transplant8b-a, merged ff-only 539034e74 (commits 3e4dadd9e
prereg + stage-1 proof [adopted], a57fef28b proof fix [adopted],
539034e74 evidence). Proofs: test-transplant8b.js 115/115 and
test-culpritbisect-a.js 116/116, both green (coordinator re-ran on
the tip). Worktree released done-merged, branch deleted. Subject
branch transplant-8b-subject left in place at 05307dbcd.

8b definition (coordinator-defined in the committed prereg,
executed verbatim): three clean hunks of family 8 (PR #22
live-thread-dry-engage) — conversation.js `@@ -1163,6 +1163,55 @@`
new methods, `@@ -6069,9 +6118,38 @@` goon delivery,
convo-dialogue.js `@@ -288,15 +288,30 @@` dlg:more pre-check —
+ test file blob a0161cc9; the four conflicted hunks and the
unlisted clean second dlg:more hunk excluded.

| identical seeds 190391–190398, competent, standing-fix swapped in | Far leg ep-far-8b | Subject leg t8b |
|---|---|---|
| Survived /8 | 4/8 | 4/8 |
| Per-seed days | 86/144/150/43/150/87/150/150 | identical |
| Regional / wave-5 / national / table / wins | 7/8 / 2/8 / 0 / 0 / 0 | 7/8 / 2/8 / 0 / 0 / 0 |
| Deaths | 629 | 629 |

Full per-seed JSONs byte-identical on all 8 seeds except
`anchorCommit` — the clean hunks never fire under the competent
policy, so trajectories do not diverge at all. Stranded far leg
verified (6 seeds, parse + errors 0 + days matching the settled
baseline), then the band extended to 8 per the prereg (190397/
190398, both 150d survived).

Family test on the subject: Dale goon, Dale-honest, and
resume-engage shapes all green — the repair works when a player
actually holds a live unfinished conversation. The parent runner's
one FAILURE (#14 favor/debt Help) is a missing sub-test file absent
at the far end (present at the merge and on master) — a pre-existing
substrate gap, not an 8b regression. Sense-testing: 0 "Still on" /
0 "lost my train of thought" in 225 vetSays lines on both legs;
vetSays byte-identical. The dialogue repair simply has no path to
act in sim.

Correction to the coordinator's first brief: the uncommitted
standing.js roster-check hunk was NOT redundant in context. Master
has it, but the far end 203a32775 lacks it, and the swap is a
required bisect step mechanic, not a commit candidate. The worker
kept it swapped in for both legs, then restored the far-end native
standing byte-identical (75762cb2) after the legs. Nothing
redundant was committed.

Evidence: evidence/2026-11-14/sim-transplant8b.md (+ prereg
sim-transplant8b-prereg.md). Corpora under
evidence/2026-11-13/perseed-culpritbisect-a-{ep-far-8b,t8b}/.

## Wall (this run's judged corpora, 32 configs)

Survived 11/32; national 0/32, table 0/32, wins 0/32; wave-5 8/32
(ove48 subj 4/8, 8b legs 2/8 + 2/8); ove48 median 129d → 134d, 8b
median 147d both legs (computed from the arm's reported day list).
The scale wall is unchanged in kind: national/table/wins remain 0
on every judged corpus, and the veteran bar still chokes surviving
seeds — but two 2115Z blanks are now closed with measurements, and
the OVE-48 mechanism (dawn alignment) is proven rather than assumed.

## Metric review

Pre-registered metrics bound both arms; no re-scoring happened
mid-run. The ove48 GO bar (≥40% AND +15pp) was met at +46.1pp. The
8b NOT-CARRIER verdict follows the program's vocabulary on
bit-identical trajectories. One tooling note: test-ove48-conv.js
stage 1's two corpus-absence legs now fail by design (the corpus
exists) — stage 1 is the pre-corpus gate, stage 2 (21/21) is the
live proof post-corpus; no metric revision proposed. The 8b band
ran 6+2 (stranded 6 + 2 extension) per its prereg, meeting the
8-seed minimum. No metric revision proposed for either arm.

## Telemetry deviation check

Refused, same standing refusal as 2115Z/2130Z/2230Z: the script
refuses recorder-corpus input (all 8 ove48 subject rows carry
top-level anchorCommit; exit 2). The first attempt failed on a
shell-glob mistake (a `*` in a directory component is read
literally); the corrected basename-glob attempt produced the
recorder refusal. No LOUD lines, no investigation item, baseline
NOT rolled.

## Infrastructure

- Service restart mid-pre-flight: the heartbeat/claim/reap exec
  died with the restart; verified its effects had NOT applied
  (dead claim still live, my claim absent, heartbeats still 01:11)
  and redid the steps cleanly. Nothing was double-applied.
- Safe-commit index clobber struck the ove48 worker's commits
  twice and the 8b evidence commit (committed files showing as
  staged-deleted) — repaired each time via the `ls-tree -r |
  update-index --add --index-info` pipe, commits verified intact
  by hash. No clobber on the coordinator merge or evidence commit.
- /tmp (512M tmpfs) filled during the 8b worker's full-tree
  `git archive` extract; recovered with a pathspec extract.
- Git gc unreachable-objects warning on both merges — housekeeping
  note only (same as 2230Z).
- Master moved once under the run (loop B Lane B social-life r206,
  3321c6546, zero overlap); both arms rebased clean (ove48 onto
  3321c6546 before its merge; 8b onto cec39a279 after it), proofs
  re-run green after every rebase and by the coordinator on both
  tips. check.js --quick NOT re-run (zero src/js, zero green-list
  files; loop precedent).
- Findings: one new item appended (narrowed 8c candidate — the
  excluded second dlg:more hunk).

scale-onramp stays converging (NOT converged): the OVE-48
mechanism is proven and narrowed 8b is killed, but no fix has
landed, national/table/wins remain 0 on every judged corpus, and
the revert-vs-keep call is still owed. food-economy stays
converging (untouched; parked). winnability chain stays converging
(untouched; sibling loop B). Next blanks, in order: (1) OVE-48
revert-vs-keep decision, with the mechanism in hand (coordinator
decision; open sub-questions: dawnKind-null kind half, the
unspoken drive, the causal path from pick to 0/8 survival);
(2) narrowed 8c candidate (excluded second dlg:more hunk — own
prereg + coordinator decision); (3) family 6b + narrowed 7b;
(4) family 2b AMBIGUOUS stays on the suspect list; (5)
headcount-ceiling (Steve-call); (6) Reunion mirror pack in the
wild (Steve design call). Claim deleted; lock deleted.
