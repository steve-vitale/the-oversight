# sim-aidgate-b — the aid-gate link lever (Loop B, fleshout-loop-b-20261116T0130Z)

## Verdict: pilot NO-GO — lever REVERTED, instrument + evidence only

The pilot failed the frozen GO bar on its first bar, and the failure was
total, not marginal: the lever changed **zero** fight outcomes across the
band. Per the prereg, a killed arm leaves no trace in game code. The
lever (`winPlanDoorGate` in `src/js/win-plan.js`, the `aidFight` consult
in `src/js/comms.js`, the `trickOpen` threading in
`src/js/fieldFights.js`) has been reverted — `git diff HEAD -- src/` is
empty, and `grep` finds no `winPlanDoorGate` / `AIDGATE` / `trickOpen`
in `src/js/`. What lands is the instrument (the gatereach driver door
wrap + the analyzer's doors/aidGate summaries + `judgeAidgate`) and this
evidence. No default was flipped; nothing about the gate, standing,
readiness, win prices, deed gates, or the table changed — the game code
is byte-identical to the prereg base.

## The lever, in plain words

Both wave-5 field kills on the gatereach band came through aid fights
against lingering raiders at the Haven door, while the expedition path
produced one fight in 95 and zero wave-5 fights — but the gate/SEEK
machinery lived only in the expedition path, never in the door fights.
The lever routed aid fights through the gate's SEEK branch: when a
wave-5 lingerer was at the door, `aidFight` consulted a door version of
the gate (`winPlanDoorGate`, same readiness triple — party of 3, all
armed and armored, trick known — without the expedition plan
requirement and without seeding a plan). On SEEK the fight opened with
the trick; on outmatched the village still fought, narrated as a
defense. The idea was that the trick opener would turn door fights the
village already survives into kills.

## Before / after, identical seeds (band 100821–100828, 150d, policy competent-answercourt-b)

| | Control (flag off) | Lever (AIDGATE=1) |
|---|---|---|
| Seeds / files / parse errors | 8 / 8 / 0 | 8 / 8 / 0 |
| Wave 5 unlocked | 3/8 | 3/8 |
| Wave-5 FIELD kills | 2 | 2 |
| Wave-5 TB kills | 7 | 7 |
| Field kills per unlocked | 0.67 | 0.67 |
| TB kills per unlocked | 2.33 | 2.33 |
| Kill:death (vDie + same-day/same-beast 'villager combat') | 1.00 (2 / 0+2) | 1.00 (2 / 0+2) |
| FACED-NOT-KILLED share | 0.00 | 0.00 |
| Starvation deaths | 3 | 3 |
| Median survival | 150d | 150d |
| National / table / wins | 6 / 0 / 0 | 6 / 0 / 0 |
| Wave 4 / wave 5 reached | 8 / 3 | 8 / 3 |

Every number is identical. The fresh control leg reproduced the
gatereach corpus exactly on every pooled number (unlocked 3, classes
LOCKED 5 / NEVER-FACED 1 / FACED-NOT-KILLED 0 / KILLED 2, field 2,
TB 7, starvation 3, survival 150d, wall 6/0/0), so the zero delta is
the lever's doing, not drift — and the lever leg's per-seed lines match
the control's seed for seed, except seed 100825, which differs only in
the door-consult counts (see below).

## GO bar judgment (frozen, gatereach §11 — `judgeAidgate`, evidence/2026-11-15/aidgate-b-analysis.json)

1. Field kills per unlocked ≥ 1.00: **0.67 — FAIL**
2. TB kills per unlocked ≥ 0.5× control (≥ 1.17): 2.33 — pass
3. Kill:death ≥ 0.92: 1.00 — pass
4. FACED-NOT-KILLED ≤ 0.20: 0.00 — pass
5. Starvation ≤ control + 2 (≤ 5) AND median survival ≥ 0.8× control (≥ 120d): 3 / 150d — pass
- Instrument: 0 errors both legs, 8/8 files, 0 parse errors, classified share 1.00 both legs — pass

**Verdict: NO-GO.** Bar 1 fails; a miss is a NO-GO, never re-scored.

## Why it failed — the mechanism, measured

The lever fired, and fired correctly — it just never had anything to
work with. All 7 door consults happened on seed 100825 (the only seed
with wave-5 aid fights); every consult found a full party of 3, all
armed and armored (armor 6–47). The verdicts:

- **6 of 7 returned null — trick-hold.** The party was ready; the
  trick was unknown. The readiness triple was met every single time;
  trick knowledge was the blocker in 6 of 7 consults.
- **1 of 7 returned SEEK** (day 111, Ivy Wang vs a timeslot, trick
  known). The fight opened with the trick per the flag (`trickOpen`
  true, the door line said) — and ended in a flee, no kill. Its fight
  log is byte-identical to the control leg's: round 1 is an ordinary
  strike, no trick in the log (`trickLog` empty, `openerFired` 0).
  The reason: **timeslot has no round-1 opener branch.** The opener
  covers only five species (congregation, reunion, editor,
  cancellation, audit); timeslot's trick is timing-tied and fires on
  reschedule, never as an opener. So the one SEEK the pilot produced
  hit a species the opener cannot open with — and the SEEK narration
  ("opens with the trick") over-promised: it said the line, and the
  fight opened with a strike.

The two field kills the band did produce (cancellation, day 106 —
a contact finish, Ella closes in with the hatchet for 15; finale_crew,
day 147 — a 9-round fight, Therese with Ingrid joining on the call for
help, field medicine mid-fight) were both consulted and both returned
null (trick unknown). They were won without any trick, exactly as in
the control leg. The lever's premise — that SEEK would open the killing
fights with the trick — never engaged on a fight that kills.

The binding constraint is **trick knowledge at the door**, not gate
routing. Villagers learn counters by surviving fights (the timeslot
counter was learned on day 108, two days after the first timeslot
fight), so the door fights that need the trick are the same fights
that would teach it — a cold-start loop the gate routing cannot break.
A future lever would have to move trick knowledge (teaching, scouting,
or the deferred lingerer-hunt plan that returns to remembered fights),
not the consult. The one SEEK also shows a narrower defect worth
fixing if the line is ever reused: the door line should only claim a
trick opening for species that have an opener.

## The fights, in their own words (sense test)

Three wave-5 door fights from seed 100825, lever leg (logs identical
to control — the lever changed no line of any fight):

**The one SEEK (day 111, Ivy vs timeslot — the line over-promises):**
> "Ivy holds the door and opens with the trick — the village knows where it bleeds."
> "R1: RESCHEDULED — THE GREEN ROOM. (The guide showed it coming.)"
> "R1: Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)"
> "R1: Lead-In hits Ivy for 9 (80 left)" / "R1: Ivy strikes for 36 (511 left)"
> "R4: RESCHEDULED — LIVE STUDIO." / "Ivy is past holding — they run while running still works."

The line says the trick opens the fight; the fight opens with a plain
strike and ends in a flee. The narration and the fight disagree — the
line is a lie for this species.

**A kill (day 106, Ella vs cancellation — contact finish):**
> "Ella does not let it slip away — they close in and strike with the hatchet for 15 — Big Ugly falls. (Contact finish)"

**A kill (day 147, Therese vs finale_crew — nine rounds, help called, wound bound):**
> "R1: Therese strikes for 23 (283 left)" / "R1: Ad Break hits Therese for 8 (77 left)"
> "Therese is losing — shouts for help! Ingrid charges in!"
> "R5: Therese stops mid-fight and binds the wound — field medicine, +20 HP."

**A near-miss (day 104, Ella vs cancellation — flees at 11 HP):**
> "R1: Ella walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)"
> "R1: the stamp descends over Ella (1/3). Red ink."
> "Ella is losing — shouts for help! Zoltan charges in!"
> "Ella sees how this ends — and runs while running still works."

Judgment: the fights read like fights — failed parleys, calls for
help, gear absorbing blows, wounds bound mid-fight, flights at low
health. The door fights were already narrated and already winnable
without the lever; the lever added one spoken line that the fight did
not honor.

## Wall numbers (both legs identical)

National 6/8, table 0/8, wins 0/8, wave 4 reached 8/8, wave 5
reached 3/8, median survival 150d. Per-seed control: 100821 survived
150d (wave 4, regional); 100822 village-lost 137d (wave 4, regional);
100823 survived 150d (wave 5, national, 2 TB kills); 100824 survived
150d (wave 5, national, 0 wave-5 kills despite 32 field encounters);
100825 survived 150d (wave 5, national, 7 wave-5 kills: 2 field +
5 TB); 100826 survived 150d (wave 4, national); 100827 survived 150d
(wave 4, national); 100828 survived 150d (wave 4, national). The
lever leg matches seed for seed.

## Balanced panel compare (§15)

`scripts/build-aidgate-panels-20261115.js` (pseudo-policy `aidgate-b`,
paired seeds, same tip): decision **review_required**, no metric with
a material signal — every contract metric is descriptive /
no-material-signal / not-observed / insufficient, consistent with the
bit-identical legs. Attached: `evidence/2026-11-15/aidgate-b-panel.md`
(+ `.json`, `-before.json.gz`, `-after.json.gz`).

## Proof (before the revert; the lever was proven in isolation)

`scripts/test-aidgate-b.js`, 6 cases, all green before any judged
corpus: static (lever wiring, frozen wave-5 ids, win-plan.js diff
purely additive), door (SEEK / trick-hold null / outmatched avoid /
wave-4 null / no plan seeded, no stage changed, no counter bumped),
seek (cancellation opens `offscript`, editor opens `continuity`,
flag-off opens with a strike, outmatched still fights as defense,
wave-4 never consulted), judge (11 fixtures: GO shape, one NO-GO per
bar, boundary GO, null kill:death, instrument-fail), recorder
(synthetic corpora: door rows, aid split, opener firings,
vcDeathsW5 = 2, killDeathAidgate = 1.00), determinism (seed 100825,
150d, AIDGATE=1, two runs identical, 7 door rows, 1 consulted aid
fight). The lever worked exactly as designed; the design was aimed at
the wrong bottleneck. After the revert the test was rewritten as the
post-revert instrument proof (4 cases, all green): static (lever gone
from game code, instrument kept), judge, recorder, determinism
(reverted game = control: 0 door rows, 7 wave-5 aid fights all
not-consulted, identical runs).

Two staging facts the proof turned up, kept here for the next arm
that stages fights: `village.health` is created lazily (a fighter
defaults to 100 HP — stage the map before staging HP, or the first
fight runs on a corpse), and `villagerGearUp` re-derives equipped
slots from carried items at fight entry, so staged gear must be
carried in `person.items`, not just placed in `equipped` — a staged
slot with no matching carried item is dropped mid-test.

## Metric review

- **The GO bar did its job.** Bar 1 (field kills per unlocked ≥ 1.00)
  is the only bar that demands the lever actually move the winnability
  chain, and it caught a zero-effect lever cleanly. The other bars
  passed trivially because nothing changed — they are cost guards, not
  effect measures, and on a zero-delta pilot they say nothing.
- **The instrument is the durable win.** The driver now records door
  consults (verdict, reason, party, gear, trick-known) and door say
  lines, and the analyzer judges the frozen bar plus the aid split and
  opener firings. It caught the exact mechanism (6/7 trick-hold, 1
  SEEK on a no-opener species) that the pooled numbers alone could not
  have shown. It stays, and the wrap now treats the method's absence
  as the expected state (no error) since the lever is gone.
- **The gatereach §7 correction held.** The 'villager combat' death
  term (`vcDeathsW5`) equals the field-kill count on both legs (2/2),
  so kill:death is 1.00 on both — the bar as written is satisfiable
  and was satisfied; it was not the binding bar.
- **What the pilot could not see.** Eight seeds, one band: the lever
  engaged on exactly one seed and one SEEK. A wider band would not
  have changed the verdict shape — the mechanism (trick unknown at the
  door) is visible in the consult rows themselves, not in the noise —
  but the confirm (16 seeds) is moot: there is nothing to confirm.
- **Next lever, if any:** trick knowledge at the door — teaching,
  scouting, or the deferred lingerer-hunt plan — not another consult
  route. And if the door line is ever reused, gate it on species with
  an opener, so it never again claims a trick the fight cannot open
  with.

## Files

- Prereg: `evidence/2026-11-15/sim-aidgate-b-prereg.md` (commit ee45b3b40)
- This evidence: `evidence/2026-11-15/sim-aidgate-b.md`
- Analysis: `evidence/2026-11-15/aidgate-b-analysis.json` (control + lever + aidgate judgment)
- Corpora: `evidence/2026-11-15/perseed-aidgate-b-control/` (8 files), `evidence/2026-11-15/perseed-aidgate-b-on/` (8 files)
- Panel: `evidence/2026-11-15/aidgate-b-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Instrument: `scripts/gatereach-driver-20261115.js` (door wrap), `scripts/analyze-gatereach-b.js` (doors/aidGate summaries, `judgeAidgate`, 2-arg CLI)
- Panel builder: `scripts/build-aidgate-panels-20261115.js`
- Proof: `scripts/test-aidgate-b.js` (post-revert instrument proof, 4/4 green)
- Game code: unchanged from base master 126382932 (`git diff HEAD -- src/` empty)

## Loop A overlap (for the coordinator)

None live. The vetparty lever's file set included `src/js/win-plan.js`,
but it was reverted on its branch and `git diff master sim-vetparty-a
-- src/js/` is empty; this arm's game-code changes were reverted in
full, so there is nothing to sequence against. The instrument files
(driver, analyzer, panel builder, test) are aidgate-specific and do not
touch vetparty's files.
