# sim-sitmetric-b — PRE-REGISTRATION (binding, §14)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0130Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-sitmetric-b, branch sim-sitmetric-b.
Base: master `6e69df4ef`. Scope: MEASUREMENT FIX only — scripts/ (recorder,
analyzer, compare). NO src/js game-code change while the ladder-leg4 build
is live in the same area; if an src/js change proves necessary it is HELD
unlanded and reported as owed with proof.

## The gap (known cases, from the brief — not new judgments)

(a) §15 compare hides the reached-but-never-sat divergence. On the
flipsocial panel corpora the raw harness flag `row.table` reads 7/8
collapsed → 5/8 healed on winseek while the panel `table` metric
(ruling 665: sittings = `row.entered`) reads 0/8 on both legs. The
compare shows only the judged metric, so the divergence is invisible
in the judged output.
(b) `finalSeat` prices a seat never taken. Seed 53004 (fightloop
baseline corpus, `perseed-fightloop-b-baseline/combatdiv-b-s53004-*`):
`finalSeat` "lesser" with `takeseatStats.seatTaken` 0. Root cause
already located (read-only inspection): `scripts/sitstep-instrument-20261107.js`
`finalize()` stores `Game.tableSeat()` — the seat the table would
price at end of run — as `finalSeat`, regardless of whether any seat
was taken. Every analyzer that counts `finalSeat !== 'none'` as a sit
re-trips the same misread.

Honest definitions (verified in code before writing this header):
- `row.table` (panel/sweep rows) = INVITATION ever observed
  (`tableWaiting` ever set; `scripts/sweep-compare.js:236-237`), NOT
  "reached the table" in any stronger sense.
- `row.entered` = sat (`pg.tableDone` ever set; sweep-compare.js:238).
- `Game.tableTakeSeat()` returns `{ok: committed}` where
  `committed = !!progState().tableDone` (`src/js/table.js:1306-1321`):
  a successful sit sets `tableDone`. The instrument already records
  every `tableTakeSeat` call with its `ok` (`t.sitAttempts`) and
  `tableDone` on every daily snapshot — so "seat taken" is
  instrument-owned and needs no src/js change and no policy-module
  dependency.

## Primary metric

The two known cases read correctly after the fix. GO threshold — ALL
three must hold, judged exactly as written:

1. Seed 53004 (fightloop baseline corpus, re-read through the fixed
   reporting path): `finalSeat` no longer prices an untaken seat —
   reads `none` / not-taken, with `seatTaken` 0 shown alongside.
   The candidate leg (53004, `finalSeat` "none", `seatTaken` 0) must
   read identically (no change where the seat was already "none").
2. Flipsocial panel corpora (existing `panel-flipsocial-b/before|after`
   panels, re-compared through the fixed compare): the compare shows
   the raw invitation flag (7/8 → 5/8 on winseek; socialite leg read
   alongside) AND the ruling-665 sittings (0/8 on both legs) side by
   side, in both the compare `.json` and the compare `.md`. The
   judged `table` metric values themselves must NOT change (0/8 both
   legs, ruling 665 untouched).
3. No regression in the existing panel/compare test suites:
   `scripts/godpath/test-balance-scorecard.js`,
   `scripts/godpath/test-panel-contract-rulings.js`,
   `scripts/test-comparecontract-a.js`,
   `scripts/test-flippanel-b.js`, `scripts/test-flipsocial-b.js`
   all green on this branch after the change (same pass counts as on
   the base where those suites are deterministic; any failure is a
   regression, not a re-score). The contract digest must be unchanged
   (`scripts/balance-metrics.json` untouched — no new judged metric,
   no tolerance/direction change; the reach line is display only and
   never enters the decision).

## Method

- Reuse the existing corpora (`perseed-fightloop-b-*`,
  `panel-flipsocial-b/before|after`). No new sweep unless the proof
  below requires one.
- Fix (a): in `scripts/lib/balance-scorecard.js` `comparePanels`
  (panel path only), attach a per-policy raw-invitation summary
  computed from `r.row.table` (before/after counts + n) and render it
  in `markdown()` next to the judged `table` metric. Decision logic,
  contract, and judged metric values untouched.
- Fix (b): in `scripts/sitstep-instrument-20261107.js` `finalize()`,
  gate the reported `finalSeat` on an actually-taken seat
  (`ever tableDone` across the instrument's own daily snapshots, or
  a successful recorded `tableTakeSeat` call, or `tableDone` at
  finalize); keep the priced seat visible as new field
  `finalSeatPriced` and the taken flag as `seatTaken`, so the
  priced-vs-taken divergence stays auditable instead of hidden.
  Add a shared helper `scripts/lib/seat-taken.js` (`alignedSeat(row)`)
  applying the same rule to already-written per-seed rows (old
  corpora keep their priced `finalSeat`; the analyzer reads the
  aligned value), and update the seat-counting analyzers that read
  `finalSeat` to use it (combatdiv analyzer first — the 53004 case —
  then the doorwalk-family analyzers; any analyzer left un-updated is
  listed as owed in the evidence file, not silently skipped).
- Proof: `scripts/test-sitmetric-b.js` — known-case fixtures for
  53004 (both legs) and the flipsocial rows; regression legs for the
  existing compare behavior (judged `table` values unchanged,
  contract digest unchanged, compare decision unchanged on the
  flipsocial corpora). If the instrument fix needs a live proof, a
  small pilot (≤8 seeds, one policy leg) on current master; no more.
- Re-run each touched analyzer on its existing corpus read-only and
  diff the output: the ONLY permitted changes are seat counts dropping
  on untaken-seat rows.

## Guardrails

- `scripts/balance-metrics.json` untouched. Ruling 665 untouched:
  the panel `table` metric still counts sittings only.
- No `src/js` change in this run. No push, no version bump, no live
  verification — report "done, pending coordinator landing".
- A miss on any of bars (1)–(3) is NO-GO, never re-scored (§14).
  A metric that proves wrong goes under "metric review" for the NEXT
  run.

## Metric review (pre-run note)

The two metrics being fixed were both "priced/offered" readings
presented as "taken" readings. After this fix the judged outputs
carry BOTH readings side by side (invited vs sat; priced vs taken),
so a future arm can no longer mistake one for the other. The open
question for the next run is whether the sweep-corpus path
(`compareSweepCorpora`, where the `table` metric already IS the raw
`row.table` flag) needs the same side-by-side treatment — this run
deliberately does NOT change it, and notes it here rather than
re-scoping mid-run.
