# One early Undying anchor

Second Wind moves from position 10 to **6** in the Strange kit. Removing
that entry from the before/after lists leaves identical ordered lists.
Molt stays at 11. Other tracks, the six-entry offer window, three choices,
private sheet RNG, food costs, passive strength and ascension gates are
unchanged. This follows the roadmap's small kit-placement lever rather than
repeating the previously rejected full interleave.

The baseline is `feast-healing-after-64.json.gz`: the current food-deed and
medical-policy rules, 64 seeds per capable/maker/merchant/caregiver, 150 driver
days. The new panel uses the same seeds, policies and driver. Its common
source hashes differ only at `src/data/tracks.json`; the validation file
checks this explicitly. Offer counts are **card appearances**, which can
include repeated presentations. Held-ability samples are daily observations,
not an exhaustive acquisition census. Prepared access does not prove a
healthy natural usage rate.

## Matched natural results

The 16-seed screen leaves wins and player deaths unchanged in each policy;
63/64 complete standard rows match. The 64-seed panel records:

| Policy | Wins | Table entries | Player deaths | Median game days |
|---|---:|---:|---:|---:|
| capable | 52 -> 52 | 56 -> 56 | 95 -> 95 | 90 -> 90 |
| maker | 21 -> 21 | 24 -> 24 | 73 -> 73 | 120.5 -> 122.5 |
| merchant | 20 -> 20 | 24 -> 23 | 42 -> 44 | 144.5 -> 144.5 |
| caregiver | 21 -> 22 | 22 -> 23 | 42 -> 42 | 140.5 -> 139 |

Overall wins **114 -> 115/256**, player deaths **252 -> 254**; 252/256
standard rows are identical. All 256 after-runs capture zero warnings.
The extra caregiver win is a changed build trajectory, not a demonstrated
Second Wind rescue: that run has no fatal-refusal receipt.

Second Wind appears **46 times for players and twice for NPCs**, versus zero
for both roles before. Three player runs hold it in daily samples (caregiver
1/17, merchant 36); no NPC retains it in those samples. One actual fatal-blow
refusal occurs in merchant seed 36 on day 33. This run still loses its village
on day 121 with two later player deaths; before it lost a Table on day 99.
A real rescue is not a guaranteed good campaign outcome.

Molt still has **zero offers and zero held samples**. No Undying class is
sampled. The early anchor now has actual access and runtime use; the full
archetype is not established as healthy. Raw panels are losslessly compressed
as `undying-access-after-{16,64}.json.gz`, with hashes, changed-case summaries
and the exact source identity in `undying-access-validation.json`. The
64-seed source is `8b265c63df05789901cc9378b43efb9ee8ec6b93`.

## Prepared runtime and phone proof

Five assertions exercise the real player and NPC offer methods, confirm
three distinct choices within the initial six-entry window, deterministic
results with no shared random draws, Molt staying outside a fresh holder's
window, and choosing Second Wind through the real queued level-up selector.
The frozen b6804eb3 rules fail the two access/installation assertions; the
candidate passes all five. The existing class-diversity proof passes 22/22.

Phone browser play at 390 x 844 prepared a character and a pending Strange
sheet that actually offered Second Wind. The passive was **not granted** by
the fixture: the actual offer button was clicked, then the character sheet
confirmed Second Wind held in its one currently available magic slot. The
prepared level queue and System arrival bypass normal acquisition; only the
natural panels measure that. Offer and held DOM/screenshot artifacts retain
the distinction. No game UI code changed.

Final quick checks: **147/147**, 47 seconds. Full suite: **919/919**, 197
seconds. No quarantine or weakened assertions. The prepared proof's
not-found path was subsequently made a normal failing assertion so it can
run cleanly against the frozen old rules; its successful choice path did
not change, and the final quick suite passes with that guard.

## NPC follow-up

The baseline contains 3,684 person/run records with no time as bearer. Their
observed Strange deeds include 12,604 family-death credits and 202 contest
credits, but **zero alien-fight and integration credits**. Only two such
records reached 18 family-death credits; the first track threshold is 18.
These counts exclude job XP seeds and mixed NPC/bearer histories. They do
not prove NPCs never level Strange: 83 early-Strange ability appearances
were recorded, and class shaping can offer abilities across tracks.

The source audit identifies a concrete parity follow-up: the player's
survived alien fight calls `noteDeed('alien_fight')`, while NPC integration
milestones currently narrate from `npcLadderDaily` without the matching
credit. Audit actual surviving NPC alien-fight participants and earned
integration events before adding credits; no XP is awarded for presumed
participation in this change. A shared offer function alone cannot establish
equal access when the actors earn different deeds.

Molt access, broader NPC active/passive and feast-power parity, nine remaining
authored ascension deeds and god-scale coverage remain open. No reward,
deployment or service-worker change. Kit feel still needs Steve's eyes.
