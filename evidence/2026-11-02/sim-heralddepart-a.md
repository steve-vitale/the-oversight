# sim-heralddepart-a — herald world-list departure audit (Loop A 20261102)

Arm: herald-departure diagnosis, axis scale-onramp, blank #1 from
sim-laircontact-a. Prereg:
evidence/2026-11-02/sim-heralddepart-a-prereg.md, written AND
committed (14f8ce22) BEFORE any judged sim in this arm.
DIAGNOSIS ONLY. Zero src/js changes. Ready for coordinator
merge, pending ship (NOT pushed, NOT bumped, NOT live-verified
— ship loop owns deploys).

## Verdict: DIAG-GO — the herald does not "leave". It loses sight of you and despawns.

The departure rule, named from removal events with caller stacks:
when the herald shares the scholar's tile but cannot SEE the
scholar (or any villager target) through the detail grid —
trees, walls, and tents block the Bresenham line — each
monsterTurn increments its lostSight and drifts it randomly;
at lostSight > 6 (7 unseen turns) monsterTurn removes it from
worldMonsters with the line "You hold still behind cover.
After a while, the sounds fade. It lost your trail." Tile
co-location is not perception. The scholar camps a corner cell
of the lair tile; the herald wanders the same tile's detail
grid; if the sight lines across that tile stay blocked, the
giant that came to be fought quietly stops existing — no
departure line, no muster event, no titan outcome record. The
muster still stands (musterPresent true on the departure
traces); the titan is simply gone from the world.

That single rule settles all three known cases, and the corpus
backs it with no exceptions.

## Prereg judgment (binding, §14 — judged exactly as written)

Primary metric: classification coverage over missed-bump days
(prereg definition: post-call day, scholar ends the day on the
lair tile, zero herald attempts that day), where a HEROLD-LEFT
day counts only with a NAMED removal mechanism.

- GO leg 1: coverage >= 0.95. RESULT: 140/140 = 1.00.
- GO leg 2: all three known departure cases reproduce with a
  NAMED removal mechanism. RESULT: 97400 d69, 97338-musterfed
  d87, 97338-lairnoise d85 — all LOST-SIGHT, each removal
  recorded with before.lostSight == 7 and the lost-trail line
  as the next say line.
- Both legs pass. Verdict DIAG-GO. No threshold was re-scored;
  the two deviations below are code-version facts, recorded
  here, not metric changes.

## Classification table (corpus = 11 r1 runs; r2 excluded per prereg)

| class | days | what it means |
|---|---|---|
| HEROLD-LEFT | 63 | herald absent from worldMonsters at day-end |
| NEVER-ARRIVED | 68 | herald present, on a different tile at day-end |
| DETAIL-DIFFERED | 9 | herald present, same tile, different detail cell |
| MATCHED-NO-BUMP | 0 | same tile AND exact detail cell, zero attempts |
| UNKNOWN-removal | 0 | left day with no captured removal event |

Removal mechanisms over the 63 HEROLD-LEFT days: LOST-SIGHT 62,
FIGHT-START 1 (97418, see below). Zero days fall outside the
three named classes; zero days have an unmatched-no-bump
residue. The bump rule from laircontact-a survives intact:
no day ends with scholar and herald on the same exact detail
cell and no attempt — a day-end match always bumped that day.

Per-run table (call / departure / mechanism / missed days):

| seed / arm | call | dep | mechanism | missed (left / never / detail) | end |
|---|---|---|---|---|---|
| 97400 closecommit | 68 | 69 | LOST-SIGHT | 13 (12 / 0 / 1) | village-lost d88 |
| 97338 musterfed | 82 | 87 | LOST-SIGHT | 11 (6 / 4 / 1) | over-other d92 |
| 97338 lairnoise | 82 | 85 | LOST-SIGHT | 8 (6 / 1 / 1) | over-other d90 |
| 97420 closecommit | 60 | 94 | LOST-SIGHT | 44 (20 / 22 / 2) | village-lost d115 |
| 97433 closecommit | 64 | 68 | LOST-SIGHT | 20 (18 / 0 / 2) | over-other d90 |
| 97418 closecommit | 59 | 60 | FIGHT-START | 2 (1 / 0 / 1) | over-other d90 |
| 97426 closecommit | 66 | — | stays | 24 (0 / 24 / 0) | over-other d90 |
| 97435 closecommit | 61 | — | stays | 18 (0 / 17 / 1) | village-lost d87 |
| 97405 closecommit | — | — | never calls | 0 | over-other d103 |
| 97412 closecommit | — | — | never calls | 0 | village-lost d76 |
| 97432 closecommit | — | — | never calls | 0 | village-lost d90 |

