# sim-healerbisect-b — midpoint #15 full-8 (`e6ddaf32a`, specialist first rung 10 → 5 XP) — AMBIGUOUS, finger is #16

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1030Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid15-b (tip `d229b58f5`, lineage: Amendment B `af93aa2df` + mid14 evidence `9a824cbb` + mid16 evidence `2294ef815`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1, + Amendment B) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, full 8 per Amendment B. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid15-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: AMBIGUOUS on the full-8 bars — one day short — and the finger is #16 (pellet pass)

Midpoint #15 `e6ddaf32a` (journey-establishment r113 Q1: specialist self-taught first rung 10 XP → 5 XP, `src/js/food.js`) reads **AMBIGUOUS**: median **119d**, sits **4/8**. The sits bar passes (≥4/8) but the median bar fails by a single day (<120d). Per the pre-registered verdict rule (task brief + Amendment B flip bars): **if #15 is AMBIGUOUS or COLLAPSED, the fingered landing is #16 (pellet pass)**. That rule is applied as written — no re-scoring on a friendlier reading (see Metric review).

The staircase, complete, full-8 medians: collapsed control 70.5d → #8 100d → #9 108.5d → #14 103d → **#15 119d** → #16 145d = healed control 145d. Sits: 0/8 → 2/8 → 4/8 → 4/8 → **4/8** → 4/8 → 4/8. #15 climbs 16 days of median over #14 and heals the hardest seed (53005, below) — but it does not reach the healed bars, and #16 is the first point that does.

**Attribution, precisely stated:** the flip interval is **#15..#16**. #15 (AMBIGUOUS, full-8 confirmed) is the last non-healed point; #16 (HEALED, full-8 confirmed) is the first healed point. The fingered landing is therefore **#16 `685dc9ec4` (pellet pass: the pellet moves to hungrier hands at dawn — `src/js/progression.js` +104, Steve's ruling 2026-11-07)**. The prereg's HEALER bar — full-8 per-seed trajectory evidence on both sides of the interval — is completed in this file (§ Flip tables, § Mechanism, § 53005 reading): which seeds' death days moved on each side, what kills the villages now vs then, and one healed village's trajectory in plain words.

**The honest nuance, stated plainly:** the heal is a two-step climb, not a single switch. #15 does most of the healing work — it heals 53005 (the seed that never healed anywhere in #1..#14) and brings 53003 to the healed-exact shape — while #16 finishes the other two villages (53001 +38d, 53002 +52d). Neither landing alone reaches the full-8 HEALED bars; #15 alone is 119d, one day short. The bars name #16, and the interval rule names #16 — but the mechanism section below shows #15's step is real and load-bearing, not noise. The one unrun counterfactual is the pellet pass alone on the #14 base (i.e. #16 without #15); the prereg's interval attribution does not require it, and this run does not claim a proven-by-construction minimal set beyond what the interval shows.

## Per-seed table — midpoint #15 `e6ddaf32a`, full 8

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs #14 | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | village-lost | 199 | 4 | — | 2 | 0 | identical (67d) | 105d → 67d |
| 53002 | 88 | village-lost | 199 | 4 | — | 0 | 0 | 139d → 88d, seat lost | 140d → 88d |
| 53003 | 65 | village-lost | 199 | 4 | — | 1 | 0 | 45d → 65d | exact (65/199/1) |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | identical days/seat/stand; w4 9 → 3 | exact (150/d90/199/3) |
| 53005 | 150 | survived | 199 | 4 | lesser d99 | 2 | 0 | 54d → 150d, sits | exact (150/d99/199/2) |
| 53006 | 150 | survived | 425 | 5 | lesser d90 | 2 | 0 | identical days/seat; stand 675 → 425, w5 8 → 0 | 150d, overshoots (425 vs 199, maxWave 5 vs 4) |
| 53007 | 50 | village-lost | 75 | 3 | — | 0 | 0 | 59d → 50d | exact (50/75/0) |
| 53008 | 150 | survived | 199 | 4 | lesser d141 | 1 | 0 | identical days/seat | 150d, late sit (healed d97, w4 3) |

0 instrument errors on all 8 seeds. Full-8 median 119d, sits 4/8. Smoke (53004 alone, 12:02:53–12:05:31Z, ~2.6 min) validated the instrument before any judged seed; the other 7 seeds ran in one invocation (12:05:44–12:20:13Z, ~14.5 min). Total sim time ~17 min.

