# sim-sitmetric-b — close the reached-but-never-sat metric gap (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0130Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-sitmetric-b, branch sim-sitmetric-b.
Base: master `6e69df4ef`. Scope: MEASUREMENT FIX only — scripts/
(recorder, analyzer, compare). ZERO src/js. No new sweep: the fix is
proven on the existing corpora plus one live seed leg.
**Verdict: GO — all three pre-registered bars pass.** Full
pre-registration (binding): evidence/2026-11-08/sim-sitmetric-b-prereg.md.

## What was wrong

Two readings in the judged output both presented a priced/offered seat
as a taken seat:

(a) The §15 compare showed only the judged `table` metric — sittings
by ruling 665 (`row.entered`) — so on the flipsocial corpora the
winseek leg read table 0/8 on both legs while the raw harness flag
`row.table` read 7/8 collapsed → 5/8 healed. Villages reach the table
and never sit, and the judged output made the divergence invisible.

(b) `finalSeat` priced a seat never taken. Seed 53004 (fightloop
baseline corpus): `finalSeat` "lesser" with `takeseatStats.seatTaken`
0. Root cause: `scripts/sitstep-instrument-20261107.js` `finalize()`
stored `Game.tableSeat()` — the seat the table would price at end of
run — as `finalSeat`, regardless of whether any seat was taken. Every
analyzer counting `finalSeat !== 'none'` as a sit re-tripped it.

Honest definitions (verified in code): `row.table` = table invitation
ever observed (`tableWaiting` ever set, `scripts/sweep-compare.js:236-237`),
NOT "reached" in any stronger sense. `row.entered` = sat
(`pg.tableDone` ever set). `Game.tableTakeSeat()` returns `{ok:
committed}` with `committed = !!progState().tableDone`
(`src/js/table.js:1306-1321`): a successful sit sets `tableDone`.

## What changed (file + function)

- `scripts/lib/seat-taken.js` (NEW): the aligned-seat rule.
  `alignedSeat(row)` returns the seat actually TAKEN ('full' |
  'lesser' | 'none'); `seatTakenOf(row)` returns true / false / null
  (null = the row carries no taken/not-taken signal, so the priced
  reading stands as-is — never invented). Signals, strongest first:
  (1) the new boolean `row.seatTaken` from the fixed instrument;
  (2) `takeseatStats.seatTaken > 0`; (3) a recorded `sitAttempts`
  entry with `ok: true`; (4) a `daily` entry with `tableDone: true`
  (covers sits via any path, including the dawn tableScene, and
  survives the win-day-floor deferral clearing `tableDone`).
- `scripts/sitstep-instrument-20261107.js` `finalize()`: the reported
  `finalSeat` is now the seat TAKEN — the priced seat only when a sit
  actually happened (ever `tableDone` on the run's own daily
  snapshots, a successful recorded `tableTakeSeat` call, or
  `tableDone` at finalize). Otherwise `{seat: 'none'}`. The priced
  seat stays visible as new field `finalSeatPriced`, the verdict as
  new field `seatTaken`, and `finalFullShortfall` still prices the
  PRICED seat (it describes the bar, not the sitting).
- `scripts/lib/balance-scorecard.js` `comparePanels()` + `markdown()`:
  each policy now carries `tableReach` — raw invitation counts
  (`row.table`) and sittings (`row.entered`) before/after — rendered
  as a "Table reach (raw, display only)" line under the policy's
  metric table. Display only: never a contract metric, never part of
  the decision; `scripts/balance-metrics.json` untouched, contract
  digest unchanged, ruling 665 untouched. Null when neither leg
  carries the raw flag, so a missing flag is never printed as a false 0.
