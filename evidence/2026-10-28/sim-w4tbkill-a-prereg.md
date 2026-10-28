# sim-w4tbkill-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0527Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4tbkill-a. Tracker blank 2,
TB half — KILL-JUDGED. Worktree: `~/workspace/worktrees/sim-w4tbkill-a`
(branch sim-w4tbkill-a). Base at prereg: HEAD 5ef4d5bad
("Version bump 065e31dc5-20261028-052429 (batch ship)"), which
already contains the sim-wallwounds-a lingerer-restore cap
(commit 1af4ddfd9, ancestor of HEAD). This arm therefore measures
on POST-wallwounds code; its control is built on this same HEAD,
never on the w4convert corpus numbers.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md: wave 4 = the Mirror
  Draft, gate village standing >= 100; bands anchored: damage
  35-95, HP 850-1500, pierce 0.2-0.5; "a 4-6 round fight for a
  godhood build (~220 dmg/round)".
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, metric binding,
  balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs and the difference is reported.

## Mechanism, named from code (the TB half, read before designing)

The w4convert census proved, on its band, 51 wave-4 spawns ->
31 faced -> 29 engaged -> 0 killed, with 25 world-origin TB
fights all ending 'lost' and 23/25 ending with the monster
fighter's TB-end HP above the world monster's fight-start
tile HP. That comparison is NOT a single mechanism; it is
three stacked code facts, and this arm names them separately
because only one of them is still open on this HEAD:

1. FIGHTER CONSTRUCTION DISCARDS WORLD HP (open). In
   startCombat (src/js/game.js), the monster fighter's HP is
   a fresh roll from the monster def range
   (`mdef.hp[0] + floor(random * (mdef.hp[1]-mdef.hp[0]))`),
   with no read of the lifted world monster's HP at all
   (the world monster's HP is read only for beamPhase /
   gwGrounded). A world monster spawned at the range's low
   end (spawnWorldMonster sets hp = maxHp = hp[0] unless
   opts give otherwise) and then toll-wounded to, say,
   675/900 therefore enters TB at 900-1100, not at 675.
   The player fighter, by contrast, enters at the
   scholar's current health (w4tbhp: 10/28 post fights
   below-max) and villager fighters at village.health —
   the monster is the only side that enters fresh.
2. OVERTIME RERUN SCALING (open, deliberate design).
   overtime.js wraps startCombat: once the Table exists
   (announced, day 90+, seat not none, not seated), every
   7 unseated days raises a tier (cap 6); overtimeScaleFight
   then multiplies every wave-4/5 fighter's HP by
   (1 + 0.25*tier) and damage by (1 + 0.12*tier) and injects
   floor(tier/2) full-HP packmates via campaignInjectMonster.
   The census's extreme rows are this, not a party scaler:
   75103 seq 64 suburb at tier 6 is one 3688-HP fighter
   plus three 3265-3648-HP crew (total ~13,959 HP) against
   a solo scholar. No party/level scaler inside startCombat
   was found: tbPackSpawnCount changes COUNT (pack tactics),
   not HP, and the other startCombat wraps (feel, finale,
   godverbs, network) do not scale monster HP.
3. LINGERER RESTORE WRITE-BACK (CLOSED on this HEAD).
   Pre-wallwounds, tbEnd restored a lingering raider at
   the fighter's end HP, so a toll-wounded lingerer could
   come home healthier (675 -> 740 traced). The
   sim-wallwounds-a fix, already in HEAD, caps the restore
   at min(pre-fight world HP, fighter end HP). On this
   HEAD a lost/fled lingerer fight can only keep or deepen
   wounds. Titans still restore at full HP by design, and
   non-lingerer, non-titan world monsters have no
   worldOrigin, so tbEnd restores nothing for them — they
   were lifted at fight start and are simply gone on any
   non-won result. This arm does NOT re-litigate the
   restore; it measures whether anything still writes
   health back on this HEAD, and it does not claim the
   pre-fix 23/25 number as its own.

