# sim-wave5gate-a — the binding gate for wave 5's absence (axis scale-onramp, backlog "CURRENT BASELINE IS THE 806ef430e TABLE")

Run: fleshout-20261026T1816Z, arm sim-wave5gate-a. DIAG / MEASUREMENT ONLY — zero src/js changes. This arm names the binding gate; any gate change is a later arm.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 5 = standing >= 200 AND wave-4 faced, plus the readiness gate in standing.js) and docs/CONTESTS.md only if the wave-5 gate touches contests (it does not — the wave-5 gate is standing + faced + readiness; contests enter only the secondary full-seat decomposition via deedGateReady). No design is invented here.

## PRE-REGISTRATION (binding — judged only against this; written BEFORE any sweep)

- Base commit at arm start: 9c9ac3e4f (worktree tip; see "Base" below for the engine delta vs the 1715Z bases).
- Instrument VERBATIM for the re-baseline: scripts/test-rebaseline-sweep.js, tableseat-nowait substrate (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only, 180d death-aware horizon — 180 is the cap, not a fixed horizon: runDays stops on Game.over), seeds 73671–73678, corpus under evidence/2026-10-26/perseed-sim-wave5gate-a-rebaseline/ — NEVER overwriting perseed-sim-tablenat-a/ or any other run's corpus.
- Gate instrument (new in this arm): scripts/sim-wave5gate-a-sweep.js — same substrate, same seeds, same 180d death-aware horizon, one process per seed (never two harnesses in one process). Its daily hook calls the base policy daily first, then takes PURE-READ snapshots only (villageStanding, standingPlentyCappedTotal, waveUnlockReady, _standingPeakWave, deedState/wavesFaced, waveLedgerPoints, waveEngaged — never villageStandingTotal() or unlockedWave() inside the day loop, so no hold/release beat or peak-ratchet side effect can fire from the instrument; the gated total is recomputed from the pure components with the villageStandingTotal() formula and checked against the real function once at end-of-run, after the run is over). Corpus under evidence/2026-10-26/perseed-sim-wave5gate-a/.
- Analyzer: scripts/sim-wave5gate-a-analyze.js — reads both corpora plus the 1715Z tablenat corpus, prints the reproduction diffs, the per-seed binding gates, and the full-seat table. Proof: scripts/test-wave5gate-a.js — re-runs the analyzer over the corpus and asserts the reported counts.
- Horizon + why: 180d death-aware, because it is the 1715Z band's horizon — the re-baseline must be comparable field-by-field, and the band's own survival distribution (median 166d, max 180d) sits inside it; dead villages stop simulating, so no fixed-200d tail is simulated.
- Primary metric (DIAG): the per-seed binding gate for wave-5 absence — the one gate class that, alone, blocks wave 5 on that seed, evaluated at the seed's closest-approach day (defined below) and cross-checked at end-of-run.
- Gate classes (pre-registered, in causal order — a class counts as failing only if it is not downstream of an earlier failing class):
  1. W3RUNG — day < 25 or wave-2 ledger points < 4 (without the wave-3 rung there is no wave 4 to face and no standing rung to climb).
  2. STANDING-RAW — raw standing (war + diplomacy + plenty, before cap/defer) < 200.
  3. PLENTY-CAP — raw >= 200 but capped (war + diplomacy + min(plenty,100)) < 200.
  4. READINESS — a readiness defer holds the gated total below 200: DEF4 (raw >= 100, wave-4 readiness not met, tightest bound 99) or DEF5 (capped >= 200, wave-5 readiness not met, bound 199); the tightest bound is the named hold, all holds present are listed, and the short sub-bars (armor/weapons/tricks/veterans) are recorded.
  5. FACED4 — wave 4 was unlocked at some point in the run but no wave-4 monster was ever faced blow-by-blow (faced counts fleeing too — facing is encounter, not victory). If wave 4 was never unlocked, FACED4==0 is downstream of the standing/readiness classes and does NOT count as an independent failing class.
