# sim-seathes-a — seat-taking hesitation: why a surviving lesser-seat village never sits (DIAG ONLY)

Run: fleshout-loop-a-20261101T1016Z. Worker: sim-seathes-a. Axis:
scale-onramp (converging, NOT converged). Sibling Loop B works
food-economy — NOT touched (no B axis, claims, or trees).
Pre-registration: evidence/2026-11-01/sim-seathes-a-prereg.md
(COMMITTED 37f9e4465 before any judged sims; judged exactly against
that bar, no re-scoring).
Instrument: scripts/seathes-a-sweep.js (decision-moment recorder +
analyzer) + proof scripts/test-seathes-a.js. Recorders reused
UNMODIFIED: scripts/policies/tableseat-nowait.js,
scripts/policies/fullseat-diag.js, scripts/policies/vet2-diag.js.
Composition: withSeatHesDiag(withVet2Diag(withFullseatDiag(
tableseatNowait))). Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FULLSEAT=1, VET2=1, SEATHES=1. Horizon: 180d death-aware.
Corpus: evidence/2026-11-01/seathes-a-perseed/s<seed>.json +
s<seed>-daily.json + summary.json.
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after lever comparison exists in this arm; none fabricated.
The ON-vs-OFF and vs-rd5daily comparisons below are
recorder-neutrality proofs, not panel comparisons, and their numbers
never enter a census table as a lever effect.

## INTENTIONAL REUSE — not a fresh-seed claim

Seeds 78201–78208 are REUSED from sim-fullseat-recheck-a /
sim-rd5daily-a. This is a decision-moment re-measurement of the
EXISTING corpus, NOT a fresh-seed claim: no new wall numbers are
claimed from this arm, and no band-shopping is possible (the band is
fixed by the recheck). The wall numbers below are the recheck's,
reproduced exactly by the new stack — reported as a reproduction
check, not as new findings.

## Verdict: DIAG-GO

Judged exactly against the prereg's bar:
- Daily seat-state series for 78201 covering days 165–180 with, per
  day, seat priced (kind), overtime multiplier, standing vs bar,
  deed distances, scholar location/presence, and the seat-decision
  outcome: PRESENT (16 decision-moment rows, table below).
- Classified blocking condition for EVERY held day, ZERO
  UNCLASSIFIED: PASSED band-wide (65 decision lesser/full rows
  classified: 52 held-to-end + 13 pre-sit on the winner; 0
  UNCLASSIFIED).
- Same series for 78208 (plateau days 128–163) and any other
  lesser-holding seed in the band: PRESENT (78208: 36 rows;
  78206: 13 pre-sit rows ending in a sit; no other seed had a
  decision-moment lesser/full day).
- Sense read of the endgame transcript: DONE (existing
  sim-fullseat-recheck-a-sense-78201.txt days 177–181 + fresh
  keyword replay sim-seathes-a-sense-78201.txt, NON-MEASURED).
- At least one falsified alternative hypothesis: PASSED — four of
  five falsified (H2, H3, H4, H5), H1 confirmed (see scoreboard).
- Recorder-neutrality leg PASS (ON vs OFF identical end fields on
  78201 and 78208) and determinism leg PASS (78201 ON re-run
  byte-identical, row + daily-series JSON, cmp clean).
- Proof test scripts/test-seathes-a.js: GREEN, 53/53 (analyzer
  unit checks + corpus legs re-deriving every headline number
  from the judged corpora, independent of the sweep's printed
  verdict).

## Answer in one paragraph

The seat-taking leg never fires on 78201 or 78208 because the
policy's gate and the lesser seat's gate do not overlap: the
substrate only attempts a seat at national+ rank, while a lesser
seat needs only regional+ — and on both held seeds the village is
regional on every single day it holds a priced lesser seat. The
game itself would have let them sit: on 38 of the 52 held-to-end
days the preview reads ready, the scholar stands on the Haven tile
(4,4) on all 52 days, and stores access is never 'none'. There is
no attempt to fail, no guard refusing, no waiting for a full seat,
and no presence problem — the leg simply never runs, because rank
decayed from national to regional before the deeds priced the
lesser seat, and the two windows never overlap. The winner seed
proves the leg works: 78206 sits on day 90, the very first day
national rank, the day-90 floor, and a ready preview all hold at
once.

