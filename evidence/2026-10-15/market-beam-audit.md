# Market God field-beam weakness and scale caller audit

2026-10-15. Base d01e37eef598832c9d3e30cb466ed31ba4b915ce;
Codex godpath/scale lane, codex/resume-claude. No release/SW bump.

## Decision and lever

Retain the existing weakness: wealth does not stop a beam. Tactical player
and NPC hits already pass the beam marker to the shared Gilded Guard. Field
combat previously passed only a total to fieldIncoming, so the Market God's
coins absorbed beams as ordinary damage. This is an existing contract/parity
correction, not an attempt to restore or maximize a campaign win rate.

The field caller now preserves its actual selected attack and beam component.
A beam species can select an ordinary physical attack; it must not become
immune to coins merely because another attack is a beam. The deer's additional
physical antlers remain shieldable. The field guard protects only the non-beam
remainder, after prior avoidance/ability processing; a vanished hit spends no
coins. The first such beam logs the weakness once per fight. Other armor and
ability processing, monster damage, coin capacity/regen/prices, party selection,
RNG draws and the tactical path are unchanged. This does not implement an
entire off-screen god kit or resolve the separate Brawler beam-wound ledger.

## Real runtime proof

Eight shared-harness assertions pass; the frozen base passes three and fails
five. Actual fieldFight cases use drone beam, mixed deer beam plus antlers,
selected physical Antler Sweep and an ordinary wolf physical hit. The test
reads the actual guard hook without replacing its result or consuming RNG.
First calls with fixed private draws:

- Drone: incoming 29; coins previously absorb all 29. Candidate beam 29,
  coins absorb 0, remaining 29.
- Deer mixed: incoming 31; candidate beam 21, coins absorb physical 10,
  remaining 21. Baseline absorbs all 31.
- Selected Antler Sweep from the same deer: all physical, still shielded.
- Actual tactical NPC tbDamage: a beam still bypasses the guard; a subsequent
  physical hit still uses coins. This existing working path is a control.

The test fixtures prepare godhood/health and use real monster data. They do not
claim naturally earned ascension. Logs have no runtime warning after fixing the
test fixture's npcSkills shape to the shared array contract.

## Standard campaign screen and confirmation

Current collector/contract, identical policies and flags on both roots; default
Columbus origin, 150 driver days, Node v24.13.0. Sixteen seeds per policy screen,
then 64 per capable/maker/merchant/caregiver. Full raw panels, configurations,
23-metric reports and on/off controls are retained. Frozen baseline source is
content-bound, with no inherited enclosing Git HEAD. Before rows reuse the
verified daily-clock candidate cache because every source/config input matches.

All 64 screen states and all 256 confirmation states/standard rows are
identical. All 23 metrics remain identical per policy. Wins stay 55/21/23/23;
community losses stay 8/19/14/18. All 256 retain earned tier-3+ gear; this is
mixed-policy coverage, not pacifist or crafting-only viability. Both roots
have stable source manifests, zero observer/runtime errors, and passing seed-7
on/off controls for each policy. All 512 confirmation rows match verified
cache result digests. The retained 16 control jobs match full standard rows
and gameplay hashes in each on/off pair.

No sampled player or NPC Market God occurs in these campaigns. Thus
no_material_signal is evidence of unchanged sampled campaigns, not safety or
balance evidence for affected god builds. Previous caregiver community warnings
and increased capable winning remain open. The fix does not clear them.

## Affected prepared cohort, 64 pairs plus physical control

The reproducible probe-market-guard.js loads one shared harness per seed/monster
process. It binds source, Node, origin and flags to a matching saved panel,
checks source/probe stability, rejects stderr and nonfinite outcome HP. Seeds
1-64 face real freshly rolled full-health review_drone or hushwolf. Each actor
starts at day 85/100 HP/10 hunger, with prepared Market God, no abilities/skills
and ordinary generated equipment. The 128 paired initial gameplay hashes match
exactly. Private combat draws are seeded; complete field records and final
hashes are retained. This is guard isolation, not a full earned god build.

| Returned field result / resource | Drone before -> after | Physical wolf before -> after |
| --- | --- | --- |
| monster fled (mFlee) | 48 -> 0 | 64 -> 64 |
| villager fled (vFlee) | 0 -> 46 | 0 -> 0 |
| villager died (vDie) | 16 -> 18 | 0 -> 0 |
| mean ending HP | 36.890625 -> 21.125 | 89.09375 -> 89.09375 |
| mean gross wounds | 66.484375 -> 81.34375 | 10.90625 -> 10.90625 |
| mean coin absorption | 199.28125 -> 14.65625 | 186 -> 186 |
| final hunger | 10 -> 10 | 10 -> 10 |

All 64 wolf records and final gameplay hashes match. Drone trajectories change;
16 newly die and 14 no longer die. Death delta +0.03125 has exploratory paired
bootstrap interval [-0.140625, 0.203125], unadjusted and without a holdout.
Do not call this a proved population survival regression or reduce beam damage
to recover its previous rate. It establishes that the weakness matters.

Important competing behavior: the real engine returns early learn-first vFlee
outcomes despite opts.noFlee=true. Seed 2 previously died; after the beam hits,
it withdraws at 3 HP in round 3, even following the log that the gate is shut.
Seed 1 previously routed the drone at 67 HP; candidate dies in round 10. The
probe preserves both results. Its field outcome is returned before the usual
caller's later wound settlement; it is not a settled campaign death. Repair the
sealed-contest withdrawal contradiction as a separate measured change before
using these cases to judge arena survival. Exact seed transitions are in the
stress summary; full records permit inspection without a hidden scoring model.

During probe development an initial setup incorrectly supplied monster hp's
range as the world entity's scalar hp, producing nonfinite monster endpoints.
That local dry run is rejected, not retained as proof. The final probe delegates
fresh HP rolls to the real field engine and explicitly rejects nonfinite
outcomes. Only rerun finite, source-bound results are published here.

## Prepared phone proof

At 390 x 844, the retained fixture loads the real game scripts and exposes
clearly labeled replay controls, real fieldFight and a read-only first-hit
observer. Drone and mixed deer counters/logs match the numbers above. The
two screenshots show the actual guard result and weakness narration. This is
a prepared diagnostic page, not a production contest flow or natural campaign.
The generator's initial escaped-newline syntax error was corrected before the
retained proof; generated script syntax was checked before replay. Test tab
closed and temporary viewport reset; owned local server stopped.

## Forty scale contexts and next work

New docs/godpath/SCALE-AUDIT.md maps each of ten gods' party/titan/contest/army
promises to actual callers or an explicit open question. It distinguishes
inherited tactical effects from strategic roles and dedicated noncombat contest
mechanics. In particular, dedicated god-specific crowd/scars/mercy/race/strategy/
performance/endurance/sponsorship/feast contest realizations are not established
by a functioning combat verb. This inventory is source evidence, not forty
runtime proofs or completed balance. Additional recipient parity, NPC integration,
Brawler actual beam-wound accounting, natural campaign/Network and eight authored
deeds remain open. The Garden feeding interpretation question remains recorded.

See validation.json for final check counts, source reconstruction and artifact
hashes. The source bundle references the exact committed relay-clock source
bundle's after arm for unchanged baseline files, verifies both full manifests,
and retains the two changed file contents plus the probe/shared kit. This avoids
storing another duplicate full game. Reconstruct the candidate by replacing
only those named files; raw source/config identities remain in each panel.