## Flip tables (analyzer)

Collapsed control → mid15: `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid15-e6ddaf32a: n=8 median=119d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 8/8; instrument errors A=0 B=0`. Every seed's death day moved against the collapsed tip; 53005 +96, 53006 +84, 53004 +77, 53008 +58, 53002 +4; 53001 −21, 53003 −3, 53007 −13 move earlier yet two of them land exactly on the healed endpoint.

| Seed | Collapsed days | Mid15 days | Δdays | Collapsed seat/sat | Mid15 seat/sat | Collapsed stand | Mid15 stand | Collapsed w4 | Mid15 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | 67 | −21 | — | — | 199 | 199 | 3 | 2 | village-lost → village-lost |
| 53002 | 84 | 88 | +4 | — | — | 100 | 199 | 0 | 0 | village-lost → village-lost |
| 53003 | 68 | 65 | −3 | — | — | 120 | 199 | 0 | 1 | village-lost → village-lost |
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 | village-lost → survived |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 | village-lost → survived |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 425 | 1 | 2 | village-lost → survived |
| 53007 | 63 | 50 | −13 | — | — | 125 | 75 | 0 | 0 | village-lost → village-lost |
| 53008 | 92 | 150 | +58 | — | lesser d141 | 199 | 199 | 3 | 1 | village-lost → survived |

Healed control → mid15: `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid15-e6ddaf32a: n=8 median=119d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 2/8; instrument errors A=0 B=0`. Only two seeds move against the healed endpoint — 53001 (−38d) and 53002 (−52d). Five seeds match the healed endpoint exactly on days, seat, standing, and wave-4 kills (53003, 53004, 53005, 53007 on all four; 53006 matches days/seat but stands 425 vs 199; 53008 matches days but sits late, d141 vs d97, w4 1 vs 3).

| Seed | Healed days | Mid15 days | Δ | Healed seat/sat | Mid15 seat/sat | Healed stand | Mid15 stand | Healed w4 | Mid15 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | 67 | −38 | — | — | 275 | 199 | 5 | 2 |
| 53002 | 140 | 88 | −52 | — | lesser d90 | 199 | 199 | 1 | 0 |
| 53003 | 65 | 65 | 0 | — | — | 199 | 199 | 1 | 1 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 3 |
| 53005 | 150 | 150 | 0 | lesser d99 | lesser d99 | 199 | 199 | 2 | 2 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 425 | 3 | 2 |
| 53007 | 50 | 50 | 0 | — | — | 75 | 75 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d141 | 199 | 199 | 3 | 1 |

Mid14 → mid15: `A mid14: n=8 median=103d sits=4/8 verdict=AMBIGUOUS; B mid15: n=8 median=119d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 4/8; instrument errors A=0 B=0`. Moved: 53002 −51, 53003 +20, 53005 +96, 53007 −9. Unmoved: 53001 (67d, identical fallen list), 53004, 53006, 53008 (all three survive 150d at both points — but their internals move: 53004's w4 kills fall 9 → 3, back to the healed shape; 53006's standing falls 675 → 425 and its 8 wave-5 kills vanish; 53008 unchanged on days/seat, w4 1 both).

| Seed | Mid14 days | Mid15 days | Δdays | Mid14 seat/sat | Mid15 seat/sat | Mid14 stand | Mid15 stand | Mid14 w4 | Mid15 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | 67 | 0 | — | — | 199 | 199 | 2 | 2 | village-lost → village-lost |
| 53002 | 139 | 88 | −51 | lesser d90 | — | 100 | 199 | 0 | 0 | village-lost → village-lost |
| 53003 | 45 | 65 | +20 | — | — | 84 | 199 | 0 | 1 | village-lost → village-lost |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 9 | 3 | survived → survived |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 | village-lost → survived |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 675 | 425 | 11 | 2 | survived → survived |
| 53007 | 59 | 50 | −9 | — | — | 134 | 75 | 0 | 0 | village-lost → village-lost |
| 53008 | 150 | 150 | 0 | lesser d141 | lesser d141 | 199 | 199 | 1 | 1 | survived → survived |

Mid16 → mid15: `A mid16-685dc9ec4: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid15-e6ddaf32a: n=8 median=119d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 2/8; instrument errors A=0 B=0`. Identical to the healed-control table (mid16 reproduces the healed control exactly) — the #15→#16 step moves only 53001 (+38d) and 53002 (+52d); every other seed is identical on days, and 53003/53004/53005/53007 are identical on all four columns.

