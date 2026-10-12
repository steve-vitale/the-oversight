# Long-run sim — trust & social lever r3 (2026-10-11)

Lever index 5 (trust & social), round 3. Canon read first: docs/CANON.md,
docs/CONVERSATIONS.md, docs/PARTY.md. Trust != reputation held throughout
(proof test asserts departure/return gossip moves neither).

Prior rounds: r1 gossip spread rate (b07cac97), r2 follower threshold 65→50
(caaa5baa). This round fills the blank r2 documented but left open:
**'departure'/'return' gossip seeded with `heard=[]` — born dead.**

## The lever played

Three born-dead news seedings now seed **2 witnesses at the scene** — the same
pattern as the already-shipped objective-departure path
(villager-objectives.js), which the r2 baseline showed traveling fine
(meanMaxHeard 8.37, 88.7% reach 4+):

1. `src/js/villager-agency.js` `startExpedition` — expedition 'departure'
   (was `[]`; the 7-25 dead-on-arrival departures/run in the baseline)
2. `src/js/villager-agency.js` `expeditionReturn` — expedition 'return'
3. `src/js/villager-objectives.js` `objReturnEffect` — visit/guard 'return'

Witnesses exclude the leaver/returner and the player (the player sees the
announce directly when at Haven). Fewer than 2 available → whatever's there
(`slice(0,2)`).

**Same blank's other half** (talk channel, `src/js/game.js` `askAbout` gossip
branch): there was a departure-specific line ("Did you hear? X just walked
away from Haven. Didn't look back.") but 'return' fell through to the generic
"People are talking about X." Added: `"X is back. Walked in like they'd never
left."` + journal note `They're back from wherever they went.` [needs-eyes]:
new beats now fire in the village gossip stream and talk channel — worth a
phone playtest.

No trust/rep touched: 'departure'/'return' dims are `{who}`-only →
`gossipActionDims` returns `{}`. News, not judgment. Exact numbers: 2
witnesses, nothing else changed.

## Before/after (identical seeds — 8 seeds × 2 policies × 200d = 32 runs)

| news | BEFORE | AFTER |
|---|---|---|
| 'return' rumors | 654 | 785 |
| 'return' dead-on-arrival | **654 (100%)** | **3 (0.4%)** |
| 'return' meanMaxHeard | 0 | 8.87 |
| 'return' reach 4+ | 0 (0%) | 766 (97.6%) |
| 'departure' dead-on-arrival | 43 | 19 |
| 'departure' reach 4+ | 911/1027 (88.7%) | 1025/1080 (94.9%) |
| 'departure' meanMaxHeard | 8.37 | 8.73 |

Secondary systems (no systematic lever effect — expected, news carries no
rep/trust; movement is chaotic-coupling noise from the witness-shuffle's RNG
stream): trustEndMean 23.41→16.82, survival median 48→59d (max 100→107d),
wins 0/16 both, all runs end village-lost. Villager death causes: monster
56→54%, "a wound that wouldn't close" 7→15%, starvation 7→8%, thirst 5→7%,
sickness 5→5%. Player deaths: combat 46→47, starvation 39→47. Moots 14→15
(socialite, all accepted); competent 12–14 petitions turned away at the door
(beds-full gate, known). Challenges 148→195 raised, 0 answered → contender
auto-resolve cascade (policy gap, unchanged). Betrayals 0/32, promises 0/32
(policy gaps: policies travel alone, never promise).

Raw: `sweep-out/trust-r2-before.json`, `sweep-out/trust-r2-after.json`
(harness: `scripts/sweep-trust-r2.js` — fork of sweep-trust-lever.js with
action|partKey rumor keys, registerDeath full-history cause tracking,
per-action reach tables).

## Reachability verdict

- **Departure/return news**: was decoration (dead at seeding) → now travels
  the village like every other rumor. Reachable and heard.
- **Conversation trust channel** (documented policy gap, r2): new
  `scripts/policies/chatterbox.js` holds convos to natural end. 4 seeds ×
  200d: rcCalls **2173/run vs 0** in all prior sims. Probe: `endConvo:talk:+`
  fired 4/4 natural ends, `endConvo:mood-lingers:+` 4/4, trust +7..+12 per
  real conversation. talkCapHits 0 — the 40-words cap never bound in long
  sims; words don't reach 40 alone, deeds do. Reachable, works, cap holds.
- **Moots**: reachable when driven (socialite 14–15/run, all accepted).
- **Leadership**: challenges fire (~9–12/run) but nobody answers in sims.
- **Betrayal/promises**: 0 in sims — policy gaps, not game gaps.

## Sense-testing (SENSE-TESTING LAW — transcripts read)

Departure/return announcements read in-fiction with consequences:
`🧭 Marcus is back from past the south (+3719 kcal for the pantry, 3 stories,
a new scar) (Ask them what they saw.)` / `🚶 …is back — found Lena.`
Gossip fragments show the r1 distortion tails varying properly, no verbatim
repeats.

One full 9-turn conversation (seed 424242) reads as a REAL conversation: the
NPC asks the player questions, the player's answers are remembered ("Huh. I
wouldn't have guessed that about you."), open threads resume ("About that
question — we never finished."), and it ends naturally with the
want-resolution goodbye ("See you at dinner." / "Good talk. I feel like I
know you a little better now."). Trust 10→22.

Quirks noted (pre-existing, out of lever scope — documented, not fixed):
- Overhear fragment "X telling Y about Y" (teller tells the subject about
  themselves) reads odd; needs pronoun-aware rendering.
- "What I miss most? the noise." — stray lowercase after "? ".

## Village assessment

The village now talks about who's out and who's back — departures and returns
join the fireside news stream instead of dying silently. Trust climbs the
designed way: creek water, fish, garden, wood, keeping the haven fed
(duty bumpTrust +1–2). The hottest negative social loop is still "gave orders
over a contender" (615 events). Villagers who work die less; villagers die to
monsters first (54–56% — wave-1 animal shock working as designed), then
infected wounds, then the logistics trio. Players die to combat (~50%) and
starvation (~40–50%). Nobody reached 90+ devoted; 65+ (volunteer band) is
~9–19% of survivors. The contender cascade still takes domains in month one
when unanswered — that's the no-response equilibrium, not a bug.

## Blanks filled vs documented

FILLED: 3 born-dead news seedings → 2 witnesses; return talk-channel line +
journal note (was generic fallback).
DOCUMENTED: betrayal/promises 0 in sims (policy gaps); competent moots
turned away at door (beds-full gate); "telling Y about Y" fragment quirk;
"What I miss most? the noise." capitalization.

Proof: `scripts/test-trust-news-witnesses-20261011.js` 22/22 × 3 seeds
(20261011, 7, 99) — seeding, spread, dedup, no-trust/no-rep regression, talk
line. Regressions: test_social_actions 30/30, agency-lever 17/17,
agency-teachv 20/20, gossip-drama 5/5, gossip-norepeat 17/17, social-gossip r1
9/9. Ontology: 80/80 validated.
