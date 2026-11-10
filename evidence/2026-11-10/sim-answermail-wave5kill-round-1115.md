# sim-answermail-wave5kill-round-1115 — Loop A coordinator evidence (run fleshout-20261110T1115Z)

Axis: scale-onramp / winnability chain. STALE-LOCK RECOVERY + ADOPTION of the
dead 0827Z run. Both of its arms were COMMITTED-BUT-UNMERGED in clean trees;
this run verified them, rebased them onto current master, proved them green,
and merged them locally, pending ship. No new sims were run by this run: both
arms' judged corpora are the dead run's, re-verified (all legs parse, proofs
re-run pre/post rebase and on merged master).

## Stale-lock recovery (run start)

Lock fleshout-20261110T0827Z created 08:27:09Z, ~2h48m old at recovery.
Tree heartbeats stale (sim-answermail-a 08:57:11Z, sim-wave5kill-a
10:16:36Z, both >15min); zero live processes for either arm; flap probe
writes OK in ~/workspace and in the repo (no flap masking a live run).
Dead 0827Z claim retired to .DEAD with a note. Own lock
fleshout-20261110T1115Z + claim written before any sims. Loop B live the
whole run (1030Z claim: capstoneready-b + bindingtrace-b) — NOT touched;
Loop B landed mid-run (e628f9485, coordinator evidence). Orphan trees
sim-wideduty-a + sim-sametick-a (food-economy) stayed deferred — NOT
touched. sim-ctraj-b locked + dirty — NOT touched. Pre-flight: main tree
clean, disk 35%, worktree-reap ran (11/16 active, no removals).

## Arm 1 — sim-answermail-a: ADOPT + LAND (policy-only, zero src/js)

Branch tip at adoption 702ef20c4 (8 commits ahead of master), worktree
clean. The dead run's verdict, re-verified by this run's worker and by
the coordinator's own read of the evidence file in full:

- Pilot GO: seasoned links 8/8 armed vs 1/8 control (bar >= 5/8),
  cost bar PASS (starvation 0 vs 5, median 130.5 vs bar 96.4).
- Confirm GO (amendment 2, fresh band 120101–120116, 16 seeds/leg):
  seasoned 13/15 armed vs 2/15 control (bar >= 10/16; 120116 forms
  no link on either leg, dies day 31); cost bar PASS (starvation 4 vs
  5, arm-only 1, median 136.5 vs bar 86.4); fidelity all pass (accord
  answers 15 == links formed 15, tends 112, renegotiation silences 0,
  instrument errors 0, reconciliation 394 link-days, 0 residue).
- Polity 0/16 both legs: the block is link count, not trust — every
  armed seasoned seed is blocked seasoned-but-no-polity.
- Panel (§15): pilot + confirm both review_required — the raw-deaths
  watch is the live-longer artifact (deaths/100d fell both times:
  -5.9 pilot, -10.1 confirm). Not a verdict override.
- Proof: scripts/test-answermail-a.js 17/17 PASS (15 policy checks +
  cap-phantom proof + amendment-5 twin-pairing regression + live 60d
  smoke leg), re-run by the worker pre/post rebase and by the
  coordinator on merged master.
- The v2 confirm corpus is the DISCARDED record (cap-phantom +
  twin-misattribution artifacts); the judged corpus is the v3 one in
  perseed-answermail-a/ (32 legs + verdict JSON), all present and
  parsing. No sims re-run.
- Landing: rebased onto explicit master 203a32775 (after the wave5kill
  merge). The rebase stop-at-pick quirk struck TWICE (21ad520f8,
  3bc83c2f9 — each listed in both done and todo, tree clean); each was
  verified unapplied DEFINITIVELY with `git diff <pick> -- <files>`
  (137 / 87 lines, non-empty) before `git rebase --continue`, per the
  2026-11-07 lesson. Rebased tip 5db4f6fef, proof 17/17 post-rebase,
  merged --ff-only, ancestor verified. 111 files, 731,004 insertions,
  9 deletions (shared trustgrowth analyzer/instrument fixes).

## Arm 2 — sim-wave5kill-a: ADOPT + LAND (game-code BLOODED lever)

Branch tip at adoption 4018e317c (2 commits ahead of master, base was
current master tip 53185abea), worktree clean. The dead run's verdict,
re-verified by this run's worker and by the coordinator's own read of
the evidence file in full:

- Pilot GO (8 seeds 99641–99648): wave-5 kills 0 -> 6 (bar >= 2);
  scholar deaths/meeting 0.333 -> 0.283 (strict) / 0.413 -> 0.323
  (loose); starvation 5 = 5; median 117 -> 148d. Overshoot watch not
  triggered (6 < 7).
