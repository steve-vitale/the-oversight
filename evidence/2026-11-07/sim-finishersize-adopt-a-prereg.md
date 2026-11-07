# sim-finishersize-adopt-a — prereg: re-judge the committed finish on the ADDRESSABLE-WINDOW metric

Run: fleshout-20261107T0515Z, Loop A arm sim-finishersize-adopt-a (adoption of the
stranded sim-finishersize-a branch, rebased onto master 41007b9d4, tip aa49a1a34).
Axis: scale-onramp / winnability chain. Tracker blank #1 / finding #1829.

## What this run re-judges

The 0221Z run (evidence/2026-11-06/sim-finishersize-a.md) landed a DIAG-GO: the
committed-finish lever in `src/js/fieldFights.js` (+126/−7) is mechanism-proven
89/89 and safe (guards and wall numbers byte-identical), but its count metric
was METRIC-BROKEN — it counted below-break kills the old code already makes.
On the pilot band (99661–99668) the baseline had exactly 2 below-break
meetings and BOTH already converted under old code (99664 d104: contact strike
kills outright; 99667 d109: ordinary round-1 morale kills, post-contact HP 8
against a 26 strike). The addressable pool — meetings the old code cannot
finish — was 0, so the +2 kill bar was mathematically impossible on that band.

This run judges the SAME lever (no game-code change) on the corrected metric
named in that run's metric review (§14a). Phase A of this task (adoption:
rebase + proof re-run) is already done on this branch; Phase B is this re-judge.

## The corrected metric — ADDRESSABLE-WINDOW conversion rate

A wave-4+ field meeting is ADDRESSABLE (A) iff ALL of:
1. It is a below-break meeting: the contact-finish branch fired
   (`contactFinishAttempted`, wave ≥ 4) — the beast was met below its 15%
   break line and the fighter held a finish instrument in a true contact
   meeting (mDealt === 0).
2. The contact strike did NOT kill (`contactFinishKill` false).
3. Post-contact HP is STRICTLY GREATER than the contact strike:
   `contactFinishBeastHp − contactFinishDmg > contactFinishDmg`. This is the
   "old code cannot finish it" clause: when the beast survives the contact
   strike with more than one strike's worth of HP left, a single further
   strike cannot end it — the pilot's 99667 meeting (8 HP left vs a 26
   strike) fails this clause, and the old code did in fact kill it in round 1.
