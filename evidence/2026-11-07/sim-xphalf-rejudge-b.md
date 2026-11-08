# sim-xphalf-rejudge-b — XP-half early deaths, re-judged under the corrected C1 bar (DIAG)

**Arm:** sim-xphalf-rejudge-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0245Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3), bisect follow-up · **Findings:** #1901 · **Branch:** sim-xphalfrej-b · **Prereg:** `evidence/2026-11-07/sim-xphalf-rejudge-b-prereg.md` (committed before any judged gate run) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, no new seeds. **Corpora committed here:** `evidence/2026-11-07/xphalf-c1/` and `evidence/2026-11-07/xphalf-p1/` (per-seed JSONs + CONSTRUCTION.txt, byte-identical to the /tmp originals — sha256-verified). Proof: `scripts/test-xphalf-rejudge-20261107.js` **104/104 green** on the committed corpora; `scripts/test-xphalf-20261107.js` **31/31 green** (re-run); analyzer re-run on the committed corpora is **byte-identical** to the 0214Z output.

## Verdict: GO — corrected bar met exactly on all 8 seeds, both arms

The C1 corpus reproduces the bisect's C1 table **exactly on all 8 seeds** — days, seat/sat, standing, and wave-4 kills, plus median 150d and sits 5/8. The P1 corpus reproduces exactly (three early-death days 45/62/55, median 150d, sits 4/8). Zero instrument errors in all 16 files; anchors verified (C1 `16369893cd64`, P1 `50881fbf2f64`). The first-death leg is gone and stays gone: the gate asserts the #1901 fact instead — C1 first deaths before d28 on exactly 53001/53004/53005/53007/53008 (d22/d19/d18/d13/d10), three shared with P1 on the same seed, day, and person (53001 d22 Sanjay, 53004 d19 Fritz, 53008 d10 Dieter).

**The 0214Z stop lifts.** The diagnosis that sim-xphalf-b could only report as observed now stands as judged: the mechanism classifications are the analyzer's output under the 0214Z pre-registered rule, re-verified verbatim on the committed corpora — **not re-scored, not re-ordered** (per the prereg's binding stop rule: judge only the corrected bar; classifications observed-only).

## The judged diagnosis — what kills the three P1 early-death seeds

- **53003 (45d) — attrition-after-thinning.** First deaths violent (contest d25 Mateo, monster d28 Sergio, monster d32 Maeve), then a late attrition cluster sets the death day: sickness d37 Raquel, wounds d39 Pavel, sickness d39 Cheyenne, starvation d44 David, thirst d44 Jorge, sickness d45 Victor — 5 starvation/thirst/sickness deaths in the final 15 days. Near-miss on the strict violent-thinning rule: the first 3 deaths ARE all violent and the first death IS before d28, but living at d30 is 10, not < 8 — it fails only the living leg. Cause mix: violent-contest 1, violent-monster 2, sickness 3, wounds 1, starvation 1, thirst 1. Fights 34 (C1: 89).
- **53005 (62d) — attrition-after-thinning.** The rule fires on early violent deaths (contest d23 Vy, monster d30 Nikolai) + 3 late attrition deaths (sickness d53 Ella, thirst d56 Ivy, sickness d58 Grace). BUT the opener is a sickness cluster, not violence: first death is sickness d22 Robin, and 4 of the first 5 deaths are sickness (d22–d24 Robin, Patrick, Somchai, Aki). The rule's order names it attrition-after-thinning before reaching sickness-first — **the rule-order nuance is carried, not re-judged**: a future prereg should say which opener the rule privileges. Cause mix: sickness 6, violent-contest 2, wounds 1, violent-monster 1, the-wild 3, thirst 1. Fights 42 (C1: 73).
- **53007 (55d) — sickness-first.** First death sickness d21 Rafael; 7 of 14 deaths are sickness (d21, d27, d28, d32, d36, d47, d51), plus 2 wounds and 2 starvation at the end (Sanne, Gerald d51). No violent death until d39 (the wild). This one is NOT the bisect's C2 violent-thinning story at all — it is a sickness cascade from the start. Fights 54 (C1: 68).

**The three deaths are not one mechanism.** Two are attrition-after-thinning (a violent opener thins the roster, then hunger/thirst/sickness finishes the village); one is a sickness cascade with no violent opener at all. The XP half's early deaths do not reproduce the bisect's C2 violent-thinning story cleanly — 53007 contradicts it outright.

