# sim-w4funnel-repin-a — PRE-REGISTRATION (binding, written BEFORE any sweep)

Run: fleshout loop A, run fleshout-20261027T0755Z, axis scale-onramp.
Arm: sim-w4funnel-repin-a — RE-PIN THE W4FUNNEL CONTROL ON CURRENT MASTER.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no proposal of a game lever. The deliverable is the
re-pinned control table + funnel census on the current base and a
verdict on whether the 2026-10-25 funnel answer still stands.

## BASE AND REBASE (done before this file was written, verified)

- Worktree branch sim-w4funnel-repin was created at 5c3c80013
  (the 0615Z coordinator evidence). It has NO unique commits of its
  own: `git log master..HEAD` was empty, merge-base == old HEAD.
- Rebase onto current master tip fc57dd0bd (journey-scale r43 note)
  completed CLEAN, no conflicts, no file changes from the rebase
  itself. Post-rebase HEAD == fc57dd0bd == main-tree master tip.
- Master movement since the 0615Z run is ONLY journey-scale r43
  (a33fe3c74 + fc57dd0bd). If the plain band below moves against
  the 0615Z band, r43 is the only candidate cause in the base —
  reported as base movement, never absorbed, never blamed without
  the per-seed trajectories to show it.

## CANON READ FIRST

- docs/CANON.md, docs/MONSTER-WAVES.md. Wave law used here, read
  from canon + code (never invented): wave 4 = The Mirror Draft,
  standing >= 100 (blood / bonds / bread, pure or hybrid); wave 5
  = The Producers, standing >= 200 AND wave-4 faced (bread counts
  at most 100 toward the t5 bar). Readiness gates hold waves 4-5:
  wave 4 demands 3 armored @ P>=10 / 5 armed / 3 tricks / 1 living
  wave-3+ killer; wave 5 demands 4 armored @ P>=15 / 6 armed /
  3 tricks / 2 living wave-4 killers. Veterans, read from code in
  src/js/standing.js waveCombatReadiness(): DISTINCT killer vids
  in state.waveKillLog with w >= 4, filtered to LIVING — vid ==
  current Game.villagerId counts living by definition, else
  vpOf(vid) must exist and not be dead; entries with by null are
  skipped by the gate outright.
- docs/MEASUREMENT.md §§9-12, 14-15: pilot gate (8 seeds IS the
  pilot here — the full band is 8 seeds, no confirm spend beyond
  it), death-aware horizons (§10), pre-registration (§11, this
  file), convergence (§12), metric binding (§14 — a miss is
  NO-GO, never re-scored mid-run), balanced panels (§15 — see
  the panel note below).

## CONTEXT READ FIRST

