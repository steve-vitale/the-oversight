# Adoption round — run fleshout-20261105T1715Z (Loop A)

STALE-LOCK RECOVERY + LANDING of the dead 1515Z run's two stranded arms.
Coordinator evidence. Merged locally, pending ship (ship loop owns
push/bump/live verification).

## Run header (pre-registered adoption scope)

- Run: fleshout-20261105T1715Z (scheduled 17:15:39Z, execution began
  18:03:20Z — 48 min queue delay).
- Axis: ADOPTION/LANDING. Arm 1 sim-freshkill-a (scale-onramp blank 3,
  fresh-kill inversion DIAG — completed by its worker, branch ready).
  Arm 2 sim-gossipfix-a (food-economy / narration, gossip-burst
  position-gate BUILD — worker cancelled mid-sweep, completed by an
  adoption worker in place).
- Loop B live throughout on scale-onramp (claim
  fleshout-loop-b-20261105T1611Z, arms sim-vetrest-b-adopt +
  sim-tbretreat-b-adopt) — NOT touched. Loop B's tbretreat confirm
  landed NO-GO and its vetrest adoption UNDERPOWERED during this run;
  that closeout is Loop B's, not this run's.
- No new arms planned on any axis. No lever rotation step (convergence
  work supersedes rotation; left at 3).

## Stale-lock recovery (guard, verified step by step)

- Lock read BEFORE deletion (run_id fleshout-20261105T1515Z, created
  2026-11-05T16:23:31Z). Lock age at run start ~100 min — past the
  90-min fallback AND past the 15-min heartbeat guard on both trees:
  sim-gossipfix-a heartbeat 17:38:29Z (25 min stale), sim-freshkill-a
  heartbeat 17:35:15Z (28 min stale).
- Registry parsed as a trees LIST (2026-11-03 lesson applied).
  No live agent for run 3fa09243-4ba9-4696-aed4-99d7d328cee5 (the 1515Z
  run); its two ping agents are done (freshkill ping replied "done,
  branch ready for merge"; gossipfix ping cancelled with no result).
  No node processes for either slug. Last file writes in the trees
  17:31–17:53Z, then silence.
- Dead claim retired to fleshout-20261105T1515Z.json.DEAD; lock
  deleted; this run's lock + claim (fleshout-20261105T1715Z) written.
- Pre-flight: main tree clean (`git status --short` empty), disk 33%,
  `bash scripts/worktree-reap.sh` — active 13/16, removed nothing
  (correctly refused uncommitted trees incl. both adoption targets).

## Arm 1 — sim-freshkill-a: DIAG-NO, LANDED d661b0604

Worker complete before the 1515Z coordinator died (ping reply +
evidence file complete). Coordinator verified, rebased, merged.

- Verdict DIAG-NO (prereg 0e0bae753, instrument + driver + analyzer
  31cd0527d, evidence + corpus 6a9c05ba6 pre-rebase; rebased onto
  master 1a898136c as e1fa97fd3 / e0e0e435a / d661b0604). Proof
  scripts/test-freshkill-a.js 34/34 post-rebase AND on merged master.
  Zero src/js, zero default flips, DIAG ONLY.
- The inversion does not reproduce as a channel difference: channel A
  (pending-live wanderer fresh-entry) 0/1, channel B (lifted siege)
  1/23, C 0/1, D 0/2; best pair gap 4.3pp vs the 15pp bar; only B
  clears the ≥8-fights leg. The wild fight is a 1-in-27 event. The
  band's only kill came through the SIEGE (99355 d74 influencer,
  party of 4, companion Thoa landed it) — the reverse of
  grindfinish's shape, on n = 1 kill.
- Merge: `git merge --ff-only sim-freshkill-a` clean (local master ==
  origin/master at 1a898136c, verified by fetch before rebase — no
  stale-base risk). Tree released done-merged, branch deleted,
  worktree removed. Main tree clean after merge.
- Findings: sim-findings.md updated — fresh-kill inversion item
  (line 1762) marked FIXED with the verdict; #1169 HP-drops, grind-
  invisible, and TB-all-in lines each carry a freshkill UPDATE;
  4 new open items (zero-damage TB deaths; grind-tail finishing
  failure; standing-99 141-day sighting; monsters.json tenth wave-4
  def `herald` [700, 900] not in MONSTER-WAVES.md).
- Evidence: evidence/2026-11-05/sim-freshkill-a.md (+ prereg);
  corpus perseed-freshkill-a/ (8 files, 0 instrument errors).

## Arm 2 — sim-gossipfix-a: NO-GO, KILLED (branch abandoned, not merged)

Adoption worker completed the cancelled 1515Z arm in place (no seed
re-run, no corpus file overwritten) and judged it; coordinator
verified the worktree state and made the landing call: DO NOT MERGE.
Per the loop's kill protocol ("Killed arms leave no trace — game-code
reverted before commit") and the ffhold-a/ffnoflee-a precedent
(2026-10-25: game-code arms killed, NOT merged, branches deleted,
their evidence files absent from master), the branch
sim-gossipfix-a (tip 3581eb64d) was released as done-abandoned,
worktree removed, branch deleted. The verdict, numbers, root cause,
and fix direction are preserved here and in sim-findings.md; the
62 corpus files + compare outputs go with the branch (reproducible
in minutes from the prereg — the next arm re-runs its own baseline
on current master anyway, per correction 2).

