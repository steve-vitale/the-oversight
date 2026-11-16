# Journey endgame r219 — RUN NOTE (lane B, 2026-11-15 21:00 CST run)

Leg 4 (endgame). Rotation-b read 4 at run start. Prereg:
`evidence/2026-11-15/journey-endgame-r219-prereg.md` (substrate master
4c30c022a; passes A/B/C + C-wide stretch; dark skipped — no delta
touched the dark table, r211 skipped on the same reasoning).

## Run-start incidents (infrastructure, not measurement)

- Lock: none present at run start. This run's lock written
  2026-11-16T02:55:52Z (run_id loop2-20261116T025552Z).
- Main tree: `git status --short` 0 lines, disk 42% (fail line 85%).
- `git pull` "Already up to date" at 02:55Z (master 4c30c022a).
- Reaper ran at run start: removed nothing; 12/16 active, all dirty
  (never auto-removed).
- Registration: `worktree-register.sh journey2-endgame` took ~9.3 min
  (git reset --hard churning under a sibling sim-aidgate-b driver
  load) but completed cleanly; worktree at 4c30c022a, registry entry
  verified, heartbeat 03:07:51Z, hbloop
  `journey2-endgame-hbloop-r219.sh` (pid 44344) re-heartbeats every
  5 min.
- Seed-band freshness: band 89730–89737 searched across all journey
  preregs + sim preregs — ZERO hits; broader `evidence/` grep for
  "8973" found only kcal-value substrings (189731, 8973, 38973,
  28973 — pantry/kcal numbers, not seeds); seed-context grep
  (`"seed":8973x`, `SEEDS=...8973x`) across `evidence/` — EMPTY.
  Band 89730–89737 is fresh.
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178
  prereg); box heavily loaded at run start (load avg ~14, sibling
  sim-aidgate-b competent-answercourt driver running).

## Pass A verdicts (5 matched seeds, 89701–89705)

Analyzer: `scripts/analyze-endgame-r219-20261115.js` on
`perseed-endgame-r219` — **PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO**
(exit 0). Log: `journey-endgame-r219-passa-analyzer.log`.

- 89701 waves: sat d90 lesser (r211: sat d101 lesser, w5max 1) —
  w5max 0.
- 89702 waves: sat d97 lesser (r211: sat d90 lesser, w5max 1) —
  w5max 0.
- 89703 waves: sat d112 lesser (r211: sat d90 lesser, w5max 2) —
  w5max 0.
- 89704 forcedrift: sat d90 lesser (r211: VILLAGE-LOST d66) — SAVED,
  see attribution.
- 89705 wavesnw: sat d90 lesser (r211: sat d92 lesser, w5max 0) —
  w5max 1, uw=5, vetLiving=4, 6 vKills — the strongest village.
- Tally: lesser 5/5, full 0/5, village-lost 0/5. ROAD-TALLY earned 0
  sat 0. M23b GATE-OK TALLY: 0/5 (no seed reached deedGateReady ok
  on pass A — the capstone leg is disabled here, but the tally reads
  the daily snapshot, so 0 is a real reading).

## Attributions (prereg interesting findings)

