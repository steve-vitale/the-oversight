# sim-scalegate-a — the full seat now requires national standing (GO)

Run: fleshout-20261027T1315Z. Axis: scale-onramp. Worktree:
~/workspace/worktrees/sim-scalegate-a (branch sim-scalegate-a).
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-scalegate-a-prereg.md (commit 3859598).
Verdict: **GO** — unit proof green, sim band identical before/after.

## Plain words

Steve ruled on 2026-10-27 that the full seat at the galactic table
needs national standing. The game already measured standing but did
not actually use it to decide the full seat — so a small village that
had fought every wave could sit in the full seat while a bigger,
regional village could only get the lesser seat. This arm closes
that gap with one small change: the full-seat decision now includes
standing. Nothing else about the seats changed. In sims, no village
lost a lesser seat or a win because of it — the change touches only
the full seat, and no sim village reached a full seat on either side
(the fifth wave still blocks it everywhere).

## Canon read

docs/CANON.md, then docs/TABLE.md. Contract used: the full seat
keeps the national bar (national/global scale, wave bars 5/5/4/3/2,
3+ contests, 3+ crises, stage >= 3, food-thesis deeds); the lesser
seat requires regional+. Code as found: deedGateReady() computed
`scale` (rank national/global) and reported it honestly in the
breakdown, but `ok` excluded it ("Scale is NOT added here (open
design question)"). No canon invented.

## The change (game code, minimal)

- src/js/progression.js deedGateReady(): `ok` is now
  `waves && contests && crises && stageOk && foodDeeds && scale`.
  That is the whole game change. No lesser seat, wave bar, contest,
  crisis, stage bar, or food deed changed.
- Comment updates, minimal, both stating the 2026-10-27 ruling:
  progression.js deedGateReady comment + table.js tableSeat comment
  (both previously said scale was not enforced / an open asymmetry).
- Test-fixture update REQUIRED by the design change (repo green-list
  rule: a test broken by an intentional design change is updated in
  the same commit and named here): scripts/test-fullseat-superset-
  20261014.js asserted "stage 2 + food deeds + bars -> full" with its
  fixture at village rank. Its fixture now sets nationalLive before
  that assertion, with a comment pointing at this ruling. The scale
  term itself is proven by the new test below, not by this fixture.

## Consumer audit (done BEFORE the change — no breaker found)

- tableSeat() (table.js): full first; if ok flips false it falls
  through to the lesser evaluation. A regional village meeting every
  full bar downgrades to lesser, not out of the table; a village-
  ranked one falls to none — which is the ruling itself. Existing
  code path, no crash path.
- checkArc() (progression.js): Arc IV fires on 'full' OR 'lesser',
  so a downgraded village still reaches Arc IV via lesser.
- ledger.js tableScene re-check (table.js tableScene, dawn): seat
  'none' withdraws a stale tableWaiting ALOUD via
  tableWithdrawLine(), never silently. For a scale-only loss the
  detail is the lesser detail (all its bars pass except rank), so
  the voiced reason is exactly "standing too low (village)" —
  honest, not mis-blamed on deeds.
- tableEarnedPaths(): floors paths by minSeat (indispensable = FULL
  only). A downgraded village loses only the indispensable door.
- tablePreview()/tableTakeSeat(): null / not-ready when the seat is
  none; no seat is offered that tableScene would refuse.
- Diag instruments (scripts/policies/fullseat-diag.js,
  indispensable-diag.js): read-only reporters snapshotting the
  breakdown + seat. After the change they report ok=false for
  sub-national full-bar villages — the new truth, not a break.
  Their component-distance logic reads breakdown fields this change
  does not touch. The fullseat-diag TEST's mock fixture computes
  its own old-ok without scale; it is a mock of the old gate, not
  a production consumer, and is left untouched (flagged so a later
  reader does not mistake it for a regression).
- No other src/js consumer of deedGateReady() exists (grep: only
  the progression.js definition, table.js tableSeat, ledger.js
  comment).

## Unit proof (load-bearing)

scripts/test-scalegate-a.js — real loaded Game (seed 7), every
full-seat bar set on real state (wavesFaced 5/5/4/3/2 distinct,
contests 3, crises 3, stage 2, sentimentTaught + feastSurgeUsed),
rank driven through the real scaleRank() flags
(networkLive/nationalLive/globalLive). No gate function stubbed.

