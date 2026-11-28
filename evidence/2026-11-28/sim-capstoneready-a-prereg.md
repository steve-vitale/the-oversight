# sim-capstoneready-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-capstoneready-a · **Loop A run:**
fleshout-20261128T0315Z · **scalecensus §7 next arm #2 —
capstone-readiness recorder, LEG 1 (readiness recorder ONLY)**
**Type:** DIAG (instruments + evidence only — no game-code fix
lands in this arm; no policy change lands in leg 1)
**Frozen:** 2026-11-28 ~04:05 UTC, before any judged sim.
**Branch:** `sim-capstoneready-a` (worktree
`~/workspace/worktrees/sim-capstoneready-a`).
**Base:** master tip `fb6c383fb` (verified in-worktree at run
start; Loop B's reunionwild2-b merged at 03:42Z).
**Builds on:** `evidence/2026-11-28/sim-scalecensus-a.md`
(band 113101–113108: capstone delivered 0/8, lesser seat 8/8,
national 0/8, wins 0/8, median survival 150d) and its
prereg `evidence/2026-11-28/sim-scalecensus-a-prereg.md`
(staging discipline mirrored here).

## §0. The question, in plain words

The scalecensus recorded a delivered capstone on 0 of 8
villages — but §5.1 of that evidence names the count
CONFOUNDED: the competent policy never attempts a capstone
delivery (it is a Haven-panel player action,
`ladderDeliverCapstone`), so the corpus records delivery,
not readiness, and cannot tell "never ready" from "ready
but the bot never delivers." This arm separates the two:
record `ladderCapstoneReady()` daily for all three
capstone deeds, on a fresh band, and say per seed, per day,
whether any village was ever actually ready — and if so,
what it was ready for, what the readiness required, and
whether delivery was ever attempted. If readiness is never
true anywhere, the verdict is the separation itself: the
capstone is a readiness wall, not a bot artifact — and leg 2
(teaching the competent policy the delivery verb) does NOT
run. If readiness is real on ≥1 seed, leg 2 runs under its
OWN prereg amendment, frozen + committed before any leg-2
judged sim. No leg-2 work is built on a leg-1 hunch.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/TABLE.md`
(seat bars + reachability target), `docs/MONSTER-WAVES.md`.
**No canon doc covers the capstone-readiness census** — this
arm measures it; the numbers below are this arm's
measurement convention, frozen here, not a canon claim.
The capstone machinery lives in code and is read, never
re-implemented:

- The three capstone deeds (`src/data/ladder-capstones.json`,
  mirrored in `src/js/ladder.js` `LADDER_CAPSTONE_FALLBACK`,
  read by `ladderCapstones()`):
  - `military_tribute` — 2 living wave-4 veterans on hand
    (`requires.livingVeteransWave4: 2`). The scholar counts
    (Steve RULED 2026-11-10 07:39 CST: the scholar is part
    of the village).
  - `trade_charter` — a sealed charter exists (an active
    trade link with `chartered=true`) AND scale is national+
    (`requires.charteredTradeLink: 1, scaleRank: national`).
  - `feast_embassy` — the feast bundle is done (feast-log
    bundle flag) while at ladder stage 3
    (`requires.feastBundle: true, ladderStage: 3`). The
    bundle flag is leg 2's write; false until leg 2 lands it.
- `ladderCapstoneReady(kind)` (`src/js/ladder.js:501`) is a
  READ, not the delivery. Per kind it returns
  `{kind, ready, reason, ...kind-specific fields}`:
  - tribute: `{ready, veterans, payable, need, reason}` —
    `ready` iff living wave-4 veterans ≥ need; `payable` is
    the non-scholar subset the delivery can actually take.
  - charter: `{ready, charteredLinks, scale, reason}` —
    `ready` iff sealed chartered links > 0 AND scale is
    national/global (when `scaleRank()` is unavailable the
    chartered flag alone counts).
  - feast: `{ready, stage, needStage, bundle, reason}` —
    `ready` iff stage ≥ needStage AND bundle.
  - Fail-closed: an already-delivered capstone reads
    `{ready: false, reason: 'delivered', delivered}`; any
    read error reads `{ready: false, reason: 'read-error'}`;
    an unknown kind reads `'unknown-capstone'`.
- **Readiness/delivery split (frozen, from code):**
  `ladderDeliverCapstone(kind)` (`src/js/table.js:173`)
  re-checks readiness at delivery time, then pays the price:
  tribute pays 2 NON-scholar veterans (they leave Haven via
  `removeVillager(vid, 'tribute')`) and honestly refuses
  with `'veterans-short'` when fewer than 2 payable veterans
  stand; charter and feast record the deed with no price.
  So a scholar-veteran + 1 villager reads READY but is NOT
  DELIVERABLE — the bar measures the village's strength, the
  payment measures who can leave. This arm records BOTH:
  `ready` (the bar) and `deliverable` (ready AND, for
  tribute, `payable >= 2`; for charter/feast, ready alone —
  delivery takes no payment). The split is the ruling's
  consequence, not a bug.
- `tableSeat()` (`src/js/table.js:122`): full seat =
  `deedGateReady().ok` AND ladder peak ≥ 3 AND a delivered
  capstone. `deedGateReady()` (`src/js/progression.js:669`)
  is the deed half; `ladderPeakStage()`,
  `ladderCapstoneDelivered()`, `scaleRank()`,
  `integrationStage()`, `overtimeTier()`, `progState()`
  (arc, tableWaiting, tableAnnounced, tableDone) — all
  verified present in code before this freeze (grep,
  2026-11-28 ~03:50 UTC).
- The competent policy (`scripts/policies/competent.js`)
  has NO delivery verb: it never calls
  `ladderDeliverCapstone`. Delivery attempts on this band
  are therefore expected to be 0, and
  `ladderCapstoneDelivered()` is expected to stay null on
  all 8 seeds — recorded, not assumed. Any non-null
  delivered value on leg 1 would be a finding (a verb
  firing nobody expected), not a success.

**What already exists (the ground this diagnostic stands on):**

- `scripts/scalecensus-driver-a.js` — the harvest pattern
  this driver clones: `loadGame` + `setupGame` + `runDays`,
  a daily `snap()` (day, rank, arc, tableWaiting/Done/
  Announced, stage, pop, pantry), say/emit capture,
  fireside lines parsed (speaker/listener/text), system
  table lines by regex, marker days, per-seed JSON +
  `--summary`. This arm's driver
  (`scripts/capstoneready-driver-a.js`) keeps that structure
  and EXTENDS the snapshot with the daily capstone-readiness
  breakdown (all three kinds, full returns) plus
  `deliverable` per kind, while keeping the deed-gate
  breakdown, `tableSeat()`, ladder peak, and overtime tier
  for wall context — the snapshot is the instrument; the
  readiness answer is read off it by the analyzer, never
  hand-counted.
- The analyzer (`scripts/analyze-capstoneready-a.js`)
  computes per seed: first-ready day per kind, ready-days
  per kind, first-deliverable day per kind,
  deliverable-days per kind, the dominant blocker reason
  per kind (the reason on the most snapshot-days), and the
  wall numbers. Reconciliation recomputes each kind's
  `ready` boolean from the snapshot's OWN stored fields
  (tribute: veterans ≥ need; charter: charteredLinks > 0
  and scale national/global-or-null; feast: stage ≥
  needStage and bundle) and compares it to the stored
  `ready` — the residual check is stored-vs-recomputed,
  never a second simulation.
- **Frozen numbers carried in:** scalecensus band
  (113101–113108): wins 0/8, national 0/8, regional 8/8,
  table 8/8 waiting, seated 0/8, median survival 150d,
  capstone DELIVERED 0/8 (confounded — see §0). Launchfit
  band (111101–111108): wins 0/8, national 0/8, table 8/8
  waiting, median survival 150d. Partydmg band
  (112101–112108): national 0/8, wins 0/8, median 150d.

**Pre-registered expectation:** readiness will be rare
and tribute-shaped: the scalecensus band banked living
wave-4 veterans on only some seeds (waves bar cleared on
2/8, w4 counts 0–6), national was never reached (so the
charter's scale leg cannot pass), and the feast bundle flag
is unwritten until leg 2 (so the feast can never read
ready on leg 1). The falsifier: any kind ready on any seed
— that is the FINDING, not a failure — or a delivered
capstone on leg 1 (a verb firing nobody expected).

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to
compare). Population: ALL 8 seeds, competent verbatim,
150d death-aware. Each per-seed row carries the daily
snapshot series (readiness breakdown + deed-gate breakdown
+ seat + ladder peak + overtime tier) and the end-of-run
readiness table.

- **Pool floor:** ≥ 6 of 8 seeds alive at day 80 (the scale
  leg's window must be observable). Sized to the
  scalecensus/launchfit survival distribution (6/8 survive
  to 150d on both bands).
- **Primary metric:** per seed, per kind, the readiness
  series — first-ready day (null if never), ready-days,
  first-deliverable day (null if never), deliverable-days —
  plus the delivered state (`ladderCapstoneDelivered()`,
  expected null throughout). Pooled: seeds with any kind
  ever ready, seeds with any kind ever deliverable,
  kind-by-kind ready/deliverable counts.
- **Snapshot coverage (binding):** daily snapshots carrying
  a complete readiness breakdown (all three kinds returned
  objects, no error) / all daily snapshots ≥ 0.95.
  Accessor failures are counted openly per kind, never
  silently filled.
- **Reconciliation (binding):** the analyzer's per-seed
  end-of-run readiness table equals the last snapshot's
  stored readiness on every seed (0 mismatches) — the
  driver appends a closing snapshot to the series, so the
  end table IS the last snapshot; and every kind's stored
  `ready` agrees with a recomputation from its own stored
  fields (see §1). The residual check is stored-vs-
  recomputed, never a second simulation.
- **GO threshold:** pool floor met AND coverage ≥ 0.95 AND
  reconciliation 0 mismatches AND instrument errors 0.
- **Instrument errors:** 0 on all per-seed files.
- **Determinism (binding):** one seed re-run after the
  pilot is byte-identical to its pilot file (full 150d).
- **READINESS-vs-DELIVERY SEPARATION (binding, stated
  with per-seed numbers):** the evidence states, per seed
  and pooled, on how many seeds/days each kind was ready,
  what the readiness required, and whether delivery was
  ever attempted (expected: never — the competent policy
  has no delivery verb). A run that cannot state the
  separation in numbers has not answered the question.

**Verdict:** DIAG-GO when all bars pass (the question is
answered: readiness is quantified per kind per seed with
first-ready days, and the readiness-vs-delivery separation
is stated in numbers). DIAG-NO-GO kind THIN-POOL when the
pool floor misses; DIAG-NO-GO kind ATTRIBUTION when
coverage or reconciliation misses; DIAG-NO-GO kind
INSTRUMENT when errors > 0. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. The
readiness finding (which kind is ever ready, on how many
seeds/days) is the FINDING, reported under the verdict —
it does not flip GO to NO-GO either way, because the
diagnostic's job is to measure it, not to pass it. In
particular: readiness-never-true is a DIAG-GO outcome
(the separation itself), and readiness-real is a DIAG-GO
outcome that OPENS leg 2 — neither is a failure.

**Staging sniff test (pilot gate):** the analyzer must show
the seat machinery is live on this band (tableWaiting fires
on ≥ 1 seed, rank reaches regional on ≥ 1 seed) AND the
readiness machinery is live (all three kinds return
well-formed reads — `{kind, ready, reason}` — on ≥ 1
snapshot) before the verdict is read. If the table never
waits anywhere, or any kind never returns a read, the
verdict is DIAG-NO-GO THIN-POOL (silent table) or
ATTRIBUTION (dead readiness read), with the silent
instrument as the finding.

## §3. Secondary metrics (supporting, not binding)

- Per-kind blocker-reason distribution (the reason on the
  most snapshot-days per kind; e.g. tribute
  `veterans-short`, charter `no-sealed-charter` /
  `scale-short`, feast `no-bundle-feast` / `stage-short`).
- The readiness/deliverable gap per kind: ready-days minus
  deliverable-days (for tribute, the scholar-veteran split
  made visible: days ready with `payable < 2`).
- Table timeline: announce day, first waiting day, waiting
  days, seated day (null expected); overtime tier at end.
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares (null —
  NOT instrumented by this driver; reported null, never
  faked, per the scalecensus §5.2 gap).
- Village assessment (playtest-loop body): census in plain
  words per seed — who lived, who died, what they knew,
  what was missing.
- Sense-testing: 2–3 full transcripts (fireside lines
  about the table/scale + system table lines), read in full
  — do villagers talk about the table and the climb
  sensibly? SENSE-TESTING LAW: judge meaning, not counts.
- Reachable / fun / winnable verdict for the capstone leg.
- Leg-2 gate: readiness real on ≥ 1 seed (any kind
  ever ready) → freeze a leg-2 prereg amendment and run
  leg 2; readiness never true → leg 2 does not run, and
  the next arm is named from the blocker reasons instead.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as scalecensus /
  partydmg / launchfit bands, for comparability; the scale
  window is 80–140d and the table floor is day 90).
  Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 113301, 113302, 113303,
  113304, 113305, 113306, 113307, 113308.**
- **Band freshness — the move, recorded:** the assigned
  candidate band was 113201–113208, shared with the sibling
  sim-scalerank-a arm. Word-boundary ripgrep over all
  `evidence/**/*.md` names 113201 and 113208 in exactly
  one file — `evidence/2026-11-28/sim-scalecensus-a-prereg.md`
  line 192, as the endpoints of the text
  "the fallback 113201–113208" (its own freshness sentence).
  The task's rule is strict — ANY seed named anywhere in
  `evidence/**/*.md` moves the band — so this arm moves to
  the next fresh 8-seed block, 113301–113308. The
  113201–113208 band stays with the sibling (chosen before
  this finding; its prereg records its own freshness state).
  Freshness of 113301–113308 verified 2026-11-28 ~04:00
  UTC: word-boundary `rg -g '*.md'` over all `evidence/`
  names none of 113301–113308 in any `.md` file, and no
  evidence filename contains them. (Note, for the record:
  the tokens 113301/113305/113307 do occur as bare numbers
  inside old `.json`/`.jsonl` corpora — e.g.
  `sim-sensorresupply-b-screen.jsonl`, `perseed-ammo-a-ctl`
  rows — which are numeric corpus fields, not seed-band
  declarations; the task's freshness rule is scoped to
  `evidence/**/*.md`, and the `.md` scope is clean.
  Neighbouring used bands avoided: 113101–113108
  (scalecensus), 112101–112108 (partydmg),
  111801–111808 (speardmg), 111101–111108 (launchfit).
- **Policies:** competent verbatim. **No substrate flags:**
  the honest capstone leg — no seat legs, no damage levers
  — so the recorder reads what competent play actually
  builds.
- **Instrument:** `scripts/capstoneready-driver-a.js` (clone
  of the scalecensus harvest structure — see §1; RUN=
  capstoneready-a, OUTDIR
  `evidence/2026-11-28/perseed-capstoneready-a-arm`).
  Analyzer `scripts/analyze-capstoneready-a.js` (new; reads
  the per-seed JSONs only — it never re-simulates and never
  recomputes readiness from anywhere but the snapshot's own
  stored fields). Per-seed JSONs under
  `evidence/2026-11-28/perseed-capstoneready-a-arm/`.
  - The driver records the daily snapshot series unchanged
    in shape; the readiness table, first-ready days, and
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
scholar. The proof test (`scripts/test-capstoneready-a.js`,
GREEN before the pilot) runs live on a loaded village:
- a staged mid-run village (wave-4 kills in the live
  `waveKillLog` for two living villagers) records a
  snapshot whose tribute readiness reads ready with
  `veterans: 2, payable: 2` — and a scholar-veteran + 1
  villager staging reads ready with `payable: 1`
  (deliverable false: the readiness/delivery split, live);
- a staged chartered trade link reads charter-ready only
  with scale national (live `scaleRank()` is village on a
  fresh village, so the live read is `scale-short` /
  `no-sealed-charter` — the negative leg is proved live,
  the positive leg on synthetic snapshots through the
  analyzer's recompute);
- a staged feast-log bundle entry with ladder stage < 3
  reads feast `no-bundle-feast`/`stage-short` live (the
  bundle flag alone never reads ready);
- the analyzer names the ready/deliverable split on
  fixtures (all-ready, tribute-ready-but-not-deliverable,
  charter-blocked, feast-blocked), and a determinism spot
  check (same seed twice → byte-identical per-seed JSON)
  passes.
The pilot's per-seed corpora carry the encounter averages
beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the table waits on competent bands
   (scalecensus: table 8/8 waiting; launchfit: 8/8) and
   rank reaches regional on competent bands — the
   phenomenon occurs on the substrate. The capstone deeds
   exist in data + code (`ladderCapstones()` returns all
   three kinds — verified by grep before this freeze).
2. **Pool sizing:** see §2 pool floor (≥ 6/8 alive at day
   80), sized to the scalecensus survival distribution (6/8
   to 150d, median 150d). The readiness pool is the
   village-days themselves (1015 snapshots on the
   scalecensus band) — the bar is a coverage/reconciliation
   bar on that pool, not an absolute readiness count.
3. **Mechanism pre-check (frozen, not a sim):** the proof
   test (`scripts/test-capstoneready-a.js`, GREEN before the
   pilot) proves the measurement chain on live state (see
   §5). The analyzer `--selftest` covers the readiness
   table (all-ready / one-blocked-each / tribute-split),
   the first-ready-day extraction, and the judge shapes
   (DIAG-GO, THIN-POOL, ATTRIBUTION, INSTRUMENT).
4. **Horizon fit:** 150d contains the scale window (80–
   140d) and the day-90 table floor with room for the
   overtime ticks to show — and for wave-4 veterans to bank
   (the scalecensus band's waves bar cleared on days 132
   and 146).

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (seat bars:
lesser 4/4/3 + 2 contests + 2 crises + regional+ + stage
≥ 2 + sentimentTaught + ladder peak ≥ Village Standing;
full national/global + 5/5/4/3/2 + 3 + 3 + ladder peak ≥ 3
+ delivered capstone; reachability target: competent
non-god play reaches the LESSER seat),
`docs/MONSTER-WAVES.md` (wave bars),
`src/data/ladder-capstones.json` (the three capstone deeds)
read before the run. **No canon doc covers the
capstone-readiness census** — this arm measures it; the
numbers in §1 are this arm's measurement convention,
frozen here, not a canon claim.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On DIAG-GO the readiness answer is stated per kind per
  seed with first-ready days, the readiness-vs-delivery
  separation is quantified, and the next arm is named from
  that proof (leg 2 if readiness is real, a blocker-lever
  diagnostic if it is never true — decided by the numbers,
  not by preference). On DIAG-NO-GO the question stays open
  with the failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD`
  before every material write; if it fails, stop writing and
  wait for the clear.