- Closest-approach day (pre-registered): the daily snapshot maximizing (w3rung?1:0) + (gated>=200?1:0) + (faced4>0?1:0); ties broken by higher gated standing, then higher faced4 count, then earliest day. The binding gate for the seed is the set of failing classes on that day; the seed counts as "single-gate" iff exactly one class fails there.
- GO iff one gate class alone blocks wave 5 on >= 6/8 seeds. If the truth is a split, the verdict is DIAG-NO-GO on the single-gate bar, with the distribution reported honestly — never re-scored mid-run.
- SECONDARY DIAGNOSTIC ONLY (no second verdict): the same per-seed decomposition for full-seat vs lesser-seat gates (deedGateReady bars: waves 5/5/4/3/2, contests >= 3, crises >= 3, stage >= 2, food deeds; lesser bars from tableSeat detail), reported at end-of-run, not judged.
- FAILURE MODES (pre-declared): if the re-baseline does not reproduce the 1715Z table, report the per-seed diffs exactly before judging anything — do not silently re-derive. If my computed gated total disagrees with the real villageStandingTotal() at end-of-run, or my computed max wave disagrees with the harness maxWaveUnlocked, report the mismatch as an instrument fault, not a gate finding.
- METRIC BINDING (§14): no mid-run re-scores. Metric doubts go under "metric review" for the NEXT run.
- BALANCED PANEL (§15): same recorder-corpus limitation prior arms reported — scripts/balance-panel.js has no corpus-ingest mode; the paired identical-seed tables below are the comparison of record. No panel file is produced or faked.
- Telemetry-check is NOT run on recorder rows (its counts are wrong on recorder rows — standing instruction from the 0158Z evidence).

## VERDICT: DIAG-NO-GO on the single-gate bar — the split is the finding

No single gate class alone blocks wave 5 on >= 6/8 seeds. The distribution
is STANDING-RAW 4, READINESS-DEF5 2, COMPOUND (RAW + DEF4) 2. The bar
required 6; the top single class has 4. This is not a near-miss on one
gate — it is two different walls plus a compound:

- Four villages never earn 200 standing (peaks 127–195) and stop there.
- Two villages earn 200+ standing (peaks 207–232) and are held at 199 by
  the wave-5 readiness defer — and inside that defer, the veterans bar
  is unmeetable on this band: no village ever kills a wave-4 monster
  (0/8 seeds), so living wave-4+ killers peak at 0 everywhere against a
  demand of 2.
- Two villages never even unlock wave 4: raw peaks at 102–122 (bonds
  only, zero wave-3+ war points) AND the wave-4 readiness defer holds
  them at 99 (never a living wave-3 killer on 73677; a flickering one on
  73678). Either failure alone blocks wave 5; both are present.

No seed ever reaches gated standing 200 on any day (daysGated200 = 0 on
all 8). No seed ever sits in the "standing earned, facing missing" window
(daysStandingOkFacedMissing = 0 on all 8): the six wave-4 villages all
face wave 4, and the two non-wave-4 villages never unlock it. FACED4 never
independently blocks on this band. The wave-3 rung never fails. The
plenty cap never binds alone (no seed has raw >= 200 with capped < 200).

## BASE (re-baseline first, as tasked)

- Arm base: 9c9ac3e4f — "sim-scale-onramp-round-1715: coordinator
  evidence, tablenat + r52split GO, merged locally pending ship".
- Engine delta 7231f9272 (tablenat base) .. 9c9ac3e4f, restricted to
  src/js + src/data + scripts/policies: EXACTLY ONE FILE — src/js/build.js,
  one line, the batch-ship BUILD_VERSION stamp
  ('6a2628489-20261026-121633' -> '7231f9272-20261026-172415'). Zero
  engine delta. Prediction: the band reproduces the 1715Z table exactly.
  Result: CONFIRMED — 8/8 seeds identical on all 17 compared fields
  (days, gameDays, endReason, won, waveReach, maxArc, finalRank, maxRank,
  nationalEver, nationalFinal, table, entered, deathTotal,
  starvationDeaths, ts, finalPop, finalPantry).
