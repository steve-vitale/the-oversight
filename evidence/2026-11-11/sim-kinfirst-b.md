# Kin / naming / childbirth / keepsakes — first numbers (arm sim-kinfirst-b)

Run fleshout-loop-b-20261111T1131Z, Loop B. Adoption of the timed-out
1131Z run (this arm's work on branch sim-kinfirst-b). Coverage Program
Tier 2 (Steve order 2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-11/sim-kinfirst-b-prereg.md (committed BEFORE any judged
sim). Base commit b09cf584e. Band 190341–190348, 8 seeds, competent policy
verbatim, 150d death-aware horizon, control + neutral legs on identical
seeds. Zero src/js. Instrument + proof: scripts/kinfirst-instrument-20261111.js,
scripts/kinfirst-driver-20261111.js, scripts/kinfirst-analyze-20261111.js,
scripts/test-kinfirst-b.js (58/58). Summary:
evidence/2026-11-11/kinfirst-summary-kinfirst-pilot.json. Per-seed corpus:
evidence/2026-11-11/perseed-kinfirst-b/ (16 files: control + neutral per seed).

Canon: docs/CANON.md read first; docs/KIN.md covers the Taking (half of
adults taken day zero, stasis kids, no confirmation dead or alive).
Keepsakes are designed in docs/COHERENCE-SPINE.md §"Keepsakes: the growth
model" (Steve 2026-10-14). Naming rite and childbirth have NO canon doc
— the code is the source of truth (naming-rite.js; game.js simVillageDay
birth block, day ≥270 gate, 0.5%/day). Nothing is invented here.

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every kin event classified by kind + outcome, none 'other' | PASS — 0 unclassified kin events across the pilot; 0 unclassifiedCount on all 8 seeds (birth, naming, keepsake-grow, keepsake-power, thread-clue, mantle, death_in_family each with a known kind and outcome) |
| Every wrapped method's call path verified live or marked dead | PASS — 24 wraps live in the pilot (see instrument list in the prereg); nameBaby / bestowUseName proven live in a fixture and dead under competent (0 calls — the zero IS the finding, per prereg); equipAccessory 0 calls under competent (competent never equips) |
| Neutrality: OFF leg matches instrumented leg on days + end pantry kcal + deaths | PASS — 8/8 exact (days, end pantry kcal, and the full death-event list match on every seed) |
| Instrument errors 0 | PASS — 0 on all seeds, control leg |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–10 below; sense-test scenes quoted (corpus covers the 200-line Game.say cap per seed, same early-game-only caveat as the siblings) |
| Engagement floor (≥5 keepsakeGrow events band-wide) | PASS — 2,118 keepsakeGrow calls band-wide (1,679 grew, 439 dormant) |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: keepsakes grow every day and die with every mantle; births and naming never happen

In 1,043 village-days across 8 seeds, the kin systems live almost
entirely inside the keepsake. Keepsakes grow constantly — 2,118
keepsakeGrow calls, 1,679 of them real growth, 80 level beats (32 to L1,
28 to L2, 20 to L3) — and then the growth is thrown away: every mantle
buries the dead bearer's keepsakes (334 buried across the pilot) and the
successor starts over with their own keepsakes at bond 0. All 16
keepsakes held at the end of the three surviving villages sit at bond 0,
level 0. The keepsake is a per-life engine, never an inheritance.

Births are a structural zero, exactly as the code predicts: 0 births on
all 8 seeds at the 150d horizon (the birth gate opens at day 270, and no
village lived that long). Naming is a player-only rite the competent
driver never plays: 0 nameBaby calls, 0 bestowUseName calls, 0 babies
auto-named by parents, 0 naming offers ever seen. The thread home — the
keepsake pointing back at a Taken relative — fires almost never: 32
thread checks, 1 clue recorded in 1,043 village-days (seed 190347: the
Photo Album still says the name of Lamia Shoukry, a sister Taken at the
Scattering). And the keepsake's powers barely exist in play: the Lucky
Break check ran twice and never fired, Hold was consulted 133 times and
never fired, no L2 keepsake action was ever pressed, and the L3
enhancement offer never fired at all — 20 keepsakes reached L3, 1,679
maybe-offer checks, 0 offers.

## Per-seed table

| seed | days | end | deaths | mantles | standing | wave | pantry kcal | keepsakeGrow grew/dormant | level beats | thread | births |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 190341 | 129 | village-lost | 98 | 13 | 345 | 5 | 0 | 144/38 | 4/4/0 | 0 clues | 0 |
| 190342 | 150 | survived | 129 | 7 | 365 | 5 | 12,096 | 120/30 | 4/4/0 | 0 clues | 0 |
| 190343 | 150 | survived | 76 | 11 | 325 | 5 | 38,041 | 277/68 | 4/4/4 | 0 clues | 0 |
| 190344 | 78 | village-lost | 82 | 10 | 125 | 4 | 2,650 | 69/17 | 4/0/0 | 0 clues | 0 |
| 190345 | 141 | village-lost | 75 | 12 | 199 | 4 | 0 | 344/104 | 4/4/4 | 0 clues | 0 |
| 190346 | 130 | village-lost | 151 | 12 | 560 | 5 | 35,681 | 252/64 | 4/4/4 | 0 clues | 0 |
| 190347 | 150 | survived | 82 | 5 | 550 | 5 | 1,944 | 276/69 | 4/4/4 | 1 clue | 0 |
| 190348 | 115 | village-lost | 98 | 11 | 199 | 4 | 0 | 197/49 | 4/4/4 | 0 clues | 0 |

Totals: 1,043 village-days; 791 deaths; 81 mantles; 86 player deaths;
3/8 survived, 5/8 lost; median survival 135.5d; standing 125–560, all
regional; wave 5 reached on 5 seeds, wave 4 on 3; wins 0, national 0,
table 0.

## Metrics 1–10

1. **Births: 0 everywhere.** No birth on any seed, home or distant.
   Structural zero by design (day-270 gate; longest village 150d).
   Analyzer fix applied during this adoption: births are now counted
   ONLY on the birth-code signature (born unnamed with a birthDay).
   The pre-fix analyzer counted pre-existing worldgen children (age
   1–4, named, no birthDay, no parents) as births — a false-positive
   class caught in analysis, fixed before the evidence was written.
   Baby deaths 0 (no babies to die). No unnamed babies on any roster
   at end.
2. **Naming: 0 everywhere.** nameBaby 0 calls, bestowUseName 0 calls,
   nameUnnamedBabies ran 2,712 times and auto-named 0 (no babies
   pending), babyNamingPending seen 0 times, use-names held at end 0.
   The rite is player-initiated only and competent never calls it —
   the zero is the measurement, per prereg.
3. **Keepsakes held.** 1,037 accrueRelicBond calls. Keepsakes arrive
   only with a new bearer (mantle) or off a corpse — no mid-run grant
   verb exists. 334 keepsakes buried across 86 player deaths (net 73
   after reconciliation — see Metric review). 16 keepsakes held at end
   (3 survived seeds only), all bond 0, level 0. equipAccessory 0
   calls under competent.
4. **Keepsake growth.** keepsakeGrow 2,118 calls: 1,679 grew, 439
   dormant (pack keepsakes show 0 growth, as designed — the dormant
   count is the pack population being checked, not growth). Level
   beats: 32 to L1, 28 to L2, 20 to L3. Flashbacks played: 32,
   exactly 4 per seed, all keepsake-classified. L3 offers: 0 (see
   finding below). ksRecon residue 0 on all seeds (segments 6–11).
5. **Keepsake powers in play.** keepsakeLuckyBreak consulted 2 times,
   fired 0. keepsakeHoldsGround consulted 133 times, fired 0.
   keepsakeAnchorPursuit: no values recorded. addTrauma 158 calls,
   resolve-cut applied on 41. L2 actions pressed: 0 (useAbility ran
   1,019 times band-wide, 0 with abilityId 'keepsake').
   keepsakeActivatables offered vs pressed: never offered in the
   corpus (no keepsake action was ever on the table).
6. **Thread home.** keepsakeThreadCheck 32 calls: 31 not-taken, 1
   clue recorded — seed 190347, the Photo Album, kin Lamia Shoukry
   (sister), kind 'name', region null: "Seek Lamia Shoukry — your
   sister, Taken at the Scattering. The Photo Album still says their
   name." keepsakeTrailCheck 1,679 calls: 251 region-named (ok),
   1,428 not (the kin's region is usually unnamed). End-of-run thread
   clues: 1. keepsakeTakenKin at end: the same single clue.
7. **Kin as lived.** Lifeseed kin per bearer: 0–3 named people each
   (brother, sister, mother, grandfather, spouse, teacher, friend…);
   taken kin named in their fates on most bearers ("was taken at the
   Scattering. The boring half…"). death_in_family deeds: 776.
   Partner/children links on the live roster at end: present in the
   lifeseed records; no births created new links in the pilot.
   village.fallen memorial entries: 86 deaths registered (one per
   player death).
8. **Succession / inheritance.** playerDeath 86 events, mantleBecome
   81. The 5-case gap is the terminal death on each lost village:
   mantleRecon shows deaths = mantles + 1 on seeds 190341, 190344,
   190345, 190346, 190348 — the last bearer dies with no successor
   because the village is lost. Lineage entries: 86 (one per death).
   Keepsakes buried per mantle: 334 total. What the successor
   inherits: their OWN keepsakes, worn, at bond 0 — the predecessor's
   bond dies with them (see finding). Scholar deaths band-wide: 86
   (every player death is a scholar death by definition here).
9. **Say-line coherence.** 1,600 say lines captured (200/seed cap).
   Thread-home line vs clue recorded: the single clue's say line
   matches the recorded clue (same item, same kin, same text). Burial
   lines vs buried count: burial say lines fire on playerDeath when
   keepsakes were carried; counts reconcile (see Metric review).
   Mantle lines vs lineage entries: 81 tele 'mantle_become' events,
   81 lineage entries added. No say line contradicted the live state
   it described in the sampled corpus.
10. **Wall numbers.** National 0/8, table 0/8, wins 0/8. Wave 4
    unlocked on 3 seeds, wave 5 on 5. Median survival 135.5d.
    Standing 125–560. Deaths 791 over 1,043 village-days.

## Neutrality

OFF leg (instrument OFF, same seeds, same policy) matches the
instrumented control leg exactly on days + end pantry kcal + the full
death-event list, 8/8 seeds. The instrument changes nothing numeric.

## Findings (for sim-findings.md)

- **Births 0 on the 150d horizon** — structural zero (day-270 gate),
  not a failed measurement. A 270d+ horizon run is the next question
  for births, not this pilot's.
- **Keepsake bond dies at mantle** — the successor's keepsakes start
  at bond 0 (all 16 end-of-run keepsakes bond 0, level 0), while the
  predecessor's grown keepsakes are buried (334 buried). Bond is a
  per-life engine, never an inheritance. The mantle is a reset, not
  a handoff.
- **Thread home: 1 clue in 1,043 village-days** — the keepsake
  pointing back at a Taken relative almost never fires (32 checks, 1
  clue). The thread is a rare event in lived play, not a steady
  drumbeat.
- **L3 enhancement offer never fires** — 20 keepsakes reached L3,
  keepsakeMaybeOffer ran 1,679 times with 0 offers, and
  offerRelicEnhancement ran 8 times band-wide, all for other relics
  (1 per seed). The L3 keepsake offer path is either gated on
  something the pilot never meets or dead under competent — mechanism
  unclear, flagged for follow-up, not claimed as a defect.
- **Keepsake powers never fire in lived play** — Lucky Break consulted
  twice, Hold 133 times, both 0 fired; no L2 keepsake action ever
  pressed. L1/L2 keepsake powers are present in code and proven in
  fixtures but inert in 1,043 village-days of competent play.
- **Naming is player-only and never happens under competent** — 0
  calls on every naming verb. The rite exists for the player, not for
  the village.

## Metric review (§14)

- The metric set held. Two corrections were needed and are recorded,
  not re-scored: (a) the analyzer's birth detector counted worldgen
  children as births — fixed to the birth-code signature (unnamed +
  birthDay) before this evidence was written; the pilot's birth count
  is 0 under the corrected detector, and the pre-fix count is not
  reported as a result. (b) keepsakesBuried (334) vs
  keepsakesBuriedNet (73): the gross count is burial events per
  playerDeath; the net is the reconciled count of distinct keepsakes
  buried after de-duplicating keepsakes counted at both the death
  snapshot and the migration snapshot. Both are reported; the net is
  the better "how many keepsakes were lost" number, the gross is the
  event count.
- The 5-case mantle mismatch (deaths = mantles + 1) is the terminal
  death on lost villages — expected, not an instrument error.
- The 200-line Game.say cap fills in the first ~18 days on every
  seed (same caveat as the siblings) — late-game say lines are not
  in the corpus. The thread-home clue on seed 190347 was captured
  because it fired early enough to be in the cap window; later clues
  would be missed the same way.
- Next-run question: a 270d+ horizon to see even one birth, and a
  probe of the L3 keepsake offer gate (what, if anything, opens it).
