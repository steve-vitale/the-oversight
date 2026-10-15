# Earned tactical party-fight progression

Surviving villagers who actually joined a tactical battle now receive the
same deed-table rewards as the bearer and field fighters: **fight_won = 2
combat XP**, **fight_survived = 1**, and **alien_fight = 2 Strange XP** when
the encounter really involved an alien player. Ordinary monsters do not
become alien contact. A personal retreat earns survival even if the group
wins; routed outcomes retain the existing player's no-combat-deed rule.

Only registered, living, positive-HP `villager` fighters qualify. Absent
villagers, summons, unknown IDs and the original bearer's alias do not.
Canonical IDs are deduplicated. `tbEnd`'s existing over/settled guard prevents
replay. The original bearer ID is retained through settlement so a living
NPC who becomes the successor still receives their own earned credit.
Existing player credit and timing remain unchanged; field rewards are not
duplicated. No integration XP, reward prices or passive strengths change.

## Runtime and actual play

The shared-harness proof has **14 assertions** covering victory, retreat,
flee/calm/rout, ordinary-monster exclusion, dead and stale-zero-HP actors,
absence, summons, unknown IDs, duplicate actors, replay, the player's own
credit, defeat/succession, and an actual 16 -> 18 Strange threshold crossing
that queues the NPC's normal sheet without granting an ability. Defeat's
legitimate family-death and mantle XP are measured separately from the alien
credit; `creditDeed` returns a resulting total, not an increment.
The frozen 3b32a693 source passes 6 and fails 8 of these assertions; current
source passes 14/14.

Prepared phone play at 390 x 844 placed a real companion near the threshold
and a wounded Hushwolf in an actual battle. The real **Strike** control won
the fight: Sofia moved **16 -> 18 combat XP**, with **one pending sheet**.
The fixture supplied the near-threshold XP and wounded foe; it did not supply
the reward or settle the fight. This verifies the caller/threshold/UI flow,
not natural acquisition or combat difficulty. See `party-deeds-phone.png`
and `party-deeds-browser.txt`.

Final quick suite **148/148**, 38 seconds; full suite **920/920**, 193
seconds. No quarantines or weakened assertions. Production changes are only
in `game.js`, with the lane exception documented before the edit.

## Matched natural panels

Baseline: `undying-access-after-64.json.gz`. Same 64 seeds per policy,
150 driver days, shared sweep driver. A 16-seed screen gave capable 13 -> 12,
maker 6 -> 3, merchant 7 -> 5, caregiver 6 -> 8 wins; it already showed mixed
effects. The full 256-run comparison is:

| Policy | Wins | Table entries | Player deaths | Median game days |
|---|---:|---:|---:|---:|
| capable | 52 -> 47 | 56 -> 54 | 95 -> 81 | 90 -> 90 |
| maker | 21 -> 17 | 24 -> 21 | 73 -> 65 | 122.5 -> 133 |
| merchant | 20 -> 19 | 23 -> 22 | 44 -> 46 | 144.5 -> 128.5 |
| caregiver | 22 -> 26 | 23 -> 30 | 42 -> 40 | 139 -> 126.5 |

Total wins **115 -> 109/256**, player deaths **254 -> 232**. Thirty complete
standard rows are identical. All 256 after-runs record zero captured warnings.
This repairs an earned-progression omission; it is **not an across-policy
balance improvement**. Caregiver outcomes improve, while the other policies
lose wins. Deaths, ending exposure and duration vary together; neither lower
deaths nor more XP alone establish better overall viability.

Across person/run records that never became the bearer, observed credited
fight_won events rise **2,892 -> 7,258**, fight_survived **22,632 -> 24,104**,
and alien_fight **0 -> 3**. These are event counts across changing cohorts,
not per-person XP averages. NPC Second Wind appearances rise **2 -> 3**;
Molt remains absent. Daily class samples across all actors fall **15 -> 14**:
Bulwark is no longer sampled. Broader class balance and NPC uptake remain
open rather than being declared healthy from shared reward wiring.

Compressed raw panels and `party-deeds-validation.json` retain exact metrics,
source hashes and artifact hashes. Only `src/js/game.js` differs among common
runtime sources. The panel finished before the code commit, so its reported
checkout base is 3b32a693; recorded working bytes match candidate code commit
**f86f093df1591245b636a25643a03809370dacf2**, after normalizing line endings.
The original report is retained unchanged rather than relabelled as pristine.

## Next verified defect and remaining work

`node scripts/godpath/probe-alien-party.js` pauses advancement solely to
inspect the actual alien encounter builder. The prepared companion has
**77 world HP**, but enters at **30/30 HP**, with `wbonus` and `varmor`
unpopulated. The ordinary monster builder already uses real world HP and
equipment bonuses. `party-alien-actor-diagnostic.json` preserves this result;
the validation file pins the relevant runtime hashes. Restore that actor
contract next, prove actual armor/weapon effects, then repeat matched panels.
The current patch intentionally keeps that separate from XP credit.

NPC integration remains a separate model: `npcLadderDaily` increments a
random daily counter for the first six villagers. Those narrated milestones
are not yet equivalent to the player's earned integration events, so this
patch awards no XP for presumed work. Noncombat progression, Molt/Undying
access, the missing Bulwark sample, broader active/passive and feast parity,
nine authored ascension deeds and god-scale coverage remain open.
No deployment, main-branch push or service-worker bump.
