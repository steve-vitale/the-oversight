# Journey leg 5 — social life, r7 (2026-10-12, run 2026-10-12T14:26:03Z)

**Leg:** social life (conversations, gossip, moots, friendships, rivalries across a full run). Rotation 5→6 (succession next).

## What this run did
Picked up the three documented blanks from r6 (2026-10-12 09:30Z run):
1. **Petition-moot speeches single-template** → FIXED: rotating no-repeat pools.
2. **Zero justice trials in ~300 village-days** → PROBED + FIXED: the justice ladder
   fires correctly for player crimes (test-justice harness repaired, 61/61);
   the real gap was NPC-accused cases: `caseDiscoveryTick` promised "There's
   going to be a moot" and nothing ever convened one. New `npcMootTick()`.
3. **Gossip volume 1–6 per run** → observation; re-measured in r7 sims (below).

## Fixes (in worktree, committed this run)
- `src/js/villageAgency.js`: `MOOT_SPEECHES` pools (cannibal/famine-flight/other
  × for/against, 3–4 variants each, original lines kept as anchors) +
  `_vaMootSpeech()` rotation keyed per cause×side on the village. Consecutive
  moots never parrot.
- `src/js/betrayal.js`: `npcMootTick()` — victim (or their closest, if dead)
  gathers voices 3 days, then calls the moot via the existing conductTrial
  machinery. Player is a juror (votes, remembered). Wired into
  `betrayalDailyFull()`. Player-accused/player-targeted cases untouched.
- `scripts/test-justice.js`: was crashing (`seTickFighter is not a function`)
  on a stale hand-copied 13-module eval list — routed through sim-harness
  (full index.html-order list). This is what unblocked the justice probe.

## Proof tests (all GREEN)
- `scripts/test-petition-moot-speeches-20261012.js`: 15/15 — 4-cycles with no
  verbatim adjacency, anchors preserved, unknown-cause fallback, end-to-end
  pair of consecutive cannibal moots speak different lines.
- `scripts/test-npc-moot-20261012.js`: 17/17 — no premature moot, convenes at
  day+3 with honest announcement, idempotent, acquittal via the standard
  2-day vote backstop, conviction → exile removes the NPC from the roster,
  sentence narrated in the open.
