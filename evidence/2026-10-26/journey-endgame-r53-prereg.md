# Journey endgame r53 — COMMIT-GATE SNAPSHOT + vFlee/WITHDRAWAL WATCH + SECOND VETERAN (lane B, pre-registration 2026-10-26)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
This run takes r52's three named items, in order, on r52's substrate
exactly. No src/js changes planned; the only new code is probe-local,
read-only instrumentation (a commit-gate snapshot on the engine census).

## The three items (from r52's run note, 2026-10-25)

1. THE VETCOMMIT COMMIT GATE (lead). r52's engine census caught a
   policy-observed fight that never committed: 88076's Reunion vDie
   (d90, 5 turns observed by policy, vetcommit never set its commit
   flag) — while 88075's arena vDie DID commit. "Arena fights don't
   commit" is false; the gate itself is unexplained. r53 records, for
   every engine-opened wave-4 fight, the commitLive gate components
   at open AND at first policy observation: vetcommitOn, unlockedWave,
   veteransShort, scholarHpPct, commitLive — plus the ctx flag the
   policy turn actually carried. Every committed=false census fight
   must then name its failing gate, or be classified:
   - 'never-observed' — engine-only daily-round fight (finishLiveFight
     path; policy never evaluated the gate at all),
   - 'gate:<name>' — observed, gate failed on that component,
   - 'gate-passed-uncommitted' — observed, gate passed, flags still
     unset (a wrapper-path finding: the fight never passed through a
     committing policy.fight turn, or the monster lookup differed).
   Vetcommit's gate (scripts/policies/vetcommit.js, commitLive):
   opted in, unlockedWave == 4, veterans bar still short, scholar
   HP >= 50%. Note the wrapper also requires a live tbfight with a
   wave-4+ monster by DATA lookup at wrapper time — a monster the
   census counts by data lookup but vetcommit's wrapper missed (or
   vice versa) is itself a named finding.
2. vFlee SPLIT + WITHDRAWAL DETECTOR — POSITIVE CASES WATCH. r52
   shipped both instruments without a positive case (0 vFlee fights,
   0 withdrawals). r53 runs fresh seeds and reports: any vFlee fight
   classified 'designed' vs 'break' with its escape line quoted; any
   withdrawal visit dated with its line. Still unproven until a
   positive case lands — neither is claimed proven on zero data.
3. THE SECOND VETERAN (road). r52's veteran math: both veteran
   villages hold exactly 1 of the 2 the wave-5 bar wants; standing
   199/200 is the next binding constraint once the bar fills. r53
   reports per-village veteran counts and binding constraints the
   same way, and asks whether any village reaches 2 living veterans
   (M4's real question) — not just whether kills happen.

## Arms (r52 substrate exactly, one instrument carried)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1. 180d, death-aware.
- Arm A (engine census road): seeds 88081, 88082, 88083 (waves).
- Control: seed 88084 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88085, 88086, 88087
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh: the endgame probe block steps by 10
(88011→88071 across r40–r52); 88081–88087 is the next block, unused
by any endgame probe or per-seed evidence dir. Baseline: r52's waves
seeds (9 engine-census fights: talkDown 4, vKill 2, vDie 2, mFlee 1;
M3 tie 1 vs 1; M3b first GO 2/6 living veterans; M4 0/6 wave-5/full).

## Leg question

With the commit gate snapshotted on every wave-4 fight, WHY do some
policy-observed fights never commit — and does the road move on the
second veteran, the vFlee split, or the withdrawal detector on fresh
seeds?

## What counts as an interesting finding

- An observed-but-uncommitted fight with its failing gate NAMED
  (e.g. hpPct 0.42 at first observation, or uw still 3 at fight
  time) — the r52 mystery closed on real data.
- A gate-passed-uncommitted fight — the wrapper-path finding, naming
  which path (daily-round vs driven) bypassed the committing turn.
- A vFlee fight classified 'designed' with its escape line quoted.
- A withdrawal visit on a new seed, dated, with its line.
- A village reaching 2 living veterans, or a second kill on either
  arm with a LIVING killer at run end.

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
- M2d COMMIT-GATE NAMED (new, THE instrument question): every
  committed=false census fight on waves seeds carries a gate
  classification: 'never-observed', 'gate:<component>', or
  'gate-passed-uncommitted'. A committed=false fight with NO gate
  classification is NO-GO and the run names which fight lost it.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88084 — bandCrossings >= 1 AND
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

- scripts/probe-endgame-r53-20261026.js (r52 probe + commit-gate
  snapshot at engine open and at first policy observation + gate
  classification on every census fight; seeds 88081–88087; EVID
  evidence/2026-10-26/perseed-endgame-r53).
- scripts/analyze-endgame-r53-20261026.js (r52 analyzer + M2d gate
  table + gate-passed-uncommitted listing + vFlee/withdrawal watch
  tables).
- Gates: PILOT (88081 Arm A + 88085 Arm B, 180d sweep mode — expand
  only if either records >=1 census fight; else document pilot-only
  and stop, do not burn the 7-seed sweep on nulls);
  DET (instrument-on twice, 2x120d, seed 88081 — the wrappers must be
  provably read-only: byte-identical); FID (env unset: wrapped ==
  pure capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M2's class is r52's full class (all drivers); r53 distributions
  ARE comparable to r52's as road movement on the same census (same
  substrate, same instrument plus the gate snapshot — the snapshot
  adds fields, it does not change fight inclusion).
- M2d's 'gate-passed-uncommitted' class is a finding, not a failure
  of the instrument: if the gate passes at every observation yet the
  flags stay unset, the fight's driver path (not the gate) is the
  explanation, and the run names it.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48–r52 all reported it EXPLAINED and did
  not roll it. Same rule here; the baseline note itself says to
  re-seed from a same-regime corpus and record the regime — proposed
  as a NEXT-run revision (metric review), not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census + wrappers are read-only instrumentation). The comparison is
  r52→r53 via identical substrate plus the gate snapshot, and Arm A→
  Arm B on one variable.
