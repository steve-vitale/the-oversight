# Journey endgame r54 — SECOND VETERAN + WITHDRAWAL WATCH + GATE-CLASS SECOND RUN (lane B, pre-registration 2026-10-26)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next) at
run end. This run takes r53's three named items, in order, on r53's
substrate exactly. No src/js changes planned; the only new code is
the r53 probe/analyzer carried with seed numbers, evidence dir, and
one stale transcript filename fixed (r52 → r54 in the analyzer's M1
withdrawal fallback).

## The three items (from r53's run note, 2026-10-26)

1. THE SECOND VETERAN (lead, road). r53's closest village (88086,
   wavesnw, village-lost) met every wave-5 bar except veterans 1/2
   and then died before announcing. r54 reports per-village veteran
   counts and binding constraints the same way, and asks whether any
   village banks 2 living veterans before dying or sitting — the
   counting problem r53 named, not a survival problem.
2. WITHDRAWAL DETECTOR — POSITIVE CASE WATCH (21 seeds and counting:
   r52+r53 = 14 seeds without a positive case). The detector is
   installed, not proven; it needs a below-the-bar seed to fire.
   r54 runs fresh seeds and reports any withdrawal visit dated with
   its line. Still unproven until a positive case lands.
3. GATE-PASSED-UNCOMMITTED, SECOND RUN. r53's M2d came back empty
   for that class (5/5 committed=false fights were never-observed
   ×3 or gate:hp ×2). r54 keeps the class: a second empty run asks
   whether to retire it as empty-by-construction (a fight whose gate
   passes at observation gets its flags set that same turn), or keep
   it for a wrapper-lookup-disagreement seed. Not retired on one
   empty run; a second empty run is recorded as evidence toward
   retirement, not a retirement itself.

## Arms (r53 substrate exactly)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1. 180d, death-aware.
- Arm A (engine census road): seeds 88091, 88092, 88093 (waves).
- Control: seed 88094 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88095, 88096, 88097
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh for endgame: the endgame probe block steps by 10
(88071→88081 across r52–r53); 88091–88097 is the next block, unused
by any endgame probe or per-seed evidence dir. Baseline: r53's waves
seeds (21 census fights: talkDown 2, vFlee 5, otherEnd 3, vDie 3,
mFlee 2, vKill 6; M3 4 vs 2; M3b 2/6 living veterans; M4 0/6).

## Leg question

Does any village bank the second veteran — and on fresh seeds, does
the withdrawal detector finally fire, or does the
gate-passed-uncommitted class come back empty a second time?

## What counts as an interesting finding

- A village ending with 2 living veterans, or a second killer alive
  at run end on a village that met the other wave-5 bars.
- A withdrawal visit on a new seed, dated, with its line quoted.
- A gate-passed-uncommitted fight — the wrapper-path finding r53
  did not see — with the path named.
- A second-veteran village that then dies before announcing (the
  r53 88086 shape, repeated: the wall moves from counting to
  survival again).

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
- M2d COMMIT-GATE NAMED (carried): every committed=false census
  fight on waves seeds carries a gate classification:
  'never-observed', 'gate:<component>', or
  'gate-passed-uncommitted'. A committed=false fight with NO gate
  classification is NO-GO and the run names which fight lost it.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88094 — bandCrossings >= 1 AND
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
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r54-20261026.js (r53 probe + seed block
  88091–88097 + perseed-endgame-r54; no logic change).
- scripts/analyze-endgame-r54-20261026.js (r53 analyzer + same seed
  block + transcript-filename fix in M1's withdrawal fallback).
- Gates: PILOT (88091 Arm A + 88095 Arm B, 180d sweep mode — expand
  only if either records >=1 census fight; else document pilot-only
  and stop, do not burn the 7-seed sweep on nulls);
  DET (instrument-on twice, 2x120d, seed 88091 — the wrappers must be
  provably read-only: byte-identical); FID (env unset: wrapped ==
  pure capable+deedhunt, mini gameDays/won/alive/pantry).

## Invocation correction (recorded during the run, bindings unchanged)

The first full-sweep invocation omitted RELAYGREY=1, which the
forcedrift control seed requires (probe line 240: SWEEP STOP). The
sweep stopped at 88094 after completing 88091–88093; those three
reproduced byte-identically on the corrected re-run (88091 transcript
74574 bytes, same summary line). The corrected invocation adds
RELAYGREY=1 to the five substrate vars above. No binding, seed,
substrate, or instrument logic changed — only the missing control
env var.

## Metric review (standing, carried)

- M2's class is r53's full class (all drivers); r54 distributions
  ARE comparable to r53's as road movement on the same census (same
  substrate, same instrument — seed numbers only).
- The gate-passed-uncommitted class is kept for a second run: one
  empty run is not evidence of emptiness-by-construction, two is a
  question for the next run's metric review, not a mid-run deletion.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48–r53 all reported it EXPLAINED and did
  not roll it. Same rule here; the baseline note itself says to
  re-seed from a same-regime corpus and record the regime — proposed
  as a NEXT-run revision (metric review), not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census + gate snapshot are read-only instrumentation). The
  comparison is r53→r54 via identical substrate, and Arm A→Arm B on
  one variable.
