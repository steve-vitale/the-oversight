# sim-seatpath-a — RELAY-door path diversity on the 75101–75108 band

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-seatpath-a.
Worktree: `~/workspace/worktrees/sim-seatpath-a` (branch
sim-seatpath-a).
POLICY-SIDE ONLY — zero src/js changes, zero default flips.
Pre-registration: evidence/2026-10-28/sim-seatpath-a-prereg.md
(written BEFORE any judged sweep; the relay pick, door rule, and
GO rule below are that file's, not post-hoc).

## Verdict: GO (relay walked and won on every seating)

- Detgate (75101, switch unset): PASS — 132/132 days, 132/132
  gameDays, no rp counters.
- Substrate-activation gate: PASS — band courtship combined 38,
  8/8 seeds non-zero (baseline config).
- G2 leak gate: PASS — all 5 non-seated seeds identical
  days/gameDays across arms; G2 pre-national subset PASS (75108
  only); G3 corpus integrity PASS (16/16 rows, no zero-day rows).
- Primary: relay entered 3/3 armed seatings (fallback-Feared 0),
  relay won 3/3. Cost bar: armed starvation total 2 = baseline
  total 2 (both on 75108, neither arm-only); arm-only starvation
  0; armed median days 162 = baseline median days 162.
- The task's baseline is REPLICATED exactly by this arm's own
  baseline config on identical seeds: entered 3/8, wins 3/8,
  all lesser/Feared. This replication does NOT re-score any
  prior arm's verdict — it is this arm's comparison baseline.

## The full-seat disclaimer (stated plainly, as pre-registered)

The full seat is NOT this arm's target and nothing here claims
it. On this band the full-seat bars are unreachable regardless
of policy (per the band description, wave-4 kills 0 and wave-5
0). Every seating in both arms is lesser (seatKind lesser on
all 6 seatings). The harness's waveReach column is wave
UNLOCKS, not kills — wave-4 unlocks appear on 5/8 seeds in
both arms, wave-5 unlocks on 0/8 — and unlocks are not deed
bars; no full-seat claim is drawn from them.

## What was tested, in plain words

The tableseat-nowait seat legs always answer the FIRST table
option, and at a lesser seat the engine offers earned paths
with Feared first — so the baseline always walks Feared when
Feared is earned. This arm changed ONLY which door is walked:
if Relay is offered, walk Relay; else the first non-Feared
door; else Feared (flagged, not counted). Everything else —
courtship, seat legs, beat/final/downgrade answering (first
option), branches (earned from the ledger, never overridden)
— is identical to the baseline by construction. The question
was whether Relay is even offered on these seeds, and whether
walking it wins, loses, or fails differently from Feared.

Answer: Relay is offered on every seating seed, and it wins
every time — 3/3, all lesser seats, all on the first-option
beats/finals underneath the door pick. Path diversity on this
band is real: the same villages that walk Feared and win
under the baseline walk Relay and win under the door rule,
with nothing else about their runs changing at all (see the
identical death totals below).

## Numbers (8 seeds, 180 loop-days death-aware, identical seeds)

Baseline = tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
Armed = tableseat-nowait + relay-door rule (TABLERELAY=1).
Per-seed corpus: evidence/2026-10-28/perseed-seatpath-a/
(s<seed>-<baseline|armed>.json + summary.json).

| Arm | Entered | Won | By path entered | By path won | National ever | National final | Table waiting | Median days | Starvation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | 3/8 | 3/8 | feared 3 | feared 3 | 7/8 | 5/8 | 6/8 | 162 | 2 |
| Armed (relay rule) | 3/8 | 3/8 | relay 3 | relay 3 | 7/8 | 5/8 | 6/8 | 162 | 2 |

Per-seed (days / entered / path / won — identical days across
arms on every seed, including the seated ones):

| Seed | Baseline | Armed |
| --- | --- | --- |
| 75101 | 132 / yes / feared / won | 132 / yes / relay / won |
| 75102 | 177 / no / — / lost village | 177 / no / — / lost village |
| 75103 | 180 / no (waiting, never sat) / survived | 180 / no (waiting, never sat) / survived |
| 75104 | 90 / yes / feared / won | 90 / yes / relay / won |
| 75105 | 162 / yes / feared / won | 162 / yes / relay / won |
| 75106 | 146 / no (waiting, never sat) / lost village | 146 / no (waiting, never sat) / lost village |
| 75107 | 180 / no / survived | 180 / no / survived |
| 75108 | 114 / no (waiting, never sat) / lost village | 114 / no (waiting, never sat) / lost village |

Seat legs: attempts 3, taken 3, failed 0, preview-not-ready 0
in BOTH arms. Table answers: baseline 15 (5 per seating),
armed 18 (6 per seating) — the relay walk takes one more
answer per seating than the feared walk (one extra beat in
the relay challenge under first-option answering).
Death totals are IDENTICAL between arms, every cause:
villager combat 106, villager-vs-villager combat 80, player
arena 53, villager expedition 22, villager monster 19, plus
singletons (alien, ambush, night, Algorithm, toad, sickness,
contest, thirst) and starvation 2. The door choice changed
nothing except the path walked and won — the strongest
possible isolation for a door arm.

Wave/arc reach (harness waveReach = unlocks, not kills):
wave-4 unlocks 5/8 both arms, wave-5 unlocks 0/8 both arms,
max arc 4 both arms. Arc and wave reach do not move with the
door — as expected; a door arm cannot move the scale wall.

## The offers (what the engine actually put on the table)

75101 (day 132) offered all six lesser doors — feared, beloved,
witness, assimilated, defiant, relay — and relay was earned
via "Stage-3 neural integration. The matrix doesn't care about
your kingdom — it cares how deep you are. (sysbond 0)".
75105 (day 162) offered the same six doors with the same relay
reason (sysbond 0). 75104 (day 90) offered five doors —
witness NOT earned ("You didn't keep the list (1 exposures on
record — the trial needs 3)") — with relay earned the same way
(sysbond 0). Indispensable was never offered on any seating:
it needs a full seat ("The Indispensable needs a full seat —
the galaxy must actually need you, not just notice you"),
which no seed here reaches — consistent with the full-seat
disclaimer, not a new finding.

Doc/code difference, reported not smoothed over: TABLE.md
names sysBond >= 2 (curious) as part of relay's earning, but
src/js/table-relay.js earns relay on stage >= 3 (or stage 2 +
relay office) and prices strength from sysBond — all three
relay earnings here carry sysBond 0. The doc's sysBond bar is
not enforced by the code on this band. Whether that is a doc
lag or an intended softening is a backlog item, not a fix made
here (policy-side arm; no game code touched).

No gate blocked relay on this band, so no blocking gate is
named — the NO-GO branch (relay never entered) did not
trigger. Fallback rules never fired: fallback-non-feared 0,
fallback-Feared 0.

## Village assessment (what the village looked like)

The three seating villages are the band's strong ones: they
reach national standing, survive to a lesser seat, and win
whatever door they walk. The other five villages never sit:
three of them see the table waiting (75103, 75106, 75108) yet
never take a seat in either arm — the seat legs never fire a
ready preview there — and two (75102, 75107) reach global
rank without the table ever appearing. That waiting-without-
sitting class (75103-class) is already in the findings backlog
from the defiant-door arm; it recurs here unchanged and is
not chased in this arm. The door rule does not create or cure
it: waiting seeds are identical across arms to the day and
the death.

Who thrived and who died and why, in one line per class:
seating villages thrived on courtship + contest strength
(the audit on 75101 reads 15 contests survived, 3 crises);
waiting villages died or survived without sitting for
reasons the door cannot touch (preview never ready, or no
table at all despite global rank). Nothing in this run
suggests the door is the binding constraint on the scale
wall — the wall is upstream of the seat (reaching a seat at
all), and downstream the doors all win once reached, at
least on this band under first-option beats.

## Sense test (non-measured replay, seed 75101, armed)

File: evidence/2026-10-28/sim-seatpath-a-sense.txt (258 lines,
240 narration lines; replay trajectory shifts are stated here
and the text never enters any count — the replay itself also
ended tableDone with path relay, branch grey, on day 132,
the same outcome as the measured run).

The story reads as the Relay, not as a re-voiced Feared walk:
the seat opens with the audit ("A lesser seat — national
standing, waves 1–3 faced (17/7/3), with 1 wave-4 fought, 15
contests survived, 3 crises weathered"), then the merge
("You plug into Haven's switchboard — or deeper, straight
into the wires. The other paths used the System as terrain.
Here it is the relationship"), probe beats with backfires
("it mislearned. You taught it something true and it learned
something wrong, confidently, at scale") and discoveries,
relay abilities granted in play (Deep Listen, Faithful Carry,
Relay-sight, then Sanctuary and Advocate), and the grey-band
final: "The middle road is open" → "Stay both-hands. No merge,
no champion" → the System accepting an unclean answer ("BOTH
HANDS. THE TENDER ONE TEACHES. THE TOTAL ONE WINS. ...I CAN
DO THAT. I CAN BE BOTH."). Branch grey is voiced in-band,
never revealed as a surprise — exactly the gradient law.
The audit's "1 wave-4 fought" is a fought count, not a kill
count; no kill claim is drawn from it.

One line in the replay names the full-seat bar out loud at
the seat: "Even now the wave-5 bar reads: armor the village
(2 of 4 fighters armored); blood your fighters (0 of 2
veterans)" — the full seat stays visibly out of reach while
the lesser seat is won. That is the scale wall in one line:
the lesser doors are all open and all winnable; the full
door is priced in armor and veteran blood this village does
not have.

## Balanced panel (§15) — attempted, self-compare only

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-28/perseed-seatpath-a/summary.json --after
<same> --out /tmp/panel-seatpath-test`. Unlike prior arms
(which hit a TypeError in comparePanels), the tool ran this
time and wrote /tmp/panel-seatpath-test.md/.json — but with
before == after (the same summary file: no panel-driver
artifacts exist for this custom corpus), so every paired
delta is trivially 0 and the decision is "review_required".
That self-compare proves nothing about armed-vs-baseline; it
is reported here so the attempt is on the record, not as a
panel verdict. The real before/after comparison is the
paired sweep tables above, on identical seeds, judged
against the pre-registered bar. The panel-contract lane owns
any ingestion fix; not chased here.

## Telemetry deviation check (loop body step 10)

Ran: `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/perseed-seatpath-a/*.json' --metrics
national,table,wins,exiled`. LOUD lines: "national disappeared:
baseline 12 -> current 0" and "wins disappeared: baseline 16 ->
current 0" (n=17 files — the glob also catches summary.json).
Verdict: EXPLAINED, artifact class, not a real disappearance.
The checker reads top-level `national`/`wins` keys that
per-seed sweep rows do not carry; the rows carry
nationalEver/entered/won, and on those fields this band shows
nationalEver 7/8 and wins 3/8 per arm — national and wins did
not disappear, the schema differs (the same WINSEAT-regime
mismatch the w4damage arm documented). Baseline NOT rolled
forward. No investigation item beyond the schema note.

## Blanks filled or documented

- FILLED (measured): relay-door path diversity on the
  75101–75108 band — relay offered on 3/3 seatings, walked
  3/3, won 3/3, all lesser, with first-option beats. The
  "all lesser/Feared" picture on this band was an artifact of
  first-option answering, not of door availability: six
  lesser doors were offered on two seatings, five on the
  third.
- DOCUMENTED (not chased): (1) TABLE.md sysBond >= 2 vs code
  stage-only relay earning (sysBond 0 on all three earnings)
  — doc/code gap for the backlog; (2) 75103-class
  waiting-without-sitting recurs unchanged (already in the
  backlog from the defiant-door arm); (3) global rank without
  any table appearing (75102, 75107) — a seat-leg/table-
  appearance question for a future arm, not a door question;
  (4) panel ingestion for custom sweep corpora still has no
  real before/after path (self-compare only this run).

## Next blank (for the coordinator, not chased here)

The doors are not the wall: every lesser door offered here
wins under first-option beats. The next measurement that
could actually move the picture is not another door — it is
why waiting villages never sit (75103-class) and why global-
rank villages never see the table (75102/75107-class), or a
band where a door LOSES (a losing relay walk under harder
beats, e.g. trial opt-in, would test whether relay's win
here is the door or the first-option beats underneath it).

## Metric review

- The pre-registered GO rule counted relay WINS as reported
  but not required; relay won 3/3 anyway, so no tension
  between "walked" and "won" arose. No revision proposed.
- The substrate-activation gate's "courtship combined"
  definition (sum of leanlinkrescue court* counters in the
  corpus rows' ctxExtra) worked as written (38 total, 8/8
  non-zero). No revision proposed.
- The panel §15 instrument could not produce a real
  before/after comparison for this corpus (self-compare
  only). If the panel-contract lane wants door arms in the
  panel, the corpus needs a panel-driver shape — a metric-
  review note for the NEXT run's design, not a re-scoring of
  this run (the paired tables stand as the comparison).
- WaveReach (unlocks) vs kills: this sweep's wave column
  must not be read as kills in any downstream roll-up. A
  future evidence template should label the column
  "waveUnlocks" to prevent the misread. Proposed for the
  next run, not applied retroactively here.
