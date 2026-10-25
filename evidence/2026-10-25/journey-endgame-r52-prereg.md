# Journey endgame r52 — ENGINE-LEVEL CENSUS + vFlee SPLIT + WITHDRAWAL DETECTOR (lane B, pre-registration 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
This run takes r51's four named instrument items, in order, on r51's
substrate exactly. No src/js changes planned; the only new code is
probe-local, read-only instrumentation (an engine-level fight
recorder that observes and passes through untouched).

## The four gaps (from r51's run note, 2026-10-25)

1. ENGINE-LEVEL CENSUS. r51's census wrapped the LAYERED policy.fight
   and missed daily-round fights: `capable.daily` ends with
   `finishLiveFight`, which calls raw `capableFight` directly, so
   fights that open and close inside one daily never set vetcommit's
   commit flags and never enter the census (88062: 5 wave-4 facings,
   0 census fights). r52 wraps `Game.startCombat` (the fight opener)
   and closes engine records on over/ref-change at the daily boundary,
   so the driver no longer matters. Policy-observed fights adopt the
   engine record by tbfight OBJECT identity — one fight, one census
   entry, never double-counted. Fights that open WITHOUT startCombat
   (if any — e.g. a contest/arena opener) are still caught by the
   policy census and counted as policy-only opens, so the coverage
   check (M2c) can see both drivers.
2. vFlee SPLIT. r51's vFlee bucket conflates designed escapes (suburb
   LEAVE: "You walk past the last streetlight and don't look back...
   (ESCAPED...)") with party breaks. r52 records escapeKind per
   fight: 'designed' when the fight's capture slice carries an escape
   line (ESCAPED / BARRIER CROSSED / streetlight walk-out / barrier
   crash-through / "You escape"), else 'break'.
3. WITHDRAWAL DETECTOR. r51's probe missed table visits that end in
   withdrawal (88063/88066: announceDay null, withdrawal beat
   present) because it only read the announced flag. r52 records
   withdrawalDay + withdrawalLine straight from the full-run capture
   (PELLET HUMS / "the mantle may pass to hungrier hands" / "does
   not come"), and the analyzer's reactor-honesty clause is renamed
   to withdrawal. Canon: docs/TABLE.md names the withdrawal beat
   ("Below the lesser bar the table does not come (existing
   withdrawal beat...)").
4. WAVE BY DATA LOOKUP + FIGHT CONTEXT. r51's census detected wave
   by fighter mdef.wave; vetcommit detects by DATA lookup
   (beastWaveOf) — where those differ (arena fighters, variant defs),
   the census missed turns vetcommit counted (88062: vetFights=3,
   census n=0). r52 detects wave by data lookup (fallback mdef.wave)
   in BOTH census paths. M2b gains a first-class context field per
   fight: openDriver ('engine' = opened via startCombat, 'policy-only'
   = opened without it), arenaMention (capture slice mentions the
   arena), and deathCauses (unique causes of its causal deaths) —
   so "died in the arena" is a field, not a footnote.

## Arms (r51 substrate exactly, one instrument carried)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1. 180d, death-aware.
- Arm A (engine census road): seeds 88071, 88072, 88073 (waves).
- Control: seed 88074 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88075, 88076, 88077
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh: 88071/88072 checked clean against evidence/ and
prior endgame probes at prereg time; the remaining block is re-verified
by the same grep before the sweep runs (pilot seeds first). Baseline:
r51's waves seeds (15 committed driveFights-driven fights: vDie 5,
mFlee 2, vFlee 6, vKill 1, otherEnd 1 — a PARTIAL class; r52's census
is the first full-class count, so distribution comparisons to r51 are
reported as class-change, never as road movement).

## Leg question

With a census that finally sees every wave-4 fight regardless of
driver, what does the full fight distribution look like — and does
the road story change (daily-round fights, designed escapes, arena
vs field deaths)? Secondarily: do killers live (the veteran bar now
fails on survival, not killing)?

## What counts as an interesting finding

- A daily-round fight the old census would have missed, now counted
  with outcome + named deaths — the blind spot closed on real data.
- A vFlee fight classified 'designed' vs 'break' with its escape line
  quoted — the suburb pair no longer inflating the break count.
- A withdrawal visit on a new seed, dated, with its line — the
  "table never came" phrasing retired for good.
- A policy-only open (a fight that bypassed startCombat) with its
  context — a second opener class, named.
- A kill on either arm with a LIVING killer at run end — the veteran
  bar moving from "killer dies" to "killer lives."

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD (carried): >=5/7 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path (honest-death /
  withdrawal).
- M2 CENSUS COMPLETE (carried, class widened): every census fight on
  waves seeds carries a primary outcome (coverage 100%), AND >=2/3
  Arm A waves seeds record >=1 census fight.
- M2b ATTRIBUTION (carried): every dieFlag fight is classified
  causal-vs-daywindow; AND >=1 dieFlag fight (if any dieFlag fight
  exists on waves seeds) carries >=1 NAMED fight-causal death
  (villager + cause + channel). If zero dieFlag fights exist, M2b is
  reported as NO-DATA (not GO, not NO-GO) with the count stated.
- M2c ENGINE COVERAGE (new, THE instrument question): census fights
  == distinct wave-4 opens (engine opens + policy-only opens), AND
  censusErrors == 0. A mismatch is NO-GO and the run names which
  driver lost or doubled a fight.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88074 — bandCrossings >= 1 AND
  noticedCount >= 1.
- M6 GUARD NAMED (carried, deferred scope): every sat waves seed
  with deferDays >= 1 records a named window-end guard (not
  'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON (carried): every mFlee census fight on waves seeds
  is matched to its monster's codex counter text in the run note
  (designed-outcome / flight / scripted-departure / unmatched).
- M9 SUPPLY (carried): every wave-4 arrival that does not become a
  fight is recorded with its cause line; OR the run note cites the
  code rule that turns arrivals away (r51's rule: ONE MONSTER PER
  TILE + Haven safe law, game.js boundary rule).
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r52-20261025.js (r51 probe + startCombat
  engine census + escapeKind + withdrawal detector + data-lookup
  wave detection + fight context fields).
- scripts/analyze-endgame-r52-20261025.js (M1–M9 + M2c + REG +
  census table with source/escapeKind/context + Arm A vs Arm B
  comparison + exit-canon table + supply table).
- Gates: PILOT (88071 Arm A + 88075 Arm B, 180d sweep mode — expand
  only if either records >=1 census fight; else document pilot-only
  and stop, do not burn the 7-seed sweep on nulls);
  DET (instrument-on twice, 2x120d, seed 88071 — the wrappers must be
  provably read-only: byte-identical); FID (env unset: wrapped ==
  pure capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M2's class WIDENS this run (driveFights-driven → all drivers), so
  r52 distributions are NOT comparable to r50/r51 distributions as
  road movement. Any r51→r52 delta is reported as class-change
  first; road claims need the same-class subset (driveFights-driven
  fights are still identifiable via source/policy observation —
  the note states the subset count alongside the full count).
- M2c's equality is strict by design: an engine open that never
  closes (a fight left live at run end) closes at run-end with
  closeWhy 'run-end' and still counts; a policy-only open is counted
  in the opens side, so the equality holds across drivers. If the
  equality fails, the run does NOT fall back to quoting the
  policy-only subset as the census.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48/r49/r50/r51 all reported it EXPLAINED
  and did not roll it. Same rule here.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census + wrappers are read-only instrumentation). The comparison is
  r51→r52 via identical substrate plus the engine census, and Arm A→
  Arm B on one variable.