## Hypothesis scoreboard (prereg order)

- H1 POLICY-GATE (leading): CONFIRMED as the binding blocker.
  52/52 held-to-end days classify RANK-GATE (decision rank
  regional); 6 further pre-sit days on 78206 classify RANK-GATE.
  Zero seat attempts, zero guard refusals, zero seat errors on
  all 52 held-to-end days (ctx counter diffs empty every day).
- H2 GAME-GATE: FALSIFIED as the binding blocker. Preview ready on
  7/16 held days (78201) and 31/36 (78208) — the game offered the
  seat and the policy never asked. (The game gate DID bind on
  specific other days: the day-90 floor on 78206 days 84–89, and a
  lingering-encounter block on 78201 days 173–180 and 78208 days
  140/147/148/163 — secondary only, never primary on a held day.)
- H3 PRESENCE: FALSIFIED. Scholar on the haven tile (4,4) at the
  decision moment on 52/52 held-to-end days; stores access never
  'none' ('inside' on the days the scholar slept in the hall,
  'remote' via integration stage >= 3 on the rest). Presence was
  satisfied at every decision moment, including the 8 combat-block
  mornings on 78201 (the scholar is AT Haven with a monster
  pending, not away from it).
- H4 WAITING-FOR-FULL: FALSIFIED twice. Code: tsDriveSeat has no
  seat-kind filter — a ready lesser seat is taken like a full one.
  Empirically: 78206 sits a LESSER seat on day 90 under this same
  substrate (1 attempt, taken, kind lesser, path feared).
- H5 ATTEMPT-FAILS: FALSIFIED. Per-day ctx diffs show zero
  attempts on all 52 held-to-end days, so there is no failed
  attempt to explain — and on the one day an attempt happens
  (78206 day 90) it succeeds.

## The mechanism, in plain words

A village's scale peak and its deed peak arrive out of phase.
78201 is national for 67 decision days (88–154) while its seat is
still 'none' — the deeds are not finished yet. It slips back to
regional, and only then, on day 165, do the deeds price a lesser
seat. From day 165 to the cap the village holds that priced seat
and waits, while the overtime clock ticks (tier 1 from day 173,
tier 2 on day 180, standing docked −8) and the game says aloud,
"Take your seat from Haven to stop the clock." But the policy
that would take the seat only looks at national-or-better
villages, so it walks past the table every morning for 16 days.
78208 never even reaches national at a decision moment (its one
post-day national day, 77, is an intra-day flicker, gone by the
next morning) and holds its lesser seat 36 days, overtime climbing
to tier 4, with the same empty result. 78206 is the control that
proves the leg is not broken: national from day 84, but the
day-90 floor holds the preview at null until day 90 — and on day
90, the first morning every gate agrees, the village sits
immediately and wins through the lesser seat. The hesitation is
not hesitation at all: it is a gate mismatch. The lesser seat was
designed to be reachable at regional (TABLE.md), but the only
policy that takes seats demands national.

## Per-day seat-state series

Held day = decision-moment seat lesser or full, table not done,
run alive. Primary class is prereg-priority (RANK-GATE first);
"would" columns show what the game gate would have said anyway.
Standing is 199 vs the t5 bar 200 on every 78201/78208 held day
(hold defer5); deed distances are w5=2 and nothing else on every
such day. Scholar location is the Haven tile (4,4) on every held
day on all three seeds (not repeated per row).

### 78201 — 16 held days, 165–180, all RANK-GATE, never sat

| days | rank | waiting | preview | would-block | overtime | outcome |
|------|------|---------|---------|-------------|----------|---------|
| 165 | regional | false (announce fires during day 165) | null | — (no preview yet) | — | no attempt |
| 166–172 (7) | regional | true | lesser, READY | none | 0 | no attempt |
| 173–179 (7) | regional | true | lesser, not ready | COMBAT: "Finish the current encounter…" | 1 | no attempt |
| 180 | regional | true | lesser, not ready | COMBAT (same line) | 2 (standing −8) | no attempt |

