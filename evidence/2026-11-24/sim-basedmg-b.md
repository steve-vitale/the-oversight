# sim-basedmg-b — the base-damage question (finding #2544)

Loop B arm sim-basedmg-b, run fleshout-loop-b-20261124T1815Z. DIAG, single leg, no lever.
Prereg: `evidence/2026-11-24/sim-basedmg-b-prereg.md` (commit `1de4ee097`, frozen before any sims).
Corpus: `evidence/2026-11-24/perseed-basedmg-b-ctl/` (8 seeds), analysis `evidence/2026-11-24/basedmg-b-analysis.json`,
driver `scripts/basedmg-driver-b.js`, analyzer `scripts/analyze-basedmg-b.js`, proof `scripts/test-basedmg-b.js` (27/27 green, analyzer selftest 21/21 green).

## Verdict: DIAG-GO

All four frozen bars pass:

| Bar | Result |
|---|---|
| Pool floor (pair-inclusive engaged launched wave-4+ meetings ≥ 10) | **27** |
| Decomposition complete (pooled parsed-vs-mDealt residual ≤ 10%) | **0.000** — parsed 5415 = dealt 5415 |
| Binding component named with counterfactual numbers | **base** (best observed wb) → 83.6/round, shortfall 27.4; **no single component closes the gap** |
| Instrument selftest + proof test green, instrument errors 0 | **0 errors** |

## The decomposition (the answer in one table)

The median launched meeting is the honest typical party. Cooper's party dealt ~111/round; the gap is
~38–51 → ~111 in the brief, 25.7 (median) → 111 in this corpus. One component at a time, raised to
its Cooper level, from the median meeting (1.0 strikes/round, base 18, multiplier 1.27, volley 0,
4 rounds, monster HP 1065, wb 12):

| Component raised to Cooper level | Damage/round | Closes the gap? |
|---|---|---|
| Observed median meeting | 25.7 | — |
| Multiplier — Rage ×2 on all strikes | 43.3 | No (shortfall ~68) |
| Strikes — 3 strikers every round | 68.4 | No (shortfall ~43) |
| Base — best weapon bonus observed (wb 60, Searcaster) | 83.6 | No (shortfall 27.4) |
| Volley — 55 opening damage in round 1 | 39.4 | No (shortfall ~72) |
| All four at once (literal stack: best weapon on all three) | 490.2 | Yes — but see the caveat below |

**Binding component: base damage.** It is the largest single lever (83.6), and it is the only one
that gets within 30 of the target — but even the best weapon in the measured villages does not close
the gap alone. **No single component closes the ~38–51 → ~111 gap.** The wb needed for 111 at the
median meeting's shape is 81.6 — beyond every weapon observed (max wb 60).

Caveat on the 490.2 "all at once" number: it stacks the best observed weapon onto all three
strikers at once, which no real party has. The honest Cooper shape — 3 strikers every round, bases
at their observed role medians (lead 13.8, ally 23.0), the strongest striker at Rage ×2, volley 55
— reaches **96.5–106.4/round**, just short of 111. So the gap is a **combination problem**: the
full Cooper shape nearly closes it, no single piece does. The wall is the multiplication of four
small shortfalls, not one broken number.

The base counterfactual itself rests on an outlier: the wb-60 Searcaster struck exactly once in
the whole corpus. At the more robust 90th-percentile weapon (wb 43, Phase blade) the base
counterfactual is 62.1/round — still the largest single lever, still short.

## The median meeting, in numbers

- Damage/round: **median 25.7, mean 35.5** (range 0–119). Split by outcome: fled meetings
  median 39.0 / mean 43.5 (n=20); died meetings median 8.5 / mean 12.8 (n=7).
- Rounds fought: median 4, mean 4.3. 15/27 meetings reach round 4; 8/27 reach round 6.
- Monster HP at start: median 1065 (range 916–1717). Rounds to kill at median damage: **41.4**;
  at fled-meeting median 39.0: 27.3; at the best meeting's 119: 8.9.
- Strikes/round: **median 1.0, mean 1.16**. The median meeting has one blow land per round.
- Base per strike: median 18 (lead 13.8, ally 23.0). Multiplier: median 1.27. Weapon bonus:
  median 12 (lead 8, ally 17); p75 20, p90 43, max 60.
- Rage: 4 windows opened, 9 of 169 strikes (5.3%). Blooded (1.5×): active in 3/27 meetings.
- Volley opening: fired in 6/27 meetings; median 0, max 59. In the best meeting the lead carried
  a bow with no arrows — "the string stays drawn, useless."
- Kill share: **0/27**. No launched party killed its wave-4 monster on this band.
- Ability fires: field_medicine 11 (healing, not damage), brawler_instinct 3, war_cry 2.

## Why the party only lands one blow a round (the structural finding)

The decomposition's biggest surprise is not a damage number — it is that **the launched "trio"
almost never fights as three**. Allies never start in the fight: `allyFromStart` is false in
**54/54** wave-4+ expedition meetings. The lead fights alone for the first 1–2 rounds; allies
"charge in" one at a time only when the lead shouts for help while losing (best meeting's log:
Tomas arrives round 2, Daniyar round 3). The full trio exists only from ~round 3–4, and the
fight usually ends (flee) around round 4–5 — so the trio barely ever fights together. That is
why the lead strikes 0.78/round and each ally only 0.52/round, and why the median meeting lands
1.0 strikes/round. The strikes/round counterfactual (68.4) is the second-largest single lever
precisely because the party is structurally solo for half the fight.

Two compounding facts:

- **The lead is the worst-armed fighter in the party** (median wb 8 vs allies' 17). The person
  who decides to launch and who fights the opening rounds alone carries the weakest weapon.
- **5 of 27 meetings dealt zero damage.** Four were Eulogy fights where the lead's every turn
  went to the counter-trick (contradicting the narration) while the allies had not arrived yet;
  the party stood for 1–3 rounds, landed nothing, and fled or died.

## Sense-test: the two transcripts read as real fights

Best meeting (seed 109505, day 118, The Network Note, 119/round, 8 rounds, fled): Ines (Rage,
wb 12) opens, her eyes go red; Tomas (wb 31) charges in round 2, Daniyar (wb 44, Phase blade)
round 3; Blooded is active (1.5×). The trio lands 952 damage — and **flees with the monster at
95 HP**, one round from a kill, because Ines is down to 50 HP. The Cooper shape in the wild,
still a flee: the flee call, not damage, was the last wall there.

Worst meeting (seed 109505, day 84, The Eulogy, 0 damage, 2 rounds, fled): Ines spends both
rounds contradicting the narration while the monster hits her through her armor; Daniyar charges
in only as she shouts for help — and they run. A real fight, lost to the monster's trick and to
allies arriving too late to throw a blow.

## Wall numbers (this corpus, 8 seeds)

- National standing: **0/8**. Full-seat wins: **0/8**. Wave 4 unlocked: 8/8. Wave 5 unlocked: 4/8.
- Median survival: **142.5 days**. Villages lost: 5/8. All 8 seeds ended at regional standing
  (best 595; two seeds stalled at 199).
- Kill share 0/27 launched meetings; win share 0/8 seeds.

## Sense-check against fightcap-recheck

The fightcap-recheck corpus (seeds 110101–110108, DIAG-NO-GO thin pool) reported damage/round
~45–55. This band's fled-meeting mean is 43.5 and median 39.0 — consistent, same order of
magnitude. The lower all-meeting median (25.7) is explained by this pool including the dying
meetings (median 8.5) and the five zero-damage Eulogy meetings, which the thin recheck pool
mostly lacked. No contradiction.

## Lever played

None — DIAG only. The ragecarry confirm (evidence/2026-11-24/sim-ragecarry-b-confirm.md, NO-GO)
already exhausted the stacked damage-multiplier carrier as a kill-share lever; no carrier variant
was built here.

## Blanks filled / documented

- Blooded is **not** wave-5-only: it fired in 3/27 wave-4 meetings (1.5×) wherever the village
  already holds BLOODED. An earlier note calling it wave-5-only was wrong; corrected here.
- The analyzer's per-fighter rollup covers only fighters who dealt damage (fighters with no
  strike/volley line get no row). Gear for the zero-damage meetings lives in the corpus rows'
  `fighters` snapshots, not in the analysis JSON.
- The literal "all components at once" counterfactual (490.2) is reported as defined in the
  prereg but flagged as unrealistic; the honest Cooper shape (96.5–106.4) is the better reference
  and is a post-hoc sense-check, not a frozen bar.

## Incidents (infrastructure, not findings)

- Write flap: seed 109508's corpus write failed all 480 retries (tmp file left 0 bytes); the
  driver fell back to stdout and the file was recovered from the log byte-verified (seed 109508,
  147 days, 44 encounters). One exec-service restart interrupted the first recovery attempt;
  the retry wrote on the first try.
- safe-commit refused once mid-run: the flap had corrupted its private index (empty sha1s),
  and it correctly refused a commit that would have deleted 295,711 lines rather than force it.
  No `--force-delete` was used. The refusal is the instrument working as designed.

## Village assessment (plain words)

The villages on this band are strong enough to reach the monsters and brave enough to go after
them — every seed reached wave 4, half reached wave 5, and the parties that launch do real
damage when they actually get to fight together. But a launched party is not really a party at
the start: the leader walks in alone, the others only arrive once she is already losing, and
the fight is usually over — fled — before all three have thrown a blow together. So the typical
fight lands about one blow a round against a monster with about a thousand health, and the party
leaves alive with the monster still standing. Even the best fight on the band — a raging leader,
a blessed 1.5× village-wide strike boost, three well-armed fighters, eight rounds — ended with
the monster at 95 health and the party running, one round short of the kill. No single fix
closes this: a stronger weapon alone, a Rage fighter alone, more blows a round alone, or a bow
opening alone each leave the party well short. The gap is all four at once — and the cheapest
half of it is not damage at all, it is getting all three fighters into the fight from the first
round instead of the third.

## Metric review

- **Median vs mean:** the mean damage/round (35.5) is lifted by a single 119/round meeting;
  the median (25.7) is the honest typical party. Both are reported; the counterfactuals are
  built from the median meeting, per the prereg's metric-review proposal. The fled-only median
  (39.0) is the fair comparator against the brief's "~38–51" and matches it.
- **Reconciliation:** pooled parsed-vs-mDealt residual is exactly 0.000 (5415 = 5415), and the
  base reconstruction validates at 1.0 on every meeting with a reconstructable strike (nulls
  only where no strike exists). The parser is not silently dropping damage.
- **Pool:** 27 engaged launched-party meetings against a floor of 10, pair-inclusive, stated
  plainly. No re-scoring: the pool, the residual bar, and the counterfactual definitions were
  frozen in the prereg before the band ran.
- **Identity checks:** policy sha `1884c8852d38` matches the prereg; anchor commit
  `1de4ee097dd9` matches the prereg commit; substrate flags confirmed on (SENSEEXPED,
  FIGHTALLY2) and carrier confirmed off. Instrument errors 0 across all 8 seeds.
- **Robustness notes:** the base counterfactual's best weapon (wb 60) is a single-strike
  outlier; the p90 variant (62.1) is the robust reading and is reported beside it. The
  "all components" stack (490.2) is unrealistic and is flagged as such; the honest Cooper
  shape (96.5–106.4) is the usable reference.