The binding-step claim for phase B (below) rests on (1):
TB fights cannot accumulate damage toward a kill because
every fight re-rolls the monster fresh, so wall tolls and
field chips never carry into the fight that is supposed
to finish the monster. Meeting is NOT the binding step
for this arm: the census already shows 31 met instances
converting at 0%, and this arm touches no meeting, spawn,
wave-unlock, gating, or base-stat value (mdef.hp ranges,
attack damage, Highbeam Deer and wave-1 stats untouched).

## Prior evidence read first (definitions come from these)

- evidence/2026-10-28/sim-w4convert-a.md + prereg (census:
  field 16->16->0, raid 22->4->0, TB 18->18->0 on its band;
  TB anatomy: 25 world-origin TB fights, all 'lost'; party
  sizes and fighter HPs per fight are the lethality data
  this arm's rule is built from — see "Lethality data"
  below).
- evidence/2026-10-28/sim-w4damage-a.md (wall toll = the
  biggest single wound-maker, floors at 1, owns no kill).
- evidence/2026-10-28/sim-wallwounds-a.md (restore cap,
  in HEAD; its BEFORE/AFTER bands are NOT re-scored here).
- evidence/2026-10-28/sim-w4tbhp-a.md (player enters
  wounded, monster enters fresh — pre-dates wound2).
- This arm NEVER re-scores the w4convert, w4damage,
  w4lethality, or wallwounds verdicts or corpora. Its
  control is its own sweep on this HEAD.

## Lethality data the rule is built from (w4convert corpus, cited not re-judged)

- Player strike: roll([10,16]) + weapon bonus (game.js
  tbPlayerStrike); villager strike: roll([4+wb/2, 8+wb/2])
  (tbVillagerTurn). A strike-only party deals roughly
  15/round solo, ~40-55/round with 1-3 villagers — against
  canon's 220/round godhood bar. Observed TB damage:
  solo fights deal 0-174 total in 3-8 rounds before the
  scholar dies; the band's best TB result (75103 seq 48
  audit, party 2, 17 rounds) dealt 715 and still lost with
  the monster at 499/1214.
- Party sizes on the census band (all wave-4 TB starts):
  19 solo, 3 party-2, 1 party-3, 1 party-4 with total
  monster HP <= 1500; 3 fights above 1500 total HP (all
  overtime crew fights). Even the two party>=3,
  single-HP fights LOST: 75102 audit (party 3, 1211 HP,
  8 rounds, dealt 379, scholar dead, both villagers fled)
  and 75103 eulogy null-origin (party 4, 1095 HP, 7
  rounds, dealt 367, scholar dead, villagers at 88-95 HP
  untouched — the monster focuses the scholar).
- Competent policy ALREADY flees unwinnable fights at
  turn 1 (totalMhp > 2.5 * player max HP, i.e. > 250 for a
  100-HP scholar, so every wave-4 fight qualifies) — but
  its legacy flee walks to the nearest edge and pushes
  through the barrier, and chasers follow across barriers
  (chasePersistence = 2 for wave-4 ids, default branch),
  so the fight continues on the next node and the policy
  then fights it out until the scholar dies. The 25/25
  'lost' is what that sequence produces, not a policy
  that stood and fought from round 1.
- Conclusion from code + data, stated before any sweep:
  no strike-only party on this band can kill a fresh
  850-1500 HP wave-4 fighter (let alone an overtime crew
  totalling 7,000-14,000 HP) before the scholar dies in
  3-8 rounds (17 at best). A discipline that only picks
  WHICH fresh fights to take therefore has an empty
  winnable set. Phase A tests that conclusion honestly
  instead of asserting it; phase B is the scaling change
  that makes the winnable set non-empty.

## Substrate and pairing (VERBATIM)

- Seeds 75101-75108, horizon 180d DEATH-AWARE (runDays
  stops on death/win; +10d tail max).
- Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1 (TABLEDEFIANT
  unset), policy scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), PLUS recorder on-switches
  RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1 (tbdmg-rebase-diag
  copy), PLUS W4DMG=1 (w4damage-diag) — the w4damage /
  w4convert recorder stack reused verbatim, never edited.
- NEVER edited: tableseat-nowait.js, any existing
  recorder file. New files only: one policy file
  (scripts/policies/w4tbkill.js, env-gated, see below),
  one sweep copy (scripts/test-w4tbkill-sweep.js),
  one analyzer (scripts/test-w4tbkill.js), one sense
  script (scripts/test-w4tbkill-sense.js), unit proofs
  (scripts/test-w4tbkill-rule.js, scripts/test-w4tbkill-worldhp.js).
- Substrate-activation gate (binding): band courtship
  combined > 0 AND >= 6/8 seeds with non-zero combined
  courtship. If the gate FAILS, the sweep is INVALID
  (not NO-GO): no verdict judged, failure reported
  loudly, run stops for an env fix. Expected from the
  w4damage/w4convert bands: combined 121, 8/8 active.
- Detgate (pre-sweep STOP gate, per phase): seed 75101,
  baseline (plain tableseat-nowait, no recorders) vs
  wrapped (ALL recorders composed, every on-switch
  UNSET, including W4DMG, and for phase A the W4TBKILL
  gate also UNSET; for phase B on the modified code,
  baseline vs recorders-OFF on that same modified code):
  days, gameDays, and tsNationalDay must be equal, with
  no diag ctx surface and no wraps installed. The old
  detgate numbers were 132/132 days, tsNationalDay 77.
  If base drift moved those numbers on the CURRENT base,
  DO NOT force the old numbers: prove same-base
  neutrality the way sim-w4convert-a did — run the
  prior instrument stack (the w4damage stack,
  recorders-OFF) on this base and show it diverges
  identically (same new numbers) — and disclose the
  amendment loudly in the evidence file (old numbers,
  new numbers, prior-stack check result). Detgate PASS
  on this base's own numbers, with the amendment
  disclosed, is a PASS; detgate FAIL (baseline !=
  recorders-OFF on this base) is a STOP. If the detgate
  differs from 132/132/77, STOP and report the
  divergence before judging any sweep — do not judge a
  diverged corpus.

## Phase A — policy-side engagement discipline (FIRST)

Policy: scripts/policies/w4tbkill.js, env W4TBKILL=1,
default OFF = tableseat-nowait exactly (daily and fight
delegate byte-identically; the detgate above proves it
with the gate unset).

Rule (assessW4TbFight, exported pure for unit proof):
a wave-4 TB fight is FIGHTABLE only when ALL hold at
fight start (first player turn of that fight id):
  party >= 3 (player + >= 2 live villager/ally fighters),
  AND monster fighter count == 1 (no overtime crew, no
  packmate),
  AND total monster fighter HP <= 1500 (the canon band
  top, single-monster, tier-0 scale),
  AND scholar HP >= 70% of max.
Otherwise the fight is UNWINNABLE by the rule.

Behavior: on a FIGHTABLE wave-4 fight, delegate to
competent fight (strikes + tricks, as control). On an
UNWINNABLE wave-4 fight, NEVER strike: every player turn
the policy walks the scholar to the nearest x-edge and
pushes through the barrier (tbBarrierExit), repeating
across nodes until the fight ends 'fled' (chasers give
up after their pursuit stamina) or the scholar dies —
the persistent version of competent's one-shot flee.
Non-wave-4 fights delegate to competent fight unchanged.
Counts recorded on ctx: w4tbAssessed, w4tbFightable,
w4tbFleeTurns, w4tbFleeEnds; the sweep captures them
into each row as w4tbkill.decisions.

