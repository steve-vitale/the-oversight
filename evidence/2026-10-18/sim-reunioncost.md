# sim-reunioncost — reunion-opener survival-cost confirm (flesh-out loop, 2026-10-18)

Axis: scale-onramp (the blocking axis). Run: fleshout-20261018T0415Z (arm sim-reunioncost).
Named next from evidence/2026-10-16/sim-fightopen.md (round 2): the reunion opener's
round-1 strike cost flagged a median-survival breach (126.0d vs 144.0d, n=8 — noisy,
flagged honestly). This arm CONFIRMS it on a reunion-enrolled sample: does
FIGHTOPEN=1 shorten survival vs the identical-seed control on the same pre-seat
courtship stack?

FIGHTOPEN is landed (src/js/fieldFights.js, default OFF, proof 39/39, det-gate
byte-identical) — this arm is sweep-composition only, ZERO src/js changes. The
reunion opener (round-1 `wait:reunion-novel`) buys mirror-wear delay from round 3→4,
but the fights end round 1–2 — the opener costs the round-1 strike for a benefit
that never matures. The congregation opener (beam prevention, proven synthetic
value) is the contrast case, but wild congregation learnings are too rare to
enroll — the reunion cost question is the enrollable one.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep trajectory)
- SUBSTRATE: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 (explicit, pre-seat) NODEWITNESS=1 — the fightopen
  round-2 stack exactly. Policies: leadfeast / belongfeast (tribfloor courtship stack).
- SEEDS: fresh, batches of 4 × {leadfeast, belongfeast} × {armed, control} = 16
  runs/batch. Batch 1: [987–990] (freshness verified before the run: 0 per-seed
  filename hits across evidence/ + scripts/).
- ENROLLMENT (post-hoc, never a re-score): a seed enrolls iff EITHER arm's
  per-seed JSON carries a reunion witness-learning (id === 'reunion'). Learning
  is FIGHTOPEN-independent (confirmed identical twice in sim-fightopen).
- POOL GATE: pooled reunion-eligible post-learning field fights >= 24 across
  both arms, or 2 batches max (8 seeds).
- PRIMARY (GO = survival cost confirmed): median survival armed < control − 10d
  over enrolled identical-seed pairs. GO => named next: gate reunion OUT of the
  opener set (species-level exclusion) or pair with survival work. NO-GO => the
  round-2 −18d was noise; the reunion opener stands as-is.
- SECONDARY (measured, not binding): opener-fire rate (expect ~7/7-class armed),
  resolutions movement (expect 0/0), vDie share in opener fights armed vs
  control, conditions-never-met share (expect ~0 armed, ~95% control per round 2).
- GUARDRAILS (any miss = NO-GO per §14): no treatment-only death causes;
  national >= control − 2; wave reach not worse.
- HORIZON: 180d death-aware (dead villages stop simulating, +10d tail max).
- INSTRUMENT: the execensus capture + classifyLearning, reused wholesale via
  scripts/sweep-reunioncost-20261018.js (adapted from sweep-fightopen-20261016.js;
  only ARM tag + evidence dirs changed). Judge: scripts/analyze-reunioncost-20261018.js.

## Canon read
- docs/CANON.md: read. "Monster encounters are fought, not rolled" (untouched —
  the opener returns the same action the gate would have returned, same cost
  parity). Human skills ≠ alien abilities (untouched). No silent actions
  (every opener is narrated in the fight record). "If you don't know, it doesn't
  show" (untouched — opener only fires on knownSig).
- docs/MONSTER-WAVES.md: read (canon drift noted in sim-counterwire.md — NOT
  rewritten here).

## Results
(PENDING — batch 1 running.)

## Results

COMPLETION: 32/32 runs complete (2 batches of 4 fresh seeds × {leadfeast,
belongfeast} × {armed, control}); 0 instrument errors. Sweep scripts:
scripts/sweep-reunioncost-20261018.js; judge: scripts/analyze-reunioncost-20261018.js
(verdict JSON: evidence/2026-10-18/perseed-reunioncost/_verdict.json).

