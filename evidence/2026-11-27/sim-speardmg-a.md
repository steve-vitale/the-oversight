# sim-speardmg-a — EVIDENCE (DIAG-GO)

**Arm:** sim-speardmg-a · **Loop A run:** fleshout-20261127T2033Z · **Branch:** `sim-speardmg-a`
**Prereg:** `evidence/2026-11-27/sim-speardmg-a-prereg.md` (frozen 2026-11-27 ~15:00 UTC,
before any judged sim; committed 713fdd36f) · **Type:** DIAG (instruments + evidence
only — no game-code fix lands, no thrown-weapon lever built)
**Base at pilot:** 96d337537 (worktree HEAD; prereg 713fdd36f + instruments 96d337537).
**Corpus:** `evidence/2026-11-27/perseed-speardmg-a-arm/` (8 per-seed JSONs).
**Analysis:** `evidence/2026-11-27/speardmg-a-analysis.json`.
**Determinism rerun:** `evidence/2026-11-27/perseed-speardmg-a-rerun/` (seed 111801,
byte-identical — see §6).

## §0. Verdict — DIAG-GO

The spear's fight damage is quantified, with a complete parse and a
closed reconciliation. The answer overturns half the prereg's
expectation (see §7): the spear's damage share is SMALL — 5.1% of
party damage — not because its strikes are weak, but because it
almost never gets to strike.

| Frozen bar (§2) | Bar | Measured | Pass? |
|---|---|---|---|
| Pool floor (fought expedition w4+ fights) | ≥ 8 | 16 | ✅ |
| Spear-fight floor (fights with ≥1 spear fighter) | ≥ 5 | 9 | ✅ |
| Strike-parse coverage | ≥ 0.95 | 1.000 (49/49 strike lines) | ✅ |
| Reconciliation residual | ≤ 0.05 | 0.000 (1565 parsed = 1565 dealt) | ✅ |
| Instrument errors | 0 | 0 | ✅ |

**The question, answered:** across 16 fought expedition wave-4
fights, spear fighters landed **5 strikes total** (0.56 per spear
fight), dealt **79.4 spear-attributed damage of 1565 total (5.1%)**,
at **2.3 spear-attributed dpr per spear fight (max 9.9)** against
the ~111/round the kill line needs (leadworst-a). **0 vKills in 16
fights; 0 spear-led vKills.** The spear cannot move the kill line —
and the reason is opportunity, not power: when a spear strike does
land it hits for 26–40 damage, in line with a bow+melee fighter's
30.4 mean and well above an other-melee-only fighter's 15.0. The
spear is an opportunity-starved weapon, not a weak one.

**Single leg, no §15 panel:** this is a single-leg diagnostic — there
is no before/after pair to compare, so no balanced panel was
fabricated. The frozen bars (§2) are the judge. **No canon doc covers
spears as thrown weapons, and no canon doc covers spear melee damage
either** — the fold-in rule lives in `fieldFights.js` comments, not
canon; the attribution rule is this arm's measurement convention,
frozen in the prereg, not a canon claim. A spear is a human weapon
(CANON.md human-skills lane), never an alien ability.

## §1. The damage, fight by fight (16 fought expedition wave-4 fights)

