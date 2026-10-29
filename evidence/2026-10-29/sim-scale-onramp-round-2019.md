# Scale-onramp round — run fleshout-20261029T2019Z (2 DIAG arms, merged locally pending ship)

## Pre-registration (coordinator header — written before any sims)

- Axis: scale-onramp (converging, NOT converged). Standing directive stands:
  national must be reached in sims before the rotation resumes; this run does
  not claim convergence.
- Sibling loop B live on food-economy (claim fleshout-loop-b-20261029T1930Z,
  arms lackingline2 + raidguard, NOT touched) -> this run worked scale-onramp,
  the topmost axis not named in any live claim file.
- Claim fleshout-20261029T2019Z written before any sims; lock written at run
  start (no A lock existed at start; main tree clean, disk 20%).
- Arms (both DIAG-ONLY, zero src/js, zero default flips, zero deed-bar moves):
  - Arm 1 sim-allydpr-a: price the ally-DPR flip threshold per joined fight
    (backlog tile-join flip-price). Prereg: exact shout-time price
    HP-at-shout / rounds-available, DIAG-GO at >= 20/24 joined fights priced.
  - Arm 2 sim-w5ready-a: audit waveUnlockReady(5) readiness (backlog full-seat
    readiness audit, ranked step 1). Prereg: all code components enumerated
    with citations AND 16/16 fullseat rows classified by blocking component
    with distance AND each component classified movable/fixed/Steve-call.
- No new band sims were run. Both arms re-analyze landed corpora
  (perseed-tilejoin-a, perseed-fullseat-a); wall numbers below are those
  landed bands, reported not re-claimed.

## Arm 1 — sim-allydpr-a: DIAG-NO-GO / INSUFFICIENT-DATA (corpus)

- Prereg commit ee0ecab4f (rebased from 54220a42c); evidence + analyzer
  commit c1ac35db4 (rebased from 3d93e3890). Evidence:
  evidence/2026-10-29/sim-allydpr-a.md (+ prereg .md); analyzer
  scripts/test-allydpr-a.js (exits 1 by design on the primary bar;
  recompute checks PASS).
- Exact shout-time price priced for 0/24 joined fights — the corpus rows carry
  no shout round, no HP at shout, no leader HP/max at shout, no per-round
  damage, no rtd/flee horizon, and no ally active-round count. That misses
  the pre-registered bar (>= 20/24) outright. This is a corpus-field gap,
  not a re-score: the primary verdict stands as DIAG-NO-GO.
- End-state proxy (labeled PROXY everywhere; sufficient-for-kill price
  1 + mHpLeft / allyDealt over the same ally window): finite for 17/24,
  median 17.33x. Shares: <= 1.5x = 2/17 finite (both already kills, so ZERO
  non-kill fights within 1.5x); <= 3x = 6/17; <= 5x identical (no price falls
  between 2.90x and 6.50x). Wave medians: wave-1 4.50x, wave-4 154.75x
  (allies striking 3–4 damage vs 453–626 HP still standing).
- Directional answer: the gap is NOT ~1.5x (entry strength is not the live
  question for the median fight) and NOT merely 3–5x. One ally cannot carry
  this gap on a kill-flip reading.
- Separate failure class: 7/24 joins are FLOOR-BRANCH with allyDealt = 0 —
  floor means never strikes, exactly. Those are timing/floor failures, not
  DPR failures, and no multiplier prices a zero-round window.
- Recomputed context (not hand-copied): 24 joined fights, outcomes 2 kills /
  4 monster-flees / 15 villager-flees / 3 villager-deaths; ally dealt 137,
  taken 296; OFF addressable pool 11/11 fled, 0 kills, 0 deaths;
  joined-death share 3/24 (12.5%).
- Sense (6 transcripts read): joins read as people answering shouts in every
  case; endings are honest when they exist. Endings do NOT exist for
  drive-offs and floor-flees after a shout (e.g. "Terrence charges in!"
  then silence) — the queued narration blank, confirmed, still not built
  per this arm's DIAG-only scope.

## Arm 2 — sim-w5ready-a: DIAG-GO (component-level)

- Prereg commit 647cd67b6 (rebased from a30c3da66); evidence commit
  4c9cd9d6e (rebased from 622609ca). Evidence:
  evidence/2026-10-29/sim-w5ready-a.md (+ prereg .md, analysis JSON);
  analyzer scripts/test-w5ready-a.js (post-rebase re-run PASS).
- Correction to the brief's naming: waveUnlockReady(5) DOES exist —
  src/js/standing.js, delegating to waveCombatReadiness(5). Its four bars
  (demand from standingCfg().readyDemand[5], analyzer-verified): armor >= 4
  fighters at P >= 15; weapons >= 6 armed; tricks >= 3 counters known;
  veterans >= 2 living wave-4+ killers. The full unlock chain adds: wave-3
  rung (day >= 25 + wave-2 ledger >= 5), gated standing >= 200, and wave-4
  faced. The deed wave-5 bar (2 distinct fought) is downstream, NOT an
  unlock component — the earlier "distance 2" is the deed distance; the
  unlock distance is a multi-component stack.