| metric | armed (FIGHTOPEN=1) | control (flag unset) |
|---|---|---|
| runs | 16 | 16 |
| reunion witness-learnings | 0 | 0 |
| enrolled pairs | 0 | — |
| pooled reunion-eligible field fights | 0 | 0 |
| wave-4 / wave-5 reached | 0/16 | 0/16 |
| national / table / won | 9/16 / 13/16 / 0 | 9/16 / 13/16 / 0 |
| median / max survival | 161.5d / 180d (pooled) | — |

**PRIMARY: INCONCLUSIVE (pool gate not met).** 0 reunion learnings on 32 runs;
enrollment 0/8 seeds; pooled fights 0 < 24 after both pre-registered batches.
Per §14 this is reported as measured, never re-scored — the survival-cost
question stands open, not answered. Learning is FIGHTOPEN-independent
(armed/control trajectories byte-identical on every seed — 16/16 pairs
metric-identical, e.g. s987 leadfeast d165/village-lost both arms), so the
INCONCLUSIVE is a sampling phenomenon, not a layer artifact.

**The substrate moved under the question.** maxWave=3 on 31/32 runs (maxWave=2
on s990, which died d24). nNodeWitnessReports = 0 on every run — the witness
channel never fired because there were no wave-4/5 field fights to witness.
fightopen round-1 (seeds 975–982, 2026-10-16) measured wave-4 reached 14/16 on
this exact stack; the 1815Z/194000Z runs and armorstock/armorstock2 have since
measured ~0 wave-4 unlocks on the pre-seat FEASTSCALE_R13 substrate. This batch
(8 fresh seeds, 32 runs, 0/32 wave-4) confirms the drift on independent seeds:
the wave-4 readiness gate (combat readiness gates wave unlocks, Steve's design
call #4) is now the binding constraint on the courtship road — villages reach
national (18/32) and table (26/32) but never unlock the wave-4 content the
trick-execution game needs. Filed to sim-findings (below). The fightopen
SECONDARY question is UNMEASURABLE on this substrate until the unlock bar moves.

**GUARDRAILS:** vacuously satisfied (no enrolled pairs; no treatment-only
signals possible — armed/control death-cause sets identical).

**Telemetry deviation check:** 2 LOUD, both EXPLAINED — table 16→26 is the
recurring n-mismatch rate artifact (16/16 baseline vs 26/32 = 81%, rate-
comparable); wins 16→0 is the recurring pre-seat substrate-mismatch class
(SEATDRIVE=0 explicit, no take-seat verb). Baseline kept
(national 12, table 16, wins 16, exiled 0), no roll.

## Village assessment

The villages in this batch look like courtship-road villages always look: they
court, they season links (national 18/32), they wait on the table (26/32), and
they die rich-ish in combat (combat 58% + villager combat 19% + monster 10% of
1,452 deaths; starvation 1% — the food economy holds). Nobody unlocks wave 4,
nobody wins. The scale-onramp wall on this substrate is no longer "villages
starve mid-ambition" (the 2026-10-12 bind) — it's the readiness gate: the
courtship road produces national villages that the wave-4 combat-readiness bar
never admits. Who thrived: national villages on 6/8 seeds. Who died: s990's
whole cast at d24 (early collapse, maxWave 2) and the usual combat attrition
elsewhere.

## Metric review (§14)

- The PRIMARY bound the run: INCONCLUSIVE per the pre-registered pool gate
  (0 < 24 after both batches). Not re-scored as a NO-GO against a friendlier
  metric — the question ("does the reunion opener cost survival?") is
  genuinely unanswered on this sample.
- Proposed revision for the NEXT run: the question needs a wave-4-unlocking
  substrate (the win-stack composition, or a readiness-satisfying courtship
  variant) — enroll there, or wait for the unlock bar to move. This revision
  applies to the next run only.
- The enrollment design itself is validated: learning-identical armed/control
  pairs make post-hoc enrollment honest; the pool gate fired exactly as
  designed (fightopen round-1's lesson institutionalized).
- No sense reads were possible — zero opener-eligible fights, zero opener
  beats. The SENSE-TESTING LAW had nothing to read; the transcripts are
  ordinary courtship-road beats.