Secondary split: game gate open 7/16, combat-blocked 8/16,
preview-null 1/16. Access: 'inside' day 165 (slept in the hall),
'remote' days 166–180 (stage >= 3). Attempts/failed/guard: 0 on
all 16 days. National decision window 88–154 (67 days) ends 10
days before the lesser window opens — zero overlap.

### 78208 — 36 held days, 128–163, all RANK-GATE, never sat

| days | rank | waiting | preview | would-block | overtime | outcome |
|------|------|---------|---------|-------------|----------|---------|
| 128 | regional | false (announce fires during day 128) | null | COMBAT line present (block reads it, preview null) | — | no attempt |
| 129–135 (7) | regional | true | lesser, READY | none | 0 | no attempt |
| 136–139 (4) | regional | true | lesser, READY | none | 1 | no attempt |
| 140 | regional | true | lesser, not ready | COMBAT | 1 | no attempt |
| 141–142 (2) | regional | true | lesser, READY | none | 1 | no attempt |
| 143–146 (4) | regional | true | lesser, READY | none | 2 | no attempt |
| 147–148 (2) | regional | true | lesser, not ready | COMBAT | 2 | no attempt |
| 149 | regional | true | lesser, READY | none | 2 | no attempt |
| 150–156 (7) | regional | true | lesser, READY | none | 3 | no attempt |
| 157–162 (6) | regional | true | lesser, READY | none | 4 | no attempt |
| 163 | regional | true | lesser, not ready | COMBAT | 4 | no attempt |

Secondary split: game gate open 31/36, combat-blocked 4/36,
preview-null 1/36. Access 'inside' days 128–129, 149, 163;
'remote' otherwise. Attempts/failed/guard: 0 on all 36 days.
Decision national days: NONE (the recheck's post-day national
day 77 never survives to a decision moment). The village dies
village-lost on day 164, still holding the seat.

### 78206 — 13 pre-sit lesser days, 78–90, SAT day 90 (positive control)

| days | rank | waiting | preview | class | outcome |
|------|------|---------|---------|-------|---------|
| 78 | regional | false | null | RANK-GATE | no attempt |
| 79–83 (5) | regional | true | null (day < 90 floor) | RANK-GATE | no attempt |
| 84–89 (6) | national | true | null (day < 90 floor) | PREVIEW-NULL / DAY-LT-90 | no attempt |
| 90 | national | true | lesser, READY | SAT | 1 attempt, TAKEN (lesser, feared path), won |

The leg fires on the first morning all three gates agree
(national + day >= 90 + ready). Note the day-floor gate, not the
policy gate, is what holds days 84–89 — the preview is null
before day 90 even at national rank.

### Band summary

| seed | end | decision lesser days | classes | sat | national decision days | overlap |
|------|-----|----------------------|---------|-----|------------------------|---------|
| 78201 | 180d survived | 16 (165–180) | RANK-GATE 16 | — | 88–154 (67) | 0 |
| 78202 | 131d village-lost | 0 | — | — | — | 0 |
| 78203 | 168d village-lost | 0 | — | — | — | 0 |
| 78204 | 180d survived | 0 | — | — | — | 0 |
| 78205 | 99d village-lost | 0 | — | — | — | 0 |
| 78206 | 90d WON lesser | 13 (78–90) | RANK-GATE 6, PREVIEW-NULL 6, SAT 1 | day 90 | 84–90 (7) | 7 |
| 78207 | 26d village-lost | 0 | — | — | — | 0 |
| 78208 | 164d village-lost | 36 (128–163) | RANK-GATE 36 | — | none | 0 |

Band totals: 65 decision lesser/full rows classified, 0
UNCLASSIFIED; 52 held-to-end days, all RANK-GATE; 1 sit (78206).
No seed held a full seat on any decision day (full 0/8, as in
the recheck).

## Wall numbers (reproduced, NOT new — intentional reuse)

