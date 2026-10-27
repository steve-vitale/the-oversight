# Journey endgame r55 — FULL-SEAT CHASE + TWO RETIREMENT RULINGS (lane B, pre-registration 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next) at
run end. This run takes r54's carried items, in order, on r54's
substrate exactly. No src/js changes planned; the only new code is
the r54 probe/analyzer carried with seed numbers, evidence dir, and
date (r54 → r55, 2026-10-26 → 2026-10-27).

## The carried items (from r54 + its adoption note, 2026-10-26)

1. GATE-PASSED-UNCOMMITTED, THIRD RUN — RETIREMENT RULING OWED.
   r53 empty, r54 empty (second run). r54's metric review: "a
   second empty run is evidence toward retirement, not a
   retirement itself. Next run's metric review decides: retire
   the class, or keep it for a wrapper-lookup-disagreement seed."
   This run IS that next run. If M2d comes back empty a third
   time, the class is RETIRED in this run's metric review (kept
   as a listed historical class, no longer a binding gate), unless
   a wrapper-lookup-disagreement seed appears. A non-empty hit
   keeps it alive and is reported with its path named.
2. DAILY-SLICE WITHDRAWAL DETECTOR vs RESCAN — RETIREMENT WATCH.
   r54: the daily slice never fired; the end-rescan IS the
   detector (first positive: 88095, d90, end-rescan). r54's rule:
   "if withdrawals keep arriving via rescan only, the daily
   slice should be retired, not carried." This run watches for
   a DAILY hit (source absent / daily). If every withdrawal on
   this run again arrives via end-rescan only, the daily slice
   is RETIRED in this run's metric review and the rescan
   becomes the detector outright.
3. FULL-SEAT CHASE. r54's adoption settled the three wave-5
   numbers (unlock vs readiness bar vs full-seat component are
   different counters, never in conflict). The full seat is
   blocked elsewhere: 88097's closest gap was w2 faced 4/5, not
   w5. r55 asks whether any fresh-seed village closes the w2
   gap or reaches the full seat — and reports every sat
   village's closest full-seat gap component (new M10).
4. SECOND LIVING VETERAN (banking problem, carried). r54: best
   yet 3/6 villages with 1 living veteran, still none with 2.
   The unlock already happened without it; the readiness bar
   measures LIFE banked to the sit. r55 reports per-village
   living-veteran counts the same way and asks whether any
   village banks 2.

## Arms (r54 substrate exactly)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1, RELAYGREY=1
(the forcedrift control requires it — r54's invocation correction
is baked into the invocation below, not re-learned). 180d,
death-aware.
- Arm A (engine census road): seeds 88101, 88102, 88103 (waves).
- Control: seed 88104 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88105, 88106, 88107
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh for endgame: the endgame probe block steps by 10
(88091→88101 across r54–r55); 88101–88107 is the next block, unused
by any endgame probe or per-seed evidence dir (checked: no 8810x
hit in scripts/probe-endgame-*.js or perseed-endgame-r5* dirs).
Baseline: r54's waves seeds (25 census fights: mFlee 3, vKill 6,
talkDown 8, otherEnd 5, vDie 2, vFlee 1; M3 4 vs 2; M3b 3/6 living
veterans; M4 1/6 wave-5 open, full seat 0/6, closest gap w2 4/5).

## Leg question

On fresh seeds, does any village reach the full seat (or close
the w2 gap) — and do the two carried instrument classes (gate-
passed-uncommitted, daily-slice withdrawal) come back empty a
third time, settling their retirements?

## What counts as an interesting finding

- A village earning the FULL seat, or closing the w2 gap to 5/5
  without sitting (the 88097 shape, advanced one step).
- A village ending with 2 living veterans (the banking problem
  solved, not just the killing problem).
- A gate-passed-uncommitted fight — the wrapper-path finding
  r53–r54 did not see — with the path named (keeps the class
  alive and retires the retirement).
- A DAILY-slice withdrawal hit (source daily, not end-rescan) —
  keeps the daily detector alive.
- A withdrawal visit on a new seed, dated, with its line quoted
  (rescan or daily).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD (carried): >=5/7 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path (honest-death /
  withdrawal).
- M2 CENSUS COMPLETE (carried): every census fight on waves seeds
  carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
  seeds record >=1 census fight.
- M2b ATTRIBUTION (carried): every dieFlag fight is classified
  causal-vs-daywindow; AND >=1 dieFlag fight (if any dieFlag fight
  exists on waves seeds) carries >=1 NAMED fight-causal death. If
  zero dieFlag fights exist, M2b is NO-DATA (not GO, not NO-GO).
- M2c ENGINE COVERAGE (carried): census fights == distinct wave-4
  opens (engine opens + policy-only opens), AND censusErrors == 0.
- M2d COMMIT-GATE NAMED (carried, third run): every committed=false
  census fight on waves seeds carries a gate classification:
  'never-observed', 'gate:<component>', or
  'gate-passed-uncommitted'. A committed=false fight with NO gate
  classification is NO-GO and the run names which fight lost it.
  The gate-passed-uncommitted class itself is judged in metric
  review (retire if empty a third time), not mid-run.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat. EVERY report of the
  unlock carries the readiness-bar reading beside it (r54 rule:
  never report "wave 5 reached" without the bar).
- M5 VOICING CANONICAL (carried): 88104 — bandCrossings >= 1 AND
  noticedCount >= 1.
- M6 GUARD NAMED (carried, deferred scope): every sat waves seed
  with deferDays >= 1 records a named window-end guard (not
  'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON (carried): every mFlee census fight on waves seeds
  is matched to its monster's codex counter text in the run note.
- M9 SUPPLY (carried): every wave-4 arrival that does not become a
  fight is recorded with its cause line; OR the run note cites the
  code rule that turns arrivals away (ONE MONSTER PER TILE + Haven
  safe law).
- M10 FULL-SEAT GAP (new): every sat waves seed's closest
  full-seat gap component is named from fullseatMax (which bar,
  how far), including any village that closes w2 or sits full.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r55-20261027.js (r54 probe + seed block
  88101–88107 + perseed-endgame-r55 + 2026-10-27 dir; withdrawal
  end-rescan carried; no logic change).
- scripts/analyze-endgame-r55-20261027.js (r54 analyzer + same seed
  block + dir + M10 full-seat-gap table; no binding logic change).
- Gates: PILOT (88101 Arm A + 88105 Arm B, 180d sweep mode — expand
  only if either records >=1 census fight; else document pilot-only
  and stop, do not burn the 7-seed sweep on nulls);
  DET (instrument-on twice, 2x120d, seed 88101 — the wrappers must be
  provably read-only: byte-identical); FID (env unset: wrapped ==
  pure capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M4's GO stays narrow and must stay labeled: it counts the
  UNLOCK (uw=5), not the veterans bar. Every future endgame note
  reports the bar beside the unlock, per r54's rule.
- The gate-passed-uncommitted class has two empty runs behind it;
  this run's metric review retires it if empty a third time.
- The daily-slice withdrawal detector has zero daily hits across
  r52–r54 (rescan only); this run's metric review retires it if
  every withdrawal again arrives via rescan.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48–r54 all reported it EXPLAINED and did
  not roll it. Same rule here; the baseline note itself says to
  re-seed from a same-regime corpus and record the regime — proposed
  as a NEXT-run revision (metric review), not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census + gate snapshot are read-only instrumentation). The
  comparison is r54→r55 via identical substrate, and Arm A→Arm B on
  one variable.
