# sim-rd5daily-a — daily rd5short series: is weapons-short persistent at closest approach, or end-state decay? (DIAG ONLY)

Run: Loop A replacement worker, arm sim-rd5daily-a, axis
scale-onramp, run fleshout-loop-a-20261101T0715Z. Sibling loop work
NOT touched. No sibling claims, lock, or tracker files touched.
Worktree branch: sim-rd5daily-a.
Pre-registration: evidence/2026-11-01/sim-rd5daily-a-prereg.md
(COMMITTED 650e1d5a8 before any judged sims; NOT rewritten by this
worker). Judged exactly against that bar; no re-scoring.
Instrument: scripts/rd5daily-a-sweep.js (daily recorder/analyzer;
the previous worker's in-progress driver, completed without rewrite
— it needed no changes) + proof scripts/test-rd5daily-a.js.
Recorders reused UNMODIFIED: scripts/policies/fullseat-diag.js,
scripts/policies/vet2-diag.js, substrate
scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FULLSEAT=1, VET2=1, RD5DAILY=1). Composition:
withRd5DailyDiag(withVet2Diag(withFullseatDiag(tableseatNowait))).
Corpus: evidence/2026-11-01/rd5daily-a-perseed/s<seed>.json +
s<seed>-daily.json (8 seeds) + summary.json.
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG re-measurement, no
before/after lever comparison exists in this arm; none fabricated.
The new-stack-vs-recheck-corpus comparison is a recorder-neutrality
proof, not a panel comparison, and its numbers never enter a census
table as a lever effect.

## Resume note (replacement worker)

The previous worker for this arm failed on a runtime transport
error, not on its work. On resume this worker found: prereg commit
650e1d5a8 on top of master e27c48075 (verified via git log);
exactly one uncommitted file, scripts/rd5daily-a-sweep.js (the
in-progress sweep driver, complete and syntactically sound); no
partial corpus (rd5daily-a-perseed did not exist yet). The driver
was kept as written and run to completion. Two infrastructure
events during this worker's run, neither affecting the numbers:
(1) the first full sweep wrote seeds 78201–78207, then died on an
intermittent container EPERM write flap while writing s78208.json
(8 writer retries + 30 direct-write retries exhausted over
~15 min; known flap class, 2026-10-24 lesson); after the flap
cleared (probe write OK), seed 78208 was recovered with a
SEEDS=78208 re-run of the same driver — deterministic, and its row
matches the recheck armed row exactly (neutrality diffs empty), so
the recovery leg is not a second measurement. (2) An earlier
backgrounded SEEDS=78208 attempt exited instantly with an empty
log (transport artifact); the foreground re-run completed in ~40s
and wrote both 78208 files plus summary.json.

## INTENTIONAL REUSE — not a fresh-seed claim

Seeds 78201–78208 are REUSED from the sim-fullseat-recheck-a
corpus. This is a daily re-measurement of the EXISTING corpus, NOT
a fresh-seed claim: no new wall numbers are claimed from this arm,
and no band-shopping is possible (the band is fixed by the
recheck). The wall numbers below are the recheck's numbers,
reproduced exactly by the new stack — reported as a reproduction
check, not as new findings.

## Verdict: DIAG-NO-GO (gate-literal; see below — the answers stand)

