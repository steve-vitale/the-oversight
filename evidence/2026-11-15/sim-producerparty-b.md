# sim-producerparty-b — Producer re-engagement party lever (PILOT NO-GO)

Loop B run `fleshout-loop-b-20261115T1810Z`, axis winnability chain,
arm sim-producerparty-b. Branch `sim-producerparty-b`.
Prereg (binding): `evidence/2026-11-15/sim-producerparty-b-prereg.md`.
Verdict: **NO-GO (pilot)**. No confirm run. The lever is reverted;
this arm merges instrument + analyzer + evidence only.

## The lever, in plain words

A villager who FLED a hard beast in the wild used to walk away
with nothing — no plan, no target, no hunt. The lever seeds a
win-plan from that wild fight (the same seed the expedition path
already makes), so the existing party-launch chain goes back
after that Producer type together: one game-code change in
`src/js/game.js` `resolveWildMonsterEncounter` — after a
`fieldFight`/`aidFight` vs a wave-4+ monster ending `vFlee`, call
`winPlanSeedFromFight(vid, mdef, 'fled')` (commit `a02156ca`;
wave-gated inside the seed, wave ≥ 3; raids and aid fights
excluded as defence, not a place to return to). Everything after
the seed rides existing machinery: Haven stage advance, the
brain's `party_launch` dawn commit, the shared-target launch to
the plan's node, and the `winPlanFightGate` SEEK when the trick
is known and the party is 3 armed+armored.

## Pilot legs (frozen prereg)

- Control (lever absent): anchor commit `4a8c5d68`,
  `evidence/2026-11-15/perseed-producerparty-b-control/`.
- Armed (lever on): commit `a02156ca`,
  `evidence/2026-11-15/perseed-producerparty-b-on/`.
- 8 seeds **100721–100728**, 150d, death-aware, policy
  `competent-answercourt-b`, identical seeds both legs.
  8/8 seeds each leg, **0 instrument errors** either leg.
- Scout (scoping only, not judged): 100701–100708,
  `perseed-producerparty-b-scout/` (8 seeds, recorder-only).

## Judgment (frozen bars)

| Bar | Control | Armed | Bar | Pass? |
|---|---|---|---|---|
| Kills per unlocked village | 0.50 (1 kill / 2 unlocked) | 0.67 (2 kills / 3 unlocked) | armed ≥ 2× control (≥ 1.00) | **NO** |
| Kill:death | 1.00 (1 / 1) | 1.00 (2 / 2) | armed ≥ 0.92 | yes |
| FACED-NOT-KILLED share (unlocked) | 0.50 (1 / 2) | 0.33 (1 / 3) | armed ≤ 0.20 | **NO** |
| Starvation (pooled) | 0 | 2 | armed ≤ control + 2 | yes (exactly at the bar) |
| Median survival (all seeds) | 150d | 150d | armed ≥ 0.8× control | yes |

**Verdict: NO-GO.** Two of five bars fail, including the primary
(kills per unlocked). The lever moved kills 1 → 2 and unlocks
2 → 3, but not by the 2× the prereg demands, and a third of
unlocked armed villages still face Producers without killing
one.

## Per-seed table — control (lever absent)

| Seed | Class | Unlock | First faced / distinct | W5 kills | Deaths to W5 (scholar) | vet5 unlock / faced / end | rd5ready days | Dominant short | Days / end | Standing |
|---|---|---|---|---|---|---|---|---|---|---|
| 100721 | FACED-NOT-KILLED | d120 | d123 / 1 | 0 | 0 (0) | 2 / 2 / 0 | 2 | armor+veterans+weapons (23d) | 150 survived | 300 |
| 100722 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 150 survived | 199 |
| 100723 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 150 survived | 199 |
| 100724 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 150 survived | 199 |
| 100725 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 0 | 0 | — | 150 survived | 199 |
| 100726 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 147 village-lost | 199 |
| 100727 | KILLED | d88 | d111 / 4 | 1 | 1 (0) | 1 / 1 / 0 | 3 | veterans (47d) | 150 survived | 452 |
| 100728 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 0 | 0 | — | 150 survived | 199 |

