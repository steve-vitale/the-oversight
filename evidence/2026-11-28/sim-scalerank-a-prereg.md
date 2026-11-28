# sim-scalerank-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-scalerank-a · **Loop A run:**
fleshout-20261128T0315Z · **Axis:** scale-onramp (the scale wall)
**Type:** DIAG (instruments + evidence only — no game-code fix
lands in this arm; a concrete defect found by the diagnostic is
filed in the evidence with a named next fix, not landed here)
**Frozen:** 2026-11-28 ~03:20 UTC, before any judged sim.
**Branch:** `sim-scalerank-a` (worktree
`~/workspace/worktrees/sim-scalerank-a`).
**Builds on:** `evidence/2026-11-28/sim-scalecensus-a.md`
(band 113101–113108: lesser seat 8/8 days 44–67, national 0/8,
full seat blocked 8/8 on the SCALE bar) and its prereg
`evidence/2026-11-28/sim-scalecensus-a-prereg.md`.
**Next arm:** scalecensus §7 arm #1 — the scale-rank inputs
diagnostic.

## §0. The question, in plain words

The census showed the SYMPTOM: every village reaches the
lesser seat and then waits, and the full seat is blocked on
every seed by the scale bar — national is never reached. This
arm asks for the MECHANISM: what does `scaleRank()` actually
need for national, and which input stalls on a fresh band?
Is it that no polity ever qualifies, that the rung gate
never opens, that the court beat stages but nobody answers
it, or that national is won and then lost again? Record
links / standing / hierarchyState daily and name the binding
input per seed, with numbers.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/TABLE.md`
(seat bars), `docs/MONSTER-WAVES.md`. **No canon doc covers
the scale-rank inputs** — this arm measures them; the numbers
below are this arm's measurement convention, frozen here, not
a canon claim. The scale machinery lives in code and is read,
never re-implemented (verified by grep + read, 2026-11-28
~03:20 UTC):

- `scaleRank()` (hierarchy.js:2279) is a flag read, nothing
  more: `globalLive` → 'global', `nationalLive` →
  'national', `networkLive` → 'regional', else 'village'.
  National is a LIVE state, not a title: when the realm
  dissolves (no qualifying polity, no pending beat) the flags
  clear aloud and the climb starts over (hierarchy.js:2542).
- `nationalLive` is set in exactly one place:
  `answerNationalChoice()` (hierarchy.js:3040), when a
  staged national beat is ANSWERED. There is no threshold
  flip, no calendar path to national.
- The beat stages in `_checkNational()` (hierarchy.js:2539),
  daily, only when ALL of these hold: a polity qualifies
  (`_havenPolity()`, priority lead → belong → covenant →
  trade), Haven has been regional a full season
  (`networkLive` AND `day - networkLiveDay >= 30` — one rung
  per season, VILLAGE 1–30 / REGIONAL 31–60 / NATIONAL
  61–90), the answerer is not exiled, and the scale was
  never refused (`scaleRefused` — a refused scale never
  re-stages). A staged beat whose answerer is exiled dies
  aloud at the next boundary, never a silent stall.
- The polity shapes (`polityOf` / `_covenantPolity` /
  `_tradePolity`, hierarchy.js:2312–2395):
  - **LEAD** — Haven is primary of ≥3 SEASONED
    subordinates (a realm of 4 fires under one head).
  - **BELONG** — Haven is a subordinate in good standing
    (trust ≥50, no arrears, link ≥14 days) to a primary
    whose realm holds ≥4 villages.
  - **COVENANT** — ≥3 seasoned peer covenant links (a
    league of ≥4 fires, no head).
  - **TRADE** — ≥3 seasoned peer trade links (charter
    league of ≥4 fires).
  Seasoned (`_linkSeasoned`, hierarchy.js:234): link 30+
  days old AND trust 40+ (conquered links: the season,
  not the trust). Three cold accepts in three days is a
  pact, not a nation.
- Standing (`villageStanding()`, standing.js:120): one bar,
  three sources — war (+25 per wave-3+ ledger kill point),
  diplomacy (+34 per seasoned link that participates in a
  REGIONAL+ polity — a lone seasoned bond with a splinter
  village scores 0), plenty (+20 per major feast).
  `villageStandingTotal()` is the gated number the wave
  unlock reads; `villageStanding()` is the honest
  breakdown. Standing does NOT feed `scaleRank()` — it is
  recorded here because the diplomacy source counts the
  same seasoned-regional+ links the polity needs, so a
  stalled diplomacy count and a stalled polity are the
  same stall seen twice.
- **Known bot confound, frozen:** the competent policy
  (`scripts/policies/competent.js`) NEVER answers a staged
  national beat — grep finds no `pendingNational` /
  `answerNationalChoice` handling in it (it does answer
  `pendingCounter`, competent.js:724). So on the plain road
  a staged beat sits unanswered, exactly like the capstone
  confound in the census (§5.1: the bot never attempts a
  delivery). This arm's staging ladder exists to separate
  that artifact from the game wall: stage 1 (polity
  qualifies) and stage 2 (beat staged) are GAME facts;
  stage 3 (beat answered) is where the bot stops. If beats
  stage on this band, the finding is "the door opens, the
  bot never walks through it" and the next arm is the
  answercourt variant, not a scale lever.

**What already exists (the ground this diagnostic stands on):**

- `scripts/scalecensus-driver-a.js` — the harvest pattern
  this driver clones: `loadGame` + `setupGame` + `runDays`,
  a daily `snap()` wrapped around the competent policy,
  say/emit capture, fireside lines parsed, per-seed JSON +
  `--summary`. This arm's driver
  (`scripts/scalerank-driver-a.js`) keeps that structure
  and EXTENDS the snapshot with the scale-rank input block:
  rank flags (`networkLive`, `networkLiveDay`,
  `nationalLive`, `nationalFirstDay`, `nationalShape`,
  `globalLive`), the pending beat (`pendingNational`:
  shape/day/villages/led/primary, days pending),
  `scaleRefused`, `_natDefer`, exiled, the rung gate
  (`day - networkLiveDay`), per-shape polity candidates
  (LEAD seasoned subs vs 3, BELONG good-standing + realm
  size, COVENANT seasoned peer links vs 3, TRADE seasoned
  peer links vs 3, `_havenPolity()` winner or null), the
  full link list (kind, other village, day formed, age,
  trust, status, seasoned?, conquered, arrears), and the
  standing breakdown (`villageStanding()`: total/war/
  diplomacy/plenty/warPts/links/feasts) plus the gated
  `villageStandingTotal()`.
- The analyzer (`scripts/analyze-scalerank-a.js`) computes
  per seed: the mechanism stage reached (0 no polity ever /
  1 polity qualified / 2 beat staged / 3 beat answered /
  4 national held to end — plus LOST if nationalLive
  cleared after being set), first-day per stage, the
  binding input (the per-shape near-miss counts at end,
  the rung-gate remainder, the closest link's age/trust
  gap), and the wall numbers.
- **Death-cause recorder (folded in, own bar):** scalecensus
  §5.2/§7 arm 4. The proven instrument is
  `scripts/deathcensus-instrument-20261110.js`: the engine
  records every home-village death twice over — the
  memorial roll `Game.state.village.fallen`
  ({villagerId, day, cause, name, monsterId?,
  monsterName?}) and the telemetry death hook. This driver
  drains BOTH daily (index-based diffs, idempotent) plus a
  final drain after `runDays` returns, and tracks the roster
  id-set daily (joins / departures / leavers). Cause strings
  are listed verbatim, never bucketed silently; guest deaths
  (vid never in Haven's roster) are reported separately.
- The analyzer reads the per-seed JSONs only — it never
  re-simulates and never recomputes the bars from anywhere
  but the snapshot's own recorded fields.

**Pre-registered expectation:** most seeds stall at stage
0 or 1 — the polity never qualifies, and the binding input
is the seasoned-link count (too few links reach 30 days at
trust 40+, or the links that do are not the 3 of one shape
the polity needs). The falsifier: a beat stages on ≥1 seed
(stage 2) — that moves the wall from "no polity" to "the
bot never answers" — or any seed reaches national.
`nationalFirstDay` / `nationalHeldDays` are null-expected
and reported as such if no seed reaches.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to
compare). Population: ALL 8 seeds, competent verbatim, 150d
death-aware. Each per-seed row carries the daily scale-rank
input series and the end-of-run mechanism stage.

- **Pool floor:** ≥ 6 of 8 seeds alive at day 80 (same as
  the census — the scale window must be observable;
  census band: 6/8).
- **Primary metric:** per seed, the mechanism stage reached
  (0/1/2/3/4 + LOST) with first-day per stage, PLUS the
  binding input at end: per-shape near-miss counts
  (leadSeasonedSubs/3, belongGood + belongRealmSize/4,
  covenantSeasoned/3, tradeSeasoned/3), the rung-gate
  remainder (`30 - (day - networkLiveDay)`, null before
  regional), and the closest link's gap (max over links of
  min(age/30, trust/40) with its age + trust). Pooled:
  seeds per stage, seeds reaching national, seeds reaching
  regional, median first-polity day (null if none).
- **Snapshot coverage (binding):** daily snapshots carrying
  a complete scale-rank input block (rank flags + polity
  counts + standing breakdown + link list, all non-null) /
  all daily snapshots ≥ 0.95. Accessor failures are counted
  openly per accessor, never silently filled.
- **Reconciliation (binding):** the analyzer's per-seed
  end-of-run mechanism table equals the last snapshot's
  recorded stage on every seed (0 mismatches) — the driver
  appends a closing snapshot to the series, so the end table
  IS the last snapshot; AND every count the analyzer reads
  (per-shape seasoned counts, diplomacy links) agrees with a
  recomputation from the snapshot's own recorded link list
  (stored-vs-recomputed, never a second simulation).
- **GO threshold:** pool floor met AND coverage ≥ 0.95 AND
  reconciliation 0 mismatches AND instrument errors 0.
- **Instrument errors:** 0 on all per-seed files.
- **MECHANISM ANSWER (binding as a finding, not a bar):**
  the evidence names the binding scale-rank input(s) with
  per-seed numbers — which component stalls, how many links
  seasoned vs needed, what the next link/deed would require,
  `nationalFirstDay` / `nationalHeldDays` if any seed
  reaches. A DIAG-GO without this answer is not a DIAG-GO:
  the answer is the deliverable, and the coordinator judges
  it from the evidence file.
- **Determinism (binding):** one seed re-run after the
  pilot is byte-identical to its pilot file. Per-seed JSONs
  carry no wall-clock fields; no process-position-dependent
  sequence is used (partydmg-a lesson: any per-seed row
  sequence is reset at the start of each seed's run).

**Verdict:** DIAG-GO when all four bars pass AND the
mechanism answer is written (the question is answered: the
binding input is named per seed with first-stage days, and
the staged/answered/national counts are quantified).
DIAG-NO-GO kind THIN-POOL when the pool floor misses;
DIAG-NO-GO kind ATTRIBUTION when coverage or reconciliation
misses; DIAG-NO-GO kind INSTRUMENT when errors > 0. A miss
is NO-GO, never re-scored against a friendlier metric
mid-run. The mechanism finding (which input binds, on how
many seeds) is the FINDING, reported under the verdict — it
does not flip GO to NO-GO either way, because the
diagnostic's job is to measure it, not to pass it.

**Staging sniff test (pilot gate):** the analyzer must show
the scale machinery is live on this band (rank reaches
regional on ≥ 1 seed AND ≥ 1 seed records ≥ 1 active link
with age/trust fields) before the verdict is read. If no
link ever forms anywhere, the verdict is DIAG-NO-GO
THIN-POOL with "no links formed" as the finding.

## §3. Secondary metrics (supporting, not binding)

- Death-cause recorder: classification completeness of
  deaths (named cause / total deaths) — report the share,
  never fake a cause. Roster books: initial + joins ==
  final + rostered deaths + leavers; any residual listed by
  name + day. Death-cause shares (named causes only).
- Standing trajectory: war / diplomacy / plenty per seed at
  end; diplomacy links vs polity links (same stall, twice).
- Table timeline (carried from the census for the wall):
  first lesser-seat day, waiting days, overtime tier at end.
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares.
- Village assessment (playtest-loop body): assessment in
  plain words per seed — who lived, who died, what they
  knew, what was missing.
- Sense-testing: 2–3 full transcripts (fireside lines about
  the table/scale + system scale lines), read in full —
  SENSE-TESTING LAW: judge meaning, not counts.
- Reachable / fun / winnable verdict for the scale leg.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the census, so
  the bands compare; the scale window is 80–140d and the
  table floor is day 90). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 113301, 113302, 113303,
  113304, 113305, 113306, 113307, 113308.**
- **Band freshness (verified 2026-11-28 before this freeze):**
  the candidate band 113201–113208 is REJECTED — the range
  is named in `evidence/2026-11-28/sim-scalecensus-a-prereg.md:192`
  ("names the fallback 113201–113208 in NO prereg" — the
  sentence itself names the range; the strict word-boundary
  rule moves to the next block, and the reason is recorded
  here). The next block 113301–113308 is verified fresh:
  word-boundary ripgrep (`rg -w --glob '*.md'`) over all
  `evidence/**/*.md` names NONE of 113301–113308, and no
  evidence filename contains them. Neighbouring used bands
  avoided: 113101–113108 (scalecensus), 112101–112108
  (partydmg), 111801–111808 (speardmg), 111101–111108
  (launchfit). NOTE: the sibling diag arm
  (sim-capstoneready-a) runs 113201–113208 in its own
  worktree with its own recorder — a different band, no
  shared files, no shared corpus; the two bands differ by
  block only, same policy / horizon / substrate.
- **Policies:** competent verbatim. **No substrate flags:**
  the honest scale leg — no seat legs, no damage levers —
  so the mechanism is measured on the plain road.
- **Instrument:** `scripts/scalerank-driver-a.js` (clone of
  the scalecensus harvest structure — see §1; RUN=
  scalerank-a, OUTDIR
  `evidence/2026-11-28/perseed-scalerank-a-arm`).
  Analyzer `scripts/analyze-scalerank-a.js` (new; reads the
  per-seed JSONs only — it never re-simulates and never
  recomputes the bars). Per-seed JSONs under
  `evidence/2026-11-28/perseed-scalerank-a-arm/`.
  - The driver records the daily snapshot series unchanged
    in shape; the mechanism stage, first-stage days, binding
    input, and wall numbers live in the ANALYZER, not the
    driver.
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
scholar. The proof test (`scripts/test-scalerank-a.js`,
GREEN before the pilot) runs live on a loaded village — a
staged mid-run village (day ~100, regional, wave-4 faced)
records a snapshot series whose polity counts match the
live link roll (seasoned counts equal a hand recomputation
from the recorded links, the standing breakdown matches
`villageStanding()`), the analyzer names the mechanism
stage on fixtures (no-polity / polity-qualified /
beat-staged / national-held / national-lost), and a
determinism spot check (same seed twice → byte-identical
per-seed JSON) passes. The pilot's per-seed corpora carry
the encounter averages beside the verdict in the evidence
file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the scale machinery is live on competent
   bands — census band: regional 8/8 (first regional days
   44–67), lesser seat 8/8, table waiting 8/8. Links form
   and season on competent play (regional itself requires
   the Dawn, which requires a 21+ day bond).
2. **Pool sizing:** the addressable pool is every link a
   village forms; the bars are per-shape counts of 3, so
   the pool (links formed, typically several per village)
   is within an order of magnitude of the bar by
   construction. The rung gate (30 days regional) fits
   inside the 150d horizon with ~90 days to spare.
3. **Verb existence:** `answerNationalChoice` exists in code
   (hierarchy.js:2712); the competent policy does NOT call
   it — a known, frozen confound (§1), handled by the
   staging ladder, not by pretending the verb is missing.
4. **Horizon fit:** 150d contains the scale window (80–
   140d), the day-90 table floor, and the rung gate
   (regional ~day 44–67 + 30 days → national staging
   earliest ~day 74–97, inside the horizon).

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (seat bars:
lesser 4/4/3 + 2 contests + 2 crises + regional+ + stage
≥ 2 + sentimentTaught + ladder peak ≥ Village Standing;
full national/global + 5/5/4/3/2 + 3 + 3; reachability
target: competent non-god play reaches the LESSER seat),
`docs/MONSTER-WAVES.md` (wave bars) read before the run.
**No canon doc covers the scale-rank inputs** — this arm
measures them; the numbers in §1 are this arm's
measurement convention, frozen here, not a canon claim.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On DIAG-GO the binding input is named per seed with
  first-stage days, the staged/answered/national counts are
  quantified, and the next arm is named from that proof (a
  lever on the binding input, or the answercourt variant if
  beats stage unanswered — decided by the numbers, not by
  preference). On DIAG-NO-GO the question stays open with
  the failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD`
  before every material write; if it fails, stop writing and
  wait for the clear.
