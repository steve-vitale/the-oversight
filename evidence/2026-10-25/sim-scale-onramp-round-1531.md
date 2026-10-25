# sim-scale-onramp-round-1531 — coordinator evidence (axis scale-onramp)

Run: fleshout-loop-b-20261025T1531Z (Sun 2026-10-25 ~10:28 CDT onwards).
Axis: scale-onramp (converging). Standing directive applies: every run
attacks the scale wall directly. Sibling loop-B run on food-economy
(claim 1530Z, landed sim-food-round-1530 mid-run) NOT touched.

## PRE-REGISTRATION (run level; each arm's binding bars are in its own evidence file, written before its sweeps)

- Arm 1 sim-poolpres-lever-b: next blank #1 from sim-poolpres-a —
  wave-3+ weight in maintenance spawns once wave 3 is unlocked.
  Substrate tableseat-nowait, seeds 73671–73678, 180d death-aware,
  raftdraft-diag recorder reused verbatim. PRIMARY band pool wave-3+
  share; GO pool share >= 23% AND wave-3+ per raid >= 0.9 (mean-count
  bar: 23–24% buys one wave-3+ raider per raid ON AVERAGE, not one in
  every raid). GUARDS wins >= 3/8, national-ever >= 6/8, death total
  within ±20% of verified control 234.
- Arm 2 sim-belltoad-cand3-b: candidate 3 — strike-or-flee fallback
  after the 2-shout cap. Substrate tableseat-nowait +
  deathcensus-diag recorder, seeds 73671–73678, 180d death-aware.
  STEP 0 target-existence gate first (target class: engage, vDie,
  r>=2, shouts==2, dealt==0, hold fired); KILL if the class is 0 on
  control. PRIMARY (only if Step 0 finds a target): target class
  control → 0. GUARDS: no new belltoad death, no new death class,
  total deaths within ±20% of control, spool/nielsen timed-setup
  completions do not regress.
- Pilot = the 8-seed band for both arms; no confirm spend (both arms
  resolved at pilot).
- No back-to-back second round was run: see "No second round" below.

## RESULTS

### Arm 1 — pool-presence lever: NO-GO (mechanism KILLED at its ceiling)

The worker tested the strongest possible version of the mechanism:
once wave 3 is unlocked, maintenance top-ups become 100% newest-wave
(100% wave-3+). If 100% fails, no weaker weight can pass.

| Metric | Control | Lever | Bar | Result |
|---|---|---|---|---|
| Pool wave-3+ share | 7.16% (107/1,494) | 7.16% (107/1,494) | >= 23% | FAIL |
| Wave-3+ per raid | 0.400 | 0.400 | >= 0.9 | FAIL |
| Wins | 4/8 | 4/8 | >= 3/8 | PASS |
| National-ever | 7/8 | 7/8 | >= 6/8 | PASS |
| Death total | 234 | 234 | within [187.2, 280.8] | PASS |
| Raids with >=1 wave-3+ raider (secondary) | 26/85 | 26/85 | — | — |
| Wave-5 pool presence (secondary, finding only) | 0 | 0 | — | — |

The lever corpus is BYTE-IDENTICAL to the control corpus on all 8
seeds (85 raids, 361 raiders, identical per-raid pools, wall numbers,
deaths). This is not a dead edit: a proof test drove a real game to
wave-3 unlocked via the real kill ledger and showed
maintainWorldMonsters() spawning 100% wave-3 when the pool is below
cap. Conclusion, in plain words: the village's monster pool already
sits well above the number the game tries to maintain (median 17
monsters vs a cap of 8), so the maintain tap never opens after wave 3
unlocks — turning it up tunes a tap that is already closed. The pool
is filled by other spawn paths plus monsters that simply live a long
time. Tuning maintain weights further cannot move the pool, and no
weaker weight was tried after the ceiling failed (that would be
re-trying a killed mechanism). Game code reverted; measurement only.

### Arm 2 — belltoad candidate 3: KILLED at Step 0

| Metric | Control |
|---|---|
| TARGET-class belltoad deaths (DIAG-confirmed) | 0 |
| Broad form (shouts==2, dealt>0) | 0 |
| Belltoad engage-intent deaths | 1 — 73677 d38 liam_davis, r=2, dealt 8, shouts 0, never held |
| Total villager deaths | 200 (27, 23, 23, 16, 21, 29, 33, 28) |
| National-ever / table / wins | 7/8 / 4/8 / 4/8 |
| Wave-4 / wave-5 | 6/8 / 0/8 |
| Days, full 8-seed distribution | [180, 97, 124, 180, 135, 70, 143, 116] |

The control band reproduces morale-a's control exactly, so the kill is
measured against a stable band, not a moved trajectory. The sole
belltoad death is a fighter outnumbered four-to-one losing a pack
fight in round 2, before any morale decision ever runs — not a fighter
misusing a trick. All three belltoad candidates are now resolved on
this band: candidate 1 (chorus break) landed, candidates 2 and 3 killed
on absence of target. A future arm must first run the Step-0 DIAG
hold-capture on its band and only implement if a target-class fight
exists, or it will re-prove this kill a fourth time.

Side audits from candidate 3 (not bundled into any lever): gavel
confess repeatability CONFIRMED — the gate checks only an active
trial and never reads the fired flag, so confess can repeat across
rounds while a trial is active (fix still open; any future
counter-list use must gate it first). Nielsen coverage is vacuous on
this band (zero nielsen fights), so the nielsen leg of any
timed-setup guard must be re-baselined elsewhere.

## VILLAGE ASSESSMENT (plain words)

