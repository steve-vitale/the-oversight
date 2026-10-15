# Prepared caregiver campaign — 2026-10-15

The recovered instruction says abilities and allies should do substantial
lifting before deciding health must scale. Earlier Finale probes had an
advanced gear/army fixture but only the starting ability kit. This pass
tests an explicit developed support kit instead of changing combat numbers.

## Setup and limits

`campaign-prepared.js --build caregiver` replaces the starting magic kit
with exactly six actual level-two abilities: Mending Hands, The Touch,
Lifeline, Last Rites, Battlefield Grace and Second Wind. The shared test
kit opens the existing six-slot threshold (integration 80) and grants each
ability while respecting the slot cap. This is **prepared capacity**, not
proof that a natural career learns all six or reaches that integration.

The existing fixtures provide strong generated alliances, carried food,
advanced actual gear and the first announced crew location. Every profile
starts at **100/100 HP**. Later-node spawns, recruitment, donations, movement,
combat, casualties, camping and victory use real game actions and resolution.
No later-node teleport, HP increase, enemy stat edit or forced combat result.
The full-strength heart in the winning seed-99 trace starts at 2,047 HP.

Replay that trace with:
`node scripts/campaign-prepared.js --seed 99 --titan finale --loadout advanced --build caregiver --tactic guard-heal --trace 1`.
For the matrix, use the report's 64 seeds with build/tactic pairs
`starter/guard`, `caregiver/guard` and `caregiver/guard-heal` on the same source.

The default starter profile remains unchanged: its sixteen previously
recorded final gameplay-state hashes match **16/16** under the new tool.
The starter/caregiver comparison changes integration as well as the kit;
do not attribute its whole difference to one ability. The two caregiver
profiles hold both constant and change the tactic only.

## Optional tactic

`--tactic guard-heal` is an audit-only experiment. It stays behind the army
and uses available public Mend on itself below 85% HP before the usual
retreat decision, paying the actual 60 kcal and action. It keeps a food
reserve and requires a real marked campaign with at least five living,
present allies. If healing is unavailable and health is below the ordinary
coalition threshold, the normal retreat policy takes over. Binding Q,
earned crew tools and real movement retain their costs. No natural policy
receives fixture grants or this experimental healing priority.

## 64 matching seeds × three profiles

`caregiver-campaign-prepared-64.json` includes source hashes, build metadata,
actual fight results and named ally identity/status records. No probability
claim about ordinary players or natural acquisition follows from this matrix.

| Prepared result /64 | Starter + guard | Caregiver + guard | Caregiver + guard-heal |
|---|---:|---:|---:|
| Crew clears | 28 | 44 | 56 |
| Opening credits clears | 9 | 21 | 26 |
| Heart entries | 6 | 16 | 22 |
| Completed Finale campaigns | 1 | 9 | 21 |
| Bearer losses in crew | 4 | 1 | 0 |
| Paid guard Mend casts, total | 0 | 0 | 128 |

Counts use actual fight records. A completed campaign resets its intermediate
flags, so counting `campaigns.finale.opening` would undercount clears. Every
one of the 31 completions across profiles has all three fights recorded as
won, with the real `slain.finale` and campaign done state. The prepared tool
makes at most three road attempts; ordinary travel/health stops remain and
some runs never enter. This is not an exhaustive campaign-solving bot.

Ally conservation audit across all 192 runs: no duplicate identity inside a
fight and no dead ally reappearing at a later stage. Living fighters who fled
can return; new Haven commitments also explain larger active later lineups.
Do not treat the per-fight non-fled count as the whole surviving muster.

## Damage / ability trace

`caregiver-campaign-trace-99.json` observes actual damage and ability calls.
Its final gameplay-state hash equals the untraced matrix run; the seed-7
trace/control also matched before the additional census fields. Seed 99
wins crew, opening and heart in 15, 7 and 9 rounds, finishing at 28 HP. Its
three successful Mend casts each spend exactly 60 kcal and mark the action
used. The last heals 1→28 after Second Wind's automatic recovery, rather
than a direct HP grant from the probe. The first two heal 56→90 and 63→98.

## Phone playtest and checks

A fresh local origin at 390×844 uses an explicitly labeled six-slot
caregiver arena. It prepares the same six level-two definitions and a
60-HP wound beside an ordinary turtle. Pressing the actual Mend button
heals 60→94, spends energy 2200→2140 and leaves zero actions. The fixture
readout remains 6/6 magic. See `caregiver-campaign-phone.png`.
This tests the actual ability UI/cost, not a phone campaign victory. No
hidden-state browser evaluation; the test tab was closed, viewport restored
and temporary server stopped.

Quick checks: **120 pass, zero fail (32 seconds)**. Full suite:
**892 pass, zero fail (152 seconds)**. Runtime/data/policy sources are
unchanged by this pass; only the explicitly prepared audit tool and evidence
changed. No production balance lever or health growth was added.

## Next

The Finale has prepared end-to-end combat proof now. Natural career/gear/
coalition access, a general campaign policy, food/overtime limits and the
full Network march still need work. Other support, maker, social and field
builds are not proven by this one kit. Continue livelihood materials,
preservation/storage/peer trade and item powers as separate coverage gaps.