- Blocking-component ranking (end state, 16/16 rows recomputed, 0
  unclassified): veterans 16/16 (binding); standing-points shortfall 13/16;
  armor 11/16; weapons 9/16; wave-4 faced missing 7/16; defer5 hold (capped
  >= 200, readiness unready, gated pinned at 199) 3/16; wave-3 rung 1/16
  (day-40 death only); tricks 0/16 (met at every end snapshot).
- Every row is blocked by >= 2 components (range 2–5, median 4) — no
  single-blocker row. Purest readiness block: 76007-on (capped exactly 200,
  faced yes, rung yes, short armor/weapons/veterans).
- Movable-component answer (honest version): proven movable by policy is
  wave-4-faced only (false -> true on 4 seeds under pursuit). Standing
  points are movable but not sticky (peaks rose on 5/8 seeds, decay erased
  them at end on 5 rows). Armor (short 4 -> 7 rows OFF -> ON) and weapons
  (2 -> 7) moved the WRONG way at end state — survival-confounded: armored /
  armed fighters die in the fights that earn standing. Veterans: 0/8 seeds
  cleared under any arm, including a pursuit that raised wave-4 clears.
  NO single component is cleanly policy-movable to the bar on this band.
  A future variant must move the stack simultaneously (spread wave-4 killing
  blows, keep both killers alive, hold gear counts AND standing) or come
  with a Steve call on the bar. Demand numbers, t5 = 200, plenty cap 100,
  peak ratchet, living-vs-dead veteran counting, deed bars, and the #1223
  stage bar are game-code-only / Steve-call — none moved.
- Standing dynamics (subordinate): seed 76003 IS in the corpus (both arms) —
  197 -> 100 checks out with a correction: end gated 100 is the peak-ratchet
  floor, live raw is 95 (war 75, diplomacy 0, plenty 20). All 5 decayed rows
  (-47 to -97) end at diplomacy 0; the pattern is diplomacy collapse (links
  dissolve / trust < 40 / polity loss, -34 each, live-computed). Peak
  component splits are UNMEASURED (not in corpus) — direction only.
  Pin vs shortfall: 199 = defer5 hold by construction (3 rows); 197 peak =
  plain 3-point shortfall, not a pin. End "standing 100" on floor rows
  overstates live standing by 5–30 points.
- Declared gap: exact readiness COUNTS are unmeasured — the corpus records
  rd5short names only, so deficits are bounded intervals (veterans [1,2],
  armor [1,4], weapons [1,6], tricks [1,3]), never invented counts.
- Sense (76005 ON, days 166–167): real consequences, invisible specification
  — bearer deaths voice the decay mechanism aloud, overtime RERUN voices
  refusal's price, but nothing in the window names wave 5 or any readiness
  piece, and below-bar villages get no readiness beat by construction.
  Villagers still read like people; no robotic dialogue flagged.
- Two veteran concepts kept separate throughout: monster veterans (hardened
  older-wave monsters, logged at base wave) vs the living-villager veterans
  bar (living wave-4+ killers in waveKillLog).

## Reachability verdict (this run: measurement only, no game change)

- No content newly reached or newly blocked by this run — both arms are
  instruments on landed corpora. The wall below is the landed bands' wall,
  unchanged by this run: lesser seat reachable, full seat 0, wave 5 0.
- What this run PROVED about reachability: (a) the tile-join kill path
  cannot be priced, let alone tuned, from current recorder fields — the next
  instrument must record shout-time state; (b) the full-seat wall is a
  STACKED readiness wall (median 4 blockers per row), not a single bar —
  no single-component pursuit variant is a credible next arm.

## Village assessment (plain words)

- The village in these bands looks like a place that can win the small prize
  (lesser seat, 6 of 8 on the tile-join band) but cannot yet field the team
  the big prize demands: it cannot keep two wave-4 killers alive at once,
  it cannot hold its gear counts and its standing at the same time, and
  when allies do answer a shout they hit for single digits against
  monsters with hundreds of health left. People still sound like people
  when they answer a shout or mourn a broken treaty — the wall is not that
  villagers act wrong, it is that the numbers they must clear, all at once,
  are beyond what one fight, one ally, or one pursuit can move.

## Blanks filled / documented

- FILLED (measurement): ally-DPR flip price distribution (proxy) + the
  exact field inventory that blocks the true price; wave-5 readiness
  component audit + per-row distances + movable-component verdict.
- DOCUMENTED (open, appended to sim-findings.md): (1) recorder extension
  for shout-time fields + survival-flip price (damage to mBreak, not to
  0 HP), with the floor branch (7/24) as a separate Steve-call question;
  (2) readiness-count instrument (four counts per snapshot, ideally a
  daily/max trace) + standing peak-split recording, before any stack
  pursuit variant.
