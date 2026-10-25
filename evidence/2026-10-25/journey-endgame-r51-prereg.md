# Journey endgame r51 — FIGHT-CAUSAL DEATH ATTRIBUTION + WAVE-4 EXIT CANON + ENCOUNTER SUPPLY (lane B, pre-registration 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
This run takes r50's three named next steps, in order, on r50's substrate
exactly. No src/js changes planned; the only new code is probe-local,
read-only instrumentation (death-channel wrappers that record and pass
through untouched).

## The three gaps (from r50's run note, 2026-10-25)

1. FIGHT-CAUSAL DEATH ATTRIBUTION. r50's vDie bucket is day-window, NOT
   fight-causal: "a roster member died on the fight's day." The census
   cannot yet say WHO died IN a fight. r51 wires the engine's death
   records into the census: probe-local wrappers (record-only, pass
   through untouched) on Game.registerDeath (corpses.js choke point)
   AND Game.tbVillagerFalls (the combat death path, game.js:37234,
   cause 'combat') capture, per death, the live tbfight object at call
   time (or null). A death recorded while a census fight's tbfight is
   live IS fight-causal: named villager + cause + channel. Deaths with
   no live tbfight, or a different fight, stay day-window. Every
   dieFlag fight is classified causal-vs-daywindow; no silent vDie.
   The day-window flag is KEPT alongside (comparison with r50), never
   replaced silently.
2. WAVE-4 EXIT CANON. r50's census: mFlee 7, vDie 10 (day-window), vFlee
   2, kills 0. But the codex says two signatures are unkillable BY
   DESIGN: suburb ("You don't kill a suburb; you ESCAPE it — the win
   condition is leaving, the fight is a timer") and strike ("Unkillable:
   their game is outlasting"). Congregation's fight is refusing a geas,
   influencer's is ratio/cancel, reunion's is novelty, algorithm's is
   unpredictability, eater's is poison/starve. r51 matches every
   mFlee census fight to its monster's codex counter text and reports
   which exits are designed wins vs damage flights vs scripted
   departures — so "0 kills" stops reading as one failure and splits
   into designed-outcome vs missing-kill-route. The veteran bar (2
   living veterans = wave-4+ kills in waveKillLog) is then judged
   against the killable subset (audit, eulogy, herald, eater, plus
   companion-path kills — cf. sim-killbeat 2026-10-19: Patrick's d140
   wave-4 Congregation kill via 'companion'), not against the whole
   wave-4 roster.
3. ENCOUNTER SUPPLY. r50's 88056: unlockedWave 4, wavesFaced w4 0, zero
   census fights — but its transcript shows a Reunion arrival that
   "stops at the boundary — pacing, unwilling. Something else is
   already here." r51 records every wave-4 arrival that does NOT become
   a fight (boundary-blocked, already-here, dissolved) with its line,
   and names the slot-contention rule from code. The question: is
   "unlocked but unmet" a supply problem (few spawns), a contention
   problem (slot occupied), or a road problem (the policy never seeks)?

## Arms (r50 substrate exactly, one variable carried)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1. 180d, death-aware.
- Arm A (attribution road): seeds 88061, 88062, 88063 (waves).
- Control: seed 88064 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88065, 88066, 88067 (wavesnw
  = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds only).
Seeds verified fresh: no 88061–88067 in prior endgame notes or probes
(targeted grep over r45/r49/r50 notes and probes; the r50 seed block is
88051–88057). Baseline: r50's waves seeds (19 committed fights:
mFlee 7, vDie 10 day-window, vFlee 2, talkDown 0, kills 0; 0/6 living
veterans; 88056 unlocked-but-unmet).

## Leg question

On the r50 road, WHO dies in wave-4 fights (not just on their days) —
and which wave-4 exits are designed wins, which are flights, and why
do unlocked villages go unmet?

## What counts as an interesting finding

- A named fight-causal death: villager name + cause + channel, tied to
  a specific census fight — the attribution wiring proven on real
  engine records, not day coincidence.
- A dieFlag fight with ZERO causal records, classified honestly as
  day-window-only, with the missing channel named (arena? wound?
  thirst?) — also a finding: the census's blind spot, measured.
- An exit-canon table: per signature type, designed-outcome vs flight
  vs scripted departure, with codex quotes.
- A boundary-blocked wave-4 arrival with its cause line, or a code
  citation for the slot rule that turns arrivals away.
- A kill on either arm (the r46–r50 0-kill streak breaking), with its
  channel (player / companion / patrol / other) from waveKillLog.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD (carried): >=5/7 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path.
- M2 CENSUS COMPLETE (carried): every committed wave-4 fight on waves
  seeds carries a primary outcome (coverage 100%), AND >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2b ATTRIBUTION (THE instrument question): every dieFlag fight is
  classified causal-vs-daywindow; AND >=1 dieFlag fight (if any dieFlag
  fight exists on waves seeds) carries >=1 NAMED fight-causal death
  (villager + cause + channel). If zero dieFlag fights exist, M2b is
  reported as NO-DATA (not GO, not NO-GO) with the count stated.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88064 — bandCrossings >= 1 AND
  noticedCount >= 1.
- M6 GUARD NAMED (carried, deferred scope): every sat waves seed
  with deferDays >= 1 records a named window-end guard (not
  'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON (new): every mFlee census fight on waves seeds is
  matched to its monster's codex counter text in the run note
  (designed-outcome / flight / scripted-departure / unmatched).
- M9 SUPPLY (new): every wave-4 arrival that does not become a fight
  is recorded with its cause line; OR the run note cites the code
  rule that turns arrivals away. A run with zero such arrivals
  reports "no blocked arrivals observed" (not GO by default).
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r51-20261025.js (r50 probe + death-channel
  wrappers + arrival recorder + exit-canon fields).
- scripts/analyze-endgame-r51-20261025.js (M1–M9 + REG + census table
  + Arm A vs Arm B comparison + exit-canon table + supply table).
- Gates: PILOT (88061 Arm A + 88065 Arm B, 180d sweep mode — expand
  only if either records >=1 committed wave-4 fight; else document
  pilot-only and stop, do not burn the 7-seed sweep on nulls);
  DET (instrument-on twice, 2x120d, seed 88061 — the wrappers must be
  provably read-only: byte-identical); FID (env unset: wrapped ==
  pure capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M2b's NO-DATA clause is deliberate: binding the run to a death that
  may not happen would force either a fake death or a false NO-GO.
  The honest outcomes are GO (named causal death + full
  classification), NO-GO (dieFlag fights exist but none classified /
  none named), or NO-DATA (no dieFlag fights at all).
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48/r49/r50 all reported it EXPLAINED and
  did not roll it. Same rule here.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census + wrappers are read-only instrumentation). The comparison is
  r50→r51 via identical substrate plus attribution, and Arm A→Arm B
  on one variable.