Won 1/8 (78206, lesser seat, day 90). National ever 5/8 (per
recheck; decision-moment national windows differ — see metric
review). Table reached 3/8 (78201, 78206, 78208); entered 1/8
(78206, lesser); enteredFull 0/8. Wave 4 reached 7/8; wave 5
reached 0/8; full seat 0/8. Median run length 164d, max 180d.
These match the rd5daily corpus field-for-field on all 8 seeds
(neutrality comparison below) — reported as a reproduction check,
not as new findings.

## Recorder neutrality + determinism

- Cross-corpus reproduction: ON-run end fields match the rd5daily
  corpus on 8/8 seeds (days, gameDays, ts counters,
  starvationDeaths, endSnap dist/binding/seat, diag maxDist, vet
  end/max counts, waveReach, finalRank, maxRank, nationalEver,
  table, entered, won) — neutDiffs empty everywhere.
- Recorder-neutrality leg (prereg): SEATHES ON vs OFF end fields
  identical on 78201 and 78208 (same field list + diag.days +
  vet.days: 180/180 and 163/163). The decision-moment reads
  (tablePreview/tableEntryBlock/tableSeat/deedGateReady/
  havenStoresAccess/playerTile/scaleRank/snapFullSeat) do not move
  trajectories. (OFF runs write empty series files by design —
  the wrapper delegates without recording when off; their
  analyzer verdict is NO-GO on series completeness alone, which is
  expected and irrelevant to the end-field comparison.)
- Determinism leg (prereg): 78201 ON re-run byte-identical to the
  judged row + daily-series JSON (cmp clean on both files;
  scratch deleted). The 1-seed scratch sweep's NO-GO verdict is
  the n==8 gate only, not a data difference.

## Sense read (SENSE-TESTING LAW — meaning, not counts)