- Confirm GO (fresh band 99867–99882, 16 seeds): wave-5 kills 2 -> 6
  (+4 over its own control — the bar judged in its intent-preserving
  stricter form, armed >= control + 2 = 4, which holds; the literal
  >= 2 also holds); scholar deaths/meeting 0.333 -> 0.098 (strict) /
  0.364 -> 0.146 (loose); starvation 1 = 1; median 135 = 135d.
  Villager deaths to wave-5 monsters flat-to-up by one (3 -> 4) —
  the one number that did not move the right way, reported as such.
- Lever: dmgMult 1.5 / inMult 0.75 once the village holds a living
  wave-4+ veteran; fieldFights.js +50, game.js +53, standing.js +47,
  additive-only, zero deletions; all 9 new empty catches report via
  console.warn('[blooded] …', e); FEASTED hook byte-identical.
  [needs-eyes] stays on the commit (blooded narration is a feel
  change).
- Panel (§15): confirm compare review_required — village deaths per
  run +0.44 / per 100 days +0.31, the same one-death villager signal.
  Carried as the known cost to watch (see findings).
- Proof: scripts/test-wave5kill-a.js 35/0, re-run by the worker twice
  (pre/post rebase) and by the coordinator post-rebase and on merged
  master. check.js --quick attribution stands from the dead run
  (294/6, same 6 pre-existing failures on pristine and lever trees);
  not re-run on merged master — see the infrastructure section.
- Landing: first ff-only merge attempt failed LOUDLY (master had
  moved 53185abea -> e628f9485 under Loop B's 1030Z landing, then
  -> 57e0eb67b under journey-landing r123) — the merge was NOT piped
  through head, the failure was loud, nothing was released. Rebased
  onto explicit 57e0eb67b (first attempt refused on a transient lock
  error — no lock file present on re-check, no git process in the
  tree; contention with the reconcile-divergence merge trial and the
  answermail worker's final git commands — succeeded clean on
  retry), proof 35/0 post-rebase, merged --ff-only as 203a32775,
  ancestor verified. 58 files, 1,427,358 insertions, 0 deletions.
  Tree released done-merged, branch deleted.

## Wall numbers (this run's judged corpora, pooled)

- Answermail pilot + confirm (24 seeds): national 0/24, table 0/24,
  wins 0/24. Seasoned 21/23 armed vs 3/23 control. Wave-5 unlocks
  pilot 1 -> 3, confirm 4 -> 7 (secondary, diverged trajectories).
- Wave5kill pilot + confirm (24 seeds): national 0/24, table 0/24,
  wins 0/24. Wave-5 kills pilot 0 -> 6, confirm 2 -> 6. Wave-4 kills
  pilot 27 -> 34, confirm 108 total.
- The wave-5 kill link is now proven closable on two bands (the lever
  adds +4 kills over control on fresh seeds; scholars die far less
  often in Producer fights). The chain past the kill — national, the
  table, the win — is still the wall: 0 everywhere on both arms.
  The trust half of the diplomacy road is now confirmed solved on two
  bands; the link-count half is the whole story that is left.

## Telemetry deviation check

- Wave5kill confirm corpus: REFUSED (recorder-corpus input, all 32
  rows carry anchorCommit) — same as the dead run recorded. No LOUD
  line, no investigation item. Baseline NOT rolled.
- Answermail corpus (n=53 files): 3 LOUD lines — national 12 -> 0,
  table 16 -> 0, wins 16 -> 0. All REGIME + field-shape artifacts,
  the same class recorded by the 1955Z/2115Z/2215Z/2315Z/0015Z runs:
  the WINSEAT baseline's own regime note forbids this comparison, the
  corpus is a pre-seat measurement substrate (competent-only, no seat
  drive), and both legs read 0 on all three metrics — the armed leg
  lost nothing the control leg had. Baseline NOT rolled, no new
  investigation.

## Infrastructure

- Master moved 3 times under the run (Loop B 1030Z e628f9485,
  journey-landing r123 57e0eb67b, then this run's two merges). Every
  rebase used the explicit SHA read immediately before rebasing;
  master did not move between either rebase and its merge.
- Safe-commit index clobber: none on this run's coordinator work (the
  dead run's workers recorded clobber repairs on their own commits;
  the commits verified correct). No EPERM flap this run (probe writes
  OK at run start).
- check.js --quick NOT re-run on merged master: the wave5kill
  attribution (294/6, identical pre-existing failures on pristine
  and lever trees) was done on the lever tree by the dead run; the
  answermail arm is zero src/js; the sibling commits that landed
  between (Loop B 1030Z, zero src/js; journey-landing r123, own proof
  13/13) carry their own proofs; both arm proofs were re-run green
  on merged master (35/0 + 17/17). The standing 6-failure profile is
  unchanged by this run's content.