Phase A prediction, stated in advance: kills 0, won TB
fights 0 — because the winnable set above contains at
most the two census fights, both of which lost under
control with the same party/HP shape, and persistent
fleeing only converts 'lost' into 'fled' (and, for
non-lingerer world monsters, into removal without a
kill). If phase A instead kills >= 1 or wins >= 1 TB
fight, phase A is GO, phase B is never written, and the
run ends there. If phase A kills 0 (the prediction),
that is the documented proof that (a) cannot move the
needle to a kill, and phase B proceeds — it is not a
NO-GO for the run, because the prereg's judged GO is
the phase-B rule below, and phase A is its gating
measurement. Phase A gets no confirm band: the 8-seed
band IS its pilot and its verdict.

## Phase B — minimal game-code scaling change (ONLY after phase A kills 0)

Change (one site, src/js/game.js startCombat, monster
fighter construction, non-snake branch, primary fighter
i == 0 only): when the fight's monster is a lifted world
monster — i.e. the scholar's world-monster alias
(worldMonster) has id == mid, is not a veteran, and
carries finite hp/maxHp — the primary fighter's HP and
maxHp are the WORLD monster's hp/maxHp, instead of a
fresh roll from mdef.hp. All other fighters (packmates,
crew, snake segments) roll as before; veteran fighters
keep the existing +50% HP construction (veteran hardening
is canon, and a veteran's world HP does not bake it in);
non-world fights (no worldMonster, or a bystander id)
roll as before; mdef.hp ranges, attack damage, and all
other base stats are untouched; meeting rates, spawn
rates, wave unlocks, gating, and the overtime wrapper
are untouched (overtime still multiplies the
world-HP-derived fighter afterwards, as designed for
reruns — a tier-6 rerun of a 675-HP lingerer is still
a rerun, not a free kill).

Why scaling, not meeting (written before the sweep):
the census shows meetings already happen (31 faced) and
convert at 0% because the TB fighter re-rolls fresh;
a meeting lift that still re-rolls fresh would still
kill 0, so meeting is not the binding step for this
arm. The change makes TB fights honest in the same way
player/villager fighters already are (they enter at
current health, not at a fresh roll) and makes prior
damage accumulate: a toll-wounded lingerer enters at
its toll HP, a lost/fled fight restores at
min(pre-fight, end) under the wallwounds cap, and the
next fight enters at the chipped value instead of a
fresh roll — so repeated fights can finish what the
wall started. A won fight still kills; a routed
lingerers still breaks and runs; titans are untouched
(their restore is full by design and their fighters are
not world-HP-derived through this branch unless they
are also lifted world monsters — the unit proof asserts
titan fights are excluded by the same worldMonster-id
and veteran guards only where they apply, and the
sweep's titan rows are reported separately if any
appear; if a titan fight is found to be altered, that
is a proof failure, not a rounding note).

Phase B proof tests (before the judged sweep, after
the code change, and re-run after any revert):
- scripts/test-w4tbkill-worldhp.js (pure helper proof):
  the helper tbWorldHpFor(mdef, worldMonster, isVeteran)
  returns world hp/maxHp for a non-veteran lifted world
  monster, null (roll) for a veteran, null for a
  bystander id mismatch, null for a missing world
  monster, and null for non-finite HP. Exit 0 only when
  all cases pass.
- The sweep itself is the end-to-end proof: the
  analyzer joins nonworldkill starts (tile HP) to
  tbdmg tbEnds and asserts, on the phase-B band, that
  every world-origin wave-4 TB fight's primary fighter
  start HP equals its tile HP (non-veteran) — a
  construction check, not a verdict leg, reported as a
  count with any exception named.

Phase B needs Steve's eyes: a TB lethality change is a
feel/combat change, so the landing commit (if GO)
carries [needs-eyes] in its message.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: wave-4 kills and won wave-4 TB fights on
identical seeds, phase band vs the control band built
in this run on this HEAD.

GO RULE (judged ONLY against this prereg, on the
phase-B band unless phase A already went GO):
  GO = phase band wave-4 kills >= 1 OR won wave-4 TB
    fights >= 1, vs 0 on the identical-seed control
    band,
  AND cost bar: total starvation deaths on the phase
    band <= control total + 2 (starvation counted on
    the armed band's own deaths — "arm-only deaths" in
    the task, i.e. the phase band's starvation total,
    not a pooled total),
  AND median survival (days) on the phase band
    >= 0.8 * control median,
  AND substrate gate passes on both bands,
  AND detgates pass on both bands' code versions,
  AND recorder errors 0 on every row of both bands
    (no overflow).
  A meeting-count GO is FORBIDDEN: meetings already
  convert at 0% kills, so a meeting lift that still
  kills 0 is a NO-GO.
  PILOT = the 8-seed band for each phase. If the
  phase-B pilot kills 0 AND wins 0 TB fights, KILL
  FAST: report NO-GO, revert the game-code change
  byte-clean (git checkout HEAD -- src/js/game.js
  after verifying no other uncommitted change to that
  file, then git status clean of game code), land the
  measurement (policy + instruments + evidence +
  corpus), no confirm spend. Killed arms leave no
  trace: the policy file is deleted if the run ends
  NO-GO with no landing, the game-code change is
  reverted, and the evidence says so.
  No confirm band unless a GO pilot needs a confirm
  and that confirm is pre-registered BEFORE running
  it (seeds, horizon, GO threshold) — never run first
  and justified after.

Definitions (binding — the analyzer implements exactly
these):
- Wave-4 kill: a waveKillLog entry with w == 4 in a
  row's raftdraft logEntries, or a killerStatus killer
  with kills4 > 0 (the two must agree; any disagreement
  is named and the log entry count governs). Pyrrhic
  kills (recordPyrrhicKill on 'lost') count as kills
  for this leg and are flagged pyrrhic, never hidden
  as 'won' fights.
- Won wave-4 TB fight: a tbdmg tbEnd with result
  'won' joined by fightId to a nonworldkill start with
  wave == 4. 'routed' is NOT a won fight (it is
  reported separately, and any monster death inside a
  routed fight still counts under the kill leg via the
  log, not as a won fight).
- World-origin wave-4 TB fight: a nonworldkill start
  with wave == 4 and origin == 'world-origin'. The
  analyzer also reports non-world wave-4 TB fights
  separately (reconciliation, never folded into the
  world count).
- Wall numbers reported on every band (never pooled):
  national ever/final, table entered (entered field),
  wins lesser/full (row.won plus tableState.seat where
  present — lesser vs full is read from the seat value,
  never guessed), wave-4 reach, wave-5 reach, median
  survival, starvation total, wave-4 kills, won TB
  fights (armed vs control), TB fights by result
  (won/lost/fled/routed), and party-size distribution
  of wave-4 TB fights.

## Sense rule (binding)

Sense fight = the FIRST wave-4 TB fight (by day, then
lowest seed) on the LAST judged band (phase B if it
ran, else phase A). Read it round-by-round in plain
words from a NON-MEASURED replay (say/sysSay taps,
same pattern as test-w4convert-sense.js; replay text
never enters any count, and the replay trajectory
shift is stated, not hidden). The sense note is a
supporting note, not a verdict leg.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js
compare and record the outcome. The known standing
exception is that it has no corpus-ingest mode — if
it fails that way, say so and use paired sweep tables
as the section-15 substitute; never fake a panel
artifact.
TELEMETRY DEVIATION CHECK (loop body step 10): run
AFTER writing evidence (telemetry-check.js vs
scale-wall baseline, metrics national,table,wins,
exiled, current glob for the phase-B corpus — or the
phase-A corpus if phase B never ran). Report LOUD
lines with verdict; do NOT roll the baseline on an
unexplained LOUD line. Note the known artifact-class
caveat from prior arms: per-seed rows carry
nationalEver/entered/won, not top-level
national/table/wins paths, and the baseline's WINSEAT
regime forbids comparing it to a tableseat-nowait
substrate — say which artifact class applies, or
investigate if a line fits neither.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during
  the run go here, and any revision applies to the
  NEXT run, never this one.)
