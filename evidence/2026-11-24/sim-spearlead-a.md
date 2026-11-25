# sim-spearlead-a — EVIDENCE (DIAG-NO-GO, kind LEAD-FOUND)

**Arm:** sim-spearlead-a · **Loop A run:** fleshout-20261125T0215Z (completion of the
stranded DIAG arm from the timed-out 2315Z run) · **Branch:** `sim-spearlead-a`
**Prereg:** `evidence/2026-11-24/sim-spearlead-a-prereg.md` (frozen 2026-11-25 ~01:00 UTC,
before any judged sim; committed 923190300) · **Type:** DIAG (instruments + evidence
only — no game-code fix lands, no volley branch built)
**Base at pilot:** 99294b326 (worktree HEAD; prereg 923190300 + instruments 8c3575e50 +
TDZ fix 99294b326). **Corpus:** `evidence/2026-11-24/perseed-spearlead-a-arm/`
(8 per-seed JSONs, commit 5c9de5bf6). **Analysis:** `evidence/2026-11-24/spearlead-a-analysis.json`.

## §0. Verdict — DIAG-NO-GO, kind LEAD-FOUND

The spearopen zero does **not** replicate. Five spear departures led an expedition
wave-4 fight with a spear in the ranged slot at entry — on a complete ledger
(63/63 departures in buckets 1–8, 0 unattributed, 0 instrument errors, ledger
reconciles with the game-maintained `spearSeen` counter on all 8 seeds).

| Frozen bar (§2) | Bar | Measured | Pass? |
|---|---|---|---|
| Pool floor (spear departures) | ≥ 10 | 63 | ✅ |
| Classification completeness (buckets 1–8 / all) | ≥ 0.90 | 1.000 (63/63) | ✅ |
| Zero-lead reconciliation (lead-w4-with-spear == 0 AND buckets sum to departures) | 0 / 63 = 63 | **5** / 63 = 63 | ❌ |
| Instrument errors | 0 | 0 | ✅ |

**The question, answered with a complete ledger:** the 42-analog gate-passed spear
departures go, overwhelmingly, on autonomous expeditions that never draw a wave-4
monster (45 of 63) — but the spearopen zero was a band artifact, not a law. On
this band spear carriers DO lead wave-4 expedition fights: 5 departures, 6 lead
meetings, 3 of them real fights (all fled, none killed). The dominant bucket is
still `autonomous-no-w4` (45/63, 71%), so the prereg's expectation was half right:
the departures are mostly autonomous no-draws — but the conversion half of the
expectation is dead (see §4) and the zero-lead half is overturned.

**Finding #2544 (fight capability: damage output — the spear-lead half): STAYS OPEN.**
On DIAG-NO-GO the finding stays open with the failing bar + mechanism diagnosis
named: the failing bar is zero-lead reconciliation (5 leads, not 0); the mechanism
is that spear departures are autonomous expeditions whose monster draw is a random
pull from the standing-gated pool (`expeditionMonster` picks `m = pick(pool)` — the
plan target sets the tile, not the monster), so once wave 4 is unlocked a spear
expedition CAN draw a wave-4 monster on any trip, and on this band it did, 6 times
in 63 departures. The next arm is named in §8.

**Single leg, no §15 panel:** this is a single-leg diagnostic — there is no
before/after pair to compare, so no balanced panel was fabricated. The frozen
bars (§2) are the judge. **No canon doc covers spears as thrown weapons** — said
here, as the prereg records, rather than inventing canon. A spear is a human
weapon (CANON.md human-skills lane), never an alien ability.

## §1. The ledger, bucket by bucket (63 spear departures)

| Bucket | n | Share | What it means |
|---|---|---|---|
| 1. lead-w4-with-spear | **5** | 7.9% | Led an expedition wave-4+ fight, spear at entry. THE FALSIFIER. |
| 2. companion-w4 | 4 | 6.3% | Met wave 4 as a spear-carrying companion, never lead. |
| 3. gate-avoid-w4 | 4 | 6.3% | Gate said avoid; no wave-4 expedition fight followed. |
| 4. converted-at-staging | **0** | 0% | Departed as a ranged carrier. NONE. |
| 5. died-away | 4 | 6.3% | Died while away before any wave-4 meeting. |
| 6. plan-never-reached | 0 | 0% | No departure carried a wave-4 plan at all. |
| 7. autonomous-no-w4 | 45 | 71.4% | No wave-4 plan, met no wave-4 monster. THE DOMINANT BUCKET. |
| 8. still-away-at-end | 1 | 1.6% | Still away at run end, no meeting yet. |
| 9. unattributed | 0 | 0% | The residual is empty — the ledger is closed. |

