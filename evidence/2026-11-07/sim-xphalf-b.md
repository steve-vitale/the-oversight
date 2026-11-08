# sim-xphalf-b — XP-half early-death probe (DIAG)

**Arm:** sim-xphalf-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0214Z (adoption; prior run fleshout-loop-b-20261108T0013Z died by cron timeout ~02:02Z before judging) · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3), bisect follow-up · **Findings:** #1885 · **Branch:** sim-xphalf-b · **Prereg:** `evidence/2026-11-07/sim-xphalf-b-prereg.md` (commit `23c4dae06`, before any judged sweep) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, no new seeds. Corpora in `/tmp/xphalf-p1/` and `/tmp/xphalf-c1/` (working data, not committed); the tables below are the durable record. Proof `scripts/test-xphalf-20261107.js` **31/31 green** (re-verified by the adopting run).

## Verdict: NO-GO — C1 reproduction bar missed on its first-death leg

The P1 reproduction bar is met **exactly** (three early-death days 45/62/55, median 150d, sits 4/8). The C1 median (150d) and sits (5/8) are met. But the C1 bar's third leg — **first death ≥ d28 on all seeds** — **fails on 5/8 seeds**: C1 first deaths fall at d10 (53008), d13 (53007), d18 (53005), d19 (53004), d22 (53001). Per the prereg, a missed reproduction bar is a stop: **the diagnosis is NOT judged and NOT asserted**. The analyzer's classifications below are reported as **observed, unjudged** data, not as the diagnosis.

**Kill classification (§14a): METRIC-BROKEN, not CONCEPT-DEAD.** The failure is in the bar, not the base or the instrument:

