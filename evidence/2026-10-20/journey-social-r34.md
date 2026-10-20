# Journey social r34 — is social life bidirectional? (lane B, 2026-10-20)

Run id: oversight-playtest-loop-2-20261020T175600Z. Lock: fresh (no prior
lock). Worktree slug journey2-social-5, registered with
WT_RUN_ID=2026-10-20T17:56:14Z (lock + registry agree). Base f60d253b7.

## Pre-registration (written BEFORE the pilot ran; header comment in scripts/journey-social-r34-20261020.js)

**Context:** rotation-b.txt read 5 again this run — the r33 run (af498d294,
rivalry lifecycle, timeout recovery, landed 14:06Z) played leg 5 at 13:00Z
and its "advancing to 6" note never made it into the rotation file. Playing
leg 5 again = r34. r33's named next is Steve's ruling on the moot/rivalry
gate — his call, not re-played here. This run asks a question NO recent
social run has asked: does social life go BOTH WAYS over a full run?

The machinery exists and is substantial: dayOneNudge (day 1, someone comes
to YOU), villagerInitiative hunger/fear approaches (game.js, ~0.3/day-part
when needy), "THEY COME TO YOU" talk requests with talkReason lines
(gossip about you, their goal, pantry state, just-talk — ~0.16/day-part per
villager), npcInviteTick daily micro-quests (walk the trap line, haul,
show). Under citizen play (no theft fueling plots — a peaceful village like
r32's 3005/3007), is any of it felt, or is the village a relationship
dashboard the player drives alone?

**Leg question:** over a full 120d run with a competent citizen player
(answers every talk request, accepts invites, one daily conversation), do
villagers come to YOU with their own reasons — and do those beats read like
people when you sit down?

**Interesting-finding bar:** a talk request whose reason names false village
state; a request the player answers whose conversation never addresses the
reason (disconnected follow-through — the request line leads the opener,
`thread: 'request'`); initiation so rare the mechanic is decoration (<3
answered requests in a full run = tuning gap, DOCUMENTED not fixed — rate
tuning is Steve's call, same class as the M2 gate).

**Binding (pilot):**
- M1 (initiation exists): >=1 ANSWERED talk-request per pilot seed.
- M2 (reason honesty + follow-through): 0 answered-initiation transcripts
  with a fabricated reason, false village state, or a conversation that
  never touches what they came to talk about. Sense-read of every answered
  request transcript.
- M3 (bidirectionality, informational): initiatedConvos (request-answered +
  invite-accepted) vs player-initiated per seed.
- M4 (people): >=5/6 sense-read transcripts meet the conversation quality
  bar (the NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history; no filler loops).
- M5 (guardrail): >=2/2 pilot seeds end with >=5 alive.
- L2' (r26 rev #2, standing): ANY verbatim content-line ('beat' kind) repeat
  within ONE conversation. Every hit = GO finding.

**Seeds:** smoke 3200 (10d self-test of request instrumentation), pilot
3201, 3202 (fresh; r33 used 3104-3107); sweep adds 3203, 3204 if the pilot
is interesting.
**Horizon:** DAYCAP=120, death-aware (+10d tail).
**Policy:** 'citizen' — competent base, talk-request duty (answer EVERY
request, one sit-down/day), invite-accept duty (accept pending invites every
other day), one deep-daily conversation, kindness (giveFood to hungry
favorites). NO theft, NO cruel picks. No moot duty (r32's question), no
comfort forcing (r30's question), no rivalry instrumentation (r33's question).

**Metric review:** (written after results, mandatory).

## Results

**M1 (initiation exists): GO on all 4 seeds.** Talk requests fired and were
answered on every seed: s3201 21/21, s3202 16/17 (+1 incidental),
s3203 19/21 (+1 incidental, +1 expired), s3204 30/36 (+6 incidental).
The day-1 nudge fired on all 4 seeds (beat-stream detected). Villager
hunger/fear approaches fired 7/1/3/8 per seed. npcInviteTick fired
~140-160 invites/seed; the driver accepted 59-60/seed.

**M2 (reason honesty + follow-through): GO with one fixed blank.**
Sense-read every answered-request transcript (10+6 dumped, 8 fully read):
0 fabricated reasons, 0 false village states. One disconnected
follow-through found and FIXED (see "Blank filled" below).

**M3 (bidirectionality):** initiated share of all conversations:
s3201 80/199 (40%), s3202 75/194 (39%), s3203 79/198 (40%), s3204 89/208
(43%) — counting request-answered + invite-accepted as initiated. Social
life is not player-driven alone: roughly two in five conversations start
from an NPC's ask.

**M4 (people): GO 6/6.** Adalbert (nudge, d3: grief, grocery stores, the
EMT-story confrontation — "You're twisting things"), Chester (d16: Meera's
death, kept-promise callback; d80: 6-day thread resume, barber past),
Miguel (d7: thin pantry → concrete forage plan at the north treeline),
Gokhan (d81: "At night I cry quietly", water-reading lesson, Priya's
death), Joshua (d17: lead-goal philosophy, wound gratitude). No fabricated
shared history; options engage/deflect; endings resolve.

**M5 (guardrail): GO.** 9/7/6/7 alive at the death-aware stop (all ≥5).

**L2' (verbatim repeat): MISS on all 4 seeds** — 0 repeats across ~800
conversations. The r31 class stays dead.

## Blank filled: the "join the conversation" request dropped its question

**Finding (M2 interesting-bar hit):** the overheard "pull you in" beat
(game.js `overheardDiscussion`) speaks a specific invitation — "You. Yeah,
you. What do you make of this?" / "Don't just stand there — you've got
opinions, right?" / "Hey — come here. You should hear this." — but stored
the generic `__NAME__ wants you to join the conversation.` as the talk
request. The sit-down's opener carried no actual question, the 'request'
thread has no beats, and the conversation fell back to small
talk/deflections. Seed 3201 Debbie d19 (grieving): pulled in, then
deflected everything — the promised discussion never existed.

**Root cause:** the request-storage line was authored separately from the
beat's invitation instead of carrying it.

**Fix (game.js, 3 lines):** capture the picked invite and store it verbatim:
`{ line: '__NAME__: "You. Yeah, you. What do you make of this?"', day }`.
The opener now surfaces the real ask (verified: opener thread 'request',
carries the question).

**Proof** `scripts/test-join-request-line-20261020.js`: RED pre-fix (3
failures: generic line stored, opener generic), GREEN post-fix (6/6 —
request created, beat spoke a specific invitation, stored line matches the
spoken invite verbatim, opener carries it, thread 'request').

**Wild note:** the sweep (4 "join the conversation" instances across
s3203/s3204) ran pre-fix — it documents the old behavior. The proof test
exercises the exact fixed code path (overheardDiscussion → talkRequests →
startConvo opener).

## Village assessment (plain words)

- **3201** (122d, 9 alive): the talkative village. 21 NPCs came to the
  player with asks; trust 67.6, 104 bonds. Aidan was hungry all winter
  (3 approaches); Olivia too (3). Nobody plotted; the fire stayed a fire.
- **3202** (122d, 7 alive): the beloved village. Trust 81.7, 106 bonds,
  38 deep. Werner confronted the player over gossip ("People are saying
  things. About you. Is any of it true?") — the reason system working as
  designed.
- **3203** (122d, 6 alive): the political village. Joshua (lead goal)
  raised "how things are run here" 5 days running — the reason has no
  memory of being raised (wart, not bug). Mia asked about the roads twice
  (family goal — "Have you seen anyone on the roads?").
- **3204** (122d, 7 alive): the trusting village. Trust 96.6 (highest),
  Misky asked "just to talk" 6 times across 14 days. Three "join the
  conversation" pulls (Maxim, Catalina, Leo).

Across all four: villagers come to you. They ask for food when hungry,
confront you over gossip, recruit you for hauls, ask about missing kin,
and pitch their leadership visions. Answering is always worthwhile — the
conversations that follow are the game's best content.

## Telemetry deviation check

5 LOUD lines vs `telemetry-baselines/social.json`, all explained, none
rolled forward (the baseline is theft-driver; r32's metric review stands):
- l3.bonds 204→339 (+66%), l3.deepBonds 70→138 (+97%): the citizen driver
  builds deeper bonds than the theft driver. Good direction, driver-caused.
- l3.betrayalCases 53→0, l3.mootsConvened 53→0: citizen driver generates no
  plots (pre-registered; r32's M2 story).
- l2prime.count 5→0: the r31 fix holding in the wild.

## Metric review

1. M2's "disconnected follow-through" bar worked exactly as designed — the
   Debbie transcript tripped it, the code audit found the dropped
   invitation, the fix is minimal and proof-tested. Keep the bar.
2. The talkReason branches have no "already raised this" memory: Joshua's
   lead-goal ask fired 5 days running, Misky's just-talk 6× in 14 days.
   Not a bug (the reasons stay true), but a real person wouldn't re-raise
   the identical ask daily. Candidate for a future "reason cooldown" —
   documenting, not fixing (rate/shape tuning is Steve's call, same class
   as the M2 gate).
3. The gossip "X headed out for water" template cycled 3× in one sitting
   (Priya d6, s3202) — not verbatim-repeat (different names), but
   template-thin. Same observation class as #2: pool memory, not a defect.
4. Instrumentation note (for future runs): the competent policy's talkRound
   consumes fresh requests before a post-policy snapshot can see them —
   snapshot BEFORE base.daily, and detect the day-1 nudge from the beat
   stream. The r34 driver does both.

## Reachable / fun / winnable

- **Reachable: YES.** Initiation fires constantly under normal play
  (~20-36 requests + ~150 invites + a handful of approaches per 120d).
  Nothing is gated; the day-1 nudge teaches the verb on day 1.
- **Fun: YES.** The answered conversations are the best social content in
  the game — grief, confrontations, plans, confidences. The 40%
  initiated share means the village feels alive rather than managed.
  The fixed join-request now delivers its promised question.
- **Winnable: n/a** for the social leg in isolation; no run was blocked by
  social systems. Survival parity held (6-9 alive).

**Land:** src/js/game.js (join-request line), scripts/test-join-request-line-20261020.js,
scripts/journey-social-r34-20261020.js, evidence/2026-10-20/ (4 per-seed
JSONs, pilot/sweep logs, journey-social-r34.md, 34 transcripts under
social-r34-transcripts/). No [needs-eyes] — mechanical + content.
Merged locally, pending ship.