Judged exactly against the prereg's bar:
- Complete daily series with ZERO missing days (prereg definition:
  label-consecutive days AND row counts agreeing): FAILS
  literally. All 8 seeds carry label gaps (see "The label-skip
  diagnosis" below). The daily tables are still reported and
  questions (a)–(d) are still answered, but the verdict line reads
  NO-GO with the failing item named, per the prereg.
- Weapons-short-at-closest-approach determinable for 78201 AND
  every seed's own closest day, with a decay-vs-persistent verdict
  for every end-short seed: PASSED (8/8 determinable, 0
  indeterminate).
- Recorder neutrality REPRODUCED: PASSED (8/8 seeds, zero diffs on
  days, gameDays, ts counters, starvationDeaths, endSnap
  dist/binding/seat, diag maxDist, vet end/max counts, waveReach,
  finalRank, maxRank, nationalEver, table, entered, won).
- End-state snapshot reproduction (national ever, table, wave
  reach, veterans, survival days): PASSED (identical on all 8
  seeds; table below).
- Proof test scripts/test-rd5daily-a.js: GREEN, 297/297 checks
  (analyzer unit checks + corpus legs re-deriving every headline
  number from the judged corpora, independent of the sweep's
  printed verdict).
- Verdict sections (a)–(d) plus sense note: STATED below.

Plain reading of the NO-GO: the gate's label-consecutiveness
clause is incompatible with the prereg's own recorder spec (read
AFTER delegating inward) given substrate behavior — the substrate's
daily hook settles the game clock past some scholar-day values, so
no daily call ever observes them. By count, the series are
complete on all 8 seeds (daily rows == fullseat-diag days == vet2
rows, rd5 errs 0, one row per daily call). The NO-GO is a
gate-literalism finding, not a data failure: nothing below rests
on a missed day. The metric-review section proposes the revision
for the NEXT run; this run does not re-score itself.

## Answer in one paragraph

On the closest seed 78201, weapons-short is NOT end-state decay:
the village was already holding only 4 of 6 weapons on its closest
day (day 165, the first lesser-seat day), and stayed at 4 through
the cap. Across the band, end-state weapons-short is usually
persistent, not decay — 3 of the 4 end-short seeds were already
short at their closest approach, and only 78208 is a true decay
(met at closest, short at end). Once weapons timing is accounted
for, veterans-2 is still the binding bar: 5 seeds meet weapons at
their closest approach while holding zero living wave-4+ killers,
and on 3 of those 5 veterans is literally the only short readiness
bar. Every seed's closest approach is a late plateau, never an
early peak — the village climbs toward full all run long and
stops at the wave-5 door, which never opens because the second
living veteran never arrives.

## Questions (a)–(d)

(a) On 78201, is weapons-short present on its closest-approach
    day, or only at end state? PRESENT AT CLOSEST APPROACH.
    Closest day 165 (earliest of 16 tied min-dist days 165–180,
    all dist 2, all armed 4): rd5short [weapons, veterans], armed
    4/6, vet5 0/2. End state identical. Verdict PERSISTENT by the
    prereg definition. The fuller timeline sharpens it: the
    village held 6+ weapons for most of the run (153 met-days,
    first met day 2, last met day 153 — armed 7 on day 150, 6 on
    day 153), then slipped to 5 on day 154 and to 4 on day 165,
    the closest day itself. The weapons loss precedes closest
    approach; it is not something that happened to an already-
    closest village on its way to end state.

(b) Across all 8 seeds, how often is end-state weapons-short a
    decay artifact vs persistent? Denominator 4 seeds with
    end-state weapons-short (78201, 78202, 78205, 78208):
    PERSISTENT 3 (78201, 78202, 78205), DECAY 1 (78208),
    INDETERMINATE 0. Decay is the exception (1/4). Second layer
    the prereg definition does not capture: all 4 end-short seeds
    had met weapons earlier in their runs (last met days 153,
    120, 85, 148 respectively) — every end-short seed lost
    weapons at some point; on 78201/78202/78205 the loss came
    before closest approach, on 78208 after it. 78208's decay is
    not monotone: armed 6 at closest (day 128), dip to 5
    (days 129–132), recovery to 6–7 (days 133–148), final loss
    from day 149 (5, then 4s, ending at 2).

(c) Does any seed meet weapons at closest approach while still
    missing veterans-2? YES — 5 seeds: 78203 (armed 10), 78204
    (8), 78206 (9), 78207 (8), 78208 (6). On ALL 5, living wave-4+
    killers at closest approach = 0 (not just below 2 — zero),
    and veterans-2 is missing at end on all 8 seeds. On 3 of the
    5 (78203, 78204, 78206), veterans is the SOLE short readiness
    bar at closest approach (rd5short [veterans]); on 78207 and
    78208 armor is also short ([armor, veterans]). So once
    weapons timing is accounted for, veterans-2 alone blocks the
    wave-5 door on 78203/78204/78206, and shares the block with
    armor on 78207/78208. No seed is rescued by weapons timing:
    no seed pairs weapons-short-at-closest with veterans-2 met —
    veterans-2 is unmet at closest approach on 8/8 seeds, and the
    w5 deed gap (distance 2) persists on 8/8 because wave 5 never
    unlocks (firstWave5Day null everywhere).

