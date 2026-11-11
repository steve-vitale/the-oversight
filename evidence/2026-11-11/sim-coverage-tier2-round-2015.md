# sim-coverage-tier2-round-2015 — Coverage Tier 2 siege ADOPTION (coordinator evidence)

Run: oversight-flesh-out-loop, run fleshout-20261111T2015Z, axis coverage
program Tier 2 siege (ADOPTION of the dead 1815Z run). Loop B live on its
1830Z claim (proofrefresh-b5, tributedeliv-b, mournblooded-b) — NOT touched.
Master at claim f2c35954b; landed fe7b4f9f3. Merged locally, pending ship.

## STALE-LOCK RECOVERY at start

Lock fleshout-20261111T1815Z, created 18:20:13Z — 115 min old at run start
(>90-min fallback). Registry heartbeats for its trees 40+ min stale
(sim-siegefirst-a 19:33:39Z, sim-siegedesign-a 19:35:02Z, both >15-min
guard). No live siege worker procs; no writes in sim-siegefirst-a since
19:34Z. Previous run DEAD by the guard's own rule. Lock deleted, 1815Z
claim retired to .DEAD with a note. The 1710Z claim (superseded by the
1815Z adoption, both arms accounted for) was also retired to .DEAD.
Pre-flight: main tree clean, disk 35%.

## What the dead run left — and what was adopted

- Design arm sim-siegedesign-a: LANDED on master as 3eec28a81 before the
  run died. Siege design note + substrate proof (SUBSTRATE-MISSING
  confirmed by audit; the design names the raid → treeline → resolution
  episode the engine already stages).
- Measurement arm sim-siegefirst-a: COMMITTED 0edcc73e6 at 19:31:18Z but
  never merged. Worktree clean, 0 uncommitted files. This run adopted it
  whole — no re-simulation, no re-judgment. The pilot and its verdict are
  the 1710Z/1815Z arm's; this run verified and landed them.

## Adoption verification (this run, on the stranded commit)

- Rebased onto explicit master SHA f2c35954b (clean, no conflicts) →
  fe7b4f9f3. Master had moved under the dead run (proofrefresh-b5, 4
  commits); zero file overlap with the arm's 22 files.
- Proof re-run on the rebased tip: `node scripts/test-siegefirst-a.js`
  → **81 passed, 0 failed** (exit 0). Re-run on merged master: 81/81
  again. No src/js, no green-list files — full check.js not re-run
  (2330Z precedent: zero src/js, zero green-list files).
- Analyzer determinism re-run: `siegefirst-analyze-20261111.js --out
  /tmp/...` on the committed 16-file corpus reproduces the committed
  summary exactly on every judged field — GO unclassified 0 / residue 1
  / NO-GO, wall, raids, lingerers, deaths, fights, perSeed all equal.
- Merged ff-only into master; `git merge-base --is-ancestor` verified;
  main tree clean after merge.

## The arm's verdict (adopted, not re-judged)

sim-siegefirst-a, seeds 210401–210408, 150d, competent policy, 8 seeds ×
2 legs (control vs neutral instrument): **NO-GO on the literal
pre-registered bar — by one row.** Unclassified 0, residue 1 (seed
210405, redactor m271, lingerer ending with no telemetry witness).
Trajectory neutrality perfect (control ≡ neutral on all 8 seeds).
Instrument validity GO on the classification itself (the two NO-GO
clusters were diagnosed as analyzer knowledge gaps — ShowPool roster,
fieldFight telemetry, moved-on valve — fixed in-analyzer on the same
corpus, no re-simulation). Full numbers in
evidence/2026-11-11/sim-siegefirst-a.md; summary in
evidence/2026-11-11/siegefirst-pilot-summary.json.

## WALL NUMBERS (siegefirst pilot corpus, 8 seeds)

- Wins 0/8. National 0/8. Table 0/8. Regional 8/8.
- Wave 4: 8/8 seeds. Wave 5: 0/8 (one wave-5 monster spawned in 494
  spawns; no wave-5 unlock). Wave 6: 0 spawns.
- Median survival 124d (survivals 78, 88, 118, 124, 124, 135, 150, 150).
  Six villages lost, two survived to the 150d horizon.
- Deaths 579 (monster 447, villager-caused 128, person 4). Standing
  parks at 199 on 7/8 seeds; 210405 stuck at 100.
