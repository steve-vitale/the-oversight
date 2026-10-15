# Noncombat feast-powered healing

An actually landed feast healing bonus now satisfies the existing food-use
deed and spends armed devotion. Hosting alone, turning away the scavenger,
failed/expired treatment and base healing with no room for bonus HP do not.
Combat keeps its existing route. This changes neither Table wave/contest/
crisis requirements nor the requirement to teach sentiment. It adds a
noncombat use of the feast's already-authored power, not free progress.

Field Medicine remains a learned human skill, outside the six magic slots.
Its existing authored feast twist heals half again as much: normally 20 HP
plus up to 10 bonus HP, capped by real missing health. The canonical buff
records `{kind, day, bonusHp}` on first use; subsequent uses cannot replace
that receipt. The buff remains active for its existing duration. The
caregiver policy now treats visible wounds with known, available Field
Medicine, reserving dinner; it does not grant the skill or manufacture injury.

## Actual play and cost honesty

Prepared phone browser play at 390 x 844 used a real pantry-funded feast
(5,000 kcal in that fixture), then the actual **Let the watch drive it off**
and **Field Medicine** controls. No combat occurred. Health rose 40 -> 70,
personal food fell 2,400 -> 2,260, and the saved receipt recorded 10 bonus HP
with the food deed true. `feast-healing-phone.png` and
`feast-healing-browser.txt` preserve the result. The character, skill and
stock were prepared; this does not prove natural acquisition or affordability.

This exposed an older misleading price: the treatment button showed only
the 40 kcal activation charge, omitting its native 100 kcal treatment cost.
The existing native price now lives in the Field Medicine data and the label
shows the full **140 kcal**. The actual charge stays 140; this is not a price
cut. The phone flow was repeated on a fresh local origin to avoid a cached
service-worker build, confirming 140 shown and 140 spent.

## Comparison discipline

There are three distinct comparisons: the published original caregiver
policy, a medical-policy-only baseline on archived aa47bcca game rules, and
the corrected game with that same medical policy. The archive deliberately
overlays only `scripts/policies/livelihood.js`; its supplied base commit is
not a claim that the policy is pristine. File hashes identify the overlay.

The medical-policy-only baseline wins 17/64 rather than the original 20/64,
with player deaths 49 rather than 52, Table entries 18 rather than 22, and
median game days 143.5 rather than 136. Real treatment changes food, time and
later campaign behavior; it is not claimed to maximize wins.

The corrected 16-seed/four-policy screen matches all **64 standard result
rows** of the appropriate baseline and records zero noncombat healing uses.
It cannot establish a natural rate for this uncommon overlap. The 64-seed
follow-up and exact per-policy figures are in `feast-healing-validation.json`.

The corrected 64-seed/four-policy comparison records **110 -> 114 wins/256**
against the medical-policy baseline. Caregiver alone changes: **17 -> 21
wins/64**, **18 -> 22 Table entries**, **49 -> 42 player deaths**, median
game days **143.5 -> 140.5**. Its Table availability is unchanged at 23/64.
All **192 control-policy standard rows are identical**; 252/256 rows match
overall. The published original caregiver policy won 20/64, so the combined
policy/game change is 20 -> 21, not a four-win gain over that older policy.

Seven caregiver runs record eight actual noncombat first-use receipts:
seeds 17, 25, 33, 39, 44 (twice), 49 and 55, with landed bonuses 2-10 HP.
Seeds **25, 33, 39 and 55** newly enter and win a Table. The other three
already had a food-use deed or still lack other requirements; healing is
not an automatic seat. All 256 runs capture zero warnings. Healing magnitude
and cost were unchanged; these are campaign outcomes, not stronger treatment.
The corrected matrix pins runtime/observer commit
`2ad39433164c82da96d4d9614d252099dcd04f12` and retains file hashes.

### Rejected telemetry comparison

The first after-panels emitted `feast_power_used` through Game.tele. That
reads Date.now, and the harness's monotonic clock counts calls to generate
later IDs. Six capable rows changed even with no noncombat healing. In seed
27 this changed a loss to a win: those outcome differences were confounded.
The files explicitly named `clock-confounded` retain this diagnostic evidence
and are **not accepted balance results**.

The fix observes the canonical saved receipt directly, without emitting a
diagnostic game event. A focused combat proof requires no extra clock reads
beyond the pre-existing save. Seed 27's entire standard row then matches the
published baseline again. Observer-on/off verification checks the complete
150-day gameplay hash and standard result. Both panels were rerun with this
correction; use the artifacts without `clock-confounded` in their names.

## Verification and remaining scope

The prepared runtime proof has **16 assertions**: real skill ownership, paid
healing, first-use credit, repeat refusal, full health, no room for bonus,
starvation, expiry, unrelated actions, caregiver use/reserves, clamped actual
bonus, truthful total price and clock neutrality. Four observer parity
assertions pass; `check-wired` finds zero unwired functions in feastBuff;
all 111 ontology systems validate.

One earlier full run hit the pre-existing moot aftermath test (21/27);
isolated rerun passed 27/27 and the unchanged full retry passed 918/918.
No assertions were weakened or tests quarantined. The old standalone
`test-feast-buff.js`, outside the green list, fails its two obsolete
post-expiry x1 damage assumptions both before and after (actual overcharge
is x1.25, 65 passing / 2 failing). That unrelated historical proof is not
reported as green.

Final current-source quick checks: **146/146**, 44 seconds. Full checks:
**918/918**, 190 seconds. Raw reports are losslessly compressed with SHA-256
hashes in `feast-healing-artifact-hashes.json`; the validation file separates
the three comparison stages and lists each healing receipt/new entry.

This is one valid noncombat food-use route, not proof that every playstyle
or caregiver activity is complete. Other noncombat feast benefits, NPC feast
power, remaining active/passive parity and nine authored ascension deeds
still need work. Second Wind/Molt offer access remains a separate measured
dead spot. No gear rewards were changed in this pass. No deployment or
service-worker bump; Steve still reviews the feel of this deed expansion.
