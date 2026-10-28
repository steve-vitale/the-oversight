# Loop B round 0231Z (2026-10-28 UTC / 2026-10-27 evening CDT) — axis food-economy — ADOPTION RUN, stranded arm LANDED, merged locally pending ship

## Stale-lock recovery (this run's start, not a new axis choice)

The previous loop-B run (fleshout-loop-b-20261027T2352Z, food-economy,
arms sim-raidcapture-b + sim-refusalprecheck-b) was DEAD by the body's
guard: its only registered tree (sim-refusalprecheck-b) had a heartbeat
of 2026-10-28T01:34:12Z, 55+ minutes stale at the 02:31Z check (guard: 15
minutes). Its lock was deleted and its claim retired to
fleshout-loop-b-20261027T2352Z.json.DEAD. Loop A was live on
scale-onramp at run start (0221Z claim, sim-w4lethality-rebase tree,
heartbeat minutes old) — NOT touched; loop A landed mid-run (0d412bd23)
and deleted its own claim at closeout.

The raidcapture sibling arm had already landed on master
(d40c7cb44 prereg, c7656f644 evidence, 08426122a follow-up) — NOT
redone. This run adopted only the stranded refusalprecheck arm.

## Arm adopted: sim-refusalprecheck-b (blank (3) from the 2150Z review)

In plain words: three ability taps used to take your money (a whole
night) and only then tell you they could not work — no audience to
challenge, no kills to mark. Now they say no before taking anything,
like the five refusals that already worked that way. The tap that
says "you already did this today" still works the old way, on purpose
(see the deviation below), because at the day's last hour that check
depends on which day the payment lands on.

### What landed

- Commits (rebased onto 0d412bd23 after loop A landed; ff-only
  correctly refused the diverged branch): prereg 10e7e45a1, arm
  10ef1e627, merged into master by the coordinator (ancestor
  verified). Zero other src/js files touched: src/js/abilityActions.js
  only (+49 lines, three ABILITY_ACTION_PRECHECKS entries).
- war_cry.challenge and intimidating_presence.end_it_before refuse
  when no audience resolves (explicit target, else an active
  conversation partner on the roster, not the scholar's own
  villager). trophy_room.mark refuses when villageSlain has no type
  with a count above zero. The checks mirror the impl CODE, not the
  narration: no liveness check, no target-type validation — both
  deliberate, per the prereg, so no tap the impl accepts is refused.
  No impl text, cost, dedup, or ledger changes.

### Verdict: GO on the narrowed scope — NOT a clean prereg GO

- Leg (a) world-state refusal timing — GO: 24/24 prereg instances
  (R1/R2/R3 x 8 pilot seeds 9981–9988) refuse pre-payment: day
  unchanged, ticks unchanged, kcal unchanged, result false, refusal
  sentence present. Before, the same taps crossed day 1→2, ticks
  509/507→0, kcal 5000→2360. Self-target R11 also 8/8. Buttons for
  R1/R3 now read disabled, as intended.
- Leg (b) success invariance — GO: before/after diff over all 112
  pilot rows — 32 rows identical (R6/R7/R8/R12 successes); 80 moved,
  all explained (32 intended refusal changes + 48 button-disabled
  read-only availOk flips from probing _actionAvailable with
  target=null and cleared conversation; actual taps with an explicit
  target or live conversation partner behave identically). Success
  narration, day crossing, kcal, and flags byte-identical. One
  disclosed wrinkle: R3's refusal line gains the standard
  " (Mark Trophy)" wrapper; reason text identical.
- Leg (c) policy det-gate — GO, both instruments: competent only,
  seeds 9981–9988, 60d death-aware, no COMPETENT_* overrides.
  Sweep-compare before/after per-seed rows identical on every field
  except the run-label string. Balance panel built + validated on
  both roots; compare decision verbatim: "review_required" — that
  label is NOT movement: every paired metric delta is exactly 0
  (win 0→0, table entry 0→0, national 0→0, player deaths
  1.125→1.125, community loss 0.125→0.125, all 26 rows). The panel
  marks review_required whenever descriptive/insufficient/
  not_observed metrics exist by contract, regardless of delta.
- Confirm band — GO: fresh seeds 9991–10002, assert mode PASS,
  168/168 fixtures, exit 0 (direct exit-code capture).
- Proof on the rebased branch and on merged master: pilot assert
  exit 0 (112/112), node --check on abilityActions.js clean. No jest
  run (no jest-eligible change surface beyond the fixture proof;
  no green claim made).

### Metric review — the prereg deviation, disclosed not hidden