- The siege tax is real: 80 raids, 89 lingerer episodes, 355 gorge
  nights, 394,788 kcal gorged; the-siege crisis fired on 8/8 seeds
  (58×); siege contest fired 12× on 5 seeds.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js --baseline scale-wall.json --current
perseed-siegefirst-a/*-control.json --metrics national,table,wins,exiled
--sweep-rows --allow-recorder-corpus` (the script refuses recorder
corpora without the flag — the per-seed files carry anchorCommit):
**3 LOUD lines — national 12→0, table 16→0, wins 16→0 — all REGIME
artifacts.** The baseline's own _regime note forbids this comparison:
WINSEAT full win-stack substrate (SEATDRIVE=1 etc.) vs a competent
pre-seat measurement corpus where wins are structurally ~0. No
investigation item. Baseline NOT rolled.

## Infrastructure

- REGISTRY LOCK CONTENTION (~20:17–20:21Z): the playtest loop's
  `worktree-register.sh journey2-social` held the registry flock for
  ~4 min while its `git worktree add` ran a slow `git reset --hard`
  (D-state, heavy I/O on the shared tree). My heartbeat, Loop B's
  release of sim-proofrefresh-b4, and the reaper all queued on the
  flock. NO intervention: no kills, no lock bypass — the checkout
  finished, the lock freed, my queued heartbeat landed 20:20:55Z.
  Lesson for the next run: a registering loop can squat the flock for
  minutes; queued registry ops are safe to leave waiting, and the
  reaper being blocked is itself protection against a stale-heartbeat
  reap in the meantime.
- No EPERM flap this run. No safe-commit index clobber on the
  coordinator commit (see below).
- LEFTOVER: `~/workspace/worktrees/sim-siegedesign-a/` (1.5G, 16,116
  files) has NO .git file — release debris from the 1815Z run: git
  worktree list does not show it, registry says done-merged. Verified:
  design evidence byte-identical to master, zero files newer than the
  19:35Z release, zero filenames outside master. NOT deleted this run —
  worktree-release.sh does not verify tree cleanliness, so "done-merged"
  is an assertion, not a proof that nothing uncommitted sits in it.
  Disk is at 35%; leave the deletion decision to a run that can verify
  content against the tree's own base, or to the ship loop.

## Findings appended

16 lines appended to hidden_files/sim-findings.md (from the arm
evidence's FINDINGS section): ShowPool roster gap, fieldFight
combat_start gap, moved-on valve, the 210405 redactor residue, say-cap
front-loading, say bucketing misfiles, treeline filler repetition, twin
name duplication, shelterMuster unobserved, wave-6 fiction-only, gorge
tax scale, the-siege voice single-template, villager-caused deaths
128/579, standing parks at 199, trajectory neutrality, contradictory
linger/drift lines.

## Convergence state

- Coverage program: COMPLETE on measurement. Siege was the last
  unchecked item; with sim-siegedesign-a (design) + sim-siegefirst-a
  (first numbers, NO-GO on literal bar by one residue row) landed, every
  Tier 2, Tier 3, and Tier 4 item is now [x]. Per the program rule
  ("when every item above is [x], the program is done"), report it as a
  landed program in the next executive update, not per item.
- scale-onramp: stays CONVERGING (NOT converged). National 0/8, table
  0/8, wins 0/8, wave 5 0/8 on this band; the scale wall stands. The
  standing directive stands until the tracker records scale-onramp
  converged on measured evidence.
- food-economy: stays converging (untouched; sibling B loop).

## Metric review

The adopted arm's bar ("zero unclassified rows") did its job — the
strict bar forced the analyzer to learn the engine's real vocabulary
(ShowPool roster, fieldFight telemetry, moved-on valve) instead of
grading its own ignorance as clean. The one-row NO-GO is diagnostic,
not fatal: the instrument's data was complete; one lingerer ending has
no telemetry witness in the engine. The arm's own metric review
recommends the verdict name the KIND of gap (missing roster vs missing
telemetry path) next time — carried, not changed here. No re-scoring:
the NO-GO stands as judged.

## Closeout

- Arm commit fe7b4f9f3 merged ff-only, ancestor verified, main tree
  clean. Coordinator evidence committed as this file's own commit (SHA
  recorded in the tracker review entry), merged ff-only, ancestor
  verified.
- Worktree sim-siegefirst-a released as done-merged, branch deleted.
- Reap sweep run; main tree clean at closeout.
- Claim deleted; lock deleted.
- Rotation left at 4 (convergence work does not cycle it).
