# Long-run sim — trust & social lever r6: PETITION-MOOT SOCIAL AFTERLIFE (2026-10-12)

Lever index 5 (trust & social), round 6. Canon read first: docs/CANON.md,
docs/CONVERSATIONS.md, docs/PARTY.md, docs/FANS.md, docs/KIN.md.
Trust != reputation held throughout (all new gossip moves REP dims only).

## The blank (measured, not invented)

r5's sweep telemetry (24 runs × 200d) showed the petition-moot system is
fully built (interviews, speeches, counted vote, consequences) but leaves
ZERO social traces: across 24 runs, `petitionMootMems` = 0 — no voter ever
remembered a moot, and non-cannibal outcomes seeded no gossip. The justice
moot has had `moot_vote` memories forever; the petition moot had none. The
village talked about nothing the day after.

Also measured in r5 telemetry: the room REJECTS most petitions (26/28 in the
socialite baseline) even when the player votes accept — the villagers' honest
`_vaPetitionScore` (food pressure, temperament, cause) usually says no. That
is the design working, and it is exactly why the afterlife matters: most
moots end in rejection, and rejection had no voice at all.

## The lever played (src/js/villageAgency.js, src/js/convo-scene.js, src/js/conversation.js)

**Voter memories** (`_vaFinishPetition`): every voter gets
`remember(vid, 'petition_moot', 'voted to take them in — the moot took them in')`
(4 combinations of vote × outcome). No trust moves — the vote is the
village's decision, not a deed of the player's.