Pooled control: unlocked 2/8, kills 1, kills/unlocked 0.50,
kills/faced 0.50, kill:death 1.00, fnkShare 0.50, starvation 0,
median survival 150. Wall: national 7/8, table 0/8, wins 0/8,
wave-4 8/8, wave-5 2/8.

## Per-seed table — armed (lever on)

| Seed | Class | Unlock | First faced / distinct | W5 kills | Deaths to W5 (scholar) | vet5 unlock / faced / end | rd5ready days | Dominant short | Days / end | Standing |
|---|---|---|---|---|---|---|---|---|---|---|
| 100721 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 150 survived | 199 |
| 100722 | FACED-NOT-KILLED | d106 | d138 / 2 | 0 | 0 (0) | 1 / 0 / 0 | 2 | veterans (26d) | 150 survived | 397 |
| 100723 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 150 survived | 199 |
| 100724 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 0 | 0 | — | 136 village-lost | 199 |
| 100725 | KILLED | d79 | d80 / 2 | 1 | 1 (0) | 2 / 1 / 1 | 2 | veterans (11d) | 92 village-lost | 496 |
| 100726 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 1 | 0 | — | 122 village-lost | 199 |
| 100727 | LOCKED | — | — / 0 | 0 | 0 (0) | — / — / 0 | 0 | — | 150 survived | 199 |
| 100728 | KILLED | d122 | d135 / 2 | 1 | 1 (0) | 1 / 1 / 1 | 0 | veterans (30d) | 150 survived | 250 |

Pooled armed: unlocked 3/8, kills 2, kills/unlocked 0.67,
kills/faced 0.67, kill:death 1.00, fnkShare 0.33, starvation 2,
median survival 150. Wall: national 7/8, table 0/8, wins 0/8,
wave-4 8/8, wave-5 3/8.

Note the RNG re-roll: identical seeds diverge once the lever
changes a draw (100721 unlocks in control, locks armed; 100727
kills in control, locks armed; 100725 survives in control, dies
d92 armed). The judge normalizes by unlocked villages, so the
re-roll is carried in the metric, not hidden. Six of eight
armed seeds and five of eight control seeds end at standing
exactly 199 — the readiness hold at t5−1, not a standing
shortfall.

## Veteran attrition

The diag's vet5 bleed is still the shape: control 100721
vet5 2 → 0 by run end, 100727 1 → 0; armed 100722 1 → 0.
Armed 100725 and 100728 are the exceptions — vet5 1 at end
(their wave-5 killers lived). Dominant short after unlock is
**veterans** on every unlocked seed except control 100721
(armor+veterans+weapons). The door opens, the veterans die,
the door re-shorts.

## Mechanism decomposition — the lever fired, the SEEK did not

| Link | Control | Armed |
|---|---|---|
| Wave-5 plan seeds (`w5seeds`, outcome `fled`) | 0 | **2** (100728 d141 + d147, both `cancellation`, stage `party` after) |
| Plans at end (party / hunt / standing) | 24 (4 / 19 / 1) | 51 (26 / 25 / 0) |
| Plans targeting a wave-5 id | 0 | **1** (100728, `cancellation`) |
| Brain win-plan commits (launch / wait) | 56 (32 / 24) | **556 (141 / 415)** |
| Departs, all sources (launch / hold) | 101 (97 / 4) | 164 (136 / 28) |
| Wave-5 gate rows (seek / avoid / null) | 1 (0 / 1 / 0) | 3 (0 / 3 / 0) |
| Wave-5 field fights (vKill / vFlee / vDie) | 6 (0 / 5 / 1) | 9 (1 / 8 / 0) |

The seed works: two wave-5 seeds, both from the exact
situation the lever targets (a villager flees a Cancellation
and the plan now names it). The launch chain works harder:
10× the win-plan dawn commits, 63% more departs. But the
last link never fires: **0 gate SEEKs for wave 5 in either
leg**. All three armed wave-5 gate rows are `avoid:outmatched`
— party of 2, trick unknown, stage `party`. The gate demands
a party of 3 for wave 4+; the launch forms a party of 2
(fighter + one companion — `findCompanion` returns one), and
at the expedition meeting the sensed party is still 2. The
world-tick fights reach party 3 only because
`villagerFightAllies` adds up to 2 allies at the fight itself.
The seeded plan gets the villager TO the Producer's ground
with one companion; the gate still turns them away.