## The three known cases, turn by turn

- 97400 closecommit: scholar camps detail (0,8) on tile (7,3).
  Herald detail (6,2) → drifts (5,2)/(5,3) across d68–69.
  All 7 monsterTurn rows read seeScholar False AND
  seeTarget False (nearest target is the scholar herself at
  (0,8); the line is blocked). lostSight climbs 0→4 over the
  d68 night turns (sleeping True — the rule also fires while
  the scholar sleeps) and 4→7 on d69; the 7th turn removes it.
  Day-end trace d68 is the single DETAIL-DIFFERED day; d69+
  are HEROLD-LEFT days. The muster still stands; no titan
  outcome is recorded for the departure.
- 97338 musterfed: co-located d86 (DETAIL-DIFFERED, scholar
  (0,4), herald (6,6), 2 turns, see False, lostSight 0→1),
  removal d87 at lostSight 7 with the lost-trail line. The
  fed march's co-location day is the first turn of the same
  spiral, not a different phenomenon from 97400.
- 97338 lairnoise: refusals d84 (12 attempts, exact cell
  (0,0)), co-located d83 DETAIL-DIFFERED is an approach day
  (see True, curious→hungry, bump d84); after the refusals
  the herald drifts unseen and is removed d85 at lostSight 7.
  A refused herald does not leave because it was refused —
  it leaves when, on a later unseen stretch, the sight rule
  fires. Refusal and departure are independent outcomes of
  the same wandering trajectory.

## Why the herald "stays for weeks" elsewhere

It does not stay on the scholar's tile for weeks. The in-corpus
stayers — 97426 (24 NEVER-ARRIVED days, herald present to run
end) and 97435 (17 NEVER-ARRIVED + 1 DETAIL-DIFFERED) — stay
in the WORLD by wandering to other tiles, where monsterTurn
never runs for them (it early-returns: playerMonster is null
off the scholar's tile), so lostSight never accrues. The
lost-sight clock only ticks while the herald shares the
scholar's tile unseen. That asymmetry is the whole answer to
the task's contrast: same-tile-unseen → gone in ~7 turns;
elsewhere → present indefinitely. The laircontact stay case
(97405 "through d161") does not survive to current code at
all (see deviation note) — the contrast now rests on 97426 /
97435, which the new instrument establishes directly.

## DETAIL-DIFFERED splits in two (turn rows decide)

- Spiral days (4): every monster-turn seeScholar False,
  lostSight climbing — 97400 d68, 97420 d93, 97433 d67,
  fed-97338 d86. Each is followed by a LOST-SIGHT removal
  within 1–2 days. Blocked sight is a departure in progress.
- Approach days (5): seeScholar True, stance machine
  advancing (curious → hungry) — 97418 d59, 97420 d60,
  97433 d64 (the only in-block day: scholar (0,8) inside the
  herald's 3x3 block (0,6)–(2,8) yet no bump, because the bump
  needs the EXACT cell, not block overlap), 97435 d66,
  noise-97338 d83. Each is followed by a bump day (fight or
  refusals). A same-tile day with clear sight is a meeting
  about to happen, not a miss.
A future driver can therefore predict departure from the turn
rows alone: all-False sight on a same-tile day means the
herald is already leaving.

## The FIGHT-START departure (97418 — not a vanishing)

97418's herald is removed d60 by startCombat itself (stackTop
startCombat, stance hungry, lostSight 0): the world monster is
pulled into the coalition fight. Its titan outcome record
resolves the same day to 'slain' (blades 15, result won). The
single HEROLD-LEFT missed day that follows (d61, scholar still
on the lair tile) is a post-fight absence, correctly
classified, and must not be read as another lost-sight case.
This arm cites the outcome record only to classify the
removal; it does NOT cite the run's won/table/national flags
as reach (see metric review — those flags stay non-specific
on this substrate).

## Deviation notes (code-version facts, not re-scores)

