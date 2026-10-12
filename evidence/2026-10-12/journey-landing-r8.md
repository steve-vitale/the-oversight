# Journey landing r8 — days 1–14, competent player, 3 seeds (2026-10-12)

Base: `a9e6365f` (journey succession r10). Harness: `scripts/journey-landing-r8-20261012.js`
(r7 template + feast-chain telemetry + starvation-death autopsy + villager-feast-push
scan). Seeds: **111, 222, 333** (fresh; r7 used 777/888/999). Seeded RNG before
module eval; window stub for eval, deleted before play; full src/js list in
index.html order minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js.
Full transcripts: /tmp/journey-landing-r8-transcript-*.txt (33 files/run × 2 runs);
censuses: /tmp/journey-landing-r8-census-{111,222,333}.json; run logs:
/tmp/journey-landing-r8-run.log (pre-fix), /tmp/journey-landing-r8-run2.log (post-fix).

## Village assessment (plain words)

**Seed 111 — Naomi.** Twelve people wake under the wrong stars; Naomi forages,
hauls water, works the trapline idea (no traps actually set — the wire never
quite comes together in 14 days). One villager dies day 5 to a monster; the
mourning menu fires. System arrives day 8; Naomi takes trial-deed abilities
(6 choseAbility across the run). Pantry 47,250 → 20,007 kcal. Naomi ends day 14
at 100 HP, 1128 kcal. Trust 5–61 (mean 29.9) — still wary, a couple won. Plant
knowledge leaders: Gus 16, Chester 15. Open wants at end: 5 favors, 2 curious —
a village that needs things and asks.

**Seed 222 — Kieran.** The brutal one. Kieran (the player) dies in combat on
day 8 — and the run continues: succession fires, a successor takes the mantle
at 100 HP, the village reaches day 14. Another villager dies the same day.
Ten monster kills by villagers (glasswing, mirrormoth, hummice, nevermore —
real blow-by-blow field fights). Pantry 47,250 → 26,326. Trust 0–86
(mean 32.1) — the widest spread, a village with a grudge and a hero. One
unarmed (social) feast hosted.

**Seed 333 — Patrick.** Patrick dies day 13 in combat; succession carries the
village to day 14. Emma Larsen dies day 14 to a Choir Toad. Pantry 47,250 →
8,450 — the thinnest margin of the three, real pressure. Trust 9–71
(mean 32.8). Plant knowledge: Fritz/Colin 13. One unarmed feast hosted.

## The feast chain in the early game (Steve's active target: food economy)

- **Armed half is silent infrastructure in days 1–14** (as designed): sentiment
  was never taught (sentimentTaughtDay=null, 3/3 seeds), devotionChannels=0,
  armMessages=0, feastedSpamLines=0. The devotion lane (3×L3 or resonance≥35)
  is a weeks-long arc; nothing in the fortnight arms it. No FEASTED buff, so
  the per-strike "the feast was the weapon" spam documented in sim-food-r7
  cannot fire here — confirmed unreachable in-leg, not merely unobserved.
- **The social engine fires**: 2 unarmed feasts hosted (seeds 222, 333) via
  eveningFeast's 14-day cadence — the village's social engine (trust, bonds,
  gossip) is reachable in the landing leg. 0 armed (correct — no devotion).
- **No villager ever pushes for a feast** (villagerFeastPush=0, 3/3 seeds) —
  the sim-food-r7 blank holds in the early game too. The social engine is
  one-directional: the player hosts, nobody asks.
- **Starvation telemetry** (r7 open question): 0 starvation deaths across 3
  seeds — the autopsy hook (location/pack/pantry-edibility/series-tail) is
  wired and waiting, but didn't fire. Seed 999's day-11 starvation remains
  unconfirmed; the hook stays in the harness for future runs.

## People check (SENSE-TESTING LAW)

Read full transcripts across both runs. Verdict: **the village acts like people.**

- Favor arcs read true. Marcus (111-day10), ask_favor: "Pantry's thin and
  getting thinner. Forage with me tomorrow? I know the meadow edge, west of
  the creek." → pressed: "I did the count twice. The count doesn't change."
  → declined: "Right. I get it." A beat — and then the subject is closed.
  A villager who did the pantry count, knows his patch, asks plainly, accepts
  refusal. The NPC wants something, options engage/deflect it, the ending
  resolves.