No bucket holds ≥ 0.50 except `autonomous-no-w4` (71%) — the mechanism is named by
that bucket alone. 13 of 63 departures (20.6%) met wave 4 somehow (5 lead + 4
companion + 4 avoid); 50 did not.

### Per-seed bucket tables

| Seed | Days / end | Dep | 1 lead | 2 comp | 3 avoid | 4 conv | 5 died | 6 plan | 7 auton | 8 away | 9 unatt | spearSeen | Recon |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 110711 | 150 survived | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ✅ |
| 110712 | 150 survived | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 5 | ✅ |
| 110713 | 106 village-lost | 17 | 2 | 3 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 17 | ✅ |
| 110714 | 150 survived | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 2 | ✅ |
| 110715 | 84 village-lost | 12 | 1 | 0 | 1 | 0 | 1 | 0 | 9 | 0 | 0 | 12 | ✅ |
| 110716 | 94 village-lost | 12 | 0 | 1 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 12 | ✅ |
| 110717 | 84 village-lost | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | ✅ |
| 110718 | 111 village-lost | 14 | 2 | 0 | 1 | 0 | 1 | 0 | 10 | 0 | 0 | 14 | ✅ |
| **Pooled** | median 108.5d | **63** | **5** | **4** | **4** | **0** | **4** | **0** | **45** | **1** | **0** | **63** | ✅ 8/8 |

Ledger-vs-`spearSeen` reconciliation per seed (prereg §2 staging-sniff gate): the
ledger's spear-row count equals the game-maintained `spearSeen` counter on every
seed, and the per-call `spearSeenBump` sum equals it too (63 = 63 pooled). Seed
110711 carries no spear departure at all (0 = 0) — the population is real on this
band as a whole (63 departures), thin on that seed alone.

### The five lead departures (the falsifier, in full)

| Seed | Depart day | Villager | Spear | Plan (stage / target / needWave) | Wave-4 meetings as lead | Close-out |
|---|---|---|---|---|---|---|
| 110713 | 85 | gen_xhab75y (Brendan) | hunting_spear | party / chorus_line / 3 | d86 Influencer — **evade**, 0 rounds | superseded |
| 110713 | 88 | nina_petrova (Nina) | hunting_spear | party / spool / 3 | d90 Eulogy — **evade**; d91 Reunion — **vFlee, 3 rounds** | returned |
| 110715 | 53 | catalina_reyes (Catalina) | hunting_spear | hunt / — / — | d54 Audit — **vFlee, 5 rounds** | superseded |
| 110718 | 49 | gen_2ngls8q (Rebecca) | fire_hardened_spear | hunt / — / — | d50 Algorithm — **vFlee, 2 rounds** | returned |
| 110718 | 56 | gen_2ngls8q (Rebecca) | fire_hardened_spear | party / — / — | d57 Suburb — **evade**, 0 rounds | returned |

None of the five carried a wave-4 plan (needWave 3 or null) — all five were
autonomous expeditions that happened to draw a wave-4 monster from the pool.
All five staged `noSource` (the gate passed them on, the sources yielded nothing,
the spear stayed in hand). **Evade nuance (read §7):** 2 of the 5 lead departures
only ever evaded (0-round meetings). Counting only fights that actually fought
(rounds > 0), the lead count is **3, still > 0** — the LEAD-FOUND verdict survives
the strictest reading of "lead a fight." No lead fight ended in a kill (3 vFlee,
3 evade, 0 vKill).

Two of the five leads died on a later spear departure: Catalina departed again
day 59 and died away; Rebecca departed again day 58 and died away (both in the
`died-away` bucket on their later trips). One villager, Brendan (seed 110713),
accounts for 6 of the 13 wave-4 meetings on the band (1 lead + 3 companion +
2 avoid) across six spear departures — the spear carriers who keep going out are
the ones who keep meeting wave 4.

