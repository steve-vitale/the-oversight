# sim-scaleonramp — flesh-out loop run fleshout-20261020T0015Z

Run: fleshout-20261020T0015Z (2026-10-19 19:15 CDT → 2026-10-20 ~02:00 UTC).
Axis: scale-onramp (the blocking axis — STANDING DIRECTIVE in force, lever
rotation overridden). This run executed the three named nexts from the dead
run's sim-tablepaths diagnostic (2026-10-19): the sanctity coverage gap, the
trial-by-combat winnability question, and the win-coda theater blank.

Claim: hidden_files/lever-claims/fleshout-20261020T0015Z.json (written before
any sims; deleted at closeout). Loop B live on food-economy at run start
(its 2230Z run ended cleanly mid-run; new run sim-pantryguard-b2 +
sim-shelltask-b2 started — zero overlap, never touched).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14)

Per-arm primaries were pre-registered in each arm's evidence header before
any sweep (see evidence/2026-10-19/sim-wincoda.md, sim-sanctityaudit.md,
sim-trialgod.md). Shared substrate for the two diagnostic arms: the
seatdrive seated stack — withTablePaths(withSeatDrive(withWinDefer(TF
base))) on {leadfeast, belongfeast} tribfloor bases, SEATDRIVE=1 +
TABLEPATHS=1, seeds 64201–64208, 180d death-aware horizons, identical seeds.
The wincoda arm is text-only (zero RNG draws) with a det-gate guardrail.
Before/after comparisons through the balanced panel per §15 live in each
arm's evidence (panel files committed alongside).

## STALE-LOCK RECOVERY (dead run fleshout-20261019T2215Z)

Lock heartbeat 52 min stale at run start, no live agents → lock replaced
per the concurrency guard (recovery noted here). The dead run's three arms
were all finished work: sim-switchtime-2's kill (fc44126f0) and the
sim-tablepaths diagnostic were already on master; the sim-diphold-bar kill
commit (29f1ed14f, zero-src/js, KILLED-AT-PILOT) was rebased onto master,
re-verified (scripts node --check clean; proof test in its designed
archival RED-run state — the layer is absent and the test documents it;
zero src/js changes), ff-merged as e7bfc346c. Tree released + removed,
branch deleted, dead claim marked .DEAD.

## ARM RESULTS

### 1. sim-wincoda — GO (landed 22cb18c25, [needs-eyes])

The win-coda theater blank (findings backlog): "◈ {Name} walks out of the
light alone…" was byte-identical across all five walked paths. FIX: seven
path-specific codas branching on the live tableState().path at
src/js/table.js:1263 (feared/defiant/beloved/assimilated/relay +
witness/indispensable, which honestly reach the same epilogue site).
Proof scripts/test-wincoda-20261019.js: RED pre-fix (72/73, the one failure
"codas differ per path"), GREEN post-fix 81/81 (distinct codas, path-specific
imagery, no sentence shared between any two, unknown-path fallback
verbatim). Det-gate 112/112 seed×path transcripts byte-identical except the
coda line — zero RNG movement. Re-verified 81/81 post-rebase before landing.
Text only, 20 lines in src/js/table.js. Backlog item marked FIXED.

### 2. sim-sanctityaudit — DIAG-GO (landed 74fa846ed)

The table-sanctity coverage gap (tablepaths finding): wave-4 'suburb' (d90)
and 'eulogy' (d91) started fights at Haven via combat_start while
tableActive()==TRUE, killing two post-trial scholars. AUDIT: all 11
startCombat sites in src/js/game.js classified — 9 ambient sites UNCOVERED
(monsterTurn() stance machine 21668–21927: monsterTurn() at 21640 has NO
tableActive check, nor do its 7 callers; + 11077 reengageWaitingMonsters).
Table's own stakes correctly never gated (table-feared.js:158 trial,
contests.js:4727/4751; startCombat carves tableTrial out of the breach
crisis). Player-initiated paths classified (own trap, tent "Face it",
feast-draw, UI buttons). Repo-wide gate inventory: 7 existing gates.
MECHANISM ATTRIBUTED: a pre-sitting raid placed wave-4 raiders on the Haven
tile; unmet ones linger, re-pinned to the Haven tile every dawn by
havenGrowthDaily (the re-pinning is UNGATED — only the gorge is); the bearer
sits at Haven → playerMonster() tethers the lingerer → ungated monsterTurn()
walks it into the player → startCombat. Fresh spawns can't reach Haven
during sanctity (pickWorldTile/wanderers exclude safe tiles) — pre-positioning
is the only route. REPLAY mode proves the gap (site 21865 fires with
tableActive()=true), re-verified post-rebase; DET 4/4 byte-identical
post-rebase; fresh 16-run sweep (perseed-sanctityaudit/) shows only trial
fights during sanctity on the drifted base. Zero src/js changes.
NAMED NEXT (not implemented): game-code fix arm — gate monsterTurn()'s
stance/contact block + reengageWaitingMonsters (11077) on tableActive();
leave the trial, contests, player-initiated paths, and the lingerer treeline
re-pinning untouched. The REPLAY mode doubles as the RED/GREEN proof.
Backlog item marked answered.

### 3. sim-trialgod — DIAG-NO-GO (landed ac5799164)

The trial-by-combat winnability question (tablepaths: 3/3 lethal on the
feast road): is it winnable by a strong build, or a bearer-sacrifice button?
God-build driver (scripts/policies/trialgod.js, TRIALGOD=1) maxing the
scholar through REAL verbs only (Phase blade+60, Hardlight+45, Worldbreaker
Maul+120, armor +14…+46, overcharged ×1.25 every trial, real
take_aim/dead_aim/rage/haymaker → strikes, real tbFiSacrifice). 12 trials
fired on 16 runs; 12 bearer deaths; all 12 runs still WON via law-5
mantle-passed-weakened. Best observed: 915 damage over 5 rounds vs 1963 HP
(Finale at 53% when the bearer died). Theoretical ceiling (Maul+120 +
dead_aim 3x + OC ≈ 1020/4 rounds) still loses to the round clock (~65/round
in vs ~100 HP; bearers die in 3–8 rounds). PRIMARY: 0 bearer wins across 12
reached trials (bar ≥1) — DIAG-NO-GO, honestly reported, never re-scored.
Instrument honesty note: the first sweep had a driver bug (loaded
aim/rage/haymaker flags overwritten instead of fired — 9/12 fights dealt
zero damage); fixed, re-swept twice on identical seeds; proof 52/52 GREEN
(C…[truncated 4304 chars]