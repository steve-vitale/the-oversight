# Armory and pharmacy: real stock, real recipients

Continuation of Steve's underused-feature/playstyle audit. This pass checks the
public sharing route and resource conservation. No gear rewards, healing amounts,
NPC upgrade priorities or ownership rules are rebalanced.

## Defects and repairs

- An explicitly zero-unit weapon/medicine could be donated as one real unit,
  earn contribution trust and consume time. Empty units are now ineligible.
- Player takes selected the first matching row even if empty, turning it into
  one real item and hiding a later positive entry of the same item ID. Takes
  now choose a positive entry; missing units retain legacy singleton semantics.
- An unarmed real villager could borrow the strongest empty weapon before a
  weaker real gift. NPC armory acquisition now requires positive stock and
  spends exactly one real unit. The existing unarmed acquisition/ownership
  policy is unchanged; this is not a new automatic redistribution scheme.
- Pharmacy entries with explicit zero doses were treated as useful medicine.
  They are now excluded from deposit, take, displayed availability and NPC use.
- NPC use of ordinary undosed medicine discarded a merged multi-unit entry.
  It now spends one unit; real dosed bottles retain one-dose use and their
  remaining doses. For a multi-bottle row, one bottle is split for use and the
  untouched bottles retain their full dose pools (two three-dose bottles become
  five remaining doses after one use). No healing values change.
- The actual stash renderer hides empty weapons/medicines. The specific Pack
  Armory and Pharmacy deposit bindings rely on actual engine narration instead
  of unconditionally saying the item was stashed after a refusal.

## Runtime and phone proof

`test-armory-quantity-20261015.js`: **21 pass** against one seeded shared Game;
the identical script on frozen pre-change source gives **5 pass / 16 fail**.
Independent fixtures prevent an old empty-row mutation from accidentally making
a later availability check pass. Tests prove zero-unit/dose refusals preserve
stock/trust/time, later real rows remain withdrawable, actual withdrawn gear
equips via the public action, positive merged deposits/returns conserve units,
legacy unit-less singleton gifts remain valid, actual generated NPCs cannot
borrow empty weapons and spend only one real weapon/ordinary medicine unit,
a real three-dose bottle retains two doses after use, and multi-bottle stock
retains every untouched dose. NPC healer fallback
remains allowed; the empty-stock checks assert no phantom pharmacy consumption.

390×844 phone, explicit prepared stock and actual controls:
1. Empty legacy weapon/pharmacy rows display "no weapons" / "no medicine".
2. Pack → Armory donates two actual phase blades, spending 2 ticks.
3. Haven → Take selects the real ×2 row despite an earlier empty row of the
   same ID, spending 2 ticks and leaving the empty row unavailable.
4. Pack → Equip → You displays **Phase blade** in the melee slot. See
   `armory-quantity-phone.png`, including actual equip narration and equipment.

These are prepared public-action/stock proofs, not earned prizes or natural
sharing behavior. Positive stock was supplied explicitly; no win, HP or enemy
outcome was forced. Ally equipment/healing uses real generated people in node;
no NPC command or heal was fabricated as a browser action.

## Matched natural coverage

`gear-usage-audit.js --n 16 --policies capable,maker --days 150 --par 4` on frozen
before/after roots from HEAD `f379d70f`, exact same policy bytes. Observer now
also counts `donateMedicine` / `takeMedicine`; it does not add policy behavior.
Final source manifests differ only in app.js, game.js and storage.js.

| Policy | Table wins each arm | Seats each arm | Weapon deposit/take calls | Medicine deposit/take calls |
|---|---:|---:|---:|---:|
| capable | 14/16 | 14/16 | 0 / 0 | 0 / 0 |
| maker | 5/16 | 9/16 | 0 / 0 | 0 / 0 |

**32/32 final gameplay hashes match**, observer errors zero. Data:
`gear-usage-armory-{before,after}-16.{json,md}`. This establishes regression
safety for these measured runs and confirms a policy coverage gap. It does not
establish natural sharing value, or justify upgrading/rebalancing every armed
villager. Ordinary defence and unavoidable combat remain in these livelihoods;
they are not pacifist runs.

The final seed-5 counter trace was also repeated with these repairs and retains
its exact committed reference hash. Final quick suite: **127 scripts pass**, zero
failures (33 seconds). Final full-suite result follows below. No remote push, release or service
worker bump; the full roadmap goal remains open.

Final full suite: **899 scripts pass, 0 fail, 161 seconds**.