## Encounter decomposition (wave-5 field fights)

- Control: 6 fights, all party of 3, all no-gate (world-tick
  path): 5 vFlee, 1 vDie, 0 vKill.
- Armed: 9 fights, all party of 3, all no-gate: 8 vFlee,
  1 vKill, 0 vDie.
- The armed leg's one field kill is the accumulation story
  the scout found: Rayan vs the same Cancellation six times
  (100728, d135–d149), trick learned on the second meeting,
  kill on the sixth (see sense-testing). The other armed kill
  (100725) and the control kill (100727) came from the
  scholar's turn-based fights, not field fights — see the
  correction below.

## Correction: the scholar DOES fight wave 5 — in turn-based combat

The diag's "scholar never fights wave 5" holds for the WILD
record (field fights) only. The cascade TB sessions show the
scholar fighting Producers in turn-based combat: armed 100725
has TB sessions vs `rerun` (d79, world-monster HP 1200),
`editor` (d90, 1500), `rerun` again (d91, 900 — the same
instance, wounded 1200 → 900 across sessions); control
100727 has six wave-5 TB sessions (editor/timeslot/spoiler).
Neither leg has a wave-5 field-fight kill on those seeds
(100725: 0 wave-5 field fights; 100727: 0 field kills), so
both legs' non-field kills are scholar TB kills. Field-only
kills: **armed 1, control 0**. The frozen metric
(`waveKills['5']`) mixes villager field kills and scholar TB
kills; the metric review below carries that.

## Sense-testing — the fights read like fights

Three wave-5 fights, quoted from the recorder's fight logs
(`w5encounters[].log`), all parties of 3.

**1. The armed kill — Rayan vs The Cancellation, seed 100728,
day 149, 2 rounds, vKill, trick known.** The sixth meeting in
14 days; the trick ("Go off-script") was learned on the
second (d139, "COUNTER LEARNED — The Cancellation").
> "Rayan has Crude bow but no arrows — the string stays drawn, useless."
> "Rayan drove at The Cancellation — it staggers, holds its ground, and keeps coming. (Committed)"
> "R1: Rayan stops mid-fight and binds the wound — field medicine, +20 HP."
> "R1: the stamp descends over Rayan (1/3). Red ink."
> "Rayan's gear absorbs 59."
> "R1: Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)"
> "R1: Pilot Season hits Rayan for 14 (47 left)"
> "The Cancellation is wounded past its line — and holds its ground. It is not leaving. (Committed)"
> "R2: the stamp descends over Rayan (2/3). Red ink."
> "Rayan's gear absorbs 88."
> "R2: Pulled From Schedule hits Rayan for 22 (25 left)"
> "R2: Rayan strikes for 27 (blood trail +2) (0 left)"
> "The lead falls — the pack's coordination shatters. The rest scatter or die."

This reads like a fight: a named fighter, a useless bow, field
medicine mid-fight, the monster's signature (the stamp's three
rounds), gear absorbing blows, and the kill landing on a
wounded beast. The lever's seed fired twice on this exact
beast (d141, d147). Caveat, stated plainly: the HP arithmetic
does not close from the recorder alone — six meetings dealt
301+310+27+83+0+27 = 748, against a 1600–2000 HP band, yet
the final strike landed on a beast at 27 HP. Either the
instance changed between meetings or another wound source
(the Blooded 1.5×, the blood trail) is not in the recorded
damage. The kill is real; the bookkeeping gap is open.

**2. The long fight — Pablo vs finale_crew, control seed
100727, day 143, 10 rounds, vFlee, party of 3.**
> "R1: Pablo strikes for 24 (501 left)"
> "Pablo's gear absorbs 34."
> "R1: Sweeps Week hits Pablo for 11 (89 left)"
> "R2: Pablo strikes for 22 (479 left)"
> "Pablo is losing — shouts for help! Aria charges in!"
> "R3: Aria strikes for 19 (435 left)"
> "R5: Pablo strikes for 26 (361 left)"
> "R5: Aria strikes for 22 (339 left)"
> "R6: Pablo stops mid-fight and binds the wound — field medicine, +20 HP."