(d) WHEN is each seed closest to full — early peak then decay, or
    late climb? LATE CLIMB on all 8, without exception. Closest
    approach is a terminal plateau in every case: deed distance
    falls through the run (e.g. 78201: 25 → 16 → 11 → 8 → 2) and
    never rises after closest approach (roseAfter=false on 8/8).
    First-min-dist day / run length: 78201 165/180, 78202 130/131,
    78203 161/168, 78204 172/180, 78205 90/98, 78206 86/90,
    78207 23/26, 78208 128/163 — plus plateaus to end (78208's
    plateau runs 36 days, 128–163). Note the structural caveat
    (metric review): deed distance is cumulative by construction,
    so it cannot rise — "early peak then decay" was impossible
    for deed distance. The real decay stories live in the
    living-state bars (weapons, armor, rank), not in deed distance:
    rank decayed from its max by closest approach on 78201
    (national → regional) and 78203 (global → regional), and
    weapons were lost before closest approach on 3 seeds.

## Per-seed daily table (closest approach = smallest distTotal, ties -> earliest day)

dist = sum of the 9 deed-component distances (w1..w5, contests,
crises, stage, foodDeeds). "armed" is rd5 armed count (demand 6);
vet5 is living wave-4+ killers (demand 2). End = last daily row.

| seed | run (end) | closest day (plateau) | dist (components) | seat/rank at closest | rd5short at closest | armed / vet5 at closest | end rd5short / armed | verdict | firstW4 / W5 | weapons met days (first–last) |
|------|-----------|----------------------|-------------------|----------------------|---------------------|-------------------------|----------------------|---------|-------------|-------------------------------|
| 78201 | 180d survived | 165 (165–180) | 2 (w5 2) | lesser / regional | [weapons, veterans] | 4 / 0 | [weapons, veterans] / 4 | PERSISTENT | 109 / — | 153 days (2–153) |
| 78202 | 131d village-lost | 130 | 3 (w5 2, foodDeeds 1) | none / regional | [armor, weapons, veterans] | 3 / 0 | [armor, weapons, veterans] / 3 | PERSISTENT | 106 / — | 114 days (2–120) |
| 78203 | 168d village-lost | 161 (161–168) | 4 (w3 2, w5 2) | none / regional | [veterans] | 10 / 0 | [veterans] / 10 | NOT-APPLICABLE | 135 / — | 168 days (2–168) |
| 78204 | 180d survived | 172 (172–180) | 6 (w3 2, w4 1, w5 2, foodDeeds 1) | none / regional | [veterans] | 8 / 0 | [veterans] / 7 | NOT-APPLICABLE | 128 / — | 180 days (2–180) |
| 78205 | 99d village-lost | 90 (90–98) | 5 (w3 1, w4 1, w5 2, foodDeeds 1) | none / regional | [armor, weapons, veterans] | 2 / 0 | [armor, weapons, veterans] / 1 | PERSISTENT | 58 / — | 85 days (2–85) |
| 78206 | 90d over-other, WON lesser | 86 (86–90) | 5 (w4 3, w5 2) | lesser / national | [veterans] | 9 / 0 | [veterans] / 9 | NOT-APPLICABLE | 82 / — | 90 days (2–90) |
| 78207 | 26d village-lost | 23 (23–26) | 17 (w2 5, w3 4, w4 3, w5 2, contests 2, foodDeeds 1) | none / village | [armor, veterans] | 8 / 0 | [armor, veterans] / 7 | NOT-APPLICABLE | — / — | 26 days (2–26) |
| 78208 | 164d village-lost | 128 (128–163) | 3 (w3 1, w5 2) | lesser / regional | [armor, veterans] | 6 / 0 | [armor, weapons, veterans] / 2 | DECAY | 70 / — | 144 days (2–148) |

