# sim-partydmg-a — EVIDENCE (DIAG-GO)

**Arm:** sim-partydmg-a · **Loop A run:** fleshout-20261127T2215Z · **Branch:** `sim-partydmg-a`
**Prereg:** `evidence/2026-11-27/sim-partydmg-a-prereg.md` (frozen 2026-11-27 ~17:15 UTC,
before any judged sim; committed 49cc3334a) · **Type:** DIAG (instruments + evidence
only — no game-code fix lands)
**Base at pilot:** 0859e2643 (worktree HEAD; prereg 49cc3334a + instruments 0859e2643).
**Corpus:** `evidence/2026-11-27/perseed-partydmg-a-arm/` (8 per-seed JSONs).
**Analysis:** `evidence/2026-11-27/partydmg-a-analysis.json`.
**Determinism rerun:** `evidence/2026-11-27/perseed-partydmg-a-rerun/` (seed 112102,
hash-identical once the process-position `seq` offset is stripped — see §6).

## §0. Verdict — DIAG-GO

Total party damage is decomposed four ways with complete parses
and a closed reconciliation, the kill-line gap is quantified per
fight, the four frozen counterfactuals are computed, and the
binding constraint is named. The prereg's expectation is
overturned in one place and confirmed in another (see §7).

| Frozen bar (§2) | Bar | Measured | Pass? |
|---|---|---|---|
| Pool floor (fought expedition w4+ fights) | ≥ 8 | 22 | ✅ |
| Decomposition completeness (channel/role/mix/tier) | ≥ 0.95 each | 1.000 / 1.000 / 1.000 / 1.000 | ✅ |
| Strike-parse coverage | ≥ 0.95 | 1.000 (176/176 strike lines) | ✅ |
| Reconciliation residual | ≤ 0.05 | 0.000 (5293 parsed = 5293 dealt) | ✅ |
| Instrument errors | 0 | 0 | ✅ |

**The question, answered:** across 22 fought expedition wave-4
fights, parties dealt **5293 damage (mean 45.7 dpr, median 48.4,
max 92.5)** against the ~111/round the kill line needs
(leadworst-a). **0 fights reach the line; 0 vKills in 22 fights
(16 vFlee, 6 vDie).** The gap is a whole-party gap of 65.3 dpr
on average, and it is dominated by **strike rate, not strike
size**: the whole party lands **1.83 weapon strikes per round
combined** (176 strikes in 96 rounds — 0.61 strikes per fighter
per round). The median fight would need its strikes to average
a **wb of 68** to reach the line at the observed strike rate.
Of the four frozen counterfactuals, only giving **every fighter
a wb-50 weapon (counterfactual C, godslayer/apex tier)** closes
the gap on half the fights (11/22); giving every fighter wb 30
(A) closes 3/22, giving the lead the best observed lead wb (B)
closes 0/22, and having every fighter strike every round (D)
closes 2/22. **The binding constraint is opportunity — how
often the party swings — with weapon quality second:** even
perfect attendance (D) only lifts mean dpr to 67.8, and only
apex-tier weapons everywhere (C) reach the line, on half the
fights.

**Single leg, no §15 panel:** this is a single-leg diagnostic — there
is no before/after pair to compare, so no balanced panel was
fabricated. The frozen bars (§2) are the judge. **No canon doc
covers party damage decomposition or the wave-4 kill line** —
the ~111/round line is a leadworst-a measurement, not canon;
the counterfactual rule is this arm's measurement convention,
frozen in the prereg, not a canon claim. A weapon is a human
weapon (CANON.md human-skills lane), never an alien ability.

## §1. The damage, fight by fight (22 fought expedition wave-4 fights)