## §2. Cross-tabs (secondary, not binding)

**Converted × later wave-4 lead (any weapon):** converted 0, converted-lead 0 —
the cross-tab is empty because the conversion never happens (see §4). No spear
departure ever departed as a bow carrier, so there is no converted population to
follow into wave-4 fights.

**PlanW4 × any wave-4 meeting:** planW4 departures 0, planW4-met 0; no-plan
departures 63, no-plan-met 13 (20.6%). Every wave-4 meeting on this band came
from a plan-less autonomous departure — the plan never aimed anyone at wave 4,
because no departure carried a wave-4 plan in the first place.

**Staging source × converted:**

| Source | Spear departures | Converted |
|---|---|---|
| noSource | 61 | 0 |
| craftedFail | 2 | 0 |
| alreadyHad (with a bow) | 0 | 0 |
| fromStash | 0 | 0 |
| fromArmory | 0 | 0 |
| crafted | 0 | 0 |

Pooled staging counters (all 367 staging calls, spear + bow carriers): alreadyHad
134, fromStash 0, fromArmory 0, crafted 1, craftedFail 4, noSource 228,
spearSeen 63, spearPassed 63 (ratio 1.000 — the gate replication holds).

**Expedition fights while away** (lead fights assigned to a spear departure, by
wave): w1 79, w2 42, w3 25, w4 6 — 152 fights. The six w4 rows are the five
departures' meetings above (Nina led twice). What spear departures actually meet
out there is overwhelmingly wave 1–2 (121/152, 80%).

## §3. Wall numbers (scale-onramp axis)

| Metric | This band (8 seeds) |
|---|---|
| National reached | 0 / 8 |
| Table | null (not instrumented by this driver — never faked) |
| Wins | 0 / 8 |
| Wave-4 unlocked | 8 / 8 |
| Wave-5 unlocked | 2 / 8 (seeds 110712, 110714) |
| Median survival | 108.5 days (150, 150, 106, 150, 84, 94, 84, 111) |
| Community lost | 5 / 8 |
| Scale ranks at end | regional 7, village 1 |
| Deaths | 734 total — monster 641 (87.4%), villager 87 (11.9%), person 6 (0.8%); starvation 5 |
| Wave-4+ encounters | 146 total, 37 expedition-origin (spearopen band: 133 total, 10 expedition-origin — same substrate, different band; the expedition share is much richer here) |

The scale wall stands: waves 4–5 unlock, villages still reach neither national nor
the table, and no seed wins. Standing at end ranged 140–600 (seed 110712 reached
600 — past the wave-5 bar — and still ended regional with no win).

## §4. The conversion that never happens (mechanism diagnosis)

The prereg's desk expectation was that most spear departures would "either [be]
converted at staging (a source yielded a bow) or [be] on autonomous expeditions
that never draw a wave-4 monster." The second half holds (45/63). The first half
is dead: **0 of 63 spear departures converted at staging.** The gate passes every
spear carrier on to the sources (spearPassed 63/63, ratio 1.000), and the sources
yield nothing — no stash bow, no armory bow, no successful craft, no pack-carried
bow (alreadyHad 0 among spear rows). The two non-noSource spear rows are
`craftedFail` (the one craft attempt failed). The village simply has no bows to
give a spear carrier: the pooled armory/stash sources served 0 of 367 staging
calls on this band. So the spear carrier departs with the spear in hand, every
time — and the question "where do they go" is answered by the draw, not by the
staging: mostly nowhere near wave 4 (45 autonomous no-draws), sometimes straight
into it (5 leads, 4 companions, 4 avoids).

## §5. Sense-testing — three spear departures meet wave 4 (read in full)

SENSE-TESTING LAW: judge meaning, not counts. All three fights below are
expedition-origin, led by a spear carrier with a spear at entry, in a 3-person
party (partySize 3, allArmed + allArmored true). The departures were staged by
the competent policy: geared villagers with parties, never fresh un-geared solo
scholars — the fighters absorb 30–61 damage a hit through gear and carry real
abilities (Rage, Tripwire, field medicine).