| Seed | Day | Monster | Lead? | Rounds | Outcome | mHpStart | mDealt | Spear attr | Spear dpr | Party dpr | Spear strikes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 111801 | 81 | strike | comp | 5 | vFlee | 1024 | 424 | 20.3 | 4.1 | 84.8 | 2 |
| 111801 | 102 | suburb | LED | 1 | vFlee | 1400 | 13 | 0 | 0 | 13.0 | 0 |
| 111801 | 110 | network_note | LED | 1 | mFlee | 1203 | 0 | 0 | 0 | 0 | 0 |
| 111801 | 122 | rerun | comp | 3 | vFlee | 1277 | 38 | 0 | 0 | 12.7 | 0 |
| 111801 | 124 | suburb | comp | 1 | vFlee | 1448 | 0 | 0 | 0 | 0 | 0 |
| 111801 | 129 | eater | comp | 4 | vFlee | 962 | 118 | 0 | 0 | 29.5 | 0 |
| 111801 | 134 | eulogy | comp | 3 | mFlee | 994 | 0 | 0 | 0 | 0 | 0 |
| 111803 | 105 | suburb | comp | 1 | vFlee | 1312 | 95 | 0 | 0 | 95.0 | 0 |
| 111804 | 60 | reunion | comp | 4 | vDie | 1321 | 116 | 0 | 0 | 29.0 | 0 |
| 111807 | 87 | suburb | comp | 1 | vFlee | 1371 | 0 | 0 | 0 | 0 | 0 |
| 111808 | 37 | congregation | comp | 4 | vFlee | 949 | 162 | 0 | 0 | 40.5 | 0 |
| 111808 | 39 | reunion | comp | 3 | vDie | 1293 | 89 | 0 | 0 | 29.7 | 0 |
| 111808 | 52 | eulogy | comp | 4 | vFlee | 1028 | 217 | 39.6 | 9.9 | 54.3 | 2 |
| 111808 | 144 | suburb | comp | 1 | vFlee | 1490 | 0 | 0 | 0 | 0 | 0 |
| 111808 | 144 | strike | comp | 3 | vFlee | 1088 | 68 | 0 | 0 | 22.7 | 0 |
| 111808 | 150 | spoiler | comp | 3 | vFlee | 1344 | 225 | 19.5 | 6.5 | 75.0 | 1 |
| **Pooled** | | | 2 led / 7 comp | median 3 | 12 vFlee, 2 mFlee, 2 vDie, 0 vKill | 949–1490 | **1565** | **79.4 (5.1%)** | **mean 2.3, max 9.9** | **mean 30.4, max 84.8** | **5** |

The 38 expedition wave-4+ rows break down as 22 evades (0 rounds —
the awareness check gave the monster room) and 16 fought. Rounds
fought: six 1-round, five 3-round, four 4-round, one 5-round. Three
seeds (111802, 111805, 111806) had ZERO expedition wave-4 fights at
all; seed 111808 carries 6 of the 16 fought fights and 59.1 of the
79.4 spear-attributed damage.

### Per-seed tables

| Seed | Days / end | Rows | Fought | Spear fights | Spear-led | mDealt | Spear attr | spearSeen | Recon |
|---|---|---|---|---|---|---|---|---|---|
| 111801 | 150 survived | 15 | 7 | 3 | 2 | 593 | 20.3 | 4 | ✅ |
| 111802 | 150 village-lost | 0 | 0 | 0 | 0 | 0 | 0 | 4 | ✅ |
| 111803 | 150 survived | 5 | 1 | 1 | 0 | 95 | 0 | 3 | ✅ |
| 111804 | 114 village-lost | 3 | 1 | 0 | 0 | 116 | 0 | 0 | ✅ |
| 111805 | 103 village-lost | 0 | 0 | 0 | 0 | 0 | 0 | 12 | ✅ |
| 111806 | 52 village-lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ✅ |
| 111807 | 89 village-lost | 4 | 1 | 1 | 0 | 0 | 0 | 12 | ✅ |
| 111808 | 150 survived | 11 | 6 | 4 | 0 | 761 | 59.1 | 11 | ✅ |
| **Pooled** | median 132d | **38** | **16** | **9** | **2** | **1565** | **79.4** | **46** | ✅ 8/8 |

Ledger-vs-`spearSeen` reconciliation per seed (prereg §2 staging-sniff
gate): the ledger's spear-row count equals the game-maintained
`spearSeen` counter on every seed (4/4, 4/4, 3/3, 0/0, 12/12, 0/0,
12/12, 11/11). Pooled spearSeen 46 = spearPassed 46 (ratio 1.000 —
the gate replication holds).

## §2. Cross-tabs (secondary, not binding)

**Damage per strike by fighter weapon-mix class** (weapon strikes
only: kinds strike + echo — the tactical formula; extra [3,6] ability
strikes excluded, 0 on this band):

| Mix class | n strikes | Mean | Median | Min–max | What it is |
|---|---|---|---|---|---|
| sling+melee | 4 | 56.5 | 60 | 38–68 | sling lead (Adrian, wb 34) |
| bow+melee | 21 | 30.4 | 24 | 18–76 | the workhorse lead shape |
| spear-melee-slot | 4 | 30.5 | 30 | 22–40 | spear as the MELEE weapon + bow ranged |
| spear+melee | 1 | 26 | 26 | 26 | spear in ranged slot + stick melee |
| crossbow+melee | 5 | 22.6 | 23 | 21–24 | |
| bow-only | 1 | 19 | 19 | 19 | |
| other-melee-only | 12 | 15.0 | 14 | 9–24 | machete/knife/crowbar, no ranged |
| sling | 1 | 11 | 11 | 11 | |
| **spear-only** | **0** | — | — | — | **THE CLEAN POPULATION IS EMPTY** |

