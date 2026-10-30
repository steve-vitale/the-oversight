# sim-killconv-a — PRE-REGISTRATION (written BEFORE any sims, 2026-10-30)

Run: fleshout-20261030T1924Z, Loop A, axis scale-onramp.
Worktree: ~/workspace/worktrees/sim-killconv-a, branch sim-killconv-a.
Arm type: MEASUREMENT ONLY — no game-code change. The gating freeze
(Steve 2026-10-27/28) stands; this arm measures the kill-conversion /
veterans-bar channel first, before any lever is built.

## Ground facts (verified against code on THIS base, not quoted from banks)

- Monster veterans: an older-wave monster spawning in a later wave is
  flagged veteran (game.js castMonster, `isVeteran = targetWave < wave`).
  Hardening is +50% HP, +3 damage, +1 speed (game.js:33389 comment; HP/speed
  applied at spawn, game.js:33518/33574) plus a scarred/elder/pack-leader
  variant trick.
- Villager veterans bar: `Game.waveCombatReadiness(w)` (src/js/standing.js)
  counts DISTINCT LIVING roster killers with a `state.waveKillLog` entry
  of wave >= (w-1). Demand (2026-10-18 recalibration): wave 4 needs 1
  villager with a wave-3+ kill; wave 5 needs 2 villagers with wave-4+ kills.
  (A VETSHAPE=1 instrument variant counts living-OR-DEAD killers; it is
  NOT enabled here — default pristine behavior is what ships.)
- Bar accounting: `recordWaveKill` logs `w = mdef.wave` — the monster's BASE
  wave. Killing a hardened veteran wave-3 monster in a wave-4 world logs
  w=3, which does NOT count toward the wave-5 bar (needs w>=4). Verified
  in code (game.js:32897ff, wave from mdef at entry construction).
- Canon: docs/MONSTER-WAVES.md (combat-readiness gates, design call #4
  2026-10-16) + docs/CANON.md read first. No canon doc covers a
  kill-conversion lever — none is proposed here.

## Primary metric

Wave-5 veterans-bar reach rate: share of seeds where, at ANY daily census,
`waveCombatReadiness(5).veterans >= 2` (peak living wave-4+ killers >= 2).
Secondary: wave-4 bar reach (`readiness(4).veterans >= 1` at any census).

## Decomposition (the actual question)

For every seed, decompose the wave-5 bar shortfall into exactly one
binding class, in this order:

1. OPPORTUNITY — the village never got a wave-4 kill to count: zero
   wave-4+ kills, split by cause (wave 4 never unlocked; wave-4 monsters
   never met/spawned; meetings ended in party flee, beast scatter, or
   villager death without a kill).
2. SURVIVORSHIP — wave-4+ kills happened but the killer(s) died before
   the bar was read (kills whose killer is dead at end of run, or was
   dead at every later census while the bar stayed short).
3. ACCOUNTING — wave-4+ kills happened and killers lived, but the bar
   still did not credit them: distinct-killer collapse (many kills, one
   killer), base-wave counting (veteran wave-3 kills logged w=3),
   scholar-succession identity (killer id no longer on the living roster
   for a reason other than death — to be checked, not assumed).

Binding-constraint rule: the class that explains the bar shortfall on the
most bar-short seeds is the answer; a class wins only if it leads by a
>=2:1 margin over the runner-up among classifiable bar-short seeds.

## DIAG verdict thresholds (judged against this header, never re-scored)

- DIAG-GO: the decomposition assigns a binding constraint by the rule
  above, on a band where at least 4 seeds unlocked wave 4 (otherwise the
  bar was never actually tested) — OR wave 4 unlocked in <25% of seeds
  with the upstream cause identified (the bar is moot; the wall sits
  earlier, and that IS the answer).
- DIAG-NO-GO: classes split without a >=2:1 leader, or the instrument
  cannot classify >=25% of bar-short seeds.
- INSUFFICIENT-DATA: fewer than 8 usable seeds (crash/instrument gaps),
  or pilot shows zero wave-4 unlocks AND zero wave-3+ kills (nothing to
  decompose — re-scope, do not invent).

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's `Game.over` (village lost
or won) — dead villages stop simulating, no dead-village ticking. 200d
because this is a reachability question (waves 4–5, national, table):
prior bands show wave-4/5 door openings as late as day ~165, so a 150d
cap would censor the very climb being measured; the death-aware stop
keeps the cost at the survival distribution, not the cap.

## Seeds (exact literals, fresh band on this base — no old bank quoted)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): extend to 85109, 85110, 85111, 85112, 85113,
  85114, 85115, 85116 (16 seeds total).
- Pilot GO gate (sniff test, §9): the instrument fires on all 8 seeds
  (kills/spawns/census non-empty where the sim reaches them) AND at
  least one seed reaches a classifiable bar state (wave 4 unlocked, or
  wave-3+ kills recorded). A pilot with zero wave-3+ kills anywhere is
  INSUFFICIENT-DATA, not a kill — re-scope before confirm spend.

## Policies (single-base measurement; no control leg by design)

Competent scale-push stack, identical every seed (policy-side only, no
game-code change):
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 (seatdrive layerOn defaults on; the env list matches the
2026-10-21 killdisc corpus substrate, but every number below is freshly
measured on this base — no old-bank number is quoted as current).

## Panel (§15)

Single-base measurement: there is no before/after comparison in this arm,
so `scripts/balance-panel.js` does not apply. No panel compare is
attached and none is fabricated. (If a later lever arm reuses this
corpus as its baseline, that arm runs the panel then.)

## Wall numbers reported every run

national / table / wins, wave 4–5 unlocks, median survival (game days),
death-cause shares, plus: wave-3+ kills, wave-4+ kills, distinct
wave-4+ killers (ever / living at end / peak living), veteran-spawn
kills by base wave.

## Sense-testing (§4, SENSE-TESTING LAW)

Read transcripts of at least one wave-4 fight per outcome class
(kill / party-flee / beast-scatter-or-flee / villager-death /
scholar-TB win-or-loss) and judge whether they read as real fights with
consequences — not just counts.

## Metric review

(To be filled at end of run. Doubts about the metric go here and apply
to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