- Seat-counting analyzers now read the aligned seat via the helper
  (11 files): `doorwalk-b-analyze`, `takeseat-b-analyze`,
  `feareddoor-b-analyze`, `darkwit-b-analyze`, `trialcombat-b-analyze`,
  `witnessdoor-b-analyze`, `sitstep-analyze`, `sitstep2-analyze`,
  `regionalstep-analyze`, `feastdrive-analyze`,
  `feaststopspend-analyze`, `pairoverlap-analyze` (which also covers
  `doorwalk-confirm-b-analyze`, `feareddoor-rejudge-b-analyze`, and
  `pairoverlap-rate-analyze` through their reuse of the base
  analyzers). The `combatdiv` analyzer already counted sits from
  `takeseatStats.seatTaken` and needed no change. Driver console.log
  lines print the instrument's output and now show the aligned seat
  automatically.
- `scripts/balance-proof.json` + fresh retained panel
  `evidence/2026-11-09/neutral-sitmetric-20261109/panel.json.gz`
  (REQUIRED consequence, AGENTS.md: a changed collector input needs a
  fresh real observer-neutral maintenance proof): the scorecard edit
  changed an observer-file hash, which invalidated the retained proof
  (`test-measurement-workflow` / `test-measurement-proof-update`
  failed with "Proof source inputs are not current"). Refreshed by
  the sanctioned route — a real panel built on this branch (seed 7;
  capable/risk-aware/socialite/winseek; 150d; neutrality matching on
  all 4 policies; sourcesStable true) and
  `node scripts/balance-proof-update.js <panel>`. The panel itself
  shows the gap in miniature: all 4 policies invited (row.table 1)
  but only capable sat (row.entered 1). The `cases/` cache is NOT
  committed (§15).

No src/js change proved necessary: the instrument-owned signals
suffice, so nothing is held unlanded. No push, no version bump, no
live verification — done, pending coordinator landing.

## Before / after on the known cases

### (b) Seed 53004 (fightloop corpora, 16 rows re-read)

| | priced `finalSeat` | `seatTaken` | aligned `finalSeat` |
|---|---|---|---|
| 53004 baseline | lesser | 0 | **none** |
| 53004 candidate | none | 0 | none (unchanged) |
| 53001 baseline (taken control) | lesser | 1 | lesser (unchanged) |

Invariant holds on all 16 rows: aligned ≠ 'none' iff `seatTaken` > 0.
The analyzer now agrees with the evidence's sit counts: the candidate
leg's priced-but-untaken rows (53002, 53006 — both priced "lesser",
taken 0) also read 'none', so the candidate's finalSeat-based lesser
count drops 7 → 5, matching the recorded sits 5/8. The baseline drops
8 → 7, matching sits 7/8.

The gap was bigger than the single 53004 case. Re-reading the
doorwalk-family corpora through the aligned rule (the ONLY permitted
change per the prereg — seat counts dropping on untaken-seat rows):

| corpus | priced seats | aligned (taken) seats | untaken priced rows |
|---|---|---|---|
| takeseat baseline | 5/8 | **0/8** | 53003, 53004, 53005, 53006, 53008 (all taken 0) |
| takeseat armed | 5/8 | 5/8 | — |
| darkwit baseline | 3/8 | **0/8** | 53201, 53203, 53205 (all taken 0) |
| darkwit armed | 5/8 | 5/8 | — |
| feareddoor baseline | 6/12 | 5/12 | 53210 (taken 0) |
| feareddoor armed | 6/12 | 5/12 | 53210 (taken 0) |
| doorwalk both legs | 5/8 | 5/8 | — |

No taken seat was lost anywhere: every diff is a priced row with
`seatTaken` 0. Note the takeseat baseline leg ran with the sit gate
OFF, so its "5 seats" could never have been sits — the analyzer was
counting priced seats on a leg where sitting was disabled.

**No historical verdict is overturned.** The takeseat evidence already
distinguished "earned" (priced, 5/8 baseline) from "sat" (taken, 0/8
baseline), and its GO bar was judged on sits (5/8 armed vs 0/8
baseline, both from `takeseatStats`) — those numbers are unchanged.
Feareddoor likewise reported "earned 6/12, sat 5/12". What changes is
the FIELD's meaning: `finalSeat` now means taken; arms that need the
"earned" reading must read `finalSeatPriced` (new corpora) or the raw
priced seat (old corpora). Future arms can no longer mistake one for
the other.

