# sim-scale-onramp-round-1715 — coordinator evidence (loop A, axis scale-onramp)

Run: fleshout-20261025T1715Z. Loop B live on food-economy for the whole run
(claim fleshout-loop-b-20261025T1630Z, arms causeext/causemeta/haulcount) —
NOT touched. B landed sim-food-round-1630 (f027377e1) mid-run; both arms
rebased clean onto it in their own worktrees (arm files verified
byte-identical across each rebase), then merged --ff-only. New loop-B trees
(sim-deathrow-b, sim-haulinvert-b) appeared during closeout — NOT touched.

This run worked scale-onramp (converging), taking the 1615Z next blanks (1)
tile-entry lever and (2) wave-5 births zero, in order, on the shared
tableseat-nowait band (seeds 73671–73678, 180d death-aware). At most one
game-code arm could land; NEITHER landed as game code (one DIAG, one
killed record).

## Arm 1 — sim-w5births-a (DIAG ONLY, zero src/js): DIAG-GO, LANDED fea3d2709

Question: why is wave 5 never even born? Read-only birth-gate recorder
(reconstructs gated standing/unlocked-wave from daily reads; wraps
spawnWaveTarget to record pool-top and returned target; never calls the
gated function mid-run). Detgate passed; control gate reproduced EXACTLY
(deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85,
raiders 361, median 135d, pool 1,494).

Headline: wave 5 is never born because no village ever becomes eligible,
and the chain breaks at a different link per seed. Spawn targeting is
EXONERATED: 309 spawnWaveTarget calls, pool top never 5, target 5 never
returned; at pool top 4 the lottery returned 4 in 10/15 calls (67% vs
designed 60%) — it picks the newest wave when offered it; it never saw
wave 5.

Per-seed classification (maxRaw/maxCapped/maxGated; faced4/killed4; w4 births):

| Seed | End | Standing max | Faced/Killed | W4 births | Label |
|---|---|---|---|---|---|
| 73671 | survived 180d | 127/127/127 | 0/0 | 1 (d179) | FACED4 — unlocked d177, 3d window |
| 73672 | won lesser d97 | 167/167/167 | 0/0 | 2 (d79, d86) | FACED4 — genuine: eulogy stood in d89 raid pool, never fought in 11d |
| 73673 | won lesser d124 | 122/122/99 | 0/0 | 0 | READINESS4 — veterans 0/1 all run, pinned at 99 for 58d |
| 73674 | survived 180d | 167/167/167 | 0/0 | 3 (d170/172/180) | FACED4 — unlocked d157 |
| 73675 | won lesser d135 | 267/227/199 | 0/0 | 0 | SPAWN4 (no-window) — unlocked d134, 1d window, 0 post-unlock target calls; co-blocker: gated held at 199 by defer5 (rd5 veterans 0/2; plenty cap did NOT block, capped 227) |
| 73676 | village-lost d70 | 50/50/50 | 0/0 | 0 | STANDING100 |
| 73677 | village-lost d143 | 127/127/127 | 1/0 | 4 | STANDING200 — faced suburb d136, 73 short of 200 |
| 73678 | won lesser d116 | 172/172/172 | 1/1 | 1 | STANDING200 — only wave-4 kill on the band (strike, d115); 28 short of 200 |

Counts: FACED4 3, READINESS4 1, SPAWN4 1, STANDING100 1, STANDING200 2,
SPAWN-TARGETING 0. Band totals: wave-4 births 11, wave-4 faced seeds 2/8,
wave-4 kills 1, wave-5 births 0, eligible moments 0.

Two mechanism notes (documented, not chased): (1) raid-pool presence ≠
faced — 73672's eulogy raided but earned no faced credit, since wavesFaced
feeds only on blow-by-blow fights; (2) faced-without-birth via cast
wanderers — 73678's strike was fought/killed with no world-monster birth.
The veterans bar is a revolving door (unlock-day veterans dead by end on
73671/73672/73675/73677; only the peak ratchet remembers).

Coordinator verification: the arm analyzer run on merged master reproduces
the classification exactly (all 8 rows, all counts). The analyzer rewrote
analysis.json by 1 line (generated timestamp class); restored from HEAD,
tree clean. Proof: node scripts/test-w5births-diag.js, exit 0.

Evidence: evidence/2026-10-25/sim-w5births-a.md +
perseed-sim-w5births-a/ (commit fea3d2709).

## Arm 2 — sim-tileentry-a (game-code ceiling test): NO-GO, mechanism KILLED, record LANDED 812d3b48a

Pre-registered ceiling: once unlockedWave() >= 3, tile-entry spawns target
the newest wave outright (100% wave-3+) instead of the 60/25/15 ratios,
tile-entry path only — spawnWaveTarget itself, maintain, castMonster
untouched, spawn chance unchanged. Substrate tableseat-nowait + spawnsrc
recorder verbatim, pilot band only. Lever-code proof (run before revert,
PASS, output preserved in arm evidence): driven real game through real
checkEncounter — pre-unlock 73 spawns all wave 1; post-unlock 117/117
wave 3; shared spawnWaveTarget still mixed (0.55 wave-3 over 200 draws).
The lever was live and call-site-only. Game code REVERTED before commit
(zero src/js diff, verified); commit carries measurement + corpus only.

Control gate passed exactly (deaths 234, national-ever 7/8, wins 4/8,
raids 85, median 135d), so the verdict is judged on a solid baseline.