- The re-baseline corpus (verbatim script, CORPUS PASS) is
  evidence/2026-10-26/perseed-sim-wave5gate-a-rebaseline/ (8 rows +
  summary.json). Its summary's NEUTRALITY line reads DEVIATED — that is
  against the OLD published control (raids 85 / deaths 234 / wins 4),
  not against 1715Z; the judge for this arm is the 1715Z table, and
  against it the band is identical. No panel file is faked for §15
  (same recorder-corpus limitation as prior arms).

## RE-BASELINE BAND (base 9c9ac3e4f, tableseat-nowait, 180d death-aware, n = 8)

Identical to the 1715Z table on every field compared (see proof).

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | dth | stv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 48 | 0 |
| 73672 | 180 | survived | 0 | 4 | 4 | regional | regional | 0 | 0 | 1 | 0 | 51 | 0 |
| 73673 | 117 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 40 | 0 |
| 73674 | 166 | village-lost | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 39 | 0 |
| 73675 | 180 | survived | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 42 | 0 |
| 73676 | 144 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 43 | 0 |
| 73677 | 140 | over-other | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 37 | 0 |
| 73678 | 104 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 38 | 1 |

Band: wins 2/8, national-ever 6/8, national-final 5/8, table waiting
3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d,
max 180d, deaths 338, starvation 1, raids 110, raiders 469, pool 1,719,
poolW3 263. Nonworldkill: 207 initiations, 0 unclassified.

## PER-SEED BINDING GATE (closest-approach day; rd5 demand = 4 armored @ P>=15 / 6 armed / 3 tricks / 2 veterans)

| seed | closest | score | gated | raw (war/dip/plen) | capped | faced4 | w4 unlock | holds | rd5 that day (arm/armed/trk/vet) | binding gate |
|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | d178 | 2/3 | 152 | 152 (50/102/0) | 152 | 2 (1st d175) | d161 | — | 5/7/21/0, short [veterans] | SINGLE STANDING-RAW |
| 73672 | d179 | 2/3 | 195 | 195 (75/0/120) | 175 | 3 (1st d100) | d98 | — | 3/4/27/0, short [armor, weapons, veterans] | SINGLE STANDING-RAW |
| 73673 | d106 | 2/3 | 127 | 127 (25/102/0) | 127 | 1 (1st d106) | d80 | — | 7/9/21/0, short [veterans] | SINGLE STANDING-RAW |
| 73674 | d147 | 2/3 | 147 | 147 (25/102/20) | 147 | 2 (1st d106) | d106 | — | 2/9/20/0, short [armor, veterans] | SINGLE STANDING-RAW |
| 73675 | d171 | 2/3 | 199 | 212 (50/102/60) | 212 | 3 (1st d133) | d117 | defer5 | 3/7/20/0, short [armor, veterans] | SINGLE READINESS-DEF5 |
| 73676 | d142 | 2/3 | 199 | 207 (50/102/80; peak raw 232) | 207 | 1 (1st d142) | d133 | defer5 | 6/7/21/0, short [veterans] | SINGLE READINESS-DEF5 |
| 73677 | d62 | 1/3 | 99 | 102 (peak raw 122: 0/102/20) | 102 | 0, never | never | defer4 | rd4 short [veterans] (rd4 veterans peak 0 all run) | COMPOUND RAW + DEF4 |
| 73678 | d68 | 1/3 | 99 | 102 (peak raw 102: 0/102/0) | 102 | 0, never | never | defer4 | rd4 short [veterans] | COMPOUND RAW + DEF4 |

Reading notes (all from the corpus, not impressions):