### (a) Flipsocial compare (existing panels, re-compared)

| policy | invited (raw `row.table`) | sittings (ruling 665) | judged `table` metric |
|---|---|---|---|
| winseek | **7/8 → 5/8** | 0/8 → 0/8 | 0 → 0 (unchanged) |
| socialite | **0/8 → 0/8** | 0/8 → 0/8 | 0 → 0 (unchanged) |

The compare now prints, under each policy: "Table reach (raw, display
only — not the judged metric): invitations observed 7/8 before → 5/8
after; sittings (ruling 665) 0/8 → 0/8. The raw row.table flag is the
invitation, not the sitting — a village can reach the table and never
sit." Socialite never even gets invited on either leg — the reach line
says so plainly instead of hiding it behind the 0/8 sittings. Decision
unchanged (`review_required`); every judged metric byte-identical to
the recorded `panel-flipsocial-b/compare.json`; contract digest
unchanged.

## Proof

`scripts/test-sitmetric-b.js` — **34/34 PASS**: helper fixtures (10),
fightloop corpus cases incl. the 16-row invariant (6), flipsocial
compare legs incl. judged-metrics-identical-to-recorded (9),
instrument finalize on a fake Game — untaken → 'none' with priced
kept, taken via verb, taken via daily `tableDone`, taken at finalize
time (4 + 3 field checks) — and a one-seed live leg (53006, staged,
150d horizon) proving the new finalize fields consistent on real game
state. The live leg's village dies village-lost at day 122 on current
master (death-aware stop, clean); the test asserts field consistency,
not a trajectory pin.

## Regression results

Panel/compare suites (prereg bar 3) — all green at the recorded counts:
- `scripts/godpath/test-balance-scorecard.js`: 35/35 PASS.
- `scripts/godpath/test-panel-contract-rulings.js`: 9/9 PASS.
- `scripts/test-comparecontract-a.js`: 25/25 PASS.
- `scripts/test-flippanel-b.js`: 25/31 PASS — exactly the recorded
  count; the 6 failures ARE the recorded NO-GO verdict, not tooling
  failures.
- `scripts/test-flipsocial-b.js`: 38/50 PASS — exactly the recorded
  count; the 12 failures are the recorded verdict bars.

Analyzer suites for the touched analyzers — all green:
doorwalk 30 checks, takeseat 23, feareddoor 33, darkwit 23, trialcombat
38, witnessdoor 33, sitstep2 30/30, feastdrive-panels 19/19,
feaststopspend 25/25, pairoverlap (exit 0), pairoverlap-rate 20/20,
combatdiv 22/22.
- `scripts/test-sitstep-20261107.js`: 21/23 — the 2 failures are
  pre-existing trajectory pins from an older base (`live-53006-runs`:
  days 122 vs pinned 150; `live-53006-determinism`: pairDays 1 vs 51,
  standing 270 vs 415), NOT this change: the finalize change runs
  after `runDays` and cannot move days/pairDays/standing, and an
  independent no-instrument probe (plain staged policy, seed 53006)
  also ends village-lost at day 122 on this base. The finalize-
  dependent checks in that suite (`live-53006-final-seat`,
  `live-53006-sit-counted`, fake-finalize) all pass.