| Metric | Control | Armed | Bar | Result |
|---|---|---|---|---|
| Pool wave-3+ share | 7.16% (107/1,494) | 9.71% (122/1,256) | ≥23% | FAIL |
| Drafted wave-3+ / raid | 0.400 (34/85) | 0.649 (50/77) | ≥0.9 | FAIL |
| Wins | 4/8 | 2/8 | ≥3/8 | FAIL |
| National-ever | 7/8 | 5/8 | ≥6/8 | FAIL |
| Deaths | 234 | 272 | 234 ±20% | PASS |

Per the pre-registration, a failed 100% ceiling KILLS tile-entry targeting
as a candidate — no weaker targeting weight can beat it. Why the ceiling
fails: tile-entry wave-3+ births did rise (45 → 79, 19.1% → 32.8% of tile
births), but pool share barely moved because (1) armed trajectories
truncate (villages die/lose earlier, cutting the late high-share raids —
the frozen-corpus 41% estimate assumed control trajectories); (2) new
wave-3+ stock turns over faster (1.47 pool appearances/birth vs 2.33 in
control); (3) the immortal old core persists (maintain + hushwolf = 38%
of the armed pool, all wave-1/2). No armed seed exceeded 17% pool share.
Death-cause shift: player arena deaths 50 vs 28, villager:monster 14 vs 5
— the stronger world kills in arenas and monster fights.

Coordinator verification: the arm measurement script run on merged master
reproduces every number exactly, including the NO-GO verdict line
(CTL/ARM dirs as committed). Proof: CTL=.../control ARM=.../armed node
scripts/test-tileentry-measure-20261025.js, exit 0, read-only (no tree
changes). The worker's check.js --quick session vanished after ~6 min
with no retrievable output — reported as incomplete, not a result; the
committed state has zero src/js, so game-code check state is unchanged.

Sense: seed 73671 day-60 raid line is verbatim the same unmarked line as
prior runs (wave-2 apex Moderator, no wave/escalation marker) — fourth
confirmation that the palisade-escalation narration beat does not exist.
Villagers still read as people. Carried blank, not bundled.

Evidence: evidence/2026-10-25/sim-tileentry-a.md +
sim-tileentry-a-sense.txt + perseed-sim-tileentry-a/ (commit 812d3b48a).

## Wall (this run's judged corpora)

Shared control band (both arms replicate exactly): national-ever 7/8,
national-final 6/8, invited 4/8, entered 4/8, wins 4/8 (lesser seat only),
wave-3 8/8, wave-4 6/8, wave-5 0/8, full seat 0/8, median 135d, deaths 234.
Tileentry armed: national-ever 5/8, final 3/8, entered 2/8, wins 2/8
(lesser only), wave-4 6/8, wave-5 0/8, full seat 0/8, median 140d, deaths 272.

## Telemetry + balanced panel

Telemetry deviation check NOT RUN, per the standing 1027Z instruction
(recorder rows are not panels; the checker reads 0 wins/national on rows
whose analyzer-proven counts are 4/8 and 7/8, and the WINSEAT baseline
warns against courtship substrates) — baseline NOT rolled. Balanced
panel: no compare .md — balance-panel.js cannot ingest recorder corpora
(seventh sighting); each arm's pre-registered analyzer, coordinator-
reproduced, is the comparison of record. Tooling note from the tileentry
arm: the poolpres analyzer's census gate cannot run on spawnsrc rows
(it requires a top-level row.diag they don't carry) — a row-shape
mismatch, not a data problem; primary metrics were computed from the
same raftdraft fields by the new measurement script.

## Metric review (§14, required)

No metric was re-scored mid-run. Both arms judged exactly against their
pre-registrations. No revisions proposed by this run; the tileentry
verdict stands on its ceiling pre-registration, and the w5births
classification stands on its task map.

## Infrastructure

- No EPERM ref-write flap blocked this run's writes; worktree
  registrations slow (~2–2.5 min each) under sibling load, all succeeded.
- Safe-commit index clobber hit both worker commits — repaired via
  cacheinfo each time, commits verified correct (worker-reported; the
  merged commits' file lists match the arm contents).
- ff-only correctly refused both diverged branches after loop-B's
  mid-run landing; both rebased clean in their own worktrees with arm
  files verified byte-identical, then merged --ff-only in order
  (w5births, then tileentry).
- Coordinator analyzer re-run rewrote one committed corpus line
  (timestamp class); restored from HEAD before release — future
  coordinators run analyzer proofs on a scratch copy, not the corpus.
- No back-to-back second round: one arm landed (DIAG-GO), one killed,
  elapsed >30 min, and the next blanks need design, not ready arms.

## Convergence state

scale-onramp stays converging (NOT converged): the wave-5 question is
now decomposed per seed (standing / readiness / faced-window /
spawn-window, never targeting), and tile-entry targeting is killed at
its ceiling — but wins still come only through default-OFF courtship +
seat instruments on the lesser seat, the full seat is still unreached,
and wave 5 still has zero births. The directive stands until the tracker
records this axis converged on measured evidence. Next blanks, in order:
(1) a mechanism that moves the OLD wave-1/2 core (departure, mortality,
draft weighting) or a re-derived 23% bar — NOT another birth weight;
(2) the wave-5 eligibility chain per seed class: standing-200 reach on
73677/73678-class seeds, faced-credit for raid-pool wave-4s (73672
class), spawn windows for late unlocks (73675 class); (3)
palisade-escalation narration beat for wave-3+ raids (carried, fourth
confirmation it does not exist); (4) defender-fight wound manufacture
(carried). food-economy stays converging (untouched; sibling B loop).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