## Reproduction tables (committed corpora)

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

### C1 (healthy contrast) — corrected bar MET exactly

| Seed | Days | End | Seat/sat | Stand | MaxW | w4 | 1st death (fallen day) | Dead≤d30 | Dead≤d60 | Living d30/d60 |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | — | 175 | 4 | 0 | d22 | 1 | 6 | 11/7 |
| 53002 | 79 | village-lost | — | 125 | 4 | 0 | d37 | 0 | 5 | 12/10 |
| 53003 | 150 | survived | lesser d90 | 344 | 5 | 3 | d28 | 1 | 5 | 11/10 |
| 53004 | 150 | survived | lesser d94 | 260 | 5 | 2 | d19 | 1 | 5 | 11/7 |
| 53005 | 97 | village-lost | lesser d90 | 230 | 5 | 3 | d18 | 2 | 5 | 10/8 |
| 53006 | 150 | survived | lesser d90 | 849 | 5 | 8 | d30 | 0 | 5 | 12/10 |
| 53007 | 86 | village-lost | — | 99 | 3 | 0 | d13 | 2 | 8 | 10/4 |
| 53008 | 150 | survived | lesser d90 | 199 | 4 | 0 | d10 | 3 | 4 | 9/8 |

Median 150d, sits 5/8. Every cell matches the bisect's C1 table. The 53006 sat-day wobble is resolved: the bisect's C1 table says lesser d90, and the corpus says d90 — the "d93" in the xphalf-b prereg was L0's sat day, mis-quoted as C1's. (First-death days here are fallen-entry days; the daily-living row lags by a day when a death is recorded late in the day — e.g. C1 53001 Sanjay dies d22, the living row drops on d23. The gate measures first deaths by fallen-entry day; the analyzer tables above use the living row, as the 0214Z run did.)

## Contrast — what the survivors did differently

- **The dead seeds lose the roster by d60; the survivors hold it.** Living at d60: dead 3/3/4; survivors 10/10/7/11/8. Deaths by d60: dead 9/9/10; survivors 5/6/5/1/4.
- **The dead seeds make zero wave-4 kills; every survivor makes at least one.** w4 kills: dead 0/0/0; survivors 1/4/1/2/2. Standing: dead 50/150/50; survivors 199–250. MaxWave: dead 3/4/3; survivors 4–5.
- **The dead seeds fight less — far less than their own C1 selves.** Fights: dead 34/42/54 vs C1 89/73/68 on the same seeds; survivors 95–273 (53002 fought 273 fights at P1 vs 53 at C1 and survived with 4 wave-4 kills). The XP half polarizes: survivors fight more, the dying fight less — fewer living hands, fewer fights.
- **Early death alone does not kill.** Survivors' first deaths fall at d10 (53008), d19 (53004), d23 (53001), d25 (53002) — as early as the dead seeds'. What differs is the loss RATE through d60, not the first death.
- **First divergence (C1 vs P1 daily living/standing):** dead seeds split early — d25 (53003), d19 (53005), d14 (53007). Survivors split d35/d25/d31/d27/d83. The streams part in weeks 2–4, the same window the bisect named for C2.
- **C1 53007 is the control that sharpens the point:** it carries the same sickness pressure (Se-ri d13 sickness, then a long sickness tail) and also thins to living 4 by d60 — yet it lives to 86d. Its deaths are spread across 74 days; P1 53007's fourteen deaths compress into 34. The discriminator is compression + the late cluster, not the presence of sickness or an early death.

## Sense-test: one collapsed village, in plain words (53007 at P1, re-read from the committed corpus)

Haven starts with twelve people. Rafael falls sick and dies on day 21 — the village digs its first grave, and the narration says so plainly: "everyone understands at once: this place can kill you. It just did." That same night raiders trample the garden. Se-ri dies of a wound on day 27, Diego of sickness the same day, Luz of sickness on day 28 — and Luz gets the full mourning beats: the village stops, somebody screams, somebody else starts digging; at the grave, Klaus, Riley and Stan speak for Luke. Then the raids come back: Ashford carries off ~1,136 kcal on day 27, Stonebridge ~1,168 kcal on day 30. Through all of it, the say-log is dominated by one man gathering deadfall — Klaus, stick after stick, "the pile grows (48 sticks now… 132 sticks now)", day after day, while the people around him sicken and die — and then Klaus himself dies in the wild on day 50, still gathering. The village narrates its deaths honestly and mourns them properly. What it does not do is stop: nobody's routine changes because people are dying of sickness. By day 51 Sanne and Gerald starve on the same day; the village is gone by day 55. The telling detail is not that the deaths are unvoiced — they are voiced, well — it is that the living keep doing the same chore while the roster collapses around them. (Verified against the committed corpus file; matches the 0214Z read, with the added detail that Klaus dies too.)

