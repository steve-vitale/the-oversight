# sim-grantdeath-b — death-cause diagnosis (grantpersist follow-up)

Run: oversight-flesh-out-loop-b, arm sim-grantdeath-b, axis
food-economy. DIAGNOSIS ONLY: zero src/js changes, zero
default flips, zero edits to scripts/grantpersist-trace-b.js
(copied, never modified, to scripts/grantdeath-trace-b.js
and extended there with read-only death wrappers).
NEW scripts: scripts/grantdeath-trace-b.js (death-cause
trace instrument), scripts/test-grantdeath-b.js (proof),
scripts/analyze-grantdeath-b.js (corpus summarizer).
Corpus: evidence/2026-10-28/sim-grantdeath-b-corpus/
(120 files, one per seed × key).

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-grantdeath-b-prereg.md, committed as 8566cd98d BEFORE any judged trace run)

DIAG-GO. Both bearer deaths are named by a recorded cause
with the overnight window and the firing code site — 7/7
reproduced loss instances carry a wrapper-recorded
playerDeath cause, corroborated by registerDeath, the
fallen roll, and telemetry in every case. One flagged
divergence, pre-registered as reportable rather than
verdict-breaking: seed 10041 does NOT have a single cause
across its instances, because each instance is a separate
game whose RNG diverges after the taps — one game starved
its bearer, two games lost theirs in a fight. Every
recorded cause is published verbatim below; none is
inferred from health/kcal.

## Reproduction (judged band: seeds 10040–10047, 15 keys, 2 lead + 5 tap days, substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1)

All 120 instances completed (endReason survived
everywhere); all 120 setup grants succeeded; losses
reproduce EXACTLY as in grantpersist — same 7 instances,
same bearer pairs, same 11 "You don't have that
ability." refusal taps (10041: 1 + 3 + 3 = 7;
10042: 1 + 1 + 1 + 1 = 4). No other seed lost a grant.
One further death was recorded but is NOT a loss: seed
10040 intimidating_presence — the bearer died AFTER the
last tap (post-tap seq 7, day 8 ticks 0), so no snapshot
follows to show an absence. That is the instrument's
horizon working as designed, not a missed loss.

| seed | key | bearer before → after | recorded cause (playerDeath arg) | firing site | window |
| --- | --- | --- | --- | --- | --- |
| 10041 | animal_ken.read_beast | gen_m82yaz8 → gen_31thg6x | starvation | game.js:31787 endDay → playerDeath (resolveDay honestCause) | endDay midnight roll, day 6 ticks 512 |
| 10041 | fear_aura.menace | gen_m82yaz8 → gen_31thg6x | the arena | game.js:44253 tbEnd('lost') → playerDeath | sleep-interrupted wild fight, resolved at day boundary, day 5 ticks 0 |
| 10041 | molt.shed_skin | gen_m82yaz8 → gen_31thg6x | the arena | game.js:44253 tbEnd('lost') → playerDeath | during sleep, day 5 ticks 467 (+32 after post-daily) |
| 10042 | ambush.lay_wait | gen_snpynyq → liam_davis | the arena | game.js:44253 tbEnd('lost') → playerDeath | sleep onset, day 7 ticks 416 (same tick as post-tap) |
| 10042 | blood_trail.follow_blood | gen_snpynyq → liam_davis | the arena | game.js:44253 tbEnd('lost') → playerDeath | sleep onset, day 7 ticks 443 (+32 after post-tap) |
| 10042 | patient_aim.clean_shot | gen_snpynyq → liam_davis | the arena | game.js:44253 tbEnd('lost') → playerDeath | sleep onset, day 7 ticks 443 (+32 after post-tap) |
| 10042 | scarecrow.stage_injury | gen_snpynyq → liam_davis | the arena | game.js:44253 tbEnd('lost') → playerDeath | sleep onset, day 7 ticks 416 (same tick as post-tap) |

## Mechanism 1 — starvation (10041 animal_ken, the only metabolic death)

The bearer went to bed with nothing left and the night
collected. Last-present snapshot: health 71, kcal 0,
hydration 78, no wounds, no diseases (day 6, ticks 401).
During sleep, two wild encounters hit first — the
Cliffhanger Drag for 19, the Death Roll for 11 — then a
cold snap, then the midnight spiral warning, then endDay's
resolveDay (src/js/engine/calories.js) reported the
honest cause 'starvation' and endDay (game.js:31787)
called playerDeath with it. Death-entry body: health 0,
kcal 0, hydration 23. Corroboration is unanimous:
registerDeath cause 'starvation' (player: true), fallen
entry { villagerId: gen_m82yaz8, day 6, cause:
'starvation', name: 'Hans' }, telemetry death record
{ who: gen_m82yaz8, cause: 'starvation', player: true }.
Grantpersist's note that this instance had "two hungry
0-kcal tap days before the switch" is the mechanism, not
a coincidence: the bearer was already on 0 kcal at the
last two tap-day records (health 77 → 71 while kcal sat
at 0), and the night's metabolism + fight damage finished
a body that had nothing left to burn.