| Seed | Day | Monster | Rounds | Outcome | mHpStart | mDealt | Party dpr | Gap | Rounds-to-kill | HP left | Strikes/round | Req. wb | Lead wb |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 112102 | 41 | algorithm | 5 | vFlee | 1000 | 275 | 55.0 | 56.0 | 18.2 | 725 | 1.6 | 63.4 | 17 |
| 112102 | 50 | congregation | 4 | vDie | 1065 | 136 | 34.0 | 77.0 | 31.3 | 929 | 1.8 | 57.4 | 7 |
| 112102 | 55 | audit | 4 | vFlee | 1279 | 189 | 47.3 | 63.8 | 27.1 | 1090 | 1.8 | 57.4 | 17 |
| 112102 | 67 | reunion | 4 | vFlee | 1295 | 198 | 49.5 | 61.5 | 26.2 | 1097 | 1.8 | 57.4 | 17 |
| 112102 | 77 | algorithm | 13 | vFlee | 1186 | 807 | 62.1 | 48.9 | 19.1 | 379 | 2.5 | 39.1 | 18 |
| 112102 | 80 | eulogy | 1 | vFlee | 1087 | 58 | 58.0 | 53.0 | 18.7 | 1029 | 1.0 | 105.0 | 17 |
| 112102 | 83 | congregation | 4 | vFlee | 905 | 257 | 64.3 | 46.8 | 14.1 | 648 | 1.5 | 68.0 | 25 |
| 112102 | 86 | strike | 6 | vFlee | 1136 | 462 | 77.0 | 34.0 | 14.8 | 674 | 1.8 | 54.5 | 17 |
| 112102 | 116 | congregation | 4 | vFlee | 997 | 249 | 62.3 | 48.8 | 16.0 | 748 | 1.5 | 68.0 | 25 |
| 112102 | 119 | rerun | 4 | vFlee | 1466 | 199 | 49.8 | 61.3 | 29.5 | 1267 | 1.5 | 68.0 | 18 |
| 112103 | 99 | suburb | 4 | vFlee | 1389 | 149 | 37.3 | 73.8 | 37.3 | 1240 | 1.5 | 68.0 | 4 |
| 112103 | 99 | suburb | 15 | vFlee | 1445 | 1387 | 92.5 | 18.5 | 15.6 | 58 | 2.8 | 33.6 | 22 |
| 112104 | 41 | reunion | 4 | vFlee | 1240 | 114 | 28.5 | 82.5 | 43.5 | 1126 | 1.8 | 57.4 | 7 |
| 112104 | 90 | strike | 1 | vDie | 1024 | 73 | 73.0 | 38.0 | 14.0 | 951 | 1.0 | 105.0 | 15 |
| 112105 | 45 | audit | 3 | vDie | 1175 | 64 | 21.3 | 89.7 | 55.1 | 1111 | 0.7 | 160.5 | 18 |
| 112105 | 63 | eulogy | 5 | vFlee | 990 | 349 | 69.8 | 41.2 | 14.2 | 641 | 1.8 | 55.7 | 17 |
| 112105 | 89 | editor | 2 | vFlee | 1765 | 18 | 9.0 | 102.0 | 196.1 | 1747 | 0.5 | 216.0 | 6 |
| 112106 | 86 | eater | 1 | vFlee | 1128 | 13 | 13.0 | 98.0 | 86.8 | 1115 | 1.0 | 105.0 | 6 |
| 112106 | 88 | strike | 4 | vDie | 1178 | 77 | 19.3 | 91.8 | 61.2 | 1101 | 1.3 | 82.8 | 6 |
| 112107 | 50 | congregation | 5 | vFlee | 1059 | 160 | 32.0 | 79.0 | 33.1 | 899 | 1.8 | 55.7 | 4 |
| 112107 | 146 | timeslot | 2 | vDie | 1561 | 18 | 9.0 | 102.0 | 173.4 | 1543 | 0.5 | 216.0 | 8 |
| 112107 | 148 | spoiler | 1 | vDie | 1590 | 41 | 41.0 | 70.0 | 38.8 | 1549 | 1.0 | 105.0 | 20 |
| **Pooled** | | | median 4 | 16 vFlee, 6 vDie, 0 vKill | 905–1765 | **5293** | **mean 45.7, median 48.4, max 92.5** | **mean 65.3** | **median 28.3** | **median 1059.5** | **1.83 pooled** | **median 68** | **median 17, max 25** |