- NOT touched: one-ally rule, entry strength, deed bars, stage bar (#1223),
  demand numbers, veteran counting — all need a Steve call or the
  instruments above first.

## Wall numbers (landed bands, reported not re-claimed)

- Tile-join band (8 seeds): OFF wins 6/8, deaths 240, table 6/8, national
  ever 7/8; ON wins 3/8, deaths 311, national ever 6/8. Telemetry row view
  counts ON table 4/8 vs the landed review's table 3/8 (entered 3/8) — a
  counting-definition difference, flagged here, not a new deviation.
- Fullseat band (16 rows, 8 seeds x OFF/ON): OFF wins 2, full offers 0/8,
  starvation 0; ON wins 0, full offers 0/8, starvation 5; national ever
  6 -> 8; wave-5 0/16; full seat 0 across three substrate-family rounds.
- This run's judged corpora: tilejoin joins 24, kills 2/24; fullseat rows
  16/16 classified, veterans-blocked 16/16. Wave-5 reached 0, full seat 0,
  wins on the judged DIAG arms: none (measurement only, by design).

## Metric review

- Arm 1's primary metric (exact shout-time price) proved the corpus unfit
  for it — that is the finding, not a metric failure to re-score. The proxy
  was pre-registered in the arm prereg and is labeled PROXY in every
  mention here; it must not be quoted as the exact price. Revision for the
  NEXT join arm: pre-register the survival-flip price (damage to mBreak)
  alongside the kill-flip price, and require the recorder extension first —
  do not re-run the exact-price analysis on this corpus.
- Arm 2's metric (component classification) held: 16/16 rows, 0
  unclassified at bar level. Its declared gap (counts as intervals, not
  exact numbers) is a corpus limit, recorded in the arm evidence — the
  next readiness arm must record counts, not shortfall names.
- Rotation file (longsims-rotation.txt, currently 3) NOT advanced this run:
  convergence-directed work supersedes the rotation (tracker is the plan),
  and this run worked an axis, not a rotation lever. Documented here for
  Steve's overrule.

## Telemetry deviation check

- Ran node scripts/telemetry-check.js against baseline
  hidden_files/telemetry-baselines/scale-wall.json, metrics
  national,table,wins,exiled, on the two source corpora.
- Tilejoin off/on (--sweep-rows): LOUD table 16 -> 6 / 4, wins 16 -> 6 / 3.
  Fullseat pooled (--sweep-rows): LOUD wins 16 -> 2 (16 rows, 8 distinct
  seeds); default mode LOUD national 12 -> 0, wins 16 -> 0 (per-seed rows
  carry nationalEver/entered/won, not top-level national/wins paths).
- Verdict: ALL LOUD lines are the KNOWN WINSEAT-baseline regime artifact
  (16-config baseline count vs 8-seed bands / pooled OFF+ON rows), same as
  the 1615Z / 1630Z / 1915Z rounds. Wall numbers on the re-check match the
  landed verdicts (tilejoin OFF 6 wins, ON 3 wins; fullseat pooled 2 wins =
  substrate OFF wins). Exiled: NO LOUD line anywhere. Baseline NOT rolled.
- Tilejoin top-level glob initially found no files (corpus lives in off/
  and on/ subdirectories) — re-run with subdirectory globs; not a data gap.

## Infrastructure

- Sibling master move mid-run: sibling B merged lackingline2 evidence
  (30aeceb36, incl. a journey-deepening r66 instrument commit) onto master
  while both arms were running. Both branches rebased clean onto the new
  master (zero file overlap: sibling files are lackingline2 + journey
  instruments; ours are allydpr/w5ready only), arm files verified
  byte-identical across each rebase, proofs re-run green after each rebase
  (allydpr: exit 1 by design, same medians; w5ready: PASS), then merged
  --ff-only. No conflicts, no force.
- First plain `git rebase master` in the allydpr worktree stalled in an
  edit-todo state (no conflict, clean tree); aborted cleanly back to the
  worker's exact commits and re-ran with GIT_SEQUENCE_EDITOR=true, which
  rebased clean. Lesson: use GIT_SEQUENCE_EDITOR=true for coordinator
  rebases in this environment.
- Second worktree registration initially failed with container write
  failures ("unable to write file" + "Could not reset index"); the failed
  attempt left an unregistered branch at exactly the master tip — deleted
  that branch (my own partial state, zero commits, no registry entry) and
  re-registered clean. No ref surgery on anyone else's state.
- Safe-commit index clobber hit both worker commit pairs (workers repaired
  via HEAD-blob cacheinfo with hash verification); coordinator commits in
  this run: see git log (this file's commit verified below).
- check.js --quick NOT re-run at coordinator level (zero src/js in both
  arms; arm proofs are the landing gate, same call as 1615Z/1630Z/1915Z).
- Sibling trees (nighttravel-bank/verdict, creekpath-armc, journey2-social,
  raidguard, journey-scale) all left untouched; reaper removed nothing.

## Convergence state

- scale-onramp: converging (NOT converged). The join kill path is now
  priced (proxy) and shown un-carryable by one ally, and the full-seat wall
  is decomposed to a stacked readiness wall with veterans binding everywhere
  — but no wave-4 field party kill path landed, full seat 0, wave 5 0.
- food-economy: converging (untouched; sibling loop B lane).
- Claim deleted; lock deleted at closeout. Merged locally, pending ship.
  Evidence: this file (coordinator) + sim-allydpr-a.md + sim-w5ready-a.md
  (all on master, merged locally pending ship).
