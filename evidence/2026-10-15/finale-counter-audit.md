# Finale counter access and real item cost — 2026-10-15

The unfinished campaign audit found a bot coverage defect: the real phone
already showed earned Red Pen, Leaked Script and Bad Note controls, but
`capable.sigButtons` ignored their `data-finale` attribute. They were present
in the HTML yet absent from the bot's available actions. The parser now
recognizes them, and the ordinary capable policy has one-use priorities.
The explicitly selected prepared guard experiment also uses offered crew
tools after its Spoiler counter. No unearned tool is granted to natural runs.

Separately, `tbFiSacrifice('item')` treated a zero-unit stack as one item.
An exhausted stack could satisfy the countdown for free; looking up a live
stack by ID could consume an earlier exhausted duplicate instead. Feeding
now selects a positive stack and subtracts one from that exact object, including
ID-less food. Missing `units` retains the legacy one-item meaning. The encore
still rejects memories. No combat, food, recruitment or progression values
were retuned. Item-feeding policy priority is not added in this pass.

## Proof and coverage

- Shared-harness counter proof: 16 pass / zero fail. Frozen parent
  `05a26368`: 2 pass / 14 fail. It reads actual generated phone HTML,
  invokes parsed callbacks, checks effects and one-use consumption, rejects
  a second action, and verifies positive/zero/duplicate/ID-less stacks.
- This is a prepared counter arena, not a campaign win: it starts a real
  adjacent speedbump encounter, substitutes a Finale monster definition and
  explicit crew-tool/countdown fixtures. The unit test observes the real
  counter functions while stubbing subsequent action completion. It does not
  establish organic tool acquisition or survival.
- Quick suite: 120 scripts pass, zero fail, 31 seconds.
- Ontology: 111 systems, zero errors; `sigW5.js`: 39 functions, zero unwired.
- Final full suite: **892 scripts pass, zero fail in 178 seconds**.

The first full run passed 891/892; the unrelated legacy drifter test failed
its three-day net forage-stock assertion. A direct rerun failed on a
different seed while the frozen runtime passed, exposing non-repeatable
module-captured randomness. The fixture also filled only 7×7 tiles in the
actual 9×9 world, leaving edge turf free to regrow during its net-depletion
check. It now seeds the shared RNG before evaluation and fills all nine rows
and columns. All 33 assertions remain; three repeated runs pass. There is
no production village/forage change and no assertion quarantine.

`finale-counter-natural-before.json` / `finale-counter-natural-after.json`
rerun 16 matching seeds × two unchanged campaign policy definitions × 240
days with the standard driver on frozen old/new runtime. The capable
dependency intentionally changes its parser/preferences; all other policy
and gameplay differences are listed in source hashes. The manifest now
also includes `sigW5.js`, previously absent from this instrument.
Only `capable.js` and `sigW5.js` differ in the final source manifests.
All **32/32 final gameplay-state hashes are identical**. Control wins stay
12/16, campaigner wins 10/16, campaigner Herald kills 8/16; no campaign-policy
errors. These runs did not exercise the late crew-tool branch. The prepared
probe supplies that coverage, not a natural campaign completion claim.

## Prepared march

`finale-counter-prepared-16.json`: same sixteen seeds, same prepared gear,
relationships, food, initial arena and guard experiment on frozen old/new
runtime. Source hashes differ only in `capable.js` and `sigW5.js`. Both trees
receive the identical guard experiment, so its attempted tool use is held
constant; the old parser cannot discover those controls.

Both versions clear seven crews, one opening, enter one heart fight and
complete zero campaigns. The changed version uses one earned crew tool
(seed 555); the old uses none. This is real feature-use evidence, not a
balance or natural win-rate improvement claim. The experiment still lacks
a developed six-slot ability build and general counter/feed strategy.

## Phone proof

Fresh local origin, actual app renderer at 390×844, service worker disabled.
An explicitly labeled prepared counter arena supplies an exhausted knife
stack followed by two live knives. After the normal starter choice, pressing
the real **Feed: item** button changes the live stack 2→1, keeps the empty
stack at 0, clears countdown 3→null and shows 0 actions. The actual receipt
reports satisfaction. The renderer also exposes the three crew buttons;
this phone probe does not claim to have used all of them in a campaign.
See `finale-counter-phone.png`.

No hidden-state browser evaluation. The fixture's monster substitution is
test setup, not a route past the campaign gates. Test tab closed, viewport
restored and temporary server stopped.

## Next

Build and play a clearly labeled six-slot prepared career using real ability
costs, then improve the campaign bot from public controls without promoting
fixture grants into natural play. A completed Finale and Network campaign,
natural food/overtime reach, and the livelihood/material/item-power audits
remain open. These repairs close two specific reasons a feature appeared
unused; they do not prove all playstyles balanced.