The 38 expedition wave-4+ rows break down as 16 evades (0 rounds)
and 22 fought. The pool is lumpy: seed 112102 carries 10 of the 22
fought fights; seeds 112101 and 112108 carry 0 fought expedition
wave-4 fights (their wave-4 fights arrived through world-tick and
aid origins instead — seed 112101 logged 39 wave-4 encounters, all
non-expedition). Two fights are long (13 and 15 rounds) and carry
41.5% of all damage dealt (2194 of 5293) and 42% of all strikes
(74 of 176): fight length, not weapon quality, is what lets a
party's damage accumulate. The median fight ends with the monster
at 1059.5 HP — the party flees with the monster at ~85% health,
after a median 28.3 rounds-to-kill at its observed rate (it fought
a median 4).

### Per-seed tables

| Seed | Days / end | Rows | Fought | Spear fights | mDealt | Spear attr | spearSeen | Recon |
|---|---|---|---|---|---|---|---|---|
| 112101 | 150 survived | 0 | 0 | 0 | 0 | 0 | 10 | ✅ |
| 112102 | 150 survived | 20 | 10 | 7 | 2832 | 1033.4 | 46 | ✅ |
| 112103 | 150 survived | 5 | 2 | 2 | 1536 | 490.9 | 3 | ✅ |
| 112104 | 126 village-lost | 2 | 2 | 2 | 187 | 0 | 11 | ✅ |
| 112105 | 117 village-lost | 3 | 3 | 2 | 431 | 9.9 | 1 | ✅ |
| 112106 | 150 survived | 2 | 2 | 1 | 90 | 0 | 9 | ✅ |
| 112107 | 150 survived | 6 | 3 | 0 | 219 | 0 | 0 | ✅ |
| 112108 | 114 village-lost | 0 | 0 | 0 | 0 | 0 | 8 | ✅ |
| **Pooled** | median 150d | **38** | **22** | **14** | **5293** | **1534.2** | **88** | ✅ 8/8 |

Ledger-vs-`spearSeen` reconciliation per seed (prereg §2 staging-sniff
gate): the ledger's spear-row count equals the game-maintained
`spearSeen` counter on every seed (10/10, 46/46, 3/3, 11/11, 1/1,
9/9, 0/0, 8/8). Pooled spearSeen 88 = spearPassed 88 (ratio 1.000 —
the gate replication holds).

## §2. Cross-tabs (secondary, not binding)

**By channel** (5293 total): weapon strikes 4839 (91.4%), volley
454 (8.6%), contact finish 0, ambush 0, extra (ability) 0. The
volley is the only non-strike channel that ever fires, and it is
lead-only, bow/crossbow/sling — the spear contributes 0 volley by
construction. Contact finish 0 attempts on 38 fresh meetings
(a fresh wave-4 monster is never below its break line at meeting,
as speardmg-a found). Ambush 0. Ability damage that the log does
not itemize is 0 on this band — the reconciliation is exact, not
just within tolerance.

**By role** (weapon strikes + volley + contact + ambush + extra,
per fighter): lead 2773 (52.4%), ally1 1104 (20.9%), ally2 1416
(26.7%), ally3 0, unattributed 0. Every fight had exactly 3
fighters (lead + 2 allies) — **the 4th party seat never appears
in a wave-4 fight on this band**. Ally2 out-damages ally1 despite
striking less often (40 strikes vs 55): ally2 is the better-armed
late joiner — mean wb 18.0 and 35.4 damage per strike, vs ally1's
wb 14.4 and 20.1 per strike. The lead strikes most (81 strikes,
3.68 per fight, 28.6 per strike, mean wb 14.1); ally1 strikes 2.50
per fight; ally2 strikes 1.82 per fight. The call-in order is the
damage order in reverse for the allies: the first-called ally is
the weaker one.