## Mechanism 2 — fight loss, recorded as 'the arena' (the other 6)

Six of the seven deaths are the same played shape: the
bearer is woken during sleep by a wild monster encounter,
fights it turn-by-turn, goes down, and tbEnd's 'lost'
branch (game.js:44253) calls playerDeath('the arena').
Last-present bodies are healthy in the ordinary sense —
health 87–100, kcal 772–950, hydration 72–100, no wounds,
no diseases — so nothing about the daytime body predicts
these deaths; the night's fight does. The bracket
narration shows the fight in every case, e.g. 10041
fear_aura: "The something displaced a LOT of water, and
it wasn't a log SNAPS! … hits you for 17. You go down."
then the death line; 10042 ambush: "Swarm Hum! … The
Swarm Hum hits you for 8. You go down." then the death
line. Corroboration is unanimous in all six:
registerDeath cause 'the arena' (player: true), fallen
cause 'the arena', telemetry cause 'the arena'.

THE LABEL IS THE FINDING. tbEnd is the shared
turn-based fight end, and its 'lost' branch labels every
playerDeath from it 'the arena' — the code comment
(GAP-W4-NARR #107) describes it as the arena-contest
path (Blood pit / gauntlet / siege). But the fights in
these brackets are wild monster encounters that
interrupted sleep, not arena contests: no contest
framing is narrated in the window, the fight begins
with a wild-encounter warning while the bearer is
asleep, and the monster names are wild ones (the
water-displaced thing, the chorus, the Swarm Hum).
The recorded cause is therefore reported verbatim as
'the arena' — that IS what the game recorded — while
the played cause is "lost a wild fight during the
night." A player who reads "dead — the arena" after
dying to a river monster in the wild is being told the
wrong place. That mismatch is a follow-up for a future
arm (label the tbEnd loss by fight origin, or rename
the branch), not a reason to re-score this verdict:
the prereg counts a recorded cause with its firing
site, and both are recorded for all six.

WINDOW CORRECTION to grantpersist's shorthand.
Grantpersist bracketed every loss to "the overnight
sleep/endDay window." Grantdeath refines that: only
the starvation death is an endDay/metabolism death.
The six fight deaths happened inside the sleep window
itself — at sleep onset (10042, ticks 416/443, the
same tick or one 32-tick batch after the last tap),
during sleep (10041 molt, ticks 467), or resolved at
the day boundary (10041 fear_aura, day 5 ticks 0, and
the two post-horizon deaths below, also ticks 0). None
happened during the next day's morning waits: the
waits had not advanced the tick count when the
day-boundary deaths fired, and the sleep-onset deaths
fired before midnight. The tapday-start snapshot is
simply the first snapshot AFTER the night, so it
collects all three night shapes under one bracket.

## Agreement table (all 7 losses)

For every loss: playerDeath cause == registerDeath cause
== fallen cause == telemetry cause, same villager id,
same game day. Zero disagreements, zero UNRECORDED
instances, zero wrapper reinstalls (deathReinstalls 0
in all 7 — no later module re-wrapped the death
functions mid-run, so the single-record guard was never
needed in the judged band, though the proof covers it).

## Extra deaths the instrument caught (not losses, reported)

- Seed 10040 intimidating_presence: bearer gen_3jnykz6
  died 'the arena' (tbEnd) after the last tap (day 8
  ticks 0). No loss follows because the horizon ends.
- Seed 10042 ambush + scarecrow: successor liam_davis
  himself died 'the arena' on day 9 ticks 0, after the
  tap horizon. Two successions in one instance's tail.
  Both extra deaths repeat the ticks-0 day-boundary
  shape, which is why the window classification above
  names it rather than folding it into "morning."

## Sense note (plain words — what the player experienced)

Two different nights, both sensible as played outcomes:

Starvation night (Hans Ruiz, seed 10041): a man who had
eaten nothing for two days, was woken by river monsters
that took 30 health off him, and then lay down in a cold
snap with an empty stomach. The game says it plainly:
"🕯️ Hans Ruiz is dead — starvation. The village stops.
Somebody screams. Somebody else starts digging." Then
Luigi picks up the journal with shaking hands, and the
Codex turns its page: "Hans Ruiz, 6 days. The mantle
passes to Luigi Fisher." That reads as a consequence,
not a glitch — the village fed its shelves (pantry
~27,650 kcal in the telemetry record) while its bearer
starved, which is a story about the village, not a
numbers error. (Whether the bearer should have eaten
from a full pantry is a competence question for the
policy arms, not this diagnosis.)

Fight nights (Hans Ruiz again, Kenneth Neumann): a
bearer asleep in the wild is woken by something in the
water, or by a humming swarm, or by a chorus of throats
— fights it, goes down, and the village mourns the same
way: "Kenneth Neumann is dead — the arena. … Liam
picks up the journal. Their hands shake. Then they open
it, and keep writing." The mourning beat is exactly
right. The one wrong note is the word "arena": nothing
in the night's story was an arena. A player who just
lost a fight to a swarm in the grass and is told they
died in "the arena" will rightly wonder what arena.
Fix the label, keep the beat.

## Metric review (MEASUREMENT.md §14)

Judged against the prereg as written, no mid-run
re-scoring: DIAG-GO required 2/2 seeds named by a
recorded cause, each with window + firing site. Both
hold — 10041 named (starvation + the arena, with the
divergence published rather than papered over) and
10042 named (the arena, all four instances agreeing).
The prereg's divergence clause was used as written:
each instance is a separate game, so 10041's two
recorded causes are both reported and the seed still
counts as named because every reproduced instance is
recorded. A stricter reading ("one cause per seed")
would have failed 10041 — that reading is rejected
here because it contradicts the prereg's own
divergence clause and the fact that the instances are
independent games; the disagreement is flagged in this
file for the next run to see, not hidden.

Instrument limits for the next run (not verdict
blockers):
- The death-stack capture keeps 8 frames. For endDay
  deaths the firing site is frame 1 (endDay:31787
  calling playerDeath directly). For tbEnd deaths the 8
  frames are all tbEnd wrapper layers, so the exact
  driver step that called tbEnd (endDay dawn briefing
  vs harness first drive of the new day) is not
  distinguished for the ticks-0 deaths. Cause + firing
  site are still recorded; only the sub-step is open.
  Next instrument should raise the cap to ~20 frames.
- The 'arena' label mismatch (above) is the game's own
  wording, surfaced by this instrument, not an
  instrument error.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No before/after game leg: zero game changes, zero lever
variants, nothing to panel. Panel metrics (national/
table/wins) do not exist for 7-day instances and are not
estimated. No balance-panel compare .md is produced, as
pre-registered.

## Proof

- `node scripts/test-grantdeath-b.js` — 8/8, exit 0,
  verdict PROOF-GREEN (D1 playerDeath records cause
  verbatim + caller frame + body; D2 double-wrap
  records exactly once; D3 registerDeath opts verbatim;
  D4 bracket diff isolates the since-prev interval; D5
  cause-naming priority + per-bearer fallback; D6
  body-only fixture is UNRECORDED; D7 same-object
  mantle fixture from the grantpersist metric review;
  D8 snapshot body fields). Proof green BEFORE the
  judged band; prereg committed (8566cd98d) before
  that, instrument + proof committed (b4dda6742)
  before the band.
- Judged band: `COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 node
  scripts/grantdeath-trace-b.js` — 120 files, exit 0,
  corpus evidence/2026-10-28/sim-grantdeath-b-corpus/.
  No EPERM flap on this run (all 120 writes first-try).
- Analyzer: `node scripts/analyze-grantdeath-b.js` —
  reproduction table, per-loss detail, verdict counts
  above (2/2 -> DIAG-GO).
- No jest (proofs are node, not jest). No [needs-eyes]:
  diagnosis/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] tbEnd 'arena' label misdescribes wild-fight
  losses: tbEnd's 'lost' branch (game.js:44253) labels
  every playerDeath from it 'the arena', including wild
  monster encounters that interrupted sleep. Future arm:
  label by fight origin (arena contest vs wild fight)
  or rename the branch's cause. Does not change this
  verdict — the recorded cause + site are named.
  (sim-grantdeath-b)
