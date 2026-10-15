# Storage worksite and knowledge contract

Steve's playstyle-viability audit continues. This pass repairs a public action
before asking livelihood bots to use it. It makes no storage-value or balance claim.

## Defects and repair

At map (0,0), away from Haven, public `expandStorage()` consumed carried stock,
spent 48 ticks and expanded Haven. A neighboring world tile also qualified for
`playerAtHaven()` narration; that helper deliberately means nearby, so it cannot
serve as construction permission. Expansion now requires the exact stored Haven
coordinates (legacy fallback 4,4) and refuses a live tactical fight before any
material, tier, capacity or time mutation.

The insufficient-material warning also printed an actual roster member's hidden
carpenter occupation before the bearer learned it. It now uses the existing
`specOccLabel` knowledge gate. Learning the profession still shows it normally.
No reward, recipe, capacity, material price or labor value changed.

## Public action proofs

`node scripts/test-storage-worksite-20261015.js`: **14 pass**. The exact same
prepared test against frozen HEAD `76665bfb` gives **9 pass, 5 fail**: remote
mutation/refusal, neighbor worksite, unknown job and combat mutation. Independent
positive fixtures keep the old remote mutation from cascading into cost checks.
Actual roster roles and carried stock are prepared explicitly; specialist and
occupation helpers are not mocked. Ordinary builds consume 10/6/4 branch/stone/vine
and 48 ticks. At tier one a local builder consumes 9/6/4 and 24 ticks; tier two
retains 270,000-kcal pantry and 80-L water capacity.

On a 390×844 phone viewport, a prepared actual local roster builder with unknown
profession and exactly 5/3/2 stock used the real **Take from pantry → Expand
storage** control: tier 0→1, 120,000→180,000 kcal, 40→60 L, 24 paid ticks, no
profession reveal. See `storage-worksite-phone.png`. This is a prepared access/UI
proof, not natural discovery, earned materials or a campaign win.

## Matched natural screen

`gear-usage-audit.js --n 16 --policies capable,maker --days 150 --par 4`, separate
frozen before/after roots from the same baseline archive. The source manifests
differ only in `src/js/food.js`. Both arms use the unchanged current ammo policy.
All **32/32 gameplay state hashes match**; observer errors zero in both arms.

| Policy | Table wins each arm | Seats each arm | Storage calls | Pemmican calls | Preserve calls |
|---|---:|---:|---:|---:|---:|
| capable | 14/16 | 14/16 | 0 | 0 | 0 |
| maker | 4/16 | 9/16 | 0 | 0 | 3 |

Data: `gear-usage-storage-{before,after}-16.{json,md}`. Zero calls establish a
coverage gap. Test preservation/pemmican and deliberate storage economics next;
do not turn these fixtures into a natural viability claim.

## Validation limits

Quick suite: 123 scripts pass. First full suite: 894 pass, one failure in the old
unseeded `test-drifter-grab-20261006.js`: distant-village return/catchup. An isolated
current rerun passes all 11 assertions; the frozen baseline independently fails
the same two assertions (9 pass/2 fail). Its travel helper can stop short. This
is an intermittent baseline fixture issue, not a storage call in that test.
The separate unregistered `test-food-reality.js` retains legacy unarmed-hunt and
retired feast-burn failures on both sources; its storage assertions pass. It is
not claimed green. A final registered-suite recheck is recorded below.

Final full recheck: **895 scripts pass, 0 fail, 150 seconds**, including the
stronger independent storage fixture. No unrelated assertion was weakened.
