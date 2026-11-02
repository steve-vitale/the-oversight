# sim-heralddepart-a — PREREG (committed BEFORE any judged sim in this arm)

Arm: herald world-list departure audit, axis scale-onramp, blank #1
from sim-laircontact-a (Loop A 20261102). DIAGNOSIS ONLY. Zero
src/js changes. Commit scope: new driver/analyzer scripts under
scripts/ plus evidence files. Ready-for-coordinator-merge only;
no push, no bump, no live verification.

## Question (exact, from sim-laircontact-a "Next blanks #1")

Why does the herald leave worldMonsters the day after a
co-location day with no fight (97400 closecommit d69+, after
co-located d68 with zero attempts; fed-97338 d87+, after
co-located d86 with zero attempts) and the day after refused
attempts (noise-97338 d85+, after attempts d84), while staying
for weeks after refusals elsewhere (97405 through d161)?
Instrument: daily trace WITH detail coords (scholar mx/my +
herald mx/my) + monster-turn bump conditions + titan outcome
records, so a missed bump day can be classified as "herald left"
vs "herald never arrived" vs "detail cells differed".

## Canon read before writing this prereg

- docs/CANON.md first, then docs/MONSTER-WAVES.md: the waves doc
  carries wave law only — it has NO herald/titan departure rule
  (only a passing wave-6 heralds note). No canon doc covers the
  herald departure rule; the mechanism below is therefore read
  from code (game.js monsterTurn / removeWorldMonster callers,
  titans.js) and settled from traces, not invented from canon.
  Titan canon that DOES exist: titans.js header — a titan is a
  flag, never just HP; titans never wander (they arrive by omen
  only); victory removes the world monster (titanVictory).
- docs/MEASUREMENT.md §§9-12, 14-15: staged pilot gate, death-
  aware horizons, prereg binding, balanced-panel note (panel
  does not apply to this diagnosis for the same stated reason
  as laircontact-a: it cannot ingest this driver's records or
  run the closecommit stack; the comparison here is identical-
  seed arms + byte-identical determinism, pinned by proof test).

## Missed-bump day (definition, fixed before any sim)