The villages on this band live a real, legible life: they reach
national standing in 7 of 8 runs and lesser seats at the table in 4
of 8, but the full seat is still unreached and wave 5 never appears.
Villagers read as people in transcripts — they note empty snares,
choose mending over hauling what would rot, and are named at the door
when they defend. What the village cannot do yet is meet a bigger
monster at its wall: only 7 in 100 monsters in the raid-time pool are
wave-3 or higher, so raids stay small-monster affairs, and the one
lever that should have fixed that (turning up big-monster
maintenance spawns) moves nothing because the pool is already fuller
than the game's own target. The blank this run filled is a negative
one, and it matters: the next run must find out WHERE the pool's
monsters actually come from, instead of turning a closed tap harder.
The belltoad story is closed on this band: knowing the counter no
longer kills villagers (candidate 1 fixed that), and there is no
trick-trap death left for candidates 2 or 3 to save.

## WALL NUMBERS (shared band, both arms' control)

- National-ever 7/8, table 4/8, wins 4/8 (lesser-seat only)
- Wave-4 6/8, wave-5 0/8
- Median survival 135d all-runs / 180d wins-excluded
- Death total 234 (poolpres band; villager deaths 200 on the
  deathcensus band — different counters, both reported by their arms)

## REACHABILITY VERDICT

Waves 1–4 reachable; wave 5 NOT (pool presence 0/1,494 in both bands,
twice confirmed). Regional → national reachable (7/8). The table
reachable for lesser seats (4/8); the full seat NOT reached. The win
flag fires for lesser seats only. Vests: not measured by these arms.

## SENSE

- Poolpres: day-60 raid line lists raiders by name with no special
  billing even for the wave-2 apex (The Moderator) — a wave-3+ raider
  would read identically. The palisade-escalation narration blank is
  reconfirmed and deliberately NOT bundled into the numbers arm.
- Belltoad: "R1: Liam strikes for 8 (37 left)" … "R2: Resonant Croak
  hits Liam for 13 (0 left)" — no shout line, no hold line. A pack
  kill, not a trick trap.
- Wait narration repeats verbatim ("You wait. The light changes.
  Nothing asks anything of you.") — a narration-variety blank for
  the backlog, not a numbers blank.

## METRIC REVIEW

- No metric was re-scored mid-run. Poolpres NO-GO is judged exactly
  as pre-registered (both PRIMARY legs fail; guards pass but do not
  rescue a failed PRIMARY). Belltoad KILL follows the pre-registered
  Step-0 clause (target class 0 → KILL, not a PRIMARY miss by adverse
  effect).
- Poolpres estimand honored: the mean-count bar (23% buys ~1 wave-3+
  raider per raid ON AVERAGE) was used, not an every-raid bar.
- Control verification: poolpres control verified exactly against
  the poolpres-a sketch (234 deaths, 7.16%, 4/8 wins, 7/8
  national-ever) before judging guards; belltoad control reproduces
  morale-a exactly. Neither arm re-based its guards on a moved
  trajectory.
- Balanced-panel note: balance-panel.js cannot ingest per-seed
  recorder corpora (fifth sighting counting this run's two arms);
  each arm's sweep-compare table + analyzer output is its comparison
  of record.

## NO SECOND ROUND

Both arms resolved (kill + no-go) inside ~30 minutes, which meets the
back-to-back fallback's trigger on its face. No second round was run
because there is no designed second round to run: the promoted next
step is a DIAG (spawn-source audit — which paths fill the pool past
cap 8 to median 17, and do they favor wave-1/2?) with no
pre-registered design yet, the second poolpres mechanism (lingering /
later raid timing) is sketched but un-designed, and the belltoad lane
is fully closed. Spawning undesigned arms would violate the
pre-registration rule the run itself enforces. The audit goes to the
next run with its own pre-registration. Fast kills are throughput:
two dead mechanisms, cleanly killed, with the next question named.

## TELEMETRY DEVIATION CHECK

NOT RUN, per the standing 1027Z instruction: telemetry-check reads 0
wins/national on per-seed recorder rows whose analyzer-proven counts
are wins 4/8 and national-ever 7/8, and the scale-wall baseline warns
against comparing courtship substrates to its WINSEAT regime.
Baseline NOT rolled. Do not re-run telemetry-check on recorder rows
without a counting fix or a regime-segregated baseline.

## INFRASTRUCTURE NOTES (coordinator, read before the next run)

- Master moved twice under the run (sibling B landing
  sim-food-round-1530 b8f1383f3 + journey-landing r51 acef32137).
  Both arms rebased clean in their own worktrees (belltoad 1 commit,
  poolpres 2 commits; branch diffs verified identical to the worker
  commits, 0 src changes on both), re-proved on the new base
  (belltoad --step0 + --diag: mismatchSeeds=0, TARGET=0; poolpres
  compare: NO-GO reproduced), then merged ff-only — no force.
- Safe-commit index clobber hit BOTH workers' commits (bogus staged
  deletions in the main index, commits themselves correct); both
  workers repaired via per-file cacheinfo and verified clean before
  handoff. No clobber on either coordinator merge.
- No EPERM ref-write flap blocked this run's ref writes. All 16
  poolpres rows + 8 belltoad control rows wrote first try.
- No back-to-back second round (see above). Sibling trees, claims,
  tracker, and lock untouched except this run's own claim/lock
  (deleted at close) and the tracker + findings appends above.

scale-onramp stays converging (NOT converged): the pool-presence
premise is confirmed but its maintain mechanism is dead; the binding
question is now spawn sources, not spawn weights. The directive stands
until the tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling B loop).
Claim deleted; lock deleted. Merged locally, pending ship.
Evidence: this file (coordinator) + sim-belltoad-cand3-b.md +
perseed-sim-belltoad-cand3-b/ (commit 7c2e06ce9) +
sim-poolpres-lever-b.md + perseed-sim-poolpres-lever-b/ (commits
3552aef48, 4923106a1).
