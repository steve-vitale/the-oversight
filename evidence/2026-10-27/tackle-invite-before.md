# Tackle-invite — BEFORE run (unmodified code, 2026-10-27)

Proof test: `scripts/test-invite-accept-character.js`, seed 20261027,
run before any game-code change. `npcInviteDecision` absent (as expected).

## Numbers

Party invites (player -> villager, trust 60, mood steady, fear low,
100 pinned rolls each, real `inviteToParty` path):

- warm/belong + warm bond: 89/100 (bond ignored by old code)
- prickly/alone + hostile bond: 5/100 (bond ignored by old code)
- steady/protect: 74/100
- cautious/escape: 34/100
- overall: 50.5/100

Lure takes (villager -> villager plot, `npcPlotTick`, 100 ticks each;
old code rolls the module-captured random against a flat 0.45, so the
pinned test rolls do not steer it — these are natural-sequence rates,
which is itself the point: character cannot steer them):

- warm-bond target: 39/100
- hostile-bond target: 42/100 (difference 3 points — noise, not character)
- sick warm-bond target: 39/100 (a sick villager still walks out)

## Verdict on the before run

10 passed, 2 failed: "lure warm-bond >=15 points above hostile-bond"
(39 vs 42) and "sick lure target never walks out" (39/100). The gap
Steve ruled on is real and located: the NPC-to-NPC invitation is a flat
roll, and sickness does not stop it.

## Transcripts read (before)

Party accept (warm/belong): the NPC opens by confessing they have been
skimming extra food and are ashamed — they want trust, not small talk.
The player invites them; they accept ("Okay. Yeah. I trust you.") and
join. The choice engages what the NPC just offered.

Party refuse (prickly/alone): the NPC asks what the player did for fun
before, on a perfect Saturday. The player invites them; they refuse in
character ("I work alone. Nothing personal. ...It's a little personal.")
and do not join. The refusal carries a reason, not a wall.
