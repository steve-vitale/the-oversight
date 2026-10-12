# The Ladder Discovers Itself — scale discoverability design (proposal)

**Status:** proposal for Steve, 2026-10-12. Not built.
**Problem:** the scale ladder exists (village → regional → national → global → table)
but nothing tells the player to climb it. Wave 4 needs regional, wave 5 needs
national — both gates are invisible. A player capped at wave 3 with max kills gets
zero signal about what to do next. The only "grow bigger" line in the game is in
the REFUSE copy, as a cost of saying no — never as a forward signal.

**Design law:** nobody explains the ladder. The world demonstrates it, the System
narrates it like a producer, villagers want it for their own reasons. Every pointer
is REACTIVE (fires on earned state, never a timer), ONCE-ONLY (never nags), and
KNOWLEDGE-GATED (never names what the player hasn't earned).

## The discovery arc

### Beat 1 — Neighbors exist (exists; deepen)
Traveler rumors already land ~day 4–5 ("a village to the east called X").
ADD: villager idle mention. A villager with a traveling past says it unprompted
in conversation: *"Passed a fire three days east, once. Bigger than us."*
Plants two ideas at once: villages exist, and they have sizes.

### Beat 2 — The first knock (exists; needs a nudge)
Propose buttons already live on the region view — but nothing motivates the press.
ADD two nudges, whichever comes first:
- **System, producer-brain,** the first time the region view opens with a known
  village: *"Ooh. Neighbors. You know what neighbors are for? STORYLINES.
  Go knock — worst case, it's content."*
- **Villager suggestion,** when the pantry strains: *"[East fire] has grain.
  We have hands. Someone should walk over."* — the motive is the village's own
  hunger, not a tutorial.

### Beat 3 — The bond matures (exists; make it felt)
Accord gesture and Regional Dawn already fire. The 21-day seasoning is a hidden
timer — make it felt time:
- ~day 10 of a bond, villager beat: *"They sent extra this week. I think we're...
  friends? Is that the word?"*
- ~day 18: *"Three weeks we've known them. Feels longer."*
The player experiences the relationship aging; the Dawn lands as payoff, not surprise.

### Beat 4 — The wave-4 pointer (NEW — the key gap)
**Trigger:** wave-3 ledger points at bar AND scaleRank < regional. Once.
The System notices the cleared board, producer-brain:
*"Okay, you've cleared the board. Impressive. But the next act?"* (beat)
*"The next act needs a bigger stage. I can't do the Mirror Draft with ONE fire —
there's not enough of you to reflect. Get me a network."*
The fiction justifies the gate: wave 4 is made "out of YOU" — your faiths,
formats, institutions (its own beat says so). One village isn't enough material.
Villager echo via gossip next day: *"Whatever's out there... I don't think one
fire faces it. Not alone."*
Knowledge gate: never name "Mirror Draft" here — it's "the next act" until earned.

### Beat 5 — The national pointer (NEW)
**Trigger:** wave-4 points at bar AND regional AND scaleRank < national. Once.
Escalation: *"Finales need a nation. You've got the region — now make it a REALM.
Three seasoned bonds under one head. Or bend the knee to someone who has.
The producers are waiting."*
Demonstration beats explanation: foreign-polity trader rumors ("X has bound three
fires — they're calling it a realm") already exist in canon. Make sure they reach
the player. Seeing others climb is the most natural teacher there is.

### Beat 6 — The table pointer (NEW)
**Trigger:** national reached. Once.
*"The table's watching now. You know what they want? Everything. Every wave
faced, every contest survived — the full story. Give them a season worth judging."*
Longer term: a "what the table wants" readout — the System as producer telling
you what the show still needs. Reactive, updates as deeds complete. Delivered as
System dialogue when asked / at beats — never a checklist screen.

## What NOT to do
- No tutorial popups. No checklist UI. No "Link villages to unlock Wave 4!"
- No nagging: every pointer fires once; after that the world carries it
  (gossip echoes, visible consequences, foreign polities).
- The System never talks mechanics. Always producer-brain: "I need," "the show
  needs," "ratings" — never "the wave-4 gate requires scaleRank >= regional."

## Why this fits the canon
- **Reactive, never timers** — matches the wave-beat philosophy (Steve 2026-10-10).
- **Knowledge gating** — "If you don't know, it doesn't show" (DIRECTIVES.md).
- **Gossip, not broadcast** — pointer lands once via System, then lives in
  villager mouths (TALK & GOSSIP, 2026-10-04).
- **The System's register** — big brother / chilling benefactor who believes
  they're helping (OVERSIGHT, 2026-10-04). A producer who needs a bigger stage
  is exactly that voice.
- **Feel over math** — the player never sees a bar; they feel the story wanting
  more story.

## Verification plan
- Proof test per pointer: fires on exact state, silent otherwise, once-only
  (scripts/test-scale-pointers-*.js).
- Sense-test every line in-voice (System = Claptrap-unhinged producer;
  villagers = their own wants, not hint dispensers).
- **Sim proof the signals work:** a curiosity-following policy — follows rumors,
  knocks when nudged, tends bonds, no hardcoded scale-seeking — should climb to
  regional on the signals alone. If it can't, the signals failed, not the policy.
  (This doubles as Steve's "sim needs to actually attempt to complete the game":
  the honest win-seeker follows the game's own pointers.)
- Regressions: dialog-coherence, gossip-norepeat, ontology gate.

## Build order (if approved)
1. Beats 4+5 (the wave pointers — the actual blocker).
2. Beat 2 nudges (first-knock motivation).
3. Beat 3 felt-time beats.
4. Beat 6 table pointer + "what the table wants."
5. Beat 1 villager idle mention (cheapest, do anytime).
6. Curiosity-policy sim proof.
