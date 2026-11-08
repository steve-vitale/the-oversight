# sim-healerbisect-b — evidence

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0530Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-b (base master `8dc3d16d2`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (commit `a5be509b8`, Amendment A1 commit `16a313915`, both before any judged sweep) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, screen subset {53004, 53005, 53006, 53008}. Corpora in `/tmp/healerbisect/` (bisect working data, not committed); flip tables below are the durable record. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: UNRESOLVED — controls verified, bisect not started, adoption handoff

Both subset controls reproduced **exactly** on the discriminating seeds, so the bisect premise is verified and the machinery is ready — but the run window ran out before any bisect point could be screened. No landing is fingered, no combination is proven, no range is narrowed beyond the full 17. The healer is still unknown. The adopting run starts from verified endpoints, not from scratch: run the first midpoint (#9 `4e6fa44ab`) on the same 4-seed screen (commands in "Adoption handoff" below).

## Controls — both reproduced exactly (Amendment A1 subset bars)

### Collapsed control `cf22937b8` — screen COLLAPSED (4/4 die <100d, none sits)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | vs C2 reference |
|---|---|---|---|---|---|---|---|
| 53004 | 73 | village-lost | 199 | 4 | — | 2 | exact (73/199/2) |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | exact (54/199/1) |
| 53006 | 66 | village-lost | 190 | 4 | — | 1 | exact (66/190/1) |
| 53008 | 92 | village-lost | 199 | 4 | — | 3 | exact (92/199/3) |

0 instrument errors. Sweep 06:37–06:47Z (~9.5 min; short-lived seeds run fast).

### Healed control `c9fea16ee` — screen HEALED (4/4 reach 150d, all sit)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | vs fightloop reference |
|---|---|---|---|---|---|---|---|
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | exact (150/d90/199/3) |
| 53005 | 150 | survived | 199 | 4 | lesser d99 | 2 | exact (150/d99/199/2) |
| 53006 | 150 | survived | 199 | 4 | lesser d90 | 3 | exact (150/d90/199/3) |
| 53008 | 150 | survived | 199 | 4 | lesser d97 | 3 | exact (150/d97/199/3) |

0 instrument errors. Sweep 06:49–07:11Z (~22 min; 150d survivors run ~5–6 min each under sibling contention).

### Flip table: collapsed → healed (subset)

| Seed | Collapsed days | Healed days | Δdays | Collapsed seat/sat | Healed seat/sat | Collapsed stand | Healed stand | Collapsed w4 | Healed w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 | village-lost → survived |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 | village-lost → survived |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 199 | 1 | 3 | village-lost → survived |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 3 | village-lost → survived |

Subset medians 69.5d → 150d, sits 0/4 → 4/4, 4/4 death days moved, 0 instrument errors on either side. The instrument is frozen across the whole range: the in-tree driver + doorwalk policy at `c9fea16ee` are byte-identical to the frozen copies (`diff -q` clean), and zero commits in `c9fea16ee..HEAD` touch any instrument file (driver, doorwalk policy, sitstep instrument, stageally/rally policies, sim-harness).

## Candidate-set corrections (verified this run — the fightloop list was wrong in three places)

- `8a4ce0eab` (committed-finish, finishersize) is **not** in `cf22937b8..c9fea16ee`: it is an ancestor of the collapsed tip, already live at the collapse. Not a healer candidate.
- `7943fd58a` (patrol deed) is likewise **not** in the range — it is C3 of the earlier bisect, also already live at the collapse.
- `820b6146d` (fightloop's spelling) does not exist; the revert is **`820b61496`**. The prodstore pair (#6 lever + #7 revert) nets to zero on game code (`git diff 471ced6d8^..820b61496 -- src/js` is empty) and the lever was PRODSTORE_LEVER-gated, inert under this instrument. #6–#7 count as one no-op step.
- The full range is linear (0 merges), 127 commits, **17** touching `src/js`/`src/data` — enumerated in the prereg (#1 `37fc7489b` … #17 `b1dc80086`). Version bumps (#4, #13) touch only `src/js/build.js` (stamp); #3 touches only `src/data/characterGen.json` (one dialogue line). All other 110 commits are scripts / evidence / docs / version files.

## Mechanism — the wound is the same, the recovery is different (seed 53005, both controls)

The two 53005 death lists are identical through day 36 — Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36 — then they split. Collapsed: Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then **five villagers starve on d50–51** (Adriano, Nikolai, Somchai, Jorge, Anayo), Brian dies in combat d52, village gone d54. Healed: Desmond dies of sickness d37, Patrick to a monster d39 — and the village keeps going. It loses 24 people over 150 days (monsters, the wild, contests, the arena) but never starves anyone, sits the lesser seat on d99, and survives. The early wound is the same on both sides; what healed is the second month — the village that used to thin out and starve now absorbs the same early deaths and recovers.

Death-cause census, subset (52 fallen collapsed vs 42 healed): 'the wild' 26 → 15, **starvation 7 → 0**, monster 3 → 8, combat 4 → 3, sickness 2 → 1, ambush 2 → 3, contest 1 → 3, arena 3 → 3, 'a stranger' 1 → 2, thirst 1 → 0, wound 1 → 2, The Callback 1 → 1, 'the night' 0 → 1. The healing shows as starvation disappearing, not as fewer violent deaths — the healed villages still bleed people at about the same rate, they just never reach the point where the last few starve together.

## Village assessment — what the villages looked like

Collapsed, in plain words (53005): Haven starts with twelve people and loses four in the first five weeks — an ambush, a monster wearing a dead villager's face, the wild, a fight. That part happens in the healed version too. What kills the collapsed village is what comes next: a wound that won't close, a sickness, one more monster — and then there are too few hands left to keep anyone fed, and five people starve in two days. The village doesn't die in a battle. It dies at the table with empty bowls, three weeks after the last fight that mattered. Healed, the same village takes the same four early deaths, loses another twenty people over five months to monsters and contests and the wild — and still sits down at the lesser table on day 99, because the pantry never empties. The difference between the two versions of this village is not courage or luck in fights. It is whether the village can feed itself after the first month of dying.

Sense-check on the instrument: the sit days read from `takeseatStats.seatDay` (the day the seat is TAKEN), not the daily `tableSeat()` rows (which turn 'lesser' at the EARNED day). The smoke seed (53004 at branch tip) reads 150d / sat d90 — the healed shape, 0 errors. No dialogue in these corpora reads robotic on its face; the death lists are the story here, and they cohere (same first deaths, divergent endings).

## Wall numbers (subset controls)

- Collapsed: national 0/4, table sits 0/4, wins 0/4 (baseline leg never walks a door), wave-4 unlocks 4/4, wave-5 unlocks 0/4, subset median 69.5d.
- Healed: national 0/4, table sits 4/4 (lesser only), wins 0/4, wave-4 unlocks 4/4, wave-5 unlocks 0/4 (subset; the full-8 fightloop number was 1/8 via 53001), subset median 150d.
- Telemetry deviation check: not run — this is a DIAG bisect with no lever before/after; the endpoint reproductions are the validity check (see metric review).

## What was NOT done, and why (per the binding prereg + Amendment A1)

- **The bisect was not run.** Measured per-seed cost (smoke: 4m41s for one 150d survivor; healed subset: ~5–6 min/seed under sibling contention) makes full-8 controls + a binary search over 17 points impossible in a ~60-minute window. Amendment A1 (committed before any judged sweep) reduced this run's controls to the 4-seed discriminating subset; both passed exactly, but the window then ended (~07:30Z) with the closeout still to do. Starting a midpoint screen would have left the run uncommitted — the established pattern is to commit and hand off instead.
- **No panel compare (§15).** The panel needs a flip-point before/after pair; there is no flip point this run. Owed at the flip point by the adopting run.
- **No full-8 controls this run.** Deferred to the adopting run (Amendment A1): re-run both endpoints on all 8 seeds before bisecting further. The prior full-8 reproductions (bisect arm C2/L1; fightloop c9fea16ee) stand as the validity basis — the instrument is byte-identical since.
- **No game-code change.** DIAG only; `git diff HEAD -- src/` is empty.

## Metric review

- The control bars held without re-scoring: the subset bars (collapsed = all four die <100d; healed = ≥3/4 reach 150d) were met exactly — every seed matched its reference table on days, standing, sits, and wave-4 kills, not just the headline medians. No friendlier metric was consulted.
- The screen subset proved its worth as an instrument: all four subset seeds discriminate (death → 150d survival + sit) while the excluded four do not (53003/53007 die both sides; 53001/53002 die both sides). The 53005 death lists show the subset also preserves the mechanism story (identical first deaths, divergent endings).
- One correction to the prereg's expectation, not the metric: the prereg assumed the bisect would start this run; the measured per-seed cost made that impossible, and Amendment A1 (disclosed, pre-sweep) is the record of the change. The GO bars, flip bars, and NO-GO rule stand unchanged for the adopting run.
- Infrastructure notes, disclosed: (1) `scripts/worktree-heartbeat.sh sim-healerbisect-b` HUNG (~5 min, 0 CPU) when run from the main tree mid-run — killed it; the `git checkout --detach` that followed took 16s, so the hang was the heartbeat script, not git. Heartbeats were skipped thereafter; the worktree stayed registered and the run completed. (2) The safe-commit index clobber hit both prereg commits (file shown as D + ?? after a correct commit); repaired both times via HEAD-blob cacheinfo, hashes verified, status clean. (3) Flap probe (O_EXCL creation) OK before sweeps.

## Convergence state

scale-onramp stays **converging** (NOT converged): the frozen band is healthy on current master, the collapse is verified still live at `cf22937b8`, but the landing that healed it is unidentified. The next blank, in order: the bisect itself (adoption handoff below), then the fight-loop fix (candidate (b)) re-pointed at a band where the collapse is still live, or re-scoped as a mechanism change judged on the fight-level property.

## Adoption handoff — exact next steps for the next run

1. Worktree `~/workspace/worktrees/sim-healerbisect-b`, branch `sim-healerbisect-b` (tip `16a313915` + this evidence commit). Frozen instrument copies are saved at `/tmp/healerbisect-instrument/` (driver + doorwalk policy + analyzer) — copy driver + policy into the worktree untracked after each old-SHA checkout; delete them before checking out the branch tip (they are tracked there — `git restore` them if a checkout leaves deletions, as happened this run).
2. **First: full-8 controls** (Amendment A1 deferral) — `cf22937b8` then `c9fea16ee`, all 8 seeds, same driver invocation. Bars: collapsed median ≤90d + sits ≤2/8; healed median ≥120d + sits ≥4/8. A miss is NO-GO with cause, stop.
3. **Then bisect:** first midpoint **#9 `4e6fa44ab`** (r112 specialist ladder — foodXp buys skill from zero; the strongest a-priori candidate for a recovery-pathway heal) on the screen subset {53004, 53005, 53006, 53008}: `DAYS=150 SEEDS=53004,53005,53006,53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/healerbisect/<sha>/ node scripts/doorwalk-b-driver-20261107.js`. Screen rule: HEALED if ≥3/4 reach 150d; COLLAPSED if ≥3/4 die before d100; else AMBIGUOUS → full 8. If #9 HEALED → flip in #1..#9, next #5 `19ee88466`; if COLLAPSED → flip in #9..#17, next #13 `0ce76898f`. Classify with `node -e` + `scripts/healerbisect-screen-20261108.js` (same pattern as this run's control classification). Confirm the flip point on all 8 seeds + balanced panel before any verdict.
4. Budget warning: at ~5 min/seed, a 4-seed screen costs ~10 min (collapsed shape) to ~22 min (healed shape) and a full-8 control ~37 min. A binary search over 17 points needs ~5 screens — plan the run window accordingly, or parallelize across worktrees; do not shrink the controls again without a disclosed prereg amendment.
5. Corpora for this run (not committed, in `/tmp/healerbisect/`): `cf22937b8/` (collapsed subset), `c9fea16ee/` (healed subset), `smoke/` (53004 at branch tip, healed shape). Flip tables above are the durable record.

**Ready to merge, pending ship:** branch `sim-healerbisect-b` at the evidence commit (see report). NOTHING merged — report ready-to-merge; the coordinator lands it. No game-code trace on the branch: prereg + Amendment A1 + screen module + proof test + this evidence only.
