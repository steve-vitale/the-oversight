# sim-scale-onramp-round-1715 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1715Z, Mon 2026-10-26. Axis: scale-onramp (standing
directive — the blocking axis; tracker: converging, NOT converged).
Sibling loop B live on food-economy throughout (1730Z round landed mid-run,
NOT touched); sibling eggroad-a live (NOT touched). No live lever claim at
run start; claim fleshout-20261026T1715Z written before spawning, deleted at
closeout.

## Arms (both DIAG/MEASUREMENT ONLY, zero game code)

### Arm 1 — sim-tablenat-a: 73672 table-without-national — DIAG-GO (game-gate cause)

Pre-registered bar (in arm evidence header, before any sweep): named cause
with code pointer + reproducing row, or "unreproduced on current base"
verdict. Met by the first leg: the cause is a game gate, not an instrument
artifact.

- Seed 73672 on current HEAD reproduces exactly: 180d survived, regional /
  regional, table = 1 (invited/waiting), entered = 0, 51 deaths.
- Code: `src/js/table.js` `tableSeat()` — `scaleOk` admits regional;
  lesser seat = waves 4/4/3 + 2 contests + 2 crises + scaleOk + stage ≥ 2 +
  food deeds. `src/js/progression.js` `checkArc()` / `arcBeat(4)` sets
  `tableWaiting` (invited); seated is `tableDone`, set only by sitting.
- Trace: day 47 village → regional; day 61 Arc IV beat; day 62 first waiting
  snapshot at regional, stage 3, lesser with w1 16 / w2 7 / w3 3, contests 5,
  crises 3, foodDeeds true. Waiting continuous 119 days (62–180), never
  withdrawn, never seated, never national; `state.nationalDay` 0,
  `nationalLive` false throughout.
- Instrument half, settled negative: `table` = invitation-ever flag;
  `nationalEver` = maxRank ≥ 2 = 0, correct; `tsNationalDay` is policy
  context set only on a day the policy sees rank ≥ 2, so `ts = {}` holds by
  construction for any never-national village. Nothing is mislabeled.
- Correct citation from now on: "73672: regional, lesser seat, waiting,
  never entered" — never as a national-reach seed. Pattern occurs on
  exactly 1/8 band seeds; the other two table seeds (73676, 73677) are
  national and entered. Precedent: journey-scale r40 seed 85004, lesser at
  regional, never national.
- Commit 09c2297c3 (after rebase onto batch-ship bump b4621e73); proof
  TRACE PASS on the rebased branch; worktree clean. No `[needs-eyes]`.
- Evidence: evidence/2026-10-26/sim-tablenat-a.md + corpus
  perseed-sim-tablenat-a/ (8 rows + summary CORPUS PASS + 73672 trace).

### Arm 2 — sim-r52split-a: r52 3-file drift split — DIAG-GO (corpses.js alone)

Pre-registered bar (in arm evidence header, before any sweep): single-file
attribution (one restoration reproduces the -1354 band while the others do
not) or the honest "no single file drives it — interaction" verdict with
per-file tables. Met by the first leg: no interaction.

- Base 7231f9272; re-baseline band reproduces the 806ef430e table with ZERO
  field diffs across all 8 seeds (trajectory + deaths maps + ts).
- Split (each a full 8-seed band, judged field-by-field):
  - abilityActions.js → e8f2ccad7: identical to re-baseline (0 field
    diffs; 73676 stays 144d won / 43) — INERT.
  - corruption.js → e8f2ccad7: identical to re-baseline (0 field diffs) —
    INERT.
  - corpses.js → e8f2ccad7: identical to -1354/E3 (0 field diffs; 73676 →
    160d won / 55; band deaths 327, raids 101, pool 1,640) — DRIVES IT, ALONE.
- Control: combined E3 on this base reproduces -1354 exactly, so the
  interaction alternative was genuinely available and genuinely rejected.
- Intervening-delta check: the ONLY commit touching any of the 3 files
  between e8f2ccad7 and HEAD is the r52 commit itself (88b8d7e32), so each
  restoration reverts exactly that file's falsy-0 fix and nothing else.
- Driver: corpses.js spawn-placement fix `(s.mx || 4) → (s.mx ?? 4)`,
  `(s.my || 4) → (s.my ?? 4)`. Inertness is band-scoped (seeds 73671–73678,
  this substrate), not generalized.
- Commit 11e882018 (after two rebases: batch-ship bump, then B-loop 1730Z
  round — both zero engine delta, zero file overlap); all 5 corpora PASS on
  the pre-merge base, decisive rebaseline + corpses corpora re-PASS on the
  merge base (re-swept summaries differ only in the `generated`
  timestamp; all verdict numbers byte-identical; timestamp-only diffs
  restored, not committed). Final tree src/js byte-identical to HEAD
  (blob-verified). No `[needs-eyes]`.