- STANDING-RAW seeds (73671–73674): the gated total equals raw on the
  closest day — no cap, no defer in the way (wave 4 already released,
  peak floor holding it open). The shortfall is plain: peaks 127–195
  against a 200 bar. 73672 is the closest: 5 raw points short, but 25
  capped points short (plenty 120, capped at 100) — and bread cannot
  close that capped gap, since it is already over the cap; it needs
  war or bonds (one more wave-3+ ledger point is +25 war, which would
  put capped at exactly 200).
- READINESS-DEF5 seeds (73675, 73676): raw and capped both clear 200,
  wave 4 faced, and the gated total sits at exactly 199 — the defer5
  bound. 73676's only short bar on its closest day is veterans (6/7/21
  otherwise clear). 73675 is short armor (3 vs 4) as well as veterans,
  but its armored count peaks at 7 over the run — armor flickers with
  mortality; veterans never flickers, because it is 0 throughout.
- COMPOUND seeds (73677, 73678): raw peaks at 122 and 102, built on
  bonds alone (3 seasoned links = 102; war 0 — zero wave-3+ ledger
  points all run). At the same time the defer4 hold caps the gated
  total at 99: 73677 never fields a living wave-3 killer on any day
  (rd4 veterans peak 0), so wave 4 never unlocks; 73678 fields one
  somewhere but not on its closest day. Removing the raw shortfall
  alone still leaves the 99 hold; removing the hold alone still
  leaves raw at ~102. Both block, so neither is "the" single gate.
- End-of-run cross-check: the closest-approach verdict matches the
  end-of-run verdict on 7/8 seeds. The exception is 73678, whose
  standing collapses to 25 at death (its links die with the village),
  so its end state shows RAW only — the compound is visible at its
  best (d68), not at its death. 73673's end standing likewise
  collapses (25) after a d106 peak of 127; its verdict is RAW either
  way.
- The snapshot gap, stated honestly: 73674's wave-4 release lands on
  d106 while every snapshot that day shows rd4 veterans 0 — the peak
  jumps 0 -> 4 mid-day (a wave-3 killer alive during day processing,
  dead by the snapshot). Snapshot-time readiness therefore understates
  mid-day readiness. This does NOT threaten the wave-5 verdict: any
  mid-day gated >= 200 would set the peak-5 floor and persist to the
  end of run, and every seed's end-of-run real villageStandingTotal()
  is < 200 (152/195/100/147/199/199/99/25) with waveReach <= 4. A missed
  wave-5 release is ruled out by the end state, not assumed away.

## THE VETERANS CHANNEL (the finding inside the finding)

- Wave-4 monsters are faced on 6/8 seeds (first faced days d100–d175)
  and spawn on those seeds (rebaseline w4spawns 2–8), but wave-4 KILLS
  are 0 on all 8 seeds (kill-log wave-4 entries 0, killers4 0,
  nonworldkill wave-4 TB kills 0). Villages meet the Mirror Draft and
  never kill one of it.
- Consequence: the wave-5 readiness veterans bar (2 living wave-4+
  killers) peaks at 0 on every seed — not short by one, empty. The
  DEF5 seeds cannot clear it by standing taller or gearing harder;
  they need a first wave-4 kill, which no seed on this band produces.
- The wave-4 readiness veterans bar (1 living wave-3+ killer) is met
  sometimes (peak 1 on 6/8 seeds) and never on 73677 — which is why
  73677 never unlocks wave 4 at all. The veteran pipeline (kill wave-3
  -> unlock wave-4 -> kill wave-4 -> unlock wave-5) stalls at its
  second step on this band: the first step works, the second never
  fires.
- Next measurement question for a later arm (not chased here): why
  wave-4 encounters never convert to kills — fled, outmatched,
  or fought-and-lost? The faced counts include fled encounters
  (fleeing counts as faced), so "faced" alone cannot answer it. A
  wave-4 encounter decomposition (spawn -> fight -> flee/lose/kill)
  is the instrument that arm needs.

## FULL-SEAT SECONDARY (end-of-run; reported, NOT judged)

Full seat = deedGateReady: waves 5/5/4/3/2 distinct faced, contests
>= 3, crises >= 3, stage >= 2, food deeds. No seed reaches it.