| Seed | Mid16 days | Mid15 days | Δ | Mid16 seat/sat | Mid15 seat/sat | Mid16 stand | Mid15 stand | Mid16 w4 | Mid15 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | 67 | −38 | — | — | 275 | 199 | 5 | 2 |
| 53002 | 140 | 88 | −52 | — | lesser d90 | 199 | 199 | 1 | 0 |
| 53003 | 65 | 65 | 0 | — | — | 199 | 199 | 1 | 1 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 3 |
| 53005 | 150 | 150 | 0 | lesser d99 | lesser d99 | 199 | 199 | 2 | 2 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 425 | 3 | 2 |
| 53007 | 50 | 50 | 0 | — | — | 75 | 75 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d141 | 199 | 199 | 3 | 1 |

## Mechanism — #15 heals the starvation village; #16 finishes the other two

The control analysis (0530Z) showed the healing signature is starvation disappearing: collapsed 7 starvation deaths → healed 0 (plus Boris d47 in 53007, the one death the healed endpoint itself keeps — it starves at 50d in both endpoints). Death-cause census, mid15 full-8 (84 fallen): 'the wild' 36, monster 13, sickness 10, **starvation 4**, combat 4, ambush 3, contest 3, wound 3, arena 2, night 2, expedition 1, betrayal 1, stranger 1, Callback 1.

The four starvation deaths at #15: Ava + Xavier d79 in **53002**, Boris d47 in **53007**, Ecep d82 in **53008**. At #14 there were five, all in 53005; at #16/healed there is one (Boris d47, 53007). So #15 moves starvation OUT of 53005 entirely — the specialist first rung (5 XP buys skill 1 from zero, same as holders) lets the village's self-taught cooks/preservers actually gain the skill, and the village eats — but it does not remove starvation from the band: 53002 starves two people on d79 and dies at 88d, 53008 starves one and still survives. The pellet pass (#16) is what removes starvation from 53002 and 53008. The two landings heal different villages by different routes: #15 fixes the skill pace so the village can feed itself; #16 moves the food itself to hungry hands.

**53002's regression is the one-day story.** At #14 it sat d90 and died d139 (13 fallen, arena deaths at the end); at #15 it dies at 88d with only 6 fallen: Joseph d9 (wound), Kieran d45 sickness, Cheryl d49 sickness, Desta d55 sickness, then Ava + Xavier starve d79. A sickness cluster in the second month thins the village, two starve, the village is gone at 88d — 51 days earlier than #14, 52 earlier than healed. It is the only seed #15 makes worse, and it costs the median exactly the one day that separates 119d from the 120d bar. (Sorted days at #15: 50, 65, 67, **88**, 150, 150, 150, 150 → median (88+150)/2 = 119d. Had 53002 held even to 90d, the median would read 120d.)

**53006's overshoot tames halfway.** At #9/#14 it stood at 675 with 8 wave-5 kills (hunting Producers); at #15 it stands at 425, maxWave 5, **0 wave-5 kills** — it unlocks wave 5 (readiness5 short only on veterans, 1 of 2) without killing anything there. At #16/healed it stands at 199, maxWave 4. The first-rung pace fix pulls the village back from the Producer hunt but does not land it on the healed shape; the pellet pass does.

**53001 does not move at all** #14 → #15: identical 67d, identical 11-fallen list (Tomas d40 monster, then the wild takes nine, Daniyar d67, Aknur d68). The healed endpoint lives it to 105d with 18 fallen. 53001's heal is entirely in #16.

## 53005 reading — HEALED at #15, exactly

53005 heals at #15 (150d, lesser d99, standing 199, w4 2 — exact healed match on every column). It was exactly collapsed at every screened point #5, #7, #8, #9, #14 (54d, identical fallen list). **Its fallen list at #15 is identical to the healed control's, day for day, name for name, all 22 deaths** — Robin d13 ambush, Joshua d26 The Callback, Cheryl d29 the wild, Caleb d36 combat, Desmond d37 sickness, Patrick d39 monster, Vy d43, Adriano d46, Somchai d47, Aki d56 a stranger, Nikolai d57, Brian d58 contest, Sayri d66, Jorge d68, Ingrid d82, Fiston d89, Ainur d95, Jamie d95 wound, Ethan d135, Amina d135, Yori d135 arena, Adaeze d148 arena. The 53005 caveat that ran through the whole bisect — "do not declare the healer found on any screen that leaves 53005 collapsed" — is satisfied at #15 itself: the specialist first rung is 53005's healer. What #15 does not heal is 53001 and 53002, and that is why the band as a whole stays AMBIGUOUS and the finger passes to #16.