**No fighter on this band carried a spear as their only weapon.**
Every spear fighter in a wave-4 fight also carried a melee weapon —
or carried the spear AS the melee weapon with a bow in the ranged
slot (Ricardo, Soledad, Pavel — the common live shape). The prereg's
direct "spear-only vs melee-only vs bow-only" comparison has no
spear-only side; the comparison that exists is spear-melee-slot
(30.5) and spear+melee (26) vs bow+melee (30.4) vs other-melee-only
(15.0) — the spear's strikes sit at the top of the pack, not the
bottom.

**Attribution (fold-in shares, prereg §1):** spear 79.4 (5.1%),
melee 683.5 (43.7%), ranged 780.9 (49.9%), fold-in rounding residue
21.3 (1.4%), ability-extra 0 — sums exactly to mDealt 1565. The
volley contributes 229 (14.6% of all damage, all from bows /
crossbows / slings — the spear contributes 0 volley by
construction). Contact finish 0 attempts, 0 kills. Ambush 0.

**Spear-led vs companion-led:** 2 led fights, 0 spear strikes, 0
damage, 0 kills — both 1-round non-strike fights (§5c). 7 companion
fights, 5 strikes, 79.4 damage. The spear's whole wave-4 damage on
this band came from companions.

**Kill contribution:** 0 vKills in 16 fights — there is no kill to
contribute to. Spear-led vKills 0.

**Spear strikes by tier:** fire_hardened_spear 3 strikes / 72 dmg
(5 fighters carried it); hunting_spear 0 strikes (3 fighters);
shard_spear 2 strikes / 76 dmg (1 fighter); godslayer_spear 0
fighters. The hunting spear's zero is Ricardo: his two led fights
were both 1-round non-strike fights.

**The volley check, corrected (§6):** the analyzer counted 2
"spear-lead volley" rows. Both are Ricardo: hunting_spear in the
MELEE slot, crude_bow in the RANGED slot — the volley (13 dmg on
day 102; 0 shots, dry bow, day 110) fired from the BOW, and the
attribution correctly gives it to ranged, not to the spear. No
ranged-slot spear ever volleyed on this band (there was no
ranged-slot spear lead at all); the proof test re-verified
volley-null for a ranged-slot spear live (43/43).

## §3. Wall numbers (scale-onramp axis)

| Metric | This band (8 seeds) |
|---|---|
| National reached | 0 / 8 |
| Table | null (not instrumented by this driver — never faked) |
| Wins | 0 / 8 |
| Wave-4 unlocked | 8 / 8 |
| Wave-5 unlocked | 3 / 8 (seeds 111801, 111803, 111808) |
| Median survival | 132 days (150, 150, 150, 114, 103, 52, 89, 150) |
| Community lost | 5 / 8 |
| Scale ranks at end | regional 7, village 1 |
| Deaths | 750 total — monster 636 (84.8%), villager 113 (15.1%), person 1 (0.1%); starvation 3 |

The scale wall stands: waves 4–5 unlock, villages still reach neither
national nor the table, and no seed wins. Standing at end ranged
140–550 (seed 111801 reached 550 — past the wave-5 bar — and still
ended regional with no win).

## §4. The mechanism — why the spear almost never strikes

The spear's strikes are not weak. Its strike count is the story —
5 strikes in 9 spear fights, 0 in 6 of them. Four mechanisms, all
read off the rows:

1. **Companions strike only when called in.** Allies join on
   shouts — the first ally when the lead first shouts (round 2+),
   the second on the second shout. A spear companion who is the
   second ally, or whose lead flees after one shout, never enters
   the fight at all. Soledad (day 81) and Pavel (day 52) entered on
   round 3–4 and got 2 strikes each; Ivy (day 150) entered round 3
   and got 1. In the other six spear fights the spear fighter never
   got the call before the flee.
2. **Fights are short.** Median 3 rounds; six of sixteen fights
   last a single round. The whole party lands 3.06 weapon strikes
   per fought fight. There are barely enough swings for the lead,
   let alone a late-joining companion.
3. **The two spear-led fights were non-strike fights.** Ricardo's
   day-102 Suburb fight ends on the navigation trick after the
   volley; his day-110 Network Note fight ends on a Peacemaker
   walk-in. The lead never swung in either — the spear's led-fight
   damage is 0 because the fights were resolved by signature
   mechanics, not by strikes.
