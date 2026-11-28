# sim-scalecensus-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-scalecensus-a · **Lane A playtest loop run:**
playtest-20261128T0043Z · **Leg 3 — scale** (days 80–140:
regional → national, hierarchy, the table approach)
**Type:** DIAG (instruments + evidence only — no game-code fix
lands in this arm; a concrete defect found by the census is
filed in the evidence with a named next fix, not landed here)
**Frozen:** 2026-11-28 ~01:10 UTC, before any judged sim.
**Branch:** `journey-scale` (worktree
`~/workspace/worktrees/journey-scale`).
**Builds on:** `docs/TABLE.md` (seat bars + reachability target),
`evidence/2026-11-27/sim-scale-onramp-round-2215.md` (wall:
national 0/8, wins 0/8, wave 5 5/8 on the partydmg band;
next blanks #1–3 claimed by the fleshout loop's
sim-callfirst-a / sim-fleefloor-a / sim-fourthseat-a trees —
NOT this arm's work), `evidence/2026-11-27/sim-winnability-
round-1830.md` (launchfit band: table 8/8 waiting, none
seated; national 0/8).

## §0. The question, in plain words

The lesser seat is the designed reachable bar for competent
non-god play (TABLE.md: waves faced 4/4/3, 2+ contests, 2+
crises, scale ≥ regional, stage ≥ 2, sentimentTaught, ladder
peak ≥ Village Standing). The full seat is aspirational
(national/global, waves 5/5/4/3/2, 3+ contests, 3+ crises).
Every recent competent band reports the same wall — national
0/8, table waiting but never seated, wins 0/8 — but no band
has ever published the per-bar breakdown day by day: WHICH
bar binds on each seed, WHEN each bar flips true, and whether
any village actually sits. This arm is the scale leg's own
census: play days 80–140 as a competent player and read the
seat bars aloud, per seed, per day.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/TABLE.md`,
`docs/MONSTER-WAVES.md`. **No canon doc covers the per-seed
binding-bar census** — this arm measures it; the numbers below
are this arm's measurement convention, frozen here, not a
canon claim. The seat machinery lives in code and is read,
never re-implemented:
- `deedGateReady()` (progression.js:669) returns the FULL-seat
  DEED breakdown: `{ok, waves, contests, crises, scale, stageOk,
  foodDeeds, stage, w1, w2, w3, w4, w5, contestsN, crisesN,
  rank}`. The per-wave distinct-fought bars are 5/5/4/3/2.
  The full seat ALSO needs ladder peak ≥ 3 AND a delivered
  capstone (`tableSeat()`, table.js:122) — the deed gate is
  the deed half, not the whole seat.
- `tableSeat()` (table.js) returns `{seat, detail}` — 'full' /
  'lesser' / 'none'. Full = deedGateReady().ok AND ladderPeak
  ≥ 3 AND capstone delivered. Lesser = w1 ≥ 4, w2 ≥ 4, w3 ≥ 3,
  contests ≥ 2, crises ≥ 2, scale regional+, stage ≥ 2,
  foodDeeds (sentimentTaught), ladderPeak ≥ 1. The detail
  carries the live w1..w5/contestsN/crisesN/rank/stage/
  ladderPeak/capstone, so the snapshot can read both seats'
  bars off one call.
- `scaleRank()` (hierarchy.js/standing.js via ladder.js),
  `ladderPeakStage()`, `integrationStage()`, `overtimeTier()`
  (overtime.js:54), `progState()` (`arc`, `tableWaiting`,
  `tableAnnounced`, `tableDone`) — all verified present in
  code before this freeze (grep, 2026-11-28 ~01:05 UTC).
- The table is never named before the seat can be taken
  (day 90 floor, `winDayFloorOk`); overtime ticks only while
  the seat is announced and not taken (every 7 unseated days
  = +1 tier, cap 6).

**What already exists (the ground this diagnostic stands on):**

- `scripts/sim-tableline-a-sweep.js` — the harvest pattern
  this driver clones: `loadGame` + `setupGame` + `runDays`,
  a daily `snap()` (day, rank, arc, tableWaiting/Done/
  Announced, stage, pop, pantry), say/emit capture, fireside
  lines parsed (speaker/listener/text), system table lines by
  regex, marker days, per-seed JSON + `--summary`. This arm's
  driver (`scripts/scalecensus-driver-a.js`) keeps that
  structure and EXTENDS the snapshot with the deed-gate
  breakdown, `tableSeat()` (seat + detail: ladder peak,
  capstone), ladder peak, overtime tier, and wave unlocks —
  the snapshot is the instrument; the binding bar is read off
  it by the analyzer, never hand-counted.
- The analyzer (`scripts/analyze-scalecensus-a.js`) computes
  per seed: first-true day per bar (full-seat bars + lesser
  seat), the binding-bar set at end (unmet bars, named),
  rank trajectory (first regional / first national day),
  table timeline (announce / waiting / seated days),
  overtime tier at end, and the wall numbers.
- **Frozen numbers carried in:** launchfit band (111101–
  111108): wins 0/8, national 0/8, table 8/8 waiting, wave-5
  4/8, median survival 150d. Partydmg band (112101–112108):
  national 0/8, wins 0/8, wave 5 5/8, median survival 150d.
  Tableline band (73671–73678, tableseat-nowait substrate):
  waiting seeds observed; NOT comparable (seat legs on).

**Pre-registered expectation:** no seed sits (0/8 seated);
the binding bar will be SCALE (national never reached) on
most seeds, with waves-fought (w4 ≥ 3 / w5 ≥ 2) second —
villages survive to wave 5 but cannot kill wave-4 monsters
(partydmg: 0 vKills in 22 fights), so w4/w5 distinct-fought
counts stall below bar. The falsifier: any seed seated, or
any seed reaching national, or a different bar binding on a
majority of seeds.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to
compare). Population: ALL 8 seeds, competent verbatim, 150d
death-aware. Each per-seed row carries the daily snapshot
series (deed-gate breakdown + seat + ladder peak + overtime
tier) and the end-of-run bar table.