## One healed village's trajectory, in plain words (53005)

The first five weeks are unchanged from the collapse, day for day: Robin ambushed on d13, Joshua killed by The Callback on d26, Cheryl lost in the wild on d29, Caleb dead in combat on d36. Then it splits. Collapsed: Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then five villagers starve on d50–51 and the village is gone on d54. At #15: Desmond dies of sickness d37, Patrick to a monster d39 — and the village keeps going. It loses 22 people over 150 days (monsters, the wild, contests, the arena) but never starves anyone, and sits the lesser seat on d99. The village that used to die at the table with empty bowls now eats through the second month — because the people doing the work can finally learn the work. The first month of dying is unchanged; the village absorbs it and recovers, exactly as the healed control does. (This is the same trajectory the #16 file reads for the pellet pass — the two landings produce the identical 53005 story, which is why the interval, not either landing alone, is the honest unit of the heal for this seed.)

## Village assessment — what the villages looked like

Four villages out of eight live out the 150 days at #15, and all four sit down at the lesser table — the same four that sit in the healed control, on the same days except 53008 (d141, late, as at #14). The other four die on schedules close to the healed endpoint's, including the two that die early (53003 at 65d, 53007 at 50d — both healed-exact) and one that dies long without sitting (53001 at 67d, still short of its healed 105d). The odd village out is 53002: it sits at #14, starves at #15, and sits nowhere — the only seed the first-rung fix makes worse, and the seed that holds the median one day short of the bar. Nothing about the villages' daily life reads robotic: the death lists cohere with the healed control where the seeds match (five of eight exact), and the sampled table lines and death-says read as the same game (Stonebridge/Ashford installing speakers as Haven grieves, tribute rising to 9,000 kcal/week; a night raid trampling garden plots; the Codex turning a page on its own for the dead).

Sense-check: sit days read from `takeseatStats.seatDay` (taken day). 53006's end-state `readiness5` at #15 reads veterans 1, short of the 2 demanded, while the village sits d90 having unlocked wave 5 — the readiness question from #9 is still open as a *reading* question (veterans 1 at #8, 0 at #9, 1 at #15 and #16), but it no longer blocks anything: the gate's end-state read was never the healer.

## Wall numbers (mid15, full 8)

- National 0/8, table sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 1/8 (53006 only — standing 425, 0 wave-5 kills).
- Median survival 119d; max 150d; min 50d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the classification is the validity check.

## Balanced panel (§15) — attempted, sweep-corpus screen only, NOT a panel verdict