1. Band re-basing (same class as laircontact-a): the 8-seed
   band was selected on laircontact-a's baseline-attempt-
   positive seeds, but on current code 97405, 97412, and
   97432 no longer call at all (97405: no call, over-other
   d103; 97412: village-lost d76; 97432: village-lost d90).
   Proof the shift is code, not instrument: the OLD
   laircontact driver run on current code gives 97405
   EXACTLY the new driver's result (call null, gameDays 103,
   over-other) — record
   perseed-laircontact-a/lc-closecommit-s97405-rX.json,
   committed with this arm by provenance. The prereg's GO
   legs do not depend on the band calling (leg 1 is a
   coverage rate over whatever missed days the corpus
   contains; leg 2 is the three departure cases, all
   reproduced), so no threshold changes and no band
   replacement was made mid-run. The cost is real, though:
   the planned stay-case contrast (97405) evaporated, and
   the band's effective calling size is 5 of 8 seeds.
2. Trace timing (instrument note, not a finding change):
   the day-end trace row for day D is taken at policy.daily
   time, before sleep rolls the day — so monsterTurn rows
   labeled day D that fire during the night into D+1 appear
   in the NEXT trace row's cumulative counters, not D's.
   Classification uses trace-day positions + attempt days,
   both on the same day numbering, so the offset does not
   affect any class; it is recorded so the next arm does not
   misread a trace row's lostSight as "the whole day's".
3. 97420 side observation (not a verdict): its herald arrives
   at the d93 detail-differed day already wounded (457/700
   HP) from three villager field fights on other tiles
   (d77/d84/d90, all vFlee, one villager death) — villagers
   fight the wandering herald without the scholar, and it
   keeps wandering. Wounds do not hasten departure; only
   unseen same-tile turns do.

## Reachability verdict

Reachable on current master, in this corpus: the call sounds
(5 of 8 band seeds + both 97338 arms), musters form, scholars
camp the lair, wild-contact bumps fire, MUSTER-GATE refusals
fire, a FOUGHT start fires (97418, gate 15), and the titan
outcome record resolves that fight to 'slain'. NOT claimed
here: any national/table/win reach attributable to the
herald chain — the driver flags on this substrate remain
non-specific (97405/97418/97426 show won=1 at over-other
endings on contact-free or post-fight runs, as in
laircontact-a). The departure mechanism itself is now
settled; what it costs the scale climb (a muster that can
lose its titan to seven unseen turns while its scholar camps
the lair) is a design question for the next arm, not a
measurement gap.

## Sense-testing (transcript judged for meaning)

- The lost-trail line is honest fiction: "You hold still
  behind cover. After a while, the sounds fade. It lost your
  trail." — for a 700-HP sky-giant standing on the same tile
  as the scholar, "behind cover" is doing heavy lifting, but
  the line does say what happened (unseen → gone), unlike
  the silent departures in the old records. A player camping
  the lair would at least see the sentence on the morning
  the herald vanishes.