- **Pool floor:** ≥ 6 of 8 seeds alive at day 80 (the scale
  leg's window must be observable). Launchfit band: 6/8
  survive to 150d; the floor is sized to that known
  distribution.
- **Primary metric:** per seed, the binding-bar set at end —
  the full-seat bars unmet at the last snapshot: the six
  deedGateReady bars (waves / contests / crises / scale /
  stageOk / foodDeeds, with w1..w5 counts) PLUS ladderPeak
  ≥ 3 PLUS capstone delivered — plus the lesser-seat state
  (`tableSeat()`) at end, plus first-true day per bar (full
  bars and lesser bars separately). Pooled: seeds seated
  (0 expected), seeds reaching national, seeds reaching
  regional, median first-national day (null if none).
- **Snapshot coverage (binding):** daily snapshots carrying
  a complete deed-gate breakdown / all daily snapshots ≥ 0.95.
  Accessor failures are counted openly per accessor, never
  silently filled.
- **Reconciliation (binding):** the analyzer's per-seed
  end-of-run bar table equals the last snapshot's breakdown
  on every seed (0 mismatches) — the driver appends a closing
  snapshot to the series, so the end table IS the last
  snapshot; and every gate the analyzer reads (last snapshot
  + end) has its stored booleans agreeing with a recomputation
  from its own counts. The residual check is stored-vs-
  recomputed, never a second simulation.
- **GO threshold:** pool floor met AND coverage ≥ 0.95 AND
  reconciliation 0 mismatches AND instrument errors 0.
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when all four bars pass (the question
is answered: the binding bar is named per seed with
first-true days, and the seated/national counts are
quantified). DIAG-NO-GO kind THIN-POOL when the pool floor
misses; DIAG-NO-GO kind ATTRIBUTION when coverage or
reconciliation misses; DIAG-NO-GO kind INSTRUMENT when
errors > 0. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. The binding-bar finding (which
bar binds, on how many seeds) is the FINDING, reported
under the verdict — it does not flip GO to NO-GO either
way, because the diagnostic's job is to measure it, not
to pass it.

**Staging sniff test (pilot gate):** the analyzer must show
the seat machinery is live on this band (tableWaiting fires
on ≥ 1 seed, rank reaches regional on ≥ 1 seed) before the
verdict is read. If the table never waits anywhere, the
verdict is DIAG-NO-GO THIN-POOL with the silent table as
the finding.

## §3. Secondary metrics (supporting, not binding)

- Per-bar first-true day distribution across seeds (which
  bars flip early vs never — full-seat bars and lesser-seat
  bars separately).
- Table timeline: announce day, first waiting day, waiting
  days, seated day (null expected); overtime tier at end.
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares.
- Village assessment (playtest-loop body): census in plain
  words per seed — who lived, who died, what they knew,
  what was missing.
- Sense-testing: 2–3 full transcripts (fireside lines about
  the table/scale + system table lines), read in full — do
  villagers talk about the table and the climb sensibly, or
  does the scale leg go quiet after day 80? SENSE-TESTING
  LAW: judge meaning, not counts.
- Reachable / fun / winnable verdict for the scale leg.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as partydmg /
  speardmg / launchfit bands, for comparability; the scale
  window is 80–140d and the table floor is day 90).
  Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 113101, 113102, 113103,
  113104, 113105, 113106, 113107, 113108.** Freshness check
  (skill local_seed_band_freshness, run 2026-11-28 before
  this freeze): word-boundary ripgrep over all
  `evidence/*/sim-*-prereg.md` files names 113101–113108
  in NO prereg, and names the fallback 113201–113208 in NO
  prereg. The only "1131" hits are run-ID substrings
  (fleshout-20261111T1131Z) — not seed bands. No dedicated
  forbidden/contaminated band list exists in the goal
  hidden_files (checked; November preregs record the same
  "no such list" state). Neighbouring used bands avoided:
  112101–112108 (partydmg), 111801–111808 (speardmg),
  111101–111108 (launchfit).