| seed | seat at end | waves w1/w2/w3/w4/w5 | contests | crises | stage | food | full-seat bars short |
|---|---|---|---|---|---|---|---|
| 73671 | none | 17/6/2/2/0 | 16 | 4 | 3 | no | w3 (2<4), w4 (2<3), w5 (0<2), food |
| 73672 | lesser | 19/11/6/3/0 | 16 | 3 | 3 | yes | w5 ONLY (0<2) |
| 73673 | none | 19/9/6/1/0 | 12 | 3 | 3 | no | w4 (1<3), w5 (0<2), food |
| 73674 | none | 14/9/1/2/0 | 18 | 5 | 3 | yes | w3 (1<4), w4 (2<3), w5 (0<2) |
| 73675 | none | 22/9/2/3/0 | 19 | 3 | 3 | no | w3 (2<4), w5 (0<2), food |
| 73676 | lesser | 16/9/3/1/0 | 15 | 4 | 3 | yes | w3 (3<4), w4 (1<3), w5 (0<2) |
| 73677 | lesser | 18/11/3/0/0 | 19 | 3 | 3 | yes | w3 (3<4), w4 (0<3), w5 (0<2) |
| 73678 | none | 15/8/7/0/0 | 9 | 4 | 3 | no | w4 (0<3), w5 (0<2), food |

- The universal full-seat blocker is wave-5 faced = 0 on all 8 seeds:
  every seed fails the w5 = 2 bar, and 73672 fails ONLY that bar
  (contests, crises, stage, food, and waves 1–4 all clear). The full
  seat is unreached because wave 5 is unborn — the same wall seen
  from the table side, not a second wall.
- Contests, crises, and stage never block the full seat on this band
  (all pass on all seeds). Food deeds fail on 4 seeds but are never
  the sole blocker. Scale rank is not a full-seat bar (dropped
  2026-10-13; reported honestly in deedGateReady, not gated on).
- Four-realm formation (a polity of 4+ fires) is NOT measured by this
  instrument — it records scaleRank only, not polity membership. Not
  claimed here, same caveat as the tablenat arm.

## SENSE-TEST (plain words; 18 captured System lines across the band)

