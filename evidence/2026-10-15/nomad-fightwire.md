# nomad-fightwire — wiring foreign-village encounters into the road UI (2026-10-15)

The engine existed but nothing called it: `nomad-wild.js` staged foreign
villages (`villageEncounter` returning mood-gated actions) and resolved real
blow-by-blow fights (`fightVillage`, proven 39/39), but no game code or UI
ever invoked either. Per repo law ("a feature is done when it's called from
game code"), this was decoration. Now it's wired.

## What was built

- `nomad-drive.js`: `stageVillageEncounter(leg)` runs inside the `enterLeg`
  wrap — entering a leg stages the foreign village on its map through
  `nomadWild.villageEncounter` (the single call point) and holds the gated
  actions open on the leg. `pendingVillageEncounter()` exposes the open
  encounter in beat shape (name, mood label, actions). `villageTap(action)`
  answers it: trade → `nomadWild.tradeWith(v, 1000)`; join → `joinVillage(v, 3)`;
  fight → `fightVillage(v)` (real combat); leave walks away free.
  A new guarded `wrapDepartLeg` clears the open encounter when the party
  moves on — walking past forfeits the meeting, narrated honestly.
- `app.js`: the road UI renders the encounter as a beat row (village name,
  mood label, tappable gated actions; hostile villages show only fight /
  walk away). Taps dispatch `nve:<action>` to `villageTap`.
- Reused the sibling's changed-reunion beat pattern (`data-beat` buttons +
  a handler delegating to nomadDrive); no new choice-UI framework invented.

## Proofs

- `scripts/test-nomad-fightwire.js` 22/22 (seeded): staging on leg entry,
  beat shape, trade routes honestly (supplies delta === tradeWith's own
  report, +400 kcal warm), join routes into the rest beat, fight routes
  into real fieldFight duels, leave is free and narrated, hostile offers
  only fight/leave and refuses trade, depart clears the encounter.
  RED-verified: ran before implementation — `pendingVillageEncounter is not
  a function` (unwired hook → fail), GREEN after.
- `scripts/test-nomad-villagefight.js` re-run 39/39 — the fight destination
  is still real combat.
- `node scripts/check-wired.js src/js/nomad-wild.js src/js/nomad-drive.js`:
  0 unwired (villageEncounter, genLegVillage, tradeWith, joinVillage,
  fightVillage all now have callers in src/).
- `scripts/check.js --only nomad`: 4/4. Ontology: 114/114, release permitted.
  (Grammar lesson: provides entries with args need the `name(args) -> ret`
  form; bare `name(args) : description` parses to a phantom name.)

## Transcript sense-read (seed 21)

Leg entry stages Stonebridge, wary: "A palisade, smoke, voices —
Stonebridge, 8 souls who know this land the way you know yours. Lark the
elder comes out to meet you, reading your packs the way you'd read theirs.
Stonebridge is wary. You could trade pack food for theirs, ask to rest at
their fire a few days — or take what you want, if you're willing to be the
people who did that." Trade answers: "You trade 1,000 kcal of pack food for
1,000 kcal of Stonebridge stores. 'Done.' Lark nods, once." Reads as
people meeting people — the speaker has a name and role, the bargain is
narrated, the fight option carries its moral weight in the staging line.
No fabricated shared history; the village knows its land, you know yours.

## Needs eyes

The beat row renders like the other beats (pendingBeg etc.), but the
tappable feel at 390×844 on a real phone is untested — app.js is DOM-only.