**Outcome gossip** (`_vaPetitionConsequences`, gated on `pet.vote` so only
real moots seed it — a petition that walked unanswered was never the
village's decision): the full 4×2 cause matrix, rep dims only —
`took_in_hungry` (generous+6), `sheltered_peacemakers` (+4),
`took_in_losers` (+3), `turned_away_hungry` (−6), `turned_away_peacemakers`
(−4), `turned_away_losers` (−3), `refused_eaters` (brave+4), plus the
pre-existing `harbor_cannibals` (kept).

**Conversation read sites** (Telltale-theater rule — every write earns its
read): `petition_moot: 'the moot over the petitioners'` in MEM_LABELS
(convo-scene.js) so `convoWhatsAlive` offers it as a live topic; and a
specific `alive:memory` response in conversation.js that names THEIR vote
and the outcome from the memory note — including the loser's lines
("I voted to take them in. The moot said no. It still sits wrong with me.").

## Before/after (identical seeds — 12 seeds × 3 policies × 200d)

Harness: `scripts/sweep-trust-r6.js` (r5 fork + moot-verdict/memory/gossip
telemetry). Raw: `sweep-out/trust-r6-before.json`,
`sweep-out/trust-r6-socialite-before.json`, `sweep-out/trust-r6-after.json`.

Stream-neutrality (r5's discipline): competent and contender-engager never
call moots, so the change must not move their streams — **bit-identical
before/after on all 24 runs** (trust, days, end reasons, challenges,
gossip). Confirmed.

| | socialite BEFORE | socialite AFTER |
|---|---|---|
| moots conducted | 28 | 29 |
| moot verdicts (room) accept / reject | 2 / 26 | 3 / 26 |
| petition_moot memories | **0** | **39** |
| moot gossip seeded | 0 | per-cause (proof-verified) |
| petitions turned away (ignored) | 0 | 0 |
| trust end mean | 25.75 | 52.66 |
| wins | 0 | 0 |

The trust-end jump (25.75 → 52.66) is **stream noise, not a lever effect** —
per-seed values flip both directions (s1: 0→65, s11: 83→0, s6: 87→61). The
lever adds gossip rumors; gossip *spread* draws from the shared random
stream, so the run diverges after the first moot concludes (the same
butterfly r5 documented for line pools). The lever moves no trust by design
(memories carry none; gossip is rep-only). The honest measurement of this
lever is the afterlife telemetry (0 → 39 memories, gossip firing per cause),
not the trust mean.

## Reachability verdict

- **Petition moots are reachable and now leave traces**: 29 moots across 12
  socialite seeds; every concluded moot records voter memories (39 total)
  and seeds verdict-matching gossip. The room's rejection bias (26/29) is
  the villagers' honest arithmetic, not a bug.
- **The moot is a live conversation topic the next day**: sense-tested —
  `convoWhatsAlive` offers "About the moot over the petitioners..." and the
  turn answers in the voter's voice with their specific vote and outcome.
- **No regressions**: gossip-norepeat, gossip-drama, convo-engine-trust,
  social-gossip, agency-lever, agency-teachv, ontology all green (see below).
- Unchanged from r5: promises (0 made — player-initiated UI path, no policy
  exercises it), betrayals (0 started), wins (0 — the wall is still
  food/monsters, all runs village-lost).

## Sense-testing (SENSE-TESTING LAW — transcripts read)

`scripts/sense-trust-r6-20261012.js`, seed 11. Interview → moot → count →
verdict transcript reads true: Wren's plain-spoken "Because staying meant
watching the kids go hollow," the useful-hands glance, the two speeches
("A fire's for sharing. That's the whole point of it." vs "More mouths.
Less food. You do the math."), the count ("5 for taking them in. 3
against."), the loser's line ("Fine. But when the food runs short, remember
whose idea this was."), the admission said aloud with names, the journal
entry.

Next day, talking to the voter who argued against (calloused knuckles, 40s):
"About the moot over the petitioners..." is offered; taking it gets "I
voted to turn them away. The moot took them in anyway. We'll see." — the
loser's disagreement carried honestly into the next day's conversation.
(The voter had partial language — nonverbal choices — which is correct
per the language system.)

Sense catch fixed in-run: the first draft of the `alive:memory` turn fell
through to the generic "Yeah. I think about that too." for the new memory
type — the label promised a moot and the line delivered nothing. Now the
response is vote-and-outcome specific (4 variants).

## Village assessment

Seed 11's village (socialite): the fire took in Wren Ashdown and Tomas Reed
after a 5–3 moot. The next day, the villager who argued hardest against them
still tells you to your face: "We'll see." The village doesn't reset to
neutral after a moot anymore — the disagreement lives in memory and in talk,
which is what the moot system always promised.

Who thrived: the socially engaged — socialite trust end mean 25.75
(competent 11.36) even before this change; the afterlife doesn't move trust,
it moves *continuity*. Who died: everyone eventually — monsters first, then
the logistics trio; all 36 runs village-lost. The wall is still food and
monsters, not social systems — which is this lever's scope working as
designed.

## Blanks filled vs documented

**FILLED (this run):**
- Petition-moot social afterlife: voter memories (4 vote×outcome variants),
  full 4×2 cause gossip matrix (rep only), MEM_LABELS read site,
  vote-specific alive:memory responses. Proof:
  `scripts/test-petition-moot-afterlife-20261012.js` **17/17 × 3 seeds**
  (red-checked: 6 afterlife assertions fail on pristine code, pre-existing
  paths pass).
- Sense-test catch: generic alive:memory fallback for the new type →
  vote/outcome-specific responses.

**DOCUMENTED (not this run):**
- takeoversEst negativity when yielded leads die (r4/r5-carried; needs the
  challenge-lifecycle event log).
- `Game.delegateTask` dead path in competent.js (r4/r5-carried).
- Promises: 0 made across 36 runs — the promise system is player-initiated
  (conversation UI); no sim policy exercises it, so its long-run behavior is
  unmeasured. Needs a promise-making policy or a builder playtest.
- Leave-arc rarity tuning (r5-carried).

## Proof & regressions

- `scripts/test-petition-moot-afterlife-20261012.js`: 17/17 × 3 seeds
  (7, 11, 21). Red-checked on pristine (stash): 6 afterlife FAILs,
  11 pre-existing PASSes.
- `scripts/sense-trust-r6-20261012.js`: transcript + live-topic + turn
  verified by reading.
- Regressions: gossip-norepeat, gossip-drama, convo-engine-trust,
  social-gossip, agency-lever, agency-teachv — all green; ontology green.
- Stream-neutrality: competent + contender-engager bit-identical 24/24.

## Files

- `src/js/villageAgency.js` — voter memories in `_vaFinishPetition`,
  4×2 outcome gossip in `_vaPetitionConsequences` (moot-gated)
- `src/js/convo-scene.js` — MEM_LABELS `petition_moot`
- `src/js/conversation.js` — vote/outcome-specific `alive:memory` read
  (+ `lastMem` hoist fix)
- `scripts/sweep-trust-r6.js` — r5 fork + moot verdict / memory / gossip
  telemetry
- `scripts/test-petition-moot-afterlife-20261012.js` — proof (new)
- `scripts/sense-trust-r6-20261012.js` — sense capture (new)
- `sweep-out/trust-r6-before.json` / `trust-r6-socialite-before.json` /
  `trust-r6-after.json` — raw run data