Additional per-seed facts: vet5 at closest = 0 on 8/8; vet5 at
end = 0 on 8/8; max living vet5 over any run = 1 (78201, 78208),
never at closest approach or end. Last daily row agrees with the
end snapshot on weapons-short on 8/8. Closest-approach day equals
the first lesser-seat day on both lesser-seat seeds (78201 day 165,
78208 day 128). Wave 4 reached 7/8 (all but 78207); wave 5 reached
0/8, fought 0/8, killed 0/8.

## Wall numbers (reproduced, NOT new — intentional reuse)

Won 1/8 (78206, lesser seat, day 90). National ever 5/8 (78201,
78203, 78204, 78205, 78206); national final 1/8 (78206). Table
reached 3/8 (78201, 78206, 78208); entered 1/8 (78206, lesser);
enteredFull 0/8. Wave 4 reached 7/8; wave 5 reached 0/8; full seat
0/8. Median run length 164d, max 180d (78201, 78204 survived to
cap). These match the recheck armed rows field-for-field on all 8
seeds (days, gameDays, waveReach, finalRank, maxRank,
nationalEver, table, entered, won, starvationDeaths, vet end
counts) — see the neutrality proof below.

## The label-skip diagnosis (why seriesOk=false on 8/8)

Every seed's daily label sequence starts 2,2,4,4,5,6,... and
78202 adds one mid-run pair (46 → 48, 48 → 48). Row counts agree
everywhere (e.g. 78201: 180 daily rows = 180 fullseat-diag days =
180 vet2 rows; rd5 errs 0 on all seeds), so no daily call was ever
missed — the labels skip, the calls do not. Isolation diagnostics
(stdout-only, no corpus writes) proved the cause:
- Plain substrate, day read BEFORE delegating inward: labels
  1,2,3,...,12 consecutive.
- Full stack (and substrate-only, and each recorder alone), day
  read BEFORE vs AFTER the daily delegation: the delegation itself
  advances scholar.day on loop-days 1 and 3 (before 1 → after 2;
  before 3 → after 4). The substrate's daily hook settles the game
  clock past the boundary on those days.
- The 78202 day-48 duplicate rows are byte-identical in content
  (t=11, armed=7, same short list) — a duplicated label, not two
  distinct states.
So the recorder, which reads AFTER delegating inward exactly as
the prereg specifies, labels rows with the post-settlement scholar
day — and the prereg's consecutiveness clause assumes labels that
this spec cannot produce. The 78202 mid-run skip (day 47) is the
same mechanism firing mid-run. None of this touches questions
(a)–(d): closest approach, verdicts, and weapons timelines are
derived from row order and row contents, and no closest-approach
row falls on a duplicated-label day.

## Sense read (SENSE-TESTING LAW — meaning, not counts)