### (a) Nina vs The Reunion — seed 110713, day 91 (3 rounds, fled)

Nina departed day 88 with a hunting spear (`noSource` — the gate passed her on,
nothing to stage). Day 91 her expedition walks into The Reunion.

> Nina walks straight into The Reunion. No avoiding it.
> R1: Nina's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> Nina's gear absorbs 61.
> R1: Your Move hits Nina for 16 (34 left)
> R2: Nina strikes for 50 (x2.0) (1332 left)
> Nina's gear absorbs 50.
> R2: Your Move hits Nina for 13 (21 left)
> Nina is losing — shouts for help! Brendan charges in!
> R3: Nina strikes for 46 (x2.0) (1286 left)
> R3: Brendan strikes for 40 (1246 left)
> Nina's gear absorbs 48.
> R3: Your Move hits Nina for 13 (8 left)
> Nina is still losing — shouts again! Diego charges in!
> Brendan answered Nina's shout, but Nina is past holding — they run while running still works.

Reads sensibly: a spear carrier leads her party into a wave-4 monster, lands two
real spear strikes (50 and 46 — the spear is visibly her weapon; there is no
volley and no "no arrows" line, because a spear never volleys), her allies answer
her shouts, and she flees at 8 HP with the monster still at 1246 HP. The fight
is desperate and traumatic, as wave 4 should be — and hopeless as staged: three
rounds of a 1,300-HP monster at ~45 damage a round. (Nina's day-90 Eulogy meeting
on the same trip was an evade — she saw it in time and gave it room.)

### (b) Catalina vs The Audit — seed 110715, day 54 (5 rounds, fled)

Catalina departed day 53 with a hunting spear (`noSource`). Day 54 her expedition
walks into The Audit.

> Catalina walks straight into The Audit. No avoiding it.
> R1: Catalina's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> Catalina's gear absorbs 44.
> R1: Field Audit hits Catalina for 16 (60 left)
> R2: Catalina strikes for 55 (x2.5) (1147 left)
> Catalina's gear absorbs 33.
> R2: Field Audit hits Catalina for 12 (48 left)
> Catalina is losing — shouts for help! Carlos charges in!
> R3: Catalina strikes for 63 (x2.5) (1084 left)
> R3: Carlos strikes for 26 (x1.3) (1058 left)
> Catalina's gear absorbs 53.
> R3: Assessment hits Catalina for 19 (29 left)
> Catalina is still losing — shouts again! Piper charges in!
> R4: Catalina strikes for 33 (audited — half strength) (x2.5) (1025 left)
> R4: Carlos strikes for 26 (x1.3) (999 left)
> R4: Piper strikes for 20 (979 left)
> Piper's gear absorbs 20.
> R4: Assessment hits Piper for 39 (61 left)
> R5: Catalina strikes for 14 (audited — half strength) (x1.3) (965 left)
> R5: Carlos strikes for 24 (x1.3) (941 left)

Reads sensibly: five rounds, the Audit's signature (audited — half strength) bites
from round 4, both allies join, the party deals ~260 damage to a ~1,200-HP monster
and flees. Catalina's spear strikes are the party's biggest hits (55, 63) — the
spear is doing real work as a melee weapon; it simply never opens at range, and
the monster's HP pool makes the outcome a foregone flee. (Catalina departed again
day 59 with the same spear and died away — the `died-away` bucket.)

### (c) Rebecca vs The Algorithm — seed 110718, day 50 (2 rounds, fled)

Rebecca departed day 49 with a fire-hardened spear (`noSource`). Day 50 her
expedition walks into The Algorithm.

> Rebecca walks straight into The Algorithm. No avoiding it.
> Rebecca had strung a wire at ankle height before it closed — the first rush will eat dirt. (Tripwire)
> R1: The Algorithm hesitates — Rebecca bought a breath.
> R1: Rebecca's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> R1: Rebecca stops mid-fight and binds the wound — field medicine, +20 HP.
> Rebecca's gear absorbs 30.
> R2: Engagement hits Rebecca for 27 (6 left)
> R2: Rebecca strikes for 34 (x2.0) (1037 left)
> Rebecca is losing — shouts for help! Palesa charges in!
> Palesa answered Rebecca's shout, but Rebecca is past holding — they run while running still works.