- evidence/2026-10-25/sim-w4funnel-a.md (the arm being re-pinned:
  its census, definitions, control band, and verdict) and
  evidence/2026-10-27/sim-scale-onramp-round-0615.md (the run
  that requires this re-pin: "w4funnel control re-pin on the
  current base — required before any future funnel number is
  judged") plus evidence/2026-10-27/sim-finalloss-adopt-a.md
  (the 0615Z current-base band's per-seed trajectories, the
  replication reference below).

## SUBSTRATE (fixed before sweeping)

- Seeds 73671-73678 (identical seeds, always).
- Policy: scripts/policies/tableseat-nowait.js, composed upon,
  NEVER edited (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
- Horizon: 180d death-aware (runDays stops on death/win; 180 is
  the cap, not a fixed horizon — MEASUREMENT §10).
- Two arms, same seeds, same substrate:
  - PLAIN: tableseat-nowait with NO recorders (snapshot-only
    raftdraft rows: faced + waveKillLog snapshot only).
  - ARMED: tableseat-nowait + the five recorders below.
- Plain runs FIRST. The armed band must reproduce plain EXACTLY
  on every shared field (days, gameDays, endReason, won,
  waveReach, maxArc, finalRank, maxRank, nationalEver,
  nationalFinal, table invited, table entered, deathTotal,
  starvationDeaths, faced, waveKillLog entries) or STOP and
  report the deviation — never judge on a moved baseline.
  Raids / raiders / pool totals exist only in armed rows (they
  are recorder-derived); they are reported armed-only and are
  NOT part of the plain-vs-armed exactness gate, exactly as in
  the finalloss-adopt run's baseline-vs-armed table.

## REPLICATION REFERENCE — THE 0615Z CURRENT-BASE BAND

From the finalloss-adopt arm (seeds 73671-73678,
tableseat-nowait, 180d death-aware, base at 5c3c80013;
baseline == armed on every field there):

- national-ever 7/8, national-final 5/8, table invited 5/8,
  table entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8,
  median survival 130d, deaths 284, starvation deaths 2.
- Per-seed (both arms identical there): 73671 180d survived
  wave-4 regional; 73672 118d won wave-4 global; 73673 32d
  village-lost wave-3 village; 73674 118d won wave-3 national;
  73675 169d village-lost wave-4 global; 73676 144d won
  wave-4 national; 73677 130d won wave-4 global; 73678 122d
  village-lost wave-3 regional.
- Death-cause shares there (284 deaths): villager combat
  43.3%, villager-vs-villager combat 24.6%, player arena 12.0%,
  villager expedition 7.0%, villager sickness 3.5%, wound that
  wouldn't close 2.5%, ambush 2.1%, villager monster 1.8%,
  starvation 0.7% (2 deaths), dehydration 0.7%, six singles
  at 0.4% each.
- Wave-4 kills there: 2 total (73671: 1, 73677: 1, rest 0).

PLAIN-vs-0615 RULE (fixed now, not decided after seeing
numbers): plain is compared to this band and ANY deviation
is reported field by field as BASE MOVEMENT (the re-pin
finding), with the new plain (= armed, if the exactness
gate passes) table becoming the NEW current-base control.
A plain-vs-0615 deviation is NOT a gate failure and NOT a
reason to stop: the whole point of a re-pin is to measure
whether r43 moved the control. Only armed-vs-plain
inexactness stops the run.

## INSTRUMENTS (recorders reused VERBATIM from current master, never edited)

- scripts/policies/raftdraft-diag.js (raid draft census + final
  waveKillLog snapshot), spawnsrc-diag.js (birth source + seq
  tags), oldcore-diag.js (birth -> removal fate per entity
  instance, seq linkage), w5births-diag.js (daily rd5.veterans
  = the gate's own living-veteran count, plus spawn targets),
  defwound-diag.js (resolve rows per entity instance, seq
  linkage — REQUIRED for the fought stage: raftdraft fieldFights
  carry monster type but no seq, so without defwound a
  villager/defender fight that the monster survives leaves no
  per-entity trace at all; defwound wraps
  resolveWildMonsterEncounter only, records after delegating,
  and never touches oldcore's flag wrap semantics).
- sha256 at this base (proving the verbatim claim; re-checked
  by the proof validator only as file identity, never edited):
  raftdraft 5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97,
  spawnsrc 31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17,
  oldcore efedd0cd0999d9f1b4987671b1da791109579ebdf72bb97d7478dc85c6e706cd,
  w5births b2f2d909f0bdc8a3d4bb2fd40e6d70d7a7a578da169e4b3d49ab63b7b0da1ebe,
  defwound 3f3f8eed58bb1a4bf02e124ae47f0ff5255a059339898cc93b1231bcb1fd9401.
- New this run (sweep-side only, no recorder edits):
  scripts/test-w4funnel-repin-diag-sweep.js — the w4funnel-a
  sweep copied with (1) evidence dir
  evidence/2026-10-27/perseed-w4funnel-repin-a/, (2) a plain
  arm (--one baseline) writing s<seed>-baseline.json rows,
  (3) a summary that judges armed-vs-plain exactness on the
  shared fields above AND reports plain-vs-0615 field by
  field, instead of judging armed against the stale
  w4funnel-a control band (deaths 234 / median 135d / wave-4
  6/8 — SUPERSEDED, never used as a gate here), (4) the two
  w4funnel-a summary-predicate fixes carried (neutrality
  reads the computed raftPoolTotal/raftPoolW3 variables, not
  absent band fields; corpus overflow judged on values > 0,
  not key presence). No recorder draws RNG, throws into the
  engine, or returns anything but the original value.
- Analyzer reused VERBATIM: scripts/test-w4funnel-diag.js
  (takes the corpus dir as argv; writes analysis.json).
  Unit proof scripts/test-w4funnel-a.js runs 48/48 BEFORE any
  sweep (verified this run: 48 passed, 0 failed) and is
  re-run after the sweep.
- New proof validator: scripts/test-w4funnel-repin-a.js
  (pure analysis over the corpus, no harness, no RNG):
  re-derives the plain band, the armed band, the
  plain-vs-armed exactness, the corpus-error counts, the
  funnel totals, and each DIAG-GO leg from the corpus files
  and exits non-zero on any mismatch with the evidence
  numbers it is given. Written BEFORE the sweep; run AFTER.
- Detgate: the sweep's --detgate mode on seed 73671
  (baseline vs recorders-OFF wrapped: days/gameDays/ts
  identical, no diag surface, no wraps installed) must PASS;
  a FAIL stops the run (recorder interference, not a
  measurement).

## DEFINITIONS (verbatim from w4funnel-a unless noted; any change
would have to be justified here, before sweeping — there is none)

- ARRIVAL = one world-monster birth with wave 4 (oldcore birth
  joined to its spawnsrc spawn on seq; a fled-recovery re-entry
  is a NEW arrival with its own seq and source 'fled-recovery',
  reported separately so fresh arrivals and all arrivals both
  reconcile). ARRIVAL SOURCE = the spawnsrc source string
  (tile-entry, scripted-titan, maintain, wanderer-contact, trap,
  fled-recovery, unknown). Raid draft is NOT a birth source —
  it selects already-born pool entities at raid time; the
  census verifies that (every wave-4 raider traces to a spawn)
  rather than assuming it.
- OUTCOME classes, from the oldcore removal kind + tbEnd
  settlement, in precedence order: killed-by-player-fight
  (tbEnd won / player-fight-kill); killed-by-villager-fight
  (villager-fight-kill incl. patrol); killed-by-defender-fight
  (raid-defense-kill); killed-other-cause (aid-crisis-kill,
  trap-capture, scripted-clear, raid-lingerer-sortie-kill,
  other-named); departed (departure-*, monsterTurn-departure);
  fled-record (the old object exits as a fled record — its own
  fate, never a kill, per oldcore); melted (player-fight-melt);
  still-present (seq in the final present list — beats any
  earlier removal, per oldcore re-entry rule);
  pending-in-fight (seq in pendingLifts at run end);
  unknown (untagged seq, unclassified removal, or vanished
  with no removal and not present). KNOWN = any outcome except
  unknown and pending-in-fight.
- FOUGHT = at least one resolve row (defwound-style: raid or
  field) or tbEnd for the seq — computed from the oldcore
  tbEnds + raftdraft fieldFights where seq linkage exists;
  where a fight row carries no seq it is reported as
  unlinked-fight, never attributed to an arrival.
- LIVING veterans (daily) = w5births daily rd5.veterans.
  CUMULATIVE killers (daily) = distinct waveKillLog `by` values
  with w >= 4 and kill day <= that day (log day field, not
  sample day). DIVERGENCE (daily) = cumulative - living; a
  negative value is reported as-is and investigated, never
  clamped. End-state pair reported alongside the series:
  cumulative-through-end (full log) vs living killers at end
  (post-run killer-status snapshot, gate rule above).

## PRIMARY QUESTION

Does the 2026-10-25 funnel answer still stand on the current
base? That answer was: arrivals 11 (tile-entry 9,
scripted-titan 2), outcomes 11/11 still-present, fought 2/11,
killed-from-arrivals 0/11, largest loss never-fought 9/11
(81.8%), living-vs-cumulative divergence 0 everywhere, the
band's single wave-4 kill proven non-world (strike, 73678
d115, scholar, via 'player', no birth/removal/tbEnd-origin).
The re-pin judges: (1) the new control band, (2) the new
funnel stage counts on identical seeds, (3) whether the
largest-loss verdict and the non-world-kill finding survive
base movement — or what replaced them.

## DIAG-GO RULE (ALL required, judged only against this header)

- (a) Census classifies >= 95% of wave-4 arrivals with known
  outcomes (outcome = one of the classes above; unknown =
  untagged seq, vanished-unrecorded, unclassified removal, or
  pending-in-fight at run end — each counted, never hidden).
- (b) The single largest funnel loss is named with its count
  and share of arrivals and of the stage it drains.
- (c) Living-vs-cumulative wave-4 killers decomposed per day
  with the divergence explained per killer at end (living /
  dead / not-counted, with the gate rule).
- (d) Sense: one seed's wave-4 thread read and described in
  plain words — numbers plus meaning, not counts alone (a
  non-measured narration replay is allowed; replay text never
  enters any count).
- Gates (STOP conditions, not verdict inputs): armed-vs-plain
  exactness on all shared fields; corpus recorder errors 0 on
  all five recorders, no overflow; detgate PASS on 73671;
  analyzer unit proof 48/48. Any leg missing = DIAG-NO-GO.
  Any gate failing = STOP and report, no verdict judged.

## SENSE PLAN (selection rule fixed before sweeping)

- Sense seed = the seed with the richest wave-4 thread in the
  NEW corpus: most wave-4 arrivals, ties broken by most
  wave-4 kills, then lowest seed number. Its census timeline
  is the authoritative thread. A NON-MEASURED narration replay
  (the w4funnel-a sense script pattern, adapted to that seed
  and its end day) is run for wording/meaning only; if the
  replay's trajectory shifts past the census thread, the
  divergence is disclosed, not hidden, and the replay proves
  wording only. If the sense seed has no wave-4 thread at all
  (zero arrivals AND zero kills), the sense section reports
  that absence as the finding and reads the seed's closest
  wave-4-adjacent thread (readiness hold beats / wave-4
  opening) instead — the rule is fixed here so the choice
  cannot be cherry-picked after seeing numbers.

## METRIC REVIEW (mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. No metric is re-scored in this run.

## BALANCED-PANEL / TELEMETRY NOTE (standing exception, carried)

scripts/balance-panel.js cannot ingest per-seed recorder
corpora (eleventh sighting, carried from w4funnel-a) — the
sweep-compare table + analyzer output are attached instead,
and telemetry-check is NOT run on recorder rows (its counts
are wrong on recorder rows; the 0615Z coordinator check
showed the same artifact class). No panel file is faked and
no telemetry baseline is rolled on recorder rows.

## WALL NUMBERS TO REPORT (every run)

national-ever / national-final, table invited / entered,
wins, wave 4-5 unlocks, median survival, deaths, starvation
deaths, wave-4 kills total + per seed, death-cause shares.