- `scripts/test-justice.js`: 61/61 (was crashing before the harness fix).
- Regressions: test-betrayal 80/80, test-moot-grammar ALL GREEN,
  test-moot-justice-aftermath 27/27, test-petition-moot-afterlife 17/17,
  test-gossip-rumors 11/11, test-convo-norepeat-fallback 9/9,
  test-self-gossip-first-person 13/13, test-social-gossip 9/9,
  validate-ontology 84/84. test-moot 38/1 — the 1 failure ("cannot afford:
  no bribe offer") is pre-existing, identical on pristine src.

## Play (r7 sims — subagent, seeds 30303/40404/50505, DAYCAP=140)
Competent+socialite policy on the FIXED code (r6 script). Evidence:
evidence/2026-10-12/journey-social-life-r6-<seed>.json; analysis notes in
evidence/2026-10-12/journey-social-life-r7-notes.md (subagent, read-only).

| seed | end | fullConvs (nat/forced) | feasts | petition moots | justice trials | met |
|------|-----|------------------------|--------|----------------|----------------|-----|
| 30303 | village-lost d78 | 47 (35/12) | 11 | 3 | 6 (d9–d22) | 11 |
| 40404 | village-lost d107 | 67 (62/5) | 31 | 1 | 0 | 11 |
| 50505 | village-lost d99 | 51 (46/5) | 22 | 1 | 5 (d10–d25) | 11 |

165 full conversations, 143 natural ends, 94 distinct choice ids — no static menu.

## Headline: npcMootTick works — 11 natural justice trials
r6's blank ("zero justice trials in ~300 village-days") is FILLED. 30303 ran
six trials in 14 days against one ambush crew (verdicts from 6-1 guilty →
cold_war to acquittals, escalating to a murder charge). 50505 ran five —
including the PLAYER's own assault trial on d25: accused by Lucas, convicted
7-0, full exile sentence end-to-end ("You — take what you can carry and go."
/ CRISIS — THE SCHISM / Codex: Exiled (moot). Walking. / pantry closed).
The player voted in 9 trials; the count is spoken aloud and NPCs remember
("Your 'guilty' lands in the count, out loud, in front of everyone.").

## Village assessment (plain words, per subagent sense-test)
**30303 (d78)** — the village tore itself apart, then monsters finished it.
Fritz and Harold died fighting d16; Stella starved d28; Lena taken by a
monster d55; Marcus and Hayden died in combat d56; a d71 combat wipe took
Alejandra, Gonca and Sofia. Two left: James the carpenter (trust 89, warm —
the player's real friend) and Emma the veterinarian (trust 1, neutral, a
stranger who survived). 27 plants in the codex, pantry 0. They knew a decent
foraging vocabulary and six trials' worth of hard lessons about each other.
Missing: food and fighters.
**40404 (d107)** — the long quiet one, longest-lived social village yet.
Monsters took Marcus, Alma, Berhanu early; Gabriel/Hermann fell d24/d31;
Willie/Detlef d77; Lena fell d106, David to sickness d107. Two left: Sofia
the gardener (trust 1, warm) and James the carpenter (trust 2, tense) — the
player outlived everyone they were close to. 40 plants (best), pantry 0,
31 feasts, 16 aid cries answered, 7 gossip chains with real distortion.
Missing: justice (zero trials in 107 days — the courtroom got no coverage
here) and endgame food.
**50505 (d99)** — the exile run. Hank/James to monsters d14/d21; Stella
starved d26; Kenza died in a contest, Rafael on expedition (d38); starvation
took Lucas d69, Sofia d79, Lena d92; Carlos fell d83; Emma to a monster d91.
One left: Marcus the electrician (trust 8, neutral). The defining event: d25
the village convicted the PLAYER of assault 7-0 and cast them out — and the
player outlived nearly everyone from the wilds while the village starved.

## People check (sense-tested transcripts)
NPCs want specific things: a day-1 villager with 0 liters of clean water
("Two of us, half the trips. Will you come?"); Kenza settling near you —
"Can we talk? Just talk — like people used to."; James on day 4, hungry and
edged: "I hate to ask, but do you have anything to eat? Anything at all?"
Best (30303, Stella d6): "Do you believe in anything? Now, I mean. After
everything." → "That's not naive. That's load-bearing. Hold onto it."
The r6 deflect fix HOLDS: brush-offs rotate across all 165 transcripts,
zero verbatim adjacency. Gossip still quiet (1–7 entries/run) — carried
observation from r6.

## More blanks filled this run (from the r7 sims)
- **Winddown stacked sign-offs** → FIXED in conversation.js: endConvo now
  closes quietly when the winddown beat was already spoken (goodbyeSaid) —
  a person says goodbye once. Proof: test-social-r7-fixes 12/12.
- **Bribery dig-result filler loop** → FIXED in betrayal.js: bribeDigMissLine()
  per-case rotation (was one template 6–8× verbatim). Same proof test.
- **Recap near-single-template** ("Still on that favor." ×3): judged
  WORKING AS DESIGNED — a recap must stay factual; voiceLine openers already
  vary it ("Tell you what — ", "Probably — "). Not changed.

## Blanks documented (not fixed — for Steve / future runs)
1. **Exile has no social teeth (50505, the big one).** Convicted and exiled
   d25 with full ceremony ("To Haven, you are not one of ours anymore"),
   yet the run then held 51 full conversations + 22 feasts with the same
   villagers — a day-63 fireside chat with Sofia (trust 90), "Don't tell
   the others", wound-cleaning requests. ZERO transcript lines mention the
   exile. The talk system never checks exile status. This is a PROPOSED
   BUILD PLAN, not a launched fix: exile should gate/transform social access
   (cold shoulders, refused talks, trust decay) — or the fiction changes.
   Needs Steve's call on severity/shape.
2. **Justice pacing variance** (observation for the balancing loop): 30303
   ran 6 trials in 14 days vs 40404's 0 in 107. npcMootTick fires correctly;
   the betrayal plot-generation variance across seeds is extreme.
3. **Sleep-refusal day-stacking** (harness boundary): when Game.sleep() is
   refused, policy.daily re-fires on the same game day — 9–10 conversations
   stamped on one day. The silent catch hides WHY (~30 refusals/run).

## LIVE-BUILD FINDING (loud — needs Steve's phone)
Browser QA on the live build (390×844 requested; automation could not set
the viewport, ran wide): the villager detail panel never paints — tapping a
villager sprite or Talk→picker→villager adds the panel (Close, "Talk
(10 kcal)", "Give food", …) to the accessibility tree, but it is invisible
in every screenshot, clicks refused as "obscured", Escape doesn't dismiss.
Reproduced on TWO live builds (43630702-20261012-142635 and
5ae9a5f4-20261012-151255), 3 villagers, both tap routes. Conversations could
not be reached at all in the browser. Code forensics: the panel renders into
.ord-narration inside the sticky .ord-topstack; the 2026-10-11 obscurer fix
and today's muster-dialog sticky fix are both in the tested builds; no
code-level root cause identified — and it may NOT reproduce at true 390px.
Do NOT attempt blind CSS surgery: verify on a real phone first. If it
reproduces there, it's a P0 (conversations unreachable). Everything else on
the live build was fine: title, onboarding, intro dialogue with Lena,
village grid/HUD all render cleanly.

## Verdict
- **Reachable: YES.** 165 full conversations, talk requests, feasts, petition
  moots, and now 11 natural justice trials with remembered player votes —
  the social layer fires organically end to end. (Caveat: live-build panel
  issue above could not be verified at 390×844.)
- **Fun: YES, with edges.** Moot theater, the belief conversation, James
  begging on day 4 read like people. Fixed this run: stacked goodbyes,
  dig-result parroting. Remaining edge: exile's missing social teeth.
- **Winnable: PARTIAL — same binding constraint as r5/r6.** All three
  villages died (d78/d107/d99); combat/monster attrition decides runs, with
  starvation rising as villages live longer. The social content is proven
  on dying villages; 40404's d107 shows it compounds when the village holds.
