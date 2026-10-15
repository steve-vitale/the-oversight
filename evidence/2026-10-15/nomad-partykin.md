# Nomad: party members' kin get itinerary legs (2026-10-15)

## What was built
The road driver's itinerary (`src/js/nomad-drive.js`) previously planned legs only for the **bearer's** scattered kin. Party members volunteer precisely because they have scattered kin of their own (`nomad.js` `nomadMuster`: kin-seekers volunteer first) — but their trails never became legs. Now they do.

## Design calls (per brief)
1. **Reunion perspective**: a party member's reunion is narrated in third person from *their* perspective — their voice, their choice beats, never the bearer's second person (`nomad-scenes.js` `reunionScene(kinName, fate, ownerId)`). The member decides changed-choices by seeded hash (`memberDecide`: `hash(member-choice|seed|owner|name|kind)`), narrated honestly; the bearer only witnesses. Decided scenes return `choices: null` — no one is left to tap.
2. **All-found**: YES — party members' kin count. "Every scattered kin resolved" is the cleanest rule. `checkAllFound()` now considers the scattered kin of every living party villager. **Fix found while here**: the old code's comment said "kin whose region was never learned don't block it" but the code blocked on them anyway (any unlearnable kin soft-locked `all-found`). Now unknown-region kin genuinely don't block — the road can only walk trails it has.
3. **Fate salting**: party-kin fates hash the seeker's id too (`fateFor(name, moves, ownerId)`); the bearer's formula is byte-identical to before (existing proofs/seeds stable).
4. **Joined kin**: become `kin:` companions exactly like the bearer's reunions — eat/die, never bear the Codex.
5. **Trail sharpening**: same sources (`keepsake`/`villager`/`survivor`/`broadcast`), owner-narrowed to the seeker's kin entry; travel-event strangers now pass the kin's owner. Trail text uses the seeker's possessive ("Caleb's brother") since the bearer knows the quest because the seeker told them. Keepsake source still checks the *bearer's* worn gear — a party member's own worn keepsake isn't modeled on the road (known blank, below).
6. **Seeker gone**: a dead or departed seeker's pending kin `release` on the daily tick (`releaseGoneSeekers`, wired into the wrapped `daily`) — legs close, the road never waits on the dead, and they never block `all-found`.
7. **`stayed` outcome**: when a member's changed-kind is `leads` and they choose `leave`, the member *stays with the kin's village* — removed from `partyIds`, their other pending kin release. The road walks on without them.

## Mechanics notes
- Legs carry `kinOwners{}` (kin name → seeking villager id, null = bearer's own); multi-kin regional legs reused as-is. First push wins on a name (kin names are unique per run under the unique-person law).
- If a seeker *becomes the bearer* mid-road (mantle pass), their kin resolve as the bearer's from then on (compared at resolve time, not plan time).
- Hostile party-kin `fight` decision → real blow-by-blow `fieldFight(seeker, kinDef, …)`, same call shape as `nomad-wild.fightVillage`. Win: kin yields and joins (marked `changed` — "not the way anyone wanted"). Loss: kin walks away, member bloodied, marked `changed`.
- No new UI: all beats narrate through `Game.say`; 390×844 / no-scroll untouched.

## Known blanks (not chased)
- A party member's own worn keepsake of their kin isn't modeled on the road (keepsake sharpening checks the bearer's gear only).
- A *dead bearer's* kin don't transfer to the new bearer (pre-existing blank — existed before party-kin; the new bearer's own kin drive the road).

## Proofs
- `scripts/test-nomad-partykin.js`: **43/43** — (a) party-kin leg planned with seeker tagged; (b) all four fates narrated in third person, never the bearer's second person, bearer scenes unchanged; changed-decision deterministic and pre-resolved; (c) all-found counts party kin, unknown regions don't block, ends the run won; (d) moved-on relocates the seeker's entry, trail resets; (e) no infinite moved loop, seeker salt changes fates; (h) dead seeker's kin released.
- RED-verified: driver reverted → `D.partySeekers is not a function` FATAL; restored → 43/43.
- Regression: `check.js --only nomad` 4/4; nomadwild 9+17+17+10; nomadscenes 24+18+12; integration 11/11; driver 25/25 (departure assertions updated for the new design in the same commit); drive-ui 13/13; ontology "release permitted".