- Verdict NO-GO, judged strictly against the prereg (exit 1 from
  scripts/gossipfix-compare-a.js, full 31-seed compare).
  Commits on the abandoned branch: 86e4652b7 [needs-eyes] (the fix),
  277defaeb (correction 2), c32d14f00 (NO-GO verdict + 89 files),
  3581eb64d (anchor re-pin). Proof scripts/test-gossipfix-a.js
  34/34 green after rebase (anchor 17021 re-pinned 57d village-lost
  -> 60d survived; drift verified from r140 master, not the fix —
  pre-fix game.js on the new master gives the same 60d survived).
- Primary PASS: 0 stranded sleep burst events in 25 stranded sleep
  windows (before: 6 in 25); 0 stranded settle lines (before: 10).
  The defect itself is gone on all 31 seeds.
- Guardrail (i) PASS: non-stranded sleep burst rate identical, 8.6%
  (151/1,765) both legs. Guardrail (iii) PASS: det-gate in the proof
  test; trajectory identity 31/31 seeds.
- Guardrail (ii) FAIL — conservation (ii-a) and phase shift (ii-b)
  break on exactly two seeds. Root cause, diagnosed from the
  corpora (counts reconcile exactly): `holdNamingNews` caps
  `scholar.awayNaming` at 12 entries and drops the oldest held line
  when a single away stretch accumulates more. The gate holds EVERY
  burst/settle line fired while the scholar is away, not just
  stranded sleep windows. 15009 held 13 lines (3-night stranding +
  away-day lines) — 1 burst line lost (the loop-day-36 sleep word
  line; its paired debate line WAS delivered). 17010 held 36 lines
  across a 9-night stranding — 24 lost (17 burst + 7 settle);
  only the newest held settle ("Big-Eyes", loop-day 16) survived.
  Seven settlements ("The Bailiff", "Big Ugly" x2, "The Ugly
  Beast", "The Loud Beast", "Big-Bane", "The Big Beast") never
  reach the scholar. 29/31 seeds exact.
- Honest extra: the pilot-only compare vs the fresh baseline is
  ALSO NO-GO — the 15009 failure was already latent in the pilot
  data; the pilot gate did not pass on the fresh baseline. Recorded,
  not smoothed over.
- Sense verdict (worker's, endorsed): the mechanism is right and
  the wording reads right on short strandings; the fix fails its
  own conservation promise on long ones, silently. The catch-up
  also arrives as a wall (11 burst lines in one daily on 17010, 8
  on 15221, 9 on 15009) — a transcript dump, not a fireside
  catch-up. Next arm: lift/remove the bound (or deliver in
  installments), re-prereg (incl. held-volume accounting per away
  stretch), re-run the same 31 seeds. Do NOT re-run against the
  same bound hoping for a luckier draw — the failure is structural
  on long strandings, and 17010's 9-night stranding is not a rare
  tail (25 stranded sleep windows across 31 seeds, 9 on 17010).
- Panel (§15): after-panel (8 cases) vs before-panel, decision
  `review_required` — but every observed metric delta is exactly 0
  (all 31 metrics; wins/national/table/survival/deaths/gear/intake
  identical). The label is coverage-driven, not a signal; no panel
  error. Trajectory identity (iii-b), the prereg's judge for
  gameplay neutrality, passed 31/31.
- check.js --quick (fixed tree): 284 passed, 6 failed, exit 1 —
  run twice (524s, 601s), identical 284/6 both times. All 6
  pre-existing (verified: all 6 also fail with pre-fix game.js
  swapped in): measurement-proof-update freshness,
  measurement-workflow neutrality proof, mobile-combat-cadence
  (Continue wrap + enemy announcement), occupation-panels CLI
  workflow, phone-frame proof (stale index.html receipt),
  establishment-r20 racks-full voice gate. None caused by the fix.
  (Standing profile corroborated the same hour by journey-scale
  r100: 284/6 pre-existing.)
- Corpus completion by the adoption worker: baseline 17 -> 31
  (missing 17010–17020, 17022–17024 run with pre-fix game.js from
  40ce123ac, fixed game.js restored, `git diff HEAD --
  src/js/game.js` empty, pre-fix game.js never committed);
  after-corpus 8 -> 31 (confirm 17001–17020, 17022–17024, fixed
  code). All files valid JSON, 0 instrument errors. No EPERM flap
  during corpus writes; sweeps slower than the ~3–4s/seed norm
  (~4.8s baseline, ~7.4s confirm) under sibling-loop CPU load.
- Findings: sim-findings.md updated — the gossip-burst item's
  [CLAIMED] note now carries the NO-GO verdict + queue-cap cause +
  next-arm direction; 2 new open items (killer-tale fireside prose
  reaches an absent scholar; gossipcensus corpus stale on current
  master); 1 new open item for the 12-entry awayNaming cap itself.
  The endDay-haven-beats item stays [open] (the family is still
  ungated — gossipfix fixed nothing, since it did not land).

## Wall numbers (freshkill band, 8 seeds, 150d, competent verbatim)

Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, wave-4 faced
6/8, wave-5 unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0
(band total), median survival 93.5d (range 55–150d; 7 villages lost,
1 survived to the horizon). TB endings band-wide: death 26,
kill-or-rout 1, fled 0. Field endings: flee 14, death 1, kill 0.
99357 sat at standing 99 for 141 days — one point short of the
wave-4 door for the whole run. Gossipfix is a narration fix corpus;
it records no scale outcomes (carried wall state from the 1041Z
round: wins/national/table/wave-5 0/24, ready days 0/24).

## Telemetry deviation check

Attempted on the freshkill corpus (recorder shape, same class as the
1322Z/0915Z runs): the tool REFUSED the input ("refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs"). No LOUD
lines, no deviation to investigate. Baseline NOT rolled (reseeding a
baseline from a DIAG corpus would be wrong). Gossipfix corpora are
narration corpora with no national/table/wins fields; no telemetry
check applies.

## Balanced panel (§15)

No before/after pair for the freshkill DIAG corpus (stated in its
prereg; same limit as dmground / grindfinish). Gossipfix panel
compare: evidence/2026-11-05/gossipfix-panel-compare.md (+ .json) —
decision `review_required` with every observed metric delta exactly
0 (see arm 2); no panel error. The panel files went with the
abandoned branch; the decision + the zero deltas are recorded here.

## Infrastructure

- Freshkill rebase: clean (3/3 picks), proof green after rebase.
  No safe-commit clobber on the coordinator's merge (no coordinator
  commit needed for freshkill — worker commits only).
- Gossipfix worker: safe-commit index clobber hit both of its
  commits; repaired via HEAD-blob cacheinfo each time, commits
  verified correct (all 89 files hash-identical). No EPERM flap
  during corpus writes. Coordinator's kill decision executed via
  `worktree-release.sh sim-gossipfix-a abandoned`, worktree removed,
  branch deleted (was 3581eb64d).
- No EPERM flap observed this run. Master moved under the run
  (freshkill merge d661b0604, then sibling journey-scale r100
  3 commits to 5ffbdaa1a; new sibling trees journey-landing,
  sim-tbretreat-refind-b appeared). No overlap with either arm;
  the gossipfix rebase base (1a898136c) predates the freshkill
  merge only because the branch was abandoned, not merged.

## Metric review

- Adoption scope held: no new arms, no re-judgment of either corpus.
  Freshkill judged strictly against its own prereg (DIAG-NO on the
  rule as written; the operative fact is a distribution fact — the
  wild fight barely happens — not a rate fact).
- The ±1-day kill join changed nothing on the freshkill corpus
  (0 kills matched on +1 day); the rule stays as the better default.
- Gossipfix metric review (worker's, endorsed): the pilot gate did
  NOT pass on the fresh baseline (15009 latent failure) — recorded,
  not smoothed over. Guardrail (ii-b)'s expectation understates
  held volume (it counts only stranded-window lines, but the gate
  also holds daily/harness-phase lines fired while away); next run
  should expect the shift against TOTAL held lines or judge (ii-b)
  per return day. The queue bound itself was never preregistered
  as a metric — the prereg's (ii-a) assumed "each held line is said
  exactly once on return" without stating the 12-entry cap as a
  risk; the next arm should preregister held-volume accounting.

## Tracker update

scale-onramp stays converging (NOT converged): freshkill answers
blank 3 (fresh-kill inversion) as DIAG-NO — the wild fight is a
1-in-27 event, the only kill came via lifted siege — but wins are
still 0, wave-5 kills still 0, readiness-5-ready days still 0.
Next blanks, in order (carried from the 1322Z entry): (1) BUILD arm
on second-killer production or first-killer survival — not another
simultaneity measurement; (2) the grind step's price (survival-
per-TB-fight / retreat-and-refind); (3) re-screen sigoff/gearoff/
trickoff on a fresh seed set; (4) flee-repair game-code port —
STEVE CALL on scope; plus the freshkill findings (zero-damage TB
deaths, grind-tail finishing, standing-99 141-day sighting,
monsters.json tenth wave-4 def `herald`).
food-economy stays converging (NOT converged): the gossip-burst
position gate is NO-GO and KILLED — primary passes (0 stranded
events) but the 12-entry queue cap silently drops held lines on
long strandings (15009: 1 burst; 17010: 17 burst + 7 settle). Next
blank: lift/remove the bound (or deliver in installments),
re-prereg with held-volume accounting, re-run the same 31 seeds;
the endDay haven-beats family + killer-tale prose stay open as
one family to judge together.
