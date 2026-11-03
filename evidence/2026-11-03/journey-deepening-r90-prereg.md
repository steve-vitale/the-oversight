# Journey leg: DEEPENING (days 40–80) R90 — "WAVE-4 KILLS IN THE WILD" — 2026-11-03

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r90 plays deepening, writes 2->3
at closeout. Base: master 9d489bcd3 at worktree creation. Policy: competent
(pinned, r89 driver lineage) + W4 wild-fight instruments (harness-only
wraps/reads, zero gameplay effect). Seeds: fresh 93301–93304 (fresh-band
check: r89 used 93201–93204, r88 93101–93104). Horizon: DAYCAP=100,
death-aware stop. Smoke seed 93300 (outside the main band) x DAYCAP=45
proves instruments before the main run; smoke outputs deleted after the
check.

Context: Steve 2026-11-03 made winnability the top priority. The open
problem, per the Nov 3 alignment picture, is wave-4 kills achievable in the
wild: wild ally-join now works, yet the funnel sits at one village in
twenty banking two living wave-4 killers, with only two kills in
eighty-three wild wave-4 fights and no wave-5 kill. Canon
(docs/MONSTER-WAVES.md): wave 4 is the Mirror Draft, gated on standing
>=100 plus combat readiness (armored / armed / tricks / veterans bars);
wave-4 beasts carry 850–1500 HP. This run measures the wild wave-4 fight
itself in the deepening window — not the readiness gate, not the funnel
downstream — under natural competent play: when a village meets a wave-4
beast in the wild, does it fight, does it kill, and what decides it
(party size, gear, damage dealt before the fight ends)?

## Leg question

Under natural competent play in the deepening window, do villages kill
wave-4 beasts in wild fights — and for every wild wave-4 fight, what were
the party, the gear, the damage fraction dealt, and the outcome class?

"WILD" here = turn-based field fights driven by the competent policy
(fightsLog) plus fieldFight() calls (shipFights), as opposed to arena
contests. A fight with no wave-4 monster is not a wave-4 fight, even if
the village has unlocked wave 4.

## Binding metrics (NO-GO never re-scored; revisions go to "metric review")

- W4-REACH (descriptive, reported not gated): seeds with >=1 wild wave-4
  fight recorded (fightsLog or shipFights). Zero W4 fights across the
  panel is a reachability finding for the deepening window, NOT a defect
  claim — wave 4 may simply not unlock inside DAYCAP=100 on these seeds.
- W4-KILL (diagnostic, always with its denominator): kills / wild wave-4
  fights. A 0 with opportunity (fights fought, not fled) is reported as
  0/N-fought; a 0 with no fights is reported as no-opportunity, never as
  a broken kill path.
- W4-OUTCOME (diagnostic, per fight): day, monster(s) incl. veteran flag,
  party size (leader + allies at fight start), leader weapon (name/range)
  and armor bonus, damage fraction dealt (1 - endMonsterHp/hp0Total),
  rounds, outcome class: kill / player-fled / player-died /
  monster-fled / ended-alive / unresolved. Every W4 fight in the panel
  appears in the table; no sampling.
- W3-BASE (comparison base, same fields): outcome classes and median
  damage fraction for wild wave-3 fights, so a W4 shape can be judged
  against the wave below it rather than against nothing.
- M4 people — >=10 transcripts sense-read (days 45/60/80), 0 senseless.
  Bar: the NPC wants something, options engage or deflect it, endings
  resolve/plant/owe; no fabricated shared history, no filler loops.
- M5 winnable (descriptive, not a gate) — villages with endReason
  survived (r89 metric review: roster-alive is the wrong proxy; a
  village-lost village can still show 9 roster alive).
- STAY-GREEN: death-honesty mislabels == 0.

## What would count as interesting

- A wild wave-4 kill with its party and gear recorded.
- A wild wave-4 fight where the party dealt >=50% of the beast's HP
  before dying or fleeing (damage is close, staying is the gap).
- A wild wave-4 fight the competent policy walks away from despite the
  wave-4 readiness bars reading met (avoidance, not inability).
- Zero wave-4 meetings on a seed whose standing reached >=100 (gate met,
  no meeting — a spawn/reachability shape, not a combat shape).
- A wave-4 fight where an ally joins and the outcome class still ends
  player-fled or player-died (ally-join working but not saving fights).

## Instruments (r90 additions, harness-only)

- Fight-start snapshot on every fightsLog record: party (all fighters'
  key/kind/monsterId/HP), leader weapon name+range, leader armor bonus,
  veteran flag per monster.
- classifyFightOutcome(rec): pure derivation from endHp + over flag;
  proof-tested on fixtures before the main run.
- Analyzer reports the W4 table, W3 medians, readiness snapshots, M4
  transcript scan, M5 by endReason, STAY-GREEN mislabels.
