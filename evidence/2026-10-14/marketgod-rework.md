# Market God capstone rework — evidence (2026-10-14)

Steve directive: "Fix market god." Worker: sim-marketgod.

## What was weak

**B1. The capstone was pure convenience, not godhood.** Old mechanic: "once per
day: summon a trader to your location with favorable prices." Compare the other
10: Unkillable cheats death, One-Person Army deals uncapped retaliation,
Apex Predator dictates fight terms, Living Garden feeds 50+, The Between
negates a hit, Undying Ward can't drop below 1 HP. Market God changed the math
of nothing — a shopping trip.

**B2. It was unwired dead code.** `summonMarket` was defined in godhood.js,
exported, and called from *nowhere* in src/js (verified: zero references
outside godhood.js). The capstone literally never fired in gameplay. (All 11
capstone verbs are currently unwired — out of this task's scope, noted below.)

## What changed

**New capstone: "Name Your Price" + "Buy Them Off"** — wealth as a weapon and
a ledger. Keeps the wealth/commerce identity; delivers the fantasy ("Infinite
resources. The market bends to you").

1. **`namePrice(sch, itemId)` (daily)** — Name ANY item in the catalog; a trader
   arrives at your location with exactly that item. Paid in food-kcal barter
   (food is the apocalypse's currency): t1 800 / t2 2000 / t3 5000. Tier-4
   relics are LENT, never sold — always a debt marker.
2. **`buyOff(sch, wave)` (per fight)** — Buy one monster's hesitation: it spends
   its next 2 turns weighing your offer (uses the existing `fighter.hesitate`
   mechanic) instead of attacking. Price scales by wave: w1 1000 / w2 2500 /
   w3 5000 / w4 10000 / w5 marker-only. Wealth is now a combat resource —
   two free turns against a wave-3+ monster is run-saving.
3. **Debt economy (real cost).** Can't pay — or buying the unbuyable — takes a
   debt MARKER instead of refusing. The market always delivers; the debt always
   accrues. 3 markers → `auditDue()` true ("the Audit comes to collect in
   person"). Debts outlive death (weakness).
4. **Wired into gameplay.** `Game.marketNamePrice(itemId)` and
   `Game.marketBuyOff(fighter)` are real game methods: they mutate scholar
   state (kcal, inventory, markers), apply hesitate to the live fighter, and
   narrate via say(). The old verb had no game entry point at all.
5. **Diegetic structure kept.** New hint ("The traders have stopped haggling
   with you... Someone is keeping a ledger"), new recognition beat (the ledger
   page with your name, ink still wet), kept the systemLine (BREAKING FINANCIAL
   NEWS — it's good). Real weakness: wealth doesn't stop a beam; bought time
   runs out; the market remembers every marker.

Files:
- `src/data/godhood.json` — market_god capstone/hint/recognition rewritten
  (7 lines, surgical — file style preserved).
- `src/js/godhood.js` — `summonMarket` replaced by `namePrice`/`buyOff` +
  `marketMarkers`/`auditDue`; `resetDayVerbs` updated; exports updated.
- `src/js/game.js` — `marketNamePrice`, `marketBuyOff`, `marketItemName`
  wrappers with narration.

## Proof results

`scripts/test-marketgod-rework-20261014.js` — **44/44 GREEN** (via sim-harness,
seeded). RED-verified via patch files: on old code the test fails
(`G.namePrice is not a function`).

Key assertions:
- t1/t2/t3 deliver with correct kcal charges (800/2000/5000); once-per-day
  gate; dawn reset works.
- t4 always takes a marker even when rich; poor scholar still gets the item
  (marker instead of refusal); unknown item rejected honestly.
- 3rd marker → auditDue true; 2 markers → false.
- buyOff: 2 turns hesitation, wave-scaled pricing, once-per-fight gate,
  fight-reset works, w5 marker-only, null without godhood.
- Game wrappers deliver to real inventory, narrate, apply hesitate=2.

Regression:
- `scripts/test-godhood-capstones.js --green` — **257/257** (also repaired
  pre-existing rework drift: 10→11 godhoods, abilityPool format, day-80 floor,
  relay office-gate; repointed from stale staging dir to repo).
- `scripts/test-break-godhood-20261009.js` — **94/94**.
- `scripts/validate-ontology.js` — **94/94**, release permitted.

## Power comparison (old vs new)

| | Old | New |
|---|---|---|
| Daily | trader with random stock, favorable prices | ANY named item delivered |
| Combat | nothing | buy 2 free turns vs any monster |
| Endgame relevance | zero | tier-4 on demand (at a price), wave-5 crowd control |
| Cost | once per day | once per day + once per fight + debt/audit economy |
| Wired into game | no (dead code) | yes (game methods + narration) |

## Metric review

Pre-registered: capstone must be (a) endgame-powerful — changes survival math,
(b) actually wired — observable effect in game state, (c) diegetically complete.
All three met. No metric revision needed.

## Open / out of scope

- The other 10 capstone verbs remain unwired (defined, never called). Market
  God is now the only one with game entry points. A follow-up should wire the
  rest or the godhood system stays ceremony-only.
- The Audit itself (3-marker event) is flagged via `auditDue()` but no audit
  monster/event exists yet — the game can check `auditDue()` and trigger one.
  Filed as a gap, not built (needs Steve's call on what the Audit IS).
- No UI button yet (app.js) — the game methods exist; UI wiring is a
  separate [needs-eyes] task if Steve wants it player-facing now.