Ten rounds, 388 dealt, a shout answered, field medicine —
then the flee at 40% HP. The party fights together and still
walks away from a 700–900 HP crew member. This is the
binding failure in one fight: the damage race is lost
(≈40/round vs 500+ HP left) and the trick was not known.

**3. The one-round death — David vs timeslot, control seed
100727, day 139, vDie, party of 3.**
> "R1: David strikes for 11 (884 left)"
> "R1: RESCHEDULED — THE GREEN ROOM. (The guide showed it coming.)"
> "David's gear absorbs 42."
> "R1: Reschedule hits David for 23 (0 left)"

David entered at 23 HP — hurt from an earlier fight — and
died to a single hit. Fighters keep meeting Producers hurt:
the post-flee rest is a day, the wounds are longer.

Judgment: the fights read like fights — named people, real
signatures, shouted help, field medicine, learned tricks.
What they do not read like is a plan working: nobody walks
in on purpose, nobody is turned away by a gate they
understand, and the one kill is a sixth accidental meeting,
not a hunt.

## §15 balanced panels

`scripts/build-producerparty-panels-20261115.js` (pilot seeds
100721–100728, control → armed): decision **review_required**
— `villageDeaths100Days` regression_watch (delta +4.34, CI
[−2.74, 10.86]) and `communityLost` regression_watch (delta
+0.25, CI [0, 0.625]). Both CIs include 0: not conclusive
regressions, but the armed leg lost 3 villages (d92, d122,
d136) against control's 1 (d147), and starvation ran 2 vs 0.
The lever's cost is real enough to watch and small enough
that the NO-GO does not turn on it.

## Metric review

Pre-registered here: the scout band was scoping, not judged;
the pilot control leg is the judged baseline. The lever's
seed fires (wave-5 seeds 2 vs 0) but kills do not move enough
(0.67 vs 0.50 per unlocked, bar 1.00) — the review names
which link failed: the **gate SEEK**, not the seed and not
the launch. Launches with a wave-5 target exist (the plan
targets `cancellation` on 100728), departs rise 101 → 164,
but the expedition meeting still presents a party of 2 to a
gate that demands 3, with the trick unknown — so the gate
answers `avoid:outmatched` and the fight, when it happens,
still comes through the world-tick path (9/9 no-gate).

Two metric weaknesses, stated for the next arm:

1. **The frozen metric mixes scholar TB kills with villager
   field kills.** Of the 2 armed kills, 1 is a villager field
   kill (the lever's mechanism) and 1 is a scholar TB kill;
   the 1 control kill is a scholar TB kill. Field-only, the
   legs read armed 1, control 0. The next prereg should judge
   field kills separately, or the TB engine's kills will keep
   padding both legs.
2. **Unlocks are thin and band-bound.** Two unlocked control
   villages and three armed make the 2× bar swing on a single
   kill. The confirm band (16 seeds) would tighten this, but
   the pilot NO-GO spends no confirm: the mechanism gap (no
   SEEK) is proven at the pilot scale, not a sample-size
   artifact.

## What is next (named, not built)

The next lever is the **gate/expedition-meeting link**, not
the seed: the launched party must arrive as 3 (launch with
two companions, or count the plan's party in the gate), and
the trick must be known before the meeting (the seed already
points at the species; the expedition must wait for the
trick, as the gate's `trickHolds` branch intends). The seed
stays as built — it is the only link that demonstrably fired
— but it does not merge: a pilot NO-GO is evidence-only, and
the lever commit (`a02156ca`) is reverted in the landing
commit so no trace of the lever remains in game code. The
recorder, analyzer, prereg, and this evidence merge; the
findings-backlog item "WAVE-5 KILLS ARE THE NEXT BINDING
LINK" stays `[claimed]` by this arm, not `[fixed]`.

## Proof

`scripts/test-producerparty-b.js` — 4/4 cases green on the
armed tip (static: lever commit `a02156ca` verified, src
change exactly `src/js/game.js`; judge: 7 fixtures; recorder:
synthetic fixtures; determinism: seed 100701 60d twice,
identical). Re-run green after the lever revert before
landing. Analyzer: `scripts/analyze-producerparty-b.js`
(control vs armed dirs → the judgment table above).