Result: **22 passed, 0 failed.**
- village: ok false, breakdown scale false, seat none.
- regional: ok false, breakdown scale false, seat lesser (the
  downgrade, not a loss).
- national: ok true, breakdown scale true, seat full; seat line
  names a full seat.
- global: ok true, breakdown scale true, seat full.
- In the village/regional cases the bars-only recomputation
  (waves && contests && crises && stageOk && foodDeeds, from the
  breakdown's own fields) stays TRUE — so the flip is exactly the
  scale term, and the old code's ok would have been true there.
- Breakdown still reports scale honestly in every case.

scripts/test-fullseat-superset-20261014.js after its fixture
update: **9 passed, 0 failed** (it was 7 passed / 1 failed before
the fixture update, failing only on the intended assertion).

## Sim band (MEASUREMENT.md §§9-12)

- Substrate: tableseat-nowait policy (TABLESEATNOWAIT=1 +
  LEANLINKRESCUE=1), the substrate that actually reaches the table.
- Seeds: fresh 74101–74108 (verified before the prereg: no 7410x
  hits in evidence/2026-10-27 filenames or contents, no 7410x
  per-seed corpus filenames; 74001–74008 used by sim-waitlong-a
  today and 73701–73708 by sweep-deathrow-b, both rejected).
- Horizon: 180 loop-days, death-aware. BEFORE leg ran on the
  unmodified tree; AFTER leg on the changed tree; identical seeds,
  policy, and sweep script (scripts/sweep-scalegate-a.js).
- Corpus: evidence/2026-10-27/perseed-scalegate-a/ (16 rows).

Per-seed BEFORE -> AFTER (days / won / best seat / entered /
national ever / wave / arc): every seed identical on every field.
Formal check: **0 differing fields across all 16 rows** (excluding
leg label and corpus filename).

| seed | days | won | best seat | entered | nat ever | wave | arc |
|------|------|-----|-----------|---------|----------|------|-----|
| 74101 | 121 | 0 | none | 0 | 1 | 4 | 3 |
| 74102 | 180 | 0 | none | 0 | 1 | 4 | 3 |
| 74103 | 138 | 0 | lesser | 0 | 0 | 4 | 4 |
| 74104 | 96 | 1 | lesser | 1 | 1 | 3 | 4 |
| 74105 | 180 | 0 | none | 0 | 1 | 4 | 3 |
| 74106 | 91 | 1 | lesser | 1 | 1 | 3 | 4 |
| 74107 | 107 | 1 | lesser | 1 | 1 | 4 | 4 |
| 74108 | 68 | 0 | none | 0 | 0 | 2 | 3 |

Aggregates, BEFORE = AFTER on every field: won 3/8, lesser seats
4/8, full seats 0/8, entered 3/8, table ever 4/8, national ever
6/8, national final 5/8, wave-4 reach 5/8, wave-5 reach 0/8,
max arc 4, median days 121, max days 180, starvation deaths 3,
seat taken 3, seat attempts 3.

Judged against the prereg GO shape:
- Unit proof green: YES (22/22).
- Lesser-seat entries unchanged: YES (4/8 both sides, same seeds).
- Wins unchanged: YES (3/8 both sides, same seeds).
- Lesser/wins regression on any seed: NONE.
- Full seat disappearing: NONE to report — full was 0/8 on both
  sides (wave 5 blocks it everywhere; final gate breakdowns on
  the lesser seeds show w5 = 0, and 74103's final rank is regional
  with scale false). The ruling's bite is proven by the unit proof,
  not by this band — the band proves the ruling costs nothing
  reachable today.
- **GO.**

## Village assessment (what the village looked like)

Eight villages on the table-seeking substrate: six touched national
standing at some point, four reached a table at all, three sat and
won through the lesser seat, one (74103) reached a lesser seat but
died at day 138 before ever sitting. The winners won as feared
protectors through the lesser door, not through any full seat.
Nobody in this band was near the full seat on deeds: the binding
blocker everywhere is wave 5 (zero wave-5 deeds in every final
breakdown), not standing — three of the four lesser seeds ended at
global rank with scale true and still missed full on waves. The
scale gate, now enforced, is not the thing holding these villages
back; the wave-5 road is. That is the next blank, not this arm's.

## Sense test (SENSE-TESTING LAW — read, not counted)

Non-measured narration replay (scripts/sense-scalegate-a.js, seed
74104, say-capture only, never enters the census): replay matches
the band trajectory (96 days, won, lesser seat), so the quoted
lines are the band's own words in substance.

Quoted audit line, verbatim:
> "◈ THE AUDIT — the System reads your run back to you, and the
> galaxy listens. A lesser seat — global standing, waves 1–3 faced
> (14/9/4), 10 contests survived, 2 crises weathered. The table does
> not rise. It prices."

Plain-words judgement: the seat language reads honestly. A global-
standing village with lesser deeds is told it holds a LESSER seat,
not a full one, and the line says plainly what that means ("does
not rise. It prices."). No village is told it holds a full seat it
no longer holds. No stale-seat withdrawal fired in the replay; the
one "does not come" line is the pre-seat waiting beat naming the
real missing deed at the time ("The ledger still wants: wave-3
monsters faced"), not a silent withdrawal. The replay ends with
the village winning through the lesser door ("You won. Say it
plainly: you won."), which reads as a complete ending, not a
consolation prize pasted over a failure.

## Metric review

- The prereg's GO shape held: no mid-run re-score happened. The
  one judgement call worth recording: the band cannot show the
  ruling's bite (full 0/8 both sides), so GO rests on the unit
  proof for the bite + the band for no-regression. That split was
  pre-registered, not improvised.
- Proposed revision for the NEXT run (not this one): a band that
  can show the bite needs a village that actually reaches full
  deeds — i.e. a wave-5-capable substrate. Until one exists, any
  full-seat gate change will show exactly this shape (proof green,
  band identical), and that shape should keep being reported as
  GO-with-proof rather than mistaken for "no effect".
- Balanced panel (§15): not run as a separate artifact — the
  before/after per-seed comparison above IS the panel's content
  (0 differing fields), so a panel compare would be degenerate
  identical. Stated, not claimed as run.

## Findings (not chased mid-run; for the backlog)

- [open] 2026-10-27 — full-seat stage bar — TABLE.md says the full
  seat needs stage >= 3, but the code enforces stage >= 2 (both
  before and after this arm). Noted only, per the task: a separate
  question, never bundled with the scale ruling. (sim-scalegate-a)
- [open] 2026-10-27 — fullseat-diag test mock — the mock fixture
  in scripts/test-fullseat-diag-20261021.js still computes old-ok
  without scale. It is a mock, not production, but it will mislead
  the next reader who treats it as the gate's contract; it should
  be updated or annotated when that instrument is next touched.
  (sim-scalegate-a)
- [open] 2026-10-27 — wave-5 road — full-seat deeds remain
  unreachable in sims (w5 = 0 in every final breakdown here, as in
  every recent band). The scale gate is now honest; the wave-5
  road is the binding blocker for the full seat. (sim-scalegate-a)

## Limitations (stated plainly)

- `node scripts/check.js --quick` was started after the change
  and ran past 6 minutes without finishing; it was stopped
  (SIGTERM) rather than awaited, so no full-quick-check result is
  claimed. Targeted proofs that DID run green: test-scalegate-a
  (22/22), test-fullseat-superset-20261014 (9/9), node --check on
  both changed src files, and both sim legs exit 0 with G3 corpus
  integrity (8/8 rows, no zero-day rows).
- The first safe-commit in this run hit the known index-clobber
  class (commit correct, main index showing the files as deleted);
  repaired with the recorded recipe (update-index --cacheinfo from
  HEAD blobs) and verified with empty status + matching hashes
  before any further work. The final commit below was re-checked
  the same way.
- No push, no version bump, no live verification — merging to
  local master is the coordinator's job. This worktree reports
  ready-to-merge, pending coordinator.

## Files

- Prereg: evidence/2026-10-27/sim-scalegate-a-prereg.md
- Evidence (this file): evidence/2026-10-27/sim-scalegate-a.md
- Corpus: evidence/2026-10-27/perseed-scalegate-a/ (16 rows)
- Sweep: scripts/sweep-scalegate-a.js
- Unit proof: scripts/test-scalegate-a.js
- Sense replay: scripts/sense-scalegate-a.js
- Changed: src/js/progression.js, src/js/table.js,
  scripts/test-fullseat-superset-20261014.js (fixture only)