The System's voice is varied and situational where it speaks: a small
village hears "the next act needs a BIGGER STAGE... there's not enough
of you to REFLECT" (73672 d45, 73678 d42); a wave-4 village hears the
Mirror Draft release ("We've been watching you for a LONG time. Your
faiths. Your formats. Your little institutions. So we built something
out of... well. Out of YOU." — d80–d161 across six seeds); a
table-waiting regional village hears the nation prod ("FINALES need a
NATION. You've got a region; now make it a REALM." — 73674 d129,
matching 73672's d98 prod in the tablenat trace). The beats track the
village's actual situation instead of repeating one line — that part
reads like a show reacting to its cast.

Two honest limits. First, the capture covers say/emit only: the
readiness hold beats ("the fifth draft stays in the wings") travel
through sysSay and were NOT captured, so their absence from this
corpus is a coverage gap, not evidence they never fire — a future
trace arm that wants the hold beats must wrap sysSay. Second, the
wave-4 release line is the same sentence on all six seeds: acceptable
for a System beat, but it is the same class of repetition the
tablenat arm flagged in fireside dialogue (one canned table line
across speakers for ~80 days) — the dialogue-variety blank stands,
not re-measured here.

Villagers acting like people, sampled from the same band: the villages
court (73671/73673/73675/73676/73678 reach national-or-better on
links alone — 3 seasoned links each), feast (73672's 6 feasts carry
its standing to 195 with zero links), and fight widely (wave-1 faced
14–22 distinct types per seed). What no village does on this band is
kill a wave-4 monster — that is a capability gap, not a behavior
blank: the villagers fight, they just do not win that fight.

## VILLAGE ASSESSMENT (plain words)

Eight villages, and the wall has two faces. Four of them (73671–73674)
are honest strivers that never earn enough standing: a bonds village
(73671: 3 links, no feasts, 152), a bread village (73672: 6 feasts,
no links, 195 — five points short, and bread already capped so the
next feast would not help), and two mixed villages that peak at 127
and 147 and then fall apart. Two of them (73675, 73676) do earn it —
212 and 232 standing, real links, real feasts — and run into the
second face: the village is not ready to fight what it earned, held
at 199 because nobody has ever killed a wave-4 monster. And two of
them (73677, 73678) never get started: three links and nothing else,
no wave-3 kills at all, held at 99 by a readiness bar they never
meet, winning (73677) or dying (73678) without ever seeing wave 4.
The wins, both of them, come through the lesser seat, as before. Wave
5 is unborn everywhere, and now the reason has a shape: standing is
earned slowly, readiness is earned by killing, and the killing stops
at wave 3.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The GO bar (one gate class alone on >= 6/8 seeds) is judged exactly
  as pre-registered. The verdict is DIAG-NO-GO because the truth is a
  split (4 / 2 / 2), not because the bar moved.
- Two instrument defects were found and fixed BEFORE the verdict, both
  disclosed here rather than buried:
  1. Ever-table snapshot order (sweep): the first gate sweep
     snapshotted tableWaiting only AFTER base.daily, so on the
     sitting day the seat leg cleared tableWaiting before the
     snapshot saw it — won seeds showed table 0 against the
     rebaseline's 1. Fixed by adding a pre-base ever-flag snapshot
     exactly like the verbatim rebaseline hook; the sweep was fully
     re-run and the gate-vs-rebaseline trajectories are now
     identical on all 8 seeds. Gate snapshots themselves were
     unaffected (their values are identical across both runs).
  2. Gate-class elif chain (analyzer): the first analyzer version
     evaluated classes as an if/elif chain, so STANDING-RAW masked a
     co-present DEF4 hold and the first pass read DIAG-GO (RAW 6).
     That contradicts the pre-registered class definitions, which
     define each class by its own condition (CAP explicitly requires
     raw >= 200; DEF4 requires raw >= 100 and unmet readiness — both
     true on 73677/73678) and reserve "downstream" for FACED4 (wave 4
     never unlocked). The analyzer now evaluates each class by its
     own definition, using the sweep's actual holds (so peak-ratchet
     grandfathering is honored). The bar did not change; the
     classification now follows the pre-registration literally, and
     the verdict moved to DIAG-NO-GO accordingly. The first-pass
     output is preserved in the run record; nothing was re-judged on
     a friendlier metric.
- One metric note for the NEXT run: "closest-approach day" is defined
  on snapshot-time state, but the engine can release a wave mid-day
  (73674 d106: peak 0 -> 4 while snapshots show veterans 0). For wave
  5 this cannot hide a release (the peak-5 floor would persist to
  end-of-run and the end totals rule it out), but a future arm that
  judges a mid-run peak should prefer the engine's own peak field
  over snapshot-time bars when they disagree.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms (balance-panel.js has no
  corpus-ingest mode). The paired identical-seed tables above are the
  comparison of record. No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts are wrong
  on recorder rows — standing instruction from the 0158Z evidence).
- check.js --quick NOT run: zero src/js diff in this tree (DIAG arm,
  three new scripts only) and sibling loops are live; the arm's own
  proof is the verbatim rebaseline (CORPUS PASS) + the gate sweep's
  endChecks (all true) + the 76-check proof below. node --check clean
  on all three new scripts.

## PROOF SCRIPTS (all in this tree, all run)

- scripts/test-rebaseline-sweep.js — used VERBATIM, zero edits. Band
  CORPUS PASS (summary.json in perseed-sim-wave5gate-a-rebaseline/).
- scripts/sim-wave5gate-a-sweep.js — NEW in this arm. One process per
  seed, pure-read daily snapshots + say/emit hold-line capture. All 8
  seeds: endChecks all true (computed gated == real
  villageStandingTotal, computed wave == real unlockedWave,
  computed max wave == harness maxWaveUnlocked, computed capped ==
  real capped total).