Read: the existing 78201 sense transcript
(sim-fullseat-recheck-a-sense-78201.txt, endgame days 177–181).
Closest-approach day 165 falls OUTSIDE the retained ring, so per
the prereg the sense read uses the nearest retained endgame days
and says so explicitly — this note is about days 177–181, not a
transcript of day 165. No new sense replay was run for this arm
(the prereg's sense leg is the existing transcript plus the
nearest retained days; a fresh narration replay would shift
trajectories and is non-measured by design).
What the endgame days read as: a village enduring a priced wait,
not a robotic stall. The wall is spoken plainly and honestly —
day 179: "The fifth draft stays in the wings — put weapons in
hands (4 of 6 armed); blood your fighters (0 of 2 veterans)."
The overtime price is real and legible — day 180: "wave 4–5
monsters return as RERUNS (+50% HP, +24% damage, +1 to every
pack). Raids come sooner. The table docks your standing −8. Take
your seat from Haven to stop the clock." Between the priced beats
the village keeps doing the work of living: foraging hauls,
water runs, raids endured ("They carried off ~800 kcal...
Nobody's dead, but the message is clear"). That is people weighing
a costly wait, not a frozen routine. This arm does NOT re-litigate
the seat-hesitation question itself (why the seat-taking leg does
not fire on a surviving lesser-seat village) — that is the
separate next blank already flagged by the recheck; this arm
answers the weapons-timing question only.

## Metric review (for the NEXT run — mandatory)

1. The deed-only distTotal definition of closest approach HID a
   scale story on 2 seeds: at its closest deed day, 78201's rank
   is regional (decayed from national max) and 78208's is
   regional (max regional — never national), so even a w5-met
   village would not hold a full seat without national standing
   restored. Only 78206 (the winner) is national at closest
   approach. Proposal: the next daily-series arm should report
   rank + standing at closest approach alongside distTotal (this
   evidence does), and should consider a "closest full-seat
   state" that includes the scale condition rather than deed
   distance alone.
2. The label-consecutiveness gate is incompatible with the
   after-delegation recorder spec (see diagnosis above).
   Proposal: define completeness as one row per daily call +
   row-count agreement with fullseat-diag days and vet2 rows +
   zero recorder errs, and record BOTH the loop-day ordinal and
   the scholar-day label per row (or read the label before
   delegating inward, which the diagnostics show is
   consecutive). Do not silently de-duplicate label-duplicate
   rows: they are distinct loop-day snapshots sharing a label.
3. Daily granularity was SUFFICIENT for the weapons-timing
   question as defined (both endpoints are daily snapshots, and
   the daily series caught the slips: 78201's 153→154 drop,
   78208's 129–132 dip and 133–148 recovery). Caveat for a
   finer-grained follow-up: intra-day fighter deaths or disarms
   could move the armed count within a day, so a daily snapshot
   cannot date a weapons change more precisely than "between
   these two daily calls" — that precision limit does not affect
   any verdict here, since no closest-approach row sits on a
   disputed boundary.
4. Question (d)'s "early peak then decay" framing is trivially
   answered for deed distance (cumulative bars cannot decay), so
   a future arm asking about decay should ask it about
   living-state bars (weapons, armor, veterans, rank) explicitly
   rather than about distTotal.

## Observations for the coordinator (out of scope for this DIAG arm)

- The 0615Z closeout's next blank (2) is now closed: weapons-short
  at closest approach is measured, and it is persistent on the
  closest seed, not end-state decay. The remaining wave-5 story is
  unchanged: veterans-2 is the binding bar (0 living wave-4+
  killers at closest approach on 8/8 seeds, 0 at end on 8/8).
- The next blank this arm exposes is a gate/instrument one, not a
  game one: the daily-series gate needs the metric-review revision
  above before another daily arm is judged against it. No game
  change is proposed or implied by this arm.
- 78208's 36-day closest plateau (days 128–163 at dist 3) with a
  flickering weapons count is the clearest single-seed illustration
  of the decay-vs-persistent distinction; a future sense read
  around 78208's day 128–149 window would show the flicker in
  narrative terms, if the coordinator wants it.

## Commit-block note (replacement worker, 2026-11-01 — infrastructure, not science)

All sims, analysis, proof (297/297), and this evidence file were
complete and verified, but the safe-commit.sh commit itself was
BLOCKED by an intermittent container write flap with a specific
signature: plain truncate-style writes succeed, while O_CREAT|O_EXCL
lock-style writes fail with EPERM (proven: node writeFileSync to
/tmp passes; python O_CREAT|O_EXCL lock write fails; git index
lock writes fail — including safe-commit.sh's /tmp private index
and the worktree-heartbeat registry write). Three safe-commit
attempts failed identically ("fatal: sha1 file
'/tmp/idx-safecommit-*.lock' write error: Operation not
permitted"); no partial commit state was left (git status shows
only the 4 intended untracked entries). The worktree-heartbeat
also failed on the same flap, so the registry heartbeat is stale
for flap reasons, NOT because the tree is dead — do not reap this
tree. RECOVERY (coordinator): after the flap clears, from this
worktree, re-run the safe-commit.sh command with the 20 files
listed in the worker's final report (message first, then files),
then verify `git status --short` empty + `git diff HEAD` empty,
and heartbeat the tree. No re-run of any sim is needed: every
corpus file is intact and the proof test re-verifies them.
