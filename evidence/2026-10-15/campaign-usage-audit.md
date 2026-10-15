# Campaign coverage and the remaining dead spots

2026-10-15. Continuation of Steve's roadmap and playstyle-viability audit.
The prior coalition repair made real recruitment possible; it did not prove
the route could be played. This pass adds a separate `campaigner` policy and
matched `campaigner-control`, both based on capable with the same cautious
late-game waiting. The ordinary capable policy keeps its existing choices.

## What is implemented

The campaigner uses offered council/call/reinforcement/commit actions for
located threats, one army at a time. It confirms Haven's volunteers with
two real taps, provisions from the actual pantry while reserving two village
days, keeps its best carried equipment, and donates complete batches of
spare weapons/armor to named foreign forces. Donation batches never stack
multiple weapons on each soldier. Travel and local approach use the existing
paid walk/path APIs before combat. The next Finale or Network target follows
the actual campaign state; the policy never summons an unavailable Network.

An opt-in commitment recognizes a real campaign fight with at least five
living allies and a bearer above half health. Both layers of the combat bot
honor it, avoiding the lone-player HP comparison that rejected every army
fight. Special beam hazards and weakened-army/bearer retreat remain active.
No natural-run relationship, progression, equipment, food, HP or position
grants occur. The shared navigation helper inherits capable's route-around
terrain probing; this is a coverage policy, not a proof of human knowledge
parity in navigation.

The first combat probes exposed hard-coded 9x9 movement in the pure combat
helpers. Their optional maximum now defaults to eight, while villagers,
rally movement, ground monsters, flyers and retreat callers pass the real
battle boundary. Damage, armor, enemy HP and rewards are unchanged. Nine
focused checks pass; seven fail against the frozen original code.

## Natural screen

Same 16 seeds, 240-day horizon and standard `runComparison` driver, one game
per child process. Both policies retain capable's safety fallback to the
Table when the run weakens; this is not reckless waiting to day 200.

| Measure | Control | Campaigner |
|---|---:|---:|
| Runs | 16 | 16 |
| Table wins | 9 | 10 |
| Runs using a council | 0 | 14 |
| Runs sounding a call | 0 | 11 |
| Actual marked Herald fights | 0 | 9 |
| Herald kills | 0 | 6 |
| Real gear pieces donated | 0 | 35 |
| Pantry calories transferred for campaigns | 0 | 1,189,932 |
| Runs stopped at least once by insufficient carried food | 0 | 13 |
| Runs stopped at least once by coalition strength | 0 | 4 |
| Runs stopped at least once by travel | 0 | 1 |
| Finale campaigns started | 0 | 0 |
| Network campaigns started | 0 | 0 |
| Maximum overtime tier observed | 2 | 2 |

Nine Herald resolutions comprise six wins, two retreats and one routed
fight. Explicit policy-start counters count only two fights: several begin
during real approach/travel. Use the neutral public-method observer for
actual battle counts. No policy/capability errors were recorded.

The extra Table win is a small screening difference, not an established
balance improvement. These policies seek combat; the result does not prove
pacifist or every livelihood ending viable. Earlier reward and maker audits
remain the evidence for noncombat good-gear acquisition.

Frozen movement-before and movement-after runs have **identical gameplay
state hashes in all 32 matched rows**. The movement repair is proven by
runtime regression, not by a natural win-rate gain. The new bot, rather than
the grid fix, creates the campaign coverage in this screen. Source hashes
are saved in the raw reports. Observer-on/off seed 4 through the full run
also has the same final gameplay hash, including a real Herald victory.

## Prepared combat probes

Three seeds (7, 42, 99), Herald/Finale, two loadouts, frozen before/after:
24 cases total. The fixtures explicitly prepare strong real alliances,
400,000 carried calories and nearby announced monsters. The armed loadout
provides ordinary knives/padded clothing; advanced provides phase blades,
carapaces and the bearer's armor set. Foreign blades receive one spare
weapon and armor each. Bearer HP stays the real 100/100; no monster HP or
damage is lowered, no result is forced, and all turns use the actual engine.
These quantities are prepared ceilings, not acquisition or affordability
evidence. Arena placement is prepared, not a natural travel proof.

Results are identical before/after: advanced Herald armies win all three;
basic Herald armies retreat all three. Seed 42 lacks enough real volunteers
for the Finale gate even with strong relations, so neither Finale loadout
enters. Seeds 7 and 99 enter the real crew fight; the basic bearer dies or
retreats, and the advanced bearer retreats with all twenty/twenty-one allies
still alive. No prepared Finale completion was obtained. The crew is a 9x9
fight, so unchanged outcomes there do not contradict the 12x12 movement fix.

## Phone playtest: a newly confirmed presentation defect

Using the computer-use skill and a fresh localhost origin at 390x844, an
explicit prepared Herald fixture recruited real roster members and started
the actual fight. The normal starter choice was resolved; tapping the
ordinary Wait button advanced the real combat to round two. No browser
warnings/errors were observed. This was not a natural campaign run.

The screenshot and DOM show **nine rows / 81 cells**, despite the active
`titan-fight` class, and only the bearer appears by name. The coalition's
named muster exists in combat but its sprites are absent. In `app.js`, the
grid renderer clamps the intended twelve rows to the nine-row world detail;
its fighter rendering branch only draws monsters/hostiles. This remains
unfixed in this commit. The UI cannot currently demonstrate wide-grid army
movement. See [the captured phone view](campaign-phone-missing-allies.png).

## Next work and validation

1. Repair the combat presentation using the actual fight size, preserving
   nine-cell Table trials; render living allied fighters from battle state.
   Re-play the phone fight and show named allies in the outer cells.
2. Diagnose Finale crew targeting, protection and tactical choices before
   changing enemy numbers. An intact army does not protect a dead bearer.
3. Diagnose the cautious bot's overtime exit and natural food/relationship
   bottlenecks. No run reached the tier-three Network prerequisite.
4. Exercise later campaign nodes, earned crew spoils, real reinforcement and
   Network node ordering through prepared full combat, then natural runs.
   The policy's later-node branches are not end-to-end verified yet.
5. Audit remaining helper geometry (`patternCells` still assumes nine
   cells), allied armor-value interpretation, and partially supplied donor
   forces. Do not represent these as solved by the movement repair.

Tradeoff: broadening coverage is useful only if the bot's failures are kept
separate from player-facing defects. Keep the cautious fallback and report
its incomplete Network exposure; forcing progression or making basic armies
invincible would hide the actual path costs.

Validation: 16 campaign-policy assertions, 9 grid assertions, **113 quick
scripts** and **885 full scripts** pass; ontology validates 111 systems.
Raw natural and prepared reports plus observer hashes are adjacent. No
release bump, push or deployment.