4. Fighter intent is `engage` (`fsIntent === 'engage'`).
5. Fighter entry HP is at or above the 60% gate (`fsEntryVhpFrac >= 0.60`,
   the engine's own `_fsHpOk` value, recorded at contact time).

The CONVERTIBLE subset (C) is A with post-contact HP ≤ 3 × the contact
strike — the lever's own tail gate (`_fsTail`). Meetings in A but above the
tail are addressable by the metric's definition but by design NOT convertible
by this lever; they are reported separately, never silently dropped.

Primary metric: **conversion rate = FS committed kills / |A|**, where a
committed kill is an armed-leg A-meeting with `fsCommitMhp != null` (a commit
fired) and outcome `vKill`. (A commit that ends in a fighter death or a
takeover counts as fired but not killed; a twoblow takeover of a live FS
commit still counts as an FS commit — same counting rule as the 0221Z run.)

- **GO: conversion rate ≥ 0.50**, AND every C meeting fires a commit
  (commit-fire rate on C = 1.0 — the gates ARE the definition, so a C
  meeting without a commit is investigated as a bug, not scored as a miss),
  AND guards G1–G3 hold (below).
- **DIAG (no verdict) if |A| = 0.** Report the count, the below-break
  meeting count, and the wall numbers; do NOT re-score against a friendlier
  metric. The wall-seeded fallback below is then attempted in this run.
- Small-n honesty: if |A| is 1–2, the rate is 0, 0.5, or 1 by construction;
  the verdict still follows the 0.50 bar, but the evidence names |A|
  prominently and does not dress a 1-meeting rate up as a measured effect.

Denominator leg: |A| is computed on the ARMED leg. `fsEntryVhpFrac` is
recorded only by the new code (null on the baseline leg), and the 60% gate
is a pre-commit property: the lever draws no RNG before the contact strike
and writes no state before it, so every A-field is identical under both
legs up to contact. Verified on the pilot corpus before this prereg: both
below-break meetings agree across legs on contactFinishBeastHp/Dmg,
fsIntent, day, vid, mid (99664 d104: 17/20 engage; 99667 d109: 34/26
engage). The BASELINE leg is used for (a) the guards and wall numbers, and
(b) a per-meeting check that each armed A-meeting's matched baseline meeting
did NOT end `vKill` — the definition's gloss ("old code cannot finish it").
If a matched baseline meeting DID end vKill, it is listed individually in
the evidence (shape + why) as a metric-review finding; the meeting stays in
the denominator per the operational definition — no re-scoring. Meetings
are matched across legs by (seed, day, vid, mid, instId, entryHp); any
armed A-meeting with no baseline match is reported as a pairing failure.

## Seeds — FRESHNESS (mandatory check, per local_seed_band_freshness skill)

- Band: **99421–99436 (16 seeds)**, competent policy verbatim, 150d
  death-aware horizon. One band, one sweep, baseline vs armed on identical
  seeds — no pilot/confirm split this run: the metric, not the sample, was
  what failed last time, and 16 seeds is the confirm size the 0221Z prereg
  already named for this lever.
- Collisions adjudicated first (all per-seed `grep -rl` over the 594 files
  matching `evidence/*/sim-*-prereg.md`):
  - 99677–99692: COLLIDES — 99681–99688 is the sim-killersurvive-b pilot
    band, extension 99681–99696 named in its prereg.
  - 99711–99726: COLLIDES — 99711–99718 vetrest pilot, 99721–99728
    tbretreat-b (both named 2026-11-05 preregs).
  - 99811–99826: COLLIDES — 99811 roleform-a, 99813 congtrace-a,
    99821–99825 gearoff-confirm-b.
  - 99521–99536: COLLIDES — inside the sim-vetrest-screen-b 32-seed screen
    band 99511–99542 (named in its prereg; the 99528/99530/99533 hits in
    that prereg are pantry corpus values, adjudicated not-seeds there, but
    the band itself is taken).
  - 99301–99316, 99911–99926, 99931–99946, 99451–99466: all collide
    (askplus-a / freshkill-a / grindfinish-b / tbretreat-b / bankkiller-b /
    approachconf-b / exphurt-24-a / exphurt-confirm-a / exphurt-land-a /
    drive-practice-a).
  - The 0221Z prereg's own confirm extension 99669–99676 is NAMED there,
    so it is used even with no corpus behind it — not reused.
- Result for 99421–99436: **ZERO hits per seed** across all 594 dated
  preregs; zero `9942` substring hits in any prereg; zero hits in the
  convergence tracker or sim-findings.md. The nearby named band 99401–99412
  (2026-11-04 forbidden list; askplus-a context band 99401–99408) does not
  cover 99421+. Band 99421–99436 is fresh.

## Design (staged, per docs/MEASUREMENT.md §§9–12, 14–15)

- Horizon: 150d death-aware (runDays ends on village death / win; +10d tail
  max). Same as the pilot: the grind band's median survival was ~128d, and
  the lever is about tail meetings.
- Policy: `scripts/policies/competent` verbatim, unmodified. Single policy
  (same §2 deviation recorded in the 0221Z prereg: the lever is gated on
  rare below-break meetings; a second policy would halve the meeting count
  per leg and judge luck, not the lever).
- Legs: BASELINE then ARMED on IDENTICAL seeds 99421–99436. The branch
  already carries the lever, so the baseline leg runs with
  `src/js/fieldFights.js` checked out from master (`git checkout master --
  src/js/fieldFights.js`), and the file is restored from the branch tip
  immediately after (`git checkout HEAD -- src/js/fieldFights.js`,
  verified by `git diff HEAD -- src/js/fieldFights.js` empty + proof test
  89/89) BEFORE the armed leg. The instrument is identical on both legs
  (it reads the engine's `rec.fs*` fields, which are absent on old code
  and read as null — exactly as the pilot did it).
- Instruments (scripts only, reused): `scripts/finishersize-instrument-20261106.js`,
  `scripts/finishersize-driver-20261106.js` (OUTDIR override to the new
  corpus dir), `scripts/finishersize-analyze-20261106.js` EXTENDED in this
  run with the addressable-window classifier (`isAddressable`,
  `isConvertible`, addressable funnel in `--compare` output).
  Corpus: `evidence/2026-11-07/perseed-finishersize-adopt-a/` (one file per
  seed per leg, `fs-s994xx-finishersize-adopt-a-baseline.json` /
  `-armed.json`).
- Proof (before the judged sims): `scripts/test-finishersize-addressable-20261107.js`
  — synthetic-row unit checks of `isAddressable`/`isConvertible` at every
  boundary (post = strike, post = strike+1, post = 3×strike, post =
  3×strike+1; intent learn; vhp 0.59 vs 0.60; contact kill; no contact;
  wave 3), plus a re-derivation of the pilot corpus (addressable 0 on both
  legs, committed kills 0, armed-leg A-fields match baseline on both pilot
  meetings). The 0221Z proof test (89/89) is re-run on the rebased tip as
  Phase A verification and again after the baseline-leg file restore.
- Balanced panel (§15): the primary comparison is the identical-seed FS
  corpus (the grind-proven route for this single-leg question — the panel
  runs its own full panel and takes no corpus input, as grind-a recorded).
  A panel compare is attempted after the sweep if time remains in the run,
  and attached if it completes; if it does not run, that is recorded with
  the reason, not silently dropped.

## Wall-seeded fallback (pre-registered; only if |A| = 0 in the wild band)

The palisade is what brings beasts into the window (grind-a: 24/24
inter-fight gaps are wall deliveries). If the wild band yields 0
addressable meetings, build a wall-seeded fixture corpus in this run:
harvest wall-delivered below-break meetings from the pilot corpus plus the
new band's corpus — a meeting counts as wall-delivered when the same
`instId` was left at higher HP in an earlier fight and re-enters lower with
no villager damage in between — take their (meetHp, strike) shapes, and
re-drive those shapes through the real `fieldFight` engine on both legs via
the proof-test harness (same seeded-stream pattern as
`scripts/test-finishersize-20261106.js` §§A–B), judging the same conversion
rate on the re-driven meetings. If that build proves infeasible inside this
run, report DIAG with the wild count and name the fallback as next-run
work — do not invent a substitute metric.

## Guards

- G1 field-fighter deaths (wave-4+ field `vDie`) armed ≤ baseline + 2 per
  additional field kill; G1b scholar deaths armed ≤ baseline + 2 per
  additional wave-4 kill (any channel).
- G2 wall numbers reported every leg (national / table / wins, wave 4–5
  unlocks + faced + kills, median survival) — any win movement either way
  is investigated, not auto-failed.
- G3 no gate/price/deed/readyDemand change, no rounds-cap or armor-ignoring
  change, Eulogy dismissal untouched. This run makes NO game-code change at
  all; the only code touched is the analyzer extension + the addressable
  test (scripts only). A GO met with a guard breached is NO-GO.

## Metric review (to fill at closeout)

- Pre-registered metrics bind this run. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. If the metric proves wrong, write it
  here and propose the revision for the NEXT run.
- Convergence state to report: converging | converged | parked | killed-at-pilot.