- `check.js --quick`: two full runs — run 1: 294 passed, 6 failed
  (508s); run 2: 291 passed, 9 failed (957s; the +3 are 120s-timeout
  kills on slow tests under 4-parallel load — counts differ run to
  run, i.e. load flake, not a code signal). The 6 failures stable
  across both runs were: the 2 measurement-proof tests (caused by
  THIS change — the scorecard edit invalidated the retained proof;
  FIXED by the refresh above, both now 9/9 standalone), plus 4
  pre-existing failures unrelated to this diff (verified by
  file-scope: none of them reads any file this run changed, and
  their failure modes are in untouched game/UI code):
  `test-occupation-panels` (the test's own observer-copy list omits
  `lib/luck-instrument.js`, which `balance-panel.js` requires —
  `MODULE_NOT_FOUND` before any of this run's code executes),
  `test-phone-frame-proof` (retained phone receipt stale vs
  `index.html`), `test-mobile-combat-cadence` ("Continue does not wrap
  the announced round a second time"), `test-establishment-r20-fixes`
  (racks-full voice gating in game code). No full third re-run was
  done after the refresh; the two fixed tests pass standalone (9/9
  each) and the remaining failures are pre-existing by the mechanisms
  above.

## Wall numbers (this run's judged panels)

No new sims: nothing moves. Flipsocial panels as recorded: national
0/8 both legs both columns, table sits 0/8, wins 0/8; wave-5 reach
socialite 1/8 both legs, winseek 0/8. The measurement fix changes how
the seat is REPORTED, not what any village did.

## Metric review

- The primary metric (the two known cases read correctly) held and
  discriminated: 53004 reads 'none' with taken 0, the flipsocial
  compare shows reach and sittings side by side, and the judged
  values did not move. No re-scoring was available or used.
- The fix deliberately keeps BOTH readings visible (`finalSeat` =
  taken, `finalSeatPriced` = priced; compare shows invited AND
  sittings) rather than deleting the priced reading — the priced
  reading is a real quantity (the "earned" bar the takeseat arm
  judged its substrate sanity on), it was only ever wrong as a SIT
  count. Deleting it would have hidden the substrate-sanity signal.
- Open for the next run (not re-scoped here): the sweep-corpus path
  (`compareSweepCorpora`) uses the raw `row.table` flag AS the judged
  `table` metric — the same side-by-side treatment is owed there, and
  the prereg's metric-review note records it rather than this run
  changing it. Also owed: a dated CORRECTION note is NOT needed for
  the takeseat/feareddoor evidence files, because those files already
  distinguished earned from sat and their verdicts stand — but any
  future reader re-running those analyzers will now see the aligned
  seat counts (takeseat baseline 0/8, feareddoor 5/12), which match
  the sat columns those files already printed.
- The test-sitstep live pins (pairDays 51, standing 415, 150d) are
  stale on current master (53006 staged now dies day 122): that
  suite's live leg needs re-pinning by its owner, not by this arm.

## Village assessment in plain words

No new villages were simulated — this run fixed the ruler, not the
village. What it found while measuring the ruler: villages were
already telling the truth in the sit counters (taken 0 where nothing
was taken); it was the headline field that lied, calling a priced
seat a sat one. The most misleading case was a whole baseline leg —
the takeseat baseline, with sitting switched off — reported as
holding five seats. Nobody sat anywhere in that leg. From now on the
headline field only counts sittings, and the priced seat is kept next
to it where anyone can see both.

## Blanks filled or documented

- FILLED (measured): the §15 compare surfaces raw table invitations
  alongside ruling-665 sittings, on the flipsocial corpora and
  generally (winseek 7/8 → 5/8 vs sittings 0/8; socialite 0/8 vs 0/8).
- FILLED (measured): the observer-neutral maintenance proof
  refreshed for the changed collector input (fresh real panel, seed
  7, 4 policies, 150d; `balance-proof.json` re-pointed; both
  measurement tests 9/9).
- FILLED (measured): `finalSeat` aligned with `seatTaken` at the
  instrument and in 11 analyzers; the 53004 case and the wider
  priced-but-untaken rows (takeseat baseline 5, darkwit baseline 3,
  feareddoor 53210) now read 'none'.
- DOCUMENTED (not built): the sweep-corpus compare path still judges
  `table` as the raw `row.table` flag — the side-by-side treatment
  is owed there (see Metric review).
- DOCUMENTED (not built): `test-sitstep-20261107.js` live pins are
  stale on current master (53006 staged dies day 122) — re-pinning
  belongs to that suite's owner.

## Convergence

scale-onramp stays converging (NOT converged): the metric gap is
closed, but the underlying picture is unchanged — the full seat is
still unreached, wins still come only through the lesser seat, and
the flipsocial columns still sit 0/8. food-economy stays converging
(untouched). No src/js change; nothing held unlanded.
