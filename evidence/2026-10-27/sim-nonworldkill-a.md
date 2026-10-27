# sim-nonworldkill-a — RE-MEASUREMENT (run fleshout-20261027T0525Z, axis scale-onramp)

DIAG ONLY — zero src/js changes, zero default flips, recorders only.
This run designs and lands NO game fix. A re-measurement of the
non-world TB kill funnel on the current base IS the deliverable.

Pre-registration: evidence/2026-10-27/sim-nonworldkill-a-prereg.md
(written BEFORE any sweep in this run, judged only against it).

## VERDICT: DIAG-NO-GO (control moved — gap named, not hidden)

- Leg (a) CONTROL: FAILED. The armed band does NOT reproduce the
  published control band — 10 of 15 headlines deviate (table
  below). Per the pre-registration, a moved headline baseline is
  itself a DIAG-NO-GO gap. The verdict is NO-GO even though legs
  (b) and (c) pass on their own terms on this base (below) —
  the numbers below describe THIS base, not the w4funnel band,
  and must not be compared to it as if the baseline held.
- Leg (b) KILL ASSIGNMENT: passes on this base — every wave-4
  kill (2/2) is assigned an initiation channel, unclassified 0.
- Leg (c) NON-WORLD CHARACTERIZATION: passes on this base —
  the non-world channel is counted (36 null-origin fights, 1
  null-origin wave-4 fight, 0 null-origin wave-4 kills) and the
  73678-day-115-type kill does NOT recur (answer: no).
- Detgate PASS on the current base (seed 73671, recorders OFF vs
  plain: days 180/181, tsNationalDay 91 both, no diag surface,
  no wraps installed) — so the control deviation is BASE
  MOVEMENT between 2026-10-25 and 2026-10-27, not recorder
  interference. Note the detgate's own tsNationalDay is 91,
  against 77 on the October 25 base: 73671 reaches national 14
  days later than it did on the old base.

## CONTROL GATE — FIELD-BY-FIELD (control vs this run)

| field | control | this run | delta |
|---|---|---|---|
| raids | 85 | 89 | +4 |
| raiders | 361 | 382 | +21 |
| deaths | 234 | 284 | +50 |
| national-ever | 7/8 | 7/8 | 0 |
| national-final | 6/8 | 5/8 | -1 |
| table invited | 4/8 | 5/8 | +1 |
| table entered | 4/8 | 4/8 | 0 |
| wins | 4/8 | 4/8 | 0 |
| median survival | 135d | 130d | -5 |
| wave-3 reached | 8/8 | 8/8 | 0 |
| wave-4 reached | 6/8 | 5/8 | -1 |
| wave-5 reached | 0/8 | 0/8 | 0 |
| starvation deaths | 5 | 2 | -3 |
| pool total | 1,494 | 1,442 | -52 |
| pool wave-3+ | 107 | 161 | +54 |

Per-seed trajectories (control end/days/won vs this run):
73671 survived 180d vs survived 180d (same end, different
interior: deaths 45 this run); 73672 won lesser d97 vs
over-other d118 won; 73673 won lesser d124 vs village-lost
d32; 73674 survived 180d vs over-other d118 won; 73675 won
lesser d135 vs village-lost d169; 73676 village-lost d70 vs
over-other d144 won; 73677 village-lost d143 vs over-other
d130 won; 73678 won lesser d116 vs village-lost d122.
Only 73671 ends the same way; 73673 collapses 92 days
earlier than its control win, and 73678 — the seed that
produced the October 25 strike kill — never reaches wave 4
at all this run (wave 3, village-lost d122). Corpus: PASS,
recorder errors 0 on all six recorders, no overflow.

## THE ANSWER, FIRST (plain words, this base only)

On this base the non-world door produced nothing, and the
feast door produced nothing either. The band's two wave-4
kills both came the ordinary way: a monster already standing
on the scholar's tile bumped into her, and villagers killed
it. The feast draw fired ten times and killed eight monsters,
but drew no wave-4 monster at all — no strike, no repeat of
the cookfire kill that made the only veteran on the old band.
The village that made that kill last time died this time
before it ever reached wave 4, so there was no feast-draw
strike to repeat. And the one fight that did start with no
world monster on the tile and a wave-4 monster in it — a
Suburb on the last day of the longest run — produced no
kill. So on this base the funnel accounting is complete
without the non-world channel: both wave-4 kills are
world-bump kills, and the non-world channel's veteran yield
is zero. But because the baseline moved, this does not
revise the October 25 answer — it says the October 25
answer no longer has a band to stand on.

## CENSUS (b) — PER-KILL INITIATION CHANNEL TABLE

Band wave-4 log entries (all channels): 2, both TB, non-TB 0.
Every wave-4 kill is initiation-classified (unclassified 0).

| seed | day | monster | by | via | door | sub | origin | start day / arg | fight shape |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 121 | congregation | gen_yxyq6c6 | player | world-bump | — | world-origin | d121 / congregation | scholar 100 HP + villager visjoin_93 100 HP vs congregation 990/1006 HP; tile monster = congregation; stack monsterTurn |
| 73677 | 113 | influencer | gen_g38w18q | companion | world-bump | — | world-origin | d112 / influencer | scholar 100 HP + villager gen_g38w18q 97 HP vs influencer 918/918 HP; tile monster = influencer; stack monsterTurn (second of two d112 starts; the first, solo vs 994 HP, wrote no kill) |