**By weapon-mix class** (all damage, per fighter): spear-melee-slot
1895 (35.8%), crossbow+melee 983 (18.6%), other-melee-only 896
(16.9%), spear+melee 599 (11.3%), bow+melee 510 (9.6%),
sling+melee 339 (6.4%), bow-only 71 (1.3%). **Spear-carrying
fighters are the largest damage block in the mix view** — but
that view assigns a fighter's whole damage to their mix, including
the bow half of a spear-melee-slot fighter's folded wb. The
fold-in attribution (the spear's own half of each strike) is
**1534.2 of 5293 = 29.0%** — vs speardmg-a's 5.1% on its band.
The difference is opportunity, and it is large: spear-mix
fighters landed **59 strikes in 14 spear fights** here vs 5
strikes in 9 spear fights there. Two mechanisms: (1) this band
has long fights (the R13 and R15 fights give late allies rounds
to strike — 42% of all strikes land in those two fights);
(2) this band has 5 spear-led fights (vs 2), and spear leads
strike from round 1. The spear is not a fixed 5% weapon — its
share is whatever the fight's length and call-in order let it
be. The spear's strikes, when they land, are the party's
hardest ordinary hits: spear-melee-slot mean 41.8/strike
(median 33.5, n=42), spear+melee 35.2 (n=17), vs bow+melee 21.3
(n=20) and other-melee-only 15.4 (n=58).

**By wb tier** (all damage, per fighter): 10–19: 2352 (44.4%),
1–9: 839 (15.9%), 20–29: 1075 (20.3%), 30–49: 147 (2.8%),
50+: 880 (16.6%). The 50+ tier is one fighter in one fight:
Nikos's godslayer spear (wb 57) — 14 strikes at 61–65 damage,
880 of the band's 5293 (16.6%). The best weapon in the corpus
is a single villager's godslayer spear, and even it does not
close the line alone: its fight reached 92.5 dpr, still 18.5
short, and the party fled with the monster at 58 HP.

**Per-strike mean vs the frozen formula (6+wb)**, strike-weighted
mean wb per tier: 1–9: observed 13.4 vs formula 11.5 (mean wb
5.5); 10–19: 30.0 vs 21.9 (mean wb 15.9); 20–29: 31.1 vs 28.9
(mean wb 22.9); 30–49: 49.0 vs 50.0 (mean wb 44.0); 50+: 62.9
vs 63.0 (mean wb 57.0). The formula holds almost exactly at
high wb and observed runs above it at low wb — the excess is
multipliers (Rage ×2, audit, War Cry) riding on small bases.
The counterfactual arithmetic is therefore sound: it scales
observed damage by (6+w')/(6+w), keeping whatever multipliers
the observed strikes already carry.

**Lead vs allies, raw bonuses** (the leadworst comparison, same
band): lead meleeBonus median 8 (max 40), rangedBonus median 22
(max 35); ally meleeBonus median 12 (max 85), rangedBonus median
8 (max 80); best-slot bonus median lead 28 vs ally 20. The
leadworst shape reproduces on the melee side (lead melee 8 is
the lowest median in the party) but not as a folded-wb story:
lead folded wb median 17 vs ally median 14, max 25 vs 58. The
lead is the worst-armed fighter by melee weapon, and the
best-armed by ranged weapon — the fold-in averages the two into
a middle that neither side of the comparison sees. 8 of 22
fights had a lead at wb ≤ 8.

## §3. The counterfactuals — what closes the gap, arithmetically

Frozen rule (prereg §1): weapon-strike damage re-scales by
(6+w')/(6+w) with observed strike counts held fixed; volley /
contact / ambush / extra held at observed values. What-if
numbers on the observed opportunity structure — they answer
"would better weapons close it?" and nothing else. (D gives a
fighter one strike per round only when they struck at least
once — a fighter who never struck has no observed per-strike
mean, so D does not invent strikes for never-striking fighters.)

| Counterfactual | Mean dpr | Median dpr | Max dpr | Fights reaching ≥ 111 |
|---|---|---|---|---|
| Observed | 45.7 | 48.4 | 92.5 | 0 / 22 |
| A — every fighter at wb ≥ 30 | 73.8 | 77.5 | 126.1 | 3 / 22 |
| B — lead at best observed lead wb (25) in every meeting | 56.7 | 57.1 | 95.5 | 0 / 22 |
| C — every fighter at wb 50 | 108.5 | 110.7 | 183.7 | 11 / 22 |
| D — every fighter striking every round at their observed mean | 67.8 | 72.7 | 117.8 | 2 / 22 |

Reading it: **B is the leadworst answer, and it fails.** Giving
the lead the best lead weapon in the corpus (wb 25) in every
meeting lifts mean dpr only 45.7 → 56.7 and closes 0 fights —
the lead is only 52% of party damage, so fixing the lead alone
cannot fix the party. **A fails too:** wb 30 everywhere (a
strong mid-tier weapon in every hand) reaches the line on 3/22.
**D fails:** perfect attendance — every fighter swinging every
round — reaches the line on 2/22, mean 67.8. Only **C** —
godslayer/apex-tier weapons (wb 50) in every hand — reaches the
line, and only on half the fights (11/22, mean 108.5, median
110.7). The required-wb solve says the same thing from the
other side: the median fight needs its strikes to average wb
**68** at its observed strike rate (range 33.6–216; no fight is
unclosable — every fight landed at least one strike). The two
long fights are the only ones where A or D come close (R13:
A 118.1, D 75.1; R15: A 126.1, D 101.6) — length is what makes
weapon quality or attendance matter at all.

**The binding constraint, named:** opportunity — the party
swings 1.83 times a round combined, and fights last a median 4
rounds. Weapon quality is second: even with every fighter
swinging every round, the party needs apex-tier weapons to
reach the line on half its fights. The kill line is not a
weapon problem or a turnout problem alone; it is both, and the
turnout half (1.83 strikes/round) is the one no weapon fixes.

## §4. Wall numbers (scale-onramp axis)

| Metric | This band (8 seeds) |
|---|---|
| National reached | 0 / 8 |
| Table | null (not instrumented by this driver — never faked) |
| Wins | 0 / 8 |
| Wave-4 unlocked | 8 / 8 |
| Wave-5 unlocked | 5 / 8 |
| Median survival | 150 days (150, 150, 150, 126, 117, 150, 150, 114) |
| Community lost | 3 / 8 |
| Scale ranks at end | regional 8 |
| Deaths | 853 total — monster 747 (87.6%), villager 104 (12.2%), person 2 (0.2%); starvation 0 |

The scale wall stands: waves 4–5 unlock, villages still reach
neither national nor the table, and no seed wins. Standing at end
ranged 199–575 (seed 112102 reached 575 — past the wave-5 bar —
and still ended regional with no win). Two seeds (112103, 112106)
sat at standing 199 — one point under the wave-5 bar — for the
whole late game.

## §5. Sense-testing — two wave-4 fights (read in full)

SENSE-TESTING LAW: judge meaning, not counts. Both fights below
are expedition-origin wave-4 fights, staged by the competent
policy: geared villagers with parties, never fresh un-geared solo
scholars.

### (a) The best fight on the band — Mateo, Riri, Nikos vs The Suburb, seed 112103, day 99 (15 rounds, fled, 58 HP left)

Mateo leads with a fire-hardened spear in the melee slot and a
crossbow with no bolts (wb 22). Riri (kitchen knife, wb 4) answers
his first shout on round 3; Nikos (godslayer spear 85 + crossbow,
wb 57) answers the second shout on round 4. Fifteen rounds, 1387
damage — and they flee with the monster at 58 HP because Mateo is
at 23 HP.

> R4: Mateo strikes for 27 (1323 left)
> R4: Riri strikes for 10 (1313 left)
> R4: Nikos strikes for 61 (1252 left)
> R5: Mateo BELLOWS — not volume, a promise. The Suburb falters. They hold the line a little longer. (War Cry)
> R5: The Suburb hesitates — Mateo bought a breath.
> R8: Mateo stops mid-fight and binds the wound — field medicine, +20 HP.
> R14: Mateo strikes for 28 (236 left)
> R14: Riri strikes for 11 (224 left)
> R14: Nikos strikes for 64 (160 left)
> The Suburb is wounded past its line — and holds its ground. It is not leaving. (Committed)
> R15: Mateo strikes for 29 (131 left)
> R15: Riri strikes for 11 (120 left)
> R15: Nikos strikes for 62 (58 left)
> R15: Property Tax hits Mateo for 10 (23 left)
> Mateo sees how this ends — and runs while running still works.

Reads sensibly — and it is the diagnostic in one fight: the
party could have killed the monster next round (one more Nikos
strike is 62 damage against 58 HP left) but fled because the
lead was at 23 HP. The flee is HP-driven, not damage-driven.
The godslayer spear is visibly the hammer (61–65 every round,
never missing its band), the kitchen knife is visibly a kitchen
knife (9–12), the War Cry buys a breath, the field medicine is
spent mid-fight. Two honest notes: the Suburb's signature is
that you escape it, not kill it (MONSTER-WAVES.md) — yet this
party fought it blow-by-blow for 15 rounds with no navigation
trick offered or taken; and R5 shows Mateo striking twice in one
round (War Cry + strike), which the log narrates as a bought
breath followed by a strike, not a double-swing. Neither breaks
the fight's sense.

### (b) A typical losing fight — Jovan vs The Strike, seed 112106, day 88 (4 rounds, vDie, 77 of 1178 HP)

Jovan leads with a stone knife (wb 6) and no ranged weapon.
He fights alone for three rounds, shouts on round 3 at 13 HP,
Benoit (hardlight knife 45 + sling, wb 27, armor 81) charges in
on round 4 and strikes for 33 — then the monster kills Jovan.
Tashi (crowbar, wb 6) never enters; the fight ends when the lead
dies.

> R1: Jovan strikes for 11 (1167 left)
> R1: Walkout hits Jovan for 21 (52 left)
> R2: Jovan strikes for 12 (1155 left)
> R2: Walkout hits Jovan for 18 (34 left)
> Jovan holds the line — they know how this one is fought, and have not had their turn to prove it.
> R3: Jovan strikes for 10 (1145 left)
> R3: Walkout hits Jovan for 21 (13 left)
> Jovan is losing — shouts for help! Benoit charges in!
> R4: Jovan strikes for 11 (1134 left)
> R4: Benoit strikes for 33 (1101 left)
> R4: Walkout hits Jovan for 18 (0 left)

Reads sensibly and as the call-in story predicts: the strong
ally arrives one round too late, and the second ally never gets
the call at all because the fight ends with the lead. The
"holds the line" voice line lands mid-fight while Jovan is
losing — it reads as bravado, not a system error. Nothing
robotic, nothing repeated verbatim. The party dealt 77 damage
to a 1178-HP monster; the fight was lost in the three solo
rounds before anyone arrived.

**Judgment:** both transcripts read as coherent stories of
geared villagers fighting wave-4 monsters with the weapons in
their hands — the godslayer spear visible as the hammer, the
kitchen knife visible as a kitchen knife, allies answering
shouts one at a time, flees at low HP. The damage gap is
visible in the transcripts themselves: a party that swings
together for fifteen rounds nearly kills a wave-4 monster, and
a party whose lead fights alone for three rounds dies having
dealt 77 damage.

## §6. Instrument notes (what the corpus proved about the instruments)

- **The decomposition works live** (proof test 55/55 before the
  pilot; analyzer selftest 35/35): the four views sum to mDealt
  exactly on the pilot corpus as well as the fixtures (channel
  1.000, role 1.000, mix 1.000, tier 1.000; coverage 1.0 on
  176/176 strike lines; residual 0; 0 field mismatches on
  volley/contact/ambush; 0 gear-up changes; 0 name collisions).
- **Determinism, with one artifact:** seed 112102 re-run after
  the pilot is NOT byte-identical — the sha256s differ — but the
  ONLY difference is the `seq` field on the ledger rows. `rowSeq`
  is a module-level counter in the driver that is never reset
  between seeds: in the pilot, 112102 ran second (its first
  spearDepart carries seq 218, the 217 seqs consumed by seed
  112101's run); in the rerun it ran first (seq 1). With `seq`
  stripped, the two files are hash-identical (sha256
  8dcac71581266373325fce8ea02aec7ae090cb7f0d6febe7c287ccf406f8bf71,
  both files), and the rerun analysis reproduces the pilot's
  seed-112102 slice exactly. The sim is deterministic; the
  instrument's sequence numbering is process-position-dependent.
  **Proposed fix for the next arm:** reset `rowSeq` at the start
  of each seed's `oneRun`, so reruns are byte-identical without
  stripping. (Speardmg-a's rerun was byte-identical only because
  its rerun seed, 111801, was also the first seed in its pilot.)
- **Spear share 29.0% vs speardmg-a's 5.1% — a band difference,
  not an instrument difference.** Same driver, same analyzer
  lineage, same substrate; the bands differ in fight length
  (this band's R13/R15 fights vs speardmg's max R5) and in
  spear-led share (5/14 vs 2/9). The spear's share is whatever
  the fight's length and call-in order let it be — the next arm
  should treat spear share as a band-varying quantity, not a
  constant of the weapon.
- **The `perStrikeByTier.formulaMean` field uses the tier's band
  floor** (e.g. 16 for tier 10–19), not the tier's mean wb — the
  honest comparison is in §2, against the strike-weighted mean
  wb per tier. A next arm's analyzer should carry the mean wb
  in the field itself.
- **Counterfactual D's boundary:** D gives a fighter one strike
  per round only when they struck at least once. A fighter who
  never struck contributes 0 to D. D is therefore the
  "attendance" counterfactual for fighters who do fight, not a
  call-in fix — the call-in fix (a never-striking fighter
  striking) is a different, unmeasured number.
- **Safe-commit clobber, twice:** after the prereg commit
  (49cc3334a) and the instruments commit (0859e2643) the main
  index showed the committed files as staged-deleted. Both
  commits are correct on disk; the index was repaired from HEAD
  blobs (`git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`) and verified (`git status` clean,
  `git diff HEAD` empty) after each.
- **Seed-band freshness, re-verified by this arm:** word-boundary
  ripgrep over all `evidence/*/sim-*-prereg.md` files names
  112101–112108 in no prereg (and the fallback 112201–112208 in
  none); the only 1121/1122 hits are run-ID substrings
  (fleshout-20261027T1121Z, fleshout-20261030T1122Z). No
  dedicated forbidden/contaminated band list exists in the goal
  hidden_files.
- **Write flap:** probes (`git update-ref refs/heads/probe HEAD`)
  passed before every material write in this arm. No flap window
  was hit during this run.

## §7. Metric review (frozen bars judge as written — no re-scoring)

- **The prereg's expectation is half overturned.** The
  counterfactual half holds: B (best-armed lead everywhere)
  closes 0/22 fights, A (wb 30 everywhere) closes 3/22, D
  (strike every round) closes 2/22 — only C (wb 50 everywhere)
  reaches the line, on half the fights. The decomposition half
  does not hold as expected: the lead is NOT the dominant damage
  source in the way expected (52.4%, not ~70%+), the allies
  contribute 47.6% combined, and the spear's fold-in share is
  29.0%, not small — because this band's fights are longer and
  its spear fighters actually strike. The mechanism is different
  than expected in a second way too: the gap is not "the lead is
  weak" (lead wb median 17, best-slot median 28) but "the party
  swings 1.83 times a round combined and fights last a median 4
  rounds." The falsifier (a counterfactual closing the gap on a
  majority of fights) occurred for C only — and C is apex-tier
  weapons in every hand, which is a statement about how far the
  gap is, not a lever. The verdict is DIAG-GO either way: the
  diagnostic's job was to decompose the damage, quantify the
  gap, and name the binding constraint, and all three are
  measured.
- **The pool is lumpy.** Seed 112102 contributes 10 of 22 fought
  fights and 2832 of 5293 damage; seeds 112101 and 112108
  contribute 0 fought expedition fights (their wave-4 fights
  came through world-tick/aid). The floors cleared comfortably,
  but a confirm band would want the same lumpiness noted:
  per-seed fought counts range 0–10.
- **Two fights carry the band.** The R13 and R15 fights are
  41.5% of all damage. The pooled means (45.7 dpr) describe a
  band whose typical fight is a 4-round, 30–50 dpr loss and
  whose damage lives in two long fights. A next arm that wants
  the typical fight should report the median (48.4) beside the
  mean, as this file does.
- **No metric change is proposed for the frozen bars.** The bars
  judged as written; the verdict is DIAG-GO. The three revisions
  in §6 (rowSeq reset per seed; tier formulaMean at mean wb;
  spear share as a band-varying quantity) are for the next arm's
  prereg and instruments, not this run's verdict.

## §8. Next arm (named from the proof)

1. **Call-in timing (the open question this diagnostic leaves,
   sharpened).** The party swings 1.83 times a round combined
   because allies enter late or never: the lead fights alone
   for 2–3 rounds, the first-called ally is the weaker one
   (20.1/strike vs the second-called 35.4/strike), and the
   second ally often never gets the call before the flee or the
   lead's death. The next arm measures the call-in itself — when
   each ally enters, how many rounds each gets, and what the
   fight would look like if the strongest ally were called
   first. That is a timing diagnostic, not a weapon buff. (This
   is speardmg-a §8.1, now with the numbers behind it: the
   call-in order costs the party its hardest hitter's early
   rounds.)
2. **The flee-at-low-HP rule (the second open question).** The
   best fight on the band fled with the monster at 58 HP and
   one more godslayer strike away from death, because the lead
   was at 23 HP. How often does a party flee a fight it would
   win next round, and what HP threshold drives it? That is a
   flee-rule diagnostic — the morale window may be ending
   winnable fights.
3. **The 4th seat (a small open question).** Every fight on this
   band had exactly 3 fighters; the 4th party seat never
   appears in a wave-4 fight. Whether the seat never fills or
   never joins is a census question for the next arm.

## §9. Village assessment (plain words)

Eight villages, 150 days each (death-aware). Five survived the
full 150 days; three were lost between days 114 and 126, all to
monsters (88% of the 853 deaths were monster kills). Every
village unlocked wave 4; five reached wave 5; none reached
national, none sat at the table, none won. The villages that
survived did so regionally, at standings up to 575 — strong
enough to be noticed by the System, not strong enough to climb.

The parties in these villages fight wave-4 monsters the way the
numbers say: three villagers walk in, the leader swings first
with whatever is in their hands — often a weak melee weapon and
a decent bow — a weaker friend answers the first shout, a
stronger friend answers the second if there is a second, and
they run when the leader is hurt, usually with the monster still
at 85% health. The whole party together swings fewer than twice
a round. Give every one of them a good weapon and they still
lose most fights; give every one of them the best weapon in the
game and they win half. Give them more swings — more rounds,
earlier friends, a lead who doesn't have to fight alone for
three rounds — and the same weapons go further. The blank this
run filled is where party damage actually comes from and what
would close the gap to a kill: not the lead's weapon, not the
spear, but the party's opportunity to swing. The blank that
remains is the call-in itself — why the strongest friend is
always the last one called (§8.1) — and why a party walks away
from a monster with 58 health left (§8.2).