- Evidence: evidence/2026-10-26/sim-r52split-a.md + corpora
  perseed-sim-r52split-a-{rebaseline,combined,ability,corpses,corruption}/
  (8 rows + summary each, all corpus gates PASS).

## Wall numbers (both arms' re-baseline bands, identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting 3/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d, max 180d,
deaths 338, starvation 1, raids 110, raiders 469, pool 1,719, poolW3 263.
Wave 5 is unborn everywhere; wins come only through the default-OFF
tableseat-nowait lesser seat; the full seat is unreached.

## Reachability verdict

No reachability change from this run: both arms are measurement arms. The
table is reachable (lesser seat, regional included — that is the tablenat
finding, not a bug); the full seat, wave 5, and the win flag beyond the
lesser seat remain unreached in sims. The scale wall did not move.

## Village assessment (plain words)

The village that waits at the table without ever becoming a nation is the
story of this run. Seed 73672 fought widely — 5 contests, 3 crises, waves
into the teens — earned its invitation at regional size on day 62, and then
stayed too small and tired to grow into a nation: 4 people alive at day 180,
pantry empty, the lesser seat still open. That reads right, not broken — a
regional village can be invited, and invitation is not the same as sitting.
The other story is dice, not desert: moving one dead villager's body from
the village center to the edge cell where he actually fell re-deals a whole
run's deaths (73671: next death day 34 vs day 27, endpoints 180d survived /
48 vs 177d lost / 43). The fix is sensible — a body belongs where the
person fell — but the band movement it causes is luck of the draw, and any
future lever judged on this band must expect that churn.

Villagers acting like people: the 73672 trace shows villagers aware of the
table and talking about it — but with one identical sentence for ~80 days
across four speakers and very different situations (pantry empty, reactor
pellet, day-98 nation prod). Awareness is good; zero variation is a
dialogue-variety blank for a future arm (open findings line, not fixed
here).

## Blanks filled or documented

- FILLED (measurement): R52 3-file drift split — corpses.js alone; the
  combined attribution is no longer the standing answer.
- FILLED (measurement): 73672 table-without-national — legitimate regional
  lesser seat; the anomaly is closed, with a corrected citation rule.
- DOCUMENTED (not fixed, DIAG scope): canned fireside table line, verbatim
  across speakers (~80 days, seed 73672) — new open findings line.
- CARRIED (not chased): dead-entry drop ruling (Steve); 1354Z steve-calls
  (choice-price, met-below-line finishing, melt); defnarr proposal 3
  (ruling pending); narration variety (ruling pending).

## Metric review (§14)

No pre-registered leg was re-scored mid-run. Both arms judged against
their own headers. One bar note for the NEXT run: the r52split arm's
"reproduces the -1354 band" bar was judged field-by-field, not on
aggregates — the band aggregates alone (deaths 338 → 327) would have hidden
whether the move was uniform or seed-specific; keep field-by-field judging
for split arms. The tablenat arm's "table" shorthand is now defined in its
evidence as invitation-ever, not seated — future evidence must say
"invited (waiting), not seated" when entered = 0.

## Telemetry deviation check

Commands (on merged master, recorder corpora):
`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-26/perseed-sim-tablenat-a/*.json' --metrics national,table,wins,exiled`
and the same on `perseed-sim-r52split-a-rebaseline/*.json`.
Result on both: 3 LOUD lines (national 12 → 0, table 16 → 3, wins 16 → 0).
Verdict: the known recorder-row counting artifact — the checker reads
top-level national/wins keys that recorder rows do not carry (rows carry
nationalEver/won/table), so it counts 0 by default. Actuals: national-ever
6/8, table 3/8, wins 2/8. No real deviation. Baseline NOT rolled. No exiled
LOUD line.

## Balanced panel (§15)

Attempted by both arms; not applicable (no corpus-ingest mode for recorder
corpora — the panel re-runs sims under its own observer). Paired
identical-seed tables in the arm evidence files are the comparison of
record. No panel file is attached, and none is faked.

## Landing record

- sim-tablenat-a: merged --ff-only as 09c2297c3 (after rebase onto
  b4621e73); proof TRACE PASS on the rebased branch.
- sim-r52split-a: merged --ff-only as 11e882018 (after rebases onto
  b4621e73 then 388396773); all 5 corpora PASS pre-merge, decisive 2
  corpora re-PASS on the merge base.
- Both trees released done-merged, worktrees removed, branches deleted.
- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time; commits verified
  correct; main tree clean at closeout.
- check.js --quick NOT re-run (zero src/js, sibling loops live).
- No EPERM flap this run. Worktree registration slow (~1–2 min each) but
  succeeded.
- Merged locally, pending ship. Do NOT push, do NOT bump — the batch ship
  job owns deploys and live verification.
