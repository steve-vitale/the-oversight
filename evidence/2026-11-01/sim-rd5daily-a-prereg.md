# sim-rd5daily-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: Loop A worker, arm sim-rd5daily-a, axis scale-onramp, run
fleshout-loop-a-20261101T0715Z. Sibling loop work NOT touched.
Arm type: DIAG ONLY — zero src/js changes, zero policy-default
flips, zero edits to any existing script or policy file. New files
only: this prereg, one daily recorder/analyzer sweep
(scripts/rd5daily-a-sweep.js, which contains the daily recorder
policy wrapper inline and requires the recheck recorders
UNMODIFIED), one proof test (scripts/test-rd5daily-a.js), the
evidence file, and corpora under
evidence/2026-11-01/rd5daily-a-perseed/ (one per-seed JSON per
seed, each carrying the recheck-compatible row plus the daily
series, plus summary.json). No docs fixes in this arm.

## Question (0615Z closeout blank 2; backlog #1649 refinement)

The 0615Z full-seat recheck (sim-fullseat-recheck-a, seeds
78201–78208, tableseat-nowait substrate, 180d death-aware) found
the closest seed 78201 meets every full-seat bar except w5, and its
END-STATE hold beat names TWO short bars — WEAPONS (4/6 armed) as
well as veterans (0/2) — contradicting the 2115Z "only veterans"
reading. But the recheck recorder stores no daily rd5short series,
so whether weapons-short persists AT CLOSEST APPROACH or is
end-state decay is UNMEASURED. This arm records the daily rd5short
series and answers: is weapons-short on 78201 present at its
closest approach, or only at end state — and the same question
for every seed's own closest approach.

## Code canon (read before sims — not invented)

