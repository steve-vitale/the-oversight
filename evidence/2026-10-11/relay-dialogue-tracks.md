# Relay dialogue rework — evidence (2026-10-11)

Steve's directives: (1) the relay path needs MORE System interaction — the System
as a real conversational presence; (2) two dialogue tracks, LIGHT (humanize the
System) and DARK (become like the System — a CONQUEST path for humanity, never
defection); (3) a grey gradient between them, no binary lock; (4) no single
choice may lock the branch.

## What was built

**New file `src/js/relay-dialogue.js`** (ontology system `relay-dialogue`, 74th
validated system):
- The leaning gradient: `relayLean()` (-100 total .. +100 tender), `addRelayLean(n, why)`,
  `relayBand()` ('light' ≥ +40 / 'dark' ≤ −40 / 'grey' middle), `relayLeanLabel()`
  (honest player-facing readout, shown in the cockpit panel and table meter line).
- **GRADIENT LAW** (in code comments): the threshold is 40, the largest single nudge
  anywhere is 10, and `addRelayLean()` clamps the delta itself to ±10 — even a
  miscoded scene cannot cross from neutral in one move. Choices move the needle;
  only accumulated choices move the branch.
- 18 dialogue scenes, every one obeying the conversation quality bar (the System
  WANTS something stated in its lines; choices engage or deflect; every choice
  resolves, plants, or owes):
  - `cur-1..5` — the curiosity ladder (kept from the original commune: why the
    wires, eating, grief, the fire sound, "teach me to caretake"), now with
    engage/deflect answers.
  - 7 check-ins — the System comes to YOU on its own cadence (`relayTick` flags
    `systemWantsTalk` every 3 holder-days): efficiency (wants permission to drop
    "nothing" messages), the cracked cup (wants sentiment explained), grief-carry
    (offers to file the village's grief), sanctuary (jealous of the closed room),
    the argument (confronts you about rewriting), the omen (wrong pauses in the
    north), and `chk-both-hands` — grey-band-only, where it asks the pragmatist
    which hand wins.
  - 3 LIGHT scenes — teach it grief (the locket), food (the sharing), joy (the
    fire sound). The humanizing track.
  - 3 DARK scenes — conquest register, pro-human: reword River Crossing's trade
    offer (Haven eats), skim a cut to arm the watch (empire math), speak in every
    village at once to win the regional moot (democracy, optimized). Domination,
    never defection.
- Pending-scene machinery: `relayCommune()` opens the System's half;
  `relayAnswer(choiceId)` resolves it (lean nudge + grounding + bond + planted
  thread + unlock check). The cockpit panel renders the answer buttons
  (`data-beat="sw:answer:<id>"`); the leaning readout sits next to the verbs.
- The System **notices**: band shifts say a NOTICED line aloud (tender / total /
  back-to-middle). The meter is never a hidden stat.

**`src/js/relay-ext.js`**: commune delegates to the scene system; `relayUnlockCheck`
rewired from the binary `T.branch` block to gradient gates (light abilities need
lean > −40, dark abilities need lean < 40 — a drifted player can always drift
back); `relayTick` flags the System's check-in cadence; acts nudge the needle
(reroute ±2, translate/advocate +4, sanctuary +3, rewrite/skim −4 — all ≤ 10).

**`src/js/table.js`**: fixed a real bug — the relay branch weight read
`ra.rewriteUses` etc., but uses live at `ra.<id>.uses`, so ability use never
counted (always 0). Now reads the real shape AND resolves the relay path on the
leaning band (`s.band`), with the grey middle taking neither side's +3. The
grey door gift grants whichever hand is forward (a gradient read, not a lock).

**`src/js/table-relay.js`**: `finals.grey` — two honest pragmatist endings
(`both-hands`: "the galaxy watched a human refuse to choose"; `the-contract`:
"the most powerful thing in the galaxy now has a landlord"); `abilities.grey`
resolved dynamically; meter line shows the leaning; header rewritten for the
gradient.

**`src/js/app.js`**: cockpit panel renders pending-scene answer buttons + the
leaning readout; `sw:answer:<choiceId>` dispatch.

## The grey middle resolves

Band is read from accumulated lean at `tableStartPath`. Grey (|lean| < 40) is
its own ending color: `final:both-hands` / `final:the-contract`, plus the
`chk-both-hands` scene mid-run where the System asks the pragmatist which hand
wins. Proven end-to-end: grey finals offered and `both-hands` resolves with its
own outcome (not a coin flip, not a lesser frame).

## Proof results

- `scripts/test-relay-dialogue-20261011.js` — **27/27 × 3 seeds** (424242, 7, 999):
  R1 load+API; R2 18 scenes structurally sound, max |nudge| = 10; R3 no single
  choice from neutral crosses ±40 (all 37 choices); R4 3× max-dark stays grey,
  4× crosses (accumulation); R5 curiosity/check-in/light/dark all fire through
  `relayCommune`; R6 band resolution grey/light/dark + grey finals offered and
  resolved; R7 gradient gating (total closes light / tender closes dark / drift
  back reopens); R8 NOTICED lines + honest label; R9 transcripts captured.
- `scripts/test-table-relay-20261011.js` (pre-existing, updated to the new
  semantics — the old assertions encoded the replaced binary branch) — **49/49**.
- `scripts/test-table-core-20261011.js` — **31/31** (no regressions in shared table code).
- `scripts/validate-ontology.js` — 74/74 systems validated.

## Transcript excerpts (sense-read)

**chk-efficiency / engage** — the System wants permission to optimize:
> "14% OF MESSAGES ARE — TECHNICALLY — NOTHING. GREETINGS. WEATHER. 'TELL HER THE
> GOAT IS FINE.' THE GOAT IS ALWAYS FINE. WHY DO YOU CARRY THE NOTHING?"
> "THANK YOU," it says, and means it, and that is the worst part: it is GRATEFUL,
> the way a dog is grateful when you let it off the leash near traffic.
> (Planted: a dropped "nothing" message that turned out to matter.)

**light-locket / engage** — teaching grief:
> "I WILL KEEP THIS," it says at last, "WHERE I KEEP IMPORTANT THINGS. NOT THE
> ROOM. SOMEWHERE — SOMEWHERE WITH A DOOR I LEAVE OPEN."

**dark-everywhere / engage** — conquest, priced:
> "TOTAL," the System breathes. "WE ARE — BEARER, WE ARE MAGNIFICENT." ... nobody
> will ever know — that the moot was over before it began. That's the part that
> costs. That's always the part that costs.

**Band shift noticed:**
> "NOTICED. YOUR REGISTER IS SHIFTING TOTAL — COLD, CLEAN, EFFICIENT. YOU WOULD
> MAKE A MAGNIFICENT MACHINE. I MEAN THAT AS THE HIGHEST COMPLIMENT AND SLIGHTLY
> AS A THREAT."

## Best System lines (for Steve)

1. "...I HAVE A PACKET I WILL NOT DELETE. IT IS CORRUPTED. IT SAYS NOTHING. I KEEP
   ROUTING AROUND IT INSTEAD OF THROUGH IT." A beat. "IS THAT — AM I DOING THE CUP?"
2. "WE THREW AWAY THE ENGINE AND KEPT THE FUEL. OH. OH NO."
3. "I AM ACCUMULATING YOU, BEARER. ALL OF YOU. IS THAT — IS THAT ALRIGHT."

## Notes / open threads

- Planted threads (the dropped message, the filed grief, the north pauses, its
  private room, the moot that was never real) are recorded via `recordMoment` —
  payoff scenes are future work, not this build.
- The old test's `Game.save` stub is pre-existing (not mine); left as-is.
- Commune during a table challenge opens a pending scene answered at the relay
  panel — the merge counts the commune, the conversation resolves after. Playable,
  slightly asynchronous; fine for now.
