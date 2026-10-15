# One real companion body across tactical fights

The actual alien encounter builder now carries the companion's existing
world health, ordinary 100-HP capacity, and worn weapon/armor bonuses, just
as the monster builder does. A wounded 77-HP person enters at **77/100**,
replacing the fixed **30/30** helper. Gear is read from the real character;
there are no item-stat, beam-fraction, food-cost or XP changes.

The audit also proved that surviving tactical wounds were discarded on exit:
a companion hit from 77 to 57 returned to the world at 77. `tbEnd` now settles
actual companion HP once, including retreat, death and real healing. It sets
the surviving value directly, without replaying damage, rescue or death
hooks. Canonical IDs are deduplicated; player aliases, summons and unknown
people do not overwrite village bodies. The player's existing health path
is unchanged. This applies to regular and alien tactical companions.

## Runtime and actual phone play

The new shared-harness proof passes **18/18** assertions. It exercises both
real constructors, wounded entry at 77 and 9 HP, actual weapon strikes,
ordinary armor mitigation, and the real targeted beam funnel. With the
controlled beam roll, an unprotected 100-HP companion takes 75; five worn
resistant pieces reduce it to 13. Those beam rules were already correct;
ordinary armor remains a different protection axis.

Real Molt restores the 100-HP body and loses its actual gear and cached
bonuses; real Second Wind keeps 1 HP through retreat. Both persist correctly
to the world. Further assertions cover normal win/calm/rout, duplicate and
synthetic actors, dead bodies, and a replay that must not erase later healing.
The frozen fa740ace source passes 1 and fails 17 assertions. Existing party
XP proof **14/14** and observer parity **4/4** remain green.

Prepared phone play at 390 x 844 used the actual alien encounter. The fixture
supplied a 77-HP companion, spear/jacket, a physical injury, a wounded foe and
the player's turn. The real **Strike** control ended the fight. The fighter
and world both retained **66 HP**, with weapon bonus **30** and armor **15**.
The normal Haven roster also showed **Jason — glazier (66)**. The fixture
does not establish natural acquisition, combat difficulty or affordability.
See `alien-party-phone.png`, `alien-party-browser.txt`, and the before/after
construction diagnostics.

Quick suite **149/149**, 41 seconds; full suite **921/921**, 176 seconds.
No quarantines or weakened assertions.

## Matched campaigns

Baseline: `party-deeds-after-64.json.gz`, including earned NPC fight XP.
Same 64 seeds per capable/maker/merchant/caregiver, 150 driver days.
The 16-seed screen rose **28 -> 38 wins/64**. Full panel:

| Policy | Wins | Table entries | Player deaths | Median game days |
|---|---:|---:|---:|---:|
| capable | 47 -> 48 | 54 -> 52 | 81 -> 76 | 90 -> 90 |
| maker | 17 -> 21 | 21 -> 23 | 65 -> 59 | 133 -> 122 |
| merchant | 19 -> 27 | 22 -> 29 | 46 -> 50 | 128.5 -> 111.5 |
| caregiver | 26 -> 28 | 30 -> 30 | 40 -> 44 | 126.5 -> 127.5 |

Wins rise **109 -> 124/256**; player deaths fall **232 -> 229**. Merchant
and caregiver deaths each rise by four, and capable entries fall by two.
All standard result rows change. Every after-run captures zero warnings.
This is the combined actor-entry and health-settlement correction; the panel
does not isolate their individual effects or establish equal playstyle odds.

Observed healing-credit events among people who never became the bearer
rise **449 -> 468**. These are event counts across changing cohorts, not a
normalized rate. Class coverage stays **14/20**, with different members:
Juggernaut and Undying appear; Seer and Keeper are absent after the change.
Undying is sampled in merchant seed 32. Maker seed 5 earns a real Ember Heart
fatal-refusal receipt on day 138 and records an Unkillable recognition, but
still never enters a Table. Godhood remains independent of the Table gates.
These rare cases do not establish healthy archetype access.

## Provenance and remaining work

Runtime/observer commit: **ab14c7bbf8add77ea279942148990045b7e61add**.
The changed runtime sources are `encounters.js` and `game.js`. The observer
only adds hashes for encounters, alien players, equipment and party code;
its child decisions/observation are unchanged. Before hashes were captured
from the clean fa740ace checkout before editing. Existing common source
hashes and unchanged beam/equipment/party files are checked separately in
`alien-party-validation.json`. Raw 16/64 panels are losslessly compressed,
with SHA-256 hashes retained there.

Molt still has zero natural offers, and no NPC retains Second Wind in daily
samples. Missing class samples are Bulwark, Warden, Seer, Keeper, Hoarder and
Dealer. NPC integration's separate model, remaining active/passive and
god-scale effects, and nine fitting ascension deeds remain open. The next
roadmap work should use these measurements rather than treating the overall
win increase as completion of the class/playstyle audit.
No deployment or service-worker bump.