- src/js/progression.js deedGateReady() (per the recheck prereg,
  verified by reading the code in this worktree): FULL seat (`ok`)
  requires w1>=5, w2>=5, w3>=4, w4>=3, w5>=2 distinct fought
  blow-by-blow; contests>=3; crises>=3; stage>=2; foodDeeds
  (sentimentTaught && feastSurgeUsed); AND scale national/global
  (Steve ruling 2026-10-27, enforced in `ok`). docs/TABLE.md's
  stage>=3 line is STALE (backlog #1328) and is NOT used.
- docs/MONSTER-WAVES.md (combat readiness gates, design call #4
  2026-10-16) + src/js/standing.js waveCombatReadiness(w) /
  waveUnlockReady(w): wave-5 demand (standingCfg().readyDemand[5],
  sim starting points, not canon — Steve can overrule) is armored
  4 at armorP>=15, armed 6, tricks 3, veterans 2 living wave-4+
  killers. The readiness deferral holds villageStandingTotal() at
  t5-1 (199) while any bar is short; the hold beat names the short
  bars ("put weapons in hands (X of 6 armed); blood your fighters
  (Y of 2 veterans)").
- Veterans rule (standing.js isLiving, as implemented by
  vet2-diag, reused unchanged): a killer counts only while living
  at the daily snapshot (scholar always living, others vpOf &&
  !dead). vet5 = living wave-4+ killers; vet4 = living wave-3+
  killers.

## Base pin

- Worktree HEAD at prereg time: e27c48075a7dbfe35e5b18bcee444abcec7ab72f
  (Loop B round 0630Z coordinator evidence). The recheck base
  1c21a87fd is an ancestor of HEAD (verified: git merge-base
  --is-ancestor), and NO commit between the recheck base and HEAD
  touches src/js/ (verified: git log <recheck-base>..HEAD -- src/js/
  returns empty — only instrument/evidence commits landed). The
  game code is therefore IDENTICAL to the recheck run, so
  trajectories on seeds 78201–78208 are expected to reproduce the
  recheck corpus exactly; any divergence is investigated as a
  recorder-neutrality failure (or a hidden src change, re-verified
  via git log at evidence time), never reported as a finding.

## Seed plan (fixed now; INTENTIONAL REUSE, not fresh seeds)

Seeds 78201–78208 REUSED from the sim-fullseat-recheck-a corpus.
This is a daily re-measurement of the EXISTING corpus, NOT a
fresh-seed claim: no new wall numbers are claimed from this arm,
and no band-shopping is possible (the band is fixed by the
recheck). State this explicitly in the evidence file too.

## Policy stack (fullseat-recheck stack VERBATIM, plus one new recorder)

- Substrate: scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
- Recorders reused UNMODIFIED: scripts/policies/fullseat-diag.js
  (FULLSEAT=1) and scripts/policies/vet2-diag.js (VET2=1), required
  directly — no copies, no edits.
- NEW recorder (this arm's only instrument):
  scripts/rd5daily-a-sweep.js defines withRd5DailyDiag, wrapped
  OUTSIDE the recheck stack, gated on RD5DAILY=1. Composition:
  withRd5DailyDiag(withVet2Diag(withFullseatDiag(tableseatNowait))).
  Every daily, AFTER delegating inward, it pure-reads
  snapFullSeat(Game) (the recheck recorder's own snapshot
  function), Game.waveUnlockReady(5) (rd5 counts + demand), and
  livingVetSets(Game) (vet4/vet5 counts) and appends one compact
  row. It writes NOTHING to game state and draws NO RNG. The only
  new game-code paths it calls are ones the recheck recorders
  already call daily (snapFullSeat calls waveUnlockReady(5)
  internally; vet2 calls livingVetSets daily) — so the neutrality
  argument does not rest on a new read.
- Horizon: 180d death-aware (+10d tail max), matching the recheck.
  Dead villages stop simulating; the cap is a ceiling, never a
  fixed-horizon target.
- NO baseline arm is re-run: the recheck corpus itself is the
  unrecorded-run reference. The new stack (recheck stack + daily
  recorder) is compared field-by-field against the recheck armed
  rows; identity is the neutrality proof.

## Daily row (per seed, per scholar-day)

day, distTotal (sum of the 9 snapFullSeat component distances:
w1..w5, contests, crises, stage, foodDeeds), dist per component,
seat, ok, rank, standing, raw, capped, holdKind, unlockedWave,
rd5short (array of short bar names), rd5 counts
(armored/armed/tricks/veterans + demand), vet4n, vet5n,
firstWave4Day / firstWave5Day derived in the analyzer (first day
unlockedWave>=4 / >=5). A day is recorded once per daily call;
the analyzer derives wave-unlock days and closest approach from
the series, never from the sweep's printed verdict.

## Definitions (fixed now)

- CLOSEST APPROACH: the daily row with the smallest distTotal
  over the run; ties broken by EARLIEST day. Note: distTotal is
  the deed-component distance only (scale is enforced in `ok`
  but is not a distance bar, per the recheck prereg); a seed's
  closest-approach day is therefore its closest deed approach,
  and the analyzer also reports the seed's rank on that day so a
  scale gap is visible, not hidden.
- WEAPONS-SHORT: 'weapons' in rd5short on that day (equivalently
  rd5 armed < 6). WEAPONS-MET: rd5 armed >= 6.
- DECAY vs PERSISTENT (per seed, judged at closest approach):
  - end-state weapons-short + weapons-short at closest approach
    = PERSISTENT (the bar was already short when the village was
    closest to full).
  - end-state weapons-short + weapons-MET at closest approach
    = DECAY (weapons were in hand at closest approach and were
    lost by end state — fighter death, disarm, or roster churn).
  - end-state weapons-met = NOT-APPLICABLE (no end-state short
    to explain); the analyzer still reports weapons at closest
    approach and whether weapons were EVER met, for question (c).
- MISSING DAY: the daily day sequence is not consecutive (a
  skipped scholar-day between first and last recorded day), or
  the row count differs from the fullseat-diag D.days count and
  the vet2 store row count for that seed. Zero missing days
  requires all three counts to agree AND consecutive days.

## Questions (answered from the daily series only)

(a) On 78201, is weapons-short present on its closest-approach
    day, or only at end state?
(b) Across all 8 seeds, how often is end-state weapons-short a
    decay artifact vs persistent? (Denominator: seeds with
    end-state weapons-short; decay/persistent counts reported
    separately, plus ever-met counts.)
(c) Does any seed meet weapons at closest approach while still
    missing veterans-2 — i.e. is veterans-2 alone the binding bar
    once weapons timing is accounted for? (Veterans-2 missing =
    vet5n < 2 on the closest-approach day AND at end state.)
(d) What does the daily series say about WHEN each seed is
    closest to full — early peak then decay, or late climb?
    (Reported as closest-approach day vs run length, plus
    whether distTotal ever rose again after closest approach.)

## Sense read (SENSE-TESTING LAW)

Read the existing 78201 sense transcript
(sim-fullseat-recheck-a-sense-78201.txt, endgame days 177–181)
plus the daily-series day(s) around 78201's closest approach as
far as narration reaches: the sense replay's ring retains only
the final days, so if closest approach falls outside the retained
ring, the sense read uses the nearest retained endgame days and
says so explicitly. Judge whether the village's held-seat
behavior reads as people weighing a real priced choice vs a
robotic stall. Quote briefly. Do NOT re-litigate the
seat-hesitation question itself — that is a separate next blank;
this arm answers the weapons-timing question only.

## Primary metric + DIAG-GO threshold (binding)

DIAG-GO iff ALL of:
- Complete daily rd5short series for 8/8 seeds with ZERO missing
  days (per the definition above), each series carrying rd5short
  + rd5 counts + distTotal + vet counts on every day.
- Weapons-short-at-closest-approach determinable for seed 78201
  AND for every seed's own closest-approach day, with a
  decay-vs-persistent verdict for every seed with end-state
  weapons-short.
- Recorder neutrality REPRODUCED: the new stack's rows match the
  recheck armed corpus on ALL 8 seeds on days, gameDays, ts
  counters, starvationDeaths, endSnap dist/binding/seat, diag
  maxDist, vet end/max counts, waveReach, finalRank, maxRank,
  nationalEver, table, entered, won. Any divergence is a
  recorder-neutrality failure to investigate, NOT a finding.
- Reproduction of the recheck end-state snapshots verified:
  national ever, table, wave reach, veterans, survival days
  identical to the recheck armed rows on all 8 seeds (same
  comparison as above; listed separately because the task names
  it as its own check).
- Proof test scripts/test-rd5daily-a.js green: unit checks on
  closest-approach (tie -> earliest), decay/persistent
  classification, and missing-day detection, PLUS corpus legs
  re-deriving every headline number from the judged daily
  corpora (independent of the sweep's printed verdict).
- Verdict sections stated: (a)–(d) above, plus the sense note.

A miss on any item is NO-GO for the DIAG-GO verdict (the daily
tables may still be reported, but the verdict line reads NO-GO
with the failing item named). No re-scoring against a friendlier
metric mid-run; metric doubts go under "metric review" for the
NEXT run.

## Panel (§15)

NOT APPLICABLE — single-base DIAG re-measurement, no before/after
lever comparison exists in this arm; none fabricated. The
new-stack-vs-recheck-corpus comparison is a recorder-neutrality
proof, not a panel comparison, and its numbers never enter a
census table as a lever effect.

## Runner discipline (binding)

Stdout runner + chunked-writer corpus writes throughout (the
recheck precedent — a sweep killed mid-run must not lose
completed configs). Judged corpora are NEVER staged in /tmp.
Scratch dirs live in the worktree and are deleted before commit.

## Metric review (for the NEXT run — mandatory section in evidence)

To be filled at evidence time, including: whether the
deed-only distTotal definition of closest approach hid a scale
story on any seed (rank at closest approach vs at end), and
whether the daily granularity (one row per daily call) was
sufficient to date weapons changes, or whether intra-day fighter
deaths make the daily snapshot the wrong granularity for the
decay question.