4. **The spear has no other damage channel in wave-4 fights.** No
   volley by construction (0 on this band, re-verified live in the
   proof test). No contact finish on fresh wave-4 meetings (0/38 —
   a fresh wave-4 monster is never below its break line at
   meeting, so the finish rule cannot fire). No ambush (0). The
   folded melee strike is the spear's only channel — and it gets
   5 swings in 9 fights.

**The kill-line verdict:** spear-attributed dpr 2.3/round mean, 9.9
max, against ~111 needed. Even the best PARTY on the band — day 81,
Amina's worldbreaker_maul (wb 69) striking for 74–76 — reached only
84.8 dpr against a 1024-HP Strike, and fled with the monster at 600
HP. The spear cannot move the kill line, and neither can the party
as staged: the gap is a whole-party damage gap (30.4 mean vs 111),
of which the spear's 5.1% share is a small part. Removing the spear
would change nothing measurable; doubling the spear's strikes would
still leave the party an order of magnitude short.

## §5. Sense-testing — three spear fights (read in full)

SENSE-TESTING LAW: judge meaning, not counts. All three fights
below are expedition-origin wave-4 fights with a spear fighter in
the party, staged by the competent policy: geared villagers with
parties, never fresh un-geared solo scholars.

### (a) Soledad's spear vs The Strike — seed 111801, day 81 (5 rounds, fled)

The best fight on the band: Rafael (crossbow) volleys 41, strikes
21–24 a round; Amina (worldbreaker_maul, wb 69) answers his shout
and strikes 74, 76, 74; Soledad (fire-hardened spear in the melee
slot, crude bow ranged, wb 17) answers the second shout and strikes
24, 22. The party deals 424 to a 1024-HP Strike and flees at 600 HP
left, Rafael at 52 HP.

> R3: Rafael strikes for 21 (917 left)
> R3: Amina strikes for 74 (843 left)
> R4: Rafael strikes for 23 (820 left)
> R4: Amina strikes for 76 (744 left)
> R4: Soledad strikes for 24 (720 left)
> R5: Rafael strikes for 24 (696 left)
> R5: Amina strikes for 74 (622 left)
> R5: Soledad strikes for 22 (600 left)
> Rafael sees how this ends — and runs while running still works.

Reads sensibly: the spear is visibly a melee weapon in Soledad's
hands (24, 22 — the fold-in range for wb 17 is [21,25], exactly
where they land), the maul is visibly the party's hammer, the
shouts bring the allies in one at a time, and the flee reads as a
judgment call, not a panic. Nothing robotic. The spear's two
strikes are honest work inside a losing fight.

### (b) Pavel's spear vs The Eulogy — seed 111808, day 52 (4 rounds, fled)

Hattie (bow) volleys 18, strikes 26, 24, 26, 28 (x1.2–x1.3); Pavel
(shard_spear in the melee slot, bow ranged, wb 24) answers her
shout and strikes 36, 40 (x1.3); Miguel joins round 4 and strikes
19. The party deals 217 to a 1028-HP Eulogy and flees at 830 HP
left, Hattie at 32 HP.

> R3: Hattie strikes for 26 (x1.2) (934 left)
> R3: Pavel strikes for 36 (x1.3) (898 left)
> R4: Hattie strikes for 28 (x1.3) (870 left)
> R4: Pavel strikes for 40 (x1.3) (830 left)
> R4: Miguel strikes for 19 (811 left)
> Hattie sees how this ends — and runs while running still works.