Read: the existing 78201 sense transcript
(sim-fullseat-recheck-a-sense-78201.txt, endgame days 177–181)
plus a fresh keyword replay (sim-seathes-a-sense-78201.txt,
NON-MEASURED, every seat/table/overtime/Haven line across the run;
916 keyword lines, same end state as the judged run: survived,
180d, tableWaiting true, tableDone false). The fresh replay pins
two beats the ring transcript could not: day 165, "The table is
being set — a lesser seat, priced for what you built. They are
watching to see who comes to it." — the announce fires DURING day
165, which is why the decision moment that morning still shows
waiting false; and day 173, the first overtime tier ("OVERTIME!
The season was supposed to END. You didn't sit.") — matching the
instrument's overtime tier 1 from day 173 exactly.
What the endgame days read as: a village enduring a priced wait
whose own narration names the remedy it never takes. Day 179:
"The fifth draft stays in the wings — put weapons in hands (4 of
6 armed); blood your fighters (0 of 2 veterans)." Day 180:
"OVERTIME ×2 — wave 4–5 monsters return as RERUNS (+50% HP, +24%
damage, +1 to every pack). Raids come sooner. The table docks your
standing −8. Take your seat from Haven to stop the clock." The
scholar IS at Haven every night of the held window (the transcript
shows the nightly walk back into Haven, "You walk back into Haven.
64 Codex entries. The village is glad to see you."), sleeps in
the hall, and walks back out each morning to forage — the
decision moment each dawn finds them home, on the Haven tile,
with the table waiting. Nothing in the narration suggests the
village is choosing to wait, deliberating, or unaware: the wait
is priced, the remedy is spoken, and the mornings pass anyway.
That is exactly what a gate mismatch looks like from inside the
story — a door held open with no hand reaching for it because the
only hand allowed to reach is national, and this village is
regional. The transcript also shows WHY the combat secondary
exists: a lingering Herald encounter pends at dawn on the last
eight mornings (the "Finish the current encounter" line), so even
a national-ranked morning late in the window would have needed
that encounter cleared first — a second, smaller door behind the
first.

## Reachability verdict (seat-taking content)

REACHABLE, and reached in-band: 78206 takes a lesser seat and wins
through it on day 90 under this substrate. The seat-taking leg is
not broken — it is gated. What is NOT reachable on this band is
sitting from regional rank: a village that prices a lesser seat
after its national window closes (78201) or without ever holding
national at a decision moment (78208) can hold that seat to the
cap or to its death without the leg ever firing. The full seat
remains unreached (0/8, wave 5 0/8 — the veterans-2 wall, not this
arm's question).

## Village assessment (plain words)

78201 is the village that did everything asked of it and then
waited politely for a door that would not open. It climbed to
national, fought waves 1–4, survived contests and crises, taught
its sentiment and surged its feasts — and then its standing in
the wider world slipped back to regional while it finished the
last deeds, so by the time the table priced its lesser seat the
village no longer counted as national where it mattered. It spent
its last 16 days doing the work of living (foraging hauls, water
runs, raids endured, a contest won on camera) while the overtime
price ticked up around it. 78208 is the longer, quieter version
of the same story: 36 days holding a priced seat, overtime
climbing to tier 4, dying with the seat still unclaimed. 78206 is
the counter-example that keeps the story honest: a village whose
scale peak and deed peak overlapped, which sat the moment the
law allowed and won. The difference between winning and waiting
here is not effort, courage, or deeds — it is calendar luck: did
your national window still cover the morning your seat priced?

## Blanks filled or documented

FILLED (this arm): the seat-hesitation blank from the 0615Z
closeout — why a surviving lesser-seat village never sits. Answer:
the policy's national+ attempt gate never overlaps the regional+
lesser seat on held seeds; game gate, presence, full-seat waiting,
and attempt failure are all falsified as the binding cause.
DOCUMENTED (not fixed — DIAG arm, and the fix is a policy/coordinator
call, not a measurement): the gate mismatch itself. Fixing it
means deciding whether the seat leg should attempt at regional+
(when a lesser seat is priced), or the lesser seat should demand
national — a design call for the coordinator/Steve, since it
changes which villages can win and when. No fix is proposed or
implied beyond naming the mismatch and its evidence.
DOCUMENTED (secondary, for a future arm): the dawn lingering-
encounter block — on 78201's last 8 mornings and 78208's days
140/147/148/163, a pending encounter would have blocked sitting
even at national rank. Whether a lingering monster should pend
across dawns this way is a separate question, not answered here.

## Metric review (for the NEXT run — mandatory)

1. The prereg's "held day" definition counts the sit day itself
   (decision-moment seat lesser, table not done at the decision
   moment, then taken during the day → class SAT). The analyzer's
   heldN therefore reads 13 for 78206, not 0. The GO bar's formal
   definition (every decision lesser/full day classified, zero
   UNCLASSIFIED) is still met exactly — but the next daily-series
   arm should split the count into heldToEnd vs preSit vs sitDay
   in its summary, so "held" is never misread as "held to end."
2. Decision-moment vs post-day windows differ in mechanism even
   when they agree in span: 78201's decision national window
   (88–154) is shifted one day from its post-day window (87–154),
   and 78208's single post-day national day (77) appears at NO
   decision moment — it is an intra-day flicker. Post-day rows
   must not be used to infer attempt eligibility; only
   decision-moment rows can. (This arm's headline windows are
   decision-moment windows throughout.)
3. tableWaiting flips during the first lesser day, not before it:
   on all three lesser seeds the first decision-moment lesser day
   shows waiting false, and waiting true from the second lesser
   day on. A future arm that reads "first lesser day" from
   post-day rows will misdate the table's availability by one
   morning; the announce beat fires during that day's play.
4. The combat secondary ("Finish the current encounter") is a
   dawn-state finding, not a policy finding: the scholar wakes
   with a monster pending. A future arm asking whether lingering
   encounters should block dawn decisions needs intra-day timing
   (when the encounter pends vs when the leg runs), which a daily
   snapshot cannot date more precisely than "at the decision
   moment." That precision limit does not affect any verdict here,
   since the primary class on those days is RANK-GATE regardless.
5. Overtime tier in the preview is the priced tier at the decision
   moment (78201: tier 2 on day 180; 78208: tier 4 by day 157).
   Standing cost = 4 × tier on these rows (losses 0). The
   day-180 −8 dock in the transcript matches the preview's
   standingCost exactly — narration and instrument agree.