- scripts/sim-wave5gate-a-analyze.js — NEW in this arm. Reads the gate
  corpus + rebaseline corpus + 1715Z tablenat corpus; prints
  reproduction diffs, binding gates, full-seat table, verdict.
  Exit 0 on the final corpora.
- scripts/test-wave5gate-a.js — NEW in this arm. Re-runs the analyzer
  and asserts the reported counts: 76 PASS, 0 FAIL (corpus complete,
  16/16 reproduction + trajectory identities, band table, per-seed
  gates, distribution 4/2/2, verdict DIAG-NO-GO, veterans peak 0 and
  w4 kills 0 on all seeds, full-seat w5 = 0 on all seeds, 73672 fails
  only the w5 bar).

## INFRASTRUCTURE (loud, as required)

- No EPERM flap hit this run: all node/shell disk writes succeeded
  (16 band rows, 2 summaries, 8 gate rows, evidence, scripts). No
  stdout-only fallback was needed. The writeFileRetry loop from the
  rebaseline script's pattern was carried into the new sweep script
  but never triggered.
- No safe-commit refusal yet (commit step follows this file); the
  coordinator owns the --ff-only merge. No `[needs-eyes]`: this DIAG
  arm changes no feel, combat, or UI — that assessment did not change
  during the run.
- Files for commit (worktree ~/workspace/worktrees/sim-wave5gate-a):
  evidence/2026-10-26/sim-wave5gate-a.md (this file),
  evidence/2026-10-26/perseed-sim-wave5gate-a/ (8 rows),
  evidence/2026-10-26/perseed-sim-wave5gate-a-rebaseline/ (8 rows +
  summary.json),
  scripts/sim-wave5gate-a-sweep.js, scripts/sim-wave5gate-a-analyze.js,
  scripts/test-wave5gate-a.js. Zero src/js diff. No other untracked
  files in the worktree (verified by git status at close — see the
  final report).

## BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the binding gate for wave 5's absence on the
  1715Z band is NOT one gate — it is STANDING-RAW (4 seeds),
  READINESS-DEF5 (2 seeds), and a RAW+DEF4 compound (2 seeds).
  DIAG-NO-GO on the single-gate bar, with the distribution.
- FILLED (measurement): the veterans channel is empty band-wide —
  wave-4 faced on 6/8 seeds, wave-4 killed on 0/8, so the wave-5
  veterans bar (2 living wave-4+ killers) peaks at 0 everywhere.
  Any future wave-5 lever must reckon with the missing first
  wave-4 kill, not just the standing bar.
- FILLED (measurement): the full seat's universal blocker is wave-5
  faced = 0 (73672 fails only that bar); contests, crises, and stage
  never block on this band.
- DOCUMENTED, NOT FIXED (instrument coverage): sysSay-only hold beats
  ("the fifth draft stays in the wings") are invisible to say/emit
  transcript capture — a future trace arm must wrap sysSay.
- DOCUMENTED, NOT FIXED (next instrument): a wave-4 encounter
  decomposition (spawn -> fight -> flee/lose/kill) is needed to say
  why faced wave-4 monsters are never killed. Not built here.
- DOCUMENTED, NOT FIXED (standing, from the tablenat arm, still open):
  the canned fireside table line, verbatim across speakers.
- NOT A FINDING: no game bug was found in the wave-5 gate, the
  standing computation, or the readiness bars — the analyzer's
  computed gated total matches the engine's real total on all 8
  seeds at end-of-run, and the computed max wave matches the
  harness on all 8. The gate works as designed; villages do not
  reach it.

Convergence state: scale-onramp stays converging (NOT converged):
wave 5 is unborn on this band, the full seat is unreached, and wins
come only through the default-OFF tableseat-nowait lesser seat. The
wall did not move; this arm measured exactly where it stands, brick
by brick.
