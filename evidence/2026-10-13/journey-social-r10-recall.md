# Journey social r10 — canon question recalls (2026-10-13)

**Pre-register:** blank from r9 talk probe — the four other canon questions
(q_plan, q_scared, q_miss, q_think) had `recall: null`, and the generic
`recall` lines on q_hands/q_theory were DEAD DATA (no code path ever read
them; only q_origin/q_trust had opener blocks). docs/CONVERSATIONS.md's
"answers are remembered (conv.answered) and referenced later" held for 2 of
36 questions.

**Question:** do the new answer-specific recalls fire in natural play, and do
they read as real memory rather than fabricated history?

**Interesting finding would be:** recalls never firing (dead data again), a
recall misquoting the player's answer, a recall firing on an opt-out answer,
or a recall opener reading robotic in a full arc.

**Seeds:** 505, 606, 707 · **DAYCAP=60** (death-aware: villages scattered/lost
d54/d56/d64; runs stopped, no dead-village ticking).
**Policy:** socialite + one full driveOne convo per villager per day (r9
pattern; driver answers every bespoke question with the first non-opt-out
answer).

## Fix (committed this run)

- `src/data/characterGen.json`: answer-specific `recalls` maps on q_plan,
  q_scared, q_miss, q_think; converted the dead generic recalls on q_hands /
  q_theory to answer-specific maps; added `recalls:{a_tell}` to q_origin
  (preserves its old a_tell-only gating). Opt-out answers (`honest_opt_out`)
  get NO recall entry — they never fire.
- `src/js/conversation.js`: the two hard-coded origin/trust recall blocks are
  now one generalized loop over `cg.questions`. Rules: only answers WITH a
  recall entry fire; a `recalls` map is strict (unmapped answers do NOT fall
  back to generic text — the r9 q_trust fabricated-history lesson);
  `honest_pass` never fires; each question fires at most once per villager.
- Proof test `scripts/test-qrecall-canon-20261013.js`: RED on pristine (17/17
  new recall cases fired nothing), GREEN after (17 answer cases + 4 opt-out
  cases). r9's `test-qtrust-answer-recall` still GREEN (behavior preserved).
- Also fixed a pre-existing failure in r9's
  `test-gossip-teller-reflexive-20261013.js`: the control gossip's subject sat
  in the teller's group, so group-mate-first listener selection made the
  listener BE the subject and the r4 listener==subject reflexive correctly
  fired — the test's "about {name}" expectation could never hold. Control
  subject moved outside the teller's group. Game code untouched.

## Pilot results (3 seeds × 60d)

| seed | days | end | asked | answered | recall openers | answer-matched |
|------|------|-----|-------|----------|----------------|----------------|
| 505 | 54 | scattered (0 alive) | 150 | 150 | 18 | 18/18 |
| 606 | 56 | scattered (2 alive) | 119 | 119 | 12 | 12/12 |
| 707 | 64 | scattered (3 alive) | 118 | 118 | 11 | 11/11 |

**41/41 recall openers matched the answer the player actually gave.** All
seven recall-bearing questions fire in natural play (q_plan 6, q_hands 5,
q_origin 8, q_miss 7, q_theory 6, q_trust 4, q_think 5). q_scared was never
asked on any seed — its `"when": "scared"` gate didn't trigger under the
socialite policy (watch item: the condition may be rare in competent play;
the recall data is complete for when it does fire).

## Sense reads (full transcripts)

- q_plan/a_survive, Deirdre d3: opens *"You said one day at a time. How's
  that holding — still day by day, or are you thinking further out yet?"* —
  the player had answered "One day at a time." the day before. Natural,
  earned, quoted nothing they didn't say.
- q_think/a_end, Ethan d13: *"You called this the end of the world. We're
  still here, though. That's either something, or it's us."* — coherent
  callback to "The world's ended. We're what's left."
- q_miss/a_food, q_hands/a_tell, q_theory/a_aliens, q_trust/a_earn arcs all
  read like people remembering, not menus. No fabricated shared history in
  any of the 12 captured recall convos.

## Village assessment (census, seed 505 socialite, d26 scatter)

10 alive at the scatter; fallen: Waimarie (contest, d23), Adaeze (sickness,
d25). Pantry 0 kcal, water 12L, morale "steady". Bonds: NPCs hold 7–10
pair-bonds each (the meal/feast/visit friendship machinery fires strongly);
the PLAYER has 0 bonds under the plain socialite policy — the driverless
player is the village's social outsider while NPCs weave a dense web
(thematically fine, worth watching). Needs: hunger 30–82 (Lena 82, Marcus
77 — food pressure real), fear 0 across the board, social 26–100 (Carlos
26, Lena 36 — socially starved), energy 70–100. Knacks present on everyone
(storm_ear, green_whisper, bloodhound, night_eyes, still_hands, pathfinder,
the_touch). One old_wound conflict (Adaeze x Carlos, tension 0 — Adaeze is
dead, the wound outlived her). Goals varied (lead, survive, family, peace,
remember, joy, record, feed, answers).

## Verdicts

- **Blank: FILLED.** The "referenced later" doc promise now holds for 8 of
  36 bespoke questions (origin, trust, plan, scared, miss, think, hands,
  theory) instead of 2. The other 28 remain ask-and-forget — r11 material.
- **People check: PASS.** Recall openers read as genuine memory; 12 full
  recall convos sense-clean, no fabricated history, no filler.
- **Reachable:** yes — 41 natural fires, no special conditions.
- **Fun:** yes — "they remembered" is the core people-feel mechanic and it
  now covers the canon questions.
- **Winnable:** n/a for the social leg; recalls block nothing.

## Tooling

- `scripts/journey-social-r10-recall-20261013.js` — lean recall probe
  (reuses r9 driveOne); per-seed JSON + aggregate. Note: the first detector
  build missed q_origin (recall text contains `{region}`; fixed by matching
  the pre-placeholder literal prefix).
- `scripts/journey-social-r10-census-20261013.js` — census printer
  (needs/bonds/knacks/conflicts/fallen).

## Telemetry

First social-leg run: seeded
`hidden_files/telemetry-baselines/social.json` (askedTotal 387,
answeredTotal 387, recallHits 41, end.day sum 174, end.alive sum 5 across 3
seeds). The LOUD lines on the seeding run are expected (empty baseline),
not deviations.

## Watch items (not fixed)

1. q_scared's `"when": "scared"` gate never fired in 3×60d of competent
   play — the question may be near-unfireable in practice.
2. The driverless player forms 0 bonds while NPCs form 7–10 each — the
   player's social integration leans entirely on the convo driver; natural
   socialite play leaves the player a spoke-less hub.
3. 28/36 bespoke questions still have no recall — the long tail of the r9
   gap. Prioritize by ask frequency, not by list order.