- Registry-lock contention: the wave5kill worker's closing heartbeat
  was blocked twice by the main-session reconcile-divergence job
  holding the registry lock (registering since 11:22Z). The
  coordinator re-heartbeated the tree before merging; the release
  landed clean once the contention cleared. The reconcile job
  (Steve-approved 2026-11-10, Cursor PRs #118–121) is still active
  and may move master again — it works on its own branch
  (e4dbe581b at closeout), not on master; nothing of this run's
  depends on it.
- sim-secondlink-a tree release NOT done: the 0827Z claim said the
  release was owed, but the tree is DIRTY (uncommitted changes,
  reaper refuses) and its branch tip (f6c231906, sim-slotrule-a
  prereg) now carries other arms' history — releasing it would risk
  destroying live work. Deferred, recorded here and in the tracker;
  a future run must inspect the tree before releasing it.

## Findings filed (sim-findings.md)

- #2060 ANSWER THE MAIL marked FIXED (landed 5db4f6fef).
- New open items: TENDLINK OVERPAYS THE PANTRY BY ~5%; TRUST CAPS AT
  100; MEDIAN 132 IS THE UPPER MEDIAN (method finding); WHOLE-RUN
  DEATH COUNTS MISLEAD ON LIFE-EXTENSION LEVERS (panel reading);
  BLOODED VILLAGER-DEATHS WATCH (panel regression_watch, carried).
- Second sightings appended: TEND BEAT IS A WALL OF IDENTICAL TEXT
  (41 verbatim repeats on the answermail pilot); REPEATED FAILED
  WALK-IN VS WAVE 5 (observed again on the wave5kill corpus).

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- This was an adoption/landing run, not a new measurement: both
  verdicts are the arms' own pre-registered bars, judged by the dead
  runs and re-verified, not re-scored here. No bar was moved.
- The wave5kill confirm's kill-bar note is the honest precedent for
  future arms: when a fresh band's control already scores (2 kills),
  judge the intent-preserving stricter form (armed >= control + 2)
  and report both readings — never silently re-score to the friendlier
  literal bar.
- The answermail fidelity gate did its job twice (cap-phantom, then
  twin misattribution) — the unattributed-0 bar stays as the tripwire.
- The telemetry-check LOUD lines on the answermail corpus are the
  sixth sighting of the same artifact class; the check's refusal on
  recorder corpora and the WINSEAT regime note mean the scale-wall
  baseline cannot be rolled from these corpora. A future run that
  wants a live telemetry signal needs a run-shaped corpus, not a
  sweep-recorder one.

## Next blanks, in order (for the next Loop A run)

1. **The second-link build** (answermail next blank #2; findings
   #2061 open remainder): does COMPETENT_TALK=1 or the leadcourt
   policy answer raises, and if so do second links form — and is the
   fix "the player must sit down" or "the ask must survive longer /
   find the player another way"? The trust half is solved; the
   link-count half is now the whole diplomacy story.
2. **The game should answer its own mail** (villager drive, design
   question): the policy proves a competent player who answers the
   mail seasons links; the village itself still lets the accord sit
   unanswered under plain competent play.
3. **Tend overshoot + trust cap** (small engine/design questions,
   findings filed above).
4. Loop B's next blanks are its own (volley-softened W=8, flee-repair,
   sit-becomes-win, table contract, trial-by-combat, gating leg-4 —
   all Steve-call-gated or decision-owed per the 0930Z review);
   Loop B's 1030Z arms landed this morning (capstoneready NO-GO,
   bindingtrace DIAG-GO: the Binding fails at B1, the counter never
   fires).

## Convergence state

scale-onramp stays converging (NOT converged): the wave-5 kill link
is proven closable and the trust half of the diplomacy road is
confirmed solved, but wins are still 0 everywhere, national still 0
on every corpus this run, the full seat is still unreached, and both
wins still come only through default-OFF policy instruments. The
standing directive stands until the tracker records this axis
converged on measured evidence. food-economy stays converging
(untouched; sibling Loop B live on winnability at closeout).
Claim deleted; lock deleted. Evidence: this file (coordinator
evidence commit on master) + evidence/2026-11-10/sim-answermail-a.md
+ evidence/2026-11-10/sim-wave5kill-a.md.

## Village assessment (plain words)

Two things changed in the village this morning, and both are about
people learning to do the thing that was always in front of them.
First, the village started answering its mail: the one friendship it
ever gets no longer cools to nothing while funerals pile up — a gift
on the day the bond is born, grain every week after, grief met with
grain instead of silence — and thirteen of sixteen new villages kept
that friendship warm to seasoning, where two used to. But one warm
friendship is still not a realm, and no village got any closer to the
table for it. Second, the village learned to kill Producers: once a
village has someone who killed the tier below and kept them alive,
its fighters hit half again as hard and take a quarter less hurt —
six Producer kills where there were none, and the scholars who used
to die one in three meetings in those fights now die one in ten.
The cost is real but small: one more villager fighter died in those
fights than before. The wall past the kill — becoming a nation,
sitting at the table, winning — has not moved a step. The next work
is the second friendship, and then the road past the kill.