Reads sensibly: the most human of the three — a tripwire, a rage, a mid-fight
bandage, then a 27-damage hit leaves her at 6 HP and she runs. Two rounds, 34
damage to a 1,000+ HP monster. The spear carrier is not a joke — she fights
smart and survives — but wave 4 as staged is a wall she cannot climb alone with
a spear.

**Judgment:** all three transcripts read as coherent stories of a spear carrier
walking out, meeting a wave-4 monster by the random draw, fighting it with the
spear as a melee weapon (no volley, no dry-ammo line — the spearopen silence,
intact), and fleeing. Nothing robotic, nothing repeated verbatim. The evade
transcript (Brendan vs The Influencer, day 86: "Brendan saw The Influencer in
time and gave it room.") is a single honest line — a meeting, not a fight, and
the ledger counts it as a lead meeting, which §7 takes up.

## §6. Instrument notes (what the corpus proved about the instruments)

- **The five additions work live** (proof test 46/46 before the pilot; analyzer
  selftest 28/28): staging rows carry pre/post-staging ids; `noSource` leaves
  the spear in hand; a staged bow converts (proven in the fixture via the
  armory); depart rows carry holder kit; lower-wave expedition fights land in
  `expFights`; the analyzer classifies fixture departures into all nine buckets.
- **The spearTrack lifecycle works live:** supersede closes fire on re-depart
  (Catalina's day-51 departure was superseded by her day-53 departure; Brendan's
  day-85 departure by his day-88 one); `died` closes fire (Marcus Webb's day-29
  departure closed `died` day 30); `still-away-at-end` fires once (seed 110717).
- **Window-miss diagnosis (11 lead / 11 companion, after the double-count fix):**
  every lead miss is Marcus Webb on seed 110712, days 15–23 — eleven expedition
  fights he led with NO ranged weapon (`rangedId` null), all BEFORE his first
  spear departure (day 25, shard_spear). They belong to earlier unarmed departures,
  not to any spear departure, so the non-assignment is correct. Every companion
  miss is a spear-carrying ally joining a fight before their first spear departure
  (Nina day 7, Brendan day 12, Catalina days 49–50 — all pre-date their first spear
  staging). A villager can carry a spear from gear-up and join a fight without ever
  having staged — the ledger correctly refuses to attribute those meetings to a
  departure that had not happened yet. No window miss is a tracking gap.
- **Analyzer fix, committed mid-run (4e12466fc):** the companion window-miss
  counter double-counted each (fight, spear-ally) pair (the ally sits in both
  `allyVids` and `allySpearVids`) — 15 reported vs 11 real. The fix counts each
  pair once; the verdict and all bucket counts are unchanged (the counter is
  diagnostic only — bucket assignment uses the maps, not the counter). Selftest
  grew 27 → 28 with a regression check for the fix.
- **Driver fix, committed pre-pilot (99294b326):** the first pilot start crashed
  in 16s on a TDZ error (`spearL` referenced `dawnbidDeparts` before its `const`
  declaration). Fixed by moving the declaration; both suites re-run green before
  the re-launch. No judged sim ran before the fix.
- **Safe-commit clobber, twice:** after the analysis commit (808c06678) and the
  per-seed commit (5c9de5bf6) the main index showed the committed files as
  staged-deleted (6 files, then 8 files). Both commits are correct on disk;
  the index was repaired from HEAD blobs (`git ls-tree HEAD -- <paths> | git
  update-index --add --index-info`) and verified (`git status` clean, `git diff
  HEAD` empty, index counts 112832 then 112840). Also: safe-commit.sh does NOT
  accept a directory path — the first corpus commit silently dropped the
  per-seed directory (error `option 'cacheinfo' expects <mode>,<sha1>,<path>`);
  the per-seed files were committed separately with an expanded file list
  (5c9de5bf6, 8 files, 879,532 insertions).
- **Seed-band freshness, re-verified by this arm:** ripgrep over all
  `evidence/*/sim-*-prereg.md` names 110711–110718 only in this arm's own prereg;
  no other November 2026 evidence .md names them. The only other hits anywhere
  are pantry kcal values (`pantryFreshAfter: 110711`) inside two 2026-10-16
  census JSONs — the timestamp/pantry-number false-positive class the prereg
  already records. Neighbouring used bands avoided: 110501–110508 (aidammo),
  110601–110608 (spearopen), 109501–109508 (basedmg-b).
- **Write flap:** probes (`git update-ref refs/heads/probe HEAD`) passed before
  every material write in this arm (instruments, fixes, corpus, this file).
  No flap window was hit during this run.

## §7. Metric review (frozen bars judge as written — no re-scoring)

- **Bucket 1 counts evade meetings as leads.** The frozen definition says "the
  lead (row vid) of an expedition-origin wave-4+ fight" — an evade row IS a
  fieldFight row with the vid as lead, so evades count. 2 of the 5 lead
  departures only ever evaded. The verdict does not turn on this: counting only
  fights that actually fought (rounds > 0), the lead count is 3, still > 0, so
  LEAD-FOUND stands under either reading. **Proposed revision for the NEXT run:**
  split bucket 1 into `lead-w4-with-spear` (any meeting) and a `lead-w4-fought`
  count (rounds > 0) as a secondary metric, so the evade share is visible
  without redefining the frozen bucket.
- **The conversion cross-tab is degenerate.** With converted = 0, "converted ×
  later wave-4 lead" has no population. That is itself the finding (the sources
  are empty), not a metric failure — but a future arm that wants to study
  conversion needs a band or a lever where bows actually exist to stage (see §8).
