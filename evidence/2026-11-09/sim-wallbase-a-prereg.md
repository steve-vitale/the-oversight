# sim-wallbase-a — prereg (DIAG, zero src/js)

**Arm:** sim-wallbase-a (DIAG, zero src/js) · **Run:** oversight-flesh-out-loop,
2026-11-09/10 · **Axis:** scale-onramp / winnability chain (converging, NOT
converged) · **Branch:** sim-wallbase-a, base master `65fef6d7e` (verified:
worktree `git rev-parse HEAD` reads `65fef6d7ebe5bd2cdbda124de01042f05a72d7b0`;
worktree tree clean, 0 untracked at spawn). **Prereg committed BEFORE any
judged computation.**

## The question

Fresh scale-wall baseline on current master. The standing directive requires
wall numbers every run: villages never reach national/table in sims. Measure
them fresh on 16 new seeds, competent policy only, 150d death-aware cap.
This is a MEASUREMENT arm — the verdict is the numbers themselves. There is
no GO/NO-GO threshold, so there is nothing to re-score (MEASUREMENT.md §14
still binds: the numbers below are reported as observed, never re-scored
against a friendlier metric).

## Canon read

- `docs/CANON.md` read first. `docs/MEASUREMENT.md` §§9–12, 14–15 read
  (pilot gate, death-aware horizons, prereg, convergence, metric binding,
  balanced panels). `docs/SIMULATING.md` read (policies, sweep table,
  pitfalls). `~/workspace/the-scattering/AGENTS.md` (repo house rules) read.
- Area canon: wave law from `docs/MONSTER-WAVES.md` (wave 4 gate standing
  ≥ 100; wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are
  the Mirror Draft) and the scale ladder from `docs/SCALE.md` (a polity is
  one primary with ≥ 3 active subordinates; four fires is a realm; national
  reached six ways — LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE).
  No game code changes in this arm, so no canon is invented or rewritten.
- No canon doc covers seed attribution — the question is answered from
  measurement, not invented.

## Primary metric (binding)

- **PRIMARY: national reach count across the 16 seeds** (seeds reaching
  national rank at any point in the run, per the sweep's maxRank history).
- Also reported (not gating): table invited / table entered (sat) / wins
  (counts of 16), wave reach 1–5 (unlocks), Arc reach (maxArc 2/3/4),
  four-realm formation (maxFires ≥ 4 — Haven polity of 4+ fires), median +
  max survival, death-cause shares, vests (scholar + villager), endReason
  per seed, pacing means.
- SENSE-TESTING LAW: one seed's transcript/dialogue sampled and judged in
  plain words — do villagers act like people (goals, routines, reactions)?
  One telling moment quoted, good or bad.

## Horizon + why (MEASUREMENT.md §10)

- **150d death-aware cap** (dead villages stop simulating; runDays
  endReason recorded per seed; +10d tail max). Reachability horizon
  (waves 4–5, national, table, wins = 150–200d guide), matching recent
  wall runs (bandfreeze F0, honeststakes, medchannel, radsnap — all 150d).
  No fixed-200d run: villages that die stop, they are not ticked to fill
  the horizon.

## Seeds, policy, env

- **Seeds: 110001–110016 (16 seeds, exact literals).** Freshness verified
  below — see Seed-band note.
- **Policy: competent ONLY** (`scripts/policies/competent.js`,
  UNMODIFIED). Competent is the legacy baseline (can't flee, never uses
  abilities, never answers the Table) — used here only to compare against
  old wall evidence on the same policy.
- **Env (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1.**
- **Zero src/js changes.** The seeder/recorder live in scripts/
  (`scripts/sweep-wallbase-a.js`, `scripts/analyze-wallbase-a.js`) and are
  driver-side instrumentation, removable without affecting the game. The
  sweep is modeled on the established census pattern
  (`scripts/census-feastvoice-b.js`): per-seed JSON + say/ambient beats,
  daily maxRank/maxArc/maxFires/maxWave history, death telemetry.

## Seed-band note (freshness check, full scope — per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`)

Checked 2026-11-10 ~00:00 UTC, before any judged computation on this band.
Scope: all 684 files matching `evidence/*/sim-*-prereg.md`; all
`evidence/**/*.md`; `scripts/`; per-seed corpus filenames (`find evidence
-maxdepth 3`); today's `evidence/2026-11-09/`.

- **CHOSEN 110001–110016: FRESH.** Zero hits in every scope above
  (prereg grep exit 1, scripts grep exit 1, evidence-md grep exit 1,
  corpus-filename find empty, today's evidence grep exit 1).
- **Task-forbidden bands avoided:** 96009–96024 (sibling medheadcount
  confirm), 53011–53018 (frozen band), 96901–96912 — no overlap.
- **Candidates checked and BURNED (recorded so the next worker does not
  repeat them):** 97601–97616 (hurthome-fix-b prereg + sweep script +
  corpus); 97801–97816 (journey-scale-r111 + creekwood corpora);
  99501–99516 (askplus-a); 97001–97016 (journey-scale r107–r111);
  98301–98316 (hurthome-fix-c / vfrac-a / awayconfirm-a preregs);
  98701–98716 (feastdraww4-a, tendbelow/tendfloor, bankkiller-b,
  journey-deepening r107–r110, journey-scale r103–r105);
  88001–88016, 89001–89016, 90001–90016, 91001–91016, 92001–92016,
  93001–93016 (endgame r46/r76, journey-deepening r7/r9/r87, mirrorcap,
  tbretreat-refind-confirm-b, ragerepress-b preregs).
- **False positives noted, not counted as burns:** the 99301 check hit two
  hash-named panel case files whose content seed is 72004 (the digits are
  a hash coincidence); the 97801 hidden_files grep hits were substring
  matches inside JSON content, not band namings.
- If a later search finds 110001–110016 named earlier, this run gets a
  correction commit naming the missed source (per local_seed_band_freshness).

## Legs

- **ONE leg only:** seeds 110001–110016, competent, 150d, PLENTYDEPRI=1
  DEPOSITGATE=1, on master `65fef6d7e`. No before/after — this arm IS the
  baseline; later arms compare against it on identical seeds.
- Per-seed JSON to `evidence/2026-11-09/sim-wallbase-a/`:
  `wallbase-a-competent-s<seed>.json` (one file per seed) plus a summary
  log `wallbase-a-summary.json` written by the analyzer. A beats file
  (`wallbase-a-beats-s<seed>.json`: ambient + say beats) accompanies each
  per-seed file for the sense-test.

## Instrument (binding fields per seed)

days, gameDays, endReason, national (maxRank ≥ 2), table (invited ever),
entered (sat ever), wins (Game.won), maxWave, wave4, wave5, maxArc,
arc2/arc3/arc4, maxFires, fourRealm (maxFires ≥ 4), vests, vestsVillager,
starvedDays, causeCounts (death-cause shares, player vs other),
instrumentErrors. Daily history tracks maxRank/maxArc/maxFires/maxWave so
reachability is history, not just end state (a run that ends via Game.over
before daily misses its last rank — same caveat as sweep-compare.js).

## Metric review (to be filled at closeout)

- (Pending — filled in the evidence file at closeout, with any proposal for
  the NEXT run. A miss here is not applicable — measurement arm, no GO —
  but any instrument blind spot is recorded here.)
