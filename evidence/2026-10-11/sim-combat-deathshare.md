# Long-run sim — lever 1: combat & death share, armor on-ramp (2026-10-11)

## Lever played
**Bark armor enters the village via occupation itemBias.** `src/data/characterGen.json`:
`"bark_armor"` added FIRST in `itemBias.clothing` for 4 occupations:
`hunting_guide`, `trail_crew`, `carpenter`, `fishing_guide`.
Exact diff: 4 arrays, `bark_armor` prepended (must be first — `take('clothing', 2)`
only picks the first 2 favored items). Nothing else changed.

**Why this lever (5-question evaluation):**
1. **Real-world anchor:** a hunting guide / trail crew / carpenter / fishing guide
   wearing improvised bark armor is plausible — these are woods/maker people.
   "Better than skin" (the recipe's own description).
2. **What breaks if wrong:** too much armor → wave 1 trivialized. Guardrails hold:
   P=10 (not 20), only 4 of 55 occupations, the armor curve's diminishing returns
   (r=P/(P+20)) and hit-1 clamp are untouched — Steve's 2026-10-09 armor model
   is respected, not retuned. A hushwolf [12,17] still lands ~9-12 per hit.
3. **What the sim says:** 16 seeds × 200 days, competent, identical seeds —
   villager deaths 72 → 50 (−31%), villager death rate −37%, wave-2 fight loss
   rate 62% → 45%, median survival 59 → 64d, max 95 → 114d. No regressions.
4. **What it feels like:** the village arms itself. Villagers who'd know how
   show up wearing it. The "village is the protagonist" — they protect themselves.
5. **Does it respect the fiction:** yes. The itemBias system is designed for
   exactly this (occupation-plausible starting gear). The closed loop is opened:
   item exists → villagers wear it (autoEquip at spawn) → field fights respect
   P=10 → recipe L1 via handling (noteGearHandled) → craftable.

**Why this lever and not another:**
The armor system was a CLOSED LOOP: bark_armor existed (P=10, craftable, sprite,
recipe with L1/L2/L3) but zero villagers ever owned one (measured 0/60 across
5 seeds pre-lever), so P=0 in every field fight and the recipe knowledge
(L1 on handling, per Steve 2026-10-09) could never start. The curve was fine;
the ACQUISITION was the blank. Monster damage is canon (wave identities);
the wave-2 ledger is lever 2's; trauma works as designed.

## Before / after (identical seeds, 200 days)

### Competent policy (16 seeds; detailed buckets via sweep-combat-lever.js)

| metric | before | after | delta |
|---|---|---|---|
| median survival (days) | 59 | 64 | +5 |
| max survival (days) | 95 | 114 | +19 |
| total deaths | 183 | 171 | −12 (−7%) |
| player deaths | 111 | 121 | +10 (rate/day flat: 0.117→0.119) |
| villager deaths | 72 | 50 | **−22 (−31%)** |
| villager death rate/day | 0.076 | 0.048 | **−37%** |
| player combat share | 64% | 58% | −6pp |
| player starvation share | 34% | 41% | +7pp (composition, not increase) |
| villager combat (abs) | 52 | 39 | −13 (−25%) |
| wave-1 fight loss rate | 60/136 (44%) | 67/155 (43%) | flat |
| wave-2 fight loss rate | 36/58 (62%) | 21/47 (45%) | **−17pp** |
| wave-3 fights | 4 | 7 | +3 |
| counters discovered | 128 | 114 | noise |
| traps crafted/looted | 0/0 | 0/0 | still blank (policy) |
| wins / table | 0 / 0 | 0 / 0 | upstream still binds |

### Winseek policy (16 seeds; via sweep-combat-baseline.js)

| metric | before | after | delta |
|---|---|---|---|
| median survival (days) | 44 | 65 | **+21** |
| max survival (days) | 99 | 84 | −15 (seed 1001 died d8 — variance) |
| national reach | 13% | 6% | −7pp (aggressive policy variance) |
| player combat deaths/run | 6.25 | 4.38 | **−30%** |
| villager combat deaths/run | 2.56 | 2.75 | flat |
| wave-2 ledger points | 0.81 | 1.81 | **+123%** |
| wins / table | 0 / 0 | 0 / 0 | upstream still binds |

## Reachability verdict (combat content)
- **Wave 1:** 16/16 runs fight it. Loss rate flat at 43-44% (designed brutality intact). ✅
- **Wave 2:** 10-14/16 runs. Loss rate 62% → 45% — the armor makes the "genuine step up" winnable, not trivial. ✅
- **Wave 3:** 1 → 1 run fights it (7 fights post vs 4 pre). Still barely reachable — the wave-2 ledger bar is lever 2's. ⚠️
- **Waves 4–5:** 0/16. Not reachable. Lever 2. ❌
- **Armor:** P>0 now enters play (8/60 villagers own bark_armor post; 2/6 wear at spawn in probe). The curve is no longer decoration. ✅
- **Traps:** 0/0 still. The policy never crafts; recipe knowledge still 0. Documented, not fixed (policy blank + knowledge on-ramp blank).
- **Counters:** 114-128 discovered; policy doesn't play them in tactical combat (strikes weakest). Documented.
- **Win flag / table:** 0/32. Upstream survival improved (+5d median) but the table bar is still unreachable. Lever 2 + win-path.

## Village assessment (plain words)
The village bleeds slower. Pre-lever, it was a steady grind: 12 → 7 → 4 → 1 over
60 days, villagers dying to combat at 0.076/day. Post-lever, the armored villagers
(trail crew, carpenters, guides) hold the line — villager deaths down by a third,
and the wave-2 fights that used to be a 62% slaughter are now 45%. The scholars
still die every ~8 days (the mantle passes, the Codex turns the page), but the
village around them survives longer: median 59 → 64 days, best run 95 → 114.

Who thrived: villagers with bark armor — they take ~5 less per hushwolf hit,
which is the difference between walking home and not. Who died: scholars still
die to combat at the same rate (the player doesn't reliably get armor — the
scholar is a random villager, and the policy doesn't prioritize armored bodies).
What's missing: the PLAYER needs armor too (the scholar is whoever picks up the
Codex, not whoever is best equipped); traps are still a dead system (0 acquired);
counters are learned but not played.

## Sense-testing (transcripts read)
**Villager kills are real and narrated:** "Stefano killed Flashbulb Moth out past
the ridge — alone — and walked home. 2 rounds, 16 taken." "Lena killed the Lockpick
alone — 3 rounds, 29 taken. Word travels fast. The village cheers." The System
grants abilities for deeds: "THE SYSTEM has been watching Stefano — 3 fights. It
offers Patient Aim. Earned, not given." Sensical, consequential. ✅

**Armor is mechanically real but narratively invisible:** villagers wear bark armor
(P=10, absorbs ~1/3 per hit), but no line acknowledges it — no "Lorenzo lashed bark
together," no village reaction, no equip beat. The sprite shows, the math works,
but the fiction doesn't notice. **Blank documented** (lever 3/4: villager expression).

**Prior blanks confirmed still open:**
- askAbout 'village' canned repetition ("Honestly? holding together, somehow.")
- Agency XP 0/0/0 for sampled villagers at day 30 (differenti
...[truncated 2103 chars]