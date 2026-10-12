# Journey leg 5 — social life, r7 sense-test notes (2026-10-12)

Run: `SEEDS=30303,40404,50505 DAYCAP=140 node scripts/journey-social-life-20261012-r6.js`
in worktree `/home/hatch/workspace/worktrees/journey-social-life` (READ-ONLY run on
coordinator's fixed code; no edits made by this worker).

What changed since r6: (1) `npcMootTick` (betrayal.js) — NPC-accused cases now
convene moots via the victim/closest gathering voices, instead of gossiping forever;
(2) r6's convo-deflect pool fix (rotating brush-offs, per-conversation reset).

Evidence JSONs (script keeps r6 filename stem):
- evidence/2026-10-12/journey-social-life-r6-30303.json
- evidence/2026-10-12/journey-social-life-r6-40404.json
- evidence/2026-10-12/journey-social-life-r6-50505.json

## Run table

| seed | end | fullConvs (nat/forced) | feasts | petition moots | justice trials | player votes | met |
|------|-----|------------------------|--------|----------------|----------------|--------------|-----|
| 30303 | village-lost d78 | 47 (35/12) | 11 | 3 | 6 (d9,d10,d13,d17,d19,d22) | 5 | 11 |
| 40404 | village-lost d107 | 67 (62/5) | 31 | 1 | 0 | 0 | 11 |
| 50505 | village-lost d99 | 51 (46/5) | 22 | 1 | 5 (d10,d12,d17,d18,d25) | 4 | 11 |

165 full conversations, 143 natural ends. 94 distinct choice ids offered —
no static menu.

## Headline: npcMootTick works — 11 justice trials fired naturally

r6's documented blank ("zero justice trials in 3 full runs") is filled. Seed 30303
ran six trials in 14 days against an ambush crew (Hayden/Alejandra/Emma, then
David/Marcus/Alejandra), verdicts 6-1 guilty → cold_war, 4-4 not guilty, escalating
to a murder charge by d22. Seed 50505 ran five, including the PLAYER's own assault
trial on d25: accused by Lucas, convicted 7-0, full exile sentence played
end-to-end ("You — take what you can carry and go." / CRISIS — THE SCHISM /
Codex: Exiled (moot). Walking. / pantry closed). The player voted in 9 trials;
the count is spoken aloud and NPCs remember the vote ("Your 'guilty' lands in the
count, out loud, in front of everyone. The accused hear exactly who said it.").

## Village assessment (plain words)

**Seed 30303 (d78).** The village tore itself apart and then the monsters finished
the job. Fritz and Harold died fighting on d16; Stella starved d28; Lena was taken
by a monster d55; Marcus and Hayden died in combat d56; a d71 combat wipe took
Alejandra, Gonca and Sofia together. Two left: James the carpenter (trust 89,
warm — the player's real friend) and Emma the veterinarian (trust 1, neutral,
basically a stranger who survived). 27 plants in the codex, pantry at 0. What they
knew: a decent foraging vocabulary, six justice trials' worth of hard lessons about
each other. What was missing: food and fighters — the social machinery (moots,
votes, cold war) worked beautifully on a village that couldn't survive its own
fortnight.

**Seed 40404 (d107).** The long, quiet one — the longest-lived social village yet.
Monsters took Marcus, Alma and Berhanu in the first two weeks; Gabriel and Hermann
fell in combat d24/d31; Willie and Detlef died fighting d77; Lena fell in combat
d106 and David to sickness on d107, ending it. Two left: Sofia the gardener
(trust 1, warm) and James the carpenter (trust 2, tense) — the player outlived
everyone they were close to. 40 plants in the codex (best of the three), pantry 0,
31 feasts, 16 aid cries answered, 7 gossip chains with real distortion. What was
missing: justice — zero trials in 107 days, so the courtroom ceremony got no
coverage here; and food at the end (pantry 0, starvation looming). Villagers acted
like people: Sofia's curiosity ("I interrogate the world instead of praying to
it"), James begging for food on day 4 with an edge ("something curdled").

**Seed 50505 (d99).** The exile run. Hank and James died to monsters d14/d21;
Stella starved d26; Kenza died in a contest and Rafael on an expedition, both d38;
then starvation took Lucas d69, Sofia d79 and Lena d92; Carlos fell in combat d83;
Emma to a monster d91. One left: Marcus the electrician (trust 8, neutral).
30 plants in the codex, pantry 0. The defining event: on d25 the village convicted
the PLAYER of assault 7-0 and cast them out — and the player then outlived nearly
everyone from the wilds while the village starved. What was missing: any social
consequence of the exile (see bug #1).

## People check (SENSE-TESTED — full transcripts read)

**The NPCs want things, and the wants are specific.** Day-1 nudges: a villager
with 0 liters of clean water asking you to haul at first light ("Two of us, half
the trips. Will you come?"); Kenza settling near you on day one — "Can we talk?
Just talk — like people used to." First meetings: James on day 4, hungry and
edged: "I hate to ask, but do you have anything to eat? Anything at all? I can't
keep going like this." Friendships: Sofia's curiosity, Stella's belief question.
Endings resolve or plant threads ("Dawn, then. Bring something to carry — and
thank you." / "First light. Don't sleep through it.").

**Best (30303, Stella, day 6, friendship):**
> [NPC] "About that question — Do you believe in anything? Now, I mean. After everything. Anyway, that's me."
> [YOU] "I believe we get through this. I have to. The alternative doesn't work."
> [NPC] "That's not naive. That's load-bearing. Hold onto it."
> [NPC] Something in them almost softens — then doesn't. Not yet.

**Worst (40404, James, day 4, first meeting — the winddown):**
> [NPC] "Anyway — I should get back to it. Good talking, though."
> [NPC] "Right. Go on, then."
> [NPC] "Hm. Never mind — go on."
> [NPC] "...Actually, forget it."

Four consecutive NPC sign-offs, two of them contradicting the first. A person does
not say goodbye four times. (Same pattern: 3 stacked goodbyes closing the Kenza
day-1 talk on 50505, 3 closing the Stella talk on 30303.)

**The deflect fix holds.** The r6 parrot collapse is gone: brush-offs rotate
("I just said — did you miss it?" → "I just told you — what else is on your
mind?" → "We've covered this one. Ask me something else."), zero verbatim
adjacency across all 165 transcripts. Repeated identical PLAYER lines (e.g.
"(follow the food)" ×8, "Tell me more." ×4) are the sim driver's pick logic
mashing one choice, not game text — a real player wouldn't do that.

**Gossip still quiet** (1–7 entries/run; machinery works — distortion, heard-lists —
but the village barely gossips). Carried over from r6; observation, not new.

## Verdict

- **Reachable: YES.** 165 full conversations, talk requests answered, feasts,
  petition moots, and now 11 natural justice trials with player votes that are
  remembered. The social layer fires organically end to end.
- **Fun: YES, with edges.** Moot theater, the belief conversation, James begging
  on day 4 — these read like people. The robotic edges are the winddown
  sign-off stacking, the single-template recap, and the dig-result loop (below).
- **Winnable: PARTIAL — same binding constraint as r5/r6.** All three villages
  died (d78/d107/d99); combat and monster attrition decide runs, with starvation
  rising as villages live longer (50505: 4 starvation deaths). The social content
  is proven on dying villages. 40404's d107 is the longest social run yet, so the
  content does compound when the village holds.

## Bugs / blanks found (with repro)

1. **Exile has no social teeth (50505 — the big one).** The player was convicted
   of assault and exiled on d25 (full ceremony: schism, codex entry, "The pantry
   is closed to you... To Haven, you are not one of ours anymore"). Afterwards
   the sim held 51 full conversations and 22 feasts with the same villagers;
   a day-63 friendship talk with Sofia (trust 90) reads like a fireside chat —
   "Sofia shows you where they go to think. 'Don't tell the others.'" — and she
   asks the exiled-for-assault player to clean her wound. ZERO transcript lines
   across the run mention the exile. Repro: seed 50505 — d25 assault trial
   convicts the player 7-0 → exile; read any C-friendship transcript after d25
   (e.g. day 63, sofia_chen). The talk/conversation system never checks exile
   status. Fix direction: exile should gate (or transform) social access —
   cold shoulders, refused talks, trust decay — or the fiction should change.
2. **Winddown stacked sign-offs.** Natural conversation ends emit 2–4 consecutive
   NPC goodbye lines, sometimes contradictory (see Worst quote above). Repro:
   any naturalEnd transcript; read the final NPC lines (40404 idx=3, 50505
   A-day1-nudge, 30303 idx=7). Fix direction: the winddown should emit exactly
   one closing line.
3. **"Wait — what were we talking about?" recap is near-single-template.**
   Three presses in one conversation returned "Still on that favor." /
   "Tell you what — Still on that favor." / "Probably — Still on that favor."
   (30303 A-day1-nudge). Needs a real recap or a rotating pool.
4. **Bribery dig result is single-template and loops forever.** "(follow the
   food)" → "You follow the food, the gifts, the sudden friendliness. Nothing
   you can prove — yet. Dig again; the trail is still warm." — identical 6× in a
   row inside the d9/d10 moot spans, 8× in one transcript (30303 idx=11). This is
   the exact filler-loop shape Steve called out; the deflect fix didn't cover
   the dig-result line. Repro: seed 30303, any ambush investigation; press the
   dig choice repeatedly. Fix direction: rotating pool like convoDryLine, or
   progressive findings.
5. **Sleep-refusal day-stacking (harness/game boundary).** 40404 ran 137 loop
   iterations for 107 game days; 50505 ran 121 for 99. When `Game.sleep()` is
   refused (silently caught by the harness), `policy.daily` re-fires on the same
   game day — producing 9–10 full conversations stamped on one day (d84/d95 on
   40404 — nine straight D-talk-requests with Sofia; d63 on 50505). Not a
   content bug, but the silent catch hides WHY sleep was refused ~30 times in a
   run; worth instrumenting (and for 50505 the refusals may be the exile
   "Walking" phase, which would make the day-clock itself exile-aware in a way
   worth confirming).
6. **Justice pacing variance (observation).** 30303: 6 trials in 14 days against
   essentially the same crew (narratively coherent — cold war breeds plots — but
   intense). 40404: 0 trials in 107 days. npcMootTick fires correctly; the
   betrayal engine's plot-generation variance across seeds is extreme. No action
   this run; flagged for the balancing loop.

## Notes for the run report

- npcMootTick (the r7 feature under test): WORKS. 11 natural trials vs 0 in r6.
  Player-exile path verified end-to-end for the first time in this loop.
- r6 deflect fix: VERIFIED holding across 165 transcripts, 3 seeds.
- No proof tests written (read-only worker; fixes are the coordinator's).
- No regressions introduced by this worker (nothing was changed).