- **The pool is lumpy.** Seed 110711 contributed 0 departures; seeds 110713 +
  110718 contributed 31 of 63. The floor (≥ 10) cleared comfortably, but a
  confirm band would want the same lumpiness noted: per-seed departure counts
  range 0–17.
- **No metric change is proposed for the frozen bars.** The bars judged as
  written; the verdict is LEAD-FOUND. The two revisions above (evade split,
  conversion-population precondition) are for the next arm's prereg, not this
  run's verdict.

## §8. Next arm (named from the proof)

1. **Spear-fight diagnostic (the open half of finding #2544).** Spear carriers DO
   lead wave-4 fights — and lose them all: 3 real fights, 0 kills, all fled at
   single-digit HP, ~35–65 damage a round against 850–1500 HP monsters. The next
   arm measures the spear as a melee weapon against wave 4 properly: damage per
   round by spear tier, survival by party size, whether any spear-led party ever
   kills — the fight-capability question, not the lead question. (This arm
   answered the lead question; the damage question is what remains.)
2. **The thrown-weapon opening stays Steve's design call.** A spear still has no
   opening volley (proven again: `rec.volley === null`, silent, in the proof
   test) and no canon doc covers spears as thrown weapons. Whether a spear
   should open at range is a design ruling for Steve, not a silent code tweak —
   this arm builds no volley branch and lands no game-code fix, as preregistered.
3. **The empty sources (ammosupply territory).** The staging sources served 0 of
   367 staging calls with a bow on this band (fromStash 0, fromArmory 0, crafted
   1 success in 5 attempts). If a future arm wants to study conversion, it first
   needs bows to exist — that is a supply question, not a gate question.

## §9. Village assessment (plain words)

Eight villages, 150 days each (death-aware). Three survived the full 150 days;
five were lost between days 84 and 111, all to monsters (87% of the 734 deaths
were monster kills). Every village unlocked wave 4; two reached wave 5; none
reached national, none sat at the table, none won. The villages that survived
did so regionally, at standings up to 600 — strong enough to be noticed by the
System, not strong enough to climb.

The spear carriers in these villages are the restless ones: they walk out alone
on autonomous trips with a spear and no bow (the village has none to give), meet
whatever the draw gives them — mostly wave-1 and wave-2 animals (121 of their 152
expedition fights), sometimes a wave-4 horror — fight it with the spear as a
club-and-point weapon, and run. Brendan on seed 110713 went out six times with a
spear and met wave 4 six times; Catalina and Rebecca each led a real wave-4 fight
and died on a later trip out. The blank this run filled is the ledger itself: we
now know, departure by departure, where the gate-passed spear carriers go — and
the answer overturns the previous band's zero. The blank that remains is what a
spear is worth when it actually connects (§8.1), and whether it should ever fly
(§8.2, Steve's call).