The prereg said the once-a-day refusals would also move
pre-payment. The dead worker's test script already narrowed the
scope to world-state conditions only, and the adoption worker
confirmed the reason empirically BEFORE any game change: on
unmodified code, boundary once-a-day taps (R9/R10) SUCCEED on all
8 seeds (result true, day 1→2, flag 1→2) — payment rolls the day
before the impl checks the flag, so the tap belongs to the new
day. A naive precheck (flag === current day) would refuse taps
the impl accepts: a success-path regression under prereg leg (b).
So once-a-day stays post-payment in full, pinned by R13/R14
(non-boundary: ticks 100→103, kcal 5000→4960 including the silent
40 kcal tier burn, sentence present). Leg (a) as written therefore
cannot pass for the once-a-day case at the boundary, and this arm
is NOT reported as a clean prereg GO. The residual is a named next
blank needing its own day-roll-aware rule + prereg — not a silent
failure. Also disclosed: the dead worker's assert expected
success-fixture flags to equal dayBefore; the baseline proves the
impl stamps the post-payment day (flag undefined→2). Fixed to
expect the new day, matching the script's own R9/R10 logic; no
judged outcome changed (flag values identical before/after).

### Sense read (plain words)

Seed 9981, R1, same key before vs after. BEFORE, the refusal
sentence came last after 22 lines of a whole night — bank burn,
village meal, villagers returning with food, someone hurt, couples
by the fire, a technique learned, dawn — then "talk to them
first." The player paid a night to be told nobody was there.
AFTER: one line, nothing taken — a reason given, no night, no
food, no day. It reads as a refusal now, not a receipt for a
wasted night.

### Wall numbers (judged policy band only)

National 0/8, table 0/8, wins 0/8, wave 4–5 reach 0/8 (max wave 3),
median survival 60d at cap (7/8 survived to cap; seed 9983
village-lost day 12). Probe fixtures carry no wall numbers and
none were estimated. The scale wall is untouched by this axis, as
expected for a refusal-timing fix.

### Telemetry deviation check (coordinator, on merged master)

`telemetry-check.js --baseline scale-wall.json --current
'evidence/2026-10-27/sim-refusalprecheck-b-corpus/detgate-after.json'
--metrics national,table,wins,exiled` → 3 LOUD lines (national
12→0, table 16→0, wins 16→0, n=1 file). Verdict: KNOWN ARTIFACT,
baseline NOT rolled — (a) WINSEAT baseline vs a competent 60d
det-gate band that expects 0 reach by design (before/after
identical); (b) single-file det-gate JSON, not per-seed rows.
No exiled LOUD line. Panel exception stands (no corpus-ingest
mode for fixture corpora; panel covered leg (c) only).

### Infrastructure

- Rebase: branch rebased clean in its own worktree onto
  0d412bd23 (loop A's landed 0221Z round); proof re-run green
  after rebase and on merged master (112/112). Never rebased in
  the main tree.
- Safe-commit index clobber hit the worker commit (bogus staged
  deletions on byte-identical files) — repaired via HEAD-blob
  cacheinfo, commit verified correct before merge.
- Uncommitted leftovers at worker closeout, all resolved without
  loss: (1) dead worker's 40 spandraw before-files — verified
  byte-identical (40/40) to files already on master in
  sim-spandraw-design-b-corpus, so discarding them on release
  loses nothing; (2) dead worker's before-fixtures.json (112-row
  before dump) — duplicated by the committed before-adopt.json
  (112/112 match per the worker) AND preserved by the coordinator
  at hidden_files/dead-run-evidence/
  sim-refusalprecheck-b-before-fixtures-20261027T2352Z.json;
  (3) panel case caches (dead + this run) — never committed per
  §15; results preserved in panel.json.gz + panels-compare.
- No EPERM flap blocked this run. No push, no bump, no live
  verification (ship-loop line). Main tree clean at closeout.

## Backlog (appended by the worker, kept here for the next run)

- Once-a-day residual: needs a day-roll-aware precheck rule + its
  own prereg; do NOT extend this arm's prechecks without one.
- Impl/narration liveness gap: impl narrations say a challenge /
  posture target must be "here, alive, and one of yours", but the
  code checks roster + not-self only. If that gap matters it is a
  separate finding, not something this arm widened.

food-economy stays converging (NOT converged): a real
refusal-timing fix has now landed as game code, but the
once-a-day residual is open and the scale wall is untouched by
this axis. scale-onramp stays converging (untouched except for
loop A's own landed round; see its 0221Z review). Claim deleted;
lock deleted at closeout. Merged locally, pending ship.

Next blanks, in order: (1) the once-a-day day-roll-aware rule
(own prereg); (2) cultivate fresh-setup hall gate (2150Z blank
(4), still open); (3) zero-record outflow path accounting (2150Z
blank (5), still open).