## Wall numbers (this run's corpora, doorwalk baseline leg)

- P1: national 0/8, table-sat 4/8, wins 0/8 (baseline leg never walks a door), wave-4 unlocks 6/8, wave-5 unlocks 1/8, median survival 150d.
- C1: national 0/8, table-sat 5/8, wins 0/8, wave-4 unlocks 7/8, wave-5 unlocks 4/8, median survival 150d.
- Telemetry deviation check: not run — DIAG re-judgment of a frozen replay, not a lever before/after; the endpoint reproductions are the validity check (same justification as the bisect and sim-xphalf-b).
- Balanced panel: not run — `scripts/balance-panel.js` takes panel-contract inputs (`compare --before <panel.json.gz> --after <panel.json.gz>`), not doorwalk recorder JSONs; it refuses this input by design. Recorded, not forced (as prior runs did).

## Metric review

- The corrected bar held exactly: every C1 headline cell matches the bisect table, every P1 headline cell matches the 0214Z bar, 0 instrument errors, anchors verified. No re-scoring happened — the verdict is GO on the bar as pre-registered, and the classifications are the analyzer's pre-registered-rule output, re-verified verbatim, not re-scored.
- The gate itself caught one instrument bug before judging: my first #1901 assertions measured first-death days off the daily-living row, which lags the fallen-entry death day by a day on 3/5 seeds (d23 vs d22, d19 vs d18, d14 vs d13). The gate failed 3 checks, the measure was corrected to fallen-entry days, and the re-run went 104/104 green. The #1901 set (which seeds have an early first death) was never in doubt — only the day measure. The evidence tables still use the living-row days, as the 0214Z run did; the two measures are now documented side by side above.
- The 53005 rule-order nuance (sickness-cluster opener classified as attrition-after-thinning because the attrition rule fires first) is still unresolved by design — this run's stop rule forbade re-judging it. A future prereg that re-registers the classification rule should say which opener it privileges; until then the 53005 label stands as the pre-registered rule's output.
- The unmapped causes ("combat" ×4, "a stranger" ×2 across P1) are listed, never silently bucketed; they touch no classification (none is a first death on a dead seed).
- The 0214Z caveat is closed: the corpora no longer live only in /tmp — the judged per-seed files are committed under `evidence/2026-11-07/xphalf-c1/` and `xphalf-p1/`, sha256-identical to the /tmp originals, and every proof in this file was re-run against the committed copies.

## Next blanks, in order

1. **The retune-pathway probe** (bisect fix-shape sketch) is still owed and untouched by this arm: loadout census at C1 vs P2, then the fix variant. The XP-half question is now judged — do not bundle it into the retune probe.
2. **Sickness pressure vs XP/synergy** is the separate lever question the judged diagnosis points at: 53007's sickness cascade is an XP-half pathway, and the C1 53007 control shows the same pressure survivable when deaths don't compress. A future arm should ask whether sickness pressure (or the village's non-response to it — nobody's routine changes while people sicken) is the lever, with its own prereg.
3. **Classification rule-order:** a future prereg should pre-register which opener the mechanism rule privileges (violent-thinning vs sickness-first when a seed opens with sickness and ends in attrition), so 53005-style seeds classify without a footnote.
4. The frozen band stays collapsed on current master — the doorwalk branch stays HELD, and no confirm should lean on band 53001–53008 until a fix lands.

## Convergence state

scale-onramp stays converging (NOT converged): the XP half's 3/8 early deaths are now JUDGED (2× attrition-after-thinning, 1× sickness-first — not the bisect's violent-thinning story), the retune fix is unbuilt, and the frozen band is still collapsed on current master. The doorwalk branch stays HELD.

**Merged locally, pending ship:** NOTHING merged — report ready-to-merge; the coordinator lands it. Branch `sim-xphalfrej-b` (see report).