- The spiral is invisible in play until it completes: no
  line marks lostSight 1–6, so the scholar watches a giant
  drift around her tile for a day and then reads that it
  "lost her trail". The mechanism is real; its telegraphing
  is a blank (see next blanks #3).
- 97418's fight line ("⚔ THE HERALD! You're on your own.")
  followed by a same-day slain outcome reads as a complete
  meeting: the coalition arrived, fought, and the herald
  fell — the one departure in the corpus that feels like
  an ending rather than an evaporation.

## Per-seed records (all under evidence/2026-11-02/)

- perseed-heralddepart-a/hd-<arm>-s<seed>-r1.json (11 corpus
  runs) + hd-closecommit-s97400-r2.json (determinism repeat,
  excluded from corpus counts)
- perseed-heralddepart-a/classification.json (analyzer
  output: totals + per-seed rows)
- perseed-laircontact-a/lc-closecommit-s97405-rX.json
  (old-driver-on-current-master cross-check; prior arm's
  dir by provenance)

## Files committed (this arm)

- scripts/heralddepart-driver-20261102.js — daily trace with
  detail coords + monster-turn bump rows + removal events +
  titan outcomes (read-only hooks, zero RNG draws)
- scripts/heralddepart-analyze-20261102.js — missed-bump
  classifier (r1 corpus only; no re-simulation)
- scripts/sweep-heralddepart-a.js — corpus runner
- scripts/test-heralddepart-a.js — proof test, 10/10 green
- evidence/2026-11-02/sim-heralddepart-a-prereg.md
- evidence/2026-11-02/sim-heralddepart-a.md (this file)
- evidence/2026-11-02/perseed-heralddepart-a/*.json (12
  records + classification.json)
- evidence/2026-11-02/perseed-laircontact-a/lc-closecommit-s97405-rX.json

## Balanced panel (method note, not a gap hidden)

No panel compare .md is attached, for the stated prereg
reason: scripts/balance-panel.js runs its own policy registry
over its own seeds with its own observer — it cannot ingest
heralddepart driver records, and its policies do not include
the closecommit stack, the titanroute march, or any of this
arm's legs, so a panel run would not express this arm's
comparison at all. The comparison this arm actually makes —
identical seeds across arms with byte-identical determinism
(r1 == r2 full JSON) plus the old-driver cross-check — is
the instrument the prereg named. Same position as
laircontact-a and the prior diag arms. If a future arm
changes game code, the panel applies to that change; it does
not apply to this diagnosis.

## Metric review (for the NEXT run, not this verdict)

- Day-end positions classify correctly, but the spiral is
  only visible in monster-turn rows: a future driver that
  drops turn rows would misclassify spiral days as plain
  DETAIL-DIFFERED and miss the departure mechanism entirely.
  Keep turn rows (or at least per-day seeScholar +
  lostSight series) in any herald instrument.
- The missed-bump definition requires the scholar to END the
  day on the lair tile. Scholar–herald meetings away from
  the lair are out of scope for it: e.g. 97426's d66
  attempts fire at (4,4) while the lair is (7,4) — the
  scholar met the herald off-lair mid-day and ended the day
  back on the lair. A follow-up that widens "missed" to any
  scholar-tile day should re-derive the table rather than
  assume these classes carry over unchanged.
- Driver won/table/national flags are non-specific (as in
  laircontact-a): won=1 at over-other endings on runs with
  no herald fight, table=1 on village-lost runs. Never cite
  them as reach. Titan outcome records (refused/fought/
  slain/fled) are the specific herald-chain signal and are
  now recorded per day — future arms should judge herald
  reach from outcomes, not flags.
- Band selection does not survive landings: a band picked
  on one code version lost 3 of 8 seeds to non-calling on
  the next. Future arms must re-screen their band on the
  CURRENT code before judging, and must never carry a
  contact/departure day across a landing (laircontact-a's
  lesson, extended).
- The prereg's GO bar did not anticipate the FIGHT-START
  class (a departure that is a fight entry). It counted as
  assigned via the named-mechanism rule, which is correct
  — but a future prereg should list fight-entry removals
  explicitly so they are not mistaken for vanishings.

## Next blanks, in order

1. Herald-departure telegraph + design question (NEXT ARM
   candidate, Steve-call territory if it touches feel):
   should seven unseen same-tile turns silently delete a
   titan the village mustered for? Options the next arm
   should measure, not assume: (a) telegraph the spiral
   (a line at lostSight 1–3, "it is losing your trail"),
   (b) exempt titans from the lost-sight removal (they
   arrived by omen, they do not wander off like beasts),
   (c) let the muster hold the titan (presence while a
   muster stands). Any game-code change here needs its own
   prereg + panel treatment; this arm documents, it does
   not land.
2. Fight-outcome recorder, carried from laircontact-a #2
   and now half-answered: titan outcomes ARE recorded per
   day in this driver (refused/fought/slain/fled), and
   97418 resolves to slain — the remaining piece is a
   standing recorder (not per-arm driver code) so future
   arms get outcomes without re-instrumenting.
3. Refusal narration dedup (carried, unchanged): one bump
   day still reads as twelve identical refusal lines.
4. Carried, unchanged: stores-draw upkeep (Steve-call);
   the refusal line's allies-only undercount; the d90
   over-other won=1 / table-on-village-lost flag artifact
   family (now joined by 97418's genuine slain outcome —
   the flags and the outcome record must be disentangled
   before any reach claim).

## Village assessment (plain words)

The village sends its scholar to camp on the herald's lair,
and there she waits — sometimes on the very patch of ground
the giant is standing on, separated by a few trees. When the
giant can see her, it comes: the meeting happens, the
coalition is counted, and the fight begins or is refused.
When it cannot see her — when the trees stand between them
on the same tile — it drifts, loses the trail, and is simply
gone by morning, with one quiet line about cover and fading
sounds. The village did nothing wrong; it was there, on the
lair, as asked. It just stood on the wrong square of the
clearing, behind the wrong trees, while the thing it came to
fight wandered past unseen. And when the giant does wander
elsewhere, it can live for weeks — villagers even fight it
in passing and wound it, and it keeps walking. The herald is
not hard to find. It is hard to be seen by, on its own tile,
through its own trees. That is the departure: not a flight,
not a refusal, not a timer — a line of sight that never
cleared.

## Convergence state

converging (axis scale-onramp: the departure mechanism is
settled; the design question it raises — silent titan
despawn — is the next blank, not a measurement gap).