- Curiosity openings hold; zero "I just said", zero phantom names, zero
  comma-closer stutters across 66 conversations (2 runs × 33).
- Decline lines acknowledge in-fiction 8/8 (run 1) — the r5 fix holds.
- Restless-young-voice coherence: "When's the last time you really laughed?"
  → "Stealing joy. I like that. We should steal more of it." → "Agreed —
  now let's move before I vibrate out of my skin."
- No comm-level 'none' villagers in these seeds; the NV sit didn't fire (r6's
  NV coverage stands).

## The blank: undecided lures went silent across sittings (fixed)

**Found (run 1):** 2/8 lures "silent" — the betrayal:accept/decline menu quoted
the invitation verbatim while the NPC never spoke it in that conversation.
Both were FIRST sittings with the villager, so the r7 ledger theory didn't fit.

**Root cause** (LURE_DEBUG stack traces): the competent policy's `talkRound`
opens a real conversation per day for social maintenance (`Game.talkTo(vid)`
→ `startConvo`, then immediate `endConvo`). When it hit a villager holding a
pending invite, the inviteBeat fired and set `inv.spoken=true` — into a
conversation nobody read. The harness's real transcript-sitting later found
`inv.spoken` already true: no beat, but the menu still offered accept/decline.
One case carried `plotId:"plot_1"` — an ARMED plot invite offered with no
spoken invitation in the sitting. The `spoken` flag conflated "the NPC said
it" with "the player heard it."

**Fix** (`src/js/conversation.js`): when a conversation ends with the invite
still pending (undecided), `inv.spoken` resets — the next sitting speaks the
invitation again. Applied at both conversation ends: `endConvo` and the modal
cutoff in `startConvo` (tapping another villager mid-conversation). Accept/
decline consume the pending, so decided invites never re-fire. This upholds
the r7 principle — the menu quotes the label verbatim, so the spoken beat and
the menu can never disagree. Repetition reads as insistence, not parrot.

**Proof:** `scripts/test-landing-lure-respeak-20261012.js` — RED on pristine
HEAD (`git show HEAD:src/js/conversation.js` via CONVO_FILE override): 9 pass /
2 fail (the two re-speak assertions). GREEN on the fixed tree: **11/11 pass**.

**In-sim verification:** reran all 3 seeds post-fix — lureSilent 2/8 → **0/8**,
lureSpoken 8/8.

**Regressions** (node, sequential): test-landing-lure-spoken (r7) 9/9,
test-convo-norepeat-fallback 9/9, test-dialog-coherence 37/37, test-dialog-gating
ALL GREEN, test-dialog-stream 43/43, test-convo-deflect-cycle 11/11,
test-convo-seed-voice 37/37, test-favor-system 30/30, ontology 85/85.

## Verdict: REACHABLE / FUN / WINNABLE

- **Reachable:** everything in the leg fired — System contact day 8 (3/3),
  trial-deed abilities, favor arcs, spoken lures (8/8 post-fix), mourning,
  succession after player death (2/3 seeds — failure resolves, the village
  continues), unarmed social feasts (2/3).
- **Fun:** the fortnight has texture — act-0 wariness (trust means ~30), real
  food pressure (pantry 47k → 8–26k), deaths that land, villagers who ask for
  help with specifics. The feast chain's armed half is correctly out of reach;
  its social half is in reach.
- **Winnable:** 3/3 villages reach day 14 with growing knowledge and trust.
  Two player deaths were honestly resolved by succession, not run-deletion.

## Open questions / not completed

- Seed 999's (r7) day-11 player starvation mechanism still unconfirmed; the
  autopsy hook is in the r8 harness awaiting a firing case.
- The per-strike FEASTED spam and verbatim arm-sermon blanks (sim-food-r7)
  are confirmed unreachable in the landing leg — they belong to longer legs.
- "No villager ever pushes for a feast" holds here too — lever-3 territory,
  documented not fixed.
- Gossip arcs not directly observed (policy favors deepen choices); covered
  by other loops' suites.

## Files changed

- `src/js/conversation.js` (modified): invite re-speak on undecided sits
  (endConvo + modal cutoff).
- `scripts/journey-landing-r8-20261012.js` (new): this run's harness.
- `scripts/test-landing-lure-respeak-20261012.js` (new): proof test.
- `scripts/probe-silent-lure-20261012.js` (new): diagnosis probe.
- `evidence/2026-10-12/journey-landing-r8.md` (new): this note.