No wave-4 kill is null-origin, feast-draw, contest-arena,
wanderer-pending, tent-intruder, door-flee-reengage,
glasswing-trap, policy-direct, direct-build, or other.
Refused 0, thrown 0, table-trial 0 on this band (counted
separately, none occurred).

## CHANNEL SHARES + VETERAN YIELD BY CHANNEL

TB initiations: 188 (starts) — but see the no-fight-call
note below: 155 of them produced a fight with an end row;
33 produced no fight at all; ends total 156 including 1
direct-build end. Initiation counts below are startCombat
calls, not fights; kill counts are tbEnd log deltas.

| door | initiations | share | wave-4 fights (known wave) | wave-4 TB kills | wave-4 killers | living veterans at end |
|---|---|---|---|---|---|---|
| world-bump | 129 | 68.6% | 17 | 2 | 2 | 1 |
| contest-arena | 26 | 13.8% | 1 | 0 | 0 | 0 |
| wanderer-pending | 23 | 12.2% | 0 | 0 | 0 | 0 |
| feast-draw | 10 | 5.3% | 0 | 0 | 0 | 0 |
| tent-intruder | 0 | 0% | 0 | 0 | 0 | 0 |
| door-flee-reengage | 0 | 0% | 0 | 0 | 0 | 0 |
| glasswing-trap | 0 | 0% | 0 | 0 | 0 | 0 |
| policy-direct | 0 | 0% | 0 | 0 | 0 | 0 |
| other (unclassified) | 0 | 0% | 0 | 0 | 0 | 0 |

All-wave TB kills by door (log deltas, 100 total):
world-bump 50, contest-arena 32, wanderer-pending 10,
feast-draw 8, direct-build 0.

Veteran yield detail: world-bump's 2 killers split — 73677's
gen_g38w18q is living at end (in roster, gateLiving true),
73671's gen_yxyq6c6 is dead at end (in fallen, gateLiving
false) even though its village survived 180d. So world-bump
produced 2 kills but only 1 living veteran. Feast-draw
produced 8 kills across waves 1–3 (fights: w1 3, w2 5,
w3 2, w4 0) and 0 wave-4 veterans.

## CENSUS (c) — THE NON-WORLD CHANNEL, CHARACTERIZED

Origin axis (independent of door, 188 initiations):
world-origin 92, null-origin 36, world-origin-mismatch 15,
world-origin-unresolved 45 (the 45 mid-uncaptured starts:
33 no-fight calls + 12 adopted same-call-routed fights —
their doors are known, their monster wave is not captured
from fighters; adopted args are all wave 1–3 types, so the
known wave-4 fight count below is not understated by them).

- Null-origin fights: 36 (19.1% of initiations) — the
  w4funnel class is still common, not an edge case.
- Null-origin wave-4 fights: exactly 1 — 73671 d179, suburb
  (arg suburb, no tile monster). It produced no kill.
- Null-origin wave-4 kills: 0. Non-world veteran yield: 0.
- Recurrence check (the 73678-day-115-type kill): DOES NOT
  RECUR. Seed 73678 this run: village-lost d122, wave 3
  only, 0 wave-4 spawns, 0 wave-4 log entries, 2 feast-draw
  fights (neither wave-4). Band-wide feast-draw wave-4
  kills: 0 (against 1 on the October 25 band, on a baseline
  that no longer reproduces — not a like-for-like decline,
  a different band).

No-fight-call note (counted, not hidden): 33 starts on
73675 (days 113–152, all world-bump, all against the same
lingering titan herald, seq 26, on the player tile) have
fighters null, fightId null, and no end row — startCombat
was called and no fight resulted. They inflate the
initiation count (188 calls vs 155 fights with end rows)
but hide no kill: the band's wave-4 log entries are 2,
both end-joined. A future recorder version could resolve
their wave from arg/tile instead of fighters alone (see
Specification below) — but on this corpus their monster
(the herald, a wave-4 type) is already named by arg/tile,
so the wave-4 call count including them would be 18 known
fights + 33 no-fight calls, still 0 kills from them.

## SENSE-TESTING READ (one kill's initiation context)

73677's Influencer kill reads sensibly in-fiction, and it
reads as a village kill, not a solo hero beat. The scholar
meets the Influencer on her tile twice on day 112: first
alone against it at full health (994 HP), then beside
villager gen_g38w18q (scholar 100 HP, villager 97 HP,
Influencer 918 HP). The kill lands the next day, credited
to the villager via 'companion' — the person standing
beside the scholar struck the blow that mattered. That is
exactly what the village-as-protagonist fiction promises:
the scholar does not solo a Mirror Draft monster; she
brings a villager, and the villager's blow counts. The
73671 Congregation kill reads the same way (scholar +
villager visjoin_93 against a 990-HP Congregation). The
oddity in this run's sense read is not the kills but the
non-kills: 33 times on 73675 the engine calls for a fight
with a lingering titan herald standing on the scholar's
tile and no fight happens — a monster that is present,
named, and never fought, 33 times. That reads as a
presence without a meeting, and it is the same
arrival-to-encounter gap the w4funnel census named, in a
new costume.