Reads sensibly: Pavel's spear strikes are the party's biggest hits
(36, 40 — the shard spear's half of wb 24, times the x1.3), and
still the party flees with 80% of the monster's health left. The
spear doing its best work is still not close to enough — the
sentence the whole diagnostic writes.

### (c) Ricardo's spear vs The Suburb — seed 111801, day 102 (1 round, fled)

Ricardo leads with a hunting spear in the MELEE slot and a crude
bow ranged (wb 24). He volleys 13 with the bow, then reads the
Suburb's navigation trick and walks out. Zero strikes by anyone.

> Ricardo sees Ugly-Eyes coming and nocks an arrow — the fight opens at range (2 shots).
> loosed — it takes Ugly-Eyes for 13 (1387 left).
> R1: Ricardo reads the sterile streets — you can’t kill a suburb. They walk out. (Navigation is victory.)

Reads sensibly and as designed: the Suburb's signature is that you
escape it, you don't kill it — the fight resolving without a strike
is the mechanic working, not a defect. (His day-110 Network Note
fight is the same shape in the other direction: a dry bow — "has
Crude bow but no arrows — the string stays drawn, useless" — then a
Peacemaker walk-in stands the monster down, 0 damage, mFlee.)
These two fights are why the spear-led column reads 0 strikes: the
spear-led fights on this band were signature resolutions, and a
spear cannot out-strike a monster the party never swings at.

**Judgment:** all three transcripts read as coherent stories of
geared villagers fighting wave-4 monsters with the weapons in their
hands — the spear visible as a melee weapon, the bow visible at
range, allies answering shouts, flees at low HP. Nothing robotic,
nothing repeated verbatim. The spear's silence in the transcripts
is the finding: it is usually not the weapon that speaks, because
its carrier usually never gets the call.

## §6. Instrument notes (what the corpus proved about the instruments)

- **The damage addition works live** (proof test 43/43 before the
  pilot; analyzer selftest 37/37): rich rows carry entry kits with
  wb, per-fighter tallies that split mDealt exactly, volley null
  for the ranged-slot spear, mHpStart recovered (mHpLeft + mDealt)
  on fought non-kills, and the analyzer parses the live logs with
  coverage 1.0 and residual 0 — on the pilot corpus as well as the
  fixture (49/49 strike lines attributed, 0 unknown damage lines,
  0 field mismatches on volley/contact/ambush, 0 gear-up changes,
  0 name collisions).
- **Analyzer fix, committed mid-run (05330971a):** the first
  analysis over-counted: a spear in the MELEE slot had its half
  counted in BOTH the spear share and the melee share (meleeShare
  did not exclude spear melee weapons), so the three shares summed
  to 1603.7 against mDealt 1565. Fixed by making meleeShare return
  0 for a spear melee weapon (its half belongs to the spear share
  only); the shares now reconcile exactly (79.4 + 683.5 + 780.9 +
  21.3 residue = 1565.0). The verdict and the spear numbers are
  unchanged (the spear share was never double-counted — only the
  melee total was inflated); the selftest grew 34 → 37 with
  regression checks for the fix.
- **The volley-flag correction (§2):** `spearLeadVolleyNonNull = 2`
  is a metric-definition artifact, not an engine behavior: both
  rows are Ricardo with a spear in the MELEE slot and a bow in the
  ranged slot, and the volley fired from the bow. The attribution
  itself was always correct (volley → the ranged weapon's class).
  See §7 for the proposed revision.
- **Determinism:** seed 111801 re-run after the pilot is
  BYTE-IDENTICAL (sha256
  f357da5d7db92c46e9dee058b1aecdae857a8a58467edfde3409891e8dcb5865,
  both files). The rerun analysis verdict is DIAG-NO-GO
  THIN-POOL only because a single seed carries 7 fought fights
  against the 8-fight BAND floor — expected; the per-seed numbers
  match the pilot's seed-111801 slice exactly (spearShare 0.0342,
  spearDprMean 1.4, coverage 1, residual 0).
- **Safe-commit clobber, three times:** after the prereg commit
  (713fdd36f), the instruments commit (96d337537), and the analyzer
  fix (05330971a) the main index showed the committed files as
  staged-deleted (twice) or MM (once). All three commits are correct
  on disk; the index was repaired from HEAD blobs (`git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info`) and
  verified (`git status` clean, `git diff HEAD` empty) after each.
- **Seed-band freshness, re-verified by this arm:** word-boundary
  ripgrep over all 1184 `evidence/*/sim-*-prereg.md` files names
  111801–111808 in no prereg (and the fallback 112001–112008 in
  none); no dedicated forbidden/contaminated band list exists in
  the goal hidden_files.
- **Write flap:** probes (`git update-ref refs/heads/probe HEAD`)
  passed before every material write in this arm. No flap window
  was hit during this run.

## §7. Metric review (frozen bars judge as written — no re-scoring)

- **The prereg's expectation is half overturned.** The dpr half
  holds (2.3 vs ~111 — the spear is insufficient). The share half
  does not: the spear's attributed share is 5.1%, not "large." The
  mechanism is different than expected: the spear is not the
  best-armed fighter carrying the party — it is a fighter who
  rarely gets to swing. The falsifier (spear dpr ≥ 111, or any
  spear-led vKill) did not occur. The verdict is DIAG-GO either
  way: the diagnostic's job was to measure the share and the
  kill-line position, and both are measured.
- **The spear-only clean population is empty (n = 0).** The
  prereg's direct comparison (spear-only vs melee-only vs
  bow-only, no attribution) has no spear-only side on this band.
  The comparison that exists — spear-melee-slot (30.5) and
  spear+melee (26) vs bow+melee (30.4) vs other-melee-only (15.0)
  — answers the same question with attribution. **Proposed
  revision for the NEXT run:** pre-register the mix classes that
  actually occur (spear-melee-slot is the common live shape, not
  spear-only), and carry spear-only as a secondary that may be
  empty.
