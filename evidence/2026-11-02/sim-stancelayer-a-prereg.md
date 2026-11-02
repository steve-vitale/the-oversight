# sim-stancelayer-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0915Z, arm sim-stancelayer-a, axis scale-onramp.
Worktree branch: sim-stancelayer-a, based at current master a9b63b88
(post-locatedengage; locatedengage commit 38b8e1666 is an ancestor).
POLICY/INSTRUMENT SIDE ONLY — zero `src/js` changes planned; no
sound/defer/stand-down/muster intervention, no game-code change, no
new policy behavior. This is a DIAGNOSIS arm: the sibling arm
(sim-titanroute-a) builds the march policy in its own tree; this
arm must stand alone on master and must NOT depend on its unmerged
code. Sibling Loop B trees/branches NOT touched. No titan canon
doc exists in docs/ — stated, none invented (same finding as
0445Z, 0605Z, 0725Z, 0815Z); the in-code sources are
`src/js/titans.js` + `src/data/titans.json` + `src/js/havenGrowth.js`
+ the stance machine in `src/js/game.js` (`monsterTurn`,
`stanceFor`, `playerMonster`).

## Canon / code read (before any sim)

docs/CANON.md first, then docs/MONSTER-WAVES.md (wave law) for
context. The stance layer, read from code (function names, not
line numbers — lines drift daily):

- `monsterTurn` (game.js): runs per scholar detail-grid step
  (microMove), per interact (cellInteract), per wait batch, per
  searchRoom/examineCell — NOT per travelTo jump, NOT at dawn,
  NOT during sleep except through the tick machinery it guards.
  Early returns, in order: sleep-at-haven-tier>=2 guard
  (`_sleeping` + map tile = haven tile + `havenTier() >= 2`);
  `playerMonster()` null or `mx` undefined (tile not shared);
  `tableActive()`; glasswing trap; hummice sonar (not herald).
  Then line-of-sight: if neither scholar nor nearest villager is
  visible (`canSee`), `lostSight++`, random drift, despawn at
  `lostSight > 6` — no stance progress on blind turns.
- `stanceFor` (game.js): herald data (monsters.json) has
  `behavior` = prose ("It announces. Every move is an omen
  first...") matching NO stanceFor branch (ambush / curious /
  drifter / territorial / pack / swarm / gallowdeer), so the
  herald's initial stance falls through to `curious`.
- `monsterTurn` curious branch: if Chebyshev detail distance
  `dist > 3`, `stepToward()` one cell (no watch progress); else
  `watchTurns++`, and at `watchTurns >= 3` stance becomes
  `hungry` (watchTurns reset). Curious NEVER steps while
  watching (dist <= 3) and NEVER watches while far (dist > 3).
- `monsterTurn` hungry branch: `stepToward()` one cell, then
  `startCombat(m.id)` iff detail cells coincide. Default branch
  (any other stance value): same step-then-coincide rule.