- **Policies:** competent verbatim. **No substrate flags:**
  the honest scale leg — no seat legs, no damage levers —
  so the census reads what competent play actually builds.
- **Instrument:** `scripts/scalecensus-driver-a.js` (clone
  of the tableline harvest structure — see §1; RUN=
  scalecensus-a, OUTDIR
  `evidence/2026-11-28/perseed-scalecensus-a-arm`).
  Analyzer `scripts/analyze-scalecensus-a.js` (new; reads
  the per-seed JSONs only — it never re-simulates and never
  recomputes the bars). Per-seed JSONs under
  `evidence/2026-11-28/perseed-scalecensus-a-arm/`.
  - The driver records the daily snapshot series unchanged
    in shape; the binding-bar table, first-true days, and
    the wall numbers live in the ANALYZER, not the driver.
- **§15 panel:** NOT APPLICABLE — single-leg diagnostic, no
  before/after pair to compare. The balanced panel compares
  two legs; there is no second leg here. Said here rather
  than fabricating a compare. The frozen bars (§2) are the
  judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot
  earns one; a DIAG arm earns a confirm only if the pool is
  thin but the ledger is decisive — the coordinator decides
  from the pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what villages actually build by day
80+, so the fixture is the competent run itself: a geared
scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-scalecensus-a.js`,
GREEN before the pilot) runs live on a loaded village — a
staged mid-run village (day ~100, regional, wave-4 faced)
records a snapshot series whose deed-gate breakdown matches
the live ledger (w1..w5 counts equal the faced ledger, the
seat reads consistently with the breakdown), the analyzer
names the binding bar on fixtures (all-met, one-missing-
each, scale-only-missing), and a determinism spot check
(same seed twice → byte-identical per-seed JSON) passes.
The pilot's per-seed corpora carry the encounter averages
beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the table waits on competent bands
   (launchfit: table 8/8 waiting; tableline: waiting seeds
   observed) and rank reaches regional on competent bands —
   the phenomenon occurs on the substrate.
2. **Pool sizing:** see §2 pool floor (≥ 6/8 alive at day
   80), sized to the launchfit survival distribution (6/8
   to 150d, median 150d).
3. **Mechanism pre-check (frozen, not a sim):** the proof
   test (`scripts/test-scalecensus-a.js`, GREEN before the
   pilot) proves the measurement chain on live state (see
   §5). The analyzer `--selftest` covers the binding-bar
   table (all-met / one-missing-each / scale-only), the
   first-true-day extraction, and the judge shapes (DIAG-GO,
   THIN-POOL, ATTRIBUTION, INSTRUMENT).
4. **Horizon fit:** 150d contains the scale window (80–
   140d) and the day-90 table floor with room for the
   overtime ticks to show.

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (seat bars:
lesser 4/4/3 + 2 contests + 2 crises + regional+ + stage
≥ 2 + sentimentTaught + ladder peak ≥ Village Standing;
full national/global + 5/5/4/3/2 + 3 + 3; reachability
target: competent non-god play reaches the LESSER seat),
`docs/MONSTER-WAVES.md` (wave bars) read before the run.
**No canon doc covers the per-seed binding-bar census** —
this arm measures it; the numbers in §1 are this arm's
measurement convention, frozen here, not a canon claim.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On DIAG-GO the binding bar is named per seed with
  first-true days, the seated/national counts are quantified,
  and the next arm is named from that proof (a lever on the
  binding bar, or a deeper diagnostic of it — decided by the
  numbers, not by preference). On DIAG-NO-GO the question
  stays open with the failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD`
  before every material write; if it fails, stop writing and
  wait for the clear.