A post-call day D (callDay <= D <= run end) on which ALL hold:
  (a) the scholar ENDS day D on the lair tile (day-end trace:
      scholarTile == lairTile, lair from the "Scouts found its
      lair" line);
  (b) ZERO herald startCombat attempts are recorded on day D
      (attempt rows, mid herald, day == D).
Days before the call, days the scholar does not end on the lair
tile, and days with >= 1 attempt are NOT missed-bump days.
Days on which the scholar ends on the lair tile but the herald
was never placed yet cannot occur in this stack (the march
targets the lair only after location) — if any appear, they are
reported as a separate row, not silently folded in.

## Classification (per missed-bump day, from DAY-END positions)

- HEROLD-LEFT: herald absent from worldMonsters at day-end D.
- NEVER-ARRIVED: herald present at day-end D, tile != scholar tile.
- DETAIL-DIFFERED: herald present at day-end D, same tile as the
  scholar, detail cell (mx,my) != scholar detail cell. Sub-note
  recorded separately: scholar cell inside the herald's 3x3
  block (herald size 3) but not the exact cell — still
  DETAIL-DIFFERED by the bump rule (monsterTurn bumps on exact
  mx/my equality), flagged as DETAIL-DIFFERED (in-block).
- MATCHED-NO-BUMP (residual, NOT one of the three named
  classes): same tile AND exact detail cell at day-end, zero
  attempts that day. Any such day is reported by seed/day with
  its monster-turn rows; it falsifies "day-end match implies a
  bump that day" and must be explained from the turn rows
  (e.g. monsterTurn never fired, sleeping/haven-watch early
  return, table sanctity) or left as an open mechanism gap.

For every HEROLD-LEFT day, the removal sub-class comes from the
removal event recorded by the instrument (see below), not from
day-end positions: LOST-SIGHT (monsterTurn lostSight > 6
removal), VILLAGER-KILL (field/patrol/sortie vKill removal),
FEARFUL-FLEE (fearful edge-crossing removal), FIGHT-START
(startCombat/tbEnd removal path), OTHER (named stackTop), or
UNKNOWN (no removal event captured while the herald vanished
between day-end snapshots — an instrument gap, counted against
the GO bar).

## Instrument (new, this arm)

scripts/heralddepart-driver-20261102.js — laircontact stack
(closecommit base; musterfed / lairnoise legs where named) plus:
  (1) day-end trace WITH detail coords: scholar (tile + mx/my),
      herald (tile + mx/my, size, hp), lair tile, co-located
      tile flag, detail-match-exact flag, detail-in-block flag,
      gate, titan outcomes snapshot (state.titans.outcomes copy),
      titan muster presence;
  (2) monsterTurn hook (read-only, zero RNG draws, zero game
      writes): before/after each monsterTurn while the herald is
      present AND (scholar tile == herald tile OR scholar on
      lair tile) — scholar/herald tile+detail, herald lostSight,
      stance, canSee(scholar) + canSee(nearest villager target)
      as pure reads, chebyshev detail distance, attempts delta,
      removal delta;
  (3) removeWorldMonster hook (read-only): every removal of the
      herald — day, monster-turn index, caller stackTop,
      herald/scholar tile+detail before removal, lostSight,
      stance, fledMonsters entry if any, say-lines emitted
      during the call (the lost-sight line, if any);
  (4) startCombat attempt rows via the existing herald
      instrument (HI), plus tbOutcomes from HI.
Output: evidence/2026-11-02/perseed-heralddepart-a/hd-<arm>-
s<seed>-<run>.json per run. Analyzer:
scripts/heralddepart-analyze-20261102.js — builds the
missed-bump classification table from the per-seed JSONs
(no re-simulation, no hand counts).

## Primary metric + GO threshold (BINDING, §14)

Primary metric: classification coverage = (missed-bump days
assigned to HEROLD-LEFT / NEVER-ARRIVED / DETAIL-DIFFERED)
divided by (all missed-bump days in the corpus), where a
HEROLD-LEFT day counts as assigned ONLY if its removal event
was captured with a named mechanism (LOST-SIGHT /
VILLAGER-KILL / FEARFUL-FLEE / FIGHT-START / OTHER-named);
UNKNOWN-removal left days count as UNASSIGNED.

GO (DIAG-GO) requires BOTH:
  (1) coverage >= 0.95 across the corpus; AND
  (2) all three known departure cases reproduce with a NAMED
      removal mechanism (not UNKNOWN): 97400 closecommit
      (departure d69), 97338 musterfed (departure d87),
      97338 lairnoise (departure d85). "Departure day" = first
      day-end with the herald absent after a day-end present.
A miss on either leg is DIAG-NO-GO, never re-scored. Metric
doubts go under "metric review" in the evidence file, for the
NEXT run.

Secondary (reported, never judged): counts per class; counts
per removal mechanism; MATCHED-NO-BUMP days (any count > 0 is
a finding, reported with turn rows, and blocks a "mechanism
settled" claim for that seed even if the coverage bar passes —
recorded as a caveat on the verdict, not a re-score); stay-case
97405 closecommit (herald present through run end or to
village-loss with no departure — the contrast case).

## Horizon + why (§10)

180 days, death-aware (runDays stop rule + at most +10d tail),
same as laircontact-a: reachability lever, wave-4 content; the
known departures fall on d69/d85/d87 and the stay case runs to
d161+, so a shorter horizon would cut the contrast case. Dead
villages stop simulating; no fixed-200d ticking of corpses.

## Seeds + policies (exact)

Corpus (each run = one process, one seed, one arm; determinism
repeat excluded from the corpus):
  Departure cases (reproduction, 3 runs):
    - 97400 closecommit
    - 97338 musterfed
    - 97338 lairnoise
  Stay case (contrast, 1 run):
    - 97405 closecommit
  Pilot band (8 seeds, closecommit only — the laircontact band,
  baseline-attempt-positive on current master; band reuse across
  lanes disclosed: these 8 seeds were the laircontact-a band,
  re-run here under the NEW instrument, not re-cited from the
  old records):
    - 97405, 97420, 97432, 97433, 97435, 97412, 97418, 97426
    (97405 appears in both stay case and band with the same arm
    — run ONCE, counted once.)
  Total judged runs: 11 (8 band + 3 departure extras).
  Determinism gate (before judging, not in corpus): 97400
  closecommit r1 == r2 on summary fields (call day, departure
  day, attempt days, missed-bump classes per day, removal
  mechanism) — full-JSON equality minus run label, as in
  laircontact-a. If the gate fails, the instrument is fixed
  and the gate re-run; no corpus run is judged until it passes.
Env (same as laircontact-a): FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1.
Policies: closecommit stack = tribfloor + windefer + seatdrive
+ fullseat-diag + titanroute + musterclose + mustergap;
musterfed / lairnoise legs as in laircontact-a. No new policy
is introduced by this arm (diagnosis only).

## Guardrails

- Zero src/js changes. If a removal mechanism turns out to need
  a game-code fix, this arm DOCUMENTS it as the next blank; it
  does not land it.
- won/table/national flags from this diagnosis substrate are
  NOT cited as reach (laircontact-a metric review: those flags
  are non-specific on this substrate).
- Panel note: no balance-panel compare .md is attached, for
  the stated reason above (panel cannot ingest these records
  or run this stack). Same position as laircontact-a and the
  prior diag arms.
- If the corpus contains zero missed-bump days (it cannot on
  the known cases, which already show them in old records, but
  stated for completeness), the verdict is DIAG-NO-GO
  (instrument failed to reproduce the phenomenon), not a
  vacuous GO.