- The C1 construction is verified: checkout `16369893c`, no modification, anchor `16369893cd64` in every corpus file. It reproduces the bisect's C1 headline numbers **exactly on all 8 seeds** — days 150/79/150/150/97/150/86/150, standings 175/125/344/260/230/849/99/199, wave-4 kills 0/0/3/2/3/8/0/0, sits 5/8.
- The P1 construction is verified: checkout `50881fbf2` + `src/data/items.json` from `16369893c`, anchor `50881fbf2f64`. It reproduces the bisect's P1 numbers exactly (45/62/55, median 150d, sits 4/8). Seed 53008's corpus file was 0 bytes after an EPERM write flap in the prior run; the adopting run re-ran it (150d, lesser sat d90) and parse-verified all 8 seeds.
- The failed leg mis-quotes the bisect. Bisect §1 says "At **L0**, NO village loses anyone before d28" — the prereg carried that sentence into a C1 bar without a C1 per-seed table to support it (the prereg's own C1 reference lists days/sits only, no first-death days). The exactly-reproduced C1 corpus contradicts it. Three of the early first deaths are **shared with P1 on the same seed, day, and person** — 53001 d22 Sanjay (ambush), 53004 d19 Fritz (the wild), 53008 d10 Dieter (the wild) — i.e. they are pre-divergence trajectory, present with or without the XP half, not a property the healthy contrast lacks.
- The instrument is the frozen bisect instrument (driver + policy byte-identical to the branch copies); 0 instrument errors in either sweep.

## Reproduction tables

### P1 (C2 minus gear retune) — bar MET exactly

| Seed | Days | End | Seat/sat | Stand | MaxW | w4 | 1st death | Dead≤d30 | Dead≤d60 | Living d30/d60 |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | lesser d92 | 199 | 4 | 1 | d23 | 1 | 5 | 11/10 |
| 53002 | 150 | survived | — | 250 | 5 | 4 | d25 | 2 | 6 | 10/10 |
| 53003 | **45** | village-lost | — | 50 | 3 | 0 | d25 | 2 | 9 | 10/3 |
| 53004 | 150 | survived | lesser d94 | 199 | 4 | 1 | d19 | 1 | 5 | 11/7 |
| 53005 | **62** | village-lost | — | 150 | 4 | 0 | d23 | 6 | 9 | 6/3 |
| 53006 | 150 | survived | lesser d91 | 199 | 4 | 2 | d43 | 0 | 1 | 12/11 |
| 53007 | **55** | village-lost | — | 50 | 3 | 0 | d22 | 4 | 10 | 8/4 |
| 53008 | 150 | survived | lesser d90 | 199 | 4 | 2 | d10 | 3 | 4 | 9/8 |

Median 150d, sits 4/8. Note: 53002 — the strongest P1 village by standing (250) and the only wave-5 unlock — never sits.

### C1 (healthy contrast) — median/sits MET, first-death leg MISSED

| Seed | Days | End | Seat/sat | Stand | MaxW | w4 | 1st death | Dead≤d30 | Dead≤d60 | Living d30/d60 |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | — | 175 | 4 | 0 | **d22** | 1 | 6 | 11/7 |
| 53002 | 79 | village-lost | — | 125 | 4 | 0 | d38 | 0 | 5 | 12/10 |
| 53003 | 150 | survived | lesser d90 | 344 | 5 | 3 | d29 | 1 | 5 | 11/10 |
| 53004 | 150 | survived | lesser d94 | 260 | 5 | 2 | **d19** | 1 | 5 | 11/7 |
| 53005 | 97 | village-lost | lesser d90 | 230 | 5 | 3 | **d18** | 2 | 5 | 10/8 |
| 53006 | 150 | survived | lesser d90 | 849 | 5 | 8 | d31 | 0 | 5 | 12/10 |
| 53007 | 86 | village-lost | — | 99 | 3 | 0 | **d13** | 2 | 8 | 10/4 |
| 53008 | 150 | survived | lesser d90 | 199 | 4 | 0 | **d10** | 3 | 4 | 9/8 |

Median 150d, sits 5/8. First deaths before d28 on 53001/53004/53005/53007/53008 (bold). The 53006 sat-day wobble (d90 here vs d93 in the prereg's C1 reference) is the wobble the bisect already disclosed; it touches no bar.

## Observed classifications (UNJUDGED — the prereg's stop rule)

The analyzer (`scripts/analyze-xphalf-20261107.js`, proof 31/31) classified all three early-death seeds under the pre-registered rule. These are **observations, not the judged diagnosis** — they become the diagnosis only when a re-registered run with a corrected C1 bar judges them.

- **53003 (45d) — attrition-after-thinning (observed).** First deaths violent (contest d25 Mateo, monster d28 Sergio, monster d32 Maeve), then a late attrition cluster sets the death day: sickness d37 Raquel, wounds d39 Pavel, sickness d39 Cheyenne, starvation d44 David, thirst d44 Jorge, sickness d45 Victor — 5 starvation/thirst/sickness deaths in the final 15 days. Near-miss on the strict violent-thinning rule: the first 3 deaths ARE all violent and the first death IS before d28, but living at d30 is 10, not < 8 — it fails only the living leg. Cause mix: violent-contest 1, violent-monster 2, sickness 3, wounds 1, starvation 1, thirst 1. Fights 34 (C1: 89).
- **53005 (62d) — attrition-after-thinning (observed).** The rule fires on early violent deaths (contest d23 Vy, monster d30 Nikolai) + 3 late attrition deaths (sickness d53 Ella, thirst d56 Ivy, sickness d58 Grace). BUT the opener is a sickness cluster, not violence: first death is sickness d22 Robin, and 4 of the first 5 deaths are sickness (d22–d24 Robin, Patrick, Somchai, Aki). The rule's order names it attrition-after-thinning before reaching sickness-first; the next run's classification rule should say which opener it means to privilege. Cause mix: sickness 6, violent-contest 2, wounds 1, violent-monster 1, the-wild 3, thirst 1. Fights 42 (C1: 73).
- **53007 (55d) — sickness-first (observed).** First death sickness d21 Rafael; 7 of 14 deaths are sickness (d21, d27, d28, d32, d36, d47, d51), plus 2 wounds and 2 starvation at the end (Sanne, Gerald d51). No violent death until d39 (the wild). This one is NOT the bisect's C2 violent-thinning story at all — it is a sickness cascade from the start. Fights 54 (C1: 68).

## Observed contrast — what the survivors did differently (unjudged)

The contrast table shows a visible difference on the same fields, for whatever the next run judges:

- **The dead seeds lose the roster by d60; the survivors hold it.** Living at d60: dead 3/3/4; survivors 10/10/7/11/8. Deaths by d60: dead 9/9/10; survivors 5/6/5/1/4.
- **The dead seeds make zero wave-4 kills; every survivor makes at least one.** w4 kills: dead 0/0/0; survivors 1/4/1/2/2. Standing: dead 50/150/50; survivors 199–250. MaxWave: dead 3/4/3; survivors 4–5.
- **The dead seeds fight less — far less than their own C1 selves.** Fights: dead 34/42/54 vs C1 89/73/68 on the same seeds; survivors 95–273 (53002 fought 273 fights at P1 vs 53 at C1 and survived with 4 wave-4 kills). The XP half polarizes: survivors fight more, the dying fight less — fewer living hands, fewer fights.
- **Early death alone does not kill.** Survivors' first deaths fall at d10 (53008), d19 (53004), d23 (53001), d25 (53002) — as early as the dead seeds'. What differs is the loss RATE through d60, not the first death.
- **First divergence (C1 vs P1 daily living/standing):** dead seeds split early — d25 (53003), d19 (53005), d14 (53007). Survivors split d35/d25/d31/d27/d83. The streams part in weeks 2–4, the same window the bisect named for C2.

## Sense-test: one collapsed village, in plain words (53007 at P1)

Haven starts with twelve people. Rafael falls sick and dies on day 21 — the village digs its first grave, and the narration says so plainly: "everyone understands at once: this place can kill you. It just did." That same night raiders trample the garden. Se-ri dies of a wound on day 27, Diego of sickness the same day, Luz of sickness on day 28 — and Luz gets the full mourning beats: the village stops, somebody screams, somebody else starts digging; at the grave, Klaus, Riley and Stan speak for Luke. Then the raids come back: Ashford carries off ~1,136 kcal on day 27, Stonebridge ~1,168 kcal on day 30. Through all of it, the say-log is dominated by one man gathering deadfall — Klaus, stick after stick, "the pile grows (48 sticks now… 132 sticks now)", day after day, while the people around him sicken and die. The village narrates its deaths honestly and mourns them properly. What it does not do is stop: nobody's routine changes because people are dying of sickness. By day 51 Sanne and Gerald starve on the same day; the village is gone by day 55. The telling detail is not that the deaths are unvoiced — they are voiced, well — it is that the living keep doing the same chore while the roster collapses around them.

## Wall numbers (this run's corpora, doorwalk baseline leg)

- P1: national 0/8, table-sat 4/8, wins 0/8 (baseline leg never walks a door), wave-4 unlocks 6/8, wave-5 unlocks 1/8, median survival 150d.
- C1: national 0/8, table-sat 5/8, wins 0/8, wave-4 unlocks 7/8, wave-5 unlocks 4/8, median survival 150d.
- Telemetry deviation check: not run — DIAG probe, not a lever before/after; the endpoint reproductions are the validity check (see metric review).

## Metric review

- The GO bar's C1 leg was mis-scoped: it asserted a property ("no death before d28") that the healthy C1 corpus does not have, quoted from a bisect sentence about L0 with no C1 per-seed table behind it. The construction and instrument are verified by exact headline reproduction, so this is a bar error, not a base error — the prereg's own note ("if the reproduction bar fails, the construction/instrument is [wrong]") does not cover this case, and the failure is recorded here as the reason the diagnosis stays unjudged.
- The classification rule itself held: it classified all 3 early-death seeds with no unclassified call, and it surfaced the 53005 rule-order nuance (attrition-after-thinning fires before sickness-first even when the opener is a sickness cluster). The next run should pre-register which opener the rule privileges.
- No re-scoring happened: the verdict is NO-GO on the missed leg, even though every other conjunct of the GO bar holds. The observed classifications are carried as data, not asserted as the diagnosis.
- **Corrected bar proposed for the next run (new pre-registration, not a re-score of this one):** drop the first-death ≥ d28 leg entirely — early deaths are shared pre-divergence trajectory. Replace it with the exact-reproduction check that actually validated the instrument here: C1 median 150d + sits 5/8 + per-seed days/standing/w4 kills matching the bisect's C1 table. Do NOT substitute a living-at-d60 leg without checking it against the C1 corpus first: C1 53007 also thins to living 4 by d60 (8 dead), the same as P1 53007 — living-at-d60 does not separate healthy from dead cleanly either. The discriminating property is the village-death day and the late attrition cluster, not any early-death threshold.
- The unmapped causes ("combat" ×4, "a stranger" ×2 across P1) are listed, never silently bucketed; they touch no classification (none is a first death on a dead seed).

## Next blanks, in order

1. **Re-register + judge (DIAG, no new sweep needed):** the corpora exist in `/tmp/xphalf-p1/` and `/tmp/xphalf-c1/` and the analyzer is committed. A new prereg with the corrected C1 bar judges the observed classifications on the existing corpora — no re-run required unless /tmp is wiped.
2. **The retune-pathway probe** (bisect fix-shape sketch) is still owed and untouched by this arm: loadout census at C1 vs P2, then the fix variant. Do not bundle the XP-half question into it.
3. If the judged diagnosis confirms 53007-style sickness cascades as an XP-half pathway, that is a separate lever question (sickness pressure vs XP/synergy), not a fix to this arm.

## Convergence state

scale-onramp stays converging (NOT converged): the XP half's 3/8 early deaths are observed but unjudged, the retune fix is unbuilt, and the frozen band is still collapsed on current master. The doorwalk branch stays HELD.

**Merged locally, pending ship:** NOTHING merged — report ready-to-merge; the coordinator lands it. Branch `sim-xphalf-b` at the tooling commit + this evidence commit (see report).
