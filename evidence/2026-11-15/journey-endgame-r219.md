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
- Landing: NOT done this occurrence. Pass C launched detached (see
  below); C-wide, gate, merge, release, rotation 4→5 are owed by
  the adopting occurrence.
- Rotation-b stays 4 (not advanced — no landing yet).

## In flight (for the adopting occurrence)

- Pass B (setsid-detached, CAPSTONE=1 BUYOUT=1, seeds 89701–89705,
  outdir perseed-endgame-r219-b, log journey-endgame-r219-passb.log):
  DONE — analyzed, section filled below (PRIMARY NO-GO on the
  VACUOUS M23 only; M23b 0/5).

## Pass B verdicts (5 matched seeds, CAPSTONE=1 BUYOUT=1)

Analyzer: `scripts/analyze-endgame-r219-20261115.js` on
`perseed-endgame-r219-b` — **PRIMARY-BINDINGS VACUOUS-UNANSWERED |
PRIMARY NO-GO | ALL NO-GO** (exit 1). The NO-GO is the VACUOUS M23
only. Log: `journey-endgame-r219-passb-analyzer.log`.

- M23b GATE-OK TALLY: **0/5** — no seed reached deedGateReady ok
  (r211 pass B had 1: 89703 d87). The deed-gate ends name the
  blocker: w5 distinct faced 0/0/0/0/1 (need 2), scale global on all
  5, pantries healthy (11k–25k at end). The wave-5 bar is the binding
  constraint on every seed.
- Per-seed: byte-identical trajectories to pass A (verified: only
  the `buyout`/`capstone` record sections differ; satDay, seat, won,
  census, fights, veterans, ladder, fullseat, deaths, feast all
  identical). The capstone/buyout legs fired ZERO events: 0 capstone
  attempts, 0 deliveries, 0 buyout attempts on all 5 seeds — there
  was never a ready kind to deliver, and no buyout window opened.
- Tally: lesser 5/5, full 0/5, lost 0/5. ROAD-TALLY earned 0 sat 0.
  M24/M24b VACUOUS (no tribute delivery). §NO-OVER-ATTEMPT holds
  (0 attempts, so 0 'over'); §REFUSAL-WINDOW holds (0 refusals).
- Doubled quotes: 0 `SYSTEM: ""` hits on all 5 pass-B transcripts.
- **Attribution:** the gate-ok loss vs r211 is the same re-roll as
  pass A — trajectories re-rolled by the dialogue-code RNG-draw
  changes, wave-5 facings fell (r211: w5max 1,1,2,0,0; r219:
  0,0,0,0,1), and the 2-distinct-wave-5 bar never clears. No
  table/ladder/waves change landed. The full-seat door didn't just
  stay closed — on this roll it never became openable. Pass C/C-wide
  still to run: the early-buyout road is the remaining lever that
  could open it on these seeds.

## In flight (for the adopting occurrence)

- Pass C (setsid-detached, CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1,
  seeds 89701–89705, outdir perseed-endgame-r219-c, log
  journey-endgame-r219-passc.log): DONE — re-run by the adopting
  occurrence after the original detached node (pid 61060) died with
  no output; re-run (pid 62319) finished clean, 5/5 seeds, analyzer
  exit 0, section filled above.
- Pass C-wide (setsid-detached, same policy, fresh seeds 89730–89737,
  outdir perseed-endgame-r219-cwide, log
  journey-endgame-r219-passcwide.log): LAUNCHED by the adopting
  occurrence (node pid 65745). When it finishes: run the r219
  analyzer with ANALYZEDIR=perseed-endgame-r219-cwide, fill the Pass
  C-wide section below, commit, run `check.js --quick`, rebase onto
  current master (6ca37144b at adoption; covenantsmoke landed during
  the vetparty closeout), merge ff-only, release, rotation 4→5,
  delete lock.

## Pass C verdicts (5 matched seeds, CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1)

Analyzer: `scripts/analyze-endgame-r219-20261115.js` on
`perseed-endgame-r219-c` — **PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO**
(exit 0). Log: `journey-endgame-r219-passc-analyzer.log`.

- M23b GATE-OK TALLY: **3/5** — 89702@d62/DELIVERED, 89704@d91/DELIVERED,
  89705@d83/DELIVERED. (Pass A 0/5, pass B 0/5 — the early-buyout road
  is what opens the gate.)
- Per-seed: 89701 sat d114 lesser (bought d41, full never, w5max 0);
  89702 sat d90 **FULL d63** (w5max 4, uw 5); 89703 sat d111 lesser
  (bought d41, full never, w5max 0); 89704 sat d97 **FULL d92**
  (w5max 2, uw 5); 89705 sat d90 **FULL d84** (w5max 2, uw 5).
- Tally: lesser 2/5, full 3/5, lost 0/5. ROAD-TALLY full-seats
  earned 3 sat 3.
- M25c buyout-early: 5/5 bought early — 89701 d41, 89702 d27, 89703
  d41, 89704 d35, 89705 d34 (all dg-not-ok at buy time, pantries
  14,913–40,591 at haven; 0 skipped of 5 eligible early-days, 10
  early attempts). The bundle is bought BEFORE the gate goes ok and
  the capstone delivers AFTER — that ordering is the road working.
- M24 tribute-agreement VACUOUS (no military_tribute delivery fired);
  M24b scholar-plus-one: 89705 covered-by-delivery. CORPUS-PURITY GO
  5/5. §NO-OVER-ATTEMPT + §REFUSAL-WINDOW hold (0 attempts beyond
  the road's own).
- Doubled quotes: 0 `SYSTEM: ""` hits on all 5 pass-C transcripts.
- Q8 (159-turn Algorithm fight): NOT recurred — longest fight on
  pass C is 39 turns. Q9 (fastW4 diedInFight gap): not observed —
  fastW4 empty, same as pass A.
- **Attribution:** vs r211 pass C (lesser 4/5, full 0/5 sat, 89701
  LOST d67 with buyout-early implicated, 89704 SAVED). Same re-roll
  mechanism as passes A/B — the dialogue-code RNG-draw changes
  re-rolled trajectories — but here the re-roll HELPED: wave-5
  facings rose on the converting seeds (w5max 4/2/2 on 89702/89704/
  89705 vs 0/0/1 on passes A/B) and the bought bundle + capstone
  delivery turned gate-ok into full seats. The two non-converters
  bought early too but never reached gate-ok (w5max 0 both) — the
  wave-5 bar is still the binding constraint where it doesn't clear.
  No table/ladder/waves change landed. The full seat is winnable
  via the early buy-out road on this substrate — the first full-seat
  panel on this leg since r203's pass C. Pass C-wide (fresh band)
  still to run: it decides whether the road holds on unseen seeds.

## Pass C-wide verdicts

[PASS-CWIDE]

## Verdicts (passes A+B+C; C-wide decides whether the road holds on unseen seeds)

- Reachable: YES (5/5 sat lesser or full on every pass; table + audit +
  lesser seat all fire; the full seat fired 3/5 on pass C).
- Fun: PARTIAL→YES on the road (the endgame plays — audit, finale
  choices, Reunion fights — and pass C shows the full seat actually
  answering through the early buy-out road; wave 5 is still a wall
  where the bar doesn't clear).
- Winnable: YES, via the early buy-out road (pass C: full seat 3/5
  on matched seeds, M23b 3/5 gate-ok, all delivered; passes A/B
  0/5 — the road, not the table, is the difference). C-wide on the
  fresh band 89730–89737 is the confirmation that the road holds
  beyond these five seeds.