- **The `spearLeadVolleyNonNull` secondary conflates slots.** A
  spear in the MELEE slot with a bow ranged volleys legitimately
  from the bow. **Proposed revision:** split into ranged-slot-spear
  leads (volley must be null — the spearopen silence) and
  melee-slot-spear leads (volley is the ranged weapon's, attributed
  by class).
- **The pool is lumpy.** Three seeds contribute 0 expedition
  wave-4 fights; seed 111808 contributes 6 of 16 fought fights and
  59.1 of 79.4 spear damage. The floors cleared comfortably, but a
  confirm band would want the same lumpiness noted: per-seed fought
  counts range 0–7.
- **One-round fights dilute per-fight strike rates.** Six of
  sixteen fights last one round (two with 0 strikes by anyone).
  They count in the population correctly per the frozen definition
  (rounds > 0), but a next arm could split "fights with ≥ 1 strike"
  as a secondary so the strike-rate denominator is visible.
- **No metric change is proposed for the frozen bars.** The bars
  judged as written; the verdict is DIAG-GO. The three revisions
  above are for the next arm's prereg, not this run's verdict.

## §8. Next arm (named from the proof)

1. **Companion call-in timing (the open question this diagnostic
   leaves).** The spear's damage is opportunity-starved: spear
   companions enter late or never (6 of 9 spear fights: zero spear
   strikes). The next arm measures the call-in itself — when the
   1st/2nd/3rd allies enter a wave-4 fight, how many rounds each
   gets, and whether the spear carrier's slot in the call order
   decides whether they ever swing. That is a timing diagnostic,
   not a spear buff.
2. **The thrown-weapon opening stays Steve's design call.** A spear
   still has no opening volley (re-verified live in the proof test;
   the pilot had no ranged-slot spear lead to re-verify it on) and
   no canon doc covers spears as thrown weapons. Whether a spear
   should open at range is a design ruling for Steve, not a silent
   code tweak — this arm builds no volley branch and lands no
   game-code fix, as preregistered.
3. **The contact finish on wave 4 needs wounded meetings.** The
   finish never fires on fresh wave-4 meetings (0/38) because a
   fresh wave-4 monster is never below its break line at meeting.
   If a future arm wants the spear's entry contribution measured,
   it needs meetings where the beast arrives wounded (lower waves,
   repeat meetings), not fresh wave-4 draws — the spearlead claim
   that "entry contribution is contact-finish only" was about the
   entry phase generally, and wave 4 as drawn never reaches it.

## §9. Village assessment (plain words)

Eight villages, 150 days each (death-aware). Three survived the full
150 days; five were lost between days 52 and 150, all to monsters
(85% of the 750 deaths were monster kills). Every village unlocked
wave 4; three reached wave 5; none reached national, none sat at the
table, none won. The villages that survived did so regionally, at
standings up to 550 — strong enough to be noticed by the System, not
strong enough to climb.

The spear carriers in these villages fight wave-4 monsters the way
everyone does: they walk in with a bow or a crossbow for range and
a spear or a blade for close work, they shout for help, and they run
when the monster is still at 80% health. The spear in their hands
hits as hard as any other weapon — 26 to 40 damage a swing, the
party's biggest hits in two of the three fights where it swung at
all — but it swung five times in nine fights, and twice the fight
ended before anyone swung: once because the Suburb can't be killed,
only escaped, and once because a peacemaker talked the monster
down. The blank this run filled is the spear's worth when it
actually connects: real damage, almost no opportunity. The blank
that remains is the call-in itself — why the spear carrier is so
often the villager who never gets to swing (§8.1) — and whether the
spear should ever fly (§8.2, Steve's call).