## VILLAGE ASSESSMENT (plain words)

These eight villages are not the October 25 villages any
more, even though the seeds are the same. Three villages
that won on the old base die early or late on this one
(73673 at day 32, 73675 at day 169, 73678 at day 122),
and three that died on the old base win on this one
(73672, 73674, 73676, 73677 — four wins, same count, different
villages). The wall numbers on this base: national-ever
7/8, national-final 5/8, table invited 5/8, entered 4/8,
wins 4/8, wave-4 5/8, wave-5 0/8, Arc IV 5/8, median
survival 130d, max 180d, deaths 284. Wave 5 is still
unreached anywhere, and wave-4 kills are still rare (2 on
the whole band) — but the rarity now comes with a
different shape: the kills that do happen are world
fights, and the feast door that produced the old band's
only veteran drew nothing above wave 3. If the scale wall
is a veteran wall, on this base it is a world-fight wall
again, and the non-world channel is a bystander: common
as a fight shape (36 null-origin fights), empty as a
veteran source (0).

## BLANKS FILLED OR DOCUMENTED

- FILLED (on this base): every wave-4 kill's initiation
  channel (2/2 world-bump, world-origin); the non-world
  channel's count and yield (36 null-origin fights, 1
  null-origin wave-4 fight, 0 kills, 0 veterans); the
  recurrence answer (the 73678-d115-type kill does NOT
  recur — 73678 never reaches wave 4 this run).
- DOCUMENTED, NOT FIXED (named gap): the control baseline
  moved between 2026-10-25 and 2026-10-27 (10/15 headlines),
  so this run cannot confirm or revise the October 25
  feast-draw answer — the next arm on this question needs
  a fresh control band on the current base first, or it
  will keep measuring drift and calling it design.
- DOCUMENTED, NOT FIXED: the 33 no-fight bump calls on
  73675 (lingering titan herald, days 113–152) — a
  startCombat call that produces no fight, counted here
  but unexplained in mechanism (read from the corpus, not
  from code — the recorder records the call, not why the
  engine produced no fight).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## SPECIFICATION (not a proposal) — what a future fix would need to show

A future arm that re-opens this question would need to show,
on a base whose control band reproduces first: (1) every
wave-4 kill initiation-classified with unclassified 0 on
that base; (2) the non-world channel counted the same way
(null-origin fights, null-origin wave-4 fights, kills,
veterans); (3) the 33-call no-fight class resolved — either
a recorder version that names the wave from arg/tile when
fighters are gone, or a code reading of why a bump call
produces no fight — so initiation counts and fight counts
stop diverging. None of that is a game change proposed
here; it is the measurement bar the next run would have
to clear.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its pre-registered DIAG-GO legs: (a) control exact
(FAILED — 10/15 headlines deviate, table above), (b) every
wave-4 kill assigned (2/2, unclassified 0 — passed on this
base), (c) non-world channel characterized including the
recurrence check (36 null-origin fights, 1 null-origin
wave-4 fight, 0 kills; recurrence NO — passed on this
base). Because leg (a) failed, the verdict is DIAG-NO-GO
with the gap named, and legs (b)/(c) are reported as
this-base results, not as a GO. One method note, not a
revision: the proof test (scripts/test-nonworldkill-a.js)
was extended in this run with a corpus block (26 unit
tests + 20 corpus assertions = 46/46) that asserts the
verdict fields structurally — unclassified 0, every
wave-4 kill joined to a start row with a known door, and
the origin partition — without baking in any count from
the October 25 run, so a moved base fails on its own
numbers rather than passing on stale ones. The
telemetry-check and balanced panel were NOT run, per the
standing exception for recorder rows (panel cannot ingest
per-seed recorder corpora). The sweep-compare table +
analyzer output are the comparison of record. The
telemetry baseline was NOT rolled. No game code changed in
this run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added).

## Infrastructure notes

- Sweep: scripts/test-nonworldkill-diag-sweep.js run
  VERBATIM (never edited), with EVID pointed at this run's
  own corpus dir. Corpus:
  evidence/2026-10-27/perseed-nonworldkill-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-nonworldkill-diag.js (EVID override, writes
  analysis.json into the corpus dir). Recorder:
  scripts/policies/nonworldkill-diag.js (verbatim, never
  edited). Unit + corpus proof: scripts/test-nonworldkill-a.js
  (46/46 — corpus block added this run, see Metric review).
- Detgate PASS (seed 73671, current base). No EPERM flap
  blocked this run's writes; all 8 rows wrote first try.
- Commit: sim-nonworldkill-a (this run), DIAG-NO-GO,
  zero src/js diff. Ready for coordinator merge; NOT
  pushed, NOT bumped, live NOT verified (coordinator/
  ship-loop line, not this arm's).