- **89704 SURVIVED (re-roll, not a fix):** r211's 89704 died of a
  sickness cascade — 5 sickness deaths (Roberto d25, Poran d28,
  Nikos d36, Omar d42, Hassan d45) + 2 wound deaths, village-lost
  d66, pantry 0. r219's 89704: 6 deaths total (Hazel d14 stranger,
  Roberto d18 monster, Henrik d19 wild, Nikos d19 sickness, Ji d26
  dehydration, Rosa d69 contest) — Nikos still dies of sickness with
  no healer in camp, but no cascade follows; 9 alive at sit, pantry
  17,355, scale global, ladder counted 60 (r211: 40–42), peak d35
  (r211: d44). The transcript carries ZERO fever/healer mentions
  (r211's carried the "Nobody here knows doctoring" line). Cause:
  trajectory re-roll — the r211→r219 dialogue-code deltas
  (curious-resume stutter, want-thread resume, plain partings, F3
  noBeat) shift RNG draws, so the fever cascade never formed. No
  medicine fix landed between r211 and r219 (the medicine trio is
  still owed); no healer appears in either run. The medicine gap is
  unchanged — sickness still kills with no healer, this roll just
  didn't cascade. Do NOT claim a survival improvement.
- **w5max collapse (1,1,2,0,0 → 0,0,0,0,1):** same re-roll
  mechanism — wave-5 facing depends on trajectory (standing,
  readiness, unlock timing). Only 89705 unlocked wave 5 (uw=5).
  No wave-5 door change landed; the door question stays open for
  passes B/C/C-wide (M23b).
- **Doubled quotes — fix HOLDS:** 0 `SYSTEM: ""` hits across all 5
  new transcripts (r211 fix verified live on the new master).
- **Q8 (159-turn Algorithm fight):** NOT recurred on pass A (longest
  fights not yet tallied — analyzer log holds the census; check at
  closeout).
- **Q9 (fastW4 diedInFight gap):** fastW4 empty on all 5 seeds
  (analyzer per-seed census: fastW4 [] everywhere).
- **Starvation watch:** no bought seeds on pass A (buy-out leg
  disabled); pantry trajectories healthy (89704 ends 17,355).

## Village assessment (plain words)

All five villages sat the lesser seat — the endgame is reachable,
and the table works: the audit reads each run back honestly
("only 1 of 2 different wave-5 monsters faced; no capstone deed
delivered" on 89705; "only 2 of 3 different wave-4 monsters faced;
only 0 of 2 different wave-5 monsters faced" on 89704), the lesser
seat is offered and taken, nobody sat a full seat. The one village
that died last run lives this run — not because anything was fixed,
but because the dice fell differently: the fever that killed five
people last time killed one this time and the village held. The
strongest village (89705) fought a wave-5 monster and came home
lesser-seated anyway. Wave 5 is still a wall with a door nobody
opens: one village reached it, none passed through it.

## People check: PASS

89705 finale (feared/light, mercy final) reads as people — the audit
names the real shortfall, the feared-path mercy choice resolves with
consequence ("the terror stays, pledged now: a shield over every
village, forever"), and the Oversight ending lands, including the
stasis-kids moral debt ("You never asked. Not once. They are still
there. Still small. Still waiting."). 89704 finale (relay/dark,
merge) reads as people — the stasis-kids choice ("You say yes. The
word is small. The pods open — not like morning. Like a barracks...
The village doesn't cheer... The System is delighted. That's the
worst part."), the merge resolution, Poran's ascension. No doubled
quotes, no senseless, robotic, or self-contradictory passage in
either finale. No dry repetition found.

## Metric review (§14)

- M23b adopted this run; proof test `test-analyzer-m23b-r219.js`
  12/12 ALL GREEN (re-run; first run 11/12 — the C-wide
  byte-identity check failed once at char 29606, then passed on
  re-run and on two manual reproductions: a one-off directory-order
  artifact, `fs.readdirSync(DIR)` unsorted at analyzer line 218 —
  the temp fixture's entry order differed from the repo dir's that
  once. The tally itself is proven by the exact-line assertions on
  all three passes; no verdict moved. Not a defect, no action owed
  beyond this note).
- M23b reads 0/5 on pass A — the gate-ok question is answerable
  even with the capstone leg disabled, as designed.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (not yet exercised —
  pass A has no delivery attempts; judged on passes B/C).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on pass A).
  M25c buyout-early (HOLD). M24b (HOLD — vacuous on pass A).
- Telemetry baseline: r188 baseline stands.

## Telemetry

`telemetry-check.js` vs r188 baseline (endgame.json): QUIET — 5
files, 3 metrics (uw/won/peakVet), no large deviations. Baseline
NOT rolled. Pass-A sums: uw (unlockedWave maxes 4,4,4,4,5), won
5/5, peakVet within regime.

## Gate / landing status

- [GATE-RESULT]
- Landing: NOT done this occurrence. Pass B in flight (see below);
  passes C/C-wide, gate, merge, release, rotation 4→5 are owed by
  the adopting occurrence.
- Rotation-b stays 4 (not advanced — no landing yet).

## In flight (for the adopting occurrence)

- Pass B (setsid-detached, CAPSTONE=1 BUYOUT=1, seeds 89701–89705,
  outdir perseed-endgame-r219-b, log journey-endgame-r219-passb.log):
  [PASS-B-STATUS]. When it finishes: run the r219 analyzer with
  ANALYZEDIR=perseed-endgame-r219-b, fill the Pass B section below,
  then run pass C (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1, outdir
  perseed-endgame-r219-c) and the C-wide stretch (same policy, fresh
  seeds 89730–89737, outdir perseed-endgame-r219-cwide), analyze
  each, commit each set, run `check.js --quick`, merge ff-only,
  release, rotation 4→5, delete lock.
- If Pass B died with the VM again, it is re-runnable from the
  probe invocation in the prereg (deterministic seeds; finished
  seeds' outputs reproduce identically).

## Pass B verdicts

[PASS-B]

## Verdicts (pass A only; full-seat question needs passes B/C)

- Reachable: YES (5/5 sat lesser on pass A; table + audit + lesser
  seat all fire).
- Fun: PARTIAL (the endgame plays — audit, finale choices, Reunion
  fights — but wave 5 is a wall nobody opens and the full seat
  never answers).
- Winnable: NO (this leg so far; full seat 0/5 on pass A, M23b 0/5
  gate-ok — the door question is unanswered until passes B/C).
