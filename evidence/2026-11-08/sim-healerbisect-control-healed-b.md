# sim-healerbisect-b — HEALED control, full 8 seeds (adoption)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0730Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerctl-hea-b (base master `1cac498d5`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1, 0530Z run) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008. Corpora committed under `evidence/2026-11-08/perseed-healerctl-healed-b/` (the 0530Z run's /tmp corpora were wiped — committed evidence is the durable record). Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: HEALED CONTROL PASSES — midpoint may proceed

Full-8 healed control at `c9fea16ee`: **median 145d** (bar ≥120d) and **sits 4/8** (bar ≥4/8). Every seed reproduces its fightloop reference value exactly on days, and the subset four reproduce days, sit day, standing, and wave-4 kills exactly. The healed endpoint is verified on current instrument, so the bisect premise stands: the flip is real, the healer is somewhere in `cf22937b8..c9fea16ee`, and the next step is the midpoint screen (#9 `4e6fa44ab`) — dispatched by the coordinator, not started here.

## Per-seed table — healed control `c9fea16ee` (this run)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs fightloop reference |
|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | village-lost | 275 | 5 | — | 5 | 2 | 105d exact |
| 53002 | 140 | village-lost | 199 | 4 | — | 1 | 0 | 140d exact |
| 53003 | 65 | village-lost | 199 | 4 | — | 1 | 0 | 65d exact |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | exact (150/d90/199/3) |
| 53005 | 150 | survived | 199 | 4 | lesser d99 | 2 | 0 | exact (150/d99/199/2) |
| 53006 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | exact (150/d90/199/3) |
| 53007 | 50 | village-lost | 75 | 3 | — | 0 | 0 | 50d exact |
| 53008 | 150 | survived | 199 | 4 | lesser d97 | 3 | 0 | exact (150/d97/199/3) |

0 instrument errors on all 8 seeds. Screen subset {53004, 53005, 53006, 53008}: **HEALED 4/4**. Analyzer full-8: **HEALTHY, median 145d, sits 4/8**. Median check: sorted days [50, 65, 105, 140, 150, 150, 150, 150] → (140+150)/2 = 145d.

## Flip table: collapsed (bisect C2 reference) → healed (this run)

| Seed | Collapsed days | Healed days | Δdays | Collapsed seat/sat | Healed seat/sat | Collapsed stand | Healed stand | Collapsed w4 | Healed w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | 105 | +17 | — | — | 199 | 275 | 3 | 5 | village-lost → village-lost |
| 53002 | 84 | 140 | +56 | — | — | 100 | 199 | 0 | 1 | village-lost → village-lost |
| 53003 | 68 | 65 | −3 | — | — | 120 | 199 | 0 | 1 | village-lost → village-lost |
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 | village-lost → survived |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 | village-lost → survived |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 199 | 1 | 3 | village-lost → survived |
| 53007 | 63 | 50 | −13 | — | — | 125 | 75 | 0 | 0 | village-lost → village-lost |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 3 | village-lost → survived |

Collapsed reference: bisect C2 per-seed table (median 70.5d, sits 0/8). The four discriminating seeds all flip death → 150d survival + sit; the four non-discriminating seeds move little (53001 +17d, 53002 +56d, 53003 −3d, 53007 −13d) and still die — exactly the prereg's metric-review note: the healer restores the median without restoring C1 exactly, and the residual 53003/53007 deaths are a separate question, not a reason to re-score.

## Mechanism — the wound is the same, the recovery is different (seed 53005, both controls)

The 53005 fallen list this run matches the 0530Z healed subset exactly through the split: Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36, Desmond dies of sickness d37, Patrick to a monster d39 — and the village keeps going. It loses 22 people over 150 days (the wild, monsters, contests, the arena) but never starves anyone, sits the lesser seat on d99, and survives. Same first deaths as the collapsed version; the second month no longer thins the village to starvation.

Death-cause census, healed full-8 (96 fallen): 'the wild' 39, monster 16, sickness 9, 'a wound that wouldn't close' 6, the arena 5, combat 4, ambush 4, contest 4, betrayal 2, 'a stranger' 2, 'the night' 2, 'the expedition' 1, The Callback 1, **starvation 1** (Boris, seed 53007, d47 — one of the two seeds that still die early). The healing still shows as starvation nearly disappearing, not as fewer violent deaths.

## Seed 53001 — the wave-5 road is open, the village still dies

53001 is the only seed to unlock wave 5 (standing 275, the only standing above 199): two wave-5 kills, both The Editor, d86 (by Nino) and d91 (by Tariq), both via companions — then the village is lost d105 with no sit. Wave 5 is reachable on the healed code, but reaching it does not save the village. The table still prices nothing here: no seed reaches national, no full seat, no win.

## Wall numbers (healed control, full 8)

- National 0/8, table sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 7/8 (all but 53007, maxWave 3), wave-5 unlocks 1/8 (53001 only).
- Median survival 145d; max 150d; min 50d.
- Telemetry deviation check: not run — this is a DIAG control with no lever before/after; the endpoint reproduction is the validity check (same as the 0530Z run).

## Village assessment — what the villages looked like

Four villages out of eight sit down at the lesser table and live out the 150 days; four die on the road. The four that live are not the lucky ones — they take the same early deaths as the collapsed versions (an ambush, a monster wearing a dead villager's face, the wild, a fight) and then keep feeding themselves through five months of further losses. The four that die are the ones where the second month still goes wrong: 53003 loses nine people by d63 and is gone d65; 53007 loses its scholar to the night on d41, starves Boris on d47, and is gone d50. The healed code does not make villages safe. It makes them able to absorb the first month of dying without the pantry emptying — and on half the band, that is the difference between a village that sits and a village that starves.

Sense-check on the instrument: the sit days read from `takeseatStats.seatDay` (the day the seat is TAKEN), not the daily `tableSeat()` rows. No dialogue in these corpora reads robotic on its face; the death lists are the story here, and they cohere (same first deaths, divergent endings). One sense note for the backlog: scholar deaths in the analyzer output carry `atHaven: true` with map coordinates (3–5, 2–4) on nearly every row — the scholar keeps dying "at Haven" while in combat in the wild, which reads as the death record stamping the home tile rather than where the fight happened. Flagged as a finding below, not chased here.

## Method note — flap-resilient extraction (deviation from the 0530Z checkout method, forced by infrastructure)

The write-denial flap was live for this whole run (see below). A plain `git checkout c9fea16ee` was impossible while index.lock writes were refused, so the old code was extracted read-only with `git archive c9fea16ee src scripts index.html manifest.json version.json | tar -x` into `/dev/shm/healer-scratch-c9fea16ee/` (the worktree scratch dir `scratch-c9fea16ee/` was also attempted first — the flap turned both into 0-byte files). The flap forced a chunked extraction: the full tar failed twice (nonzero 1/9991, then 0/9991), so the needed 779 files were re-extracted in 10-file chunks gated on a single-success O_EXCL probe, hammering chunks back-to-back inside each clear window. Extraction completed 08:05:48–08:06:32Z (779/779 non-zero, game.js 2,849,792 bytes, version.json `09e57528e-20261107-233501` — the #13 bump stamp, consistent with `c9fea16ee`).

- The three frozen instrument files were overwritten from master tip `1cac498d5` via `git show` and verified byte-identical to the worktree tip copies (and, checked first, byte-identical to `c9fea16ee`'s own copies — the overwrite is a content no-op, kept for the record).
- One extraction gap, found by the smoke and fixed before any judged seed: the selective extraction missed three transitive instrument requires (`scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, `scripts/killerdeath-instrument-20261105.js`) — the first smoke failed in 5s with `STAGE.install is not a function`. The require closure (17 files, computed from the driver) was verified complete and the three files were extracted from `c9fea16ee`; the smoke then reproduced exactly. The gap was in my extraction list, not in the instrument or the old code.
- OUTDIR was `/dev/shm/healerbisect-0730/c9fea16ee/` instead of the prescribed `/tmp/healerbisect-0730/c9fea16ee/` — same flap reason (/tmp writes were refused too); the corpora are committed here as the durable record, so the OUTDIR location is not load-bearing.
- Anchor reads `"unknown"` in every corpus JSON (the driver runs `git rev-parse HEAD` in REPO; the scratch dir has no `.git`). Expected under the extraction method, not an instrument error — the SHA is recorded here (`c9fea16ee`) instead.
- Seed order of execution: smoke 53004 alone first (08:09:49–08:10:30Z, ~40s), then the remaining 7 seeds in one invocation (08:11–08:14:04Z). Per-seed determinism (seeded Math.random per seed, loadGame per seed) makes the split invocation equivalent to one 8-seed run; the smoke file is the 53004 corpus in the committed set.

## Flap + infrastructure notes (disclosed)

- Flap timeline: ON at run start 07:44Z (git probe + plain writes refused, bursts across /tmp, worktree disk, and /dev/shm alike — tmpfs was NOT exempt); brief second-long windows ~07:46 and ~08:00; cleared 08:05:48Z; back ON ~08:14:51Z (proof test hit EPERM on write); cleared again 08:15:47Z for the commit window. Total denial stretch before the first clear: ~22 min.
- `scripts/worktree-heartbeat.sh sim-healerctl-hea-b` HUNG again (timeout 60s, killed, exit 124 at 08:09:07Z) — same as the 0530Z run. Heartbeats were not retried; the worktree stayed registered and the run completed.
- Master moved during this run: main-tree HEAD is now `f5cf45250` (journey-landing r118). This branch's base stays pinned at `1cac498d5` per the assignment; the frozen instrument is from `1cac498d5` and is byte-identical to `c9fea16ee`'s copies, so the master move does not touch this control.
- No safe-commit index clobber this run (status clean after checkout; verify again after commit).

## Metric review

- The control bars held without re-scoring: median 145d ≥ 120d, sits 4/8 ≥ 4/8 — and every seed matched its fightloop reference on days, with the subset four matching on sit day, standing, and wave-4 kills as well. No friendlier metric was consulted.
- The screen subset proved its worth again as an instrument: all four subset seeds flip death → 150d survival + sit, while the excluded four do not. The full-8 run adds the 53001/53002/53003/53007 readings the subset cannot see — 53002 living to d140 without sitting, 53001 reaching wave 5 and still dying — which the subset-only control could not have shown.
- One correction to the 0530Z expectation, not the metric: the 0530Z evidence's healed-8 fixture in `scripts/test-healerbisect-b.js` lists w4 kills as 0 for every seed (placeholders — the analyzer's verdict never reads w4 kills). The measured values are in the table above (53001: 5 w4 + 2 w5 kills). No verdict rests on them.

## Convergence state

scale-onramp stays **converging** (NOT converged): both endpoints are now verified on the full 8 — collapsed by the bisect arm (C2/L1: 70.5d, 0/8) with its subset re-verified exactly by the 0530Z run, healed by this run (145d, 4/8) — but the landing that healed it is still unidentified. The next blank, in order: the bisect itself, starting at midpoint #9 `4e6fa44ab` on the screen subset (coordinator dispatches; not started here).

## Adoption handoff — midpoint may proceed

1. Both controls pass on the full 8 (collapsed: bisect C2 full-8 + 0530Z subset exact; healed: this run, committed corpora above). The coordinator may dispatch the midpoint screen.
2. Midpoint #9 `4e6fa44ab` (r112 specialist ladder) on the screen subset {53004, 53005, 53006, 53008}: same driver invocation, `OUTDIR` under `/dev/shm` or `/tmp` with corpora committed after (the /tmp corpora from the 0530Z run were wiped — commit corpora, do not trust /tmp). Screen rule: HEALED if ≥3/4 reach 150d; COLLAPSED if ≥3/4 die before d100; else AMBIGUOUS → full 8. If #9 HEALED → flip in #1..#9, next #5 `19ee88466`; if COLLAPSED → flip in #9..#17, next #13 `0ce76898f`.
3. Method warning for the adopting run: if the flap is live, do NOT `git checkout <sha>` — use the extraction method from "Method note" above, including the full 17-file require closure (the three instrument files the first smoke caught are `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`). Verify the smoke reproduces exactly before running any other seed.
4. Budget: at current contention the full-8 healed control cost ~4 min of sim time (smoke ~40s, remaining 7 seeds ~3 min) — far faster than the 0530Z run's ~5 min/seed under heavy contention. A 4-seed screen should cost ~2–5 min when the box is quiet.

## Findings backlog

- [open] 2026-11-08 — death records — scholar deaths stamp `atHaven: true` with home-tile coordinates (3–5, 2–4) on nearly every row even when the death cause is "the wild" in combat; the record reads as stamping the home tile rather than where the fight happened (this run's healed corpora, e.g. 53001 scholar deaths d41–d106). Cosmetic instrument/record question, not a game verdict.