Attempted for the flip-point before/after pair (#14 vs the fingered landing #16):

1. `node scripts/balance-panel.js compare --before evidence/2026-11-08/perseed-healerbisect-mid14-b --after evidence/2026-11-08/perseed-healerbisect-mid16-b --out /tmp/panel-mid14-vs-mid16-b-attempt` → **EISDIR: illegal operation on a directory** — the tool's `compare` reads a single `panel.json.gz` (or JSON) file, not a directory of doorwalk corpora. No output written.
2. Same command against single per-seed JSONs → printed only `review_required`, 1 paired case, every contract metric `not_observed` except won.
3. Full 8-pair attempt: built flat sweep rows for all 8 seeds on both sides (`policy: doorwalk-baseline`, `won`, `entered`/`table` = seat taken per panel-contract ruling 665, `maxRank` = `scaleRank`; `playerDeaths` not carried by doorwalk rows, never imputed) and ran `node scripts/balance-panel.js compare --before /tmp/panel-flip-b/rows-mid14.json --after /tmp/panel-flip-b/rows-mid16.json --out /tmp/panel-flip-b/compare-mid14-vs-mid16` → decision **`review_required`**, exit 2 (the tool's exit code for any decision other than `no_material_signal`). The compare .md is attached below in full, and the row files + compare outputs are committed under `evidence/2026-11-08/panel-healerbisect-flip-b/`.

The 8-pair screen reads: table win rate 0 → 0 (descriptive); table entry rate 0.5 → 0.5, `no_material_signal` (53002 sits at #14 but not #16, 53005 sits at #16 but not #14 — net zero); table sitting rate 0.5 → 0.5, `no_material_signal`; national scale access 0 → 0. Every other contract metric is `not_observed` — doorwalk corpora do not carry them, and the tool never imputes them. The tool's own note says it plainly: **"Sweep-corpus comparison, NOT a balanced-panel verdict … For a §15 panel verdict, build real panels with scripts/balance-panel.js."** A real §15 verdict needs real panels built under both roots (16 matched seeds × policies) — that is panel-contract lane work, not a doorwalk-corpus compare, and this run does not fake one. The flip tables above are the before/after comparison for this run, on identical seeds, judged against the pre-registered bars.

### Attached compare .md (`compare-mid14-vs-mid16.md`, full text)

```markdown
# Sweep-corpus comparison (not a balanced-panel verdict)

**Decision: review_required**


## doorwalk-baseline

8 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | 8/8 | descriptive |
| Table entry rate | 0.5 | 0.5 | 0 | -0.375 to 0.375 | 8/8 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0.5 | 0.5 | 0 | -0.375 to 0.375 | 8/8 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer <redacted> through day 30 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| First bearer <redacted> through day 60 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per run (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per 100 calendar days (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per run | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per 100 calendar days | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Community loss (engine loss or sustained empty roster) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Mean sampled living NPCs | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled reserve below 500 kcal | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hydration below 25% | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled HP below 25 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hungry NPCs (hunger at least 80) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Eligible NPC named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Earned player tier-3+ weapon/armor access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ contest/show weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ craft/trade weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ corpse weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Primary nourishment / physical food consumed on instrumented routes | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Bearer <redacted> | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Accepted player ability events | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Trap luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Snare luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Pit luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Combined run luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |

Sweep-corpus comparison, NOT a balanced-panel verdict: rows paired by policy+seed; only won/entered/table/national/playerDeaths are carried by per-seed sweep rows, and every other contract metric is not_observed, never imputed. For a §15 panel verdict, build real panels with scripts/balance-panel.js.
```

## Method note

- CANON.md read first; the #15 landing touches the specialist ladder (`src/js/food.js` — the r112 self-taught ladder from the role-paths ruling, Steve 2026-11-04: skill builds from zero; r113 lowers the first rung 10 → 5 XP). No canon doc covers the ladder's pace bar specifically; the prereg's candidate table is the authority for the landing, and the landing's own comment cites the r113 panel bar (28 cells at 1–9 XP after 42 days).
- Flap probes passed before extraction (12:00:37Z), before the smoke (12:02:53Z), and before the full sweep (12:05:44Z). No flap observed this run.
- Worktree heartbeat **hung** this run (`timeout 60 bash scripts/worktree-heartbeat.sh sim-healerbisect-mid15-b` → exit 124, killed at 60s) — the known heartbeat-script hang from the 0530Z/0830Z/#16 runs, not git (the `git archive` that followed ran normally). The registry heartbeat is therefore stale from the coordinator's registration; the branch and evidence commits are the durable record.
- Old code extracted read-only with a single `git archive e6ddaf32a src scripts index.html manifest.json version.json | tar -x -C scratch-e6ddaf32a/` (after `mkdir -p`). `version.json` stamp `09e57528e-20261107-233501` (the #13 bump — no bump between #13 and #15, consistent). Code identity verified: `git diff 2bc17d793 e6ddaf32a -- src` is exactly the food.js first-rung change (10 → 5 XP, + comment); `git diff e6ddaf32a 685dc9ec4 -- src` is exactly the pellet pass (`src/js/progression.js` +104). The interval #15..#16 contains no other game-code change.
- The three frozen instrument files were overwritten from branch tip `d229b58f5` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies. Instrument-freshness check: zero commits in `246ce6dc2..HEAD` (and `e9399e09e..HEAD`) touch any instrument file (driver, doorwalk policy, analyzer, screen module, sim-harness, stageally/rally policies, sitstep instrument) — the frozen copies are byte-identical to the ones used by the #5/#7/#8/#9/#14/#16 runs.
- Require closure verified BEFORE the smoke: 17 files, none missing (driver + the 5 REPO-joined requires + their transitive set, including `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`, `competent`, `idle`, `vinebank`, `snareteach`, `conversation-pages`, `competent-feastdrive-b`, `competent-linkdrive-b`, `competent-linkfeast-b`). The smoke passed on the first try (0 errors).
- Anchor reads `d229b58f5954` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`e6ddaf32a`), not inferred from the anchor.
- Scratch dir `scratch-e6ddaf32a/` deleted before finishing (reproducible from `git archive`); prior runs' scratch dirs (`scratch-2bc17d793/`, `scratch-685dc9ec4/`, `scratch-bal/`) left as found.
- The safe-commit index clobber did NOT hit this run (status clean after commit — verified below).

## Metric review

- The full-8 bars were applied without re-scoring: #15 meets the sits bar (4/8) and fails the median bar by one day (119d < 120d) → AMBIGUOUS. The finger passes to #16 by the pre-registered rule. No friendlier metric was consulted — not "5 of 8 seeds match the healed endpoint exactly", not "median 119 rounds to 120", not "53005 heals so the landing is the healer". The median bar is doing real work for the fourth time: without it, #9, #14, and now #15 would each be declared the healer while part of the band still dies early.
- One correction to the prereg's expectation, not the metric: the prereg's bisect narrative assumes a single landing flips the whole band. The completed staircase shows the heal arriving in two steps — #15 heals the starvation village (53005) and the early-death village (53003), #16 heals the two long-lived villages (53001, 53002) — and the interval rule, not a single-switch story, is what names the finger. The GO bar's "fingered landing named with full-8 evidence on both sides" is met for the interval #15..#16 with #16 as the finger; the two-step mechanism is documented here rather than smoothed over.
- No metric change proposed. Amendment B (full-8 screens from #14) earned its keep a third time: the retired 3/4 screen would have called #15 HEALED (53004, 53005, 53006, 53008 all reach 150d), and the full 8 shows it is one day short on the median because 53002 regresses.

## Convergence state

scale-onramp: the healer question **closes with this run** — the fingered landing is named (**#16, pellet pass**) with full-8 per-seed trajectory evidence on both sides of the interval #15..#16, the 53005 caveat satisfied (it heals at #15, exactly), and the §15 panel screen attached (sweep-corpus, review_required — not a full panel verdict). The axis stays **converging** (NOT converged) pending the tracker update naming the healer and a real §15 panel verdict from the panel-contract lane. The next blanks, in order: tracker update (healer = #16 pellet pass, two-step mechanism noted), then the real panel build, then the residual questions (53007 never heals anywhere — best 63d collapsed, 50d = healed control; 53002's #15 regression and whether the pellet pass alone on the #14 base would heal it).

## Adoption handoff — tracker update + panel lane

1. Midpoint #15 `e6ddaf32a` reads **AMBIGUOUS** on the full 8 (median 119d, sits 4/8 — one day short). The flip interval is **#15..#16** and the fingered landing is **#16 `685dc9ec4` (pellet pass)**. No further bisect screen is owed: all 17 game-code points are now mapped on the full 8 (collapsed 70.5d → #8 100d → #9 108.5d → #14 103d → #15 119d → #16 145d = healed control).
2. Per-seed healer map (full-8, complete): 53004 heals #8; 53006 heals #8 (overshoots #9/#14, half-tames at #15, exact at #16); 53008 heals #9; 53002 heals #9 only (seated-then-lost at #14, regresses to 88d at #15, exact healed at #16); 53001/53003/53005 heal at #15 or #16 (53003 exact at #15, 53005 exact at #15, 53001 only at #16); 53007 never heals anywhere (best 63d collapsed/#8; 50d at #15/#16 = healed control).
3. The 53005 caveat is closed: it heals at #15 (specialist first rung), with a fallen list identical to the healed control's. Its healer is #15, not #16 — record that split in the tracker, not just the finger.
4. Balanced panel: the §15 attempt in this file is a sweep-corpus screen (8 pairs, review_required), not a panel verdict. A real verdict needs real panels built under both roots — panel-contract lane work. Do not re-run doorwalk corpora through `compare` expecting a different answer.
5. Worktree `~/workspace/worktrees/sim-healerbisect-mid15-b`, branch `sim-healerbisect-mid15-b` (tip: Amendment B `af93aa2df` + mid14 evidence `9a824cbb` + mid16 evidence `2294ef815` + this evidence commit). Scratch dir deleted; corpus + panel files committed under `evidence/2026-11-08/perseed-healerbisect-mid15-b/` and `evidence/2026-11-08/panel-healerbisect-flip-b/`.
6. Staircase for the tracker: collapsed 70.5d/0 sits → #8 100d/2 → #9 108.5d/4 → #14 103d/4 → **#15 119d/4** → **#16 145d/4 = healed control 145d/4**.