- [follow-up] death-stack cap: raise the instrument's
  frame cap from 8 to ~20 so the tbEnd caller step is
  captured for day-boundary (ticks-0) deaths.
  (sim-grantdeath-b)
- [follow-up] seed 10041 divergence is expected, not a
  bug: separate game instances diverge after the taps,
  so one seed can yield two real death causes. Future
  diagnosis arms should pre-register seed-level vs
  instance-level counting explicitly. (sim-grantdeath-b)

## Convergence line

grant-death diagnosis — grantpersist follow-up: trace
band 8 seeds × 15 keys (120 instances), all 7 losses
reproduce exactly (same seeds/keys/bearer pairs, 11
refusal taps). Causes named, all wrapper-recorded and
unanimously corroborated (playerDeath == registerDeath
== fallen == telemetry): 10041 animal_ken =
starvation via endDay/resolveDay (game.js:31787);
10041 fear_aura + molt and all four 10042 losses =
'the arena' via tbEnd('lost') (game.js:44253) — but the
played fights are wild monster encounters that
interrupted sleep, not arena contests, so the game's
own 'arena' label misdescribes 6/7 deaths (follow-up,
not a verdict change). Window refined vs grantpersist:
only starvation is endDay metabolism; fight deaths are
sleep-onset / during-sleep / day-boundary resolutions.
Seed 10041 diverges by instance (starvation in one
game, fight loss in two) — reported, not hidden.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO — 2/2 bearer deaths named with window + firing site; 'arena' label mismatch flagged as follow-up