- `travelTo` (game.js): a tile JUMP — it does NOT call
  `monsterTurn`. It calls `checkEncounter()` (wander tick, not
  the stance machine) and, on leaving a tile, the follow branch
  (game.js, `travelTo` follow: truthy `mdef.follows` re-places
  the follower's detail cells on the new tile). A travelTo hop
  onto the herald's tile therefore produces ZERO stance-machine
  turns by itself; only subsequent detail-grid steps, interacts,
  or waits on that tile run `monsterTurn`.

## Question (the stance-layer half of the 0815Z finding)

Prior arm sim-locatedengage-a (evidence/2026-11-02/
sim-locatedengage-a.md, corpus perseed-locatedengage-a/) proved
the two-layer engagement mechanism and left this blank: what,
beyond tile arrival, must happen before an attempt fires?

RECONCILIATION (pre-registered correction to this arm's brief):
the brief's shorthand "stepping onto the lair tile alone produced
zero attempts on days 73/85/87" is imprecise, and this arm does
NOT repeat it as fact. The 0815Z corpus (le-s97301.json) shows
those three days' steps landed the scholar on the herald's
CURRENT tile (5,4) via forageTripSeedFirst, NOT on the lair tile
(8,4): day 73 herald (5,4), day 85 herald (5,4), day 87 herald
(5,4) at step time, while the lair (parsed from the lair line)
is (8,4) and no travel event in the window targets (8,4). The
days come from seed 97301, arm sim-locatedengage-a (0815Z), NOT
from 97307 (which never shared a tile at all). The judged
question is therefore: why did stepping onto the herald's tile
on 97301 days 73/85/87 produce zero attempts, while sharing at
the morning snapshot on days 78/89 produced attempts — and what
does that imply for any march policy that arrives on a titan's
tile? The lair tile itself is never stepped on in the window;
a march policy's arrival tile is the herald's CURRENT tile, and
its requirements must be stated for that tile.

## DISCLOSED REUSE (never band evidence)

Seed 97301 is the 0725Z pilot contrast seed, re-traced by 0815Z
and re-traced here with the stance instrument. It is NOT a fresh
band; its numbers are NEVER pooled and NEVER presented as band
evidence. The 0815Z corpus is the cross-check for
reproducibility (milestones and attempt days must match), not a
sample to add to. Seed 97307 is run ONLY as a reproducibility
cross-check (it has no step days and is not judged for gates);
if it diverges from 0815Z, the divergence is reported, not
averaged away.

## Instrument (extends the locatedengage replay, intervention none)

`scripts/stancelayer-replay-20261102.js` — the locatedengage
replay (SAME frozen policy stack, env flags, herald-v1
instrument, DAYS=180 death-aware cap) plus the stance layer.
Behavior additions, all pre-registered here:

1. MONSTERTURN WRAP (read-only): every `Game.monsterTurn` call
   is bracketed. A call row is recorded ONLY when the herald is
   the `playerMonster()` (tile-shared) before the call — other
   calls cannot act on the herald and are counted only as a
   per-day total of shared calls. Each row: day, `_sleeping`
   flag, `havenTier()` (guarded), pre/post stance, watchTurns,
   cautiousTurns, warnTurns, turns, lostSight, pre/post scholar
   detail cells, pre/post herald detail cells, pre/post
   Chebyshev detail distance, pre/post coincidence flag,
   still-shared flag after, and attempt delta (herald attempt
   rows appended during the call, via the existing herald-v1
   instrument + startCombat interceptor). The wrap consumes no
   RNG and writes no game state.
2. ARRIVAL ROWS: the travelTo wrap is extended — whenever a
   travelTo lands the scholar on the herald's CURRENT tile, an
   arrival row records day, tile, scholar detail entry cell,
   herald detail cells, Chebyshev detail distance, stance,
   watchTurns, lostSight at arrival, before any monsterTurn
   runs on that tile. This is the state a march policy must
   start from.
3. TRACE ROWS extended (pre/post daily): herald watchTurns,
   lostSight, detail-coincidence flag (scholar detail ==
   herald detail), havenTier, `_sleeping` flag. All other
   locatedengage trace fields unchanged.
4. UNCHANGED: anchored say capture, lair parse, travelTo route
   logging, readiness interceptor, wall fields. No sound, no
   deferral, no stand-down, no muster-diag.

`scripts/stancelayer-classify.js` (PURE, no game load, no I/O)
derives per-day gate labels from one seed's trace rows +
travel events + arrival rows + monsterTurn call rows + attempt
rows (see Daily labels below). `scripts/test-stancelayer-a.js`
(corpus validator) reproduces the verdict from the corpus
alone, with no game load, and cross-checks the 0815Z milestones
/ attempt days. `scripts/test-stancelayer-classify.js` (unit
proof) runs the classifier on stub traces covering every label
and the decision order. STDOUT-RUNNER PATTERN: the replay
prints one JSON line per seed and writes NOTHING itself; the
splitter runs in a foreground exec, never a backgrounded pipe.

## Policy stack (exact names, frozen from locatedengage)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) recorder. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1. Switching stacks mid-run would break
comparability, so the stack is frozen here.

## Seeds

- 97301: the JUDGED seed. Judged window days 59–91 (placement
  day 59 through end; step days 73/85/87, attempt days 78/89
  expected from 0815Z; the trace's own rows are authoritative).
- 97307: reproducibility cross-check ONLY (0815Z milestones:
  wave4 116, stage2 129, present 129–152, attempts 0, lair 7,4).
  Not judged for gates.

DAYS=180 death-aware cap (same rationale as heraldcontact /
locatedengage).

## Daily labels (decision order — first match wins, per day)

A day is UNCLASSIFIED only if its trace rows are missing —
never as a bucket for "didn't look".

- ATTEMPT — >= 1 herald attempt row that day. Sub-label from
  the pre-daily trace + monsterTurn call rows:
  COINCIDED-AT-DAWN (detail cells already coincided at the
  pre-daily snapshot), CLOSED-IN-DAY (a monsterTurn call row
  that day moved the herald onto the scholar's detail cell and
  the attempt delta fired on that call), else
  ATTEMPT-UNRESOLVED (attempt with no traceable closing call —
  counts against bar (b)).
- STEP_NO_ESCALATION — a travelTo arrival row that day landed
  the scholar on the herald's tile, zero attempts that day.
  Gate sub-label from the day's monsterTurn call rows while
  shared + the exit state (last shared call row, or the
  arrival row if no shared call ran):
  NO_TURN (0 monsterTurn calls while tile-shared — the trip
  hopped in and out by travelTo alone);
  CURIOUS_FAR (stance curious at exit, detail distance > 3 —
  stepping only, never watched);
  CURIOUS_WATCHING (stance curious at exit, watchTurns < 3 —
  watched but the 3-watch threshold never reached);
  HUNGRY_OPEN (stance hungry at exit, detail distance > 0 —
  closing, ran out of shared turns before coincidence);
  BLIND (lostSight rose during the day's shared calls — the
  machine was on the no-sight drift path, not the stance path);
  SLEEP_GUARD (shared calls suppressed by the
  sleep-at-haven-tier>=2 guard) / TABLE_GUARD (table active);
  else GATE-UNRESOLVED (counts against bar (b)).
- SHARED_NO_ESCALATION — tiles shared at pre or post snapshot
  (or a follow/wander produced sharing) with zero attempts and
  no step-arrival that day. Same gate sub-labels as above,
  from the day's shared monsterTurn call rows.
- SCHOLAR_NEAR — min Manhattan tile distance that day <= 3,
  tiles never shared, zero attempts.
- APART — min Manhattan tile distance that day > 3, tiles
  never shared, zero attempts.
- UNCLASSIFIED — trace rows for the day missing entirely.

Seed-level verdict: the day-label sequence for days 59–91,
plus the march-policy requirement list (each requirement tied
to a traced observation) and the morning-snapshot answer:
whether a mid-day arrival can attempt the same day (answered
from whether any attempt day had pre-coincide false and an
in-day closing call, and from the shared-call counts needed on
step days), or must sleep on the tile (answered from whether
sleep itself ever produced a shared monsterTurn call or an
attempt, and from the sleep-guard observations).

## PRIMARY METRIC

Per-day gate coverage of the judged window (days 59–91 on
97301) + gate resolution of every step day and every attempt
day.

## GO (DIAG-GO — all must hold; coordinator-set bars, not softened)

(a) COVERAGE: every day 59–91 on 97301 carries a named daily
    label, 0 UNCLASSIFIED.
(b) GATE-NAMED: each zero-attempt step day (73, 85, 87
    expected; the trace's own arrival rows are authoritative)
    carries a resolved gate sub-label (NO_TURN /
    CURIOUS_FAR / CURIOUS_WATCHING / HUNGRY_OPEN / BLIND /
    SLEEP_GUARD / TABLE_GUARD), 0 GATE-UNRESOLVED; and each
    attempt day carries a resolved step sub-label
    (COINCIDED-AT-DAWN / CLOSED-IN-DAY), 0 ATTEMPT-UNRESOLVED.
(c) REPRODUCIBILITY: the trace reproduces the 0815Z milestones
    exactly for 97301 (wave4 48, stage2 59, present 59–91,
    attempts days 78/89, lair 8,4) and for 97307 (wave4 116,
    stage2 129, present 129–152, attempts 0, lair 7,4) — the
    instrument reads did not shift the runs. A mismatch is
    investigated, not averaged away.
(d) PROOF: unit proof (classifier on stubs, every label +
    order) AND corpus validator green; validator reproduces
    the verdict from the corpus alone.
(e) PURITY: zero `src/js` changes (git diff on src/ empty at
    report time); this arm sounds, defers, and mutates nothing.
(f) WALLS: wall numbers reported per seed (national/table/won,
    wave reach, survival, endReason) — case + cross-check
    only, NEVER pooled, NEVER presented as band evidence.

A miss on any bar is NO-GO, never re-scored against a friendlier
metric mid-run (MEASUREMENT §14). Doubts go under "metric
review".

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this
is a trigger-moment trace with no intervention and no
sweep-compare policy run — same declaration class as
heraldcontact / locatedengage. Before/after is not applicable
(no lever); wall metrics are reported per seed, NEVER pooled.
No panel fabricated.

## Wall metrics reported (per seed, never pooled)

National(end) / table reach / won, wave-4 / wave-5 reach,
survival (gameDays), endReason, herald attempt count.

## OUT OF SCOPE (task bounds)

No game-code change. No sound/defer/stand-down intervention, no
tribute/arrears rule change, no gate/stage/deed-bar/win-price
retunes, no new policy behavior, no march-policy code (that is
sim-titanroute-a's tree). No sibling trees or branches touched.
No hidden_files (tracker/claims/findings — coordinator-owned).

## Metric review

(To be filled at end of run. Doubts about the bars above go here
and apply to the NEXT run, never to this run's verdict.)
